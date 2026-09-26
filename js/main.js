import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Particles } from './particles.js';
import { buildWorld, ROOM } from './world.js';
import { Player } from './player.js';
import { Hologram } from './hologram.js';
import { SpellSystem, SPELLS } from './spells.js';
import { UI } from './ui.js';
import { PROLOGO, PISO1, PREGUNTAS } from './content.js';
import { RUTAS, cargarModelo, cargarPaleta } from './modelos.js';
import { cargarMazmorra, vestirMazmorra } from './mazmorra.js';

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

// ---------- Mundo ----------
const fx = { small: new Particles(scene, 3000, 0.09), big: new Particles(scene, 1500, 0.3) };
const world = buildWorld(scene, fx, PISO1);
const player = new Player(scene);
player.pos.set(0, 0, 14);
const aldric = new Hologram(scene);
aldric.group.position.set(-1.4, 0, 13.5);
const spells = new SpellSystem(scene, fx);
const ui = new UI();

// Modelos externos (KayKit, CC0). Si algo falla, se quedan los hechos por código.
try {
  const [prota, varita, mago, paletaPicaro, paletaMago] = await Promise.all([
    cargarModelo(RUTAS.protagonista), cargarModelo(RUTAS.varita), cargarModelo(RUTAS.aldric),
    cargarPaleta(RUTAS.paletaPicaro), cargarPaleta(RUTAS.paletaMago),
  ]);
  player.usarModelo(prota, varita, paletaPicaro, paletaMago);
  aldric.usarModelo(mago);
} catch (e) {
  console.warn('No se pudieron cargar los modelos; uso los hechos por código.', e);
}
try {
  const piezas = await cargarMazmorra(await cargarPaleta(RUTAS.paletaMazmorra));
  vestirMazmorra(world, scene, piezas);
} catch (e) {
  console.warn('No se pudo cargar la mazmorra; uso la sala hecha por código.', e);
}

// ---------- Estado ----------
const state = {
  phase: 'title',
  learned: new Set(),
  seals: { cartel: false, altar: false, pergaminos: false },
  saber: 0, aciertos: 0, fallos: 0, startedAt: 0,
  wandCooldown: 0, doorOpen: false, finished: false,
  recent: [], target: null, interact: null, phishingTriggered: false, shake: 0,
};
const fraudTotal = PISO1.pergaminos.filter((p) => p.fraude).length;
let fraudLeft = fraudTotal;

let flowDepth = 0;
let chain = Promise.resolve();
function runFlow(fn) {
  flowDepth++;
  chain = chain.then(fn).catch((e) => console.error(e)).finally(() => { flowDepth--; });
  return chain;
}
const busy = () => flowDepth > 0 || ui.anyOpen();

function addSaber(n) {
  state.saber += n;
  ui.setSaber(state.saber);
}
function record(ok) {
  if (ok) { state.aciertos++; addSaber(10); } else state.fallos++;
}

function refreshObjectives() {
  const s = state.seals;
  const items = [
    { text: 'Responde al cartel del guardián', done: s.cartel },
    { text: 'Ofrece la contraseña correcta en el altar', done: s.altar },
    { text: `Destruye los pergaminos de phishing (${fraudTotal - fraudLeft}/${fraudTotal})`, done: s.pergaminos },
  ];
  if (state.doorOpen) items.push({ text: 'Cruza la puerta del norte', done: false });
  ui.setObjectives(items);
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
    state.doorOpen = true;
    state.shake = 0.8;
    refreshObjectives();
  }
}

// ---------- Desafío 1: cartel ----------
async function challengeCartel() {
  if (!state.learned.has('2fa')) await teach('2fa');
  const ok = await ui.quiz(PISO1.cartel, 'El cartel del guardián');
  record(ok);
  if (ok) {
    fx.big.emit(new THREE.Vector3(world.sign.pos.x, 2.4, world.sign.pos.z), { count: 60, color: 0x9fe6ff, intensity: 2, speed: 3, life: 1 });
    world.sign.mark.visible = false;
    await breakSeal('cartel');
  } else {
    await ui.dialogue(['No pasa nada, equivocarse también enseña. Recordad: **algo que sabes + algo que tienes**. Volved a leer el cartel cuando queráis.']);
  }
}

// ---------- Desafío 2: altar ----------
async function examineAltar() {
  await teach('contrasenas');
}
async function offerCrystal(c) {
  if (c.ok) {
    record(true);
    c.done = true;
    world.flashCrystal(c, true);
    for (const other of world.crystals) other.label.visible = other === c;
    await ui.dialogue([`¡Eso es! «${c.texto}»: ${c.porque}`]);
    await breakSeal('altar');
  } else {
    record(false);
    world.flashCrystal(c, false);
    state.shake = 0.4;
    player.golpe();
    await ui.dialogue([`¡Cuidado! «${c.texto}» no aguantaría ni un hechizo de aprendiz. ${c.porque}`, 'Probad con otro cristal.']);
  }
}

// ---------- Desafío 3: pergaminos (con la varita) ----------
function hitScroll(s) {
  if (!s.alive) return;
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
    state.fallos++;
    state.shake = 0.3;
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
  if (state.wandCooldown > 0) return;
  if (state.learned.size === 0) {
    await ui.dialogue(['La varita solo responde a quien ha aprendido algo. Acercaos primero a un desafío y os enseñaré.']);
    return;
  }
  const target = state.target;
  const q = pickQuestion();
  const ok = await ui.quiz(q, `La varita exige un concepto · ${PISO1.lecciones[q.concepto].titulo}`);
  record(ok);
  const tip = player.wandTip(new THREE.Vector3());
  player.castAnim();
  if (ok) {
    const spell = SPELLS[Math.floor(Math.random() * SPELLS.length)];
    ui.toast(`✦ ${spell.nombre}`, 'spell', 2200);
    camFwd.set(-Math.sin(cam.yaw), 0, -Math.cos(cam.yaw));
    const fallback = player.pos.clone().addScaledVector(camFwd, 14).setY(1.4);
    const aim = target && target.alive ? () => target.group.position : null;
    spells.cast(spell, tip, aim, fallback, () => { if (aim) hitScroll(target); });
    state.wandCooldown = 1.2;
  } else {
    spells.fizzle(tip);
    ui.toast('La varita chisporrotea y se apaga…', 'bad', 2400);
    state.wandCooldown = 2.5;
  }
}

function pickTarget() {
  if (!state.learned.has('phishing')) return null;
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

// ---------- Pistas y grimorio ----------
async function hint() {
  const s = state.seals;
  const key = !s.cartel ? 'cartel' : !s.altar ? 'altar' : !s.pergaminos ? 'pergaminos' : 'puerta';
  await ui.dialogue([PISO1.pistas[key]]);
}
const grimEntries = () => [...state.learned].map((id) => PISO1.lecciones[id]);

// ---------- Interactuables ----------
const interactables = [
  {
    pos: world.sign.pos, r: 2.9,
    enabled: () => !state.seals.cartel,
    prompt: () => '**E** · Leer el cartel del guardián',
    action: challengeCartel,
  },
  {
    pos: world.altar.center, r: 4.4,
    enabled: () => !state.seals.altar && !state.learned.has('contrasenas'),
    prompt: () => '**E** · Examinar el altar de los cristales',
    action: examineAltar,
  },
  ...world.crystals.map((c) => ({
    pos: c.pos, r: 1.6, crystal: c,
    enabled: () => !state.seals.altar && state.learned.has('contrasenas'),
    prompt: () => `**E** · Ofrecer «${c.texto}» al altar`,
    action: () => offerCrystal(c),
  })),
];

function nearestInteractable() {
  let best = null, bestD = Infinity;
  for (const it of interactables) {
    if (!it.enabled()) continue;
    const d = Math.hypot(player.pos.x - it.pos.x, player.pos.z - it.pos.z);
    if (d < it.r && d < bestD) { bestD = d; best = it; }
  }
  return best;
}

// ---------- Entrada ----------
const keys = {};
addEventListener('keydown', (e) => {
  if (['Space', 'ArrowUp', 'ArrowDown', 'Tab'].includes(e.code)) e.preventDefault();
  if (ui.handleKey(e)) return;
  keys[e.code] = true;
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

function updateCamera(dt) {
  cam.target.lerp(new THREE.Vector3(player.pos.x, player.pos.y + 1.5, player.pos.z), 1 - Math.exp(-dt * 10));
  const cp = Math.cos(cam.pitch);
  camera.position.set(
    cam.target.x + Math.sin(cam.yaw) * cp * cam.dist,
    cam.target.y + Math.sin(cam.pitch) * cam.dist,
    cam.target.z + Math.cos(cam.yaw) * cp * cam.dist,
  );
  const inCorridor = player.pos.z < -ROOM.L;
  camera.position.x = Math.max(-ROOM.W + 0.4, Math.min(ROOM.W - 0.4, camera.position.x));
  camera.position.z = Math.min(ROOM.L - 0.4, camera.position.z);
  if (!inCorridor) camera.position.z = Math.max(-ROOM.L + 0.4, camera.position.z);
  camera.position.y = Math.max(0.5, Math.min(ROOM.H - 0.5, camera.position.y));
  // la cámara no puede meterse dentro de las columnas
  for (const c of world.colliders) {
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
function beginPlay() {
  state.phase = 'play';
  state.startedAt = performance.now();
  document.getElementById('hud').classList.remove('hidden');
  refreshObjectives();
  ui.setSaber(0);
  runFlow(async () => {
    await ui.dialogue(PISO1.intro);
    ui.toast('**G** grimorio · **H** pedir pista a Aldric', 'info', 5000);
  });
}

async function startStory() {
  ui.hideScreen('screen-title');
  let choice = await ui.story(PROLOGO.paginas, PROLOGO.elecciones);
  while (choice === 'casa') {
    await ui.story(PROLOGO.finalCasa, [{ id: 'otra', texto: 'Volver atrás y decidir otra vez' }]);
    choice = await ui.story([PROLOGO.paginas.at(-1)], PROLOGO.elecciones);
  }
  ui.hideScreen('screen-story');
  beginPlay();
}
document.getElementById('btn-start').onclick = startStory;

function finish() {
  state.finished = true;
  state.phase = 'end';
  document.getElementById('hud').classList.add('hidden');
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
  player.update(dt, { x: ix, z: iz, run: control && (keys.ShiftLeft || keys.ShiftRight), jump: control && keys.Space }, cam.yaw, world.colliders, state.doorOpen, t);
  aldric.update(dt, t, player, camera, ui.open.dialogue);
  world.update(dt, t, camera);
  spells.update(dt);
  fx.small.update(dt);
  fx.big.update(dt);

  if (state.phase === 'title' || state.phase === 'story') cam.yaw += dt * 0.06;

  if (state.phase === 'play') {
    if (state.wandCooldown > 0) state.wandCooldown = Math.max(0, state.wandCooldown - dt);
    ui.setWand(state.wandCooldown > 0 ? 'Recargando…' : 'Lista (F)', state.wandCooldown === 0);

    const prev = state.target;
    state.target = pickTarget();
    if (prev && prev !== state.target) prev.targeted = false;
    if (state.target) state.target.targeted = true;
    ui.scrollInfo(state.target && !busy() ? state.target.data : null);

    state.interact = busy() ? null : nearestInteractable();
    for (const c of world.crystals) c.focus = state.interact?.crystal === c;
    ui.prompt(state.interact ? state.interact.prompt() : null);

    if (!state.phishingTriggered && !busy() && Math.hypot(player.pos.x - world.scrollZone.x, player.pos.z - world.scrollZone.z) < 7.2) {
      state.phishingTriggered = true;
      runFlow(() => teach('phishing'));
    }
    if (state.doorOpen && !state.finished && player.pos.z < ROOM.salida) finish();
  }

  updateCamera(dt);
}

document.getElementById('loading').classList.add('hidden');
document.getElementById('screen-title').classList.remove('hidden');
requestAnimationFrame(frame);

// acceso para depuración desde la consola: __torre.step(n) avanza n fotogramas
// aunque la pestaña esté en segundo plano
let simT = 0;
window.__torre = {
  state, player, world, cam, ui, keys,
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
