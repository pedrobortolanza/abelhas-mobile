'use strict';
// ESTADO (vive só na memória: fechou a aba, acabou a partida)
// ============================================================
let S = null;
function newStats() {
  return {
    clicks: 0, raidsWon: 0, raidsLost: 0, mutants: 0, routeNodes: 0, elites: 0, goldEarned: 0, goldSpent: 0, collects: 0, bestCollect: 0, peakGps: 0,
    foodHarvested: 0, foodSpent: 0, cropsPlanted: 0, cropsHarvested: 0,
    dragonsBought: 0, dragonsSold: 0, feeds: 0, maxDragonLvl: 1,
    breeds: 0, eggsHatched: 0, eggsSpedUp: 0, swarmSpins: 0, swarmDups: 0, swarmTen: 0, pityHits: 0, byRarity: { C: 1, R: 0, E: 0, L: 0 }, firstLegendT: null,
    battles: 0, battlesWon: 0, battlesLost: 0, streak: 0, bestStreak: 0, damageDealt: 0, damageTaken: 0,
    bestHit: 0, crits: 0, superEffective: 0, kos: 0, kosTaken: 0, flawless: 0, bossDefeated: 0, wildWins: 0, actsWon: 0, finalWins: 0, finalPerfect: 0, finalDmgPct: 0,
    gemsEarned: 0, gemsSpent: 0, missionsDone: 0, eventsSeen: 0, lostEggs: 0, xpTotal: 0, levelUps: 0,
  };
}
function newState(modeKey) {
  const st = {
    mode: modeKey, t: 0, running: true, paused: false, ended: false,
    gold: 250, food: 30, gems: 5, xp: 0, level: 1,
    dragons: [], habitats: [{ stored: 0 }], farms: [{ crop: null, prog: 0, lvl: 1, pick: 'trigo' }, { crop: null, prog: 0, lvl: 1, pick: 'trigo' }],
    eggs: [], hatchSlots: 1, tickets: SWARM.startTickets, pityE: 0, pityL: 0, freeAt: SWARM.free, feat: null, featUntil: 0, wheel: null, swRes: null, luck: 0, idleReel: null, selCrop: 'trigo', skinPick: null, gardener: false, gardenAcc: 0, spin: null, atkPick: null, jardimSel: null,
    league: 1, leagueFight: 0, battle: null, team: [], autoBattle: false, lastResult: null,
    missions: [], ach: {}, dex: {}, stats: newStats(),
    buffs: {}, event: null, nextEvent: 50, lostEgg: null, warned: [], finalPhase: false, finalResult: null, nextInvasion: 900, wave: 0, weakened: false,
    history: [{ t: 0, earned: 0, gps: 0 }], nextId: 1, tab: 'ilha', breedA: null, breedB: null, crystals: 1, nextCrystal: CRYSTAL_EVERY, labSel: null,
    tower: { items: [], floors: 0, used: 0 }, towerSel: null,
    mods: { ...MODS0 }, queen: null, relics: [], nextRelic: RELIC_EVERY, relicOffer: null, choosing: false,
  };
  // Prado sorteado: 3 tipos básicos nativos (liberados no nível 1); os outros 3 abrem nos níveis 2, 3 e 4
  const shuffled = [...BASE_EL].sort(() => Math.random() - 0.5);
  st.meadow = shuffled.slice(0, MEADOW_N).sort((a, b) => EL_KEYS.indexOf(a) - EL_KEYS.indexOf(b));
  st.unlock = {};
  EL_KEYS.forEach(k => { st.unlock[k] = EL[k].unlock; });
  st.meadow.forEach(k => { st.unlock[k] = 1; });
  shuffled.slice(MEADOW_N).forEach((k, i) => { st.unlock[k] = 2 + i; });
  st.nativeFlower = pick(Object.keys(CROPS));
  st.farms.forEach(f => { f.pick = CROPS[st.nativeFlower].lvl <= 1 ? st.nativeFlower : 'trigo'; });
  st.season = pick(Object.keys(SEASONS));
  st.rival = pick(Object.keys(RIVALS));
  const dur = MODES[modeKey].dur || 1200;
  st.act = 0;
  st.raids = modeKey === 'atos' ? ACTS.map((a, i) => actEndAt(i) - a.dur / 2) : RAID_AT.map(p => Math.round(dur * p)); st.raidIdx = 0; st.raid = null; st.raidWarned = -1;
  st.route = null; st.bonusRelic = false;
  return st;
}
function addDragon(sp, lvl = 1) {
  const d = { id: S.nextId++, key: sp.key, name: sp.name, els: sp.els.slice(), rar: sp.rar, lvl, born: S.t };
  S.dragons.push(d);
  if (!S.dex[sp.key]) S.dex[sp.key] = S.t || 0.01;
  return d;
}
const capacity = () => S.habitats.length * HAB_CAP;
const habDragons = i => S.dragons.slice(i * HAB_CAP, i * HAB_CAP + HAB_CAP);
const HIVE_K = 0.9; // v8.0: colmeias produzem 10% menos mel
const habGps = i => habDragons(i).reduce((a, d) => a + gpsOf(d), 0) * HIVE_K;
const goldMult = () => (S.buffs.chuva > S.t ? 2 : 1) * (S.buffs.frio > S.t ? 0.5 : 1) * (S.buffs.doente > S.t ? 0.6 : 1) * (S.buffs.rachado > S.t ? 0.5 : 1);
const farmMult = () => (S.buffs.colheita > S.t ? 3 : 1);
const totalGps = () => S.habitats.reduce((a, h, i) => a + habGps(i), 0) * goldMult();
const unlockedCrop = k => S.level >= CROPS[k].lvl;

// ============================================================
