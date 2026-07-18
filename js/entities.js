// ===== Pipeboy — Entidades =====

class Player {
  constructor(x) {
    this.x = x;
    this.y = CONFIG.GROUND_Y;
    this.w = 24;
    this.h = 54;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.onGround = true;
    this.hp = CONFIG.PLAYER_HP;
    this.walkPhase = 0;
    this.attackTimer = 0;   // frames restantes de ataque
    this.attackCd = 0;      // cooldown
    this.carrying = null;   // tipo de item que carrega
    this.invuln = 0;        // frames de invulnerabilidade
  }

  get attacking() { return this.attackTimer > 0; }

  attack() {
    if (this.attackCd <= 0) {
      this.attackTimer = 12;
      this.attackCd = 22;
    }
  }

  // caixa de ataque (à frente do jogador)
  hitbox() {
    if (!this.attacking) return null;
    const reach = 34;
    const hx = this.facing > 0 ? this.x + this.w / 2 : this.x - this.w / 2 - reach;
    return { x: hx, y: this.y - this.h + 6, w: reach, h: 40 };
  }

  bounds() {
    return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h };
  }

  update(input) {
    // movimento horizontal
    this.vx = 0;
    if (input.left)  { this.vx = -CONFIG.MOVE_SPEED; this.facing = -1; }
    if (input.right) { this.vx =  CONFIG.MOVE_SPEED; this.facing =  1; }

    // pulo
    if (input.jump && this.onGround) {
      this.vy = CONFIG.JUMP_V;
      this.onGround = false;
    }

    // física
    this.vy += CONFIG.GRAVITY;
    this.x += this.vx;
    this.y += this.vy;

    if (this.y >= CONFIG.GROUND_Y) {
      this.y = CONFIG.GROUND_Y;
      this.vy = 0;
      this.onGround = true;
    }

    // limites do mundo
    this.x = Math.max(20, Math.min(CONFIG.LEVEL_WIDTH - 20, this.x));

    // animação de caminhada
    if (this.vx !== 0 && this.onGround) this.walkPhase += 0.25;

    // timers
    if (this.attackTimer > 0) this.attackTimer--;
    if (this.attackCd > 0) this.attackCd--;
    if (this.invuln > 0) this.invuln--;
  }

  hurt(dmg) {
    if (this.invuln > 0) return false;
    this.hp -= dmg;
    this.invuln = 60;
    return true;
  }

  draw(ctx, camX) {
    // pisca quando invulnerável
    if (this.invuln > 0 && Math.floor(this.invuln / 4) % 2 === 0) return;
    Sprites.george(
      ctx,
      this.x - camX,
      this.y - this.h,
      this.facing,
      this.walkPhase,
      this.attacking,
      this.carrying
    );
  }
}

class Monster {
  constructor(x, kind) {
    this.x = x;
    this.y = CONFIG.GROUND_Y;
    this.w = 32;
    this.h = 34;
    this.kind = kind;            // 'feces' | 'grease'
    this.hp = kind === 'grease' ? 2 : 1;
    this.dir = -1;
    this.speed = kind === 'grease' ? 0.6 : 1.1;
    this.t = Math.random() * 100;
    this.dead = false;
    this.emerge = 24;           // frames "saindo da vala"
  }

  bounds() {
    return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h };
  }

  update(player) {
    this.t++;
    if (this.emerge > 0) { this.emerge--; return; }
    // persegue o jogador devagar
    this.dir = player.x < this.x ? -1 : 1;
    this.x += this.dir * this.speed;
  }

  draw(ctx, camX) {
    const yoff = this.emerge > 0 ? this.emerge : 0;
    Sprites.monster(ctx, this.x - camX - 16, this.y - this.h + yoff, this.t, this.kind);
  }
}

class Worker {
  constructor(x) {
    this.x = x;
    this.y = CONFIG.GROUND_Y;
    this.w = 20;
    this.h = 46;
    this.t = Math.random() * 100;
    this.rescued = false;   // seguindo o jogador
    this.delivered = false; // chegou na obra
    this.taken = false;     // Regis levou embora
  }

  bounds() {
    return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h };
  }

  update(player) {
    this.t++;
    if (this.rescued && !this.delivered) {
      // segue o jogador mantendo distância
      const target = player.x - player.facing * 40;
      const dx = target - this.x;
      if (Math.abs(dx) > 4) this.x += Math.sign(dx) * Math.min(CONFIG.MOVE_SPEED, Math.abs(dx));
    }
  }

  draw(ctx, camX) {
    if (this.delivered || this.taken) return;
    Sprites.worker(ctx, this.x - camX, this.y - this.h, this.t);
  }
}

class Regis {
  constructor() {
    this.reset();
  }

  reset() {
    this.active = false;
    this.x = CONFIG.LEVEL_WIDTH + 100;
    this.y = CONFIG.GROUND_Y;
    this.w = 26;
    this.h = 52;
    this.facing = -1;
    this.t = 0;
    this.cooldown = 60 * 12; // aparece a cada ~12s
  }

  bounds() {
    return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h };
  }

  update(player, workers) {
    this.t++;
    if (!this.active) {
      this.cooldown--;
      if (this.cooldown <= 0) {
        this.active = true;
        // entra pela borda oposta ao jogador
        this.x = player.x + 500;
        this.facing = -1;
      }
      return;
    }

    // corre em direção ao funcionário resgatado mais próximo, senão ao jogador
    let targetX = player.x;
    let targetWorker = null;
    let best = Infinity;
    for (const w of workers) {
      if (w.rescued && !w.delivered && !w.taken) {
        const d = Math.abs(w.x - this.x);
        if (d < best) { best = d; targetWorker = w; targetX = w.x; }
      }
    }

    this.facing = targetX < this.x ? -1 : 1;
    this.x += this.facing * 2.6;

    // sequestra funcionário se alcançar
    if (targetWorker && Math.abs(targetWorker.x - this.x) < 26) {
      targetWorker.taken = true;
      targetWorker.rescued = false;
    }

    // sai de cena após um tempo
    if (this.t % (60 * 6) === 0) {
      this.active = false;
      this.cooldown = 60 * 10;
    }
  }

  draw(ctx, camX) {
    if (!this.active) return;
    Sprites.regis(ctx, this.x - camX, this.y - this.h, this.facing, this.t);
    // buzina/aviso
    ctx.fillStyle = '#ff3b30';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('BUZINA!', this.x - camX - 20, this.y - this.h - 8);
  }
}

class ItemCrate {
  constructor(x, type) {
    this.x = x;
    this.y = CONFIG.GROUND_Y;
    this.type = type;
    this.taken = false;
    this.w = 28;
    this.h = 28;
  }

  bounds() {
    return { x: this.x, y: this.y - this.h, w: this.w, h: this.h };
  }

  draw(ctx, camX) {
    if (this.taken) return;
    Sprites.itemCrate(ctx, this.x - camX, this.y - this.h, this.type);
  }
}

// util: colisão AABB
function overlap(a, b) {
  return a && b &&
    a.x < b.x + b.w && a.x + a.w > b.x &&
    a.y < b.y + b.h && a.y + a.h > b.y;
}
