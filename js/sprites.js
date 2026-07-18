// ===== Pipeboy — Sprites desenhados via Canvas (sem assets externos) =====
const Sprites = {
  r(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  },

  // ---- GEORGE SANEAR (a pé) ----
  george(ctx, x, y, facing, walk, attacking, carrying) {
    const C = CONFIG.COLORS;
    ctx.save();
    ctx.translate(x, y);
    if (facing < 0) ctx.scale(-1, 1);

    const step = Math.sin(walk) * 3;

    // pernas
    this.r(ctx, -8, 34, 7, 16 - step, C.pants);
    this.r(ctx, 2, 34, 7, 16 + step, C.pants);
    this.r(ctx, -9, 49 - step, 9, 5, '#1a1a1a');
    this.r(ctx, 1, 49 + step, 9, 5, '#1a1a1a');

    // colete laranja fluorescente
    this.r(ctx, -10, 12, 20, 24, C.vest);
    this.r(ctx, -10, 18, 20, 3, '#dfe9f2');
    this.r(ctx, -10, 28, 20, 3, '#dfe9f2');
    this.r(ctx, -1, 12, 2, 24, '#c96a00');

    // braço / picareta
    if (attacking) {
      this.r(ctx, 8, 10, 6, 6, C.skin);
      this.r(ctx, 14, 6, 3, 18, '#8a5a2b');
      this.r(ctx, 10, 4, 14, 4, '#9aa3ad');
    } else {
      this.r(ctx, 8, 16, 6, 12, C.skin);
    }

    // cabeça (pele bronzeada)
    this.r(ctx, -7, 0, 14, 13, C.skin);
    this.r(ctx, -7, 10, 14, 3, C.skinDark); // sombra do queixo
    // capacete azul
    this.r(ctx, -9, -4, 18, 8, C.helmet);
    this.r(ctx, -9, 2, 18, 2, '#0f4f9a');
    this.r(ctx, -2, -7, 4, 3, '#0f4f9a');
    // rosto
    this.r(ctx, 3, 5, 2, 2, '#222');
    this.r(ctx, -6, 8, 6, 2, C.skinDark);

    if (carrying) this.itemMini(ctx, -8, -22, carrying);

    ctx.restore();
  },

  // ---- GEORGE na RETROESCAVADEIRA ----
  backhoe(ctx, x, y, facing, load) {
    const C = CONFIG.COLORS;
    ctx.save();
    ctx.translate(x, y);
    if (facing < 0) ctx.scale(-1, 1);

    // sombra
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(-26, 60, 64, 5);

    // rodas grandes
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(-14, 54, 11, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(20, 54, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#555';
    ctx.beginPath(); ctx.arc(-14, 54, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(20, 54, 5, 0, Math.PI * 2); ctx.fill();

    // corpo amarelo
    this.r(ctx, -24, 30, 52, 20, C.machine);
    this.r(ctx, -24, 30, 52, 4, '#ffe066');
    this.r(ctx, -24, 46, 52, 4, C.machineDark);
    // cabine
    this.r(ctx, -20, 8, 24, 24, C.machine);
    this.r(ctx, -18, 12, 20, 16, '#bfe3ff'); // vidro
    // George dentro (capacete + rosto)
    this.r(ctx, -12, 12, 12, 10, C.skin);
    this.r(ctx, -13, 8, 14, 6, C.helmet);
    this.r(ctx, -4, 15, 2, 2, '#222');

    // braço hidráulico + caçamba (à frente)
    this.r(ctx, 6, 22, 22, 5, C.machineDark);
    this.r(ctx, 26, 20, 6, 16, C.machineDark);
    this.r(ctx, 30, 30, 14, 12, C.machine); // caçamba
    this.r(ctx, 30, 40, 14, 3, '#7a5a10');
    // dentes da caçamba
    ctx.fillStyle = '#333';
    for (let i = 0; i < 3; i++) this.r(ctx, 32 + i * 4, 42, 2, 3, '#333');

    // carga de tubos na traseira
    for (let i = 0; i < Math.min(load, 8); i++) {
      const col = i % 4, row = Math.floor(i / 4);
      this.r(ctx, -22 + col * 6, 22 - row * 6, 5, 5, '#2e86de');
    }
    if (load > 0) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px monospace';
      if (facing < 0) { ctx.save(); ctx.scale(-1, 1); ctx.fillText('x' + load, -6, 4); ctx.restore(); }
      else ctx.fillText('x' + load, -22, 4);
    }

    ctx.restore();
  },

  // ---- GEORGE com o SAPINHO (compactador) ----
  sapinho(ctx, x, y, facing, walk, attacking) {
    const C = CONFIG.COLORS;
    // desenha o George base
    this.george(ctx, x, y, facing, walk, false, null);
    ctx.save();
    ctx.translate(x, y);
    if (facing < 0) ctx.scale(-1, 1);
    // compactador (placa + motor + cabo) à frente
    const drop = attacking ? 6 : 0;
    this.r(ctx, 12, 20, 6, 20, '#444');            // cabo
    this.r(ctx, 8, 34 + drop, 20, 8, C.machine);   // motor
    this.r(ctx, 6, 44 + drop, 24, 6, '#333');      // placa base
    this.r(ctx, 8, 34 + drop, 20, 2, '#ffe066');
    ctx.restore();
    // onda de impacto ao esmagar
    if (attacking) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,220,80,0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y + 50, 30, Math.PI, 0);
      ctx.stroke();
      ctx.restore();
    }
  },

  itemMini(ctx, x, y, type) {
    ctx.save(); ctx.translate(x, y); this.itemIcon(ctx, type, 16); ctx.restore();
  },

  // ---- ÍCONES DE MATERIAIS ----
  itemIcon(ctx, type, s) {
    switch (type) {
      case 'tubo':
        this.r(ctx, 0, s * 0.3, s, s * 0.4, '#2e86de');
        this.r(ctx, 0, s * 0.3, s, 3, '#5aa9f0');
        this.r(ctx, -2, s * 0.25, 4, s * 0.5, '#1b5fb0');
        this.r(ctx, s - 2, s * 0.25, 4, s * 0.5, '#1b5fb0');
        break;
      case 'cone':
        this.r(ctx, s * 0.35, 2, s * 0.3, s * 0.75, CONFIG.COLORS.vest);
        this.r(ctx, s * 0.28, s * 0.35, s * 0.44, 3, '#fff');
        this.r(ctx, s * 0.15, s * 0.75, s * 0.7, 4, '#c96a00');
        break;
      case 'placa':
        this.r(ctx, s * 0.45, s * 0.4, 3, s * 0.55, '#8a5a2b');
        this.r(ctx, s * 0.1, 2, s * 0.8, s * 0.4, '#ffcc00');
        ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
        ctx.strokeRect(s * 0.12, 3, s * 0.76, s * 0.36);
        break;
      case 'tampao':
        ctx.fillStyle = '#3a3f47';
        ctx.beginPath(); ctx.arc(s / 2, s / 2, s * 0.42, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#20242a'; ctx.lineWidth = 2; ctx.stroke();
        this.r(ctx, s * 0.3, s * 0.47, s * 0.4, 2, '#20242a');
        break;
      case 'escora':
        this.r(ctx, 2, 2, s - 4, 4, '#8a5a2b');
        this.r(ctx, 2, s - 6, s - 4, 4, '#8a5a2b');
        this.r(ctx, 4, 4, 4, s - 8, '#6b4a2b');
        this.r(ctx, s - 8, 4, 4, s - 8, '#6b4a2b');
        break;
    }
  },

  itemCrate(ctx, x, y, type) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 26, 28, 4);
    this.r(ctx, 0, 8, 28, 20, '#8a5a2b');
    this.r(ctx, 0, 8, 28, 3, '#a06a34');
    ctx.strokeStyle = '#5c3d1c'; ctx.lineWidth = 1; ctx.strokeRect(0, 8, 28, 20);
    ctx.save(); ctx.translate(4, -8); this.itemIcon(ctx, type, 20); ctx.restore();
    ctx.restore();
  },

  // ---- POWER-UP (retroescavadeira / sapinho) no chão ----
  powerup(ctx, x, y, kind, t) {
    ctx.save(); ctx.translate(x, y);
    const bob = Math.sin(t * 0.1) * 3;
    ctx.translate(0, bob);
    // brilho
    ctx.fillStyle = 'rgba(255,220,80,0.25)';
    ctx.beginPath(); ctx.arc(16, 14, 22, 0, Math.PI * 2); ctx.fill();
    if (kind === 'backhoe') {
      this.r(ctx, 2, 14, 28, 12, CONFIG.COLORS.machine);
      this.r(ctx, 6, 6, 12, 10, CONFIG.COLORS.machine);
      this.r(ctx, 8, 8, 8, 6, '#bfe3ff');
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.arc(8, 28, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(24, 28, 6, 0, Math.PI * 2); ctx.fill();
      this.r(ctx, 26, 12, 10, 3, CONFIG.COLORS.machineDark);
    } else {
      this.r(ctx, 12, 2, 5, 18, '#444');
      this.r(ctx, 6, 16, 20, 8, CONFIG.COLORS.machine);
      this.r(ctx, 4, 26, 24, 6, '#333');
      this.r(ctx, 6, 16, 20, 2, '#ffe066');
    }
    ctx.restore();
  },

  // ---- MONSTRO DE ESGOTO ----
  monster(ctx, x, y, t, kind, fleeing) {
    ctx.save(); ctx.translate(x, y);
    const wobble = Math.sin(t * 0.15) * 2;
    const base = kind === 'grease' ? CONFIG.COLORS.grease : '#7a5a30';
    const dark = kind === 'grease' ? '#c9a94b' : '#573f1f';
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.moveTo(0, 30);
    ctx.quadraticCurveTo(0, 4 + wobble, 16, 4 + wobble);
    ctx.quadraticCurveTo(32, 4 + wobble, 32, 30);
    ctx.closePath(); ctx.fill();
    this.r(ctx, 4, 28, 5, 6 + wobble, base);
    this.r(ctx, 22, 28, 5, 6 - wobble, base);
    this.r(ctx, 8, 10, 6, 4, dark);
    // olhos (assustados se fugindo)
    this.r(ctx, 9, 14, 5, 5, '#fff');
    this.r(ctx, 19, 14, 5, 5, '#fff');
    if (fleeing) {
      this.r(ctx, 10, 15, 3, 3, '#00f');
      this.r(ctx, 20, 15, 3, 3, '#00f');
      this.r(ctx, 12, 24, 8, 3, '#3a1a1a'); // boca "O"
    } else {
      this.r(ctx, 11, 16, 3, 3, '#b00');
      this.r(ctx, 21, 16, 3, 3, '#b00');
      this.r(ctx, 10, 23, 12, 3, '#3a1a1a');
    }
    ctx.restore();
  },

  // ---- SORGEI GUARIONE (vilão) ----
  sorgei(ctx, x, y, facing, t, stunned) {
    const C = CONFIG.COLORS;
    ctx.save(); ctx.translate(x, y);
    if (facing < 0) ctx.scale(-1, 1);
    const step = Math.sin(t * 0.3) * 3;
    this.r(ctx, -8, 36, 7, 14 - step, '#1a1a1a');
    this.r(ctx, 2, 36, 7, 14 + step, '#1a1a1a');
    this.r(ctx, -11, 12, 22, 26, '#5a1a1a');
    this.r(ctx, -2, 12, 4, 26, '#fff');
    this.r(ctx, -1, 14, 2, 14, '#111');
    // braço apontando (mandão)
    this.r(ctx, 9, 14, 12, 5, '#5a1a1a');
    this.r(ctx, 20, 14, 5, 5, C.skin);
    this.r(ctx, -7, 0, 14, 13, C.skin);
    this.r(ctx, -8, -3, 16, 5, '#111');
    this.r(ctx, -6, 5, 12, 3, '#111');
    this.r(ctx, -4, 9, 8, 2, '#7a2a2a');
    this.r(ctx, -8, -6, 2, 4, '#5a1a1a');
    this.r(ctx, 6, -6, 2, 4, '#5a1a1a');
    // estrelinhas de tonteira
    if (stunned) {
      ctx.fillStyle = '#ffd400'; ctx.font = 'bold 12px monospace';
      const a = t * 0.3;
      if (facing < 0) { ctx.save(); ctx.scale(-1, 1); ctx.fillText('✦', -6 + Math.cos(a) * 6, -10); ctx.restore(); }
      else ctx.fillText('✦', -2 + Math.cos(a) * 6, -10);
    }
    ctx.restore();
  },

  // ---- FUNCIONÁRIO ----
  // mode: 'lost' | 'follow' | 'work'
  worker(ctx, x, y, t, mode) {
    const C = CONFIG.COLORS;
    ctx.save(); ctx.translate(x, y);
    const bob = mode === 'follow' ? Math.sin(t * 0.1) * 1.5 : 0;
    ctx.translate(0, bob);
    // pernas
    this.r(ctx, -6, 32, 5, 14, C.pants);
    this.r(ctx, 1, 32, 5, 14, C.pants);
    // colete amarelo
    this.r(ctx, -8, 14, 16, 20, '#ffd400');
    this.r(ctx, -8, 22, 16, 2, '#fff');
    // cabeça + capacete branco
    this.r(ctx, -6, 2, 12, 12, C.skin);
    this.r(ctx, -7, -1, 14, 6, '#f2f2f2');

    if (mode === 'work') {
      // batendo picareta (movimento cima/baixo)
      const swing = Math.sin(t * 0.25);
      const ang = swing * 0.9;
      ctx.save();
      ctx.translate(6, 14);
      ctx.rotate(-0.4 + ang);
      this.r(ctx, 0, -2, 3, 20, '#8a5a2b');     // cabo
      this.r(ctx, -6, -4, 16, 4, '#9aa3ad');    // cabeça de metal
      ctx.restore();
      // faíscas quando bate embaixo
      if (swing > 0.7) {
        ctx.fillStyle = '#ffd400';
        this.r(ctx, 10, 40, 2, 2, '#ffd400');
        this.r(ctx, 14, 38, 2, 2, '#fff');
      }
    } else if (mode === 'lost') {
      ctx.fillStyle = '#ffd400'; ctx.font = 'bold 14px monospace';
      ctx.fillText('?', -4, -8);
    }
    ctx.restore();
  },

  // ---- OBRA / VALA com lista de materiais exigidos ----
  site(ctx, x, groundY, delivered, requirements) {
    const C = CONFIG.COLORS;
    ctx.save();
    const trenchW = 130;
    // vala
    this.r(ctx, x, groundY, trenchW, CONFIG.H - groundY, C.trench);
    this.r(ctx, x, groundY, trenchW, 6, C.dirtDark);
    this.r(ctx, x - 14, groundY - 8, 16, 8, C.dirt);
    this.r(ctx, x + trenchW - 2, groundY - 8, 16, 8, C.dirt);
    // escoramento nas laterais da vala
    this.r(ctx, x + 4, groundY + 6, 4, CONFIG.H - groundY - 8, '#8a5a2b');
    this.r(ctx, x + trenchW - 8, groundY + 6, 4, CONFIG.H - groundY - 8, '#8a5a2b');

    // painel de materiais exigidos (acima da vala)
    const keys = Object.keys(requirements);
    const panelW = 150;
    const panelH = 22 + keys.length * 20;
    const px = x + trenchW / 2 - panelW / 2;
    const py = groundY - panelH - 74;
    this.r(ctx, x + trenchW / 2 - 3, py + panelH, 6, 74, '#8a5a2b'); // poste
    ctx.fillStyle = '#1c2530';
    ctx.fillRect(px, py, panelW, panelH);
    ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 2;
    ctx.strokeRect(px, py, panelW, panelH);
    ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 12px monospace';
    ctx.fillText('OBRA — MATERIAIS', px + 8, py + 15);
    keys.forEach((k, i) => {
      const ry = py + 24 + i * 20;
      ctx.save(); ctx.translate(px + 8, ry); this.itemIcon(ctx, k, 16); ctx.restore();
      const have = delivered[k] || 0;
      const need = requirements[k];
      ctx.fillStyle = have >= need ? '#7CFC00' : '#fff';
      ctx.font = 'bold 13px monospace';
      ctx.fillText((CONFIG.NAMES[k] || k) + ': ' + have + '/' + need, px + 30, ry + 13);
    });

    // materiais entregues empilhados na vala
    let stack = 0;
    for (const k of keys) {
      for (let i = 0; i < (delivered[k] || 0); i++) {
        const col = stack % 4, row = Math.floor(stack / 4);
        ctx.save(); ctx.translate(x + 10 + col * 28, groundY + 16 + row * 14);
        this.itemIcon(ctx, k, 16); ctx.restore();
        stack++;
      }
    }

    // fita zebrada
    for (let i = 0; i < trenchW; i += 16) {
      ctx.fillStyle = i % 32 === 0 ? '#ffcc00' : '#000';
      ctx.fillRect(x + i, groundY - 2, 16, 3);
    }
    ctx.restore();
  },
};
