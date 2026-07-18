// ===== Pipeboy — Entidades =====

class Player {
  constructor(x) {
    this.x = x;
    this.y = CONFIG.GROUND_Y;
    this.w = 34;
    this.h = 94;
    this.vx = 0; this.vy = 0;
    this.facing = 1;
    this.onGround = true;
    this.hp = CONFIG.PLAYER_HP;
    this.walkPhase = 0;
    this.attackTimer = 0;
    this.attackCd = 0;
    this.invuln = 0;
    this.inventory = {};
    this.mode = 'normal';   // 'normal' | 'backhoe'
    this.modeTimer = 0;
  }

  get attacking() { return this.attackTimer > 0; }
  get inBackhoe() { return this.mode === 'backhoe'; }

  totalCarried() { let n = 0; for (const k in this.inventory) n += this.inventory[k]; return n; }
  capacity() { return this.mode === 'backhoe' ? CONFIG.BACKHOE_CAP : 1; }
  carryType() { for (const k in this.inventory) if (this.inventory[k] > 0) return k; return null; }

  addItem(type) {
    if (this.totalCarried() >= this.capacity()) return false;
    this.inventory[type] = (this.inventory[type] || 0) + 1;
    return true;
  }
  takeInventory() { const inv = this.inventory; this.inventory = {}; return inv; }

  setMode(kind) {
    this.mode = kind;
    this.modeTimer = kind === 'backhoe' ? CONFIG.BACKHOE_TIME : 0;
  }

  attack() {
    if (this.mode === 'backhoe') return false;
    if (this.attackCd <= 0) { this.attackTimer = 12; this.attackCd = 22; return true; }
    return false;
  }

  hitbox() {
    if (!this.attacking) return null;
    const reach = 46;
    const hx = this.facing > 0 ? this.x + this.w / 2 : this.x - this.w / 2 - reach;
    return { x: hx, y: this.y - this.h + 20, w: reach, h: 60 };
  }

  runoverbox() {
    if (this.mode !== 'backhoe') return null;
    const reach = 54;
    const hx = this.facing > 0 ? this.x - 14 : this.x - reach + 14;
    return { x: hx, y: this.y - 50, w: reach, h: 50 };
  }

  bounds() { return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h }; }

  update(input) {
    this.vx = 0;
    const spd = this.mode === 'backhoe' ? CONFIG.MOVE_SPEED * 0.9 : CONFIG.MOVE_SPEED;
    if (input.left)  { this.vx = -spd; this.facing = -1; }
    if (input.right) { this.vx =  spd; this.facing =  1; }
    if (input.jump && this.onGround && this.mode !== 'backhoe') { this.vy = CONFIG.JUMP_V; this.onGround = false; }

    this.vy += CONFIG.GRAVITY;
    this.x += this.vx; this.y += this.vy;
    if (this.y >= CONFIG.GROUND_Y) { this.y = CONFIG.GROUND_Y; this.vy = 0; this.onGround = true; }
    this.x = Math.max(24, Math.min(CONFIG.LEVEL_WIDTH - 24, this.x));

    if (this.vx !== 0 && this.onGround) this.walkPhase += 0.2;
    if (this.attackTimer > 0) this.attackTimer--;
    if (this.attackCd > 0) this.attackCd--;
    if (this.invuln > 0) this.invuln--;
    if (this.modeTimer > 0) { this.modeTimer--; if (this.modeTimer === 0) this.mode = 'normal'; }
  }

  hurt(dmg) {
    if (this.mode === 'backhoe') return false;
    if (this.invuln > 0) return false;
    this.hp -= dmg; this.invuln = 70; return true;
  }

  draw(ctx, camX) {
    if (this.invuln > 0 && Math.floor(this.invuln / 4) % 2 === 0) return;
    const sx = this.x - camX, sy = this.y - this.h;
    if (this.mode === 'backhoe') Sprites.backhoe(ctx, this.x - camX, this.y - 100, this.facing, this.totalCarried());
    else Sprites.george(ctx, sx, sy, this.facing, this.walkPhase, this.attacking, this.carryType());

    if (this.mode === 'backhoe' && this.modeTimer > 0) {
      const w = 40 * (this.modeTimer / CONFIG.BACKHOE_TIME);
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(sx - 20, sy - 12, 40, 6);
      ctx.fillStyle = '#f2c200'; ctx.fillRect(sx - 20, sy - 12, w, 6);
    }
  }
}

class Monster {
  constructor(x, kind) {
    this.x = x;
    this.y = CONFIG.GROUND_Y;
    this.w = 48; this.h = 48;
    this.kind = kind;
    this.hp = kind === 'grease' ? 2 : 1;
    this.dir = -1;
    this.speed = kind === 'grease' ? 0.45 : 0.8;
    this.t = Math.random() * 100;
    this.dead = false;
    this.emerge = 26;
    this.fleeing = false;
  }
  bounds() { return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h }; }
  update(player) {
    this.t++;
    if (this.emerge > 0) { this.emerge--; return; }
    this.fleeing = player.inBackhoe && Math.abs(player.x - this.x) < 320;
    if (this.fleeing) { this.dir = player.x < this.x ? 1 : -1; this.x += this.dir * this.speed * 2.4; }
    else { this.dir = player.x < this.x ? -1 : 1; this.x += this.dir * this.speed; }
  }
  draw(ctx, camX) {
    const yoff = this.emerge > 0 ? this.emerge : 0;
    Sprites.monster(ctx, this.x - camX - 24, this.y - this.h + yoff, this.t, this.kind, this.fleeing);
  }
}

class Worker {
  constructor(x) {
    this.x = x;
    this.y = CONFIG.GROUND_Y;
    this.w = 24; this.h = 84;
    this.t = Math.random() * 100;
    this.mode = 'lost';   // 'lost' | 'follow' | 'work'
    this.slotX = 0;
    this.working = false; // batendo picareta (depende de cones)
    this._notified = false;
  }
  bounds() { return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h }; }
  rescue() { if (this.mode === 'lost') this.mode = 'follow'; }
  deliver(slotX) { this.mode = 'work'; this.slotX = slotX; }
  scatter(siteX) {
    this.mode = 'lost';
    this.working = false;
    // reaparece espalhado pela cidade, longe da obra
    this.x = 200 + Math.random() * Math.max(300, siteX - 550);
  }
  update(player) {
    this.t++;
    if (this.mode === 'follow') {
      const target = player.x - player.facing * 50;
      const dx = target - this.x;
      if (Math.abs(dx) > 5) this.x += Math.sign(dx) * Math.min(CONFIG.MOVE_SPEED, Math.abs(dx));
    } else if (this.mode === 'work') {
      const dx = this.slotX - this.x;
      if (Math.abs(dx) > 2) this.x += Math.sign(dx) * 1.6;
    }
  }
  draw(ctx, camX) {
    Sprites.worker(ctx, this.x - camX, this.y - this.h, this.t, this.mode, this.working);
  }
}

class Sorgei {
  constructor(siteX) { this.siteX = siteX; this.reset(); }
  reset() {
    this.state = 'away';   // away | incoming | ranting | leaving
    this.x = this.siteX + 700;
    this.y = CONFIG.GROUND_Y;
    this.w = 30; this.h = 92;
    this.facing = -1;
    this.t = 0;
    this.cooldown = 60 * 16;
    this.rantTimer = 0;
    this.stun = 0;
    this._ranted = false;
  }
  get center() { return this.siteX + 85; }
  bounds() { return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h }; }
  stunHit() { this.stun = 100; this.state = 'leaving'; }

  update(player, workers) {
    this.t++;
    if (player.inBackhoe && Math.abs(player.x - this.x) < 300 &&
        (this.state === 'incoming' || this.state === 'ranting')) this.state = 'leaving';

    if (this.stun > 0) { this.stun--; this.facing = 1; this.x += 1.8; return; }

    switch (this.state) {
      case 'away':
        this.cooldown--;
        if (this.cooldown <= 0) { this.state = 'incoming'; this.x = this.center + 680; this._ranted = false; Sound.horn(); }
        break;
      case 'incoming':
        this.facing = this.center < this.x ? -1 : 1;
        this.x += this.facing * 1.9;
        for (const w of workers) if (w.mode === 'follow' && Math.abs(w.x - this.x) < 30) w.scatter(this.siteX);
        if (Math.abs(this.x - this.center) < 46) {
          this.state = 'ranting'; this.rantTimer = 60 * 4;
          if (!this._ranted) {
            Sound.rant(); this._ranted = true;
            // leva TODOS os funcionários da obra (ficam espalhados)
            for (const w of workers) if (w.mode === 'work') w.scatter(this.siteX);
          }
        }
        break;
      case 'ranting':
        this.facing = -1; this.rantTimer--;
        if (this.rantTimer <= 0) this.state = 'leaving';
        break;
      case 'leaving':
        this.facing = 1; this.x += 2.6;
        if (this.x > this.center + 720) { this.reset(); this.cooldown = 60 * 13; }
        break;
    }
  }

  draw(ctx, camX) {
    if (this.state === 'away') return;
    Sprites.sorgei(ctx, this.x - camX, this.y - this.h, this.facing, this.t, this.state === 'ranting');
    if (this.state === 'incoming') {
      ctx.fillStyle = '#ff3b30'; ctx.font = 'bold 15px monospace';
      ctx.fillText('BUZINA!', this.x - camX - 26, this.y - this.h - 14);
    }
    if (this.state === 'ranting') {
      const bx = this.x - camX - 52, by = this.y - this.h - 52;
      ctx.fillStyle = '#fff'; ctx.fillRect(bx, by, 138, 32);
      ctx.beginPath(); ctx.moveTo(bx + 52, by + 32); ctx.lineTo(bx + 70, by + 32); ctx.lineTo(bx + 56, by + 46); ctx.fill();
      ctx.fillStyle = '#c00'; ctx.font = 'bold 15px monospace';
      ctx.fillText('PAREM TUDO!!', bx + 10, by + 21);
    }
  }
}

class PowerUp {
  constructor(x, kind) {
    this.x = x; this.y = CONFIG.GROUND_Y;
    this.kind = kind;   // 'backhoe'
    this.taken = false;
    this.t = Math.random() * 100;
  }
  bounds() { return { x: this.x - 6, y: this.y - 44, w: 52, h: 44 }; }
  draw(ctx, camX) {
    if (this.taken) return;
    this.t++;
    Sprites.powerup(ctx, this.x - camX, this.y - 44, this.kind, this.t);
    ctx.fillStyle = '#ffd479'; ctx.font = 'bold 12px monospace';
    ctx.fillText('RETRO', this.x - camX + 2, this.y + 4);
  }
}

class ItemCrate {
  constructor(x, type) {
    this.x = x; this.y = CONFIG.GROUND_Y;
    this.type = type; this.taken = false;
    this.w = 36; this.h = 38;
  }
  bounds() { return { x: this.x, y: this.y - this.h, w: this.w, h: this.h }; }
  draw(ctx, camX) { if (!this.taken) Sprites.itemCrate(ctx, this.x - camX, this.y - this.h, this.type); }
}

function overlap(a, b) {
  return a && b &&
    a.x < b.x + b.w && a.x + a.w > b.x &&
    a.y < b.y + b.h && a.y + a.h > b.y;
}
