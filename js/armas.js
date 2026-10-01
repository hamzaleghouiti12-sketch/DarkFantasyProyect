// Las armas de cada personaje y el alcance de sus golpes (lógica pura, sin Three.js).
// Cada arma ya venía dentro de su modelo de KayKit Adventurers (o es la daga del mismo pack).
//   armas: nodos del modelo que se dejan visibles · extra: arma que se añade a la mano derecha
//   ataque: tipo de golpe (ver js/ataques.js), animación, alcance (m), arco (grados),
//           enfriamiento (s) y retardo hasta el impacto (s)
export const ARMAS = {
  encapuchado: {
    desc: 'Dagas gemelas: dos puñaladas rápidas y certeras.',
    armas: ['Knife_Offhand'], extra: 'dagger.gltf',
    ataque: { tipo: 'punalada', nombre: 'Puñalada doble', anim: 'Dualwield_Melee_Attack_Stab', alcance: 2.3, arco: 70, enfriamiento: 0.5, retardo: 0.18 },
  },
  picaro: {
    desc: 'Ballesta: dispara virotes desde lejos.',
    armas: ['2H_Crossbow'],
    ataque: { tipo: 'disparo', nombre: 'Virote de ballesta', anim: '2H_Ranged_Shoot', alcance: 22, arco: 0, enfriamiento: 1.1, retardo: 0.2 },
  },
  caballero: {
    desc: 'Espada y escudo: un tajo en arco por delante.',
    armas: ['1H_Sword', 'Round_Shield'],
    ataque: { tipo: 'tajo', nombre: 'Tajo de espada', anim: '1H_Melee_Attack_Slice_Horizontal', alcance: 2.9, arco: 120, enfriamiento: 0.8, retardo: 0.25 },
  },
  barbaro: {
    desc: 'Hacha a dos manos: un giro que golpea todo alrededor.',
    armas: ['2H_Axe'],
    ataque: { tipo: 'giro', nombre: 'Giro de hacha', anim: '2H_Melee_Attack_Spin', alcance: 3.2, arco: 360, enfriamiento: 1.6, retardo: 0.35 },
  },
};

// ¿la diana d está al alcance de un golpe que sale de «origen» hacia «dir» (vector unitario en XZ)?
export function alcanza(origen, dir, d, alcance, arco) {
  const dx = d.x - origen.x, dz = d.z - origen.z;
  const dist = Math.hypot(dx, dz);
  if (dist > alcance) return false;
  if (arco >= 360 || dist < 0.5) return true;
  const coseno = (dx * dir.x + dz * dir.z) / (dist || 1);
  return coseno >= Math.cos(((arco / 2) * Math.PI) / 180);
}
