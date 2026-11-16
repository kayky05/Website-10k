# O processo, fase a fase

Regras gerais em `SKILL.md`. Aqui está o passo a passo, o mapa de skills, o gate de copy e o autoteste.

## Estrutura de cada LP: um repositório por LP

Nunca construa a LP dentro do repositório da skill ou de um kit. Cada LP tem histórico, acesso, deploy e entrega próprios.

```
lp-<marca>/
├── AGENTS.md                 ← memória do projeto (modelo em modelos/AGENTS-LP.md); CLAUDE.md com "Leia AGENTS.md"
├── MOTION-DESIGN-SYSTEM.md   ← vocabulário de movimento da marca (modelo em modelos/)
├── briefing.md · pesquisa.md · design-package.md
├── contexto/                 ← textos e materiais oficiais do cliente (fonte dos fatos)
├── review/                   ← brutos, prompts, vitrines, prints de revisão (NUNCA vai para o site)
└── app/                      ← o site (cópia de template/)
    ├── public/assets/        ← fotos, vídeos e logo, nos arquivos originais
    ├── public/fonts/         ← fontes hospedadas no site
    ├── src/sections/         ← uma seção por arquivo
    ├── src/components/ui/    ← componentes de terceiros, código original
    └── dist/                 ← gerado pelo build: é isso que vai ao ar
```

## Os dois caminhos do topo

| | A · Cinematográfico | B · Sem vídeo gerado |
|---|---|---|
| Topo | Cenas em vídeo do Higgsfield que tocam com a rolagem | Fundo animado em loop, foto real ou composição tipográfica |
| Custo | ~2 créditos por imagem + 10 a 55 por vídeo, por cena | Quase zero |
| Quando | Institucional, marca premium, boa parte do tráfego no computador | Campanha, teste A/B, tráfego quase todo do celular (Meta Ads) |

No celular o caminho A mostra foto parada no lugar do vídeo. Se quase todo o tráfego vem do celular, recomende o B. 

## Fase 0 · Setup e repositório

1. Rode sozinho, sem perguntar: `gh auth status`, `node --version`, `ffmpeg -version`, saldo e conta do Higgsfield, `npx wrangler --version`. Mostre ✓/✗. Corrija um item por vez e verifique cada um (`setup.md`).
2. Proponha o nome (`lp-<marca>`) e a pasta. Com o OK:
   ```bash
   gh repo create <dono>/lp-<marca> --private --clone
   cd lp-<marca>
   cp -r <skill>/template app
   cp <skill>/modelos/AGENTS-LP.md AGENTS.md
   cp <skill>/modelos/MOTION-DESIGN-SYSTEM.md .
   cp <skill>/modelos/gitignore-lp .gitignore
   echo "Leia AGENTS.md antes de qualquer mudança." > CLAUDE.md
   mkdir review contexto
   cd app && npm install
   ```
   `<skill>` é a pasta onde está o `SKILL.md` (no Claude Code ela aparece como "Base directory" quando a skill carrega; se não aparecer, procure `website-10k/SKILL.md` em `~/.claude/skills/` ou no cache de plugins `~/.claude/plugins/`). O `template/`, os `modelos/` e o `referencia/` ficam nessa pasta.

   Sem GitHub (a pessoa não tem conta ou não quer agora): `mkdir lp-<marca> && cd lp-<marca> && git init` e o resto igual. O repositório remoto entra depois.
   A pasta aberta está vazia? Crie o `lp-<marca>` dentro dela e trabalhe lá.
3. Pergunte se o link de apresentação (Cloudflare Pages, fora do Google) pode ser publicado sem pedir a cada mudança.

## Fase 1 · Briefing

Uma pergunta por vez, com opções:

1. O que é e para quem? (marca real com fotos / marca real sem fotos / marca inventada / produto digital com telas). Marca real sem fotos, três opções para a pessoa escolher: (a) imagens de IA só de clima e ambiente, com os espaços de fotos reais prontos para uma sessão de fotos; (b) fotos do Instagram do cliente, com autorização dele; (c) imagens de IA no lugar das fotos, com aviso no site. Nunca IA fingindo ser produto, prato, corte ou pessoa real.
2. Que sensação a página deve passar?
3. Sites ou imagens de referência? (opcional)
4. Logo, fotos, vídeos, textos oficiais: peça para arrastar no chat. Guarde em `contexto/`.
5. Qual é a **ação única**? (WhatsApp com mensagem pronta, formulário, compra, agendamento, cadastro)
6. Região, diferenciais, preços que podem aparecer, prova social com fonte.
7. Nicho com regra? Leia `compliance.md`.

Skills: `agent-skills:interview-me` se a ideia estiver vaga. Saída: `briefing.md`.

## Fase 2 · Pesquisa

Descubra as **palavras exatas** do público para dor, desejo e objeção: avaliações de concorrentes no Google Maps (Apify `compass/crawler-google-places`, avise o custo), Reclame Aqui, fóruns, comentários, anúncios ativos (`ads-competitor`). Um punhado de fontes basta. Saída: `pesquisa.md` com frases reais e o CTA único confirmado.

## Fase 3 · Referências e caminho

Busque referências do nicho e do clima (MotionSites, Refero, 21st.dev, sites premiados). Mostre 2 ou 3 candidatos lado a lado (print + uma linha do porquê). A pessoa escolhe a direção e o caminho A ou B. Confira a licença de qualquer fundo ou template de terceiros.

## Fase 4 · Conceito, marca e nível

1. **Conceitos de cena (A):** 2 ou 3, seguindo as 12 leis de `prompt-laws.md`. Uma frase cada: o que se vê ao rolar e qual é o quadro final. Recomende um.
2. **A marca na primeira tela:** 3 ou 4 formas, como protótipo rodando sobre o primeiro quadro (ex.: logo sozinho que se desenha e acende; logo pequeno no alto com o título; nome gigante que encolhe para o menu; selo no canto). A pessoa escolhe. Veja `padrao.md`.
3. **Marca e tipografia:** paleta de 3 a 5 cores tirada do logo e do mundo da cena (contraste medido, WCAG); trio de fontes (display com personalidade, **nunca Inter ou Roboto como display**; corpo; mono para rótulos). **Vitrine com 3 ou 4 trios aplicados na página.**
4. **Direção visual:** `nivel-premium.md` + `high-end-visual-design`. Uma direção assumida, um elemento-assinatura, cor de destaque em dose rara, fundo nunca preto ou branco puro.
5. **Nível:** Tier 1 (uma cena de 6 s), Tier 2 (cenas encadeadas, 15 a 25 s), Tier 3 (várias cenas coreografadas com a página, como a LP de referência). Diga o custo em créditos e o tempo de cada (cada vídeo leva alguns minutos para gerar; upscale, mais alguns) e pergunte quanto a pessoa quer gastar.
6. **Negócio local com tráfego quase todo no celular** (barbearia, restaurante, clínica): diga com clareza que o vídeo aparece só no computador e que no celular entra uma foto vertical própria. Se a pessoa quiser o vídeo mesmo assim, siga o caminho A; o celular continua sendo tratado como produto à parte.

## Fase 5 · Design Package

Modelo em `design-package.md`. Tudo escrito **antes** de gastar crédito: premissa, tokens de cor, fontes, mapa de faixas de cada cena (fração do tempo, texto exato, entrada), textos do modo estático (celular), seções com a copy final, prompts de cada imagem e vídeo, custo total e saldo.

Skills: agente `copy-writer` para rascunho e `humanizer` obrigatório. Rode o gate de copy (abaixo).

**⛔ GATE:** a pessoa aprova o package antes de qualquer geração.

## Fase 6 · Geração

1. Pergunte a conta. Consulte o preço (grátis) e diga.
2. Imagem inicial de cada cena: 16:9, 2k, composta como primeiro quadro, "no text, no logos, no lettering anywhere". Inspecione (logos de marcas reais, anatomia, coerência com a marca) e mostre.
3. Compare o preço do mesmo vídeo em 2 ou 3 modelos. A pessoa escolhe com os números. Rascunho barato antes da versão final (ex.: 480p para aprovar o movimento, depois 1080p e upscale).
4. Gere o vídeo, extraia quadros do início, meio e fim e inspecione.
5. **⛔ GATE DO VÍDEO:** salve em `review/`, a pessoa assiste e aprova. Crítica honesta e custo de refazer. Três tentativas ruins: troque o conceito, não o prompt.
6. Fotos de apoio no mesmo mundo (paleta, luz, tratamento). Se uma seção tem 3 itens, os 3 ganham imagem. **Fotos de produto, prato ou pessoa real vêm do cliente**; IA só a partir da foto real e com aprovação.
7. Guarde todos os prompts em `review/prompts/`.

## Fase 7 · Processamento

`ffmpeg-recipes.md`: cópia invertida de cada cena (`-vf reverse`), primeiro e último quadro (o primeiro vira o `still` do topo no computador), quadros de inspeção. Imagens e vídeos entram em `public/assets/` **nos arquivos originais**.

## Fase 8 · Construção

1. Siga o `design-package.md` à risca. Copy literal.
2. Uma seção por arquivo em `src/sections/`, montadas em `src/App.tsx`. Tokens da marca em `src/index.css` com prefixo próprio (ex.: `--m-`).
3. Cenas: adapte `referencia/components/ScrollVideo.tsx` (veja `padrao.md`). Abertura de marca, `data-pendente` e entradas: `referencia/cena.css`.
4. Componentes de terceiros: código original em `src/components/ui/`, versões exatas no `package.json`. Pesados (WebGL, 3D, vídeo) só perto da tela (`Perto`/`PertoDaTela` + `React.lazy`), com versão simples do mesmo texto no HTML pronto.
5. Site todo animado no nível "sussurro": linhas que se desenham, entradas por palavra, brilho suave, easing em tudo, curvas só as do `MOTION-DESIGN-SYSTEM.md`. Nada pula seco, nada pisca.
6. Abaixo das cenas: um site de verdade. Menu, prova, como funciona, preço honesto se houver, dúvidas respondendo as objeções da pesquisa, **um único CTA**, rodapé com dados legais, um momento interativo.
7. Leads (site estático): WhatsApp com mensagem pronta (`https://wa.me/55DDDNUMERO?text=...`), link da agenda que o cliente já usa (Trinks, Booksy, Calendly, Google Agenda), formulário para Clickmax (`clickmax-external-pages`), Google Sheets (Apps Script) ou Formspree. Diga a verdade sobre para onde vai o dado.
8. Rastreamento: Pixel Meta e Google Ads com evento no envio e no clique do WhatsApp (`ads-server-side-tracking`). Com pixel ou cookie de terceiros, a página leva aviso de cookies com consentimento (LGPD) e link para a política de privacidade do cliente.
9. SEO: o `prerender.mjs` gera o HTML pronto. `index.html` e `public/` usam `https://SEU-DOMINIO`, trocado pelo `SITE_URL` no build. Dados estruturados do nicho (ex.: `schema.org/Restaurant`, `LocalBusiness`).
10. Registre cada decisão da pessoa no `AGENTS.md` da LP, com data.

## Fase 9 · Autoteste (antes de mostrar)

- [ ] Build de produção (`npm run build` + `npm run preview`) sem outra LP compilando ao mesmo tempo
- [ ] Larguras 360, 390, 768, 1024, 1440 e 1920 px, página inteira rolada: nenhuma rola para o lado, nenhum título passa da largura
- [ ] Todas as cenas tocam para baixo e para cima; cada texto fica 4,5 s ou mais; a página solta no fim
- [ ] **Reload no topo e no meio da página sem piscar** a tela antiga (teste com rede lenta simulada)
- [ ] A marca aparece na primeira tela no computador e no celular
- [ ] Todo texto sobre vídeo legível no pior quadro da faixa
- [ ] Botões, links, formulário (vazio, inválido, sucesso verdadeiro), WhatsApp com a mensagem certa
- [ ] Console sem erros
- [ ] `prefers-reduced-motion`: sem animação, estados finais visíveis
- [ ] Página completa e bonita sem o vídeo (bloqueie o mp4 e confira)
- [ ] Celular: quadros por segundo medidos no Android (`fluidez-celular.md`), sem palco grudado, sem efeito pesado
- [ ] Lighthouse celular e desktop (`/agent-skills:webperf`)
- [ ] `ads-landing` (coerência e atrito) e `impeccable` (audit)
- [ ] Gate de copy zerado
- [ ] Compliance do nicho conferido
- [ ] Nada de `review/` ou bruto dentro de `app/public/`

**Rede lenta no Playwright** (para ver o reload como no 4G):

```js
await page.route(/\.mp4(\?|$)/, async (r) => { await new Promise((ok) => setTimeout(ok, 3000)); await r.continue(); });
await page.reload();
// prints em 100 ms, 600 ms e 1500 ms: nenhum pode mostrar a tela antiga
```

**Sem aparelho Android:** Chrome com limitação de CPU (4x) no DevTools ou no Playwright (`Emulation.setCPUThrottlingRate` pelo CDP) dá uma ideia; o veredito é o celular da pessoa, com os modos de teste por link (`fluidez-celular.md`).

Conte o que achou e corrigiu. Para mostrar imagens, monte folhas de comparação (390, 1024, 1440 e 1920 px) e abra no Chrome com URL `file:///`.

### Gate de copy

Procure em `src/` inteiro (cenas e todas as seções), no `index.html` (título, description, og, JSON-LD) e no `dist/index.html` depois do build, e reescreva até zerar:
- **Travessão** (—).
- **Clichês (PT):** alavancar, potencializar, robusto, solução/soluções (como clichê), transformar/transformação, revolucionar, inovador, de ponta, desbloquear, elevar, jornada, experiência única, no cenário atual, sem complicação, tudo isso e muito mais.
- **Clichês (EN):** leverage, seamless, empower, unlock, robust, actionable, data-driven, solutions, testament, landscape, delve, elevate.
- **Vícios de IA:** "não é só X, é Y", falsas faixas ("de X a Y" que é só uma lista), atribuições vagas, fechos genéricos.

Exceção: recursos de marca escolhidos de propósito no Design Package.

## Fase 10 · Publicação

Só quando a pessoa disser. `deploy.md`: link de apresentação no Cloudflare Pages (mídia no R2 quando pesar), um link por versão, domínio oficial com `SITE_URL`, entrega ao desenvolvedor do cliente se for o caso. Verifique no ar (HTTPS 200, vídeo carrega, console limpo, rolagem), meça e mostre os números. A pessoa testa no celular dela, na rede dela.

## Fase 11 · Polimento

Rodadas: estrutura, depois acabamento, depois movimento. Cada ajuste: editar, build, redeploy, verificar. Avise que a partir daqui qualquer mudança é uma frase.

## Mapa de skills por fase

| Fase | Skill / ferramenta |
|---|---|
| 1 | `agent-skills:interview-me`, `superpowers:brainstorming` |
| 2 | `apify-ultimate-scraper` + MCP apify, `ads-competitor`, `ads-research` |
| 3 | MCP motionsites, `refero-design`, `21st:21st-ui`, `playwright-cli` |
| 4 | `high-end-visual-design`, `design-taste-frontend`, `ads-dna` (site existente), `brand`/`brandkit` (sem marca) |
| 5 | agente `copy-writer`, `humanizer` |
| 6 | `higgsfield-generate`, `higgsfield-product-photoshoot` |
| 8 | `frontend-design`, `agent-skills:frontend-ui-engineering`, `clickmax-external-pages`, `ads-server-side-tracking`, `anthropic-skills:seo-bentoneto` |
| 9 | Playwright (MCP ou `playwright-cli`), `/agent-skills:webperf`, `ads-landing`, `impeccable`, `superpowers:verification-before-completion` |
| 10 | `/agent-skills:ship` |
| Bugs | `superpowers:systematic-debugging` (causa antes da correção) |

Se uma skill de outro fornecedor também fizer sites (ex.: `higgsfield-websites`, `10k-websites`), este método governa. Não misture fluxos.
