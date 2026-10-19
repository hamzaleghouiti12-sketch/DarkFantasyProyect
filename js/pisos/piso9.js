// Piso IX · El Tribunal de los Datos (protección de datos, identidad y huella; criterios 3.2 y 3.3).
//   1. Los juicios del estrado: 6 casos sobre derechos (supresión, oposición, portabilidad…).
//   2. El cofre sellado: qué clave usar al cifrar y al firmar, y los pasos de un trámite
//      electrónico. Al abrirlo se firma y verifica un pergamino con WebCrypto de verdad.
//   3. El espejo de la huella: la sombra enumera rastros reales de esta partida (sin enviar
//      nada) y hay que decir si son huella activa o pasiva.
import * as THREE from 'three';
import C from '../contenido/piso9.js';
import { crearSalaDeTorre, cargarPiezasTorre, PIEZAS_BASE } from '../nucleo/sala-torre.js';
import { makeLabel } from '../textures.js';
import { crearSellos, serieDePreguntas } from './comun.js';
import { amueblar } from './muebles.js';
import { PERSONAJES } from '../personajes.js';

export const ORIGEN = new THREE.Vector3(0, 0, -5600);
const P = 'piso9';
const SELLOS = ['juicios', 'cofre', 'espejo'];
const EXTRA = ['column', 'chest_gold', 'table_long_tablecloth_decorated_A', 'chair', 'candle_triple', 'banner_yellow', 'banner_shield_yellow', 'banner_thin_yellow'];
const std = (o) => new THREE.MeshStandardMaterial(o);

// Firma y verificación reales (ECDSA P-256). Solo en contextos seguros (localhost o HTTPS).
async function firmarDeVerdad(texto) {
  if (!globalThis.crypto?.subtle) return null;
  try {
    const par = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);
    const datos = new TextEncoder().encode(texto);
    const firma = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, par.privateKey, datos);
    const ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, par.publicKey, firma, datos);
    const hex = [...new Uint8Array(firma)].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
    return { ok, hex };
  } catch { return null; }
}

// Rastros de esta partida para el espejo (todo local)
function rastros(estado) {
  const leer = (k) => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };
  const lista = [];
  const nombre = leer('torreMorvathNombre');
  if (nombre) lista.push({ t: `Os llamáis «${nombre}» en esta torre.`, activa: true, por: 'Ese nombre lo escribisteis vosotros: es huella activa.' });
  const lema = leer('torreMorvathEtiqueta');
  if (lema) lista.push({ t: `Vuestro lema es «${lema}».`, activa: true, por: 'El lema lo publicasteis a propósito: huella activa.' });
  const pj = PERSONAJES.find((p) => p.id === leer('torreMorvathPersonaje'));
  lista.push({ t: `Elegisteis aparecer como ${pj ? pj.nombre.toLowerCase() : 'aprendiz'}.`, activa: true, por: 'Elegir cómo os ven es parte de lo que mostráis: huella activa.' });
  const inicio = new Date(Date.now() - (performance.now() - (estado.startedAt || performance.now())));
  lista.push({ t: `Empezasteis a jugar a las ${inicio.getHours()}:${String(inicio.getMinutes()).padStart(2, '0')}.`, activa: false, por: 'La hora se registró sola, sin que la publicarais: huella pasiva.' });
  lista.push({ t: `Lleváis ${estado.aciertos} respuestas acertadas y ${estado.fallos} falladas.`, activa: false, por: 'Ese registro lo lleva el juego automáticamente: huella pasiva.' });
  lista.push({ t: `Vuestra pantalla mide ${screen.width}×${screen.height} píxeles y usáis ${/Mobi|Android/i.test(navigator.userAgent) ? 'un móvil o tableta' : 'un ordenador'}.`, activa: false, por: 'El navegador lo cuenta sin preguntar: huella pasiva (muy usada para reconocer dispositivos).' });
  return lista;
}

export async function construir(ctx) {
  const { ui, sonido, fx, estado } = ctx;
  const piezas = await cargarPiezasTorre(ctx.paletas.mazmorra, [...PIEZAS_BASE, ...EXTRA]);
  const sala = crearSalaDeTorre({
    ambiente: { color: 0xffe2a0, cada: 0.06, brillo: 0.5, vida: 6 },
    escena: ctx.escena, origen: ORIGEN, piezas, fx, semilla: 91, cielo: [0.26, 0.24, 0.42],
    estandartes: { normal: 'banner_yellow', escudo: 'banner_shield_yellow', fino: 'banner_thin_yellow' },
  });
  const { poner, obstaculo, aMundo, grupo } = sala;
  await amueblar(sala, [
    ['rug_rectangle_stripes_A', 0, 0.01, 2, Math.PI / 2, 1.8],
    ['rug_oval_A', 0, 0.01, -9, 0, 1.6],
  ]);
  const S = crearSellos(ctx, sala, C, SELLOS);
  const est = { sellos: S.estado.sellos, juicios: { paso: 0 }, cofre: { paso: 0 }, espejoPaso: 0 };
  const aprendido = (id) => estado.learned.has(id);

  // ---------- El estrado (norte) y los bancos del público ----------
  const ESTRADO = { x: 0, z: -9 };
  poner('table_long_tablecloth_decorated_A', ESTRADO.x, 0, ESTRADO.z, 0, 1.4);
  for (const x of [-2, 0, 2]) obstaculo(ESTRADO.x + x, ESTRADO.z, 1.1);
  for (const x of [-1.5, 0, 1.5]) poner('chair', x, 0, ESTRADO.z - 1.3, Math.PI);
  for (const z of [3, 6]) for (const x of [-6, -3.6, 3.6, 6]) { poner('chair', x, 0, z, Math.PI); obstaculo(x, z, 0.45); }
  // la balanza de la justicia sobre el estrado
  const balanza = new THREE.Group();
  const oro = std({ color: 0xd4af6a, metalness: 0.8, roughness: 0.3, emissive: 0x3a2a10 });
  const barra = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.05), oro);
  barra.position.y = 0.9;
  const mastil = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.9, 8), oro);
  mastil.position.y = 0.45;
  balanza.add(barra, mastil);
  for (const lado of [-0.75, 0.75]) {
    const plato = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.04, 16), oro);
    plato.position.set(lado, 0.55, 0);
    balanza.add(plato);
  }
  balanza.position.set(ESTRADO.x, 1.3, ESTRADO.z);
  grupo.add(balanza);

  // ---------- El cofre sellado (oeste) ----------
  const COFRE = { x: -8, z: -1 };
  const cofre = poner('chest_gold', COFRE.x, 0, COFRE.z, Math.PI / 2, 1.5);
  obstaculo(COFRE.x, COFRE.z, 1.0);
  const candado = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.05, 10, 24), std({ color: 0x8fd8ff, emissive: 0x2a8aff, emissiveIntensity: 1.6 }));
  candado.position.set(COFRE.x + 0.9, 1.05, COFRE.z);
  candado.rotation.y = Math.PI / 2;
  grupo.add(candado);

  // ---------- El espejo de la huella (este) ----------
  const ESPEJO = { x: 8.6, z: -1 };
  poner('column', ESPEJO.x, 0, ESPEJO.z);
  obstaculo(ESPEJO.x, ESPEJO.z, 0.6);
  const lunaEspejo = new THREE.Mesh(new THREE.CircleGeometry(0.9, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 0.32, 0.45) }));
  lunaEspejo.position.set(ESPEJO.x - 0.45, 2.4, ESPEJO.z);
  lunaEspejo.rotation.y = -Math.PI / 2;
  grupo.add(lunaEspejo);

  for (const [t, x, z, y] of [['El estrado', ESTRADO.x, ESTRADO.z, 3.2], ['El cofre sellado', COFRE.x, COFRE.z, 2.4], ['El espejo de la huella', ESPEJO.x - 0.3, ESPEJO.z, 3.6]]) {
    const l = makeLabel(t, { height: 0.32, fontSize: 40, font: 'Cinzel, serif', color: '#f0d9a6' });
    l.position.set(x, y, z);
    grupo.add(l);
  }

  // ---------- Los tres desafíos ----------
  async function hacerJuicios() {
    if (await serieDePreguntas(ctx, C.juicios, 'El estrado', est.juicios)) ctx.accion('mec', { piso: P, mec: 'juicios', paso: 'sello' });
  }
  async function hacerCofre() {
    if (!(await serieDePreguntas(ctx, C.cofre, 'El cofre sellado', est.cofre))) return;
    const r = await firmarDeVerdad('Pergamino de Aldric · Piso IX');
    await ui.dialogue([C.firmaAldric, r ? `(Firma de verdad, hecha ahora mismo en vuestro navegador con ECDSA: **${r.hex}…**. Verificación: **${r.ok ? 'correcta' : 'fallida'}**.)` : '(Este navegador no permite la criptografía real aquí, así que el cofre lo ha simulado.)']);
    ctx.accion('mec', { piso: P, mec: 'cofre', paso: 'sello' });
  }
  async function hacerEspejo() {
    const E = C.espejo;
    await ui.dialogue([E.aviso]);
    const lista = rastros(estado);
    for (let i = est.espejoPaso; i < lista.length; i++) {
      const r = lista[i];
      const q = { id: `p9-r${i}`, concepto: 'huella', criterio: '3.3', tipo: 'opcion', texto: `La sombra dice: «${r.t}» ¿Qué tipo de huella es?`, opciones: [E.activa, E.pasiva], correcta: r.activa ? 0 : 1, explicacion: r.por };
      const ok = await ui.quiz(q, `El espejo de la huella · rastro ${i + 1} de ${lista.length}`);
      ctx.record(ok, '3.3');
      if (!ok) { est.espejoPaso = i; await ui.dialogue(['Casi. Repasad **la huella digital** en el grimorio (**G**) y volved al espejo.']); return; }
      est.espejoPaso = i + 1;
    }
    const ok = await ui.quiz(E.final, 'El espejo de la huella · el panel de privacidad');
    ctx.record(ok, E.final.criterio);
    if (!ok) return ui.dialogue(['Casi. Pensad qué deja ver menos de vosotros y volved al espejo.']);
    await ui.dialogue([E.hecho]);
    ctx.accion('mec', { piso: P, mec: 'espejo', paso: 'sello' });
  }

  const zona = sala.zona;
  // la balanza pesa cada respuesta: se inclina hacia la luz al acertar y hacia la sombra al fallar
  let peso = 0;
  const responderSala = zona.alResponder;
  zona.alResponder = (ok, racha) => {
    responderSala?.(ok, racha);
    peso = Math.max(-0.45, Math.min(0.45, peso + (ok ? 0.3 : -0.3)));
    fx.small.emit(balanza.position.clone().add(ORIGEN).setY(2.3), { count: 20, color: ok ? 0xffd27a : 0x6a5a8a, intensity: 2, speed: 1.4, life: 0.8 });
  };
  const interactuables = [
    {
      zona, pos: aMundo(ESTRADO.x, 0, ESTRADO.z + 2), r: 2.6,
      enabled: () => !est.sellos.juicios,
      prompt: () => (aprendido('rgpd') ? '**E** · Escuchar los juicios del estrado' : '**E** · Acercarse al estrado'),
      action: () => (aprendido('rgpd') ? hacerJuicios() : ctx.accion('leccion', { id: 'rgpd', piso: P, luego: 'juicios9' })),
    },
    {
      zona, pos: aMundo(COFRE.x + 1.4, 0, COFRE.z), r: 2.3,
      enabled: () => !est.sellos.cofre,
      prompt: () => (aprendido('identidad') ? '**E** · Abrir el cofre sellado' : '**E** · Examinar el cofre sellado'),
      action: () => (aprendido('identidad') ? hacerCofre() : ctx.accion('leccion', { id: 'identidad', piso: P, luego: 'cofre9' })),
    },
    {
      zona, pos: aMundo(ESPEJO.x - 1.4, 0, ESPEJO.z), r: 2.3,
      enabled: () => !est.sellos.espejo,
      prompt: () => (aprendido('huella') ? '**E** · Mirarse en el espejo de la huella' : '**E** · Acercarse al espejo'),
      action: () => (aprendido('huella') ? hacerEspejo() : ctx.accion('leccion', { id: 'huella', piso: P, luego: 'espejo9' })),
    },
  ];

  const validar = (d) => SELLOS.includes(d.mec) && !est.sellos[d.mec];
  const clave = (d) => `mec:${P}:${d.mec}:sello`;
  function aplicar(d) {
    if (d.mec === 'cofre') {
      candado.visible = false;
      fx.big.emit(aMundo(COFRE.x, 1.4, COFRE.z), { count: 80, color: 0xffd27a, intensity: 2.2, speed: 3, life: 1.2, gravity: -2 });
    }
    if (d.mec === 'espejo') lunaEspejo.material.color.setRGB(0.6, 0.75, 1.2);
    if (d.mec === 'juicios') balanza.rotation.z = 0;
    ctx.runFlow(() => S.romper(d.mec));
    ctx.refrescarObjetivos();
  }

  function actualizar(dt, t) {
    sala.update(dt, t);
    peso *= Math.max(0, 1 - dt * 0.9);
    balanza.rotation.z = (est.sellos.juicios ? 0 : Math.sin(t * 0.8) * 0.12) + peso; // la balanza duda… y pesa lo que respondéis
    candado.rotation.z += dt * 1.2;
    if (!est.sellos.espejo) {
      const p = 0.3 + Math.sin(t * 1.7) * 0.05;
      lunaEspejo.material.color.setRGB(p, p * 1.05, p * 1.5);
    }
  }
  function objetivos() {
    const items = [
      { text: `Resuelve los juicios del estrado (${Math.min(est.juicios.paso, C.juicios.length)}/${C.juicios.length})`, done: est.sellos.juicios },
      { text: 'Abre el cofre sellado con la clave correcta', done: est.sellos.cofre },
      { text: 'Reconoce tu huella en el espejo', done: est.sellos.espejo },
    ];
    if (S.estado.puerta) items.push({ text: 'Subid por la escalera del norte', done: false });
    return items;
  }
  function pista() {
    if (!est.sellos.juicios) return C.pistas.juicios;
    if (!est.sellos.cofre) return C.pistas.cofre;
    if (!est.sellos.espejo) return C.pistas.espejo;
    return C.pistas.puerta;
  }
  // a dónde apunta la guía de la misión actual (main.js la dibuja)
  function destino() {
    if (!est.sellos.juicios) return aMundo(ESTRADO.x, 0, ESTRADO.z + 2);
    if (!est.sellos.cofre) return aMundo(COFRE.x + 1.4, 0, COFRE.z);
    if (!est.sellos.espejo) return aMundo(ESPEJO.x - 1.4, 0, ESPEJO.z);
    return 'salida';
  }

  Object.assign(zona, {
    id: P, nombre: C.nombre, musica: 'tribunal',
    actualizar, objetivos, pista, destino,
    salida: { abierta: () => S.estado.puerta, z: sala.salidaZ, accion: ['subir', { piso: 'piso10' }] },
  });
  zona.grupo.visible = false;

  return {
    id: P, zona, interactuables, contenido: C, estado: est,
    validar, clave, aplicar, jugadorFuera() {},
    async alAprender(id, soyAutor, luego) {
      if (!soyAutor) return;
      if (luego === 'juicios9') await hacerJuicios();
      if (luego === 'cofre9') await hacerCofre();
      if (luego === 'espejo9') await hacerEspejo();
    },
    intro: () => ui.dialogue(C.intro),
  };
}
