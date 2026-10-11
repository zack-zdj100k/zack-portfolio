"""Turn a 360° head-rotation video into hero option B frames.

    python3 -I scripts/build-hero-turntable.py <video.mp4> <isnet-general-use.onnx> [frames=60]

Needs ffmpeg on PATH and Python packages numpy, pillow, onnxruntime. The background model is
ISNet (the same one rembg calls "isnet-general-use"):
https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-general-use.onnx

For each of N evenly spaced frames across the full turn it:
  1. cuts the subject out of the background (hair-aware matte),
  2. fades the neck out before the shirt, like the cut of the artwork,
  3. softens the left/right edges where the head touches the video frame,
  4. crops to the head and writes public/hero/turn/NNN.webp (+ manifest.json "turn" entry).
"""

import json
import os
import subprocess
import sys
import tempfile

import numpy as np
import onnxruntime as ort
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "hero", "turn")

# Crop and fades, as fractions of the source frame (tuned on a 720×1280 portrait video).
CROP_BOTTOM = 0.93  # keep the top 93% (head and neck)
NECK_FADE = (0.80, 0.92)  # alpha fades to 0 between these heights (below the jaw)
SIDE_FADE = 0.09  # the video crops the hair at the frame sides; fade it out instead of a hard cut
OUT_WIDTH = 560


def matte(session, img):
    x = np.asarray(img.resize((1024, 1024), Image.LANCZOS)).astype(np.float32) / 255.0 - 0.5
    out = session.run(None, {session.get_inputs()[0].name: x.transpose(2, 0, 1)[None]})[0][0, 0]
    out = (out - out.min()) / max(out.max() - out.min(), 1e-6)
    return Image.fromarray((out * 255).astype(np.uint8), "L").resize(img.size, Image.LANCZOS)


def main(video, model, count=60):
    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        if f.endswith(".webp"):
            os.remove(os.path.join(OUT, f))
    session = ort.InferenceSession(model, providers=["CPUExecutionProvider"])
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, os.path.join(tmp, "f_%04d.png")], check=True)
        frames = sorted(os.listdir(tmp))
        # One full turn: drop the last frame if it repeats the first.
        picks = [frames[round(i * len(frames) / count)] for i in range(count)]
        names = []
        size = None
        for i, name in enumerate(picks):
            img = Image.open(os.path.join(tmp, name)).convert("RGB")
            w, h = img.size
            alpha = np.asarray(matte(session, img)).astype(np.float32) / 255.0
            ys = np.arange(h)[:, None] / h
            xs = np.arange(w)[None, :] / w
            neck = np.clip((NECK_FADE[1] - ys) / (NECK_FADE[1] - NECK_FADE[0]), 0, 1)
            side = np.clip(np.minimum(xs, 1 - xs) / SIDE_FADE, 0, 1)
            side = side * side * (3 - 2 * side)  # smoothstep, so the fade has no visible start line
            alpha = alpha * neck * side
            rgba = np.dstack([np.asarray(img), (alpha * 255).astype(np.uint8)])
            out = Image.fromarray(rgba, "RGBA").crop((0, 0, w, round(h * CROP_BOTTOM)))
            out = out.resize((OUT_WIDTH, round(out.height * OUT_WIDTH / out.width)), Image.LANCZOS)
            size = out.size
            fname = f"{i:03d}.webp"
            out.save(os.path.join(OUT, fname), "WEBP", quality=80, alpha_quality=85, method=6)
            names.append(fname)
            print(f"{i + 1}/{count}", end="\r", flush=True)

    manifest_path = os.path.join(ROOT, "public", "hero", "manifest.json")
    manifest = json.load(open(manifest_path))
    manifest["turn"] = {"frames": names, "width": size[0], "height": size[1], "startFrame": 0}
    json.dump(manifest, open(manifest_path, "w"), indent=2)
    total = sum(os.path.getsize(os.path.join(OUT, n)) for n in names)
    print(f"\nwrote {len(names)} frames, {size[0]}x{size[1]}, {total / 1024 / 1024:.2f} MB total")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 60)
