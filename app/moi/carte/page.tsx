"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chargement, Erreur } from "@/components/Blocs";
import { LANGUES, LIEUX, METIERS, normalizePhone } from "@/lib/constants";
import { api, messageErreur, type Profil } from "@/lib/api";
import { moi, secretExistant } from "@/lib/session";

export default function ModifierCarte() {
  const router = useRouter();
  const [p, setP] = useState<Profil | null | undefined>(undefined);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  useEffect(() => { moi().then(async m => setP(m?.slug ? await api.getProfile(m.slug) : null)).catch(() => setP(null)); }, []);

  if (p === undefined) return <main className="page"><Chargement /></main>;
  if (p === null) return <main className="page"><section className="carte"><div className="in"><h1>Modifier ma carte</h1><p className="lead">Tu n&apos;as pas encore de carte.</p><Link className="btn plein" href="/creer">Créer ma carte pro</Link></div></section></main>;
  const carte = p;

  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const nom = String(f.get("nom") || "").trim().slice(0, 60);
    const metier = String(f.get("metier") || ""), lieu = String(f.get("lieu") || "");
    const apropos = String(f.get("apropos") || "").trim().slice(0, 300);
    const langues = f.getAll("langues").map(String).filter(x => (LANGUES as readonly string[]).includes(x));
    const montrer = f.get("montrer") === "on";
    const tel = normalizePhone(String(f.get("telephone") || ""));
    if (nom.length < 2) return setErreur("Écris ton nom (au moins 2 lettres).");
    if (!(METIERS as readonly string[]).includes(metier)) return setErreur("Choisis ton métier.");
    if (!(LIEUX as readonly string[]).includes(lieu)) return setErreur("Choisis où tu travailles.");
    if (montrer && (!tel || tel === "invalide")) return setErreur("Écris un numéro valide, par exemple 70 12 34 56, ou décoche « Montrer mon numéro ».");
    setErreur(""); setEnvoi(true);
    try { await api.updateProfile(secretExistant() || "", nom, metier, lieu, apropos, langues, montrer ? tel : null); router.push(`/p/${carte.slug}`); }
    catch (err) { setErreur(messageErreur(err)); setEnvoi(false); }
  }
  return (
    <main className="page"><section className="carte"><div className="in">
      <h1>Modifier ma carte</h1>
      <form onSubmit={envoyer} noValidate>
        <label htmlFor="nom">Ton nom</label><input id="nom" name="nom" defaultValue={carte.nom} maxLength={60} />
        <label htmlFor="metier">Ton métier</label><select id="metier" name="metier" defaultValue={carte.metier}>{METIERS.map(m => <option key={m}>{m}</option>)}</select>
        <label htmlFor="lieu">Où tu travailles</label><select id="lieu" name="lieu" defaultValue={carte.lieu}>{LIEUX.map(x => <option key={x}>{x}</option>)}</select>
        <label htmlFor="apropos">Ce que tu sais faire</label><textarea id="apropos" name="apropos" maxLength={300} defaultValue={carte.apropos} />
        <label>Langues</label>
        <div className="checks">{LANGUES.map(x => <label key={x}><input type="checkbox" name="langues" value={x} defaultChecked={carte.langues.includes(x)} /> {x}</label>)}</div>
        <div className="checks" style={{ marginTop: 8 }}><label><input type="checkbox" name="montrer" defaultChecked={!!carte.telephone} /> Montrer mon numéro sur ma carte</label></div>
        <label htmlFor="telephone">Numéro de téléphone</label><input id="telephone" name="telephone" type="tel" inputMode="tel" defaultValue={carte.telephone ? carte.telephone.replace(/^236/, "") : ""} placeholder="70 12 34 56" />
        {erreur && <Erreur texte={erreur} />}
        <p style={{ marginTop: 18 }}><button className="btn plein bloc" type="submit" disabled={envoi}>{envoi ? "Enregistrement…" : "Enregistrer"}</button></p>
      </form>
    </div></section></main>
  );
}
