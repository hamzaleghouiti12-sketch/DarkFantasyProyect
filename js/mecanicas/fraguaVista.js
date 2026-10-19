// Ventanas del Piso XII: código con huecos (cada hueco es un desplegable dentro del
// código), la placa de LED de 5 × 5 (con su código generado en vivo) y el libro de registro.
// Nada del código se ejecuta de verdad: lo comprueba fragua.js.
import { rich } from '../ui.js';
import { comprobarHuecos, rellenar, filasDePatron, igualPatron, contarVisitas, resumenTexto } from './fragua.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function ventana(ui, clase, html, alTecla) {
  const root = document.createElement('div');
  root.className = `modal ${clase}`;
  root.innerHTML = `<div class="modal-card fragua-caja">${html}</div>`;
  document.body.appendChild(root);
  ui.open.editor = true;
  return root;
}

// El código con un <select> en cada «⟨n⟩»
function codigoConHuecos(codigo, huecos) {
  return esc(codigo).replace(/⟨(\d+)⟩/g, (_, n) => `<select class="f-hueco" data-i="${n}"><option value="">____</option>${huecos[n].opciones.map((o, j) => `<option value="${j}">${esc(o)}</option>`).join('')}</select>`);
}
const leerElegidas = (root, n) => Array.from({ length: n }, (_, i) => { const v = root.querySelector(`.f-hueco[data-i="${i}"]`).value; return v === '' ? null : Number(v); });
function marcar(root, huecos, malos, salida) {
  root.querySelectorAll('.f-hueco').forEach((s) => s.classList.toggle('mal', malos.includes(Number(s.dataset.i))));
  salida.innerHTML = malos.length
    ? `<span class="a-mal">Error: ${malos.length === 1 ? 'un hueco está' : `${malos.length} huecos están`} mal.</span><ul>${malos.map((i) => `<li>${esc(huecos[i].porque)}</li>`).join('')}</ul>`
    : '';
}

// Resuelve true cuando todos los huecos están bien; false si se cierra.
export function abrirHuecos(ui, { titulo, enunciado, codigo, huecos, salida = '', antes = '', despues = null, alResultado = () => {} }) {
  return new Promise((resolve) => {
    const root = ventana(ui, 'fragua', `<div class="quiz-kicker">${esc(titulo)}</div>
      <p class="automata-enunciado">${rich(enunciado)}</p>${antes}
      <pre class="f-codigo">${codigoConHuecos(codigo, huecos)}</pre>
      <div class="f-consola"><b>Consola</b><div class="f-salida">Pulsad «Ejecutar» cuando tengáis los huecos.</div></div>
      <div class="form-botones"><button class="btn-enlace f-cerrar">Cerrar (Esc)</button><button class="btn f-ejecutar">▶ Ejecutar</button></div>`);
    const out = root.querySelector('.f-salida');
    const cerrar = (v) => { root.remove(); ui.open.editor = false; ui.keyTarget = null; resolve(v); };
    ui.keyTarget = (e) => { if (e.code === 'Escape') cerrar(false); };
    root.querySelector('.f-cerrar').onclick = () => cerrar(false);
    root.querySelector('.f-ejecutar').onclick = () => {
      const malos = comprobarHuecos(huecos, leerElegidas(root, huecos.length));
      alResultado(!malos.length);
      marcar(root, huecos, malos, out);
      if (malos.length) return;
      out.innerHTML = `<span class="a-bien">✓ Sin errores.</span>${salida ? `<pre>${esc(salida)}</pre>` : ''}${despues ? despues() : ''}`;
      root.querySelector('.f-ejecutar').disabled = true;
      setTimeout(() => cerrar(true), despues ? 3200 : 1800);
    };
  });
}

// La placa de luces: dibujar la runa y programar el botón A
export function abrirPlaca(ui, placa, { alResultado = () => {}, alMostrar = () => {} } = {}) {
  return new Promise((resolve) => {
    const rejilla = Array.from({ length: 5 }, () => Array(5).fill(false));
    const runaHtml = placa.runa.map((f) => [...f].map((c) => `<i class="${c === '1' ? 'on' : ''}"></i>`).join('')).join('');
    const root = ventana(ui, 'fragua placa', `<div class="quiz-kicker">${esc(placa.titulo)}</div>
      <p class="automata-enunciado">${rich(placa.enunciado)}</p>
      <div class="placa-cuerpo">
        <div><b>Vuestra placa</b><div class="placa-leds">${Array.from({ length: 25 }, (_, i) => `<button class="led" data-i="${i}" aria-label="LED ${i + 1}"></button>`).join('')}</div></div>
        <div><b>La runa de la puerta</b><div class="placa-leds mini">${runaHtml}</div></div>
      </div>
      <pre class="f-codigo"></pre>
      <div class="f-consola"><b>Consola</b><div class="f-salida">Encended los LED y completad el código. Después, pulsad A.</div></div>
      <div class="form-botones"><button class="btn-enlace f-cerrar">Cerrar (Esc)</button><button class="btn f-pulsar">Pulsar el botón A</button></div>`);
    const pre = root.querySelector('.f-codigo'), out = root.querySelector('.f-salida');
    const elegidas = Array(placa.huecos.length).fill(null);
    function pintarCodigo() {
      const filas = filasDePatron(rejilla).map((f) => `  "${f}",`).join('\n');
      pre.innerHTML = codigoConHuecos(placa.codigo.replace('⟨RUNA⟩', filas), placa.huecos);
      pre.querySelectorAll('.f-hueco').forEach((s) => {
        const i = Number(s.dataset.i);
        if (elegidas[i] !== null) s.value = String(elegidas[i]);
        s.onchange = () => { elegidas[i] = s.value === '' ? null : Number(s.value); };
      });
    }
    root.querySelectorAll('.led').forEach((b) => {
      b.onclick = () => {
        const i = Number(b.dataset.i), f = Math.floor(i / 5), c = i % 5;
        rejilla[f][c] = !rejilla[f][c];
        b.classList.toggle('on', rejilla[f][c]);
        pintarCodigo();
      };
    });
    const cerrar = (v) => { root.remove(); ui.open.editor = false; ui.keyTarget = null; resolve(v); };
    ui.keyTarget = (e) => { if (e.code === 'Escape') cerrar(false); };
    root.querySelector('.f-cerrar').onclick = () => cerrar(false);
    root.querySelector('.f-pulsar').onclick = () => {
      const malos = comprobarHuecos(placa.huecos, elegidas);
      const filas = filasDePatron(rejilla);
      const dibujoBien = igualPatron(filas, placa.runa);
      alResultado(!malos.length && dibujoBien);
      alMostrar(filas, !malos.length);
      marcar(root, placa.huecos, malos, out);
      if (malos.length) return;
      if (!dibujoBien) { out.innerHTML = '<span class="a-mal">La placa se enciende… pero no es la runa de la puerta. Comparad fila a fila.</span>'; return; }
      out.innerHTML = '<span class="a-bien">✓ La placa muestra la runa. ¡La puerta la reconoce!</span>';
      root.querySelector('.f-pulsar').disabled = true;
      setTimeout(() => cerrar(true), 1800);
    };
    pintarCodigo();
  });
}

// El libro de registro: el CSV al lado del código; al acertar, se escribe resumen.txt
export function abrirRegistro(ui, reg, opciones = {}) {
  return abrirHuecos(ui, {
    ...reg, ...opciones,
    antes: `<details class="f-csv" open><summary>pergamino_visitas.csv</summary><pre>${esc(reg.csv)}</pre></details>`,
    despues: () => `<p>Se ha escrito <b>resumen.txt</b>:</p><pre>${esc(resumenTexto(contarVisitas(reg.csv)))}</pre>`,
  });
}
