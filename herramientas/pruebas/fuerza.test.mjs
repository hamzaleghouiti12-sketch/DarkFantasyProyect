import { test } from 'node:test';
import assert from 'node:assert/strict';
import { intentosNecesarios, tiempoDeCrackeo, tiempoLegible } from '../../js/mecanicas/fuerza.js';

test('las más usadas caen al instante', () => {
  assert.equal(intentosNecesarios('123456789'), 1);
  assert.equal(tiempoDeCrackeo('Contraseña'), 'al instante');
});

test('palabra + año cae en segundos', () => {
  assert.equal(tiempoDeCrackeo('maria2009'), 'en unos 2 segundos');
});

test('una frase larga con símbolos aguanta más que el universo', () => {
  assert.equal(tiempoDeCrackeo('Gato-Luna-Tostada-47!'), 'en más tiempo que la edad del universo');
});

test('la fuerza bruta crece con la longitud', () => {
  assert.ok(intentosNecesarios('aB3$aB3$aB') > intentosNecesarios('aB3$aB3$'));
});

test('formatos legibles', () => {
  assert.equal(tiempoLegible(90), 'en unos 2 minutos');
  assert.equal(tiempoLegible(86400), 'en 1 día');
  assert.match(tiempoLegible(31557600 * 3e6), /millones de años/);
});
