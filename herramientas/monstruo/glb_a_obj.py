"""GLB (glTF binario) -> OBJ + MTL + textura PNG, sin dependencias extra (solo numpy).

Lee los fragmentos JSON y BIN del GLB, saca posiciones, normales, UV e índices de cada
primitiva (aplicando la matriz de su nodo) y la textura base, y lo escribe en formato OBJ.
También imprime las medidas del modelo (sirven para escalarlo y montarle el esqueleto).

Uso: python glb_a_obj.py modelo.glb salida.obj
"""
import json, struct, sys
from pathlib import Path
import numpy as np

TIPOS = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
COMPS = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


def leer_glb(ruta):
    b = Path(ruta).read_bytes()
    magia, version, _ = struct.unpack_from('<4sII', b, 0)
    assert magia == b'glTF' and version == 2, 'no es un GLB v2'
    i, js, binario = 12, None, None
    while i < len(b):
        largo, tipo = struct.unpack_from('<II', b, i)
        trozo = b[i + 8:i + 8 + largo]
        if tipo == 0x4E4F534A: js = json.loads(trozo)
        elif tipo == 0x004E4942: binario = trozo
        i += 8 + largo
    return js, binario


def accesor(js, binario, n):
    a = js['accessors'][n]
    v = js['bufferViews'][a['bufferView']]
    tipo, comps = TIPOS[a['componentType']], COMPS[a['type']]
    inicio = v.get('byteOffset', 0) + a.get('byteOffset', 0)
    paso = v.get('byteStride')
    tam = np.dtype(tipo).itemsize * comps
    if paso and paso != tam:  # datos intercalados
        filas = [np.frombuffer(binario, tipo, comps, inicio + k * paso) for k in range(a['count'])]
        datos = np.array(filas)
    else:
        datos = np.frombuffer(binario, tipo, a['count'] * comps, inicio).reshape(a['count'], comps)
    if a.get('normalized') and tipo != np.float32:
        datos = datos.astype(np.float32) / np.iinfo(tipo).max
    return datos


def matriz_nodo(nodo):
    if 'matrix' in nodo:
        return np.array(nodo['matrix'], dtype=np.float64).reshape(4, 4).T
    t = np.array(nodo.get('translation', [0, 0, 0]), dtype=np.float64)
    x, y, z, w = nodo.get('rotation', [0, 0, 0, 1])
    r = np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                  [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                  [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
    s = np.array(nodo.get('scale', [1, 1, 1]), dtype=np.float64)
    m = np.eye(4)
    m[:3, :3] = r * s
    m[:3, 3] = t
    return m


def recorrer(js, n, padre, salida):
    nodo = js['nodes'][n]
    m = padre @ matriz_nodo(nodo)
    if 'mesh' in nodo:
        salida.append((nodo['mesh'], m))
    for h in nodo.get('children', []):
        recorrer(js, h, m, salida)


def main():
    glb, obj = Path(sys.argv[1]), Path(sys.argv[2])
    js, binario = leer_glb(glb)
    escena = js['scenes'][js.get('scene', 0)]
    mallas = []
    for n in escena['nodes']:
        recorrer(js, n, np.eye(4), mallas)

    # textura base (la primera imagen incrustada)
    textura = None
    if js.get('images'):
        im = js['images'][0]
        v = js['bufferViews'][im['bufferView']]
        ext = '.png' if 'png' in im.get('mimeType', 'png') else '.jpg'
        textura = obj.with_suffix(ext).name
        (obj.parent / textura).write_bytes(binario[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']])

    lineas = [f'# Convertido de {glb.name} con glb_a_obj.py', f'mtllib {obj.with_suffix(".mtl").name}', 'usemtl piel']
    base = 1
    todas = []
    for nmalla, m in mallas:
        for prim in js['meshes'][nmalla]['primitives']:
            at = prim['attributes']
            pos = accesor(js, binario, at['POSITION']).astype(np.float64)
            pos = (np.c_[pos, np.ones(len(pos))] @ m.T)[:, :3]
            todas.append(pos)
            nor = accesor(js, binario, at['NORMAL']).astype(np.float64) @ m[:3, :3].T if 'NORMAL' in at else None
            uv = accesor(js, binario, at['TEXCOORD_0']) if 'TEXCOORD_0' in at else None
            idx = accesor(js, binario, prim['indices']).reshape(-1) if 'indices' in prim else np.arange(len(pos))
            lineas += [f'v {x:.5f} {y:.5f} {z:.5f}' for x, y, z in pos]
            if uv is not None: lineas += [f'vt {u:.5f} {1 - v:.5f}' for u, v in uv]  # glTF tiene la V invertida
            if nor is not None: lineas += [f'vn {x:.4f} {y:.4f} {z:.4f}' for x, y, z in nor]
            for a, b_, c in idx.reshape(-1, 3) + base:
                if uv is not None and nor is not None: lineas.append(f'f {a}/{a}/{a} {b_}/{b_}/{b_} {c}/{c}/{c}')
                elif uv is not None: lineas.append(f'f {a}/{a} {b_}/{b_} {c}/{c}')
                else: lineas.append(f'f {a} {b_} {c}')
            base += len(pos)
    obj.write_text('\n'.join(lineas) + '\n', encoding='utf-8')
    mtl = ['newmtl piel', 'Ka 1 1 1', 'Kd 1 1 1', 'Ks 0 0 0', 'd 1', 'illum 1']
    if textura: mtl.append(f'map_Kd {textura}')
    obj.with_suffix('.mtl').write_text('\n'.join(mtl) + '\n', encoding='utf-8')

    p = np.vstack(todas)
    mn, mx = p.min(0), p.max(0)
    print(f'{base - 1} vértices, {sum(1 for l in lineas if l.startswith("f "))} caras, textura: {textura}')
    print('caja (x, y, z): min', np.round(mn, 3), 'max', np.round(mx, 3), 'tamaño', np.round(mx - mn, 3))


if __name__ == '__main__':
    main()
