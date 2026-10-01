// Ventanas del Piso VII: el tablón de pregones (verificar noticias con herramientas)
// y el buscador del bibliotecario (búsqueda avanzada sobre un índice local).
import { rich } from '../ui.js';
import { leerConsulta, buscar } from './buscador.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const HERRAMIENTAS = [['lupa', '🔍 Lupa (búsqueda inversa)'], ['fecha', '📅 Fecha'], ['autor', '✒️ Autoría'], ['verificador', '✔️ Verificador']];

function ventana(ui, clase, html) {
  const root = document.createElement('div');
  root.className = `modal ${clase}`;
  root.innerHTML = html;
  document.body.appendChild(root);
  ui.open.editor = true;
  return root;
}

// Resuelve true cuando se han verificado todos los pregones; false si se cierra antes.
export function abrirTablon(ui, { pregones, etiquetas, acciones, progreso, alResponder }) {
  return new Promise((resolve) => {
    const root = ventana(ui, 'tablon', '<div class="modal-card tablon-caja"></div>');
    const caja = root.querySelector('.tablon-caja');
    const cerrar = (hecho) => { root.remove(); ui.open.editor = false; ui.keyTarget = null; resolve(hecho); };
    ui.keyTarget = (e) => { if (e.code === 'Escape') cerrar(false); };

    function mostrar() {
      if (progreso.paso >= pregones.length) return cerrar(true);
      const p = pregones[progreso.paso];
      const usadas = new Set();
      let etiqueta = null, accion = null;
      caja.innerHTML = `
        <div class="editor-cabecera"><div class="quiz-kicker">El tablón de pregones · ${progreso.paso + 1} de ${pregones.length}</div><button class="btn-enlace t-cerrar">Cerrar (Esc)</button></div>
        <article class="pregon"><h2>${esc(p.titular)}</h2><p>${esc(p.texto)}</p></article>
        <div class="t-herramientas">${HERRAMIENTAS.map(([k, t]) => `<button data-h="${k}">${t}</button>`).join('')}</div>
        <ul class="t-pistas"></ul>
        <div class="t-fila"><span>¿Qué es?</span>${etiquetas.map((e) => `<button class="chip" data-e="${esc(e)}">${esc(e)}</button>`).join('')}</div>
        <div class="t-fila"><span>¿Qué haces?</span>${acciones.map((a) => `<button class="chip" data-a="${esc(a)}">${esc(a)}</button>`).join('')}</div>
        <div class="quiz-feedback hidden"></div>
        <div class="t-botones"><small class="t-aviso">Usad al menos una herramienta antes de decidir.</small><button class="btn t-decidir" disabled>Decidir</button></div>`;
      const decidir = caja.querySelector('.t-decidir');
      const revisar = () => { decidir.disabled = !(usadas.size && etiqueta && accion); caja.querySelector('.t-aviso').classList.toggle('hidden', usadas.size > 0); };
      caja.querySelector('.t-cerrar').onclick = () => cerrar(false);
      caja.querySelectorAll('[data-h]').forEach((b) => {
        b.onclick = () => {
          if (usadas.has(b.dataset.h)) return;
          usadas.add(b.dataset.h);
          b.classList.add('usada');
          caja.querySelector('.t-pistas').insertAdjacentHTML('beforeend', `<li><b>${esc(b.textContent)}:</b> ${esc(p.herramientas[b.dataset.h])}</li>`);
          revisar();
        };
      });
      const elegir = (sel, attr, fijar) => caja.querySelectorAll(sel).forEach((b) => {
        b.onclick = () => { caja.querySelectorAll(sel).forEach((x) => x.classList.toggle('elegida', x === b)); fijar(b.dataset[attr]); revisar(); };
      });
      elegir('[data-e]', 'e', (v) => { etiqueta = v; });
      elegir('[data-a]', 'a', (v) => { accion = v; });
      decidir.onclick = () => {
        const ok = etiqueta === p.etiqueta && accion === p.accion;
        alResponder(ok);
        const fb = caja.querySelector('.quiz-feedback');
        fb.className = `quiz-feedback ${ok ? 'ok' : 'bad'}`;
        fb.innerHTML = ok
          ? `<strong>¡Bien verificado!</strong> ${esc(p.explicacion)}`
          : `<strong>No exactamente.</strong> ${etiqueta !== p.etiqueta ? 'Revisad qué tipo de pregón es. ' : ''}${accion !== p.accion ? 'Pensad mejor qué haríais con él. ' : ''}Usad más herramientas si hace falta.`;
        decidir.textContent = ok ? 'Siguiente pregón' : 'Volver a intentarlo';
        decidir.onclick = () => { if (ok) progreso.paso++; mostrar(); };
      };
    }
    mostrar();
  });
}

// Resuelve true cuando se han superado todos los retos de búsqueda.
export function abrirBuscador(ui, { indice, retos, progreso, alResponder }) {
  return new Promise((resolve) => {
    const root = ventana(ui, 'buscador', `<div class="modal-card buscador-caja">
      <div class="editor-cabecera"><div class="quiz-kicker">El buscador del bibliotecario</div><button class="btn-enlace b-cerrar">Cerrar (Esc)</button></div>
      <div class="b-reto"></div>
      <form class="b-form" autocomplete="off"><input class="b-q" spellcheck="false" placeholder='Escribid la búsqueda (probad "comillas", -palabra, site: y filetype:)'><button class="btn">Buscar</button></form>
      <div class="b-ayuda"></div>
      <ol class="b-resultados"></ol></div>`);
    const $ = (s) => root.querySelector(s);
    const cerrar = (hecho) => { root.remove(); ui.open.editor = false; ui.keyTarget = null; resolve(hecho); };
    $('.b-cerrar').onclick = () => cerrar(false);
    $('.b-q').onkeydown = (e) => { if (e.key === 'Escape') cerrar(false); };
    ui.keyTarget = (e) => { if (e.code === 'Escape') cerrar(false); };
    let intentos = 0;
    const pintarReto = () => {
      const r = retos[progreso.reto];
      $('.b-reto').innerHTML = `<b>Reto ${progreso.reto + 1} de ${retos.length}:</b> ${rich(r.texto)} <button class="btn-enlace b-pista">¿Una pista?</button>`;
      $('.b-pista').onclick = () => { $('.b-ayuda').innerHTML = `💡 ${esc(r.pista)}`; };
    };
    pintarReto();
    $('.b-form').onsubmit = (e) => {
      e.preventDefault();
      const q = $('.b-q').value;
      const c = leerConsulta(q);
      const res = buscar(indice, c);
      const r = retos[progreso.reto];
      const ops = [c.frases.length && 'frase exacta', c.excluidas.length && 'exclusión', c.site && `site:${c.site}`, c.filetype && `filetype:${c.filetype}`].filter(Boolean);
      $('.b-ayuda').textContent = `${res.length} resultado${res.length === 1 ? '' : 's'}${ops.length ? ` · operadores: ${ops.join(', ')}` : ''}`;
      $('.b-resultados').innerHTML = res.slice(0, 6).map((d, i) => `<li class="${i === 0 && d.id === r.objetivo ? "objetivo" : ""}"><a>${esc(d.titulo)}</a><cite>${esc(d.url)}</cite><p>${esc(d.texto)}</p></li>`).join('') || '<li class="vacio">Ningún resultado. Probad a quitar algún operador.</li>';
      intentos++;
      if (res[0]?.id !== r.objetivo) {
        if (intentos === 3) $('.b-ayuda').innerHTML += ` · 💡 ${esc(r.pista)}`;
        return;
      }
      alResponder(true);
      intentos = 0;
      progreso.reto++;
      $('.b-ayuda').innerHTML = '<strong class="bien">¡Primer resultado! Justo el libro que buscabais.</strong>';
      if (progreso.reto >= retos.length) { setTimeout(() => cerrar(true), 1400); return; }
      setTimeout(() => { $('.b-q').value = ''; $('.b-resultados').innerHTML = ''; $('.b-ayuda').textContent = ''; pintarReto(); }, 1600);
    };
    setTimeout(() => $('.b-q').focus(), 60);
  });
}
