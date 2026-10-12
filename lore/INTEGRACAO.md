# Integração das cutscenes no `index.html` do Honey Troop

Arquivos desta pasta:

| Arquivo | O que é |
|---|---|
| `HISTORIA.md` | A lore completa (Primeira Flor, Tropa do Mel, Vespa Rainha, finais). Fonte para a documentação. |
| `cutscene.js` | Módulo das cutscenes. Autossuficiente: injeta o próprio CSS, desenha os cenários em `<canvas>` e os retratos em SVG. Sem imagens externas e sem emojis. Cerca de 56 KB. |
| `demo.html` | Página para assistir a todas as cenas, com seletor de modo. |

## 1. Trocar o bloco

A API e os ids das cenas são **os mesmos** do módulo de dragões. No `index.html`, troque o conteúdo entre `CUTSCENE-START` e `CUTSCENE-END` pelo conteúdo de `cutscene.js`, depois do `audio.js` (ele usa `window.Som` se existir). As chamadas que o jogo já faz continuam funcionando.

## 2. API (igual à anterior)

```js
Cutscene.play(id, { modo, vars, auto, som, onEnd })  // devolve Promise<{ id, pulada }>
Cutscene.pular()      // encerra a cena atual
Cutscene.tocando()    // true enquanto uma cena está na tela
```

- `modo`: `'rapido' | 'padrao' | 'longa' | 'infinito'`. Troca o `{tempo}` da fala da Vovó Melina e escolhe a fala do Infinito.
- `vars.onda`: número do ataque, usado em `despertarOnda`.
- `auto: false` só avança no toque. O padrão avança sozinho depois de cada fala.
- `som: false` desliga o som da cena.

Controles: toque, clique, `Espaço`, `Enter` ou `→` avançam; `Esc` ou o botão **Pular** encerram. Enquanto a cena está aberta, ela segura os toques e as teclas, então os atalhos do jogo não disparam por trás.

## 3. Onde chamar (sem mudança)

| Momento | Chamada |
|---|---|
| Começo da partida | `Cutscene.play('abertura', { modo })`, com o jogo pausado; despausar no `then`. Se houver escolha de rainha (roguelite), mostre a escolha **depois** da abertura. |
| Vespa Rainha ataca | `Cutscene.play(S.mode === 'infinito' && S.wave > 0 ? 'despertarOnda' : 'despertar', { modo: S.mode, vars: { onda: S.wave + 1 } })`. A cena já toca `Som.play('despertar')` e `Som.musica('invasao')`. |
| Ataque vencido no Infinito | `Cutscene.play('ondaVencida')` ao fechar o resultado. |
| Primeira luta contra a Vespa Rainha adormecida | `Cutscene.play('sonho')` antes de abrir a batalha. |
| Fim da partida | `Cutscene.play(sem ataque ? 'semDefesa' : venceu ? 'vitoria' : 'derrota')`, e mostrar o placar no `then`. |

## 4. Celular na horizontal

O módulo ocupa a tela inteira (`position: fixed`) e se ajusta sozinho:

- Com pouca altura (`max-height: 500px`, que é o celular deitado), as faixas de cinema, o retrato, a caixa de fala e o botão Pular encolhem, e os pontinhos de progresso somem, para o cenário continuar visível.
- A ilha e a Vespa Rainha são dimensionadas pela largura **e** pela altura da tela.
- Respeita o recorte da tela (`env(safe-area-inset-*)`), desde que a página tenha `viewport-fit=cover` na meta viewport.

Testado em 1280x720 e 844x390 (celular deitado), sem erros no console.

## 5. Nomes usados (iguais aos do jogo)

Ilha Favo, mar de mel, Colmeias, Flores, Chocadeira, Arena, Mel, Néctar, Geleia Real, os nove tipos (Fogo, Água, Flor, Deserto, Elétrica, Gelo, Veneno, Sombra, Luz) e a Vespa Rainha. As cores dos tipos ficam no objeto `EL` no topo de `cutscene.js`; se o jogo usar outras, basta trocar lá.

Textos que podem acompanhar a lore no jogo (opcional):

- Aviso do ataque: "A Vespa Rainha chegou com o enxame!"
- Vitória: "A colmeia resistiu! Sua colmeia agora é da Tropa do Mel."
- Derrota: "A Vespa Rainha tomou a ilha, mas leva uma ferroada de X%. A próxima colmeia vai saber onde mirar."
- Botão da Vespa adormecida na Arena: "Entrar no Ninho de Papel".

## 6. Editar falas

As falas ficam no objeto `ROTEIROS` no topo de `cutscene.js` (também em `Cutscene.roteiros`). Cada cena tem `palco` (cenário), `quem` (`narrador`, `melina` ou `vespa`), `texto`, e opcionais `flash`, `tremor`, `som`, `so`/`exceto` (filtro por modo). Se mudar uma fala, atualize `HISTORIA.md` também.
