"use client";

import { useEffect, useRef, useState } from "react";
import Icone from "./Icone";

/** Image en grand : l'aperçu s'affiche tout de suite, la version complète se charge ensuite. */
export default function Lightbox({ apercu, legende, charger, onClose }: { apercu: string; legende?: string; charger: () => Promise<string | null>; onClose: () => void }) {
  const [grande, setGrande] = useState<string | null>(null);
  const fermer = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let vivant = true;
    charger().then(d => { if (vivant && d) setGrande(d); }).catch(() => {});
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", k);
    const avant = document.body.style.overflow; document.body.style.overflow = "hidden";
    fermer.current?.focus();
    return () => { vivant = false; document.removeEventListener("keydown", k); document.body.style.overflow = avant; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={legende || "Image en grand"} onClick={onClose}>
      <button ref={fermer} type="button" className="lb-x" aria-label="Fermer l'image" onClick={onClose}><Icone nom="fermer" taille={24} /></button>
      <figure onClick={e => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={grande || apercu} alt={legende || "Réalisation"} />
        {(legende || !grande) && <figcaption>{legende}{!grande && <span className="lb-chg"> · chargement…</span>}</figcaption>}
      </figure>
    </div>
  );
}
