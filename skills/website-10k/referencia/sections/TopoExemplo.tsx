import ScrollVideo from "@/components/ScrollVideo";
import { Palavras } from "@/components/Editorial";

/* Exemplo de topo com cena em vídeo, abertura de marca e capítulos.
   As faixas (data-band="início fim") seguem o TEMPO do vídeo, em fração de 0 a 1.
   Cada texto tem relógio próprio no ScrollVideo: no mínimo 4,5 s na tela.
   Troque os textos, as mídias e os traços do logo pelos da marca. */

function Faixa({ band, rotulo, titulo, apoio }: { band: string; rotulo: string; titulo: React.ReactNode; apoio?: string }) {
  return (
    <div data-band={band} className="lp-pad absolute inset-y-0 left-0 right-0 flex flex-col justify-center opacity-0 [&>*]:max-w-[900px]" style={{ visibility: "hidden" }}>
      <p className="lp-eyebrow lp-over-video">{rotulo}</p>
      <h2 className="lp-display lp-over-video mt-8 text-white">
        <Palavras>{titulo}</Palavras>
      </h2>
      {apoio && <p className="lp-intro lp-over-video mt-8 max-w-[34ch]">{apoio}</p>}
    </div>
  );
}

/* Abertura de marca: a primeira tela mostra só o logo, que se desenha traço por traço como um fio de luz e acende.
   Cada traço é um <path pathLength={1}> com --i (ordem). Os traços vêm do SVG oficial da marca: nunca redesenhe o logo.
   Logo só em imagem? Veja "Logo sem vetor" em references/padrao.md.
   A animação roda quando o pai ganha .is-in (a faixa do vídeo) ou direto no celular; CSS em cena.css (.lp-marca-hero). */
const tracos = [
  // EXEMPLO: troque pelos traços do logo da marca (um path por letra ou por parte do símbolo)
  "M10 10 H50 V50 H10 Z",
  "M70 10 V50",
  "M90 10 L130 50 M130 10 L90 50",
];

function MarcaHero({ className }: { className?: string }) {
  return (
    <div className={`lp-marca-hero flex flex-col items-center gap-7 ${className ?? ""}`}>
      <svg viewBox="0 0 140 60" fill="none" role="img" aria-label="Nome da marca" className="lp-marca-desenho h-auto w-[min(62vw,520px)] overflow-visible">
        <g strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {tracos.map((d, i) => (
            <path key={i} d={d} pathLength={1} stroke={i === 0 ? "var(--lp-accent)" : "currentColor"} style={{ ["--i" as string]: i }} />
          ))}
        </g>
      </svg>
      <p className="lp-eyebrow lp-marca-linha lp-over-video text-center">Frase curta da marca</p>
    </div>
  );
}

export default function TopoExemplo() {
  return (
    <ScrollVideo
      id="topo"
      prioridade
      src="/assets/topo.mp4"
      srcReverso="/assets/topo-rev.mp4"
      poster="/assets/topo-inicio.jpg"
      // a imagem fixa do computador é o PRIMEIRO quadro do vídeo: é a mesma tela em que a cena começa,
      // então nada troca entre o HTML do build e o vídeo (com o quadro final aqui, o reload piscava)
      still="/assets/topo-inicio.jpg"
      stillAlt="Descrição do primeiro quadro da cena"
      velocidade={1}
      // celular: imagem vertical própria (9:16), com área escura e calma no terço de baixo para o título
      stillCelular="/assets/topo-celular.jpg"
      escurecerCelular={false}
      blocoCelular="50% 50%"
      aspectoBloco="9 / 16"
      staticContent={
        <div className="lp-pad relative flex min-h-[100svh] flex-col justify-end pb-24 pt-32 lg:justify-center">
          <MarcaHero className="is-in mb-10 !items-start [&_svg]:w-[min(56vw,260px)] [&_.lp-marca-linha]:hidden" />
          <h1 data-words className="lp-display lp-over-video max-w-[14ch] text-white">
            <Palavras>Promessa principal da página</Palavras>
          </h1>
          <p className="lp-intro lp-over-video mt-8 max-w-[34ch]">Uma frase com a prova e o motivo para continuar.</p>
        </div>
      }
    >
      {/* abertura: só o logo, no centro, sobre o primeiro quadro; no primeiro gesto o vídeo segue e entra o título */}
      <div data-band="0 0.06" className="absolute inset-0 flex items-center justify-center opacity-0" style={{ visibility: "hidden" }}>
        <MarcaHero />
      </div>
      <Faixa band="0.08 0.3" rotulo="Capítulo 01" titulo="Promessa principal da página" apoio="Frase de apoio, nas palavras do público." />
      <Faixa band="0.36 0.62" rotulo="Capítulo 02" titulo="O segundo momento da história" />
      <Faixa band="0.7 0.98" rotulo="Capítulo 03" titulo="Onde a cena repousa" />
    </ScrollVideo>
  );
}
