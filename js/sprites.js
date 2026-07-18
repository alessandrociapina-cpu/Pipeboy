// ===== Pipeboy — Sprites desenhados via Canvas (sem assets externos) =====
const Sprites = {
  // helper: retângulo
  r(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  },

  // ---- GEORGE SANEAR ----
  // facing: 1 direita, -1 esquerda | walk: fase de animação | attacking: bool
  george(ctx, x, y, facing, walk, attacking, carrying) {
    const C = CONFIG.COLORS;
    ctx.save();
    ctx.translate(x, y);
    if (facing < 0) ctx.scale(-1, 1); // espelha

    const step = Math.sin(walk) * 3;

    // pernas (animadas)
    this.r(ctx, -8, 34, 7, 16 - step, C.pants);
    this.r(ctx, 2, 34, 7, 16 + step, C.pants);
    // botas
    this.r(ctx, -9, 49 - step, 9, 5, '#1a1a1a');
    this.r(ctx, 1, 49 + step, 9, 5, '#1a1a1a');

    // corpo / colete laranja fluorescente
    this.r(ctx, -10, 12, 20, 24, C.vest);
    // faixas refletivas do colete
    this.r(ctx, -10, 18, 20, 3, '#dfe9f2');
    this.r(ctx, -10, 28, 20, 3, '#dfe9f2');
    // zíper central
    this.r(ctx, -1, 12, 2, 24, '#c96a00');

    // braço / ferramenta
    if (attacking) {
      this.r(ctx, 8, 10, 6, 6, C.skin);       // braço estendido
      // picareta
      this.r(ctx, 14, 6, 3, 18, '#8a5a2b');   // cabo
      this.r(ctx, 10, 4, 14, 4, '#9aa3ad');   // cabeça de metal
    } else {
      this.r(ctx, 8, 16, 6, 12, C.skin);      // braço ao lado
    }

    // cabeça
    this.r(ctx, -7, 0, 14, 13, C.skin);
    // capacete azul
    this.r(ctx, -9, -4, 18, 8, C.helmet);
    this.r(ctx, -9, 2, 18, 2, '#0f4f9a'); // aba
    this.r(ctx, -2, -7, 4, 3, '#0f4f9a'); // cristazinha
    // rosto
    this.r(ctx, 3, 5, 2, 2, '#222');       // olho
    this.r(ctx, -6, 8, 6, 2, '#b98a5a');   // bigode

    // item carregado (acima da cabeça)
    if (carrying) this.itemMini(ctx, -8, -22, carrying);

    ctx.restore();
  },

  // versão pequena do item, sobre a cabeça
  itemMini(ctx, x, y, type) {
    ctx.save();
    ctx.translate(x, y);
    this.itemIcon(ctx, type, 16);
    ctx.restore();
  },

  // ---- ITENS (materiais) ----
  // desenha o ícone do item num "tile" de tamanho s
  itemIcon(ctx, type, s) {
    switch (type) {
      case 'tubo': // tubo de água azul
        this.r(ctx, 0, s * 0.3, s, s * 0.4, '#2e86de');
        this.r(ctx, 0, s * 0.3, s, 3, '#5aa9f0');
        this.r(ctx, -2, s * 0.25, 4, s * 0.5, '#1b5fb0'); // boca
        this.r(ctx, s - 2, s * 0.25, 4, s * 0.5, '#1b5fb0');
        break;
      case 'cone':
        this.r(ctx, s * 0.35, 2, s * 0.3, s * 0.75, CONFIG.COLORS.vest);
        this.r(ctx, s * 0.28, s * 0.35, s * 0.44, 3, '#fff');
        this.r(ctx, s * 0.15, s * 0.75, s * 0.7, 4, '#c96a00');
        break;
      case 'placa':
        this.r(ctx, s * 0.45, s * 0.4, 3, s * 0.55, '#8a5a2b'); // poste
        this.r(ctx, s * 0.1, 2, s * 0.8, s * 0.4, '#ffcc00');
        this.r(ctx, s * 0.1, 2, s * 0.8, s * 0.4, '#ffcc00');
        ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
        ctx.strokeRect(s * 0.12, 3, s * 0.76, s * 0.36);
        break;
      case 'tampao': // tampão de esgoto
        ctx.fillStyle = '#3a3f47';
        ctx.beginPath();
        ctx.arc(s / 2, s / 2, s * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#20242a'; ctx.lineWidth = 2;
        ctx.stroke();
        this.r(ctx, s * 0.3, s * 0.47, s * 0.4, 2, '#20242a');
        break;
      case 'escora': // escoramento (madeira)
        this.r(ctx, 2, 2, s - 4, 4, '#8a5a2b');
        this.r(ctx, 2, s - 6, s - 4, 4, '#8a5a2b');
        this.r(ctx, 4, 4, 4, s - 8, '#6b4a2b');
        this.r(ctx, s - 8, 4, 4, s - 8, '#6b4a2b');
        break;
    }
  },

  // caixote de material no chão (com item em cima)
  itemCrate(ctx, x, y, type) {
    ctx.save();
    ctx.translate(x, y);
    // sombra
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 26, 28, 4);
    // caixote
    this.r(ctx, 0, 8, 28, 20, '#8a5a2b');
    this.r(ctx, 0, 8, 28, 3, '#a06a34');
    ctx.strokeStyle = '#5c3d1c'; ctx.lineWidth = 1;
    ctx.strokeRect(0, 8, 28, 20);
    // item flutuando um pouco
    ctx.save();
    ctx.translate(4, -8);
    this.itemIcon(ctx, type, 20);
    ctx.restore();
    ctx.restore();
  },

  // ---- MONSTRO DE ESGOTO (fezes / gordura) ----
  monster(ctx, x, y, t, kind) {
    ctx.save();
    ctx.translate(x, y);
    const wobble = Math.sin(t * 0.15) * 2;
    const base = kind === 'grease' ? CONFIG.COLORS.grease : '#7a5a30';
    const dark = kind === 'grease' ? '#c9a94b' : '#573f1f';

    // corpo gosmento
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.moveTo(0, 30);
    ctx.quadraticCurveTo(0, 4 + wobble, 16, 4 + wobble);
    ctx.quadraticCurveTo(32, 4 + wobble, 32, 30);
    ctx.closePath();
    ctx.fill();
    // gotas
    this.r(ctx, 4, 28, 5, 6 + wobble, base);
    this.r(ctx, 22, 28, 5, 6 - wobble, base);
    // brilho
    this.r(ctx, 8, 10, 6, 4, dark);
    // olhos raivosos
    this.r(ctx, 9, 14, 5, 5, '#fff');
    this.r(ctx, 19, 14, 5, 5, '#fff');
    this.r(ctx, 11, 16, 3, 3, '#b00');
    this.r(ctx, 21, 16, 3, 3, '#b00');
    // boca
    this.r(ctx, 10, 23, 12, 3, '#3a1a1a');
    ctx.restore();
  },

  // ---- REGIS GUARIONE (vilão) ----
  regis(ctx, x, y, facing, t) {
    const C = CONFIG.COLORS;
    ctx.save();
    ctx.translate(x, y);
    if (facing < 0) ctx.scale(-1, 1);
    const step = Math.sin(t * 0.3) * 3;

    // pernas
    this.r(ctx, -8, 36, 7, 14 - step, '#1a1a1a');
    this.r(ctx, 2, 36, 7, 14 + step, '#1a1a1a');
    // terno chique (empreiteiro metido)
    this.r(ctx, -11, 12, 22, 26, '#5a1a1a');
    this.r(ctx, -2, 12, 4, 26, '#fff'); // camisa
    this.r(ctx, -1, 14, 2, 14, '#111'); // gravata
    // braço apontando (mandão)
    this.r(ctx, 9, 14, 12, 5, '#5a1a1a');
    this.r(ctx, 20, 14, 5, 5, C.skin);
    // cabeça
    this.r(ctx, -7, 0, 14, 13, C.skin);
    // cabelo engomado + óculos escuros
    this.r(ctx, -8, -3, 16, 5, '#111');
    this.r(ctx, -6, 5, 12, 3, '#111'); // óculos
    // sorriso maligno
    this.r(ctx, -4, 9, 8, 2, '#7a2a2a');
    // "chifrinhos" de vilão (estética)
    this.r(ctx, -8, -6, 2, 4, '#5a1a1a');
    this.r(ctx, 6, -6, 2, 4, '#5a1a1a');
    ctx.restore();
  },

  // ---- FUNCIONÁRIO PERDIDO ----
  worker(ctx, x, y, t) {
    const C = CONFIG.COLORS;
    ctx.save();
    ctx.translate(x, y);
    const bob = Math.sin(t * 0.1) * 1.5;
    ctx.translate(0, bob);
    // pernas
    this.r(ctx, -6, 32, 5, 14, C.pants);
    this.r(ctx, 1, 32, 5, 14, C.pants);
    // colete amarelo
    this.r(ctx, -8, 14, 16, 20, '#ffd400');
    this.r(ctx, -8, 22, 16, 2, '#fff');
    // cabeça
    this.r(ctx, -6, 2, 12, 12, C.skin);
    // capacete branco
    this.r(ctx, -7, -1, 14, 6, '#f2f2f2');
    // "?" de perdido
    ctx.fillStyle = '#ffd400';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('?', -4, -8);
    ctx.restore();
  },

  // ---- OBRA / VALA ABERTA (goal) ----
  site(ctx, x, groundY, delivered, goal) {
    const C = CONFIG.COLORS;
    ctx.save();
    // vala aberta no chão
    const trenchW = 120;
    this.r(ctx, x, groundY, trenchW, CONFIG.H - groundY, C.trench);
    this.r(ctx, x, groundY, trenchW, 6, C.dirtDark);
    // terra amontoada nas bordas
    this.r(ctx, x - 14, groundY - 8, 16, 8, C.dirt);
    this.r(ctx, x + trenchW - 2, groundY - 8, 16, 8, C.dirt);
    // tubos já entregues, empilhados na vala
    for (let i = 0; i < delivered; i++) {
      const py = groundY + 20 + (i % 3) * 12;
      const px = x + 12 + Math.floor(i / 3) * 26;
      this.r(ctx, px, py, 22, 8, '#2e86de');
      this.r(ctx, px, py, 22, 2, '#5aa9f0');
    }
    // placa da obra
    this.r(ctx, x + 40, groundY - 70, 4, 40, '#8a5a2b');
    this.r(ctx, x + 8, groundY - 96, 90, 28, '#ffcc00');
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
    ctx.strokeRect(x + 8, groundY - 96, 90, 28);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('OBRA', x + 20, groundY - 84);
    ctx.fillText(delivered + '/' + goal + ' tubos', x + 14, groundY - 73);
    // fita zebrada
    for (let i = 0; i < trenchW; i += 16) {
      ctx.fillStyle = i % 32 === 0 ? '#ffcc00' : '#000';
      ctx.fillRect(x + i, groundY - 2, 16, 3);
    }
    ctx.restore();
  },
};
