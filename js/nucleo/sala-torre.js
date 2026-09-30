// Sala de la torre genérica (Fase 0 del plan técnico): suelo, dos filas de
// muros con ventanas, columnas con antorchas, puerta norte con tres runas
// (una por sello) y escalera. Cada piso nuevo parte de aquí y solo añade sus
// desafíos. Todo se coloca relativo a `origen`, así los pisos pueden vivir
// lejos unos de otros en la misma escena.
//
// Medidas (piezas KayKit Dungeon Remastered, cuadrícula de 4 m): 6 × 9 baldosas
// = 24 × 36 m, igual que el Piso I. Coordenadas locales: x ∈ [-12, 12], z ∈ [-18, 18];
// la entrada está al sur (z = +14) y la puerta, al norte (z = -18).
import * as THREE from 'three';
import { cargarPiezas, colocador } from '../modelos.js';
import * as TX from '../textures.js';

export const PIEZAS_BASE = [
  'wall', 'wall_cracked', 'wall_arched', 'wall_archedwindow_gated', 'wall_pillar', 'wall_doorway',
  'floor_tile_large', 'floor_tile_large_rocks', 'floor_tile_big_grate',
  'pillar', 'torch_mounted', 'stairs_walled',
];

// Las piezas se cachean por nombre: dos pisos que usan `wall` la descargan una vez.
const cache = new Map();
export async function cargarPiezasTorre(paleta, nombres) {
  const faltan = nombres.filter((n) => !cache.has(n));
  if (faltan.length) {
    const nuevas = await cargarPiezas('assets/modelos/mazmorra', faltan, paleta);
    for (const [n, p] of Object.entries(nuevas)) cache.set(n, p);
  }
  return Object.fromEntries(nombres.map((n) => [n, cache.get(n)]));
}

const W = 12, L = 18, H = 8;          // medio ancho, medio largo, alto (dos filas de muros)
const WX = W + 0.4, WZ = L + 0.4;      // centro de los muros (1 m de grosor)
const PUERTA = 0.62;                   // medio ancho del hueco de la puerta
const ESCALERA = -WZ - 0.5;            // z local donde empieza a subir la escalera
const SALIDA = -WZ - 2.2;              // z local que termina el piso

const brillo = (r, g, b, extra = {}) => {
  const m = new THREE.MeshBasicMaterial(extra);
  m.color.setRGB(r, g, b);
  return m;
};

/**
 * @param {object} o
 * @param {THREE.Object3D} o.escena
 * @param {THREE.Vector3} o.origen      posición del centro de la sala en el mundo
 * @param {object} o.piezas             piezas cargadas (PIEZAS_BASE + las del piso)
 * @param {object} o.fx                 partículas { small, big }
 * @param {object} [o.estandartes]      { normal, escudo, fino } nombres de pieza
 * @param {number[]} [o.cielo]          color RGB de la luz de luna tras las ventanas
 * @param {number} [o.semilla]
 */
export function crearSalaDeTorre({ escena, origen, piezas, fx, estandartes = {}, cielo = [0.2, 0.3, 0.68], semilla = 7 }) {
  const grupo = new THREE.Group();
  grupo.position.copy(origen);
  escena.add(grupo);
  const poner = colocador(grupo, piezas);
  const azar = TX.rng(semilla);
  const colliders = [];
  const ox = origen.x, oz = origen.z;
  const obstaculo = (x, z, r, tag = 'decor') => colliders.push({ x: ox + x, z: oz + z, r, tag });

  // ---------- Suelo ----------
  for (let x = -10; x <= 10; x += 4) {
    for (let z = -16; z <= 16; z += 4) {
      const borde = Math.abs(x) === 10 || Math.abs(z) === 16;
      const nombre = borde && azar() < 0.4 ? 'floor_tile_large_rocks' : 'floor_tile_large';
      poner(nombre, x, 0, z, Math.floor(azar() * 4) * (Math.PI / 2), 1, false);
    }
  }

  // ---------- Muros (dos filas) y ventanas con luz de luna ----------
  const luzCielo = brillo(...cielo);
  const ventana = (x, z, ry) => {
    poner('wall_archedwindow_gated', x, 4, z, ry, 1, false);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.8), luzCielo);
    p.position.set(x - Math.sin(ry) * 0.8, 6, z - Math.cos(ry) * 0.8);
    p.rotation.y = ry;
    grupo.add(p);
  };
  const variado = () => (azar() < 0.3 ? 'wall_cracked' : 'wall');
  for (const x of [-10, -6, -2, 2, 6, 10]) {
    poner(Math.abs(x) === 2 ? 'wall_arched' : variado(), x, 0, WZ, Math.PI, 1, false);
    if (Math.abs(x) === 6) ventana(x, WZ, Math.PI);
    else poner('wall', x, 4, WZ, Math.PI, 1, false);
  }
  for (const x of [-12, -8, -4, 0, 4, 8, 12]) {
    if (x !== 0) poner(Math.abs(x) === 4 ? 'wall_pillar' : variado(), x, 0, -WZ, 0, 1, false);
    poner('wall', x, 4, -WZ, 0, 1, false);
  }
  for (const sx of [-1, 1]) {
    const ry = -sx * (Math.PI / 2);
    for (let z = -16; z <= 16; z += 4) {
      poner(variado(), sx * WX, 0, z, ry, 1, false);
      if (z === -8 || z === 0 || z === 8) ventana(sx * WX, z, ry);
      else poner('wall', sx * WX, 4, z, ry, 1, false);
    }
    if (estandartes.normal) for (const z of [-4, 4]) poner(estandartes.normal, sx * WX, 0, z, ry, 1, false);
    if (estandartes.escudo) poner(estandartes.escudo, sx * WX, 0, 16, ry, 1, false);
    if (estandartes.fino) poner(estandartes.fino, sx * WX, 0, -16, ry, 1, false);
  }

  // ---------- Columnas con antorchas (6 luces, el máximo que admite el presupuesto) ----------
  const antorchas = [];
  for (const sx of [-1, 1]) {
    for (const z of [-12, 0, 12]) {
      const x = sx * 9;
      poner('pillar', x, 0, z);
      poner('pillar', x, 4, z);
      poner('torch_mounted', x - sx * 0.75, 2.75, z, -sx * (Math.PI / 2));
      obstaculo(x, z, 1.05, 'pilar');
      const px = x - sx * 1.15;
      const llama = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.42, 10), brillo(4, 1.6, 0.35));
      llama.position.set(px, 3.5, z);
      const nucleo = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 8), brillo(5, 4, 1.5));
      nucleo.position.set(px, 3.42, z);
      const luz = new THREE.PointLight(0xff8a3d, 30, 15, 1.7);
      luz.position.set(px - sx * 0.3, 3.7, z);
      grupo.add(llama, nucleo, luz);
      antorchas.push({ luz, llama, pos: new THREE.Vector3(ox + px, 3.65, oz + z), semilla: azar() * 100, t: 0 });
    }
  }

  // ---------- Puerta norte con su hoja giratoria, tres runas y escalera ----------
  const portada = poner('wall_doorway', 0, 0, -WZ, 0, 1, false);
  const hoja = portada.getObjectByName('wall_doorway_door');
  const runas = [-0.75, 0, 0.75].map((x, i) => {
    const m = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(TX.runeGlyphCanvas(i + 4)), transparent: true, depthWrite: false });
    m.color.setRGB(0.16, 0.14, 0.2);
    const runa = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.55), m);
    runa.position.set(x, 3.38, -WZ + 0.56);
    grupo.add(runa);
    return { mat: m, pos: new THREE.Vector3(ox + x, 3.38, oz - WZ + 0.56) };
  });
  poner('stairs_walled', 0, 0, -WZ - 4.5, 0);
  const portal = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 9), brillo(0.6, 0.25, 1.2));
  portal.position.set(0, 6.5, -WZ - 4.8);
  const luzPuerta = new THREE.PointLight(0xa070ff, 0, 18, 1.4);
  luzPuerta.position.set(0, 4.5, -WZ - 2.5);
  grupo.add(portal, luzPuerta);
  const puerta = { abriendo: false, t: 0 };

  const tmp = new THREE.Vector3();
  let polvo = 0;

  const sala = {
    grupo, colliders, origen, W, L, H, poner, obstaculo,
    // pasa coordenadas locales de la sala a coordenadas del mundo
    aMundo: (x, y, z) => new THREE.Vector3(ox + x, y, oz + z),
    get puertaAbierta() { return puerta.abriendo; },
    salidaZ: oz + SALIDA,
    encenderRuna(i) {
      runas[i].mat.color.setRGB(2.4, 1.2, 4.0);
      fx.big.emit(runas[i].pos, { count: 50, color: 0xb06bff, intensity: 2.2, speed: 3, life: 1.1, gravity: -1 });
    },
    abrirPuerta() { puerta.abriendo = true; },

    update(dt, t) {
      for (const a of antorchas) {
        const f = 0.82 + 0.12 * Math.sin(t * 13 + a.semilla) + 0.08 * Math.sin(t * 29 + a.semilla * 3);
        a.luz.intensity = 42 * f;
        a.llama.scale.set(1, 0.85 + f * 0.3, 1);
        a.t -= dt;
        if (a.t <= 0) {
          a.t = 0.07 + Math.random() * 0.08;
          fx.small.emit(a.pos, { count: 1, color: 0xff8030, intensity: 2.5, speed: 0.3, up: 1.1, life: 1.4, jitter: 0.15, drag: 0.5 });
        }
      }
      polvo -= dt;
      if (polvo <= 0) {
        polvo = 0.05;
        tmp.set(ox + (Math.random() - 0.5) * W * 1.8, Math.random() * 6, oz + (Math.random() - 0.5) * L * 1.8);
        fx.small.emit(tmp, { count: 1, color: 0x8899cc, intensity: 0.5, speed: 0.12, life: 5, drag: 0.1 });
      }
      if (puerta.abriendo && puerta.t < 1) {
        puerta.t = Math.min(1, puerta.t + dt * 0.4);
        const e = puerta.t * puerta.t * (3 - 2 * puerta.t);
        if (hoja) hoja.rotation.y = e * 1.75;
        luzPuerta.intensity = e * 40;
        if (Math.random() < 0.6) fx.small.emit(tmp.set(ox + (Math.random() - 0.5) * 2, 0.1, oz - L), { count: 2, color: 0x8a8080, intensity: 0.6, speed: 0.8, up: 0.5, life: 1.5 });
      }
    },
  };

  // ---------- Contrato de zona (ver PLAN_TECNICO.md, sección 2.3) ----------
  sala.zona = {
    grupo, colliders,
    pisada: 'piedra', camDist: 6.5,
    niebla: { color: 0x07060b, densidad: 0.028 }, luz: { luna: 1.3, cielo: 1.1 },
    entrada: { pos: new THREE.Vector3(ox, 0, oz + 14), mirada: Math.PI, yaw: 0 },
    suelo(p) {
      const z = p.z - oz;
      return z < ESCALERA ? Math.min(4, ESCALERA - z) : 0;
    },
    limitar(p, prevZ) {
      const edge = L - 0.6;
      let x = p.x - ox, z = p.z - oz;
      const prev = prevZ - oz;
      x = Math.max(-W + 0.6, Math.min(W - 0.6, x));
      z = Math.min(L - 0.6, z);
      if (z < -edge) {
        const hueco = z > -L - 1 ? PUERTA : 1.6; // el marco es estrecho; la escalera, más ancha
        const enPuerta = Math.abs(x) < PUERTA;
        if (!puerta.abriendo || (prev >= -edge && !enPuerta)) z = -edge;
        else x = Math.max(-hueco, Math.min(hueco, x));
      }
      p.x = ox + x;
      p.z = oz + z;
    },
    limitarCamara(c, jugador) {
      let x = c.x - ox, z = c.z - oz;
      x = Math.max(-W + 0.4, Math.min(W - 0.4, x));
      z = Math.min(L - 0.4, z);
      if (jugador.z - oz >= -L) z = Math.max(-L + 0.4, z);
      c.x = ox + x;
      c.z = oz + z;
      c.y = Math.max(0.5, Math.min(H - 0.5, c.y));
    },
    guiaHolograma(d, jugador) {
      let x = d.x - ox, z = d.z - oz;
      x = Math.max(-W + 0.8, Math.min(W - 0.8, x));
      z = Math.min(L - 0.8, z);
      if (jugador.z - oz < -L + 1.5) { x = (jugador.x - ox) * 0.4; z = jugador.z - oz + 1.4; }
      d.x = ox + x;
      d.z = oz + z;
      if (jugador.z - oz < -L + 1.5) d.y = 0;
    },
  };
  return sala;
}
