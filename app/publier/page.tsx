import Link from "next/link";
import LigneMenu from "@/components/LigneMenu";

export default function Publier() {
  return (
    <main className="page">
      <section className="carte"><div className="in"><h1>Publier</h1><p className="lead" style={{ marginBottom: 0 }}>Que veux-tu faire ?</p></div></section>
      <section className="carte menu">
        <LigneMenu href="/besoins/nouveau" icone="recherche" teinte="rose" titre="J'ai besoin de…" sous="Un plombier, une couturière, un mécanicien : les professionnels te répondent ici." />
        <LigneMenu href="/emplois/nouveau" icone="emplois" teinte="vert" titre="Publier une offre d'emploi" sous="Emploi, stage ou mission : les candidats t'écrivent ici." />
        <LigneMenu href="/creer" icone="carte" teinte="bleu" titre="Créer ou voir ma carte pro" sous="Montre ton travail et fais-le confirmer par tes clients." />
      </section>
      <p className="mute petit" style={{ padding: "0 4px" }}>Voir : <Link href="/besoins">tous les besoins</Link> · <Link href="/emplois">toutes les offres</Link></p>
    </main>
  );
}
