// Piso VI · La Forja de las Formas (modelado 3D y realidades, criterio 2.1).
//   1. Forjar la llave en el yunque (forjaVista): primitivas que suman o restan,
//      con posición y medidas numéricas; parecido con el molde ≥ 85 % y puntos de control.
//   2. El banco de medidas: vértices, aristas, caras, Euler, STL y laminado.
//   3. El altar de las herramientas (elegir con encargos): Tinkercad, SketchUp, Blender…
// Opcional: el visor de realidades (RV, RA, RM) junto a la entrada.
import * as THREE from 'three';
import C, { LLAVE, CONTROLES } from '../contenido/piso6.js';
import { crearSalaDeTorre, cargarPiezasTorre, PIEZAS_BASE } from '../nucleo/sala-torre.js';
import { makeLabel } from '../textures.js';
import { abrirForja } from '../mecanicas/forjaVista.js';
import { crearElegir } from '../mecanicas/elegir.js';
import { crearSellos, serieDePreguntas } from './comun.js';

export const ORIGEN = new THREE.Vector3(0, 0, -3500);
const P = 'piso6';
const SELLOS = ['llave', 'medidas', 'programas'];
const EXTRA = ['column', 'barrel_large', 'crates_stacked', 'box_stacked', 'table_medium', 'sword_shield', 'candle_triple', 'banner_red', 'banner_shield_red', 'banner_thin_red'];
const std = (o) => new THREE.MeshStandardMaterial(o);

export async function construir(ctx) {
  const { ui, sonido, fx, estado } = ctx;
  const piezas = await cargarPiezasTorre(ctx.paletas.mazmorra, [...PIEZAS_BASE, ...EXTRA]);
  const sala = crearSalaDeTorre({
    escena: ctx.escena, origen: ORIGEN, piezas, fx, semilla: 66, cielo: [0.4, 0.22, 0.2],
    estandartes: { normal: 'banner_red', escudo: 'banner_shield_red', fino: 'banner_thin_red' },
  });
  const { poner, obstaculo, aMundo, grupo } = sala;
  const S = crearSellos(ctx, sala, C, SELLOS);
  const est = { sellos: S.estado.sellos, piezas: [], medidas: { paso: 0 } };
  const aprendido = (id) => estado.learned.has(id);

  // ---------- El yunque del centro ----------
  const hierro = std({ color: 0x3a3a42, metalness: 0.85, roughness: 0.4 });
  const YUNQUE = { x: 0, z: -1 };
  const yunque = new THREE.Group();
  const trozo = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), hierro); m.position.set(x, y, z); m.castShadow = true; yunque.add(m); };
  trozo(1.4, 0.5, 1.0, 0, 0.25, 0);
  trozo(0.7, 0.5, 0.6, 0, 0.75, 0);
  trozo(2.2, 0.35, 0.9, 0, 1.17, 0);
  const cuerno = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.1, 14), hierro);
  cuerno.rotation.z = Math.PI / 2;
  cuerno.position.set(1.6, 1.17, 0);
  yunque.add(cuerno);
  yunque.position.set(YUNQUE.x, 0, YUNQUE.z);
  grupo.add(yunque);
  obstaculo(YUNQUE.x, YUNQUE.z, 1.3);
  // la llave forjada aparece sobre el yunque al romper el sello
  const llave = new THREE.Group();
  const oro = std({ color: 0xffd27a, metalness: 1, roughness: 0.25, emissive: 0x6a4a10, emissiveIntensity: 0.6 });
  for (const p of LLAVE) {
    if (p.op === 'restar') continue;
    const g = p.tipo === 'caja' ? new THREE.BoxGeometry(p.ancho, p.alto, p.fondo) : new THREE.CylinderGeometry(p.radio, p.radio, p.largo, 16);
    if (p.tipo === 'cilindro' && p.eje === 'x') g.rotateZ(Math.PI / 2);
    const m = new THREE.Mesh(g, oro);
    m.position.set(p.x, p.y, p.z);
    llave.add(m);
  }
  llave.scale.setScalar(0.3);
  llave.position.set(YUNQUE.x, 1.55, YUNQUE.z);
  llave.visible = false;
  grupo.add(llave);
  const rYunque = makeLabel('El yunque', { height: 0.32, fontSize: 42 });
  rYunque.position.set(YUNQUE.x, 2.3, YUNQUE.z);
  grupo.add(rYunque);

  // ---------- El horno (una luz naranja que late) ----------
  const HORNO = { x: 9.6, z: -10 };
  const piedra = std({ color: 0x4a403c, roughness: 0.95 });
  const horno = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3, 2.4), piedra);
  horno.position.set(HORNO.x, 1.5, HORNO.z);
  horno.castShadow = true;
  const boca = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.9), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.2, 0.3) }));
  boca.position.set(HORNO.x - 1.31, 1.0, HORNO.z);
  boca.rotation.y = -Math.PI / 2;
  const luzHorno = new THREE.PointLight(0xff7a2a, 30, 14, 1.6);
  luzHorno.position.set(HORNO.x - 2, 1.3, HORNO.z);
  grupo.add(horno, boca, luzHorno);
  obstaculo(HORNO.x, HORNO.z, 1.7);
  for (const [n, x, z, ry, r] of [['barrel_large', -10.3, 15.5, 0.3, 0.9], ['crates_stacked', 10.2, 15.2, -0.3, 1.1], ['box_stacked', -10.2, -15.5, 0.2, 0.9], ['table_medium', 9.8, -4, Math.PI / 2, 1.1]]) { poner(n, x, 0, z, ry); obstaculo(x, z, r); }
  poner('sword_shield', -6, 2.3, 17.88, Math.PI, 1, false);

  // ---------- Banco de medidas (este) ----------
  const BANCO = { x: 7.4, z: 4 };
  poner('column', BANCO.x, 0, BANCO.z);
  obstaculo(BANCO.x, BANCO.z, 0.45);
  const cubo = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.6, 0.6, 0.6)), new THREE.LineBasicMaterial({ color: 0x9fe6ff }));
  cubo.position.set(BANCO.x, 1.95, BANCO.z);
  grupo.add(cubo);
  const rBanco = makeLabel('Banco de medidas', { height: 0.3, fontSize: 40 });
  rBanco.position.set(BANCO.x, 2.6, BANCO.z);
  grupo.add(rBanco);

  // ---------- Visor de realidades (opcional, junto a la entrada) ----------
  const VISOR = { x: -5.5, z: 12.5 };
  poner('column', VISOR.x, 0, VISOR.z);
  obstaculo(VISOR.x, VISOR.z, 0.45);
  const gafas = new THREE.Group();
  for (const dx of [-0.17, 0.17]) {
    const lente = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.03, 8, 20), std({ color: 0x2a2a30, metalness: 0.6 }));
    lente.position.x = dx;
    const cristal = new THREE.Mesh(new THREE.CircleGeometry(0.12, 20), std({ color: 0x7fe0ff, emissive: 0x3a8cff, emissiveIntensity: 1.5, transparent: true, opacity: 0.8 }));
    cristal.position.x = dx;
    gafas.add(lente, cristal);
  }
  gafas.position.set(VISOR.x, 1.75, VISOR.z);
  grupo.add(gafas);
  const rVisor = makeLabel('Visor de realidades', { height: 0.28, fontSize: 38 });
  rVisor.position.set(VISOR.x, 2.35, VISOR.z);
  grupo.add(rVisor);

  // ---------- Sello 3 · El altar de las herramientas (oeste) ----------
  const emblema = (op) => new THREE.Mesh(new THREE.OctahedronGeometry(0.26), std({ color: op.color, emissive: op.color, emissiveIntensity: 0.9, roughness: 0.3 }));
  const altar = crearElegir(ctx, {
    piso: P, mec: 'programas', sala, opciones: C.programas.opciones, encargos: C.programas.encargos,
    necesarios: C.programas.aciertosNecesarios, arco: { x: -11.2, z: 5, radio: 4.4, desde: -50, hasta: 50 },
    atril: { x: -4.6, z: 5 }, leccion: 'programas', criterio: '2.1', visual: emblema,
    alCompletar: () => S.romper('programas'), nombreAtril: 'El atril de las herramientas',
  });

  // ---------- Sello 1 · La forja ----------
  async function forjar() {
    const r = await abrirForja(ui, { molde: LLAVE, controles: CONTROLES, piezas: est.piezas });
    est.piezas = r.piezas;
    if (!r.entregado) return;
    ctx.record(true, '2.1');
    sonido.acierto();
    ctx.accion('mec', { piso: P, mec: 'llave', paso: 'sello' });
  }
  async function medir() {
    if (await serieDePreguntas(ctx, C.medidas, 'El banco de medidas', est.medidas)) ctx.accion('mec', { piso: P, mec: 'medidas', paso: 'sello' });
  }

  const zona = sala.zona;
  const interactuables = [
    {
      zona, pos: aMundo(YUNQUE.x, 0, YUNQUE.z), r: 2.6,
      enabled: () => !est.sellos.llave,
      prompt: () => (aprendido('modelado') ? '**E** · Forjar la llave en el yunque' : '**E** · Examinar el yunque'),
      action: () => (aprendido('modelado') ? forjar() : ctx.accion('leccion', { id: 'modelado', piso: P, luego: 'forja' })),
    },
    {
      zona, pos: aMundo(BANCO.x, 0, BANCO.z), r: 2.2,
      enabled: () => !est.sellos.medidas,
      prompt: () => (aprendido('mallas') ? '**E** · Usar el banco de medidas' : '**E** · Examinar el banco de medidas'),
      action: () => (aprendido('mallas') ? medir() : ctx.accion('leccion', { id: 'mallas', piso: P, luego: 'medidas' })),
    },
    {
      zona, pos: aMundo(VISOR.x, 0, VISOR.z), r: 2.0,
      enabled: () => !aprendido('realidades'),
      prompt: () => '**E** · Mirar por el visor de realidades',
      action: () => ctx.accion('leccion', { id: 'realidades', piso: P }),
    },
    ...altar.interactuables,
  ];

  const validar = (d) => (d.mec === 'programas' ? altar.validar(d) : SELLOS.includes(d.mec) && !est.sellos[d.mec]);
  const clave = (d) => (d.paso === 'sello' ? `mec:${P}:${d.mec}:sello` : null);
  function aplicar(d, soyAutor) {
    if (d.mec === 'programas') altar.aplicar(d, soyAutor);
    else if (d.mec === 'llave') {
      llave.visible = true;
      fx.big.emit(aMundo(YUNQUE.x, 1.6, YUNQUE.z), { count: 90, color: 0xffb040, intensity: 2.5, speed: 4, life: 1.2, gravity: -3 });
      ctx.runFlow(async () => {
        await ui.dialogue(['¡La llave está forjada! Y habéis usado lo mismo que un programa de CAD: **primitivas**, **transformaciones** y **operaciones booleanas**.']);
        await S.romper('llave');
      });
    } else ctx.runFlow(() => S.romper(d.mec));
    ctx.refrescarObjetivos();
  }

  let foco = null;
  function actualizar(dt, t) {
    sala.update(dt, t);
    altar.actualizar(dt, t, foco);
    const f = 0.8 + 0.15 * Math.sin(t * 7) + 0.08 * Math.sin(t * 19);
    luzHorno.intensity = 34 * f;
    boca.material.color.setRGB(3.2 * f, 1.2 * f, 0.3);
    if (Math.random() < 0.25) fx.small.emit(aMundo(HORNO.x - 1.4, 1.2, HORNO.z + (Math.random() - 0.5)), { count: 1, color: 0xff8030, intensity: 2.5, speed: 0.6, up: 1.4, life: 1.2, jitter: 0.2 });
    cubo.rotation.y += dt * 0.7;
    cubo.rotation.x += dt * 0.3;
    gafas.position.y = 1.75 + Math.sin(t * 2) * 0.05;
    if (llave.visible) llave.rotation.y += dt * 0.8;
  }
  function objetivos() {
    const items = [
      { text: 'Forja la llave en el yunque', done: est.sellos.llave },
      { text: 'Supera el banco de medidas', done: est.sellos.medidas },
      { text: `Altar de las herramientas: aciertos seguidos (${est.sellos.programas ? C.programas.aciertosNecesarios : altar.estado.racha}/${C.programas.aciertosNecesarios})`, done: est.sellos.programas },
      { text: 'Opcional: mira por el visor de realidades', done: aprendido('realidades') },
    ];
    if (S.estado.puerta) items.push({ text: 'Subid por la escalera del norte', done: false });
    return items;
  }
  function pista() {
    if (!est.sellos.llave) return C.pistas.llave;
    if (!est.sellos.medidas) return C.pistas.medidas;
    if (!est.sellos.programas) return C.pistas.programas;
    return C.pistas.puerta;
  }

  Object.assign(zona, {
    id: P, nombre: C.nombre, musica: 'forja',
    actualizar, objetivos, pista,
    alFocalizar(it) { foco = it; },
    salida: { abierta: () => S.estado.puerta, z: sala.salidaZ, accion: ['fin', { piso: P }] },
  });
  zona.grupo.visible = false;

  return {
    id: P, zona, interactuables, contenido: C, estado: est,
    validar, clave, aplicar, jugadorFuera() {},
    async alAprender(id, soyAutor, luego) {
      if (id === 'programas') await altar.leerEncargo();
      if (!soyAutor) return;
      if (luego === 'forja') await forjar();
      if (luego === 'medidas') await medir();
    },
    intro: () => ui.dialogue(C.intro),
  };
}
