// Guardianes que patrullan un piso (ver contenido/guardianes.js). Se mueven por su
// ruta según el tiempo de cada jugador (son decorativos); aturdirlos es local y
// desterrarlos es una acción compartida («guardian») que valida el anfitrión.
import * as THREE from 'three';
import { cargarEnemigo, crearEnemigo, ENEMIGOS } from '../enemigos.js';

// punto de una ruta cerrada a una distancia d del inicio
function enRuta(pts, d) {
  const lados = pts.map((p, i) => [p, pts[(i + 1) % pts.length]]);
  const largos = lados.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1]));
  const total = largos.reduce((s, l) => s + l, 0);
  let r = ((d % total) + total) % total;
  for (let i = 0; i < lados.length; i++) {
    if (r <= largos[i]) { const [a, b] = lados[i], k = r / largos[i]; return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; }
    r -= largos[i];
  }
  return pts[0];
}

export async function crearGuardianes(ctx, { pisoId, origen, lista, grupoVisible }) {
  const plantillas = await Promise.all(lista.map((g) => cargarEnemigo(g.tipo)));
  const tmp = new THREE.Vector3();
  const guardianes = lista.map((def, i) => {
    const p = plantillas[i];
    const e = crearEnemigo(p);
    e.g.visible = false;
    ctx.escena.add(e.g);
    return {
      ...def, ...e, group: e.g, alive: true, recorrido: Math.random() * 10, aturdido: 0, fuera: 0,
      data: { titulo: `${ENEMIGOS[def.tipo].nombre} de Morvath`, de: 'Guardián del piso', texto: 'Aturdidlo con vuestra arma (R) y desterradlo con la varita (F): os hará una pregunta de repaso.', accion: '<b>F</b> · desterrar con la varita' },
    };
  });
  const porId = (id) => guardianes.find((g) => g.id === id);

  return {
    dianas: () => guardianes.filter((g) => g.alive && g.g.visible),
    vivo: (id) => Boolean(porId(id)?.alive),
    alGolpear(g) {
      g.aturdido = 3;
      if (g.plantilla.anims.golpe) g.anim.unaVezSolo(g.plantilla.anims.golpe);
    },
    async alApuntar(g) {
      const q = ctx.preguntaRepaso?.();
      if (!q) return ctx.ui.dialogue(['Para desterrar a un guardián, la varita os pedirá algo que hayáis aprendido. Primero aprended algo en este piso.']);
      const ok = await ctx.ui.quiz(q, `Desterrar al ${ENEMIGOS[g.tipo].nombre.toLowerCase()}`);
      ctx.record(ok, q.criterio);
      if (!ok) { ctx.sonido.chisporroteo(); return; }
      ctx.accion('guardian', { piso: pisoId, id: g.id });
    },
    desterrar(id, soyAutor) {
      const g = porId(id);
      if (!g?.alive) return;
      g.alive = false;
      if (g.plantilla.anims.muerte) g.anim.unaVezSolo(g.plantilla.anims.muerte);
      ctx.fx.big.emit(tmp.copy(g.g.position).setY(1.2), { count: 60, color: 0xb08cff, intensity: 2.2, speed: 3.5, life: 1.1, gravity: -2 });
      ctx.sonido.acierto();
      if (soyAutor) ctx.addSaber(15);
      ctx.ui.toast(`✦ ${ENEMIGOS[g.tipo].nombre} desterrado`, 'good', 2800);
    },
    actualizar(dt, t) {
      const ver = grupoVisible();
      for (const g of guardianes) {
        g.g.visible = ver && g.fuera < 1;
        if (!g.g.visible) continue;
        if (!g.alive) {
          g.fuera = Math.min(1, g.fuera + dt * 0.7); // se desvanece tras la animación de muerte
          if (g.fuera > 0.5) g.g.scale.setScalar(Math.max(0.01, 2 - g.fuera * 2));
        } else if (g.aturdido > 0) {
          g.aturdido = Math.max(0, g.aturdido - dt);
          if (Math.random() < 0.3) ctx.fx.small.emit(tmp.copy(g.g.position).setY(ENEMIGOS[g.tipo].altura + 0.4), { count: 1, color: 0xffe07a, intensity: 2, speed: 0.6, life: 0.6, jitter: 0.3 });
        } else {
          const antes = enRuta(g.ruta, g.recorrido);
          g.recorrido += dt * g.vel;
          const [x, z] = enRuta(g.ruta, g.recorrido);
          if (Math.hypot(x - antes[0], z - antes[1]) > 1e-4) g.g.rotation.y = Math.atan2(x - antes[0], z - antes[1]);
          g.g.position.set(origen.x + x, 0, origen.z + z);
        }
        g.anim.update(dt);
      }
    },
  };
}
