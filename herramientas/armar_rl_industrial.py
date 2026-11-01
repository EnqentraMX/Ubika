# Arma el espacio de RL Industrial: portada (public/rl-industrial/index.html) y una ficha por inmueble
# (public/rl-industrial/<inmueble>/index.html). Lee especiales/rl-industrial/datos.json.
# El diseño vive en public/rl-industrial/assets/rl.css y la lógica en assets/rl.js.
#
# Uso: python3 herramientas/armar_rl_industrial.py   (necesita Pillow para las imágenes de vista previa)
import html, json, pathlib, urllib.parse

RAIZ = pathlib.Path(__file__).resolve().parent.parent
DATOS = json.loads((RAIZ / "especiales/rl-industrial/datos.json").read_text(encoding="utf-8"))
SALIDA = RAIZ / "public/rl-industrial"
BASE_URL = "https://ubika.demomx.workers.dev/rl-industrial/"
P = DATOS["propiedades"]
VERSION = "3"


def e(t):
    return html.escape(str(t), quote=True)


def fmt(n):
    return "$" + f"{round(n):,}"


def m2(n):
    return f"{n:,} m²"


def precio(p):
    if p.get("pm2"):
        return fmt(p["pm2"]), "por m² al mes", f"desde {fmt(p['pm2'] * p['min'])} al mes"
    if p.get("renta"):
        return fmt(p["renta"]), "al mes", f"≈ {fmt(p['renta'] / p['min'])} por m²"
    return "Consultar", ("en venta" if p["operacion"] == "venta" else ""), "Precio por WhatsApp"


def wa(texto):
    return f"https://wa.me/{DATOS['whatsapp']}?text={urllib.parse.quote(texto)}"


def foto(f, w=1280, base=""):
    if f.startswith("@"):
        return DATOS["remoto"] + f[1:]
    return f"{base}img/{f}-{w}.webp"


def imagen(f, alt, base, sizes="100vw", eager=False, slug=""):
    a = f
    ss = "" if a.startswith("@") else f' srcset="{foto(a, 640, base)} 640w, {foto(a, 1280, base)} 1280w" sizes="{sizes}"'
    carga = 'fetchpriority="high"' if eager else 'loading="lazy" decoding="async"'
    return f'<img src="{e(foto(a, 1280, base))}"{ss} alt="{e(alt)}" {carga} data-slug="{slug}" onerror="RLfoto(this)">'


def og_imagen(p):
    """Genera una imagen JPG 1200x630 para la vista previa en WhatsApp/Facebook."""
    locales = [f for f, _ in p["fotos"] if not f.startswith("@")]
    if not locales:
        return BASE_URL + "img/marca/logo-rl.jpg"
    try:
        from PIL import Image
    except ImportError:
        return BASE_URL + foto(locales[0])
    origen = SALIDA / f"img/{locales[0]}-1280.webp"
    destino = SALIDA / f"img/og/{p['slug']}.jpg"
    destino.parent.mkdir(parents=True, exist_ok=True)
    im = Image.open(origen).convert("RGB")
    r = 1200 / 630
    if im.width / im.height > r:
        nw = int(im.height * r); x = (im.width - nw) // 2; im = im.crop((x, 0, x + nw, im.height))
    else:
        nh = int(im.width / r); y = (im.height - nh) // 2; im = im.crop((0, y, im.width, y + nh))
    im.resize((1200, 630), Image.LANCZOS).save(destino, "JPEG", quality=82, optimize=True)
    return BASE_URL + f"img/og/{p['slug']}.jpg"


LOGO = """<svg viewBox="0 0 134 106" aria-hidden="true">
<path d="M31 42 76 8l54 40" fill="none" stroke="#C3CBD2" stroke-width="6"/>
<path d="M31 41v55M20 54v42M20 54h11M9 66v30M9 66h11" fill="none" stroke="#C3CBD2" stroke-width="4"/>
<text x="36" y="94" font-family="Archivo,Arial Black,sans-serif" font-weight="900" font-size="62" fill="#F2F4F5">R</text>
<text x="80" y="94" font-family="Archivo,Arial Black,sans-serif" font-weight="900" font-size="62" fill="#8CC63F">L</text>
<path d="M3 103Q67 92 131 103" fill="none" stroke="#8CC63F" stroke-width="3.5"/></svg>"""

WA_IC = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.3-.5.1-1 .1-3.2-.8-2.7-1.1-4.4-3.9-4.5-4.1-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.3c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.2 1.4 2.5 1.5.3.1.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.4.1.1.1.7-.1 1.3z"/></svg>'

ICONOS = {
    "area": '<path d="M3 3h6M3 3v6M21 3h-6M21 3v6M3 21h6M3 21v-6M21 21h-6M21 21v-6"/><rect x="7" y="7" width="10" height="10"/>',
    "altura": '<path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4"/>',
    "anden": '<path d="M3 21V9l9-6 9 6v12"/><path d="M7 21v-8h10v8M7 16h10"/>',
    "trailer": '<path d="M2 6h12v10H2zM14 9h4l3 3.5V16h-7"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    "oficina": '<rect x="4" y="3" width="16" height="18"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3"/>',
    "precio": '<path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    "check": '<path d="M4 12.5 9.5 18 20 6"/>',
    "pin": '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    "mapa": '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    "nav": '<path d="M3 11 21 3l-8 18-2-8z"/>',
    "tel": '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
    "compartir": '<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v7h14v-7"/>',
    "atras": '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    "foto": '<rect x="3" y="5" width="18" height="15" rx="2"/><circle cx="9" cy="11" r="2"/><path d="m21 17-5-5-9 8"/>',
    "x": '<path d="M6 6l12 12M18 6 6 18"/>', "izq": '<path d="M15 5l-7 7 7 7"/>', "der": '<path d="M9 5l7 7-7 7"/>',
    "nave": '<path d="M3 21V10l9-6 9 6v11"/><path d="M3 21h18M8 21v-6h8v6"/>',
    "ley": '<path d="M12 3v18M6 21h12M4 8h16M4 8l-2.5 7h5zM20 8l-2.5 7h5z"/>',
    "gestion": '<rect x="3" y="7" width="18" height="14"/><path d="M3 12h18M9 7v14M15 7v14M7 3h10"/>',
}


def ic(n, w=None):
    tam = f' width="{w}" height="{w}"' if w else ""
    return f'<svg viewBox="0 0 24 24"{tam} fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONOS[n]}</svg>'


def cabeza(titulo, desc, url, imagen):
    return f"""<!doctype html>
<html lang="es-MX">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{e(titulo)}</title>
<meta name="description" content="{e(desc)}">
<meta name="theme-color" content="#0A0E12">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_MX">
<meta property="og:site_name" content="RL Industrial">
<meta property="og:title" content="{e(titulo)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{e(url)}">
<meta property="og:image" content="{e(imagen)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="{e(url)}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%230A0E12'/%3E%3Cpath d='M5 13 17 4l11 8' fill='none' stroke='%23C3CBD2' stroke-width='2.5'/%3E%3Ctext x='7' y='27' font-family='Arial Black,sans-serif' font-weight='900' font-size='15' fill='%23F2F4F5'%3ER%3C/text%3E%3Ctext x='18' y='27' font-family='Arial Black,sans-serif' font-weight='900' font-size='15' fill='%238CC63F'%3EL%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
"""


def encabezado(base):
    inicio = base or "./"
    return f"""<header class="top">
  <div class="wrap">
    <a class="logo" href="{inicio}" aria-label="RL Industrial, inicio">{LOGO}<span class="lt"><b><i>RL</i> INDUSTRIAL</b><small>BIENES RAÍCES</small></span></a>
    <nav aria-label="Secciones">
      <a href="{inicio}#bodegas">Bodegas</a><a href="{inicio}#mapa-sec">Mapa</a><a href="{inicio}#calculadora">Calculadora</a><a href="{inicio}#nosotros">Nosotros</a><a href="{inicio}#contacto">Contacto</a>
    </nav>
    <div class="tel"><a class="btn btn-lima btn-sm" href="{wa('Hola RL Industrial, busco un espacio industrial. ¿Me pueden ayudar?')}" target="_blank" rel="noopener">{WA_IC}<span>{DATOS['telefono']}</span></a></div>
  </div>
</header>
"""


def pie(base):
    inicio = base or "./"
    return f"""<footer class="pie">
  <div class="wrap">
    <div class="cols">
      <div class="col"><a class="logo" href="{inicio}">{LOGO}<span class="lt"><b><i>RL</i> INDUSTRIAL</b><small>BIENES RAÍCES</small></span></a><span style="margin-top:10px">{DATOS['frase']}.</span></div>
      <div class="col"><b>Contacto</b><a href="tel:+52{DATOS['telefono'].replace(' ', '')}">{DATOS['telefono']}</a><a href="{wa('Hola RL Industrial')}" target="_blank" rel="noopener">WhatsApp</a><span>{DATOS['asesora']}</span></div>
      <div class="col"><b>Oficina</b><span>{DATOS['oficina']['texto']}</span></div>
      <div class="col"><b>Servicios</b><span>Bienes raíces industriales</span><span>Abogacía civil</span><span>Gestión industrial</span></div>
    </div>
    <div class="ubika">© 2026 RL Industrial. Página hecha con <a href="{base}../">Ubika</a>. ¿Eres asesor inmobiliario? Ten la tuya.</div>
  </div>
</footer>
<a class="fab" href="{wa('Hola RL Industrial, busco un espacio industrial. ¿Me pueden ayudar?')}" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">{WA_IC}</a>
<div class="lista-v" id="listaV" aria-live="polite"><span id="listaTxt"></span><a class="btn btn-wa btn-sm" id="listaBtn" href="#" target="_blank" rel="noopener">{WA_IC} Agendar visitas</a></div>
"""


def datos_js(base, slug=None):
    js = json.dumps(DATOS, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    extra = f'window.RL_SLUG="{slug}";' if slug else ""
    return f'<script>window.RL={js};window.RL_BASE="{base}";{extra}</script>\n<script src="{base}assets/rl.js?v={VERSION}" defer></script>\n'


def total_m2():
    t = 0
    for p in P:
        if p.get("lote"):
            continue
        t += sum(p["sizes"]) if p.get("sizes") else p["max"]
    return t


# ---------------- Portada ----------------
def portada():
    base = ""
    hero = [("xhala-park", 0), ("naucalpan-1050", 0), ("iztapalapa-550", 0), ("aztahuacan-800", 0)]
    fotos_hero = []
    for i, (s, k) in enumerate(hero):
        p = next(x for x in P if x["slug"] == s)
        f, alt = p["fotos"][k]
        pr = precio(p)
        det = f"{p['zona']} · {p['superficie']}"
        fotos_hero.append(
            f'<img src="{foto(f, 1280)}" srcset="{foto(f, 640)} 640w, {foto(f, 1280)} 1280w" sizes="100vw" alt="{e(alt)}"'
            f'{" class=\"on\" fetchpriority=\"high\"" if i == 0 else " loading=\"lazy\""} data-href="{s}/" data-nombre="{e(p["nombre"])}" data-det="{e(det)}">')
    p0 = next(x for x in P if x["slug"] == hero[0][0])
    zonas = len({p["zona"] for p in P if p.get("lat")})
    cinta = "".join(f"<span>{t}</span>" for t in ["Acceso de tráiler", "Andenes", "Parques industriales", "De 150 a 13,000 m²", "Asesoría legal en tu contrato", "CDMX y Estado de México", "Naves con 12 m de altura"])
    out = cabeza("RL Industrial · Bodegas y naves industriales en renta",
                 "Bodegas, naves y locales en renta en CDMX y Estado de México, de 150 a 13,000 m². Filtra por zona, ve la ubicación y pide informes por WhatsApp.",
                 BASE_URL, BASE_URL + "img/marca/logo-rl.jpg")
    out += f'<link rel="stylesheet" href="assets/rl.css?v={VERSION}">\n<link rel="preload" as="image" href="{foto(p0["fotos"][0][0], 1280)}">\n</head>\n<body data-page="inicio">\n'
    out += encabezado(base)
    out += f"""<main>
<section class="hero" id="inicio">
  <div class="hero-fotos">{''.join(fotos_hero)}</div>
  <div class="cortina" aria-hidden="true"></div>
  <div class="wrap hero-in">
    <span class="ceja" style="color:var(--acero)">{DATOS['frase']}</span>
    <h1 class="rotulo"><span class="l"><span>Naves y</span></span> <span class="l"><span>bodegas <span class="lima">industriales</span></span></span> <span class="l"><span>en renta</span></span></h1>
    <p class="bajada">De <b>150 a 13,000 m²</b> en el norte y oriente del Valle de México. Con acceso de tráiler, andenes y asesoría legal en tu contrato.</p>
    <form class="buscador" id="buscador" role="search" aria-label="Buscar bodega">
      <div class="campo"><label for="bZona">Zona</label><select id="bZona"></select></div>
      <div class="campo"><label for="bTam">Superficie</label><select id="bTam"></select></div>
      <label class="toggle" for="bTrailer"><input type="checkbox" id="bTrailer"> Entra tráiler</label>
      <button class="btn btn-lima" type="submit">Buscar bodega</button>
    </form>
    <div class="hero-pie">
      <div class="cifras">
        <div class="cifra"><b class="num" data-n="{len(P)}">{len(P)}</b><span>inmuebles disponibles</span></div>
        <div class="cifra"><b class="num" data-n="{total_m2()}">{total_m2():,}</b><span>m² en catálogo</span></div>
        <div class="cifra"><b class="num" data-n="{zonas}">{zonas}</b><span>zonas de CDMX y Edomex</span></div>
      </div>
      <a class="foto-de" href="{hero[0][0]}/"><span class="pts">{''.join('<i class="on"></i>' if i == 0 else '<i></i>' for i in range(len(hero)))}</span><span><b>{e(p0['nombre'])}</b> · <em style="font-style:normal">{e(p0['zona'] + ' · ' + p0['superficie'])}</em></span></a>
    </div>
  </div>
</section>
<div class="cinta" aria-hidden="true"><div>{cinta}{cinta}</div></div>

<section class="banda sec" id="destacadas">
  <div class="wrap">
    <div class="riel-cab">
      <div class="sec-h"><span class="ceja">Lo más buscado</span><h2 class="rotulo">Bodegas <span class="lima">destacadas</span></h2></div>
      <div class="flechas"><button type="button" data-dir="-1" aria-label="Anteriores">{ic('izq')}</button><button type="button" data-dir="1" aria-label="Siguientes">{ic('der')}</button></div>
    </div>
    <div class="riel" id="riel"></div>
  </div>
</section>

<section class="banda claro sec" id="bodegas">
  <div class="wrap">
    <div class="sec-h"><span class="ceja">Catálogo completo</span><h2 class="rotulo">Encuentra tu <span class="lima">espacio</span></h2>
      <p>Filtra por zona y tamaño. Marca con + las que te interesan y agenda todas tus visitas en un solo mensaje.</p></div>
    <div class="filtros">
      <div class="fila" id="fZona" role="group" aria-label="Zona"></div>
      <div class="fila" id="fTam" role="group" aria-label="Superficie"></div>
      <div class="meta">
        <label class="toggle" for="fTrailer"><input type="checkbox" id="fTrailer"> Solo con acceso de tráiler</label>
        <div class="orden"><span class="cuenta" id="cuenta"></span>
          <div class="campo"><select id="fOrden" aria-label="Ordenar"><option value="rec">Recomendadas</option><option value="m2">Menor precio por m²</option><option value="chica">Superficie: menor a mayor</option><option value="grande">Superficie: mayor a menor</option></select></div>
        </div>
      </div>
    </div>
    <div class="rejilla" id="rejilla"></div>
  </div>
</section>

<section class="banda grafito-0 sec" id="mapa-sec">
  <div class="wrap">
    <div class="sec-h"><span class="ceja">Ubicaciones</span><h2 class="rotulo">Míralas en el <span class="lima">mapa</span></h2>
      <p>Toca una bodega para ver dónde está y abrir la ruta en Google Maps o Waze.</p></div>
    <div class="mapa-caja"><div class="mapa-lista" id="mapaLista"></div><div id="mapa" role="region" aria-label="Mapa de bodegas"></div></div>
    <p class="nota-mapa">{ic('pin')} Ubicaciones aproximadas por colonia o municipio. La dirección exacta se comparte al agendar la visita.</p>
  </div>
</section>

<section class="banda claro sec" id="calculadora">
  <div class="wrap">
    <div class="sec-h"><span class="ceja">Herramienta</span><h2 class="rotulo">¿Cuánto pagarías de <span class="lima">renta</span>?</h2>
      <p>Elige una bodega, ajusta los metros y el plazo, y ve cuánto sale al mes con el precio publicado.</p></div>
    <div class="calc">
      <div class="calc-in">
        <div class="campo"><label for="cProp">Inmueble</label><select id="cProp"></select></div>
        <div class="campo"><label for="cM2">Metros cuadrados</label><input type="range" id="cM2"><div class="rango"><span id="cMin"></span><b id="cVal"></b><span id="cMax"></span></div></div>
        <div class="campo"><span class="lb">Plazo del contrato</span><div class="plazos"><button class="pill" type="button" data-meses="12" aria-pressed="false">12 meses</button><button class="pill" type="button" data-meses="24" aria-pressed="false">24 meses</button><button class="pill" type="button" data-meses="36" aria-pressed="true">36 meses</button></div></div>
      </div>
      <div class="calc-out" aria-live="polite">
        <span class="ceja">Renta mensual estimada</span>
        <div class="grande num" id="cTot"></div>
        <div class="lineas"><div><span>Precio por m²</span><span id="cPm2"></span></div><div><span>Al año</span><span id="cAnual"></span></div><div><span>Total del contrato</span><span id="cContrato"></span></div></div>
        <p>Cálculo con el precio publicado. El precio final se negocia directamente con RL Industrial.</p>
        <a class="btn btn-lima" id="cAsk" href="#" target="_blank" rel="noopener" style="justify-self:start">{WA_IC} Pedir esta cotización</a>
      </div>
    </div>
  </div>
</section>

<section class="banda sec" id="nosotros">
  <div class="wrap">
    <div class="nos">
      <div class="marca"><img src="img/marca/logo-rl.jpg" alt="Logotipo de RL Industrial Bienes Raíces" loading="lazy" width="1080" height="1080"></div>
      <div>
        <div class="sec-h" style="margin-bottom:24px"><span class="ceja">Quiénes somos</span><h2 class="rotulo">Tu aliado <span class="lima">inmobiliario</span> industrial</h2>
          <p>Compra, venta y renta de naves, bodegas, terrenos y locales, con abogados en casa para que el contrato quede en regla.</p></div>
        <div class="servs">
          <div class="serv">{ic('nave')}<div><h3 class="rotulo">Bienes raíces</h3><p>Renta y venta de inmuebles industriales, comerciales y residenciales con visión de inversión.</p></div></div>
          <div class="serv">{ic('ley')}<div><h3 class="rotulo">Abogacía civil</h3><p>Contratos de arrendamiento y compraventa, litigios civiles y regularización de propiedades.</p></div></div>
          <div class="serv">{ic('gestion')}<div><h3 class="rotulo">Gestión industrial</h3><p>Especialistas en terrenos y naves: te ayudamos a elegir por acceso, altura, andenes y operación.</p></div></div>
        </div>
      </div>
    </div>
    <div class="pasos">
      <div class="paso"><span class="n">1</span><h3 class="rotulo">Cuéntanos qué buscas</h3><p>Metros, zona, giro y si entra tráiler o torton.</p></div>
      <div class="paso"><span class="n">2</span><h3 class="rotulo">Visita las opciones</h3><p>Agendamos recorridos a las bodegas que sí cumplen.</p></div>
      <div class="paso"><span class="n">3</span><h3 class="rotulo">Contrato revisado</h3><p>Nuestro equipo legal revisa contrato y requisitos.</p></div>
      <div class="paso"><span class="n">4</span><h3 class="rotulo">Empieza a operar</h3><p>Recibes llaves e inventario de tu bodega.</p></div>
    </div>
  </div>
</section>

<section class="banda grafito-0 sec" id="contacto">
  <div class="wrap contacto">
    <div class="asesora">
      <span class="lema">{DATOS['lema']}</span>
      <img src="img/equipo/rosy-luna-640.webp" alt="{DATOS['asesora']}" loading="lazy">
      <div class="tag"><b>{DATOS['asesora']}</b><span>{DATOS['frase']}</span></div>
    </div>
    <div class="form-box">
      <span class="ceja">¿No viste la indicada?</span>
      <h2 class="rotulo">Te buscamos <span class="lima">la bodega</span></h2>
      <p style="margin:0;color:var(--mut)">Dinos qué necesitas y te mandamos opciones que sí cumplen, directo a tu WhatsApp.</p>
      <form id="busqueda">
        <div class="campo"><label for="rEmp">Empresa o nombre</label><input id="rEmp" autocomplete="organization" placeholder="Logística del Norte"></div>
        <div class="campo"><label for="rGiro">Giro</label><input id="rGiro" placeholder="Almacén de abarrotes"></div>
        <div class="campo"><label for="rTam">Superficie</label><select id="rTam"></select></div>
        <div class="campo"><label for="rZona">Zona</label><select id="rZona"></select></div>
        <div class="campo full"><label for="rAcc">Acceso que necesitas</label><select id="rAcc"><option>Tráiler</option><option>Torton</option><option>Camioneta</option></select></div>
        <button class="btn btn-wa full" type="submit">{WA_IC} Enviar por WhatsApp</button>
      </form>
      <div class="datos-c">
        <div><span>Teléfono</span><b>{DATOS['telefono']}</b><button class="copiar" type="button" data-copiar="{DATOS['telefono']}">Copiar número</button></div>
        <div><span>Oficina</span><b style="font-family:var(--body);font-size:16px">{DATOS['oficina']['texto']}</b></div>
      </div>
    </div>
  </div>
</section>

<section class="banda claro sec">
  <div class="wrap">
    <div class="sec-h"><span class="ceja">Dudas comunes</span><h2 class="rotulo">Preguntas <span class="lima">frecuentes</span></h2></div>
    <div class="faq">
      <details><summary>¿Los precios son negociables?</summary><p>Sí. Varias bodegas se publican con precio negociable; se ajusta según plazo, superficie y garantías.</p></details>
      <details><summary>¿El precio es por m² o total?</summary><p>Cada ficha lo indica. En parques y conjuntos industriales se cotiza por m² al mes; en bodegas individuales se publica la renta mensual total.</p></details>
      <details><summary>¿Qué piden para rentar?</summary><p>Normalmente identificación, comprobante de domicilio, acta constitutiva si eres empresa y una garantía (aval o póliza jurídica). Te decimos los requisitos exactos de cada inmueble.</p></details>
      <details><summary>¿Por qué la ubicación es aproximada?</summary><p>Mostramos la colonia o el municipio para cuidar la seguridad de los inmuebles. La dirección exacta se comparte al agendar la visita.</p></details>
      <details><summary>Tengo una bodega, ¿la pueden rentar?</summary><p>Sí. Comercializamos naves, bodegas y terrenos de propietarios. Escríbenos con la ubicación y los metros.</p></details>
    </div>
  </div>
</section>
</main>
"""
    out += pie(base) + datos_js(base) + "</body>\n</html>\n"
    (SALIDA / "index.html").write_text(out, encoding="utf-8")


# ---------------- Ficha ----------------
def ficha(p):
    base = "../"
    url = BASE_URL + p["slug"] + "/"
    pr, unidad, eq = precio(p)
    titulo = f"{p['nombre']} · {p['tipo']} de {p['superficie']} en {p['zona']} | RL Industrial"
    desc = f"{p['tipo']} en {p['operacion']}, {p['superficie']} en {p['zona']}. {pr} {unidad}. " + ", ".join(p["destacados"]) + "."
    out = cabeza(titulo, desc, url, og_imagen(p))
    out += f'<link rel="stylesheet" href="../assets/rl.css?v={VERSION}">\n</head>\n<body data-page="ficha" class="ficha-pg">\n'
    out += encabezado(base)
    n = len(p["fotos"])
    if n:
        botones = []
        for i, (f, alt) in enumerate(p["fotos"][:3]):
            extra = f'<span class="chip todas">{ic("foto", 13)} Ver las {n} fotos</span>' if i == 0 and n > 1 else ""
            botones.append(f'<button type="button" data-foto="{i}" aria-label="Ver foto: {e(alt)}">{imagen(f, alt, base, "(max-width:700px) 100vw, 66vw" if i == 0 else "33vw", i == 0, p["slug"])}{extra}</button>')
        clase = "galeria" + (" g1" if n == 1 else " g2" if n == 2 else "")
        galeria = f'<div class="{clase}">{"".join(botones)}</div>'
    else:
        galeria = '<div class="galeria g1"><div class="plano-caja" id="plano" style="border-radius:0;padding:0"></div></div>'

    datos = [("area", p["superficie"], "Superficie"), ("precio", pr, unidad.capitalize() if unidad else "Precio")]
    if p.get("altura"): datos.append(("altura", f"{p['altura']} m", "Altura libre"))
    if p.get("andenes"): datos.append(("anden", str(p["andenes"]), "Andenes" if p["andenes"] > 1 else "Andén"))
    if p.get("trailer") is True: datos.append(("trailer", "Sí", "Acceso de tráiler"))
    elif p.get("torton"): datos.append(("trailer", "Torton", "Acceso (no tráiler)"))
    if p.get("oficinas"): datos.append(("oficina", "Sí", "Oficinas"))
    datos.append(("nave", p["tipo"], "En " + p["operacion"]))
    datos_html = "".join(f'<div class="dato">{ic(i)}<b>{e(v)}</b><span>{e(l)}</span></div>' for i, v, l in datos)
    carac = "".join(f"<li>{ic('check')}<span>{e(c)}</span></li>" for c in p["caracteristicas"])
    msg = f"Hola RL Industrial, me interesa {p['folio']} · {p['nombre']} ({p['zona']}, {p['superficie']}). ¿Sigue disponible? Quisiera más información y agendar una visita.\n{url}"
    tel = "tel:+52" + DATOS["telefono"].replace(" ", "")
    gm = "https://www.google.com/maps/search/?api=1&query=" + urllib.parse.quote(p.get("lugar") or p["zona"])
    ubic = ""
    if p.get("lat"):
        wz = f"https://waze.com/ul?ll={p['lat']},{p['lng']}&navigate=yes"
        nivel = "la colonia" if p.get("precision") == "colonia" else "el municipio o alcaldía"
        ubic = f"""<section><h2 class="rotulo">Ubicación</h2><div class="ubic">
          <div class="zona-l">{ic('pin')}{e(p['lugar'])}</div>
          <div class="mini-mapa" id="miniMapa" role="region" aria-label="Mapa de ubicación aproximada"></div>
          <div class="bts"><a class="btn btn-lima btn-sm" href="{gm}" target="_blank" rel="noopener">{ic('mapa')} Abrir en Google Maps</a><a class="btn btn-borde btn-sm" href="{wz}" target="_blank" rel="noopener">{ic('nav')} Ir con Waze</a></div>
          <p class="nota-mapa" style="margin:0">{ic('pin')} El círculo marca {nivel}. La dirección exacta se comparte al agendar la visita.</p>
        </div></section>"""
    else:
        ubic = f"""<section><h2 class="rotulo">Ubicación</h2><p style="color:var(--gris);margin:0">Ubicación a confirmar. Pregúntanos por WhatsApp y te compartimos los detalles.</p></section>"""
    plano_sec = f'<section><h2 class="rotulo">Plano aproximado</h2><div class="plano-caja" id="plano"></div></section>' if n else ""
    calc = ""
    if p.get("pm2"):
        calc = f"""<div class="calc-mini"><span class="ceja">Calcula tu renta</span><input type="range" id="cmM2" aria-label="Metros cuadrados"><div class="rango"><span>{m2(p['min'])}</span><b id="cmVal"></b><span>{m2(p['max'])}</span></div><div class="r num" id="cmTot"></div></div>"""
    destacados = "".join(f'<span class="chip lima">{e(d)}</span>' for d in p["destacados"])
    out += f"""<main>
<div class="wrap">
  <nav class="migas" aria-label="Ruta"><a href="../#bodegas">{ic('atras')} Todas las bodegas</a><span>/</span><span>{e(p['folio'])}</span></nav>
  {galeria}
  <div class="ficha">
    <div>
      <div class="zona-l">{ic('pin')}{e(p['zona'])}{' · ' + e(p['entidad']) if p['entidad'] else ''} · {e(p['tipo'])}</div>
      <h1 class="rotulo">{e(p['nombre'])}</h1>
      <p class="lead">{e(p['descripcion'])}</p>
      <div class="fila" style="margin-top:18px">{destacados}</div>
      <section><h2 class="rotulo">Datos clave</h2><div class="datos">{datos_html}</div></section>
      <section><h2 class="rotulo">Características</h2><ul class="lista-c">{carac}</ul></section>
      {ubic}
      {plano_sec}
    </div>
    <aside class="lateral">
      <div class="caja-precio">
        <span class="ceja">{e(p['folio'])} · {'Venta' if p['operacion'] == 'venta' else 'Renta'}</span>
        <div class="p">{pr}<small>{e(unidad)}{' · ' + e(eq) if p.get('pm2') or p.get('renta') else ''}</small></div>
        <div class="bts">
          <a class="btn btn-wa" href="{wa(msg)}" target="_blank" rel="noopener">{WA_IC} Pedir informes</a>
          <a class="btn btn-borde" href="{tel}">{ic('tel')} Llamar · {DATOS['telefono']}</a>
          <button class="btn btn-borde" type="button" id="compartir">{ic('compartir')} Compartir esta bodega</button>
        </div>
        <div class="mini-asesora"><img src="../img/equipo/rosy-luna-640.webp" alt="" loading="lazy"><div><b>{DATOS['asesora']}</b><span>Te atiende directamente</span></div></div>
      </div>
      {calc}
    </aside>
  </div>
</div>
<section class="banda claro relacionadas">
  <div class="wrap">
    <div class="sec-h"><span class="ceja">Sigue viendo</span><h2 class="rotulo">Otras <span class="lima">bodegas</span></h2></div>
    <div class="rejilla" id="otras"></div>
  </div>
</section>
</main>
<div class="barra-m"><div class="p">{pr}<small>{e(unidad)}</small></div><a class="btn btn-wa btn-sm" href="{wa(msg)}" target="_blank" rel="noopener">{WA_IC} Pedir informes</a></div>
<div class="visor" id="visor" hidden role="dialog" aria-modal="true" aria-label="Fotos de {e(p['nombre'])}">
  <div class="vt"><span id="vNum"></span><button class="cerrar" type="button" id="vX" aria-label="Cerrar">{ic('x')}</button></div>
  <div class="vc"><img id="vImg" alt=""><button class="nav prev" type="button" id="vPrev" aria-label="Foto anterior">{ic('izq')}</button><button class="nav next" type="button" id="vNext" aria-label="Foto siguiente">{ic('der')}</button></div>
  <div class="cap" id="vCap"></div>
</div>
"""
    out += pie(base) + datos_js(base, p["slug"]) + "</body>\n</html>\n"
    d = SALIDA / p["slug"]
    d.mkdir(parents=True, exist_ok=True)
    (d / "index.html").write_text(out, encoding="utf-8")


if __name__ == "__main__":
    portada()
    for p in P:
        ficha(p)
    print(f"Listo: portada y {len(P)} fichas en {SALIDA.relative_to(RAIZ)}")
