// Hechizos aleatorios de la varita: proyectil con estela y explosión.
// Una sola luz reutilizada para no recompilar shaders al lanzar.
import * as THREE from 'three';

export const SPELLS = [
  { nombre: 'Bola de fuego', rgb: [4, 1.4, 0.3], hex: 0xff7a2a, speed: 13, size: 0.2 },
  { nombre: 'Lanza de escarcha', rgb: [1.2, 2.6, 4], hex: 0x9fe8ff, speed: 18, size: 0.14 },
  { nombre: 'Orbe del vacío', rgb: [2.4, 0.8, 4], hex: 0xb36bff, speed: 10, size: 0.26 },
  { nombre: 'Rayo tormentoso', rgb: [4, 4, 1.4], hex: 0xfff27a, speed: 24, size: 0.12 },
  { nombre: 'Torbellino de espinas', rgb: [1, 3.5, 1.2], hex: 0x7dff8a, speed: 12, size: 0.18 },
];

export class SpellSystem {
  constructor(scene, fx) {
    this.scene = scene;
    this.fx = fx;
    this.active = [];
    this.light = new THREE.PointLight(0xffffff, 0, 12, 1.6);
    scene.add(this.light);
    this.flash = 0;
    this.geo = new THREE.SphereGeometry(1, 16, 12);
  }

  cast(spell, from, target, fallback, onHit) {
    const mat = new THREE.MeshBasicMaterial();
    mat.color.setRGB(...spell.rgb);
    const mesh = new THREE.Mesh(this.geo, mat);
    mesh.scale.setScalar(spell.size);
    mesh.position.copy(from);
    this.scene.add(mesh);
    this.light.color.setHex(spell.hex);
    this.fx.big.emit(from, { count: 25, color: spell.hex, intensity: 2, speed: 2, life: 0.5 });
    this.active.push({ spell, mesh, target, dest: fallback.clone(), onHit, t: 0 });
  }

  fizzle(pos) {
    this.fx.big.emit(pos, { count: 25, color: 0x777777, intensity: 0.6, speed: 0.8, up: 0.8, life: 1.2, drag: 2 });
    this.fx.small.emit(pos, { count: 15, color: 0xaa66ff, intensity: 1, speed: 1.5, life: 0.5 });
  }

  update(dt) {
    this.flash = Math.max(0, this.flash - dt * 3);
    let lightOn = false;
    for (let i = this.active.length - 1; i >= 0; i--) {
      const a = this.active[i];
      a.t += dt;
      const dest = a.target ? a.target() : a.dest;
      const dir = dest.clone().sub(a.mesh.position);
      const dist = dir.length();
      const step = a.spell.speed * dt;
      if (dist <= step + 0.25 || a.t > 4) {
        this.explode(a.mesh.position, a.spell);
        this.scene.remove(a.mesh);
        a.mesh.material.dispose();
        this.active.splice(i, 1);
        a.onHit && a.onHit();
        continue;
      }
      dir.multiplyScalar(1 / dist);
      a.mesh.position.addScaledVector(dir, step);
      a.mesh.position.y += Math.sin(a.t * 18) * 0.01;
      this.fx.small.emit(a.mesh.position, { count: 4, color: a.spell.hex, intensity: 2, speed: 0.6, life: 0.5, jitter: a.spell.size });
      this.light.position.copy(a.mesh.position);
      lightOn = true;
    }
    this.light.intensity = lightOn ? 18 : this.flash * 25;
  }

  explode(pos, spell) {
    this.fx.big.emit(pos, { count: 45, color: spell.hex, intensity: 1.2, speed: 5, life: 0.8, drag: 2 });
    this.fx.small.emit(pos, { count: 70, color: spell.hex, intensity: 1.2, speed: 7, life: 0.6, drag: 3 });
    this.light.position.copy(pos);
    this.flash = 1;
  }
}
