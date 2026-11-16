import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import efeitosPagina from "@/effects/pagina";
import TopoExemplo from "@/sections/TopoExemplo";

/* Exemplo de App da LP de referência: a ordem das seções muda a cada marca; o que vale copiar é a regra do Lenis. */
export default function App() {
  useEffect(() => efeitosPagina(), []);

  // scroll com inércia (Lenis), só com mouse ou trackpad. Quem pediu menos movimento fica com o scroll normal.
  // Em tela de toque o Lenis não suaviza nada, mas escuta o toque na janela com passive: false: o navegador
  // esperava o JavaScript a cada movimento do dedo e a página inteira rolava aos trancos.
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    // sensação de trackpad: curva exponencial de 1,2 s, sem limite por giro
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      anchors: { offset: 0 },
    });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis; // as cenas em vídeo seguram e soltam a página por aqui
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return (
    <main>
      <TopoExemplo />
      {/* demais seções da marca, uma por arquivo em src/sections/ */}
    </main>
  );
}
