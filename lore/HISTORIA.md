# Honey Troop: a história da Tropa do Mel

Este é o texto canônico da lore. As falas das cutscenes (`cutscene.js`) saem daqui. Se mudar algo, mude nos dois lugares.

## Em uma frase

Você cuida da última colmeia da **Ilha Favo** e tem poucos minutos para criar abelhas fortes o bastante antes que a **Vespa Rainha** volte com o enxame dela. Quem defender bem o lar entra para a **Tropa do Mel**.

## A Primeira Flor

No começo só havia um mar de mel e o vento quente do verão. Um dia, no meio desse mar, brotou a **Primeira Flor**. A raiz dela empurrou a cera do fundo para cima, e assim nasceu a **Ilha Favo**: um hexágono de cera coberto de prado, cercado de mel por todos os lados.

Do néctar da Primeira Flor saíram **nove gotas**, uma para cada tipo de abelha: Fogo, Água, Flor, Deserto, Elétrica, Gelo, Veneno, Sombra e Luz. Cada gota caiu num favo e virou um ovo. Foram as primeiras abelhas. Todas as abelhas que existem hoje descendem delas, e é por isso que duas abelhas de tipos diferentes podem gerar uma terceira: as nove gotas vieram da mesma flor e sempre quiseram se misturar.

## A Tropa do Mel

As melhores abelhas que já existiram formavam um rank só delas: a **Tropa do Mel**. Elas travaram muitas batalhas, defenderam a ilha de tudo o que veio pelo mar de mel e viraram heróis. Cada uma levava no peito um **favo dourado**, a medalha da Tropa.

A Tropa não era uma família nem um exército. Era um título. Qualquer abelha podia entrar, desde que provasse que sabia defender o lar. Esse costume continua até hoje: **as abelhas que conseguem defender muito bem a sua colmeia se tornam uma Tropa do Mel.**

## A Vespa Rainha

A maior batalha da Tropa foi contra a **Vespa Rainha**, senhora do Ninho de Papel, que fica além do mar de mel. Ela não produz nada. Vive de tomar o mel dos outros, e o mel da Ilha Favo, feito do néctar da Primeira Flor, é o mais doce que existe.

A Vespa Rainha não tem tipo próprio. Ela já roubou mel de todas as flores, então ataca com qualquer tipo, e nenhum tipo é especialmente forte contra ela. *(Isso explica a mecânica da Invasão Final: a chefe usa um tipo aleatório por turno e é neutra na defesa.)*

A Tropa a expulsou para além do mar de mel. Ela jurou voltar.

## O Ninho de Papel

Entre um ataque e outro, a Vespa Rainha hiberna num casulo, no fundo do Ninho de Papel. A Arena da ilha guarda o caminho até lá.

Quem vence a liga dos Campeões ganha o direito do ritual mais antigo da Tropa: entrar no ninho enquanto ela dorme e dar a primeira ferroada. Uma ferroada dada no casulo continua doendo quando ela acorda. *(Mecânica: vencer a Vespa Rainha adormecida tira 30% da vida dela na Invasão Final.)*

## A ilha hoje

A velha Tropa se foi há gerações. As colmeias viraram palha seca, as flores murcharam e a Arena ficou vazia. Só restou **Vovó Melina**, a última abelha da Tropa, com as asas cansadas demais para lutar.

O zumbido começou no horizonte. Melina sabe que o enxame está vindo e chama você. Ela entrega o último ovo da Tropa, guardado na Chocadeira, e ensina o que sabe:

- **Mel.** Abelhas felizes enchem os favos de mel nas Colmeias. Colete e reconstrua a ilha.
- **Néctar.** As Flores dão néctar, e abelhas bem alimentadas ficam mais fortes.
- **Cruzamento.** Duas abelhas juntas podem gerar um ovo de outro tipo. Algumas combinações chamam as abelhas lendárias.
- **Geleia Real.** É o néctar da Primeira Flor endurecido. Raro e precioso.

### Gancho para o roguelite (opcional)

Se o jogo usar as ideias de roguelite, elas cabem na lore assim:

- **Rainhas com traços:** as rainhas que você pode escolher no começo são descendentes de heroínas da Tropa. Cada uma herdou uma qualidade e um defeito da antepassada.
- **Relíquias da colmeia:** são objetos que a velha Tropa deixou espalhados pela ilha (um ferrão, uma medalha, um pote de mel antigo). Cada uma ainda guarda um pouco da força de quem a usou.
- **Prado sorteado:** a Primeira Flor muda o prado a cada verão, então nunca nascem as mesmas flores perto da colmeia.

## Personagens

| Personagem | Quem é |
|---|---|
| **Você** | A nova cuidadora da colmeia. Chegou com nada além do último ovo da Tropa. |
| **Vovó Melina** | A última abelha da Tropa do Mel. Usa óculos redondos, lenço vermelho e a medalha de favo dourado. Sábia, carinhosa e direta. Fala curto, porque o tempo é curto. |
| **A Vespa Rainha** | Senhora do Ninho de Papel. Vermelha e preta, de coroa dourada e olhos de mil facetas. Fala em frases arrogantes e acha que todo mel é dela por direito. |

## Os finais

| Final | Quando | O que acontece |
|---|---|---|
| **Tropa do Mel** | Vencer a Invasão Final | A Vespa Rainha foge pelo mar de mel e o enxame vai junto. A Ilha Favo brilha nas nove cores. Melina diz que você defendeu o lar como os heróis de antes, e a sua colmeia passa a ser da Tropa do Mel. |
| **A Vespa tomou a ilha** | Perder a Invasão Final | O enxame cobre a ilha e o céu fica vermelho. Melina diz que a ferroada que você deixou nela não sara, e a próxima colmeia vai saber onde mirar. |
| **Favos vazios** | Encerrar antes do ataque | A Vespa Rainha chega e encontra os favos vazios. Ninguém ficou para defender a colmeia. |
| **O enxame sem fim** (Infinito) | A cada ataque vencido | A Vespa Rainha recua, mas o zumbido não some de vez. Ela volta a cada quinze minutos com mais ferrões. A partida acaba no primeiro ataque perdido. |

## Cutscenes

| Cutscene | Quando passa | Cenas |
|---|---|---|
| `abertura` | Ao começar a partida (depois de escolher o modo) | 8, cerca de 45 s, pode pular |
| `sonho` | Primeira vez que o jogador entra no Ninho da Vespa Rainha adormecida | 2 |
| `despertar` | Quando o relógio zera e a Vespa Rainha ataca (Invasão Final) | 4, cerca de 25 s |
| `despertarOnda` | Ataques 2, 3, 4... no Infinito | 3 |
| `ondaVencida` | Ataque vencido no Infinito | 2 |
| `vitoria` | Antes do placar, depois de vencer | 4 (termina no cartão "Tropa do Mel") |
| `derrota` | Antes do placar, depois de perder | 2 |
| `semDefesa` | Antes do placar, quando encerrou antes do ataque | 1 |

Todas podem ser puladas com o botão **Pular**, com `Esc`, ou avançadas cena a cena com toque, clique, `Espaço` ou `Enter`.
