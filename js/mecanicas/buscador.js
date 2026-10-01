// Buscador del bibliotecario (Piso VII): un buscador de verdad sobre un índice local.
// Entiende "frases exactas", -palabra, site:dominio y filetype:tipo. Lógica pura.

const VACIAS = new Set(['de', 'la', 'el', 'las', 'los', 'y', 'e', 'en', 'a', 'que', 'un', 'una', 'por', 'con', 'del', 'al', 'sobre', 'para', 'se', 'su', 'lo', 'o']);
export const normalizar = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
const palabrasDe = (t) => normalizar(t).split(/[^a-z0-9ñ]+/).filter(Boolean);

export function leerConsulta(q) {
  const c = { frases: [], palabras: [], excluidas: [], site: null, filetype: null };
  const texto = normalizar(q).replace(/"([^"]*)"/g, (_, f) => { if (f.trim()) c.frases.push(f.trim()); return ' '; });
  for (const t of texto.split(/\s+/).filter(Boolean)) {
    if (t.startsWith('site:')) c.site = t.slice(5) || null;
    else if (t.startsWith('filetype:')) c.filetype = t.slice(9).replace(/^\./, '') || null;
    else if (t.startsWith('-') && t.length > 1) c.excluidas.push(...palabrasDe(t.slice(1)));
    else c.palabras.push(...palabrasDe(t).filter((p) => !VACIAS.has(p)));
  }
  return c;
}

const cuenta = (lista, p) => lista.filter((x) => x === p).length;

// Devuelve los documentos que cumplen la consulta, del más al menos relevante
export function buscar(indice, consulta) {
  const c = typeof consulta === 'string' ? leerConsulta(consulta) : consulta;
  const buscadas = [...c.palabras, ...c.frases.flatMap((f) => palabrasDe(f).filter((p) => !VACIAS.has(p)))];
  const res = [];
  indice.forEach((d, orden) => {
    const titulo = palabrasDe(d.titulo), texto = palabrasDe(d.texto), url = palabrasDe(d.url);
    const todo = normalizar(`${d.titulo} ${d.texto}`);
    const dominio = normalizar(d.url).split('/')[0];
    if (c.site && dominio !== c.site && !dominio.endsWith(`.${c.site}`)) return;
    if (c.filetype && !normalizar(d.url).endsWith(`.${c.filetype}`)) return;
    if (c.frases.some((f) => !todo.includes(f))) return;
    if (c.excluidas.some((p) => titulo.includes(p) || texto.includes(p) || url.includes(p))) return;
    let puntos = 0;
    for (const p of buscadas) puntos += cuenta(titulo, p) * 3 + cuenta(texto, p) + cuenta(url, p);
    if (!buscadas.length) puntos = 1; // solo operadores: todo lo que los cumple vale
    if (puntos > 0) res.push({ d, puntos, orden });
  });
  res.sort((a, b) => b.puntos - a.puntos || a.orden - b.orden);
  return res.map((r) => r.d);
}
