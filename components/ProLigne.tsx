import Link from "next/link";
import Avatar from "./Avatar";
import { niveau, stats, type Card } from "@/lib/data";

export default function ProLigne({ c }: { c: Card }) {
  const s = stats(c.slug);
  return (
    <Link href={`/p/${c.slug}`} className="pro">
      <Avatar nom={c.nom} />
      <span><b>{c.nom}</b><small>{c.metier} · {c.lieu}{s.chantiers ? ` · ${s.chantiers} chantier${s.chantiers > 1 ? "s" : ""} confirmé${s.chantiers > 1 ? "s" : ""}` : ""}</small></span>
      <span className="lv">Niveau {niveau(c)}</span>
    </Link>
  );
}
