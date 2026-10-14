'use strict';
// AÇÕES BÁSICAS
// ============================================================
function addGold(n) { n = Math.round(n); S.gold += n; S.stats.goldEarned += n; }
function spendGold(n) {
  if (S.gold < n) { toast('Mel insuficiente', `Faltam ${fmt(n - S.gold)} de mel.`, 'bad'); return false; }
  S.gold -= n; S.stats.goldSpent += n; return true;
}
function addGems(n) { S.gems += n; S.stats.gemsEarned += n; }
function spendGems(n) {
  if (S.gems < n) { toast('Geleia real insuficiente', `Você precisa de ${n} de geleia real.`, 'bad'); return false; }
  S.gems -= n; S.stats.gemsSpent += n; return true;
}
function addXp(n) {
  n = Math.round(n * MOD('xp'));
  S.xp += n; S.stats.xpTotal += n;
  while (S.level < MAX_PLVL && S.xp >= xpNeed(S.level)) {
    S.xp -= xpNeed(S.level); S.level++; S.stats.levelUps++;
    sfx('nivelJogador'); fxLevel(`Nível ${S.level}!`);
    const gems = 1 + Math.floor(S.level / 6) + MOD('lvlGems'); // v8.0: menos geleia por nível
    addGems(gems);
    const unlocks = [];
    EL_KEYS.forEach(k => { if (unlockLvl(k) === S.level) unlocks.push(EL[k].i + ' ' + EL[k].n); });
    Object.values(CROPS).forEach(c => { if (c.lvl === S.level) unlocks.push(c.i + ' ' + c.n); });
    if (S.level === 3) unlocks.push('Colher e replantar tudo');
    if (S.level === 5) unlocks.push('Coletar tudo');
    toast(`Nível ${S.level}!`, `+${gems} de geleia real${unlocks.length ? ' · Desbloqueado: ' + unlocks.join(', ') : ''}`, 'ach');
  }
}

function collect(i, ev) {
  const h = S.habitats[i];
  const amt = Math.floor(h.stored);
  if (amt < 1) return;
  h.stored -= amt;
  addGold(amt); S.stats.collects++; S.stats.bestCollect = Math.max(S.stats.bestCollect, amt);
  sfx('coletar', { quantidade: clamp(Math.ceil(Math.log10(amt + 1)), 1, 5) });
  addXp(2);
  if (ev) { floatText(`+${fmt(amt)}`, ev.clientX, ev.clientY); fxHoney(ev.clientX, ev.clientY, 2 + Math.ceil(Math.log10(amt + 1))); }
}
function collectAll(ev) {
  let total = 0;
  S.habitats.forEach((h, i) => { const a = Math.floor(h.stored); if (a >= 1) { h.stored -= a; total += a; S.stats.collects++; } });
  if (!total) return;
  addGold(total); S.stats.bestCollect = Math.max(S.stats.bestCollect, total); addXp(2);
  sfx('coletarTudo');
  if (ev) { floatText(`+${fmt(total)}`, ev.clientX, ev.clientY); fxHoney(ev.clientX, ev.clientY, 10); }
}
function plant(i, silent) {
  const f = S.farms[i];
  if (f.crop) return false;
  const k = unlockedCrop(f.pick || 'trigo') ? (f.pick || 'trigo') : 'trigo';
  const c = CROPS[k];
  if (S.gold < c.cost) { if (!silent) spendGold(c.cost); return false; }
  spendGold(c.cost);
  f.crop = k; f.prog = 0; S.stats.cropsPlanted++;
  if (!silent) sfx('plantar');
  return true;
}
function harvest(i, ev, silent) {
  const f = S.farms[i];
  if (!f.crop) return plant(i, silent);
  const c = CROPS[f.crop];
  if (f.prog < c.dur) return;
  const got = Math.round(cropFood(f.crop) * farmYield(f));
  S.food += got; S.stats.foodHarvested += got; S.stats.cropsHarvested++;
  addXp(1 + c.food / 15);
  if (ev) { floatText(`+${got} 🍖`, ev.clientX, ev.clientY, 'var(--food)'); fxHoney(ev.clientX, ev.clientY, 4, '.res.food'); }
  f.crop = null; f.prog = 0;
  if (!silent) sfx('colher');
  return true;
}
// Néctar de uma colheita: rainha, relíquias e a flor nativa do prado
// v8.0: colheitas dão 30% menos néctar (o XP da colheita continua o mesmo)
const FOOD_K = 0.7;
// v8.1: do Ato II em diante as flores rendem ainda menos (75% no Ato II, 60% no Ato III)
const actFood = () => isActs() ? [1, 0.75, 0.6][Math.min(S.act || 0, 2)] : 1;
const cropFood = k => Math.round(CROPS[k].food * FOOD_K * actFood() * MOD('food') * (S && k === S.nativeFlower ? NATIVE_FLOWER : 1));
function harvestAll() {
  let did = false;
  S.farms.forEach((f, i) => {
    if (f.crop && f.prog >= CROPS[f.crop].dur) did = harvest(i, null, true) || did;
  });
  S.farms.forEach((f, i) => { if (!f.crop) did = plant(i, true) || did; });
  if (did) sfx('colherTudo');
  else {
    const grow = S.farms.filter(f => f.crop).map(f => CROPS[f.crop].dur - f.prog);
    toast('Nada para colher ainda', grow.length ? `A próxima flor fica pronta em ${fmtTime(Math.max(0, Math.min(...grow)))}.` : 'Falta mel para plantar.');
  }
}
// Flor mais valiosa já liberada (a nativa conta em dobro na escolha)
function bestCrop() {
  const ks = Object.keys(CROPS).filter(unlockedCrop);
  return ks.includes(S.nativeFlower) ? S.nativeFlower : ks[ks.length - 1];
}
function setFarmCrop(i, k) {
  if (!unlockedCrop(k)) return;
  if (i === 'all') S.farms.forEach(f => { f.pick = k; }); else if (S.farms[i]) S.farms[i].pick = k;
  sfx('clique');
}
function upgradeFarm(i) {
  const f = S.farms[i];
  if (!f || (f.lvl || 1) >= FARM_MAX) return;
  if (!spendGold(farmUpCost(f.lvl || 1))) return;
  f.lvl = (f.lvl || 1) + 1; sfx('comprar'); addXp(6 + f.lvl * 2);
  toast(`Canteiro ${i + 1} no nível ${f.lvl}`, `Dá ${Math.round((farmYield(f) - 1) * 100)}% mais néctar e cresce ${Math.round((farmSpeed(f) - 1) * 100)}% mais rápido.`);
}
// Laboratório fechado até o nível 9; depois abre pagando mel. Cristais ganhos antes ficam guardados.
const LAB_OPEN = { lvl: 9, cost: 6000 };
const labLocked = () => !S.labOpen;
function openLab() {
  if (S.labOpen || S.level < LAB_OPEN.lvl) return;
  if (!spendGold(LAB_OPEN.cost)) return;
  S.labOpen = true; sfx('conquista'); addXp(20);
  toast('🧪 Laboratório aberto!', 'Escolha uma abelha e gaste cristais para dar uma mutação a ela.');
}
function hireGardener() {
  if (S.gardener || S.level < GARDENER.lvl) return;
  if (!spendGold(Math.round(GARDENER.cost * MOD('shop')))) return;
  S.gardener = true; sfx('conquista'); addXp(20);
  toast('Abelha Jardineira contratada!', 'Ela colhe e replanta os canteiros sozinha, com a flor escolhida em cada um.');
}
// Roleta: sorteia o prêmio na hora e entrega quando a roda para
function spinWheel(pay) {
  if (S.spin && S.spin.until > performance.now()) return;
  if (pay === 'gems' ? !spendGems(SPIN.gems) : !spendGold(Math.round(SPIN.gold * MOD('shop')))) return;
  let r = Math.random(), idx = SPIN_PRIZES.length - 1;
  for (let i = 0; i < SPIN_PRIZES.length; i++) { if ((r -= SPIN_PRIZES[i].p) <= 0) { idx = i; break; } }
  const seg = 360 / SPIN_PRIZES.length, prev = S.spin ? S.spin.deg : 0;
  const deg = prev - (prev % 360) + 360 * 5 + (360 - (idx * seg + seg / 2));
  S.spin = { deg, idx, until: performance.now() + 3200, done: false };
  S.stats.spins = (S.stats.spins || 0) + 1;
  sfx('evento');
  setTimeout(() => { givePrize(idx); render(); }, 3250);
}
function givePrize(idx) {
  if (!S || !S.spin || S.spin.done) return;
  S.spin.done = true;
  const pz = SPIN_PRIZES[idx];
  if (pz.k === 'betmel') {
    if (S.dragons.length < capacity()) {
      const d = addDragon(BETMEL); S.stats.byRarity.L++; if (S.stats.firstLegendT === null) S.stats.firstLegendT = S.t;
      S.stats.betmel = (S.stats.betmel || 0) + 1;
      sfx('revelacao', { raridade: RAR_SOM.L });
      overlay(`<div class="card hero"><span class="cat">Abelha exclusiva da roleta</span>${dIcon(d.els, d.rar, 'xl', 'pop', d.id, d.skin)}<h1>BetMel!</h1><p>Lendária, produz o dobro de mel e só sai na roleta.</p><button class="btn primary" data-a="cancelEnd">Que sorte!</button></div>`);
    } else { const g = 30000; addGold(g); toast('BetMel!', `Sem vaga na colmeia: ela deixou ${fmt(g)} de mel e voou.`, 'ach'); }
  } else if (pz.k === 'epico') {
    const pool = swarmPool().filter(sp => sp.rar === 'E'), sp = pool.length ? pick(pool) : randomSpeciesOfRarity('E');
    const o = grantBee(sp); showSwarm([o]);
  } else if (pz.k === 'raro') {
    S.tickets += 3; toast('Roleta: 3 fichas', 'Use na Roleta do Enxame.', 'ach');
  } else if (pz.k === 'mel') { addGold(3000); toast('Roleta: 3.000 de mel', 'Direto para o pote.'); }
  else if (pz.k === 'geleia') { addGems(12); toast('Roleta: 12 de geleia real', ''); }
  else { S.food += 400; S.stats.foodHarvested += 400; toast('Roleta: 400 de néctar', ''); }
}
// Ataques comprados: a abelha escolhida aprende o golpe (troca o anterior) e ganha ataque permanente
function learnAttack(id) {
  const A = ATTACKS[S.atkPick], d = S.dragons.find(x => x.id === id);
  if (!A || !d) return;
  if (d.lvl < A.lvl) { toast('Abelha fraca demais', `Ela precisa do nível ${A.lvl}.`, 'bad'); return; }
  if (A.gems ? !spendGems(A.gems) : !spendGold(Math.round(A.gold * MOD('shop')))) return;
  d.move = S.atkPick; d.atkUp = (d.atkUp || 0) + A.up;
  S.atkPick = null; sfx('nivelDragao'); addXp(10);
  toast(`${d.name} aprendeu ${A.n}!`, `+${Math.round(A.up * 100)}% de ataque para sempre.`);
}
function applySkin(id) {
  const k = S.skinPick, K = SKINS[k], d = S.dragons.find(x => x.id === id);
  if (!K || !d) return;
  if (d.skin && d.skin[K.t] === k) { toast('Já está usando', `${d.name} já tem ${K.n}.`, 'bad'); return; }
  if (!spendGems(K.gems)) return;
  d.skin = { ...(d.skin || {}), [K.t]: k };
  S.skinPick = null; sfx('comprar'); toast(`${d.name} ganhou ${K.n}!`, 'O visual aparece em todo o jogo.');
}
function applyHiveSkin(i) {
  const k = S.hskinPick, K = HIVE_SKINS[k], h = S.habitats[i];
  if (!K || !h) return;
  if (h.skin === k) { toast('Já está usando', `A colmeia ${i + 1} já é ${K.n}.`, 'bad'); return; }
  if (!spendGems(K.gems)) return;
  h.skin = k; S.hskinPick = null; sfx('comprar'); toast(`Colmeia ${i + 1} virou ${K.n}!`, 'Veja na ilha.');
}
function removeSkin(id, t) { const d = S.dragons.find(x => x.id === id); if (d && d.skin) { d.skin = { ...d.skin, [t]: null }; sfx('clique'); } }
function renameBee(id) {
  const d = S.dragons.find(x => x.id === id);
  if (!d) return;
  let n = null;
  try { n = window.prompt('Novo nome da abelha:', d.name); } catch (e) { n = null; }
  if (n === null) return;
  n = n.replace(/[<>&"'`\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 18);
  if (!n) return;
  d.name = n; sfx('clique');
}
function buyDragon(e) {
  if (S.level < unlockLvl(e)) return;
  if (S.dragons.length >= capacity()) { toast('Sem espaço', 'Compre outra colmeia antes.', 'bad'); return; }
  if (!spendGold(dragonPrice(e))) return;
  const sp = speciesFromEls([e]);
  addDragon(sp); S.stats.dragonsBought++; S.stats.byRarity[sp.rar]++;
  sfx('comprar');
  addXp(10);
  toast(`${sp.name} chegou!`, 'Ela já está produzindo mel na colmeia.');
}
function feed(id) {
  const d = S.dragons.find(x => x.id === id);
  if (!d || d.lvl >= MAX_DLVL) return;
  const c = feedCost(d.lvl);
  if (S.food < c) { toast('Néctar insuficiente', `Faltam ${fmt(c - S.food)} de néctar. Plante flores nos canteiros.`, 'bad'); return; }
  S.food -= c; S.stats.foodSpent += c; S.stats.feeds++;
  sfx('alimentar'); setTimeout(() => sfx('nivelDragao'), 180);
  d.lvl++; S.stats.maxDragonLvl = Math.max(S.stats.maxDragonLvl, d.lvl);
  addXp(3 + d.lvl);
}
function sell(id) {
  if (S.dragons.length <= 1) { toast('Não dá', 'Você precisa de pelo menos uma abelha.', 'bad'); return; }
  const idx = S.dragons.findIndex(x => x.id === id);
  if (idx < 0) return;
  const d = S.dragons[idx];
  if (d._confirm !== true) { d._confirm = true; setTimeout(() => { d._confirm = false; render(); }, 2500); return; }
  S.dragons.splice(idx, 1);
  S.team = S.team.filter(t => t !== id);
  if (S.breedA === id) S.breedA = null;
  if (S.breedB === id) S.breedB = null;
  addGold(sellValue(d)); S.stats.dragonsSold++;
  sfx('vender');
  toast(`${d.name} foi vendida`, `+${fmt(sellValue(d))} de mel`);
}
function buyHabitat() { if (S.habitats.length >= habMax()) { toast('Ilha cheia', habMax() < HAB_LOTS.length ? 'Mais lotes de colmeia abrem no próximo ato.' : 'Todos os lotes de colmeia estão ocupados.', 'bad'); return; } if (spendGold(habitatCost())) { S.habitats.push({ stored: 0 }); sfx('comprar'); addXp(8); } }
function buyFarm() { if (S.farms.length >= farmMax()) { toast('Jardim cheio', farmMax() < FARM_LOTS.length ? 'Mais canteiros abrem no próximo ato.' : 'Todos os canteiros estão ocupados.', 'bad'); return; } if (spendGold(farmCost())) { S.farms.push({ crop: null, prog: 0, lvl: 1, pick: bestCrop() }); sfx('comprar'); addXp(5); } }
function buyHatch() {
  const c = HATCH_COSTS[S.hatchSlots - 1];
  if (c === undefined) return;
  if (spendGold(Math.round(c * MOD('shop')))) { S.hatchSlots++; addXp(8); sfx('comprar'); }
}
// Oferta do mercado: uma abelha desbloqueada com 25% de desconto, trocando a cada 90s
const DEAL_EVERY = 90;
function dealEl() { const ks = EL_KEYS.filter(k => S.level >= unlockLvl(k)); return ks[Math.floor(S.t / DEAL_EVERY) % ks.length]; }
const dragonPrice = k => Math.round((k === dealEl() ? EL[k].cost * 0.75 : EL[k].cost) * MOD('shop'));
const BOOSTS = {
  chuva: { n: 'Nuvem de Mel', i: '🌧️', d: 'Mel das colmeias em dobro por 45s.', gems: 12, dur: 45 },
  colheita: { n: 'Pólen Mágico', i: '🌻', d: 'As flores crescem 3x mais rápido por 45s.', gems: 8, dur: 45 },
};
// Tesouros: compras com geleia real
const TREASURES = {
  fichas: { i: '🎯', n: 'Pacote de Fichas', d: '3 fichas para a Roleta do Enxame.', gems: 15 },
  trevo: { i: '🍀', n: 'Trevo da Sorte', d: 'Os próximos 5 giros têm o dobro de chance de Épica e Lendária.', gems: 12 },
  cesta: { i: '🧺', n: 'Cesta Surpresa', d: 'Prêmio surpresa: mel, fichas, geleia real de volta ou até uma abelha Épica.', gems: 10 },
  ampulheta: { i: '⏳', n: 'Ampulheta', d: 'Seu giro grátis fica pronto agora.', gems: 8 },
  pocao: { i: '🧪', n: 'Poção de Treino', d: 'Sua abelha de menor nível sobe 3 níveis.', gems: 6 },
  estrela: { i: '🌟', n: 'Estrela do Destaque', d: 'Troca agora a espécie em destaque da roleta.', gems: 4 },
  amor: { i: '💠', n: 'Cristal Raro', d: '1 cristal para o Laboratório.', gems: 30 },
};
const LUCK_ODDS = { C: 0.45, R: 0.33, E: 0.17, L: 0.05 }, LUCK_GEM = { C: 0, R: 0.5, E: 0.38, L: 0.12 };
function buyTreasure(k) {
  const t = TREASURES[k]; if (!t) return;
  if (k === 'ampulheta' && S.t >= S.freeAt) { toast('Já está pronto', 'Seu giro grátis já está esperando na roleta.', 'bad'); return; }
  if (k === 'pocao' && !S.dragons.some(d => d.lvl < MAX_DLVL)) { toast('Todas no máximo', 'Nenhuma abelha pode subir de nível.', 'bad'); return; }
  if (!spendGems(t.gems)) return;
  S.stats.treasures = (S.stats.treasures || 0) + 1;
  sfx('comprar');
  if (k === 'fichas') { catchTicket(3); toast('🎯 +3 fichas', 'Use na Roleta do Enxame.'); }
  else if (k === 'trevo') { S.luck = (S.luck || 0) + 5; toast('🍀 Trevo da Sorte', `Sorte nos próximos ${S.luck} giros.`, 'ach'); }
  else if (k === 'ampulheta') { S.freeAt = S.t; toast('⏳ Giro grátis pronto', 'Corra para a roleta!'); }
  else if (k === 'pocao') { const d = S.dragons.filter(x => x.lvl < MAX_DLVL).sort((a, b) => a.lvl - b.lvl)[0]; d.lvl = Math.min(MAX_DLVL, d.lvl + 3); S.stats.maxDragonLvl = Math.max(S.stats.maxDragonLvl, d.lvl); toast('🧪 Poção de Treino', `${d.name} agora está no Nv ${d.lvl}.`); }
  else if (k === 'estrela') { S.featUntil = 0; const f = swarmFeat(); toast('🌟 Novo destaque', f ? `${S.dex[f.key] ? f.name : 'Uma espécie misteriosa'} (${RARITY[f.rar].n})` : 'Libere mais tipos para ter destaque.'); }
  else if (k === 'amor') addCrystals(1, 'Cristal Raro da Loja.');
  else if (k === 'cesta') {
    const r = Math.random();
    if (r < 0.1) { const ep = swarmPool().filter(sp => sp.rar === 'E'); if (ep.length) { showSwarm([grantBee(pick(ep))]); return; } }
    if (r < 0.4) { const g = (150 * S.level + Math.round(totalGps() * 30)) * 2; addGold(g); toast('🧺 Cesta: mel', `+${fmt(g)} de mel.`, 'ach'); }
    else if (r < 0.75) { catchTicket(2); toast('🧺 Cesta: fichas', '+2 fichas para a roleta.', 'ach'); }
    else { S.gems += 15; toast('🧺 Cesta: geleia real', '+15 de geleia real.', 'ach'); }
  }
}
function buyBoost(k) {
  const b = BOOSTS[k]; if (!b || !spendGems(b.gems)) return;
  S.buffs[k] = Math.max(S.t, S.buffs[k] || 0) + b.dur;
  sfx('comprar'); toast(`${b.i} ${b.n}`, b.d);
}
function gemsToGold() {
  if (!spendGems(5)) return;
  const g = 150 * S.level + Math.round(totalGps() * 30);
  addGold(g); sfx('comprar'); toast('Troca feita', `+${fmt(g)} de mel`);
}
function mysteryEgg() { S.tab = 'chocadeira'; }

// ============================================================
