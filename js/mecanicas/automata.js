// El autómata del Piso XI: un robot en una cuadrícula que ejecuta un programa de bloques.
// Módulo puro (sin Three.js ni DOM): se prueba con Node.
//
// nivel: { ancho, alto, inicio: { x, y, dir }, meta: { x, y }, muros: [[x, y]], trampas: [[x, y]] }
//   dir: 0 = norte (y-1), 1 = este (x+1), 2 = sur (y+1), 3 = oeste (x-1)
// programa: lista de bloques
//   { op: 'avanzar' } · { op: 'izquierda' } · { op: 'derecha' }
//   { op: 'repetir', n, cuerpo: [...] }
//   { op: 'mientras', cuerpo: [...] }            (mientras no haya llegado a la meta)
//   { op: 'si', entonces: [...], sino: [...] }   (si hay muro delante)

export const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
const clave = (x, y) => `${x},${y}`;

export function ejecutar(nivel, programa, maxPasos = 200) {
  const muros = new Set(nivel.muros.map(([x, y]) => clave(x, y)));
  const trampas = new Set((nivel.trampas ?? []).map(([x, y]) => clave(x, y)));
  const r = { x: nivel.inicio.x, y: nivel.inicio.y, dir: nivel.inicio.dir };
  const pasos = [{ ...r }];
  let error = null, ops = 0;
  const llego = () => r.x === nivel.meta.x && r.y === nivel.meta.y;
  const bloqueado = (x, y) => x < 0 || y < 0 || x >= nivel.ancho || y >= nivel.alto || muros.has(clave(x, y));
  const muroDelante = () => bloqueado(r.x + DX[r.dir], r.y + DY[r.dir]);

  function correr(lista) {
    for (const b of lista) {
      if (error || llego()) return;
      if (++ops > maxPasos) { error = 'limite'; return; }
      if (b.op === 'avanzar') {
        const nx = r.x + DX[r.dir], ny = r.y + DY[r.dir];
        if (bloqueado(nx, ny)) { error = 'muro'; return; }
        r.x = nx; r.y = ny;
        pasos.push({ ...r });
        if (trampas.has(clave(r.x, r.y))) { error = 'trampa'; return; }
      } else if (b.op === 'izquierda' || b.op === 'derecha') {
        r.dir = (r.dir + (b.op === 'derecha' ? 1 : 3)) % 4;
        pasos.push({ ...r });
      } else if (b.op === 'repetir') {
        for (let i = 0; i < b.n && !error && !llego(); i++) correr(b.cuerpo);
      } else if (b.op === 'mientras') {
        while (!error && !llego()) {
          const antes = ops;
          correr(b.cuerpo);
          if (ops === antes) { error = 'limite'; return; } // cuerpo vacío: bucle infinito
        }
      } else if (b.op === 'si') {
        correr(muroDelante() ? b.entonces : (b.sino ?? []));
      }
    }
  }
  correr(programa);
  return { pasos, llego: llego(), error: llego() ? null : (error ?? 'corto') };
}

// cuántos bloques tiene un programa (los bucles cuentan como uno más su cuerpo)
export const contar = (programa) => programa.reduce((n, b) => n + 1 + contar(b.cuerpo ?? []) + contar(b.entonces ?? []) + contar(b.sino ?? []), 0);

// El mismo programa en JavaScript y en pseudocódigo (para enseñar que son lo mismo)
export function aJS(programa, sangria = '') {
  return programa.map((b) => {
    if (b.op === 'avanzar') return `${sangria}avanzar();`;
    if (b.op === 'izquierda') return `${sangria}girarIzquierda();`;
    if (b.op === 'derecha') return `${sangria}girarDerecha();`;
    if (b.op === 'repetir') return `${sangria}for (let i = 0; i < ${b.n}; i++) {\n${aJS(b.cuerpo, sangria + '  ')}\n${sangria}}`;
    if (b.op === 'mientras') return `${sangria}while (!enLaMeta()) {\n${aJS(b.cuerpo, sangria + '  ')}\n${sangria}}`;
    if (b.op === 'si') return `${sangria}if (muroDelante()) {\n${aJS(b.entonces, sangria + '  ')}\n${sangria}} else {\n${aJS(b.sino ?? [], sangria + '  ')}\n${sangria}}`;
    return '';
  }).join('\n');
}
export function aPseudo(programa, sangria = '') {
  return programa.map((b) => {
    if (b.op === 'avanzar') return `${sangria}avanzar`;
    if (b.op === 'izquierda') return `${sangria}girar a la izquierda`;
    if (b.op === 'derecha') return `${sangria}girar a la derecha`;
    if (b.op === 'repetir') return `${sangria}repetir ${b.n} veces\n${aPseudo(b.cuerpo, sangria + '    ')}\n${sangria}fin repetir`;
    if (b.op === 'mientras') return `${sangria}mientras no esté en la meta\n${aPseudo(b.cuerpo, sangria + '    ')}\n${sangria}fin mientras`;
    if (b.op === 'si') return `${sangria}si hay muro delante\n${aPseudo(b.entonces, sangria + '    ')}\n${sangria}si no\n${aPseudo(b.sino ?? [], sangria + '    ')}\n${sangria}fin si`;
    return '';
  }).join('\n');
}
