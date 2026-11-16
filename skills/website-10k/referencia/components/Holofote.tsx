import { useSyncExternalStore, type ComponentProps } from "react";
import SpotlightCard from "@/components/ui/SpotlightCard";

/* Card com holofote (React Bits SpotlightCard, original) só onde há mouse.
   Em tela de toque o dedo que rola a página move o holofote: a cada quadro cada card redesenhava degradês, borda com
   máscara, granulado e mix-blend, e a rolagem caía para ~7 quadros por segundo em cima dos cards (medido no Android).
   No toque fica uma caixa com a mesma superfície, sombra, borda e cantos, sem o holofote. */

const mouse = typeof window === "undefined" ? null : matchMedia("(hover: hover) and (pointer: fine)");
const assinar = (avisar: () => void) => {
  mouse?.addEventListener("change", avisar);
  return () => mouse?.removeEventListener("change", avisar);
};

export default function Holofote({ className = "", style, children, spotlightColor: cor, ...resto }: ComponentProps<typeof SpotlightCard>) {
  // no servidor (pré-render) sai o SpotlightCard; no celular troca logo depois de hidratar, antes de a pessoa chegar aos cards
  const temMouse = useSyncExternalStore(assinar, () => !!mouse?.matches, () => true);
  if (temMouse) return <SpotlightCard spotlightColor={cor} className={className} style={style} {...resto}>{children}</SpotlightCard>;
  return (
    <div
      className={`relative isolate overflow-hidden rounded-3xl p-8 [background-color:var(--spotlight-card-surface)] [box-shadow:var(--spotlight-card-shadow)] ${className}`}
      style={{ ["--spotlight-card-surface" as string]: "#111111", ["--spotlight-card-shadow" as string]: "0 24px 48px -24px rgba(0, 0, 0, 0.6)", ...style }}
    >
      {children}
      <span aria-hidden className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] border border-white/[0.08]" />
    </div>
  );
}
