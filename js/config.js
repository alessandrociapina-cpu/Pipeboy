// ===== Pipeboy — Configuração global =====
const CONFIG = {
  W: 900,               // largura do canvas (viewport)
  H: 480,               // altura do canvas
  GROUND_Y: 400,        // linha do chão (topo do asfalto)
  GRAVITY: 0.55,
  MOVE_SPEED: 2.1,      // ritmo mais calmo
  JUMP_V: -11,
  LEVEL_WIDTH: 3000,    // comprimento total da fase (mundo)

  PLAYER_HP: 100,

  // materiais exigidos pela obra para concluir a fase
  REQUIREMENTS: { tubo: 5, tampao: 2, cone: 2 },

  // power-ups (duração em frames a ~60fps)
  BACKHOE_TIME: 60 * 11,   // retroescavadeira: ~11s
  BACKHOE_CAP: 8,          // quantos materiais leva de uma vez
  SAPINHO_TIME: 60 * 11,   // sapinho: ~11s

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
    skin: '#b9764a',       // pele mais bronzeada
    skinDark: '#9c5f38',
    pants: '#33414f',
    lodo: '#6b8e23',
    grease: '#e8c96b',
    trench: '#241a10',
    machine: '#f2c200',    // amarelo maquinário
    machineDark: '#c99a00',
  },

  // nomes amigáveis dos materiais
  NAMES: {
    tubo: 'Tubos',
    tampao: 'Tampões',
    cone: 'Cones',
    placa: 'Placas',
    escora: 'Escoram.',
  },
};
