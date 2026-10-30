import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import Icon from "./Icons";
import { LogoMark } from "./Logo";
import { supabase } from "../lib/supabase";
import Assistant from "./Assistant";
import { ASSISTANT_READY } from "../lib/flags";

export default function AppShell({ title, items, children }) {
  const { pathname, push } = useRouter();
  const on = (h) => (h === "/compte" || h === "/admin" ? pathname === h : pathname.startsWith(h));
  const out = async () => { await supabase.auth.signOut(); push("/connexion"); };
  return (
    <div className="app">
      <Head><title>{title} · KARGORA</title><meta name="robots" content="noindex" /></Head>
      <aside className="side" aria-label="Navigation">
        <Link href="/" className="logo" aria-label="Accueil KARGORA"><LogoMark size={40} /></Link>
        {items.map((i) => (
          <Link key={i.href} href={i.href} className={on(i.href) ? "on" : ""}><Icon name={i.icon} /><span>{i.label}</span></Link>
        ))}
        <div className="sp" />
        <button className="lnk" onClick={out}><Icon name="out" /><span>Sortir</span></button>
      </aside>
      <div className="main-area">{children}</div>
      <nav className="tabbar" aria-label="Navigation mobile">
        {items.slice(0, 5).map((i) => (
          <Link key={i.href} href={i.href} className={on(i.href) ? "on" : ""}><Icon name={i.icon} /><span>{i.label}</span></Link>
        ))}
      </nav>
      {ASSISTANT_READY && <Assistant />}
    </div>
  );
}

export const CLIENT_NAV = [
  { href: "/compte", label: "Accueil", icon: "home" },
  { href: "/compte/commandes", label: "Commandes", icon: "box" },
  { href: "/compte/loterie", label: "Tirage", icon: "gift" },
  { href: "/compte/assistance", label: "Aide", icon: "chat" },
  { href: "/compte/profil", label: "Profil", icon: "user" },
];
