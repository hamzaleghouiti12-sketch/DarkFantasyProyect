// Intérprete de la «terminal del vigía» (PLAN_TECNICO.md, 9.6): ipconfig, ping y
// tracert con respuestas simuladas a partir del grafo de la red. Lógica pura.
import { ruta, clave } from './grafo.js';

// retardo aproximado de ida y vuelta por tipo de enlace (ms)
const RETARDO = { utp: 1, fibra: 7, inalambrico: 3 };

/**
 * @param {object} o
 * @param {() => {nodos: string[], aristas: {a,b,medio}[], cortadas: Set<string>}} o.red  red completa y enlaces cortados
 * @param {Object<string, {ip: string, nombre: string, capa2?: boolean}>} o.equipos  nodo → datos (capa2: switch sin IP)
 * @param {Object<string, string>} o.dns    nombre → nodo
 * @param {string} o.origen                 nodo donde está la terminal
 * @param {() => {ip, mascara, puerta, dns, mac}} o.miEquipo
 */
export function crearInterprete(o) {
  let semilla = 7;
  const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647);

  const activas = () => {
    const r = o.red();
    return { nodos: r.nodos, aristas: r.aristas.filter((e) => !r.cortadas.has(clave(e.a, e.b))), todas: r.aristas };
  };
  // nombre o IP → nodo (o null)
  function resolver(destino) {
    const d = destino.toLowerCase();
    if (o.dns[d]) return o.dns[d];
    for (const [nodo, e] of Object.entries(o.equipos)) if (e.ip === d || e.nombre.toLowerCase() === d || nodo === d) return nodo;
    return null;
  }
  const medio = (aristas, a, b) => aristas.find((e) => clave(e.a, e.b) === clave(a, b))?.medio ?? 'utp';
  const tiempo = (aristas, camino) => {
    let t = 0;
    for (let i = 1; i < camino.length; i++) t += RETARDO[medio(aristas, camino[i - 1], camino[i])] ?? 1;
    return t;
  };
  const ms = (t) => (t < 1 ? '<1 ms' : `${t} ms`).padStart(7);

  const comandos = {
    ayuda: () => [
      'Comandos del vigía:',
      '  ipconfig [/all]      muestra la configuración de red de este equipo',
      '  ping <destino>       comprueba si un equipo responde (nombre o IP)',
      '  tracert <destino>    muestra los saltos hasta un equipo',
      '  reparar <isla1>-<isla2>   vuelve a tender un enlace roto (p. ej. reparar tenerife-grancanaria)',
      '  cls                  limpia la pantalla · salir: cierra la terminal',
    ],
    ipconfig: (args) => {
      const e = o.miEquipo();
      const lineas = ['Configuración IP del equipo del vigía', '', 'Adaptador de Ethernet:', `   Dirección IPv4. . . . . . . . . : ${e.ip}`, `   Máscara de subred . . . . . . . : ${e.mascara}`, `   Puerta de enlace predeterminada : ${e.puerta}`];
      if (args[0]?.toLowerCase() === '/all') lineas.push(`   Dirección física (MAC). . . . . : ${e.mac}`, `   Servidores DNS. . . . . . . . . : ${e.dns}`, `   DHCP habilitado . . . . . . . . : ${e.dhcp ? 'sí' : 'no'}`);
      return lineas;
    },
    ping: (args) => {
      if (!args[0]) return ['Uso: ping <destino>   (por ejemplo: ping aldric.umbravel)'];
      const nodo = resolver(args[0]);
      if (!nodo) return [`La solicitud de ping no pudo encontrar el host ${args[0]}. Compruebe el nombre y vuelva a intentarlo.`];
      const eq = o.equipos[nodo];
      if (eq.capa2) return [`${eq.nombre} no tiene dirección IP: un switch trabaja con direcciones MAC dentro de la red local.`];
      const { nodos, aristas } = activas();
      const camino = ruta(nodos, aristas, o.origen, nodo);
      const lineas = [`Haciendo ping a ${args[0]} [${eq.ip}] con 32 bytes de datos:`];
      if (!camino) {
        for (let i = 0; i < 4; i++) lineas.push('Tiempo de espera agotado para esta solicitud.');
        lineas.push('', `Estadísticas de ping para ${eq.ip}:`, '    Paquetes: enviados = 4, recibidos = 0, perdidos = 4 (100% perdidos)');
        return lineas;
      }
      const base = tiempo(aristas, camino);
      const saltos = camino.filter((n) => !o.equipos[n]?.capa2).length - 1;
      for (let i = 0; i < 4; i++) lineas.push(`Respuesta desde ${eq.ip}: bytes=32 tiempo=${base + Math.floor(azar() * 3)}ms TTL=${64 - saltos}`);
      lineas.push('', `Estadísticas de ping para ${eq.ip}:`, '    Paquetes: enviados = 4, recibidos = 4, perdidos = 0 (0% perdidos)');
      return lineas;
    },
    tracert: (args) => {
      if (!args[0]) return ['Uso: tracert <destino>'];
      const nodo = resolver(args[0]);
      if (!nodo) return [`No se puede resolver el nombre del sistema de destino ${args[0]}.`];
      const eq = o.equipos[nodo];
      if (eq.capa2) return [`${eq.nombre} no tiene IP: tracert solo muestra los equipos que enrutan paquetes.`];
      const { nodos, aristas, todas } = activas();
      // si hay ruta se sigue; si no, se llega hasta el vecino del destino que aún responde
      // (mejor un router que un switch, que no aparece en tracert) y ahí se corta
      let camino = ruta(nodos, aristas, o.origen, nodo);
      if (!camino) {
        const vecinos = todas.filter((e) => e.a === nodo || e.b === nodo).map((e) => (e.a === nodo ? e.b : e.a));
        const llegan = vecinos.map((v) => ({ v, c: ruta(nodos, aristas, o.origen, v) })).filter((x) => x.c);
        llegan.sort((x, y) => (o.equipos[x.v]?.capa2 ? 1 : 0) - (o.equipos[y.v]?.capa2 ? 1 : 0) || x.c.length - y.c.length);
        camino = llegan.length ? [...llegan[0].c, nodo] : null;
      }
      const lineas = [`Traza a ${args[0]} [${eq.ip}] sobre un máximo de 30 saltos:`, ''];
      if (!camino) return [...lineas, '  1     *        *        *     Tiempo de espera agotado para esta solicitud.', '', 'Traza completa.'];
      let salto = 0, t = 0, roto = false;
      for (let i = 1; i < camino.length; i++) {
        if (!ruta(nodos, aristas, o.origen, camino[i])) { roto = true; break; }
        t += RETARDO[medio(todas, camino[i - 1], camino[i])] ?? 1;
        const e = o.equipos[camino[i]];
        if (e.capa2) continue; // los switches no aparecen en tracert
        salto++;
        lineas.push(`${String(salto).padStart(3)}  ${ms(t)}  ${ms(t + Math.floor(azar() * 2))}  ${ms(t)}  ${e.nombre} [${e.ip}]`);
      }
      if (roto) for (let k = 0; k < 3; k++) lineas.push(`${String(++salto).padStart(3)}     *        *        *     Tiempo de espera agotado para esta solicitud.`);
      lineas.push('', 'Traza completa.');
      return lineas;
    },
  };
  comandos.help = comandos.ayuda;

  // Devuelve { lineas, accion? } (accion: petición para el juego, como reparar un enlace)
  return function ejecutar(linea) {
    const [cmd, ...args] = linea.trim().split(/\s+/);
    if (!cmd) return { lineas: [] };
    const c = cmd.toLowerCase();
    if (c === 'reparar') {
      const [a, b] = (args[0] ?? '').toLowerCase().split('-');
      const na = resolver(a ?? ''), nb = resolver(b ?? '');
      if (!na || !nb) return { lineas: ['Uso: reparar <isla1>-<isla2>   (por ejemplo: reparar router-tenerife)'] };
      if (!o.red().cortadas.has(clave(na, nb))) return { lineas: [`El enlace ${na}-${nb} no está roto (o no existe). Usad tracert para ver dónde se corta la conexión.`] };
      return { lineas: [`Tendiendo de nuevo el enlace ${na}-${nb}…`], accion: { reparar: clave(na, nb) } };
    }
    if (!comandos[c]) return { lineas: [`"${cmd}" no se reconoce como un comando. Escribid "ayuda" para ver la lista.`] };
    return { lineas: comandos[c](args) };
  };
}
