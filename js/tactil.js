// Controles táctiles para tabletas (PLAN_TECNICO.md, sección 15).
// Joystick a la izquierda para andar (al fondo del todo, corre), arrastrar en el
// resto de la pantalla gira la cámara (lo hace el lienzo, como con el ratón) y
// botones a la derecha que envían la tecla equivalente: así toda la lógica del
// teclado sirve igual.

const BOTONES = [
  { code: 'KeyE', texto: 'E', titulo: 'Usar', clase: 'grande' },
  { code: 'KeyR', texto: '⚔', titulo: 'Atacar', clase: 'grande' },
  { code: 'KeyF', texto: '✦', titulo: 'Varita' },
  { code: 'Space', texto: '⤒', titulo: 'Saltar' },
  { code: 'KeyG', texto: 'G', titulo: 'Grimorio' },
  { code: 'KeyH', texto: '?', titulo: 'Pista' },
  { code: 'KeyT', texto: '💬', titulo: 'Chat' },
  { code: 'KeyO', texto: '⚙', titulo: 'Opciones' },
];

export const esTactil = () => matchMedia('(pointer: coarse)').matches;

// Devuelve { x, z, correr }: lo que marca el joystick en cada momento (de -1 a 1).
export function crearTactil() {
  const eje = { x: 0, z: 0, correr: false };
  const raiz = document.createElement('div');
  raiz.id = 'tactil';
  raiz.className = 'hidden';
  raiz.innerHTML = `<div class="tc-joy"><div class="tc-mando"></div></div>
    <div class="tc-botones">${BOTONES.map((b) => `<button class="tc-btn ${b.clase || ''}" data-code="${b.code}" aria-label="${b.titulo}">${b.texto}</button>`).join('')}</div>`;
  document.body.appendChild(raiz);

  // ---------- joystick ----------
  const joy = raiz.querySelector('.tc-joy'), mando = raiz.querySelector('.tc-mando');
  let dedo = null, cx = 0, cy = 0;
  const RADIO = 52;
  const mover = (e) => {
    let dx = e.clientX - cx, dy = e.clientY - cy;
    const d = Math.hypot(dx, dy);
    if (d > RADIO) { dx *= RADIO / d; dy *= RADIO / d; }
    mando.style.transform = `translate(${dx}px, ${dy}px)`;
    const n = Math.min(1, d / RADIO);
    eje.x = n < 0.18 ? 0 : dx / RADIO;
    eje.z = n < 0.18 ? 0 : -dy / RADIO;
    eje.correr = n > 0.92;
  };
  const soltar = (e) => {
    if (e.pointerId !== dedo) return;
    dedo = null;
    eje.x = eje.z = 0;
    eje.correr = false;
    mando.style.transform = '';
  };
  joy.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    dedo = e.pointerId;
    const r = joy.getBoundingClientRect();
    cx = r.left + r.width / 2;
    cy = r.top + r.height / 2;
    try { joy.setPointerCapture(e.pointerId); } catch { /* puntero ya soltado */ }
    mover(e);
  });
  joy.addEventListener('pointermove', (e) => { if (e.pointerId === dedo) mover(e); });
  joy.addEventListener('pointerup', soltar);
  joy.addEventListener('pointercancel', soltar);

  // ---------- botones: simulan la tecla ----------
  const tecla = (tipo, code) => dispatchEvent(new KeyboardEvent(tipo, { code, key: code === 'Space' ? ' ' : code.replace('Key', '').toLowerCase(), bubbles: true }));
  raiz.querySelectorAll('.tc-btn').forEach((b) => {
    const code = b.dataset.code;
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      b.classList.add('pulsado');
      tecla('keydown', code);
    });
    const arriba = () => { if (b.classList.contains('pulsado')) { b.classList.remove('pulsado'); tecla('keyup', code); } };
    b.addEventListener('pointerup', arriba);
    b.addEventListener('pointerleave', arriba);
    b.addEventListener('pointercancel', arriba);
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  });

  return {
    eje,
    // se ocultan fuera del juego (menús, diálogos a pantalla completa, final)
    mostrar(v) { raiz.classList.toggle('hidden', !v); },
    // en el modo individual el chat no existe
    chat(v) { raiz.querySelector('[data-code="KeyT"]').classList.toggle('hidden', !v); },
  };
}
