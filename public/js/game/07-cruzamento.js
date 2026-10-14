'use strict';
// CRUZAMENTO (vira um giro especial com as espécies que os pais podem gerar)
// ============================================================
function breedOutcomes(a, b) {
  const pool = new Set([...a.els, ...b.els]);
  const res = [];
  let remaining = 1;
  for (const L of LEGENDS) {
    const ch = Math.min(0.25, L.ch * MOD('legend'));
    if (L.els.every(e => pool.has(e))) { res.push({ sp: speciesFromLegend(L), p: remaining * ch }); remaining *= 1 - ch; }
  }
  const combos = [];
  a.els.forEach(x => b.els.forEach(y => combos.push(speciesFromEls([x, y]))));
  const per = remaining / combos.length;
  combos.forEach(sp => {
    const ex = res.find(r => r.sp.key === sp.key);
    if (ex) ex.p += per; else res.push({ sp, p: per });
  });
  return res.sort((x, y) => y.p - x.p);
}
function rollBreed(a, b) {
  const out = breedOutcomes(a, b);
  let r = Math.random();
  for (const o of out) { if ((r -= o.p) <= 0) return o.sp; }
  return out[out.length - 1].sp;
}
function layEgg(sp, free = false) {
  if (!free) sfx('ovoColocado');
  S.eggs.push({ id: S.nextId++, sp, prog: 0, dur: RARITY[sp.rar].egg, free });
}
const BREED_REST = 45; // segundos de descanso dos pais depois de cruzar
function breed() {
  const a = S.dragons.find(d => d.id === S.breedA), b = S.dragons.find(d => d.id === S.breedB);
  if (!a || !b) return;
  if (S.wheel && S.wheel.until > performance.now()) return;
  if (a.lvl < 3 || b.lvl < 3) { toast('Muito jovens', 'As duas abelhas precisam de nível 3 ou mais.', 'bad'); return; }
  const rest = Math.max(a.rest || 0, b.rest || 0) - S.t;
  if (rest > 0) { toast('Descansando', `Os pais podem cruzar de novo em ${Math.ceil(rest)}s.`, 'bad'); return; }
  if (!spendGold(breedCost(a, b))) return;
  const sp = rollBreed(a, b);
  a.rest = b.rest = S.t + BREED_REST;
  S.stats.breeds++; addXp(5); sfx('cruzar');
  startReel(sp, false, breedOutcomes(a, b), { res: [sp], love: true });
  S.tab = 'chocadeira';
}
function hatch(id) {
  const i = S.eggs.findIndex(e => e.id === id);
  const egg = S.eggs[i];
  if (!egg || egg.prog < egg.dur) return;
  if (S.dragons.length >= capacity()) { toast('Sem espaço', 'Compre outra colmeia para chocar este ovo.', 'bad'); return; }
  S.eggs.splice(i, 1);
  const isNew = !S.dex[egg.sp.key];
  const nd = addDragon(egg.sp);
  if (Math.random() < MUT_CHANCE) { nd.mut = wpick(MUTS); S.stats.mutants++; }
  const mutTxt = nd.mut ? `🧬 Mutação: ${MUTS[nd.mut].n} (${MUTS[nd.mut].d})` : '';
  S.stats.eggsHatched++; S.stats.byRarity[egg.sp.rar]++;
  if (egg.sp.rar === 'L' && S.stats.firstLegendT === null) S.stats.firstLegendT = S.t;
  addXp(10 * RARITY[egg.sp.rar].rv + (isNew ? 15 : 0));
  if (isNew || RARITY[egg.sp.rar].rv >= 3) sfx('revelacao', { raridade: RAR_SOM[egg.sp.rar] }); else sfx('chocar');
  if (isNew || RARITY[egg.sp.rar].rv >= 3) {
    overlay(`<div class="card hero"><span class="cat">${isNew ? 'Espécie nova no Abelhário' : 'Nasceu uma abelha'}</span>
      ${dIcon(egg.sp.els, egg.sp.rar, 'xl', 'pop', S.nextId)}
      <h1>${egg.sp.name}</h1><p><span class="rar-${egg.sp.rar}">${RARITY[egg.sp.rar].n}</span> · ${RARITY[egg.sp.rar].f} · ${elTags(egg.sp.els)}</p>${mutTxt ? `<p class="mut-line">${mutTxt}</p>` : ''}
      <button class="btn primary" data-a="cancelEnd">Continuar</button></div>`);
  } else toast(`Nasceu: ${egg.sp.name}!`, RARITY[egg.sp.rar].n + (mutTxt ? ' · ' + mutTxt : ''), nd.mut ? 'ach' : '');
}
const speedCost = egg => Math.max(1, Math.ceil((egg.dur - egg.prog) / 8));
function speedEgg(id) {
  const egg = S.eggs.find(e => e.id === id);
  if (!egg || egg.prog >= egg.dur) return;
  if (!spendGems(speedCost(egg))) return;
  egg.prog = egg.dur; S.stats.eggsSpedUp++;
}

// ============================================================
