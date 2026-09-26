// Piso I: la Cámara de los Sellos. Sala de piedra con columnas, antorchas,
// el cartel del guardián (oeste), el altar de cristales (este), los
// pergaminos flotantes y la puerta sellada del norte.
import * as THREE from 'three';
import * as TX from './textures.js';

// puerta: medio ancho del hueco de la puerta norte; escalera: z donde empieza
// la escalera tras la puerta (null = suelo plano); salida: z que termina el piso
export const ROOM = { W: 12, L: 18, H: 9, puerta: 1.8, escalera: null, salida: -19.2 };

const std = (o) => new THREE.MeshStandardMaterial(o);
const glowMat = (r, g, b, extra = {}) => {
  const m = new THREE.MeshBasicMaterial({ ...extra });
  m.color.setRGB(r, g, b);
  return m;
};

function shadowed(mesh, cast = true, receive = true) {
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  return mesh;
}

export function buildWorld(scene, fx, content) {
  const { W, L, H } = ROOM;
  const world = {
    colliders: [], torches: [], scrolls: [], crystals: [], dust: 0,
  };
  const add = (m) => (scene.add(m), m);
  // "estructura" agrupa todo lo que se sustituye por piezas de KayKit (mazmorra.js);
  // si esas piezas no cargan, esta versión hecha por código queda como respaldo
  const estructura = add(new THREE.Group());
  const addE = (m) => (estructura.add(m), m);
  const techo = add(new THREE.Group());
  world.estructura = estructura;
  world.techo = techo;

  // ---------- Suelo, techo y paredes ----------
  const floorC = TX.stoneFloorCanvas();
  const floor = addE(new THREE.Mesh(
    new THREE.PlaneGeometry(W * 2, L * 2),
    std({ map: TX.canvasTex(floorC, 6, 9), bumpMap: TX.canvasTex(floorC, 6, 9, false), bumpScale: 3, roughness: 0.9, color: 0xb8aeac }),
  ));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;

  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, L * 2), std({ color: 0x0d0b0d, roughness: 1 }));
  techo.add(ceil);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = H;
  const beamMat = std({ map: TX.canvasTex(TX.woodCanvas(), 1, 4), color: 0x6b5244, roughness: 0.85 });
  for (let z = -15; z <= 15; z += 6) {
    const beam = shadowed(new THREE.Mesh(new THREE.BoxGeometry(W * 2, 0.5, 0.5), beamMat));
    beam.position.set(0, H - 0.3, z);
    techo.add(beam);
  }

  const brickC = TX.brickCanvas();
  function wall(w, h, x, y, z, ry) {
    const m = addE(new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      std({ map: TX.canvasTex(brickC, w / 4, h / 4), bumpMap: TX.canvasTex(brickC, w / 4, h / 4, false), bumpScale: 3, roughness: 0.95, color: 0xa39692 }),
    ));
    m.position.set(x, y, z);
    m.rotation.y = ry;
    m.receiveShadow = true;
    return m;
  }
  wall(W * 2, H, 0, H / 2, L, Math.PI);
  wall(L * 2, H, -W, H / 2, 0, Math.PI / 2);
  wall(L * 2, H, W, H / 2, 0, -Math.PI / 2);
  const segW = W - 2.2;
  wall(segW, H, -(2.2 + segW / 2), H / 2, -L, 0);
  wall(segW, H, 2.2 + segW / 2, H / 2, -L, 0);
  wall(4.4, H - 5.2, 0, 5.2 + (H - 5.2) / 2, -L, 0);

  // zócalo
  const trimMat = std({ map: TX.canvasTex(floorC, 8, 0.25), color: 0x7a7070, roughness: 0.9 });
  for (const [w, x, z, rot] of [[W * 2, 0, L - 0.15, 0], [L * 2, -W + 0.15, 0, 1], [L * 2, W - 0.15, 0, 1], [segW, -(2.2 + segW / 2), -L + 0.15, 0], [segW, 2.2 + segW / 2, -L + 0.15, 0]]) {
    const t = addE(shadowed(new THREE.Mesh(new THREE.BoxGeometry(w, 0.45, 0.3), trimMat), false));
    t.position.set(x, 0.22, z);
    if (rot) t.rotation.y = Math.PI / 2;
  }

  // ---------- Columnas con antorchas ----------
  const stoneMat = std({ map: TX.canvasTex(floorC, 1, 3), color: 0x8f8688, roughness: 0.9 });
  const ironMat = std({ color: 0x2a2a2f, metalness: 0.8, roughness: 0.45 });
  for (const sx of [-1, 1]) {
    for (const z of [-12, 0, 12]) {
      const x = sx * 9;
      addE(shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.7, H, 14), stoneMat))).position.set(x, H / 2, z);
      addE(shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.6, 1.7), stoneMat))).position.set(x, 0.3, z);
      addE(shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 1.6), stoneMat))).position.set(x, H - 0.25, z);
      world.colliders.push({ x, z, r: 1.05, tag: 'pilar' });

      const tx = x - sx * 0.78;
      const bracket = addE(new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.1), ironMat));
      bracket.position.set(x - sx * 0.6, 2.85, z);
      const stick = addE(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.55, 8), std({ color: 0x3b2618, roughness: 0.9 })));
      stick.position.set(tx, 3.0, z);
      const flame = add(new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.42, 10), glowMat(4, 1.6, 0.35)));
      flame.position.set(tx, 3.45, z);
      const core = add(new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 8), glowMat(5, 4, 1.5)));
      core.position.set(tx, 3.36, z);
      const light = add(new THREE.PointLight(0xff8a3d, 30, 15, 1.7));
      light.position.set(tx - sx * 0.3, 3.6, z);
      world.torches.push({ light, flame, core, sx, x, z, pos: new THREE.Vector3(tx, 3.6, z), seed: Math.random() * 100, t: 0 });
    }
  }

  // ---------- Estandartes y ventanas ----------
  const bannerTex = TX.canvasTex(TX.bannerCanvas());
  for (const sx of [-1, 1]) {
    for (const z of [-6, 6]) {
      const b = addE(new THREE.Mesh(new THREE.PlaneGeometry(1.8, 4.5), std({ map: bannerTex, transparent: true, alphaTest: 0.5, roughness: 0.95, side: THREE.DoubleSide })));
      b.position.set(sx * (W - 0.06), 5.2, z);
      b.rotation.y = -sx * Math.PI / 2;
      const rod = addE(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 8), ironMat));
      rod.rotation.x = Math.PI / 2;
      rod.position.set(sx * (W - 0.12), 7.5, z);
    }
    for (const z of [-15, 15]) {
      const win = addE(new THREE.Mesh(new THREE.PlaneGeometry(1.3, 3.2), glowMat(0.28, 0.4, 0.85)));
      win.position.set(sx * (W - 0.05), 5.6, z);
      win.rotation.y = -sx * Math.PI / 2;
      const arch = addE(new THREE.Mesh(new THREE.CircleGeometry(0.65, 20, 0, Math.PI), glowMat(0.28, 0.4, 0.85)));
      arch.position.set(sx * (W - 0.05), 7.2, z);
      arch.rotation.y = -sx * Math.PI / 2;
      for (const dz of [-0.22, 0.22]) {
        const bar = addE(new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.9, 0.06), ironMat));
        bar.position.set(sx * (W - 0.1), 5.9, z + dz);
      }
    }
  }

  // ---------- Círculo rúnico central ----------
  const runeCircle = add(new THREE.Mesh(
    new THREE.PlaneGeometry(7, 7),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(TX.runeCircleCanvas()), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
  ));
  runeCircle.material.color.setRGB(0.55, 0.28, 1.0);
  runeCircle.rotation.x = -Math.PI / 2;
  runeCircle.position.set(0, 0.07, 4);

  // ---------- Barriles, cajas y escombros ----------
  const barrelMat = std({ map: TX.canvasTex(TX.woodCanvas(), 2, 1), color: 0x8a6a50, roughness: 0.85 });
  for (const [x, z] of [[-10.6, 16.2], [-9.6, 16.8], [10.7, -15.6], [-10.7, -9.3]]) {
    addE(shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.4, 1.1, 14), barrelMat))).position.set(x, 0.55, z);
    world.colliders.push({ x, z, r: 0.5, tag: 'decor' });
  }
  for (const [x, z, s, ry] of [[10.4, 16.2, 1.1, 0.3], [9.3, 16.7, 0.8, -0.2], [10.6, 8.6, 0.9, 0.6]]) {
    const cr = addE(shadowed(new THREE.Mesh(new THREE.BoxGeometry(s, s, s), barrelMat)));
    cr.position.set(x, s / 2, z);
    cr.rotation.y = ry;
    world.colliders.push({ x, z, r: s * 0.7, tag: 'decor' });
  }
  const rubbleMat = std({ color: 0x5b5354, roughness: 1 });
  const rr = TX.rng(99);
  for (let i = 0; i < 40; i++) {
    const side = rr() < 0.5 ? -1 : 1;
    const rock = addE(shadowed(new THREE.Mesh(new THREE.DodecahedronGeometry(0.08 + rr() * 0.18, 0), rubbleMat)));
    rock.position.set(side * (W - 0.4 - rr() * 1.2), 0.06, -L + 1 + rr() * (L * 2 - 2));
    rock.rotation.set(rr() * 3, rr() * 3, rr() * 3);
  }

  // ---------- Puerta del norte ----------
  const woodTex = TX.canvasTex(TX.woodCanvas(), 1, 1);
  for (const sx of [-1, 1]) {
    addE(shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.8, 0.9), stoneMat))).position.set(sx * 2.6, 2.9, -L + 0.3);
    world.colliders.push({ x: sx * 2.6, z: -L + 0.3, r: 0.6, tag: 'decor' });
  }
  addE(shadowed(new THREE.Mesh(new THREE.BoxGeometry(6, 0.8, 0.9), stoneMat))).position.set(0, 5.8, -L + 0.3);
  const archDeco = addE(new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.22, 8, 28, Math.PI), stoneMat));
  archDeco.position.set(0, 6.2, -L + 0.3);

  const door = new THREE.Group();
  door.position.set(0, 2.6, -L - 0.2);
  addE(door);
  door.add(shadowed(new THREE.Mesh(new THREE.BoxGeometry(4.4, 5.2, 0.25), std({ map: woodTex, color: 0x6e5040, roughness: 0.8 }))));
  for (const y of [-1.8, 1.8]) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.16, 0.32), ironMat);
    band.position.y = y;
    door.add(band);
  }
  const runeMats = [];
  [-1.25, 0, 1.25].forEach((x, i) => {
    const m = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(TX.runeGlyphCanvas(i + 1)), transparent: true, depthWrite: false });
    m.color.setRGB(0.16, 0.14, 0.2);
    const rune = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.95), m);
    rune.position.set(x, 0.3, 0.14);
    door.add(rune);
    runeMats.push(m);
  });

  // pasillo y escalera tras la puerta
  const corrMat = std({ map: TX.canvasTex(brickC, 3, 2), color: 0x8a7e7a, roughness: 0.95 });
  for (const sx of [-1, 1]) {
    addE(new THREE.Mesh(new THREE.BoxGeometry(0.4, H, 12), corrMat)).position.set(sx * 2.4, H / 2, -L - 6);
  }
  const corrFloor = addE(new THREE.Mesh(new THREE.PlaneGeometry(4.4, 12), std({ map: TX.canvasTex(floorC, 1, 3), color: 0x9a9090 })));
  corrFloor.rotation.x = -Math.PI / 2;
  corrFloor.position.set(0, 0.001, -L - 6);
  for (let i = 0; i < 9; i++) {
    const h = 0.32 * (i + 1);
    addE(shadowed(new THREE.Mesh(new THREE.BoxGeometry(4.4, h, 0.75), stoneMat))).position.set(0, h / 2, -L - 2.2 - i * 0.75);
  }
  const portal = add(new THREE.Mesh(new THREE.PlaneGeometry(4.4, 9), glowMat(0.6, 0.25, 1.2)));
  portal.position.set(0, 4.5, -L - 11.5);
  const doorLight = add(new THREE.PointLight(0xa070ff, 0, 18, 1.4));
  doorLight.position.set(0, 4, -L - 3);

  world.door = {
    group: door, runeMats, light: doorLight, portal, opening: false, t: 0,
    runePos: [-1.25, 0, 1.25].map((x) => new THREE.Vector3(x, 2.9, -L)),
    // cómo se abre la puerta (e va de 0 a 1); mazmorra.js lo cambia por una hoja que gira
    animar: (e) => { door.position.y = 2.6 + e * 5.6; },
  };
  world.lightRune = (i) => {
    runeMats[i].color.setRGB(2.4, 1.2, 4.0);
    fx.big.emit(world.door.runePos[i], { count: 50, color: 0xb06bff, intensity: 2.2, speed: 3, life: 1.1, gravity: -1 });
  };
  world.openDoor = () => { world.door.opening = true; };

  // ---------- Cartel del guardián (oeste) ----------
  const signPos = new THREE.Vector3(-7, 0, 5);
  const postMat = std({ color: 0x3e2a1c, roughness: 0.9 });
  for (const dz of [-0.95, 0.95]) {
    add(shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.9, 8), postMat))).position.set(signPos.x, 1.45, signPos.z + dz);
  }
  const signFace = std({ map: TX.canvasTex(TX.signCanvas()), roughness: 0.8 });
  const signSide = std({ color: 0x3e2a1c });
  const board = add(shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.5, 2.2), [signFace, signSide, signSide, signSide, signSide, signSide])));
  board.position.set(signPos.x + 0.1, 2.1, signPos.z);
  const signMark = add(TX.makeLabel('?', { fontSize: 64, weight: 900, font: 'Cinzel, serif', color: '#9fe6ff', height: 0.55 }));
  signMark.position.set(signPos.x + 0.2, 3.35, signPos.z);
  world.colliders.push({ x: signPos.x, z: signPos.z, r: 1.1 });
  world.sign = { pos: signPos, mark: signMark };

  // ---------- Altar de los cristales (este) ----------
  const C = new THREE.Vector3(8.4, 0, 3);
  add(shadowed(new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.5, 0.3, 36), stoneMat), false)).position.set(C.x, 0.15, C.z);
  add(shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.6, 0.7), stoneMat))).position.set(C.x, 1.6, C.z);
  const orb = add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 14), glowMat(1.0, 2.2, 3.5)));
  orb.position.set(C.x, 3.25, C.z);
  const altarLight = add(new THREE.PointLight(0x66aaff, 10, 10, 1.6));
  altarLight.position.set(C.x - 0.5, 3.4, C.z);
  world.colliders.push({ x: C.x, z: C.z, r: 0.95 });
  world.altar = { center: C, orb, light: altarLight };

  const angles = [0.62, 0.87, 1.13, 1.38];
  content.altar.forEach((opt, i) => {
    const a = angles[i] * Math.PI;
    const p = new THREE.Vector3(C.x + Math.cos(a) * 2.6, 0, C.z + Math.sin(a) * 2.6);
    addE(shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.1, 0.6), stoneMat))).position.set(p.x, 0.85, p.z);
    const mat = std({ color: 0x9ad4ff, emissive: 0x2a6cff, emissiveIntensity: 1.4, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.92 });
    const crystal = add(shadowed(new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), mat), true, false));
    crystal.position.set(p.x, 1.8, p.z);
    crystal.scale.y = 1.5;
    const label = add(TX.makeLabel(opt.texto, { height: 0.34 }));
    label.position.set(p.x, 2.45 + (i % 2) * 0.42, p.z);
    world.colliders.push({ x: p.x, z: p.z, r: 0.45 });
    world.crystals.push({ ...opt, pos: p, mesh: crystal, mat, label, flash: 0, focus: false, done: false });
  });
  world.flashCrystal = (c, good) => {
    c.flash = 1;
    c.mat.emissive.set(good ? 0xffd070 : 0xff2a2a);
    const p = c.mesh.position;
    fx.big.emit(p, { count: good ? 70 : 40, color: good ? 0xffd27a : 0xff4030, intensity: 2.2, speed: good ? 4 : 2.5, life: 1, gravity: good ? -2 : -5 });
  };

  // ---------- Pergaminos flotantes (norte) ----------
  const Z = new THREE.Vector3(0, 0, -8);
  const zoneRing = add(new THREE.Mesh(new THREE.RingGeometry(5.5, 5.7, 72), glowMat(0.5, 0.25, 0.9, { transparent: true, opacity: 0.7, side: THREE.DoubleSide })));
  zoneRing.rotation.x = -Math.PI / 2;
  zoneRing.position.set(Z.x, 0.07, Z.z);
  const paperTex = TX.canvasTex(TX.parchmentCanvas());
  const paperMat = std({ map: paperTex, roughness: 0.9, side: THREE.DoubleSide, emissive: 0x3a2a10, emissiveIntensity: 0.4 });
  const rodMat = std({ color: 0x4a2f1c, roughness: 0.8 });
  content.pergaminos.forEach((data, i) => {
    const g = new THREE.Group();
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1.9),
      new THREE.MeshBasicMaterial({ map: TX.glowTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.35 }),
    );
    glow.material.color.setRGB(1.6, 1.1, 0.5);
    glow.position.z = -0.05;
    g.add(glow);
    g.add(shadowed(new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.2), paperMat), true, false));
    for (const y of [-0.62, 0.62]) {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 8), rodMat);
      rod.rotation.z = Math.PI / 2;
      rod.position.y = y;
      g.add(rod);
    }
    const label = TX.makeLabel(data.de, { height: 0.26, fontSize: 40 });
    label.position.y = 1.0;
    g.add(label);
    add(g);
    world.scrolls.push({ data, group: g, glow, alive: true, dying: 0, angle: (i / content.pergaminos.length) * Math.PI * 2, bob: i * 1.7, targeted: false });
  });
  world.scrollZone = Z;
  world.destroyScroll = (s, fraud) => {
    s.alive = false;
    s.dying = 0.001;
    const p = s.group.position;
    fx.big.emit(p, { count: 50, color: fraud ? 0xff7a2a : 0xffd27a, intensity: 1.3, speed: 4.5, life: 1.1, gravity: -2 });
    fx.small.emit(p, { count: 90, color: 0xffb060, intensity: 1.4, speed: 3, life: 1.6, gravity: 1.5, up: 1 });
  };

  // ---------- Animación del mundo ----------
  const tmp = new THREE.Vector3();
  world.update = (dt, t, camera) => {
    for (const tc of world.torches) {
      const f = 0.82 + 0.12 * Math.sin(t * 13 + tc.seed) + 0.08 * Math.sin(t * 29 + tc.seed * 3);
      tc.light.intensity = 42 * f;
      tc.flame.scale.set(1, 0.85 + f * 0.3, 1);
      tc.t -= dt;
      if (tc.t <= 0) {
        tc.t = 0.07 + Math.random() * 0.08;
        fx.small.emit(tc.pos, { count: 1, color: 0xff8030, intensity: 2.5, speed: 0.3, up: 1.1, life: 1.4, jitter: 0.15, drag: 0.5 });
      }
    }
    // polvo en suspensión
    world.dust -= dt;
    if (world.dust <= 0) {
      world.dust = 0.05;
      tmp.set((Math.random() - 0.5) * W * 1.8, Math.random() * 6, (Math.random() - 0.5) * L * 1.8);
      fx.small.emit(tmp, { count: 1, color: 0x8899cc, intensity: 0.5, speed: 0.12, life: 5, drag: 0.1 });
    }

    runeCircle.material.opacity = 0.45 + 0.25 * Math.sin(t * 1.3);
    signMark.position.y = 3.35 + Math.sin(t * 2.2) * 0.1;
    orb.position.y = 3.25 + Math.sin(t * 1.5) * 0.08;
    altarLight.intensity = 10 + Math.sin(t * 3) * 1.5;

    for (const c of world.crystals) {
      c.mesh.rotation.y += dt * (c.focus ? 2.4 : 0.8);
      const s = c.focus ? 1.25 : 1;
      c.mesh.scale.lerp(tmp.set(s, s * 1.5, s), Math.min(1, dt * 8));
      if (c.flash > 0) {
        c.flash = Math.max(0, c.flash - dt * 0.8);
        if (c.flash === 0 && !c.done) c.mat.emissive.set(0x2a6cff);
      }
      c.mesh.position.y = 1.8 + Math.sin(t * 2 + c.pos.x) * 0.06;
    }

    for (const s of world.scrolls) {
      if (!s.group.visible) continue;
      s.angle += dt * 0.13;
      const bobY = 1.9 + Math.sin(t * 1.3 + s.bob) * 0.15;
      if (s.dying > 0) {
        s.dying += dt;
        const k = Math.max(0, 1 - s.dying * 1.6);
        s.group.scale.setScalar(k);
        s.group.position.y += dt * 1.5;
        if (k === 0) s.group.visible = false;
        continue;
      }
      if (s.released) {
        s.group.position.y += dt * 0.8;
        s.glow.material.opacity = Math.max(0, s.glow.material.opacity - dt * 0.2);
        if (s.group.position.y > H - 0.5) s.group.visible = false;
      } else {
        s.group.position.set(Z.x + Math.cos(s.angle) * 3.6, bobY, Z.z + Math.sin(s.angle) * 3.6);
      }
      s.group.lookAt(camera.position.x, s.group.position.y, camera.position.z);
      const target = s.targeted ? 1.0 : 0.35;
      s.glow.material.opacity += (target - s.glow.material.opacity) * Math.min(1, dt * 6);
    }

    const d = world.door;
    if (d.opening && d.t < 1) {
      d.t = Math.min(1, d.t + dt * 0.4);
      const e = d.t * d.t * (3 - 2 * d.t);
      d.animar(e);
      d.light.intensity = e * 40;
      if (Math.random() < 0.6) fx.small.emit(tmp.set((Math.random() - 0.5) * 4.4, 0.1, -L), { count: 2, color: 0x8a8080, intensity: 0.6, speed: 0.8, up: 0.5, life: 1.5 });
    }
  };

  // ---------- La zona "piso1" (límites, suelo, cámara y guía del holograma) ----------
  world.zona = {
    id: 'piso1', grupo: scene, colliders: world.colliders,
    musica: 'torre', pisada: 'piedra', camDist: 6.5,
    niebla: { color: 0x07060b, densidad: 0.028 }, luz: { luna: 1.3, cielo: 1.1 },
    suelo(p) {
      // tras la puerta hay una escalera: el suelo sube 1 m por cada metro
      return ROOM.escalera !== null && p.z < ROOM.escalera ? Math.min(4, ROOM.escalera - p.z) : 0;
    },
    limitar(p, prevZ) {
      // paredes; la puerta del norte deja pasar solo cuando está abierta
      const edge = ROOM.L - 0.6;
      p.x = Math.max(-ROOM.W + 0.6, Math.min(ROOM.W - 0.6, p.x));
      p.z = Math.min(ROOM.L - 0.6, p.z);
      if (p.z < -edge) {
        const hueco = p.z > -ROOM.L - 1 ? ROOM.puerta : 1.6; // el marco es estrecho; la escalera, más ancha
        const enPuerta = Math.abs(p.x) < ROOM.puerta;
        if (!world.door.opening || (prevZ >= -edge && !enPuerta)) p.z = -edge;
        else p.x = Math.max(-hueco, Math.min(hueco, p.x));
      }
    },
    limitarCamara(c, jugador) {
      c.x = Math.max(-ROOM.W + 0.4, Math.min(ROOM.W - 0.4, c.x));
      c.z = Math.min(ROOM.L - 0.4, c.z);
      if (jugador.z >= -ROOM.L) c.z = Math.max(-ROOM.L + 0.4, c.z);
      c.y = Math.max(0.5, Math.min(ROOM.H - 0.5, c.y));
    },
    guiaHolograma(d, jugador) {
      d.x = Math.max(-ROOM.W + 0.8, Math.min(ROOM.W - 0.8, d.x));
      d.z = Math.min(ROOM.L - 0.8, d.z);
      // cerca de la puerta y en la escalera va detrás del jugador, sin atravesar muros
      if (jugador.z < -ROOM.L + 1.5) d.set(jugador.x * 0.4, 0, jugador.z + 1.4);
    },
  };

  return world;
}
