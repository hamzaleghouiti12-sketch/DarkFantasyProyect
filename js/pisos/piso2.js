// Piso II · La Bóveda de la Memoria (almacenamiento, criterio 1.1).
// Se construye sobre crearSalaDeTorre y añade sus tres sellos:
//   1. El altar de los soportes (oeste): elegir el soporte adecuado para cada encargo.
//   2. La balanza de las unidades (este): ordenar unidades y convertir cantidades.
//   3. La cripta 3-2-1 (norte): repartir tres copias cumpliendo la regla 3-2-1.
//
// Red: todo lo compartido pasa por ctx.accion('mec', {...}). El anfitrión lo
// valida con validar() y todos los jugadores lo aplican con aplicar().
import * as THREE from 'three';
import C from '../contenido/piso2.js';
import { crearSalaDeTorre, cargarPiezasTorre, PIEZAS_BASE } from '../nucleo/sala-torre.js';
import { makeLabel, glowTexture } from '../textures.js';
import { comprobar321, siguienteEncargo } from '../mecanicas/logica.js';
import { amueblar } from './muebles.js';
import { serieDePreguntas } from './comun.js';

export const ORIGEN = new THREE.Vector3(0, 0, -700);
const EXTRA = [
  'column', 'chest_gold', 'chest', 'coin_stack_large', 'coin_stack_medium', 'keyring_hanging',
  'trunk_large_B', 'trunk_large_C', 'table_long_decorated_A', 'candle_triple', 'pillar_decorated',
  'banner_blue', 'banner_shield_blue', 'banner_thin_blue',
];
const SELLOS = ['soportes', 'balanza', 'cripta'];
const P = 'piso2';

const std = (o) => new THREE.MeshStandardMaterial(o);

// Objetos-símbolo que representan cada soporte sobre su pedestal (hechos por código)
function crearSimbolo(tipo) {
  const g = new THREE.Group();
  const metal = std({ color: 0x9aa3b5, metalness: 0.8, roughness: 0.35 });
  const brilla = (color, i = 1.6) => std({ color, emissive: color, emissiveIntensity: i, roughness: 0.25 });
  const m = (geo, mat, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); g.add(o); return o; };
  switch (tipo) {
    case 'disco': { // plato magnético con su cabezal
      m(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 28), metal);
      m(new THREE.CylinderGeometry(0.06, 0.06, 0.07, 12), brilla(0x6f8cff, 1));
      m(new THREE.BoxGeometry(0.32, 0.03, 0.05), std({ color: 0x3a3f4a, metalness: 0.6, roughness: 0.4 }), 0.14, 0.05, 0.12).rotation.y = 0.5;
      break;
    }
    case 'cristal': m(new THREE.BoxGeometry(0.46, 0.05, 0.3), brilla(0x7fb8ff, 0.9)); break;
    case 'cristalVivo': {
      m(new THREE.BoxGeometry(0.5, 0.035, 0.16), brilla(0x7ff6ff, 2.2));
      for (const x of [-0.14, 0, 0.14]) m(new THREE.BoxGeometry(0.08, 0.05, 0.1), std({ color: 0x1b2230, roughness: 0.5 }), x, 0.03, 0);
      break;
    }
    case 'rollo': { // bobina de cinta
      for (const z of [-0.1, 0.1]) m(new THREE.CylinderGeometry(0.26, 0.26, 0.02, 24), std({ color: 0x2b2b30, roughness: 0.6 }), 0, 0, z).rotation.x = Math.PI / 2;
      m(new THREE.CylinderGeometry(0.2, 0.2, 0.18, 24), std({ color: 0x5a3d22, roughness: 0.8 })).rotation.x = Math.PI / 2;
      m(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 10), brilla(0xffc26b, 1.2)).rotation.x = Math.PI / 2;
      break;
    }
    case 'optico': {
      const d = m(new THREE.CylinderGeometry(0.3, 0.3, 0.015, 36), std({ color: 0xc8d8ff, metalness: 1, roughness: 0.12, emissive: 0x3a5aff, emissiveIntensity: 0.5 }));
      d.rotation.x = Math.PI / 2.4;
      break;
    }
    case 'amuleto': { // pendrive
      m(new THREE.BoxGeometry(0.12, 0.3, 0.05), brilla(0xd4af6a, 0.6));
      m(new THREE.BoxGeometry(0.08, 0.09, 0.03), metal, 0, 0.19, 0);
      m(new THREE.TorusGeometry(0.05, 0.012, 8, 16), metal, 0, -0.18, 0);
      break;
    }
    case 'tarjeta': {
      m(new THREE.BoxGeometry(0.2, 0.27, 0.02), brilla(0x4b5cff, 0.7));
      m(new THREE.BoxGeometry(0.16, 0.05, 0.022), std({ color: 0xe7c46a, metalness: 1, roughness: 0.3 }), 0, 0.09, 0);
      break;
    }
    case 'cofreAntena': { // NAS
      m(new THREE.BoxGeometry(0.34, 0.26, 0.28), std({ color: 0x3b3440, roughness: 0.6 }));
      for (const y of [-0.06, 0.04]) m(new THREE.BoxGeometry(0.22, 0.03, 0.01), brilla(0x7fdc9a, 1.5), 0, y, 0.145);
      m(new THREE.CylinderGeometry(0.01, 0.01, 0.3, 6), metal, 0.12, 0.28, 0);
      m(new THREE.SphereGeometry(0.03, 10, 8), brilla(0x7fdc9a, 2.5), 0.12, 0.44, 0);
      break;
    }
    case 'nube': {
      const mat = std({ color: 0xdfe8ff, emissive: 0x6f8cd8, emissiveIntensity: 0.3, roughness: 0.9, transparent: true, opacity: 0.9 });
      for (const [x, y, r] of [[0, 0, 0.17], [-0.16, -0.04, 0.12], [0.16, -0.03, 0.13], [0.06, 0.1, 0.12]]) m(new THREE.SphereGeometry(r, 16, 12), mat, x, y, 0);
      break;
    }
  }
  return g;
}

export async function construir(ctx) {
  const { ui, sonido, fx, estado } = ctx;
  const piezas = await cargarPiezasTorre(ctx.paletas.mazmorra, [...PIEZAS_BASE, ...EXTRA]);
  const sala = crearSalaDeTorre({
    escena: ctx.escena, origen: ORIGEN, piezas, fx, semilla: 21, cielo: [0.16, 0.3, 0.62],
    estandartes: { normal: 'banner_blue', escudo: 'banner_shield_blue', fino: 'banner_thin_blue' },
  });
  const { poner, obstaculo, aMundo, grupo } = sala;
  await amueblar(sala, [
    ['rug_rectangle_stripes_A', 0, 0.01, 12, 0, 1.5],
    ['cabinet_medium_decorated', 11.3, 0, -6, -Math.PI / 2, 1, 0.9],
    ['pictureframe_large_A', -11.85, 3, -9, Math.PI / 2, 1.3],
  ]);
  const est = {
    sellos: { soportes: false, balanza: false, cripta: false },
    encargo: 0, racha: 0,
    pasoBalanza: 0,                // progreso individual en la balanza
    orbes: Array.from({ length: C.cripta.orbes }, () => ({ en: 'pedestal', portador: null })),
    criptaValida: false, puerta: false,
  };
  const miId = () => ctx.red.miId || 'yo';
  const llevo = () => est.orbes.findIndex((o) => o.portador === miId());
  const aprendido = (id) => estado.learned.has(id);

  // ---------- El gran cofre del centro y el decorado ----------
  poner('chest_gold', 0, 0, 0, 0, 1.9);
  obstaculo(0, 0.6, 1.8, 'decor');
  for (const [n, x, z, ry, r] of [
    ['coin_stack_large', -3, -2.4, 0.4, 0.9], ['coin_stack_medium', 3.1, -2.2, -0.6, 0.7], ['coin_stack_medium', 2.4, 1.9, 1.2, 0.7],
    ['trunk_large_B', -10.4, 15.6, 0.2, 1], ['trunk_large_C', 10.3, 15.8, -0.3, 1], ['chest', -10.4, -16, Math.PI / 2, 1],
  ]) { poner(n, x, 0, z, ry); obstaculo(x, z, r); }
  poner('keyring_hanging', 11.35, 2.4, 12, -Math.PI / 2, 1, false);
  poner('keyring_hanging', -11.35, 2.4, -12, Math.PI / 2, 1, false);
  // escarcha: luz fría sobre el cofre
  const luzCofre = new THREE.PointLight(0x7fb0ff, 8, 12, 1.6);
  luzCofre.position.set(0, 4.2, -1);
  grupo.add(luzCofre);

  // ---------- Sello 1 · El altar de los soportes (oeste) ----------
  const ATRIL = new THREE.Vector3(-4.3, 0, 6);
  poner('column', ATRIL.x, 0, ATRIL.z);
  obstaculo(ATRIL.x, ATRIL.z, 0.5);
  const marca = makeLabel('Encargo', { height: 0.4, fontSize: 48, font: 'Cinzel, serif', color: '#9fe6ff' });
  marca.position.set(ATRIL.x, 2.3, ATRIL.z);
  grupo.add(marca);
  const pedestales = C.soportes.opciones.map((op, i) => {
    const a = (-60 + (120 * i) / (C.soportes.opciones.length - 1)) * (Math.PI / 180);
    const x = -11 + Math.cos(a) * 4.6, z = 6 + Math.sin(a) * 4.6;
    poner('column', x, 0, z);
    obstaculo(x, z, 0.42);
    const simbolo = crearSimbolo(op.simbolo);
    simbolo.position.set(x, 1.85, z);
    simbolo.scale.setScalar(1.5);
    grupo.add(simbolo);
    const etiqueta = makeLabel(op.corto, { height: 0.3, fontSize: 40 });
    etiqueta.position.set(x, 2.4 + (i % 2) * 0.34, z);
    grupo.add(etiqueta);
    return { op, simbolo, local: new THREE.Vector3(x, 0, z), pos: aMundo(x, 0, z), destello: 0, bueno: false, foco: false };
  });
  const brilloPedestal = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 1.4),
    new THREE.MeshBasicMaterial({ map: glowTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  brilloPedestal.visible = false;
  grupo.add(brilloPedestal);

  // ---------- Sello 2 · La balanza de las unidades (este) ----------
  const BAL = new THREE.Vector3(7.4, 0, 5);
  poner('table_long_decorated_A', BAL.x + 1.2, 0, BAL.z, 0);
  obstaculo(BAL.x + 1.2, BAL.z - 1.2, 1.1);
  obstaculo(BAL.x + 1.2, BAL.z + 1.2, 1.1);
  const balanza = new THREE.Group();
  balanza.position.set(BAL.x, 0, BAL.z);
  grupo.add(balanza);
  const bronce = std({ color: 0xb08a4a, metalness: 0.85, roughness: 0.35 });
  const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 2.4, 10), bronce);
  poste.position.y = 1.2;
  const brazo = new THREE.Group();
  brazo.position.y = 2.35;
  const barra = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.8), bronce);
  brazo.add(barra);
  const platos = [-0.85, 0.85].map((z) => {
    const plato = new THREE.Group();
    plato.position.z = z;
    const cuerda = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.6, 4), bronce);
    cuerda.position.y = -0.3;
    const disco = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.05, 20), bronce);
    disco.position.y = -0.6;
    plato.add(cuerda, disco);
    brazo.add(plato);
    return plato;
  });
  balanza.add(poste, brazo);
  obstaculo(BAL.x, BAL.z, 0.45);
  // placas con las unidades en el muro este; se encienden al romper el sello
  const UNIDADES = ['bit', 'byte', 'kB', 'MB', 'GB', 'TB', 'PB'];
  const placas = UNIDADES.map((u, i) => {
    const l = makeLabel(u, { height: 0.42, fontSize: 52, font: 'Cinzel, serif', color: '#6d6478', border: 'rgba(120,110,140,0.5)' });
    l.position.set(11.2, 4.6, 0.8 + i * 1.35);
    grupo.add(l);
    return l;
  });
  const encenderPlacas = () => {
    placas.forEach((l, i) => {
      const nueva = makeLabel(UNIDADES[i], { height: 0.42, fontSize: 52, font: 'Cinzel, serif', color: '#9fe6ff' });
      nueva.position.copy(l.position);
      grupo.remove(l);
      grupo.add(nueva);
      placas[i] = nueva;
    });
  };

  // ---------- Sello 3 · La cripta 3-2-1 (norte) ----------
  const PED = new THREE.Vector3(0, 0, -9.5);
  poner('pillar_decorated', PED.x, 0, PED.z, 0, 0.45);
  obstaculo(PED.x, PED.z, 0.6);
  const RECS = [[-5.4, -7.2], [-6.2, -12.6], [6.2, -12.6], [5.4, -7.2], [3.4, -15.6]];
  const receptaculos = C.cripta.receptaculos.map((r, i) => {
    const [x, z] = RECS[i];
    if (r.fuera) {
      // el portal a la nube: un anillo de luz vertical
      const anillo = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.07, 10, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 0.9, 2.2) }));
      anillo.position.set(x, 1.5, z);
      const velo = new THREE.Mesh(new THREE.CircleGeometry(0.95, 32), new THREE.MeshBasicMaterial({ map: glowTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, color: new THREE.Color(0.4, 0.7, 1.6) }));
      velo.position.copy(anillo.position);
      grupo.add(anillo, velo);
      obstaculo(x, z, 0.5);
    } else {
      poner('column', x, 0, z);
      obstaculo(x, z, 0.45);
      if (r.pieza) {
        const lado = x < 0 ? -1.3 : 1.3;
        poner(r.pieza, x + lado, 0, z, lado < 0 ? Math.PI / 2 : -Math.PI / 2, 0.7);
        obstaculo(x + lado, z, 0.7);
      }
    }
    const simbolo = crearSimbolo({ disco: 'disco', cinta: 'rollo', nube: 'nube' }[r.tipo]);
    simbolo.scale.setScalar(1.1);
    simbolo.position.set(x, r.fuera ? 2.85 : 1.65, z);
    grupo.add(simbolo);
    const etiqueta = makeLabel(r.texto, { height: 0.3, fontSize: 38 });
    etiqueta.position.set(x, r.fuera ? 3.25 : 2.75, z);
    grupo.add(etiqueta);
    return { ...r, simbolo, pos: aMundo(x, 0, z), apoyo: aMundo(x, r.fuera ? 1.5 : 2.0, z) };
  });
  const recPorId = Object.fromEntries(receptaculos.map((r) => [r.id, r]));
  const orbeMat = std({ color: 0xd9c8ff, emissive: 0xa070ff, emissiveIntensity: 2.2, roughness: 0.2 });
  const orbes = est.orbes.map((o, i) => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14), orbeMat));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xb08cff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.scale.setScalar(1.1);
    g.add(halo);
    g.position.copy(aMundo(PED.x, 2.1, PED.z));
    ctx.escena.add(g); // fuera del grupo de la sala: se mueve en coordenadas del mundo
    return { g, fase: i * 2.1 };
  });

  // ---------- Sellos ----------
  const n = () => SELLOS.filter((s) => est.sellos[s]).length;
  async function romperSello(clave) {
    if (est.sellos[clave]) return;
    est.sellos[clave] = true;
    sala.encenderRuna(SELLOS.indexOf(clave));
    sonido.sello();
    ctx.addSaber(25);
    ctx.sacudir(0.35);
    ctx.celebrar();
    ui.toast(`✦ Sello roto (${n()}/3)`, 'seal', 3600);
    ctx.refrescarObjetivos();
    if (n() < 3) return;
    await ui.dialogue(C.sellosRotos);
    sonido.teletransporte();
    await ui.dialogue(C.memoria.slice(0, -1), 'Recuerdo de la bóveda');
    await ui.dialogue(C.memoria.slice(-1));
    sala.abrirPuerta();
    sonido.puerta();
    est.puerta = true;
    ctx.sacudir(0.8);
    ctx.refrescarObjetivos();
  }

  // ---------- Altar ----------
  const encargo = () => C.soportes.encargos[est.encargo];
  const leerEncargo = () => ui.dialogue([`**Encargo:** ${encargo().texto}`, 'Acercaos al pedestal del soporte que mejor lo resuelva y pulsad **E**.'], 'El atril de la bóveda');

  // ---------- Balanza (cada jugador la hace en su pantalla; el sello es de todos) ----------
  async function secuenciaBalanza() {
    const pasos = [C.balanza.orden, ...C.balanza.conversiones];
    for (let i = est.pasoBalanza; i < pasos.length; i++) {
      const ok = await ui.quiz(pasos[i], `La balanza de las unidades · prueba ${i + 1} de ${pasos.length}`);
      ctx.record(ok, pasos[i].criterio);
      est.pasoBalanza = i;
      if (!ok) {
        await ui.dialogue(['La balanza se tambalea… Repasad (**G** abre el grimorio) y volved cuando queráis: seguiréis desde esta prueba.']);
        return;
      }
      sonido.acierto();
    }
    est.pasoBalanza = pasos.length;
    ctx.accion('mec', { piso: P, mec: 'balanza', paso: 'sello' });
  }

  // ---------- Cripta ----------
  async function sellarCripta() {
    const ok = await ui.quiz(C.cripta.pregunta, 'La cripta 3-2-1 · última prueba');
    ctx.record(ok, C.cripta.pregunta.criterio);
    if (ok) ctx.accion('mec', { piso: P, mec: 'cripta', paso: 'sello' });
    else await ui.dialogue(['Casi. Recordad: la **incremental** solo guarda lo cambiado desde la copia anterior. Volved a intentarlo cuando queráis.']);
  }
  const ocupado = (rec) => est.orbes.some((o) => o.en === rec);

  // ---------- Interactuables ----------
  const zona = sala.zona;
  // ---------- Opcional · El archivero (junto al armario del este) ----------
  // Individual: cada jugador lo hace en su pantalla y no hace falta para la puerta.
  const ARCH = new THREE.Vector3(10.1, 0, -6);
  const rotuloArch = makeLabel('Archivero · opcional', { height: 0.3, fontSize: 40, font: 'Cinzel, serif', color: '#d8c8ff' });
  rotuloArch.position.set(11.1, 2.9, -6);
  grupo.add(rotuloArch);
  const archivero = { paso: 0, hecho: false };
  // lección individual (no interrumpe a los compañeros)
  async function leer(id) {
    const l = C.lecciones[id];
    await ui.dialogue(l.paginas);
    if (!aprendido(id)) {
      estado.learned.add(id);
      ui.toast(`Nuevo concepto en el grimorio: **${l.titulo}** (G)`, 'learn', 4200);
    }
  }
  async function hacerArchivero() {
    if (!aprendido('sistemasArchivos')) {
      await ui.dialogue([C.archivero.aviso]);
      await leer('sistemasArchivos');
    }
    if (!(await serieDePreguntas(ctx, C.archivero.casos, 'El archivero', archivero))) return;
    if (!aprendido('cifradoUnidad')) await leer('cifradoUnidad');
    const ok = await ui.quiz(C.archivero.cifrado, 'El archivero · última ficha');
    ctx.record(ok, C.archivero.cifrado.criterio);
    if (!ok) {
      await ui.dialogue(['Casi. Repasad el **cifrado de unidad** en el grimorio (**G**) y volved al archivero.']);
      return;
    }
    archivero.hecho = true;
    rotuloArch.visible = false;
    sonido.acierto();
    fx.big.emit(aMundo(ARCH.x + 1, 2, ARCH.z), { count: 70, color: 0xc8a8ff, intensity: 2, speed: 3, life: 1.1, gravity: -2 });
    ctx.addSaber(20);
    ctx.celebrar();
    await ui.dialogue([C.archivero.hecho]);
  }

  const interactuables = [
    {
      zona, pos: aMundo(ARCH.x, 0, ARCH.z), r: 1.9,
      enabled: () => !archivero.hecho,
      prompt: () => '**E** · Consultar el **archivero** (opcional)',
      action: hacerArchivero,
    },
    {
      zona, pos: aMundo(ATRIL.x, 0, ATRIL.z), r: 2.2,
      enabled: () => !est.sellos.soportes,
      prompt: () => (aprendido('almacenamiento') ? '**E** · Leer el encargo del atril' : '**E** · Examinar el altar de los soportes'),
      action: () => (aprendido('almacenamiento') ? leerEncargo() : ctx.accion('leccion', { id: 'almacenamiento', piso: P })),
    },
    ...pedestales.map((p) => ({
      zona, pos: p.pos, r: 0.95, pedestal: p,
      enabled: () => !est.sellos.soportes && aprendido('almacenamiento'),
      prompt: () => `**E** · Ofrecer «${p.op.texto}» para el encargo`,
      action: () => ctx.accion('mec', { piso: P, mec: 'soportes', paso: 'elegir', id: p.op.id, encargo: est.encargo }),
    })),
    {
      zona, pos: aMundo(BAL.x, 0, BAL.z), r: 2.6,
      enabled: () => !est.sellos.balanza,
      prompt: () => (aprendido('unidades') ? '**E** · Usar la balanza de las unidades' : '**E** · Examinar la balanza de las unidades'),
      action: () => (aprendido('unidades') ? secuenciaBalanza() : ctx.accion('leccion', { id: 'unidades', piso: P, luego: 'balanza' })),
    },
    {
      zona, pos: aMundo(PED.x, 0, PED.z), r: 2.3,
      enabled: () => !est.sellos.cripta && (!aprendido('copias') || est.criptaValida || llevo() >= 0 || est.orbes.some((o) => o.en === 'pedestal')),
      prompt: () => {
        if (!aprendido('copias')) return '**E** · Examinar la cripta 3-2-1';
        if (est.criptaValida) return '**E** · Sellar la cripta';
        return llevo() >= 0 ? '**E** · Devolver la copia al pedestal' : '**E** · Coger una copia del recuerdo';
      },
      action: () => {
        if (!aprendido('copias')) return ctx.accion('leccion', { id: 'copias', piso: P });
        if (est.criptaValida) return sellarCripta();
        const mia = llevo();
        if (mia >= 0) return ctx.accion('mec', { piso: P, mec: 'cripta', paso: 'dejar', orbe: mia, rec: 'pedestal', quien: miId() });
        const libre = est.orbes.findIndex((o) => o.en === 'pedestal');
        ctx.accion('mec', { piso: P, mec: 'cripta', paso: 'coger', orbe: libre, desde: 'pedestal', quien: miId() });
      },
    },
    ...receptaculos.map((r) => ({
      zona, pos: r.pos, r: 1.6,
      enabled: () => aprendido('copias') && !est.sellos.cripta && !est.criptaValida && ((llevo() >= 0 && !ocupado(r.id)) || (llevo() < 0 && ocupado(r.id))),
      prompt: () => (llevo() >= 0 ? `**E** · Dejar la copia en «${r.texto}»` : `**E** · Recoger la copia de «${r.texto}»`),
      action: () => {
        const mia = llevo();
        if (mia >= 0) return ctx.accion('mec', { piso: P, mec: 'cripta', paso: 'dejar', orbe: mia, rec: r.id, quien: miId() });
        ctx.accion('mec', { piso: P, mec: 'cripta', paso: 'coger', orbe: est.orbes.findIndex((o) => o.en === r.id), quien: miId() });
      },
    })),
  ];

  // ---------- Red: validar (anfitrión) y aplicar (todos) ----------
  function validar(d) {
    if (d.mec === 'soportes') return !est.sellos.soportes && d.encargo === est.encargo && pedestales.some((p) => p.op.id === d.id);
    if (d.mec === 'balanza') return !est.sellos.balanza;
    if (d.mec === 'cripta') {
      if (est.sellos.cripta) return false;
      if (d.paso === 'sello') return est.criptaValida;
      // dos jugadores cogen del pedestal a la vez: al segundo se le da otro orbe libre
      if (d.paso === 'coger' && d.desde === 'pedestal' && est.orbes[d.orbe]?.en !== 'pedestal') {
        d.orbe = est.orbes.findIndex((x) => x.en === 'pedestal');
      }
      const o = est.orbes[d.orbe];
      if (!o || est.criptaValida) return false;
      if (d.paso === 'coger') return o.portador === null && !est.orbes.some((x) => x.portador === d.quien);
      if (d.paso === 'dejar') return o.portador === d.quien && (d.rec === 'pedestal' || (recPorId[d.rec] && !ocupado(d.rec)));
    }
    return false;
  }
  // clave única solo para los pasos que no se pueden repetir (romper un sello)
  const clave = (d) => (d.paso === 'sello' ? `mec:${P}:${d.mec}:sello` : null);

  function aplicar(d, soyAutor) {
    if (d.mec === 'soportes') aplicarSoporte(d, soyAutor);
    else if (d.mec === 'balanza') {
      encenderPlacas();
      ctx.runFlow(() => romperSello('balanza'));
    } else if (d.mec === 'cripta') aplicarCripta(d, soyAutor);
    ctx.refrescarObjetivos();
  }

  function aplicarSoporte(d, soyAutor) {
    const enc = encargo();
    const p = pedestales.find((x) => x.op.id === d.id);
    const ok = enc.correctas.includes(d.id);
    if (soyAutor) ctx.record(ok, '1.1');
    p.destello = 1;
    p.bueno = ok;
    if (ok) sonido.acierto(); else sonido.cristalRoto();
    fx.big.emit(aMundo(p.local.x, 1.9, p.local.z), { count: ok ? 60 : 35, color: ok ? 0xffd27a : 0xff4030, intensity: 2, speed: ok ? 3.5 : 2.5, life: 1, gravity: ok ? -2 : -5 });
    const sig = siguienteEncargo(est, ok, C.soportes.encargos.length, C.soportes.aciertosNecesarios);
    est.racha = sig.racha;
    est.encargo = sig.encargo;
    const siguiente = `**Nuevo encargo:** ${encargo().texto}`;
    const nombres = enc.correctas.map((id) => pedestales.find((x) => x.op.id === id).op.texto).join(' o ');
    ctx.runFlow(async () => {
      if (ok) {
        await ui.dialogue(sig.completo
          ? [`¡Exacto! ${enc.bien}`, '¡**Tres encargos seguidos**! El altar reconoce vuestro criterio.']
          : [`¡Exacto! ${enc.bien}`, `Racha: **${sig.racha}/${C.soportes.aciertosNecesarios}**.`, siguiente]);
        if (sig.completo) await romperSello('soportes');
      } else {
        if (soyAutor) ctx.golpe();
        await ui.dialogue([
          `No es la mejor elección. ${p.op.porque}`,
          `Para ese encargo lo adecuado era **${nombres}**. ${enc.bien}`,
          `La racha vuelve a cero. ${siguiente}`,
        ]);
      }
    });
  }

  function aplicarCripta(d, soyAutor) {
    if (d.paso === 'sello') {
      ctx.runFlow(() => romperSello('cripta'));
      return;
    }
    const o = est.orbes[d.orbe];
    if (d.paso === 'coger') {
      o.portador = d.quien;
      o.en = null;
      sonido.coger();
      return;
    }
    // dejar
    o.portador = null;
    o.en = d.rec;
    sonido.dejar();
    if (d.rec === 'pedestal' || est.orbes.some((x) => !x.en || x.en === 'pedestal')) return;
    const res = comprobar321(est.orbes.map((x) => recPorId[x.en]));
    if (soyAutor) ctx.record(res.ok, '1.1');
    if (res.ok) {
      est.criptaValida = true;
      sonido.acierto();
      fx.big.emit(aMundo(PED.x, 2.2, PED.z), { count: 80, color: 0xb08cff, intensity: 2.2, speed: 3.5, life: 1.2, gravity: -2 });
      ctx.runFlow(() => ui.dialogue([C.cripta.bien, 'Solo queda **sellar la cripta**: acercaos al pedestal central y pulsad **E**.']));
    } else {
      sonido.fallo();
      ctx.sacudir(0.3);
      for (const x of est.orbes) x.en = 'pedestal';
      ctx.runFlow(() => ui.dialogue([C.cripta.fallos[res.fallo], 'Los orbes vuelven al pedestal. Probad otra combinación.']));
    }
  }

  // si un compañero se va con una copia en la mano, la copia vuelve al pedestal
  function jugadorFuera(id) {
    for (const o of est.orbes) if (o.portador === id) { o.portador = null; o.en = 'pedestal'; }
  }

  // ---------- Animación ----------
  const tmp = new THREE.Vector3();
  const encima = new THREE.Vector3();
  function actualizar(dt, t) {
    sala.update(dt, t);
    marca.position.y = 2.3 + Math.sin(t * 2.2) * 0.08;
    for (const p of pedestales) {
      p.simbolo.rotation.y += dt * (p.foco ? 2.2 : 0.6);
      p.simbolo.position.y = 1.85 + Math.sin(t * 1.8 + p.local.z) * 0.05;
      const s = p.foco ? 1.9 : 1.5;
      p.simbolo.scale.lerp(tmp.set(s, s, s), Math.min(1, dt * 8));
      if (p.destello > 0) p.destello = Math.max(0, p.destello - dt * 0.9);
    }
    const flash = pedestales.find((p) => p.destello > 0);
    brilloPedestal.visible = Boolean(flash);
    if (flash) {
      brilloPedestal.position.set(flash.local.x, 1.9, flash.local.z);
      brilloPedestal.lookAt(ctx.camara.position.x, 1.9, ctx.camara.position.z);
      brilloPedestal.material.color.set(flash.bueno ? 0xffd27a : 0xff4030);
      brilloPedestal.material.opacity = flash.destello;
    }
    for (const r of receptaculos) r.simbolo.rotation.y += dt * 0.5;
    // la balanza oscila hasta que se rompe su sello
    brazo.rotation.x = est.sellos.balanza ? brazo.rotation.x * (1 - Math.min(1, dt * 2)) : Math.sin(t * 0.9) * 0.18;
    for (const pl of platos) pl.rotation.x = -brazo.rotation.x;
    luzCofre.intensity = 8 + Math.sin(t * 1.3) * 1.5;
    // orbes: en el pedestal, en un receptáculo o flotando sobre quien los lleva
    let enPedestal = 0;
    est.orbes.forEach((o, i) => {
      const v = orbes[i];
      if (o.portador) {
        // (si su compañero aún no se ha cargado, el orbe espera en el pedestal)
        const quien = o.portador === miId() ? ctx.jugador.pos : ctx.companeros.get(o.portador)?.group.position;
        encima.copy(quien ? tmp.set(quien.x, quien.y + 2.55, quien.z) : aMundo(PED.x, 2.35, PED.z));
      } else {
        if (o.en === 'pedestal') {
          const a = t * 0.8 + (enPedestal++ * Math.PI * 2) / 3;
          encima.copy(aMundo(PED.x + Math.cos(a) * 0.45, 2.35, PED.z + Math.sin(a) * 0.45));
        } else encima.copy(recPorId[o.en].apoyo);
      }
      encima.y += Math.sin(t * 2 + v.fase) * 0.06;
      v.g.position.lerp(encima, 1 - Math.exp(-dt * 10));
      v.g.visible = grupo.visible;
    });
  }

  // ---------- Objetivos y pistas ----------
  function objetivos() {
    const colocadas = est.orbes.filter((o) => o.en && o.en !== 'pedestal').length;
    const items = [
      { text: `Altar de los soportes: aciertos seguidos (${est.sellos.soportes ? 3 : est.racha}/3)`, done: est.sellos.soportes },
      { text: 'Supera la balanza de las unidades', done: est.sellos.balanza },
      { text: est.criptaValida && !est.sellos.cripta ? 'Cripta 3-2-1: ¡sellad la cripta en el pedestal!' : `Cripta 3-2-1: copias colocadas (${est.sellos.cripta ? 3 : colocadas}/3)`, done: est.sellos.cripta },
    ];
    if (est.puerta) items.push({ text: 'Subid por la escalera del norte', done: false });
    return items;
  }
  function pista() {
    if (!est.sellos.soportes) return C.pistas.soportes;
    if (!est.sellos.balanza) return C.pistas.balanza;
    if (!est.sellos.cripta) return est.criptaValida ? C.pistas.cripta_sellar : C.pistas.cripta;
    return C.pistas.puerta;
  }

  // El Piso II cumple el contrato de zona y añade lo propio del piso
  Object.assign(zona, {
    id: P, nombre: C.nombre, musica: 'boveda',
    actualizar: actualizar,
    objetivos, pista,
    salida: { abierta: () => est.puerta, z: sala.salidaZ, accion: ['subir', { piso: 'piso3' }] },
    alFocalizar(it) { for (const p of pedestales) p.foco = it?.pedestal === p; },
  });
  zona.grupo.visible = false;

  return {
    id: P, zona, interactuables, contenido: C, estado: est,
    validar, clave, aplicar, jugadorFuera,
    // después de una lección: el autor sigue con el desafío y todos ven el encargo
    async alAprender(id, soyAutor, luego) {
      if (id === 'almacenamiento') await leerEncargo();
      if (soyAutor && luego === 'balanza') await secuenciaBalanza();
    },
    intro: () => ui.dialogue(C.intro),
  };
}
