// Viste la Cámara de los Sellos con piezas de KayKit Dungeon Remastered (CC0).
// Las piezas encajan en una cuadrícula de 4 m y la sala mide 24 x 36 m
// (6 x 9 baldosas), así que los desafíos no se mueven de sitio.
// Si algo falla al cargar, se queda la sala hecha por código (world.js).
import * as THREE from 'three';
import { ROOM } from './world.js';
import { cargarModelo } from './modelos.js';
import { rng } from './textures.js';

const PIEZAS = [
  'wall', 'wall_cracked', 'wall_arched', 'wall_archedwindow_gated', 'wall_pillar', 'wall_shelves', 'wall_doorway',
  'floor_tile_large', 'floor_tile_large_rocks', 'floor_tile_big_grate',
  'pillar', 'column', 'torch_mounted', 'stairs_walled',
  'banner_red', 'banner_shield_red', 'banner_thin_red',
  'barrel_small_stack', 'keg_decorated', 'crates_stacked', 'box_stacked', 'trunk_large_A', 'chest',
  'table_medium_decorated_A', 'rubble_half', 'sword_shield', 'candle_triple',
];

export async function cargarMazmorra(paleta) {
  const entradas = await Promise.all(PIEZAS.map(async (n) => [n, (await cargarModelo(`assets/modelos/mazmorra/${n}.glb`)).scene]));
  const piezas = Object.fromEntries(entradas);
  for (const pieza of Object.values(piezas)) {
    pieza.traverse((m) => {
      if (!m.isMesh) return;
      m.material = m.material.clone();
      m.material.map = paleta;
      m.material.roughness = 0.9;
      m.material.metalness = 0;
    });
  }
  return piezas;
}

export function vestirMazmorra(world, scene, piezas) {
  const { W, L } = ROOM;
  const WX = W + 0.4, WZ = L + 0.4; // centro de los muros (1 m de grosor)
  const azar = rng(7);
  const sala = new THREE.Group();
  scene.add(sala);

  const poner = (nombre, x, y, z, ry = 0, sombra = true) => {
    const o = piezas[nombre].clone(true);
    o.position.set(x, y, z);
    o.rotation.y = ry;
    o.traverse((m) => {
      if (!m.isMesh) return;
      m.castShadow = sombra;
      m.receiveShadow = true;
    });
    sala.add(o);
    return o;
  };
  const obstaculo = (x, z, r) => world.colliders.push({ x, z, r, tag: 'decor' });

  // fuera la versión hecha por código
  world.estructura.visible = false;
  for (let i = world.colliders.length - 1; i >= 0; i--) {
    if (world.colliders[i].tag === 'decor') world.colliders.splice(i, 1);
  }
  ROOM.H = 8; // dos filas de muros de 4 m
  world.techo.position.y = -1;

  // ---------- Suelo ----------
  for (let x = -10; x <= 10; x += 4) {
    for (let z = -16; z <= 16; z += 4) {
      const reja = (x === 10 && z === -8) || (x === -10 && z === 8);
      const borde = Math.abs(x) === 10 || Math.abs(z) === 16; // rocas solo junto a los muros, fuera del paso
      const nombre = reja ? 'floor_tile_big_grate' : borde && azar() < 0.4 ? 'floor_tile_large_rocks' : 'floor_tile_large';
      poner(nombre, x, 0, z, Math.floor(azar() * 4) * (Math.PI / 2), false);
    }
  }

  // ---------- Muros (dos filas) y ventanas ----------
  const cielo = new THREE.MeshBasicMaterial();
  cielo.color.setRGB(0.2, 0.3, 0.68);
  const ventana = (x, z, ry) => {
    poner('wall_archedwindow_gated', x, 4, z, ry, false);
    // luz de luna detrás de la reja
    const p = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.8), cielo);
    p.position.set(x - Math.sin(ry) * 0.8, 6, z - Math.cos(ry) * 0.8);
    p.rotation.y = ry;
    sala.add(p);
  };
  const variado = () => (azar() < 0.3 ? 'wall_cracked' : 'wall');

  // sur (entrada, mira hacia -z)
  for (const x of [-10, -6, -2, 2, 6, 10]) {
    poner(Math.abs(x) === 2 ? 'wall_arched' : variado(), x, 0, WZ, Math.PI, false);
    if (Math.abs(x) === 6) ventana(x, WZ, Math.PI);
    else poner('wall', x, 4, WZ, Math.PI, false);
  }
  // norte (la puerta queda centrada en x = 0; los extremos sobresalen por fuera)
  for (const x of [-12, -8, -4, 0, 4, 8, 12]) {
    if (x !== 0) poner(Math.abs(x) === 4 ? 'wall_pillar' : variado(), x, 0, -WZ, 0, false);
    poner('wall', x, 4, -WZ, 0, false);
  }
  // oeste y este
  for (const sx of [-1, 1]) {
    const ry = -sx * (Math.PI / 2);
    for (let z = -16; z <= 16; z += 4) {
      poner(z === -8 ? 'wall_shelves' : variado(), sx * WX, 0, z, ry, false);
      if (z === -8 || z === 0 || z === 8) ventana(sx * WX, z, ry);
      else poner('wall', sx * WX, 4, z, ry, false);
    }
    for (const z of [-4, 4]) poner('banner_red', sx * WX, 0, z, ry, false);
    poner('banner_shield_red', sx * WX, 0, 16, ry, false);
    poner('banner_thin_red', sx * WX, 0, -16, ry, false);
  }

  // ---------- Columnas con antorchas ----------
  for (const t of world.torches) {
    poner('pillar', t.x, 0, t.z);
    poner('pillar', t.x, 4, t.z);
    poner('torch_mounted', t.x - t.sx * 0.75, 2.75, t.z, -t.sx * (Math.PI / 2));
    const px = t.x - t.sx * 1.15;
    t.flame.position.set(px, 3.5, t.z);
    t.core.position.set(px, 3.42, t.z);
    t.light.position.set(px - t.sx * 0.3, 3.7, t.z);
    t.pos.set(px, 3.65, t.z);
  }

  // ---------- Puerta norte con su hoja giratoria ----------
  const portada = poner('wall_doorway', 0, 0, -WZ, 0, false);
  const hoja = portada.getObjectByName('wall_doorway_door');
  const d = world.door;
  d.animar = (e) => { if (hoja) hoja.rotation.y = e * 1.75; };
  d.runePos = [-0.75, 0, 0.75].map((x) => new THREE.Vector3(x, 3.38, -WZ + 0.56));
  d.runeMats.forEach((mat, i) => {
    const runa = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.55), mat);
    runa.position.copy(d.runePos[i]);
    sala.add(runa);
  });
  ROOM.puerta = 0.62;

  // escalera que sube tras la puerta
  // la pieza sube hacia su z = 0, así que se coloca 4 m más allá para que suba alejándose
  poner('stairs_walled', 0, 0, -WZ - 4.5, 0);
  ROOM.escalera = -WZ - 0.5;
  ROOM.salida = -WZ - 2.2;
  d.portal.position.set(0, 6.5, -WZ - 4.8);
  d.light.position.set(0, 4.5, -WZ - 2.5);

  // ---------- Altar: pedestales de piedra ----------
  for (const c of world.crystals) poner('column', c.pos.x, 0, c.pos.z);
  const C = world.altar.center;
  for (const [dx, dz] of [[2.5, -1.3], [2.9, 0.2], [2.4, 1.6]]) poner('candle_triple', C.x + dx, 0.3, C.z + dz, azar() * 6);

  // ---------- Decorado ----------
  const deco = [
    ['barrel_small_stack', -10.2, 16.0, 0.3, 0.9],
    ['keg_decorated', -8.2, 16.6, 0.4, 0.7],
    ['box_stacked', 10.2, 16.0, -0.4, 1.0],
    ['crates_stacked', 10.1, -15.9, 0.3, 1.2],
    ['trunk_large_A', -10.6, -9.6, Math.PI / 2, 0.8],
    ['chest', 10.6, 8.6, -Math.PI / 2, 0.8],
    ['table_medium_decorated_A', 10.3, -4.6, -Math.PI / 2, 1.1],
    ['rubble_half', -10.2, -16.0, 0.3, 1.3],
  ];
  for (const [n, x, z, ry, r] of deco) {
    poner(n, x, 0, z, ry);
    obstaculo(x, z, r);
  }
  poner('candle_triple', -7.9, 0, 6.7, 1.2);
  poner('sword_shield', -6, 2.3, WZ - 0.52, Math.PI, false);
  poner('sword_shield', 6, 2.3, WZ - 0.52, Math.PI, false);

  world.sala = sala;
}
