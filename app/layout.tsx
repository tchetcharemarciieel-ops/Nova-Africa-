import type { Metadata, Viewport } from "next";
import { BarreBas, BarreHaut } from "@/components/Barres";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Kargora : trouve quelqu'un de confiance",
  description: "Kargora : des professionnels dont les clients ont confirmé le travail, des besoins, des offres d'emploi, des messages dans l'application. En Centrafrique et partout.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#047857" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>
        <BarreHaut />
        {children}
        <BarreBas />
      </body>
    </html>
  );
}
