import Lenis from "lenis";

/* Rolagem com inércia, como no Mac (Lenis). Só para mouse/trackpad no computador:
   no celular fica a rolagem nativa, que já é suave. Quem pediu menos movimento também fica com a nativa.
   Em tela de toque o Lenis NÃO pode nem ser criado: mesmo sem suavizar nada, ele escuta o toque na janela com
   passive: false, o navegador passa a esperar o JavaScript a cada movimento do dedo e a página rola aos trancos. */
let atual: Lenis | null = null;

export function iniciarRolagemSuave() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return; // só mouse/trackpad
  const lenis = new Lenis({
    lerp: 0.085, // quanto menor, mais "deslizante"
    wheelMultiplier: 1,
    smoothWheel: true,
    syncTouch: false,
    anchors: true, // links #secao também deslizam
    autoRaf: true,
  });
  atual = lenis;
  return () => {
    lenis.destroy();
    if (atual === lenis) atual = null;
  };
}

/* segura e solta a página (ex.: cena em vídeo que toca inteira com a página parada) */
export function pararRolagem() {
  atual?.stop();
}
export function soltarRolagem() {
  atual?.start();
}

/* rolar até um elemento ou posição: usa o Lenis quando existe, senão a rolagem nativa */
export function rolarAte(alvo: HTMLElement | number) {
  if (atual) atual.scrollTo(alvo, { duration: 1.2 });
  else if (typeof alvo === "number") window.scrollTo({ top: alvo, behavior: "smooth" });
  else alvo.scrollIntoView({ behavior: "smooth", block: "start" });
}
