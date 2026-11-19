import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Réseau pro : trouve quelqu'un de confiance",
  description: "Ta carte pro à partager sur WhatsApp, avec des chantiers confirmés par tes clients.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0f4c3a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <header className="top">
          <Link href="/" className="logo">Réseau<i>·</i>pro</Link>
          <span className="tag">Version de test</span>
        </header>
        {children}
        <Nav />
      </body>
    </html>
  );
}
