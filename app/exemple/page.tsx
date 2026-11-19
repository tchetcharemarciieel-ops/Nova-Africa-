"use client";

import CarteVue from "@/components/CarteVue";
import type { Card, Confirmation } from "@/lib/data";

const CARD: Card = { slug: "exemple-joseph", nom: "Joseph Exemple", metier: "Plomberie", lieu: "Bégoua", telephone: "23670000000", apropos: "Exemple : travaux de plomberie et de salle de bain, dans tout Bangui.", langues: ["Français", "Sango"], creeLe: "2026-01-01T00:00:00.000Z" };
const CONFS: Confirmation[] = [
  { id: "e1", slug: "exemple-joseph", travail: "Salle de bain", note: 5, avis: "Travail propre, ponctuel, prix honnête.", prenom: "Client exemple", creeLe: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: "e2", slug: "exemple-joseph", travail: "Fuite d'eau", note: 4, avis: "Rapide, il a réparé le jour même.", prenom: "Autre client exemple", creeLe: new Date(Date.now() - 9 * 86400000).toISOString() },
];

export default function Exemple() { return <CarteVue card={CARD} exemple confirmationsExemple={CONFS} />; }
