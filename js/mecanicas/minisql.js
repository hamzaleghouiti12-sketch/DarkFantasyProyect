// Un SQL de juguete para el Piso XIII (sin sql.js): SELECT con JOIN y WHERE, y UPDATE.
// Módulo puro: se prueba con Node. Los errores se explican en castellano.
//
//   SELECT cols | * FROM t [JOIN t2 ON a = b] [WHERE cond [AND cond…]]
//   UPDATE t SET col = valor [, col = valor…] [WHERE cond [AND cond…]]
//   cond: columna op (valor | columna) con op en = != <> < > <= >=; texto entre 'comillas'
// tablas: { nombre: { columnas: [...], filas: [{...}] } }  (UPDATE las modifica)

const PALABRAS = new Set(['SELECT', 'FROM', 'WHERE', 'AND', 'JOIN', 'ON', 'UPDATE', 'SET', 'INNER']);

function tokens(sql) {
  const res = [];
  const re = /\s*(?:('(?:[^']|'')*')|(\d+(?:\.\d+)?)|([A-Za-zÁÉÍÓÚÑáéíóúñ_][\wÁÉÍÓÚÑáéíóúñ.]*)|(<=|>=|<>|!=|=|<|>|,|\*|;))/y;
  let m;
  re.lastIndex = 0;
  while (re.lastIndex < sql.length) {
    const ini = re.lastIndex;
    m = re.exec(sql);
    if (!m) {
      if (/^\s*$/.test(sql.slice(ini))) break;
      throw new Error(`No entiendo lo que hay cerca de «${sql.slice(ini, ini + 12).trim()}».`);
    }
    if (m[1] !== undefined) res.push({ t: 'texto', v: m[1].slice(1, -1).replace(/''/g, "'") });
    else if (m[2] !== undefined) res.push({ t: 'num', v: Number(m[2]) });
    else if (m[3] !== undefined) {
      const up = m[3].toUpperCase();
      res.push(PALABRAS.has(up) ? { t: 'kw', v: up } : { t: 'id', v: m[3] });
    } else res.push({ t: 'op', v: m[4] });
  }
  return res.filter((x) => !(x.t === 'op' && x.v === ';'));
}

export function ejecutarSQL(sql, tablas) {
  try {
    const tk = tokens(sql);
    let i = 0;
    const ver = () => tk[i];
    const es = (t, v) => tk[i] && tk[i].t === t && (v === undefined || tk[i].v === v);
    const pedir = (t, v, msg) => { if (!es(t, v)) throw new Error(msg); return tk[i++]; };
    const tabla = (nombre) => {
      const tb = Object.keys(tablas).find((k) => k.toLowerCase() === String(nombre).toLowerCase());
      if (!tb) throw new Error(`No existe la tabla «${nombre}». Tablas: ${Object.keys(tablas).join(', ')}.`);
      return tb;
    };
    const valorDe = (fila, tok) => {
      if (tok.t !== 'id') return tok.v;
      const k = Object.keys(fila).find((c) => c.toLowerCase() === tok.v.toLowerCase());
      if (k === undefined) throw new Error(`No existe la columna «${tok.v}».`);
      return fila[k];
    };
    const comparar = (a, op, b) => {
      if (typeof a === 'string' && typeof b === 'string') { a = a.toLowerCase(); b = b.toLowerCase(); }
      switch (op) {
        case '=': return a === b;
        case '!=': case '<>': return a !== b;
        case '<': return a < b;
        case '>': return a > b;
        case '<=': return a <= b;
        case '>=': return a >= b;
        default: throw new Error(`Operador desconocido: ${op}`);
      }
    };
    function condiciones() {
      const conds = [];
      do {
        const a = ver(); i++;
        if (!a || (a.t !== 'id' && a.t !== 'num' && a.t !== 'texto')) throw new Error('Después de WHERE va una condición, por ejemplo: nombre = \'Aldric\'.');
        const op = pedir('op', undefined, 'Falta el operador de la condición (=, <, >…).').v;
        const b = ver(); i++;
        if (!b || !['id', 'num', 'texto'].includes(b.t)) throw new Error('A la condición le falta el valor. ¿Has puesto el texto entre comillas simples?');
        conds.push([a, op, b]);
      } while (es('kw', 'AND') && ++i);
      return (fila) => conds.every(([a, op, b]) => comparar(valorDe(fila, a), op, valorDe(fila, b)));
    }
    // filas de una tabla con columnas también calificadas (tabla.columna)
    const filasDe = (t) => tablas[t].filas.map((f) => ({ ...f, ...Object.fromEntries(Object.entries(f).map(([k, v]) => [`${t}.${k}`, v])) }));

    if (es('kw', 'SELECT')) {
      i++;
      const cols = [];
      if (es('op', '*')) { i++; cols.push('*'); } else {
        do { cols.push(pedir('id', undefined, 'Tras SELECT van las columnas (o *).').v); } while (es('op', ',') && ++i);
      }
      pedir('kw', 'FROM', 'Falta FROM y el nombre de la tabla.');
      const t1 = tabla(pedir('id', undefined, 'Tras FROM va el nombre de la tabla.').v);
      let filas = filasDe(t1), colsTodas = [...tablas[t1].columnas];
      if (es('kw', 'INNER')) i++;
      if (es('kw', 'JOIN')) {
        i++;
        const t2 = tabla(pedir('id', undefined, 'Tras JOIN va el nombre de la otra tabla.').v);
        pedir('kw', 'ON', 'El JOIN necesita ON: qué columnas unen las dos tablas.');
        const a = pedir('id', undefined, 'Tras ON va una columna.'); pedir('op', '=', 'El JOIN se une con =.'); const b = pedir('id', undefined, 'Falta la segunda columna del ON.');
        const otras = filasDe(t2);
        const unidas = [];
        for (const f of filas) for (const g of otras) {
          const fila = { ...g, ...f };
          for (const [k, v] of Object.entries(g)) if (k.includes('.')) fila[k] = v;
          if (valorDe(fila, a) === valorDe(fila, b)) unidas.push(fila);
        }
        filas = unidas;
        colsTodas = [...colsTodas, ...tablas[t2].columnas.filter((c) => !colsTodas.includes(c))];
      }
      if (es('kw', 'WHERE')) { i++; const f = condiciones(); filas = filas.filter(f); }
      if (i < tk.length) throw new Error(`Sobra algo al final: «${tk[i].v}».`);
      const columnas = cols[0] === '*' ? colsTodas : cols;
      return { ok: true, tipo: 'select', columnas, filas: filas.map((f) => Object.fromEntries(columnas.map((c) => [c, valorDe(f, { t: 'id', v: c })]))) };
    }
    if (es('kw', 'UPDATE')) {
      i++;
      const t = tabla(pedir('id', undefined, 'Tras UPDATE va el nombre de la tabla.').v);
      pedir('kw', 'SET', 'Falta SET: qué columna cambia y a qué valor.');
      const cambios = [];
      do {
        const c = pedir('id', undefined, 'Tras SET va una columna.').v;
        pedir('op', '=', 'En SET se usa =.');
        const v = ver(); i++;
        if (!v || (v.t !== 'num' && v.t !== 'texto')) throw new Error('El nuevo valor tiene que ser un número o un texto entre comillas simples.');
        if (!tablas[t].columnas.some((x) => x.toLowerCase() === c.toLowerCase())) throw new Error(`No existe la columna «${c}».`);
        cambios.push([tablas[t].columnas.find((x) => x.toLowerCase() === c.toLowerCase()), v.v]);
      } while (es('op', ',') && ++i);
      let filtro = () => true;
      if (es('kw', 'WHERE')) { i++; filtro = condiciones(); }
      if (i < tk.length) throw new Error(`Sobra algo al final: «${tk[i].v}».`);
      let n = 0;
      for (const f of tablas[t].filas) if (filtro(f)) { for (const [c, v] of cambios) f[c] = v; n++; }
      return { ok: true, tipo: 'update', cambiadas: n };
    }
    throw new Error('La consulta tiene que empezar por SELECT o por UPDATE.');
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
