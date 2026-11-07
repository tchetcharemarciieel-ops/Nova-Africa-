"""Décors 2D : chaque décor = static (mis en cache) + anim + front (devant les personnages)."""
import cairo, math, random
from gfx import *

def skyline(c, seed, base, hmin, hmax, col, win, lit=.35, wmin=38, wmax=92, x0=-40, x1=W + 40, tall=False):
    r = random.Random(seed); x = x0
    while x < x1:
        w = r.randint(wmin, wmax); h = r.randint(hmin, hmax)
        if tall and r.random() < .18: h = int(hmax * 1.5)
        rect(c, x, base - h, w, h, col)
        if r.random() < .3: rect(c, x + w * .4, base - h - r.randint(10, 40), 3, 40, col)          # antenne
        if r.random() < .15: poly(c, [(x, base - h), (x + w, base - h), (x + w / 2, base - h - w * .5)], col)
        for yy in range(int(base - h + 10), int(base - 8), 18):
            for xx in range(int(x + 6), int(x + w - 8), 13):
                if r.random() < lit: rect(c, xx, yy, 6, 9, win, r.uniform(.4, .95))
        x += w + r.randint(0, 6)

def stars(c, seed, n, ymax):
    r = random.Random(seed)
    for _ in range(n): rect(c, r.uniform(0, W), r.uniform(0, ymax), 2, 2, (1, 1, 1), r.uniform(.3, .9))

class BG:
    amb = (1, 1, 1); ground = GROUND
    def static(self, c): pass
    def anim(self, c, t): pass
    def front(self, c, t): pass

class Lagoon(BG):
    amb = (.62, .78, .95)
    def __init__(self, deck=True): self.deck = deck
    def static(self, c):
        vgrad(c, 0, 640, hx('#030612'), hx('#15495a')); stars(c, 3, 70, 420)
        glow(c, 560, 190, 160, (.7, .85, 1), .35); c.set_source_rgb(.93, .96, 1); c.arc(560, 190, 36, 0, 6.3); c.fill()
        skyline(c, 11, 640, 70, 250, hx('#05101a'), hx('#ffd27a'), .3, tall=True)
        vgrad(c, 640, 1280, hx('#0a2a36'), hx('#02090f'))
        c.save(); c.translate(0, 1280); c.scale(1, -1)                            # reflets
        c.rectangle(0, 640, W, 640); c.clip(); c.restore()
        c.save(); c.translate(0, 640 * 2); c.scale(1, -1); c.rectangle(0, 640 - 1, W, 300); c.clip()
        skyline(c, 11, 640, 70, 250, hx('#05101a'), hx('#ffd27a'), .3, tall=True); c.restore()
        vgrad(c, 640, 960, hx('#0a2a36'), hx('#0a2a36'))
        c.set_source_rgba(.04, .16, .21, .6); c.rectangle(0, 640, W, 330); c.fill()
        if self.deck:
            rect(c, 0, 902, 480, 120, hx('#4a3226')); rect(c, 0, 1010, 490, 90, hx('#d9d9d2')); rect(c, 0, 1100, 490, 12, hx('#7a1f1f'))
            for x in range(0, 480, 46): rect(c, x, 902, 2, 108, (0, 0, 0), .35)
            rect(c, 0, 560, 190, 342, hx('#cfd3d6')); rect(c, 12, 620, 60, 90, hx('#ffcf80')); rect(c, 100, 620, 60, 90, hx('#ffcf80'))
            for x in range(40, 480, 70): rect(c, x, 790, 5, 112, hx('#c9ccd0'))
            rect(c, 30, 788, 450, 5, hx('#c9ccd0'))
            for i in range(11):
                bx = 20 + i * 44; by = 690 + 34 * math.sin(i / 10 * 3.14) * -1 + 40
                glow(c, bx, by, 30, hx('#ffd27a'), .8); rect(c, bx - 2, by - 2, 4, 4, (1, 1, 1))
    def anim(self, c, t):
        for i in range(34):
            y = 660 + i * 17; x = (i * 97 + t * (12 + i % 5)) % W
            rect(c, x, y, 40 + (i % 4) * 14, 2, (.7, .85, 1), .08 + .02 * (i % 3))
        glow(c, 560, 700 + 40 * math.sin(t), 90, (.8, .9, 1), .12)
    def front(self, c, t):
        c.set_source_rgba(.02, .09, .12, .92); c.rectangle(486, 930, W - 486, H - 930); c.fill()
        for i in range(6):
            rect(c, 486, 930 + i * 22 + 3 * math.sin(t * 2 + i), W - 486, 2, (.6, .85, 1), .15)

class Dawn(BG):
    amb = (1, .88, .8)
    def __init__(self, cranes=False, police=True, seed=5): self.cranes, self.police, self.seed = cranes, police, seed
    def static(self, c):
        vgrad(c, 0, 640, hx('#1d2c4a'), hx('#f0975a'), mid=(.6, hx('#9c6a78')))
        glow(c, 200, 620, 280, hx('#ffb066'), .5)
        skyline(c, self.seed, 640, 50, 190, hx('#241d2e'), hx('#ffcf80'), .1, tall=True)
        vgrad(c, 640, 900, hx('#7a5a5a'), hx('#3a3a4a'))
        for i in range(8): rect(c, 40 + i * 70, 660 + i * 22, 150 - i * 6, 3, hx('#ffc890'), .25)
        vgrad(c, 900, 1280, hx('#383c46'), hx('#1a1c24'))
        for x in range(0, W, 120): rect(c, x, 900, 4, 380, (0, 0, 0), .18)
        if self.cranes:
            for cx in (80, 420):
                rect(c, cx, 380, 10, 260, hx('#1b1822')); rect(c, cx - 90, 380, 300, 10, hx('#1b1822'))
                for k in range(0, 300, 30): c.set_source_rgb(*hx('#1b1822')); c.move_to(cx - 90 + k, 390); c.line_to(cx - 70 + k, 380); c.stroke()
            for i, col in enumerate(('#7a2a2a', '#2a4a7a', '#7a6a2a', '#2a6a4a')):
                rect(c, 460 + (i % 2) * 70, 590 - (i // 2) * 28, 64, 26, hx(col))
    def anim(self, c, t):
        if self.police:
            poly(c, [(20, 900), (290, 900), (280, 846), (230, 800), (100, 798), (40, 846)], hx('#14161c'))
            rect(c, 120, 784, 80, 10, hx('#14161c'))
            on = int(t * 4) % 2
            glow(c, 130, 780, 130, (1, .1, .1) if on else (.1, .3, 1), .8); glow(c, 190, 780, 130, (.1, .3, 1) if on else (1, .1, .1), .8)
            rect(c, 128, 776, 20, 8, (1, .2, .2) if on else (.2, .4, 1)); rect(c, 168, 776, 20, 8, (.2, .4, 1) if on else (1, .2, .2))
            tx = 560
            rect(c, tx, 790, 6, 110, hx('#222')); rect(c, 320, 790, 6, 110, hx('#222'))
            for k in range(14):
                x = 326 + k * 17; y = 805 + 3 * math.sin(t * 3 + k * .5)
                poly(c, [(x, y), (x + 9, y), (x + 17, y + 8), (x + 8, y + 8)], hx('#f2c200'))
            rect(c, 326, 818, 238, 0, (0, 0, 0))

class Newsroom(BG):
    amb = (1, .95, .88)
    def static(self, c):
        vgrad(c, 0, 900, hx('#e0d4bf'), hx('#c7b9a2')); rect(c, 0, 0, W, 90, hx('#efe6d4'))
        for x in range(60, W, 160): glow(c, x, 40, 120, (1, .95, .8), .5); rect(c, x - 40, 34, 80, 8, (1, 1, 1))
        rect(c, 40, 150, 330, 330, hx('#2b2b33')); vgrad(c, 56, 470, hx('#7fb7da'), hx('#d8e9f1'), x=56, w=298)
        skyline(c, 21, 470, 70, 210, hx('#486a85'), hx('#e8f4ff'), .1, wmin=30, wmax=60, x0=56, x1=354)
        rect(c, 205, 150, 6, 330, hx('#2b2b33'))
        rect(c, 440, 170, 230, 140, hx('#17181e')); rect(c, 446, 176, 218, 128, hx('#a5202b'))
        for r_ in range(1, 6): rect(c, 460, 140 + r_ * 20, 120 + (r_ % 3) * 30, 6, (1, 1, 1), .8)
        vgrad(c, 900, 1280, hx('#6b5a48'), hx('#2e261f'))
        for dx in (60, 260, 470):
            rect(c, dx, 760, 190, 14, hx('#4a3a2c')); rect(c, dx + 70, 700, 50, 60, hx('#16171c')); rect(c, dx + 76, 706, 38, 46, hx('#4aa0d8'))
            rect(c, dx + 8, 774, 8, 130, hx('#3a2e24')); rect(c, dx + 174, 774, 8, 130, hx('#3a2e24'))
    def anim(self, c, t):
        a = .5 + .5 * math.sin(t * 6); rect(c, 450, 182, 60, 18, (1, 1, 1), .85 if a > .4 else .1)
        rect(c, 446, 262, 218, 42, (0, 0, 0), .5)
        x = 664 - (t * 90) % 420; c.save(); c.rectangle(446, 262, 218, 42); c.clip()
        c.set_source_rgb(1, 1, 1); c.select_font_face('DejaVu Sans', 0, 1); c.set_font_size(24); c.move_to(x, 292)
        c.show_text('NOVA : LA PDG RETROUVÉE MORTE  ••  ENQUÊTE OUVERTE  ••  NOVA : LA PDG RETROUVÉE MORTE'); c.restore()

class Office(BG):
    amb = (.72, .98, .9)
    def static(self, c):
        vgrad(c, 0, 900, hx('#06161a'), hx('#0e3a3c'))
        for i, x in enumerate(range(10, W, 120)):
            rect(c, x, 280, 96, 620, hx('#0a1317')); rect(c, x + 4, 284, 88, 612, hx('#101e24'))
            for y in range(300, 880, 38): rect(c, x + 12, y, 72, 22, hx('#0a1317'))
        rect(c, 120, 90, 480, 150, hx('#031014')); rect(c, 126, 96, 468, 138, hx('#041a14'))
        vgrad(c, 900, 1280, hx('#0c2a2e'), hx('#030c0e'))
        for y in range(920, 1280, 40): rect(c, 0, y, W, 1, (0.2, 1, .8), .08)
    def anim(self, c, t):
        r = random.Random(int(t * 12))
        for i in range(8):
            for k in range(10):
                if r.random() < .5: rect(c, 150 + i * 56, 104 + (k * 14 + t * 60 * (1 + i % 3)) % 124, 8, 10, (.2, 1, .5), r.uniform(.3, 1))
        rr = random.Random(7)
        for _ in range(70):
            x = rr.randint(20, 700); y = rr.randint(300, 880); on = (math.sin(t * rr.uniform(2, 7) + x) > 0)
            rect(c, x, y, 4, 4, (.2, 1, .6) if on else (1, .3, .2), .9 if on else .5)
class Ministre(BG):
    amb = (1, .86, .7)
    def static(self, c):
        vgrad(c, 0, 900, hx('#3d2517'), hx('#2a1a10'))
        for x in range(0, W, 72): rect(c, x, 0, 3, 900, (0, 0, 0), .35)
        rect(c, 400, 110, 260, 340, hx('#150f0a')); vgrad(c, 410, 440, hx('#f2a25a'), hx('#3a2a4a'), x=410, w=240)
        skyline(c, 8, 440, 40, 150, hx('#1c1424'), hx('#ffcf80'), .25, wmin=26, wmax=50, x0=410, x1=650)
        rect(c, 526, 110, 8, 340, hx('#150f0a'))
        for i, col in enumerate(('#f77f00', '#ffffff', '#009e60')): rect(c, 50 + i * 36, 160, 36, 200, hx(col))
        rect(c, 44, 140, 6, 330, hx('#c9a24a')); 
        rect(c, 120, 720, 520, 20, hx('#17100a')); rect(c, 130, 740, 500, 160, hx('#251810'))
        vgrad(c, 900, 1280, hx('#1d130c'), hx('#0b0705'))
        glow(c, 220, 700, 180, hx('#ffc070'), .45); rect(c, 215, 690, 10, 30, hx('#cfa24a'))
class Street(BG):
    amb = (.7, .8, 1.0)
    def __init__(self, seed=2, rain=False, cars=True): self.seed, self.rain, self.cars = seed, rain, cars
    def static(self, c):
        vgrad(c, 0, 700, hx('#050812'), hx('#1b2740')); stars(c, 5, 30, 300)
        skyline(c, self.seed, 700, 160, 420, hx('#0a0e18'), hx('#ffd27a'), .3, wmin=60, wmax=120, tall=True)
        r = random.Random(self.seed)
        for x in range(10, W - 80, 170):
            col = r.choice(('#ff3a8a', '#22d3ee', '#ffb020', '#7cff6a'))
            rect(c, x, 620, 120, 34, hx('#0a0e18')); glow(c, x + 60, 637, 80, hx(col), .55); rect(c, x + 6, 626, 108, 22, hx(col), .9)
        vgrad(c, 700, 900, hx('#161a26'), hx('#232838'))
        vgrad(c, 900, 1280, hx('#1b2030'), hx('#07080d'))
        for x in range(0, W, 140): rect(c, x, 1090, 70, 8, (.9, .9, .9), .35)
        for x in (90, 380, 650):
            rect(c, x, 520, 7, 380, hx('#0a0c12')); rect(c, x - 16, 520, 40, 7, hx('#0a0c12'))
            glow(c, x - 12, 530, 190, hx('#ffc878'), .55); glow(c, x - 12, 920, 90, hx('#ffc878'), .25)
    def anim(self, c, t):
        if self.cars:
            for k, (sp, y, col) in enumerate(((140, 975, '#d0d6e8'), (-110, 1160, '#ff5a4a'))):
                x = (t * sp + k * 300) % (W + 400) - 200 if sp > 0 else W + 200 - (t * -sp + k * 300) % (W + 400)
                d = 1 if sp > 0 else -1
                poly(c, [(x, y), (x + 120 * d, y), (x + 110 * d, y - 34), (x + 78 * d, y - 52), (x + 30 * d, y - 52), (x + 10 * d, y - 32)], hx('#10131a'))
                glow(c, x + 118 * d, y - 12, 120, hx('#fff0c0'), .6); rect(c, x + 112 * d - 5, y - 18, 10, 8, hx('#fff0c0'))
                glow(c, x + 2 * d, y - 12, 50, hx(col), .5)
        if self.rain:
            r = random.Random(1)
            c.set_source_rgba(.7, .8, 1, .35); c.set_line_width(1.5)
            for _ in range(160):
                x = r.uniform(0, W); y = (r.uniform(0, H) + t * 900) % H
                c.move_to(x, y); c.line_to(x - 4, y + 22); c.stroke()
class Apartment(BG):
    amb = (.8, .82, 1.0)
    def __init__(self, palette='blue', door=False): self.p, self.door = palette, door
    def static(self, c):
        vgrad(c, 0, 900, hx('#25243a'), hx('#17172a')) 
        rect(c, 380, 140, 260, 380, hx('#0b0b14')); vgrad(c, 388, 512, hx('#101a38'), hx('#4a3a5a'), x=388, w=244)
        skyline(c, 4, 512, 40, 160, hx('#0b0b18'), hx('#ffcf80'), .3, wmin=24, wmax=48, x0=388, x1=632)
        for y in range(150, 510, 20): rect(c, 388, y, 244, 8, (0, 0, 0), .55)
        vgrad(c, 900, 1280, hx('#2a1d17'), hx('#0e0a08'))
        rect(c, 20, 740, 260, 150, hx('#3a3a52')); rect(c, 20, 700, 40, 190, hx('#323248'))
        rect(c, 470, 760, 220, 12, hx('#1d1410')); rect(c, 480, 772, 8, 128, hx('#1d1410')); rect(c, 672, 772, 8, 128, hx('#1d1410'))
        if self.door:
            rect(c, 10, 220, 150, 680, hx('#120f12')); poly(c, [(160, 230), (240, 280), (240, 880), (160, 900)], hx('#2a2028'))
            c.save(); poly(c, [(150, 240), (150, 900), (330, 1100), (330, 300)], (1, .85, .6), .13); c.restore()
    def anim(self, c, t):
        poly(c, [(388, 520), (632, 520), (700, 1000), (300, 1000)], (.8, .85, 1), .05 + .02 * math.sin(t))
        glow(c, 560, 740, 120, (.5, .85, 1), .4 + .1 * math.sin(t * 3)); rect(c, 520, 724, 70, 36, hx('#10141c')); rect(c, 524, 728, 62, 28, hx('#3aa6d6'), .9)
class Rooftop(BG):
    amb = (.55, .62, .85)
    def __init__(self, seed=9, dakar=False): self.seed, self.dakar = seed, dakar
    def static(self, c):
        vgrad(c, 0, 760, hx('#02030a'), hx('#1c2a4a')); stars(c, self.seed, 90, 500)
        glow(c, 120, 150, 120, (.7, .8, 1), .25); c.set_source_rgb(.9, .93, 1); c.arc(120, 150, 24, 0, 6.3); c.fill()
        skyline(c, self.seed, 820, 60, 300, hx('#06080f'), hx('#ffcf80'), .3, wmin=40, wmax=100, tall=True)
        r = random.Random(self.seed)
        for _ in range(60): glow(c, r.uniform(0, W), r.uniform(700, 860), r.uniform(10, 26), r.choice([hx('#ffcf80'), hx('#ff5a7a'), hx('#7ad0ff')]), .5)
        vgrad(c, 880, 1280, hx('#24262e'), hx('#0a0b10'))
        rect(c, 0, 880, W, 22, hx('#35373f')); rect(c, 560, 700, 130, 180, hx('#1a1c24'))
        if self.dakar:
            poly(c, [(500, 820), (520, 600), (540, 820)], hx('#050609'))
    def anim(self, c, t):
        for x, y in ((180, 560), (610, 640)):
            glow(c, x, y, 40, (1, .1, .1), .4 + .5 * max(0, math.sin(t * 3))); rect(c, x - 2, y - 80, 4, 80, hx('#05060a'))
class Monnaie(BG):
    amb = (.82, .78, .68)
    def static(self, c):
        vgrad(c, 0, 900, hx('#32302c'), hx('#1b1a18')); rect(c, 0, 0, W, 50, hx('#12110f'))
        for x in (30, 250, 470, 670):
            rect(c, x, 60, 60, 840, hx('#4a463e')); rect(c, x - 8, 60, 76, 22, hx('#5a554a')); rect(c, x - 8, 880, 76, 22, hx('#5a554a'))
            for k in range(8): rect(c, x + 16, 120 + k * 100, 4, 70, (0, 0, 0), .25)
        for x in (110, 330, 550): c.set_source_rgb(*hx('#1b1a18')); c.arc(x + 30, 160, 110, 3.14, 6.28); c.fill()
        vgrad(c, 900, 1280, hx('#2e2a24'), hx('#0c0b09'))
        for x, w in ((130, 110), (350, 90), (560, 120)):
            rect(c, x, 790, w, 110, hx('#0d0c0a')); rect(c, x + 8, 770, w - 16, 24, hx('#12110e')); c.set_source_rgb(.05, .05, .04); c.arc(x + w, 820, 22, 0, 6.28); c.stroke()
    def anim(self, c, t):
        poly(c, [(40, 0), (140, 0), (460, 1000), (300, 1000)], (1, .92, .7), .09)
        r = random.Random(3)
        for _ in range(60):
            x = r.uniform(80, 420); y = (r.uniform(0, 1000) + t * r.uniform(6, 22)) % 1000
            rect(c, x + 20 * math.sin(t + x), y, 2, 2, (1, .95, .8), r.uniform(.2, .7))
class Void(BG):
    amb = (1, 1, 1)
    def __init__(self, a='#06090f', b='#12303a'): self.a, self.b = a, b
    def static(self, c): vgrad(c, 0, H, hx(self.a), hx(self.b))
    def anim(self, c, t):
        r = random.Random(1)
        for _ in range(40):
            x = r.uniform(0, W); y = (r.uniform(0, H) - t * r.uniform(8, 30)) % H
            glow(c, x, y, r.uniform(6, 16), (.9, .7, .4), .25)

def make(name, **kw):
    return {'lagoon': Lagoon, 'dawn': Dawn, 'newsroom': Newsroom, 'office': Office, 'ministre': Ministre,
            'street': Street, 'apartment': Apartment, 'rooftop': Rooftop, 'monnaie': Monnaie, 'void': Void}[name](**kw)
