import { useEffect, useState } from "react";
import Link from "next/link";
import ClientGate from "../../components/ClientGate";
import Icon from "../../components/Icons";
import { supabase } from "../../lib/supabase";
import { dayFr, fcfa } from "../../lib/format";
import { kindLabel, progress } from "../../lib/status";

function List() {
  const [rows, setRows] = useState(null);
  const [f, setF] = useState("all");
  useEffect(() => { supabase.rpc("kargora_my_requests").then(({ data }) => setRows(data || [])); }, []);
  const shown = (rows || []).filter((r) => f === "all" || (f === "open" ? ![13, 14].includes(r.status_code) : [13, 14].includes(r.status_code)));
  return (
    <>
      <div className="topbar"><h1>Mes demandes et commandes</h1><Link href="/demande" className="btn sm">Nouvelle demande</Link></div>
      <div className="tabs">{[["all", "Toutes"], ["open", "En cours"], ["done", "Terminées"]].map(([k, l]) => <button key={k} className={f === k ? "on" : ""} onClick={() => setF(k)}>{l}</button>)}</div>
      {rows === null ? <p className="muted">Chargement…</p> : shown.length === 0 ? (
        <div className="list"><div className="empty"><div className="icon"><Icon name="list" /></div><b>Rien à afficher</b></div></div>
      ) : (
        <div className="list">
          {shown.map((r) => { const p = progress(r.kind, r.status_code); return (
            <Link key={r.number} href={`/compte/commande?n=${r.number}`} className="item">
              <span className="ic"><Icon name={r.kind === "numerique" ? "play" : "box"} /></span>
              <span className="tx"><b>{r.product}</b><small>{r.number} · {kindLabel(r)} · {dayFr(r.created_at)}</small>
                <span className="steps">{Array.from({ length: p.total }).map((_, i) => <i key={i} className={i < p.done ? "f" : ""} />)}</span></span>
              <span style={{ textAlign: "right" }}><span className="badge">{r.status}</span>{r.quote_total ? <div className="muted" style={{ fontSize: ".82rem" }}>{fcfa(r.quote_total)}</div> : null}</span>
            </Link>); })}
        </div>
      )}
    </>
  );
}
export default function Commandes() { return <ClientGate title="Mes commandes"><List /></ClientGate>; }
