// ===== Pipeboy — Configuração global =====
const CONFIG = {
  W: 1200,              // canvas maior
  H: 600,
  GROUND_Y: 470,        // linha do chão
  GRAVITY: 0.62,
  MOVE_SPEED: 2.8,
  JUMP_V: -13,
  LEVEL_WIDTH: 3400,

  PLAYER_HP: 100,

  // materiais exigidos pela obra
  REQUIREMENTS: { tubo: 5, tampao: 4, cone: 2 },
  BUILD_MATERIALS: ['tubo', 'tampao'], // limitam o TETO da barra de progresso
  CONE_KEY: 'cone',                     // habilita os funcionários a trabalhar

  // progresso da obra
  MAX_WORKERS: 5,
  PROGRESS_PER_WORKER: 0.028, // % por frame por funcionário (1 ~60s, 5 ~12s)

  // power-up
  BACKHOE_TIME: 60 * 12,   // retroescavadeira ~12s
  BACKHOE_CAP: 8,

  // pontuação
  SCORE_DELIVER: 100,
  SCORE_KILL: 25,
  SCORE_RESCUE: 150,

  COLORS: {
    sky: '#6ec6ff',
    skyFar: '#a9dcff',
    asphalt: '#2b2f36',
    asphaltDark: '#23272d',
    asphaltLine: '#e8c34a',
    dirt: '#6b4a2b',
    dirtDark: '#4d3620',
    helmet: '#1e6fd0',
    helmetDark: '#0f4f9a',
    vest: '#ff8c1a',
    vestDark: '#c96a00',
    reflect: '#eaf2fa',
    skin: '#b9764a',
    skinDark: '#9c5f38',
    pants: '#33414f',
    pantsDark: '#26313c',
    boot: '#20242a',
    lodo: '#6b8e23',
    grease: '#e8c96b',
    trench: '#1c140c',
    machine: '#f2c200',
    machineDark: '#c99a00',
    workerVest: '#ffd400',
    workerVestDark: '#d9b400',
  },

  NAMES: {
    tubo: 'Tubos',
    tampao: 'Tampões',
    cone: 'Cones',
    placa: 'Placas',
    escora: 'Escoram.',
  },
};
