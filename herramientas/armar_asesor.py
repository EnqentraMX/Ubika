# Arma la página de un asesor y la ficha de cada una de sus propiedades.
# Lee asesores/<asesor>.json y escribe en public/<asesor>/.
# También genera el código QR de cada página en qr/<asesor>/ para imprimir en lonas y tarjetas.
#
# Uso: python3 herramientas/armar_asesor.py grupo-premier
import html, json, pathlib, sys, urllib.parse
import qrcode

RAIZ = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://demomx.pages.dev"
FUENTES = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
           '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
           '<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900'
           '&family=Hanken+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">')
FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' "
           "fill='%23FFD21F'/%3E%3Cpath d='M8 15l8-7 8 7v9H8z' fill='none' stroke='%2318211C' stroke-width='3' stroke-linejoin='round'/%3E%3C/svg%3E")


def e(t):
    return html.escape(str(t), quote=True)


def icono(trazos, relleno=False):
    attr = ('fill="currentColor"' if relleno else
            'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"')
    return f'<svg viewBox="0 0 24 24" {attr} aria-hidden="true">{trazos}</svg>'


I_WA = icono('<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.3-.5.1-1 .1-3.2-.8-2.7-1.1-4.4-3.9-4.5-4.1-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.3c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.2 1.4 2.5 1.5.3.1.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.4.1.1.1.7-.1 1.3z"/>', True)
I_FB = icono('<path d="M14 8.5V7c0-.8.5-1 1-1h2V2.5h-3c-3 0-4 2-4 4.3v1.7H7.5V12H10v9.5h4V12h2.7l.4-3.5H14z"/>', True)
I_PIN = icono('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>')
I_CHECK = icono('<path d="M4 12.5 9.5 18 20 6"/>')
I_ATRAS = icono('<path d="M15 5l-7 7 7 7"/>')
I_DOC = icono('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13l2 2 4-4"/>')
I_COMPARTIR = icono('<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v7h14v-7"/>')
I_MAPA = icono('<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>')


def precio(p):
    cifra = f"${p['precio']:,.0f}"
    return cifra, {"renta": "al mes"}.get(p["operacion"], "")


def titulo(p):
    return f"{p['tipo']} de {p['superficie']}" if p.get("superficie") else p["tipo"]


def wa(numero, texto):
    return f"https://wa.me/{numero}?text={urllib.parse.quote(texto)}"


def cabeza(titulo_pagina, descripcion, url, imagen, profundidad):
    sube = "../" * profundidad
    return f"""<!doctype html>
<html lang="es-MX">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{e(titulo_pagina)}</title>
<meta name="description" content="{e(descripcion)}">
<meta name="theme-color" content="#2C4236">
<meta property="og:type" content="website">
<meta property="og:title" content="{e(titulo_pagina)}">
<meta property="og:description" content="{e(descripcion)}">
<meta property="og:url" content="{e(url)}">
<meta property="og:image" content="{e(imagen)}">
<link rel="icon" href="{FAVICON}">
{FUENTES}
<link rel="stylesheet" href="{sube}assets/ubika.css">
<link rel="stylesheet" href="{sube}assets/asesor.css">
</head>
<body>
"""


def pie(sube):
    return f"""<footer class="pie-asesor">
  <div class="contenedor">
    <span>Página hecha con <a href="{sube}">Ubika</a>. ¿Eres asesor inmobiliario? Ten la tuya.</span>
    <a class="logo" href="{sube}">Ubika</a>
  </div>
</footer>
"""


def pagina_asesor(a):
    url = f"{BASE}/{a['slug']}/"
    props = a["propiedades"]
    hay = {p["operacion"] for p in props}
    tarjetas = []
    for p in props:
        cifra, sufijo = precio(p)
        tarjetas.append(f"""
      <a class="tarjeta" href="{p['slug']}/" data-op="{p['operacion']}">
        <div class="foto"><img src="{p['slug']}/img/{p['fotos'][0]}" alt="{e(titulo(p))} en {e(p['colonia'])}" loading="lazy">
          <span class="etiqueta-op {p['operacion']}">En {p['operacion']}</span></div>
        <div class="cuerpo">
          <div class="precio">{cifra}{f' <small>{sufijo}</small>' if sufijo else ''}</div>
          <div class="tit">{e(titulo(p))}</div>
          <div class="lugar">{e(p['colonia'])}, {e(p['alcaldia'])}</div>
        </div>
      </a>""")
    filtros = ""
    if len(hay) > 1:
        botones = "".join(f'<button type="button" data-filtro="{op}" aria-pressed="false">{op.capitalize()}</button>'
                          for op in ("venta", "renta", "traspaso") if op in hay)
        filtros = ('<div class="chips-filtro" role="group" aria-label="Filtrar propiedades">'
                   '<button type="button" data-filtro="todas" aria-pressed="true">Todas</button>' + botones + '</div>')
    redes = ""
    if a["redes"].get("facebook"):
        redes += f'<a class="boton boton--borde" href="{e(a["redes"]["facebook"])}" target="_blank" rel="noopener">{I_FB} Facebook</a>'
    texto_wa = f"Hola {a['nombre']}, vi sus propiedades en Ubika y me interesa información."
    desc = f"{a['frase']} Propiedades en venta y renta en {a['zona']}."
    return cabeza(f"{a['nombre']} · Propiedades en {a['zona']}", desc, url, f"{url}{a['logo']}", 1) + f"""
<header class="cabecera">
  <div class="contenedor">
    <div class="marca-asesor"><img src="{a['logo']}" alt="Logo de {e(a['nombre'])}"></div>
    <div>
      <h1>{e(a['nombre'])}</h1>
      <p class="frase">{e(a['frase'])}</p>
      <span class="zona">{I_PIN} {e(a['zona'])}</span>
      <div class="acciones">
        <a class="boton boton--wa" href="{wa(a['whatsapp'], texto_wa)}" target="_blank" rel="noopener">{I_WA} Escribir por WhatsApp</a>
        {redes}
      </div>
    </div>
  </div>
</header>

<main class="inventario">
  <div class="contenedor">
    <div class="filtros">
      <h2>{len(props)} propiedades</h2>
      {filtros}
    </div>
    <div class="rejilla">{''.join(tarjetas)}
    </div>
  </div>
</main>
""" + pie("../") + """<script>
document.querySelectorAll("[data-filtro]").forEach(function(b){
  b.addEventListener("click", function(){
    var f = b.dataset.filtro;
    document.querySelectorAll("[data-filtro]").forEach(function(x){ x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    document.querySelectorAll(".tarjeta").forEach(function(t){ t.hidden = !(f === "todas" || t.dataset.op === f); });
  });
});
</script>
</body>
</html>
"""


def pagina_ficha(a, p):
    url = f"{BASE}/{a['slug']}/{p['slug']}/"
    cifra, sufijo = precio(p)
    nombre_prop = f"{titulo(p)} en {p['colonia']}"
    texto_wa = f"Hola {a['nombre']}, me interesa esta propiedad: {nombre_prop} ({p['operacion']}, {cifra}{' ' + sufijo if sufijo else ''}) que vi en Ubika. {url}"
    enlace_wa = wa(a["whatsapp"], texto_wa)
    q = urllib.parse.quote(p["mapa"])
    mapa_abrir = f"https://www.google.com/maps/search/?api=1&query={q}"
    mapa_embed = f"https://maps.google.com/maps?q={q}&z=15&output=embed"
    fotos = "".join(
        f'<img src="img/{f}" alt="{e(nombre_prop)}, foto {i + 1} de {len(p["fotos"])}"{" loading=\"lazy\"" if i else ""}>'
        for i, f in enumerate(p["fotos"]))
    minis = "".join(
        f'<button type="button" data-i="{i}" aria-label="Ver foto {i + 1}"{" aria-current=\"true\"" if i == 0 else ""}><img src="img/{f}" alt="" loading="lazy"></button>'
        for i, f in enumerate(p["fotos"]))
    lista = lambda xs: '<ul class="lista-check">' + "".join(f"<li>{I_CHECK}<span>{e(x)}</span></li>" for x in xs) + "</ul>"
    aviso = f'<div class="aviso">{I_DOC}<span>{e(p["aviso"])}</span></div>' if p.get("aviso") else ""
    requisitos = f'<div class="bloque"><h2>Requisitos</h2>{lista(p["requisitos"])}</div>' if p.get("requisitos") else ""
    desc = f"{titulo(p)} en {p['operacion']}: {cifra}{' ' + sufijo if sufijo else ''}. {p['colonia']}, {p['alcaldia']}. {p['referencia']}."
    return cabeza(f"{nombre_prop} · {a['nombre']}", desc, url, f"{url}img/{p['fotos'][0]}", 2) + f"""
<nav class="migas"><div class="contenedor"><a href="../">{I_ATRAS} Todas las propiedades de {e(a['nombre'])}</a></div></nav>

<main class="ficha">
  <div class="contenedor">
    <div class="rejilla-ficha">
      <div>
        <div class="galeria">
          <div class="carrete" tabindex="0" aria-label="Fotos de la propiedad, desliza para ver más">{fotos}</div>
          <span class="etiqueta-op {p['operacion']}">En {p['operacion']}</span>
          <span class="contador"><span class="js-n">1</span> de {len(p['fotos'])}</span>
        </div>
        <div class="miniaturas">{minis}</div>
      </div>

      <div class="resumen">
        <div class="tipo">{e(titulo(p))} en {p['operacion']}</div>
        <h1>{cifra}{f'<small>{sufijo}</small>' if sufijo else ''}</h1>
        <div class="lugar">{I_PIN}<div>{e(p['colonia'])}, {e(p['alcaldia'])}<span>{e(p['referencia'])}</span></div></div>
        {aviso}
        <ul class="destacados">{''.join(f'<li>{e(d)}</li>' for d in p['destacados'])}</ul>
        <div class="acciones">
          <a class="boton boton--wa" href="{enlace_wa}" target="_blank" rel="noopener">{I_WA} Preguntar por WhatsApp</a>
          <button class="boton boton--claro js-compartir" type="button">{I_COMPARTIR} Compartir esta propiedad</button>
        </div>
        <a class="asesor-mini" href="../"><img src="../{a['logo']}" alt=""><div><b>{e(a['nombre'])}</b><span>Ver sus {len(a['propiedades'])} propiedades</span></div></a>
      </div>
    </div>

    <div class="bloque"><h2>Ubicación</h2>{lista(p['ubicacion'])}</div>
    <div class="bloque">
      <div class="mapa">
        <iframe src="{mapa_embed}" title="Mapa de la zona de la propiedad" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        <a class="boton" href="{mapa_abrir}" target="_blank" rel="noopener">{I_MAPA} Abrir en Google Maps</a>
      </div>
    </div>
    <div class="bloque"><h2>Características</h2>{lista(p['caracteristicas'])}</div>
    {requisitos}
  </div>
</main>

<div class="barra-wa">
  <div class="precio">{cifra}<small>{e(titulo(p))} en {p['operacion']}{', ' + sufijo if sufijo else ''}</small></div>
  <a class="boton boton--wa" href="{enlace_wa}" target="_blank" rel="noopener">{I_WA} WhatsApp</a>
</div>
""" + pie("../../") + f"""<script>
(function(){{
  var c = document.querySelector(".carrete"), n = document.querySelector(".js-n"), minis = document.querySelectorAll(".miniaturas button");
  function actual(){{ return Math.round(c.scrollLeft / c.clientWidth); }}
  c.addEventListener("scroll", function(){{
    var i = actual(); n.textContent = i + 1;
    minis.forEach(function(m, k){{ m.setAttribute("aria-current", k === i ? "true" : "false"); }});
  }}, {{passive:true}});
  minis.forEach(function(m){{
    m.addEventListener("click", function(){{ c.scrollTo({{left: c.clientWidth * +m.dataset.i, behavior: "smooth"}}); }});
  }});
  var b = document.querySelector(".js-compartir");
  b.addEventListener("click", function(){{
    var datos = {{title: {json.dumps(nombre_prop, ensure_ascii=False)}, url: location.href}};
    if (navigator.share) {{ navigator.share(datos).catch(function(){{}}); return; }}
    navigator.clipboard.writeText(location.href).then(function(){{
      var t = b.innerHTML; b.textContent = "Enlace copiado"; setTimeout(function(){{ b.innerHTML = t; }}, 2000);
    }});
  }});
}})();
</script>
</body>
</html>
"""


def guardar_qr(url, destino):
    q = qrcode.QRCode(border=4, box_size=24, error_correction=qrcode.constants.ERROR_CORRECT_M)
    q.add_data(url)
    q.make(fit=True)
    q.make_image(fill_color="#18211C", back_color="white").save(destino)


def main(slug):
    a = json.loads((RAIZ / "asesores" / f"{slug}.json").read_text(encoding="utf-8"))
    sal = RAIZ / "public" / a["slug"]
    qr = RAIZ / "qr" / a["slug"]
    qr.mkdir(parents=True, exist_ok=True)
    (sal / "index.html").write_text(pagina_asesor(a), encoding="utf-8")
    guardar_qr(f"{BASE}/{a['slug']}/", qr / f"{a['slug']}.png")
    for p in a["propiedades"]:
        for f in p["fotos"]:
            assert (sal / p["slug"] / "img" / f).exists(), f"Falta la foto {p['slug']}/img/{f}"
        (sal / p["slug"] / "index.html").write_text(pagina_ficha(a, p), encoding="utf-8")
        guardar_qr(f"{BASE}/{a['slug']}/{p['slug']}/", qr / f"{p['slug']}.png")
    print(f"Listo: {a['nombre']} con {len(a['propiedades'])} propiedades -> public/{a['slug']}/ y qr/{a['slug']}/")


if __name__ == "__main__":
    main(sys.argv[1])
