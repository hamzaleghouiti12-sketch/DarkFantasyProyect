// Capa de interfaz (HTML sobre el canvas): diálogos con efecto de escritura,
// preguntas tipo test, grimorio, avisos y pantallas de historia.
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

export class UI {
  constructor() {
    this.open = { dialogue: false, quiz: false, grimoire: false, story: false };
    this.keyTarget = null;
  }

  anyOpen() { return Object.values(this.open).some(Boolean); }

  handleKey(e) {
    if (!this.keyTarget) return false;
    if (!e.repeat) this.keyTarget(e);
    return true;
  }

  // ---------- Diálogo ----------
  dialogue(lines, speaker = 'Holograma de Aldric') {
    return new Promise((resolve) => {
      this.onDialogo?.();
      const box = $('dialogue'), txt = box.querySelector('.dlg-text');
      box.querySelector('.dlg-speaker').textContent = speaker;
      box.classList.remove('hidden');
      this.open.dialogue = true;
      let i = 0, segs, total, shown, timer;
      const openedAt = performance.now();
      const show = () => {
        segs = segments(lines[i]);
        total = segs.reduce((n, s) => n + s.t.length, 0);
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
  quiz(q, kicker) {
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
      const openedAt = performance.now();
      let answered = false, result = false;

      const choose = (j) => {
        if (answered || performance.now() - openedAt < 250) return;
        answered = true;
        result = opts[j].ok;
        this.onRespuesta?.(result);
        buttons.forEach((b, k) => {
          b.disabled = true;
          if (opts[k].ok) b.classList.add('correct');
          else if (k === j) b.classList.add('wrong');
        });
        fb.className = `quiz-feedback ${result ? 'ok' : 'bad'}`;
        fb.innerHTML = `<strong>${result ? '¡Correcto!' : 'No exactamente.'}</strong> ${esc(q.explicacion)}`;
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
        if (!answered && n >= 1 && n <= opts.length) choose(n - 1);
        else if (answered && ADVANCE.includes(e.code)) close();
      };
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
  setObjectives(items) {
    $('objectives').innerHTML = items
      .map((o) => `<li class="${o.done ? 'done' : ''}"><span class="mark">${o.done ? '◆' : '◇'}</span>${esc(o.text)}</li>`)
      .join('');
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
      el.querySelector('.scroll-from').textContent = `De: ${s.de}`;
      el.querySelector('.scroll-text').textContent = s.texto;
    }
  }

  toast(text, kind = 'info', ms = 3400) {
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
