import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ejecutar, contar, aJS, aPseudo } from '../../js/mecanicas/automata.js';
import C from '../../js/contenido/piso11.js';

const A = { op: 'avanzar' }, I = { op: 'izquierda' }, D = { op: 'derecha' };
const pasillo = { ancho: 5, alto: 1, inicio: { x: 0, y: 0, dir: 1 }, meta: { x: 4, y: 0 }, muros: [] };

test('una secuencia llega a la meta', () => {
  assert.equal(ejecutar(pasillo, [A, A, A, A]).llego, true);
  assert.equal(ejecutar(pasillo, [A, A]).error, 'corto');
});

test('chocar con un muro o el borde se detecta', () => {
  assert.equal(ejecutar({ ...pasillo, muros: [[2, 0]] }, [A, A, A]).error, 'muro');
  assert.equal(ejecutar(pasillo, [I, A]).error, 'muro');
});

test('las trampas paran al autómata', () => {
  assert.equal(ejecutar({ ...pasillo, trampas: [[3, 0]] }, [A, A, A, A]).error, 'trampa');
});

test('repetir y girar', () => {
  assert.equal(ejecutar(pasillo, [{ op: 'repetir', n: 4, cuerpo: [A] }]).llego, true);
  const r = ejecutar(pasillo, [D, D, D, D]);
  assert.equal(r.pasos.at(-1).dir, 1); // cuatro giros: vuelve a mirar al este
});

test('mientras con condicional sigue la pared (y un bucle vacío no se cuelga)', () => {
  const nivel = { ancho: 3, alto: 3, inicio: { x: 0, y: 0, dir: 1 }, meta: { x: 2, y: 2 }, muros: [] };
  const prog = [{ op: 'mientras', cuerpo: [{ op: 'si', entonces: [D], sino: [A] }] }];
  assert.equal(ejecutar(nivel, prog).llego, true);
  assert.equal(ejecutar(nivel, [{ op: 'mientras', cuerpo: [] }]).error, 'limite');
  assert.equal(ejecutar(nivel, [{ op: 'mientras', cuerpo: [D] }]).error, 'limite');
});

test('traducción a JS y pseudocódigo', () => {
  const prog = [{ op: 'repetir', n: 2, cuerpo: [A, D] }];
  assert.match(aJS(prog), /for \(let i = 0; i < 2; i\+\+\) \{\n  avanzar\(\);\n  girarDerecha\(\);\n\}/);
  assert.match(aPseudo(prog), /repetir 2 veces/);
  assert.equal(contar(prog), 3);
});

test('los niveles del Piso XI tienen solución y el programa con fallo no llega', () => {
  for (const n of C.niveles) assert.equal(ejecutar(n, n.solucion).llego, true, n.titulo);
  assert.equal(ejecutar(C.depurar.nivel, C.depurar.programa).llego, false);
  assert.equal(ejecutar(C.depurar.nivel, C.depurar.arreglado).llego, true);
});

test('el autómata del duelo final: el programa de Morvath falla y el arreglado llega', async () => {
  const { default: CIMA } = await import('../../js/contenido/cima.js');
  const a = CIMA.jefe.fases.find((f) => f.automata).automata;
  assert.equal(ejecutar(a, a.programa).llego, false);
  assert.equal(ejecutar(a, a.arreglado).llego, true);
});
