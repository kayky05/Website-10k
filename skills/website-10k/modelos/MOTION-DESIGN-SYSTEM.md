# <MARCA> · Design System de Motion

<!-- Modelo da skill website-10k. Copie para a raiz do repositório da LP e preencha ao fechar a direção visual
     (Fase 4/5). Vale para a LP e para tudo que vier depois: vídeos de anúncio, motion para redes, novas seções.
     Valores entre <> são exemplos de formato, troque pelos da marca. Apague estes comentários. -->

## 1. Essência

- **Em uma frase:** <o que a marca faz pelo cliente>.
- **Sensação:** <3 palavras>.
- **O que nunca é:** <ex.: barulhenta, colorida, "tech" genérica>.

## 2. Logo

- Arquivos (SVG) e onde estão: `app/public/assets/<logo>.svg`.
- Caminhos do símbolo (para animar desenhando).
- Animações permitidas do logo (ex.: desenho em traço único, 1,2 s) e as proibidas (girar, quicar).
- Área de respiro e tamanho mínimo.

## 3. Cores

| Token | Hex | Uso |
|---|---|---|
| `--canvas` | <#121315> | fundo |
| `--panel` | <#1A1B1E> | superfície |
| `--line` | <#2A2B2F> | linhas |
| `--accent` | <#356EF3> | sinal, CTA, elemento-assinatura (raro) |
| `--accent-hover` | <#5A8BFF> | hover |
| `--prestigio` | <#E8D3A6> | conquistas (opcional) |
| `--text-1` / `--text-2` | <#EEF1F7> / <#9C9EA4> | texto |

## 4. Tipografia

- Display/texto: <fonte>, pesos <400/500>.
- Destaque: <serif> itálico, só dentro de títulos (`<em>`).
- Rótulos: <mono>, caixa alta, espaçamento <0,2 em>.
- Escala (web) e proporções para vídeo.
- Composições que são a cara da marca (ex.: título grande + palavra em itálico + rótulo mono acima).

## 5. Movimento

### 5.1 Curvas (só estas)

| Nome | cubic-bezier | Quando |
|---|---|---|
| Marca | `0.4, 0, 0.1, 1` | geral, câmera |
| Saída | `0.16, 1, 0.3, 1` | entradas |
| Botão | `0.35, 0, 0, 1` | microinterações |

Equivalente em After Effects/Premiere, se for usado em vídeo.

### 5.2 Durações

| Animação | Duração | Detalhe |
|---|---|---|
| Palavras do título | <1,0 s> | <55 ms entre palavras> |
| Bloco de texto | <0,9 s> | <sobe 22 px + aparece> |
| Números | <1,4 s> | <caça-níquel, 45 ms por dígito> |
| Linha que se desenha | <1,0 s> | <250 ms depois do texto> |
| Portal | <1,3 s> | curva Saída |
| Texto na tela (vídeo) | **mínimo <4,5 s>** | tempo de leitura |

### 5.3 Regras

- Um movimento por elemento. Tudo entra uma vez. Nada pisca.
- Câmera lenta e contínua. Sem cortes secos no meio de um movimento.
- <Regra própria da cor de destaque.>

## 6. Motivos visuais

Para cada motivo: o que é, onde aparece, como se move. Ex.: fio de luz, portal, fios de fundo, brilho que passa, grão.

## 7. Imagem e cena

- Estilo das imagens e vídeos gerados (luz, hora do dia, lente, paleta).
- Prompts aprovados (ou onde estão: `review/prompts/`).
- Lista de imagens e vídeos prontos em `app/public/assets/`.

## 8. Composição

Grade, margens, áreas de segurança por formato (16:9, 9:16, 1:1), onde o texto vive em cada um.

## 9. Roteiro-base

Textos oficiais e números aprovados, para usar exatamente assim em qualquer peça.

## 10. Som

Direção sonora (se houver): ritmo, BPM, tipo de som nas transições.

## 11. Checklist antes de entregar

- [ ] Só as três curvas.
- [ ] Texto no mínimo <4,5 s> na tela.
- [ ] Cor de destaque só onde o sistema manda.
- [ ] Logo dentro das regras.
- [ ] Números e textos iguais ao roteiro-base.
