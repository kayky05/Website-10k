/* Encaixe em perspectiva: calcula o matrix3d que leva um retângulo w x h para quatro cantos quaisquer
   (ordem: topo-esquerda, topo-direita, base-direita, base-esquerda), em pixels. */

type P = [number, number];

function resolver(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let i = 0; i < n; i++) {
    let p = i;
    for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
    [M[i], M[p]] = [M[p], M[i]];
    for (let r = 0; r < n; r++) {
      if (r === i) continue;
      const f = M[r][i] / M[i][i];
      for (let c = i; c <= n; c++) M[r][c] -= f * M[i][c];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}

export function matrix3d(w: number, h: number, dst: [P, P, P, P]): string {
  const src: P[] = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
  const A: number[][] = [];
  const b: number[] = [];
  src.forEach(([x, y], i) => {
    const [X, Y] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -X * x, -X * y]);
    b.push(X);
    A.push([0, 0, 0, x, y, 1, -Y * x, -Y * y]);
    b.push(Y);
  });
  const [a, bb, c, d, e, f, g, hh] = resolver(A, b);
  // CSS matrix3d é em colunas
  return `matrix3d(${[a, d, 0, g, bb, e, 0, hh, 0, 0, 1, 0, c, f, 0, 1].map((v) => +v.toFixed(10)).join(",")})`;
}

// converte cantos normalizados (0 a 1 no quadro do vídeo) em pixels de um elemento com object-fit: cover
export function cantosNaTela(cantos: [P, P, P, P], caixaW: number, caixaH: number, videoW: number, videoH: number): [P, P, P, P] {
  const s = Math.max(caixaW / videoW, caixaH / videoH);
  const ox = (caixaW - videoW * s) / 2;
  const oy = (caixaH - videoH * s) / 2;
  return cantos.map(([nx, ny]) => [ox + nx * videoW * s, oy + ny * videoH * s]) as [P, P, P, P];
}
