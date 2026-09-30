// Mecánica «editorWeb» (PLAN_TECNICO.md, 9.8): comprobar el HTML y el CSS de
// los alumnos SIN ejecutarlos. El CSS, los colores y el contraste son lógica
// pura (se prueban con node); el HTML llega ya analizado (DOMParser en el navegador).

// ---------- CSS ----------
// Analizador sencillo: reglas con su selector, sus declaraciones y su @media (si la tiene).
export function leerCss(css) {
  const reglas = [];
  const limpio = String(css ?? '').replace(/\/\*[\s\S]*?\*\//g, '');
  let i = 0;
  const bloque = (media) => {
    while (i < limpio.length) {
      const abre = limpio.indexOf('{', i), cierra = limpio.indexOf('}', i);
      if (cierra !== -1 && (abre === -1 || cierra < abre)) { i = cierra + 1; return; } // fin de un @media
      if (abre === -1) return;
      const cabecera = limpio.slice(i, abre).trim();
      i = abre + 1;
      if (cabecera.startsWith('@media')) { bloque(cabecera); continue; }
      const fin = limpio.indexOf('}', i);
      if (fin === -1) return;
      const decl = {};
      for (const d of limpio.slice(i, fin).split(';')) {
        const k = d.indexOf(':');
        if (k > 0) decl[d.slice(0, k).trim().toLowerCase()] = d.slice(k + 1).trim().toLowerCase();
      }
      reglas.push({ selector: cabecera.toLowerCase(), media, decl });
      i = fin + 1;
    }
  };
  bloque(null);
  return reglas;
}
export const contarPropiedades = (reglas) => reglas.reduce((n, r) => n + Object.keys(r.decl).length, 0);

// ---------- Colores y contraste (WCAG) ----------
const NOMBRES = { black: '#000000', white: '#ffffff', gray: '#808080', grey: '#808080', silver: '#c0c0c0', red: '#ff0000', gold: '#ffd700', yellow: '#ffff00', navy: '#000080', blue: '#0000ff', green: '#008000', purple: '#800080', orange: '#ffa500', darkred: '#8b0000', darkblue: '#00008b', beige: '#f5f5dc', ivory: '#fffff0', maroon: '#800000', brown: '#a52a2a' };
export function leerColor(texto) {
  let t = String(texto ?? '').trim().toLowerCase().split(/\s+/).find((p) => /^#|^rgb|^[a-z]+$/.test(p)) ?? '';
  t = NOMBRES[t] ?? t;
  let m = t.match(/^#([0-9a-f]{3})$/);
  if (m) return m[1].split('').map((c) => parseInt(c + c, 16));
  m = t.match(/^#([0-9a-f]{6})$/);
  if (m) return [0, 2, 4].map((k) => parseInt(m[1].slice(k, k + 2), 16));
  m = String(texto).match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (m) return [m[1], m[2], m[3]].map(Number);
  return null;
}
const luminancia = (rgb) => {
  const [r, g, b] = rgb.map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export function contraste(a, b) {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
// contraste del texto del body (por defecto, negro sobre blanco)
export function contrasteDelCuerpo(reglas) {
  let texto = [0, 0, 0], fondo = [255, 255, 255];
  for (const r of reglas) {
    if (r.media || !r.selector.split(',').map((s) => s.trim()).some((s) => s === 'body' || s === 'html')) continue;
    if (r.decl.color) texto = leerColor(r.decl.color) ?? texto;
    const f = r.decl['background-color'] ?? r.decl.background;
    if (f) fondo = leerColor(f) ?? fondo;
  }
  return contraste(texto, fondo);
}

// ---------- Comprobaciones de cada sello ----------
const txt = (el) => (el?.textContent ?? '').trim();
const VAGOS = ['haz clic aqui', 'clic aqui', 'click aqui', 'pulsa aqui', 'pincha aqui', 'aqui', 'aquí', 'haz clic aquí', 'clic aquí', 'pulsa aquí', 'pincha aquí', 'click here', 'mas', 'más', 'leer mas', 'leer más'];

// Sello 1: el cartel. Devuelve [{ texto, ok }] para la lista de la derecha.
export function comprobarCartel(doc, css, imagenes) {
  const reglas = leerCss(css);
  const imgs = [...doc.querySelectorAll('img')];
  return [
    { texto: 'Un único título principal <h1> con texto', ok: doc.querySelectorAll('h1').length === 1 && Boolean(txt(doc.querySelector('h1'))) },
    { texto: 'Al menos un párrafo <p>', ok: [...doc.querySelectorAll('p')].some((p) => txt(p)) },
    { texto: `Una imagen (${imagenes.join(', ')}) con su alt`, ok: imgs.some((i) => imagenes.includes(i.getAttribute('src')) && (i.getAttribute('alt') ?? '').trim()) },
    { texto: 'Una lista <ul> con 3 elementos <li> o más', ok: [...doc.querySelectorAll('ul')].some((u) => u.querySelectorAll('li').length >= 3) },
    { texto: 'Un enlace <a> con href', ok: [...doc.querySelectorAll('a')].some((a) => (a.getAttribute('href') ?? '').trim() && txt(a)) },
    { texto: 'Al menos 3 propiedades de CSS', ok: contarPropiedades(reglas) >= 3 },
  ];
}

// Sello 2: responsive (además de todo lo del cartel)
export function comprobarResponsive(doc, css, imagenes) {
  const reglas = leerCss(css);
  const media = reglas.some((r) => r.media && /max-width\s*:/.test(r.media));
  const img = reglas.some((r) => r.selector.split(',').some((s) => /\bimg\b/.test(s)) && r.decl['max-width'] === '100%')
    || [...doc.querySelectorAll('img')].some((i) => /max-width\s*:\s*100%/.test(i.getAttribute('style') ?? ''));
  return [
    ...comprobarCartel(doc, css, imagenes).map((c) => ({ ...c, texto: `Cartel: ${c.texto.charAt(0).toLowerCase()}${c.texto.slice(1)}` })).filter((c) => !c.ok),
    { texto: 'Una regla @media (max-width: …) para pantallas estrechas', ok: media },
    { texto: 'La imagen nunca más ancha que la pantalla (max-width: 100%)', ok: img },
  ];
}

// Sello 3: los cinco fallos de accesibilidad del cartel de Morvath
export function comprobarAccesibilidad(doc, css) {
  const reglas = leerCss(css);
  const niveles = [...doc.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((h) => Number(h.tagName[1]));
  const ordenados = niveles.length > 0 && niveles[0] === 1 && niveles.every((n, k) => k === 0 || n <= niveles[k - 1] + 1);
  const ratio = contrasteDelCuerpo(reglas);
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[.!¡]/g, '').trim();
  return [
    { texto: 'La página indica su idioma (<html lang="es">)', ok: Boolean((doc.documentElement.getAttribute('lang') ?? '').trim()) },
    { texto: 'Todas las imágenes tienen un alt que las describe', ok: [...doc.querySelectorAll('img')].every((i) => (i.getAttribute('alt') ?? '').trim().length >= 3) },
    { texto: `Contraste del texto de al menos 4,5:1 (ahora ${ratio.toFixed(1).replace('.', ',')}:1)`, ok: ratio >= 4.5 },
    { texto: 'Los títulos van en orden, sin saltos (h1 → h2 → h3)', ok: ordenados },
    { texto: 'Los enlaces dicen adónde llevan (nada de «haz clic aquí»)', ok: [...doc.querySelectorAll('a')].every((a) => txt(a) && !VAGOS.map(norm).includes(norm(txt(a)))) },
  ];
}
