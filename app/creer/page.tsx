"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chargement, Erreur } from "@/components/Blocs";
import { LANGUES, LIEUX, METIERS, normalizePhone } from "@/lib/constants";
import { api, messageErreur, type Me } from "@/lib/api";
import { assurerMoi, moi } from "@/lib/session";

export default function Creer() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  useEffect(() => { moi().then(setMe).catch(() => setMe(null)); }, []);

  if (me === undefined) return <main className="page"><Chargement /></main>;
  if (me?.slug) return (
    <main className="page"><section className="carte"><div className="in">
      <h1>Ma carte pro</h1><p className="lead">Tu as déjà une carte sur ce téléphone.</p>
      <div className="lignes"><Link className="btn plein" href={`/p/${me.slug}`}>Voir ma carte</Link><Link className="btn" href="/messages">Mes messages</Link></div>
    </div></section></main>
  );

  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const nom = String(f.get("nom") || "").trim().slice(0, 60);
    const metier = String(f.get("metier") || "");
    const lieu = String(f.get("lieu") || "");
    const apropos = String(f.get("apropos") || "").trim().slice(0, 300);
    const langues = f.getAll("langues").map(String).filter(x => (LANGUES as readonly string[]).includes(x));
    const montrer = f.get("montrer") === "on";
    const tel = normalizePhone(String(f.get("telephone") || ""));
    if (nom.length < 2) return setErreur("Écris ton nom (au moins 2 lettres).");
    if (!(METIERS as readonly string[]).includes(metier)) return setErreur("Choisis ton métier.");
    if (!(LIEUX as readonly string[]).includes(lieu)) return setErreur("Choisis où tu travailles.");
    if (montrer && (!tel || tel === "invalide")) return setErreur("Écris un numéro valide, par exemple 70 12 34 56, ou décoche « Montrer mon numéro ».");
    setErreur(""); setEnvoi(true);
    try {
      const { secret } = await assurerMoi(nom);
      const slug = await api.createProfile(secret, nom, metier, lieu, apropos, langues, montrer ? tel : null);
      router.push(`/p/${slug}?nouveau=1`);
    } catch (err) { setErreur(messageErreur(err)); setEnvoi(false); }
  }

  return (
    <main className="page"><section className="carte"><div className="in">
      <h1>Ma carte pro</h1>
      <p className="lead">Deux minutes. Pas de mot de passe : ta carte est liée à ce téléphone.</p>
      <form onSubmit={envoyer} noValidate>
        <label htmlFor="nom">Ton nom</label><input id="nom" name="nom" autoComplete="name" maxLength={60} placeholder="Ex. Joseph Ngaïkosset" />
        <label htmlFor="metier">Ton métier</label><select id="metier" name="metier" defaultValue=""><option value="" disabled>Choisir…</option>{METIERS.map(m => <option key={m}>{m}</option>)}</select>
        <label htmlFor="lieu">Où tu travailles</label><select id="lieu" name="lieu" defaultValue=""><option value="" disabled>Choisir…</option>{LIEUX.map(x => <option key={x}>{x}</option>)}</select>
        <label htmlFor="apropos">Ce que tu sais faire (20 lettres ou plus pour passer au niveau 2)</label>
        <textarea id="apropos" name="apropos" maxLength={300} placeholder="Ex. 8 ans d'expérience, travaux de plomberie et de salle de bain." />
        <label>Langues</label>
        <div className="checks">{LANGUES.map(x => <label key={x}><input type="checkbox" name="langues" value={x} defaultChecked={x === "Français"} /> {x}</label>)}</div>
        <div className="checks" style={{ marginTop: 8 }}><label><input type="checkbox" name="montrer" /> Montrer mon numéro WhatsApp sur ma carte (facultatif)</label></div>
        <label htmlFor="telephone">Numéro WhatsApp (facultatif)</label><input id="telephone" name="telephone" type="tel" inputMode="tel" autoComplete="tel" placeholder="70 12 34 56" />
        <p className="mute petit" style={{ marginTop: 6 }}>Les clients t&apos;écrivent dans l&apos;application. Ton numéro reste caché sauf si tu coches la case : alors un bouton WhatsApp apparaît sur ta carte.</p>
        {erreur && <Erreur texte={erreur} />}
        <p style={{ marginTop: 18 }}><button className="btn plein bloc" type="submit" disabled={envoi}>{envoi ? "Création…" : "Créer ma carte"}</button></p>
      </form>
    </div></section></main>
  );
}
