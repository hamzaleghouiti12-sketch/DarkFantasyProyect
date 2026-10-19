// Ventanas del Piso XIII: entrenar al oráculo (gráfico con la frontera de decisión) y la
// consola SQL de las celdas (tablas, retos y resultados).
import { rich } from '../ui.js';
import { entrenar, predecir, evaluar } from './oraculo.js';
import { ejecutarSQL } from './minisql.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function ventana(ui, clase, html) {
  const root = document.createElement('div');
  root.className = `modal ${clase}`;
  root.innerHTML = `<div class="modal-card observatorio-caja">${html}</div>`;
  document.body.appendChild(root);
  ui.open.editor = true;
  return root;
}
const COLOR = { peligrosa: '#e0604a', amiga: '#5ac87a' };

// ---------- El oráculo ----------
export function abrirOraculo(ui, O, { alResultado = () => {} } = {}) {
  return new Promise((resolve) => {
    const elegidos = new Set();
    const root = ventana(ui, 'oraculo', `<div class="quiz-kicker">${esc(O.titulo)}</div>
      <p class="automata-enunciado">${rich(O.enunciado)}</p>
      <div class="automata-cuerpo">
        <canvas width="300" height="300" class="o-graf"></canvas>
        <div class="automata-lado">
          <div class="o-ley"><span><i style="background:${COLOR.peligrosa}"></i>peligrosa</span><span><i style="background:${COLOR.amiga}"></i>amiga</span><span>● entrenamiento · ■ prueba · ○ reserva (pulsad para añadir)</span></div>
          <p class="o-ejes">Horizontal: <b>${esc(O.ejes[0])}</b> · Vertical: <b>${esc(O.ejes[1])}</b></p>
          <div class="automata-estado o-estado">El fondo coloreado es lo que el oráculo cree. Pulsad «Probar» para ver cuántas criaturas de prueba acierta.</div>
        </div>
      </div>
      <div class="form-botones"><button class="btn-enlace o-cerrar">Cerrar (Esc)</button><button class="btn o-probar">Probar al oráculo</button></div>`);
    const cv = root.querySelector('canvas'), g = cv.getContext('2d'), estado = root.querySelector('.o-estado');
    const E = (v) => 15 + (v / 10) * 270; // de 0..10 a píxeles
    const datos = () => [...O.entrenamiento, ...O.reserva.filter((_, i) => elegidos.has(i))];
    let fallos = [];
    function dibujar() {
      const modelo = entrenar(datos());
      for (let px = 0; px < 300; px += 10) for (let py = 0; py < 300; py += 10) {
        const c = predecir(modelo, { x: ((px + 5 - 15) / 270) * 10, y: ((300 - py - 5 - 15) / 270) * 10 });
        g.fillStyle = c === 'peligrosa' ? '#3a1e1e' : '#1a3324';
        g.fillRect(px, py, 10, 10);
      }
      const punto = (p, forma, lleno) => {
        const x = E(p.x), y = 300 - E(p.y);
        g.strokeStyle = COLOR[p.clase]; g.fillStyle = COLOR[p.clase]; g.lineWidth = 2;
        g.beginPath();
        if (forma === 'cuadrado') g.rect(x - 6, y - 6, 12, 12); else g.arc(x, y, 6, 0, Math.PI * 2);
        lleno ? g.fill() : g.stroke();
      };
      O.entrenamiento.forEach((p) => punto(p, 'circulo', true));
      O.reserva.forEach((p, i) => punto(p, 'circulo', elegidos.has(i)));
      O.prueba.forEach((p) => punto(p, 'cuadrado', true));
      for (const f of fallos) { g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(E(f.x) - 10, 300 - E(f.y) - 10, 20, 20); }
    }
    cv.onclick = (ev) => {
      const r = cv.getBoundingClientRect(), mx = ((ev.clientX - r.left) / r.width) * 300, my = ((ev.clientY - r.top) / r.height) * 300;
      O.reserva.forEach((p, i) => { if (Math.hypot(E(p.x) - mx, 300 - E(p.y) - my) < 12) { elegidos.has(i) ? elegidos.delete(i) : elegidos.add(i); } });
      fallos = [];
      dibujar();
    };
    const cerrar = (v) => { root.remove(); ui.open.editor = false; ui.keyTarget = null; resolve(v); };
    ui.keyTarget = (e) => { if (e.code === 'Escape') cerrar(false); };
    root.querySelector('.o-cerrar').onclick = () => cerrar(false);
    root.querySelector('.o-probar').onclick = () => {
      const r = evaluar(entrenar(datos()), O.prueba);
      fallos = r.fallos;
      dibujar();
      const bien = Math.round(r.precision * O.prueba.length);
      alResultado(r.precision >= O.minimo);
      if (r.precision >= O.minimo) {
        estado.innerHTML = `<span class="a-bien">Acierta ${bien} de ${O.prueba.length}.</span> ${rich(O.arreglado)}`;
        root.querySelector('.o-probar').disabled = true;
        setTimeout(() => cerrar(true), 3500);
      } else {
        estado.innerHTML = `<span class="a-mal">Acierta ${bien} de ${O.prueba.length}</span> (los fallos están marcados). ${rich(O.sesgo)} Añadid ejemplos de la reserva que le enseñen lo que no ha visto.`;
      }
    };
    dibujar();
  });
}

// ---------- La consola de las celdas ----------
// comprobar(reto, resultado, tablas, consulta) → { ok, mensaje? }
export function abrirConsola(ui, { tablas, retos, progreso, comprobar, alResultado = () => {} }) {
  return new Promise((resolve) => {
    const root = ventana(ui, 'consola-sql', `<div class="quiz-kicker">La consola de las celdas</div>
      <div class="sql-tablas"></div>
      <p class="sql-reto"></p>
      <textarea class="sql-entrada" rows="3" spellcheck="false" placeholder="SELECT …"></textarea>
      <div class="sql-resultado"></div>
      <div class="form-botones"><button class="btn-enlace s-cerrar">Cerrar (Esc)</button><button class="btn-enlace s-ayuda">Ver un ejemplo</button><button class="btn s-ejecutar">▶ Ejecutar</button></div>`);
    const caja = root.querySelector('.sql-tablas'), retoEl = root.querySelector('.sql-reto'), entrada = root.querySelector('.sql-entrada'), salida = root.querySelector('.sql-resultado');
    const tabla = (cols, filas) => `<table><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr>${filas.map((f) => `<tr>${cols.map((c) => `<td>${esc(f[c])}</td>`).join('')}</tr>`).join('')}</table>`;
    const pintarTablas = () => { caja.innerHTML = Object.entries(tablas).map(([n, t]) => `<div><b>${esc(n)}</b>${tabla(t.columnas, t.filas)}</div>`).join(''); };
    const pintarReto = () => { retoEl.innerHTML = rich(retos[progreso.reto].texto); };
    const cerrar = (v) => { root.remove(); ui.open.editor = false; ui.keyTarget = null; resolve(v); };
    ui.keyTarget = (e) => { if (e.code === 'Escape') cerrar(false); };
    entrada.onkeydown = (e) => { if (e.key === 'Escape') cerrar(false); if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) root.querySelector('.s-ejecutar').click(); };
    root.querySelector('.s-cerrar').onclick = () => cerrar(false);
    root.querySelector('.s-ayuda').onclick = () => { salida.innerHTML = `<p class="sql-pista">Un ejemplo que funcionaría: <code>${esc(retos[progreso.reto].ayuda)}</code></p>`; };
    root.querySelector('.s-ejecutar').onclick = () => {
      const consulta = entrada.value.trim();
      if (!consulta) return;
      const reto = retos[progreso.reto];
      const r = ejecutarSQL(consulta, tablas);
      if (!r.ok) { salida.innerHTML = `<span class="a-mal">Error: ${esc(r.error)}</span>`; alResultado(false); return; }
      let html = r.tipo === 'select' ? `${tabla(r.columnas, r.filas)}<small>${r.filas.length} fila(s)</small>` : `<small>${r.cambiadas} fila(s) cambiada(s)</small>`;
      const v = comprobar(reto, r, tablas, consulta);
      alResultado(v.ok);
      pintarTablas();
      if (!v.ok) { salida.innerHTML = `${html}<p class="a-mal">${rich(v.mensaje)}</p>`; return; }
      progreso.reto++;
      salida.innerHTML = `${html}<p class="a-bien">✓ ${rich(v.mensaje ?? '¡Reto superado!')}</p>`;
      if (progreso.reto >= retos.length) { root.querySelector('.s-ejecutar').disabled = true; setTimeout(() => cerrar(true), 2600); return; }
      entrada.value = '';
      pintarReto();
    };
    pintarTablas();
    pintarReto();
    setTimeout(() => entrada.focus(), 50);
  });
}
