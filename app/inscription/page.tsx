"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icone from "@/components/Icone";
import { moi } from "@/lib/session";

export default function Inscription() {
  const router = useRouter();
  useEffect(() => { moi().then(m => { if (m) router.replace("/moi"); }).catch(() => {}); }, [router]);
  return (
    <main className="page auth">
      <section className="carte"><div className="in"><h1>Créer mon compte</h1><p className="lead" style={{ marginBottom: 0 }}>Choisis ton parcours. Il n&apos;y a pas de mot de passe : ton compte est lié à ce téléphone, et tu reçois un code pour le retrouver ailleurs.</p></div></section>
      <section className="carte menu">
        <Link href="/inscription-candidat" className="choix-carte"><span className="menu-ico" style={{ background: "#EEF2FF", color: "#4F46E5" }}><Icone nom="carte" taille={24} /></span><span><b>Professionnel / Candidat</b><small>Chercher un emploi, publier mes réalisations en photos, créer ma carte pro.</small></span></Link>
        <Link href="/inscription-entreprise" className="choix-carte"><span className="menu-ico" style={{ background: "#EEF4FF", color: "#1D4ED8" }}><Icone nom="batiment" taille={24} /></span><span><b>Entreprise / ONG</b><small>Recruter, publier des offres d&apos;emploi, obtenir le badge Entreprise vérifiée.</small></span></Link>
      </section>
      <p className="lien-bas">Tu as déjà un compte ? <Link href="/connexion">Se connecter</Link></p>
    </main>
  );
}
