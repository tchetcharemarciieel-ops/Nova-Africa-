import { couleur, initiales } from "@/lib/constants";

export default function Avatar({ nom, taille = 48, carre = false }: { nom: string; taille?: number; carre?: boolean }) {
  return (
    <span aria-hidden="true" className="av" style={{ width: taille, height: taille, borderRadius: carre ? 8 : "50%", background: couleur(nom), fontSize: taille * 0.36 }}>
      {initiales(nom)}
    </span>
  );
}
