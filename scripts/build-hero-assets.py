"""Build the hero artwork assets from the owner's source images.

Run: python3 -I scripts/build-hero-assets.py   (needs Pillow, numpy, scipy)

Inputs (assets/source/):
  hero-face-3d-cutout.webp           1290x1219 RGBA cutout   -> option A texture + static fallback

Outputs (public/hero/):
  face-1280.webp, face-640.webp      cutout, resized
  depth.png                          hand-tuned depth map for option A (white = closer)
  manifest.json                      artwork size (read by the page and the seed script)

Option B frames come from a 360° video: see scripts/build-hero-turntable.py.

The depth map is not a scan. It is built from the cutout's silhouette (a rounded dome) plus
soft bumps placed on the face, cheek and nose of this specific artwork. It holds up for
roughly +/-25 degrees of rotation, which is what option A uses.
"""

import json
import os
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "source")
OUT = os.path.join(ROOT, "public", "hero")


def gauss(shape, cx, cy, sx, sy):
    h, w = shape
    y, x = np.mgrid[0:h, 0:w]
    return np.exp(-(((x - cx) ** 2) / (2 * sx**2) + ((y - cy) ** 2) / (2 * sy**2)))


def build_cutout():
    im = Image.open(os.path.join(SRC, "hero-face-3d-cutout.webp")).convert("RGBA")
    # Trim to the visible pixels plus a margin, so the texture has no wasted transparent border.
    alpha = np.asarray(im)[:, :, 3]
    ys, xs = np.nonzero(alpha > 8)
    pad = 24
    box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + pad, im.width), min(ys.max() + pad, im.height))
    im = im.crop(box)
    for size in (1280, 640):
        scale = size / max(im.size)
        out = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS) if scale < 1 else im
        out.save(os.path.join(OUT, f"face-{size}.webp"), "WEBP", quality=88, method=6)
    return im, box


def build_depth(im, box):
    a = np.asarray(im).astype(np.float32)[:, :, 3] / 255.0
    mask = a > 0.5
    h, w = mask.shape
    # Coordinates below were picked on the original 1290x1219 image, shifted by the crop box.
    ox, oy = box[0], box[1]

    def g(cx, cy, sx, sy):
        return gauss((h, w), cx - ox, cy - oy, sx, sy)

    dist = ndimage.distance_transform_edt(mask)
    dome = np.sqrt(dist / dist.max())  # rounded edge falloff

    face = g(700, 640, 260, 300)  # the face plane sits in front of the skull
    nose = g(770, 640, 55, 70)  # nose tip
    nose_bridge = g(745, 560, 40, 80)
    brow = g(720, 470, 220, 60) * 0.35
    lips = g(700, 760, 90, 45) * 0.45
    chin = g(680, 900, 120, 70) * 0.5
    cheek_l = g(560, 700, 90, 90) * 0.35
    ear_l = g(330, 590, 70, 110)  # left ear sits behind the face
    neck = np.clip((np.arange(h)[:, None] + oy - 930) / 220.0, 0, 1)  # neck recedes under the jaw

    depth = 0.58 * dome + 0.30 * face + 0.12 * nose + 0.05 * nose_bridge + brow * 0.1 + lips * 0.1 + chin * 0.15
    depth += cheek_l * 0.08 - ear_l * 0.12 - neck * 0.25
    depth = np.where(mask, depth, 0)
    depth = ndimage.gaussian_filter(depth, 9)
    depth = depth - depth[mask].min()
    depth = np.clip(depth / depth[mask].max(), 0, 1)
    depth = np.where(mask, depth, 0)

    img = Image.fromarray((depth * 255).astype(np.uint8), "L")
    scale = 512 / max(img.size)
    img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    img = img.filter(ImageFilter.GaussianBlur(1.2))
    img.save(os.path.join(OUT, "depth.png"), optimize=True)


def main():
    os.makedirs(OUT, exist_ok=True)
    im, box = build_cutout()
    build_depth(im, box)
    path = os.path.join(OUT, "manifest.json")
    manifest = json.load(open(path)) if os.path.exists(path) else {}
    manifest["face"] = {"width": im.width, "height": im.height}
    with open(path, "w") as f:
        json.dump(manifest, f, indent=2)
    print("hero assets written to", OUT)


if __name__ == "__main__":
    sys.exit(main())
