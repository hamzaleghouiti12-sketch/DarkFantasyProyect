// El protagonista: un alumno con sudadera y mochila (viene de nuestro mundo)
// y la varita de Aldric. Movimiento relativo a la cámara, salto y colisiones.
import * as THREE from 'three';
import { ROOM } from './world.js';
import { Animador, aplicarPaleta, ajustarAltura, ocultar } from './modelos.js';

const RADIUS = 0.35;

function lerpAngle(a, b, k) {
  const d = ((((b - a + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;
  return a + d * k;
}

export class Player {
  constructor(scene) {
    this.group = new THREE.Group();
    this.body = new THREE.Group();
    this.group.add(this.body);
    scene.add(this.group);
    this.vel = new THREE.Vector3();
    this.onGround = true;
    this.facing = Math.PI;
    this.phase = 0;
    this.cast = 0;
    this.build();
  }

  get pos() { return this.group.position; }

  build() {
    const mat = (color, rough = 0.8) => new THREE.MeshStandardMaterial({ color, roughness: rough });
    const skin = mat(0xd9a27c, 0.7), hoodie = mat(0x2f6a9a, 0.85), pants = mat(0x26262e), shoe = mat(0x151515), hair = mat(0x2b1a10, 0.9);
    const m = (geo, material, parent, x, y, z) => {
      const mesh = new THREE.Mesh(geo, material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      parent.add(mesh);
      return mesh;
    };

    this.legs = [];
    for (const sx of [-1, 1]) {
      const hip = new THREE.Group();
      hip.position.set(sx * 0.13, 0.88, 0);
      this.body.add(hip);
      m(new THREE.CylinderGeometry(0.095, 0.085, 0.8, 10), pants, hip, 0, -0.4, 0);
      m(new THREE.BoxGeometry(0.17, 0.1, 0.3), shoe, hip, 0, -0.83, 0.05);
      this.legs.push(hip);
    }
    const torso = m(new THREE.CapsuleGeometry(0.23, 0.36, 4, 12), hoodie, this.body, 0, 1.22, 0);
    torso.scale.z = 0.72;
    m(new THREE.SphereGeometry(0.19, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), hoodie, this.body, 0, 1.46, -0.1).rotation.x = -0.9;
    m(new THREE.BoxGeometry(0.36, 0.42, 0.16), mat(0x6b3b2a), this.body, 0, 1.22, -0.22);

    const head = new THREE.Group();
    head.position.set(0, 1.73, 0);
    this.body.add(head);
    this.head = head;
    m(new THREE.SphereGeometry(0.2, 20, 16), skin, head, 0, 0, 0);
    const hairMesh = m(new THREE.SphereGeometry(0.215, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, head, 0, 0.02, -0.01);
    hairMesh.rotation.x = -0.35;
    for (const sx of [-1, 1]) m(new THREE.SphereGeometry(0.026, 8, 6), mat(0x111111, 0.3), head, sx * 0.07, 0.02, 0.18);

    this.arms = [];
    for (const sx of [-1, 1]) {
      const sh = new THREE.Group();
      sh.position.set(sx * 0.33, 1.46, 0);
      this.body.add(sh);
      m(new THREE.CylinderGeometry(0.075, 0.062, 0.58, 10), hoodie, sh, 0, -0.29, 0);
      m(new THREE.SphereGeometry(0.07, 10, 8), skin, sh, 0, -0.61, 0);
      this.arms.push(sh);
    }
    // la mano derecha del personaje está en -x (mira hacia +z)
    const wand = new THREE.Group();
    wand.position.set(0, -0.63, 0);
    this.arms[0].add(wand);
    const stick = m(new THREE.CylinderGeometry(0.018, 0.012, 0.5, 8), mat(0x3a2415, 0.6), wand, 0, 0, 0.22);
    stick.rotation.x = Math.PI / 2;
    const tipMat = new THREE.MeshBasicMaterial();
    tipMat.color.setRGB(2.2, 1.3, 3.5);
    this.tip = m(new THREE.SphereGeometry(0.045, 10, 8), tipMat, wand, 0, 0, 0.48);
    this.tipMat = tipMat;
  }

  // Sustituye el muñeco hecho por código por un modelo animado (KayKit).
  // Si la carga falla, el juego sigue con el muñeco original.
  usarModelo(gltf, varitaGltf, paleta, paletaVarita) {
    const modelo = gltf.scene;
    ocultar(modelo, ['Knife_Offhand', '1H_Crossbow', '2H_Crossbow', 'Knife', 'Throwable']);
    aplicarPaleta(modelo, paleta);
    ajustarAltura(modelo, 1.8);

    // GLTFLoader quita los puntos de los nombres: "handslot.r" → "handslotr"
    const mano = modelo.getObjectByName('handslotr') || modelo.getObjectByName('handslot.r');
    if (!mano) throw new Error('El modelo no tiene punto de agarre en la mano derecha');
    const varita = varitaGltf.scene;
    aplicarPaleta(varita, paletaVarita);
    mano.add(varita);
    const punta = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), this.tipMat);
    punta.position.set(0, 0.72, 0);
    varita.add(punta);

    this.body.visible = false;
    this.group.add(modelo);
    this.modelo = modelo;
    this.tip = punta;
    this.anim = new Animador(modelo, gltf.animations);
    this.anim.bucle('Idle');
  }

  castAnim() {
    this.cast = 0.7;
    this.anim?.unaVezSolo('Spellcast_Shoot', 1.3);
  }

  celebrar() { this.anim?.unaVezSolo('Cheer'); }

  golpe() { this.anim?.unaVezSolo('Hit_A'); }

  wandTip(v) { return this.tip.getWorldPosition(v); }

  update(dt, input, camYaw, colliders, doorOpen, t) {
    const fx = -Math.sin(camYaw), fz = -Math.cos(camYaw);
    const rx = Math.cos(camYaw), rz = -Math.sin(camYaw);
    let mx = fx * input.z + rx * input.x;
    let mz = fz * input.z + rz * input.x;
    const len = Math.hypot(mx, mz);
    if (len > 0) { mx /= len; mz /= len; }
    const top = input.run ? 7 : 4.2;
    const k = Math.min(1, dt * 10);
    this.vel.x += (mx * top - this.vel.x) * k;
    this.vel.z += (mz * top - this.vel.z) * k;
    if (len > 0) this.facing = lerpAngle(this.facing, Math.atan2(mx, mz), Math.min(1, dt * 12));

    if (input.jump && this.onGround) {
      this.vel.y = 5.8;
      this.onGround = false;
    }
    this.vel.y -= 16 * dt;

    const p = this.group.position;
    const prevZ = p.z;
    p.addScaledVector(this.vel, dt);
    // tras la puerta hay una escalera: el suelo sube 1 m por cada metro
    const suelo = ROOM.escalera !== null && p.z < ROOM.escalera ? Math.min(4, ROOM.escalera - p.z) : 0;
    if (p.y <= suelo) {
      p.y = suelo;
      this.vel.y = 0;
      this.onGround = true;
    }

    for (const c of colliders) {
      const dx = p.x - c.x, dz = p.z - c.z;
      const d = Math.hypot(dx, dz), min = c.r + RADIUS;
      if (d < min && d > 1e-4) {
        p.x = c.x + (dx / d) * min;
        p.z = c.z + (dz / d) * min;
      }
    }

    // paredes; la puerta del norte deja pasar solo cuando está abierta
    const edge = ROOM.L - 0.6;
    p.x = Math.max(-ROOM.W + 0.6, Math.min(ROOM.W - 0.6, p.x));
    p.z = Math.min(ROOM.L - 0.6, p.z);
    if (p.z < -edge) {
      const hueco = p.z > -ROOM.L - 1 ? ROOM.puerta : 1.6; // el marco es estrecho; la escalera, más ancha
      const inDoorway = Math.abs(p.x) < ROOM.puerta;
      if (!doorOpen || (prevZ >= -edge && !inDoorway)) p.z = -edge;
      else p.x = Math.max(-hueco, Math.min(hueco, p.x));
    }

    this.group.rotation.y = this.facing;

    const speed = Math.hypot(this.vel.x, this.vel.z);
    const pulse = 1 + Math.sin(t * 5) * 0.25 + (this.cast > 0 ? 1.5 : 0);
    this.tipMat.color.setRGB(2.2 * pulse, 1.3 * pulse, 3.5 * pulse);
    this.cast = Math.max(0, this.cast - dt);

    if (this.anim) {
      if (!this.onGround) this.anim.bucle('Jump_Idle');
      else if (speed > 5) this.anim.bucle('Running_A', speed / 6);
      else if (speed > 0.4) this.anim.bucle('Walking_A', Math.max(0.6, speed / 3.2));
      else this.anim.bucle('Idle');
      this.anim.update(dt);
      return;
    }

    // animación de caminar del muñeco hecho por código
    const amt = Math.min(1, speed / 4.2);
    this.phase += dt * (3 + speed * 1.7);
    const sw = Math.sin(this.phase);
    const air = this.onGround ? 0 : 1;
    this.legs[0].rotation.x = sw * 0.75 * amt - air * 0.4;
    this.legs[1].rotation.x = -sw * 0.75 * amt + air * 0.2;
    this.arms[1].rotation.x = -sw * 0.6 * amt;
    const armTarget = this.cast > 0 ? -1.5 : sw * 0.6 * amt;
    this.arms[0].rotation.x += (armTarget - this.arms[0].rotation.x) * Math.min(1, dt * (this.cast > 0 ? 20 : 8));
    this.body.position.y = Math.abs(sw) * 0.05 * amt;
    this.head.rotation.y = Math.sin(t * 0.7) * 0.15 * (1 - amt);
  }
}
