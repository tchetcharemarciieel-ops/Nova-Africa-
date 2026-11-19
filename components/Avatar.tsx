import { couleur, initiales } from "@/lib/constants";

export default function Avatar({ nom, taille = 48, bord = false }: { nom: string; taille?: number; bord?: boolean }) {
  return (
    <span aria-hidden="true" className="av" style={{ width: taille, height: taille, borderRadius: "50%", background: couleur(nom), fontSize: taille * 0.38, border: bord ? undefined : "0" }}>
      {initiales(nom)}
    </span>
  );
}
