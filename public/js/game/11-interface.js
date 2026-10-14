'use strict';
// INTERFACE
// ============================================================
// Atualiza o DOM no lugar (sem recriar nós iguais), para as animações dos dragões não reiniciarem a cada quadro
/* ICONS-START: ícones de jogo (game-icons.net, CC BY 3.0) no lugar de emojis. Todo HTML passa por iconize(). */
const GI = {"🪙": "gi-coin", "🪙️": "gi-coin", "💎": "gi-gem", "💎️": "gi-gem", "⚔": "gi-crossed-swords", "⚔️": "gi-crossed-swords", "☠": "gi-skull", "☠️": "gi-skull", "🐉": "gi-dragon", "🐉️": "gi-dragon", "🐲": "gi-dragon-wild", "🐲️": "gi-dragon-wild", "💞": "gi-two-hearts", "💞️": "gi-two-hearts", "❤": "gi-heart", "❤️": "gi-heart", "🏆": "gi-trophy", "🏆️": "gi-trophy", "🥚": "gi-egg", "🥚️": "gi-egg", "🍖": "gi-meat", "🍖️": "gi-meat", "🍗": "gi-drumstick", "🍗️": "gi-drumstick", "⚡": "gi-lightning", "⚡️": "gi-lightning", "🌾": "gi-wheat", "🌾️": "gi-wheat", "🐣": "gi-hatching", "🐣️": "gi-hatching", "🛡": "gi-shield", "🛡️": "gi-shield", "📜": "gi-scroll", "📜️": "gi-scroll", "⭐": "gi-star", "⭐️": "gi-star", "🌟": "gi-glowing-star", "🌟️": "gi-glowing-star", "🧺": "gi-basket", "🧺️": "gi-basket", "🏛": "gi-temple", "🏛️": "gi-temple", "💰": "gi-money-bag", "💰️": "gi-money-bag", "📗": "gi-book-green", "📗️": "gi-book-green", "📘": "gi-book-blue", "📘️": "gi-book-blue", "📕": "gi-book-red", "📕️": "gi-book-red", "🔥": "gi-fire", "🔥️": "gi-fire", "🌧": "gi-rain", "🌧️": "gi-rain", "🌻": "gi-sunflower", "🌻️": "gi-sunflower", "🛒": "gi-shop", "🛒️": "gi-shop", "👑": "gi-crown", "👑️": "gi-crown", "🏰": "gi-castle", "🏰️": "gi-castle", "🔮": "gi-crystal-ball", "🔮️": "gi-crystal-ball", "🌱": "gi-sprout", "🌱️": "gi-sprout", "💥": "gi-explosion", "💥️": "gi-explosion", "🪺": "gi-nest", "🪺️": "gi-nest", "🗡": "gi-dagger", "🗡️": "gi-dagger", "🏅": "gi-medal", "🏅️": "gi-medal", "🥇": "gi-medal-gold", "🥇️": "gi-medal-gold", "🥈": "gi-medal-silver", "🥈️": "gi-medal-silver", "🥉": "gi-medal-bronze", "🥉️": "gi-medal-bronze", "🎖": "gi-military-medal", "🎖️": "gi-military-medal", "✔": "gi-check", "✔️": "gi-check", "✅": "gi-check", "✅️": "gi-check", "💧": "gi-water-drop", "💧️": "gi-water-drop", "🌿": "gi-leaf", "🌿️": "gi-leaf", "🪨": "gi-rock", "🪨️": "gi-rock", "❄": "gi-snowflake", "❄️": "gi-snowflake", "⚙": "gi-gear", "⚙️": "gi-gear", "🌑": "gi-dark-moon", "🌑️": "gi-dark-moon", "✨": "gi-sparkles", "✨️": "gi-sparkles", "🌽": "gi-corn", "🌽️": "gi-corn", "🎃": "gi-pumpkin", "🎃️": "gi-pumpkin", "🍇": "gi-grapes", "🍇️": "gi-grapes", "🧳": "gi-suitcase", "🧳️": "gi-suitcase", "📈": "gi-chart-up", "📈️": "gi-chart-up", "🏭": "gi-factory", "🏭️": "gi-factory", "🏦": "gi-bank", "🏦️": "gi-bank", "💠": "gi-diamond-shape", "💠️": "gi-diamond-shape", "🔷": "gi-blue-diamond", "🔷️": "gi-blue-diamond", "🌈": "gi-rainbow", "🌈️": "gi-rainbow", "⬆": "gi-arrow-up", "⬆️": "gi-arrow-up", "⏫": "gi-double-up", "⏫️": "gi-double-up", "🔱": "gi-trident", "🔱️": "gi-trident", "🧬": "gi-dna", "🧬️": "gi-dna", "⏩": "gi-fast-forward", "⏩️": "gi-fast-forward", "🚜": "gi-tractor", "🚜️": "gi-tractor", "👩‍🌾": "gi-farmer", "☄": "gi-comet", "☄️": "gi-comet", "🎯": "gi-target", "🎯️": "gi-target", "🧪": "gi-flask", "🧪️": "gi-flask", "💯": "gi-perfect", "💯️": "gi-perfect", "🏘": "gi-village", "🏘️": "gi-village", "👋": "gi-wave", "👋️": "gi-wave", "✋": "gi-hand", "✋️": "gi-hand", "👆": "gi-pointing", "👆️": "gi-pointing", "📣": "gi-megaphone", "📣️": "gi-megaphone", "💫": "gi-dizzy", "💫️": "gi-dizzy", "🍀": "gi-clover", "🍀️": "gi-clover", "🩸": "gi-blood", "🩸️": "gi-blood", "🏝": "gi-island", "🏝️": "gi-island", "📊": "gi-bar-chart", "📊️": "gi-bar-chart", "✕": "gi-close", "✕️": "gi-close", "✖": "gi-close", "✖️": "gi-close", "❌": "gi-close", "❌️": "gi-close", "⏳": "gi-hourglass", "⏳️": "gi-hourglass", "⌛": "gi-hourglass", "⌛️": "gi-hourglass", "⏸": "gi-pause", "⏸️": "gi-pause", "▶": "gi-play", "▶️": "gi-play", "🏳": "gi-white-flag", "🏳️": "gi-white-flag", "🔒": "gi-lock", "🔒️": "gi-lock", "⏭": "gi-skip", "⏭️": "gi-skip", "🎵": "gi-music", "🔇": "gi-sound-off", "🔊": "gi-sound-on", "🏷️": "gi-tag", "🏷": "gi-tag"};
const GI_NAME = {"heart": "gi-heart", "book": "gi-book", "potion": "gi-potion", "pause": "gi-pause", "play": "gi-play", "flag": "gi-flag", "sound-on": "gi-sound-on", "sound-off": "gi-sound-off", "music": "gi-music", "skip": "gi-skip", "map": "gi-map", "chest": "gi-chest", "tag": "gi-tag", "sale": "gi-sale", "hammer": "gi-hammer", "clock": "gi-clock"};
const GI_RE = new RegExp(Object.keys(GI).sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gu');
const giHTML = id => `<svg class="gi" aria-hidden="true"><use href="#${id}"/></svg>`;
const giName = n => giHTML(GI_NAME[n]);
// Emoji dentro de <text> do SVG do mapa: vira <use>, com a posição estimada a partir do x/y/tamanho da fonte
function giText(m, at, txt) {
  GI_RE.lastIndex = 0;
  if (!GI_RE.test(txt)) return m;
  const num = (k, d) => { const r = new RegExp('\\s' + k + '="([-\\d.]+)"').exec(at); return r ? +r[1] : d; };
  const x = num('x', 0), y = num('y', 0), fs = num('font-size', /class="lbl"/.test(at) ? 12 : 16);
  const anchor = (/text-anchor="(\w+)"/.exec(at) || [])[1] || 'start';
  const parts = []; let last = 0; GI_RE.lastIndex = 0;
  for (const r of txt.matchAll(GI_RE)) { if (r.index > last) parts.push([0, txt.slice(last, r.index)]); parts.push([1, GI[r[0]]]); last = r.index + r[0].length; }
  if (last < txt.length) parts.push([0, txt.slice(last)]);
  const sz = fs * 1.15, cw = fs * 0.58;
  const wOf = p => p[0] ? sz + 1 : p[1].replace(/&[a-z#0-9]+;/g, 'x').length * cw;
  const total = parts.reduce((a, p) => a + wOf(p), 0);
  let cx = anchor === 'middle' ? x - total / 2 : anchor === 'end' ? x - total : x;
  const rest = at.replace(/\s(x|text-anchor)="[^"]*"/g, '');
  return parts.map(p => { const w = wOf(p), o = p[0] ? `<use href="#${p[1]}" x="${(cx + .5).toFixed(1)}" y="${(y - fs * .92).toFixed(1)}" width="${sz.toFixed(1)}" height="${sz.toFixed(1)}"/>` : (p[1].trim() ? `<text${rest} x="${cx.toFixed(1)}" text-anchor="start">${p[1]}</text>` : ''); cx += w; return o; }).join('');
}
function iconize(html) {
  GI_RE.lastIndex = 0;
  if (!html || !GI_RE.test(html)) return html;
  html = html.replace(/<text([^>]*)>([^<]*)<\/text>/g, giText);
  return html.replace(/(^|>)([^<]+)/g, (m, a, t) => a + t.replace(GI_RE, e => giHTML(GI[e])));
}
// Rede de segurança: textos que entram no DOM por outros caminhos (sons, números flutuantes) também viram ícones
function iconizeNode(n) {
  if (n.nodeType === 3) {
    const p = n.parentNode; GI_RE.lastIndex = 0;
    if (!p || p.namespaceURI === 'http://www.w3.org/2000/svg' || /^(SCRIPT|STYLE|TITLE|OPTION|TEXTAREA)$/.test(p.nodeName) || !GI_RE.test(n.data)) return;
    const t = document.createElement('template'); t.innerHTML = iconize(n.data.replace(/&/g, '&amp;').replace(/</g, '&lt;'));
    p.replaceChild(t.content, n);
  } else if (n.nodeType === 1 && n.namespaceURI !== 'http://www.w3.org/2000/svg') {
    const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT), list = [];
    while (w.nextNode()) list.push(w.currentNode);
    list.forEach(iconizeNode);
  }
}
new MutationObserver(ms => ms.forEach(m => { if (m.type === 'characterData') iconizeNode(m.target); else m.addedNodes.forEach(iconizeNode); }))
  .observe(document.body, { childList: true, subtree: true, characterData: true });
/* ICONS-END */
function morph(root, html) {
  html = iconize(html);
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  patchChildren(root, tpl.content);
}
function patchChildren(a, b) {
  const bn = [...b.childNodes];
  bn.forEach((nb, i) => { const na = a.childNodes[i]; if (!na) a.appendChild(nb); else patchNode(na, nb); });
  while (a.childNodes.length > bn.length) a.removeChild(a.lastChild);
}
function patchNode(a, b) {
  if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName) { a.replaceWith(b); return; }
  if (a.nodeType !== 1) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
  for (const at of [...a.attributes]) if (!b.hasAttribute(at.name)) a.removeAttribute(at.name);
  for (const at of [...b.attributes]) if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value);
  patchChildren(a, b);
}
function overlay(html) { html = iconize(html); $('#overlay').innerHTML = html ? `<div class="overlay">${html}</div>` : ''; }
// v8.7: aviso com cara de jogo: selo hexagonal com ícone do assunto, título forte, texto claro e barrinha de tempo.
// Toque no aviso para fechar.
const TOAST_IC = [
  [/conquista/i, 'trophy'], [/rainha|coroa|assumiu/i, 'crown'], [/roleta|giro|ficha/i, 'target'], [/néctar|colh|flor|jardim|plant|canteiro/i, 'sprout'],
  [/geleia/i, 'gem'], [/cristal|muta|laborat/i, 'flask'], [/ato|chefe|batalha|vit[oó]ria|arena|liga|invas|ataque|elite/i, 'crossed-swords'],
  [/n[ií]vel|veterana|heroína|experiente/i, 'star'], [/relíquia|tesouro/i, 'chest'], [/missão|missões/i, 'scroll'], [/ascen|torre/i, 'castle'],
  [/estação|inverno|verão|primavera|outono/i, 'leaf'], [/vend|loja|compr/i, 'shop'], [/mel|colmeia/i, 'coin'],
];
function toast(title, sub = '', cls = '') {
  const box = $('#toasts');
  if (cls === 'bad') sfx('erro');
  if ([...box.children].some(c => c.dataset.title === title)) return;
  const plain = String(title).replace(/<[^>]+>/g, '');
  const ic = cls === 'bad' ? null : cls === 'ach' ? 'trophy' : ((TOAST_IC.find(([re]) => re.test(plain)) || [0, 'sparkles'])[1]);
  const el = document.createElement('div');
  el.className = 'toast ' + cls;
  el.dataset.title = title;
  el.innerHTML = `<span class="t-ic">${ic ? `<svg class="gi" aria-hidden="true"><use href="#gi-${ic}"></use></svg>` : '<b>!</b>'}</span><span class="t-tx"><b class="t-tt">${title}</b>${sub ? `<small>${sub}</small>` : ''}</span><i class="t-bar"></i>`;
  const tira = () => { if (!el.isConnected || el.classList.contains('out')) return; el.classList.add('out'); setTimeout(() => el.remove(), 260); };
  el.addEventListener('click', tira);
  box.appendChild(el);
  while (box.children.length > (innerWidth < 560 ? 3 : 5)) box.firstChild.remove();
  setTimeout(tira, sub ? 4600 : 3400);
  el.style.setProperty('--dur', (sub ? 4.6 : 3.4) + 's');
}
// ---------- Efeitos: gotas de mel voando até o pote, estrelinhas, brilho de nível ----------
let fxPtr = { x: innerWidth / 2, y: innerHeight / 2 };
addEventListener('pointerdown', e => { fxPtr = { x: e.clientX, y: e.clientY }; const b = e.target.closest && e.target.closest('.btn, .iconbtn, .tab'); if (b) fxSpark(e.clientX, e.clientY, 5, ['#fff3c4', '#ffd968', '#ffb12e'], 26); }, true);
const fxReduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function fxLayer() { let l = document.getElementById('fxl'); if (!l) { l = document.createElement('div'); l.id = 'fxl'; document.body.appendChild(l); } return l; }
function fxSpark(x, y, n, colors, dist = 60, shape = 'dot') {
  if (fxReduced() || !x) return;
  const L = fxLayer();
  for (let i = 0; i < n; i++) {
    const el = document.createElement('i'); el.className = 'fxp ' + shape;
    el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.setProperty('--c', colors[i % colors.length]);
    L.appendChild(el);
    const a = Math.random() * Math.PI * 2, d = dist * (0.5 + Math.random() * 0.7), sc = 0.6 + Math.random() * 0.8;
    el.animate([{ transform: `translate(-50%,-50%) scale(${sc})`, opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d - 10}px)) scale(0) rotate(${(Math.random() - 0.5) * 360}deg)`, opacity: 0.2 }],
      { duration: 520 + Math.random() * 300, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => el.remove();
  }
}
function fxHoney(x, y, n, sel = '.res.gold') {
  const tg = document.querySelector(sel);
  if (!tg || fxReduced() || !x) return;
  const r = tg.getBoundingClientRect(), tx = r.left + 18, ty = r.top + r.height / 2, L = fxLayer();
  n = Math.max(1, Math.min(10, n));
  for (let i = 0; i < n; i++) {
    const el = document.createElement('i'); el.className = 'fxp drop' + (sel === '.res.food' ? ' food' : '');
    el.style.left = x + 'px'; el.style.top = y + 'px'; L.appendChild(el);
    const sx = (Math.random() - 0.5) * 70, sy = -30 - Math.random() * 50, dx = tx - x, dy = ty - y;
    const an = el.animate([
      { transform: 'translate(-50%,-50%) scale(.4)', opacity: 1 },
      { transform: `translate(calc(-50% + ${sx}px), calc(-50% + ${sy}px)) scale(1.1)`, opacity: 1, offset: 0.3 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.55)`, opacity: 0.9 }],
      { duration: 650 + i * 55, delay: i * 35, easing: 'cubic-bezier(.45,0,.55,1)', fill: 'both' });
    an.onfinish = () => { el.remove(); sfx('gota'); tg.classList.remove('bump'); void tg.offsetWidth; tg.classList.add('bump'); };
  }
}
function fxLevel(text) {
  if (fxReduced()) return;
  const L = fxLayer(), el = document.createElement('div'); el.className = 'fxlvl'; el.innerHTML = `<span>${text}</span>`; L.appendChild(el);
  setTimeout(() => el.remove(), 1700);
  fxSpark(innerWidth / 2, innerHeight * 0.42, 22, ['#fff3c4', '#ffd968', '#ffb12e', '#ff8fb8'], 220, 'star');
}
function floatText(txt, x, y, color) {
  const el = document.createElement('div');
  el.className = 'float'; el.textContent = txt;
  el.style.left = (x - 20) + 'px'; el.style.top = (y - 20) + 'px';
  if (color) el.style.color = color;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}
function dIcon(els, rar, size = 'm', extra = '', seed, skin) {
  if (seed === undefined) seed = els.join('').length * 7 + rar.charCodeAt(0);
  return `<span class="dic ${size} r-${rar} ${extra}" data-sk="${'d:' + els.join('+') + rar + skinKey(skin)}" data-seed="${seed}">${dragonSVG(els, rar, seed, skin)}<span class="els">${els.map(e => EL[e].i).join('')}</span></span>`;
}
// Mistura uma cor hex com preto (f < 0) ou branco (f > 0)
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(c => Math.round(f < 0 ? c * (1 + f) : c + (255 - c) * f));
  return '#' + ch.map(c => c.toString(16).padStart(2, '0')).join('');
}
const RING = { C: '#b9b3cc', R: '#4fb3ff', E: '#c77dff', L: '#ffb703', B: '#ff3b3b' };
// Gradientes e padrões compartilhados por todos os desenhos (um <svg> oculto no topo da página)
function buildDefs() {
  const stops = arr => arr.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op !== undefined ? ` stop-opacity="${op}"` : ''}/>`).join('');
  const lg = (id, arr, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops(arr)}</linearGradient>`;
  const rg = (id, arr, cx = '50%', cy = '50%', r = '50%') => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops(arr)}</radialGradient>`;
  let d = '';
  EL_KEYS.forEach(k => {
    const c = EL[k].c;
    d += lg(`gb-${k}`, [[0, shade(c, 0.38)], [0.5, c], [1, shade(c, -0.38)]]);
    d += lg(`gw-${k}`, [[0, shade(c, 0.32)], [1, shade(c, -0.3)]], 1, 1);
    d += lg(`gl-${k}`, [[0, shade(c, 0.78)], [1, shade(c, 0.42)]]);
  });
  d += rg('g-shadow', [[0, '#000', 0.5], [1, '#000', 0]]);
  d += lg('g-horn', [[0, '#fffaf0'], [1, '#c9b07e']]);
  d += lg('g-gold', [[0, '#fff3b0'], [1, '#e0950f']]);
  d += rg('g-auraL', [[0, '#ffd166', 0.55], [1, '#ffd166', 0]]);
  d += rg('g-eye', [[0, '#ffffff'], [1, '#d9e1f2']], '40%', '35%');
  d += rg('g-sea', [[0, '#e3a547'], [0.45, '#bd7424'], [1, '#6b370c']], '50%', '48%', '72%');
  d += lg('g-grass', [[0, '#9be06a'], [1, '#4c9f3a']], 1, 1);
  d += lg('g-sand', [[0, '#f7d98a'], [1, '#d9a447']]);
  d += lg('g-cliffL', [[0, '#d9973a'], [1, '#7a420f']]);
  d += lg('g-cliffM', [[0, '#c4842c'], [1, '#69380c']]);
  d += lg('g-cliffR', [[0, '#a96d22'], [1, '#55300c']]);
  d += `<pattern id="p-comb" width="14" height="12" patternUnits="userSpaceOnUse"><path d="M0,3 L3.5,0 L10.5,0 L14,3 M3.5,12 L0,9 M10.5,12 L14,9 M0,3 L0,9 M14,3 L14,9 M3.5,6 L10.5,6" stroke="#5a2f08" stroke-width="1.1" fill="none" opacity=".55"/></pattern>`;
  d += `<pattern id="p-honey" width="160" height="90" patternUnits="userSpaceOnUse"><ellipse cx="40" cy="25" rx="30" ry="6" fill="#ffd07a" opacity=".18"/><ellipse cx="120" cy="70" rx="24" ry="5" fill="#ffd07a" opacity=".14"/><ellipse cx="100" cy="20" rx="10" ry="2.5" fill="#fff0c8" opacity=".25"/></pattern>`;
  d += rg('g-lava', [[0, '#fff3a0'], [0.45, '#ff9a1f'], [1, '#b8290b']]);
  d += rg('g-water', [[0, '#c9f3ff'], [0.5, '#52bdf2'], [1, '#1d6aa8']], '40%', '35%');
  d += lg('g-stone', [[0, '#f1ebdb'], [1, '#b3a483']]);
  d += lg('g-wood', [[0, '#c99358'], [1, '#76502c']]);
  d += lg('g-leaf', [[0, '#8fe070'], [1, '#2c7f37']]);
  d += lg('g-pine', [[0, '#5cbf6a'], [1, '#1f6b3a']]);
  d += lg('g-wax', [[0, '#fff0c0'], [0.5, '#f2c25a'], [1, '#c98a2c']], 1, 0);
  d += rg('g-pot', [[0, '#f0a868'], [0.6, '#c06a2c'], [1, '#7a3a14']], '35%', '35%', '70%');
  d += lg('g-crystal', [[0, '#f0d9ff'], [1, '#7436c9']]);
  d += lg('g-ice', [[0, '#ffffff'], [1, '#93d4fb']]);
  d += lg('g-steel', [[0, '#eef2f7'], [1, '#7f8a9c']]);
  d += lg('g-mount', [[0, '#e3b8ff'], [1, '#8a4fc0']]);
  d += lg('g-dome', [[0, '#fffaf0'], [1, '#e9d3a6']], 1, 1);
  d += lg('g-roof', [[0, '#ff7b6b'], [1, '#c43d3d']]);
  d += `<pattern id="p-grass" width="26" height="13" patternUnits="userSpaceOnUse"><path d="M3,10 l1.6,-4.5 l1.6,4.5 M15,5 l1.3,-3.4 l1.3,3.4 M21,12 l1.1,-3 l1.1,3" stroke="#3a8a2f" stroke-width="1.2" fill="none" opacity=".55"/></pattern>`;
  d += `<pattern id="p-cobble" width="16" height="9" patternUnits="userSpaceOnUse"><rect width="16" height="9" fill="#c48a34"/><polygon points="1,2.2 3,0.6 6.4,0.6 8.4,2.2 6.4,3.8 3,3.8" fill="#f3c86a"/><polygon points="9,6.6 11,5 14.4,5 16.4,6.6 14.4,8.2 11,8.2" fill="#eab955"/></pattern>`;
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>${d}</defs></svg>`;
}
document.body.insertAdjacentHTML('afterbegin', buildDefs());
const dgCache = new Map();
// Abelha desenhada em SVG (viewBox 120x100, olhando para a direita): reserva para quando não há WebGL.
// Partes animadas por CSS: .all (flutuar), .wing (bater asas) e .eye (piscar).
function dragonSVG(els, rar, seed = 0, skin) {
  if (!sprOff) { const u = dragonSprite(els, rar, skin); return u ? spriteSVG(u, rar, seed) : placeholderSVG(rar); }
  const key = els.join('+') + rar + (seed % 9);
  if (dgCache.has(key)) return dgCache.get(key);
  const vespa = (rar === 'L' || rar === 'B') && els[0] === 'trevas' && els[1] === 'fogo';
  const e1 = els[0] || 'fogo', e2 = els[1] || e1;
  const c1 = vespa ? '#ff8a1f' : EL[e1].c, c2 = vespa ? '#2b1a33' : EL[e2].c, ink = '#1b1230', st = '#2a1a12';
  const dl = -((seed * 0.37) % 2).toFixed(2), big = { C: 1, R: 1.08, E: 1.1, L: 1.16, B: 1.25 }[rar];
  let g = `<svg class="dg" viewBox="-6 -8 132 108" style="--dl:${dl}s" aria-hidden="true">`;
  g += `<ellipse class="shadow" cx="64" cy="93" rx="34" ry="7" fill="url(#g-shadow)"/>`;
  g += `<ellipse class="base" cx="64" cy="93" rx="30" ry="4.5" fill="none" stroke="${RING[rar]}" stroke-width="2.2" opacity=".8"/>`;
  if (rar === 'L') g += `<circle class="aura" cx="62" cy="50" r="56" fill="url(#g-auraL)"/>`;
  g += `<g class="all" transform="translate(60 52) scale(${big}) translate(-60 -52)">`;
  g += `<g class="wing"><ellipse cx="50" cy="22" rx="12" ry="20" transform="rotate(-25 50 40)" fill="#ffffff" fill-opacity=".6" stroke="${ink}" stroke-width="2"/><ellipse cx="40" cy="28" rx="8" ry="14" transform="rotate(-50 44 42)" fill="#ffffff" fill-opacity=".5" stroke="${ink}" stroke-width="2"/></g>`;
  g += `<path d="M22,56 L8,62 L22,64Z" fill="${ink}"/>`;
  g += `<ellipse cx="40" cy="56" rx="24" ry="20" fill="${c1}" stroke="${ink}" stroke-width="2.4"/>`;
  g += [30, 42].map(x => `<path d="M${x},38 Q${x - 6},56 ${x},74" stroke="${vespa ? ink : st}" stroke-width="7" fill="none"/>`).join('');
  g += `<circle cx="64" cy="54" r="13" fill="${shade(c2, 0.45)}" stroke="${ink}" stroke-width="2.2"/>`;
  g += `<circle cx="84" cy="46" r="20" fill="${vespa ? c2 : c1}" stroke="${ink}" stroke-width="2.4"/>`;
  g += `<path d="M76,26 Q72,12 64,8 M88,26 Q90,12 98,8" stroke="${ink}" stroke-width="2" fill="none"/><circle cx="64" cy="8" r="3.5" fill="${c2}" stroke="${ink}" stroke-width="1.5"/><circle cx="98" cy="8" r="3.5" fill="${c2}" stroke="${ink}" stroke-width="1.5"/>`;
  g += `<g class="eye"><ellipse cx="91" cy="42" rx="6" ry="7.5" fill="#fff" stroke="${ink}" stroke-width="1.6"/><ellipse cx="93" cy="43" rx="3.4" ry="4.6" fill="${vespa ? '#ff2a2a' : ink}"/><circle cx="94.5" cy="40.5" r="1.4" fill="#fff"/></g>`;
  g += `<path d="M88,56 Q94,60 100,54" stroke="${ink}" stroke-width="1.8" fill="none"/><ellipse cx="82" cy="54" rx="4" ry="2.4" fill="#ff8fa8" opacity=".55"/>`;
  g += [52, 60, 68].map(x => `<path d="M${x},70 l2,12" stroke="${st}" stroke-width="2.4" stroke-linecap="round"/>`).join('');
  if (rar === 'L') g += `<path d="M74,28 l3,-9 l5,6 l4,-8 l4,8 l5,-6 l2,9Z" fill="${vespa ? '#7a2a8a' : 'url(#g-gold)'}" stroke="${ink}" stroke-width="1.6"/>`;
  g += `</g></svg>`;
  dgCache.set(key, g);
  return g;
}
// ---------- Sprites 3D ----------
// Os modelos 3D (M3) são renderizados aos poucos em segundo plano e guardados como imagens (blob URL).
// Enquanto um sprite não fica pronto, o jogo usa o desenho SVG como reserva. Sem WebGL, fica tudo em SVG.
const SPR = new Map(), ISO = {}, SPR_Q = [];
let sprBusy = false, sprOff = !M3;
function sprJob(key, make, front) {
  if (sprOff) return;
  if (SPR.has(key)) {
    // já na fila: um pedido urgente passa para a frente
    const i = front && SPR.get(key) === 1 ? SPR_Q.findIndex(j => j.key === key) : -1;
    if (i > 0) SPR_Q.unshift(SPR_Q.splice(i, 1)[0]);
    return;
  }
  SPR.set(key, 1);
  (front ? SPR_Q.unshift : SPR_Q.push).call(SPR_Q, { key, make });
  pumpSprites();
}
function pumpSprites() {
  if (sprBusy || sprOff || !SPR_Q.length) return;
  if (!M3.ready) { if (!pumpSprites.wait) pumpSprites.wait = M3.load.then(pumpSprites); return; }
  sprBusy = true;
  const job = SPR_Q.shift();
  let r;
  try { r = job.make(); } catch (e) { sprOff = true; sprBusy = false; return; }
  const cv = document.createElement('canvas'); cv.width = r.canvas.width; cv.height = r.canvas.height;
  cv.getContext('2d').drawImage(r.canvas, 0, 0);
  cv.toBlob(b => {
    if (b) { const u = URL.createObjectURL(b); SPR.set(job.key, u); if (r.w) ISO[job.key] = { u, w: r.w, h: r.h, ax: r.ax, ay: r.ay }; }
    if (!S && job.key.startsWith('d:') && document.querySelector('.overlay .dg.ph') && !document.querySelector('.loading')) renderStart();
    if (S && S.choosing && !S.relicOffer && job.key.startsWith('d:') && document.querySelector('.overlay .dg.ph')) { if (S.necroOffer) renderNecro(); else if (!S.queen) renderQueens(); }
    else if (S && S.ficha && job.key.startsWith('d:') && document.querySelector('.overlay .ficha .dg.ph')) renderFicha();
    // telas de revelação (ovo chocado, roleta): troca o brilho pelo sprite assim que ele fica pronto
    if (job.key.startsWith('d:')) document.querySelectorAll('.overlay .dic').forEach(el => {
      if (el.dataset.sk !== job.key || !el.querySelector('.dg.ph')) return;
      const m = job.key.slice(2).match(/^(.*?)([CREL])(?:\|([^/]*)\/(.*))?$/);
      if (!m) return;
      const svg = el.querySelector('svg.dg');
      if (svg) svg.outerHTML = dragonSVG(m[1].split('+'), m[2], +el.dataset.seed || 0, m[3] !== undefined ? { hat: m[3] || null, wing: m[4] || null } : undefined);
    });
    sprBusy = false;
    setTimeout(pumpSprites, 20);
  });
}
function skinKey(sk) { return sk && (sk.hat || sk.wing) ? `|${sk.hat || ''}/${sk.wing || ''}` : ''; }
function dragonSprite(els, rar, skin) {
  const k = 'd:' + els.join('+') + rar + skinKey(skin), v = SPR.get(k);
  if (typeof v === 'string') return v;
  sprJob(k, () => ({ canvas: rar === 'B' && window.Cutscene && Cutscene.vespa ? bossStrip(els) : M3.dragonStrip(els, rar, skin) }), true);
  return null;
}
// v8.3: chefes da batalha usam o mesmo desenho detalhado da vespa das cutscenes (8 quadros batendo as asas)
function bossStrip(els) {
  const fw = M3.FW, fh = M3.FH, n = M3.NF, cv = document.createElement('canvas');
  cv.width = fw * n; cv.height = fh;
  const c = cv.getContext('2d'), tipo = ({ 'fogo+metal': 'general', 'luz+trevas': 'imperatriz', 'trevas+luz': 'imperatriz' })[els.join('+')] || 'rainha';
  const s = Math.min((fw - 6) / 550, (fh - 6) / 456), y = 3 + (tipo === 'imperatriz' ? 180 : 164) * s + (fh - 6 - (275 + (tipo === 'imperatriz' ? 180 : 164)) * s);
  for (let i = 0; i < n; i++) Cutscene.vespa(c, fw * i + fw / 2, y + Math.sin(i / n * Math.PI * 2) * 2, s, i / n * Math.PI * 4 / 3, { tipo });
  return cv;
}
const DECO_KINDS = ['moita', 'ponte', 'morro', 'tufo', 'tufo2', 'gotas', 'potmel', 'vela', 'polen', 'polen2', 'favo', 'flores', 'girassol', 'skep', 'lanterna', 'fonte', 'arbusto', 'carga', 'pedras'];
const isoKeys = () => ['arena', 'cruzar', 'loja', 'missoes', 'farm', 'roleta', ...Object.keys(HAB_THEME).map(t => 'habitat:' + t), ...DECO_KINDS.map(k => 'deco:' + k)];
function warmSprites() {
  if (sprOff) return;
  isoKeys().forEach(k => { const [n, a] = k.split(':'); sprJob('i:' + k, () => a === undefined ? M3.iso(n) : M3.iso(n, n === 'tree' ? +a : a)); });
  ALL_SPECIES.forEach(sp => { const k = 'd:' + sp.els.join('+') + sp.rar; sprJob(k, () => ({ canvas: M3.dragonStrip(sp.els, sp.rar) })); });
}
// Imagem de um modelo isométrico ancorada no ponto (X, Y) do mapa; null se ainda não estiver pronta
function isoImg(k, X, Y) {
  const r = ISO['i:' + k];
  return r ? `<image href="${r.u}" x="${(X - r.ax).toFixed(1)}" y="${(Y - r.ay).toFixed(1)}" width="${r.w}" height="${r.h}" pointer-events="none"/>` : null;
}
// Dragão em sprite: tira de 8 quadros trocados por SMIL (funciona dentro do mapa e nas cartas)
const spCache = new Map();
function spriteSVG(u, rar, seed) {
  const key = u + rar + (seed % 9);
  if (spCache.has(key)) return spCache.get(key);
  const dl = -((seed * 0.37) % 2).toFixed(2), fw = M3.FW, n = M3.NF, dur = 0.96;
  const vals = Array.from({ length: n }, (_, i) => -i * fw).join(';');
  let g = `<svg class="dg" viewBox="-6 -8 132 108" style="--dl:${dl}s" aria-hidden="true">`;
  g += `<ellipse class="shadow" cx="64" cy="93" rx="36" ry="7" fill="url(#g-shadow)"/>`;
  g += `<ellipse class="base" cx="64" cy="93" rx="30" ry="4.5" fill="none" stroke="${RING[rar]}" stroke-width="2.2" opacity=".8"/>`;
  if (rar === 'L') g += `<circle class="aura" cx="62" cy="50" r="56" fill="url(#g-auraL)"/>`;
  g += `<g class="all"><svg x="${SPR_BOX[0]}" y="${SPR_BOX[1]}" width="${SPR_BOX[2]}" height="${SPR_BOX[3]}" viewBox="0 0 ${fw} ${M3.FH}" overflow="hidden"><image href="${u}" width="${fw * n}" height="${M3.FH}"><animate attributeName="x" values="${vals}" dur="${dur}s" calcMode="discrete" repeatCount="indefinite" begin="${(-((seed * 0.29) % dur)).toFixed(2)}s"/></image></svg></g></svg>`;
  spCache.set(key, g);
  return g;
}
const SPR_BOX = [-13, -6, 144, 120];
// Enquanto o modelo 3D do dragão não fica pronto: só a sombra, o anel e um brilho pulsando (nunca o desenho antigo)
function placeholderSVG(rar) {
  return `<svg class="dg ph" viewBox="-6 -8 132 108" aria-hidden="true"><ellipse cx="64" cy="93" rx="36" ry="7" fill="rgba(0,0,0,.3)"/>`
    + `<ellipse cx="64" cy="93" rx="30" ry="4.5" fill="none" stroke="${RING[rar]}" stroke-width="2.2" opacity=".6"/>`
    + `<ellipse class="phglow" cx="64" cy="58" rx="22" ry="28" fill="${RING[rar]}" opacity=".25"/></svg>`;
}
// Tela de carregamento: espera os modelos da ilha e os dragões da tela inicial antes de mostrar o jogo
function loadingThen(done) {
  const need = ['d:fogoR', 'd:luz+trevasL', 'd:agua+plantaE', ...isoKeys().map(k => 'i:' + k)];
  const t0 = performance.now();
  overlay(`<div class="loading"><h1>Honey Troop</h1><p>Acordando o enxame…</p><div class="bar gold"><i id="ldbar" style="width:0%"></i></div></div>`);
  ['fogo', 'luz+trevas', 'agua+planta'].forEach((e, i) => dragonSprite(e.split('+'), 'RLE'[i]));
  const chk = () => {
    const ok = need.filter(k => typeof SPR.get(k) === 'string').length;
    const b = document.getElementById('ldbar'); if (b) b.style.width = Math.round(ok / need.length * 100) + '%';
    if (sprOff || ok === need.length || performance.now() - t0 > 25000) done(); else setTimeout(chk, 150);
  };
  chk();
}
const elTags = els => els.map(e => `${EL[e].i} ${EL[e].n}`).join(' · ');
const costTag = (n, kind = 'g') => `<span class="cost ${kind}">${kind === 'g' ? '🪙' : kind === 'f' ? '🍖' : '💎'} ${fmt(n)}</span>`;

const TABS = [
  ['ilha', '🏝️', 'Ilha'], ['dragoes', '🐉', 'Abelhas'], ['cruzar', '🧪', 'Laboratório'], ['chocadeira', '🎯', 'Roleta'], ['arena', '⚔️', 'Arena'],
  ['missoes', '📜', 'Missões'], ['loja', '🛒', 'Loja'], ['conquistas', '🏆', 'Conquistas'], ['stats', '📊', 'Estatísticas'], ['jardim', '🌱', 'Jardim', 1], ['torre', '🗼', 'Torre da Ascensão', 1],
];
const TAB_TITLE = Object.fromEntries(TABS.map(t => [t[0], t[2]]));
let lastTop = '', lastTabs = '', lastView = '', lastMap = '', lastHud = '', mapCentered = false;
function render(force) {
  if (!S) return;
  if (force) { lastTop = lastTabs = lastView = lastMap = lastHud = ''; }
  const top = renderTop();
  if (top !== lastTop) { morph($('#top'), top); lastTop = top; }
  const tabs = renderTabs();
  if (tabs !== lastTabs) { morph($('#tabs'), tabs); lastTabs = tabs; }
  const map = viewMap();
  if (map !== lastMap) {
    morph($('#map'), map); lastMap = map; startFlights();
    if (!W3) map3dInit();
    if (!mapCentered) { const w = $('#mapwrap'); w.scrollLeft = (w.scrollWidth - w.clientWidth) / 2; mapCentered = true; }
  }
  const hud = viewHud();
  if (hud !== lastHud) { morph($('#hud'), hud); lastHud = hud; }
  const view = S.tab === 'ilha' ? '' : `<div class="sheet-back" data-a="tab" data-k="ilha"></div><section class="sheet" role="dialog" aria-label="${TAB_TITLE[S.tab]}" data-tab="${S.tab}" data-lg="${arenaLg()}">
    <header><h2><span class="hic">${TABS.find(t => t[0] === S.tab)[1]}</span>${TAB_TITLE[S.tab]}</h2><button class="btn xbtn" data-a="tab" data-k="ilha" aria-label="Fechar" title="Fechar">✕</button></header>
    <div class="sheet-body">${tabTip()}${renderView()}</div></section>`;
  if (view !== lastView) {
    morph($('#sheet'), view); lastView = view;
    if (S.tab === 'stats') drawChart();
    animReel();
    const log = document.querySelector('.log'); if (log) log.scrollTop = log.scrollHeight;
  }
  renderLostEgg();
}
// Cenário da arena: um por liga; a invasão final e o Ancestral têm o seu.
function arenaLg() {
  if (S.finalPhase || (S.battle && (S.battle.kind === 'final' || S.battle.kind === 'boss'))) return 'final';
  return Math.min(S.league, 9);
}
function renderTop() {
  const left = invadeAt() - S.t;
  const hurry = left < 60;
  const buffs = [];
  if (S.buffs.chuva > S.t) buffs.push(`🌧️ Mel x2 · ${Math.ceil(S.buffs.chuva - S.t)}s`);
  if (S.buffs.colheita > S.t) buffs.push(`🌻 Flores x3 · ${Math.ceil(S.buffs.colheita - S.t)}s`);
  if (S.buffs.frio > S.t) buffs.push(`❄️ Colmeias frias · ${Math.ceil(S.buffs.frio - S.t)}s`);
  if (S.buffs.doente > S.t) buffs.push(`🤒 Rainha doente · ${Math.ceil(S.buffs.doente - S.t)}s`);
  if (S.buffs.rachado > S.t) buffs.push(`🧱 Favo vazando · ${Math.ceil(S.buffs.rachado - S.t)}s`);
  if (S.raid) buffs.push(`${RIVALS[S.rival].i} Invasão · ${Math.max(0, Math.ceil(S.raid.until - S.t))}s`);
  if (S.event && S.event.until > S.t && ['selvagem', 'mercador'].includes(S.event.type)) buffs.push(`${EVENTS[S.event.type].i} ${EVENTS[S.event.type].n} · ${Math.ceil(S.event.until - S.t)}s`);
  return `<div class="wrap">
    <div class="brand">🐉 Honey Troop</div>
    <div class="res gold" title="Mel"><span>🪙</span><b class="num">${fmt(S.gold)}</b><small class="num">+${fmt(totalGps())}/s</small></div>
    <div class="res food" title="Néctar"><span>🍖</span><b class="num">${fmt(S.food)}</b></div>
    <div class="res gem" title="Geleia real"><span>💎</span><b class="num">${fmt(S.gems)}</b></div>
    <div class="res crys" title="Cristais do Laboratório" data-a="tab" data-k="cruzar"><span>💠</span><b class="num">${S.crystals || 0}</b></div>
    <div class="lvl" title="Nível do jogador"><span>Nível ${S.level} <span class="muted num">${S.level >= MAX_PLVL ? 'máx.' : `${fmt(S.xp)}/${fmt(xpNeed(S.level))} XP`}</span></span><div class="bar"><i style="width:${S.level >= MAX_PLVL ? 100 : pct(S.xp, xpNeed(S.level))}%"></i></div></div>
    <div class="timer num ${hurry ? 'hurry' : ''}" title="${bossName()} ataca quando o tempo acabar">☠️ ${S.finalPhase ? 'ATAQUE!' : fmtTime(left)}${S.mode === 'infinito' ? ` · onda ${S.wave + 1}` : isActs() ? ` · ${curAct().n}` : ''}</div>
    ${isTouch() && !nativeApp() ? `<button class="iconbtn fsbtn" data-a="fsToggle" title="${isFs() ? 'Sair da tela cheia' : 'Tela cheia'}" aria-label="${isFs() ? 'Sair da tela cheia' : 'Tela cheia'}">${isFs() ? FS_OFF : FS_ON}</button>` : ''}
    <button class="iconbtn" data-a="pause">Pausar</button>
    <button class="iconbtn" data-a="askEnd">Encerrar</button>
    ${buffs.length ? `<div class="buffs">${buffs.map(b => `<span class="buff">${b}</span>`).join('')}</div>` : ''}
  </div>`;
}
function renderTabs() {
  const claim = S.missions.filter(m => missionProg(m) >= m.target).length;
  const readyEggs = (S.t >= S.freeAt ? 1 : 0) + S.tickets;
  const badges = { missoes: claim, chocadeira: readyEggs };
  return TABS.filter(t => !t[3]).map(([k, ic, n]) => `<button class="tab" aria-selected="${S.tab === k}" data-a="tab" data-k="${k}"><span class="ic">${ic}</span>${n}${badges[k] ? `<span class="badge">${badges[k]}</span>` : ''}</button>`).join('');
}
function renderView() {
  switch (S.tab) {
    case 'chocadeira': return swTabs() + (S.swTab === 'up' ? viewUpgrade() : viewSwarm());
    case 'dragoes': return viewDragons();
    case 'cruzar': return viewLab();
    case 'torre': return viewTower();
    case 'arena': return viewArena();
    case 'missoes': return viewMissions();
    case 'loja': return viewShop();
    case 'conquistas': return viewAch();
    case 'stats': return viewStats();
    case 'jardim': return viewGarden();
  }
  return '';
}
// Ovo em SVG, com as cores dos elementos da espécie, deitado num ninho de palha.
function eggSVG(sp, id, ready) {
  const nestBack = '<ellipse cx="60" cy="82" rx="52" ry="17" fill="#6e4418" stroke="#1b1230" stroke-width="3"/>';
  const straw = [14, 26, 40, 54, 68, 82, 96, 106].map((x, i) => `<path d="M${x},${86 + (i % 3) * 3} l${i % 2 ? 9 : -8},${-6 - (i % 2) * 3}" stroke="#f2cf6e" stroke-width="2.5" stroke-linecap="round"/>`).join('');
  const nestFront = `<path d="M6,80 C10,104 110,104 114,80 C100,96 20,96 6,80Z" fill="#c9922e" stroke="#1b1230" stroke-width="3"/>${straw}`;
  if (!sp) return `<svg class="nest" viewBox="0 0 120 104" aria-hidden="true">${nestBack}<ellipse cx="60" cy="80" rx="40" ry="10" fill="#3d2410"/>${nestFront}</svg>`;
  const c1 = EL[sp.els[0]].c, c2 = EL[sp.els[1] || sp.els[0]].c;
  const ring = { C: '#1b1230', R: '#1b1230', E: '#1b1230', L: '#1b1230' }[sp.rar];
  const spots = [[48, 40, 7], [70, 52, 9], [52, 66, 6], [74, 30, 5], [42, 56, 4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c2}" stroke="#1b1230" stroke-width="1.5" opacity=".9"/>`).join('');
  const bling = sp.rar === 'L' ? '<path d="M24,22 l3,7 l7,3 l-7,3 l-3,7 l-3,-7 l-7,-3 l7,-3Z M96,34 l2,5 l5,2 l-5,2 l-2,5 l-2,-5 l-5,-2 l5,-2Z" fill="#fff6a8" class="shine"/>' : sp.rar === 'E' ? '<path d="M96,30 l2,5 l5,2 l-5,2 l-2,5 l-2,-5 l-5,-2 l5,-2Z" fill="#e8c8ff" class="shine"/>' : '';
  return `<svg class="nest" viewBox="0 0 120 104" aria-hidden="true"><defs><radialGradient id="eg${id}" cx=".38" cy=".3" r=".75"><stop offset="0" stop-color="#fff"/><stop offset=".28" stop-color="${c1}"/><stop offset="1" stop-color="${c1}" stop-opacity="1"/></radialGradient></defs>
    ${ready ? '<ellipse cx="60" cy="54" rx="50" ry="46" fill="#ffe066" opacity=".35" class="shine"/>' : ''}${nestBack}
    <g class="eg"><path d="M60,12 C86,12 92,56 90,68 C88,86 75,92 60,92 C45,92 32,86 30,68 C28,56 34,12 60,12Z" fill="url(#eg${id})" stroke="${ring}" stroke-width="3"/>${spots}
    <path d="M60,92 C45,92 32,86 30,68 C40,82 80,82 90,68 C88,86 75,92 60,92Z" fill="#000" opacity=".18"/><ellipse cx="48" cy="28" rx="7" ry="10" fill="#fff" opacity=".55" transform="rotate(-20 48 28)"/></g>
    ${nestFront}${bling}</svg>`;
}
// Upgrade (aba da Roleta): paga mel e tenta subir a abelha para a próxima raridade.
// Deu certo: vira uma abelha da raridade nova, mantendo nível, mutação, visual e histórico. Deu errado: só perde o mel.
const UPG = { C: { to: 'R', p: 0.5, k: 1 }, R: { to: 'E', p: 0.3, k: 2.5 }, E: { to: 'L', p: 0.15, k: 6 } }; // v8.1: bem mais barato (era 3, 8 e 20 giros)
const upgCost = d => Math.round(spinCost() * UPG[d.rar].k / 5) * 5;
function swTabs() {
  return `<div class="stabs"><button class="stab" aria-pressed="${S.swTab !== 'up'}" data-a="swTab" data-k="roleta">🎯 Roleta</button><button class="stab" aria-pressed="${S.swTab === 'up'}" data-a="swTab" data-k="up">⬆️ Upgrade</button></div>`;
}
function tryUpgrade(id) {
  const d = S.dragons.find(x => x.id === id), U = d && UPG[d.rar];
  if (!U || (S.upRoll && S.upRoll.until > performance.now() && S.upRoll.until - performance.now() < 3000)) return;
  const pool = swarmPool().filter(sp => sp.rar === U.to);
  if (!pool.length) { toast('Ainda não dá', `Nenhuma abelha ${RARITY[U.to].n} liberada para o seu nível.`, 'bad'); return; }
  if (!spendGold(upgCost(d))) return;
  const ok = Math.random() < U.p, pos = ok ? Math.random() * U.p : U.p + Math.random() * (1 - U.p);
  S.stats.upTries = (S.stats.upTries || 0) + 1;
  const from = { name: d.name, rar: d.rar };
  if (ok) {
    const sp = pick(pool), old = ALL_SPECIES.find(x => x.key === d.key);
    if (!old || d.name === old.name) d.name = sp.name;
    Object.assign(d, { key: sp.key, els: sp.els.slice(), rar: sp.rar });
    d.lvl = Math.min(d.lvl, MAX_DLVL);
    if (!S.dex[sp.key]) S.dex[sp.key] = S.t || 0.01;
    S.stats.upWins = (S.stats.upWins || 0) + 1;
    if (sp.rar === 'L') S.stats.upLegend = (S.stats.upLegend || 0) + 1;
    if (sp.rar === 'L' && S.stats.firstLegendT === null) S.stats.firstLegendT = S.t;
  }
  S.upRoll = { id, ok, pos, p: U.p, from, to: U.to, until: performance.now() + 1700, n: (S.upRoll ? S.upRoll.n : 0) + 1 };
  sfx('tique');
  setTimeout(() => { if (ok) { sfx('revelacao', { raridade: RAR_SOM[U.to] }); toast(`⬆️ Deu certo! ${d.name}`, `Agora é ${RARITY[U.to].n}.`, 'ach'); } else { sfx('erro'); toast('Não foi dessa vez', `${from.name} continua ${RARITY[from.rar].n}.`, 'bad'); } render(); }, 1700);
}
function viewUpgrade() {
  const d = S.dragons.find(x => x.id === S.upSel && UPG[x.rar]);
  const bees = S.dragons.filter(x => UPG[x.rar]).sort((a, b) => RARITY[b.rar].rv - RARITY[a.rar].rv || b.lvl - a.lvl);
  const chips = bees.length ? bees.map(x => `<button class="chip" aria-pressed="${d && x.id === d.id}" data-a="upSel" data-id="${x.id}">${dIcon(x.els, x.rar, 's', '', x.id, x.skin)}${x.name} · <span class="rar-${x.rar}">${RARITY[x.rar].n}</span> · Nv ${x.lvl}</button>`).join('') : '<p class="hint">Todas as suas abelhas já são Lendárias.</p>';
  // o relógio (performance.now) recomeça ao recarregar a página: um sorteio salvo antes não pode travar o botão
  const R = S.upRoll, rolling = R && R.until > performance.now() && R.until - performance.now() < 3000;
  let box = '<p class="hint">Escolha uma abelha abaixo.</p>';
  if (d) {
    const U = UPG[d.rar], c = upgCost(d), ok = S.gold >= c;
    const bar = R && R.id === d.id ? R : null;
    box = `<div class="up-box">
      <div class="up-pair">${dIcon(d.els, d.rar, 'l', '', d.id, d.skin)}<div><b>${d.name}</b><span class="hint"><span class="rar-${d.rar}">${RARITY[d.rar].n}</span> ➜ <span class="rar-${U.to}">${RARITY[U.to].n}</span></span></div></div>
      <div class="up-bar"><div class="up-win" style="width:${U.p * 100}%"></div>${bar ? `<div class="up-mark" style="--to:${(bar.pos * 100).toFixed(1)}%" data-n="${bar.n}"></div>` : ''}</div>
      <p class="hint">Chance: <b class="num">${Math.round(U.p * 100)}%</b>. Se der certo, ela vira uma abelha ${RARITY[U.to].n} sorteada e mantém nível, mutação, visual e histórico. Se der errado, só o mel é gasto.</p>
      <button class="btn go big" data-a="upTry" data-id="${d.id}" ${ok && !rolling ? '' : 'disabled'}>${rolling ? 'Sorteando…' : `Tentar upgrade ${costTag(c)}`}</button>
    </div>`;
  }
  return `<div class="grid"><section class="panel" style="grid-column:1/-1"><div class="panel-head"><h2>Upgrade de abelha</h2><span class="hint">Comum ➜ Rara 50% · Rara ➜ Épica 30% · Épica ➜ Lendária 15%</span></div>
    ${box}<div class="chips">${chips}</div></section></div>`;
}
function viewSwarm() {
  const W = S.wheel, spinning = W && W.until > performance.now();
  const sls = swSlices();
  const grad = sls.map(x => `${SW_COL[x.k]} ${x.a0}deg ${x.a1}deg`).join(', ');
  const ico = { C: '🐉', R: '🔷', E: '🔮', L: '🌟' };
  const labels = sls.map(x => `<span class="wl" style="transform:rotate(${(x.a0 + x.a1) / 2}deg) translateY(-34%)"><span>${ico[x.k]}</span></span>`).join('');
  const cost = spinCost(), free = S.t >= S.freeAt, f = swarmFeat();
  const odds = ['C', 'R', 'E', 'L'].map(k => `<span><b class="rar-${k}">${RARITY[k].n}</b> <b class="num">${String(Math.round(SWARM.odds[k] * 1000) / 10).replace('.', ',')}%</b></span>`).join('');
  const pool = swarmPool(), got = pool.filter(sp => S.dex[sp.key]).length;
  const res = W && W.done && S.swRes ? S.swRes : null;
  return `<div class="grid">
    <section class="panel" style="grid-column:1/-1">
      <div class="swwrap2">
        ${reelHTML()}
        <div class="wheel-side">
          <h2 class="wheel-t">${W && W.love && spinning ? 'Giro do Amor' : 'Roleta do Enxame'}</h2>
          <p class="hint swdesc" style="margin:0">Toda abelha nova vem daqui. Só aparece o nome das abelhas que você já tem. Repetida faz a sua subir de nível.</p>
          <div class="wprizes">${odds}</div>
          <div class="sw-pity"><span>🔮 Épica garantida em <b class="num">${Math.max(1, SWARM.pityE - S.pityE)}</b> giro(s)</span><span>🌟 Lendária garantida em <b class="num">${Math.max(1, SWARM.pityL - S.pityL)}</b></span>${S.luck ? `<span>🍀 Sorte em <b class="num">${S.luck}</b> giro(s)</span>` : ''}</div>
          <div class="sw-btns">
            ${free ? `<button class="btn go big pulse-go" data-a="swarm" data-k="free" ${spinning ? 'disabled' : ''}>Giro grátis!</button>` : `<span class="hint">Giro grátis em ${fmtTime(S.freeAt - S.t)}</span>`}
            ${S.tickets ? `<button class="btn go" data-a="swarm" data-k="ticket" ${spinning ? 'disabled' : ''}>Usar ficha 🎯 ${S.tickets}</button>` : ''}
            ${S.tickets >= 10 ? `<button class="btn go" data-a="swarm" data-k="ticket" data-n="10" ${spinning ? 'disabled' : ''}>10 fichas</button>` : ''}
            <button class="btn primary" data-a="swarm" data-k="gold" ${spinning ? 'disabled' : ''}>Girar ${costTag(cost)}</button>
            <button class="btn primary" data-a="swarm" data-k="gold" data-n="10" ${spinning ? 'disabled' : ''}>10 giros ${costTag(cost * 9)} <span class="disc">-10%</span></button>
            <button class="btn gemb" data-a="swarm" data-k="gems" ${spinning ? 'disabled' : ''}>Giro Raro+ 💎 ${SWARM.gems}</button>
            <button class="btn gemb" data-a="swarm" data-k="gems" data-n="10" ${spinning ? 'disabled' : ''}>10 Raro+ 💎 ${SWARM.gems10}</button>
          </div>
          <p class="wres">${spinning ? 'Girando…' : res ? res.map(o => `<span class="rar-${o.sp.rar}">${o.sp.name}</span>`).slice(0, 3).join(', ') + (res.length > 3 ? ` e mais ${res.length - 3}` : '') : '&nbsp;'}</p>
        </div>
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Destaque</h2><span class="hint">Troca em ${fmtTime(Math.max(0, S.featUntil - S.t))}</span></div>
      ${f ? `<div class="sw-feat">${dIcon(f.els, f.rar, 'l', S.dex[f.key] ? '' : 'unknown', 11)}<div><b class="rar-${f.rar}">${S.dex[f.key] ? f.name : '???'}</b><p class="hint" style="margin:0">${RARITY[f.rar].n}. Quando sair essa raridade, metade das vezes vem ela.</p></div></div>` : '<p class="hint">Libere mais tipos para ter destaque.</p>'}
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Pode sair</h2><span class="muted num">${got}/${pool.length} já descobertas</span></div>
      <div class="sw-pool">${pool.map(sp => `<span class="sw-chip" title="${S.dex[sp.key] ? sp.name : '???'}">${dIcon(sp.els, sp.rar, 's', S.dex[sp.key] ? '' : 'unknown')}</span>`).join('')}</div>
      <p class="hint" style="margin:0">Novos tipos liberados no nível do jogador entram na roleta. Lendárias só saem quando os tipos delas estão liberados. Cruzar abre o Giro do Amor com os filhotes possíveis do casal.</p>
    </section>
  </div>`;
}
function viewHatchery() {
  const eggs = S.eggs.map(e => {
    const ready = e.prog >= e.dur;
    return `<div class="egg ${ready ? 'ready' : ''}">${eggSVG(e.sp, e.id, ready)}
      <b class="rar-${e.sp.rar}">${S.dex[e.sp.key] ? e.sp.name : 'Espécie desconhecida'}</b>
      <span class="muted">${RARITY[e.sp.rar].n}${e.free ? ' · bônus' : ''}</span>
      ${ready ? `<button class="btn go" data-a="hatch" data-id="${e.id}">🐣 Chocar</button>`
        : `<span class="tl num">⏳ ${Math.ceil(e.dur - e.prog)}s</span><div class="bar blue" style="width:100%"><i style="width:${pct(e.prog, e.dur)}%"></i></div><button class="btn gemb small" data-a="speed" data-id="${e.id}">Acelerar 💎 ${speedCost(e)}</button>`}
    </div>`;
  }).join('');
  const freeSlots = Math.max(0, S.hatchSlots - S.eggs.filter(e => !e.free).length);
  const empties = `<div class="egg empty">${eggSVG(null)}<span>Ninho vazio</span><button class="btn small" data-a="tab" data-k="cruzar">💞 Cruzar</button></div>`.repeat(freeSlots);
  const hc = HATCH_COSTS[S.hatchSlots - 1];
  return `<section class="panel">
    <div class="panel-head"><h2>Ninhos <span class="muted num" style="font-size:.9rem">${S.eggs.filter(e => !e.free).length}/${S.hatchSlots}</span></h2>
      <div class="row">${hc !== undefined ? `<button class="btn small primary" data-a="buyHatch">+ Ninho ${costTag(hc)}</button>` : ''}<button class="btn small" data-a="tab" data-k="cruzar">Ir para Cruzar</button></div></div>
    <div class="eggs">${eggs}${empties}</div>
    <p class="hint" style="margin:0">Um ovo pronto precisa de uma vaga livre numa colmeia para chocar.</p>
  </section>`;
}

// ============================================================
