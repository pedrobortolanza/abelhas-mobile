'use strict';
// ARENA
// ============================================================
function fighterFromDragon(d) {
  return { name: d.name, els: d.els, rar: d.rar, lvl: d.lvl, hpMax: hpOf(d), hp: hpOf(d), atk: atkOf(d), cd: 0, xcd: 0, move: d.move || null, did: d.id, skin: d.skin, critB: mutOf(d, 'crit') + vetOf(d, 'crit'), asc: d.asc || null };
}
function randomSpeciesOfRarity(r) {
  return pick(ALL_SPECIES.filter(s => s.rar === r));
}
function enemyTeam(league, fight, bonus = 0) {
  const n = Math.min(3, Math.ceil((league + fight) / 2));
  const lvl = oldLv(1 + (league - 1) * 2 + fight + bonus);
  const team = [];
  for (let k = 0; k < n; k++) {
    const sp = randomSpeciesOfRarity(pick(LEAGUE_RARITY[league - 1]));
    const f = fighterFromDragon({ ...sp, lvl });
    const k2 = foeK(); f.hp = f.hpMax = Math.round(f.hpMax * 0.95 * k2); f.atk = Math.round(f.atk * 0.95 * k2);
    team.push(f);
  }
  return team;
}
// Invasão do inimigo da run: tipos do rival, mais forte a cada invasão e conforme a liga
function raidTeam() {
  const R = RIVALS[S.rival], n = S.raid.n;
  const lvl = oldLv(Math.min(S.league, 8) * 2 + n);
  const pool = [[R.els[0]], [R.els[1]], R.els];
  return Array.from({ length: n === 1 ? 2 : 3 }, (_, k) => {
    const sp = speciesFromEls(k === 2 ? R.els : pick(pool));
    const f = fighterFromDragon({ ...sp, lvl });
    f.name = R.u; f.hp = f.hpMax = Math.round(f.hpMax * (R.hp || 1) * foeK()); f.atk = Math.round(f.atk * 0.95 * foeK());
    return f;
  });
}
function raidStart() {
  const R = RIVALS[S.rival];
  S.raid = { n: S.raidIdx + 1, until: S.t + RAID_WAIT }; S.raidIdx++;
  sfx('tremor', { intensidade: 0.5 });
  overlay(`<div class="card hero"><span class="cat">Inimigo da partida · invasão ${S.raid.n} de ${S.raids.length}</span>
    <div class="row" style="justify-content:center">${dIcon(R.els, 'E', 'xl', 'flip', 9)}</div>
    <h1>${R.i} ${R.n} atacam!</h1><p>${R.d} Você tem ${RAID_WAIT}s para defender. Vencer rende mel, geleia real e uma relíquia.</p>
    <div class="row" style="justify-content:center"><button class="btn primary big" data-a="raidGo">🛡️ Defender</button><button class="btn" data-a="raidSkip">Deixar</button></div></div>`);
}
function raidPenalty() {
  const R = RIVALS[S.rival];
  let txt = '';
  if (S.rival === 'formigas') { const n = Math.floor(S.gold * 0.3); S.gold -= n; txt = `Levaram ${fmt(n)} de mel.`; }
  else if (S.rival === 'vespas') { let n = 0; S.farms.forEach(f => { if (f.crop) { f.crop = null; f.prog = 0; n++; } }); txt = n ? `Queimaram ${n} canteiro(s) de flores.` : 'Não acharam flores para queimar.'; }
  else if (S.rival === 'besouros') { S.buffs.frio = S.t + 90; txt = 'As colmeias esfriaram: metade do mel por 90s.'; }
  else { const n = Math.floor(S.food * 0.5); S.food -= n; txt = `Levaram ${fmt(n)} de néctar.`; }
  S.raid = null; S.stats.raidsLost++;
  toast(`${R.i} ${R.n} saquearam a colmeia`, txt, 'bad');
}
// Caminho da Arena: 3 caminhos para cada luta; o último da liga é sempre uma luta
function ensureRoute() {
  if (S.route && S.route.league === S.league && S.route.fight === S.leagueFight) return S.route.choices;
  let choices;
  if (S.leagueFight >= 2) choices = ['luta', 'elite'];
  else { const set = new Set(); while (set.size < 3) set.add(wpick(NODES)); choices = [...set]; }
  S.route = { league: S.league, fight: S.leagueFight, choices };
  return choices;
}
function advanceRoute(text) {
  S.route = null; S.stats.routeNodes++;
  S.leagueFight++;
  if (S.leagueFight >= 3) {
    S.leagueFight = 0; S.league++;
    if (S.league > LEAGUES.length) { towerPart('trofeu'); return 'Você venceu a liga dos Campeões! Ganhou o Troféu dos Campeões, a última peça da Torre da Ascensão.'; }
    return `Promovido para a liga ${LEAGUES[S.league - 1]}!`;
  }
  return text || `Etapa ${S.leagueFight} de 3 da liga ${LEAGUES[S.league - 1]} concluída.`;
}
function takeNode(k) {
  if (S.battle || S.finalPhase || S.league > LEAGUES.length || leagueLocked() || !ensureRoute().includes(k)) return;
  const L = Math.min(S.league, 8), base = 90 * Math.pow(L, 1.9);
  if (NODES[k] && NODES[k].fight) { S.battleNode = k; startBattle('arena'); return; }
  if (k === 'misterio') {
    const r = Math.random();
    if (r < 0.3) { S.battleNode = 'elite'; toast('💫 Emboscada!', 'Era uma abelha de elite escondida. Lute!', 'bad'); startBattle('arena'); return; }
    if (r < 0.65) { layEgg(pick(ALL_SPECIES.filter(s => s.rar === 'R' || s.rar === 'E')), true); toast('💫 Um ovo!', advanceRoute('O mistério era um ovo raro. Foi para a chocadeira.'), 'ach'); }
    else { const g = Math.round(base * 2.5); addGold(g); toast('💫 Pote de mel!', `+${fmt(g)} de mel. ` + advanceRoute(), 'ach'); }
  } else if (k === 'tesouro') {
    const g = Math.round(base * 1.5), m = 2 + L; addGold(g); addGems(m); sfx('gemas');
    toast('💰 Tesouro', `+${fmt(g)} de mel e +${m} de geleia real. ` + advanceRoute(), 'ach');
  } else if (k === 'treino') {
    const ups = teamDragons().filter(d => d.lvl < MAX_DLVL);
    ups.forEach(d => { d.lvl++; S.stats.maxDragonLvl = Math.max(S.stats.maxDragonLvl, d.lvl); });
    sfx('nivelJogador');
    toast('⬆️ Treino', `${ups.length ? ups.map(d => d.name).join(', ') + ' subiram 1 nível.' : 'O time já está no nível máximo.'} ` + advanceRoute(), 'ach');
  }
  addXp(10 * L);
}
function bossTeam(final) {
  if (isActs()) {
    const A = curAct();
    let hp = A.hp, atk = A.atk;
    if (!final) { hp = Math.round(hp * 0.8); atk = Math.round(atk * 0.8); }
    else if (S.weakened) hp = Math.round(hp * 0.7);
    if (final && S.necroBoss && S.act === 2) hp = Math.round(hp * S.necroBoss);
    // v8.2: o chefe não olha mais para as abelhas fora da luta (o powerK geral saiu daqui), só para o time abaixo
    // v8.1: o chefe cresce com o time que entra na luta: +40% de vida por abelha ascendida, +20% por ataque comprado, +10% por mutação do Laboratório
    const tk = 1 + teamDragons().reduce((a, d) => a + (d.asc ? 0.4 : 0) + (d.move && ATTACKS[d.move] ? 0.2 : 0) + (d.mut && MUTS[d.mut] && MUTS[d.mut].lab ? 0.1 : 0), 0);
    hp = Math.round(hp * tk); atk = Math.round(atk * (1 + (tk - 1) * 0.35));
    return [{ name: final ? A.boss : A.boss + ' no ninho', els: [], disp: A.disp, rar: 'L', lvl: 99, hpMax: hp, hp, atk, cd: 0, boss: true }];
  }
  const b = MODES[S.mode].boss, k = S.mode === 'infinito' ? Math.pow(1.35, S.wave) : 1;
  let hp = Math.round(b.hp * k), atk = Math.round(b.atk * k);
  if (!final) { hp = Math.round(hp * 0.8); atk = Math.round(atk * 0.8); }
  else if (S.weakened) hp = Math.round(hp * 0.7);
  return [{ name: final ? 'Vespa Rainha' : 'Vespa Rainha adormecida', els: [], disp: ['trevas', 'fogo'], rar: 'L', lvl: 99, hpMax: hp, hp, atk, cd: 0, boss: true }];
}
function teamDragons() {
  let ids = S.team.filter(id => S.dragons.some(d => d.id === id));
  if (!ids.length) ids = [...S.dragons].sort((a, b) => powerOf(b) - powerOf(a)).slice(0, 3).map(d => d.id);
  S.team = ids;
  return ids.map(id => S.dragons.find(d => d.id === id));
}
function startBattle(kind) {
  if (S.battle) return;
  const team = teamDragons().map(d => { const f = fighterFromDragon(d); f.hp = f.hpMax = myHp(d); f.atk = myAtk(d); return f; });
  let foes;
  if (S.finalPhase !== (kind === 'final')) return;
  if (kind === 'final') { foes = bossTeam(true); S.weakened = false; }
  else if (kind === 'boss') { if (S.league <= LEAGUES.length) return; foes = bossTeam(false); }
  else if (kind === 'wild') {
    if (!(S.event && S.event.type === 'selvagem' && S.event.until > S.t)) return;
    foes = enemyTeam(Math.min(S.league, 8), 2, 1).slice(0, 1).map(f => { f.hp = f.hpMax = Math.round(f.hpMax * 1.6); f.name += ' Selvagem'; return f; });
    S.event.until = S.t; // consome o evento
  } else if (kind === 'raid') {
    if (!S.raid) return;
    foes = raidTeam();
  } else {
    if (S.league > LEAGUES.length) return;
    const node = S.battleNode || 'luta', elite = node === 'elite';
    foes = enemyTeam(S.league, S.leagueFight, elite ? 2 : node === 'duelo' ? 3 : 0);
    if (elite) foes.forEach(f => { f.hp = f.hpMax = Math.round(f.hpMax * 1.3); f.name += ' Elite'; });
    if (node === 'duelo') { foes = foes.slice(0, 1); foes[0].hp = foes[0].hpMax = Math.round(foes[0].hpMax * 2.2); foes[0].atk = Math.round(foes[0].atk * 1.25); foes[0].name += ' Campeã'; }
    if (node === 'misterio') foes = foes.map(f => { const sp = randomSpeciesOfRarity(f.rar), g = fighterFromDragon({ ...sp, lvl: f.lvl }); g.hp = g.hpMax = Math.round(g.hpMax * 1.1); return g; });
  }
  S.battle = { kind, team, foes, pi: 0, ei: 0, log: [], over: false, turn: 0, lost: 0, node: kind === 'arena' ? (S.battleNode || 'luta') : null };
  S.battleNode = null;
  S.lastResult = null;
  logB(`A batalha começou! ${team[0].name} contra ${foes[0].name}.`);
  sfx('batalhaInicio'); if (kind !== 'final') music('batalha');
  S.stats.battles++;
}
function logB(txt, cls = '') { const B = S.battle; B.log.push({ txt, cls }); if (B.log.length > 40) B.log.shift(); }
function moveEl(f, kind) {
  if (f.boss) return pick(EL_KEYS);
  if (kind === 'x') { const A = ATTACKS[f.move]; return !A || A.el === null ? null : A.el === 'second' ? (f.els[1] || f.els[0]) : f.els[0]; }
  return kind === 'sp' ? (f.els[1] || f.els[0]) : f.els[0];
}
function movePower(f, kind) { if (kind === 'x') return ATTACKS[f.move] ? ATTACKS[f.move].pow : 1; return kind === 'sp' ? (f.rar === 'L' || f.boss ? 2.0 : 1.7) * (f.asc === 'sabia' ? 1.4 : 1) : 1; }
function doAttack(a, d, kind, isPlayer) {
  const el = moveEl(a, kind);
  const A = kind === 'x' ? ATTACKS[a.move] : null;
  let m = el ? eff(el, d.els) : 1;
  if (isPlayer && m > 1) m *= MOD('eff') / 1.5;
  const crit = Math.random() < (isPlayer ? MOD('crit') + (A && A.crit || 0) + (a.critB || 0) : 0.12);
  const exe = a.asc === 'carrasca' && d.hp < d.hpMax * 0.35;
  const dmg = Math.max(1, Math.round(a.atk * movePower(a, kind) * m * (crit ? 1.5 : 1) * (exe ? 2 : 1) * rnd(0.9, 1.1)));
  d.hp = Math.max(0, d.hp - dmg);
  if (d.hp <= 0 && d.asc === 'guardia' && !d.guardUsed) { d.hp = 1; d.guardUsed = true; logB(`🛡️ ${d.name} aguentou firme com 1 de vida!`, 'se'); }
  if (exe) logB(`🪓 ${a.name} executou o golpe da Carrasca!`, 'cr');
  if (kind === 'sp') { a.cd = a.asc === 'sabia' ? 2 : 3; if (a.asc === 'sabia' && isPlayer && S.battle) { let h = 0; S.battle.team.forEach(f => { if (f.hp > 0) { const v = Math.min(f.hpMax - f.hp, Math.round(f.hpMax * 0.1)); f.hp += v; h += v; } }); if (h) logB(`🔮 A sabedoria de ${a.name} curou ${h} de vida da equipe.`, 'se'); } } else if (a.cd > 0) a.cd--;
  if (kind === 'x') a.xcd = A.cd; else if (a.xcd > 0) a.xcd--;
  if (A && A.heal) { const h = Math.min(a.hpMax - a.hp, Math.round(a.hpMax * A.heal)); if (h > 0) { a.hp += h; logB(`${a.name} recuperou ${h} de vida.`, 'se'); } }
  const moveName = A ? `${A.n}${el ? ' ' + EL[el].i : ''}` : kind === 'sp' ? (a.boss ? 'Ferroada Real' : `Especial ${EL[el].i}`) : `Ataque ${EL[el].i}`;
  logB(`${a.name} usou ${moveName} e causou ${dmg} de dano${crit ? ' (crítico!)' : ''}.`, crit ? 'cr' : '');
  if (m > 1) logB('É super eficaz!', 'se'); else if (m < 1) logB('Não foi muito eficaz…', 'ne');
  fxQueue.push({ from: isPlayer ? 'me' : 'foe', to: isPlayer ? 'foe' : 'me', el, dmg, crit, m, kind, boss: !!a.boss, ko: d.hp <= 0 });
  if (isPlayer) {
    const me = a.did && S.dragons.find(x => x.id === a.did);
    if (me) { const st = beeSt(me); st.dmg += dmg; st.hit = Math.max(st.hit, dmg); if (d.hp <= 0) st.ko++; }
    S.stats.damageDealt += dmg; S.stats.bestHit = Math.max(S.stats.bestHit, dmg);
    if (crit) S.stats.crits++;
    if (m > 1) S.stats.superEffective++;
  } else S.stats.damageTaken += dmg;
}
// Efeitos visuais de ataque: investida, projétil do elemento, impacto e número de dano
const fxQueue = [];
function runFx() {
  const list = fxQueue.splice(0);
  list.forEach((fx, i) => setTimeout(() => playFx(fx), i * 480));
}
function fxSound(fx, phase) {
  if (phase === 'launch') {
    if (fx.boss && fx.kind === 'sp') sfx('soproAncestral');
    else sfx(fx.kind === 'sp' ? 'especial' : 'ataque', { elemento: fx.el || 'neutro' });
  } else {
    sfx(fx.crit ? 'critico' : 'acerto');
    if (fx.m > 1) sfx('superEficaz'); else if (fx.m < 1) sfx('poucoEficaz');
    if (fx.ko) setTimeout(() => sfx('nocaute'), 160);
  }
}
function playFx(fx) {
  fxSound(fx, 'launch');
  const src = document.querySelector(`.side[data-side="${fx.from}"] .dic`);
  const dst = document.querySelector(`.side[data-side="${fx.to}"] .dic`);
  if (!src || !dst || !src.animate) { setTimeout(() => fxSound(fx, 'hit'), 300); return; }
  const a = src.getBoundingClientRect(), b = dst.getBoundingClientRect();
  const dx = b.left - a.left, dy = b.top - a.top;
  src.animate([{ transform: 'none' }, { transform: `translate(${dx * 0.12}px, ${-10}px) rotate(${dx > 0 ? 6 : -6}deg)` }, { transform: 'none' }], { duration: 320, easing: 'ease-out' });
  const p = document.createElement('div');
  p.className = 'proj orb'; p.textContent = fx.el ? EL[fx.el].i : '✨'; p.style.setProperty('--oc', fx.el ? EL[fx.el].c : '#ffd968');
  p.style.left = (a.left + a.width / 2 - 15) + 'px'; p.style.top = (a.top + a.height / 3) + 'px';
  document.body.appendChild(p);
  const fly = p.animate([{ transform: 'translate(0,0) scale(.6)' }, { transform: `translate(${dx / 2}px, ${dy / 2 - 40}px) scale(1.2)` }, { transform: `translate(${dx}px, ${dy}px) scale(1.4)`, opacity: .9 }], { duration: 300, easing: 'ease-in' });
  fly.onfinish = () => {
    p.remove(); fxSound(fx, 'hit');
    dst.animate([{ transform: 'none', filter: 'none' }, { transform: 'translateX(-8px)', filter: 'brightness(2.2)' }, { transform: 'translateX(7px)', filter: 'brightness(1.5)' }, { transform: 'none', filter: 'none' }], { duration: 360 });
    floatText(`${fx.crit ? 'CRÍTICO ' : ''}-${fx.dmg}`, b.left + b.width / 2, b.top + b.height / 3, fx.m > 1 ? 'var(--good)' : fx.crit ? 'var(--gold)' : 'var(--bad)');
    const hx = b.left + b.width / 2, hy = b.top + b.height / 2, ec = fx.el ? EL[fx.el].c : '#ffd968';
    fxSpark(hx, hy, fx.crit ? 22 : 12, [ec, '#fff3c4', '#ffd968'], fx.crit ? 120 : 80, fx.crit ? 'star' : 'dot');
    const ring = document.createElement('i'); ring.className = 'hitring'; ring.style.left = hx + 'px'; ring.style.top = hy + 'px'; ring.style.setProperty('--oc', ec); fxLayer().appendChild(ring); setTimeout(() => ring.remove(), 500);
    const st = document.querySelector('.bstage');
    if (st && (fx.crit || fx.ko || fx.m > 1)) st.animate([{ transform: 'none' }, { transform: 'translate(-7px,3px)' }, { transform: 'translate(6px,-4px)' }, { transform: 'translate(-4px,2px)' }, { transform: 'none' }], { duration: 320 });
    if (fx.m > 1) { const t = document.createElement('div'); t.className = 'fxword'; t.textContent = 'Super eficaz!'; t.style.left = hx + 'px'; t.style.top = (b.top - 6) + 'px'; fxLayer().appendChild(t); setTimeout(() => t.remove(), 1100); }
  };
}
function bestMove(f, foe) {
  if (f.move && ATTACKS[f.move] && !f.xcd) {
    const xe = moveEl(f, 'x'), xv = (xe ? eff(xe, foe.els) : 1) * movePower(f, 'x');
    const sv = f.cd > 0 ? 0 : eff(moveEl(f, 'sp'), foe.els) * movePower(f, 'sp');
    if (xv >= sv && xv >= eff(moveEl(f, 'b'), foe.els)) return 'x';
  }
  if (f.cd > 0) return 'b';
  return eff(moveEl(f, 'sp'), foe.els) * movePower(f, 'sp') >= eff(moveEl(f, 'b'), foe.els) ? 'sp' : 'b';
}
function playerMove(kind) {
  const B = S.battle;
  if (!B || B.over) return;
  const p = B.team[B.pi], e = B.foes[B.ei];
  if (kind === 'sp' && p.cd > 0) return;
  if (kind === 'x' && (!p.move || p.xcd > 0)) return;
  B.turn++;
  doAttack(p, e, kind, true);
  if (e.hp <= 0) {
    logB(`${e.name} foi nocauteado!`, 'ko'); S.stats.kos++;
    const next = B.foes.findIndex(f => f.hp > 0);
    if (next < 0) return endBattle(true);
    B.ei = next; logB(`O oponente envia ${B.foes[next].name}.`);
    return;
  }
  const ek = e.cd === 0 && Math.random() < 0.7 ? 'sp' : 'b';
  doAttack(e, p, ek, false);
  if (MOD('heal') > 0) {
    let cur = 0;
    B.team.forEach(f => { if (f.hp > 0 && f.hp < f.hpMax) { const h = Math.min(f.hpMax - f.hp, Math.round(f.hpMax * MOD('heal'))); f.hp += h; cur += h; } });
    if (cur > 0) logB(`O Mel de Lavanda curou ${cur} de vida.`, 'se');
  }
  if (p.hp <= 0) {
    logB(`${p.name} foi nocauteado!`, 'ko'); S.stats.kosTaken++; B.lost++;
    const next = B.team.findIndex(f => f.hp > 0);
    if (next < 0) return endBattle(false);
    B.pi = next; logB(`Você envia ${B.team[next].name}.`);
  }
}
// No máximo uma relíquia extra vinda de batalha em cada ato
function battleRelic() {
  const a = S.act || 0;
  if (S.relicAct === a) return false;
  S.relicAct = a; S.bonusRelic = true; return true;
}
// Inimigos ficam mais fortes a cada ato e com cada relíquia de combate que o jogador tem
const ACT_FOE = [1, 1.2, 1.12];
function foeK() {
  const combat = S.relics.filter(k => ['ferrao', 'cera', 'lavanda', 'mira', 'elemental'].includes(k)).length;
  return (isActs() ? ACT_FOE[Math.min(S.act || 0, 2)] : 1) * (1 + 0.08 * combat) * powerK(1);
}
// Laboratório e Torre também deixam os inimigos mais fortes: +5% por mutação rara e +8% por ascensão (chefes sentem 70% disso)
function powerK(w) {
  const rare = S.dragons.filter(d => d.mut && MUTS[d.mut] && MUTS[d.mut].lab).length, asc = S.dragons.filter(d => d.asc).length;
  return 1 + w * (0.05 * rare + 0.08 * asc);
}
function surrender() { if (S.battle && !S.battle.over) { logB('Você desistiu.'); endBattle(false); } }
function endBattle(win) {
  const B = S.battle;
  B.over = true;
  const st = S.stats;
  const r = { win, kind: B.kind, gold: 0, gems: 0, xp: 0, text: '' };
  const actGo = win && B.kind === 'final' && isActs() && S.act < ACTS.length - 1;
  if (win) {
    st.battlesWon++; st.streak++; st.bestStreak = Math.max(st.bestStreak, st.streak);
    if (B.lost === 0 && (B.kind !== 'arena' || S.league >= 4)) st.flawless++;
    if (B.kind === 'final') {
      st.finalWins++; if (B.lost === 0) st.finalPerfect++;
      if (actGo) {
        const A = curAct(), N = ACTS[S.act + 1];
        r.gold = A.reward.gold; r.gems = A.reward.gems; r.xp = A.reward.xp;
        addCrystals(2, `Prêmio por vencer o ${A.n}.`);
        towerPart(S.act === 0 ? 'insignia' : 'coroa');
        r.text = `${A.boss} caiu! O ${A.n} acabou. Começa o ${N.n}, com mais lotes e ligas. Próximo chefe: ${N.boss}.`;
      } else if (S.mode === 'infinito') {
        S.wave++; r.gold = 3000 * S.wave; r.gems = 20; r.xp = 300;
        r.text = `Ataque ${S.wave} repelido! A Vespa Rainha volta em 15 minutos, mais forte.`;
      } else r.text = isActs() ? 'A Imperatriz do Ninho caiu! O enxame foi embora de vez, e sua colmeia agora é da Tropa do Mel.' : 'A colmeia resistiu! A Vespa Rainha fugiu para o Ninho de Papel, e sua colmeia agora é da Tropa do Mel.';
    } else if (B.kind === 'boss') {
      r.text = S.weakened ? `Você venceu ${bossName()} no ninho de novo.` : `Você feriu ${bossName()} no ninho! No próximo ataque terá 30% menos vida.`;
      S.weakened = true;
      st.bossDefeated++; r.gold = Math.round(8000 * modeFactor()); r.gems = 30; r.xp = 400; addCrystals(1, 'Achado no ninho do chefe.');
    } else {
      const L = Math.min(S.league, 8), f = B.kind === 'wild' ? 2 : S.leagueFight;
      r.gold = Math.round(90 * Math.pow(L, 1.9) * (1 + f * 0.5));
      r.gems = Math.ceil(L / 2); r.xp = 15 * L + 5 * f; // v8.0: metade da geleia por luta de liga
      if (B.kind === 'wild') { r.gold *= 3; r.gems *= 3; r.xp *= 2; st.wildWins++; r.text = 'A abelha selvagem foi derrotada!'; }
      else if (B.kind === 'raid') {
        const R = RIVALS[S.rival];
        r.gold = Math.round(Math.max(totalGps() * 60, 400) + r.gold); r.gems = 5 + 3 * S.raid.n; r.xp *= 2;
        r.text = `As ${R.n} fugiram! Você ganha uma relíquia ao fechar a batalha.`;
        S.raid = null; st.raidsWon++; if (!battleRelic()) r.text = `As ${R.n} fugiram! A relíquia deste ato já foi pega: +10 de geleia real.`, r.gems += 10;
      } else {
        let extra = '';
        if (B.node === 'elite') { r.gold *= 2; r.gems += 5; st.elites++; if (Math.random() < 0.25) addCrystals(1, 'A elite deixou cair um cristal.'); if (battleRelic()) extra = ' Elite vencida: uma relíquia espera por você.'; else { r.gems += 10; extra = ' Elite vencida: +10 de geleia real (a relíquia deste ato já foi pega).'; } }
        if (B.node === 'duelo') { r.gems *= 3; S.tickets += 1; extra = ' Duelo vencido: +1 ficha da roleta.'; }
        if (B.node === 'misterio') {
          const q = Math.random();
          if (q < 0.45) { S.tickets += 2; extra = ' Prêmio surpresa: 2 fichas da roleta!'; }
          else if (q < 0.8) { r.gold *= 3; extra = ' Prêmio surpresa: mel x3!'; }
          else if (battleRelic()) extra = ' Prêmio surpresa: uma relíquia!'; else { S.tickets += 2; extra = ' Prêmio surpresa: 2 fichas da roleta!'; }
        }
        r.text = advanceRoute(`Luta ${S.leagueFight + 1} de 3 da liga ${LEAGUES[S.league - 1]} vencida.`) + extra;
      }
    }
    // Atos II e III: batalhas dão 30% menos mel (o prêmio por vencer o ato fica igual)
    if (isActs() && S.act >= 1 && !actGo) r.gold = Math.round(r.gold * 0.7);
    // v8.0: no Ato I também, 20% menos
    else if (isActs() && !actGo) r.gold = Math.round(r.gold * 0.8);
    addGold(r.gold); addGems(r.gems); addXp(r.xp);
  } else {
    st.battlesLost++; st.streak = 0;
    r.xp = 5; addXp(5);
    if (B.kind === 'raid' && S.raid) raidPenalty();
    r.text = B.kind === 'final' ? `${bossName()} tomou a colmeia. Suas abelhas lutaram até o fim.` : 'Suas abelhas precisam ficar mais fortes. Alimente-as ou cruze espécies com vantagem de tipo.';
  }
  if (actGo) {
    S.finalPhase = false; S.act++; S.warned = []; S.weakened = false; st.actsWon = S.act;
    S.route = null; nextSeason();
  } else if (B.kind === 'final' && S.mode === 'infinito' && win) {
    S.finalPhase = false; S.nextInvasion = S.t + MODES.infinito.wave; S.warned = [];
    st.finalDmgPct = 1;
  } else if (B.kind === 'final') {
    const boss = B.foes[0];
    S.finalResult = { win, dmgPct: 1 - boss.hp / boss.hpMax, lost: B.lost };
    st.finalDmgPct = Math.max(st.finalDmgPct, S.finalResult.dmgPct);
    r.gold = r.gems = 0; r.xp = 0;
    // perdeu para o chefe: a partida acaba sozinha, sem dar para voltar à ilha
    if (!win) { const me = S; setTimeout(() => { if (S === me && !S.ended) endGame(); }, 2600); }
  }
  B.team.forEach(f => {
    const d = S.dragons.find(x => x.id === f.did); if (!d) return;
    const st = beeSt(d), r0 = vetRank(d); st.b++; if (win) st.w++;
    const r1 = vetRank(d);
    if (r1 > r0) {
      if (r1 >= 2 && !d.perk) d.perk = pick(Object.keys(VPERK));
      S.stats.veterans = Math.max(S.stats.veterans || 0, r1);
      setTimeout(() => toast(`🎖️ ${d.name} agora é ${VET[r1][1]}!`, `${st.w} vitórias juntas. +${Math.round((VET[r1][2] - 1) * 100)}% de vida e ataque${r1 === 2 ? ` e o traço ${VPERK[d.perk].n} (${VPERK[d.perk].d})` : ''}.`, 'ach'), 1200);
    }
  });
  S.lastResult = r;
  setTimeout(() => sfx(win ? 'vitoria' : 'derrota'), 750);
}
function closeBattle() {
  const B = S.battle;
  if (B && B.kind === 'final' && S.mode === 'infinito' && S.lastResult && S.lastResult.win) cena('ondaVencida', { modo: S.mode });
  if (B && B.kind === 'final' && isActs() && S.lastResult && S.lastResult.win && !S.finalResult) {
    const P = ACTS[S.act - 1], A = curAct();
    cena('atoVencido', { modo: S.mode, vars: { chefe: P.boss, ato: A.n, proximo: A.boss } }).then(() => toast(`${A.n} começou`, `${SEASONS[S.season].i} Nova estação: ${SEASONS[S.season].n}. Até ${A.hab} colmeias, ${A.farm} canteiros e liga ${LEAGUES[A.lg - 1]}.`, 'ach'));
  }
  S.battle = null; music(S.finalPhase ? 'invasao' : 'ilha'); if (!S.finalPhase && (S.mode === 'infinito' || isActs())) tension(0); }
// A cada ato a estação muda (tira os efeitos da antiga e aplica a nova)
function nextSeason() {
  const old = SEASONS[S.season];
  Object.entries(old.mods).forEach(([k, v]) => { S.mods[k] = k === 'lvlGems' ? S.mods[k] - v : S.mods[k] / v; });
  S.season = pick(Object.keys(SEASONS).filter(k => k !== S.season));
  applyMods(SEASONS[S.season].mods);
}
// Crises: do meio do Ato II até o fim, pedem uma reação rápida (tocar várias vezes ou pagar) antes do tempo acabar
const CRISES = {
  fogo: { i: '🔥', n: 'Incêndio no canteiro', d: 'Um canteiro pegou fogo! Jogue água antes que se espalhe.', dur: 20, taps: 6, btn: '💧 Jogar água', fail: 'O fogo queimou as flores de todos os canteiros.', can: () => S.farms.some(f => f.crop) },
  ladras: { i: '🦹', n: 'Ladras de mel', d: 'Vespas estão roubando os potes da colmeia! Espante todas.', dur: 15, taps: 8, btn: '👋 Espantar', fail: 'As ladras levaram 12% do seu mel.', can: () => S.gold > 200 },
  doente: { i: '🤒', n: 'Rainha doente', d: 'A rainha está com febre. Entregue néctar para ela melhorar.', dur: 40, pay: 'food', btn: 'Dar néctar', fail: 'Sem o néctar, as colmeias produzem 40% menos mel por 90 s.', can: () => true },
  rachado: { i: '🧱', n: 'Favo rachado', d: 'Uma rachadura no favo está vazando mel. Pague o conserto.', dur: 40, pay: 'gold', btn: 'Consertar', fail: 'O vazamento cortou o mel pela metade por 2 min.', can: () => true },
};
const crisisFrom = () => actEndAt(0) + ACTS[1].dur / 2;
function crisisTick(dt) {
  if (!isActs()) return;
  const C = S.crisis;
  if (C) {
    if (S.battle || S.relicOffer) { C.until += dt; return; }
    if (S.t >= C.until) crisisEnd(false);
    return;
  }
  if (S.nextCrisis === undefined) S.nextCrisis = crisisFrom();
  if (S.t < S.nextCrisis || S.battle || S.relicOffer || S.raid || S.finalPhase || invadeAt() - S.t < 45) return;
  const keys = Object.keys(CRISES).filter(k => k !== S.lastCrisis && CRISES[k].can());
  const k = pick(keys), K = CRISES[k];
  const amt = K.pay === 'food' ? 15 + 6 * S.level : K.pay === 'gold' ? round5(Math.max(300, totalGps() * 45)) : 0;
  S.crisis = { k, until: S.t + K.dur, dur: K.dur, taps: 0, amt };
  S.lastCrisis = k; sfx('tremor', { intensidade: 0.4 });
}
function crisisAct() {
  const C = S.crisis; if (!C) return;
  const K = CRISES[C.k];
  if (K.taps) { C.taps++; sfx('clique'); if (C.taps >= K.taps) crisisEnd(true); return; }
  if (K.pay === 'food') { if (S.food < C.amt) { toast('Néctar insuficiente', `Precisa de ${C.amt} de néctar. Colha flores no Jardim.`, 'bad'); return; } S.food -= C.amt; }
  else if (!spendGold(C.amt)) return;
  crisisEnd(true);
}
function crisisEnd(ok) {
  const C = S.crisis, K = CRISES[C.k];
  S.crisis = null; S.nextCrisis = S.t + 110 + Math.random() * 50;
  const st = S.stats;
  if (ok) {
    st.crisesOk = (st.crisesOk || 0) + 1;
    const g = 3 + (S.act || 0); addGems(g); addXp(30 + 20 * (S.act || 0));
    const cr = Math.random() < 0.2; if (cr) addCrystals(1, 'Achado depois da crise.');
    sfx('conquista'); toast(`${K.i} Crise resolvida!`, `+${g} de geleia real${cr ? ' e 1 cristal' : ''}.`, 'ach');
    return;
  }
  st.crisesFail = (st.crisesFail || 0) + 1;
  if (C.k === 'fogo') S.farms.forEach(f => { f.crop = null; f.prog = 0; });
  if (C.k === 'ladras') { const n = Math.round(S.gold * 0.12); S.gold -= n; }
  if (C.k === 'doente') S.buffs.doente = S.t + 90;
  if (C.k === 'rachado') S.buffs.rachado = S.t + 120;
  sfx('erro'); toast(`${K.i} ${K.n}`, K.fail, 'bad');
}
function crisisBox() {
  const C = S.crisis; if (!C) return '';
  const K = CRISES[C.k], left = Math.max(0, C.until - S.t);
  const label = K.taps ? `${K.btn} (${C.taps}/${K.taps})` : `${K.btn} ${costTag(C.amt, K.pay === 'food' ? 'f' : undefined)}`;
  return `<div class="box crisis-box"><span class="cr-ic">${K.i}</span><div class="cr-txt"><b>${K.n}</b><span>${K.d}</span><div class="bar"><i style="width:${pct(left, C.dur)}%"></i></div></div><button class="btn danger" data-a="crisis">${label}</button></div>`;
}
// Abelha Necromante: aparece uma vez, 2,5 min antes do fim do Ato II, com 3 pactos de troca. Recusar não custa nada, mas ela não volta.
const NECRO_AT = () => actEndAt(1) - 150;
const strongest = () => [...S.dragons].sort((a, b) => powerOf(b) - powerOf(a))[0];
const outsideTeam = () => S.dragons.filter(d => !S.team.includes(d.id));
const PACTS = {
  sangue: { i: '🩸', n: 'Pacto de Sangue', g: '+35% de ataque para todas as abelhas', c: 'Todas perdem 25% de vida', can: () => true },
  ouro: { i: '💰', n: 'Ouro Maldito', g: () => `+${fmt(Math.max(5000, Math.round(totalGps() * 300)))} de mel agora`, c: 'As colmeias produzem 25% menos mel até o fim', can: () => true },
  sacrificio: { i: '⚰️', n: 'Sacrifício', g: 'As outras abelhas ganham +30% de ataque para sempre', c: () => `${strongest().name}, sua abelha mais forte, vai embora com ela`, can: () => S.dragons.length >= 3 },
  visao: { i: '👁️', n: 'Visão do Fim', g: 'A Imperatriz do Ninho chega com 25% menos vida', c: () => `Você perde toda a geleia real (${S.gems}) e todos os cristais (${S.crystals || 0})`, can: () => S.gems + (S.crystals || 0) >= 10 },
  almas: { i: '👻', n: 'Troca de Almas', g: 'Uma abelha Lendária nova, no nível das suas', c: '2 abelhas que estão fora do time somem', can: () => outsideTeam().length >= 2 },
};
const pv = v => typeof v === 'function' ? v() : v;
function necroCheck() {
  if (!isActs() || S.necroDone || S.act !== 1 || S.t < NECRO_AT() || S.battle || S.relicOffer || S.raid || S.crisis || S.finalPhase) return;
  S.necroDone = true;
  S.necroOffer = Object.keys(PACTS).filter(k => PACTS[k].can()).sort(() => Math.random() - 0.5).slice(0, 3);
  S.choosing = true; sfx('despertar'); renderNecro();
}
function renderNecro() {
  overlay(`<div class="card pick necro">
    <div class="hero">${dIcon(['trevas'], 'L', 'xl', 'necro-bee', 666)}<span class="cat">Uma visita das sombras</span><h1>A Abelha Necromante</h1>
      <p>“Sinto o cheiro da Imperatriz chegando… Posso ajudar você. Mas tudo tem um preço.” Escolha um pacto ou recuse. Ela não volta.</p></div>
    <div class="choices">${S.necroOffer.map(k => { const P = PACTS[k]; return `<button class="choice relic" data-a="pact" data-k="${k}"><span class="ric">${P.i}</span><b>${P.n}</b><span class="pro">${pv(P.g)}</span><span class="con">${pv(P.c)}</span></button>`; }).join('')}</div>
    <div class="row" style="justify-content:center"><button class="btn" data-a="pact" data-k="nao">Recusar e mandá-la embora</button></div>
  </div>`);
}
function takePact(k) {
  if (!S || !S.necroOffer || (k !== 'nao' && !S.necroOffer.includes(k))) return;
  S.necroOffer = null; S.choosing = false; overlay(''); last = performance.now();
  if (k === 'nao') { toast('A Necromante foi embora', '“Que pena… a Imperatriz não será tão gentil.”'); return; }
  S.pact = k; S.stats.pacts = (S.stats.pacts || 0) + 1;
  if (k === 'sangue') applyMods({ atk: 1.35, hp: 0.75 });
  if (k === 'ouro') { addGold(Math.max(5000, Math.round(totalGps() * 300))); applyMods({ gold: 0.75 }); }
  if (k === 'sacrificio') { const d = strongest(); S.dragons = S.dragons.filter(x => x !== d); S.team = S.team.filter(t => t !== d.id); S.dragons.forEach(x => { x.atkUp = (x.atkUp || 0) + 0.3; }); }
  if (k === 'visao') { S.gems = 0; S.crystals = 0; S.necroBoss = 0.75; }
  if (k === 'almas') { const out = outsideTeam().sort(() => Math.random() - 0.5).slice(0, 2); S.dragons = S.dragons.filter(x => !out.includes(x)); const lv = Math.max(1, Math.round(S.dragons.reduce((a, x) => a + x.lvl, 0) / S.dragons.length)); const d = addDragon(randomSpeciesOfRarity('L'), lv); toast(`👻 ${d.name} chegou`, `Uma Lendária nível ${lv} saiu das sombras.`, 'ach'); }
  sfx('lendaria'); toast(`${PACTS[k].i} ${PACTS[k].n}`, `${pv(PACTS[k].g)}. O preço foi pago.`, 'ach');
}
function towerPart(k) {
  const T = S.tower, P = TOWER_PARTS.find(p => p.k === k);
  if (!T || !P || T.items.includes(k)) return;
  T.items.push(k); S.stats.towerParts = (S.stats.towerParts || 0) + 1;
  setTimeout(() => toast(`${P.i} ${P.n}!`, `Leve à Torre da Ascensão, no canto da ilha, para erguer o ${T.items.length}º andar.`, 'ach'), 1800);
}
function buildFloor() {
  const T = S.tower, P = TOWER_PARTS[T.floors];
  if (!P) return;
  if (!T.items.includes(P.k)) { toast('Falta uma peça', `${P.i} ${P.n}: ${P.from}.`, 'bad'); return; }
  if (!spendGold(P.cost)) return;
  T.floors++; sfx('nivelJogador'); lastMap = '';
  toast(`🗼 ${T.floors}º andar erguido!`, T.floors >= 3 ? 'A Torre está completa: suas ascendidas ganham +15% de vida e ataque.' : 'Você pode ascender uma abelha Épica ou Lendária.', 'ach');
}
function ascend(path) {
  const T = S.tower, d = S.dragons.find(x => x.id === S.towerSel);
  if (!ASC[path] || T.used >= T.floors || !ASC_ELIG(d)) return;
  d.asc = path; T.used++; S.stats.ascended = (S.stats.ascended || 0) + 1; S.towerSel = null;
  sfx('lendaria'); toast(`${ASC[path].i} ${d.name} ascendeu!`, `Agora é ${ASC[path].n}: ${ASC[path].d}`, 'ach');
}
function toggleTeam(id) {
  const has = S.team.includes(id);
  if (has) { if (S.team.length > 1) S.team = S.team.filter(t => t !== id); }
  else { if (S.team.length >= 3) S.team.shift(); S.team.push(id); }
}

// ============================================================
