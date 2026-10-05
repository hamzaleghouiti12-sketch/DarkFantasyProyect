// Piezas comunes a todos los pisos: los tres sellos con su puerta y el recuerdo
// de Morvath, las series de preguntas individuales y los carteles que cambian.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makeLabel } from '../textures.js';

// Tres sellos → runas de la puerta → diálogo final → recuerdo → puerta abierta.
// opciones.antesDePuerta: algo que pasa tras el recuerdo y antes de abrir la puerta (el jefe del Piso VIII)
export function crearSellos(ctx, sala, contenido, claves, opciones = {}) {
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
    if (ctx.anunciarSello) ctx.anunciarSello(rotos(), claves.length);
    else { ui.toast(`✦ Sello roto (${rotos()}/${claves.length})`, 'seal', 3600); ctx.refrescarObjetivos(); }
    if (rotos() < claves.length) return;
    await ui.dialogue(contenido.sellosRotos);
    sonido.teletransporte();
    await ui.dialogue(contenido.memoria.slice(0, -1), 'Recuerdo de la torre');
    await ui.dialogue(contenido.memoria.slice(-1));
    await opciones.antesDePuerta?.();
    sala.abrirPuerta();
    sonido.puerta();
    estado.puerta = true;
    ctx.sacudir(0.8);
    ctx.refrescarObjetivos();
    await ctx.mostrarSalida?.();
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

// Estantería de madera hecha por código: el armazón es una sola malla y los
// libros, una malla instanciada (2 llamadas de dibujo en vez de 19)
export function crearEstanteria() {
  const g = new THREE.Group();
  const tablas = [];
  const caja = (w, h, d, x, y, z) => tablas.push(new THREE.BoxGeometry(w, h, d).translate(x, y, z));
  caja(0.1, 2.6, 0.6, -1.1, 1.3, 0);
  caja(0.1, 2.6, 0.6, 1.1, 1.3, 0);
  caja(2.3, 0.1, 0.6, 0, 2.6, 0);
  caja(2.3, 0.08, 0.1, 0, 1.3, -0.28);
  for (const y of [0.1, 0.9, 1.7]) caja(2.2, 0.06, 0.6, 0, y, 0);
  const armazon = new THREE.Mesh(mergeGeometries(tablas), new THREE.MeshStandardMaterial({ color: 0x5a3d26, roughness: 0.85 }));
  armazon.castShadow = armazon.receiveShadow = true;
  const colores = [0x6b2a2a, 0x2a4a6b, 0x3f5a2a, 0x6b5a2a, 0x4a2a6b];
  const libros = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 1, 0.4), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }), 12);
  const m = new THREE.Matrix4(), c = new THREE.Color();
  for (let i = 0; i < 12; i++) {
    const alto = 0.5 + (i % 3) * 0.08;
    m.makeScale(1, alto, 1).setPosition(-0.95 + i * 0.16, 0.13 + alto / 2, 0);
    libros.setMatrixAt(i, m);
    libros.setColorAt(i, c.setHex(colores[i % 5]));
  }
  g.add(armazon, libros);
  return g;
}
