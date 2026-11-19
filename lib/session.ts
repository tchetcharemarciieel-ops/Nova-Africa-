// Identité sur l'appareil : un secret aléatoire gardé dans le navigateur. La base ne garde que son empreinte.
import { api, ApiError, type Me } from "./api";

const SK = "rp.secret";
const MK = "rp.me";

export function secretExistant(): string | null { try { return localStorage.getItem(SK); } catch { return null; } }
export function getSecret(): string {
  let s = secretExistant();
  if (!s) {
    const b = new Uint8Array(36);
    crypto.getRandomValues(b);
    s = Array.from(b, x => x.toString(16).padStart(2, "0")).join("");
    localStorage.setItem(SK, s);
  }
  return s;
}
export function moiEnCache(): Me | null { try { const v = localStorage.getItem(MK); return v ? (JSON.parse(v) as Me) : null; } catch { return null; } }
function garder(me: Me | null) { try { if (me) localStorage.setItem(MK, JSON.stringify(me)); } catch { /* ignore */ } }

/** Retourne mon identité si elle existe déjà (sans rien créer). */
export async function moi(): Promise<Me | null> {
  const s = secretExistant();
  if (!s) return null;
  const me = await api.me(s);
  garder(me);
  return me;
}
/** Crée mon identité au besoin (il faut alors un nom) et la retourne. */
export async function assurerMoi(nom?: string): Promise<{ me: Me; secret: string }> {
  const secret = getSecret();
  let me = await api.me(secret);
  if (!me) {
    if (!nom || nom.trim().length < 2) throw new ApiError("RP_NOM");
    await api.register(nom.trim(), secret);
    me = await api.me(secret);
  }
  if (!me) throw new ApiError("RP_AUTH");
  garder(me);
  return { me, secret };
}

/** Efface l'identité de ce téléphone (le compte reste dans la base, on le retrouve avec le code). */
export function deconnecter() { try { localStorage.removeItem(SK); localStorage.removeItem(MK); } catch { /* ignore */ } }

/** Se connecter avec le code de connexion (le secret) sur un autre téléphone. */
export async function seConnecter(code: string): Promise<Me> {
  const secret = code.replace(/\s+/g, "").toLowerCase();
  if (secret.length < 32 || secret.length > 200 || !/^[0-9a-f]+$/.test(secret)) throw new ApiError("CODE");
  const me = await api.me(secret);
  if (!me) throw new ApiError("CODE");
  localStorage.setItem(SK, secret);
  garder(me);
  return me;
}
/** Le code est affiché par groupes de 6 caractères pour être lisible et recopiable. */
export const formaterCode = (s: string) => (s.match(/.{1,6}/g) || []).join(" ");
