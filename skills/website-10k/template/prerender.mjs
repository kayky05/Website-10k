// Depois do build: injeta o HTML pronto da página no dist/index.html e acerta o endereço do site.
//
// SITE_URL=https://dominio.com.br npm run build  → versão oficial: troca https://SEU-DOMINIO pelo domínio em
//   canonical, og:url, og:image, robots.txt e sitemap.xml, e deixa o Google indexar.
// npm run build (sem SITE_URL)                    → versão de apresentação: fora do Google (noindex + robots bloqueado).
//
// A troca é feita aqui, em UTF-8, e não com localizar/substituir no terminal (que pode estragar os acentos).
import { readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const dist = path.resolve("dist");
const { render } = await import(pathToFileURL(path.resolve("dist-ssr/entry-server.js")).href);
const html = readFileSync(path.join(dist, "index.html"), "utf-8");
let out = html.replace('<div id="root"></div>', `<div id="root">${render()}</div>`);
if (out === html) throw new Error("não achei o <div id=\"root\"></div>");

const MARCADOR = "https://SEU-DOMINIO";
const site = (process.env.SITE_URL || "").replace(/\/+$/, "");
const trocar = (arquivo) => {
  const p = path.join(dist, arquivo);
  if (existsSync(p)) writeFileSync(p, readFileSync(p, "utf-8").split(MARCADOR).join(site));
};
if (site) {
  out = out.split(MARCADOR).join(site);
  trocar("robots.txt");
  trocar("sitemap.xml");
  console.log("versão oficial:", site);
} else {
  out = out.replace("</title>", '</title>\n<meta name="robots" content="noindex, nofollow">');
  writeFileSync(path.join(dist, "robots.txt"), "User-agent: *\nDisallow: /\n");
  console.log("versão de apresentação: fora do Google (para publicar no domínio, rode com SITE_URL)");
}

writeFileSync(path.join(dist, "index.html"), out);
rmSync("dist-ssr", { recursive: true, force: true });
console.log("pré-renderizado:", Math.round(out.length / 1024), "KB");
