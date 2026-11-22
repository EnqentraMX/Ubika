// Worker de Cloudflare: sitio público de RL Industrial + CRM con panel oculto.
import { api, leer, publicas } from "./core.js";
import { paginaInicio, paginaBodega, pagina404 } from "./render.js";
import PANEL from "./panel.html";
import semilla from "../datos/semilla.json";

const SEMILLA = { bodegas: semilla.bodegas, config: semilla.config, leads: [] };

function kvStore(env, origen) {
  const kv = env.DATOS;
  return {
    get: (k) => kv.get(k),
    put: (k, v, o = {}) => kv.put(k, v, o.ttl ? { expirationTtl: Math.max(60, o.ttl) } : undefined),
    del: (k) => kv.delete(k),
    putImage: async (id, bytes, tipo) => { await kv.put("img:" + id, bytes, { metadata: { tipo } }); return "/img/" + id; },
    delImage: (id) => kv.delete("img:" + id),
    getImage: (id) => kv.getWithMetadata("img:" + id, { type: "arrayBuffer" }),
  };
}

const html = (cuerpo, status = 200, extra = {}) =>
  new Response(cuerpo, { status, headers: { "content-type": "text/html; charset=utf-8", "x-content-type-options": "nosniff", "referrer-policy": "strict-origin-when-cross-origin", ...extra } });

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const ruta = url.pathname;
    const store = kvStore(env, url.origin);
    const panelRuta = "/" + (env.PANEL_RUTA || "panel-rl").replace(/^\/+|\/+$/g, "");

    if (ruta.startsWith("/api/")) return api(req, store, env, SEMILLA);

    if (ruta === panelRuta || ruta === panelRuta + "/")
      return html(PANEL, 200, { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow", "x-frame-options": "DENY" });

    if (ruta.startsWith("/img/")) {
      const { value, metadata } = await store.getImage(ruta.slice(5));
      if (!value) return new Response("No encontrada", { status: 404 });
      return new Response(value, { headers: { "content-type": (metadata && metadata.tipo) || "image/webp", "cache-control": "public, max-age=31536000, immutable" } });
    }

    if (ruta === "/robots.txt")
      return new Response(`User-agent: *\nDisallow: /api/\nSitemap: ${url.origin}/sitemap.xml\n`, { headers: { "content-type": "text/plain" } });

    // Archivos estáticos (sitio.css, sitio.js)
    if (env.ASSETS && /^\/[\w.-]+\.(css|js|png|jpg|webp|svg|ico)$/.test(ruta)) {
      const r = await env.ASSETS.fetch(req);
      if (r.status !== 404) return r;
    }

    const d = await leer(store, SEMILLA);
    const vista = { ...d, bodegas: publicas(d) };
    const cache = { "cache-control": "public, max-age=60" };

    if (ruta === "/sitemap.xml") {
      const urls = ["/", ...vista.bodegas.map((b) => "/bodega/" + b.slug)].map((p) => `<url><loc>${url.origin}${p}</loc></url>`).join("");
      return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { "content-type": "application/xml" } });
    }
    if (ruta === "/" || ruta === "/index.html") return html(paginaInicio(vista, { url: url.origin + "/" }), 200, cache);
    const m = ruta.match(/^\/bodega\/([\w-]+)\/?$/);
    if (m) {
      const p = paginaBodega(vista, m[1], { url: url.origin + "/bodega/" + m[1] });
      if (p) return html(p, 200, cache);
    }
    return html(pagina404(vista), 404);
  },
};
