"use client";

import { useId, useRef, useState } from "react";
import Icone from "./Icone";
import Avatar from "./Avatar";
import { compresserAvatar, compresserPhoto, messageImage, octets, type Image } from "@/lib/image";

/** Choix d'une image avec aperçu et compression avant envoi. `avatar` : carré (photo de profil, logo). Sinon : image libre (réalisation). */
export default function ChampPhoto({ etiquette, nom = "", avatar = false, carre = false, valeur, onChange, aide }: {
  etiquette: string; nom?: string; avatar?: boolean; carre?: boolean; valeur: Image | null; onChange: (i: Image | null) => void; aide?: string;
}) {
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState("");
  const [travail, setTravail] = useState(false);
  async function choisir(f?: File | null) {
    if (!f) return;
    setErr(""); setTravail(true);
    try { onChange(avatar ? await compresserAvatar(f) : await compresserPhoto(f)); }
    catch (e) { setErr(messageImage(e) || "Impossible de lire cette image."); }
    finally { setTravail(false); if (ref.current) ref.current.value = ""; }
  }
  return (
    <div className="champ-photo">
      <label htmlFor={id} style={{ marginTop: 16 }}>{etiquette}</label>
      <div className="champ-photo-ligne">
        {avatar
          ? <Avatar nom={nom || "?"} taille={72} carre={carre} photo={valeur?.data} />
          // eslint-disable-next-line @next/next/no-img-element
          : valeur ? <img src={valeur.thumb} alt="Aperçu de l'image choisie" className="apercu" /> : <span className="apercu vide-ap"><Icone nom="photo" taille={28} trait={1.5} /></span>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <input ref={ref} id={id} type="file" accept="image/*" onChange={e => choisir(e.target.files?.[0])} style={{ position: "absolute", opacity: 0, width: 1, height: 1, minHeight: 1, pointerEvents: "none" }} aria-describedby={`${id}-a`} />
          <div className="lignes">
            <button type="button" className="btn petit" onClick={() => ref.current?.click()} disabled={travail}><Icone nom="photo" taille={18} />{travail ? "Réduction de l'image…" : valeur ? "Changer" : "Choisir une image"}</button>
            {valeur && !travail && <button type="button" className="btn petit" onClick={() => onChange(null)}>Retirer</button>}
          </div>
          <p id={`${id}-a`} className="mute petit" style={{ marginTop: 6 }}>{valeur ? `Image réduite : ${Math.max(1, Math.round(octets(valeur.data) / 1024))} Ko.` : aide || "Elle est réduite automatiquement pour charger vite, même avec peu de réseau."}</p>
        </div>
      </div>
      {err && <p className="err" role="alert">{err}</p>}
    </div>
  );
}
