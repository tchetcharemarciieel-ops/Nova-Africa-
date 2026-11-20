"use client";

import { useMemo } from "react";
import Qcm from "@/components/Qcm";
import { jourBangui, questionsLien } from "@/lib/jeux";

export default function LienPro() {
  const qs = useMemo(() => questionsLien(jourBangui()), []);
  return <main className="page"><Qcm jeu="lien" titre="Le Lien Pro" questions={qs} /></main>;
}
