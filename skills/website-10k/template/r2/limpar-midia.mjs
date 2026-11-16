/* Depois do build: tira de dist/ a mídia que mora no R2 (registrada em .midia-enviada.json por subir-midia.mjs),
   para o Pages levar só o código. Os arquivos originais continuam em public/ para o desenvolvimento local. */
import { readFile, rm } from "node:fs/promises";
import path from "node:path";

let enviados = {};
try {
  enviados = JSON.parse(await readFile(path.resolve(".midia-enviada.json"), "utf8"));
} catch {
  console.log("limpar-midia: nada registrado no R2, dist/ fica como está");
  process.exit(0);
}
let n = 0;
for (const chave of Object.keys(enviados)) {
  await rm(path.resolve("dist", chave), { force: true });
  n++;
}
console.log(`limpar-midia: ${n} arquivos de mídia servidos pelo R2, fora do pacote do Pages`);
