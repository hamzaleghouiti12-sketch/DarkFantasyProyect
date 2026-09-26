// Texturas generadas por código (sin descargar nada): piedra, ladrillo,
// madera, estandartes, pergaminos, runas y etiquetas de texto en 3D.
import * as THREE from 'three';

export function rng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

export function canvasTex(c, rx = 1, ry = 1, color = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function speckle(ctx, r, x, y, w, h, n, alpha) {
  for (let k = 0; k < n; k++) {
    const a = r() * alpha;
    ctx.fillStyle = r() < 0.5 ? `rgba(0,0,0,${a})` : `rgba(255,240,230,${a})`;
    const s = 1 + r() * 3;
    ctx.fillRect(x + r() * w, y + r() * h, s, s);
  }
}

function crack(ctx, r, x, y, len) {
  ctx.strokeStyle = 'rgba(8,6,8,0.7)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  let ang = r() * Math.PI * 2;
  for (let i = 0; i < len; i++) {
    ang += (r() - 0.5) * 1.2;
    x += Math.cos(ang) * 6;
    y += Math.sin(ang) * 6;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}

export function stoneFloorCanvas() {
  const s = 512, c = makeCanvas(s, s), ctx = c.getContext('2d'), r = rng(7);
  ctx.fillStyle = '#141113';
  ctx.fillRect(0, 0, s, s);
  const n = 4, ts = s / n, g = 3;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const v = 40 + r() * 26;
      ctx.fillStyle = `rgb(${v},${v - 4},${v - 2})`;
      ctx.fillRect(x * ts + g, y * ts + g, ts - 2 * g, ts - 2 * g);
      // bisel: borde claro arriba, oscuro abajo
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(x * ts + g, y * ts + g, ts - 2 * g, 3);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(x * ts + g, (y + 1) * ts - g - 4, ts - 2 * g, 4);
      speckle(ctx, r, x * ts + g, y * ts + g, ts - 2 * g, ts - 2 * g, 260, 0.12);
      if (r() < 0.4) crack(ctx, r, x * ts + r() * ts, y * ts + r() * ts, 6 + r() * 10);
    }
  }
  return c;
}

export function brickCanvas() {
  const s = 512, c = makeCanvas(s, s), ctx = c.getContext('2d'), r = rng(11);
  ctx.fillStyle = '#100d0f';
  ctx.fillRect(0, 0, s, s);
  const rows = 8, rh = s / rows, bw = 128, m = 4;
  for (let y = 0; y < rows; y++) {
    const off = y % 2 ? bw / 2 : 0;
    for (let x = -1; x < s / bw + 1; x++) {
      const v = 42 + r() * 26;
      ctx.fillStyle = `rgb(${v + 4},${v - 2},${v - 4})`;
      const bx = x * bw + off + m / 2, by = y * rh + m / 2;
      ctx.fillRect(bx, by, bw - m, rh - m);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(bx, by, bw - m, 2);
      speckle(ctx, r, bx, by, bw - m, rh - m, 90, 0.13);
      if (r() < 0.12) {
        ctx.fillStyle = 'rgba(40,60,30,0.25)'; // musgo
        ctx.fillRect(bx, by + rh * 0.5, (bw - m) * r(), rh * 0.5 - m);
      }
    }
  }
  return c;
}

export function woodCanvas() {
  const w = 256, h = 512, c = makeCanvas(w, h), ctx = c.getContext('2d'), r = rng(23);
  const planks = 5, pw = w / planks;
  for (let i = 0; i < planks; i++) {
    const v = 48 + r() * 18;
    ctx.fillStyle = `rgb(${v + 14},${v - 2},${v - 18})`;
    ctx.fillRect(i * pw, 0, pw, h);
    for (let k = 0; k < 14; k++) {
      ctx.strokeStyle = `rgba(0,0,0,${0.08 + r() * 0.12})`;
      ctx.lineWidth = 1 + r() * 1.5;
      ctx.beginPath();
      const x0 = i * pw + r() * pw;
      ctx.moveTo(x0, 0);
      ctx.bezierCurveTo(x0 + (r() - 0.5) * 12, h * 0.3, x0 + (r() - 0.5) * 12, h * 0.7, x0, h);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(i * pw, 0, 2, h);
  }
  return c;
}

export function bannerCanvas() {
  const w = 256, h = 640, c = makeCanvas(w, h), ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#4a0d14');
  g.addColorStop(1, '#23060a');
  ctx.fillStyle = g;
  // cola en punta
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(w, 0); ctx.lineTo(w, h); ctx.lineTo(w / 2, h - 70); ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b38a45';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(14, 10); ctx.lineTo(w - 14, 10); ctx.lineTo(w - 14, h - 26); ctx.lineTo(w / 2, h - 92); ctx.lineTo(14, h - 26);
  ctx.closePath();
  ctx.stroke();
  // emblema: torre con un ojo
  ctx.fillStyle = '#b38a45';
  ctx.fillRect(w / 2 - 30, 190, 60, 200);
  ctx.beginPath(); ctx.moveTo(w / 2 - 44, 190); ctx.lineTo(w / 2, 120); ctx.lineTo(w / 2 + 44, 190); ctx.fill();
  for (let i = 0; i < 3; i++) ctx.fillRect(w / 2 - 44 + i * 36, 380, 16, 30);
  ctx.fillStyle = '#23060a';
  ctx.beginPath(); ctx.ellipse(w / 2, 250, 20, 11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8c476';
  ctx.beginPath(); ctx.arc(w / 2, 250, 6, 0, Math.PI * 2); ctx.fill();
  return c;
}

export function parchmentCanvas() {
  const w = 256, h = 340, c = makeCanvas(w, h), ctx = c.getContext('2d'), r = rng(5);
  const g = ctx.createRadialGradient(w / 2, h / 2, 30, w / 2, h / 2, 220);
  g.addColorStop(0, '#e9d7a8');
  g.addColorStop(1, '#a8834b');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  speckle(ctx, r, 0, 0, w, h, 700, 0.12);
  ctx.strokeStyle = 'rgba(60,35,15,0.55)';
  ctx.lineWidth = 3;
  for (let y = 60; y < h - 70; y += 26) {
    ctx.beginPath();
    let x = 30;
    ctx.moveTo(x, y);
    const end = 30 + (w - 60) * (0.6 + r() * 0.4);
    while (x < end) {
      x += 6;
      ctx.lineTo(x, y + Math.sin(x * 0.4 + y) * 2.2);
    }
    ctx.stroke();
  }
  ctx.fillStyle = '#8a1620';
  ctx.beginPath(); ctx.arc(w - 58, h - 52, 22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5e0d14';
  ctx.beginPath(); ctx.arc(w - 58, h - 52, 12, 0, Math.PI * 2); ctx.fill();
  return c;
}

export function signCanvas() {
  const w = 512, h = 352, c = makeCanvas(w, h), ctx = c.getContext('2d');
  ctx.drawImage(woodCanvas(), 0, 0, w, h);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#8f6b35';
  ctx.lineWidth = 10;
  ctx.strokeRect(12, 12, w - 24, h - 24);
  ctx.fillStyle = '#e9d6a6';
  ctx.textAlign = 'center';
  ctx.font = '700 46px Cinzel, serif';
  ctx.fillText('EL CARTEL', w / 2, 96);
  ctx.fillText('DEL GUARDIÁN', w / 2, 150);
  ctx.font = '500 26px "Alegreya Sans", sans-serif';
  ctx.fillStyle = '#d8c28f';
  ctx.fillText('Quien responda con saber,', w / 2, 220);
  ctx.fillText('romperá el primer sello.', w / 2, 254);
  ctx.font = '900 54px Cinzel, serif';
  ctx.fillStyle = '#9fe6ff';
  ctx.fillText('?', w / 2, 320);
  return c;
}

function sigil(ctx, r, cx, cy, size) {
  const pts = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) pts.push([cx + (i - 1) * size, cy + (j - 1) * size]);
  ctx.beginPath();
  let p = pts[Math.floor(r() * 9)];
  ctx.moveTo(p[0], p[1]);
  const strokes = 3 + Math.floor(r() * 3);
  for (let k = 0; k < strokes; k++) {
    p = pts[Math.floor(r() * 9)];
    ctx.lineTo(p[0], p[1]);
  }
  ctx.stroke();
}

export function runeGlyphCanvas(seed) {
  const s = 256, c = makeCanvas(s, s), ctx = c.getContext('2d'), r = rng(seed * 97 + 3);
  ctx.strokeStyle = '#ffffff';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 10;
  ctx.beginPath(); ctx.arc(s / 2, s / 2, s / 2 - 12, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(s / 2, s / 2, s / 2 - 30, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 12;
  sigil(ctx, r, s / 2, s / 2, 44);
  return c;
}

export function runeCircleCanvas() {
  const s = 1024, c = makeCanvas(s, s), ctx = c.getContext('2d'), r = rng(31);
  const cx = s / 2;
  ctx.strokeStyle = '#ffffff';
  ctx.lineCap = 'round';
  for (const [rad, lw] of [[500, 6], [470, 3], [330, 5], [300, 2], [120, 4]]) {
    ctx.lineWidth = lw;
    ctx.beginPath(); ctx.arc(cx, cx, rad, 0, Math.PI * 2); ctx.stroke();
  }
  // estrella de 7 puntas
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i <= 7; i++) {
    const a = (i * 3 * Math.PI * 2) / 7 - Math.PI / 2;
    const x = cx + Math.cos(a) * 300, y = cx + Math.sin(a) * 300;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  ctx.lineWidth = 5;
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    sigil(ctx, r, cx + Math.cos(a) * 400, cx + Math.sin(a) * 400, 20);
  }
  return c;
}

let glow;
export function glowTexture() {
  if (glow) return glow;
  const s = 64, c = makeCanvas(s, s), ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.8)');
  g.addColorStop(0.6, 'rgba(255,255,255,0.15)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  glow = new THREE.CanvasTexture(c);
  return glow;
}

// Etiqueta de texto que siempre mira a la cámara.
export function makeLabel(text, opts = {}) {
  const {
    fontSize = 44, weight = 700, font = '"Alegreya Sans", sans-serif',
    color = '#f3e6c4', bg = 'rgba(12,9,16,0.78)', border = 'rgba(212,175,106,0.9)', height = 0.36,
  } = opts;
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  ctx.font = `${weight} ${fontSize}px ${font}`;
  const w = Math.ceil(ctx.measureText(text).width + fontSize * 1.1);
  const h = Math.ceil(fontSize * 1.65);
  c.width = w;
  c.height = h;
  ctx.font = `${weight} ${fontSize}px ${font}`;
  ctx.fillStyle = bg;
  ctx.strokeStyle = border;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(2, 2, w - 4, h - 4, h * 0.3);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 + 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set((height * w) / h, height, 1);
  sprite.renderOrder = 10;
  return sprite;
}
