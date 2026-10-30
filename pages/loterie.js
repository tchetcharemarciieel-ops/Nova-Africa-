import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import Icon from "../components/Icons";
import { supabase } from "../lib/supabase";
import { useUser, dtWat, inText } from "../lib/auth";

export default function LoteriePublique() {
  const user = useUser();
  const [st, setSt] = useState(null);
  const [, tick] = useState(0);
  useEffect(() => {
    supabase.rpc("kargora_lottery_state").then(({ data }) => setSt(data));
    const t = setInterval(() => tick((x) => x + 1), 30000);
    return () => clearInterval(t);
  }, []);
  const next = st?.upcoming?.[0];
  return (
    <Layout title="Tirage au sort" description="Tirage au sort gratuit KARGORA chaque samedi.">
      <div className="hero" style={{ padding: "48px 0" }}><div className="wrap" style={{ gridTemplateColumns: "1fr" }}>
        <div><span className="eyebrow" style={{ color: "#ffb27a" }}>Participation gratuite</span>
          <h1>Le tirage au sort KARGORA</h1>
          <p>Chaque samedi, deux tirages au sort désignent un gagnant parmi les participants. Aucun achat n&apos;est nécessaire : il suffit d&apos;avoir un compte.</p>
          <div className="actions">{user ? <Link href="/compte/loterie" className="btn">Participer</Link> : <><Link href="/inscription" className="btn">Créer un compte pour participer</Link><Link href="/connexion" className="btn ghost">Connexion</Link></>}</div>
        </div></div></div>
      <section className="block"><div className="wrap" style={{ maxWidth: 820 }}>
        <h2>Prochains tirages</h2>
        <div className="list">
          {st === null ? <div className="empty">Chargement…</div> : st.upcoming.length === 0 ? <div className="empty"><div className="icon"><Icon name="gift" /></div><b>Prochain tirage bientôt annoncé</b><p>Le lot de la semaine est en cours de confirmation.</p></div> :
            st.upcoming.map((d) => <div className="draw" key={d.id}><div><b style={{ textTransform: "capitalize" }}>{dtWat(d.scheduled_at)}</b><div className="muted">Lot : {d.prize}</div></div><span className="count">{inText(new Date(d.scheduled_at) - Date.now())}</span></div>)}
        </div>
        {next && <p className="muted">Heures en temps de Bangui (WAT). La participation se clôt au moment du tirage.</p>}
        <h2 className="mt">Derniers résultats</h2>
        <div className="list">
          {st?.past?.length ? st.past.map((d, i) => <div className="draw" key={i}><div><b style={{ textTransform: "capitalize" }}>{dtWat(d.scheduled_at)}</b><div className="muted">Lot : {d.prize}</div></div><span>{d.status === "drawn" ? <>Gagnant : <b>{d.winner}</b></> : <span className="muted">Aucun participant</span>}</span></div>) : <div className="empty">Aucun tirage effectué pour le moment.</div>}
        </div>
        <h2 className="mt">Règlement</h2>
        <ul>
          <li>Participation gratuite, sans obligation d&apos;achat, réservée aux titulaires d&apos;un compte KARGORA.</li>
          <li>Une participation par compte et par tirage. Les comptes multiples d&apos;une même personne sont exclus.</li>
          <li>Le gagnant est désigné au hasard par le système parmi les participants inscrits avant l&apos;heure du tirage.</li>
          <li>Le lot est précisé pour chaque tirage. Il est remis après vérification de l&apos;identité du gagnant ; il n&apos;est pas échangeable contre de l&apos;argent.</li>
          <li>KARGORA peut annuler un tirage en cas de fraude ou de problème technique.</li>
        </ul>
        <p className="notice">Ce règlement est un texte de travail, à faire valider juridiquement avant l&apos;ouverture publique.</p>
      </div></section>
    </Layout>
  );
}
