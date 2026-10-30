import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../components/Layout";
import { supabase } from "../lib/supabase";
import { useUser } from "../lib/auth";
import { SERVICES, OTHER_SERVICES, OPERATIONS } from "../lib/services";

export default function DemandeNumerique() {
  const { query } = useRouter();
  const user = useUser();
  const meta = user?.user_metadata || {};
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const d = new FormData(e.currentTarget);
    if (d.get("website")) return;
    setBusy(true);
    const detail = [
      `Opération : ${d.get("operation")}`,
      d.get("duration") && `Durée / montant : ${d.get("duration")}`,
      d.get("region") && `Région du compte : ${d.get("region")}`,
      d.get("details") && `Précisions : ${d.get("details")}`,
    ].filter(Boolean).join("\n");
    const { data, error: err } = await supabase.rpc("kargora_submit_digital_request", {
      p_full_name: d.get("name"), p_phone: d.get("phone"), p_profile: d.get("profile"),
      p_service: d.get("service"), p_description: detail,
      p_quantity: Number(d.get("quantity")) || 1,
      p_budget: d.get("budget") ? Number(d.get("budget")) : null,
    });
    setBusy(false);
    if (err) return setError("Envoi impossible. Vérifiez les champs et réessayez.");
    setDone(data);
  }

  if (done) {
    return (
      <Layout title="Demande envoyée">
        <section className="block"><div className="wrap">
          <h2>Demande reçue</h2>
          <div className="notice ok">Votre numéro de demande : <strong style={{ fontSize: "1.4rem" }}>{done}</strong></div>
          <p>Ce n&apos;est pas une commande payée. Nous vérifions la disponibilité et le prix, puis vous recevrez un devis. Notez ce numéro pour suivre votre demande.</p>
          <Link className="btn blue" href="/suivi">Suivre ma demande</Link>
        </div></section>
      </Layout>
    );
  }

  return (
    <Layout title="Demande de service numérique" hero={{ eyebrow: "Service numérique", title: "Demande de service numérique", sub: "Abonnement, renouvellement, carte cadeau ou crédit : décrivez-nous votre besoin." }}>
      <section className="block"><div className="wrap" style={{ maxWidth: 720 }}>
        <h2>Demande de service numérique</h2>
        <div className="notice"><strong>Ne nous envoyez jamais votre mot de passe</strong>, ni de code de sécurité reçu par SMS ou e-mail. Nous n&apos;en avons pas besoin pour établir un devis.</div>
        <form className="f mt" onSubmit={onSubmit}>
          <div className="row2">
            <label>Service
              <select name="service" required defaultValue={query.service || ""} key={query.service || "s"}>
                <option value="" disabled>Choisir…</option>
                {[...SERVICES, ...OTHER_SERVICES].map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <label>Type de demande<select name="operation">{OPERATIONS.map((o) => <option key={o}>{o}</option>)}</select></label>
          </div>
          <div className="row2">
            <label>Durée ou montant souhaité<input name="duration" maxLength={100} placeholder="ex. 3 mois, carte de 25 USD" /></label>
            <label>Région du compte <span className="opt">(facultatif)</span><input name="region" maxLength={100} placeholder="ex. compte Apple France" /></label>
          </div>
          <label>Précisions <span className="opt">(facultatif)</span><textarea name="details" maxLength={1500} rows={3} /></label>
          <div className="row2">
            <label>Nom et prénom<input name="name" key={"n" + (meta.full_name || "")} defaultValue={meta.full_name || ""} required minLength={2} maxLength={120} autoComplete="name" /></label>
            <label>Téléphone / WhatsApp<input name="phone" type="tel" key={"p" + (meta.phone || "")} defaultValue={meta.phone || ""} required minLength={8} maxLength={30} autoComplete="tel" /></label>
          </div>
          <div className="row2">
            <label>Vous êtes<select name="profile"><option value="particulier">Particulier</option><option value="commercant">Commerçant</option><option value="entreprise">Entreprise</option></select></label>
            <label>Quantité<input name="quantity" type="number" min={1} defaultValue={1} required /></label>
          </div>
          <label>Budget indicatif en FCFA <span className="opt">(facultatif)</span><input name="budget" type="number" min={0} /></label>
          <div className="hp" aria-hidden="true"><label>Site web<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          {error && <div className="notice err" role="alert">{error}</div>}
          <button className="btn" disabled={busy}>{busy ? "Envoi…" : "Envoyer ma demande"}</button>
        </form>
      </div></section>
    </Layout>
  );
}
