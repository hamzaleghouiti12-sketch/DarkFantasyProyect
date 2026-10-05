// Piso IV · Los Puentes Flotantes (redes, criterio 1.2).
// No es una sala: es un archipiélago nocturno de islas flotantes unidas por
// pasarelas de piedra. Si el jugador se sale, cae y reaparece en la última isla.
//   1. Tender la red (conectar): estrella en el barrio, fibra entre Tenerife y
//      Gran Canaria y redundancia en el núcleo (ningún enlace imprescindible).
//   2. El oráculo de las direcciones (formulario): IP, máscara, puerta y DNS de 3 equipos.
//   3. La terminal del vigía: ping y tracert para encontrar el enlace que cortó Morvath.
import * as THREE from 'three';
import C from '../contenido/piso4.js';
import { cargarPiezas, colocador } from '../modelos.js';
import { cargarPiezasTorre } from '../nucleo/sala-torre.js';
import { makeLabel, glowTexture, runeGlyphCanvas } from '../textures.js';
import { conexo, esEstrella, sinPuntoUnico, subgrafo, ruta, clave } from '../mecanicas/grafo.js';
import { validarEquipo, validarWifi } from '../mecanicas/redes.js';
import { crearInterprete } from '../mecanicas/terminal.js';
import { crearSellos, serieDePreguntas } from './comun.js';

export const ORIGEN = new THREE.Vector3(0, 0, -2100);
const P = 'piso4';
const SELLOS = ['red', 'oraculo', 'terminal'];
const NODOS = Object.keys(C.islas);
const std = (o) => new THREE.MeshStandardMaterial(o);
const brillo = (r, g, b, extra = {}) => { const m = new THREE.MeshBasicMaterial(extra); m.color.setRGB(r, g, b); return m; };

// Aparato de red sobre su poste (hecho por código)
function crearAparato(nodo) {
  const g = new THREE.Group();
  const caja = std({ color: 0x2a2d36, roughness: 0.5, metalness: 0.3 });
  const led = (color) => std({ color, emissive: color, emissiveIntensity: 2.2 });
  const m = (geo, mat, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); g.add(o); return o; };
  if (nodo === 'router' || nodo === 'tenerife' || nodo === 'grancanaria') {
    m(new THREE.BoxGeometry(0.7, 0.16, 0.45), caja);
    for (const x of [-0.25, 0.25]) m(new THREE.CylinderGeometry(0.018, 0.018, 0.5, 6), caja, x, 0.3, -0.18);
    for (let i = 0; i < 4; i++) m(new THREE.BoxGeometry(0.05, 0.03, 0.01), led(0x7fdc9a), -0.2 + i * 0.13, 0.02, 0.23);
  } else if (nodo === 'switch') {
    m(new THREE.BoxGeometry(0.9, 0.1, 0.4), caja);
    for (let i = 0; i < 8; i++) m(new THREE.BoxGeometry(0.06, 0.035, 0.01), led(i % 3 ? 0xffb040 : 0x7fdc9a), -0.36 + i * 0.1, 0, 0.205);
  } else if (nodo === 'ap') {
    m(new THREE.CylinderGeometry(0.28, 0.3, 0.07, 24), std({ color: 0xd8dde6, roughness: 0.4 }));
    m(new THREE.SphereGeometry(0.04, 10, 8), led(0x6fb0ff), 0, 0.05, 0);
  } else {
    m(new THREE.BoxGeometry(0.6, 0.4, 0.04), caja, 0, 0.32, 0);
    m(new THREE.PlaneGeometry(0.54, 0.34), std({ color: 0x1b3a5a, emissive: 0x2a6aa8, emissiveIntensity: 1.2 }), 0, 0.32, 0.021);
    m(new THREE.BoxGeometry(0.06, 0.12, 0.06), caja, 0, 0.06, 0);
  }
  return g;
}

export async function construir(ctx) {
  const { ui, sonido, fx, estado } = ctx;
  const ox = ORIGEN.x, oz = ORIGEN.z;
  const [islas, torre, ext] = await Promise.all([
    cargarPiezas('assets/modelos/islas', ['hex_grass', 'hex_grass_bottom', 'building_tower_A_blue', 'building_well_blue', 'building_windmill_blue', 'rock_single_B', 'rock_single_D'], ctx.paletas.medieval, 'gltf'),
    cargarPiezasTorre(ctx.paletas.mazmorra, ['column']),
    cargarPiezas('assets/modelos/exterior', ['arch_gate', 'lantern_standing'], ctx.paletas.halloween, 'gltf'),
  ]);
  const grupo = new THREE.Group();
  grupo.position.copy(ORIGEN);
  ctx.escena.add(grupo);
  const poner = colocador(grupo, { ...islas, ...torre, ...ext });
  const colliders = [];
  const obstaculo = (x, z, r) => colliders.push({ x: ox + x, z: oz + z, r });
  const aMundo = (x, y, z) => new THREE.Vector3(ox + x, y, oz + z);

  // ---------- Islas y pasarelas (lo que se puede pisar) ----------
  const todas = { ...C.islas, muelle: C.muelle, salida: C.salida };
  const discos = Object.entries(todas).map(([id, isla]) => {
    const [x, z] = isla.pos, s = isla.escala;
    poner('hex_grass', x, 0, z, 0, 1).scale.set(s, s * 1.4, s);
    poner('hex_grass_bottom', x, -s * 1.4, z, 0, 1, false).scale.set(s * 0.9, s * 1.6, s * 0.9);
    return { id, x, z, r: s * 0.98 };
  });
  const porId = Object.fromEntries(discos.map((d) => [d.id, d]));
  const piedra = std({ color: 0x4d4852, roughness: 0.95 });
  const segmentos = C.pasarelas.map(([a, b]) => {
    const A = porId[a], B = porId[b];
    const largo = Math.hypot(B.x - A.x, B.z - A.z);
    const losa = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, largo), piedra);
    losa.position.set((A.x + B.x) / 2, -0.26, (A.z + B.z) / 2);
    losa.rotation.y = Math.atan2(B.x - A.x, B.z - A.z);
    losa.receiveShadow = true;
    grupo.add(losa);
    return { ax: A.x, az: A.z, bx: B.x, bz: B.z };
  });
  // ¿se puede pisar este punto (coordenadas locales)?
  function pisable(x, z) {
    for (const d of discos) if (Math.hypot(x - d.x, z - d.z) < d.r) return true;
    for (const s of segmentos) {
      const vx = s.bx - s.ax, vz = s.bz - s.az;
      const t = Math.max(0, Math.min(1, ((x - s.ax) * vx + (z - s.az) * vz) / (vx * vx + vz * vz)));
      if (Math.hypot(x - (s.ax + vx * t), z - (s.az + vz * t)) < 1.1) return true;
    }
    return false;
  }

  // ---------- Cielo: estrellas y luna ----------
  const puntos = new Float32Array(900 * 3);
  for (let i = 0; i < 900; i++) {
    const a = Math.random() * Math.PI * 2, y = 0.1 + Math.random() * 0.9, r = Math.sqrt(1 - y * y);
    puntos.set([Math.cos(a) * r * 170, y * 170 - 20, Math.sin(a) * r * 170], i * 3);
  }
  const cieloGeo = new THREE.BufferGeometry();
  cieloGeo.setAttribute('position', new THREE.BufferAttribute(puntos, 3));
  grupo.add(new THREE.Points(cieloGeo, new THREE.PointsMaterial({ color: 0xcfd8ff, size: 1.4, sizeAttenuation: false, fog: false })));
  const luna = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xdfe6ff, fog: false, depthWrite: false }));
  luna.position.set(-60, 70, -120);
  luna.scale.setScalar(40);
  grupo.add(luna);

  // ---------- Decorado ----------
  poner('building_well_blue', 2.2, 0, 25.5, 0, 2.2);
  obstaculo(2.2, 25.5, 1.0);
  poner('building_windmill_blue', -33, 0, 13, 0.5, 3);
  obstaculo(-33, 13, 1.4);
  poner('building_tower_A_blue', 20.5, 0, -4, 0, 2.6);
  obstaculo(20.5, -4, 1.4);
  for (const [n, x, z, e] of [['rock_single_B', 4, 3, 6], ['rock_single_D', -19, 6, 7], ['rock_single_B', 33, 13, 6], ['rock_single_D', -29, -7, 5]]) poner(n, x, 0, z, 1, e);
  // faroles con luz cálida (6 luces: el presupuesto de la sección 16)
  for (const [x, z] of [[-2.2, 21.5], [-3.5, 9.5], [3.5, 9.5], [-17, 6.5], [17, 2.5], [31, 14]]) {
    poner('lantern_standing', x, 0, z, 0, 1);
    obstaculo(x, z, 0.3);
    const luz = new THREE.PointLight(0xffb070, 22, 16, 1.6);
    luz.position.set(x, 2.3, z);
    grupo.add(luz);
  }

  // ---------- Postes con los aparatos de red ----------
  const postes = Object.fromEntries(NODOS.map((n) => {
    const [x, z0] = C.islas[n].pos;
    const z = n === 'router' ? z0 - 1.5 : z0;
    poner('column', x, 0, z);
    obstaculo(x, z, 0.45);
    const ap = crearAparato(n);
    ap.position.set(x, 1.5, z);
    grupo.add(ap);
    const l = makeLabel(C.islas[n].equipo, { height: 0.3, fontSize: 40 });
    l.position.set(x, 2.55, z);
    grupo.add(l);
    return [n, { x, z, pos: aMundo(x, 0, z), anclaje: aMundo(x, 1.75, z) }];
  }));

  // ---------- Oráculo y terminal del vigía (isla central) ----------
  const [rx, rz] = C.islas.router.pos;
  const ORACULO = { x: rx - 3.6, z: rz + 1.6 };
  const VIGIA = { x: rx + 3.6, z: rz + 1.6 };
  poner('column', ORACULO.x, 0, ORACULO.z);
  obstaculo(ORACULO.x, ORACULO.z, 0.45);
  const orbe = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 14), std({ color: 0xbfe6ff, emissive: 0x3a8cff, emissiveIntensity: 2 }));
  orbe.position.set(ORACULO.x, 1.85, ORACULO.z);
  grupo.add(orbe);
  const lOr = makeLabel('Oráculo de las direcciones', { height: 0.28, fontSize: 38 });
  lOr.position.set(ORACULO.x, 2.55, ORACULO.z);
  grupo.add(lOr);
  poner('column', VIGIA.x, 0, VIGIA.z);
  obstaculo(VIGIA.x, VIGIA.z, 0.45);
  const pantalla = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.05), std({ color: 0x0a1a10, emissive: 0x2a8a4a, emissiveIntensity: 1.3 }));
  pantalla.position.set(VIGIA.x, 1.72, VIGIA.z);
  grupo.add(pantalla);
  const lVi = makeLabel('Terminal del vigía', { height: 0.28, fontSize: 38 });
  lVi.position.set(VIGIA.x, 2.35, VIGIA.z);
  grupo.add(lVi);

  // ---------- Arco de la salida con sus tres runas ----------
  const [sx, sz] = C.salida.pos;
  poner('arch_gate', sx, 0, sz - 1.2, 0, 1.4);
  const runas = [-0.8, 0, 0.8].map((dx, i) => {
    const mat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(runeGlyphCanvas(i + 7)), transparent: true, depthWrite: false, side: THREE.DoubleSide });
    mat.color.setRGB(0.16, 0.14, 0.2);
    const r = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), mat);
    r.position.set(sx + dx, 4.3, sz - 1.0);
    grupo.add(r);
    return { mat, pos: aMundo(sx + dx, 4.3, sz - 1.0) };
  });
  const velo = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.6), brillo(0.6, 0.25, 1.2, { transparent: true, opacity: 0, depthWrite: false }));
  velo.position.set(sx, 1.8, sz - 1.25);
  grupo.add(velo);
  let arcoAbierto = false;
  const puertaSala = {
    encenderRuna(i) {
      runas[i].mat.color.setRGB(2.4, 1.2, 4.0);
      fx.big.emit(runas[i].pos, { count: 50, color: 0xb06bff, intensity: 2.2, speed: 3, life: 1.1, gravity: -1 });
    },
    abrirPuerta() { arcoAbierto = true; },
  };
  const S = crearSellos(ctx, puertaSala, C, SELLOS);

  // ---------- Estado compartido ----------
  const est = {
    sellos: S.estado.sellos,
    aristas: [],                // enlaces tendidos { a, b, medio }
    fase: 0,                    // 0 estrella, 1 fibra, 2 redundancia, 3 hecho
    cortadas: new Set(),        // enlaces que cortó Morvath
    corteHecho: false,
    oraculo: { paso: 0, ips: [], config: null }, // individual
  };
  const aprendido = (id) => estado.learned.has(id);
  let enMano = null; // poste del que sale el enlace que lleva este jugador

  // ---------- Enlaces de luz ----------
  const COLOR = { utp: [0.5, 0.9, 2.4], fibra: [2.6, 1.3, 0.35] };
  const cables = new Map();
  function dibujarCables() {
    for (const [k, c] of cables) if (!est.aristas.some((e) => clave(e.a, e.b) === k)) { grupo.remove(c); c.geometry.dispose(); cables.delete(k); }
    for (const e of est.aristas) {
      const k = clave(e.a, e.b);
      const roto = est.cortadas.has(k);
      let c = cables.get(k);
      if (!c) {
        const A = postes[e.a], B = postes[e.b];
        const pa = new THREE.Vector3(A.x, 1.75, A.z), pb = new THREE.Vector3(B.x, 1.75, B.z);
        const medio = pa.clone().lerp(pb, 0.5);
        medio.y += 2 + pa.distanceTo(pb) * 0.08;
        c = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(pa, medio, pb), 28, e.medio === 'fibra' ? 0.09 : 0.06, 6), brillo(...COLOR[e.medio] ?? COLOR.utp, { transparent: true }));
        grupo.add(c);
        cables.set(k, c);
      }
      c.material.opacity = roto ? 0.25 : 1;
      c.userData.roto = roto;
    }
  }
  const lineaMano = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0x9fd0ff }));
  lineaMano.visible = false;
  lineaMano.frustumCulled = false;
  ctx.escena.add(lineaMano);

  // ---------- Comprobación de la red ----------
  const hayEnlace = (a, b) => est.aristas.some((e) => clave(e.a, e.b) === clave(a, b));
  const cumple = {
    estrella: () => esEstrella(est.aristas, 'switch', C.hojas) && hayEnlace('switch', 'router'),
    fibra: () => conexo(NODOS, est.aristas) && est.aristas.some((e) => clave(e.a, e.b) === clave('tenerife', 'grancanaria') && e.medio === 'fibra'),
    redundancia: () => sinPuntoUnico(C.nucleo, subgrafo(C.nucleo, est.aristas)),
  };
  // avanza las fases que ya se cumplen (en todos los jugadores igual)
  function revisarFases(soyAutor) {
    const mensajes = [];
    while (est.fase < 3) {
      const f = C.fases[est.fase].id;
      const ok = f === 'redundancia' ? cumple.estrella() && cumple.fibra() && cumple.redundancia() : cumple[f]();
      if (!ok) break;
      est.fase++;
      if (soyAutor) ctx.record(true, '1.2');
      sonido.acierto();
      if (f === 'estrella') mensajes.push('¡Estrella montada! Cada equipo del barrio llega al router a través del switch.');
      if (f === 'fibra') mensajes.push('¡Tenerife y Gran Canaria unidas por fibra! Las siete islas ya están conectadas.', 'Pero cuidado: ahora mismo, si se corta **un solo enlace** del núcleo (router, switch, Tenerife y Gran Canaria), alguna isla se queda aislada. Añadid enlaces para que haya **siempre otro camino**.');
      if (f === 'redundancia') mensajes.push('¡Red redundante! Ya no hay ningún enlace imprescindible en el núcleo: si se rompe uno, los datos van por otro. Eso es una **malla**.');
    }
    return mensajes;
  }

  // ---------- Interactuables ----------
  const zona = {
    id: P, nombre: C.nombre, grupo, colliders, musica: 'archipielago', pisada: 'hierba',
    camDist: 7.5, lejos: 230,
    niebla: { color: 0x0d1122, densidad: 0.011 }, luz: { luna: 2.6, cielo: 1.5 },
    entrada: { pos: aMundo(C.muelle.pos[0], 0, C.muelle.pos[1]), mirada: Math.PI, yaw: 0 },
  };
  const nombreIsla = (n) => C.islas[n].nombre;

  // ---------- Opcionales: el faro Wi-Fi (Tenerife) y el pozo de la chatarra (muelle) ----------
  // Individuales: cada uno en su pantalla, sin interrumpir a los compañeros.
  const FARO = new THREE.Vector3(20.5, 0, -4), POZO = new THREE.Vector3(2.2, 0, 25.5);
  const rotulo = (texto, x, y, z) => {
    const r = makeLabel(texto, { height: 0.42, fontSize: 40, font: 'Cinzel, serif', color: '#d8c8ff' });
    r.position.set(x, y, z); // el grupo ya está en el origen del piso
    grupo.add(r);
    return r;
  };
  const rotuloFaro = rotulo('Faro Wi-Fi · opcional', FARO.x, 6.6, FARO.z);
  const rotuloPozo = rotulo('Pozo de la chatarra · opcional', POZO.x, 3.6, POZO.z);
  const opc = { faro: false, pozo: false, pasoPozo: 0 };
  async function leer(id) {
    const l = C.lecciones[id];
    await ui.dialogue(l.paginas);
    if (!aprendido(id)) {
      estado.learned.add(id);
      ui.toast(`Nuevo concepto en el grimorio: **${l.titulo}** (G)`, 'learn', 4200);
    }
  }
  async function premio(texto, rot, pos) {
    rot.visible = false;
    sonido.acierto();
    fx.big.emit(aMundo(pos.x, 3, pos.z), { count: 70, color: 0xc8a8ff, intensity: 2, speed: 3, life: 1.1, gravity: -2 });
    ctx.addSaber(20);
    ctx.celebrar();
    await ui.dialogue([texto]);
  }
  async function hacerFaro() {
    if (!aprendido('wifiCasa')) {
      await ui.dialogue([C.faro.aviso]);
      await leer('wifiCasa');
    }
    let fallo = false;
    const v = await ui.formulario('Configurar la red del faro', 'Faro Wi-Fi · opcional', [
      { id: 'ssid', etiqueta: 'Nombre de la red (SSID)', ayuda: 'Un nombre sin datos personales' },
      { id: 'seguridad', etiqueta: 'Seguridad', ayuda: 'WEP, WPA2, WPA3 o abierta' },
      { id: 'clave', etiqueta: 'Contraseña', ayuda: 'Al menos 12 caracteres' },
    ], (d) => {
      const e = validarWifi(d);
      if (Object.keys(e).length && !fallo) { fallo = true; ctx.record(false, '1.2'); }
      return e;
    });
    if (!v) return;
    ctx.record(true, '1.2');
    opc.faro = true;
    await premio(C.faro.hecho, rotuloFaro, FARO);
  }
  async function hacerPozo() {
    if (!aprendido('raee')) {
      await ui.dialogue([C.chatarra.aviso]);
      await leer('raee');
    }
    const casos = C.chatarra.casos.map((c) => ({ ...c, concepto: 'raee', criterio: '1.2', tipo: 'opcion', opciones: C.chatarra.opciones }));
    const prog = { paso: opc.pasoPozo };
    const ok = await serieDePreguntas(ctx, casos, 'El pozo de la chatarra', prog);
    opc.pasoPozo = prog.paso;
    if (!ok) return;
    opc.pozo = true;
    await premio(C.chatarra.hecho, rotuloPozo, POZO);
  }

  const interactuables = [
    {
      zona, pos: aMundo(FARO.x - 1.6, 0, FARO.z + 1.6), r: 2.4,
      enabled: () => !opc.faro,
      prompt: () => '**E** · Configurar el **faro Wi-Fi** (opcional)',
      action: hacerFaro,
    },
    {
      zona, pos: aMundo(POZO.x, 0, POZO.z), r: 2.4,
      enabled: () => !opc.pozo,
      prompt: () => '**E** · Mirar en el **pozo de la chatarra** (opcional)',
      action: hacerPozo,
    },
    ...NODOS.map((n) => ({
      zona, pos: postes[n].pos, r: 2.0,
      enabled: () => !est.sellos.red,
      prompt: () => {
        if (!aprendido('redes')) return '**E** · Examinar el poste de la isla';
        if (!enMano) return `**E** · Enganchar un enlace en «${nombreIsla(n)}»`;
        if (enMano === n) return '**E** · Soltar el enlace';
        return hayEnlace(enMano, n) ? `**E** · Quitar el enlace ${nombreIsla(enMano)} – ${nombreIsla(n)}` : `**E** · Tender el enlace hasta «${nombreIsla(n)}»`;
      },
      action: async () => {
        if (!aprendido('redes')) return ctx.accion('leccion', { id: 'redes', piso: P });
        if (!enMano) { enMano = n; sonido.coger(); return; }
        if (enMano === n) { enMano = null; sonido.dejar(); return; }
        const a = enMano;
        enMano = null;
        if (hayEnlace(a, n)) return ctx.accion('mec', { piso: P, mec: 'red', paso: 'quitar', a, b: n });
        let medio = 'utp';
        if (clave(a, n) === clave('tenerife', 'grancanaria')) {
          const ok = await ui.quiz(C.preguntaCable, 'El cable submarino');
          ctx.record(ok, C.preguntaCable.criterio);
          if (!ok) return ui.dialogue(['El cable se hunde en el mar sin llegar al otro lado. Pensad en la **distancia** y en qué medio lleva datos más lejos.']);
          medio = 'fibra';
        }
        ctx.accion('mec', { piso: P, mec: 'red', paso: 'poner', a, b: n, medio });
      },
    })),
    {
      zona, pos: aMundo(ORACULO.x, 0, ORACULO.z), r: 2.1,
      enabled: () => !est.sellos.oraculo,
      prompt: () => (aprendido('direcciones') ? '**E** · Consultar al oráculo de las direcciones' : '**E** · Examinar el oráculo'),
      action: () => (aprendido('direcciones') ? hacerOraculo() : ctx.accion('leccion', { id: 'direcciones', piso: P, luego: 'oraculo' })),
    },
    {
      zona, pos: aMundo(VIGIA.x, 0, VIGIA.z), r: 2.1,
      enabled: () => !est.sellos.terminal,
      prompt: () => '**E** · Usar la terminal del vigía',
      action: () => {
        if (!est.sellos.red) return ui.dialogue([C.pistas.bloqueada]);
        if (!aprendido('protocolos')) return ctx.accion('leccion', { id: 'protocolos', piso: P, luego: 'terminal' });
        return abrirTerminal();
      },
    },
  ];

  // ---------- Oráculo (cada jugador en su pantalla) ----------
  async function hacerOraculo() {
    const o = est.oraculo;
    for (let i = o.paso; i < C.oraculo.equipos.length; i++) {
      let fallo = false;
      const valores = await ui.formulario(C.oraculo.equipos[i], `El oráculo de las direcciones · equipo ${i + 1} de ${C.oraculo.equipos.length}`, [
        { id: 'ip', etiqueta: 'Dirección IP', ayuda: '192.168.20.…' },
        { id: 'mascara', etiqueta: 'Máscara', ayuda: '255.255.255.0' },
        { id: 'puerta', etiqueta: 'Puerta de enlace' },
        { id: 'dns', etiqueta: 'Servidor DNS' },
      ], (v) => {
        const errores = validarEquipo(v, { ...C.oraculo.red, ocupadas: o.ips });
        if (Object.keys(errores).length && !fallo) { fallo = true; ctx.record(false, '1.2'); }
        return errores;
      });
      if (!valores) return; // canceló: seguirá desde este equipo
      ctx.record(true, '1.2');
      o.ips.push(valores.ip);
      o.config ??= valores;
      o.paso = i + 1;
      sonido.acierto();
    }
    await ui.dialogue(C.oraculo.dhcp);
    ctx.accion('mec', { piso: P, mec: 'oraculo', paso: 'sello' });
  }

  // ---------- Terminal del vigía ----------
  const ejecutar = crearInterprete({
    red: () => ({ nodos: NODOS, aristas: est.aristas, cortadas: est.cortadas }),
    equipos: C.terminal.equipos,
    dns: C.terminal.dns,
    origen: 'router',
    miEquipo: () => {
      const c = est.oraculo.config;
      return c ? { ...c, mac: '3C-A9-F4-1B-7E-20', dhcp: false } : { ip: '192.168.20.50', mascara: '255.255.255.0', puerta: '192.168.20.1', dns: '192.168.20.1', mac: '3C-A9-F4-1B-7E-20', dhcp: true };
    },
  });
  async function abrirTerminal() {
    if (!est.corteHecho) ctx.accion('mec', { piso: P, mec: 'corte', paso: 'corte' });
    await ui.terminal('Terminal del vigía · Umbravel', ['Sistema del vigía de Umbravel', 'Escribid "ayuda" para ver los comandos. "salir" o Esc para cerrar.', ''], ejecutar, (acc) => {
      if (acc.reparar) ctx.accion('mec', { piso: P, mec: 'reparar', paso: 'reparar', k: acc.reparar });
    });
  }

  // ---------- Red: validar (anfitrión) y aplicar (todos) ----------
  function validar(d) {
    if (d.mec === 'red') {
      if (est.sellos.red || !NODOS.includes(d.a) || !NODOS.includes(d.b) || d.a === d.b) return false;
      if (d.paso === 'quitar') return hayEnlace(d.a, d.b);
      if (clave(d.a, d.b) === clave('tenerife', 'grancanaria') && d.medio !== 'fibra') return false;
      return !hayEnlace(d.a, d.b);
    }
    if (d.mec === 'oraculo') return !est.sellos.oraculo;
    if (d.mec === 'corte') {
      if (est.corteHecho || !est.sellos.red) return false;
      // Morvath aísla Gran Canaria: corta todos sus enlaces (lo decide el anfitrión)
      d.cortes = est.aristas.filter((e) => e.a === 'grancanaria' || e.b === 'grancanaria').map((e) => clave(e.a, e.b));
      return true;
    }
    if (d.mec === 'reparar') return !est.sellos.terminal && est.cortadas.has(d.k);
    return false;
  }
  const claveAcc = (d) => (d.paso === 'sello' || d.paso === 'corte' ? `mec:${P}:${d.mec}:${d.paso}` : null);

  function aplicar(d, soyAutor) {
    if (d.mec === 'red') {
      if (d.paso === 'quitar') est.aristas = est.aristas.filter((e) => clave(e.a, e.b) !== clave(d.a, d.b));
      else est.aristas.push({ a: d.a, b: d.b, medio: d.medio });
      if (d.paso === 'quitar') sonido.dejar(); else sonido.cable();
      dibujarCables();
      const faseAntes = est.fase;
      const mensajes = revisarFases(soyAutor);
      if (mensajes.length) {
        ctx.runFlow(async () => {
          await ui.dialogue(mensajes);
          if (faseAntes === 0 && est.fase >= 1 && soyAutor) ctx.accion('leccion', { id: 'canarias', piso: P });
          if (est.fase === 3) await S.romper('red');
        });
      }
    } else if (d.mec === 'oraculo') ctx.runFlow(() => S.romper('oraculo'));
    else if (d.mec === 'corte') {
      est.corteHecho = true;
      for (const k of d.cortes) est.cortadas.add(k);
      sonido.cristalRoto();
      ctx.sacudir(0.5);
      dibujarCables();
      fx.big.emit(postes.grancanaria.anclaje, { count: 60, color: 0xff4030, intensity: 2, speed: 3, life: 1, gravity: -2 });
    } else if (d.mec === 'reparar') {
      est.cortadas.delete(d.k);
      dibujarCables();
      sonido.acierto();
      if (soyAutor) ctx.record(true, '1.2');
      if (ruta(NODOS, est.aristas.filter((e) => !est.cortadas.has(clave(e.a, e.b))), 'router', 'grancanaria')) {
        est.cortadas.clear();
        dibujarCables();
        ctx.runFlow(async () => {
          await ui.dialogue(C.terminal.bien);
          await S.romper('terminal');
        });
      }
    }
    ctx.refrescarObjetivos();
  }

  // ---------- Zona: caminar sobre las islas y caer al vacío ----------
  const seguro = aMundo(C.muelle.pos[0], 0, C.muelle.pos[1]);
  Object.assign(zona, {
    suelo: (p) => (pisable(p.x - ox, p.z - oz) ? 0 : -200),
    limitar(p) {
      // el arco de la salida está cerrado hasta romper los tres sellos
      const [ax, az] = C.salida.pos;
      if (!arcoAbierto && Math.hypot(p.x - ox - ax, p.z - oz - az) < 4 && p.z - oz < az - 0.6) p.z = oz + az - 0.6;
    },
    limitarCamara(c) { c.y = Math.max(0.8, c.y); },
    guiaHolograma(d, j) {
      if (!pisable(d.x - ox, d.z - oz)) d.set(j.x + 0.9, 0, j.z + 0.9);
    },
    actualizar(dt, t) {
      const j = ctx.jugador;
      if (j.onGround && pisable(j.pos.x - ox, j.pos.z - oz)) seguro.copy(j.pos);
      if (j.pos.y < -14) {
        // ha caído al vacío: vuelve a la última isla que pisó
        j.pos.copy(seguro);
        j.vel.set(0, 0, 0);
        sonido.teletransporte();
        ui.toast('¡Cuidado con el vacío! Volvéis a la última isla.', 'bad', 3000);
      }
      orbe.position.y = 1.85 + Math.sin(t * 1.8) * 0.08;
      pantalla.material.emissiveIntensity = 1.2 + Math.sin(t * 7) * 0.15;
      for (const c of cables.values()) if (c.userData.roto) c.material.opacity = 0.15 + Math.abs(Math.sin(t * 6)) * 0.25;
      if (arcoAbierto && velo.material.opacity < 0.85) velo.material.opacity = Math.min(0.85, velo.material.opacity + dt * 0.5);
      // el enlace que lleva el jugador en la mano
      lineaMano.visible = Boolean(enMano) && grupo.visible;
      if (enMano) {
        const pts = lineaMano.geometry.attributes.position;
        const a = postes[enMano].anclaje;
        pts.setXYZ(0, a.x, a.y, a.z);
        pts.setXYZ(1, j.pos.x, j.pos.y + 1.3, j.pos.z);
        pts.needsUpdate = true;
      }
    },
    objetivos() {
      const items = C.fases.map((f, i) => ({ text: f.objetivo, done: est.fase > i }));
      items.splice(est.fase + 1); // se muestran de una en una
      items.push({ text: 'Configura tres equipos en el oráculo de las direcciones', done: est.sellos.oraculo });
      items.push({ text: est.corteHecho && !est.sellos.terminal ? 'Terminal del vigía: encuentra y repara el enlace cortado' : 'Usa la terminal del vigía (cuando la red esté tendida)', done: est.sellos.terminal });
      if (S.estado.puerta) items.push({ text: 'Cruzad el arco del norte', done: false });
      return items;
    },
    pista() {
      if (!est.sellos.red) return C.pistas.red;
      if (!est.sellos.oraculo) return C.pistas.oraculo;
      if (!est.sellos.terminal) return C.pistas.terminal;
      return C.pistas.puerta;
    },
    // a dónde apunta la guía de la misión actual
    destino() {
      if (!est.sellos.red) return aMundo(rx, 0, rz);
      if (!est.sellos.oraculo) return aMundo(ORACULO.x, 0, ORACULO.z);
      if (!est.sellos.terminal) return aMundo(VIGIA.x, 0, VIGIA.z);
      return 'salida';
    },
    salida: { abierta: () => S.estado.puerta, z: oz + C.salida.pos[1] - 1.8, accion: ['subir', { piso: 'piso5' }] },
  });
  grupo.visible = false;

  return {
    id: P, zona, interactuables, contenido: C, estado: est,
    validar, clave: claveAcc, aplicar,
    jugadorFuera() {},
    async alAprender(id, soyAutor, luego) {
      if (soyAutor && luego === 'oraculo') await hacerOraculo();
      if (soyAutor && luego === 'terminal') await abrirTerminal();
    },
    intro: () => ui.dialogue(C.intro),
  };
}
