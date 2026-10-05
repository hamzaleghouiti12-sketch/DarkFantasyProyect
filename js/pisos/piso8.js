// Piso VIII · Las Criptas del Contagio (seguridad y malware, criterio 3.1).
// El primer piso con criaturas (ver js/enemigos.js: esqueletos y aventureros corruptos de KayKit, CC0).
// Cada una se comporta como su tipo de malware:
//   virus (duerme en un cofre hasta que alguien lo abre), gusano (se copia solo),
//   troyano (disfrazado de cofre de oro), ransomware (encadena un cofre y pide rescate),
//   spyware (os sigue apuntando lo que tecleáis) y botnet (un nigromante con dos zombis).
// Se destierran con la varita: identificar el tipo y elegir la contramedida.
// Las criaturas no hacen daño. Sus paseos se calculan con el tiempo de cada jugador
// (son decorativos); lo compartido —abrir, revelar y desterrar— pasa por «mec».
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import C from '../contenido/piso8.js';
import P2 from '../contenido/piso2.js';
import P3 from '../contenido/piso3.js';
import P4 from '../contenido/piso4.js';
import P5 from '../contenido/piso5.js';
import P6 from '../contenido/piso6.js';
import P7 from '../contenido/piso7.js';
import { Hologram } from '../hologram.js';
import { crearSalaDeTorre, cargarPiezasTorre, PIEZAS_BASE } from '../nucleo/sala-torre.js';
import { cargarPiezas, cargarModelo } from '../modelos.js';
import { makeLabel } from '../textures.js';
import { cargarEnemigo, crearEnemigo, ENEMIGOS } from '../enemigos.js';
import { abrirMuralla } from '../mecanicas/murallaVista.js';
import { crearSellos, serieDePreguntas } from './comun.js';

export const ORIGEN = new THREE.Vector3(0, 0, -4900);
const P = 'piso8';
const SELLOS = ['bestiario', 'muralla', 'triada'];
const EXTRA = ['table_medium_decorated_A', 'column', 'chest', 'chest_gold', 'trunk_large_A', 'barrel_small_stack', 'rubble_half', 'candle_triple', 'banner_green', 'banner_shield_green', 'banner_thin_green'];
const std = (o) => new THREE.MeshStandardMaterial(o);

export async function construir(ctx) {
  const { ui, sonido, fx, estado } = ctx;
  // qué monstruo encarna a cada tipo de malware
  const MODELO = { virus: 'mago_corrupto', gusano: 'esqueleto_minion', troyano: 'esqueleto_warrior', ransomware: 'barbaro_corrupto', spyware: 'picara_corrupta', botnet: 'esqueleto_mage', zombi: 'caballero_corrupto' };
  const [piezas, tumbas, ...plantillasMalware] = await Promise.all([
    cargarPiezasTorre(ctx.paletas.mazmorra, [...PIEZAS_BASE, ...EXTRA]),
    cargarPiezas('assets/modelos/exterior', ['grave_A', 'gravestone', 'skull', 'ribcage'], ctx.paletas.halloween, 'gltf'),
    ...Object.values(MODELO).map(cargarEnemigo),
  ]);
  const plantilla = Object.fromEntries(Object.keys(MODELO).map((k, i) => [k, plantillasMalware[i]]));
  const sala = crearSalaDeTorre({
    ambiente: { color: 0x7dff9a, cada: 0.05, brillo: 0.6, sube: 0.25, vida: 4.5 },
    escena: ctx.escena, origen: ORIGEN, piezas: { ...piezas, ...tumbas }, fx, semilla: 88, cielo: [0.2, 0.4, 0.28],
    estandartes: { normal: 'banner_green', escudo: 'banner_shield_green', fino: 'banner_thin_green' },
  });
  const { poner, obstaculo, aMundo, grupo } = sala;
  const S = crearSellos(ctx, sala, C, SELLOS, { antesDePuerta: () => duelo() });

  // ---------- El jefe: la proyección de Morvath ----------
  // El mismo holograma que Aldric, en rojo y más grande, delante de la puerta.
  // Cada jugador se enfrenta a él en su pantalla (las preguntas son individuales).
  const TODAS = [P2, P3, P4, P5, P6, P7, C].flatMap((c) => c.preguntas);
  let morvath = null, desvanecer = 0;
  const escudos = [];
  async function montarMorvath() {
    if (morvath) return;
    morvath = new Hologram(ctx.escena);
    morvath.uniforms.uColor.value.setRGB(1.5, 0.22, 0.55);
    morvath.light.color.set(0xff3a6a);
    morvath.usarModelo(await cargarModelo('assets/modelos/aldric.glb'));
    morvath.group.scale.setScalar(1.7);
    morvath.group.position.copy(aMundo(0, 0, -15.3));
    const matEscudo = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 0.35, 0.7), transparent: true, opacity: 0.85 });
    for (let i = 0; i < C.jefe.escudos; i++) {
      const e = new THREE.Mesh(new THREE.OctahedronGeometry(0.22), matEscudo);
      ctx.escena.add(e);
      escudos.push(e);
    }
  }
  function romperEscudo(i) {
    const e = escudos[i];
    fx.big.emit(e.position, { count: 50, color: 0xff5a8a, intensity: 2.4, speed: 3.5, life: 1, gravity: -2 });
    sonido.cristalRoto();
    ctx.sacudir(0.3);
    e.visible = false;
  }
  async function duelo() {
    await montarMorvath();
    sonido.teletransporte();
    ctx.sacudir(0.6);
    // la proyección aparece: plano corto hacia ella antes de que hable
    const m = morvath.group.position;
    await ctx.mostrar?.(new THREE.Vector3(m.x + 2.6, 2.0, m.z + 5.5), new THREE.Vector3(m.x, 2.3, m.z), 2.4);
    await ui.dialogue(C.jefe.aparicion, 'Morvath');
    await ui.dialogue(C.jefe.aldricAviso);
    const preguntas = C.jefe.preguntas.map((id) => TODAS.find((q) => q.id === id)).filter(Boolean);
    let rotos = 0, turno = 0, burla = 0;
    while (rotos < C.jefe.escudos) {
      const q = preguntas[turno++ % preguntas.length];
      const ok = await ui.quiz(q, `Duelo con Morvath · escudo ${rotos + 1} de ${C.jefe.escudos}`);
      ctx.record(ok, q.criterio);
      if (ok) {
        romperEscudo(rotos);
        ui.toast(`✦ ${C.jefe.acierto[rotos]}`, 'seal', 2500);
        rotos++;
      } else await ui.dialogue([C.jefe.burlas[burla++ % C.jefe.burlas.length]], 'Morvath');
    }
    await ui.dialogue(C.jefe.derrota, 'Morvath');
    sonido.teletransporte();
    desvanecer = 0.001;
    await new Promise((ok) => setTimeout(ok, 1400));
    ctx.addSaber(50);
    ctx.celebrar();
    await ui.dialogue(C.jefe.aldricDespues);
  }
  const est = {
    sellos: S.estado.sellos,
    desterradas: new Set(), virusAbierto: false, troyanoRevelado: false,
    triada: { paso: 0 },
  };
  const aprendido = (id) => estado.learned.has(id);

  // ---------- Decorado: tumbas y huesos ----------
  for (const [n, x, z, ry, r] of [['grave_A', -10, 14, 0.2, 0.9], ['gravestone', -10.5, 10.5, -0.3, 0.5], ['grave_A', 10.2, 14.5, -0.2, 0.9], ['gravestone', 10.6, 11, 0.4, 0.5], ['rubble_half', -10.3, -15.5, 0.3, 1.2], ['barrel_small_stack', 10.2, -15.8, 0.2, 0.9]]) { poner(n, x, 0, z, ry); obstaculo(x, z, r); }
  poner('skull', -3, 0, 13, 2, 0.45, false);
  const niebla = new THREE.PointLight(0x5aff8a, 12, 14, 1.8); // brillo enfermizo en el centro
  niebla.position.set(0, 2, 2);
  grupo.add(niebla);

  // ---------- Cofres ----------
  const COFRE_VIRUS = { x: -8, z: -5 }, COFRE_RANSOM = { x: 8, z: -5 }, COFRE_TROYANO = { x: 7.5, z: 10 };
  const cofreVirus = poner('chest', COFRE_VIRUS.x, 0, COFRE_VIRUS.z, Math.PI / 2);
  const tapaVirus = cofreVirus.getObjectByName('chest_lid');
  obstaculo(COFRE_VIRUS.x, COFRE_VIRUS.z, 0.9);
  poner('chest', COFRE_RANSOM.x, 0, COFRE_RANSOM.z, -Math.PI / 2);
  obstaculo(COFRE_RANSOM.x, COFRE_RANSOM.z, 0.9);
  const cadena = std({ color: 0x8a8a92, metalness: 0.9, roughness: 0.35 });
  // la cadena es una sola malla (7 eslabones fusionados): menos llamadas de dibujo
  const eslabones = Array.from({ length: 7 }, (_, i) => {
    const g = new THREE.TorusGeometry(0.1, 0.03, 6, 12);
    if (i % 2) g.rotateY(Math.PI / 2);
    return g.translate(0, 0.55, -0.75 + i * 0.25);
  });
  const cadenas = new THREE.Group();
  cadenas.add(new THREE.Mesh(mergeGeometries(eslabones), cadena));
  cadenas.position.set(COFRE_RANSOM.x, 0, COFRE_RANSOM.z);
  grupo.add(cadenas);
  const rescate = makeLabel('🔒 Paga 100 monedas', { height: 0.34, fontSize: 44, color: '#ff8a7a', border: 'rgba(255,90,70,0.9)' });
  rescate.position.set(COFRE_RANSOM.x, 3.3, COFRE_RANSOM.z);
  grupo.add(rescate);
  const cofreOro = poner('chest_gold', COFRE_TROYANO.x, 0, COFRE_TROYANO.z, -Math.PI / 2);
  obstaculo(COFRE_TROYANO.x, COFRE_TROYANO.z, 0.9);
  const regalo = makeLabel('🎁 ¡Regalo gratis!', { height: 0.32, fontSize: 44, color: '#ffe08a' });
  regalo.position.set(COFRE_TROYANO.x, 2, COFRE_TROYANO.z);
  grupo.add(regalo);

  // ---------- Las criaturas ----------
  const bichos = []; // cada modelo visible: { id, g, anim, posicion(t) }
  const nuevo = (id, clave, posicion) => {
    const c = crearEnemigo(plantilla[clave]);
    c.g.visible = false;
    ctx.escena.add(c.g);
    const b = { id, ...c, posicion, alive: true, data: null, group: c.g, fuera: 0, aturdida: 0, reloj: 0 };
    bichos.push(b);
    return b;
  };
  const circulo = (cx, cz, r, vel, fase = 0) => (t) => [cx + Math.cos(t * vel + fase) * r, cz + Math.sin(t * vel + fase) * r];
  const ruta = (pts, vel, fase = 0) => (t) => { // recorrido cerrado entre puntos
    const lados = pts.map((p, i) => [p, pts[(i + 1) % pts.length]]);
    const largos = lados.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1]));
    let d = ((t * vel + fase) % largos.reduce((s, l) => s + l, 0) + 1e9) % largos.reduce((s, l) => s + l, 0);
    for (let i = 0; i < lados.length; i++) {
      if (d <= largos[i]) { const [a, b] = lados[i], k = d / largos[i]; return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; }
      d -= largos[i];
    }
    return pts[0];
  };
  nuevo('virus', 'virus', circulo(COFRE_VIRUS.x + 1.5, COFRE_VIRUS.z, 1.4, 0.8));
  const CAMINO_GUSANO = [[-6, 3], [-3, 3], [-3, 12], [-6, 12]];
  for (let k = 0; k < 3; k++) nuevo('gusano', 'gusano', ruta(CAMINO_GUSANO, 1.3, k * 6));
  nuevo('troyano', 'troyano', circulo(COFRE_TROYANO.x - 1.6, COFRE_TROYANO.z, 1.1, 0.6));
  nuevo('ransomware', 'ransomware', () => [COFRE_RANSOM.x - 1.2, COFRE_RANSOM.z + 0.3]);
  nuevo('spyware', 'spyware', circulo(0, 1, 4.5, 0.35));
  nuevo('botnet', 'botnet', ruta([[-3, -10], [3, -10], [3, -13], [-3, -13]], 0.9));
  for (let k = 0; k < 2; k++) nuevo('botnet', 'zombi', null).zombi = k;
  const porId = (id) => bichos.filter((b) => b.id === id);
  const necro = porId('botnet')[0];
  const spy = porId('spyware')[0];
  const bocadillo = makeLabel('📋 copiando teclas… W A S D', { height: 0.26, fontSize: 38, color: '#1a1208', bg: 'rgba(200,220,255,0.95)', border: 'rgba(90,120,200,0.9)' });
  bocadillo.position.y = 2.4;
  spy.g.add(bocadillo);
  { const r = porId('ransomware')[0]; if (r.plantilla.anims.quieto) r.anim.bucle(r.plantilla.anims.quieto); }
  for (const b of bichos) {
    const def = C.criaturas.find((c) => c.id === b.id);
    b.data = { titulo: 'Criatura de Morvath a la vista', de: '¿Qué será?', texto: def.pista, accion: '<b>F</b> · identificarla con la varita' };
  }

  // ¿cuándo se ve cada una?
  const visible = (b, t) => {
    if (!b.alive && b.fuera >= 1) return false;
    if (b.id === 'virus') return est.virusAbierto;
    if (b.id === 'troyano') return est.troyanoRevelado;
    if (b.id === 'gusano') return porId('gusano').indexOf(b) <= Math.floor(t / 7); // una copia nueva cada 7 s
    return true;
  };

  // ---------- Muralla (este), cofre de la tríada (norte) y pozo de la Wi-Fi (oeste) ----------
  const MURALLA = { x: 9, z: 3 }, TRIADA = { x: 0, z: -7 }, POZO = { x: -8.5, z: 8 };
  const muro = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.4, 3.2), std({ color: 0x5a4a44, roughness: 0.95 }));
  muro.position.set(MURALLA.x + 1.2, 1.2, MURALLA.z);
  const llamas = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.8), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 1.1, 0.3), transparent: true, opacity: 0.8 }));
  llamas.position.set(MURALLA.x + 0.85, 2.7, MURALLA.z);
  llamas.rotation.y = -Math.PI / 2;
  grupo.add(muro, llamas);
  obstaculo(MURALLA.x + 1.2, MURALLA.z - 1, 0.8);
  obstaculo(MURALLA.x + 1.2, MURALLA.z + 1, 0.8);
  poner('trunk_large_A', TRIADA.x, 0, TRIADA.z, 0, 1.2);
  obstaculo(TRIADA.x, TRIADA.z, 1.1);
  let rotuloTriada = null; // la tríada protegida ya no necesita letras ni rótulo (despeja el duelo)
  const letras = ['C', 'I', 'D'].map((l, i) => {
    const s = makeLabel(l, { height: 0.45, fontSize: 60, font: 'Cinzel, serif', color: '#9fe6ff' });
    grupo.add(s);
    return { s, a: (i / 3) * Math.PI * 2 };
  });
  // ---------- Opcional · El taller del parche (pared oeste) ----------
  const TALLER = { x: -10.2, z: 2 };
  poner('table_medium_decorated_A', TALLER.x, 0, TALLER.z, Math.PI / 2);
  obstaculo(TALLER.x, TALLER.z - 0.6, 0.8);
  obstaculo(TALLER.x, TALLER.z + 0.6, 0.8);
  const rotuloTaller = makeLabel('Taller del parche · opcional', { height: 0.3, fontSize: 40, font: 'Cinzel, serif', color: '#d8c8ff' });
  rotuloTaller.position.set(TALLER.x, 2.4, TALLER.z);
  grupo.add(rotuloTaller);
  const parche = { paso: 0, hecho: false };
  async function hacerTaller() {
    if (!aprendido('actualizaciones')) {
      await ui.dialogue([C.parche.aviso]);
      const l = C.lecciones.actualizaciones;
      await ui.dialogue(l.paginas);
      estado.learned.add('actualizaciones');
      ui.toast(`Nuevo concepto en el grimorio: **${l.titulo}** (G)`, 'learn', 4200);
    }
    if (!(await serieDePreguntas(ctx, C.parche.pasos, 'El taller del parche', parche))) return;
    parche.hecho = true;
    rotuloTaller.visible = false;
    sonido.acierto();
    fx.big.emit(aMundo(TALLER.x + 1, 1.8, TALLER.z), { count: 70, color: 0xc8a8ff, intensity: 2, speed: 3, life: 1.1, gravity: -2 });
    ctx.addSaber(20);
    ctx.celebrar();
    await ui.dialogue([C.parche.hecho]);
  }

  const pozo = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.1, 0.9, 20, 1, true), std({ color: 0x6a605a, roughness: 0.95, side: THREE.DoubleSide }));
  pozo.position.set(POZO.x, 0.45, POZO.z);
  const agua = new THREE.Mesh(new THREE.CircleGeometry(0.95, 20), std({ color: 0x1a3a5a, emissive: 0x2a6aa8, emissiveIntensity: 0.8 }));
  agua.rotation.x = -Math.PI / 2;
  agua.position.set(POZO.x, 0.6, POZO.z);
  grupo.add(pozo, agua);
  obstaculo(POZO.x, POZO.z, 1.2);
  for (const [t, x, z, y] of [['Muralla cortafuegos', MURALLA.x + 0.6, MURALLA.z, 3.6], ['El cofre de la tríada', TRIADA.x, TRIADA.z, 3.1], ['Pozo de la Wi-Fi pública', POZO.x, POZO.z, 1.9]]) {
    const l = makeLabel(t, { height: 0.3, fontSize: 40 });
    l.position.set(x, y, z);
    grupo.add(l);
    if (t.includes('tríada')) rotuloTriada = l;
  }

  // ---------- Desterrar con la varita ----------
  const mezclar = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
  async function apuntar(b) {
    if (!aprendido('malware')) { ctx.accion('leccion', { id: 'malware', piso: P }); return; }
    if (!b.alive) return;
    const def = C.criaturas.find((c) => c.id === b.id);
    const q1 = {
      tipo: 'opcion', texto: `¿Qué tipo de malware es esta criatura? ${def.pista}`,
      opciones: C.tipos, correcta: C.tipos.indexOf(def.tipo),
      explicacion: `Es un ${def.tipo.toLowerCase()}: ${def.pista.charAt(0).toLowerCase()}${def.pista.slice(1)}`,
    };
    const ok1 = await ui.quiz(q1, 'La varita identifica a la criatura');
    ctx.record(ok1, '3.1');
    if (!ok1) { sonido.chisporroteo(); return; }
    const otras = mezclar(C.tipos.filter((t) => t !== def.tipo)).slice(0, 3).map((t) => C.contramedidas[t]);
    const opciones = mezclar([C.contramedidas[def.tipo], ...otras]);
    const q2 = {
      tipo: 'opcion', texto: `Es un ${def.tipo}. ¿Qué contramedida lo destierra?`,
      opciones, correcta: opciones.indexOf(C.contramedidas[def.tipo]),
      explicacion: `Contra un ${def.tipo.toLowerCase()}: ${C.contramedidas[def.tipo].toLowerCase()}.`,
    };
    const ok2 = await ui.quiz(q2, 'La varita elige la contramedida');
    ctx.record(ok2, '3.1');
    if (!ok2) { sonido.chisporroteo(); return; }
    sonido.lanzar(0x9cffb0);
    ctx.accion('mec', { piso: P, mec: 'desterrar', paso: 'desterrar', id: b.id });
  }

  // ---------- Interactuables ----------
  const zona = sala.zona;
  const interactuables = [
    {
      zona, pos: aMundo(COFRE_VIRUS.x, 0, COFRE_VIRUS.z), r: 2,
      enabled: () => !est.virusAbierto,
      prompt: () => '**E** · Abrir el cofre',
      action: () => ctx.accion('mec', { piso: P, mec: 'abrir', paso: 'abrir' }),
    },
    {
      zona, pos: aMundo(MURALLA.x, 0, MURALLA.z), r: 2.4,
      enabled: () => !est.sellos.muralla,
      prompt: () => (aprendido('cortafuegos') ? '**E** · Configurar la muralla cortafuegos' : '**E** · Examinar la muralla'),
      action: () => (aprendido('cortafuegos') ? levantarMuralla() : ctx.accion('leccion', { id: 'cortafuegos', piso: P, luego: 'muralla' })),
    },
    {
      zona, pos: aMundo(TRIADA.x, 0, TRIADA.z), r: 2.4,
      enabled: () => !est.sellos.triada,
      prompt: () => (aprendido('triada') ? '**E** · Proteger el cofre de la tríada' : '**E** · Examinar el cofre de la tríada'),
      action: () => (aprendido('triada') ? proteger() : ctx.accion('leccion', { id: 'triada', piso: P, luego: 'triada' })),
    },
    {
      zona, pos: aMundo(TALLER.x + 1.2, 0, TALLER.z), r: 2.0,
      enabled: () => !parche.hecho,
      prompt: () => '**E** · Usar el **taller del parche** (opcional)',
      action: hacerTaller,
    },
    {
      zona, pos: aMundo(POZO.x, 0, POZO.z), r: 2.3,
      enabled: () => !aprendido('wifi'),
      prompt: () => '**E** · Asomarse al pozo de la Wi-Fi pública',
      action: () => ctx.accion('leccion', { id: 'wifi', piso: P }),
    },
  ];
  async function levantarMuralla() {
    const hecho = await abrirMuralla(ui, { trafico: C.trafico, practicas: C.practicas, alComprobar: (ok) => { ctx.record(ok, '3.1'); ok ? sonido.acierto() : sonido.fallo(); } });
    if (hecho) ctx.accion('mec', { piso: P, mec: 'muralla', paso: 'sello' });
  }
  async function proteger() {
    if (await serieDePreguntas(ctx, C.triada, 'El cofre de la tríada', est.triada)) ctx.accion('mec', { piso: P, mec: 'triada', paso: 'sello' });
  }

  // ---------- Red ----------
  function validar(d) {
    if (d.mec === 'abrir') return !est.virusAbierto;
    if (d.mec === 'revelar') return !est.troyanoRevelado;
    if (d.mec === 'desterrar') return C.criaturas.some((c) => c.id === d.id) && !est.desterradas.has(d.id);
    return SELLOS.includes(d.mec) && !est.sellos[d.mec];
  }
  const clave = (d) => (d.mec === 'desterrar' ? `mec:${P}:desterrar:${d.id}` : `mec:${P}:${d.mec}:${d.paso}`);
  function aplicar(d, soyAutor) {
    if (d.mec === 'abrir') {
      est.virusAbierto = true;
      sonido.puerta();
      ctx.sacudir(0.3);
      fx.big.emit(aMundo(COFRE_VIRUS.x, 1, COFRE_VIRUS.z), { count: 60, color: 0x9cffb0, intensity: 2, speed: 3, life: 1, gravity: -2 });
      ctx.runFlow(() => ui.dialogue(['¡Algo salió del cofre al abrirlo! Así actúan algunas criaturas: esperan dormidas a que alguien **abra** lo que no debía.']));
    } else if (d.mec === 'revelar') {
      est.troyanoRevelado = true;
      cofreOro.visible = false;
      regalo.visible = false;
      sonido.cristalRoto();
      fx.big.emit(aMundo(COFRE_TROYANO.x, 1, COFRE_TROYANO.z), { count: 60, color: 0xffe08a, intensity: 2, speed: 3, life: 1, gravity: -2 });
      ctx.runFlow(() => ui.dialogue(['¡El «regalo» era una trampa! Lo que parecía un cofre de oro era una criatura **disfrazada**.']));
    } else if (d.mec === 'desterrar') {
      est.desterradas.add(d.id);
      for (const b of porId(d.id)) {
        b.alive = false;
        fx.big.emit(b.g.position.clone().setY(1), { count: 50, color: 0x9cffb0, intensity: 2.2, speed: 3.5, life: 1, gravity: -2 });
      }
      if (d.id === 'ransomware') { cadenas.visible = false; rescate.visible = false; }
      sonido.acierto();
      ui.toast(`✦ Criatura desterrada (${est.desterradas.size}/${C.criaturas.length})`, 'good', 3000);
      if (est.desterradas.size === C.criaturas.length) ctx.runFlow(() => S.romper('bestiario'));
    } else ctx.runFlow(() => S.romper(d.mec));
    ctx.refrescarObjetivos();
  }

  // ---------- Animación ----------
  let t = 0;
  const destino = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  let avisoAturdir = false;
  function actualizar(dt, tt) {
    sala.update(dt, tt);
    if (morvath?.group.visible) {
      const j = ctx.jugador.pos, g = morvath.group;
      morvath.uniforms.uTime.value = tt;
      if (desvanecer > 0) {
        desvanecer += dt;
        morvath.uniforms.uBoost.value = Math.max(0, 1.3 - desvanecer);
        if (desvanecer > 1.3) { g.visible = false; for (const e of escudos) e.visible = false; }
      } else morvath.uniforms.uBoost.value = 1.3;
      morvath.figure.position.y = 0.3 + Math.sin(tt * 1.3) * 0.12;
      g.rotation.y = Math.atan2(j.x - g.position.x, j.z - g.position.z);
      morvath.anim?.update(dt);
      morvath.light.intensity = 9 * (0.85 + Math.sin(tt * 17) * 0.15);
      escudos.forEach((e, i) => {
        const a = tt * 0.9 + (i / escudos.length) * Math.PI * 2;
        e.position.set(g.position.x + Math.cos(a) * 2, 2.3 + Math.sin(tt * 2 + i) * 0.3, g.position.z + Math.sin(a) * 2);
        e.rotation.y += dt * 2;
      });
    }
    t += dt;
    const j = ctx.jugador.pos;
    // el troyano se descubre cuando alguien se acerca al «regalo»
    if (!est.troyanoRevelado && !ctx.estado.pedido.troyano && Math.hypot(j.x - ORIGEN.x - COFRE_TROYANO.x, j.z - ORIGEN.z - COFRE_TROYANO.z) < 2.6) {
      ctx.estado.pedido.troyano = true;
      ctx.accion('mec', { piso: P, mec: 'revelar', paso: 'revelar' });
    }
    for (const b of bichos) {
      if (b.aturdida > 0) {
        b.aturdida = Math.max(0, b.aturdida - dt);
        if (Math.random() < 0.3) fx.small.emit(tmp.copy(b.g.position).setY(2.1), { count: 1, color: 0xffe07a, intensity: 2, speed: 0.6, life: 0.6, jitter: 0.3 });
      } else b.reloj += dt;
      const ver = visible(b, t) && grupo.visible;
      b.g.visible = ver;
      if (!ver) continue;
      let xz;
      if (b.zombi !== undefined) {
        const a = t * 1.2 + b.zombi * Math.PI;
        xz = [necro.g.position.x - ORIGEN.x + Math.cos(a) * 1.4, necro.g.position.z - ORIGEN.z + Math.sin(a) * 1.4];
      } else xz = b.posicion(b.reloj);
      destino.set(ORIGEN.x + xz[0], 0, ORIGEN.z + xz[1]);
      const dx = destino.x - b.g.position.x, dz = destino.z - b.g.position.z;
      if (Math.hypot(dx, dz) > 0.01) b.g.rotation.y = Math.atan2(dx, dz);
      b.g.position.copy(destino);
      if (b.id === 'spyware') b.g.rotation.y = Math.atan2(j.x - b.g.position.x, j.z - b.g.position.z); // no os quita ojo
      if (!b.alive) {
        b.fuera = Math.min(1, b.fuera + dt * 1.5);
        b.g.scale.setScalar(Math.max(0.01, 1 - b.fuera));
        b.g.position.y += b.fuera * 1.5;
      }
      b.anim.update(dt);
    }
    if (est.virusAbierto && tapaVirus) tapaVirus.rotation.x = Math.max(-1.6, tapaVirus.rotation.x - dt * 3);
    niebla.intensity = est.sellos.bestiario ? 0 : 10 + Math.sin(tt * 1.7) * 3;
    llamas.material.opacity = 0.6 + Math.sin(tt * 9) * 0.15;
    if (rotuloTriada) rotuloTriada.visible = !est.sellos.triada;
    for (const l of letras) {
      l.s.visible = !est.sellos.triada;
      l.a += dt * 0.8;
      l.s.position.set(TRIADA.x + Math.cos(l.a) * 1.3, 2.2 + Math.sin(tt * 2 + l.a) * 0.1, TRIADA.z + Math.sin(l.a) * 1.3);
    }
    rescate.position.y = 3.3 + Math.sin(tt * 2) * 0.08;
  }

  function objetivos() {
    const items = [
      { text: `Destierra a las criaturas con la varita (${est.desterradas.size}/${C.criaturas.length})`, done: est.sellos.bestiario },
      { text: 'Configura la muralla cortafuegos (este)', done: est.sellos.muralla },
      { text: 'Protege el cofre de la tríada (norte)', done: est.sellos.triada },
      { text: 'Opcional: asómate al pozo de la Wi-Fi pública', done: aprendido('wifi') },
    ];
    if (S.estado.puerta) items.push({ text: 'Subid por la escalera del norte', done: false });
    return items;
  }
  function pista() {
    if (!est.sellos.bestiario) return C.pistas.criaturas;
    if (!est.sellos.muralla) return C.pistas.cortafuegos;
    if (!est.sellos.triada) return C.pistas.triada;
    return C.pistas.puerta;
  }
  // a dónde apunta la guía de la misión actual (main.js la dibuja)
  function destino() {
    if (!est.sellos.bestiario) return zona.dianas?.().find((d) => d.alive)?.group.position ?? aMundo(0, 0, 0);
    if (!est.sellos.muralla) return aMundo(MURALLA.x, 0, MURALLA.z);
    if (!est.sellos.triada) return aMundo(TRIADA.x, 0, TRIADA.z);
    return 'salida';
  }

  Object.assign(zona, {
    id: P, nombre: C.nombre, musica: 'criptas',
    actualizar, objetivos, pista, destino,
    dianas: () => bichos.filter((b) => b.alive && b.g.visible),
    alApuntar: apuntar,
    // un golpe de arma aturde a la criatura unos segundos: más fácil apuntarle con la varita
    alGolpear(b) {
      for (const x of porId(b.id)) x.aturdida = 3.5;
      if (!avisoAturdir) {
        avisoAturdir = true;
        ui.toast('¡Criatura aturdida! Las armas no destierran malware: ahora apuntadle con la varita (**F**).', 'info', 5000);
      }
    },
    salida: { abierta: () => S.estado.puerta, z: sala.salidaZ, accion: ['fin', { piso: P }] },
  });
  zona.grupo.visible = false;

  return {
    id: P, zona, interactuables, contenido: C, estado: est,
    validar, clave, aplicar, jugadorFuera() {},
    async alAprender(id, soyAutor, luego) {
      if (!soyAutor) return;
      if (luego === 'muralla') await levantarMuralla();
      if (luego === 'triada') await proteger();
    },
    intro: () => ui.dialogue(C.intro),
  };
}
