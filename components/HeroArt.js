import Icon from "./Icons";

// Illustration décorative : fournisseurs → transport → Bangui. Aucun chiffre, aucune origine promise.
export default function HeroArt() {
  return (
    <div className="heroart" aria-hidden="true">
      <svg viewBox="0 0 520 440" className="heroart-svg">
        <defs>
          <linearGradient id="gr" x1="0" x2="1"><stop offset="0" stopColor="#7fb0ff" /><stop offset="1" stopColor="#ff7a1a" /></linearGradient>
          <radialGradient id="glow"><stop offset="0" stopColor="#ff7a1a" stopOpacity=".55" /><stop offset="1" stopColor="#ff7a1a" stopOpacity="0" /></radialGradient>
        </defs>
        {Array.from({ length: 9 }).map((_, r) => Array.from({ length: 13 }).map((_, c) => (
          <circle key={`${r}-${c}`} cx={20 + c * 40} cy={24 + r * 46} r="1.6" fill="#ffffff" opacity=".18" />
        )))}
        <path className="route r1" d="M70 90 C180 10 300 70 410 300" />
        <path className="route r2" d="M60 250 C170 330 300 360 410 300" />
        <path className="route r3" d="M150 160 C230 190 330 230 410 300" />
        {[[70, 90], [60, 250], [150, 160]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="9" fill="#ffffff" opacity=".18" /><circle cx={x} cy={y} r="4.5" fill="#fff" /></g>)}
        <circle cx="410" cy="300" r="46" fill="url(#glow)" />
        <circle className="pulse" cx="410" cy="300" r="14" fill="none" stroke="#ff7a1a" strokeWidth="2" />
        <circle cx="410" cy="300" r="8" fill="#ff7a1a" />
      </svg>
      <div className="fc fc1"><span className="fci"><Icon name="doc" /></span><div><b>Devis détaillé</b><small>en FCFA</small></div></div>
      <div className="fc fc2"><span className="fci ok"><Icon name="shield" /></span><div><b>Paiement vérifié</b><small>reçu remis</small></div></div>
      <div className="fc fc3"><span className="fci"><Icon name="truck" /></span><div><b>Transport suivi</b><small>étape par étape</small></div></div>
      <div className="fc fc4"><span className="fci or"><Icon name="box" /></span><div><b>Retrait à Bangui</b><small>avec numéro</small></div></div>
    </div>
  );
}
