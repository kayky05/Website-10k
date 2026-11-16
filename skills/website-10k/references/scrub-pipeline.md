# Padrão de engenharia do hero em vídeo (scrub pipeline)

O padrão de construção das cenas em vídeo, a direção de design e o checklist de autoteste. Cada regra aqui veio de um build real que deu errado antes de dar certo. Leia antes de construir.

---

## 1. Dois modos de cena: escolha um por cena

| | **Scrub** (o vídeo segue o dedo) | **Cena por gesto** (o vídeo toca inteiro) |
|---|---|---|
| Como funciona | Cada pixel de rolagem vira um quadro do vídeo. Rolar para cima volta | Um gesto de rolagem para baixo toca a cena inteira com a página parada; para cima toca a cópia invertida |
| Sensação | Controle total, "eu estou movendo o filme" | Cinema: a cena acontece, a pessoa assiste |
| Risco | Parar no meio da cena; pede vídeo com keyframe a cada 8 quadros | Prender a página; o texto precisa de tempo de leitura |
| Quando | Uma cena curta (6 s), Tier 1 | Cenas longas ou encadeadas, várias cenas na página |

**Lição paga:** em páginas com várias cenas longas, o usuário odiou o scrub parando no meio ("tá travando, tenho que scrollar de novo"). A cena por gesto resolveu. Pergunte ou mostre os dois quando houver dúvida.

### 1.1 Scrub

- Baixe o vídeo como **Blob** (`fetch` → `URL.createObjectURL`), com um **anel de carregamento** honesto mostrando o progresso real (`content-length`).
- Loop em `requestAnimationFrame`: o tempo exibido persegue o alvo do scroll com **lerp normalizado pelo dt** (`k = 1 - Math.pow(1 - 0.12, dt / 16.7)`), e o loop **dorme** quando chega no alvo.
- **Seeks controlados:** nunca pedir um `currentTime` novo enquanto o anterior não terminou (`seeked`). Guarde o próximo alvo e aplique quando o seek atual acabar.
- **Escreva no DOM só quando o valor muda** (opacidade de banda, transform, variáveis CSS).
- Encode com keyframe a cada 8 quadros: `-g 8 -keyint_min 8` (`ffmpeg-recipes.md`). Sem isso, o scroll engasga.

### 1.2 Cena por gesto

- **Um gesto toca a cena inteira** a 1x, com a página parada (`pararRolagem()` do template). Rolar para cima toca a **cópia invertida** (`cena-rev.mp4`, gerada com ffmpeg `-vf reverse`, mesmo encode). Trocar `playbackRate` negativo não funciona nos navegadores.
- **Mais rolagem acelera** (até ~2,5x) e volta suave para 1x quando a pessoa para.
- **Textos com relógio próprio:** cada faixa de texto fica no mínimo ~4,5 s na tela, mesmo que o vídeo acelere. A página só solta depois do último texto.
- Os dois vídeos (normal e invertido) baixam como Blob quando a cena está a **uma tela** de distância e saem da memória a **três telas** (`URL.revokeObjectURL`).
- **Nenhum componente pode ter rolagem suave própria** durante a cena (ex.: ScrollStack do React Bits com `smoothScroll={false}`), senão ele rola a página travada.
- O menu sai da tela durante a cena (um evento próprio, ex.: `window.dispatchEvent(new CustomEvent("marca:cena", { detail: { ativa } }))`).

### 1.3 Transição página ↔ vídeo: o portal

Nada de corte seco nem crossfade genérico. A cena entra por um **portal circular** que abre a partir de um ponto, com as bordas dissolvidas no fundo da página:

- Variáveis CSS que o JavaScript atualiza (ex.: `--r` raio, `--oy` centro, `--ft`/`--fb` desfoque das bordas) e um `mask-image`/`clip-path` que lê essas variáveis.
- **Zona morta de 3 px** no encaixe: sem ela, o degradê da borda treme quando o scroll oscila em volta do ponto final.
- Só calcule o portal quando a cena está **perto da tela** (IntersectionObserver liga e desliga a medição).

### 1.4 Telas reais dentro do vídeo (mockups)

Quando o último quadro mostra uma tela (notebook, celular), as telas reais do produto entram por cima, deformadas para os quatro cantos medidos no último quadro (homografia → `matrix3d`).

- Meça os cantos **pixel a pixel** no último quadro e guarde em fração do quadro, com 2 px de folga.
- **WebKit (iPhone) desenha `matrix3d` em perspectiva como plano** e deixa uma faixa da tela original aparecendo. No celular use um retângulo simples (a tela costuma estar quase reta).
- Se a tela da imagem for **chroma key** (verde), a sobreposição precisa aparecer **no mesmo instante** que a imagem. Use a mesma caixa e a mesma animação de recorte da foto. Uma entrada com atraso ou fade mostra o verde.

---

## 2. Os cinco portões do hero estático

O hero vira **imagem parada** (o quadro final ou um still próprio, com o texto da cena) quando:

1. Tela pequena (abaixo de ~900 px).
2. `prefers-reduced-motion: reduce`.
3. Economia de dados (`navigator.connection.saveData`).
4. O vídeo falhou ao baixar.
5. A página foi aberta como arquivo (`file://`, o `fetch` é bloqueado).

Mantenha atualizado com listeners de mudança (`matchMedia(...).addEventListener("change", ...)`). **A página tem que ficar completa e bonita mesmo se o vídeo nunca carregar.**

### No celular

- Gere um **still vertical** próprio (9:16 ou a proporção real do arquivo) em vez de recortar o 16:9. Componha para o celular.
- A foto abre por um **portal automático**: quando 20% dela entra na tela, uma animação de CSS (`clip-path: circle(0% → 150%)`, ~1,3 s) abre a imagem. **Não amarre o recorte ao dedo**: no iPhone a máscara recalculada a cada quadro é redesenhada aos saltos.
- **Observe um elemento sem recorte** (um irmão na mesma caixa, ex.: o anel do portal). O Chrome conta o `clip-path` do próprio alvo no IntersectionObserver: a foto fechada (`circle(0%)`) dá 0% visível para sempre e o portal nunca abre no Android.
- Altura da caixa em proporção fixa (`aspect-ratio`) para nada pular quando a imagem chega.

---

## 3. Bandas de texto e legibilidade

- **Platô longo, rampas curtas:** cada texto fica parado e legível na maior parte da sua faixa; entrar e sair é rápido. Valide com o **teste do flick** (rolar rápido como um visitante de verdade).
- **Legibilidade em 4 camadas:** scrim local que escurece só na banda ativa; sombra de texto real; posição na área mais calma do quadro; contraste testado no **pior quadro** da banda.
- Texto da cena também existe no HTML pronto (pré-render), para o Google e para quem não vê o vídeo.

---

## 4. Design direction (direção de design)

- **Uma direção assumida.** Não misture estilos. Escreva em uma frase e cumpra.
- **Um elemento-assinatura** que só esta marca tem (um fio de luz que atravessa as seções, um portal, um selo). Ele aparece no hero e volta ao longo da página.
- **Cor de destaque em dose rara:** só em sinal, CTA e detalhes. O resto é a base.
- **Fundo nunca preto nem branco puro** (ex.: grafite `#121315`, papel `#F4F1EA`).
- **Uma camada de ambiente fixa** atrás da página (fios WebGL discretos, grão, véu de luz), sempre em nível "sussurro" e pausada durante as cenas.
- **Tipografia com personalidade:** display (nunca Inter ou Roboto como display) + texto + mono para rótulos. Um itálico serifado para destacar palavras-chave dentro dos títulos funciona muito bem.
- **Fuja dos clichês de IA:** gradiente roxo e azul, glassmorphism em tudo, emoji como ícone, cards iguais em grade sem hierarquia, "hero com mockup flutuando" genérico. Só se o usuário pedir.

O nível completo (motivos, ritmo, componentes) está em `nivel-premium.md`.

---

## 5. Piso de qualidade

- Nada pula seco: tudo com easing (curvas de saída longas, ex.: `cubic-bezier(0.16, 1, 0.3, 1)`).
- Nenhum layout shift: reserve altura de tudo que chega depois (vídeo, WebGL, componentes pesados).
- Fontes hospedadas no próprio site (`public/fonts` + `@font-face` + `preload`), nunca esperando o Google Fonts na primeira tela.
- Componentes pesados montam perto da tela (`PertoDaTela`) e efeitos de rolagem só medem o que está perto.
- Celular é um produto à parte: ver `fluidez-celular.md`.

---

## 6. Checklist de autoteste (rode inteiro antes de mostrar)

- [ ] Prints em 360, 390 e 1440 px, rolando a página inteira antes de medir.
- [ ] Nenhuma largura rola para o lado (`scrollWidth === clientWidth`).
- [ ] Cada cena: topo, meio e fim; rolar devagar e rolar rápido (flick); rolar para cima no meio da cena.
- [ ] Cena por gesto: a página solta sozinha depois do último texto; nenhum texto some antes de dar tempo de ler.
- [ ] Todo texto sobre vídeo legível no pior quadro da sua banda.
- [ ] Página carregada **sem o vídeo** (bloqueie o `.mp4`) continua completa e bonita.
- [ ] `prefers-reduced-motion`: animações paradas, estados finais visíveis.
- [ ] Celular: still e portal abrindo no **Chrome do Android e no Safari do iPhone** (comportamentos diferentes, ver `troubleshooting.md`).
- [ ] Fluidez no celular medida, não "achada" (`fluidez-celular.md`).
- [ ] Console sem erros, nenhum 404 de mídia.
- [ ] Todos os botões e links levam ao lugar certo; WhatsApp abre com a mensagem pronta.
- [ ] Gate de copy zerado (travessões, clichês, vícios de IA).
- [ ] Build oficial testado: `SITE_URL=https://dominio npm run build` gera canonical/og corretos e sem `noindex`.
- [ ] Nada de `review/` ou brutos dentro de `app/public/`.
