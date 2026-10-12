# Abelhas e cruzamento

## Elementos

São 9 elementos. Os 6 primeiros são **básicos**; Veneno, Sombra e Luz são **especiais** (puros já nascem Raros e qualquer híbrido com eles é Épico).

| Elemento | Tipo | Libera na loja no nível |
|---|---|---|
| 🔥 Fogo | básico | 1 |
| 💧 Água | básico | 1 |
| 🌿 Flor | básico | 1 |
| 🪨 Deserto | básico | 2 |
| ⚡ Elétrica | básico | 3 |
| ❄️ Gelo | básico | 4 |
| ⚙️ Veneno | especial | 6 |
| 🌑 Sombra | especial | 8 |
| ✨ Luz | especial | 8 |

Vantagens elementais e preços: [09-tabelas-de-referencia.md](09-tabelas-de-referencia.md#elementos).

## Raridades

| Raridade | Como acontece | Quantas espécies |
|---|---|---|
| Comum | Abelha puro de elemento básico | 6 |
| Rara | Abelha puro especial, ou híbrido de dois básicos | 18 |
| Épica | Híbrido com pelo menos um elemento especial | 21 |
| Lendária | Só por receitas de cruzamento (ou sorte no Ovo misterioso) | 5 |

A raridade define os atributos base (mel/s, vida, ataque), o tempo de chocagem (8, 15, 25 e 40 segundos), o custo de cruzar e o valor de venda.

## As 50 espécies

- **9 puras**, uma por elemento: "Abelha de Fogo", "Abelha das Sombra" etc.
- **36 híbridas**, uma para cada par de elementos diferentes. O nome junta o **prefixo** do elemento que vem primeiro na lista acima e o **sufixo** do outro (Água + Deserto = Hidropetrus, nunca Geomaris):

| Elemento | Prefixo | Sufixo |
|---|---|---|
| Fogo | Piro | flar |
| Água | Hidro | maris |
| Flor | Fito | folius |
| Deserto | Geo | petrus |
| Elétrica | Eletro | voltar |
| Gelo | Crio | glacius |
| Veneno | Ferro | ferrum |
| Sombra | Umbro | noctis |
| Luz | Lumo | lumen |

  Exemplos: Fogo + Água = **Piromaris**; Deserto + Gelo = **Geoglacius**; Sombra + Luz = **Umbrolumen**.
- **5 lendárias**, com nome próprio e receita:

| Lendária | Receita (elementos somados dos dois pais) | Chance |
|---|---|---|
| Eclipse | ✨ Luz + 🌑 Sombra | 25% |
| Aurora | ❄️ Gelo + ✨ Luz | 20% |
| Escorpiona | 🪨 Deserto + ⚙️ Veneno | 18% |
| Tempestade | 💧 Água + ⚡ Elétrica | 15% |
| Vulcana | 🔥 Fogo + 🪨 Deserto | 12% |

A lista completa, com como obter cada uma, está em [09-tabelas-de-referencia.md](09-tabelas-de-referencia.md#espécies-50).

## Atributos e evolução

Cada abelha tem nível de 1 a 15. Alimentar sobe 1 nível por vez, gastando néctar.

| Atributo | Fórmula |
|---|---|
| Mel por segundo | base × (1 + 0,4 × (nível − 1)) |
| Vida | base × (1 + 0,2 × (nível − 1)) |
| Ataque | base × (1 + 0,16 × (nível − 1)) |
| Poder (usado para ordenar o time) | vida ÷ 4 + ataque × 2 |

Bases por raridade (nível 1):

| | Comum | Rara | Épica | Lendária |
|---|---|---|---|---|
| Mel/s | 1 | 2,5 | 6 | 15 |
| Vida | 100 | 125 | 160 | 230 |
| Ataque | 20 | 25 | 33 | 46 |

## Cruzamento

**Requisitos**

- Dois abelhas diferentes, ambos com **nível 3 ou mais**.
- Um espaço livre na chocadeira (ovos de bônus do evento Ovo Perdido não contam).
- Mel: `30 × (valor da raridade do pai A + valor da raridade do pai B)`. Dois Comuns custam 60; dois Lendários, 300.

Os pais **não** são consumidos e podem cruzar de novo na hora.

**Como a larva é sorteado**

1. **Lendários primeiro.** Junta-se o conjunto de elementos dos dois pais. Para cada receita lendária coberta por esse conjunto, na ordem da tabela acima (Eclipse, Aurora, Titã, Tempestade, Vulcana), há a chance indicada, aplicada **sobre a probabilidade que sobrou** das receitas anteriores.
2. **Depois, a combinação de elementos.** A probabilidade restante é dividida igualmente entre todas as combinações "um elemento do pai A + um elemento do pai B". Se os dois elementos forem iguais, nasce a abelha puro; se forem diferentes, o híbrido.

**Exemplos**

| Pai A | Pai B | Resultado |
|---|---|---|
| 🔥 Fogo | 💧 Água | 100% Piromaris |
| 🔥 Fogo | 🔥 Fogo | 100% Abelha de Fogo |
| 🔥💧 Piromaris | 🌿 Flor | 50% Pirofolius, 50% Hidrofolius |
| 🔥💧 Piromaris | 🔥🌿 Pirofolius | 25% Abelha de Fogo, 25% Pirofolius, 25% Piromaris, 25% Hidrofolius |
| 🔥🪨 Piropetrus | 💧 Água | 12% Vulcana, 44% Piromaris, 44% Hidropetrus |
| 🌑✨ Umbrolumen | ❄️⚙️ Crioferrum | 25% Eclipse, 15% Aurora (20% dos 75% que sobraram), 15% cada para Crionoctis, Ferronoctis, Criolumen e Ferrolumen |

O painel **Cruzar** (Jardim do Amor) mostra a tabela exata de chances para o par escolhido antes de gastar mel. Espécies ainda não descobertas aparecem como "???".

## Chocadeira

- Começa com 1 espaço; dá para comprar até 4 (300, 1.500 e 6.000 de mel).
- Cada ovo choca em segundos de acordo com a raridade: Comum 8, Raro 15, Épico 25, Lendário 40.
- Na janela da Chocadeira, cada ovo é desenhado com as cores dos elementos da espécie (com brilhos extras nos Épicos e Lendários), deitado num favo de palha, com os segundos que faltam e uma barra de progresso. Vagas livres aparecem como favos vazios, com um atalho para Cruzar.
- Ovo pronto brilha e balança; é preciso clicar em **Chocar**, e é preciso ter vaga nos colmeias.
- **Acelerar:** 1 geleia real a cada 8 segundos que faltam.
- O ovo mostra a raridade, mas o nome só aparece se a espécie já estiver no Abelhário.
- Chocar uma espécie nova dá +15 XP extra e a registra no Abelhário.
- Quando nasce uma espécie nova ou um Épico/Lendário, uma tela de revelação mostra a abelha surgindo; os demais nascimentos aparecem só num aviso.
- No mapa, a construção da Chocadeira mostra os ovos na frente, coloridos pela raridade, e um balão 🐣 quando algum está pronto.

## Outras formas de ganhar abelhas

| Fonte | O que vem |
|---|---|
| Loja | Abelhas puros, nascem nível 1 direto na colmeia |
| Ovo misterioso (20 geleia real) | Épico garantido, com cerca de 10% de chance de Lendário |
| Evento Ovo Perdido | Raro ou Épico, sem ocupar espaço da chocadeira |

## Abelhário

Registro das espécies descobertas na partida (por compra, chocagem ou ovo). Mostra as 50 silhuetas; as desconhecidas ficam escuras e com "???". Descobrir espécies vale 150 pontos cada e destrava as conquistas Colecionador (10), Naturalista (25) e Enciclopédia viva (40).

## Aparência e animações

Cada raridade tem um formato de corpo próprio, feito em 3D com three.js e transformado em sprites animados de 8 quadros:

| Raridade | Forma | Detalhe |
|---|---|---|
| Comum | Operária | gordinha e redonda |
| Rara | Guardiã | escudo hexagonal de favo |
| Épica | Guerreira | elmo e lança |
| Lendária | Soberana | coroa e gola real |
| Chefe | Vespa Rainha | vespa preta e laranja com ferrão e coroa |

As cores vêm dos dois tipos da espécie. Sem WebGL, o jogo desenha uma abelha simples em SVG. Mais detalhes em [DESIGN-NOTAS.md](../DESIGN-NOTAS.md#visual-das-abelhas).
