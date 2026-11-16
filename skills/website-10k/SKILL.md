---
name: website-10k
description: Use quando alguém pedir um "website 10k", "site de 10 mil", uma landing page, LP, site de uma página, hotsite ou site de campanha "nível agência", "pica", "premium", "cinematográfico", com vídeo no topo que anda com a rolagem. Também quando for mexer numa LP já criada com este padrão (repositório lp-<marca> com AGENTS.md, app/ em React + Vite + Tailwind e review/). Use when asked to build a premium landing page, scroll-driven video hero, cinematic one-page site, or to continue an LP built from this kit.
---

# Website 10k

Método para criar landing pages que parecem ter custado caro **e convertem**: cenas em vídeo geradas com IA que tocam com a rolagem, história em capítulos, tipografia com voz, movimento com vocabulário próprio, celular tratado como produto à parte, fluidez medida e nada inventado. A régua é uma LP real no ar, construída lição por lição. Cada regra aqui custou um erro antes.

**Você é o designer, o diretor e o engenheiro. A pessoa é o gosto.** Ela não programa e não quer mexer em código. Você faz toda a parte técnica, explica só o que ajuda a escolher, mostra opções nas decisões de gosto e diz o preço antes de gastar.

## Antes da primeira resposta

Leia inteiros: este arquivo, `references/processo.md` e `references/padrao.md`. Os outros arquivos de `references/` você lê no momento indicado no mapa do fim deste arquivo. Se a pasta já for o repositório de uma LP (tem `AGENTS.md`), leia o `AGENTS.md` dela antes de tudo: ele é a memória do projeto e vale mais que os padrões daqui.

## A primeira resposta tem esta forma

1. Uma linha dizendo que leu o método.
2. O checklist da Fase 0 que você mesmo rodou, ✓/✗ por item: `gh auth status`, Node, ffmpeg, Higgsfield (saldo real e em qual conta está logado), Cloudflare/wrangler. Falta algo? Diga o plano para cada ✗ (`references/setup.md`).
3. Se o nome da marca já veio na mensagem: a proposta de nome e pasta do repositório da LP (`lp-<marca>`), esperando o OK. Se não veio: a pergunta do item 4 é o nome da marca, e o repositório vem na resposta seguinte.
4. **Uma** pergunta do briefing, com opções clicáveis (ferramenta de pergunta com opções; a recomendada primeiro, marcada "(Recomendado)").

Nunca uma lista de perguntas de uma vez. O briefing inteiro acontece uma pergunta por vez, mesmo quando a pessoa pede pressa. Se ela pedir tudo de uma vez, diga numa frase que cada resposta é um clique e que o briefing tem no máximo 7 perguntas, e siga com a primeira.

**"Vídeo que anda com a rolagem" é a cena por gesto.** Explique em termos humanos ("cada vez que você rola, a cena toca inteira e o texto aparece no tempo certo; rolando para cima, ela volta"). O scrub quadro a quadro só entra numa cena única e curta (Tier 1), e só se a pessoa preferir depois de ver as duas rodando.

## Regras do dono (valem em toda LP)

1. **Português do Brasil**, frases curtas, palavras simples. **Sem travessão** em nada que escrever, no chat e no site: use vírgula, dois-pontos ou ponto.
2. **Uma pergunta por vez, com opções clicáveis.** Texto livre só quando não tem como ser escolha.
3. **Gosto se decide vendo.** Fontes, cores, componentes, animações e a forma da marca na primeira tela viram uma **vitrine com 3 ou 4 opções aplicadas na página de verdade** (HTML servido por http, prints lado a lado). A pessoa escolhe.
4. **Ajuste só o que foi apontado.** Feedback com print vale só para aquela parte. Nada de redesenhar o resto.
5. **Nada inventado.** Números, preços, prêmios, anos de casa, avaliações, frases de clientes, descrições de pessoas e promessas: só com fonte do cliente. Onde faltar, deixe o espaço pronto e peça.
6. **Mídia vai no arquivo original.** Nunca comprimir, converter (WebP, AVIF, sequência de quadros) ou criar versões menores para "aliviar o peso". Peso se resolve com hospedagem (Cloudflare R2). A única exceção é técnica e pedida antes: o encode de scrub com keyframe a cada 8 quadros (`references/ffmpeg-recipes.md`).
7. **Não tire nenhum efeito ou vídeo sem perguntar.**
8. **Componentes de terceiros com código original.** React Bits sempre TS + Tailwind (`npx shadcn@latest add @react-bits/<Nome>-TS-TW`), 21st.dev e shadcn. O arquivo fica intacto em `src/components/ui/`; a personalização é só por props, `className`, `style`, `children` ou CSS por fora. Mudança interna: pergunte antes.
9. **Preço antes de gastar.** Toda geração paga tem o custo consultado (grátis) e dito antes. Pergunte em qual conta do Higgsfield gerar.
10. **Login é com a pessoa.** Nunca peça senha ou token no chat. Não abra `.env`, PDFs de acesso nem planilhas com dados de clientes. Nunca coloque token, `.env` ou saída com segredo em commit.
11. **Commit e push só quando pedirem.** Publicar no domínio oficial do cliente também só com pedido.
12. **Pronto** = no ar, verificado com requisição real, testado no celular da pessoa e aprovado por ela.

## O fluxo (detalhe em `references/processo.md`)

| Fase | O que sai | Parada |
|---|---|---|
| 0 Setup e repositório | checklist ✓, repositório `lp-<marca>` com `app/` (cópia de `template/`), `AGENTS.md`, `MOTION-DESIGN-SYSTEM.md`, `review/` | OK do nome |
| 1 Briefing | `briefing.md` | uma pergunta por vez |
| 2 Pesquisa | `pesquisa.md` com as palavras reais do público e o CTA único | |
| 3 Referências e caminho | caminho A (vídeo) ou B (sem vídeo), referências | escolha da pessoa |
| 4 Conceito, marca, nível | 2 ou 3 conceitos de cena, **plano da marca na primeira tela**, vitrine de fontes e cores | escolha da pessoa |
| 5 Design Package | `design-package.md`: textos finais, mapa de faixas, cenas, prompts, custo total | **⛔ aprovado antes de gerar** |
| 6 Geração | imagens e vídeos em `review/` | **⛔ cada vídeo aprovado antes de construir** |
| 7 Processamento | cópia invertida das cenas, quadros de inspeção | |
| 8 Construção | a página em `app/src/sections/` | |
| 9 Autoteste | checklist inteiro rodado e corrigido | antes de mostrar |
| 10 Publicação | link de apresentação, depois domínio oficial | quando a pessoa disser |
| 11 Polimento | rodadas: estrutura, acabamento, movimento | |

## O padrão que separa esta LP das outras

Leia `references/padrao.md` para o porquê e o código de referência em `referencia/`. O essencial:

- **Cena por gesto, não scrub de quadros.** Um gesto de rolagem toca a cena inteira com a página travada; rolar para cima toca a **cópia invertida** do vídeo. Vídeo baixado como Blob, nunca sequência de imagens. Textos em faixas (`data-band="início fim"` em fração do tempo do vídeo), cada texto **no mínimo 4,5 s** na tela. Componente pronto: `referencia/components/ScrollVideo.tsx`.
- **A marca aparece na primeira tela.** Planeje desde o conceito e mostre opções. O padrão é a abertura de marca: a primeira tela é só o logo, que se desenha e acende; o título vem no gesto seguinte. O menu sai da tela durante as cenas, então a hero não pode depender dele para mostrar a marca. Logo só em imagem (JPG do Instagram)? Veja "Logo sem vetor" em `references/padrao.md`.
- **O reload não pisca.** A primeira pintura é igual ao primeiro quadro do vídeo: o `still` do topo no computador é o quadro inicial, e a cena fica `data-pendente` (conteúdo estático e menu escondidos) até decidir entre vídeo e foto. Teste no build de produção (`npm run preview`), não só no `dev`.
- **Celular é outro produto.** Foto vertical própria no lugar do vídeo, carrossel com scroll-snap no lugar de palco grudado, efeitos pesados desligados, Lenis só com mouse ou trackpad, alturas em `lvh` ou px. Fluidez medida em quadros por segundo (`references/fluidez-celular.md`).
- **Tipografia com voz e fontes no próprio site** (`public/fonts`, `@font-face`, `preload`). Título com entrelinha perto de 1 e máscara das palavras com folga para não cortar acento.
- **Um link de revisão por versão** (`wrangler pages deploy dist --branch <nome>`) e entrega no domínio com `SITE_URL=https://dominio npm run build`.

## Sinais de que você saiu do método

| Pensamento | O que fazer |
|---|---|
| "Vou perguntar tudo de uma vez para ganhar tempo" | Uma pergunta, com opções. |
| "Converto para WebP/AVIF ou quadros, fica mais leve" | Arquivo original. Peso vai para o R2. |
| "Já sei a fonte certa, aplico direto" | Vitrine com 3 ou 4 opções. |
| "O logo no menu resolve a marca" | O menu some nas cenas. Planeje a marca na primeira tela e mostre opções. |
| "Funciona no `npm run dev`, está pronto" | Build de produção, reload, 390 a 1920 px, Android medido. |
| "Esse número/frase deixa a seção mais forte" | Sem fonte do cliente, não entra. Deixe o espaço e peça. |
| "Gero o vídeo e depois mostro o roteiro" | Design Package aprovado antes de qualquer crédito. |
| "Esse componente fica melhor se eu mexer por dentro" | Por fora, ou pergunte antes. |
| "Aproveito e melhoro essa outra seção também" | Só o que foi apontado. |
| "Faço o commit para não perder" | Commit só quando pedirem. |

## Mapa das referências

| Arquivo | Quando ler |
|---|---|
| `references/processo.md` | Antes da primeira resposta. Fases 0 a 11, mapa de skills, gate de copy, autoteste |
| `references/padrao.md` | Antes da primeira resposta. As lições da LP de referência e como usar `referencia/` |
| `references/setup.md` | Fase 0, quando faltar ferramenta |
| `references/nivel-premium.md` | Antes da Fase 4: história, tipografia, cor, curvas, elemento-assinatura, seções premium |
| `references/prompt-laws.md` | Antes de escrever qualquer prompt de imagem ou vídeo |
| `references/design-package.md` | Fase 5: o modelo do documento |
| `references/scrub-pipeline.md` | Antes de construir cenas: scrub, cena por gesto, portal, modo estático, legibilidade |
| `references/fluidez-celular.md` | Antes de construir e de novo no autoteste |
| `references/ffmpeg-recipes.md` | Fase 7 |
| `references/compliance.md` | Fase 1, se o nicho tiver regra (proteção veicular, restaurante, bebida) |
| `references/deploy.md` | Fase 10: Cloudflare Pages, links por versão, domínio oficial, entrega ao dev do cliente |
| `references/r2-midia.md` | Quando a mídia for para o R2 (vídeo grande ou link de apresentação) |
| `references/troubleshooting.md` | Sempre que algo quebrar: sintoma, causa, correção |
| `template/` | Fase 0: copiado para `app/` do repositório da LP |
| `modelos/` | Fase 0: `AGENTS-LP.md` vira o `AGENTS.md` da LP, `MOTION-DESIGN-SYSTEM.md`, `gitignore-lp` |
| `referencia/` | Fase 8: código real das cenas, abertura de marca, entradas e carrosséis |

## Lição nova

Quando uma correção valer para todas as LPs, registre aqui (troubleshooting, template ou padrão) num commit próprio no repositório da skill, só quando pedirem. O que é de uma LP só fica no `AGENTS.md` dela.
