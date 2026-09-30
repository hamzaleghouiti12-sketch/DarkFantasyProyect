// Mecánica «elegir con encargos» (PLAN_TECNICO.md, 9.1): llegan encargos a un atril
// y hay que acercarse al pedestal de la opción adecuada. Hacen falta N aciertos
// seguidos; un fallo explica la respuesta, pone la racha a cero y trae otro encargo.
import * as THREE from 'three';
import { makeLabel } from '../textures.js';
import { siguienteEncargo } from './logica.js';

/**
 * o: { piso, mec, sala, opciones [{id, texto, corto, porque?}], encargos [{texto, correctas, bien, pista?}],
 *      necesarios, arco: {x, z, radio, desde, hasta} (grados), atril: {x, z}, leccion, criterio,
 *      visual(opcion) → Object3D, alCompletar, nombreAtril }
 */
export function crearElegir(ctx, o) {
  const { ui, sonido, fx } = ctx;
  const { sala } = o;
  const est = { encargo: 0, racha: 0, completo: false };
  const encargo = () => o.encargos[est.encargo];
  const aprendido = () => ctx.estado.learned.has(o.leccion);

  sala.poner('column', o.atril.x, 0, o.atril.z);
  sala.obstaculo(o.atril.x, o.atril.z, 0.5);
  const marca = makeLabel('Encargo', { height: 0.4, fontSize: 48, font: 'Cinzel, serif', color: '#9fe6ff' });
  marca.position.set(o.atril.x, 2.3, o.atril.z);
  sala.grupo.add(marca);

  const n = o.opciones.length;
  const pedestales = o.opciones.map((op, i) => {
    const a = (o.arco.desde + ((o.arco.hasta - o.arco.desde) * i) / Math.max(1, n - 1)) * (Math.PI / 180);
    const x = o.arco.x + Math.cos(a) * o.arco.radio, z = o.arco.z + Math.sin(a) * o.arco.radio;
    sala.poner('column', x, 0, z);
    sala.obstaculo(x, z, 0.42);
    const simbolo = o.visual(op);
    simbolo.position.set(x, 1.85, z);
    sala.grupo.add(simbolo);
    const etiqueta = makeLabel(op.corto ?? op.texto, { height: 0.3, fontSize: 40 });
    etiqueta.position.set(x, 2.45 + (i % 2) * 0.34, z);
    sala.grupo.add(etiqueta);
    return { op, simbolo, x, z, pos: sala.aMundo(x, 0, z), foco: false };
  });

  const leerEncargo = () => ui.dialogue([`**Encargo:** ${encargo().texto}`, 'Acercaos al emblema adecuado y pulsad **E**.'], o.nombreAtril ?? 'El atril');

  const interactuables = [
    {
      zona: sala.zona, pos: sala.aMundo(o.atril.x, 0, o.atril.z), r: 2.2,
      enabled: () => !est.completo,
      prompt: () => (aprendido() ? '**E** · Leer el encargo del atril' : '**E** · Examinar el atril'),
      action: () => (aprendido() ? leerEncargo() : ctx.accion('leccion', { id: o.leccion, piso: o.piso })),
    },
    ...pedestales.map((p) => ({
      zona: sala.zona, pos: p.pos, r: 1.0, pedestal: p,
      enabled: () => !est.completo && aprendido(),
      prompt: () => `**E** · Elegir «${p.op.texto}» para el encargo`,
      action: () => ctx.accion('mec', { piso: o.piso, mec: o.mec, paso: 'elegir', id: p.op.id, encargo: est.encargo }),
    })),
  ];

  const validar = (d) => !est.completo && d.encargo === est.encargo && pedestales.some((p) => p.op.id === d.id);

  function aplicar(d, soyAutor) {
    const enc = encargo();
    const p = pedestales.find((x) => x.op.id === d.id);
    const ok = enc.correctas.includes(d.id);
    if (soyAutor) ctx.record(ok, o.criterio);
    if (ok) sonido.acierto(); else sonido.cristalRoto();
    fx.big.emit(sala.aMundo(p.x, 1.9, p.z), { count: ok ? 60 : 35, color: ok ? 0xffd27a : 0xff4030, intensity: 2, speed: ok ? 3.5 : 2.5, life: 1, gravity: ok ? -2 : -5 });
    const sig = siguienteEncargo(est, ok, o.encargos.length, o.necesarios);
    est.racha = sig.racha;
    est.encargo = sig.encargo;
    if (sig.completo) est.completo = true;
    const siguiente = `**Nuevo encargo:** ${encargo().texto}`;
    const nombres = enc.correctas.map((id) => pedestales.find((x) => x.op.id === id).op.texto).join(' o ');
    ctx.refrescarObjetivos();
    ctx.runFlow(async () => {
      if (ok) {
        await ui.dialogue(sig.completo
          ? [`¡Exacto! ${enc.bien}`, `¡**${o.necesarios} aciertos seguidos**! Buen criterio.`]
          : [`¡Exacto! ${enc.bien}`, `Racha: **${sig.racha}/${o.necesarios}**.`, siguiente]);
        if (sig.completo) await o.alCompletar();
      } else {
        if (soyAutor) ctx.golpe();
        await ui.dialogue([`«${p.op.texto}» no es lo mejor para esto. ${p.op.porque ?? ''}`.trim(), `Lo adecuado era **${nombres}**. ${enc.bien}`, `La racha vuelve a cero. ${siguiente}`]);
      }
    });
  }

  const tmp = new THREE.Vector3();
  function actualizar(dt, t, interactuando) {
    marca.position.y = 2.3 + Math.sin(t * 2.2) * 0.08;
    for (const p of pedestales) {
      p.foco = interactuando?.pedestal === p;
      p.simbolo.rotation.y += dt * (p.foco ? 2.2 : 0.6);
      const s = p.foco ? 1.25 : 1;
      p.simbolo.scale.lerp(tmp.set(s, s, s), Math.min(1, dt * 8));
    }
  }

  return { interactuables, validar, aplicar, actualizar, estado: est, leerEncargo };
}
