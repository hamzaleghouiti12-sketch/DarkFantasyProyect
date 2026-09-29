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
import { PERSONAJES, personajeValido, cargarPersonaje, instanciar, configurarVarita } from './personajes.js';

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
const zonas = { casa, exterior, piso1: world.zona };

const player = new Player(scene);
const aldric = new Hologram(scene);
aldric.group.visible = false; // aparece cuando se activa el cristal
const spells = new SpellSystem(scene, fx);
const ui = new UI();
const sonido = new Sonido();
const red = new Red();
const companeros = new Map(); // id → Companero
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
};
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
function record(ok) {
  if (ok) { state.aciertos++; addSaber(10); } else state.fallos++;
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
  } else {
    const s = state.seals;
    items = [
      { text: 'Responde al cartel del guardián', done: s.cartel },
      { text: 'Ofrece la contraseña correcta en el altar', done: s.altar },
      { text: `Destruye los pergaminos de phishing (${fraudTotal - fraudLeft}/${fraudTotal})`, done: s.pergaminos },
    ];
    if (state.doorOpen) items.push({ text: 'Cruza la puerta del norte', done: false });
  }
  ui.setObjectives(items);
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
  if (red.activa) player.pos.x += [0, -1.4, 1.4][red.miColor] ?? 0;
  player.vel.set(0, 0, 0);
  player.facing = z.entrada.mirada;
  cam.yaw = z.entrada.yaw;
  cam.target.set(player.pos.x, player.pos.y + 1.5, player.pos.z);
  aldric.group.position.set(player.pos.x - 1.4, 0, player.pos.z - 0.6);
}
async function irA(id) {
  await ui.fundido(true);
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
  await irA('exterior');
  await ui.dialogue(EXTERIOR.llegada);
}

// ---------- Exterior ----------
async function entrarTorre() {
  sonido.teletransporte();
  await irA('piso1');
  state.startedAt = performance.now();
  await ui.dialogue(PISO1.intro);
  ui.toast('**G** grimorio · **H** pedir pista a Aldric', 'info', 5000);
}

// ---------- Enseñar ----------
async function teach(id) {
  const lesson = PISO1.lecciones[id];
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
  ui.toast(`✦ Sello roto (${n}/3)`, 'seal', 3600);
  refreshObjectives();
  if (n === 3) {
    await ui.dialogue(PISO1.sellosRotos);
    world.openDoor();
    sonido.puerta();
    state.doorOpen = true;
    state.shake = 0.8;
    refreshObjectives();
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
  record(ok);
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
    if (soyAutor) record(true);
    sonido.acierto();
    c.done = true;
    world.flashCrystal(c, true);
    for (const other of world.crystals) other.label.visible = other === c;
    await ui.dialogue([`¡Eso es! «${c.texto}»: ${c.porque}`]);
    await breakSeal('altar');
  } else {
    if (soyAutor) record(false);
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
function pickQuestion() {
  const pool = PREGUNTAS.filter((q) => state.learned.has(q.concepto));
  const fresh = pool.filter((q) => !state.recent.includes(q.id));
  const list = fresh.length ? fresh : pool;
  const q = list[Math.floor(Math.random() * list.length)];
  state.recent.push(q.id);
  if (state.recent.length > Math.min(5, pool.length - 1)) state.recent.shift();
  return q;
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
  const q = pickQuestion();
  const ok = await ui.quiz(q, `La varita exige un concepto · ${PISO1.lecciones[q.concepto].titulo}`);
  record(ok);
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
  if (zona !== world.zona || !state.learned.has('phishing')) return null;
  camFwd.set(-Math.sin(cam.yaw), 0, -Math.cos(cam.yaw));
  let best = null, bestScore = Infinity;
  for (const s of world.scrolls) {
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
  return tipo;
}
function valido(tipo, d) {
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
        if (soyAutor && d.luego === 'cartel') await cartelPregunta();
      });
      break;
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
    case 'fin': finish(); break;
  }
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
  else if (msg.t === 'hechizo') verHechizo(msg);
  else if (msg.t === 'acc' && red.esHost) {
    if (!valido(msg.tipo, msg.datos)) return;
    red.enviar({ t: 'ev', tipo: msg.tipo, datos: msg.datos, autor: de });
    aplicarEvento(msg.tipo, msg.datos, false);
  } else if (msg.t === 'ev' && !red.esHost) aplicarEvento(msg.tipo, msg.datos, msg.autor === red.miId);
  else if (msg.t === 'empezar' && !red.esHost) empezarEquipo();
};
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
red.alCambiarSala = (jugadores) => {
  for (const j of jugadores) if (j.id !== red.miId) asegurarCompanero(j);
  for (const [id, c] of companeros) {
    if (!jugadores.some((j) => j.id === id)) { c.quitar(); companeros.delete(id); }
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
  if (quien && state.phase === 'play') ui.toast(`${quien.nombre} ha salido de la partida.`, 'bad', 4000);
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
      : `¡Listos! (${n}/${MAX_JUGADORES}). Puedes empezar ya o esperar a un tercero.`;
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
async function hint() {
  if (zona === casa) {
    await ui.dialogue([!state.casa.cristal ? CASA.pistas.cristal : CASA.pistas.decidir]);
  } else if (zona === exterior) {
    const cerca = player.pos.distanceTo(exterior.lugares.arco) < 22;
    await ui.dialogue([cerca ? EXTERIOR.pistas.arco : EXTERIOR.pistas.camino]);
  } else {
    const s = state.seals;
    const key = !s.cartel ? 'cartel' : !s.altar ? 'altar' : !s.pergaminos ? 'pergaminos' : 'puerta';
    await ui.dialogue([PISO1.pistas[key]]);
  }
}
const grimEntries = () => [...state.learned].map((id) => PISO1.lecciones[id]);

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
  if (e.target instanceof HTMLInputElement) return; // escribiendo en los campos de la sala
  if (['Space', 'ArrowUp', 'ArrowDown', 'Tab'].includes(e.code)) e.preventDefault();
  sonido.iniciar();
  if (ui.handleKey(e)) return;
  keys[e.code] = true;
  if (e.code === 'KeyM' && !e.repeat) {
    ui.toast(sonido.alternarSilencio() ? 'Sonido desactivado (M)' : 'Sonido activado (M)', 'info', 1800);
    return;
  }
  if (e.repeat || state.phase !== 'play' || busy()) return;
  if (e.code === 'KeyE' && state.interact) runFlow(state.interact.action);
  else if (e.code === 'KeyF') runFlow(useWand);
  else if (e.code === 'KeyH') runFlow(hint);
  else if (e.code === 'KeyG') ui.openGrimoire(grimEntries());
});
addEventListener('keyup', (e) => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

const cam = { yaw: 0, pitch: 0.36, dist: 6.5, target: new THREE.Vector3(0, 1.5, 14) };
let dragging = false, lastX = 0, lastY = 0;
canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointerup', () => { dragging = false; });
canvas.addEventListener('pointermove', (e) => {
  if (!dragging || state.phase !== 'play') return;
  cam.yaw -= (e.clientX - lastX) * 0.006;
  cam.pitch = Math.max(0.05, Math.min(1.15, cam.pitch + (e.clientY - lastY) * 0.004));
  lastX = e.clientX;
  lastY = e.clientY;
});
canvas.addEventListener('wheel', (e) => { cam.dist = Math.max(3.2, Math.min(10, cam.dist + e.deltaY * 0.004)); }, { passive: true });

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
  ui.hideScreen('screen-title');
  await ui.story(PROLOGO.paginas, [{ id: 'empezar', texto: 'Bajar al taller' }]);
  await ui.fundido(true);
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

function finish() {
  state.finished = true;
  state.phase = 'end';
  document.getElementById('hud').classList.add('hidden');
  sonido.sello();
  const secs = Math.round((performance.now() - state.startedAt) / 1000);
  const total = state.aciertos + state.fallos;
  const precision = total ? Math.round((state.aciertos / total) * 100) : 100;
  try {
    localStorage.setItem('torreMorvath', JSON.stringify({ piso1: { completado: true, saber: state.saber, precision, segundos: secs } }));
  } catch { /* sin almacenamiento local no se guarda el progreso */ }
  ui.showEnd([
    ['Saber', state.saber],
    ['Aciertos', state.aciertos],
    ['Fallos', state.fallos],
    ['Precisión', `${precision}%`],
    ['Tiempo', `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`],
  ]);
}
document.getElementById('btn-replay').onclick = () => location.reload();

// ---------- Bucle ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  tick(dt, now / 1000);
  composer.render();
  requestAnimationFrame(frame);
}

function tick(dt, t) {
  const control = state.phase === 'play' && !busy();

  let ix = 0, iz = 0;
  if (control) {
    if (keys.KeyW || keys.ArrowUp) iz += 1;
    if (keys.KeyS || keys.ArrowDown) iz -= 1;
    if (keys.KeyD || keys.ArrowRight) ix += 1;
    if (keys.KeyA || keys.ArrowLeft) ix -= 1;
  }
  const correr = control && (keys.ShiftLeft || keys.ShiftRight);
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
  if (player.aterrizaje) sonido.aterrizaje();

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
  } else {
    world.update(dt, t, camera);
  }
  spells.update(dt);
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
      if (state.doorOpen && !state.finished && !state.pedido.fin && player.pos.z < ROOM.salida) {
        state.pedido.fin = true;
        accion('fin');
      }
    }
  }

  updateCamera(dt);
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
  state, player, world, casa, exterior, cam, ui, keys, sonido, aldric, red, companeros,
  get zona() { return zona; },
  irA: (id) => { aplicarZona(zonas[id]); colocarEn(zonas[id]); },
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
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    return url;
  },
};
