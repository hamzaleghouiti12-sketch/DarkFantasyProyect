import { test } from 'node:test';
import assert from 'node:assert/strict';
import { informeHTML, nivel, CRITERIOS } from '../../js/informe.js';

test('nivel orientativo según los aciertos', () => {
  assert.equal(nivel(0, 0), 'Sin datos');
  assert.equal(nivel(2, 0), 'Pocos datos');
  assert.equal(nivel(9, 1), 'Muy bien');
  assert.equal(nivel(7, 3), 'Bien');
  assert.equal(nivel(5, 5), 'En progreso');
  assert.equal(nivel(1, 9), 'Necesita repaso');
});

test('el informe lista pisos y todos los criterios, y escapa el nombre', () => {
  const html = informeHTML({
    alumno: '<Ana> & Co',
    fecha: '1 de octubre de 2026',
    pisos: [{ id: 'piso1', nombre: 'Piso I · La Cámara' }, { id: 'piso2', nombre: 'Piso II · La Bóveda' }],
    progreso: { pisos: { piso1: { completado: true, mejorPrecision: 80, segundos: 125 } }, criterios: { '3.1': { a: 4, f: 1 } } },
  });
  assert.ok(html.includes('&lt;Ana&gt; &amp; Co'));
  assert.ok(!html.includes('<Ana>'));
  assert.ok(html.includes('1 / 2'));
  assert.ok(html.includes('2:05'));
  assert.ok(html.includes('80%'));
  for (const k of Object.keys(CRITERIOS)) assert.ok(html.includes(`<b>${k}</b>`), k);
  assert.ok(html.includes('Bien')); // 3.1 con 4 de 5
});

test('con datos de la sesión, enseña racha, estrellas, chispas y comodines', () => {
  const html = informeHTML({
    alumno: 'Ana', fecha: 'hoy',
    pisos: [{ id: 'piso1', nombre: 'Piso I' }],
    progreso: { pisos: {}, criterios: {} },
    sesion: { mejorRacha: 7, chispas: 2, comodines: 1, estrellas: { piso1: 3, piso2: 2 } },
  });
  assert.ok(html.includes('Esta sesión'));
  assert.ok(html.includes('<b>7</b>mejor racha'));
  assert.ok(html.includes('<b>5 / 6</b>estrellas en 2 pisos'));
  assert.ok(html.includes('<b>1</b>comodines usados'));
  assert.ok(!informeHTML({ alumno: 'A', fecha: 'f', pisos: [], progreso: { pisos: {}, criterios: {} } }).includes('Esta sesión'));
});
