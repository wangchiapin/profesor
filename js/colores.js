// 色數消消樂：顏色、數字、設定格式（跟遊戲 pop-colores-numeros 的 index.html 一致，改遊戲時這裡也要改），
// 以及三種學習單（聽讀找色、看色寫數、著色版）。這裡只產生 HTML，操作在 app.js。
(function(){
'use strict';
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---- 跟遊戲一樣的資料 ----
const COLORS = {
  red: { zh: ['紅', '红'], es: 'rojo', en: 'red', bg: '#e53935', fg: '#fff' },
  yellow: { zh: ['黃', '黄'], es: 'amarillo', en: 'yellow', bg: '#fdd835', fg: '#111' },
  blue: { zh: ['藍', '蓝'], es: 'azul', en: 'blue', bg: '#1e88e5', fg: '#fff' },
  green: { zh: ['綠', '绿'], es: 'verde', en: 'green', bg: '#2e9e4f', fg: '#fff' },
  black: { zh: ['黑', '黑'], es: 'negro', en: 'black', bg: '#111', fg: '#fff' },
  white: { zh: ['白', '白'], es: 'blanco', en: 'white', bg: '#fff', fg: '#111' },
  gray: { zh: ['灰', '灰'], es: 'gris', en: 'gray', bg: '#9e9e9e', fg: '#111' },
  orange: { zh: ['橘', '橘'], es: 'naranja', en: 'orange', bg: '#fb8c00', fg: '#111' },
  purple: { zh: ['紫', '紫'], es: 'morado', en: 'purple', bg: '#7b1fa2', fg: '#fff' },
  pink: { zh: ['粉紅', '粉红'], es: 'rosa', en: 'pink', bg: '#ff80ab', fg: '#111' },
  brown: { zh: ['咖啡', '咖啡'], es: 'café', en: 'brown', bg: '#6d4c41', fg: '#fff' },
  dgray: { zh: ['深灰', '深灰'], es: 'gris oscuro', en: 'dark gray', bg: '#555', fg: '#fff' },
  lgray: { zh: ['淺灰', '浅灰'], es: 'gris claro', en: 'light gray', bg: '#d3d3d3', fg: '#111' },
  dblue: { zh: ['深藍', '深蓝'], es: 'azul oscuro', en: 'dark blue', bg: '#0d2f7a', fg: '#fff' },
  lblue: { zh: ['淺藍', '浅蓝'], es: 'azul claro', en: 'light blue', bg: '#7fd1ff', fg: '#111' },
  dgreen: { zh: ['深綠', '深绿'], es: 'verde oscuro', en: 'dark green', bg: '#1b5e20', fg: '#fff' },
  lgreen: { zh: ['淺綠', '浅绿'], es: 'verde claro', en: 'light green', bg: '#a5e08f', fg: '#111' }
};
Object.keys(COLORS).forEach(id => { COLORS[id].id = id; });
const SETS = {
  basic: ['red', 'yellow', 'blue', 'green', 'black', 'white', 'gray', 'orange', 'purple'],
  adv: ['red', 'yellow', 'orange', 'purple', 'black', 'white', 'pink', 'brown', 'dgray', 'lgray', 'dblue', 'lblue', 'dgreen', 'lgreen']
};
const DIG = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
function cn(n){
  if(n === 0) return '零';
  const d = [Math.floor(n / 1000) % 10, Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10];
  const units = ['千', '百', '十', ''];
  let s = '', zero = false;
  for(let i = 0; i < 4; i++){
    if(d[i] === 0){ if(s) zero = true; continue; }
    if(zero){ s += '零'; zero = false; }
    if(i === 2 && d[i] === 1 && s === ''){ s += '十'; }
    else{ s += ((d[i] === 2 && i < 2) ? '兩' : DIG[d[i]]) + units[i]; }
  }
  return s;
}
const cnOf = (n, simp) => simp ? cn(n).replace(/兩/g, '两') : cn(n);
function shuffle(a){ a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function strata(range){ return range === 999 ? [[0, 9, .1], [10, 99, .3], [100, 999, .6]] : [[0, 9, .1], [10, 99, .2], [100, 999, .3], [1000, 9999, .4]]; }
function pickNumbers(N, range){
  const st = strata(range);
  const counts = st.map(s => Math.floor(N * s[2]));
  const rest = N - counts.reduce((a, b) => a + b, 0);
  const order = st.map((s, i) => [N * s[2] - counts[i], i]).sort((a, b) => b[0] - a[0]);
  for(let k = 0; k < rest; k++) counts[order[k % order.length][1]]++;
  const out = [];
  st.forEach((s, i) => { const pool = []; for(let v = s[0]; v <= s[1]; v++) pool.push(v); out.push(...shuffle(pool).slice(0, counts[i])); });
  return shuffle(out);
}
function normalizeCfg(c){
  if(!c || typeof c !== 'object') return null;
  const cp = (x, n) => [...String(x == null ? '' : x).trim()].slice(0, n).join('');
  const o = { name: cp(c.name, 20), mode: c.mode === 'B' ? 'B' : 'A' };
  o.rows = Math.min(8, Math.max(3, parseInt(c.rows) || 5));
  o.cols = Math.min(6, Math.max(3, parseInt(c.cols) || 4));
  o.hearts = [0, 3, 5].includes(c.hearts) ? c.hearts : 5;
  // p＝拼音（選填，遊戲顯示在按鈕字上面）
  const cu = Array.isArray(c.custom) ? c.custom.slice(0, 12).map(x => { const o = { n: cp(x && x.n, 8), s: cp(x && x.s, 12), h: (x && /^#[0-9a-fA-F]{6}$/.test(x.h)) ? x.h.toLowerCase() : '#888888' }; const py = cp(x && x.p, 40); if(py) o.p = py; return o; }) : [];
  if(cu.some(x => !x.n)) return null;
  const ids = Array.isArray(c.ids) ? [...new Set(c.ids.filter(id => COLORS[id]))] : [];
  if(ids.length + cu.length < 2) return null;
  if(ids.length) o.ids = ids;
  if(cu.length) o.custom = cu;
  if(Array.isArray(c.nums)){
    const ns = [...new Set(c.nums.map(Number).filter(n => Number.isInteger(n) && n >= 0 && n <= 9999))].slice(0, 200);
    if(!ns.length) return null;
    o.nums = ns;
  }else o.range = c.range === 9999 ? 9999 : 999;
  return o;
}
function parseNumList(text){
  const toks = String(text).split(/[\s,，、;；]+/).filter(Boolean);
  if(!toks.length) return null;
  const out = new Set();
  for(const t of toks){
    let m;
    if((m = /^(\d{1,4})$/.exec(t))) out.add(+m[1]);
    else if((m = /^(\d{1,4})\s*[-~–－～]\s*(\d{1,4})$/.exec(t))){
      const a = +m[1], b = +m[2]; if(a > b) return null;
      for(let v = a; v <= b; v++){ out.add(v); if(out.size > 200) return null; }
    }else return null;
  }
  return out.size ? [...out] : null;
}
const usesPro = c => !!(c && (c.custom || c.nums));
function customColor(i, o){
  const r = parseInt(o.h.slice(1, 3), 16), g = parseInt(o.h.slice(3, 5), 16), b = parseInt(o.h.slice(5, 7), 16);
  return { id: 'c' + i, zh: [o.n, o.n], es: '', en: '', bg: o.h, fg: (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#111' : '#fff', say: o.s || o.n };
}
const colorsOf = c => [...(c.ids || []).map(id => COLORS[id]), ...(c.custom || []).map((o, i) => customColor(i, o))];

// ---- 編輯器草稿（跟遊戲教師區一樣）----
function draftFrom(c){
  return {
    name: c ? c.name : '', mode: c ? c.mode : 'A', rows: c ? c.rows : 5, cols: c ? c.cols : 4, hearts: c ? c.hearts : 5,
    ids: c ? (c.ids ? c.ids.slice() : []) : SETS.basic.slice(),
    custom: c && c.custom ? c.custom.map(x => Object.assign({}, x)) : [],
    nmode: c && c.nums ? 'list' : (c && c.range === 9999 ? '9999' : '999'),
    list: c && c.nums ? c.nums.join(', ') : ''
  };
}
// 回傳 { cfg } 或 { err: 詞條代碼 }
function draftToCfg(E){
  const raw = { name: E.name, mode: E.mode, rows: E.rows, cols: E.cols, hearts: E.hearts, ids: E.ids, custom: E.custom };
  if(E.ids.length + E.custom.length < 2) return { err: 'colNeed2' };
  if(E.custom.some(c => !String(c.n || '').trim())) return { err: 'colNeedName' };
  if(E.nmode === 'list'){ const l = parseNumList(E.list); if(!l) return { err: 'colBadList' }; raw.nums = l; }
  else raw.range = E.nmode === '9999' ? 9999 : 999;
  const c = normalizeCfg(raw);
  return c ? { cfg: c } : { err: 'colBad' };
}

// ---- 學習單 ----
// 色塊板：rows×cols 個數字（不重複，清單不夠時才重複），每格一個顏色（每種顏色至少一格，格子夠的話）
function makeBoard(c){
  const N = c.rows * c.cols, cols = colorsOf(c);
  let nums;
  if(c.nums){ const pool = shuffle(c.nums); nums = []; while(nums.length < N) nums.push(...shuffle(pool)); nums = nums.slice(0, N); }
  else nums = pickNumbers(N, c.range || 999);
  const base = shuffle(cols).slice(0, Math.min(N, cols.length));
  const colorList = shuffle(base.concat(Array.from({ length: N - base.length }, () => cols[Math.floor(Math.random() * cols.length)])));
  return { rows: c.rows, cols: c.cols, cells: nums.map((n, i) => ({ n, c: colorList[i] })) };
}
const cName = (col, simp) => col.zh[simp ? 1 : 0] + '色';
function helpName(col, help){ return help === 'none' ? '' : (col[help] || ''); }

// opts: { kind: 'listen'|'write'|'color', legend（聽讀找色附顏色名稱表）, simp, help: 'none'|'es'|'en', read: true（印題目）/false（老師唸）, count, answers, title }
// tx(key) 取學習單上的說明文字 [中, es, en]
function worksheet(c, opts, board, tx){
  const simp = !!opts.simp, help = opts.help || 'none';
  const zhT = k => { const v = tx(k); return simp ? v[1] : v[0]; };
  const hlT = k => { if(help === 'none') return ''; const v = tx(k); return v[help === 'es' ? 2 : 3]; };
  const bi = k => esc(zhT(k)) + (help === 'none' ? '' : ' <small>' + esc(hlT(k)) + '</small>');
  const head = '<div class="ws-head"><h2>' + esc(simp ? '色数消消乐' : '色數消消樂') + ' · ' + bi(opts.kind === 'listen' ? 'wsListen' : opts.kind === 'write' ? 'wsWrite' : 'wsColor') + '</h2>' +
    (opts.title ? '<div class="ws-sub">' + esc(opts.title) + '</div>' : '') +
    '<div class="ws-meta"><span>' + bi('wsName') + '：<i></i></span><span>' + bi('wsDate') + '：<i></i></span><span>' + bi('wsScore') + '：<i class="s"></i></span></div></div>';
  const cellsHtml = (mode) => '<div class="ws-board" style="grid-template-columns:repeat(' + board.cols + ',1fr)">' + board.cells.map(x => {
    if(mode === 'blank') return '<div class="ws-cell blank"><span>' + esc(cnOf(x.n, simp)) + '</span></div>';
    if(mode === 'filledcn') return '<div class="ws-cell" style="background:' + x.c.bg + ';color:' + x.c.fg + '"><span>' + esc(cnOf(x.n, simp)) + '</span></div>';
    return '<div class="ws-cell" style="background:' + x.c.bg + ';color:' + x.c.fg + '"><span class="d">' + x.n + '</span></div>';
  }).join('') + '</div>';
  const legend = () => { const used = []; board.cells.forEach(x => { if(used.indexOf(x.c) < 0) used.push(x.c); });
    return '<div class="ws-legend">' + used.map(col => '<span><b class="sw" style="background:' + col.bg + '"></b>' + esc(cName(col, simp)) + (helpName(col, help) ? ' <small>' + esc(helpName(col, help)) + '</small>' : '') + '</span>').join('') + '</div>'; };
  let sheet = head, key = '';
  if(opts.kind === 'listen'){
    // 只問不重複且顏色唯一的數字
    const seen = {}; board.cells.forEach(x => { (seen[x.n] = seen[x.n] || []).push(x.c); });
    const okNums = Object.keys(seen).map(Number).filter(n => seen[n].every(c2 => c2 === seen[n][0]));
    const qs = shuffle(okNums).slice(0, Math.min(opts.count || 10, okNums.length)).map(n => ({ n, c: seen[n][0] }));
    sheet += '<p class="ws-ins">' + bi(opts.read ? 'wsInsListenRead' : 'wsInsListenSay') + '</p>' + cellsHtml('digits') + (opts.legend ? legend() : '') +
      '<ol class="ws-qs">' + qs.map((q, i) => '<li><span class="no">' + (i + 1) + '.</span>' + (opts.read ? '<span class="q">' + esc(cnOf(q.n, simp)) + '</span>' : '') + '<span class="line"></span></li>').join('') + '</ol>';
    key = '<ol class="ws-qs key">' + qs.map(q => '<li><span class="q">' + esc(cnOf(q.n, simp)) + '（' + q.n + '）</span><b>' + esc(cName(q.c, simp)) + '</b>' + (helpName(q.c, help) ? ' <small>' + esc(helpName(q.c, help)) + '</small>' : '') + '</li>').join('') + '</ol>';
    opts._max = qs.length;
  }else if(opts.kind === 'write'){
    const groups = []; board.cells.forEach(x => { let g = groups.find(y => y.c === x.c); if(!g) groups.push(g = { c: x.c, ns: [] }); if(g.ns.indexOf(x.n) < 0) g.ns.push(x.n); });
    sheet += '<p class="ws-ins">' + bi('wsInsWrite') + '</p>' + cellsHtml('digits') +
      '<ol class="ws-qs wide">' + groups.map((g, i) => '<li><span class="no">' + (i + 1) + '.</span><span class="q"><b class="sw" style="background:' + g.c.bg + '"></b>' + esc(cName(g.c, simp)) + (helpName(g.c, help) ? ' <small>' + esc(helpName(g.c, help)) + '</small>' : '') + '</span>' + '<span class="line full"></span>'.repeat(Math.max(1, Math.ceil(g.ns.length / 3))) + '</li>').join('') + '</ol>';
    key = '<ol class="ws-qs wide key">' + groups.map(g => '<li><span class="q">' + esc(cName(g.c, simp)) + '</span>' + g.ns.map(n => esc(cnOf(n, simp))).join(simp ? '、' : '、') + '</li>').join('') + '</ol>';
    opts._max = groups.length;
  }else{
    const groups = []; board.cells.forEach(x => { let g = groups.find(y => y.c === x.c); if(!g) groups.push(g = { c: x.c, ns: [] }); if(g.ns.indexOf(x.n) < 0) g.ns.push(x.n); });
    sheet += '<p class="ws-ins">' + bi('wsInsColor') + '</p>' + cellsHtml('blank') +
      '<div class="ws-map">' + groups.map(g => '<div><span class="q">' + esc(cName(g.c, simp)) + (helpName(g.c, help) ? ' <small>' + esc(helpName(g.c, help)) + '</small>' : '') + '</span>' + g.ns.map(n => esc(cnOf(n, simp))).join('、') + '</div>').join('') + '</div>';
    key = cellsHtml('filledcn');
    opts._max = board.cells.length;
  }
  if(opts.answers) sheet += '<div class="ws-key"><div class="ws-head"><h2>' + bi('wsAnswers') + '</h2></div>' + key + '</div>';
  return sheet;
}

window.COL = { COLORS, SETS, cn, cnOf, normalizeCfg, parseNumList, usesPro, colorsOf, draftFrom, draftToCfg, makeBoard, worksheet, cName };
})();
