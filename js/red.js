// Modo equipo: de 2 a 5 jugadores, cada uno en su ordenador, conectados
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

import { TURN } from './config-red.js';

const PREFIJO = 'torre-morvath-v1-';
const LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // sin I ni O para no confundir con 1 y 0
export const MAX_JUGADORES = 5;


// Servidores ICE: STUN de Google (gratis, para la conexión directa) y, si está
// configurado en config-red.js, un servidor de retransmisión TURN: el de
// Cloudflare a través de nuestro Worker (servidor-turn/) o el de Metered.
let opcionesCache = null;
async function pedirTurn() {
  if (TURN.credencialesUrl) {
    const r = await fetch(TURN.credencialesUrl);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return (await r.json()).iceServers || [];
  }
  if (TURN.meteredApp && TURN.meteredApiKey) {
    const r = await fetch(`https://${TURN.meteredApp}.metered.live/api/v1/turn/credentials?apiKey=${encodeURIComponent(TURN.meteredApiKey)}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }
  return [];
}
async function opcionesPeer() {
  if (opcionesCache) return opcionesCache;
  const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
  try {
    iceServers.push(...await pedirTurn());
  } catch (e) {
    console.warn('No se pudo obtener el servidor de retransmisión; solo conexión directa.', e);
  }
  opcionesCache = { config: { iceServers } };
  return opcionesCache;
}
export const hayRetransmision = () => Boolean(TURN.credencialesUrl || (TURN.meteredApp && TURN.meteredApiKey));

// Latido: cada jugador manda una señal por segundo. Si alguien pasa este tiempo
// sin dar señales, se le da por desconectado (cerrar el navegador de golpe no
// siempre avisa por la conexión directa).
const SIN_SENAL_MS = 10000;
// El reloj va en un Web Worker porque los navegadores frenan los temporizadores
// de las pestañas en segundo plano, y eso echaría a jugadores que siguen ahí.
function crearReloj(cada) {
  try {
    const url = URL.createObjectURL(new Blob(['setInterval(() => postMessage(0), 1000);'], { type: 'text/javascript' }));
    const worker = new Worker(url);
    worker.onmessage = cada;
    return () => worker.terminate();
  } catch {
    const id = setInterval(cada, 1000);
    return () => clearInterval(id);
  }
}

const limpiarPerfil = (p) => ({
  personaje: String(p.personaje || '').slice(0, 20),
  etiqueta: String(p.etiqueta || '').trim().slice(0, 32),
});

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
    this.motivoNoTarde = () => 'La partida ya ha empezado.'; // null = se puede entrar a mitad
    this.alEntrarTarde = () => {};
    this.ultimaSenal = new Map(); // id → hora del último mensaje recibido
    this.ultimoChat = new Map();
    this.pararReloj = null;
  }

  // se llama cada segundo mientras la sala está activa
  latir() {
    if (!this.activa) return;
    const ahora = Date.now();
    if (this.esHost) {
      this.difundir({ t: 'latido' });
      for (const [id, conn] of this.conexiones) {
        const ice = conn.peerConnection?.iceConnectionState;
        if (ahora - (this.ultimaSenal.get(id) ?? ahora) > SIN_SENAL_MS || ice === 'failed' || ice === 'closed') {
          try { conn.close(); } catch { /* ya cerrada */ }
          this.quitar(id);
        }
      }
    } else if (this.host) {
      if (this.host.open) this.host.send({ t: 'latido' });
      const ice = this.host.peerConnection?.iceConnectionState;
      if (ahora - (this.ultimaSenal.get('anfitrion') ?? ahora) > SIN_SENAL_MS || ice === 'failed' || ice === 'closed') this.caeAnfitrion();
    }
  }

  empezarLatido() {
    if (!this.pararReloj) this.pararReloj = crearReloj(() => this.latir());
  }

  caeAnfitrion() {
    if (!this.activa) return;
    this.activa = false;
    try { this.host?.close(); } catch { /* ya cerrada */ }
    this.alCaer('anfitrion');
  }

  async cargarPeer() {
    const { Peer } = await import('https://cdn.jsdelivr.net/npm/peerjs@1.5.5/+esm');
    return Peer;
  }

  get miColor() { return this.jugadores.find((j) => j.id === this.miId)?.color ?? 0; }

  // ---------- Anfitrión ----------
  async crearSala(nombre, perfil = {}) {
    const Peer = await this.cargarPeer();
    for (let intento = 0; intento < 5 && !this.peer; intento++) {
      const codigo = codigoAleatorio();
      try {
        this.peer = await abrir(new Peer(PREFIJO + codigo, await opcionesPeer()));
        this.codigo = codigo;
      } catch (e) {
        if (e.type !== 'unavailable-id') throw new Error(`No se pudo crear la sala (${e.type || e.message}).`);
      }
    }
    if (!this.peer) throw new Error('No se pudo crear la sala. Inténtalo de nuevo.');
    this.esHost = true;
    this.activa = true;
    this.miId = this.peer.id;
    this.jugadores = [{ id: this.miId, nombre, color: 0, ...limpiarPerfil(perfil) }];
    this.peer.on('connection', (conn) => this.nuevaConexion(conn));
    this.empezarLatido();
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
      this.ultimaSenal.set(conn.peer, Date.now());
      if (msg.t === 'latido') return;
      if (msg.t === 'hola') {
        // con la partida empezada se puede entrar (o volver tras caerse) si el juego lo permite
        const tarde = this.empezada ? this.motivoNoTarde() : null;
        if (tarde || this.jugadores.length >= MAX_JUGADORES) {
          conn.send({ t: 'rechazo', motivo: tarde ?? `La sala está llena (máximo ${MAX_JUGADORES} jugadores).` });
          setTimeout(() => conn.close(), 500);
          return;
        }
        const color = [...Array(MAX_JUGADORES).keys()].find((c) => !this.jugadores.some((j) => j.color === c));
        this.jugadores.push({ id: conn.peer, nombre: String(msg.nombre || 'Aprendiz').slice(0, 16), color, ...limpiarPerfil(msg) });
        this.conexiones.set(conn.peer, conn);
        conn.send({ t: 'bienvenida', id: conn.peer });
        this.difundirSala();
        if (this.empezada) this.alEntrarTarde(conn.peer);
        return;
      }
      if (!this.conexiones.has(conn.peer)) return;
      if (msg.t === 'perfil') {
        const j = this.jugadores.find((x) => x.id === conn.peer);
        if (j) Object.assign(j, limpiarPerfil(msg));
        this.difundirSala();
        return;
      }
      if (msg.t === 'chat') {
        // el nombre y el color los pone el anfitrión: nadie puede hacerse pasar por otro
        const j = this.jugadores.find((x) => x.id === conn.peer);
        const texto = String(msg.texto || '').trim().slice(0, 140);
        const ahora = Date.now();
        if (!j || !texto || ahora - (this.ultimoChat.get(conn.peer) ?? 0) < 500) return;
        this.ultimoChat.set(conn.peer, ahora);
        const limpio = { t: 'chat', id: j.id, nombre: j.nombre, color: j.color, texto };
        this.difundir(limpio, conn.peer);
        this.alMensaje(limpio, conn.peer);
        return;
      }
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
    this.ultimaSenal.delete(id);
    const quien = this.jugadores.find((j) => j.id === id);
    this.jugadores = this.jugadores.filter((j) => j.id !== id);
    this.difundirSala();
    this.alCaer(id, quien);
  }

  difundirSala() {
    this.difundir({ t: 'sala', jugadores: this.jugadores });
    this.alCambiarSala(this.jugadores);
  }

  enviarA(id, msg) {
    const c = this.conexiones.get(id);
    if (c?.open) c.send(msg);
  }

  difundir(msg, excepto) {
    for (const [id, c] of this.conexiones) if (id !== excepto && c.open) c.send(msg);
  }

  // ---------- Invitado ----------
  async unirse(codigo, nombre, perfil = {}) {
    const Peer = await this.cargarPeer();
    this.peer = await abrir(new Peer(await opcionesPeer()));
    this.miId = this.peer.id;
    const conn = this.peer.connect(PREFIJO + codigo.trim().toUpperCase(), { reliable: true });
    await new Promise((ok, mal) => {
      const reloj = setTimeout(() => {
        // la sala existe y respondió, pero la conexión directa se quedó a medias:
        // las redes no la permiten y hace falta un servidor de retransmisión
        const ice = conn.peerConnection?.iceConnectionState;
        if (ice === 'checking' || ice === 'failed' || ice === 'disconnected') {
          mal(new Error(hayRetransmision()
            ? 'La sala existe, pero vuestras redes no dejan conectar ni siquiera por el servidor de retransmisión. Probad desde otra red.'
            : 'La sala existe, pero vuestras redes no dejan conectar directamente. Falta configurar el servidor de retransmisión gratuito (js/config-red.js).'));
        } else {
          mal(new Error('No responde nadie con ese código. Revísalo o pide al anfitrión que cree la sala de nuevo.'));
        }
      }, 15000);
      this.peer.on('error', (e) => {
        clearTimeout(reloj);
        mal(new Error(e.type === 'peer-unavailable' ? 'No existe ninguna sala con ese código.' : `No se pudo conectar (${e.type}).`));
      });
      conn.on('open', () => conn.send({ t: 'hola', nombre, ...limpiarPerfil(perfil) }));
      conn.on('data', (msg) => {
        this.ultimaSenal.set('anfitrion', Date.now());
        if (msg.t === 'latido') return;
        if (msg.t === 'rechazo') { clearTimeout(reloj); mal(new Error(msg.motivo)); return; }
        if (msg.t === 'bienvenida') {
          clearTimeout(reloj);
          this.host = conn;
          this.activa = true;
          this.codigo = codigo.trim().toUpperCase();
          this.empezarLatido();
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
      conn.on('close', () => this.caeAnfitrion());
    });
  }

  // personaje y etiqueta elegidos en la sala (se pueden cambiar mientras se espera)
  actualizarPerfil(perfil) {
    if (!this.activa) return;
    if (this.esHost) {
      const yo = this.jugadores.find((j) => j.id === this.miId);
      if (yo) Object.assign(yo, limpiarPerfil(perfil));
      this.difundirSala();
    } else if (this.host?.open) {
      this.host.send({ t: 'perfil', ...limpiarPerfil(perfil) });
    }
  }

  // mensaje de chat propio; devuelve lo que hay que mostrar en pantalla
  enviarChat(texto) {
    if (!this.activa) return null;
    const yo = this.jugadores.find((j) => j.id === this.miId);
    const m = { t: 'chat', id: this.miId, nombre: yo?.nombre ?? 'Yo', color: yo?.color ?? 0, texto: texto.slice(0, 140) };
    if (this.esHost) this.difundir(m);
    else if (this.host?.open) this.host.send({ t: 'chat', texto: m.texto });
    return m;
  }

  // del invitado al anfitrión; del anfitrión a todos
  enviar(msg) {
    if (!this.activa) return;
    if (this.esHost) this.difundir(msg);
    else if (this.host?.open) this.host.send(msg);
  }

  cerrar() {
    this.activa = false;
    this.pararReloj?.();
    this.pararReloj = null;
    this.ultimaSenal.clear();
    this.peer?.destroy();
    this.peer = null;
  }
}
