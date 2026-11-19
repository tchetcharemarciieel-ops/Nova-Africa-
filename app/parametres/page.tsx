"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chargement } from "@/components/Blocs";
import LigneMenu from "@/components/LigneMenu";
import type { Me } from "@/lib/api";
import { deconnecter, formaterCode, moi, secretExistant } from "@/lib/session";

export default function Parametres() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [code, setCode] = useState("");
  const [copie, setCopie] = useState(false);
  const [quitter, setQuitter] = useState(false);
  useEffect(() => { moi().then(setMe).catch(() => setMe(null)); }, []);

  if (me === undefined) return <main className="page"><Chargement /></main>;
  if (me === null) return <main className="page"><section className="carte"><div className="in"><h1>Paramètres</h1><p className="lead">Tu n&apos;es pas connecté(e).</p><div className="lignes"><Link className="btn plein" href="/inscription">Créer mon compte</Link><Link className="btn" href="/connexion">Se connecter</Link></div></div></section></main>;

  return (
    <main className="page">
      <section className="carte"><div className="in"><h1>Paramètres</h1><p className="mute">Compte de <b>{me.nom}</b></p></div></section>

      <section className="carte"><div className="in">
        <h2>Mon code de connexion</h2>
        <p className="mute" style={{ marginBottom: 10 }}>Ce code te permet de retrouver ton compte sur un autre téléphone, ou si tu perds celui-ci. Note-le dans un endroit sûr.</p>
        {!code ? <button className="btn" type="button" onClick={() => setCode(secretExistant() || "")}>Afficher mon code</button> : <>
          <p aria-label="Mon code de connexion" style={{ fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontSize: 15, background: "#f3f2ef", border: "1px solid var(--line)", borderRadius: 8, padding: 12, wordBreak: "break-word", lineHeight: 1.7 }}>{formaterCode(code)}</p>
          <div className="lignes" style={{ marginTop: 10 }}>
            <button className="btn plein" type="button" onClick={async () => { try { await navigator.clipboard.writeText(formaterCode(code)); setCopie(true); } catch { setCopie(false); } }}>{copie ? "Code copié" : "Copier le code"}</button>
            <button className="btn" type="button" onClick={() => { setCode(""); setCopie(false); }}>Cacher</button>
          </div>
        </>}
        <p className="info" style={{ marginTop: 12 }}><b>Attention :</b> ce code donne accès à ton compte. Ne le donne à personne, même à quelqu&apos;un qui dit travailler pour Kargora.</p>
      </div></section>

      <section className="carte"><div className="in">
        <h2>Utiliser un autre téléphone</h2>
        <p className="mute">Sur l&apos;autre téléphone, ouvre Kargora, choisis <b>Se connecter</b> et entre ton code de connexion.</p>
      </div></section>

      <section className="carte"><div className="in">
        <h2>Quitter ce téléphone</h2>
        <p className="mute" style={{ marginBottom: 10 }}>Efface ton compte de ce téléphone. Il reste dans Kargora : tu le retrouves avec ton code.</p>
        {!quitter ? <button className="btn" type="button" onClick={() => setQuitter(true)}>Quitter ce téléphone</button> : <>
          <p className="err" style={{ marginTop: 0 }}>Sans ton code de connexion, tu ne pourras plus retrouver ton compte. Es-tu sûr(e) ?</p>
          <div className="lignes" style={{ marginTop: 10 }}>
            <button className="btn plein" type="button" onClick={() => { deconnecter(); router.replace("/"); }}>Oui, quitter</button>
            <button className="btn" type="button" onClick={() => setQuitter(false)}>Annuler</button>
          </div>
        </>}
      </div></section>

      <section className="carte menu">
        <LigneMenu href="/a-propos" icone="bouclier" teinte="ambre" titre="À propos et confidentialité" sous="Version de test de Kargora" />
      </section>
    </main>
  );
}
