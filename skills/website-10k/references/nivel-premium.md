# O nível premium: o que separa uma LP de agência de uma LP bonita

O vídeo de abertura chama a atenção. O que faz a página parecer cara é o resto: história, tipografia, ritmo, movimento coerente e nenhum detalhe esquecido no celular. Este arquivo é o repertório. Use como cardápio, não como lista obrigatória: cada marca pede uma seleção.

---

## 1. A página conta uma história

- **Estrutura de livro:** a LP é dividida em capítulos numerados, cada um com um rótulo pequeno em mono (`CAPÍTULO 03 · COMO FUNCIONA`). Dá ritmo e faz a pessoa sentir que está avançando.
- **Uma tese, não uma lista de serviços.** Ex.: "a distância entre quem constrói, quem vende e quem compra, e a marca encurtando essa distância". Cada capítulo é um passo dessa tese.
- **Duas portas quando há dois públicos** (ex.: "Sou empresa" / "Sou profissional"): o topo deixa a pessoa escolher, e cada capítulo fala com um deles.
- **Nada inventado.** Números, frases atribuídas a pessoas, regras de prêmio, nomes de parceiros: só com fonte do cliente. Onde falta, deixe o espaço preparado e peça o dado. Um número inventado derruba a confiança do cliente na LP inteira.

## 2. Tipografia que tem voz

- **Trio:** uma sans de display com personalidade para títulos e texto, um **itálico serifado** só para destacar a palavra-chave dentro do título (`Quem vende <em>é valorizado.</em>`), e uma **mono** para rótulos, números de capítulo e legendas.
- Títulos grandes, entrelinha apertada (~1,0 a 1,1), `text-wrap: balance`; parágrafos com `text-wrap: pretty`.
- Fontes **hospedadas no próprio site** (`public/fonts`, `@font-face`, `preload` no `index.html`): a primeira tela não espera o Google Fonts e nada pula.
- **Mostre antes de decidir:** para fontes e paletas, monte uma vitrine com 3 ou 4 opções aplicadas no título real da LP e deixe o usuário escolher. Gosto é do usuário.

## 3. Cor

- Fundo grafite (nunca preto puro), superfície um tom acima, linha sutil, texto em dois níveis.
- **Uma cor de marca como sinal:** CTA, nós que acendem, o elemento-assinatura. Rara.
- **Uma cor de prestígio** opcional para o que é conquista (ex.: dourado em prêmios e placas), nunca misturada com a cor de sinal no mesmo elemento.
- Tokens no `index.css` desde o primeiro dia; nenhum hex solto nos componentes.

## 4. Movimento com vocabulário próprio

Defina **três curvas e uma tabela de durações** e use só elas na página inteira:

| Nome | Curva | Uso |
|---|---|---|
| Marca | `cubic-bezier(0.4, 0, 0.1, 1)` | movimentos gerais, câmera, transições |
| Saída | `cubic-bezier(0.16, 1, 0.3, 1)` | entradas de texto e elementos |
| Botão | `cubic-bezier(0.35, 0, 0, 1)` | microinterações |

Repertório de entradas (escolha poucas e repita):

- **Palavras do título subindo da máscara**, uma a uma (~1 s cada, 55 ms entre palavras).
- **Números em caça-níquel**: cada dígito rola até o valor quando entra na tela.
- **Linha que se desenha** embaixo de um item depois que o texto entra.
- **Nós que acendem** numa linha do tempo conforme a linha de progresso passa por eles (variáveis `--k` progresso e `--pos` posição de cada nó, opacidade = `clamp(0, (k - pos) * 25 + 1, 1)`).
- **Brilho que passa** uma vez sobre um valor (ex.: ShinyText do React Bits num número dourado).
- **Portal circular** entre página e cena (`scrub-pipeline.md`, 1.3).

Regras: um movimento por elemento; tudo entra uma vez; nada fica piscando; o destaque acende, percorre e apaga. Texto que entra numa cena fica no mínimo ~4,5 s.

## 5. Um elemento-assinatura

Algo que só esta marca tem e que costura a página. Exemplos que funcionaram:

- **Um fio de luz** na cor da marca que serpenteia entre as seções e se desenha com o scroll (só no desktop, ver `fluidez-celular.md`).
- **O portal** que abre as cenas, repetido nas fotos do celular.
- **Fios de fundo** em WebGL bem discretos (ex.: Threads do React Bits), pausados durante as cenas.

## 6. Repertório de seções que elevam

| Seção | Como fica premium |
|---|---|
| Manifesto | Uma frase grande, tratamento de contraste (palavras-chave acesas, resto apagado), sem botão |
| Pilares | 3 ou 4 cards com ícone em vidro (GlassIcons), número no canto, holofote no hover (só desktop) |
| Como funciona | Linha do tempo com nós numerados que acendem com o scroll |
| Prova com produto real | Telas reais do sistema/produto dentro da cena (mockup com homografia), abas que trocam a tela |
| Parceiros / casos | Desktop: card que cresce até tela cheia com a rolagem. Celular: carrossel com scroll-snap |
| Programa de prêmios / níveis | Régua com marcos; no desktop o cartão do prêmio abre no hover; no celular carrossel com a régua em miniatura acendendo até o card à vista |
| Objetos físicos (placas, cartões) | Recorte com fundo transparente, giro leve com o scroll, inclinação com o mouse, reflexo no vidro, sombra no chão |
| Cartão de membro | ReflectiveCard (React Bits) na proporção real de cartão (86/54), conteúdo em `cqw` |
| Time | Pilha de cards (ScrollStack) com fotos em preto e branco que ganham cor no hover |
| Planos | Um plano destacado, preço honesto, o que inclui em lista curta |
| Dúvidas | Respondem as objeções da pesquisa, nas palavras do público |

**Toda interação de desktop tem uma versão pensada para o celular**, não encolhida: hover vira conteúdo já visível; palco sticky vira carrossel; holofote vira caixa parada.

## 7. Componentes de terceiros

React Bits (sempre `-TS-TW`), 21st.dev e shadcn entram com o **código original** em `src/components/ui/`. A marca personaliza por props, `className`, variáveis de CSS e componentes que envolvem o original. Ver `template-lp-react/README.md`. Usados com sucesso em LPs desse nível: Threads, ScrollStack, ReflectiveCard, GlassSurface, GlassIcons, SpotlightCard, ShinyText, DecryptedText, StarBorder, Magnet, CountUp, BlurText, ScrollExpand.

## 8. O documento de motion da marca

Ao fechar a direção, escreva `MOTION-DESIGN-SYSTEM.md` na raiz do repositório da LP (modelo em `modelos/MOTION-DESIGN-SYSTEM.md` da skill). Ele vira a fonte para tudo que vier depois: vídeos de anúncio, motion para redes, novas seções, outro agente continuando o trabalho. Sem ele, cada peça nova inventa um movimento diferente.

## 9. Disciplina com o usuário

- **Ajuste só o que foi apontado.** Feedback com print vale para aquela parte. Não redesenhe o resto por conta própria.
- **Não tire efeito nem vídeo sem perguntar**, nem para ganhar velocidade.
- **Mídia nunca é comprimida, convertida ou reduzida** sem pedido. Peso se resolve com hospedagem (R2, `r2-midia.md`).
- Publique o link de apresentação a cada rodada (quando o usuário autorizar) e mande o link: o usuário confere no próprio celular.
