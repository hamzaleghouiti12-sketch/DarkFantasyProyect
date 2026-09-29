// Los personajes que se pueden elegir (KayKit Adventurers, CC0).
// Cada uno se prepara una sola vez como "plantilla" (paleta oscura, sin armas,
// con la varita de Aldric en la mano y a 1,8 m de alto) y se carga solo cuando
// alguien lo elige. El jugador y sus compañeros usan copias de esa plantilla.
import * as THREE from 'three';
import { clone as clonarConEsqueleto } from 'three/addons/utils/SkeletonUtils.js';
import { cargarModelo, cargarPaleta, aplicarPaleta, ajustarAltura } from './modelos.js';

export const PERSONAJES = [
  { id: 'encapuchado', nombre: 'Encapuchado', desc: 'Sigiloso y atento a cada detalle.', archivo: 'protagonista.glb', paleta: 'paleta_picaro_oscura.png' },
  { id: 'picaro', nombre: 'Pícara', desc: 'Rápida de manos… y de ideas.', archivo: 'picaro.glb', paleta: 'paleta_picaro_oscura.png' },
  { id: 'caballero', nombre: 'Caballero', desc: 'Protege al equipo como un cortafuegos.', archivo: 'caballero.glb', paleta: 'paleta_caballero_oscura.png' },
  { id: 'barbaro', nombre: 'Bárbaro', desc: 'Fuerza bruta y memoria de hierro.', archivo: 'barbaro.glb', paleta: 'paleta_barbaro_oscura.png' },
];
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
      // fuera espadas, hachas, escudos y ballestas: aquí solo se lucha con la varita
      // (GLTFLoader quita los puntos de los nombres: "handslot.r" → "handslotr")
      for (const n of ['handslotr', 'handslotl']) modelo.getObjectByName(n)?.children.forEach((c) => { c.visible = false; });
      aplicarPaleta(modelo, paleta);
      ajustarAltura(modelo, 1.8);
      const mano = modelo.getObjectByName('handslotr');
      if (mano && varitaBase) {
        const varita = varitaBase.clone(true);
        varita.name = 'varita';
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
