"""Monta el esqueleto y las animaciones del monstruo y escribe un GLB listo para el juego.

Entrada: el GLB que devolvió TRELLIS (una sola malla con textura, sin huesos).
Salida:  assets/modelos/monstruo.glb, con:
  · 13 huesos (raíz, cadera, tronco, cabeza, 2 piernas de 2 tramos, 2 brazos de 2 tramos)
    y los nodos «handslotr»/«handslotl» en las manos, donde el juego cuelga la varita;
  · pesos de piel calculados por regiones (cada vértice va a su hueso, con fundido suave
    en las articulaciones para que no se quiebre al doblarse);
  · las animaciones con los mismos nombres que los personajes de KayKit (Idle, Walking_A,
    Running_A, Jump_Idle, Cheer, Hit_A, Hit_B, Interact, Spellcast_Shoot, el ataque…),
    así el código del jugador, los compañeros y las cinemáticas las usa sin cambios.
Sin dependencias aparte de numpy y Pillow (solo para pasar la textura a JPEG).

Uso: python construir_rig.py monstruo_trellis.glb ../../assets/modelos/monstruo.glb
"""
import io, json, math, struct, sys
from pathlib import Path
import numpy as np
from PIL import Image
sys.path.insert(0, str(Path(__file__).parent))
from glb_a_obj import leer_glb, accesor, recorrer

# ---------- 1. Malla original ----------
js, binario = leer_glb(sys.argv[1])
mallas = []
for n in js['scenes'][0]['nodes']:
    recorrer(js, n, np.eye(4), mallas)
nm, M = mallas[0]
prim = js['meshes'][nm]['primitives'][0]
at = prim['attributes']
P = accesor(js, binario, at['POSITION']).astype(np.float64)
P = (np.c_[P, np.ones(len(P))] @ M.T)[:, :3]
UV = accesor(js, binario, at['TEXCOORD_0']).astype(np.float32)
IDX = accesor(js, binario, prim['indices']).reshape(-1).astype(np.uint32)
if 'NORMAL' in at:
    N = accesor(js, binario, at['NORMAL']).astype(np.float64) @ M[:3, :3].T
else:  # TRELLIS no las trae: normal de cada vértice = suma de las de sus caras (ponderadas por área)
    tri = IDX.reshape(-1, 3)
    cara = np.cross(P[tri[:, 1]] - P[tri[:, 0]], P[tri[:, 2]] - P[tri[:, 0]])
    N = np.zeros_like(P)
    for k in range(3):
        np.add.at(N, tri[:, k], cara)
N /= np.linalg.norm(N, axis=1, keepdims=True) + 1e-9
im = js['images'][0]
vista = js['bufferViews'][im['bufferView']]
tex = Image.open(io.BytesIO(binario[vista.get('byteOffset', 0):vista.get('byteOffset', 0) + vista['byteLength']])).convert('RGB')

# pies en el suelo (y = 0) y centrado en x/z; las medidas de abajo están en el sistema original
SUELO = P[:, 1].min()
CX = 0.02  # el eje del cuerpo está un pelín a la derecha del centro de la caja

# ---------- 2. Esqueleto (posiciones medidas con analizar.py, coordenadas originales) ----------
# nombre, padre, posición de la articulación
HUESOS = [
    ('Raiz', None, (CX, SUELO, 0.0)),
    ('Cadera', 'Raiz', (CX, -0.215, 0.0)),
    ('Tronco', 'Cadera', (CX, -0.13, 0.0)),
    ('Cabeza', 'Tronco', (CX, -0.04, 0.0)),
    ('PiernaR_Arriba', 'Cadera', (-0.05, -0.22, 0.0)),   # R = derecha del personaje (x negativa: mira hacia +z)
    ('PiernaR_Abajo', 'PiernaR_Arriba', (-0.055, -0.36, 0.0)),
    ('PiernaL_Arriba', 'Cadera', (0.085, -0.22, 0.0)),
    ('PiernaL_Abajo', 'PiernaL_Arriba', (0.095, -0.36, 0.0)),
    ('BrazoR_Arriba', 'Tronco', (-0.05, -0.07, 0.0)),
    ('BrazoR_Abajo', 'BrazoR_Arriba', (-0.115, -0.12, 0.0)),
    ('BrazoL_Arriba', 'Tronco', (0.105, -0.07, 0.0)),
    ('BrazoL_Abajo', 'BrazoL_Arriba', (0.16, -0.2, 0.0)),
    ('Cola', 'Raiz', (CX, SUELO, 0.0)),  # hueso vacío para mantener la raíz fija si hiciera falta
]
# puntas (para medir a lo largo de cada tramo y colocar las manos)
PUNTAS = {'BrazoR_Abajo': (-0.18, -0.17, 0.0), 'BrazoL_Abajo': (0.205, -0.32, 0.0),
          'PiernaR_Abajo': (-0.06, -0.48, 0.02), 'PiernaL_Abajo': (0.11, -0.48, 0.02)}
nombres = [h[0] for h in HUESOS]
J = {h[0]: i for i, h in enumerate(HUESOS)}
pos = {h[0]: np.array(h[2]) for h in HUESOS}

# ---------- 3. Pesos de piel por regiones ----------
x, y = P[:, 0], P[:, 1]
pesos = np.zeros((len(P), len(HUESOS)))


def suave(v, a, b):
    """0 por debajo de a, 1 por encima de b, con transición suave."""
    t = np.clip((v - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def a_lo_largo(p, a, b):
    """posición relativa (0 en a, 1 en b) de cada punto proyectado sobre el segmento a-b"""
    d = b - a
    return np.clip(((p - a) @ d) / (d @ d), 0, 1.5)


cabeza = y > -0.06
borde_r = -0.027 + (y + 0.075) * 0.39 - 0.015       # borde derecho del tronco (medido por rodajas)
brazo_r = (~cabeza | (y < -0.035)) & (y > -0.2) & (x < borde_r) & (y < -0.035)
borde_l = np.where(y < -0.25, 0.15, 0.125)
brazo_l = (y < -0.035) & (y > -0.345) & (x > borde_l)
piernas = (y < -0.19) & ~brazo_l & ~brazo_r
resto = ~(brazo_r | brazo_l | piernas)

# tronco y cabeza (cuello suave entre -0.07 y -0.02)
k = suave(y, -0.07, -0.02)
pesos[resto, J['Cabeza']] = k[resto]
pesos[resto, J['Tronco']] = (1 - k[resto]) * suave(y[resto], -0.21, -0.15)
pesos[resto, J['Cadera']] = 1 - pesos[resto, J['Cabeza']] - pesos[resto, J['Tronco']]

for lado, mask in (('R', brazo_r), ('L', brazo_l)):
    a, codo, punta = pos[f'Brazo{lado}_Arriba'], pos[f'Brazo{lado}_Abajo'], np.array(PUNTAS[f'Brazo{lado}_Abajo'])
    t = a_lo_largo(P[mask], a, punta)
    tc = a_lo_largo(codo[None], a, punta)[0]
    abajo = suave(t, tc - 0.12, tc + 0.12)
    hombro = suave(t, 0.0, 0.15)  # la raíz del brazo se funde con el tronco
    pesos[mask, J[f'Brazo{lado}_Abajo']] = abajo
    pesos[mask, J[f'Brazo{lado}_Arriba']] = (1 - abajo) * hombro
    pesos[mask, J['Tronco']] = (1 - abajo) * (1 - hombro)

for lado, mask in (('R', piernas & (x < 0.02)), ('L', piernas & (x >= 0.02))):
    rodilla = pos[f'Pierna{lado}_Abajo'][1]
    abajo = 1 - suave(y[mask], rodilla - 0.03, rodilla + 0.03)
    ingle = 1 - suave(y[mask], -0.235, -0.195)
    pesos[mask, J[f'Pierna{lado}_Abajo']] = abajo
    pesos[mask, J[f'Pierna{lado}_Arriba']] = (1 - abajo) * ingle
    pesos[mask, J['Cadera']] = (1 - abajo) * (1 - ingle)

pesos /= pesos.sum(1, keepdims=True)
orden = np.argsort(-pesos, axis=1)[:, :4]
JOINTS = orden.astype(np.uint8)
WEIGHTS = np.take_along_axis(pesos, orden, 1).astype(np.float32)
WEIGHTS /= WEIGHTS.sum(1, keepdims=True)
print('vértices por hueso principal:', {nombres[i]: int((orden[:, 0] == i).sum()) for i in range(len(HUESOS)) if (orden[:, 0] == i).any()})

# ---------- 4. Animaciones ----------
FPS = 24
RAD = math.pi / 180


def quat(ex=0.0, ey=0.0, ez=0.0):
    """cuaternión (x, y, z, w) a partir de ángulos en grados, orden XYZ"""
    cx, sx = math.cos(ex * RAD / 2), math.sin(ex * RAD / 2)
    cy, sy = math.cos(ey * RAD / 2), math.sin(ey * RAD / 2)
    cz, sz = math.cos(ez * RAD / 2), math.sin(ez * RAD / 2)
    return (sx * cy * cz + cx * sy * sz, cx * sy * cz - sx * cy * sz, cx * cy * sz + sx * sy * cz, cx * cy * cz - sx * sy * sz)


S = math.sin
# Ángulos: X positivo = hacia atrás (el personaje mira a +z); los brazos se abren con Z
# (brazo derecho, x negativa: Z negativo lo sube por fuera; brazo izquierdo: Z positivo).
# Cada animación: (duración en s, función t∈[0,1] → {hueso: (rx, ry, rz)} y desplazamiento de la cadera)


def reposo(u):
    r = S(u * 2 * math.pi)
    return {'Tronco': (r * 2, 0, 0), 'Cabeza': (-r * 3, S(u * 2 * math.pi + 1) * 4, r * 2),
            'BrazoR_Arriba': (0, 0, r * 4), 'BrazoL_Arriba': (0, 0, -r * 4)}, (0, abs(r) * 0.004, 0)


def andar(u, amp=28, brazos=24, bote=0.012, inclina=4):
    f = u * 2 * math.pi
    return {
        'PiernaR_Arriba': (-amp * S(f), 0, 0), 'PiernaR_Abajo': (max(0, amp * 0.9 * S(f - 1.2)), 0, 0),
        'PiernaL_Arriba': (amp * S(f), 0, 0), 'PiernaL_Abajo': (max(0, amp * 0.9 * S(f + math.pi - 1.2)), 0, 0),
        'BrazoR_Arriba': (brazos * S(f), 0, -6), 'BrazoL_Arriba': (-brazos * S(f), 0, 6),
        'BrazoR_Abajo': (-10, 0, 0), 'BrazoL_Abajo': (-10, 0, 0),
        'Tronco': (-inclina, S(f) * 6, 0), 'Cabeza': (inclina * 0.5, -S(f) * 5, S(f) * 4),
    }, (0, bote * abs(S(f)), 0)


def correr(u):
    return andar(u, amp=48, brazos=50, bote=0.03, inclina=12)


def salto(u):
    return {'PiernaR_Arriba': (-35, 0, 0), 'PiernaR_Abajo': (55, 0, 0), 'PiernaL_Arriba': (-25, 0, 0), 'PiernaL_Abajo': (45, 0, 0),
            'BrazoR_Arriba': (0, 0, -70 - S(u * 6.28) * 8), 'BrazoL_Arriba': (0, 0, 70 + S(u * 6.28) * 8), 'Cabeza': (-6, 0, 0)}, (0, 0, 0)


def celebrar(u):
    sube = S(min(1, u * 3) * math.pi / 2)
    saltito = max(0.0, S(u * 2 * math.pi * 2)) * (1 - u)
    agita = S(u * 2 * math.pi * 3) * 15
    # los brazos son cortos y la cabeza enorme: se abren en cruz (si suben más, la cabeza los tapa)
    return {'BrazoR_Arriba': (-20 * sube, 0, -95 * sube + agita), 'BrazoL_Arriba': (-20 * sube, 0, 95 * sube - agita),
            'BrazoR_Abajo': (0, 0, -35 * sube), 'BrazoL_Abajo': (0, 0, 35 * sube),
            'Cabeza': (-12 * sube, 0, agita * 0.3), 'Tronco': (-6 * sube, 0, 0),
            'PiernaR_Abajo': (25 * saltito, 0, 0), 'PiernaL_Abajo': (25 * saltito, 0, 0)}, (0, 0.06 * saltito, 0)


def golpe(u, lado=1):
    k = S(min(1, u * 2.5) * math.pi) if u < 0.4 else S(math.pi * 0.4 / 0.4) + 0  # sacudida y vuelta
    k = math.exp(-((u - 0.18) ** 2) / 0.02)
    return {'Tronco': (18 * k, 0, 6 * k * lado), 'Cabeza': (16 * k, 8 * k * lado, 0),
            'BrazoR_Arriba': (-25 * k, 0, -35 * k), 'BrazoL_Arriba': (-25 * k, 0, 35 * k)}, (0, 0, -0.03 * k)


def interactuar(u):
    k = S(u * math.pi)
    return {'BrazoR_Arriba': (-70 * k, 0, 10 * k), 'BrazoR_Abajo': (-20 * k, 0, 0), 'Tronco': (-6 * k, -8 * k, 0), 'Cabeza': (8 * k, -6 * k, 0)}, (0, 0, 0)


def hechizo(u):
    # brazo derecho (el de la varita) al frente con un latigazo
    sube = S(min(1, u * 2.2) * math.pi / 2)
    tira = math.exp(-((u - 0.45) ** 2) / 0.01)
    return {'BrazoR_Arriba': (-95 * sube - 15 * tira, 0, 20 * sube), 'BrazoR_Abajo': (-10 * sube, 0, 0),
            'Tronco': (-5 * sube + 6 * tira, -12 * sube, 0), 'Cabeza': (4 * tira, -8 * sube, 0)}, (0, 0, 0)


def cabezazo(u):
    # su ataque: un cabezazo con mordisco (va todo el cuerpo detrás de la cabezota)
    carga = S(min(1, u / 0.35) * math.pi / 2) * (1 - S(max(0, (u - 0.35) / 0.65) * math.pi / 2))
    tira = math.exp(-((u - 0.42) ** 2) / 0.006)
    return {'Tronco': (12 * carga - 30 * tira, 0, 0), 'Cabeza': (10 * carga - 28 * tira, 0, 0),
            'BrazoR_Arriba': (40 * carga, 0, -30 * tira), 'BrazoL_Arriba': (40 * carga, 0, 30 * tira),
            'PiernaR_Arriba': (-20 * tira, 0, 0), 'PiernaL_Arriba': (15 * tira, 0, 0)}, (0, 0, 0.06 * tira)


def muerte(u):
    k = S(min(1, u * 1.4) * math.pi / 2)
    return {'Tronco': (25 * k, 0, 0), 'Cabeza': (30 * k, 0, 20 * k), 'BrazoR_Arriba': (0, 0, -60 * k), 'BrazoL_Arriba': (0, 0, 60 * k),
            'PiernaR_Abajo': (40 * k, 0, 0), 'PiernaL_Abajo': (40 * k, 0, 0)}, (0, -0.12 * k, -0.05 * k)


def sentado(u):
    r = S(u * 2 * math.pi)
    return {'PiernaR_Arriba': (-85, 0, -10), 'PiernaL_Arriba': (-85, 0, 10), 'PiernaR_Abajo': (10, 0, 0), 'PiernaL_Abajo': (10, 0, 0),
            'Tronco': (r * 2, 0, 0), 'Cabeza': (-r * 3, 0, r * 3), 'BrazoR_Arriba': (-30, 0, -10), 'BrazoL_Arriba': (-30, 0, 10)}, (0, -0.2, 0)


def levantarse(u):
    pose, _ = sentado(0)
    k = 1 - S(min(1, u) * math.pi / 2)
    return {h: tuple(v * k for v in a) for h, a in pose.items()}, (0, -0.2 * k, 0)


def esquivar(u):
    k = S(u * math.pi)
    return {'Tronco': (20 * k, 0, 0), 'Cabeza': (15 * k, 0, 0), 'PiernaR_Arriba': (-30 * k, 0, 0), 'PiernaL_Arriba': (20 * k, 0, 0),
            'BrazoR_Arriba': (-30 * k, 0, -40 * k), 'BrazoL_Arriba': (-30 * k, 0, 40 * k)}, (0, 0.03 * k, -0.15 * k)


def burla(u):
    agita = S(u * 2 * math.pi * 4)
    return {'Cabeza': (-10, agita * 15, 0), 'Tronco': (-6, 0, agita * 4),
            'BrazoR_Arriba': (-15, 0, -80 + agita * 20), 'BrazoL_Arriba': (-15, 0, 80 + agita * 20)}, (0, 0, 0)


ANIMS = {
    'Idle': (2.4, reposo), 'Walking_A': (1.0, andar), 'Running_A': (0.6, correr), 'Jump_Idle': (0.8, salto),
    'Cheer': (1.6, celebrar), 'Hit_A': (0.55, golpe), 'Hit_B': (0.55, lambda u: golpe(u, -1)), 'Interact': (1.0, interactuar),
    'Spellcast_Shoot': (0.9, hechizo), 'Spellcasting': (1.2, lambda u: hechizo(0.35 + 0.1 * S(u * 6.28))),
    'Unarmed_Melee_Attack_Punch_A': (0.7, cabezazo), 'Death_A': (1.2, muerte), 'Dodge_Backward': (0.7, esquivar),
    'Sit_Floor_Idle': (2.4, sentado), 'Sit_Floor_StandUp': (0.9, levantarse), 'Taunt': (1.4, burla),
}

# ---------- 5. Escribir el GLB ----------
escala = 1.0  # el juego lo ajusta a 1,8 m con ajustarAltura
desplaza = np.array([-CX, -SUELO, 0.0])
Pf = ((P + desplaza) * escala).astype(np.float32)
ojo = io.BytesIO()
tex.resize((1024, 1024), Image.LANCZOS).save(ojo, 'JPEG', quality=88)
jpg = ojo.getvalue()

trozos, vistas, accesores = [], [], []


def anadir(datos, tipo_gl, tipo, objetivo=None, minmax=False):
    datos = np.ascontiguousarray(datos)
    while sum(len(t) for t in trozos) % 4:
        trozos.append(b'\0')
    inicio = sum(len(t) for t in trozos)
    trozos.append(datos.tobytes())
    v = {'buffer': 0, 'byteOffset': inicio, 'byteLength': datos.nbytes}
    if objetivo: v['target'] = objetivo
    vistas.append(v)
    a = {'bufferView': len(vistas) - 1, 'componentType': tipo_gl, 'count': len(datos), 'type': tipo}
    if minmax:
        a['min'] = datos.min(0).tolist() if datos.ndim > 1 else [float(datos.min())]
        a['max'] = datos.max(0).tolist() if datos.ndim > 1 else [float(datos.max())]
    accesores.append(a)
    return len(accesores) - 1


a_pos = anadir(Pf, 5126, 'VEC3', 34962, True)
a_nor = anadir(N.astype(np.float32), 5126, 'VEC3', 34962)
a_uv = anadir(UV, 5126, 'VEC2', 34962)
a_j = anadir(JOINTS, 5121, 'VEC4', 34962)
a_w = anadir(WEIGHTS, 5126, 'VEC4', 34962)
a_i = anadir(IDX, 5125, 'SCALAR', 34963)
# textura incrustada
while sum(len(t) for t in trozos) % 4:
    trozos.append(b'\0')
vistas.append({'buffer': 0, 'byteOffset': sum(len(t) for t in trozos), 'byteLength': len(jpg)})
trozos.append(jpg)
v_tex = len(vistas) - 1

# nodos: 0 = escena raíz «Monstruo», 1 = malla, 2.. = huesos, luego las manos
nodos = [{'name': 'Monstruo', 'children': [1, 2]}, {'name': 'Cuerpo', 'mesh': 0, 'skin': 0}]
indice = {n: 2 + i for i, n in enumerate(nombres)}
mundo = {n: (pos[n] + desplaza) * escala for n in nombres}
for n, padre, _ in HUESOS:
    rel = mundo[n] - (mundo[padre] if padre else np.zeros(3))
    nodos.append({'name': n, 'translation': rel.tolist(), 'children': []})
for n, padre, _ in HUESOS:
    if padre: nodos[indice[padre]]['children'].append(indice[n])
for lado, hueso in (('r', 'BrazoR_Abajo'), ('l', 'BrazoL_Abajo')):
    punta = (np.array(PUNTAS[hueso]) + desplaza) * escala
    nodos.append({'name': f'handslot{lado}', 'translation': (punta - mundo[hueso]).tolist(), 'rotation': list(quat(0, 0, 180 if lado == 'r' else 180))})
    nodos[indice[hueso]]['children'].append(len(nodos) - 1)
for nd in nodos:
    if 'children' in nd and not nd['children']: del nd['children']

ibm = np.stack([np.linalg.inv(np.array([[1, 0, 0, t[0]], [0, 1, 0, t[1]], [0, 0, 1, t[2]], [0, 0, 0, 1]])).T.reshape(-1) for t in (mundo[n] for n in nombres)]).astype(np.float32)
a_ibm = anadir(ibm.reshape(-1, 16), 5126, 'MAT4')

animaciones = []
for nombre, (dur, f) in ANIMS.items():
    n = max(2, int(round(dur * FPS)) + 1)
    tiempos = np.linspace(0, dur, n).astype(np.float32)
    rot = {h: [] for h in nombres}
    tras = []
    for t in tiempos:
        pose, d = f(float(t / dur))
        for h in nombres:
            rot[h].append(quat(*pose.get(h, (0, 0, 0))))
        tras.append((mundo['Cadera'] - mundo['Raiz']) + np.array(d) * escala)
    a_t = anadir(tiempos, 5126, 'SCALAR', None, True)
    canales, muestreos = [], []
    for h in nombres:
        q = np.array(rot[h], dtype=np.float32)
        if np.allclose(q, [0, 0, 0, 1], atol=1e-6):
            continue
        muestreos.append({'input': a_t, 'output': anadir(q, 5126, 'VEC4'), 'interpolation': 'LINEAR'})
        canales.append({'sampler': len(muestreos) - 1, 'target': {'node': indice[h], 'path': 'rotation'}})
    muestreos.append({'input': a_t, 'output': anadir(np.array(tras, dtype=np.float32), 5126, 'VEC3'), 'interpolation': 'LINEAR'})
    canales.append({'sampler': len(muestreos) - 1, 'target': {'node': indice['Cadera'], 'path': 'translation'}})
    animaciones.append({'name': nombre, 'channels': canales, 'samplers': muestreos})

binario_final = b''.join(trozos)
while len(binario_final) % 4:
    binario_final += b'\0'
gltf = {
    'asset': {'version': '2.0', 'generator': 'construir_rig.py (La Torre de Morvath)'},
    'scene': 0, 'scenes': [{'name': 'Escena', 'nodes': [0]}],
    'nodes': nodos,
    'meshes': [{'name': 'Monstruo', 'primitives': [{'attributes': {'POSITION': a_pos, 'NORMAL': a_nor, 'TEXCOORD_0': a_uv, 'JOINTS_0': a_j, 'WEIGHTS_0': a_w},
                                                    'indices': a_i, 'material': 0}]}],
    'skins': [{'name': 'Esqueleto', 'joints': [indice[n] for n in nombres], 'inverseBindMatrices': a_ibm, 'skeleton': indice['Raiz']}],
    'materials': [{'name': 'Piel', 'pbrMetallicRoughness': {'baseColorTexture': {'index': 0}, 'metallicFactor': 0.0, 'roughnessFactor': 0.75}}],
    'textures': [{'source': 0, 'sampler': 0}], 'samplers': [{'magFilter': 9729, 'minFilter': 9987}],
    'images': [{'bufferView': v_tex, 'mimeType': 'image/jpeg'}],
    'accessors': accesores, 'bufferViews': vistas, 'buffers': [{'byteLength': len(binario_final)}],
    'animations': animaciones,
}
texto = json.dumps(gltf, separators=(',', ':')).encode()
texto += b' ' * ((4 - len(texto) % 4) % 4)
salida = Path(sys.argv[2])
with open(salida, 'wb') as f:
    f.write(struct.pack('<4sII', b'glTF', 2, 12 + 8 + len(texto) + 8 + len(binario_final)))
    f.write(struct.pack('<II', len(texto), 0x4E4F534A) + texto)
    f.write(struct.pack('<II', len(binario_final), 0x004E4942) + binario_final)
print(f'{salida} · {salida.stat().st_size / 1e6:.2f} MB · {len(nombres)} huesos · {len(animaciones)} animaciones: {", ".join(ANIMS)}')
