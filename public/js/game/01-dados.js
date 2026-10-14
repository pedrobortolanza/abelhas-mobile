'use strict';
// ============================================================
// DADOS DO JOGO (DATA-START) — tabelas lidas também pelos docs
// ============================================================
// Tipos de abelha. As chaves internas vêm do jogo base: planta = Flor, terra = Deserto, metal = Veneno.
const EL = {
  fogo:     { n: 'Fogo',     i: '🔥', c: '#ff6b35', pre: 'Brasa',  suf: 'brasa',  pn: 'Abelha de Fogo',     mel: 'Mel Ardente',    unlock: 1, cost: 100 },
  agua:     { n: 'Água',     i: '💧', c: '#3aa0ff', pre: 'Orva',   suf: 'mel',    pn: 'Abelha da Água',     mel: 'Mel de Orvalho', unlock: 1, cost: 150 },
  planta:   { n: 'Flor',     i: '🌿', c: '#ff7eb6', pre: 'Péta',   suf: 'flor',   pn: 'Abelha das Flores',  mel: 'Mel Silvestre',  unlock: 1, cost: 150 },
  terra:    { n: 'Deserto',  i: '🪨', c: '#d9a35b', pre: 'Duna',   suf: 'duna',   pn: 'Abelha do Deserto',  mel: 'Mel de Cacto',   unlock: 2, cost: 250 },
  eletrico: { n: 'Elétrica', i: '⚡', c: '#ffd23f', pre: 'Faísca', suf: 'zum',    pn: 'Abelha Elétrica',    mel: 'Mel Faiscante',  unlock: 3, cost: 600 },
  gelo:     { n: 'Gelo',     i: '❄️', c: '#9be7ff', pre: 'Gea',    suf: 'neve',   pn: 'Abelha de Gelo',     mel: 'Mel Gelado',     unlock: 4, cost: 900 },
  metal:    { n: 'Veneno',   i: '⚙️', c: '#8fd14f', pre: 'Pica',   suf: 'ferrão', pn: 'Abelha Venenosa',    mel: 'Mel Amargo',     unlock: 6, cost: 2500 },
  trevas:   { n: 'Sombra',   i: '🌑', c: '#7b4fd0', pre: 'Sombra', suf: 'noite',  pn: 'Abelha da Sombra',   mel: 'Mel da Meia-Noite', unlock: 8, cost: 6000 },
  luz:      { n: 'Luz',      i: '✨', c: '#fff0a0', pre: 'Lume',   suf: 'sol',    pn: 'Abelha de Luz',      mel: 'Mel Dourado',    unlock: 8, cost: 6000 },
};
const EL_KEYS = Object.keys(EL);
const SPECIAL_EL = ['metal', 'trevas', 'luz'];
const BASE_EL = ['fogo', 'agua', 'planta', 'terra', 'eletrico', 'gelo'];
// Atacante -> elementos contra os quais é forte (dano x1,5). O inverso causa x0,7.
const STRONG = {
  fogo: ['planta', 'gelo', 'metal'],
  agua: ['fogo', 'terra'],
  planta: ['agua', 'terra'],
  terra: ['eletrico', 'fogo', 'metal'],
  eletrico: ['agua', 'metal'],
  gelo: ['planta', 'terra'],
  metal: ['gelo', 'luz'],
  trevas: ['luz', 'eletrico'],
  luz: ['trevas', 'gelo'],
};
const RARITY = {
  C: { n: 'Comum',    f: 'Operária',  rv: 1, gps: 1,   hp: 100, atk: 20, egg: 8 },
  R: { n: 'Rara',     f: 'Guardiã',   rv: 2, gps: 2.5, hp: 125, atk: 25, egg: 15 },
  E: { n: 'Épica',    f: 'Guerreira', rv: 3, gps: 6,   hp: 160, atk: 33, egg: 25 },
  L: { n: 'Lendária', f: 'Soberana',  rv: 5, gps: 12,  hp: 195, atk: 39, egg: 40 },
};
const LEGENDS = [
  { k: 'eclipse',    n: 'Eclipse',     els: ['luz', 'trevas'],     ch: 0.06 },
  { k: 'aurora',     n: 'Aurora',      els: ['gelo', 'luz'],       ch: 0.05 },
  { k: 'tita',       n: 'Escorpiona',  els: ['terra', 'metal'],    ch: 0.04 },
  { k: 'tempestade', n: 'Tempestade',  els: ['agua', 'eletrico'],  ch: 0.035 },
  { k: 'vulcano',    n: 'Vulcana',     els: ['fogo', 'terra'],     ch: 0.03 },
];
// Flores plantadas nos canteiros: dão néctar (food) para alimentar as abelhas
const CROPS = {
  trigo:   { n: 'Margarida', i: '🌾', dur: 5,  food: 12,  cost: 10,  lvl: 1 },
  milho:   { n: 'Girassol',  i: '🌽', dur: 20, food: 60,  cost: 40,  lvl: 2 },
  abobora: { n: 'Rosa',      i: '🎃', dur: 45, food: 180, cost: 120, lvl: 4 },
  pitaya:  { n: 'Lótus',     i: '🍇', dur: 90, food: 520, cost: 350, lvl: 7 },
};
const MODES = {
  rapido: { n: 'Rápida', dur: 600,  d: 'A Vespa Rainha ataca em 10 minutos.', boss: { hp: 1200, atk: 48 } },
  padrao: { n: 'Padrão', dur: 1200, d: 'A Vespa Rainha ataca em 20 minutos.', boss: { hp: 2400, atk: 70 } },
  longa:  { n: 'Longa',  dur: 1800, d: 'A Vespa Rainha ataca em 30 minutos.', boss: { hp: 3600, atk: 88 } },
  atos: { n: 'Atos', dur: 0, d: 'Três atos de 12 minutos, cada um com seu chefe.', boss: { hp: 1700, atk: 52 } },
  infinito: { n: 'Infinito', dur: 0, wave: 900, d: 'A Vespa Rainha ataca a cada 15 minutos, mais forte a cada vez. Acaba na primeira derrota.', boss: { hp: 1800, atk: 60 } },
};
// Partida em atos: cada ato termina com um chefe; vencer leva ao próximo ato com tudo o que foi construído
const ACTS = [
  { n: 'Ato I', boss: 'General Vespa', disp: ['fogo', 'metal'], dur: 720, hp: 1700, atk: 52, reward: { gold: 4000, gems: 15, xp: 300 }, pts: 4000, hab: 4, farm: 6, lg: 3 },
  { n: 'Ato II', boss: 'Vespa Rainha', disp: ['trevas', 'fogo'], dur: 720, hp: 4600, atk: 92, reward: { gold: 12000, gems: 20, xp: 600 }, pts: 8000, hab: 7, farm: 9, lg: 6 },
  { n: 'Ato III', boss: 'Imperatriz do Ninho', disp: ['trevas', 'luz'], dur: 720, hp: 7000, atk: 112, pts: 12000, hab: 9, farm: 12, lg: 8 },
];
const actEndAt = i => ACTS.slice(0, i + 1).reduce((a, x) => a + x.dur, 0);
const isActs = () => !!(S && S.mode === 'atos');
const curAct = () => ACTS[Math.min(S.act || 0, ACTS.length - 1)];
const habMax = () => isActs() ? Math.min(HAB_LOTS.length, curAct().hab) : HAB_LOTS.length;
const farmMax = () => isActs() ? Math.min(FARM_LOTS.length, curAct().farm) : FARM_LOTS.length;
const leagueLocked = () => isActs() && S.league <= LEAGUES.length && S.league > curAct().lg;
const bossName = () => isActs() ? curAct().boss : 'Vespa Rainha';
const LEAGUES = ['Bronze', 'Prata', 'Ouro', 'Platina', 'Diamante', 'Mestre', 'Grão-Mestre', 'Campeões'];
const LEAGUE_RARITY = [['C'], ['C', 'C', 'R'], ['R', 'C'], ['R', 'R', 'E'], ['E', 'R'], ['E', 'E', 'R'], ['E', 'L', 'E'], ['L', 'E']];
const MAX_DLVL = 25;
// Nível 25 vale o antigo 15: cada nível cresce 14/24 do que crescia; oldLv converte níveis da escala antiga
const LV_K = 14 / 24;
const oldLv = l => clamp(1 + Math.round((Math.min(l, 15) - 1) / LV_K), 1, MAX_DLVL);
const MAX_PLVL = 30;
const HAB_CAP = 3;
const HATCH_COSTS = [300, 1500, 6000]; // (antigo) alvéolos da chocadeira; a roleta substituiu os ovos
// Roleta do Enxame: a única forma de ganhar abelhas
const SWARM = {
  odds: { C: 0.62, R: 0.27, E: 0.09, L: 0.02 },       // giro com mel ou ficha
  gemOdds: { C: 0, R: 0.62, E: 0.30, L: 0.08 },       // giro de geleia real
  gems: 20, gems10: 180,                               // preço do giro de geleia (1x e 10x)
  pityE: 10, pityL: 50,                                // garantia: Épica a cada 10 giros, Lendária a cada 50
  free: 180,                                           // giro grátis a cada 3 min (mais rápido com bônus de giro)
  featEvery: 180, featCh: 0.5,                         // destaque troca a cada 3 min; metade das vezes que sair a raridade dele, vem ele
  dupLv: { C: 1, R: 3, E: 4, L: 6 },                   // repetida: a sua abelha da espécie sobe esses níveis
  startTickets: 3,
};
const SW_COL = { C: '#9aa7b4', R: '#4fb3ff', E: '#c77dff', L: '#ffd23f' };
const spinCost = () => Math.round(150 * Math.pow(1.3, S.level - 1) * MOD('shop') / 5) * 5;
const freeEvery = () => SWARM.free / MOD('hatch');
// Novidades da run: estação, inimigo, mutações e caminho da Arena
const SEASONS = {
  primavera: { n: 'Primavera', i: '🌻', el: 'planta', d: 'Néctar +25% e flores 20% mais rápidas.', mods: { food: 1.25, farm: 1.2 }, tint: ['#ff9ad0', 0.07] },
  verao:     { n: 'Verão', i: '🔥', el: 'fogo', d: 'Mel +25%, mas o néctar rende 20% menos.', mods: { gold: 1.25, food: 0.8 }, tint: ['#ff7a1a', 0.1] },
  chuvas:    { n: 'Estação das Chuvas', i: '🌧️', el: 'agua', d: 'Chuva de Mel duas vezes mais frequente; giro grátis 15% mais lento.', mods: { hatch: 0.85 }, tint: ['#3a6aa0', 0.12] },
  inverno:   { n: 'Inverno', i: '❄️', el: 'gelo', d: 'Giro grátis 25% e flores 15% mais lentos; +2 de geleia real por nível.', mods: { hatch: 0.75, farm: 0.85, lvlGems: 2 }, tint: ['#cfefff', 0.2] },
};
const SEASON_BOOST = 1.2; // abelhas do tipo da estação: +20% de vida e ataque
const RIVALS = {
  formigas:  { n: 'Formigas Ladras', u: 'Formiga Ladra', i: '🗡️', els: ['terra', 'metal'], d: 'Se vencerem, levam 30% do seu mel.' },
  vespas:    { n: 'Vespas Batedoras', u: 'Vespa Batedora', i: '🔥', els: ['fogo', 'trevas'], d: 'Se vencerem, queimam as flores de todos os canteiros.' },
  besouros:  { n: 'Besouros Blindados', u: 'Besouro Blindado', i: '🛡️', els: ['terra', 'gelo'], hp: 1.4, d: 'Têm 40% mais vida. Se vencerem, esfriam as colmeias: metade do mel por 90s.' },
  mariposas: { n: 'Mariposas da Noite', u: 'Mariposa da Noite', i: '🔮', els: ['trevas', 'luz'], d: 'Se vencerem, levam metade do seu néctar.' },
};
const RAID_AT = [0.33, 0.66], RAID_WAIT = 60;
const MUTS = {
  gulosa:     { n: 'Gulosa', d: '+40% de mel', gold: 1.4, w: 20 },
  robusta:    { n: 'Robusta', d: '+25% de vida', hp: 1.25, w: 20 },
  aco:        { n: 'Ferrão de Aço', d: '+20% de ataque', atk: 1.2, w: 20 },
  brilhante:  { n: 'Brilhante', d: '+15% de mel, vida e ataque', gold: 1.15, hp: 1.15, atk: 1.15, w: 10 },
  preguicosa: { n: 'Preguiçosa', d: '-25% de mel, +35% de ataque', gold: 0.75, atk: 1.35, w: 15 },
  sortuda:    { n: 'Sortuda', d: '+15% de chance de crítico', crit: 0.15, w: 15 },
  // só no Laboratório (peso 0: nunca sai na roleta)
  dourada:    { n: 'Dourada', d: '+30% de mel, vida e ataque', gold: 1.3, hp: 1.3, atk: 1.3, w: 0, lab: true },
  furia:      { n: 'Fúria', d: '+45% de ataque e +10% de crítico', atk: 1.45, crit: 0.1, w: 0, lab: true },
};
// Laboratório: cristais raros dão mutações. Um cristal chega a cada CRYSTAL_EVERY segundos.
const CRYSTAL_EVERY = 240;
const LAB = {
  sorte:   { i: '🎲', n: 'Mutação ao acaso', d: 'Sorteia uma das 6 mutações comuns.', c: 1 },
  escolha: { i: '🧬', n: 'Mutação escolhida', d: 'Você escolhe qual mutação comum ela recebe.', c: 3 },
  rara:    { i: '🌟', n: 'Mutação rara', d: 'Dourada (+30% em tudo) ou Fúria (+45% de ataque, +10% de crítico).', c: 5 },
};
const labCost = k => Math.max(1, LAB[k].c - (S.queen === 'sortuda' ? 1 : 0));
function addCrystals(n, why) {
  S.crystals = (S.crystals || 0) + n; S.stats.crystals = (S.stats.crystals || 0) + n;
  toast(`💠 +${n} cristal${n > 1 ? 'is' : ''}`, why || 'Use no Laboratório para dar mutações.', 'ach');
}
function labMutate(mode, mk) {
  const d = S.dragons.find(x => x.id === S.labSel);
  if (!d) { toast('Escolha uma abelha', 'Toque em uma abelha da lista primeiro.', 'bad'); return; }
  const c = labCost(mode);
  if ((S.crystals || 0) < c) { toast('Faltam cristais', `Essa mutação custa ${c} 💠.`, 'bad'); return; }
  const common = Object.keys(MUTS).filter(k => !MUTS[k].lab);
  let k;
  if (mode === 'sorte') { const pool = Object.fromEntries(common.filter(x => x !== d.mut).map(x => [x, MUTS[x]])); k = wpick(pool); }
  else if (mode === 'escolha') { if (!common.includes(mk)) return; k = mk; }
  else { if (!['dourada', 'furia'].includes(mk)) return; k = mk; }
  S.crystals -= c; d.mut = k; S.stats.labMuts = (S.stats.labMuts || 0) + 1; S.stats.mutants++;
  sfx('conquista'); addXp(10);
  toast(`🧬 ${d.name}: ${MUTS[k].n}`, MUTS[k].d, 'ach');
}
const MUT_CHANCE = 0.35;
const NODES = {
  luta:     { n: 'Luta', i: '⚔️', d: 'Uma luta normal da liga.', w: 40, fight: true },
  elite:    { n: 'Elite', i: '☠️', d: 'Inimigos mais fortes. Mel x2, +5 de geleia real e uma relíquia.', w: 22, fight: true },
  duelo:    { n: 'Duelo', i: '🗡️', d: 'Um só inimigo, bem forte. Geleia real x3 e 1 ficha da roleta.', w: 22, fight: true },
  misterio: { n: 'Mistério', i: '💫', d: 'Luta contra tipos sorteados. Prêmio surpresa: fichas, mel ou relíquia.', w: 16, fight: true },
};
const wpick = obj => { const ks = Object.keys(obj), tot = ks.reduce((a, k) => a + obj[k].w, 0); let r = Math.random() * tot; for (const k of ks) { r -= obj[k].w; if (r < 0) return k; } return ks[0]; };
const EVENTS = {
  chuva:    { n: 'Chuva de Mel',     i: '🌧️', d: 'Mel das colmeias em dobro por 30s.', dur: 30 },
  colheita: { n: 'Florada',          i: '🌻', d: 'As flores crescem 3x mais rápido por 30s.', dur: 30 },
  ovo:      { n: 'Ficha Perdida',    i: '🎯', d: 'Uma ficha da roleta caiu na vila! Clique nela em 10s.', dur: 10 },
  selvagem: { n: 'Abelha Selvagem',  i: '🐲', d: 'Uma abelha selvagem desafia você na Arena. Recompensa tripla, 45s.', dur: 45 },
  mercador: { n: 'Mercador Viajante', i: '🧳', d: 'Troque mel por 10 de geleia real por 30s.', dur: 30 },
};
const MISSION_TPL = [
  { k: 'gold',    stat: 'goldEarned',     i: '🪙', t: x => `Produza ${fmt(x)} de mel`,       tgt: l => round5(250 * Math.pow(1.55, l - 1)) },
  { k: 'food',    stat: 'foodHarvested',  i: '🌾', t: x => `Junte ${fmt(x)} de néctar`,     tgt: l => round5(60 * Math.pow(1.45, l - 1)) },
  { k: 'hatch',   stat: 'swarmSpins',     i: '🎯', t: x => `Gire a Roleta do Enxame ${x} vez(es)`, tgt: l => 2 + Math.floor(l / 3) },
  { k: 'win',     stat: 'battlesWon',     i: '⚔️', t: x => `Vença ${x} batalha(s)`,         tgt: l => 1 + Math.floor(l / 3) },
  { k: 'feed',    stat: 'feeds',          i: '🍖', t: x => `Alimente abelhas ${x} vezes`,   tgt: l => 3 + l },
  { k: 'breed',   stat: 'labMuts',        i: '🧬', t: x => `Faça ${x} mutação(ões) no Laboratório`, tgt: l => 1 + Math.floor(l / 8) },
  { k: 'harvest', stat: 'cropsHarvested', i: '🧺', t: x => `Colha ${x} flores`,           tgt: l => 4 + l },
  { k: 'collect', stat: 'collects',       i: '🏛️', t: x => `Colete mel ${x} vezes`,        tgt: l => 5 + 2 * l },
];
// Conquistas: cat = categoria, g = gemas de recompensa, c = condição
const ACH = [
  { cat: 'Primeiros passos', id: 'col1',   i: '🪙', n: 'Primeira coleta',     d: 'Colete mel de uma colmeia.',              g: 1, c: s => s.collects >= 1 },
  { cat: 'Primeiros passos', id: 'harv1',  i: '🌾', n: 'Mãos nas pétalas',       d: 'Colha sua primeira flor.',             g: 1, c: s => s.cropsHarvested >= 1 },
  { cat: 'Primeiros passos', id: 'feed1',  i: '🍖', n: 'Hora do lanche',      d: 'Alimente uma abelha.',                     g: 1, c: s => s.feeds >= 1 },
  { cat: 'Primeiros passos', id: 'breed1', i: '🧬', n: 'Cientista',           d: 'Faça uma mutação no Laboratório.',        g: 2, c: s => (s.labMuts || 0) >= 1 },
  { cat: 'Primeiros passos', id: 'hatch1', i: '🎯', n: 'Primeiro giro',       d: 'Gire a Roleta do Enxame.',                g: 2, c: s => s.swarmSpins >= 1 },
  { cat: 'Primeiros passos', id: 'win1',   i: '⚔️', n: 'Primeira vitória',    d: 'Vença uma batalha na Arena.',             g: 2, c: s => s.battlesWon >= 1 },
  { cat: 'Mel', id: 'gold1k',   i: '💰', n: 'Potinho',              d: 'Produza 1.000 de mel no total.',            g: 1, c: s => s.goldEarned >= 1e3 },
  { cat: 'Mel', id: 'gold10k',  i: '💰', n: 'Pote cheio',               d: 'Produza 10.000 de mel no total.',           g: 2, c: s => s.goldEarned >= 1e4 },
  { cat: 'Mel', id: 'gold100k', i: '👑', n: 'Rio de mel',      d: 'Produza 100.000 de mel no total.',          g: 5, c: s => s.goldEarned >= 1e5 },
  { cat: 'Mel', id: 'gold1m',   i: '🏰', n: 'Colmeia milionária',     d: 'Produza 1.000.000 de mel no total.',        g: 10, c: s => s.goldEarned >= 1e6 },
  { cat: 'Mel', id: 'gps10',    i: '📈', n: 'Renda passiva',         d: 'Alcance 10 de mel por segundo.',          g: 1, c: s => s.peakGps >= 10 },
  { cat: 'Mel', id: 'gps50',    i: '🏭', n: 'Fábrica de mel',       d: 'Alcance 50 de mel por segundo.',          g: 3, c: s => s.peakGps >= 50 },
  { cat: 'Mel', id: 'gps200',   i: '🏦', n: 'Banco do favo',       d: 'Alcance 200 de mel por segundo.',         g: 5, c: s => s.peakGps >= 200 },
  { cat: 'Mel', id: 'gps500',   i: '💎', n: 'Economia lendária',     d: 'Alcance 500 de mel por segundo.',         g: 10, c: s => s.peakGps >= 500 },
  { cat: 'Mel', id: 'gems100',  i: '💠', n: 'Geleia de rainha',             d: 'Ganhe 100 de geleia real no total.',                g: 5, c: s => s.gemsEarned >= 100 },
  { cat: 'Coleção', id: 'own5',    i: '🐉', n: 'Enxame',                  d: 'Tenha 5 abelhas ao mesmo tempo.',          g: 1, c: () => S.dragons.length >= 5 },
  { cat: 'Coleção', id: 'own10',   i: '🐉', n: 'Revoada',                d: 'Tenha 10 abelhas ao mesmo tempo.',         g: 3, c: () => S.dragons.length >= 10 },
  { cat: 'Coleção', id: 'own20',   i: '🐉', n: 'Céu zumbindo',             d: 'Tenha 20 abelhas ao mesmo tempo.',         g: 5, c: () => S.dragons.length >= 20 },
  { cat: 'Coleção', id: 'rare',    i: '🔷', n: 'Raridade',               d: 'Obtenha uma abelha Rara.',                  g: 1, c: s => s.byRarity.R >= 1 },
  { cat: 'Coleção', id: 'epic',    i: '🔮', n: 'Épica!',                 d: 'Obtenha uma abelha Épica.',                 g: 3, c: s => s.byRarity.E >= 1 },
  { cat: 'Coleção', id: 'legend',  i: '🌟', n: 'Lenda viva',             d: 'Obtenha uma abelha Lendária.',              g: 5, c: s => s.byRarity.L >= 1 },
  { cat: 'Coleção', id: 'legend3', i: '🏛️', n: 'Panteão do favo',                d: 'Obtenha 3 abelhas Lendárias.',             g: 10, c: s => s.byRarity.L >= 3 },
  { cat: 'Coleção', id: 'allel',   i: '🌈', n: 'Arco-íris do prado',    d: 'Tenha abelhas dos 9 tipos ao mesmo tempo.', g: 8, c: () => ownedElements().size >= 9 },
  { cat: 'Coleção', id: 'sp10',    i: '📗', n: 'Colecionador',           d: 'Descubra 10 espécies.',                    g: 3, c: () => Object.keys(S.dex).length >= 10 },
  { cat: 'Coleção', id: 'sp25',    i: '📘', n: 'Naturalista',            d: 'Descubra 25 espécies.',                    g: 6, c: () => Object.keys(S.dex).length >= 25 },
  { cat: 'Coleção', id: 'sp40',    i: '📕', n: 'Enciclopédia viva',      d: 'Descubra 40 espécies.',                    g: 12, c: () => Object.keys(S.dex).length >= 40 },
  { cat: 'Evolução', id: 'lvl5',    i: '⬆️', n: 'Crescendo',             d: 'Leve uma abelha ao nível 8.',               g: 1, c: s => s.maxDragonLvl >= 8 },
  { cat: 'Evolução', id: 'lvl10',   i: '⏫', n: 'Zumbido feroz',     d: 'Leve uma abelha ao nível 16.',              g: 3, c: s => s.maxDragonLvl >= 16 },
  { cat: 'Evolução', id: 'lvl15',   i: '🔱', n: 'Forma máxima',          d: 'Leve uma abelha ao nível 25.',              g: 6, c: s => s.maxDragonLvl >= 25 },
  { cat: 'Evolução', id: 'feed50',  i: '🍗', n: 'Banquete de néctar',              d: 'Alimente abelhas 50 vezes.',               g: 3, c: s => s.feeds >= 50 },
  { cat: 'Evolução', id: 'breed20', i: '🧬', n: 'Genética avançada',     d: 'Faça 6 mutações no Laboratório.',          g: 5, c: s => (s.labMuts || 0) >= 6 },
  { cat: 'Evolução', id: 'speed5',  i: '⏫', n: 'Repetida que sobe',     d: 'Tire 5 abelhas repetidas na roleta.',            g: 2, c: s => s.swarmDups >= 5 },
  { cat: 'Jardim', id: 'food1k',  i: '🧺', n: 'Jarro de néctar',          d: 'Junte 1.000 de néctar.',                   g: 2, c: s => s.foodHarvested >= 1e3 },
  { cat: 'Jardim', id: 'food10k', i: '🚜', n: 'Prado farto',            d: 'Junte 10.000 de néctar.',                  g: 5, c: s => s.foodHarvested >= 1e4 },
  { cat: 'Jardim', id: 'harv100', i: '👩‍🌾', n: 'Jardineiro dedicado',   d: 'Colha 100 flores.',                      g: 4, c: s => s.cropsHarvested >= 100 },
  { cat: 'Jardim', id: 'farm6',   i: '🌱', n: 'Jardim florido',             d: 'Tenha 6 canteiros de flores.',                        g: 3, c: () => S.farms.length >= 6 },
  { cat: 'Arena', id: 'win10',    i: '🛡️', n: 'Gladiador',              d: 'Vença 10 batalhas.',                       g: 3, c: s => s.battlesWon >= 10 },
  { cat: 'Arena', id: 'win30',    i: '🏆', n: 'Campeão de arena',        d: 'Vença 30 batalhas.',                       g: 8, c: s => s.battlesWon >= 30 },
  { cat: 'Arena', id: 'league3',  i: '🥉', n: 'Subindo de liga',         d: 'Chegue à liga Ouro.',                      g: 2, c: () => S.league >= 3 },
  { cat: 'Arena', id: 'league5',  i: '🥈', n: 'Elite',                   d: 'Chegue à liga Diamante.',                  g: 5, c: () => S.league >= 5 },
  { cat: 'Arena', id: 'league8',  i: '🥇', n: 'Liga dos Campeões',       d: 'Chegue à liga Campeões.',                  g: 8, c: () => S.league >= 8 },
  { cat: 'Arena', id: 'boss',     i: '☠️', n: 'Picada no sono',           d: 'Derrote a Vespa Rainha adormecida na Arena, após a liga Campeões.',              g: 20, c: s => s.bossDefeated >= 1 },
  { cat: 'Arena', id: 'streak5',  i: '🔥', n: 'Invicto',                 d: 'Vença 5 batalhas seguidas.',               g: 3, c: s => s.bestStreak >= 5 },
  { cat: 'Arena', id: 'streak10', i: '☄️', n: 'Imparável',               d: 'Vença 10 batalhas seguidas.',              g: 6, c: s => s.bestStreak >= 10 },
  { cat: 'Arena', id: 'crit50',   i: '🎯', n: 'Golpe certeiro',          d: 'Acerte 50 golpes críticos.',               g: 4, c: s => s.crits >= 50 },
  { cat: 'Arena', id: 'super50',  i: '🧪', n: 'Mestre elemental',        d: 'Acerte 50 golpes super eficazes.',         g: 4, c: s => s.superEffective >= 50 },
  { cat: 'Arena', id: 'flawless', i: '💯', n: 'Vitória perfeita',        d: 'Vença sem perder nenhuma abelha (liga Platina ou acima).', g: 4, c: s => s.flawless >= 1 },
  { cat: 'Arena', id: 'hit300',   i: '💥', n: 'Golpe devastador',        d: 'Cause 300 de dano em um único golpe.',     g: 4, c: s => s.bestHit >= 300 },
  { cat: 'Colmeia', id: 'hab5',     i: '🏘️', n: 'Cidade do favo',              d: 'Tenha 5 colmeias.',                        g: 3, c: () => S.habitats.length >= 5 },
  { cat: 'Colmeia', id: 'slots4',   i: '🎯', n: 'Roleteiro',             d: 'Gire a Roleta do Enxame 50 vezes.',         g: 4, c: s => s.swarmSpins >= 50 },
  { cat: 'Colmeia', id: 'sell',     i: '👋', n: 'Desapego',                 d: 'Venda uma abelha.',                         g: 1, c: s => s.dragonsSold >= 1 },
  { cat: 'Colmeia', id: 'miss5',    i: '📜', n: 'Prestativo',               d: 'Conclua 5 missões.',                       g: 3, c: s => s.missionsDone >= 5 },
  { cat: 'Colmeia', id: 'miss15',   i: '🎖️', n: 'Herói do favo',            d: 'Conclua 15 missões.',                      g: 8, c: s => s.missionsDone >= 15 },
  { cat: 'Colmeia', id: 'egg3',     i: '🎯', n: 'Caçador de fichas',     d: 'Pegue 3 fichas perdidas.',                 g: 4, c: s => s.lostEggs >= 3 },
  { cat: 'Colmeia', id: 'event5',   i: '📣', n: 'Sempre alerta',            d: 'Presencie 5 eventos.',                     g: 2, c: s => s.eventsSeen >= 5 },
  { cat: 'Jogador', id: 'plvl5',    i: '⭐', n: 'Aprendiz',               d: 'Chegue ao nível 5.',                       g: 2, c: () => S.level >= 5 },
  { cat: 'Jogador', id: 'plvl10',   i: '🌟', n: 'Apicultor',                d: 'Chegue ao nível 10.',                      g: 5, c: () => S.level >= 10 },
  { cat: 'Jogador', id: 'plvl20',   i: '💫', n: 'Mestre do enxame',     d: 'Chegue ao nível 20.',                      g: 10, c: () => S.level >= 20 },
  { cat: 'Jogador', id: 'fast5',    i: '⚡', n: 'Relâmpago',              d: 'Chegue ao nível 5 em até 5 minutos.',      g: 5, c: () => S.level >= 5 && S.t <= 300 },
  { cat: 'Jogador', id: 'fastL',    i: '🍀', n: 'Sorte de principiante', d: 'Obtenha uma Lendária em até 10 minutos.',   g: 8, c: s => s.firstLegendT !== null && s.firstLegendT <= 600 },
  { cat: 'Jogador', id: 'clicks500', i: '👆', n: 'Dedo nervoso',          d: 'Faça 500 cliques.',                        g: 2, c: s => s.clicks >= 500 },
  { cat: 'Ataque final', id: 'defend',   i: '🛡️', n: 'Tropa do Mel',      d: 'Vença o ataque da Vespa Rainha.',                   g: 10, c: s => s.finalWins >= 1 },
  { cat: 'Ataque final', id: 'defend0',  i: '🏰', n: 'Favo intocável',        d: 'Vença o ataque final sem perder nenhuma abelha.', g: 15, c: s => s.finalPerfect >= 1 },
  // v8.1: "Ferrão na Rainha" saiu (perder o chefe encerra a partida, então ficou impossível)
  { cat: 'Jardim', id: 'farmsMax', i: '🌻', n: 'Jardim perfeito',      d: 'Deixe todos os canteiros no nível máximo (no mínimo 6).', g: 10, c: () => S.farms.length >= 6 && S.farms.every(f => (f.lvl || 1) >= FARM_MAX) },
  { cat: 'Colmeia', id: 'hives9',   i: '🏘️', n: 'Cidade das abelhas',  d: 'Tenha 9 colmeias na ilha.',                       g: 8, c: () => S.habitats.length >= 9 },
  { cat: 'Evolução', id: 'mutTop', i: '🧬', n: 'Mutação de ouro',    d: 'Tenha uma abelha com uma mutação exclusiva do Laboratório.', g: 8, c: () => S.dragons.some(d => d.mut && MUTS[d.mut] && MUTS[d.mut].lab) },
  { cat: 'Evolução', id: 'mutL',   i: '🌟', n: 'Lenda mutante',      d: 'Tenha uma Lendária com mutação do Laboratório.',  g: 12, c: () => S.dragons.some(d => d.rar === 'L' && d.mut && MUTS[d.mut] && MUTS[d.mut].lab) },
  { cat: 'Evolução', id: 'asc3',        i: '🗼', n: 'Trio ascendido',      d: 'Ascenda 3 abelhas na Torre da Ascensão.',          g: 15, c: () => S.dragons.filter(d => d.asc).length >= 3 },
  { cat: 'Evolução', id: 'lvlAll',    i: '💪', n: 'Time de elite',       d: 'Tenha 3 abelhas no nível máximo ao mesmo tempo.',   g: 10, c: () => S.dragons.filter(d => d.lvl >= MAX_DLVL).length >= 3 },
  { cat: 'Coleção', id: 'upL',        i: '⬆️', n: 'Promoção lendária',   d: 'Transforme uma Épica em Lendária no Upgrade.',      g: 8, c: () => S.stats.upLegend >= 1 },
];
// ---------- Roguelite: cada partida sorteia o prado, as rainhas e as relíquias ----------
// Prado: 3 dos 6 tipos básicos nascem no prado da partida. Eles ficam liberados no nível 1, suas abelhas
// produzem +25% de mel e uma das 4 flores é a "flor nativa", que dá +50% de néctar.
const MEADOW_N = 3, MEADOW_GOLD = 1.25, NATIVE_FLOWER = 1.5;
// Modificadores da partida (1 = normal). Rainhas e relíquias mexem neles.
const MODS0 = { gold: 1, food: 1, farm: 1, hatch: 1, atk: 1, hp: 1, xp: 1, shop: 1, breed: 1, feed: 1, legend: 1, eff: 1.5, heal: 0, crit: 0.12, startGold: 1, lvlGems: 0 };
// Rainhas: o jogador escolhe 1 entre 3 sorteadas no início. Cada uma tem uma vantagem (b) e um defeito (m).
const QUEENS = [
  { k: 'ardente',   n: 'Rainha Ardente',   el: 'fogo',     b: '+30% de ataque nas batalhas',          m: 'Colmeias produzem 15% menos mel',   mods: { atk: 1.3, gold: 0.85 } },
  { k: 'doceira',   n: 'Rainha Doceira',   el: 'luz',      b: 'Colmeias produzem 35% mais mel',      m: 'Giro grátis 25% mais lento',      mods: { gold: 1.35, hatch: 0.75 } },
  { k: 'jardineira', n: 'Rainha Jardineira', el: 'planta', b: 'Flores dão 50% mais néctar',          m: 'Abelhas custam 20% mais no mercado', mods: { food: 1.5, shop: 1.2 } },
  { k: 'fertil',    n: 'Rainha Fértil',    el: 'agua',     b: 'Giro grátis 40% mais rápido',         m: '15% menos vida nas batalhas',       mods: { hatch: 1.4, hp: 0.85 } },
  { k: 'sortuda',   n: 'Rainha Sortuda',   el: 'eletrico', b: 'Mutações do Laboratório custam 1 cristal a menos', m: 'Colmeias dão 15% menos mel',      mods: { gold: 0.85 } },
  { k: 'guerreira', n: 'Rainha Guerreira', el: 'terra',    b: '+25% de vida nas batalhas',           m: 'Flores dão 25% menos néctar',       mods: { hp: 1.25, food: 0.75 } },
  { k: 'sabia',     n: 'Rainha Sábia',     el: 'gelo',     b: '+40% de experiência',                 m: 'Começa com metade do mel',          mods: { xp: 1.4, startGold: 0.5 } },
  { k: 'mercadora', n: 'Rainha Mercadora', el: 'metal',    b: 'Mercado 20% mais barato',             m: 'Alimentar custa 25% mais néctar',   mods: { shop: 0.8, feed: 1.25 } },
  { k: 'real',      n: 'Rainha Real',      el: 'trevas',   b: '+3 de geleia real a cada nível',      m: 'Colmeias produzem 10% menos mel',   mods: { lvlGems: 3, gold: 0.9 } },
];
// Relíquias: a cada RELIC_EVERY segundos o jogador escolhe 1 entre 3. Cada uma só pode ser pega uma vez,
// e as batalhas dão no máximo uma relíquia extra por ato.
const RELIC_EVERY = 300;
const RELICS = [
  { k: 'favo',     n: 'Favo Dourado',        i: '🏛️', d: '+20% de mel nas colmeias.',                       mods: { gold: 1.2 } },
  { k: 'polen',    n: 'Pólen Mágico',        i: '🌻', d: 'As flores crescem 25% mais rápido.',             mods: { farm: 1.25 } },
  { k: 'nectar',   n: 'Néctar Concentrado',  i: '🍖', d: '+30% de néctar em cada colheita.',               mods: { food: 1.3 } },
  { k: 'ninho',    n: 'Engrenagem de Mel',   i: '⚙️', d: 'O giro grátis da roleta chega 25% mais rápido.',                mods: { hatch: 1.25 } },
  { k: 'ferrao',   n: 'Ferrão Afiado',       i: '🗡️', d: '+15% de ataque nas batalhas.',                   mods: { atk: 1.15 } },
  { k: 'cera',     n: 'Cera Resistente',     i: '🛡️', d: '+15% de vida nas batalhas.',                     mods: { hp: 1.15 } },
  { k: 'lavanda',  n: 'Mel de Lavanda',      i: '❤️', d: 'Suas abelhas recuperam 6% da vida a cada turno.', add: { heal: 0.06 } },
  { k: 'mira',     n: 'Olho Composto',       i: '🎯', d: '+8% de chance de golpe crítico.',                add: { crit: 0.08 } },
  { k: 'elemental', n: 'Ferrão Elemental',   i: '🧪', d: 'Vantagem de tipo causa x1,8 de dano (era x1,5).', set: { eff: 1.8 }, once: true },
  { k: 'tropa',    n: 'Bênção da Tropa',     i: '⭐', d: '+25% de experiência.',                           mods: { xp: 1.25 } },
  { k: 'feromonio', n: 'Pó de Cristal',      i: '💠', d: 'Ganhe agora 2 cristais para o Laboratório.',     now: 'cristal' },
  { k: 'barganha', n: 'Moeda de Cera',       i: '🛒', d: 'Mercado 15% mais barato.',                       mods: { shop: 0.85 } },
  { k: 'pote',     n: 'Pote de Mel',         i: '🪙', d: 'Ganhe agora 90s da sua produção de mel (mínimo 500).', now: 'pote' },
  { k: 'geleia',   n: 'Geleia Fresca',       i: '💎', d: 'Ganhe agora 15 de geleia real.',                 now: 'geleia' },
  { k: 'ovo',      n: 'Bolsa de Fichas',     i: '🎯', d: 'Ganhe 5 fichas da Roleta do Enxame.', now: 'ovo' },
];
// Canteiros: cada um tem sua flor e seu nível (1 a 5). Nível dá mais néctar e cresce mais rápido.
const FARM_MAX = 5;
const farmUpCost = lvl => Math.round(150 * Math.pow(2.3, lvl - 1) * MOD('shop'));
const farmYield = f => 1 + 0.3 * ((f.lvl || 1) - 1);
const farmSpeed = f => 1 + 0.15 * ((f.lvl || 1) - 1);
// Abelha Jardineira: colhe e replanta sozinha
const GARDENER = { lvl: 6, cost: 3000, every: 1.5 };
// Roleta da BetMel
const SPIN = { gold: 5000, gems: 25 };
const SPIN_PRIZES = [
  { k: 'betmel', n: 'BetMel!', i: '🍀', p: 0.03, c: '#ffd23f' },
  { k: 'epico', n: 'Abelha Épica', i: '🔮', p: 0.10, c: '#c77dff' },
  { k: 'raro', n: '3 fichas', i: '🎯', p: 0.17, c: '#4fb3ff' },
  { k: 'mel', n: '3.000 de mel', i: '🪙', p: 0.25, c: '#f2a830' },
  { k: 'geleia', n: '12 de geleia real', i: '💎', p: 0.15, c: '#ffd9b0' },
  { k: 'nectar', n: '400 de néctar', i: '🍖', p: 0.30, c: '#ff83ba' },
];
const BETMEL = { key: 'X:betmel', name: 'BetMel', els: ['eletrico', 'luz'], rar: 'L' };
// Ataques vendidos na loja: a abelha aprende um golpe e ganha ataque permanente
const ATTACKS = {
  tripla:  { n: 'Ferroada Tripla', i: '🗡️', d: 'Golpe forte do tipo da abelha (x2,4), recarga de 4 turnos.', pow: 2.4, cd: 4, el: 'own', up: 0.10, gold: 7500, lvl: 3 },
  polen:   { n: 'Chuva de Pólen',  i: '💫', d: 'Golpe neutro (x1,6) que ignora fraquezas, recarga de 2 turnos.', pow: 1.6, cd: 2, el: null, up: 0.08, gold: 5400, lvl: 2 },
  pegajoso:{ n: 'Mel Pegajoso',    i: '❤️', d: 'Golpe x1,3 que cura 20% da vida da abelha, recarga de 3 turnos.', pow: 1.3, cd: 3, el: 'own', heal: 0.2, up: 0.06, gold: 9600, lvl: 4 },
  cometa:  { n: 'Mergulho Cometa', i: '☄️', d: 'Golpe x3 do 2º tipo da abelha com +25% de crítico, recarga de 5 turnos.', pow: 3.0, cd: 5, el: 'second', crit: 0.25, up: 0.15, gems: 75, lvl: 6 },
};
// Visual das abelhas: chapéus e asas comprados com geleia real
const SKINS = {
  palha:     { t: 'hat',  n: 'Chapéu de palha',  i: '🌾', gems: 8 },
  bone:      { t: 'hat',  n: 'Boné azul',        i: '⭐', gems: 8 },
  flores:    { t: 'hat',  n: 'Coroa de flores',  i: '🌻', gems: 10 },
  cartola:   { t: 'hat',  n: 'Cartola',          i: '💫', gems: 12 },
  coroa:     { t: 'hat',  n: 'Coroa dourada',    i: '👑', gems: 18 },
  borboleta: { t: 'wing', n: 'Asas de borboleta', i: '💞', gems: 12 },
  fada:      { t: 'wing', n: 'Asas de fada',     i: '✨', gems: 12 },
  ouro:      { t: 'wing', n: 'Asas de ouro',     i: '🌟', gems: 18 },
};
// Skins de colmeia (Loja > Visual): mudam só o cortiço da colmeia na ilha
const HIVE_SKINS = {
  doce:    { n: 'Colmeia Doce',     i: '💞', d: 'Rosa com um coração no topo',    gems: 10 },
  abobora: { n: 'Colmeia Abóbora',  i: '🌿', d: 'Laranja com folhinha',           gems: 10 },
  noite:   { n: 'Colmeia Noturna',  i: '🌙', d: 'Roxa com uma luz acesa',         gems: 14 },
  cristal: { n: 'Colmeia de Cristal', i: '💠', d: 'Azul brilhante com uma gema', gems: 18 },
  real:    { n: 'Colmeia Real',     i: '👑', d: 'Dourada com coroa',              gems: 22 },
};
// (DATA-END)

// ============================================================
