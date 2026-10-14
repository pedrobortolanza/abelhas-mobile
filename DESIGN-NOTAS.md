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

- **Relíquias:** a cada **300 s** de jogo (`RELIC_EVERY`, sem batalha aberta) o relógio para e o jogador escolhe 1 entre 3 relíquias. Os efeitos multiplicam ou somam e valem até o fim da partida. As 15 relíquias: Favo Dourado (+20% de mel), Pólen Mágico (flores 25% mais rápidas), Néctar Concentrado (+30% de néctar), Ninho Quentinho (ovos 25% mais rápidos), Ferrão Afiado (+15% de ataque), Cera Resistente (+15% de vida), Mel de Lavanda (cura 6% da vida por turno), Olho Composto (+8% de crítico), Ferrão Elemental (vantagem de tipo x1,8, uma vez só), Bênção da Tropa (+25% de XP), Feromônio (cruzar 30% mais barato), Moeda de Cera (mercado 15% mais barato), Pote de Mel (90 s de produção na hora, mínimo 500), Geleia Fresca (+15 de geleia real) e Ovo da Tropa (ovo Raro ou Épico na chocadeira).
- Tudo isso vive em `S.mods` (padrão em `MODS0`) e é lido por `MOD(k)`. A tela final mostra a rainha, o prado e o número de relíquias.

## Novidades da v2 (pedidos do Pedro, 12/10/2026)
- **Ilha dentro da colmeia:** o chão virou um piso de favo de cera, com alvéolos cheios de mel, fechados com cera ou com pólen. Ao fundo fica a parede de favos com mel escorrendo do teto. A plataforma flutua numa poça de mel, e os penhascos são de cera com mel pingando. Árvores e pedras viraram potes de mel, colunas de cera, montes de pólen e uma fonte de mel. O Jardim do Amor agora tem três flores gigantes.
- **Jardim (painel dos canteiros):** abre ao tocar num canteiro ou no botão "Jardim". Cada canteiro tem sua própria flor e um nível de 1 a 5 (`FARM_MAX`). Cada nível dá +30% de néctar e +15% de velocidade. O próximo nível custa `150 · 2,3^(nível − 1)` de mel. O seletor de flores saiu do mapa.
- **Abelha Jardineira:** contratada no Jardim a partir do nível 6, por 3.000 de mel. A cada 1,5 s ela colhe um canteiro pronto ou replanta um vazio com a flor escolhida (`GARDENER`).
- **Roleta da BetMel** (Loja › Roleta): 5.000 de mel ou 25 de geleia real por giro. Prêmios: BetMel 3%, Ovo Épico 10%, Ovo Raro 17%, 3.000 de mel 25%, 12 de geleia real 15% e 400 de néctar 30% (`SPIN_PRIZES`). A **BetMel** é uma lendária Elétrica + Luz que só sai na roleta. Ela é dourada, usa óculos escuros e produz o dobro de mel.
- **Ataques** (Loja › Ataques): a abelha escolhida aprende um golpe extra para a batalha e ganha ataque permanente. Cada abelha tem 1 golpe aprendido, e um golpe novo troca o antigo, mas o bônus se soma.

| Golpe | Efeito | Recarga | Bônus de ataque | Preço | Nível mínimo |
|---|---|---|---|---|---|
| Ferroada Tripla | x2,4 do 1º tipo | 4 | +10% | 2.500 de mel | 3 |
| Chuva de Pólen | x1,6 neutro, ignora fraquezas | 2 | +8% | 1.800 de mel | 2 |
| Mel Pegajoso | x1,3 e cura 20% da vida | 3 | +6% | 3.200 de mel | 4 |
| Mergulho Cometa | x3 do 2º tipo, +25% de crítico | 5 | +15% | 30 de geleia real | 6 |

- **Renomear:** botão de etiqueta no card da abelha, até 18 caracteres.
- **Lendárias mais raras no cruzamento:** Eclipse 6%, Aurora 5%, Escorpiona 4%, Tempestade 3,5% e Vulcana 3%. Mesmo com a Rainha Sortuda, a chance de cada receita fica em no máximo 25%.
- **Visual (Loja › Visual):** chapéus (palha, boné, coroa de flores, cartola, coroa dourada) e asas (borboleta, fada, ouro), pagos com geleia real (8 a 18). O visual não muda atributos e aparece em todo o jogo, inclusive na batalha.
- **Correção:** a abelha inicial não aparecia como descoberta no Abelhário.

## Ajustes da v2.1 (12/10/2026)
- **Vila da colmeia:** o chão virou cera lisa, sem o desenho de alvéolos. No meio fica uma praça com a fonte de mel, de onde saem caminhos curvos. As construções ficam num arco no fundo: Arena no topo, Mercado e Chocadeira dos lados, Mural de Missões e Jardim do Amor nas pontas. São até 9 colmeias, dos dois lados e embaixo da praça. O jardim fica na frente, um canteiro de terra com borda de cera e 12 vagas em 2 fileiras. Enfeites: poças de mel, potes, colunas de cera e flores do prado.
- **Relíquias:** agora a cada 300 s (antes, 150 s).

## Novidades da v6.4 a v6.7: polimento visual (12/10/2026), um commit por parte para dar para reverter
- Interface no estilo mel (commits d206caa e b158fbf): barras e janelas de favo dourado com mel escorrendo, botões de mel brilhante, tela inicial com névoa dourada.
- Efeitos e sons (3aca559): gotas de mel voando até o pote, estrelinhas em compras/níveis, brilho de "Nível X!", pólen no ar, números saltando, sons gota e zumbido.
- Batalha na Arena (0595bae): palco de favo com torcida e bandeiras, abelhas grandes em pedestais de mel, golpes em bola do elemento, anel de impacto, tremor no crítico.
- Construções: castelo com telhados de mel (atlas repintado em honeyAtlas), mercado com 3 barracas listradas, mural de madeira com bilhetes e favo.

## Novidades da v6.3: abelhas no estilo fofinho (12/10/2026)
- Referências do Pedro: abelhas/referencias/abelha-ref-amarela.png e abelha-ref-rosa.png.
- Cabeça grande e redonda virada para a frente, olhos enormes escuros com brilhos e a cor do elemento embaixo (beeEye), bochechas rosadas, sorriso com linguinha e topetinho.
- Antenas curtas e grossinhas, perninhas gordinhas, asas maiores e mais claras.
- Sombreado de desenho em 4 tons (toonBee) e contorno escuro.

## Novidades da v6.2: ilha igual à segunda referência do Pedro (12/10/2026)
- Referência principal: abelhas/referencias/ilha-referencia-pedro-2.png (a mesma ilha do jogo, pintada).
- Visual de desenho: sombra em 3 tons chapados (MeshToon) e contorno escuro também nos modelos prontos.
- Chão de favo marrom escuro com bordas douradas; rios de mel com brilho; caminhos de pedra creme até Arena, Mercado, Roleta e canteiro.
- Grama e florzinhas pintadas ao longo da borda; velas, moitas, girassóis e colmeias refeitos.
- Borda de mel grosso escorrendo pelo paredão de favo dourado (InstancedMesh, leve no celular).
- Sem mar e sem pontes: a ilha flutua sobre uma névoa dourada com bolhas de luz (goldHaze()).

## Novidades da v6.1: ilha no estilo da referência do Pedro (12/10/2026)
- Chão de favo dourado com rios de mel brilhantes (roughnessMap deixa o mel lustroso) e poças nas pontas.
- Praça creme com chafariz no centro; canteiro da fazenda com moldura de mel.
- Paredão de favo fundo nas bordas, com 4 colmeias (skep) e 2 pontes de madeira.
- Borda verde: moitas, girassóis, flores e arbustos (w3Edge), sem invadir construções nem a fazenda.
- Arena sobre um morro de pedras com mel escorrendo; 9 abelhinhas voando pela ilha.
- Construções e roleta sem mudança. Referência: abelhas/referencias/ilha-referencia-pedro.png.

## Novidades da v6: ilha em 3D de verdade (12/10/2026)

- A ilha agora é uma cena 3D em tempo real (three.js), com a mesma câmera isométrica de antes. Ela fica numa tela WebGL atrás do SVG; o SVG ficou só com as áreas de clique, os balões, os nomes e as abelhas.
- Chão novo e mais limpo: âmbar escuro com favo bem leve, caminhos de pedrinha, praça clara e canteiro do jardim, tudo pintado numa textura. Borda de cera em relevo, paredão de favo e mar de mel animado.
- As construções são os mesmos modelos de antes, agora com luz e sombra reais. A roda da Roleta do Enxame gira na ilha durante o giro.
- Só 13 enfeites, bem espaçados (fonte, velas, lampiões, colmeias de palha, potes, girassóis e flores). Sumiram os tufos espalhados.
- Sem WebGL, ou com `window.__no3d = true`, o mapa antigo em SVG volta sozinho. A sombra só é recalculada quando algo muda na ilha, para pesar menos no celular.

## Novidades da v5.1: carrossel, roleta 3D, ilha e tesouros (12/10/2026)

- A Roleta do Enxame virou um carrossel no estilo de caixa: passam abelhas de verdade, com a cor da raridade embaixo. Só aparece o nome e o desenho das espécies que você já tem; as outras passam como silhueta "???". Cada giro dura 5,2 s, com um tique por abelha que passa; às vezes uma mais rara para do lado. O Giro do Amor usa o mesmo carrossel com os filhotes possíveis do casal.
- No mapa, a Roleta do Enxame é uma barraca 3D com roda colorida, luzes, letreiro e fichas.
- A ilha ganhou enfeites 3D (potes de mel, velas de cera acesas, girassóis, colmeias de palha, lampiões, favos, flores, cargas, pedras, fonte de mel maior) e cerca de 48 tufos, flores e gotas de mel espalhados onde não há lote nem caminho.
- Loja > Tesouros: Pacote de Fichas (💎15, 3 fichas), Trevo da Sorte (💎12, 5 giros com chances C45/R33/E17/L5), Cesta Surpresa (💎10), Ampulheta (💎8, giro grátis na hora), Poção de Treino (💎6, +2 níveis na abelha mais fraca), Estrela do Destaque (💎4) e Néctar do Amor (💎3, acaba o descanso de quem cruzou).

## Novidades da v5: Roleta do Enxame (12/10/2026)

- Ovos e chocadeira saíram. Toda abelha nova vem da **Roleta do Enxame** (aba Roleta e roda no mapa).
- Chances: Comum 62%, Rara 27%, Épica 9%, Lendária 2%. Só saem espécies cujos tipos já foram liberados; nativas do prado têm peso 1,6.
- Preço em mel: `150 × 1,3^(nível−1)` (com o desconto da loja); 10 giros custam 9. Giro Raro+ com geleia real: 20 (ou 180 por 10), sem Comuns.
- Garantia: Épica a cada 10 giros e Lendária a cada 50 (o contador só anda se a raridade já existe no grupo).
- Giro grátis a cada 3 min (rainhas e a relíquia Ninho aceleram). Começa com 3 fichas; fichas vêm da Arena (Duelo, Mistério), do evento Ficha Perdida, da relíquia Bolsa de Fichas e da BetMel.
- Espécie em destaque troca a cada 3 min e tem 50% da sua raridade.
- Repetida: sua abelha da espécie sobe 1/2/3/4 níveis (C/R/E/L); no nível máximo vira mel. Sem vaga nas colmeias, vira mel.
- Cruzar virou o **Giro do Amor**: sorteia na hora entre as espécies que o casal pode gerar, e os pais descansam 45 s.
- Arena: os nós Tesouro e Treino saíram; agora todo nó é batalha: Luta, Elite, Duelo (1 inimigo forte, geleia ×3 e +1 ficha) e Mistério (tipos aleatórios, prêmio surpresa).
- Besouros rivais agora cortam o mel pela metade por 90 s.

## Novidades da v4: partida em 3 atos (12/10/2026)
Pedido do Pedro: deixar o jogo mais longo. O botão Jogar abre o modo `atos` (os outros modos continuam no código, fora do menu).

| Ato | Dura | Chefe | Vida / ataque | Lotes de colmeia / canteiros | Ligas abertas | Vitória rende | Pontos |
|---|---|---|---|---|---|---|---|
| I | 12 min (0 a 12) | General Vespa | 1.300 / 50 | 4 / 6 | até Ouro | 4.000 mel, 20 geleia, 300 XP | 4.000 |
| II | 12 min (12 a 24) | Vespa Rainha | 2.800 / 76 | 7 / 9 | até Mestre | 12.000 mel, 30 geleia, 600 XP | 8.000 |
| III | 12 min (24 a 36) | Imperatriz do Ninho | 4.400 / 98 | 9 / 12 | todas | fim com vitória | 12.000 |

- Vencer o chefe leva ao próximo ato com tudo o que foi construído. Perder encerra a partida, pontuando `50% × pontos do ato × fração da vida tirada`. Cada chefe vencido sem perder abelhas vale +1.500.
- A cada novo ato a **estação muda** (sai o efeito da antiga, entra o da nova) e o caminho da Arena é sorteado de novo.
- Uma **invasão do inimigo** por ato, no meio dele (6, 18 e 30 min), com 2, 3 e 3 inimigos.
- Liga travada pelo ato: a Arena mostra "abre no próximo ato". Comprar colmeia ou canteiro acima do limite avisa que mais lotes abrem no próximo ato.
- A luta no ninho (depois da liga Campeões, só no Ato III) usa o chefe do ato atual com 80% da força.
- Peso do modo (`modeFactor`): fim do ato atual ÷ 20 min (0,6; 1,2; 1,8).
- Cenas: `atoChefe` (despertar do General e da Imperatriz), `despertar` (Vespa Rainha, Ato II) e `atoVencido`. A abertura ganhou uma fala sobre as três ondas (`so: 'atos'`) e o filtro `nao` no roteiro.

## Novidades da v3: partidas únicas (12/10/2026)
- **Só um botão Jogar.** A tela inicial não tem mais escolha de modo. A partida usa o modo Padrão: 20 minutos até a Vespa Rainha. Os outros modos (Rápida, Longa, Infinito) ficam no código, mas não aparecem no menu. Onde a documentação abaixo fala de modos, vale só o Padrão.
- **Estação da partida** (sorteada; aplicada junto com a rainha). Abelhas do tipo da estação ganham +20% de vida e ataque. O chão da vila ganha um véu de cor e detalhes próprios.

| Estação | Tipo forte | Efeito |
|---|---|---|
| 🌻 Primavera | Flor | Néctar +25%, flores 20% mais rápidas; pétalas no chão |
| 🔥 Verão | Fogo | Mel +25%, néctar -20%; luz quente |
| 🌧️ Estação das Chuvas | Água | Chuva de Mel cerca de 2x mais frequente (30% dos eventos são forçados a Chuva), ovos 15% mais lentos; poças |
| ❄️ Inverno | Gelo | Ovos 25% e flores 15% mais lentos, +2 de geleia real por nível; geada |

- **Inimigo da partida** (sorteado). Invade aos 33% e aos 66% do tempo (6:36 e 13:12 na partida de 20 min), com aviso 30 s antes. A invasão espera acabar uma batalha ou relíquia em andamento. Aparece um cartão com **Defender** (abre a batalha) ou **Deixar** (sofre o saque). Sem decisão em 60 s, o saque acontece. Inimigos: 2 na 1ª invasão e 3 na 2ª, dos tipos do rival, nível `2 × liga + nº da invasão` (até 15). Vencer: mel `max(60 s de produção, 400)` + recompensa normal da liga, geleia real `5 + 3 × nº da invasão`, XP em dobro e uma relíquia extra (não atrasa a próxima relíquia normal). Perder ou deixar: o saque.

| Inimigo | Tipos | Particularidade | Saque |
|---|---|---|---|
| 🗡️ Formigas Ladras | Deserto + Veneno | | 30% do mel |
| 🔥 Vespas Batedoras | Fogo + Sombra | | Queimam as flores de todos os canteiros |
| 🛡️ Besouros Blindados | Deserto + Gelo | +40% de vida | Ovos voltam metade do caminho |
| 🔮 Mariposas da Noite | Sombra + Luz | | 50% do néctar |

- **Mutações.** Cada ovo chocado tem 35% de chance de nascer com uma mutação (🧬 no cartão da abelha e na revelação). Sorteio por peso: Gulosa +40% mel (20), Robusta +25% vida (20), Ferrão de Aço +20% ataque (20), Brilhante +15% em tudo (10), Preguiçosa -25% mel e +35% ataque (15), Sortuda +15% de crítico (15). A abelha inicial e as compradas no mercado não têm mutação.
- **Caminho da Arena.** No lugar do botão Lutar, cada etapa da liga oferece 3 caminhos sorteados por peso. Cada etapa concluída avança 1 das 3 da liga. A 3ª etapa de cada liga é sempre Luta ou Elite, e toda escolha tem pelo menos uma luta.

| Caminho | Peso | Efeito |
|---|---|---|
| ⚔️ Luta | 40 | Luta normal da liga |
| ☠️ Elite | 20 | Inimigos +2 níveis e +30% de vida; mel x2, +5 geleia real e uma relíquia extra |
| 💰 Tesouro | 15 | `1,5 × 90 × liga^1,9` de mel e `2 + liga` de geleia real, sem lutar |
| ⬆️ Treino | 15 | Abelhas do time sobem 1 nível |
| 💫 Mistério | 10 | 30% emboscada (luta de Elite), 35% ovo Raro ou Épico, 35% pote de `2,5 × 90 × liga^1,9` de mel |

Perder uma luta mantém os mesmos caminhos. Etapas sem luta também dão `10 × liga` de XP.
- **Chão âmbar escuro (pedido do Pedro):** o chão da vila virou cera marrom escura (`GLOOKS.ambar`), com caminhos e praça claros, para as construções se destacarem. As construções não mudaram. As paletas antigas ficam em `GLOOKS` (`mel`, `creme`) e dá para testar com `window.__look`.
- **Pontuação:** nova linha "Invasões repelidas" = 1.500 por invasão vencida. O placar mostra estação, inimigo, invasões repelidas e mutantes.
- **Estatísticas novas:** `raidsWon`, `raidsLost`, `mutants`, `routeNodes`, `elites`.

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

## v7.1 (13/10/2026): ajustes da partida de teste do Pedro

- Conquista "Nova amiga" (comprar abelha no mercado) saiu: não existe mais compra direta.
- Perder a batalha final de um ato encerra a partida sozinho, 2,6 s depois do resultado.
- Relíquias: cada uma só pode ser pega uma vez (as de prêmio na hora podem repetir). Batalhas (elite, invasão, mistério) dão no máximo 1 relíquia extra por ato; depois disso viram +10 de geleia real ou 2 fichas.
- Inimigos da Arena e das invasões: x1,2 no Ato II e x1,12 no Ato III (as ligas já sobem), e +8% para cada relíquia de combate do jogador (Ferrão Afiado, Cera Resistente, Mel de Lavanda, Olho Composto, Ferrão Elemental).
- Chefes: Vespa Rainha 3300 de vida e 84 de ataque (era 2800/76); Imperatriz do Ninho 5200/102 (era 4400/98). Simulação: 3 Lendárias Nv 12 com 3 relíquias vencem o Ato II em ~60%; Nv 15 com 5 relíquias vencem o Ato III em ~50%.
- Lendárias: vida 195 (era 230), ataque 39 (era 46), mel 12/s (era 15).
- Dicas iniciais: 6 telas depois da escolha da rainha (mel, néctar e jardim, roleta, geleia e cristais, arena e chefes, missões e conquistas), com "Pular dicas". Cada menu mostra uma dica na primeira vez que abre.
- Laboratório (no lugar do Jardim do Amor; a aba Cruzar virou Laboratório e o cruzamento saiu da interface):
  - Cristais 💠: começa com 1; +1 a cada 4 min, +1 ao vencer o chefe no ninho, +2 por ato vencido, 25% de chance nas elites, relíquia Pó de Cristal (+2) e tesouro Cristal Raro (30 de geleia real).
  - Mutação ao acaso (1 cristal), escolhida entre as 6 comuns (3) ou rara (5): Dourada (+30% de mel, vida e ataque) ou Fúria (+45% de ataque, +10% de crítico). A nova troca a antiga.
  - Rainha Sortuda agora: mutações custam 1 cristal a menos, colmeias dão 15% menos mel.
  - Missão de cruzar e as conquistas Casamenteiro/Genética viraram mutações no Laboratório.
- Chefes com modelo próprio (raridade de exibição 'B'): vespas grandes e malvadas. General Vespa com elmo e ombreiras, Vespa Rainha com coroa de espinhos, Imperatriz com coroa de ouro e gola de espinhos. Na batalha aparecem 50% maiores.

## v7.2 (13/10/2026)

- Seleção de texto, menu do botão direito, lupa de toque longo e arrastar imagens travados (CSS user-select/touch-callout e preventDefault em contextmenu, selectstart, dragstart).
- Botão de tela cheia na barra de cima, só em telas de toque: entra e sai da tela cheia (com trava na horizontal). No iPhone, que não tem tela cheia no Safari, o botão explica como "Adicionar à Tela de Início".
- manifest.webmanifest (display fullscreen, horizontal) e ícones icon-192.png, icon-512.png, apple-touch-icon.png: aberto pelo ícone da tela inicial, o jogo fica sem as barras do navegador.

## v7.3 (13/10/2026): fim de jogo com coisas novas

- **Torre da Ascensão** (ponto `torre` no canto de cima à esquerda, aba escondida `torre`). Começa em ruínas e o modelo 3D `B.torre(andares)` cresce um andar por peça. Peças: 🎖️ Insígnia do General (chefe do Ato I), 👑 Coroa de Espinhos (chefe do Ato II), 🏆 Troféu dos Campeões (última liga da Arena, Ato III). Cada andar custa a peça + mel (2.500 / 9.000 / 20.000) e libera 1 ascensão para abelha Épica ou Lendária:
  - Guardiã: +40% de vida; uma vez por batalha aguenta o golpe fatal com 1 de vida.
  - Carrasca: +25% de ataque; dano dobrado em inimigos abaixo de 35% de vida.
  - Sábia: especial 40% mais forte, recarga de 2 turnos e cura 10% da equipe a cada especial.
  - Torre completa: ascendidas +15% de vida e ataque. Dicas no tutorial, na aba, na Arena e na chegada de cada chefe.
- **Crises** (`CRISES`, só no modo atos), do meio do Ato II (t = 1080 s) até o fim, uma a cada 110 a 160 s, nunca a menos de 45 s do chefe. Pausam durante batalhas e relíquias. Resolver dá 4 + 2×ato de geleia real, XP e 20% de chance de cristal.
  - 🔥 Incêndio: 6 toques em 20 s, senão perde as flores dos canteiros.
  - 🦹 Ladras de mel: 8 toques em 15 s, senão perde 12% do mel.
  - 🤒 Rainha doente: néctar (15 + 6×nível) em 40 s, senão mel −40% por 90 s.
  - 🧱 Favo rachado: mel (45 s de produção) em 40 s, senão mel −50% por 120 s.
- **Abelha Necromante**: uma vez, 150 s antes do fim do Ato II, para o relógio e oferece 3 de 5 pactos. Recusar não custa nada, mas ela não volta.
  - Pacto de Sangue: +35% de ataque e −25% de vida.
  - Ouro Maldito: 300 s de mel agora (mínimo 5.000) e −25% de mel até o fim.
  - Sacrifício: a abelha mais forte vai embora e as outras ganham +30% de ataque.
  - Visão do Fim: Imperatriz com −25% de vida; perde toda a geleia real e os cristais.
  - Troca de Almas: 2 abelhas fora do time somem e chega 1 Lendária no nível médio.
- **Veteranas**: cada abelha guarda `st` (lutas, vitórias, nocautes, dano, maior golpe). 5 vitórias = Experiente (+5%), 12 = Veterana (+10% e traço fixo Implacável +8% crítico, Sobrevivente +15% vida ou Feroz +12% ataque), 25 = Heroína da Tropa (+15%).
- **Ficha da abelha**: tocar no ícone na aba Abelhas abre a ficha. Mostra personalidade, flor favorita e sonho (fixos pelo id), números, batalhas, poderes, forças e fraquezas de tipo e a barra até o próximo título.

## v7.4 (13/10/2026): dificuldade moderada

- Nível máximo das abelhas 25, com a mesma força final do antigo 15 (`LV_K = 14/24` no crescimento de mel, vida e ataque). Alimentar custa `10 × 1,255^(nível−1)`, uns 60% a mais no total até o máximo. `oldLv()` converte o nível dos inimigos da escala antiga. Repetidas da roleta: C1/R3/E4/L6. Poção de Treino +3. Conquistas de nível: 8, 16 e 25.
- Batalhas dão 30% menos mel nos atos II e III. O prêmio por vencer o ato não mudou.
- `powerK()`: inimigos comuns e invasões +5% por mutação rara (Dourada ou Fúria) e +8% por abelha ascendida. Os chefes recebem 70% desse aumento.
- Fazendas sem nerf.

## v7.5 (13/10/2026): partida guardada por 10 min

- `saveRun()` grava o estado em `localStorage` (`honeyTroop.save`) a cada 5 s e ao esconder ou fechar a página. O menu mostra "Continuar partida" enquanto o salvo tem menos de 10 min (`SAVE_TTL`).
- `resumeRun()` volta pausada. Giro da roleta e batalha em andamento não voltam.
- Começar uma partida nova ou terminar a partida apaga o salvo.

## v7.6 (13/10/2026): voo das abelhas e venda na roleta

- As 2 abelhas grandes que voavam pela ilha eram cópias das melhores e ficavam em dobro. Agora `flyingBees()` tira no máximo 2 abelhas da colmeia de tempos em tempos (ciclo de 70 s, janelas `FLY_WIN`). Cada uma sai da colmeia, dá uma volta pela ilha (`flyPathFrom`, 26 s) e volta. É só visual: o mel da colmeia não muda.
- O resultado de um giro na roleta tem o botão Vender quando a abelha é nova (não repetida). São dois toques: o primeiro mostra "Confirmar venda" com o valor.

## v7.7 (13/10/2026): ilha em diagonal, maior, e Laboratório fechado no começo

- Construções em diagonal: da praça saem duas avenidas retas (Roleta e Laboratório à direita; Mercado e Mural à esquerda), um caminho reto até a Arena e um ramal do Mercado até a Torre da Ascensão, no lado esquerdo. Caminhos em `WAYS` podem ser `[X, Y]` (da praça) ou `[X0, Y0, X1, Y1]`, sempre retos.
- Ilha 10% maior (`HEX`) e câmera mais longe: o mapa mostra `MAP_VB = [-60, -36, 1120, 672]` em vez de 1000x600 (SVG e câmera 3D usam o mesmo). Colmeias 5 e 6 desceram um pouco para os nomes não baterem nos balões. Enfeites 3D novos no lado direito.
- Laboratório fechado até o nível 9 (`LAB_OPEN`), depois abre pagando 6.000 de mel. Cristais continuam chegando e ficam guardados. Missões de mutação só aparecem com ele aberto.
- v7.8: o Mural de Missões saiu da ilha (Missões fica só na barra de baixo). O Laboratório foi para o lado direito, com um ramal saindo da Roleta, espelhando a Torre. As colmeias de baixo subiram um pouco e as fazendas desceram (`FARM_ROWS = [462, 496]`), então nada fica em cima do gramado.

## v7.9 (13/10/2026): skins de colmeia e Upgrade na Roleta

- Loja > Visual tem 5 skins de colmeia (`HIVE_SKINS`): Doce, Abóbora, Noturna, Cristal e Real, de 10 a 22 de geleia real. Cada uma muda as cores do cortiço e põe um enfeite no topo, só na colmeia escolhida (`S.habitats[i].skin`). Não mudam o mel.
- Roleta tem a aba Upgrade: escolha uma abelha e pague mel (`upgCost` = valor do giro × 3, × 8 ou × 20). A chance é de 50% de Comum para Rara, 30% de Rara para Épica e 15% de Épica para Lendária (`UPG`). Se der certo, ela vira uma abelha sorteada da raridade nova e mantém nível, mutação, visual e histórico. Se der errado, só o mel é gasto.

## v8.0 (13/10/2026): economia mais dura, chefes mais fortes e ajustes na ilha

- As abelhas grandes não saem mais voando da colmeia (`FLY_ON = false`). Ficam só as abelhinhas pequenas do 3D.
- Balões das construções (Arena, Roleta, Torre, Laboratório) centralizados em cima delas.
- Barra de cima: os efeitos ativos (Flores x3, Mel x2, invasão...) flutuam logo abaixo dela, fora da linha, e com tela larga (1100 px ou mais) a barra nunca quebra. Entre 561 e 1099 px ela quebra em duas linhas centralizadas.
- Roleta com colmeias cheias: Épica ou Lendária fica com a vaga da abelha mais fraca de raridade menor que está fora do time (não mexe em quem está no Laboratório). A que sai vira mel pelo valor de venda. Comum e Rara continuam virando mel.
- Economia: colheitas dão 30% menos néctar (`FOOD_K`, o XP da colheita é o mesmo). Alimentar custa `13 × 1,27^(nível−1)` (Nv 1→20 custa ~4.500 de néctar). Colmeias produzem 10% menos mel (`HIVE_K`). Batalhas do Ato I dão 20% menos mel.
- Geleia real: lutas de liga dão metade (`ceil(liga/2)`), nível do jogador dá `1 + nível/6`, crises `3 + ato`, conquistas 40% menos, prêmio dos atos 15 e 20.
- Chefes dos atos: Ato I 2.600 de vida e 58 de ataque (antes 1.300/50, uma Épica Nv 20 sozinha vencia), Ato II 4.600/92, Ato III 7.000/112.
- Lentidão com o tempo: 8 min de partida acelerada em teste (compras, giros, troca de abelhas) não mostraram vazamento: memória JS estável (~45 MB), DOM estável, malhas, texturas e shaders do 3D estáveis, e `render()` sem ficar mais lento. O suspeito mais provável era o voo das abelhas grandes, que chamava `beginElement()` nas animações SMIL; ele foi desligado nesta versão.

## v8.1 (14/10/2026): Upgrade, resumo final, chefes e conquistas

- Upgrade: o botão travava em "Sorteando…" depois de recarregar a página, porque o sorteio salvo usava o relógio da página anterior. Agora `resumeRun()` limpa `S.upRoll`. Custo bem menor: 1, 2,5 e 6 giros (antes 3, 8 e 20).
- Resumo do fim da partida: cada linha mostra o valor real ao lado dos pontos (por exemplo "Nível do jogador · nível 19" com 3.800 pontos).
- Chefes dos atos crescem com o time que entra na luta: +40% de vida por abelha ascendida, +20% por ataque comprado, +10% por mutação do Laboratório (o ataque sobe 35% desse valor). Ataques da loja custam 3 vezes mais (7.500, 5.400, 9.600 de mel e 75 de geleia).
- Flores rendem 75% do néctar no Ato II e 60% no Ato III (`actFood`).
- Conquista "Ferrão na Rainha" saiu (ficou impossível desde que perder o chefe encerra a partida). Novas: Jardim perfeito, Cidade das abelhas (9 colmeias), Mutação de ouro, Lenda mutante, Trio ascendido, Time de elite (3 abelhas no nível máximo) e Promoção lendária (Épica vira Lendária no Upgrade).
- Chefes: cabeça maior, pernas mais grossas com garra, asas para trás (`wingZ`) e 1,65x maiores na batalha.

## v8.2 (14/10/2026): nota justa, Ato I mais leve, chefes e cutscenes novos

- Nota limitada ao perder (`rankFor`): cair no Ato I dá no máximo C, no Ato II no máximo B, no Ato III no máximo A. S só vencendo os três atos. Encerrar antes do fim conta como perder no ato atual.
- Chefe do Ato I: 1.700 de vida e 52 de ataque (era 2.600/58). Em 20 lutas simuladas, 3 Épicas Nv 15 vencem 13 e Nv 18 vencem todas. Atos II e III seguem 4.600 e 7.000.
- Os chefes dos atos crescem só com as abelhas que entram na luta (o `powerK` geral saiu dos chefes). Ataque comprado numa abelha que ficou fora não deixa o chefe mais forte.
- Modelo novo dos chefes (`buildBoss` + `villainHead`): mesmo estilo chibi das abelhas do jogador, mas malvados. Máscara escura de vespa, olhos vermelhos brilhando sob pálpebras bravas, dentes, mandíbulas, abdômen listrado com ferrão grande. General com elmo, crista vermelha e ombreiras; Rainha roxa com coroa de espinhos e rubi; Imperatriz branca e roxa com coroa alta de ouro e anéis.
- Cutscenes: câmera que aproxima e desliza devagar, dissolve entre as cenas (sem piscar preto), brilho suave (bloom), luz quente e raios de luz nas cenas claras, brasas nas escuras, pólen flutuando, vinheta mais forte. Caixa de fala com textura de favo e brilho na cor de quem fala, retrato e nome entram com um pulinho, narração em faixa de cinema e título pulsando.

## v8.3 (14/10/2026): vespa detalhada nas cutscenes e nos chefes

- Vespa das cutscenes (`vespa()` no módulo de cutscenes, exportada como `Cutscene.vespa`) redesenhada à mão em canvas: quitina com brilho, asas com nervuras e reflexo, pernas em segmentos com espinhos, abdômen em placas com ferrão e gota de veneno, olhos compostos com facetas e ocelos, sobrancelhas em V e mandíbulas serrilhadas. Três visuais (`VESPA_PAL`): Rainha (vermelha, coroa dourada), General (laranja, elmo com crista, ombreiras e cicatriz), Imperatriz (branca e roxa, coroa alta e aura). A cena recebe o chefe do ato em `vars.tipo`; o retrato da fala também usa o desenho.
- Chefes da batalha (raridade B) deixaram o modelo 3D chibi: `bossStrip()` desenha a mesma vespa em 8 quadros batendo as asas. Escala na arena 1,3x (era 1,65x).

## v8.4 (14/10/2026): cenários das cutscenes repaginados

- `ilhaFavo()` agora desenha a ilha como ela é no jogo: borda de cera dourada pingando mel, chão de favos marrom, caminhos de pedra creme saindo da praça com a estátua dourada, gramado da fazenda com rio de mel, Arena, Mercado, Roleta, Laboratório, Torre da Ascensão, colmeias, velas e moitas. `ruina` deixa tudo apagado e rachado; `vazia` tira as construções. Fica acima da caixa de fala (`ilhaLugar`).
- `fundoMel()`: fundo de dentro da colmeia (luz de mel, favos gigantes apagados, raios de luz e bolhas de luz) no lugar do céu azul com nuvens. Tons dia, tarde e perigo.
- `abelha()` virou chibi como as do jogo (cabeça grande, olhos brilhando, bochechas, corpinho listrado).
- Cena `ovo` agora mostra a Roleta do Enxame girando, com as nove cores e abelhas saindo dela (a fala já falava da roleta).
- A cena vermelha da vespa ficou como estava, só com a ilha nova atrás.

## v8.5 (14/10/2026): cutscenes só com lore

- As falas das cutscenes não explicam mais o jogo (tempo, "escolha três abelhas", lotes e ligas). Viraram lore: a Roleta que fez a velha Tropa, o General e a Imperatriz por trás da Rainha, a Ilha Favo como lar dos heróis, o sono da Rainha no Ninho de Papel.
- As dicas saíram para um cartão da Vovó Melina (`renderMelina`, `S.tutor = -1`) que abre logo depois de escolher o prado e a rainha, antes das dicas normais: girar a Roleta do Enxame e a partida em 3 atos de 12 minutos com os três chefes.
- lore/cutscene.js agora é cópia do bloco entre CUTSCENE-START/END do index.html.

## v8.6 (14/10/2026): dicas no estilo das cutscenes

- O cartão no meio da tela saiu. As dicas agora são falas da Vovó Melina numa caixa embaixo da tela (mesmo visual da caixa de fala das cutscenes: retrato, nome, texto aparecendo letra por letra, setinha de "continua", pontinhos de progresso e botão Pular dicas). A ilha continua visível, com o relógio parado.
- Ordem: as duas falas da Vovó (girar a Roleta do Enxame; 3 atos de 12 minutos com os três chefes) e depois as 8 dicas do `TUTOR`.
- Cada fala destaca o que explica (`TIP_ALVO`): escurece o resto da tela, acende uma moldura piscando no alvo e mostra uma seta balançando. Toque em qualquer lugar completa o texto ou passa para a próxima.
- No celular deitado a barra de abas fica na lateral: a caixa se desloca para o lado e a seta aponta para a esquerda.

## v8.7 (14/10/2026): avisos mais legíveis

- `toast()` ganhou visual próprio: painel chocolate com textura de favo, selo hexagonal com o ícone do assunto (`TOAST_IC` escolhe pelo texto: conquista, rainha, roleta, néctar, geleia, cristal, batalha, nível, relíquia, missão, torre, estação, loja, mel), título em Lilita One amarelo e texto creme bem contrastado.
- Conquistas brilham em dourado e o selo pula; erros ficam vermelhos com "!" e tremem.
- Barrinha embaixo mostra o tempo que falta; avisos com texto ficam 4,6 s (sem texto, 3,4 s). Tocar no aviso fecha.

## v8.8 (14/10/2026): música das cutscenes

- Nova faixa `lenda` no módulo de som (80 bpm, feita na hora pelo Web Audio, sem arquivos). A cutscene chama `Som.cena(palco)` a cada quadro e a faixa troca de clima no próximo tempo, sem parar a música:
  - marDeMel: harpa lenta e calma; florada: arpejo subindo e sinos (a Primeira Flor); tropa: trompas e marcha (lembrança heroica); sombra/derrota/vazio: grave com tambor distante; zumbido/olhos/vespa: coração, cordas tremendo e o zumbido do enxame; ovo (Roleta): caixinha de música; ilha: tema da ilha cheio; titulo: acorde grande com trompas; ninho: mistério com sinos soltos; vitoria/amanhecer: fanfarra.
- Abertura, sonho, atoVencido e ondaVencida tocam `lenda` e voltam para `ilha` no fim; vitória, derrota e semDefesa tocam `lenda` e o jogo passa para `placar`. As cenas de chefe continuam com `invasao`.
- v8.8b: a `lenda` ficou mais fluida. Cada clima toca no seu próprio ganho e, na troca de quadro, os dois tocam juntos por ~3 s (o antigo some enquanto o novo entra). Uma cama de pad bem suave nunca para e liga um quadro ao outro. Notas mais longas (sinos no lugar de pluck seco), menos bateria e caixa mais leve.
