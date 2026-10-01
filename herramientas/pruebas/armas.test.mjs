// Pruebas de las armas: alcance de cada golpe y datos de cada personaje.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { alcanza, ARMAS } from '../../js/armas.js';

const PERSONAJES = Object.entries(ARMAS).map(([id, a]) => ({ id, ...a }));
const ataqueDe = (id) => ARMAS[id].ataque;

const O = { x: 0, z: 0 }, NORTE = { x: 0, z: -1 };

test('tajo: alcanza por delante y en diagonal, no por detrás ni lejos', () => {
  const { alcance, arco } = ataqueDe('caballero');
  assert.equal(alcanza(O, NORTE, { x: 0, z: -2 }, alcance, arco), true);
  assert.equal(alcanza(O, NORTE, { x: 1.5, z: -1.5 }, alcance, arco), true);
  assert.equal(alcanza(O, NORTE, { x: 0, z: 2 }, alcance, arco), false);
  assert.equal(alcanza(O, NORTE, { x: 0, z: -5 }, alcance, arco), false);
});

test('giro: alcanza en todas direcciones', () => {
  const { alcance, arco } = ataqueDe('barbaro');
  for (const d of [{ x: 0, z: 2.5 }, { x: -2.5, z: 0 }, { x: 2, z: -2 }]) assert.equal(alcanza(O, NORTE, d, alcance, arco), true);
  assert.equal(alcanza(O, NORTE, { x: 0, z: 4 }, alcance, arco), false);
});

test('cada personaje tiene un ataque distinto y completo', () => {
  const tipos = new Set(PERSONAJES.map((p) => p.ataque.tipo));
  assert.equal(tipos.size, PERSONAJES.length);
  for (const p of PERSONAJES) {
    assert.ok(p.armas.length, p.id);
    for (const k of ['anim', 'alcance', 'enfriamiento', 'nombre']) assert.ok(p.ataque[k] !== undefined, `${p.id}.${k}`);
  }
  assert.ok(ataqueDe('picaro').alcance > 10, 'la ballesta llega lejos');
  assert.ok(ataqueDe('encapuchado').enfriamiento < ataqueDe('barbaro').enfriamiento, 'las dagas son las más rápidas');
});
