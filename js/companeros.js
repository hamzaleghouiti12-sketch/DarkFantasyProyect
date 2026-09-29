// Los compañeros de equipo: copias animadas del protagonista que se mueven
// según las posiciones que llegan por la red (suavizadas para que no den saltos).
import * as THREE from 'three';
import { Animador } from './modelos.js';
import { makeLabel } from './textures.js';
import { instanciar } from './personajes.js';

// color de la capa de cada jugador (0 = original, 1 = azulado, 2 = verdoso)
export const TINTES = [0xffffff, 0xa9c4ff, 0xb9f0b0];
const BORDES = ['rgba(212,175,106,0.9)', 'rgba(140,180,255,0.95)', 'rgba(150,230,140,0.95)'];

// Nombre y, debajo, la etiqueta que cada jugador elige para su personaje.
export function crearEtiqueta(nombre, lema, color) {
  const g = new THREE.Group();
  const n = makeLabel(nombre || 'Aprendiz', { height: 0.3, border: BORDES[color] ?? BORDES[0] });
  n.position.y = 2.3;
  g.add(n);
  if (lema) {
    const l = makeLabel(lema, { height: 0.22, fontSize: 38, weight: 500, color: '#e8c98a', bg: 'rgba(12,9,16,0.6)', border: 'rgba(212,175,106,0.35)' });
    l.position.y = 2.02;
    g.add(l);
  }
  return g;
}

export const claveCompanero = (info) => `${info.personaje}|${info.etiqueta}|${info.color}`;

function lerpAngulo(a, b, k) {
  const d = ((((b - a + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;
  return a + d * k;
}

export class Companero {
  // plantilla: el personaje elegido ya cargado (o null si no se pudo cargar)
  constructor(escena, info, plantilla) {
    this.escena = escena;
    this.info = info;
    this.clave = claveCompanero(info);
    this.group = new THREE.Group();
    this.group.visible = false; // hasta que llegue su primera posición
    escena.add(this.group);
    if (plantilla) {
      const m = instanciar(plantilla);
      m.traverse((o) => { if (o.isMesh && o.name !== 'punta') o.material.color.set(TINTES[info.color] ?? 0xffffff); });
      this.group.add(m);
      this.anim = new Animador(m, plantilla.clips);
      this.anim.bucle('Idle');
    } else {
      const cuerpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 1.1, 4, 10), new THREE.MeshStandardMaterial({ color: TINTES[info.color] }));
      cuerpo.position.y = 0.9;
      this.group.add(cuerpo);
    }
    this.group.add(crearEtiqueta(info.nombre, info.etiqueta, info.color));
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

  // al cambiar de personaje se conserva la posición y lo último recibido
  heredar(otro) {
    this.destino.copy(otro.destino);
    this.giro = otro.giro;
    this.group.position.copy(otro.group.position);
    this.group.rotation.y = otro.group.rotation.y;
    this.group.visible = otro.group.visible;
  }

  quitar() { this.escena.remove(this.group); }
}
