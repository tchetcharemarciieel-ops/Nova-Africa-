const T: Record<string, React.ReactNode> = {
  accueil: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" /></>,
  reseau: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-5.500 6-5.500s6 2.200 6 5.500" /><circle cx="17" cy="9" r="2.500" /><path d="M17 14.500c2.400.200 4 2 4 4.500" /></>,
  publier: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
  emplois: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" /></>,
  message: <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1Z" />,
  recherche: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.500-3.500" /></>,
  reglages: <><circle cx="12" cy="12" r="3" /><path d="M19.400 15a1.700 1.700 0 0 0 .3 1.800l.1.100a2 2 0 1 1-2.800 2.800l-.1-.1a1.700 1.700 0 0 0-1.800-.3 1.700 1.700 0 0 0-1 1.500V21a2 2 0 1 1-4 0v-.1a1.700 1.700 0 0 0-1.100-1.500 1.700 1.700 0 0 0-1.800.3l-.1.100a2 2 0 1 1-2.800-2.800l.1-.1a1.700 1.700 0 0 0 .3-1.800 1.700 1.700 0 0 0-1.500-1H3a2 2 0 1 1 0-4h.1a1.700 1.700 0 0 0 1.500-1.100 1.700 1.700 0 0 0-.3-1.800l-.1-.1a2 2 0 1 1 2.800-2.800l.1.1a1.700 1.700 0 0 0 1.800.3H9a1.700 1.700 0 0 0 1-1.500V3a2 2 0 1 1 4 0v.1a1.700 1.700 0 0 0 1 1.500 1.700 1.700 0 0 0 1.800-.3l.1-.1a2 2 0 1 1 2.800 2.800l-.1.100a1.700 1.700 0 0 0-.3 1.800V9a1.700 1.700 0 0 0 1.500 1H21a2 2 0 1 1 0 4h-.1a1.700 1.700 0 0 0-1.500 1Z" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  chevron: <path d="m9 6 6 6-6 6" />,
  bouclier: <><path d="M12 3 4 6v6c0 4.500 3.200 7.700 8 9 4.800-1.300 8-4.500 8-9V6Z" /><path d="m9 12 2 2 4-4" /></>,
  fermer: <path d="M6 6l12 12M18 6 6 18" />,
  coche: <path d="m5 12.500 4.500 4.500L19 7.500" />,
  carte: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="M6.500 16c.4-1.400 1.400-2 2.500-2s2.100.6 2.500 2M14 10h4M14 13h3" /></>,
};
export type NomIcone = keyof typeof T;
export default function Icone({ nom, taille = 24, trait = 1.75 }: { nom: NomIcone; taille?: number; trait?: number }) {
  return <svg aria-hidden="true" width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={trait} strokeLinecap="round" strokeLinejoin="round">{T[nom]}</svg>;
}
