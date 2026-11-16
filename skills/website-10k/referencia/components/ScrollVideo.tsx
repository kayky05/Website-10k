import { useEffect, useRef, useState, type ReactNode } from "react";
import type Lenis from "lenis";
import { cn } from "@/lib/utils";

/* Cena em vídeo disparada pelo scroll.
   - Um gesto para baixo com a cena na tela: a página segura a cena e o vídeo toca inteiro até o fim, sozinho.
     Rolar mais durante o play acelera o vídeo. Um gesto para cima: a cena volta inteira em reverso.
     Quando o vídeo termina, a página solta e o próximo gesto segue para a próxima seção.
   - O reverso usa uma cópia invertida do vídeo (srcReverso), então os dois sentidos são play nativo, liso.
   - Faixas de texto: filhos com data-band="início fim" em fração do TEMPO do vídeo; aparecem no momento certo da cena.
   - A página nasce no modo estático (imagem + texto fixo), completa mesmo sem vídeo. Celular, movimento reduzido,
     economia de dados, file:// e falha do vídeo continuam no estático. */

type Props = {
  id?: string;
  src: string;
  srcReverso?: string;
  poster: string; // primeiro quadro, por baixo do vídeo enquanto carrega
  still: string; // quadro final, usado no modo estático
  stillAlt: string;
  prioridade?: boolean; // só a cena do topo: a imagem fixa é a primeira tela no celular
  children: ReactNode; // as faixas de texto do modo vídeo
  staticContent: ReactNode; // o texto do modo estático
  className?: string;
  stillPosition?: string;
  // celular (modo foto): a foto vira um bloco 4:5 no alto da cena, com este enquadramento, e o texto vem abaixo,
  // sobre o grafite liso. Sem isto, a foto é o fundo da cena inteira com o texto por cima
  blocoCelular?: string;
  aspectoBloco?: string; // proporção do bloco da foto no celular (padrão 4 / 5)
  // celular (modo foto): outra imagem no lugar do quadro final do vídeo (ex.: uma imagem vertical feita para o celular), e se a foto
  // escurece por inteiro (padrão) ou fica limpa, com o texto sobre a parte escura da própria imagem
  stillCelular?: string;
  escurecerCelular?: boolean;
  velocidade?: number; // velocidade base do play e do reverso
  ramp?: number; // rampa de entrada e saída das faixas, em fração do vídeo
};

const MAX_RATE = 2.5;
const LEITURA_MS = 4500; // tempo mínimo, em ms reais, que cada texto fica na tela (o vídeo segue em 1x)

function lenisGlobal(): Lenis | undefined {
  return (window as unknown as { __lenis?: Lenis }).__lenis;
}

// portal: entrando, a cena abre em círculo a partir do centro do topo (onde chega a ponta do fio);
// saindo, fecha num ponto no centro de baixo (de onde o fio renasce).
// Serve às duas formas da cena: o vídeo (seção da altura da tela) e a foto do celular (seção que pode ser mais alta):
// a saída só começa quando a base da seção sobe acima da base da tela.
function pintarPortal(s: HTMLElement, est: { chave: string }) {
  const caixa = s.getBoundingClientRect();
  const vh = innerHeight;
  const bruto = caixa.top;
  // zona morta: encaixada na tela, a posição oscila frações de pixel em volta do zero;
  // sem isso o degradê pulava entre cima, baixo e nada a cada quadro (a "tremida" no início e no fim do vídeo)
  const t = Math.abs(bruto) < 3 ? 0 : bruto;
  const e = t < 0 ? -t - Math.max(0, caixa.height - vh) : 0; // quanto a cena já saiu por cima
  let r = 170;
  let oy = "0%";
  if (t > 0) r = Math.min(1, Math.max(0, 1 - t / (vh * 0.62))) * 170;
  else if (e > 0) {
    r = (1 - Math.min(1, Math.max(0, e / (vh * 0.85)))) * 170;
    oy = "100%";
  }
  r = Math.round(r * 10) / 10;
  // bordas macias: a beirada da cena que está dentro da tela se dissolve no grafite,
  // e o degradê cresce conforme a cena entra (topo) ou sai (base). Parada na tela, sem degradê.
  // contínuo a partir do zero: sem degrau ao encaixar ou ao soltar a cena
  const ft = t > 0 ? Math.min(vh * 0.32, t * 1.2) : 0;
  const fb = e > 0 ? Math.min(vh * 0.36, e * 1.2) : 0;
  const chave = `${r}|${Math.round(ft)}|${Math.round(fb)}`;
  if (chave === est.chave) return;
  est.chave = chave;
  s.style.setProperty("--r", String(r));
  s.style.setProperty("--oy", oy);
  s.style.setProperty("--ft", `${Math.round(ft)}px`);
  s.style.setProperty("--fb", `${Math.round(fb)}px`);
  s.dataset.portal = r >= 169.9 && ft === 0 && fb === 0 ? "aberto" : r <= 0.1 ? "fechado" : "abrindo";
}

export default function ScrollVideo({
  id,
  src,
  srcReverso,
  poster,
  still,
  stillAlt,
  prioridade = false,
  children,
  staticContent,
  className,
  stillPosition = "center",
  blocoCelular,
  aspectoBloco = "4 / 5",
  stillCelular,
  escurecerCelular = true,
  velocidade = 1,
  ramp = 0.035,
}: Props) {
  const [mode, setMode] = useState<"static" | "loading" | "video">("static");
  const [loaded, setLoaded] = useState(0);
  // "pendente": ainda não se sabe se a cena vai tocar o vídeo (o HTML do build e a primeira pintura vêm sempre no modo
  // estático). O CSS usa isso para não mostrar a foto e os textos do modo estático por meio segundo e trocar em seguida
  const [pendente, setPendente] = useState(true);
  const sec = useRef<HTMLElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const rev = useRef<HTMLVideoElement>(null);
  const bandsRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const fotoRef = useRef<HTMLDivElement>(null);
  const anelRef = useRef<HTMLDivElement>(null);

  // carregamento + as condições do modo estático, vigiadas ao vivo
  useEffect(() => {
    const wide = matchMedia("(min-width: 900px)");
    const calm = matchMedia("(prefers-reduced-motion: reduce)");
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let url = "";
    let urlRev = "";
    let busy = false;
    let abort: AbortController | null = null;
    // o vídeo só baixa quando a pessoa chega a uma tela de distância,
    // e sai da memória quando ela se afasta mais de três telas (volta a carregar se ela voltar)
    let near = false;
    let resolveNear: () => void = () => {};
    let nearP = new Promise<void>((ok) => (resolveNear = ok));
    const io = new IntersectionObserver(
      (es) => {
        if (!es.some((e) => e.isIntersecting)) {
          setPendente(false); // longe da tela: fica a foto até a pessoa chegar perto
          return;
        }
        near = true;
        resolveNear();
        load();
      },
      { rootMargin: "100% 0px 100% 0px" },
    );
    const ioLonge = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) return;
        descarregar();
      },
      { rootMargin: "300% 0px 300% 0px" },
    );
    if (sec.current) {
      io.observe(sec.current);
      ioLonge.observe(sec.current);
    }
    const descarregar = () => {
      if (!url && !busy) return;
      abort?.abort();
      for (const el of [vid.current, rev.current]) {
        if (!el) continue;
        el.pause();
        el.removeAttribute("src");
        el.load();
      }
      if (url) URL.revokeObjectURL(url);
      if (urlRev) URL.revokeObjectURL(urlRev);
      url = "";
      urlRev = "";
      near = false;
      nearP = new Promise<void>((ok) => (resolveNear = ok));
      setLoaded(0);
      setMode("static");
    };

    const wantsStatic = () => !wide.matches || calm.matches || !!conn?.saveData || location.protocol === "file:";

    const baixar = async (u: string, onProgress?: (k: number) => void) => {
      const res = await fetch(u, { signal: abort!.signal });
      if (!res.ok || !res.body) throw new Error(String(res.status));
      const total = Number(res.headers.get("content-length")) || 0;
      const reader = res.body.getReader();
      const parts: Uint8Array[] = [];
      let got = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        parts.push(value);
        got += value.length;
        if (total && onProgress) onProgress(got / total);
      }
      return URL.createObjectURL(new Blob(parts as BlobPart[], { type: "video/mp4" }));
    };
    const pronto = (v: HTMLVideoElement) =>
      new Promise<void>((ok, fail) => {
        if (v.readyState >= 2) return ok();
        v.addEventListener("loadeddata", () => ok(), { once: true });
        v.addEventListener("error", () => fail(new Error("video")), { once: true });
      });

    const load = async () => {
      if (wantsStatic()) {
        abort?.abort();
        setMode("static");
        setPendente(false);
        return;
      }
      if (url) {
        setMode("video");
        setPendente(false);
        return;
      }
      if (busy) return;
      if (!near) return; // o observador chama de novo quando a pessoa chegar perto
      busy = true;
      setMode("loading");
      abort = new AbortController();
      try {
        // os dois vídeos chegam antes da cena ligar: o reverso precisa estar pronto no primeiro gesto para cima
        const [a, b] = await Promise.all([
          baixar(src, (k) => setLoaded(srcReverso ? k * 0.6 : k)),
          srcReverso ? baixar(srcReverso, (k) => setLoaded((x) => Math.max(x, 0.6 + k * 0.4))) : Promise.resolve(""),
        ]);
        url = a;
        urlRev = b;
        vid.current!.src = url;
        if (urlRev && rev.current) rev.current.src = urlRev;
        await Promise.all([pronto(vid.current!), urlRev && rev.current ? pronto(rev.current) : Promise.resolve()]);
        if (!wantsStatic()) {
          setMode("video");
          setPendente(false);
        }
      } catch {
        if (!abort?.signal.aborted) {
          setMode("static"); // falhou: fica a imagem, a página continua inteira
          setPendente(false);
        }
      } finally {
        busy = false;
      }
    };

    load();
    wide.addEventListener("change", load);
    calm.addEventListener("change", load);
    return () => {
      wide.removeEventListener("change", load);
      calm.removeEventListener("change", load);
      io.disconnect();
      ioLonge.disconnect();
      abort?.abort();
      if (url) URL.revokeObjectURL(url);
      if (urlRev) URL.revokeObjectURL(urlRev);
    };
  }, [src, srcReverso]);

  // o motor da cena
  useEffect(() => {
    if (mode !== "video") return;
    const s = sec.current!;
    const v = vid.current!;
    const r = srcReverso ? rev.current : null;
    const f = frameRef.current!;
    const D = v.duration;
    // faixas de texto (as que se leem) têm relógio próprio: entram quando o vídeo chega no trecho delas e
    // ficam no mínimo LEITURA_MS na tela; a próxima só entra depois. O vídeo nunca desacelera por causa delas.
    // Faixas decorativas (aria-hidden, ex.: "role para ver") seguem o tempo do vídeo.
    const bands = Array.from(bandsRef.current!.querySelectorAll<HTMLElement>("[data-band]")).map((el) => {
      const [a, b] = el.dataset.band!.split(" ").map(Number);
      const ler = el.getAttribute("aria-hidden") !== "true";
      return { el, a, b, last: -1, ler };
    });
    const leitura = bands.filter((b) => b.ler);
    const extras = bands.filter((b) => !b.ler);
    let atual = -2; // -2: ainda não pintou nada
    let fimPendente: 1 | -1 | 0 = 0;
    let desde = 0;
    const FIM = D - 0.04;
    const ease = (x: number) => x * x * (3 - 2 * x);
    v.style.transition = "none";

    let dir: 1 | -1 | 0 = 0;
    let ativo: "f" | "r" = "f";
    let trocando = false;
    let shown = 0;
    let rate = velocidade;
    let travado = false;
    let raf = 0;
    let lastT = 0;
    let lastBand = -1;

    const top = () => s.getBoundingClientRect().top;
    // avisa o menu quando esta cena ocupa a tela, para ele sair e o foco ficar no vídeo
    let ocupando = false;
    const avisar = () => {
      const t = top();
      const agora = t > -innerHeight * 0.5 && t < innerHeight * 0.5;
      if (agora === ocupando) return;
      ocupando = agora;
      dispatchEvent(new CustomEvent("lp:cena", { detail: { id: s, ativa: agora } }));
    };
    const naCena = () => {
      const t = top();
      return t > -innerHeight * 0.45 && t < innerHeight * 0.35;
    };

    const mostrar = (band: (typeof bands)[number], on: boolean) => {
      band.el.style.transition = `opacity .7s var(--lp-ease), transform .7s var(--lp-ease), visibility 0s linear ${on ? "0s" : ".7s"}`;
      band.el.style.opacity = on ? "1" : "0";
      band.el.style.transform = on ? "none" : "translate3d(0, 18px, 0)";
      band.el.style.visibility = on ? "visible" : "hidden";
      band.el.classList.toggle("is-in", on); // as palavras do capítulo sobem quando ele aparece
    };
    // devolve true enquanto houver troca de texto esperando o tempo mínimo (o motor continua acordado)
    const paintBands = (k: number, agora: number) => {
      if (Math.abs(k - lastBand) >= 0.0008) {
        lastBand = k;
        for (const band of extras) {
          const fadeIn = band.a <= 0 ? 1 : ease(Math.min(1, Math.max(0, (k - band.a) / ramp)));
          const fadeOut = band.b >= 1 ? 1 : ease(Math.min(1, Math.max(0, (band.b - k) / ramp)));
          const o = Math.round(Math.min(fadeIn, fadeOut) * 1000) / 1000;
          if (o === band.last) continue;
          band.last = o;
          band.el.style.opacity = String(o);
          band.el.style.visibility = o === 0 ? "hidden" : "visible";
        }
      }
      let quer = -1;
      leitura.forEach((band, i) => {
        if (k >= band.a && (k <= band.b || band.b >= 1)) quer = i;
      });
      if (quer === atual) return false;
      if (atual >= 0 && agora - desde < LEITURA_MS) return true; // o texto da tela ainda não cumpriu o tempo
      if (atual >= 0) mostrar(leitura[atual], false);
      else if (atual === -2) leitura.forEach((band, i) => i !== quer && mostrar(band, false));
      if (quer >= 0) mostrar(leitura[quer], true);
      atual = quer;
      desde = agora;
      return false;
    };

    // segura a página na cena enquanto o vídeo toca
    const travar = () => {
      if (travado) return;
      travado = true;
      const lenis = lenisGlobal();
      const alvo = s.getBoundingClientRect().top + scrollY;
      if (lenis) {
        // no quadro seguinte, para vencer o próprio gesto da pessoa, que o Lenis também está tratando
        requestAnimationFrame(() => {
          if (!travado) return;
          lenis.scrollTo(alvo, { duration: 0.5, lock: true, force: true });
          setTimeout(() => {
            if (!travado) return;
            // encaixe exato pelo próprio Lenis (um scrollTo nativo deixava o Lenis defasado e a página pulava ao soltar)
            if (Math.abs(scrollY - alvo) > 0.5) lenis.scrollTo(alvo, { immediate: true, force: true });
            lenis.stop();
          }, 540);
        });
      } else {
        scrollTo({ top: alvo, behavior: "smooth" });
        document.documentElement.style.overflow = "hidden";
      }
    };
    const soltar = () => {
      if (!travado) return;
      travado = false;
      const lenis = lenisGlobal();
      if (lenis) lenis.start();
      else document.documentElement.style.overflow = "";
    };

    // troca o vídeo da tela: posiciona o outro no mesmo quadro e só mostra quando o quadro chegou
    const trocar = (para: "f" | "r", depois: () => void) => {
      if (ativo === para) return depois();
      if (trocando) return;
      const alvo = para === "f" ? v : r!;
      const outro = para === "f" ? r : v;
      trocando = true;
      outro?.pause();
      const pos = para === "f" ? shown : D - shown;
      const ok = () => {
        alvo.style.opacity = "1";
        if (outro) outro.style.opacity = "0";
        ativo = para;
        trocando = false;
        depois();
      };
      if (Math.abs(alvo.currentTime - pos) < 0.03) ok();
      else {
        alvo.addEventListener("seeked", ok, { once: true });
        alvo.currentTime = pos;
      }
    };

    const tocar = (d: 1 | -1) => {
      if (d === 1 && shown >= FIM) return;
      if (d === -1 && shown <= 0.04) return;
      if (dir === d) {
        rate = Math.min(MAX_RATE, rate + 0.25); // mais scroll durante o play acelera, com calma
        return;
      }
      dir = d;
      fimPendente = 0;
      delete f.dataset.fim; // saiu do último quadro: o que depende dele some
      delete s.dataset.fim;
      travar();
      if (d === 1) trocar("f", () => v.play().catch(() => {}));
      else if (r) trocar("r", () => r.play().catch(() => {}));
      else v.pause();
      wake();
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = lastT ? Math.min(0.1, (now - lastT) / 1000) : 1 / 60;
      lastT = now;
      if (dir !== 0) {
        rate += (velocidade - rate) * Math.min(1, dt * 1.4); // a aceleração do scroll volta suave para 1x
        const el = ativo === "f" ? v : r;
        if (el && !trocando) el.playbackRate = rate;
        if (!trocando) {
          if (dir === 1 && ativo === "f") shown = v.currentTime;
          else if (dir === -1 && r && ativo === "r") shown = D - r.currentTime;
          else if (dir === -1 && !r) {
            // sem cópia invertida: volta por saltos
            shown = Math.max(0, shown - rate * dt);
            if (!v.seeking) v.currentTime = shown;
          }
        }
        if ((dir === 1 && shown >= FIM) || (dir === -1 && shown <= 0.04)) {
          v.pause();
          r?.pause();
          shown = dir === 1 ? D : 0;
          fimPendente = dir; // solta a página quando o último texto já tiver entrado
          dir = 0;
          rate = velocidade;
        }
      }
      const esperando = paintBands(Math.min(1, Math.max(0, shown / D)), now);
      if (fimPendente && !esperando) {
        // terminou de verdade: vídeo no fim e textos em dia. Aparece o "role para continuar" e a página solta
        if (fimPendente === 1) {
          f.dataset.fim = "1";
          s.dataset.fim = "1";
        }
        fimPendente = 0;
        soltar();
      }
      if (dir !== 0 || trocando || esperando) raf = requestAnimationFrame(tick);
      else lastT = 0;
    };
    function wake() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    // gestos: rodinha e toque. Só valem com a cena na tela.
    const gesto = (dy: number) => {
      if (Math.abs(dy) < 2) return;
      if (dir !== 0) {
        tocar(dy > 0 ? 1 : -1); // durante o play: mesmo sentido acelera, sentido oposto inverte
        return;
      }
      if (!naCena()) return;
      if (dy > 0 && shown < FIM) tocar(1);
      else if (dy < 0 && shown > 0.04 && top() > -innerHeight * 0.45) tocar(-1);
    };
    const onWheel = (e: WheelEvent) => gesto(e.deltaY);
    let ty = 0;
    const onTouchStart = (e: TouchEvent) => (ty = e.touches[0].clientY);
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      gesto(ty - y);
      ty = y;
    };
    // teclado ou barra de rolagem: se a página passar pela cena descendo com o vídeo no começo, a cena toca
    const est = { chave: "" };
    const portal = () => pintarPortal(s, est);
    const onScroll = () => {
      portal();
      avisar();
      if (dir === 0 && !travado && shown < 0.04) {
        const t = top();
        if (t < -8 && t > -innerHeight * 0.3) tocar(1);
      }
    };

    addEventListener("wheel", onWheel, { passive: true });
    addEventListener("touchstart", onTouchStart, { passive: true });
    addEventListener("touchmove", onTouchMove, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    paintBands(0, performance.now());
    portal();
    avisar();
    return () => {
      removeEventListener("wheel", onWheel);
      removeEventListener("touchstart", onTouchStart);
      removeEventListener("touchmove", onTouchMove);
      removeEventListener("scroll", onScroll);
      delete s.dataset.portal;
      if (ocupando) dispatchEvent(new CustomEvent("lp:cena", { detail: { id: s, ativa: false } }));
      cancelAnimationFrame(raf);
      soltar();
    };
  }, [mode, ramp, velocidade, srcReverso]);

  // celular (modo foto): o portal abre sozinho quando a foto chega na tela e fecha quando ela sai. É uma animação
  // própria (clip-path + anel, no CSS), não segue o dedo: no iPhone a máscara recalculada a cada quadro da rolagem
  // era redesenhada aos saltos ("pula pixels") e chegava a esconder a foto
  useEffect(() => {
    if (mode !== "static" || !matchMedia("(max-width: 899px)").matches) return;
    const foto = fotoRef.current;
    const anel = anelRef.current;
    if (!foto || !anel) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= 0.2) {
          if (foto.hasAttribute("data-aberto")) return;
          // o anel acompanha a borda do círculo: circle(150%) tem raio 1,5 × diagonal / √2
          const r = 1.5 * (Math.hypot(foto.offsetWidth, foto.offsetHeight) / Math.SQRT2);
          anel.style.setProperty("--anel", `${Math.round(r * 2)}px`);
          foto.setAttribute("data-aberto", "");
          anel.setAttribute("data-aberto", "");
          sec.current?.setAttribute("data-foto-aberta", "");
        } else if (!e.isIntersecting) {
          foto.removeAttribute("data-aberto");
          anel.removeAttribute("data-aberto");
          sec.current?.removeAttribute("data-foto-aberta");
        }
      },
      { threshold: [0, 0.2] },
    );
    // observa o anel (mesma caixa da foto, sem recorte): o Chrome conta o clip-path do próprio alvo, e a foto fechada
    // (circle 0%) dava sempre 0% visível, então no Android o portal nunca abria
    io.observe(anel);
    return () => io.disconnect();
  }, [mode]);

  // modo foto no desktop (vídeo indisponível; movimento reduzido fica de fora): a foto entra e sai pelo mesmo portal do vídeo
  useEffect(() => {
    if (mode !== "static" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (matchMedia("(max-width: 899px)").matches) return; // celular: portal que abre sozinho, acima
    const s = sec.current;
    if (!s) return;
    const est = { chave: "" };
    let raf = 0;
    let perto = false; // longe da tela não mede nada (eram 3 cenas medindo a cada rolagem)
    const pedir = () => {
      if (perto && !raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          pintarPortal(s, est);
        });
    };
    const io = new IntersectionObserver(
      (es) => {
        perto = es.some((e) => e.isIntersecting);
        pintarPortal(s, est);
      },
      { rootMargin: "20% 0px" },
    );
    io.observe(s);
    addEventListener("scroll", pedir, { passive: true });
    addEventListener("resize", pedir);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("scroll", pedir);
      removeEventListener("resize", pedir);
      delete s.dataset.portal;
    };
  }, [mode]);

  const isVideo = mode !== "static";
  const bloco = !!blocoCelular && !isVideo; // celular: foto em bloco no alto da cena

  return (
    <section
      id={id}
      ref={sec}
      // no desktop a seção já nasce com a altura final, com ou sem vídeo: nada pula quando o vídeo chega
      className={cn("lp-cena relative min-[900px]:h-[100svh]", className)}
      data-pendente={pendente || mode === "loading" ? "" : undefined}
    >
      <div ref={frameRef} className={cn("lp-cena-frame relative min-h-[100svh] overflow-hidden min-[900px]:h-[100svh]", bloco && "max-[899px]:min-h-0")}>
        {isVideo && (
          <>
            <img src={poster} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
            <video
              ref={vid}
              muted
              playsInline
              preload="auto"
              aria-hidden
              className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-500", mode === "video" ? "opacity-100" : "opacity-0")}
            />
            {srcReverso && <video ref={rev} muted playsInline preload="auto" aria-hidden className="absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />}
          </>
        )}
        {/* a foto (modo estático) com os escurecimentos e a sombra do alto, tudo num invólucro: no celular ele tem as bordas
            dissolvidas no fundo por uma máscara fixa (sem corte reto) e é por ele que o portal abre */}
        <div ref={fotoRef} className={cn("lp-foto pointer-events-none absolute inset-0", bloco && "lp-foto--bloco max-[899px]:relative max-[899px]:inset-auto")}>
          {stillCelular && <link rel="preload" as="image" href={stillCelular} media="(max-width: 899px)" fetchPriority={prioridade ? "high" : "auto"} />}
          <picture>
          {stillCelular && <source media="(max-width: 899px)" srcSet={stillCelular} />}
          <img
            src={still}
            alt={stillAlt}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 [object-position:var(--pos)]",
              isVideo ? "opacity-0" : "opacity-100",
              bloco && "max-[899px]:relative max-[899px]:inset-auto max-[899px]:[aspect-ratio:var(--aspecto)] max-[899px]:h-auto max-[899px]:[object-position:var(--pos-celular)]",
            )}
            style={{ ["--pos" as string]: stillPosition, ["--pos-celular" as string]: blocoCelular, ["--aspecto" as string]: aspectoBloco }}
            decoding="async"
            loading={prioridade ? "eager" : "lazy"}
            fetchPriority={prioridade ? "high" : "auto"}
          />
          </picture>
          <div className={cn("absolute inset-0 z-[1] bg-[radial-gradient(120%_80%_at_0%_50%,rgba(18,19,21,.72),rgba(18,19,21,0)_60%)]", (bloco || !escurecerCelular) && "max-[899px]:hidden")} />
          {/* modo estático no celular: a imagem inteira escurece um pouco, porque ali o texto ocupa a largura toda */}
          {!isVideo && !bloco && escurecerCelular && <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(18,19,21,.35),rgba(18,19,21,.62))] min-[900px]:hidden" />}
          {/* sombra no alto da cena, para o menu ler bem sobre qualquer quadro */}
          <div className="absolute inset-x-0 top-0 z-[1] h-40 bg-gradient-to-b from-[rgba(18,19,21,.7)] to-transparent" />
        </div>
        {/* anel de luz do portal do celular: cresce com o círculo e some no fim */}
        <div ref={anelRef} aria-hidden className={cn("lp-foto-anel pointer-events-none absolute inset-0 z-[1] min-[900px]:hidden", bloco && "bottom-auto [aspect-ratio:var(--aspecto)]")} style={{ ["--aspecto" as string]: aspectoBloco }}>
          <span />
        </div>

        {mode === "loading" && (
          <div className="absolute bottom-8 right-8 z-[3] flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--lp-text-2)]">
            <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
              <circle cx="14" cy="14" r="12" fill="none" stroke="var(--lp-line)" strokeWidth="1.5" />
              <circle
                cx="14"
                cy="14"
                r="12"
                fill="none"
                stroke="var(--lp-accent)"
                strokeWidth="1.5"
                strokeDasharray={75.4}
                strokeDashoffset={75.4 * (1 - loaded)}
                transform="rotate(-90 14 14)"
              />
            </svg>
            Carregando a cena {Math.round(loaded * 100)}%
          </div>
        )}

        <div ref={bandsRef} className={cn("absolute inset-0 z-[2]", mode === "video" ? "block" : "hidden")}>
          {children}
        </div>
        <div className={cn("lp-cena-estatico relative z-[2]", mode === "video" ? "hidden" : "block")}>{staticContent}</div>
      </div>
      <div aria-hidden className="lp-portal-anel pointer-events-none absolute inset-0 z-[5]" />
      {isVideo && (
        <div aria-hidden className="lp-continuar lp-ui lp-over-video pointer-events-none absolute inset-x-0 bottom-7 z-[4] flex items-center justify-center gap-3 text-white">
          Role para continuar
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="lp-continuar-seta">
            <path d="M8 2.3v11.4m0 0 4.9-4.9M8 13.7 3.1 8.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </section>
  );
}
