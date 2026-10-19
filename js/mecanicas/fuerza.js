// Cuánto tardaría un ordenador en adivinar una contraseña (estimación didáctica).
// Supone un ataque sin conexión de 10 000 millones de intentos por segundo y que el
// atacante prueba primero lo fácil: las contraseñas más usadas, palabras del diccionario
// y palabra + número. Solo si no encaja en nada de eso, toca la fuerza bruta.
export const INTENTOS_POR_SEGUNDO = 1e10;

const MAS_USADAS = ['123456', '123456789', '12345678', '12345', '1234', '111111', 'password', 'qwerty', 'abc123', 'contraseña', 'contrasena', 'iloveyou', 'admin', '000000', 'hola', 'hola123', 'tequiero'];
const DICCIONARIO = 1e6; // palabras y nombres que prueban los atacantes

export function intentosNecesarios(clave) {
  const c = String(clave);
  if (!c) return 1;
  if (MAS_USADAS.includes(c.toLowerCase())) return 1;
  const letras = /^[a-záéíóúüñ]+$/i;
  if (letras.test(c) && c.length <= 14) return DICCIONARIO * 2; // en minúsculas o con mayúscula inicial
  const m = c.match(/^([a-záéíóúüñ]+)(\d{1,4})$/i);
  if (m && m[1].length <= 14) return DICCIONARIO * 2 * 10 ** m[2].length;
  if (/^\d+$/.test(c)) return 10 ** c.length;
  let juego = 0;
  if (/[a-zñ]/.test(c)) juego += 26;
  if (/[A-ZÑ]/.test(c)) juego += 26;
  if (/\d/.test(c)) juego += 10;
  if (/[^a-zA-ZñÑ\d]/.test(c)) juego += 33;
  return juego ** c.length;
}

export function segundosParaAdivinar(clave) {
  return intentosNecesarios(clave) / INTENTOS_POR_SEGUNDO;
}

const EDAD_UNIVERSO = 4.35e17; // segundos
export function tiempoLegible(seg) {
  if (seg < 0.001) return 'al instante';
  if (seg < 1) return 'en menos de un segundo';
  const unidades = [['año', 31557600], ['día', 86400], ['hora', 3600], ['minuto', 60], ['segundo', 1]];
  if (seg > EDAD_UNIVERSO) return 'en más tiempo que la edad del universo';
  for (const [nombre, s] of unidades) {
    if (seg >= s) {
      const n = Math.round(seg / s);
      if (nombre === 'año' && n >= 1e6) {
        const millones = n / 1e6;
        const txt = millones >= 1e6 ? `${(millones / 1e6).toLocaleString('es-ES', { maximumFractionDigits: 0 })} billones` : `${millones.toLocaleString('es-ES', { maximumFractionDigits: 0 })} millones`;
        return `en unos ${txt} de años`;
      }
      return n === 1 ? `en 1 ${nombre}` : `en unos ${n.toLocaleString('es-ES')} ${nombre}s`;
    }
  }
  return 'al instante';
}

export const tiempoDeCrackeo = (clave) => tiempoLegible(segundosParaAdivinar(clave));
