"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", nom: "Accueil" },
  { href: "/chercher", nom: "Chercher" },
  { href: "/besoins", nom: "Besoins" },
  { href: "/emplois", nom: "Emplois" },
  { href: "/creer", nom: "Ma carte" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="nav" aria-label="Navigation principale">
      {ITEMS.map(i => {
        const on = i.href === "/" ? path === "/" : path.startsWith(i.href) || (i.href === "/creer" && path.startsWith("/p/"));
        return <Link key={i.href} href={i.href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}><b aria-hidden="true" />{i.nom}</Link>;
      })}
    </nav>
  );
}
