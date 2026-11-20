/** Logo Kargora : icône géométrique verte (trois points reliés dans un carré arrondi) + nom. */
export function LogoIcone({ taille = 36 }: { taille?: number }) {
  return (
    <svg aria-hidden="true" width={taille} height={taille} viewBox="0 0 40 40" fill="none">
      <defs><linearGradient id="lg" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#34D399" /><stop offset="1" stopColor="#047857" /></linearGradient></defs>
      <rect width="40" height="40" rx="12" fill="url(#lg)" />
      <path d="M14 11v18M14 20l11-9M14 20l11 9" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="26" cy="11" r="3.2" fill="#fff" /><circle cx="26" cy="29" r="3.2" fill="#fff" />
    </svg>
  );
}
export default function Logo({ clair = false }: { clair?: boolean }) {
  return <span className="logo"><LogoIcone /><b style={{ color: clair ? "#fff" : undefined }}>Kargora</b></span>;
}
