// ===== Pipeboy — Áudio (sintetizado com Web Audio API, sem arquivos) =====
const Sound = {
  ctx: null,
  master: null,
  muted: false,
  _engine: null, // nó do motor da retroescavadeira (loop)

  init() {
    if (this.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.35;
      this.master.connect(this.ctx.destination);
    } catch (e) {
      this.ctx = null;
    }
  },

  // deve ser chamado a partir de um gesto do usuário (clique/tecla)
  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.35;
    return this.muted;
  },

  // toca uma nota simples
  _blip(freq, dur, type = 'square', vol = 0.5, slideTo = null) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(this.master);
    osc.start(t); osc.stop(t + dur + 0.02);
  },

  // ruído (para impactos/gosma)
  _noise(dur, vol = 0.4, lp = 1200) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const n = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = lp;
    const g = this.ctx.createGain(); g.gain.value = vol;
    src.connect(filt); filt.connect(g); g.connect(this.master);
    src.start(t);
  },

  // ---- efeitos do jogo ----
  jump()     { this._blip(320, 0.16, 'square', 0.4, 620); },
  attack()   { this._blip(180, 0.10, 'sawtooth', 0.35, 90); this._noise(0.08, 0.2, 2000); },
  pickup()   { this._blip(520, 0.08, 'square', 0.4); setTimeout(() => this._blip(780, 0.1, 'square', 0.4), 70); },
  deliver()  { [523, 659, 784].forEach((f, i) => setTimeout(() => this._blip(f, 0.14, 'triangle', 0.5), i * 90)); },
  monster()  { this._noise(0.18, 0.5, 700); this._blip(120, 0.18, 'sawtooth', 0.3, 60); },
  hurt()     { this._blip(200, 0.2, 'sawtooth', 0.5, 70); this._noise(0.1, 0.3, 900); },
  smash()    { this._noise(0.22, 0.7, 500); this._blip(90, 0.22, 'square', 0.5, 40); },
  horn()     { this._blip(330, 0.18, 'sawtooth', 0.5); setTimeout(() => this._blip(262, 0.28, 'sawtooth', 0.5), 160); },
  rant()     { // vilão esbravejando
    this._blip(160, 0.12, 'sawtooth', 0.5, 110);
    setTimeout(() => this._blip(140, 0.12, 'sawtooth', 0.5, 100), 130);
    setTimeout(() => this._blip(180, 0.16, 'sawtooth', 0.5, 90), 260);
  },
  win()      { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this._blip(f, 0.2, 'triangle', 0.5), i * 140)); },
  lose()     { [400, 330, 262, 180].forEach((f, i) => setTimeout(() => this._blip(f, 0.25, 'sawtooth', 0.5), i * 160)); },

  // motor da retroescavadeira em loop
  startEngine() {
    if (!this.ctx || this.muted || this._engine) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoG = this.ctx.createGain();
    osc.type = 'sawtooth'; osc.frequency.value = 70;
    lfo.type = 'sine'; lfo.frequency.value = 9; lfoG.gain.value = 14;
    lfo.connect(lfoG); lfoG.connect(osc.frequency);
    g.gain.value = 0.18;
    osc.connect(g); g.connect(this.master);
    osc.start(t); lfo.start(t);
    this._engine = { osc, lfo, g };
  },
  stopEngine() {
    if (!this._engine) return;
    try { this._engine.osc.stop(); this._engine.lfo.stop(); } catch (e) {}
    this._engine = null;
  },
};
