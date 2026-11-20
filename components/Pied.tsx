import Link from "next/link";

const LIENS = [
  ["/a-propos", "À propos"], ["/cgu", "Conditions d'utilisation"], ["/confidentialite", "Confidentialité"],
  ["/verification", "Règles de vérification"], ["/contact", "Contact"],
] as const;

export default function Pied() {
  return (
    <footer className="pied">
      <b>Kargora</b>
      <p>Le réseau professionnel de Centrafrique et de sa diaspora.</p>
      <nav aria-label="Informations">{LIENS.map(([h, n]) => <Link key={h} href={h}>{n}</Link>)}</nav>
      <small>Kargora ne détient pas d&apos;argent et ne garantit aucun travail.</small>
    </footer>
  );
}
