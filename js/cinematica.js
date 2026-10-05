// Cinemáticas: escenas dirigidas con cámara, actores animados y subtítulos.
// La de inicio cuenta cómo llegan los cuatro amigos a Umbravel: un parque al
// atardecer, un portal que se los traga y Aldric (el de verdad, no el holograma)
// que los recibe furioso… y después curioso. Se puede saltar con Esc.
//
// Mientras una cinemática está activa, main.js le cede la cámara (cine.activa)
// y solo llama a cine.update(dt, t).
import * as THREE from 'three';
import { cargarModelo, cargarPaleta, cargarPiezas, colocador, aplicarPaleta, ajustarAltura, ocultar, Animador } from './modelos.js';
import { cargarPersonaje, instanciar } from './personajes.js';
import { runeCircleCanvas, glowTexture } from './textures.js';
import { CINE_INICIO as G, CINE_TORRE } from './content.js';

const suave = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const PARQUE = new THREE.Vector3(800, 0, 0); // lejos de todo lo demás
const PALETA_CLARA = { encapuchado: 'paleta_picaro', picaro: 'paleta_picaro', caballero: 'paleta_caballero', barbaro: 'paleta_barbaro' };
const ORDEN = ['encapuchado', 'picaro', 'caballero', 'barbaro'];

// ctx: { escena, camara, sonido, fx, ui, luna, cielo, casa, ponerZona(z), paletaMago }
export function crearCine(ctx) {
  const { escena, camara, sonido, fx, ui, luna, cielo } = ctx;

  // ---------- Interfaz: bandas negras, subtítulos, rótulos y "Saltar" ----------
  const capa = document.createElement('div');
  capa.id = 'cine';
  capa.className = 'hidden';
  capa.innerHTML = `<div class="cine-banda arriba"></div><div class="cine-banda abajo"></div>
    <div class="cine-sub hidden" aria-live="polite"><b class="cine-quien"></b><span class="cine-texto"></span></div>
    <div class="cine-rotulo hidden"></div>
    <button class="cine-saltar">Saltar · Esc</button>`;
  document.body.appendChild(capa);
  const sub = capa.querySelector('.cine-sub'), quien = capa.querySelector('.cine-quien'), texto = capa.querySelector('.cine-texto');
  const rotulo = capa.querySelector('.cine-rotulo');

  const cine = { activa: false };
  let saltando = false, avanzar = null;
  const pendientes = new Set();
  // espera que se corta al saltar la cinemática
  const esperar = (ms) => (saltando ? Promise.resolve() : new Promise((ok) => {
    const fin = () => { clearTimeout(reloj); pendientes.delete(fin); ok(); };
    const reloj = setTimeout(fin, ms);
    pendientes.add(fin);
  }));
  function saltar() {
    if (saltando || !cine.activa) return;
    saltando = true;
    ui.fundido(true);
    for (const fin of [...pendientes]) fin();
    avanzar?.();
  }
  capa.querySelector('.cine-saltar').onclick = saltar;
  // fundidos a negro; al saltar, se queda en negro sin esperar
  const fundir = (negro) => (saltando ? Promise.resolve() : ui.fundido(negro));
  // un subtítulo: se queda el tiempo de leerlo o hasta un clic / E / Espacio
  async function decir(nombre, frase) {
    if (saltando) return;
    quien.textContent = nombre;
    texto.textContent = frase;
    sub.classList.remove('hidden');
    sub.classList.toggle('mago', nombre === 'Aldric');
    await Promise.race([esperar(1600 + frase.length * 55), new Promise((ok) => { avanzar = ok; })]);
    avanzar = null;
    sub.classList.add('hidden');
  }
  async function decirTodo(lineas, entre = 150) {
    for (const [n, f] of lineas) { await decir(n, f); await esperar(entre); }
  }
  async function cartel(t, ms = 2600) {
    if (saltando) return;
    rotulo.textContent = t;
    rotulo.classList.remove('hidden');
    await Promise.race([esperar(ms), new Promise((ok) => { avanzar = ok; })]);
    avanzar = null;
    rotulo.classList.add('hidden');
  }
  // teclas: Esc salta; E, Espacio o Enter pasan el subtítulo
  cine.tecla = (e) => {
    if (!cine.activa) return false;
    if (e.code === 'Escape') saltar();
    else if (['KeyE', 'Space', 'Enter'].includes(e.code)) avanzar?.();
    return true;
  };
  capa.addEventListener('click', (e) => { if (!e.target.closest('.cine-saltar')) avanzar?.(); });

  // ---------- Cámara: planos con movimiento suave ----------
  const plano = { desde: new THREE.Vector3(), hasta: new THREE.Vector3(), mirarDe: new THREE.Vector3(), mirarA: new THREE.Vector3(), dur: 1, t: 0, temblor: 0 };
  const mirar = new THREE.Vector3();
  function encuadre(desde, hasta, mirarDe, mirarA = mirarDe, dur = 3) {
    plano.desde.copy(desde);
    plano.hasta.copy(hasta);
    plano.mirarDe.copy(mirarDe);
    plano.mirarA.copy(mirarA);
    plano.dur = dur;
    plano.t = 0;
  }
  const foco = new THREE.Vector3();
  // luz de relleno que sigue a lo que se encuadra (como un foco de rodaje)
  const relleno = new THREE.PointLight(0xffc890, 0, 9, 1.6);

  // ---------- Actores ----------
  const actores = [];
  const objetos = []; // todo lo creado para la cinemática (se quita al final)
  function actor(modelo, clips) {
    const g = new THREE.Group();
    g.add(modelo);
    escena.add(g);
    const a = { g, modelo, anim: new Animador(modelo, clips), mov: null };
    a.anim.bucle('Idle');
    a.mirarHacia = (x, z) => { g.rotation.y = Math.atan2(x - g.position.x, z - g.position.z); };
    // ir de un punto a otro en `dur` segundos (con su animación de andar)
    a.ir = (x, z, dur, andar = 'Walking_A') => {
      a.mirarHacia(x, z);
      a.anim.bucle(andar);
      a.mov = { de: g.position.clone(), a: new THREE.Vector3(x, g.position.y, z), dur, t: 0, alFinal: () => a.anim.bucle('Idle') };
    };
    actores.push(a);
    objetos.push(g);
    return a;
  }

  cine.update = (dt, t) => {
    // cámara
    plano.t = Math.min(plano.dur, plano.t + dt);
    const k = suave(plano.t / plano.dur);
    camara.position.lerpVectors(plano.desde, plano.hasta, k);
    mirar.lerpVectors(plano.mirarDe, plano.mirarA, k);
    if (plano.temblor > 0) {
      camara.position.x += (Math.random() - 0.5) * plano.temblor;
      camara.position.y += (Math.random() - 0.5) * plano.temblor;
      plano.temblor = Math.max(0, plano.temblor - dt * 0.4);
    }
    camara.lookAt(mirar);
    // la luna (y sus sombras) siguen a lo que se mira
    foco.copy(mirar);
    luna.position.set(foco.x - 14, 24, foco.z + 8);
    luna.target.position.copy(foco);
    relleno.position.set(foco.x + (camara.position.x - foco.x) * 0.5, foco.y + 1.6, foco.z + (camara.position.z - foco.z) * 0.5);
    for (const a of actores) {
      a.anim.update(dt);
      if (a.mov) {
        a.mov.t = Math.min(a.mov.dur, a.mov.t + dt);
        a.g.position.lerpVectors(a.mov.de, a.mov.a, a.mov.t / a.mov.dur);
        if (a.mov.t >= a.mov.dur) { const fin = a.mov.alFinal; a.mov = null; fin?.(); }
      }
      a.vuelo?.(dt);
    }
    for (const f of animaciones) f(dt, t);
  };
  const animaciones = new Set();

  // ---------- El parque (se construye la primera vez) ----------
  async function montarParque() {
    const grupo = new THREE.Group();
    grupo.position.copy(PARQUE);
    escena.add(grupo);
    objetos.push(grupo);
    const suelo = new THREE.Mesh(new THREE.CircleGeometry(40, 48), new THREE.MeshStandardMaterial({ color: 0x6f9a48, roughness: 1 }));
    suelo.rotation.x = -Math.PI / 2;
    suelo.receiveShadow = true;
    grupo.add(suelo);
    const camino = new THREE.Mesh(new THREE.PlaneGeometry(3, 60), new THREE.MeshStandardMaterial({ color: 0xc9a77a, roughness: 1 }));
    camino.rotation.x = -Math.PI / 2;
    camino.position.set(-6, 0.01, 0);
    camino.receiveShadow = true;
    grupo.add(camino);
    try {
      const [medieval, halloween] = await Promise.all(['assets/texturas/paleta_medieval.png', 'assets/texturas/paleta_halloween.png'].map(cargarPaleta));
      const [pm, ph] = await Promise.all([
        cargarPiezas('assets/modelos/exterior', ['trees_A_large', 'trees_B_large', 'rock_single_A', 'hills_A_trees'], medieval, 'gltf'),
        cargarPiezas('assets/modelos/exterior', ['bench', 'post_lantern', 'fence'], halloween, 'gltf'),
      ]);
      const poner = colocador(grupo, { ...pm, ...ph });
      for (const [n, x, z, r, e] of [
        ['trees_A_large', 9, -8, 0.3, 1.6], ['trees_B_large', -12, -10, 1, 1.5], ['trees_A_large', 12, 9, 2, 1.4], ['trees_B_large', -14, 8, 0.5, 1.7],
        ['trees_A_large', 2, -16, 1.2, 1.8], ['hills_A_trees', 0, -30, 0, 3], ['hills_A_trees', 26, -6, 1.5, 3], ['rock_single_A', 4.5, 3.5, 0.4, 1],
      ]) poner(n, x, 0, z, r, e);
      poner('bench', -4, 0, -1.5, Math.PI / 2, 1.1);
      poner('bench', -4, 0, 2.5, Math.PI / 2, 1.1);
      poner('post_lantern', -4.6, 0, 6, 0, 1);
      for (let i = -3; i <= 3; i++) poner('fence', 14, 0, i * 2.2, Math.PI / 2, 1);
    } catch (e) { console.warn('Parque sin decorado', e); }
    return grupo;
  }

  async function amigos(paletaClara) {
    const lista = [];
    for (const id of ORDEN) {
      const pl = await cargarPersonaje(id);
      const m = instanciar(pl);
      // en nuestro mundo no llevan armas ni varita
      for (const n of ['handslotr', 'handslotl']) m.getObjectByName(n)?.children.forEach((c) => { c.visible = false; });
      const a = actor(m, pl.clips);
      a.id = id;
      a.nombre = G.amigos[id];
      a.paletaOscura = null;
      m.traverse((o) => { if (o.isMesh && !a.paletaOscura) a.paletaOscura = o.material.map; });
      if (paletaClara[id]) m.traverse((o) => { if (o.isMesh && o.name !== 'punta') { o.material.map = paletaClara[id]; o.material.needsUpdate = true; } });
      lista.push(a);
    }
    return lista;
  }
  const oscurecer = (a) => a.modelo.traverse((o) => { if (o.isMesh && o.name !== 'punta' && a.paletaOscura) { o.material.map = a.paletaOscura; o.material.needsUpdate = true; } });

  async function aldricReal() {
    const gltf = await cargarModelo('assets/modelos/aldric.glb');
    const m = gltf.scene;
    ocultar(m, ['Spellbook', 'Spellbook_open']);
    if (ctx.paletaMago) aplicarPaleta(m, ctx.paletaMago);
    ajustarAltura(m, 2.0);
    return actor(m, gltf.animations);
  }

  // ---------- El portal bajo sus pies ----------
  function crearPortal(centro) {
    const g = new THREE.Group();
    g.position.copy(centro);
    const tex = new THREE.CanvasTexture(runeCircleCanvas());
    const disco = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    disco.material.color.setRGB(2.2, 0.9, 4);
    disco.rotation.x = -Math.PI / 2;
    disco.position.y = 0.03;
    const halo = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ map: glowTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.9 }));
    halo.material.color.setRGB(1.6, 0.6, 3.2);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.05;
    const luz = new THREE.PointLight(0xa060ff, 0, 14, 1.4);
    luz.position.y = 1;
    g.add(disco, halo, luz);
    g.scale.setScalar(0.01);
    escena.add(g);
    objetos.push(g);
    const p = { g, radio: 0.01, objetivo: 0.01 };
    animaciones.add((dt) => {
      p.radio += (p.objetivo - p.radio) * Math.min(1, dt * 1.6);
      g.scale.setScalar(Math.max(0.01, p.radio));
      disco.rotation.z += dt * (1 + p.radio);
      halo.material.opacity = 0.6 + Math.sin(performance.now() / 120) * 0.25;
      luz.intensity = p.radio * 9;
      if (Math.random() < dt * 30 * p.radio) {
        const a = Math.random() * Math.PI * 2, r = Math.random() * p.radio;
        fx.small.emit(new THREE.Vector3(centro.x + Math.cos(a) * r, 0.1, centro.z + Math.sin(a) * r), { count: 1, color: 0xc08cff, intensity: 2, speed: 1.2, life: 0.9, dir: new THREE.Vector3(0, 1, 0) });
      }
    });
    return p;
  }

  // los chicos giran y se hunden en el portal
  function tragar(a, centro, retraso) {
    const ini = a.g.position.clone();
    let t = -retraso;
    a.vuelo = (dt) => {
      t += dt;
      if (t < 0) return;
      const k = Math.min(1, t / 1.3);
      a.g.position.set(ini.x + (centro.x - ini.x) * k, -2.2 * k * k, ini.z + (centro.z - ini.z) * k);
      a.g.rotation.y += dt * (4 + 14 * k);
      a.g.scale.setScalar(Math.max(0.05, 1 - k * 0.8));
      if (k >= 1) { a.g.visible = false; a.vuelo = null; }
    };
  }

  // salen despedidos del portal de la casa y caen al suelo
  function escupir(a, de, a2, retraso) {
    let t = -retraso;
    a.g.visible = false;
    a.vuelo = (dt) => {
      t += dt;
      if (t < 0) return;
      if (!a.g.visible) { a.g.visible = true; a.anim.bucle('Jump_Idle'); sonido.salto?.(); }
      const k = Math.min(1, t / 0.7);
      a.g.position.set(de.x + (a2.x - de.x) * k, de.y * (1 - k) + Math.sin(k * Math.PI) * 1.2, de.z + (a2.z - de.z) * k);
      a.g.rotation.x = Math.sin(k * Math.PI) * 1.2;
      if (k >= 1) {
        a.g.rotation.x = 0;
        a.vuelo = null;
        a.anim.bucle('Lie_Idle');
        sonido.aterrizaje?.();
        fx.big.emit(a.g.position.clone().setY(0.2), { count: 18, color: 0xb59a7a, intensity: 0.8, speed: 1.6, life: 0.6, gravity: 4 });
      }
    };
  }

  // ---------- La cinemática de inicio ----------
  cine.inicio = async () => {
    cine.activa = true;
    saltando = false;
    document.body.classList.add('en-cine');
    escena.add(relleno);
    relleno.intensity = 0;
    capa.classList.remove('hidden');
    const restaurar = { luz: luna.color.getHex(), lunaI: luna.intensity, cieloC: cielo.color.getHex(), cieloS: cielo.groundColor.getHex(), cieloI: cielo.intensity };
    let parque = null;
    try {
      const clara = {};
      const [, aldric, ...pal] = await Promise.all([
        montarParque().then((g) => { parque = g; }),
        aldricReal(),
        ...ORDEN.map((id) => cargarPaleta(`assets/texturas/${PALETA_CLARA[id]}.png`).catch(() => null)),
      ]);
      ORDEN.forEach((id, i) => { clara[id] = pal[i]; });
      const chicos = await amigos(clara);
      aldric.g.visible = false;

      // ===== 1. El parque al atardecer =====
      ctx.ponerZona({ id: 'parque', grupo: parque, niebla: { color: 0xe8a77a, densidad: 0.012 }, luz: { luna: 2.4, cielo: 1.4 }, musica: 'parque', nombre: '', camDist: 5, lejos: 160 });
      parque.visible = true;
      luna.color.setHex(0xffc28a);
      cielo.color.setHex(0xffd9b0);
      cielo.groundColor.setHex(0x4a3a2a);
      const P = PARQUE;
      const sitios = [[-1.1, -0.6], [1.0, -0.8], [0.9, 1.0], [-1.0, 0.9]];
      chicos.forEach((a, i) => {
        a.g.position.set(P.x + sitios[i][0], 0, P.z + sitios[i][1]);
        a.mirarHacia(P.x, P.z);
        a.anim.bucle(i % 2 ? 'Sit_Floor_Idle' : 'Idle');
      });
      encuadre(new THREE.Vector3(P.x + 8, 3.6, P.z + 8), new THREE.Vector3(P.x + 3.2, 1.7, P.z + 3.6), new THREE.Vector3(P.x, 1, P.z), new THREE.Vector3(P.x, 0.9, P.z), 6);
      await fundir(false);
      await esperar(1800);
      for (const [n, f] of G.parque) {
        const a = chicos.find((c) => c.nombre === n);
        a?.anim.unaVezSolo('Interact');
        await decir(n, f);
      }

      // ===== 2. El portal =====
      sonido.teletransporte();
      const portal = crearPortal(new THREE.Vector3(P.x, 0, P.z));
      portal.objetivo = 1.2;
      plano.temblor = 0.15;
      encuadre(camara.position.clone(), new THREE.Vector3(P.x + 2.8, 3.4, P.z + 2.8), new THREE.Vector3(P.x, 0.8, P.z), new THREE.Vector3(P.x, 0.2, P.z), 2.5);
      chicos.forEach((a, i) => { if (i % 2) a.anim.unaVezSolo('Sit_Floor_StandUp'); else a.anim.unaVezSolo('Hit_B'); });
      await esperar(900);
      chicos.forEach((a) => a.anim.bucle('Idle'));
      portal.objetivo = 2.8;
      plano.temblor = 0.3;
      await decirTodo(G.portal, 50);
      sonido.cristalRoto?.();
      chicos.forEach((a, i) => { a.anim.bucle('Jump_Idle'); tragar(a, P, i * 0.18); });
      encuadre(camara.position.clone(), new THREE.Vector3(P.x + 0.5, 7, P.z + 0.6), new THREE.Vector3(P.x, 0, P.z), new THREE.Vector3(P.x, -1, P.z), 1.8);
      await esperar(1900);

      // ===== 3. El túnel =====
      await fundir(true);
      parque.visible = false;
      portal.g.visible = false;
      const tunel = crearTunel(new THREE.Vector3(P.x, 60, P.z));
      chicos.forEach((a, i) => {
        a.g.visible = true;
        a.g.scale.setScalar(1);
        a.g.position.set(P.x + Math.cos(i * 1.6) * 1.2, 60 - 3 - i * 1.4, P.z + Math.sin(i * 1.6) * 1.2);
        a.anim.bucle('Jump_Idle');
        a.vuelo = (dt) => { a.g.rotation.y += dt * 3; a.g.rotation.x += dt * (1 + i * 0.3); };
      });
      encuadre(new THREE.Vector3(P.x, 60 + 6, P.z + 0.01), new THREE.Vector3(P.x, 60 + 2, P.z + 0.01), new THREE.Vector3(P.x, 50, P.z), new THREE.Vector3(P.x, 50, P.z), 2.6);
      await fundir(false);
      await esperar(2400);
      await fundir(true);
      tunel.quitar();

      // ===== 4. La casa de Aldric =====
      luna.color.setHex(restaurar.luz);
      cielo.color.setHex(restaurar.cieloC);
      cielo.groundColor.setHex(restaurar.cieloS);
      ctx.ponerZona(ctx.casa);
      relleno.intensity = 7;
      const C = ctx.casa.portal.centro; // el portal del experimento, en la pared este
      const O = ctx.casa.cristal.pos;   // la mesa del cristal
      chicos.forEach((a) => { a.vuelo = null; a.g.rotation.set(0, 0, 0); a.g.scale.setScalar(1); oscurecer(a); });
      aldric.g.visible = true;
      aldric.g.position.set(O.x - 1.4, 0, O.z + 1.4);
      aldric.mirarHacia(C.x, C.z);
      aldric.anim.bucle('Spellcasting');
      encuadre(new THREE.Vector3(O.x - 3.5, 2.4, O.z + 5), new THREE.Vector3(O.x - 2.5, 2.2, O.z + 4.2), new THREE.Vector3(C.x - 1, 1.6, C.z), new THREE.Vector3(C.x - 1, 1.4, C.z), 5);
      await fundir(false);
      await esperar(900);
      sonido.teletransporte();
      plano.temblor = 0.25;
      const llegadas = [[C.x - 3.2, C.z - 1.6], [C.x - 3.8, C.z - 0.2], [C.x - 3.3, C.z + 1.3], [C.x - 4.4, C.z + 2.4]];
      chicos.forEach((a, i) => {
        a.g.position.set(C.x, C.y, C.z);
        a.mirarHacia(C.x - 10, C.z);
        escupir(a, new THREE.Vector3(C.x - 0.3, C.y, C.z), new THREE.Vector3(llegadas[i][0], 0, llegadas[i][1]), 0.25 + i * 0.3);
      });
      await esperar(600);
      aldric.anim.unaVezSolo('Hit_A');
      await esperar(1600);
      // Aldric, furioso
      encuadre(camara.position.clone(), new THREE.Vector3(O.x + 0.5, 1.35, O.z + 3.5), aldric.g.position.clone().setY(1.3), aldric.g.position.clone().setY(1.25), 1.5);
      aldric.anim.bucle('Idle');
      aldric.mirarHacia(C.x - 3.5, C.z);
      aldric.anim.unaVezSolo('Unarmed_Melee_Attack_Punch_A');
      await decir('Aldric', G.llegada[0][1]);
      aldric.anim.unaVezSolo('Spellcast_Raise');
      plano.temblor = 0.12;
      await decir('Aldric', G.llegada[1][1]);
      // los chicos se levantan, asustados
      chicos.forEach((a, i) => setTimeout(() => { if (!saltando) a.anim.unaVezSolo('Lie_StandUp'); }, i * 200));
      await esperar(400);
      chicos.forEach((a) => { a.anim.bucle('Idle'); a.mirarHacia(aldric.g.position.x, aldric.g.position.z); });
      await decir('Aldric', G.llegada[2][1]);
      // …y curioso: se acerca a mirarlos
      const delante = new THREE.Vector3(C.x - 5.2, 0, C.z + 0.3);
      aldric.ir(delante.x, delante.z, 2.2);
      encuadre(camara.position.clone(), new THREE.Vector3(delante.x + 1.7, 1.55, delante.z - 3.0), aldric.g.position.clone().setY(1.4), new THREE.Vector3(delante.x + 1.0, 1.1, delante.z + 0.3), 2.2);
      await esperar(2300);
      aldric.mirarHacia(C.x - 3.5, C.z);
      aldric.anim.unaVezSolo('Interact');
      chicos[0].anim.unaVezSolo('Dodge_Backward');
      await decir('Aldric', G.llegada[3][1]);
      chicos[2].anim.unaVezSolo('Interact');
      await decir(G.llegada[4][0], G.llegada[4][1]);
      aldric.anim.unaVezSolo('Cheer');
      await decir('Aldric', G.llegada[5][1]);
      chicos[1].anim.unaVezSolo('Interact');
      await decir(G.llegada[6][0], G.llegada[6][1]);
      aldric.anim.unaVezSolo('Interact');
      await decir('Aldric', G.llegada[7][1]);

      // ===== 5. Los días siguientes =====
      await fundir(true);
      await cartel(G.rotuloDias, 2200);
      const mesa = new THREE.Vector3(O.x, 0, O.z);
      const sentados = [[1.0, -1.6, 'Sit_Chair_Idle'], [-1.1, -1.7, 'Sit_Chair_Idle'], [2.2, 0.4, 'Sit_Floor_Idle'], [-2.1, 0.5, 'Sit_Floor_Idle']];
      chicos.forEach((a, i) => {
        const [x, z, an] = sentados[i];
        a.g.position.set(ctx.casa.cristal.pos.x + x - 0.0, 0, ctx.casa.cristal.pos.z + 3 + z);
        a.mirarHacia(mesa.x, mesa.z);
        a.anim.bucle(an);
      });
      aldric.g.position.set(mesa.x + 0.2, 0, mesa.z + 1.6);
      aldric.mirarHacia(mesa.x, mesa.z + 4);
      aldric.anim.bucle('Idle');
      encuadre(new THREE.Vector3(mesa.x + 4.5, 3.4, mesa.z + 6), new THREE.Vector3(mesa.x + 2.8, 3.0, mesa.z + 5.2), new THREE.Vector3(mesa.x, 1.1, mesa.z + 2), new THREE.Vector3(mesa.x, 1.1, mesa.z + 1.6), 9);
      await fundir(false);
      aldric.anim.unaVezSolo('Spellcast_Shoot');
      fx.big.emit(new THREE.Vector3(mesa.x + 0.2, 2.2, mesa.z + 1.6), { count: 50, color: 0x9fe6ff, intensity: 2, speed: 2.5, life: 1.2, gravity: -1 });
      await decir('Aldric', G.dias[0][1]);
      chicos[0].anim.unaVezSolo('Interact');
      await decir(G.dias[1][0], G.dias[1][1]);
      aldric.anim.unaVezSolo('Cheer');
      chicos[3].anim.unaVezSolo('Cheer');
      await decir('Aldric', G.dias[2][1]);

      // ===== 6. La noche: alguien se lleva a Aldric =====
      await fundir(true);
      await cartel(G.rotuloNoche, 1800);
      luna.intensity = 0.25;
      relleno.intensity = 2;
      cielo.intensity = 0.35;
      chicos.forEach((a, i) => {
        a.g.position.set(O.x - 4.6 + (i % 2) * 0.3, 0.55, O.z + 2.8 + (i < 2 ? 0 : 3.4) + (i % 2) * 0.6);
        a.g.rotation.set(0, Math.PI / 2, 0);
        a.anim.bucle('Lie_Idle');
      });
      aldric.g.position.set(O.x + 1.5, 0, O.z + 2);
      aldric.mirarHacia(O.x + 1.5, O.z + 10);
      aldric.anim.bucle('Idle');
      encuadre(new THREE.Vector3(O.x + 3.5, 3.2, O.z + 6.5), new THREE.Vector3(O.x + 2.5, 3, O.z + 6.5), new THREE.Vector3(O.x, 1, O.z + 3.5), new THREE.Vector3(O.x, 1, O.z + 3.5), 5);
      await fundir(false);
      await esperar(1200);
      // un destello rojo en la ventana y Aldric se vuelve
      sonido.cristalRoto?.();
      const rojo = new THREE.PointLight(0xff2244, 30, 14, 1.5);
      rojo.position.set(O.x + 4, 2.4, O.z - 2.6);
      escena.add(rojo);
      objetos.push(rojo);
      aldric.mirarHacia(rojo.position.x, rojo.position.z);
      aldric.anim.unaVezSolo('Hit_B');
      plano.temblor = 0.2;
      await esperar(1300);
      fx.big.emit(aldric.g.position.clone().setY(1.2), { count: 120, color: 0xff3a6a, intensity: 2.4, speed: 4, life: 1.2, gravity: -1 });
      aldric.g.visible = false;
      rojo.intensity = 0;
      await esperar(1200);

      // ===== 7. La tercera mañana =====
      await fundir(true);
      await cartel(G.rotuloFinal, 5200);
    } catch (e) {
      console.error('La cinemática ha fallado; se sigue con el juego', e);
      await fundir(true);
    } finally {
      // limpieza: todo vuelve a como estaba
      for (const o of objetos) { escena.remove(o); }
      escena.remove(relleno);
      objetos.length = 0;
      actores.length = 0;
      animaciones.clear();
      luna.color.setHex(restaurar.luz);
      luna.intensity = restaurar.lunaI;
      cielo.color.setHex(restaurar.cieloC);
      cielo.groundColor.setHex(restaurar.cieloS);
      cielo.intensity = restaurar.cieloI;
      sub.classList.add('hidden');
      rotulo.classList.add('hidden');
      capa.classList.add('hidden');
      cine.activa = false;
      saltando = false;
      document.body.classList.remove('en-cine');
    }
  };

  // ---------- Un plano corto en pleno juego (enseñar algo y devolver el control) ----------
  cine.mostrar = async (desde, mirarA, segundos = 2.5) => {
    cine.activa = true;
    saltando = false;
    document.body.classList.add('en-cine');
    capa.classList.remove('hidden');
    try {
      const dir = camara.getWorldDirection(new THREE.Vector3());
      encuadre(camara.position.clone(), desde, camara.position.clone().addScaledVector(dir, 6), mirarA, 1.1);
      await esperar(1100);
      encuadre(desde, desde.clone().lerp(mirarA, 0.12), mirarA, mirarA, segundos);
      await esperar(segundos * 1000);
    } finally {
      capa.classList.add('hidden');
      document.body.classList.remove('en-cine');
      cine.activa = false;
      saltando = false;
    }
  };

  // ---------- Rótulo de capítulo al llegar a un piso ("Piso II" + nombre) ----------
  cine.titulo = async (nombreCompleto) => {
    const [num, nombre] = String(nombreCompleto).split(' · ');
    capa.classList.remove('hidden');
    capa.classList.add('solo-titulo');
    rotulo.innerHTML = `<div class="cine-capitulo"><span>${num}</span><b>${nombre ?? ''}</b></div>`;
    rotulo.classList.remove('hidden');
    await Promise.race([new Promise((ok) => setTimeout(ok, 2300)), new Promise((ok) => { avanzar = ok; })]);
    avanzar = null;
    rotulo.classList.add('hidden');
    rotulo.textContent = '';
    capa.classList.remove('solo-titulo');
    capa.classList.add('hidden');
  };

  // ---------- La primera vista de la torre (al salir de la casa) ----------
  // ctx extra: lugares del exterior { casa, torre, arco } y la posición del jugador
  cine.vistaTorre = async (lugares, jugador) => {
    cine.activa = true;
    saltando = false;
    document.body.classList.add('en-cine');
    capa.classList.remove('hidden');
    escena.add(relleno);
    relleno.intensity = 0;
    try {
      const T = lugares.torre, A = lugares.arco;
      const ini = new THREE.Vector3(jugador.x, 2.2, jugador.z + 5);
      encuadre(ini, new THREE.Vector3(jugador.x + 2, 9, jugador.z - 10), new THREE.Vector3(jugador.x, 1.5, jugador.z - 6), new THREE.Vector3(T.x, 22, T.z), 5);
      await fundir(false);
      await esperar(4200);
      // relámpago: la torre se recorta contra el cielo
      const rayo = new THREE.PointLight(0xc8d4ff, 0, 200, 1);
      rayo.position.set(T.x + 20, 70, T.z + 10);
      escena.add(rayo);
      objetos.push(rayo);
      sonido.cristalRoto?.();
      for (const v of [60, 0, 40, 0]) { rayo.intensity = v * 40; await esperar(90); }
      const rojo = new THREE.PointLight(0xff2a50, 40, 30, 1.4);
      rojo.position.set(T.x, 42, T.z + 4);
      escena.add(rojo);
      objetos.push(rojo);
      encuadre(camara.position.clone(), new THREE.Vector3(A.x + 6, 6, A.z + 22), new THREE.Vector3(T.x, 22, T.z), new THREE.Vector3(T.x, 30, T.z), 6);
      await decirTodo(CINE_TORRE, 100);
      await esperar(600);
      await fundir(true);
    } finally {
      for (const o of objetos) escena.remove(o);
      objetos.length = 0;
      escena.remove(relleno);
      sub.classList.add('hidden');
      capa.classList.add('hidden');
      cine.activa = false;
      saltando = false;
      document.body.classList.remove('en-cine');
    }
  };

  // un túnel violeta que gira (el viaje entre mundos)
  function crearTunel(boca) {
    const tex = new THREE.CanvasTexture(runeCircleCanvas());
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 6);
    const tubo = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 40, 32, 1, true), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    tubo.material.color.setRGB(0.9, 0.35, 1.8);
    tubo.position.set(boca.x, boca.y - 20, boca.z);
    escena.add(tubo);
    objetos.push(tubo);
    const f = (dt) => {
      tex.offset.y -= dt * 1.6;
      tubo.rotation.y += dt * 0.9;
      if (Math.random() < dt * 40) fx.small.emit(new THREE.Vector3(boca.x + (Math.random() - 0.5) * 5, boca.y - 15 + Math.random() * 10, boca.z + (Math.random() - 0.5) * 5), { count: 1, color: 0xd8b0ff, intensity: 2.5, speed: 6, life: 0.6, dir: new THREE.Vector3(0, 1, 0) });
    };
    animaciones.add(f);
    return { quitar: () => { animaciones.delete(f); tubo.visible = false; } };
  }

  return cine;
}
