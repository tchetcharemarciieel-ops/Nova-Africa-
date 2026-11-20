"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ChampPhoto from "@/components/ChampPhoto";
import { Erreur } from "@/components/Blocs";
import { api, messageErreur } from "@/lib/api";
import { LIEUX, METIERS, normalizePhone } from "@/lib/constants";
import type { Image } from "@/lib/image";
import { assurerMoi, moi } from "@/lib/session";

export default function InscriptionCandidat() {
  const router = useRouter();
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [photo, setPhoto] = useState<Image | null>(null);
  const [nom, setNom] = useState("");
  useEffect(() => { moi().then(m => { if (m) router.replace("/moi"); }).catch(() => {}); }, [router]);

  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const n = String(f.get("nom") || "").trim().slice(0, 60);
    const lieu = String(f.get("lieu") || ""), metier = String(f.get("metier") || "");
    const tel = normalizePhone(String(f.get("telephone") || ""));
    if (n.length < 2) return setErreur("Écris ton nom complet (2 lettres au moins).");
    if (!(LIEUX as readonly string[]).includes(lieu)) return setErreur("Choisis ton quartier ou ta ville.");
    if (!(METIERS as readonly string[]).includes(metier)) return setErreur("Choisis ton métier principal.");
    if (tel === "invalide") return setErreur("Ce numéro WhatsApp n'est pas valide, ou laisse le champ vide.");
    if (f.get("ok") !== "on") return setErreur("Coche la case pour confirmer que tu as lu les conditions.");
    setErreur(""); setEnvoi(true);
    try {
      const { secret } = await assurerMoi(n);
      await api.createProfile(secret, n, metier, lieu, "", ["Français"], tel);
      if (photo) { try { await api.setPhoto(secret, photo.data, photo.thumb); } catch { /* la photo pourra être ajoutée plus tard */ } }
      router.push("/moi?bienvenue=1");
    } catch (err) { setErreur(messageErreur(err)); setEnvoi(false); }
  }
  return (
    <main className="page auth"><section className="carte form"><div className="in">
      <h1>Inscription Professionnel / Candidat</h1>
      <p className="lead">Crée ta carte pro en deux minutes. Pas de mot de passe : à la fin, tu reçois ton code de sécurité.</p>
      <form onSubmit={envoyer} noValidate>
        <ChampPhoto avatar etiquette="Photo de profil (facultatif)" nom={nom} valeur={photo} onChange={setPhoto} />
        <label htmlFor="nom">Nom complet</label><input id="nom" name="nom" autoComplete="name" maxLength={60} placeholder="Ex. Joseph Ngaïkosset" value={nom} onChange={e => setNom(e.target.value)} />
        <label htmlFor="lieu">Quartier ou ville</label><select id="lieu" name="lieu" defaultValue=""><option value="" disabled>Choisir…</option>{LIEUX.map(x => <option key={x}>{x}</option>)}</select>
        <label htmlFor="metier">Métier principal</label><select id="metier" name="metier" defaultValue=""><option value="" disabled>Choisir…</option>{METIERS.map(m => <option key={m}>{m}</option>)}</select>
        <label htmlFor="telephone">Numéro WhatsApp (facultatif)</label><input id="telephone" name="telephone" type="tel" inputMode="tel" autoComplete="tel" placeholder="70 12 34 56" />
        <p className="mute petit" style={{ marginTop: 6 }}>Il reste caché de ta carte : tu pourras le montrer plus tard si tu veux.</p>
        <label className="case"><input type="checkbox" name="ok" /><span>J&apos;ai lu les <Link href="/cgu">conditions d&apos;utilisation</Link> et la <Link href="/confidentialite">politique de confidentialité</Link>.</span></label>
        {erreur && <Erreur texte={erreur} />}
        <p style={{ marginTop: 16 }}><button className="btn plein bloc" type="submit" disabled={envoi}>{envoi ? "Création…" : "Créer ma carte pro"}</button></p>
        <p className="lien-bas">Tu es une entreprise ou une ONG ? <Link href="/inscription-entreprise">Inscription Entreprise</Link></p>
        <p className="lien-bas" style={{ marginTop: 8 }}>Tu as déjà un compte ? <Link href="/connexion">Se connecter</Link></p>
      </form>
    </div></section></main>
  );
}
