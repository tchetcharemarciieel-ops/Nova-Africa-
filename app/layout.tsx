import type { Metadata, Viewport } from "next";
import { BarreBas, BarreHaut } from "@/components/Barres";
import "./globals.css";

export const metadata: Metadata = {
  title: "Réseau pro : trouve quelqu'un de confiance",
  description: "Des professionnels avec des chantiers confirmés par leurs clients. Messages dans l'application.",
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
