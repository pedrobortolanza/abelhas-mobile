# Honey Troop Mobile

> Cópia do [Honey Troop](https://github.com/pedrobortolanza/honey-troop) (congelado em https://honey-troop.vercel.app) que vai virar uma versão mobile first com banco de dados. Site: https://abelhas-mobile.vercel.app

Jogo de navegador sobre abelhas, feito para caber numa sessão. Você cria, cruza, alimenta e treina um enxame até a Vespa Rainha atacar a colmeia. As abelhas que defenderem bem o seu lar viram uma nova Tropa do Mel. Não há salvamento: se fechar a aba, a partida acaba.

## Como jogar
No celular o jogo roda deitado, e um botão abre a tela cheia na horizontal.

Para rodar no computador: `npm install` e depois `npm run dev`. O build do site (`npm run build`) sai em `dist/`, que é o que a Vercel publica.

Para instalar como app no Android ou no iPhone, veja [docs/app/INSTALAR.md](docs/app/INSTALAR.md).

Onde fica cada parte:

- `index.html`: marcação da página e ícones.
- `src/styles/`: CSS (`base.css` e `ui.css`).
- `public/js/game/`: o jogo, um arquivo por seção (dados, estado, roleta, arena, interface, ilha...), carregados na ordem do número.
- `public/js/models.js` e `public/models/*.glb`: modelos 3D; `public/vendor/three-r147.js`: three.js.
- `public/js/audio.js` e `public/js/cutscene.js`: sons e cutscenes.
- `android/` e `ios/`: projetos do app (Capacitor), configurados só para paisagem e tela cheia.

- Um botão **Jogar**: a partida tem 3 atos de 12 minutos, cada um com um chefe (General Vespa, Vespa Rainha e Imperatriz do Ninho). Vencendo, você segue para o próximo ato.
- **Roleta do Enxame**: toda abelha vem da roleta (giro grátis a cada 3 min, fichas, mel ou geleia real, com garantia de Épica e Lendária). Repetidas fazem sua abelha subir de nível. Na Arena todo passo é uma batalha. A roleta abre como caixa, em carrossel, e a loja tem tesouros novos.
- Colmeias produzem mel. As flores (Margarida, Girassol, Rosa e Lótus) dão néctar para alimentar as abelhas.
- Tipos de abelha: Fogo, Água, Flor, Deserto, Elétrica, Gelo, Veneno, Sombra e Luz. Cada tipo tem seu mel.
- As formas mudam com a raridade: Operária, Guardiã, Guerreira e Soberana. A chefe é a Vespa Rainha.

## Cada partida é única
- **Prado sorteado:** 3 tipos nascem no prado. Eles ficam liberados desde o início e produzem 25% mais mel. A flor nativa dá 50% mais néctar.
- **Rainha:** você escolhe 1 entre 3 rainhas, cada uma com uma vantagem e uma desvantagem.
- **Relíquias:** a cada 300 s o relógio para e você escolhe 1 relíquia entre 3. Os efeitos se somam.
- **Estação:** Primavera, Verão, Estação das Chuvas ou Inverno. Muda a economia e fortalece as abelhas de um tipo.
- **Inimigo da partida:** Formigas, Vespas, Besouros ou Mariposas invadem duas vezes. Defenda ou sofra o saque.
- **Mutações:** 35% dos ovos nascem com uma mutação (Gulosa, Robusta, Ferrão de Aço, Brilhante, Preguiçosa ou Sortuda).
- **Caminho da Arena:** cada etapa da liga oferece 3 caminhos: Luta, Elite, Tesouro, Treino ou Mistério.

Lore e cutscenes ficam em `lore/`. Os créditos estão em `CREDITOS.md`.
