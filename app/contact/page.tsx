import Pied from "@/components/Pied";

export const metadata = { title: "Contact" };

export default function Contact() {
  const mail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  return (
    <main className="page legal">
      <section className="carte"><div className="in">
        <h1>Contact</h1>
        <p className="lead">Une question, un signalement (fausse offre, avis faux), une demande de suppression de compte ou de vérification d&apos;entreprise.</p>
        {mail
          ? <p style={{ marginTop: 12 }}><a className="btn plein" href={`mailto:${mail}`}>Écrire à {mail}</a></p>
          : <p className="info">L&apos;adresse de contact sera publiée très bientôt. En attendant, les entreprises inscrites sont contactées sur le WhatsApp de leur responsable RH.</p>}
        <p className="mute petit" style={{ marginTop: 12 }}>Dans ton message, n&apos;envoie jamais ton code de connexion.</p>
      </div></section>
      <Pied />
    </main>
  );
}
