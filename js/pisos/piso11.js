// Piso XI · El Taller de los Autómatas (pensamiento computacional y algoritmos; criterios 4.1 y 4.2).
//   1. El atril de los diagramas (oeste): símbolos de los diagramas de flujo y orden de un algoritmo.
//   2. El tablero de los autómatas (centro): 3 programas de bloques (secuencia, bucle,
//      condicional dentro de un bucle), con su traducción a JavaScript y pseudocódigo.
//   3. La mesa del depurador (este): un error de sintaxis y un programa con un error de lógica.
// El intérprete es propio (js/mecanicas/automata.js), sin dependencias.
import * as THREE from 'three';
import C from '../contenido/piso11.js';
import { crearSalaDeTorre, cargarPiezasTorre, PIEZAS_BASE } from '../nucleo/sala-torre.js';
import { makeLabel } from '../textures.js';
import { crearSellos, serieDePreguntas } from './comun.js';
import { abrirAutomata } from '../mecanicas/automataVista.js';
import { ejecutar } from '../mecanicas/automata.js';

export const ORIGEN = new THREE.Vector3(0, 0, -7000);
const P = 'piso11';
const SELLOS = ['diagramas', 'tablero', 'depurador'];
const EXTRA = ['column', 'table_medium_decorated_A', 'crates_stacked', 'barrel_small_stack', 'candle_triple', 'banner_green', 'banner_shield_green', 'banner_thin_green'];
const std = (o) => new THREE.MeshStandardMaterial(o);
const CASILLA = 2, TABLERO = { x: 0, z: 1 }; // el tablero 3D: 5 × 5 casillas de 2 m

export async function construir(ctx) {
  const { ui, sonido, fx, estado } = ctx;
  const piezas = await cargarPiezasTorre(ctx.paletas.mazmorra, [...PIEZAS_BASE, ...EXTRA]);
  const sala = crearSalaDeTorre({
    ambiente: { color: 0xffc070, cada: 0.07, brillo: 0.7, sube: 0.3, vida: 3 },
    escena: ctx.escena, origen: ORIGEN, piezas, fx, semilla: 111, cielo: [0.2, 0.28, 0.32],
    estandartes: { normal: 'banner_green', escudo: 'banner_shield_green', fino: 'banner_thin_green' },
  });
  const { poner, obstaculo, aMundo, grupo } = sala;
  const S = crearSellos(ctx, sala, C, SELLOS);
  const est = { sellos: S.estado.sellos, diagramas: { paso: 0 }, nivel: 0, sintaxis: { paso: 0 } };
  const aprendido = (id) => estado.learned.has(id);

  // ---------- El tablero 3D con su autómata de latón ----------
  const casillaA = std({ color: 0x3a3a4a, roughness: 0.9 }), casillaB = std({ color: 0x2c2c38, roughness: 0.9 });
  const meta = std({ color: 0xd4af6a, emissive: 0x6a4a1a, emissiveIntensity: 0.8 });
  const losas = [];
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(CASILLA - 0.12, 0.08, CASILLA - 0.12), (x + y) % 2 ? casillaA : casillaB);
    l.position.set(TABLERO.x + (x - 2) * CASILLA, 0.04, TABLERO.z + (y - 2) * CASILLA);
    l.receiveShadow = true;
    grupo.add(l);
    losas.push(l);
  }
  const marcaMeta = new THREE.Mesh(new THREE.BoxGeometry(CASILLA - 0.5, 0.1, CASILLA - 0.5), meta);
  grupo.add(marcaMeta);
  const automata = new THREE.Group();
  const laton = std({ color: 0xb8893a, metalness: 0.85, roughness: 0.35 });
  const cuerpo = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.9, 16), laton);
  cuerpo.position.y = 0.55;
  const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), laton);
  cabeza.position.y = 1.2;
  const ojo = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 2.2, 2.6) }));
  ojo.position.set(0, 0.05, 0.28); // va en la cabeza: salta y gira con ella
  const llave = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 8, 16), laton);
  llave.position.set(0, 0.7, -0.5);
  for (const m of [cuerpo, cabeza]) m.castShadow = true;
  cabeza.add(ojo);
  automata.add(cuerpo, cabeza, llave);
  grupo.add(automata);
  // en el tablero: x hacia el este, y hacia el sur (como en el editor); dir 0 = norte (-z)
  const enTablero = (x, y) => new THREE.Vector3(TABLERO.x + (x - 2) * CASILLA, 0.08, TABLERO.z + (y - 2) * CASILLA);
  const recorrido = [];
  function colocarNivel(n) {
    automata.position.copy(enTablero(n.inicio.x, n.inicio.y));
    automata.rotation.y = Math.PI - (n.inicio.dir * Math.PI) / 2;
    marcaMeta.position.copy(enTablero(n.meta.x, n.meta.y)).setY(0.12);
  }
  colocarNivel(C.niveles[0]);
  // el autómata 3D repite lo que el jugador ha programado
  function representar(n, programa) {
    colocarNivel(n);
    recorrido.length = 0;
    for (const p of ejecutar(n, programa).pasos) recorrido.push({ pos: enTablero(p.x, p.y), giro: Math.PI - (p.dir * Math.PI) / 2 });
  }

  // ---------- El atril de los diagramas (oeste) y la mesa del depurador (este) ----------
  const ATRIL = { x: -9, z: -6 }, MESA = { x: 9, z: -6 };
  poner('column', ATRIL.x, 0, ATRIL.z);
  obstaculo(ATRIL.x, ATRIL.z, 0.5);
  // un diagrama de flujo luminoso flotando sobre el atril
  const trazo = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 1.6, 2.2) });
  const diagrama = new THREE.Group();
  const ovalo = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 6, 24), trazo);
  ovalo.scale.set(1.4, 0.7, 1);
  ovalo.position.y = 0.9;
  const rombo = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 4, 4), trazo);
  rombo.position.y = 0.35;
  const caja = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 4, 4), trazo);
  caja.rotation.z = Math.PI / 4;
  caja.scale.set(1.3, 0.8, 1);
  caja.position.y = -0.2;
  diagrama.add(ovalo, rombo, caja);
  diagrama.position.set(ATRIL.x, 2.5, ATRIL.z);
  grupo.add(diagrama);
  poner('table_medium_decorated_A', MESA.x, 0, MESA.z, Math.PI / 2);
  obstaculo(MESA.x, MESA.z - 0.6, 0.8);
  obstaculo(MESA.x, MESA.z + 0.6, 0.8);
  poner('crates_stacked', 10.4, 0, 9, 0.3);
  obstaculo(10.4, 9, 1.0);
  poner('barrel_small_stack', -10.4, 0, 9, 0);
  obstaculo(-10.4, 9, 0.9);

  for (const [t, x, z, y] of [['El atril de los diagramas', ATRIL.x, ATRIL.z, 3.4], ['El tablero de los autómatas', TABLERO.x, TABLERO.z - 5.6, 2.6], ['La mesa del depurador', MESA.x, MESA.z, 2.4]]) {
    const l = makeLabel(t, { height: 0.32, fontSize: 40, font: 'Cinzel, serif', color: '#f0d9a6' });
    l.position.set(x, y, z);
    grupo.add(l);
  }

  // ---------- Los tres sellos ----------
  const alResultado = (ok) => { ctx.record(ok, '4.2'); ok ? sonido.acierto() : sonido.fallo(); };
  async function hacerDiagramas() {
    if (await serieDePreguntas(ctx, C.diagramas, 'El atril de los diagramas', est.diagramas)) ctx.accion('mec', { piso: P, mec: 'diagramas', paso: 'sello' });
  }
  async function hacerTablero() {
    for (let i = est.nivel; i < C.niveles.length; i++) {
      const n = C.niveles[i];
      const ok = await abrirAutomata(ui, n, { cabecera: `${n.titulo} · ${i + 1} de ${C.niveles.length}`, alResultado: (r) => alResultado(r) });
      if (!ok) return;
      est.nivel = i + 1;
      ctx.refrescarObjetivos();
      representar(n, ok); // el autómata 3D repite el programa del jugador
      ui.toast(`✦ ${n.titulo} superado`, 'seal', 2500);
    }
    ctx.accion('mec', { piso: P, mec: 'tablero', paso: 'sello' });
  }
  async function hacerDepurador() {
    if (!(await serieDePreguntas(ctx, [C.sintaxis], 'La mesa del depurador · el error de sintaxis', est.sintaxis))) return;
    const d = C.depurar;
    const ok = await abrirAutomata(ui, { ...d.nivel, titulo: d.titulo, enunciado: d.enunciado, bloques: d.bloques }, { programa: d.programa, cabecera: 'La mesa del depurador · el error de lógica', alResultado });
    if (!ok) return;
    representar(d.nivel, ok);
    ctx.accion('mec', { piso: P, mec: 'depurador', paso: 'sello' });
  }

  const zona = sala.zona;
  // el autómata sigue la partida: da un saltito al acertar y niega con la cabeza al fallar
  let salto = 0, niega = 0;
  const responderSala = zona.alResponder;
  zona.alResponder = (ok, racha) => {
    responderSala?.(ok, racha);
    if (ok) salto = 1; else niega = 1;
  };
  const interactuables = [
    {
      zona, pos: aMundo(ATRIL.x + 1.3, 0, ATRIL.z), r: 2.2,
      enabled: () => !est.sellos.diagramas,
      prompt: () => (aprendido('pensamiento') ? '**E** · Estudiar el atril de los diagramas' : '**E** · Examinar el atril'),
      action: () => (aprendido('pensamiento') ? hacerDiagramas() : ctx.accion('leccion', { id: 'pensamiento', piso: P, luego: 'diagramas11' })),
    },
    {
      zona, pos: aMundo(TABLERO.x, 0, TABLERO.z + 5.6), r: 2.8,
      enabled: () => !est.sellos.tablero,
      prompt: () => (aprendido('programacion') ? '**E** · Programar el autómata' : '**E** · Examinar el tablero'),
      action: () => (aprendido('programacion') ? hacerTablero() : ctx.accion('leccion', { id: 'programacion', piso: P, luego: 'tablero11' })),
    },
    {
      zona, pos: aMundo(MESA.x - 1.4, 0, MESA.z), r: 2.2,
      enabled: () => !est.sellos.depurador,
      prompt: () => (aprendido('depuracion') ? '**E** · Usar la mesa del depurador' : '**E** · Examinar la mesa del depurador'),
      action: () => (aprendido('depuracion') ? hacerDepurador() : ctx.accion('leccion', { id: 'depuracion', piso: P, luego: 'depurador11' })),
    },
  ];

  const validar = (d) => SELLOS.includes(d.mec) && !est.sellos[d.mec];
  const clave = (d) => `mec:${P}:${d.mec}:sello`;
  function aplicar(d) {
    if (d.mec === 'tablero') fx.big.emit(aMundo(TABLERO.x, 1.2, TABLERO.z), { count: 90, color: 0xffd27a, intensity: 2, speed: 3.5, life: 1.2, gravity: -2 });
    ctx.runFlow(() => S.romper(d.mec));
    ctx.refrescarObjetivos();
  }

  let relojPaso = 0;
  function actualizar(dt, t) {
    sala.update(dt, t);
    diagrama.rotation.y += dt * 0.6;
    diagrama.position.y = 2.5 + Math.sin(t * 1.5) * 0.08;
    ojo.material.color.setRGB(0.6, 2.2 + Math.sin(t * 4) * 0.4, 2.6);
    salto = Math.max(0, salto - dt * 2.2);
    niega = Math.max(0, niega - dt * 1.6);
    llave.rotation.z += dt * (2 + salto * 14);
    cabeza.position.y = 1.2 + Math.sin(salto * Math.PI) * 0.35;
    cabeza.rotation.y = Math.sin(niega * 18) * 0.5 * niega;
    if (recorrido.length) {
      relojPaso -= dt;
      const sig = recorrido[0];
      automata.position.lerp(sig.pos, Math.min(1, dt * 7));
      automata.rotation.y += (sig.giro - automata.rotation.y) * Math.min(1, dt * 9);
      if (relojPaso <= 0) { relojPaso = 0.32; recorrido.shift(); sonido.paso?.('piedra', false); }
    }
  }
  function objetivos() {
    const items = [
      { text: `Estudia el atril de los diagramas (${Math.min(est.diagramas.paso, C.diagramas.length)}/${C.diagramas.length})`, done: est.sellos.diagramas },
      { text: `Programa el autómata (${est.nivel}/${C.niveles.length} tableros)`, done: est.sellos.tablero },
      { text: 'Arregla los programas de la mesa del depurador', done: est.sellos.depurador },
    ];
    if (S.estado.puerta) items.push({ text: 'Subid por la escalera del norte', done: false });
    return items;
  }
  function pista() {
    if (!est.sellos.diagramas) return C.pistas.diagramas;
    if (!est.sellos.tablero) return C.pistas.tablero;
    if (!est.sellos.depurador) return C.pistas.depurador;
    return C.pistas.puerta;
  }
  function destino() {
    if (!est.sellos.diagramas) return aMundo(ATRIL.x + 1.3, 0, ATRIL.z);
    if (!est.sellos.tablero) return aMundo(TABLERO.x, 0, TABLERO.z + 5.6);
    if (!est.sellos.depurador) return aMundo(MESA.x - 1.4, 0, MESA.z);
    return 'salida';
  }

  Object.assign(zona, {
    id: P, nombre: C.nombre, musica: 'taller',
    actualizar, objetivos, pista, destino,
    salida: { abierta: () => S.estado.puerta, z: sala.salidaZ, accion: ['subir', { piso: 'piso12' }] },
  });
  zona.grupo.visible = false;

  return {
    id: P, zona, interactuables, contenido: C, estado: est,
    validar, clave, aplicar, jugadorFuera() {},
    async alAprender(id, soyAutor, luego) {
      if (!soyAutor) return;
      if (luego === 'diagramas11') await hacerDiagramas();
      if (luego === 'tablero11') await hacerTablero();
      if (luego === 'depurador11') await hacerDepurador();
    },
    intro: () => ui.dialogue(C.intro),
  };
}
