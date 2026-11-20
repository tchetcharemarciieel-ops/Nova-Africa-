import { couleur, initiales } from "@/lib/constants";

/** Photo réelle si elle existe, sinon les initiales sur fond de couleur. */
export default function Avatar({ nom, taille = 48, carre = false, badge = false, photo }: { nom: string; taille?: number; carre?: boolean; badge?: boolean; photo?: string | null }) {
  const c = couleur(nom);
  const rayon = carre ? Math.round(taille * 0.24) : "50%";
  return (
    <span aria-hidden="true" style={{ position: "relative", display: "inline-block", flex: "none", width: taille, height: taille }}>
      {photo
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={photo} alt="" width={taille} height={taille} style={{ width: taille, height: taille, borderRadius: rayon, objectFit: "cover", display: "block", boxShadow: "0 1px 2px rgba(16,24,40,.12)", background: "#f2f4f7" }} />
        : <span className="av" style={{ width: taille, height: taille, borderRadius: rayon, background: `linear-gradient(140deg, rgba(255,255,255,.22), rgba(0,0,0,.14)), ${c}`, fontSize: taille * 0.36, boxShadow: "0 1px 2px rgba(16,24,40,.12)" }}>{initiales(nom)}</span>}
      {badge && <span style={{ position: "absolute", right: -1, bottom: -1, width: Math.max(16, taille * 0.28), height: Math.max(16, taille * 0.28), borderRadius: "50%", background: "#12B76A", border: "2px solid #fff", display: "grid", placeItems: "center", color: "#fff" }}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.500" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.500 4.500 4.500L19 7.500" /></svg></span>}
    </span>
  );
}
