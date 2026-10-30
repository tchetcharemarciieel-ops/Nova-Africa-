import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../components/Layout";
import { supabase } from "../lib/supabase";
import { useUser } from "../lib/auth";
import { fcfa } from "../lib/format";
import { ASSISTANT_READY } from "../lib/flags";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export default function Demande() {
  const { query } = useRouter();
  const user = useUser();
  const meta = user?.user_metadata || {};
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const [info, setInfo] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  async function analyze(form) {
    const url = form.elements.url.value.trim();
    if (!url) return setInfo({ error: "Collez d'abord le lien du produit." });
    setAnalyzing(true); setInfo(null);
    const { data, error: err } = await supabase.functions.invoke("kargora-assistant", { body: { mode: "link", url, quantity: Number(form.elements.quantity.value) || 1 } });
    setAnalyzing(false);
    if (err || data?.error) {
      let msg = data?.error;
      try { if (!msg && err?.context) msg = (await err.context.json()).error; } catch { /* ignore */ }
      return setInfo({ error: msg || "Analyse impossible. Vous pouvez quand même envoyer votre demande." });
    }
    setInfo(data);
    if (data.product?.title && !form.elements.description.value.trim()) form.elements.description.value = data.product.title;
  }

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
            <label>Nom et prénom<input name="name" key={"n" + (meta.full_name || "")} defaultValue={meta.full_name || ""} required minLength={2} maxLength={120} autoComplete="name" /></label>
            <label>Téléphone / WhatsApp<input name="phone" type="tel" key={"p" + (meta.phone || "")} defaultValue={meta.phone || ""} required minLength={8} maxLength={30} autoComplete="tel" placeholder="+236 …" /></label>
          </div>
          <label>Vous êtes
            <select name="profile" defaultValue={query.profil || "particulier"} key={query.profil || "p"}>
              <option value="particulier">Particulier</option>
              <option value="commercant">Commerçant</option>
              <option value="entreprise">Entreprise</option>
            </select>
          </label>
          <label>Nom ou description du produit<textarea name="description" required minLength={3} maxLength={2000} rows={4} /></label>
          <label>Lien du produit <span className="opt">(facultatif)</span>
            <span style={{ display: "flex", gap: 8 }}><input name="url" type="url" maxLength={1000} placeholder="https://…" style={{ flex: 1 }} />{ASSISTANT_READY && <button type="button" className="btn sm blue" disabled={analyzing} onClick={(e) => analyze(e.currentTarget.form)}>{analyzing ? "Analyse…" : "Analyser le lien"}</button>}</span>
          </label>
          {info && (info.error ? <div className="notice err" role="alert">{info.error}</div> : (
            <div className="linkbox" role="status">
              <div className="row">
                {info.product?.image && <img src={info.product.image} alt="" referrerPolicy="no-referrer" />}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div className="muted" style={{ fontSize: ".8rem" }}>{info.host}</div>
                  <b>{info.product?.title || "Produit détecté"}</b>
                  {info.product?.price && <div>Prix affiché : {info.product.price} {info.product.currency || ""}</div>}
                </div>
              </div>
              {info.estimate?.status === "range" && <div className="notice ok"><b>Estimation indicative : entre {fcfa(info.estimate.min_xaf)} et {fcfa(info.estimate.max_xaf)}</b><br />Produit, transport, douane estimée et frais de service. Le montant exact est fixé dans votre devis.</div>}
              {info.estimate?.status === "product_only" && <div className="notice">Prix du produit : environ {fcfa(info.estimate.product_xaf)}. Le transport, la douane estimée et les frais de service seront précisés dans votre devis.</div>}
              {info.estimate?.status === "no_rate" && <div className="notice">Conversion en FCFA indisponible pour le moment. Le prix sera établi dans votre devis.</div>}
              {info.estimate?.status === "no_price" && <div className="notice">Prix non détecté automatiquement (certains sites bloquent la lecture). L&apos;équipe le vérifiera dans votre devis.</div>}
              {info.wholesale && <div className="notice err"><b>Commande en gros :</b> {info.wholesale.message} Augmentez la quantité ou demandez un devis professionnel.</div>}
            </div>
          ))}
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
