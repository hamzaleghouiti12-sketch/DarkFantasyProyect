// La «chispa de Morvath»: un fuego fatuo que aparece de vez en cuando cerca del jugador
// y revolotea. Quien la alcanza se lleva una pregunta relámpago con premio. Es opcional:
// si nadie la caza, se apaga sola. Sin luces nuevas (no recompila sombreadores).
import * as THREE from 'three';

export function crearChispa(escena, fx) {
  const nucleo = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.2, 4.5) }));
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), new THREE.MeshBasicMaterial({ color: 0xb06bff, transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending }));
  const grupo = new THREE.Group();
  grupo.add(nucleo, halo);
  grupo.visible = false;
  escena.add(grupo);

  const centro = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  let vida = 0, fase = 0, rastro = 0;

  return {
    get activa() { return grupo.visible; },
    get pos() { return grupo.position; },
    aparecer(cerca, seg = 25) {
      const a = Math.random() * Math.PI * 2;
      centro.set(cerca.x + Math.cos(a) * 5, cerca.y + 1.3, cerca.z + Math.sin(a) * 5);
      grupo.position.copy(centro);
      grupo.visible = true;
      vida = seg;
      fase = Math.random() * 10;
      fx.big.emit(centro, { count: 40, color: 0xb06bff, intensity: 2.2, speed: 2.5, life: 0.9 });
    },
    apagar(estallido = false) {
      if (!grupo.visible) return;
      fx.big.emit(grupo.position, estallido
        ? { count: 70, color: 0xffd27a, intensity: 2.4, speed: 4, life: 1, gravity: -2 }
        : { count: 25, color: 0x8a7aa0, intensity: 0.8, speed: 1, up: 0.6, life: 1.2 });
      grupo.visible = false;
    },
    // devuelve true el fotograma en que el jugador la alcanza
    update(dt, t, jugador, limitar) {
      if (!grupo.visible) return false;
      vida -= dt;
      if (vida <= 0) { this.apagar(); return false; }
      fase += dt;
      // revolotea en lazos alrededor de su centro, que se aleja un poco del jugador
      tmp.set(centro.x - jugador.x, 0, centro.z - jugador.z);
      const d = tmp.length();
      if (d < 3.5 && d > 0.01) centro.addScaledVector(tmp.normalize(), dt * 1.1);
      if (limitar) limitar(centro, centro.z);
      grupo.position.set(
        centro.x + Math.sin(fase * 1.7) * 1.4,
        centro.y + Math.sin(fase * 2.9) * 0.35,
        centro.z + Math.cos(fase * 1.3) * 1.4,
      );
      if (limitar) limitar(grupo.position, grupo.position.z);
      const pulso = 1 + Math.sin(t * 9) * 0.15;
      halo.scale.setScalar(pulso * (vida < 5 ? 0.6 + 0.4 * Math.abs(Math.sin(t * 6)) : 1));
      rastro -= dt;
      if (rastro <= 0) { rastro = 0.04; fx.small.emit(grupo.position, { count: 2, color: 0xc8a8ff, intensity: 2, speed: 0.3, life: 0.6, jitter: 0.1 }); }
      return Math.hypot(grupo.position.x - jugador.x, grupo.position.z - jugador.z) < 1.3 && Math.abs(grupo.position.y - (jugador.y + 1.2)) < 1.4;
    },
  };
}
