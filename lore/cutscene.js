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
      musica: null,
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
          texto: 'Este é o último ovo da Tropa. Choque abelhas, cruze os tipos, plante flores e faça mel.' },
        { palco: 'ilha', quem: 'melina', exceto: 'infinito',
          texto: 'A Vespa Rainha chega em {tempo}. Só três abelhas poderão enfrentá-la. Quem defender bem o lar entra para a Tropa do Mel.' },
        { palco: 'ilha', quem: 'melina', so: 'infinito',
          texto: 'Ela vai atacar a cada quinze minutos, com um enxame maior a cada vez. Aguente o quanto puder.' },
        { palco: 'titulo', titulo: 'Honey Troop', sub: 'A Tropa do Mel', dur: 3.2 },
      ],
    },
    sonho: {
      cenas: [
        { palco: 'ninho', quem: 'melina',
          texto: 'Só os campeões da Arena entram no Ninho de Papel. Lá dentro a Vespa Rainha ainda hiberna, e pode ser ferida.' },
        { palco: 'ninho', quem: 'melina', texto: 'Uma ferroada dada agora continua doendo quando ela acordar. Mire bem.' },
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
        { palco: 'vespa', quem: 'melina', texto: 'Agora! Escolha três abelhas. Tudo o que você construiu decide este momento.' },
      ],
    },
    despertarOnda: {
      musica: 'invasao',
      cenas: [
        { palco: 'zumbido', quem: 'narrador', tremor: 0.9, rachas: 1, som: ['tremor', { intensidade: 1 }],
          texto: 'Ataque {onda}. O enxame volta pelo mar de mel.' },
        { palco: 'vespa', quem: 'vespa', tremor: 0.5, flash: true, som: ['despertar'],
          texto: 'Você me expulsou. Eu voltei com mais ferrões, e com mais fome.' },
        { palco: 'vespa', quem: 'melina', texto: 'Três abelhas, de novo. Ela está mais forte, e nós também.' },
      ],
    },
    ondaVencida: {
      cenas: [
        { palco: 'vitoria', quem: 'narrador', texto: 'A Vespa Rainha recua para além do mar de mel, mas o zumbido não some de vez.' },
        { palco: 'ilha', quem: 'melina', texto: 'Ela volta em quinze minutos. Colete néctar, cruze, treine. Não pare agora.' },
      ],
    },
    vitoria: {
      cenas: [
        { palco: 'vitoria', quem: 'narrador', flash: true, texto: 'A Vespa Rainha foge pelo mar de mel, e o enxame vai junto. A Ilha Favo brilha nas nove cores.' },
        { palco: 'vitoria', quem: 'vespa', texto: 'Essa colmeia... tem ferrão demais...' },
        { palco: 'amanhecer', quem: 'melina', texto: 'Você defendeu o lar como os heróis de antes. De hoje em diante, sua colmeia é da Tropa do Mel.' },
        { palco: 'titulo', titulo: 'Tropa do Mel', sub: 'Uma nova geração de heróis', dur: 3 },
      ],
    },
    derrota: {
      cenas: [
        { palco: 'derrota', quem: 'vespa', tremor: 0.3, texto: 'Todo esse mel... agora é meu.' },
        { palco: 'derrota', quem: 'melina', texto: 'A ferroada que você deixou nela não sara. A próxima colmeia vai saber onde mirar.' },
      ],
    },
    semDefesa: {
      cenas: [
        { palco: 'vazio', quem: 'narrador', texto: 'A Vespa Rainha chegou e encontrou os favos vazios. Ninguém ficou para defender a colmeia.' },
      ],
    },
  };

  const TEMPO_MODO = { rapido: '10 minutos', padrao: '20 minutos', longa: '30 minutos', infinito: '15 minutos' };

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
@media (prefers-reduced-motion:reduce){.cs-flash.go{animation:none}.cs-more{animation:none}}
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
  // A Ilha Favo vista de lado: um hexágono grosso, de cera, com prado no topo, flores e colmeias.
  // o: { vazia, ruina, perigo 0..1 (brilho vermelho), apagada }
  function ilhaFavo(c, cx, base, lw, t, o) {
    o = o || {};
    const R = lw / 2, k = 0.3, esp = lw * 0.13, top = base - esp;
    const V = []; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; V.push([cx + Math.cos(a) * R, top + Math.sin(a) * R * k]); }
    c.save();
    // faces da frente (vértices 0→1→2→3 ficam do lado de baixo da tela)
    const cerasF = o.ruina ? ['#8a6a48', '#6a4e34', '#544030'] : ['#d6a052', '#b98238', '#9a6a2a'];
    [[0, 1], [1, 2], [2, 3]].forEach(([a, b], f) => {
      c.save(); c.beginPath(); c.moveTo(V[a][0], V[a][1]); c.lineTo(V[b][0], V[b][1]); c.lineTo(V[b][0], V[b][1] + esp); c.lineTo(V[a][0], V[a][1] + esp); c.closePath();
      c.fillStyle = cerasF[f]; c.fill(); c.clip();
      c.lineWidth = 1.5; favos(c, Math.min(V[a][0], V[b][0]) - 10, Math.min(V[a][1], V[b][1]) - 10, Math.max(V[a][0], V[b][0]) + 10, Math.max(V[a][1], V[b][1]) + esp + 10,
        lw * 0.018, 'rgba(60,30,8,.35)', (cl, rw) => (hash(cl * 7 + f, rw) < (o.ruina ? 0.12 : 0.28) ? (o.ruina ? 'rgba(40,24,12,.6)' : 'rgba(150,72,14,.55)') : null));
      const sh = c.createLinearGradient(0, top, 0, top + esp + R * k); sh.addColorStop(0, 'rgba(255,240,200,.12)'); sh.addColorStop(1, 'rgba(0,0,0,.35)');
      c.fillStyle = sh; c.fillRect(cx - R - 20, top - R, lw + 40, esp + R * 2);
      c.restore();
    });
    // mel escorrendo pelas bordas
    if (!o.ruina) {
      c.fillStyle = '#c87418';
      for (let i = 0; i < 7; i++) {
        const f = i % 3, p = hash(i, 21), a = [[0, 1], [1, 2], [2, 3]][f], x = lerp(V[a[0]][0], V[a[1]][0], 0.15 + p * 0.7), y = lerp(V[a[0]][1], V[a[1]][1], 0.15 + p * 0.7);
        const len = esp * (0.25 + 0.4 * hash(i, 22)) * (0.9 + 0.1 * Math.sin(t + i));
        c.beginPath(); c.moveTo(x - 5, y); c.lineTo(x + 5, y); c.lineTo(x + 3, y + len); c.arc(x, y + len, 3, 0, Math.PI); c.closePath(); c.fill();
      }
    }
    // topo: prado
    c.beginPath(); V.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath();
    const gg = c.createLinearGradient(0, top - R * k, 0, top + R * k);
    if (o.ruina) { gg.addColorStop(0, '#7a8a5a'); gg.addColorStop(1, '#4a5a34'); } else { gg.addColorStop(0, '#8fd85e'); gg.addColorStop(1, '#3e8d3a'); }
    c.fillStyle = gg; c.fill();
    c.strokeStyle = o.ruina ? '#5a4632' : '#a8742a'; c.lineWidth = Math.max(2, lw * 0.008); c.stroke();
    c.save(); c.clip();
    // favo central (a colmeia)
    c.save(); c.beginPath(); hexPath(c, cx, top, R * 0.34, k); c.clip();
    c.fillStyle = o.ruina ? '#6a5a44' : '#e2b468'; c.fillRect(cx - R, top - R, lw, lw);
    c.lineWidth = 1.2; favos(c, cx - R * 0.4, top - R * 0.2, cx + R * 0.4, top + R * 0.2, lw * 0.016, 'rgba(90,50,10,.55)',
      (cl, rw) => (hash(cl, rw + 3) < (o.ruina ? 0.5 : 0.35) ? (o.ruina ? 'rgba(30,20,10,.7)' : 'rgba(196,110,20,.75)') : null));
    c.restore();
    c.restore();
    if (!o.vazia) {
      // flores do prado
      const r = rnd(5), sc = lw / 700;
      for (let i = 0; i < 26; i++) {
        const a = r() * TAU, d = 0.45 + r() * 0.48, x = cx + Math.cos(a) * R * d * 0.86, y = top + Math.sin(a) * R * k * d * 0.86;
        if (o.ruina && i % 3) continue;
        flor(c, x, y, (5 + r() * 4) * sc * (0.7 + 0.5 * (y - top + R * k) / (2 * R * k)), o.ruina ? '#9a8a7a' : NOVE[i % 9], t, i);
      }
      // colmeias
      [[-0.55, 0.15], [0.5, 0.05], [-0.15, 0.55], [0.3, 0.55]].forEach(([dx, dy], i) => colmeia(c, cx + dx * R, top + dy * R * k, lw / 640 * (0.9 + 0.15 * (i % 2)), o));
    }
    if (o.perigo) {
      // tinge só a silhueta da ilha (topo + faces da frente)
      c.beginPath(); c.moveTo(V[3][0], V[3][1]); c.lineTo(V[4][0], V[4][1]); c.lineTo(V[5][0], V[5][1]); c.lineTo(V[0][0], V[0][1]);
      [0, 1, 2, 3].forEach((i) => c.lineTo(V[i][0], V[i][1] + esp)); c.closePath();
      c.fillStyle = `rgba(200,30,20,${0.3 * o.perigo})`; c.fill();
    }
    c.restore();
    return top;
  }
  // Abelha de perfil. s=1 ≈ 64 px. o: { cor (listras do tipo), dir (1 ou -1), asa (fase), sepia }
  function abelha(c, x, y, s, t, o) {
    o = o || {};
    const cor = o.cor || '#f0b448', dir = o.dir || 1, bat = Math.sin((o.asa != null ? o.asa : t) * 38);
    c.save(); c.translate(x, y); c.scale(s * dir, s);
    // asas
    c.fillStyle = 'rgba(225,245,255,.55)'; c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1;
    c.save(); c.translate(4, -12); c.scale(1, 0.55 + 0.45 * Math.abs(bat)); c.beginPath(); c.ellipse(-6, -14, 10, 17, -0.5, 0, TAU); c.fill(); c.stroke(); c.restore();
    c.save(); c.translate(10, -12); c.scale(1, 0.5 + 0.5 * Math.abs(bat)); c.beginPath(); c.ellipse(4, -12, 8, 14, 0.2, 0, TAU); c.fill(); c.stroke(); c.restore();
    // abdômen listrado
    c.save(); c.beginPath(); c.ellipse(-10, 2, 22, 15, -0.12, 0, TAU); c.fillStyle = cor; c.fill(); c.clip();
    c.fillStyle = '#2a1608'; [-22, -10, 2].forEach((sx) => c.fillRect(sx, -20, 6, 40));
    c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.ellipse(-12, -6, 14, 4, -0.1, 0, TAU); c.fill();
    c.restore();
    c.strokeStyle = '#2a1608'; c.lineWidth = 2; c.beginPath(); c.ellipse(-10, 2, 22, 15, -0.12, 0, TAU); c.stroke();
    // ferrão
    c.fillStyle = '#2a1608'; c.beginPath(); c.moveTo(-31, 4); c.lineTo(-40, 7); c.lineTo(-31, 9); c.fill();
    // tórax e cabeça
    c.fillStyle = '#5a3418'; c.beginPath(); c.arc(12, -2, 11, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = '#2a1608'; c.beginPath(); c.arc(25, -5, 9.5, 0, TAU); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(28, -7, 3.2, 0, TAU); c.fill();
    c.fillStyle = '#2a1608'; c.beginPath(); c.arc(29, -7, 1.6, 0, TAU); c.fill();
    c.strokeStyle = '#2a1608'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(25, -13); c.quadraticCurveTo(30, -26, 37, -26); c.moveTo(22, -13); c.quadraticCurveTo(22, -26, 28, -30); c.stroke();
    c.fillStyle = '#2a1608'; c.beginPath(); c.arc(37, -26, 2.4, 0, TAU); c.arc(28, -30, 2.4, 0, TAU); c.fill();
    // patinhas
    c.beginPath(); c.moveTo(6, 8); c.lineTo(2, 16); c.moveTo(12, 9); c.lineTo(12, 17); c.moveTo(17, 7); c.lineTo(21, 15); c.stroke();
    if (o.medalha) { c.fillStyle = '#ffd36a'; c.strokeStyle = '#7a4a14'; c.lineWidth = 1.2; c.beginPath(); hexPath(c, 12, 3, 4.5); c.fill(); c.stroke(); }
    c.restore();
  }
  // A Vespa Rainha de frente, asas abertas. s = escala (1 ≈ 520 px de envergadura). bate: fase da asa.
  // o: { olhos 0..1|false, cor (silhueta), rugido 0..1, semBrilho }
  function vespa(c, x, y, s, bate, o) {
    o = o || {};
    const sil = !!o.cor, escuro = o.cor || '#1c080c', listra = sil ? o.cor : '#d8402a', borda = o.borda || '#ff3d2e';
    c.save(); c.translate(x, y); c.scale(s, s);
    // asas (quatro, vibrando)
    const ab = Math.sin(bate * 3) * 0.12;
    [-1, 1].forEach((l) => {
      c.save(); c.scale(l, 1);
      [[0, -26, -0.32 - ab, 245, 62], [10, -6, 0.1 + ab, 180, 44]].forEach(([ox, oy, rot, len, lar]) => {
        c.save(); c.translate(26 + ox, oy); c.rotate(rot);
        const g = c.createLinearGradient(0, 0, len, 0); g.addColorStop(0, sil ? 'rgba(20,6,10,.9)' : 'rgba(255,200,180,.35)'); g.addColorStop(1, sil ? 'rgba(20,6,10,.6)' : 'rgba(255,160,140,.12)');
        c.fillStyle = g; c.beginPath(); c.ellipse(len / 2, 0, len / 2, lar / 2, 0, 0, TAU); c.fill();
        c.strokeStyle = sil ? 'rgba(255,80,60,.35)' : 'rgba(120,30,30,.45)'; c.lineWidth = 2; c.stroke();
        c.beginPath(); c.moveTo(4, 0); c.lineTo(len * 0.9, -lar * 0.08); c.moveTo(len * 0.3, -lar * 0.2); c.lineTo(len * 0.75, lar * 0.25); c.stroke();
        c.restore();
      });
      c.restore();
    });
    c.shadowColor = borda; c.shadowBlur = o.semBrilho ? 0 : 26;
    // pernas
    c.strokeStyle = escuro; c.lineWidth = 7; c.lineCap = 'round';
    [-1, 1].forEach((l) => {
      [[20, 10, 60, 40, 70, 90], [22, 22, 66, 70, 60, 128], [18, 30, 50, 96, 40, 160]].forEach(([a, b, cc, d, e, f]) => {
        c.beginPath(); c.moveTo(l * a, b); c.lineTo(l * cc, d); c.lineTo(l * e, f); c.stroke();
      });
    });
    // abdômen comprido com listras
    c.save(); c.beginPath(); c.ellipse(0, 118, 46, 84, 0, 0, TAU); c.fillStyle = escuro; c.fill(); c.shadowBlur = 0; c.clip();
    c.fillStyle = listra; for (let k = 0; k < 4; k++) c.fillRect(-60, 62 + k * 34, 120, 14);
    if (!sil) { c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.ellipse(-16, 100, 10, 50, 0, 0, TAU); c.fill(); }
    c.restore();
    c.fillStyle = escuro; c.beginPath(); c.moveTo(-9, 196); c.lineTo(9, 196); c.lineTo(0, 236); c.closePath(); c.fill();
    // cintura e tórax
    c.beginPath(); c.ellipse(0, 32, 11, 13, 0, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(0, 0, 40, 34, 0, 0, TAU); c.fill();
    if (!sil) { c.shadowBlur = 0; c.fillStyle = '#e0a030'; c.beginPath(); c.ellipse(-16, -6, 7, 12, 0.4, 0, TAU); c.ellipse(16, -6, 7, 12, -0.4, 0, TAU); c.fill(); }
    // cabeça
    c.shadowBlur = o.semBrilho ? 0 : 22; c.fillStyle = escuro;
    c.beginPath(); c.ellipse(0, -60, 46, 38, 0, 0, TAU); c.fill();
    // antenas
    c.lineWidth = 5; c.beginPath(); c.moveTo(-12, -92); c.quadraticCurveTo(-30, -140, -72, -150); c.moveTo(12, -92); c.quadraticCurveTo(30, -140, 72, -150); c.stroke();
    // mandíbulas
    c.strokeStyle = sil ? escuro : '#e0a030'; c.lineWidth = 6;
    c.beginPath(); c.moveTo(-16, -28); c.quadraticCurveTo(-20, -6, -4, -10); c.moveTo(16, -28); c.quadraticCurveTo(20, -6, 4, -10); c.stroke();
    c.shadowBlur = 0;
    if (o.rugido) brilho(c, 0, -18, 46 * o.rugido, 'rgba(255,90,30,.8)');
    // olhos compostos
    if (o.olhos !== false) {
      const a = o.olhos == null ? 1 : o.olhos;
      [-1, 1].forEach((l) => {
        brilho(c, l * 24, -62, 40, `rgba(255,70,40,${0.55 * a})`);
        c.save(); c.translate(l * 24, -62); c.rotate(l * 0.25);
        c.beginPath(); c.ellipse(0, 0, 16, 25, 0, 0, TAU);
        const g = c.createRadialGradient(-l * 4, -8, 2, 0, 0, 26); g.addColorStop(0, `rgba(255,190,120,${a})`); g.addColorStop(0.5, `rgba(230,40,30,${a})`); g.addColorStop(1, `rgba(90,6,14,${a})`);
        c.fillStyle = g; c.fill(); c.clip(); c.lineWidth = 0.8; favos(c, -18, -28, 18, 28, 3.2, `rgba(40,4,8,${0.5 * a})`);
        c.restore();
      });
      c.strokeStyle = escuro; c.lineWidth = 6; c.beginPath(); c.moveTo(-36, -84); c.lineTo(-12, -74); c.moveTo(36, -84); c.lineTo(12, -74); c.stroke();
    }
    // coroa
    if (!sil || o.coroa) {
      c.fillStyle = sil ? escuro : '#e8b84a'; c.strokeStyle = '#6a3a08'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(-30, -92); c.lineTo(-34, -124); c.lineTo(-17, -108); c.lineTo(0, -134); c.lineTo(17, -108); c.lineTo(34, -124); c.lineTo(30, -92); c.closePath(); c.fill();
      if (!sil) { c.stroke(); c.fillStyle = '#c8202a'; [[0, -112, 5], [-22, -102, 3.5], [22, -102, 3.5]].forEach(([gx, gy, gr]) => { c.beginPath(); c.arc(gx, gy, gr, 0, TAU); c.fill(); }); }
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
      ceu(c, w, h, sangue ? ['#1a0610', '#5a1420', '#a03a2a'] : ['#24305a', '#6a5a8a', '#d98a6a']);
      nuvens(c, w, h, t, sangue ? 'rgba(30,8,14,.7)' : 'rgba(255,220,220,.18)', 6, h * 0.3, 10);
      const mY = h * 0.66;
      // enxame chegando pelo horizonte
      enxame(c, w, h, t, w * 0.8 - t * 6, mY - h * 0.12, sangue ? 140 : 60, clamp((sangue ? 0.5 : 0.15) + t * 0.03, 0, 1), '#1a0608');
      mar(c, w, h, mY, t, sangue ? MEL_SANGUE : MEL_DIA);
      ilhaFavo(c, w / 2, mY + h * 0.05, larg(w, h, 0.72, 720), t, { ruina: true, perigo: sangue ? 0.7 + 0.3 * Math.sin(t * 3) : 0.15 });
      polen(c, w, h, t, 40, sangue ? '#ff7a3a' : 'rgba(230,200,170,.8)', false);
    },
    ovo(c, w, h, t) {
      paredeFavos(c, w, h, Math.max(28, Math.min(w, h) / 12), 'rgba(0,0,0,.35)', '#3a2010');
      const g = c.createRadialGradient(w / 2, h * 0.48, 0, w / 2, h * 0.48, Math.max(w, h) * 0.6);
      g.addColorStop(0, 'rgba(255,170,80,.35)'); g.addColorStop(1, 'rgba(10,4,2,.85)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      const s = Math.min(w, h) / 520, cx = w / 2, cy = h * 0.46;
      // célula da chocadeira
      c.fillStyle = '#6a3a14'; c.strokeStyle = '#2a1608'; c.lineWidth = 6 * s;
      c.beginPath(); hexPath(c, cx, cy + 8 * s, 120 * s); c.fill(); c.stroke();
      c.fillStyle = '#4a240c'; c.beginPath(); hexPath(c, cx, cy + 8 * s, 98 * s); c.fill();
      brilho(c, cx, cy, 170 * s, 'rgba(255,190,110,.5)');
      // ovo
      const bal = Math.sin(t * 2.4) * 0.05;
      c.save(); c.translate(cx, cy + 40 * s); c.rotate(bal); c.translate(0, -40 * s);
      const go = c.createRadialGradient(-18 * s, -30 * s, 6 * s, 0, 0, 80 * s);
      go.addColorStop(0, '#fffaf0'); go.addColorStop(0.55, '#f2dcb8'); go.addColorStop(1, '#b08a5a');
      c.fillStyle = go; c.beginPath(); c.ellipse(0, 0, 48 * s, 64 * s, 0, 0, TAU); c.fill();
      c.strokeStyle = '#2a1608'; c.lineWidth = 3 * s; c.stroke();
      // marca da Tropa: hexágono dourado
      c.fillStyle = '#e9a640'; c.strokeStyle = '#7a4a14'; c.lineWidth = 2 * s; c.beginPath(); hexPath(c, 0, 4 * s, 14 * s); c.fill(); c.stroke();
      c.fillStyle = '#fff3c0'; c.beginPath(); hexPath(c, 0, 4 * s, 6 * s); c.fill();
      c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(-18 * s, -30 * s, 9 * s, 15 * s, -0.4, 0, TAU); c.fill();
      c.restore();
      polen(c, w, h, t, 40, '#ffc880');
    },
    ilha(c, w, h, t) {
      ceu(c, w, h, ['#2f6fa8', '#7cc0d8', '#f2d9b0']);
      brilho(c, w * 0.8, h * 0.4, h * 0.5, 'rgba(255,236,190,.6)');
      nuvens(c, w, h, t, 'rgba(255,255,255,.75)', 7, h * 0.3, 10);
      const mY = h * 0.62;
      mar(c, w, h, mY, t, MEL_DIA);
      ilhaFavo(c, w / 2, mY + h * 0.06, larg(w, h, 0.72, 720), t, { ruina: true });
      // abelhas voando
      for (let i = 0; i < 4; i++) {
        const x = ((t * (40 + i * 10) + i * 190) % (w + 100)) - 50, y = h * (0.16 + i * 0.06) + Math.sin(t * 3 + i) * 8;
        abelha(c, x, y, Math.min(w, h) / 1800, t + i, { cor: NOVE[i * 2] });
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
      vespa(c, w / 2, lerp(-h * 0.3, h * 0.36, sobe), s, t, { rugido: t > 1.2 && t < 3 ? 1 : 0.3 });
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
      ceu(c, w, h, ['#2a3a7a', '#e0906a', '#ffe0b0']);
      const cx = w / 2, mY = h * 0.68;
      for (let i = 0; i < 12; i++) {
        c.save(); c.translate(cx, mY - 40); c.rotate(-Math.PI / 2 + (i - 5.5) * 0.16 + Math.sin(t * 0.5) * 0.02);
        c.fillStyle = 'rgba(255,240,200,.12)'; c.beginPath(); c.moveTo(0, 0); c.lineTo(-18, -h); c.lineTo(18, -h); c.fill(); c.restore();
      }
      const foge = ease(t / 5);
      vespa(c, lerp(cx, w * 1.15, foge), lerp(h * 0.34, h * 0.08, foge), Math.min(w, h * 1.25) / 760 * (1 - foge * 0.6), t, { olhos: 1 - foge * 0.6 });
      enxame(c, w, h, t, lerp(cx, w * 1.2, foge), lerp(h * 0.36, h * 0.1, foge), 40, 0.6 * (1 - foge), '#1a0608');
      mar(c, w, h, mY, t, MEL_DIA);
      const lw = larg(w, h, 0.76, 760);
      const topo = ilhaFavo(c, cx, mY + h * 0.06, lw, t, {});
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
      const mY = h * 0.68;
      mar(c, w, h, mY, t, ['#5a3e24', '#1a1208', 'rgba(220,200,170,.18)']);
      ilhaFavo(c, w / 2, mY + h * 0.06, larg(w, h, 0.72, 720), t, { ruina: true, vazia: true });
      const x = lerp(-w * 0.2, w * 1.2, (t / 7) % 1);
      vespa(c, x, h * 0.26, Math.min(w, h) / 1600, t, { olhos: 1 });
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
    const cenas = rot.cenas.filter((c) => (!c.so || c.so === modo) && (!c.exceto || c.exceto !== modo));
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

    let W = 0, H = 0, dpr = 1;
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
      if (cena.titulo) {
        box.classList.remove('on'); tit.querySelector('h1').textContent = cena.titulo; tit.querySelector('p').textContent = cena.sub || '';
        setTimeout(() => tit.classList.add('on'), 200); cheio = true; esperaAte = t0 + (cena.dur || 3) * 1000;
        return;
      }
      tit.classList.remove('on');
      const q = cena.quem || 'narrador', p = QUEM[q];
      panel.className = 'cs-panel' + (q === 'narrador' ? ' narr' : ' ' + q);
      nome.textContent = p.nome; nome.className = 'cs-name ' + q; nome.style.display = p.nome ? '' : 'none';
      port.innerHTML = RETRATO[q] || ''; port.style.display = RETRATO[q] ? '' : 'none';
      txt.textContent = ''; more.classList.remove('on');
      box.classList.add('on');
    }
    function proxima() {
      if (trocando || encerrado) return;
      if (i >= cenas.length - 1) { fim(false); return; }
      trocando = true; fade.style.opacity = '1'; box.classList.remove('on');
      setTimeout(() => { if (encerrado) return; mostra(i + 1); fade.style.opacity = '0'; trocando = false; }, 450);
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
      try { (PALCOS[cena.palco] || PALCOS.ilha)(c, W, H, t, cena); } catch (e) { console.warn('[Cutscene]', e); }
      c.restore();
      // vinheta
      const v = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
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
    personagens: QUEM,
    ids: () => Object.keys(ROTEIROS),
  };
})(typeof window !== 'undefined' ? window : this);
