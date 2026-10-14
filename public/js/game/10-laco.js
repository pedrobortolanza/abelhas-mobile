'use strict';
// LAÇO PRINCIPAL
// ============================================================
let last = performance.now();
function tick() {
  const now = performance.now();
  const dt = Math.min(2, (now - last) / 1000);
  last = now;
  if (!S || !S.running || S.paused || S.ended || S.choosing) { render(); return; }
  if (S.finalPhase) {
    if (S.battle && !S.battle.over && S.autoBattle && S.tab === 'arena') {
      autoAcc += dt;
      if (autoAcc >= 1.1) { autoAcc = 0; const B = S.battle; playerMove(bestMove(B.team[B.pi], B.foes[B.ei])); }
    }
    checkAchievements(); render(); runFx();
    return;
  }
  S.t += dt;
  const left = invadeAt() - S.t;
  for (const w of [300, 120, 60, 30]) {
    if (left <= w && !S.warned.includes(w)) {
      S.warned.push(w);
      toast('☠️ Um zumbido ao longe…', `${bossName()} ataca em ${w >= 60 ? w / 60 + ' min' : w + 's'}. Prepare seu time!`, 'bad warn');
      const inten = { 300: 0.25, 120: 0.5, 60: 0.75, 30: 1 }[w];
      sfx('tremor', { intensidade: inten }); tension(inten);
    }
  }
  if (left <= 0) { startFinal(); render(); return; }
  const gm = goldMult(), fm = farmMult();
  S.habitats.forEach((h, i) => {
    const g = habGps(i);
    const cap = Math.max(50, g * 60);
    h.stored = Math.min(cap, h.stored + g * gm * dt);
  });
  S.farms.forEach(f => { if (f.crop) f.prog = Math.min(CROPS[f.crop].dur, f.prog + dt * fm * MOD('farm') * farmSpeed(f)); });
  if (S.gardener) {
    S.gardenAcc += dt;
    if (S.gardenAcc >= GARDENER.every) {
      S.gardenAcc = 0;
      const i = S.farms.findIndex(f => (f.crop && f.prog >= CROPS[f.crop].dur) || (!f.crop && S.gold >= CROPS[f.pick || 'trigo'].cost));
      if (i >= 0) { const f = S.farms[i]; if (f.crop) harvest(i, null, true); if (!f.crop) plant(i, true); S.stats.gardenerWork = (S.stats.gardenerWork || 0) + 1; }
    }
  }
  if (S.t >= S.freeAt && !S.freeRang) { S.freeRang = true; sfx('ovoPronto'); }
  if (S.t < S.freeAt) S.freeRang = false;
  S.stats.peakGps = Math.max(S.stats.peakGps, totalGps());
  if (S.t - S.history[S.history.length - 1].t >= 5) {
    S.history.push({ t: S.t, earned: S.stats.goldEarned, gps: totalGps() });
    if (S.history.length > 800) S.history.splice(1, 1);
  }
  if (S.t >= S.nextEvent) triggerEvent();
  if (S.raidIdx < S.raids.length) {
    const at = S.raids[S.raidIdx];
    if (S.t >= at - 30 && S.raidWarned < S.raidIdx) { S.raidWarned = S.raidIdx; toast(`${RIVALS[S.rival].i} ${RIVALS[S.rival].n} a caminho`, 'Elas invadem em 30s. Deixe o time pronto.', 'bad warn'); }
    if (S.t >= at && !S.raid && !S.battle && !S.relicOffer) raidStart();
  }
  if (S.raid && S.t > S.raid.until && !(S.battle && S.battle.kind === 'raid')) { overlay(''); raidPenalty(); }
  if ((S.t >= S.nextRelic || S.bonusRelic) && !S.battle && !S.relicOffer && !S.raid) offerRelics();
  crisisTick(dt); necroCheck();
  if (S.t >= S.nextCrystal) { S.nextCrystal += CRYSTAL_EVERY; addCrystals(1, 'Um cristal brotou no Laboratório.'); }
  if (S.lostEgg && S.t > S.lostEgg.until) S.lostEgg = null;
  if (S.battle && !S.battle.over && S.autoBattle && S.tab === 'arena') {
    autoAcc += dt;
    if (autoAcc >= 1.1) { autoAcc = 0; const B = S.battle; playerMove(bestMove(B.team[B.pi], B.foes[B.ei])); }
  }
  checkAchievements();
  render();
  runFx();
  saveRun();
}
let autoAcc = 0;
// Peso do modo na pontuação: 1 = 20 min. No Infinito, cresce com o tempo jogado.
function modeFactor() { if (isActs()) return actEndAt(S.act) / 1200; const d = MODES[S.mode].dur; return d ? d / 1200 : Math.max(0.5, S.t / 1200); }
const invadeAt = () => isActs() ? actEndAt(S.act) : (MODES[S.mode].dur || S.nextInvasion);
// Cutscene da lore com o jogo pausado; sem o módulo (ou nos testes automáticos), segue direto
function cena(id, opts = {}) {
  if (!window.Cutscene || window.__noCutscenes) return Promise.resolve({ id, semCena: true });
  const was = S ? S.paused : false;
  if (S) S.paused = true;
  // a vespa da cutscene ganha o visual do chefe certo (General, Rainha ou Imperatriz)
  const nm = (opts.vars && opts.vars.chefe) || (S && isActs() ? curAct().boss : 'Vespa Rainha');
  opts.vars = Object.assign({}, opts.vars, { tipo: /General/.test(nm) ? 'general' : /Imperatriz/.test(nm) ? 'imperatriz' : 'rainha' });
  return Cutscene.play(id, opts).catch(() => ({ id })).then(r => { if (S) { S.paused = was; last = performance.now(); } return r; });
}
function startFinal() {
  S.finalPhase = true; S.t = invadeAt();
  const despertar = isActs() ? cena(S.act === 1 ? 'despertar' : 'atoChefe', { modo: S.mode, vars: { chefe: curAct().boss, ato: curAct().n } })
    : cena(S.mode === 'infinito' && S.wave > 0 ? 'despertarOnda' : 'despertar', { modo: S.mode, vars: { onda: S.wave + 1 } });
  if (S.battle && !S.battle.over) S.stats.battles--;
  S.battle = null; S.lastResult = null; S.lostEgg = null; S.event = null; S.buffs = {}; S.crisis = null; S.tab = 'arena'; S.autoBattle = false; S.raid = null; S.bonusRelic = false;
  render(true);
  const bn = bossName(), bd = isActs() ? curAct().disp : ['trevas', 'fogo'];
  despertar.then(r => { if (r && r.semCena) { sfx('despertar'); music('invasao'); } if (S && !S.ended) overlay(`<div class="card hero">${isActs() ? `<span class="cat">${curAct().n} · chefe</span>` : ''}${dIcon(bd, 'B', 'xl', 'pop', 5)}
    <h1>${bn} chegou com o enxame!</h1>
    <p>Voa em direção à colmeia com seu enxame. Escolha até 3 abelhas para a batalha final. Tudo o que você construiu decide este momento.${isActs() && S.act < 2 ? ` Vencer dá a ${TOWER_PARTS[S.act].i} <b>${TOWER_PARTS[S.act].n}</b>, peça da Torre da Ascensão.` : ''}</p>
    <button class="btn primary" data-a="cancelEnd">Escolher meu time</button></div>`); });
}

function startGame(mode) {
  tension(0); music('ilha');
  S = newState(mode); clearSave();
  addDragon(speciesFromEls([pick(S.meadow)]));
  S.missions = initialMissions();
  S.team = [S.dragons[0].id];
  S.queenOffer = [...QUEENS].sort(() => Math.random() - 0.5).slice(0, 3).map(q => q.k);
  S.queenOffer.forEach(k => dragonSprite([QUEENS.find(q => q.k === k).el], 'L'));
  S.choosing = true;
  last = performance.now();
  overlay('');
  render(true);
  // a abertura vem antes da escolha da rainha
  cena('abertura', { modo: mode }).then(() => { if (S && S.choosing && !S.queen) renderQueens(); });
}
// Começo da partida: mostra o prado sorteado e as 3 rainhas para escolher
function renderQueens() {
  const qs = S.queenOffer.map(k => QUEENS.find(q => q.k === k));
  overlay(`<div class="card pick">
    <div class="hero"><span class="cat">Nova partida</span><h1>Seu prado</h1>
      <p>Nesta partida nascem no prado: <b>${S.meadow.map(e => `${EL[e].i} ${EL[e].n}`).join(', ')}</b>. Essas abelhas ficam liberadas desde o início e produzem 25% mais mel. A flor nativa é a <b>${CROPS[S.nativeFlower].i} ${CROPS[S.nativeFlower].n}</b>, que dá 50% mais néctar.</p>
      <div class="run-chips"><span class="run-chip"><b>${SEASONS[S.season].i} ${SEASONS[S.season].n}</b> ${SEASONS[S.season].d} Abelhas de ${EL[SEASONS[S.season].el].n} ganham +20% de vida e ataque.</span><span class="run-chip bad"><b>${RIVALS[S.rival].i} Inimigo: ${RIVALS[S.rival].n}</b> Invadem duas vezes na partida. ${RIVALS[S.rival].d}</span></div></div>
    <span class="cat">Escolha a rainha da sua colmeia</span>
    <div class="choices">${qs.map(q => `<button class="choice" data-a="queen" data-k="${q.k}">${dIcon([q.el], 'L', 'l', '', q.k.length)}<b>${q.n}</b><span class="pro">${q.b}</span><span class="con">${q.m}</span></button>`).join('')}</div>
  </div>`);
}
function chooseQueen(k) {
  const q = QUEENS.find(x => x.k === k);
  if (!S || !S.choosing || S.queen || !q) return;
  S.queen = k; applyMods(q.mods); applyMods(SEASONS[S.season].mods);
  if (S.mods.startGold !== 1) S.gold = Math.round(S.gold * S.mods.startGold);
  S.choosing = false;
  overlay('');
  last = performance.now();
  sfx('conquista');
  toast(`${q.n} assumiu a colmeia!`, 'Toque na colmeia para coletar mel e plante margaridas nos canteiros.');
  if (!window.__noCutscenes) { S.choosing = true; S.tutor = 0; renderTutor(); }
}
// ---------- Dicas iniciais: um passo a passo curto com o relógio parado ----------
const TUTOR = [
  ['🪙', 'Mel', 'O mel é o dinheiro do jogo. As colmeias produzem sozinhas: toque nelas na ilha para coletar. Com mel você gira a Roleta, compra colmeias, canteiros e coisas na Loja.'],
  ['🍖', 'Néctar e Jardim', 'Abra o <b>Jardim</b> (botão verde no canto) para plantar flores nos canteiros. Quando ficam prontas, colha: o néctar alimenta as abelhas, e cada lanche sobe o nível delas.'],
  ['🎯', 'Abelhas novas', 'Toda abelha nova vem da <b>Roleta do Enxame</b>. Há um giro grátis de tempos em tempos, e as fichas também giram. Abelha repetida sobe de nível.'],
  ['💎', 'Geleia real e cristais', 'Geleia real vem das batalhas, missões e conquistas e compra tesouros na <b>Loja</b>. Os cristais são raros e servem para dar mutações no <b>Laboratório</b>, que abre no nível 9 pagando mel. Até lá os cristais ficam guardados.'],
  ['⚔️', 'Arena e chefes', 'Na <b>Arena</b> você escolhe até 3 abelhas e luta para subir de liga. Elites e invasões podem dar relíquias. No fim de cada ato chega um chefe: <b>se perder para ele, a partida acaba</b>.'],
  ['🗼', 'Torre da Ascensão', 'No canto da ilha há uma torre em ruínas. Vença o <b>chefe do Ato I</b>, o <b>chefe do Ato II</b> e a <b>liga dos Campeões</b> da Arena para ganhar as 3 peças dela. Cada andar erguido deixa uma abelha Épica ou Lendária <b>ascender</b> e ganhar um poder novo.'],
  ['🎖️', 'Abelhas com história', 'Toque numa abelha na aba <b>Abelhas</b> para ver a <b>ficha</b> dela: personalidade, números e batalhas. Cada vitória conta: com 5, 12 e 25 vitórias ela vira <b>Experiente</b>, <b>Veterana</b> e <b>Heroína da Tropa</b>, ganhando bônus.'],
  ['📜', 'Missões e conquistas', 'As <b>Missões</b> e as <b>Conquistas</b> dão mel e geleia real. Em <b>Estatísticas</b> você vê tudo o que fez na partida.'],
];
// v8.6: as dicas aparecem como as falas das cutscenes: caixa de fala da Vovó Melina embaixo, com a ilha visível,
// e um destaque piscando no que ela está explicando. Primeiro as duas falas dela (roleta e atos), depois o TUTOR.
const TIP_ALVO = [
  '[data-a=tab][data-k=chocadeira]',
  () => [...document.querySelectorAll('.top *')].find(e => e.children.length < 3 && /Ato\s+I/.test(e.textContent) && e.getBoundingClientRect().width < 320),
  '.res.gold', '[data-k=jardim]', '[data-a=tab][data-k=chocadeira]', '.res.gem', '[data-a=tab][data-k=arena]',
  () => [...document.querySelectorAll('text.lbl')].find(e => /Torre/.test(e.textContent)),
  '[data-a=tab][data-k=dragoes]', '[data-a=tab][data-k=missoes]',
];
function tipList() {
  const atos = isActs() ? `A partida tem <b>3 atos de ${Math.round(ACTS[0].dur / 60)} minutos</b>. No fim de cada um chega um chefe: o <b>General Vespa</b>, a <b>Vespa Rainha</b> e a <b>Imperatriz do Ninho</b>.` : 'Quando o relógio zerar, a <b>Vespa Rainha</b> chega. Prepare suas abelhas até lá.';
  return [
    ['🎯', 'Roleta do Enxame', 'Antes de tudo, <b>gire a Roleta do Enxame</b> para chamar suas primeiras abelhas. Ela dá um giro grátis de tempos em tempos.'],
    ['⚔️', 'Três atos', atos],
    ...TUTOR,
  ];
}
let tipTimer = 0;
function tipClose() {
  clearInterval(tipTimer);
  const L = document.getElementById('tipLayer'); if (L) { L.classList.remove('on'); setTimeout(() => L.remove(), 300); }
}
function renderTutor() {
  const list = tipList(), i = S.tutor, [ic, t, d] = list[i];
  let L = document.getElementById('tipLayer');
  if (!L) {
    L = document.createElement('div'); L.id = 'tipLayer';
    const face = (window.Cutscene && Cutscene.retratos && Cutscene.retratos.melina) || '';
    L.innerHTML = `<div class="tip-spot"></div><div class="tip-arrow"></div>
      <button class="tip-skip" type="button">Pular dicas <i></i></button>
      <div class="tip-box"><div class="tip-port">${face}</div><div class="tip-panel"><span class="tip-name">Vovó Melina</span><span class="tip-chip"></span><div class="tip-text" aria-live="polite"></div><i class="tip-more"></i></div></div>
      <div class="tip-dots"></div>`;
    document.body.appendChild(L);
    L.querySelector('.tip-skip').addEventListener('click', (e) => { e.stopPropagation(); tutorNext(true); });
    L.addEventListener('click', () => { if (L._typing) L._finish(); else tutorNext(false); });
    requestAnimationFrame(() => L.classList.add('on'));
  }
  const dock = document.querySelector('nav.dock'), dr = dock && dock.getBoundingClientRect();
  const deitada = dr && dr.height > dr.width; // celular deitado: a barra de abas fica na lateral esquerda
  L.style.setProperty('--dock', (dr && !deitada ? Math.max(0, window.innerHeight - dr.top) : 0) + 'px');
  L.style.setProperty('--dockL', (deitada ? dr.right : 0) + 'px');
  L.querySelector('.tip-chip').innerHTML = `${ic} ${t}`;
  L.querySelector('.tip-dots').innerHTML = list.map((_, k) => `<b class="${k === i ? 'on' : k < i ? 'ok' : ''}"></b>`).join('');
  const box = L.querySelector('.tip-box'); box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
  // texto aparecendo letra por letra (as tags <b> entram inteiras)
  const tk = d.match(/<[^>]+>|[^<]/g) || [], el = L.querySelector('.tip-text'), more = L.querySelector('.tip-more');
  let n = 0; clearInterval(tipTimer); L._typing = true; more.classList.remove('on');
  const draw = () => { let s = '', v = 0; for (const x of tk) { if (x[0] === '<') s += x; else if (v++ < n) s += x; } el.innerHTML = s; };
  L._finish = () => { clearInterval(tipTimer); n = 1e9; draw(); L._typing = false; more.classList.add('on'); };
  tipTimer = setInterval(() => { n += 2; draw(); if (n >= tk.length) L._finish(); }, 22);
  draw();
  // destaque no que a dica explica
  const spot = L.querySelector('.tip-spot'), arrow = L.querySelector('.tip-arrow');
  const a = TIP_ALVO[i], tg = typeof a === 'function' ? a() : a && document.querySelector(a);
  const r = tg && tg.getBoundingClientRect();
  if (r && r.width) {
    const pad = 8; spot.style.cssText = `left:${r.left - pad}px;top:${r.top - pad}px;width:${r.width + pad * 2}px;height:${r.height + pad * 2}px`;
    spot.classList.add('on');
    const lado = deitada && r.right <= dr.right + 2, baixo = r.top > window.innerHeight / 2;
    if (lado) { // aba na lateral: seta à direita dela, apontando para a esquerda
      arrow.className = 'tip-arrow on lf'; arrow.style.left = (r.right + pad + 22) + 'px'; arrow.style.top = (r.top + r.height / 2 - 16) + 'px';
    } else { // alvo embaixo: seta em cima apontando para baixo; alvo em cima: seta embaixo apontando para cima
      arrow.className = 'tip-arrow on ' + (baixo ? 'dn' : 'up');
      arrow.style.left = (r.left + r.width / 2) + 'px';
      arrow.style.top = (baixo ? r.top - pad - 46 : r.bottom + pad + 6) + 'px';
    }
  } else { spot.className = 'tip-spot'; arrow.className = 'tip-arrow'; }
}
function tutorNext(skip) {
  if (!S || S.tutor === undefined || S.tutor === null) return;
  if (skip || S.tutor >= tipList().length - 1) { S.tutor = null; S.choosing = false; tipClose(); overlay(''); last = performance.now(); return; }
  S.tutor++; sfx && sfx('clique'); renderTutor();
}
// Dica curta na primeira vez que cada menu abre
const TAB_TIPS = {
  dragoes: 'Aqui ficam suas abelhas. Alimente com néctar para subir o nível e venda as que não usa. Toque no ícone de uma abelha para ver a ficha dela, com o título de veterana e as batalhas.',
  cruzar: 'O Laboratório abre no nível 9, pagando mel. Depois, escolha uma abelha e gaste cristais para dar uma mutação a ela. Os cristais são raros: chegam com o tempo, dos chefes e de algumas elites.',
  chocadeira: 'Gire a roleta para ganhar abelhas. Raras, Épicas e Lendárias saem menos, mas a chance garantida vai subindo.',
  arena: 'Cada vitória conta para o título de veterana das abelhas do time. Escolha o caminho e lute. Vencer as 3 lutas de uma liga abre a próxima. O chefe do ato aparece quando o tempo acaba.',
  missoes: 'Cumpra as missões para ganhar prêmios. Quando uma termina, outra entra no lugar.',
  loja: 'Compre colmeias e canteiros com mel, e tesouros e impulsos com geleia real.',
  conquistas: 'Cada conquista dá geleia real uma vez. Elas ficam marcadas quando você consegue.',
  torre: 'A Torre da Ascensão se ergue com 3 peças: a Insígnia do General (chefe do Ato I), a Coroa de Espinhos (chefe do Ato II) e o Troféu dos Campeões (última liga da Arena). Cada andar libera uma ascensão para uma abelha Épica ou Lendária.',
  jardim: 'Escolha a flor de cada canteiro, plante e colha. Flores mais caras dão mais néctar. O botão Colher e replantar faz tudo de uma vez.',
};
function tabTip() {
  const t = TAB_TIPS[S.tab];
  if (!t || window.__noCutscenes || (S.tipsSeen || []).includes(S.tab)) return '';
  return `<div class="tabtip"><span>💡 ${t}</span><button class="btn small" data-a="tipOk">Entendi</button></div>`;
}
function applyMods(mods, add, set) {
  Object.entries(mods || {}).forEach(([k, v]) => { S.mods[k] = k === 'lvlGems' ? S.mods[k] + v : S.mods[k] * v; });
  Object.entries(add || {}).forEach(([k, v]) => { S.mods[k] += v; });
  Object.entries(set || {}).forEach(([k, v]) => { S.mods[k] = v; });
}
// Relíquias: a cada RELIC_EVERY segundos, o relógio para e o jogador escolhe 1 entre 3
function offerRelics() {
  const pool = RELICS.filter(r => r.now || !S.relics.includes(r.k));
  S.relicBonus = S.bonusRelic && S.t < S.nextRelic; S.bonusRelic = false;
  S.relicOffer = pool.sort(() => Math.random() - 0.5).slice(0, 3).map(r => r.k);
  S.choosing = true;
  sfx('evento');
  renderRelics();
}
function renderRelics() {
  const rs = S.relicOffer.map(k => RELICS.find(r => r.k === k));
  overlay(`<div class="card pick">
    <div class="hero"><span class="cat">Relíquia da Tropa · ${S.relics.length + 1}ª</span><h1>Escolha uma relíquia</h1>
      <p>O relógio está parado. O efeito vale até o fim da partida. Cada relíquia só pode ser pega uma vez.</p></div>
    <div class="choices">${rs.map(r => `<button class="choice relic" data-a="relic" data-k="${r.k}"><span class="ric">${r.i}</span><b>${r.n}</b><span class="pro">${r.d}</span>${S.relics.includes(r.k) ? '<span class="muted">Você já tem: soma de novo</span>' : ''}</button>`).join('')}</div>
  </div>`);
}
function chooseRelic(k) {
  const r = RELICS.find(x => x.k === k);
  if (!S || !S.relicOffer || !S.relicOffer.includes(k) || !r) return;
  S.relics.push(k);
  applyMods(r.mods, r.add, r.set);
  if (r.now === 'pote') addGold(Math.max(500, totalGps() * 90));
  if (r.now === 'geleia') addGems(15);
  if (r.now === 'ovo') S.tickets += 5;
  if (r.now === 'cristal') addCrystals(2, 'Pó de Cristal.');
  S.relicOffer = null; S.choosing = false; if (!S.relicBonus) S.nextRelic = S.t + RELIC_EVERY; S.relicBonus = false;
  overlay(''); last = performance.now();
  sfx('conquista'); toast(`${r.i} ${r.n}`, r.d, 'ach');
}
function endGame() {
  if (!S || S.ended) return;
  S.ended = true; S.running = false; clearSave();
  checkAchievements();
  const won = S.finalResult ? S.finalResult.win : ((S.mode === 'infinito' || isActs()) && S.stats.finalWins > 0);
  sfx(won ? 'finalVitoria' : 'finalDerrota'); tension(0);
  const fim = S.finalResult ? (S.finalResult.win ? 'vitoria' : 'derrota') : (S.mode === 'infinito' || isActs()) && S.stats.finalWins > 0 ? 'vitoria' : 'semDefesa';
  cena(fim, { modo: S.mode }).then(() => { setTimeout(() => music('placar'), 1200); renderEnd(); });
}
// Salvamento de segurança: guarda a partida no navegador por 10 minutos, só para não perder tudo se a aba fechar sem querer
const SAVE_KEY = 'honeyTroop.save', SAVE_TTL = 10 * 60 * 1000;
let saveAt = 0;
function saveRun(force) {
  if (!S || window.__noSave) return;
  const now = Date.now();
  if (!force && now - saveAt < 5000) return;
  saveAt = now;
  try {
    if (S.ended) { localStorage.removeItem(SAVE_KEY); return; }
    localStorage.setItem(SAVE_KEY, JSON.stringify({ at: now, v: 1, s: S }));
  } catch (e) { /* armazenamento bloqueado ou cheio: segue sem salvar */ }
}
function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY); if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || !o.s || Date.now() - o.at > SAVE_TTL || o.s.ended) { localStorage.removeItem(SAVE_KEY); return null; }
    return o;
  } catch (e) { return null; }
}
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
function resumeRun() {
  const o = loadSave(); if (!o) { renderStart(); return; }
  S = o.s;
  // estados passageiros não voltam: giro da roleta, batalha no meio, cutscene
  S.wheel = null; S.spin = null; S.idleReel = null; S.swRes = null; S.tutor = null; tipClose(); S.ficha = null; S.battle = null; S.upRoll = null;
  S.running = true; S.paused = false;
  lastTop = lastTabs = lastView = lastMap = lastHud = ''; mapCentered = false; last = performance.now();
  landscapeLock(); music(S.finalPhase ? 'invasao' : 'ilha');
  render(true);
  if (S.relicOffer) { S.choosing = true; renderRelics(); }
  else if (S.necroOffer) { S.choosing = true; renderNecro(); }
  else if (!S.queen) { S.choosing = true; renderQueens(); }
  else { S.choosing = false; S.paused = true; overlay(`<div class="card hero"><h1>Partida recuperada</h1><p>Voltamos de onde você parou${isActs() ? `, no ${curAct().n}` : ''}, com ${fmtTime(S.t)} de jogo. O relógio está parado.</p><button class="btn primary" data-a="pause">Continuar</button></div>`); }
}
function togglePause() {
  if (!S || S.ended || S.choosing) return;
  S.paused = !S.paused;
  try { if (S.paused) { sfx('pausar'); Som.pausar(); } else { Som.retomar(); sfx('retomar'); } } catch (e) { /* áudio é opcional */ }
  if (S.paused) overlay(`<div class="card hero"><h1>Pausado</h1><p>O relógio está parado. A colmeia espera por você.</p><button class="btn primary" data-a="pause">Continuar</button></div>`);
  else { overlay(''); last = performance.now(); }
}
window.addEventListener('pagehide', () => saveRun(true));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) saveRun(true);
  if (document.hidden && S && S.running && !S.paused && !S.ended) togglePause();
});

// ============================================================
