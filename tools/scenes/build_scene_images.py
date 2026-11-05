"""Interactive 3D scenes (2026-11): turns the Unreal masters into web images.

Reads the PNG masters and ID masks from the Unreal session's folder (default C:\\Users\\rhand\\Downloads\\ue-renders\\pp)
and writes, for every frame listed in tools/scenes/scenes.json:
  img/scenes/<key>/<frame>-{480,960,1600}.{avif,webp}
plus, from the ID masks:
  - condo toggles: img/scenes/cnd/cnd-unit-<layer>-960.webp (transparent tint over one coverage group, one per layer)
  - hotspots (pins, in any kind of scene): centres (percent of the frame) written to tools/scenes/hotspots-<key>.json
  - derived frames (work order Nov 4): a frame with "derive" is made from another render and its mask, the masked
    pixels pushed toward grey by "grey" (0 to 1): the collections slider's appraisal age fades the gold frame
Masks are flat-colour PNGs from the same camera and resolution as their frame (see the .json beside each mask).
Usage (repo root): python tools/scenes/build_scene_images.py [source_dir]
Needs Pillow with AVIF support (pip install pillow, 11.3 or later) and numpy.
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\rhand\Downloads\ue-renders\pp"
OUT = os.path.join(ROOT, "img", "scenes")
CFG = json.load(open(os.path.join(os.path.dirname(__file__), "scenes.json"), encoding="utf-8"))
WIDTHS = (480, 960, 1600)
Q_WEBP = {480: 74, 960: 74, 1600: 78}
Q_AVIF = {480: 52, 960: 52, 1600: 56}


def save_frame(key, name):
    src = os.path.join(SRC, key, name + ".png")
    im = Image.open(src).convert("RGB")
    out = os.path.join(OUT, key)
    os.makedirs(out, exist_ok=True)
    sizes = {}
    for w in WIDTHS:
        h = round(im.height * w / im.width)
        r = im.resize((w, h), Image.LANCZOS) if w != im.width else im
        for fmt, q in (("webp", Q_WEBP[w]), ("avif", Q_AVIF[w])):
            p = os.path.join(out, "%s-%d.%s" % (name, w, fmt))
            if fmt == "webp":
                r.save(p, "WEBP", quality=q, method=6)
            else:
                r.save(p, "AVIF", quality=q, speed=4)
            sizes["%d.%s" % (w, fmt)] = os.path.getsize(p)
    return sizes


def derive_frame(key, f):
    """Write SRC/<key>/<name>.png from the "from" render: the mask's pixels move toward a neutral grey by "grey"."""
    dv = f["derive"]
    im = np.asarray(Image.open(os.path.join(SRC, key, dv["from"] + ".png")).convert("RGB")).astype(np.float32)
    m = mask_array(key, dv["from"])
    sel = np.zeros(m.shape, bool)
    for c in dv["mask_colours"]:
        sel |= (m == hexint(c))
    a = np.asarray(Image.fromarray((sel * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 255.0
    lum = im @ np.array([0.299, 0.587, 0.114], np.float32)
    grey = np.dstack([lum * 0.96, lum * 0.96, lum * 0.98]) * 0.74   # a cool, darker grey: the gold goes dull
    t = (a * float(dv["grey"]))[..., None]
    out = im * (1 - t) + grey * t
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGB").save(os.path.join(SRC, key, f["name"] + ".png"))
    print("  derived %-14s from %s, %d mask px, grey %.2f" % (f["name"], dv["from"], int(sel.sum()), dv["grey"]))


def mask_array(key, name):
    m = np.asarray(Image.open(os.path.join(SRC, key, name + "-ids.png")).convert("RGB")).astype(np.int32)
    return m[..., 0] * 65536 + m[..., 1] * 256 + m[..., 2]


def hexint(h):
    return int(h[1:], 16)


def tint_layers(key, frame, layers):
    """One transparent WebP per layer: the layer's mask pixels in its tint, slightly feathered, at 960 px."""
    m = mask_array(key, frame)
    out = os.path.join(OUT, key)
    for layer in layers:
        sel = np.zeros(m.shape, bool)
        for c in layer["mask_colours"]:
            sel |= (m == hexint(c))
        r, g, b = [int(layer["tint"][i:i + 2], 16) for i in (1, 3, 5)]
        a = (sel * int(255 * layer.get("alpha", 0.55))).astype(np.uint8)
        rgba = np.dstack([np.full(m.shape, r, np.uint8), np.full(m.shape, g, np.uint8), np.full(m.shape, b, np.uint8), a])
        im = Image.fromarray(rgba, "RGBA").resize((960, 540), Image.LANCZOS)
        p = os.path.join(out, "%s-%s-960.webp" % (frame, layer["id"]))
        im.save(p, "WEBP", quality=80, method=6)
        print("  layer %-10s %6d px  %6d bytes" % (layer["id"], int(sel.sum()), os.path.getsize(p)))


def hotspot_centres(key, frame, spots):
    """Centre of the largest blob's bounding box per mask colour (percent of the frame), robust to stray pixels."""
    m = mask_array(key, frame)
    H, W = m.shape
    res = {}
    for s in spots:
        ys, xs = np.nonzero(m == hexint(s["mask_colour"]))
        if len(xs) < 50:
            print("  WARNING: hotspot %s has only %d pixels" % (s["id"], len(xs)))
            continue
        # trim 5% outliers on each axis, then take the median as the anchor
        x = float(np.median(xs)); y = float(np.median(ys))
        res[s["id"]] = {"x": round(100.0 * x / W, 1), "y": round(100.0 * y / H, 1), "pixels": int(len(xs))}
    return res


def main():
    sp = os.path.join(os.path.dirname(__file__), "sizes.json")
    report = json.load(open(sp)) if os.path.exists(sp) else {}   # merged: an ONLY run keeps the other scenes' sizes
    only = [k for k in os.environ.get("ONLY", "").split(",") if k]   # ONLY=mar,str to encode just those scenes
    for key, sc in CFG["scenes"].items():
        if only and key not in only:
            continue
        print(key)
        for f in sc["frames"]:
            if f.get("derive"):
                derive_frame(key, f)
            sizes = save_frame(key, f["name"])
            report["%s/%s" % (key, f["name"])] = sizes
            print("  %-16s 960 webp %5.1f KB  avif %5.1f KB" % (f["name"], sizes["960.webp"] / 1024, sizes["960.avif"] / 1024))
        if sc.get("layers"):
            tint_layers(key, sc["layers_frame"], sc["layers"])
        if sc.get("hotspots"):
            pos = hotspot_centres(key, sc["hotspots_frame"], sc["hotspots"])
            json.dump(pos, open(os.path.join(os.path.dirname(__file__), "hotspots-%s.json" % key), "w"), indent=1)
            print("  hotspots:", pos)
    json.dump(report, open(sp, "w"), indent=1)


if __name__ == "__main__":
    main()
