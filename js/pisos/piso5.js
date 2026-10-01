// Piso V · El Taller de los Heraldos (web y accesibilidad, criterios 2.2 y 2.3).
//   1. El cartel «Se busca a Aldric» (editor web): h1, p, img con alt, lista, enlace y CSS.
//   2. El cartel en el móvil: @media y max-width: 100% en la imagen.
//   3. La auditoría: arreglar los 5 fallos de accesibilidad del cartel de Morvath.
// Cada jugador edita su propio código; el sello lo rompe el primero que lo consigue y
// su cartel se cuelga en la pared para todos (título, imagen y texto: nunca su HTML).
import * as THREE from 'three';
import C, { IMAGENES } from '../contenido/piso5.js';
import { crearSalaDeTorre, cargarPiezasTorre, PIEZAS_BASE } from '../nucleo/sala-torre.js';
import { makeLabel } from '../textures.js';
import { comprobarCartel, comprobarResponsive, comprobarAccesibilidad } from '../mecanicas/web.js';
import { crearSellos } from './comun.js';
import { amueblar } from './muebles.js';

export const ORIGEN = new THREE.Vector3(0, 0, -2800);
const P = 'piso5';
const SELLOS = ['cartel', 'responsive', 'auditoria'];
const EXTRA = [
  'column', 'table_medium', 'table_medium_tablecloth_decorated_B', 'table_medium_decorated_A', 'candle_lit', 'candle_triple',
  'chair', 'stool', 'barrel_small_stack', 'crates_stacked', 'banner_yellow', 'banner_shield_yellow', 'banner_thin_yellow',
];
// el historial de versiones real de este juego (git log), para la lección del tablón
const HISTORIAL = [
  ['30-09', 'Servidor de retransmisión para jugar en equipo'],
  ['30-09', 'Modo equipo de hasta 5 jugadores'],
  ['29-09', 'Chat para el modo equipo'],
  ['29-09', 'Detectar desconexiones con un latido'],
  ['29-09', 'Elegir personaje y etiqueta'],
  ['28-09', 'Modo equipo de 2 a 3 jugadores'],
  ['26-09', 'Casa de Aldric, camino exterior y sonido'],
  ['26-09', 'La Torre de Morvath: Piso I jugable'],
];

const parsear = (html) => new DOMParser().parseFromString(html, 'text/html'); // no ejecuta nada
async function aDataUrl(ruta) {
  const blob = await (await fetch(ruta)).blob();
  return new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(blob); });
}
function lienzoTexto(ancho, alto, dibujar) {
  const c = document.createElement('canvas');
  c.width = ancho;
  c.height = alto;
  dibujar(c.getContext('2d'));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
// parte un texto en líneas que quepan en un ancho
function lineas(g, texto, ancho, max) {
  const res = [];
  let linea = '';
  for (const p of texto.split(/\s+/)) {
    const prueba = linea ? `${linea} ${p}` : p;
    if (g.measureText(prueba).width > ancho && linea) { res.push(linea); linea = p; } else linea = prueba;
    if (res.length === max) break;
  }
  if (linea && res.length < max) res.push(linea);
  return res;
}

export async function construir(ctx) {
  const { ui, sonido, fx, estado } = ctx;
  const [piezas, ...urls] = await Promise.all([
    cargarPiezasTorre(ctx.paletas.mazmorra, [...PIEZAS_BASE, ...EXTRA]),
    ...IMAGENES.map((n) => aDataUrl(`assets/web/${n}`)),
  ]);
  const imagenes = Object.fromEntries(IMAGENES.map((n, i) => [n, urls[i]]));
  const sala = crearSalaDeTorre({
    escena: ctx.escena, origen: ORIGEN, piezas, fx, semilla: 55, cielo: [0.26, 0.24, 0.42],
    estandartes: { normal: 'banner_yellow', escudo: 'banner_shield_yellow', fino: 'banner_thin_yellow' },
  });
  const { poner, obstaculo, aMundo, grupo } = sala;
  await amueblar(sala, [ // cuadros de los heraldos en los muros y una alfombra
    ['pictureframe_large_A', -11.85, 3, -12, Math.PI / 2, 1.4], ['pictureframe_large_B', 11.85, 3, -12, -Math.PI / 2, 1.4],
    ['pictureframe_medium', -11.85, 3.2, 10, Math.PI / 2, 1.3], ['pictureframe_medium', 11.85, 3.2, 10, -Math.PI / 2, 1.3],
    ['rug_rectangle_A', 0, 0.01, 1, Math.PI / 2, 1.5],
  ]);
  const S = crearSellos(ctx, sala, C, SELLOS);
  const est = {
    sellos: S.estado.sellos,
    cartel: { html: C.cartel.html, css: C.cartel.css },          // el código de este jugador
    auditoria: { html: C.auditoria.html, css: C.auditoria.css },
  };
  const aprendido = (id) => estado.learned.has(id);

  // ---------- Mesas y decorado ----------
  const OESTE = { x: -7.2, z: 4 }, ESTE = { x: 7.2, z: 4 }, NORTE = { x: 0, z: -8.5 }, TABLON = { x: 6.2, z: 13 };
  poner('table_medium_tablecloth_decorated_B', OESTE.x - 1.4, 0, OESTE.z, Math.PI / 2);
  obstaculo(OESTE.x - 1.4, OESTE.z, 1.2);
  poner('table_medium_decorated_A', ESTE.x + 1.4, 0, ESTE.z, -Math.PI / 2);
  obstaculo(ESTE.x + 1.4, ESTE.z, 1.2);
  poner('chair', OESTE.x - 0.1, 0, OESTE.z, -Math.PI / 2);
  poner('stool', ESTE.x + 0.2, 0, ESTE.z, 0);
  for (const [n, x, z, ry, r] of [['barrel_small_stack', -10.3, 15.6, 0.2, 0.9], ['crates_stacked', 10.2, -15.6, 0.3, 1.1], ['table_medium', -9.8, -12, 0, 1.1]]) { poner(n, x, 0, z, ry); obstaculo(x, z, r); }
  poner('candle_triple', -9.8, 1.0, -12, 0.4);
  // atril del norte con un «móvil» mágico encima
  poner('column', NORTE.x, 0, NORTE.z);
  obstaculo(NORTE.x, NORTE.z, 0.45);
  const movil = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.62, 0.04), new THREE.MeshStandardMaterial({ color: 0x14121a, emissive: 0x7fb0ff, emissiveIntensity: 0.9 }));
  movil.position.set(NORTE.x, 1.85, NORTE.z);
  grupo.add(movil);
  const rotulos = [
    ['El cartel', OESTE.x, OESTE.z, 2.4], ['El cartel en el móvil', NORTE.x, NORTE.z, 2.55], ['El edicto de Morvath', ESTE.x, ESTE.z, 2.4], ['Tablón de versiones', TABLON.x, TABLON.z, 3.4],
  ].map(([t, x, z, y]) => { const l = makeLabel(t, { height: 0.32, fontSize: 42 }); l.position.set(x, y, z); grupo.add(l); return l; });

  // ---------- Tablón de versiones: el historial real del juego ----------
  const tablon = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.2), new THREE.MeshStandardMaterial({
    roughness: 0.95, emissive: 0x2a2010, emissiveIntensity: 0.4,
    map: lienzoTexto(800, 550, (g) => {
      g.fillStyle = '#e7d8b5'; g.fillRect(0, 0, 800, 550);
      g.strokeStyle = '#6b4f2a'; g.lineWidth = 12; g.strokeRect(6, 6, 788, 538);
      g.fillStyle = '#3a2614'; g.font = '700 38px Cinzel, serif'; g.textAlign = 'center';
      g.fillText('Historial de versiones', 400, 60);
      g.textAlign = 'left'; g.font = '500 25px Consolas, monospace';
      HISTORIAL.forEach(([f, t], i) => { g.fillStyle = '#8a5a2a'; g.fillText(f, 40, 118 + i * 52); g.fillStyle = '#1d120a'; g.fillText(t, 150, 118 + i * 52); });
    }),
  }));
  tablon.position.set(TABLON.x, 1.9, TABLON.z);
  tablon.rotation.y = -Math.PI / 5;
  grupo.add(tablon);
  obstaculo(TABLON.x, TABLON.z, 0.9);

  // ---------- El cartel colgado en la pared norte ----------
  const cartelPared = new THREE.Mesh(new THREE.PlaneGeometry(3, 4), new THREE.MeshStandardMaterial({ color: 0x8a7a60, roughness: 0.95 }));
  cartelPared.position.set(-6, 4.3, -17.85);
  grupo.add(cartelPared);
  function colgarCartel({ titulo, imagen, texto }) {
    const img = new Image();
    img.onload = () => {
      const tex = lienzoTexto(600, 800, (g) => {
        g.fillStyle = '#efe2c2'; g.fillRect(0, 0, 600, 800);
        g.strokeStyle = '#6b4f2a'; g.lineWidth = 14; g.strokeRect(7, 7, 586, 786);
        g.fillStyle = '#3a1a10'; g.font = '900 52px Cinzel, serif'; g.textAlign = 'center';
        lineas(g, titulo, 520, 2).forEach((l, i) => g.fillText(l, 300, 90 + i * 60));
        g.drawImage(img, 60, 220, 480, 360);
        g.font = '500 28px Georgia, serif'; g.fillStyle = '#1d120a';
        lineas(g, texto, 500, 4).forEach((l, i) => g.fillText(l, 300, 640 + i * 38));
      });
      cartelPared.material.dispose();
      cartelPared.material = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, emissive: 0x302418, emissiveIntensity: 0.5 });
      fx.big.emit(aMundo(-6, 4.3, -17.5), { count: 60, color: 0xffd27a, intensity: 2, speed: 3, life: 1, gravity: -1 });
    };
    img.src = imagenes[imagen] ?? imagenes[IMAGENES[0]];
  }

  // ---------- Los tres editores ----------
  const datosCartel = (html) => {
    const d = parsear(html);
    const img = [...d.querySelectorAll('img')].find((i) => IMAGENES.includes(i.getAttribute('src')));
    return {
      titulo: (d.querySelector('h1')?.textContent ?? '').trim().slice(0, 60),
      imagen: img?.getAttribute('src') ?? IMAGENES[0],
      texto: (d.querySelector('p')?.textContent ?? '').trim().slice(0, 160),
    };
  };
  async function editarCartel(responsive) {
    const r = await ui.editorWeb({
      titulo: responsive ? 'Que el cartel se lea en un móvil' : 'Cartel: «Se busca a Aldric»',
      subtitulo: responsive ? 'El cartel en el móvil · sello 2' : 'El cartel · sello 1',
      html: est.cartel.html, css: est.cartel.css, imagenes, ancho: responsive ? 375 : 1280,
      comprobar: (html, css) => (responsive ? comprobarResponsive : comprobarCartel)(parsear(html), css, IMAGENES),
    });
    est.cartel = { html: r.html, css: r.css };
    if (!r.entregado) return;
    ctx.record(true, '2.2');
    sonido.acierto();
    if (responsive) ctx.accion('mec', { piso: P, mec: 'responsive', paso: 'sello' });
    else ctx.accion('mec', { piso: P, mec: 'cartel', paso: 'sello', ...datosCartel(r.html) });
  }
  async function editarAuditoria() {
    const r = await ui.editorWeb({
      titulo: 'El edicto de Morvath: cinco fallos de accesibilidad', subtitulo: 'La auditoría · sello 3',
      html: est.auditoria.html, css: est.auditoria.css, imagenes,
      comprobar: (html, css) => comprobarAccesibilidad(parsear(html), css),
    });
    est.auditoria = { html: r.html, css: r.css };
    if (!r.entregado) return;
    ctx.record(true, '2.2');
    sonido.acierto();
    ctx.accion('mec', { piso: P, mec: 'auditoria', paso: 'sello' });
  }

  // ---------- Interactuables ----------
  const zona = sala.zona;
  const interactuables = [
    {
      zona, pos: aMundo(TABLON.x, 0, TABLON.z), r: 2.2,
      enabled: () => !aprendido('ple'),
      prompt: () => '**E** · Leer el tablón de versiones',
      action: () => ctx.accion('leccion', { id: 'ple', piso: P }),
    },
    {
      zona, pos: aMundo(OESTE.x, 0, OESTE.z), r: 2.2,
      enabled: () => !est.sellos.cartel,
      prompt: () => (aprendido('web') ? '**E** · Abrir el editor del cartel' : '**E** · Examinar la mesa del cartel'),
      action: () => (aprendido('web') ? editarCartel(false) : ctx.accion('leccion', { id: 'web', piso: P, luego: 'cartel' })),
    },
    {
      zona, pos: aMundo(NORTE.x, 0, NORTE.z), r: 2.2,
      enabled: () => est.sellos.cartel && !est.sellos.responsive,
      prompt: () => (aprendido('responsive') ? '**E** · Probar el cartel en el móvil' : '**E** · Examinar el móvil del atril'),
      action: () => (aprendido('responsive') ? editarCartel(true) : ctx.accion('leccion', { id: 'responsive', piso: P, luego: 'responsive' })),
    },
    {
      zona, pos: aMundo(ESTE.x, 0, ESTE.z), r: 2.2,
      enabled: () => !est.sellos.auditoria,
      prompt: () => (aprendido('accesibilidad') ? '**E** · Corregir el edicto de Morvath' : '**E** · Leer el edicto de Morvath'),
      action: () => (aprendido('accesibilidad') ? editarAuditoria() : ctx.accion('leccion', { id: 'accesibilidad', piso: P, luego: 'auditoria' })),
    },
  ];

  // ---------- Red ----------
  const validar = (d) => SELLOS.includes(d.mec) && !est.sellos[d.mec] && (d.mec !== 'responsive' || est.sellos.cartel);
  const clave = (d) => `mec:${P}:${d.mec}:sello`;
  function aplicar(d) {
    if (d.mec === 'cartel') {
      colgarCartel({ titulo: String(d.titulo ?? '').slice(0, 60) || 'Se busca a Aldric', imagen: d.imagen, texto: String(d.texto ?? '').slice(0, 160) });
      ctx.runFlow(async () => {
        await ui.dialogue(['¡El cartel ya cuelga en la pared norte! Es una página web de verdad: estructura en HTML y aspecto en CSS.', 'Siguiente paso: que se lea bien **en un móvil**. Id al **atril del norte**.']);
        await S.romper('cartel');
      });
    } else ctx.runFlow(() => S.romper(d.mec));
    ctx.refrescarObjetivos();
  }

  function actualizar(dt, t) {
    sala.update(dt, t);
    movil.material.emissiveIntensity = 0.7 + Math.sin(t * 2.4) * 0.25;
    rotulos[1].visible = est.sellos.cartel;
  }
  function objetivos() {
    const items = [
      { text: 'Crea el cartel «Se busca a Aldric» (mesa del oeste)', done: est.sellos.cartel },
      { text: 'Haz que el cartel se lea en un móvil (atril del norte)', done: est.sellos.responsive },
      { text: 'Arregla los 5 fallos del edicto de Morvath (mesa del este)', done: est.sellos.auditoria },
      { text: 'Opcional: lee el tablón de versiones', done: aprendido('ple') },
    ];
    if (S.estado.puerta) items.push({ text: 'Subid por la escalera del norte', done: false });
    return items;
  }
  function pista() {
    if (!est.sellos.cartel) return C.pistas.cartel;
    if (!est.sellos.responsive) return C.pistas.responsive;
    if (!est.sellos.auditoria) return C.pistas.auditoria;
    return C.pistas.puerta;
  }

  Object.assign(zona, {
    id: P, nombre: C.nombre, musica: 'taller', pisada: 'madera',
    actualizar, objetivos, pista,
    salida: { abierta: () => S.estado.puerta, z: sala.salidaZ, accion: ['subir', { piso: 'piso6' }] },
  });
  zona.grupo.visible = false;

  return {
    id: P, zona, interactuables, contenido: C, estado: est,
    validar, clave, aplicar, jugadorFuera() {},
    async alAprender(id, soyAutor, luego) {
      if (!soyAutor) return;
      if (luego === 'cartel') await editarCartel(false);
      if (luego === 'responsive') await editarCartel(true);
      if (luego === 'auditoria') await editarAuditoria();
    },
    intro: () => ui.dialogue(C.intro),
  };
}
