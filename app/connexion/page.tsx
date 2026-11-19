"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Erreur } from "@/components/Blocs";
import { messageErreur } from "@/lib/api";
import { seConnecter } from "@/lib/session";

export default function Connexion() {
  const router = useRouter();
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = String(new FormData(e.currentTarget).get("code") || "");
    setErreur(""); setEnvoi(true);
    try { await seConnecter(code); router.push("/moi"); }
    catch (err) { setErreur(messageErreur(err)); setEnvoi(false); }
  }
  return (
    <main className="page auth"><section className="carte form"><div className="in">
      <h1>Se connecter</h1>
      <p className="lead">Entre ton code de connexion pour retrouver ton compte sur ce téléphone. Tu le trouves dans <b>Paramètres</b> sur ton ancien téléphone.</p>
      <form onSubmit={envoyer} noValidate>
        <label htmlFor="code">Mon code de connexion</label>
        <textarea id="code" name="code" rows={3} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="Colle ou écris ton code" />
        {erreur && <Erreur texte={erreur} />}
        <p style={{ marginTop: 16 }}><button className="btn plein bloc" type="submit" disabled={envoi}>{envoi ? "Connexion…" : "Se connecter"}</button></p>
        <p className="lien-bas">Pas encore de compte ? <Link href="/inscription">Créer mon compte</Link></p>
      </form>
    </div></section></main>
  );
}
