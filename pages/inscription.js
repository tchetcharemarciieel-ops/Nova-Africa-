import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../components/Layout";
import { supabase } from "../lib/supabase";
import { SIGNUP_OPEN } from "../lib/flags";

export default function Inscription() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const d = new FormData(e.currentTarget);
    if (d.get("website")) return;
    if (d.get("password") !== d.get("password2")) return setError("Les deux mots de passe ne sont pas identiques.");
    setBusy(true);
    const { data, error: err } = await supabase.auth.signUp({
      email: d.get("email"),
      password: d.get("password"),
      options: { data: { app: "kargora", full_name: d.get("name"), phone: d.get("phone"), account_type: d.get("type") } },
    });
    setBusy(false);
    if (err) return setError(err.message.includes("Password") ? "Mot de passe trop faible (10 caractères minimum, mélangez lettres et chiffres)." : "Création impossible. Vérifiez vos informations.");
    if (data.session) return router.push("/compte");
    setSent(true);
  }
  if (!SIGNUP_OPEN) return (
    <Layout title="Créer un compte"><div className="authbox"><div className="card">
      <h2>Inscriptions bientôt ouvertes</h2>
      <p>La création de comptes ouvre très prochainement. En attendant, vous pouvez <Link href="/demande">faire une demande de devis</Link> sans compte et la suivre avec son numéro.</p>
    </div></div></Layout>
  );
  if (sent) return (
    <Layout title="Vérifiez votre e-mail"><div className="authbox"><div className="card">
      <h2>Vérifiez votre e-mail</h2>
      <p>Nous venons de vous écrire. Cliquez sur le lien de confirmation, puis revenez vous <Link href="/connexion">connecter</Link>.</p>
      <p className="muted">Pensez à regarder dans vos courriers indésirables.</p>
    </div></div></Layout>
  );
  return (
    <Layout title="Créer un compte">
      <div className="authbox"><div className="card">
        <h2>Créer un compte</h2>
        <p className="muted">Suivez vos demandes, acceptez vos devis et participez au tirage au sort gratuit.</p>
        <form className="f" onSubmit={onSubmit}>
          <label>Type de compte<select name="type" defaultValue="particulier"><option value="particulier">Particulier</option><option value="commercant">Commerçant</option><option value="entreprise">Entreprise</option></select></label>
          <label>Nom et prénom<input name="name" required minLength={2} maxLength={120} autoComplete="name" /></label>
          <label>Téléphone / WhatsApp<input name="phone" type="tel" required minLength={8} maxLength={30} autoComplete="tel" placeholder="+236 …" /></label>
          <label>E-mail<input name="email" type="email" required autoComplete="email" /></label>
          <label>Mot de passe<input name="password" type="password" required minLength={10} autoComplete="new-password" /></label>
          <label>Confirmer le mot de passe<input name="password2" type="password" required minLength={10} autoComplete="new-password" /></label>
          <div className="hp" aria-hidden="true"><label>Site web<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          {error && <div className="notice err" role="alert">{error}</div>}
          <button className="btn" disabled={busy}>{busy ? "Création…" : "Créer mon compte"}</button>
          <p className="muted" style={{ fontSize: ".85rem", margin: 0 }}>En créant un compte, vous acceptez les <Link href="/conditions">conditions et la politique de confidentialité</Link>.</p>
        </form>
        <p className="muted mt">Déjà inscrit ? <Link href="/connexion">Se connecter</Link></p>
      </div></div>
    </Layout>
  );
}
