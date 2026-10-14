'use strict';
// ILHA ISOMÉTRICA (SVG 1000x600). Grade de 14x14 lotes em losango, 2:1.
// ============================================================
const TW = 64, TH = 32, OX = 500, OY = 68, NG = 14;
// Área do mapa mostrada na tela (x, y, largura, altura): um pouco mais longe que o 1000x600 original
const MAP_VB = [-60, -36, 1120, 672];
const iso = (x, y) => [OX + (x - y) * TW / 2, OY + (x + y) * TH / 2];
// Pontos em pixels do mapa convertidos para a grade
const gridAt = (X, Y) => { const a = (X - OX) * 2 / TW, b = (Y - OY) * 2 / TH; return [(a + b) / 2, (b - a) / 2]; };
// Vila da colmeia: praça com a fonte de mel no meio, construções em arco no fundo,
// colmeias dos dois lados da praça e o jardim de flores na frente.
const PLAZA = [500, 300];
const HAB_LOTS = [[620, 292], [380, 292], [635, 368], [365, 368], [750, 320], [250, 320], [500, 380], [818, 382], [182, 382]].map(p => gridAt(...p));
const FARM_ROWS = [462, 496], FARM_X = [324, 388, 452, 548, 612, 676];
const FARM_LOTS = FARM_ROWS.flatMap(Y => FARM_X.map(X => gridAt(X, Y)));
const SPOTS = {
  arena: { at: gridAt(500, 128), n: 'Arena', size: 3, px: [500, 128] },
  chocadeira: { at: gridAt(740, 180), n: 'Roleta do Enxame', px: [740, 180] },
  loja: { at: gridAt(260, 180), n: 'Mercado', px: [260, 180] },
  cruzar: { at: gridAt(880, 272), n: 'Laboratório', px: [880, 272] },
  torre: { at: gridAt(140, 260), n: 'Torre da Ascensão', px: [140, 260] },
};
// Enfeites em grupos, perto das bordas: potes de mel (0), colunas de cera (1) e pólen (2)
const TREES = [[400, 108, 1], [600, 108, 1], [240, 476, 2], [760, 476, 2], [710, 524, 0], [290, 524, 0], [250, 140, 1], [750, 140, 1], [110, 340, 0], [890, 340, 0]].map(([X, Y, n]) => [...gridAt(X, Y), n]);
// Flores (f), cera (r), pólen (b), favo selvagem (h) e a fonte de mel (w) no meio da praça
const DECOR = [[...gridAt(...PLAZA), 'w'], ...[[430, 250, 'f'], [570, 250, 'f'], [440, 350, 'f'], [560, 350, 'f'], [200, 440, 'h'], [800, 440, 'h'], [270, 250, 'b'], [730, 250, 'b'], [380, 524, 'f'], [620, 524, 'f'], [500, 528, 'h'], [430, 150, 'f'], [570, 150, 'f'],
  [236, 214, 'girassol'], [770, 214, 'skep'], [455, 222, 'lanterna'], [545, 222, 'lanterna'], [420, 410, 'lanterna'], [580, 410, 'lanterna'],
  [150, 430, 'girassol'], [850, 430, 'carga'], [260, 560, 'pedras'], [740, 560, 'skep'], [330, 108, 'pedras'], [670, 108, 'girassol'],
  [120, 300, 'flores'], [880, 300, 'flores'], [215, 330, 'vela'], [785, 330, 'polen2'], [395, 535, 'flores'], [605, 535, 'flores']].map(([X, Y, k]) => [...gridAt(X, Y), k])];
// Enfeite 3D (sombra + imagem do modelo); null enquanto o modelo não está pronto
function deco3d(kind, X, Y) {
  const r = ISO['i:deco:' + kind];
  if (!r) return null;
  const rx = Math.min(46, r.w * 0.4);
  return `<ellipse cx="${X}" cy="${Y + 3}" rx="${rx.toFixed(1)}" ry="${(rx * 0.36).toFixed(1)}" fill="url(#g-shadow)" opacity=".55"/>` + isoImg('deco:' + kind, X, Y);
}
// Miudezas (tufos, flores e gotas de mel) espalhadas onde não há lote, caminho nem construção
let FILL = null;
function fillDecor() {
  if (FILL) return FILL;
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const plaza = PLAZA, hubs = [...Object.values(SPOTS).map(sp => iso(...sp.at)), ...HAB_LOTS.map(l => iso(...l))];
  const segD = (x, y, [ax, ay], [bx, by]) => { const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy))); return Math.hypot(x - ax - t * dx, y - ay - t * dy); };
  const taken = [...DECOR, ...TREES].map(([x, y]) => iso(x, y)), out = [];
  for (let n = 0; n < 900 && out.length < 48; n++) {
    const X = 70 + rnd() * 860, Y = 70 + rnd() * 470;
    if (!inHex(X, Y, 40)) continue;
    if (Math.hypot((X - plaza[0]) / 2, Y - plaza[1]) < 62) continue;
    if (X > 280 && X < 720 && Y > 418 && Y < 512) continue;
    if (Object.entries(SPOTS).some(([k, sp]) => { const [sx, sy] = iso(...sp.at), r = k === 'arena' ? 110 : 78; return Math.hypot((X - sx) / 2, Y - sy) < r / 2.1; })) continue;
    if (HAB_LOTS.some(l => { const [hx, hy] = iso(...l); return Math.hypot((X - hx) / 2, Y - hy) < 34; })) continue;
    if (hubs.some(h => segD(X, Y, plaza, h) < 24)) continue;
    if ([...taken, ...out.map(o => iso(o[0], o[1]))].some(([tx, ty]) => Math.hypot(X - tx, Y - ty) < 34)) continue;
    out.push([...gridAt(X, Y), ['tufo', 'tufo2', 'gotas', 'tufo', 'flores', 'tufo2'][out.length % 6]]);
  }
  return (FILL = out);
}
const DECO_MAP = { w: 'fonte', h: 'favo', f: 'flores', b: 'arbusto' };
function isoDecor(x, y, k) {
  const [X, Y] = iso(x, y);
  { const d3 = deco3d(DECO_MAP[k] || k, X, Y); if (d3) return d3; if (DECO_KINDS.includes(k)) return ''; }
  if (k === 'm') return isoTree(x, y, 0);
  if (k === 'w') {
    // fonte de mel: bacia hexagonal com mel borbulhando
    const K = 1.6, hp = (r, dy, sq = .5) => [0, 60, 120, 180, 240, 300].map(a => `${(X + Math.cos(a * Math.PI / 180) * r).toFixed(1)},${(Y + dy + Math.sin(a * Math.PI / 180) * r * sq).toFixed(1)}`).join(' ');
    return `<ellipse cx="${X}" cy="${Y + 6}" rx="${30 * K}" ry="${10 * K}" fill="url(#g-shadow)"/><polygon points="${hp(26 * K, 0)}" fill="#c98a2c" stroke="#3a1c06" stroke-width="1.5" transform="translate(0 8)"/><polygon points="${hp(26 * K, 0)}" fill="url(#g-wax)" stroke="#3a1c06" stroke-width="1.5"/><polygon points="${hp(19 * K, -1)}" fill="url(#g-sea)"/><path d="M${X - 4},${Y - 2} L${X - 3},${Y - 26} Q${X},${Y - 30} ${X + 3},${Y - 26} L${X + 4},${Y - 2}Z" fill="url(#g-wax)" stroke="#3a1c06" stroke-width="1.3"/><ellipse cx="${X}" cy="${Y - 27}" rx="9" ry="4" fill="#ffb52e" stroke="#3a1c06" stroke-width="1.2"/><path d="M${X - 8},${Y - 26} q-3,10 -4,22 M${X + 8},${Y - 26} q3,10 4,22" stroke="#ffb52e" stroke-width="3" fill="none" opacity=".9"/><ellipse cx="${X - 10}" cy="${Y - 4}" rx="9" ry="3" fill="#fff" opacity=".45"/>`;
  }
  if (k === 'h') {
    // favo selvagem no chão, com mel escorrendo
    const cell = (cx, cy, c) => `<polygon points="${[0, 60, 120, 180, 240, 300].map(a => `${(cx + Math.cos(a * Math.PI / 180) * 7).toFixed(1)},${(cy + Math.sin(a * Math.PI / 180) * 6).toFixed(1)}`).join(' ')}" fill="${c}" stroke="#7a420f" stroke-width="1.4"/><polygon points="${[0, 60, 120, 180, 240, 300].map(a => `${(cx + Math.cos(a * Math.PI / 180) * 3.6).toFixed(1)},${(cy + Math.sin(a * Math.PI / 180) * 3).toFixed(1)}`).join(' ')}" fill="#c47a1a" opacity=".6"/>`;
    return `<ellipse cx="${X}" cy="${Y + 3}" rx="20" ry="6" fill="url(#g-shadow)"/>` + cell(X - 10.5, Y - 6, '#f6c75a') + cell(X + 10.5, Y - 6, '#f0b845') + cell(X, Y - 12, '#ffd476') + cell(X, Y, '#eab040') + `<path d="M${X + 4},${Y + 4} q1,6 -1,9 q-3,2 -2,-4Z" fill="#e89a20" stroke="#7a420f" stroke-width="1"/>`;
  }
  if (k === 'r') return `<ellipse cx="${X}" cy="${Y + 2}" rx="12" ry="4" fill="url(#g-shadow)"/><path d="M${X - 11},${Y + 2} Q${X - 10},${Y - 9} ${X},${Y - 11} Q${X + 11},${Y - 9} ${X + 11},${Y + 2}Z" fill="url(#g-wax)" stroke="#3a1c06" stroke-width="1.4"/><path d="M${X - 4},${Y - 10} q-1,7 1,9 q2,1 1,-5Z" fill="#ffb52e"/>`;
  if (k === 'b') return isoTree(x, y, 2).replace(/r="(\d+(?:\.\d+)?)"/g, (m, r) => `r="${(r * 0.7).toFixed(1)}"`);
  if (k === 'r') return `<ellipse cx="${X}" cy="${Y + 2}" rx="11" ry="4" fill="url(#g-shadow)"/><path d="M${X - 10},${Y + 2} Q${X - 9},${Y - 9} ${X},${Y - 10} Q${X + 10},${Y - 9} ${X + 10},${Y + 2}Z" fill="#a3a3ad" stroke="#1b1230" stroke-width="1.4"/><path d="M${X - 4},${Y - 6} l4,-1" stroke="#fff" stroke-width="1.4" opacity=".6"/>`;
  if (k === 'b') return `<circle cx="${X - 6}" cy="${Y - 4}" r="7" fill="url(#g-leaf)" stroke="#1b1230" stroke-width="1.3"/><circle cx="${X + 5}" cy="${Y - 5}" r="8" fill="url(#g-leaf)" stroke="#1b1230" stroke-width="1.3"/><circle cx="${X + 3}" cy="${Y - 8}" r="1.8" fill="#ffd23f"/>`;
  return [[-8, 0, '#ff7ab6'], [0, -4, '#ffd23f'], [7, 1, '#ffffff'], [-2, 4, '#c77dff']].map(([dx, dy, c]) => `<path d="M${X + dx},${Y + dy} v-6" stroke="#2f7d38" stroke-width="1.2"/><circle cx="${X + dx}" cy="${Y + dy - 7}" r="2.6" fill="${c}" stroke="#1b1230" stroke-width=".8"/>`).join('');
}
const pts = arr => arr.map(p => p.map(v => Math.round(v * 10) / 10).join(',')).join(' ');
function diamond(cx, cy, w, h) { return [iso(cx - w / 2, cy - h / 2), iso(cx + w / 2, cy - h / 2), iso(cx + w / 2, cy + h / 2), iso(cx - w / 2, cy + h / 2)]; }
// Lote com faces laterais (altura d) — base de toda construção
function slab(cx, cy, w, h, d, top, side1, side2, extra = '') {
  const [t, r, b, l] = diamond(cx, cy, w, h);
  return `<polygon points="${pts([l, b, [b[0], b[1] + d], [l[0], l[1] + d]])}" fill="${side1}"/>
    <polygon points="${pts([b, r, [r[0], r[1] + d], [b[0], b[1] + d]])}" fill="${side2}"/>
    <polygon class="lot" points="${pts([t, r, b, l])}" fill="${top}" stroke="rgba(0,0,0,.25)" stroke-width="1.5" ${extra}/>`;
}
// Rótulos e balões vão para uma camada por cima de tudo, para não ficarem escondidos atrás de outras construções
let topLayer = [];
function pill(x, y, txt, w) {
  w = w || Math.max(46, txt.length * 6.6 + 14);
  topLayer.push(`<g pointer-events="none"><rect class="pill" x="${x - w / 2}" y="${y - 10}" width="${w}" height="20" rx="10"/><text class="lbl" x="${x}" y="${y + 4}" text-anchor="middle">${txt}</text></g>`);
  return '';
}
function pillInline(x, y, txt, w) {
  w = w || Math.max(46, txt.length * 6.6 + 14);
  return `<rect class="pill" x="${x - w / 2}" y="${y - 10}" width="${w}" height="20" rx="10"/><text class="lbl" x="${x}" y="${y + 4}" text-anchor="middle">${txt}</text>`;
}
function bubble(x, y, icon, full, txt, attrs = '') {
  topLayer.push(`<g ${attrs} class="bld"><g class="bubble ${full ? 'full' : ''}"><path d="M${x - 17},${y - 34} h34 a8,8 0 0 1 8,8 v18 a8,8 0 0 1 -8,8 h-11 l-6,8 l-6,-8 h-11 a8,8 0 0 1 -8,-8 v-18 a8,8 0 0 1 8,-8Z" fill="#fff8e6" stroke="#1b1230" stroke-width="2"/>
    <text x="${x}" y="${y - 12}" text-anchor="middle" font-size="18">${icon}</text>${txt ? `<text x="${x}" y="${y + 18}" text-anchor="middle" font-size="12" fill="#ffcc4d" stroke="#1b1230" stroke-width="3" paint-order="stroke">${txt}</text>` : ''}</g></g>`);
  return '';
}
// Encaixa o SVG de um dragão dentro do mapa
function placeDragon(d, x, y, w) {
  const h = w * 108 / 132;
  // vale também para o marcador provisório (class="dg ph"), que antes ficava sem tamanho e virava um anel gigante
  return dragonSVG(d.els, d.rar, d.id, d.skin).replace(/<svg class="(dg(?: ph)?)" viewBox="-6 -8 132 108"( style=")?/, (m, cl, st) => `<svg class="${cl}" viewBox="-6 -8 132 108" x="${Math.round(x - w / 2)}" y="${Math.round(y - h * 0.9)}" width="${w}" height="${Math.round(h)}" style="width:${w}px;height:${Math.round(h)}px;${st ? '' : '"'}`);
}
const HAB_THEME = {
  fogo: ['#7a4334', '#4f2a20', '#3a1e17'], agua: ['#f0dca0', '#b99a5a', '#9a7d44'], planta: ['#86d062', '#4f923a', '#3e7a2d'],
  terra: ['#c19466', '#87603a', '#6c4c2c'], eletrico: ['#9aa2b6', '#636a7c', '#4f5565'], gelo: ['#f0faff', '#a9cfe6', '#8db7d2'],
  metal: ['#b6bfcd', '#78818f', '#626a78'], trevas: ['#55437a', '#33264b', '#271c3a'], luz: ['#fdf6e2', '#cfc29b', '#b6a980'], none: ['#f6c768', '#c98a2c', '#a8641a'],
};
function habTheme(ds) {
  if (!ds.length) return 'none';
  const n = {};
  ds.forEach(d => { n[d.els[0]] = (n[d.els[0]] || 0) + 1; });
  return Object.keys(n).sort((a, b) => n[b] - n[a])[0];
}
// Decoração do habitat conforme o elemento que mais aparece nele (fica atrás dos dragões)
function habDecor(th, X, Y) {
  const O = 'stroke="#1b1230" stroke-width="1.6" stroke-linejoin="round"';
  switch (th) {
    case 'fogo': return `<ellipse cx="${X + 26}" cy="${Y + 4}" rx="20" ry="9" fill="url(#g-lava)" stroke="#2a120a" stroke-width="2.5"/><ellipse class="glow" cx="${X + 26}" cy="${Y + 3}" rx="10" ry="4" fill="#fff3a0" opacity=".7"/>
      <path d="M${X - 48},${Y - 2} l7,-13 l8,12Z M${X - 38},${Y + 8} l6,-10 l7,9Z M${X + 6},${Y - 22} l6,-12 l7,11Z" fill="#3d2621" ${O}/><path class="smoke" d="M${X + 30},${Y - 6} q4,-6 0,-12 q-4,-6 0,-12" stroke="#c9b3a8" stroke-width="2" fill="none" opacity=".5"/>`;
    case 'agua': return `<ellipse cx="${X + 18}" cy="${Y + 2}" rx="30" ry="14" fill="url(#g-water)" stroke="#e8d49a" stroke-width="3.5"/><path class="wave" d="M${X + 4},${Y + 2} q6,-3 12,0 t12,0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".7"/>
      <circle cx="${X - 44}" cy="${Y}" r="5" fill="#d9c08a" ${O}/><path d="M${X + 42},${Y - 6} c-2,-10 4,-14 6,-18 M${X + 46},${Y - 6} c0,-8 6,-10 8,-14" stroke="#3a8a2f" stroke-width="2" fill="none"/>`;
    case 'planta': return `<circle cx="${X - 44}" cy="${Y - 4}" r="11" fill="url(#g-leaf)" ${O}/><circle cx="${X - 36}" cy="${Y + 4}" r="8" fill="url(#g-leaf)" ${O}/><circle cx="${X + 40}" cy="${Y - 6}" r="10" fill="url(#g-leaf)" ${O}/>
      ${[[-20, 10, '#ff7ab6'], [24, 8, '#ffd23f'], [-4, -20, '#ffffff'], [14, -16, '#ff7ab6']].map(([dx, dy, c]) => `<circle cx="${X + dx}" cy="${Y + dy}" r="2.6" fill="${c}" stroke="#1b1230" stroke-width=".8"/>`).join('')}`;
    case 'terra': return `<ellipse cx="${X - 40}" cy="${Y - 2}" rx="12" ry="8" fill="#9a8a78" ${O}/><ellipse cx="${X + 38}" cy="${Y - 4}" rx="10" ry="7" fill="#8a7a68" ${O}/><ellipse cx="${X + 24}" cy="${Y + 10}" rx="7" ry="5" fill="#a8988a" ${O}/>
      <path d="M${X - 44},${Y - 6} l6,2 M${X + 34},${Y - 7} l5,2" stroke="#fff" stroke-width="1" opacity=".5"/>`;
    case 'eletrico': return `<rect x="${X + 34}" y="${Y - 40}" width="6" height="40" fill="url(#g-steel)" ${O}/><path d="M${X + 31},${Y - 20} h12 M${X + 31},${Y - 28} h12" stroke="#1b1230" stroke-width="1.6"/><circle cx="${X + 37}" cy="${Y - 44}" r="8" fill="url(#g-steel)" ${O}/>
      <path class="zap" d="M${X + 44},${Y - 46} l6,-4 l-2,6 l7,-3" stroke="#ffe14d" stroke-width="2.2" fill="none"/><path class="zap" d="M${X + 30},${Y - 48} l-6,-5 l1,6 l-7,-2" stroke="#ffe14d" stroke-width="2.2" fill="none" style="animation-delay:-.5s"/>`;
    case 'gelo': return `<path d="M${X - 48},${Y} l4,-22 l6,22Z M${X - 40},${Y + 6} l3,-16 l5,16Z M${X + 36},${Y - 2} l5,-26 l6,26Z M${X + 46},${Y + 4} l3,-14 l4,14Z" fill="url(#g-ice)" ${O}/>
      ${[[-10, 12], [16, -16], [22, 12], [-24, -12]].map(([dx, dy]) => `<circle cx="${X + dx}" cy="${Y + dy}" r="1.8" fill="#fff"/>`).join('')}`;
    case 'metal': return `<path d="M${X - 30},${Y - 4} L${X},${Y - 19} M${X - 30},${Y + 4} L${X + 30},${Y - 26}" stroke="#5d6575" stroke-width="1.4" opacity=".7"/>
      <g transform="translate(${X + 38} ${Y - 12})"><circle r="11" fill="url(#g-steel)" ${O}/><circle r="4" fill="#626a78" ${O}/>${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<rect x="-2.5" y="-15" width="5" height="5" fill="url(#g-steel)" stroke="#1b1230" stroke-width="1" transform="rotate(${a})"/>`).join('')}</g>`;
    case 'trevas': return `<path d="M${X - 48},${Y + 2} l5,-24 l7,24Z M${X - 38},${Y + 8} l4,-16 l6,16Z M${X + 36},${Y} l6,-28 l7,28Z" fill="url(#g-crystal)" ${O}/>
      <ellipse class="glow" cx="${X + 42}" cy="${Y - 12}" rx="5" ry="10" fill="#e9c6ff" opacity=".6"/><path class="smoke" d="M${X - 10},${Y - 14} q-4,-6 0,-12 q4,-6 0,-12" stroke="#a78bfa" stroke-width="2" fill="none" opacity=".6"/>`;
    case 'luz': return `${[[-44, -2], [40, -6]].map(([dx, dy]) => `<rect x="${X + dx - 5}" y="${Y + dy - 36}" width="10" height="36" fill="url(#g-stone)" ${O}/><rect x="${X + dx - 8}" y="${Y + dy - 42}" width="16" height="7" rx="2" fill="url(#g-gold)" ${O}/><circle class="glow" cx="${X + dx}" cy="${Y + dy - 48}" r="5" fill="#fff6b0"/>`).join('')}`;
  }
  return `<path d="M${X - 40},${Y - 2} l3,-9 l3,9 M${X - 32},${Y + 4} l3,-8 l3,8 M${X + 34},${Y - 4} l3,-9 l3,9" stroke="#2f6b2a" stroke-width="2" fill="none"/>`;
}
// Abelhas passeando: no máximo 2 saem da colmeia, dão uma volta pela ilha e voltam.
// v8.0: Pedro pediu as abelhas grandes paradas na colmeia (ficam só as pequenas da ilha 3D)
const FLY_ON = false;
const FLY_CYCLE = 70, FLY_WIN = [[0, 30], [22, 52]], FLY_DUR = 26;
const HAB_SPOTS = [[-22, -2], [6, -12], [2, 12]];
function flyingBees() {
  if (!FLY_ON || !S || S.ended) return [];
  const n = Math.min(S.dragons.length, S.habitats.length * HAB_CAP);
  if (n < 3) return [];
  const c = Math.floor(S.t / FLY_CYCLE), ph = S.t - c * FLY_CYCLE, out = [];
  FLY_WIN.forEach(([a, b], k) => {
    if (ph < a || ph >= b) return;
    const j = (c * 2 + k) % n, d = S.dragons[j];
    if (!d) return;
    const [X, Y] = iso(...HAB_LOTS[Math.floor(j / HAB_CAP)]), o = HAB_SPOTS[j % HAB_CAP];
    out.push({ d, k, key: `${d.id}:${c}:${j}`, x: X + o[0] * 1.15, y: Y + o[1] * 1.15 });
  });
  return out;
}
function flyPathFrom(x, y, k) {
  const cx = 500, cy = 300, rx = k ? 330 : 390, ry = k ? 170 : 215;
  let a0 = Math.atan2((y - cy) / ry, (x - cx) / rx);
  const P = [[x, y], [x, y - 70]];
  for (let s = 1; s <= 6; s++) { const a = a0 + (k ? -1 : 1) * s * Math.PI / 3.5; P.push([cx + Math.cos(a) * rx, cy - 40 + Math.sin(a) * ry]); }
  P.push([x, y - 70], [x, y]);
  let d = `M${x.toFixed(0)},${y.toFixed(0)}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    const f = v => v.toFixed(0);
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d;
}
const flyStarted = new WeakMap();
function startFlights() {
  document.querySelectorAll('#map animateMotion[data-fly]').forEach(m => {
    if (flyStarted.get(m) === m.dataset.fly) return;
    flyStarted.set(m, m.dataset.fly);
    try { m.beginElement(); } catch (e) { /* sem SMIL: a abelha fica na colmeia */ }
  });
}
function isoHabitat(i) {
  const [cx, cy] = HAB_LOTS[i];
  const [X, Y] = iso(cx, cy);
  const ds = habDragons(i), h = S.habitats[i];
  const th = habTheme(ds), [top, s1, s2] = HAB_THEME[th];
  const g = habGps(i), cap = Math.max(50, g * 60), full = h.stored >= cap - 0.5 && g > 0;
  let out = `<g class="bld" data-a="collect" data-i="${i}" tabindex="0" role="button" aria-label="Colmeia ${i + 1}: ${ds.length} de ${HAB_CAP} abelhas, ${fmt(g)} de mel por segundo"><title>Colmeia ${i + 1} · ${ds.length}/${HAB_CAP} abelhas · ${fmt(g)} ouro/s</title>`;
  const img = ISO3D ? null : isoImg('habitat:' + th, X, Y);
  if (ISO3D) out += `<polygon class="lot hit" points="${pts(diamond(cx, cy, 1.9, 1.9))}" fill="transparent"/><rect class="hit" x="${X - 46}" y="${Y - 80}" width="92" height="80" fill="transparent"/>`;
  else out += `<ellipse cx="${X}" cy="${Y + 14}" rx="74" ry="26" fill="url(#g-shadow)" opacity=".5"/>`;
  if (ISO3D) { /* a colmeia é desenhada na ilha 3D */ }
  else if (img) out += `<polygon class="lot hit" points="${pts(diamond(cx, cy, 1.9, 1.9))}" fill="transparent"/>` + img;
  else {
    out += slab(cx, cy, 1.9, 1.9, 10, top, s1, s2);
    out += `<polygon points="${pts(diamond(cx, cy, 1.5, 1.5))}" fill="#fff" opacity=".12"/>`;
    out += `<polyline points="${pts([diamond(cx, cy, 1.9, 1.9)[3], diamond(cx, cy, 1.9, 1.9)[0], diamond(cx, cy, 1.9, 1.9)[1]])}" fill="none" stroke="#fff" stroke-width="1.5" opacity=".35"/>`;
    out += habDecor(th, X, Y);
  }
  const away = new Set(flyingBees().map(f => f.d.id));
  ds.map((d, k) => ({ d, o: HAB_SPOTS[k] })).filter(({ d }) => !away.has(d.id)).sort((a, b) => a.o[1] - b.o[1]).forEach(({ d, o }) => {
    out += `<g class="roam" style="animation-delay:${-((d.id * 1.7) % 7).toFixed(1)}s">${placeDragon(d, X + o[0] * 1.15, Y + o[1] * 1.15, 70)}</g>`;
  });
  if (h.stored >= 1) out += bubble(X + 34, Y - 52, '🪙', full, fmt(h.stored), `data-a="collect" data-i="${i}"`);
  return out + '</g>';
}
function isoGhost(cx, cy, size, action, label) {
  const [X, Y] = iso(cx, cy);
  return `<g class="bld ghost" data-a="${action}" tabindex="0" role="button" aria-label="${label}">
    <polygon class="lot" points="${pts(diamond(cx, cy, size, size))}" fill="rgba(255,255,255,.12)" stroke="#fff" stroke-width="2" stroke-dasharray="6 5"/>
    ${pillInline(X, Y + 4, label)}</g>`;
}
function isoFarm(i) {
  const [cx, cy] = FARM_LOTS[i];
  const [X, Y] = iso(cx, cy);
  const f = S.farms[i];
  let out = `<g class="bld" data-a="farm" data-i="${i}" tabindex="0" role="button" aria-label="Canteiro de flores ${i + 1}">`;
  if (ISO3D) out += `<polygon class="lot hit" points="${pts(diamond(cx, cy, 0.9, 0.9))}" fill="transparent"/>`;
  else out += slab(cx, cy, 0.86, 0.86, 5, '#7a4a24', '#5a3518', '#4a2a12');
  if (!ISO3D) out += [0.25, 0.5, 0.75].map(k => { const a = iso(cx - 0.43, cy - 0.43 + 0.86 * k), c = iso(cx + 0.43, cy - 0.43 + 0.86 * k); return `<path d="M${pts([a])} L${pts([c])}" stroke="#4a2a12" stroke-width="1.6" opacity=".8"/>`; }).join('');
  const spots = [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map(([dx, dy]) => iso(cx + dx, cy + dy)).sort((a, c) => a[1] - c[1]);
  if (!f.crop) out += `<g opacity=".55">${spots.map(([x, y]) => cropPlant(S.selCrop, x, y, 0)).join('')}</g>`;
  else {
    const c = CROPS[f.crop], p = Math.min(1, f.prog / c.dur);
    out += `<g class="${p >= 1 ? 'ready-crop' : ''}">${spots.map(([x, y]) => cropPlant(f.crop, x, y, p)).join('')}</g>`;
    if (p >= 1) out += bubble(X, Y - 26, '✋', true, '', `data-a="farm" data-i="${i}"`);
    else out += `<rect x="${X - 16}" y="${Y + 12}" width="32" height="5" rx="2.5" fill="rgba(0,0,0,.55)"/><rect x="${X - 16}" y="${Y + 12}" width="${Math.round(32 * p)}" height="5" rx="2.5" fill="#84e08a"/>`;
  }
  return out + '</g>';
}
function isoWheel(cx, cy, X, Y) {
  let o = `<ellipse cx="${X}" cy="${Y + 14}" rx="74" ry="26" fill="url(#g-shadow)" opacity=".5"/>`;
  o += slab(cx, cy, 1.9, 1.9, 9, '#f2c26a', '#a8692e', '#7a4a1e');
  o += `<polygon points="${pts(diamond(cx, cy, 1.4, 1.4))}" fill="#ffe3a0" opacity=".55"/>`;
  o += `<path d="M${X - 26},${Y + 2} L${X - 6},${Y - 56} M${X + 26},${Y + 2} L${X + 6},${Y - 56}" stroke="#5a3212" stroke-width="7" stroke-linecap="round"/>`;
  const R = 38, cyw = Y - 62, cols = ['#9aa7b4', '#4fb3ff', '#9aa7b4', '#c77dff', '#9aa7b4', '#4fb3ff', '#ffd23f', '#4fb3ff'];
  let sl = '';
  for (let i = 0; i < 8; i++) { const a0 = i * Math.PI / 4 - Math.PI / 2, a1 = a0 + Math.PI / 4; sl += `<path d="M0,0 L${(Math.cos(a0) * R).toFixed(1)},${(Math.sin(a0) * R).toFixed(1)} A${R},${R} 0 0 1 ${(Math.cos(a1) * R).toFixed(1)},${(Math.sin(a1) * R).toFixed(1)}Z" fill="${cols[i]}" stroke="#5a3212" stroke-width="1.5"/>`; }
  const spin = S.wheel && S.wheel.until > performance.now();
  o += `<g transform="translate(${X},${cyw})"><circle r="${R + 6}" fill="#6b3a0c" stroke="#1b1230" stroke-width="2"/><g class="mwheel ${spin ? 'spin' : ''}">${sl}</g><circle r="${R + 2}" fill="none" stroke="#ffd98a" stroke-width="3"/>`
    + [...Array(12)].map((_, i) => `<circle cx="${(Math.cos(i * Math.PI / 6) * (R + 3)).toFixed(1)}" cy="${(Math.sin(i * Math.PI / 6) * (R + 3)).toFixed(1)}" r="2.2" fill="#fff6d0"/>`).join('')
    + `<circle r="9" fill="#ffd23f" stroke="#5a3212" stroke-width="2"/><path d="M-7,${-R - 12} L7,${-R - 12} L0,${-R + 2}Z" fill="#ff4d6d" stroke="#1b1230" stroke-width="1.5"/></g>`;
  const n = (S.t >= S.freeAt ? 1 : 0) + S.tickets;
  if (n) o += bubble(X + 44, Y - 104, '🎯', true, String(n), 'data-a="tab" data-k="chocadeira"');
  return o;
}
const spotName = k => k === 'cruzar' && labLocked() ? `🔒 ${SPOTS[k].n} · Nv ${LAB_OPEN.lvl}` : SPOTS[k].n;
function isoSpecial(k) {
  const sp = SPOTS[k], [cx, cy] = sp.at, size = sp.size || 2;
  const [X, Y] = iso(cx, cy);
  let out = `<g class="bld" data-a="tab" data-k="${k}" tabindex="0" role="button" aria-label="Abrir ${sp.n}">`;
  if (ISO3D) {
    const big = size === 3, hh = big ? 170 : 120;
    out += `<polygon class="lot hit" points="${pts(diamond(cx, cy, size, size))}" fill="transparent"/><rect class="hit" x="${X - (big ? 80 : 46)}" y="${Y - hh}" width="${big ? 160 : 92}" height="${hh}" fill="transparent"/>`;
    if (k === 'arena') { const alert = S.finalPhase ? '☠️' : (S.event && S.event.type === 'selvagem' && S.event.until > S.t) ? '🐲' : (S.battle && !S.battle.over) ? '⚔️' : ''; if (alert) bubble(X, Y - 122, alert, true, '', 'data-a="tab" data-k="arena"'); }
    else if (k === 'missoes') { const claim = S.missions.filter(m => missionProg(m) >= m.target).length; if (claim) bubble(X + 30, Y - 68, '📜', true, String(claim), 'data-a="tab" data-k="missoes"'); }
    else if (k === 'chocadeira') { const n = (S.t >= S.freeAt ? 1 : 0) + S.tickets; if (n) bubble(X, Y - 128, '🎯', true, String(n), 'data-a="tab" data-k="chocadeira"'); }
    else if (k === 'torre') { const T = towerOf(), P = TOWER_PARTS[T.floors]; if ((P && T.items.includes(P.k)) || T.used < T.floors) bubble(X, Y - 96 - towerOf().floors * 14, '🗼', true, '!', 'data-a="tab" data-k="torre"'); }
    else if (k === 'cruzar' && labLocked() && S.level >= LAB_OPEN.lvl) bubble(X, Y - 104, '🧪', true, '!', 'data-a="tab" data-k="cruzar"');
    return out + pill(X, Y + (big ? 52 : 26), spotName(k)) + '</g>';
  }
  if (k === 'chocadeira') {
    const im = isoImg('roleta', X, Y), n = (S.t >= S.freeAt ? 1 : 0) + S.tickets;
    if (!im) return out + `<polygon class="lot hit" points="${pts(diamond(cx, cy, size, size))}" fill="transparent"/><rect class="hit" x="${X - 50}" y="${Y - 110}" width="100" height="110" fill="transparent"/>` + isoWheel(cx, cy, X, Y) + pill(X, Y + 26, sp.n) + '</g>';
    out += `<ellipse cx="${X}" cy="${Y + 14}" rx="74" ry="26" fill="url(#g-shadow)" opacity=".45"/><polygon class="lot hit" points="${pts(diamond(cx, cy, size, size))}" fill="transparent"/><rect class="hit" x="${X - 50}" y="${Y - 120}" width="100" height="120" fill="transparent"/>` + im;
    if (S.wheel && S.wheel.until > performance.now()) out += `<g class="mspark" pointer-events="none"><circle cx="${X + 14}" cy="${Y - 70}" r="34" fill="#ffd23f" opacity=".22"/></g>`;
    if (n) bubble(X + 46, Y - 112, '🎯', true, String(n), 'data-a="tab" data-k="chocadeira"');
    return out + pill(X, Y + 26, sp.n) + '</g>';
  }
  const img = isoImg(k, X, Y);
  if (img) {
    const r = ISO['i:' + k], big = size === 3;
    out += `<ellipse cx="${X}" cy="${Y + (big ? 18 : 14)}" rx="${big ? 110 : 74}" ry="${big ? 40 : 26}" fill="url(#g-shadow)" opacity=".45"/>`;
    out += `<polygon class="lot hit" points="${pts(diamond(cx, cy, size, size))}" fill="transparent"/><rect class="hit" x="${X - r.w * 0.3}" y="${Y - r.ay}" width="${r.w * 0.6}" height="${r.ay}" fill="transparent"/>` + img;
    if (k === 'arena') {
      const alert = S.finalPhase ? '☠️' : (S.event && S.event.type === 'selvagem' && S.event.until > S.t) ? '🐲' : (S.battle && !S.battle.over) ? '⚔️' : '';
      if (alert) out += bubble(X + 50, Y - 78, alert, true, '', 'data-a="tab" data-k="arena"');
    } else if (k === 'chocadeira') {
      S.eggs.slice(0, 4).forEach((e, n) => { out += `<ellipse cx="${X - 30 + n * 20}" cy="${Y + 26}" rx="6" ry="8" fill="${RING[e.sp.rar]}" stroke="#1b1230" stroke-width="1.5"/><ellipse cx="${X - 32 + n * 20}" cy="${Y + 22}" rx="2" ry="3" fill="#fff" opacity=".6"/>`; });
      const ready = S.eggs.filter(e => e.prog >= e.dur).length;
      if (ready) out += bubble(X + 34, Y - 64, '🐣', true, String(ready), 'data-a="tab" data-k="chocadeira"');
    } else if (k === 'missoes') {
      const claim = S.missions.filter(m => missionProg(m) >= m.target).length;
      if (claim) out += bubble(X + 30, Y - 68, '📜', true, String(claim), 'data-a="tab" data-k="missoes"');
    }
    out += pill(X, Y + (big ? 52 : 40), sp.n);
    return out + '</g>';
  }
  if (k === 'arena') {
    out += `<ellipse cx="${X}" cy="${Y + 18}" rx="110" ry="40" fill="url(#g-shadow)" opacity=".5"/>`;
    out += slab(cx, cy, 2.9, 2.9, 10, '#cdb88e', '#8f7a52', '#7a6744');
    out += `<ellipse cx="${X}" cy="${Y}" rx="70" ry="35" fill="#a8895a" stroke="#1b1230" stroke-width="2"/>`;
    out += `<path d="M${X - 70},${Y} v-30 a70,35 0 0 1 140,0 v30 a70,35 0 0 0 -140,0Z" fill="url(#g-stone)" stroke="#1b1230" stroke-width="2"/>`;
    out += `<path d="M${X - 70},${Y - 15} a70,35 0 0 0 140,0" stroke="#9c8a66" stroke-width="1.5" fill="none"/>`;
    for (let a = 0; a < 7; a++) { const x = X - 58 + a * 19.3; out += `<path d="M${x - 5},${Y - 6 + Math.abs(a - 3) * 2} v-14 a5,5 0 0 1 10,0 v14Z" fill="#5c4630"/>`; }
    out += `<ellipse cx="${X}" cy="${Y - 30}" rx="56" ry="26" fill="#e8d9b0" stroke="#1b1230" stroke-width="2"/><ellipse cx="${X}" cy="${Y - 28}" rx="40" ry="17" fill="#d6b56d"/>`;
    [[-62, -40], [62, -40], [0, -72]].forEach(([dx, dy], n) => { out += `<path d="M${X + dx},${Y + dy + 26} v-30" stroke="#3b2a1a" stroke-width="2.5"/><path class="flag" d="M${X + dx},${Y + dy - 4} l18,5 l-18,6Z" fill="${['#ff7a3d', '#62e3ff', '#ffcc4d'][n]}" stroke="#1b1230" stroke-width="1.5"/>`; });
    const alert = S.finalPhase ? '☠️' : (S.event && S.event.type === 'selvagem' && S.event.until > S.t) ? '🐲' : (S.battle && !S.battle.over) ? '⚔️' : '';
    if (alert) out += bubble(X + 50, Y - 78, alert, true, '', 'data-a="tab" data-k="arena"');
  } else {
    out += `<ellipse cx="${X}" cy="${Y + 14}" rx="74" ry="26" fill="url(#g-shadow)" opacity=".5"/>`;
    out += slab(cx, cy, 1.9, 1.9, 9, '#d4e2aa', '#7f9358', '#6b7d48');
    out += `<polygon points="${pts(diamond(cx, cy, 1.5, 1.5))}" fill="url(#p-cobble)" opacity=".85"/>`;
    if (k === 'cruzar') {
      out += `<polygon points="${X - 46},${Y + 6} ${X - 14},${Y - 62} ${X + 14},${Y + 10}" fill="url(#g-mount)" stroke="#1b1230" stroke-width="2"/>
        <polygon points="${X - 6},${Y + 10} ${X + 22},${Y - 46} ${X + 48},${Y + 4}" fill="url(#g-mount)" stroke="#1b1230" stroke-width="2"/><path d="M${X + 22},${Y - 46} L${X + 30},${Y + 6}" stroke="#fff" stroke-width="2" opacity=".25"/>
        <polygon points="${X - 22},${Y - 46} ${X - 14},${Y - 62} ${X - 6},${Y - 46} ${X - 14},${Y - 42}" fill="#fff"/>
        <path class="heart" d="M${X + 4},${Y - 70} c-6,-8 -18,-2 -10,8 l10,10 l10,-10 c8,-10 -4,-16 -10,-8Z" fill="#ff5d8f" stroke="#1b1230" stroke-width="2"/>`;
    } else if (k === 'chocadeira') {
      out += `<ellipse cx="${X}" cy="${Y + 4}" rx="40" ry="16" fill="#8a6a3a" stroke="#1b1230" stroke-width="2"/>
        <path d="M${X - 30},${Y + 2} C${X - 34},${Y - 44} ${X - 14},${Y - 70} ${X},${Y - 70} C${X + 14},${Y - 70} ${X + 34},${Y - 44} ${X + 30},${Y + 2}Z" fill="url(#g-dome)" stroke="#1b1230" stroke-width="2"/><path d="M${X - 18},${Y - 50} C${X - 22},${Y - 34} ${X - 22},${Y - 18} ${X - 20},${Y - 4}" stroke="#fff" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/>
        <circle cx="${X - 10}" cy="${Y - 40}" r="5" fill="#ffb35c"/><circle cx="${X + 12}" cy="${Y - 24}" r="6" fill="#62e3ff"/><circle cx="${X + 6}" cy="${Y - 52}" r="4" fill="#c77dff"/>
        <path d="M${X - 9},${Y + 4} v-16 a9,9 0 0 1 18,0 v16Z" fill="#5c4630"/>`;
      S.eggs.slice(0, 4).forEach((e, n) => { out += `<ellipse cx="${X - 30 + n * 20}" cy="${Y + 22}" rx="6" ry="8" fill="${RING[e.sp.rar]}" stroke="#1b1230" stroke-width="1.5"/>`; });
      const ready = S.eggs.filter(e => e.prog >= e.dur).length;
      if (ready) out += bubble(X + 34, Y - 64, '🐣', true, String(ready), 'data-a="tab" data-k="chocadeira"');
    } else if (k === 'loja') {
      out += `<rect x="${X - 34}" y="${Y - 22}" width="68" height="26" fill="url(#g-wood)" stroke="#1b1230" stroke-width="2"/><path d="M${X - 34},${Y - 13} h68 M${X - 34},${Y - 4} h68" stroke="#5c3a1c" stroke-width="1" opacity=".6"/>
        <path d="M${X - 42},${Y - 20} L${X},${Y - 62} L${X + 42},${Y - 20}Z" fill="#fff" stroke="#1b1230" stroke-width="2"/>
        <path d="M${X - 28},${Y - 34} L${X},${Y - 62} L${X - 12},${Y - 20}Z M${X + 12},${Y - 20} L${X},${Y - 62} L${X + 28},${Y - 34}Z" fill="url(#g-roof)"/><path d="M${X - 42},${Y - 20} q7,6 14,0 q7,6 14,0 q7,6 14,0 q7,6 14,0 q7,6 14,0 q7,6 14,0" fill="#fff" stroke="#1b1230" stroke-width="1.5"/>
        <text x="${X}" y="${Y - 2}" text-anchor="middle" font-size="16">🪙💎</text>`;
    } else if (k === 'missoes') {
      out += `<path d="M${X - 30},${Y + 8} v-56 M${X + 30},${Y + 8} v-56" stroke="#5c4630" stroke-width="5"/>
        <rect x="${X - 38}" y="${Y - 58}" width="76" height="44" rx="4" fill="url(#g-wood)" stroke="#1b1230" stroke-width="2"/><path d="M${X - 42},${Y - 60} L${X},${Y - 74} L${X + 42},${Y - 60}Z" fill="url(#g-roof)" stroke="#1b1230" stroke-width="2"/>
        <rect x="${X - 30}" y="${Y - 52}" width="18" height="22" fill="#fff8e6" transform="rotate(-6 ${X - 21} ${Y - 41})"/><rect x="${X - 8}" y="${Y - 54}" width="18" height="24" fill="#fff8e6"/><rect x="${X + 14}" y="${Y - 50}" width="16" height="20" fill="#fff8e6" transform="rotate(5 ${X + 22} ${Y - 40})"/>`;
      const claim = S.missions.filter(m => missionProg(m) >= m.target).length;
      if (claim) out += bubble(X + 30, Y - 68, '📜', true, String(claim), 'data-a="tab" data-k="missoes"');
    }
  }
  out += pill(X, Y + (size === 3 ? 52 : 40), sp.n);
  return out + '</g>';
}
function isoTree(x, y, n = 0) {
  const [X, Y] = iso(x, y);
  { const d3 = deco3d(['potmel', 'vela', 'polen'][n % 3], X, Y); if (d3) return d3; }
  const sh = `<ellipse cx="${X}" cy="${Y + 2}" rx="17" ry="6" fill="url(#g-shadow)"/>`, O = 'stroke="#3a1c06" stroke-width="1.5"';
  if (n % 3 === 1) {
    // coluna de cera com mel escorrendo
    return `${sh}<path d="M${X - 11},${Y} L${X - 9},${Y - 44} Q${X},${Y - 52} ${X + 9},${Y - 44} L${X + 11},${Y}Z" fill="url(#g-wax)" ${O}/>
      <ellipse cx="${X}" cy="${Y - 45}" rx="9" ry="4" fill="#ffe3a0" ${O}/>
      <path d="M${X - 6},${Y - 44} q-1,10 1,14 q2,3 2,-4 l0,-10Z M${X + 4},${Y - 44} q0,6 2,8 q2,1 1,-4Z" fill="#ffb52e"/>
      <path d="M${X - 6},${Y - 38} v30" stroke="#fff" stroke-width="2" opacity=".35"/>`;
  }
  if (n % 3 === 2) {
    // monte de bolinhas de pólen
    return `${sh}${[[-8, -6, 7, '#ffd23f'], [6, -7, 8, '#ff9a3c'], [-1, -16, 7, '#fff0a0'], [10, -17, 5, '#ffd23f'], [-11, -16, 4.5, '#ffb52e']].map(([dx, dy, r, c]) => `<circle cx="${X + dx}" cy="${Y + dy}" r="${r}" fill="${c}" ${O}/><circle cx="${X + dx - r * .35}" cy="${Y + dy - r * .35}" r="${r * .3}" fill="#fff" opacity=".6"/>`).join('')}`;
  }
  // pote de mel com concha
  return `${sh}<path d="M${X - 13},${Y - 4} Q${X - 17},${Y - 22} ${X - 9},${Y - 30} L${X + 9},${Y - 30} Q${X + 17},${Y - 22} ${X + 13},${Y - 4} Q${X},${Y + 3} ${X - 13},${Y - 4}Z" fill="url(#g-pot)" ${O}/>
    <rect x="${X - 11}" y="${Y - 35}" width="22" height="6" rx="3" fill="#d98a3a" ${O}/>
    <path d="M${X - 9},${Y - 30} q2,8 0,11 q-2,3 -2,-3 l0,-8Z M${X + 3},${Y - 30} q1,5 3,6 q2,0 0,-6Z" fill="#ffb52e" ${O}/>
    <path d="M${X + 4},${Y - 36} L${X + 14},${Y - 52}" stroke="#8a5a2e" stroke-width="3" stroke-linecap="round"/><ellipse cx="${X + 15}" cy="${Y - 54}" rx="4" ry="5.5" fill="#c98a4a" ${O}/>
    <path d="M${X - 6},${Y - 22} q-2,8 2,14" stroke="#fff" stroke-width="2" fill="none" opacity=".4"/>`;
}
// ---------- Chão da ilha ----------
// A ilha é um hexágono (um favo gigante) que contém a grade em losango dos lotes.
// Ilha 10% maior que na v7.6 (era 28..972 por 48..536)
const HEX = [[-19, 292], [247, 24], [753, 24], [1019, 292], [753, 560], [247, 560]];
const hexGrow = d => HEX.map(([x, y]) => [500 + (x - 500) * (1 + d / 519), 292 + (y - 292) * (1 + d / 268)]);
function inHex(X, Y, m = 0) {
  // dentro do hexágono (com margem m em pixels)
  if (Y < HEX[1][1] + m || Y > HEX[4][1] - m) return false;
  const half = Y < 292 ? (Y - HEX[1][1]) / (292 - HEX[1][1]) : (HEX[4][1] - Y) / (HEX[4][1] - 292);
  const w = 242 + 230 * half - m;
  return Math.abs(X - 500) <= w;
}
const isoInv = (X, Y) => { const a = (X - OX) * 2 / TW, b = (Y - OY) * 2 / TH; return [(a + b) / 2, (b - a) / 2]; };
// Chão de cera, praça, caminhos e o jardim viram uma única imagem (gerada uma vez), para o mapa continuar leve.
let groundURI = null, groundMeadow = null;
// Paletas do chão da vila (contraste com as construções)
const GLOOKS = {
  mel:   { gw: ['#ffe2a0', '#f3bf62', '#d9973a'], spots: ['#b5701c', '#fff6d8'], dash: '#c98a2c', edge: '#b67a2a', cbBg: '#d9a04a', cbCell: '#f2c779', pz: ['#fff4d0', '#f0c878'], pzEdge: '#d99a3e', pzDash: '#e8b45a', rim: '#ffd77a' },
  ambar: { gw: ['#a8692e', '#87501f', '#5e3413'], spots: ['#3a1e08', '#d9a060'], dash: '#c88a3c', edge: '#4a2a10', cbBg: '#e0b56a', cbCell: '#f7dca0', pz: ['#fbe6b4', '#e2b56a'], pzEdge: '#5a3212', pzDash: '#b88040', rim: '#e0a040' },
  creme: { gw: ['#fbf3e2', '#f0e0bf', '#d9bf8e'], spots: ['#a07a40', '#ffffff'], dash: '#c7a46a', edge: '#a87b40', cbBg: '#c99a55', cbCell: '#e9c98c', pz: ['#ffffff', '#efdcb4'], pzEdge: '#b08850', pzDash: '#d2b27a', rim: '#f3d9a0' },
};
const glook = () => GLOOKS[window.__look] || GLOOKS.ambar;
function groundImage() {
  let gkey = S && S.meadow ? S.meadow.join() + (S.season || '') : '';
  const L = glook(); gkey += window.__look || '';
  if (groundURI && groundMeadow === gkey) return groundURI;
  groundMeadow = gkey;
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const P2 = arr => arr.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
  const [PX, PY] = PLAZA;
  let g = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600">';
  g += `<defs><radialGradient id="gw" cx="50%" cy="46%" r="62%"><stop offset="0" stop-color="${L.gw[0]}"/><stop offset=".55" stop-color="${L.gw[1]}"/><stop offset="1" stop-color="${L.gw[2]}"/></radialGradient>`
    + `<radialGradient id="pz" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="${L.pz[0]}"/><stop offset="1" stop-color="${L.pz[1]}"/></radialGradient>`
    + `<pattern id="cb" width="22" height="12" patternUnits="userSpaceOnUse"><rect width="22" height="12" fill="${L.cbBg}"/>` + [[5.5, 3], [16.5, 9], [-5.5, 9], [27.5, 3], [5.5, 15], [16.5, -3]].map(([cx, cy]) => `<polygon points="${[0, 60, 120, 180, 240, 300].map(a => `${(cx + Math.cos(a * Math.PI / 180) * 5.4).toFixed(1)},${(cy + Math.sin(a * Math.PI / 180) * 3.1).toFixed(1)}`).join(' ')}" fill="${L.cbCell}" stroke="${L.edge}" stroke-width=".8"/>`).join('') + '</pattern>'
    + '<linearGradient id="sl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4a24"/><stop offset="1" stop-color="#5a3518"/></linearGradient>'
    + '<radialGradient id="hg" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ffe9a0"/><stop offset=".5" stop-color="#ffb52e"/><stop offset="1" stop-color="#c46a0c"/></radialGradient></defs>';
  // base lisa de cera, com manchas suaves de luz e sombra
  g += `<polygon points="${P2(HEX)}" fill="url(#gw)"/>`;
  for (let i = 0; i < 18; i++) {
    const X = 90 + rnd() * 820, Y = 80 + rnd() * 440, r = 60 + rnd() * 90;
    if (!inHex(X, Y, 40)) { i--; continue; }
    g += `<ellipse cx="${X.toFixed(1)}" cy="${Y.toFixed(1)}" rx="${r.toFixed(1)}" ry="${(r / 2).toFixed(1)}" fill="${rnd() < .5 ? L.spots[0] : L.spots[1]}" opacity="${(0.05 + rnd() * 0.05).toFixed(2)}"/>`;
  }
  // favo gravado bem de leve só na borda
  g += `<polygon points="${P2(hexGrow(-14))}" fill="none" stroke="${L.dash}" stroke-width="2" stroke-dasharray="10 6" opacity=".45"/>`;
  // caminhos curvos que saem da praça
  const ways = WAYS;
  const curve = w => w.length === 4 ? `M${w[0]},${w[1]} L${w[2]},${w[3]}` : `M${PX},${PY} L${w[0]},${w[1]}`;
  ways.forEach((w, i) => { const wd = i < 6 ? 30 : 18; g += `<path d="${curve(w)}" stroke="${L.edge}" stroke-width="${wd + 6}" fill="none" stroke-linecap="round"/><path d="${curve(w)}" stroke="url(#cb)" stroke-width="${wd}" fill="none" stroke-linecap="round"/>`; });
  // praça: anel de cera clara com borda
  g += `<ellipse cx="${PX}" cy="${PY + 3}" rx="96" ry="50" fill="${L.edge}"/><ellipse cx="${PX}" cy="${PY}" rx="94" ry="48" fill="url(#pz)" stroke="${L.pzEdge}" stroke-width="2"/><ellipse cx="${PX}" cy="${PY}" rx="70" ry="35" fill="none" stroke="${L.pzDash}" stroke-width="2" stroke-dasharray="8 6"/>`;
  // jardim: canteiro de terra com borda de cera
  const fx0 = FARM_X[0] - 44, fx1 = FARM_X[FARM_X.length - 1] + 44, fy0 = FARM_ROWS[0] - 26, fy1 = FARM_ROWS[1] + 24;
  g += `<rect x="${fx0}" y="${fy0 + 5}" width="${fx1 - fx0}" height="${fy1 - fy0}" rx="26" fill="#8a4a10"/><rect x="${fx0}" y="${fy0}" width="${fx1 - fx0}" height="${fy1 - fy0}" rx="26" fill="url(#sl)" stroke="#f2b544" stroke-width="6"/>`;
  for (let i = 0; i < 6; i++) g += `<path d="M${fx0 + 24},${fy0 + 12 + i * (fy1 - fy0 - 24) / 5} H${fx1 - 24}" stroke="#4a2a12" stroke-width="1.6" opacity=".5"/>`;
  // poças de mel e flores do prado espalhadas
  [[230, 210, 34], [770, 210, 30], [420, 520, 26], [600, 140, 22], [140, 330, 18], [860, 330, 18]].forEach(([X, Y, r]) => {
    g += `<ellipse cx="${X}" cy="${Y + 2}" rx="${r + 3}" ry="${(r + 3) / 2}" fill="#b5701c" opacity=".5"/><ellipse cx="${X}" cy="${Y}" rx="${r}" ry="${r / 2}" fill="url(#hg)"/><ellipse cx="${X - r * .35}" cy="${Y - r * .15}" rx="${r * .3}" ry="${r * .1}" fill="#fff" opacity=".6"/>`;
  });
  const wild = S && S.meadow ? S.meadow.map(e => EL[e].c) : ['#ffffff', '#ffd23f', '#ff7ab6'];
  for (let i = 0; i < 90; i++) {
    const X = 60 + rnd() * 880, Y = 60 + rnd() * 470;
    if (!inHex(X, Y, 20)) continue;
    if (Math.hypot((X - PX) / 2, Y - PY) < 70 || (X > fx0 - 10 && X < fx1 + 10 && Y > fy0 - 10)) continue;
    const c = wild[Math.floor(rnd() * wild.length)];
    g += `<path d="M${X.toFixed(1)},${Y.toFixed(1)} v-6" stroke="#5a8a2a" stroke-width="1.2"/>` + [0, 72, 144, 216, 288].map(a => `<circle cx="${(X + Math.cos(a * Math.PI / 180) * 2.4).toFixed(1)}" cy="${(Y - 7 + Math.sin(a * Math.PI / 180) * 1.5).toFixed(1)}" r="1.8" fill="${c}"/>`).join('') + `<circle cx="${X.toFixed(1)}" cy="${(Y - 7).toFixed(1)}" r="1.2" fill="#fff3b0"/>`;
  }
  // borda: cera com mel escorrendo pelo penhasco
  const drip = (A, B, n) => { let o = ''; for (let i = 0; i <= n; i++) { const t = i / n, X = A[0] + (B[0] - A[0]) * t, Y = A[1] + (B[1] - A[1]) * t, w = 4 + rnd() * 5, h = rnd() < .3 ? 12 + rnd() * 20 : 3 + rnd() * 5; o += `<path d="M${(X - w).toFixed(1)},${(Y - 1).toFixed(1)} Q${(X - w).toFixed(1)},${(Y + h * .6).toFixed(1)} ${X.toFixed(1)},${(Y + h).toFixed(1)} Q${(X + w).toFixed(1)},${(Y + h * .6).toFixed(1)} ${(X + w).toFixed(1)},${(Y - 1).toFixed(1)}Z" fill="${rnd() < .5 ? '#ffb52e' : '#f29a1c'}"/>`; } return o; };
  g += `<polyline points="${P2([HEX[0], HEX[5], HEX[4], HEX[3]])}" fill="none" stroke="${L.rim}" stroke-width="5" stroke-linejoin="round"/>`;
  g += drip(HEX[0], HEX[5], 34) + drip(HEX[5], HEX[4], 52) + drip(HEX[4], HEX[3], 34);
  // estação: um véu de cor e detalhes próprios (geada, pétalas, poças)
  const sea = S && S.season && SEASONS[S.season];
  if (sea) {
    g += `<polygon points="${P2(HEX)}" fill="${sea.tint[0]}" opacity="${sea.tint[1]}"/>`;
    for (let i = 0; i < 70; i++) {
      const X = 80 + rnd() * 840, Y = 70 + rnd() * 460;
      if (!inHex(X, Y, 30)) continue;
      if (S.season === 'inverno') g += `<ellipse cx="${X.toFixed(1)}" cy="${Y.toFixed(1)}" rx="${(10 + rnd() * 22).toFixed(1)}" ry="${(4 + rnd() * 8).toFixed(1)}" fill="#ffffff" opacity=".6"/>`;
      else if (S.season === 'primavera') g += `<ellipse cx="${X.toFixed(1)}" cy="${Y.toFixed(1)}" rx="3" ry="1.8" fill="${rnd() < .5 ? '#ff6fb8' : '#ffffff'}" opacity=".9" transform="rotate(${(rnd() * 180).toFixed(0)} ${X.toFixed(1)} ${Y.toFixed(1)})"/>`;
      else if (S.season === 'chuvas' && i % 2) g += `<ellipse cx="${X.toFixed(1)}" cy="${Y.toFixed(1)}" rx="${(8 + rnd() * 14).toFixed(1)}" ry="${(3 + rnd() * 5).toFixed(1)}" fill="#8ec4ff" opacity=".35"/>`;
      else if (S.season === 'verao' && i % 3 === 0) g += `<ellipse cx="${X.toFixed(1)}" cy="${Y.toFixed(1)}" rx="${(14 + rnd() * 20).toFixed(1)}" ry="${(6 + rnd() * 8).toFixed(1)}" fill="#fff3b0" opacity=".25"/>`;
    }
  }
  g += '</svg>';
  groundURI = 'data:image/svg+xml,' + encodeURIComponent(g);
  return groundURI;
}
// Plantas desenhadas por tipo de cultura; p = crescimento de 0 a 1
function cropPlant(k, X, Y, p) {
  const s = (0.35 + 0.65 * p).toFixed(2), O = 'stroke="#1b1230" stroke-width=".9"';
  let b;
  if (k === 'trigo') {
    const c = p >= 1 ? '#f2c14e' : p > .6 ? '#c9d86a' : '#7ccf55';
    b = [-3, 0, 3].map(dx => `<path d="M${dx},0 Q${dx},-8 ${dx + dx * .4},-14" stroke="${p >= 1 ? '#c99a3a' : '#4f9a38'}" stroke-width="1.3" fill="none"/><ellipse cx="${dx + dx * .4}" cy="-15" rx="1.8" ry="4" fill="${c}" ${O}/>`).join('');
  } else if (k === 'milho') {
    b = `<path d="M0,0 V-20" stroke="#4f9a38" stroke-width="2.4"/><path d="M0,-6 q-8,-2 -10,-9 M0,-12 q8,-2 10,-9 M0,-16 q-6,-2 -7,-8" stroke="#5fc048" stroke-width="2" fill="none"/>${p >= .6 ? `<ellipse cx="2.5" cy="-11" rx="2.6" ry="5" fill="${p >= 1 ? '#ffd23f' : '#d6e07a'}" ${O}/>` : ''}`;
  } else if (k === 'abobora') {
    b = `<path d="M-9,0 q4,-6 9,-3 q5,-5 9,1" stroke="#3f8a2c" stroke-width="1.6" fill="none"/><path d="M-8,-4 q-4,-6 1,-7 q3,3 -1,7Z M7,-5 q4,-6 -1,-7 q-3,3 1,7Z" fill="#5cb842" ${O}/>${p >= .4 ? `<ellipse cx="0" cy="-4" rx="${(4 + 4 * p).toFixed(1)}" ry="${(3 + 2.6 * p).toFixed(1)}" fill="${p >= 1 ? '#ff8a1f' : '#c8d65a'}" ${O}/><path d="M0,-${(4 + 2.6 * p).toFixed(1)} v-3" stroke="#3f8a2c" stroke-width="1.5"/>` : ''}`;
  } else {
    b = `<path d="M0,0 V-10 M0,-6 l-6,-6 M0,-8 l6,-7" stroke="#3f8a2c" stroke-width="2" fill="none"/><circle cx="-6" cy="-13" r="4" fill="#5cb842" ${O}/><circle cx="6" cy="-15" r="4" fill="#4fae3a" ${O}/><circle cx="0" cy="-13" r="4.4" fill="#66c04a" ${O}/>${p >= .6 ? [[-5, -11], [4, -13], [0, -17]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="${p >= 1 ? '#ff4fa0' : '#e9a8c8'}" ${O}/>`).join('') : ''}`;
  }
  return `<g transform="translate(${X.toFixed(1)} ${Y.toFixed(1)}) scale(${s})">${b}</g>`;
}
// Parede de favos ao fundo (gerada uma vez): alvéolos escuros, alguns brilhando com mel
let wallURI = null;
// névoa dourada com bolhas de luz desfocadas, atrás da ilha 3D
let goldHazeUrl = '';
function goldHaze() {
  if (goldHazeUrl) return goldHazeUrl;
  const c = document.createElement('canvas'); c.width = 1200; c.height = 720; const g = c.getContext('2d');
  let gr = g.createRadialGradient(600, 330, 60, 600, 360, 760);
  gr.addColorStop(0, '#fff3c8'); gr.addColorStop(0.45, '#f4d488'); gr.addColorStop(1, '#c98f32');
  g.fillStyle = gr; g.fillRect(0, 0, 1200, 720);
  let sd = 5; const rnd = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
  g.filter = 'blur(26px)';
  for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(255,${200 + Math.floor(rnd() * 50)},${120 + Math.floor(rnd() * 90)},${0.25 + rnd() * 0.35})`; g.beginPath(); g.arc(rnd() * 1200, rnd() * 720, 40 + rnd() * 140, 0, Math.PI * 2); g.fill(); }
  g.filter = 'blur(6px)';
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,248,215,${0.18 + rnd() * 0.3})`; g.beginPath(); g.arc(rnd() * 1200, rnd() * 720, 6 + rnd() * 22, 0, Math.PI * 2); g.fill(); }
  g.filter = 'none';
  return (goldHazeUrl = c.toDataURL('image/jpeg', 0.85));
}
function hiveWall() {
  if (wallURI) return wallURI;
  let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const r = 30, q = Math.sqrt(3) * r;
  let g = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600"><defs><radialGradient id="bg" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#7a400c"/><stop offset=".6" stop-color="#46220a"/><stop offset="1" stop-color="#1e0e04"/></radialGradient><radialGradient id="lit" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#ffd77a"/><stop offset=".6" stop-color="#e08a1a"/><stop offset="1" stop-color="#8a4a0c"/></radialGradient></defs><rect width="1000" height="600" fill="url(#bg)"/>';
  for (let j = -1; j < 1000 / (1.5 * r) + 1; j++) for (let k = -1; k < 600 / q + 1; k++) {
    const X = j * 1.5 * r, Y = k * q + (j % 2 ? q / 2 : 0);
    const pts = (rr, dx = 0, dy = 0) => [0, 60, 120, 180, 240, 300].map(a => `${(X + dx + Math.cos(a * Math.PI / 180) * rr).toFixed(1)},${(Y + dy + Math.sin(a * Math.PI / 180) * rr).toFixed(1)}`).join(' ');
    const lit = rnd() < 0.14;
    g += `<polygon points="${pts(r - 2)}" fill="${lit ? 'url(#lit)' : '#3a1c06'}" stroke="#6b3a0c" stroke-width="3" opacity="${lit ? (0.45 + rnd() * 0.4).toFixed(2) : 0.85}"/>`;
    if (!lit) g += `<polygon points="${pts(r - 9, 2, 3)}" fill="#24110300" stroke="#1a0c02" stroke-width="2" opacity=".6"/>`;
    else g += `<ellipse cx="${(X - 8).toFixed(1)}" cy="${(Y - 8).toFixed(1)}" rx="7" ry="3" fill="#fff" opacity=".35"/>`;
  }
  // mel escorrendo do teto
  for (let i = 0; i < 22; i++) { const X = rnd() * 1000, h = 20 + rnd() * 70, w = 5 + rnd() * 6; g += `<path d="M${(X - w).toFixed(1)},0 L${(X - w * .6).toFixed(1)},${h.toFixed(1)} Q${X.toFixed(1)},${(h + w * 2.4).toFixed(1)} ${(X + w * .6).toFixed(1)},${h.toFixed(1)} L${(X + w).toFixed(1)},0Z" fill="#f2a12a" opacity=".85"/>`; }
  g += '<rect width="1000" height="600" fill="url(#bg)" opacity=".35"/></svg>';
  wallURI = 'data:image/svg+xml,' + encodeURIComponent(g);
  return wallURI;
}
// ---------- Ilha 3D: uma tela WebGL atrás do SVG (o SVG fica só com cliques, balões, nomes e abelhas) ----------
let ISO3D = false, W3 = null, w3Sig = '', w3Last = 0, w3Box = '';
// Caminhos nas diagonais da ilha: da praça saem duas avenidas em diagonal até o Mercado e a Roleta,
// e de cada uma desce um ramal para o lado (Torre à esquerda, Laboratório à direita). Missões ficam só na barra.
const WAYS = [[500, 150], [740, 180], [260, 180], [800, 150], [200, 150], [500, 440], [620, 300], [380, 300], [635, 368], [365, 368], [748, 310], [252, 310], [818, 390], [182, 390], [260, 180, 150, 255], [740, 180, 870, 265]];
// Poucos enfeites, bem espaçados
const DECO3D = [[300, 108, 'vela'], [700, 108, 'vela'], [468, 222, 'lanterna'], [532, 222, 'lanterna'], [630, 140, 'potmel'], [190, 150, 'skep'], [218, 172, 'flores'], [810, 150, 'potmel'], [782, 172, 'flores'], [110, 330, 'girassol'], [890, 330, 'girassol'], [215, 470, 'flores'], [785, 470, 'flores'], [255, 520, 'potmel'], [745, 520, 'skep']];
function w3Lots() {
  const L = Object.entries(SPOTS).map(([k, sp]) => ({ id: 's:' + k + (k === 'torre' ? towerOf().floors : ''), k: k === 'chocadeira' ? 'roleta' : k, a: k === 'torre' ? towerOf().floors : undefined, x: sp.at[0], z: sp.at[1] }));
  S.habitats.forEach((h, i) => { const th = habTheme(habDragons(i)) + (h.skin ? '/' + h.skin : ''); L.push({ id: `h${i}:${th}`, k: 'habitat', a: th, x: HAB_LOTS[i][0], z: HAB_LOTS[i][1] }); });
  S.farms.forEach((f, i) => L.push({ id: 'f' + i, k: 'farm', x: FARM_LOTS[i][0], z: FARM_LOTS[i][1] }));
  const [px, pz] = gridAt(...PLAZA); L.push({ id: 'fonte', k: 'deco', a: 'fonte', x: px, z: pz });
  DECO3D.forEach(([X, Y, k], i) => { const [x, z] = gridAt(X, Y); L.push({ id: 'd' + i + k, k: 'deco', a: k, x, z }); });
  return L.concat(w3Edge());
}
// Borda da ilha como na imagem de referência: moitas, girassóis e flores, colmeias de palha no paredão e duas pontes
let W3EDGE = null;
function w3Edge() {
  if (W3EDGE) return W3EDGE;
  const out = [], inset = hexGrow(-26), G = p => gridAt(...p);
  const lots = [...Object.entries(SPOTS).map(([k, sp]) => [sp.at, k === 'arena' ? 2.2 : 1.35]), ...HAB_LOTS.map(l => [l, 1.25]), ...FARM_LOTS.map(l => [l, 0.7])];
  const free = q => lots.every(([l, r]) => Math.hypot(q[0] - l[0], q[1] - l[1]) > r) && DECO3D.every(([X, Y]) => { const d = gridAt(X, Y); return Math.hypot(q[0] - d[0], q[1] - d[1]) > 0.7; });
  const kinds = ['moita', 'girassol', 'flores', 'vela', 'moita', 'arbusto', 'flores', 'moita', 'girassol', 'vela'];
  let n = 0;
  for (let e = 0; e < 6; e++) {
    const A = inset[e], B2 = inset[(e + 1) % 6], len = Math.hypot(B2[0] - A[0], (B2[1] - A[1]) * 2), steps = Math.floor(len / 62);
    for (let i = 0; i <= steps; i++) {
      const t = (i + 0.5) / (steps + 1), q = G([A[0] + (B2[0] - A[0]) * t, A[1] + (B2[1] - A[1]) * t]);
      const px = iso(...q);
      if (!free(q) || (px[0] > FARM_X[0] - 70 && px[0] < FARM_X[FARM_X.length - 1] + 70 && px[1] > FARM_ROWS[0] - 40 && px[1] < FARM_ROWS[1] + 40)) continue;
      out.push({ id: 'e' + n, k: 'deco', a: kinds[n % kinds.length], x: q[0], z: q[1], ry: n * 1.3 }); n++;
    }
  }
  const H = HEX, outer = hexGrow(14);
  // colmeias de palha presas no paredão (faces da frente)
  [[0, 5, 0.35], [5, 4, 0.2], [5, 4, 0.8], [4, 3, 0.65]].forEach(([a, b, t], i) => { const q = G([outer[a][0] + (outer[b][0] - outer[a][0]) * t, outer[a][1] + (outer[b][1] - outer[a][1]) * t]); out.push({ id: 'cs' + i, k: 'deco', a: 'skep', x: q[0], z: q[1], y: -0.62 }); });
  // pontes de madeira descendo para o mar de mel
  [].forEach(([a, b, t], i) => { // pontes tiradas: a ilha agora flutua sobre a névoa
    const P0 = G([H[a][0] + (H[b][0] - H[a][0]) * t, H[a][1] + (H[b][1] - H[a][1]) * t]), Pa = G(H[a]), Pb = G(H[b]);
    const ex = Pb[0] - Pa[0], ez = Pb[1] - Pa[1], nx = ez, nz = -ex, ln = Math.hypot(nx, nz), sgn = (nx * (P0[0] - 7) + nz * (P0[1] - 7)) > 0 ? 1 : -1;
    out.push({ id: 'pt' + i, k: 'deco', a: 'ponte', x: P0[0], z: P0[1], ry: Math.atan2(sgn * nx / ln, sgn * nz / ln) });
  });
  out.push({ id: 'morro', k: 'deco', a: 'morro', x: SPOTS.arena.at[0], z: SPOTS.arena.at[1] });
  return (W3EDGE = out);
}
function map3dInit() {
  if (W3 || window.__no3d || sprOff || typeof M3 === 'undefined' || !M3 || !M3.world || !M3.ready || !document.querySelector('#map svg.iso')) return;
  const wrap = $('#mapwrap'), cv = document.createElement('canvas');
  cv.id = 'map3d'; wrap.prepend(cv);
  const fx0 = FARM_X[0] - 44, fx1 = FARM_X[FARM_X.length - 1] + 44, fy0 = FARM_ROWS[0] - 56, fy1 = FARM_ROWS[1] + 24;
  let w = null;
  try { w = M3.world(cv, { vb: MAP_VB, hex: HEX, grow: hexGrow, plaza: PLAZA, ways: WAYS, farmRect: [[fx0, fy0], [fx1, fy0], [fx1, fy1], [fx0, fy1]], look: glook() }); } catch (e) { console.warn('[ilha 3D]', e); w = null; }
  if (!w) { cv.remove(); window.__no3d = true; return; }
  W3 = w; ISO3D = true; w3Sig = ''; w3Box = '';
  wrap.style.background = `#e9c477 url(${goldHaze()}) center / cover no-repeat`;
  lastMap = ''; render();
  requestAnimationFrame(map3dLoop);
}
function map3dPlace() {
  const cv = $('#map3d'), svg = document.querySelector('#map svg.iso'), wrap = $('#mapwrap');
  if (!cv || !svg) return;
  const wr = wrap.getBoundingClientRect(), r = svg.getBoundingClientRect();
  const box = [r.left - wr.left + wrap.scrollLeft, r.top - wr.top + wrap.scrollTop, r.width, r.height].map(v => Math.round(v));
  const key = box.join();
  if (key === w3Box || !box[2]) return;
  w3Box = key;
  Object.assign(cv.style, { left: box[0] + 'px', top: box[1] + 'px', width: box[2] + 'px', height: box[3] + 'px' });
  const sc = W3.setSize(box[2], box[3]);
  cv.style.backgroundSize = `${Math.round(1000 * sc)}px ${Math.round(600 * sc)}px`;
  cv.style.backgroundPosition = 'center'; cv.style.backgroundRepeat = 'no-repeat';
}
function map3dLoop(t) {
  requestAnimationFrame(map3dLoop);
  if (!W3 || !S || document.hidden) return;
  if (t - w3Last < 1000 / (S.tab === 'ilha' ? 30 : 5)) return;
  w3Last = t;
  map3dPlace();
  const lots = w3Lots(), sig = lots.map(o => o.id).join('|');
  if (sig !== w3Sig) { W3.setLots(lots); w3Sig = sig; }
  W3.frame(t, { spin: !!(S.wheel && S.wheel.until > performance.now()) });
}
function viewMap() {
  topLayer = [];
  const objs = [];
  S.habitats.forEach((h, i) => objs.push({ d: HAB_LOTS[i][0] + HAB_LOTS[i][1], html: isoHabitat(i) }));
  if (S.habitats.length < habMax()) { const [x, y] = HAB_LOTS[S.habitats.length]; objs.push({ d: x + y, html: isoGhost(x, y, 1.9, 'buyHab', `+ Colmeia 🪙${fmt(habitatCost())}`) }); }
  S.farms.forEach((f, i) => objs.push({ d: FARM_LOTS[i][0] + FARM_LOTS[i][1], html: isoFarm(i) }));
  if (S.farms.length < farmMax()) { const [x, y] = FARM_LOTS[S.farms.length]; objs.push({ d: x + y, html: isoGhost(x, y, 0.92, 'buyFarm', `+ 🪙${fmt(farmCost())}`) }); }
  Object.keys(SPOTS).forEach(k => objs.push({ d: SPOTS[k].at[0] + SPOTS[k].at[1], html: isoSpecial(k) }));
  if (!ISO3D) {
    TREES.forEach(([x, y, n]) => objs.push({ d: x + y, html: isoTree(x, y, n) }));
    DECOR.forEach(([x, y, k]) => objs.push({ d: x + y - 0.5, html: isoDecor(x, y, k) }));
    fillDecor().forEach(([x, y, k]) => objs.push({ d: x + y - 0.6, html: isoDecor(x, y, k) }));
  }
  objs.sort((a, b) => a.d - b.d);
  const [t, r, b, l] = diamond(NG / 2, NG / 2, NG, NG);
  const [st, sr, sb, sl] = diamond(NG / 2, NG / 2, NG + 1.2, NG + 1.2);
  let grid = '';
  for (let k = 1; k < NG; k++) grid += `<path d="M${pts([iso(k, 0)])} L${pts([iso(k, NG)])} M${pts([iso(0, k)])} L${pts([iso(NG, k)])}"/>`;
  const path = (x1, y1, x2, y2) => `<polygon points="${pts([iso(x1, y1), iso(x2, y1), iso(x2, y2), iso(x1, y2)])}" fill="url(#p-cobble)" stroke="#a88f5c" stroke-width="1" opacity=".9"/>`;
  const strata = (a, c, side) => [12, 22].map(dy => `<path d="M${pts([[a[0], a[1] + dy]])} L${pts([[c[0], c[1] + dy]])}" stroke="${side ? '#5a300c' : '#6e3d12'}" stroke-width="1.5" opacity=".5"/>`).join('');
  const H = HEX, foam = hexGrow(26), wax = hexGrow(12);
  const face = (a, c, fill) => `<polygon points="${pts([a, c, [c[0], c[1] + 34], [a[0], a[1] + 34]])}" fill="${fill}"/>`;
  const lipBand = (a, c, fill) => `<polygon points="${pts([a, c, [c[0], c[1] + 9], [a[0], a[1] + 9]])}" fill="${fill}"/>`;
  const fliers = flyingBees();
  return `<svg class="iso" viewBox="${MAP_VB.join(' ')}" role="img" aria-label="Mapa da ilha">
    ${ISO3D ? '' : `
    <image href="${hiveWall()}" x="0" y="0" width="1000" height="600" pointer-events="none"/>
    <polygon points="${pts(hexGrow(60))}" fill="url(#g-sea)" transform="translate(0 22)"/>
    <polygon points="${pts(hexGrow(60))}" fill="url(#p-honey)" opacity=".7" transform="translate(0 22)"/>
    <g stroke="#ffe3a0" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".5">
      ${[[110, 300], [890, 300], [250, 560], [750, 560], [480, 584]].map(([x, y], n) => `<path class="wave" style="animation-delay:${-n * 0.7}s" d="M${x},${y} q10,-6 20,0 t20,0"/>`).join('')}
    </g>
    <polygon points="${pts(foam)}" fill="#ffe2a0" opacity=".16" transform="translate(0 16)"/>
    <polygon class="foam" points="${pts(foam)}" fill="none" stroke="#ffe9b8" stroke-width="3" stroke-dasharray="14 10" opacity=".55" transform="translate(0 16)"/>
    <polygon points="${pts(wax)}" fill="url(#g-sand)" stroke="#b07a2a" stroke-width="1.5" transform="translate(0 8)"/>
    ${face(H[0], H[5], 'url(#g-cliffL)')}${face(H[5], H[4], 'url(#g-cliffM)')}${face(H[4], H[3], 'url(#g-cliffR)')}
    <g opacity=".55">${face(H[0], H[5], 'url(#p-comb)')}${face(H[5], H[4], 'url(#p-comb)')}${face(H[4], H[3], 'url(#p-comb)')}</g>
    ${strata(H[0], H[5], 0)}${strata(H[5], H[4], 1)}${strata(H[4], H[3], 1)}
    ${lipBand(H[0], H[5], '#f2b544')}${lipBand(H[5], H[4], '#e0a23a')}${lipBand(H[4], H[3], '#c98a2c')}
    <image href="${groundImage()}" x="0" y="0" width="1000" height="600" pointer-events="none"/>`}
    ${objs.map(o => o.html).join('')}
    ${topLayer.join('')}
    <g class="fliers" pointer-events="none">${fliers.map(f => `<g data-k="${f.key}"><animateMotion data-fly="${f.key}" begin="indefinite" dur="${FLY_DUR}s" fill="freeze" path="${flyPathFrom(f.x, f.y, f.k)}"/>${placeDragon(f.d, 0, 0, 70)}</g>`).join('')}</g>
    <g fill="#ffe9a0" opacity=".7" pointer-events="none">
      <g class="cloud">${[[0, 60], [40, 90], [-30, 130], [70, 40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6"/>`).join('')}</g>
      <g class="cloud c2">${[[0, 300], [-50, 260], [30, 340], [-20, 220]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2"/>`).join('')}</g>
      <g class="cloud c3">${[[0, 500], [40, 470], [-40, 540]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3"/>`).join('')}</g>
    </g>
  </svg>`;
}
function viewHud() {
  const crops0 = Object.entries(CROPS).filter(([k]) => unlockedCrop(k)).map(([k, c]) => `<button class="crop" aria-pressed="${S.selCrop === k}" data-a="selCrop" data-k="${k}" title="${c.n}: ${c.dur}s, +${cropFood(k)} de néctar, ${c.cost} de mel${k === S.nativeFlower ? ' (flor nativa)' : ''}">${c.i} 🪙${c.cost}</button>`).join('');
  const acts = (S.level >= 3 ? '<button class="btn small primary" data-a="harvestAll">🧺 Colher e replantar</button>' : '')
    + (S.level >= 5 ? '<button class="btn small primary" data-a="collectAll">🪙 Coletar tudo</button>' : '');
  const ready = S.farms.filter(f => f.crop && f.prog >= CROPS[f.crop].dur).length;
  const se = SEASONS[S.season], rv = RIVALS[S.rival], nextRaid = S.raidIdx < S.raids.length ? S.raids[S.raidIdx] - S.t : null;
  return crisisBox() + `<div class="box run-box"><span class="hud-lbl" title="${se.d}">${se.i} ${se.n}</span><span class="hud-lbl" title="${rv.d}">${rv.i} ${S.raid ? '<b>Invasão agora!</b>' : nextRaid !== null ? `Invasão em ${fmtTime(Math.max(0, nextRaid))}` : 'Sem mais invasões'}</span></div><div class="box"><button class="btn small go" data-a="tab" data-k="jardim">🌱 Jardim${ready ? ` <span class="badge">${ready}</span>` : ''}</button>${S.gardener ? '<span class="hint hud-lbl">👩‍🌾 Jardineira trabalhando</span>' : ''}</div>${acts ? `<div class="box">${acts}</div>` : ''}`;
}
function dragonCard(d) {
  const maxed = d.lvl >= MAX_DLVL;
  const fc = feedCost(d.lvl);
  const vr = vetRank(d);
  return `<div class="dcard r-${d.rar}${d.asc ? ' asc' : ''}"><button class="dic-btn" data-a="ficha" data-id="${d.id}" title="Ver a ficha de ${d.name}" aria-label="Ver a ficha de ${d.name}">${dIcon(d.els, d.rar, 'm', '', d.id, d.skin)}<span class="ficha-tag">Ficha</span></button>
    <div class="info">${d.asc || vr ? `<span class="meta titles">${d.asc ? `<span class="asc-tag">${ASC[d.asc].i} ${ASC[d.asc].n}</span>` : ''}${vr ? `<span class="vet-tag">🎖️ ${VET[vr][1]}</span>` : ''}</span>` : ''}
      <span class="name">${d.name} <span class="muted">Nv ${d.lvl}</span> <button class="ren" data-a="rename" data-id="${d.id}" title="Renomear" aria-label="Renomear ${d.name}">🏷️</button></span>
      <span class="meta"><span class="rar-${d.rar}">${RARITY[d.rar].f}</span> · ${elTags(d.els)}</span>
      <span class="meta num">🪙 ${gpsOf(d).toFixed(1).replace('.', ',')}/s${isNative(d) ? ' 🌻' : ''} · ❤️ ${myHp(d)} · 🗡️ ${myAtk(d)}</span>${d.move && ATTACKS[d.move] ? `<span class="meta">${ATTACKS[d.move].i} ${ATTACKS[d.move].n}</span>` : ''}${d.mut ? `<span class="meta mut-tag" title="${MUTS[d.mut].d}">🧬 ${MUTS[d.mut].n} · ${MUTS[d.mut].d}</span>` : ''}${seasonOf(d) > 1 ? `<span class="meta">${SEASONS[S.season].i} Forte no ${SEASONS[S.season].n}: +20% vida e ataque</span>` : ''}
      <div class="row">
        <button class="btn small" data-a="feed" data-id="${d.id}" ${maxed ? 'disabled' : ''}>${maxed ? 'Nível máximo' : `Alimentar ${costTag(fc, 'f')}`}</button>
        <button class="btn small" data-a="sell" data-id="${d.id}">${d._confirm ? 'Confirmar venda?' : `Vender ${costTag(sellValue(d))}`}</button>
      </div>
    </div></div>`;
}
// Ficha individual: personalidade, história de batalha e números de cada abelha
const TRAITS = [['Corajosa', 'Sempre a primeira a entrar na briga.'], ['Preguiçosa', 'Cochila entre um voo e outro, mas produz direitinho.'], ['Curiosa', 'Vive fuçando as flores novas do Jardim.'], ['Brincalhona', 'Faz piruetas no ar quando ganha uma luta.'], ['Tímida', 'Esconde o rosto atrás das asas quando alguém elogia.'], ['Gulosa', 'Nunca recusa um pote de néctar.'], ['Vaidosa', 'Acha que é a abelha mais bonita da colmeia.'], ['Leal', 'Nunca abandona as companheiras de time.'], ['Sonhadora', 'Passa horas olhando o mar de mel.'], ['Mandona', 'Vive dando ordens para as operárias.'], ['Calma', 'Não perde a paciência nem quando o chefe chega.'], ['Faladeira', 'Zumbe sem parar, até durante as batalhas.']];
const DREAMS = ['virar Heroína da Tropa', 'provar o mel da Primeira Flor', 'derrotar uma Vespa sozinha', 'ter a colmeia mais bonita da ilha', 'conhecer o Ninho de Papel', 'dormir num girassol gigante', 'ensinar as filhotes a voar', 'ganhar uma coroa de cera'];
const hashId = (id, k) => Math.abs(Math.sin(id * 12.9898 + k * 78.233) * 43758.5453) % 1;
function renderFicha() {
  const d = S.dragons.find(x => x.id === S.ficha);
  if (!d) { S.ficha = null; overlay(''); return; }
  const st = beeSt(d), vr = vetRank(d), nx = VET[vr + 1];
  const tr = TRAITS[Math.floor(hashId(d.id, 1) * TRAITS.length)], cropK = Object.keys(CROPS), fav = CROPS[cropK[Math.floor(hashId(d.id, 2) * cropK.length)]];
  const dream = DREAMS[Math.floor(hashId(d.id, 3) * DREAMS.length)];
  const strong = EL_KEYS.filter(k => d.els.some(e => eff(e, [k]) > 1)), weak = EL_KEYS.filter(k => eff(k, d.els) > 1);
  const crit = Math.round((MOD('crit') + mutOf(d, 'crit') + vetOf(d, 'crit')) * 100);
  const inTeam = S.team.includes(d.id);
  const row = (k, v) => `<div class="fx-row"><span>${k}</span><b class="num">${v}</b></div>`;
  overlay(`<div class="card ficha r-${d.rar}">
    <button class="x" data-a="fichaClose" aria-label="Fechar">✕</button>
    <div class="fx-head">${dIcon(d.els, d.rar, 'xl', 'pop', d.id, d.skin)}<div>
      <span class="cat"><span class="rar-${d.rar}">${RARITY[d.rar].f}</span> · ${elTags(d.els)}</span>
      <h1>${d.name}</h1>
      <p class="fx-tags"><span class="pill2">Nível ${d.lvl}</span>${d.asc ? `<span class="pill2 asc-tag">${ASC[d.asc].i} ${ASC[d.asc].n}</span>` : ''}${vr ? `<span class="pill2 vet-tag">🎖️ ${VET[vr][1]}</span>` : ''}${inTeam ? '<span class="pill2">⚔️ No time</span>' : ''}</p>
      <p class="fx-bio">${tr[0]}. ${tr[1]} Flor favorita: ${fav.i} ${fav.n}. Sonha em ${dream}.</p>
    </div></div>
    <div class="fx-grid">
      <section><h3>Números</h3>${row('🪙 Mel por segundo', gpsOf(d).toFixed(1).replace('.', ','))}${row('❤️ Vida', myHp(d))}${row('🗡️ Ataque', myAtk(d))}${row('🎯 Crítico', crit + '%')}${row('🕐 Chegou na partida aos', fmtTime(d.born || 0))}</section>
      <section><h3>Batalhas</h3>${row('Lutas', st.b)}${row('Vitórias', st.w)}${row('Nocautes', st.ko)}${row('Dano causado', fmt(st.dmg))}${row('Maior golpe', fmt(st.hit))}</section>
      <section><h3>Poderes</h3>
        <p class="hint">${d.move && ATTACKS[d.move] ? `${ATTACKS[d.move].i} <b>${ATTACKS[d.move].n}</b>` : 'Sem ataque especial comprado.'}</p>
        <p class="hint">${d.mut ? `🧬 <b>${MUTS[d.mut].n}</b>: ${MUTS[d.mut].d}` : '🧬 Sem mutação. O Laboratório dá uma.'}</p>
        <p class="hint">${d.asc ? `${ASC[d.asc].i} <b>${ASC[d.asc].n}</b>: ${ASC[d.asc].d}` : (d.rar === 'E' || d.rar === 'L') ? '🗼 Pode ascender na Torre da Ascensão.' : '🗼 Só Épicas e Lendárias ascendem.'}</p>
        <p class="hint">${d.perk ? `🎖️ Traço <b>${VPERK[d.perk].n}</b>: ${VPERK[d.perk].d}` : '🎖️ Ganha um traço de combate ao virar Veterana.'}</p>
      </section>
      <section><h3>Tipos</h3>
        <p class="hint"><b>Forte contra:</b> ${strong.length ? strong.map(k => `${EL[k].i} ${EL[k].n}`).join(', ') : 'nenhum tipo'}</p>
        <p class="hint"><b>Fraca contra:</b> ${weak.length ? weak.map(k => `${EL[k].i} ${EL[k].n}`).join(', ') : 'nenhum tipo'}</p>
        <h3>${nx ? `Rumo a ${nx[1]}` : 'Heroína da Tropa'}</h3>
        ${nx ? `<div class="bar"><i style="width:${pct(st.w - VET[vr][0], nx[0] - VET[vr][0])}%"></i></div><p class="hint">${st.w}/${nx[0]} vitórias. Cada título dá vida e ataque extras.</p>` : '<p class="hint">Título máximo: +15% de vida e ataque.</p>'}
      </section>
    </div>
    <div class="row" style="justify-content:center"><button class="btn ${inTeam ? '' : 'go'}" data-a="fichaTeam">${inTeam ? 'Tirar do time' : 'Pôr no time'}</button><button class="btn primary" data-a="fichaClose">Fechar</button></div>
  </div>`);
}
function viewDragons() {
  const list = [...S.dragons].sort((a, b) => RARITY[b.rar].rv - RARITY[a.rar].rv || b.lvl - a.lvl).map(dragonCard).join('');
  const found = Object.keys(S.dex).length;
  const dex = ALL_SPECIES.map(sp => {
    const k = !!S.dex[sp.key];
    return `<div class="cell">${dIcon(sp.els, sp.rar, 's', k ? '' : 'unknown')}<span class="${k ? 'rar-' + sp.rar : 'muted'}">${k ? sp.name : '???'}</span></div>`;
  }).join('');
  return `<div class="grid">
    <section class="panel" style="grid-column:1/-1">
      <div class="panel-head"><h2>Suas abelhas</h2><span class="hint">Alimentar com néctar sobe o nível: mais mel, vida e ataque. Toque na abelha para ver a ficha dela.</span></div>
      <div class="dlist">${list}</div>
    </section>
    <section class="panel" style="grid-column:1/-1">
      <div class="panel-head"><h2>Abelhário</h2><span class="muted num">${found}/${ALL_SPECIES.length} espécies</span></div>
      <div class="bar"><i style="width:${pct(found, ALL_SPECIES.length)}%"></i></div>
      <div class="dex">${dex}${S.dex[BETMEL.key] ? `<div class="cell">${dIcon(BETMEL.els, 'L', 's')}<span class="rar-L">BetMel</span></div>` : ''}</div>
    </section>
  </div>`;
}
function viewLabLocked() {
  const lv = S.level >= LAB_OPEN.lvl, c = LAB_OPEN.cost, ok = lv && S.gold >= c;
  return `<div class="grid"><section class="panel"><h2>Laboratório fechado</h2>
    <div class="gard"><span class="bigic">🔒</span><div><b>Abre no nível ${LAB_OPEN.lvl}, pagando ${fmt(c)} de mel</b><span class="hint">Aqui você gasta cristais para dar mutações às abelhas. Os cristais que chegarem até lá ficam guardados (você tem ${S.crystals || 0}).</span></div>
    ${lv ? `<button class="btn ${ok ? 'go' : ''}" data-a="labOpen" ${ok ? '' : 'disabled'}>Abrir ${costTag(c)}</button>` : `<span class="hint">Você está no nível ${S.level}.</span>`}</div></section></div>`;
}
function viewLab() {
  if (labLocked()) return viewLabLocked();
  const d = S.dragons.find(x => x.id === S.labSel);
  const next = Math.max(0, Math.ceil(S.nextCrystal - S.t)), cr = S.crystals || 0;
  const chips = S.dragons.map(x => `<button class="chip" aria-pressed="${x.id === S.labSel}" data-a="labSel" data-id="${x.id}">${dIcon(x.els, x.rar, 's', '', x.id, x.skin)}${x.name} · Nv ${x.lvl}${x.mut ? ' · 🧬' : ''}</button>`).join('');
  const common = Object.keys(MUTS).filter(k => !MUTS[k].lab);
  const opt = (k, extra) => { const L = LAB[k], c = labCost(k), ok = d && cr >= c;
    return `<div class="labopt"><span class="lab-ic">${L.i}</span><div><b>${L.n}</b><span class="hint">${L.d}</span></div>${extra || `<button class="btn ${ok ? 'go' : ''}" data-a="labDo" data-k="${k}" ${ok ? '' : 'disabled'}>💠 ${c}</button>`}</div>`; };
  const pickBtns = (mode, ks) => `<div class="labpick">${ks.map(k => `<button class="btn small ${d && cr >= labCost(mode) ? 'go' : ''}" data-a="labDo" data-k="${mode}" data-m="${k}" title="${MUTS[k].d}" ${d && cr >= labCost(mode) ? '' : 'disabled'}>${MUTS[k].n}</button>`).join('')}<span class="muted">💠 ${labCost(mode)}</span></div>`;
  return `<div class="grid">
    <section class="panel">
      <h2>Laboratório</h2>
      <div class="labhead"><div class="labcrys"><span class="big">💠</span><b class="num">${cr}</b><span class="muted">cristais</span></div><p class="hint" style="margin:0">Próximo cristal em ${fmtTime(next)}. Chefes, vitórias de ato e algumas elites também dão cristais. Uma mutação nova troca a antiga.</p></div>
      <div class="labbee">${d ? `${dIcon(d.els, d.rar, 'l', '', d.id, d.skin)}<div><b>${d.name}</b> <span class="rar-${d.rar}">${RARITY[d.rar].n}</span><span class="hint">Nv ${d.lvl} · ${d.mut ? `🧬 ${MUTS[d.mut].n}: ${MUTS[d.mut].d}` : 'sem mutação'}</span></div>` : '<p class="hint" style="margin:0">Escolha abaixo a abelha que vai receber a mutação.</p>'}</div>
      <div class="chips">${chips}</div>
    </section>
    <section class="panel">
      <h2>Mutações</h2>
      ${opt('sorte')}
      ${opt('escolha', pickBtns('escolha', common))}
      ${opt('rara', pickBtns('rara', ['dourada', 'furia']))}
    </section>
  </div>`;
}
function viewTower() {
  const T = towerOf(), next = TOWER_PARTS[T.floors], free = T.floors - T.used;
  const parts = TOWER_PARTS.map((P, i) => {
    const has = T.items.includes(P.k), built = T.floors > i;
    return `<div class="tw-part ${built ? 'built' : has ? 'have' : ''}"><span class="tw-ic">${P.i}</span><div><b>${i + 1}º andar · ${P.n}</b><span class="hint">${built ? 'Andar erguido.' : has ? `Peça na mão! Falta erguer: ${costTag(P.cost)}` : `Como ganhar: ${P.from}.`}</span></div>${!built && has && i === T.floors ? `<button class="btn go" data-a="buildFloor">Erguer ${costTag(P.cost)}</button>` : ''}</div>`;
  }).join('');
  const d = S.dragons.find(x => x.id === S.towerSel);
  const elig = S.dragons.filter(ASC_ELIG);
  const asc = S.dragons.filter(x => x.asc);
  const chips = elig.map(x => `<button class="chip" aria-pressed="${x.id === S.towerSel}" data-a="towerSel" data-id="${x.id}">${dIcon(x.els, x.rar, 's', '', x.id, x.skin)}${x.name} · Nv ${x.lvl}</button>`).join('');
  const paths = Object.entries(ASC).map(([k, A]) => `<div class="labopt"><span class="lab-ic">${A.i}</span><div><b>${A.n}</b><span class="hint">${A.d}</span></div><button class="btn ${d && free > 0 ? 'go' : ''}" data-a="ascend" data-k="${k}" ${d && free > 0 ? '' : 'disabled'}>Ascender como ${A.n}</button></div>`).join('');
  return `<div class="grid">
    <section class="panel">
      <h2>Torre da Ascensão</h2>
      <p class="hint" style="margin-top:0">Cada peça vem de um grande desafio. Com a peça e mel, você ergue um andar, e cada andar libera <b>uma ascensão</b>.${T.floors >= 3 ? ' Torre completa: as ascendidas ganham +15% de vida e ataque.' : ' Com os 3 andares, as ascendidas ainda ganham +15% de vida e ataque.'}</p>
      <div class="tw-parts">${parts}</div>
      ${asc.length ? `<h3 style="margin:12px 0 6px">Ascendidas</h3><div class="chips">${asc.map(x => `<span class="chip asc">${dIcon(x.els, x.rar, 's', '', x.id, x.skin)}${x.name} · ${ASC[x.asc].i} ${ASC[x.asc].n}</span>`).join('')}</div>` : ''}
    </section>
    <section class="panel">
      <h2>Ascender <span class="muted">· ${free > 0 ? `${free} disponível${free > 1 ? 'is' : ''}` : T.floors ? 'nenhuma livre' : 'erga o 1º andar'}</span></h2>
      ${free > 0 ? (elig.length ? `<p class="hint" style="margin-top:0">Escolha uma abelha Épica ou Lendária e um caminho. A escolha é para sempre.</p><div class="chips">${chips}</div>` : '<p class="hint">Você não tem abelha Épica ou Lendária sem ascensão. Gire a Roleta para conseguir uma.</p>') : `<p class="hint" style="margin-top:0">${next ? `Próxima peça: ${next.i} ${next.n}. ${next.from}.` : 'Todas as ascensões foram usadas.'}</p>`}
      ${paths}
    </section>
  </div>`;
}
function viewBreed() {
  const a = S.dragons.find(d => d.id === S.breedA), b = S.dragons.find(d => d.id === S.breedB);
  const slot = (d, w) => d
    ? `<button class="parent set" data-a="clearParent" data-k="${w}">${dIcon(d.els, d.rar, 'l', '', d.id, d.skin)}<span>${d.name}</span><span class="muted">Nv ${d.lvl} · toque para trocar</span></button>`
    : `<div class="parent">Escolha o ${w === 'A' ? 'primeiro' : 'segundo'} dragão abaixo</div>`;
  let out = '';
  if (a && b) {
    const os = breedOutcomes(a, b);
    out = `<div class="outcomes">${os.map(o => `<div class="outcome">${dIcon(o.sp.els, o.sp.rar, 's', S.dex[o.sp.key] ? '' : 'unknown')}<span>${S.dex[o.sp.key] ? o.sp.name : '???'} <span class="rar-${o.sp.rar}">${RARITY[o.sp.rar].n}</span></span><span class="pct num">${Math.round(o.p * 100)}%</span></div>`).join('')}</div>
      <div class="row"><button class="btn go" data-a="breed">💞 Cruzar ${costTag(breedCost(a, b))}</button><span class="hint">Abre o Giro do Amor com essas chances. Os pais descansam ${BREED_REST}s.${Math.max(a.rest || 0, b.rest || 0) > S.t ? ` Faltam ${Math.ceil(Math.max(a.rest || 0, b.rest || 0) - S.t)}s.` : ''}</span></div>`;
  }
  const chips = S.dragons.map(d => {
    const sel = d.id === S.breedA || d.id === S.breedB;
    return `<button class="chip" aria-pressed="${sel}" data-a="pickParent" data-id="${d.id}" ${d.lvl < 3 ? 'disabled title="Precisa de nível 3"' : ''}>${dIcon(d.els, d.rar, 's', '', d.id, d.skin)}${d.name} · Nv ${d.lvl}</button>`;
  }).join('');
  const legends = LEGENDS.map(L => `<div class="outcome">${dIcon(L.els, 'L', 's', S.dex['L:' + L.k] ? '' : 'unknown')}<span>${S.dex['L:' + L.k] ? L.n : '???'}</span><span class="pct muted">${L.els.map(e => EL[e].i).join(' + ')} · ${Math.round(L.ch * 100)}%</span></div>`).join('');
  return `<div class="grid">
    <section class="panel">
      <h2>Cruzamento</h2>
      <div class="breedbox">${slot(a, 'A')}<div class="heart">💞</div>${slot(b, 'B')}</div>
      ${out || '<p class="hint" style="margin:0">O filhote herda um elemento de cada pai. Pais com elementos diferentes geram híbridos raros ou épicos.</p>'}
      <div class="chips">${chips}</div>
    </section>
    <section class="panel">
      <h2>Receitas lendárias</h2>
      <p class="hint" style="margin:0">Se os dois pais juntos tiverem os elementos da receita, existe a chance de nascer um Lendário.</p>
      <div class="outcomes">${legends}</div>
    </section>
  </div>`;
}
function fighterView(f, side, bench, active, B) {
  const disp = f.disp || f.els;
  return `<div class="side" data-side="${side}">
    <div class="plate">
      <span class="who">${side === 'me' ? 'SEU TIME' : f.boss ? 'CHEFE' : 'OPONENTE'}</span>
      <span class="fname">${f.name} <span class="muted">${f.boss ? '' : 'Nv ' + f.lvl}</span></span>
      <span class="muted" style="font-size:.8rem">${f.boss ? 'Ataca com elementos aleatórios' : elTags(f.els)}</span>
      <div class="hpw"><div class="bar hp ${f.hp / f.hpMax < 0.3 ? 'low' : ''}"><i style="width:${pct(f.hp, f.hpMax)}%"></i></div><span class="hpn num">❤️ ${f.hp} / ${f.hpMax}</span></div>
    </div>
    <div class="stand${f.hp <= 0 ? ' down' : ''}${f.boss ? ' bossy' : ''}">${dIcon(disp, f.boss ? 'B' : f.rar, 'xl', side === 'foe' ? 'flip' : '', f.did || 3, f.skin)}</div>
    <div class="bench">${bench.map((x, i) => i === active ? '' : `<span class="${x.hp <= 0 ? 'ko' : ''}">${dIcon(x.disp || x.els, x.rar, 's')}</span>`).join('')}</div>
  </div>`;
}
function viewBattle() {
  const B = S.battle;
  const p = B.team[B.pi], e = B.foes[B.ei];
  let controls;
  if (B.over) {
    const r = S.lastResult;
    controls = `<div class="result ${r.win ? 'win' : 'lose'}"><h2>${r.win ? '🏆 Vitória!' : 'Derrota'}</h2><p style="margin:0">${r.text}</p>
      <div class="row" style="justify-content:center">${r.gold ? costTag(r.gold) : ''} ${r.gems ? costTag(r.gems, 'm') : ''} <span class="cost">+${r.xp} XP</span></div>
      ${B.kind === 'final' ? `<p style="margin:0" class="muted">${S.finalResult ? `Dano causado: ${Math.round(S.finalResult.dmgPct * 100)}%` : isActs() ? `Atos vencidos: ${S.act} de ${ACTS.length}` : `Ataques repelidos: ${S.stats.finalWins}`}</p>${(S.mode === 'infinito' || isActs()) && S.lastResult.win && !S.finalResult ? '<button class="btn primary" data-a="closeBattle">Voltar para a ilha</button>' : '<button class="btn primary" data-a="end">Ver placar final</button>'}` : `<button class="btn primary" data-a="closeBattle">Continuar</button>`}</div>`;
  } else {
    const bEl = moveEl(p, 'b'), sEl = moveEl(p, 'sp');
    const effTxt = el => { const m = eff(el, e.els); return m > 1 ? ' · forte' : m < 1 ? ' · fraco' : ''; };
    controls = `<div class="row fight-ctl" style="justify-content:center">
      <button class="btn primary" data-a="move" data-k="b">Ataque ${EL[bEl].i}${effTxt(bEl)}</button>
      <button class="btn primary" data-a="move" data-k="sp" ${p.cd > 0 ? 'disabled' : ''}>Especial ${EL[sEl].i} x${movePower(p, 'sp')}${p.cd > 0 ? ` (${p.cd})` : effTxt(sEl)}</button>
      ${p.move && ATTACKS[p.move] ? (() => { const A = ATTACKS[p.move], xe = moveEl(p, 'x'); return `<button class="btn go" data-a="move" data-k="x" ${p.xcd > 0 ? 'disabled' : ''}>${A.i} ${A.n} x${String(A.pow).replace('.', ',')}${p.xcd > 0 ? ` (${p.xcd})` : xe ? effTxt(xe) : ''}</button>`; })() : ''}
      <button class="btn" data-a="auto" aria-pressed="${S.autoBattle}">${S.autoBattle ? '⏸ Auto ligado' : '▶ Batalha automática'}</button>
      <button class="btn danger" data-a="surrender">🏳️ Desistir</button></div>`;
  }
  return `<section class="panel fight">
    <div class="fight-head"><h2>${B.kind === 'final' ? `Ataque de ${bossName()}` : B.kind === 'boss' ? `${bossName()} no ninho` : B.kind === 'wild' ? 'Abelha selvagem' : B.kind === 'raid' ? `${RIVALS[S.rival].i} Invasão das ${RIVALS[S.rival].n}` : `${B.node && B.node !== 'luta' ? `${NODES[B.node].i} ${NODES[B.node].n} · ` : ''}Liga ${LEAGUES[S.league - 1] || 'Campeões'} · luta ${S.leagueFight + 1} de 3`}</h2><span class="turn num">Turno ${B.turn}</span></div>
    <div class="bstage${B.kind === 'final' || B.kind === 'boss' ? ' boss' : ''}"><div class="bcrowd" aria-hidden="true">${'<i></i>'.repeat(26)}</div><div class="bflags" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <div class="battle">${fighterView(p, 'me', B.team, B.pi, B)}<div class="vs">VS</div>${fighterView(e, 'foe', B.foes, B.ei, B)}</div></div>
    ${controls}
    <div class="log">${B.log.map(l => `<div class="${l.cls}">${l.txt}</div>`).join('')}</div>
  </section>`;
}
function viewArena() {
  if (S.battle) return viewBattle();
  if (S.finalPhase) {
    const chips = [...S.dragons].sort((a, b) => powerOf(b) - powerOf(a)).map(d => `<button class="chip" aria-pressed="${S.team.includes(d.id)}" data-a="team" data-id="${d.id}">${dIcon(d.els, d.rar, 's', '', d.id, d.skin)}${d.name} · Nv ${d.lvl} · ⚡${powerOf(d)}</button>`).join('');
    const boss = bossTeam(true)[0];
    teamDragons();
    return `<section class="panel"><div class="panel-head"><h2>${isActs() ? `${curAct().n} · chefe` : 'Ataque final'}</h2><span class="muted num">${boss.name}: ❤️ ${fmt(boss.hpMax)} · 🗡️ ${boss.atk}</span></div>
      <div class="row" style="justify-content:center"><div class="stand">${dIcon(boss.disp, 'B', 'xl', 'flip', 5)}</div></div>
      <p style="margin:0">${boss.name} ataca com tipos aleatórios e não tem fraquezas. Leve as suas abelhas com mais vida e ataque.${S.weakened ? ' Está ferida: você lutou com ela no ninho, e ela perdeu 30% da vida.' : ''}${S.mode === 'infinito' ? ` Esta é a invasão ${S.wave + 1}.` : ''}</p>
      <div class="chips">${chips}</div>
      <div class="row"><button class="btn primary big pulse-go" data-a="fight" data-k="final">🛡️ Defender a colmeia</button><span class="hint">Time: ${S.team.length}/3</span></div></section>`;
  }
  const team = teamDragons();
  const ladder = LEAGUES.map((n, i) => `<div class="rung ${i + 1 < S.league ? 'done' : i + 1 === S.league ? 'cur' : ''}">${n}</div>`).join('');
  const chips = [...S.dragons].sort((a, b) => powerOf(b) - powerOf(a)).map(d => `<button class="chip" aria-pressed="${S.team.includes(d.id)}" data-a="team" data-id="${d.id}">${dIcon(d.els, d.rar, 's', '', d.id, d.skin)}${d.name} · Nv ${d.lvl} · ⚡${powerOf(d)}</button>`).join('');
  const champion = S.league > LEAGUES.length, locked = leagueLocked();
  const wild = S.event && S.event.type === 'selvagem' && S.event.until > S.t;
  const nextFoes = champion ? '' : `${Math.min(3, Math.ceil((S.league + S.leagueFight) / 2))} oponente(s) de nível ${oldLv(1 + (S.league - 1) * 2 + S.leagueFight)}`;
  const stands = team.map(d => `<div class="stand">${dIcon(d.els, d.rar, 'l', '', d.id, d.skin)}<span class="tag">${d.name} · Nv ${d.lvl}</span></div>`).join('')
    + '<div class="stand empty-stand"><span>Vaga</span></div>'.repeat(Math.max(0, 3 - team.length));
  return `<div class="grid">
    <div class="arena-stage">
      <div class="lg-banner lg-${Math.min(S.league, 9)}"><b>${champion ? '👑 Campeão' : '🏅 Liga ' + LEAGUES[S.league - 1]}</b><small>${champion ? 'Todas as ligas vencidas' : locked ? 'Abre no próximo ato' : `Etapa ${S.leagueFight + 1} de 3 · escolha o caminho`}</small></div>
      <div class="arena-team">${stands}</div>
      ${champion
        ? '<button class="btn danger big" data-a="fight" data-k="boss">☠️ Entrar no Ninho de Papel</button>'
        : locked ? `<div class="lock-note">🔒 A liga ${LEAGUES[S.league - 1]} abre no próximo ato. Até lá, fortaleça o time para o chefe.</div>`
        : `<div class="route">${ensureRoute().map(k => `<button class="node node-${k}" data-a="node" data-k="${k}"><span class="ric">${NODES[k].i}</span><b>${NODES[k].n}</b><small>${NODES[k].d}</small></button>`).join('')}</div>`}
    </div>
    <section class="panel" style="grid-column:1/-1">
      <div class="panel-head"><h2>Arena</h2><span class="muted">${champion ? 'Todas as ligas vencidas' : `Liga ${LEAGUES[S.league - 1]} · etapa ${S.leagueFight + 1} de 3`}</span></div>
      <div class="ladder">${ladder}</div>
      ${isActs() && !champion && !towerOf().items.includes('trofeu') ? '<p class="hint" style="margin:4px 0 0">🏆 Vencer a liga dos Campeões dá o <b>Troféu dos Campeões</b>, a última peça da Torre da Ascensão.</p>' : ''}
      ${wild ? `<div class="row"><button class="btn primary" data-a="fight" data-k="wild">🐲 Enfrentar a abelha selvagem (recompensa x3)</button><span class="hint">${Math.ceil(S.event.until - S.t)}s restantes</span></div>` : ''}
      <div class="row">
        ${champion
          ? `<span class="hint">${S.weakened ? 'Já ferida. Lutar de novo rende mel e geleia real.' : 'Vencer agora tira 30% da vida dela no próximo ataque.'}</span>`
          : `<span class="hint">Luta da etapa: ${nextFoes}. Todo caminho é uma batalha; Elite, Duelo e Mistério pagam mais.${S.leagueFight >= 2 ? ' A última etapa da liga é sempre uma luta.' : ''}</span>`}
      </div>
    </section>
    <section class="panel" style="grid-column:1/-1">
      <div class="panel-head"><h2>Seu time <span class="muted" style="font-size:.9rem">${team.length}/3</span></h2><span class="hint">Escolha até 3 abelhas. Vantagem de tipo vale x${String(MOD('eff')).replace('.', ',')} de dano.</span></div>
      <div class="chips">${chips}</div>
    </section>
    <section class="panel" style="grid-column:1/-1">
      <h2>Tabela de vantagens</h2>
      <div class="elbars">${EL_KEYS.map(k => `<div class="outcome"><b style="min-width:110px">${EL[k].i} ${EL[k].n}</b><span class="muted">forte contra ${STRONG[k].map(x => EL[x].i + ' ' + EL[x].n).join(', ')}</span></div>`).join('')}</div>
    </section>
  </div>`;
}
function viewMissions() {
  const ms = S.missions.map((m, i) => {
    const t = missionTpl(m), p = missionProg(m), done = p >= m.target;
    return `<div class="mission ${done ? 'done' : ''}"><span class="ic">${t.i}</span>
      <div style="display:flex;flex-direction:column;gap:6px;min-width:0"><b>${t.t(m.target)}</b>
        <div class="bar green"><i style="width:${pct(p, m.target)}%"></i></div>
        <span class="hint num">${fmt(p)} / ${fmt(m.target)} · Recompensa: ${costTag(m.gold)} ${costTag(m.gems, 'm')} +${m.xp} XP</span></div>
      <button class="btn ${done ? 'primary' : ''}" data-a="claim" data-i="${i}" ${done ? '' : 'disabled'}>Resgatar</button></div>`;
  }).join('');
  const ev = S.event && S.event.until > S.t ? S.event : null;
  return `<div class="grid">
    <section class="panel"><div class="panel-head"><h2>Missões ativas</h2><span class="muted num">${S.stats.missionsDone} concluídas</span></div>
      <div class="missions">${ms}</div>
      <p class="hint" style="margin:0">Novas missões ficam mais difíceis conforme o seu nível, e pagam mais.</p></section>
    <section class="panel"><h2>Evento atual</h2>
      ${ev ? `<div class="mission"><span class="ic">${EVENTS[ev.type].i}</span><div><b>${EVENTS[ev.type].n}</b><div class="hint">${EVENTS[ev.type].d}</div></div><span class="num muted">${Math.ceil(ev.until - S.t)}s</span></div>
        ${ev.type === 'mercador' ? `<button class="btn primary" data-a="merchant">Trocar ${costTag(ev.price)} por 💎 10</button>` : ''}
        ${ev.type === 'selvagem' ? `<button class="btn primary" data-a="tab" data-k="arena">Ir para a Arena</button>` : ''}`
        : `<p class="hint" style="margin:0">Nenhum evento agora. O próximo chega em cerca de ${Math.max(1, Math.ceil(S.nextEvent - S.t))}s.</p>`}
      <div class="outcomes">${Object.values(EVENTS).map(e => `<div class="outcome"><span style="font-size:20px">${e.i}</span><span><b>${e.n}</b><br><span class="hint">${e.d}</span></span></div>`).join('')}</div>
    </section></div>`;
}
function viewShop() {
  const tab = S.shopTab && S.shopTab !== 'dragoes' ? S.shopTab : 'construcoes', deal = dealEl(), dealLeft = Math.ceil(DEAL_EVERY - S.t % DEAL_EVERY);
  const merch = S.event && S.event.type === 'mercador' && S.event.until > S.t;
  const stat = (rar, lvl = 1) => { const d = { rar, lvl }; return `<span class="sstats"><span title="Mel por segundo">🪙 ${gpsOf(d).toFixed(1).replace('.', ',')}/s</span><span title="Vida">❤️ ${hpOf(d)}</span><span title="Ataque">🗡️ ${atkOf(d)}</span></span>`; };
  let body = '';
  if (tab === 'dragoes') {
    body = EL_KEYS.map(k => {
      const e = EL[k], locked = S.level < unlockLvl(k), sp = speciesFromEls([k]), sale = k === deal && !locked, price = dragonPrice(k);
      return `<div class="sitem el-${k} ${locked ? 'locked' : ''} ${sale ? 'sale' : ''}">
        <span class="srib rib-${sp.rar}">${RARITY[sp.rar].n}</span>${sale ? '<span class="burst">-25%</span>' : ''}${!S.dex[sp.key] && !locked ? '<span class="newtag">NOVO!</span>' : ''}
        <div class="stand">${dIcon([k], sp.rar, 'l', '', 3 + EL_KEYS.indexOf(k))}</div>
        <b class="sname">${e.pn}</b>${S.meadow.includes(k) ? '<span class="native">🌻 Nativa do prado: +25% de mel</span>' : ''}${stat(sp.rar)}
        <span class="hint">${e.mel} · forte contra ${STRONG[k].map(x => EL[x].i).join(' ')}</span>
        ${locked ? `<span class="slock">🔒 Nível ${unlockLvl(k)}</span>`
          : `<button class="btn ${sale ? 'go' : 'primary'}" data-a="buy" data-k="${k}">${sale ? `<s>${fmt(e.cost)}</s> ` : ''}${costTag(price)}</button>`}
      </div>`;
    }).join('');
    body = `<p class="hint deal-hint">🏷️ Oferta do momento: <b>${EL[deal].pn}</b> com 25% de desconto. Troca em ${dealLeft}s.</p><div class="sgrid">${body}</div>`;
  } else if (tab === 'construcoes') {
    const hc = HATCH_COSTS[S.hatchSlots - 1];
    const card = (ic, n, d, own, btn) => `<div class="sitem build"><span class="bigic">${ic}</span><b class="sname">${n}</b><span class="hint">${d}</span><span class="own">${own}</span>${btn}</div>`;
    body = `<div class="sgrid">
      ${card('🏛️', 'Colmeia', 'Mais 3 vagas para abelhas, e mais mel guardado.', `Você tem ${S.habitats.length}/${habMax()}${habMax() < HAB_LOTS.length ? ' (mais no próximo ato)' : ''}`, S.habitats.length < habMax() ? `<button class="btn primary" data-a="buyHab">${costTag(habitatCost())}</button>` : '<span class="slock">Ilha cheia</span>')}
      ${card('🌱', 'Canteiro de flores', 'Mais um canteiro para plantar flores e colher néctar.', `Você tem ${S.farms.length}/${farmMax()}${farmMax() < FARM_LOTS.length ? ' (mais no próximo ato)' : ''}`, S.farms.length < farmMax() ? `<button class="btn primary" data-a="buyFarm">${costTag(farmCost())}</button>` : '<span class="slock">Jardim cheio</span>')}

    </div>`;
  } else if (tab === 'tesouros') {
    const gg = 150 * S.level + Math.round(totalGps() * 30);
    const card = (ic, n, d, btn, cls = '') => `<div class="sitem gemi ${cls}"><span class="bigic">${ic}</span><b class="sname">${n}</b><span class="hint">${d}</span>${btn}</div>`;
    body = `<div class="sgrid">
      ${merch ? card('🧳', 'Mercador Viajante', `Só por mais ${Math.ceil(S.event.until - S.t)}s: troca mel por 10 de geleia real.`, `<button class="btn primary" data-a="merchant">${costTag(S.event.price)} → 💎 10</button>`, 'hot') : ''}
      ${card('🎯', 'Roleta do Enxame', 'As abelhas agora vêm da roleta. Giro de geleia real: só Raras ou melhores.', '<button class="btn gemb" data-a="mystery">Ir para a roleta</button>', 'rare')}
      ${Object.entries(BOOSTS).map(([k, b]) => card(b.i, b.n, b.d + (S.buffs[k] > S.t ? ` Ativo: ${Math.ceil(S.buffs[k] - S.t)}s.` : ''), `<button class="btn gemb" data-a="boost" data-k="${k}">💎 ${b.gems}</button>`)).join('')}
      ${Object.entries(TREASURES).map(([k, t]) => card(t.i, t.n, t.d + (k === 'trevo' && S.luck ? ` Restam ${S.luck} giros com sorte.` : ''), `<button class="btn gemb" data-a="treasure" data-k="${k}">💎 ${t.gems}</button>`, k === 'trevo' || k === 'cesta' ? 'rare' : '')).join('')}
      ${card('💰', 'Pote de Mel', `Troque 5 de geleia real por ${fmt(gg)} de mel.`, '<button class="btn gemb" data-a="gemGold">💎 5</button>')}
    </div>`;
  }
  if (tab === 'ataques') body = viewAttacks();
  if (tab === 'roleta') body = viewWheel();
  if (tab === 'visual') body = viewSkins();
  const tabs = [['construcoes', '🏛️', 'Construções'], ['ataques', '🗡️', 'Ataques'], ['roleta', '🍀', 'Roleta'], ['visual', '👑', 'Visual'], ['tesouros', '💎', 'Tesouros']]
    .map(([k, ic, n]) => `<button class="stab" aria-pressed="${tab === k}" data-a="shopTab" data-k="${k}">${ic} ${n}${k === 'tesouros' && merch ? '<span class="badge">!</span>' : ''}</button>`).join('');
  return `<div class="shop-top"><div class="shop-sign"><b>Mercado do Favo</b><small>Construções, ataques e tesouros</small></div>
    <div class="shop-wallet"><span class="cost g">🪙 ${fmt(S.gold)}</span><span class="cost m">💎 ${fmt(S.gems)}</span></div></div>
    <div class="stabs">${tabs}</div>
    <section class="panel shop-panel">${body}</section>`;
}
function viewAttacks() {
  const cards = Object.entries(ATTACKS).map(([k, A]) => `<div class="sitem build ${S.atkPick === k ? 'picked' : ''}"><span class="bigic">${A.i}</span><b class="sname">${A.n}</b><span class="hint">${A.d}</span><span class="own">+${Math.round(A.up * 100)}% de ataque permanente · abelha nível ${A.lvl}+</span>
    <button class="btn ${A.gems ? 'gemb' : 'primary'}" data-a="atkPick" data-k="${k}" aria-pressed="${S.atkPick === k}">${S.atkPick === k ? 'Escolha a abelha abaixo' : A.gems ? `💎 ${A.gems}` : costTag(Math.round(A.gold * MOD('shop')))}</button></div>`).join('');
  const A = ATTACKS[S.atkPick];
  const pickBees = A ? `<div class="panel-head"><h2>Quem aprende ${A.n}?</h2><span class="hint">A abelha troca o golpe que já tinha. O bônus de ataque se soma.</span></div><div class="chips">${S.dragons.map(d => `<button class="chip" data-a="learn" data-id="${d.id}" ${d.lvl < A.lvl ? `disabled title="Precisa do nível ${A.lvl}"` : ''}>${dIcon(d.els, d.rar, 's', '', d.id, d.skin)}${d.name} · Nv ${d.lvl}${d.move ? ' · ' + ATTACKS[d.move].i : ''}</button>`).join('')}</div>` : '';
  return `<p class="hint deal-hint">🗡️ Compre um golpe e ensine a uma abelha. Ela usa o golpe na batalha e fica mais forte para sempre.</p><div class="sgrid">${cards}</div>${pickBees}`;
}
function viewSkins() {
  const cards = Object.entries(SKINS).map(([k, K]) => `<div class="sitem build ${S.skinPick === k ? 'picked' : ''}"><span class="bigic">${K.i}</span><b class="sname">${K.n}</b><span class="hint">${K.t === 'hat' ? 'Chapéu' : 'Asas'}</span>
    <button class="btn gemb" data-a="skinPick" data-k="${k}" aria-pressed="${S.skinPick === k}">${S.skinPick === k ? 'Escolha a abelha abaixo' : `💎 ${K.gems}`}</button></div>`).join('');
  const K = SKINS[S.skinPick];
  const pickBees = K ? `<div class="panel-head"><h2>Quem vai usar ${K.n}?</h2><span class="hint">Troca o ${K.t === 'hat' ? 'chapéu' : 'par de asas'} que a abelha já usava.</span></div><div class="chips">${S.dragons.map(d => `<button class="chip" data-a="skin" data-id="${d.id}">${dIcon(d.els, d.rar, 's', '', d.id, d.skin)}${d.name}</button>`).join('')}</div>` : '';
  const dressed = S.dragons.filter(d => d.skin && (d.skin.hat || d.skin.wing));
  const wearing = dressed.length ? `<div class="panel-head"><h2>Usando agora</h2></div><div class="chips">${dressed.map(d => ['hat', 'wing'].filter(t => d.skin[t]).map(t => `<button class="chip" data-a="unskin" data-id="${d.id}" data-k="${t}" title="Tirar">${dIcon(d.els, d.rar, 's', '', d.id, d.skin)}${d.name} · tirar ${SKINS[d.skin[t]].n}</button>`).join('')).join('')}</div>` : '';
  const hcards = Object.entries(HIVE_SKINS).map(([k, H]) => `<div class="sitem build ${S.hskinPick === k ? 'picked' : ''}"><span class="bigic">${H.i}</span><b class="sname">${H.n}</b><span class="hint">${H.d}</span>
    <button class="btn gemb" data-a="hskinPick" data-k="${k}" aria-pressed="${S.hskinPick === k}">${S.hskinPick === k ? 'Escolha a colmeia abaixo' : `💎 ${H.gems}`}</button></div>`).join('');
  const H = HIVE_SKINS[S.hskinPick];
  const pickHives = H ? `<div class="panel-head"><h2>Qual colmeia vira ${H.n}?</h2></div><div class="chips">${S.habitats.map((h, i) => `<button class="chip" data-a="hskin" data-i="${i}">🏠 Colmeia ${i + 1}${h.skin ? ` · ${HIVE_SKINS[h.skin].n}` : ''}</button>`).join('')}</div>` : '';
  const hwear = S.habitats.some(h => h.skin) ? `<div class="chips">${S.habitats.map((h, i) => h.skin ? `<button class="chip" data-a="unhskin" data-i="${i}" title="Tirar">${HIVE_SKINS[h.skin].i} Colmeia ${i + 1} · tirar ${HIVE_SKINS[h.skin].n}</button>` : '').join('')}</div>` : '';
  return `<p class="hint deal-hint">👑 Deixe suas abelhas com a sua cara. O visual não muda os atributos.</p><div class="sgrid">${cards}</div>${pickBees}${wearing}
    <div class="panel-head"><h2>Skins de colmeia</h2><span class="hint">Mudam o cortiço da colmeia na ilha. Não mudam o mel.</span></div><div class="sgrid">${hcards}</div>${pickHives}${hwear}`;
}
function viewWheel() {
  const n = SPIN_PRIZES.length, seg = 360 / n;
  const grad = SPIN_PRIZES.map((z, i) => `${z.c} ${i * seg}deg ${(i + 1) * seg}deg`).join(', ');
  const labels = SPIN_PRIZES.map((z, i) => `<span class="wl" style="transform:rotate(${i * seg + seg / 2}deg) translateY(-34%)"><span>${z.i}</span></span>`).join('');
  const sp = S.spin, spinning = sp && sp.until > performance.now();
  const res = sp && sp.done ? SPIN_PRIZES[sp.idx] : null;
  return `<div class="wheel-wrap">
    <div class="wheel-box"><div class="wheel-pin"></div><div class="wheel" style="background:conic-gradient(${grad});transform:rotate(${sp ? sp.deg : 0}deg)">${labels}<div class="wheel-hub">🍀</div></div></div>
    <div class="wheel-side">
      <h2 class="wheel-t">Roleta da BetMel</h2>
      <p class="hint">Gire para ganhar prêmios. Com sorte vem a <b>BetMel</b>, uma abelha lendária exclusiva que produz o dobro de mel.</p>
      <div class="wprizes">${SPIN_PRIZES.map(z => `<span>${z.i} ${z.n} <b class="num">${String(Math.round(z.p * 1000) / 10).replace('.', ',')}%</b></span>`).join('')}</div>
      <div class="row"><button class="btn primary" data-a="spin" data-k="gold" ${spinning ? 'disabled' : ''}>Girar ${costTag(Math.round(SPIN.gold * MOD('shop')))}</button><button class="btn gemb" data-a="spin" data-k="gems" ${spinning ? 'disabled' : ''}>Girar 💎 ${SPIN.gems}</button></div>
      <p class="wres">${spinning ? 'Girando…' : res ? `Você ganhou: ${res.i} <b>${res.n}</b>` : '&nbsp;'}</p>
    </div></div>`;
}
function viewGarden() {
  const crops = Object.entries(CROPS);
  const flowerBtns = (i, cur) => crops.map(([k, c]) => `<button class="fbtn ${k === S.nativeFlower ? 'nat' : ''}" aria-pressed="${cur === k}" data-a="farmCrop" data-i="${i}" data-k="${k}" ${unlockedCrop(k) ? '' : 'disabled'} title="${c.n}${unlockedCrop(k) ? '' : ' · nível ' + c.lvl}">${c.i}</button>`).join('');
  const cards = S.farms.map((f, i) => {
    const lvl = f.lvl || 1, c = f.crop ? CROPS[f.crop] : null, p = c ? Math.min(1, f.prog / c.dur) : 0, ready = c && p >= 1;
    const pk = CROPS[f.pick || 'trigo'];
    const state = !c ? `Vazio · vai plantar ${pk.i} ${pk.n}` : ready ? `${c.i} ${c.n} pronta!` : `${c.i} ${c.n} · ${Math.ceil((c.dur - f.prog) / (farmSpeed(f) * MOD('farm')))}s`;
    return `<div class="gcard ${ready ? 'ready' : ''} ${S.jardimSel === i ? 'sel' : ''}">
      <div class="ghead"><b>Canteiro ${i + 1}</b><span class="stars">${'★'.repeat(lvl)}${'☆'.repeat(FARM_MAX - lvl)}</span></div>
      <svg class="gpot" viewBox="-30 -36 60 44" aria-hidden="true"><ellipse cx="0" cy="2" rx="26" ry="6" fill="#5a3518"/><ellipse cx="0" cy="0" rx="24" ry="5" fill="#7a4a24"/>${[[-12, 0], [0, -1], [12, 0]].map(([x, y]) => cropPlant(c ? f.crop : (f.pick || 'trigo'), x, y, c ? p : 0.15)).join('')}</svg>
      <span class="hint">${state}</span>
      <div class="bar"><i style="width:${Math.round(p * 100)}%"></i></div>
      <div class="frow">${flowerBtns(i, f.pick || 'trigo')}</div>
      <span class="hint num">🍖 ${Math.round(cropFood(f.pick || 'trigo') * farmYield(f))} por colheita</span>
      <div class="row">
        ${ready ? `<button class="btn small go" data-a="plantOne" data-i="${i}">🧺 Colher</button>` : !c ? `<button class="btn small primary" data-a="plantOne" data-i="${i}">🌱 Plantar ${costTag(pk.cost)}</button>` : ''}
        ${lvl < FARM_MAX ? `<button class="btn small" data-a="farmUp" data-i="${i}">⬆️ Nível ${lvl + 1} ${costTag(farmUpCost(lvl))}</button>` : '<span class="slock">Nível máximo</span>'}
      </div></div>`;
  }).join('');
  const gc = Math.round(GARDENER.cost * MOD('shop'));
  const gard = S.gardener
    ? `<div class="gard on"><span class="bigic">👩‍🌾</span><div><b>Abelha Jardineira</b><span class="hint">Trabalhando: colhe e replanta um canteiro a cada ${String(GARDENER.every).replace('.', ',')}s, usando a flor escolhida em cada um.</span></div></div>`
    : `<div class="gard"><span class="bigic">👩‍🌾</span><div><b>Abelha Jardineira</b><span class="hint">Contrate uma abelha que colhe e replanta os canteiros sozinha.</span></div>${S.level >= GARDENER.lvl ? `<button class="btn primary" data-a="gardener">Contratar ${costTag(gc)}</button>` : `<span class="slock">🔒 Nível ${GARDENER.lvl}</span>`}</div>`;
  return `<section class="panel">
    ${gard}
    <div class="panel-head"><h2>Canteiros</h2><span class="hint">Escolha a flor de cada canteiro. A flor nativa (${CROPS[S.nativeFlower].i} ${CROPS[S.nativeFlower].n}) dá 50% mais néctar.</span></div>
    <div class="row gall"><span class="hint">Todos:</span>${flowerBtns('all', null)}
      ${S.level >= 3 ? '<button class="btn small primary" data-a="harvestAll">🧺 Colher e replantar tudo</button>' : ''}
      ${S.farms.length < farmMax() ? `<button class="btn small" data-a="buyFarm">+ Canteiro ${costTag(farmCost())}</button>` : ''}</div>
    <div class="gardens">${cards}</div>
  </section>`;
}
function viewAch() {
  const total = ACH.length, got = Object.keys(S.ach).length;
  const cats = [...new Set(ACH.map(a => a.cat))];
  return `<section class="panel">
    <div class="panel-head"><h2>Conquistas</h2><span class="muted num">${got}/${total}</span></div>
    <div class="bar gold"><i style="width:${pct(got, total)}%"></i></div>
    ${cats.map(c => `<span class="cat">${c}</span><div class="achs">${ACH.filter(a => a.cat === c).map(a => {
      const t = S.ach[a.id];
      return `<div class="ach ${t === undefined ? 'locked' : ''}"><span class="ic">${a.i}</span><div><b>${a.n}</b><small>${a.d}</small><small>${t === undefined ? `Recompensa: 💎 ${a.g}` : `Desbloqueada em ${fmtTime(t)}`}</small></div></div>`;
    }).join('')}</div>`).join('')}
  </section>`;
}
function statRows() {
  const st = S.stats, mins = Math.max(S.t / 60, 1 / 60);
  const winRate = pct(st.battlesWon, st.battlesWon + st.battlesLost);
  return [
    ['Geral', [
      ['Tempo de jogo', fmtTime(S.t)], ['Modo', MODES[S.mode].n], ['Nível do jogador', S.level], ['XP total', fmt(st.xpTotal)],
      ['Cliques', fmt(st.clicks)], ['Cliques por minuto', (st.clicks / mins).toFixed(1).replace('.', ',')], ['Pontuação atual', fmt(score().total)],
    ]],
    ['Economia', [
      ['Mel produzido', fmt(st.goldEarned)], ['Mel gasto', fmt(st.goldSpent)], ['Mel por minuto (média)', fmt(st.goldEarned / mins)],
      ['Mel por segundo agora', fmt(totalGps())], ['Pico de mel por segundo', fmt(st.peakGps)], ['Coletas', fmt(st.collects)],
      ['Maior coleta', fmt(st.bestCollect)], ['Geleia real ganha', fmt(st.gemsEarned)], ['Geleia real gasta', fmt(st.gemsSpent)],
    ]],
    ['Jardim', [
      ['Flores plantadas', fmt(st.cropsPlanted)], ['Flores colhidas', fmt(st.cropsHarvested)], ['Néctar colhido', fmt(st.foodHarvested)],
      ['Néctar gasto', fmt(st.foodSpent)], ['Canteiros', S.farms.length],
    ]],
    ['Abelhas', [
      ['Abelhas na colmeia', S.dragons.length], ['Vendidos', st.dragonsSold],
      ['Espécies descobertas', `${Object.keys(S.dex).length}/${ALL_SPECIES.length}`], ['Maior nível', st.maxDragonLvl], ['Alimentações', st.feeds],
      ['Obtidos: Comum / Raro', `${st.byRarity.C} / ${st.byRarity.R}`], ['Obtidos: Épico / Lendário', `${st.byRarity.E} / ${st.byRarity.L}`],
      ['Poder total do time', fmt(S.dragons.reduce((a, d) => a + powerOf(d), 0))],
    ]],
    ['Cruzamento', [
      ['Mutações no Laboratório', st.labMuts || 0], ['Cristais ganhos', st.crystals || 0], ['Giros da roleta', st.swarmSpins], ['Repetidas', st.swarmDups], ['Garantias usadas', st.pityHits],
      ['Primeiro Lendário', st.firstLegendT === null ? '—' : fmtTime(st.firstLegendT)], ['Fichas perdidas pegas', st.lostEggs],
    ]],
    ['Arena', [
      ['Liga atual', LEAGUES[Math.min(S.league, 8) - 1] + (S.league > 8 ? ' (concluída)' : '')], ['Batalhas', st.battles], ['Vitórias', st.battlesWon], ['Derrotas', st.battlesLost],
      ['Taxa de vitória', winRate + '%'], ['Sequência atual', st.streak], ['Melhor sequência', st.bestStreak],
      ['Dano causado', fmt(st.damageDealt)], ['Dano recebido', fmt(st.damageTaken)], ['Maior golpe', fmt(st.bestHit)],
      ['Golpes críticos', st.crits], ['Golpes super eficazes', st.superEffective], ['Nocautes', st.kos], ['Abelhas nocauteadas', st.kosTaken],
      ['Vitórias perfeitas', st.flawless], ['Selvagens derrotadas', st.wildWins], ['Vespa Rainha adormecida', st.bossDefeated ? `vencida ${st.bossDefeated}x` : 'não enfrentada'],
      ['Invasões repelidas', st.finalWins],
      ['Invasão Final', S.finalResult ? (S.finalResult.win ? 'vencida' : `derrota (${Math.round(S.finalResult.dmgPct * 100)}% de dano)`) : 'ainda não acabou'],
    ]],
    ['Progresso', [
      ['Missões concluídas', st.missionsDone], ['Eventos presenciados', st.eventsSeen], ['Conquistas', `${Object.keys(S.ach).length}/${ACH.length}`],
    ]],
  ];
}
function viewStats() {
  const st = S.stats;
  const counts = {}; EL_KEYS.forEach(k => counts[k] = 0);
  S.dragons.forEach(d => d.els.forEach(e => counts[e]++));
  const max = Math.max(1, ...Object.values(counts));
  const kpis = [
    ['🪙', fmt(st.goldEarned), 'mel produzido'], ['🐉', S.dragons.length, 'abelhas'], ['📗', `${Object.keys(S.dex).length}/${ALL_SPECIES.length}`, 'espécies'],
    ['⚔️', `${st.battlesWon}/${st.battles}`, 'vitórias'], ['🏆', `${Object.keys(S.ach).length}/${ACH.length}`, 'conquistas'], ['⭐', fmt(score().total), 'pontos'],
  ];
  return `<div class="grid">
    <section class="panel" style="grid-column:1/-1"><div class="kpis">${kpis.map(k => `<div class="kpi"><span>${k[0]} ${k[2]}</span><b class="num">${k[1]}</b></div>`).join('')}</div></section>
    <section class="panel" style="grid-column:1/-1"><div class="panel-head"><h2>Mel ao longo da partida</h2><span class="hint">Linha laranja: mel produzido acumulado · tracejado azul: mel por segundo</span></div>
      <canvas class="chart" id="chart" aria-label="Gráfico de mel ao longo do tempo"></canvas></section>
    <section class="panel"><h2>Abelhas por tipo</h2><div class="elbars">${EL_KEYS.map(k => `<div class="elbar"><span>${EL[k].i} ${EL[k].n}</span><div class="bar"><i style="width:${pct(counts[k], max)}%;background:${EL[k].c}"></i></div><span class="num">${counts[k]}</span></div>`).join('')}</div></section>
    ${statRows().map(([g, rows]) => `<section class="panel"><h2>${g}</h2><table class="stats">${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table></section>`).join('')}
  </div>`;
}
function drawChart() {
  const cv = document.getElementById('chart');
  if (!cv) return;
  const dpr = window.devicePixelRatio || 1;
  const w = cv.clientWidth, h = cv.clientHeight;
  cv.width = w * dpr; cv.height = h * dpr;
  const g = cv.getContext('2d'); g.scale(dpr, dpr);
  const pts = S.history.concat([{ t: S.t, earned: S.stats.goldEarned, gps: totalGps() }]);
  const pad = { l: 52, r: 52, t: 12, b: 26 };
  const W = w - pad.l - pad.r, H = h - pad.t - pad.b;
  const tMax = Math.max(60, S.t), eMax = Math.max(100, ...pts.map(p => p.earned)), gMax = Math.max(5, ...pts.map(p => p.gps));
  const css = getComputedStyle(document.documentElement);
  const line = css.getPropertyValue('--line').trim(), muted = css.getPropertyValue('--muted').trim();
  g.font = '11px Nunito, sans-serif'; g.fillStyle = muted; g.strokeStyle = line; g.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + H - (H * i / 4);
    g.beginPath(); g.moveTo(pad.l, y); g.lineTo(pad.l + W, y); g.stroke();
    g.textAlign = 'right'; g.fillText(fmt(eMax * i / 4), pad.l - 6, y + 4);
    g.textAlign = 'left'; g.fillText(fmt(gMax * i / 4) + '/s', pad.l + W + 6, y + 4);
  }
  g.textAlign = 'center';
  for (let i = 0; i <= 4; i++) g.fillText(fmtTime(tMax * i / 4), pad.l + W * i / 4, h - 6);
  const X = t => pad.l + W * t / tMax;
  g.beginPath(); pts.forEach((p, i) => { const x = X(p.t), y = pad.t + H - H * p.earned / eMax; i ? g.lineTo(x, y) : g.moveTo(x, y); });
  g.lineTo(X(pts[pts.length - 1].t), pad.t + H); g.lineTo(X(0), pad.t + H); g.closePath();
  g.fillStyle = 'rgba(255,122,61,.15)'; g.fill();
  g.beginPath(); pts.forEach((p, i) => { const x = X(p.t), y = pad.t + H - H * p.earned / eMax; i ? g.lineTo(x, y) : g.moveTo(x, y); });
  g.strokeStyle = '#ff7a3d'; g.lineWidth = 2.5; g.stroke();
  g.beginPath(); pts.forEach((p, i) => { const x = X(p.t), y = pad.t + H - H * p.gps / gMax; i ? g.lineTo(x, y) : g.moveTo(x, y); });
  g.strokeStyle = '#62e3ff'; g.setLineDash([5, 4]); g.lineWidth = 2; g.stroke(); g.setLineDash([]);
  const lp = pts[pts.length - 1];
  g.fillStyle = '#ff7a3d'; g.beginPath(); g.arc(X(lp.t), pad.t + H - H * lp.earned / eMax, 4, 0, Math.PI * 2); g.fill();
}
let chartTimer = 0;
setInterval(() => { if (S && S.tab === 'stats' && !S.ended) drawChart(); }, 5000);

function renderLostEgg() {
  const box = $('#lostEgg');
  const want = S && S.lostEgg && !S.paused && !S.ended ? `<button class="lost-egg" data-a="egg" style="left:${S.lostEgg.x}vw;top:${S.lostEgg.y}vh" aria-label="Pegar a ficha perdida">🎯</button>` : '';
  if (box.innerHTML !== want) box.innerHTML = want;
}
function renderStart() {
  try { document.documentElement.style.setProperty('--haze', `url(${goldHaze()})`); } catch (e) {}
  overlay(`<div class="card">
    <div class="hero">
      <div class="row" style="justify-content:center">${dIcon(['fogo'], 'R', 'l', '', 1)}${dIcon(['luz', 'trevas'], 'L', 'xl', '', 4)}${dIcon(['agua', 'planta'], 'E', 'l', 'flip', 2)}</div>
      <h1>Honey Troop</h1>
      <p>O enxame da Vespa Rainha está a caminho da Ilha Favo. A partida tem três atos, e cada um termina com um chefe: o General Vespa, a Vespa Rainha e a Imperatriz do Ninho. Crie, cruze, alimente e treine um enxame de abelhas para vencer os três. Se elas defenderem a colmeia, viram uma nova Tropa do Mel. Cada partida sorteia a estação, o inimigo que invade a colmeia, o prado, a rainha, as relíquias e os caminhos da Arena. Ao fechar a aba, a partida se perde.</p>
    </div>
    ${(() => { const o = loadSave(); if (!o) return ''; const m = Math.max(1, Math.ceil((SAVE_TTL - (Date.now() - o.at)) / 60000)); return `<div class="row" style="justify-content:center"><button class="btn go big" data-a="resume">▶ Continuar partida (${o.s.mode === 'atos' ? ACTS[Math.min(o.s.act || 0, 2)].n + ' · ' : ''}${fmtTime(o.s.t)})</button></div><p class="hint" style="margin:0 0 6px;text-align:center">A partida fechada fica guardada por mais ${m} min. Jogar de novo apaga ela.</p>`; })()}
    <div class="row" style="justify-content:center"><button class="btn primary big play-btn" data-a="start" data-k="atos">Jogar</button></div>
    <p class="hint" style="margin:0;text-align:center">Dica: colete mel das colmeias, plante flores para ter néctar, alimente abelhas até o nível 3 e cruze para descobrir as ${ALL_SPECIES.length} espécies.</p>
  </div>`);
}
function renderEnd() {
  const sc = score();
  const r = rankFor(sc.total);
  const got = ACH.filter(a => S.ach[a.id] !== undefined);
  overlay(`<div class="card">
    <div class="hero"><span class="muted" style="font-weight:800">FIM DA PARTIDA · ${fmtTime(S.t)}</span>
      <div class="rank">${r}</div><h1 class="num">${fmt(sc.total)} pontos</h1>
      <p>${isActs() ? `${S.finalResult && S.finalResult.win ? '🛡️ Você venceu os três atos! Sua colmeia agora é da Tropa do Mel.' : S.finalResult ? `☠️ ${curAct().boss} venceu no ${curAct().n}, mas levou ${Math.round(S.finalResult.dmgPct * 100)}% de dano.` : `Você saiu no ${curAct().n}.`} Atos vencidos: ${S.act + (S.finalResult && S.finalResult.win ? 1 : 0)} de ${ACTS.length}.` : S.mode === 'infinito' ? `Você repeliu ${S.stats.finalWins} ataque(s) da Vespa Rainha em ${fmtTime(S.t)}.${S.finalResult && !S.finalResult.win ? ` No último, ela levou ${Math.round(S.finalResult.dmgPct * 100)}% de dano.` : ''}` : !S.finalResult ? 'Você deixou a ilha antes do ataque. A Vespa Rainha encontrou as colmeias vazias.' : S.finalResult.win ? '🛡️ A colmeia resistiu! Sua colmeia agora é da Tropa do Mel.' : `☠️ A Vespa Rainha tomou a ilha, mas leva uma ferroada de ${Math.round(S.finalResult.dmgPct * 100)}%. A próxima colmeia vai saber onde mirar.`}</p>${S.queen ? `<p class="muted">${SEASONS[S.season].n} · ${RIVALS[S.rival].n}: ${S.stats.raidsWon} invasão(ões) repelida(s) · ${S.stats.mutants} mutante(s) · ${QUEENS.find(q => q.k === S.queen).n} · prado de ${S.meadow.map(e => EL[e].n).join(', ')} · ${S.relics.length} relíquia(s)</p>` : ''}</div>
    <table class="stats"><tr><td class="muted">De onde vieram os pontos</td><td class="muted">pontos</td></tr>${Object.entries(sc.parts).map(([k, v]) => `<tr><td>${k} <span class="muted">· ${sc.what[k]}</span></td><td>${fmt(v)}</td></tr>`).join('')}</table>
    <div class="kpis">
      <div class="kpi"><span>🪙 mel produzido</span><b class="num">${fmt(S.stats.goldEarned)}</b></div>
      <div class="kpi"><span>🐉 abelhas</span><b class="num">${S.dragons.length}</b></div>
      <div class="kpi"><span>📗 espécies</span><b class="num">${Object.keys(S.dex).length}/${ALL_SPECIES.length}</b></div>
      <div class="kpi"><span>⚔️ vitórias</span><b class="num">${S.stats.battlesWon}</b></div>
      <div class="kpi"><span>🏅 liga</span><b>${LEAGUES[Math.min(S.league, 8) - 1]}</b></div>
      <div class="kpi"><span>☠️ dano na Vespa Rainha</span><b class="num">${S.finalResult ? Math.round(S.finalResult.dmgPct * 100) : 0}%</b></div>
      <div class="kpi"><span>🏆 conquistas</span><b class="num">${got.length}/${ACH.length}</b></div>
    </div>
    <span class="cat">Conquistas desta partida</span>
    <div class="achs">${got.length ? got.map(a => `<div class="ach"><span class="ic">${a.i}</span><div><b>${a.n}</b><small>${fmtTime(S.ach[a.id])}</small></div></div>`).join('') : '<span class="hint">Nenhuma desta vez.</span>'}</div>
    <details><summary style="cursor:pointer;font-weight:800">Todas as estatísticas</summary>
      ${statRows().map(([g, rows]) => `<h3 style="margin-top:12px">${g}</h3><table class="stats">${rows.map(x => `<tr><td>${x[0]}</td><td>${x[1]}</td></tr>`).join('')}</table>`).join('')}
    </details>
    <div class="row" style="justify-content:center"><button class="btn primary" data-a="again">Jogar de novo</button></div>
  </div>`);
}

// ============================================================
