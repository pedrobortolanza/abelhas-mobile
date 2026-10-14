'use strict';
// ENTRADA (pointerdown para não perder cliques durante a re-renderização)
// ============================================================
const ACTIONS = {
  tab: el => { S.tab = el.dataset.k; },
  collect: (el, ev) => collect(+el.dataset.i, ev),
  collectAll: (el, ev) => collectAll(ev),
  farm: (el, ev) => { const i = +el.dataset.i, f = S.farms[i]; if (f && f.crop && f.prog >= CROPS[f.crop].dur) { harvest(i, ev); if (S.tab === 'jardim') return; } else { S.jardimSel = i; S.tab = 'jardim'; } },
  plantOne: (el, ev) => harvest(+el.dataset.i, ev),
  farmCrop: el => setFarmCrop(el.dataset.i === 'all' ? 'all' : +el.dataset.i, el.dataset.k),
  farmUp: el => upgradeFarm(+el.dataset.i),
  gardener: () => hireGardener(), labOpen: () => openLab(),
  spin: el => spinWheel(el.dataset.k),
  atkPick: el => { S.atkPick = S.atkPick === el.dataset.k ? null : el.dataset.k; },
  learn: el => learnAttack(+el.dataset.id),
  rename: el => renameBee(+el.dataset.id),
  skinPick: el => { S.skinPick = S.skinPick === el.dataset.k ? null : el.dataset.k; },
  skin: el => applySkin(+el.dataset.id),
  unskin: el => removeSkin(+el.dataset.id, el.dataset.k),
  swTab: el => { S.swTab = el.dataset.k; }, upSel: el => { S.upSel = +el.dataset.id; }, upTry: el => tryUpgrade(+el.dataset.id),
  hskinPick: el => { S.hskinPick = S.hskinPick === el.dataset.k ? null : el.dataset.k; },
  hskin: el => applyHiveSkin(+el.dataset.i), unhskin: el => { const h = S.habitats[+el.dataset.i]; if (h) { h.skin = null; sfx('clique'); } },
  selCrop: el => { if (unlockedCrop(el.dataset.k)) S.selCrop = el.dataset.k; },
  harvestAll: () => harvestAll(),
  buyHab: () => buyHabitat(), buyFarm: () => buyFarm(), buyHatch: () => buyHatch(),
  buy: el => buyDragon(el.dataset.k),
  feed: el => feed(+el.dataset.id), sell: el => sell(+el.dataset.id),
  swSell: el => {
    const d = S.dragons.find(x => x.id === +el.dataset.id);
    if (!d) { overlay(''); return; }
    if (!el.dataset.ok) { el.dataset.ok = '1'; el.innerHTML = iconize(`Confirmar venda: +${fmt(sellValue(d))} 🪙`); return; }
    d._confirm = true; const n = S.dragons.length; sell(d.id);
    if (S.dragons.length < n) { overlay(''); render(); } else d._confirm = false;
  },
  hatch: el => hatch(+el.dataset.id), speed: el => speedEgg(+el.dataset.id),
  swarm: el => spinSwarm(el.dataset.k, +(el.dataset.n || 1)),
  swAgain: () => { overlay(''); S.tab = 'chocadeira'; spinSwarm(S.t >= S.freeAt ? 'free' : S.tickets ? 'ticket' : 'gold'); },
  pickParent: el => {
    const id = +el.dataset.id;
    if (S.breedA === id) S.breedA = null; else if (S.breedB === id) S.breedB = null;
    else if (!S.breedA) S.breedA = id; else S.breedB = id;
  },
  clearParent: el => { if (el.dataset.k === 'A') S.breedA = null; else S.breedB = null; },
  breed: () => breed(),
  labSel: el => { S.labSel = +el.dataset.id; },
  labDo: el => labMutate(el.dataset.k, el.dataset.m),
  team: el => toggleTeam(+el.dataset.id),
  fight: el => {
    if (el.dataset.k === 'boss' && !S.weakened && !S.sawDream) { S.sawDream = true; cena('sonho', { modo: S.mode }).then(() => { startBattle('boss'); render(); }); return; }
    startBattle(el.dataset.k);
  },
  move: el => playerMove(el.dataset.k),
  node: el => takeNode(el.dataset.k),
  raidGo: () => { overlay(''); S.tab = 'arena'; startBattle('raid'); },
  raidSkip: () => { overlay(''); if (S.raid) raidPenalty(); },
  auto: () => { S.autoBattle = !S.autoBattle; },
  surrender: () => surrender(), closeBattle: () => closeBattle(),
  claim: el => claimMission(+el.dataset.i),
  merchant: () => buyMerchant(), shopTab: el => { S.shopTab = el.dataset.k; }, boost: el => buyBoost(el.dataset.k), treasure: el => buyTreasure(el.dataset.k), gemGold: () => gemsToGold(), mystery: () => mysteryEgg(),
  egg: () => catchEgg(),
  pause: () => togglePause(),
  resume: () => resumeRun(),
  askEnd: () => overlay(`<div class="card hero"><h1>Encerrar a partida?</h1><p>${S && S.finalPhase ? 'Desistir agora conta como colmeia não defendida.' : 'Você sai antes da Vespa Rainha chegar, e a colmeia fica sem defesa.'} Não dá para voltar.</p><div class="row"><button class="btn primary" data-a="end">Encerrar agora</button><button class="btn" data-a="cancelEnd">Continuar jogando</button></div></div>`),
  cancelEnd: () => overlay(''),
  end: () => endGame(),
  start: el => { landscapeLock(); startGame(el.dataset.k); },
  fullscreen: () => landscapeLock(true),
  fsToggle: () => toggleFs(),
  ficha: el => { S.ficha = +el.dataset.id; renderFicha(); }, fichaClose: () => { S.ficha = null; overlay(''); }, fichaTeam: () => { toggleTeam(S.ficha); renderFicha(); },
  crisis: () => crisisAct(), pact: el => takePact(el.dataset.k),
  buildFloor: () => buildFloor(), towerSel: el => { S.towerSel = +el.dataset.id; }, ascend: el => ascend(el.dataset.k),
  queen: el => chooseQueen(el.dataset.k),
  tutorNext: () => tutorNext(false), tutorSkip: () => tutorNext(true),
  tipOk: () => { S.tipsSeen = [...(S.tipsSeen || []), S.tab]; },
  relic: el => chooseRelic(el.dataset.k),
  again: () => { S = null; $('#toasts').innerHTML = ''; renderStart(); ['#top', '#tabs', '#sheet', '#map', '#hud'].forEach(q => $(q).innerHTML = ''); lastTop = lastTabs = lastView = lastMap = lastHud = ''; mapCentered = false; },
};
// No celular: tela cheia e orientação travada na horizontal (só funciona depois de um toque do jogador)
const isPhone = () => matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) <= 600;
function landscapeLock(force) {
  if (!force && !isPhone()) return;
  const el = document.documentElement;
  const go = () => { try { const p = screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape'); if (p && p.catch) p.catch(() => {}); } catch (e) { /* sem suporte */ } };
  try {
    if (!isFs() && el.requestFullscreen) el.requestFullscreen({ navigationUI: 'hide' }).then(go, go);
    else if (!isFs() && el.webkitRequestFullscreen) { el.webkitRequestFullscreen(); go(); }
    else go();
  } catch (e) { go(); }
}
// Botão de tela cheia da barra de cima: some com as barras do navegador no celular
const isTouch = () => matchMedia('(pointer: coarse)').matches;
const inApp = () => matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone === true;
const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement) || inApp();
const fsApi = () => !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
const FS_ON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>';
const FS_OFF = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5"/></svg>';
function toggleFs() {
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) { /* sem suporte */ }
  } else if (inApp()) toast('Já está em tela cheia', 'O jogo foi aberto pelo ícone da tela inicial.');
  else if (fsApi()) landscapeLock(true);
  else toast('Tela cheia pela tela inicial', 'No iPhone: toque em Compartilhar e depois em "Adicionar à Tela de Início". Abrindo pelo ícone, o jogo fica sem as barras do Safari.');
}
['fullscreenchange', 'webkitfullscreenchange'].forEach(t => document.addEventListener(t, () => render(true)));
const portraitPhone = matchMedia('(orientation: portrait) and (max-width: 600px) and (pointer: coarse)');
portraitPhone.addEventListener && portraitPhone.addEventListener('change', () => { if (portraitPhone.matches && S && S.running && !S.paused && !S.ended && !S.choosing) togglePause(); });
function handle(ev) {
  const el = ev.target.closest('[data-a]');
  if (!el || el.disabled) return;
  const fn = ACTIONS[el.dataset.a];
  if (!fn) return;
  if (S && !S.ended) S.stats.clicks++;
  const a = el.dataset.a;
  if (a === 'tab') { sfx('aba'); if (el.dataset.k === 'dragoes') sfx('zumbido'); }
  else if (['pause', 'askEnd', 'cancelEnd', 'pickParent', 'clearParent', 'team', 'selCrop', 'auto', 'start', 'again', 'surrender', 'end', 'move', 'fight'].includes(a)) { if (a !== 'pause' && a !== 'move' && a !== 'fight') sfx('clique'); }
  fn(el, ev);
  if (S && !S.ended) { checkAchievements(); render(); }
  runFx();
}
// Mouse age no pointerdown; toque age no pointerup, só se o dedo não arrastou (para não disparar ao rolar a tela)
let downAt = null;
document.addEventListener('pointerdown', ev => {
  if (ev.pointerType === 'mouse') { if (ev.button === 0) handle(ev); }
  else downAt = { x: ev.clientX, y: ev.clientY };
});
document.addEventListener('pointerup', ev => {
  if (ev.pointerType === 'mouse' || !downAt) return;
  const moved = Math.hypot(ev.clientX - downAt.x, ev.clientY - downAt.y);
  downAt = null;
  if (moved < 12) {
    const target = document.elementFromPoint(ev.clientX, ev.clientY);
    if (target) handle({ target, clientX: ev.clientX, clientY: ev.clientY });
  }
});
document.addEventListener('click', ev => { if (ev.detail === 0) handle(ev); }); // teclado (Enter/Espaço)
// Trava o menu do botão direito, a seleção de texto e o arrastar de imagens
['contextmenu', 'selectstart', 'dragstart'].forEach(t => document.addEventListener(t, ev => ev.preventDefault()));
document.addEventListener('keydown', ev => {
  if (!S || S.ended || ev.target.matches('input, textarea')) return;
  const n = parseInt(ev.key, 10);
  if (n >= 1 && n <= TABS.length) { S.tab = TABS[n - 1][0]; sfx('aba'); render(); }
  if (ev.key === 'p' || ev.key === 'P') togglePause();
  if (ev.key === 'Escape' && S.tab !== 'ilha') { S.tab = 'ilha'; render(); }
  if (ev.key === 'Enter' && ev.target.matches && ev.target.matches('g[data-a]')) handle({ target: ev.target, clientX: 0, clientY: 0 });
  if ((ev.key === 'c' || ev.key === 'C') && S.level >= 5) { collectAll(); render(); }
});

// Atualizações ao vivo do artefato: preserva a partida em andamento
window.claude?.hot?.snapshot?.(() => ({ S: S ? JSON.parse(JSON.stringify(S)) : null }));
function boot(data) {
  try { warmSprites(); } catch (e) { sprOff = true; }
  try { Som.criarControles($('#somctl'), { compacto: true }); Som.ligarTeclaM(); } catch (e) { /* áudio é opcional */ }
  if (data && data.S && MODES[data.S.mode] && data.S.warned) { S = data.S; last = performance.now(); if (S.ended) { renderEnd(); music('placar'); } else { render(true); music(S.finalPhase ? 'invasao' : S.battle && !S.battle.over ? 'batalha' : 'ilha'); } }
  else if (sprOff) renderStart();
  else loadingThen(() => { if (!S) renderStart(); });
  setInterval(tick, 250);
}
window.claude?.hot?.ready ? window.claude.hot.ready(boot) : boot(window.claude?.hot?.data ?? {});
// Gancho para testes automatizados
window.__game = { get S() { return S; }, startGame, tick, ACTIONS, endGame, ALL_SPECIES, givePrize };
