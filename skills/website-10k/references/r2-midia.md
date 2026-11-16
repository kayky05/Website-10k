# Media on Cloudflare R2 (on request)

Host the site's images and videos on Cloudflare R2 and keep Cloudflare Pages for code only. Use this **only when the user asks** to put media on the Cloudflare CDN/R2, or when a single media file is over the **25 MB per-file limit of Cloudflare Pages** (long hero videos hit it). It does not change any URL in the site: the page keeps requesting `/assets/...`, and a Pages Function serves those files from R2.

Proven in a real build (2026-10-16): 46 files (two 23 MB videos), Pages bundle went from ~100 MB to 813 KB, every file verified byte-identical after upload.

**Keep `npm run build` portable.** The R2 cleanup runs in a separate script (`build:pages`), so the plain `build` still produces a complete `dist/` with every media file. That is what any other host needs (Hostinger, the client's own server, another developer deploying the official domain). Typical split: the presentation link lives on Cloudflare Pages + R2 (`npm run build:pages`), the official domain gets `SITE_URL=https://domain npm run build` and the full `dist/`.

## Golden rule: never touch the files

Upload the **original** files, byte for byte. Do not compress, re-encode, convert to AVIF/WebP, generate smaller variants or change how videos load "to save bytes" unless the user explicitly asks for that. Users of this workflow reject quality loss strongly; R2 traffic is cheap (free egress, 10 GB storage free), so hosting is the answer to weight, not editing the media.

## What the user must do (only they can)

1. **Enable R2** in the Cloudflare dashboard: `https://dash.cloudflare.com/<ACCOUNT_ID>/r2/overview` → Enable. Cloudflare asks for a payment method even on the free tier (10 GB storage, 1M writes, 10M reads per month, free egress). Open the page for them in their own browser and wait.
2. **API token.** They create it in the dashboard (you can pre-fill the form with a template URL, see below) and click Create themselves. Ask them to store it as an environment variable, never paste it in the chat:
   - Windows: `setx CLOUDFLARE_API_TOKEN "<token>"` in their own PowerShell window.
   - macOS/Linux: `export CLOUDFLARE_API_TOKEN=...` in their shell profile.
   If they paste it anyway, store it as the env var without echoing it back, and recommend rotating it when the work is done.

**Token permissions needed:** Account → Workers R2 Storage: Edit, and Cloudflare Pages: Edit (all accounts). Pre-filled form (the user only reviews and clicks):
```
https://dash.cloudflare.com/profile/api-tokens?permissionGroupKeys=%5B%7B%22key%22%3A%22workers_r2%22%2C%22type%22%3A%22edit%22%7D%2C%7B%22key%22%3A%22page%22%2C%22type%22%3A%22edit%22%7D%5D&accountId=%2A&zoneId=all&name=LP%20-%20R2%20midia
```
Keys come from Cloudflare's token-template docs (`workers_r2`, `page`, `images`, `stream`, `dns`, `zone`, `cache`...). Suggest the minimal set even if the user asks for "full access", and let them decide.

## Steps (you do these)

Run from `<brand>/app/`. On Windows `npx` is `npx.cmd`. Export the token for the current shell first (a `setx` value only reaches new processes):
```bash
export CLOUDFLARE_API_TOKEN=$(powershell.exe -NoProfile -Command "[Environment]::GetEnvironmentVariable('CLOUDFLARE_API_TOKEN','User')" | tr -d '\r')
export CLOUDFLARE_ACCOUNT_ID=<account id>   # GET https://api.cloudflare.com/client/v4/accounts with the token
```

1. **Check access.** `GET /client/v4/user/tokens/verify` must say `active`. `GET /client/v4/accounts/<id>/r2/buckets` returning error `10042` means R2 is not enabled yet (step 1 of the user list). Confirm the Pages project lives in the same account (`GET /accounts/<id>/pages/projects`).
2. **Create the bucket:** `npx wrangler r2 bucket create <brand>-lp-midia`.
3. **Copy the template files** from the skill's `template/r2/` into `<brand>/app/`: `subir-midia.mjs`, `limpar-midia.mjs`, `wrangler.toml` (set `name` = Pages project, `bucket_name`), `functions/assets/[[path]].ts`, `functions/tsconfig.json`. Then:
   - `npm i -D @cloudflare/workers-types`
   - in `package.json`: add `"build:pages": "npm run build && node limpar-midia.mjs"` and `"midia": "node subir-midia.mjs"`. Do not append the cleanup to `build` itself (see "Keep `npm run build` portable" above).
   - set `BUCKET` in `subir-midia.mjs`.
   - add `.midia-enviada.json` to version control or keep it local, but it must exist where you build: `limpar-midia.mjs` reads it to know which files live in R2.
4. **Upload:** `npm run midia`. It uploads every image/video under `public/assets` with the right content type and `Cache-Control: public,max-age=86400`, and records each file in `.midia-enviada.json` so later runs only send what changed.
5. **Build:** `npm run build:pages`. The last step removes the uploaded media from `dist/`; check `du -sh dist` (code only) and that no `.mp4` is left in it. The presentation link stays out of Google on its own (no `SITE_URL`, see `template-lp-react/prerender.mjs`).
6. **Deploy a preview branch first:** `npx wrangler pages deploy dist --project-name <project> --branch r2-teste --commit-dirty=true`. The output must show "Compiled Worker successfully" and "Uploading Functions bundle".
7. **Verify, byte for byte,** every uploaded file against the original, and the page in a browser (videos reach `readyState` 4 and play, every `<img>` has `naturalWidth > 0`, no console errors):
   ```bash
   B=https://r2-teste.<project>.pages.dev; ok=0; tot=0
   while read k; do tot=$((tot+1)); c=$(curl -s -o /tmp/r2.bin -w "%{http_code}" "$B/$k")
     [ "$(sha256sum < /tmp/r2.bin | cut -c1-20)" = "$(sha256sum < "public/$k" | cut -c1-20)" ] && [ "$c" = 200 ] && ok=$((ok+1)) || echo "problem: $k ($c)"
   done < <(node -e "console.log(Object.keys(require('./.midia-enviada.json')).join('\n'))" | tr -d '\r')
   echo "identical: $ok/$tot"
   ```
8. **Deploy production** (`--branch main`) and re-check the page, one video and one image on the live URL.

From then on: new or changed media → `npm run midia`, then `npm run build:pages` and deploy as usual.

## Gotchas already paid for

- `wrangler r2 object put` writes to a **local** simulator unless you pass `--remote`. The template passes it.
- Windows + `execFileSync(..., { shell: true })` splits arguments on spaces: write `--cache-control=public,max-age=86400` with no space, or wrangler fails with "Unknown argument: max-age=86400".
- The first request right after a deploy can 404 for a few seconds while the Function propagates. Retry before debugging.
- Only answer **206** when the request carries a `Range` header. Without that check, R2 reports a range on every object and every plain request comes back as 206.
- Pages serves real static files before the Function; `/assets/*` requests that are not in R2 (the build's JS/CSS chunks) fall through `next()` to Pages. Keep that `next()`.
- The Cache API is not available on `*.pages.dev`; responses still go through Cloudflare's network with the object's `Cache-Control`. A custom domain on a Cloudflare zone allows edge caching rules later.
- On Windows, lists produced by `python`/`node` end lines with `\r`: pipe through `tr -d '\r'` in bash loops, or every path will "not exist".
- Without a domain on the Cloudflare account, do not use the bucket's public `r2.dev` URL for production (it is rate-limited). The Pages Function route above avoids it entirely.
