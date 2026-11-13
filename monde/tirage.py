#!/usr/bin/env python3
"""Tirage au sort des pays : python3 tirage.py abonnes.txt
abonnes.txt = un pseudo par ligne. Chaque abonné reçoit un pays libre, au hasard
(secrets = vrai aléatoire). Met à jour state.json (presidents + owners) et affiche le résultat."""
import json, secrets, sys, os
here = os.path.dirname(os.path.abspath(__file__))
geo = json.load(open(f"{here}/data/countries.geojson"))
allc = sorted(f["properties"]["NAME"] for f in geo["features"])
sf = f"{here}/state.json"
st = json.load(open(sf))
st.setdefault("presidents", {}); st.setdefault("owners", [])
libres = [c for c in allc if c not in st["owners"]]
noms = [l.strip().lstrip("@") for l in open(sys.argv[1], encoding="utf-8") if l.strip()]
rng = secrets.SystemRandom()
rng.shuffle(libres)
for n in noms:
    if n in st["presidents"]:
        print(f"{n}: déjà président de {st['presidents'][n]}"); continue
    if not libres:
        print("Plus de pays libre"); break
    c = libres.pop(); st["presidents"][n] = c; st["owners"].append(c)
    print(f"@{n} -> {c}")
json.dump(st, open(sf, "w"), ensure_ascii=False, indent=1)
