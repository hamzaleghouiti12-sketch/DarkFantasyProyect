// Mecánica «clasificar» (PLAN_TECNICO.md, 9.2): coger objetos con E y llevarlos
// a su receptáculo. Al soltar se valida: si es su sitio, se queda y brilla; si
// no, vuelve a la mesa con la explicación. En equipo, cada jugador puede llevar
// un objeto distinto a la vez; el anfitrión valida cada paso.
//
// Uso (desde un piso):
//   const cl = crearClasificar(ctx, { piso, mec, sala, objetos, receptaculos, mesa, habilitado, alCompletar, visual });
//   … añadir cl.interactuables, y enrutar validar/aplicar cuando d.mec === mec.
import * as THREE from 'three';
import { makeLabel } from '../textures.js';

export function crearClasificar(ctx, o) {
  const { piso, mec, sala, objetos, receptaculos, mesa, habilitado = () => true, alCompletar, visual } = o;
  const { ui, sonido, fx } = ctx;
  const miId = () => ctx.red.miId || 'yo';
  const est = objetos.map(() => ({ en: 'mesa', portador: null }));
  const recPorId = Object.fromEntries(receptaculos.map((r) => [r.id, r]));
  const llevo = () => est.findIndex((e) => e.portador === miId());
  const completo = () => est.every((e) => e.en !== 'mesa' && !e.portador);
  let terminado = false;

  // posición de reposo de cada objeto sobre la mesa y huecos en cada receptáculo
  const enMesa = (i) => sala.aMundo(mesa.x + (i - (objetos.length - 1) / 2) * (mesa.separacion ?? 0.9), mesa.y ?? 1.6, mesa.z);
  const enReceptaculo = (i) => {
    const r = recPorId[est[i].en];
    const orden = est.map((e, k) => (e.en === r.id ? k : -1)).filter((k) => k >= 0).indexOf(i);
    return sala.aMundo(r.x + (orden - 1) * 0.55, r.y ?? 1.7, r.z + (r.dz ?? 0));
  };

  const visuales = objetos.map((obj) => {
    const g = visual ? visual(obj) : new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.1), new THREE.MeshStandardMaterial({ color: 0x8a6a50 }));
    const grupo = new THREE.Group();
    grupo.add(g);
    const etiqueta = makeLabel(obj.texto, { height: 0.24, fontSize: 40 });
    etiqueta.position.y = 0.45;
    grupo.add(etiqueta);
    ctx.escena.add(grupo);
    return { grupo, fase: Math.random() * 6 };
  });
  visuales.forEach((v, i) => v.grupo.position.copy(enMesa(i)));

  const accion = (paso, datos) => ctx.accion('mec', { piso, mec, paso, ...datos, quien: miId() });
  const puedeUsar = () => habilitado() && !terminado;

  const interactuables = [
    {
      zona: sala.zona, pos: sala.aMundo(mesa.x, 0, mesa.z), r: mesa.radio ?? 2.4,
      enabled: () => puedeUsar() && (llevo() >= 0 || est.some((e) => e.en === 'mesa' && !e.portador)),
      prompt: () => (llevo() >= 0 ? `**E** · Devolver «${objetos[llevo()].texto}» a la mesa` : '**E** · Coger el objeto más cercano'),
      action: () => {
        const mio = llevo();
        if (mio >= 0) return accion('dejar', { obj: mio, rec: 'mesa' });
        // el más cercano al jugador de los que quedan en la mesa
        const p = ctx.jugador.pos;
        let mejor = -1, dmin = Infinity;
        est.forEach((e, i) => {
          if (e.en !== 'mesa' || e.portador) return;
          const d = visuales[i].grupo.position.distanceTo(p);
          if (d < dmin) { dmin = d; mejor = i; }
        });
        if (mejor >= 0) accion('coger', { obj: mejor });
      },
    },
    ...receptaculos.map((r) => ({
      zona: sala.zona, pos: sala.aMundo(r.x, 0, r.z), r: r.radio ?? 1.8,
      enabled: () => puedeUsar() && llevo() >= 0,
      prompt: () => `**E** · Dejar «${objetos[llevo()].texto}» en «${r.texto}»`,
      action: () => accion('dejar', { obj: llevo(), rec: r.id }),
    })),
  ];

  function validar(d) {
    if (terminado) return false;
    const e = est[d.obj];
    if (!e) return false;
    if (d.paso === 'coger') {
      // si otro lo cogió justo antes, se le da otro de la mesa
      if (e.en !== 'mesa' || e.portador) d.obj = est.findIndex((x) => x.en === 'mesa' && !x.portador);
      return d.obj >= 0 && !est.some((x) => x.portador === d.quien);
    }
    if (d.paso === 'dejar') return e.portador === d.quien && (d.rec === 'mesa' || Boolean(recPorId[d.rec]));
    return false;
  }

  function aplicar(d, soyAutor) {
    const e = est[d.obj];
    if (d.paso === 'coger') {
      e.portador = d.quien;
      e.en = null;
      sonido.coger();
      return;
    }
    e.portador = null;
    if (d.rec === 'mesa') { e.en = 'mesa'; sonido.dejar(); return; }
    const obj = objetos[d.obj];
    const ok = obj.destino === d.rec;
    if (soyAutor) ctx.record(ok, o.criterio);
    if (ok) {
      e.en = d.rec;
      sonido.acierto();
      fx.big.emit(enReceptaculo(d.obj), { count: 40, color: 0xffd27a, intensity: 2, speed: 3, life: 0.9, gravity: -2 });
      ui.toast(`✓ ${obj.porque}`, 'good', 4200);
    } else {
      e.en = 'mesa';
      sonido.fallo();
      ctx.runFlow(() => ui.dialogue([`«${obj.texto}» no va en «${recPorId[d.rec].texto}». ${obj.porque}`, 'Vuelve a la mesa: probad en la otra estantería.']));
    }
    ctx.refrescarObjetivos();
    if (completo() && !terminado) {
      terminado = true;
      ctx.runFlow(alCompletar);
    }
  }

  function jugadorFuera(id) {
    for (const e of est) if (e.portador === id) { e.portador = null; e.en = 'mesa'; }
  }

  const destino = new THREE.Vector3();
  function actualizar(dt, t) {
    est.forEach((e, i) => {
      const v = visuales[i];
      if (e.portador) {
        const quien = e.portador === miId() ? ctx.jugador.pos : ctx.companeros.get(e.portador)?.group.position;
        destino.copy(quien ? destino.set(quien.x, quien.y + 2.55, quien.z) : enMesa(i));
      } else destino.copy(e.en === 'mesa' ? enMesa(i) : enReceptaculo(i));
      destino.y += Math.sin(t * 2 + v.fase) * 0.05;
      v.grupo.position.lerp(destino, 1 - Math.exp(-dt * 10));
      v.grupo.children[0].rotation.y += dt * (e.portador ? 2 : 0.6);
      v.grupo.visible = sala.grupo.visible;
    });
  }

  return {
    interactuables, validar, aplicar, jugadorFuera, actualizar,
    completo, colocados: () => est.filter((e) => e.en && e.en !== 'mesa' && !e.portador).length, total: objetos.length,
  };
}
