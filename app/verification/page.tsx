import Link from "next/link";
import Pied from "@/components/Pied";
import { Verifiee } from "@/components/Blocs";

export const metadata = { title: "Règles de vérification" };

export default function Verification() {
  return (
    <main className="page legal">
      <section className="carte"><div className="in">
        <h1>Règles de vérification</h1>
        <p className="lead">Voici comment une entreprise ou une ONG obtient le badge vert, et ce qu&apos;il veut dire.</p>
        <h2>Les trois statuts</h2>
        <p style={{ marginTop: 10 }}><Verifiee attente /> À l&apos;inscription, la page est en attente : elle est visible, mais aucun contrôle n&apos;a eu lieu.</p>
        <p style={{ marginTop: 10 }}><Verifiee /> Après contrôle de ses documents par l&apos;équipe Kargora.</p>
        <p style={{ marginTop: 10 }}>Une demande peut aussi être refusée si les documents sont absents, illisibles ou incohérents.</p>
        <h2>Ce que nous contrôlons</h2>
        <ul>
          <li>Le numéro <b>RCCM</b> (Registre du Commerce et du Crédit Mobilier) de l&apos;entreprise.</li>
          <li>Le numéro <b>NIF</b> (Numéro d&apos;Identification Fiscale), ou l&apos;<b>agrément</b> pour une ONG.</li>
          <li>Que le responsable RH indiqué répond sur le WhatsApp donné.</li>
        </ul>
        <h2>Ce que le badge ne veut pas dire</h2>
        <p>« Entreprise vérifiée » signifie que les documents fournis ont été contrôlés à la date de la vérification. Ce n&apos;est ni une garantie de sérieux, ni un agrément de l&apos;État. Une vraie offre ne demande jamais d&apos;argent : si on t&apos;en demande, <Link href="/contact">signale-le</Link>.</p>
        <h2>Tes documents</h2>
        <p>Les numéros RCCM et NIF ne sont <b>jamais affichés</b> publiquement. Voir la <Link href="/confidentialite">politique de confidentialité</Link>.</p>
        <h2>Les professionnels</h2>
        <p>Pour un professionnel, la confiance vient des <b>chantiers confirmés par ses clients</b>, pas d&apos;un badge. La vérification d&apos;identité des personnes n&apos;existe pas encore.</p>
      </div></section>
      <Pied />
    </main>
  );
}
