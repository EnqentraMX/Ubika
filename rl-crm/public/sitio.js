(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var demo = null;
  try { if (window.parent !== window && window.parent.RLdemo) demo = window.parent.RLdemo; } catch (e) {}
  var pedir = demo ? demo.fetch : function (u, o) { return fetch(u, o); };
  var C = window.RLC || {};
  var fmt = function (n) { return "$" + Math.round(n).toLocaleString("en-US"); };
  var m2 = function (n) { return Math.round(n).toLocaleString("en-US") + " m²"; };

  // En la demo, los enlaces internos los maneja la ventana de arriba
  if (demo) {
    document.addEventListener("click", function (ev) {
      var a = ev.target.closest && ev.target.closest("a[href]");
      if (!a) return;
      var h = a.getAttribute("href");
      if (h.indexOf("#/") === 0) { ev.preventDefault(); demo.ir(h.slice(1)); }
      else if (h.indexOf("#") === 0 && h.length > 1) { ev.preventDefault(); var t = document.getElementById(h.slice(1)); if (t) t.scrollIntoView({ behavior: "smooth" }); else demo.ir("/" + h); }
    });
  }

  // Si una foto no carga, mostramos un fondo en lugar de una imagen rota
  document.addEventListener("error", function (ev) {
    var img = ev.target;
    if (!img || img.tagName !== "IMG" || img.dataset.fallo) return;
    img.dataset.fallo = "1";
    if (img.closest(".hero-fotos")) { img.remove(); return; }
    var d = document.createElement("div");
    d.className = "sin-foto"; d.textContent = img.closest(".mosaico") ? "Foto" : "RL Industrial";
    d.style.width = "100%"; d.style.height = "100%";
    img.replaceWith(d);
  }, true);
  $$("img").forEach(function (i) { if (i.complete && !i.naturalWidth && i.getAttribute("src")) i.dispatchEvent(new Event("error")); });

  // Encabezado sólido al bajar
  var top = $("#top");
  if (top && !top.classList.contains("solida")) {
    var onS = function () { top.classList.toggle("scroll", scrollY > 40); };
    addEventListener("scroll", onS, { passive: true }); onS();
  }

  // Medición de clics (WhatsApp / llamada)
  document.addEventListener("click", function (ev) {
    var a = ev.target.closest && ev.target.closest("[data-ev]");
    if (!a) return;
    var cuerpo = JSON.stringify({ tipo: a.getAttribute("data-ev"), bodega: a.getAttribute("data-bodega") || ((($(".ficha") || {}).dataset) || {}).slug || "" });
    try {
      if (!demo && navigator.sendBeacon) navigator.sendBeacon("/api/evento", new Blob([cuerpo], { type: "application/json" }));
      else pedir("/api/evento", { method: "POST", headers: { "content-type": "application/json" }, body: cuerpo });
    } catch (e) {}
  });

  // Fotos de portada que rotan
  var hf = $$(".hero-fotos img"), hs = $$("#heroFicha span"), hi = 0;
  if (hf.length > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setInterval(function () {
      hf[hi].classList.remove("on"); if (hs[hi]) hs[hi].hidden = true;
      hi = (hi + 1) % hf.length;
      hf[hi].classList.add("on"); if (hs[hi]) hs[hi].hidden = false;
      if (hs[hi] && hs[hi].dataset.h) $("#heroFicha").setAttribute("href", hs[hi].dataset.h);
    }, 5200);
  }

  // ---------- Catálogo ----------
  var grid = $("#grid");
  var estado = { zona: "", tam: "", op: "", trailer: false, orden: "", m2: 0 };
  function aplica() {
    if (!grid || !$("#filtros")) return;
    var cards = $$(".card", grid), vis = 0;
    cards.forEach(function (c) {
      var d = c.dataset, min = +d.min, max = +d.max, ok = true;
      if (estado.zona && d.zona !== estado.zona) ok = false;
      if (estado.op && d.op !== estado.op) ok = false;
      if (estado.trailer && d.acceso !== "trailer") ok = false;
      if (estado.tam) { var r = estado.tam.split("-"); if (max < +r[0] || min > +r[1]) ok = false; }
      if (estado.m2) { if (max && max < estado.m2 * 0.8) ok = false; if (min && min > estado.m2 * 1.6) ok = false; }
      c.hidden = !ok; if (ok) vis++;
    });
    var orden = cards.slice().sort(function (a, b) {
      var A = a.dataset, B = b.dataset;
      if (estado.orden === "pm2") return (+A.pm2 || 1e9) - (+B.pm2 || 1e9);
      if (estado.orden === "m2a") return (+A.min) - (+B.min);
      if (estado.orden === "m2d") return (+B.max) - (+A.max);
      return 0;
    });
    if (estado.orden) orden.forEach(function (c) { grid.appendChild(c); });
    $("#conteo").textContent = vis + " de " + cards.length + " inmuebles" + (estado.m2 ? " para ~" + m2(estado.m2) : "");
    $("#vacio").hidden = vis > 0;
    $$(".chips .chip").forEach(function (b) { b.classList.toggle("on", b.dataset.zona === estado.zona); });
  }
  var orig = grid ? $$(".card", grid) : [];
  if ($("#filtros")) {
    $$(".chips .chip").forEach(function (b) { b.addEventListener("click", function () { estado.zona = b.dataset.zona; aplica(); }); });
    $("#fTam").addEventListener("change", function () { estado.tam = this.value; estado.m2 = 0; aplica(); });
    $("#fOp").addEventListener("change", function () { estado.op = this.value; aplica(); });
    $("#fTrailer").addEventListener("change", function () { estado.trailer = this.checked; aplica(); });
    $("#fOrden").addEventListener("change", function () {
      estado.orden = this.value;
      if (!estado.orden) orig.forEach(function (c) { grid.appendChild(c); });
      aplica();
    });
    aplica();
  }
  var bus = $("#buscador");
  if (bus) bus.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var f = new FormData(bus);
    estado.zona = f.get("zona") || ""; estado.m2 = +f.get("m2") || 0; estado.trailer = !!f.get("trailer"); estado.tam = "";
    $("#fTrailer").checked = estado.trailer; $("#fTam").value = "";
    aplica();
    $("#bodegas").scrollIntoView({ behavior: "smooth" });
  });
  $$(".zona").forEach(function (z) {
    z.addEventListener("click", function () { estado.zona = z.dataset.zona; aplica(); $("#bodegas").scrollIntoView({ behavior: "smooth" }); });
  });

  // ---------- Mapas (Leaflet + OpenStreetMap) ----------
  var cola = [], cargando = false;
  function leaflet(cb) {
    if (window.L) return cb();
    cola.push(cb); if (cargando) return; cargando = true;
    var css = document.createElement("link"); css.rel = "stylesheet"; css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(css);
    var s = document.createElement("script"); s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.onload = function () { cola.forEach(function (f) { f(); }); };
    s.onerror = function () { $$(".mapa-carga").forEach(function (p) { p.textContent = "No se pudo cargar el mapa."; }); };
    document.head.appendChild(s);
  }
  function alVer(el, cb) {
    if (!el) return;
    if (!("IntersectionObserver" in window)) return cb();
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); cb(); } }, { rootMargin: "300px" });
    io.observe(el);
  }
  function capa(m) {
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", { maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO' }).addTo(m);
  }
  var esc = function (t) { return String(t || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var mg = $("#mapaGeneral");
  alVer(mg, function () {
    leaflet(function () {
      var pts = JSON.parse(mg.dataset.puntos || "[]");
      var carga = $(".mapa-carga", mg); if (carga) carga.remove();
      var m = L.map(mg, { scrollWheelZoom: false }); capa(m);
      var b = [];
      pts.forEach(function (p) {
        var ic = L.divIcon({ className: "", html: '<div class="pin-precio">' + esc(p.p) + "</div>", iconSize: null });
        L.marker([p.la, p.ln], { icon: ic }).addTo(m).bindPopup('<div class="pop">' + (p.f ? '<img src="' + esc(p.f) + '" alt="">' : "") + "<b>" + esc(p.n) + "</b>" + esc(p.z) + '<br><a href="' + esc(p.h) + '">Ver ficha →</a></div>');
        b.push([p.la, p.ln]);
      });
      if (b.length) m.fitBounds(b, { padding: [50, 50], maxZoom: 12 }); else m.setView([19.43, -99.13], 10);
    });
  });
  var mf = $("#mapaFicha");
  alVer(mf, function () {
    leaflet(function () {
      var carga = $(".mapa-carga", mf); if (carga) carga.remove();
      var la = +mf.dataset.lat, ln = +mf.dataset.lng, pr = mf.dataset.precision;
      var m = L.map(mf, { scrollWheelZoom: false }); capa(m);
      m.setView([la, ln], pr === "exacta" ? 15 : pr === "colonia" ? 14 : 12);
      if (pr === "exacta") L.marker([la, ln]).addTo(m);
      else L.circle([la, ln], { radius: pr === "colonia" ? 700 : 2200, color: "#4F7A1A", weight: 2, fillColor: "#8CC63F", fillOpacity: 0.18 }).addTo(m);
    });
  });

  // ---------- Galería ----------
  var fotos = []; try { fotos = JSON.parse(($("#fotosJSON") || {}).textContent || "[]"); } catch (e) {}
  var visor = $("#visor"), vi = 0;
  function muestra(i) { vi = (i + fotos.length) % fotos.length; $("img", visor).src = fotos[vi].u; $("img", visor).alt = fotos[vi].a || ""; $("figcaption", visor).textContent = (vi + 1) + " / " + fotos.length + (fotos[vi].a ? " · " + fotos[vi].a : ""); }
  if (visor && fotos.length) {
    $$("#mosaico button").forEach(function (b) { b.addEventListener("click", function () { muestra(+b.dataset.i); visor.hidden = false; document.body.style.overflow = "hidden"; }); });
    var cierra = function () { visor.hidden = true; document.body.style.overflow = ""; };
    $(".v-cerrar", visor).onclick = cierra;
    $(".v-ant", visor).onclick = function () { muestra(vi - 1); };
    $(".v-sig", visor).onclick = function () { muestra(vi + 1); };
    visor.addEventListener("click", function (e) { if (e.target === visor) cierra(); });
    addEventListener("keydown", function (e) { if (visor.hidden) return; if (e.key === "Escape") cierra(); if (e.key === "ArrowLeft") muestra(vi - 1); if (e.key === "ArrowRight") muestra(vi + 1); });
    var x0 = null;
    visor.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    visor.addEventListener("touchend", function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 45) muestra(vi + (dx < 0 ? 1 : -1)); x0 = null; });
  }

  // ---------- Calculadora ----------
  $$(".calc").forEach(function (c) {
    var r = $("input", c), o = $("output", c), t = $("p b", c), pm = +c.dataset.pm2;
    var f = function () { o.textContent = m2(+r.value); t.textContent = fmt(+r.value * pm); };
    r.addEventListener("input", f); f();
  });

  // ---------- Compartir ----------
  var sh = $("#compartir");
  if (sh) sh.addEventListener("click", function () {
    var d = { title: document.title, url: location.href };
    if (navigator.share && !demo) navigator.share(d).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(demo ? "(enlace de la ficha)" : location.href).then(function () { var o = sh.innerHTML; sh.textContent = "Enlace copiado"; setTimeout(function () { sh.innerHTML = o; }, 1800); });
  });

  // ---------- Formularios → CRM + WhatsApp ----------
  $$(".form-lead").forEach(function (f) {
    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var est = $(".form-estado", f), boton = $("button[type=submit]", f);
      var datos = {}; new FormData(f).forEach(function (v, k) { datos[k] = String(v).trim(); });
      var mal = false;
      ["nombre", "telefono"].forEach(function (k) {
        var i = f.elements[k]; var bad = !datos[k] || (k === "telefono" && datos[k].replace(/\D/g, "").length < 10);
        i.classList.toggle("err", bad); if (bad) mal = true;
      });
      if (mal) { est.className = "form-estado mal"; est.textContent = "Escribe tu nombre y un teléfono de 10 dígitos."; return; }
      datos.origen = f.dataset.origen || "Sitio web";
      if (f.dataset.bodega) datos.bodega = f.dataset.bodega;
      boton.disabled = true; est.className = "form-estado"; est.textContent = "Enviando…";
      var txt = f.dataset.bodega
        ? "Hola, soy " + datos.nombre + (datos.empresa ? " de " + datos.empresa : "") + ". Quiero agendar una visita a " + f.dataset.nombreBodega + " (" + f.dataset.folio + ")."
        : "Hola, soy " + datos.nombre + (datos.empresa ? " de " + datos.empresa : "") + ". Busco una bodega" + (datos.m2 ? " de " + datos.m2 + " m²" : "") + (datos.zona ? " en " + datos.zona : "") + "." + (datos.mensaje ? " " + datos.mensaje : "");
      var w = !demo ? window.open("", "_blank") : null;
      pedir("/api/lead", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(datos) })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || "Error"); return j; }); })
        .then(function () {
          est.className = "form-estado ok"; est.textContent = "¡Listo! Recibimos tus datos. Te abrimos WhatsApp para confirmar.";
          f.reset();
          var u = "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(txt);
          if (w) w.location = u; else if (!demo) location.href = u; else demo.aviso("En el sitio real aquí se abre WhatsApp con el mensaje listo. El prospecto ya quedó guardado en el panel.");
        })
        .catch(function (e) { if (w) w.close(); est.className = "form-estado mal"; est.textContent = e.message || "No se pudo enviar. Escríbenos por WhatsApp."; })
        .then(function () { boton.disabled = false; });
    });
  });

  // Aparición suave
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var els = $$(".card,.pasos li,.titulo-sec,.asesora>*,.zona");
    var io2 = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("si"); io2.unobserve(x.target); } }); }, { rootMargin: "0px 0px -40px" });
    els.forEach(function (el) { el.classList.add("aparece"); io2.observe(el); });
  }
})();
