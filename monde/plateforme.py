"""La Plateforme : une carte plate divisée en 195 secteurs (cellules de Voronoï), chacun avec une ressource."""
import os, numpy as np
from PIL import Image, ImageDraw, ImageFont

N = 195
PW, PH = 640, 680          # taille de la plaque à l'écran
SC = 2                     # sur-échantillonnage
RES = [("Mines d'or", (240, 190, 60)), ("Pétrole", (90, 90, 110)), ("Agriculture", (110, 200, 90)),
       ("Pêche", (70, 170, 230)), ("Technologie", (170, 110, 240)), ("Forêt", (40, 150, 90)),
       ("Énergie solaire", (250, 140, 60)), ("Espace", (230, 90, 140))]
GREY = np.array((74, 82, 96), dtype=np.uint8)
EDGE = np.array((16, 22, 42), dtype=np.uint8)
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = f"{HERE}/data/plateforme.npz"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def _labels(seeds, w, h):
    ys, xs = np.mgrid[0:h, 0:w]
    best = np.full((h, w), 1e18, dtype=np.float32)
    lab = np.zeros((h, w), dtype=np.int16)
    for i, (sx, sy) in enumerate(seeds):
        d = (xs - sx) ** 2 + (ys - sy) ** 2
        m = d < best
        best[m] = d[m]; lab[m] = i
    return lab


def build():
    if os.path.exists(CACHE):
        z = np.load(CACHE)
        return z["lab"], z["cent"], z["res"], z["order"]
    rng = np.random.default_rng(2026)
    seeds = np.column_stack([rng.uniform(0, PW, N), rng.uniform(0, PH, N)])
    for _ in range(4):  # relaxation de Lloyd : cellules régulières
        lab = _labels(seeds, PW // 2, PH // 2) if False else _labels(seeds / 2, PW // 2, PH // 2)
        ys, xs = np.mgrid[0:PH // 2, 0:PW // 2]
        for i in range(N):
            m = lab == i
            if m.any():
                seeds[i] = (xs[m].mean() * 2, ys[m].mean() * 2)
    lab = _labels(seeds * SC, PW * SC, PH * SC)
    res = rng.integers(0, len(RES), N)
    order = rng.permutation(N)           # ordre d'apparition
    np.savez_compressed(CACHE, lab=lab, cent=seeds, res=res, order=order)
    return lab, seeds, res, order


LAB, CENT, RESID, ORDER = build()
RANK = np.empty(N, dtype=np.int32); RANK[ORDER] = np.arange(N)
EDGES = (LAB != np.roll(LAB, 1, 0)) | (LAB != np.roll(LAB, 1, 1))
PAL = np.array([RES[r][1] for r in RESID], dtype=np.float32)
rj = np.random.default_rng(5).uniform(0.88, 1.08, N)[:, None]
PAL = np.clip(PAL * rj, 0, 255).astype(np.uint8)


def f(sz):
    return ImageFont.truetype(FONT_B, sz)


def draw(bg, spec, tf, W=720, H=1280):
    """spec: reveal (0..1 fin de l'apparition), zoom {sector, to}, marks [..], highlight sector."""
    img = bg.copy()
    k = int(N * min(1, tf / max(1e-6, spec.get("reveal", 0.01)))) if spec.get("reveal") is not None else N
    shown = RANK < k
    arr = np.where(shown[LAB][:, :, None], PAL[LAB], GREY)
    hl = spec.get("highlight")
    if hl is not None and int(tf * 6) % 2 == 0:
        m = LAB == hl
        arr[m] = np.clip(arr[m].astype(int) + 70, 0, 255)
    arr[EDGES] = EDGE
    m = Image.fromarray(arr.astype(np.uint8))
    z = spec.get("zoom")
    zf = 1.0
    if z:
        zf = 1 + (z["to"] - 1) * min(1, tf / 0.6) ** 2 * (3 - 2 * min(1, tf / 0.6))
        cx, cy = CENT[z["sector"]] * SC
        cw, ch = PW * SC / zf, PH * SC / zf
        x0 = min(max(cx - cw / 2, 0), PW * SC - cw); y0 = min(max(cy - ch / 2, 0), PH * SC - ch)
        m = m.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch)))
    VW, VH = int(PW * 0.9), int(PH * 0.9)
    m = m.resize((VW, VH), Image.LANCZOS)
    ox, oy = (W - VW) // 2, 295
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle([ox - 8, oy + 6, ox + VW + 8, oy + VH + 26], 22, fill=(32, 40, 72))      # épaisseur
    d.rounded_rectangle([ox - 8, oy - 8, ox + VW + 8, oy + VH + 8], 22, fill=(52, 64, 108))
    img.paste(m, (ox, oy))
    d = ImageDraw.Draw(img, "RGBA")
    if not z:
        for i, s in enumerate(spec.get("marks", [])):
            t0 = 0.05 + 0.5 * i / max(1, len(spec["marks"]))
            if tf > t0:
                px, py = ox + CENT[s][0] * 0.9, oy + CENT[s][1] * 0.9
                r = 16 + 5 * abs(np.sin((tf - t0) * 9))
                d.ellipse([px - r, py - r, px + r, py + r], fill=(231, 60, 60, 235), outline=(255, 255, 255), width=3)
                d.text((px, py), "!", font=f(24), fill=(255, 255, 255), anchor="mm")
    if z and spec.get("chip"):
        txt = spec["chip"]
        d.rounded_rectangle([ox + 20, oy + VH - 80, ox + VW - 20, oy + VH - 14], 16, fill=(15, 20, 45, 235), outline=(70, 230, 120), width=3)
        d.text((ox + VW // 2, oy + VH - 47), txt, font=f(26), fill=(255, 255, 255), anchor="mm")
    if spec.get("legend"):
        for i, (n, c) in enumerate(RES):
            x = ox + (i % 4) * 150; y = oy + VH + 40 + (i // 4) * 34
            d.ellipse([x, y + 4, x + 16, y + 20], fill=c)
            d.text((x + 24, y + 2), n, font=f(16), fill=(235, 238, 250))
    return img


def sector_info(i):
    return RES[RESID[i]][0]
