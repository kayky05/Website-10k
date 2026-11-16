# Quando algo dá errado: sintoma → causa → correção

Cada linha aconteceu de verdade num build. Procure pelo sintoma antes de investigar do zero.

---

## Rolagem e celular

| Sintoma | Causa | Correção |
|---|---|---|
| A página inteira rola aos trancos no celular, mesmo sem efeito nenhum | Lenis criado em tela de toque escuta o toque com `passive: false` | Criar o Lenis só com `(hover: hover) and (pointer: fine)` (já no template) |
| A página pula centenas de px no celular quando a barra do navegador some | Alturas em `vh`/`svh` ou calculadas com `innerHeight` | Alturas em `lvh` ou px |
| Cards caem para ~7 fps quando o dedo passa por cima | Holofote que segue o ponteiro (SpotlightCard e parecidos) redesenha a cada quadro | Versão sem holofote em tela de toque (`fluidez-celular.md`, seção 1) |
| Menu deixa a rolagem pesada no celular | `backdrop-filter`/vidro líquido em elemento fixo | Vidro só no desktop |
| Palco sticky de tela cheia treme no iPhone | Safari redesenha o sticky com conteúdo crescendo a cada quadro | Carrossel com scroll-snap nativo no celular |
| Fotos ficam em branco "às vezes" no iPhone | Aba passou do limite de memória (imagens decodificadas presas) | Adiantar só com `fetch`, nunca `new Image()`/`decode()` em lote |
| Pequeno tranco para trás perto de pilhas de cards | Ancoragem de rolagem do navegador | `html.lenis { overflow-anchor: none }` |
| A barra de rolagem some e volta durante cenas | `.lenis-stopped { overflow: clip }` da folha oficial | Copiar a folha do Lenis sem essa regra |
| Pilha de cards (ScrollStack) rola a página durante uma cena travada | Rolagem suave própria do componente | `smoothScroll={false}` (prop do componente) |

## Cenas em vídeo e portais

| Sintoma | Causa | Correção |
|---|---|---|
| Vídeo engasga no scrub | Poucos keyframes | Encode com `-g 8 -keyint_min 8` |
| "Tá travando, tenho que scrollar de novo" | Scrub parando no meio de cenas longas | Cena por gesto (`scrub-pipeline.md`, 1.2) |
| O portal/foto nunca abre no **Android** (no iPhone abre) | O Chrome conta o `clip-path` do próprio alvo no IntersectionObserver; com `circle(0%)` a foto está sempre "0% visível" | Observar um irmão sem recorte na mesma caixa (ex.: o anel do portal) |
| Aparece o verde do chroma key antes do print entrar na tela do mockup | Sobreposição entrando com atraso/fade depois da foto | Mesma caixa e mesma animação de `clip-path` da foto |
| Faixa da tela original aparece no iPhone em volta do print deformado | WebKit desenha `matrix3d` em perspectiva como plano | Retângulo simples no celular |
| Borda do portal treme quando o scroll para | Oscilação de 1 a 2 px em volta do ponto final | Zona morta de 3 px no encaixe |
| Mockup "aparece" mas o vídeo atrás some no Safari | Máscara recalculada a cada quadro no iPhone | Portal automático por CSS no celular, não amarrado ao dedo |

## CSS e Tailwind v4

| Sintoma | Causa | Correção |
|---|---|---|
| `whitespace-nowrap`, `tracking-*` ou `text-[..]` não fazem efeito | CSS da LP fora de camada (`p { text-wrap: pretty }`, `.rotulo { letter-spacing }`) ganha das classes do Tailwind, que ficam em `@layer utilities` | Pôr o CSS da LP numa camada abaixo (`@layer theme, base, site, utilities`) ou usar `!` no fim da classe (`whitespace-nowrap!`) |
| Botões de um componente aparecem pretos com borda branca | Mesmo motivo: CSS da LP sem camada | Mesma correção |
| Cartão (de membro, de crédito) achatado no celular | Altura fixa com `clamp` enquanto a largura acompanha a tela | `aspect-ratio` real (86/54) e conteúdo em `cqw` com `@container` |
| Rótulos dentro de um cartão quebram linha ou saem da borda | Tamanhos presos à largura da tela (`vw`), não do cartão | Unidades `cqw` medidas pelo próprio cartão |
| A página rola para o lado em 360 px | Brilho externo de card, largura fixa | `overflow-x: clip` na seção, `minmax(0,1fr)` na grade |

## JavaScript e React

| Sintoma | Causa | Correção |
|---|---|---|
| Índice do carrossel vira `NaN`, nada acende | `querySelectorAll("li")` pegou também os `li` de dentro dos cards | `:scope > li` |
| Efeito roda duas vezes em desenvolvimento | `React.StrictMode` | Sem StrictMode em LP com efeitos de montagem única |
| Erro no build "document is not defined" | DOM acessado no corpo do componente | Tudo que mexe no DOM dentro de `useEffect` |
| `motion` e `framer-motion` duplicados no bundle | Versões diferentes | Mesma versão; `npm ls framer-motion` mostra "deduped" |
| Componente "não renderiza" vindo do 21st.dev | O arquivo do prompt era um exemplo vazio | Usar o componente de verdade do `demo.tsx` |

## Mídia, build e deploy

| Sintoma | Causa | Correção |
|---|---|---|
| Acentos quebrados depois de editar | Arquivo editado por script/terminal com codificação errada | Restaurar e editar com a ferramenta de edição; endereço do site pelo `SITE_URL` do `prerender.mjs` |
| Script em Python/heredoc estraga `\n` dentro do código | Escape interpretado pelo shell/Python | Editar código com a ferramenta de edição, não por script |
| Site no ar mostra lista de arquivos ou 404 | Zipou a pasta `dist` em vez do conteúdo | `Compress-Archive -Path .\dist\*` |
| Domínio oficial fora do Google | Build sem `SITE_URL` (sai `noindex`) | `SITE_URL=https://dominio npm run build` |
| Mídia falta no outro servidor | `dist/` gerado com `build:pages` (sem mídia, para o R2) | Para outras hospedagens use `npm run build` |
| Primeira requisição depois do deploy dá 404 | Função do Pages ainda propagando | Esperar alguns segundos e tentar de novo |
| Vídeo do R2 sempre responde 206 | Função respondendo intervalo sem pedido de `Range` | Só 206 com cabeçalho `Range` (`r2-midia.md`) |
| `wrangler r2 object put` "funciona" mas o arquivo não está no bucket | Sem `--remote`, grava no simulador local | `--remote` (o `subir-midia.mjs` do template já usa) |
| Aviso de segurança no primeiro acesso ao domínio novo | Certificado HTTPS ainda sendo emitido | Esperar alguns minutos |
| Números de velocidade absurdos | Medido com outra LP compilando, ou no `npm run dev` | Medir no build (`npm run preview`) com a máquina parada |

## Ferramentas

| Sintoma | Causa | Correção |
|---|---|---|
| Ferramenta do Higgsfield sem resposta nenhuma (não é render) | Conector travado | Fechar e abrir o app, voltar à mesma conversa |
| Créditos somem sem explicação | Outra sessão usando a mesma conta | Conferir o histórico de gerações antes de gerar de novo |
| Rascunho barato aprovado não "finaliza" pela linha de comando | O fluxo de finalizar rascunho não funciona fora do app | Gerar a versão final de novo com o mesmo prompt e a mesma imagem |
| MotionSites devolve chamada de upgrade | Conta grátis sem prompts | Mostrar o link de upgrade ao usuário e seguir pelos prints |
| `npx shadcn add "https://21st.dev/r/..."` pede autenticação | Precisa de `API_KEY_21ST` | Usar o "Copy prompt" logado no site |
| Gravação do emulador Android parece travada | A gravação mostra ~10 fps até numa página vazia | Julgar por métricas (`fluidez-celular.md`, seção 4) |

## Primeira tela e marca

| Sintoma | Causa | Correção |
|---|---|---|
| No reload aparece por ~0,5 s a tela antiga (outra imagem, título, menu) antes do vídeo | O HTML pré-renderizado sai no modo estático e o JavaScript troca para o vídeo depois | `still` do topo no computador = primeiro quadro do vídeo; cena com `data-pendente` escondendo o conteúdo estático e o menu até decidir (`padrao.md`) |
| Depois da correção acima, o menu nunca mais aparece | `pendente` não volta a `false` no caminho do vídeo | `setPendente(false)` em todos os caminhos: vídeo pronto, foto, falha e cena fora da tela |
| O pisca do reload não aparece no teste | Testado no `npm run dev` ou com rede rápida | `npm run preview` e atraso nas requisições `.mp4` |
| "A pessoa cai numa hero bonita mas não sabe de quem é o site" | A marca só está no menu, que sai da tela nas cenas | Abertura de marca na primeira faixa da cena, escolhida numa vitrine |
| Acentos cortados no alto dos títulos | Fonte de olho alto com entrelinha apertada e máscara das palavras justa | Entrelinha perto de 1 e máscara com padding + margem negativa (`.z-wi` em `cena.css`) |
| Título passa da largura em alguma tela | Tamanho em `vw` sem teto, palavra longa | Medir de 390 a 1920 px; `clamp` pela coluna de conteúdo |
