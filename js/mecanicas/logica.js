// Lógica pura de las mecánicas (sin Three.js ni DOM), para poder probarla con
// `node --test herramientas/pruebas`.

// Regla 3-2-1: recibe los receptáculos donde hay una copia y devuelve
// { ok, fallo } con fallo ∈ 'mismoDisco' | 'unTipo' | 'nadaFuera' | null.
export function comprobar321(ocupados) {
  const dispositivos = new Set(ocupados.map((r) => r.dispositivo));
  if (dispositivos.size < 3) return { ok: false, fallo: 'mismoDisco' };
  if (new Set(ocupados.map((r) => r.tipo)).size < 2) return { ok: false, fallo: 'unTipo' };
  if (!ocupados.some((r) => r.fuera)) return { ok: false, fallo: 'nadaFuera' };
  return { ok: true, fallo: null };
}

// "3.500", "3500", "931,3", " 931.32 GiB" → número. Acepta punto de miles y coma decimal.
export function leerNumero(texto) {
  let s = String(texto).trim().replace(/\s+/g, '').replace(/[a-zA-Z/]+$/, '');
  if (!s) return NaN;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.'); // 1.024,5 → 1024.5
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, ''); // 3.500 → 3500
  return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : NaN;
}

// Corrige una respuesta según el tipo de pregunta (ver apéndice B.1 del plan técnico).
export function corregir(q, respuesta) {
  switch (q.tipo ?? 'opcion') {
    case 'opcion': return respuesta === q.correcta;
    case 'vf': return respuesta === q.correcta;
    case 'numero': {
      const n = leerNumero(respuesta);
      return Number.isFinite(n) && Math.abs(n - q.valor) <= (q.tolerancia ?? 0) + 1e-9;
    }
    case 'texto': return (q.aceptadas ?? []).some((a) => normalizar(a) === normalizar(respuesta));
    // en las de ordenar, las opciones ya vienen en el orden correcto
    case 'orden': return Array.isArray(respuesta) && respuesta.length === q.opciones.length && respuesta.every((v, i) => v === i);
    default: return false;
  }
}

// Serie de encargos del altar: tras un fallo se pasa al siguiente encargo y la racha vuelve a 0.
export function siguienteEncargo(estado, acierto, total, necesarios) {
  const racha = acierto ? estado.racha + 1 : 0;
  return { racha, encargo: (estado.encargo + 1) % total, completo: racha >= necesarios };
}

// minúsculas, sin tildes y sin espacios sobrantes (para respuestas escritas)
export function normalizar(t) {
  return String(t ?? '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/\s+/g, ' ').trim();
}

// Palancas: bits de más a menos significativo (bits[0] vale 128) → sus lecturas
export function leerBits(bits) {
  const sinSigno = bits.reduce((n, b) => n * 2 + (b ? 1 : 0), 0);
  const conSigno = bits[0] ? sinSigno - 2 ** bits.length : sinSigno;
  const hex = '0x' + sinSigno.toString(16).toUpperCase().padStart(Math.ceil(bits.length / 4), '0');
  return { sinSigno, conSigno, hex, binario: bits.map((b) => (b ? 1 : 0)).join('') };
}
// un objetivo negativo se lee en complemento a 2; uno positivo, sin signo
export const cumpleObjetivo = (bits, objetivo) => {
  const v = leerBits(bits);
  return objetivo < 0 ? v.conSigno === objetivo : v.sinSigno === objetivo;
};
