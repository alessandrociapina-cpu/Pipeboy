// ===== Pipeboy — Configuração global =====
const CONFIG = {
  W: 900,               // largura do canvas (viewport)
  H: 480,               // altura do canvas
  GROUND_Y: 400,        // linha do chão (topo do asfalto)
  GRAVITY: 0.7,
  MOVE_SPEED: 3.2,
  JUMP_V: -13,
  LEVEL_WIDTH: 3600,    // comprimento total da fase (mundo)

  PLAYER_HP: 100,
  DELIVER_GOAL: 5,      // tubos a entregar para vencer a fase

  // pontuação
  SCORE_DELIVER: 100,
  SCORE_KILL: 25,
  SCORE_RESCUE: 150,

  COLORS: {
    sky: '#6ec6ff',
    skyFar: '#a9dcff',
    asphalt: '#2b2f36',
    asphaltLine: '#4a515b',
    dirt: '#6b4a2b',
    dirtDark: '#4d3620',
    helmet: '#1e6fd0',
    vest: '#ff8c1a',
    skin: '#e8b98f',
    pants: '#33414f',
    lodo: '#6b8e23',
    grease: '#e8c96b',
    trench: '#241a10',
  },
};
