import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../components/Layout";
import { supabase } from "../lib/supabase";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export default function Demande() {
  const { query } = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const d = new FormData(form);
    if (d.get("website")) return; // piège anti-robot
    const files = Array.from(form.elements.files.files || []);
    if (files.length > 3) return setError("3 fichiers maximum.");
    for (const f of files) {
      if (!TYPES.includes(f.type)) return setError(`Fichier non accepté : ${f.name} (images JPG/PNG/WebP ou PDF uniquement).`);
      if (f.size > MAX_BYTES) return setError(`Fichier trop volumineux : ${f.name} (5 Mo maximum).`);
    }
    setBusy(true);
    try {
      const folder = `requests/${crypto.randomUUID()}`;
      const paths = [];
      for (const f of files) {
        const safe = f.name.replace(/[^A-Za-z0-9._-]/g, "_").slice(-100);
        const path = `${folder}/${safe}`;
        const { error: upErr } = await supabase.storage.from("kargora-uploads").upload(path, f, { contentType: f.type });
        if (upErr) throw new Error("Échec de l'envoi du fichier " + f.name);
        paths.push(path);
      }
      const budget = d.get("budget");
      const { data, error: err } = await supabase.rpc("kargora_submit_request", {
        p_full_name: d.get("name"),
        p_phone: d.get("phone"),
        p_profile: d.get("profile"),
        p_description: d.get("description"),
        p_url: d.get("url") || null,
        p_quantity: Number(d.get("quantity")) || 1,
        p_origin: d.get("origin") || null,
        p_budget: budget ? Number(budget) : null,
        p_comment: d.get("comment") || null,
        p_files: paths,
      });
      if (err) throw new Error(err.message);
      setDone({ number: data, phone: d.get("phone") });
    } catch (ex) {
      setError(ex.message || "Une erreur est survenue. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <Layout title="Demande envoyée">
        <section className="block"><div className="wrap">
          <h2>Demande reçue</h2>
          <div className="notice ok">
            Votre numéro de demande : <strong style={{ fontSize: "1.4rem" }}>{done.number}</strong>
          </div>
          <p>Notez-le : il vous servira, avec votre numéro de téléphone, à suivre votre demande.</p>
          <p>Votre demande doit maintenant être étudiée. <strong>Ce n&apos;est pas une commande payée</strong> : aucun achat n&apos;est lancé et aucun paiement n&apos;est demandé à ce stade. Vous recevrez un devis.</p>
          <Link className="btn blue" href="/suivi">Suivre ma demande</Link>
        </div></section>
      </Layout>
    );
  }

  return (
    <Layout title="Demander un devis">
      <section className="block"><div className="wrap" style={{ maxWidth: 720 }}>
        <h2>Demander un devis</h2>
        <p className="muted">L&apos;envoi de ce formulaire ne vous engage pas et n&apos;est pas une commande payée.</p>
        <form className="f" onSubmit={onSubmit}>
          <div className="row2">
            <label>Nom et prénom<input name="name" required minLength={2} maxLength={120} autoComplete="name" /></label>
            <label>Téléphone / WhatsApp<input name="phone" type="tel" required minLength={8} maxLength={30} autoComplete="tel" placeholder="+236 …" /></label>
          </div>
          <label>Vous êtes
            <select name="profile" defaultValue={query.profil || "particulier"} key={query.profil || "p"}>
              <option value="particulier">Particulier</option>
              <option value="commercant">Commerçant</option>
              <option value="entreprise">Entreprise</option>
            </select>
          </label>
          <label>Nom ou description du produit<textarea name="description" required minLength={3} maxLength={2000} rows={4} /></label>
          <label>Lien du produit <span className="opt">(facultatif)</span><input name="url" type="url" maxLength={1000} placeholder="https://…" /></label>
          <div className="row2">
            <label>Quantité souhaitée<input name="quantity" type="number" min={1} max={1000000} defaultValue={1} required /></label>
            <label>Budget indicatif en FCFA <span className="opt">(facultatif)</span><input name="budget" type="number" min={0} /></label>
          </div>
          <label>Pays ou fournisseur souhaité <span className="opt">(facultatif)</span><input name="origin" maxLength={200} /></label>
          <label>Photo ou document <span className="opt">(facultatif, 3 fichiers, 5 Mo max : JPG, PNG, WebP, PDF)</span>
            <input name="files" type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf" />
          </label>
          <label>Commentaire complémentaire <span className="opt">(facultatif)</span><textarea name="comment" maxLength={2000} rows={3} /></label>
          <div className="hp" aria-hidden="true"><label>Site web<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          {error && <div className="notice err" role="alert">{error}</div>}
          <button className="btn" disabled={busy}>{busy ? "Envoi en cours…" : "Envoyer ma demande"}</button>
          <p className="muted" style={{ fontSize: ".85rem", margin: 0 }}>En envoyant ce formulaire, vous acceptez que vos données servent à traiter votre demande (voir <Link href="/conditions">Conditions et confidentialité</Link>).</p>
        </form>
      </div></section>
    </Layout>
  );
}
