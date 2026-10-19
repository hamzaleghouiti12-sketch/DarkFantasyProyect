// Chat simulado (Piso X): una conversación guionizada con burbujas, como una app de
// mensajería, en la que el jugador elige qué responder. Nunca hay contacto real con nadie.
// Si elige mal, ve la consecuencia y puede volver a elegir (sin castigo).
//   conv: { contacto, titulo, pasos: [{ de: 'otro' | 'yo', texto, quien? } | { elige: [{ texto, ok, efecto }] }] }
//   alResponder(ok): se llama con cada elección (para el informe)
// Resuelve true al terminar la conversación; false si se cierra antes (Esc).
import { rich } from '../ui.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));

export function abrirChatSimulado(ui, conv, alResponder = () => {}, cabecera = '') {
  return new Promise((resolve) => {
    const root = document.createElement('div');
    root.className = 'modal chat-sim';
    root.innerHTML = `<div class="modal-card chat-sim-caja">
      <div class="quiz-kicker">${esc(cabecera || conv.titulo)}</div>
      <div class="chat-sim-cab"><span class="chat-sim-avatar">${esc(conv.contacto.slice(0, 1))}</span><b>${esc(conv.contacto)}</b><small>Conversación simulada</small></div>
      <div class="chat-sim-lista" aria-live="polite"></div>
      <div class="chat-sim-opciones"></div>
    </div>`;
    document.body.appendChild(root);
    ui.open.editor = true;
    const lista = root.querySelector('.chat-sim-lista'), opciones = root.querySelector('.chat-sim-opciones');
    let cerrado = false;
    const cerrar = (hecho) => { if (cerrado) return; cerrado = true; root.remove(); ui.open.editor = false; ui.keyTarget = null; resolve(hecho); };
    ui.keyTarget = (e) => { if (e.code === 'Escape') cerrar(false); };

    const burbuja = (lado, texto, quien) => {
      const b = document.createElement('div');
      b.className = `chat-sim-msg ${lado}`;
      b.innerHTML = `${quien ? `<span class="chat-sim-quien">${esc(quien)}</span>` : ''}${esc(texto)}`;
      lista.appendChild(b);
      lista.scrollTop = lista.scrollHeight;
    };
    const nota = (ok, texto) => {
      const n = document.createElement('div');
      n.className = `chat-sim-nota ${ok ? 'bien' : 'mal'}`;
      n.innerHTML = rich(texto);
      lista.appendChild(n);
      lista.scrollTop = lista.scrollHeight;
    };
    const elegir = (paso) => new Promise((ok) => {
      opciones.innerHTML = '';
      paso.elige.forEach((o, i) => {
        const b = document.createElement('button');
        b.className = 'btn chat-sim-op';
        b.innerHTML = `<span class="quiz-n">${i + 1}</span>${esc(o.texto)}`;
        b.onclick = () => ok(o);
        opciones.appendChild(b);
      });
      ui.keyTarget = (e) => {
        if (e.code === 'Escape') return cerrar(false);
        const n = Number(e.key);
        if (n >= 1 && n <= paso.elige.length) ok(paso.elige[n - 1]);
      };
    });

    (async () => {
      for (const paso of conv.pasos) {
        if (cerrado) return;
        if (paso.elige) {
          for (;;) {
            const o = await elegir(paso);
            if (cerrado) return;
            opciones.innerHTML = '';
            burbuja('yo', o.texto);
            alResponder(o.ok);
            await espera(500);
            nota(o.ok, o.efecto);
            if (o.ok) break;
            await espera(900);
            nota(false, 'Pensadlo otra vez: elegid otra respuesta.');
          }
          ui.keyTarget = (e) => { if (e.code === 'Escape') cerrar(false); };
          await espera(1200);
        } else {
          await espera(paso.de === 'otro' ? 650 : 300);
          burbuja(paso.de === 'otro' ? 'otro' : 'yo', paso.texto, paso.quien);
        }
      }
      if (cerrado) return;
      const fin = document.createElement('button');
      fin.className = 'btn chat-sim-fin';
      fin.textContent = 'Cerrar la conversación';
      fin.onclick = () => cerrar(true);
      opciones.appendChild(fin);
      ui.keyTarget = (e) => { if (['Escape', 'Enter', 'KeyE', 'Space'].includes(e.code)) cerrar(true); };
    })();
  });
}
