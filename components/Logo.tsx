/** Logo Kargora : un K géométrique (tige blanche, bras blanc et bras menthe) sur vert forêt profond. */
export function LogoIcone({ taille = 36 }: { taille?: number }) {
  return (
    <svg aria-hidden="true" width={taille} height={taille} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="lgf" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#065F46" /><stop offset="1" stopColor="#022C22" /></linearGradient>
        <radialGradient id="lgh" cx="30%" cy="18%" r="70%"><stop stopColor="#34D399" stopOpacity=".45" /><stop offset="1" stopColor="#34D399" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#lgf)" />
      <rect width="40" height="40" rx="11" fill="url(#lgh)" />
      <path d="M13 9v22" stroke="#fff" strokeWidth="4.4" strokeLinecap="round" />
      <path d="M13.5 21 27 9" stroke="#fff" strokeWidth="4.4" strokeLinecap="round" />
      <path d="M13.5 19 27 31" stroke="#34D399" strokeWidth="4.4" strokeLinecap="round" />
    </svg>
  );
}
export default function Logo({ clair = false }: { clair?: boolean }) {
  return <span className="logo"><LogoIcone /><b style={{ color: clair ? "#fff" : undefined }}>Kargora</b></span>;
}
