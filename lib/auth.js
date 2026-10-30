import { useEffect, useState } from "react";
import { supabase } from "./supabase";

// undefined = chargement, null = déconnecté, objet = utilisateur connecté
export function useUser() {
  const [user, setUser] = useState(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user || null));
    return () => sub.subscription.unsubscribe();
  }, []);
  return user;
}

export const firstName = (u) => (u?.user_metadata?.full_name || "").split(" ")[0] || "";
export const WAT = "Africa/Bangui";
export const dtWat = (d) => new Date(d).toLocaleString("fr-FR", { timeZone: WAT, weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
export function inText(ms) {
  if (ms <= 0) return "en cours de traitement";
  const m = Math.floor(ms / 60000), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60);
  return d > 0 ? `dans ${d} j ${h} h` : h > 0 ? `dans ${h} h ${m % 60} min` : `dans ${m} min`;
}
