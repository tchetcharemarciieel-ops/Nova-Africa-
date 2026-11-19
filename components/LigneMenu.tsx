import Link from "next/link";
import Icone, { type NomIcone } from "./Icone";

const TEINTES = {
  bleu: ["#EEF4FF", "#1D4ED8"], vert: ["#ECFDF3", "#047857"], gris: ["#F2F4F7", "#475467"], ambre: ["#FFFAEB", "#B54708"], rose: ["#FDF2FA", "#C11574"],
} as const;

export default function LigneMenu({ href, icone, teinte, titre, sous }: { href: string; icone: NomIcone; teinte: keyof typeof TEINTES; titre: string; sous: string }) {
  const [fond, trait] = TEINTES[teinte];
  return (
    <Link href={href} className="menu-ligne">
      <span className="menu-ico" style={{ background: fond, color: trait }}><Icone nom={icone} taille={22} /></span>
      <span className="menu-txt"><b>{titre}</b><small>{sous}</small></span>
      <span className="menu-chev"><Icone nom="chevron" taille={20} /></span>
    </Link>
  );
}
