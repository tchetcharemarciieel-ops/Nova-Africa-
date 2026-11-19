import type { Metadata, Viewport } from "next";
import { BarreBas, BarreHaut } from "@/components/Barres";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kargora : trouve quelqu'un de confiance",
  description: "Kargora : des professionnels dont les clients ont confirmé le travail, des besoins, des offres d'emploi, des messages dans l'application. En Centrafrique et partout.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0f4c3a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <BarreHaut />
        {children}
        <BarreBas />
      </body>
    </html>
  );
}
