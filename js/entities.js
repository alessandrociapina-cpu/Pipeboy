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
    this.attackTimer = 0;
    this.attackCd = 0;
    this.invuln = 0;
    this.inventory = {};      // { tubo: n, tampao: n, ... }
    this.mode = 'normal';     // 'normal' | 'backhoe' | 'sapinho'
    this.modeTimer = 0;
  }

  get attacking() { return this.attackTimer > 0; }
  get inBackhoe() { return this.mode === 'backhoe'; }
  get inSapinho() { return this.mode === 'sapinho'; }

  totalCarried() {
    let n = 0;
    for (const k in this.inventory) n += this.inventory[k];
    return n;
  }
  capacity() { return this.mode === 'backhoe' ? CONFIG.BACKHOE_CAP : 1; }

  // tipo carregado a pé (para desenhar sobre a cabeça)
  carryType() {
    for (const k in this.inventory) if (this.inventory[k] > 0) return k;
    return null;
  }

  addItem(type) {
    if (this.totalCarried() >= this.capacity()) return false;
    this.inventory[type] = (this.inventory[type] || 0) + 1;
    return true;
  }
  takeInventory() {
    const inv = this.inventory;
    this.inventory = {};
    return inv;
  }

  setMode(kind) {
    this.mode = kind;
    this.modeTimer = kind === 'backhoe' ? CONFIG.BACKHOE_TIME : CONFIG.SAPINHO_TIME;
  }

  attack() {
    if (this.mode === 'backhoe') return false; // na retro não ataca (atropela)
    if (this.attackCd <= 0) {
      this.attackTimer = 12;
      this.attackCd = 22;
      return true;
    }
    return false;
  }

  hitbox() {
    if (!this.attacking) return null;
    const reach = this.mode === 'sapinho' ? 46 : 34;   // sapinho tem alcance maior
    const hx = this.facing > 0 ? this.x + this.w / 2 : this.x - this.w / 2 - reach;
    const hy = this.mode === 'sapinho' ? this.y - 30 : this.y - this.h + 6;
    const hh = this.mode === 'sapinho' ? 50 : 40;
    return { x: hx, y: hy, w: reach, h: hh };
  }

  // caixa de atropelamento da retroescavadeira
  runoverbox() {
    if (this.mode !== 'backhoe') return null;
    const reach = 40;
    const hx = this.facing > 0 ? this.x - 10 : this.x - reach + 10;
    return { x: hx, y: this.y - 30, w: reach, h: 30 };
  }

  bounds() {
    return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h };
  }

  update(input) {
    this.vx = 0;
    const spd = this.mode === 'backhoe' ? CONFIG.MOVE_SPEED * 0.9 : CONFIG.MOVE_SPEED;
    if (input.left)  { this.vx = -spd; this.facing = -1; }
    if (input.right) { this.vx =  spd; this.facing =  1; }

    if (input.jump && this.onGround && this.mode !== 'backhoe') {
      this.vy = CONFIG.JUMP_V;
      this.onGround = false;
    }

    this.vy += CONFIG.GRAVITY;
    this.x += this.vx;
    this.y += this.vy;

    if (this.y >= CONFIG.GROUND_Y) { this.y = CONFIG.GROUND_Y; this.vy = 0; this.onGround = true; }
    this.x = Math.max(20, Math.min(CONFIG.LEVEL_WIDTH - 20, this.x));

    if (this.vx !== 0 && this.onGround) this.walkPhase += 0.22;

    if (this.attackTimer > 0) this.attackTimer--;
    if (this.attackCd > 0) this.attackCd--;
    if (this.invuln > 0) this.invuln--;

    if (this.modeTimer > 0) {
      this.modeTimer--;
      if (this.modeTimer === 0) this.mode = 'normal';
    }
  }

  hurt(dmg) {
    if (this.mode === 'backhoe') return false; // protegido na retro
    if (this.invuln > 0) return false;
    this.hp -= dmg;
    this.invuln = 70;
    return true;
  }

  draw(ctx, camX) {
    if (this.invuln > 0 && Math.floor(this.invuln / 4) % 2 === 0) return;
    const sx = this.x - camX, sy = this.y - this.h;
    if (this.mode === 'backhoe') {
      Sprites.backhoe(ctx, this.x - camX, this.y - 66, this.facing, this.totalCarried());
    } else if (this.mode === 'sapinho') {
      Sprites.sapinho(ctx, sx, sy, this.facing, this.walkPhase, this.attacking);
    } else {
      Sprites.george(ctx, sx, sy, this.facing, this.walkPhase, this.attacking, this.carryType());
    }
    // barra de duração do power-up
    if (this.modeTimer > 0) {
      const total = this.mode === 'backhoe' ? CONFIG.BACKHOE_TIME : CONFIG.SAPINHO_TIME;
      const w = 30 * (this.modeTimer / total);
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(sx - 15, sy - 30, 30, 5);
      ctx.fillStyle = this.mode === 'backhoe' ? '#f2c200' : '#7CFC00';
      ctx.fillRect(sx - 15, sy - 30, w, 5);
    }
  }
}

class Monster {
  constructor(x, kind) {
    this.x = x;
    this.y = CONFIG.GROUND_Y;
    this.w = 32;
    this.h = 34;
    this.kind = kind;
    this.hp = kind === 'grease' ? 2 : 1;
    this.dir = -1;
    this.speed = kind === 'grease' ? 0.4 : 0.75;
    this.t = Math.random() * 100;
    this.dead = false;
    this.emerge = 24;
    this.fleeing = false;
  }

  bounds() { return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h }; }

  update(player) {
    this.t++;
    if (this.emerge > 0) { this.emerge--; return; }
    // foge da retroescavadeira
    this.fleeing = player.inBackhoe && Math.abs(player.x - this.x) < 300;
    if (this.fleeing) {
      this.dir = player.x < this.x ? 1 : -1;   // afasta-se
      this.x += this.dir * this.speed * 2.2;
    } else {
      this.dir = player.x < this.x ? -1 : 1;
      this.x += this.dir * this.speed;
    }
  }

  draw(ctx, camX) {
    const yoff = this.emerge > 0 ? this.emerge : 0;
    Sprites.monster(ctx, this.x - camX - 16, this.y - this.h + yoff, this.t, this.kind, this.fleeing);
  }
}

class Worker {
  constructor(x) {
    this.x = x;
    this.y = CONFIG.GROUND_Y;
    this.w = 20;
    this.h = 46;
    this.t = Math.random() * 100;
    this.mode = 'lost';   // 'lost' | 'follow' | 'work' | 'taken'
    this.slotX = 0;
    this._notified = false;
  }

  bounds() { return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h }; }

  rescue() { if (this.mode === 'lost') this.mode = 'follow'; }
  deliver(slotX) { this.mode = 'work'; this.slotX = slotX; }
  take() { this.mode = 'taken'; }

  update(player) {
    this.t++;
    if (this.mode === 'follow') {
      const target = player.x - player.facing * 42;
      const dx = target - this.x;
      if (Math.abs(dx) > 4) this.x += Math.sign(dx) * Math.min(CONFIG.MOVE_SPEED, Math.abs(dx));
    } else if (this.mode === 'work') {
      // fica no slot ao lado da obra
      const dx = this.slotX - this.x;
      if (Math.abs(dx) > 2) this.x += Math.sign(dx) * 1.5;
    }
  }

  draw(ctx, camX) {
    if (this.mode === 'taken') return;
    Sprites.worker(ctx, this.x - camX, this.y - this.h, this.t, this.mode);
  }
}

class Sorgei {
  constructor(siteX) {
    this.siteX = siteX;
    this.reset();
  }

  reset() {
    this.state = 'away';   // away | incoming | ranting | leaving
    this.x = this.siteX + 600;
    this.y = CONFIG.GROUND_Y;
    this.w = 26; this.h = 52;
    this.facing = -1;
    this.t = 0;
    this.cooldown = 60 * 13;   // primeira aparição
    this.rantTimer = 0;
    this.takeTimer = 0;
    this.stun = 0;
    this._ranted = false;
  }

  get center() { return this.siteX + 65; }
  bounds() { return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h }; }
  stunHit() { this.stun = 90; this.state = 'leaving'; }

  update(player, workers) {
    this.t++;

    // foge da retroescavadeira
    if (player.inBackhoe && Math.abs(player.x - this.x) < 260 &&
        (this.state === 'incoming' || this.state === 'ranting')) {
      this.state = 'leaving';
    }

    if (this.stun > 0) { this.stun--; this.facing = 1; this.x += 1.6; return; }

    switch (this.state) {
      case 'away':
        this.cooldown--;
        if (this.cooldown <= 0) {
          this.state = 'incoming';
          this.x = this.center + 560;
          this._ranted = false;
          Sound.horn();
        }
        break;

      case 'incoming':
        this.facing = this.center < this.x ? -1 : 1;
        this.x += this.facing * 1.6;
        for (const w of workers) {
          if (w.mode === 'follow' && Math.abs(w.x - this.x) < 26) w.take();
        }
        if (Math.abs(this.x - this.center) < 42) {
          this.state = 'ranting';
          this.rantTimer = 60 * 5;
          this.takeTimer = 25;
          if (!this._ranted) { Sound.rant(); this._ranted = true; }
        }
        break;

      case 'ranting':
        this.facing = -1;
        this.rantTimer--;
        this.takeTimer--;
        if (this.takeTimer <= 0) {
          this.takeTimer = 45;
          const w = workers.find((w) => w.mode === 'work');
          if (w) { w.take(); Sound.rant(); }
        }
        if (this.rantTimer <= 0) this.state = 'leaving';
        break;

      case 'leaving':
        this.facing = 1;
        this.x += 2.2;
        if (this.x > this.center + 600) { this.reset(); this.cooldown = 60 * 11; }
        break;
    }
  }

  draw(ctx, camX) {
    if (this.state === 'away') return;
    Sprites.sorgei(ctx, this.x - camX, this.y - this.h, this.facing, this.t, this.stun > 0);

    if (this.state === 'incoming') {
      ctx.fillStyle = '#ff3b30'; ctx.font = 'bold 12px monospace';
      ctx.fillText('BUZINA!', this.x - camX - 20, this.y - this.h - 10);
    }
    if (this.state === 'ranting') {
      // balão de fala
      const bx = this.x - camX - 40, by = this.y - this.h - 42;
      ctx.fillStyle = '#fff';
      ctx.fillRect(bx, by, 108, 26);
      ctx.beginPath(); ctx.moveTo(bx + 40, by + 26); ctx.lineTo(bx + 54, by + 26); ctx.lineTo(bx + 44, by + 36); ctx.fill();
      ctx.fillStyle = '#c00'; ctx.font = 'bold 12px monospace';
      ctx.fillText('PAREM TUDO!!', bx + 8, by + 17);
    }
  }
}

class PowerUp {
  constructor(x, kind) {
    this.x = x;
    this.y = CONFIG.GROUND_Y;
    this.kind = kind;   // 'backhoe' | 'sapinho'
    this.taken = false;
    this.w = 34; this.h = 34;
    this.t = Math.random() * 100;
  }

  bounds() { return { x: this.x - 4, y: this.y - 34, w: 40, h: 34 }; }

  draw(ctx, camX) {
    if (this.taken) return;
    this.t++;
    Sprites.powerup(ctx, this.x - camX, this.y - 34, this.kind, this.t);
    // rótulo
    ctx.fillStyle = '#ffd479'; ctx.font = 'bold 10px monospace';
    const label = this.kind === 'backhoe' ? 'RETRO' : 'SAPINHO';
    ctx.fillText(label, this.x - camX - 2, this.y + 2);
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

  bounds() { return { x: this.x, y: this.y - this.h, w: this.w, h: this.h }; }

  draw(ctx, camX) {
    if (this.taken) return;
    Sprites.itemCrate(ctx, this.x - camX, this.y - this.h, this.type);
  }
}

function overlap(a, b) {
  return a && b &&
    a.x < b.x + b.w && a.x + a.w > b.x &&
    a.y < b.y + b.h && a.y + a.h > b.y;
}
