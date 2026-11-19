import type { Metadata, Viewport } from "next";
import { Bas, Entete } from "@/components/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bangui Aujourd'hui : carburant, prix, coupures, alertes",
  description: "Ce qui compte aujourd'hui à Bangui, signalé par les habitants : carburant, prix du marché, coupures, alertes.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#1c1b19" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="fr"><body><Entete />{children}<Bas /></body></html>);
}
