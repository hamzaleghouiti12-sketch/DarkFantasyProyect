// Ventana de la muralla cortafuegos (Piso VIII): una tabla de tráfico entrante con
// «permitir» o «denegar» por fila y una lista de buenas prácticas que marcar.
import { revisarMuralla } from './logica.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Resuelve true cuando la configuración es correcta; false si se cierra antes.
export function abrirMuralla(ui, { trafico, practicas, alComprobar }) {
  return new Promise((resolve) => {
    const reglas = Object.fromEntries(trafico.map((t) => [t.id, true])); // de entrada, todo abierto
    const marcadas = new Set();
    const root = document.createElement('div');
    root.className = 'modal muralla';
    root.innerHTML = `<div class="modal-card muralla-caja">
      <div class="editor-cabecera"><div><div class="quiz-kicker">La muralla cortafuegos</div><h2 class="quiz-q">¿Qué tráfico dejáis entrar?</h2></div><button class="btn-enlace m-cerrar">Cerrar (Esc)</button></div>
      <table class="m-tabla"><thead><tr><th>Origen</th><th>Puerto</th><th>Servicio</th><th>Qué es</th><th>Regla</th></tr></thead><tbody>
        ${trafico.map((t) => `<tr data-id="${t.id}"><td>${esc(t.origen)}</td><td>${t.puerto}</td><td>${esc(t.servicio)}</td><td>${esc(t.desc)}</td>
          <td class="m-regla"><button data-v="1" class="activa">Permitir</button><button data-v="0">Denegar</button></td></tr>`).join('')}
      </tbody></table>
      <p class="m-sub">Y además, ¿cuáles de estas son <b>buenas prácticas</b>?</p>
      <ul class="m-practicas">${practicas.map((p, i) => `<li><label><input type="checkbox" data-i="${i}"> ${esc(p.texto)}</label></li>`).join('')}</ul>
      <div class="quiz-feedback hidden"></div>
      <div class="t-botones"><span></span><button class="btn m-comprobar">Levantar la muralla</button></div></div>`;
    document.body.appendChild(root);
    ui.open.editor = true;
    const cerrar = (hecho) => { root.remove(); ui.open.editor = false; ui.keyTarget = null; resolve(hecho); };
    root.querySelector('.m-cerrar').onclick = () => cerrar(false);
    ui.keyTarget = (e) => { if (e.code === 'Escape') cerrar(false); };
    root.querySelectorAll('tr[data-id]').forEach((tr) => {
      tr.querySelectorAll('button').forEach((b) => {
        b.onclick = () => {
          reglas[tr.dataset.id] = b.dataset.v === '1';
          tr.querySelectorAll('button').forEach((x) => x.classList.toggle('activa', x === b));
          tr.classList.remove('mal');
        };
      });
    });
    root.querySelectorAll('.m-practicas input').forEach((c) => { c.onchange = () => { if (c.checked) marcadas.add(Number(c.dataset.i)); else marcadas.delete(Number(c.dataset.i)); }; });
    root.querySelector('.m-comprobar').onclick = () => {
      const r = revisarMuralla(trafico, reglas, practicas, [...marcadas]);
      alComprobar(r.ok);
      root.querySelectorAll('tr[data-id]').forEach((tr) => tr.classList.toggle('mal', r.reglasMal.some((t) => t.id === tr.dataset.id)));
      const fb = root.querySelector('.quiz-feedback');
      fb.className = `quiz-feedback ${r.ok ? 'ok' : 'bad'}`;
      if (r.ok) {
        fb.innerHTML = '<strong>¡Muralla levantada!</strong> Solo entra lo que el instituto necesita, y el sistema está bien cuidado.';
        setTimeout(() => cerrar(true), 1800);
        return;
      }
      const partes = [];
      if (r.reglasMal.length) partes.push(`Revisad ${r.reglasMal.length === 1 ? 'la regla marcada' : `las ${r.reglasMal.length} reglas marcadas`}: dejad entrar solo lo necesario.`);
      if (r.practicasMal.length) partes.push(`Hay ${r.practicasMal.length} ${r.practicasMal.length === 1 ? 'práctica mal elegida' : 'prácticas mal elegidas'}: ¿ayuda de verdad a la seguridad?`);
      fb.innerHTML = `<strong>Todavía no.</strong> ${partes.join(' ')}`;
    };
  });
}
