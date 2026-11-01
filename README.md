# Ubika

Ubika tu casa. Páginas para asesores inmobiliarios, publicadas en Cloudflare Workers (ubika.demomx.workers.dev). Carpeta de salida: public.

- `public/index.html`: página de inicio (se genera, no se edita a mano).
- `plantilla/inicio.html`: la fuente de la página de inicio.
- `public/assets/ubika.css`: colores, tipografía, logo y botones. Lo comparten el inicio, las páginas de asesor y las fichas de cada casa.
- Para regenerar el inicio: `python3 herramientas/armar_inicio.py` (necesita `pip install qrcode`).

Próximo: `public/<asesor>/` con su página y `public/<asesor>/<casa>/` con la ficha de cada propiedad y su código QR.

## Identidad
- Verde cantera `#3E5A4A` y cantera oscura `#2C4236`: color de marca.
- Amarillo lona `#FFD21F`: acento, como la lona de "Se vende".
- Fondo cal `#F1F3EE`, tinta `#18211C`, WhatsApp `#1F8F4E`.
- Títulos: Big Shoulders Display. Texto: Hanken Grotesk.

## Asesores
- Los datos de cada asesor están en `asesores/<asesor>.json` y sus fotos en `public/<asesor>/<propiedad>/img/`.
- Para armar o actualizar: `python3 herramientas/armar_asesor.py <asesor>`.
- Genera `public/<asesor>/index.html` (perfil), una ficha por propiedad y los QR para imprimir en `qr/<asesor>/`.
- Lo que llega del cliente se guarda en `_recibido/` (no se sube: puede traer datos internos como comisiones).

## Espacios hechos a mano
### RL Industrial (`public/rl-industrial/`)
Bodegas y naves en renta, CDMX y Edomex. Tiene diseño propio (grafito y verde lima de su logo), buscador, mapa, calculadora y una ficha por inmueble.
- Datos: `especiales/rl-industrial/datos.json` (WhatsApp, inmuebles, ubicaciones aproximadas). Fotos con `@` se cargan del servidor de su página anterior; las demás están en `public/rl-industrial/img/`.
- Diseño y lógica: `public/rl-industrial/assets/rl.css` y `rl.js`.
- Para armar o actualizar: `python3 herramientas/armar_rl_industrial.py` (necesita Pillow para las imágenes de vista previa).
