// Chat del modo equipo: panel abajo a la izquierda.
// T (o Enter) abre el campo, Enter envía, Esc cancela.
// Los mensajes se desvanecen a los pocos segundos; con el chat abierto se ve el historial.

export const MAX_CHAT = 140;

// Filtro básico para uso en clase: las palabras de la lista se ven como "p****".
const PALABROTAS = new Set([
  'puta', 'puto', 'putas', 'putos', 'mierda', 'mierdas', 'joder', 'jodete', 'cono', 'gilipollas', 'gilipolla',
  'cabron', 'cabrona', 'cabrones', 'imbecil', 'imbeciles', 'idiota', 'idiotas', 'subnormal', 'subnormales',
  'maricon', 'maricones', 'zorra', 'zorras', 'polla', 'pollas', 'hostia', 'hostias', 'capullo', 'capullos',
  'pendejo', 'pendeja', 'estupido', 'estupida', 'mongolo', 'mongola', 'retrasado', 'retrasada', 'follar', 'hijoputa',
]);
const normalizar = (p) => p.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export function filtrar(texto) {
  return texto.replace(/\p{L}+/gu, (p) => (PALABROTAS.has(normalizar(p)) ? p[0] + '*'.repeat(p.length - 1) : p));
}

export class Chat {
  // alEnviar(texto) → devuelve true si se ha enviado
  constructor(alEnviar) {
    this.alEnviar = alEnviar;
    this.caja = document.getElementById('chat');
    this.lista = document.getElementById('chat-lista');
    this.form = document.getElementById('chat-form');
    this.entrada = document.getElementById('chat-entrada');
    this.abierto = false;
    this.ultimoEnvio = 0;
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const texto = this.entrada.value.trim().slice(0, MAX_CHAT);
      if (texto) {
        if (Date.now() - this.ultimoEnvio < 700) return; // sin ráfagas
        this.ultimoEnvio = Date.now();
        this.alEnviar(texto);
      }
      this.cerrar();
    });
    this.entrada.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') { e.preventDefault(); this.cerrar(); }
    });
    this.entrada.addEventListener('blur', () => this.cerrar());
  }

  mostrar(visible) {
    this.caja.classList.toggle('hidden', !visible);
    if (!visible) this.cerrar();
  }

  abrir() {
    if (this.caja.classList.contains('hidden')) return;
    this.abierto = true;
    this.caja.classList.add('abierto');
    this.form.classList.remove('hidden');
    this.entrada.value = '';
    this.entrada.focus();
    this.lista.scrollTop = this.lista.scrollHeight;
  }

  cerrar() {
    if (!this.abierto) return;
    this.abierto = false;
    this.caja.classList.remove('abierto');
    this.form.classList.add('hidden');
    this.entrada.blur();
  }

  // { nombre, color, texto } o { sistema: 'texto' }
  anadir(m) {
    const li = document.createElement('li');
    if (m.sistema) {
      li.className = 'sistema';
      li.textContent = m.sistema;
    } else {
      const quien = document.createElement('b');
      quien.className = `c${m.color ?? 0}`;
      quien.textContent = `${m.nombre}: `;
      li.append(quien, document.createTextNode(filtrar(m.texto)));
    }
    this.lista.appendChild(li);
    while (this.lista.children.length > 60) this.lista.firstChild.remove();
    this.lista.scrollTop = this.lista.scrollHeight;
    setTimeout(() => li.classList.add('viejo'), 12000);
  }

  vaciar() { this.lista.innerHTML = ''; }
}
