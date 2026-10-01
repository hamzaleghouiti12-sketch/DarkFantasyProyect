// Direcciones IPv4 para las mecánicas «formulario» y «terminal» (PLAN_TECNICO.md, 9.6 y 9.7).
// Lógica pura: los mensajes de error son pedagógicos, no genéricos.

export function leerIp(texto) {
  const partes = String(texto ?? '').trim().split('.');
  if (partes.length !== 4 || partes.some((p) => !/^\d{1,3}$/.test(p))) return null;
  const n = partes.map(Number);
  return n.every((x) => x <= 255) ? n : null;
}
const aEntero = (ip) => ((ip[0] << 24) >>> 0) + (ip[1] << 16) + (ip[2] << 8) + ip[3];

// Máscara en formato decimal (255.255.255.0) o CIDR (/24 o 24) → prefijo (24), o null
export function leerMascara(texto) {
  const t = String(texto ?? '').trim();
  const cidr = t.match(/^\/?(\d{1,2})$/);
  if (cidr) return Number(cidr[1]) <= 32 ? Number(cidr[1]) : null;
  const ip = leerIp(t);
  if (!ip) return null;
  const bits = aEntero(ip).toString(2).padStart(32, '0');
  return /^1*0*$/.test(bits) ? bits.indexOf('0') === -1 ? 32 : bits.indexOf('0') : null;
}

export function esPrivada(ip) {
  return ip[0] === 10 || (ip[0] === 172 && ip[1] >= 16 && ip[1] <= 31) || (ip[0] === 192 && ip[1] === 168);
}

export function mismaSubred(a, b, prefijo) {
  const m = prefijo === 0 ? 0 : (0xffffffff << (32 - prefijo)) >>> 0;
  return ((aEntero(a) & m) >>> 0) === ((aEntero(b) & m) >>> 0);
}

// ¿Es la dirección de red (todo ceros en la parte de equipo) o la de difusión (todo unos)?
export function esRedODifusion(ip, prefijo) {
  const equipo = 32 - prefijo;
  if (equipo < 2) return false;
  const resto = aEntero(ip) & ((2 ** equipo) - 1);
  return resto === 0 || resto === 2 ** equipo - 1;
}

/**
 * Valida la configuración de un equipo en la red de un router.
 * @param {{ip, mascara, puerta, dns}} campos  lo que escribió el alumno
 * @param {{puerta: string, prefijo: number, ocupadas: string[]}} red
 * @returns {object} errores por campo ({} si todo está bien)
 */
export function validarEquipo(campos, red) {
  const errores = {};
  const ip = leerIp(campos.ip);
  const puertaRed = leerIp(red.puerta);
  const prefijo = leerMascara(campos.mascara);
  if (!ip) errores.ip = 'Una IPv4 son 4 números del 0 al 255 separados por puntos (por ejemplo, 192.168.20.25).';
  else if (!esPrivada(ip)) errores.ip = 'Esa IP es pública. Dentro de una red local se usan IP privadas: 10.x.x.x, 172.16-31.x.x o 192.168.x.x.';
  else if (!mismaSubred(ip, puertaRed, red.prefijo)) errores.ip = `Está fuera de la red del router (${red.puerta}/${red.prefijo}). Con máscara /24, los tres primeros números tienen que coincidir.`;
  else if (esRedODifusion(ip, red.prefijo)) errores.ip = 'Terminada en .0 es la dirección de la red y en .255 la de difusión: ningún equipo puede usarlas.';
  else if (campos.ip.trim() === red.puerta) errores.ip = 'Esa IP ya la tiene el router. Dos equipos con la misma IP chocarían.';
  else if (red.ocupadas.includes(campos.ip.trim())) errores.ip = 'Otro equipo ya usa esa IP. Cada equipo necesita una distinta.';
  if (prefijo === null) errores.mascara = 'La máscara se escribe como 255.255.255.0 (o /24).';
  else if (prefijo !== red.prefijo) errores.mascara = `La red del router usa la máscara /${red.prefijo} (255.255.255.0). Con otra máscara, el equipo no sabría quién está en su red.`;
  if (!leerIp(campos.puerta)) errores.puerta = 'La puerta de enlace también es una IP.';
  else if (campos.puerta.trim() !== red.puerta) errores.puerta = `La puerta de enlace es el router: por ahí salen los paquetes hacia otras redes (${red.puerta}).`;
  if (!leerIp(campos.dns)) errores.dns = 'El DNS es la IP del servidor que traduce nombres a IP (el router, o uno público como 1.1.1.1 u 8.8.8.8).';
  return errores;
}

// Faro Wi-Fi (opcional del Piso IV): nombre de red, seguridad y contraseña.
// Devuelve { campo: 'error pedagógico' }; vacío si todo está bien.
const CLAVES_DEBILES = ['password', 'contraseña', 'contrasena', '123456', 'qwerty', 'admin', 'wifi', 'faro'];
export function validarWifi(campos) {
  const errores = {};
  const ssid = String(campos.ssid ?? '').trim();
  if (!ssid) errores.ssid = 'La red necesita un nombre (SSID).';
  else if (ssid.length > 32) errores.ssid = 'El SSID admite como mucho 32 caracteres.';
  else if (/\d{6,}|calle|piso|\bbajo\b/i.test(ssid)) errores.ssid = 'Mejor un nombre que no dé pistas de quién sois ni de dónde vivís (ni teléfonos ni direcciones).';
  const seg = String(campos.seguridad ?? '').trim().toUpperCase().replace(/[\s-]+/g, '');
  if (!seg) errores.seguridad = 'Elegid un tipo de seguridad: WEP, WPA2, WPA3 o abierta.';
  else if (seg === 'ABIERTA' || seg === 'NINGUNA' || seg === 'OPEN') errores.seguridad = 'Una red abierta deja a cualquiera entrar y espiar el tráfico.';
  else if (seg.startsWith('WEP')) errores.seguridad = 'WEP se rompe en minutos: está obsoleto.';
  else if (seg.startsWith('WPA2')) errores.seguridad = 'WPA2 todavía se usa, pero el faro exige lo más seguro que hay hoy: WPA3.';
  else if (!seg.startsWith('WPA3')) errores.seguridad = 'No conozco ese tipo. Las opciones son WEP, WPA2, WPA3 o abierta.';
  const clave = String(campos.clave ?? '');
  const tipos = [/[a-zñ]/, /[A-ZÑ]/, /\d/, /[^A-Za-zÑñ\d]/].filter((r) => r.test(clave)).length;
  if (clave.length < 12) errores.clave = 'Demasiado corta: al menos 12 caracteres.';
  else if (CLAVES_DEBILES.some((d) => clave.toLowerCase().includes(d))) errores.clave = 'Contiene una palabra de las primeras que prueban los atacantes.';
  else if (tipos < 3) errores.clave = 'Mezclad al menos tres tipos: minúsculas, mayúsculas, números y símbolos.';
  else if (ssid && clave.toLowerCase().includes(ssid.toLowerCase())) errores.clave = 'La contraseña no debe contener el nombre de la red.';
  return errores;
}
