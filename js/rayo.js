// 天打雷劈：老師管理中心這一側的資料整理（自訂字庫草稿、讀音檢查、成績簿）。不碰 Firebase（在 data.js）。
// 遊戲本身在 cuidado-con-el-rayo：內建字庫 data/words.json（1384 個單字，每字 {c 繁體, lv 等級, r 讀音代碼[], s 簡體}）。
// 讀音代碼＝數字聲調拼音（wo3、ma5、nv3）。讀音一律照 GoodTeacher：內建字用遊戲內建的，內建以外的字由老師自己輸入，不自動猜。
(function(){
'use strict';
const T = (k, p) => I18N.t(k, p);

// 開關：由老師管理中心的「遊戲開關」決定（app.js 的 gameOpen）；沒有 app 時視為開放。
const ready = () => typeof window.GAME_OPEN === 'function' ? window.GAME_OPEN('rayo') : true;

const LEVELS = ['N1', 'N2', 'L1', 'L2', 'L3', 'L4', 'L5'];
const MIN_C = 10;                       // 字庫至少 10 字
const FREE = { banks: 1, chars: 70 }, PRO = { banks: 5, chars: 150 };
const adm = () => !!(window.DATA && window.DATA.isAdminMode && window.DATA.isAdminMode());
// 數量上限：管理員放寬（見 data.js 的 ADM）；pro＝訂閱中
const maxBanks = pro => adm() ? window.DATA.ADM.themes : (pro ? PRO.banks : FREE.banks);
const maxChars = pro => adm() ? window.DATA.ADM.words : (pro ? PRO.chars : FREE.chars);

// ---- 讀音：數字聲調拼音 ↔ 注音（同遊戲 tools/phon.js）----
const INIT = { b:'ㄅ', p:'ㄆ', m:'ㄇ', f:'ㄈ', d:'ㄉ', t:'ㄊ', n:'ㄋ', l:'ㄌ', g:'ㄍ', k:'ㄎ', h:'ㄏ', j:'ㄐ', q:'ㄑ', x:'ㄒ', zh:'ㄓ', ch:'ㄔ', sh:'ㄕ', r:'ㄖ', z:'ㄗ', c:'ㄘ', s:'ㄙ' };
const FIN = { a:'ㄚ', o:'ㄛ', e:'ㄜ', ai:'ㄞ', ei:'ㄟ', ao:'ㄠ', ou:'ㄡ', an:'ㄢ', en:'ㄣ', ang:'ㄤ', eng:'ㄥ', er:'ㄦ',
  i:'ㄧ', ia:'ㄧㄚ', io:'ㄧㄛ', ie:'ㄧㄝ', iao:'ㄧㄠ', iu:'ㄧㄡ', ian:'ㄧㄢ', in:'ㄧㄣ', iang:'ㄧㄤ', ing:'ㄧㄥ', iong:'ㄩㄥ',
  u:'ㄨ', ua:'ㄨㄚ', uo:'ㄨㄛ', uai:'ㄨㄞ', ui:'ㄨㄟ', uan:'ㄨㄢ', un:'ㄨㄣ', uang:'ㄨㄤ', ong:'ㄨㄥ',
  v:'ㄩ', ve:'ㄩㄝ', van:'ㄩㄢ', vn:'ㄩㄣ' };
const TONE_MARK = { 1: '', 2: 'ˊ', 3: 'ˇ', 4: 'ˋ' };
const YW = { yi:'i', ya:'ia', yo:'io', ye:'ie', yao:'iao', you:'iu', yan:'ian', yin:'in', yang:'iang', ying:'ing', yong:'iong',
  yu:'v', yue:'ve', yuan:'van', yun:'vn', wu:'u', wa:'ua', wo:'uo', wai:'uai', wei:'ui', wan:'uan', wen:'un', wang:'uang', weng:'ong' };
function split(syl){
  if(YW[syl]) return ['', YW[syl]];
  let ini = '';
  for(const k of ['zh', 'ch', 'sh']) if(syl.startsWith(k)){ ini = k; break; }
  if(!ini && INIT[syl[0]]) ini = syl[0];
  let fin = syl.slice(ini.length);
  if('jqx'.includes(ini) && /^u/.test(fin)) fin = 'v' + fin.slice(1);
  if(['zh', 'ch', 'sh', 'r', 'z', 'c', 's'].includes(ini) && fin === 'i') fin = '';
  return [ini, fin];
}
function toZhuyin(code){
  const m = /^([a-z]+)([1-5])$/.exec(code); if(!m) return null;
  const [ini, fin] = split(m[1]);
  if(fin !== '' && !FIN[fin]) return null;
  if(fin === '' && !ini) return null;
  if(m[1] === 'er') return m[2] === '5' ? '˙ㄦ' : 'ㄦ' + TONE_MARK[m[2]];
  const z = (ini ? INIT[ini] : '') + (fin ? FIN[fin] : '');
  return m[2] === '5' ? '˙' + z : z + TONE_MARK[m[2]];
}
const MARKS = { a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', v: 'ǖǘǚǜ' };
function toPinyin(code){
  const m = /^([a-z]+)([1-5])$/.exec(code); if(!m) return null;
  let s = m[1], t = +m[2];
  if(t === 5) return s.replace(/v/g, 'ü');
  let idx = s.search(/[ae]/); if(idx < 0) idx = s.indexOf('ou') >= 0 ? s.indexOf('o') : -1;
  if(idx < 0){ let last = -1; for(let i = 0; i < s.length; i++) if('aeiouv'.includes(s[i])) last = i; idx = last; }
  const ch = s[idx]; if(idx < 0 || !MARKS[ch]) return null;
  return (s.slice(0, idx) + MARKS[ch][t - 1] + s.slice(idx + 1)).replace(/v/g, 'ü');
}
// 老師輸入的讀音：可以打 wo3、wǒ、lü4、lv4；輕聲 ma5 或 ma。回傳代碼，不合法回 null
const TONED = {}; Object.keys(MARKS).forEach(b => MARKS[b].split('').forEach((c, i) => { TONED[c] = [b, i + 1]; }));
function parseReading(s){
  let t = String(s || '').normalize('NFC').trim().toLowerCase().replace(/\s+/g, '').replace(/ü/g, 'v').replace(/u:/g, 'v');
  if(!t) return null;
  let tone = 0, out = '';
  for(const ch of t){
    if(TONED[ch]){ if(tone) return null; tone = TONED[ch][1]; out += TONED[ch][0]; }
    else if(/[a-z]/.test(ch)) out += ch;
    else if(/[1-5]/.test(ch) && ch === t[t.length - 1] && !tone) tone = +ch;
    else return null;
  }
  if(!tone) tone = 5;
  const code = out + tone;
  return toZhuyin(code) ? code : null;
}
// 一格輸入可以放多個讀音（逗號、空白、頓號隔開）；最多 3 個。回傳 { codes } 或 { bad:'原始輸入' }
function parseReadings(str){
  const parts = String(str || '').split(/[,，、;；/]+/).map(x => x.trim()).filter(Boolean);
  if(!parts.length || parts.length > 3) return { bad: String(str || '') };
  const codes = [];
  for(const p of parts){ const c = parseReading(p); if(!c) return { bad: p }; if(codes.indexOf(c) < 0) codes.push(c); }
  return { codes };
}
const readingLabel = codes => (codes || []).map(c => (toPinyin(c) || c) + ' ' + (toZhuyin(c) || '')).join('　');

// ---- 內建字庫（讀遊戲網站上的 data/words.json）----
let wordsP = null, WORDS = null, BYCH = null;
function loadWords(){
  if(!wordsP) wordsP = fetch(window.DATA.GAME_URL.rayo + 'data/words.json', { cache: 'no-cache' }).then(r => { if(!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(j => {
      if(!j || !Array.isArray(j.words) || !j.words.length) throw new Error('words empty');
      WORDS = j.words; BYCH = {}; WORDS.forEach(w => { BYCH[w.c] = w; }); return WORDS;
    }).catch(e => { wordsP = null; throw e; });
  return wordsP;
}
const loaded = () => !!WORDS;
const builtinOf = ch => BYCH ? BYCH[ch] || null : null;
const wordsOfLevel = lv => (WORDS || []).filter(w => w.lv === lv);
const HAN1 = /^[㐀-鿿]$/;

// ---- 草稿：{ name, chars:[{c, s, r:[代碼], x: 1＝內建以外的字}], lv, text, msg } ----
function draftFrom(b){
  if(!b) return { name: '', chars: [], lv: 'N1', text: '', msg: '' };
  return { name: b.name, chars: b.chars.map(x => ({ c: x.c, s: x.s, r: x.r.slice(), x: x.x ? 1 : 0 })), lv: 'N1', text: '', msg: '' };
}
const has = (dr, c) => dr.chars.some(x => x.c === c);
function addBuiltin(dr, w){
  if(has(dr, w.c)) return false;
  dr.chars.push({ c: w.c, s: w.s || w.c, r: w.r.slice(), x: 0 }); return true;
}
function removeChar(dr, c){ dr.chars = dr.chars.filter(x => x.c !== c); }
// 貼一段文字：把裡面的字（不重複）找出來。內建有的直接加（超過上限就停）；內建沒有的列出來，讓老師決定要不要加
function pickFromText(dr, text, max){
  const seen = new Set(), added = [], missing = []; let full = false;
  for(const ch of Array.from(String(text || ''))){
    if(!HAN1.test(ch) || seen.has(ch)) continue; seen.add(ch);
    const w = builtinOf(ch);
    if(!w){ missing.push(ch); continue; }
    if(has(dr, ch)) continue;
    if(dr.chars.length >= max){ full = true; continue; }
    addBuiltin(dr, w); added.push(ch);
  }
  return { added, missing, full };
}
// 加內建以外的字：要有讀音（老師輸入），簡體字用函式庫轉（轉不到就用原字）。回傳錯誤訊息（空字串＝成功）
async function addOutside(dr, ch, readStr, max){
  ch = String(ch || '').trim();
  if(!HAN1.test(ch)) return T('rayoNeedOneChar');
  if(has(dr, ch)) return T('rayoDupChar', { c: ch });
  if(dr.chars.length >= max) return T('rayoBankFull', { n: max });
  const w = builtinOf(ch);
  if(w){ addBuiltin(dr, w); return ''; }
  const p = parseReadings(readStr);
  if(p.bad !== undefined) return T('rayoBadReading', { r: p.bad || T('rayoEmpty') });
  let s = ch;
  try{ s = (await window.CORRE.simpOf(ch)) || ch; }catch(e){ s = ch; }
  dr.chars.push({ c: ch, s: Array.from(s)[0] || ch, r: p.codes, x: 1 });
  return '';
}
// 改某個字的讀音（只影響這個字庫）。回傳錯誤訊息
function setReading(dr, ch, str){
  const it = dr.chars.find(x => x.c === ch); if(!it) return '';
  const p = parseReadings(str);
  if(p.bad !== undefined) return T('rayoBadReading', { r: p.bad || T('rayoEmpty') });
  it.r = p.codes; return '';
}
// 這個字是不是被老師改過讀音（跟內建不一樣）
const edited = x => { const w = builtinOf(x.c); return !!w && w.r.join(',') !== x.r.join(','); };
function resetReading(dr, ch){ const w = builtinOf(ch), it = dr.chars.find(x => x.c === ch); if(w && it) it.r = w.r.slice(); }
function draftValid(dr, pro){
  const max = maxChars(pro);
  if(!(dr.name || '').trim()) return T('rayoNeedName');
  if(dr.chars.length < MIN_C) return T('rayoTooFew', { n: MIN_C });
  if(dr.chars.length > max) return T('rayoBankFull', { n: max });
  return '';
}
const toBank = dr => ({ name: dr.name.trim().slice(0, 12), chars: dr.chars.map(x => ({ c: x.c, s: x.s, r: x.r.slice(), x: x.x ? 1 : 0 })) });
// 字庫摘要（卡片上顯示）
const summary = b => T('rayoCount', { n: b.chars.length }) + (b.chars.some(x => x.x) ? ' · ' + T('rayoOutN', { n: b.chars.filter(x => x.x).length }) : '');

// ---- 連結設定（鎖定班級設定用）：難度、題數、鍵盤；空字串＝不鎖，學生自己選 ----
const LV_OPTS = ['easy', 'normal', 'hard'], N_OPTS = [10, 15, 20, 25, 30], KB_OPTS = ['pinyin', 'zhuyin'];
// 題數：字庫字數不夠的選項要關掉（每題一個字、不重複）
const nAllowed = (n, bank) => !bank || bank.chars.length >= n;
const lvName = k => T('rayoLv_' + k), kbName = k => T('rayoKb_' + k);
// 成績的設定代碼 k（遊戲寫進 class_scores）：難度_題數_鍵盤，自訂字庫再加 _字庫碼前 8 碼
function parseK(k){
  const m = /^(easy|normal|hard)_(\d+)_(pinyin|zhuyin)(?:_([a-z0-9]{1,16}))?$/.exec(k || ''); if(!m) return null;
  return { lv: m[1], n: +m[2], kb: m[3], b: m[4] || '' };
}
// 設定的顯示名稱：難度 · 題數 · 鍵盤（· 字庫名）
function kLabel(k, banks){
  const p = parseK(k); if(!p) return T('setOther');
  let s = lvName(p.lv) + ' · ' + T('rayoNQ', { n: p.n }) + ' · ' + kbName(p.kb);
  if(p.b){ const b = (banks || []).find(x => x.sid && x.sid.slice(0, 8) === p.b); s += ' · ' + (b ? '⚡ ' + b.name : T('setDeleted')); }
  return s;
}

// ---- 成績簿 ----
// 分數編碼（遊戲寫進 class_scores.best）＝ (題數 − 被劈次數) × 100000 + (99999 − 用時秒數)，越大越前面
// extra：{ s 被劈次數, c 答對題數, t 用時秒數, st 星星, n 題數 }
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ex = r => Object.assign({ s: 0, c: 0, t: 0, st: 0, n: 0 }, r.extra || {});
const fmtT = s => { s = Math.max(0, Math.round(+s || 0)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); };
const stars = n => '★'.repeat(n) + '☆'.repeat(Math.max(0, 3 - n));
const fdt = ms => { if(!ms) return ''; const d = new Date(ms), p = n => ('0' + n).slice(-2); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); };
const inDays = (ms, days) => !days || ms >= Date.now() - days * 86400000;
// 排序：被劈越少越前面，一樣就比誰快（＝best 越大越前面）
const byBest = (a, b) => b.best - a.best;
const rowsOf = (scores, days, sk) => (scores || []).filter(r => r.game === 'rayo' && inDays(r.ms, days) && (!sk || r.k === sk));
function setKeys(scores){ const out = []; (scores || []).forEach(r => { if(r.game === 'rayo' && out.indexOf(r.k) < 0) out.push(r.k); }); return out; }
const studentCount = (scores, sk) => new Set(rowsOf(scores, 0, sk).map(r => r.h)).size;
// 常錯的字：從逐題紀錄算（每筆 qs＝[{c 字, ok 是否答對}]）。回傳 [{c, bad, total}]，錯最多的在前
function wrongStats(plays, days, sk, h){
  const m = {};
  (plays || []).filter(p => p.game === 'rayo' && inDays(p.ms, days) && (!sk || p.k === sk) && (!h || p.h === h)).forEach(p => (p.qs || []).forEach(q => {
    if(!q || !q.c) return; const o = m[q.c] || (m[q.c] = { c: q.c, bad: 0, total: 0 }); o.total++; if(!q.ok) o.bad++;
  }));
  return Object.keys(m).map(k => m[k]).filter(o => o.bad > 0).sort((a, b) => b.bad - a.bad || a.c.localeCompare(b.c));
}
const wrongLine = (list, n, simp) => list.slice(0, n).map(o => o.c + '×' + o.bad).join('　');
// 「全部」：每位學生每種設定一行（學生＝暱稱雜湊 h）。只選一種設定時就是那種設定的排行榜
function tableRows(scores, plays, days, sk){
  return rowsOf(scores, days, sk).sort(byBest).map(r => { const e = ex(r), w = wrongStats(plays, days, r.k, r.h); return { r, e, w }; });
}
const CSV_HEAD = ['nick', 'setting', 'strikes', 'correct', 'secs', 'stars', 'plays', 'last', 'wrong'];
function csvRows(scores, plays, days, sk, banks){
  const out = [[T('thNick'), T('rayoColSet'), T('rayoColStrikes'), T('rayoColCorrect'), T('rayoColTime'), T('rayoColStars'), T('rayoColPlays'), T('rayoColLast'), T('rayoColWrong')]];
  tableRows(scores, plays, days, sk).forEach(x => out.push([x.r.nick, kLabel(x.r.k, banks), x.e.s, x.e.c + '/' + x.e.n, fmtT(x.e.t), x.e.st, x.r.plays || 1, fdt(x.r.ms), x.w.slice(0, 8).map(o => o.c + '×' + o.bad).join(' ')]));
  return out;
}
function bookHtml(scores, plays, days, sk, banks, simp){
  const list = tableRows(scores, plays, days, sk);
  if(!list.length) return '<p class="hint">' + esc(T('noScores')) + '</p>';
  let h = '<div class="tablewrap"><table class="t nw"><tr>' + (sk ? '<th>#</th>' : '') + [T('thNick'), sk ? '' : T('rayoColSet'), T('rayoColStrikes'), T('rayoColCorrect'), T('rayoColTime'), T('rayoColStars'), T('rayoColPlays'), T('rayoColLast'), T('rayoColWrong')]
    .filter((x, i) => !(i === 1 && sk)).map(x => '<th>' + esc(x) + '</th>').join('') + '<th></th></tr>' +
    list.map((x, i) => '<tr>' + (sk ? '<td>' + (i + 1) + '</td>' : '') + '<td><b>' + esc(x.r.nick) + '</b></td>' + (sk ? '' : '<td>' + esc(kLabel(x.r.k, banks)) + '</td>') +
      '<td>⚡' + x.e.s + '</td><td>' + x.e.c + '/' + x.e.n + '</td><td>' + fmtT(x.e.t) + '</td><td>' + stars(x.e.st) + '</td><td>' + (x.r.plays || 1) + '</td><td>' + esc(fdt(x.r.ms)) + '</td><td>' +
      esc(wrongLine(x.w, 5)) + '</td><td><button class="x" data-act="rowdel" data-id="' + esc(x.r.id) + '" data-nick="' + esc(x.r.nick) + '" aria-label="' + esc(T('del')) + '">✕</button></td></tr>').join('') + '</table></div>';
  // 整班常錯的字
  const all = wrongStats(plays, days, sk, '');
  h += '<h4>' + esc(T('rayoClassWrong')) + '</h4>' + (all.length ? '<p class="hint">' + esc(wrongLine(all, 20)) + '</p>' : '<p class="hint">' + esc(T('rayoNoWrong')) + '</p>');
  return h;
}

window.RAYO = { ready, LEVELS, MIN_C, FREE, PRO, maxBanks, maxChars, toZhuyin, toPinyin, parseReading, parseReadings, readingLabel,
  loadWords, loaded, builtinOf, wordsOfLevel, draftFrom, addBuiltin, removeChar, pickFromText, addOutside, setReading, edited, resetReading, draftValid, toBank, summary,
  LV_OPTS, N_OPTS, KB_OPTS, nAllowed, lvName, kbName, parseK, kLabel, setKeys, studentCount, wrongStats, tableRows, csvRows, bookHtml, ex, fmtT };
})();
