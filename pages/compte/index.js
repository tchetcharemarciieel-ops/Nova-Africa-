import { useEffect, useState } from "react";
import Link from "next/link";
import ClientGate from "../../components/ClientGate";
import Icon from "../../components/Icons";
import { supabase } from "../../lib/supabase";
import { firstName } from "../../lib/auth";
import { fcfa } from "../../lib/format";
import { kindLabel, groupByDay } from "../../lib/status";

function Home({ user }) {
  const [sum, setSum] = useState(null);
  const [rows, setRows] = useState(null);
  useEffect(() => {
    supabase.rpc("kargora_my_summary").then(({ data }) => setSum(data));
    supabase.rpc("kargora_my_requests").then(({ data }) => setRows(data || []));
  }, []);
  const S = ({ v, l, hot }) => <div className={`stat${hot && v > 0 ? " hot" : ""}`}><b>{v ?? "–"}</b><span>{l}</span></div>;
  return (
    <>
      <div className="greet">
        <div><h2>Bonjour {firstName(user) || ""} 👋</h2><p>Voici l&apos;état de vos demandes et commandes.</p></div>
        <Link href="/demande" className="btn">Nouvelle demande</Link>
      </div>
      <div className="quick">
        <Link href="/demande"><span className="icon"><Icon name="globe" /></span>Acheter un produit</Link>
        <Link href="/services-numeriques"><span className="icon"><Icon name="play" /></span>Service numérique</Link>
        <Link href="/compte/loterie"><span className="icon"><Icon name="gift" /></span>Tirage au sort</Link>
        <Link href="/compte/assistance"><span className="icon"><Icon name="chat" /></span>Contacter KARGORA</Link>
      </div>
      <div className="kpis mb">
        <S v={sum?.in_progress} l="Demandes en cours" />
        <S v={sum?.quotes_to_accept} l="Devis à accepter" hot />
        <S v={sum?.payments_pending} l="Paiements en attente" hot />
        <S v={sum?.ready_for_pickup} l="Disponibles au retrait" hot />
        <S v={sum?.total} l="Total des demandes" />
      </div>
      <h3>Dernières activités</h3>
      {rows === null ? <p className="muted">Chargement…</p> : rows.length === 0 ? (
        <div className="list"><div className="empty"><div className="icon"><Icon name="box" /></div><b>Aucune demande pour l&apos;instant</b><p>Décrivez un produit ou un service : nous vous répondons avec un devis.</p><Link href="/demande" className="btn sm">Faire une demande</Link></div></div>
      ) : (
        <div className="list">
          {groupByDay(rows.slice(0, 8)).map(([day, items]) => (
            <div key={day}><div className="day">{day}</div>
              {items.map((r) => (
                <Link key={r.number} href={`/compte/commande?n=${r.number}`} className="item">
                  <span className="ic"><Icon name={r.kind === "numerique" ? "play" : "box"} /></span>
                  <span className="tx"><b>{r.product}</b><small>{r.number} · {kindLabel(r)}</small></span>
                  <span className="badge">{r.status}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
      <p className="muted mt">Les montants affichés sont ceux de vos devis. {rows?.some((r) => r.quote_total) ? `Dernier devis : ${fcfa(rows.find((r) => r.quote_total)?.quote_total)}.` : ""}</p>
    </>
  );
}
export default function Compte() {
  return <ClientGate title="Mon espace">{(user) => <Home user={user} />}</ClientGate>;
}
