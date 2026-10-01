// La burbuja de filtros (opcional del Piso VII): un "algoritmo" de recomendación
// de juguete. Cada vez que el jugador elige un titular, ese tema gana peso y el
// siguiente muro se parece más a lo que ya eligió. Módulo puro (se prueba con Node).

// rng: función que devuelve [0, 1). temas: { id: [titulares] }
export function crearBurbuja(temas, rng = Math.random) {
  const ids = Object.keys(temas);
  const clics = Object.fromEntries(ids.map((t) => [t, 0]));
  // cuanto más se elige un tema, más pesa (crece deprisa: así se cierra la burbuja)
  const peso = (t) => 1 + 4 * clics[t] ** 2;
  function sortear() {
    const total = ids.reduce((s, t) => s + peso(t), 0);
    let r = rng() * total;
    for (const t of ids) if ((r -= peso(t)) < 0) return t;
    return ids[ids.length - 1];
  }
  return {
    // un muro de n titulares, sin repetir titular
    muro(n = 6) {
      const vistos = new Set();
      const res = [];
      for (let intento = 0; res.length < n && intento < n * 20; intento++) {
        const tema = sortear();
        const libres = temas[tema].filter((x) => !vistos.has(x));
        if (!libres.length) continue;
        const titular = libres[Math.floor(rng() * libres.length)];
        vistos.add(titular);
        res.push({ tema, titular });
      }
      return res;
    },
    elegir(tema) { if (tema in clics) clics[tema]++; },
    clics,
  };
}

// cuántos temas distintos hay en un muro
export const variedad = (muro) => new Set(muro.map((x) => x.tema)).size;

// generador pseudoaleatorio con semilla (mulberry32), para las pruebas
export function semilla(s) {
  return () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
