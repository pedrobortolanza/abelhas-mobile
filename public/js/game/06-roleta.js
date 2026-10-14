'use strict';
// ROLETA DO ENXAME (substitui ovos e chocadeira)
// ============================================================
// Espécies que podem sair: tipos já liberados, os híbridos deles e as lendárias cujos tipos estão liberados
function swarmPool() {
  const ok = e => S.level >= unlockLvl(e);
  return ALL_SPECIES.filter(sp => sp.els.every(ok));
}
function swarmFeat() {
  if (S.feat && S.t < S.featUntil && swarmPool().some(sp => sp.key === S.feat)) return ALL_SPECIES.find(sp => sp.key === S.feat);
  const pool = swarmPool().filter(sp => sp.rar !== 'C');
  const ls = pool.filter(sp => sp.rar === 'L');
  const f = ls.length && Math.random() < 0.25 ? pick(ls) : pick(pool.filter(sp => sp.rar !== 'L')) || pick(pool);
  S.feat = f ? f.key : null; S.featUntil = S.t + SWARM.featEvery;
  return f;
}
function rollRarity(odds) {
  let r = Math.random();
  for (const k of ['L', 'E', 'R', 'C']) { if ((r -= odds[k]) <= 0) return k; }
  return 'C';
}
function rollSwarm(gem) {
  const pool = swarmPool();
  const lucky = S.luck > 0; if (lucky) S.luck--;
  let rar = rollRarity(lucky ? (gem ? LUCK_GEM : LUCK_ODDS) : gem ? SWARM.gemOdds : SWARM.odds);
  const has = r => pool.some(sp => sp.rar === r);
  // garantia
  if (has('E')) S.pityE++;
  if (has('L')) S.pityL++;
  if (S.pityL >= SWARM.pityL && has('L')) { rar = 'L'; S.stats.pityHits++; }
  else if (S.pityE >= SWARM.pityE && RARITY[rar].rv < 3) { rar = has('E') ? 'E' : 'R'; S.stats.pityHits++; }
  while (!has(rar)) rar = { L: 'E', E: 'R', R: 'C', C: 'C' }[rar];
  if (RARITY[rar].rv >= 3) S.pityE = 0;
  if (rar === 'L') S.pityL = 0;
  const f = swarmFeat();
  if (f && f.rar === rar && Math.random() < SWARM.featCh) return f;
  // nativas do prado saem um pouco mais
  const opts = pool.filter(sp => sp.rar === rar);
  const w = opts.map(sp => isNative(sp) ? 1.6 : 1), tot = w.reduce((a, b) => a + b, 0);
  let r = Math.random() * tot;
  for (let i = 0; i < opts.length; i++) { if ((r -= w[i]) <= 0) return opts[i]; }
  return opts[opts.length - 1];
}
// Entrega uma abelha: nova vai para a colmeia; repetida faz a sua subir de nível; sem vaga, vira mel
function grantBee(sp) {
  const st = S.stats;
  st.byRarity[sp.rar]++;
  if (sp.rar === 'L' && st.firstLegendT === null) st.firstLegendT = S.t;
  const have = S.dragons.filter(d => d.key === sp.key).sort((a, b) => a.lvl - b.lvl)[0];
  if (have) {
    st.swarmDups++;
    if (have.lvl < MAX_DLVL) {
      const up = Math.min(SWARM.dupLv[sp.rar], MAX_DLVL - have.lvl);
      have.lvl += up; st.maxDragonLvl = Math.max(st.maxDragonLvl, have.lvl); addXp(4 * RARITY[sp.rar].rv);
      return { sp, dup: true, d: have, up };
    }
    const g = sellValue(have) * 3; addGold(g);
    return { sp, dup: true, d: have, gold: g };
  }
  let swapped = null;
  if (S.dragons.length >= capacity()) {
    // Colmeias cheias: Épica ou Lendária toma a vaga da abelha mais fraca de raridade menor que está fora do time (essa vira mel)
    const out = RARITY[sp.rar].rv >= RARITY.E.rv ? outsideTeam().filter(x => RARITY[x.rar].rv < RARITY[sp.rar].rv && x.id !== S.breedA && x.id !== S.breedB).sort((a, b) => powerOf(a) - powerOf(b))[0] : null;
    if (!out) { const g = 120 * RARITY[sp.rar].rv * RARITY[sp.rar].rv; addGold(g); return { sp, full: true, gold: g }; }
    S.dragons = S.dragons.filter(x => x !== out);
    if (S.upSel === out.id) S.upSel = null;
    const g = sellValue(out); addGold(g); S.stats.dragonsSold++;
    swapped = { name: out.name, gold: g };
  }
  const isNew = !S.dex[sp.key];
  const d = addDragon(sp);
  if (Math.random() < MUT_CHANCE) { d.mut = wpick(MUTS); st.mutants++; }
  st.eggsHatched++;
  addXp(10 * RARITY[sp.rar].rv + (isNew ? 15 : 0));
  return { sp, d, isNew, swapped };
}
// Gira a roleta: pay = gold | gems | ticket | free; n = 1 ou 10
const SPIN_MS = 5200, REEL_N = 46, REEL_WIN = 38, CARD_W = 104;
// Sorteio só para encher o carrossel (não mexe em garantia nem estatística)
function reelSample(gem, outs) {
  if (outs) { let r = Math.random(); for (const o of outs) { if ((r -= o.p) <= 0) return o.sp; } return outs[outs.length - 1].sp; }
  const pool = swarmPool();
  let rar = rollRarity(gem ? SWARM.gemOdds : SWARM.odds);
  while (!pool.some(sp => sp.rar === rar)) rar = { L: 'E', E: 'R', R: 'C', C: 'C' }[rar];
  return pick(pool.filter(sp => sp.rar === rar));
}
function makeReel(win, gem, outs) {
  const reel = Array.from({ length: REEL_N }, () => reelSample(gem, outs));
  reel[REEL_WIN] = win;
  // às vezes uma mais rara passa raspando do lado
  if (!outs && Math.random() < 0.35) { const up = swarmPool().filter(sp => RARITY[sp.rar].rv > RARITY[win.rar].rv); if (up.length) reel[REEL_WIN + (Math.random() < 0.5 ? 1 : -1)] = pick(up); }
  return reel;
}
let reelSeq = 0;
function startReel(win, gem, outs, extra) {
  S.wheel = Object.assign({ id: ++reelSeq, reel: makeReel(win, gem, outs), off: Math.round((Math.random() - 0.5) * (CARD_W - 30)), until: performance.now() + SPIN_MS, done: false, gem }, extra);
  setTimeout(() => { finishSwarm(); render(); }, SPIN_MS + 50);
}
// Depois de desenhar: começa a animação do carrossel novo do início
let reelAnimId = 0;
function animReel() {
  const el = document.querySelector('.case-strip');
  if (!el) return;
  const id = +el.dataset.id;
  if (!id || id === reelAnimId) return;
  reelAnimId = id;
  const W = S.wheel;
  if (!W || W.done || W.until < performance.now() + 300) return;
  const fin = el.style.transform;
  el.classList.add('nt'); el.style.transform = `translateX(${-2 * CARD_W}px)`; void el.offsetWidth;
  el.classList.remove('nt'); el.style.transitionDuration = Math.round(W.until - performance.now()) + 'ms'; el.style.transform = fin;
  reelTicks(el, W);
}
// tique a cada abelha que passa pela marca
function reelTicks(el, W) {
  let last = -1;
  const step = () => {
    if (!el.isConnected || W.done) return;
    const m = new DOMMatrixReadOnly(getComputedStyle(el).transform), i = Math.floor(-m.m41 / CARD_W);
    if (i !== last) { if (last >= 0) sfx('tique'); last = i; }
    if (performance.now() < W.until) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function reelHTML() {
  const W = S.wheel;
  if (!W || !W.reel) {
    if (!S.idleReel || S.idleReel.n !== swarmPool().length) { const pool = swarmPool(); S.idleReel = { n: pool.length, reel: Array.from({ length: 12 }, (_, i) => pool[i % pool.length]) }; }
  }
  const reel = W && W.reel ? W.reel : S.idleReel.reel, win = W && W.reel ? REEL_WIN : 5, off = W && W.reel ? W.off : 0;
  const cards = reel.map((sp, i) => {
    const known = S.dex[sp.key], won = W && W.done && W.reel && i === REEL_WIN;
    return `<div class="ccard r-${sp.rar} ${won ? 'won' : ''}">${dIcon(sp.els, sp.rar, 'm', known ? '' : 'unknown', 3 + (i % 9))}<small>${known ? sp.name : '???'}</small></div>`;
  }).join('');
  return `<div class="case ${W && W.love ? 'love' : ''}"><div class="case-mark"></div><div class="case-strip" data-id="${W && W.reel ? W.id : 0}" style="transform:translateX(${-(win * CARD_W + CARD_W / 2 + off)}px)">${cards}</div></div>`;
}
function spinSwarm(pay, n = 1) {
  if (S.wheel && S.wheel.until > performance.now()) return;
  if (pay === 'free' && S.t < S.freeAt) return;
  if (pay === 'ticket' && S.tickets < n) { toast('Sem fichas', 'Ganhe fichas na Arena, em eventos e relíquias.', 'bad'); return; }
  if (pay === 'gold' && !spendGold(n === 10 ? spinCost() * 9 : spinCost())) return;
  if (pay === 'gems' && !spendGems(n === 10 ? SWARM.gems10 : SWARM.gems)) return;
  if (pay === 'ticket') S.tickets -= n;
  if (pay === 'free') { S.freeAt = S.t + freeEvery(); n = 1; }
  const res = [];
  for (let i = 0; i < n; i++) res.push(rollSwarm(pay === 'gems'));
  S.stats.swarmSpins += n; if (n === 10) S.stats.swarmTen++;
  S.stats.spins = (S.stats.spins || 0);
  const best = res.reduce((a, b) => RARITY[b.rar].rv > RARITY[a.rar].rv ? b : a);
  sfx('evento');
  startReel(best, pay === 'gems', null, { res });
  if (S.tab !== 'chocadeira') S.tab = 'chocadeira';
}
// Fatias da roda (proporcionais à chance) e o ângulo onde ela para
const SW_ORDER = ['C', 'R', 'C', 'E', 'C', 'R', 'L', 'R'];
function swSlices() {
  const cnt = {}; SW_ORDER.forEach(k => { cnt[k] = (cnt[k] || 0) + 1; });
  const p = { C: 0.5, R: 0.3, E: 0.14, L: 0.06 }; // visual: a lendária aparece maior do que a chance real para a roda ficar legível
  let a = 0;
  return SW_ORDER.map(k => { const w = 360 * p[k] / cnt[k]; const sl = { k, a0: a, a1: a + w }; a += w; return sl; });
}
function swDeg(rar) {
  const sls = swSlices().filter(x => x.k === rar), sl = pick(sls);
  const mid = sl.a0 + (sl.a1 - sl.a0) * (0.2 + Math.random() * 0.6);
  const prev = S.wheel ? S.wheel.deg : 0;
  return prev - (prev % 360) + 360 * 5 + (360 - mid);
}
function finishSwarm() {
  const W = S.wheel;
  if (!W || W.done) return;
  W.done = true;
  const out = W.res.map(grantBee);
  S.swRes = out;
  const top = out.reduce((a, b) => RARITY[b.sp.rar].rv > RARITY[a.sp.rar].rv ? b : a);
  if (RARITY[top.sp.rar].rv >= 3 || top.isNew) sfx('revelacao', { raridade: RAR_SOM[top.sp.rar] }); else sfx('chocar');
  if (out.length > 1 || top.isNew || RARITY[top.sp.rar].rv >= 3) showSwarm(out);
  else toast(`Roleta: ${top.sp.name}`, swLine(top), '');
}
function swLine(o) {
  if (o.full) return `Sem vaga nas colmeias: virou ${fmt(o.gold)} de mel.`;
  if (o.dup) return o.up ? `Repetida! ${o.d.name} subiu ${o.up} nível(is), agora Nv ${o.d.lvl}.` : `Repetida no nível máximo: +${fmt(o.gold)} de mel.`;
  return `${o.isNew ? 'Espécie nova! ' : ''}${RARITY[o.sp.rar].n}${o.d && o.d.mut ? ` · 🧬 ${MUTS[o.d.mut].n}` : ''}${o.swapped ? ` · Colmeias cheias: ficou no lugar de ${o.swapped.name} (+${fmt(o.swapped.gold)} 🪙)` : ''}`;
}
function showSwarm(out) {
  const one = out.length === 1, o = out[0];
  if (one) {
    overlay(`<div class="card hero"><span class="cat">${o.isNew ? 'Espécie nova no Abelhário' : 'Roleta do Enxame'}</span>
      ${dIcon(o.sp.els, o.sp.rar, 'xl', 'pop', o.d ? o.d.id : S.nextId)}
      <h1>${o.sp.name}</h1><p><span class="rar-${o.sp.rar}">${RARITY[o.sp.rar].n}</span> · ${RARITY[o.sp.rar].f} · ${elTags(o.sp.els)}</p>
      <p class="${o.d && o.d.mut && !o.dup ? 'mut-line' : 'muted'}">${o.d && o.d.mut && !o.dup ? `🧬 Mutação: ${MUTS[o.d.mut].n} (${MUTS[o.d.mut].d})${o.swapped ? ` · ficou no lugar de ${o.swapped.name}` : ''}` : swLine(o)}</p>
      <div class="row" style="justify-content:center"><button class="btn primary" data-a="cancelEnd">Continuar</button><button class="btn" data-a="swAgain">Girar de novo</button>${o.d && !o.dup && !o.full ? `<button class="btn danger" data-a="swSell" data-id="${o.d.id}">Vender (+${fmt(sellValue(o.d))} 🪙)</button>` : ''}</div></div>`);
    return;
  }
  const cards = out.map(x => `<div class="swr r-${x.sp.rar}">${dIcon(x.sp.els, x.sp.rar, 'm', '', x.d ? x.d.id : 7)}<b class="rar-${x.sp.rar}">${x.sp.name}</b><small>${x.isNew ? 'NOVA! ' : ''}${x.dup ? (x.up ? `+${x.up} nível` : 'virou mel') : x.full ? 'virou mel' : x.d && x.d.mut ? '🧬 ' + MUTS[x.d.mut].n : RARITY[x.sp.rar].n}</small></div>`).join('');
  overlay(`<div class="card"><div class="hero"><span class="cat">Roleta do Enxame · 10 giros</span><h1>Seu enxame chegou!</h1></div>
    <div class="swgrid">${cards}</div>
    <div class="row" style="justify-content:center"><button class="btn primary" data-a="cancelEnd">Continuar</button></div></div>`);
}
function catchTicket(n = 1) { S.tickets += n; }

// ============================================================
