// Mecánica «modelado» (PLAN_TECNICO.md, 9.9) sin dependencias: el sólido del alumno
// es una lista de primitivas (caja o cilindro) que SUMAN o RESTAN. Para compararlo
// con el molde se muestrea el volumen punto a punto de forma analítica (sin CSG).
// Lógica pura: se prueba con node.
//
// Pieza: { tipo: 'caja' | 'cilindro', op: 'sumar' | 'restar', x, y, z,
//          ancho, alto, fondo (caja) | radio, largo, eje: 'x' | 'y' | 'z' (cilindro) }

export function dentro(p, [px, py, pz]) {
  const dx = px - p.x, dy = py - p.y, dz = pz - p.z;
  if (p.tipo === 'caja') return Math.abs(dx) <= p.ancho / 2 && Math.abs(dy) <= p.alto / 2 && Math.abs(dz) <= p.fondo / 2;
  // cilindro: a lo largo de su eje mide «largo»; en el plano perpendicular, «radio»
  const [a, b, c] = p.eje === 'x' ? [dx, dy, dz] : p.eje === 'z' ? [dz, dx, dy] : [dy, dx, dz];
  return Math.abs(a) <= p.largo / 2 && b * b + c * c <= p.radio * p.radio;
}

// dentro del sólido: en alguna pieza que suma y en ninguna que resta
export function dentroModelo(piezas, punto) {
  let suma = false;
  for (const p of piezas) if (p.op !== 'restar' && dentro(p, punto)) { suma = true; break; }
  if (!suma) return false;
  for (const p of piezas) if (p.op === 'restar' && dentro(p, punto)) return false;
  return true;
}

// Intersección sobre unión (0 a 1) muestreando una rejilla dentro de «limites»
export function parecido(a, b, limites = { min: [-4, -1.5, -2], max: [4, 1.5, 2] }, paso = 0.1) {
  let inter = 0, union = 0;
  const [x0, y0, z0] = limites.min, [x1, y1, z1] = limites.max;
  for (let x = x0 + paso / 2; x < x1; x += paso) {
    for (let y = y0 + paso / 2; y < y1; y += paso) {
      for (let z = z0 + paso / 2; z < z1; z += paso) {
        const ea = dentroModelo(a, [x, y, z]), eb = dentroModelo(b, [x, y, z]);
        if (ea || eb) union++;
        if (ea && eb) inter++;
      }
    }
  }
  return union ? inter / union : 0;
}

// Vértices, aristas y caras de las mallas de cada pieza (los cilindros, con 16 lados)
export const LADOS = 16;
export function estadisticas(piezas) {
  let v = 0, a = 0, c = 0;
  for (const p of piezas) {
    if (p.tipo === 'caja') { v += 8; a += 12; c += 6; } else { v += 2 * LADOS; a += 3 * LADOS; c += LADOS + 2; }
  }
  return { vertices: v, aristas: a, caras: c };
}

// Comprueba que los números de una pieza tienen sentido (para el formulario de la forja)
export function piezaValida(p) {
  const pos = [p.x, p.y, p.z].every(Number.isFinite);
  const medidas = p.tipo === 'caja' ? [p.ancho, p.alto, p.fondo] : [p.radio, p.largo];
  return pos && medidas.every((m) => Number.isFinite(m) && m > 0 && m <= 10) && (p.tipo === 'caja' || ['x', 'y', 'z'].includes(p.eje));
}
