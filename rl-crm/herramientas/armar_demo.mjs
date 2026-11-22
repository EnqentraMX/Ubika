// Arma demo/rl-industrial-demo.html: sitio + panel corriendo en el navegador, sin servidor.
import { build } from "esbuild";
import fs from "node:fs";
fs.copyFileSync("public/sitio.js", "demo/sitio.js.txt");
const r = await build({ entryPoints: ["demo/entrada.js"], bundle: true, format: "iife", minify: true, write: false, loader: { ".html": "text", ".css": "text", ".txt": "text" } });
const js = r.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const html = fs.readFileSync("demo/plantilla.html", "utf8").replace("<script>/*APP*/</script>", () => "<script>" + js + "</script>");
fs.writeFileSync("demo/rl-industrial-demo.html", html);
console.log("demo:", (html.length / 1024).toFixed(0), "KB");
