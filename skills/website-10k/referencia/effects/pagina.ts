/* Efeitos da página inteira. Roda uma vez, dentro de useEffect no App (nunca no servidor). */

export default function efeitosPagina() {
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const off: Array<() => void> = [];

  // 1. entradas suaves: [data-reveal] ganha .is-in quando entra na tela
  const io = new IntersectionObserver(
    (es) => {
      for (const e of es) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  document.querySelectorAll("[data-reveal], [data-words]").forEach((el) => io.observe(el));
  // o que monta depois (pilhas e cards perto da tela, cards trocados no celular) também entra
  const novos = new MutationObserver((ms) => {
    for (const m of ms)
      m.addedNodes.forEach((n) => {
        if (!(n instanceof Element)) return;
        if (n.matches("[data-reveal], [data-words]")) io.observe(n);
        n.querySelectorAll("[data-reveal], [data-words]").forEach((el) => io.observe(el));
      });
  });
  novos.observe(document.body, { childList: true, subtree: true });
  off.push(() => {
    io.disconnect();
    novos.disconnect();
  });

  // 2. números que contam ao aparecer: data-count="17" data-prefix="+R$ " data-suffix=" bi"
  const fmt = new Intl.NumberFormat("pt-BR");
  const counters = new IntersectionObserver(
    (es) => {
      for (const e of es) {
        if (!e.isIntersecting) continue;
        counters.unobserve(e.target);
        const el = e.target as HTMLElement;
        const to = Number(el.dataset.count);
        const pre = el.dataset.prefix ?? "";
        const suf = el.dataset.suffix ?? "";
        if (calm) {
          el.textContent = pre + fmt.format(to) + suf;
          continue;
        }
        const t0 = performance.now();
        const dur = 1600;
        const step = (now: number) => {
          const k = Math.min(1, (now - t0) / dur);
          const v = Math.round(to * (1 - Math.pow(1 - k, 3)));
          el.textContent = pre + fmt.format(v) + suf;
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    },
    { threshold: 0.6 },
  );
  document.querySelectorAll("[data-count]").forEach((el) => counters.observe(el));
  off.push(() => counters.disconnect());

  // 3. scroll: manifesto palavra por palavra, linhas que se desenham, fio de luz da margem
  const celular = matchMedia("(max-width: 899px)").matches;
  const manifestos = Array.from(document.querySelectorAll<HTMLElement>(".lp-manifesto")).map((m) => ({ m, words: Array.from(m.querySelectorAll("span")), n: -1 }));
  const draws = Array.from(document.querySelectorAll<SVGGeometryElement>(".lp-draw")).map((p) => {
    const len = Math.ceil(p.getTotalLength());
    p.style.setProperty("--len", String(len));
    return { p, len, host: (p.closest("[data-draw-host]") as HTMLElement) ?? p.parentElement!, last: -1 };
  });
  const fio = document.getElementById("fio-progresso");
  let raf = 0;

  const within = (el: Element, start = 0.85, end = 0.35) => {
    const r = el.getBoundingClientRect();
    const a = innerHeight * start;
    const b = innerHeight * end - r.height;
    return Math.min(1, Math.max(0, (a - r.top) / (a - b)));
  };

  // só o que está perto da tela é medido (antes cada rolagem media todos os manifestos e linhas da página);
  // e cada quadro primeiro lê todas as posições e só depois escreve, para o navegador não recalcular a página no meio
  const perto = new Set<Element>();
  const vigia = new IntersectionObserver(
    (es) => {
      for (const e of es) e.isIntersecting ? perto.add(e.target) : perto.delete(e.target);
      wake();
    },
    { rootMargin: "25% 0px" },
  );
  manifestos.forEach((item) => vigia.observe(item.m));
  draws.forEach((d) => vigia.observe(d.host));
  off.push(() => vigia.disconnect());

  const frame = () => {
    raf = 0;
    // no celular a frase é alta: acende mais cedo e termina antes, para não passar tempo apagada
    const ns = manifestos.map((item) => (perto.has(item.m) ? Math.round((celular ? within(item.m, 0.92, 0.62) : within(item.m, 0.8, 0.45)) * item.words.length) : item.n));
    const ks = draws.map((d) => (perto.has(d.host) ? Math.round(within(d.host) * 1000) / 1000 : d.last));
    const kFio = fio ? scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight) : 0;
    manifestos.forEach((item, j) => {
      const n = ns[j];
      if (n === item.n) return; // só mexe no DOM quando muda
      item.n = n;
      item.words.forEach((w, i) => w.classList.toggle("on", i < n));
    });
    draws.forEach((d, j) => {
      const k = ks[j];
      if (k === d.last) return;
      d.last = k;
      d.p.style.strokeDashoffset = String(d.len * (1 - k));
      d.host.style.setProperty("--k", String(k)); // quem quiser acender junto com a linha (ex.: nós da certificação)
    });
    if (fio) fio.style.transform = `scaleY(${kFio.toFixed(4)})`;
  };
  const wake = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  if (!calm) {
    addEventListener("scroll", wake, { passive: true });
    addEventListener("resize", wake);
    off.push(() => {
      removeEventListener("scroll", wake);
      removeEventListener("resize", wake);
      cancelAnimationFrame(raf);
    });
    wake();
  }

  return () => off.forEach((f) => f());
}
