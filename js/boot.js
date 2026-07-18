// ===== Pipeboy — Boot / loop principal =====
(function () {
  const canvas = document.getElementById('game');
  const game = new Game(canvas);
  window.PIPEBOY = game; // handle para depuração no console
  Input.init(game);

  document.getElementById('btn-start').addEventListener('click', () => game.start());
  document.getElementById('btn-restart').addEventListener('click', () => game.start());

  function frame() {
    game.update(Input);
    game.draw();
    Input.postFrame();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
