# Batalhas

As batalhas acontecem no painel ⚔️ **Arena** (clique no coliseu da ilha ou tecla 5). São por turnos e rápidas. A Arena serve para ganhar recursos e treinar o time para o momento que encerra a partida: a **Invasão Final** contra a Vespa Rainha, quando o relógio zera.

## Tipos de batalha

| Tipo | Quando aparece | Oponentes | Recompensa |
|---|---|---|---|
| **Liga** | Sempre, até vencer a liga Campeões | 1 a 3 abelhas, conforme liga e luta | Mel, geleia real e XP crescentes; avança a escada |
| **Abelha Selvagem** | Durante o evento de mesmo nome (45 s) | 1 abelha um nível acima, com 160% de vida | x3 mel e geleia real, x2 XP; não avança a liga |
| **Vespa Rainha adormecida** | Depois de vencer a liga Campeões | A Vespa Rainha com 80% da vida e do ataque da Invasão Final | 8.000 mel × peso do modo (4.000 na Rápida, 12.000 na Longa), 30 geleia real, 400 XP; 2.000 pontos (uma vez); deixa a Vespa Rainha ferido para a próxima invasão; pode ser repetido |
| **Invasão Final** | Quando o relógio zera (no Infinito, a cada 15 min) | A Vespa Rainha, com força conforme o modo | Vale a maior fatia da pontuação; no Infinito, cada invasão repelida também dá mel, geleia real e XP |

## A escada de ligas

Bronze → Prata → Mel → Platina → Diamante → Mestre → Grão-Mestre → Campeões → ☠️ Vespa Rainha adormecida

- Cada liga tem **3 lutas**. Vencer a 3ª promove para a próxima liga.
- Perder não rebaixa nem tira nada: só zera a sequência de vitórias e dá 5 XP de consolo.
- Oponentes por luta: `mínimo(3, ⌈(liga + luta) ÷ 2⌉)`, com a luta contando de 0.
- Nível dos oponentes: `1 + 2 × (liga − 1) + luta`, limitado entre 1 e 15.
- A raridade de cada oponente é sorteada de uma lista por liga (só Comuns no Bronze, Lendários possíveis a partir do Grão-Mestre).
- Oponentes de liga têm 95% da vida e do ataque de uma abelha normal da mesma espécie e nível.
- Mel por vitória: `90 × liga^1,9 × (1 + 0,5 × luta)`; geleia real = número da liga; XP = `15 × liga + 5 × luta`.

Valores liga a liga em [09-tabelas-de-referencia.md](09-tabelas-de-referencia.md#arena-ligas).

## Seu time

- Até **3 abelhas**, escolhidos na Arena (lista ordenada por poder ⚡). Escolher um 4º tira o mais antigo da seleção; não dá para ficar com zero.
- Se nenhum abelha escolhido existir mais (por exemplo, foi vendido), o jogo monta o time com as 3 mais fortes.
- Vida e ataque vêm do nível e raridade da abelha. **A vida volta cheia a cada batalha**; não há cura nem dano persistente.
- Lutam um de cada vez, na ordem do time. Quando um cai, entra o próximo vivo.

## O turno

1. Você escolhe um golpe; sua abelha ataca primeiro.
2. Se o oponente cair, entra o próximo dele e o turno acaba (ele não contra-ataca).
3. Se não cair, ele responde: usa o Especial com 70% de chance quando está disponível; senão, o Ataque.
4. Se o seu cair, entra o próximo do seu time.
5. Vence quem derrubar todos as abelhas do outro lado.

## Golpes

| Golpe | Elemento | Potência | Recarga |
|---|---|---|---|
| **Ataque** | 1º elemento da abelha | x1 | nenhuma |
| **Especial** | 2º elemento (ou o único, se for puro) | x1,7 (x2 para Lendários e a Vespa Rainha) | 3 turnos |

A recarga só diminui quando a abelha usa o Ataque comum: depois de um Especial são necessários 3 Ataques para liberá-lo de novo. O botão mostra os turnos restantes e se o golpe está **forte** ou **fraco** contra o oponente atual.

## Fórmula de dano

```
dano = ataque × potência do golpe × multiplicador elemental × crítico × variação
```

- **Multiplicador elemental:** x1,5 para cada elemento do defensor contra o qual o golpe é forte; x0,7 para cada elemento do defensor que é forte contra o golpe. Contra dois elementos, os fatores se multiplicam (x2,25, x1,05, x0,49...). Matriz completa em [09-tabelas-de-referencia.md](09-tabelas-de-referencia.md#matriz-de-dano-elemental-atacante-na-linha-defensor-na-coluna).
- **Crítico:** 12% de chance, x1,5.
- **Variação:** aleatória entre 0,9 e 1,1.
- Dano mínimo de 1.

Exemplo: um Pirofolius (Raro, nível 10, ataque 61) usa o Especial 🌿 (x1,7) num Abelha de Água: 61 × 1,7 × 1,5 ≈ **156** de dano (sem crítico).

## A Vespa Rainha

- Aparece com as cores de 🌑 Sombra e 🔥 Fogo, desenhado maior que os outros abelhas, mas **não tem elemento**: todo golpe contra ela é neutro (x1). Vence quem tiver vida e ataque brutos.
- A cada golpe ele usa um **elemento aleatório** dos 9, então pode acertar fraquezas do seu time.
- O especial "Ferroada Real" tem potência x2.
- Seus números dependem do modo; veja [09-tabelas-de-referencia.md](09-tabelas-de-referencia.md#modos-e-o-dragão-ancestral).

### Vespa Rainha adormecida (opcional)

Depois de vencer a liga Campeões, a Arena oferece **☠️ Atacar a Vespa Rainha adormecida**: ele com 80% da vida e do ataque da próxima invasão. Vencer deixa a Vespa Rainha **ferido**: a próxima invasão começa com 30% menos vida. O efeito não acumula (lutar de novo antes da invasão não fere mais) e é consumido quando a invasão começa; no Infinito, dá para feri-lo de novo antes de cada onda. A primeira vitória dá a conquista **Golpe no sono** (20 geleia real) e 2.000 pontos; toda vitória rende mel, geleia real e XP.

## A Invasão Final

1. O relógio é a contagem para o despertar; avisos aparecem a 5 min, 2 min, 1 min e 30 s.
2. Ao zerar, a ilha congela, eventos e bônus somem, e uma batalha que estivesse em andamento é cancelada (sem contar nas estatísticas).
3. Uma tela anuncia o despertar e o jogo abre a Arena, que agora só mostra a escolha do time (até 3 abelhas) e a vida e o ataque da Vespa Rainha.
4. Clique em **🛡️ Defender a colmeia**. A batalha segue as regras normais, com batalha automática disponível. Desistir conta como derrota.
5. Há **uma única tentativa** por invasão. No fim, o resultado mostra a % de vida que você tirou dele.

**Força da Vespa Rainha por modo:**

| Modo | Invade | Vida / ataque |
|---|---|---|
| Rápida | aos 10 min | 1.200 / 48 |
| Padrão | aos 20 min | 2.400 / 70 |
| Longa | aos 30 min | 3.600 / 88 |
| Infinito | a cada 15 min | 1.800 / 60 na 1ª invasão, +35% a cada invasão repelida |

**Rápida, Padrão e Longa:** depois da batalha, o botão **Ver placar final** encerra a partida. Pontos (multiplicados pelo peso do modo): vitória 12.000, mais 3.000 se nenhum abelha seu cair; derrota, 6.000 × fração da vida tirada.

**Infinito:** vencer uma invasão dá `3.000 × número da onda` de mel, 20 geleia real e 300 XP, e a ilha volta a funcionar normalmente até a próxima invasão, 15 minutos depois e 35% mais forte. A primeira invasão perdida encerra a partida. Pontos: 12.000 por invasão repelida, +3.000 por invasão repelida sem perder abelhas, e 6.000 × fração de dano na invasão perdida. Valores por onda em [09-tabelas-de-referencia.md](09-tabelas-de-referencia.md#modos-e-o-dragão-ancestral).

Conquistas ligadas: **Guardião da ilha** (vencer uma invasão), **Ilha intocável** (vencer sem perder abelhas) e **Cicatriz na Vespa Rainha** (tirar metade da vida dele).

Encerrar a partida antes do despertar deixa a ilha sem defesa: a Invasão Final vale zero.

## Batalha automática

O botão **▶ Batalha automática** faz o jogo escolher um golpe a cada 1,1 segundo (tempo para ver as animações de ataque): usa o Especial sempre que estiver disponível e render pelo menos o mesmo que o Ataque (considerando a vantagem elemental). Só funciona com o painel da Arena aberto; ao fechá-lo a batalha espera por você.

## Visual da Arena

Cada liga tem o seu cenário de fundo, sempre com arquibancada, torcida e bandeiras:

| Liga | Cenário |
|---|---|
| Bronze | deserto |
| Prata | neve |
| Mel | campo dourado |
| Platina | verde-água |
| Diamante | cristais |
| Mestre | noite roxa |
| Grão-Mestre | vulcão |
| Campeões | aurora |
| Vespa Rainha adormecida e Invasão Final | céu de tempestade com raios |

- **Fora da luta:** uma faixa mostra a liga atual, o time aparece em pódios (as vagas vazias também) e um botão grande **Lutar!** começa a próxima batalha. A escada de ligas é desenhada como escudos, cada um na cor da sua liga.
- **Na luta:** cada lado tem uma placa com o nome e a barra de vida, com o número dentro dela. As abelhas ficam em pódios, com um selo **VS** no meio, e os controles e o registro de golpes ficam em caixas escuras sobre o cenário.

## Animações de combate

- Os duas abelhas aparecem grandes, frente a frente em pódios (o oponente espelhado); a Vespa Rainha é desenhado ainda maior.
- A cada golpe, o atacante dá uma **investida** curta, um **projétil com o emoji do elemento** do golpe voa em arco até o alvo, e o alvo **treme e pisca** com o impacto.
- O dano sobe sobre o alvo como número: verde quando é super eficaz, dourado com "CRÍTICO" em acertos críticos, vermelho nos demais.
- Golpes do mesmo turno (o seu e a resposta do oponente) são mostrados em sequência, com cerca de meio segundo entre eles.

## Desistir

"Desistir" encerra a batalha como derrota (sem perda além de zerar a sequência).

## O que é registrado

Cada batalha alimenta as estatísticas: batalhas, vitórias, derrotas, taxa de vitória, sequência atual e melhor, dano causado e recebido, maior golpe, críticos, golpes super eficazes, nocautes feitos e sofridos, vitórias perfeitas, selvagens derrotados, vitórias sobre a Vespa Rainha adormecida e o resultado da Invasão Final (vitórias, vitórias sem perdas e maior % de dano). Uma **vitória perfeita** é vencer sem perder nenhum abelha, contando só a partir da liga Platina (ou contra o selvagem e a Vespa Rainha).
