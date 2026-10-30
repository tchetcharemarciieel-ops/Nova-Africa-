import { useState } from "react";
import ClientGate from "../../components/ClientGate";
import { supabase } from "../../lib/supabase";
import { dayFr } from "../../lib/format";

function Profile({ user }) {
  const m = user.user_metadata || {};
  const [msg, setMsg] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [cl, setCl] = useState("");
  const say = (setter) => (r) => setter(r.error ? "Erreur : " + r.error.message : "Enregistré");
  async function save(e) {
    e.preventDefault(); const d = new FormData(e.currentTarget);
    say(setMsg)(await supabase.auth.updateUser({ data: { full_name: d.get("name"), phone: d.get("phone"), account_type: d.get("type") } }));
  }
  async function pw(e) {
    e.preventDefault(); const d = new FormData(e.currentTarget);
    if (d.get("p1") !== d.get("p2")) return setPwMsg("Erreur : les deux mots de passe diffèrent");
    const r = await supabase.auth.updateUser({ password: d.get("p1") }); say(setPwMsg)(r);
    if (!r.error) e.target.reset();
  }
  async function claim(e) {
    e.preventDefault(); const d = new FormData(e.currentTarget);
    const { data, error } = await supabase.rpc("kargora_claim_request", { p_number: d.get("n"), p_phone: d.get("ph") });
    setCl(error ? "Erreur" : data ? "Demande rattachée à votre compte." : "Aucune demande libre ne correspond à ce numéro et ce téléphone.");
  }
  return (
    <>
      <div className="topbar"><h1>Mon profil</h1></div>
      <div className="grid">
        <div className="card"><h3>Informations</h3>
          <form className="f" onSubmit={save}>
            <label>Nom et prénom<input name="name" defaultValue={m.full_name || ""} required /></label>
            <label>Téléphone<input name="phone" defaultValue={m.phone || ""} required /></label>
            <label>Type de compte<select name="type" defaultValue={m.account_type || "particulier"}><option value="particulier">Particulier</option><option value="commercant">Commerçant</option><option value="entreprise">Entreprise</option></select></label>
            <div className="muted">E-mail : {user.email} · Compte créé le {dayFr(user.created_at)}</div>
            {msg && <div className="notice" role="status">{msg}</div>}
            <div><button className="btn sm blue">Enregistrer</button></div>
          </form></div>
        <div className="card"><h3>Mot de passe</h3>
          <form className="f" onSubmit={pw}>
            <label>Nouveau mot de passe<input name="p1" type="password" minLength={10} required autoComplete="new-password" /></label>
            <label>Confirmer<input name="p2" type="password" minLength={10} required autoComplete="new-password" /></label>
            {pwMsg && <div className="notice" role="status">{pwMsg}</div>}
            <div><button className="btn sm blue">Changer</button></div>
          </form></div>
        <div className="card"><h3>Rattacher une ancienne demande</h3>
          <p className="muted">Vous avez fait une demande sans compte ? Entrez son numéro et le téléphone utilisé.</p>
          <form className="f" onSubmit={claim}>
            <label>Numéro de demande<input name="n" placeholder="KRG-XXXXXXXX" required /></label>
            <label>Téléphone<input name="ph" required /></label>
            {cl && <div className="notice" role="status">{cl}</div>}
            <div><button className="btn sm alt">Rattacher</button></div>
          </form></div>
      </div>
    </>
  );
}
export default function Profil() { return <ClientGate title="Profil">{(u) => <Profile user={u} />}</ClientGate>; }
