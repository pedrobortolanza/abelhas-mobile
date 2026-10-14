'use strict';
// MISSÕES, EVENTOS E CONQUISTAS
// ============================================================
function newMission(exclude = []) {
  const tpl = pick(MISSION_TPL.filter(t => !exclude.includes(t.k) && (t.k !== 'breed' || S.labOpen)));
  const target = tpl.tgt(S.level);
  return { k: tpl.k, target, base: S.stats[tpl.stat], gold: round5(80 * Math.pow(1.45, S.level - 1)), gems: 1 + (S.level >= 6 ? 1 : 0) + (S.level >= 12 ? 1 : 0), xp: 20 + 8 * S.level };
}
function initialMissions() {
  return [
    { k: 'collect', target: 1, base: 0, gold: 60, gems: 1, xp: 15 },
    { k: 'harvest', target: 2, base: 0, gold: 60, gems: 1, xp: 15 },
    { k: 'feed', target: 2, base: 0, gold: 80, gems: 1, xp: 15 },
  ];
}
const missionTpl = m => MISSION_TPL.find(t => t.k === m.k);
const missionProg = m => Math.min(m.target, S.stats[missionTpl(m).stat] - m.base);
function claimMission(i) {
  const m = S.missions[i];
  if (!m || missionProg(m) < m.target) return;
  addGold(m.gold); addGems(m.gems); addXp(m.xp); S.stats.missionsDone++; sfx('missao');
  S.missions[i] = newMission(S.missions.map(x => x.k));
  toast('Missão concluída!', `+${fmt(m.gold)} de mel · +${m.gems} de geleia real`);
}
function triggerEvent() {
  const type = S.season === 'chuvas' && Math.random() < 0.3 ? 'chuva' : pick(Object.keys(EVENTS));
  const ev = EVENTS[type];
  S.event = { type, until: S.t + ev.dur };
  S.stats.eventsSeen++;
  if (type === 'chuva') S.buffs.chuva = S.t + ev.dur;
  if (type === 'colheita') S.buffs.colheita = S.t + ev.dur;
  if (type === 'ovo') S.lostEgg = { until: S.t + ev.dur, x: rnd(10, 80), y: rnd(25, 75) };
  if (type === 'mercador') S.event.price = 400 * S.level;
  toast(`${ev.i} ${ev.n}`, ev.d, 'ach');
  sfx({ chuva: 'chuvaOuro', colheita: 'colheitaFarta', ovo: 'ovoPerdido', selvagem: 'dragaoSelvagem', mercador: 'mercador' }[type] || 'evento');
  S.nextEvent = S.t + rnd(60, 100);
}
function catchEgg() {
  if (!S.lostEgg) return;
  S.lostEgg = null;
  S.stats.lostEggs++; sfx('ovoPego');
  catchTicket(1); toast('Você pegou a ficha!', '+1 ficha da Roleta do Enxame.', 'ach');
  return;
  const pool = ALL_SPECIES.filter(s => s.rar === 'R' || s.rar === 'E');
  layEgg(pick(pool), true);
  toast('Você pegou o ovo!', 'Ele foi para a chocadeira, sem ocupar espaço.', 'ach');
}
function buyMerchant() {
  if (!(S.event && S.event.type === 'mercador' && S.event.until > S.t)) return;
  if (!spendGold(S.event.price)) return;
  addGems(10); S.event.until = S.t; sfx('gemas');
  toast('Negócio fechado', '+10 de geleia real');
}
// v8.0: conquistas dão 40% menos geleia real
ACH.forEach(a => { a.g = Math.max(1, Math.round(a.g * 0.6)); });
function checkAchievements() {
  for (const a of ACH) {
    if (S.ach[a.id] === undefined && a.c(S.stats)) {
      S.ach[a.id] = S.t; addGems(a.g); sfx('conquista');
      toast(`🏆 ${a.n}`, `${a.d} +${a.g} de geleia real`, 'ach');
    }
  }
}
function score() {
  const st = S.stats;
  const dragons = S.dragons.reduce((a, d) => a + RARITY[d.rar].rv * 100 + d.lvl * 15, 0);
  const parts = {
    'Mel produzido': Math.floor(st.goldEarned / 10),
    'Abelhas': dragons,
    'Espécies descobertas': Object.keys(S.dex).length * 150,
    'Conquistas': Object.keys(S.ach).length * 250,
    'Arena': (Math.min(S.league, 9) - 1) * 600 + S.leagueFight * 200 + st.battlesWon * 40,
    'Vespa Rainha adormecida': st.bossDefeated ? 2000 : 0,
    'Ataque final': isActs()
      ? ACTS.slice(0, S.act + (S.finalResult && S.finalResult.win ? 1 : 0)).reduce((a, x) => a + x.pts, 0) + st.finalPerfect * 1500 + (S.finalResult && !S.finalResult.win ? Math.round(S.finalResult.dmgPct * curAct().pts * 0.5) : 0)
      : S.mode === 'infinito'
      ? st.finalWins * 12000 + st.finalPerfect * 3000 + (S.finalResult && !S.finalResult.win ? Math.round(S.finalResult.dmgPct * 6000) : 0)
      : S.finalResult ? (S.finalResult.win ? 12000 + (S.finalResult.lost === 0 ? 3000 : 0) : Math.round(S.finalResult.dmgPct * 6000)) * modeFactor() : 0,
    'Nível do jogador': S.level * 200,
    'Missões': st.missionsDone * 100,
    'Invasões repelidas': st.raidsWon * 1500,
  };
  // o que gerou cada linha de pontos (o resumo mostra "19 → 3.800 pts", não só os pontos)
  const what = {
    'Mel produzido': fmt(st.goldEarned) + ' de mel', 'Abelhas': S.dragons.length + ' abelha(s)', 'Espécies descobertas': Object.keys(S.dex).length + ' espécie(s)',
    'Conquistas': Object.keys(S.ach).length + ' conquista(s)', 'Arena': `liga ${LEAGUES[Math.min(S.league, 8) - 1]} · ${st.battlesWon} vitória(s)`, 'Vespa Rainha adormecida': st.bossDefeated ? 'vencida no ninho' : 'não',
    'Ataque final': isActs() ? `${S.act + (S.finalResult && S.finalResult.win ? 1 : 0)} de ${ACTS.length} atos` : S.finalResult ? (S.finalResult.win ? 'vencido' : 'perdido') : '-',
    'Nível do jogador': 'nível ' + S.level, 'Missões': st.missionsDone + ' missão(ões)', 'Invasões repelidas': st.raidsWon + ' invasão(ões)',
  };
  return { parts, what, total: Object.values(parts).reduce((a, b) => a + b, 0) };
}
function rankFor(total) {
  const f = modeFactor();
  const T = [['S', 60000], ['A', 35000], ['B', 18000], ['C', 8000]];
  let r = 'D';
  for (const [k, v] of T) if (total >= v * f) { r = k; break; }
  // v8.2: perder limita a nota. Nos atos: cair no Ato I dá no máximo C, no II no máximo B, no III no máximo A; S só vencendo tudo
  const lost = S && S.finalResult && !S.finalResult.win, ended = S && S.ended && !(S.finalResult && S.finalResult.win);
  if (lost || (isActs() && ended)) {
    const cap = isActs() ? ['C', 'B', 'A'][Math.min(S.act || 0, 2)] : 'B', ord = 'SABCD';
    if (ord.indexOf(r) < ord.indexOf(cap)) r = cap;
  }
  return r;
}

// ============================================================
