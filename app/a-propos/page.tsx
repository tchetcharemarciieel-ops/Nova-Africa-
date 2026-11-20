import Link from "next/link";
import Pied from "@/components/Pied";

export const metadata = { title: "À propos de Kargora" };

export default function APropos() {
  return (
    <main className="page legal">
      <section className="carte"><div className="in">
        <h1>À propos de Kargora</h1>
        <p className="lead">Kargora est un réseau professionnel pour la Centrafrique et sa diaspora. Notre mission : rendre l&apos;emploi et le travail plus <b>confiables</b>.</p>
        <p className="info"><b>Le contrôle est humain.</b> Les entreprises sont vérifiées à la main, au cas par cas. La vérification d&apos;identité des personnes n&apos;existe pas encore : pour un professionnel, la confiance vient des chantiers confirmés par ses clients.</p>
      </div></section>
      <section className="carte"><div className="in">
        <h2>Ce que nous voulons changer</h2>
        <p>Trop d&apos;emplois et de chantiers se trouvent par le bouche-à-oreille ou dans des groupes où l&apos;on ne sait pas qui est sérieux. Trop de fausses offres circulent. Et un Centrafricain à l&apos;étranger ne sait pas à qui confier un projet à Bangui.</p>
        <h2>Ce que fait Kargora</h2>
        <ul>
          <li><b>Pour les professionnels et candidats</b> : une carte pro avec photo, parcours, réalisations en images et chantiers confirmés par les clients.</li>
          <li><b>Pour les entreprises et ONG</b> : des offres d&apos;emploi publiées depuis une page entreprise, avec un badge « Entreprise vérifiée » une fois le RCCM et le NIF (ou l&apos;agrément) contrôlés.</li>
          <li><b>Pour la diaspora</b> : trouver un professionnel fiable à distance, voir ses réalisations, lire des avis confirmés, et recruter ou conseiller des jeunes de Bangui.</li>
        </ul>
        <h2>Ce que Kargora ne fait pas</h2>
        <p>Kargora ne détient pas d&apos;argent, ne garantit pas un travail et n&apos;est pas une agence de recrutement : les accords se font entre les personnes. Un badge « vérifié » signifie seulement que nous avons contrôlé les documents fournis, pas que nous garantissons l&apos;entreprise.</p>
      </div></section>
      <section className="carte"><div className="in"><h2>Pour aller plus loin</h2><p><Link href="/verification">Règles de vérification</Link> · <Link href="/cgu">Conditions d&apos;utilisation</Link> · <Link href="/confidentialite">Confidentialité</Link> · <Link href="/contact">Contact</Link></p></div></section>
      <Pied />
    </main>
  );
}
