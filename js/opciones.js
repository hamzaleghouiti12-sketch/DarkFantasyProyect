// Menú de opciones y accesibilidad (tecla O), guardado en el navegador
// (PLAN_TECNICO.md, sección 15): volumen, tamaño del texto, reducir movimiento,
// sensibilidad e inversión del ratón. La cámara también gira con J y L.

const CLAVE = 'torreMorvathOpciones';
export const PREDETERMINADAS = { musica: 0.5, efectos: 0.85, texto: 1, reducirMovimiento: false, sensibilidad: 1, invertirY: false, calidadBaja: false };

export function leerOpciones() {
  try { return { ...PREDETERMINADAS, ...JSON.parse(localStorage.getItem(CLAVE) || '{}') }; } catch { return { ...PREDETERMINADAS }; }
}
function guardar(o) {
  try { localStorage.setItem(CLAVE, JSON.stringify(o)); } catch { /* sin almacenamiento local no se recuerdan */ }
}

// Ventana de opciones. alCambiar(opciones) se llama con cada cambio para aplicarlo al momento.
export function abrirOpciones(ui, opciones, alCambiar) {
  return new Promise((resolve) => {
    const root = document.createElement('div');
    root.className = 'modal opciones';
    const rango = (id, etiqueta, min, max, paso, texto) => `<label class="op-fila"><span>${etiqueta}</span><input type="range" data-k="${id}" min="${min}" max="${max}" step="${paso}" value="${opciones[id]}"><output>${texto(opciones[id])}</output></label>`;
    const casilla = (id, etiqueta, ayuda) => `<label class="op-fila op-casilla"><input type="checkbox" data-k="${id}" ${opciones[id] ? 'checked' : ''}><span>${etiqueta}<small>${ayuda}</small></span></label>`;
    const pct = (v) => `${Math.round(v * 100)}%`;
    root.innerHTML = `<div class="modal-card opciones-caja">
      <div class="quiz-kicker">Opciones</div><h2 class="quiz-q">Opciones y accesibilidad</h2>
      ${rango('musica', 'Volumen de la música', 0, 1, 0.05, pct)}
      ${rango('efectos', 'Volumen de los efectos', 0, 1, 0.05, pct)}
      ${rango('texto', 'Tamaño del texto', 1, 1.5, 0.25, pct)}
      ${rango('sensibilidad', 'Sensibilidad del ratón', 0.4, 2, 0.1, pct)}
      ${casilla('invertirY', 'Invertir el eje vertical de la cámara', '')}
      ${casilla('calidadBaja', 'Calidad baja', 'Para ordenadores lentos: menos resolución, sombras más simples y sin resplandor.')}
      ${casilla('reducirMovimiento', 'Reducir el movimiento', 'Sin sacudidas de cámara ni destellos al romper sellos.')}
      <p class="op-nota">La cámara también gira con <b>J</b> y <b>L</b>. Todo se guarda en este navegador.</p>
      <div class="form-botones"><button class="btn-enlace op-reset">Volver a lo predeterminado</button><button class="btn op-cerrar">Cerrar (O)</button></div>
    </div>`;
    document.body.appendChild(root);
    ui.open.editor = true;
    const aplicar = () => { guardar(opciones); alCambiar(opciones); };
    root.querySelectorAll('input[data-k]').forEach((el) => {
      el.oninput = el.onchange = () => {
        const k = el.dataset.k;
        opciones[k] = el.type === 'checkbox' ? el.checked : Number(el.value);
        const salida = el.parentElement.querySelector('output');
        if (salida) salida.textContent = `${Math.round(opciones[k] * 100)}%`;
        aplicar();
      };
    });
    const cerrar = () => { root.remove(); ui.open.editor = false; ui.keyTarget = null; resolve(); };
    root.querySelector('.op-reset').onclick = () => {
      Object.assign(opciones, PREDETERMINADAS);
      aplicar();
      cerrar();
    };
    root.querySelector('.op-cerrar').onclick = cerrar;
    ui.keyTarget = (e) => { if (['KeyO', 'Escape'].includes(e.code)) cerrar(); };
  });
}
