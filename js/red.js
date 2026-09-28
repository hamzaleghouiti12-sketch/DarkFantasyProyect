// Modo equipo: de 2 a 3 jugadores, cada uno en su ordenador, conectados
// directamente entre navegadores (WebRTC) con la librería gratuita PeerJS.
//
// Uno crea la sala (el anfitrión) y recibe un código de 4 letras; los demás
// entran con ese código. El servidor público de PeerJS solo sirve para que los
// navegadores se encuentren: después la partida viaja de navegador a navegador.
// No hace falta ningún servidor propio ni pagar nada.
//
// Esquema en estrella: los invitados hablan solo con el anfitrión, y el
// anfitrión reenvía y decide. Toda acción que cambia la partida compartida
// (romper un sello, abrir una puerta…) la valida el anfitrión antes de
// anunciarla a todos, para que dos jugadores no rompan el mismo sello a la vez.
//
// Limitación: algunas redes muy cerradas (a veces las de los institutos)
// bloquean la conexión directa entre ordenadores. En casa suele funcionar.

const PREFIJO = 'torre-morvath-v1-';
const LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // sin I ni O para no confundir con 1 y 0
export const MAX_JUGADORES = 3;

const codigoAleatorio = () => Array.from({ length: 4 }, () => LETRAS[Math.floor(Math.random() * LETRAS.length)]).join('');
const abrir = (peer) => new Promise((ok, mal) => {
  peer.on('open', () => ok(peer));
  peer.on('error', mal);
});

export class Red {
  constructor() {
    this.activa = false;
    this.esHost = false;
    this.empezada = false;
    this.miId = null;
    this.codigo = null;
    this.jugadores = []; // [{ id, nombre, color }]
    this.conexiones = new Map();
    this.host = null;
    this.alMensaje = () => {};
    this.alCambiarSala = () => {};
    this.alCaer = () => {};
  }

  async cargarPeer() {
    const { Peer } = await import('https://cdn.jsdelivr.net/npm/peerjs@1.5.5/+esm');
    return Peer;
  }

  get miColor() { return this.jugadores.find((j) => j.id === this.miId)?.color ?? 0; }

  // ---------- Anfitrión ----------
  async crearSala(nombre) {
    const Peer = await this.cargarPeer();
    for (let intento = 0; intento < 5 && !this.peer; intento++) {
      const codigo = codigoAleatorio();
      try {
        this.peer = await abrir(new Peer(PREFIJO + codigo));
        this.codigo = codigo;
      } catch (e) {
        if (e.type !== 'unavailable-id') throw new Error(`No se pudo crear la sala (${e.type || e.message}).`);
      }
    }
    if (!this.peer) throw new Error('No se pudo crear la sala. Inténtalo de nuevo.');
    this.esHost = true;
    this.activa = true;
    this.miId = this.peer.id;
    this.jugadores = [{ id: this.miId, nombre, color: 0 }];
    this.peer.on('connection', (conn) => this.nuevaConexion(conn));
    // si se pierde el contacto con el servidor de presentación (p. ej. con la
    // pestaña en segundo plano) se vuelve a registrar, para que la sala se
    // pueda seguir encontrando con el mismo código
    this.peer.on('disconnected', () => {
      setTimeout(() => { if (this.activa && this.peer && !this.peer.destroyed && this.peer.disconnected) this.peer.reconnect(); }, 1000);
    });
    this.alCambiarSala(this.jugadores);
    return this.codigo;
  }

  nuevaConexion(conn) {
    conn.on('data', (msg) => {
      if (msg.t === 'hola') {
        if (this.empezada || this.jugadores.length >= MAX_JUGADORES) {
          conn.send({ t: 'rechazo', motivo: this.empezada ? 'La partida ya ha empezado.' : `La sala está llena (máximo ${MAX_JUGADORES} jugadores).` });
          setTimeout(() => conn.close(), 500);
          return;
        }
        const color = [0, 1, 2].find((c) => !this.jugadores.some((j) => j.color === c));
        this.jugadores.push({ id: conn.peer, nombre: String(msg.nombre || 'Aprendiz').slice(0, 16), color });
        this.conexiones.set(conn.peer, conn);
        conn.send({ t: 'bienvenida', id: conn.peer });
        this.difundirSala();
        return;
      }
      if (!this.conexiones.has(conn.peer)) return;
      // posiciones y hechizos se reenvían tal cual al resto
      if (msg.t === 'pos' || msg.t === 'hechizo') this.difundir(msg, conn.peer);
      this.alMensaje(msg, conn.peer);
    });
    const cerrar = () => this.quitar(conn.peer);
    conn.on('close', cerrar);
    conn.on('error', cerrar);
  }

  quitar(id) {
    if (!this.conexiones.has(id)) return;
    this.conexiones.delete(id);
    const quien = this.jugadores.find((j) => j.id === id);
    this.jugadores = this.jugadores.filter((j) => j.id !== id);
    this.difundirSala();
    this.alCaer(id, quien);
  }

  difundirSala() {
    this.difundir({ t: 'sala', jugadores: this.jugadores });
    this.alCambiarSala(this.jugadores);
  }

  difundir(msg, excepto) {
    for (const [id, c] of this.conexiones) if (id !== excepto && c.open) c.send(msg);
  }

  // ---------- Invitado ----------
  async unirse(codigo, nombre) {
    const Peer = await this.cargarPeer();
    this.peer = await abrir(new Peer());
    this.miId = this.peer.id;
    const conn = this.peer.connect(PREFIJO + codigo.trim().toUpperCase(), { reliable: true });
    await new Promise((ok, mal) => {
      const reloj = setTimeout(() => mal(new Error('No responde nadie con ese código. Revísalo o pide al anfitrión que cree la sala de nuevo.')), 12000);
      this.peer.on('error', (e) => {
        clearTimeout(reloj);
        mal(new Error(e.type === 'peer-unavailable' ? 'No existe ninguna sala con ese código.' : `No se pudo conectar (${e.type}).`));
      });
      conn.on('open', () => conn.send({ t: 'hola', nombre }));
      conn.on('data', (msg) => {
        if (msg.t === 'rechazo') { clearTimeout(reloj); mal(new Error(msg.motivo)); return; }
        if (msg.t === 'bienvenida') {
          clearTimeout(reloj);
          this.host = conn;
          this.activa = true;
          this.codigo = codigo.trim().toUpperCase();
          ok();
          return;
        }
        if (msg.t === 'sala') {
          this.jugadores = msg.jugadores;
          this.alCambiarSala(msg.jugadores);
          return;
        }
        this.alMensaje(msg, conn.peer);
      });
      conn.on('close', () => {
        if (!this.activa) return;
        this.activa = false;
        this.alCaer('anfitrion');
      });
    });
  }

  // del invitado al anfitrión; del anfitrión a todos
  enviar(msg) {
    if (!this.activa) return;
    if (this.esHost) this.difundir(msg);
    else if (this.host?.open) this.host.send(msg);
  }

  cerrar() {
    this.activa = false;
    this.peer?.destroy();
    this.peer = null;
  }
}
