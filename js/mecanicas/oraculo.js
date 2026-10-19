// El oráculo del Piso XIII: un clasificador muy sencillo (el centroide más cercano)
// entrenado con ejemplos etiquetados. Sirve para ver el aprendizaje supervisado y el
// sesgo: si los datos de entrenamiento no representan bien el mundo, el modelo falla.
// Módulo puro: se prueba con Node.
//   ejemplo: { x, y, clase }  (x, y entre 0 y 10)

export function entrenar(ejemplos) {
  const suma = {};
  for (const e of ejemplos) {
    const s = (suma[e.clase] ??= { x: 0, y: 0, n: 0 });
    s.x += e.x; s.y += e.y; s.n++;
  }
  return Object.fromEntries(Object.entries(suma).map(([c, s]) => [c, { x: s.x / s.n, y: s.y / s.n }]));
}

export function predecir(modelo, p) {
  let mejor = null, d = Infinity;
  for (const [c, m] of Object.entries(modelo)) {
    const dd = (p.x - m.x) ** 2 + (p.y - m.y) ** 2;
    if (dd < d) { d = dd; mejor = c; }
  }
  return mejor;
}

// proporción de aciertos (0 a 1) y los que ha fallado
export function evaluar(modelo, prueba) {
  const fallos = prueba.filter((p) => predecir(modelo, p) !== p.clase);
  return { precision: prueba.length ? 1 - fallos.length / prueba.length : 0, fallos };
}
