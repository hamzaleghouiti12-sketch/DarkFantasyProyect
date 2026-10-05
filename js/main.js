import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Particles } from './particles.js';
import { buildWorld, ROOM } from './world.js';
import { crearCasa } from './casa.js';
import { crearExterior } from './exterior.js';
import { Player } from './player.js';
import { Hologram } from './hologram.js';
import { SpellSystem, SPELLS } from './spells.js';
import { UI } from './ui.js';
import { Sonido } from './audio.js';
import { PROLOGO, CASA, EXTERIOR, PISO1, PREGUNTAS } from './content.js';
import { RUTAS, cargarModelo, cargarPaleta } from './modelos.js';
import { cargarMazmorra, vestirMazmorra } from './mazmorra.js';
import { Red, MAX_JUGADORES } from './red.js';
import { Companero, TINTES, crearEtiqueta, claveCompanero } from './companeros.js';
import { PERSONAJES, personajeValido, cargarPersonaje, instanciar, configurarVarita, ataqueDe } from './personajes.js';
import { crearAtaques } from './ataques.js';
import { leerOpciones, abrirOpciones } from './opciones.js';
import { esTactil, crearTactil } from './tactil.js';
import { descargarInforme } from './informe.js';
import { crearCine } from './cinematica.js';
import GUARDIANES from './contenido/guardianes.js';
import { crearGuardianes } from './mecanicas/guardianes.js';
import { Chat } from './chat.js';
import PISO2 from './contenido/piso2.js';
import PISO3 from './contenido/piso3.js';
import PISO4 from './contenido/piso4.js';
import PISO5 from './contenido/piso5.js';
import PISO6 from './contenido/piso6.js';
import PISO7 from './contenido/piso7.js';
import PISO8 from './contenido/piso8.js';

// Pisos que se construyen al llegar a ellos (carga diferida). El Piso I sigue en world.js.
const PISOS = {
  piso2: () => import('./pisos/piso2.js'),
  piso3: () => import('./pisos/piso3.js'),
  piso4: () => import('./pisos/piso4.js'),
  piso5: () => import('./pisos/piso5.js'),
  piso6: () => import('./pisos/piso6.js'),
  piso7: () => import('./pisos/piso7.js'),
  piso8: () => import('./pisos/piso8.js'),
};
const ORDEN_PISOS = ['piso1', ...Object.keys(PISOS)];
const siguientePiso = (id) => ORDEN_PISOS[ORDEN_PISOS.indexOf(id) + 1] ?? null;
const CONTENIDO_PISOS = [PISO2, PISO3, PISO4, PISO5, PISO6, PISO7, PISO8];
// Todas las lecciones y todas las preguntas de la varita, de todos los pisos
const LECCIONES = Object.assign({ ...PISO1.lecciones }, ...CONTENIDO_PISOS.map((c) => c.lecciones));
const CRITERIO_PISO1 = { contrasenas: '3.1', '2fa': '3.3', phishing: '3.3' };
const BANCO = [...PREGUNTAS.map((q) => ({ criterio: CRITERIO_PISO1[q.concepto], ...q })), ...CONTENIDO_PISOS.flatMap((c) => c.preguntas)];

try {
  await Promise.all([
    document.fonts.load('700 40px Cinzel'),
    document.fonts.load('900 40px Cinzel'),
    document.fonts.load('700 40px "Alegreya Sans"'),
    document.fonts.load('500 40px "Alegreya Sans"'),
  ]);
} catch { /* sin fuentes web se usan las del sistema */ }

// ---------- Render ----------
const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050407);
scene.fog = new THREE.FogExp2(0x07060b, 0.028);
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 120);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.75, 0.55, 0.85);
composer.addPass(bloom);
composer.addPass(new OutputPass());

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
});

// ---------- Luz global: cielo y luna (la luna sigue al jugador para que haya sombras en todas partes) ----------
const hemi = new THREE.HemisphereLight(0x4a5a8a, 0x1c120e, 1.1);
scene.add(hemi);
const moon = new THREE.DirectionalLight(0x8fa6ff, 1.3);
moon.castShadow = true;
moon.shadow.mapSize.set(2048, 2048);
Object.assign(moon.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 80 });
moon.shadow.bias = -0.0005;
moon.shadow.normalBias = 0.03;
scene.add(moon, moon.target);

// ---------- Zonas: la casa de Aldric, el exterior y el Piso I de la torre ----------
const fx = { small: new Particles(scene, 3000, 0.09), big: new Particles(scene, 1500, 0.3) };
const grupoTorre = new THREE.Group();
scene.add(grupoTorre);
const world = buildWorld(grupoTorre, fx, PISO1);
const casa = crearCasa(scene);
const exterior = crearExterior(scene);
world.zona.entrada = { pos: new THREE.Vector3(0, 0, 14), mirada: Math.PI, yaw: 0 };
casa.nombre = CASA.nombre;
exterior.nombre = EXTERIOR.nombre;
world.zona.nombre = PISO1.nombre;
world.zona.salida = { abierta: () => state.doorOpen, get z() { return ROOM.salida; }, accion: ['subir', { piso: 'piso2' }] };
const zonas = { casa, exterior, piso1: world.zona };

const player = new Player(scene);
const aldric = new Hologram(scene);
aldric.group.visible = false; // aparece cuando se activa el cristal
const spells = new SpellSystem(scene, fx);
const ataques = crearAtaques({ escena: scene, fx, sonido: null });
const ui = new UI();
const sonido = new Sonido();
ataques.sonido = sonido;

// ---------- Opciones y accesibilidad (tecla O) ----------
const opciones = leerOpciones();
function aplicarOpciones(o) {
  sonido.ajustarVolumen(o.musica, o.efectos);
  document.documentElement.style.setProperty('--texto', o.texto); // tamaño del texto de la interfaz
  if (o.reducirMovimiento) state.shake = 0;
  ajustarCalidad(o.calidadBaja);
}
// calidad baja: resolución 1:1, sombras de 1024 y sin resplandor (bloom)
const ratioPantalla = () => (opciones.calidadBaja ? 1 : Math.min(devicePixelRatio, 1.75));
function ajustarCalidad(baja) {
  bloom.enabled = !baja;
  const lado = baja ? 1024 : 2048;
  if (moon.shadow.mapSize.x !== lado) {
    moon.shadow.mapSize.set(lado, lado);
    moon.shadow.map?.dispose();
    moon.shadow.map = null;
  }
  renderer.setPixelRatio(ratioPantalla());
  renderer.setSize(innerWidth, innerHeight);
  composer.setPixelRatio?.(ratioPantalla());
  composer.setSize(innerWidth, innerHeight);
}
const red = new Red();
const companeros = new Map(); // id → Companero
const chat = new Chat((texto) => {
  const m = red.enviarChat(texto);
  if (m) chat.anadir(m);
});
const leer = (k) => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };
const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento local */ } };
// personaje y etiqueta de este jugador (se recuerdan para la próxima vez)
const miPerfil = { personaje: personajeValido(leer('torreMorvathPersonaje')), etiqueta: leer('torreMorvathEtiqueta') };
ui.onRespuesta = (ok) => (ok ? sonido.acierto() : sonido.fallo());
ui.onDialogo = () => sonido.holograma();

// Modelos externos (KayKit, CC0). Si algo falla, se quedan los hechos por código.
const intentar = async (que, fn) => {
  try { await fn(); } catch (e) { console.warn(`No se pudo cargar ${que}; uso la versión hecha por código.`, e); }
};
const paletas = {};
await intentar('las paletas', async () => {
  const [picaro, mago, mazmorra, halloween, medieval] = await Promise.all(
    [RUTAS.paletaPicaro, RUTAS.paletaMago, RUTAS.paletaMazmorra, 'assets/texturas/paleta_halloween_oscura.png', 'assets/texturas/paleta_medieval_oscura.png'].map(cargarPaleta),
  );
  Object.assign(paletas, { picaro, mago, mazmorra, halloween, medieval });
});
await Promise.all([
  intentar('los personajes', async () => {
    const [varita, mago] = await Promise.all([cargarModelo(RUTAS.varita), cargarModelo(RUTAS.aldric)]);
    configurarVarita(varita, paletas.mago, player.tipMat);
    const pl = await cargarPersonaje(miPerfil.personaje);
    player.usarModelo(instanciar(pl), pl.clips);
    aldric.usarModelo(mago);
  }),
  intentar('la mazmorra', async () => vestirMazmorra(world, grupoTorre, await cargarMazmorra(paletas.mazmorra))),
  intentar('la casa', () => casa.vestir(paletas.mazmorra)),
  intentar('el exterior', () => exterior.vestir(paletas.halloween, paletas.medieval)),
]);
player.mostrarVarita(false);

// ---------- Cinemáticas (js/cinematica.js): mientras hay una, ella maneja la cámara ----------
const cine = crearCine({ escena: scene, camara: camera, sonido, fx, ui, luna: moon, cielo: hemi, casa, ponerZona: (z) => aplicarZona(z), paletaMago: paletas.mago });


// ---------- Estado ----------
const state = {
  phase: 'title',
  learned: new Set(),
  seals: { cartel: false, altar: false, pergaminos: false },
  saber: 0, aciertos: 0, fallos: 0, startedAt: 0,
  wandCooldown: 0, doorOpen: false, finished: false,
  recent: [], target: null, interact: null, phishingTriggered: false, shake: 0,
  varita: false,
  casa: { cristal: false, decidido: false, puerta: 0, abriendo: false },
  comentados: new Set(),
  pasos: 0,
  hecho: new Set(),   // acciones compartidas ya aplicadas (evita repetirlas en equipo)
  pedido: {},         // acciones que este jugador ya ha pedido y esperan respuesta
  envio: 0,
  criterios: {},      // aciertos y fallos por criterio de evaluación (informe)
  historial: {},      // por pregunta: fallos y aciertos seguidos (repaso espaciado)
};
aplicarOpciones(opciones);
const pisos = {};           // pisos ya construidos (id → piso)
const guardianes = {};      // guardianes que patrullan cada piso (id del piso → guardianes)
const construyendo = {};    // pisos que se están construyendo (id → promesa)
const pendientes = [];      // acciones de un piso que llegaron antes de construirlo
const fraudTotal = PISO1.pergaminos.filter((p) => p.fraude).length;
let fraudLeft = fraudTotal;
let zona = exterior;

let flowDepth = 0;
let chain = Promise.resolve();
function runFlow(fn) {
  flowDepth++;
  chain = chain.then(fn).catch((e) => console.error(e)).finally(() => { flowDepth--; });
  return chain;
}
const busy = () => flowDepth > 0 || ui.anyOpen();
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

function addSaber(n) {
  state.saber += n;
  ui.setSaber(state.saber);
}
function record(ok, criterio) {
  if (ui.silencio) return; // poniéndose al día: no cuenta
  if (ok) { state.aciertos++; addSaber(10); } else state.fallos++;
  if (criterio) {
    const c = (state.criterios[criterio] ??= { a: 0, f: 0 });
    if (ok) c.a++; else c.f++;
  }
}

function refreshObjectives() {
  let items;
  if (zona === casa) {
    items = [{ text: 'Investiga el brillo sobre la mesa', done: state.casa.cristal }];
    if (state.casa.cristal) items.push({ text: 'Decide: el portal (volver a casa) o la puerta (rescatar a Aldric)', done: state.casa.decidido });
  } else if (zona === exterior) {
    items = [
      { text: 'Sigue el camino hasta la torre', done: state.comentados.has('torre') },
      { text: 'Cruza el arco que hay al pie de la torre', done: false },
    ];
  } else if (zona.objetivos) {
    items = zona.objetivos();
  } else {
    const s = state.seals;
    items = [
      { text: 'Responde al cartel del guardián', done: s.cartel },
      { text: 'Ofrece la contraseña correcta en el altar', done: s.altar },
      { text: `Destruye los pergaminos de phishing (${fraudTotal - fraudLeft}/${fraudTotal})`, done: s.pergaminos },
    ];
    if (state.doorOpen) items.push({ text: 'Cruza la puerta del norte', done: false });
  }
  ui.setObjectives(items, textoPista());
  return items;
}
// sello roto: aviso con lo que toca después (la misión "Ahora" ya actualizada)
function anunciarSello(n, total) {
  const items = refreshObjectives();
  const siguiente = n < total ? items.find((o) => !o.done)?.text : 'La puerta se está abriendo…';
  ui.anunciarSello(n, total, siguiente);
}
// al llegar a un piso, un plano desde lo alto de la sala (para orientarse)
async function presentarSala() {
  if (ui.silencio || !zona.entrada) return;
  const e = zona.entrada.pos;
  await cine.mostrar(new THREE.Vector3(e.x + 6, 9, e.z + 4), new THREE.Vector3(e.x, 1, e.z - 16), 2.6);
}
// al abrirse la puerta de un piso, la cámara la enseña un momento (sabéis a dónde ir)
async function mostrarSalida() {
  if (ui.silencio || !zona.salida) return;
  const x = zona.entrada.pos.x, z = zona.salida.z;
  await cine.mostrar(new THREE.Vector3(x + 3.5, 4.2, z + 11), new THREE.Vector3(x, 1.8, z + 1.5), 2.8);
}

// ---------- Cambiar de zona (con fundido a negro) ----------
function aplicarZona(z) {
  zona = z;
  for (const o of Object.values(zonas)) o.grupo.visible = o === z;
  scene.fog.color.setHex(z.niebla.color);
  scene.fog.density = z.niebla.densidad;
  scene.background.setHex(z.niebla.color);
  camera.far = z.lejos ?? 120;
  camera.updateProjectionMatrix();
  moon.intensity = z.luz.luna;
  hemi.intensity = z.luz.cielo;
  cam.dist = z.camDist;
  sonido.ambientar(z.musica);
  ui.setZona(z.nombre);
  refreshObjectives();
}
function colocarEn(z) {
  player.pos.copy(z.entrada.pos);
  if (red.activa) player.pos.x += [0, -1.4, 1.4, -2.8, 2.8][red.miColor] ?? 0;
  player.vel.set(0, 0, 0);
  player.facing = z.entrada.mirada;
  cam.yaw = z.entrada.yaw;
  cam.target.set(player.pos.x, player.pos.y + 1.5, player.pos.z);
  aldric.group.position.set(player.pos.x - 1.4, 0, player.pos.z - 0.6);
}
// titulo: si se pasa, se muestra el rótulo del capítulo (el nombre del piso) en negro
async function irA(id, titulo = null) {
  await ui.fundido(true);
  if (titulo) await cine.titulo(titulo);
  aplicarZona(zonas[id]);
  colocarEn(zonas[id]);
  await esperar(250);
  await ui.fundido(false);
}

// ---------- Casa de Aldric ----------
async function activarCristal() {
  state.casa.cristal = true;
  casa.cristal.activo = true;
  sonido.teletransporte();
  fx.big.emit(casa.cristal.mesh.getWorldPosition(new THREE.Vector3()), { count: 60, color: 0x7fe0ff, intensity: 2, speed: 2.5, life: 1.2 });
  aldric.group.visible = true;
  aldric.group.position.copy(casa.cristal.pos).add(new THREE.Vector3(-1.6, 0, 1.4));
  await esperar(600);
  await ui.dialogue(CASA.mensaje);
  refreshObjectives();
  ui.toast('**Portal** (pared este) → volver a casa · **Puerta** (sur) → rescatar a Aldric', 'info', 6500);
}

async function elegirPortal() {
  sonido.teletransporte();
  await ui.story(PROLOGO.finalCasa, [{ id: 'otra', texto: 'Volver atrás y decidir otra vez' }]);
  ui.hideScreen('screen-story');
}

async function elegirPuerta() {
  state.casa.decidido = true;
  refreshObjectives();
  await ui.dialogue(CASA.aceptar);
  state.varita = true;
  player.mostrarVarita(true);
  sonido.acierto();
  ui.toast('Has conseguido la **varita** de Aldric (F)', 'learn', 4200);
  state.casa.abriendo = true;
  sonido.puerta();
  await esperar(1300);
  sonido.teletransporte();
  await ui.fundido(true);
  aplicarZona(exterior);
  colocarEn(exterior);
  // la primera vista de la torre (cinemática corta, se puede saltar)
  player.group.visible = false;
  await cine.vistaTorre(exterior.lugares, player.pos);
  player.group.visible = true;
  updateCamera(1);
  await ui.fundido(false);
  await ui.dialogue(EXTERIOR.llegada);
}

// ---------- Exterior ----------
async function entrarTorre() {
  sonido.teletransporte();
  await irA('piso1', PISO1.nombre);
  state.startedAt = performance.now();
  asegurarPiso('piso2').catch(() => {}); // se va preparando mientras se juega el Piso I
  await ui.dialogue(PISO1.intro);
  ui.toast('**G** grimorio · **H** pedir pista a Aldric', 'info', 5000);
}

// ---------- Pisos con carga diferida ----------
function contextoPiso() {
  return {
    escena: scene, fx, paletas, sonido, ui, red, companeros, estado: state,
    jugador: player, camara: camera,
    runFlow, esperar, accion, record, addSaber,
    refrescarObjetivos: refreshObjectives,
    celebrar: () => { player.celebrar(); aldric.celebrar(); },
    // una pregunta de repaso de lo aprendido (para desterrar guardianes); null si aún no hay nada
    preguntaRepaso: () => (BANCO.some((q) => state.learned.has(q.concepto)) ? pickQuestion() : null),
    golpe: () => player.golpe(),
    sacudir: (s) => { state.shake = Math.max(state.shake, s); },
    anunciarSello,
    mostrarSalida,
    mostrar: (desde, mirar, seg) => (ui.silencio ? Promise.resolve() : cine.mostrar(desde, mirar, seg)),
  };
}
function asegurarPiso(id) {
  if (pisos[id]) return Promise.resolve(pisos[id]);
  construyendo[id] ??= (async () => {
    const mod = await PISOS[id]();
    const piso = await mod.construir(contextoPiso());
    await ponerGuardianes(id, piso, mod.ORIGEN);
    pisos[id] = piso;
    zonas[id] = piso.zona;
    piso.zona.grupo.visible = zona === piso.zona;
    interactables.push(...piso.interactuables);
    // acciones que llegaron mientras se construía
    for (let i = 0; i < pendientes.length; i++) {
      if (pendientes[i].d.piso !== id) continue;
      const { d, soyAutor } = pendientes.splice(i--, 1)[0];
      piso.aplicar(d, soyAutor);
    }
    return piso;
  })();
  construyendo[id].catch(() => { delete construyendo[id]; }); // si falla, se puede reintentar
  return construyendo[id];
}
// Guardianes de los pisos II a VII (el VIII tiene sus propias criaturas): dan variedad
// y un repaso opcional. Si no cargan, el piso funciona igual sin ellos.
async function ponerGuardianes(id, piso, origen) {
  const lista = GUARDIANES[id];
  if (!lista || piso.zona.dianas || !origen) return;
  try {
    const g = await crearGuardianes(contextoPiso(), { pisoId: id, origen, lista, grupoVisible: () => piso.zona.grupo.visible });
    guardianes[id] = g;
    const actualizar = piso.zona.actualizar;
    Object.assign(piso.zona, {
      dianas: g.dianas, alApuntar: g.alApuntar, alGolpear: g.alGolpear,
      actualizar: (dt, t) => { actualizar(dt, t); g.actualizar(dt, t); },
    });
  } catch (e) {
    console.warn(`No se pudieron cargar los guardianes de ${id}.`, e);
  }
}

async function subirAPiso(id) {
  guardarProgreso(zona.id);
  ui.toast('Subiendo por la escalera…', 'info', 2400);
  let piso;
  try {
    piso = await asegurarPiso(id);
  } catch (e) {
    console.error(e);
    ui.toast('No se pudo cargar el siguiente piso. Revisa la conexión y recarga la página.', 'bad', 8000);
    return;
  }
  sonido.teletransporte();
  await irA(id, zonas[id].nombre);
  const otro = siguientePiso(id);
  if (otro && PISOS[otro]) asegurarPiso(otro).catch(() => {}); // se va preparando el siguiente
  await presentarSala();
  await piso.intro();
  refreshObjectives();
}

// ---------- Enseñar ----------
async function teach(id) {
  const lesson = LECCIONES[id];
  await ui.dialogue(lesson.paginas);
  if (!state.learned.has(id)) {
    state.learned.add(id);
    ui.toast(`Nuevo concepto en el grimorio: **${lesson.titulo}** (G)`, 'learn', 4200);
  }
  if (lesson.despues) await ui.dialogue(lesson.despues);
}

const RUNE = { cartel: 0, altar: 1, pergaminos: 2 };
async function breakSeal(key) {
  state.seals[key] = true;
  world.lightRune(RUNE[key]);
  sonido.sello();
  addSaber(25);
  state.shake = 0.35;
  player.celebrar();
  aldric.celebrar();
  const n = Object.values(state.seals).filter(Boolean).length;
  anunciarSello(n, 3);
  if (n === 3) {
    await ui.dialogue(PISO1.sellosRotos);
    world.openDoor();
    sonido.puerta();
    state.doorOpen = true;
    state.shake = 0.8;
    refreshObjectives();
    await mostrarSalida();
  }
}

// ---------- Desafío 1: cartel ----------
async function challengeCartel() {
  if (!state.learned.has('2fa')) {
    accion('leccion', { id: '2fa', luego: 'cartel' });
    return;
  }
  await cartelPregunta();
}
async function cartelPregunta() {
  const ok = await ui.quiz(PISO1.cartel, 'El cartel del guardián');
  record(ok, '3.3');
  if (ok) {
    accion('sello', { clave: 'cartel' });
  } else {
    await ui.dialogue(['No pasa nada, equivocarse también enseña. Recordad: **algo que sabes + algo que tienes**. Volved a leer el cartel cuando queráis.']);
  }
}

// ---------- Desafío 2: altar ----------
async function examineAltar() {
  accion('leccion', { id: 'contrasenas' });
}
async function offerCrystal(c) {
  accion('altar', { i: world.crystals.indexOf(c) });
}
async function efectoAltar(c, soyAutor) {
  if (c.ok) {
    if (soyAutor) record(true, '3.1');
    sonido.acierto();
    c.done = true;
    world.flashCrystal(c, true);
    for (const other of world.crystals) other.label.visible = other === c;
    await ui.dialogue([`¡Eso es! «${c.texto}»: ${c.porque}`]);
    await breakSeal('altar');
  } else {
    if (soyAutor) record(false, '3.1');
    sonido.cristalRoto();
    world.flashCrystal(c, false);
    state.shake = 0.4;
    player.golpe();
    await ui.dialogue([`¡Cuidado! «${c.texto}» no aguantaría ni un hechizo de aprendiz. ${c.porque}`, 'Probad con otro cristal.']);
  }
}

// ---------- Desafío 3: pergaminos (con la varita) ----------
function hitScroll(s, soyAutor) {
  if (!s?.alive) return;
  if (s.data.fraude) {
    world.destroyScroll(s, true);
    fraudLeft--;
    addSaber(5);
    ui.toast(`🔥 Phishing destruido. ${s.data.motivo}`, 'good', 5200);
    refreshObjectives();
    if (fraudLeft === 0) {
      for (const o of world.scrolls) if (o.alive) o.released = true;
      runFlow(async () => {
        await ui.dialogue(['¡Todos los mensajes falsos han ardido! Los legítimos pueden seguir su camino.']);
        await breakSeal('pergaminos');
      });
    }
  } else {
    if (soyAutor) state.fallos++;
    state.shake = 0.3;
    sonido.fallo();
    fx.big.emit(s.group.position, { count: 35, color: 0xffd27a, intensity: 1.2, speed: 3, life: 0.8 });
    runFlow(() => ui.dialogue([`¡Alto! Ese mensaje era **legítimo**: ${s.data.motivo}`, 'Un escudo lo ha protegido. Leed bien antes de disparar.']));
  }
}

// ---------- La varita ----------
// Pregunta al azar entre lo aprendido (de cualquier piso). Repaso espaciado sencillo:
// las falladas salen el triple y las acertadas dos veces seguidas, la mitad.
function pickQuestion() {
  const pool = BANCO.filter((q) => state.learned.has(q.concepto));
  const fresh = pool.filter((q) => !state.recent.includes(q.id));
  const list = fresh.length ? fresh : pool;
  const peso = (q) => {
    const h = state.historial[q.id];
    return !h ? 1 : h.fallada ? 3 : h.seguidas >= 2 ? 0.5 : 1;
  };
  let r = Math.random() * list.reduce((s, q) => s + peso(q), 0);
  const q = list.find((x) => (r -= peso(x)) <= 0) ?? list[list.length - 1];
  state.recent.push(q.id);
  if (state.recent.length > Math.min(5, pool.length - 1)) state.recent.shift();
  return q;
}
function anotarPregunta(q, ok) {
  const h = (state.historial[q.id] ??= { fallada: false, seguidas: 0 });
  h.fallada = !ok;
  h.seguidas = ok ? h.seguidas + 1 : 0;
}

const camFwd = new THREE.Vector3();
async function useWand() {
  if (!state.varita) {
    ui.toast('Todavía no tienes ninguna varita.', 'bad', 2400);
    return;
  }
  if (state.wandCooldown > 0) return;
  if (state.learned.size === 0) {
    await ui.dialogue(['La varita solo responde a quien ha aprendido algo. En la torre os enseñaré lo que necesitáis.']);
    return;
  }
  const target = state.target;
  // en los pisos con dianas propias (las criaturas del Piso VIII), el piso decide qué pasa
  if (target && zona.alApuntar) {
    player.castAnim();
    await zona.alApuntar(target);
    state.wandCooldown = 1.2;
    return;
  }
  const q = pickQuestion();
  const ok = await ui.quiz(q, `La varita exige un concepto · ${LECCIONES[q.concepto].titulo}`);
  record(ok, q.criterio);
  anotarPregunta(q, ok);
  const tip = player.wandTip(new THREE.Vector3());
  player.castAnim();
  if (ok) {
    const k = Math.floor(Math.random() * SPELLS.length);
    const spell = SPELLS[k];
    sonido.lanzar(spell.hex);
    ui.toast(`✦ ${spell.nombre}`, 'spell', 2200);
    camFwd.set(-Math.sin(cam.yaw), 0, -Math.cos(cam.yaw));
    const fallback = player.pos.clone().addScaledVector(camFwd, 14).setY(player.pos.y + 1.4);
    const aim = target && target.alive ? () => target.group.position : null;
    const idx = aim ? world.scrolls.indexOf(target) : null;
    red.enviar({ t: 'hechizo', k, de: tip.toArray(), a: idx, d: fallback.toArray() });
    spells.cast(spell, tip, aim, fallback, () => {
      sonido.impacto();
      if (aim) accion('pergamino', { i: idx });
    });
    state.wandCooldown = 1.2;
  } else {
    spells.fizzle(tip);
    sonido.chisporroteo();
    ui.toast('La varita chisporrotea y se apaga…', 'bad', 2400);
    state.wandCooldown = 2.5;
  }
}

function pickTarget() {
  // cada piso puede ofrecer sus dianas: { group: { position }, alive, data }
  const dianas = zona.dianas ? zona.dianas() : zona === world.zona && state.learned.has('phishing') ? world.scrolls : null;
  if (!dianas) return null;
  camFwd.set(-Math.sin(cam.yaw), 0, -Math.cos(cam.yaw));
  let best = null, bestScore = Infinity;
  for (const s of dianas) {
    if (!s.alive || s.released) continue;
    const dx = s.group.position.x - player.pos.x, dz = s.group.position.z - player.pos.z;
    const dist = Math.hypot(dx, dz);
    if (dist > 15) continue;
    const dot = (dx * camFwd.x + dz * camFwd.z) / (dist || 1);
    if (dot < 0.8) continue;
    // manda la puntería (lo que está en el centro de la cámara), no la cercanía
    const score = (1 - dot) * 20 + dist * 0.05;
    if (score < bestScore) { bestScore = score; best = s; }
  }
  return best;
}

// ---------- Acciones compartidas (solo o en equipo) ----------
// Todo lo que cambia la partida de todos pasa por aquí. Jugando solo se aplica
// al momento; en equipo lo valida el anfitrión y lo anuncia a todo el equipo.
function claveAccion(tipo, d) {
  if (tipo === 'leccion') return `leccion:${d.id}`;
  if (tipo === 'sello') return `sello:${d.clave}`;
  if (tipo === 'pergamino') return `pergamino:${d.i}`;
  if (tipo === 'comentario') return `comentario:${d.clave}`;
  if (tipo === 'altar') return world.crystals[d.i]?.ok ? 'altar' : null; // los cristales débiles se pueden probar varias veces
  if (tipo === 'mec') return pisos[d.piso]?.clave(d) ?? null;
  if (tipo === 'subir') return `subir:${d.piso}`;
  if (tipo === 'guardian') return `guardian:${d.piso}:${d.id}`;
  if (tipo === 'fin') return `fin:${d.piso ?? 'piso1'}`;
  return tipo;
}
function valido(tipo, d) {
  if (tipo === 'mec' && !pisos[d.piso]?.validar(d)) return false;
  if (tipo === 'guardian' && !guardianes[d.piso]?.vivo(d.id)) return false;
  if (tipo === 'altar' && (state.hecho.has('altar') || !world.crystals[d.i])) return false;
  if (tipo === 'pergamino' && !world.scrolls[d.i]?.alive) return false;
  const k = claveAccion(tipo, d);
  return !k || !state.hecho.has(k);
}
function accion(tipo, datos = {}) {
  if (red.activa && !red.esHost) {
    red.enviar({ t: 'acc', tipo, datos });
    return;
  }
  if (!valido(tipo, datos)) return;
  red.enviar({ t: 'ev', tipo, datos, autor: red.miId });
  aplicarEvento(tipo, datos, true);
}
function aplicarEvento(tipo, d, soyAutor) {
  if (entrandoTarde) { colaTarde.push({ tipo, d, soyAutor }); return; }
  if (red.activa) registro.push({ tipo, d }); // para quien entre a mitad de partida
  const k = claveAccion(tipo, d);
  if (k) state.hecho.add(k);
  switch (tipo) {
    case 'cristal': runFlow(activarCristal); break;
    case 'salir': state.casa.decidido = true; runFlow(elegirPuerta); break;
    case 'torre': runFlow(entrarTorre); break;
    case 'leccion':
      if (d.id === 'phishing') state.phishingTriggered = true;
      runFlow(async () => {
        await teach(d.id);
        if (soyAutor && !d.piso && d.luego === 'cartel') await cartelPregunta(); // el cartel del Piso I
        if (d.piso) await pisos[d.piso]?.alAprender?.(d.id, soyAutor, d.luego);
      });
      break;
    case 'mec':
      // en equipo puede llegar antes de que este jugador haya terminado de construir el piso
      if (pisos[d.piso]) pisos[d.piso].aplicar(d, soyAutor);
      else pendientes.push({ d, soyAutor });
      break;
    case 'subir': runFlow(() => subirAPiso(d.piso)); break;
    case 'irPiso': runFlow(() => irPorElMapa(d.piso)); break;
    case 'guardian': guardianes[d.piso]?.desterrar(d.id, soyAutor); break;
    case 'sello':
      runFlow(async () => {
        if (d.clave === 'cartel') {
          fx.big.emit(new THREE.Vector3(world.sign.pos.x, 2.4, world.sign.pos.z), { count: 60, color: 0x9fe6ff, intensity: 2, speed: 3, life: 1 });
          world.sign.mark.visible = false;
        }
        await breakSeal(d.clave);
      });
      break;
    case 'altar': runFlow(() => efectoAltar(world.crystals[d.i], soyAutor)); break;
    case 'pergamino': hitScroll(world.scrolls[d.i], soyAutor); break;
    case 'comentario':
      state.comentados.add(d.clave);
      refreshObjectives();
      runFlow(() => ui.dialogue(EXTERIOR.comentarios[d.clave]));
      break;
    case 'fin': runFlow(finish); break; // tras lo que tenga pendiente (p. ej. el duelo con Morvath)
  }
}

// ---------- Ataques con el arma (tecla R) ----------
// Cada personaje ataca a su manera (ver personajes.js y ataques.js). Solo afecta a
// las dianas de la zona (las criaturas del Piso VIII quedan aturdidas).
let enfriamientoArma = 0;
function atacar() {
  if (enfriamientoArma > 0) return;
  const at = ataqueDe(miPerfil.personaje);
  enfriamientoArma = at.enfriamiento;
  camFwd.set(-Math.sin(cam.yaw), 0, -Math.cos(cam.yaw));
  player.facing = Math.atan2(camFwd.x, camFwd.z); // se gira hacia donde mira la cámara
  player.atacar(at.anim);
  ataques.lanzar(at, player.pos, camFwd, zona.dianas?.() ?? [], (d) => zona.alGolpear?.(d, at.tipo));
  red.enviar({ t: 'ataque', p: miPerfil.personaje, zn: zona.id, x: +player.pos.x.toFixed(2), y: +player.pos.y.toFixed(2), z: +player.pos.z.toFixed(2), dx: +camFwd.x.toFixed(3), dz: +camFwd.z.toFixed(3) });
}
function verAtaque(m) {
  if (m.zn !== zona.id) return;
  const at = ataqueDe(m.p);
  ataques.lanzar(at, new THREE.Vector3(m.x, m.y, m.z), new THREE.Vector3(m.dx, 0, m.dz), zona.dianas?.() ?? [], (d) => zona.alGolpear?.(d, at.tipo));
}

// ---------- Red: mensajes, compañeros y sala ----------
function verHechizo(m) {
  const spell = SPELLS[m.k];
  if (!spell) return;
  const de = new THREE.Vector3().fromArray(m.de);
  const aim = m.a !== null && world.scrolls[m.a] ? () => world.scrolls[m.a].group.position : null;
  sonido.lanzar(spell.hex);
  spells.cast(spell, de, aim, new THREE.Vector3().fromArray(m.d), () => sonido.impacto());
}
red.alMensaje = (msg, de) => {
  if (msg.t === 'pos') companeros.get(msg.id)?.recibir(msg);
  else if (msg.t === 'chat') {
    chat.anadir(msg);
    companeros.get(msg.id)?.decir(msg.texto);
    sonido.mensaje();
  }
  else if (msg.t === 'hechizo') verHechizo(msg);
  else if (msg.t === 'ataque') verAtaque(msg);
  else if (msg.t === 'acc' && red.esHost) {
    if (!valido(msg.tipo, msg.datos)) return;
    red.enviar({ t: 'ev', tipo: msg.tipo, datos: msg.datos, autor: de });
    aplicarEvento(msg.tipo, msg.datos, false);
  } else if (msg.t === 'ev' && !red.esHost) aplicarEvento(msg.tipo, msg.datos, msg.autor === red.miId);
  else if (msg.t === 'empezar' && !red.esHost) empezarEquipo();
  else if (msg.t === 'snap' && !red.esHost) entrarTarde(msg);
};

// ---------- Entrar a mitad de partida (o volver tras caerse) ----------
// Se puede en los pisos II a VIII: el anfitrión manda el piso en el que está y
// las acciones aplicadas en él; el que llega las repite en silencio y se une.
const registro = [];          // acciones aplicadas, en orden
let entrandoTarde = false;
const colaTarde = [];         // acciones que llegan mientras se pone al día
red.motivoNoTarde = () => {
  if (state.phase === 'end') return 'La partida ya ha terminado.';
  if (!PISOS[zona.id]) return 'La partida ya ha empezado. Se puede entrar a mitad desde el Piso II.';
  return null;
};
red.alEntrarTarde = (id) => {
  const eventos = registro.filter((e) => e.d?.piso === zona.id && !['subir', 'fin', 'irPiso'].includes(e.tipo));
  red.enviarA(id, { t: 'snap', piso: zona.id, eventos, hecho: [...state.hecho] });
};
async function entrarTarde(snap) {
  if (entrandoTarde || state.phase === 'play') return;
  entrandoTarde = true;
  ui.hideScreen('screen-sala');
  salirDeLaSala();
  document.getElementById('loading').classList.remove('hidden');
  let piso;
  try {
    piso = await asegurarPiso(snap.piso);
  } catch (e) {
    console.error(e);
    location.reload();
    return;
  }
  state.varita = true;
  player.mostrarVarita(true);
  aldric.group.visible = true;
  state.startedAt = performance.now();
  aplicarZona(piso.zona);
  colocarEn(piso.zona);
  // ponerse al día: las acciones del piso, sin diálogos ni avisos
  ui.silencio = true;
  entrandoTarde = false;
  for (const e of snap.eventos) aplicarEvento(e.tipo, e.d, false);
  while (colaTarde.length) { const e = colaTarde.shift(); aplicarEvento(e.tipo, e.d, e.soyAutor); }
  // quien se fue llevando algo (un orbe, una obra) lo soltó: se repite aquí también
  const presentes = new Set(red.jugadores.map((j) => j.id));
  for (const q of new Set(snap.eventos.map((e) => e.d?.quien).filter(Boolean))) if (!presentes.has(q)) piso.jugadorFuera?.(q);
  // espera a que terminen las secuencias (algunas encadenan otras)
  for (let i = 0; i < 60 && (i < 2 || flowDepth > 0); i++) { await runFlow(() => {}); await esperar(100); }
  ui.silencio = false;
  for (const k of snap.hecho) state.hecho.add(k);
  document.getElementById('loading').classList.add('hidden');
  state.phase = 'play';
  document.getElementById('hud').classList.remove('hidden');
  ui.setSaber(state.saber);
  refreshObjectives();
  await runFlow(async () => {
    await piso.intro();
    await ui.dialogue(['Te has unido a mitad del piso: lo que tu equipo ya ha resuelto sigue resuelto. Mira los **objetivos** y busca a tus compañeros.']);
  });
}
// crea (o rehace, si cambió de personaje o de etiqueta) el compañero de un jugador
const creando = new Map();
async function asegurarCompanero(j) {
  const clave = claveCompanero(j);
  if (companeros.get(j.id)?.clave === clave || creando.get(j.id) === clave) return;
  creando.set(j.id, clave);
  let plantilla = null;
  try { plantilla = await cargarPersonaje(j.personaje); } catch { /* se verá como una silueta */ }
  if (creando.get(j.id) !== clave) return; // volvió a cambiar mientras cargaba
  creando.delete(j.id);
  if (!red.jugadores.some((x) => x.id === j.id)) return;
  const nuevo = new Companero(scene, j, plantilla);
  const viejo = companeros.get(j.id);
  if (viejo) { nuevo.heredar(viejo); viejo.quitar(); }
  companeros.set(j.id, nuevo);
}
let conocidos = new Set();
red.alCambiarSala = (jugadores) => {
  chat.mostrar(red.activa);
  for (const j of jugadores) {
    if (conocidos.size && !conocidos.has(j.id) && j.id !== red.miId) chat.anadir({ sistema: `${j.nombre} se ha unido.` });
  }
  for (const id of conocidos) {
    const antes = companeros.get(id);
    if (!jugadores.some((j) => j.id === id) && antes) chat.anadir({ sistema: `${antes.info.nombre} ha salido.` });
  }
  conocidos = new Set(jugadores.map((j) => j.id));
  for (const j of jugadores) if (j.id !== red.miId) asegurarCompanero(j);
  for (const [id, c] of companeros) {
    if (jugadores.some((j) => j.id === id)) continue;
    c.quitar();
    companeros.delete(id);
    for (const piso of Object.values(pisos)) piso.jugadorFuera?.(id);
    if (state.phase === 'play') ui.toast(`${c.info.nombre} ha salido de la partida.`, 'bad', 4000);
  }
  player.tenir(TINTES[red.miColor]);
  pintarSala(jugadores);
  vistaPrevia();
  const eq = $('equipo');
  eq.classList.toggle('hidden', jugadores.length < 2);
  eq.innerHTML = 'Equipo: ' + jugadores.map((j) => `<span class="punto c${j.color}"></span>${escaparHtml(j.nombre)}`).join(' · ');
};
red.alCaer = (id, quien) => {
  if (id === 'anfitrion') {
    chat.mostrar(false);
    conocidos = new Set();
    for (const c of companeros.values()) c.quitar();
    companeros.clear();
    $('equipo').classList.add('hidden');
    if (state.phase === 'play') ui.toast('Se ha perdido la conexión con el anfitrión. Sigues jugando en solitario.', 'bad', 6000);
    else {
      reiniciarSala();
      mostrarErrorSala('Se ha perdido la conexión con el anfitrión.');
    }
    return;
  }
};

function escaparHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function $(id) { return document.getElementById(id); }
function mostrarErrorSala(texto) { $('sala-error').textContent = texto || ''; }
function nombreJugador() {
  const n = $('sala-nombre').value.trim().slice(0, 16);
  if (!n) { mostrarErrorSala('Escribe tu nombre para que el equipo te reconozca.'); return null; }
  try { localStorage.setItem('torreMorvathNombre', n); } catch { /* sin almacenamiento local */ }
  return n;
}
function pintarSala(jugadores) {
  const pj = (id) => PERSONAJES.find((p) => p.id === id)?.nombre ?? PERSONAJES[0].nombre;
  $('sala-lista').innerHTML = jugadores.map((j) => `<li><span class="punto c${j.color}"></span>${escaparHtml(j.nombre)}${j.id === red.miId ? ' <em>(tú)</em>' : ''}${j.color === 0 ? ' <em>· anfitrión</em>' : ''}<span class="sala-pj">${escaparHtml(pj(j.personaje))}${j.etiqueta ? ` · «${escaparHtml(j.etiqueta)}»` : ''}</span></li>`).join('');
  const n = jugadores.length;
  if (red.esHost) {
    $('sala-estado').textContent = n < 2
      ? `Esperando compañeros… (${n}/${MAX_JUGADORES}). Hacen falta al menos 2 para empezar.`
      : n < MAX_JUGADORES
        ? `¡Listos! (${n}/${MAX_JUGADORES}). Puedes empezar ya o esperar a un tercero.`
        : `¡Sala completa! (${n}/${MAX_JUGADORES}). Ya podéis empezar.`;
    $('btn-empezar-equipo').disabled = n < 2;
    $('btn-empezar-equipo').classList.remove('hidden');
  } else {
    $('sala-estado').textContent = `Esperando a que el anfitrión empiece… (${n}/${MAX_JUGADORES})`;
    $('btn-empezar-equipo').classList.add('hidden');
  }
}
function mostrarEspera() {
  $('sala-opciones').classList.add('hidden');
  $('sala-nombre').parentElement.classList.add('hidden');
  $('sala-espera').classList.remove('hidden');
  $('sala-codigo-ver').textContent = red.codigo;
  mostrarErrorSala('');
}
async function conBoton(boton, texto, fn) {
  const antes = boton.textContent;
  boton.disabled = true;
  boton.textContent = texto;
  try {
    await fn();
  } catch (e) {
    mostrarErrorSala(e.message);
    red.cerrar();
  } finally {
    boton.disabled = false;
    boton.textContent = antes;
  }
}
function empezarEquipo() {
  ui.hideScreen('screen-sala');
  salirDeLaSala();
  startStory();
}

// ---------- Elegir personaje y etiqueta (sala de equipo) ----------
// En la sala la cámara se pone delante del personaje y la imagen se desplaza a
// la izquierda para que se vea junto al panel.
let encuadreSala = false;
const focoSala = new THREE.PointLight(0xffd9a8, 0, 9, 1.5); // ilumina al personaje en la sala
scene.add(focoSala);
function encuadre() {
  if (encuadreSala && innerWidth > 900) camera.setViewOffset(innerWidth, innerHeight, innerWidth * 0.22, 0, innerWidth, innerHeight);
  else camera.clearViewOffset();
}
addEventListener('resize', encuadre);
function entrarEnLaSala() {
  state.phase = 'sala';
  encuadreSala = true;
  encuadre();
  cam.yaw = player.facing;
  cam.pitch = 0.08;
  cam.dist = 3.6;
  focoSala.position.set(player.pos.x - Math.sin(player.facing) * -2.2 + 1.2, 2.6, player.pos.z - Math.cos(player.facing) * -2.2);
  focoSala.intensity = 14;
  vistaPrevia();
}
function salirDeLaSala() {
  encuadreSala = false;
  encuadre();
  focoSala.intensity = 0;
  player.ponerEtiqueta(null);
  cam.dist = zona.camDist;
  cam.pitch = 0.2;
}
function vistaPrevia() {
  const p = PERSONAJES.find((x) => x.id === miPerfil.personaje);
  $('pj-nombre').textContent = p.nombre;
  $('pj-desc').textContent = p.desc;
  $('pj-num').textContent = `${PERSONAJES.indexOf(p) + 1} / ${PERSONAJES.length}`;
  if (state.phase === 'sala') player.ponerEtiqueta(crearEtiqueta($('sala-nombre').value.trim() || 'Tú', miPerfil.etiqueta, red.activa ? red.miColor : 0));
}
let pedidoPj = 0;
async function elegirPersonaje(paso) {
  const i = PERSONAJES.findIndex((p) => p.id === miPerfil.personaje);
  miPerfil.personaje = PERSONAJES[(i + paso + PERSONAJES.length) % PERSONAJES.length].id;
  guardar('torreMorvathPersonaje', miPerfil.personaje);
  sonido.clic();
  vistaPrevia();
  const pedido = ++pedidoPj;
  try {
    const pl = await cargarPersonaje(miPerfil.personaje);
    if (pedido !== pedidoPj) return; // ya ha elegido otro
    player.usarModelo(instanciar(pl), pl.clips);
    player.tenir(TINTES[red.activa ? red.miColor : 0]);
    player.celebrar();
  } catch {
    mostrarErrorSala('No se pudo cargar ese personaje.');
  }
  red.actualizarPerfil(miPerfil);
}
$('pj-ant').onclick = () => elegirPersonaje(-1);
$('pj-sig').onclick = () => elegirPersonaje(1);
let reloj = 0;
$('sala-etiqueta').oninput = () => {
  clearTimeout(reloj);
  reloj = setTimeout(() => {
    miPerfil.etiqueta = $('sala-etiqueta').value.trim().slice(0, 32);
    guardar('torreMorvathEtiqueta', miPerfil.etiqueta);
    vistaPrevia();
    red.actualizarPerfil(miPerfil);
  }, 350);
};
$('sala-nombre').oninput = () => vistaPrevia();

$('btn-equipo').onclick = () => {
  sonido.iniciar();
  sonido.clic();
  $('sala-nombre').value = leer('torreMorvathNombre');
  $('sala-etiqueta').value = miPerfil.etiqueta;
  ui.hideScreen('screen-title');
  ui.showScreen('screen-sala');
  entrarEnLaSala();
};
$('btn-crear').onclick = () => {
  const nombre = nombreJugador();
  if (nombre) conBoton($('btn-crear'), 'Creando…', async () => { await red.crearSala(nombre, miPerfil); mostrarEspera(); });
};
$('btn-unirse').onclick = () => {
  const nombre = nombreJugador();
  const codigo = $('sala-codigo').value.trim().toUpperCase();
  if (!nombre) return;
  if (codigo.length !== 4) { mostrarErrorSala('El código tiene 4 letras.'); return; }
  conBoton($('btn-unirse'), 'Conectando…', async () => { await red.unirse(codigo, nombre, miPerfil); mostrarEspera(); });
};
$('btn-empezar-equipo').onclick = () => {
  if (!red.esHost || red.jugadores.length < 2) return;
  red.empezada = true;
  red.enviar({ t: 'empezar' });
  empezarEquipo();
};
function reiniciarSala() {
  red.cerrar();
  chat.mostrar(false);
  chat.vaciar();
  conocidos = new Set();
  for (const c of companeros.values()) c.quitar();
  companeros.clear();
  red.esHost = false;
  red.codigo = null;
  red.jugadores = [];
  $('sala-opciones').classList.remove('hidden');
  $('sala-nombre').parentElement.classList.remove('hidden');
  $('sala-espera').classList.add('hidden');
  mostrarErrorSala('');
}
$('btn-sala-volver').onclick = () => {
  reiniciarSala();
  salirDeLaSala();
  state.phase = 'title';
  ui.hideScreen('screen-sala');
  ui.showScreen('screen-title');
};

// ---------- Pistas y grimorio ----------
// Qué hacer ahora, en palabras (la misma pista de Aldric con H)
function textoPista() {
  if (zona === casa) return !state.casa.cristal ? CASA.pistas.cristal : CASA.pistas.decidir;
  if (zona === exterior) return player.pos.distanceTo(exterior.lugares.arco) < 22 ? EXTERIOR.pistas.arco : EXTERIOR.pistas.camino;
  if (zona.pista) return zona.pista();
  if (zona !== world.zona) return '';
  const s = state.seals;
  return PISO1.pistas[!s.cartel ? 'cartel' : !s.altar ? 'altar' : !s.pergaminos ? 'pergaminos' : 'puerta'];
}
async function hint() {
  await ui.dialogue([textoPista()]);
}
// A dónde apunta la guía de la misión (un punto del mundo) o null
const puntoSalida = new THREE.Vector3();
function destinoActual() {
  let d = null;
  if (zona === casa) d = !state.casa.cristal ? casa.cristal.pos : !state.casa.decidido ? casa.puerta.pos : null;
  else if (zona === exterior) d = exterior.lugares.arco;
  else if (zona.destino) d = zona.destino();
  else if (zona === world.zona) {
    const s = state.seals;
    if (!s.cartel) d = world.sign.pos;
    else if (!s.altar) d = world.altar.center;
    else if (!s.pergaminos) d = world.scrolls.find((x) => x.alive && x.data.fraude)?.group.position ?? null;
    else d = 'salida';
  }
  if (d === 'salida') {
    if (!zona.salida?.abierta()) return null;
    return puntoSalida.set(zona.entrada.pos.x, 0, zona.salida.z + 1.5);
  }
  return d;
}
const grimEntries = () => [...state.learned].map((id) => LECCIONES[id]);

// ---------- Interactuables (cada uno pertenece a una zona) ----------
const interactables = [
  {
    zona: casa, pos: casa.cristal.pos, r: 2.8,
    enabled: () => !state.casa.cristal,
    prompt: () => '**E** · Tocar el cristal azul',
    action: () => accion('cristal'),
  },
  {
    zona: casa, pos: casa.portal.pos, r: 2.0,
    enabled: () => state.casa.cristal && !state.casa.decidido,
    prompt: () => '**E** · Cruzar el portal y **volver a casa**',
    action: elegirPortal,
  },
  {
    zona: casa, pos: casa.puerta.pos, r: 2.0,
    enabled: () => state.casa.cristal && !state.casa.decidido,
    prompt: () => '**E** · Salir por la puerta y **rescatar a Aldric**',
    action: () => accion('salir'),
  },
  {
    zona: casa, pos: casa.mapa.pos, r: 1.9,
    enabled: () => state.casa.cristal && !state.casa.decidido && mapaPisos.length > 0,
    prompt: () => '**E** · Consultar el **mapa de la torre** (ir a un piso ya desbloqueado)',
    action: elegirEnMapa,
  },
  {
    zona: exterior, pos: exterior.portal.pos, r: 3.2,
    enabled: () => true,
    prompt: () => '**E** · Cruzar el arco y **entrar en la torre**',
    action: () => accion('torre'),
  },
  {
    zona: world.zona, pos: world.sign.pos, r: 2.9,
    enabled: () => !state.seals.cartel,
    prompt: () => '**E** · Leer el cartel del guardián',
    action: challengeCartel,
  },
  {
    zona: world.zona, pos: world.altar.center, r: 4.4,
    enabled: () => !state.seals.altar && !state.learned.has('contrasenas'),
    prompt: () => '**E** · Examinar el altar de los cristales',
    action: examineAltar,
  },
  ...world.crystals.map((c) => ({
    zona: world.zona, pos: c.pos, r: 1.6, crystal: c,
    enabled: () => !state.seals.altar && state.learned.has('contrasenas'),
    prompt: () => `**E** · Ofrecer «${c.texto}» al altar`,
    action: () => offerCrystal(c),
  })),
];

function nearestInteractable() {
  let best = null, bestD = Infinity;
  for (const it of interactables) {
    if (it.zona !== zona || !it.enabled()) continue;
    const d = Math.hypot(player.pos.x - it.pos.x, player.pos.z - it.pos.z);
    if (d < it.r && d < bestD) { bestD = d; best = it; }
  }
  return best;
}

// ---------- Entrada ----------
const keys = {};
addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return; // escribiendo en un campo
  if (['Space', 'ArrowUp', 'ArrowDown', 'Tab'].includes(e.code)) e.preventDefault();
  sonido.iniciar();
  if (cine.tecla(e)) { e.preventDefault(); return; }
  if (ui.handleKey(e)) return;
  if (red.activa && !e.repeat && (e.code === 'KeyT' || (e.code === 'Enter' && state.phase === 'play'))) {
    e.preventDefault();
    for (const k in keys) keys[k] = false; // que el personaje no siga andando solo
    chat.abrir();
    return;
  }
  keys[e.code] = true;
  if (e.code === 'KeyO' && !e.repeat && !busy() && state.phase !== 'sala') {
    for (const k in keys) keys[k] = false;
    abrirOpciones(ui, opciones, aplicarOpciones);
    return;
  }
  if (e.code === 'KeyM' && !e.repeat) {
    ui.toast(sonido.alternarSilencio() ? 'Sonido desactivado (M)' : 'Sonido activado (M)', 'info', 1800);
    return;
  }
  if (e.repeat || state.phase !== 'play' || busy()) return;
  if (e.code === 'KeyE' && state.interact) runFlow(state.interact.action);
  else if (e.code === 'KeyF') runFlow(useWand);
  else if (e.code === 'KeyR') atacar();
  else if (e.code === 'KeyH') runFlow(hint);
  else if (e.code === 'KeyG') ui.openGrimoire(grimEntries());
});
addEventListener('keyup', (e) => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

const cam = { yaw: 0, pitch: 0.36, dist: 6.5, target: new THREE.Vector3(0, 1.5, 14) };
let dragging = null, lastX = 0, lastY = 0; // dragging = el dedo o puntero que arrastra
canvas.addEventListener('pointerdown', (e) => { if (dragging !== null) return; dragging = e.pointerId; lastX = e.clientX; lastY = e.clientY; try { canvas.setPointerCapture(e.pointerId); } catch { /* puntero ya soltado */ } });
const soltarCamara = (e) => { if (e.pointerId === dragging) dragging = null; };
canvas.addEventListener('pointerup', soltarCamara);
canvas.addEventListener('pointercancel', soltarCamara);
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerId !== dragging || state.phase !== 'play') return;
  cam.yaw -= (e.clientX - lastX) * 0.006 * opciones.sensibilidad;
  cam.pitch = Math.max(0.05, Math.min(1.15, cam.pitch + (e.clientY - lastY) * 0.004 * opciones.sensibilidad * (opciones.invertirY ? -1 : 1)));
  lastX = e.clientX;
  lastY = e.clientY;
});
canvas.addEventListener('wheel', (e) => { cam.dist = Math.max(3.2, Math.min(10, cam.dist + e.deltaY * 0.004)); }, { passive: true });

// tabletas: joystick y botones en pantalla (solo con pantalla táctil)
const tactil = esTactil() ? crearTactil() : null;
let tactilVisible = null;

// ---------- Etiquetas flotantes: se desvanecen si la cámara las tiene encima ----------
// (si no, un rótulo como «Tarjeta SD» llena la pantalla al pasar a su lado)
let relojEtiquetas = 0;
function atenuarEtiquetas(dt) {
  relojEtiquetas -= dt;
  if (relojEtiquetas > 0 || !zona.grupo) return;
  relojEtiquetas = 0.12;
  if (!zona.etiquetas) {
    zona.etiquetas = [];
    zona.grupo.traverse((o) => { if (o.isSprite && o.material.map && o.material.transparent) zona.etiquetas.push({ s: o, base: o.material.opacity }); });
  }
  const pos = new THREE.Vector3();
  for (const e of zona.etiquetas) {
    const d = camera.position.distanceTo(e.s.getWorldPosition(pos));
    e.s.material.opacity = e.base * Math.min(1, Math.max(0, (d - 1.6) / 2.2));
  }
}

// ---------- Guía de la misión: un rombo en pantalla sobre el sitio al que ir ----------
// Si el sitio queda fuera de la vista, se pega al borde con una flecha que señala hacia él.
const guia = { el: document.getElementById('guia'), punto: new THREE.Vector3(), visible: false };
guia.flecha = guia.el.querySelector('.guia-flecha');
guia.dist = guia.el.querySelector('.guia-dist');
function pintarGuia() {
  const destino = state.phase === 'play' && !busy() ? destinoActual() : null;
  const d = destino ? Math.hypot(destino.x - player.pos.x, destino.z - player.pos.z) : 0;
  const mostrar = Boolean(destino) && d > 3.2;
  if (mostrar !== guia.visible) { guia.visible = mostrar; guia.el.classList.toggle('hidden', !mostrar); }
  if (!mostrar) return;
  const p = guia.punto.set(destino.x, (destino.y || 0) + 2.2, destino.z).project(camera);
  const detras = p.z > 1;
  let x = p.x, y = p.y;
  if (detras) { x = -x; y = -y; }
  const fuera = detras || Math.abs(x) > 0.92 || Math.abs(y) > 0.88;
  if (fuera) {
    const k = 1 / Math.max(Math.abs(x) / 0.92, Math.abs(y) / 0.88, 1e-6);
    x *= k; y *= k;
  }
  guia.el.style.transform = `translate(${((x + 1) / 2) * innerWidth}px, ${((1 - y) / 2) * innerHeight}px)`;
  guia.el.classList.toggle('fuera', fuera);
  if (fuera) guia.flecha.style.transform = `rotate(${Math.atan2(-y, x)}rad)`;
  guia.dist.textContent = `${Math.round(d)} m`;
}

const objetivoCam = new THREE.Vector3();
function updateCamera(dt) {
  cam.target.lerp(objetivoCam.set(player.pos.x, player.pos.y + 1.5, player.pos.z), 1 - Math.exp(-dt * 10));
  const cp = Math.cos(cam.pitch);
  camera.position.set(
    cam.target.x + Math.sin(cam.yaw) * cp * cam.dist,
    cam.target.y + Math.sin(cam.pitch) * cam.dist,
    cam.target.z + Math.cos(cam.yaw) * cp * cam.dist,
  );
  zona.limitarCamara(camera.position, player.pos);
  // la cámara no puede meterse dentro de columnas, árboles grandes ni la torre
  for (const c of zona.colliders) {
    if (c.r < 1) continue;
    const dx = camera.position.x - c.x, dz = camera.position.z - c.z;
    const d = Math.hypot(dx, dz), min = c.r + 0.25;
    if (d < min && d > 1e-4) {
      camera.position.x = c.x + (dx / d) * min;
      camera.position.z = c.z + (dz / d) * min;
    }
  }
  if (opciones.reducirMovimiento) state.shake = 0;
  if (state.shake > 0) {
    state.shake = Math.max(0, state.shake - dt);
    const a = state.shake * 0.25;
    camera.position.x += (Math.random() - 0.5) * a;
    camera.position.y += (Math.random() - 0.5) * a;
  }
  camera.lookAt(cam.target);
}

// ---------- Flujo de partida ----------
async function startStory() {
  sonido.iniciar();
  sonido.clic();
  await ui.fundido(true);
  ui.hideScreen('screen-title');
  // la cinemática de inicio: el parque, el portal y la llegada a casa de Aldric
  player.group.visible = false;
  await runFlow(() => cine.inicio());
  player.group.visible = true;
  ui.hideScreen('screen-story');
  aplicarZona(casa);
  colocarEn(casa);
  state.phase = 'play';
  document.getElementById('hud').classList.remove('hidden');
  ui.setSaber(0);
  await esperar(300);
  await ui.fundido(false);
  ui.toast(CASA.inicio, 'info', 6500);
}
document.getElementById('btn-solo').onclick = startStory;

// Progreso guardado (versión 2): pisos completados y aciertos por criterio.
// Nunca sale del navegador. Se migra el formato antiguo, que solo tenía el Piso I.
function leerProgreso() {
  try {
    const p = JSON.parse(localStorage.getItem('torreMorvath') || 'null');
    if (!p) return { version: 2, pisos: {}, criterios: {} };
    if (p.version === 2) return p;
    return { version: 2, pisos: p.piso1 ? { piso1: p.piso1 } : {}, criterios: {} };
  } catch { return { version: 2, pisos: {}, criterios: {} }; }
}
// guarda el piso superado y suma los criterios trabajados desde el último guardado
let criteriosGuardados = {};
function guardarProgreso(pisoId) {
  const p = leerProgreso();
  const total = state.aciertos + state.fallos;
  const precision = total ? Math.round((state.aciertos / total) * 100) : 100;
  const segundos = Math.round((performance.now() - state.startedAt) / 1000);
  const antes = p.pisos[pisoId];
  p.pisos[pisoId] = { completado: true, mejorPrecision: Math.max(precision, antes?.mejorPrecision ?? 0), segundos };
  for (const [k, v] of Object.entries(state.criterios)) {
    const ya = criteriosGuardados[k] ?? { a: 0, f: 0 };
    const c = (p.criterios[k] ??= { a: 0, f: 0 });
    c.a += v.a - ya.a;
    c.f += v.f - ya.f;
  }
  criteriosGuardados = structuredClone(state.criterios);
  try { localStorage.setItem('torreMorvath', JSON.stringify(p)); } catch { /* sin almacenamiento local no se guarda */ }
}

function finish() {
  state.finished = true;
  state.phase = 'end';
  document.getElementById('hud').classList.add('hidden');
  sonido.sello();
  const secs = Math.round((performance.now() - state.startedAt) / 1000);
  const total = state.aciertos + state.fallos;
  const precision = total ? Math.round((state.aciertos / total) * 100) : 100;
  guardarProgreso(zona.id);
  const [numero, titulo] = (zona.nombre ?? '').split(' · ');
  const fin = $('screen-end');
  fin.querySelector('.title-kicker').textContent = `${numero} superado`;
  fin.querySelector('.end-title').textContent = titulo ?? '';
  fin.querySelector('.title-sub').innerHTML = zona.id === 'piso8'
    ? 'La proyección de Morvath se ha desvanecido, pero la torre sigue en pie. <strong>Lo que hay más arriba</strong>, próximamente.'
    : 'La escalera sigue subiendo. <strong>El siguiente piso</strong>, próximamente.';
  const porCriterio = Object.entries(state.criterios).sort().map(([k, v]) => [`Criterio ${k}`, `${Math.round((v.a / Math.max(1, v.a + v.f)) * 100)}%`]);
  ui.showEnd([
    ['Saber', state.saber],
    ['Aciertos', state.aciertos],
    ['Fallos', state.fallos],
    ['Precisión', `${precision}%`],
    ['Tiempo', `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`],
    ...porCriterio,
  ]);
}

// "Continuar en el Piso N" (solo): para quien ya superó el piso anterior en otra sesión
async function continuarEnPiso(id) {
  sonido.iniciar();
  sonido.clic();
  ui.hideScreen('screen-title');
  document.getElementById('loading').classList.remove('hidden');
  let piso;
  try {
    piso = await asegurarPiso(id);
  } catch (e) {
    console.error(e);
    location.reload();
    return;
  }
  document.getElementById('loading').classList.add('hidden');
  state.varita = true;
  player.mostrarVarita(true);
  aldric.group.visible = true;
  state.startedAt = performance.now();
  await ui.fundido(true);
  aplicarZona(piso.zona);
  colocarEn(piso.zona);
  state.phase = 'play';
  document.getElementById('hud').classList.remove('hidden');
  ui.setSaber(0);
  await esperar(300);
  await ui.fundido(false);
  await runFlow(() => piso.intro());
}
// pisos con carga diferida cuyo anterior ya está superado (con ?docente=1, todos)
function pisosDisponibles() {
  const hechos = leerProgreso().pisos;
  const docente = new URLSearchParams(location.search).has('docente');
  return Object.keys(PISOS).filter((id) => docente || hechos[ORDEN_PISOS[ORDEN_PISOS.indexOf(id) - 1]]?.completado);
}
const mapaPisos = pisosDisponibles(); // se calcula al cargar: el progreso no cambia estando en la casa
casa.mostrarMapa(mapaPisos.length > 0);

// ---------- El mapa de la torre (en la casa): ir a un piso ya desbloqueado ----------
// En equipo solo elige el anfitrión (con su progreso); todos van con él.
async function elegirEnMapa() {
  if (red.activa && !red.esHost) {
    await ui.dialogue(['En el mapa solo elige quien creó la sala (el **anfitrión**). Si os lo saltáis, seguid la historia desde aquí.']);
    return;
  }
  sonido.clic();
  const nombre = (id) => CONTENIDO_PISOS.find((c) => c.id === id)?.nombre ?? id;
  const elegido = await ui.story(
    ['**El mapa de la torre.** Los pisos que ya habéis superado brillan: podéis subir directamente al siguiente o repasar uno anterior. Para entrar en el Piso I, seguid la historia.'],
    [...mapaPisos.map((id) => ({ id, texto: nombre(id) })), { id: 'nada', texto: 'Cerrar el mapa' }],
  );
  ui.hideScreen('screen-story');
  if (elegido !== 'nada') accion('irPiso', { piso: elegido });
}
async function irPorElMapa(id) {
  state.casa.decidido = true;
  let piso;
  try {
    piso = await asegurarPiso(id);
  } catch (e) {
    console.error(e);
    ui.toast('No se pudo cargar ese piso. Revisa la conexión y recarga la página.', 'bad', 8000);
    state.casa.decidido = false;
    return;
  }
  state.varita = true;
  player.mostrarVarita(true);
  ui.toast('Aldric os presta su **varita** (F)', 'learn', 3600);
  sonido.teletransporte();
  await irA(id, zonas[id].nombre);
  state.startedAt = performance.now();
  const otro = siguientePiso(id);
  if (otro && PISOS[otro]) asegurarPiso(otro).catch(() => {});
  await presentarSala();
  await piso.intro();
  refreshObjectives();
}
{
  const hechos = leerProgreso().pisos;
  const disponibles = pisosDisponibles();
  // el primer piso disponible sin superar (o el último)
  const destino = disponibles.find((id) => !hechos[id]?.completado) ?? disponibles[disponibles.length - 1];
  if (destino) {
    const boton = $('btn-continuar');
    boton.textContent = `Continuar en el ${CONTENIDO_PISOS.find((c) => c.id === destino).nombre.split(' · ')[0]}`;
    boton.classList.remove('hidden');
    boton.onclick = () => continuarEnPiso(destino);
  }
}
document.getElementById('btn-replay').onclick = () => location.reload();

// ---------- Informe para el profesor (página HTML descargable) ----------
async function informe() {
  sonido.iniciar();
  let alumno = leer('torreMorvathNombre');
  const v = await ui.formulario('¿A nombre de quién va el informe?', 'Informe para el profesor', [{ id: 'nombre', etiqueta: 'Nombre y apellidos', valor: alumno, ayuda: 'Nombre Apellido' }], (d) => (d.nombre ? {} : { nombre: 'Escribe tu nombre.' }));
  if (!v) return;
  alumno = v.nombre.slice(0, 60);
  try { localStorage.setItem('torreMorvathNombre', alumno); } catch { /* sin almacenamiento local */ }
  descargarInforme({
    alumno,
    fecha: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
    pisos: [PISO1, ...CONTENIDO_PISOS].map((c, i) => ({ id: ORDEN_PISOS[i], nombre: c.nombre })),
    progreso: leerProgreso(),
  });
  ui.toast('Informe descargado: ábrelo con el navegador para verlo o imprimirlo.', 'info', 5000);
}
document.getElementById('btn-informe-fin').onclick = informe;
if (Object.keys(leerProgreso().pisos).length) {
  $('btn-informe').classList.remove('hidden');
  $('btn-informe').onclick = informe;
}

// ---------- Bucle ----------
let last = performance.now();
// si los primeros 8 s de juego van a menos de 28 fotogramas por segundo, se sugiere la calidad baja (una vez)
const medidaFps = { t: 0, n: 0, hecho: false };
function vigilarFps(dt) {
  if (medidaFps.hecho || opciones.calidadBaja || state.phase !== 'play' || document.hidden) return;
  medidaFps.t += dt;
  medidaFps.n++;
  if (medidaFps.t < 8) return;
  medidaFps.hecho = true;
  if (medidaFps.n / medidaFps.t < 28) ui.toast(`El juego va lento en este equipo: ${tactil ? 'toca ⚙' : 'pulsa O'} y activa «Calidad baja».`, 'info', 7000);
}

function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  vigilarFps(dt);
  tick(dt, now / 1000);
  composer.render();
  requestAnimationFrame(frame);
}

function tick(dt, t) {
  if (cine.activa) {
    cine.update(dt, t);
    if (zona === casa) casa.update(dt, t, fx);
    fx.small.update(dt);
    fx.big.update(dt);
    return;
  }
  const control = state.phase === 'play' && !busy();

  let ix = 0, iz = 0;
  if (control) {
    if (keys.KeyW || keys.ArrowUp) iz += 1;
    if (keys.KeyS || keys.ArrowDown) iz -= 1;
    if (keys.KeyD || keys.ArrowRight) ix += 1;
    if (keys.KeyA || keys.ArrowLeft) ix -= 1;
  }
  if (tactil) {
    if (control) { ix += tactil.eje.x; iz += tactil.eje.z; }
    if (tactilVisible !== control) { tactilVisible = control; tactil.mostrar(control); tactil.chat(red.activa); }
  }
  const correr = control && (keys.ShiftLeft || keys.ShiftRight || tactil?.eje.correr);
  // girar la cámara con el teclado (para jugar sin ratón)
  if (control && keys.KeyJ) cam.yaw += dt * 2.2 * opciones.sensibilidad;
  if (control && keys.KeyL) cam.yaw -= dt * 2.2 * opciones.sensibilidad;
  player.update(dt, { x: ix, z: iz, run: correr, jump: control && keys.Space }, cam.yaw, zona, t);
  if (aldric.group.visible) aldric.update(dt, t, player, camera, ui.open.dialogue, zona);

  // sonido de pasos, salto y aterrizaje
  const vel = Math.hypot(player.vel.x, player.vel.z);
  if (player.onGround && vel > 0.6) {
    state.pasos += vel * dt;
    if (state.pasos > (correr ? 2.1 : 1.45)) {
      state.pasos = 0;
      sonido.paso(zona.pisada, correr);
    }
  }
  if (player.saltoAhora) sonido.salto();
  if (player.aterrizaje) {
    sonido.aterrizaje();
    fx.big.emit(player.pos.clone().setY(0.15), { count: 14, color: zona.pisada === 'hierba' ? 0x6f7a4a : 0x9a8a78, intensity: 0.7, speed: 1.8, life: 0.55, gravity: 3 });
  }
  // polvo al correr
  if (player.onGround && correr && vel > 4) {
    state.polvoPasos = (state.polvoPasos ?? 0) - dt;
    if (state.polvoPasos <= 0) {
      state.polvoPasos = 0.09;
      fx.small.emit(player.pos.clone().setY(0.1), { count: 2, color: zona.pisada === 'hierba' ? 0x7d8a5a : 0xa89a88, intensity: 0.6, speed: 0.7, life: 0.5, gravity: -0.4 });
    }
  }

  // la luna sigue al jugador: sombras nítidas estés donde estés
  moon.position.set(player.pos.x - 14, 24, player.pos.z + 8);
  moon.target.position.copy(player.pos);

  if (zona === casa) {
    casa.update(dt, t, fx);
    if (state.casa.abriendo && state.casa.puerta < 1) {
      state.casa.puerta = Math.min(1, state.casa.puerta + dt * 0.9);
      casa.abrirPuerta(state.casa.puerta * state.casa.puerta * (3 - 2 * state.casa.puerta));
    }
  } else if (zona === exterior) {
    exterior.update(dt, t, fx, player.pos);
  } else if (zona.actualizar) {
    zona.actualizar(dt, t);
  } else {
    world.update(dt, t, camera);
  }
  spells.update(dt);
  ataques.update(dt);
  if (enfriamientoArma > 0) enfriamientoArma = Math.max(0, enfriamientoArma - dt);
  fx.small.update(dt);
  fx.big.update(dt);
  for (const c of companeros.values()) c.update(dt);
  if (red.activa && state.phase === 'play') {
    state.envio += dt;
    if (state.envio > 1 / 12) {
      state.envio = 0;
      red.enviar({ t: 'pos', id: red.miId, zn: zona.id, ...player.estadoRed() });
    }
  }

  if (state.phase === 'title' || state.phase === 'story') cam.yaw += dt * 0.06;

  if (state.phase === 'play') {
    if (state.wandCooldown > 0) state.wandCooldown = Math.max(0, state.wandCooldown - dt);
    ui.setWand(!state.varita ? '—' : state.wandCooldown > 0 ? 'Recargando…' : 'Lista (F)', state.varita && state.wandCooldown === 0);

    const prev = state.target;
    state.target = pickTarget();
    if (prev && prev !== state.target) prev.targeted = false;
    if (state.target) state.target.targeted = true;
    ui.scrollInfo(state.target && !busy() ? state.target.data : null);

    state.interact = busy() ? null : nearestInteractable();
    for (const c of world.crystals) c.focus = state.interact?.crystal === c;
    zona.alFocalizar?.(state.interact);
    ui.prompt(state.interact ? state.interact.prompt() : null);

    if (zona === exterior && !busy()) {
      // Aldric comenta al pasar por algunos lugares
      for (const [lugar, radio] of [['cementerio', 13], ['santuario', 9], ['arco', 20]]) {
        const clave = lugar === 'arco' ? 'torre' : lugar;
        if (state.comentados.has(clave) || state.pedido[clave] || player.pos.distanceTo(exterior.lugares[lugar]) > radio) continue;
        state.pedido[clave] = true;
        accion('comentario', { clave });
        break;
      }
    }
    if (zona === world.zona) {
      if (!state.phishingTriggered && !state.pedido.phishing && !busy() && Math.hypot(player.pos.x - world.scrollZone.x, player.pos.z - world.scrollZone.z) < 7.2) {
        state.pedido.phishing = true;
        accion('leccion', { id: 'phishing' });
      }
    }
    // al cruzar la puerta abierta y subir la escalera se pasa al siguiente piso
    const sal = zona.salida;
    if (sal && sal.abierta() && !state.finished && player.pos.z < sal.z) {
      const [tipo, datos] = sal.accion;
      const clave = `${tipo}:${datos.piso}`;
      if (!state.pedido[clave]) {
        state.pedido[clave] = true;
        accion(tipo, datos);
      }
    }
  }

  updateCamera(dt);
  pintarGuia();
  atenuarEtiquetas(dt);
}

// la portada muestra el camino con la torre al fondo
aplicarZona(exterior);
colocarEn(exterior);
cam.pitch = 0.2;
document.getElementById('loading').classList.add('hidden');
document.getElementById('screen-title').classList.remove('hidden');
requestAnimationFrame(frame);

// acceso para depuración desde la consola: __torre.step(n) avanza n fotogramas
// aunque la pestaña esté en segundo plano
let simT = 0;
window.__torre = {
  state, player, world, casa, exterior, cam, ui, keys, sonido, aldric, red, companeros, pisos, renderer, accion,
  get zona() { return zona; },
  get cine() { return cine; },
  // ir a una zona sin fundido (los pisos con carga diferida se construyen antes)
  async irA(id) {
    if (PISOS[id]) await asegurarPiso(id);
    aplicarZona(zonas[id]);
    colocarEn(zonas[id]);
  },
  step(n = 1, dt = 1 / 60) {
    for (let i = 0; i < n; i++) tick(dt, (simT += dt));
    composer.render();
  },
  // captura el canvas a una resolución fija y devuelve un dataURL JPEG
  capture(w = 1280, h = 720) {
    renderer.setPixelRatio(1);
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    composer.render();
    const url = canvas.toDataURL('image/jpeg', 0.9);
    renderer.setPixelRatio(ratioPantalla());
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    return url;
  },
};
