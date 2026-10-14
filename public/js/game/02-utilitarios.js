'use strict';
// UTILITÁRIOS
// ============================================================
const $ = sel => document.querySelector(sel);
// Som: atalho seguro para o objeto global criado por audio.js
const sfx = (nome, opts) => {
  try { window.Som && Som.play(nome, opts); } catch (e) { /* áudio é opcional */ }
  try { // cada som importante ganha um efeitinho no lugar do toque
    if (nome === 'comprar' || nome === 'vender') fxSpark(fxPtr.x, fxPtr.y, 12, ['#ffd968', '#ffb12e', '#fff3c4'], 70, 'coin');
    else if (nome === 'gemas' || nome === 'nivelDragao' || nome === 'alimentar') fxSpark(fxPtr.x, fxPtr.y, 14, ['#ff8fb8', '#fff3c4', '#c8a2ff', '#ffd968'], 80, 'star');
    else if (nome === 'conquista' || nome === 'missao') fxSpark(innerWidth / 2, 90, 18, ['#ffd968', '#fff3c4', '#ffb12e'], 140, 'star');
  } catch (e) { /* efeito é opcional */ }
};
const music = nome => { try { window.Som && Som.musica(nome); } catch (e) { /* áudio é opcional */ } };
const tension = v => { try { window.Som && Som.tensao(v); } catch (e) { /* áudio é opcional */ } };
const RAR_SOM = { C: 'comum', R: 'raro', E: 'epico', L: 'lendario' };
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function round5(n) { return n < 50 ? Math.round(n) : Math.round(n / 5) * 5; }
function fmt(n) {
  n = Math.floor(n);
  const a = Math.abs(n);
  if (a < 1e4) return n.toLocaleString('pt-BR');
  if (a < 1e6) return (n / 1e3).toFixed(a < 1e5 ? 1 : 0).replace('.', ',') + 'k';
  if (a < 1e9) return (n / 1e6).toFixed(2).replace('.', ',') + 'M';
  return (n / 1e9).toFixed(2).replace('.', ',') + 'B';
}
function fmtTime(sec) {
  sec = Math.max(0, Math.floor(sec));
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
const pct = (a, b) => b ? Math.round((a / b) * 100) : 0;

// ============================================================
// Rodando dentro do app (Capacitor no Android ou iPhone): já é tela cheia e travado deitado
const nativeApp = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
