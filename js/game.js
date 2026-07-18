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
    this.siteX = CONFIG.LEVEL_WIDTH - 260;
    this.requirements = Object.assign({}, CONFIG.REQUIREMENTS);
    this.delivered = {};
    this.player = new Player(60);
    this.sorgei = new Sorgei(this.siteX);
    this.monsters = [];
    this.workers = [];
    this.crates = [];
    this.powerups = [];
    this.floaters = [];
    this.score = 0;
    this.rescued = 0;
    this.spawnTimer = 150;
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
    // um caixote a mais que o necessário de cada material exigido
    const types = [];
    for (const k in req) for (let i = 0; i < req[k] + 1; i++) types.push(k);
    // materiais extras (sinalização/segurança)
    types.push('placa', 'cone', 'escora', 'tubo', 'tubo');
    // embaralha
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }
    // distribui ao longo da fase
    const span = this.siteX - 200 - 300;
    types.forEach((t, i) => {
      const x = 300 + span * (i / types.length) + (i % 2 ? 26 : 0);
      this.crates.push(new ItemCrate(x, t));
    });
    // cluster de conveniência perto da obra
    ['tubo', 'tubo', 'tampao', 'cone'].forEach((t, i) => {
      this.crates.push(new ItemCrate(this.siteX - 320 + i * 34, t));
    });

    // funcionários perdidos
    this.workers.push(new Worker(650));
    this.workers.push(new Worker(1500));
    this.workers.push(new Worker(2250));

    // power-ups
    this.powerups.push(new PowerUp(1050, 'backhoe'));
    this.powerups.push(new PowerUp(1700, 'sapinho'));
    this.powerups.push(new PowerUp(2400, 'backhoe'));
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      Sound.stopEngine();
      this.ovPause.classList.remove('hidden');
    } else if (this.state === 'paused') {
      this.state = 'playing';
      this.ovPause.classList.add('hidden');
    }
  }

  addFloater(x, y, text, color) {
    this.floaters.push({ x, y, text, color, life: 55 });
  }

  // ---- ações K (pegar / entregar / largar) ----
  handlePickDeliver() {
    const p = this.player;
    const atSite = Math.abs(p.x - (this.siteX + 65)) < 110;

    if (atSite && p.totalCarried() > 0) { this.deliverMaterials(); return; }

    for (const c of this.crates) {
      if (!c.taken && Math.abs((c.x + 14) - p.x) < 44) {
        if (p.addItem(c.type)) { c.taken = true; Sound.pickup(); }
        return;
      }
    }

    // largar (só a pé)
    if (p.mode === 'normal' && p.totalCarried() > 0) {
      const t = p.carryType();
      p.inventory[t]--;
      if (p.inventory[t] <= 0) delete p.inventory[t];
      this.crates.push(new ItemCrate(p.x - 14, t));
    }
  }

  deliverMaterials() {
    const req = this.requirements;
    const inv = this.player.takeInventory();
    let any = false;
    for (const k in inv) {
      for (let i = 0; i < inv[k]; i++) {
        any = true;
        if ((this.delivered[k] || 0) < (req[k] || 0)) {
          this.delivered[k] = (this.delivered[k] || 0) + 1;
          this.score += CONFIG.SCORE_DELIVER;
        } else {
          this.score += 20; // material não exigido: bônus pequeno
        }
      }
    }
    if (any) {
      Sound.deliver();
      this.addFloater(this.player.x, this.player.y - 70, 'Entregue!', '#7CFC00');
      this.checkWin();
    }
  }

  checkWin() {
    for (const k in this.requirements) {
      if ((this.delivered[k] || 0) < this.requirements[k]) return;
    }
    this.end(true);
  }

  end(won) {
    this.state = won ? 'won' : 'lost';
    Sound.stopEngine();
    if (won) Sound.win(); else Sound.lose();
    this.ovEnd.classList.remove('hidden');
    if (won) {
      this.endTitle.textContent = '✅ OBRA CONCLUÍDA!';
      this.endTitle.style.color = '#7CFC00';
      this.endMsg.innerHTML =
        `George Sanear entregou todos os materiais e concluiu a rede!<br>` +
        `Funcionários na obra: <b>${this.workers.filter((w) => w.mode === 'work').length}</b><br>` +
        `Pontuação final: <b>${this.score}</b>`;
    } else {
      this.endTitle.textContent = '💀 FIM DE JORNADA';
      this.endTitle.style.color = '#ff5a4d';
      this.endMsg.innerHTML =
        `Os monstros de esgoto derrubaram o George.<br>` +
        `Pontuação: <b>${this.score}</b>`;
    }
  }

  // ---- update ----
  update(input) {
    if (this.state !== 'playing') return;
    this.time++;
    const p = this.player;
    p.update(input);
    if (!p.inBackhoe) Sound.stopEngine();

    // spawn de monstros (ritmo mais calmo)
    this.spawnTimer--;
    if (this.spawnTimer <= 0 && this.monsters.length < 5) {
      this.spawnTimer = 180 + Math.random() * 120;
      const kind = Math.random() < 0.4 ? 'grease' : 'feces';
      const side = Math.random() < 0.5 ? -1 : 1;
      let mx = p.x + side * (320 + Math.random() * 220);
      mx = Math.max(60, Math.min(CONFIG.LEVEL_WIDTH - 60, mx));
      this.monsters.push(new Monster(mx, kind));
    }

    // monstros
    const rob = p.runoverbox();
    const hb = p.hitbox();
    for (const m of this.monsters) {
      m.update(p);
      if (m.emerge > 0) continue;
      // atropelamento da retroescavadeira
      if (rob && overlap(rob, m.bounds())) {
        m.dead = true; this.score += CONFIG.SCORE_KILL;
        this.addFloater(m.x, m.y - 50, 'ESMAGADO', '#f2c200'); Sound.monster();
        continue;
      }
      // dano por contato (não na retro)
      if (!p.inBackhoe && overlap(m.bounds(), p.bounds())) {
        if (p.hurt(12)) { this.addFloater(p.x, p.y - 70, '-12', '#ff5a4d'); Sound.hurt(); }
      }
      // ataque (picareta / sapinho)
      if (hb && overlap(hb, m.bounds())) {
        if (p.inSapinho) m.dead = true;
        else { m.hp--; if (m.hp <= 0) m.dead = true; }
        if (m.dead) {
          this.score += CONFIG.SCORE_KILL;
          this.addFloater(m.x, m.y - 50, '+' + CONFIG.SCORE_KILL, '#ffd479'); Sound.monster();
        }
      }
    }
    this.monsters = this.monsters.filter((m) => !m.dead && m.x > this.camX - 120 && m.x < this.camX + CONFIG.W + 500);

    // sapinho / retro atordoam o Sorgei
    if (this.sorgei.state !== 'away' && this.sorgei.stun <= 0) {
      if ((p.inSapinho && hb && overlap(hb, this.sorgei.bounds())) ||
          (rob && overlap(rob, this.sorgei.bounds()))) {
        this.sorgei.stunHit();
        this.score += 50;
        this.addFloater(this.sorgei.x, this.sorgei.y - 60, 'SORGEI ATORDOADO!', '#7CFC00');
        Sound.smash();
      }
    }

    // funcionários
    let workingCount = this.workers.filter((w) => w.mode === 'work').length;
    for (const w of this.workers) {
      w.update(p);
      if (w.mode === 'lost' && overlap(w.bounds(), p.bounds())) {
        w.rescue();
        this.addFloater(w.x, w.y - 60, 'Resgatado!', '#7CFC00'); Sound.pickup();
      }
      if (w.mode === 'follow' && Math.abs(w.x - (this.siteX + 65)) < 110) {
        w.deliver(this.siteX - 40 - workingCount * 26);
        workingCount++;
        this.rescued++;
        this.score += CONFIG.SCORE_RESCUE;
        this.addFloater(this.siteX + 65, CONFIG.GROUND_Y - 130, '+' + CONFIG.SCORE_RESCUE + ' resgate', '#7CFC00');
        Sound.deliver();
      }
      if (w.mode === 'taken' && !w._notified) {
        w._notified = true;
        this.addFloater(w.x, CONFIG.GROUND_Y - 70, 'Sorgei levou!', '#ff3b30');
      }
      // reabilita notificação se voltar a ser resgatado
      if (w.mode !== 'taken') w._notified = false;
    }

    // Sorgei (sem dano ao herói)
    this.sorgei.update(p, this.workers);

    // power-ups
    for (const pu of this.powerups) {
      if (!pu.taken && overlap(pu.bounds(), p.bounds())) {
        pu.taken = true;
        p.setMode(pu.kind);
        if (pu.kind === 'backhoe') {
          Sound.startEngine();
          this.addFloater(p.x, p.y - 80, 'RETROESCAVADEIRA!', '#f2c200');
        } else {
          Sound.smash();
          this.addFloater(p.x, p.y - 80, 'SAPINHO!', '#7CFC00');
        }
      }
    }

    // floaters
    for (const f of this.floaters) { f.y -= 0.8; f.life--; }
    this.floaters = this.floaters.filter((f) => f.life > 0);

    // câmera
    const targetCam = p.x - CONFIG.W * 0.4;
    this.camX += (targetCam - this.camX) * 0.1;
    this.camX = Math.max(0, Math.min(CONFIG.LEVEL_WIDTH - CONFIG.W, this.camX));

    if (p.hp <= 0) { p.hp = 0; this.end(false); }
  }

  // ---- render ----
  draw() {
    const ctx = this.ctx;
    const cam = this.camX;
    this.drawBackground(ctx, cam);
    this.drawGround(ctx, cam);
    if (!this.player) return;

    Sprites.site(ctx, this.siteX - cam, CONFIG.GROUND_Y, this.delivered, this.requirements);

    for (const c of this.crates) c.draw(ctx, cam);
    for (const pu of this.powerups) pu.draw(ctx, cam);
    for (const w of this.workers) w.draw(ctx, cam);
    for (const m of this.monsters) m.draw(ctx, cam);
    this.player.draw(ctx, cam);
    this.sorgei.draw(ctx, cam);

    for (const f of this.floaters) {
      ctx.fillStyle = f.color;
      ctx.font = 'bold 14px monospace';
      ctx.fillText(f.text, f.x - cam, f.y);
    }

    this.drawHUD(ctx);
  }

  drawBackground(ctx, cam) {
    const C = CONFIG.COLORS;
    const g = ctx.createLinearGradient(0, 0, 0, CONFIG.GROUND_Y);
    g.addColorStop(0, C.skyFar);
    g.addColorStop(1, C.sky);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);

    const par = cam * 0.4;
    for (let i = -1; i < 14; i++) {
      const bx = i * 140 - (par % 140);
      const bh = 90 + ((i * 53) % 110);
      ctx.fillStyle = i % 2 ? '#7d93aa' : '#8fa6bd';
      ctx.fillRect(bx, CONFIG.GROUND_Y - bh, 100, bh);
      ctx.fillStyle = '#cfe0f0';
      for (let wy = CONFIG.GROUND_Y - bh + 12; wy < CONFIG.GROUND_Y - 12; wy += 22) {
        for (let wx = bx + 10; wx < bx + 90; wx += 22) ctx.fillRect(wx, wy, 10, 12);
      }
    }
    ctx.fillStyle = '#fff4c0';
    ctx.beginPath(); ctx.arc(760, 70, 34, 0, Math.PI * 2); ctx.fill();
  }

  drawGround(ctx, cam) {
    const C = CONFIG.COLORS;
    ctx.fillStyle = C.asphalt;
    ctx.fillRect(0, CONFIG.GROUND_Y, CONFIG.W, CONFIG.H - CONFIG.GROUND_Y);
    ctx.fillStyle = '#3a4048';
    ctx.fillRect(0, CONFIG.GROUND_Y, CONFIG.W, 6);
    ctx.fillStyle = '#e8c34a';
    const off = cam % 80;
    for (let x = -off; x < CONFIG.W; x += 80) ctx.fillRect(x, CONFIG.GROUND_Y + 40, 40, 5);
  }

  drawHUD(ctx) {
    const p = this.player;
    // vida
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(12, 12, 224, 26);
    ctx.fillStyle = '#3a1010'; ctx.fillRect(16, 16, 200, 18);
    const hpw = Math.max(0, (p.hp / CONFIG.PLAYER_HP) * 200);
    ctx.fillStyle = p.hp > 30 ? '#3ad13a' : '#ff5a4d';
    ctx.fillRect(16, 16, hpw, 18);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace';
    ctx.fillText('❤ ' + Math.ceil(p.hp), 22, 29);

    // placar + progresso total
    let totalNeed = 0, totalHave = 0;
    for (const k in this.requirements) {
      totalNeed += this.requirements[k];
      totalHave += Math.min(this.delivered[k] || 0, this.requirements[k]);
    }
    ctx.textAlign = 'right';
    ctx.fillStyle = '#000'; ctx.fillRect(CONFIG.W - 250, 12, 238, 46);
    ctx.fillStyle = '#ffd479'; ctx.font = 'bold 16px monospace';
    ctx.fillText('PONTOS: ' + this.score, CONFIG.W - 20, 32);
    ctx.fillStyle = '#7cd0ff'; ctx.font = 'bold 13px monospace';
    ctx.fillText('Materiais: ' + totalHave + '/' + totalNeed + '   Resgates: ' + this.rescued, CONFIG.W - 20, 50);
    ctx.textAlign = 'left';

    // inventário carregado
    if (p.totalCarried() > 0) {
      const parts = [];
      for (const k in p.inventory) if (p.inventory[k] > 0) parts.push((CONFIG.NAMES[k] || k) + '×' + p.inventory[k]);
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(12, 46, 250, 22);
      ctx.fillStyle = '#fff'; ctx.font = '12px monospace';
      ctx.fillText('Levando: ' + parts.join('  '), 20, 61);
    }

    // modo ativo
    if (p.mode !== 'normal') {
      ctx.fillStyle = p.mode === 'backhoe' ? '#f2c200' : '#7CFC00';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(p.mode === 'backhoe' ? '🚜 RETROESCAVADEIRA' : '🐸 SAPINHO', 20, 82);
    }

    // seta para a obra
    if (this.siteX - this.camX > CONFIG.W) {
      ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 16px monospace';
      ctx.fillText('OBRA →', CONFIG.W - 120, 92);
    }
  }
}
