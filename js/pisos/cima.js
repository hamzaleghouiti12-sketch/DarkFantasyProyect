// La Cima · El Trono de Morvath (realidad virtual y aumentada, criterio 4.5, y el duelo final).
//   1. El visor de realidades: configurar una escena de RA que revela los puntos débiles.
//   2. El duelo: Morvath (el modelo del mago con la paleta negra y carmesí de
//      herramientas/paleta_morvath.py) y cinco escudos, uno por bloque del currículo:
//      binario, bulos, malware, algoritmos (el autómata) e IA. Sin castigo: si se falla,
//      se vuelve a intentar. En equipo, cada jugador hace su duelo en su pantalla.
//   3. El final: Morvath se rinde, Aldric sale de la jaula y la partida termina con créditos.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import C from '../contenido/cima.js';
import { cargarModelo, cargarPaleta, aplicarPaleta, ajustarAltura, ocultar, Animador, cargarPiezas, colocador } from '../modelos.js';
import { makeLabel, glowTexture } from '../textures.js';
import { serieDePreguntas } from './comun.js';
import { abrirAutomata } from '../mecanicas/automataVista.js';

export const ORIGEN = new THREE.Vector3(0, 0, -9100);
const P = 'cima';
const RADIO = 15; // la azotea es un círculo
const std = (o) => new THREE.MeshStandardMaterial(o);

export async function construir(ctx) {
  const { ui, sonido, fx, estado } = ctx;
  const ox = ORIGEN.x, oz = ORIGEN.z;
  const grupo = new THREE.Group();
  grupo.position.copy(ORIGEN);
  ctx.escena.add(grupo);
  const colliders = [];
  const obstaculo = (x, z, r) => colliders.push({ x: ox + x, z: oz + z, r });
  const aMundo = (x, y, z) => new THREE.Vector3(ox + x, y, oz + z);
  const est = { realidad: false, visor: { paso: 0 }, fase: 0, vencido: false, final: false };
  const aprendido = (id) => estado.learned.has(id);

  // ---------- La azotea: suelo de piedra, almenas, luna y estrellas ----------
  const piedra = std({ color: 0x4a4450, roughness: 0.95 });
  const suelo = new THREE.Mesh(new THREE.CylinderGeometry(RADIO + 0.6, RADIO + 1.2, 1, 48), piedra);
  suelo.position.y = -0.5;
  suelo.receiveShadow = true;
  grupo.add(suelo);
  const losas = new THREE.Mesh(new THREE.RingGeometry(3, 3.2, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 0.15, 0.25) }));
  losas.rotation.x = -Math.PI / 2;
  losas.position.set(0, 0.02, -8);
  grupo.add(losas);
  const almenas = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    if (Math.abs(Math.sin(a) - 1) < 0.02 && Math.cos(a) > -0.2 && Math.cos(a) < 0.2) continue;
    const alto = i % 2 ? 1.6 : 1.0;
    almenas.push(new THREE.BoxGeometry(1.4, alto, 0.9).rotateY(-a).translate(Math.cos(a) * (RADIO + 0.3), alto / 2, Math.sin(a) * (RADIO + 0.3)));
  }
  const muro = new THREE.Mesh(mergeGeometries(almenas), piedra);
  muro.castShadow = muro.receiveShadow = true;
  grupo.add(muro);
  const luna = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xf2e6ff, fog: false, depthWrite: false }));
  luna.scale.setScalar(70);
  luna.position.set(-30, 45, -90);
  grupo.add(luna);
  const n = 700, pts = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, b = Math.random() * 0.9 + 0.1;
    pts.set([Math.cos(a) * Math.cos(b) * 140, Math.sin(b) * 140, Math.sin(a) * Math.cos(b) * 140], i * 3);
  }
  const cielo = new THREE.BufferGeometry();
  cielo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
  grupo.add(new THREE.Points(cielo, new THREE.PointsMaterial({ color: 0xd8dcff, size: 1.3, sizeAttenuation: false, fog: false })));

  // ---------- El trono (norte) ----------
  const TRONO = { x: 0, z: -11 };
  const trono = new THREE.Group();
  const respaldo = new THREE.Mesh(new THREE.BoxGeometry(2.4, 4.2, 0.6), std({ color: 0x2a2030, roughness: 0.8 }));
  respaldo.position.set(0, 2.1, -0.6);
  const asiento = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1, 1.6), std({ color: 0x2a2030, roughness: 0.8 }));
  asiento.position.y = 0.5;
  const gema = new THREE.Mesh(new THREE.OctahedronGeometry(0.35), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 0.3, 0.5) }));
  gema.position.set(0, 3.8, -0.25);
  trono.add(respaldo, asiento, gema);
  trono.position.set(TRONO.x, 0, TRONO.z);
  grupo.add(trono);
  obstaculo(TRONO.x, TRONO.z - 0.2, 1.4);

  // ---------- Morvath ----------
  const MORV = { x: 0, z: -8.6 };
  let morvath = null;
  try {
    const [gltf, paleta] = await Promise.all([cargarModelo('assets/modelos/aldric.glb'), cargarPaleta('assets/texturas/paleta_morvath.png')]);
    const m = gltf.scene;
    ocultar(m, ['Spellbook']);
    aplicarPaleta(m, paleta);
    ajustarAltura(m, 2.7);
    const g = new THREE.Group();
    g.add(m);
    g.position.set(MORV.x, 0, MORV.z);
    grupo.add(g);
    morvath = { g, anim: new Animador(m, gltf.animations) };
    morvath.anim.bucle('Idle');
  } catch (e) { console.warn('Morvath sin modelo', e); }
  obstaculo(MORV.x, MORV.z, 0.8);
  const aura = new THREE.PointLight(0xff2a4a, 10, 9, 1.4);
  aura.position.set(MORV.x, 2.5, MORV.z + 0.8);
  grupo.add(aura);
  const corona = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.04, 8, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 0.3, 0.5) }));
  corona.rotation.x = Math.PI / 2;
  grupo.add(corona);
  // cinco escudos que orbitan y tres runas de puntos débiles (visibles con el visor)
  const matEscudo = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 0.35, 0.7), transparent: true, opacity: 0.85 });
  const escudos = Array.from({ length: 5 }, () => { const e = new THREE.Mesh(new THREE.OctahedronGeometry(0.28), matEscudo); grupo.add(e); return e; });
  const runas = [0, 1, 2].map(() => {
    const r = makeLabel('✦', { height: 0.4, fontSize: 60, color: '#9fe6ff', bg: 'rgba(0,0,0,0)', border: 'rgba(0,0,0,0)' });
    r.visible = false;
    grupo.add(r);
    return r;
  });

  // ---------- La jaula de Aldric (este) ----------
  const JAULA = { x: 9, z: -5 };
  let aldric = null;
  try {
    const gltf = await cargarModelo('assets/modelos/aldric.glb');
    const m = gltf.scene;
    ocultar(m, ['Spellbook', 'Spellbook_open']);
    if (ctx.paletas.mago) aplicarPaleta(m, ctx.paletas.mago);
    ajustarAltura(m, 2.0);
    const g = new THREE.Group();
    g.add(m);
    g.position.set(JAULA.x, 0, JAULA.z);
    g.rotation.y = -Math.PI / 2 - 0.4;
    grupo.add(g);
    aldric = { g, anim: new Animador(m, gltf.animations) };
    aldric.anim.bucle('Sit_Floor_Idle');
  } catch (e) { console.warn('Aldric sin modelo', e); }
  const barrotes = [];
  const hierro = std({ color: 0x3a3a44, metalness: 0.8, roughness: 0.4 });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3, 6), hierro);
    b.position.set(JAULA.x + Math.cos(a) * 1.3, 1.5, JAULA.z + Math.sin(a) * 1.3);
    grupo.add(b);
    barrotes.push(b);
  }
  const tapa = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, 0.15, 24), hierro);
  tapa.position.set(JAULA.x, 3.05, JAULA.z);
  grupo.add(tapa);
  obstaculo(JAULA.x, JAULA.z, 1.6);

  // ---------- El visor de realidades (oeste) ----------
  const VISOR = { x: -8.5, z: -4 };
  try {
    const p = await cargarPiezas('assets/modelos/mazmorra', ['column'], ctx.paletas.mazmorra);
    colocador(grupo, p)('column', VISOR.x, 0, VISOR.z);
  } catch { /* sin columna */ }
  const lente = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.06, 10, 32), std({ color: 0xd4af6a, metalness: 0.9, roughness: 0.3 }));
  const cristal = new THREE.Mesh(new THREE.CircleGeometry(0.38, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.4, 1.4, 1.8), transparent: true, opacity: 0.5 }));
  lente.add(cristal);
  lente.position.set(VISOR.x, 2.3, VISOR.z);
  lente.rotation.y = Math.PI / 2;
  grupo.add(lente);
  obstaculo(VISOR.x, VISOR.z, 0.5);
  const rotulos = {};
  for (const [t, x, z, y] of [['El visor de realidades', VISOR.x, VISOR.z, 3.2], ['Morvath', MORV.x, MORV.z, 3.6]]) {
    const l = makeLabel(t, { height: 0.34, fontSize: 40, font: 'Cinzel, serif', color: t === 'Morvath' ? '#ff9aaa' : '#cfe0ff' });
    l.position.set(x, y, z);
    grupo.add(l);
    rotulos[t] = l;
  }

  // ---------- El visor (sello de la cima) ----------
  async function hacerVisor() {
    if (await serieDePreguntas(ctx, C.visor, 'El visor de realidades', est.visor)) ctx.accion('mec', { piso: P, mec: 'realidad', paso: 'sello' });
  }

  // ---------- El duelo ----------
  function romperEscudo(i) {
    const e = escudos[i];
    fx.big.emit(e.position.clone().add(ORIGEN), { count: 60, color: 0xff5a8a, intensity: 2.4, speed: 3.5, life: 1, gravity: -2 });
    sonido.cristalRoto();
    ctx.sacudir(0.35);
    e.visible = false;
    morvath?.anim.unaVezSolo('Hit_A');
  }
  async function duelo() {
    const m = aMundo(MORV.x, 0, MORV.z);
    await ctx.mostrar?.(new THREE.Vector3(m.x + 2.4, 2.2, m.z + 6), new THREE.Vector3(m.x, 2.2, m.z), 2.4);
    if (est.fase === 0) await ui.dialogue(C.jefe.aparicion, 'Morvath');
    morvath?.anim.bucle('Spellcasting');
    let burla = 0;
    while (est.fase < C.jefe.fases.length) {
      const f = C.jefe.fases[est.fase];
      await ui.dialogue([f.ataque], f.ataque.startsWith('Morvath') ? 'Morvath' : 'La Cima');
      let ok;
      if (f.automata) {
        ok = Boolean(await abrirAutomata(ui, f.automata, { programa: f.automata.programa, cabecera: `${f.escudo} · escudo ${est.fase + 1} de 5`, alResultado: (r) => { ctx.record(r, '4.2'); r ? sonido.acierto() : sonido.fallo(); } }));
        if (!ok) { morvath?.anim.bucle('Idle'); return; } // ha cerrado el editor: puede volver cuando quiera
      } else {
        ok = await ui.quiz(f.pregunta, `${f.escudo} · escudo ${est.fase + 1} de 5`);
        ctx.record(ok, f.pregunta.criterio);
      }
      if (ok) {
        romperEscudo(est.fase);
        ui.toast(`✦ ${C.jefe.acierto[est.fase]}`, 'seal', 2500);
        est.fase++;
        ctx.refrescarObjetivos();
      } else await ui.dialogue([C.jefe.burlas[burla++ % C.jefe.burlas.length]], 'Morvath');
    }
    await ui.dialogue(C.jefe.derrota, 'Morvath');
    ctx.addSaber(100);
    ctx.celebrar();
    ctx.accion('mec', { piso: P, mec: 'jefe', paso: 'vencido' });
  }

  // ---------- El final: Morvath se rinde y Aldric queda libre ----------
  let abriendo = 0;
  async function finalBatalla(soyAutor) {
    if (est.final) return;
    est.final = true;
    est.vencido = true;
    morvath?.anim.unaVezSolo('Hit_B');
    setTimeout(() => morvath?.anim.bucle('Sit_Floor_Idle'), 900);
    aura.color.set(0x8a6aff);
    corona.visible = false;
    rotulos.Morvath.visible = false;
    runas.forEach((r) => { r.visible = false; });
    abriendo = 0.001; // los barrotes se hunden
    sonido.puerta();
    const j = aMundo(JAULA.x, 0, JAULA.z);
    await ctx.mostrar?.(new THREE.Vector3(j.x - 4, 2.4, j.z + 4.5), new THREE.Vector3(j.x, 1.4, j.z), 2.6);
    if (aldric) {
      aldric.anim.unaVezSolo('Sit_Floor_StandUp');
      setTimeout(() => { aldric.anim.bucle('Idle'); aldric.g.rotation.y = Math.atan2(MORV.x - JAULA.x, MORV.z - JAULA.z); }, 1200);
    }
    sonido.ambientar('parque'); // la música de casa: el portal está listo
    await ui.dialogue(C.jefe.final, 'Aldric');
    if (soyAutor) ctx.accion('fin', { piso: P });
  }

  const zona = {
    id: P, nombre: C.nombre, grupo, colliders, musica: 'cima', pisada: 'piedra', sinHolograma: true, // Aldric está aquí de verdad
    camDist: 7, lejos: 260,
    // durante el duelo, Morvath acusa cada acierto y se crece con cada fallo
    alResponder(ok) {
      if (!morvath || est.vencido || est.fase === 0) return;
      const m = aMundo(MORV.x, 1.8, MORV.z);
      if (ok) {
        morvath.anim.unaVezSolo('Hit_B');
        fx.big.emit(m, { count: 40, color: 0xffd27a, intensity: 2.2, speed: 3, life: 0.8, gravity: -1 });
      } else {
        fx.big.emit(m, { count: 30, color: 0xb06bff, intensity: 2, speed: 1.6, up: 1.2, life: 1.1 });
      }
    },
    niebla: { color: 0x120a1c, densidad: 0.012 }, luz: { luna: 2.4, cielo: 1.1 },
    entrada: { pos: aMundo(0, 0, 12), mirada: Math.PI, yaw: 0 },
    suelo: (p) => (Math.hypot(p.x - ox, p.z - oz) < RADIO + 0.5 ? 0 : -200),
    limitar(p) {
      const dx = p.x - ox, dz = p.z - oz, d = Math.hypot(dx, dz);
      if (d > RADIO - 0.8) { p.x = ox + (dx / d) * (RADIO - 0.8); p.z = oz + (dz / d) * (RADIO - 0.8); }
    },
    limitarCamara(c) { c.y = Math.max(0.8, c.y); },
  };
  const interactuables = [
    {
      zona, pos: aMundo(VISOR.x + 1.4, 0, VISOR.z), r: 2.3,
      enabled: () => !est.realidad,
      prompt: () => (aprendido('realidad') ? '**E** · Configurar el visor de realidades' : '**E** · Mirar por el visor'),
      action: () => (aprendido('realidad') ? hacerVisor() : ctx.accion('leccion', { id: 'realidad', piso: P, luego: 'visorCima' })),
    },
    {
      zona, pos: aMundo(MORV.x, 0, MORV.z + 2.4), r: 2.6,
      enabled: () => est.realidad && !est.vencido,
      prompt: () => (est.fase ? `**E** · Seguir el duelo con Morvath (${est.fase}/5 escudos)` : '**E** · Enfrentarse a **Morvath**'),
      action: duelo,
    },
  ];

  const validar = (d) => (d.mec === 'realidad' ? !est.realidad : d.mec === 'jefe' ? !est.final : false);
  const clave = (d) => `mec:${P}:${d.mec}:${d.paso}`;
  function aplicar(d, soyAutor) {
    if (d.mec === 'realidad') {
      est.realidad = true;
      cristal.material.color.setRGB(0.6, 2.2, 2.6);
      rotulos['El visor de realidades'].visible = false;
      runas.forEach((r) => { r.visible = true; });
      sonido.sello();
      ctx.addSaber(25);
      ctx.runFlow(() => ui.dialogue([C.visorHecho]));
    }
    if (d.mec === 'jefe') ctx.runFlow(() => finalBatalla(soyAutor));
    ctx.refrescarObjetivos();
  }

  Object.assign(zona, {
    actualizar(dt, t) {
      morvath?.anim.update(dt);
      aldric?.anim.update(dt);
      gema.rotation.y += dt;
      const base = aMundo(MORV.x, 0, MORV.z).sub(ORIGEN);
      corona.position.set(base.x, 3.0 + Math.sin(t * 2) * 0.06, base.z);
      aura.intensity = est.vencido ? 4 : 10 * (0.8 + Math.sin(t * 7) * 0.2);
      escudos.forEach((e, i) => {
        const a = t * 0.8 + (i / 5) * Math.PI * 2;
        e.position.set(base.x + Math.cos(a) * 1.9, 1.9 + Math.sin(t * 2 + i) * 0.3, base.z + Math.sin(a) * 1.9);
        e.rotation.y += dt * 2;
      });
      runas.forEach((r, i) => r.position.set(base.x + [-0.5, 0.5, 0][i], [1.4, 1.4, 2.4][i] + Math.sin(t * 3 + i) * 0.05, base.z + 0.6));
      if (abriendo > 0 && abriendo < 1) {
        abriendo = Math.min(1, abriendo + dt * 0.5);
        barrotes.forEach((b) => { b.position.y = 1.5 - abriendo * 3.1; });
        tapa.position.y = 3.05 + abriendo * 2;
        if (abriendo >= 1) { colliders.splice(colliders.findIndex((c) => c.x === ox + JAULA.x), 1); }
        if (abriendo > 0.4) tapa.visible = false;
      }
      if (!est.vencido && Math.random() < dt * 6) fx.small.emit(aMundo(MORV.x + (Math.random() - 0.5), 0.2, MORV.z + (Math.random() - 0.5)), { count: 1, color: 0xff3a5a, intensity: 1.5, speed: 0.6, up: 1.2, life: 1.2 });
    },
    objetivos() {
      const items = [
        { text: 'Configura el visor de realidades', done: est.realidad },
        { text: `Rompe los escudos de Morvath (${est.fase}/5)`, done: est.vencido },
      ];
      if (est.vencido) items.push({ text: 'Escucha a Aldric', done: false });
      return items;
    },
    pista: () => (est.realidad ? C.pistas.jefe : C.pistas.visor),
    destino: () => (est.vencido ? null : est.realidad ? aMundo(MORV.x, 0, MORV.z + 2.4) : aMundo(VISOR.x + 1.4, 0, VISOR.z)),
  });
  grupo.visible = false;

  return {
    id: P, zona, interactuables, contenido: C, estado: est,
    validar, clave, aplicar, jugadorFuera() {},
    async alAprender(id, soyAutor, luego) {
      if (soyAutor && luego === 'visorCima') await hacerVisor();
    },
    intro: () => ui.dialogue(C.intro),
  };
}
