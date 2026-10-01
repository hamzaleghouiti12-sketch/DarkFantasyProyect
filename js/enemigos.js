// Catálogo de enemigos, todos de Kay Lousberg (CC0), en el mismo estilo que el resto del juego:
//   · KayKit Skeletons: 4 esqueletos con la paleta oscurecida del juego.
//   · KayKit Adventurers «corruptos»: los aventureros teñidos por la magia de Morvath.
// Cada tipo se carga una sola vez (plantilla) y se clona con su esqueleto para cada criatura.
import * as THREE from 'three';
import { clone as clonarConEsqueleto } from 'three/addons/utils/SkeletonUtils.js';
import { cargarModelo, cargarPaleta, ajustarAltura, Animador } from './modelos.js';

// archivo: modelo en assets/modelos/ · paleta: textura oscura · tinte: color de la corrupción
export const ENEMIGOS = {
  esqueleto_minion: { nombre: 'Esqueleto esbirro', archivo: 'enemigos/esqueleto_minion.glb', paleta: 'paleta_esqueleto_oscura.png', altura: 1.5 },
  esqueleto_warrior: { nombre: 'Esqueleto guerrero', archivo: 'enemigos/esqueleto_warrior.glb', paleta: 'paleta_esqueleto_oscura.png', altura: 1.8 },
  esqueleto_rogue: { nombre: 'Esqueleto pícaro', archivo: 'enemigos/esqueleto_rogue.glb', paleta: 'paleta_esqueleto_oscura.png', altura: 1.7 },
  esqueleto_mage: { nombre: 'Esqueleto hechicero', archivo: 'enemigos/esqueleto_mage.glb', paleta: 'paleta_esqueleto_oscura.png', altura: 1.8 },
  caballero_corrupto: { nombre: 'Caballero corrupto', archivo: 'caballero.glb', paleta: 'paleta_caballero_oscura.png', altura: 1.8, tinte: 0x9cffb0 },
  barbaro_corrupto: { nombre: 'Bárbaro corrupto', archivo: 'barbaro.glb', paleta: 'paleta_barbaro_oscura.png', altura: 1.8, tinte: 0xff9a8a },
  picara_corrupta: { nombre: 'Pícara corrupta', archivo: 'picaro.glb', paleta: 'paleta_picaro_oscura.png', altura: 1.7, tinte: 0xa0b8ff },
  encapuchado_corrupto: { nombre: 'Encapuchado corrupto', archivo: 'protagonista.glb', paleta: 'paleta_picaro_oscura.png', altura: 1.7, tinte: 0xd0ff7a },
  mago_corrupto: { nombre: 'Mago corrupto', archivo: 'aldric.glb', paleta: 'paleta_mago_oscura.png', altura: 1.8, tinte: 0xc8a0ff },
};
export const TIPOS_ENEMIGO = Object.keys(ENEMIGOS);

const ANIMS = {
  andar: ['Walking_A', 'Walking_B'],
  quieto: ['Idle', 'Unarmed_Idle'],
  golpe: ['Hit_A', 'Hit_B'],
  muerte: ['Death_A', 'Death_B'],
  ataque: ['1H_Melee_Attack_Chop', 'Unarmed_Melee_Attack_Punch_A'],
};

const plantillas = new Map();
export function cargarEnemigo(tipo) {
  if (!plantillas.has(tipo)) {
    const def = ENEMIGOS[tipo];
    const promesa = (async () => {
      const [gltf, paleta] = await Promise.all([cargarModelo(`assets/modelos/${def.archivo}`), cargarPaleta(`assets/texturas/${def.paleta}`)]);
      const modelo = gltf.scene;
      // fuera armas y escudos; a los corruptos, también sombreros, capas y cascos (más fantasmales)
      for (const n of ['handslotr', 'handslotl']) modelo.getObjectByName(n)?.children.forEach((c) => { c.visible = false; });
      modelo.traverse((o) => {
        if (!o.isMesh) return;
        if (def.tinte && /Hat|Cape|Helmet/.test(o.name)) { o.visible = false; return; }
        o.material = Object.assign(o.material.clone(), { map: paleta, roughness: 0.85, metalness: 0 });
        if (def.tinte) {
          // conservan sus colores de verdad, con un velo de la magia de Morvath
          o.material.color.set(0xffffff).lerp(new THREE.Color(def.tinte), 0.2);
          o.material.emissive = new THREE.Color(def.tinte).multiplyScalar(0.04);
        }
        // los ojos de los esqueletos brillan en la oscuridad
        if (/Eyes/.test(o.name)) { o.material.emissive = new THREE.Color(0x7fff9a); o.material.emissiveIntensity = 1.6; }
        o.castShadow = false;
      });
      ajustarAltura(modelo, def.altura);
      const clips = gltf.animations;
      const buscar = (lista) => lista.find((n) => clips.some((c) => c.name === n)) ?? null;
      const anims = Object.fromEntries(Object.entries(ANIMS).map(([k, lista]) => [k, buscar(lista)]));
      return { tipo, def, modelo, clips, anims };
    })();
    promesa.catch(() => plantillas.delete(tipo));
    plantillas.set(tipo, promesa);
  }
  return plantillas.get(tipo);
}

// Criatura lista para colocar: { g (grupo), anim, plantilla }
export function crearEnemigo(plantilla) {
  const m = clonarConEsqueleto(plantilla.modelo);
  m.traverse((o) => { if (o.isMesh) o.material = o.material.clone(); });
  const g = new THREE.Group();
  g.add(m);
  const anim = new Animador(m, plantilla.clips);
  if (plantilla.anims.andar) anim.bucle(plantilla.anims.andar, 0.9);
  return { g, anim, plantilla, modelo: m };
}
