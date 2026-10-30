import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import Icon from "./Icons";

export default function Assistant() {
  const [open, setOpen] = useState(false);
  const [avail, setAvail] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");
  const end = useRef(null);
  useEffect(() => { if (open && avail === null) supabase.functions.invoke("kargora-assistant", { body: { mode: "ping" } }).then(({ data, error }) => setAvail(!error && !!data?.chat)); }, [open, avail]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);
  async function send(e) {
    e.preventDefault();
    const t = text.trim(); if (!t || busy) return;
    const next = [...msgs, { role: "user", content: t }];
    setMsgs(next); setText(""); setBusy(true);
    const { data, error } = await supabase.functions.invoke("kargora-assistant", { body: { mode: "chat", messages: next } });
    setBusy(false);
    setMsgs([...next, { role: "assistant", content: error || !data?.reply ? "Je ne peux pas répondre pour le moment. Écrivez-nous via la page Contact." : data.reply }]);
  }
  return (
    <>
      <button className="asst-fab" onClick={() => setOpen(!open)} aria-label="Assistant KARGORA" aria-expanded={open}><Icon name={open ? "plus" : "chat"} /><span>{open ? "Fermer" : "Aide"}</span></button>
      {open && (
        <div className="asst" role="dialog" aria-label="Assistant KARGORA">
          <div className="asst-h"><b>Assistant KARGORA</b><small>Réponses automatiques : les prix et délais viennent toujours d&apos;un devis.</small></div>
          <div className="asst-b">
            {avail === false ? <p className="muted">L&apos;assistant n&apos;est pas encore disponible. Utilisez la page Contact : l&apos;équipe vous répond.</p> : (
              <>
                {msgs.length === 0 && <p className="muted">Bonjour ! Posez-moi une question sur les demandes, les devis, les paiements ou les services numériques.</p>}
                {msgs.map((m, i) => <div key={i} className={`bub ${m.role}`}>{m.content}</div>)}
                {busy && <div className="bub assistant">…</div>}
                <div ref={end} />
              </>
            )}
          </div>
          {avail !== false && <form className="asst-f" onSubmit={send}><input value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Votre question…" aria-label="Votre question" /><button className="btn sm" disabled={busy}>Envoyer</button></form>}
        </div>
      )}
    </>
  );
}
