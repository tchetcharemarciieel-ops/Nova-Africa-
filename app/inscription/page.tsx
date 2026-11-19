"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Erreur } from "@/components/Blocs";
import { messageErreur } from "@/lib/api";
import { assurerMoi, moi } from "@/lib/session";

export default function Inscription() {
  const router = useRouter();
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  useEffect(() => { moi().then(m => { if (m) router.replace("/moi"); }).catch(() => {}); }, [router]);

  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const nom = String(f.get("nom") || "").trim().slice(0, 60);
    if (nom.length < 2) return setErreur("Écris ton nom (2 lettres au moins).");
    if (f.get("ok") !== "on") return setErreur("Coche la case pour confirmer que tu as lu les conditions.");
    setErreur(""); setEnvoi(true);
    try { await assurerMoi(nom); router.push("/moi?bienvenue=1"); }
    catch (err) { setErreur(messageErreur(err)); setEnvoi(false); }
  }
  return (
    <main className="page auth"><section className="carte form"><div className="in">
      <h1>Créer mon compte</h1>
      <p className="lead">Une minute, sans mot de passe. Ton compte est lié à ce téléphone, et tu reçois un code pour le retrouver ailleurs.</p>
      <form onSubmit={envoyer} noValidate>
        <label htmlFor="nom">Ton nom</label><input id="nom" name="nom" autoComplete="name" maxLength={60} placeholder="Ex. Joseph Ngaïkosset" />
        <label className="case"><input type="checkbox" name="ok" /><span>J&apos;ai lu la page <Link href="/a-propos">À propos et confidentialité</Link> (version de test).</span></label>
        {erreur && <Erreur texte={erreur} />}
        <p style={{ marginTop: 16 }}><button className="btn plein bloc" type="submit" disabled={envoi}>{envoi ? "Création…" : "Créer mon compte"}</button></p>
        <p className="lien-bas">Tu as déjà un compte ? <Link href="/connexion">Se connecter</Link></p>
      </form>
    </div></section></main>
  );
}
