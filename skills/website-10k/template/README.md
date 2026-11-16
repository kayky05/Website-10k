# Modelo de LP: React + Tailwind

Toda landing page nova começa copiando esta pasta. Ela já vem com React 19, Vite, TypeScript, Tailwind v4 e a estrutura do shadcn, para que qualquer componente do **21st.dev**, do **React Bits** ou do **shadcn** entre com o código original, sem adaptação.

## Começar uma LP

Cada LP vive no **seu próprio repositório** do GitHub (passo a passo na Fase 0 de `references/processo.md` da skill). Este modelo é copiado para a pasta `app/` desse repositório:

```bash
# dentro do repositório novo da LP (ex.: lp-<marca>/)
cp -r <pasta-da-skill>/template app
cd app
npm install
npm run dev        # http://localhost:8080
```

No Windows, se o PowerShell reclamar, use `npm.cmd` e `npx.cmd`.

## Onde fica cada coisa

```
<marca>/app/
├── index.html                ← head: título, description, og tags (DEPLOY STEP), fontes
├── public/                   ← arquivos servidos como estão: assets/ (fotos, vídeos, logo), robots.txt, sitemap.xml
├── src/
│   ├── App.tsx               ← monta a página: uma seção embaixo da outra
│   ├── sections/             ← uma seção da LP por arquivo (Topo, Prova, Coberturas, CTA...)
│   ├── components/ui/        ← componentes copiados do 21st.dev, React Bits e shadcn (código original)
│   ├── components/           ← componentes próprios da marca que usam os de ui/
│   ├── lib/utils.ts          ← cn() do shadcn
│   ├── index.css             ← Tailwind + tokens de cor do shadcn (trocar pelas cores da marca)
│   ├── main.tsx              ← entrada no navegador
│   └── entry-server.tsx      ← usado só no build, para gerar o HTML pronto
├── components.json           ← configuração do shadcn (inclui o registro do React Bits)
└── prerender.mjs             ← coloca o HTML pronto no dist/index.html
```

## Rolagem suave (Lenis): padrão

Toda LP já vem com rolagem com inércia, como no Mac (`src/lib/rolagemSuave.ts`, ligada no `App.tsx`). No computador a página desliza e desacelera aos poucos; no celular fica a rolagem nativa do aparelho. Quem pede menos movimento no sistema também fica com a nativa.

- **Em tela de toque o Lenis nem é criado** (só com `(hover: hover) and (pointer: fine)`). Mesmo sem suavizar, ele escuta o toque com `passive: false` e a página inteira passa a rolar aos trancos no celular.
- **Segurar a página** (ex.: uma cena em vídeo que toca inteira com a página parada): `pararRolagem()` e `soltarRolagem()`.

- **Rolar até uma seção por código:** usar `rolarAte(elemento)` ou `rolarAte(0)` de `@/lib/rolagemSuave`, não `scrollIntoView` nem `window.scrollTo` com `behavior: "smooth"` (eles brigam com o Lenis). Links `href="#secao"` já deslizam sozinhos.
- **Áreas com rolagem própria** (chat, lista com barra, modal): colocar `data-lenis-prevent` no elemento, senão a rodinha rola a página em vez da área.
- **Não usar `html { scroll-behavior: smooth }`** no CSS da LP.
- **Ajustar a sensação:** `lerp` em `rolagemSuave.ts` (menor = mais deslizante, maior = mais firme; padrão 0.085).

## Adicionar componentes

**21st.dev:** o prompt "integrate an existing React component" que o site entrega já serve.
1. **Pegar o código:** na página do componente, botão **Copy prompt**. Ele só funciona **logado** no 21st.dev; deslogado, copia nada. O link `npx shadcn add "https://21st.dev/r/..."` precisa de chave (`API_KEY_21ST`, gerada em https://21st.dev/mcp); sem ela dá "Authentication required".
2. **Procurar componentes sem abrir o navegador:** toda página tem versão em texto com `.md` no fim, ex.: `https://21st.dev/community/components/s/navbar.md` (lista por tema) e `https://21st.dev/@autor/components/nome.md` (página do componente).
3. Salvar o arquivo do componente em `src/components/ui/<nome>.tsx`, sem mudar o código. Às vezes o arquivo principal do prompt é um exemplo vazio e o componente de verdade está no `demo.tsx`: usar o de verdade.
4. Instalar as dependências que o prompt lista, com versão exata: `npm install --save-exact <pacote>@<versão>`.
5. Usar o componente numa seção de `src/sections/`.

**React Bits:** usar sempre a versão **TS + Tailwind** (`-TS-TW`). Vários de uma vez:
```bash
npx shadcn@latest add @react-bits/MagicBento-TS-TW @react-bits/CountUp-TS-TW --yes
```
- O shadcn salva em `src/components/`: **mover para `src/components/ui/`**.
- O shadcn grava as dependências com `^`: **trocar por versão exata** no `package.json`.
- Se entrar `motion` e `framer-motion` juntos, deixar o `framer-motion` na mesma versão que o `motion` usa, senão o site carrega a biblioteca duas vezes (`npm ls framer-motion` tem que mostrar "deduped").
- Para ver as props antes de instalar: `https://reactbits.dev/r/<Nome>-TS-TW.json` (o código vem dentro). Também dá para baixar do repositório `DavidHDev/react-bits`, em `src/ts-tailwind/Components/<Nome>/<Nome>.tsx`.

**shadcn:**
```bash
npx shadcn@latest add button
```

Ícones: `lucide-react` já está instalado. Componentes que pedem outro pacote de ícones (ex.: `@hugeicons/react`) instalam o deles.

## Regras que valem para todo componente

- **Código original.** O componente entra como veio. Só muda o que a LP precisa por props ou por `className`, nunca reescrevendo o componente por dentro. Se o usuário pedir "o mesmo", não trocar tema, formato nem cores por conta própria.
- **Ajustar por fora quando faltar opção no componente:**
  - classes do Tailwind com seletor no `className` (ex.: `[&_button]:px-3` ou `[&_button[aria-label^=Switch]]:hidden` para esconder um botão);
  - variáveis de CSS que o componente expõe (ex.: MagicBento: `.magic-bento__card{--mb-surface:...}`);
  - elemento extra dentro do componente com `createPortal` (ex.: logo dentro da navbar);
  - comportamento que falta (ex.: botões que não navegam) com um `useEffect` no componente da marca que envolve o original.
- **Pesado (WebGL, 3D, vídeo, componentes grandes como o MagicBento): carregar só quando chegar perto.** Usar `src/lib/PertoDaTela.tsx` + `React.lazy`:
  ```tsx
  const Bento = lazy(() => import("@/components/CoberturasBento"));
  <PertoDaTela reserva={<VersaoSimplesComOMesmoTexto />}><Bento /></PertoDaTela>
  ```
  A `reserva` vai no HTML pronto: o Google lê o texto e a página não pula quando o componente chega. Numa LP real isso tirou 45 KB do carregamento inicial.
- **Efeitos que mexem no DOM** (`document.querySelector`, listeners) rodam dentro de `useEffect`, nunca no corpo do componente, porque o build também renderiza a página no servidor.
- **Sem `React.StrictMode`** em LP com efeitos que montam uma vez só (ele roda os efeitos duas vezes em desenvolvimento).
- **CSS próprio da LP fica numa camada abaixo das classes do Tailwind**, senão ele ganha das classes dos componentes (ex.: botões da navbar aparecendo pretos com borda branca):
  ```css
  @layer theme, base, site, utilities;
  @import "./styles/site.css" layer(site);
  ```

## Testar antes de mostrar

- **Larguras: 360, 390 e 1440 px.** Em nenhuma a página pode rolar para o lado (`document.documentElement.scrollWidth` igual a `clientWidth`). Rolar a página inteira antes de medir, porque componentes que entram depois (lazy) também vazam.
- Culpados comuns de vazamento: brilho externo de cards (BorderGlow) e coisas com largura fixa (cartão de 320 px num celular de 360). Correção: `overflow-x: clip` na seção, ou `max-width: 100%` e `grid-template-columns: minmax(0,1fr)` no contêiner.
- **Uma LP por porta.** Antes de `npm run dev`, ver se a porta está livre; se outra LP estiver na 8080, usar outra (`npx vite --port 8095 --strictPort`).
- **Medir velocidade com a máquina parada.** Lighthouse rodando enquanto outra LP compila dá números falsos (ex.: 6 s de travamento que não se repetiram). Medir no build (`npm run build` + `npm run preview`), não no `npm run dev`.

## Publicar

```bash
npm run build                                # versão de apresentação: dist/ pronto, fora do Google
SITE_URL=https://dominio.com.br npm run build # versão oficial: endereço trocado e Google liberado
npm run preview                              # confere o dist/ em http://localhost:8080
```

No Windows (cmd): `set SITE_URL=https://dominio.com.br && npm run build`.

- **Não edite o endereço à mão.** O `index.html`, o `robots.txt` e o `sitemap.xml` usam `https://SEU-DOMINIO`; o `prerender.mjs` troca pelo `SITE_URL` em UTF-8 (localizar/substituir pelo terminal costuma estragar os acentos).
- **Sem `SITE_URL` a página sai com `noindex`** e `robots.txt` bloqueado: é o certo para o link de apresentação ao cliente, e errado para o domínio oficial.

- **Cloudflare Pages:** `npx wrangler pages deploy dist --project-name <projeto> --branch main`
- **Hostinger:** zipar o **conteúdo** de `dist/` e subir.

Só o `dist/` vai ao ar. `node_modules/` e `dist/` não entram no Git.

### Mídia no Cloudflare R2 (só quando pedido)

Para hospedar imagens e vídeos no R2 (arquivos originais, sem compressão) e deixar o Pages só com o código, ou quando um vídeo passar de 25 MB (limite por arquivo do Pages): copie o kit de `r2/` para o projeto e siga `references/r2-midia.md` da skill. As URLs do site não mudam (`/assets/...` continua igual). O link de apresentação passa a ser publicado com `npm run build:pages`; o `npm run build` continua gerando o `dist/` completo para qualquer outra hospedagem.
