const P: Record<string, string> = {
  accueil: "M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  carburant: "M5 3h8a1 1 0 0 1 1 1v8h1.5a1.5 1.5 0 0 1 1.5 1.5v3a1 1 0 0 0 2 0V9l-2-2 1.4-1.4 3 3A1 1 0 0 1 21 9.3v7.2a3 3 0 0 1-6 0v-3H14v7H4V4a1 1 0 0 1 1-1Zm1 2v5h6V5Z",
  prix: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5v1.1c1.5.3 2.5 1.3 2.5 2.7h-2c0-.5-.6-.9-1.5-.9s-1.5.4-1.5.9c0 .6.5.8 2 1.2 2 .5 3 1.2 3 2.8 0 1.4-1 2.4-2.5 2.7V18h-2v-1.1C9.5 16.600 8.500 15.500 8.500 14h2c0 .6.7 1 1.600 1 1 0 1.400-.4 1.400-.9 0-.6-.5-.8-1.900-1.200-1.800-.5-3-1.200-3-2.800 0-1.400 1-2.400 2.400-2.700V7Z",
  coupure: "M13 2 4 14h6l-1 8 9-12h-6Z",
  alerte: "M12 2 1 21h22Zm1 7v6h-2V9Zm0 8v2h-2v-2Z",
  plus: "M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6Z",
};
export default function Icone({ nom, taille = 22 }: { nom: keyof typeof P; taille?: number }) {
  return <svg aria-hidden="true" width={taille} height={taille} viewBox="0 0 24 24" fill="currentColor"><path d={P[nom]} /></svg>;
}
