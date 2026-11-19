import { couleur, initiales } from "@/lib/data";

export default function Avatar({ nom, taille = 50 }: { nom: string; taille?: number }) {
  return (
    <span aria-hidden="true" className="av" style={{ width: taille, height: taille, borderRadius: taille * 0.32, background: couleur(nom), fontSize: taille * 0.36 }}>
      {initiales(nom)}
    </span>
  );
}
