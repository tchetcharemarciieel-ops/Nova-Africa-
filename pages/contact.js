import { useState } from "react";
import Layout from "../components/Layout";
import { supabase, CONTACT } from "../lib/supabase";

export default function Contact() {
  const [state, setState] = useState({ busy: false, ok: false, error: "" });

  async function onSubmit(e) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    if (d.get("website")) return;
    setState({ busy: true, ok: false, error: "" });
    const { error } = await supabase.rpc("kargora_send_message", {
      p_name: d.get("name"), p_phone: d.get("phone") || null, p_email: d.get("email") || null, p_message: d.get("message"),
    });
    if (error) return setState({ busy: false, ok: false, error: "Envoi impossible. Vérifiez les champs et réessayez." });
    e.target.reset();
    setState({ busy: false, ok: true, error: "" });
  }

  const hasInfo = CONTACT.whatsapp || CONTACT.email || CONTACT.address;
  return (
    <Layout title="Contact" hero={{ eyebrow: "Une question ?", title: "Contact", sub: "Écrivez-nous : l’équipe vous répond dès que possible." }}>
      <section className="block"><div className="wrap" style={{ maxWidth: 720 }}>
        {hasInfo && (
          <div className="card" style={{ marginBottom: 16 }}>
            {CONTACT.whatsapp && <div>WhatsApp : <strong>{CONTACT.whatsapp}</strong></div>}
            {CONTACT.email && <div>E-mail : <strong>{CONTACT.email}</strong></div>}
            {CONTACT.address && <div>Adresse : <strong>{CONTACT.address}</strong></div>}
          </div>
        )}
        <form className="f" onSubmit={onSubmit}>
          <div className="row2">
            <label>Nom<input name="name" required minLength={2} maxLength={120} /></label>
            <label>Téléphone <span className="opt">(facultatif)</span><input name="phone" type="tel" maxLength={30} /></label>
          </div>
          <label>E-mail <span className="opt">(facultatif)</span><input name="email" type="email" maxLength={200} /></label>
          <label>Message<textarea name="message" required minLength={3} maxLength={3000} rows={5} /></label>
          <div className="hp" aria-hidden="true"><label>Site web<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          {state.error && <div className="notice err" role="alert">{state.error}</div>}
          {state.ok && <div className="notice ok" role="status">Message envoyé. Nous vous répondrons dès que possible.</div>}
          <button className="btn" disabled={state.busy}>{state.busy ? "Envoi…" : "Envoyer"}</button>
        </form>
        <p className="muted mt">Pour une demande de produit, utilisez plutôt le formulaire « Demander un devis ».</p>
      </div></section>
    </Layout>
  );
}
