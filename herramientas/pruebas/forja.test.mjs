// Pruebas del Piso VI: sólidos por muestreo, parecido y estadísticas de malla.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dentro, dentroModelo, parecido, estadisticas, piezaValida } from '../../js/mecanicas/forja.js';
import { LLAVE, CONTROLES } from '../../js/contenido/piso6.js';

test('dentro de cajas y cilindros en cualquier eje', () => {
  const caja = { tipo: 'caja', x: 0, y: 0, z: 0, ancho: 2, alto: 1, fondo: 1 };
  assert.equal(dentro(caja, [0.9, 0.4, 0]), true);
  assert.equal(dentro(caja, [1.1, 0, 0]), false);
  const cx = { tipo: 'cilindro', x: 0, y: 0, z: 0, radio: 0.5, largo: 4, eje: 'x' };
  assert.equal(dentro(cx, [1.9, 0.3, 0.3]), true);
  assert.equal(dentro(cx, [1.9, 0.4, 0.4]), false);
  const cy = { ...cx, eje: 'y' };
  assert.equal(dentro(cy, [0, 1.9, 0]), true);
  assert.equal(dentro(cy, [1.9, 0, 0]), false);
});

test('restar hace agujeros', () => {
  assert.equal(dentroModelo(LLAVE, [-2.2, 0, 0]), false);
  assert.equal(dentroModelo(LLAVE, [-2.2, 0, 0.65]), true);
  for (const c of CONTROLES) assert.equal(dentroModelo(LLAVE, c.punto), c.lleno, c.texto);
});

test('parecido: la llave consigo misma es 1 y sin dientes baja', () => {
  assert.ok(parecido(LLAVE, LLAVE) > 0.999);
  const sinDientes = LLAVE.filter((p) => !p.nombre.startsWith('Diente'));
  assert.ok(parecido(LLAVE, sinDientes) < 0.95);
  const movida = LLAVE.map((p) => ({ ...p, x: p.x + 0.1 }));
  assert.ok(parecido(LLAVE, movida) > 0.85, 'un pequeño error de posición todavía encaja');
  assert.ok(parecido(LLAVE, [{ tipo: 'caja', op: 'sumar', x: 0, y: 0, z: 0, ancho: 7, alto: 0.6, fondo: 2 }]) < 0.5);
  assert.equal(parecido(LLAVE, []), 0);
});

test('estadísticas de malla y validación de piezas', () => {
  assert.deepEqual(estadisticas([{ tipo: 'caja' }]), { vertices: 8, aristas: 12, caras: 6 });
  const e = estadisticas([{ tipo: 'cilindro' }]);
  assert.equal(e.vertices - e.aristas + e.caras, 2); // Euler
  assert.equal(piezaValida(LLAVE[0]), true);
  assert.equal(piezaValida({ ...LLAVE[1], ancho: 0 }), false);
  assert.equal(piezaValida({ ...LLAVE[0], eje: 'w' }), false);
});
