import Link from "next/link";

export default function Publier() {
  return (
    <main className="page">
      <section className="carte"><div className="in"><h1>Publier</h1><p className="lead">Que veux-tu faire ?</p></div>
        <Link className="ligne" href="/besoins/nouveau"><span><b>J&apos;ai besoin de…</b><small>Un plombier, une couturière, un mécanicien : les professionnels te répondent ici.</small></span></Link>
        <Link className="ligne" href="/emplois/nouveau"><span><b>Publier une offre d&apos;emploi</b><small>Emploi, stage ou mission : les candidats t&apos;écrivent ici.</small></span></Link>
        <Link className="ligne" href="/creer"><span><b>Créer ou voir ma carte pro</b><small>Montre ton travail et fais-le confirmer par tes clients.</small></span></Link>
      </section>
      <p className="mute petit" style={{ padding: "0 4px" }}>Voir : <Link href="/besoins">tous les besoins</Link> · <Link href="/emplois">toutes les offres</Link></p>
    </main>
  );
}
