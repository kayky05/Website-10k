# Preparar o computador

Rode o checklist da Fase 0 e instale só o que faltar, um item por vez, verificando cada um. Logins são sempre da pessoa: diga o comando e espere ela concluir (sugira `! <comando>` no Claude Code para a saída cair na conversa).

## 1. Programas base

Windows (PowerShell):

```powershell
winget install Git.Git GitHub.cli OpenJS.NodeJS.LTS Python.Python.3.13 Gyan.FFmpeg
```

macOS: `brew install git gh node python ffmpeg`.

Feche e abra o terminal. Depois: `gh auth login` (a pessoa faz). No Windows, se o PowerShell bloquear `npm`/`npx`, use `npm.cmd`/`npx.cmd`.

## 2. Higgsfield (imagens e vídeos com IA)

No Claude Code: **+** → **Connectors** → **Manage connectors** → **Add** → **Add custom connector**. Nome `Higgsfield`, URL `https://mcp.higgsfield.ai/mcp`, **Add** e **Connect**. A pessoa entra na conta no navegador e clica em **Allow**. Verifique com uma consulta de saldo.

Há também a linha de comando (`higgsfield`), útil para gerar em lote. Pergunte sempre em qual conta gerar: cada cliente pode ter a sua.

## 3. Cloudflare (publicação)

Nada a instalar: o `wrangler` roda pelo `npx`. A pessoa cria a conta e o token (passo a passo em `deploy.md`) só quando chegar a hora de publicar.

## 4. Skills e plugins que o método usa

```powershell
npx -y skills add Leonxlnx/taste-skill --all -g -y
npx -y skills add pbakaus/impeccable --all -g -y
npx -y skills add higgsfield-ai/skills --all -g -y
npx -y skills add apify/agent-skills --all -g -y
npx -y skills add blader/humanizer -g -y
npx -y skills add referodesign/refero_skill --skill refero-design -g -y
npx -y skills add heygen-com/hyperframes --all -g -y

claude plugin marketplace add addyosmani/agent-skills
claude plugin install agent-skills@addy-agent-skills -s user
claude plugin install superpowers@claude-plugins-official -s user
claude plugin install frontend-design@claude-plugins-official -s user
claude plugin install playwright@claude-plugins-official -s user
```

Skills de anúncios (`ads`, `ads-landing`, `ads-meta`...): https://github.com/AgriciDaniel/claude-ads. **Leia o instalador antes de rodar.**

Nenhuma é obrigatória para começar: se faltar uma, siga o método e use a skill quando estiver instalada.

## 5. MCPs opcionais

```powershell
claude mcp add --transport http apify https://mcp.apify.com -s user          # scrapers (Google Maps, Instagram)
```

Depois de adicionar: reinicie o Claude Code, digite `/mcp` e faça **Authenticate**. Chaves e segredos (OAuth do Google, tokens) vão no ambiente ou no gerenciador de segredos, **nunca** num repositório.

## 6. Celular (para medir fluidez)

- Android: Android Studio com um emulador (AVD) e `adb`, para medir quadros por segundo pelo protocolo de depuração do Chrome (`fluidez-celular.md`).
- iPhone: o celular da própria pessoa, com os modos de teste por link.
