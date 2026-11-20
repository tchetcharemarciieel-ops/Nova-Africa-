"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ChampPhoto from "@/components/ChampPhoto";
import { Erreur } from "@/components/Blocs";
import { api, messageErreur } from "@/lib/api";
import { LIEUX, SECTEURS, normalizePhone } from "@/lib/constants";
import type { Image } from "@/lib/image";
import { assurerMoi, moi } from "@/lib/session";

export default function InscriptionEntreprise() {
  const router = useRouter();
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [logo, setLogo] = useState<Image | null>(null);
  const [nom, setNom] = useState("");
  useEffect(() => { moi().then(m => { if (m) router.replace("/moi"); }).catch(() => {}); }, [router]);

  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) || "").trim();
    const n = v("nom").slice(0, 80), secteur = v("secteur"), lieu = v("lieu");
    const rccm = v("rccm").slice(0, 40), nif = v("nif").slice(0, 40), rhNom = v("rh_nom").slice(0, 60);
    const tel = normalizePhone(v("rh_tel"));
    if (n.length < 2) return setErreur("Écris le nom de l'entreprise ou de l'organisation.");
    if (!(SECTEURS as readonly string[]).includes(secteur)) return setErreur("Choisis le secteur d'activité.");
    if (!(LIEUX as readonly string[]).includes(lieu)) return setErreur("Choisis l'arrondissement ou la ville.");
    if (rccm.length < 4) return setErreur("Écris le numéro RCCM (4 caractères au moins).");
    if (nif.length < 4) return setErreur("Écris le numéro NIF, ou le numéro d'agrément pour une ONG.");
    if (rhNom.length < 2) return setErreur("Écris le nom du responsable RH.");
    if (!tel || tel === "invalide") return setErreur("Écris un numéro WhatsApp valide pour le responsable RH, par exemple 70 12 34 56.");
    if (f.get("ok") !== "on") return setErreur("Coche la case pour confirmer l'exactitude des informations et la lecture des conditions.");
    setErreur(""); setEnvoi(true);
    try {
      const { secret } = await assurerMoi(n);
      await api.orgRegister(secret, { nom: n, secteur, lieu, adresse: v("adresse").slice(0, 120), apropos: v("apropos").slice(0, 400), logo: logo?.data ?? null, logoMini: logo?.thumb ?? null, rccm, nif, rhNom, rhTel: tel });
      router.push("/moi?bienvenue=1");
    } catch (err) { setErreur(messageErreur(err)); setEnvoi(false); }
  }
  return (
    <main className="page auth"><section className="carte form"><div className="in">
      <h1>Inscription Entreprise / ONG</h1>
      <p className="lead">Après l&apos;inscription, ta page est <b>« En attente de vérification »</b>. Elle passe au badge bleu <b>« Entreprise vérifiée »</b> quand nous avons contrôlé tes documents. <Link href="/verification">Voir les règles de vérification</Link>.</p>
      <form onSubmit={envoyer} noValidate>
        <ChampPhoto avatar carre etiquette="Logo (facultatif)" nom={nom} valeur={logo} onChange={setLogo} />
        <label htmlFor="nom">Nom de l&apos;entreprise ou de l&apos;organisation</label><input id="nom" name="nom" maxLength={80} autoComplete="organization" value={nom} onChange={e => setNom(e.target.value)} />
        <label htmlFor="secteur">Secteur d&apos;activité</label><select id="secteur" name="secteur" defaultValue=""><option value="" disabled>Choisir…</option>{SECTEURS.map(x => <option key={x}>{x}</option>)}</select>
        <label htmlFor="lieu">Arrondissement ou ville</label><select id="lieu" name="lieu" defaultValue=""><option value="" disabled>Choisir…</option>{LIEUX.map(x => <option key={x}>{x}</option>)}</select>
        <label htmlFor="adresse">Adresse (facultatif)</label><input id="adresse" name="adresse" maxLength={120} placeholder="Rue, repère" autoComplete="street-address" />
        <label htmlFor="apropos">Présentation (facultatif)</label><textarea id="apropos" name="apropos" maxLength={400} placeholder="Ce que fait votre structure, en quelques phrases." />
        <h2 style={{ fontSize: 17, margin: "22px 0 0" }}>Informations légales (obligatoires)</h2>
        <p className="mute petit">Elles servent seulement à la vérification. Elles ne sont <b>jamais affichées</b> publiquement.</p>
        <label htmlFor="rccm">Numéro RCCM</label><input id="rccm" name="rccm" maxLength={40} placeholder="Ex. CA/BG/2026A0000" autoCapitalize="characters" />
        <label htmlFor="nif">Numéro NIF ou agrément ONG</label><input id="nif" name="nif" maxLength={40} autoCapitalize="characters" />
        <label htmlFor="rh_nom">Nom du responsable RH</label><input id="rh_nom" name="rh_nom" maxLength={60} autoComplete="name" />
        <label htmlFor="rh_tel">Téléphone WhatsApp du responsable RH</label><input id="rh_tel" name="rh_tel" type="tel" inputMode="tel" placeholder="70 12 34 56" />
        <label className="case"><input type="checkbox" name="ok" /><span>Je confirme que ces informations sont exactes, et j&apos;ai lu les <Link href="/cgu">conditions d&apos;utilisation</Link> (aucune fausse offre d&apos;emploi) et la <Link href="/confidentialite">confidentialité</Link>.</span></label>
        {erreur && <Erreur texte={erreur} />}
        <p style={{ marginTop: 16 }}><button className="btn plein bloc" type="submit" disabled={envoi}>{envoi ? "Envoi…" : "Envoyer ma demande"}</button></p>
        <p className="lien-bas">Tu es un professionnel ou un candidat ? <Link href="/inscription-candidat">Inscription Professionnel</Link></p>
      </form>
    </div></section></main>
  );
}
