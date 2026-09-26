"""Oscurece las paletas de KayKit para darles estética dark fantasy.

Los modelos de KayKit toman TODO su color de una imagen de 8 x 4 franjas
degradadas (paleta). Si repintamos esa imagen, cambia el modelo entero sin
tocarlo. Cada franja se clasifica por su color medio y se trata entera,
para no romper el degradado.

Perfil "personaje":
  - piel: casi igual (algo más apagada)
  - verdes (capas, ropa) → granate oscuro; turquesas → pizarra fría
  - colores neón: se conservan (brillos mágicos)
  - resto (cuero, metal, pelo): apagado y algo frío
Perfil "escenario":
  - piedra (grises): más oscura y fría
  - madera y cuero: envejecidos
  - rojos (estandartes): carmesí oscuro
  - fuego y oro: se conservan
  - colores vivos (azules, verdes, morados…): muy apagados
Perfil "exterior": como "escenario", pero la vegetación se queda verde
oscuro y turbio (no granate) y los naranjas pasan a óxido otoñal.

Uso:  python herramientas/oscurecer_paleta.py
"""
import colorsys
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent / 'assets' / 'texturas'
TRABAJOS = [
    ('paleta_picaro.png', 'paleta_picaro_oscura.png', 'personaje'),
    ('paleta_mago.png', 'paleta_mago_oscura.png', 'personaje'),
    ('paleta_mazmorra.png', 'paleta_mazmorra_oscura.png', 'escenario'),
    ('paleta_halloween.png', 'paleta_halloween_oscura.png', 'exterior'),
    ('paleta_medieval.png', 'paleta_medieval_oscura.png', 'exterior'),
]
COLS, FILAS = 8, 4


def clasificar_personaje(h, s, v):
    g = h * 360
    if s > 0.7 and v > 0.6:
        return 'magia'
    if 10 <= g <= 40 and s <= 0.5 and v > 0.75:
        return 'piel'
    if 80 <= g <= 170:
        return 'verde'
    if 170 < g <= 215:
        return 'turquesa'
    return 'resto'


def clasificar_escenario(h, s, v):
    g = h * 360
    if s < 0.2:
        return 'piedra'
    if 30 <= g <= 60 and s > 0.45 and v > 0.7:
        return 'fuego'
    if 12 <= g < 30 and s > 0.6 and v > 0.8:
        return 'fuego'
    if (g < 12 or g >= 330) and s > 0.4:
        return 'rojo'
    if 12 <= g < 45:
        return 'madera'
    return 'frio'


def clasificar_exterior(h, s, v):
    g = h * 360
    if s < 0.2:
        return 'piedra'
    if 40 <= g <= 62 and s > 0.45 and v > 0.75:
        return 'fuego'           # farolillos, velas, ventanas encendidas
    if 70 <= g <= 175:
        return 'follaje'
    if 12 <= g < 40 and s > 0.6:
        return 'oxido'
    if (g < 12 or g >= 330) and s > 0.4:
        return 'rojo'
    if 12 <= g < 45:
        return 'madera'
    return 'frio'


def recolorear(r, g, b, tipo):
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    if tipo in ('magia', 'fuego'):
        return r, g, b
    if tipo == 'piel':
        s, v = s * 0.85, v * 0.9
    elif tipo == 'verde':      # capas y ropa → granate oscuro
        h, s, v = 352 / 360, min(1, 0.35 + s * 0.4), 0.12 + v * 0.38
    elif tipo == 'turquesa':   # → pizarra fría
        h, s, v = 220 / 360, s * 0.35, v * 0.5
    elif tipo == 'piedra':     # → piedra oscura con un toque frío
        h, s, v = 225 / 360, 0.06 + s * 0.5, v * 0.62
    elif tipo == 'madera':     # → madera vieja
        s, v = s * 0.7, v * 0.58
    elif tipo == 'rojo':       # → carmesí oscuro
        h, s, v = 352 / 360, min(1, s * 0.85), 0.1 + v * 0.45
    elif tipo == 'follaje':    # → verde oscuro y turbio
        h, s, v = (h * 360 * 0.5 + 150 * 0.5) / 360, s * 0.5, v * 0.42
    elif tipo == 'oxido':      # naranjas → óxido otoñal
        s, v = s * 0.75, v * 0.5
    elif tipo == 'frio':       # colores vivos → apagados
        s, v = s * 0.35, v * 0.45
        h = h + (0.64 - h) * 0.3
    else:                      # resto de personaje: apagado y algo frío
        s, v = s * 0.6, v * 0.72
        h = h + (0.62 - h) * 0.08
    r2, g2, b2 = colorsys.hsv_to_rgb(h % 1, s, v)
    return round(r2 * 255), round(g2 * 255), round(b2 * 255)


for origen, destino, perfil in TRABAJOS:
    if not (RAIZ / origen).exists():
        continue
    clasificar = {'personaje': clasificar_personaje, 'escenario': clasificar_escenario,
                  'exterior': clasificar_exterior}[perfil]
    im = Image.open(RAIZ / origen).convert('RGBA')
    px = im.load()
    cw, ch = im.width // COLS, im.height // FILAS
    for fy in range(FILAS):
        for fx in range(COLS):
            celdas = [(x, y) for y in range(fy * ch, (fy + 1) * ch, 4) for x in range(fx * cw, (fx + 1) * cw, 4)]
            media = [sum(px[x, y][i] for x, y in celdas) / len(celdas) / 255 for i in range(3)]
            tipo = clasificar(*colorsys.rgb_to_hsv(*media))
            for y in range(fy * ch, (fy + 1) * ch):
                for x in range(fx * cw, (fx + 1) * cw):
                    r, g, b, a = px[x, y]
                    px[x, y] = (*recolorear(r, g, b, tipo), a)
    im.save(RAIZ / destino)
    print('ok', destino)
