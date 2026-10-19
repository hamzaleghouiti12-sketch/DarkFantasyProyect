// Lógica pura del Piso XII (La Fragua del Código): código con huecos, la placa de LED
// y el libro de registro (un CSV de visitas). Sin DOM ni Three.js: se prueba con Node.

// huecos: [{ opciones: [...], correcta }] · elegidas: [índice elegido o null]
// Devuelve los índices de los huecos mal rellenados (vacío si todo está bien).
export const comprobarHuecos = (huecos, elegidas) => huecos.map((h, i) => (elegidas[i] === h.correcta ? null : i)).filter((i) => i !== null);

// Sustituye «⟨0⟩», «⟨1⟩»… del código por lo elegido (o por ____ si aún no hay nada)
export const rellenar = (codigo, huecos, elegidas) => codigo.replace(/⟨(\d+)⟩/g, (_, n) => {
  const i = Number(n), e = elegidas[i];
  return e === null || e === undefined ? '____' : huecos[i].opciones[e];
});

// La placa: una rejilla de booleanos (filas) ↔ lista de cadenas "01110"
export const filasDePatron = (rejilla) => rejilla.map((f) => f.map((v) => (v ? '1' : '0')).join(''));
export const patronDeFilas = (filas) => filas.map((f) => [...f].map((c) => c === '1'));
export const igualPatron = (a, b) => a.length === b.length && a.every((f, i) => f === b[i]);

// El libro de registro: "fecha,dia,visitante" por línea (la primera es la cabecera).
// Devuelve { dia: número de visitas } en el orden en que aparecen los días.
export function contarVisitas(csv) {
  const contador = {};
  for (const linea of csv.trim().split('\n').slice(1)) {
    const [, dia] = linea.split(',');
    if (dia) contador[dia.trim()] = (contador[dia.trim()] ?? 0) + 1;
  }
  return contador;
}
export const resumenTexto = (contador) => Object.entries(contador).map(([d, n]) => `${d}: ${n} ${n === 1 ? 'visita' : 'visitas'}`).join('\n');
