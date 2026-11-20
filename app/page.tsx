"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import Icone from "@/components/Icone";
import Lightbox from "@/components/Lightbox";
import Pied from "@/components/Pied";
import { ProLigne, Poste, Chargement, Erreur, EtatVide } from "@/components/Blocs";
import { api, messageErreur, type Besoin, type Chiffres, type Me, type Offre, type Publication, type Resume } from "@/lib/api";
import { CATEGORIES, LIEUX } from "@/lib/constants";
import { moi, secretExistant } from "@/lib/session";

type Cat = (typeof CATEGORIES)[number][0];

export default function Accueil() {
  const [pros, setPros] = useState<Resume[] | null>(null);
  const [besoins, setBesoins] = useState<Besoin[] | null>(null);
  const [offres, setOffres] = useState<Offre[] | null>(null);
  const [posts, setPosts] = useState<Publication[] | null>(null);
  const [chiffres, setChiffres] = useState<Chiffres | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [visiteur, setVisiteur] = useState(true);
  const [cat, setCat] = useState<Cat>("tout");
  const [lieu, setLieu] = useState("");
  const [erreur, setErreur] = useState("");
  const [grande, setGrande] = useState<Publication | null>(null);

  useEffect(() => {
    setVisiteur(!secretExistant());
    api.search("", "", 5).then(setPros).catch(e => { setPros([]); setErreur(messageErreur(e)); });
    api.listNeeds(30).then(setBesoins).catch(() => setBesoins([]));
    api.listJobs(30).then(setOffres).catch(() => setOffres([]));
    api.listPosts(20).then(setPosts).catch(() => setPosts([]));
    api.stats().then(setChiffres).catch(() => {});
    moi().then(setMe).catch(() => {});
  }, []);

  const fil = useMemo(() => {
    const ok = (l: string) => !lieu || l === lieu;
    const r = cat === "tout" || cat === "realisations" ? (posts ?? []).filter(x => ok(x.lieu)).map(x => ({ t: "r" as const, d: x.cree_le, x })) : [];
    const b = cat === "tout" || cat === "besoins" ? (besoins ?? []).filter(x => ok(x.lieu)).map(x => ({ t: "b" as const, d: x.cree_le, x })) : [];
    const o = cat === "tout" || cat === "offres" ? (offres ?? []).filter(x => ok(x.lieu)).map(x => ({ t: "o" as const, d: x.cree_le, x })) : [];
    return [...r, ...b, ...o].sort((p, q) => (q.d > p.d ? 1 : -1));
  }, [posts, besoins, offres, cat, lieu]);
  const charge = besoins !== null && offres !== null && posts !== null;
  const aChiffres = chiffres && (chiffres.profils > 0 || chiffres.offres > 0 || chiffres.chantiers > 0 || chiffres.entreprises > 0);

  return (
    <main className="page">
      <section className="hero-carte">
        <h1>Kargora</h1>
        <p>Le réseau professionnel de Centrafrique et de sa diaspora : montre ton travail, trouve des clients, recrute des personnes de confiance.</p>
        {aChiffres && chiffres && (
          <div className="chiffres" aria-label="Chiffres du réseau">
            <div><b>{chiffres.profils}</b><span>cartes pro</span></div>
            <div><b>{chiffres.offres}</b><span>offres</span></div>
            <div><b>{chiffres.chantiers}</b><span>chantiers confirmés</span></div>
          </div>
        )}
        {visiteur ? (
          <div className="hero-choix">
            <Link href="/inscription-candidat" className="pro"><Icone nom="carte" taille={26} trait={1.6} /><span>Je suis un Professionnel / Candidat<small>Chercher un emploi, publier mes réalisations, créer ma carte pro</small></span></Link>
            <Link href="/inscription-entreprise" className="ent"><Icone nom="batiment" taille={26} trait={1.6} /><span>Je suis une Entreprise / ONG<small>Recruter, publier des offres, obtenir le badge Entreprise vérifiée</small></span></Link>
            <p style={{ fontSize: 14.5, textAlign: "center" }}>Déjà un compte ? <Link href="/connexion" style={{ color: "#fff", fontWeight: 700 }}>Se connecter</Link></p>
          </div>
        ) : (
          <div className="hero-btns">
            <Link href={me?.org_slug ? `/e/${me.org_slug}` : me?.slug ? `/p/${me.slug}` : "/inscription"} className="btn-blanc">{me?.org_slug ? "Ma page entreprise" : me?.slug ? "Voir ma carte" : "Créer mon profil"}</Link>
            <Link href="/publier" className="btn-vitre">Publier</Link>
          </div>
        )}
      </section>

      {!visiteur && (
        <section className="carte">
          <div className="compose">
            <Avatar nom={me?.nom || "Moi"} photo={me?.photo} taille={46} />
            <Link href="/publier/realisation" className="faux">Partager une réalisation…</Link>
          </div>
          <div className="pilules">
            <Link href="/publier/realisation" className="pilule" style={{ background: "#EEF4FF", color: "#1D4ED8" }}><Icone nom="photo" taille={18} />Réalisation</Link>
            <Link href="/besoins/nouveau" className="pilule" style={{ background: "#FEF3F2", color: "#C4320A" }}><Icone nom="recherche" taille={18} />Un besoin</Link>
            <Link href="/emplois/nouveau" className="pilule" style={{ background: "#ECFDF3", color: "#067647" }}><Icone nom="emplois" taille={18} />Une offre</Link>
          </div>
        </section>
      )}
      {erreur && <Erreur texte={erreur} />}

      <div className="sec-t">Fil d&apos;actualité et opportunités</div>
      <div className="chips" role="group" aria-label="Filtrer par catégorie">
        {CATEGORIES.map(([k, n]) => <button key={k} type="button" className={`chip${cat === k ? " on" : ""}`} aria-pressed={cat === k} onClick={() => setCat(k)}>{n}</button>)}
      </div>
      <div className="filtres">
        <select aria-label="Filtrer par quartier ou ville" value={lieu} onChange={e => setLieu(e.target.value)}>
          <option value="">Tous les quartiers et villes</option>{LIEUX.map(l => <option key={l}>{l}</option>)}
        </select>
      </div>

      {!charge ? <Chargement /> : fil.length === 0 ? (
        <EtatVide icone={cat === "realisations" ? "photo" : cat === "offres" ? "emplois" : "recherche"}
          titre={cat === "tout" && !lieu ? "Rien pour l'instant" : "Rien dans cette catégorie pour le moment"}
          texte={cat === "tout" && !lieu ? "Aucune publication pour l'instant. Sois le premier : partage une réalisation en photo, ou publie un besoin." : "Change de catégorie ou de quartier, ou publie la première annonce."}
          href={visiteur ? "/inscription" : cat === "realisations" || cat === "tout" ? "/publier/realisation" : cat === "offres" ? "/emplois/nouveau" : "/besoins/nouveau"}
          action={visiteur ? "Créer mon compte" : cat === "offres" ? "Publier une offre" : cat === "besoins" ? "Publier un besoin" : "Partager une réalisation"} />
      ) : fil.map(e => e.t === "r"
        ? <Poste key={e.x.id} genre="realisation" nom={e.x.nom} photo={e.x.photo} verifiee={e.x.verifiee} carre={!!e.x.org_slug} soustitre={e.x.lieu || "Kargora"} temps={e.d} texte={e.x.texte}
            hrefNom={e.x.org_slug ? `/e/${e.x.org_slug}` : e.x.slug ? `/p/${e.x.slug}` : undefined}
            image={e.x.thumb ? { thumb: e.x.thumb, legende: e.x.texte.slice(0, 80), ouvrir: () => setGrande(e.x) } : undefined}
            action="Écrire à l'auteur" href={`/messages/nouveau?to=${e.x.member_id}&nom=${encodeURIComponent(e.x.nom)}&sujet=${encodeURIComponent("À propos de ta publication")}`} />
        : e.t === "b"
        ? <Poste key={e.x.id} genre="besoin" nom={e.x.nom} photo={e.x.photo} soustitre={`${e.x.metier} · ${e.x.lieu}`} temps={e.d} titre={e.x.titre} texte={e.x.details} action="Répondre" href={`/messages/nouveau?to=${e.x.member_id}&nom=${encodeURIComponent(e.x.nom)}&sujet=${encodeURIComponent(`Je réponds à ton besoin : ${e.x.titre}`)}`} />
        : <Poste key={e.x.id} genre="offre" nom={e.x.organisation} photo={e.x.logo} carre verifiee={e.x.verifiee} hrefNom={e.x.org_slug ? `/e/${e.x.org_slug}` : undefined} soustitre={e.x.lieu} temps={e.d} titre={e.x.titre} texte={e.x.details} etiquette={e.x.type} action="Postuler" href={`/messages/nouveau?to=${e.x.member_id}&nom=${encodeURIComponent(e.x.organisation)}&sujet=${encodeURIComponent(`Je postule à l'offre : ${e.x.titre}`)}`} />)}

      <div className="sec-t">Professionnels</div>
      <section className="carte">
        {pros === null ? <Chargement /> : pros.length === 0 ? <p className="in mute" style={{ padding: 20 }}>Aucune carte pour l&apos;instant.</p>
          : pros.map(p => <ProLigne key={p.slug} p={p} />)}
        <div className="lien-act"><Link href="/chercher">Voir tous les professionnels</Link></div>
      </section>

      <section className="carte"><div className="in">
        <h2>Pourquoi se fier</h2>
        <ul className="liste-conf">
          <li><span className="badge-vert"><Icone nom="bouclier" taille={22} /></span><div><b>Des preuves</b><span className="t">Un chantier compte seulement quand le client le confirme avec un lien envoyé par le professionnel.</span></div></li>
          <li><span className="badge-vert"><Icone nom="batiment" taille={22} /></span><div><b>Des entreprises contrôlées</b><span className="t">Le badge « Entreprise vérifiée » n&apos;apparaît qu&apos;après contrôle du RCCM et du NIF, ou de l&apos;agrément pour une ONG.</span></div></li>
          <li><span className="badge-vert"><Icone nom="etoile" taille={22} /></span><div><b>Des avis honnêtes</b><span className="t">Publiés tels quels, retirés seulement s&apos;ils sont faux ou injurieux, avec une explication.</span></div></li>
        </ul>
      </div></section>
      <Pied />
      {grande && grande.thumb && <Lightbox apercu={grande.thumb} legende={grande.texte.slice(0, 120)} charger={() => api.postPhoto(grande.id)} onClose={() => setGrande(null)} />}
    </main>
  );
}
