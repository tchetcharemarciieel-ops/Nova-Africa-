// Compression des images dans le navigateur, avant l'envoi : JPEG, redimensionné, sous une taille maximale.
// Un « caractère » d'une image en base64 vaut environ 0,75 octet : 200 000 caractères ≈ 150 Ko.
export type Image = { data: string; thumb: string };

async function ouvrir(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") { try { return await createImageBitmap(file); } catch { /* repli ci-dessous */ } }
  return await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ko(new Error("IMAGE")); i.src = URL.createObjectURL(file); });
}

function dessiner(src: ImageBitmap | HTMLImageElement, largeurMax: number, carre: boolean): HTMLCanvasElement {
  const sw = "naturalWidth" in src ? src.naturalWidth : src.width;
  const sh = "naturalHeight" in src ? src.naturalHeight : src.height;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("IMAGE");
  if (carre) {
    const cote = Math.min(sw, sh), sx = (sw - cote) / 2, sy = (sh - cote) / 2, t = Math.min(largeurMax, cote);
    c.width = t; c.height = t; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, t, t);
    ctx.drawImage(src, sx, sy, cote, cote, 0, 0, t, t);
  } else {
    const k = Math.min(1, largeurMax / Math.max(sw, sh));
    c.width = Math.max(1, Math.round(sw * k)); c.height = Math.max(1, Math.round(sh * k));
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(src, 0, 0, c.width, c.height);
  }
  return c;
}

/** Réduit largeur puis qualité jusqu'à tenir sous `maxChars` caractères. */
function tenir(src: ImageBitmap | HTMLImageElement, largeur: number, maxChars: number, carre: boolean): string {
  let l = largeur;
  for (let tour = 0; tour < 6; tour++) {
    const c = dessiner(src, l, carre);
    for (const q of [0.82, 0.72, 0.62, 0.52, 0.42]) {
      const d = c.toDataURL("image/jpeg", q);
      if (d.length <= maxChars) return d;
    }
    l = Math.round(l * 0.8);
  }
  throw new Error("IMAGE_TROP_LOURDE");
}

export const TYPES_OK = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
export function verifierFichier(f: File) {
  if (!f.type.startsWith("image/")) throw new Error("IMAGE_TYPE");
  if (f.size > 15 * 1024 * 1024) throw new Error("IMAGE_GROS");
}

/** Photo de profil ou logo : carré. `data` ≈ 320 px (≤ 60 000 caractères), `thumb` ≈ 80 px (≤ 8 000). */
export async function compresserAvatar(f: File): Promise<Image> {
  verifierFichier(f);
  const s = await ouvrir(f);
  return { data: tenir(s, 320, 60000, true), thumb: tenir(s, 80, 8000, true) };
}
/** Réalisation ou publication : image en grand (≈ 150 Ko au plus) et aperçu léger pour le fil et la galerie. */
export async function compresserPhoto(f: File): Promise<Image> {
  verifierFichier(f);
  const s = await ouvrir(f);
  return { data: tenir(s, 1280, 200000, false), thumb: tenir(s, 420, 40000, false) };
}
export const octets = (d: string) => Math.round((d.length * 3) / 4);
export const MESSAGES_IMAGE: Record<string, string> = {
  IMAGE_TYPE: "Ce fichier n'est pas une image.",
  IMAGE_GROS: "Cette image est trop grande (15 Mo au plus).",
  IMAGE_TROP_LOURDE: "Impossible de réduire cette image. Essaie-en une autre.",
  IMAGE: "Impossible de lire cette image.",
};
export const messageImage = (e: unknown) => (e instanceof Error ? MESSAGES_IMAGE[e.message] : undefined);
