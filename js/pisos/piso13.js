// Piso XIII · El Observatorio del Oráculo (IA, bases de datos y big data; criterio 4.3).
//   1. Entrenar al oráculo (centro): un clasificador sesgado que hay que arreglar con
//      ejemplos variados (aprendizaje supervisado y sesgo).
//   2. La consola de las celdas (oeste): SQL propio (SELECT, JOIN, WHERE, UPDATE) para
//      encontrar la celda de Aldric y abrirla.
//   3. El mapa de constelaciones (este): las 5 V del big data, alucinaciones y el
//      Reglamento Europeo de IA.
import * as THREE from 'three';
import C from '../contenido/piso13.js';
import { crearSalaDeTorre, cargarPiezasTorre, PIEZAS_BASE } from '../nucleo/sala-torre.js';
import { makeLabel, glowTexture } from '../textures.js';
import { crearSellos, serieDePreguntas } from './comun.js';
import { abrirOraculo, abrirConsola } from '../mecanicas/observatorioVista.js';

export const ORIGEN = new THREE.Vector3(0, 0, -8400);
const P = 'piso13';
const SELLOS = ['oraculo', 'celdas', 'constelaciones'];
const EXTRA = ['column', 'pillar_decorated', 'candle_triple', 'banner_blue', 'banner_shield_blue', 'banner_thin_blue'];
const std = (o) => new THREE.MeshStandardMaterial(o);

// comprobaciones de los retos SQL
function comprobarReto(reto, r, tablas, consulta) {
  if (reto.id === 'todos') {
    const ok = r.tipo === 'select' && r.filas.length === 4 && ['nombre', 'celda_id'].every((c) => r.columnas.includes(c));
    return ok ? { ok, mensaje: 'Ahí están los cuatro prisioneros. Fijaos en **celda_id**: apunta a la tabla celdas.' } : { ok, mensaje: 'Tienen que salir **todos** los prisioneros con **todas** sus columnas.' };
  }
  if (reto.id === 'buscar') {
    if (r.tipo !== 'select') return { ok: false, mensaje: 'Este reto se resuelve con un SELECT.' };
    if (!/\bjoin\b/i.test(consulta)) return { ok: false, mensaje: 'Usad **JOIN** para unir prisioneros con celdas.' };
    const texto = JSON.stringify(r.filas).toLowerCase();
    const ok = r.filas.length === 1 && (texto.includes('cima') || texto.includes(':7'));
    return ok ? { ok, mensaje: '¡Aldric está en la **celda 7**, en **la cima**! Ahora, a abrirla.' } : { ok, mensaje: 'Tiene que salir **solo** la fila de Aldric, con su celda o su planta. ¿Falta el WHERE?' };
  }
  if (reto.id === 'abrir') {
    const abiertas = tablas.celdas.filas.filter((f) => f.estado === 'abierta');
    if (r.tipo !== 'update') return { ok: false, mensaje: 'Para cambiar datos se usa **UPDATE**.' };
    if (abiertas.length > 1) {
      for (const f of tablas.celdas.filas) f.estado = 'cerrada';
      return { ok: false, mensaje: '¡Habéis abierto **todas** las celdas! Sin WHERE, UPDATE cambia todas las filas. Las he vuelto a cerrar: probad con **WHERE id = 7**.' };
    }
    const ok = abiertas.length === 1 && abiertas[0].id === 7;
    return ok ? { ok, mensaje: 'La celda 7 está **abierta**. En algún lugar de la cima, un cerrojo acaba de saltar.' } : { ok, mensaje: 'La celda de Aldric sigue cerrada. ¿Es la 7?' };
  }
  return { ok: false };
}

export async function construir(ctx) {
  const { ui, sonido, fx, estado } = ctx;
  const piezas = await cargarPiezasTorre(ctx.paletas.mazmorra, [...PIEZAS_BASE, ...EXTRA]);
  const sala = crearSalaDeTorre({
    ambiente: { color: 0xbfd8ff, cada: 0.05, brillo: 0.9, vida: 6 },
    escena: ctx.escena, origen: ORIGEN, piezas, fx, semilla: 131, cielo: [0.12, 0.18, 0.5],
    estandartes: { normal: 'banner_blue', escudo: 'banner_shield_blue', fino: 'banner_thin_blue' },
  });
  const { poner, obstaculo, aMundo, grupo } = sala;
  const S = crearSellos(ctx, sala, C, SELLOS);
  const tablas = JSON.parse(JSON.stringify(C.tablas));
  const est = { sellos: S.estado.sellos, sql: { reto: 0 }, constelaciones: { paso: 0 } };
  const aprendido = (id) => estado.learned.has(id);

  // ---------- La cúpula de estrellas ----------
  const n = 500, pts = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) pts.set([(Math.random() - 0.5) * 22, 7 + Math.random() * 1.5, (Math.random() - 0.5) * 34], i * 3);
  const cielo = new THREE.BufferGeometry();
  cielo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
  const matCielo = new THREE.PointsMaterial({ color: 0xcfe0ff, size: 0.07, transparent: true, opacity: 0.9 });
  grupo.add(new THREE.Points(cielo, matCielo));
  // reacciones: estrellas fugaces al acertar, el oráculo parpadea en rojo al fallar
  const fugaces = [];
  let brilloCielo = 0, alarma = 0;
  const ROJO = new THREE.Color(0xff3040);

  // ---------- El oráculo (centro) ----------
  const ORBE = { x: 0, z: 0 };
  poner('pillar_decorated', ORBE.x, 0, ORBE.z, 0, 1.2);
  obstaculo(ORBE.x, ORBE.z, 1.0);
  const orbe = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 24), std({ color: 0x9fc8ff, emissive: 0x3a6aff, emissiveIntensity: 1.4, roughness: 0.1, transparent: true, opacity: 0.85 }));
  orbe.position.set(ORBE.x, 4.2, ORBE.z);
  grupo.add(orbe);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0x6fa0ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.scale.setScalar(4.5);
  halo.position.copy(orbe.position);
  grupo.add(halo);
  const anillos = [0, 1].map((i) => {
    const a = new THREE.Mesh(new THREE.TorusGeometry(1.4 + i * 0.35, 0.03, 8, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.4, 1.2, 0.6) }));
    a.position.copy(orbe.position);
    grupo.add(a);
    return a;
  });
  const luzOrbe = new THREE.PointLight(0x6f9aff, 14, 14, 1.5);
  luzOrbe.position.copy(orbe.position);
  grupo.add(luzOrbe);

  // ---------- La consola de las celdas (oeste) y el mapa de constelaciones (este) ----------
  const CONSOLA = { x: -8.6, z: -3 }, MAPA = { x: 8.6, z: -3 };
  poner('column', CONSOLA.x, 0, CONSOLA.z);
  obstaculo(CONSOLA.x, CONSOLA.z, 0.5);
  const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.9), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.2, 0.9, 0.5) }));
  pantalla.position.set(CONSOLA.x + 0.35, 2.3, CONSOLA.z);
  pantalla.rotation.y = Math.PI / 2;
  grupo.add(pantalla);
  poner('column', MAPA.x, 0, MAPA.z);
  obstaculo(MAPA.x, MAPA.z, 0.5);
  const mapa = new THREE.Group();
  const estrella = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.5, 1.0) });
  for (let i = 0; i < 9; i++) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), estrella);
    e.position.set(0, Math.sin(i * 2.1) * 0.5, Math.cos(i * 1.7) * 0.6);
    mapa.add(e);
  }
  mapa.position.set(MAPA.x - 0.4, 2.4, MAPA.z);
  grupo.add(mapa);

  for (const [t, x, z, y] of [['El oráculo', ORBE.x, ORBE.z, 6.0], ['La consola de las celdas', CONSOLA.x, CONSOLA.z, 3.3], ['El mapa de constelaciones', MAPA.x, MAPA.z, 3.3]]) {
    const l = makeLabel(t, { height: 0.32, fontSize: 40, font: 'Cinzel, serif', color: '#cfe0ff' });
    l.position.set(x, y, z);
    grupo.add(l);
  }

  // ---------- Los tres sellos ----------
  const alResultado = (ok) => { ctx.record(ok, '4.3'); ok ? sonido.acierto() : sonido.fallo(); };
  async function hacerOraculo() {
    if (await abrirOraculo(ui, C.oraculo, { alResultado })) ctx.accion('mec', { piso: P, mec: 'oraculo', paso: 'sello' });
  }
  async function hacerCeldas() {
    if (await abrirConsola(ui, { tablas, retos: C.retos, progreso: est.sql, comprobar: comprobarReto, alResultado })) ctx.accion('mec', { piso: P, mec: 'celdas', paso: 'sello' });
  }
  async function hacerConstelaciones() {
    if (await serieDePreguntas(ctx, C.constelaciones, 'El mapa de constelaciones', est.constelaciones)) ctx.accion('mec', { piso: P, mec: 'constelaciones', paso: 'sello' });
  }

  const zona = sala.zona;
  const responderSala = zona.alResponder;
  zona.alResponder = (ok, racha) => {
    responderSala?.(ok, racha);
    if (!ok) { alarma = 1; return; }
    brilloCielo = 1;
    for (let i = 0; i < Math.min(3, 1 + Math.floor(racha / 3)); i++) {
      const desde = new THREE.Vector3((Math.random() - 0.5) * 18, 7.6, (Math.random() - 0.5) * 28);
      const dir = new THREE.Vector3(Math.random() - 0.5, -0.12, Math.random() - 0.5).normalize();
      fugaces.push({ p: desde.add(ORIGEN), v: dir.multiplyScalar(14), vida: 0.9 + i * 0.15, espera: i * 0.25 });
    }
  };
  const interactuables = [
    {
      zona, pos: aMundo(ORBE.x, 0, ORBE.z + 2.2), r: 2.4,
      enabled: () => !est.sellos.oraculo,
      prompt: () => (aprendido('ia') ? '**E** · Entrenar al oráculo' : '**E** · Consultar al oráculo'),
      action: () => (aprendido('ia') ? hacerOraculo() : ctx.accion('leccion', { id: 'ia', piso: P, luego: 'oraculo13' })),
    },
    {
      zona, pos: aMundo(CONSOLA.x + 1.4, 0, CONSOLA.z), r: 2.2,
      enabled: () => !est.sellos.celdas,
      prompt: () => (aprendido('basesDatos') ? '**E** · Usar la consola de las celdas' : '**E** · Examinar la consola'),
      action: () => (aprendido('basesDatos') ? hacerCeldas() : ctx.accion('leccion', { id: 'basesDatos', piso: P, luego: 'celdas13' })),
    },
    {
      zona, pos: aMundo(MAPA.x - 1.4, 0, MAPA.z), r: 2.2,
      enabled: () => !est.sellos.constelaciones,
      prompt: () => (aprendido('bigData') ? '**E** · Leer el mapa de constelaciones' : '**E** · Examinar el mapa'),
      action: () => (aprendido('bigData') ? hacerConstelaciones() : ctx.accion('leccion', { id: 'bigData', piso: P, luego: 'constelaciones13' })),
    },
  ];

  const validar = (d) => SELLOS.includes(d.mec) && !est.sellos[d.mec];
  const clave = (d) => `mec:${P}:${d.mec}:sello`;
  function aplicar(d) {
    if (d.mec === 'oraculo') fx.big.emit(aMundo(ORBE.x, 4.2, ORBE.z), { count: 120, color: 0x9fc8ff, intensity: 2.4, speed: 4, life: 1.3, gravity: -1 });
    ctx.runFlow(() => S.romper(d.mec));
    ctx.refrescarObjetivos();
  }

  function actualizar(dt, t) {
    sala.update(dt, t);
    orbe.position.y = 4.2 + Math.sin(t * 0.9) * 0.15;
    halo.position.y = orbe.position.y;
    anillos[0].rotation.set(t * 0.5, t * 0.3, 0);
    anillos[1].rotation.set(-t * 0.4, 0, t * 0.6);
    anillos.forEach((a) => { a.position.y = orbe.position.y; });
    orbe.material.emissiveIntensity = est.sellos.oraculo ? 0.4 : 1.3 + Math.sin(t * 2.2) * 0.3;
    alarma = Math.max(0, alarma - dt * 1.4);
    orbe.material.emissive.setHex(0x3a6aff).lerp(ROJO, alarma * (0.5 + 0.5 * Math.sign(Math.sin(t * 30))));
    brilloCielo = Math.max(0, brilloCielo - dt * 0.8);
    matCielo.size = 0.07 + brilloCielo * 0.07;
    for (let i = fugaces.length - 1; i >= 0; i--) {
      const f = fugaces[i];
      if (f.espera > 0) { f.espera -= dt; continue; }
      f.vida -= dt;
      f.p.addScaledVector(f.v, dt);
      fx.small.emit(f.p, { count: 3, color: 0xe8f0ff, intensity: 2.6, speed: 0.15, life: 0.5, jitter: 0.05 });
      if (f.vida <= 0) fugaces.splice(i, 1);
    }
    mapa.rotation.x += dt * 0.3;
    pantalla.material.color.setRGB(0.15, 0.7 + Math.sin(t * 5) * 0.1, 0.4);
  }
  function objetivos() {
    const items = [
      { text: 'Entrena al oráculo sin sesgo', done: est.sellos.oraculo },
      { text: `Encuentra y abre la celda de Aldric (${Math.min(est.sql.reto, C.retos.length)}/${C.retos.length})`, done: est.sellos.celdas },
      { text: `Lee el mapa de constelaciones (${Math.min(est.constelaciones.paso, C.constelaciones.length)}/${C.constelaciones.length})`, done: est.sellos.constelaciones },
    ];
    if (S.estado.puerta) items.push({ text: 'Subid a la Cima', done: false });
    return items;
  }
  function pista() {
    if (!est.sellos.oraculo) return C.pistas.oraculo;
    if (!est.sellos.celdas) return C.pistas.celdas;
    if (!est.sellos.constelaciones) return C.pistas.constelaciones;
    return C.pistas.puerta;
  }
  function destino() {
    if (!est.sellos.oraculo) return aMundo(ORBE.x, 0, ORBE.z + 2.2);
    if (!est.sellos.celdas) return aMundo(CONSOLA.x + 1.4, 0, CONSOLA.z);
    if (!est.sellos.constelaciones) return aMundo(MAPA.x - 1.4, 0, MAPA.z);
    return 'salida';
  }

  Object.assign(zona, {
    id: P, nombre: C.nombre, musica: 'observatorio',
    actualizar, objetivos, pista, destino,
    salida: { abierta: () => S.estado.puerta, z: sala.salidaZ, accion: ['subir', { piso: 'cima' }] },
  });
  zona.grupo.visible = false;

  return {
    id: P, zona, interactuables, contenido: C, estado: est,
    validar, clave, aplicar, jugadorFuera() {},
    async alAprender(id, soyAutor, luego) {
      if (!soyAutor) return;
      if (luego === 'oraculo13') await hacerOraculo();
      if (luego === 'celdas13') await hacerCeldas();
      if (luego === 'constelaciones13') await hacerConstelaciones();
    },
    intro: () => ui.dialogue(C.intro),
  };
}
