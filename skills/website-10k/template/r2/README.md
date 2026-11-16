# Mídia no Cloudflare R2 (opcional)

Arquivos prontos para hospedar imagens e vídeos da LP no R2 e deixar o Pages só com o código.
Não fazem parte do template por padrão: copie para `<marca>/app/` apenas quando for pedido
(ou quando um arquivo passar de 25 MB, o limite por arquivo do Pages).

Passo a passo completo, permissões do token e pegadinhas: `references/r2-midia.md` da skill website-10k.

| Arquivo | Para quê |
|---|---|
| `subir-midia.mjs` | Sobe a mídia de `public/assets` para o R2, original, sem conversão (`npm run midia`). |
| `limpar-midia.mjs` | Depois do build, tira de `dist/` o que já mora no R2. Entra num script próprio, `"build:pages": "npm run build && node limpar-midia.mjs"`, para o `npm run build` continuar gerando o `dist/` completo (que serve em qualquer outra hospedagem). |
| `functions/assets/[[path]].ts` | Função do Pages que entrega `/assets/*` direto do R2 (mesmas URLs). |
| `functions/tsconfig.json` | Tipos da função (`@cloudflare/workers-types`). |
| `wrangler.toml` | Liga o bucket ao Pages como `MIDIA`. |
