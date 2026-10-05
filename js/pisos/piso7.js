// Piso VII · La Gran Biblioteca (licencias, bulos y curación; criterios 2.3 y 3.3).
//   1. La sala de las licencias (clasificar): 10 obras a 8 estanterías según su licencia.
//   2. El tablón de pregones: verificar 5 noticias con herramientas y decidir qué hacer.
//   3. El buscador del bibliotecario: 3 retos de búsqueda avanzada y las fases de la curación.
import * as THREE from 'three';
import C from '../contenido/piso7.js';
import { crearSalaDeTorre, cargarPiezasTorre, PIEZAS_BASE } from '../nucleo/sala-torre.js';
import { makeLabel } from '../textures.js';
import { crearClasificar } from '../mecanicas/clasificar.js';
import { abrirTablon, abrirBuscador } from '../mecanicas/bibliotecaVista.js';
import { crearSellos, crearEstanteria } from './comun.js';
import { amueblar } from './muebles.js';
import { crearBurbuja, variedad } from '../mecanicas/burbuja.js';

export const ORIGEN = new THREE.Vector3(0, 0, -4200);
const P = 'piso7';
const SELLOS = ['licencias', 'pregones', 'buscador'];
const EXTRA = ['column', 'table_long_decorated_C', 'table_long_tablecloth_decorated_A', 'candle_lit', 'candle_triple', 'chair', 'banner_blue', 'banner_shield_blue', 'banner_thin_blue'];
const COLORES = [0x7a2a2a, 0x2a4a7a, 0x3f5a2a, 0x6b5a2a, 0x4a2a6b, 0x2a6a6a, 0x7a4a2a, 0x5a5a6a, 0x2a5a3a, 0x6a2a4a];
const std = (o) => new THREE.MeshStandardMaterial(o);

export async function construir(ctx) {
  const { ui, sonido, fx, estado } = ctx;
  const piezas = await cargarPiezasTorre(ctx.paletas.mazmorra, [...PIEZAS_BASE, ...EXTRA]);
  const sala = crearSalaDeTorre({
    ambiente: { color: 0xf2d9a0, cada: 0.07, brillo: 0.5, vida: 7 },
    escena: ctx.escena, origen: ORIGEN, piezas, fx, semilla: 77, cielo: [0.2, 0.24, 0.5],
    estandartes: { normal: 'banner_blue', escudo: 'banner_shield_blue', fino: 'banner_thin_blue' },
  });
  const { poner, obstaculo, aMundo, grupo } = sala;
  await amueblar(sala, [ // un rincón de lectura junto a la entrada y alfombras
    ['armchair_pillows', -9.6, 0, 12.6, Math.PI * 0.8, 1, 0.9],
    ['lamp_standing', -10.9, 0, 11.3, 0, 1, 0.4],
    ['rug_oval_A', -9, 0.01, 11.2, 0.4, 1.1],
    ['rug_rectangle_stripes_A', 0, 0.01, 1, Math.PI / 2, 1.6],
    ['book_set', 10.3, 1.02, 15.2, 0.3], ['book_set', -10.3, 1.02, 15.4, -0.5],
  ]);
  const S = crearSellos(ctx, sala, C, SELLOS);
  const est = { sellos: S.estado.sellos, tablon: { paso: 0 }, buscador: { reto: 0 }, curacionHecha: false };
  const aprendido = (id) => estado.learned.has(id);

  // ---------- Estanterías de las licencias (4 al oeste y 4 al este) ----------
  const ESTANTES = {};
  C.estanterias.forEach((e, i) => {
    const lado = i < 4 ? -1 : 1;
    const z = [-9, -4, 4, 9][i % 4];
    const x = lado * 8.3;
    const mueble = crearEstanteria();
    mueble.position.set(x, 0, z);
    mueble.rotation.y = -lado * (Math.PI / 2);
    grupo.add(mueble);
    obstaculo(x, z - 0.7, 0.7);
    obstaculo(x, z + 0.7, 0.7);
    const l = makeLabel(e.texto, { height: 0.34, fontSize: 44, font: 'Cinzel, serif', color: '#e8c98a' });
    l.position.set(x, 3.0, z);
    grupo.add(l);
    ESTANTES[e.id] = { x: x - lado * 0.95, z, y: 1.75, radio: 1.7 };
  });

  // ---------- La mesa central con las obras ----------
  const MESA = { x: 0, z: 7 };
  poner('table_long_tablecloth_decorated_A', MESA.x, 0, MESA.z, Math.PI / 2, 1.5);
  obstaculo(-2, MESA.z, 1.1);
  obstaculo(0, MESA.z, 1.1);
  obstaculo(2, MESA.z, 1.1);
  const libro = (obj) => new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.1), std({ color: COLORES[C.obras.indexOf(obj) % COLORES.length], roughness: 0.7, emissive: COLORES[C.obras.indexOf(obj) % COLORES.length], emissiveIntensity: 0.3 }));
  const clasif = crearClasificar(ctx, {
    piso: P, mec: 'obras', sala, criterio: '2.3',
    objetos: C.obras,
    receptaculos: C.estanterias.map((e) => ({ ...e, ...ESTANTES[e.id] })),
    mesa: { ...MESA, y: 1.95, separacion: 0.6, radio: 3.2 },
    habilitado: () => aprendido('licencias') && !est.sellos.licencias,
    alCompletar: () => S.romper('licencias'),
    alCoger: (obj) => ui.toast(`📖 **${obj.texto}**: ${obj.caso}`, 'info', 9000),
    escalonar: true,
    visual: libro,
  });

  // ---------- Tablón de pregones y buscador (norte) ----------
  const TABLON = { x: -4.2, z: -12.5 }, BUSCADOR = { x: 4.2, z: -12.5 };
  const tablon = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 0.15), std({ color: 0x5a3d26, roughness: 0.9 }));
  tablon.position.set(TABLON.x, 2, TABLON.z - 0.6);
  grupo.add(tablon);
  for (let i = 0; i < 5; i++) {
    const hoja = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.7), std({ color: 0xefe2c2, roughness: 0.95, emissive: 0x2a2010, emissiveIntensity: 0.4 }));
    hoja.position.set(TABLON.x - 1.2 + i * 0.6, 2 + (i % 2 ? 0.35 : -0.3), TABLON.z - 0.52);
    hoja.rotation.z = (i - 2) * 0.06;
    grupo.add(hoja);
  }
  obstaculo(TABLON.x, TABLON.z - 0.6, 1.2);
  poner('column', BUSCADOR.x, 0, BUSCADOR.z);
  obstaculo(BUSCADOR.x, BUSCADOR.z, 0.45);
  const lupa = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 10, 28), std({ color: 0xd4af6a, metalness: 0.9, roughness: 0.3, emissive: 0x3a2a10 }));
  lupa.position.set(BUSCADOR.x, 1.85, BUSCADOR.z);
  grupo.add(lupa);
  for (const [t, x, z, y] of [['Tablón de pregones', TABLON.x, TABLON.z - 0.6, 3.5], ['Buscador del bibliotecario', BUSCADOR.x, BUSCADOR.z, 2.55], ['Mesa de las obras', MESA.x, MESA.z, 2.9]]) {
    const l = makeLabel(t, { height: 0.3, fontSize: 40 });
    l.position.set(x, y, z);
    grupo.add(l);
  }
  for (const [x, z] of [[-10.3, 15.2], [10.3, 15.2]]) { poner('table_long_decorated_C', x, 0, z, Math.PI / 2); obstaculo(x, z, 1.1); }

  async function verificarPregones() {
    const hecho = await abrirTablon(ui, { pregones: C.pregones, etiquetas: C.etiquetas, acciones: C.acciones, progreso: est.tablon, alResponder: (ok) => { ctx.record(ok, '3.3'); ok ? sonido.acierto() : sonido.fallo(); } });
    if (hecho) ctx.accion('mec', { piso: P, mec: 'pregones', paso: 'sello' });
  }
  async function usarBuscador() {
    if (est.buscador.reto < C.retos.length) {
      const hecho = await abrirBuscador(ui, { indice: C.indice, retos: C.retos, progreso: est.buscador, alResponder: (ok) => { ctx.record(ok, '2.3'); sonido.acierto(); } });
      if (!hecho) return;
    }
    if (!est.curacionHecha) {
      const ok = await ui.quiz(C.curacion, 'El buscador del bibliotecario · la curación');
      ctx.record(ok, C.curacion.criterio);
      if (!ok) return ui.dialogue(['Casi. Volved al buscador cuando queráis para ordenar las fases otra vez.']);
      est.curacionHecha = true;
    }
    ctx.accion('mec', { piso: P, mec: 'buscador', paso: 'sello' });
  }

  const zona = sala.zona;
  // ---------- Opcional · El espejo de las recomendaciones (junto a la entrada, este) ----------
  // Individual: cada jugador elige titulares en su pantalla y ve cómo se estrecha su muro.
  const ESPEJO = { x: 9.4, z: 11 };
  poner('column', ESPEJO.x, 0, ESPEJO.z);
  obstaculo(ESPEJO.x, ESPEJO.z, 0.5);
  const lunaEspejo = new THREE.Mesh(new THREE.CircleGeometry(0.42, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.35, 0.5, 0.8) }));
  lunaEspejo.position.set(ESPEJO.x - 0.05, 2.2, ESPEJO.z);
  lunaEspejo.rotation.y = -Math.PI / 2;
  grupo.add(lunaEspejo);
  const rotuloEspejo = makeLabel('Espejo · opcional', { height: 0.3, fontSize: 40, font: 'Cinzel, serif', color: '#d8c8ff' });
  rotuloEspejo.position.set(ESPEJO.x - 0.4, 2.85, ESPEJO.z);
  grupo.add(rotuloEspejo);
  const espejo = { hecho: false, visto: false };
  async function mirarEspejo() {
    const E = C.espejo;
    if (!espejo.visto) {
      await ui.dialogue([E.aviso]);
      espejo.visto = true;
    }
    const b = crearBurbuja(E.temas);
    let primero = null, ultimo = null;
    for (let r = 0; r < E.rondas; r++) {
      const muro = b.muro(6);
      primero ??= muro;
      ultimo = muro;
      const elegido = await ui.story([`**El espejo · muro ${r + 1} de ${E.rondas}.** ¿Qué titular abrís?`], muro.map((x, i) => ({ id: i, texto: x.titular })));
      b.elegir(muro[elegido].tema);
      sonido.clic?.();
    }
    const final = b.muro(6);
    ui.hideScreen('screen-story');
    const temasFinal = [...new Set(final.map((x) => E.nombres[x.tema]))].join(', ');
    const cerrada = variedad(final) < variedad(primero);
    await ui.dialogue([
      `Vuestro primer muro tenía **${variedad(primero)} temas**. Después de cinco clics, el espejo os ofrece **${variedad(final)}**: ${temasFinal}.`,
      cerrada
        ? 'El espejo ha aprendido de vuestros clics y os enseña **cada vez más de lo mismo**. Eso es una **burbuja de filtros**.'
        : 'Habéis elegido de todo un poco y vuestro muro sigue variado: justo lo que **rompe la burbuja**. Pero la mayoría de la gente no lo hace…',
    ]);
    if (!aprendido('burbuja')) {
      const l = C.lecciones.burbuja;
      await ui.dialogue(l.paginas);
      estado.learned.add('burbuja');
      ui.toast(`Nuevo concepto en el grimorio: **${l.titulo}** (G)`, 'learn', 4200);
    }
    const ok = await ui.quiz(E.pregunta, 'El espejo de las recomendaciones');
    ctx.record(ok, E.pregunta.criterio);
    if (!ok) {
      await ui.dialogue(['Casi. Repasad **la burbuja de filtros** en el grimorio (**G**) y volved al espejo.']);
      return;
    }
    espejo.hecho = true;
    rotuloEspejo.visible = false;
    sonido.acierto();
    fx.big.emit(aMundo(ESPEJO.x, 2.2, ESPEJO.z), { count: 70, color: 0xc8a8ff, intensity: 2, speed: 3, life: 1.1, gravity: -2 });
    ctx.addSaber(20);
    ctx.celebrar();
    await ui.dialogue([E.hecho]);
  }

  const interactuables = [
    {
      zona, pos: aMundo(ESPEJO.x - 1.2, 0, ESPEJO.z), r: 1.9,
      enabled: () => !espejo.hecho,
      prompt: () => '**E** · Mirarse en el **espejo de las recomendaciones** (opcional)',
      action: mirarEspejo,
    },
    {
      zona, pos: aMundo(MESA.x, 0, MESA.z), r: 3.2,
      enabled: () => !aprendido('licencias'),
      prompt: () => '**E** · Examinar las obras de la mesa',
      action: () => ctx.accion('leccion', { id: 'licencias', piso: P }),
    },
    ...clasif.interactuables,
    {
      zona, pos: aMundo(TABLON.x, 0, TABLON.z), r: 2.4,
      enabled: () => !est.sellos.pregones,
      prompt: () => (aprendido('bulos') ? '**E** · Verificar los pregones' : '**E** · Leer el tablón de pregones'),
      action: () => (aprendido('bulos') ? verificarPregones() : ctx.accion('leccion', { id: 'bulos', piso: P, luego: 'pregones' })),
    },
    {
      zona, pos: aMundo(BUSCADOR.x, 0, BUSCADOR.z), r: 2.2,
      enabled: () => !est.sellos.buscador,
      prompt: () => (aprendido('curacion') ? '**E** · Usar el buscador del bibliotecario' : '**E** · Examinar el buscador'),
      action: () => (aprendido('curacion') ? usarBuscador() : ctx.accion('leccion', { id: 'curacion', piso: P, luego: 'buscador' })),
    },
  ];

  const validar = (d) => (d.mec === 'obras' ? clasif.validar(d) : SELLOS.includes(d.mec) && !est.sellos[d.mec]);
  const clave = (d) => (d.paso === 'sello' ? `mec:${P}:${d.mec}:sello` : null);
  function aplicar(d, soyAutor) {
    if (d.mec === 'obras') clasif.aplicar(d, soyAutor);
    else ctx.runFlow(() => S.romper(d.mec));
    ctx.refrescarObjetivos();
  }

  function actualizar(dt, t) {
    sala.update(dt, t);
    clasif.actualizar(dt, t);
    lupa.rotation.y += dt * 0.9;
    lupa.position.y = 1.85 + Math.sin(t * 2) * 0.06;
  }
  function objetivos() {
    const items = [
      { text: `Devuelve cada obra a su estantería (${clasif.colocados()}/${clasif.total})`, done: est.sellos.licencias },
      { text: `Verifica los pregones del tablón (${Math.min(est.tablon.paso, C.pregones.length)}/${C.pregones.length})`, done: est.sellos.pregones },
      { text: `Domina el buscador del bibliotecario (${Math.min(est.buscador.reto, C.retos.length)}/${C.retos.length})`, done: est.sellos.buscador },
    ];
    if (S.estado.puerta) items.push({ text: 'Subid por la escalera del norte', done: false });
    return items;
  }
  function pista() {
    if (!est.sellos.licencias) return C.pistas.licencias;
    if (!est.sellos.pregones) return C.pistas.pregones;
    if (!est.sellos.buscador) return C.pistas.buscador;
    return C.pistas.puerta;
  }
  // a dónde apunta la guía de la misión actual (main.js la dibuja)
  function destino() {
    if (!est.sellos.licencias) return aMundo(MESA.x, 0, MESA.z);
    if (!est.sellos.pregones) return aMundo(TABLON.x, 0, TABLON.z);
    if (!est.sellos.buscador) return aMundo(BUSCADOR.x, 0, BUSCADOR.z);
    return 'salida';
  }

  Object.assign(zona, {
    id: P, nombre: C.nombre, musica: 'scriptorium', pisada: 'madera',
    actualizar, objetivos, pista, destino,
    salida: { abierta: () => S.estado.puerta, z: sala.salidaZ, accion: ['subir', { piso: 'piso8' }] },
  });
  zona.grupo.visible = false;

  return {
    id: P, zona, interactuables, contenido: C, estado: est,
    validar, clave, aplicar, jugadorFuera: (id) => clasif.jugadorFuera(id),
    async alAprender(id, soyAutor, luego) {
      if (!soyAutor) return;
      if (luego === 'pregones') await verificarPregones();
      if (luego === 'buscador') await usarBuscador();
    },
    intro: () => ui.dialogue(C.intro),
  };
}
