# Honey Troop — notas de design (fonte para a documentação)

Este arquivo descreve o que está **implementado** em `index.html`. Os números vêm das tabelas no topo do `<script>` (entre `DATA-START` e `DATA-END`) e das funções de fórmula logo abaixo. Se o código mudar, atualize aqui.

## Conceito
- Jogo de navegador de **uma sessão**: o estado vive só na memória da aba. Fechou, perdeu. Sem contas, sem servidor, sem localStorage.
- Inspirado em Dragon City, mas com tempos curtos (ovos de 8 a 40s, colheitas de 5 a 90s) para caber em 10 ou 20 minutos.
- **Motivo para acabar:** a Vespa Rainha está a caminho e ataca quando o relógio zera. Aí começa a **Invasão Final**, uma batalha obrigatória contra ela. O resultado decide o final da história e pesa na pontuação.
- Ao fim, tela de placar com nota (S/A/B/C/D), texto do final, pontuação detalhada, conquistas da partida e todas as estatísticas.

## Modos de partida
| Modo | Vespa Rainha desperta em | Vespa Rainha na Invasão Final | Observação |
|---|---|---|---|
| Rápida | 10 min | 1.200 de vida, 48 de ataque | Faixas de nota e pontos da Invasão valem 50% |
| Padrão | 20 min | 2.400 de vida, 70 de ataque | Referência de balanceamento |
| Longa | 30 min | 3.600 de vida, 88 de ataque | Faixas de nota e pontos da Invasão valem 150% |
| Infinito | a cada 15 min | 1.800 de vida e 60 de ataque na 1ª invasão, x1,35 a cada invasão seguinte | Acaba na primeira invasão perdida |

Peso do modo (`modeFactor`): duração/20 min; no Infinito, tempo jogado/20 min (mínimo 0,5).

### Modo Infinito
- A Vespa Rainha invade aos 15:00, 30:00, 45:00… O relógio mostra o tempo até a próxima invasão e o número da onda.
- Vencer uma invasão: +3.000 × número da onda em mel, +20 geleia real, +300 XP, e a ilha volta a funcionar normalmente. A próxima invasão fica 35% mais forte.
- Perder uma invasão encerra a partida.
- Pontos da Invasão no Infinito: 12.000 por invasão vencida + 3.000 por invasão vencida sem perder abelhas + 6.000 × fração de dano na invasão perdida.

### Invasão Final
- Avisos de tremor faltando 5 min, 2 min, 1 min e 30s.
- No zero, o relógio para, a produção para, eventos acabam e abre o anúncio "A Vespa Rainha chegou!". O jogador escolhe até 3 abelhas na Arena e clica em "Defender a colmeia".
- A Vespa Rainha ataca com elemento aleatório a cada turno, é neutro na defesa (sem fraquezas) e usa o Ferroada Real (poder 2,0) com recarga de 3 turnos.
- Se o jogador venceu o **Vespa Rainha adormecida** na Arena (liberado após a liga Campeões) depois da última invasão, a próxima invasão começa com 30% menos vida. O efeito é consumido quando a invasão começa.
- Vitória: final "A colmeia resistiu". Derrota: final "A Vespa Rainha tomou a ilha", mostrando a % de dano causada. Desistir conta como derrota. Encerrar antes do despertar dá o final "ilha sem defesa".

O jogo **pausa sozinho** quando a aba fica oculta. Botão Pausar e tecla `P` também pausam. "Encerrar" pede confirmação na própria tela.

## Cada partida é única (roguelite)
- **Prado sorteado:** no início, 3 tipos básicos (Fogo, Água, Flor, Deserto, Elétrica, Gelo) nascem no prado. Eles ficam liberados no nível 1 e produzem **+25% de mel** (`MEADOW_GOLD`). Uma das flores é a **flor nativa** e dá **+50% de néctar** (`NATIVE_FLOWER`). A abelha inicial é uma nativa sorteada. Os outros tipos básicos liberam nos níveis 2, 3 e 4. Veneno libera no 6, Sombra e Luz no 8. A ilha mostra flores silvestres nas cores do prado.
- **Rainha:** antes do relógio começar, o jogador escolhe 1 entre 3 rainhas sorteadas. Cada uma tem uma vantagem e um defeito:

| Rainha | Vantagem | Defeito |
|---|---|---|
| Ardente | +30% de ataque | −15% de mel |
| Doceira | +35% de mel | ovos 25% mais lentos |
| Jardineira | +50% de néctar | mercado 20% mais caro |
| Fértil | ovos 40% mais rápidos | −15% de vida |
| Sortuda | dobro de chance de Lendária | cruzar custa 50% mais |
| Guerreira | +25% de vida | −25% de néctar |
| Sábia | +40% de experiência | começa com metade do mel |
| Mercadora | mercado 20% mais barato | alimentar custa 25% mais |
| Real | +3 de geleia real por nível | −10% de mel |

- **Relíquias:** a cada **150 s** de jogo (`RELIC_EVERY`, sem batalha aberta) o relógio para e o jogador escolhe 1 entre 3 relíquias. Os efeitos multiplicam ou somam e valem até o fim da partida. As 15 relíquias: Favo Dourado (+20% de mel), Pólen Mágico (flores 25% mais rápidas), Néctar Concentrado (+30% de néctar), Ninho Quentinho (ovos 25% mais rápidos), Ferrão Afiado (+15% de ataque), Cera Resistente (+15% de vida), Mel de Lavanda (cura 6% da vida por turno), Olho Composto (+8% de crítico), Ferrão Elemental (vantagem de tipo x1,8, uma vez só), Bênção da Tropa (+25% de XP), Feromônio (cruzar 30% mais barato), Moeda de Cera (mercado 15% mais barato), Pote de Mel (90 s de produção na hora, mínimo 500), Geleia Fresca (+15 de geleia real) e Ovo da Tropa (ovo Raro ou Épico na chocadeira).
- Tudo isso vive em `S.mods` (padrão em `MODS0`) e é lido por `MOD(k)`. A tela final mostra a rainha, o prado e o número de relíquias.

## Recursos
- **Mel (🪙)**: produzido pelas abelhas dentro das colmeias; precisa ser coletado com clique.
- **Néctar (🍖)**: colhido nos canteiros de flores; usada para subir o nível das abelhas.
- **Geleia real (💎)**: vem de subir de nível, arena, missões, conquistas e do Mercador. Serve para acelerar ovos, trocar por mel e comprar Ovo Misterioso.
- **XP / Nível do jogador** (máx. 30): XP necessário para passar do nível `l` = `round(40 · l^1,6)`. Cada nível dá `2 + floor(nível/5)` geleia real.

Início: 250 mel, 30 néctar, 5 geleia real, 1 abelha nativa do prado nv1 (sorteada), 1 colmeia, 2 canteiros de flores, 1 espaço de chocadeira.

## Elementos (9)
| Elemento | Nível p/ comprar | Preço | Forte contra (x1,5) |
|---|---|---|---|
| 🔥 Fogo | 1 | 100 | Flor, Gelo, Veneno |
| 💧 Água | 1 | 150 | Fogo, Deserto |
| 🌿 Flor | 1 | 150 | Água, Deserto |
| 🪨 Deserto | 2 | 250 | Elétrica, Fogo, Veneno |
| ⚡ Elétrica | 3 | 600 | Água, Veneno |
| ❄️ Gelo | 4 | 900 | Flor, Deserto |
| ⚙️ Veneno | 6 | 2.500 | Gelo, Luz |
| 🌑 Sombra | 8 | 6.000 | Luz, Elétrica |
| ✨ Luz | 8 | 6.000 | Sombra, Gelo |

Se o defensor é forte contra o elemento do golpe, o dano é x0,7. Com dois elementos no defensor, os multiplicadores se multiplicam.

## Espécies e raridade (50 no Abelhário)
- **Puras (9)**: um elemento. Comum, exceto Veneno/Sombra/Luz, que são Raras.
- **Híbridas (36)**: dois elementos. Nome = prefixo do 1º + sufixo do 2º (ex.: Fogo+Água = *Piromaris*). Rara; Épica se tiver Veneno, Sombra ou Luz.
- **Lendárias (5)**, por receita: se os elementos dos dois pais juntos contêm a receita, há chance de lendária.

| Lendária | Receita | Chance |
|---|---|---|
| Eclipse | Luz + Sombra | 25% |
| Aurora | Gelo + Luz | 20% |
| Escorpiona | Deserto + Veneno | 18% |
| Tempestade | Água + Elétrica | 15% |
| Vulcana | Fogo + Deserto | 12% |

| Raridade | Mel/s base | Vida base | Ataque base | Tempo de ovo |
|---|---|---|---|---|
| Comum | 1 | 100 | 20 | 8s |
| Rara | 2,5 | 125 | 25 | 15s |
| Épica | 6 | 160 | 33 | 25s |
| Lendária | 15 | 230 | 46 | 40s |

## Fórmulas das abelhas (nível 1 a 15)
- Mel/s = base · (1 + 0,4 · (nível − 1))
- Vida = base · (1 + 0,2 · (nível − 1))
- Ataque = base · (1 + 0,16 · (nível − 1))
- Poder (para ordenar o time) = vida/4 + ataque·2
- Alimentar do nível `n` para `n+1` custa `round(10 · 1,5^(n−1))` de néctar
- Vender rende `25 · valorRaridade · nível` (valor: Comum 1, Raro 2, Épico 3, Lendário 5). Pede confirmação com um segundo clique.

## Ilha
- **Colmeia**: 3 abelhas cada. Acumula até 60s da produção das suas abelhas (mínimo 50). Clique para coletar. Custo do próximo: `150 · 2,1^(habitats − 1)`.
- **Coletar tudo**: libera no nível 5 (tecla `C`).
- **Canteiros de flores**: custo `100 · 1,8^(fazendas − 2)`.

| Plantação | Tempo | Néctar | Custo | Nível |
|---|---|---|---|---|
| 🌾 Margarida | 5s | 12 | 10 | 1 |
| 🌽 Girassol | 20s | 60 | 40 | 2 |
| 🎃 Rosa | 45s | 180 | 120 | 4 |
| 🍇 Lótus | 90s | 520 | 350 | 7 |

- **Colher e replantar tudo**: libera no nível 3.
- **Chocadeira**: 1 espaço inicial; compra do 2º, 3º e 4º por 300 / 1.500 / 6.000. Ovo pronto precisa de vaga na colmeia para chocar. Acelerar custa `ceil(segundos restantes / 8)` geleia real.

## Cruzamento
- Os dois pais precisam de **nível 3+**. Custo: `30 · (valorRaridadeA + valorRaridadeB)` de mel.
- A larva herda um elemento sorteado de cada pai. A tela mostra as probabilidades de cada resultado antes de cruzar.
- Ordem do sorteio: primeiro cada receita lendária aplicável, em sequência; o restante é dividido igualmente entre as combinações de elementos.

## Arena
- 8 ligas: Bronze, Prata, Mel, Platina, Diamante, Mestre, Grão-Mestre, Campeões. 3 lutas por liga.
- Oponentes: quantidade `min(3, ceil((liga + luta)/2))`, nível `1 + (liga−1)·2 + luta` (máx. 15), stats x0,95. Raridades por liga: Bronze C; Prata C/R; Mel R/C; Platina R/E; Diamante E/R; Mestre E/R; Grão-Mestre E/L; Campeões L/E.
- Time de até 3 abelhas (padrão: as 3 mais fortes). Todas começam com vida cheia.
- Turnos: você ataca primeiro, depois o oponente. Ataque = elemento principal, poder 1,0. Especial = segundo elemento (ou o principal), poder 1,7 (2,0 em Lendários), recarga de 3 turnos.
- Dano = ataque · poder · vantagem · (1,5 se crítico, chance 12%) · aleatório 0,9–1,1.
- **Batalha automática** escolhe o melhor golpe a cada 0,6s.
- Vitória: mel `90 · liga^1,9 · (1 + 0,5·luta)`, geleia real = liga, XP `15·liga + 5·luta`. Derrota: 5 XP, sem perda.
- **Vespa Rainha adormecida**: após vencer Campeões, luta opcional contra a Vespa Rainha com 80% da vida e do ataque da Invasão Final do modo. Vitória: 8.000 mel (4.000 no Rápido), 30 geleia real, 400 XP e, na primeira vez, deixa a Vespa Rainha com 30% menos vida na Invasão Final. Pode ser repetido, mas o enfraquecimento não acumula.

## Missões
3 ativas. As iniciais são tutoriais (coletar 1x, colher 2x, alimentar 2x). Depois sorteadas entre: ganhar mel, colher néctar, chocar ovos, vencer batalhas, alimentar, cruzar, colher, coletar. Meta e recompensa crescem com o nível do jogador (mel `80 · 1,45^(nível−1)`, 1–3 geleia real, XP `20 + 8·nível`).

## Eventos (a cada 60–100s, o primeiro aos 50s)
| Evento | Efeito | Duração |
|---|---|---|
| 🌧️ Chuva de Mel | mel das colmeias x2 | 30s |
| 🌻 Colheita Farta | canteiros de flores x3 mais rápidas | 30s |
| 🥚 Ovo Perdido | ovo Raro/Épico flutua na tela; clicar coloca na chocadeira sem ocupar vaga | 10s |
| 🐲 Abelha Selvagem | luta especial na Arena com recompensa x3 | 45s |
| 🧳 Mercador Viajante | 10 geleia real por `400 · nível` de mel | 30s |

## Loja
"Mercado da Ilha", com três abas:
- **Abelhas:** os 9 abelhas puros, em vitrines com pódio, faixa de raridade, mel/s, vida e ataque de nível 1, "forte contra" e selo NOVO! para espécie ainda não descoberta. Bloqueados aparecem escuros com cadeado e o nível. **Oferta do momento:** uma abelha desbloqueado custa 25% menos; troca a cada 90 s de jogo (`floor(t/90)` pela lista de elementos liberados).
- **Construções:** colmeia, canteiro e favo na chocadeira, com quantos você tem.
- **Tesouros:** Mercador Viajante (quando o evento está ativo, com selo "!" na aba), Ovo misterioso (20 geleia real → Épico garantido, chance de Lendário), **Nuvem de Mel** (12 geleia real → mel das colmeias em dobro por 45 s, o mesmo efeito do evento Chuva de Mel, e soma tempo se já estiver ativo), **Adubo Mágico** (8 geleia real → canteiros de flores 3x mais rápidas por 45 s, o mesmo efeito da Colheita Farta) e Saco de mel (5 geleia real → `150·nível + 30s de produção`).

## Conquistas (65, em 9 categorias)
Cada uma dá geleia real ao desbloquear (1 a 20). Lista completa com condições está no array `ACH` em `index.html`. Categorias: Primeiros passos (7), Riqueza (9), Coleção (11), Evolução (6), Canteiro (4), Arena (12), Ilha (7), Jogador (6), Invasão (3). Destaques: *Guardião da ilha* (vencer a Invasão Final), *Ilha intocável* (vencer sem perder abelhas), *Cicatriz na Vespa Rainha* (tirar 50% da vida dele), *Golpe no sono* (vencer a Vespa Rainha adormecida), *Enciclopédia viva* (40 espécies), *Relâmpago* (nível 5 em 5 min), *Sorte de principiante* (Lendário em 10 min), *Arco-íris elemental* (9 elementos ao mesmo tempo).

## Estatísticas rastreadas
Aba Estatísticas (e tela final): gráfico de mel acumulado e mel/s ao longo da partida, abelhas por elemento e tabelas em 7 grupos: Geral (tempo, modo, nível, XP, cliques, cliques/min, pontuação), Economia (mel ganho/gasto, média por minuto, mel/s atual e pico, coletas, maior coleta, geleia real), Canteiro, Abelhas (inclusive obtidos por raridade e poder total), Cruzamento (inclusive tempo do primeiro Lendário), Arena (liga, vitórias, derrotas, taxa, sequências, dano, maior golpe, críticos, super eficazes, nocautes, vitórias perfeitas, selvagens, chefe) e Progresso.

## Pontuação e nota
Pontos = mel ganho/10 + Σ abelhas (100·valorRaridade + 15·nível) + 150 por espécie + 250 por conquista + Arena ((liga−1)·600 + 200 por luta da liga atual + 40 por vitória) + 2.000 se venceu a Vespa Rainha adormecida + **Invasão Final** + 200 por nível do jogador + 100 por missão.

Invasão Final (Padrão; metade no Rápido): vitória = 12.000 (+3.000 sem perder abelhas); derrota = 6.000 × fração da vida da Vespa Rainha removida; sem invasão = 0.

Nota no modo Padrão: S ≥ 60.000 · A ≥ 35.000 · B ≥ 18.000 · C ≥ 8.000 · D abaixo. No modo Rápido as faixas valem metade.

## Controles
Clique/toque em tudo. Teclas: `1`–`9` abrem os painéis do dock (1 = Ilha), `Esc` fecha o painel, `P` pausa, `C` coleta tudo (nível 5+), `M` liga/desliga o som, `Tab` + `Enter` ativam as construções do mapa.

## Interface (visão isométrica, estilo Dragon City)
- A tela principal é a **ilha em visão isométrica**: um mapa SVG de 14×14 lotes em losango (proporção 2:1), com mar animado, ondas, nuvens passando, praia, penhasco de terra, caminhos e árvores.
- **Construções clicáveis:**
  - **Colmeias** (até 10 lotes): mostram até 3 abelhas passeando. O balão de moeda mostra o mel acumulado e pulsa quando está cheio. Clique para coletar. O próximo lote livre aparece tracejado, com o preço para comprar.
  - **Canteiros de flores** (até 12 lotes, numa fileira na beira da ilha): terra arada, broto que cresce com o progresso, barra de progresso e a planta com o balão ✋ quando pronta. O próximo lote livre aparece tracejado.
  - **Mural de Missões**: tem balão com o número de missões prontas para resgatar.
  - **Jardim do Amor** (cruzamento): coração pulsando.
  - **Chocadeira**: mostra os ovos na frente, coloridos pela raridade, e um balão 🐣 quando algum está pronto.
  - **Mercado** (loja).
  - **Arena**: coliseu com bandeiras. Mostra balão 🐲 quando há Abelha Selvagem, ⚔️ quando há batalha em andamento e ☠️ quando a Vespa Rainha desperta.
- Os 2 abelhas mais raros voam em volta da ilha (com 6+ abelhas; 1 com 3 a 5 abelhas).
- Rótulos e balões ficam numa camada acima de tudo. As construções são desenhadas em ordem de profundidade (x+y).
- **HUD sobre o mapa:** escolha da semente; botões Colher e replantar (nível 3+) e Coletar tudo (nível 5+).
- **Barra inferior (dock):** Ilha, Abelhas, Cruzar, Chocadeira, Arena, Missões, Loja, Conquistas, Estatísticas, com selos de contagem na Chocadeira e nas Missões. Cada item, ou um clique na construção, abre um **painel** sobre a ilha. No celular, o painel sobe de baixo. Fecha com ✕, com clique fora ou com Esc.
- **Celular:** o mapa mantém 920px de largura e rola de lado dentro da própria área, começando centralizado.

### Ícones (v6)
- Nenhum emoji aparece na interface: todos viraram ícones de jogo em SVG (game-icons.net, CC BY 3.0, recoloridos com degradê e contorno escuro), num sprite embutido no `index.html`. A função `iconize()` troca os emojis de todo HTML gerado (inclusive os textos do mapa) e um observador cobre o que entra por outros caminhos (controles de som, números flutuantes). Créditos dos autores em `CREDITOS.md`.

### Chão da ilha (v6)
- Grama em ladrilhos com variação de tom, manchas claras e escuras, tufos de grama, florzinhas de várias cores, pedrinhas e trevos; caminhos de pedra com meio-fio; borda de grama caindo sobre o penhasco. Tudo vira uma única imagem gerada uma vez (o mapa continua leve).
- **Lavoura:** faixa de terra arada com sulcos e cerca de madeira na beira da ilha, onde ficam os canteiros de flores. Cada canteiro é um canteiro elevado com 4 plantas desenhadas por cultura (margarida, girassol, rosa, fruta-abelha), que crescem com o progresso e mudam de cor quando maduras.

### Visual da interface (estilo jogo, v5)
- **Botões grossos** com borda escura, brilho em cima e um "degrau" embaixo que afunda ao clicar. Cores por função: laranja (ação principal), verde (Chocar, Cruzar), azul (geleia real), vermelho (Desistir, Encerrar, Fechar), roxo-pedra (o resto). Texto na fonte Lilita One.
- **Barra superior** com cápsulas de recurso (ícone numa moeda redonda), estrela de nível, relógio vermelho da Vespa Rainha. **Doca** com botões redondos em relevo; o menu aberto sobe e fica laranja; selos vermelhos com contorno branco.
- **Janelas de menu** com moldura dourada e faixa de título na cor do menu (Abelhas roxo, Cruzar rosa, Chocadeira madeira, Arena vermelho, Missões marrom, Loja verde, Conquistas dourado, Estatísticas azul) e botão ✕ redondo.
- **Fundo único por menu** (cenários em SVG embutido): Abelhas = santuário nas montanhas ao entardecer; Cruzar = jardim rosa com corações; Chocadeira = celeiro de madeira com lâmpadas e palha; Missões = quadro de cortiça; Loja = toldo listrado e balcão; Conquistas = salão de troféus; Estatísticas = planta azul quadriculada. Tela inicial e placar usam o santuário.
- **Arena com um cenário por liga:** Bronze deserto, Prata neve, Mel campo dourado, Platina verde-água, Diamante cristais, Mestre noite roxa, Grão-Mestre vulcão, Campeões aurora; a Invasão Final e a Vespa Rainha adormecida têm um céu de tempestade com raios. Todos com arquibancada, torcida e bandeiras.
- **Arena (fora da luta):** faixa com a liga atual, o time em pódios (vagas vazias aparecem) e um botão grande "Lutar!". Escada de ligas em escudos com a cor de cada liga.
- **Batalha:** placas com nome e barra de vida com o número dentro, abelhas em pódios, selo "VS" no meio, controles e registro em caixas escuras sobre o cenário.
- **Chocadeira:** cada ovo é um desenho com as cores dos elementos da espécie, deitado num favo de palha dentro de um caixote de madeira; brilha e balança quando está pronto. Mostra os segundos restantes. Vagas livres aparecem como favos vazios.

## Visual das abelhas
- **Modelos 3D próprios** em three.js (objeto `M3`), um formato de corpo por raridade, todos fofos, com olhos grandes, antenas, asas translúcidas e abdômen listrado:
  - **Comum, Operária:** abelha gordinha e redonda.
  - **Rara, Guardiã:** carrega um escudo hexagonal de favo.
  - **Épica, Guerreira:** elmo e lança.
  - **Lendária, Soberana:** coroa e gola real.
  - **Chefe, Vespa Rainha:** vespa preta e laranja com cintura fina, ferrão e coroa.
- Listras e corpo nas cores do 1º e do 2º tipo. Enfeites por tipo: flor na ponta para Flor, gota de veneno para Veneno, bolhas verdes nas costas para Veneno, auréola para Luz.
- Cada espécie vira uma tira de 8 quadros (240×200 px) com asas batendo e o corpo flutuando. A troca de quadros usa SMIL, com fase própria por abelha. Enquanto o sprite não fica pronto, aparece um brilho pulsando.
- **Construções:** as mesmas do jogo base, renderizadas como sprites isométricos. Cada colmeia tem uma colmeia de palha e um tema por tipo (por exemplo, dunas e cacto no Deserto, poça de veneno e cogumelos no Veneno). As bases são hexagonais com borda de cera.

### Reserva em SVG (sem WebGL)
- A função `dragonSVG` desenha uma abelha simples (ou a vespa, para a chefe) quando o navegador não tem WebGL.
- **Batalha:** o atacante dá uma investida, um projétil com o emoji do elemento voa até o alvo, o alvo pisca e treme, e o dano sobe em número (verde se super eficaz, dourado se crítico). O oponente aparece espelhado; a Vespa Rainha aparece em tamanho maior.
- **Nascimento:** espécie nova ou raridade Épica ou Lendária abre uma tela de revelação com a abelha surgindo.
- Abelhário: espécies não descobertas aparecem como silhueta.
- **Ilha:** um hexágono, como um favo, com padrão de alvéolos bem leve no chão, flores silvestres nas cores do prado, penhascos de cera nas três faces de baixo e um mar de mel âmbar (escuro na borda, para não ficar amarelo demais), com brilho e espuma.
- **Correção:** as abelhas dentro do mapa são `<svg>` aninhados e recebem `width`/`height` também como atributos, além do CSS. Sem isso, alguns navegadores mostravam uma abelha gigante flutuando no canto.

## Lore e cutscenes
- História completa em `lore/HISTORIA.md` (Ilha Favo, a Primeira Flor, a Tropa do Mel, a Vespa Rainha e o Ninho de Papel). O módulo `lore/cutscene.js` está copiado no `index.html` entre `CUTSCENE-START`/`CUTSCENE-END`.
- Cenas: **abertura** (ao começar a partida), **despertar** (quando a Vespa Rainha chega; no Infinito, `despertarOnda` a partir da 2ª invasão), **ondaVencida** (ao fechar uma invasão vencida no Infinito), **sonho** (na primeira vez que se ataca a Vespa Rainha adormecida; o botão da Arena agora diz "Entrar no sonho da Vespa Rainha") e os finais **vitoria**, **derrota** e **semDefesa** (antes do placar).
- O relógio fica parado durante as cenas. Clique, Espaço, Enter ou → avançam; Esc ou "Pular" encerram.

## Sons e música
- Tudo é sintetizado com a Web Audio API (`audio/audio.js`, objeto global `Som`), sem arquivos de áudio. O conteúdo de `audio.js` está **embutido** no `index.html`, entre os comentários `AUDIO-START` e `AUDIO-END`. Para atualizar o áudio, substitua esse trecho pela versão nova do arquivo.
- O som liga no primeiro clique ou tecla (regra dos navegadores). Há um botão de mudo com volumes no canto superior direito do mapa, e a tecla `M` também liga/desliga. O som pausa junto com o jogo e quando a aba fica oculta.
- **Músicas:** `ilha` (partida normal; fica mais tensa com `Som.tensao` nos avisos de tremor), `batalha` (lutas na Arena), `invasao` (Invasão Final) e `placar` (tela final). As trocas são feitas com fade.
- **Efeitos ligados no jogo:**
  - Interface: clique, troca de aba e erro (todo aviso vermelho).
  - Economia: coletar (mais moedas quanto maior a coleta), coletar tudo, plantar, colher, colher tudo, comprar, vender, geleia real (Mercador).
  - Progresso: alimentar e nível da abelha, nível do jogador, conquista e missão.
  - Ovos: ovo colocado, ovo pronto, chocar, e revelação por raridade na tela de espécie nova, Épico ou Lendário.
  - Cruzamento.
  - Batalha: início, ataque e especial por elemento, Ferroada Real, acerto, crítico, super eficaz, pouco eficaz, nocaute, vitória e derrota. Os sons de golpe seguem a animação: o lançamento sai junto com o projétil, e o impacto toca quando ele chega.
  - Eventos: um som próprio para cada evento, mais ovo pego.
  - Vespa Rainha: tremor com intensidade crescente aos 5 min, 2 min, 1 min e 30 s, despertar, e o final de vitória ou de derrota.

## Arquitetura técnica
- Um único `index.html` com HTML, CSS e JavaScript puro, sem dependências nem build. Fontes do Google Fonts (com fallback).
- Laço de jogo a cada 250ms (`tick`), tempo real com `dt` limitado a 2s.
- Interface gerada como strings de HTML e aplicada com um "morph" próprio (`morph`/`patchNode`), que só altera os nós e atributos que mudaram. Isso mantém as animações das abelhas rodando sem reiniciar a cada quadro. Ações via atributos `data-a` com um único ouvinte: mouse age no `pointerdown` (para não perder cliques durante a re-renderização), toque age no `pointerup` sem arrasto (para não disparar ao rolar).
- `window.__game` expõe o estado e as ações para testes automatizados.
