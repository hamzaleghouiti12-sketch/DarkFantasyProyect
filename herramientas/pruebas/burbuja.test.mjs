import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearBurbuja, variedad, semilla } from '../../js/mecanicas/burbuja.js';

const temas = Object.fromEntries(['deporte', 'ciencia', 'musica', 'juegos', 'moda', 'politica'].map((t) => [t, Array.from({ length: 8 }, (_, i) => `${t} ${i}`)]));

test('el primer muro es variado', () => {
  let total = 0;
  for (let s = 1; s <= 20; s++) total += variedad(crearBurbuja(temas, semilla(s)).muro(6));
  assert.ok(total / 20 >= 3.5, `media ${total / 20}`);
});

test('eligiendo siempre lo mismo, la burbuja se cierra', () => {
  let antes = 0, despues = 0, delTema = 0;
  for (let s = 1; s <= 20; s++) {
    const b = crearBurbuja(temas, semilla(s));
    antes += variedad(b.muro(6));
    for (let i = 0; i < 5; i++) b.elegir('juegos');
    const m = b.muro(6);
    despues += variedad(m);
    delTema += m.filter((x) => x.tema === 'juegos').length;
  }
  assert.ok(despues < antes, `${despues} < ${antes}`);
  assert.ok(delTema / 20 >= 4, `media de titulares de juegos: ${delTema / 20}`);
});

test('no repite titulares en un muro', () => {
  const b = crearBurbuja(temas, semilla(3));
  for (let i = 0; i < 6; i++) b.elegir('moda');
  const m = b.muro(6);
  assert.equal(new Set(m.map((x) => x.titular)).size, m.length);
});
