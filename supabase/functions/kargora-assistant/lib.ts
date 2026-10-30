// Fonctions pures (testables) : analyse d'une page produit, garde anti-SSRF, estimation et règles « gros ».

export function isPrivateIp(ip: string): boolean {
  if (ip.includes(":")) {
    const l = ip.toLowerCase();
    return l === "::1" || l === "::" || l.startsWith("fc") || l.startsWith("fd") || l.startsWith("fe80") || l.startsWith("::ffff:");
  }
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((x) => !Number.isInteger(x) || x < 0 || x > 255)) return true;
  const [a, b] = p;
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}

export function checkUrl(raw: string): URL {
  let u: URL;
  try { u = new URL(raw); } catch { throw new Error("Lien invalide"); }
  if (u.protocol !== "https:") throw new Error("Seuls les liens https:// sont acceptés");
  if (u.username || u.password) throw new Error("Lien invalide");
  if (u.port && u.port !== "443") throw new Error("Lien invalide");
  const h = u.hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal") || /^[\d.]+$/.test(h) || h.includes(":")) throw new Error("Lien non autorisé");
  return u;
}

const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
const meta = (html: string, key: string) => {
  const re = new RegExp(`<meta[^>]+(?:property|name|itemprop)=["']${key}["'][^>]*>`, "i");
  const m = html.match(re)?.[0];
  const c = m?.match(/content=["']([^"']*)["']/i)?.[1];
  return c ? decode(c) : undefined;
};
const num = (s?: string) => {
  if (!s) return undefined;
  const t = s.replace(/[^\d.,]/g, "");
  const norm = /,\d{1,2}$/.test(t) ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, "");
  const n = parseFloat(norm);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export type Product = { title?: string; image?: string; price?: number; currency?: string; description?: string };

export function parseProduct(html: string, base: string): Product {
  const out: Product = {};
  out.title = meta(html, "og:title") || meta(html, "twitter:title") || decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "") || undefined;
  out.description = meta(html, "og:description") || meta(html, "description");
  const img = meta(html, "og:image") || meta(html, "twitter:image");
  if (img) { try { const u = new URL(img, base); if (u.protocol === "https:") out.image = u.href; } catch { /* ignore */ } }
  out.price = num(meta(html, "product:price:amount") || meta(html, "og:price:amount") || meta(html, "price"));
  out.currency = (meta(html, "product:price:currency") || meta(html, "og:price:currency") || meta(html, "priceCurrency"))?.toUpperCase();
  if (!out.price) {
    for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
      try {
        const stack: unknown[] = [JSON.parse(m[1])];
        while (stack.length) {
          const x = stack.pop() as Record<string, unknown>;
          if (Array.isArray(x)) { stack.push(...x); continue; }
          if (!x || typeof x !== "object") continue;
          if (x["@graph"]) stack.push(x["@graph"]);
          const t = String(x["@type"] || "");
          if (t.includes("Product")) {
            if (!out.title && typeof x.name === "string") out.title = x.name;
            let offers = x.offers as Record<string, unknown> | Record<string, unknown>[] | undefined;
            if (Array.isArray(offers)) offers = offers[0];
            const o = offers as Record<string, unknown> | undefined;
            const p = num(String(o?.price ?? (o?.lowPrice ?? "")));
            if (p) { out.price = p; out.currency = out.currency || (typeof o?.priceCurrency === "string" ? o.priceCurrency.toUpperCase() : undefined); }
          }
        }
      } catch { /* JSON-LD invalide : on ignore */ }
      if (out.price) break;
    }
  }
  if (out.title) out.title = out.title.slice(0, 200);
  if (out.description) out.description = out.description.slice(0, 300);
  return out;
}

export type Cfg = Record<string, string>;
const f = (cfg: Cfg, k: string) => { const n = parseFloat((cfg[k] || "").replace(",", ".")); return Number.isFinite(n) && n > 0 ? n : undefined; };

// Estimation 100 % pilotée par des paramètres saisis par l'administrateur. Sans paramètre : aucune fourchette inventée.
export function estimate(p: Product, qty: number, cfg: Cfg) {
  if (!p.price) return { status: "no_price" as const };
  const cur = p.currency || "";
  const rate = cur === "XAF" || cur === "FCFA" ? 1 : f(cfg, `fx_${cur}`);
  if (!rate) return { status: "no_rate" as const, currency: cur };
  const base = Math.round(p.price * rate * qty);
  const lo = f(cfg, "estimate_uplift_min_percent"), hi = f(cfg, "estimate_uplift_max_percent");
  if (lo === undefined || hi === undefined || hi < lo) return { status: "product_only" as const, product_xaf: base };
  return { status: "range" as const, product_xaf: base, min_xaf: Math.round(base * (1 + lo / 100)), max_xaf: Math.round(base * (1 + hi / 100)) };
}

export function wholesaleCheck(text: string, qty: number, cfg: Cfg) {
  const words = (cfg.wholesale_keywords || "").split(",").map((w) => w.trim().toLowerCase()).filter(Boolean);
  const min = f(cfg, "wholesale_min_qty");
  if (!words.length || !min) return null;
  const t = text.toLowerCase();
  const hit = words.find((w) => t.includes(w));
  if (hit && qty < min) return { keyword: hit, min_qty: min, message: `Ce type de produit (« ${hit} ») se commande généralement en gros : quantité minimale ${min}.` };
  return null;
}
