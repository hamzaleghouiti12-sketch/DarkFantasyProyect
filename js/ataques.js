// Ataques con el arma de cada personaje (tecla R). Cuatro tipos:
//   tajo (espada, arco por delante) · giro (hacha, todo alrededor) ·
//   disparo (ballesta, virote que vuela en línea recta) · puñalada (dagas, doble y rápida).
// Los golpes solo tienen efecto sobre las «dianas» de la zona (las criaturas del
// Piso VIII: las aturden). En el resto de pisos son un gesto visual y sonoro.
import * as THREE from 'three';
import { alcanza } from './armas.js';

const tmp = new THREE.Vector3();

export function crearAtaques({ escena, fx, sonido }) {
  const yo = { sonido };
  const pendientes = []; // golpes que esperan a que la animación llegue al impacto
  const virotes = [];
  const virMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.8, 1.0) });
  const virGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6).rotateX(Math.PI / 2);

  function golpear(d, alGolpear) {
    fx.big.emit(tmp.copy(d.group.position).setY(1.2), { count: 30, color: 0xffe0a0, intensity: 2.2, speed: 3, life: 0.6, gravity: -3 });
    yo.sonido?.impacto();
    alGolpear?.(d);
  }

  function ejecutar({ ataque, origen, dir, dianas, alGolpear }) {
    const frente = (m) => tmp.set(origen.x + dir.x * m, origen.y + 1.1, origen.z + dir.z * m);
    switch (ataque.tipo) {
      case 'tajo':
        for (let a = -60; a <= 60; a += 12) {
          const r = (a * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
          const x = dir.x * c - dir.z * s, z = dir.x * s + dir.z * c;
          fx.small.emit(tmp.set(origen.x + x * 2, origen.y + 1.1, origen.z + z * 2), { count: 4, color: 0xdfe8ff, intensity: 2, speed: 0.6, life: 0.35 });
        }
        break;
      case 'giro':
        for (let a = 0; a < 360; a += 15) {
          const r = (a * Math.PI) / 180;
          fx.small.emit(tmp.set(origen.x + Math.cos(r) * 2.4, origen.y + 0.6, origen.z + Math.sin(r) * 2.4), { count: 4, color: 0xffb070, intensity: 2, speed: 0.8, life: 0.45 });
        }
        fx.big.emit(tmp.set(origen.x, origen.y + 0.2, origen.z), { count: 30, color: 0x8a7a6a, intensity: 0.8, speed: 3, up: 0.3, life: 0.8 });
        break;
      case 'punalada':
        fx.small.emit(frente(1.1), { count: 14, color: 0xc8ffd8, intensity: 2.2, speed: 1.5, life: 0.3 });
        break;
      case 'disparo': {
        const m = new THREE.Mesh(virGeo, virMat);
        m.position.set(origen.x + dir.x * 0.6, origen.y + 1.3, origen.z + dir.z * 0.6);
        m.lookAt(m.position.x + dir.x, m.position.y, m.position.z + dir.z);
        escena.add(m);
        virotes.push({ m, dir: dir.clone(), recorrido: 0, alcance: ataque.alcance, dianas, alGolpear });
        return;
      }
    }
    for (const d of dianas) if (d.alive && alcanza(origen, dir, d.group.position, ataque.alcance, ataque.arco)) golpear(d, alGolpear);
  }

  return Object.assign(yo, {
    // lanza un ataque: el efecto llega tras el «retardo» de la animación
    lanzar(ataque, origen, dir, dianas, alGolpear) {
      yo.sonido?.ataque(ataque.tipo);
      const golpe = { ataque, origen: origen.clone(), dir: dir.clone().normalize(), dianas, alGolpear };
      pendientes.push({ t: ataque.retardo ?? 0.2, golpe });
      if (ataque.tipo === 'punalada') pendientes.push({ t: (ataque.retardo ?? 0.2) + 0.18, golpe }); // la segunda daga
    },
    update(dt) {
      for (let i = pendientes.length - 1; i >= 0; i--) {
        pendientes[i].t -= dt;
        if (pendientes[i].t <= 0) ejecutar(pendientes.splice(i, 1)[0].golpe);
      }
      for (let i = virotes.length - 1; i >= 0; i--) {
        const v = virotes[i];
        const paso = 30 * dt;
        v.m.position.addScaledVector(v.dir, paso);
        v.recorrido += paso;
        fx.small.emit(v.m.position, { count: 1, color: 0xffe0a0, intensity: 1.5, speed: 0.1, life: 0.25 });
        const diana = v.dianas.find((d) => d.alive && Math.hypot(d.group.position.x - v.m.position.x, d.group.position.z - v.m.position.z) < 0.8);
        if (diana || v.recorrido > v.alcance) {
          if (diana) golpear(diana, v.alGolpear);
          escena.remove(v.m);
          virotes.splice(i, 1);
        }
      }
    },
  });
}
