// Ventana de la forja (Piso VI): un pequeño taller 3D con su propio renderizador.
// A la izquierda, el plano y las piezas (posición y medidas con números: se aprenden
// los ejes y las transformaciones); en el centro, la vista 3D con el molde translúcido;
// a la derecha, el parecido con el molde, los puntos de control y la malla.
import * as THREE from 'three';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { makeLabel } from '../textures.js';
import { parecido, dentroModelo, estadisticas, piezaValida, LADOS } from './forja.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const num = (v) => String(Math.round(v * 100) / 100).replace('.', ',');

function geometria(p) {
  if (p.tipo === 'caja') return new THREE.BoxGeometry(p.ancho, p.alto, p.fondo);
  const g = new THREE.CylinderGeometry(p.radio, p.radio, p.largo, LADOS);
  if (p.eje === 'x') g.rotateZ(Math.PI / 2);
  if (p.eje === 'z') g.rotateX(Math.PI / 2);
  return g;
}

/**
 * @returns {Promise<{piezas, entregado}>}
 */
export function abrirForja(ui, { molde, controles, piezas, minimo = 0.85 }) {
  return new Promise((resolve) => {
    piezas = piezas.map((p) => ({ ...p }));
    let sel = piezas.length ? 0 : -1;
    const root = document.createElement('div');
    root.className = 'modal forja';
    root.innerHTML = `<div class="forja-caja">
      <div class="editor-cabecera"><div><div class="quiz-kicker">La forja · sello 1</div><h2>Forjad la llave de la cerradura</h2></div>
        <button class="btn-enlace forja-cerrar">Guardar y cerrar (Esc)</button></div>
      <div class="forja-cuerpo">
        <div class="forja-izq">
          <details class="forja-plano" open><summary>Plano de la llave</summary><ul>${molde.map((p) => `<li><b>${esc(p.nombre)}</b>: ${p.tipo === 'caja'
            ? `caja de ${num(p.ancho)} × ${num(p.alto)} × ${num(p.fondo)}`
            : `cilindro de radio ${num(p.radio)} y largo ${num(p.largo)}, eje ${p.eje.toUpperCase()}`}, en (${num(p.x)}, ${num(p.y)}, ${num(p.z)})${p.op === 'restar' ? ' · <em>resta</em>' : ''}</li>`).join('')}</ul></details>
          <div class="forja-anadir"><button data-tipo="caja">+ Caja</button><button data-tipo="cilindro">+ Cilindro</button></div>
          <ul class="forja-piezas"></ul>
          <div class="forja-campos"></div>
        </div>
        <div class="forja-vista"><canvas></canvas><div class="forja-ayuda">Arrastrad para girar · rueda para acercar</div></div>
        <div class="forja-der">
          <div class="forja-parecido"><span>Parecido con el molde</span><b>0%</b><div class="barra"><i></i></div><small>Hace falta un ${Math.round(minimo * 100)}%</small></div>
          <ul class="editor-lista forja-controles"></ul>
          <div class="forja-malla"></div>
          <button class="btn-enlace forja-stl">Descargar STL (piezas que suman)</button>
          <button class="btn forja-entregar" disabled>Entregar la llave</button>
        </div>
      </div></div>`;
    document.body.appendChild(root);
    ui.open.editor = true;
    const $ = (s) => root.querySelector(s);

    // ---------- Escena 3D propia ----------
    const canvas = $('canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const escena = new THREE.Scene();
    escena.background = new THREE.Color(0x120e16);
    const camara = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    escena.add(new THREE.HemisphereLight(0xfff0e0, 0x302030, 1.6));
    const sol = new THREE.DirectionalLight(0xffffff, 2);
    sol.position.set(4, 8, 5);
    escena.add(sol);
    const rejilla = new THREE.GridHelper(10, 20, 0x6a5a48, 0x3a3038);
    rejilla.position.y = -0.31;
    escena.add(rejilla);
    const ejes = new THREE.AxesHelper(4.5);
    ejes.position.y = -0.3;
    escena.add(ejes);
    for (const [t, color, x, y, z] of [['X', '#ff6a5a', 4.8, -0.3, 0], ['Y', '#7fdc7a', 0, 4.4, 0], ['Z', '#6a9aff', 0, -0.3, 4.8]]) {
      const l = makeLabel(t, { height: 0.45, fontSize: 60, color, font: 'Cinzel, serif' });
      l.position.set(x, y, z);
      escena.add(l);
    }
    // el molde, translúcido
    for (const p of molde) {
      const m = new THREE.Mesh(geometria(p), new THREE.MeshBasicMaterial({ color: p.op === 'restar' ? 0xff4040 : 0x7fe0ff, transparent: true, opacity: 0.12, depthWrite: false }));
      m.position.set(p.x, p.y, p.z);
      const aristas = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({ color: p.op === 'restar' ? 0xff6060 : 0x7fe0ff, transparent: true, opacity: 0.45 }));
      m.add(aristas);
      escena.add(m);
    }
    const grupoPiezas = new THREE.Group();
    escena.add(grupoPiezas);
    const matSuma = new THREE.MeshStandardMaterial({ color: 0xc88a4a, metalness: 0.7, roughness: 0.35 });
    const matSel = new THREE.MeshStandardMaterial({ color: 0xffc070, metalness: 0.6, roughness: 0.3, emissive: 0x6a3a10 });
    const matResta = new THREE.MeshStandardMaterial({ color: 0xff3030, transparent: true, opacity: 0.45, depthWrite: false });

    const orbita = { yaw: 0.6, pitch: 0.7, dist: 11 };
    let arrastre = null;
    canvas.onpointerdown = (e) => { arrastre = [e.clientX, e.clientY]; canvas.setPointerCapture(e.pointerId); };
    canvas.onpointerup = () => { arrastre = null; };
    canvas.onpointermove = (e) => {
      if (!arrastre) return;
      orbita.yaw -= (e.clientX - arrastre[0]) * 0.008;
      orbita.pitch = Math.max(0.1, Math.min(1.45, orbita.pitch + (e.clientY - arrastre[1]) * 0.006));
      arrastre = [e.clientX, e.clientY];
    };
    canvas.onwheel = (e) => { e.preventDefault(); orbita.dist = Math.max(5, Math.min(22, orbita.dist + e.deltaY * 0.01)); };
    let vivo = true;
    const pintar = () => {
      if (!vivo) return;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== Math.floor(w * renderer.getPixelRatio())) { renderer.setSize(w, h, false); camara.aspect = w / h; camara.updateProjectionMatrix(); }
      camara.position.set(Math.sin(orbita.yaw) * Math.cos(orbita.pitch) * orbita.dist, Math.sin(orbita.pitch) * orbita.dist, Math.cos(orbita.yaw) * Math.cos(orbita.pitch) * orbita.dist);
      camara.lookAt(0, 0, 0);
      renderer.render(escena, camara);
      requestAnimationFrame(pintar);
    };

    // ---------- Panel de piezas ----------
    const nueva = (tipo) => (tipo === 'caja'
      ? { tipo, op: 'sumar', x: 0, y: 0, z: 0, ancho: 1, alto: 0.6, fondo: 1 }
      : { tipo, op: 'sumar', x: 0, y: 0, z: 0, radio: 0.3, largo: 2, eje: 'x' });
    root.querySelectorAll('.forja-anadir button').forEach((b) => { b.onclick = () => { piezas.push(nueva(b.dataset.tipo)); sel = piezas.length - 1; todo(); }; });
    const campo = (k, etiqueta, v) => `<label>${etiqueta}<input data-k="${k}" type="number" step="0.1" value="${v}"></label>`;
    function pintarPanel() {
      $('.forja-piezas').innerHTML = piezas.map((p, i) => `<li class="${i === sel ? 'sel' : ''}" data-i="${i}">${i + 1}. ${p.tipo === 'caja' ? 'Caja' : 'Cilindro'} ${p.op === 'restar' ? '(resta)' : ''}<button data-borrar="${i}" aria-label="Quitar pieza">✕</button></li>`).join('') || '<li class="vacio">Añadid la primera pieza</li>';
      root.querySelectorAll('.forja-piezas li[data-i]').forEach((li) => { li.onclick = (e) => { if (e.target.dataset.borrar) return; sel = Number(li.dataset.i); todo(); }; });
      root.querySelectorAll('[data-borrar]').forEach((b) => { b.onclick = () => { piezas.splice(Number(b.dataset.borrar), 1); sel = Math.min(sel, piezas.length - 1); todo(); }; });
      const p = piezas[sel];
      $('.forja-campos').innerHTML = !p ? '' : `
        <div class="fila"><label>Operación<select data-k="op"><option value="sumar"${p.op === 'sumar' ? ' selected' : ''}>Sumar (unión)</option><option value="restar"${p.op === 'restar' ? ' selected' : ''}>Restar (diferencia)</option></select></label>
        ${p.tipo === 'cilindro' ? `<label>Eje<select data-k="eje">${['x', 'y', 'z'].map((e) => `<option value="${e}"${p.eje === e ? ' selected' : ''}>${e.toUpperCase()}</option>`).join('')}</select></label>` : ''}</div>
        <div class="fila titulo">Posición (trasladar)</div>
        <div class="fila">${campo('x', 'x', p.x)}${campo('y', 'y', p.y)}${campo('z', 'z', p.z)}</div>
        <div class="fila titulo">Medidas (escalar)</div>
        <div class="fila">${p.tipo === 'caja' ? campo('ancho', 'ancho (x)', p.ancho) + campo('alto', 'alto (y)', p.alto) + campo('fondo', 'fondo (z)', p.fondo) : campo('radio', 'radio', p.radio) + campo('largo', 'largo', p.largo)}</div>`;
      root.querySelectorAll('.forja-campos [data-k]').forEach((el) => {
        el.oninput = el.onchange = () => {
          const k = el.dataset.k;
          const valor = el.tagName === 'SELECT' ? el.value : Number(String(el.value).replace(',', '.'));
          if (!piezaValida({ ...p, [k]: valor })) return; // un número a medio escribir no cambia la pieza
          p[k] = valor;
          if (el.tagName === 'SELECT') pintarPanel();
          dibujar();
          evaluar();
        };
      });
    }
    function dibujar() {
      for (const m of [...grupoPiezas.children]) { grupoPiezas.remove(m); m.geometry.dispose(); }
      piezas.forEach((p, i) => {
        if (!piezaValida(p)) return;
        const m = new THREE.Mesh(geometria(p), p.op === 'restar' ? matResta : i === sel ? matSel : matSuma);
        m.position.set(p.x, p.y, p.z);
        m.userData.op = p.op;
        grupoPiezas.add(m);
      });
    }
    let reloj = 0, listo = false;
    function evaluar() {
      clearTimeout(reloj);
      reloj = setTimeout(() => {
        const validas = piezas.filter(piezaValida);
        const iou = parecido(molde, validas);
        const puntos = controles.map((c) => ({ texto: c.texto, ok: dentroModelo(validas, c.punto) === c.lleno }));
        listo = iou >= minimo && puntos.every((c) => c.ok);
        $('.forja-parecido b').textContent = `${Math.round(iou * 100)}%`;
        $('.forja-parecido .barra i').style.width = `${Math.min(100, iou * 100)}%`;
        $('.forja-parecido').classList.toggle('ok', iou >= minimo);
        $('.forja-controles').innerHTML = puntos.map((c) => `<li class="${c.ok ? 'ok' : ''}"><span>${c.ok ? '✓' : '✗'}</span>${esc(c.texto)}</li>`).join('');
        const e = estadisticas(validas);
        $('.forja-malla').innerHTML = `<b>Vuestra malla</b><span>${e.vertices} vértices</span><span>${e.aristas} aristas</span><span>${e.caras} caras</span>`;
        $('.forja-entregar').disabled = !listo;
      }, 200);
    }
    function todo() { pintarPanel(); dibujar(); evaluar(); }

    $('.forja-stl').onclick = () => {
      const grupo = new THREE.Group();
      for (const m of grupoPiezas.children) if (m.userData.op !== 'restar') grupo.add(m.clone());
      grupo.updateMatrixWorld(true);
      const texto = new STLExporter().parse(grupo);
      const enlace = document.createElement('a');
      enlace.href = URL.createObjectURL(new Blob([texto], { type: 'model/stl' }));
      enlace.download = 'llave-de-morvath.stl';
      enlace.click();
      setTimeout(() => URL.revokeObjectURL(enlace.href), 2000);
    };
    const cerrar = (entregado) => {
      vivo = false;
      clearTimeout(reloj);
      renderer.dispose();
      root.remove();
      ui.open.editor = false;
      ui.keyTarget = null;
      resolve({ piezas, entregado });
    };
    $('.forja-entregar').onclick = () => { if (listo) cerrar(true); };
    $('.forja-cerrar').onclick = () => cerrar(false);
    root.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(false); });
    ui.keyTarget = (e) => { if (e.code === 'Escape') cerrar(false); };
    todo();
    requestAnimationFrame(pintar);
  });
}
