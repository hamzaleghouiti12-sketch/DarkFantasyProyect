// Sistema de partículas ligero (brasas, polvo, explosiones de hechizos).
// Mezcla aditiva: al apagarse el color a negro, la partícula desaparece.
import * as THREE from 'three';
import { glowTexture } from './textures.js';

const tmpColor = new THREE.Color();

export class Particles {
  constructor(scene, max, size) {
    this.max = max;
    this.pos = new Float32Array(max * 3);
    this.col = new Float32Array(max * 3);
    this.vel = new Float32Array(max * 3);
    this.base = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    this.maxLife = new Float32Array(max);
    this.grav = new Float32Array(max);
    this.drag = new Float32Array(max);
    this.next = 0;
    for (let i = 0; i < max; i++) this.pos[i * 3 + 1] = -999;

    const geo = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(this.pos, 3);
    this.colAttr = new THREE.BufferAttribute(this.col, 3);
    geo.setAttribute('position', this.posAttr);
    geo.setAttribute('color', this.colAttr);
    const mat = new THREE.PointsMaterial({
      size, map: glowTexture(), vertexColors: true, transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    });
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  emit(p, o = {}) {
    const {
      count = 20, color = 0xffffff, intensity = 1, speed = 2, up = 0, life = 1,
      lifeVar = 0.4, gravity = 0, drag = 1, jitter = 0.1, dir = null,
    } = o;
    tmpColor.set(color).multiplyScalar(intensity);
    for (let n = 0; n < count; n++) {
      const k = this.next;
      this.next = (this.next + 1) % this.max;
      const i3 = k * 3;
      this.pos[i3] = p.x + (Math.random() - 0.5) * jitter;
      this.pos[i3 + 1] = p.y + (Math.random() - 0.5) * jitter;
      this.pos[i3 + 2] = p.z + (Math.random() - 0.5) * jitter;
      // dirección aleatoria en la esfera
      const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
      const sp = speed * (0.3 + Math.random() * 0.7);
      this.vel[i3] = s * Math.cos(th) * sp + (dir ? dir.x : 0);
      this.vel[i3 + 1] = u * sp + up + (dir ? dir.y : 0);
      this.vel[i3 + 2] = s * Math.sin(th) * sp + (dir ? dir.z : 0);
      this.base[i3] = tmpColor.r;
      this.base[i3 + 1] = tmpColor.g;
      this.base[i3 + 2] = tmpColor.b;
      const l = life * (1 - lifeVar + Math.random() * lifeVar * 2);
      this.life[k] = this.maxLife[k] = l;
      this.grav[k] = gravity;
      this.drag[k] = drag;
    }
  }

  update(dt) {
    const { pos, col, vel, base, life, maxLife } = this;
    for (let k = 0; k < this.max; k++) {
      if (life[k] <= 0) continue;
      const i3 = k * 3;
      life[k] -= dt;
      if (life[k] <= 0) {
        pos[i3 + 1] = -999;
        col[i3] = col[i3 + 1] = col[i3 + 2] = 0;
        continue;
      }
      const d = Math.max(0, 1 - this.drag[k] * dt);
      vel[i3] *= d;
      vel[i3 + 1] = vel[i3 + 1] * d + this.grav[k] * dt;
      vel[i3 + 2] *= d;
      pos[i3] += vel[i3] * dt;
      pos[i3 + 1] += vel[i3 + 1] * dt;
      pos[i3 + 2] += vel[i3 + 2] * dt;
      const f = life[k] / maxLife[k];
      const a = f > 0.8 ? (1 - f) * 5 : f / 0.8; // entra rápido, se apaga despacio
      col[i3] = base[i3] * a;
      col[i3 + 1] = base[i3 + 1] * a;
      col[i3 + 2] = base[i3 + 2] * a;
    }
    this.posAttr.needsUpdate = true;
    this.colAttr.needsUpdate = true;
  }
}
