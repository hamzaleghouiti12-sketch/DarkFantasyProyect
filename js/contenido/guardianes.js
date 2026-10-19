// Guardianes de Morvath: enemigos que patrullan los pisos II a VII para darles variedad.
// No bloquean nada ni hacen daño. Un golpe de arma (R) los aturde y la varita (F) los
// destierra si se responde bien una pregunta de repaso (de lo aprendido hasta entonces):
// cada guardián desterrado da saber extra.
//   ruta: puntos (x, z) locales del piso que recorren en bucle · vel: metros por segundo
export default {
  piso2: [
    { id: 'g2a', tipo: 'caballero_corrupto', ruta: [[-3, 12], [3, 12], [3, 9], [-3, 9]], vel: 0.6 },
    { id: 'g2b', tipo: 'esqueleto_minion', ruta: [[-4, 3], [-4, -4], [4, -4], [4, 3]], vel: 1.1 },
  ],
  piso3: [
    { id: 'g3a', tipo: 'esqueleto_mage', ruta: [[-2, 12], [2, 12], [2, 8], [-2, 8]], vel: 0.8 },
    { id: 'g3b', tipo: 'barbaro_corrupto', ruta: [[-3, -1], [3, -1], [3, 2], [-3, 2]], vel: 1.0 },
  ],
  piso4: [ // en las islas patrullan por la isla central y el barrio
    { id: 'g4a', tipo: 'picara_corrupta', ruta: [[-3, 9], [3, 9], [3, 3], [-3, 3]], vel: 1.4 },
    { id: 'g4b', tipo: 'esqueleto_minion', ruta: [[-19, 5], [-15, 5], [-15, 1], [-19, 1]], vel: 1.8 },
  ],
  piso5: [
    { id: 'g5a', tipo: 'esqueleto_rogue', ruta: [[-3, 11], [3, 11], [3, 7], [-3, 7]], vel: 1.0 },
    { id: 'g5b', tipo: 'mago_corrupto', ruta: [[-3, -2], [3, -2], [3, -5], [-3, -5]], vel: 0.9 },
  ],
  piso6: [
    { id: 'g6a', tipo: 'encapuchado_corrupto', ruta: [[-3, 11], [3, 11], [3, 8], [-3, 8]], vel: 0.9 },
    { id: 'g6b', tipo: 'esqueleto_warrior', ruta: [[-4, -6], [4, -6], [4, -9], [-4, -9]], vel: 1.0 },
  ],
  piso7: [
    { id: 'g7a', tipo: 'esqueleto_mage', ruta: [[-3, 2], [3, 2], [3, -3], [-3, -3]], vel: 0.8 },
    { id: 'g7b', tipo: 'esqueleto_rogue', ruta: [[-2, 13], [2, 13], [2, 11], [-2, 11]], vel: 0.7 },
  ],
  piso9: [
    { id: 'g9a', tipo: 'caballero_corrupto', ruta: [[-3, 12], [3, 12], [3, 9], [-3, 9]], vel: 0.7 },
    { id: 'g9b', tipo: 'esqueleto_warrior', ruta: [[-4, -3], [4, -3], [4, -5], [-4, -5]], vel: 0.9 },
  ],
  piso11: [
    { id: 'g11a', tipo: 'esqueleto_rogue', ruta: [[-6, 12], [-2, 12], [-2, 10], [-6, 10]], vel: 0.9 },
    { id: 'g11b', tipo: 'barbaro_corrupto', ruta: [[5, -12], [8, -12], [8, -14], [5, -14]], vel: 0.8 },
  ],
  piso12: [
    { id: 'g12a', tipo: 'esqueleto_warrior', ruta: [[-3, 12], [3, 12], [3, 9], [-3, 9]], vel: 0.8 },
    { id: 'g12b', tipo: 'encapuchado_corrupto', ruta: [[-4, 4], [4, 4], [4, 6], [-4, 6]], vel: 1.0 },
  ],
  piso13: [
    { id: 'g13a', tipo: 'esqueleto_mage', ruta: [[-4, 11], [4, 11], [4, 8], [-4, 8]], vel: 0.8 },
    { id: 'g13b', tipo: 'picara_corrupta', ruta: [[-5, -8], [5, -8], [5, -10], [-5, -10]], vel: 1.0 },
  ],
  piso10: [ // por los pasillos del laberinto
    { id: 'g10a', tipo: 'esqueleto_minion', ruta: [[6, 12], [10, 12], [10, 10], [6, 10]], vel: 0.9 },
    { id: 'g10b', tipo: 'picara_corrupta', ruta: [[-10, -3], [-6, -3], [-6, -5], [-10, -5]], vel: 1.0 },
  ],
};
