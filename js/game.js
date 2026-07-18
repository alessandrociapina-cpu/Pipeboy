// ===== Pipeboy — Motor principal =====

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = 'start'; // start | playing | paused | won | lost
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
    this.player = new Player(60);
    this.regis = new Regis();
    this.monsters = [];
    this.workers = [];
    this.crates = [];
    this.floaters = []; // textos flutuantes (+100 etc)
    this.score = 0;
    this.delivered = 0;
    this.rescued = 0;
    this.spawnTimer = 90;
    this.time = 0;
    this.camX = 0;
    this.siteX = CONFIG.LEVEL_WIDTH - 260; // posição da obra (vala)

    this.buildLevel();

    this.state = 'playing';
    this.ovStart.classList.add('hidden');
    this.ovEnd.classList.add('hidden');
    this.ovPause.classList.add('hidden');
  }

  buildLevel() {
    // distribui caixotes de material pela fase
    const types = ['tubo', 'tubo', 'cone', 'placa', 'tampao', 'tubo', 'escora', 'tubo', 'tubo'];
    let x = 320;
    for (const t of types) {
      this.crates.push(new ItemCrate(x, t));
      x += 340 + Math.random() * 120;
    }
    // funcionários perdidos
    this.workers.push(new Worker(700));
    this.workers.push(new Worker(1600));
    this.workers.push(new Worker(2600));
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.ovPause.classList.remove('hidden');
    } else if (this.state === 'paused') {
      this.state = 'playing';
      this.ovPause.classList.add('hidden');
    }
  }

  addFloater(x, y, text, color) {
    this.floaters.push({ x, y, text, color, life: 50 });
  }

  // ---- ações do jogador ----
  handlePickDeliver() {
    const p = this.player;

    // 1) entregar na obra?
    if (p.carrying && Math.abs(p.x - (this.siteX + 60)) < 90) {
      if (p.carrying === 'tubo') {
        this.delivered++;
        this.score += CONFIG.SCORE_DELIVER;
        this.addFloater(p.x, p.y - 70, '+' + CONFIG.SCORE_DELIVER, '#7CFC00');
      } else {
        // outros materiais dão bônus menor
        this.score += 40;
        this.addFloater(p.x, p.y - 70, '+40 material', '#9ad');
      }
      p.carrying = null;
      this.checkWin();
      return;
    }

    // 2) largar item atual
    if (p.carrying) {
      const c = new ItemCrate(p.x - 14, p.carrying);
      this.crates.push(c);
      p.carrying = null;
      return;
    }

    // 3) pegar caixote próximo
    for (const c of this.crates) {
      if (!c.taken && Math.abs((c.x + 14) - p.x) < 40) {
        c.taken = true;
        p.carrying = c.type;
        return;
      }
    }
  }

  checkWin() {
    if (this.delivered >= CONFIG.DELIVER_GOAL) {
      this.end(true);
    }
  }

  end(won) {
    this.state = won ? 'won' : 'lost';
    this.ovEnd.classList.remove('hidden');
    if (won) {
      this.endTitle.textContent = '✅ OBRA CONCLUÍDA!';
      this.endTitle.style.color = '#7CFC00';
      this.endMsg.innerHTML =
        `George Sanear entregou a rede! <br>` +
        `Tubos: <b>${this.delivered}</b> • Funcionários resgatados: <b>${this.rescued}</b><br>` +
        `Pontuação final: <b>${this.score}</b>`;
    } else {
      this.endTitle.textContent = '💀 FIM DE JORNADA';
      this.endTitle.style.color = '#ff5a4d';
      this.endMsg.innerHTML =
        `Os monstros de esgoto (e o Regis!) venceram desta vez.<br>` +
        `Tubos entregues: <b>${this.delivered}</b> • Pontuação: <b>${this.score}</b>`;
    }
  }

  // ---- update ----
  update(input) {
    if (this.state !== 'playing') return;
    this.time++;
    const p = this.player;

    p.update(input);

    // spawn de monstros perto da obra e ao longo da fase
    this.spawnTimer--;
    if (this.spawnTimer <= 0 && this.monsters.length < 6) {
      this.spawnTimer = 120 + Math.random() * 90;
      const kind = Math.random() < 0.4 ? 'grease' : 'feces';
      // surge de uma vala à frente ou atrás do jogador
      const side = Math.random() < 0.5 ? -1 : 1;
      let mx = p.x + side * (300 + Math.random() * 200);
      mx = Math.max(60, Math.min(CONFIG.LEVEL_WIDTH - 60, mx));
      this.monsters.push(new Monster(mx, kind));
    }

    // monstros
    for (const m of this.monsters) {
      m.update(p);
      // dano por contato
      if (overlap(m.bounds(), p.bounds()) && m.emerge <= 0) {
        if (p.hurt(12)) this.addFloater(p.x, p.y - 70, '-12', '#ff5a4d');
      }
      // atingido pela ferramenta?
      const hb = p.hitbox();
      if (hb && overlap(hb, m.bounds()) && m.emerge <= 0) {
        m.hp--;
        if (m.hp <= 0) {
          m.dead = true;
          this.score += CONFIG.SCORE_KILL;
          this.addFloater(m.x, m.y - 50, '+' + CONFIG.SCORE_KILL, '#ffd479');
        }
      }
    }
    this.monsters = this.monsters.filter(m => !m.dead && m.x > this.camX - 100 && m.x < this.camX + CONFIG.W + 400);

    // funcionários
    for (const w of this.workers) {
      w.update(p);
      // resgatar ao tocar
      if (!w.rescued && !w.delivered && !w.taken && overlap(w.bounds(), p.bounds())) {
        w.rescued = true;
        this.addFloater(w.x, w.y - 60, 'Resgatado!', '#7CFC00');
      }
      // levar até a obra
      if (w.rescued && !w.delivered && Math.abs(w.x - (this.siteX + 60)) < 100) {
        w.delivered = true;
        w.rescued = false;
        this.rescued++;
        this.score += CONFIG.SCORE_RESCUE;
        this.addFloater(this.siteX + 60, CONFIG.GROUND_Y - 90, '+' + CONFIG.SCORE_RESCUE + ' resgate', '#7CFC00');
      }
    }

    // Regis
    this.regis.update(p, this.workers);
    if (this.regis.active && overlap(this.regis.bounds(), p.bounds())) {
      if (p.hurt(18)) this.addFloater(p.x, p.y - 70, 'Regis! -18', '#ff3b30');
    }

    // floaters
    for (const f of this.floaters) { f.y -= 0.8; f.life--; }
    this.floaters = this.floaters.filter(f => f.life > 0);

    // câmera segue o jogador
    const targetCam = p.x - CONFIG.W * 0.4;
    this.camX += (targetCam - this.camX) * 0.12;
    this.camX = Math.max(0, Math.min(CONFIG.LEVEL_WIDTH - CONFIG.W, this.camX));

    // fim por vida
    if (p.hp <= 0) { p.hp = 0; this.end(false); }
  }

  // ---- render ----
  draw() {
    const ctx = this.ctx;
    const cam = this.camX;
    this.drawBackground(ctx, cam);
    this.drawGround(ctx, cam);

    // antes de iniciar não há entidades — só o cenário de fundo
    if (!this.player) return;

    // obra / vala (goal)
    Sprites.site(ctx, this.siteX - cam, CONFIG.GROUND_Y, this.delivered, CONFIG.DELIVER_GOAL);

    // caixotes
    for (const c of this.crates) c.draw(ctx, cam);
    // funcionários
    for (const w of this.workers) w.draw(ctx, cam);
    // monstros
    for (const m of this.monsters) m.draw(ctx, cam);
    // jogador
    if (this.player) this.player.draw(ctx, cam);
    // Regis por cima
    this.regis.draw(ctx, cam);

    // floaters
    for (const f of this.floaters) {
      ctx.fillStyle = f.color;
      ctx.font = 'bold 14px monospace';
      ctx.fillText(f.text, f.x - cam, f.y);
    }

    this.drawHUD(ctx);
  }

  drawBackground(ctx, cam) {
    const C = CONFIG.COLORS;
    // céu gradiente
    const g = ctx.createLinearGradient(0, 0, 0, CONFIG.GROUND_Y);
    g.addColorStop(0, C.skyFar);
    g.addColorStop(1, C.sky);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);

    // prédios da cidade (parallax)
    const par = cam * 0.4;
    for (let i = -1; i < 14; i++) {
      const bx = i * 140 - (par % 140);
      const bh = 90 + ((i * 53) % 110);
      ctx.fillStyle = i % 2 ? '#7d93aa' : '#8fa6bd';
      ctx.fillRect(bx, CONFIG.GROUND_Y - bh, 100, bh);
      // janelas
      ctx.fillStyle = '#cfe0f0';
      for (let wy = CONFIG.GROUND_Y - bh + 12; wy < CONFIG.GROUND_Y - 12; wy += 22) {
        for (let wx = bx + 10; wx < bx + 90; wx += 22) {
          ctx.fillRect(wx, wy, 10, 12);
        }
      }
    }
    // sol
    ctx.fillStyle = '#fff4c0';
    ctx.beginPath();
    ctx.arc(760, 70, 34, 0, Math.PI * 2);
    ctx.fill();
  }

  drawGround(ctx, cam) {
    const C = CONFIG.COLORS;
    // asfalto
    ctx.fillStyle = C.asphalt;
    ctx.fillRect(0, CONFIG.GROUND_Y, CONFIG.W, CONFIG.H - CONFIG.GROUND_Y);
    // calçada topo
    ctx.fillStyle = '#3a4048';
    ctx.fillRect(0, CONFIG.GROUND_Y, CONFIG.W, 6);
    // faixa central tracejada (rola com a câmera)
    ctx.fillStyle = '#e8c34a';
    const off = cam % 80;
    for (let x = -off; x < CONFIG.W; x += 80) {
      ctx.fillRect(x, CONFIG.GROUND_Y + 40, 40, 5);
    }
  }

  drawHUD(ctx) {
    // barra de vida
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(12, 12, 224, 26);
    ctx.fillStyle = '#3a1010';
    ctx.fillRect(16, 16, 200, 18);
    const hpw = Math.max(0, (this.player.hp / CONFIG.PLAYER_HP) * 200);
    ctx.fillStyle = this.player.hp > 30 ? '#3ad13a' : '#ff5a4d';
    ctx.fillRect(16, 16, hpw, 18);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('❤ ' + Math.ceil(this.player.hp), 22, 29);

    // placar + entregas
    ctx.textAlign = 'right';
    ctx.fillStyle = '#000';
    ctx.fillRect(CONFIG.W - 244, 12, 232, 46);
    ctx.fillStyle = '#ffd479';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('PONTOS: ' + this.score, CONFIG.W - 20, 32);
    ctx.fillStyle = '#7cd0ff';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('Tubos: ' + this.delivered + '/' + CONFIG.DELIVER_GOAL +
                 '   Resgates: ' + this.rescued, CONFIG.W - 20, 50);
    ctx.textAlign = 'left';

    // item carregado
    if (this.player.carrying) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(12, 46, 150, 24);
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      const nomes = { tubo: 'Tubo de água', cone: 'Cone', placa: 'Placa', tampao: 'Tampão', escora: 'Escoramento' };
      ctx.fillText('Carregando: ' + (nomes[this.player.carrying] || this.player.carrying), 20, 62);
    }

    // seta indicando a obra quando fora de tela
    if (this.siteX - this.camX > CONFIG.W) {
      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('OBRA →', CONFIG.W - 120, 92);
    }
  }
}
