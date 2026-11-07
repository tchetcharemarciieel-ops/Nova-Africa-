"""Primitives de dessin + personnages 2D articulés (cairo)."""
import cairo, math, random

W, H, SC = 720, 1280, 1.5            # repère logique 720x1280, rendu 1080x1920
GROUND = 900

def hx(h):
    h = h.lstrip('#')
    if len(h) == 3: h = ''.join(ch * 2 for ch in h)
    return tuple(int(h[i:i+2], 16) / 255 for i in (0, 2, 4))

def mix(a, b, k): return tuple(a[i] * (1 - k) + b[i] * k for i in range(3))

def vgrad(c, y0, y1, c0, c1, x=0, w=W, mid=None):
    g = cairo.LinearGradient(0, y0, 0, y1); g.add_color_stop_rgb(0, *c0)
    if mid: g.add_color_stop_rgb(mid[0], *mid[1])
    g.add_color_stop_rgb(1, *c1)
    c.set_source(g); c.rectangle(x, y0, w, y1 - y0); c.fill()

def rect(c, x, y, w, h, col, a=1.0):
    c.set_source_rgba(*col, a); c.rectangle(x, y, w, h); c.fill()

def poly(c, pts, col, a=1.0):
    c.move_to(*pts[0]); [c.line_to(*p) for p in pts[1:]]; c.close_path(); c.set_source_rgba(*col, a); c.fill()

def glow(c, x, y, r, col, a=0.6):
    g = cairo.RadialGradient(x, y, 0, x, y, r)
    g.add_color_stop_rgba(0, *col, a); g.add_color_stop_rgba(1, *col, 0)
    c.set_source(g); c.arc(x, y, r, 0, 6.2832); c.fill()

def rrect(c, x, y, w, h, r):
    c.new_sub_path(); c.arc(x + w - r, y + r, r, -1.5708, 0); c.arc(x + w - r, y + h - r, r, 0, 1.5708)
    c.arc(x + r, y + h - r, r, 1.5708, 3.1416); c.arc(x + r, y + r, r, 3.1416, 4.7124); c.close_path()

def limb(c, x, y, a1, l1, a2, l2, w, col, hand=None, hr=0):
    x1, y1 = x + math.sin(a1) * l1, y + math.cos(a1) * l1
    x2, y2 = x1 + math.sin(a2) * l2, y1 + math.cos(a2) * l2
    c.set_line_cap(cairo.LINE_CAP_ROUND); c.set_line_join(cairo.LINE_JOIN_ROUND)
    c.set_source_rgb(*col); c.set_line_width(w)
    c.move_to(x, y); c.line_to(x1, y1); c.line_to(x2, y2); c.stroke()
    if hand:
        c.set_source_rgb(*hand); c.arc(x2, y2, hr or w * .55, 0, 6.2832); c.fill()
    return x2, y2

# ---------- personnages ----------
CHARS = {
 'amara':   dict(skin='#7a4a32', hair='afro',   top='#d0701f', bot='#262b3a', kind='jacket', s=1.00),
 'kofi':    dict(skin='#5a3826', hair='gray',   top='#b8a888', bot='#33343c', kind='coat',   s=1.06, beard=1),
 'nadege':  dict(skin='#6a4230', hair='bun',    top='#15151e', bot='#15151e', kind='dress',  s=1.00, gold=1),
 'lea':     dict(skin='#6b412d', hair='braids', top='#2e7355', bot='#1b1b24', kind='hoodie', s=0.97, glasses=1),
 'ibrahim': dict(skin='#52311f', hair='bald',   top='#8b919b', bot='#6a6f79', kind='suit',   s=1.06, glasses=1),
 'karim':   dict(skin='#7b4d35', hair='short',  top='#2c62ad', bot='#2a2a31', kind='shirt',  s=1.02),
 'fatou':   dict(skin='#7a4a32', hair='braids', top='#e9e4d8', bot='#2b3d78', kind='shirt',  s=0.86),
 'redac':   dict(skin='#684029', hair='short',  top='#7b6a55', bot='#2a2a30', kind='shirt',  s=1.02),
 'courtier':dict(skin='#050608', hair='none',   top='#06070b', bot='#06070b', kind='hood',   s=1.08, dark=1),
 'extra':   dict(skin='#1a1a22', hair='short',  top='#171a24', bot='#12141c', kind='shirt',  s=0.8,  dark=1),
 'extraw':  dict(skin='#1a1a22', hair='bun',    top='#1d1a26', bot='#1d1a26', kind='dress',  s=0.8,  dark=1),
 'police':  dict(skin='#593726', hair='cap',    top='#26324a', bot='#1e2433', kind='shirt',  s=1.02),
}

def _col(h, amb): return tuple(min(1, v * a) for v, a in zip(hx(h), amb))

def draw_char(c, name, x, y, face=1, t=0.0, pose='idle', phase=0.0, speed=0.0,
              rot=0.0, scale=1.0, amb=(1, 1, 1), rim=None, extra=None):
    sp = CHARS[name]; s = sp['s'] * scale
    skin, top, bot = _col(sp['skin'], amb), _col(sp['top'], amb), _col(sp['bot'], amb)
    shoe = tuple(v * .35 for v in amb)
    c.save(); c.translate(x, y); c.scale(face * s, s)
    # ombre
    c.save(); c.scale(1, .16); glow(c, 0, 0, 62, (0, 0, 0), .55); c.restore()
    if rot:
        c.translate(0, -140); c.rotate(rot); c.translate(0, 140)
    running = speed > 150; moving = speed > 8
    sw = 0.95 if running else 0.5
    lean = 0.17 if running else 0.0
    bob = 0.0
    # angles: (cuisse, genou) x2 ; (bras, coude) x2
    if moving:
        p = phase
        fa, ba = sw * math.sin(p), -sw * math.sin(p)
        fk = -(0.12 + (1.0 if running else .75) * max(0, math.cos(p)))
        bk = -(0.12 + (1.0 if running else .75) * max(0, -math.cos(p)))
        ua = (-0.7 if running else -.42) * math.sin(p); ub = -ua
        ue = .5 + (.8 if running else .1) * max(0, math.cos(p)); be = .5 + (.8 if running else .1) * max(0, -math.cos(p))
        bob = -abs(math.cos(p)) * (7 if running else 4)
        fq = (fa, fk, ba, bk, ua, ue, ub, be)
    else:
        br = math.sin(t * 2.2) * 0.02
        fq = (0.03, -0.02, -0.03, -0.02, 0.06 + br, 0.12, -0.05 + br, 0.12)
    fa, fk, ba, bk, ua, ue, ub, be = fq
    hip = (0, -140 + bob); sh = (0, -236 + bob)
    arms = {'f': (ua, ue), 'b': (ub, be)}
    hold = None; lean2 = lean
    if pose == 'phone_ear':
        arms['f'] = (0.55, 2.45 if False else 2.2); hold = 'ear'
    elif pose == 'phone_look':
        arms['f'] = (0.75, 1.55); arms['b'] = (0.55, 1.45); hold = 'look'
    elif pose == 'point':
        arms['f'] = (1.35, 0.1)
    elif pose == 'push':
        arms['f'] = (1.45, 0.05); arms['b'] = (1.4, 0.05); lean2 = 0.25
    elif pose == 'aim':
        arms['f'] = (1.5, 0.0); hold = 'gun'
    elif pose == 'hands_up':
        arms['f'] = (2.4, 0.3); arms['b'] = (2.5, 0.3)
    elif pose == 'type':
        arms['f'] = (0.9, 1.0 + .08 * math.sin(t * 14)); arms['b'] = (0.85, 1.1 + .08 * math.sin(t * 14 + 1)); lean2 = .12
    elif pose == 'talk':
        g = math.sin(t * 5.0)
        arms['f'] = (0.7 + .3 * g, 1.1 + .4 * math.sin(t * 5 + 1)); arms['b'] = (0.05, 0.15)
    elif pose == 'inspect':
        lean2 = 0.4; arms['f'] = (0.9, 0.5); arms['b'] = (0.7, 0.6)
    elif pose == 'cross':
        arms['f'] = (0.5, 2.1); arms['b'] = (0.4, 2.0)
    elif pose == 'flail':
        arms['f'] = (2.2 + .6 * math.sin(t * 18), .4); arms['b'] = (-2.0 + .6 * math.sin(t * 18 + 2), .4)
        fa, ba = 0.5 * math.sin(t * 16), -0.5 * math.sin(t * 16)
    elif pose == 'crouch':
        fa, ba, fk, bk = 0.9, 0.9, -1.7, -1.7; hip = (0, -92); sh = (0, -188); lean2 = .3
    elif pose == 'lying':
        arms['f'] = (0.2, 0.1); arms['b'] = (-0.2, 0.1)
    elif pose == 'sad':
        lean2 = .12; arms['f'] = (0.05, .1); arms['b'] = (-0.05, .1)
    # --- jambes ---
    lw = 22
    def leg(a, k, col):
        kx, ky = hip[0] + math.sin(a) * 70, hip[1] + math.cos(a) * 70
        fx, fy = limb(c, hip[0], hip[1], a, 70, a + k, 68, lw, col)
        c.set_source_rgb(*shoe); c.save(); c.translate(fx, fy + 2); c.rotate(a + k)
        rrect(c, -8, -4, 32, 12, 6); c.fill(); c.restore()
    leg(ba, bk, tuple(v * .8 for v in bot)); 
    dress = sp['kind'] == 'dress'
    if sp['kind'] == 'hood':
        pass
    else:
        leg(fa, fk, bot)
    # --- haut du corps ---
    c.save()
    c.translate(*hip); c.rotate(lean2); c.translate(-hip[0], -hip[1])
    shx, shy = 0, sh[1]
    def arm(key, col):
        a, e = arms[key]
        ex, ey = limb(c, 0, shy + 8, a, 48, a + e, 44, 17, col, skin if sp['kind'] != 'hood' else col, 11)
        return ex, ey
    sleeve = top if sp['kind'] not in ('dress',) else skin
    if sp['kind'] == 'dress': sleeve = skin
    arm('b', tuple(v * .8 for v in sleeve))
    kind = sp['kind']
    if kind == 'dress':
        poly(c, [(-22, shy), (22, shy), (18, hip[1]), (-18, hip[1])], top)
        poly(c, [(-18, hip[1] - 4), (18, hip[1] - 4), (36 + 4 * math.sin(t * 2), -62), (-34, -62)], top)
        if sp.get('gold'):
            c.set_source_rgb(*_col('#d8a64a', amb)); c.set_line_width(4)
            c.move_to(-20, shy + 2); c.line_to(20, shy + 2); c.stroke()
    elif kind == 'coat':
        fl = 6 * math.sin(phase) if moving else 2 * math.sin(t * 2)
        poly(c, [(-23, shy), (23, shy), (21, hip[1]), (28 + fl, -78), (-28 + fl, -78), (-21, hip[1])], top)
        c.set_source_rgb(*[v * .7 for v in top]); c.set_line_width(3); c.move_to(0, shy + 2); c.line_to(0, -80); c.stroke()
    elif kind == 'suit':
        poly(c, [(-24, shy), (24, shy), (20, hip[1] + 10), (-20, hip[1] + 10)], top)
        poly(c, [(-5, shy), (5, shy), (3, shy + 70), (-3, shy + 70)], _col('#8a1d2b', amb))
        poly(c, [(-5, shy), (5, shy), (0, shy + 16)], _col('#e8e8ee', amb))
    elif kind == 'hood':
        fl = 7 * math.sin(phase) if moving else 2 * math.sin(t * 1.5)
        poly(c, [(-26, shy - 6), (26, shy - 6), (34 + fl, -14), (-36 + fl, -14)], top)
    else:
        poly(c, [(-23, shy), (23, shy), (19, hip[1]), (-19, hip[1])], top)
        if kind == 'hoodie':
            poly(c, [(-14, shy - 3), (14, shy - 3), (11, shy + 38), (-11, shy + 38)], tuple(v * .8 for v in top))
        if kind == 'jacket':
            c.set_source_rgb(*[v * .7 for v in top]); c.set_line_width(3); c.move_to(0, shy + 2); c.line_to(0, hip[1]); c.stroke()
            poly(c, [(-8, shy), (0, shy + 22), (-14, shy + 8)], tuple(v * .75 for v in top))
    # cou + tête
    nec = shy - 10
    c.set_source_rgb(*skin); c.set_line_width(12); c.set_line_cap(cairo.LINE_CAP_ROUND)
    c.move_to(0, shy); c.line_to(0, nec - 8); c.stroke()
    hy = shy - 40
    if kind == 'hood':
        c.set_source_rgb(*top); c.arc(0, hy, 31, 0, 6.2832); c.fill()
        c.set_source_rgb(0, 0, 0); c.save(); c.translate(7, hy + 2); c.scale(.8, 1); c.arc(0, 0, 21, 0, 6.2832); c.fill(); c.restore()
        c.set_source_rgba(.85, .95, 1, .8); c.arc(15, hy - 2, 2.4, 0, 6.2832); c.fill()
    else:
        hair = _col({'afro': '#14100d', 'gray': '#b9b6b0', 'bun': '#120e0c', 'braids': '#1a120e', 'bald': '#8a8a8a',
                     'short': '#15110e', 'none': '#000', 'cap': '#1b2235'}[sp['hair']], amb)
        if sp['hair'] == 'afro':
            c.set_source_rgb(*hair); c.arc(-3, hy - 6, 31, 0, 6.2832); c.fill()
        elif sp['hair'] == 'bun':
            c.set_source_rgb(*hair); c.arc(-14, hy - 22, 12, 0, 6.2832); c.fill()
        elif sp['hair'] == 'braids':
            c.set_source_rgb(*hair)
            for i in range(5):
                c.set_line_width(7); c.move_to(-14 + i * 3, hy - 14); c.line_to(-26 + i * 4 - 2 * math.sin(t * 2 + i), hy + 40 + i * 4); c.stroke()
        c.set_source_rgb(*skin); c.save(); c.translate(0, hy); c.scale(.92, 1.06); c.arc(0, 0, 25, 0, 6.2832); c.fill(); c.restore()
        if sp['hair'] in ('short', 'gray', 'bald', 'afro', 'bun', 'braids'):
            c.set_source_rgb(*hair)
            c.arc(-3, hy - 3, 25.5, 3.4, 5.9); c.arc(0, hy, 22, 5.9, 3.4, ) if False else None
            c.close_path(); c.fill()
        if sp['hair'] == 'cap':
            c.set_source_rgb(*hair); c.arc(0, hy - 6, 26, 3.14, 6.28); c.fill(); rect(c, 6, hy - 10, 30, 7, hair)
        c.set_source_rgb(.04, .03, .03); c.arc(10, hy - 2, 2.4, 0, 6.2832); c.fill()        # oeil
        if sp.get('beard'):
            c.set_source_rgb(*_col('#c4c1ba', amb)); c.arc(4, hy + 8, 17, .2, 2.9); c.fill()
        if sp.get('glasses'):
            c.set_source_rgb(.05, .05, .06); c.set_line_width(2.5); c.arc(11, hy - 2, 8, 0, 6.2832); c.stroke()
            c.move_to(3, hy - 2); c.line_to(-20, hy - 4); c.stroke()
    f = (0, 0)
    ex, ey = arm('f', sleeve if kind != 'dress' else skin)
    if hold == 'look':
        rrect(c, ex - 4, ey - 24, 11, 26, 3); c.set_source_rgb(.04, .05, .07); c.fill()
        glow(c, ex + 10, ey - 14, 70, (.55, .9, 1), .55)
        c.save(); c.translate(0, 0); glow(c, 18, hy + 4, 46, (.5, .85, 1), .25); c.restore()
    elif hold == 'ear':
        rrect(c, ex - 5, ey - 16, 10, 24, 3); c.set_source_rgb(.04, .05, .07); c.fill()
        glow(c, ex, ey, 40, (.55, .9, 1), .5)
    elif hold == 'gun':
        c.set_source_rgb(.05, .05, .06); c.set_line_width(7); c.move_to(ex, ey); c.line_to(ex + 26, ey - 3); c.stroke()
        c.set_line_width(8); c.move_to(ex + 2, ey); c.line_to(ex + 4, ey + 12); c.stroke()
    c.restore()
    c.restore()

def stride(speed, sc=1.0):
    return (216 if speed > 150 else 132) * sc
