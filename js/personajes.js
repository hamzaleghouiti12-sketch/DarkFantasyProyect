// Los personajes que se pueden elegir (KayKit Adventurers, CC0).
// Cada uno se prepara una sola vez como "plantilla" (paleta oscura, sin armas,
// con la varita de Aldric en la mano y a 1,8 m de alto) y se carga solo cuando
// alguien lo elige. El jugador y sus compañeros usan copias de esa plantilla.
import * as THREE from 'three';
import { clone as clonarConEsqueleto } from 'three/addons/utils/SkeletonUtils.js';
import { cargarModelo, cargarPaleta, aplicarPaleta, ajustarAltura } from './modelos.js';
import { ARMAS } from './armas.js';

// Cada personaje lleva su propia arma y ataca a su manera con la tecla R (ver armas.js).
// La varita se saca solo para lanzar hechizos.
const base = [
  { id: 'encapuchado', nombre: 'Encapuchado', archivo: 'protagonista.glb', paleta: 'paleta_picaro_oscura.png' },
  { id: 'picaro', nombre: 'Pícara', archivo: 'picaro.glb', paleta: 'paleta_picaro_oscura.png' },
  { id: 'caballero', nombre: 'Caballero', archivo: 'caballero.glb', paleta: 'paleta_caballero_oscura.png' },
  { id: 'barbaro', nombre: 'Bárbaro', archivo: 'barbaro.glb', paleta: 'paleta_barbaro_oscura.png' },
];
export const PERSONAJES = base.map((p) => ({ ...p, ...ARMAS[p.id] }));
export const ataqueDe = (id) => PERSONAJES.find((p) => p.id === personajeValido(id)).ataque;
export const personajeValido = (id) => (PERSONAJES.some((p) => p.id === id) ? id : PERSONAJES[0].id);

let varitaBase = null, materialPunta = null;
const plantillas = new Map();

// La varita se carga una vez y se reparte a todos los personajes.
export function configurarVarita(gltf, paleta, matPunta) {
  varitaBase = gltf.scene;
  aplicarPaleta(varitaBase, paleta);
  materialPunta = matPunta;
}

export function cargarPersonaje(id) {
  id = personajeValido(id);
  if (!plantillas.has(id)) {
    const p = PERSONAJES.find((x) => x.id === id);
    const promesa = (async () => {
      const [gltf, paleta] = await Promise.all([cargarModelo(`assets/modelos/${p.archivo}`), cargarPaleta(`assets/texturas/${p.paleta}`)]);
      const modelo = gltf.scene;
      // de todo lo que trae en las manos, solo se deja su arma
      // (GLTFLoader quita los puntos de los nombres: "handslot.r" → "handslotr")
      for (const n of ['handslotr', 'handslotl']) modelo.getObjectByName(n)?.children.forEach((c) => { c.visible = p.armas.includes(c.name); });
      if (p.extra) {
        const arma = (await cargarModelo(`assets/modelos/${p.extra}`)).scene;
        arma.name = 'arma_extra';
        modelo.getObjectByName('handslotr')?.add(arma);
      }
      modelo.userData.armas = [...p.armas, ...(p.extra ? ['arma_extra'] : [])];
      aplicarPaleta(modelo, paleta);
      ajustarAltura(modelo, 1.8);
      const mano = modelo.getObjectByName('handslotr');
      if (mano && varitaBase) {
        const varita = varitaBase.clone(true);
        varita.name = 'varita';
        varita.visible = false; // se saca solo al lanzar un hechizo
        const punta = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), materialPunta);
        punta.name = 'punta';
        punta.position.set(0, 0.72, 0);
        varita.add(punta);
        mano.add(varita);
      }
      return { id, modelo, clips: gltf.animations };
    })();
    promesa.catch(() => plantillas.delete(id)); // si falla, se podrá reintentar
    plantillas.set(id, promesa);
  }
  return plantillas.get(id);
}

// Copia independiente (con su esqueleto y sus materiales) lista para animar.
export function instanciar(plantilla) {
  const m = clonarConEsqueleto(plantilla.modelo);
  m.traverse((o) => {
    if (!o.isMesh) return;
    if (o.name !== 'punta') o.material = o.material.clone();
    o.castShadow = true;
  });
  return m;
}
