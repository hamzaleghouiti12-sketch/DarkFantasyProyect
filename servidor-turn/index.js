// Servidor de credenciales para el modo equipo de La Torre de Morvath.
//
// Es un Cloudflare Worker (gratis). Guarda en secreto la clave del servidor de
// retransmisión TURN de Cloudflare y entrega a cada jugador credenciales que
// caducan a las pocas horas. Así la clave larga nunca aparece en el juego.
//
// Secretos (se configuran con `npx wrangler secret put …`, nunca en el código):
//   TURN_KEY_ID          identificador de la clave TURN (panel de Cloudflare → Realtime → TURN)
//   TURN_KEY_API_TOKEN   token de esa clave

// Solo el juego puede pedir credenciales (en local y en GitHub Pages).
const ORIGENES = [
  'http://localhost:8750',
  'http://127.0.0.1:8750',
  'https://hamzaleghouiti12-sketch.github.io',
];
const DURACION_S = 4 * 60 * 60; // las credenciales valen 4 horas: más que una partida

export default {
  async fetch(peticion, env) {
    const origen = peticion.headers.get('Origin') || '';
    const permitido = ORIGENES.includes(origen);
    const cors = {
      'Access-Control-Allow-Origin': permitido ? origen : ORIGENES[0],
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      Vary: 'Origin',
    };
    if (peticion.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    const url = new URL(peticion.url);
    if (url.pathname !== '/credenciales' || peticion.method !== 'GET') {
      return new Response('No encontrado', { status: 404, headers: cors });
    }
    if (!permitido) return new Response('Origen no permitido', { status: 403, headers: cors });
    if (!env.TURN_KEY_ID || !env.TURN_KEY_API_TOKEN) {
      return new Response('Faltan los secretos TURN_KEY_ID y TURN_KEY_API_TOKEN', { status: 500, headers: cors });
    }

    const respuesta = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials/generate-ice-servers`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.TURN_KEY_API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ttl: DURACION_S }),
      },
    );
    if (!respuesta.ok) {
      return new Response(`Cloudflare no dio credenciales (HTTP ${respuesta.status})`, { status: 502, headers: cors });
    }
    const { iceServers } = await respuesta.json();
    return Response.json({ iceServers }, { headers: { ...cors, 'Cache-Control': 'no-store' } });
  },
};
