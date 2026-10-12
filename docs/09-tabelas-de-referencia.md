# Tabelas de referência

> Arquivo **gerado automaticamente** por `docs/ferramentas/gerar-tabelas.js` a partir do `index.html`. Não edite à mão: rode o script de novo quando o jogo mudar.

## Modos e a Vespa Rainha

| Modo | A Vespa Rainha invade | Vespa Rainha na invasão (vida / ataque) | Se ferido na Arena (vida) | Vespa Rainha adormecida na Arena (vida / ataque) |
|---|---|---|---|---|
| Rápida | aos 10 min | 1.200 / 48 | 840 | 960 / 38 |
| Padrão | aos 20 min | 2.400 / 70 | 1.680 | 1.920 / 56 |
| Longa | aos 30 min | 3.600 / 88 | 2.520 | 2.880 / 70 |
| Infinito | a cada 15 min | 1.800 / 60 na 1ª invasão | 1.260 | 1.440 / 48 |

No modo Infinito a Vespa Rainha fica 35% mais forte (vida e ataque) a cada invasão repelida:

| Invasão | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| Vida | 1.800 | 2.430 | 3.281 | 4.429 | 5.979 | 8.071 |
| Ataque | 60 | 81 | 109 | 148 | 199 | 269 |

## Elementos

| Elemento | Nível p/ comprar | Preço na loja | Raridade do puro | Forte contra (x1,5) | Fraco contra (x0,7) |
|---|---|---|---|---|---|
| 🔥 Fogo | 1 | 🪙 100 | Comum | 🌿 Flor, ❄️ Gelo, ⚙️ Veneno | 💧 Água, 🪨 Deserto |
| 💧 Água | 1 | 🪙 150 | Comum | 🔥 Fogo, 🪨 Deserto | 🌿 Flor, ⚡ Elétrica |
| 🌿 Flor | 1 | 🪙 150 | Comum | 💧 Água, 🪨 Deserto | 🔥 Fogo, ❄️ Gelo |
| 🪨 Deserto | 2 | 🪙 250 | Comum | ⚡ Elétrica, 🔥 Fogo, ⚙️ Veneno | 💧 Água, 🌿 Flor, ❄️ Gelo |
| ⚡ Elétrica | 3 | 🪙 600 | Comum | 💧 Água, ⚙️ Veneno | 🪨 Deserto, 🌑 Sombra |
| ❄️ Gelo | 4 | 🪙 900 | Comum | 🌿 Flor, 🪨 Deserto | 🔥 Fogo, ⚙️ Veneno, ✨ Luz |
| ⚙️ Veneno | 6 | 🪙 2.500 | Rara | ❄️ Gelo, ✨ Luz | 🔥 Fogo, 🪨 Deserto, ⚡ Elétrica |
| 🌑 Sombra | 8 | 🪙 6.000 | Rara | ✨ Luz, ⚡ Elétrica | ✨ Luz |
| ✨ Luz | 8 | 🪙 6.000 | Rara | 🌑 Sombra, ❄️ Gelo | ⚙️ Veneno, 🌑 Sombra |

A coluna "fraco contra" lista os atacantes que causam x1,5 nele. Quando ele mesmo ataca um elemento que é forte contra o dele, o dano cai para x0,7.

## Matriz de dano elemental (atacante na linha, defensor na coluna)

| Atq \ Def | 🔥 | 💧 | 🌿 | 🪨 | ⚡ | ❄️ | ⚙️ | 🌑 | ✨ |
|---|---|---|---|---|---|---|---|---|---|
| 🔥 Fogo | · | 0,7 | 1,5 | 0,7 | · | 1,5 | 1,5 | · | · |
| 💧 Água | 1,5 | · | 0,7 | 1,5 | 0,7 | · | · | · | · |
| 🌿 Flor | 0,7 | 1,5 | · | 1,5 | · | 0,7 | · | · | · |
| 🪨 Deserto | 1,5 | 0,7 | 0,7 | · | 1,5 | 0,7 | 1,5 | · | · |
| ⚡ Elétrica | · | 1,5 | · | 0,7 | · | · | 1,5 | 0,7 | · |
| ❄️ Gelo | 0,7 | · | 1,5 | 1,5 | · | · | 0,7 | · | 0,7 |
| ⚙️ Veneno | 0,7 | · | · | 0,7 | 0,7 | 1,5 | · | · | 1,5 |
| 🌑 Sombra | · | · | · | · | 1,5 | · | · | · | 1,5 |
| ✨ Luz | · | · | · | · | · | 1,5 | 0,7 | 1,5 | · |

Contra abelhas de dois elementos os multiplicadores se **multiplicam** (ex.: 🔥 contra 🌿❄️ = 1,5 × 1,5 = 2,25).

## Raridades

| Raridade | Valor (rv) | Mel/s no Nv 1 | Vida no Nv 1 | Ataque no Nv 1 | Chocagem (s) | Espécies |
|---|---|---|---|---|---|---|
| Comum | 1 | 1 | 100 | 20 | 8 | 6 |
| Rara | 2 | 2,5 | 125 | 25 | 15 | 18 |
| Épica | 3 | 6 | 160 | 33 | 25 | 21 |
| Lendária | 5 | 15 | 230 | 46 | 40 | 5 |

## Atributos por nível de abelha

Fórmulas: mel/s = base × (1 + 0,4 × (nv − 1)); vida = base × (1 + 0,2 × (nv − 1)); ataque = base × (1 + 0,16 × (nv − 1)); poder = vida/4 + ataque × 2. Nível máximo: 15.

**Comum**

| Nível | 1 | 3 | 5 | 8 | 10 | 12 | 15 |
|---|---|---|---|---|---|---|---|
| Mel/s | 1 | 1,8 | 2,6 | 3,8 | 4,6 | 5,4 | 6,6 |
| Vida | 100 | 140 | 180 | 240 | 280 | 320 | 380 |
| Ataque | 20 | 26 | 33 | 42 | 49 | 55 | 65 |
| Poder | 65 | 87 | 111 | 144 | 168 | 190 | 225 |
| Valor de venda | 25 | 75 | 125 | 200 | 250 | 300 | 375 |

**Raro**

| Nível | 1 | 3 | 5 | 8 | 10 | 12 | 15 |
|---|---|---|---|---|---|---|---|
| Mel/s | 2,5 | 4,5 | 6,5 | 9,5 | 11,5 | 13,5 | 16,5 |
| Vida | 125 | 175 | 225 | 300 | 350 | 400 | 475 |
| Ataque | 25 | 33 | 41 | 53 | 61 | 69 | 81 |
| Poder | 81 | 110 | 138 | 181 | 210 | 238 | 281 |
| Valor de venda | 50 | 150 | 250 | 400 | 500 | 600 | 750 |

**Épico**

| Nível | 1 | 3 | 5 | 8 | 10 | 12 | 15 |
|---|---|---|---|---|---|---|---|
| Mel/s | 6 | 10,8 | 15,6 | 22,8 | 27,6 | 32,4 | 39,6 |
| Vida | 160 | 224 | 288 | 384 | 448 | 512 | 608 |
| Ataque | 33 | 44 | 54 | 70 | 81 | 91 | 107 |
| Poder | 106 | 144 | 180 | 236 | 274 | 310 | 366 |
| Valor de venda | 75 | 225 | 375 | 600 | 750 | 900 | 1125 |

**Lendário**

| Nível | 1 | 3 | 5 | 8 | 10 | 12 | 15 |
|---|---|---|---|---|---|---|---|
| Mel/s | 15 | 27 | 39 | 57 | 69 | 81 | 99 |
| Vida | 230 | 322 | 414 | 552 | 644 | 736 | 874 |
| Ataque | 46 | 61 | 75 | 98 | 112 | 127 | 149 |
| Poder | 150 | 203 | 254 | 334 | 385 | 438 | 517 |
| Valor de venda | 125 | 375 | 625 | 1000 | 1250 | 1500 | 1875 |

## Custo para alimentar (néctar)

| Do nível | 1→2 | 2→3 | 3→4 | 4→5 | 5→6 | 6→7 | 7→8 | 8→9 | 9→10 | 10→11 | 11→12 | 12→13 | 13→14 | 14→15 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 🍖 | 10 | 15 | 23 | 34 | 51 | 76 | 114 | 171 | 256 | 384 | 577 | 865 | 1297 | 1946 |

Total de néctar do nível 1 ao 15: **5.819**.

## Plantações

| Plantação | Nível | Custo | Tempo | Néctar | Néctar por segundo | Lucro de néctar por mel |
|---|---|---|---|---|---|---|
| 🌾 Margarida | 1 | 🪙 10 | 5s | 12 | 2,4 | 1,2 |
| 🌽 Girassol | 2 | 🪙 40 | 20s | 60 | 3 | 1,5 |
| 🎃 Rosa | 4 | 🪙 120 | 45s | 180 | 4 | 1,5 |
| 🍇 Lótus | 7 | 🪙 350 | 90s | 520 | 5,78 | 1,49 |

## Construções

A partida começa com 1 colmeia (3 vagas de abelha) e 2 canteiros de flores. A ilha tem lotes para no máximo 10 colmeias e 12 canteiros de flores. Custo de cada nova unidade:

| Colmeia | Custo | Canteiro | Custo |
|---|---|---|---|
| 2º colmeia | 🪙 150 | 3ª canteiro | 🪙 100 |
| 3º colmeia | 🪙 315 | 4ª canteiro | 🪙 180 |
| 4º colmeia | 🪙 662 | 5ª canteiro | 🪙 324 |
| 5º colmeia | 🪙 1.389 | 6ª canteiro | 🪙 583 |
| 6º colmeia | 🪙 2.917 | 7ª canteiro | 🪙 1.050 |
| 7º colmeia | 🪙 6.126 | 8ª canteiro | 🪙 1.890 |
| 8º colmeia | 🪙 12.865 | 9ª canteiro | 🪙 3.401 |
| 9º colmeia | 🪙 27.016 | 10ª canteiro | 🪙 6.122 |
| 10º colmeia | 🪙 56.734 | 11ª canteiro | 🪙 11.020 |
|  |  | 12ª canteiro | 🪙 19.836 |

| Espaço da chocadeira | 2º | 3º | 4º |
|---|---|---|---|
| Custo | 🪙 300 | 🪙 1.500 | 🪙 6.000 |

## Nível do jogador

| Nível | XP para o próximo | XP acumulado | Geleia real ao subir | Desbloqueia |
|---|---|---|---|---|
| 1→2 | 40 | 40 | 2 | 🪨 Deserto, 🌽 Girassol |
| 2→3 | 121 | 161 | 2 | ⚡ Elétrica, Colher e replantar tudo |
| 3→4 | 232 | 393 | 2 | ❄️ Gelo, 🎃 Rosa |
| 4→5 | 368 | 761 | 3 | Coletar tudo (tecla C) |
| 5→6 | 525 | 1.286 | 3 | ⚙️ Veneno |
| 6→7 | 703 | 1.989 | 3 | 🍇 Lótus |
| 7→8 | 900 | 2.889 | 3 | 🌑 Sombra, ✨ Luz |
| 8→9 | 1.114 | 4.003 | 3 |  |
| 9→10 | 1.345 | 5.348 | 4 |  |
| 10→11 | 1.592 | 6.940 | 4 |  |
| 11→12 | 1.855 | 8.795 | 4 |  |
| 12→13 | 2.132 | 10.927 | 4 |  |
| 13→14 | 2.423 | 13.350 | 4 |  |
| 14→15 | 2.728 | 16.078 | 5 |  |
| 15→16 | 3.047 | 19.125 | 5 |  |
| 16→17 | 3.378 | 22.503 | 5 |  |
| 17→18 | 3.722 | 26.225 | 5 |  |
| 18→19 | 4.078 | 30.303 | 5 |  |
| 19→20 | 4.447 | 34.750 | 6 |  |
| 20→21 | 4.827 | 39.577 | 6 |  |
| 21→22 | 5.219 | 44.796 | 6 |  |
| 22→23 | 5.623 | 50.419 | 6 |  |
| 23→24 | 6.037 | 56.456 | 6 |  |
| 24→25 | 6.462 | 62.918 | 7 |  |
| 25→26 | 6.899 | 69.817 | 7 |  |
| 26→27 | 7.345 | 77.162 | 7 |  |
| 27→28 | 7.803 | 84.965 | 7 |  |
| 28→29 | 8.270 | 93.235 | 7 |  |
| 29→30 | 8.748 | 101.983 | 8 |  |

## Arena: ligas

| Liga | Raridades sorteadas | Oponentes (luta 1/2/3) | Nível dos oponentes (luta 1/2/3) | Mel por vitória (luta 1/2/3) | Geleia real | XP (luta 1/2/3) |
|---|---|---|---|---|---|---|
| Bronze | Comum | 1 / 1 / 2 | 1 / 2 / 3 | 90 / 135 / 180 | 1 | 15 / 20 / 25 |
| Prata | Comum, Comum, Raro | 1 / 2 / 2 | 3 / 4 / 5 | 336 / 504 / 672 | 2 | 30 / 35 / 40 |
| Mel | Raro, Comum | 2 / 2 / 3 | 5 / 6 / 7 | 726 / 1.089 / 1.451 | 3 | 45 / 50 / 55 |
| Platina | Raro, Raro, Épico | 2 / 3 / 3 | 7 / 8 / 9 | 1.254 / 1.880 / 2.507 | 4 | 60 / 65 / 70 |
| Diamante | Épico, Raro | 3 / 3 / 3 | 9 / 10 / 11 | 1.916 / 2.873 / 3.831 | 5 | 75 / 80 / 85 |
| Mestre | Épico, Épico, Raro | 3 / 3 / 3 | 11 / 12 / 13 | 2.709 / 4.063 / 5.417 | 6 | 90 / 95 / 100 |
| Grão-Mestre | Épico, Lendário, Épico | 3 / 3 / 3 | 13 / 14 / 15 | 3.630 / 5.445 / 7.260 | 7 | 105 / 110 / 115 |
| Campeões | Lendário, Épico | 3 / 3 / 3 | 15 / 15 / 15 | 4.679 / 7.018 / 9.357 | 8 | 120 / 125 / 130 |

As raridades sorteadas têm o mesmo peso cada; repetições na lista aumentam a chance (ex.: "Raro, Raro, Épico" = 2/3 Raro, 1/3 Épico). Oponentes de liga têm 95% da vida e do ataque de uma abelha normal do mesmo nível.

## Espécies (50)

| # | Espécie | Elementos | Raridade | Como obter |
|---|---|---|---|---|
| 1 | Abelha de Fogo | 🔥 Fogo | Comum | Loja (nível 1) ou cruzamento |
| 2 | Abelha de Água | 💧 Água | Comum | Loja (nível 1) ou cruzamento |
| 3 | Abelha de Flor | 🌿 Flor | Comum | Loja (nível 1) ou cruzamento |
| 4 | Abelha de Deserto | 🪨 Deserto | Comum | Loja (nível 2) ou cruzamento |
| 5 | Abelha Elétrica | ⚡ Elétrica | Comum | Loja (nível 3) ou cruzamento |
| 6 | Abelha de Gelo | ❄️ Gelo | Comum | Loja (nível 4) ou cruzamento |
| 7 | Abelha de Veneno | ⚙️ Veneno | Rara | Loja (nível 6) ou cruzamento |
| 8 | Abelha das Sombra | 🌑 Sombra | Rara | Loja (nível 8) ou cruzamento |
| 9 | Abelha de Luz | ✨ Luz | Rara | Loja (nível 8) ou cruzamento |
| 10 | Piromaris | 🔥 Fogo + 💧 Água | Rara | Cruzar um pai com 🔥 Fogo e outro com 💧 Água |
| 11 | Pirofolius | 🔥 Fogo + 🌿 Flor | Rara | Cruzar um pai com 🔥 Fogo e outro com 🌿 Flor |
| 12 | Piropetrus | 🔥 Fogo + 🪨 Deserto | Rara | Cruzar um pai com 🔥 Fogo e outro com 🪨 Deserto |
| 13 | Pirovoltar | 🔥 Fogo + ⚡ Elétrica | Rara | Cruzar um pai com 🔥 Fogo e outro com ⚡ Elétrica |
| 14 | Piroglacius | 🔥 Fogo + ❄️ Gelo | Rara | Cruzar um pai com 🔥 Fogo e outro com ❄️ Gelo |
| 15 | Piroferrum | 🔥 Fogo + ⚙️ Veneno | Épica | Cruzar um pai com 🔥 Fogo e outro com ⚙️ Veneno |
| 16 | Pironoctis | 🔥 Fogo + 🌑 Sombra | Épica | Cruzar um pai com 🔥 Fogo e outro com 🌑 Sombra |
| 17 | Pirolumen | 🔥 Fogo + ✨ Luz | Épica | Cruzar um pai com 🔥 Fogo e outro com ✨ Luz |
| 18 | Hidrofolius | 💧 Água + 🌿 Flor | Rara | Cruzar um pai com 💧 Água e outro com 🌿 Flor |
| 19 | Hidropetrus | 💧 Água + 🪨 Deserto | Rara | Cruzar um pai com 💧 Água e outro com 🪨 Deserto |
| 20 | Hidrovoltar | 💧 Água + ⚡ Elétrica | Rara | Cruzar um pai com 💧 Água e outro com ⚡ Elétrica |
| 21 | Hidroglacius | 💧 Água + ❄️ Gelo | Rara | Cruzar um pai com 💧 Água e outro com ❄️ Gelo |
| 22 | Hidroferrum | 💧 Água + ⚙️ Veneno | Épica | Cruzar um pai com 💧 Água e outro com ⚙️ Veneno |
| 23 | Hidronoctis | 💧 Água + 🌑 Sombra | Épica | Cruzar um pai com 💧 Água e outro com 🌑 Sombra |
| 24 | Hidrolumen | 💧 Água + ✨ Luz | Épica | Cruzar um pai com 💧 Água e outro com ✨ Luz |
| 25 | Fitopetrus | 🌿 Flor + 🪨 Deserto | Rara | Cruzar um pai com 🌿 Flor e outro com 🪨 Deserto |
| 26 | Fitovoltar | 🌿 Flor + ⚡ Elétrica | Rara | Cruzar um pai com 🌿 Flor e outro com ⚡ Elétrica |
| 27 | Fitoglacius | 🌿 Flor + ❄️ Gelo | Rara | Cruzar um pai com 🌿 Flor e outro com ❄️ Gelo |
| 28 | Fitoferrum | 🌿 Flor + ⚙️ Veneno | Épica | Cruzar um pai com 🌿 Flor e outro com ⚙️ Veneno |
| 29 | Fitonoctis | 🌿 Flor + 🌑 Sombra | Épica | Cruzar um pai com 🌿 Flor e outro com 🌑 Sombra |
| 30 | Fitolumen | 🌿 Flor + ✨ Luz | Épica | Cruzar um pai com 🌿 Flor e outro com ✨ Luz |
| 31 | Geovoltar | 🪨 Deserto + ⚡ Elétrica | Rara | Cruzar um pai com 🪨 Deserto e outro com ⚡ Elétrica |
| 32 | Geoglacius | 🪨 Deserto + ❄️ Gelo | Rara | Cruzar um pai com 🪨 Deserto e outro com ❄️ Gelo |
| 33 | Geoferrum | 🪨 Deserto + ⚙️ Veneno | Épica | Cruzar um pai com 🪨 Deserto e outro com ⚙️ Veneno |
| 34 | Geonoctis | 🪨 Deserto + 🌑 Sombra | Épica | Cruzar um pai com 🪨 Deserto e outro com 🌑 Sombra |
| 35 | Geolumen | 🪨 Deserto + ✨ Luz | Épica | Cruzar um pai com 🪨 Deserto e outro com ✨ Luz |
| 36 | Eletroglacius | ⚡ Elétrica + ❄️ Gelo | Rara | Cruzar um pai com ⚡ Elétrica e outro com ❄️ Gelo |
| 37 | Eletroferrum | ⚡ Elétrica + ⚙️ Veneno | Épica | Cruzar um pai com ⚡ Elétrica e outro com ⚙️ Veneno |
| 38 | Eletronoctis | ⚡ Elétrica + 🌑 Sombra | Épica | Cruzar um pai com ⚡ Elétrica e outro com 🌑 Sombra |
| 39 | Eletrolumen | ⚡ Elétrica + ✨ Luz | Épica | Cruzar um pai com ⚡ Elétrica e outro com ✨ Luz |
| 40 | Crioferrum | ❄️ Gelo + ⚙️ Veneno | Épica | Cruzar um pai com ❄️ Gelo e outro com ⚙️ Veneno |
| 41 | Crionoctis | ❄️ Gelo + 🌑 Sombra | Épica | Cruzar um pai com ❄️ Gelo e outro com 🌑 Sombra |
| 42 | Criolumen | ❄️ Gelo + ✨ Luz | Épica | Cruzar um pai com ❄️ Gelo e outro com ✨ Luz |
| 43 | Ferronoctis | ⚙️ Veneno + 🌑 Sombra | Épica | Cruzar um pai com ⚙️ Veneno e outro com 🌑 Sombra |
| 44 | Ferrolumen | ⚙️ Veneno + ✨ Luz | Épica | Cruzar um pai com ⚙️ Veneno e outro com ✨ Luz |
| 45 | Umbrolumen | 🌑 Sombra + ✨ Luz | Épica | Cruzar um pai com 🌑 Sombra e outro com ✨ Luz |
| 46 | Eclipse | ✨ Luz + 🌑 Sombra | Lendária | Cruzar pais que somem ✨ Luz + 🌑 Sombra (25%) |
| 47 | Aurora | ❄️ Gelo + ✨ Luz | Lendária | Cruzar pais que somem ❄️ Gelo + ✨ Luz (20%) |
| 48 | Escorpiona | 🪨 Deserto + ⚙️ Veneno | Lendária | Cruzar pais que somem 🪨 Deserto + ⚙️ Veneno (18%) |
| 49 | Tempestade | 💧 Água + ⚡ Elétrica | Lendária | Cruzar pais que somem 💧 Água + ⚡ Elétrica (15%) |
| 50 | Vulcana | 🔥 Fogo + 🪨 Deserto | Lendária | Cruzar pais que somem 🔥 Fogo + 🪨 Deserto (12%) |

## Conquistas (65, total de 301 geleia real)

### Primeiros passos

|  | Conquista | Requisito | Geleia real |
|---|---|---|---|
| 🪙 | Primeira coleta | Colete mel de uma colmeia. | 1 |
| 🌾 | Mãos na terra | Faça sua primeira colheita. | 1 |
| 🛒 | Novo amigo | Compre uma abelha na loja. | 1 |
| 🍖 | Hora do lanche | Alimente uma abelha. | 1 |
| 💞 | Casamenteiro | Cruze duas abelhas. | 2 |
| 🐣 | Choca-ovos | Choque seu primeiro ovo. | 2 |
| ⚔️ | Primeira vitória | Vença uma batalha na Arena. | 2 |

### Riqueza

|  | Conquista | Requisito | Geleia real |
|---|---|---|---|
| 💰 | Cofrinho | Ganhe 1.000 de mel no total. | 1 |
| 💰 | Tesouro | Ganhe 10.000 de mel no total. | 2 |
| 👑 | Montanha de mel | Ganhe 100.000 de mel no total. | 5 |
| 🏰 | Abelha milionário | Ganhe 1.000.000 de mel no total. | 10 |
| 📈 | Renda passiva | Alcance 10 de mel por segundo. | 1 |
| 🏭 | Fábrica de mel | Alcance 50 de mel por segundo. | 3 |
| 🏦 | Banco dracônico | Alcance 200 de mel por segundo. | 5 |
| 💎 | Economia lendária | Alcance 500 de mel por segundo. | 10 |
| 💠 | Joalheiro | Ganhe 100 geleia real no total. | 5 |

### Coleção

|  | Conquista | Requisito | Geleia real |
|---|---|---|---|
| 🐉 | Bando | Tenha 5 abelhas ao mesmo tempo. | 1 |
| 🐉 | Revoada | Tenha 10 abelhas ao mesmo tempo. | 3 |
| 🐉 | Céu lotado | Tenha 20 abelhas ao mesmo tempo. | 5 |
| 🔷 | Raridade | Obtenha uma abelha Raro. | 1 |
| 🔮 | Épico! | Obtenha uma abelha Épico. | 3 |
| 🌟 | Lenda viva | Obtenha uma abelha Lendário. | 5 |
| 🏛️ | Panteão | Obtenha 3 abelhas Lendários. | 10 |
| 🌈 | Arco-íris elemental | Tenha abelhas dos 9 elementos ao mesmo tempo. | 8 |
| 📗 | Colecionador | Descubra 10 espécies. | 3 |
| 📘 | Naturalista | Descubra 25 espécies. | 6 |
| 📕 | Enciclopédia viva | Descubra 40 espécies. | 12 |

### Evolução

|  | Conquista | Requisito | Geleia real |
|---|---|---|---|
| ⬆️ | Crescendo | Leve uma abelha ao nível 5. | 1 |
| ⏫ | Adolescente feroz | Leve uma abelha ao nível 10. | 3 |
| 🔱 | Forma máxima | Leve uma abelha ao nível 15. | 6 |
| 🍗 | Banquete | Alimente abelhas 50 vezes. | 3 |
| 🧬 | Genética avançada | Cruze abelhas 20 vezes. | 5 |
| ⏩ | Apressado | Acelere 5 ovos com geleia real. | 2 |

### Canteiro

|  | Conquista | Requisito | Geleia real |
|---|---|---|---|
| 🧺 | Celeiro cheio | Colha 1.000 de néctar. | 2 |
| 🚜 | Agronegócio | Colha 10.000 de néctar. | 5 |
| 👩‍🌾 | Fazendeiro dedicado | Faça 100 colheitas. | 4 |
| 🌱 | Latifúndio | Tenha 6 canteiros de flores. | 3 |

### Arena

|  | Conquista | Requisito | Geleia real |
|---|---|---|---|
| 🛡️ | Gladiador | Vença 10 batalhas. | 3 |
| 🏆 | Campeão de arena | Vença 30 batalhas. | 8 |
| 🥉 | Subindo de liga | Chegue à liga Mel. | 2 |
| 🥈 | Elite | Chegue à liga Diamante. | 5 |
| 🥇 | Liga dos Campeões | Chegue à liga Campeões. | 8 |
| ☠️ | Golpe no sono | Derrote a Vespa Rainha adormecida na Arena, após a liga Campeões. | 20 |
| 🔥 | Invicto | Vença 5 batalhas seguidas. | 3 |
| ☄️ | Imparável | Vença 10 batalhas seguidas. | 6 |
| 🎯 | Golpe certeiro | Acerte 50 golpes críticos. | 4 |
| 🧪 | Mestre elemental | Acerte 50 golpes super eficazes. | 4 |
| 💯 | Vitória perfeita | Vença sem perder nenhum abelha (liga Platina ou acima). | 4 |
| 💥 | Golpe devastador | Cause 300 de dano em um único golpe. | 4 |

### Ilha

|  | Conquista | Requisito | Geleia real |
|---|---|---|---|
| 🏘️ | Condomínio | Tenha 5 colmeias. | 3 |
| 🪺 | Maternidade | Tenha 4 espaços na chocadeira. | 4 |
| 👋 | Desapego | Venda uma abelha. | 1 |
| 📜 | Prestativo | Conclua 5 missões. | 3 |
| 🎖️ | Herói da ilha | Conclua 15 missões. | 8 |
| 🥚 | Caçador de ovos | Pegue 3 ovos perdidos. | 4 |
| 📣 | Sempre alerta | Presencie 5 eventos. | 2 |

### Jogador

|  | Conquista | Requisito | Geleia real |
|---|---|---|---|
| ⭐ | Aprendiz | Chegue ao nível 5. | 2 |
| 🌟 | Domador | Chegue ao nível 10. | 5 |
| 💫 | Mestre das abelhas | Chegue ao nível 20. | 10 |
| ⚡ | Relâmpago | Chegue ao nível 5 em até 5 minutos. | 5 |
| 🍀 | Sorte de principiante | Obtenha um Lendário em até 10 minutos. | 8 |
| 👆 | Dedo nervoso | Faça 500 cliques. | 2 |

### Invasão

|  | Conquista | Requisito | Geleia real |
|---|---|---|---|
| 🛡️ | Guardião da ilha | Vença a Invasão Final. | 10 |
| 🏰 | Ilha intocável | Vença a Invasão Final sem perder nenhum abelha. | 15 |
| 🩸 | Cicatriz na Vespa Rainha | Tire metade da vida da Vespa Rainha na Invasão Final. | 5 |
