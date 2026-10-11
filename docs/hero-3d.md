# Hero 3D: options A, B and C

The home hero shows the owner's 3D portrait artwork in front of a giant "ZACK" wordmark. As the
visitor scrolls, the stage stays pinned while the head turns, the letters spread apart and the
words "Websites. Apps. Desktop software." appear beside it. All three options are built and ship
with the site; the active one is chosen in **Admin → Hero 3D**. Any of them can be previewed
without saving: `/en?hero=depth`, `/en?hero=sequence`, `/en?hero=model`.

| | A. Depth effect | B. 360° turn (default) | C. 3D model |
| --- | --- | --- | --- |
| Source | `public/hero/face-1280.webp` + `depth.png` | `public/hero/turn/000..059.webp`, from the owner's 360° video | `public/hero/model.glb` |
| Renderer | `src/components/hero/DepthHead.tsx` (three.js shader) | `SequenceHead.tsx` (canvas 2D) | `ModelHead.tsx` (three.js + GLTFLoader) |
| Turn range | about 25° | full 360°, one turn over the pinned scroll | full 360° |
| Download | ~260 KB + three.js | ~3.1 MB of frames, loaded progressively | ~2.7 MB + three.js |
| Look | Sharpest: it is the original artwork | The owner's own video, background removed | Softer face (AI reconstruction) |

**Default:** B, built from the owner's 360° head video (2026-10-10). A was the default before; the
owner found its scroll effect too small. C was tried and rejected (the AI face is not faithful
enough). Both stay available in the admin.

**C at rest:** the sharp artwork holds the stage until the visitor scrolls; during the first ~5%
of the scroll it cross-fades into the model. The model then turns in two acts: while the three
words appear (first 60% of the scroll) the face turns slowly from the artwork's 3/4 pose through
the front to the other side; in the last 40% it makes one full spin and ends on the face.

**Always:** the static artwork is server-rendered first (fast first paint, and it's what search
engines and screen readers get). The chosen renderer loads after the page is interactive, draws its
first frame, then cross-fades over the still image. Visitors who prefer reduced motion, or whose
browser can't run WebGL, keep the still image and no scroll pinning. The renderers pause when the
hero is off screen. Mouse tilt is enabled only for real mouse pointers.

Fallbacks: if C is chosen but no model is uploaded, B is shown; if B has fewer than 2 frames, A is
shown.

## A. How the depth effect works

`scripts/build-hero-assets.py` crops the transparent cutout and builds a grayscale depth map
(white = nearer) from the silhouette (a rounded dome) plus soft bumps placed on the face, nose,
brow, lips and chin of this particular artwork, with the ear and neck pushed back. The shader
displaces a 256×256 plane by that depth, derives normals from it for a soft key light and a
pale-blue rim light, and the scroll position turns the head from -6° to +24° (yaw) and tilts the
chin down.

**Replacing the artwork:** upload a new transparent PNG/WebP in Admin → Hero 3D. The depth map is
tied to the face position in the image, so regenerate it too:
1. Put the new cutout at `assets/source/hero-face-3d-cutout.webp`.
2. Adjust the face/nose coordinates in `build_depth()` (they are pixel positions on the source).
3. `npm run hero:assets`, then upload `public/hero/depth.png` in the admin (or redeploy).

## B. 360° turn from a video

`scripts/build-hero-turntable.py` turns `assets/source/hero-head-360.mp4` (the owner's 720×1280
video of his head making one full turn) into 60 frames:
1. picks 60 evenly spaced video frames (6° apart),
2. removes the background with ISNet (the `isnet-general-use` model rembg uses, run directly
   through onnxruntime),
3. fades the neck out before the shirt, like the cut of the artwork,
4. fades the left and right edges, because the video crops the hair at the frame sides,
5. writes 560×926 WebP frames to `public/hero/turn/` and the `turn` entry of `manifest.json`.

```bash
python3 -I scripts/build-hero-turntable.py assets/source/hero-head-360.mp4 isnet-general-use.onnx 60
```

It needs ffmpeg plus numpy, pillow and onnxruntime (the model file is linked in the script header).
It takes about 2.5 minutes on a laptop CPU. The file names stay the same, so on a running dev
server delete `.next/dev/cache/images` afterwards, or the first frame is served from the old cache.

**Playback:** the first frame is the static image, so the swap to the canvas is invisible. Frames
load coarse to fine (every 8th, then every 4th...), so scrubbing works before all 60 have arrived.
Scroll maps linearly from frame 0 to frame 59, and neighbouring frames are cross-faded so the turn
is continuous rather than stepped. The stage is portrait-shaped for these frames. The pin is 190dvh
on phones and 230dvh from `md` up, so the full turn takes about one screen of scrolling on a phone.

**New video:** film or generate the same kind of clip (one full turn, head centred, plain
background, at least 720 px wide), run the script, then reload the seed rows or upload the 60
frames in Admin → Hero 3D → B (select them all at once; file-name order is the rotation order).

## C. 3D model

`public/hero/model.glb` was generated from the cutout with **TRELLIS** (Microsoft's image-to-3D
model, via the public Hugging Face Space `trellis-community/TRELLIS`, owner-approved) and cleaned
with `scripts/clean-glb-texture.py`, which:
- removes 13 small floating mesh fragments (keeps pieces over 2% of the triangles),
- removes isolated pure-red specks the generator baked into the hair texture.

The unedited output is kept at `assets/source/hero-head-trellis.glb`.

**Making a better model:** use any image-to-3D tool (TRELLIS, Hunyuan3D, Tripo, Meshy, Rodin)
with the cutout, ideally with the turnaround views as extra inputs. Export GLB, aim for under 6 MB
(about 50k triangles, one 1024–2048 px texture), then:

```bash
python3 -I scripts/clean-glb-texture.py raw.glb cleaned.glb
```

and upload `cleaned.glb` in Admin → Hero 3D → C. `ModelHead` centres and scales any model
automatically.
