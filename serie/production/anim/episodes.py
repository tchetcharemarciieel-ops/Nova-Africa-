import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from runtime import Scene, render_video

def P(who, t0, t1, text): return (t0, t1, who, text)
def A(ch, kf, poses=None, **k): return dict(ch=ch, kf=kf, poses=poses or [(0, 'idle')], **k)

# =========================== ÉPISODE 1 ===========================
def ep1():
    S = []
    # accroche : le meurtre
    S.append(Scene(('lagoon', {'deck': True}), 13.5, loc=('ABIDJAN', 'Lagune Ébrié — 23h47'), mood='dark', cam=(1.05, 1.16, 300),
        actors=[
          A('nadege', [(0, 250), (2.4, 330), (4.5, 330), (7.5, 330), (8.6, 440), (9.0, 500, -8, .5), (9.4, 545, 40, 1.4), (9.9, 575, 140, 2.2), (10.4, 590, 260, 2.6)],
            [(0, 'idle'), (1.0, 'phone_ear'), (4.3, 'idle'), (7.6, 'flail'), (8.6, 'flail')], scale=1.2),
          A('courtier', [(0, -140), (5.0, -140), (6.2, 110), (7.6, 255), (8.4, 300), (9.4, 300), (12, 300)],
            [(0, 'idle'), (7.4, 'push'), (8.3, 'push'), (9.2, 'idle')], scale=1.2, face=1, vis=(5.0, 14)),
        ],
        subs=[P('Nadège', 1.2, 4.2, "Amara, si tu écoutes ça… ne fais confiance à personne chez NOVA."),
              P('Nadège', 4.3, 6.3, "Pas même à moi."),
              P(None, 10.6, 13, "Quelqu'un voulait qu'elle se taise.")],
        overlays=[dict(type='punch', t0=11.2, t1=13.4, text='À 23h52,\nNADÈGE OKOYE\nSE TAIT.', size=62, color='#e5383b', y=380, dim=.35)],
        fx=[('splash', 9.9, 586, 930), ('flash', 8.5, .12, '#ffffff'), ('shake', 8.45, 8.9, 6), ('shake', 9.9, 10.3, 7)],
        sfx=[('whoosh', 6.0), ('boom', 8.45), ('splash', 9.95), ('buzz', 1.0), ('riser', 5.5, 2.8)]))
    S.append(Scene(('void', {}), 4.2, mood='dark', cut=False, overlays=[dict(type='title', t0=0.2, t1=4.1, text='NOVA', sub='SAISON 1 · ÉPISODE 1 — LA VEILLE', sub2='Une série où TU décides')],
        sfx=[('boom', .3)]))
    # Dakar : réception du message
    S.append(Scene(('newsroom', {}), 11, loc=('DAKAR', 'Rédaction du Quotidien — 7h12'), mood='calm',
        actors=[A('amara', [(0, 150), (3.2, 330), (4.5, 330)], [(0, 'idle'), (4.0, 'phone_look'), (7.5, 'talk')], scale=1.2),
                A('redac', [(0, 760), (5.2, 760), (7.2, 520), (11, 520)], [(0, 'idle'), (8.0, 'talk')], scale=1.2, face=-1),
                A('extra', [(0, 640), (11, 640)], y=-8, scale=.95, face=-1, poses=[(0, 'type')])],
        overlays=[dict(type='phone', t0=4.3, t1=8.2, who='N. (message vocal)', msgs=[(4.5, '🎙 0:14 — « Amara, si tu écoutes ça… »', 'l'), (6.2, 'Envoyé à 23h47', 'l')], red=False)],
        subs=[P('Le rédacteur', 8.4, 10.5, "Ce n'est pas ton dossier, Amara.")],
        sfx=[('buzz', 3.8), ('ding', 4.5)]))
    S.append(Scene(('newsroom', {}), 7, mood='tense', cam=(1.05, 1.2, 300), actors=[
        A('amara', [(0, 330)], [(0, 'point')], scale=1.3), A('redac', [(0, 610)], [(0, 'cross')], scale=1.3, face=-1)],
        subs=[P('Amara', .4, 3.6, "Elle m'a écrit avant de mourir. C'est mon dossier."),
              ],
        overlays=[dict(type='punch', t0=4.2, t1=6.9, text='QUI A REÇU\nL’AUTRE MESSAGE ?', size=60, color='#ffd166', y=420, dim=.55)],
        fx=[('redpulse', 4.2, 6.9)], sfx=[('riser', 3.6, 2.0), ('boom', 4.2)]))
    # Abidjan : la clé USB
    S.append(Scene(('dawn', {'police': True}), 12, loc=('ABIDJAN', 'Lagune — scène de crime — 6h30'), mood='tense',
        actors=[A('police', [(0, 330), (12, 330)], poses=[(0, 'idle')], scale=1.1, face=-1),
                A('kofi', [(0, -80), (4.2, 440), (6.5, 500)], [(0, 'idle'), (6.3, 'inspect')], scale=1.25),
                A('police', [(0, 690), (12, 690)], y=-6, scale=1.05, face=-1, poses=[(0, 'cross')])],
        subs=[P('Inspecteur Kofi', 7.0, 9.2, "Une clé USB… dans la doublure de sa robe."),
              P('Inspecteur Kofi', 9.3, 11.8, "Quelqu'un voulait qu'on la trouve.")],
        sfx=[('whoosh', 3.0)]))
    # Dakar : MENACE
    S.append(Scene(('street', {'rain': True}), 11, loc=('DAKAR', 'Quartier Médina — 21h47'), mood='tense',
        actors=[A('amara', [(0, 60), (6.5, 330), (7.2, 330)], [(0, 'idle'), (6.6, 'phone_look')], scale=1.25),
                A('extra', [(0, 740), (10, -60)], y=-30, scale=.9), A('extraw', [(0, -50), (11, 760)], y=-24, scale=.85)],
        overlays=[dict(type='phone', t0=6.8, t1=11, who='Numéro inconnu', red=True,
                       msgs=[(7.0, "On sait où habite ta sœur Fatou.", 'l'), (8.3, "Elle sort du lycée à 17h.", 'l'), (9.6, "Rentre. Maintenant.", 'l')])],
        sfx=[('buzz', 6.5), ('boom', 7.0), ('type', 8.0, 1.0)], rain=True))
    # Fatou
    S.append(Scene(('street', {'rain': False, 'seed': 6}), 7, mood='tense',
        actors=[A('fatou', [(0, 100), (4.5, 380)], scale=1.2), A('courtier', [(0, -160), (7, 150)], y=-4, scale=1.2, face=1)],
        subs=[P(None, .3, 3.3, "Fatou, 17 ans, rentre du lycée."), P(None, 3.6, 6.6, "Quelqu'un la suit.")],
        fx=[('redpulse', 3.5, 6.8)], sfx=[('riser', 3.4, 3.0)]))
    S.append(Scene(('void', {'a': '#120406', 'b': '#2a0b10'}), 10, mood='end',
        overlays=[dict(type='vote', t0=0.3, t1=9.8, q='Que doit faire Amara ?', a='Elle continue l’enquête malgré la menace', b='Elle rentre protéger sa famille')],
        sfx=[('boom', .3), ('ding', 1.0)]))
    return S

def ep2a():
    S = []
    S.append(Scene(('void', {}), 5, mood='dark', overlays=[dict(type='title', t0=.2, t1=4.8, text='NOVA', sub='ÉPISODE 2 — LE REGISTRE', sub2='Le public a voté : elle fait confiance à Karim')], sfx=[('boom', .3)]))
    S.append(Scene(('apartment', {'palette': 'blue'}), 13, loc=('DAKAR', 'Appartement d’Amara — 23h05'), mood='tense',
        actors=[A('amara', [(0, 200), (3, 300)], [(0, 'idle'), (4, 'talk')], scale=1.25), A('karim', [(0, -120), (3.6, 520)], [(0, 'idle'), (6, 'type')], scale=1.25, face=1)],
        subs=[P('Karim', 6, 8.5, "Tu me fais confiance. Je ne le mérite peut-être pas."), P('Amara', 8.7, 10.3, "Alors mérite-le."), P('Karim', 10.5, 12.8, "L'ancien Hôtel de la Monnaie…")],
        overlays=[dict(type='clue', t0=4.6, t1=6.3, head='INDICE 01', text='« Cherchez où l’on compte les billets avant qu’ils ne soient des chiffres. »')],
        sfx=[('ding', 4.6)]))
    S.append(Scene(('dawn', {'cranes': True, 'police': False}), 10, loc=('DAKAR', 'Port — 6h02'), mood='calm',
        actors=[A('kofi', [(0, -100), (6, 380)], scale=1.25), A('amara', [(0, 760), (5, 560)], scale=1.25, face=-1), A('karim', [(0, 820), (5, 650)], scale=1.25, face=-1)],
        subs=[P('Kofi', 6.2, 9.6, "Il parle trop vite pour quelqu'un qui n'a rien à cacher.")]))
    S.append(Scene(('monnaie', {}), 14, loc=('DAKAR', 'Ancien Hôtel de la Monnaie'), mood='tense',
        actors=[A('amara', [(0, -80), (3, 220), (14, 220)], [(0, 'idle'), (6, 'inspect')], scale=1.25), A('kofi', [(0, -180), (3.4, 380)], [(0, 'idle'), (7, 'inspect'), (10, 'talk')], scale=1.25),
                A('karim', [(0, -260), (4.0, 540)], [(0, 'idle'), (11, 'hands_up')], scale=1.25, face=1)],
        subs=[P(None, 6.5, 9, "Sous la dalle : 14 · 07 · 3."), P('Kofi', 9.2, 12.0, "Un traceur GPS. Quelqu'un nous suit."), P('Karim', 12.2, 13.9, "Ce n'est pas moi. Je le jure.")],
        overlays=[dict(type='clue', t0=7.0, t1=9.1, head='INDICE 02', text='14  ·  07  ·  3')],
        sfx=[('ding', 7.0), ('boom', 10.0)]))
    S.append(Scene(('rooftop', {'dakar': True}), 13, loc=('DAKAR', 'Terrasse — 1h12'), mood='end',
        actors=[A('karim', [(0, 520), (13, 520)], [(0, 'sad'), (3, 'phone_look')], scale=1.3, face=-1), A('amara', [(0, -100), (5, 140), (13, 190)], scale=1.3)],
        overlays=[dict(type='phone', t0=3, t1=7, who='C.', red=True, msgs=[(3.4, "Elle a la clé.", 'r'), (4.6, "Elle ne sait rien.", 'r')]),
                  dict(type='punch', t0=9.8, t1=12.8, text='QUI EST « C. » ?', size=70, color='#e5383b', y=430)],
        subs=[P('Amara', 7.5, 9.5, "Tu écris à qui, Karim ?")], fx=[('redpulse', 9.8, 12.8)], sfx=[('type', 3.2, 1.5), ('boom', 9.8), ('riser', 7.5, 2.2)]))
    S.append(Scene(('void', {'a': '#120406', 'b': '#2a0b10'}), 10, mood='end',
        overlays=[dict(type='vote', t0=.3, t1=9.8, q='Amara croit-elle Karim ?', a='Elle lui laisse une dernière chance', b='Elle le met dehors et enquête sur lui')], sfx=[('boom', .3)]))
    return S

def ep2b():
    S = []
    S.append(Scene(('void', {}), 5, mood='dark', overlays=[dict(type='title', t0=.2, t1=4.8, text='NOVA', sub='ÉPISODE 2 — LE REGISTRE', sub2='Le public a voté : elle cache la clé')], sfx=[('boom', .3)]))
    S.append(Scene(('apartment', {'palette': 'blue'}), 10, loc=('DAKAR', 'Appartement d’Amara — 23h05'), mood='tense',
        actors=[A('amara', [(0, 260)], [(0, 'idle'), (4, 'cross')], scale=1.25), A('karim', [(0, 520)], [(0, 'talk')], scale=1.25, face=-1)],
        subs=[P('Karim', 1, 3.5, "Tu me caches quelque chose."), P('Amara', 4, 7, "Tout le monde cache quelque chose, ces jours-ci."), P(None, 7.3, 9.6, "Elle a glissé la clé dans sa veste.")], sfx=[('boom', 7.3)]))
    S.append(Scene(('street', {'seed': 12}), 9, loc=('DAKAR', 'Plateau — 6h40'), mood='calm',
        actors=[A('kofi', [(0, 520), (9, 520)], [(0, 'cross')], scale=1.25, face=-1), A('amara', [(0, -100), (4, 330)], scale=1.25),
                A('extra', [(0, 760), (9, -40)], y=-30, scale=.9)],
        subs=[P('Kofi', 4.6, 7, "Les billets, je connais. Je suis comptable judiciaire."), P('Amara', 7.1, 8.8, "Karim ne doit rien savoir.")]))
    S.append(Scene(('monnaie', {}), 15, loc=('DAKAR', 'Ancien Hôtel de la Monnaie'), mood='tense',
        actors=[A('amara', [(0, -80), (3, 240)], [(0, 'idle'), (6, 'inspect'), (10, 'sad')], scale=1.25), A('kofi', [(0, -180), (3.4, 420)], [(0, 'idle'), (7, 'inspect')], scale=1.25)],
        subs=[P(None, 6.2, 8.5, "Une deuxième clé. Et une photo."), P('Amara', 9.5, 12.5, "C'est moi. À quatre ans. Avec Nadège."), P(None, 12.7, 14.8, "« Pour Amara, si je ne peux plus te protéger. »")],
        overlays=[dict(type='clue', t0=6.4, t1=9.4, head='INDICE 02', text='Une photo : Nadège et une petite fille. Au dos : « Pour Amara. »')], sfx=[('ding', 6.4), ('boom', 12.7)]))
    S.append(Scene(('monnaie', {}), 8, mood='chase',
        actors=[A('karim', [(0, 800), (1.2, 560)], [(0, 'hands_up')], scale=1.25, face=-1), A('kofi', [(0, 420)], [(0, 'aim')], scale=1.25, face=1), A('amara', [(0, 240), (3.5, 240), (4, 180, 0, 0)], [(0, 'sad'), (3.5, 'crouch')], scale=1.25)],
        subs=[P('Karim', .6, 2.8, "Baissez ça ! Je viens la sauver."), P('Amara', 3, 4.2, "Qui « ils » ?")],
        fx=[('flash', 4.4, .1), ('shake', 4.4, 5.2, 9), ('redpulse', 4.4, 8)], sfx=[('shot', 4.4), ('glass', 4.5)],
        overlays=[dict(type='punch', t0=5.0, t1=7.8, text='UN TIR.', size=84, color='#e5383b', y=430, dim=.45)]))
    S.append(Scene(('street', {'seed': 3, 'rain': True}), 11, mood='end', loc=('DAKAR', 'Ruelle — 7h02'),
        actors=[A('kofi', [(0, 420)], [(0, 'phone_look')], scale=1.3, face=-1), A('amara', [(0, 250)], [(0, 'point')], scale=1.3)],
        overlays=[dict(type='phone', t0=.5, t1=4.5, who='Le Courtier', red=True, msgs=[(.9, "Dis-lui qui elle est vraiment.", 'l'), (2.4, "Ou je le fais.", 'l')]),
                  dict(type='punch', t0=7.0, t1=10.8, text='QUI EST VRAIMENT\nAMARA ?', size=66, color='#ffd166', y=400)],
        subs=[P('Amara', 4.8, 6.8, "Kofi. Qu'est-ce que tu me caches ?")], sfx=[('buzz', .3), ('boom', 7.0), ('riser', 4.8, 2.0)], rain=True))
    S.append(Scene(('void', {'a': '#120406', 'b': '#2a0b10'}), 10, mood='end',
        overlays=[dict(type='vote', t0=.3, t1=9.8, q='Amara fait-elle confiance à Kofi ?', a='Elle exige la vérité tout de suite', b='Elle fait semblant de rien et le surveille')], sfx=[('boom', .3)]))
    return S

def trailer():
    S = []
    S.append(Scene(('lagoon', {'deck': True}), 6, mood='dark', cam=(1.05, 1.15, 300),
        actors=[A('nadege', [(0, 330)], [(0, 'phone_ear')], scale=1.25)], overlays=[dict(type='punch', t0=.5, t1=5.8, text='Elle a découvert\nce qu’on cachait.', size=56, color='#ffffff', y=300, dim=.25)]))
    S.append(Scene(('office', {}), 5, mood='tense', actors=[A('lea', [(0, 260), (4, 420)], scale=1.25)],
        overlays=[dict(type='punch', t0=.4, t1=4.8, text='Une monnaie\npour tout changer.', size=56, y=300, dim=.3)]))
    S.append(Scene(('street', {'rain': True}), 6, mood='chase', actors=[A('amara', [(0, -80), (6, 800)], scale=1.25), A('karim', [(0, -240), (6, 640)], scale=1.25), A('courtier', [(0, -360), (6, 560)], scale=1.25)],
        overlays=[dict(type='punch', t0=.4, t1=5.8, text='Sa famille est menacée.\nSon amour, suspect.', size=48, color='#e5383b', y=300, dim=.3)], rain=True, sfx=[('whoosh', 1)]))
    S.append(Scene(('rooftop', {}), 5, mood='end', actors=[A('courtier', [(0, 360)], [(0, 'phone_ear')], scale=1.3)],
        overlays=[dict(type='punch', t0=.3, t1=4.8, text='Et c’est TOI\nqui décides.', size=66, color='#ffd166', y=330, dim=.35)], sfx=[('boom', .3)]))
    S.append(Scene(('void', {}), 6, mood='end', overlays=[dict(type='title', t0=.2, t1=5.8, text='NOVA', sub='LA SÉRIE INTERACTIVE · ÉPISODE 1 BIENTÔT', sub2='Abonne-toi pour voter')], sfx=[('boom', .3)]))
    return S

JOBS = {'nova_ep01': (ep1, 'NOVA · S1 · ÉP.1 « LA VEILLE »'), 'nova_ep02_A': (ep2a, 'NOVA · S1 · ÉP.2 · BRANCHE A'),
        'nova_ep02_B': (ep2b, 'NOVA · S1 · ÉP.2 · BRANCHE B'), 'nova_bande_annonce': (trailer, 'NOVA · LA SÉRIE INTERACTIVE')}

if __name__ == '__main__':
    out = os.path.join(os.path.dirname(__file__), '..', '..', 'videos'); os.makedirs(out, exist_ok=True)
    args = sys.argv[1:]
    if args and args[0] == '--still':     # --still job scene t
        fn, tag = JOBS[args[1]]; render_video(args[4] if len(args) > 4 else '/tmp/still.png', fn(), tag, still=(int(args[2]), float(args[3])))
    else:
        for k in (args or JOBS):
            fn, tag = JOBS[k]; render_video(os.path.join(out, k + '.mp4'), fn(), tag)
