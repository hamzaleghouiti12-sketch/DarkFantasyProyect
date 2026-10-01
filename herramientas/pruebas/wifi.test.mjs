import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validarWifi } from '../../js/mecanicas/redes.js';

const bien = { ssid: 'Faro del Archipielago', seguridad: 'WPA3', clave: 'Gaviota-Roja-2026' };

test('una configuración correcta no da errores', () => {
  assert.deepEqual(validarWifi(bien), {});
  assert.deepEqual(validarWifi({ ...bien, seguridad: 'wpa3-personal' }), {});
});

test('seguridad: abierta, WEP y WPA2 no valen', () => {
  for (const s of ['abierta', 'WEP', 'WPA2', 'wpa2 personal', '']) assert.ok(validarWifi({ ...bien, seguridad: s }).seguridad, s);
});

test('contraseñas débiles', () => {
  assert.ok(validarWifi({ ...bien, clave: 'Corta1!' }).clave);
  assert.ok(validarWifi({ ...bien, clave: 'MiPassword2026!' }).clave);
  assert.ok(validarWifi({ ...bien, clave: 'solominusculaslarga' }).clave);
  assert.ok(validarWifi({ ssid: 'Casa', seguridad: 'WPA3', clave: 'Casa-Grande-2026' }).clave); // contiene el SSID
});

test('SSID vacío, largo o con datos personales', () => {
  assert.ok(validarWifi({ ...bien, ssid: '' }).ssid);
  assert.ok(validarWifi({ ...bien, ssid: 'x'.repeat(33) }).ssid);
  assert.ok(validarWifi({ ...bien, ssid: 'Familia 666777888' }).ssid);
});
