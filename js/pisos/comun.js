// Piezas comunes a todos los pisos: los tres sellos con su puerta y el recuerdo
// de Morvath, las series de preguntas individuales y los carteles que cambian.
import { makeLabel } from '../textures.js';

// Tres sellos → runas de la puerta → diálogo final → recuerdo → puerta abierta.
export function crearSellos(ctx, sala, contenido, claves) {
  const { ui, sonido } = ctx;
  const sellos = Object.fromEntries(claves.map((k) => [k, false]));
  const estado = { sellos, puerta: false };
  const rotos = () => claves.filter((k) => sellos[k]).length;
  async function romper(clave) {
    if (sellos[clave]) return;
    sellos[clave] = true;
    sala.encenderRuna(claves.indexOf(clave));
    sonido.sello();
    ctx.addSaber(25);
    ctx.sacudir(0.35);
    ctx.celebrar();
    ui.toast(`✦ Sello roto (${rotos()}/${claves.length})`, 'seal', 3600);
    ctx.refrescarObjetivos();
    if (rotos() < claves.length) return;
    await ui.dialogue(contenido.sellosRotos);
    sonido.teletransporte();
    await ui.dialogue(contenido.memoria.slice(0, -1), 'Recuerdo de la torre');
    await ui.dialogue(contenido.memoria.slice(-1));
    sala.abrirPuerta();
    sonido.puerta();
    estado.puerta = true;
    ctx.sacudir(0.8);
    ctx.refrescarObjetivos();
  }
  return { estado, romper, rotos };
}

// Serie de preguntas que cada jugador hace en su pantalla. Si falla, la próxima
// vez sigue desde esa pregunta. Devuelve true cuando las ha acertado todas.
export async function serieDePreguntas(ctx, pasos, titulo, progreso) {
  for (let i = progreso.paso; i < pasos.length; i++) {
    const ok = await ctx.ui.quiz(pasos[i], `${titulo} · prueba ${i + 1} de ${pasos.length}`);
    ctx.record(ok, pasos[i].criterio);
    progreso.paso = i;
    if (!ok) {
      await ctx.ui.dialogue(['Casi. Repasad (**G** abre el grimorio) y volved cuando queráis: seguiréis desde esta prueba.']);
      return false;
    }
    ctx.sonido.acierto();
  }
  progreso.paso = pasos.length;
  return true;
}

// Cartel flotante cuyo texto se puede cambiar (rehace la textura solo si cambia)
export function cartelVivo(grupo, pos, opciones = {}) {
  let sprite = null, actual = null;
  return {
    poner(texto, extra = {}) {
      const clave = texto + JSON.stringify(extra);
      if (clave === actual) return;
      actual = clave;
      if (sprite) { grupo.remove(sprite); sprite.material.map.dispose(); sprite.material.dispose(); }
      sprite = makeLabel(texto, { ...opciones, ...extra });
      sprite.position.copy(pos);
      grupo.add(sprite);
    },
    get sprite() { return sprite; },
  };
}

