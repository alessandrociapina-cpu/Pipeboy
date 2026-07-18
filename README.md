# 🦺 Pipeboy

Um jogo de ação **side-scroller** (estilo *Double Dragon* / *Pitfall*) ambientado
no universo das obras de saneamento. Você controla **George Sanear**, engenheiro
de capacete azul e colete laranja fluorescente, levando **tubos de água** e outros
materiais até as obras com **valas abertas** pela cidade — enquanto enfrenta os
**monstros de esgoto** e foge do vilão maior de todos, o empreiteiro maluco
**Regis Guarione**, da RG Saneamento.

## ▶️ Como jogar

Não precisa instalar nada. Basta abrir o arquivo **`index.html`** no navegador
(Chrome, Firefox, Edge…). É tudo HTML5 + Canvas + JavaScript puro, sem dependências
nem etapa de build, e sem imagens externas — toda a arte é desenhada via código.

> Dica: para desenvolvimento, servir a pasta com um servidor local também funciona
> (`python3 -m http.server`), mas o jogo roda abrindo o `index.html` diretamente.

## 🎮 Controles

| Ação | Tecla |
|------|-------|
| Mover | ← → (ou A / D) |
| Pular | Espaço / ↑ / W |
| Atacar (picareta) | J / Z |
| Pegar / soltar / **entregar** material | K / X |
| Pausar | P |
| Reiniciar (na tela de fim) | Enter |

Em celulares/tablets aparecem botões de toque na tela.

## 🎯 Objetivo

- Pegue os **caixotes de materiais** 📦 espalhados pela fase (tubos, cones, placas,
  tampões, escoramentos).
- Leve os **tubos de água** 🔵 até a **obra com vala aberta** 🚧 no fim do trecho e
  aperte **K** para entregar. Entregue **5 tubos** para concluir a obra.
- **Resgate os funcionários perdidos** 👷 (toque neles) e leve-os até a obra para
  ganhar bônus — mas cuidado: se o **Regis Guarione** 😈 alcançá-los, ele os
  sequestra para outra obra!
- Enfrente os **monstros de fezes e gordura** 💩 com a picareta e sobreviva.

## 🗂️ Estrutura do projeto

```
index.html          # página e canvas
css/style.css       # estilos e HUD
js/config.js        # constantes do jogo
js/sprites.js       # desenho de personagens/itens via Canvas
js/entities.js      # Player, Monster, Worker, Regis, ItemCrate
js/game.js          # motor: loop, colisões, câmera, HUD
js/input.js         # teclado + toque
js/boot.js          # inicialização / requestAnimationFrame
docs/GAME_DESIGN.md # documento de conceito e roadmap
```

Consulte **[docs/GAME_DESIGN.md](docs/GAME_DESIGN.md)** para o conceito completo,
personagens e o roadmap de evolução (fases temáticas, veículos especiais como
retroescavadeira e rolo compressor, chefões, etc.).

---

*Protótipo v1 — inspirado em um colega de trabalho engenheiro de saneamento.*
