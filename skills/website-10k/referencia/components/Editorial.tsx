import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import Magnet from "@/components/ui/Magnet";
import DecryptedText from "@/components/ui/DecryptedText";

/* Peças tipográficas da página.
   - Palavras: divide o texto em palavras dentro de máscaras; elas sobem uma a uma quando o pai ganha .is-in.
   - Rolo: caça-níquel, cada caractere rola numa coluna até o valor final.
   - Botao: pílula com ponto, texto e seta.
   - LinkRolo: o texto sobe e uma cópia entra por baixo no hover.
   data-reveal (entrada suave) e data-words (palavras) são ligados por src/effects/pagina.ts. */

// divide strings em palavras mascaradas, mantendo elementos como <em> e numerando a ordem para o atraso
export function Palavras({ children, inicio = 0 }: { children: ReactNode; inicio?: number }) {
  let n = inicio;
  const dividir = (node: ReactNode): ReactNode => {
    if (typeof node === "string") {
      return node.split(/(\s+)/).map((p, k) =>
        /^\s+$/.test(p) || p === "" ? (
          p
        ) : (
          <span key={`${n}-${k}`} className="lp-w">
            <span className="lp-wi" style={{ ["--i" as string]: n++ }}>
              {p}
            </span>
          </span>
        ),
      );
    }
    if (isValidElement(node)) {
      const el = node as ReactElement<{ children?: ReactNode }>;
      return cloneElement(el, {}, Children.map(el.props.children, dividir));
    }
    if (Array.isArray(node)) return node.map(dividir);
    return node;
  };
  return <>{Children.map(children, dividir)}</>;
}

export function Capitulo({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p data-reveal className={cn("lp-eyebrow flex items-center gap-3", className)}>
      <i aria-hidden className="lp-dot" />
      {/* o rótulo "decifra" como dado de sistema ao entrar na tela (React Bits DecryptedText) */}
      {typeof children === "string" ? (
        <DecryptedText
          text={children}
          animateOn="view"
          sequential
          revealDirection="start"
          speed={32}
          characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
          encryptedClassName="text-[var(--lp-accent-hover)]"
        />
      ) : (
        children
      )}
    </p>
  );
}

export function Titulo({
  children,
  as: Tag = "h2",
  className,
}: {
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <Tag data-words className={cn("lp-display text-balance", className)}>
      <Palavras>{children}</Palavras>
    </Tag>
  );
}

export function Corpo({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p data-reveal className={cn("lp-corpo max-w-[34rem] text-[var(--lp-text-2)]", className)}>
      {children}
    </p>
  );
}

// pseudo-aleatório determinístico: o HTML do build e o do navegador saem iguais
const sorteio = (i: number, k: number) => ((i * 7 + k * 3 + 5) * 37) % 10;

export function Rolo({ texto, className }: { texto: string; className?: string }) {
  return (
    <span data-words aria-label={texto} role="text" className={cn("inline-block whitespace-nowrap", className)}>
      {Array.from(texto).map((c, i) => {
        const digito = /\d/.test(c);
        const itens = digito ? [String(sorteio(i, 1)), String(sorteio(i, 2)), String(sorteio(i, 3)), c] : [c, c, c, c];
        return (
          <span key={i} aria-hidden className="lp-rc" style={{ width: c === " " ? "0.28em" : undefined }}>
            {/* a largura da coluna é a do caractere final, para o texto não abrir buracos */}
            <span className="lp-rc-medida">{c === " " ? " " : c}</span>
            <span className="lp-rl" style={{ ["--i" as string]: i }}>
              {itens.map((x, k) => (
                <span key={k}>{x === " " ? " " : x}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

const Seta = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M2.343 8h11.314m0 0L8.673 3.016M13.657 8l-4.984 4.984" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function Botao({
  href,
  children,
  variante = "claro",
  tamanho,
  className,
  onClick,
}: {
  href: string;
  children: ReactNode;
  variante?: "claro" | "contorno";
  tamanho?: "sm";
  className?: string;
  onClick?: () => void;
}) {
  // os botões são atraídos de leve pelo cursor e voltam com mola (React Bits Magnet)
  return (
    <Magnet padding={40} magnetStrength={4} maxOffset={9}>
      <a href={href} onClick={onClick} {...(/^https?:/.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : null)} className={cn("lp-btn", `lp-btn--${variante}`, tamanho && `lp-btn--${tamanho}`, className)}>
        <span aria-hidden className="lp-btn-dot" />
        <span className="lp-btn-txt">{children}</span>
        <span aria-hidden className="lp-btn-arrow">
          <Seta />
        </span>
      </a>
    </Magnet>
  );
}

export function LinkRolo({ href, children, className }: { href: string; children: string; className?: string }) {
  return (
    <a href={href} className={cn("lp-roll", className)}>
      <span className="lp-roll-in">
        <span>{children}</span>
        <span aria-hidden>{children}</span>
      </span>
    </a>
  );
}
