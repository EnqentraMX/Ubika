// Lógica del CRM de RL Industrial. Funciona igual en el Worker de Cloudflare (KV) y en la demo (localStorage).
// `store` debe tener: get(k), put(k, v, {ttl}), del(k), putImage(id, bytes, type) -> url, delImage(id), getImage(id).

export const MAX_FOTOS = 5;
export const ETAPAS = ["nuevo", "contactado", "visita", "negociacion", "ganado", "perdido"];
export const ESTADOS = ["disponible", "apartada", "rentada", "oculta"];

const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra } });
const error = (msg, status = 400) => json({ error: msg }, status);

export function slugify(t) {
  return String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "bodega";
}
const nid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()).replace(/-/g, "").slice(0, 16);
const ahora = () => new Date().toISOString();
const str = (v, max = 2000) => (v == null ? "" : String(v).trim().slice(0, max));
const num = (v) => { if (v === "" || v == null) return null; const n = Number(String(v).replace(/[^0-9.\-]/g, "")); return Number.isFinite(n) ? n : null; };

async function hash(texto) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("rl-industrial::" + texto));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

// ---------- Datos ----------
export async function leer(store, semilla) {
  let raw = await store.get("db");
  if (!raw && semilla) {
    const d = { bodegas: semilla.bodegas || [], config: semilla.config || {}, leads: semilla.leads || [], eventos: {} };
    await store.put("db", JSON.stringify(d));
    return d;
  }
  const d = raw ? JSON.parse(raw) : { bodegas: [], config: {}, leads: [], eventos: {} };
  d.eventos = d.eventos || {};
  d.leads = d.leads || [];
  return d;
}
const guardar = (store, d) => store.put("db", JSON.stringify(d));

export function publicas(d) {
  return d.bodegas.filter((b) => b.estado !== "oculta");
}

function limpiaBodega(entrada, previa, todas) {
  const b = { ...(previa || {}) };
  const t = (k, m) => { if (k in entrada) b[k] = str(entrada[k], m); };
  const n = (k) => { if (k in entrada) b[k] = num(entrada[k]); };
  ["nombre", "tipo", "zona", "entidad", "direccion", "superficieTexto", "mantenimiento", "propietario", "folio"].forEach((k) => t(k, 200));
  t("descripcion", 4000); t("notasInternas", 4000);
  ["lat", "lng", "m2min", "m2max", "precio", "altura", "andenes"].forEach(n);
  if ("operacion" in entrada) b.operacion = entrada.operacion === "venta" ? "venta" : "renta";
  if ("estado" in entrada) b.estado = ESTADOS.includes(entrada.estado) ? entrada.estado : "disponible";
  if ("precioTipo" in entrada) b.precioTipo = ["mes", "m2", "consultar"].includes(entrada.precioTipo) ? entrada.precioTipo : "consultar";
  if ("acceso" in entrada) b.acceso = ["trailer", "torton", "camioneta", ""].includes(entrada.acceso) ? entrada.acceso : "";
  if ("precision" in entrada) b.precision = entrada.precision === "exacta" ? "exacta" : entrada.precision === "colonia" ? "colonia" : "municipio";
  ["destacada", "oficinas", "trifasica"].forEach((k) => { if (k in entrada) b[k] = !!entrada[k]; });
  if ("caracteristicas" in entrada) b.caracteristicas = (Array.isArray(entrada.caracteristicas) ? entrada.caracteristicas : String(entrada.caracteristicas).split("\n")).map((x) => str(x, 120)).filter(Boolean).slice(0, 30);
  if ("tamanos" in entrada) b.tamanos = (Array.isArray(entrada.tamanos) ? entrada.tamanos : String(entrada.tamanos).split(/[,\s]+/)).map(num).filter((x) => x > 0).sort((a, z) => a - z).slice(0, 20);
  if ("fotos" in entrada) b.fotos = (entrada.fotos || []).slice(0, MAX_FOTOS).map((f) => ({ id: str(f.id, 80), url: str(f.url, 2000000), alt: str(f.alt, 160) })).filter((f) => f.url);
  if (!b.nombre) throw new Error("La bodega necesita un nombre.");
  if (b.m2min && !b.m2max) b.m2max = b.m2min;
  if (b.m2max && !b.m2min) b.m2min = b.m2max;
  if (b.m2min > b.m2max) [b.m2min, b.m2max] = [b.m2max, b.m2min];
  if (!b.slug) {
    let base = slugify(b.nombre), s = base, i = 2;
    while (todas.some((x) => x.slug === s)) s = base + "-" + i++;
    b.slug = s;
  }
  if (!b.folio) {
    const max = todas.reduce((m, x) => Math.max(m, parseInt(String(x.folio || "").replace(/\D/g, "")) || 0), 0);
    b.folio = "RL-" + String(max + 1).padStart(2, "0");
  }
  b.estado = b.estado || "disponible";
  b.operacion = b.operacion || "renta";
  b.precioTipo = b.precioTipo || "consultar";
  b.fotos = b.fotos || [];
  b.caracteristicas = b.caracteristicas || [];
  b.tamanos = b.tamanos || [];
  return b;
}

function limpiaLead(entrada, previo) {
  const l = { ...(previo || {}) };
  ["nombre", "telefono", "empresa", "correo", "m2", "zona", "bodega", "origen", "giro", "mensaje", "proxima", "presupuesto"].forEach((k) => { if (k in entrada) l[k] = str(entrada[k], k === "mensaje" ? 1500 : 200); });
  if ("etapa" in entrada) l.etapa = ETAPAS.includes(entrada.etapa) ? entrada.etapa : "nuevo";
  if (Array.isArray(entrada.notas)) l.notas = entrada.notas.slice(-200).map((n) => ({ t: str(n.t, 40) || ahora(), texto: str(n.texto, 1500) })).filter((n) => n.texto);
  l.etapa = l.etapa || "nuevo";
  l.notas = l.notas || [];
  return l;
}

// ---------- Sesión ----------
const COOKIE = "rl_ses";
function leeCookie(req) {
  const c = req.headers.get("cookie") || "";
  const m = c.match(new RegExp("(?:^|; )" + COOKIE + "=([^;]+)"));
  return m ? m[1] : (req.headers.get("x-rl-token") || "");
}
async function sesionValida(req, store) {
  const tok = leeCookie(req);
  if (!tok || tok.length < 20) return false;
  return !!(await store.get("ses:" + tok));
}
async function passwordCorrecta(store, env, intento) {
  const guardada = await store.get("auth:hash");
  if (guardada) return guardada === (await hash(intento));
  return !!env.ADMIN_PASSWORD && intento === env.ADMIN_PASSWORD;
}

// ---------- API ----------
export async function api(req, store, env, semilla) {
  const url = new URL(req.url);
  const p = url.pathname.replace(/\/+$/, "");
  const m = req.method;
  const body = async () => { try { return await req.json(); } catch { return {}; } };

  try {
    // Público: prospecto desde el sitio
    if (p === "/api/lead" && m === "POST") {
      const e = await body();
      if (e.sitio_web) return json({ ok: true }); // trampa para bots
      if (!str(e.nombre) || str(e.telefono).replace(/\D/g, "").length < 8) return error("Escribe tu nombre y un teléfono de 10 dígitos.");
      const d = await leer(store, semilla);
      const l = limpiaLead({ ...e, etapa: "nuevo" });
      l.id = nid(); l.creado = ahora();
      l.origen = l.origen || "Sitio web";
      d.leads.unshift(l);
      d.leads = d.leads.slice(0, 2000);
      await guardar(store, d);
      return json({ ok: true });
    }
    // Público: clic en WhatsApp / llamada (para medir interés por bodega)
    if (p === "/api/evento" && m === "POST") {
      const e = await body();
      const tipo = ["wa", "tel", "vista"].includes(e.tipo) ? e.tipo : null;
      if (!tipo) return json({ ok: true });
      const d = await leer(store, semilla);
      const k = (str(e.bodega, 80) || "general") + ":" + tipo;
      d.eventos[k] = (d.eventos[k] || 0) + 1;
      await guardar(store, d);
      return json({ ok: true });
    }

    // Acceso: ¿ya hay contraseña? Si no, la primera persona en abrir el panel la crea.
    if (p === "/api/admin/acceso" && m === "GET") {
      const lista = !!(await store.get("auth:hash")) || !!env.ADMIN_PASSWORD;
      return json({ configurada: lista });
    }
    if (p === "/api/admin/crear" && m === "POST") {
      if ((await store.get("auth:hash")) || env.ADMIN_PASSWORD) return error("La contraseña ya existe. Inicia sesión.", 409);
      const e = await body();
      const nueva = str(e.password, 200);
      if (nueva.length < 6) return error("La contraseña debe tener al menos 6 caracteres.");
      await store.put("auth:hash", await hash(nueva));
      const tok = nid() + nid();
      await store.put("ses:" + tok, "1", { ttl: 60 * 60 * 24 * 30 });
      const seguro = url.protocol === "https:" ? "; Secure" : "";
      return json({ ok: true, token: tok }, 200, { "set-cookie": `${COOKIE}=${tok}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000${seguro}` });
    }
    if (p === "/api/admin/entrar" && m === "POST") {
      const e = await body();
      const ip = req.headers.get("cf-connecting-ip") || "local";
      const kInt = "int:" + ip;
      const intentos = parseInt((await store.get(kInt)) || "0");
      if (intentos >= 8) return error("Demasiados intentos. Espera 15 minutos.", 429);
      if (!(await passwordCorrecta(store, env, str(e.password, 200)))) {
        await store.put(kInt, String(intentos + 1), { ttl: 900 });
        return error("Contraseña incorrecta.", 401);
      }
      const tok = nid() + nid();
      await store.put("ses:" + tok, "1", { ttl: 60 * 60 * 24 * 30 });
      const seguro = url.protocol === "https:" ? "; Secure" : "";
      return json({ ok: true, token: tok }, 200, { "set-cookie": `${COOKIE}=${tok}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000${seguro}` });
    }
    if (!p.startsWith("/api/admin/")) return error("No encontrado", 404);
    if (!(await sesionValida(req, store))) return error("Inicia sesión.", 401);

    if (p === "/api/admin/salir" && m === "POST") {
      const tok = leeCookie(req);
      if (tok) await store.del("ses:" + tok);
      return json({ ok: true }, 200, { "set-cookie": `${COOKIE}=; Path=/; Max-Age=0` });
    }
    if (p === "/api/admin/todo" && m === "GET") {
      const d = await leer(store, semilla);
      return json({ ...d, maxFotos: MAX_FOTOS, etapas: ETAPAS, estados: ESTADOS });
    }
    if (p === "/api/admin/password" && m === "POST") {
      const e = await body();
      if (!(await passwordCorrecta(store, env, str(e.actual, 200)))) return error("La contraseña actual no coincide.", 401);
      if (str(e.nueva, 200).length < 6) return error("La nueva contraseña debe tener al menos 6 caracteres.");
      await store.put("auth:hash", await hash(str(e.nueva, 200)));
      return json({ ok: true });
    }
    if (p === "/api/admin/config" && m === "PUT") {
      const e = await body();
      const d = await leer(store, semilla);
      const c = { ...d.config };
      ["nombre", "frase", "asesora", "telefono", "correo", "oficina", "titular", "subtitular", "horario", "logo", "fotoAsesora", "portada", "anios"].forEach((k) => { if (k in e) c[k] = str(e[k], k === "subtitular" ? 400 : 2000000); });
      if (Array.isArray(e.faq)) c.faq = e.faq.slice(0, 20).map((x) => [str(x && x[0], 200), str(x && x[1], 1200)]).filter((x) => x[0] && x[1]);
      if ("whatsapp" in e) { let w = String(e.whatsapp).replace(/\D/g, ""); if (w.length === 10) w = "52" + w; c.whatsapp = w; }
      d.config = c;
      await guardar(store, d);
      return json({ ok: true, config: c });
    }
    // Fotos: el panel las comprime antes de subirlas (WebP ~1600 px)
    if (p === "/api/admin/foto" && m === "POST") {
      const tipo = (req.headers.get("content-type") || "").split(";")[0];
      if (!/^image\/(webp|jpeg|png)$/.test(tipo)) return error("Formato de foto no válido.");
      const bytes = new Uint8Array(await req.arrayBuffer());
      if (bytes.length > 4 * 1024 * 1024) return error("La foto pesa demasiado (máx. 4 MB).");
      const id = nid();
      const fotoUrl = await store.putImage(id, bytes, tipo);
      return json({ ok: true, id, url: fotoUrl });
    }
    let r;
    if ((r = p.match(/^\/api\/admin\/foto\/([\w-]+)$/)) && m === "DELETE") {
      await store.delImage(r[1]);
      return json({ ok: true });
    }
    if (p === "/api/admin/bodega" && m === "POST") {
      const e = await body();
      const d = await leer(store, semilla);
      const b = limpiaBodega(e, null, d.bodegas);
      b.id = nid(); b.creado = b.actualizado = ahora();
      d.bodegas.unshift(b);
      await guardar(store, d);
      return json({ ok: true, bodega: b });
    }
    if ((r = p.match(/^\/api\/admin\/bodega\/([\w-]+)$/))) {
      const d = await leer(store, semilla);
      const i = d.bodegas.findIndex((x) => x.id === r[1]);
      if (i < 0) return error("Esa bodega ya no existe.", 404);
      if (m === "PUT") {
        const e = await body();
        const antes = d.bodegas[i];
        const b = limpiaBodega(e, antes, d.bodegas.filter((x) => x.id !== antes.id));
        b.actualizado = ahora();
        d.bodegas[i] = b;
        await guardar(store, d);
        const quedan = new Set(b.fotos.map((f) => f.id));
        for (const f of antes.fotos || []) if (!quedan.has(f.id) && !String(f.id).startsWith("seed")) await store.delImage(f.id);
        return json({ ok: true, bodega: b });
      }
      if (m === "DELETE") {
        const [b] = d.bodegas.splice(i, 1);
        await guardar(store, d);
        for (const f of b.fotos || []) if (!String(f.id).startsWith("seed")) await store.delImage(f.id);
        return json({ ok: true });
      }
    }
    if (p === "/api/admin/orden" && m === "PUT") {
      const e = await body();
      const d = await leer(store, semilla);
      const pos = new Map((e.ids || []).map((id, i) => [id, i]));
      d.bodegas.sort((a, z) => (pos.get(a.id) ?? 999) - (pos.get(z.id) ?? 999));
      await guardar(store, d);
      return json({ ok: true });
    }
    if (p === "/api/admin/lead" && m === "POST") {
      const e = await body();
      if (!str(e.nombre)) return error("Escribe el nombre del prospecto.");
      const d = await leer(store, semilla);
      const l = limpiaLead(e); l.id = nid(); l.creado = ahora(); l.origen = l.origen || "Captura manual";
      d.leads.unshift(l);
      await guardar(store, d);
      return json({ ok: true, lead: l });
    }
    if ((r = p.match(/^\/api\/admin\/lead\/([\w-]+)$/))) {
      const d = await leer(store, semilla);
      const i = d.leads.findIndex((x) => x.id === r[1]);
      if (i < 0) return error("Ese prospecto ya no existe.", 404);
      if (m === "PUT") { d.leads[i] = limpiaLead(await body(), d.leads[i]); d.leads[i].actualizado = ahora(); await guardar(store, d); return json({ ok: true, lead: d.leads[i] }); }
      if (m === "DELETE") { d.leads.splice(i, 1); await guardar(store, d); return json({ ok: true }); }
    }
    return error("No encontrado", 404);
  } catch (err) {
    return error(err.message || "Algo salió mal.", 400);
  }
}
