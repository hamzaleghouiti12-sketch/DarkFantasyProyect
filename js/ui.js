// Capa de interfaz (HTML sobre el canvas): diálogos con efecto de escritura,
// preguntas tipo test, grimorio, avisos y pantallas de historia.
import { corregir } from './mecanicas/logica.js';

const $ = (id) => document.getElementById(id);

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// "**texto**" → negrita. Se trocea para poder escribir letra a letra.
function segments(s) {
  return s.split(/(\*\*[^*]+\*\*)/).filter(Boolean)
    .map((p) => (p.startsWith('**') ? { t: p.slice(2, -2), b: true } : { t: p, b: false }));
}
function renderSegs(segs, n = Infinity) {
  let out = '', left = n;
  for (const s of segs) {
    if (left <= 0) break;
    const part = esc(s.t.slice(0, left));
    left -= s.t.length;
    out += s.b ? `<strong>${part}</strong>` : part;
  }
  return out;
}
export const rich = (s) => renderSegs(segments(s));

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ADVANCE = ['KeyE', 'Space', 'Enter'];

// Reacciones de Aldric al responder (para que no sea siempre «¡Correcto!»)
const VIVAS = ['¡Correcto!', '¡Eso es!', '¡Como un archimago!', '¡Morvath acaba de temblar!', '¡Impecable!', '¡Bien visto!', '¡Exacto!', '¡Lo tenéis!'];
const ANIMOS = ['No exactamente.', 'Casi… mirad esto:', 'Tranquilos, se aprende fallando.', 'Uy, esa era la trampa.', 'No pasa nada: así se aprende.'];
const azar = (l) => l[Math.floor(Math.random() * l.length)];
// estrellas de un piso: ★★★ con 85 % y al menos 3 aciertos; ★★ con 60 %; si no, ★ (0 si no hubo preguntas)
export function estrellasDe({ aciertos, fallos }) {
  const total = aciertos + fallos;
  if (!total) return 0;
  const p = aciertos / total;
  return p >= 0.85 && aciertos >= 3 ? 3 : p >= 0.6 ? 2 : 1;
}
const RAYO_MS = { opcion: 12000, escrito: 22000 }; // el bonus de rapidez (sin castigo si no llega)

export class UI {
  constructor() {
    this.open = { dialogue: false, quiz: false, grimoire: false, story: false, formulario: false, terminal: false, editor: false };
    this.keyTarget = null;
    // en silencio (al ponerse al día quien entra a mitad de partida) los diálogos
    // y avisos no se muestran y las preguntas se dan por respondidas
    this.silencio = false;
  }

  anyOpen() { return Object.values(this.open).some(Boolean); }

  // La carta de la pregunta entra con un pequeño salto y arranca el anillo del ⚡ rayo
  prepararCarta(root, ms) {
    const carta = root.querySelector('.modal-card');
    carta.classList.remove('acierto', 'fallo', 'entra');
    void carta.offsetWidth;
    carta.classList.add('entra');
    carta.querySelectorAll('.confeti').forEach((c) => c.remove());
    let rayo = carta.querySelector('.quiz-rayo');
    if (!rayo) {
      rayo = document.createElement('div');
      rayo.className = 'quiz-rayo';
      rayo.title = 'Responded antes de que se vacíe para ganar saber extra';
      rayo.innerHTML = '<span>⚡</span>';
      carta.appendChild(rayo);
    }
    rayo.classList.remove('fin', 'gana');
    rayo.style.animation = 'none';
    void rayo.offsetWidth;
    rayo.style.animation = `rayo ${ms}ms linear forwards`;
    rayo.hidden = !!this.sinRayo;
    // barra de la serie (si la pregunta forma parte de una): un segmento por prueba
    let barra = carta.querySelector('.quiz-serie');
    const b = this.barraSerie;
    if (b && b.total > 1) {
      if (!barra) {
        barra = document.createElement('div');
        barra.className = 'quiz-serie';
        carta.querySelector('.quiz-kicker').after(barra);
      }
      barra.innerHTML = Array.from({ length: b.total }, (_, i) =>
        `<i class="${i < b.hechos ? 'rota' : i === b.hechos ? 'actual' : ''}"></i>`).join('');
      barra.hidden = false;
    } else if (barra) barra.hidden = true;
    return performance.now();
  }
  // Al responder: brillo o sacudida, confeti y la cabecera con la reacción, la racha y el bonus
  reaccionar(root, ok, info = {}) {
    const carta = root.querySelector('.modal-card');
    const rayo = carta.querySelector('.quiz-rayo');
    rayo.style.animationPlayState = 'paused';
    rayo.classList.add(info.rapido ? 'gana' : 'fin');
    carta.classList.add(ok ? 'acierto' : 'fallo');
    const seg = carta.querySelector('.quiz-serie:not([hidden]) .actual');
    if (seg) seg.className = ok ? 'rota golpe' : 'aguanta';
    if (ok) {
      const colores = ['#ffd27a', '#9fe6ff', '#c8a8ff', '#8fe08f', '#ff9a8a'];
      for (let i = 0; i < 22; i++) {
        const c = document.createElement('i');
        c.className = 'confeti';
        c.style.left = `${10 + Math.random() * 80}%`;
        c.style.background = colores[i % colores.length];
        c.style.setProperty('--dx', `${(Math.random() - 0.5) * 220}px`);
        c.style.setProperty('--giro', `${Math.random() * 720}deg`);
        c.style.animationDelay = `${Math.random() * 0.15}s`;
        carta.appendChild(c);
      }
    }
    const extras = [];
    if (ok && info.rapido) extras.push('<span class="chapa rayo">⚡ ¡Rápido! +5</span>');
    if (ok && info.racha >= 2) extras.push(`<span class="chapa racha">🔥 Racha ×${info.racha}${info.bonusRacha ? ` +${info.bonusRacha}` : ''}</span>`);
    return `<strong>${ok ? azar(VIVAS) : azar(ANIMOS)}</strong>${extras.length ? ` ${extras.join(' ')}` : ''}`;
  }

  handleKey(e) {
    if (!this.keyTarget) return false;
    if (!e.repeat) this.keyTarget(e);
    return true;
  }

  // ---------- Diálogo ----------
  dialogue(lines, speaker = 'Holograma de Aldric') {
    if (this.silencio) return Promise.resolve();
    return new Promise((resolve) => {
      this.onDialogo?.();
      const box = $('dialogue'), txt = box.querySelector('.dlg-text');
      box.querySelector('.dlg-speaker').textContent = speaker;
      // los recuerdos se ven como un flashback (filtro en el lienzo)
      document.body.classList.toggle('recuerdo', /Recuerdo/i.test(speaker));
      box.classList.remove('hidden');
      this.open.dialogue = true;
      let i = 0, segs, total, shown, timer;
      const openedAt = performance.now();
      const show = () => {
        segs = segments(lines[i]);
        total = segs.reduce((n, s) => n + s.t.length, 0);
        this.onPagina?.(lines[i], speaker);
        shown = 0;
        clearInterval(timer);
        timer = setInterval(() => {
          shown = Math.min(total, shown + 2);
          txt.innerHTML = renderSegs(segs, shown);
          if (shown >= total) clearInterval(timer);
        }, 18);
        box.querySelector('.dlg-count').textContent = lines.length > 1 ? `${i + 1}/${lines.length}` : '';
      };
      const advance = () => {
        if (performance.now() - openedAt < 180) return;
        if (shown < total) {
          shown = total;
          clearInterval(timer);
          txt.innerHTML = renderSegs(segs);
          return;
        }
        i++;
        if (i < lines.length) return show();
        clearInterval(timer);
        box.classList.add('hidden');
        box.onclick = null;
        document.body.classList.remove('recuerdo');
        this.open.dialogue = false;
        this.keyTarget = null;
        resolve();
      };
      box.onclick = advance;
      this.keyTarget = (e) => { if (ADVANCE.includes(e.code)) advance(); };
      show();
    });
  }

  // ---------- Pregunta ----------
  // Tipos: 'opcion' (por defecto), 'numero', 'texto' y 'orden' (ver contenido/piso2.js y piso3.js).
  quiz(q, kicker) {
    if (this.silencio) return Promise.resolve(true);
    if (['numero', 'texto', 'orden'].includes(q.tipo)) return this.quizEscrito(q, kicker);
    return new Promise((resolve) => {
      const root = $('quiz');
      root.querySelector('.quiz-kicker').textContent = kicker;
      root.querySelector('.quiz-q').textContent = q.texto;
      const optsEl = root.querySelector('.quiz-opts');
      const fb = root.querySelector('.quiz-feedback');
      const cont = root.querySelector('.quiz-continue');
      fb.classList.add('hidden');
      cont.classList.add('hidden');
      optsEl.innerHTML = '';
      const opts = shuffle(q.opciones.map((t, idx) => ({ t, ok: idx === q.correcta })));
      const buttons = opts.map((o, j) => {
        const b = document.createElement('button');
        b.className = 'quiz-opt';
        b.innerHTML = `<span class="k">${j + 1}</span><span>${esc(o.t)}</span>`;
        b.onclick = () => choose(j);
        optsEl.appendChild(b);
        return b;
      });
      root.classList.remove('hidden');
      this.open.quiz = true;
      const openedAt = this.prepararCarta(root, RAYO_MS.opcion);
      let answered = false, result = false, info = {};

      // 🪄 comodín de Aldric: tacha opciones falsas (deja la buena y una falsa). Se gana jugando.
      root.querySelector('.quiz-comodin')?.remove();
      let comodin = null;
      if (opts.length >= 3 && this.comodines > 0) {
        comodin = document.createElement('button');
        comodin.className = 'quiz-comodin';
        comodin.innerHTML = `🪄 Comodín de Aldric <span>×${this.comodines}</span> <kbd>C</kbd>`;
        comodin.title = 'Aldric tacha las opciones falsas menos una';
        comodin.onclick = () => usarComodin();
        optsEl.after(comodin);
      }
      const usarComodin = () => {
        if (answered || !comodin || comodin.disabled || !(this.comodines > 0)) return;
        this.comodines--;
        this.onComodin?.();
        comodin.disabled = true;
        comodin.innerHTML = '🪄 Aldric ha tachado las trampas';
        const falsas = opts.map((o, k) => k).filter((k) => !opts[k].ok);
        shuffle(falsas).slice(0, falsas.length - 1).forEach((k, i) => setTimeout(() => {
          buttons[k].disabled = true;
          buttons[k].classList.add('tachada');
        }, i * 180));
      };

      const choose = (j) => {
        if (answered || performance.now() - openedAt < 250) return;
        answered = true;
        if (comodin) comodin.disabled = true;
        result = opts[j].ok;
        info = this.onRespuesta?.(result, { ms: performance.now() - openedAt, limite: RAYO_MS.opcion }) ?? {};
        buttons.forEach((b, k) => {
          b.disabled = true;
          if (opts[k].ok) b.classList.add('correct');
          else if (k === j) b.classList.add('wrong');
        });
        fb.className = `quiz-feedback ${result ? 'ok' : 'bad'}`;
        fb.innerHTML = `${this.reaccionar(root, result, info)} ${esc(q.explicacion)}`;
        cont.classList.remove('hidden');
        cont.focus();
      };
      const close = () => {
        root.classList.add('hidden');
        this.open.quiz = false;
        this.keyTarget = null;
        cont.onclick = null;
        resolve(result);
      };
      cont.onclick = close;
      this.keyTarget = (e) => {
        const n = Number(e.key);
        if (!answered && e.code === 'KeyC') usarComodin();
        else if (!answered && n >= 1 && n <= opts.length && !buttons[n - 1].disabled) choose(n - 1);
        else if (answered && ADVANCE.includes(e.code)) close();
      };
    });
  }

  // Preguntas de escribir un número o de ordenar elementos
  quizEscrito(q, kicker) {
    return new Promise((resolve) => {
      const root = $('quiz');
      root.querySelector('.quiz-kicker').textContent = kicker;
      root.querySelector('.quiz-q').textContent = q.texto;
      const optsEl = root.querySelector('.quiz-opts');
      const fb = root.querySelector('.quiz-feedback');
      const cont = root.querySelector('.quiz-continue');
      fb.classList.add('hidden');
      cont.classList.add('hidden');
      optsEl.innerHTML = '';
      const comprobar = document.createElement('button');
      comprobar.className = 'btn quiz-comprobar';
      comprobar.textContent = 'Comprobar';
      let respuesta = null, answered = false, result = false, entrada = null, pintar = () => {};

      if (q.tipo === 'numero' || q.tipo === 'texto') {
        const fila = document.createElement('div');
        fila.className = 'quiz-numero';
        fila.innerHTML = `<input ${q.tipo === 'numero' ? 'inputmode="decimal"' : ''} autocomplete="off" spellcheck="false" aria-label="Respuesta"><span class="unidad">${esc(q.unidad || '')}</span>`;
        entrada = fila.querySelector('input');
        entrada.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); responder(); } };
        entrada.oninput = () => { respuesta = entrada.value; comprobar.disabled = !entrada.value.trim(); };
        comprobar.disabled = true;
        optsEl.append(fila, comprobar);
      } else {
        // las opciones vienen en el orden correcto; se muestran barajadas
        const piezas = shuffle(q.opciones.map((t, i) => ({ t, i })));
        respuesta = [];
        const hueco = document.createElement('div');
        hueco.className = 'quiz-orden-respuesta';
        const banco = document.createElement('div');
        banco.className = 'quiz-orden-banco';
        const ayuda = document.createElement('p');
        ayuda.className = 'quiz-orden-ayuda';
        ayuda.textContent = 'Pulsad las piezas en orden (o sus números). Pulsad una pieza colocada para quitarla.';
        pintar = () => {
          hueco.innerHTML = respuesta.length ? '' : '<span class="vacio">Vuestra respuesta aparecerá aquí</span>';
          respuesta.forEach((i, pos) => {
            const b = document.createElement('button');
            b.className = 'quiz-ficha puesta';
            b.innerHTML = `<span class="k">${pos + 1}</span>${esc(q.opciones[i])}`;
            b.disabled = answered;
            b.onclick = () => { respuesta.splice(pos, 1); pintar(); };
            hueco.appendChild(b);
          });
          banco.innerHTML = '';
          piezas.forEach((p, j) => {
            const b = document.createElement('button');
            b.className = 'quiz-ficha';
            b.innerHTML = `<span class="k">${j + 1}</span>${esc(p.t)}`;
            b.disabled = answered || respuesta.includes(p.i);
            b.onclick = () => { respuesta.push(p.i); pintar(); };
            banco.appendChild(b);
          });
          comprobar.disabled = answered || respuesta.length !== q.opciones.length;
        };
        this._ordenTecla = (n) => { const p = piezas[n - 1]; if (p && !respuesta.includes(p.i)) { respuesta.push(p.i); pintar(); } };
        this._ordenBorrar = () => { respuesta.pop(); pintar(); };
        optsEl.append(ayuda, hueco, banco, comprobar);
        pintar();
      }

      const responder = () => {
        if (answered || comprobar.disabled) return;
        answered = true;
        if (comodin) comodin.disabled = true;
        result = corregir(q, respuesta);
        info = this.onRespuesta?.(result, { ms: performance.now() - abiertaEn, limite: RAYO_MS.escrito }) ?? {};
        comprobar.classList.add('hidden');
        if (entrada) { entrada.disabled = true; entrada.classList.add(result ? 'correct' : 'wrong'); entrada.blur(); }
        pintar();
        const solucion = q.tipo === 'numero'
          ? `La respuesta es **${String(q.valor).replace('.', ',')} ${q.unidad || ''}**.`
          : q.tipo === 'texto'
            ? `La respuesta es **${q.esperada ?? q.aceptadas[0]}**.`
            : `Orden correcto: ${q.opciones.join(' → ')}.`;
        fb.className = `quiz-feedback ${result ? 'ok' : 'bad'}`;
        fb.innerHTML = `${this.reaccionar(root, result, info)} ${result ? '' : rich(solucion) + ' '}${esc(q.explicacion)}`;
        cont.classList.remove('hidden');
        cont.focus();
      };
      comprobar.onclick = responder;

      // 🪄 comodín de Aldric también aquí: un rango para los números, la primera letra
      // para las palabras y la primera pieza colocada para ordenar
      root.querySelector('.quiz-comodin')?.remove();
      let comodin = null;
      const usarComodin = () => {
        if (answered || !comodin || comodin.disabled || !(this.comodines > 0)) return;
        this.comodines--;
        this.onComodin?.();
        comodin.disabled = true;
        let pista;
        if (q.tipo === 'numero') {
          const v = Number(q.valor), ancho = Math.max(Math.abs(v) * 0.4, 2), r = 0.2 + Math.random() * 0.6;
          // números redondos: decenas si es grande, enteros si es mediano, una décima si es pequeño (el rango siempre contiene la respuesta)
          const paso = Math.abs(v) >= 100 ? 10 : Math.abs(v) >= 10 ? 1 : 0.1;
          const fmt = (x) => String(Math.round(x / paso) * paso).replace(/(\.\d)\d+$/, '$1').replace('.', ',');
          const bajo = Math.max(v >= 0 ? 0 : -Infinity, Math.floor((v - ancho * r) / paso) * paso), alto = Math.ceil((v + ancho * (1 - r)) / paso) * paso;
          pista = `Aldric susurra: está entre **${fmt(bajo)}** y **${fmt(alto)}**${q.unidad ? ` ${q.unidad}` : ''}.`;
        } else if (q.tipo === 'texto') {
          const palabra = String(q.esperada ?? q.aceptadas[0]);
          pista = `Aldric susurra: empieza por **«${palabra[0].toUpperCase()}»** y tiene **${palabra.length}** caracteres.`;
        } else {
          respuesta.splice(0, respuesta.length, 0);
          pintar();
          pista = 'Aldric ha colocado la **primera pieza**. Seguid vosotros.';
        }
        comodin.innerHTML = `🪄 ${rich(pista)}`;
      };
      if (this.comodines > 0) {
        comodin = document.createElement('button');
        comodin.className = 'quiz-comodin';
        comodin.innerHTML = `🪄 Comodín de Aldric <span>×${this.comodines}</span>${q.tipo === 'orden' ? ' <kbd>C</kbd>' : ''}`;
        comodin.onclick = usarComodin;
        optsEl.after(comodin);
      }
      const close = () => {
        root.classList.add('hidden');
        this.open.quiz = false;
        this.keyTarget = null;
        cont.onclick = null;
        resolve(result);
      };
      cont.onclick = close;
      root.classList.remove('hidden');
      this.open.quiz = true;
      const abiertaEn = this.prepararCarta(root, RAYO_MS.escrito);
      let info = {};
      this.keyTarget = (e) => {
        if (answered) { if (ADVANCE.includes(e.code)) close(); return; }
        if (q.tipo === 'orden') {
          const n = Number(e.key);
          if (e.code === 'KeyC') usarComodin();
          else if (n >= 1) this._ordenTecla(n);
          else if (e.code === 'Backspace') this._ordenBorrar();
          else if (e.code === 'Enter') responder();
        }
      };
      if (entrada) setTimeout(() => entrada.focus(), 50);
    });
  }

  // ---------- Formulario (configurar un dispositivo) ----------
  // campos: [{ id, etiqueta, valor?, ayuda? }]. validar(valores) → { idCampo: 'error' }.
  // Resuelve con los valores cuando no hay errores, o con null si se cancela.
  formulario(titulo, subtitulo, campos, validar) {
    return new Promise((resolve) => {
      const root = document.createElement('div');
      root.className = 'modal formulario';
      root.innerHTML = `<form class="modal-card" autocomplete="off">
        <div class="quiz-kicker">${esc(subtitulo)}</div><h2 class="quiz-q">${esc(titulo)}</h2>
        ${campos.map((c) => `<label class="form-campo"><span>${esc(c.etiqueta)}</span><input name="${c.id}" value="${esc(c.valor ?? '')}" spellcheck="false" placeholder="${esc(c.ayuda ?? '')}"><em class="form-error"></em></label>`).join('')}
        <div class="form-botones"><button type="button" class="btn-enlace form-cancelar">Cancelar (Esc)</button><button type="submit" class="btn">Comprobar</button></div>
      </form>`;
      document.body.appendChild(root);
      this.open.formulario = true;
      const form = root.querySelector('form');
      const cerrar = (v) => {
        root.remove();
        this.open.formulario = false;
        this.keyTarget = null;
        resolve(v);
      };
      form.onsubmit = (e) => {
        e.preventDefault();
        const valores = Object.fromEntries(campos.map((c) => [c.id, form.elements[c.id].value.trim()]));
        const errores = validar(valores);
        for (const c of campos) {
          const campo = form.elements[c.id].closest('.form-campo');
          campo.classList.toggle('mal', Boolean(errores[c.id]));
          campo.querySelector('.form-error').textContent = errores[c.id] ?? '';
        }
        this.onRespuesta?.(!Object.keys(errores).length);
        if (!Object.keys(errores).length) cerrar(valores);
      };
      root.querySelector('.form-cancelar').onclick = () => cerrar(null);
      form.onkeydown = (e) => { if (e.key === 'Escape') cerrar(null); };
      this.keyTarget = (e) => { if (e.code === 'Escape') cerrar(null); };
      setTimeout(() => form.elements[campos[0].id].focus(), 50);
    });
  }

  // ---------- Terminal (consola de comandos simulada) ----------
  // ejecutar(linea) → { lineas: string[], accion? }. alAccion(accion) se llama si el comando pide algo al juego.
  terminal(titulo, bienvenida, ejecutar, alAccion) {
    return new Promise((resolve) => {
      const root = document.createElement('div');
      root.className = 'modal terminal';
      root.innerHTML = `<div class="terminal-caja"><div class="terminal-titulo">${esc(titulo)}<button class="terminal-cerrar" aria-label="Cerrar">✕</button></div>
        <pre class="terminal-salida" aria-live="polite"></pre>
        <label class="terminal-linea"><span>C:\\vigia&gt;</span><input spellcheck="false" autocomplete="off" aria-label="Comando"></label></div>`;
      document.body.appendChild(root);
      this.open.terminal = true;
      const salida = root.querySelector('.terminal-salida');
      const entrada = root.querySelector('input');
      const historial = [];
      let pos = 0, ocupada = false;
      const escribir = (lineas) => {
        salida.textContent += lineas.join('\n') + '\n';
        salida.scrollTop = salida.scrollHeight;
      };
      escribir(bienvenida);
      const cerrar = () => {
        root.remove();
        this.open.terminal = false;
        this.keyTarget = null;
        resolve();
      };
      entrada.onkeydown = async (e) => {
        if (e.key === 'Escape') return cerrar();
        if (e.key === 'ArrowUp' && historial.length) { pos = Math.max(0, pos - 1); entrada.value = historial[pos]; e.preventDefault(); return; }
        if (e.key === 'ArrowDown' && historial.length) { pos = Math.min(historial.length, pos + 1); entrada.value = historial[pos] ?? ''; e.preventDefault(); return; }
        if (e.key !== 'Enter' || ocupada) return;
        const linea = entrada.value;
        entrada.value = '';
        if (linea.trim()) { historial.push(linea); pos = historial.length; }
        escribir([`C:\\vigia>${linea}`]);
        const c = linea.trim().toLowerCase();
        if (c === 'salir' || c === 'exit') return cerrar();
        if (c === 'cls') { salida.textContent = ''; return; }
        const r = ejecutar(linea);
        // las respuestas de ping y tracert llegan poco a poco, como en una consola de verdad
        ocupada = true;
        const lento = /^(ping|tracert)\b/.test(c);
        for (const l of r.lineas) {
          escribir([l]);
          if (lento && l) await new Promise((ok) => setTimeout(ok, 180));
        }
        ocupada = false;
        if (r.accion) alAccion?.(r.accion);
        this.onTecla?.();
      };
      root.querySelector('.terminal-cerrar').onclick = cerrar;
      this.keyTarget = (e) => { if (e.code === 'Escape') cerrar(); };
      setTimeout(() => entrada.focus(), 50);
    });
  }

  // ---------- Editor web (HTML + CSS con vista previa segura) ----------
  // La vista previa es un iframe con sandbox vacío: el código del alumno nunca se
  // ejecuta ni comparte origen con el juego. comprobar(html, css) → [{ texto, ok }].
  // imagenes: { 'aldric.jpg': dataURL } para que las rutas relativas se vean en el iframe.
  editorWeb({ titulo, subtitulo, html, css, comprobar, imagenes = {}, ancho = 1280 }) {
    return new Promise((resolve) => {
      const root = document.createElement('div');
      root.className = 'modal editor-web';
      root.innerHTML = `<div class="editor-caja">
        <div class="editor-cabecera"><div><div class="quiz-kicker">${esc(subtitulo)}</div><h2>${esc(titulo)}</h2></div>
          <button class="btn-enlace editor-cerrar">Guardar y cerrar (Esc)</button></div>
        <div class="editor-cuerpo">
          <div class="editor-codigo">
            <label>HTML<textarea class="ed-html" spellcheck="false"></textarea></label>
            <label>CSS<textarea class="ed-css" spellcheck="false"></textarea></label>
          </div>
          <div class="editor-lado">
            <div class="editor-anchos">${[375, 768, 1280].map((a) => `<button data-ancho="${a}">${a === 375 ? '📱 ' : a === 768 ? '▭ ' : '🖥 '}${a} px</button>`).join('')}</div>
            <div class="editor-vista"><iframe sandbox="" title="Vista previa del cartel"></iframe></div>
            <ul class="editor-lista"></ul>
            <button class="btn editor-entregar" disabled>Entregar</button>
          </div>
        </div></div>`;
      document.body.appendChild(root);
      this.open.editor = true;
      const edHtml = root.querySelector('.ed-html'), edCss = root.querySelector('.ed-css');
      const marco = root.querySelector('iframe'), vista = root.querySelector('.editor-vista');
      const lista = root.querySelector('.editor-lista'), entregar = root.querySelector('.editor-entregar');
      edHtml.value = html;
      edCss.value = css;
      let anchoActual = ancho, reloj = 0, todoBien = false;
      const encajar = () => {
        const k = Math.min(1, vista.clientWidth / anchoActual);
        marco.style.width = `${anchoActual}px`;
        marco.style.height = `${vista.clientHeight / k}px`;
        marco.style.transform = `scale(${k})`;
        root.querySelectorAll('.editor-anchos button').forEach((b) => b.classList.toggle('activo', Number(b.dataset.ancho) === anchoActual));
      };
      const actualizar = () => {
        let doc = edHtml.value;
        for (const [nombre, url] of Object.entries(imagenes)) doc = doc.split(`"${nombre}"`).join(`"${url}"`);
        const estilo = `<style>${edCss.value.replace(/<\/style/gi, '')}</style>`;
        marco.srcdoc = /<\/head>/i.test(doc) ? doc.replace(/<\/head>/i, `${estilo}</head>`) : estilo + doc;
        const res = comprobar(edHtml.value, edCss.value);
        todoBien = res.every((r) => r.ok);
        lista.innerHTML = res.map((r) => `<li class="${r.ok ? 'ok' : ''}"><span>${r.ok ? '✓' : '✗'}</span>${esc(r.texto)}</li>`).join('');
        entregar.disabled = !todoBien;
      };
      const programar = () => { clearTimeout(reloj); reloj = setTimeout(actualizar, 350); };
      for (const ed of [edHtml, edCss]) {
        ed.oninput = programar;
        ed.onkeydown = (e) => {
          if (e.key === 'Escape') { e.preventDefault(); cerrar(false); }
          if (e.key === 'Tab') { // el tabulador escribe dos espacios en vez de saltar de campo
            e.preventDefault();
            ed.setRangeText('  ', ed.selectionStart, ed.selectionEnd, 'end');
            programar();
          }
        };
      }
      root.querySelectorAll('.editor-anchos button').forEach((b) => { b.onclick = () => { anchoActual = Number(b.dataset.ancho); encajar(); }; });
      const cerrar = (entregado) => {
        clearTimeout(reloj);
        removeEventListener('resize', encajar);
        root.remove();
        this.open.editor = false;
        this.keyTarget = null;
        resolve({ html: edHtml.value, css: edCss.value, entregado });
      };
      entregar.onclick = () => { actualizar(); if (todoBien) cerrar(true); };
      root.querySelector('.editor-cerrar').onclick = () => cerrar(false);
      this.keyTarget = (e) => { if (e.code === 'Escape') cerrar(false); };
      addEventListener('resize', encajar);
      actualizar();
      requestAnimationFrame(encajar);
      setTimeout(() => edHtml.focus(), 60);
    });
  }

  // ---------- Grimorio ----------
  openGrimoire(entries) {
    const root = $('grimoire');
    const list = root.querySelector('.grim-list');
    list.innerHTML = entries.length
      ? entries.map((e) => `<article class="grim-entry"><h3>${esc(e.titulo)}</h3><p>${esc(e.resumen)}</p></article>`).join('')
      : '<p class="grim-empty">Aún está en blanco. Acercaos a un desafío y Aldric os enseñará.</p>';
    root.classList.remove('hidden');
    this.open.grimoire = true;
    const close = () => {
      root.classList.add('hidden');
      this.open.grimoire = false;
      this.keyTarget = null;
    };
    root.querySelector('.grim-close').onclick = close;
    this.keyTarget = (e) => { if (['KeyG', 'Escape', 'Enter'].includes(e.code)) close(); };
  }

  // ---------- Historia ----------
  story(pages, choices) {
    return new Promise((resolve) => {
      const root = $('screen-story');
      const txt = root.querySelector('.story-text');
      const actions = root.querySelector('.story-actions');
      root.classList.remove('hidden');
      this.open.story = true;
      let i = 0;
      const finish = (id) => {
        this.open.story = false;
        this.keyTarget = null;
        resolve(id);
      };
      const show = () => {
        txt.classList.remove('fade-in');
        void txt.offsetWidth;
        txt.classList.add('fade-in');
        txt.innerHTML = rich(pages[i]);
        actions.innerHTML = '';
        if (i < pages.length - 1) {
          const b = document.createElement('button');
          b.className = 'btn';
          b.textContent = 'Continuar';
          b.onclick = () => { i++; show(); };
          actions.appendChild(b);
          this.keyTarget = (e) => { if (ADVANCE.includes(e.code)) b.click(); };
        } else {
          choices.forEach((c) => {
            const b = document.createElement('button');
            b.className = 'btn choice';
            b.textContent = c.texto;
            b.onclick = () => finish(c.id);
            actions.appendChild(b);
          });
          this.keyTarget = () => {};
        }
      };
      show();
    });
  }

  hideScreen(id) { $(id).classList.add('hidden'); }

  // fundido a negro para los cambios de zona
  fundido(negro) {
    $('fundido').classList.toggle('activo', negro);
    return new Promise((r) => setTimeout(r, 650));
  }

  setZona(nombre) { document.querySelector('.floor-name').textContent = nombre; }
  showScreen(id) { $(id).classList.remove('hidden'); }

  // ---------- HUD ----------
  // Misión: arriba lo que toca AHORA y cómo hacerlo; debajo, todas las del piso
  setObjectives(items, como = '') {
    const ahora = items.find((o) => !o.done);
    $('mision-ahora').innerHTML = ahora
      ? `<div class="mision-kicker">Ahora</div><div class="mision-titulo">${esc(ahora.text)}</div>${como ? `<div class="mision-como">${rich(como)}</div>` : ''}<div class="mision-guia">Sigue el rombo <b>◆</b> de la pantalla · <b>H</b> pista</div>`
      : '';
    // con una sola misión, la lista solo la repetiría
    $('objectives').innerHTML = items.length < 2 && ahora ? '' : items
      .map((o) => `<li class="${o.done ? 'done' : ''}${o === ahora ? ' actual' : ''}"><span class="mark">${o.done ? '◆' : o === ahora ? '▸' : '◇'}</span>${esc(o.text)}</li>`)
      .join('');
  }

  // Aviso grande al romper un sello: cuántos van y qué toca ahora
  anunciarSello(n, total, siguiente) {
    if (this.silencio) return;
    document.querySelector('.anuncio-sello')?.remove();
    const el = document.createElement('div');
    el.className = 'anuncio-sello';
    el.setAttribute('role', 'status');
    el.innerHTML = `<div class="as-titulo">✦ Sello roto · ${n} de ${total}</div>${siguiente ? `<div class="as-siguiente">Siguiente: ${esc(siguiente)}</div>` : ''}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }

  // Balance del piso al subir: estrellas por precisión, mejor racha, rayos y tiempo
  balancePiso(nombre, b) {
    if (this.silencio) return;
    const total = b.aciertos + b.fallos;
    if (!total) return;
    const p = b.aciertos / total;
    const estrellas = estrellasDe(b);
    const frase = ['Superado. ¡La próxima vez, a por más estrellas!', '¡Buen trabajo! Morvath empieza a preocuparse.', '¡Perfección de archimago!'][estrellas - 1];
    const min = Math.max(1, Math.round(b.segundos / 60));
    document.querySelector('.balance-piso')?.remove();
    const el = document.createElement('div');
    el.className = 'balance-piso';
    el.setAttribute('role', 'status');
    el.innerHTML = `
      <div class="bp-titulo">${esc(nombre)} · superado</div>
      <div class="bp-estrellas">${[0, 1, 2].map((i) => `<span class="${i < estrellas ? 'llena' : ''}" style="animation-delay:${0.25 + i * 0.28}s">★</span>`).join('')}</div>
      <div class="bp-frase">${frase}</div>
      <div class="bp-datos">
        <span><b>${Math.round(p * 100)}%</b> aciertos</span>
        <span><b>🔥 ${b.mejorRacha}</b> mejor racha</span>
        <span><b>⚡ ${b.rapidos}</b> rápidas</span>
        <span><b>${min}</b> min</span>
      </div>`;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('sale'), 5600);
    setTimeout(() => el.remove(), 6200);
    return estrellas;
  }

  // Concepto nuevo en el grimorio: una página que entra girando
  conceptoNuevo(titulo) {
    if (this.silencio) return;
    document.querySelector('.concepto-nuevo')?.remove();
    const el = document.createElement('div');
    el.className = 'concepto-nuevo';
    el.setAttribute('role', 'status');
    el.innerHTML = `<div class="cn-icono">📖</div><div><div class="cn-kicker">Nuevo concepto en el grimorio</div><div class="cn-titulo">${esc(titulo)}</div><div class="cn-pie">Pulsa <b>G</b> para repasarlo · la varita ya puede preguntarlo</div></div>`;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('sale'), 3800);
    setTimeout(() => el.remove(), 4400);
  }

  setSaber(n) {
    const el = $('saber');
    el.textContent = n;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }

  setWand(text, ready) {
    const el = $('wand-state');
    el.textContent = text;
    el.classList.toggle('cooling', !ready);
  }

  prompt(text) {
    const el = $('prompt');
    if (this._prompt === text) return;
    this._prompt = text;
    el.classList.toggle('hidden', !text);
    if (text) el.innerHTML = rich(text);
  }

  scrollInfo(s) {
    const el = $('scroll-info');
    if (this._scroll === s) return;
    this._scroll = s;
    el.classList.toggle('hidden', !s);
    if (s) {
      el.querySelector('.scroll-kicker').textContent = s.titulo ?? 'Pergamino a la vista';
      el.querySelector('.scroll-hint').innerHTML = s.accion ?? '<b>F</b> · usar la varita sobre este pergamino';
      el.querySelector('.scroll-from').textContent = s.titulo ? s.de : `De: ${s.de}`;
      el.querySelector('.scroll-text').textContent = s.texto;
    }
  }

  toast(text, kind = 'info', ms = 3400) {
    if (this.silencio) return;
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    el.innerHTML = rich(text);
    $('toasts').appendChild(el);
    setTimeout(() => el.classList.add('out'), ms);
    setTimeout(() => el.remove(), ms + 500);
  }

  showEnd(stats) {
    const root = $('screen-end');
    root.querySelector('.end-stats').innerHTML = stats
      .map(([k, v]) => `<div class="end-stat"><span class="v">${esc(String(v))}</span><span class="k">${esc(k)}</span></div>`)
      .join('');
    root.classList.remove('hidden');
  }
}
