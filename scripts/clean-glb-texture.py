"""Clean up an AI-generated GLB: drop small floating mesh fragments and remove isolated
saturated-red specks from the base-colour texture.

Run: python3 -I scripts/clean-glb-texture.py in.glb out.glb   (needs Pillow, numpy, scipy)

Image-to-3D models (e.g. TRELLIS) sometimes bake small pure-red dots into dark hair. Skin and lips
are never that saturated with so little green, so they are left alone.
"""

import io
import json
import struct
import sys

import numpy as np
from PIL import Image
from scipy import ndimage
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components


def read_glb(path):
    d = open(path, "rb").read()
    json_len = struct.unpack("<I", d[12:16])[0]
    gltf = json.loads(d[20 : 20 + json_len])
    bin_len = struct.unpack("<I", d[20 + json_len : 24 + json_len])[0]
    binary = d[28 + json_len : 28 + json_len + bin_len]
    return gltf, binary


def write_glb(path, gltf, views):
    # Re-pack every bufferView back to back (4-byte aligned) into one binary chunk.
    blob = b""
    for i, data in enumerate(views):
        blob += b"\0" * ((4 - len(blob) % 4) % 4)
        gltf["bufferViews"][i]["byteOffset"] = len(blob)
        gltf["bufferViews"][i]["byteLength"] = len(data)
        blob += data
    blob += b"\0" * ((4 - len(blob) % 4) % 4)
    gltf["buffers"][0]["byteLength"] = len(blob)
    js = json.dumps(gltf, separators=(",", ":")).encode()
    js += b" " * ((4 - len(js) % 4) % 4)
    total = 12 + 8 + len(js) + 8 + len(blob)
    with open(path, "wb") as f:
        f.write(struct.pack("<4sII", b"glTF", 2, total))
        f.write(struct.pack("<I4s", len(js), b"JSON") + js)
        f.write(struct.pack("<I4s", len(blob), b"BIN\0") + blob)


def clean(img):
    a = np.asarray(img.convert("RGB")).astype(np.int32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    red = (r > 100) & (g < 75) & (b < 75) & (r > 2.2 * g) & (r > 2.2 * b)
    # Only tiny isolated specks: lips and ears are large red areas and must stay.
    labels, n = ndimage.label(red)
    sizes = ndimage.sum(red, labels, range(1, n + 1))
    small = np.isin(labels, np.nonzero(sizes <= 40)[0] + 1)
    mask = ndimage.binary_dilation(small, iterations=1)
    # Fill each masked pixel with the nearest unmasked pixel.
    _, (iy, ix) = ndimage.distance_transform_edt(mask, return_indices=True)
    filled = a[iy, ix]
    print(f"cleaned {int(small.sum())} speck pixels in {int((sizes <= 40).sum())} specks")
    return Image.fromarray(filled.astype(np.uint8), "RGB")


def drop_floaters(gltf, views, keep_ratio=0.02):
    """Removes triangles in connected pieces smaller than keep_ratio of the mesh."""
    for mesh in gltf["meshes"]:
        for prim in mesh["primitives"]:
            ia = gltf["accessors"][prim["indices"]]
            pa = gltf["accessors"][prim["attributes"]["POSITION"]]
            if ia["componentType"] != 5125:
                continue  # only uint32 indices are handled
            idx = np.frombuffer(views[ia["bufferView"]], dtype="<u4", count=ia["count"], offset=ia.get("byteOffset", 0)).reshape(-1, 3)
            pos = np.frombuffer(views[pa["bufferView"]], dtype="<f4", count=pa["count"] * 3, offset=pa.get("byteOffset", 0)).reshape(-1, 3)
            # Weld vertices that share a position (UV seams split them) before measuring connectivity.
            _, weld = np.unique(np.round(pos, 5), axis=0, return_inverse=True)
            t = weld[idx]
            n = weld.max() + 1
            rows = np.concatenate([t[:, 0], t[:, 1], t[:, 2]])
            cols = np.concatenate([t[:, 1], t[:, 2], t[:, 0]])
            _, comp = connected_components(coo_matrix((np.ones(len(rows)), (rows, cols)), shape=(n, n)), directed=False)
            tri_comp = comp[t[:, 0]]
            counts = np.bincount(tri_comp)
            keep = counts[tri_comp] >= keep_ratio * len(t)
            kept = idx[keep]
            print(f"kept {keep.sum()} of {len(t)} triangles ({(counts >= keep_ratio * len(t)).sum()} of {len(counts)} pieces)")
            views[ia["bufferView"]] = kept.astype("<u4").tobytes()
            ia["byteOffset"] = 0
            ia["count"] = int(kept.size)
            ia["max"] = [int(kept.max())]
            ia["min"] = [int(kept.min())]


def main(src, dst):
    gltf, binary = read_glb(src)
    views = []
    for bv in gltf["bufferViews"]:
        off = bv.get("byteOffset", 0)
        views.append(binary[off : off + bv["byteLength"]])
    drop_floaters(gltf, views)
    for image in gltf.get("images", []):
        i = image["bufferView"]
        out = io.BytesIO()
        clean(Image.open(io.BytesIO(views[i]))).save(out, "PNG", optimize=True)
        views[i] = out.getvalue()
    write_glb(dst, gltf, views)
    print("written", dst)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
