"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import Icone from "@/components/Icone";
import Lightbox from "@/components/Lightbox";
import Pied from "@/components/Pied";
import HeroMockup from "@/components/HeroMockup";
import { Verifiee } from "@/components/Blocs";
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
    <main className="acc">
      <section className="hero">
        <div className="wrap hero-grille">
          <div>
            <span className="hero-pastille"><i />Centrafrique &amp; diaspora</span>
            <h1>Trouve quelqu&apos;un de <em>confiance</em>, en Centrafrique et partout.</h1>
            <p className="hero-sous">Montre ton travail en photos, fais confirmer tes chantiers, recrute des entreprises vérifiées.</p>
            {visiteur ? (
              <>
                <div className="hero-cta">
                  <Link href="/inscription-candidat" className="p"><Icone nom="carte" taille={28} trait={1.6} /><span>Je suis un Professionnel / Candidat<small>Chercher un emploi, publier mes réalisations, créer ma carte pro</small></span></Link>
                  <Link href="/inscription-entreprise" className="e"><Icone nom="batiment" taille={28} trait={1.6} /><span>Je suis une Entreprise / ONG<small>Recruter, publier des offres, obtenir le badge Entreprise vérifiée</small></span></Link>
                </div>
                <p className="hero-liens">Déjà un compte ? <Link href="/connexion">Se connecter</Link></p>
              </>
            ) : (
              <div className="hero-cta-membre">
                <Link href={me?.org_slug ? `/e/${me.org_slug}` : me?.slug ? `/p/${me.slug}` : "/inscription"} className="btn-or">{me?.org_slug ? "Ma page entreprise" : me?.slug ? "Voir ma carte" : "Créer mon profil"}</Link>
                <Link href="/publier" className="btn-vitre">Publier</Link>
              </div>
            )}
            {aChiffres && chiffres && (
              <div className="hero-chiffres" aria-label="Chiffres du réseau">
                <div><b>{chiffres.profils}</b><span>cartes pro</span></div>
                <div><b>{chiffres.offres}</b><span>offres</span></div>
                <div><b>{chiffres.chantiers}</b><span>chantiers confirmés</span></div>
              </div>
            )}
          </div>
          <HeroMockup />
        </div>
      </section>

      <section className="sec blanc"><div className="wrap">
        <div className="sec-tete"><span className="sur">Ce que tu peux faire</span><h2>Tout pour montrer ton travail et être trouvé.</h2><p>Une carte pro, des photos, des preuves, des messages : au même endroit.</p></div>
        <div className="bento">
          <article className="bc noir b-l">
            <div className="deco" aria-hidden="true"><i style={{ background: "linear-gradient(135deg,#34d399,#047857)" }} /><i style={{ background: "linear-gradient(135deg,#fbbf24,#b45309)" }} /><i style={{ background: "linear-gradient(135deg,#67e8f9,#0e7490)" }} /><i style={{ background: "linear-gradient(135deg,#a7f3d0,#059669)" }} /></div>
            <span className="halo v"><Icone nom="photo" taille={26} trait={1.6} /></span>
            <h3>Ta galerie de réalisations</h3><p>Chantiers, diplômes, attestations : montre-les en photos avec une légende. Un clic, et l&apos;image s&apos;ouvre en grand.</p>
          </article>
          <article className="bc menthe b-s">
            <span className="halo c"><Icone nom="carte" taille={26} trait={1.6} /></span>
            <h3>Ta carte pro</h3><p>Photo, métier, quartier, parcours : à partager par lien ou QR code.</p>
          </article>
          <article className="bc or b-s">
            <div className="stars" aria-hidden="true">★★★★★</div>
            <h3>Des chantiers confirmés</h3><p>Seul un vrai client peut confirmer, avec ton lien.</p>
          </article>
          <article className="bc perle b-m">
            <span className="halo b"><Icone nom="emplois" taille={26} trait={1.6} /></span>
            <h3>Des offres d&apos;emploi sérieuses</h3><p>Publiées par des entreprises et ONG inscrites. Une vraie offre ne demande jamais d&apos;argent.</p>
          </article>
          <article className="bc noir b-s">
            <span className="halo v"><Icone nom="reseau" taille={26} trait={1.6} /></span>
            <h3>La diaspora, à distance</h3><p>Trouve un pro fiable à Bangui, vois ses preuves.</p>
          </article>
          <article className="bc perle b-s">
            <span className="halo b"><Icone nom="message" taille={26} trait={1.6} /></span>
            <h3>Messages dans l&apos;application</h3><p>Écris, réponds, sans donner ton numéro.</p>
          </article>
        </div>
      </div></section>

      <section className="sec perle"><div className="wrap">
        <div className="sec-tete centre"><span className="sur">Comment ça marche</span><h2>En 5 étapes, simplement.</h2><p>Pas de mot de passe : ton compte est lié à ton téléphone.</p></div>
        <ol className="etapes5">
          {[["01", "Crée ton compte", "Professionnel ou entreprise, en deux minutes."], ["02", "Complète ta carte", "Photo, métier, quartier, parcours."], ["03", "Publie tes réalisations", "Des photos de ton travail, sur le fil."], ["04", "Fais confirmer", "Tes clients valident le chantier avec ton lien."], ["05", "Reçois des messages", "Clients, offres, opportunités."]].map(([n, t, d]) => (
            <li key={n}><span className="num" aria-hidden="true">{n}</span><div className="ec"><b>{t}</b><span>{d}</span></div></li>
          ))}
        </ol>
      </div></section>

      <section className="sec blanc fil-sec" id="fil"><div className="wrap-fil">
        <div className="sec-tete" style={{ marginBottom: 18 }}><span className="sur">En direct</span><h2>Fil d&apos;actualité et opportunités</h2></div>
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


        <div className="sec-t" style={{ marginTop: 22 }}>Professionnels</div>
        <section className="carte">
          {pros === null ? <Chargement /> : pros.length === 0 ? <p className="in mute" style={{ padding: 20 }}>Aucune carte pour l&apos;instant.</p>
            : pros.map(p => <ProLigne key={p.slug} p={p} />)}
          <div className="lien-act"><Link href="/chercher">Voir tous les professionnels</Link></div>
        </section>
      </div></section>

      <section className="sec sombre"><div className="wrap sombre-grille">
        <div>
          <span className="sur" style={{ background: "rgba(52,211,153,.15)", color: "#6ee7b7" }}>Espace Entreprises &amp; ONG</span>
          <h2>Recrute des profils <em>vérifiés</em>, sans fausses offres.</h2>
          <p className="l">Inscris ton entreprise, publie tes offres d&apos;emploi et reçois les candidatures par messages. Après contrôle de tes documents, ton badge vert apparaît.</p>
          <ul className="coches">
            <li><span className="halo v"><Icone nom="coche" taille={16} trait={2.6} /></span>Numéro RCCM et NIF (ou agrément ONG) contrôlés, jamais affichés</li>
            <li><span className="halo v"><Icone nom="coche" taille={16} trait={2.6} /></span>Une page vitrine avec ton logo et tes offres actives</li>
            <li><span className="halo v"><Icone nom="coche" taille={16} trait={2.6} /></span>Candidatures par messages, avec le WhatsApp du responsable RH en secret</li>
          </ul>
          <Link href="/inscription-entreprise" className="btn-or">Inscrire mon entreprise</Link>
        </div>
        <div className="statuts">
          <div className="statut-c"><Verifiee attente /><p>À l&apos;inscription : ta page est visible, en attente de contrôle.</p></div>
          <div className="statut-c"><Verifiee /><p>Après contrôle du RCCM et du NIF par l&apos;équipe Kargora.</p></div>
          <p style={{ color: "rgba(255,255,255,.65)", fontSize: 14 }}>Le badge ne garantit pas l&apos;entreprise : il dit que ses documents ont été contrôlés. <Link href="/verification" style={{ color: "#6ee7b7", fontWeight: 700 }}>Règles de vérification</Link></p>
        </div>
      </div></section>

      <section className="sec perle"><div className="wrap">
        <div className="sec-tete centre"><span className="sur">Pourquoi se fier</span><h2>La confiance se prouve.</h2></div>
        <div className="trio">
          <article className="bc"><span className="halo b"><Icone nom="bouclier" taille={26} trait={1.6} /></span><h3>Des preuves</h3><p>Un chantier compte seulement quand le client le confirme avec un lien envoyé par le professionnel.</p></article>
          <article className="bc"><span className="halo b"><Icone nom="batiment" taille={26} trait={1.6} /></span><h3>Des entreprises contrôlées</h3><p>Le badge « Entreprise vérifiée » n&apos;apparaît qu&apos;après contrôle du RCCM et du NIF, ou de l&apos;agrément pour une ONG.</p></article>
          <article className="bc"><span className="halo b"><Icone nom="etoile" taille={26} trait={1.6} /></span><h3>Des avis honnêtes</h3><p>Publiés tels quels, retirés seulement s&apos;ils sont faux ou injurieux, avec une explication.</p></article>
        </div>
        <div className="wrap-fil" style={{ padding: 0 }}><Pied /></div>
      </div></section>
      {grande && grande.thumb && <Lightbox apercu={grande.thumb} legende={grande.texte.slice(0, 120)} charger={() => api.postPhoto(grande.id)} onClose={() => setGrande(null)} />}
    </main>
  );
}
