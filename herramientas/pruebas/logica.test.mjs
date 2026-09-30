// Pruebas de la lógica pura de las mecánicas: node --test herramientas/pruebas
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { comprobar321, leerNumero, corregir, siguienteEncargo } from '../../js/mecanicas/logica.js';
import piso2 from '../../js/contenido/piso2.js';

const R = Object.fromEntries(piso2.cripta.receptaculos.map((r) => [r.id, r]));
const con = (...ids) => ids.map((id) => R[id]);

test('3-2-1: combinaciones válidas', () => {
  assert.equal(comprobar321(con('disco', 'cinta', 'nube')).ok, true);
  assert.equal(comprobar321(con('disco', 'externo', 'nube')).ok, true); // disco + nube = 2 tipos
  assert.equal(comprobar321(con('carpeta', 'cinta', 'nube')).ok, true);
});

test('3-2-1: dos copias en el mismo disco no cuentan', () => {
  assert.equal(comprobar321(con('disco', 'carpeta', 'nube')).fallo, 'mismoDisco');
});

test('3-2-1: un solo tipo de soporte', () => {
  assert.equal(comprobar321(con('disco', 'externo', 'carpeta')).fallo, 'mismoDisco');
  assert.equal(comprobar321([R.disco, R.externo, { ...R.externo, dispositivo: 'hdd3' }]).fallo, 'unTipo');
});

test('3-2-1: ninguna copia fuera', () => {
  assert.equal(comprobar321(con('disco', 'externo', 'cinta')).fallo, 'nadaFuera');
});

test('leerNumero entiende el formato español', () => {
  assert.equal(leerNumero('3500'), 3500);
  assert.equal(leerNumero('3.500'), 3500);
  assert.equal(leerNumero('931,3'), 931.3);
  assert.equal(leerNumero(' 931.32 GiB'), 931.32);
  assert.equal(leerNumero('1.048.576'), 1048576);
  assert.ok(Number.isNaN(leerNumero('')));
  assert.ok(Number.isNaN(leerNumero('mucho')));
});

test('corregir preguntas numéricas con tolerancia', () => {
  const q = piso2.balanza.conversiones.find((c) => c.id === 'b-tib');
  assert.equal(corregir(q, '931,3'), true);
  assert.equal(corregir(q, '931'), true);
  assert.equal(corregir(q, '1000'), false);
});

test('corregir preguntas de ordenar', () => {
  const q = piso2.balanza.orden;
  assert.equal(corregir(q, [0, 1, 2, 3, 4, 5, 6]), true);
  assert.equal(corregir(q, [1, 0, 2, 3, 4, 5, 6]), false);
});

test('las respuestas numéricas del contenido son correctas', () => {
  const tib = piso2.balanza.conversiones.find((c) => c.id === 'b-tib');
  assert.ok(Math.abs(1e12 / 1024 ** 3 - tib.valor) < 0.05);
  assert.equal(piso2.preguntas.find((p) => p.id === 'p2-10').valor, 1024 * 1024);
  assert.equal(piso2.preguntas.find((p) => p.id === 'p2-07').valor, 600 / 8);
});

test('encargos: tres aciertos seguidos completan el sello y un fallo reinicia la racha', () => {
  let e = { racha: 0, encargo: 0 };
  e = siguienteEncargo(e, true, 9, 3);
  e = siguienteEncargo(e, false, 9, 3);
  assert.equal(e.racha, 0);
  assert.equal(e.encargo, 2);
  for (let i = 0; i < 3; i++) e = siguienteEncargo(e, true, 9, 3);
  assert.equal(e.completo, true);
  assert.equal(siguienteEncargo({ racha: 0, encargo: 8 }, true, 9, 3).encargo, 0);
});

test('cada encargo tiene respuestas que existen', () => {
  const ids = new Set(piso2.soportes.opciones.map((o) => o.id));
  for (const e of piso2.soportes.encargos) for (const c of e.correctas) assert.ok(ids.has(c), c);
});

// ---------- Piso III ----------
import { leerBits, cumpleObjetivo, normalizar } from '../../js/mecanicas/logica.js';
import piso3 from '../../js/contenido/piso3.js';
const bits = (n) => (((n % 256) + 256) % 256).toString(2).padStart(8, '0').split('').map(Number);

test('palancas: lecturas sin signo, con signo y hexadecimal', () => {
  assert.deepEqual(leerBits(bits(77)), { sinSigno: 77, conSigno: 77, hex: '0x4D', binario: '01001101' });
  assert.equal(leerBits(bits(-5)).conSigno, -5);
  assert.equal(leerBits(bits(-5)).binario, '11111011');
  assert.equal(leerBits(bits(0x3c)).hex, '0x3C');
});

test('palancas: las tres puertas se pueden abrir', () => {
  for (const p of piso3.palancas.puertas) assert.ok(cumpleObjetivo(bits(p.objetivo), p.objetivo), p.texto);
  assert.equal(cumpleObjetivo(bits(251), -5), true);   // 11111011 es −5 en complemento a 2
  assert.equal(cumpleObjetivo(bits(5), -5), false);
});

test('respuestas de texto: sin distinguir mayúsculas ni tildes', () => {
  const q = piso3.inscripcion[0];
  assert.equal(corregir(q, 'Hola'), true);
  assert.equal(corregir(q, '  HOLA '), true);
  assert.equal(corregir(q, 'hóla'), true);
  assert.equal(corregir(q, 'hol'), false);
  assert.equal(normalizar('Ñandú'), 'nandu');
});

test('los cálculos del Piso III son correctos', () => {
  assert.equal(String.fromCharCode(72, 111, 108, 97), 'Hola');
  assert.equal(Buffer.from('ñ', 'utf8').toString('hex'), 'c3b1');
  assert.equal(Buffer.from('🔥', 'utf8').length, 4);
  assert.equal('M'.charCodeAt(0), piso3.inscripcion[1].valor);
  assert.equal(1920 * 1080 * 3, piso3.relicario.pesos[0].valor);
  assert.ok(Math.abs(180 * 44100 * 2 * 2 / 1e6 - piso3.relicario.pesos[1].valor) < 0.01);
  const num = (id) => piso3.preguntas.find((q) => q.id === id).valor;
  assert.equal(num('p3-01'), 0b00001010);
  assert.equal(num('p3-04'), 0xff);
});
