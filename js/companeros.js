// Los compañeros de equipo: copias animadas del protagonista que se mueven
// según las posiciones que llegan por la red (suavizadas para que no den saltos).
import * as THREE from 'three';
import { clone as clonarConEsqueleto } from 'three/addons/utils/SkeletonUtils.js';
import { Animador } from './modelos.js';
import { makeLabel } from './textures.js';

// color de la capa de cada jugador (0 = original, 1 = azulado, 2 = verdoso)
export const TINTES = [0xffffff, 0xa9c4ff, 0xb9f0b0];
const BORDES = ['rgba(212,175,106,0.9)', 'rgba(140,180,255,0.95)', 'rgba(150,230,140,0.95)'];

function lerpAngulo(a, b, k) {
  const d = ((((b - a + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;
  return a + d * k;
}

export class Companero {
  constructor(escena, jugador, info) {
    this.escena = escena;
    this.info = info;
    this.group = new THREE.Group();
    this.group.visible = false; // hasta que llegue su primera posición
    escena.add(this.group);
    if (jugador.modelo) {
      const m = clonarConEsqueleto(jugador.modelo);
      m.traverse((o) => {
        if (!o.isMesh) return;
        o.material = o.material.clone();
        o.material.color.set(TINTES[info.color] ?? 0xffffff);
      });
      this.group.add(m);
      this.anim = new Animador(m, jugador.clips);
      this.anim.bucle('Idle');
    } else {
      const cuerpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 1.1, 4, 10), new THREE.MeshStandardMaterial({ color: TINTES[info.color] }));
      cuerpo.position.y = 0.9;
      this.group.add(cuerpo);
    }
    const etiqueta = makeLabel(info.nombre, { height: 0.3, border: BORDES[info.color] });
    etiqueta.position.y = 2.25;
    this.group.add(etiqueta);
    this.destino = new THREE.Vector3();
    this.giro = 0;
    this.contador = 0;
  }

  recibir(m) {
    this.destino.set(m.x, m.y, m.z);
    this.giro = m.f;
    if (!this.group.visible) {
      this.group.position.copy(this.destino);
      this.group.rotation.y = m.f;
      this.group.visible = true;
    }
    if (this.anim) {
      this.anim.bucle(m.a || 'Idle', m.av || 1);
      if (m.oc !== this.contador) {
        this.contador = m.oc;
        if (m.o) this.anim.unaVezSolo(m.o);
      }
    }
    const varita = this.group.getObjectByName('varita'); // la varita viaja dentro del clon
    if (varita && typeof m.v === 'boolean') varita.visible = m.v;
  }

  update(dt) {
    const k = 1 - Math.exp(-dt * 12);
    this.group.position.lerp(this.destino, k);
    this.group.rotation.y = lerpAngulo(this.group.rotation.y, this.giro, k);
    this.anim?.update(dt);
  }

  quitar() { this.escena.remove(this.group); }
}
