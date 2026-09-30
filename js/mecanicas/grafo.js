// Grafos para la mecánica «conectar» (PLAN_TECNICO.md, 9.5). Lógica pura, sin Three.js.
// Una arista es { a, b, medio }; el orden de a y b no importa.

export const clave = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

function vecinos(nodos, aristas) {
  const v = new Map(nodos.map((n) => [n, []]));
  for (const e of aristas) {
    if (!v.has(e.a) || !v.has(e.b)) continue;
    v.get(e.a).push(e.b);
    v.get(e.b).push(e.a);
  }
  return v;
}

// ¿Están todos los nodos unidos entre sí?
export function conexo(nodos, aristas) {
  if (!nodos.length) return true;
  const v = vecinos(nodos, aristas);
  const vistos = new Set([nodos[0]]);
  const cola = [nodos[0]];
  while (cola.length) for (const w of v.get(cola.shift())) if (!vistos.has(w)) { vistos.add(w); cola.push(w); }
  return vistos.size === nodos.length;
}

// Camino más corto (lista de nodos) o null si no hay ruta
export function ruta(nodos, aristas, desde, hasta) {
  const v = vecinos(nodos, aristas);
  if (!v.has(desde) || !v.has(hasta)) return null;
  const previo = new Map([[desde, null]]);
  const cola = [desde];
  while (cola.length) {
    const n = cola.shift();
    if (n === hasta) break;
    for (const w of v.get(n)) if (!previo.has(w)) { previo.set(w, n); cola.push(w); }
  }
  if (!previo.has(hasta)) return null;
  const camino = [];
  for (let n = hasta; n !== null; n = previo.get(n)) camino.unshift(n);
  return camino;
}

// Estrella: cada hoja está unida solo al centro (y a nada más)
export function esEstrella(aristas, centro, hojas) {
  return hojas.every((h) => {
    const suyas = aristas.filter((e) => e.a === h || e.b === h);
    return suyas.length === 1 && (suyas[0].a === centro || suyas[0].b === centro);
  });
}

// Puentes del grafo (Tarjan): aristas que, si se cortan, lo separan en dos
export function puentes(nodos, aristas) {
  const v = new Map(nodos.map((n) => [n, []]));
  aristas.forEach((e, i) => {
    if (!v.has(e.a) || !v.has(e.b)) return;
    v.get(e.a).push([e.b, i]);
    v.get(e.b).push([e.a, i]);
  });
  const orden = new Map(), bajo = new Map(), res = [];
  let t = 0;
  const visitar = (n, aristaPadre) => {
    orden.set(n, t);
    bajo.set(n, t++);
    for (const [w, i] of v.get(n)) {
      if (i === aristaPadre) continue;
      if (!orden.has(w)) {
        visitar(w, i);
        bajo.set(n, Math.min(bajo.get(n), bajo.get(w)));
        if (bajo.get(w) > orden.get(n)) res.push(aristas[i]);
      } else bajo.set(n, Math.min(bajo.get(n), orden.get(w)));
    }
  };
  for (const n of nodos) if (!orden.has(n)) visitar(n, -1);
  return res;
}

// Red redundante: conexa y sin ningún enlace imprescindible
export const sinPuntoUnico = (nodos, aristas) => conexo(nodos, aristas) && puentes(nodos, aristas).length === 0;

// Solo las aristas cuyos dos extremos están en la lista de nodos
export const subgrafo = (nodos, aristas) => aristas.filter((e) => nodos.includes(e.a) && nodos.includes(e.b));
