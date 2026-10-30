import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function AdminGate({ children }) {
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");

  async function check() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return setState("out");
    const { data } = await supabase.rpc("kargora_is_admin");
    if (data === true) return setState("ok");
    await supabase.auth.signOut();
    setError("Ce compte n'a pas accès à l'administration KARGORA.");
    setState("out");
  }
  useEffect(() => { check(); }, []);

  async function login(e) {
    e.preventDefault();
    setError("");
    const d = new FormData(e.currentTarget);
    const { error: err } = await supabase.auth.signInWithPassword({ email: d.get("email"), password: d.get("password") });
    if (err) return setError("Identifiants incorrects.");
    check();
  }

  if (state === "loading") return <div className="wrap" style={{ padding: 24 }}>Chargement…</div>;
  if (state === "out") {
    return (
      <div className="wrap" style={{ maxWidth: 420, padding: "48px 16px" }}>
        <Head><title>Administration · KARGORA</title><meta name="robots" content="noindex" /></Head>
        <h2>Administration KARGORA</h2>
        <form className="f" onSubmit={login}>
          <label>E-mail<input name="email" type="email" required autoComplete="username" /></label>
          <label>Mot de passe<input name="password" type="password" required autoComplete="current-password" /></label>
          {error && <div className="notice err" role="alert">{error}</div>}
          <button className="btn blue">Se connecter</button>
        </form>
      </div>
    );
  }
  return (
    <>
      <Head><title>Administration · KARGORA</title><meta name="robots" content="noindex" /></Head>
      <header className="site"><div className="wrap">
        <Link href="/admin" className="brand">KARGORA<small>ADMINISTRATION</small></Link>
        <button className="btn sm alt" onClick={async () => { await supabase.auth.signOut(); setState("out"); }}>Déconnexion</button>
      </div></header>
      <div className="wrap" style={{ paddingTop: 20, paddingBottom: 40 }}>{children}</div>
    </>
  );
}
