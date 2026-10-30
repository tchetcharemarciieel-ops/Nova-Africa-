import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminGate from "../../components/AdminGate";
import { supabase } from "../../lib/supabase";
import { fcfa, dateFr, PROFILES, METHODS, csvCell } from "../../lib/format";

function Dashboard() {
  const [tab, setTab] = useState("demandes");
  const [reqs, setReqs] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [kpi, setKpi] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [settings, setSettings] = useState([]);
  const [q, setQ] = useState("");
  const [st, setSt] = useState("");
  const [kind, setKind] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    const [r, s, k, m, se] = await Promise.all([
      supabase.from("kargora_requests").select("*").order("created_at", { ascending: false }).limit(2000),
      supabase.from("kargora_statuses").select("*").order("code"),
      supabase.from("kargora_kpis").select("*").single(),
      supabase.from("kargora_messages").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("kargora_settings").select("*").order("key"),
    ]);
    const e = r.error || k.error || m.error;
    if (e) setErr(e.message);
    setReqs(r.data || []); setStatuses(s.data || []); setKpi(k.data); setMsgs(m.data || []); setSettings(se.data || []);
  }
  useEffect(() => { load(); }, []);

  const label = (c) => statuses.find((s) => s.code === c)?.label || c;
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return reqs.filter((r) => (!kind || r.kind === kind) && (!st || String(r.status_code) === st) &&
      (!t || [r.full_name, r.phone, r.number].some((v) => v?.toLowerCase().includes(t))));
  }, [reqs, q, st, kind]);

  const cats = useMemo(() => {
    const m = {};
    reqs.forEach((r) => { const k = r.category || "(non classé)"; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [reqs]);

  async function exportCsv() {
    const [o, p] = await Promise.all([
      supabase.from("kargora_orders").select("*"),
      supabase.from("kargora_payments").select("*").order("confirmed_at"),
    ]);
    const ord = Object.fromEntries((o.data || []).map((x) => [x.request_id, x]));
    const rows = [["Numéro", "Date", "Client", "Téléphone", "Profil", "Statut", "Facturé", "Coût achat", "Coût transport", "Coût douane", "Autres coûts", "Marge"]];
    reqs.forEach((r) => {
      const x = ord[r.id];
      if (!x) return;
      const cost = x.cost_purchase + x.cost_transport + x.cost_customs + x.cost_other;
      rows.push([r.number, r.created_at, r.full_name, r.phone, PROFILES[r.profile], label(r.status_code), x.billed_amount, x.cost_purchase, x.cost_transport, x.cost_customs, x.cost_other, x.billed_amount - cost]);
    });
    rows.push([]); rows.push(["Reçu", "Date", "Numéro demande", "Mode", "Montant", "Référence"]);
    const num = Object.fromEntries(reqs.map((r) => [r.id, r.number]));
    (p.data || []).forEach((x) => rows.push([x.receipt_number, x.confirmed_at, num[x.request_id], METHODS[x.method], x.amount, x.reference]));
    const blob = new Blob(["﻿" + rows.map((r) => r.map(csvCell).join(";")).join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `kargora-commandes-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  }

  async function toggleHandled(m) {
    await supabase.from("kargora_messages").update({ handled: !m.handled }).eq("id", m.id);
    load();
  }
  async function saveSetting(key, value) {
    const { error } = await supabase.from("kargora_settings").update({ value }).eq("key", key);
    alert(error ? error.message : "Enregistré");
  }

  const margin = kpi ? Number(kpi.sales_total) - Number(kpi.costs_total) : 0;
  const K = ({ v, l }) => <div className="kpi"><b>{v}</b><span>{l}</span></div>;

  return (
    <>
      {err && <div className="notice err">{err}</div>}
      {kpi && (
        <div className="kpis">
          <K v={kpi.requests_total} l="Demandes reçues" />
          <K v={kpi.requests_pro} l="Demandes professionnelles" />
          <K v={kpi.quotes_sent} l="Devis envoyés" />
          <K v={kpi.quotes_accepted} l="Devis acceptés" />
          <K v={kpi.orders_paid} l="Commandes payées" />
          <K v={fcfa(kpi.sales_total)} l="Ventes encaissées" />
          <K v={fcfa(kpi.costs_total)} l="Coûts réels saisis" />
          <K v={fcfa(margin)} l="Marge réelle" />
          <K v={kpi.repeat_customers} l="Clients qui recommandent" />
        </div>
      )}
      <div className="tabs">
        {[["demandes", "Demandes"], ["messages", `Messages (${msgs.filter((m) => !m.handled).length})`], ["categories", "Produits demandés"], ["reglages", "Instructions de paiement"]].map(([k, l]) => (
          <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>
        ))}
        <button onClick={exportCsv}>Exporter (CSV)</button>
      </div>

      {tab === "demandes" && (
        <>
          <div className="row2" style={{ marginBottom: 12 }}>
            <select className="i" value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="">Commandes physiques et numériques</option>
              <option value="physique">Physiques seulement</option>
              <option value="numerique">Numériques seulement</option>
            </select>
            <input className="i" placeholder="Rechercher : nom, téléphone ou numéro" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="i" value={st} onChange={(e) => setSt(e.target.value)}>
              <option value="">Tous les statuts</option>
              {statuses.map((s) => <option key={s.code} value={s.code}>{s.code}. {s.label}</option>)}
            </select>
          </div>
          <div className="scroll"><table className="t">
            <thead><tr><th>Numéro</th><th>Date</th><th>Client</th><th>Profil</th><th>Produit</th><th>Statut</th></tr></thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td><Link href={`/admin/${r.id}`}>{r.number}</Link></td>
                  <td>{dateFr(r.created_at)}</td>
                  <td>{r.full_name}<br /><span className="muted">{r.phone}</span></td>
                  <td>{PROFILES[r.profile]}<br /><span className="badge">{r.kind === "numerique" ? "Numérique" : "Physique"}</span></td>
                  <td>{r.product_description.slice(0, 70)}{r.product_description.length > 70 && "…"} ×{r.quantity}</td>
                  <td><span className="badge">{label(r.status_code)}</span></td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={6} className="muted">Aucune demande.</td></tr>}
            </tbody>
          </table></div>
        </>
      )}

      {tab === "messages" && (
        <div className="scroll"><table className="t"><tbody>
          {msgs.map((m) => (
            <tr key={m.id} style={{ opacity: m.handled ? 0.55 : 1 }}>
              <td>{dateFr(m.created_at)}</td>
              <td><strong>{m.full_name}</strong><br />{m.phone}<br />{m.email}</td>
              <td style={{ whiteSpace: "pre-wrap" }}>{m.message}</td>
              <td><button className="btn sm alt" onClick={() => toggleHandled(m)}>{m.handled ? "Rouvrir" : "Traité"}</button></td>
            </tr>
          ))}
          {!msgs.length && <tr><td className="muted">Aucun message.</td></tr>}
        </tbody></table></div>
      )}

      {tab === "categories" && (
        <div className="card"><h3>Catégories les plus demandées</h3>
          <p className="muted">Classez chaque demande dans une catégorie depuis sa fiche pour alimenter ce classement.</p>
          <table className="t"><tbody>{cats.map(([k, n]) => <tr key={k}><td>{k}</td><td className="right">{n}</td></tr>)}</tbody></table>
        </div>
      )}

      {tab === "reglages" && (
        <div className="card"><h3>Instructions de paiement</h3>
          <p className="muted">Affichées au client uniquement après acceptation de son devis. Renseignez-les seulement une fois le moyen de paiement validé contractuellement.</p>
          {settings.map((s) => (
            <form key={s.key} className="f" style={{ marginBottom: 12 }} onSubmit={(e) => { e.preventDefault(); saveSetting(s.key, new FormData(e.currentTarget).get("v")); }}>
              <label>{METHODS[s.key.replace("payment_", "")] || s.key}<textarea className="i" name="v" defaultValue={s.value} rows={2} /></label>
              <div><button className="btn sm blue">Enregistrer</button></div>
            </form>
          ))}
        </div>
      )}
    </>
  );
}

export default function AdminHome() {
  return <AdminGate><Dashboard /></AdminGate>;
}
