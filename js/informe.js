// Informe para el profesor (PLAN_TECNICO.md, Fase 0): una página HTML que se
// descarga y se puede imprimir o entregar. Sale del progreso guardado en este
// navegador; no se envía a ningún sitio. Módulo puro (se prueba con Node).

export const CRITERIOS = {
  '1.1': 'Almacenamiento, codificación y protección de datos',
  '1.2': 'Redes: conexión, configuración, mantenimiento y sostenibilidad',
  '2.1': 'Modelado 3D',
  '2.2': 'Publicar contenidos web',
  '2.3': 'Buscar, seleccionar y organizar información respetando licencias',
  '3.1': 'Seguridad de la información, huella digital y malware',
  '3.2': 'Protección de datos y derechos digitales',
  '3.3': 'Amenazas, identificación electrónica y fiabilidad de la información',
  '4.1': 'Pensamiento computacional',
  '4.2': 'Diagramas de flujo y algoritmos',
  '4.3': 'IDE, tratamiento de datos, comentar código, IA y datos',
  '4.4': 'Programar apps para dispositivos variados',
  '4.5': 'Diseñar aplicaciones de RV y RA',
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const tiempo = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// nivel orientativo a partir del porcentaje de aciertos
export function nivel(a, f) {
  const n = a + f;
  if (!n) return 'Sin datos';
  const p = a / n;
  if (n < 3) return 'Pocos datos';
  if (p >= 0.85) return 'Muy bien';
  if (p >= 0.65) return 'Bien';
  if (p >= 0.45) return 'En progreso';
  return 'Necesita repaso';
}

// pisos: [{ id, nombre }] en orden; progreso: { pisos: {id: {completado, mejorPrecision, segundos}}, criterios: {k: {a, f}} }
export function informeHTML({ alumno, fecha, pisos, progreso }) {
  const filasPisos = pisos.map(({ id, nombre }) => {
    const p = progreso.pisos[id];
    return `<tr><td>${esc(nombre)}</td><td>${p?.completado ? '✔ Superado' : '—'}</td><td>${p ? `${p.mejorPrecision}%` : ''}</td><td>${p?.segundos ? tiempo(p.segundos) : ''}</td></tr>`;
  }).join('');
  const filasCriterios = Object.entries(CRITERIOS).map(([k, texto]) => {
    const c = progreso.criterios[k] ?? { a: 0, f: 0 };
    const n = c.a + c.f;
    const pct = n ? Math.round((c.a / n) * 100) : null;
    return `<tr class="${n ? '' : 'vacio'}"><td><b>${k}</b></td><td>${esc(texto)}</td><td>${c.a}</td><td>${c.f}</td><td>${pct === null ? '' : `${pct}%`}<div class="barra"><i style="width:${pct ?? 0}%"></i></div></td><td>${nivel(c.a, c.f)}</td></tr>`;
  }).join('');
  const superados = pisos.filter(({ id }) => progreso.pisos[id]?.completado).length;
  const totA = Object.values(progreso.criterios).reduce((s, c) => s + c.a, 0);
  const totF = Object.values(progreso.criterios).reduce((s, c) => s + c.f, 0);
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Informe · La Torre de Morvath · ${esc(alumno)}</title>
<style>
  body { font: 15px/1.5 system-ui, sans-serif; color: #222; max-width: 900px; margin: 24px auto; padding: 0 16px; }
  h1 { font-size: 22px; margin: 0 0 4px; } h2 { font-size: 17px; margin: 28px 0 8px; }
  .meta { color: #555; margin-bottom: 16px; }
  .resumen { display: flex; gap: 12px; flex-wrap: wrap; }
  .resumen div { border: 1px solid #ccc; border-radius: 8px; padding: 8px 14px; } .resumen b { display: block; font-size: 22px; }
  table { width: 100%; border-collapse: collapse; } th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #ddd; vertical-align: top; }
  th { background: #f2efe8; } tr.vacio td { color: #999; }
  .barra { height: 6px; background: #eee; border-radius: 3px; margin-top: 3px; } .barra i { display: block; height: 100%; background: #6a8f3a; border-radius: 3px; }
  .nota { color: #666; font-size: 13px; margin-top: 24px; }
  @media print { body { margin: 0; } }
</style></head><body>
<h1>Informe de progreso · La Torre de Morvath</h1>
<div class="meta">Informática y Digitalización · Alumno/a: <b>${esc(alumno)}</b> · ${esc(fecha)}</div>
<div class="resumen"><div><b>${superados} / ${pisos.length}</b>pisos superados</div><div><b>${totA}</b>aciertos</div><div><b>${totF}</b>fallos</div><div><b>${totA + totF ? Math.round((totA / (totA + totF)) * 100) : 0}%</b>precisión global</div></div>
<h2>Pisos</h2>
<table><tr><th>Piso</th><th>Estado</th><th>Mejor precisión</th><th>Tiempo</th></tr>${filasPisos}</table>
<h2>Criterios de evaluación</h2>
<table><tr><th>Criterio</th><th>Qué se demuestra</th><th>Aciertos</th><th>Fallos</th><th>%</th><th>Nivel orientativo</th></tr>${filasCriterios}</table>
<p class="nota">Datos guardados en el navegador donde se jugó. Cuentan las preguntas de la varita, los sellos y los repasos. El nivel es orientativo: con menos de 3 respuestas en un criterio no se valora. Los pisos I a VIII trabajan los criterios 1.1 a 3.1 y 3.3; el resto (3.2 y del 4.1 al 4.5) queda para pisos que aún no existen.</p>
</body></html>`;
}

// descarga el informe como archivo .html (solo en el navegador)
export function descargarInforme(datos) {
  const blob = new Blob([informeHTML(datos)], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `informe-torre-morvath-${datos.alumno.replace(/[^\p{L}\p{N}]+/gu, '-').toLowerCase() || 'alumno'}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
