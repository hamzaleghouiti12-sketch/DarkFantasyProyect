// Pruebas del Piso V: analizador de CSS, colores y contraste WCAG.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leerCss, contarPropiedades, leerColor, contraste, contrasteDelCuerpo } from '../../js/mecanicas/web.js';
import piso5 from '../../js/contenido/piso5.js';

test('CSS: reglas, propiedades y @media', () => {
  const r = leerCss(`/* comentario { } */
body { color: #111; background: white; }
h1 { font-size: 2em }
@media (max-width: 600px) {
  h1 { font-size: 1.4em; }
  img { max-width: 100%; }
}
p { margin: 0; }`);
  assert.equal(r.length, 5);
  assert.deepEqual(r[0], { selector: 'body', media: null, decl: { color: '#111', background: 'white' } });
  assert.equal(r[2].media, '@media (max-width: 600px)');
  assert.equal(r[3].decl['max-width'], '100%');
  assert.equal(r[4].media, null);
  assert.equal(contarPropiedades(r), 6);
  assert.deepEqual(leerCss('h1 { color: red'), []); // sin cerrar: no rompe
});

test('colores', () => {
  assert.deepEqual(leerColor('#fff'), [255, 255, 255]);
  assert.deepEqual(leerColor('#1a1420'), [26, 20, 32]);
  assert.deepEqual(leerColor('rgb(10, 20, 30)'), [10, 20, 30]);
  assert.deepEqual(leerColor('white'), [255, 255, 255]);
  assert.deepEqual(leerColor('#000 url(x.png) no-repeat'), [0, 0, 0]);
  assert.equal(leerColor('azulito'), null);
});

test('contraste WCAG', () => {
  assert.ok(Math.abs(contraste([0, 0, 0], [255, 255, 255]) - 21) < 0.01);
  assert.equal(contraste([10, 10, 10], [10, 10, 10]), 1);
  // el cartel de Morvath empieza con poco contraste y se arregla cambiando los colores
  assert.ok(contrasteDelCuerpo(leerCss(piso5.auditoria.css)) < 2);
  assert.ok(contrasteDelCuerpo(leerCss('body { background-color: #1a1420; color: #f0e6d0; }')) >= 4.5);
  assert.equal(contrasteDelCuerpo(leerCss('p { color: #eee; }')), 21); // sin reglas en body: negro sobre blanco
});

test('la plantilla del cartel empieza incompleta y el CSS de ejemplo cuenta 1 propiedad', () => {
  assert.equal(contarPropiedades(leerCss(piso5.cartel.css)), 1);
});
