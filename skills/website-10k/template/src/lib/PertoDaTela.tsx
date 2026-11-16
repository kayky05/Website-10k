import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";

/* Monta o conteúdo só quando a pessoa chega perto dele (o código do componente só baixa nessa hora).
   Antes disso fica o "reserva", que já vem no HTML pronto: o Google lê e a página não pula.
   Com `soltar`, também desmonta quando a pessoa se afasta: para componentes que trabalham a cada rolagem mesmo
   longe da tela (pilhas de cards, cards que crescem, WebGL). Longe, fica uma caixa com a última altura medida,
   então nada acima ou abaixo muda de lugar. */
export default function PertoDaTela({ children, reserva, margem = "900px", soltar = false }: { children: ReactNode; reserva: ReactNode; margem?: string; soltar?: boolean }) {
  const lugar = useRef<HTMLDivElement>(null);
  const [perto, setPerto] = useState(false);
  const [altura, setAltura] = useState<number | null>(null);
  useEffect(() => {
    const el = lugar.current;
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
      { rootMargin: `${margem} 0px` },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [perto, margem, soltar]);
  if (perto) return <div ref={lugar}><Suspense fallback={reserva}>{children}</Suspense></div>;
  return <div ref={lugar}>{altura !== null ? <div aria-hidden style={{ height: altura }} /> : reserva}</div>;
}
