# O padrão: as lições da LP de referência

A régua deste método é uma LP real que está no ar, com três cenas em vídeo, 14 capítulos, abertura de marca, celular tratado à parte e fluidez medida. Este arquivo traz as lições que viraram regra e explica como usar o código dela, que está em `referencia/`.

**Estude o padrão, não copie a identidade.** Cada marca ganha a própria paleta, as próprias fontes, as próprias cenas e o próprio elemento-assinatura. As cores fixas do `cena.css` e os textos do `TopoExemplo.tsx` são só exemplo.

## As lições

| # | Lição | Por quê | Onde está no código |
|---|---|---|---|
| 1 | **A marca aparece na primeira tela.** Planeje desde o conceito e mostre 3 ou 4 formas rodando sobre o primeiro quadro. | O dono reclamou: "a pessoa só cai numa hero bonita, mas precisa saber que está no site". | `MarcaHero` em `sections/TopoExemplo.tsx`, `.lp-marca-hero` em `cena.css` |
| 2 | **O topo não pisca no reload.** A imagem fixa do topo no computador é o **primeiro quadro** do vídeo, e a cena fica `data-pendente` até decidir entre vídeo e foto. Enquanto isso, o conteúdo estático e o menu ficam escondidos. | O HTML pré-renderizado sai no "modo foto" e o JavaScript troca para o vídeo ~0,5 s depois, então a tela antiga aparecia. | `pendente` em `ScrollVideo.tsx`, fim do `cena.css` |
| 3 | **O menu sai da tela durante as cenas.** É de propósito, para a cena ocupar a tela, mas tira a marca. | Leve em conta na lição 1. | evento `lp:cena` em `ScrollVideo.tsx` |
| 4 | **Cena por gesto, nunca parada no meio.** Um gesto toca a cena inteira com a página travada; para cima toca a cópia invertida. Mais rolagem acelera até 2,5x. | O dono odiou o scrub que parava no meio: "tá travando, tenho que scrollar de novo". | `ScrollVideo.tsx` |
| 5 | **Cada texto fica no mínimo 4,5 s na tela** (`LEITURA_MS`). A página só solta depois do último texto. | Texto que passa rápido não é lido. | `ScrollVideo.tsx` |
| 6 | **Lenis só com mouse ou trackpad.** Nunca em tela de toque. | No toque ele escuta a janela com `passive: false` e a página inteira rolava aos trancos. | `App.tsx` |
| 7 | **Palco grudado de tela cheia vira carrossel no celular** (scroll-snap nativo). | O sticky com conteúdo crescendo tremia no iPhone. | `CarrosselRegua.tsx` |
| 8 | **Alturas em `lvh` ou px, não `vh`.** | A barra do navegador muda a altura e a página pulava 515 px. | `cena.css`, seções |
| 9 | **Componentes pesados só perto da tela, e desmontados longe** (`Perto soltar`). Vídeos baixam a uma tela de distância e saem da memória a três telas. | No iPhone, fotos grandes decodificadas estouraram a memória da aba. | `Perto.tsx`, `ScrollVideo.tsx` |
| 10 | **No celular, desligue:** vidro líquido do menu, fio SVG da página inteira, holofote dos cards (`Holofote.tsx`), zoom de foto, brilho que corre no botão. Meça antes e depois. | 7 → 30 fps em cima dos cards; 60 → 30 fps com o vidro. | `Holofote.tsx`, `fluidez-celular.md` |
| 11 | **Fontes no próprio site** (`public/fonts`, `@font-face`, `preload`). Título com entrelinha perto de 1 e máscara das palavras com folga (padding + margem negativa). Meça de 390 a 1920 px se algum título passa da largura. | Fontes de olho alto cortavam acentos na máscara. | `cena.css` (`.lp-wi`) |
| 12 | **Um link de revisão por versão:** `wrangler pages deploy dist --branch <nome>` gera `https://<nome>.<projeto>.pages.dev` sem mexer no link de apresentação. | A pessoa compara versões sem perder a aprovada. | `deploy.md` |
| 13 | **Domínio oficial com `SITE_URL=https://dominio npm run build`**: troca canonical e og e libera a indexação. A entrega pode ser o repositório para o desenvolvedor do cliente publicar (às vezes como submódulo do site oficial). | Sem `SITE_URL` o build sai `noindex`, fora do Google. | `template/prerender.mjs` |
| 14 | **Brutos em `review/`** (vídeos HD, prompts, vitrines). Nada de `review/` vai para o site. | Tudo em `public/` vai ao ar. | |
| 15 | **Para mostrar imagens:** abra no Chrome com URL `file:///` e monte folhas de comparação com prints de 390, 1024, 1440 e 1920 px. Vitrines (fontes, animações) são páginas HTML servidas por http. | Abrir a imagem pelo sistema nem sempre funciona; o Playwright bloqueia `file:`. | |
| 16 | **Teste no build de produção** (`npm run preview`), com rede lenta simulada (atrase as requisições de `.mp4`). | O pisca do reload não aparece no `dev`. | |

## Como a abertura de marca funciona

1. O logo vira SVG de traço: cada letra ou parte do símbolo é um `<path pathLength={1}>` com `--i` (ordem). Os traços vêm do SVG oficial da marca.
2. Na primeira faixa da cena (`data-band="0 0.06"`), só o logo no centro, sobre o primeiro quadro do vídeo.
3. Quando a faixa ganha `.is-in`, cada traço se desenha (`stroke-dashoffset` de 1 a 0, 0,9 s, atraso de 0,16 s por traço), o logo acende (brilho em `drop-shadow`) e a linha de apoio sobe.
4. Sem JavaScript ou com "reduzir movimento", o logo aparece pronto.
5. No celular (modo foto), o logo entra acima do título, já desenhado.

### Logo sem vetor

Muitas marcas pequenas só têm o logo em imagem. Nesse caso, peça primeiro o arquivo original (designer, gráfica, Canva). Sem ele, mostre as opções e deixe a pessoa escolher:
1. **Abertura com o arquivo de imagem:** o logo aparece por uma máscara que se abre (círculo, varredura de luz) e acende. Não precisa de vetor.
2. **Vetorizar com aprovação:** traçar o logo em SVG **sem mudar nada** (mesmas formas, mesmas cores), mostrar lado a lado com o original e só usar depois do OK.
3. **Ampliar com IA sem alterar** (upscale), quando o arquivo é pequeno demais, mostrando a comparação.

Nunca recrie o letreiro com uma fonte parecida.

Outras formas que valem mostrar na vitrine: as letras sobem de uma máscara uma a uma; "zoom" com a primeira letra chegando e as outras abrindo (quando o nome sugere velocidade); um brilho que percorre o logo já visível.

## Como o reload sem pisca funciona

```
HTML do build ──► primeira pintura = still do topo (= primeiro quadro do vídeo), sem título e sem menu
                  (porque #topo[data-pendente] esconde .lp-cena-estatico e o cabeçalho)
JavaScript ─────► decide: vídeo (computador) ou foto (celular, reduzir movimento, economia de dados, falha)
                  vídeo pronto → setPendente(false), o logo se desenha
                  foto → setPendente(false), aparece o conteúdo estático
cena fora da tela no carregamento (reload no meio da página) → setPendente(false) na hora
```

Erro já cometido: esquecer `setPendente(false)` no caminho do vídeo deixa o menu escondido para sempre. Teste os três caminhos: topo, meio da página e rede lenta. O CSS do cabeçalho usa a classe `lp-cabecalho`: ponha essa classe no `<header>` da LP.

## O código de referência (`referencia/`)

Adapte ao copiar: as cores fixas, os caminhos de mídia e os textos.

| Arquivo | O que faz |
|---|---|
| `components/ScrollVideo.tsx` | A cena em vídeo: modos estático, carregando e vídeo; Blob do normal e do invertido; gesto que toca a cena inteira; faixas com relógio próprio; portal circular de entrada e saída; `data-pendente`; foto vertical no celular (`stillCelular`, `blocoCelular`) |
| `sections/TopoExemplo.tsx` | Uso: abertura de marca, faixas dos capítulos, conteúdo estático do celular |
| `App.tsx` | Lenis só com mouse ou trackpad, exposto em `window.__lenis` para as cenas travarem e soltarem a página |
| `cena.css` | Curvas, entradas (`data-reveal`, palavras em máscara, números que rolam), fim de cena, portal, folha do Lenis sem o `overflow: clip`, máscaras no celular, abertura de marca e `data-pendente` |
| `effects/pagina.ts` | Efeitos da página inteira: entradas, palavras, números, linhas que se desenham, só perto da tela |
| `components/Editorial.tsx` | Peças tipográficas: `Palavras`, `Rolo` (caça-níquel), `Botao` (pílula com seta), `LinkRolo` |
| `components/Perto.tsx` | Monta perto da tela e, com `soltar`, desmonta longe guardando a altura |
| `components/CarrosselRegua.tsx` | Carrossel com scroll-snap e régua que acende até o card à vista |
| `components/Holofote.tsx` | Troca o card com holofote por caixa igual em tela de toque |
| `lib/quadro.ts` | Homografia para encaixar telas reais (prints do produto) dentro de um vídeo |

Dependências que esses arquivos importam e que não estão no template: componentes React Bits (`SpotlightCard`, `Magnet`, `DecryptedText`, instalados pelo comando TS + Tailwind) e `@/lib/contato` (links da marca: crie o seu). O `lenis` já vem no template.

## Os números da LP de referência (para comparar)

- Lighthouse: celular 79, desktop 87, layout shift 0. O peso do desktop é o vídeo original do topo (decisão do dono).
- Pacote do Pages ~800 KB (só código); a mídia mora no R2.
- Topo: 4 trechos de vídeo emendados, 23,4 s. Rascunho em 480p para aprovar o movimento, depois 1080p e upscale para 2K.
