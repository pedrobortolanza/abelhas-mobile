/* CUTSCENE-START: cópia de lore/cutscene.js (lore e cutscenes). Para atualizar, substitua o conteúdo até CUTSCENE-END. */
/* Honey Troop: cutscenes da lore da Tropa do Mel.
 * Módulo autossuficiente: injeta o próprio CSS, desenha tudo em <canvas> (sem imagens, sem emojis).
 * Uso: Cutscene.play('abertura', { modo: 'padrao' }).then(r => ...)
 * Texto canônico da história: lore/HISTORIA.md
 */
(function (global) {
  'use strict';

  // ---------- Cores dos nove tipos de abelha ----------
  const EL = {
    fogo: '#ff6a2b', agua: '#3aa8ff', flor: '#ff7ac0', deserto: '#d9a35a', eletrica: '#ffe14a',
    gelo: '#a8eeff', veneno: '#8fe04a', sombra: '#9a5cff', luz: '#fff3b0',
  };
  const NOVE = Object.keys(EL).map((k) => EL[k]);

  // ---------- Personagens ----------
  const QUEM = {
    narrador: { nome: '', cor: '#ffd25c' },
    melina: { nome: 'Vovó Melina', cor: '#7ff0d0' },
    vespa: { nome: 'Vespa Rainha', cor: '#ff5a4a' },
  };

  // ---------- Roteiros ----------
  // palco: cenário do canvas. quem: personagem. texto: fala ({tempo} e {onda} são trocados).
  // flash: clarão branco na entrada. tremor: 0..1 sacode a câmera. som: [efeito, opções] do audio.js.
  // so / exceto: 'infinito' mostra a cena só no modo Infinito / em todos menos o Infinito.
  // titulo: cartão de título no lugar da caixa de fala.
  const ROTEIROS = {
    abertura: {
      musica: 'lenda', musicaFim: 'ilha',
      cenas: [
        { palco: 'marDeMel', quem: 'narrador', texto: 'No começo, só havia um mar de mel e o vento quente do verão.' },
        { palco: 'florada', quem: 'narrador', flash: true, som: ['tremor', { intensidade: 0.3 }],
          texto: 'Então brotou a Primeira Flor. Dela subiu a Ilha Favo, e de seu néctar nasceram nove abelhas, uma de cada tipo.' },
        { palco: 'tropa', quem: 'narrador',
          texto: 'As melhores abelhas que já existiram formaram a Tropa do Mel. Travaram muitas batalhas e viraram heróis.' },
        { palco: 'sombra', quem: 'narrador',
          texto: 'A maior delas foi contra a Vespa Rainha. A Tropa a expulsou para além do mar de mel, e ela jurou voltar.' },
        { palco: 'zumbido', quem: 'melina', tremor: 0.25, som: ['tremor', { intensidade: 0.5 }],
          texto: 'Ouviu esse zumbido? O enxame dela está vindo. A velha Tropa se foi, e minhas asas já não voam como antes.' },
        { palco: 'ovo', quem: 'melina',
          texto: 'Esta é a Roleta do Enxame. Cada abelha da velha Tropa saiu dela, e ela nunca parou de girar, esperando uma nova colmeia.' },
        { palco: 'ilha', quem: 'melina',
          texto: 'A Rainha não vem sozinha. Na frente vem o General Vespa, e atrás de todas vive quem manda nelas: a Imperatriz do Ninho.' },
        { palco: 'ilha', quem: 'melina',
          texto: 'A Ilha Favo já foi o lar dos maiores heróis. Se você defender este lar, ele volta a ser da Tropa do Mel.' },
        { palco: 'titulo', titulo: 'Honey Troop', sub: 'A Tropa do Mel', dur: 3.2 },
      ],
    },
    sonho: {
      musica: 'lenda', musicaFim: 'ilha',
      cenas: [
        { palco: 'ninho', quem: 'melina',
          texto: 'No fundo do Ninho de Papel, a Vespa Rainha ainda hiberna. Dizem que só os campeões chegam vivos até lá.' },
        { palco: 'ninho', quem: 'melina', texto: 'Uma ferroada dada durante o sono nunca sara. Ela vai acordar lembrando de você.' },
      ],
    },
    despertar: {
      musica: 'invasao',
      cenas: [
        { palco: 'zumbido', quem: 'narrador', tremor: 1, rachas: 1, som: ['tremor', { intensidade: 1 }],
          texto: 'O céu escurece. Um zumbido grave cobre a Ilha Favo inteira.' },
        { palco: 'olhos', quem: 'narrador', som: ['despertar'], texto: 'No horizonte, dois olhos de mil facetas se acendem.' },
        { palco: 'vespa', quem: 'vespa', tremor: 0.5, flash: true,
          texto: 'TANTO TEMPO LONGE DO MEU MEL. A Tropa do Mel acabou, e esta colmeia agora é minha.' },
        { palco: 'vespa', quem: 'melina', texto: 'É agora, Tropa! Cada favo que você ergueu vai ser posto à prova.' },
      ],
    },
    despertarOnda: {
      musica: 'invasao',
      cenas: [
        { palco: 'zumbido', quem: 'narrador', tremor: 0.9, rachas: 1, som: ['tremor', { intensidade: 1 }],
          texto: 'Ataque {onda}. O enxame volta pelo mar de mel.' },
        { palco: 'vespa', quem: 'vespa', tremor: 0.5, flash: true, som: ['despertar'],
          texto: 'Você me expulsou. Eu voltei com mais ferrões, e com mais fome.' },
        { palco: 'vespa', quem: 'melina', texto: 'Ela voltou mais forte. Mas esta colmeia também cresceu.' },
      ],
    },
    atoChefe: {
      musica: 'invasao',
      cenas: [
        { palco: 'zumbido', quem: 'narrador', tremor: 0.9, rachas: 1, som: ['tremor', { intensidade: 1 }],
          texto: 'O céu escurece de novo, e um zumbido diferente cobre a Ilha Favo.' },
        { palco: 'vespa', quem: 'vespa', tremor: 0.5, flash: true, som: ['despertar'],
          texto: 'Aqui fala {chefe}. Esta colmeia vai ser do meu enxame.' },
        { palco: 'vespa', quem: 'melina', texto: 'Os heróis de antes também tremeram diante delas. E venceram mesmo assim.' },
      ],
    },
    atoVencido: {
      musica: 'lenda', musicaFim: 'ilha',
      cenas: [
        { palco: 'vitoria', quem: 'narrador', texto: '{chefe} recua para além do mar de mel. Mas o zumbido continua no horizonte.' },
        { palco: 'ilha', quem: 'melina', texto: 'Isso foi só uma parte do enxame. Além do mar de mel, {proximo} já está a caminho.' },
      ],
    },
    ondaVencida: {
      musica: 'lenda', musicaFim: 'ilha',
      cenas: [
        { palco: 'vitoria', quem: 'narrador', texto: 'A Vespa Rainha recua para além do mar de mel, mas o zumbido não some de vez.' },
        { palco: 'ilha', quem: 'melina', texto: 'Ela vai voltar. Uma vespa nunca esquece o mel que perdeu.' },
      ],
    },
    vitoria: {
      musica: 'lenda',
      cenas: [
        { palco: 'vitoria', quem: 'narrador', flash: true, texto: 'A Vespa Rainha foge pelo mar de mel, e o enxame vai junto. A Ilha Favo brilha nas nove cores.' },
        { palco: 'vitoria', quem: 'vespa', texto: 'Essa colmeia... tem ferrão demais...' },
        { palco: 'amanhecer', quem: 'melina', texto: 'Você defendeu o lar como os heróis de antes. De hoje em diante, sua colmeia é da Tropa do Mel.' },
        { palco: 'titulo', titulo: 'Tropa do Mel', sub: 'Uma nova geração de heróis', dur: 3 },
      ],
    },
    derrota: {
      musica: 'lenda',
      cenas: [
        { palco: 'derrota', quem: 'vespa', tremor: 0.3, texto: 'Todo esse mel... agora é meu.' },
        { palco: 'derrota', quem: 'melina', texto: 'A ferroada que você deixou nela não sara. A próxima colmeia vai saber onde mirar.' },
      ],
    },
    semDefesa: {
      musica: 'lenda',
      cenas: [
        { palco: 'vazio', quem: 'narrador', texto: 'A Vespa Rainha chegou e encontrou os favos vazios. Ninguém ficou para defender a colmeia.' },
      ],
    },
  };

  const TEMPO_MODO = { atos: '12 minutos', rapido: '10 minutos', padrao: '20 minutos', longa: '30 minutos', infinito: '15 minutos' };

  // ---------- CSS ----------
  // Paleta: chocolate e âmbar, com verde-água para a Vovó Melina (sem exagerar no amarelo).
  const CSS = `
.cs-root{--bar:min(9vh,64px);--ink:#2a1608;position:fixed;inset:0;z-index:2147483000;background:#0a0503;overflow:hidden;
  user-select:none;-webkit-user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent;
  font-family:"Nunito",system-ui,sans-serif;color:#fff;cursor:pointer;opacity:0;transition:opacity .5s}
.cs-root.on{opacity:1}
.cs-root canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.cs-bar{position:absolute;left:0;right:0;height:var(--bar);background:#000;transition:transform .7s cubic-bezier(.2,.8,.2,1);z-index:2}
.cs-bar.t{top:0;transform:translateY(-100%)} .cs-bar.b{bottom:0;transform:translateY(100%)}
.cs-root.on .cs-bar{transform:none}
.cs-fade{position:absolute;inset:0;background:#000;opacity:1;transition:opacity .45s;pointer-events:none;z-index:3}
.cs-flash{position:absolute;inset:0;background:#fff8e8;opacity:0;pointer-events:none;z-index:4}
.cs-flash.go{animation:csflash .7s ease-out}
@keyframes csflash{0%{opacity:.95}100%{opacity:0}}
.cs-skip{position:absolute;top:calc(var(--bar) + 12px);right:calc(16px + env(safe-area-inset-right,0px));z-index:6;
  font-family:"Lilita One","Trebuchet MS",sans-serif;font-size:1rem;color:#fff;padding:8px 16px 8px 14px;border:2px solid var(--ink);
  border-radius:12px;cursor:pointer;display:flex;align-items:center;gap:8px;
  background:linear-gradient(180deg,#a8754a 0%,#7a4a28 45%,#4e2c14 100%);text-shadow:0 2px 0 rgba(0,0,0,.45);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.3),inset 0 -3px 0 rgba(0,0,0,.22),0 4px 0 var(--ink),0 7px 10px rgba(0,0,0,.35)}
.cs-skip:hover{filter:brightness(1.12)} .cs-skip:active{transform:translateY(3px);box-shadow:0 1px 0 var(--ink)}
.cs-skip i{display:inline-block;width:0;height:0;border-left:7px solid #fff;border-top:6px solid transparent;border-bottom:6px solid transparent;margin-right:-4px}
.cs-skip:focus-visible{outline:3px solid #ffc25c;outline-offset:3px}
.cs-box{position:absolute;left:50%;bottom:calc(var(--bar) + 18px);transform:translate(-50%,20px);
  width:min(880px,calc(100% - 32px - env(safe-area-inset-left,0px) - env(safe-area-inset-right,0px)));z-index:5;
  display:flex;gap:16px;align-items:flex-end;opacity:0;transition:opacity .35s,transform .35s}
.cs-box.on{opacity:1;transform:translate(-50%,0)}
.cs-port{flex:none;width:104px;height:104px;border-radius:50%;border:3px solid var(--ink);overflow:hidden;
  box-shadow:0 0 0 3px #e9a640,0 6px 0 var(--ink),0 10px 18px rgba(0,0,0,.5);background:#3a2214}
.cs-port svg{width:100%;height:100%;display:block}
.cs-panel{position:relative;flex:1;min-height:104px;padding:20px 22px 18px;border:3px solid var(--ink);border-radius:16px;
  background:linear-gradient(180deg,rgba(92,54,30,.96) 0%,rgba(58,32,18,.97) 100%);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.16),inset 0 -4px 0 rgba(0,0,0,.25),0 6px 0 var(--ink),0 12px 24px rgba(0,0,0,.5)}
.cs-name{position:absolute;top:-17px;left:16px;font-family:"Lilita One","Trebuchet MS",sans-serif;font-size:1.05rem;padding:3px 14px;
  border:2px solid var(--ink);border-radius:10px;background:linear-gradient(180deg,#ffd27a,#e99a2e 55%,#b8621a);text-shadow:0 2px 0 #6a3205;
  box-shadow:0 3px 0 var(--ink)}
.cs-name.vespa{background:linear-gradient(180deg,#ff8a7a,#d8302a 55%,#6a0f1a);text-shadow:0 2px 0 #3a0610}
.cs-name.melina{background:linear-gradient(180deg,#9af2d8,#2fb89a 55%,#167a6a);text-shadow:0 2px 0 #0b4a40}
.cs-text{font-size:clamp(1rem,2.3vw,1.22rem);font-weight:700;line-height:1.45;text-shadow:0 2px 0 rgba(0,0,0,.4);min-height:2.9em}
.cs-panel.narr{background:linear-gradient(180deg,rgba(18,10,6,.82),rgba(18,10,6,.9));border-color:rgba(233,166,64,.55);box-shadow:none}
.cs-panel.narr .cs-text{font-style:italic;text-align:center;color:#ffe6bf}
.cs-panel.vespa{background:linear-gradient(180deg,rgba(74,16,22,.96),rgba(40,8,14,.97))}
.cs-panel.vespa .cs-text{color:#ffd2c8;letter-spacing:.3px}
.cs-more{position:absolute;right:16px;bottom:10px;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;
  border-top:10px solid #e9a640;opacity:0;animation:csbob .9s ease-in-out infinite}
.cs-more.on{opacity:1}
@keyframes csbob{50%{transform:translateY(4px)}}
.cs-dots{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(var(--bar) / 2 - 5px);z-index:6;display:flex;gap:7px}
.cs-dots b{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.25);border:1px solid rgba(0,0,0,.5);transition:background .3s}
.cs-dots b.on{background:#e9a640}
.cs-title{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
  opacity:0;transform:scale(.92);transition:opacity .8s,transform 1.4s cubic-bezier(.2,.8,.2,1);pointer-events:none;text-align:center;padding:0 16px}
.cs-title.on{opacity:1;transform:none}
.cs-title h1{margin:0;font-family:"Lilita One","Trebuchet MS",sans-serif;font-weight:400;font-size:clamp(2.2rem,min(9vw,17vh),5.6rem);line-height:1;
  color:#ffc84a;text-shadow:0 5px 0 #2a1608,3px 0 0 #2a1608,-3px 0 0 #2a1608,0 -3px 0 #2a1608,0 0 40px rgba(255,170,60,.55)}
.cs-title p{margin:0;font-family:"Lilita One","Trebuchet MS",sans-serif;font-size:clamp(1rem,min(3.4vw,6vh),1.8rem);color:#bff2e2;
  text-shadow:0 3px 0 #2a1608,2px 0 0 #2a1608,-2px 0 0 #2a1608}
@media (max-width:600px){.cs-port{width:64px;height:64px}.cs-panel{min-height:88px;padding:18px 14px 16px}.cs-box{gap:10px}}
/* celular deitado: pouca altura, então tudo encolhe para o cenário continuar visível */
@media (max-height:500px){
  .cs-root{--bar:min(7vh,28px)}
  .cs-box{bottom:calc(var(--bar) + 8px);gap:10px;width:min(820px,calc(100% - 24px - env(safe-area-inset-left,0px) - env(safe-area-inset-right,0px)))}
  .cs-port{width:58px;height:58px;box-shadow:0 0 0 2px #e9a640,0 4px 0 var(--ink)}
  .cs-panel{min-height:0;padding:14px 14px 10px;border-width:2px;border-radius:12px}
  .cs-name{top:-13px;font-size:.9rem;padding:1px 10px}
  .cs-text{font-size:clamp(.86rem,3.6vh,1.02rem);line-height:1.35;min-height:2.7em}
  .cs-skip{top:calc(var(--bar) + 6px);font-size:.88rem;padding:5px 12px 5px 10px;border-radius:10px}
  .cs-dots{display:none}
}
/* v8.2: acabamento de cinema na caixa de fala, no retrato e no título */
.cs-bar{background:linear-gradient(180deg,#000,#0a0503)}
.cs-bar.b{background:linear-gradient(0deg,#000,#0a0503)}
.cs-panel{background:
  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='48' viewBox='0 0 28 48'%3E%3Cpath d='M14 1 L27 8.5 L27 23.5 L14 31 L1 23.5 L1 8.5 Z M14 31 L14 48' fill='none' stroke='%23ffd27a' stroke-opacity='.07' stroke-width='1.5'/%3E%3C/svg%3E"),
  linear-gradient(180deg,rgba(104,62,32,.95) 0%,rgba(54,30,16,.97) 100%);
  border-color:#2a1608;box-shadow:inset 0 0 0 2px rgba(255,200,110,.28),inset 0 2px 0 rgba(255,255,255,.18),inset 0 -6px 14px rgba(0,0,0,.35),0 6px 0 var(--ink),0 16px 34px rgba(0,0,0,.6),0 0 40px rgba(255,170,60,.12);
  backdrop-filter:blur(3px)}
.cs-panel.vespa{background:
  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='48' viewBox='0 0 28 48'%3E%3Cpath d='M14 1 L27 8.5 L27 23.5 L14 31 L1 23.5 L1 8.5 Z M14 31 L14 48' fill='none' stroke='%23ff6a5a' stroke-opacity='.08' stroke-width='1.5'/%3E%3C/svg%3E"),
  linear-gradient(180deg,rgba(84,16,24,.95),rgba(36,6,12,.97));box-shadow:inset 0 0 0 2px rgba(255,90,80,.3),0 6px 0 var(--ink),0 16px 34px rgba(0,0,0,.6),0 0 46px rgba(255,40,40,.22)}
.cs-panel.melina{box-shadow:inset 0 0 0 2px rgba(127,240,208,.3),inset 0 2px 0 rgba(255,255,255,.18),0 6px 0 var(--ink),0 16px 34px rgba(0,0,0,.6),0 0 40px rgba(80,220,190,.14)}
.cs-panel.narr{background:linear-gradient(180deg,rgba(14,8,4,.55),rgba(14,8,4,.78));border:0;border-top:1px solid rgba(233,166,64,.5);border-bottom:1px solid rgba(233,166,64,.5);border-radius:0;backdrop-filter:blur(4px)}
.cs-panel.narr .cs-text{font-family:"Lilita One","Trebuchet MS",sans-serif;font-style:normal;font-weight:400;letter-spacing:.3px;color:#ffe9c4;text-shadow:0 2px 8px rgba(0,0,0,.7)}
.cs-port{animation:csport 2.4s ease-in-out infinite}
.cs-panel.vespa ~ .cs-port,.cs-box:has(.vespa) .cs-port{box-shadow:0 0 0 3px #ff5a4a,0 6px 0 var(--ink),0 0 26px rgba(255,50,40,.6)}
.cs-box:has(.melina) .cs-port{box-shadow:0 0 0 3px #7ff0d0,0 6px 0 var(--ink),0 0 22px rgba(80,230,190,.5)}
@keyframes csport{50%{transform:translateY(-3px) rotate(-1.5deg)}}
.cs-box.on .cs-port{animation:csportin .5s cubic-bezier(.2,1.4,.4,1) both, csport 2.4s ease-in-out .5s infinite}
@keyframes csportin{from{transform:scale(.4) rotate(-20deg);opacity:0}}
.cs-name{transform-origin:left bottom;animation:csname .45s cubic-bezier(.2,1.5,.4,1) both}
@keyframes csname{from{transform:scale(.3) rotate(-8deg);opacity:0}}
.cs-title.on h1{animation:cstitle 3.2s ease-in-out infinite}
@keyframes cstitle{50%{transform:scale(1.03);text-shadow:0 5px 0 #2a1608,3px 0 0 #2a1608,-3px 0 0 #2a1608,0 -3px 0 #2a1608,0 0 60px rgba(255,190,80,.85)}}
.cs-title::before{content:"";position:absolute;width:min(70vw,520px);height:min(70vw,520px);border-radius:50%;background:radial-gradient(circle,rgba(255,190,80,.35),rgba(255,190,80,0) 65%);z-index:-1;animation:cspulse 3s ease-in-out infinite}
@keyframes cspulse{50%{transform:scale(1.08);opacity:.8}}
@media (prefers-reduced-motion:reduce){.cs-flash.go{animation:none}.cs-more{animation:none}.cs-port,.cs-name,.cs-title h1,.cs-title::before{animation:none!important}}
`;

  // ---------- Retratos (SVG desenhado, sem imagem externa) ----------
  const RETRATO = {
    melina: `<svg viewBox="0 0 100 100"><defs><radialGradient id="csMb" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#58c8b0"/><stop offset="1" stop-color="#14403e"/></radialGradient>
<radialGradient id="csMf" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#f2c060"/><stop offset="1" stop-color="#c47e22"/></radialGradient></defs>
<rect width="100" height="100" fill="url(#csMb)"/>
<path d="M30 30 C26 18 20 12 14 10 M70 30 C74 18 80 12 86 10" stroke="#2a1608" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<circle cx="14" cy="10" r="4.5" fill="#2a1608"/><circle cx="86" cy="10" r="4.5" fill="#2a1608"/>
<ellipse cx="22" cy="70" rx="14" ry="22" fill="#e6f4ff" opacity=".55" transform="rotate(-25 22 70)"/>
<ellipse cx="78" cy="70" rx="14" ry="22" fill="#e6f4ff" opacity=".35" transform="rotate(25 78 70)"/>
<path d="M18 104 C20 78 34 68 50 68 C66 68 80 78 82 104Z" fill="#f0b448"/>
<path d="M22 84 C34 80 66 80 78 84 L80 94 C66 90 34 90 20 94Z" fill="#2a1608"/>
<path d="M36 70 C42 76 58 76 64 70 L62 80 C56 84 44 84 38 80Z" fill="#c8372e"/>
<path d="M50 78 l5 3 v6 l-5 3 l-5 -3 v-6Z" fill="#ffd36a" stroke="#7a4a14" stroke-width="1.2"/>
<circle cx="50" cy="45" r="26" fill="url(#csMf)"/>
<path d="M26 40 C30 26 40 20 50 20 C60 20 70 26 74 40 C66 34 58 32 50 32 C42 32 34 34 26 40Z" fill="#7a4a20" opacity=".5"/>
<circle cx="40" cy="46" r="7.5" fill="#2a1608"/><circle cx="60" cy="46" r="7.5" fill="#2a1608"/>
<circle cx="38" cy="43.5" r="2.2" fill="#fff"/><circle cx="58" cy="43.5" r="2.2" fill="#fff"/>
<circle cx="40" cy="46" r="10" fill="none" stroke="#e9e6f2" stroke-width="2"/><circle cx="60" cy="46" r="10" fill="none" stroke="#e9e6f2" stroke-width="2"/>
<path d="M50 46 h0" stroke="#e9e6f2" stroke-width="2"/><path d="M49 45 q1 -2 2 0" stroke="#e9e6f2" stroke-width="2" fill="none"/>
<path d="M31 33 q8 -4 14 1 M55 34 q6 -5 14 -1" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M43 59 q7 4 14 0" stroke="#5a2a10" stroke-width="2.2" fill="none" stroke-linecap="round"/>
<circle cx="31" cy="55" r="3.5" fill="#e8805a" opacity=".55"/><circle cx="69" cy="55" r="3.5" fill="#e8805a" opacity=".55"/>
</svg>`,
    vespa: `<svg viewBox="0 0 100 100"><defs><radialGradient id="csVb" cx=".5" cy=".6" r=".7"><stop offset="0" stop-color="#7a1820"/><stop offset="1" stop-color="#160608"/></radialGradient>
<radialGradient id="csVo" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#ffb07a"/><stop offset=".45" stop-color="#e0302a"/><stop offset="1" stop-color="#5a0610"/></radialGradient>
<pattern id="csVf" width="5" height="4.4" patternUnits="userSpaceOnUse"><path d="M1.25 0 h2.5 l1.25 2.2 l-1.25 2.2 h-2.5 l-1.25 -2.2Z" fill="none" stroke="#2a0408" stroke-width=".5" opacity=".6"/></pattern></defs>
<rect width="100" height="100" fill="url(#csVb)"/>
<path d="M38 28 C30 16 22 10 12 12 M62 28 C70 16 78 10 88 12" stroke="#120408" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M22 104 C24 82 36 74 50 74 C64 74 76 82 78 104Z" fill="#1a080c"/>
<path d="M28 92 C40 88 60 88 72 92 L74 100 C60 96 40 96 26 100Z" fill="#d8402a"/>
<path d="M18 50 C18 30 32 22 50 22 C68 22 82 30 82 50 C82 66 68 78 50 80 C32 78 18 66 18 50Z" fill="#1d0a0e"/>
<path d="M36 64 C40 58 60 58 64 64 L58 72 C54 68 46 68 42 72Z" fill="#e0a030"/>
<ellipse cx="34" cy="46" rx="13" ry="17" fill="url(#csVo)" transform="rotate(-12 34 46)"/>
<ellipse cx="66" cy="46" rx="13" ry="17" fill="url(#csVo)" transform="rotate(12 66 46)"/>
<ellipse cx="34" cy="46" rx="13" ry="17" fill="url(#csVf)" transform="rotate(-12 34 46)"/>
<ellipse cx="66" cy="46" rx="13" ry="17" fill="url(#csVf)" transform="rotate(12 66 46)"/>
<path d="M28 38 l10 6 M72 38 l-10 6" stroke="#160408" stroke-width="4" stroke-linecap="round"/>
<ellipse cx="30" cy="40" rx="3" ry="4" fill="#ffd8b0" opacity=".7"/><ellipse cx="62" cy="40" rx="3" ry="4" fill="#ffd8b0" opacity=".7"/>
<path d="M40 74 C38 82 44 86 48 82 M60 74 C62 82 56 86 52 82" stroke="#e0a030" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M30 24 L32 10 L40 18 L50 6 L60 18 L68 10 L70 24 Z" fill="#e8b84a" stroke="#6a3a08" stroke-width="1.5"/>
<circle cx="50" cy="15" r="2.6" fill="#c8202a"/><circle cx="38" cy="20" r="1.8" fill="#c8202a"/><circle cx="62" cy="20" r="1.8" fill="#c8202a"/>
</svg>`,
  };

  // ---------- Utilidades de desenho ----------
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  const lerp = (a, b, k) => a + (b - a) * k;
  function rnd(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }
  const hash = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };

  function ceu(c, w, h, stops) {
    const g = c.createLinearGradient(0, 0, 0, h);
    stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  }
  function estrelas(c, w, h, t, n, alpha) {
    for (let i = 0; i < n; i++) {
      const x = hash(i, 1) * w, y = hash(i, 2) * h * 0.6, tw = 0.5 + 0.5 * Math.sin(t * (1 + hash(i, 3) * 3) + i);
      c.globalAlpha = alpha * (0.3 + 0.7 * tw); c.fillStyle = '#fff';
      c.fillRect(x, y, 1.6, 1.6);
    }
    c.globalAlpha = 1;
  }
  // Mar de mel: âmbar escuro e espesso (ondas lentas e largas), para não ficar amarelo demais.
  const MEL_DIA = ['#b8661c', '#4a2008', 'rgba(255,214,150,.38)'];
  const MEL_NOITE = ['#6a3410', '#1a0904', 'rgba(255,190,110,.22)'];
  const MEL_SANGUE = ['#5a1a0c', '#140404', 'rgba(255,120,80,.2)'];
  function mar(c, w, h, y0, t, cores) {
    const g = c.createLinearGradient(0, y0, 0, h);
    g.addColorStop(0, cores[0]); g.addColorStop(1, cores[1]);
    c.fillStyle = g; c.fillRect(0, y0, w, h - y0);
    for (let k = 0; k < 4; k++) {
      const yy = y0 + 8 + k * (h - y0) / 4.5, amp = 2 + k * 1.6, len = 110 + k * 50;
      c.beginPath(); c.moveTo(0, yy);
      for (let x = 0; x <= w; x += 12) c.lineTo(x, yy + Math.sin(x / len + t * (0.35 + k * 0.12) + k) * amp);
      c.strokeStyle = cores[2] || 'rgba(255,230,180,.2)'; c.lineWidth = 2 + k * 0.8; c.globalAlpha = 0.55 - k * 0.1; c.stroke();
    }
    // brilhos grossos de mel
    for (let i = 0; i < 10; i++) {
      const x = (hash(i, 11) * w + t * 6) % w, y = y0 + 6 + hash(i, 12) * (h - y0) * 0.8, a = 0.25 + 0.25 * Math.sin(t * 1.5 + i);
      c.globalAlpha = a; c.fillStyle = cores[2] || 'rgba(255,230,180,.3)';
      c.beginPath(); c.ellipse(x, y, 14 + hash(i, 13) * 18, 2, 0, 0, TAU); c.fill();
    }
    c.globalAlpha = 1;
  }
  function nuvem(c, x, y, s, cor) {
    c.fillStyle = cor; c.beginPath();
    [[0, 0, 1], [0.9, -0.3, 0.8], [1.8, 0, 0.9], [-0.9, 0.1, 0.7], [0.4, 0.35, 0.9], [1.3, 0.35, 0.8]].forEach(([dx, dy, r]) => {
      c.moveTo(x + dx * 40 * s + r * 40 * s, y + dy * 40 * s); c.arc(x + dx * 40 * s, y + dy * 40 * s, r * 40 * s, 0, TAU);
    });
    c.fill();
  }
  function nuvens(c, w, h, t, cor, n, yMax, vel) {
    for (let i = 0; i < n; i++) {
      const s = 0.8 + hash(i, 5) * 1.4, v = (vel || 8) * (0.5 + hash(i, 6));
      const x = ((hash(i, 7) * (w + 400) + t * v) % (w + 400)) - 200, y = hash(i, 8) * yMax;
      nuvem(c, x, y, s, cor);
    }
  }
  function brilho(c, x, y, r, cor, a) {
    const g = c.createRadialGradient(x, y, 0, x, y, Math.max(1, r));
    g.addColorStop(0, cor); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.globalAlpha = a == null ? 1 : a; c.fillStyle = g; c.beginPath(); c.arc(x, y, Math.max(1, r), 0, TAU); c.fill(); c.globalAlpha = 1;
  }
  // Partículas: pólen subindo (ou cinza descendo com sobe === false)
  function polen(c, w, h, t, n, cor, sobe) {
    for (let i = 0; i < n; i++) {
      const v = 18 + hash(i, 1) * 50, x = hash(i, 2) * w + Math.sin(t * 0.8 + i) * 24;
      let y = (hash(i, 3) * h - t * v * (sobe === false ? -1 : 1)) % h; if (y < 0) y += h;
      c.globalAlpha = 0.3 + 0.6 * hash(i, 4) * (0.6 + 0.4 * Math.sin(t * 4 + i));
      c.fillStyle = cor; c.beginPath(); c.arc(x, y, 1 + hash(i, 5) * 2.2, 0, TAU); c.fill();
    }
    c.globalAlpha = 1;
  }
  // Largura da ilha na tela: limitada pela largura e pela altura (no celular deitado sobra pouca altura)
  const larg = (w, h, f, max) => Math.min(w * f, max, h * 1.3);
  // Ilha inteira acima da caixa de fala (que cobre o terço de baixo da tela)
  const ilhaLugar = (w, h) => { const lw = larg(w, h, 0.5, 560); return [lw, h * 0.64 - lw / 2 * 0.4]; };
  // Hexágono de "pontas para os lados" com raio r
  function hexPath(c, x, y, r, achat) {
    achat = achat || 1; c.moveTo(x + r, y);
    for (let k = 1; k <= 6; k++) { const a = k / 6 * TAU; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * achat); }
    c.closePath();
  }
  // Grade de favos dentro da área atual (use com clip). cor do traço e preenchimento opcional por célula.
  function favos(c, x0, y0, x1, y1, r, traco, enche) {
    const dx = r * 1.5, dy = r * Math.sqrt(3);
    for (let col = 0, x = x0; x < x1 + r; col++, x += dx) {
      for (let y = y0 + (col % 2 ? dy / 2 : 0); y < y1 + r; y += dy) {
        c.beginPath(); hexPath(c, x, y, r * 0.92);
        if (enche) { const f = enche(col, Math.round(y / dy)); if (f) { c.fillStyle = f; c.fill(); } }
        c.strokeStyle = traco; c.stroke();
      }
    }
  }
  // Flor simples (pétalas em volta de um miolo)
  function flor(c, x, y, r, cor, t, i) {
    const bal = Math.sin(t * 1.6 + i) * 0.15;
    c.save(); c.translate(x, y); c.rotate(bal);
    c.fillStyle = cor;
    for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; c.beginPath(); c.ellipse(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7, r * 0.6, r * 0.42, a, 0, TAU); c.fill(); }
    c.fillStyle = '#5a3210'; c.beginPath(); c.arc(0, 0, r * 0.38, 0, TAU); c.fill();
    c.restore();
  }
  // Colmeia de palha (skep) em cima da ilha
  function colmeia(c, x, y, s, o) {
    c.save(); c.translate(x, y); c.scale(s, s);
    const cores = o.ruina ? ['#8a8070', '#5a5248'] : ['#e2b874', '#a8722e'];
    for (let k = 0; k < 4; k++) {
      const ry = 6, rx = 22 - k * 4.2, yy = -6 - k * 9;
      c.fillStyle = k % 2 ? cores[0] : cores[1]; c.beginPath(); c.ellipse(0, yy, rx, ry + 3, 0, 0, TAU); c.fill();
    }
    c.fillStyle = cores[0]; c.beginPath(); c.arc(0, -38, 7, 0, TAU); c.fill();
    c.fillStyle = 'rgba(30,14,4,.85)'; c.beginPath(); c.ellipse(0, -6, 5, 5, 0, Math.PI, 0); c.lineTo(5, -2); c.lineTo(-5, -2); c.fill();
    if (o.ruina) { c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-10, -30); c.lineTo(-2, -20); c.lineTo(-8, -10); c.stroke(); }
    c.restore();
  }
  // Fundo de dentro da colmeia gigante (como o fundo do jogo): luz de mel, favos enormes e desfocados e bolhas de luz.
  // tom: 'dia' (dourado), 'tarde' (âmbar com rosa), 'perigo' (âmbar escurecendo)
  const TONS_MEL = {
    dia: ['#6a3a12', '#c8801e', '#f6c860', '#ffe6a8'],
    tarde: ['#3a1a20', '#8a3e2a', '#e08a3a', '#ffd08a'],
    perigo: ['#2a1010', '#6a2a18', '#b0582a', '#e8a060'],
  };
  function fundoMel(c, w, h, t, tom) {
    const T = TONS_MEL[tom] || TONS_MEL.dia;
    ceu(c, w, h, T);
    // favos gigantes da parede da colmeia, bem apagados
    c.save(); c.lineWidth = Math.max(3, h * 0.012);
    const r = Math.max(60, h * 0.16), sx = (t * 4) % (r * 3);
    favos(c, -r * 2 - sx, -r, w + r * 2, h * 0.8, r, 'rgba(255,236,190,.07)', (cl, rw) => (hash(cl, rw) < 0.22 ? 'rgba(255,220,150,.05)' : null));
    c.restore();
    // luz vindo do alto
    brilho(c, w * 0.5, -h * 0.1, Math.max(w, h) * 0.75, 'rgba(255,240,200,.55)');
    for (let i = 0; i < 7; i++) {
      c.save(); c.translate(w * (0.2 + i * 0.1), -h * 0.05); c.rotate((i - 3) * 0.12 + Math.sin(t * 0.3 + i) * 0.02);
      const g = c.createLinearGradient(0, 0, 0, h * 0.9); g.addColorStop(0, 'rgba(255,246,214,.16)'); g.addColorStop(1, 'rgba(255,246,214,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(-w * 0.015, 0); c.lineTo(w * 0.015, 0); c.lineTo(w * 0.06, h * 0.9); c.lineTo(-w * 0.06, h * 0.9); c.closePath(); c.fill(); c.restore();
    }
    // bolhas de luz (bokeh) subindo devagar
    for (let i = 0; i < 18; i++) {
      const rr = (0.02 + hash(i, 41) * 0.05) * Math.max(w, h), x = hash(i, 42) * w + Math.sin(t * 0.4 + i) * 20;
      let y = (hash(i, 43) * h * 1.2 - t * (6 + hash(i, 44) * 10)) % (h * 1.2); if (y < -rr) y += h * 1.2;
      brilho(c, x, y, rr, 'rgba(255,236,180,.28)', 0.5 + 0.3 * Math.sin(t + i));
    }
  }
  // A Ilha Favo como ela é no jogo: hexágono com borda de cera dourada pingando mel, chão de favos marrom,
  // caminhos de pedra creme saindo da praça dourada, gramado da fazenda com rio de mel, construções, velas e moitas.
  // o: { vazia (sem construções), ruina (apagada e rachada), perigo 0..1 (brilho vermelho) }
  function ilhaFavo(c, cx, base, lw, t, o) {
    o = o || {};
    const R = lw / 2, k = 0.4, esp = lw * 0.085, top = base - esp, sc = lw / 700, ru = !!o.ruina;
    const PT = (u, v) => [cx + u * R, top + v * R * k];
    const V = []; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; V.push([cx + Math.cos(a) * R, top + Math.sin(a) * R * k]); }
    const C = ru ? { cera: ['#c09a5a', '#8a6a3a', '#5a4428'], borda: '#b8945a', bordaHi: '#e0c48a', chao: '#3a2a1e', chaoHi: '#4a3626', traco: '#22180e', pedra: '#b8ab90', pedraLo: '#7a6e58', grama: ['#6a7a4a', '#4e5c36'], moita: ['#5a6a3a', '#3a4626'], mel: '#9a6a2a' }
      : { cera: ['#ffd25a', '#e8a228', '#a8640e'], borda: '#f6b830', bordaHi: '#ffe48a', chao: '#5a3216', chaoHi: '#6e3e1c', traco: '#34190a', pedra: '#eadcb4', pedraLo: '#b8a47a', grama: ['#7ed05a', '#4aa03a'], moita: ['#5cc04a', '#2e8a34'], mel: '#f0a020' };
    c.save();
    // sombra no mar
    c.fillStyle = 'rgba(20,8,0,.35)'; c.beginPath(); c.ellipse(cx, base + esp * 0.6, R * 1.05, R * k * 0.7, 0, 0, TAU); c.fill();
    // paredes da frente: cera dourada com favos
    [[3, 2], [2, 1], [1, 0]].forEach(([a, b], f) => {
      c.save(); c.beginPath(); c.moveTo(V[a][0], V[a][1]); c.lineTo(V[b][0], V[b][1]); c.lineTo(V[b][0], V[b][1] + esp); c.lineTo(V[a][0], V[a][1] + esp); c.closePath();
      const g = c.createLinearGradient(0, top, 0, top + R * k + esp); g.addColorStop(0, C.cera[0]); g.addColorStop(0.5, C.cera[1]); g.addColorStop(1, C.cera[2]);
      c.fillStyle = g; c.fill(); c.clip();
      c.lineWidth = Math.max(1, 1.4 * sc); favos(c, Math.min(V[a][0], V[b][0]) - 10, Math.min(V[a][1], V[b][1]) - 10, Math.max(V[a][0], V[b][0]) + 10, Math.max(V[a][1], V[b][1]) + esp + 10, lw * 0.016, 'rgba(120,60,6,.45)',
        (cl, rw) => (hash(cl * 7 + f, rw) < 0.25 ? (ru ? 'rgba(50,30,14,.5)' : 'rgba(255,190,60,.55)') : null));
      c.fillStyle = f === 1 ? 'rgba(255,250,220,.08)' : 'rgba(40,16,0,.18)'; c.fillRect(cx - R - 20, top - R, lw + 40, R * 2 + esp);
      c.restore();
    });
    // mel pingando por baixo da cera
    c.fillStyle = C.mel;
    for (let i = 0; i < 16; i++) {
      const f = i % 3, p = hash(i, 21), [a, b] = [[3, 2], [2, 1], [1, 0]][f], x = lerp(V[a][0], V[b][0], 0.06 + p * 0.88), y = lerp(V[a][1], V[b][1], 0.06 + p * 0.88) + esp - 2;
      const len = esp * (0.25 + 0.7 * hash(i, 22)) * (ru ? 0.4 : 1) * (0.92 + 0.08 * Math.sin(t * 1.3 + i)), ww = (3 + hash(i, 23) * 4) * sc + 1.5;
      c.beginPath(); c.moveTo(x - ww, y); c.lineTo(x + ww, y); c.quadraticCurveTo(x + ww * 0.6, y + len * 0.6, x + ww * 0.55, y + len); c.arc(x, y + len, ww * 0.55, 0, Math.PI); c.quadraticCurveTo(x - ww * 0.6, y + len * 0.6, x - ww, y); c.fill();
      c.fillStyle = 'rgba(255,240,190,.5)'; c.beginPath(); c.arc(x - ww * 0.2, y + len - ww * 0.1, ww * 0.18, 0, TAU); c.fill(); c.fillStyle = C.mel;
    }
    // borda dourada do topo
    const hexV = (f) => { c.beginPath(); V.forEach(([x, y], i) => { const X = cx + (x - cx) * f, Y = top + (y - top) * f; i ? c.lineTo(X, Y) : c.moveTo(X, Y); }); c.closePath(); };
    hexV(1); c.fillStyle = C.borda; c.fill(); c.strokeStyle = C.cera[2]; c.lineWidth = Math.max(1.5, 2 * sc); c.stroke();
    hexV(0.985); c.strokeStyle = C.bordaHi; c.lineWidth = Math.max(1, 1.6 * sc); c.stroke();
    // chão de favos (desenhado "deitado": escala vertical k)
    c.save(); hexV(0.9); c.clip();
    c.translate(cx, top); c.scale(1, k);
    c.fillStyle = C.chao; c.fillRect(-R, -R, lw, lw);
    c.lineWidth = Math.max(1.2, 2.2 * sc);
    favos(c, -R, -R, R, R, R * 0.05, C.traco, (cl, rw) => (hash(cl, rw + 9) < 0.3 ? C.chaoHi : null));
    // sombra interna da borda
    const gs = c.createRadialGradient(0, 0, R * 0.55, 0, 0, R * 0.95); gs.addColorStop(0, 'rgba(0,0,0,0)'); gs.addColorStop(1, 'rgba(20,6,0,.45)'); c.fillStyle = gs; c.fillRect(-R, -R, lw, lw);
    // gramado da fazenda com rio de mel (na frente)
    const fx0 = -R * 0.36, fx1 = R * 0.36, fy0 = R * 0.34, fy1 = R * 0.8;
    c.fillStyle = C.cera[1]; c.fillRect(fx0 - 4 * sc, fy0 - 4 * sc, fx1 - fx0 + 8 * sc, fy1 - fy0 + 8 * sc);
    c.fillStyle = C.grama[1]; c.fillRect(fx0, fy0, fx1 - fx0, fy1 - fy0);
    c.fillStyle = C.grama[0]; for (let i = 0; i < 8; i += 2) c.fillRect(fx0 + (fx1 - fx0) * i / 8, fy0, (fx1 - fx0) / 8, fy1 - fy0);
    c.fillStyle = C.mel; c.beginPath(); c.moveTo(fx0, fy0 + R * 0.05);
    for (let x = fx0; x <= fx1; x += 6) c.lineTo(x, fy0 + R * 0.05 + Math.sin(x / 18 + t) * 2);
    for (let x = fx1; x >= fx0; x -= 6) c.lineTo(x, fy0 + R * 0.11 + Math.sin(x / 18 + t) * 2);
    c.fill();
    c.fillStyle = 'rgba(255,240,180,.55)'; for (let i = 0; i < 6; i++) { const x = fx0 + ((i / 6 + t * 0.05) % 1) * (fx1 - fx0); c.fillRect(x, fy0 + R * 0.075, 10 * sc, 2 * sc); }
    if (!o.vazia) { // canteiros
      c.fillStyle = ru ? '#4a3a26' : '#6a3e18'; c.strokeStyle = ru ? '#3a2a18' : '#a8742a'; c.lineWidth = 2 * sc;
      [-0.26, -0.12].forEach((u) => { c.beginPath(); c.rect(u * R, fy0 + R * 0.18, R * 0.12, R * 0.18); c.fill(); c.stroke(); });
    }
    // caminhos de pedra saindo da praça
    const cam = [[-90, 0.78], [-148, 0.78], [-32, 0.78], [168, 0.72], [12, 0.72], [90, 0.34]];
    cam.forEach(([ang, len]) => {
      const a = ang / 180 * Math.PI, ca = Math.cos(a), sa = Math.sin(a), wd = R * 0.085;
      c.save(); c.rotate(a);
      c.fillStyle = C.pedraLo; c.beginPath(); c.roundRect ? c.roundRect(R * 0.12, -wd / 2, R * (len - 0.12), wd, wd / 2) : c.rect(R * 0.12, -wd / 2, R * (len - 0.12), wd); c.fill();
      c.fillStyle = C.pedra;
      const st = wd * 0.42;
      for (let d = R * 0.14; d < R * len - st * 0.5; d += st * 1.05) for (const off of [-0.24, 0.24]) {
        const j = hash(d | 0, off > 0 ? 1 : 2);
        c.beginPath(); c.ellipse(d + (off > 0 ? st * 0.5 : 0) + j * 2, off * wd, st * 0.48, st * 0.46 + j, 0, 0, TAU); c.fill();
      }
      c.restore();
    });
    // praça dourada no centro
    c.fillStyle = ru ? '#8a6a3a' : '#e88a28'; c.beginPath(); c.arc(0, 0, R * 0.17, 0, TAU); c.fill();
    c.fillStyle = ru ? '#a8885a' : '#f6c050'; c.beginPath(); c.arc(0, 0, R * 0.14, 0, TAU); c.fill();
    c.strokeStyle = ru ? '#6a5030' : '#ffe08a'; c.lineWidth = 3 * sc; c.beginPath(); c.arc(0, 0, R * 0.105, 0, TAU); c.stroke();
    c.restore();
    // o que fica em pé na ilha, desenhado de trás para frente
    const itens = [];
    const per = (n, f) => { for (let i = 0; i < n; i++) { const p = i / n * 6, e = Math.floor(p), q = p - e, A = V[e], B = V[(e + 1) % 6]; f(cx + (lerp(A[0], B[0], q) - cx) * 0.95, top + (lerp(A[1], B[1], q) - top) * 0.95, i); } };
    per(30, (x, y, i) => { const tp = i % 5; if (ru && i % 2) return; itens.push({ y, d: () => (tp === 1 || tp === 4 ? vela(c, x, y, sc, t, i, ru) : moita(c, x, y, sc * (0.8 + hash(i, 5) * 0.5), C.moita, i)) }); });
    if (!o.vazia) {
      const pos = (u, v) => PT(u, v);
      itens.push({ y: pos(0, -0.62)[1], d: () => torre(c, ...pos(0, -0.62), sc, t, ru) });
      itens.push({ y: pos(-0.5, -0.36)[1], d: () => barraca(c, ...pos(-0.5, -0.36), sc, ru) });
      itens.push({ y: pos(0.52, -0.38)[1], d: () => roleta(c, ...pos(0.52, -0.38), sc, t, ru) });
      itens.push({ y: pos(0.66, 0.08)[1], d: () => lab(c, ...pos(0.66, 0.08), sc, t, ru) });
      itens.push({ y: pos(-0.66, 0.06)[1], d: () => torreAsc(c, ...pos(-0.66, 0.06), sc, t, ru) });
      itens.push({ y: pos(0, 0)[1] + 1, d: () => estatua(c, ...pos(0, 0), sc, t, ru) });
      [[0.28, 0.02], [-0.3, 0.12], [0.44, 0.42], [-0.5, 0.44], [0.16, -0.3]].forEach(([u, v], i) => itens.push({ y: pos(u, v)[1], d: () => colmeia(c, ...pos(u, v), sc * 0.9, o) }));
    }
    itens.sort((a, b) => a.y - b.y).forEach((it) => it.d());
    if (o.perigo) {
      c.beginPath(); c.moveTo(V[3][0], V[3][1]); c.lineTo(V[4][0], V[4][1]); c.lineTo(V[5][0], V[5][1]); c.lineTo(V[0][0], V[0][1]);
      [0, 1, 2, 3].forEach((i) => c.lineTo(V[i][0], V[i][1] + esp)); c.closePath();
      c.fillStyle = `rgba(200,30,20,${0.32 * o.perigo})`; c.fill();
    }
    c.restore();
    return top;
  }
  // ---- peças da ilha (s = escala; o desenho fica em pé no ponto x, y) ----
  function moita(c, x, y, s, cor, i) {
    c.save(); c.translate(x, y); c.scale(s, s);
    [[-7, -6, 8], [7, -6, 8], [0, -12, 9], [0, -4, 8]].forEach(([dx, dy, r], q) => {
      const g = c.createRadialGradient(dx - 3, dy - 4, 1, dx, dy, r); g.addColorStop(0, q === 2 ? '#a8f080' : cor[0]); g.addColorStop(1, cor[1]);
      c.fillStyle = g; c.beginPath(); c.arc(dx, dy, r, 0, TAU); c.fill();
    });
    if (i % 3 === 0) { c.fillStyle = ['#ff8ab0', '#fff0a0', '#c0a0ff'][i % 9 / 3 | 0]; [[-6, -10], [5, -13], [2, -5]].forEach(([dx, dy]) => { c.beginPath(); c.arc(dx, dy, 1.8, 0, TAU); c.fill(); }); }
    c.restore();
  }
  function vela(c, x, y, s, t, i, ru) {
    c.save(); c.translate(x, y); c.scale(s, s);
    const hh = 18 + hash(i, 7) * 10;
    c.fillStyle = ru ? '#b0a68a' : '#fff0c0'; c.fillRect(-3.5, -hh, 7, hh);
    c.fillStyle = 'rgba(160,110,40,.35)'; c.fillRect(1.5, -hh, 2, hh);
    c.fillStyle = ru ? '#b0a68a' : '#fff0c0'; c.beginPath(); c.ellipse(0, -hh, 3.5, 1.5, 0, 0, TAU); c.fill();
    if (!ru) { const fl = 1 + Math.sin(t * 9 + i) * 0.15; brilho(c, 0, -hh - 5, 14, 'rgba(255,200,90,.6)'); c.fillStyle = '#ffd040'; c.beginPath(); c.ellipse(0, -hh - 5, 2.4, 5 * fl, 0, 0, TAU); c.fill(); c.fillStyle = '#fff8d0'; c.beginPath(); c.ellipse(0, -hh - 4, 1, 2.2, 0, 0, TAU); c.fill(); }
    c.restore();
  }
  function torre(c, x, y, s, t, ru) { // a Arena: torre de pedra com telhados dourados
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = ru ? '#7a7466' : '#9aa0aa';
    [[-46, -18, 22, 26], [26, -16, 20, 22]].forEach(([dx, dy, w, h]) => { c.beginPath(); c.ellipse(dx + w / 2, dy + h * 0.6, w * 0.7, h * 0.5, 0, 0, TAU); c.fill(); }); // pedras
    const corpo = (dx, w, h) => {
      const g = c.createLinearGradient(dx - w / 2, 0, dx + w / 2, 0); g.addColorStop(0, ru ? '#6a665c' : '#7a8290'); g.addColorStop(0.4, ru ? '#9a948a' : '#c0c6d0'); g.addColorStop(1, ru ? '#4a463e' : '#5a606c');
      c.fillStyle = g; c.fillRect(dx - w / 2, -h, w, h);
      c.strokeStyle = 'rgba(30,30,40,.35)'; c.lineWidth = 1; for (let yy = -h + 8; yy < 0; yy += 8) { c.beginPath(); c.moveTo(dx - w / 2, yy); c.lineTo(dx + w / 2, yy); c.stroke(); }
      for (let q = -w / 2; q < w / 2; q += 8) c.fillRect(dx + q, -h - 5, 5, 5);
    };
    corpo(-22, 18, ru ? 36 : 52); corpo(22, 18, ru ? 30 : 48); corpo(0, 30, ru ? 50 : 82);
    if (!ru) {
      const tel = (dx, yy, w) => { c.fillStyle = '#f2b830'; c.beginPath(); c.moveTo(dx - w / 2 - 3, yy); c.lineTo(dx, yy - w * 1.1); c.lineTo(dx + w / 2 + 3, yy); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(dx - w / 2 - 3, yy); c.lineTo(dx, yy - w * 1.1); c.lineTo(dx - 2, yy); c.fill(); };
      tel(-22, -57, 18); tel(22, -53, 18); tel(0, -87, 30);
      c.strokeStyle = '#5a4020'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, -120); c.lineTo(0, -134); c.stroke();
      c.fillStyle = '#e03a2a'; c.beginPath(); c.moveTo(0, -134); c.lineTo(12 + Math.sin(t * 4) * 2, -130); c.lineTo(0, -126); c.fill();
      c.fillStyle = '#ffd860'; [[-6, -60], [6, -60], [0, -40]].forEach(([dx, dy]) => { c.beginPath(); c.arc(dx, dy, 3, Math.PI, 0); c.lineTo(dx + 3, dy + 6); c.lineTo(dx - 3, dy + 6); c.fill(); });
    } else { c.strokeStyle = '#2a2620'; c.lineWidth = 2; c.beginPath(); c.moveTo(-10, -50); c.lineTo(-2, -36); c.lineTo(-8, -22); c.stroke(); }
    c.fillStyle = '#2a1a10'; c.beginPath(); c.arc(0, -10, 7, Math.PI, 0); c.lineTo(7, 0); c.lineTo(-7, 0); c.fill();
    c.restore();
  }
  function barraca(c, x, y, s, ru) { // Mercado: toldo listrado
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = ru ? '#5a4a36' : '#8a5a2a'; c.fillRect(-26, -22, 52, 22);
    c.fillStyle = ru ? '#3a3024' : '#5a3418'; c.fillRect(-28, -2, 56, 4);
    for (let q = 0; q < 6; q++) { c.fillStyle = q % 2 ? (ru ? '#c8bca8' : '#fff4e0') : (ru ? '#8a5a4a' : '#e0402a'); c.beginPath(); c.moveTo(-30 + q * 10, -40); c.lineTo(-20 + q * 10, -40); c.lineTo(-18 + q * 10, -26); c.quadraticCurveTo(-23 + q * 10, -22, -28 + q * 10, -26); c.closePath(); c.fill(); }
    c.fillStyle = ru ? '#6a5a40' : '#f0a020'; [[-14, -6], [0, -6], [14, -6]].forEach(([dx, dy]) => { c.beginPath(); c.arc(dx, dy, 5, 0, TAU); c.fill(); });
    c.restore();
  }
  function roleta(c, x, y, s, t, ru) { // Roleta do Enxame
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = ru ? '#5a2a24' : '#d02a2a'; c.beginPath(); c.ellipse(0, -4, 26, 9, 0, 0, TAU); c.fill();
    c.fillStyle = ru ? '#6a5a4a' : '#ffd860'; c.fillRect(-3, -40, 6, 34);
    c.save(); c.translate(0, -50); c.rotate(ru ? 0.3 : t * 1.2);
    for (let q = 0; q < 9; q++) { c.fillStyle = ru ? (q % 2 ? '#7a7060' : '#5a5448') : NOVE[q]; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 22, q / 9 * TAU, (q + 1) / 9 * TAU); c.closePath(); c.fill(); }
    c.restore();
    c.strokeStyle = ru ? '#6a5a4a' : '#ffd860'; c.lineWidth = 4; c.beginPath(); c.arc(0, -50, 23, 0, TAU); c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(0, -50, 4, 0, TAU); c.fill();
    c.restore();
  }
  function lab(c, x, y, s, t, ru) { // Laboratório: cúpula de vidro com vapor
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = ru ? '#4a4038' : '#6a4a3a'; c.fillRect(-22, -14, 44, 14);
    const g = c.createRadialGradient(-6, -30, 2, 0, -18, 26); g.addColorStop(0, ru ? 'rgba(200,200,190,.5)' : 'rgba(220,250,255,.9)'); g.addColorStop(1, ru ? 'rgba(90,90,80,.6)' : 'rgba(90,160,200,.7)');
    c.fillStyle = g; c.beginPath(); c.arc(0, -14, 20, Math.PI, 0); c.fill();
    if (!ru) { c.fillStyle = '#b060ff'; c.beginPath(); c.arc(-6, -20, 4 + Math.sin(t * 3), 0, TAU); c.fill(); c.fillStyle = '#40e0a0'; c.beginPath(); c.arc(6, -18, 3, 0, TAU); c.fill(); for (let q = 0; q < 3; q++) brilho(c, 4 + q * 3, -40 - ((t * 14 + q * 8) % 24), 6, 'rgba(255,255,255,.6)'); }
    c.restore();
  }
  function torreAsc(c, x, y, s, t, ru) { // Torre da Ascensão: plataforma com cristal
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = ru ? '#6a5a48' : '#e8c070'; c.beginPath(); c.ellipse(0, -3, 24, 8, 0, 0, TAU); c.fill();
    c.fillStyle = ru ? '#4a3e30' : '#7a4a2a'; c.fillRect(-14, -28, 28, 24);
    c.fillStyle = ru ? '#3a3026' : '#5a3418'; c.beginPath(); c.moveTo(-17, -28); c.lineTo(0, -38); c.lineTo(17, -28); c.fill();
    if (!ru) { brilho(c, 0, -50, 20, 'rgba(220,170,255,.7)'); c.fillStyle = '#d0a0ff'; c.beginPath(); c.moveTo(0, -62 + Math.sin(t * 2) * 2); c.lineTo(5, -50); c.lineTo(0, -40); c.lineTo(-5, -50); c.closePath(); c.fill(); }
    c.restore();
  }
  function estatua(c, x, y, s, t, ru) { // estátua dourada da abelha no meio da praça
    c.save(); c.translate(x, y); c.scale(s, s);
    if (!ru) brilho(c, 0, -20, 40, 'rgba(255,220,120,.55)');
    c.fillStyle = ru ? '#7a6040' : '#c88a20'; c.beginPath(); hexPath(c, 0, -4, 18, 0.45); c.fill();
    c.fillStyle = ru ? '#9a7a50' : '#f6c040'; c.fillRect(-12, -16, 24, 10); c.beginPath(); hexPath(c, 0, -16, 12, 0.45); c.fill();
    c.restore();
    abelha(c, x, y - 30 * s, s * 0.42, ru ? 0 : t, { cor: ru ? '#8a7a5a' : '#f6c040', dourada: !ru, asa: ru ? 0 : 0.2 });
  }
  // Abelha chibi (como as do jogo): cabeça grande, olhos brilhantes, corpinho redondo listrado.
  // s=1 ≈ 64 px. o: { cor (listras do tipo), dir (1 ou -1), asa (fase), medalha, dourada }
  function abelha(c, x, y, s, t, o) {
    o = o || {};
    const cor = o.cor || '#f6c040', dir = o.dir || 1, bat = Math.sin((o.asa != null ? o.asa : t) * 38), ouro = !!o.dourada;
    c.save(); c.translate(x, y); c.scale(s * dir, s);
    // asas de trás
    const asa = (ax, ay, rx, ry, rot, fase) => {
      c.save(); c.translate(ax, ay); c.rotate(rot - fase * 0.35); c.scale(1, 0.55 + 0.45 * Math.abs(fase));
      const g = c.createLinearGradient(0, -ry * 2, 0, 0); g.addColorStop(0, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(190,230,255,.45)');
      c.fillStyle = g; c.strokeStyle = 'rgba(120,150,190,.7)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(0, -ry, rx, ry, 0, 0, TAU); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(150,180,220,.5)'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(rx * 0.3, -ry, 0, -ry * 1.8); c.stroke();
      c.restore();
    };
    asa(-6, -12, 9, 14, -0.5, bat);
    // corpinho
    const gb = c.createRadialGradient(-14, -6, 2, -10, 2, 24); gb.addColorStop(0, ouro ? '#fff2a0' : '#fff6c8'); gb.addColorStop(0.35, cor); gb.addColorStop(1, ouro ? '#9a5a08' : 'rgba(110,60,10,1)');
    c.save(); c.beginPath(); c.ellipse(-10, 4, 20, 17, -0.1, 0, TAU); c.fillStyle = gb; c.fill(); c.clip();
    c.fillStyle = ouro ? '#8a5208' : '#3a1e0a'; [[-22, 6], [-11, 7]].forEach(([sx, sw]) => { c.beginPath(); c.ellipse(sx, 4, sw * 0.6, 20, -0.1, 0, TAU); c.fill(); });
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-12, -7, 11, 4, -0.15, 0, TAU); c.fill();
    c.restore();
    c.strokeStyle = ouro ? '#7a4a08' : '#3a1e0a'; c.lineWidth = 2; c.beginPath(); c.ellipse(-10, 4, 20, 17, -0.1, 0, TAU); c.stroke();
    c.fillStyle = ouro ? '#7a4a08' : '#3a1e0a'; c.beginPath(); c.moveTo(-29, 6); c.lineTo(-37, 9); c.lineTo(-28, 11); c.fill();
    // patinhas
    c.strokeStyle = ouro ? '#7a4a08' : '#3a1e0a'; c.lineWidth = 2.4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-4, 19); c.lineTo(-6, 24); c.moveTo(4, 18); c.lineTo(4, 24); c.stroke();
    // cabeça grande
    const gh = c.createRadialGradient(10, -12, 2, 14, -4, 20); gh.addColorStop(0, ouro ? '#fff2a0' : '#fff2c0'); gh.addColorStop(0.5, ouro ? '#f6c040' : '#ffd458'); gh.addColorStop(1, ouro ? '#a86a10' : '#d08a20');
    c.fillStyle = gh; c.beginPath(); c.arc(14, -4, 17, 0, TAU); c.fill(); c.lineWidth = 2; c.stroke();
    // antenas
    c.lineWidth = 1.8; c.beginPath(); c.moveTo(12, -19); c.quadraticCurveTo(10, -32, 4, -34); c.moveTo(20, -18); c.quadraticCurveTo(26, -30, 32, -30); c.stroke();
    c.fillStyle = ouro ? '#7a4a08' : '#3a1e0a'; c.beginPath(); c.arc(4, -34, 3, 0, TAU); c.arc(32, -30, 3, 0, TAU); c.fill();
    if (!ouro) {
      // olhos grandes com brilho
      [[11, -4], [23, -4]].forEach(([ex, ey], q) => {
        c.fillStyle = '#2a140a'; c.beginPath(); c.ellipse(ex, ey, q ? 4 : 4.6, 5.6, 0, 0, TAU); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(ex - 1.4, ey - 2.2, 1.9, 0, TAU); c.fill(); c.beginPath(); c.arc(ex + 1.2, ey + 1.8, 0.9, 0, TAU); c.fill();
      });
      c.fillStyle = 'rgba(255,120,110,.5)'; c.beginPath(); c.ellipse(7, 5, 3.4, 2, 0, 0, TAU); c.ellipse(27, 5, 2.8, 2, 0, 0, TAU); c.fill();
      c.strokeStyle = '#5a2a10'; c.lineWidth = 1.5; c.beginPath(); c.arc(17, 4, 2.6, 0.2, Math.PI - 0.2); c.stroke();
    }
    // asa da frente
    asa(2, -14, 8, 13, 0.25, -bat);
    if (o.medalha) { c.fillStyle = '#ffd36a'; c.strokeStyle = '#7a4a14'; c.lineWidth = 1.2; c.beginPath(); hexPath(c, -2, 12, 4.5); c.fill(); c.stroke(); }
    c.restore();
  }
  // A Vespa Rainha de frente, asas abertas. s = escala (1 ≈ 520 px de envergadura). bate: fase da asa.
  // o: { olhos 0..1|false, cor (silhueta), rugido 0..1, semBrilho }
  // v8.3: Vespa desenhada com muito mais detalhe (quitina com brilho, placas no abdômen, pernas em segmentos
  // com espinhos, olhos compostos com facetas e ocelos, mandíbulas serrilhadas, asas com nervuras).
  // o.tipo: 'rainha' (padrão), 'general' (elmo e ombreiras) ou 'imperatriz' (branca e roxa, coroa alta).
  // o.cor: silhueta de uma cor só (para sombras e enxames), sem detalhes.
  const VESPA_PAL = {
    rainha:     { base: '#1c080c', mid: '#3a1218', hi: '#8a3a40', band: '#d8402a', bandHi: '#ff8a4a', bandLo: '#7a140c', eye: [255, 70, 40], wing: [255, 190, 170], crown: ['#fff0a8', '#e8b84a', '#8a5408'], gem: '#e0202a', mand: '#e0a030', glow: '#ff3d2e' },
    general:    { base: '#1a0e08', mid: '#3a2210', hi: '#8a5a30', band: '#f29a1a', bandHi: '#ffd060', bandLo: '#8a4a08', eye: [255, 60, 30], wing: [255, 200, 150], crown: ['#e8eef8', '#8a96aa', '#3a4250'], gem: '#e0202a', mand: '#c8c8d0', glow: '#ff6a1e' },
    imperatriz: { base: '#140a22', mid: '#2e1a4a', hi: '#7a5aa8', band: '#ece4ff', bandHi: '#ffffff', bandLo: '#8a78b8', eye: [210, 80, 255], wing: [220, 190, 255], crown: ['#fff6c0', '#ffcc33', '#8a5a00'], gem: '#b030ff', mand: '#ffcc33', glow: '#b84cff' },
  };
  let VESPA_TIPO = null; // visual do chefe da cena que está tocando (vem de opts.vars.tipo)
  function vespa(c, x, y, s, bate, o) {
    o = o || {};
    const tq = o.tipo || VESPA_TIPO, sil = !!o.cor, tipo = VESPA_PAL[tq] ? tq : 'rainha', P = VESPA_PAL[tipo];
    const base = o.cor || P.base, borda = o.borda || P.glow;
    const quit = (cx, cy, rx, ry, c0, c1, c2) => { // gradiente de quitina: brilho em cima à esquerda
      if (sil) return base;
      const g = c.createRadialGradient(cx - rx * 0.35, cy - ry * 0.45, Math.max(1, Math.min(rx, ry) * 0.08), cx, cy, Math.max(rx, ry) * 1.1);
      g.addColorStop(0, c0); g.addColorStop(0.45, c1); g.addColorStop(1, c2); return g;
    };
    c.save(); c.translate(x, y); c.scale(s, s);
    c.lineJoin = 'round'; c.lineCap = 'round';
    // ---- asas: par da frente grande e par de trás menor, com nervuras e borda escura ----
    const ab = Math.sin(bate * 3) * 0.14;
    [-1, 1].forEach((l) => {
      c.save(); c.scale(l, 1);
      [[8, -6, 0.16 + ab, 190, 50, 0.75], [0, -26, -0.34 - ab, 262, 66, 1]].forEach(([ox, oy, rot, len, lar, k]) => {
        c.save(); c.translate(28 + ox, oy); c.rotate(rot);
        c.beginPath(); c.moveTo(0, -4);
        c.bezierCurveTo(len * 0.25, -lar * 0.62, len * 0.78, -lar * 0.62, len, -lar * 0.12);
        c.bezierCurveTo(len * 1.02, lar * 0.22, len * 0.7, lar * 0.5, len * 0.38, lar * 0.42);
        c.bezierCurveTo(len * 0.18, lar * 0.36, len * 0.06, lar * 0.2, 0, 4); c.closePath();
        if (sil) { c.fillStyle = 'rgba(20,6,10,.75)'; c.fill(); }
        else {
          const [r, g2, b] = P.wing;
          const gr = c.createLinearGradient(0, 0, len, 0);
          gr.addColorStop(0, `rgba(${r},${g2},${b},${0.5 * k})`); gr.addColorStop(0.5, `rgba(${r},${g2},${b},${0.26 * k})`); gr.addColorStop(1, `rgba(${r},${g2},${b},${0.12 * k})`);
          c.fillStyle = gr; c.fill();
          // reflexo furta-cor
          const ir = c.createLinearGradient(0, -lar / 2, len * 0.6, lar / 2);
          ir.addColorStop(0, 'rgba(120,220,255,0)'); ir.addColorStop(0.5, 'rgba(160,120,255,.14)'); ir.addColorStop(1, 'rgba(255,120,200,0)');
          c.fillStyle = ir; c.fill();
          c.strokeStyle = 'rgba(40,8,12,.75)'; c.lineWidth = 2.4; c.stroke();
          // nervuras
          c.strokeStyle = 'rgba(40,8,12,.55)'; c.lineWidth = 1.4; c.beginPath();
          c.moveTo(2, 0); c.quadraticCurveTo(len * 0.5, -lar * 0.3, len * 0.97, -lar * 0.14);
          c.moveTo(len * 0.2, -lar * 0.05); c.quadraticCurveTo(len * 0.5, lar * 0.1, len * 0.82, lar * 0.2);
          c.moveTo(len * 0.32, -lar * 0.22); c.lineTo(len * 0.42, lar * 0.38);
          c.moveTo(len * 0.55, -lar * 0.36); c.lineTo(len * 0.62, lar * 0.34);
          c.moveTo(len * 0.74, -lar * 0.34); c.lineTo(len * 0.8, lar * 0.18);
          c.stroke();
          // marca escura perto da ponta (estigma)
          c.fillStyle = 'rgba(60,10,16,.55)'; c.beginPath(); c.ellipse(len * 0.7, -lar * 0.3, len * 0.05, lar * 0.06, 0.2, 0, TAU); c.fill();
        }
        c.restore();
      });
      c.restore();
    });
    if (!o.semBrilho) { c.shadowColor = borda; c.shadowBlur = 24; }
    // ---- pernas: três pares em segmentos, com joelho, espinhos e garras ----
    [-1, 1].forEach((l) => {
      [[22, 8, 66, 30, 88, 82, 80, 104], [26, 20, 78, 58, 80, 118, 70, 140], [20, 30, 62, 92, 56, 158, 46, 182]].forEach(([a, b, k1x, k1y, k2x, k2y, px, py]) => {
        const seg = (x0, y0, x1, y1, w0, w1) => {
          const ang = Math.atan2(y1 - y0, x1 - x0), nx = Math.sin(ang), ny = -Math.cos(ang);
          c.beginPath(); c.moveTo(x0 + nx * w0, y0 + ny * w0); c.lineTo(x1 + nx * w1, y1 + ny * w1); c.lineTo(x1 - nx * w1, y1 - ny * w1); c.lineTo(x0 - nx * w0, y0 - ny * w0); c.closePath();
          c.fillStyle = sil ? base : (() => { const g = c.createLinearGradient(x0 + nx * w0, y0 + ny * w0, x0 - nx * w0, y0 - ny * w0); g.addColorStop(0, P.hi); g.addColorStop(0.4, P.mid); g.addColorStop(1, base); return g; })();
          c.fill();
        };
        seg(l * a, b, l * k1x, k1y, 7, 5.5); seg(l * k1x, k1y, l * k2x, k2y, 5, 3.6); seg(l * k2x, k2y, l * px, py, 3.2, 2);
        c.fillStyle = sil ? base : P.mid; [[k1x, k1y, 6.5], [k2x, k2y, 4.8]].forEach(([jx, jy, jr]) => { c.beginPath(); c.arc(l * jx, jy, jr, 0, TAU); c.fill(); });
        if (!sil) { // espinhos e garra
          c.strokeStyle = base; c.lineWidth = 2;
          c.beginPath(); for (let q = 1; q <= 3; q++) { const tx = lerp(k1x, k2x, q / 4), ty = lerp(k1y, k2y, q / 4); c.moveTo(l * tx, ty); c.lineTo(l * (tx + 7), ty - 4); } c.stroke();
          c.beginPath(); c.moveTo(l * px, py); c.lineTo(l * (px + 7), py + 6); c.moveTo(l * px, py); c.lineTo(l * (px - 5), py + 7); c.stroke();
        }
      });
    });
    // ---- abdômen: placas sobrepostas com faixas, brilho de quitina e pelinhos na borda ----
    const AY = 126, ARX = 50, ARY = 90;
    c.save(); c.beginPath(); c.ellipse(0, AY, ARX, ARY, 0, 0, TAU);
    c.fillStyle = quit(0, AY, ARX, ARY, P.hi, P.mid, base); c.fill(); c.shadowBlur = 0; c.clip();
    if (!sil) {
      for (let k = 0; k < 6; k++) {
        const yy = AY - ARY + 22 + k * 28, wv = Math.sqrt(Math.max(0, 1 - ((yy - AY) / ARY) ** 2)) * ARX;
        // placa: borda de baixo curva, sombra embaixo
        c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(0, yy + 14, wv + 4, 9, 0, 0, Math.PI); c.fill();
        if (k > 0 && k < 5) {
          const bg = c.createLinearGradient(-wv, 0, wv, 0); bg.addColorStop(0, P.bandLo); bg.addColorStop(0.32, P.bandHi); bg.addColorStop(0.55, P.band); bg.addColorStop(1, P.bandLo);
          c.fillStyle = bg; c.beginPath(); c.moveTo(-wv - 4, yy - 2); c.quadraticCurveTo(0, yy + 8, wv + 4, yy - 2); c.lineTo(wv + 4, yy + 11); c.quadraticCurveTo(0, yy + 21, -wv - 4, yy + 11); c.closePath(); c.fill();
          // marquinhas escuras em ponta no meio da faixa (típico de vespa)
          c.globalAlpha = 0.75; c.fillStyle = base; c.beginPath(); c.moveTo(-5, yy + 1); c.quadraticCurveTo(0, yy + 9, 5, yy + 1); c.lineTo(0, yy + 12); c.closePath(); c.fill(); c.globalAlpha = 1;
        }
        c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(0, yy + 14, wv, 9, 0, Math.PI * 0.15, Math.PI * 0.85); c.stroke();
      }
      // reflexo comprido
      const rg = c.createLinearGradient(-30, 0, -6, 0); rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(0.5, 'rgba(255,255,255,.22)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = rg; c.beginPath(); c.ellipse(-20, AY - 10, 9, ARY * 0.62, -0.05, 0, TAU); c.fill();
    }
    c.restore();
    if (!sil) { c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(0, AY, ARX, ARY, 0, 0, TAU); c.stroke(); }
    // ferrão brilhante com uma gota de veneno
    c.fillStyle = sil ? base : (() => { const g = c.createLinearGradient(-8, 0, 8, 0); g.addColorStop(0, base); g.addColorStop(0.45, P.hi); g.addColorStop(1, base); return g; })();
    c.beginPath(); c.moveTo(-11, AY + ARY - 8); c.quadraticCurveTo(-3, AY + ARY + 20, 0, AY + ARY + 46); c.quadraticCurveTo(3, AY + ARY + 20, 11, AY + ARY - 8); c.closePath(); c.fill();
    if (!sil) { brilho(c, 0, AY + ARY + 50, 10, `rgba(${P.eye.join(',')},.9)`); c.fillStyle = `rgb(${P.eye.join(',')})`; c.beginPath(); c.ellipse(0, AY + ARY + 51, 3, 4.5, 0, 0, TAU); c.fill(); }
    // ---- cintura e tórax em armadura ----
    if (!o.semBrilho) { c.shadowColor = borda; c.shadowBlur = 18; }
    c.fillStyle = quit(0, 36, 12, 13, P.hi, P.mid, base); c.beginPath(); c.ellipse(0, 36, 12, 14, 0, 0, TAU); c.fill();
    c.fillStyle = quit(0, 0, 44, 38, P.hi, P.mid, base); c.beginPath(); c.ellipse(0, 0, 44, 38, 0, 0, TAU); c.fill();
    c.shadowBlur = 0;
    if (!sil) {
      // pelinhos na borda do tórax
      c.strokeStyle = P.mid; c.lineWidth = 2;
      c.beginPath(); for (let q = 0; q < 26; q++) { const an = Math.PI * 1.05 + q / 25 * Math.PI * 0.9, r0 = 42; c.moveTo(Math.cos(an) * r0, Math.sin(an) * 36); c.lineTo(Math.cos(an) * (r0 + 6), Math.sin(an) * 36 - 4); } c.stroke();
      // placas do tórax e manchas
      c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-30, -14); c.quadraticCurveTo(0, -2, 30, -14); c.moveTo(0, -2); c.lineTo(0, 30); c.stroke();
      c.fillStyle = P.band; c.beginPath(); c.ellipse(-17, -8, 7, 12, 0.45, 0, TAU); c.ellipse(17, -8, 7, 12, -0.45, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.ellipse(-14, -20, 12, 5, -0.3, 0, TAU); c.fill();
    }
    if (tipo === 'general' && !sil) { // ombreiras de metal com espinhos
      [-1, 1].forEach((l) => {
        const g = c.createLinearGradient(l * 20, -30, l * 60, 10); g.addColorStop(0, P.crown[0]); g.addColorStop(0.5, P.crown[1]); g.addColorStop(1, P.crown[2]);
        c.fillStyle = g; c.beginPath(); c.ellipse(l * 38, -16, 22, 15, l * 0.4, 0, TAU); c.fill();
        c.strokeStyle = '#1a1e26'; c.lineWidth = 2; c.stroke();
        c.fillStyle = P.crown[1]; c.beginPath(); c.moveTo(l * 44, -28); c.lineTo(l * 62, -46); c.lineTo(l * 52, -22); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = '#d8d8e0'; [[-6, 0], [6, 2]].forEach(([dx, dy]) => { c.beginPath(); c.arc(l * (38 + dx), -16 + dy, 2.2, 0, TAU); c.fill(); });
      });
    }
    // ---- cabeça: formato de escudo, olhos compostos enormes, ocelos, mandíbulas ----
    if (!o.semBrilho) { c.shadowColor = borda; c.shadowBlur = 20; }
    const HY = -62;
    c.fillStyle = quit(0, HY, 48, 40, P.hi, P.mid, base);
    c.beginPath(); c.moveTo(0, HY - 42); c.bezierCurveTo(40, HY - 44, 54, HY - 16, 46, HY + 6); c.bezierCurveTo(38, HY + 28, 16, HY + 40, 0, HY + 44); c.bezierCurveTo(-16, HY + 40, -38, HY + 28, -46, HY + 6); c.bezierCurveTo(-54, HY - 16, -40, HY - 44, 0, HY - 42); c.fill();
    c.shadowBlur = 0;
    if (!sil) {
      // "rosto" amarelo/claro de vespa entre os olhos, em ponta
      c.fillStyle = P.band; c.beginPath(); c.moveTo(0, HY - 18); c.quadraticCurveTo(14, HY + 4, 12, HY + 22); c.quadraticCurveTo(0, HY + 34, -12, HY + 22); c.quadraticCurveTo(-14, HY + 4, 0, HY - 18); c.fill();
      c.fillStyle = base; c.beginPath(); c.moveTo(0, HY - 10); c.lineTo(5, HY + 6); c.lineTo(0, HY + 14); c.lineTo(-5, HY + 6); c.closePath(); c.fill();
    }
    // antenas em cotovelo, segmentadas
    c.strokeStyle = base; c.lineWidth = 5.5;
    [-1, 1].forEach((l) => {
      c.beginPath(); c.moveTo(l * 10, HY - 34); c.lineTo(l * 18, HY - 70); c.quadraticCurveTo(l * 40, HY - 98, l * 78, HY - 96); c.stroke();
      if (!sil) { c.fillStyle = P.mid; for (let q = 0; q < 6; q++) { const tq = q / 6; c.beginPath(); c.arc(lerp(l * 22, l * 76, tq), lerp(HY - 76, HY - 96, Math.sqrt(tq)) - Math.sin(tq * Math.PI) * 8, 2.6, 0, TAU); c.fill(); } }
    });
    // mandíbulas serrilhadas
    [-1, 1].forEach((l) => {
      c.save(); c.scale(l, 1); c.translate(10, HY + 34); c.rotate(o.rugido ? 0.25 * o.rugido : 0.05);
      c.fillStyle = sil ? base : (() => { const g = c.createLinearGradient(0, 0, 20, 20); g.addColorStop(0, P.mand); g.addColorStop(1, base); return g; })();
      c.beginPath(); c.moveTo(0, -4); c.quadraticCurveTo(22, 4, 14, 26); c.lineTo(9, 22); c.lineTo(10, 16); c.lineTo(5, 14); c.lineTo(6, 8); c.lineTo(0, 6); c.closePath(); c.fill();
      if (!sil) { c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 1.5; c.stroke(); }
      c.restore();
    });
    if (o.rugido) brilho(c, 0, HY + 44, 50 * o.rugido, 'rgba(255,90,30,.8)');
    // olhos compostos
    if (o.olhos !== false) {
      const a = o.olhos == null ? 1 : o.olhos, [er, eg, eb] = P.eye;
      [-1, 1].forEach((l) => {
        brilho(c, l * 26, HY - 2, 44, `rgba(${er},${eg},${eb},${0.5 * a})`);
        c.save(); c.translate(l * 26, HY - 2); c.rotate(l * 0.3);
        c.beginPath(); c.moveTo(0, -30); c.bezierCurveTo(l * 18, -28, l * 22, 4, l * 10, 26); c.bezierCurveTo(l * 4, 32, -l * 12, 22, -l * 14, 4); c.bezierCurveTo(-l * 16, -16, -l * 8, -30, 0, -30);
        const g = c.createRadialGradient(-l * 4, -10, 2, 0, 0, 30);
        g.addColorStop(0, `rgba(255,235,200,${a})`); g.addColorStop(0.3, `rgba(${er},${Math.min(255, eg + 80)},${Math.min(255, eb + 40)},${a})`); g.addColorStop(0.7, `rgba(${er},${eg},${eb},${a})`); g.addColorStop(1, `rgba(${er * 0.3 | 0},${eg * 0.1 | 0},${eb * 0.2 | 0},${a})`);
        c.fillStyle = g; c.fill(); c.save(); c.clip(); c.lineWidth = 0.8; favos(c, -22, -32, 22, 32, 3, `rgba(30,0,6,${0.5 * a})`); c.restore();
        // brilho de vidro
        c.fillStyle = `rgba(255,255,255,${0.55 * a})`; c.beginPath(); c.ellipse(-l * 4, -16, 4, 7, -0.3 * l, 0, TAU); c.fill();
        c.restore();
      });
      // sobrancelha em V, bem brava
      c.fillStyle = base; [-1, 1].forEach((l) => { c.beginPath(); c.moveTo(l * 4, HY - 18); c.lineTo(l * 46, HY - 40); c.lineTo(l * 48, HY - 30); c.lineTo(l * 8, HY - 10); c.closePath(); c.fill(); });
      // ocelos (três olhinhos na testa)
      if (!sil) [[0, HY - 30], [-7, HY - 24], [7, HY - 24]].forEach(([ox, oy]) => { brilho(c, ox, oy, 6, `rgba(${er},${eg},${eb},${0.8 * a})`); c.fillStyle = `rgba(255,220,200,${a})`; c.beginPath(); c.arc(ox, oy, 2, 0, TAU); c.fill(); });
    }
    // ---- coroa / elmo ----
    const cr = P.crown;
    if (tipo === 'general' && (!sil || o.coroa)) {
      // elmo com viseira e crista de lâminas vermelhas
      c.fillStyle = sil ? base : (() => { const g = c.createLinearGradient(0, HY - 70, 0, HY - 30); g.addColorStop(0, cr[0]); g.addColorStop(0.5, cr[1]); g.addColorStop(1, cr[2]); return g; })();
      c.beginPath(); c.moveTo(-46, HY - 18); c.bezierCurveTo(-50, HY - 66, 50, HY - 66, 46, HY - 18); c.lineTo(34, HY - 26); c.quadraticCurveTo(0, HY - 40, -34, HY - 26); c.closePath(); c.fill();
      if (!sil) {
        c.strokeStyle = '#141820'; c.lineWidth = 2.5; c.stroke();
        c.fillStyle = '#d8341c'; for (let q = 0; q < 5; q++) { const qx = -16 + q * 8; c.beginPath(); c.moveTo(qx - 4, HY - 54); c.lineTo(qx + (q - 2) * 3, HY - 92 + Math.abs(q - 2) * 10); c.lineTo(qx + 4, HY - 54); c.closePath(); c.fill(); }
        c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.ellipse(-20, HY - 46, 12, 4, -0.4, 0, TAU); c.fill();
        c.strokeStyle = '#7a1010'; c.lineWidth = 3; c.beginPath(); c.moveTo(30, HY - 6); c.lineTo(18, HY + 16); c.stroke(); // cicatriz
      }
    } else if (!sil || o.coroa) {
      const alta = tipo === 'imperatriz' ? 1.5 : 1;
      c.fillStyle = sil ? base : (() => { const g = c.createLinearGradient(0, HY - 40 - 50 * alta, 0, HY - 30); g.addColorStop(0, cr[0]); g.addColorStop(0.5, cr[1]); g.addColorStop(1, cr[2]); return g; })();
      c.beginPath(); c.moveTo(-32, HY - 30);
      const pts = [[-38, HY - 64 * alta], [-24, HY - 48], [-12, HY - 76 * alta], [0, HY - 52], [12, HY - 76 * alta], [24, HY - 48], [38, HY - 64 * alta]];
      if (tipo === 'imperatriz') pts.splice(3, 1, [0, HY - 92 * alta * 0.75]);
      pts.forEach(([px, py]) => c.lineTo(px, py)); c.lineTo(32, HY - 30); c.quadraticCurveTo(0, HY - 38, -32, HY - 30); c.closePath(); c.fill();
      if (!sil) {
        c.strokeStyle = cr[2]; c.lineWidth = 2; c.stroke();
        c.fillStyle = cr[2]; c.fillRect(-32, HY - 38, 64, 6);
        c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.moveTo(-30, HY - 36); c.lineTo(-20, HY - 36); c.lineTo(-30, HY - 56 * alta); c.closePath(); c.fill();
        [[0, HY - 44, 5.5], [-20, HY - 42, 3.8], [20, HY - 42, 3.8]].forEach(([gx, gy, gr]) => { brilho(c, gx, gy, gr * 3, P.gem, 0.6); c.fillStyle = P.gem; c.beginPath(); c.moveTo(gx, gy - gr * 1.3); c.lineTo(gx + gr, gy); c.lineTo(gx, gy + gr * 1.3); c.lineTo(gx - gr, gy); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(gx - gr * 0.3, gy - gr * 0.4, gr * 0.3, 0, TAU); c.fill(); });
        pts.filter((_, q) => q % 2 === 0).forEach(([px, py]) => { c.fillStyle = cr[0]; c.beginPath(); c.arc(px, py, 3.2, 0, TAU); c.fill(); });
      }
    }
    if (tipo === 'imperatriz' && !sil) { // aura roxa em anel atrás da cabeça
      c.save(); c.globalCompositeOperation = 'destination-over';
      c.strokeStyle = 'rgba(190,90,255,.5)'; c.lineWidth = 5; c.beginPath(); c.ellipse(0, HY - 30, 74, 22, 0, 0, TAU); c.stroke();
      c.restore();
    }
    c.restore();
  }
  // Enxame de vespinhas no horizonte. n: quantas. perto 0..1: o quanto já se aproximou.
  function enxame(c, w, h, t, cx, cy, n, perto, cor) {
    const esp = lerp(w * 0.08, w * 0.45, perto), tam = lerp(1.5, 5, perto);
    c.fillStyle = cor || '#1a0608';
    for (let i = 0; i < n; i++) {
      const a = hash(i, 31) * TAU + t * (0.6 + hash(i, 32)), r = Math.sqrt(hash(i, 33)) * esp;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.4 + Math.sin(t * 9 + i) * 2;
      c.beginPath(); c.ellipse(x, y, tam * 1.6, tam, 0, 0, TAU); c.fill();
      c.globalAlpha = 0.35; c.beginPath(); c.ellipse(x, y - tam, tam * 1.2, tam * 0.7 * Math.abs(Math.sin(t * 40 + i)), 0, 0, TAU); c.fill(); c.globalAlpha = 1;
    }
  }
  // Anel com as nove cores dos tipos de abelha (o favo brilhando)
  function anelNove(c, cx, cy, r, t, achat) {
    achat = achat || 1;
    c.save(); c.translate(cx, cy); c.scale(1, achat);
    c.strokeStyle = 'rgba(255,230,170,.5)'; c.lineWidth = 2;
    c.setLineDash([10, 8]); c.lineDashOffset = -t * 20; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke(); c.setLineDash([]);
    NOVE.forEach((cor, i) => {
      const a = i / 9 * TAU + t * 0.15, x = Math.cos(a) * r, y = Math.sin(a) * r;
      brilho(c, x, y, 26, cor, 0.6);
      c.fillStyle = cor; c.strokeStyle = 'rgba(40,20,6,.7)'; c.lineWidth = 2; c.beginPath(); hexPath(c, x, y, 8); c.fill(); c.stroke();
    });
    c.restore();
  }
  // Fundo de favos (parede da chocadeira / ninho)
  function paredeFavos(c, w, h, r, traco, fundo) {
    c.fillStyle = fundo; c.fillRect(0, 0, w, h); c.lineWidth = 2; favos(c, -r, -r, w + r, h + r, r, traco);
  }

  // ---------- Palcos: cada um desenha o cenário no tempo t (segundos desde o início da cena) ----------
  const PALCOS = {
    marDeMel(c, w, h, t) {
      ceu(c, w, h, ['#0b1424', '#1d2a44', '#4a3448']);
      estrelas(c, w, h, t, 70, 0.7);
      const mY = h * 0.6;
      brilho(c, w * 0.5, mY, Math.max(w, h) * 0.45, 'rgba(255,150,70,.32)');
      nuvens(c, w, h, t, 'rgba(30,26,50,.6)', 6, h * 0.3, 10);
      mar(c, w, h, mY, t, MEL_NOITE);
      polen(c, w, h, t, 50, 'rgba(255,214,150,.8)');
    },
    florada(c, w, h, t) {
      ceu(c, w, h, ['#101a34', '#2a3a64', '#6a4a6a']);
      estrelas(c, w, h, t, 60, 0.6);
      const cx = w / 2, mY = h * 0.66, lw = larg(w, h, 0.6, 640);
      brilho(c, cx, mY - 30, Math.max(w, h) * 0.5 * (1 - ease(t / 3) * 0.5), 'rgba(255,220,170,.45)');
      mar(c, w, h, mY, t, MEL_NOITE);
      const sobe = ease((t - 0.3) / 2.2);
      c.save(); c.beginPath(); c.rect(0, 0, w, mY + 8); c.clip();
      const topo = ilhaFavo(c, cx, mY + 6 + (1 - sobe) * h * 0.3, lw, t, { vazia: true });
      c.restore();
      // a Primeira Flor abre no centro
      const abre = ease((t - 0.2) / 1.8), fy = topo - lw * 0.02, fr = lw * 0.09 * abre;
      if (abre > 0) {
        c.strokeStyle = '#3e8d3a'; c.lineWidth = 5; c.beginPath(); c.moveTo(cx, topo + 4); c.lineTo(cx, fy); c.stroke();
        brilho(c, cx, fy, fr * 3, 'rgba(255,200,230,.6)');
        for (let k = 0; k < 9; k++) {
          const a = k / 9 * TAU + t * 0.1;
          c.fillStyle = NOVE[k]; c.beginPath(); c.ellipse(cx + Math.cos(a) * fr * 0.8, fy + Math.sin(a) * fr * 0.5, fr * 0.55, fr * 0.28, a, 0, TAU); c.fill();
        }
        c.fillStyle = '#ffe6a0'; c.beginPath(); c.arc(cx, fy, fr * 0.35, 0, TAU); c.fill();
      }
      // nove gotas de néctar que viram abelhas
      NOVE.forEach((cor, i) => {
        const k = ease((t - 1 - i * 0.08) / 1.8), a = Math.PI + (i + 0.5) / 9 * Math.PI;
        if (k <= 0) return;
        const tx = cx + Math.cos(a) * lw * 0.75, ty = mY - h * 0.2 + Math.sin(a) * h * 0.24 + Math.sin(t * 2 + i) * 6;
        const x = lerp(cx, tx, k), y = lerp(fy, ty, k);
        brilho(c, x, y, 30, cor, 0.8);
        if (k > 0.85) abelha(c, x, y, Math.min(w, h) / 1300, t + i, { cor, dir: x < cx ? -1 : 1 });
        else { c.fillStyle = cor; c.beginPath(); c.arc(x, y, 5, 0, TAU); c.fill(); }
      });
    },
    tropa(c, w, h, t) {
      // lembrança: tons de sépia
      ceu(c, w, h, ['#2a1c12', '#6a4a2e', '#b08a5c']);
      nuvens(c, w, h, t, 'rgba(255,230,190,.12)', 6, h * 0.4, 6);
      const mY = h * 0.72;
      mar(c, w, h, mY, t, ['#7a5230', '#2a180c', 'rgba(255,230,190,.25)']);
      // a vespa fugindo ao longe
      const foge = ease(t / 6);
      vespa(c, lerp(w * 0.82, w * 1.02, foge), lerp(h * 0.3, h * 0.18, foge), Math.min(w, h) / 2400 * (1 - foge * 0.5), t * 3, { cor: '#2a1a12', olhos: 0.5, semBrilho: true, coroa: true });
      // a Tropa do Mel em formação
      const s = Math.min(w, h * 1.4) / 520;
      [[0.3, 0.42, 1.2], [0.18, 0.3, 0.9], [0.2, 0.56, 0.95], [0.08, 0.2, 0.7], [0.08, 0.66, 0.75]].forEach(([fx, fy, z], i) => {
        const cores = ['#e0a050', '#d07040', '#9ab060', '#8aa0c0', '#c08ab0'];
        abelha(c, w * fx + Math.sin(t * 1.2 + i) * 8 + t * 6, h * fy + Math.cos(t * 1.6 + i) * 6, s * z, t + i * 0.3, { cor: cores[i], medalha: true });
      });
      polen(c, w, h, t, 40, 'rgba(255,230,180,.7)');
      // moldura de lembrança
      c.fillStyle = 'rgba(60,36,16,.22)'; c.fillRect(0, 0, w, h);
    },
    sombra(c, w, h, t) {
      ceu(c, w, h, ['#0a0306', '#2a0a12', '#5a1416']);
      const a = ease(t / 2.5);
      vespa(c, w / 2, h * 0.42 + 20, Math.min(w, h * 1.3) / 700, t, { olhos: a, cor: '#120508', coroa: true });
      enxame(c, w, h, t, w / 2, h * 0.45, 70, 0.9, '#0e0306');
      mar(c, w, h, h * 0.86, t, MEL_SANGUE);
      NOVE.forEach((cor, i) => { brilho(c, w * (0.1 + i * 0.1), h * 0.93 + Math.sin(t * 3 + i) * 4, 18, cor, 0.7); });
    },
    zumbido(c, w, h, t, cena) {
      const rach = cena.rachas || 0.35, sangue = rach > 0.6;
      if (sangue) { ceu(c, w, h, ['#1a0610', '#5a1420', '#a03a2a']); nuvens(c, w, h, t, 'rgba(30,8,14,.7)', 6, h * 0.3, 10); } else fundoMel(c, w, h, t, 'perigo');
      const mY = ilhaLugar(w, h)[1] - ilhaLugar(w, h)[0] * 0.05;
      // enxame chegando pelo horizonte
      enxame(c, w, h, t, w * 0.8 - t * 6, mY - h * 0.12, sangue ? 140 : 60, clamp((sangue ? 0.5 : 0.15) + t * 0.03, 0, 1), '#1a0608');
      mar(c, w, h, mY, t, sangue ? MEL_SANGUE : MEL_DIA);
      ilhaFavo(c, w / 2, ilhaLugar(w, h)[1], ilhaLugar(w, h)[0], t, { ruina: sangue, perigo: sangue ? 0.7 + 0.3 * Math.sin(t * 3) : 0.15 });
      polen(c, w, h, t, 40, sangue ? '#ff7a3a' : 'rgba(230,200,170,.8)', false);
    },
    ovo(c, w, h, t) {
      // a velha Roleta do Enxame da Tropa (o id 'ovo' ficou da época da chocadeira)
      fundoMel(c, w, h, t, 'tarde');
      const s = Math.min(w, h * 1.5) / 640, cx = w / 2, cy = h * 0.34, R = 96 * s, gy = h * 0.62;
      c.fillStyle = 'rgba(20,6,0,.4)'; c.beginPath(); c.ellipse(cx, gy + R * 0.12, R * 1.2, R * 0.22, 0, 0, TAU); c.fill();
      // base vermelha com degraus dourados
      const gb = c.createLinearGradient(0, gy - R * 0.2, 0, gy + R * 0.2); gb.addColorStop(0, '#e83a2a'); gb.addColorStop(1, '#7a1010');
      c.fillStyle = gb; c.beginPath(); c.ellipse(cx, gy, R * 0.95, R * 0.2, 0, 0, TAU); c.fill();
      c.fillStyle = '#f6c040'; c.beginPath(); c.ellipse(cx, gy - R * 0.1, R * 0.7, R * 0.14, 0, 0, TAU); c.fill();
      c.fillStyle = '#c88a20'; c.fillRect(cx - 14 * s, cy, 28 * s, gy - R * 0.1 - cy);
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(cx - 10 * s, cy, 6 * s, gy - R * 0.1 - cy);
      brilho(c, cx, cy, R * 1.8, 'rgba(255,220,140,.45)');
      // roda girando devagar
      const gira = t * 0.9 + Math.sin(t * 0.7) * 0.2;
      c.save(); c.translate(cx, cy); c.rotate(gira);
      for (let q = 0; q < 9; q++) {
        const a0 = q / 9 * TAU, a1 = (q + 1) / 9 * TAU, am = (a0 + a1) / 2;
        const g = c.createRadialGradient(0, 0, R * 0.2, 0, 0, R); g.addColorStop(0, '#fff6dc'); g.addColorStop(0.3, NOVE[q]); g.addColorStop(1, 'rgba(0,0,0,.35)');
        c.fillStyle = NOVE[q]; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R, a0, a1); c.closePath(); c.fill();
        c.fillStyle = g; c.globalAlpha = 0.55; c.fill(); c.globalAlpha = 1;
        c.strokeStyle = '#7a4a10'; c.lineWidth = 3 * s; c.stroke();
        // favo com uma abelhinha dentro de cada fatia
        const ix = Math.cos(am) * R * 0.66, iy = Math.sin(am) * R * 0.66;
        c.fillStyle = 'rgba(255,248,224,.85)'; c.strokeStyle = '#7a4a10'; c.lineWidth = 2 * s; c.beginPath(); hexPath(c, ix, iy, 20 * s); c.fill(); c.stroke();
        c.save(); c.translate(ix, iy); c.rotate(-gira); abelha(c, -2 * s, 4 * s, s * 0.42, t + q, { cor: NOVE[q], asa: 0.3 }); c.restore();
      }
      c.restore();
      // aro dourado com luzinhas piscando
      c.lineWidth = 16 * s; c.strokeStyle = '#c88a20'; c.beginPath(); c.arc(cx, cy, R + 6 * s, 0, TAU); c.stroke();
      c.lineWidth = 6 * s; c.strokeStyle = '#ffd860'; c.beginPath(); c.arc(cx, cy, R + 4 * s, 0, TAU); c.stroke();
      for (let q = 0; q < 18; q++) {
        const a = q / 18 * TAU, on = (Math.floor(t * 6) + q) % 3 === 0, lx = cx + Math.cos(a) * (R + 6 * s), ly = cy + Math.sin(a) * (R + 6 * s);
        if (on) brilho(c, lx, ly, 14 * s, 'rgba(255,240,180,.9)');
        c.fillStyle = on ? '#fffbe0' : '#e0a030'; c.beginPath(); c.arc(lx, ly, 4.2 * s, 0, TAU); c.fill();
      }
      // miolo e ponteiro
      const gm = c.createRadialGradient(cx - 8 * s, cy - 8 * s, 2, cx, cy, 30 * s); gm.addColorStop(0, '#fff6c0'); gm.addColorStop(1, '#c88a20');
      c.fillStyle = gm; c.beginPath(); hexPath(c, cx, cy, 28 * s); c.fill(); c.strokeStyle = '#7a4a10'; c.lineWidth = 3 * s; c.stroke();
      c.fillStyle = '#e83a2a'; c.strokeStyle = '#6a0a0a'; c.lineWidth = 2 * s;
      c.beginPath(); c.moveTo(cx - 14 * s, cy - R - 26 * s); c.lineTo(cx + 14 * s, cy - R - 26 * s); c.lineTo(cx, cy - R + 14 * s); c.closePath(); c.fill(); c.stroke();
      // abelhas saindo da roleta
      for (let i = 0; i < 4; i++) {
        const k = ((t * 0.35 + i * 0.25) % 1), ang = -Math.PI / 2 + (i - 1.5) * 0.7;
        const x = cx + Math.cos(ang) * R * lerp(0.6, 2.4, k), y = cy + Math.sin(ang) * R * lerp(0.4, 1.4, k) - k * 40 * s;
        c.globalAlpha = Math.min(1, (1 - k) * 3); brilho(c, x, y, 30 * s, NOVE[(i * 2 + 1) % 9], 0.5);
        abelha(c, x, y, s * lerp(0.4, 0.9, k), t + i, { cor: NOVE[(i * 2 + 1) % 9], dir: Math.cos(ang) < 0 ? -1 : 1 }); c.globalAlpha = 1;
      }
      polen(c, w, h, t, 40, '#ffe0a0');
    },
    ilha(c, w, h, t) {
      fundoMel(c, w, h, t, 'dia');
      const mY = ilhaLugar(w, h)[1] - ilhaLugar(w, h)[0] * 0.05;
      mar(c, w, h, mY, t, MEL_DIA);
      ilhaFavo(c, w / 2, ilhaLugar(w, h)[1], ilhaLugar(w, h)[0], t, {});
      // abelhas voando
      for (let i = 0; i < 5; i++) {
        const x = ((t * (40 + i * 10) + i * 190) % (w + 100)) - 50, y = h * (0.12 + i * 0.06) + Math.sin(t * 3 + i) * 8;
        abelha(c, x, y, Math.min(w, h) / (1100 - i * 80), t + i, { cor: NOVE[i * 2] });
      }
    },
    titulo(c, w, h, t) {
      PALCOS.ilha(c, w, h, t);
      c.fillStyle = 'rgba(20,10,4,.55)'; c.fillRect(0, 0, w, h);
      polen(c, w, h, t, 30, '#ffd890');
    },
    olhos(c, w, h, t) {
      c.fillStyle = '#040102'; c.fillRect(0, 0, w, h);
      enxame(c, w, h, t, w / 2, h * 0.5, 50, 1, 'rgba(60,10,14,.6)');
      const ab = ease((t - 0.6) / 1.6), cx = w / 2, cy = h * 0.42, d = Math.min(w * 0.14, 140), tam = Math.min(w, h) / 7;
      [-1, 1].forEach((l) => {
        const x = cx + l * d;
        brilho(c, x, cy, tam * 2.2, `rgba(255,60,30,${0.5 * ab})`);
        c.save(); c.translate(x, cy); c.rotate(l * 0.25); c.scale(1, Math.max(0.02, ab));
        c.beginPath(); c.ellipse(0, 0, tam * 0.62, tam, 0, 0, TAU);
        const g = c.createRadialGradient(-l * tam * 0.2, -tam * 0.3, 2, 0, 0, tam);
        g.addColorStop(0, '#ffc890'); g.addColorStop(0.5, '#e0302a'); g.addColorStop(1, '#4a0610');
        c.fillStyle = g; c.fill(); c.clip(); c.lineWidth = 1; favos(c, -tam, -tam, tam, tam, tam / 9, 'rgba(30,2,6,.55)');
        c.restore();
      });
    },
    vespa(c, w, h, t) {
      ceu(c, w, h, ['#0a0208', '#3a0a18', '#8a2a20']);
      nuvens(c, w, h, t, 'rgba(20,4,12,.75)', 9, h * 0.4, 22);
      const mY = h * 0.76;
      enxame(c, w, h, t, w / 2, h * 0.4, 120, 1, '#14040a');
      mar(c, w, h, mY, t, MEL_SANGUE);
      const sobe = ease(t / 2.4), s = Math.min(w, h * 1.25) / 640;
      ilhaFavo(c, w / 2, mY + h * 0.06, larg(w, h, 0.78, 760), t, { ruina: true, perigo: 1 });
      vespa(c, w / 2, lerp(-h * 0.3, h * 0.43, sobe), s * 0.92, t, { rugido: t > 1.2 && t < 3 ? 1 : 0.3 });
      polen(c, w, h, t, 70, '#ff6a2a');
    },
    ninho(c, w, h, t) {
      // dentro do Ninho de Papel: camadas cinzentas em espiral e luz roxa
      ceu(c, w, h, ['#140c1a', '#2a1a34', '#3a2a44']);
      c.lineWidth = 3;
      for (let k = 0; k < 14; k++) {
        c.strokeStyle = k % 2 ? 'rgba(160,140,170,.14)' : 'rgba(90,70,100,.2)';
        c.beginPath(); c.ellipse(w / 2, h * 0.5, w * (0.12 + k * 0.05), h * (0.1 + k * 0.045), Math.sin(t * 0.2 + k) * 0.05, 0, TAU); c.stroke();
      }
      for (let i = 0; i < 5; i++) brilho(c, (hash(i, 1) * w + t * 8 * (i % 2 ? 1 : -1) + w) % w, h * (0.3 + hash(i, 2) * 0.5), 150, 'rgba(170,120,255,.16)');
      // a Vespa Rainha hibernando, encolhida num casulo
      const cx = w / 2, cy = h * 0.5, s = Math.min(w, h * 1.4) / 900, resp = 1 + Math.sin(t * 1.1) * 0.02;
      c.save(); c.translate(cx, cy); c.scale(s * resp, s * resp);
      c.shadowColor = '#c08aff'; c.shadowBlur = 30;
      const gc = c.createRadialGradient(-40, -60, 20, 0, 0, 200); gc.addColorStop(0, 'rgba(190,176,200,.75)'); gc.addColorStop(1, 'rgba(90,74,104,.7)');
      c.fillStyle = gc; c.beginPath(); c.ellipse(0, 0, 150, 190, 0, 0, TAU); c.fill();
      c.shadowBlur = 0; c.strokeStyle = 'rgba(80,60,90,.35)'; c.lineWidth = 3;
      for (let k = -4; k <= 4; k++) { c.beginPath(); c.ellipse(0, 0, 150 - Math.abs(k) * 8, 190, 0, -Math.PI / 2 + k * 0.05, Math.PI / 2 + k * 0.05); c.stroke(); }
      c.restore();
      c.save(); c.globalAlpha = 0.6; vespa(c, cx, cy - 40 * s, s * 0.55, 0, { cor: '#1e0e24', olhos: 0.12 + 0.08 * Math.sin(t * 2), coroa: true, semBrilho: true }); c.restore();
      polen(c, w, h, t, 50, '#d8c0ff');
    },
    vitoria(c, w, h, t) {
      fundoMel(c, w, h, t, 'tarde');
      const cx = w / 2, mY = ilhaLugar(w, h)[1] - ilhaLugar(w, h)[0] * 0.05;
      for (let i = 0; i < 12; i++) {
        c.save(); c.translate(cx, mY - 40); c.rotate(-Math.PI / 2 + (i - 5.5) * 0.16 + Math.sin(t * 0.5) * 0.02);
        c.fillStyle = 'rgba(255,240,200,.12)'; c.beginPath(); c.moveTo(0, 0); c.lineTo(-18, -h); c.lineTo(18, -h); c.fill(); c.restore();
      }
      const foge = ease(t / 5);
      vespa(c, lerp(cx, w * 1.15, foge), lerp(h * 0.34, h * 0.08, foge), Math.min(w, h * 1.25) / 760 * (1 - foge * 0.6), t, { olhos: 1 - foge * 0.6 });
      enxame(c, w, h, t, lerp(cx, w * 1.2, foge), lerp(h * 0.36, h * 0.1, foge), 40, 0.6 * (1 - foge), '#1a0608');
      mar(c, w, h, mY, t, MEL_DIA);
      const [lw, ib] = ilhaLugar(w, h);
      const topo = ilhaFavo(c, cx, ib, lw, t, {});
      const fecha = ease((t - 0.8) / 2.5);
      if (fecha > 0) anelNove(c, cx, topo, lerp(lw * 0.8, lw * 0.56, fecha), t * 2, 0.3);
      polen(c, w, h, t, 40, '#fff2c8');
    },
    amanhecer(c, w, h, t) {
      PALCOS.ilha(c, w, h, t);
      brilho(c, w / 2, h * 0.5, Math.max(w, h) * 0.6, 'rgba(255,220,160,.22)');
      NOVE.forEach((cor, i) => {
        const x = ((t * (50 + i * 9) + i * 160) % (w + 200)) - 100, y = h * (0.12 + (i % 4) * 0.08) + Math.sin(t * 2 + i) * 10;
        abelha(c, x, y, Math.min(w, h) / 1500, t + i, { cor, medalha: true });
      });
    },
    derrota(c, w, h, t) {
      ceu(c, w, h, ['#1a0204', '#5a0a10', '#b0301a']);
      nuvens(c, w, h, t, 'rgba(40,6,8,.7)', 8, h * 0.4, 6);
      const mY = h * 0.72;
      enxame(c, w, h, t, w / 2, h * 0.3, 160, 1, '#14040a');
      mar(c, w, h, mY, t, MEL_SANGUE);
      ilhaFavo(c, w / 2, mY + h * 0.06, larg(w, h, 0.78, 760), t, { ruina: true, perigo: 0.8 });
      vespa(c, w / 2, mY - h * 0.38, Math.min(w, h * 1.2) / 700, t * 0.6, { rugido: 0.4 });
      polen(c, w, h, t, 100, 'rgba(200,190,180,.8)', false);
    },
    vazio(c, w, h, t) {
      ceu(c, w, h, ['#202432', '#4a4a5a', '#7a6a6a']);
      const mY = ilhaLugar(w, h)[1] - ilhaLugar(w, h)[0] * 0.05;
      mar(c, w, h, mY, t, ['#5a3e24', '#1a1208', 'rgba(220,200,170,.18)']);
      ilhaFavo(c, w / 2, ilhaLugar(w, h)[1], ilhaLugar(w, h)[0], t, { ruina: true, vazia: true });
      const x = lerp(-w * 0.2, w * 1.2, (t / 7) % 1);
      vespa(c, x, h * 0.12, Math.min(w, h) / 1600, t, { olhos: 1 });
    },
  };

  // ---------- Motor ----------
  let atual = null;
  function injetaCSS() {
    if (document.getElementById('cs-style')) return;
    const st = document.createElement('style'); st.id = 'cs-style'; st.textContent = CSS; document.head.appendChild(st);
    if (!document.querySelector('link[href*="Lilita+One"]')) {
      const l = document.createElement('link'); l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:wght@400;700;800&display=swap';
      document.head.appendChild(l);
    }
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

  function play(id, opts) {
    opts = opts || {};
    const rot = ROTEIROS[id];
    if (!rot) return Promise.reject(new Error('[Cutscene] roteiro desconhecido: ' + id));
    if (atual) atual.fim(true);
    injetaCSS();
    const modo = opts.modo || 'padrao';
    const vars = Object.assign({ tempo: TEMPO_MODO[modo] || '20 minutos', onda: 2 }, opts.vars || {});
    VESPA_TIPO = vars.tipo || null;
    const cenas = rot.cenas.filter((c) => (!c.so || c.so === modo) && (!c.exceto || c.exceto !== modo) && (!c.nao || c.nao !== modo));
    const reduz = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const som = opts.som === false ? null : (opts.som || global.Som || null);
    const sfx = (a) => { try { if (som && a) som.play(a[0], a[1]); } catch (e) { /* som é opcional */ } };

    const root = document.createElement('div');
    root.className = 'cs-root'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Cena da história');
    root.innerHTML = `<canvas></canvas><div class="cs-bar t"></div><div class="cs-bar b"></div>
<div class="cs-title"><h1></h1><p></p></div>
<div class="cs-box"><div class="cs-port"></div><div class="cs-panel"><span class="cs-name"></span><div class="cs-text" aria-live="polite"></div><i class="cs-more"></i></div></div>
<div class="cs-dots">${cenas.map(() => '<b></b>').join('')}</div>
<button class="cs-skip" type="button">Pular <i></i><i></i></button>
<div class="cs-flash"></div><div class="cs-fade"></div>`;
    (opts.container || document.body).appendChild(root);
    const $ = (s) => root.querySelector(s);
    const cv = $('canvas'), c = cv.getContext('2d'), box = $('.cs-box'), port = $('.cs-port'), panel = $('.cs-panel'),
      nome = $('.cs-name'), txt = $('.cs-text'), more = $('.cs-more'), fade = $('.cs-fade'), flash = $('.cs-flash'),
      tit = $('.cs-title'), dots = [...root.querySelectorAll('.cs-dots b')], btn = $('.cs-skip');

    let W = 0, H = 0, dpr = 1, prevA = 0, prevT = 0;
    const prevCv = document.createElement('canvas'), glowCv = document.createElement('canvas'), gc = glowCv.getContext('2d');
    const motes = Array.from({ length: 46 }, (_, k) => ({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 2.4, v: 0.008 + Math.random() * 0.02, ph: Math.random() * 6.3, a: 0.25 + Math.random() * 0.5 }));
    const DARK = { olhos: 1, sombra: 1, vespa: 1, derrota: 1, ninho: 1, zumbido: 0.5, vazio: 0.6 };
    function tamanho() { dpr = Math.min(2, global.devicePixelRatio || 1); W = root.clientWidth; H = root.clientHeight; cv.width = W * dpr; cv.height = H * dpr; }
    tamanho(); global.addEventListener('resize', tamanho);

    let i = -1, cena = null, t0 = 0, digitados = 0, cheio = false, trocando = false, raf = 0, encerrado = false, esperaAte = 0, resolver;
    const VEL = 42; // letras por segundo
    const prom = new Promise((r) => { resolver = r; });

    function textoDa(cn) { return (cn.texto || '').replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m)); }

    function mostra(n) {
      i = n; cena = cenas[i]; t0 = performance.now(); digitados = 0; cheio = false;
      dots.forEach((d, k) => d.classList.toggle('on', k <= i));
      if (cena.flash && !reduz) { flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go'); }
      sfx(cena.som);
      try { if (som && som.cena) som.cena(cena.palco); } catch (e) { /* opcional */ }
      if (cena.titulo) {
        box.classList.remove('on'); tit.querySelector('h1').textContent = cena.titulo; tit.querySelector('p').textContent = cena.sub || '';
        setTimeout(() => tit.classList.add('on'), 200); cheio = true; esperaAte = t0 + (cena.dur || 3) * 1000;
        return;
      }
      tit.classList.remove('on');
      const q = cena.quem || 'narrador', p = QUEM[q];
      panel.className = 'cs-panel' + (q === 'narrador' ? ' narr' : ' ' + q);
      nome.textContent = q === 'vespa' && vars.chefe ? vars.chefe : p.nome; nome.className = 'cs-name ' + q; nome.style.display = p.nome ? '' : 'none';
      port.innerHTML = RETRATO[q] || ''; port.style.display = RETRATO[q] ? '' : 'none';
      if (q === 'vespa') { // retrato desenhado com a mesma vespa da cena (rosto em close)
        port.innerHTML = '<canvas width="208" height="208" style="width:100%;height:100%;display:block"></canvas>';
        const pc = port.firstChild.getContext('2d'), bg = pc.createRadialGradient(104, 120, 10, 104, 104, 150);
        bg.addColorStop(0, '#7a1820'); bg.addColorStop(1, '#160608'); pc.fillStyle = bg; pc.fillRect(0, 0, 208, 208);
        try { vespa(pc, 104, 196, 1.45, 0, { semBrilho: true }); } catch (e) { /* fica o fundo */ }
      }
      txt.textContent = ''; more.classList.remove('on');
      box.classList.add('on');
    }
    function proxima() {
      if (trocando || encerrado) return;
      if (i >= cenas.length - 1) { fim(false); return; }
      // v8.2: troca de cena com dissolve (a cena anterior some por cima da nova), sem piscar preto
      trocando = true; box.classList.remove('on');
      try { prevCv.width = cv.width; prevCv.height = cv.height; prevCv.getContext('2d').drawImage(cv, 0, 0); prevA = 1; prevT = performance.now(); } catch (e) { prevA = 0; }
      setTimeout(() => { if (encerrado) return; mostra(i + 1); trocando = false; }, 260);
    }
    function avancar() {
      if (trocando || encerrado || !cena) return;
      if (!cheio) { digitados = 1e9; return; }
      proxima();
    }
    function fim(pulada) {
      if (encerrado) return; encerrado = true;
      cancelAnimationFrame(raf); global.removeEventListener('resize', tamanho); document.removeEventListener('keydown', tecla, true);
      root.classList.remove('on'); fade.style.opacity = '1';
      if (rot.musicaFim !== undefined && som) try { som.musica(rot.musicaFim); } catch (e) { /* opcional */ }
      setTimeout(() => root.remove(), 520);
      if (atual === ctl) atual = null;
      const r = { id, pulada: !!pulada };
      if (typeof opts.onEnd === 'function') try { opts.onEnd(r); } catch (e) { console.warn(e); }
      resolver(r);
    }
    function tecla(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fim(true); }
      else if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); avancar(); }
      else e.stopPropagation(); // não deixa as teclas do jogo (1-9, P, M...) agirem por trás
    }
    root.addEventListener('pointerdown', (e) => { if (e.target.closest('.cs-skip')) return; e.stopPropagation(); avancar(); });
    root.addEventListener('click', (e) => e.stopPropagation());
    btn.addEventListener('pointerdown', (e) => e.stopPropagation());
    btn.addEventListener('click', (e) => { e.stopPropagation(); fim(true); });
    document.addEventListener('keydown', tecla, true);

    function quadro(now) {
      if (encerrado) return;
      raf = requestAnimationFrame(quadro);
      if (!cena) return;
      const t = (now - t0) / 1000;
      // texto
      if (!cena.titulo && !cheio) {
        const full = textoDa(cena);
        digitados = Math.max(digitados, Math.floor(t * VEL));
        if (digitados >= full.length) { digitados = full.length; cheio = true; more.classList.add('on'); esperaAte = now + (1800 + full.length * 35) * (opts.lento || 1); }
        txt.textContent = full.slice(0, digitados);
      }
      if (cheio && opts.auto !== false && now > esperaAte && !trocando) proxima();
      // cenário
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.save();
      const tr = reduz ? 0 : (cena.tremor || 0);
      if (tr) { const k = tr * (0.6 + 0.4 * Math.sin(t * 7)) * 9; c.translate((Math.random() - 0.5) * k, (Math.random() - 0.5) * k); c.scale(1.02, 1.02); }
      // v8.2: câmera de cinema, aproximando devagar e deslizando um pouco (cada cena vai para um lado)
      if (!reduz && !cena.titulo) {
        const e = 1 - Math.exp(-t / 7), zz = 1 + 0.07 * e, dir = i % 2 ? 1 : -1;
        c.translate(W / 2 + dir * W * 0.012 * e, H / 2 - H * 0.008 * e); c.scale(zz, zz); c.translate(-W / 2, -H / 2);
      }
      try { (PALCOS[cena.palco] || PALCOS.ilha)(c, W, H, t, cena); } catch (e) { console.warn('[Cutscene]', e); }
      c.restore();
      const dark = DARK[cena.palco] || 0;
      // brilho suave (bloom barato): a cena em miniatura, ampliada por cima em modo "screen"
      try {
        const gw = Math.max(1, Math.round(W / 6)), gh = Math.max(1, Math.round(H / 6));
        if (glowCv.width !== gw || glowCv.height !== gh) { glowCv.width = gw; glowCv.height = gh; }
        gc.globalCompositeOperation = 'copy'; gc.drawImage(cv, 0, 0, gw, gh);
        c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = dark ? 0.26 : 0.16; c.imageSmoothingQuality = 'high';
        c.drawImage(glowCv, -W * 0.01, -H * 0.01, W * 1.02, H * 1.02); c.restore();
      } catch (e) { /* sem bloom */ }
      // luz quente vinda de cima nas cenas claras, brasas avermelhadas nas escuras
      c.save(); c.globalCompositeOperation = dark ? 'lighter' : 'soft-light';
      const lg = c.createLinearGradient(0, 0, 0, H);
      if (dark) { lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(1, 'rgba(120,20,10,.18)'); }
      else { lg.addColorStop(0, 'rgba(255,214,140,.55)'); lg.addColorStop(0.6, 'rgba(255,170,80,.12)'); lg.addColorStop(1, 'rgba(90,40,10,.35)'); }
      c.fillStyle = lg; c.fillRect(0, 0, W, H); c.restore();
      if (!dark && !reduz) { // raios de luz
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let k = 0; k < 4; k++) {
          const x0 = W * (0.15 + k * 0.24) + Math.sin(t * 0.3 + k) * W * 0.02, a = 0.035 + 0.02 * Math.sin(t * 0.7 + k * 2);
          const rg = c.createLinearGradient(x0, 0, x0 + W * 0.12, H * 0.85); rg.addColorStop(0, `rgba(255,236,180,${a})`); rg.addColorStop(1, 'rgba(255,236,180,0)');
          c.fillStyle = rg; c.beginPath(); c.moveTo(x0 - W * 0.03, 0); c.lineTo(x0 + W * 0.05, 0); c.lineTo(x0 + W * 0.2, H * 0.9); c.lineTo(x0 + W * 0.06, H * 0.9); c.closePath(); c.fill();
        }
        c.restore();
      }
      // partículas de pólen (ou brasas) flutuando na frente de tudo
      if (!reduz) {
        c.save(); c.globalCompositeOperation = 'lighter';
        motes.forEach(m => {
          const y = ((m.y - t * m.v) % 1 + 1) % 1, x = m.x + Math.sin(t * 0.6 + m.ph) * 0.015, al = m.a * (0.5 + 0.5 * Math.sin(t * 1.3 + m.ph));
          const gx = x * W, gy = y * H, rr = m.r * (W / 900 + 0.4);
          const g2 = c.createRadialGradient(gx, gy, 0, gx, gy, rr * 4);
          g2.addColorStop(0, dark ? `rgba(255,120,70,${al})` : `rgba(255,236,170,${al})`); g2.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = g2; c.fillRect(gx - rr * 4, gy - rr * 4, rr * 8, rr * 8);
        });
        c.restore();
      }
      // vinheta
      const v = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.32, W / 2, H / 2, Math.max(W, H) * 0.75);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(10,4,0,${dark ? 0.7 : 0.5})`); c.fillStyle = v; c.fillRect(0, 0, W, H);
      // dissolve da cena anterior
      if (prevA > 0) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = prevA; c.drawImage(prevCv, 0, 0); c.restore(); prevA = Math.max(0, 1 - (now - prevT) / 700); }
    }

    if (rot.musica !== undefined && som) try { som.musica(rot.musica); } catch (e) { /* opcional */ }
    requestAnimationFrame(() => { root.classList.add('on'); mostra(0); fade.style.opacity = '0'; btn.focus({ preventScroll: true }); });
    raf = requestAnimationFrame(quadro);

    const ctl = { id, fim };
    atual = ctl;
    return prom;
  }

  global.Cutscene = {
    play,
    pular() { if (atual) atual.fim(true); },
    tocando() { return !!atual; },
    roteiros: ROTEIROS,
    palcos: PALCOS,
    vespa, // desenho da vespa, também usado nos chefes da batalha
    personagens: QUEM,
    retratos: RETRATO, // desenhos dos rostos (a Vovó também aparece nas dicas do jogo)
    ids: () => Object.keys(ROTEIROS),
  };
})(typeof window !== 'undefined' ? window : this);
/* CUTSCENE-END */
