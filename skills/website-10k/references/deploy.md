# Publicação

Só quando a pessoa disser que está pronto (o link de apresentação pode ser antes, se ela liberou na Fase 0).

## Os três builds

```bash
cd app
npm run build                              # dist/ completo, com toda a mídia (serve em qualquer hospedagem), fora do Google
npm run build:pages                        # o mesmo, sem a mídia que mora no R2 (só para o Cloudflare Pages com R2)
SITE_URL=https://dominio npm run build     # versão oficial: canonical e og no domínio, sem noindex, robots liberado
```

No Windows (PowerShell): `$env:SITE_URL="https://dominio"; npm run build`. Nunca troque o endereço à mão com script: o `prerender.mjs` faz em UTF-8 (script de terminal estraga acentos).

## Link de apresentação: Cloudflare Pages

Grátis e, na prática, privado (fora do Google por `noindex` e `robots.txt`).

1. A pessoa cria a conta Cloudflare e **o próprio token** em https://dash.cloudflare.com/profile/api-tokens com: Account → Cloudflare Pages: Edit (e Workers R2 Storage: Edit, se usar R2). Ela guarda no ambiente, nunca no chat nem no repositório:
   - Windows: `setx CLOUDFLARE_API_TOKEN "<token>"` e `setx CLOUDFLARE_ACCOUNT_ID <id>` (vale em terminais novos).
   - macOS/Linux: `export ...` no perfil do shell.
2. Primeira vez: `npx wrangler pages project create <projeto> --production-branch main`.
3. Mídia grande (vídeo acima de 25 MB, ou a página toda pesada): `r2-midia.md`, depois `npm run build:pages`. Sem R2: `npm run build`.
4. Publicar:
   ```bash
   npx wrangler pages deploy dist --project-name <projeto> --branch main --commit-dirty=true
   ```
   No Windows, se o `npx` falhar por rede, rode com `node` o `wrangler.js` que ficou no cache do npx (`%LOCALAPPDATA%\npm-cache\_npx\<hash>\node_modules\wrangler\bin\wrangler.js`).

### Um link por versão

`--branch <nome>` gera `https://<nome>.<projeto>.pages.dev` sem mexer no link principal. Use para a versão experimental (`dev`), para a versão que vai virar commit (`versao-commit`) e para comparar opções. Diga à pessoa qual link é qual.

## Domínio oficial

Três jeitos, conforme o cliente:

1. **Domínio na Cloudflare (recomendado):** no projeto do Pages, Custom domains → adicionar. Build com `SITE_URL`. Se o DNS estiver em outro lugar, a pessoa troca os nameservers ou cria o CNAME no registro (Registro.br, GoDaddy, Hostinger). Você explica os cliques; ela faz, porque a conta é dela.
2. **Entrega para o desenvolvedor do cliente:** o repositório da LP é a entrega (sem `review/`). O dev publica no servidor dele, às vezes como submódulo do site oficial, rodando `SITE_URL=https://dominio npm run build` e servindo `dist/`. Nesse caso, cada push no repositório só chega ao site depois que o repositório do cliente atualiza o ponteiro do submódulo e publica, e o dono precisa saber disso.
3. **Hostinger ou outra hospedagem estática:** `npm run build` (com `SITE_URL`) e suba o **conteúdo** de `dist/`, não a pasta (`Compress-Archive -Path .\dist\* -DestinationPath ..\site.zip -Force`).

Publicar no domínio oficial é ação de produção: só com pedido explícito da pessoa.

## Verificar no ar

```bash
curl -sI https://<endereço>/ | head -5                    # 200, HTTPS
curl -sI https://<endereço>/assets/<video>.mp4 | head -8  # 200, video/mp4, tamanho original
curl -s -o /dev/null -w "TTFB %{time_starttransfer}s, total %{time_total}s, %{size_download} bytes\n" https://<endereço>/
```

No Windows use `curl.exe` e `-o NUL`. Depois: abra no navegador automatizado, role todas as cenas, confira o console e recarregue no topo e no meio sem piscar. Mostre os números à pessoa. Ela testa no celular dela, na rede dela.

## Custos, ditos com honestidade

- Cloudflare Pages e R2: grátis no volume de uma LP (o R2 cobra acima de 10 GB guardados; tráfego de saída não é cobrado).
- Domínio: pago pelo cliente, no registro dele.
- Higgsfield: créditos por geração, sempre consultados antes.
