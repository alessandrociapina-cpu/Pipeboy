# 🦺 Pipeboy — Documento de Conceito

> Um jogo de ação *side-scroller* (rolagem lateral) inspirado em clássicos como
> **Double Dragon** e **Pitfall**, mas ambientado no universo das obras de
> saneamento urbano.

---

## 1. Pitch

Você é **George Sanear**, um engenheiro de saneamento raiz: capacete azul,
colete laranja fluorescente e disposição para encarar qualquer vala. Sua missão
é atravessar a cidade levando **tubos de água**, **tampões de esgoto**, **cones**,
**placas de sinalização** e **escoramentos** até as obras de remanejamento e
manutenção de rede — antes que o caos tome conta.

No caminho, George precisa:
- **Resgatar funcionários perdidos** e escoltá-los até a obra;
- **Enfrentar os monstros de fezes e gordura** que emergem das valas de esgoto;
- E, acima de tudo, **fugir e sobreviver ao maior vilão de todos: Regis Guarione**,
  o empreiteiro terceirizado da **RG Saneamento**, que chega bagunçando tudo e
  sequestrando as equipes para levá-las a outras obras.

---

## 2. Personagens

### Herói
| Nome | Descrição |
|------|-----------|
| **George Sanear** | Engenheiro de saneamento. Capacete azul, colete laranja fluorescente, botas de segurança. Corajoso, incansável e apaixonado por rede de água bem executada. |

### Vilões
| Nome | Papel | Comportamento |
|------|-------|---------------|
| **Regis Guarione** | Vilão principal | Empreiteiro da RG Saneamento. Chega de caminhonete buzinando, "rouba" os funcionários da obra e some. É rápido, imprevisível e o maior perigo do jogo. |
| **O Chefe** | Mini-chefe | Aparece cobrando produtividade. Persegue George e desconta pontos/tempo. |
| **Monstro de Fezes** | Inimigo comum | Emerge das valas de esgoto. Lento, mas pega em área. |
| **Monstro de Gordura (F.O.G.)** | Inimigo comum | Escorregadio, gruda no chão e atrapalha o movimento. |

### Aliados
| Nome | Papel |
|------|-------|
| **Funcionários perdidos** | Espalhados pela fase. Devem ser escoltados até a obra. Dão bônus. Se Regis chegar antes, ele os leva embora. |

---

## 3. Objetivo do jogo

Cada fase é um trecho da cidade. Ao final (ou em pontos específicos) há uma
**obra com vala aberta** que precisa de materiais. O objetivo é **entregar os
materiais exigidos** e **resgatar os funcionários** antes que:
- a **barra de vida** de George zere; ou
- **Regis Guarione** desmonte a obra levando as equipes.

### Materiais (itens carregáveis)
George carrega **um item por vez** e o entrega na obra:

- 🔵 **Tubo de água** — o material principal da rede.
- ⚫ **Tampão de esgoto** — para as bocas de lobo / poços de visita.
- 🔶 **Cone de sinalização** — sinaliza a área e reduz o perigo do trânsito.
- 🚧 **Placa de sinalização** — idem, protege a frente de serviço.
- 🪵 **Escoramento** — obrigatório para liberar valas **profundas** com segurança.

### Ferramentas (combate / ações)
- ⛏️ **Picareta** e 🪏 **Pá** — ataque corpo a corpo contra os monstros.
- 🐸 **Sapinho (compactador manual)** — golpe de área, compacta o chão.
- 🚜 **Retroescavadeira** e 🛞 **Rolo compressor** — veículos especiais
  (power-ups) que atropelam inimigos e abrem/fecham valas rapidamente.

---

## 4. Mecânicas principais (v1 — protótipo)

- **Movimento lateral** (esquerda/direita) com rolagem de câmera.
- **Pulo** sobre valas e obstáculos.
- **Ataque** com ferramenta equipada.
- **Pegar / soltar** materiais e **entregar** na obra.
- **Barra de vida** e **placar** (pontos por entrega, resgate e combate).
- **Contador de entregas** para concluir a fase.
- **Aparições do Regis Guarione** como ameaça recorrente.

## 5. Roadmap (evolução da ideia)

- [x] **v1 — Protótipo jogável**: George, movimento, pulo, ataque, coleta e
  entrega de tubos, monstros de esgoto, aparição do Regis, vida e placar.
- [ ] **v2 — Fases temáticas**: bairro residencial, avenida movimentada,
  centro histórico; cada uma com materiais exigidos diferentes.
- [ ] **v3 — Escolta de funcionários** com IA de Regis tentando "sequestrar".
- [ ] **v4 — Veículos especiais** (retroescavadeira, rolo compressor).
- [ ] **v5 — Chefões** (O Chefe e Regis Guarione com padrões de ataque).
- [ ] **v6 — Áudio, animações e placar online.**

## 6. Controles

| Ação | Tecla |
|------|-------|
| Mover | ← → (ou A / D) |
| Pular | Espaço / ↑ / W |
| Atacar (ferramenta) | J / Z |
| Pegar / soltar / entregar | K / X |
| Pausar | P |
| Reiniciar | Enter (na tela de fim) |

## 7. Estilo visual

Arte "pixelada" chapada, desenhada **inteiramente via código** (Canvas 2D) —
sem assets externos, para o jogo rodar abrindo o `index.html` direto no
navegador. Paleta forte: azul (capacete), laranja fluorescente (colete),
cinza asfalto, marrom vala, verde-lodo para os monstros.
