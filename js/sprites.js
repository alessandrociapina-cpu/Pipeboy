// ===== Pipeboy — Sprites desenhados via Canvas (maiores e mais detalhados) =====
const Sprites = {
  r(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); },

  // membro em dois tons (sombra à direita e embaixo)
  limb(ctx, x, y, w, h, col, dark) {
    ctx.fillStyle = col; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = dark; ctx.fillRect(x + w - 2, y, 2, h); ctx.fillRect(x, y + h - 2, w, 2);
  },

  shadow(ctx, cx, cy, rx) {
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, rx * 0.28, 0, 0, Math.PI * 2); ctx.fill();
  },

  // ---- GEORGE SANEAR (a pé) — ~94px ----
  george(ctx, x, y, facing, walk, attacking, carrying) {
    const C = CONFIG.COLORS;
    ctx.save();
    ctx.translate(x, y);
    if (facing < 0) ctx.scale(-1, 1);
    const step = Math.sin(walk) * 6;

    this.shadow(ctx, 0, 92, 24);

    // PERNAS
    this.limb(ctx, -12, 64, 11, 26 - step, C.pants, C.pantsDark);
    this.limb(ctx, 3, 64, 11, 26 + step, C.pants, C.pantsDark);
    // BOTAS
    this.r(ctx, -15, 86 - step, 16, 9, C.boot); this.r(ctx, -15, 92 - step, 16, 3, '#000');
    this.r(ctx, 1, 86 + step, 16, 9, C.boot);  this.r(ctx, 1, 92 + step, 16, 3, '#000');

    // TORSO — colete
    this.r(ctx, -17, 36, 34, 36, C.vest);
    this.r(ctx, 13, 36, 4, 36, C.vestDark);         // sombra lateral
    this.r(ctx, -17, 68, 34, 4, C.vestDark);        // barra inferior
    // camisa/gola
    this.r(ctx, -6, 34, 12, 8, '#dfe7ee');
    // faixas refletivas
    this.r(ctx, -17, 46, 34, 5, C.reflect);
    this.r(ctx, -17, 58, 34, 5, C.reflect);
    // zíper
    this.r(ctx, -1, 36, 2, 36, C.vestDark);

    // BRAÇO + ferramenta
    if (attacking) {
      // braço estendido para cima/frente
      this.limb(ctx, 8, 34, 10, 8, C.vest, C.vestDark);
      this.r(ctx, 16, 30, 8, 8, C.skin);
      // picareta
      ctx.save();
      ctx.translate(22, 30); ctx.rotate(-0.5);
      this.r(ctx, -2, -4, 5, 30, '#7a5326');   // cabo
      this.r(ctx, -12, -8, 26, 6, '#aab3bd');  // cabeça de metal
      this.r(ctx, -12, -8, 26, 2, '#cfd6de');
      ctx.restore();
    } else {
      this.limb(ctx, 10, 40, 10, 18, C.vest, C.vestDark);   // manga
      this.r(ctx, 11, 56, 9, 9, C.skin);                    // mão
    }

    // PESCOÇO
    this.r(ctx, -6, 32, 12, 8, C.skinDark);
    // CABEÇA
    this.r(ctx, -13, 12, 26, 24, C.skin);
    this.r(ctx, -13, 30, 26, 6, C.skinDark);   // sombra do queixo
    this.r(ctx, -15, 20, 3, 7, C.skin);        // orelha (lado de trás)
    // rosto
    this.r(ctx, 3, 16, 6, 2, '#5a3a20');       // sobrancelha
    this.r(ctx, 4, 19, 5, 5, '#20242a');       // olho
    this.r(ctx, 10, 22, 3, 6, C.skinDark);     // nariz
    this.r(ctx, -3, 28, 13, 3, '#5a3a20');     // bigode
    // CAPACETE
    ctx.fillStyle = C.helmet;
    ctx.beginPath(); ctx.arc(0, 12, 16, Math.PI, 0); ctx.closePath(); ctx.fill();
    this.r(ctx, -16, 10, 32, 5, C.helmet);
    this.r(ctx, -20, 14, 40, 5, C.helmetDark); // aba
    this.r(ctx, -2, -6, 4, 18, C.helmetDark);  // crista
    this.r(ctx, -11, 2, 9, 4, '#4a9be0');      // brilho

    if (carrying) { ctx.save(); ctx.translate(-13, -18); this.itemIcon(ctx, carrying, 26); ctx.restore(); }

    ctx.restore();
  },

  // ---- GEORGE na RETROESCAVADEIRA ----
  backhoe(ctx, x, y, facing, load) {
    const C = CONFIG.COLORS;
    ctx.save();
    ctx.translate(x, y);
    if (facing < 0) ctx.scale(-1, 1);

    this.shadow(ctx, 6, 96, 46);

    // rodas
    ctx.fillStyle = '#15181c';
    ctx.beginPath(); ctx.arc(-20, 84, 16, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(28, 84, 20, 0, 7); ctx.fill();
    ctx.fillStyle = '#4a4f57';
    ctx.beginPath(); ctx.arc(-20, 84, 6, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(28, 84, 8, 0, 7); ctx.fill();

    // corpo
    this.r(ctx, -34, 48, 74, 28, C.machine);
    this.r(ctx, -34, 48, 74, 5, '#ffe066');
    this.r(ctx, -34, 70, 74, 6, C.machineDark);
    // cabine
    this.r(ctx, -28, 14, 34, 36, C.machine);
    this.r(ctx, -25, 20, 28, 24, '#bfe3ff');
    // George dentro
    this.r(ctx, -18, 20, 16, 14, C.skin);
    this.r(ctx, -20, 12, 20, 9, C.helmet);
    this.r(ctx, -6, 25, 3, 3, '#20242a');
    // braço + caçamba
    this.r(ctx, 8, 34, 30, 7, C.machineDark);
    this.r(ctx, 36, 30, 8, 24, C.machineDark);
    this.r(ctx, 40, 46, 20, 18, C.machine);
    this.r(ctx, 40, 60, 20, 4, '#7a5a10');
    ctx.fillStyle = '#2b2f36';
    for (let i = 0; i < 4; i++) ctx.fillRect(43 + i * 5, 64, 3, 4);

    // carga de tubos
    for (let i = 0; i < Math.min(load, 8); i++) {
      const col = i % 4, row = Math.floor(i / 4);
      this.r(ctx, -30 + col * 8, 34 - row * 8, 7, 7, '#2e86de');
      this.r(ctx, -30 + col * 8, 34 - row * 8, 7, 2, '#5aa9f0');
    }
    if (load > 0) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 14px monospace';
      if (facing < 0) { ctx.save(); ctx.scale(-1, 1); ctx.fillText('x' + load, -8, 6); ctx.restore(); }
      else ctx.fillText('x' + load, -30, 6);
    }
    ctx.restore();
  },

  itemMini(ctx, x, y, type) { ctx.save(); ctx.translate(x, y); this.itemIcon(ctx, type, 22); ctx.restore(); },

  // ---- ÍCONES DE MATERIAIS ----
  itemIcon(ctx, type, s) {
    switch (type) {
      case 'tubo':
        this.r(ctx, 0, s * 0.3, s, s * 0.4, '#2e86de');
        this.r(ctx, 0, s * 0.3, s, s * 0.12, '#5aa9f0');
        this.r(ctx, -2, s * 0.24, 4, s * 0.52, '#1b5fb0');
        this.r(ctx, s - 2, s * 0.24, 4, s * 0.52, '#1b5fb0');
        break;
      case 'cone':
        this.r(ctx, s * 0.34, 1, s * 0.32, s * 0.78, CONFIG.COLORS.vest);
        this.r(ctx, s * 0.27, s * 0.34, s * 0.46, s * 0.14, '#fff');
        this.r(ctx, s * 0.12, s * 0.76, s * 0.76, s * 0.2, CONFIG.COLORS.vestDark);
        break;
      case 'placa':
        this.r(ctx, s * 0.45, s * 0.4, 3, s * 0.55, '#7a5326');
        this.r(ctx, s * 0.1, 1, s * 0.8, s * 0.42, '#ffcc00');
        ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.strokeRect(s * 0.12, 2, s * 0.76, s * 0.38);
        this.r(ctx, s * 0.28, s * 0.1, s * 0.44, s * 0.22, '#000');
        break;
      case 'tampao':
        ctx.fillStyle = '#3a3f47';
        ctx.beginPath(); ctx.arc(s / 2, s / 2, s * 0.44, 0, 7); ctx.fill();
        ctx.strokeStyle = '#20242a'; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.fillStyle = '#565c66';
        ctx.beginPath(); ctx.arc(s / 2, s / 2, s * 0.30, 0, 7); ctx.fill();
        this.r(ctx, s * 0.28, s * 0.47, s * 0.44, 2, '#20242a');
        break;
      case 'escora':
        this.r(ctx, 1, 1, s - 2, 5, '#8a5a2b');
        this.r(ctx, 1, s - 6, s - 2, 5, '#8a5a2b');
        this.r(ctx, 4, 5, 5, s - 10, '#6b4a2b');
        this.r(ctx, s - 9, 5, 5, s - 10, '#6b4a2b');
        break;
    }
  },

  itemCrate(ctx, x, y, type) {
    ctx.save(); ctx.translate(x, y);
    this.shadow(ctx, 18, 40, 20);
    this.r(ctx, 0, 10, 36, 28, '#8a5a2b');
    this.r(ctx, 0, 10, 36, 4, '#a06a34');
    this.r(ctx, 0, 10, 4, 28, '#6b4a2b'); this.r(ctx, 32, 10, 4, 28, '#6b4a2b');
    ctx.strokeStyle = '#5c3d1c'; ctx.lineWidth = 1.5; ctx.strokeRect(0, 10, 36, 28);
    ctx.save(); ctx.translate(6, -8); this.itemIcon(ctx, type, 26); ctx.restore();
    ctx.restore();
  },

  // ---- POWER-UP retroescavadeira ----
  powerup(ctx, x, y, kind, t) {
    ctx.save(); ctx.translate(x, y);
    const bob = Math.sin(t * 0.1) * 4;
    ctx.translate(0, bob);
    ctx.fillStyle = 'rgba(255,220,80,0.25)';
    ctx.beginPath(); ctx.arc(22, 20, 30, 0, 7); ctx.fill();
    this.r(ctx, 4, 20, 38, 16, CONFIG.COLORS.machine);
    this.r(ctx, 10, 8, 16, 14, CONFIG.COLORS.machine);
    this.r(ctx, 13, 11, 11, 9, '#bfe3ff');
    ctx.fillStyle = '#15181c';
    ctx.beginPath(); ctx.arc(12, 38, 7, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(32, 38, 8, 0, 7); ctx.fill();
    this.r(ctx, 36, 16, 12, 4, CONFIG.COLORS.machineDark);
    ctx.restore();
  },

  // ---- MONSTRO DE ESGOTO — ~48px ----
  monster(ctx, x, y, t, kind, fleeing) {
    ctx.save(); ctx.translate(x, y);
    const wob = Math.sin(t * 0.15) * 3;
    const base = kind === 'grease' ? CONFIG.COLORS.grease : '#7a5a30';
    const dark = kind === 'grease' ? '#c9a94b' : '#573f1f';
    this.shadow(ctx, 24, 46, 22);
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.moveTo(0, 46);
    ctx.quadraticCurveTo(-2, 6 + wob, 24, 4 + wob);
    ctx.quadraticCurveTo(50, 6 + wob, 48, 46);
    ctx.closePath(); ctx.fill();
    // gotas
    this.r(ctx, 6, 42, 7, 8 + wob, base);
    this.r(ctx, 34, 42, 7, 8 - wob, base);
    // manchas
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.arc(14, 20, 5, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(34, 26, 4, 0, 7); ctx.fill();
    // olhos
    this.r(ctx, 12, 18, 8, 8, '#fff');
    this.r(ctx, 28, 18, 8, 8, '#fff');
    if (fleeing) {
      this.r(ctx, 15, 20, 4, 4, '#0055ff'); this.r(ctx, 31, 20, 4, 4, '#0055ff');
      ctx.fillStyle = '#3a1a1a'; ctx.beginPath(); ctx.arc(24, 36, 4, 0, 7); ctx.fill();
    } else {
      this.r(ctx, 15, 21, 4, 4, '#b00'); this.r(ctx, 31, 21, 4, 4, '#b00');
      this.r(ctx, 14, 33, 20, 4, '#3a1a1a');
      this.r(ctx, 17, 33, 3, 4, '#fff'); this.r(ctx, 26, 33, 3, 4, '#fff'); // dentes
    }
    ctx.restore();
  },

  // ---- SORGEI GUARIONE — ~92px ----
  sorgei(ctx, x, y, facing, t, ranting) {
    const C = CONFIG.COLORS;
    ctx.save(); ctx.translate(x, y);
    if (facing < 0) ctx.scale(-1, 1);
    const step = Math.sin(t * 0.3) * 5;
    this.shadow(ctx, 0, 90, 24);
    // pernas
    this.limb(ctx, -12, 66, 11, 24 - step, '#1c1c1c', '#000');
    this.limb(ctx, 3, 66, 11, 24 + step, '#1c1c1c', '#000');
    this.r(ctx, -15, 88 - step, 16, 6, '#000');
    this.r(ctx, 1, 88 + step, 16, 6, '#000');
    // terno
    this.r(ctx, -18, 36, 36, 34, '#5a1a1a');
    this.r(ctx, 14, 36, 4, 34, '#3f1010');
    this.r(ctx, -4, 34, 8, 34, '#f2f2f2');   // camisa
    this.r(ctx, -1, 36, 2, 20, '#111');      // gravata
    this.r(ctx, -3, 54, 4, 6, '#111');
    // braço apontando
    const arm = ranting ? Math.sin(t * 0.4) * 6 : 0;
    this.limb(ctx, 12, 34 - arm, 16, 8, '#5a1a1a', '#3f1010');
    this.r(ctx, 26, 34 - arm, 8, 8, C.skin);
    // pescoço + cabeça
    this.r(ctx, -6, 32, 12, 8, C.skinDark);
    this.r(ctx, -13, 12, 26, 24, C.skin);
    this.r(ctx, -13, 30, 26, 6, C.skinDark);
    // cabelo engomado
    this.r(ctx, -14, 8, 28, 8, '#111');
    this.r(ctx, -14, 8, 6, 4, '#111');
    // óculos escuros
    this.r(ctx, -11, 18, 22, 6, '#111');
    this.r(ctx, -11, 18, 9, 6, '#222'); this.r(ctx, 2, 18, 9, 6, '#222');
    // boca
    if (ranting) { ctx.fillStyle = '#3a0a0a'; ctx.beginPath(); ctx.arc(2, 30, 4, 0, 7); ctx.fill(); }
    else this.r(ctx, -2, 29, 10, 2, '#7a2a2a');
    ctx.restore();
  },

  // ---- FUNCIONÁRIO — ~84px ----
  // mode: 'lost' | 'follow' | 'work'   working: bool (bate picareta)
  worker(ctx, x, y, t, mode, working) {
    const C = CONFIG.COLORS;
    ctx.save(); ctx.translate(x, y);
    const bob = mode === 'follow' ? Math.sin(t * 0.12) * 2 : 0;
    ctx.translate(0, bob);
    this.shadow(ctx, 0, 82, 20);
    // pernas
    this.limb(ctx, -9, 58, 9, 22, C.pants, C.pantsDark);
    this.limb(ctx, 2, 58, 9, 22, C.pants, C.pantsDark);
    this.r(ctx, -11, 78, 13, 6, C.boot);
    this.r(ctx, 1, 78, 13, 6, C.boot);
    // colete amarelo
    this.r(ctx, -14, 32, 28, 30, C.workerVest);
    this.r(ctx, 10, 32, 4, 30, C.workerVestDark);
    this.r(ctx, -14, 42, 28, 4, C.reflect);
    this.r(ctx, -14, 52, 28, 4, C.reflect);
    // pescoço + cabeça
    this.r(ctx, -5, 28, 10, 6, C.skinDark);
    this.r(ctx, -11, 10, 22, 20, C.skin);
    this.r(ctx, -11, 26, 22, 4, C.skinDark);
    this.r(ctx, 3, 16, 4, 4, '#20242a'); // olho
    // capacete branco
    ctx.fillStyle = '#f2f2f2';
    ctx.beginPath(); ctx.arc(0, 10, 13, Math.PI, 0); ctx.closePath(); ctx.fill();
    this.r(ctx, -16, 12, 32, 4, '#d8d8d8');

    if (mode === 'work' && working) {
      const swing = Math.sin(t * 0.28);
      ctx.save();
      ctx.translate(9, 34); ctx.rotate(-0.5 + swing * 1.0);
      this.r(ctx, -2, -4, 4, 26, '#7a5326');
      this.r(ctx, -10, -8, 22, 5, '#aab3bd');
      this.r(ctx, -10, -8, 22, 2, '#cfd6de');
      ctx.restore();
      if (swing > 0.75) { this.r(ctx, 16, 76, 3, 3, '#ffd400'); this.r(ctx, 21, 73, 2, 2, '#fff'); }
    } else if (mode === 'work' && !working) {
      // parado (sem cones) — braço coçando a cabeça
      this.limb(ctx, 8, 34, 8, 12, C.workerVest, C.workerVestDark);
      ctx.fillStyle = '#ff5a4d'; ctx.font = 'bold 16px monospace'; ctx.fillText('!', -3, 2);
    } else if (mode === 'lost') {
      ctx.fillStyle = '#ffd400'; ctx.font = 'bold 18px monospace'; ctx.fillText('?', -5, -6);
    }
    ctx.restore();
  },

  // ---- OBRA / VALA + painel de materiais ----
  site(ctx, x, groundY, delivered, requirements) {
    const C = CONFIG.COLORS;
    ctx.save();
    const trenchW = 170;
    this.r(ctx, x, groundY, trenchW, CONFIG.H - groundY, C.trench);
    this.r(ctx, x, groundY, trenchW, 8, C.dirtDark);
    this.r(ctx, x - 18, groundY - 10, 20, 10, C.dirt);
    this.r(ctx, x + trenchW - 2, groundY - 10, 20, 10, C.dirt);
    // escoramentos
    this.r(ctx, x + 6, groundY + 8, 5, CONFIG.H - groundY - 10, '#8a5a2b');
    this.r(ctx, x + trenchW - 11, groundY + 8, 5, CONFIG.H - groundY - 10, '#8a5a2b');

    // painel de materiais
    const keys = Object.keys(requirements);
    const panelW = 190, panelH = 26 + keys.length * 24;
    const px = x + trenchW / 2 - panelW / 2;
    const py = groundY - panelH - 96;
    this.r(ctx, x + trenchW / 2 - 4, py + panelH, 8, 96, '#7a5326');
    ctx.fillStyle = '#16202b'; ctx.fillRect(px, py, panelW, panelH);
    ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 3; ctx.strokeRect(px, py, panelW, panelH);
    ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 14px monospace';
    ctx.fillText('OBRA — MATERIAIS', px + 10, py + 18);
    keys.forEach((k, i) => {
      const ry = py + 30 + i * 24;
      ctx.save(); ctx.translate(px + 10, ry); this.itemIcon(ctx, k, 20); ctx.restore();
      const have = delivered[k] || 0, need = requirements[k];
      ctx.fillStyle = have >= need ? '#7CFC00' : '#fff'; ctx.font = 'bold 15px monospace';
      ctx.fillText((CONFIG.NAMES[k] || k) + ': ' + have + '/' + need, px + 38, ry + 16);
    });

    // materiais empilhados na vala
    let stack = 0;
    for (const k of keys) for (let i = 0; i < (delivered[k] || 0); i++) {
      const col = stack % 5, row = Math.floor(stack / 5);
      ctx.save(); ctx.translate(x + 12 + col * 30, groundY + 20 + row * 18);
      this.itemIcon(ctx, k, 20); ctx.restore(); stack++;
    }
    // fita zebrada
    for (let i = 0; i < trenchW; i += 20) {
      ctx.fillStyle = i % 40 === 0 ? '#ffcc00' : '#000';
      ctx.fillRect(x + i, groundY - 3, 20, 4);
    }
    ctx.restore();
  },
};
