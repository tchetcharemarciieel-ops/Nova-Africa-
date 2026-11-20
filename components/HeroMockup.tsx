import Icone from "./Icone";

/** Illustration de l'accueil : une carte pro, une offre vérifiée et un message. Personnages et chiffres d'exemple. */
export default function HeroMockup() {
  return (
    <div className="mock" role="img" aria-label="Exemple : une carte pro avec un chantier confirmé, une offre d'une entreprise vérifiée et un message reçu">
      <span className="mock-ex">Exemple d&apos;illustration</span>
      <div className="mock-offre">
        <span className="mock-ico"><Icone nom="batiment" taille={20} trait={1.8} /></span>
        <div><b>Comptable junior</b><small>CDD · Bangui 3e arr.</small></div>
        <span className="mock-badge"><Icone nom="bouclier" taille={13} trait={2.2} />Entreprise vérifiée</span>
      </div>
      <div className="mock-carte">
        <div className="mock-tete">
          <span className="mock-av">JN</span>
          <div><b>Joseph N.</b><small>Plombier · Bimbo</small></div>
          <span className="mock-conf"><Icone nom="coche" taille={13} trait={3} />Chantier confirmé</span>
        </div>
        <div className="mock-note"><span>★★★★★</span> 5,0 · 12 chantiers confirmés</div>
        <div className="mock-galerie" aria-hidden="true">
          <i style={{ background: "linear-gradient(135deg,#22D3EE,#4F46E5)" }} />
          <i style={{ background: "linear-gradient(135deg,#FBBF24,#B45309)" }} />
          <i style={{ background: "linear-gradient(135deg,#67E8F9,#0E7490)" }} />
        </div>
        <div className="mock-cta"><span>Écrire</span><span className="sec">Appeler</span></div>
      </div>
      <div className="mock-msg"><span className="mock-point" />« Libre demain à 9 h ? »<small>Message reçu</small></div>
    </div>
  );
}
