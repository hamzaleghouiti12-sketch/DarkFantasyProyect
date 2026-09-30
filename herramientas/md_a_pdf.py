"""Convierte los documentos Markdown de ContextWindow/ a PDF (A4) con PyMuPDF.

Soporta lo que usan nuestros documentos: títulos, párrafos, negrita, código
en línea, bloques de código, tablas, listas (con y sin número, anidadas un
nivel) y reglas horizontales. No necesita la librería markdown.

Uso:  python herramientas/md_a_pdf.py ContextWindow/PLAN_TECNICO.md [ContextWindow/GUIA_PISOS.md …]
"""
import html
import re
import sys
from pathlib import Path

import pymupdf

CSS = """
* { font-family: sans-serif; }
body { font-size: 10pt; line-height: 1.35; color: #1d1a22; }
h1 { font-size: 19pt; color: #5a3d8a; margin: 0 0 8pt 0; }
h2 { font-size: 14pt; color: #5a3d8a; margin: 14pt 0 5pt 0; border-bottom: 1px solid #c9b8e6; }
h3 { font-size: 11.5pt; color: #3d2a60; margin: 10pt 0 4pt 0; }
h4 { font-size: 10.5pt; margin: 8pt 0 3pt 0; }
p { margin: 0 0 5pt 0; }
ul, ol { margin: 0 0 5pt 0; }
li { margin: 0 0 2pt 0; }
code { font-family: monospace; font-size: 8.8pt; background-color: #f1ecf8; }
pre { font-family: monospace; font-size: 8pt; background-color: #f4f1f8; padding: 5pt; margin: 3pt 0 6pt 0; }
table { border-collapse: collapse; margin: 3pt 0 7pt 0; width: 100%; }
th { background-color: #e7ddf5; font-size: 8.8pt; text-align: left; padding: 2pt 3pt; border: 1px solid #b9a8d6; }
td { font-size: 8.8pt; padding: 2pt 3pt; border: 1px solid #cfc4e2; vertical-align: top; }
hr { border: 0; border-top: 1px solid #c9b8e6; margin: 6pt 0; }
"""


def en_linea(texto):
    t = html.escape(texto, quote=False)
    t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', t)
    t = re.sub(r'(?<![\w*])\*([^*\n]+)\*(?![\w*])', r'<i>\1</i>', t)
    return t


def md_a_html(md):
    lineas = md.split('\n')
    salida, i = [], 0
    while i < len(lineas):
        ln = lineas[i]
        if ln.startswith('```'):
            bloque = []
            i += 1
            while i < len(lineas) and not lineas[i].startswith('```'):
                bloque.append(html.escape(lineas[i], quote=False))
                i += 1
            salida.append('<pre>' + '\n'.join(bloque) + '</pre>')
            i += 1
            continue
        m = re.match(r'^(#{1,4}) (.*)', ln)
        if m:
            n = len(m.group(1))
            salida.append(f'<h{n}>{en_linea(m.group(2))}</h{n}>')
            i += 1
            continue
        if ln.strip() == '---':
            salida.append('<hr/>')
            i += 1
            continue
        if ln.startswith('|'):
            filas = []
            while i < len(lineas) and lineas[i].startswith('|'):
                filas.append(lineas[i])
                i += 1
            celdas = [[c.strip() for c in f.strip().strip('|').split('|')] for f in filas]
            cab, cuerpo = celdas[0], [c for c in celdas[1:] if not re.match(r'^:?-{2,}', c[0] or '-')]
            t = '<table><tr>' + ''.join(f'<th>{en_linea(c)}</th>' for c in cab) + '</tr>'
            for fila in cuerpo:
                t += '<tr>' + ''.join(f'<td>{en_linea(c)}</td>' for c in fila) + '</tr>'
            salida.append(t + '</table>')
            continue
        if re.match(r'^\s*([-*]|\d+\.) ', ln):
            items = []
            while i < len(lineas) and re.match(r'^\s*([-*]|\d+\.) ', lineas[i]):
                m = re.match(r'^(\s*)([-*]|\d+\.) (.*)', lineas[i])
                items.append((len(m.group(1)), m.group(2)[0].isdigit(), m.group(3)))
                i += 1
            ordenada = items[0][1]
            t = '<ol>' if ordenada else '<ul>'
            dentro = False
            for sangria, _, texto in items:
                if sangria >= 2 and not dentro:
                    t += '<ul>'
                    dentro = True
                elif sangria < 2 and dentro:
                    t += '</ul>'
                    dentro = False
                t += f'<li>{en_linea(texto)}</li>'
            t += ('</ul>' if dentro else '') + ('</ol>' if ordenada else '</ul>')
            salida.append(t)
            continue
        if ln.strip():
            parrafo = [ln]
            i += 1
            while i < len(lineas) and lineas[i].strip() and not re.match(r'^(#|```|\||\s*([-*]|\d+\.) |---$)', lineas[i]):
                parrafo.append(lineas[i])
                i += 1
            salida.append('<p>' + en_linea(' '.join(parrafo)) + '</p>')
            continue
        i += 1
    return '<body>' + '\n'.join(salida) + '</body>'


def convertir(ruta_md):
    ruta_md = Path(ruta_md)
    ruta_pdf = ruta_md.with_suffix('.pdf')
    historia = pymupdf.Story(html=md_a_html(ruta_md.read_text(encoding='utf-8')), user_css=CSS)
    escritor = pymupdf.DocumentWriter(str(ruta_pdf))
    pagina = pymupdf.paper_rect('a4')
    zona = pagina + (50, 50, -50, -55)
    paginas, mas = 0, True
    while mas:
        dispositivo = escritor.begin_page(pagina)
        mas, _ = historia.place(zona)
        historia.draw(dispositivo)
        escritor.end_page()
        paginas += 1
    escritor.close()
    # numerar páginas
    doc = pymupdf.open(str(ruta_pdf))
    for n, p in enumerate(doc, 1):
        p.insert_text((pagina.width / 2 - 20, pagina.height - 28), f'{n} / {len(doc)}', fontsize=8, color=(0.45, 0.4, 0.55))
    doc.saveIncr()
    print(f'{ruta_pdf}: {paginas} páginas')


if __name__ == '__main__':
    for r in sys.argv[1:] or ['ContextWindow/PLAN_TECNICO.md', 'ContextWindow/GUIA_PISOS.md']:
        convertir(r)
