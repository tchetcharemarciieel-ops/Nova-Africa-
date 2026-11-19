import { api, ApiError, type Moi } from "./api";
const SK = "ba.secret";
export function secretExistant(): string | null { try { return localStorage.getItem(SK); } catch { return null; } }
export function getSecret(): string {
  let s = secretExistant();
  if (!s) { const b = new Uint8Array(36); crypto.getRandomValues(b); s = Array.from(b, x => x.toString(16).padStart(2, "0")).join(""); localStorage.setItem(SK, s); }
  return s;
}
export async function moi(): Promise<Moi | null> { const s = secretExistant(); return s ? api.me(s) : null; }
export async function assurerMoi(nom?: string): Promise<{ me: Moi; secret: string }> {
  const secret = getSecret();
  let me = await api.me(secret);
  if (!me) {
    if (!nom || nom.trim().length < 2) throw new ApiError("BA_NOM");
    await api.register(nom.trim(), secret);
    me = await api.me(secret);
  }
  if (!me) throw new ApiError("BA_AUTH");
  return { me, secret };
}
