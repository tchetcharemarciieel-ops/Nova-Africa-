import { useState } from "react";
import Layout from "../components/Layout";
import { supabase } from "../lib/supabase";
import { fcfa, dateFr, dayFr, METHODS } from "../lib/format";

const LINES = [
  ["purchase_price", "Prix d'achat du produit"],
  ["transport_hub", "Transport jusqu'au point de regroupement"],
  ["transport_intl", "Transport international"],
  ["insurance", "Assurance"],
  ["customs_estimate", "Droits et taxes douaniers (estimation)"],
  ["local_fees", "Frais locaux"],
  ["service_fee", "Frais de service KARGORA"],
];
const PAY_LABEL = { payment_orange_money: METHODS.orange_money, payment_virement: METHODS.virement, payment_especes: METHODS.especes };

export default function Suivi() {
  const [creds, setCreds] = useState({ number: "", phone: "" });
  const [res, setRes] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function lookup(e) {
    e?.preventDefault();
    setError(""); setBusy(true);
    const { data, error: err } = await supabase.rpc("kargora_track", { p_number: creds.number, p_phone: creds.phone });
    setBusy(false);
    if (err) return setError("Une erreur est survenue. Réessayez.");
    if (!data) { setRes(null); return setError("Aucune demande ne correspond à ce numéro et à ce téléphone."); }
    setRes(data);
  }

  async function respond(accept) {
    if (!confirm(accept ? "Confirmer l'acceptation de ce devis ?" : "Confirmer le refus de ce devis ?")) return;
    setError(""); setBusy(true);
    const { data, error: err } = await supabase.rpc("kargora_respond_quote", { p_number: creds.number, p_phone: creds.phone, p_accept: accept });
    setBusy(false);
    if (err) return setError(err.message);
    setRes(data);
  }

  const q = res?.quote;
  return (
    <Layout title="Suivre ma commande">
      <section className="block"><div className="wrap" style={{ maxWidth: 760 }}>
        <h2>Suivre ma commande</h2>
        <form className="f" onSubmit={lookup}>
          <div className="row2">
            <label>Numéro de demande<input value={creds.number} onChange={(e) => setCreds({ ...creds, number: e.target.value })} required placeholder="KRG-XXXXXXXX" /></label>
            <label>Téléphone utilisé pour la demande<input type="tel" value={creds.phone} onChange={(e) => setCreds({ ...creds, phone: e.target.value })} required /></label>
          </div>
          <button className="btn blue" disabled={busy}>{busy ? "Recherche…" : "Rechercher"}</button>
        </form>
        {error && <div className="notice err mt" role="alert">{error}</div>}

        {res && (
          <div className="mt">
            <div className="card">
              <div className="muted">Demande {res.number} · {dayFr(res.created_at)}{res.kind === "numerique" && " · service numérique"}</div>
              <h3 style={{ marginTop: 6 }}>Statut : <span className="badge">{res.status}</span></h3>
              {res.note && <p>{res.note}</p>}
              <p className="muted" style={{ marginBottom: 0 }}>Produit : {res.product}</p>
            </div>

            {q && (
              <div className="card mt">
                <h3>Devis {q.status === "accepted" ? "accepté" : q.status === "refused" ? "refusé" : q.status === "expired" ? "expiré" : "à examiner"}</h3>
                <p>{q.designation} — quantité : {q.quantity}</p>
                <div className="scroll"><table className="t"><tbody>
                  {LINES.filter(([k]) => q[k] > 0).map(([k, l]) => <tr key={k}><td>{l}</td><td className="right">{fcfa(q[k])}</td></tr>)}
                  <tr><th>Total {q.total_confirmed ? "confirmé" : "estimatif"}</th><th className="right">{fcfa(q.total)}</th></tr>
                </tbody></table></div>
                <p className="muted">Valable jusqu&apos;au {dayFr(q.valid_until)}.{q.delivery_estimate && <> Délai estimatif : {q.delivery_estimate}.</>}</p>
                {q.conditions && <p className="muted">Conditions : {q.conditions}</p>}
                {!q.total_confirmed && <div className="notice">Le total est une estimation, notamment pour les droits et taxes douaniers.</div>}
                {q.status === "sent" && (
                  <p className="mt">
                    <button className="btn" disabled={busy} onClick={() => respond(true)}>Accepter le devis</button>{" "}
                    <button className="btn danger" disabled={busy} onClick={() => respond(false)}>Refuser</button>
                  </p>
                )}
              </div>
            )}

            {res.payment_instructions && res.status_code === 4 && (
              <div className="card mt">
                <h3>Instructions de paiement</h3>
                {Object.entries(res.payment_instructions).map(([k, v]) => <p key={k}><strong>{PAY_LABEL[k] || k}</strong><br />{v}</p>)}
                <div className="notice">Indiquez le numéro {res.number} lors du paiement. Votre paiement sera confirmé par KARGORA après vérification ; l&apos;envoi d&apos;une capture d&apos;écran ne suffit pas.</div>
              </div>
            )}

            <h3 className="mt">Historique</h3>
            <ul className="timeline">
              {[...res.history].reverse().map((h, i) => (
                <li key={i}><strong>{h.status}</strong><br /><small>{dateFr(h.at)}</small>{h.note && <div>{h.note}</div>}</li>
              ))}
            </ul>
          </div>
        )}
      </div></section>
    </Layout>
  );
}
