// Todos los .js del juego se cargan en el navegador como módulos ES. Sin package.json,
// «node --check» los trata como scripts y deja pasar errores que el navegador no perdona
// (p. ej. una const y una function con el mismo nombre: así se rompió el Piso VIII).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'js');
const archivos = (dir) => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n);
  return statSync(p).isDirectory() ? archivos(p) : p.endsWith('.js') ? [p] : [];
});

test('todos los módulos del juego tienen sintaxis válida como módulos ES', () => {
  const fallos = [];
  for (const f of archivos(raiz)) {
    const r = spawnSync(process.execPath, ['--experimental-default-type=module', '--check', f], { encoding: 'utf8' });
    if (r.status !== 0) fallos.push(`${f}\n${r.stderr.split('\n').slice(0, 5).join('\n')}`);
  }
  assert.deepEqual(fallos, []);
});
