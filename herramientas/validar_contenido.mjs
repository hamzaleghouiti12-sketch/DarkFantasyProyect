// Valida el contenido educativo de todos los pisos antes de cada commit:
//   node herramientas/validar_contenido.mjs
// Comprueba ids únicos, criterios válidos, respuestas dentro de rango,
// lecciones que existen y datos completos en cada tipo de pregunta.
import { PISO1, PREGUNTAS } from '../js/content.js';
import PISO2 from '../js/contenido/piso2.js';
import PISO3 from '../js/contenido/piso3.js';
import PISO4 from '../js/contenido/piso4.js';
import PISO5 from '../js/contenido/piso5.js';
import PISO6 from '../js/contenido/piso6.js';
import PISO7 from '../js/contenido/piso7.js';
import PISO8 from '../js/contenido/piso8.js';

const CRITERIOS = ['1.1', '1.2', '2.1', '2.2', '2.3', '3.1', '3.2', '3.3', '4.1', '4.2', '4.3', '4.4', '4.5'];
const CRITERIO_PISO1 = { contrasenas: '3.1', '2fa': '3.3', phishing: '3.3' }; // igual que en main.js
const LECCIONES = { ...PISO1.lecciones, ...PISO2.lecciones, ...PISO3.lecciones, ...PISO4.lecciones, ...PISO5.lecciones, ...PISO6.lecciones, ...PISO7.lecciones, ...PISO8.lecciones };
const errores = [];
const mal = (donde, msg) => errores.push(`${donde}: ${msg}`);

const preguntas = [
  ...PREGUNTAS.map((q) => ({ criterio: CRITERIO_PISO1[q.concepto], ...q, origen: 'piso1' })),
  { ...PISO1.cartel, criterio: '3.3', origen: 'piso1 (cartel)' },
  ...PISO2.preguntas.map((q) => ({ ...q, origen: 'piso2' })),
  { ...PISO2.balanza.orden, origen: 'piso2 (balanza)' },
  ...PISO2.balanza.conversiones.map((q) => ({ ...q, origen: 'piso2 (balanza)' })),
  { ...PISO2.cripta.pregunta, origen: 'piso2 (cripta)' },
  ...PISO3.preguntas.map((q) => ({ ...q, origen: 'piso3' })),
  ...PISO3.inscripcion.map((q) => ({ ...q, origen: 'piso3 (inscripción)' })),
  ...PISO3.relicario.pesos.map((q) => ({ ...q, origen: 'piso3 (relicario)' })),
  ...PISO4.preguntas.map((q) => ({ ...q, origen: 'piso4' })),
  { ...PISO4.preguntaCable, origen: 'piso4 (cable)' },
  ...PISO5.preguntas.map((q) => ({ ...q, origen: 'piso5' })),
  ...PISO6.preguntas.map((q) => ({ ...q, origen: 'piso6' })),
  ...PISO6.medidas.map((q) => ({ ...q, origen: 'piso6 (medidas)' })),
  ...PISO7.preguntas.map((q) => ({ ...q, origen: 'piso7' })),
  { ...PISO7.curacion, origen: 'piso7 (curación)' },
  ...PISO8.preguntas.map((q) => ({ ...q, origen: 'piso8' })),
  ...PISO8.triada.map((q) => ({ ...q, origen: 'piso8 (tríada)' })),
];

const ids = new Set();
for (const q of preguntas) {
  const donde = `${q.origen} · ${q.id ?? '(sin id)'}`;
  if (!q.id) mal(donde, 'falta el id');
  else if (ids.has(q.id)) mal(donde, 'id repetido');
  ids.add(q.id);
  if (!CRITERIOS.includes(q.criterio)) mal(donde, `criterio no válido: ${q.criterio}`);
  if (!LECCIONES[q.concepto]) mal(donde, `la lección «${q.concepto}» no existe`);
  if (!q.texto || !q.explicacion) mal(donde, 'falta el texto o la explicación');
  const tipo = q.tipo ?? 'opcion';
  if (tipo === 'opcion' && !(Number.isInteger(q.correcta) && q.correcta >= 0 && q.correcta < q.opciones?.length)) mal(donde, '«correcta» fuera de rango');
  if (tipo === 'numero' && !Number.isFinite(q.valor)) mal(donde, 'falta «valor»');
  if (tipo === 'orden' && !(q.opciones?.length >= 3)) mal(donde, 'hacen falta al menos 3 elementos para ordenar');
  if (tipo === 'texto' && !q.aceptadas?.length) mal(donde, 'faltan las respuestas «aceptadas»');
  if (!['opcion', 'numero', 'texto', 'orden'].includes(tipo)) mal(donde, `tipo desconocido: ${tipo}`);
}

// cada lección de un piso tiene sus preguntas de repaso para la varita
for (const [id, l] of Object.entries(LECCIONES)) {
  if (!l.titulo || !l.resumen || !l.paginas?.length) mal(`lección ${id}`, 'falta título, resumen o páginas');
  if (!preguntas.some((q) => q.concepto === id && !q.origen.includes('('))) mal(`lección ${id}`, 'la varita no tiene preguntas de esta lección');
}

// Piso II: encargos y receptáculos coherentes
const soportes = new Set(PISO2.soportes.opciones.map((o) => o.id));
PISO2.soportes.encargos.forEach((e, i) => {
  if (!e.correctas.length || e.correctas.some((c) => !soportes.has(c))) mal(`piso2 · encargo ${i + 1}`, 'respuesta que no es ningún soporte');
  if (!e.bien || !e.pista) mal(`piso2 · encargo ${i + 1}`, 'falta «bien» o «pista»');
});
if (PISO2.soportes.encargos.length < PISO2.soportes.aciertosNecesarios) mal('piso2', 'hay menos encargos que aciertos necesarios');
if (!PISO2.cripta.receptaculos.some((r) => r.fuera)) mal('piso2 · cripta', 'ningún receptáculo está fuera: la regla 3-2-1 sería imposible');

// Piso III: los tomos van a una estantería que existe
const estanterias = new Set(PISO3.relicario.estanterias.map((e) => e.id));
for (const t of PISO3.relicario.tomos) if (!estanterias.has(t.destino)) mal(`piso3 · tomo ${t.id}`, `estantería desconocida: ${t.destino}`);

// Piso IV: las pasarelas unen islas que existen y el núcleo incluye Tenerife y Gran Canaria
const islas4 = new Set([...Object.keys(PISO4.islas), 'muelle', 'salida']);
for (const [a, b] of PISO4.pasarelas) if (!islas4.has(a) || !islas4.has(b)) mal('piso4 · pasarela', `${a}-${b}`);
for (const n of [...PISO4.nucleo, ...PISO4.hojas]) if (!PISO4.islas[n]) mal('piso4', `isla desconocida: ${n}`);
for (const n of Object.values(PISO4.terminal.dns)) if (!PISO4.terminal.equipos[n]) mal('piso4 · dns', n);

// Piso VI: los encargos del altar de herramientas apuntan a programas que existen
const programas = new Set(PISO6.programas.opciones.map((o) => o.id));
PISO6.programas.encargos.forEach((e, i) => { if (!e.correctas.every((c) => programas.has(c))) mal(`piso6 · encargo ${i + 1}`, 'programa desconocido'); });

// Piso VIII: cada criatura tiene un tipo con contramedida
for (const c of PISO8.criaturas) if (!PISO8.tipos.includes(c.tipo) || !PISO8.contramedidas[c.tipo]) mal(`piso8 · ${c.id}`, 'tipo sin contramedida');

// Piso VIII: las preguntas del duelo con Morvath existen
for (const id of PISO8.jefe.preguntas) if (!preguntas.some((q) => q.id === id)) mal('piso8 · jefe', `pregunta desconocida: ${id}`);

const porPiso = (p) => preguntas.filter((q) => q.origen === p).length;
for (const p of ['piso2', 'piso3', 'piso4', 'piso5', 'piso6', 'piso7', 'piso8']) if (porPiso(p) < 12) mal(p, `la varita necesita al menos 12 preguntas (hay ${porPiso(p)})`);

if (errores.length) {
  console.error(`✗ ${errores.length} problema(s) en el contenido:\n  ${errores.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ Contenido correcto: ${preguntas.length} preguntas, ${Object.keys(LECCIONES).length} lecciones, criterios ${[...new Set(preguntas.map((q) => q.criterio))].sort().join(', ')}.`);
