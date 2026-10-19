import { test } from 'node:test';
import assert from 'node:assert/strict';
import { comprobarHuecos, rellenar, filasDePatron, patronDeFilas, igualPatron, contarVisitas, resumenTexto } from '../../js/mecanicas/fragua.js';
import C from '../../js/contenido/piso12.js';

test('comprobar y rellenar huecos', () => {
  const huecos = [{ opciones: ['a', 'b'], correcta: 1 }, { opciones: ['x', 'y'], correcta: 0 }];
  assert.deepEqual(comprobarHuecos(huecos, [1, 0]), []);
  assert.deepEqual(comprobarHuecos(huecos, [0, null]), [0, 1]);
  assert.equal(rellenar('⟨0⟩ + ⟨1⟩', huecos, [1, null]), 'b + ____');
});

test('la placa: rejilla ↔ filas', () => {
  const filas = ['00100', '01110'];
  assert.deepEqual(filasDePatron(patronDeFilas(filas)), filas);
  assert.equal(igualPatron(filas, ['00100', '01110']), true);
  assert.equal(igualPatron(filas, ['00100', '01111']), false);
});

test('el libro de registro cuenta bien y la pregunta coincide', () => {
  const c = contarVisitas(C.registro.csv);
  assert.deepEqual(c, { lunes: 2, martes: 3, 'miércoles': 1, jueves: 2 });
  assert.equal(c.martes, C.registro.pregunta.valor);
  assert.match(resumenTexto(c), /martes: 3 visitas/);
});

test('los huecos del Piso XII tienen respuesta válida y el código los usa todos', () => {
  for (const parte of [C.molde, C.placa, C.registro]) {
    parte.huecos.forEach((h, i) => {
      assert.ok(h.correcta >= 0 && h.correcta < h.opciones.length, `${parte.titulo} · hueco ${i}`);
      assert.ok(parte.codigo.includes(`⟨${i}⟩`), `${parte.titulo} · falta ⟨${i}⟩ en el código`);
      assert.ok(h.porque, `${parte.titulo} · hueco ${i} sin explicación`);
    });
  }
  assert.equal(C.placa.runa.length, 5);
  assert.ok(C.placa.runa.every((f) => /^[01]{5}$/.test(f)));
});
