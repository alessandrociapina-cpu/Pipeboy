// ===== Pipeboy — Entrada (teclado + touch) =====
const Input = {
  left: false,
  right: false,
  jump: false,   // "edge" — verdadeiro só no frame do pressionar
  _jumpHeld: false,

  init(game) {
    this.game = game;

    const down = (code) => {
      switch (code) {
        case 'ArrowLeft': case 'KeyA': this.left = true; break;
        case 'ArrowRight': case 'KeyD': this.right = true; break;
        case 'ArrowUp': case 'KeyW': case 'Space':
          if (!this._jumpHeld) this.jump = true;
          this._jumpHeld = true;
          break;
        case 'KeyJ': case 'KeyZ':
          if (game.state === 'playing') game.player.attack();
          break;
        case 'KeyK': case 'KeyX':
          if (game.state === 'playing') game.handlePickDeliver();
          break;
        case 'KeyP':
          game.togglePause();
          break;
        case 'Enter':
          if (game.state === 'won' || game.state === 'lost') game.start();
          break;
      }
    };

    const up = (code) => {
      switch (code) {
        case 'ArrowLeft': case 'KeyA': this.left = false; break;
        case 'ArrowRight': case 'KeyD': this.right = false; break;
        case 'ArrowUp': case 'KeyW': case 'Space':
          this._jumpHeld = false; break;
      }
    };

    window.addEventListener('keydown', (e) => {
      if (['ArrowLeft','ArrowRight','ArrowUp','Space'].includes(e.code)) e.preventDefault();
      down(e.code);
    });
    window.addEventListener('keyup', (e) => up(e.code));

    // botões touch
    document.querySelectorAll('#touch button').forEach((btn) => {
      const key = btn.dataset.key;
      const press = (e) => { e.preventDefault(); down(key); };
      const release = (e) => { e.preventDefault(); up(key); };
      btn.addEventListener('touchstart', press, { passive: false });
      btn.addEventListener('touchend', release, { passive: false });
      btn.addEventListener('mousedown', press);
      btn.addEventListener('mouseup', release);
      btn.addEventListener('mouseleave', release);
    });
  },

  // chamado ao fim de cada frame para zerar os "edges"
  postFrame() {
    this.jump = false;
  },
};
