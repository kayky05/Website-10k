# <MARCA> · LP "<promessa principal>"

<!-- Modelo da skill website-10k. Copie para a raiz do repositório da LP como AGENTS.md (e crie um CLAUDE.md com a
     linha "Leia AGENTS.md antes de qualquer mudança."). Mantenha atualizado a cada decisão: é a memória do projeto
     para qualquer pessoa ou IA que pegar o trabalho depois. Apague estes comentários. -->

Contexto para quem (pessoa ou agente de IA) for mexer nesta landing page. Leia inteiro antes de mudar qualquer coisa.

- **No ar (apresentação):** <https://...pages.dev> (fora do Google até a marca liberar).
- **Domínio oficial:** <https://dominio> (publicado com `SITE_URL=https://dominio npm run build`).
- **Código:** `app/` (React 19 + Vite + TypeScript + Tailwind v4, pré-renderizado).
- **Decisões de criação:** `design-package.md`. **Movimento:** `MOTION-DESIGN-SYSTEM.md`.
- **Fonte dos fatos:** `contexto/` (textos oficiais do cliente). Nenhum número, nome ou promessa fora dele.
- **Brutos e testes:** `review/` (nunca vai para o site).

## O que é a marca

<Um parágrafo: o que vende, para quem, onde atua, a tese da página.>

## Regras do dono (não negociáveis)

1. <Idioma, tom, proibições de texto (ex.: sem travessão).>
2. <Mídia: nunca comprimir/converter.>
3. <Componentes de terceiros entram como estão.>
4. <Nada inventado: o que precisa de fonte.>
5. <Ajuste só no que foi apontado.>
6. <Compliance do nicho, se houver.>

## Rodar, testar, publicar

```bash
cd app
npm install
npm run dev                                # http://localhost:8080
npm run build                              # dist/ completo (qualquer hospedagem), fora do Google
SITE_URL=https://dominio npm run build     # versão oficial
npm run build:pages                        # só se a mídia estiver no R2 (link de apresentação)
```

Deploy do link de apresentação: `npx wrangler pages deploy dist --project-name <projeto> --branch main --commit-dirty=true`.

## Arquitetura da página

Ordem das seções (`app/src/App.tsx`): <Menu · Topo · ... · Rodapé>.

<Para cada peça especial (cenas em vídeo, portais, carrosséis, efeitos), uma linha com o arquivo e o comportamento.>

## Celular

<O que é diferente no celular e por quê (efeitos desligados, carrosséis no lugar de sticky, still no lugar do vídeo). Com números medidos, quando houver.>

## Conteúdo e decisões

<Escolhas do dono, com data: fontes, cores, componentes escolhidos numa vitrine, o que foi rejeitado e por quê.>

## Pendências

1. <Dado que falta do cliente.>
