/** Logo Kargora : un K stylisé (tige et bras) sur vert forêt profond, avec une étincelle dorée au bout du bras. */
export function LogoIcone({ taille = 36 }: { taille?: number }) {
  return (
    <svg aria-hidden="true" width={taille} height={taille} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="lgf" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#065F46" /><stop offset="1" stopColor="#022C22" /></linearGradient>
        <radialGradient id="lgh" cx="30%" cy="18%" r="70%"><stop stopColor="#34D399" stopOpacity=".45" /><stop offset="1" stopColor="#34D399" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#lgf)" />
      <rect width="40" height="40" rx="11" fill="url(#lgh)" />
      <path d="M13.5 9.5v21" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <path d="M14 21.5 26 11" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <path d="M17.5 19.5 27 30.5" stroke="#34D399" strokeWidth="4" strokeLinecap="round" />
      <circle cx="29" cy="9.5" r="3" fill="#FBBF24" />
    </svg>
  );
}
export default function Logo({ clair = false }: { clair?: boolean }) {
  return <span className="logo"><LogoIcone /><b style={{ color: clair ? "#fff" : undefined }}>Kargora</b></span>;
}
