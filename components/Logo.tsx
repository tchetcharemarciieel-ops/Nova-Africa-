/** Logo Kargora : emblème géométrique connecté, un K fait de nœuds reliés, en dégradé indigo vers cyan avec un nœud or. */
export function LogoIcone({ taille = 36 }: { taille?: number }) {
  return (
    <svg aria-hidden="true" width={taille} height={taille} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="lgf" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#4F46E5" /><stop offset="1" stopColor="#06B6D4" /></linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#lgf)" />
      <path d="M13 9.5v21M13 20 27 9.5M13 20l14 10.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="13" cy="9.5" r="3.2" fill="#fff" /><circle cx="13" cy="30.5" r="3.2" fill="#fff" /><circle cx="13" cy="20" r="3.2" fill="#fff" />
      <circle cx="27" cy="30.5" r="3.2" fill="#fff" /><circle cx="27" cy="9.5" r="3.4" fill="#F59E0B" stroke="#fff" strokeWidth="1.4" />
    </svg>
  );
}
export default function Logo({ clair = false }: { clair?: boolean }) {
  return <span className="logo"><LogoIcone /><b style={{ color: clair ? "#fff" : undefined }}>Kargora</b></span>;
}
