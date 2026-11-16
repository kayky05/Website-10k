/* Entrega a mídia do site a partir do R2 (bucket ligado como MIDIA no wrangler.toml).
   Os arquivos são os originais, sem conversão. O que não está no R2 (o JS e o CSS do build) segue para o Pages. */
interface Env {
  MIDIA: R2Bucket;
}

export const onRequest: PagesFunction<Env> = async ({ request, env, params, next }) => {
  if (request.method !== "GET" && request.method !== "HEAD") return next();
  const partes = Array.isArray(params.path) ? params.path : [params.path];
  const chave = `assets/${partes.map((p) => decodeURIComponent(String(p))).join("/")}`;

  const obj = await env.MIDIA.get(chave, { range: request.headers, onlyIf: request.headers });
  if (obj === null) return next();

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set("accept-ranges", "bytes");
  if (!headers.has("cache-control")) headers.set("cache-control", "public, max-age=86400");

  // condição If-None-Match/If-Modified-Since atendida: sem corpo
  if (!("body" in obj)) return new Response(null, { status: 304, headers });

  const body = obj as R2ObjectBody;
  let status = 200;
  // resposta parcial só quando o navegador pediu um pedaço (Range); senão o arquivo inteiro com 200
  if (request.headers.has("range") && obj.range && "offset" in obj.range) {
    const inicio = obj.range.offset ?? 0;
    const fim = obj.range.length !== undefined ? inicio + obj.range.length - 1 : obj.size - 1;
    headers.set("content-range", `bytes ${inicio}-${fim}/${obj.size}`);
    headers.set("content-length", String(fim - inicio + 1));
    status = 206;
  } else {
    headers.set("content-length", String(obj.size));
  }
  return new Response(request.method === "HEAD" ? null : body.body, { status, headers });
};
