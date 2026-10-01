// La casa de Aldric: su taller. Aquí empieza la partida.
// Está lejos del resto (en x = -400) y el jugador se "teletransporta" entre zonas.
// Contiene el cristal que proyecta el holograma, el portal del experimento
// fallido (volver a casa) y la puerta de salida (ir a la torre).
import * as THREE from 'three';
import { cargarPiezas, colocador } from './modelos.js';
import * as TX from './textures.js';
import { amueblar } from './pisos/muebles.js';
import { fusionarEstaticos } from './nucleo/sala-torre.js';

export const CASA_O = new THREE.Vector3(-400, 0, 0);
const S = 6; // medio lado interior: la sala mide 12 x 12 m (3 x 3 baldosas)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const glow = (r, g, b, extra = {}) => {
  const m = new THREE.MeshBasicMaterial(extra);
  m.color.setRGB(r, g, b);
  return m;
};

export function crearCasa(escena) {
  const O = CASA_O;
  const grupo = new THREE.Group();
  grupo.position.copy(O);
  escena.add(grupo);
  const aMundo = (x, z) => new THREE.Vector3(O.x + x, 0, O.z + z);

  const zona = {
    id: 'casa', grupo, colliders: [],
    musica: 'casa', pisada: 'madera', camDist: 4.2,
    niebla: { color: 0x0c0907, densidad: 0.03 }, luz: { luna: 0.45, cielo: 0.8 },
    suelo: () => 0,
    limitar(p) {
      p.x = clamp(p.x, O.x - S + 0.6, O.x + S - 0.6);
      p.z = clamp(p.z, O.z - S + 0.6, O.z + S - 0.6);
    },
    limitarCamara(c) {
      c.x = clamp(c.x, O.x - S + 0.3, O.x + S - 0.3);
      c.z = clamp(c.z, O.z - S + 0.3, O.z + S - 0.3);
      c.y = clamp(c.y, 0.5, 3.6);
    },
    guiaHolograma(d) {
      d.x = clamp(d.x, O.x - S + 0.9, O.x + S - 0.9);
      d.z = clamp(d.z, O.z - S + 0.9, O.z + S - 0.9);
    },
    entrada: { pos: aMundo(0, 2.5), mirada: Math.PI, yaw: 0 },
  };
  const obstaculo = (x, z, r) => zona.colliders.push({ x: O.x + x, z: O.z + z, r });

  // ---------- Versión básica (respaldo si no cargan las piezas) ----------
  const basico = new THREE.Group();
  grupo.add(basico);
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(S * 2, S * 2), new THREE.MeshStandardMaterial({ map: TX.canvasTex(TX.woodCanvas(), 4, 4), color: 0x8a6a55, roughness: 0.9 }));
  suelo.rotation.x = -Math.PI / 2;
  suelo.receiveShadow = true;
  basico.add(suelo);
  const muroMat = new THREE.MeshStandardMaterial({ map: TX.canvasTex(TX.brickCanvas(), 3, 1), color: 0x8a7e7a, roughness: 0.95 });
  for (const [x, z, ry] of [[0, -S, 0], [0, S, Math.PI], [-S, 0, Math.PI / 2], [S, 0, -Math.PI / 2]]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(S * 2, 4), muroMat);
    m.position.set(x, 2, z);
    m.rotation.y = ry;
    basico.add(m);
  }

  // ---------- Techo con vigas ----------
  const techo = new THREE.Mesh(new THREE.PlaneGeometry(S * 2 + 1, S * 2 + 1), new THREE.MeshStandardMaterial({ color: 0x140e0b, roughness: 1 }));
  techo.rotation.x = Math.PI / 2;
  techo.position.y = 4;
  grupo.add(techo);
  const vigaMat = new THREE.MeshStandardMaterial({ map: TX.canvasTex(TX.woodCanvas(), 1, 3), color: 0x5a4032, roughness: 0.85 });
  for (const z of [-4, 0, 4]) {
    const v = new THREE.Mesh(new THREE.BoxGeometry(S * 2, 0.35, 0.35), vigaMat);
    v.position.set(0, 3.8, z);
    v.castShadow = true;
    grupo.add(v);
  }

  // ---------- Antorchas ----------
  const antorchas = [];
  for (const [x, z, ry] of [[-2.5, -5.9, 0], [2.5, 5.9, Math.PI]]) {
    const dx = Math.sin(ry) * 0.45, dz = Math.cos(ry) * 0.45;
    const llama = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.36, 10), glow(4, 1.6, 0.35));
    llama.position.set(x + dx, 2.95, z + dz);
    grupo.add(llama);
    const luz = new THREE.PointLight(0xff9048, 14, 10, 1.6);
    luz.position.set(x + dx * 2, 3.0, z + dz * 2);
    grupo.add(luz);
    antorchas.push({ llama, luz, x, z, ry, semilla: Math.random() * 50 });
  }

  // ---------- El cristal del holograma ----------
  const cristalMat = new THREE.MeshStandardMaterial({ color: 0x9fe6ff, emissive: 0x2aa6ff, emissiveIntensity: 1.6, roughness: 0.15, transparent: true, opacity: 0.92 });
  const cristal = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), cristalMat);
  cristal.scale.y = 1.5;
  cristal.position.set(0.6, 1.75, -3);
  grupo.add(cristal);
  const luzCristal = new THREE.PointLight(0x66ccff, 5, 6, 1.6);
  luzCristal.position.set(0.6, 2.1, -3);
  grupo.add(luzCristal);
  zona.cristal = { mesh: cristal, luz: luzCristal, pos: aMundo(0, -3), activo: false };

  // ---------- El portal del experimento fallido (pared este) ----------
  const portal = new THREE.Group();
  portal.position.set(S - 0.3, 2, 0);
  portal.rotation.y = -Math.PI / 2;
  grupo.add(portal);
  portal.add(new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.09, 10, 48), glow(2.4, 1.0, 3.6)));
  const remolino = new THREE.Mesh(
    new THREE.CircleGeometry(1.18, 48),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(TX.runeCircleCanvas()), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  remolino.material.color.setRGB(0.9, 0.4, 1.6);
  portal.add(remolino);
  const velo = new THREE.Mesh(new THREE.CircleGeometry(1.18, 48), new THREE.MeshBasicMaterial({ map: TX.glowTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.6 }));
  velo.material.color.setRGB(0.6, 0.25, 1.2);
  velo.position.z = -0.02;
  portal.add(velo);
  const luzPortal = new THREE.PointLight(0xa060ff, 7, 7, 1.6);
  luzPortal.position.set(S - 1.2, 2, 0);
  grupo.add(luzPortal);
  zona.portal = { pos: aMundo(S - 1.1, 0), centro: aMundo(S - 0.4, 0).setY(2) };
  zona.puerta = { pos: aMundo(0, S - 0.7), hoja: null };

  // ---------- El mapa de la torre (Portal de los pisos) ----------
  // Un pedestal con una torre en miniatura que flota: lleva a los pisos ya
  // desbloqueados. Solo aparece si hay alguno (main.js decide).
  const mapa = new THREE.Group();
  mapa.position.set(-2.7, 0, -4.7);
  mapa.visible = false;
  grupo.add(mapa);
  const piedra = new THREE.MeshStandardMaterial({ color: 0x4a4048, roughness: 0.9 });
  const pie = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 1.0, 8), piedra);
  pie.position.y = 0.5;
  pie.castShadow = true;
  mapa.add(pie);
  const tapa = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 8), piedra);
  tapa.position.y = 1.04;
  mapa.add(tapa);
  const mini = new THREE.Group();
  mini.position.y = 1.2;
  mapa.add(mini);
  // ocho pisos de piedra con una franja de luz entre uno y otro, y la cúspide violeta
  const muro = new THREE.MeshStandardMaterial({ color: 0x8a7a70, roughness: 0.8, emissive: 0x3a2410, emissiveIntensity: 0.25 });
  const franja = glow(0.9, 0.6, 0.22);
  for (let i = 0; i < 8; i++) {
    const r = 0.2 - i * 0.012;
    const piso = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.012, 0.085, 8), muro);
    piso.position.y = i * 0.1;
    mini.add(piso);
    const luz = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.012, r - 0.012, 0.016, 8), franja);
    luz.position.y = i * 0.1 + 0.05;
    mini.add(luz);
  }
  const punta = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.26, 8), glow(1.0, 0.25, 0.6));
  punta.position.y = 8 * 0.1 + 0.08;
  mini.add(punta);
  const rotulo = TX.makeLabel('Mapa de la torre', { height: 0.22 });
  rotulo.position.set(0, 2.55, 0);
  mapa.add(rotulo);
  const luzMapa = new THREE.PointLight(0xffc870, 0, 3.5, 1.6);
  luzMapa.position.set(-2.7, 1.8, -4.4);
  grupo.add(luzMapa);
  zona.mapa = { pos: aMundo(-2.7, -4.7) };
  zona.mostrarMapa = (v) => {
    if (v && !mapa.visible) obstaculo(-2.7, -4.7, 0.5);
    mapa.visible = v;
    luzMapa.intensity = v ? 2.5 : 0;
  };

  // ---------- Luz de luna por las ventanas ----------
  const cielo = glow(0.07, 0.11, 0.28);
  for (const [x, z, ry] of [[4, -S - 1.2, 0], [S + 1.2, 4, -Math.PI / 2]]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.8), cielo);
    p.position.set(x, 2, z);
    p.rotation.y = ry;
    grupo.add(p);
  }

  // ---------- Animación ----------
  zona.update = (dt, t, fx) => {
    cristal.rotation.y += dt * (zona.cristal.activo ? 0.5 : 1.4);
    cristal.position.y = 1.75 + Math.sin(t * 2) * 0.06;
    cristalMat.emissiveIntensity = zona.cristal.activo ? 0.6 : 1.6 + Math.sin(t * 4) * 0.5;
    luzCristal.intensity = zona.cristal.activo ? 2 : 5 + Math.sin(t * 4) * 1.5;
    remolino.rotation.z -= dt * 0.8;
    if (mapa.visible) {
      mini.rotation.y += dt * 0.6;
      mini.position.y = 1.2 + Math.sin(t * 1.6) * 0.05;
    }
    velo.material.opacity = 0.45 + Math.sin(t * 1.7) * 0.15;
    luzPortal.intensity = 7 + Math.sin(t * 3.1) * 1.5;
    if (Math.random() < dt * 14) {
      const a = Math.random() * Math.PI * 2;
      fx.small.emit(new THREE.Vector3(O.x + S - 0.45, 2 + Math.sin(a) * 1.2, O.z + Math.cos(a) * 1.2), { count: 1, color: 0xb07bff, intensity: 2, speed: 0.4, life: 1.2, dir: new THREE.Vector3(-0.6, 0, 0) });
    }
    for (const a of antorchas) {
      const f = 0.82 + 0.12 * Math.sin(t * 13 + a.semilla) + 0.08 * Math.sin(t * 27 + a.semilla * 2);
      a.luz.intensity = 14 * f;
      a.llama.scale.set(1, 0.85 + f * 0.3, 1);
    }
  };

  // ---------- Piezas de KayKit (mazmorra) ----------
  zona.vestir = async (paleta) => {
    const nombresCasa = ['floor_wood_large', 'table_long_decorated_A', 'shelves', 'shelf_large', 'bed_decorated', 'keg', 'barrel_small', 'chair', 'stool', 'bottle_A_labeled_green', 'bottle_B_brown', 'shelf_small_candles', 'wall_window_open'];
    const nombresMazmorra = ['wall', 'wall_doorway', 'wall_shelves', 'torch_mounted', 'candle_triple', 'chest'];
    const [a, b] = await Promise.all([
      cargarPiezas('assets/modelos/casa', nombresCasa, paleta),
      cargarPiezas('assets/modelos/mazmorra', nombresMazmorra, paleta),
    ]);
    const colocar = colocador(grupo, { ...a, ...b });
    const fijas = []; // todo lo que no se mueve se funde al final (menos la puerta)
    const poner = (...p) => { const o = colocar(...p); fijas.push(o); return o; };
    basico.visible = false;
    const W = S + 0.4;

    for (const x of [-4, 0, 4]) for (const z of [-4, 0, 4]) poner('floor_wood_large', x, 0, z, 0, 1, false);
    // muros (una fila de 4 m)
    [['wall', -4], ['wall', 0], ['wall_window_open', 4]].forEach(([n, x]) => poner(n, x, 0, -W, 0, 1, false));
    const portada = colocar('wall_doorway', 0, 0, W, Math.PI, 1, false);
    poner('wall', -4, 0, W, Math.PI, 1, false);
    poner('wall', 4, 0, W, Math.PI, 1, false);
    [['wall_shelves', -4], ['wall', 0], ['wall', 4]].forEach(([n, z]) => poner(n, -W, 0, z, Math.PI / 2, 1, false));
    [['wall', -4], ['wall', 0], ['wall_window_open', 4]].forEach(([n, z]) => poner(n, W, 0, z, -Math.PI / 2, 1, false));
    zona.puerta.hoja = portada.getObjectByName('wall_doorway_door');

    // antorchas en la pared
    for (const t of antorchas) poner('torch_mounted', t.x, 2.3, t.z, t.ry);

    // mesa de trabajo con el cristal
    poner('table_long_decorated_A', 0, 0, -3, Math.PI / 2);
    for (const x of [-1.3, 0, 1.3]) obstaculo(x, -3, 0.95);
    poner('chair', 1.0, 0, -1.6, Math.PI);
    obstaculo(1.0, -1.6, 0.4);
    poner('stool', -1.1, 0, -1.7);
    obstaculo(-1.1, -1.7, 0.4);
    poner('shelves', -4, 0, -W, 0, 1, false);
    poner('shelf_small_candles', 0, 2.5, -W + 0.5, 0, 1, false);
    poner('shelf_large', W - 0.5, 1.9, -4, -Math.PI / 2, 1, false);

    // las camas donde durmieron los jóvenes
    for (const z of [-0.2, 3.2]) {
      poner('bed_decorated', -4.9, 0, z);
      obstaculo(-4.4, z - 0.8, 0.95);
      obstaculo(-4.4, z + 0.8, 0.95);
    }

    // rincón de almacén
    poner('keg', 4.4, 0, 4.2, -Math.PI / 2);
    obstaculo(4.4, 4.2, 1.0);
    poner('barrel_small', 4.9, 0, 2.3);
    obstaculo(4.9, 2.3, 0.55);
    poner('chest', 2.9, 0, 5.1, Math.PI);
    obstaculo(2.9, 5.1, 0.8);
    poner('bottle_B_brown', 3.4, 0, 2.9);
    poner('bottle_A_labeled_green', 3.8, 0, 3.3);
    poner('candle_triple', -5.2, 0, -5.2, 0.4);
    poner('candle_triple', 5.2, 0, -5.3, 1.3);
    // un hogar de mago: alfombra, libros sobre la mesa y un sillón junto a la cama
    await amueblar({ grupo, obstaculo }, [
      ['rug_rectangle_stripes_A', 0, 0.02, 1.8, Math.PI / 2, 1.2],
      ['book_set', 0.7, 1.02, -3.1, 0.3],
      ['armchair_pillows', -4.2, 0, 1.6, Math.PI / 2, 0.9, 0.8],
    ]);
    fusionarEstaticos(fijas, grupo);
  };

  // abre la puerta de la casa (e de 0 a 1)
  zona.abrirPuerta = (e) => { if (zona.puerta.hoja) zona.puerta.hoja.rotation.y = e * 1.75; };

  return zona;
}
