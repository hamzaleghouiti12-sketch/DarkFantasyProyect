// Piso X · El Laberinto de las Sombras (fraudes, grooming, sextorsión, ciberacoso y
// bienestar digital; criterio 3.3). TEMA SENSIBLE: ver la cabecera de contenido/piso10.js.
//   1. Las voces del laberinto (oeste): 4 chats simulados (smishing, vishing, grooming, sextorsión).
//   2. El grupo de los ecos (este): ser un buen testigo de ciberacoso en un chat de clase.
//   3. El reloj de arena (norte): bienestar digital, identidad positiva y violencias digitales.
// Un laberinto de muros con niebla densa; el botón «017» está siempre visible en este piso.
import * as THREE from 'three';
import C from '../contenido/piso10.js';
import { crearSalaDeTorre, cargarPiezasTorre, PIEZAS_BASE } from '../nucleo/sala-torre.js';
import { makeLabel } from '../textures.js';
import { crearSellos, serieDePreguntas } from './comun.js';
import { abrirChatSimulado } from '../mecanicas/chatVista.js';
import { cargarPersonaje, instanciar } from '../personajes.js';
import { Animador } from '../modelos.js';

export const ORIGEN = new THREE.Vector3(0, 0, -6300);
const P = 'piso10';
const SELLOS = ['voces', 'ecos', 'reloj'];
const EXTRA = ['column', 'candle_triple', 'banner_red', 'banner_shield_red', 'banner_thin_red'];
const std = (o) => new THREE.MeshStandardMaterial(o);
// muros interiores del laberinto: [z, xDesde, xHasta] (tramos de 4 m)
const MUROS = [[8, -12, 4], [0, -4, 12], [-8, -12, 4]];

export async function construir(ctx) {
  const { ui, sonido, fx, estado } = ctx;
  const piezas = await cargarPiezasTorre(ctx.paletas.mazmorra, [...PIEZAS_BASE, ...EXTRA]);
  const sala = crearSalaDeTorre({
    ambiente: { color: 0x9a8cc8, cada: 0.03, brillo: 0.45, vida: 6 },
    escena: ctx.escena, origen: ORIGEN, piezas, fx, semilla: 101, cielo: [0.12, 0.1, 0.22],
    estandartes: { normal: 'banner_red', escudo: 'banner_shield_red', fino: 'banner_thin_red' },
  });
  const { poner, obstaculo, aMundo, grupo } = sala;
  const S = crearSellos(ctx, sala, C, SELLOS);
  const est = { sellos: S.estado.sellos, voces: 0, reloj: { paso: 0 } };
  const aprendido = (id) => estado.learned.has(id);

  // ---------- El laberinto ----------
  for (const [z, x0, x1] of MUROS) {
    for (let x = x0 + 2; x < x1; x += 4) {
      poner('wall', x, 0, z, 0, 1, true);
      for (let k = -1.6; k <= 1.6; k += 0.8) obstaculo(x + k, z, 0.55);
    }
  }

  // ---------- Las sombras: siluetas oscuras con ojos rojos ----------
  const sombras = [];
  const matSombra = new THREE.MeshBasicMaterial({ color: 0x07050c, transparent: true, opacity: 0.88 });
  async function sombra(x, z, mira, id) {
    try {
      const pl = await cargarPersonaje(id);
      const m = instanciar(pl);
      m.traverse((o) => { if (o.isMesh) { o.material = matSombra; o.castShadow = false; } });
      for (const n of ['handslotr', 'handslotl']) m.getObjectByName(n)?.children.forEach((c) => { c.visible = false; });
      const g = new THREE.Group();
      g.add(m);
      g.position.set(x, 0, z);
      g.rotation.y = mira;
      const ojos = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 0.3, 0.4) }));
      for (const dx of [-0.11, 0.11]) { const o = ojos.clone(); o.position.set(dx, 1.55, 0.32); g.add(o); }
      grupo.add(g);
      const anim = new Animador(m, pl.clips);
      anim.bucle('Idle');
      sombras.push({ g, anim, base: x, escala: 1, objetivo: 1 });
      obstaculo(x, z, 0.6);
    } catch (e) { console.warn('Sombra sin modelo', e); }
  }
  const VOCES = { x: -8.5, z: 4 }, ECOS = { x: 8.5, z: -4 }, RELOJ = { x: 0, z: -12.5 };
  await Promise.all([sombra(VOCES.x, VOCES.z, Math.PI / 2, 'encapuchado'), sombra(ECOS.x, ECOS.z, -Math.PI / 2, 'picaro')]);

  // ---------- El reloj de arena ----------
  const reloj = new THREE.Group();
  const cristal = std({ color: 0xbfe6ff, transparent: true, opacity: 0.35, roughness: 0.1, emissive: 0x2a4a6a, emissiveIntensity: 0.6 });
  const madera = std({ color: 0x5a3d26, roughness: 0.8 });
  for (const y of [0, 2.2]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.15, 16), madera); t.position.y = y; reloj.add(t); }
  for (const s of [1, -1]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.0, 20, 1, true), cristal); c.position.y = 1.1 + s * 0.5; c.rotation.x = s > 0 ? 0 : Math.PI; reloj.add(c); }
  const arena = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.6, 16), std({ color: 0xe8c98a, emissive: 0x6a4a1a, emissiveIntensity: 0.5 }));
  arena.position.y = 0.4;
  reloj.add(arena);
  reloj.position.set(RELOJ.x, 0, RELOJ.z);
  grupo.add(reloj);
  obstaculo(RELOJ.x, RELOJ.z, 0.9);

  for (const [t, x, z, y] of [['Las voces del laberinto', VOCES.x, VOCES.z, 2.6], ['El grupo de los ecos', ECOS.x, ECOS.z, 2.6], ['El reloj de arena', RELOJ.x, RELOJ.z, 3.0]]) {
    const l = makeLabel(t, { height: 0.32, fontSize: 40, font: 'Cinzel, serif', color: '#d8c8ff' });
    l.position.set(x, y, z);
    grupo.add(l);
  }

  // ---------- Botón de ayuda 017 (siempre visible en este piso) ----------
  let boton = document.getElementById('ayuda-017');
  if (!boton) {
    boton = document.createElement('button');
    boton.id = 'ayuda-017';
    boton.textContent = '¿Necesitas ayuda? 017';
    boton.hidden = true;
    document.body.appendChild(boton);
  }
  boton.onclick = () => { if (!ui.anyOpen()) ui.dialogue(C.ayuda, 'Ayuda'); };
  setInterval(() => { boton.hidden = !(grupo.visible && estado.phase === 'play'); }, 400);

  // ---------- Los tres sellos ----------
  // lección individual (sin interrumpir a los compañeros) para la segunda mitad de las voces
  async function leer(id) {
    const l = C.lecciones[id];
    await ui.dialogue(l.paginas);
    if (!aprendido(id)) { estado.learned.add(id); ui.conceptoNuevo(l.titulo); }
  }
  async function hacerVoces() {
    for (let i = est.voces; i < C.voces.length; i++) {
      const conv = C.voces[i];
      if (!aprendido(conv.leccion)) await leer(conv.leccion);
      const hecho = await abrirChatSimulado(ui, conv, (ok) => { ctx.record(ok, '3.3'); ok ? sonido.acierto() : sonido.fallo(); }, `Las voces del laberinto · ${i + 1} de ${C.voces.length} · ${conv.titulo}`);
      if (!hecho) return;
      est.voces = i + 1;
      ctx.refrescarObjetivos();
    }
    ctx.accion('mec', { piso: P, mec: 'voces', paso: 'sello' });
  }
  async function hacerEcos() {
    const hecho = await abrirChatSimulado(ui, C.ecos, (ok) => { ctx.record(ok, '3.3'); ok ? sonido.acierto() : sonido.fallo(); }, 'El grupo de los ecos');
    if (hecho) ctx.accion('mec', { piso: P, mec: 'ecos', paso: 'sello' });
  }
  async function hacerReloj() {
    if (await serieDePreguntas(ctx, C.reloj, 'El reloj de arena', est.reloj)) ctx.accion('mec', { piso: P, mec: 'reloj', paso: 'sello' });
  }

  const zona = sala.zona;
  // las sombras se alimentan de los errores: menguan con cada acierto y crecen con cada fallo
  const responderSala = zona.alResponder;
  zona.alResponder = (ok, racha) => {
    responderSala?.(ok, racha);
    for (const s of sombras) {
      if (!s.g.visible) continue;
      s.objetivo = Math.min(1.3, Math.max(0.55, s.objetivo + (ok ? -0.1 : 0.08)));
      if (ok) {
        s.anim.unaVezSolo('Hit_B');
        fx.small.emit(s.g.position.clone().add(ORIGEN).setY(1.4), { count: 18, color: 0xd8d0ff, intensity: 1.8, speed: 1.6, life: 0.8 });
      }
    }
  };
  zona.niebla = { color: 0x0b0914, densidad: 0.075 }; // niebla densa de laberinto
  const interactuables = [
    {
      zona, pos: aMundo(VOCES.x + 1.4, 0, VOCES.z), r: 2.2,
      enabled: () => !est.sellos.voces,
      prompt: () => (aprendido('fraudes') ? '**E** · Escuchar las voces del laberinto' : '**E** · Acercarse a la sombra'),
      action: () => (aprendido('fraudes') ? hacerVoces() : ctx.accion('leccion', { id: 'fraudes', piso: P, luego: 'voces10' })),
    },
    {
      zona, pos: aMundo(ECOS.x - 1.4, 0, ECOS.z), r: 2.2,
      enabled: () => !est.sellos.ecos,
      prompt: () => (aprendido('ciberacoso') ? '**E** · Abrir el grupo de los ecos' : '**E** · Acercarse a la sombra'),
      action: () => (aprendido('ciberacoso') ? hacerEcos() : ctx.accion('leccion', { id: 'ciberacoso', piso: P, luego: 'ecos10' })),
    },
    {
      zona, pos: aMundo(RELOJ.x, 0, RELOJ.z + 1.6), r: 2.2,
      enabled: () => !est.sellos.reloj,
      prompt: () => (aprendido('bienestar') ? '**E** · Dar la vuelta al reloj de arena' : '**E** · Examinar el reloj de arena'),
      action: () => (aprendido('bienestar') ? hacerReloj() : ctx.accion('leccion', { id: 'bienestar', piso: P, luego: 'reloj10' })),
    },
  ];

  const validar = (d) => SELLOS.includes(d.mec) && !est.sellos[d.mec];
  const clave = (d) => `mec:${P}:${d.mec}:sello`;
  function aplicar(d) {
    const s = d.mec === 'voces' ? sombras[0] : d.mec === 'ecos' ? sombras[1] : null;
    if (s) {
      fx.big.emit(s.g.position.clone().add(ORIGEN).setY(1.2), { count: 90, color: 0x9a8cc8, intensity: 1.6, speed: 3, life: 1.2, gravity: -1 });
      s.g.visible = false; // la sombra se deshace
    }
    if (d.mec === 'reloj') reloj.rotation.z = Math.PI;
    ctx.runFlow(() => S.romper(d.mec));
    ctx.refrescarObjetivos();
  }

  function actualizar(dt, t) {
    sala.update(dt, t);
    for (const s of sombras) {
      s.anim.update(dt);
      s.g.position.x = s.base + Math.sin(t * 0.7 + s.base) * 0.15; // se mecen
      s.escala += (s.objetivo - s.escala) * Math.min(1, dt * 3);
      s.g.scale.setScalar(s.escala);
    }
    if (!est.sellos.reloj) arena.scale.y = 0.6 + 0.4 * ((t * 0.1) % 1);
  }
  function objetivos() {
    const items = [
      { text: `Escucha las voces del laberinto (${est.sellos.voces ? C.voces.length : est.voces}/${C.voces.length})`, done: est.sellos.voces },
      { text: 'Ayuda en el grupo de los ecos', done: est.sellos.ecos },
      { text: `Da la vuelta al reloj de arena (${Math.min(est.reloj.paso, C.reloj.length)}/${C.reloj.length})`, done: est.sellos.reloj },
    ];
    if (S.estado.puerta) items.push({ text: 'Subid por la escalera del norte', done: false });
    return items;
  }
  function pista() {
    if (!est.sellos.voces) return C.pistas.voces;
    if (!est.sellos.ecos) return C.pistas.ecos;
    if (!est.sellos.reloj) return C.pistas.reloj;
    return C.pistas.puerta;
  }
  // franjas del laberinto (de sur a norte) y el hueco que une cada una con la siguiente
  const franja = (z) => (z > 8 ? 0 : z > 0 ? 1 : z > -8 ? 2 : 3);
  const HUECOS = [[8, 8], [-8, 0], [8, -8]];
  // la guía no atraviesa muros: si el objetivo está en otra franja, apunta al hueco siguiente
  function porElLaberinto(x, z) {
    const yo = franja(ctx.jugador.pos.z - ORIGEN.z), meta = franja(z);
    if (yo === meta) return aMundo(x, 0, z);
    const [hx, hz] = HUECOS[yo < meta ? yo : yo - 1];
    return aMundo(hx, 0, hz);
  }
  function destino() {
    if (!est.sellos.voces) return porElLaberinto(VOCES.x + 1.4, VOCES.z);
    if (!est.sellos.ecos) return porElLaberinto(ECOS.x - 1.4, ECOS.z);
    if (!est.sellos.reloj) return porElLaberinto(RELOJ.x, RELOJ.z + 1.6);
    if (franja(ctx.jugador.pos.z - ORIGEN.z) < 3) return porElLaberinto(0, -14);
    return 'salida';
  }

  Object.assign(zona, {
    id: P, nombre: C.nombre, musica: 'sombras',
    actualizar, objetivos, pista, destino,
    salida: { abierta: () => S.estado.puerta, z: sala.salidaZ, accion: ['subir', { piso: 'piso11' }] },
  });
  zona.grupo.visible = false;

  return {
    id: P, zona, interactuables, contenido: C, estado: est,
    validar, clave, aplicar, jugadorFuera() {},
    async alAprender(id, soyAutor, luego) {
      if (!soyAutor) return;
      if (luego === 'voces10') await hacerVoces();
      if (luego === 'ecos10') await hacerEcos();
      if (luego === 'reloj10') await hacerReloj();
    },
    intro: async () => {
      await ui.dialogue(C.intro);
      const docente = /operador|docente/.test(location.search);
      if (!C.revisadoDocente && docente) ui.toast('Aviso docente: los textos de este piso están pendientes de revisión por un docente u orientador.', 'bad', 7000);
    },
  };
}
