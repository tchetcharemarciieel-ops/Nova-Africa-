import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminGate from "../../components/AdminGate";
import { supabase } from "../../lib/supabase";
import { fcfa, dateFr, dayFr, PROFILES, METHODS } from "../../lib/format";

const QUOTE_FIELDS = [
  ["purchase_price", "Prix d'achat"], ["transport_hub", "Transport jusqu'au regroupement"],
  ["transport_intl", "Transport international"], ["insurance", "Assurance"],
  ["customs_estimate", "Droits et taxes (estimation)"], ["local_fees", "Frais locaux"], ["service_fee", "Frais de service KARGORA"],
];
const COST_FIELDS = [["cost_purchase", "Coût d'achat réel"], ["cost_transport", "Transport réel"], ["cost_customs", "Douane réelle"], ["cost_other", "Autres frais réels"]];

function Detail({ id }) {
  const [d, setD] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [files, setFiles] = useState([]);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const [r, s, h, q, o, p, k, dc] = await Promise.all([
      supabase.from("kargora_requests").select("*").eq("id", id).single(),
      supabase.from("kargora_statuses").select("*").order("code"),
      supabase.from("kargora_status_history").select("*").eq("request_id", id).order("created_at", { ascending: false }),
      supabase.from("kargora_quotes").select("*").eq("request_id", id).order("created_at", { ascending: false }),
      supabase.from("kargora_orders").select("*").eq("request_id", id).maybeSingle(),
      supabase.from("kargora_payments").select("*").eq("request_id", id).order("confirmed_at"),
      supabase.from("kargora_packages").select("*").eq("request_id", id).order("received_at"),
      supabase.from("kargora_documents").select("*").eq("request_id", id).order("created_at"),
    ]);
    setD({ r: r.data, hist: h.data || [], quotes: q.data || [], order: o.data, pays: p.data || [], pkgs: k.data || [], docs: dc.data || [] });
    setStatuses(s.data || []);
    const paths = [...(r.data?.file_paths || []), ...(dc.data || []).map((x) => x.path)];
    const out = [];
    for (const path of paths) {
      const { data } = await supabase.storage.from("kargora-uploads").createSignedUrl(path, 600);
      out.push({ path, url: data?.signedUrl });
    }
    setFiles(out);
  }, [id]);
  useEffect(() => { load(); }, [load]);

  async function act(fn, ok = "Enregistré") {
    setMsg("");
    const res = await fn();
    if (res?.error) return setMsg("Erreur : " + res.error.message);
    setMsg(ok); load();
  }
  const num = (v) => (v === "" || v == null ? 0 : Number(v));
  const form = (fn) => (e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const f = e.currentTarget; act(() => fn(fd)).then(() => f.reset?.()); };

  if (!d) return <p>Chargement…</p>;
  if (!d.r) return <p>Demande introuvable. <Link href="/admin">Retour</Link></p>;
  const { r, order } = d;
  const lastDraft = d.quotes.find((x) => x.status === "draft");
  const costs = order ? order.cost_purchase + order.cost_transport + order.cost_customs + order.cost_other : 0;
  const paid = d.pays.reduce((a, x) => a + Number(x.amount), 0);
  const url = (p) => files.find((f) => f.path === p)?.url;

  return (
    <>
      <p><Link href="/admin">← Toutes les demandes</Link></p>
      <h2>{r.number} <span className="badge">{statuses.find((s) => s.code === r.status_code)?.label}</span></h2>
      {msg && <div className={`notice ${msg.startsWith("Erreur") ? "err" : "ok"}`} role="status">{msg}</div>}

      <div className="grid mt">
        <div className="card">
          <h3>Client</h3>
          <div><strong>{r.full_name}</strong> — {PROFILES[r.profile]}</div>
          <div>{r.phone}</div>
          <div className="muted">Reçue le {dateFr(r.created_at)}</div>
        </div>
        <div className="card">
          <h3>Produit demandé</h3>
          <div style={{ whiteSpace: "pre-wrap" }}>{r.product_description}</div>
          <div>Quantité : {r.quantity}{r.budget_indicatif != null && <> · Budget : {fcfa(r.budget_indicatif)}</>}</div>
          {r.preferred_origin && <div>Origine souhaitée : {r.preferred_origin}</div>}
          {r.product_url && <div><a href={/^https?:\/\//i.test(r.product_url) ? r.product_url : "#"} target="_blank" rel="noopener noreferrer nofollow">Lien du produit ↗</a></div>}
          {r.comment && <div className="muted" style={{ whiteSpace: "pre-wrap" }}>{r.comment}</div>}
          {r.file_paths.map((p) => <div key={p}>{url(p) ? <a href={url(p)} target="_blank" rel="noopener noreferrer">📎 {p.split("/").pop()}</a> : p}</div>)}
        </div>
      </div>

      <div className="card mt">
        <h3>Statut et note visible par le client</h3>
        <form className="f" onSubmit={form((fd) => supabase.rpc("kargora_set_status", { p_request_id: id, p_status: Number(fd.get("status")), p_public_note: fd.get("note") }))}>
          <div className="row2">
            <label>Nouveau statut<select name="status" defaultValue={r.status_code}>{statuses.map((s) => <option key={s.code} value={s.code}>{s.code}. {s.label}</option>)}</select></label>
            <label>Note visible par le client<input name="note" maxLength={500} /></label>
          </div>
          <div><button className="btn sm blue">Mettre à jour</button></div>
        </form>
        <form className="f mt" onSubmit={form((fd) => supabase.from("kargora_requests").update({ category: fd.get("category") || null, internal_note: fd.get("internal") || null }).eq("id", id))}>
          <div className="row2">
            <label>Catégorie (statistiques)<input name="category" defaultValue={r.category || ""} placeholder="ex. accessoires téléphone" /></label>
            <label>Note interne (jamais visible)<input name="internal" defaultValue={r.internal_note || ""} /></label>
          </div>
          <div><button className="btn sm alt">Enregistrer</button></div>
        </form>
      </div>

      <div className="card mt">
        <h3>Devis</h3>
        {d.quotes.map((x) => (
          <div key={x.id} style={{ borderBottom: "1px solid var(--line)", paddingBottom: 8, marginBottom: 8 }}>
            <strong>{x.designation}</strong> ×{x.quantity} — <span className="badge">{x.status}</span> — total {x.total_confirmed ? "confirmé" : "estimatif"} : <strong>{fcfa(x.total)}</strong> · valide jusqu&apos;au {dayFr(x.valid_until)}
            {x.status === "draft" && <> <button className="btn sm" onClick={() => act(() => supabase.rpc("kargora_send_quote", { p_quote_id: x.id }), "Devis envoyé au client")}>Envoyer au client</button> <button className="btn sm danger" onClick={() => act(() => supabase.from("kargora_quotes").delete().eq("id", x.id))}>Supprimer</button></>}
          </div>
        ))}
        {!lastDraft && !order && (
          <form className="f" onSubmit={form((fd) => supabase.from("kargora_quotes").insert({
            request_id: id, designation: fd.get("designation"), quantity: Number(fd.get("quantity")),
            ...Object.fromEntries(QUOTE_FIELDS.map(([k]) => [k, num(fd.get(k))])),
            total_confirmed: fd.get("confirmed") === "on", valid_until: fd.get("valid_until"),
            delivery_estimate: fd.get("delivery") || null, conditions: fd.get("conditions") || null,
          }))}>
            <div className="row2">
              <label>Désignation<input name="designation" required defaultValue={r.product_description.slice(0, 120)} /></label>
              <label>Quantité<input name="quantity" type="number" min={1} required defaultValue={r.quantity} /></label>
            </div>
            <div className="row2">{QUOTE_FIELDS.map(([k, l]) => <label key={k}>{l} (FCFA)<input name={k} type="number" min={0} defaultValue={0} /></label>)}</div>
            <div className="notice">Droits et taxes : à confirmer avec un professionnel selon le produit et sa classification — pas de pourcentage universel.</div>
            <div className="row2">
              <label>Valable jusqu&apos;au<input name="valid_until" type="date" required /></label>
              <label>Délai estimatif<input name="delivery" placeholder="seulement si confirmé par un transporteur" /></label>
            </div>
            <label>Conditions de livraison / retrait<textarea name="conditions" rows={2} /></label>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" name="confirmed" style={{ width: "auto" }} /> Total confirmé (sinon affiché comme estimatif)</label>
            <div><button className="btn sm blue">Créer le brouillon de devis</button></div>
          </form>
        )}
      </div>

      <div className="card mt">
        <h3>Commande et paiements</h3>
        {!order ? (
          <p>Aucune commande. Elle ne peut être créée qu&apos;après acceptation explicite du devis par le client.{" "}
            <button className="btn sm blue" onClick={() => act(() => supabase.rpc("kargora_create_order", { p_request_id: id }), "Commande créée")}>Créer la commande</button></p>
        ) : (
          <>
            <p>Facturé : <strong>{fcfa(order.billed_amount)}</strong> · Encaissé (confirmé) : <strong>{fcfa(paid)}</strong> · Coûts réels : <strong>{fcfa(costs)}</strong> · Marge : <strong>{fcfa(order.billed_amount - costs)}</strong></p>
            <form className="f" onSubmit={form((fd) => supabase.from("kargora_orders").update(Object.fromEntries(COST_FIELDS.map(([k]) => [k, num(fd.get(k))]))).eq("id", order.id))}>
              <div className="row2">{COST_FIELDS.map(([k, l]) => <label key={k}>{l}<input name={k} type="number" defaultValue={order[k]} /></label>)}</div>
              <div><button className="btn sm alt">Enregistrer les frais réels</button></div>
            </form>
            <h3 className="mt">Paiements confirmés</h3>
            {d.pays.map((x) => <div key={x.id}>{x.receipt_number} — {METHODS[x.method]} — {fcfa(x.amount)} — {dateFr(x.confirmed_at)} {x.reference && `(réf. ${x.reference})`}</div>)}
            <form className="f mt" onSubmit={form((fd) => supabase.rpc("kargora_record_payment", { p_request_id: id, p_method: fd.get("method"), p_amount: num(fd.get("amount")), p_reference: fd.get("reference"), p_note: fd.get("note") }))}>
              <div className="notice">À n&apos;utiliser qu&apos;après avoir vérifié l&apos;argent reçu (relevé Orange Money, banque, caisse). Une capture d&apos;écran du client ne suffit pas.</div>
              <div className="row2">
                <label>Mode<select name="method">{Object.entries(METHODS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
                <label>Montant reçu (FCFA)<input name="amount" type="number" min={1} required defaultValue={order.billed_amount - paid > 0 ? order.billed_amount - paid : ""} /></label>
              </div>
              <div className="row2">
                <label>Référence de transaction<input name="reference" /></label>
                <label>Note<input name="note" /></label>
              </div>
              <div><button className="btn sm blue">Confirmer le paiement et émettre le reçu</button></div>
            </form>
          </>
        )}
      </div>

      <div className="card mt">
        <h3>Colis reçus</h3>
        {d.pkgs.map((x) => <div key={x.id}>{dateFr(x.received_at)} — état : {x.condition || "—"} · {x.weight_kg ?? "?"} kg · suivi : {x.tracking_number || "—"} {x.note && `· ${x.note}`}</div>)}
        <form className="f mt" onSubmit={form((fd) => supabase.from("kargora_packages").insert({ request_id: id, condition: fd.get("condition") || null, weight_kg: fd.get("weight") ? Number(fd.get("weight")) : null, tracking_number: fd.get("tracking") || null, note: fd.get("note") || null }))}>
          <div className="row2">
            <label>État du colis<input name="condition" /></label>
            <label>Poids (kg)<input name="weight" type="number" step="0.01" min={0} /></label>
            <label>Numéro de suivi<input name="tracking" /></label>
          </div>
          <label>Note<input name="note" /></label>
          <div><button className="btn sm alt">Enregistrer la réception</button></div>
        </form>
      </div>

      <div className="card mt">
        <h3>Justificatifs et factures</h3>
        {d.docs.map((x) => <div key={x.id}>{x.kind} — {url(x.path) ? <a href={url(x.path)} target="_blank" rel="noopener noreferrer">{x.label || x.path.split("/").pop()}</a> : x.label}</div>)}
        <form className="f mt" onSubmit={form(async (fd) => {
          const f = fd.get("file");
          if (!f || !f.size) return { error: { message: "Choisissez un fichier" } };
          const path = `documents/${id}/${Date.now()}-${f.name.replace(/[^A-Za-z0-9._-]/g, "_")}`;
          const up = await supabase.storage.from("kargora-uploads").upload(path, f, { contentType: f.type });
          if (up.error) return up;
          return supabase.from("kargora_documents").insert({ request_id: id, kind: fd.get("kind"), label: fd.get("label") || null, path });
        })}>
          <div className="row2">
            <label>Type<select name="kind"><option value="justificatif">Justificatif</option><option value="facture">Facture</option><option value="recu">Reçu</option><option value="autre">Autre</option></select></label>
            <label>Libellé<input name="label" /></label>
          </div>
          <label>Fichier (JPG, PNG, WebP, PDF – 5 Mo)<input name="file" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" /></label>
          <div><button className="btn sm alt">Ajouter</button></div>
        </form>
      </div>

      <div className="card mt">
        <h3>Historique des statuts</h3>
        <ul className="timeline">{d.hist.map((h) => <li key={h.id}><strong>{statuses.find((s) => s.code === h.status_code)?.label}</strong> <small>{dateFr(h.created_at)}</small>{h.public_note && <div>{h.public_note}</div>}</li>)}</ul>
      </div>
    </>
  );
}

export default function AdminDetail() {
  const { query } = useRouter();
  return <AdminGate>{query.id ? <Detail id={query.id} /> : null}</AdminGate>;
}
