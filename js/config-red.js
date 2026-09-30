// Servidor de retransmisión (TURN) para el modo equipo.
//
// La conexión directa entre navegadores (WebRTC) no siempre es posible: muchos
// routers y cortafuegos (sobre todo en institutos y redes móviles) la bloquean.
// En ese caso el tráfico tiene que pasar por un servidor de retransmisión.
// Los que traía PeerJS gratis ya no existen (comprobado el 30-09-2026).
//
// Opción configurada: Cloudflare Realtime TURN (1.000 GB al mes gratis).
// La clave secreta NO va aquí: la guarda el Worker de la carpeta servidor-turn/,
// que entrega a cada jugador credenciales que caducan a las pocas horas.
export const TURN = {
  // URL del Worker publicado (termina en /credenciales). Vacío = solo conexión directa.
  credencialesUrl: 'https://torre-morvath-turn.servidor-turn.workers.dev/credenciales',

  // Alternativa sin servidor propio: Metered Open Relay (20 GB al mes gratis).
  // Ojo: su API key queda visible en el juego.
  meteredApp: '',
  meteredApiKey: '',
};
