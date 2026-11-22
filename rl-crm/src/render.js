// Páginas públicas de RL Industrial (HTML generado en el servidor, también usado por la demo).

export const e = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (n) => "$" + Math.round(n).toLocaleString("en-US");
const m2 = (n) => Math.round(n).toLocaleString("en-US") + " m²";

export function precio(b) {
  if (b.operacion === "venta" && b.precioTipo !== "mes" && b.precioTipo !== "m2") return { grande: "Consultar", chico: "en venta", nota: "Precio por WhatsApp" };
  if (b.precioTipo === "m2" && b.precio) return { grande: fmt(b.precio), chico: "por m² al mes", nota: b.m2min ? "desde " + fmt(b.precio * b.m2min) + " al mes" : "" };
  if (b.precioTipo === "mes" && b.precio) return { grande: fmt(b.precio), chico: b.operacion === "venta" ? "precio de venta" : "al mes", nota: b.m2min && b.operacion !== "venta" ? "≈ " + fmt(b.precio / b.m2min) + " por m²" : "" };
  return { grande: "Consultar", chico: "", nota: "Precio por WhatsApp" };
}
export function superficie(b) {
  if (b.superficieTexto) return b.superficieTexto;
  if (!b.m2min) return "";
  return b.m2min === b.m2max ? m2(b.m2min) : m2(b.m2min) + " a " + m2(b.m2max);
}
const accesoTxt = { trailer: "Tráiler", torton: "Torton", camioneta: "Camioneta", "": "—" };
const estadoTxt = { disponible: "Disponible", apartada: "Apartada", rentada: "Rentada", oculta: "Oculta" };
const precioM2 = (b) => (b.precioTipo === "m2" ? b.precio : b.precioTipo === "mes" && b.precio && b.m2min ? b.precio / b.m2min : null);
export const wa = (c, txt) => `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(txt)}`;

const ICON = {
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>',
  tel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5" fill="currentColor"/></svg>',
  cam: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M4 7h3l2-2.5h6L17 7h3v12H4Z"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  flecha: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.2" d="M5 12h14m-6-6 6 6-6 6"/></svg>',
  comp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M12 3v12m-5-7 5-5 5 5M5 14v6h14v-6"/></svg>',
};

function cabeza(c, { titulo, desc, url, imagen, base }) {
  return `<!doctype html><html lang="es-MX"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${e(titulo)}</title><meta name="description" content="${e(desc)}">
<meta name="theme-color" content="#0E1216">
<meta property="og:type" content="website"><meta property="og:title" content="${e(titulo)}"><meta property="og:description" content="${e(desc)}">
${url ? `<meta property="og:url" content="${e(url)}"><link rel="canonical" href="${e(url)}">` : ""}${imagen ? `<meta property="og:image" content="${e(imagen)}">` : ""}
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0E1216"/><text x="5" y="23" font-family="Arial Black,Arial" font-weight="900" font-size="15" fill="#F4F3EF">R</text><text x="17" y="23" font-family="Arial Black,Arial" font-weight="900" font-size="15" fill="#8CC63F">L</text></svg>')}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${base}sitio.css?v=4">
</head><body>`;
}

function encabezado(c, L, solida) {
  return `<header class="top${solida ? " solida" : ""}" id="top"><div class="wrap top-in">
<a class="marca" href="${L("")}" aria-label="${e(c.nombre)}, inicio">${c.logo ? `<img src="${e(c.logo)}" alt="" width="40" height="40">` : ""}<span><b>${e(c.nombre)}</b><small>Bienes raíces industriales</small></span></a>
<nav class="nav" aria-label="Principal"><a href="${L("#bodegas")}">Bodegas</a><a href="${L("#mapa")}">Mapa</a><a href="${L("#como")}">Cómo trabajamos</a><a href="${L("#contacto")}">Contacto</a></nav>
<a class="btn-wa-top" data-ev="wa" href="${e(wa(c, "Hola, vi su página y busco una bodega."))}" target="_blank" rel="noopener">${ICON.wa}<span>${e(c.telefono)}</span></a>
</div></header>`;
}

function pie(c, L) {
  return `<footer class="pie"><div class="wrap pie-in">
<div><div class="marca grande">${c.logo ? `<img src="${e(c.logo)}" alt="" width="48" height="48">` : ""}<span><b>${e(c.nombre)}</b><small>${e(c.frase || "")}</small></span></div>
<p class="muted">${e(c.oficina || "")}</p></div>
<div><h4>Contacto</h4><p><a href="tel:+${e(c.whatsapp)}" data-ev="tel">${e(c.telefono)}</a>${c.correo ? `<br><a href="mailto:${e(c.correo)}">${e(c.correo)}</a>` : ""}<br><span class="muted">${e(c.horario || "")}</span></p></div>
<div><h4>Explora</h4><p><a href="${L("#bodegas")}">Catálogo de bodegas</a><br><a href="${L("#mapa")}">Mapa</a><br><a href="${L("#preguntas")}">Preguntas frecuentes</a></p></div>
</div><div class="wrap legal"><span>© ${new Date().getFullYear()} ${e(c.nombre)}. Precios sujetos a cambio y disponibilidad.</span><span>Hecho con <a href="https://ubika.demomx.workers.dev/">Ubika</a></span></div></footer>
<a class="wa-flota" data-ev="wa" href="${e(wa(c, "Hola, busco una bodega. ¿Me pueden ayudar?"))}" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">${ICON.wa}</a>`;
}

function foto(b, i = 0) {
  return b.fotos && b.fotos[i] ? b.fotos[i] : null;
}

function palabras(t) {
  let n = 0;
  return String(t).split(/\s+/).filter(Boolean).map((w) => {
    const verde = /^industrial/i.test(w);
    return `<span class="pal" aria-hidden="true"><span style="--i:${n++}"${verde ? ' class="verde"' : ""}>${e(w)}</span></span>`;
  }).join(" ");
}

export function tarjeta(b, c, L) {
  const p = precio(b), f = foto(b);
  const pm = precioM2(b);
  return `<article class="card${b.estado !== "disponible" ? " no-disp" : ""}" data-zona="${e(b.zona)}" data-min="${b.m2min || 0}" data-max="${b.m2max || 0}" data-acceso="${e(b.acceso || "")}" data-op="${e(b.operacion)}" data-pm2="${pm || ""}" data-dest="${b.destacada ? 1 : 0}" data-slug="${e(b.slug)}">
<a class="card-foto" href="${L("bodega/" + b.slug)}">${f ? `<img src="${e(f.url)}" alt="${e(f.alt || b.nombre)}" loading="lazy" decoding="async">` : `<div class="sin-foto">${e(b.tipo || "Inmueble")}</div>`}
<span class="chip-op">${b.operacion === "venta" ? "Venta" : "Renta"}</span>${b.estado !== "disponible" ? `<span class="chip-estado ${e(b.estado)}">${e(estadoTxt[b.estado])}</span>` : ""}${b.fotos && b.fotos.length > 1 ? `<span class="chip-fotos">${ICON.cam}${b.fotos.length}</span>` : ""}</a>
<div class="card-cuerpo">
<p class="card-precio"><b>${e(p.grande)}</b> <span>${e(p.chico)}</span></p>
${p.nota ? `<p class="card-nota">${e(p.nota)}</p>` : ""}
<h3><a href="${L("bodega/" + b.slug)}">${e(b.nombre)}</a></h3>
<p class="card-zona">${ICON.pin}${e([b.zona, b.entidad].filter(Boolean).join(", ") || "Ubicación por confirmar")}</p>
<ul class="specs"><li><b>${e(b.m2min ? (b.m2min === b.m2max ? m2(b.m2min) : m2(b.m2min) + "+") : "—")}</b><span>Superficie</span></li><li><b>${b.altura ? e(b.altura) + " m" : "—"}</b><span>Altura</span></li><li><b>${e(accesoTxt[b.acceso || ""])}</b><span>Acceso</span></li></ul>
</div>
<div class="card-acc"><a class="btn btn-linea" href="${L("bodega/" + b.slug)}">Ver ficha</a><a class="btn btn-wa" data-ev="wa" data-bodega="${e(b.slug)}" href="${e(wa(c, `Hola, me interesa ${b.nombre} (${b.folio}). ¿Sigue disponible?`))}" target="_blank" rel="noopener">${ICON.wa}WhatsApp</a></div>
</article>`;
}

// Foto de portada por defecto (Pexels, uso libre): tráileres en andenes de carga.
export const PORTADA_BASE = "https://images.pexels.com/photos/1267325/pexels-photo-1267325.jpeg?auto=compress&cs=tinysrgb";

const FAQ_BASE = [
  ["¿Qué necesito para rentar una bodega?", "Depende de cada inmueble. En general se pide identificación, comprobante de domicilio, datos de la empresa y depósito en garantía. Te decimos los requisitos exactos de la bodega que te interese antes de la visita."],
  ["¿Cuánto cuesta el mantenimiento?", "Cambia por inmueble y parque industrial. Si la ficha no lo indica, pregúntalo con el botón de WhatsApp y te lo confirmamos por escrito."],
  ["¿Me ayudan con el contrato?", "Sí. Revisamos el contrato contigo para que sepas qué firmas: plazos, incrementos, depósito y responsabilidades de cada parte."],
  ["¿Puedo visitar varias bodegas el mismo día?", "Sí. Dinos cuáles te interesan y armamos un recorrido para que las veas en una sola salida."],
];

export function paginaInicio(d, { base = "/", L = (x) => base + x, url = "" } = {}) {
  const c = d.config;
  const bs = d.bodegas.filter((b) => b.estado !== "oculta");
  const disp = bs.filter((b) => b.estado === "disponible");
  const totalM2 = disp.reduce((s, b) => s + (b.tamanos && b.tamanos.length > 1 ? b.tamanos.reduce((a, t) => a + t, 0) : b.m2max || 0), 0);
  const zonas = {};
  bs.forEach((b) => { if (b.zona) zonas[b.zona] = (zonas[b.zona] || 0) + 1; });
  const zonasOrd = Object.entries(zonas).sort((a, z) => z[1] - a[1]);
  const dest = bs.filter((b) => b.destacada && foto(b));
  const portada = c.portada || PORTADA_BASE;
  const minM2 = Math.min(...bs.map((b) => b.m2min || Infinity));
  const maxM2 = Math.max(...bs.map((b) => b.m2max || 0));
  const faq = (c.faq && c.faq.length ? c.faq : FAQ_BASE);
  const mapa = bs.filter((b) => b.lat && b.lng).map((b) => ({ s: b.slug, n: b.nombre, z: b.zona, la: b.lat, ln: b.lng, p: precio(b).grande, f: foto(b) ? foto(b).url : "", h: L("bodega/" + b.slug) }));

  return cabeza(c, { titulo: `${c.nombre} · ${c.titular || "Bodegas industriales en renta"}`, desc: c.subtitular || "", url, imagen: portada.includes("images.pexels.com") ? portada + "&w=1200" : portada, base }) +
    encabezado(c, L) + `
<main>
<section class="hero">
<div class="hero-fotos" aria-hidden="true">${portada.includes("images.pexels.com") ? `<img src="${e(portada)}&w=1920" srcset="${e(portada)}&w=960 960w, ${e(portada)}&w=1600 1600w, ${e(portada)}&w=2400 2400w" sizes="100vw" alt="" fetchpriority="high" class="on">` : `<img src="${e(portada)}" alt="" fetchpriority="high" class="on">`}</div>
<div class="hero-velo"></div>
<div class="wrap hero-in">
<p class="eyebrow"><span></span>${e(c.frase || "")}</p>
<h1 class="titular" aria-label="${e(c.titular || "Bodegas industriales en renta")}">${palabras(c.titular || "Bodegas industriales en renta")}</h1>
<p class="hero-sub">${e(c.subtitular || "")}</p>
<form class="buscador" id="buscador" role="search">
<label><span>¿Cuántos m² necesitas?</span><input type="number" inputmode="numeric" name="m2" placeholder="Ej. 800" min="0"></label>
<label><span>Zona</span><select name="zona"><option value="">Todas las zonas</option>${zonasOrd.map(([z, n]) => `<option>${e(z)}</option>`).join("")}</select></label>
<label class="sw"><input type="checkbox" name="trailer"><i></i><span>Entra tráiler</span></label>
<button class="btn btn-lima" type="submit">Buscar bodega ${ICON.flecha}</button>
</form>
<a class="hero-ficha" href="${L("#bodegas")}"><b>${disp.length} inmuebles disponibles</b> · ${zonasOrd.slice(0, 4).map(([z]) => e(z)).join(" · ")}${ICON.flecha}</a>
</div></section>

<section class="cifras" aria-label="Resumen"><div class="wrap cifras-in">
<div><b data-cuenta="${disp.length}">${disp.length}</b><span>inmuebles disponibles</span></div>
<div><b data-cuenta="${totalM2}">${totalM2.toLocaleString("en-US")}</b><span>m² en catálogo</span></div>
<div><b data-cuenta="${zonasOrd.length}">${zonasOrd.length}</b><span>zonas de CDMX y Edomex</span></div>
<div><b>${Number.isFinite(minM2) ? minM2.toLocaleString("en-US") + "–" + maxM2.toLocaleString("en-US") : "—"}</b><span>m² por espacio</span></div>
</div></section>

<div class="cinta" aria-hidden="true"><div class="cinta-in">${[0, 1].map(() => `<span>${["Acceso de tráiler", "Andenes", "Parques industriales", "De " + (Number.isFinite(minM2) ? minM2.toLocaleString("en-US") : "150") + " a " + maxM2.toLocaleString("en-US") + " m²", "Asesoría legal en tu contrato", "CDMX y Estado de México", "Respuesta por WhatsApp"].map((t) => `<i>${e(t)}</i>`).join("")}</span>`).join("")}</div></div>

<section class="seccion" id="bodegas"><div class="wrap">
<div class="titulo-sec"><p class="eyebrow oscuro"><span></span>Catálogo</p><h2>Encuentra tu bodega</h2><p class="muted">Filtra por zona y tamaño. Precio, superficie y acceso a la vista, sin letras chiquitas.</p></div>
<div class="filtros" id="filtros">
<div class="chips" role="group" aria-label="Zona"><button class="chip on" data-zona="">Todas <i>${bs.length}</i></button>${zonasOrd.map(([z, n]) => `<button class="chip" data-zona="${e(z)}">${e(z)} <i>${n}</i></button>`).join("")}</div>
<div class="filtros-2">
<select id="fTam" aria-label="Superficie"><option value="">Cualquier tamaño</option><option value="0-600">Hasta 600 m²</option><option value="600-2000">600 a 2,000 m²</option><option value="2000-5000">2,000 a 5,000 m²</option><option value="5000-999999">Más de 5,000 m²</option></select>
<select id="fOp" aria-label="Operación"><option value="">Renta y venta</option><option value="renta">Solo renta</option><option value="venta">Solo venta</option></select>
<label class="sw"><input type="checkbox" id="fTrailer"><i></i><span>Solo con tráiler</span></label>
<select id="fOrden" aria-label="Ordenar"><option value="">Recomendadas</option><option value="pm2">Menor precio por m²</option><option value="m2a">Superficie: menor a mayor</option><option value="m2d">Superficie: mayor a menor</option></select>
</div>
<p class="conteo" id="conteo" aria-live="polite"></p>
</div>
<div class="grid" id="grid">${bs.map((b) => tarjeta(b, c, L)).join("")}</div>
<div class="vacio" id="vacio" hidden><h3>No hay bodegas con esos filtros</h3><p>Cuéntanos qué buscas y te avisamos en cuanto tengamos una.</p><a class="btn btn-wa" data-ev="wa" href="${e(wa(c, "Hola, busco una bodega y no encontré una en su página. Necesito:"))}" target="_blank" rel="noopener">${ICON.wa}Avísenme por WhatsApp</a></div>
</div></section>

<section class="seccion oscura" id="mapa"><div class="wrap">
<div class="titulo-sec"><p class="eyebrow"><span></span>Ubicaciones</p><h2>Dónde están</h2><p class="muted-claro">Ubicación aproximada. La dirección exacta se comparte al agendar tu visita.</p></div>
<div class="mapa" id="mapaGeneral" data-puntos="${e(JSON.stringify(mapa))}"><p class="mapa-carga">Cargando mapa…</p></div>
<div class="zonas">${zonasOrd.map(([z, n]) => `<button class="zona" data-zona="${e(z)}"><b>${e(z)}</b><span>${n} ${n === 1 ? "inmueble" : "inmuebles"}</span></button>`).join("")}</div>
</div></section>

<section class="seccion" id="como"><div class="wrap">
<div class="titulo-sec"><p class="eyebrow oscuro"><span></span>Cómo trabajamos</p><h2>De la búsqueda a las llaves</h2></div>
<ol class="pasos">
<li><b>01</b><h3>Nos cuentas qué necesitas</h3><p>Metros, zona, tipo de acceso y giro. Por WhatsApp o con el formulario.</p></li>
<li><b>02</b><h3>Te enviamos opciones</h3><p>Fichas con fotos, precio y requisitos para que compares antes de moverte.</p></li>
<li><b>03</b><h3>Visitamos juntos</h3><p>Armamos un recorrido para ver varias bodegas en una sola salida.</p></li>
<li><b>04</b><h3>Revisamos tu contrato</h3><p>Asesoría legal para que firmes tranquilo y recibas tu bodega.</p></li>
</ol>
</div></section>

<section class="seccion gris" id="asesora"><div class="wrap asesora">
${c.fotoAsesora ? `<img src="${e(c.fotoAsesora)}" alt="${e(c.asesora)}" loading="lazy" width="320" height="380">` : ""}
<div><p class="eyebrow oscuro"><span></span>Quién te atiende</p><h2>${e(c.asesora || c.nombre)}</h2>
<p class="lead">Bienes raíces industriales, abogacía civil y gestión de inmuebles. Te acompaña desde la primera visita hasta la firma.</p>
<div class="acc-fila"><a class="btn btn-wa" data-ev="wa" href="${e(wa(c, "Hola Lic., busco una bodega."))}" target="_blank" rel="noopener">${ICON.wa}Escribir por WhatsApp</a><a class="btn btn-linea" data-ev="tel" href="tel:+${e(c.whatsapp)}">${ICON.tel}Llamar</a></div>
<p class="muted">${e(c.oficina || "")}${c.horario ? " · " + e(c.horario) : ""}</p></div>
</div></section>

<section class="seccion" id="preguntas"><div class="wrap estrecho">
<div class="titulo-sec"><p class="eyebrow oscuro"><span></span>Preguntas frecuentes</p><h2>Antes de rentar</h2></div>
<div class="faq">${faq.map(([q, a]) => `<details><summary>${e(q)}</summary><p>${e(a)}</p></details>`).join("")}</div>
</div></section>

<section class="seccion oscura" id="contacto"><div class="wrap contacto">
<div><p class="eyebrow"><span></span>Contacto</p><h2>¿No encontraste lo que buscas?</h2><p class="muted-claro">Déjanos tus datos y lo que necesitas. Te contactamos con opciones, incluso de inmuebles que todavía no publicamos.</p>
<ul class="lista-check"><li>Sin costo para ti</li><li>Sin pedirte RFC ni papeles para cotizar</li><li>Respuesta por WhatsApp</li></ul></div>
<form class="form-lead" data-origen="Formulario de contacto" novalidate>
<label>Nombre<input name="nombre" autocomplete="name" required></label>
<label>Teléfono (WhatsApp)<input name="telefono" type="tel" inputmode="tel" autocomplete="tel" required placeholder="10 dígitos"></label>
<label><span>Empresa <small>(opcional)</small></span><input name="empresa" autocomplete="organization"></label>
<div class="dos"><label>m² que buscas<input name="m2" inputmode="numeric" placeholder="Ej. 1,000"></label>
<label>Zona<select name="zona"><option value="">Cualquiera</option>${zonasOrd.map(([z]) => `<option>${e(z)}</option>`).join("")}</select></label></div>
<label><span>¿Algo más? <small>(opcional)</small></span><textarea name="mensaje" rows="3" placeholder="Giro, acceso de tráiler, fecha de entrada…"></textarea></label>
<input class="trampa" name="sitio_web" tabindex="-1" autocomplete="off" aria-hidden="true">
<button class="btn btn-lima" type="submit">Enviar y abrir WhatsApp ${ICON.flecha}</button>
<p class="form-estado" role="status"></p>
</form>
</div></section>
</main>` + pie(c, L) + scripts(c, base);
}

function scripts(c, base) {
  return `<script>window.RLC=${JSON.stringify({ whatsapp: c.whatsapp, nombre: c.nombre }).replace(/</g, "\\u003c")}</script><script src="${base}sitio.js?v=4" defer></script></body></html>`;
}

export function paginaBodega(d, slug, { base = "/", L = (x) => base + x, url = "" } = {}) {
  const c = d.config;
  const b = d.bodegas.find((x) => x.slug === slug && x.estado !== "oculta");
  if (!b) return null;
  const p = precio(b), fotos = b.fotos || [];
  const pm = precioM2(b);
  const otras = d.bodegas.filter((x) => x.estado !== "oculta" && x.slug !== b.slug)
    .sort((a, z) => (z.zona === b.zona) - (a.zona === b.zona) || (z.destacada ? 1 : 0) - (a.destacada ? 1 : 0)).slice(0, 3);
  const msg = (t) => `Hola, me interesa ${b.nombre} (${b.folio}). ${t}`;
  const specs = [
    ["Superficie", superficie(b) || "—"],
    ["Precio por m²", pm ? fmt(pm) : "Consultar"],
    ["Altura libre", b.altura ? b.altura + " m" : "—"],
    ["Andenes", b.andenes != null ? String(b.andenes) : "—"],
    ["Acceso", accesoTxt[b.acceso || ""]],
    ["Oficinas", b.oficinas ? "Sí" : "No"],
    ["Luz trifásica", b.trifasica ? "Sí" : "Consultar"],
    ["Mantenimiento", b.mantenimiento || "Consultar"],
  ];
  const mosaico = fotos.length
    ? `<div class="mosaico n${Math.min(fotos.length, 5)}" id="mosaico">${fotos.map((f, i) => `<button type="button" data-i="${i}" aria-label="Ver foto ${i + 1} de ${fotos.length}"><img src="${e(f.url)}" alt="${e(f.alt || b.nombre)}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}></button>`).join("")}<span class="ver-fotos">${ICON.cam}${fotos.length} ${fotos.length === 1 ? "foto" : "fotos"}</span></div>`
    : `<div class="mosaico vacio-foto"><p>Fotos disponibles por WhatsApp</p></div>`;

  return cabeza(c, { titulo: `${b.nombre} · ${b.tipo || "Bodega"} en ${b.zona || "renta"} | ${c.nombre}`, desc: `${b.tipo || "Bodega"} de ${superficie(b)} en ${b.zona}. ${p.grande} ${p.chico}. ${b.descripcion || ""}`.slice(0, 300), url, imagen: fotos[0] && fotos[0].url, base }) +
    encabezado(c, L, true) + `
<main class="ficha" data-slug="${e(b.slug)}">
<div class="wrap">
<nav class="migas" aria-label="Ruta"><a href="${L("")}">Inicio</a><span>/</span><a href="${L("#bodegas")}">Bodegas</a><span>/</span><span>${e(b.nombre)}</span></nav>
<div class="ficha-cab">
<div><p class="folio">${e(b.folio)} · ${e(b.tipo || "")} · ${b.operacion === "venta" ? "Venta" : "Renta"}${b.estado !== "disponible" ? ` · <span class="chip-estado ${e(b.estado)}">${e(estadoTxt[b.estado])}</span>` : ""}</p>
<h1>${e(b.nombre)}</h1><p class="card-zona">${ICON.pin}${e(b.direccion || [b.zona, b.entidad].filter(Boolean).join(", "))}</p></div>
<button class="btn btn-linea chico" id="compartir" type="button">${ICON.comp}Compartir</button>
</div>
${mosaico}
<div class="ficha-cols">
<div class="ficha-main">
<div class="precio-movil"><p class="card-precio"><b>${e(p.grande)}</b> <span>${e(p.chico)}</span></p>${p.nota ? `<p class="card-nota">${e(p.nota)}</p>` : ""}</div>
<h2 class="sub">Ficha técnica</h2>
<dl class="tecnica">${specs.map(([k, v]) => `<div><dt>${e(k)}</dt><dd>${e(v)}</dd></div>`).join("")}</dl>
${b.descripcion ? `<h2 class="sub">Descripción</h2><p class="desc">${e(b.descripcion).replace(/\n/g, "<br>")}</p>` : ""}
${b.caracteristicas && b.caracteristicas.length ? `<h2 class="sub">Características</h2><ul class="carac">${b.caracteristicas.map((x) => `<li>${e(x)}</li>`).join("")}</ul>` : ""}
${b.tamanos && b.tamanos.length > 1 ? `<h2 class="sub">Tamaños disponibles</h2><div class="tamanos">${b.tamanos.map((t) => `<span>${m2(t)}</span>`).join("")}</div>` : ""}
${pm && b.m2min ? `<h2 class="sub">Calcula tu renta</h2><div class="calc" data-pm2="${pm}" data-min="${b.m2min}" data-max="${b.m2max || b.m2min}"><label><span>Superficie</span><input type="range" min="${b.m2min}" max="${b.m2max || b.m2min}" step="${(b.m2max - b.m2min) > 2000 ? 100 : 10}" value="${b.m2min}"><output>${m2(b.m2min)}</output></label><p><b>${fmt(pm * b.m2min)}</b> al mes <small>aprox., sin IVA ni mantenimiento</small></p></div>` : ""}
${b.lat && b.lng ? `<h2 class="sub">Ubicación aproximada</h2><div class="mapa chico" id="mapaFicha" data-lat="${b.lat}" data-lng="${b.lng}" data-precision="${e(b.precision || "municipio")}"><p class="mapa-carga">Cargando mapa…</p></div>
<p class="acc-fila"><a class="btn btn-linea chico" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}">Abrir en Google Maps</a><a class="btn btn-linea chico" target="_blank" rel="noopener" href="https://waze.com/ul?ll=${b.lat},${b.lng}&navigate=yes">Abrir en Waze</a></p>` : ""}
</div>
<aside class="ficha-lado"><div class="caja">
<p class="card-precio"><b>${e(p.grande)}</b> <span>${e(p.chico)}</span></p>${p.nota ? `<p class="card-nota">${e(p.nota)}</p>` : ""}
<p class="caja-tit">Pregunta en un toque</p>
<div class="rapidas">${["¿Sigue disponible?", "¿Cuánto es el mantenimiento?", "¿Qué requisitos piden?", "¿Acepta mi giro?", "Quiero agendar una visita"].map((q) => `<a data-ev="wa" data-bodega="${e(b.slug)}" href="${e(wa(c, msg(q)))}" target="_blank" rel="noopener">${e(q)}</a>`).join("")}</div>
<form class="form-lead" data-origen="Ficha de bodega" data-bodega="${e(b.slug)}" data-nombre-bodega="${e(b.nombre)}" data-folio="${e(b.folio)}" novalidate>
<p class="caja-tit">O agenda tu visita</p>
<label>Nombre<input name="nombre" autocomplete="name" required></label>
<label>Teléfono (WhatsApp)<input name="telefono" type="tel" inputmode="tel" autocomplete="tel" required placeholder="10 dígitos"></label>
<label><span>Empresa <small>(opcional)</small></span><input name="empresa" autocomplete="organization"></label>
<input class="trampa" name="sitio_web" tabindex="-1" autocomplete="off" aria-hidden="true">
<button class="btn btn-lima ancho" type="submit">Agendar visita ${ICON.flecha}</button>
<p class="form-estado" role="status"></p>
</form>
<div class="acc-fila"><a class="btn btn-wa ancho" data-ev="wa" data-bodega="${e(b.slug)}" href="${e(wa(c, msg("¿Me pueden dar más información?")))}" target="_blank" rel="noopener">${ICON.wa}WhatsApp</a><a class="btn btn-linea" data-ev="tel" data-bodega="${e(b.slug)}" href="tel:+${e(c.whatsapp)}" aria-label="Llamar">${ICON.tel}</a></div>
<p class="asesor-mini">${c.fotoAsesora ? `<img src="${e(c.fotoAsesora)}" alt="" width="40" height="40">` : ""}<span>Te atiende <b>${e(c.asesora || c.nombre)}</b></span></p>
</div></aside>
</div>
${otras.length ? `<section class="otras"><h2 class="sub">También te pueden interesar</h2><div class="grid">${otras.map((x) => tarjeta(x, c, L)).join("")}</div></section>` : ""}
</div>
<div class="barra-movil"><div><b>${e(p.grande)}</b> <span>${e(p.chico)}</span></div><a class="btn btn-wa" data-ev="wa" data-bodega="${e(b.slug)}" href="${e(wa(c, msg("¿Sigue disponible?")))}" target="_blank" rel="noopener">${ICON.wa}WhatsApp</a></div>
<div class="visor" id="visor" hidden><button class="v-cerrar" type="button" aria-label="Cerrar">×</button><button class="v-ant" type="button" aria-label="Anterior">‹</button><figure><img alt=""><figcaption></figcaption></figure><button class="v-sig" type="button" aria-label="Siguiente">›</button></div>
<script type="application/json" id="fotosJSON">${JSON.stringify(fotos.map((f) => ({ u: f.url, a: f.alt }))).replace(/</g, "\\u003c")}</script>
</main>` + pie(c, L) + scripts(c, base);
}

export function pagina404(d, { base = "/", L = (x) => base + x } = {}) {
  const c = d.config;
  return cabeza(c, { titulo: "No encontramos esa página · " + c.nombre, desc: "", base }) + encabezado(c, L, true) +
    `<main class="wrap error404"><h1>Esta bodega ya no está publicada</h1><p>Puede que ya se haya rentado. Mira las disponibles o escríbenos.</p><p class="acc-fila"><a class="btn btn-lima" href="${L("#bodegas")}">Ver bodegas disponibles</a><a class="btn btn-wa" href="${e(wa(c, "Hola, busco una bodega."))}" target="_blank" rel="noopener">${ICON.wa}WhatsApp</a></p></main>` + pie(c, L) + scripts(c, base);
}
