// Pruebas del Piso VII: el buscador del bibliotecario y el contenido de la biblioteca.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leerConsulta, buscar } from '../../js/mecanicas/buscador.js';
import piso7 from '../../js/contenido/piso7.js';

const I = piso7.indice;
const primero = (q) => buscar(I, q)[0]?.id;

test('leer la consulta', () => {
  assert.deepEqual(leerConsulta('volcanes -Tenerife site:geologia.umb filetype:.PDF "La Torre Negra"'), {
    frases: ['la torre negra'], palabras: ['volcanes'], excluidas: ['tenerife'], site: 'geologia.umb', filetype: 'pdf',
  });
});

test('los retos no se resuelven con una búsqueda ingenua…', () => {
  assert.notEqual(primero('mapa siete islas pdf'), 'mapa-pdf');
  assert.notEqual(primero('volcanes'), 'volcanes-lapalma');
  assert.notEqual(primero('torre negra'), 'cronica-torre');
});

test('…pero sí con la búsqueda avanzada', () => {
  assert.equal(primero('mapa site:biblioteca.umbravel filetype:pdf'), 'mapa-pdf');
  assert.equal(primero('volcanes -tenerife'), 'volcanes-lapalma');
  assert.equal(primero('"la torre negra"'), 'cronica-torre');
  for (const r of piso7.retos) assert.ok(I.some((d) => d.id === r.objetivo), r.objetivo);
});

test('los operadores filtran de verdad', () => {
  assert.ok(buscar(I, 'filetype:pdf').every((d) => d.url.endsWith('.pdf')));
  assert.ok(buscar(I, 'site:foro.umbravel').every((d) => d.url.startsWith('foro.umbravel')));
  assert.ok(buscar(I, 'volcanes -tenerife').every((d) => !/tenerife/i.test(d.titulo + d.texto + d.url)));
  assert.equal(buscar(I, 'palabraquenoexiste').length, 0);
});

test('licencias y pregones coherentes', () => {
  const ids = new Set(piso7.estanterias.map((e) => e.id));
  for (const o of piso7.obras) assert.ok(ids.has(o.destino), o.id);
  for (const p of piso7.pregones) {
    assert.ok(piso7.etiquetas.includes(p.etiqueta), p.titular);
    assert.ok(piso7.acciones.includes(p.accion), p.titular);
    assert.equal(Object.keys(p.herramientas).length, 4);
  }
});
