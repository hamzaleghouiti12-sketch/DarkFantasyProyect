// Muebles de KayKit Furniture Bits (CC0) con la paleta oscurecida del juego: alfombras,
// estanterías con libros, cuadros, sillones… para dar variedad a las salas de la torre.
// Solo decoran: si no cargan, el piso funciona igual.
import { cargarPiezas, cargarPaleta, colocador } from '../modelos.js';

let paleta = null;

/**
 * @param {object} sala   la sala del piso (crearSalaDeTorre)
 * @param {Array} lista   [nombre, x, y, z, rotación, escala, radio del obstáculo (0 = se puede pisar)]
 */
export async function amueblar(sala, lista) {
  try {
    paleta ??= await cargarPaleta('assets/texturas/paleta_muebles_oscura.png');
    const nombres = [...new Set(lista.map((m) => m[0]))];
    const piezas = await cargarPiezas('assets/modelos/muebles', nombres, paleta, 'gltf');
    const poner = colocador(sala.grupo, piezas);
    for (const [n, x, y, z, ry = 0, esc = 1, radio = 0] of lista) {
      const o = poner(n, x, y, z, ry, esc, !n.startsWith('rug') && !n.startsWith('picture'));
      // las alfombras de la paleta son de un naranja chillón: aquí, granate gastado
      if (n.startsWith('rug')) o.traverse((m) => { if (m.isMesh) { m.material = m.material.clone(); m.material.color.set(0x7a3a3a); } });
      if (radio) sala.obstaculo(x, z, radio);
    }
  } catch (e) {
    console.warn('No se pudieron cargar los muebles.', e);
  }
}
