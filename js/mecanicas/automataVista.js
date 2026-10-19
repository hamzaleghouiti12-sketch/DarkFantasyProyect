// Editor de bloques del Piso XI: tablero 2D con el autómata, paleta de bloques, el
// programa (con bloques anidados) y el mismo programa en JavaScript y pseudocódigo.
//   nivel: { titulo, enunciado, ancho, alto, inicio, meta, muros, trampas, bloques, maxBloques? }
//   programa (opcional): programa inicial (para depurar)
// Resuelve con el programa (una copia) si el autómata llega a la meta; false si se cierra antes.
import { ejecutar, contar, aJS, aPseudo, DX, DY } from './automata.js';
import { rich } from '../ui.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const NOMBRE = { avanzar: '⬆ Avanzar', izquierda: '↺ Girar izquierda', derecha: '↻ Girar derecha', repetir: '🔁 Repetir', mientras: '⟳ Mientras no llegue', si: '❓ Si hay muro delante' };
const ERRORES = {
  muro: 'El autómata ha chocado con un muro (o con el borde).',
  trampa: '¡El autómata ha pisado una trampa!',
  limite: 'El programa no termina nunca: ¿un bucle infinito?',
  corto: 'El programa se ha acabado antes de llegar a la casilla dorada.',
};
const copiar = (p) => JSON.parse(JSON.stringify(p));

export function abrirAutomata(ui, nivel, { programa = [], alResultado = () => {}, cabecera = '' } = {}) {
  return new Promise((resolve) => {
    const prog = copiar(programa);
    let dentro = [prog]; // pila de listas: dónde se añade el siguiente bloque
    let animando = false, repeticiones = 3;
    const root = document.createElement('div');
    root.className = 'modal automata';
    root.innerHTML = `<div class="modal-card automata-caja">
      <div class="quiz-kicker">${esc(cabecera || nivel.titulo)}</div>
      <p class="automata-enunciado">${rich(nivel.enunciado)}</p>
      <div class="automata-cuerpo">
        <canvas class="automata-tablero" width="320" height="320"></canvas>
        <div class="automata-lado">
          <div class="automata-paleta"></div>
          <div class="automata-prog" aria-live="polite"></div>
          <div class="automata-estado"></div>
        </div>
      </div>
      <details class="automata-codigo" open><summary>El mismo programa escrito</summary>
        <div class="automata-dos"><div><b>JavaScript</b><pre class="cod-js"></pre></div><div><b>Pseudocódigo</b><pre class="cod-ps"></pre></div></div>
      </details>
      <div class="form-botones"><button class="btn-enlace a-cerrar">Cerrar (Esc)</button><button class="btn-enlace a-borrar">Borrar todo</button><button class="btn a-ejecutar">▶ Ejecutar</button></div>
    </div>`;
    document.body.appendChild(root);
    ui.open.editor = true;
    const lienzo = root.querySelector('canvas'), g = lienzo.getContext('2d');
    const paleta = root.querySelector('.automata-paleta'), vistaProg = root.querySelector('.automata-prog'), estado = root.querySelector('.automata-estado');
    const L = Math.floor(320 / Math.max(nivel.ancho, nivel.alto));
    const cerrar = (hecho) => { root.remove(); ui.open.editor = false; ui.keyTarget = null; resolve(hecho ? copiar(prog) : false); };
    ui.keyTarget = (e) => { if (e.code === 'Escape' && !animando) cerrar(false); };

    // ---------- tablero ----------
    function dibujar(r) {
      g.fillStyle = '#1c1626';
      g.fillRect(0, 0, 320, 320);
      for (let y = 0; y < nivel.alto; y++) for (let x = 0; x < nivel.ancho; x++) {
        g.fillStyle = (x + y) % 2 ? '#2c2438' : '#332a42';
        g.fillRect(x * L + 1, y * L + 1, L - 2, L - 2);
      }
      g.fillStyle = '#d4af6a';
      g.fillRect(nivel.meta.x * L + 6, nivel.meta.y * L + 6, L - 12, L - 12);
      for (const [x, y] of nivel.muros) { g.fillStyle = '#5a4a44'; g.fillRect(x * L + 2, y * L + 2, L - 4, L - 4); }
      for (const [x, y] of nivel.trampas ?? []) {
        g.fillStyle = '#b8483a';
        for (let i = 0; i < 3; i++) { g.beginPath(); const bx = x * L + 10 + i * (L - 20) / 2; g.moveTo(bx - 7, y * L + L - 12); g.lineTo(bx, y * L + 12); g.lineTo(bx + 7, y * L + L - 12); g.fill(); }
      }
      // el autómata: un triángulo que señala hacia donde mira
      const cx = r.x * L + L / 2, cy = r.y * L + L / 2, a = (r.dir * Math.PI) / 2;
      g.save();
      g.translate(cx, cy);
      g.rotate(a);
      g.fillStyle = '#9fe6ff';
      g.beginPath(); g.moveTo(0, -L * 0.34); g.lineTo(L * 0.26, L * 0.26); g.lineTo(-L * 0.26, L * 0.26); g.closePath(); g.fill();
      g.restore();
    }

    // ---------- programa ----------
    function pintarProg() {
      const lista = (bloques, nivelIdx) => bloques.map((b, i) => {
        const activo = dentro.at(-1) === (b.cuerpo ?? b.entonces) || dentro.at(-1) === b.sino;
        const quitar = `<button class="a-x" data-ruta="${nivelIdx}.${i}" aria-label="Quitar">×</button>`;
        if (b.op === 'repetir' || b.op === 'mientras') {
          return `<li class="a-bloque contenedor ${activo ? 'activo' : ''}"><span class="a-entrar" data-ruta="${nivelIdx}.${i}.c" title="Añadir dentro de este bloque">${b.op === 'repetir' ? `🔁 Repetir ${b.n} veces` : NOMBRE.mientras}</span>${quitar}<ul>${lista(b.cuerpo, `${nivelIdx}.${i}.c`)}</ul></li>`;
        }
        if (b.op === 'si') {
          return `<li class="a-bloque contenedor ${activo ? 'activo' : ''}"><span class="a-entrar" data-ruta="${nivelIdx}.${i}.e" title="Añadir dentro de este bloque">${NOMBRE.si}</span>${quitar}<ul>${lista(b.entonces, `${nivelIdx}.${i}.e`)}</ul><span class="a-sino a-entrar" data-ruta="${nivelIdx}.${i}.s">si no:</span><ul>${lista(b.sino, `${nivelIdx}.${i}.s`)}</ul></li>`;
        }
        return `<li class="a-bloque">${NOMBRE[b.op]}${quitar}</li>`;
      }).join('');
      vistaProg.innerHTML = prog.length ? `<ul class="a-raiz">${lista(prog, 'r')}</ul>` : '<p class="a-vacio">Pulsad los bloques de arriba para construir el programa.</p>';
      vistaProg.querySelectorAll('.a-x').forEach((b) => { b.onclick = () => quitar(b.dataset.ruta); });
      // pulsar un bloque contenedor: lo siguiente se añade dentro de él
      vistaProg.querySelectorAll('.a-entrar').forEach((b) => { b.onclick = () => { if (!animando) { dentro = pila(b.dataset.ruta); pintarProg(); } }; });
      root.querySelector('.cod-js').textContent = aJS(prog) || '// (vacío)';
      root.querySelector('.cod-ps').textContent = aPseudo(prog) || '(vacío)';
      const n = contar(prog);
      estado.innerHTML = nivel.maxBloques ? `Bloques: <b>${n}</b> de ${nivel.maxBloques} como mucho` : `Bloques: <b>${n}</b>`;
      pintarPaleta();
    }
    // ruta "r.2.c.0" → quita ese bloque de su lista
    function quitar(ruta) {
      if (animando) return;
      const partes = ruta.split('.').slice(1);
      let lista = prog;
      for (let i = 0; i < partes.length - 1; i += 2) {
        const b = lista[Number(partes[i])];
        lista = partes[i + 1] === 'c' ? b.cuerpo : partes[i + 1] === 'e' ? b.entonces : b.sino;
      }
      const [quitado] = lista.splice(Number(partes.at(-1)), 1);
      // si se estaba añadiendo dentro del bloque quitado, se vuelve fuera
      const internas = [quitado?.cuerpo, quitado?.entonces, quitado?.sino].filter(Boolean);
      while (dentro.length > 1 && (internas.includes(dentro.at(-1)) || !contiene(prog, dentro.at(-1)))) dentro.pop();
      pintarProg();
    }
    // "r.0.c" → la pila de listas desde la raíz hasta esa (para añadir dentro)
    function pila(ruta) {
      const partes = ruta.split('.').slice(1);
      const res = [prog];
      let lista = prog;
      for (let i = 0; i < partes.length; i += 2) {
        const b = lista[Number(partes[i])];
        lista = partes[i + 1] === 'c' ? b.cuerpo : partes[i + 1] === 'e' ? b.entonces : b.sino;
        res.push(lista);
      }
      return res;
    }
    const contiene = (lista, buscada) => lista === buscada || lista.some((b) => [b.cuerpo, b.entonces, b.sino].some((l) => l && contiene(l, buscada)));

    function pintarPaleta() {
      const destino = dentro.at(-1);
      const enSi = dentro.length > 1 && dentro.at(-2).some((b) => b.entonces === destino);
      paleta.innerHTML = nivel.bloques.map((op) => `<button class="btn a-p" data-op="${op}">${op === 'repetir' ? `🔁 Repetir ${repeticiones}` : NOMBRE[op]}</button>`).join('')
        + (nivel.bloques.includes('repetir') ? `<label class="a-n">veces <input type="number" min="2" max="8" value="${repeticiones}"></label>` : '')
        + (enSi ? '<button class="btn-enlace a-sino-btn">→ Pasar a «si no»</button>' : '')
        + (dentro.length > 1 ? '<button class="btn-enlace a-salir">⤴ Salir del bloque</button>' : '');
      paleta.querySelectorAll('.a-p').forEach((b) => { b.onclick = () => añadir(b.dataset.op); });
      paleta.querySelector('.a-n input')?.addEventListener('change', (e) => { repeticiones = Math.max(2, Math.min(8, Number(e.target.value) || 2)); pintarPaleta(); });
      const sino = paleta.querySelector('.a-sino-btn');
      if (sino) sino.onclick = () => { const padre = dentro.at(-2).find((b) => b.entonces === destino); dentro[dentro.length - 1] = padre.sino; pintarProg(); };
      const salir = paleta.querySelector('.a-salir');
      if (salir) salir.onclick = () => { dentro.pop(); pintarProg(); };
    }
    function añadir(op) {
      if (animando) return;
      const lista = dentro.at(-1);
      if (op === 'repetir') { const b = { op, n: repeticiones, cuerpo: [] }; lista.push(b); dentro.push(b.cuerpo); }
      else if (op === 'mientras') { const b = { op, cuerpo: [] }; lista.push(b); dentro.push(b.cuerpo); }
      else if (op === 'si') { const b = { op, entonces: [], sino: [] }; lista.push(b); dentro.push(b.entonces); }
      else lista.push({ op });
      pintarProg();
    }

    // ---------- ejecutar ----------
    root.querySelector('.a-ejecutar').onclick = async () => {
      if (animando) return;
      if (nivel.maxBloques && contar(prog) > nivel.maxBloques) {
        estado.innerHTML = `<span class="a-mal">Usad ${nivel.maxBloques} bloques como mucho: buscad lo que se repite.</span>`;
        return;
      }
      animando = true;
      const r = ejecutar(nivel, prog);
      for (const p of r.pasos) { dibujar(p); await new Promise((ok) => setTimeout(ok, 260)); }
      animando = false;
      alResultado(r.llego);
      if (r.llego) {
        estado.innerHTML = '<span class="a-bien">¡El autómata ha llegado! ✦</span>';
        setTimeout(() => cerrar(true), 1300);
      } else {
        estado.innerHTML = `<span class="a-mal">${ERRORES[r.error] ?? 'No ha llegado.'} Corregid el programa y volved a ejecutarlo.</span>`;
        setTimeout(() => dibujar(nivel.inicio), 1500);
      }
    };
    root.querySelector('.a-borrar').onclick = () => { if (animando) return; prog.length = 0; dentro = [prog]; pintarProg(); };
    root.querySelector('.a-cerrar').onclick = () => { if (!animando) cerrar(false); };

    dibujar(nivel.inicio);
    pintarProg();
  });
}
