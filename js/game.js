// ===== Pipeboy — Motor principal =====

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = 'start';
    this.camX = 0;
    this.time = 0;
    this.bindOverlays();
  }

  bindOverlays() {
    this.ovStart = document.getElementById('overlay-start');
    this.ovPause = document.getElementById('overlay-pause');
    this.ovEnd = document.getElementById('overlay-end');
    this.endTitle = document.getElementById('end-title');
    this.endMsg = document.getElementById('end-msg');
  }

  start() {
    this.siteX = CONFIG.LEVEL_WIDTH - 300;
    this.requirements = Object.assign({}, CONFIG.REQUIREMENTS);
    this.delivered = {};
    this.progress = 0;              // 0..100 (barra da obra)
    this.player = new Player(60);
    this.sorgei = new Sorgei(this.siteX);
    this.prevSorgeiState = 'away';
    this.monsters = [];
    this.workers = [];
    this.crates = [];
    this.powerups = [];
    this.floaters = [];
    this.score = 0;
    this.rescued = 0;
    this.spawnTimer = 180;
    this.time = 0;
    this.camX = 0;

    this.buildLevel();
    Sound.stopEngine();

    this.state = 'playing';
    this.ovStart.classList.add('hidden');
    this.ovEnd.classList.add('hidden');
    this.ovPause.classList.add('hidden');
  }

  buildLevel() {
    const req = this.requirements;
    const types = [];
    for (const k of CONFIG.BUILD_MATERIALS) for (let i = 0; i < req[k] + 2; i++) types.push(k);
    for (let i = 0; i < req[CONFIG.CONE_KEY] + 1; i++) types.push(CONFIG.CONE_KEY);
    types.push('placa', 'escora');
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }
    const span = this.siteX - 250 - 300;
    types.forEach((t, i) => {
      const x = 300 + span * (i / types.length) + (i % 2 ? 30 : 0);
      this.crates.push(new ItemCrate(x, t));
    });
    // cluster perto da obra
    ['tubo', 'tampao', 'cone'].forEach((t, i) => this.crates.push(new ItemCrate(this.siteX - 360 + i * 40, t)));

    // 5 funcionários espalhados
    [500, 1100, 1700, 2300, 2800].forEach((x) => this.workers.push(new Worker(x)));

    // uma única retroescavadeira
    this.powerups.push(new PowerUp(1450, 'backhoe'));
  }

  togglePause() {
    if (this.state === 'playing') { this.state = 'paused'; Sound.stopEngine(); this.ovPause.classList.remove('hidden'); }
    else if (this.state === 'paused') { this.state = 'playing'; this.ovPause.classList.add('hidden'); }
  }

  addFloater(x, y, text, color) { this.floaters.push({ x, y, text, color, life: 60 }); }

  handlePickDeliver() {
    const p = this.player;
    const atSite = Math.abs(p.x - (this.siteX + 85)) < 130;
    if (atSite && p.totalCarried() > 0) { this.deliverMaterials(); return; }
    for (const c of this.crates) {
      if (!c.taken && Math.abs((c.x + c.w / 2) - p.x) < 48) {
        if (p.addItem(c.type)) { c.taken = true; Sound.pickup(); }
        return;
      }
    }
    if (p.mode === 'normal' && p.totalCarried() > 0) {
      const t = p.carryType();
      p.inventory[t]--; if (p.inventory[t] <= 0) delete p.inventory[t];
      this.crates.push(new ItemCrate(p.x - 18, t));
    }
  }

  deliverMaterials() {
    const req = this.requirements;
    const inv = this.player.takeInventory();
    let any = false;
    for (const k in inv) for (let i = 0; i < inv[k]; i++) {
      any = true;
      if ((this.delivered[k] || 0) < (req[k] || 0)) { this.delivered[k] = (this.delivered[k] || 0) + 1; this.score += CONFIG.SCORE_DELIVER; }
      else this.score += 20;
    }
    if (any) { Sound.deliver(); this.addFloater(this.player.x, this.player.y - 100, 'Entregue!', '#7CFC00'); }
  }

  // teto da barra = material mais atrasado (mínimo)
  buildCap() {
    let minRatio = 1;
    for (const k of CONFIG.BUILD_MATERIALS) {
      const r = Math.min(this.delivered[k] || 0, this.requirements[k]) / this.requirements[k];
      if (r < minRatio) minRatio = r;
    }
    return minRatio * 100;
  }
  conesOk() { return (this.delivered[CONFIG.CONE_KEY] || 0) >= this.requirements[CONFIG.CONE_KEY]; }

  end(won) {
    this.state = won ? 'won' : 'lost';
    Sound.stopEngine();
    if (won) Sound.win(); else Sound.lose();
    this.ovEnd.classList.remove('hidden');
    if (won) {
      this.endTitle.textContent = '✅ OBRA CONCLUÍDA!';
      this.endTitle.style.color = '#7CFC00';
      this.endMsg.innerHTML = `George Sanear concluiu a rede a 100%!<br>Pontuação final: <b>${this.score}</b>`;
    } else {
      this.endTitle.textContent = '💀 FIM DE JORNADA';
      this.endTitle.style.color = '#ff5a4d';
      this.endMsg.innerHTML = `Os monstros de esgoto derrubaram o George.<br>Progresso da obra: <b>${Math.floor(this.progress)}%</b> • Pontuação: <b>${this.score}</b>`;
    }
  }

  update(input) {
    if (this.state !== 'playing') return;
    this.time++;
    const p = this.player;
    p.update(input);
    if (!p.inBackhoe) Sound.stopEngine();

    // spawn de monstros
    this.spawnTimer--;
    if (this.spawnTimer <= 0 && this.monsters.length < 5) {
      this.spawnTimer = 200 + Math.random() * 130;
      const kind = Math.random() < 0.4 ? 'grease' : 'feces';
      const side = Math.random() < 0.5 ? -1 : 1;
      let mx = p.x + side * (360 + Math.random() * 260);
      mx = Math.max(60, Math.min(CONFIG.LEVEL_WIDTH - 60, mx));
      this.monsters.push(new Monster(mx, kind));
    }

    const rob = p.runoverbox();
    const hb = p.hitbox();
    for (const m of this.monsters) {
      m.update(p);
      if (m.emerge > 0) continue;
      if (rob && overlap(rob, m.bounds())) {
        m.dead = true; this.score += CONFIG.SCORE_KILL;
        this.addFloater(m.x, m.y - 60, 'ESMAGADO', '#f2c200'); Sound.monster(); continue;
      }
      if (!p.inBackhoe && overlap(m.bounds(), p.bounds())) {
        if (p.hurt(12)) { this.addFloater(p.x, p.y - 100, '-12', '#ff5a4d'); Sound.hurt(); }
      }
      if (hb && overlap(hb, m.bounds())) {
        m.hp--; if (m.hp <= 0) m.dead = true;
        if (m.dead) { this.score += CONFIG.SCORE_KILL; this.addFloater(m.x, m.y - 60, '+' + CONFIG.SCORE_KILL, '#ffd479'); Sound.monster(); }
      }
    }
    this.monsters = this.monsters.filter((m) => !m.dead && m.x > this.camX - 140 && m.x < this.camX + CONFIG.W + 560);

    // retro atordoa o Sorgei
    if (this.sorgei.state !== 'away' && this.sorgei.stun <= 0 && rob && overlap(rob, this.sorgei.bounds())) {
      this.sorgei.stunHit(); this.score += 50;
      this.addFloater(this.sorgei.x, this.sorgei.y - 70, 'SORGEI FUGIU!', '#7CFC00'); Sound.smash();
    }

    // funcionários
    const conesOk = this.conesOk();
    let workingCount = 0;
    for (const w of this.workers) w.working = false;
    for (const w of this.workers) {
      w.update(p);
      if (w.mode === 'lost' && overlap(w.bounds(), p.bounds())) {
        w.rescue(); this.addFloater(w.x, w.y - 90, 'Resgatado!', '#7CFC00'); Sound.pickup();
      }
      if (w.mode === 'follow' && Math.abs(w.x - (this.siteX + 85)) < 130) {
        w.deliver(this.siteX - 50 - workingCount * 30);
        this.rescued++; this.score += CONFIG.SCORE_RESCUE;
        this.addFloater(this.siteX + 85, CONFIG.GROUND_Y - 150, '+' + CONFIG.SCORE_RESCUE + ' à obra', '#7CFC00'); Sound.deliver();
      }
      if (w.mode === 'work') {
        w.working = conesOk;
        w.slotX = this.siteX - 50 - workingCount * 30;
        workingCount++;
      }
    }

    // Sorgei
    this.sorgei.update(p, this.workers);
    if (this.prevSorgeiState !== 'ranting' && this.sorgei.state === 'ranting') {
      this.addFloater(this.siteX + 85, CONFIG.GROUND_Y - 150, 'Sorgei levou a equipe!', '#ff3b30');
    }
    this.prevSorgeiState = this.sorgei.state;

    // ---- progresso da obra ----
    const cap = this.buildCap();
    if (conesOk && workingCount > 0) {
      this.progress += CONFIG.PROGRESS_PER_WORKER * workingCount;
      if (this.progress > cap) this.progress = cap;
      if (this.progress > 100) this.progress = 100;
    }
    if (this.progress >= 100) { this.end(true); return; }

    // power-ups
    for (const pu of this.powerups) {
      if (!pu.taken && overlap(pu.bounds(), p.bounds())) {
        pu.taken = true; p.setMode('backhoe'); Sound.startEngine();
        this.addFloater(p.x, p.y - 110, 'RETROESCAVADEIRA!', '#f2c200');
      }
    }

    for (const f of this.floaters) { f.y -= 0.8; f.life--; }
    this.floaters = this.floaters.filter((f) => f.life > 0);

    const targetCam = p.x - CONFIG.W * 0.38;
    this.camX += (targetCam - this.camX) * 0.1;
    this.camX = Math.max(0, Math.min(CONFIG.LEVEL_WIDTH - CONFIG.W, this.camX));

    if (p.hp <= 0) { p.hp = 0; this.end(false); }
  }

  draw() {
    const ctx = this.ctx;
    const cam = this.camX;
    this.drawBackground(ctx, cam);
    this.drawGround(ctx, cam);
    if (!this.player) return;

    Sprites.site(ctx, this.siteX - cam, CONFIG.GROUND_Y, this.delivered, this.requirements);
    // barra de progresso acima da obra
    this.drawSiteProgress(ctx, cam);

    for (const c of this.crates) c.draw(ctx, cam);
    for (const pu of this.powerups) pu.draw(ctx, cam);
    for (const w of this.workers) w.draw(ctx, cam);
    for (const m of this.monsters) m.draw(ctx, cam);
    this.player.draw(ctx, cam);
    this.sorgei.draw(ctx, cam);

    for (const f of this.floaters) {
      ctx.fillStyle = f.color; ctx.font = 'bold 16px monospace';
      ctx.fillText(f.text, f.x - cam, f.y);
    }
    this.drawHUD(ctx);
  }

  drawSiteProgress(ctx, cam) {
    const sx = this.siteX - cam + 85;
    const y = CONFIG.GROUND_Y - 32;
    const w = 150;
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(sx - w / 2 - 3, y - 3, w + 6, 20);
    ctx.fillStyle = '#333'; ctx.fillRect(sx - w / 2, y, w, 14);
    // teto pelos materiais
    const cap = this.buildCap();
    ctx.fillStyle = '#5a4a20'; ctx.fillRect(sx - w / 2, y, w * cap / 100, 14);
    // progresso
    ctx.fillStyle = this.conesOk() ? '#3ad13a' : '#e8a33a';
    ctx.fillRect(sx - w / 2, y, w * this.progress / 100, 14);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
    ctx.fillText(Math.floor(this.progress) + '%', sx, y + 11);
    ctx.textAlign = 'left';
  }

  drawBackground(ctx, cam) {
    const C = CONFIG.COLORS;
    const g = ctx.createLinearGradient(0, 0, 0, CONFIG.GROUND_Y);
    g.addColorStop(0, C.skyFar); g.addColorStop(1, C.sky);
    ctx.fillStyle = g; ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);
    ctx.fillStyle = '#fff4c0';
    ctx.beginPath(); ctx.arc(CONFIG.W - 180, 90, 42, 0, 7); ctx.fill();
    const par = cam * 0.4;
    for (let i = -1; i < 18; i++) {
      const bx = i * 150 - (par % 150);
      const bh = 110 + ((i * 57) % 150);
      ctx.fillStyle = i % 2 ? '#7d93aa' : '#8fa6bd';
      ctx.fillRect(bx, CONFIG.GROUND_Y - bh, 110, bh);
      ctx.fillStyle = '#cfe0f0';
      for (let wy = CONFIG.GROUND_Y - bh + 14; wy < CONFIG.GROUND_Y - 14; wy += 26) {
        for (let wx = bx + 12; wx < bx + 98; wx += 26) ctx.fillRect(wx, wy, 12, 14);
      }
    }
  }

  drawGround(ctx, cam) {
    const C = CONFIG.COLORS;
    ctx.fillStyle = C.asphalt; ctx.fillRect(0, CONFIG.GROUND_Y, CONFIG.W, CONFIG.H - CONFIG.GROUND_Y);
    ctx.fillStyle = '#3a4048'; ctx.fillRect(0, CONFIG.GROUND_Y, CONFIG.W, 8);
    ctx.fillStyle = C.asphaltLine;
    const off = cam % 100;
    for (let x = -off; x < CONFIG.W; x += 100) ctx.fillRect(x, CONFIG.GROUND_Y + 60, 52, 6);
  }

  drawHUD(ctx) {
    const p = this.player;
    // vida
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(14, 14, 264, 30);
    ctx.fillStyle = '#3a1010'; ctx.fillRect(18, 18, 236, 22);
    const hpw = Math.max(0, (p.hp / CONFIG.PLAYER_HP) * 236);
    ctx.fillStyle = p.hp > 30 ? '#3ad13a' : '#ff5a4d'; ctx.fillRect(18, 18, hpw, 22);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px monospace'; ctx.fillText('❤ ' + Math.ceil(p.hp), 26, 34);

    // barra de progresso central
    const bw = 320, bx = CONFIG.W / 2 - bw / 2, by = 22;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(bx - 6, by - 6, bw + 12, 32);
    ctx.fillStyle = '#333'; ctx.fillRect(bx, by, bw, 20);
    const cap = this.buildCap();
    ctx.fillStyle = '#5a4a20'; ctx.fillRect(bx, by, bw * cap / 100, 20);   // teto materiais
    ctx.fillStyle = this.conesOk() ? '#3ad13a' : '#e8a33a';
    ctx.fillRect(bx, by, bw * this.progress / 100, 20);
    // marcador do teto
    ctx.fillStyle = '#ffcc00'; ctx.fillRect(bx + bw * cap / 100 - 1, by - 3, 2, 26);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
    ctx.fillText('OBRA: ' + Math.floor(this.progress) + '%', CONFIG.W / 2, by + 15);
    ctx.textAlign = 'left';

    // status abaixo da barra
    const working = this.workers.filter((w) => w.mode === 'work').length;
    let hint = '', hintColor = '#ffd479';
    if (!this.conesOk()) { hint = '⚠ Faltam cones — funcionários parados'; hintColor = '#ff9a3a'; }
    else if (working === 0) { hint = 'Traga funcionários para a obra!'; hintColor = '#7cd0ff'; }
    else { hint = '👷×' + working + ' trabalhando' + (working >= CONFIG.MAX_WORKERS ? ' (máx.!)' : ''); hintColor = '#7CFC00'; }
    ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = hintColor;
    ctx.fillText(hint, CONFIG.W / 2, by + 40); ctx.textAlign = 'left';

    // placar
    ctx.textAlign = 'right';
    ctx.fillStyle = '#000'; ctx.fillRect(CONFIG.W - 224, 14, 210, 30);
    ctx.fillStyle = '#ffd479'; ctx.font = 'bold 18px monospace';
    ctx.fillText('PONTOS: ' + this.score, CONFIG.W - 22, 35);
    ctx.textAlign = 'left';

    // inventário carregado
    if (p.totalCarried() > 0) {
      const parts = [];
      for (const k in p.inventory) if (p.inventory[k] > 0) parts.push((CONFIG.NAMES[k] || k) + '×' + p.inventory[k]);
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(14, 50, 280, 24);
      ctx.fillStyle = '#fff'; ctx.font = '13px monospace';
      ctx.fillText('Levando: ' + parts.join('  '), 22, 67);
    }
    if (p.mode === 'backhoe') {
      ctx.fillStyle = '#f2c200'; ctx.font = 'bold 14px monospace';
      ctx.fillText('🚜 RETROESCAVADEIRA', 22, 92);
    }

    // seta para a obra
    if (this.siteX - this.camX > CONFIG.W) {
      ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 18px monospace';
      ctx.fillText('OBRA →', CONFIG.W - 150, 110);
    }
  }
}
