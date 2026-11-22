# RL Industrial: sitio + CRM con panel oculto

Es un Worker de Cloudflare, como Ubika y el acortador. Todo se guarda en un KV: bodegas, prospectos, fotos y ajustes. Con el plan gratis no cuesta nada.

## Qué incluye
- **Sitio público** (`/`): portada con buscador por m² y zona, catálogo con filtros, mapa, pasos de trabajo, la asesora, preguntas frecuentes y formulario de contacto.
- **Ficha de cada bodega** (`/bodega/<slug>`): mosaico de hasta 5 fotos con visor, ficha técnica, calculadora, mapa aproximado, preguntas rápidas por WhatsApp y formulario para agendar visita.
- **Panel oculto** (`/panel-rl`, se cambia con `PANEL_RUTA`): no tiene enlaces desde el sitio, no se indexa en Google y pide contraseña. Tiene:
  - Inicio con resumen: prospectos nuevos, seguimientos de hoy y bodegas con más clics.
  - Bodegas: agregar, editar, ocultar o borrar; estado (disponible, apartada, rentada u oculta); máximo 5 fotos que se comprimen solas; ubicación pegando el enlace de Google Maps.
  - Prospectos (CRM): todo lo que llega de los formularios, etapas del embudo, notas, próxima fecha y botones de WhatsApp y llamada.
  - Agenda de seguimientos y visitas.
  - Ajustes: datos del negocio, logo, foto, textos de portada, preguntas frecuentes y contraseña.

## Publicar
Desde Cloudflare: Workers & Pages → Create → Import a repository → EnqentraMX/Ubika, con **Root directory = `rl-crm`**. Cloudflare crea solo el espacio de datos (KV) al publicar.

O desde la terminal:
```bash
npm install
npx wrangler login
npx wrangler deploy
```

**Contraseña:** la primera vez que se abre el panel pide crear una. Ábrelo en cuanto se publique y créala (o pásale el enlace a Rosy para que la cree ella). Si prefieres fijarla tú: `npx wrangler secret put ADMIN_PASSWORD`.
Queda en `https://rl-industrial.<tu-cuenta>.workers.dev`. Para usar `rlindustrialmx.com`, en Cloudflare entra a Workers → rl-industrial → Settings → Domains & Routes → Add custom domain.

Te recomiendo cambiar `PANEL_RUTA` en `wrangler.toml` por algo menos obvio (ej. `rosy-7k2p`). El panel de Rosy queda en `https://<dominio>/<PANEL_RUTA>`.

## Datos iniciales
La primera vez que abre, carga las 12 bodegas que ya estaban en Ubika (`datos/semilla.json`). Las fotos de muestra se ven desde `ubika.demomx.workers.dev/rl-industrial/img/...`. Si algún día quitas esa carpeta de Ubika, Rosy puede volver a subirlas desde el panel.

## Probar en tu compu
```bash
echo 'ADMIN_PASSWORD="prueba123"' > .dev.vars
npx wrangler dev                       # http://localhost:8787 y http://localhost:8787/panel-rl
node herramientas/prueba.mjs           # 25 pruebas del API
node herramientas/armar_demo.mjs       # regenera la demo de un solo archivo (demo/rl-industrial-demo.html)
```

## Archivos
- `src/core.js`: reglas del CRM (validación, máximo 5 fotos, sesiones, contraseña).
- `src/render.js`: HTML de las páginas públicas.
- `src/panel.html`: el panel de administración.
- `src/worker.js`: rutas y almacenamiento en KV.
- `public/sitio.css` y `public/sitio.js`: diseño e interacción del sitio.
