const CHEMINS: Record<string, string> = {
  accueil: "M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  reseau: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5Zm14.5-4.4c3 .2 5.5 1.9 5.5 4.4h-4.5c0-1.7-.4-3.2-1-4.4Z",
  publier: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm1 4v4h4v2h-4v4h-2v-4H7v-2h4V7Z",
  message: "M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9l-5 4v-4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z",
  moi: "M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm-8 9c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5Z",
  recherche: "M10.5 3a7.5 7.5 0 1 0 4.6 13.4l4.3 4.3 1.4-1.4-4.3-4.3A7.5 7.5 0 0 0 10.5 3Zm0 2a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Z",
};
export default function Icone({ nom, taille = 24 }: { nom: keyof typeof CHEMINS; taille?: number }) {
  return <svg aria-hidden="true" width={taille} height={taille} viewBox="0 0 24 24" fill="currentColor"><path d={CHEMINS[nom]} /></svg>;
}
