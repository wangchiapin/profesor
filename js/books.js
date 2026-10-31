// 成績簿畫面（只產生 HTML 字串，不碰 Firebase）
// 各遊戲的表格欄位一致：暱稱｜最高分｜次數｜詳細｜最近。比比看多一個「常錯統計」。
(function(){
'use strict';
const T = (k, p) => I18N.t(k, p);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const p2 = n => String(n).padStart(2, '0');
const fdate = ms => { if(!ms) return ''; const d = new Date(ms); return d.getFullYear() + '/' + p2(d.getMonth() + 1) + '/' + p2(d.getDate()); };
const fshort = ms => { if(!ms) return ''; const d = new Date(ms), md = p2(d.getMonth() + 1) + '/' + p2(d.getDate()); return d.getFullYear() === new Date().getFullYear() ? md : d.getFullYear() + '/' + md; };   // 表格用：今年只顯示月/日
const ftime = ms => { if(!ms) return ''; const d = new Date(ms); return fdate(ms) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes()); };
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
const inDays = (ms, days) => !days || ms >= Date.now() - days * 86400000;
const mmss = s => Math.floor(s / 60) + ':' + p2(s % 60);

// ---- 步驟 6-2：成績依「用了哪個設定」分開 ----
// 跑吧＝句庫碼（公開題庫＝pool）、色數＝設定碼（舊式連結＝link）、比比看＝範圍碼 r（一般模式＝normal，舊格式範圍＝other）
function setKeyOf(game, r){
  if(game === 'bbk') return r.r ? r.r : (r.rg ? 'other' : 'normal');
  return r.k || 'old';
}
// 這款遊戲有成績的設定（依第一次出現的順序）
function setKeys(game, rows){
  const seen = [];
  rows.forEach(r => { if(game !== 'bbk' && r.game !== game) return; const k = setKeyOf(game, r); if(seen.indexOf(k) < 0) seen.push(k); });
  return seen;
}
const setTag = (lab, k) => lab ? '<small class="setk">' + esc(lab(k)) + '</small>' : '';

// ---- 跑吧／色數：每位學生（每個設定）一列（class_scores）----
function detailOf(game, r){
  const ex = r.extra || {};
  if(game === 'corre'){
    const diff = ex.diff && I18N.D['diff_' + ex.diff] ? T('diff_' + ex.diff) : (ex.diff || '');
    return ex.sent != null ? T('detailCorre', { n: ex.sent, diff }).replace(/ · $/, '') : diff;
  }
  if(game === 'ba' || game === 'bei'){
    return ex.q != null ? T('detailBa', { ok: ex.ok || 0, q: ex.q }) : '';
  }
  if(game === 'dragon'){
    if(ex.c == null) return '';
    return T('detailDragon', { n: ex.c, a: ex.a || 0 }) + (Array.isArray(ex.wr) && ex.wr.length ? ' · ' + T('dragonWrongTag', { w: ex.wr.join(' ') }) : '');
  }
  if(ex.secs == null) return '';
  return T('detailColores', { time: mmss(+ex.secs), cleared: ex.cleared ? T('clearedTag') : '' });
}
// sk：只看這個設定（'' = 全部；全部時暱稱下面用小字標出是哪個設定）；lab(k) = 設定的名稱
function scoreTable(game, rows, days, sk, lab){
  const list = rows.filter(r => r.game === game && inDays(r.ms, days) && (!sk || setKeyOf(game, r) === sk)).sort((a, b) => b.best - a.best);
  if(!list.length) return '<p class="hint">' + esc(T('noScores')) + '</p>';
  return '<div class="tablewrap"><table class="t nw"><tr><th>' + [T('thNick'), T('thBest'), T('thPlays'), T('thDetail'), T('thLast'), ''].map(esc).join('</th><th>') + '</th></tr>' +
    list.map(r => '<tr><td><b>' + esc(r.nick) + '</b>' + (sk ? '' : setTag(lab, setKeyOf(game, r))) + '</td><td>' + r.best + '</td><td>' + (r.plays || 1) + '</td><td>' + esc(detailOf(game, r)) + '</td><td>' + fshort(r.ms) +
      '</td><td><button class="x" data-act="rowdel" data-id="' + esc(r.id) + '" data-nick="' + esc(r.nick) + '" aria-label="' + esc(T('del')) + '">✕</button></td></tr>').join('') + '</table></div>';
}
function studentCount(game, rows, sk){ return new Set(rows.filter(r => r.game === game && (!sk || setKeyOf(game, r) === sk)).map(r => r.h)).size; }
function csvScores(game, rows, days, sk, lab){
  const out = [['nickname', 'setting', 'best', 'plays', 'detail', 'last']];
  rows.filter(r => r.game === game && inDays(r.ms, days) && (!sk || setKeyOf(game, r) === sk)).sort((a, b) => b.best - a.best)
    .forEach(r => out.push([r.nick, lab ? lab(setKeyOf(game, r)) : setKeyOf(game, r), r.best, r.plays || 1, detailOf(game, r), r.ms ? new Date(r.ms).toISOString() : '']));
  return out;
}

// ---- 比比看：每回合每題的紀錄（class_plays）----
// bySet = true：每個學生 × 每個設定各一列（成績冊「全部」）
function students(plays, bySet){
  const m = {};
  for(const r of plays){
    const k = setKeyOf('bbk', r), id = bySet ? r.h + '|' + k : r.h;
    const s = m[id] || (m[id] = { h: r.h, k, nick: r.nick, n: 0, best: 0, last: 0, q: 0, f1: 0 });
    s.n++; const p = pct(r.score, r.max); if(p > s.best) s.best = p;
    if(r.ms > s.last){ s.last = r.ms; s.nick = r.nick; }
    for(const q of (r.qs || [])){ s.q++; if(q.f1) s.f1++; }
  }
  return Object.values(m).sort((a, b) => a.nick.localeCompare(b.nick));
}
function bbkStudents(plays, days, sk, lab){
  const all = plays.filter(r => inDays(r.ms, days)), ss = students(all, !sk);
  if(!ss.length) return '<p class="hint">' + esc(T('noScores')) + '</p>';
  return '<div class="tablewrap"><table class="t click nw"><tr><th>' + [T('thNick'), T('thBest'), T('thPlays'), T('thDetail'), T('thLast')].map(esc).join('</th><th>') + '</th></tr>' +
    ss.map(s => '<tr data-act="stu" data-h="' + esc(s.h) + '"><td><b>' + esc(s.nick) + '</b>' + (sk ? '' : setTag(lab, s.k)) + '</td><td>' + s.best + '%</td><td>' + s.n + '</td><td>' + esc(T('detailBbk', { p: pct(s.f1, s.q) })) + '</td><td>' + fshort(s.last) + '</td></tr>').join('') +
    '</table></div><p class="hint">' + esc(T('tapStudent')) + '</p>';
}
function groupStats(plays, keyFn){
  const m = {};
  for(const r of plays) for(const q of (r.qs || [])){
    const k = keyFn(q); if(k == null) continue;
    const g = m[k] || (m[k] = { k, n: 0, ok: 0, f1: 0 }); g.n++; if(q.ok) g.ok++; if(q.f1) g.f1++;
  }
  return Object.values(m).sort((a, b) => a.f1 / a.n - b.f1 / b.n || b.n - a.n);
}
const known = k => !!I18N.D[k];
function patLabel(k){ return known('p_' + k) ? esc(T('p_' + k)) : esc(k); }
function typeLabel(k){ return known('t_' + k) ? esc(T('t_' + k)) : esc(k); }
function dimLabel(key){
  const [dk, p] = key.split('|');
  if(!known('d_' + dk)) return esc(dk);
  const sign = +p > 0 ? 'p' : (+p < 0 ? 'n' : '');
  const adj = sign && known('a_' + dk + '_' + sign) ? T('a_' + dk + '_' + sign) : '';
  return esc(T('d_' + dk)) + (adj ? '：<b>' + esc(adj) + '</b>' : '');
}
// 只留「第一次就答對」和題數；最常錯的排在最上面（不再有「最後答對」欄）
function statTable(title, rows, lab){
  if(!rows.length) return '';
  return '<div class="sec">' + esc(title) + '</div><div class="tablewrap"><table class="t"><tr><th></th><th>' + esc(T('thQs')) + '</th><th>' + esc(T('thFirst')) + '</th></tr>' +
    rows.map(g => { const p = pct(g.f1, g.n);
      return '<tr class="' + (g.n < 5 ? 'few' : '') + '"><td>' + lab(g.k) + '</td><td>' + g.n + '</td><td><div class="bar"><i style="width:' + p + '%"></i><span>' + p + '%</span></div></td></tr>'; }).join('') + '</table></div>';
}
function bbkStats(plays){
  if(!plays.length) return '<p class="hint">' + esc(T('noPlays')) + '</p>';
  return '<p class="hint">' + esc(T('errNote')) + '</p>'
    + statTable(T('secPattern'), groupStats(plays, q => q.f || null), patLabel)
    + statTable(T('secFeature'), groupStats(plays, q => q.d ? q.d + '|' + (q.p || 0) : null), dimLabel)
    + statTable(T('secType'), groupStats(plays, q => q.t || null), typeLabel)
    + statTable(T('secTf'), groupStats(plays, q => q.t === 'tf' ? (q.tv ? 'T' : 'F') : null), k => esc(k === 'T' ? T('tfTrue') : T('tfFalse')));
}
function rgLabel(rg){
  if(!rg) return T('rangeNormal');
  const q = new URLSearchParams(rg), parts = [];
  if(q.get('d')) parts.push(q.get('d').split(',').map(k => known('d_' + k) ? T('d_' + k) : k).join('、'));
  if(q.get('t')) parts.push(q.get('t').split(',').map(k => known('t_' + k) ? T('t_' + k) : k).join('、'));
  return T('rangeTeacher') + (parts.length ? '：' + parts.join('｜') : '');
}
function bbkStudent(plays, h, days){
  const all = plays.filter(r => inDays(r.ms, days)), mine = all.filter(r => r.h === h);
  const s = students(plays).find(x => x.h === h);
  return '<div class="row"><button class="pill sm" data-act="stuback">' + esc(T('studentBack')) + '</button></div><h3>👤 ' + esc(s ? s.nick : '') + '</h3>' +
    '<div class="tablewrap"><table class="t"><tr><th>' + [T('colTime'), T('colContent'), T('colScore')].map(esc).join('</th><th>') + '</th></tr>' +
    mine.map(r => '<tr><td>' + ftime(r.ms) + '</td><td>' + esc(T('levelN', { n: r.lv })) + '<small>' + esc(rgLabel(r.rg)) + '</small></td><td>' + r.score + '/' + r.max + '</td></tr>').join('') + '</table></div>' +
    bbkStats(mine) +
    '<div class="row"><button class="pill" data-act="studel" data-h="' + esc(h) + '" data-nick="' + esc(s ? s.nick : '') + '">🗑 ' + esc(T('delStudent')) + '</button></div>';
}
function csvBbk(plays, days, lab){
  const out = [['time', 'nick', 'setting', 'level', 'range', 'round_score', 'round_max', 'q', 'type', 'feature', 'pattern', 'direction', 'correct', 'first_try', 'items', 'tf_statement']];
  for(const r of plays.filter(r => inDays(r.ms, days)).slice().reverse())
    (r.qs || []).forEach((q, i) => out.push([ftime(r.ms), r.nick, lab ? lab(setKeyOf('bbk', r)) : setKeyOf('bbk', r), r.lv, r.rg || 'normal', r.score, r.max, i + 1, q.t, q.d, q.f, q.p, q.ok ? 1 : 0, q.f1 ? 1 : 0, (q.ids || []).join(' '), q.t === 'tf' ? (q.tv ? 'true' : 'false') : '']));
  return out;
}
function toCsv(rows){
  return '﻿' + rows.map(r => r.map(v => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(',')).join('\r\n');
}

window.BOOKS = { esc, fdate, ftime, pct, setKeyOf, setKeys, scoreTable, studentCount, csvScores, bbkStudents, bbkStats, bbkStudent, csvBbk, toCsv, students };
})();
