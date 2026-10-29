# Arma public/index.html a partir de plantilla/inicio.html.
# Sustituye las marcas {{...}} por el código QR, las fachadas ilustradas y los íconos.
# Uso: python3 herramientas/armar_inicio.py
import pathlib, qrcode

RAIZ = pathlib.Path(__file__).resolve().parent.parent
URL_QR = "https://ubika.netlify.app/mariana-ruiz/"


def qr(url):
    q = qrcode.QRCode(border=0, error_correction=qrcode.constants.ERROR_CORRECT_M)
    q.add_data(url)
    q.make(fit=True)
    m = q.get_matrix()
    n = len(m)
    d = "".join(f"M{x} {y}h1v1h-1z" for y, fila in enumerate(m) for x, v in enumerate(fila) if v)
    return f'<svg viewBox="0 0 {n} {n}" shape-rendering="crispEdges" aria-hidden="true"><path fill="#18211C" d="{d}"/></svg>'


def fachada(muro, puerta, cielo, dos_pisos=False, buganvilia=True):
    """Fachada de casa oaxaqueña dibujada en SVG: muro de color, puerta, ventanas con herrería."""
    alto = 28 if dos_pisos else 48
    partes = [
        f'<rect width="160" height="120" fill="{cielo}"/>',
        f'<rect x="10" y="{alto}" width="140" height="{108 - alto}" fill="{muro}"/>',
        f'<rect x="6" y="{alto - 6}" width="148" height="8" fill="#F1F3EE"/>',      # pretil encalado
        '<rect x="0" y="108" width="160" height="12" fill="#8C8A80"/>',             # banqueta
        f'<rect x="64" y="66" width="32" height="42" rx="15" ry="15" fill="{puerta}"/>',
        f'<rect x="64" y="84" width="32" height="24" fill="{puerta}"/>',
        '<circle cx="90" cy="90" r="1.6" fill="#E8C66A"/>',
    ]
    for x in (24, 112):
        partes.append(f'<rect x="{x}" y="66" width="24" height="26" fill="#2B3A33"/>')
        partes.append(f'<path d="M{x} 66h24M{x} 79h24M{x+8} 66v26M{x+16} 66v26" stroke="#18211C" stroke-width="1.6"/>')
        partes.append(f'<rect x="{x-3}" y="92" width="30" height="4" fill="#F1F3EE"/>')
    if dos_pisos:
        for x in (30, 70, 110):
            partes.append(f'<rect x="{x}" y="38" width="20" height="18" fill="#2B3A33"/>')
            partes.append(f'<path d="M{x} 47h20M{x+10} 38v18" stroke="#18211C" stroke-width="1.4"/>')
    if buganvilia:
        partes.append('<g fill="#C2306A"><circle cx="16" cy="58" r="7"/><circle cx="24" cy="54" r="6"/><circle cx="12" cy="66" r="5"/>'
                      '<circle cx="21" cy="62" r="4"/></g><g fill="#2F6B3F"><circle cx="18" cy="52" r="2.5"/><circle cx="10" cy="60" r="2"/></g>')
    return ('<svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'
            + "".join(partes) + "</svg>")


def icono(trazos, relleno=False):
    attr = 'fill="currentColor"' if relleno else 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'
    return f'<svg viewBox="0 0 24 24" {attr} aria-hidden="true">{trazos}</svg>'


SUSTITUCIONES = {
    "{{QR}}": qr(URL_QR),
    "{{FACHADA_1}}": fachada("#E9A23B", "#6B3B22", "#BFD8E6"),
    "{{FACHADA_2}}": fachada("#3C7C8C", "#F1F3EE", "#D3E3EC", dos_pisos=True, buganvilia=False),
    "{{FACHADA_3}}": fachada("#D9677A", "#3E5A4A", "#C6DDE8"),
    "{{ICONO_WA}}": icono('<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.3-.5.1-1 .1-3.2-.8-2.7-1.1-4.4-3.9-4.5-4.1-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.3c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.2 1.4 2.5 1.5.3.1.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.4.1.1.1.7-.1 1.3z"/>', relleno=True),
    "{{ICONO_CHAT}}": icono('<path d="M21 12a8.5 8.5 0 0 1-12.5 7.5L3 21l1.5-5A8.5 8.5 0 1 1 21 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>'),
    "{{ICONO_TIENDA}}": icono('<path d="M4 9.5 5.5 4h13L20 9.5"/><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M5.5 12v8h13v-8M10 20v-5h4v5"/>'),
    "{{ICONO_TARJETA}}": icono('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M13 9h5M13 12h5M6 9h4v5H6z"/>'),
    "{{ICONO_PERFIL}}": icono('<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>'),
    "{{ICONO_NO}}": icono('<path d="M6 6l12 12M18 6 6 18"/>'),
    "{{ICONO_SI}}": icono('<path d="M4 12.5 9.5 18 20 6"/>'),
}

html = (RAIZ / "plantilla" / "inicio.html").read_text(encoding="utf-8")
for marca, valor in SUSTITUCIONES.items():
    html = html.replace(marca, valor)
assert "{{" not in html, "Quedó una marca sin sustituir"
(RAIZ / "public" / "index.html").write_text(html, encoding="utf-8")
print("public/index.html listo:", len(html), "caracteres")
