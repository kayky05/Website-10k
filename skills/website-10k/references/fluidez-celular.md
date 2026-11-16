# Fluidez no celular

No computador quase tudo roda liso. No celular, efeitos que parecem leves derrubam a rolagem de 60 para 7 quadros por segundo. Trate o celular como um produto à parte: **o efeito que trava no celular sai do celular**, e o lugar dele recebe uma versão parada com a mesma cara.

Os números abaixo foram medidos num build real, no Chrome do Android, pelo protocolo de depuração (seção 4).

---

## 1. O que desligar ou trocar em tela de toque

| Efeito | No celular | Medido |
|---|---|---|
| Lenis (rolagem suave) | **Não criar.** Mesmo sem suavizar, ele escuta o toque com `passive: false` e a página inteira rola aos trancos. O template já faz isso | tremor na página toda |
| Card com holofote que segue o mouse (ex.: SpotlightCard) | Trocar por uma caixa igual, sem holofote. O dedo que rola move o holofote e cada quadro redesenha degradês, máscara e mix-blend | 7 → 30 fps em cima dos cards |
| Vidro líquido (ex.: GlassSurface, filtros SVG de refração) | Desligar. Vidro simples (`bg` translúcido sem `backdrop-filter`) no lugar | 30 → 60 fps parado |
| `backdrop-filter: blur()` em elementos fixos (menu) | Tirar | ganho grande em rolagem |
| SVG da altura da página que se desenha no scroll | Só no desktop | 30 → 12 fps |
| Fundo WebGL animado (ex.: Threads) | Menos linhas e **pausado enquanto o dedo rola** | |
| Zoom/escala em fotos durante o scroll | Desligar (cintila) | |
| Brilho que corre na borda de botão (ex.: StarBorder) | Só no desktop | |
| Entradas animadas (palavras, números rolando, revelar ao entrar) | Paradas, já no estado final | |
| Palco `sticky` de tela cheia com conteúdo que cresce (ex.: ScrollExpand) | Trocar por **carrossel com scroll-snap nativo** | tremia no iPhone mesmo sem foto |

Como trocar sem duplicar a página: um componente que escolhe pela capacidade do aparelho, não pela largura:

```tsx
const mouse = typeof window === "undefined" ? null : matchMedia("(hover: hover) and (pointer: fine)");
const assinar = (avisar: () => void) => { mouse?.addEventListener("change", avisar); return () => mouse?.removeEventListener("change", avisar); };
// no servidor (pré-render) sai a versão com mouse; no celular troca logo depois de hidratar
const temMouse = useSyncExternalStore(assinar, () => !!mouse?.matches, () => true);
return temMouse ? <CardComHolofote {...props} /> : <CaixaIgualSemHolofote {...props} />;
```

O componente de terceiros continua original. Quem decide é o componente da marca que envolve ele.

---

## 2. Regras de construção

- **Alturas em `lvh` ou px, nunca em `vh`, `svh` ou `innerHeight`.** A barra do navegador aparece e some durante a rolagem e muda o `innerHeight`. Medido: a página mudava 515 px de altura e pulava.
- **Componentes que medem a página a cada rolagem** (pilhas de cards, cards que crescem) montam só perto da tela **e desmontam longe**, deixando uma caixa com a última altura medida no lugar. Nada acima ou abaixo muda de lugar:

  ```tsx
  // PertoDaTela com "soltar": monta a uma tela de distância, desmonta ao se afastar e guarda a altura
  <PertoDaTela soltar reserva={<div style={{ height: 1200 }} />}><PilhaDeCards /></PertoDaTela>  // src/lib/PertoDaTela.tsx
  ```
- **Efeitos de rolagem só medem o que está perto da tela** (IntersectionObserver liga e desliga). E separam leituras de escritas: primeiro todos os `getBoundingClientRect`, depois todos os `style.setProperty`. Misturar força o navegador a recalcular o layout a cada item.
- **`setState` só quando o valor muda.** Um menu que faz `setState` em todo evento de scroll re-renderiza a cada quadro.
- **`html.lenis { overflow-anchor: none }`**: sem isso, pilhas de cards dão um pequeno tranco para trás.
- **Não use a regra `.lenis-stopped { overflow: clip }` da folha oficial do Lenis** se a página para o Lenis (cenas por gesto): a barra de rolagem some e volta.
- **Carrossel no celular = rolagem horizontal nativa** com `scroll-snap-type: x mandatory`, `overscroll-behavior-x: contain` e barra escondida. O JavaScript só descobre qual card está à vista (IntersectionObserver com `root` = o trilho) e só quando muda. Nenhum código mexe no conteúdo durante o gesto.

---

## 3. Memória no iPhone

O Safari descarta imagens quando a aba passa do limite de memória, e as fotos ficam **em branco "às vezes"**.

- **Não segure imagens decodificadas.** Para adiantar fotos que vêm depois, só baixe (`fetch(url)` para o cache), não crie `new Image()` nem chame `decode()`. Segurar quatro fotos grandes decodificadas chegou a ~166 MB.
- Vídeos em Blob saem da memória a três telas de distância (`URL.revokeObjectURL`).
- Imagens fora da tela com `loading="lazy"` e `decoding="async"`.

---

## 4. Como medir (não julgue no olho)

### Android: emulador + protocolo de depuração do Chrome

1. Android Studio → crie um AVD (ex.: Pixel, API 34 com Google Play) e ligue.
2. Abra a LP no Chrome do emulador.
3. `adb forward tcp:9222 localabstract:chrome_devtools_remote` e acesse `http://127.0.0.1:9222/json` para achar a aba.
4. Por WebSocket na aba (`webSocketDebuggerUrl`):
   - `Performance.getMetrics` antes e depois de rolar: diferença de `TaskDuration`, `ScriptDuration`, `LayoutDuration`, `RecalcStyleDuration`, `LayoutCount`.
   - `Tracing.start` com `devtools.timeline,disabled-by-default-devtools.timeline,cc,gpu,blink,v8` e some `dur` por evento e por thread (`CrRendererMain`, `Compositor`, `RasterThread`) para achar o culpado.
   - Quadros por segundo: conte `requestAnimationFrame` durante uma rolagem programada (`Input.synthesizeScrollGesture`).
5. **Não julgue fluidez pelo vídeo do emulador**: a gravação mostra ~10 fps até numa página vazia. Use os números.

### iPhone: modos de teste por link

Não dá para medir o Safari do iPhone com a mesma facilidade. Crie **modos de teste por parâmetro na URL** que desligam uma peça por vez e mande o link para o usuário comparar no aparelho dele:

```ts
// main.tsx: ?teste=fundo,menu,cards desliga cada peça por uma classe no <html>
const t = new URLSearchParams(location.search).get("teste");
t?.split(",").forEach((p) => document.documentElement.classList.add(`t-${p}`));
```

"Liso com `?teste=lista`, travando sem" é uma resposta que nenhuma auditoria dá.

### Navegador automatizado (Playwright) tem limites

Ele confirma layout, overflow e estados, mas não sente fluidez e às vezes não reproduz comportamento de toque real. Conferência final de fluidez: aparelho do usuário.
