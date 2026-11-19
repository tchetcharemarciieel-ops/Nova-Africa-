import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Réseau pro centrafricain",
  description: "Trouve quelqu'un de confiance, ou fais-toi trouver. Ta carte pro à partager sur WhatsApp.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#14532d" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <header className="top">
          <Link href="/" className="logo">Réseau pro</Link>
          <nav className="row"><Link href="/chercher">Chercher</Link><Link href="/creer">Ma carte</Link></nav>
        </header>
        {children}
      </body>
    </html>
  );
}
