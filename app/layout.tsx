import type { Metadata, Viewport } from "next";
import { BarreBas, BarreHaut } from "@/components/Barres";
import EnregistrerSW from "@/components/EnregistrerSW";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Kargora : trouve quelqu'un de confiance",
  applicationName: "Kargora",
  appleWebApp: { capable: true, title: "Kargora", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  icons: { icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }, { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }], apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }] },
  description: "Kargora : des professionnels dont les clients ont confirmé le travail, des besoins, des offres d'emploi, des messages dans l'application. En Centrafrique et partout.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#064e3b", viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>
        <BarreHaut />
        {children}
        <BarreBas />
        <EnregistrerSW />
      </body>
    </html>
  );
}
