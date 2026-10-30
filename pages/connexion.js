import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../components/Layout";
import { supabase } from "../lib/supabase";

export default function Connexion() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function onSubmit(e) {
    e.preventDefault();
    setError(""); setBusy(true);
    const d = new FormData(e.currentTarget);
    const { error: err } = await supabase.auth.signInWithPassword({ email: d.get("email"), password: d.get("password") });
    setBusy(false);
    if (err) return setError("E-mail ou mot de passe incorrect, ou compte non confirmé.");
    const next = typeof router.query.next === "string" && router.query.next.startsWith("/") ? router.query.next : "/compte";
    router.push(next);
  }
  return (
    <Layout title="Connexion">
      <div className="authbox"><div className="card">
        <h2>Connexion</h2>
        <p className="muted">Accédez à vos demandes, devis et commandes.</p>
        <form className="f" onSubmit={onSubmit}>
          <label>E-mail<input name="email" type="email" required autoComplete="username" /></label>
          <label>Mot de passe<input name="password" type="password" required autoComplete="current-password" /></label>
          {error && <div className="notice err" role="alert">{error}</div>}
          <button className="btn" disabled={busy}>{busy ? "Connexion…" : "Se connecter"}</button>
        </form>
        <p className="muted mt">Pas encore de compte ? <Link href="/inscription">Créer un compte</Link></p>
        <p className="muted" style={{ fontSize: ".85rem" }}>Mot de passe oublié ? Contactez-nous via la page <Link href="/contact">Contact</Link>.</p>
      </div></div>
    </Layout>
  );
}
