"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Avatar from "@/components/Avatar";
import Icone from "@/components/Icone";
import LigneMenu from "@/components/LigneMenu";
import { Chargement } from "@/components/Blocs";
import { api, type Me, type Profil } from "@/lib/api";
import { formaterCode, moi, secretExistant } from "@/lib/session";

function Contenu() {
  const bienvenue = useSearchParams().get("bienvenue") === "1";
  const [ferme, setFerme] = useState(false);
  const [copie, setCopie] = useState(false);
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [carte, setCarte] = useState<Profil | null>(null);
  useEffect(() => {
    moi().then(async m => { setMe(m); if (m?.slug) setCarte(await api.getProfile(m.slug).catch(() => null)); }).catch(() => setMe(null));
  }, []);

  if (me === undefined) return <main className="page"><Chargement /></main>;
  if (me === null) return (
    <main className="page"><section className="carte"><div className="in">
      <h1>Mon profil</h1><p className="lead">Tu n&apos;es pas connecté(e) sur ce téléphone.</p>
      <div className="lignes"><Link className="btn plein" href="/inscription">Créer mon compte</Link><Link className="btn" href="/connexion">Se connecter</Link></div>
    </div></section></main>
  );
  return (
    <main className="page">
      {bienvenue && !ferme && (
        <section className="code-carte" role="status">
          <h2>Compte créé.</h2>
          <p className="mute petit">Voici ton code de connexion. Garde-le : il te permet de retrouver ton compte si tu changes ou perds ton téléphone.</p>
          <p className="code" aria-label="Mon code de connexion">{formaterCode(secretExistant() || "")}</p>
          <div className="lignes">
            <button type="button" className="btn plein" onClick={async () => { try { await navigator.clipboard.writeText(formaterCode(secretExistant() || "")); setCopie(true); } catch { setCopie(false); } }}><Icone nom="copier" taille={18} />{copie ? "Code copié" : "Copier mon code"}</button>
            <a className="btn-wa" href={`https://wa.me/?text=${encodeURIComponent(`Mon code de connexion Kargora (à garder pour moi) : ${formaterCode(secretExistant() || "")}`)}`} target="_blank" rel="noopener noreferrer"><Icone nom="whatsapp" taille={18} />M&apos;envoyer mon code sur WhatsApp</a>
          </div>
          <p className="info" style={{ marginTop: 12, marginBottom: 12 }}><b>Important :</b> ce code donne accès à ton compte. Envoie-le seulement à toi-même (ta conversation « Moi » ou ton numéro), jamais à quelqu&apos;un d&apos;autre.</p>
          <button type="button" className="btn bloc" onClick={() => setFerme(true)}>J&apos;ai noté mon code</button>
        </section>
      )}
      <section className="carte"><div className="in profil-ligne">
        <Avatar nom={me.nom} photo={me.photo} carre={!!me.org_slug} taille={68} badge />
        <div style={{ minWidth: 0 }}><h1 style={{ margin: 0, fontSize: 22 }}>{me.nom}</h1><p className="mute petit">Compte sur ce téléphone</p><span className="statut"><span aria-hidden="true" />Actif</span></div>
      </div></section>

      {me.org_slug && (
        <section className="carte-pro">
          <span className="carte-pro-ico"><Icone nom="batiment" taille={26} trait={1.5} /></span>
          <h2>Ma page entreprise</h2>
          <p className="cp-txt">{me.org_statut === "verifiee" ? "Entreprise vérifiée (RCCM/NIF contrôlé)" : me.org_statut === "refusee" ? "Vérification refusée : écris-nous" : "En attente de vérification : nous contrôlons tes documents."}</p>
          <div className="lignes" style={{ marginTop: 14 }}><Link className="btn-blanc" href={`/e/${me.org_slug}`}>Voir ma page</Link><Link className="btn-fantome" href="/emplois/nouveau">Publier une offre</Link></div>
        </section>
      )}
      {!me.org_slug && <section className="carte-pro">
        <span className="carte-pro-ico"><Icone nom="carte" taille={26} trait={1.5} /></span>
        <h2>Ma carte pro</h2>
        {carte ? <>
          <p className="cp-txt"><b>{carte.metier}</b> · {carte.lieu}</p>
          <p className="cp-sous">{carte.chantiers} chantier{carte.chantiers > 1 ? "s" : ""} confirmé{carte.chantiers > 1 ? "s" : ""} · Niveau {carte.niveau}/4</p>
          <div className="lignes" style={{ marginTop: 14 }}><Link className="btn-blanc" href={`/p/${carte.slug}`}>Voir ma carte</Link><Link className="btn-fantome" href="/moi/carte">Modifier</Link></div>
        </> : <>
          <p className="cp-txt">Montre ton travail et fais-le confirmer par tes clients : c&apos;est ce qui donne confiance.</p>
          <div style={{ marginTop: 14 }}><Link className="btn-blanc" href="/inscription-candidat">Créer ma carte pro</Link></div>
        </>}
      </section>}

      <section className="carte menu">
        <LigneMenu href="/messages" icone="message" teinte="bleu" titre="Mes messages" sous="Conversations avec les professionnels et les clients" />
        <LigneMenu href="/publier" icone="publier" teinte="vert" titre="Publier" sous="Un besoin, une offre d'emploi" />
        <LigneMenu href="/parametres" icone="reglages" teinte="gris" titre="Paramètres" sous="Mon code de connexion, quitter ce téléphone" />
        <LigneMenu href="/a-propos" icone="bouclier" teinte="ambre" titre="À propos et confidentialité" sous="Mission, règles et données" />
      </section>
    </main>
  );
}
export default function Moi() { return <Suspense fallback={<main className="page"><Chargement /></main>}><Contenu /></Suspense>; }
