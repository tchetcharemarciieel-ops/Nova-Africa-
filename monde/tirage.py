#!/usr/bin/env python3
"""Tirage au sort dans la Plateforme : python3 tirage.py abonnes.txt   (un pseudo par ligne)
Chaque nouvel abonné tombe dans un secteur au hasard (secrets = vrai aléatoire).
1er du secteur = président, 2e = premier ministre, 3e et 4e = militaires, ensuite citoyens.
Met à jour state.json et affiche qui est où."""
import json, secrets, sys, os
import plateforme as P
here = os.path.dirname(os.path.abspath(__file__))
sf = f"{here}/state.json"
st = json.load(open(sf))
sect = st.setdefault("secteurs", {})
for i in range(P.N):
    sect.setdefault(str(i + 1), {"ressource": P.sector_info(i), "budget": 1000, "membres": []})
ROLES = ["président", "premier ministre", "militaire", "militaire"]
deja = {m["pseudo"] for s in sect.values() for m in s["membres"]}
rng = secrets.SystemRandom()
for l in open(sys.argv[1], encoding="utf-8"):
    n = l.strip().lstrip("@")
    if not n: continue
    if n in deja:
        print(f"{n}: déjà dans un secteur"); continue
    k = str(rng.randrange(1, P.N + 1))
    s = sect[k]
    role = ROLES[len(s["membres"])] if len(s["membres"]) < len(ROLES) else "citoyen"
    s["membres"].append({"pseudo": n, "role": role}); deja.add(n)
    print(f"@{n} -> secteur {k} ({s['ressource']}, {s['budget']} €) : {role}")
json.dump(st, open(sf, "w"), ensure_ascii=False, indent=1)
