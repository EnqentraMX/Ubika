// Demo del CRM de RL Industrial: corre todo en el navegador (sin servidor) para probarlo.
import { api, leer, publicas } from "../src/core.js";
import { paginaInicio, paginaBodega, pagina404 } from "../src/render.js";
import PANEL from "../src/panel.html";
import CSS from "../public/sitio.css";
import JS from "./sitio.js.txt";
import semilla from "../datos/semilla.json";

const PREF = "rl-demo-v1:";
const mem = new Map();
const ls = (() => { try { const k = "__p"; localStorage.setItem(k, "1"); localStorage.removeItem(k); return localStorage; } catch { return null; } })();
const store = {
  async get(k) { if (mem.has(k)) return mem.get(k); if (ls) { const v = ls.getItem(PREF + k); if (v != null) { mem.set(k, v); return v; } } return null; },
  async put(k, v) { mem.set(k, v); if (ls) try { ls.setItem(PREF + k, v); } catch {} },
  async del(k) { mem.delete(k); if (ls) try { ls.removeItem(PREF + k); } catch {} },
  async putImage(id, bytes, tipo) {
    let bin = ""; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return "data:" + tipo + ";base64," + btoa(bin);
  },
  async delImage() {},
  async getImage() { return { value: null }; },
};
const env = { ADMIN_PASSWORD: "rosy2026" };
let token = "";

const frame = document.getElementById("vista");
const botones = document.querySelectorAll("[data-modo]");
const L = (x) => (x.startsWith("#") ? x : "#/" + x);

function pinta(html) {
  html = html.replace(/<link rel="stylesheet" href="sitio\.css\?v=\d+">/, "<style>" + CSS + "</style>")
    .replace(/<script src="sitio\.js\?v=\d+" defer><\/script>/, () => "<script>" + JS.replace(/<\/script/gi, "<\\/script") + "<\/script>");
  frame.srcdoc = html;
}
async function ir(ruta) {
  ruta = ruta || "/";
  const [camino, ancla] = ruta.split("#");
  botones.forEach((b) => b.classList.toggle("on", b.dataset.modo === (camino === "/panel" ? "panel" : "sitio")));
  if (camino === "/panel") { frame.srcdoc = PANEL; return; }
  const d = await leer(store, semilla);
  const vista = { ...d, bodegas: publicas(d) };
  const m = camino.match(/^\/bodega\/([\w-]+)/);
  const html = m ? paginaBodega(vista, m[1], { base: "", L }) || pagina404(vista, { base: "", L }) : paginaInicio(vista, { base: "", L });
  pinta(html);
  if (ancla) frame.addEventListener("load", function f() { frame.removeEventListener("load", f); const el = frame.contentDocument.getElementById(ancla); if (el) el.scrollIntoView(); });
}
function aviso(t) {
  const v = document.querySelector(".aviso"); if (v) v.remove();
  const d = document.createElement("div"); d.className = "aviso"; d.textContent = t; document.body.appendChild(d);
  setTimeout(() => d.remove(), 5000);
}
window.RLdemo = {
  ir, aviso,
  fetch: async (url, o = {}) => {
    const h = new Headers(o.headers || {});
    if (token) h.set("x-rl-token", token);
    const req = new Request(new URL(url, "https://demo.rl-industrial.mx"), { method: o.method || "GET", headers: h, body: o.body });
    const res = await api(req, store, env, semilla);
    if (url === "/api/admin/entrar" && res.ok) { const j = await res.clone().json(); token = j.token; }
    if (url === "/api/admin/salir") token = "";
    return res;
  },
};
botones.forEach((b) => b.addEventListener("click", () => ir(b.dataset.modo === "panel" ? "/panel" : "/")));
document.getElementById("reiniciar").addEventListener("click", async () => {
  mem.clear(); if (ls) Object.keys(ls).filter((k) => k.startsWith(PREF)).forEach((k) => ls.removeItem(k));
  token = ""; aviso("Demo reiniciada con los datos originales."); ir("/");
});
ir("/");
