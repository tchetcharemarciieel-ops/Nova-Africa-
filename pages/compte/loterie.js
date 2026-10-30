import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ClientGate from "../../components/ClientGate";
import Icon from "../../components/Icons";
import { supabase } from "../../lib/supabase";
import { dtWat, inText } from "../../lib/auth";

function Lottery() {
  const [st, setSt] = useState(null);
  const [msg, setMsg] = useState("");
  const [, tick] = useState(0);
  const load = useCallback(async () => { const { data } = await supabase.rpc("kargora_lottery_state"); setSt(data); }, []);
  useEffect(() => { load(); const t = setInterval(() => tick((x) => x + 1), 30000); return () => clearInterval(t); }, [load]);
  async function enter(id) {
    setMsg("");
    const { error } = await supabase.rpc("kargora_lottery_enter", { p_draw: id });
    setMsg(error ? error.message : "Participation enregistrée. Bonne chance !");
    load();
  }
  return (
    <>
      <div className="topbar"><h1>Tirage au sort gratuit</h1><Link href="/loterie" className="btn sm alt">Règlement</Link></div>
      {msg && <div className={`notice ${msg.includes("enregistrée") ? "ok" : "err"} mb`} role="status">{msg}</div>}
      {st?.won?.length > 0 && <div className="notice ok mb"><strong>Félicitations !</strong> Vous avez gagné : {st.won.map((w) => w.prize).join(" · ")}. L&apos;équipe KARGORA vous contactera pour vérifier votre identité et remettre le lot.</div>}
      <div className="list">
        {st === null ? <div className="empty">Chargement…</div> : st.upcoming.length === 0 ? (
          <div className="empty"><div className="icon"><Icon name="gift" /></div><b>Prochain tirage bientôt annoncé</b><p>Le lot est en cours de confirmation par KARGORA.</p></div>
        ) : st.upcoming.map((d) => (
          <div className="draw" key={d.id}>
            <div><b style={{ textTransform: "capitalize" }}>{dtWat(d.scheduled_at)}</b><div className="muted">Lot : {d.prize}</div><div className="count">{inText(new Date(d.scheduled_at) - Date.now())} · {d.entries} participant{d.entries > 1 ? "s" : ""}</div></div>
            {d.entered ? <span className="pill ok">Vous participez ✓</span> : <button className="btn sm" onClick={() => enter(d.id)}>Participer gratuitement</button>}
          </div>
        ))}
      </div>
      <h3 className="mt">Derniers résultats</h3>
      <div className="list">
        {st?.past?.length ? st.past.map((d, i) => (
          <div className="draw" key={i}><div><b style={{ textTransform: "capitalize" }}>{dtWat(d.scheduled_at)}</b><div className="muted">Lot : {d.prize}</div></div>
            <span>{d.status === "drawn" ? <>Gagnant : <b>{d.winner}</b> <span className="muted">({d.entries} participants)</span></> : <span className="muted">Aucun participant</span>}</span></div>
        )) : <div className="empty">Aucun tirage effectué pour le moment.</div>}
      </div>
    </>
  );
}
export default function Loterie() { return <ClientGate title="Tirage au sort"><Lottery /></ClientGate>; }
