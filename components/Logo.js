// Symbole KARGORA : un carré bleu profond, un « K » dont la jambe haute devient une flèche orange (mouvement, commerce international).
export function LogoMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="KARGORA">
      <rect width="64" height="64" rx="16" fill="#0b2a6f" />
      <path d="M20 14v36" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
      <path d="M24 33l17 16" stroke="#9fc0ff" strokeWidth="7" strokeLinecap="round" />
      <path d="M26 31l16-16" stroke="#ff7a1a" strokeWidth="7" strokeLinecap="round" />
      <path d="M33 14h11v11" stroke="#ff7a1a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
export default function Logo() {
  return (<><LogoMark /><span>KARGORA</span></>);
}
