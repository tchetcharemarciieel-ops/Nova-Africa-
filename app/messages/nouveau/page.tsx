"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Avatar from "@/components/Avatar";
import { Chargement, Erreur } from "@/components/Blocs";
import { api, messageErreur, type Me } from "@/lib/api";
import { assurerMoi, moi } from "@/lib/session";

function Contenu() {
  const router = useRouter();
  const sp = useSearchParams();
  const to = sp.get("to") || "";
  const nomDest = (sp.get("nom") || "ce professionnel").slice(0, 60);
  const sujet = (sp.get("sujet") || "").slice(0, 200);
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  useEffect(() => { moi().then(setMe).catch(() => setMe(null)); }, []);

  if (!/^[0-9a-f-]{36}$/.test(to)) return <main className="page"><section className="carte"><div className="in"><h1>Message</h1><Erreur texte="Destinataire introuvable." /></div></section></main>;
  if (me === undefined) return <main className="page"><Chargement /></main>;
  if (me && me.member_id === to) return <main className="page"><section className="carte"><div className="in"><h1>Message</h1><p className="lead">Tu ne peux pas t&apos;écrire à toi-même.</p></div></section></main>;

  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const texte = String(f.get("texte") || "").trim().slice(0, 1000);
    const nom = String(f.get("nom") || "").trim().slice(0, 60);
    if (!texte) return setErreur("Écris ton message.");
    if (!me && nom.length < 2) return setErreur("Écris ton nom pour que la personne sache qui lui écrit.");
    setErreur(""); setEnvoi(true);
    try { const { secret } = await assurerMoi(nom); const id = await api.send(secret, to, texte); router.replace(`/messages/${id}`); }
    catch (err) { setErreur(messageErreur(err)); setEnvoi(false); }
  }
  return (
    <main className="page"><section className="carte"><div className="in">
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 6 }}><Avatar nom={nomDest} taille={48} /><div><h1 style={{ margin: 0, fontSize: 22 }}>Écrire à {nomDest}</h1></div></div>
      <form onSubmit={envoyer} noValidate>
        {me === null && <><label htmlFor="nom">Ton nom</label><input id="nom" name="nom" autoComplete="name" maxLength={60} /></>}
        <label htmlFor="texte">Ton message</label><textarea id="texte" name="texte" maxLength={1000} defaultValue={sujet ? `Bonjour, ${sujet.charAt(0).toLowerCase()}${sujet.slice(1)}. ` : ""} />
        {erreur && <Erreur texte={erreur} />}
        <p style={{ marginTop: 16 }}><button className="btn plein bloc" type="submit" disabled={envoi}>{envoi ? "Envoi…" : "Envoyer"}</button></p>
        <p className="mute petit">Ne partage jamais de mot de passe, de code ni de numéro de carte.</p>
      </form>
    </div></section></main>
  );
}
export default function Nouveau() { return <Suspense fallback={<main className="page"><Chargement /></main>}><Contenu /></Suspense>; }
