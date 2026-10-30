import { useState } from "react";
import Link from "next/link";
import ClientGate from "../../components/ClientGate";
import { supabase } from "../../lib/supabase";

const CATS = ["Problème de commande", "Paiement", "Remboursement", "Produit numérique", "Transport", "Autre demande"];
function Help({ user }) {
  const m = user.user_metadata || {};
  const [state, setState] = useState("");
  async function send(e) {
    e.preventDefault(); const d = new FormData(e.currentTarget);
    const { error } = await supabase.rpc("kargora_send_message", { p_name: m.full_name || user.email, p_phone: m.phone || null, p_email: user.email, p_message: `[${d.get("cat")}] ${d.get("msg")}` });
    setState(error ? "Envoi impossible. Réessayez." : "Message envoyé. Nous vous répondrons dès que possible.");
    if (!error) e.target.reset();
  }
  return (
    <>
      <div className="topbar"><h1>Assistance</h1></div>
      <div className="card" style={{ maxWidth: 640 }}>
        <form className="f" onSubmit={send}>
          <label>Sujet<select name="cat">{CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label>Votre message<textarea name="msg" rows={5} required minLength={3} maxLength={2900} placeholder="Indiquez le numéro de la demande concernée si possible." /></label>
          {state && <div className={`notice ${state.startsWith("Message") ? "ok" : "err"}`} role="status">{state}</div>}
          <div><button className="btn">Envoyer</button></div>
        </form>
        <p className="muted mt">Réponses rapides : <Link href="/comment-ca-marche">comment ça marche</Link> · <Link href="/conditions">conditions</Link></p>
      </div>
    </>
  );
}
export default function Assistance() { return <ClientGate title="Assistance">{(u) => <Help user={u} />}</ClientGate>; }
