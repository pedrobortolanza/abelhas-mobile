'use strict';
// ESPÉCIES E ATRIBUTOS
// ============================================================
function speciesFromEls(els) {
  const s = [...new Set(els)].sort((a, b) => EL_KEYS.indexOf(a) - EL_KEYS.indexOf(b));
  if (s.length === 1) {
    const e = s[0];
    return { key: e, name: EL[e].pn, els: s, rar: SPECIAL_EL.includes(e) ? 'R' : 'C' };
  }
  const rar = s.some(e => SPECIAL_EL.includes(e)) ? 'E' : 'R';
  return { key: s.join('+'), name: EL[s[0]].pre + EL[s[1]].suf, els: s, rar };
}
function speciesFromLegend(L) { return { key: 'L:' + L.k, name: L.n, els: L.els.slice(), rar: 'L' }; }
function allSpecies() {
  const out = [];
  EL_KEYS.forEach(e => out.push(speciesFromEls([e])));
  for (let i = 0; i < EL_KEYS.length; i++) for (let j = i + 1; j < EL_KEYS.length; j++) out.push(speciesFromEls([EL_KEYS[i], EL_KEYS[j]]));
  LEGENDS.forEach(L => out.push(speciesFromLegend(L)));
  return out;
}
const ALL_SPECIES = allSpecies();
// Modificador da partida (rainha e relíquias); fora de uma partida vale o padrão
const MOD = k => (S && S.mods ? S.mods[k] : MODS0[k]);
const isNative = d => !!(S && S.meadow && d.els && d.els.some(e => S.meadow.includes(e)));
const unlockLvl = k => (S && S.unlock ? S.unlock[k] : EL[k].unlock);
const mutOf = (d, k) => (d && d.mut && MUTS[d.mut] && MUTS[d.mut][k]) || (k === 'crit' ? 0 : 1);
// Torre da Ascensão: 3 peças (chefe do Ato I, chefe do Ato II, liga dos Campeões); cada peça + mel ergue um andar e libera uma ascensão
const TOWER_PARTS = [
  { k: 'insignia', n: 'Insígnia do General', i: '🎖️', from: 'Vença o General Vespa no fim do Ato I', cost: 2500 },
  { k: 'coroa', n: 'Coroa de Espinhos', i: '👑', from: 'Vença a Vespa Rainha no fim do Ato II', cost: 9000 },
  { k: 'trofeu', n: 'Troféu dos Campeões', i: '🏆', from: 'Vença a liga dos Campeões na Arena (Ato III)', cost: 20000 },
];
const ASC = {
  guardia: { n: 'Guardiã', i: '🛡️', d: '+40% de vida. Uma vez por batalha aguenta o golpe que a derrubaria e fica com 1 de vida.', hp: 1.4 },
  carrasca: { n: 'Carrasca', i: '🪓', d: '+25% de ataque. Causa o dobro de dano em inimigos com menos de 35% de vida.', atk: 1.25 },
  sabia: { n: 'Sábia', i: '🔮', d: 'Especial 40% mais forte, recarrega em 2 turnos e cura 10% da vida da equipe a cada uso.' },
};
const ASC_ELIG = d => d && (d.rar === 'E' || d.rar === 'L') && !d.asc;
// Abelhas veteranas: vitórias em batalha dão título e bônus; na Veterana ganha um traço de combate fixo
const VET = [[0, '', 1], [5, 'Experiente', 1.05], [12, 'Veterana', 1.1], [25, 'Heroína da Tropa', 1.15]];
const VPERK = { implacavel: { n: 'Implacável', d: '+8% de chance de crítico', crit: 0.08 }, sobrevivente: { n: 'Sobrevivente', d: '+15% de vida', hp: 1.15 }, feroz: { n: 'Feroz', d: '+12% de ataque', atk: 1.12 } };
const vetRank = d => { const w = (d && d.st && d.st.w) || 0; let r = 0; VET.forEach((v, i) => { if (w >= v[0]) r = i; }); return r; };
const vetOf = (d, k) => { if (!d) return k === 'crit' ? 0 : 1; const P = d.perk && VPERK[d.perk]; if (k === 'crit') return (P && P.crit) || 0; return VET[vetRank(d)][2] * ((P && P[k]) || 1); };
const beeSt = d => d.st || (d.st = { b: 0, w: 0, ko: 0, dmg: 0, hit: 0 });
const towerOf = () => (S && S.tower) || { items: [], floors: 0, used: 0 };
// bônus da ascensão; o 3º andar dá +15% em vida e ataque para todas as ascendidas
const ascOf = (d, k) => !d || !d.asc || !ASC[d.asc] ? 1 : (ASC[d.asc][k] || 1) * (towerOf().floors >= 3 ? 1.15 : 1);
const seasonOf = d => (S && S.season && d && d.els && d.els.includes(SEASONS[S.season].el) ? SEASON_BOOST : 1);
const gpsOf = d => RARITY[d.rar].gps * (1 + 0.4 * LV_K * (d.lvl - 1)) * MOD('gold') * (isNative(d) ? MEADOW_GOLD : 1) * (d.key === BETMEL.key ? 2 : 1) * mutOf(d, 'gold');
const hpOf = d => Math.round(RARITY[d.rar].hp * (1 + 0.2 * LV_K * (d.lvl - 1)));
const atkOf = d => Math.round(RARITY[d.rar].atk * (1 + 0.16 * LV_K * (d.lvl - 1)));
const myHp = d => Math.round(hpOf(d) * MOD('hp') * mutOf(d, 'hp') * seasonOf(d) * ascOf(d, 'hp') * vetOf(d, 'hp'));
const myAtk = d => Math.round(atkOf(d) * MOD('atk') * (1 + (d.atkUp || 0)) * mutOf(d, 'atk') * seasonOf(d) * ascOf(d, 'atk') * vetOf(d, 'atk'));
const powerOf = d => Math.round(hpOf(d) / 4 + atkOf(d) * 2);
// v8.0: alimentar ficou mais caro e sobe mais rápido por nível (Nv 20 custa ~1,8x o de antes)
const feedCost = lvl => Math.round(13 * Math.pow(1.27, lvl - 1) * MOD('feed'));
const sellValue = d => Math.round(25 * RARITY[d.rar].rv * (1 + (d.lvl - 1) * LV_K));
const breedCost = (a, b) => Math.round(30 * (RARITY[a.rar].rv + RARITY[b.rar].rv) * MOD('breed'));
const habitatCost = () => Math.round(150 * Math.pow(2.1, S.habitats.length - 1) * MOD('shop'));
const farmCost = () => Math.round(100 * Math.pow(1.8, S.farms.length - 2) * MOD('shop'));
const xpNeed = l => Math.round(40 * Math.pow(l, 1.6));
function eff(atkEl, defEls) {
  if (!atkEl || !defEls || !defEls.length) return 1;
  let m = 1;
  for (const d of defEls) {
    if (STRONG[atkEl].includes(d)) m *= 1.5;
    else if (STRONG[d] && STRONG[d].includes(atkEl)) m *= 0.7;
  }
  return m;
}
function ownedElements() { const s = new Set(); S.dragons.forEach(d => d.els.forEach(e => s.add(e))); return s; }

// ============================================================
