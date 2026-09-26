// El exterior: el camino desde la casa de Aldric hasta la torre de Morvath.
// Está en x = +400. La casa queda al sur, la torre al norte y un camino de
// tierra las une pasando junto a un cementerio, una cripta y un santuario.
// El arco al pie de la torre es un portal que lleva al Piso I.
import * as THREE from 'three';
import { cargarPiezas, colocador } from './modelos.js';
import * as TX from './textures.js';

export const EXT_O = new THREE.Vector3(400, 0, 0);
const RADIO = 68; // el jugador no puede alejarse más de esto del centro
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const glow = (r, g, b, extra = {}) => {
  const m = new THREE.MeshBasicMaterial(extra);
  m.color.setRGB(r, g, b);
  return m;
};

// camino (coordenadas locales): de la puerta de la casa al arco de la torre
const PUNTOS = [[0, 50], [-5, 40], [-11, 27], [-9, 13], [1, 3], [9, -9], [9, -23], [3, -34], [0, -43]];
export const LUGARES = {
  casa: [0, 58], torre: [0, -63], arco: [0, -46],
  cementerio: [-24, 8], cripta: [-26, -12], santuario: [15, -18],
};

function sueloCanvas() {
  const s = 512, c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d'), r = TX.rng(17);
  ctx.fillStyle = '#1d2419';
  ctx.fillRect(0, 0, s, s);
  for (let i = 0; i < 2600; i++) {
    const v = r();
    ctx.fillStyle = v < 0.5 ? `rgba(44,58,38,${0.3 + r() * 0.4})` : v < 0.8 ? `rgba(20,26,18,${0.4 + r() * 0.4})` : `rgba(60,52,40,${0.2 + r() * 0.3})`;
    const w = 2 + r() * 10, h = 2 + r() * 10;
    ctx.fillRect(r() * s, r() * s, w, h);
  }
  // briznas
  ctx.strokeStyle = 'rgba(70,90,60,0.35)';
  for (let i = 0; i < 900; i++) {
    const x = r() * s, y = r() * s;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (r() - 0.5) * 4, y - 3 - r() * 5);
    ctx.stroke();
  }
  return c;
}

export function crearExterior(escena) {
  const O = EXT_O;
  const grupo = new THREE.Group();
  grupo.position.copy(O);
  escena.add(grupo);
  const aMundo = (x, z) => new THREE.Vector3(O.x + x, 0, O.z + z);

  const curva = new THREE.CatmullRomCurve3(PUNTOS.map(([x, z]) => new THREE.Vector3(x, 0, z)));
  const muestras = curva.getSpacedPoints(160);
  const distCamino = (x, z) => {
    let m = Infinity;
    for (const p of muestras) m = Math.min(m, Math.hypot(p.x - x, p.z - z));
    return m;
  };

  const zona = {
    id: 'exterior', grupo, colliders: [],
    musica: 'exterior', pisada: 'hierba', camDist: 6.5, lejos: 230,
    niebla: { color: 0x0d1326, densidad: 0.011 }, luz: { luna: 2.6, cielo: 1.8 },
    suelo: () => 0,
    limitar(p) {
      const dx = p.x - O.x, dz = p.z - O.z, d = Math.hypot(dx, dz);
      if (d > RADIO) {
        p.x = O.x + (dx / d) * RADIO;
        p.z = O.z + (dz / d) * RADIO;
      }
    },
    limitarCamara(c) { c.y = clamp(c.y, 0.5, 40); },
    guiaHolograma() {},
    entrada: { pos: aMundo(0, 50), mirada: Math.PI, yaw: 0 },
    lugares: Object.fromEntries(Object.entries(LUGARES).map(([k, [x, z]]) => [k, aMundo(x, z)])),
  };
  const obstaculo = (x, z, r) => zona.colliders.push({ x: O.x + x, z: O.z + z, r });

  // ---------- Suelo, cielo, luna y estrellas ----------
  const suelo = new THREE.Mesh(
    new THREE.PlaneGeometry(320, 320),
    new THREE.MeshStandardMaterial({ map: TX.canvasTex(sueloCanvas(), 40, 40), color: 0xc4d0bc, roughness: 1 }),
  );
  suelo.rotation.x = -Math.PI / 2;
  suelo.receiveShadow = true;
  grupo.add(suelo);

  const luna = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.glowTexture(), color: 0xcfe0ff, fog: false, depthWrite: false }));
  luna.material.color.setRGB(2.2, 2.4, 3);
  luna.scale.setScalar(26);
  luna.position.set(-90, 95, 60);
  grupo.add(luna);
  const disco = new THREE.Mesh(new THREE.CircleGeometry(4.2, 32), glow(1.6, 1.7, 2.0, { fog: false }));
  disco.position.copy(luna.position);
  disco.lookAt(0, 0, 0);
  grupo.add(disco);

  const n = 700, pos = new Float32Array(n * 3), r = TX.rng(3);
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, e = 0.15 + r() * 1.3, R = 190;
    pos.set([Math.cos(a) * Math.cos(e) * R, Math.sin(e) * R, Math.sin(a) * Math.cos(e) * R], i * 3);
  }
  const estrellasGeo = new THREE.BufferGeometry();
  estrellasGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  grupo.add(new THREE.Points(estrellasGeo, new THREE.PointsMaterial({ size: 0.9, color: 0xaebfe6, fog: false, sizeAttenuation: true })));

  // ---------- Portal al pie de la torre ----------
  const [ax, az] = LUGARES.arco;
  const veloMat = new THREE.MeshBasicMaterial({ map: TX.glowTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  veloMat.color.setRGB(1.2, 0.45, 2.2);
  const velo = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 4.2), veloMat);
  velo.position.set(ax, 2.1, az);
  grupo.add(velo);
  const runas = new THREE.Mesh(
    new THREE.CircleGeometry(3, 48),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(TX.runeCircleCanvas()), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  runas.material.color.setRGB(0.7, 0.3, 1.3);
  runas.rotation.x = -Math.PI / 2;
  runas.position.set(ax, 0.05, az + 1.2);
  grupo.add(runas);
  const luzArco = new THREE.PointLight(0xa060ff, 30, 16, 1.5);
  luzArco.position.set(ax, 3, az + 1.5);
  grupo.add(luzArco);
  zona.portal = { pos: aMundo(ax, az + 1.2) };

  // ---------- Farolas del camino ----------
  const farolas = [];
  [0.12, 0.34, 0.56, 0.78].forEach((t, i) => {
    const p = curva.getPointAt(t), tg = curva.getTangentAt(t);
    const lado = i % 2 ? 1 : -1;
    const x = p.x - tg.z * 2.6 * lado, z = p.z + tg.x * 2.6 * lado;
    const llama = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), glow(4, 2.4, 0.8));
    grupo.add(llama);
    let luz = null;
    if (i < 3) {
      luz = new THREE.PointLight(0xffa050, 16, 14, 1.6);
      grupo.add(luz);
    }
    farolas.push({ x, z, ry: Math.atan2(-tg.z * lado, tg.x * lado) + Math.PI / 2, llama, luz, semilla: i * 7 });
    obstaculo(x, z, 0.4);
  });
  const luzSantuario = new THREE.PointLight(0xffb060, 9, 8, 1.6);
  luzSantuario.position.set(LUGARES.santuario[0], 1.6, LUGARES.santuario[1] + 0.8);
  grupo.add(luzSantuario);

  // ---------- Animación ----------
  let wisp = 0;
  zona.update = (dt, t, fx, jugador) => {
    velo.material.opacity = 0.75 + Math.sin(t * 2.3) * 0.2;
    runas.rotation.z += dt * 0.3;
    luzArco.intensity = 30 + Math.sin(t * 3) * 6;
    for (const f of farolas) {
      const k = 0.85 + 0.1 * Math.sin(t * 9 + f.semilla) + 0.05 * Math.sin(t * 23 + f.semilla);
      if (f.luz) f.luz.intensity = 16 * k;
      f.llama.scale.setScalar(0.9 + k * 0.2);
    }
    luzSantuario.intensity = 9 * (0.85 + 0.15 * Math.sin(t * 11));
    // fuegos fatuos alrededor del jugador
    wisp -= dt;
    if (wisp <= 0 && jugador) {
      wisp = 0.12;
      const a = Math.random() * Math.PI * 2, d = 4 + Math.random() * 14;
      fx.small.emit(new THREE.Vector3(jugador.x + Math.cos(a) * d, 0.4 + Math.random() * 2.5, jugador.z + Math.sin(a) * d), { count: 1, color: 0x7fe0c0, intensity: 0.9, speed: 0.15, life: 4, drag: 0.2 });
    }
    if (Math.random() < dt * 20) {
      fx.small.emit(new THREE.Vector3(O.x + ax + (Math.random() - 0.5) * 3, Math.random() * 4, O.z + az + 0.3), { count: 1, color: 0xb07bff, intensity: 2, speed: 0.5, up: 0.6, life: 1.4 });
    }
  };

  // ---------- Piezas de KayKit (Halloween + Medieval) ----------
  zona.vestir = async (paletaHalloween, paletaMedieval) => {
    const nh = ['tree_dead_large', 'tree_dead_medium', 'tree_dead_small', 'tree_pine_orange_large', 'tree_pine_orange_medium', 'tree_pine_yellow_large',
      'gravestone', 'grave_A', 'grave_B', 'gravemarker_A', 'fence', 'fence_broken', 'fence_pillar', 'fence_gate', 'lantern_standing', 'post_lantern',
      'path_A', 'path_B', 'path_C', 'path_D', 'crypt', 'shrine_candles', 'arch_gate', 'skull', 'bench', 'bone_A', 'ribcage', 'pumpkin_orange_jackolantern'];
    const nm = ['building_tower_B_red', 'building_home_B_red', 'mountain_A', 'mountain_B_grass_trees', 'mountain_C_grass_trees', 'hills_A_trees', 'hills_B_trees',
      'trees_A_large', 'trees_B_large', 'rock_single_A', 'rock_single_C', 'rock_single_E'];
    const [ph, pm] = await Promise.all([
      cargarPiezas('assets/modelos/exterior', nh, paletaHalloween, 'gltf'),
      cargarPiezas('assets/modelos/exterior', nm, paletaMedieval, 'gltf'),
    ]);
    const poner = colocador(grupo, { ...ph, ...pm });
    const azar = TX.rng(21);

    // la casa de Aldric y la torre
    poner('building_home_B_red', LUGARES.casa[0], 0, LUGARES.casa[1], Math.PI, 6.5);
    obstaculo(LUGARES.casa[0] - 1.5, LUGARES.casa[1], 3.2);
    obstaculo(LUGARES.casa[0] + 1.5, LUGARES.casa[1], 3.2);
    poner('building_tower_B_red', LUGARES.torre[0], 0, LUGARES.torre[1], 0, 18);
    obstaculo(LUGARES.torre[0], LUGARES.torre[1], 11.5);
    poner('arch_gate', ax, 0, az, 0, 1);
    obstaculo(ax - 2, az, 0.5);
    obstaculo(ax + 2, az, 0.5);

    // el camino
    const tipos = ['path_A', 'path_B', 'path_C', 'path_D'];
    for (const p of curva.getSpacedPoints(Math.round(curva.getLength() / 1.7))) {
      poner(tipos[Math.floor(azar() * 4)], p.x, 0.01, p.z, Math.floor(azar() * 4) * (Math.PI / 2), 1.25, false);
    }
    for (const f of farolas) {
      poner('post_lantern', f.x, 0, f.z, f.ry);
      const lx = f.x + Math.sin(f.ry) * 1.2, lz = f.z + Math.cos(f.ry) * 1.2;
      f.llama.position.set(lx, 2.55, lz);
      if (f.luz) f.luz.position.set(lx, 2.6, lz);
    }

    // cementerio vallado
    const [cx, cz] = LUGARES.cementerio;
    const x0 = cx - 8, x1 = cx + 8, z0 = cz - 6, z1 = cz + 6;
    for (let x = x0 + 2; x < x1; x += 4) {
      poner(azar() < 0.25 ? 'fence_broken' : 'fence', x, 0, z0);
      poner('fence', x, 0, z1);
      for (let k = -1.5; k <= 1.5; k += 1.5) { obstaculo(x + k, z0, 0.35); obstaculo(x + k, z1, 0.35); }
    }
    for (let z = z0 + 2; z < z1; z += 4) {
      poner('fence', x0, 0, z, Math.PI / 2);
      for (let k = -1.5; k <= 1.5; k += 1.5) obstaculo(x0, z + k, 0.35);
      if (Math.abs(z - cz) < 1) { poner('fence_gate', x1, 0, z, Math.PI / 2); continue; }
      poner('fence', x1, 0, z, Math.PI / 2);
      for (let k = -1.5; k <= 1.5; k += 1.5) obstaculo(x1, z + k, 0.35);
    }
    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) poner('fence_pillar', x, 0, z);
    const tumbas = ['gravestone', 'grave_A', 'grave_B', 'gravemarker_A'];
    for (let i = 0; i < 9; i++) {
      const x = x0 + 2 + (i % 3) * 5 + azar() * 1.2, z = z0 + 2.5 + Math.floor(i / 3) * 3.5;
      poner(tumbas[i % 4], x, 0, z, Math.PI / 2 + (azar() - 0.5) * 0.3);
      obstaculo(x, z, 0.6);
    }
    poner('lantern_standing', cx + 6.5, 0, cz - 4.5);
    poner('skull', cx - 5, 0, cz + 4.4, 1.3);
    poner('ribcage', cx + 2, 0, cz + 4.6, 0.4);
    poner('bench', x1 + 3, 0, cz + 4, -Math.PI / 2);
    obstaculo(x1 + 3, cz + 4, 0.8);

    // cripta y santuario
    const [kx, kz] = LUGARES.cripta;
    poner('crypt', kx, 0, kz, Math.PI / 2);
    obstaculo(kx - 2, kz, 3.4);
    obstaculo(kx + 2, kz, 3.4);
    const [sx, sz] = LUGARES.santuario;
    poner('shrine_candles', sx, 0, sz, -Math.PI / 2);
    obstaculo(sx, sz, 0.7);
    poner('pumpkin_orange_jackolantern', sx - 1.2, 0, sz + 1.4, -1);
    poner('bone_A', 5, 0, -30, 0.8);

    // árboles: nunca sobre el camino ni sobre los lugares importantes
    const libres = (x, z, margen) => distCamino(x, z) > margen
      && Object.values(LUGARES).every(([lx, lz]) => Math.hypot(lx - x, lz - z) > 12);
    const arboles = [
      ['tree_dead_large', 1, 0.6], ['tree_dead_medium', 1, 0.5], ['tree_dead_small', 1, 0.4],
      ['tree_pine_orange_large', 1, 1.3], ['tree_pine_orange_medium', 1, 1.0], ['tree_pine_yellow_large', 1, 1.3],
      ['trees_A_large', 5, 3.4], ['trees_B_large', 5, 3.4],
    ];
    let colocados = 0;
    for (let intento = 0; intento < 900 && colocados < 120; intento++) {
      const a = azar() * Math.PI * 2, d = 7 + Math.sqrt(azar()) * 66;
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      const [nombre, escala, radio] = arboles[Math.floor(azar() * arboles.length)];
      if (!libres(x, z, 4.5 + radio)) continue;
      const e = escala * (0.8 + azar() * 0.45);
      poner(nombre, x, 0, z, azar() * Math.PI * 2, e);
      if (d < RADIO + 2) obstaculo(x, z, radio * e / escala);
      colocados++;
    }
    for (let i = 0; i < 26; i++) {
      const a = azar() * Math.PI * 2, d = 6 + azar() * 60;
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (!libres(x, z, 2.5)) continue;
      poner(['rock_single_A', 'rock_single_C', 'rock_single_E'][i % 3], x, 0, z, azar() * 6, 6 + azar() * 5);
    }

    // anillo de colinas y montañas al fondo (fuera del alcance del jugador)
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + azar() * 0.2;
      poner(i % 2 ? 'hills_A_trees' : 'hills_B_trees', Math.cos(a) * 84, 0, Math.sin(a) * 84, azar() * 6, 9 + azar() * 4, false);
    }
    const montes = ['mountain_A', 'mountain_B_grass_trees', 'mountain_C_grass_trees'];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + azar() * 0.25, d = 112 + azar() * 22;
      poner(montes[i % 3], Math.cos(a) * d, 0, Math.sin(a) * d, azar() * 6, 26 + azar() * 16, false);
    }
  };

  return zona;
}
