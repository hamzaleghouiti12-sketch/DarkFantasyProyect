"""Corta la malla en rodajas horizontales y cuenta qué hay en cada una (para colocar el esqueleto)."""
import sys
import numpy as np
sys.path.insert(0, __file__.rsplit('\\', 1)[0].rsplit('/', 1)[0])
from glb_a_obj import leer_glb, accesor, recorrer

js, b = leer_glb(sys.argv[1])
mallas = []
for n in js['scenes'][0]['nodes']:
    recorrer(js, n, np.eye(4), mallas)
pts = []
for nm, m in mallas:
    for p in js['meshes'][nm]['primitives']:
        pos = accesor(js, b, p['attributes']['POSITION']).astype(float)
        pts.append((np.c_[pos, np.ones(len(pos))] @ m.T)[:, :3])
P = np.vstack(pts)
print('vértices', len(P))
for y0 in np.arange(-0.5, 0.5, 0.025):
    s = P[(P[:, 1] >= y0) & (P[:, 1] < y0 + 0.025)]
    if not len(s):
        continue
    # grupos a lo largo de x (huecos de más de 2 cm separan piezas: piernas, brazos, cuerpo)
    xs = np.sort(s[:, 0])
    cortes = np.where(np.diff(xs) > 0.02)[0]
    grupos = np.split(xs, cortes + 1)
    txt = '  '.join(f'[{g.min():+.3f},{g.max():+.3f}]' for g in grupos)
    print(f'y {y0:+.3f}: n={len(s):4d}  z[{s[:, 2].min():+.3f},{s[:, 2].max():+.3f}]  {txt}')
