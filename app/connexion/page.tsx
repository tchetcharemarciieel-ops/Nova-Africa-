"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Erreur } from "@/components/Blocs";
import { messageErreur } from "@/lib/api";
import { seConnecter } from "@/lib/session";

export default function Connexion() {
  const router = useRouter();
  const [profil, setProfil] = useState<"candidat" | "entreprise">("candidat");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = String(new FormData(e.currentTarget).get("code") || "");
    setErreur(""); setEnvoi(true);
    try {
      const me = await seConnecter(code);
      router.push(profil === "entreprise" && me.org_slug ? `/e/${me.org_slug}` : "/moi");
    } catch (err) { setErreur(messageErreur(err)); setEnvoi(false); }
  }
  return (
    <main className="page auth"><section className="carte form"><div className="in">
      <h1>Se connecter</h1>
      <p className="lead">Choisis ton profil, puis entre ton code de connexion. Tu le trouves dans <b>Paramètres</b> sur ton ancien téléphone.</p>
      <form onSubmit={envoyer} noValidate>
        <div className="chips" role="radiogroup" aria-label="Type de profil" style={{ paddingBottom: 0 }}>
          <button type="button" role="radio" aria-checked={profil === "candidat"} className={`chip${profil === "candidat" ? " on" : ""}`} onClick={() => setProfil("candidat")}>Professionnel / Candidat</button>
          <button type="button" role="radio" aria-checked={profil === "entreprise"} className={`chip${profil === "entreprise" ? " on" : ""}`} onClick={() => setProfil("entreprise")}>Entreprise / ONG</button>
        </div>
        <label htmlFor="code">Mon code de connexion</label>
        <textarea id="code" name="code" rows={3} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="Colle ou écris ton code" />
        <p className="mute petit" style={{ marginTop: 6 }}>Connexion par numéro de téléphone : bientôt. Elle demandera un code envoyé par SMS pour que personne ne puisse prendre ta place.</p>
        {erreur && <Erreur texte={erreur} />}
        <p style={{ marginTop: 16 }}><button className="btn plein bloc" type="submit" disabled={envoi}>{envoi ? "Connexion…" : "Se connecter"}</button></p>
        <p className="lien-bas">Pas encore de compte ? <Link href="/inscription">Créer mon compte</Link></p>
      </form>
    </div></section></main>
  );
}
