import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from runtime import Scene, render_video

def P(who, t0, t1, text): return (t0, t1, who, text)
def A(ch, kf, poses=None, **k): return dict(ch=ch, kf=kf, poses=poses or [(0, 'idle')], **k)
def punch(t0, t1, text, size=52, color='#ffffff', y=420, dim=.5): return dict(type='punch', t0=t0, t1=t1, text=text, size=size, color=color, y=y, dim=dim)
def phone(t0, t1, who, msgs, red=False): return dict(type='phone', t0=t0, t1=t1, who=who, msgs=msgs, red=red)
def clue(t0, t1, head, text): return dict(type='clue', t0=t0, t1=t1, head=head, text=text)
def vote(q, a, b, dur=7): return Scene(('void', {'a': '#120406', 'b': '#2a0b10'}), dur, mood='end', fade=False,
        overlays=[dict(type='vote', t0=.2, t1=dur - .2, q=q, a=a, b=b)], sfx=[('boom', .2), ('ding', 1.0)]) if False else \
        Scene(('void', {'a': '#120406', 'b': '#2a0b10'}), dur, mood='end', overlays=[dict(type='vote', t0=.2, t1=dur - .2, q=q, a=a, b=b)], sfx=[('boom', .2), ('ding', 1.0)])
def recap(text, dur=3.0): return Scene(('void', {}), dur, mood='dark', overlays=[punch(.1, dur - .1, text, 50, '#ffd166', 520, .1)], sfx=[('boom', .1)])
def title(sub, sub2='', dur=2.6): return Scene(('void', {}), dur, mood='dark', overlays=[dict(type='title', t0=.1, t1=dur - .1, text='NOVA', sub=sub, sub2=sub2)], sfx=[('boom', .1)])
CLOSE = lambda x, z0=1.6, z1=1.85: (z0, z1, x, 600)

# =========================== ÉPISODE 1 — LA VEILLE ===========================
def ep1():
    S = []
    S.append(Scene(('lagoon', {'deck': True}), 3.4, loc=('ABIDJAN', 'Lagune — 23h47'), mood='dark', cam=CLOSE(330, 1.5, 1.8),
        actors=[A('nadege', [(0, 330)], [(0, 'phone_ear')], scale=1.2)],
        subs=[P('Nadège, PDG de NOVA', .3, 3.2, "Amara… si tu m'entends…")], overlays=[punch(.2, 3.2, "Dans 30 secondes,\nelle sera morte.", 46, '#e5383b', 470, .0)],
        sfx=[('buzz', .2), ('riser', .5, 2.8)]))
    S.append(Scene(('lagoon', {'deck': True}), 3.0, mood='dark', cam=(1.1, 1.25, 300, 700),
        actors=[A('nadege', [(0, 330)], [(0, 'phone_ear')], scale=1.2), A('courtier', [(0, 20), (3, 190)], scale=1.2, face=1)],
        subs=[P('Nadège', .2, 3, "Ne fais confiance à personne chez NOVA.")]))
    S.append(Scene(('lagoon', {'deck': True}), 2.2, mood='tense', cam=CLOSE(330, 1.7, 2.0),
        actors=[A('nadege', [(0, 330)], [(0, 'idle')], scale=1.2, face=-1), A('courtier', [(0, 150), (2.2, 260)], scale=1.2)],
        sfx=[('whoosh', .2)], fx=[('shake', 1.7, 2.2, 3)]))
    S.append(Scene(('lagoon', {'deck': True}), 3.6, mood='chase', cam=(1.05, 1.18, 340, 800),
        actors=[A('nadege', [(0, 330), (.4, 372), (.8, 440), (1.2, 500, -8, .5), (1.6, 545, 40, 1.4), (2.1, 575, 140, 2.2), (2.6, 590, 260, 2.6)],
                  [(0, 'flail')], scale=1.2),
                A('courtier', [(0, 250), (.4, 300)], [(0, 'push')], scale=1.2)],
        fx=[('flash', .38, .12, '#ffffff'), ('shake', .38, .8, 7), ('splash', 2.1, 586, 930), ('shake', 2.1, 2.5, 6)],
        sfx=[('boom', .38), ('splash', 2.15)]))
    S.append(Scene(('void', {}), 2.6, mood='dark', overlays=[punch(.1, 2.5, "NADÈGE OKOYE\nPDG DE NOVA\nASSASSINÉE", 56, '#e5383b', 430, .1)], sfx=[('boom', .1)]))
    S.append(title('SAISON 1 · ÉPISODE 1', 'La série où TU décides', 2.8))
    S.append(Scene(('newsroom', {}), 3.0, loc=('DAKAR', 'Le lendemain — 7h'), mood='tense', cam=(1.2, 1.4, 330, 650),
        actors=[A('amara', [(0, 60), (1.6, 330)], [(0, 'idle'), (2.0, 'phone_look')], scale=1.2)], sfx=[('buzz', 2.0)]))
    S.append(Scene(('newsroom', {}), 3.8, mood='tense', cam=CLOSE(330, 1.7, 2.0), actors=[A('amara', [(0, 330)], [(0, 'phone_look')], scale=1.2)],
        overlays=[phone(.1, 3.7, "Nadège (message vocal)", [(.3, "Amara, ne fais confiance à personne chez NOVA.", 'l'), (2.0, "Envoyé à 23h47 — hier soir", 'l')])], sfx=[('ding', .3)]))
    S.append(Scene(('newsroom', {}), 3.0, mood='tense', cam=(1.9, 2.0, 560, 250), actors=[A('amara', [(0, 330)], scale=1.2)],
        subs=[P(None, .2, 2.9, "Son amie Nadège est morte.")], fx=[('redpulse', 1.0, 3)], sfx=[('boom', .2)]))
    S.append(Scene(('street', {'rain': True}), 2.8, mood='chase', cam=(1.1, 1.2, 360, 800), loc=('DAKAR', 'Aéroport'),
        actors=[A('amara', [(0, -100), (2.8, 860)], scale=1.25)], subs=[P(None, .2, 2.7, "Elle part pour Abidjan.")], sfx=[('whoosh', .2)]))
    S.append(Scene(('dawn', {'police': True}), 3.6, loc=('ABIDJAN', 'Lagune — scène de crime'), mood='tense', cam=CLOSE(440, 1.5, 1.8),
        actors=[A('kofi', [(0, 440)], [(0, 'inspect')], scale=1.25), A('police', [(0, 640)], scale=1.1, face=-1)],
        subs=[P('Inspecteur Kofi', .3, 3.4, "Une clé USB… cachée dans sa robe.")], sfx=[('ding', .3)]))
    S.append(Scene(('apartment', {'door': True}), 4.0, loc=('ABIDJAN', 'Appartement de Nadège — 23h10'), mood='tense', cam=(1.2, 1.5, 360, 700),
        actors=[A('kofi', [(0, 250)], [(0, 'talk')], scale=1.25), A('amara', [(0, 470)], [(0, 'idle')], scale=1.25, face=-1)],
        subs=[P('Kofi', .2, 2.0, "Elle l'a laissée pour vous."), P('Amara', 2.1, 3.9, "Pourquoi moi ?")]))
    S.append(Scene(('apartment', {'door': True}), 3.0, mood='tense', cam=(1.1, 1.3, 360, 700),
        actors=[A('kofi', [(0, 250)], scale=1.25), A('amara', [(0, 470)], [(0, 'phone_look')], scale=1.25, face=-1)],
        overlays=[clue(.1, 2.9, 'INDICE 01', '« Cherchez où l’on compte les billets avant qu’ils ne soient des chiffres. »')], sfx=[('ding', .1)]))
    S.append(Scene(('street', {'rain': True, 'seed': 6}), 4.0, loc=('ABIDJAN', 'Cocody — 21h47'), mood='chase', cam=CLOSE(330, 1.5, 1.8),
        actors=[A('amara', [(0, 330)], [(0, 'phone_look')], scale=1.25)],
        overlays=[phone(.1, 3.9, 'Numéro inconnu', [(.3, "On sait où vit ta sœur Fatou.", 'l'), (1.7, "Elle sort du lycée à 17h.", 'l')], red=True)],
        sfx=[('buzz', .1), ('boom', .4), ('boom', 1.7)], fx=[('redpulse', 1.5, 4)], rain=True))
    S.append(Scene(('street', {'seed': 8}), 2.8, loc=('DAKAR', 'Lycée — 17h'), mood='chase', cam=(1.1, 1.25, 400, 800),
        actors=[A('fatou', [(0, 80), (2.8, 480)], scale=1.25), A('courtier', [(0, -120), (2.8, 300)], scale=1.25)],
        subs=[P(None, .2, 2.7, "Fatou, 17 ans. Quelqu'un la suit.")], fx=[('redpulse', 0, 2.8)], sfx=[('riser', .2, 2.5)]))
    S.append(Scene(('apartment', {}), 3.4, mood='tense', cam=CLOSE(330, 1.6, 1.9), actors=[A('amara', [(0, 330)], [(0, 'phone_look')], scale=1.25)],
        overlays=[phone(.1, 3.3, 'Karim ♥', [(.3, "Amara, où es-tu ?", 'l'), (1.5, "Arrête. Pour nous deux.", 'l')])], sfx=[('buzz', .1)]))
    S.append(Scene(('void', {'a': '#120406', 'b': '#2a0b10'}), 3.2, mood='end', overlays=[punch(.1, 3.1, "QUI EST LE COURTIER ?\nKARIM LE CONNAÎT-IL ?", 44, '#ffd166', 440, .0)], sfx=[('boom', .1)]))
    S.append(vote("Amara montre la clé USB à Karim ?", 'Oui, elle lui fait confiance', 'Non, elle la cache', 7))
    return S

# =========================== ÉPISODE 2 — BRANCHE A ===========================
def ep2a():
    S = [recap("ÉPISODE 2\nLE PUBLIC A VOTÉ :\nELLE MONTRE LA CLÉ\nÀ KARIM", 3.2)]
    S.append(Scene(('apartment', {}), 3.4, loc=('DAKAR', 'Appartement d’Amara'), mood='tense', cam=(1.2, 1.5, 360, 700),
        actors=[A('amara', [(0, 260)], [(0, 'talk')], scale=1.25), A('karim', [(0, 520)], scale=1.25, face=-1)],
        subs=[P('Amara', .2, 1.8, "Je te fais confiance."), P('Karim', 1.9, 3.3, "Je ne le mérite pas.")]))
    S.append(Scene(('apartment', {}), 3.0, mood='tense', cam=CLOSE(520, 1.6, 1.9), actors=[A('amara', [(0, 260)], scale=1.25), A('karim', [(0, 520)], [(0, 'phone_look')], scale=1.25, face=-1)],
        overlays=[clue(.1, 2.9, 'INDICE 01', '« Cherchez où l’on compte les billets… »')], sfx=[('ding', .1)]))
    S.append(Scene(('apartment', {}), 3.0, mood='tense', cam=CLOSE(520, 1.7, 2.0), actors=[A('karim', [(0, 520)], [(0, 'talk')], scale=1.25, face=-1)],
        subs=[P('Karim', .2, 2.9, "L'ancien Hôtel de la Monnaie !")]))
    S.append(Scene(('dawn', {'cranes': True, 'police': False}), 3.2, loc=('DAKAR', 'Port — 6h'), mood='calm', cam=(1.1, 1.3, 450, 750),
        actors=[A('kofi', [(0, -80), (1.6, 380)], scale=1.25), A('amara', [(0, 700)], scale=1.25, face=-1), A('karim', [(0, 790)], scale=1.25, face=-1)],
        subs=[P('Kofi', 1.7, 3.1, "Il parle trop vite.")]))
    S.append(Scene(('street', {'seed': 12}), 2.6, mood='chase', cam=(1.1, 1.2, 360, 800),
        actors=[A('amara', [(0, -100), (2.6, 820)], scale=1.25), A('kofi', [(0, -230), (2.6, 700)], scale=1.25), A('karim', [(0, -360), (2.6, 580)], scale=1.25)], sfx=[('whoosh', .1)]))
    S.append(Scene(('monnaie', {}), 3.6, loc=('DAKAR', 'Ancien Hôtel de la Monnaie'), mood='tense', cam=(1.2, 1.5, 300, 700),
        actors=[A('amara', [(0, 260)], [(0, 'inspect')], scale=1.25), A('kofi', [(0, 420)], [(0, 'inspect')], scale=1.25, face=-1)],
        overlays=[clue(1.0, 3.5, 'INDICE 02', '14 · 07 · 3')], sfx=[('ding', 1.0)]))
    S.append(Scene(('monnaie', {}), 2.8, mood='chase', cam=CLOSE(420, 1.7, 2.0), actors=[A('kofi', [(0, 420)], [(0, 'inspect')], scale=1.25, face=-1)],
        subs=[P('Kofi', .2, 2.7, "Un traceur GPS. On nous suit.")], sfx=[('boom', .2)], fx=[('redpulse', .3, 2.8)]))
    S.append(Scene(('monnaie', {}), 2.8, mood='chase', cam=(1.2, 1.4, 540, 700),
        actors=[A('kofi', [(0, 300)], [(0, 'point')], scale=1.25), A('karim', [(0, 560)], [(0, 'hands_up')], scale=1.25, face=-1), A('amara', [(0, 180)], scale=1.25)],
        subs=[P('Karim', .5, 2.7, "Ce n'est pas moi !")], sfx=[('boom', .1)]))
    S.append(Scene(('rooftop', {'dakar': True}), 3.6, loc=('DAKAR', 'Terrasse — 1h12'), mood='tense', cam=CLOSE(520, 1.6, 1.9),
        actors=[A('karim', [(0, 520)], [(0, 'phone_look')], scale=1.3, face=-1)],
        overlays=[phone(.1, 3.5, 'C.', [(.4, "Elle a la clé.", 'r'), (1.7, "Elle ne sait rien.", 'r')], red=True)], sfx=[('buzz', .1), ('type', .4, 1.5)]))
    S.append(Scene(('rooftop', {'dakar': True}), 3.4, mood='end', cam=(1.1, 1.3, 330, 750),
        actors=[A('karim', [(0, 540)], [(0, 'sad')], scale=1.3, face=-1), A('amara', [(0, 160), (1.8, 280)], scale=1.3)],
        subs=[P('Amara', 1.6, 3.2, "Tu écris à qui, Karim ?")], overlays=[punch(1.9, 3.4, "QUI EST « C. » ?", 54, '#e5383b', 330, .45)], sfx=[('boom', 1.9)], fx=[('redpulse', 1.9, 3.4)]))
    S.append(vote("Amara croit-elle Karim ?", 'Elle lui laisse une dernière chance', 'Elle le met dehors et enquête sur lui', 7))
    return S

# =========================== ÉPISODE 2 — BRANCHE B ===========================
def ep2b():
    S = [recap("ÉPISODE 2\nLE PUBLIC A VOTÉ :\nELLE CACHE\nLA CLÉ", 3.2)]
    S.append(Scene(('apartment', {}), 3.8, loc=('DAKAR', 'Appartement d’Amara'), mood='tense', cam=(1.2, 1.5, 360, 700),
        actors=[A('amara', [(0, 260)], [(0, 'cross')], scale=1.25), A('karim', [(0, 520)], [(0, 'talk')], scale=1.25, face=-1)],
        subs=[P('Karim', .2, 1.9, "Tu me caches quelque chose."), P('Amara', 2.0, 3.7, "Non. Rien du tout.")]))
    S.append(Scene(('apartment', {}), 2.4, mood='tense', cam=CLOSE(260, 1.8, 2.1), actors=[A('amara', [(0, 260)], [(0, 'idle')], scale=1.25)],
        subs=[P(None, .2, 2.3, "Elle glisse la clé dans sa veste.")], sfx=[('boom', .2)]))
    S.append(Scene(('street', {'seed': 12}), 3.2, loc=('DAKAR', 'Plateau — 6h40'), mood='calm', cam=(1.2, 1.4, 420, 750),
        actors=[A('kofi', [(0, 520)], [(0, 'talk')], scale=1.25, face=-1), A('amara', [(0, -80), (1.2, 330)], scale=1.25)],
        subs=[P('Kofi', 1.3, 3.1, "L'ancienne Monnaie. Allons-y.")]))
    S.append(Scene(('street', {'seed': 3}), 2.4, mood='chase', cam=(1.1, 1.2, 360, 800),
        actors=[A('amara', [(0, -100), (2.4, 820)], scale=1.25), A('kofi', [(0, -240), (2.4, 700)], scale=1.25)], sfx=[('whoosh', .1)]))
    S.append(Scene(('monnaie', {}), 3.8, loc=('DAKAR', 'Ancien Hôtel de la Monnaie'), mood='tense', cam=(1.2, 1.5, 300, 700),
        actors=[A('amara', [(0, 240)], [(0, 'inspect')], scale=1.25), A('kofi', [(0, 420)], [(0, 'inspect')], scale=1.25, face=-1)],
        overlays=[clue(1.0, 3.7, 'INDICE 02', 'Une photo de Nadège avec une petite fille.')], sfx=[('ding', 1.0)]))
    S.append(Scene(('monnaie', {}), 3.4, mood='tense', cam=CLOSE(240, 1.7, 2.0), actors=[A('amara', [(0, 240)], [(0, 'sad')], scale=1.25)],
        subs=[P('Amara', .2, 1.9, "C'est moi. À quatre ans."), P('Amara', 2.0, 3.3, "Avec Nadège.")], sfx=[('boom', .2)]))
    S.append(Scene(('monnaie', {}), 3.0, mood='chase', cam=(1.2, 1.4, 500, 700),
        actors=[A('karim', [(0, 800), (.7, 590)], [(0, 'hands_up')], scale=1.25, face=-1), A('kofi', [(0, 420)], [(0, 'aim')], scale=1.25), A('amara', [(0, 240)], scale=1.25)],
        subs=[P('Karim', .8, 2.9, "Baissez ça ! Je viens la sauver.")], sfx=[('boom', .6)]))
    S.append(Scene(('monnaie', {}), 2.8, mood='chase', cam=(1.1, 1.3, 400, 750),
        actors=[A('karim', [(0, 590)], [(0, 'hands_up')], scale=1.25, face=-1), A('kofi', [(0, 420)], [(0, 'aim')], scale=1.25), A('amara', [(0, 240), (.8, 200, 0, 0)], [(0, 'idle'), (.8, 'crouch')], scale=1.25)],
        fx=[('flash', .8, .12), ('shake', .8, 1.6, 10), ('redpulse', .8, 2.8)], sfx=[('shot', .8), ('glass', .9)], overlays=[punch(1.2, 2.7, "UN TIR.", 80, '#e5383b', 430, .45)]))
    S.append(Scene(('street', {'seed': 3, 'rain': True}), 2.8, mood='chase', cam=(1.1, 1.2, 360, 800),
        actors=[A('amara', [(0, -100), (2.8, 840)], scale=1.25), A('kofi', [(0, -230), (2.8, 720)], scale=1.25), A('karim', [(0, -360), (2.8, 600)], scale=1.25)], rain=True, sfx=[('whoosh', .1)]))
    S.append(Scene(('street', {'seed': 3, 'rain': True}), 3.6, loc=('DAKAR', 'Ruelle — 7h02'), mood='tense', cam=CLOSE(420, 1.6, 1.9),
        actors=[A('kofi', [(0, 420)], [(0, 'phone_look')], scale=1.3, face=-1)],
        overlays=[phone(.1, 3.5, 'Le Courtier', [(.4, "Dis-lui qui elle est vraiment.", 'l'), (1.8, "Ou je le fais.", 'l')], red=True)], sfx=[('buzz', .1)], rain=True))
    S.append(Scene(('street', {'seed': 3, 'rain': True}), 3.4, mood='end', cam=(1.2, 1.5, 330, 700),
        actors=[A('amara', [(0, 250)], [(0, 'point')], scale=1.3), A('kofi', [(0, 450)], [(0, 'idle')], scale=1.3, face=-1)], rain=True,
        subs=[P('Amara', .2, 1.7, "Kofi. Tu me caches quoi ?")], overlays=[punch(1.8, 3.4, "QUI EST VRAIMENT\nAMARA ?", 48, '#ffd166', 360, .5)], sfx=[('boom', 1.8)]))
    S.append(vote("Amara fait-elle confiance à Kofi ?", 'Elle exige la vérité tout de suite', 'Elle fait semblant de rien et le surveille', 7))
    return S

# =========================== BANDE-ANNONCE ===========================
def trailer():
    S = []
    S.append(Scene(('lagoon', {'deck': True}), 2.6, mood='dark', cam=CLOSE(330, 1.5, 1.8), actors=[A('nadege', [(0, 330)], [(0, 'phone_ear')], scale=1.2)],
        overlays=[punch(.1, 2.5, "Elle savait\nce qu'on cachait.", 46, '#ffffff', 300, .0)], sfx=[('riser', .1, 2.5)]))
    S.append(Scene(('lagoon', {'deck': True}), 2.2, mood='chase', cam=(1.05, 1.18, 340, 800),
        actors=[A('nadege', [(0, 330), (.4, 372), (.8, 440), (1.2, 500, -8, .5), (1.6, 545, 40, 1.4), (2.1, 575, 140, 2.2)], [(0, 'flail')], scale=1.2), A('courtier', [(0, 250), (.4, 300)], [(0, 'push')], scale=1.2)],
        fx=[('flash', .38, .12), ('shake', .38, .8, 7)], sfx=[('boom', .38), ('splash', 2.0)]))
    S.append(Scene(('office', {}), 2.4, mood='tense', cam=(1.2, 1.4, 340, 700), actors=[A('lea', [(0, 260), (2.4, 420)], scale=1.25)],
        overlays=[punch(.1, 2.3, "Une monnaie\npour tout changer.", 46, '#ffffff', 300, .3)]))
    S.append(Scene(('street', {'rain': True}), 2.4, mood='chase', cam=(1.1, 1.2, 360, 800), rain=True,
        actors=[A('amara', [(0, -100), (2.4, 840)], scale=1.25), A('karim', [(0, -240), (2.4, 700)], scale=1.25), A('courtier', [(0, -380), (2.4, 560)], scale=1.25)], sfx=[('whoosh', .1)]))
    S.append(Scene(('apartment', {}), 2.6, mood='tense', cam=CLOSE(330, 1.6, 1.9), actors=[A('amara', [(0, 330)], [(0, 'phone_look')], scale=1.25)],
        overlays=[phone(.1, 2.5, 'Numéro inconnu', [(.3, "On sait où vit ta sœur.", 'l')], red=True)], sfx=[('buzz', .1), ('boom', .4)]))
    S.append(Scene(('monnaie', {}), 2.4, mood='chase', cam=(1.2, 1.4, 500, 700), actors=[A('kofi', [(0, 420)], [(0, 'aim')], scale=1.25), A('karim', [(0, 590)], [(0, 'hands_up')], scale=1.25, face=-1)],
        fx=[('flash', 1.2, .12), ('shake', 1.2, 2, 9)], sfx=[('shot', 1.2)], overlays=[punch(.1, 1.1, "Sa famille.\nSon amour.", 46, '#e5383b', 300, .3)]))
    S.append(Scene(('rooftop', {}), 2.6, mood='end', cam=CLOSE(360, 1.5, 1.8), actors=[A('courtier', [(0, 360)], [(0, 'phone_ear')], scale=1.3)],
        overlays=[punch(.1, 2.5, "Et c'est TOI\nqui décides.", 54, '#ffd166', 300, .3)], sfx=[('boom', .1)]))
    S.append(Scene(('void', {}), 4.2, mood='end', overlays=[dict(type='title', t0=.1, t1=4.1, text='NOVA', sub='ÉPISODE 1 · BIENTÔT', sub2="Abonne-toi pour voter")], sfx=[('boom', .1)]))
    return S

JOBS = {'nova_ep01': (ep1, 'NOVA · S1 · ÉP.1 « LA VEILLE »'), 'nova_ep02_A': (ep2a, 'NOVA · S1 · ÉP.2 · BRANCHE A'),
        'nova_ep02_B': (ep2b, 'NOVA · S1 · ÉP.2 · BRANCHE B'), 'nova_bande_annonce': (trailer, 'NOVA · LA SÉRIE INTERACTIVE')}

if __name__ == '__main__':
    out = os.path.join(os.path.dirname(__file__), '..', '..', 'videos'); os.makedirs(out, exist_ok=True)
    args = sys.argv[1:]
    if args and args[0] == '--still':     # --still job scene t [fichier]
        fn, tag = JOBS[args[1]]; render_video(args[4] if len(args) > 4 else '/tmp/still.png', fn(), tag, still=(int(args[2]), float(args[3])))
    else:
        for k in (args or JOBS):
            fn, tag = JOBS[k]; render_video(os.path.join(out, k + '.mp4'), fn(), tag)
