import { useEffect, useRef, useState, type ReactNode } from "react";

/* Monta o conteúdo só quando ele chega perto da tela (uma tela de distância) e mantém depois.
   Para efeitos pesados (WebGL, canvas) não trabalharem na abertura da página. `reserva` ocupa o mesmo espaço até lá.
   Com `soltar`, também desmonta quando a pessoa se afasta: para componentes que trabalham a cada rolagem mesmo longe da tela
   (ScrollStack e ScrollExpand mediam a página inteira a cada quadro). Longe, fica uma caixa com a última altura medida,
   então nada acima ou abaixo muda de lugar. */
export default function Perto({ children, reserva, margem = "100% 0px", soltar = false }: { children: ReactNode; reserva: ReactNode; margem?: string; soltar?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [perto, setPerto] = useState(false);
  const [altura, setAltura] = useState<number | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || (perto && !soltar)) return;
    const io = new IntersectionObserver(
      (es) => {
        const dentro = es.some((e) => e.isIntersecting);
        if (dentro && !perto) {
          setPerto(true);
          if (!soltar) io.disconnect();
        } else if (!dentro && perto && soltar) {
          setAltura(el.offsetHeight); // guarda a altura real antes de desmontar
          setPerto(false);
        }
      },
      { rootMargin: margem },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [perto, margem, soltar]);
  if (perto) return <div ref={ref}>{children}</div>;
  return <div ref={ref}>{altura !== null ? <div aria-hidden style={{ height: altura }} /> : reserva}</div>;
}
