import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import ClientGate from "../../components/ClientGate";
import { supabase } from "../../lib/supabase";
import { fcfa, dateFr, dayFr, METHODS } from "../../lib/format";
import { progress } from "../../lib/status";

const LINES = [["purchase_price", "Prix d'achat"], ["transport_hub", "Transport jusqu'au regroupement"], ["transport_intl", "Transport international"], ["insurance", "Assurance"], ["customs_estimate", "Droits et taxes (estimation)"], ["local_fees", "Frais locaux"], ["service_fee", "Frais de service KARGORA"]];
const PAY = { payment_orange_money: METHODS.orange_money, payment_virement: METHODS.virement, payment_especes: METHODS.especes };

function Detail() {
  const { query } = useRouter();
  const n = query.n;
  const [res, setRes] = useState(undefined);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const load = useCallback(async () => {
    const { data } = await supabase.rpc("kargora_my_request", { p_number: n });
    setRes(data || null);
  }, [n]);
  useEffect(() => { if (n) load(); }, [n, load]);

  async function respond(accept) {
    if (!confirm(accept ? "Confirmer l'acceptation de ce devis ?" : "Confirmer le refus de ce devis ?")) return;
    setBusy(true); setErr("");
    const { data, error } = await supabase.rpc("kargora_my_respond", { p_number: n, p_accept: accept });
    setBusy(false);
    if (error) return setErr(error.message);
    setRes(data);
  }
  if (res === undefined) return <p className="muted">Chargement…</p>;
  if (res === null) return <p>Demande introuvable. <Link href="/compte/commandes">Retour</Link></p>;
  const q = res.quote; const p = progress(res.kind, res.status_code);
  return (
    <>
      <p><Link href="/compte/commandes">← Mes commandes</Link></p>
      <div className="card">
        <div className="muted">{res.number} · {dayFr(res.created_at)}{res.kind === "numerique" && " · service numérique"}</div>
        <h2 style={{ marginTop: 6 }}>{res.status}</h2>
        <div className="steps">{Array.from({ length: p.total }).map((_, i) => <i key={i} className={p.cancelled ? "" : i + 1 < p.done ? "f" : i + 1 === p.done ? "c" : ""} />)}</div>
        {res.note && <p>{res.note}</p>}
        <p className="muted" style={{ whiteSpace: "pre-wrap", margin: 0 }}>{res.product}</p>
      </div>
      {q && (
        <div className="card mt">
          <h3>Devis {({ accepted: "accepté", refused: "refusé", expired: "expiré" })[q.status] || "à examiner"}</h3>
          <p>{q.designation} — quantité : {q.quantity}</p>
          <div className="scroll"><table className="t"><tbody>
            {LINES.filter(([k]) => q[k] > 0).map(([k, l]) => <tr key={k}><td>{l}</td><td className="right">{fcfa(q[k])}</td></tr>)}
            <tr><th>Total {q.total_confirmed ? "confirmé" : "estimatif"}</th><th className="right">{fcfa(q.total)}</th></tr>
          </tbody></table></div>
          <p className="muted">Valable jusqu&apos;au {dayFr(q.valid_until)}.{q.delivery_estimate && <> Délai estimatif : {q.delivery_estimate}.</>}</p>
          {q.conditions && <p className="muted">Conditions : {q.conditions}</p>}
          {!q.total_confirmed && <div className="notice">Total estimatif, notamment pour les droits et taxes douaniers.</div>}
          {err && <div className="notice err mt" role="alert">{err}</div>}
          {q.status === "sent" && <p className="mt"><button className="btn" disabled={busy} onClick={() => respond(true)}>Accepter le devis</button>{" "}<button className="btn danger" disabled={busy} onClick={() => respond(false)}>Refuser</button></p>}
        </div>
      )}
      {res.payment_instructions && res.status_code === 4 && (
        <div className="card mt"><h3>Instructions de paiement</h3>
          {Object.entries(res.payment_instructions).map(([k, v]) => <p key={k}><strong>{PAY[k] || k}</strong><br />{v}</p>)}
          <div className="notice">Indiquez {res.number} lors du paiement. KARGORA confirme chaque paiement après vérification : une capture d&apos;écran ne suffit pas.</div>
        </div>
      )}
      <h3 className="mt">Chronologie</h3>
      <ul className="timeline">{[...res.history].reverse().map((h, i) => <li key={i}><strong>{h.status}</strong><br /><small>{dateFr(h.at)}</small>{h.note && <div>{h.note}</div>}</li>)}</ul>
    </>
  );
}
export default function Commande() { return <ClientGate title="Détail de la commande"><Detail /></ClientGate>; }
