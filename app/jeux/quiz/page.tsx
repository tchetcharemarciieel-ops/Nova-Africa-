"use client";

import { useMemo } from "react";
import Qcm from "@/components/Qcm";
import { jourBangui, questionsQuiz } from "@/lib/jeux";

export default function Quiz() {
  const qs = useMemo(() => questionsQuiz(jourBangui()), []);
  return <main className="page"><Qcm jeu="quiz" titre="Quiz Business" questions={qs} /></main>;
}
