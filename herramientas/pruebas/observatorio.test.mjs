import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ejecutarSQL } from '../../js/mecanicas/minisql.js';
import { entrenar, predecir, evaluar } from '../../js/mecanicas/oraculo.js';
import C from '../../js/contenido/piso13.js';

const copia = () => JSON.parse(JSON.stringify(C.tablas));

test('SELECT * y columnas', () => {
  const r = ejecutarSQL('SELECT * FROM prisioneros', copia());
  assert.equal(r.ok, true);
  assert.equal(r.filas.length, 4);
  assert.deepEqual(r.columnas, ['id', 'nombre', 'celda_id']);
  const r2 = ejecutarSQL('select nombre from prisioneros where celda_id > 2;', copia());
  assert.deepEqual(r2.filas.map((f) => f.nombre), ['Aldric', 'Herrero']);
});

test('JOIN con WHERE encuentra a Aldric', () => {
  const r = ejecutarSQL(C.retos[1].ayuda, copia());
  assert.equal(r.ok, true);
  assert.deepEqual(r.filas, [{ nombre: 'Aldric', planta: 'cima' }]);
  const r2 = ejecutarSQL("SELECT celdas.id, guardian FROM prisioneros JOIN celdas ON prisioneros.celda_id = celdas.id WHERE nombre = 'aldric'", copia());
  assert.deepEqual(r2.filas, [{ 'celdas.id': 7, guardian: 'Morvath' }]);
});

test('UPDATE con y sin WHERE', () => {
  const t = copia();
  const r = ejecutarSQL(C.retos[2].ayuda, t);
  assert.equal(r.cambiadas, 1);
  assert.equal(t.celdas.filas.find((f) => f.id === 7).estado, 'abierta');
  assert.equal(t.celdas.filas.filter((f) => f.estado === 'abierta').length, 1);
  const t2 = copia();
  assert.equal(ejecutarSQL("UPDATE celdas SET estado = 'abierta'", t2).cambiadas, 5);
});

test('errores explicados', () => {
  assert.match(ejecutarSQL('SELECT * FROM presos', copia()).error, /No existe la tabla/);
  assert.match(ejecutarSQL("SELECT * FROM prisioneros WHERE nombre = Aldric", copia()).error, /No existe la columna «Aldric»/);
  assert.match(ejecutarSQL('SELECT nombre prisioneros', copia()).error, /FROM/);
  assert.match(ejecutarSQL('DELETE FROM celdas', copia()).error, /SELECT o por UPDATE/);
  assert.match(ejecutarSQL('SELECT * FROM prisioneros JOIN celdas', copia()).error, /ON/);
});

test('el oráculo sesgado falla y con datos variados acierta', () => {
  const O = C.oraculo;
  const sesgado = evaluar(entrenar(O.entrenamiento), O.prueba);
  assert.ok(sesgado.precision < 0.5, `sesgado: ${sesgado.precision}`);
  const variados = O.reserva.slice(0, 6);
  const bueno = evaluar(entrenar([...O.entrenamiento, ...variados]), O.prueba);
  assert.ok(bueno.precision >= O.minimo, `variado: ${bueno.precision}`);
  // más ejemplos del mismo tipo no arreglan el sesgo
  const masDeLoMismo = evaluar(entrenar([...O.entrenamiento, ...O.reserva.slice(6)]), O.prueba);
  assert.ok(masDeLoMismo.precision < O.minimo);
  assert.equal(predecir(entrenar(O.entrenamiento), { x: 9, y: 9 }), 'peligrosa');
});
