// Piso III · El Scriptorium Binario (codificación de la información, criterio 1.1).
//   1. Las ocho palancas (oeste): escribir en binario 77, 0x3C y −5 (complemento a 2).
//   2. La inscripción (este): descifrar códigos ASCII, UTF-8 y Unicode.
//   3. El relicario (norte): calcular pesos de imagen y audio, y clasificar formatos.
// Guiño: el espejo de las mallas muestra el «esqueleto» 3D del propio personaje.
import * as THREE from 'three';
import C from '../contenido/piso3.js';
import { crearSalaDeTorre, cargarPiezasTorre, PIEZAS_BASE } from '../nucleo/sala-torre.js';
import { makeLabel, glowTexture, parchmentCanvas, canvasTex } from '../textures.js';
import { leerBits, cumpleObjetivo } from '../mecanicas/logica.js';
import { crearClasificar } from '../mecanicas/clasificar.js';
import { amueblar } from './muebles.js';
import { crearSellos, serieDePreguntas, cartelVivo, crearEstanteria } from './comun.js';

export const ORIGEN = new THREE.Vector3(0, 0, -1400);
const EXTRA = [
  'column', 'candle_lit', 'candle_triple', 'table_long_decorated_C', 'table_long_tablecloth_decorated_A', 'table_small_decorated_A',
  'chair', 'stool', 'bottle_A_labeled_green', 'bottle_B_brown', 'shelf_small', 'shelf_small_candles',
  'banner_green', 'banner_shield_green', 'banner_thin_green',
];
const SELLOS = ['palancas', 'inscripcion', 'relicario'];
const P = 'piso3';
const VALORES = [128, 64, 32, 16, 8, 4, 2, 1];

const std = (o) => new THREE.MeshStandardMaterial(o);

// Tabla ASCII para el atril de la inscripción (espacio, A-Z y a-z)
function tablaAscii() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 768;
  const g = c.getContext('2d');
  g.fillStyle = '#e9dcbc';
  g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = '#6b4f2a';
  g.lineWidth = 10;
  g.strokeRect(8, 8, c.width - 16, c.height - 16);
  g.fillStyle = '#3a2614';
  g.font = '700 46px Cinzel, serif';
  g.textAlign = 'center';
  g.fillText('Tabla ASCII', c.width / 2, 70);
  const celdas = [[32, '␣'], ...Array.from({ length: 26 }, (_, i) => [65 + i, String.fromCharCode(65 + i)]), ...Array.from({ length: 26 }, (_, i) => [97 + i, String.fromCharCode(97 + i)])];
  const cols = 4, filas = Math.ceil(celdas.length / cols);
  g.font = '600 30px "Alegreya Sans", sans-serif';
  g.textAlign = 'left';
  celdas.forEach(([n, ch], i) => {
    const col = Math.floor(i / filas), fila = i % filas;
    const x = 60 + col * 240, y = 125 + fila * 45;
    g.fillStyle = '#6b4f2a';
    g.fillText(String(n).padStart(3, ' '), x, y);
    g.fillStyle = '#1d120a';
    g.fillText(`→  ${ch}`, x + 70, y);
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Una palanca: base de piedra y mango con una bola que brilla cuando vale 1
function crearPalanca() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.5), std({ color: 0x6f6660, roughness: 0.9 }));
  base.position.y = 0.4;
  base.castShadow = true;
  const eje = new THREE.Group();
  eje.position.y = 0.82;
  const mango = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.8, 8), std({ color: 0x8a6a48, roughness: 0.7 }));
  mango.position.y = 0.4;
  const bolaMat = std({ color: 0x5a4a30, emissive: 0x000000, roughness: 0.4, metalness: 0.5 });
  const bola = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10), bolaMat);
  bola.position.y = 0.82;
  eje.add(mango, bola);
  g.add(base, eje);
  return { g, eje, bolaMat };
}

// Tomo de formato que se lleva a una estantería
function crearTomo(obj) {
  const colores = { jpg: 0x8a3a2a, mp3: 0x2a5a8a, h264: 0x6a2a7a, png: 0x2a7a4a, flac: 0x2a6a7a, zip: 0x7a6a2a };
  const g = new THREE.Group();
  const tapa = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.44, 0.12), std({ color: colores[obj.id] ?? 0x6b4a2a, roughness: 0.7, emissive: colores[obj.id] ?? 0x6b4a2a, emissiveIntensity: 0.35 }));
  g.add(tapa);
  return g;
}

export async function construir(ctx) {
  const { ui, sonido, fx, estado } = ctx;
  const piezas = await cargarPiezasTorre(ctx.paletas.mazmorra, [...PIEZAS_BASE, ...EXTRA]);
  const sala = crearSalaDeTorre({
    ambiente: { color: 0xe8c98a, cada: 0.06, brillo: 0.55 },
    escena: ctx.escena, origen: ORIGEN, piezas, fx, semilla: 33, cielo: [0.22, 0.28, 0.5],
    estandartes: { normal: 'banner_green', escudo: 'banner_shield_green', fino: 'banner_thin_green' },
  });
  const { poner, obstaculo, aMundo, grupo } = sala;
  await amueblar(sala, [ // estanterías llenas de libros en los muros y una alfombra en el centro
    ['shelf_B_large_decorated', -11.9, 1.3, -14, Math.PI / 2], ['shelf_B_large_decorated', -11.9, 2.4, -14, Math.PI / 2],
    ['shelf_B_large_decorated', 11.9, 1.3, -14, -Math.PI / 2], ['shelf_B_large_decorated', 11.9, 2.4, -14, -Math.PI / 2],
    ['rug_oval_A', 0, 0.01, 5, 0, 1.4],
    ['book_set', 10.3, 1.02, -3.2, 0.4],
  ]);
  const S = crearSellos(ctx, sala, C, SELLOS);
  const est = {
    sellos: S.estado.sellos,
    bits: [0, 0, 0, 0, 0, 0, 0, 0], puertaPalancas: 0,
    inscripcion: { paso: 0 },       // progreso individual
    pesos: { paso: 0 },             // progreso individual
    pesosHechos: false,
  };
  const aprendido = (id) => estado.learned.has(id);

  // ---------- Escritorios de los escribas y decorado ----------
  for (const [n, x, z, ry, r] of [
    ['table_long_decorated_C', -9.6, 14.2, Math.PI / 2, 1.2], ['table_long_tablecloth_decorated_A', 9.6, 14.2, Math.PI / 2, 1.2],
    ['table_small_decorated_A', -10.3, -5.2, 0, 0.8], ['table_small_decorated_A', 10.3, -3.2, 0, 0.8],
    ['chair', -8.8, -5.2, -Math.PI / 2, 0.4], ['stool', 8.9, -3.2, 0, 0.35],
  ]) { poner(n, x, 0, z, ry); obstaculo(x, z, r); }
  for (const [x, z] of [[-10.3, -5.2], [10.3, -3.2]]) poner('candle_lit', x + 0.3, 1.0, z + 0.2, 0);
  poner('bottle_A_labeled_green', -10.1, 1.0, -5.5, 0);
  poner('bottle_B_brown', 10.1, 1.0, -2.9, 0);
  poner('shelf_small_candles', -11.35, 2.2, -8, Math.PI / 2, 1, false);
  poner('shelf_small_candles', 11.35, 2.2, -8, -Math.PI / 2, 1, false);
  // pergaminos flotantes que dan vueltas por la sala
  const papel = std({ map: canvasTex(parchmentCanvas()), roughness: 0.9, side: THREE.DoubleSide, emissive: 0x3a2a10, emissiveIntensity: 0.5 });
  const flotantes = Array.from({ length: 5 }, (_, i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.65), papel);
    grupo.add(m);
    return { m, a: (i / 5) * Math.PI * 2, r: 5 + (i % 3), y: 4.2 + (i % 2) * 0.8 };
  });

  // ---------- Sello 1 · Las ocho palancas (oeste) ----------
  const palancas = VALORES.map((v, i) => {
    // vistas desde el centro de la sala, el 128 queda a la izquierda (como se escribe en binario)
    const z = 1.4 + (7 - i) * 1.25;
    const p = crearPalanca();
    p.g.position.set(-8.6, 0, z);
    p.g.rotation.y = Math.PI / 2; // miran hacia el centro de la sala
    grupo.add(p.g);
    obstaculo(-8.6, z, 0.4);
    return { ...p, z, pos: aMundo(-7.5, 0, z) };
  });
  // los valores de las posiciones (128 … 1) en un único rótulo sobre la fila de palancas
  const rotulo = document.createElement('canvas');
  rotulo.width = 1280;
  rotulo.height = 96;
  const rg = rotulo.getContext('2d');
  rg.font = '700 54px Cinzel, serif';
  rg.textAlign = 'center';
  rg.textBaseline = 'middle';
  rg.fillStyle = '#e8c98a';
  VALORES.forEach((v, i) => rg.fillText(String(v), 80 + i * 160, 50));
  const valores = new THREE.Mesh(new THREE.PlaneGeometry(10, 0.75), new THREE.MeshBasicMaterial({ map: canvasTex(rotulo), transparent: true, depthWrite: false }));
  valores.position.set(-8.9, 2.35, 1.4 + 3.5 * 1.25);
  valores.rotation.y = Math.PI / 2;
  grupo.add(valores);
  const ATRIL1 = new THREE.Vector3(-5.2, 0, 5.8);
  poner('column', ATRIL1.x, 0, ATRIL1.z);
  obstaculo(ATRIL1.x, ATRIL1.z, 0.45);
  const objetivoPal = cartelVivo(grupo, new THREE.Vector3(ATRIL1.x, 2.95, ATRIL1.z), { height: 0.34, fontSize: 44 });
  const lecturaPal = cartelVivo(grupo, new THREE.Vector3(ATRIL1.x, 2.45, ATRIL1.z), { height: 0.27, fontSize: 40, color: '#9fe6ff' });
  const luzRoja = new THREE.PointLight(0xff3030, 0, 9, 1.6);
  luzRoja.position.set(-8, 3, 5.8);
  grupo.add(luzRoja);
  const puertaActual = () => C.palancas.puertas[Math.min(est.puertaPalancas, 2)];
  function pintarPalancas() {
    est.bits.forEach((b, i) => {
      palancas[i].eje.rotation.z = b ? -0.6 : 0.6;
      palancas[i].bolaMat.emissive.setHex(b ? 0xffb040 : 0x000000);
      palancas[i].bolaMat.emissiveIntensity = b ? 2 : 0;
    });
    if (est.sellos.palancas) {
      objetivoPal.poner('¡Las tres puertas están abiertas!');
      lecturaPal.poner('Sello de las palancas roto');
      return;
    }
    const pu = puertaActual();
    const roja = pu.modo === 'negativo';
    const objetivo = pu.modo === 'hex' ? `0x${pu.objetivo.toString(16).toUpperCase()}` : String(pu.objetivo).replace('-', '−');
    objetivoPal.poner(`Puerta ${est.puertaPalancas + 1} de 3${roja ? ' (roja)' : ''} · Objetivo: ${objetivo}`, roja ? { border: 'rgba(255,80,60,0.95)' } : {});
    const v = leerBits(est.bits);
    lecturaPal.poner(`${v.binario} = ${v.sinSigno} · con signo ${v.conSigno} · ${v.hex}`);
    luzRoja.intensity = roja ? 18 : 0;
  }
  pintarPalancas();

  // ---------- Sello 2 · La inscripción (este) ----------
  const ATRIL2 = new THREE.Vector3(6.4, 0, 4.5);
  poner('column', ATRIL2.x, 0, ATRIL2.z);
  obstaculo(ATRIL2.x, ATRIL2.z, 0.45);
  const tabla = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), std({ map: tablaAscii(), roughness: 0.95, emissive: 0x2a2010, emissiveIntensity: 0.35 }));
  tabla.position.set(11.3, 3.3, 4.5);
  tabla.rotation.y = -Math.PI / 2;
  grupo.add(tabla);
  const inscripcion = makeLabel('72 111 108 97 · C3 B1 · 🔥', { height: 0.34, fontSize: 44, font: 'Cinzel, serif', color: '#ffcf7a' });
  inscripcion.position.set(ATRIL2.x, 2.5, ATRIL2.z);
  grupo.add(inscripcion);

  // ---------- Sello 3 · El relicario de los formatos (norte) ----------
  const MESA = { x: 0, z: -8.5 };
  poner('table_long_decorated_C', MESA.x, 0, MESA.z, Math.PI / 2);
  obstaculo(-1.2, MESA.z, 1.0);
  obstaculo(1.2, MESA.z, 1.0);
  const ATRIL3 = new THREE.Vector3(0, 0, -4.4);
  poner('column', ATRIL3.x, 0, ATRIL3.z);
  obstaculo(ATRIL3.x, ATRIL3.z, 0.45);
  const marcaRel = makeLabel('Relicario', { height: 0.36, fontSize: 46, font: 'Cinzel, serif', color: '#9fe6ff' });
  marcaRel.position.set(ATRIL3.x, 2.35, ATRIL3.z);
  grupo.add(marcaRel);
  const ESTANTES = { con: { x: -6.4, z: -14.2 }, sin: { x: 6.4, z: -14.2 } };
  for (const e of C.relicario.estanterias) {
    const { x, z } = ESTANTES[e.id];
    const est3 = crearEstanteria();
    est3.position.set(x, 0, z);
    grupo.add(est3);
    obstaculo(x - 0.7, z, 0.7);
    obstaculo(x + 0.7, z, 0.7);
    const l = makeLabel(e.texto, { height: 0.4, fontSize: 48, font: 'Cinzel, serif', color: e.id === 'con' ? '#ffb38a' : '#9fe6b0' });
    l.position.set(x, 3.2, z);
    grupo.add(l);
  }
  const clasif = crearClasificar(ctx, {
    piso: P, mec: 'formatos', sala, criterio: '1.1',
    objetos: C.relicario.tomos,
    receptaculos: C.relicario.estanterias.map((e) => ({ ...e, ...ESTANTES[e.id], y: 1.75, dz: 0.75, radio: 2.2 })),
    mesa: { ...MESA, y: 1.75, separacion: 0.75, radio: 2.6 },
    habilitado: () => est.pesosHechos && !est.sellos.relicario,
    alCompletar: () => S.romper('relicario'),
    visual: crearTomo,
  });

  // ---------- Guiño técnico: el espejo de las mallas ----------
  const ESPEJO = new THREE.Vector3(5.2, 0, 12.6);
  const marco = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.08, 10, 36), std({ color: 0xb08a4a, metalness: 0.85, roughness: 0.35 }));
  marco.scale.y = 1.45;
  marco.position.set(ESPEJO.x, 1.6, ESPEJO.z);
  const luna = new THREE.Mesh(new THREE.CircleGeometry(0.8, 32), std({ color: 0x9fb7d8, metalness: 1, roughness: 0.08, emissive: 0x1a2a4a, emissiveIntensity: 0.6 }));
  luna.scale.y = 1.45;
  luna.position.copy(marco.position);
  marco.rotation.y = luna.rotation.y = Math.PI;
  grupo.add(marco, luna);
  obstaculo(ESPEJO.x, ESPEJO.z, 0.6);
  async function verMalla() {
    const mallas = [];
    ctx.jugador.modelo?.traverse((o) => { if (o.isMesh && o.geometry?.attributes?.position) mallas.push(o); });
    let vertices = 0, caras = 0;
    for (const m of mallas) {
      vertices += m.geometry.attributes.position.count;
      caras += m.geometry.index ? m.geometry.index.count / 3 : m.geometry.attributes.position.count / 3;
    }
    const antes = mallas.map((m) => m.material.wireframe);
    mallas.forEach((m) => { m.material.wireframe = true; });
    sonido.holograma();
    await ui.dialogue([
      'Mirad vuestro reflejo… sin la piel. Así os ve el ordenador: una **malla** de puntos unidos por líneas.',
      `Vuestro personaje tiene **${vertices.toLocaleString('es-ES')} vértices** (los puntos) y **${Math.round(caras).toLocaleString('es-ES')} caras** triangulares. Las **aristas** son las líneas que los unen.`,
      'Encima se pega una **textura** (una imagen) que le da color. Todo junto se guarda en un archivo **glTF**, el formato que usa este juego: vuestro personaje es, literalmente, un archivo de números.',
    ]);
    mallas.forEach((m, i) => { m.material.wireframe = antes[i]; });
  }

  // ---------- Interactuables ----------
  const zona = sala.zona;
  const interactuables = [
    {
      zona, pos: aMundo(ATRIL1.x, 0, ATRIL1.z), r: 2.3,
      enabled: () => !est.sellos.palancas && !aprendido('binario'),
      prompt: () => '**E** · Examinar la puerta de las palancas',
      action: () => ctx.accion('leccion', { id: 'binario', piso: P }),
    },
    ...palancas.map((p, i) => ({
      zona, pos: p.pos, r: 0.62,
      enabled: () => !est.sellos.palancas && aprendido('binario'),
      prompt: () => `**E** · Mover la palanca del ${VALORES[i]} (ahora vale ${est.bits[i]})`,
      action: () => ctx.accion('mec', { piso: P, mec: 'palancas', paso: 'bit', i, v: est.bits[i] ? 0 : 1, puerta: est.puertaPalancas }),
    })),
    {
      zona, pos: aMundo(ATRIL2.x, 0, ATRIL2.z), r: 2.4,
      enabled: () => !est.sellos.inscripcion,
      prompt: () => (aprendido('texto') ? '**E** · Descifrar la inscripción' : '**E** · Examinar la inscripción'),
      action: () => (aprendido('texto') ? hacerInscripcion() : ctx.accion('leccion', { id: 'texto', piso: P, luego: 'inscripcion' })),
    },
    {
      zona, pos: aMundo(ATRIL3.x, 0, ATRIL3.z), r: 2.2,
      enabled: () => !est.sellos.relicario && !est.pesosHechos,
      prompt: () => (aprendido('multimedia') ? '**E** · Calcular los pesos del relicario' : '**E** · Examinar el relicario'),
      action: () => (aprendido('multimedia') ? hacerPesos() : ctx.accion('leccion', { id: 'multimedia', piso: P, luego: 'pesos' })),
    },
    ...clasif.interactuables,
    {
      zona, pos: aMundo(ESPEJO.x, 0, ESPEJO.z), r: 2.0,
      enabled: () => true,
      prompt: () => '**E** · Mirarse en el espejo de las mallas',
      action: verMalla,
    },
  ];

  async function hacerInscripcion() {
    if (await serieDePreguntas(ctx, C.inscripcion, 'La inscripción', est.inscripcion)) ctx.accion('mec', { piso: P, mec: 'inscripcion', paso: 'sello' });
  }
  async function hacerPesos() {
    if (await serieDePreguntas(ctx, C.relicario.pesos, 'El relicario', est.pesos)) ctx.accion('mec', { piso: P, mec: 'pesos', paso: 'hecho' });
  }

  // ---------- Red ----------
  function validar(d) {
    if (d.mec === 'palancas') return !est.sellos.palancas && d.puerta === est.puertaPalancas && d.i >= 0 && d.i < 8;
    if (d.mec === 'inscripcion') return !est.sellos.inscripcion;
    if (d.mec === 'pesos') return !est.pesosHechos;
    if (d.mec === 'formatos') return clasif.validar(d);
    return false;
  }
  const clave = (d) => (d.paso === 'sello' || d.paso === 'hecho' ? `mec:${P}:${d.mec}:${d.paso}` : null);

  function aplicar(d, soyAutor) {
    if (d.mec === 'palancas') aplicarBit(d, soyAutor);
    else if (d.mec === 'inscripcion') ctx.runFlow(() => S.romper('inscripcion'));
    else if (d.mec === 'pesos') {
      est.pesosHechos = true;
      sonido.acierto();
      ctx.runFlow(() => ui.dialogue(['¡Pesos correctos! Ahora llevad cada **tomo** a su estantería: **con pérdida** a la izquierda, **sin pérdida** a la derecha.']));
    } else if (d.mec === 'formatos') clasif.aplicar(d, soyAutor);
    ctx.refrescarObjetivos();
  }

  function aplicarBit(d, soyAutor) {
    est.bits[d.i] = d.v;
    sonido.palanca();
    const pu = puertaActual();
    if (cumpleObjetivo(est.bits, pu.objetivo)) {
      if (soyAutor) ctx.record(true, '1.1');
      est.puertaPalancas++;
      est.bits = [0, 0, 0, 0, 0, 0, 0, 0];
      sonido.acierto();
      fx.big.emit(aMundo(-8.6, 2, 5.8), { count: 70, color: 0xffd27a, intensity: 2, speed: 3.5, life: 1.1, gravity: -2 });
      ctx.runFlow(async () => {
        if (est.puertaPalancas < 3) {
          await ui.dialogue([`¡Puerta abierta! ${pu.bien}`, `**Siguiente:** ${puertaActual().texto}`]);
          // antes de la puerta roja hay que aprender complemento a 2
          if (est.puertaPalancas === 2 && soyAutor) ctx.accion('leccion', { id: 'complemento2', piso: P });
        } else {
          await ui.dialogue([`¡La puerta roja cede! ${pu.bien}`]);
          await S.romper('palancas');
        }
        pintarPalancas();
      });
    }
    pintarPalancas();
  }

  function jugadorFuera(id) { clasif.jugadorFuera(id); }

  // ---------- Animación ----------
  function actualizar(dt, t) {
    sala.update(dt, t);
    clasif.actualizar(dt, t);
    marcaRel.position.y = 2.35 + Math.sin(t * 2.1) * 0.08;
    inscripcion.position.y = 2.5 + Math.sin(t * 1.7) * 0.06;
    for (const f of flotantes) {
      f.a += dt * 0.12;
      f.m.position.set(Math.cos(f.a) * f.r, f.y + Math.sin(t * 1.3 + f.a) * 0.2, Math.sin(f.a) * f.r);
      f.m.rotation.y = -f.a;
    }
    luna.material.emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.15;
  }

  function objetivos() {
    const items = [
      { text: `Las ocho palancas: puertas abiertas (${Math.min(est.puertaPalancas, 3)}/3)`, done: est.sellos.palancas },
      { text: 'Descifra la inscripción del atril', done: est.sellos.inscripcion },
      { text: est.pesosHechos ? `Relicario: tomos en su estantería (${clasif.colocados()}/${clasif.total})` : 'Relicario: calcula los pesos', done: est.sellos.relicario },
    ];
    if (S.estado.puerta) items.push({ text: 'Subid por la escalera del norte', done: false });
    return items;
  }
  function pista() {
    if (!est.sellos.palancas) return C.pistas.palancas;
    if (!est.sellos.inscripcion) return C.pistas.inscripcion;
    if (!est.sellos.relicario) return C.pistas.relicario;
    return C.pistas.puerta;
  }
  // a dónde apunta la guía de la misión actual (main.js la dibuja)
  function destino() {
    if (!est.sellos.palancas) return aMundo(ATRIL1.x, 0, ATRIL1.z);
    if (!est.sellos.inscripcion) return aMundo(ATRIL2.x, 0, ATRIL2.z);
    if (!est.sellos.relicario) return aMundo(ATRIL3.x, 0, ATRIL3.z);
    return 'salida';
  }

  Object.assign(zona, {
    id: P, nombre: C.nombre, musica: 'scriptorium',
    actualizar, objetivos, pista, destino,
    salida: { abierta: () => S.estado.puerta, z: sala.salidaZ, accion: ['subir', { piso: 'piso4' }] },
  });
  zona.grupo.visible = false;

  return {
    id: P, zona, interactuables, contenido: C, estado: est,
    validar, clave, aplicar, jugadorFuera,
    async alAprender(id, soyAutor, luego) {
      if (id === 'binario' || id === 'complemento2') await ui.dialogue([puertaActual().texto], 'El atril de las palancas');
      if (soyAutor && luego === 'inscripcion') await hacerInscripcion();
      if (soyAutor && luego === 'pesos') await hacerPesos();
    },
    intro: () => ui.dialogue(C.intro),
  };
}
