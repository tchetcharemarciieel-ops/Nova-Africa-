import { useEffect } from "react";
import { useRouter } from "next/router";
import AppShell, { CLIENT_NAV } from "./AppShell";
import { useUser } from "../lib/auth";

export default function ClientGate({ title, children }) {
  const user = useUser();
  const router = useRouter();
  useEffect(() => {
    if (user === null) router.replace(`/connexion?next=${encodeURIComponent(router.asPath)}`);
  }, [user, router]);
  if (!user) return <div className="wrap" style={{ padding: 32 }}>Chargement…</div>;
  return <AppShell title={title} items={CLIENT_NAV}>{typeof children === "function" ? children(user) : children}</AppShell>;
}
