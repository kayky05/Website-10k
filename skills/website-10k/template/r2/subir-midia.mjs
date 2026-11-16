/* Sobe a mídia de public/assets para o R2 (bucket definido em BUCKET), arquivo original, sem conversão nenhuma.
   O site continua pedindo /assets/...; a função functions/assets/[[path]].ts entrega do R2.
   Rodar: node subir-midia.mjs  (precisa de CLOUDFLARE_API_TOKEN e CLOUDFLARE_ACCOUNT_ID no ambiente).
   Só sobe o que mudou desde a última vez (lista em .midia-enviada.json). */
import { readdir, stat, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const BUCKET = "<marca>-lp-midia"; // troque pelo bucket criado com wrangler r2 bucket create
const RAIZ = path.resolve("public");
const MIDIA = /\.(mp4|webm|jpe?g|png|webp|avif|gif|svg)$/i;
const TIPOS = { mp4: "video/mp4", webm: "video/webm", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif", gif: "image/gif", svg: "image/svg+xml" };
const REGISTRO = path.resolve(".midia-enviada.json");

async function listar(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await listar(p)));
    else if (MIDIA.test(e.name)) out.push(p);
  }
  return out;
}

let enviados = {};
try {
  enviados = JSON.parse(await readFile(REGISTRO, "utf8"));
} catch {}

const arquivos = await listar(path.join(RAIZ, "assets"));
let n = 0;
for (const arq of arquivos) {
  const chave = path.relative(RAIZ, arq).split(path.sep).join("/"); // assets/...
  const st = await stat(arq);
  const marca = `${st.size}-${Math.round(st.mtimeMs)}`;
  if (enviados[chave] === marca) continue;
  const ext = path.extname(arq).slice(1).toLowerCase();
  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  execFileSync(
    npx,
    ["wrangler", "r2", "object", "put", `${BUCKET}/${chave}`, "--file", arq, "--content-type", TIPOS[ext] ?? "application/octet-stream", "--cache-control=public,max-age=86400", "--remote"],
    { stdio: ["ignore", "ignore", "inherit"], shell: process.platform === "win32" },
  );
  enviados[chave] = marca;
  await writeFile(REGISTRO, JSON.stringify(enviados, null, 1));
  n++;
  console.log(`  ↑ ${chave} (${Math.round(st.size / 1024)} KB)`);
}
console.log(`mídia: ${arquivos.length} arquivos, ${n} enviados agora`);
