"""Genera la paleta de Morvath (el jefe final) a partir de la del mago de KayKit.

Morvath es el reflejo oscuro de Aldric: mismo modelo, otros colores.
  - telas moradas, azules, magentas y verdes → carmesí y negro
  - piel → pálida, casi gris (la torre le ha consumido)
  - grises → más oscuros
Uso:  python herramientas/paleta_morvath.py
"""
import colorsys
from pathlib import Path
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / 'assets' / 'texturas' / 'paleta_mago.png'
DESTINO = RAIZ / 'assets' / 'texturas' / 'paleta_morvath.png'


def morvath(r, g, b):
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    grados = h * 360
    piel = 15 <= grados <= 45 and 0.15 < s < 0.6 and v > 0.7
    if piel:
        # piel pálida, apagada
        h2, s2, v2 = 0.08, s * 0.25, v * 0.82
    elif s > 0.25:
        # cualquier tela de color → carmesí (más oscuro cuanto más oscuro era)
        h2 = 0.97 if grados < 40 or grados > 180 else 0.99
        s2 = min(1, 0.55 + s * 0.4)
        v2 = v * 0.55
    else:
        # grises y negros → más oscuros, con un toque frío
        h2, s2, v2 = 0.72, s * 0.5, v * 0.6
    r2, g2, b2 = colorsys.hsv_to_rgb(h2, s2, v2)
    return round(r2 * 255), round(g2 * 255), round(b2 * 255)


def main():
    im = Image.open(ORIGEN).convert('RGBA')
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            px[x, y] = (*morvath(r, g, b), a)
    im.save(DESTINO)
    print(f'{DESTINO.relative_to(RAIZ)}: {im.size[0]}×{im.size[1]}')


if __name__ == '__main__':
    main()
