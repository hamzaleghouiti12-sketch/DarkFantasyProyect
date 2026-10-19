// Piso XII · La Fragua del Código (lenguajes, POO, dispositivos y datos; criterios 4.3 y 4.4).
//   1. El molde de las criaturas (oeste): completar clases (class, extends, super, new).
//      Al acertar, las criaturas «forjadas» aparecen en la sala con su nombre.
//   2. La placa de luces (norte): dibujar la runa en 5 × 5 LED (el código se genera en vivo)
//      y programar el evento «al pulsar A». La placa 3D de la pared muestra lo que se dibuja.
//   3. El libro de registro (este): completar el código que cuenta visitas en un CSV (con su
//      comentario) y leer el resumen.txt que escribe.
import * as THREE from 'three';
import C from '../contenido/piso12.js';
import { crearSalaDeTorre, cargarPiezasTorre, PIEZAS_BASE } from '../nucleo/sala-torre.js';
import { makeLabel } from '../textures.js';
import { crearSellos, serieDePreguntas } from './comun.js';
import { abrirHuecos, abrirPlaca, abrirRegistro } from '../mecanicas/fraguaVista.js';
import { cargarEnemigo, crearEnemigo } from '../enemigos.js';

export const ORIGEN = new THREE.Vector3(0, 0, -7700);
const P = 'piso12';
const SELLOS = ['molde', 'placa', 'registro'];
const EXTRA = ['column', 'crates_stacked', 'barrel_large', 'table_medium_decorated_A', 'sword_shield', 'banner_red', 'banner_shield_red', 'banner_thin_red'];
const std = (o) => new THREE.MeshStandardMaterial(o);

export async function construir(ctx) {
  const { ui, sonido, fx, estado } = ctx;
  const piezas = await cargarPiezasTorre(ctx.paletas.mazmorra, [...PIEZAS_BASE, ...EXTRA]);
  const sala = crearSalaDeTorre({
    ambiente: { color: 0xff8a3a, cada: 0.04, brillo: 1.2, sube: 0.9, vida: 3 },
    escena: ctx.escena, origen: ORIGEN, piezas, fx, semilla: 121, cielo: [0.32, 0.16, 0.12],
    estandartes: { normal: 'banner_red', escudo: 'banner_shield_red', fino: 'banner_thin_red' },
  });
  const { poner, obstaculo, aMundo, grupo } = sala;
  const S = crearSellos(ctx, sala, C, SELLOS);
  const est = { sellos: S.estado.sellos, pregunta: { paso: 0 }, registroHecho: false };
  const aprendido = (id) => estado.learned.has(id);

  // ---------- El molde de las criaturas (oeste) ----------
  const MOLDE = { x: -8.6, z: -2 };
  poner('crates_stacked', MOLDE.x - 1.2, 0, MOLDE.z - 2, 0.4);
  obstaculo(MOLDE.x - 1.2, MOLDE.z - 2, 1.0);
  const yunque = new THREE.Group();
  const hierro = std({ color: 0x3a3a44, metalness: 0.8, roughness: 0.4 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.5), hierro);
  base.position.y = 0.4;
  const cara = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 0.6), hierro);
  cara.position.y = 0.95;
  const brasa = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.3), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 1, 0.3) }));
  brasa.position.y = 1.13;
  yunque.add(base, cara, brasa);
  yunque.position.set(MOLDE.x, 0, MOLDE.z);
  grupo.add(yunque);
  obstaculo(MOLDE.x, MOLDE.z, 0.8);
  const criaturas = [];
  async function forjarCriaturas() {
    for (const [i, c] of C.molde.criaturas.entries()) {
      try {
        const e = crearEnemigo(await cargarEnemigo(c.tipo));
        e.g.position.copy(aMundo(MOLDE.x + 2.2, 0, MOLDE.z - 2.4 + i * 2.4)).sub(ORIGEN);
        e.g.rotation.y = Math.PI / 2;
        e.anim.bucle('Idle');
        const l = makeLabel(c.nombre, { height: 0.26, fontSize: 40 });
        l.position.y = 2.3;
        e.g.add(l);
        grupo.add(e.g);
        criaturas.push(e);
        fx.big.emit(e.g.position.clone().add(ORIGEN).setY(1), { count: 50, color: 0xff9a3a, intensity: 2, speed: 2.5, life: 1, gravity: -1 });
      } catch (err) { console.warn('Criatura sin modelo', err); }
    }
  }

  // ---------- La placa de luces (pared norte) ----------
  const PLACA = { x: 0, z: -13.5 };
  const marco = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.4, 0.3), std({ color: 0x2a2230, roughness: 0.7 }));
  marco.position.set(PLACA.x, 2.8, PLACA.z - 0.4);
  grupo.add(marco);
  const apagado = new THREE.Color(0.12, 0.08, 0.12), encendido = new THREE.Color(3, 0.4, 0.3);
  const leds = [];
  for (let f = 0; f < 5; f++) for (let c = 0; c < 5; c++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), new THREE.MeshBasicMaterial({ color: apagado.clone() }));
    m.position.set(PLACA.x + (c - 2) * 0.6, 2.8 + (2 - f) * 0.6, PLACA.z - 0.2);
    grupo.add(m);
    leds.push(m);
  }
  const mostrarEnPlaca = (filas) => filas.forEach((fila, f) => [...fila].forEach((v, c) => leds[f * 5 + c].material.color.copy(v === '1' ? encendido : apagado)));
  obstaculo(PLACA.x, PLACA.z - 0.4, 1.6);

  // ---------- El libro de registro (este) ----------
  const REG = { x: 8.6, z: -2 };
  poner('column', REG.x, 0, REG.z);
  obstaculo(REG.x, REG.z, 0.5);
  const libro = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.45), std({ color: 0x6a3a2a, roughness: 0.8, emissive: 0x2a1008 }));
  libro.position.set(REG.x, 1.95, REG.z);
  libro.rotation.x = -0.3;
  grupo.add(libro);
  poner('barrel_large', 10.5, 0, 9, 0);
  obstaculo(10.5, 9, 0.9);
  poner('sword_shield', -10.8, 1.6, 6, Math.PI / 2, 1, false);

  for (const [t, x, z, y] of [['El molde de las criaturas', MOLDE.x, MOLDE.z, 2.4], ['La placa de luces', PLACA.x, PLACA.z, 5.0], ['El libro de registro', REG.x, REG.z, 2.8]]) {
    const l = makeLabel(t, { height: 0.32, fontSize: 40, font: 'Cinzel, serif', color: '#f0d9a6' });
    l.position.set(x, y, z);
    grupo.add(l);
  }

  // ---------- Los tres sellos ----------
  const alResultado = (crit) => (ok) => { ctx.record(ok, crit); ok ? sonido.acierto() : sonido.fallo(); };
  async function hacerMolde() {
    if (await abrirHuecos(ui, { ...C.molde, alResultado: alResultado('4.3') })) ctx.accion('mec', { piso: P, mec: 'molde', paso: 'sello' });
  }
  async function hacerPlaca() {
    if (await abrirPlaca(ui, C.placa, { alResultado: alResultado('4.4'), alMostrar: (filas) => mostrarEnPlaca(filas) })) ctx.accion('mec', { piso: P, mec: 'placa', paso: 'sello' });
  }
  async function hacerRegistro() {
    if (!est.registroHecho) {
      if (!(await abrirRegistro(ui, C.registro, { alResultado: alResultado('4.3') }))) return;
      est.registroHecho = true;
    }
    if (await serieDePreguntas(ctx, [C.registro.pregunta], 'El libro de registro · resumen.txt', est.pregunta)) ctx.accion('mec', { piso: P, mec: 'registro', paso: 'sello' });
  }

  const zona = sala.zona;
  // las criaturas forjadas animan: vitorean cada acierto y se cubren con cada fallo
  const responderSala = zona.alResponder;
  zona.alResponder = (ok, racha) => {
    responderSala?.(ok, racha);
    criaturas.forEach((c, i) => setTimeout(() => c.anim.unaVezSolo(ok ? 'Cheer' : 'Block_Hit'), i * 120));
  };
  const interactuables = [
    {
      zona, pos: aMundo(MOLDE.x + 1.4, 0, MOLDE.z), r: 2.2,
      enabled: () => !est.sellos.molde,
      prompt: () => (aprendido('poo') ? '**E** · Completar el molde de las criaturas' : '**E** · Examinar el molde'),
      action: () => (aprendido('poo') ? hacerMolde() : ctx.accion('leccion', { id: 'poo', piso: P, luego: 'molde12' })),
    },
    {
      zona, pos: aMundo(PLACA.x, 0, PLACA.z + 2.2), r: 2.4,
      enabled: () => !est.sellos.placa,
      prompt: () => (aprendido('dispositivos') ? '**E** · Programar la placa de luces' : '**E** · Examinar la placa de luces'),
      action: () => (aprendido('dispositivos') ? hacerPlaca() : ctx.accion('leccion', { id: 'dispositivos', piso: P, luego: 'placa12' })),
    },
    {
      zona, pos: aMundo(REG.x - 1.4, 0, REG.z), r: 2.2,
      enabled: () => !est.sellos.registro,
      prompt: () => (aprendido('datos') ? '**E** · Abrir el libro de registro' : '**E** · Examinar el libro de registro'),
      action: () => (aprendido('datos') ? hacerRegistro() : ctx.accion('leccion', { id: 'datos', piso: P, luego: 'registro12' })),
    },
  ];

  const validar = (d) => SELLOS.includes(d.mec) && !est.sellos[d.mec];
  const clave = (d) => `mec:${P}:${d.mec}:sello`;
  function aplicar(d) {
    if (d.mec === 'molde') forjarCriaturas();
    if (d.mec === 'placa') mostrarEnPlaca(C.placa.runa);
    ctx.runFlow(() => S.romper(d.mec));
    ctx.refrescarObjetivos();
  }

  function actualizar(dt, t) {
    sala.update(dt, t);
    brasa.material.color.setRGB(3 + Math.sin(t * 6) * 0.6, 1, 0.3);
    for (const c of criaturas) c.anim.update(dt);
  }
  function objetivos() {
    const items = [
      { text: 'Completa el molde de las criaturas', done: est.sellos.molde },
      { text: 'Programa la placa de luces', done: est.sellos.placa },
      { text: 'Cuenta las visitas del libro de registro', done: est.sellos.registro },
    ];
    if (S.estado.puerta) items.push({ text: 'Subid por la escalera del norte', done: false });
    return items;
  }
  function pista() {
    if (!est.sellos.molde) return C.pistas.molde;
    if (!est.sellos.placa) return C.pistas.placa;
    if (!est.sellos.registro) return C.pistas.registro;
    return C.pistas.puerta;
  }
  function destino() {
    if (!est.sellos.molde) return aMundo(MOLDE.x + 1.4, 0, MOLDE.z);
    if (!est.sellos.placa) return aMundo(PLACA.x, 0, PLACA.z + 2.2);
    if (!est.sellos.registro) return aMundo(REG.x - 1.4, 0, REG.z);
    return 'salida';
  }

  Object.assign(zona, {
    id: P, nombre: C.nombre, musica: 'forja',
    actualizar, objetivos, pista, destino,
    salida: { abierta: () => S.estado.puerta, z: sala.salidaZ, accion: ['subir', { piso: 'piso13' }] },
  });
  zona.grupo.visible = false;

  return {
    id: P, zona, interactuables, contenido: C, estado: est,
    validar, clave, aplicar, jugadorFuera() {},
    async alAprender(id, soyAutor, luego) {
      if (!soyAutor) return;
      if (luego === 'molde12') await hacerMolde();
      if (luego === 'placa12') await hacerPlaca();
      if (luego === 'registro12') await hacerRegistro();
    },
    intro: () => ui.dialogue(C.intro),
  };
}
