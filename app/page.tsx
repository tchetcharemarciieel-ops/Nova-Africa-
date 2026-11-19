import Link from "next/link";

export default function Accueil() {
  return (
    <main className="wrap">
      <span className="badge">Version de test</span>
      <h1>Trouve quelqu&apos;un de confiance, ou fais-toi trouver.</h1>
      <p className="lead">Crée ta carte pro en deux minutes et partage-la sur WhatsApp. Les clients t&apos;appellent directement, avec une preuve devant eux.</p>
      <div className="row">
        <Link href="/creer" className="btn or">Créer ma carte pro</Link>
        <Link href="/chercher" className="btn clair">Chercher un professionnel</Link>
      </div>
      <h2>Comment ça marche</h2>
      <ol className="steps">
        <li><b>1</b><span>Tu remplis ton métier, ton quartier et ton numéro WhatsApp.</span></li>
        <li><b>2</b><span>Tu reçois un lien à toi, prêt à partager en statut ou dans les groupes.</span></li>
        <li><b>3</b><span>Un client voit ta carte et t&apos;appelle ou t&apos;écrit sur WhatsApp.</span></li>
      </ol>
      <h2>Pour qui</h2>
      <div className="card">Artisans, commerçants, jeunes diplômés, entreprises et Centrafricains de l&apos;étranger qui veulent faire faire un travail à Bangui.</div>
      <p className="note" style={{ marginTop: 20 }}>Version de démonstration : les cartes restent pour l&apos;instant sur ton téléphone. Rien n&apos;est publié ailleurs.</p>
    </main>
  );
}
