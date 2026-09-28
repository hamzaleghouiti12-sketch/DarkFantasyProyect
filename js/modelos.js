// Carga de modelos 3D externos (formato glTF/GLB) y de sus paletas de color.
// Los personajes de KayKit toman todo su color de una imagen-paleta: si la
// cambiamos por la versión oscura (herramientas/oscurecer_paleta.py), el
// personaje entero adopta la estética dark fantasy.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const gltfLoader = new GLTFLoader();
const texLoader = new THREE.TextureLoader();

export const RUTAS = {
  protagonista: 'assets/modelos/protagonista.glb',
  aldric: 'assets/modelos/aldric.glb',
  varita: 'assets/modelos/varita.gltf',
  paletaPicaro: 'assets/texturas/paleta_picaro_oscura.png',
  paletaMago: 'assets/texturas/paleta_mago_oscura.png',
  paletaMazmorra: 'assets/texturas/paleta_mazmorra_oscura.png',
};

export function cargarModelo(url) {
  return gltfLoader.loadAsync(url);
}

export async function cargarPaleta(url) {
  const t = await texLoader.loadAsync(url);
  t.flipY = false; // convención de glTF
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Carga un conjunto de piezas de escenario (una por archivo) y les pone la paleta oscura.
export async function cargarPiezas(carpeta, nombres, paleta, ext = 'glb') {
  const entradas = await Promise.all(nombres.map(async (n) => [n, (await cargarModelo(`${carpeta}/${n}.${ext}`)).scene]));
  for (const [, pieza] of entradas) {
    pieza.traverse((m) => {
      if (!m.isMesh) return;
      m.material = m.material.clone();
      m.material.map = paleta;
      m.material.roughness = 0.9;
      m.material.metalness = 0;
    });
  }
  return Object.fromEntries(entradas);
}

// Devuelve una función para colocar copias de las piezas dentro de un grupo.
export function colocador(grupo, piezas) {
  return (nombre, x, y, z, ry = 0, escala = 1, sombra = true) => {
    const o = piezas[nombre].clone(true);
    o.position.set(x, y, z);
    o.rotation.y = ry;
    o.scale.setScalar(escala);
    o.traverse((m) => {
      if (!m.isMesh) return;
      m.castShadow = sombra;
      m.receiveShadow = true;
    });
    grupo.add(o);
    return o;
  };
}

export function aplicarPaleta(root, paleta) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    o.material = o.material.clone();
    o.material.map = paleta;
    o.material.roughness = 0.85;
    o.material.needsUpdate = true;
    o.castShadow = true;
  });
}

export function ocultar(root, nombres) {
  root.traverse((o) => { if (nombres.includes(o.name)) o.visible = false; });
}

// Escala el modelo para que mida `altura` metros.
export function ajustarAltura(root, altura) {
  const caja = new THREE.Box3().setFromObject(root);
  const h = caja.max.y - caja.min.y;
  if (h > 0) root.scale.multiplyScalar(altura / h);
}

// Controlador sencillo de animaciones con fundido entre ellas.
export class Animador {
  constructor(root, clips) {
    this.mixer = new THREE.AnimationMixer(root);
    this.acciones = {};
    for (const c of clips) this.acciones[c.name] = this.mixer.clipAction(c);
    this.base = null;
    this.unaVez = null;
    this.nombreBase = null;
    this.velocidadBase = 1;
    this.nombreUnaVez = null;
    this.contador = 0;
    this.mixer.addEventListener('finished', (e) => {
      if (e.action !== this.unaVez) return;
      this.unaVez = null;
      e.action.fadeOut(0.25);
      this.base?.reset().fadeIn(0.25).play();
    });
  }

  // animación en bucle (andar, correr, reposo…)
  bucle(nombre, velocidad = 1) {
    const a = this.acciones[nombre];
    if (!a) return;
    a.timeScale = velocidad;
    this.nombreBase = nombre;
    this.velocidadBase = +velocidad.toFixed(2);
    if (this.base === a) return;
    if (!this.unaVez) {
      a.reset().fadeIn(0.2).play();
      this.base?.fadeOut(0.2);
    }
    this.base = a;
  }

  // animación de una sola vez (lanzar hechizo, celebrar…) y vuelta a la base
  unaVezSolo(nombre, velocidad = 1) {
    const a = this.acciones[nombre];
    if (!a) return;
    this.nombreUnaVez = nombre;
    this.contador++;
    a.setLoop(THREE.LoopOnce, 1);
    a.clampWhenFinished = true;
    a.timeScale = velocidad;
    (this.unaVez || this.base)?.fadeOut(0.15);
    a.reset().fadeIn(0.15).play();
    this.unaVez = a;
  }

  update(dt) { this.mixer.update(dt); }
}
