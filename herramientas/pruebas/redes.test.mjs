// Pruebas del Piso IV: grafos, direcciones IP y terminal simulada.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { conexo, ruta, esEstrella, puentes, sinPuntoUnico, subgrafo, clave } from '../../js/mecanicas/grafo.js';
import { leerIp, leerMascara, esPrivada, mismaSubred, esRedODifusion, validarEquipo } from '../../js/mecanicas/redes.js';
import { crearInterprete } from '../../js/mecanicas/terminal.js';

const E = (a, b, medio = 'utp') => ({ a, b, medio });
const N = ['r', 's', 'p1', 'p2', 'ap', 't', 'g'];

test('grafo: conexo y ruta', () => {
  const ar = [E('r', 's'), E('s', 'p1'), E('s', 'p2'), E('s', 'ap'), E('r', 't'), E('t', 'g', 'fibra')];
  assert.equal(conexo(N, ar), true);
  assert.deepEqual(ruta(N, ar, 'p1', 'g'), ['p1', 's', 'r', 't', 'g']);
  assert.equal(conexo(N, ar.slice(0, 4)), false);
  assert.equal(ruta(N, ar.slice(0, 4), 'r', 'g'), null);
});

test('grafo: estrella', () => {
  assert.equal(esEstrella([E('s', 'p1'), E('s', 'p2'), E('ap', 's')], 's', ['p1', 'p2', 'ap']), true);
  assert.equal(esEstrella([E('s', 'p1'), E('p1', 'p2'), E('s', 'ap')], 's', ['p1', 'p2', 'ap']), false);
  assert.equal(esEstrella([E('s', 'p1'), E('s', 'ap')], 's', ['p1', 'p2', 'ap']), false);
});

test('grafo: puentes (Tarjan) y redundancia', () => {
  const nucleo = ['r', 's', 't', 'g'];
  const cadena = [E('r', 's'), E('r', 't'), E('t', 'g')];
  assert.equal(puentes(nucleo, cadena).length, 3);
  assert.equal(sinPuntoUnico(nucleo, cadena), false);
  const anillo = [...cadena, E('g', 's')];
  assert.equal(puentes(nucleo, anillo).length, 0);
  assert.equal(sinPuntoUnico(nucleo, anillo), true);
  assert.equal(subgrafo(nucleo, [...anillo, E('s', 'p1')]).length, 4);
  assert.equal(clave('b', 'a'), clave('a', 'b'));
});

test('IP: lectura, privadas, subred, red y difusión', () => {
  assert.deepEqual(leerIp('192.168.20.5'), [192, 168, 20, 5]);
  assert.equal(leerIp('192.168.20'), null);
  assert.equal(leerIp('192.168.20.256'), null);
  assert.equal(leerMascara('255.255.255.0'), 24);
  assert.equal(leerMascara('/24'), 24);
  assert.equal(leerMascara('255.0.255.0'), null);
  assert.equal(esPrivada([192, 168, 1, 1]), true);
  assert.equal(esPrivada([172, 20, 0, 1]), true);
  assert.equal(esPrivada([172, 32, 0, 1]), false);
  assert.equal(esPrivada([8, 8, 8, 8]), false);
  assert.equal(mismaSubred([192, 168, 20, 5], [192, 168, 20, 1], 24), true);
  assert.equal(mismaSubred([192, 168, 21, 5], [192, 168, 20, 1], 24), false);
  assert.equal(esRedODifusion([192, 168, 20, 0], 24), true);
  assert.equal(esRedODifusion([192, 168, 20, 255], 24), true);
  assert.equal(esRedODifusion([192, 168, 20, 7], 24), false);
});

test('IP: validar la configuración de un equipo', () => {
  const red = { puerta: '192.168.20.1', prefijo: 24, ocupadas: ['192.168.20.10'] };
  const bien = { ip: '192.168.20.11', mascara: '255.255.255.0', puerta: '192.168.20.1', dns: '192.168.20.1' };
  assert.deepEqual(validarEquipo(bien, red), {});
  assert.ok(validarEquipo({ ...bien, ip: '192.168.30.11' }, red).ip.includes('fuera'));
  assert.ok(validarEquipo({ ...bien, ip: '80.58.1.1' }, red).ip.includes('pública'));
  assert.ok(validarEquipo({ ...bien, ip: '192.168.20.255' }, red).ip.includes('difusión'));
  assert.ok(validarEquipo({ ...bien, ip: '192.168.20.1' }, red).ip.includes('router'));
  assert.ok(validarEquipo({ ...bien, ip: '192.168.20.10' }, red).ip.includes('Otro equipo'));
  assert.ok(validarEquipo({ ...bien, mascara: '255.255.0.0' }, red).mascara);
  assert.ok(validarEquipo({ ...bien, puerta: '192.168.20.2' }, red).puerta);
  assert.ok(validarEquipo({ ...bien, dns: 'google' }, red).dns);
});

test('terminal: ping y tracert localizan el enlace roto', () => {
  const aristas = [E('r', 's'), E('s', 'p1'), E('r', 't'), E('t', 'g', 'fibra')];
  const cortadas = new Set();
  const ejecutar = crearInterprete({
    red: () => ({ nodos: ['r', 's', 'p1', 't', 'g'], aristas, cortadas }),
    equipos: {
      r: { ip: '192.168.20.1', nombre: 'router' }, s: { ip: '-', nombre: 'switch', capa2: true },
      p1: { ip: '192.168.20.11', nombre: 'pc1' }, t: { ip: '10.0.38.1', nombre: 'tenerife' }, g: { ip: '10.0.35.1', nombre: 'grancanaria' },
    },
    dns: { 'aldric.umbravel': 'g' },
    origen: 'r',
    miEquipo: () => ({ ip: '192.168.20.50', mascara: '255.255.255.0', puerta: '192.168.20.1', dns: '192.168.20.1', mac: '00-1A-2B-3C-4D-5E' }),
  });
  let r = ejecutar('ping aldric.umbravel');
  assert.ok(r.lineas.some((l) => l.includes('recibidos = 4')));
  r = ejecutar('tracert grancanaria');
  assert.equal(r.lineas.filter((l) => l.includes('ms')).length, 2); // tenerife y gran canaria
  cortadas.add(clave('t', 'g'));
  r = ejecutar('ping aldric.umbravel');
  assert.ok(r.lineas.some((l) => l.includes('100% perdidos')));
  r = ejecutar('tracert grancanaria');
  assert.ok(r.lineas.some((l) => l.includes('tenerife')));
  assert.ok(r.lineas.some((l) => l.includes('*')));
  assert.equal(ejecutar('reparar router-tenerife').accion, undefined);
  assert.deepEqual(ejecutar('reparar tenerife-grancanaria').accion, { reparar: clave('t', 'g') });
  assert.ok(ejecutar('ping switch').lineas[0].includes('MAC'));
  assert.ok(ejecutar('ping noexiste').lineas[0].includes('no pudo encontrar'));
  assert.ok(ejecutar('ipconfig /all').lineas.some((l) => l.includes('00-1A-2B')));
  assert.ok(ejecutar('xyz').lineas[0].includes('no se reconoce'));
});

test('terminal: con la isla aislada, tracert llega hasta el router vecino (no por el switch)', () => {
  const aristas = [E('r', 's'), E('r', 't'), E('t', 'g', 'fibra'), E('g', 's')];
  const cortadas = new Set([clave('t', 'g'), clave('g', 's')]);
  const ejecutar = crearInterprete({
    red: () => ({ nodos: ['r', 's', 't', 'g'], aristas, cortadas }),
    equipos: { r: { ip: '192.168.20.1', nombre: 'router' }, s: { ip: '-', nombre: 'switch', capa2: true }, t: { ip: '10.0.38.1', nombre: 'tenerife' }, g: { ip: '10.0.35.1', nombre: 'grancanaria' } },
    dns: {}, origen: 'r', miEquipo: () => ({}),
  });
  const l = ejecutar('tracert grancanaria').lineas;
  assert.ok(l.some((x) => x.includes('tenerife')), l.join('\n'));
  assert.equal(l.filter((x) => x.includes('*')).length, 3);
});
