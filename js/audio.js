// Música y efectos de sonido generados en el navegador (Web Audio API).
// No hay ningún archivo de audio: todo se sintetiza en tiempo real, así que
// no hay derechos de autor que respetar ni nada que descargar.
//
// Música por ambientes (fundido de 3 s al cambiar):
//   casa     → cálida y melancólica: acordes suaves + caja de música
//   exterior → abierta y fría: bordón grave, acordes lentos, viento y búhos
//   torre    → opresiva: bordón muy grave, coro oscuro y campana lejana
//   boveda   → Piso II: grave y metálico, campana lejana y gotas
//   scriptorium → Piso III: caja de música en re dórico y velas
//   archipielago → Piso IV: viento y notas agudas espaciadas
//   taller   → Piso V: pulso suave de 90 bpm y martillo lejano
//   forja    → Piso VI: golpes de yunque y rugido del horno
//   criptas  → Piso VIII: acordes disminuidos y susurros
// Efectos: pasos (piedra, hierba, madera), salto, hechizos, impacto,
// chisporroteo, acierto, fallo, sello, puerta, cristal roto, teletransporte…

const NOTA = (n) => 440 * Math.pow(2, (n - 69) / 12); // número MIDI → Hz

// Acordes en re menor (números MIDI)
const ACORDES = {
  casa: [[50, 57, 62, 65], [46, 53, 58, 62], [43, 50, 55, 58], [45, 52, 57, 61]],   // Rem Sib Solm La
  exterior: [[38, 50, 53, 57], [36, 48, 52, 55], [34, 46, 50, 53], [33, 45, 49, 52]], // Rem Do Sib La
  torre: [[38, 50, 53, 57], [39, 51, 55, 58]],                                        // Rem Mib (frigio)
  boveda: [[38, 45, 50, 53], [34, 46, 50, 53], [36, 43, 48, 52]],                    // Rem Sib Do
  criptas: [[38, 44, 47, 50], [39, 45, 48, 51]],                                      // disminuidos
  scriptorium: [[38, 50, 53, 57], [43, 50, 55, 59], [36, 48, 52, 55], [45, 52, 57, 60]], // Rem Sol Do Lam (dórico)
  parque: [[50, 57, 62, 66], [55, 59, 62, 67], [47, 54, 59, 62], [45, 52, 57, 61]],      // Re Sol Sim La (mayor: nuestro mundo)
};
const PENTA = [62, 65, 67, 69, 72, 74, 77]; // re menor pentatónica para la caja de música
const DORICO = [62, 64, 65, 67, 69, 71, 72, 74]; // re dórico (scriptorium)

export class Sonido {
  constructor() {
    this.ctx = null;
    this.silencio = false;
    this.ambiente = null;
    this.capas = {};
    this.volumenes = { musica: 0.5, efectos: 0.85 };
  }

  // volumen de la música y de los efectos (menú de opciones), de 0 a 1
  ajustarVolumen(musica, efectos) {
    this.volumenes = { musica, efectos };
    if (!this.ctx) return;
    this.musica.gain.setTargetAtTime(musica, this.ctx.currentTime, 0.05);
    this.efectos.gain.setTargetAtTime(efectos, this.ctx.currentTime, 0.05);
  }

  // Hay que llamarlo tras un clic o una tecla: los navegadores no dejan sonar antes.
  iniciar() {
    if (this.ctx) {
      this.ctx.resume();
      return;
    }
    const ctx = this.ctx = new AudioContext();
    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 4;
    this.master.connect(comp).connect(ctx.destination);

    // reverberación con una respuesta de impulso generada (ruido que se apaga)
    this.reverb = ctx.createConvolver();
    const len = ctx.sampleRate * 3.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    this.reverb.buffer = ir;
    const humedo = ctx.createGain();
    humedo.gain.value = 0.42;
    this.reverb.connect(humedo).connect(this.master);

    this.musica = ctx.createGain();
    this.musica.gain.value = this.volumenes.musica;
    this.musica.connect(this.master);
    this.musica.connect(this.reverb);
    this.efectos = ctx.createGain();
    this.efectos.gain.value = this.volumenes.efectos;
    this.efectos.connect(this.master);
    const envio = ctx.createGain();
    envio.gain.value = 0.25;
    this.efectos.connect(envio).connect(this.reverb);

    this.ruidoBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const r = this.ruidoBuf.getChannelData(0);
    for (let i = 0; i < r.length; i++) r[i] = Math.random() * 2 - 1;
  }

  alternarSilencio() {
    this.silencio = !this.silencio;
    if (this.ctx) this.master.gain.setTargetAtTime(this.silencio ? 0 : 0.9, this.ctx.currentTime, 0.1);
    return this.silencio;
  }

  // ---------- Piezas básicas ----------
  tono(freq, dur, { tipo = 'sine', vol = 0.2, ataque = 0.01, hasta = null, destino = this.efectos, cuando = 0, filtro = null } = {}) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + cuando;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(freq, t);
    if (hasta) o.frequency.exponentialRampToValueAtTime(hasta, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let salida = g;
    if (filtro) {
      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = filtro;
      g.connect(f);
      salida = f;
    }
    o.connect(g);
    salida.connect(destino);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  ruido(dur, { tipo = 'bandpass', freq = 1000, hasta = null, q = 1, vol = 0.2, ataque = 0.005, destino = this.efectos, cuando = 0 } = {}) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + cuando;
    const s = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
    s.buffer = this.ruidoBuf;
    s.loop = true;
    f.type = tipo;
    f.Q.value = q;
    f.frequency.setValueAtTime(freq, t);
    if (hasta) f.frequency.exponentialRampToValueAtTime(hasta, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(destino);
    s.start(t, Math.random());
    s.stop(t + dur + 0.05);
  }

  campana(freq, { vol = 0.12, dur = 1.6, cuando = 0, destino = this.efectos } = {}) {
    for (const [k, v] of [[1, 1], [2.76, 0.45], [5.4, 0.2]]) {
      this.tono(freq * k, dur / k ** 0.3, { vol: vol * v, ataque: 0.004, cuando, destino });
    }
  }

  // ---------- Efectos ----------
  paso(superficie, correr) {
    const p = 0.9 + Math.random() * 0.2, v = correr ? 1.25 : 1;
    if (superficie === 'hierba') {
      this.ruido(0.13, { freq: 2400 * p, q: 0.8, vol: 0.09 * v });
      this.ruido(0.08, { tipo: 'lowpass', freq: 500, vol: 0.06 * v });
    } else if (superficie === 'madera') {
      this.tono(150 * p, 0.07, { tipo: 'triangle', vol: 0.12 * v });
      this.ruido(0.06, { freq: 700 * p, q: 2, vol: 0.1 * v });
    } else {
      this.ruido(0.07, { freq: 1000 * p, q: 1.4, vol: 0.13 * v });
      this.tono(85 * p, 0.06, { vol: 0.1 * v });
    }
  }

  salto() { this.ruido(0.12, { freq: 600, hasta: 1400, q: 1, vol: 0.06 }); }

  aterrizaje() {
    this.tono(70, 0.16, { vol: 0.25 });
    this.ruido(0.1, { tipo: 'lowpass', freq: 400, vol: 0.12 });
  }

  lanzar(colorHex) {
    const base = 300 + ((colorHex >> 8) & 0xff) * 2.5;
    this.ruido(0.5, { freq: 300, hasta: 3200, q: 1.2, vol: 0.2 });
    this.tono(base, 0.45, { tipo: 'triangle', vol: 0.09, hasta: base * 2.5 });
    for (let i = 0; i < 5; i++) this.tono(2000 + Math.random() * 3000, 0.12, { vol: 0.03, cuando: 0.05 + i * 0.05 });
  }

  impacto() {
    this.ruido(0.6, { tipo: 'lowpass', freq: 1400, hasta: 150, vol: 0.35 });
    this.tono(110, 0.5, { vol: 0.35, hasta: 38 });
  }

  chisporroteo() {
    for (let i = 0; i < 8; i++) this.ruido(0.03, { freq: 2500 + Math.random() * 2500, q: 4, vol: 0.12, cuando: Math.random() * 0.45 });
    this.tono(300, 0.5, { tipo: 'square', vol: 0.04, hasta: 70, filtro: 1200 });
  }

  acierto() {
    this.campana(NOTA(76), { vol: 0.13 });
    this.campana(NOTA(81), { vol: 0.13, cuando: 0.11 });
  }

  fallo() {
    this.tono(110, 0.4, { tipo: 'sawtooth', vol: 0.08, filtro: 700 });
    this.tono(116.5, 0.4, { tipo: 'sawtooth', vol: 0.08, filtro: 700 });
  }

  sello() {
    [72, 76, 79, 84].forEach((n, i) => this.campana(NOTA(n), { vol: 0.11, dur: 2.4, cuando: i * 0.09 }));
    this.tono(55, 2.2, { vol: 0.35, ataque: 0.02 });
    this.ruido(1.4, { freq: 400, hasta: 5000, q: 0.7, vol: 0.08, ataque: 0.6 });
  }

  puerta() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(), lfo = this.ctx.createOscillator(), prof = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.value = 75;
    lfo.frequency.value = 6;
    prof.gain.value = 22;
    lfo.connect(prof).connect(o.frequency);
    f.type = 'bandpass';
    f.frequency.value = 420;
    f.Q.value = 3;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.14, t + 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2);
    o.connect(f).connect(g).connect(this.efectos);
    o.start(t); lfo.start(t);
    o.stop(t + 2.1); lfo.stop(t + 2.1);
    this.ruido(2.6, { tipo: 'lowpass', freq: 160, vol: 0.3, ataque: 0.4 });
  }

  cristalRoto() {
    for (let i = 0; i < 12; i++) this.tono(2000 + Math.random() * 4500, 0.25 + Math.random() * 0.3, { vol: 0.04, cuando: Math.random() * 0.12 });
    this.ruido(0.35, { tipo: 'highpass', freq: 4000, vol: 0.15 });
  }

  teletransporte() {
    this.tono(200, 1.3, { vol: 0.12, hasta: 1600, ataque: 0.2 });
    this.ruido(1.4, { freq: 300, hasta: 6000, q: 2, vol: 0.12, ataque: 0.5 });
    [74, 78, 81, 86].forEach((n, i) => this.campana(NOTA(n), { vol: 0.07, cuando: 1.0 + i * 0.07 }));
  }

  holograma() {
    this.tono(1200, 0.08, { vol: 0.04 });
    this.tono(1800, 0.1, { vol: 0.035, cuando: 0.07 });
  }

  clic() { this.tono(1500, 0.03, { vol: 0.03 }); }

  // ataques con el arma de cada personaje
  ataque(tipo) {
    if (tipo === 'disparo') { // chasquido de la cuerda de la ballesta
      this.tono(220, 0.12, { tipo: 'triangle', vol: 0.12, hasta: 90 });
      this.ruido(0.05, { freq: 3000, q: 2, vol: 0.1 });
    } else if (tipo === 'giro') { // barrido largo y grave
      this.ruido(0.55, { freq: 300, hasta: 1400, q: 1.2, vol: 0.16, ataque: 0.15 });
      this.tono(90, 0.4, { vol: 0.1, cuando: 0.25 });
    } else if (tipo === 'punalada') { // dos silbidos cortos
      this.ruido(0.1, { freq: 2600, hasta: 5000, q: 2, vol: 0.1 });
      this.ruido(0.1, { freq: 2600, hasta: 5000, q: 2, vol: 0.1, cuando: 0.18 });
    } else { // tajo de espada
      this.ruido(0.22, { freq: 900, hasta: 3500, q: 1.5, vol: 0.14 });
      this.tono(1400, 0.25, { vol: 0.03, cuando: 0.2 });
    }
  }

  // coger y dejar un objeto (los orbes de la cripta 3-2-1)
  coger() {
    this.tono(520, 0.18, { tipo: 'triangle', vol: 0.07, hasta: 880 });
    this.campana(NOTA(84), { vol: 0.05, dur: 0.9, cuando: 0.08 });
  }

  palanca() {
    this.tono(900, 0.04, { tipo: 'square', vol: 0.05, filtro: 2500 });
    this.tono(420, 0.08, { tipo: 'triangle', vol: 0.08, cuando: 0.05 });
    this.ruido(0.05, { freq: 2200, q: 3, vol: 0.06 });
  }

  // zumbido que sube al tender un enlace de red
  cable() {
    this.tono(180, 0.35, { tipo: 'sawtooth', vol: 0.05, hasta: 720, filtro: 1800 });
    this.campana(NOTA(88), { vol: 0.04, dur: 0.8, cuando: 0.3 });
  }

  dejar() {
    this.tono(660, 0.2, { tipo: 'triangle', vol: 0.07, hasta: 330 });
    this.tono(90, 0.25, { vol: 0.18 });
  }

  mensaje() {
    this.tono(880, 0.09, { vol: 0.045 });
    this.tono(1320, 0.12, { vol: 0.04, cuando: 0.08 });
  }

  // ---------- Música por ambientes ----------
  ambientar(nombre) {
    if (!this.ctx || this.ambiente === nombre) return;
    const t = this.ctx.currentTime;
    if (this.ambiente && this.capas[this.ambiente]) {
      const viejo = this.capas[this.ambiente];
      viejo.salida.gain.setTargetAtTime(0.0001, t, 1.0);
      viejo.parar();
      setTimeout(() => viejo.desconectar(), 6000);
      delete this.capas[this.ambiente];
    }
    this.ambiente = nombre;
    const capa = this.crearCapa(nombre);
    capa.salida.gain.setValueAtTime(0.0001, t);
    capa.salida.gain.setTargetAtTime(1, t + 0.2, 1.0);
    this.capas[nombre] = capa;
  }

  crearCapa(nombre) {
    const ctx = this.ctx;
    const salida = ctx.createGain();
    salida.connect(this.musica);
    const nodos = [], temporizadores = [];
    let vivo = true;
    const cada = (fn, ms) => {
      const vuelta = () => { if (!vivo) return; fn(); temporizadores.push(setTimeout(vuelta, typeof ms === 'function' ? ms() : ms)); };
      vuelta();
    };

    // bordón continuo
    const bordon = (freq, tipo, vol, corte) => {
      const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = tipo;
      o.frequency.value = freq;
      o.detune.value = (Math.random() - 0.5) * 8;
      f.type = 'lowpass';
      f.frequency.value = corte;
      g.gain.value = vol;
      o.connect(f).connect(g).connect(salida);
      o.start();
      nodos.push(o);
    };

    // acorde de fondo (pad): tres osciladores desafinados por nota
    const acorde = (notas, dur, vol, corte) => {
      const t = ctx.currentTime;
      const f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = 'lowpass';
      f.frequency.value = corte;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.35);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 1.25);
      f.connect(g).connect(salida);
      for (const n of notas) {
        for (const d of [-7, 0, 7]) {
          const o = ctx.createOscillator();
          o.type = 'sawtooth';
          o.frequency.value = NOTA(n);
          o.detune.value = d;
          o.connect(f);
          o.start(t);
          o.stop(t + dur * 1.3);
        }
      }
    };

    // viento: ruido filtrado cuyo tono sube y baja despacio
    const viento = (vol) => {
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      const lfo = ctx.createOscillator(), prof = ctx.createGain();
      s.buffer = this.ruidoBuf;
      s.loop = true;
      f.type = 'bandpass';
      f.frequency.value = 500;
      f.Q.value = 0.8;
      lfo.frequency.value = 0.07;
      prof.gain.value = 300;
      lfo.connect(prof).connect(f.frequency);
      g.gain.value = vol;
      s.connect(f).connect(g).connect(salida);
      s.start();
      lfo.start();
      nodos.push(s, lfo);
    };

    let i = 0;
    if (nombre === 'casa') {
      cada(() => acorde(ACORDES.casa[i++ % 4], 8, 0.035, 900), 8000);
      cada(() => {
        if (Math.random() < 0.6) this.campana(NOTA(PENTA[Math.floor(Math.random() * PENTA.length)] + 12), { vol: 0.035, dur: 2.2, destino: salida });
      }, () => 700 + Math.random() * 1300);
    } else if (nombre === 'parque') {
      // el mundo de los chicos: tarde cálida en modo mayor y pájaros
      cada(() => acorde(ACORDES.parque[i++ % 4], 6, 0.03, 1400), 6000);
      cada(() => {
        if (Math.random() < 0.5) this.campana(NOTA([74, 76, 78, 81, 83, 86][Math.floor(Math.random() * 6)]), { vol: 0.025, dur: 1.6, destino: salida });
      }, () => 900 + Math.random() * 1400);
      cada(() => {
        const f = 2600 + Math.random() * 1400;
        this.tono(f, 0.07, { vol: 0.02, hasta: f * 1.25, destino: salida });
        this.tono(f * 1.1, 0.06, { vol: 0.018, hasta: f * 0.9, cuando: 0.1, destino: salida });
      }, () => 1500 + Math.random() * 2500);
    } else if (nombre === 'exterior') {
      bordon(NOTA(38), 'sine', 0.09, 400);
      bordon(NOTA(38), 'sawtooth', 0.02, 260);
      viento(0.05);
      cada(() => acorde(ACORDES.exterior[i++ % 4], 10, 0.03, 650), 10000);
      cada(() => {
        if (Math.random() < 0.35) this.campana(NOTA(PENTA[Math.floor(Math.random() * 4)]), { vol: 0.03, dur: 3, destino: salida });
      }, () => 2500 + Math.random() * 3000);
      // un búho de vez en cuando
      cada(() => {
        if (i < 1) return;
        this.tono(430, 0.35, { vol: 0.04, hasta: 380, ataque: 0.05, destino: salida });
        this.tono(420, 0.5, { vol: 0.04, hasta: 360, ataque: 0.05, cuando: 0.5, destino: salida });
      }, () => 18000 + Math.random() * 20000);
    } else if (nombre === 'torre') {
      bordon(NOTA(26), 'sawtooth', 0.05, 180);
      bordon(NOTA(33), 'sawtooth', 0.035, 200);
      bordon(NOTA(38), 'sine', 0.06, 400);
      cada(() => acorde(ACORDES.torre[i++ % 2], 12, 0.028, 520), 12000);
      cada(() => this.campana(NOTA(38), { vol: 0.07, dur: 5, destino: salida }), () => 12000 + Math.random() * 6000);
      // crepitar de antorchas
      cada(() => this.ruido(0.025, { freq: 3000 + Math.random() * 2000, q: 5, vol: 0.02 + Math.random() * 0.03, destino: salida }), () => 60 + Math.random() * 220);
    } else if (nombre === 'scriptorium') {
      // íntimo: caja de música en modo dórico y crepitar de velas
      bordon(NOTA(38), 'sine', 0.06, 350);
      cada(() => acorde(ACORDES.scriptorium[i++ % 4], 10, 0.02, 600), 10000);
      cada(() => {
        if (Math.random() < 0.7) this.campana(NOTA(DORICO[Math.floor(Math.random() * DORICO.length)] + 12), { vol: 0.03, dur: 2, destino: salida });
      }, () => 600 + Math.random() * 1100);
      cada(() => this.ruido(0.02, { freq: 3500 + Math.random() * 2000, q: 5, vol: 0.012 + Math.random() * 0.02, destino: salida }), () => 90 + Math.random() * 300);
    } else if (nombre === 'archipielago') {
      // abierto y ventoso: viento intenso y notas agudas espaciadas
      bordon(NOTA(38), 'sine', 0.05, 300);
      viento(0.08);
      cada(() => acorde(ACORDES.exterior[i++ % 4], 12, 0.018, 700), 12000);
      cada(() => {
        if (Math.random() < 0.5) this.campana(NOTA(PENTA[Math.floor(Math.random() * PENTA.length)] + 12), { vol: 0.03, dur: 3.5, destino: salida });
      }, () => 2200 + Math.random() * 3500);
    } else if (nombre === 'taller') {
      // rítmico suave: pulso de 90 bpm con un martillo lejano y acordes cálidos
      bordon(NOTA(38), 'sine', 0.05, 320);
      cada(() => acorde(ACORDES.casa[i++ % 4], 9, 0.018, 800), 9000);
      let golpe = 0;
      cada(() => {
        golpe++;
        this.ruido(0.06, { tipo: 'lowpass', freq: 500, vol: golpe % 4 === 1 ? 0.05 : 0.025, destino: salida });
        if (golpe % 8 === 5) this.campana(NOTA(69), { vol: 0.025, dur: 1.2, destino: salida });
      }, 667);
    } else if (nombre === 'forja') {
      // grave, con golpes de yunque (ruido y tono corto) cada 2 s y el rugido del horno
      bordon(NOTA(26), 'sawtooth', 0.04, 200);
      bordon(NOTA(33), 'sine', 0.05, 300);
      cada(() => acorde(ACORDES.torre[i++ % 2], 12, 0.02, 500), 12000);
      let golpe = 0;
      cada(() => {
        golpe++;
        if (golpe % 3 === 0) return;
        this.ruido(0.08, { freq: 2600, q: 2, vol: 0.05, destino: salida });
        this.tono(NOTA(64 + (golpe % 2) * 3), 0.6, { vol: 0.025, destino: salida });
      }, 2000);
      cada(() => this.ruido(1.8, { tipo: 'lowpass', freq: 220, vol: 0.03, ataque: 0.6, destino: salida }), 1700);
    } else if (nombre === 'criptas') {
      // tensión: acordes disminuidos y susurros (ruido de banda estrecha que sube y baja)
      bordon(NOTA(27), 'sawtooth', 0.035, 180);
      bordon(NOTA(33), 'sine', 0.05, 260);
      cada(() => acorde(ACORDES.criptas[i++ % 2], 11, 0.022, 480), 11000);
      cada(() => this.ruido(1.6, { freq: 1800 + Math.random() * 1500, hasta: 900, q: 9, vol: 0.02, ataque: 0.5, destino: salida }), () => 3500 + Math.random() * 5000);
      cada(() => this.campana(NOTA(39), { vol: 0.04, dur: 4, destino: salida }), () => 9000 + Math.random() * 7000);
    } else if (nombre === 'boveda') {
      // grave y metálico: bordón en re, campana lejana y gotas que caen en la bóveda
      bordon(NOTA(26), 'sine', 0.08, 300);
      bordon(NOTA(38), 'triangle', 0.03, 500);
      bordon(NOTA(45), 'sawtooth', 0.012, 380);
      cada(() => acorde(ACORDES.boveda[i++ % 3], 14, 0.022, 480), 14000);
      cada(() => this.campana(NOTA(50), { vol: 0.06, dur: 6, destino: salida }), () => 13000 + Math.random() * 5000);
      cada(() => {
        const f = 1800 + Math.random() * 1400;
        this.tono(f, 0.09, { vol: 0.025, hasta: f * 0.55, destino: salida });
      }, () => 1500 + Math.random() * 4500);
    }

    return {
      salida,
      parar() {
        vivo = false;
        temporizadores.forEach(clearTimeout);
      },
      desconectar() {
        for (const n of nodos) { try { n.stop(); } catch { /* ya parado */ } }
        salida.disconnect();
      },
    };
  }
}
