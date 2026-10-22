// 墨龍飛天：老師管理中心這一側的資料整理（主題清單、自訂主題草稿、學習單 PDF）。不碰 Firebase（在 data.js）。
// 遊戲本身在 el-dragon-de-tinta/index.html：內建 10 個主題、每個詞 [繁, 簡, 拼音, 西文, 英文]。
(function(){
'use strict';
const T = (k, p) => I18N.t(k, p);

// 開關：由老師管理中心的「遊戲開關」決定（app.js 的 gameOpen，資料在 portalStatus／center-dragon）；沒有 app 時視為開放。
function ready(){ return typeof window.GAME_OPEN === 'function' ? window.GAME_OPEN('dragon') : true; }

// 內建主題（順序和名稱跟遊戲一致：[繁, 簡, 西, 英]）
const BUILTIN = [
  ['food', '食物', '食物', 'Comida', 'Food'], ['fruit', '水果', '水果', 'Frutas', 'Fruit'], ['animal', '動物', '动物', 'Animales', 'Animals'],
  ['color', '顏色', '颜色', 'Colores', 'Colors'], ['transport', '交通', '交通', 'Transporte', 'Transport'], ['body', '身體', '身体', 'Cuerpo', 'Body'],
  ['clothes', '衣服', '衣服', 'Ropa', 'Clothes'], ['job', '職業', '职业', 'Profesiones', 'Jobs'], ['weather', '天氣', '天气', 'Clima', 'Weather'],
  ['home', '家裡', '家里', 'En casa', 'At home']
];
const IDS = BUILTIN.map(x => x[0]);
const FREE_TEACHER = ['food', 'animal', 'color', 'transport', 'home'];     // 免費老師可以選的 5 個主題
const PUBLIC_FREE = ['food', 'animal', 'color'];                           // 公開頁（學生）開放的 3 個主題
const LANG_I = { tc: 1, sc: 2, es: 3, en: 4 };
const builtinName = id => { const b = BUILTIN.find(x => x[0] === id); return b ? b[LANG_I[I18N.getLang()]] : id; };
const isFreeId = id => FREE_TEACHER.indexOf(id) >= 0;
const MAX_T = 3, MAX_W = 40, MIN_W = 6, MAX_SETS = 15;

// ---- 範圍名稱、摘要 ----
function setSummary(set, themes){
  const names = set.builtin.map(builtinName).concat(set.custom.map(id => { const t = themes.find(x => x.id === id); return t ? '★' + t.name : ''; }).filter(Boolean));
  return names.join(I18N.getLang() === 'es' || I18N.getLang() === 'en' ? ', ' : '、');
}
// 成績冊裡設定（k）的名稱
function themeLabel(k, themes){
  if(IDS.indexOf(k) >= 0) return builtinName(k);
  const t = (themes || []).find(x => x.id === k);
  return t ? '★ ' + t.name : null;
}

// ---- 自訂主題草稿 ----
// 文字格式：每行一個詞，「繁體」或「繁體，西文，英文」（分隔符號：逗號、｜、Tab、分號都可以）
const HAN = /[㐀-鿿]/;
function parseText(text){
  const items = [], seen = new Set(), bad = [];
  String(text || '').split(/\r?\n/).forEach(line => {
    if(!line.trim()) return;
    const p = line.split(/[,，｜|\t;；]/).map(x => x.trim());
    const t = (p[0] || '').replace(/\s+/g, '');
    if(!t || !HAN.test(t) || Array.from(t).length > 4){ bad.push(line.trim()); return; }
    if(seen.has(t)) return;
    seen.add(t); items.push({ t, es: (p[1] || '').slice(0, 60), en: (p[2] || '').slice(0, 60) });
  });
  return { items, bad };
}
const wordsToText = words => (words || []).map(w => [w[0], w[3] || '', w[4] || ''].join('，').replace(/[，]+$/, '')).join('\n');
const rowsToText = rows => (rows || []).map(r => [r.t, r.es || '', r.en || ''].join('，').replace(/[，]+$/, '')).join('\n');
function draftFrom(theme){
  if(!theme) return { name: '', text: '', rows: null, msg: '' };
  return { name: theme.name, text: wordsToText(theme.words), rows: theme.words.map(w => ({ t: w[0], s: w[1], p: w[2], es: w[3] || '', en: w[4] || '' })), msg: '' };
}
// 用文字重新產生表格：簡體、拼音用函式庫算；已經有的（老師改過的）保留
async function generate(dr){
  const { items, bad } = parseText(dr.text);
  if(bad.length) return { err: T('dragonBadLine', { line: bad[0] }) };
  if(items.length < MIN_W) return { err: T('dragonTooFew', { n: MIN_W }) };
  if(items.length > MAX_W) return { err: T('dragonTooMany', { n: MAX_W }) };
  const old = {}; (dr.rows || []).forEach(r => { old[r.t] = r; });
  const rows = [];
  for(const it of items){
    const o = old[it.t];
    const s = o && o.s ? o.s : await window.CORRE.simpOf(it.t);
    const p = o && o.p ? o.p : await window.CORRE.pinyinOf(it.t);
    rows.push({ t: it.t, s, p, es: it.es || (o ? o.es : ''), en: it.en || (o ? o.en : '') });
  }
  return { rows };
}
function draftValid(dr){
  const name = (dr.name || '').trim();
  if(!name) return T('dragonNeedName');
  if(!dr.rows) return T('dragonNeedGen');
  if(dr.rows.length < MIN_W) return T('dragonTooFew', { n: MIN_W });
  if(dr.rows.length > MAX_W) return T('dragonTooMany', { n: MAX_W });
  if(dr.rows.some(r => !String(r.p || '').trim())) return T('dragonNeedPy');
  return '';
}
const toTheme = dr => ({ name: dr.name.trim().slice(0, 12), words: dr.rows.map(r => [r.t, (r.s || r.t).trim().slice(0, 4), String(r.p || '').trim().slice(0, 60), String(r.es || '').trim().slice(0, 60), String(r.en || '').trim().slice(0, 60)]) });

// ---- 內建主題詞庫（學習單用）：直接讀遊戲網頁裡的 THEMES，不另存一份，才不會跟遊戲不一致 ----
const BASE = window.DRAGON_BASE || '../el-dragon-de-tinta/';
let builtinP = null;
function loadBuiltin(){
  if(!builtinP) builtinP = (async () => {
    const resp = await fetch(BASE + 'index.html', { cache: 'no-cache' });
    if(!resp.ok) throw new Error('load ' + resp.status);
    const html = await resp.text();
    const m = /const THEMES = (\[[\s\S]*?\n\]);\s*\n/.exec(html);
    if(!m) throw new Error('THEMES not found');
    const list = new Function('return ' + m[1])();
    if(!Array.isArray(list) || !list.length) throw new Error('THEMES empty');
    return list;
  })().catch(e => { builtinP = null; throw e; });
  return builtinP;
}

// ---- 學習單 PDF（canvas 畫成 A4 圖片頁，再包成 PDF，不會缺字；做法同跑吧學習單）----
const PDFW = 1240, PDFH = 1754, PM = 90;
const WS_TXT = {
  es: { name: 'Nombre:', date: 'Fecha:', list: 'Lista de palabras', ans: 'Respuestas', title: 'El dragón de tinta', mix: 'Mezcla',
    match: 'Une cada palabra con su significado (escribe la letra).', t1: 'Traduce al español.', t2: 'Escribe en chino.', sent: 'Escribe una oración con cada palabra.',
    dict: 'Dictado: escucha y escribe la palabra en chino.', choice: 'Elige el significado correcto (escribe la letra).',
    n_match: 'Unir', n_t1: 'Chino → español', n_t2: 'Español → chino', n_sent: 'Oración', n_dict: 'Dictado', n_choice: 'Elección múltiple' },
  en: { name: 'Name:', date: 'Date:', list: 'Word list', ans: 'Answer key', title: 'Ink Dragon', mix: 'Mixed',
    match: 'Match each word with its meaning (write the letter).', t1: 'Translate into English.', t2: 'Write in Chinese.', sent: 'Write a sentence with each word.',
    dict: 'Dictation: listen and write the word in Chinese.', choice: 'Choose the correct meaning (write the letter).',
    n_match: 'Matching', n_t1: 'Chinese → English', n_t2: 'English → Chinese', n_sent: 'Sentences', n_dict: 'Dictation', n_choice: 'Multiple choice' },
  zh: { name: '姓名：', date: '日期：', list: '詞語表', ans: '答案', title: '墨龍飛天', mix: '混合出題',
    match: '', t1: '', t2: '', sent: '用每個詞造一個句子。', dict: '聽寫：聽老師唸，寫出詞語。', choice: '',
    n_match: '配對', n_t1: '', n_t2: '', n_sent: '造句', n_dict: '聽寫', n_choice: '' }
};
// 題型順序；needTr＝要有翻譯才能出（只有中文時不能用）
const WS_TYPES = [['match', true], ['t1', true], ['t2', true], ['choice', true], ['dict', false], ['sent', false]];
function shuffle(a){ for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
// themes：[{ name, words:[[繁,簡,拼音,西,英]] }]（已經是要印的順序）
// opt：{ lang:'es'|'en'|'zh', simp, pinyin, zhuyin, match, answers, count, title }
async function makeWorksheet(themes, opt){
  const L = WS_TXT[opt.lang] || WS_TXT.es, zhOnly = opt.lang === 'zh';
  const ZY = window.CORRE.ZY, TY = opt.types || {};
  const tr = w => zhOnly ? '' : (opt.lang === 'en' ? (w[4] || w[3]) : (w[3] || w[4])) || '';
  const FF = '"Noto Sans TC","PingFang TC","Microsoft JhengHei","Noto Sans CJK TC",sans-serif';
  const txt = themes.map(t => t.name + t.words.map(w => w[0] + w[1] + w[2] + ZY.conv(w[2]) + tr(w)).join('')).join('') + Object.keys(L).map(k => L[k]).join('') + (opt.title || '') + '略ABCDEFGHIJKLMNOPQRST0123456789.:_-/()→… ';
  try{ await Promise.all([document.fonts.load('900 44px "Noto Sans TC"', txt), document.fonts.load('500 26px "Noto Sans TC"', txt)]); }catch(e){}
  const K = opt.scale || 1, LW = PDFW / K, LH = PDFH / K;   // 字大小：用畫布縮放，版面照比例重排
  const pages = [];
  let cv, c, y, curTitle = '';
  const newPage = () => { cv = document.createElement('canvas'); cv.width = PDFW; cv.height = PDFH; c = cv.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, PDFW, PDFH); c.setTransform(K, 0, 0, K, 0, 0); c.textBaseline = 'alphabetic'; pages.push(cv); y = PM; };
  const font = (w, px) => { c.font = w + ' ' + px + 'px ' + FF; };
  const wText = w => opt.simp ? (w[1] || w[0]) : w[0];
  const rowH = (opt.pinyin && opt.zhuyin) ? 78 : 62;
  const word = (w, x, top) => { font(900, 40); c.fillStyle = '#111'; c.textAlign = 'left'; c.fillText(wText(w), x, top + 42); };
  const reading = (w, x, top) => {
    let yy = top + 28; font(500, 24); c.fillStyle = '#555'; c.textAlign = 'left';
    if(opt.pinyin){ c.fillText(w[2], x, yy); yy += 28; }
    if(opt.zhuyin){ c.fillText(ZY.conv(w[2]), x, yy); }
  };
  const head = title => {
    font(900, 46); c.fillStyle = '#0a6b73'; c.textAlign = 'left'; c.fillText(title, PM, y + 44); y += 70;
    font(500, 26); c.fillStyle = '#333'; c.fillText(L.name + ' ____________________', PM, y + 26); c.fillText(L.date + ' ______________', LW / 2 + 40, y + 26); y += 58;
    c.strokeStyle = '#0a6b73'; c.lineWidth = 3; c.beginPath(); c.moveTo(PM, y); c.lineTo(LW - PM, y); c.stroke(); y += 30;
  };
  const ensure = h => { if(y + h > LH - PM - 40){ newPage(); head(curTitle); } };
  const sectionTitle = name => { ensure(60 + rowH * 2); font(700, 32); c.fillStyle = '#0a6b73'; c.textAlign = 'left'; c.fillText(name, PM, y + 32); y += 56; };
  const instr = text => { ensure(160); font(700, 28); c.fillStyle = '#0a6b73'; c.textAlign = 'left'; c.fillText(text, PM, y + 28); y += 58; };
  const num = (i, top) => { font(700, 30); c.fillStyle = '#0a6b73'; c.textAlign = 'left'; c.fillText((i + 1) + '.', PM, top + 42); };
  const fit = (text, maxW) => { let t = String(text || ''); if(c.measureText(t).width <= maxW) return t; while(t.length > 1 && c.measureText(t + '…').width > maxW) t = t.slice(0, -1); return t + '…'; };
  const line = (x1, x2, yy) => { c.strokeStyle = '#555'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x1, yy); c.lineTo(x2, yy); c.stroke(); };
  const N = opt.count || 10, allWords = [].concat.apply([], themes.map(t => t.words));
  const pickN = (t, needTr) => {
    const pool = shuffle(t.words.filter(w => !needTr || tr(w)).slice()), out = [], seen = new Set();
    for(const w of pool){ const k = needTr ? tr(w).toLowerCase() : w[0]; if(seen.has(k)) continue; seen.add(k); out.push(w); if(out.length >= N) break; }
    return out;
  };
  const letter = i => String.fromCharCode(65 + i);
  const ans = [];   // { theme, type, items:[…] }
  const sections = {
    match(t){
      const pick = pickN(t, true); if(pick.length < 3) return;
      const right = shuffle(pick.map((w, i) => i)), rh = 76;
      instr(L.match);
      pick.forEach((w, i) => {
        ensure(rh); const top = y;
        num(i, top); word(w, PM + 70, top); if(opt.pinyin || opt.zhuyin) reading(w, PM + 290, top + 4);
        font(500, 28); c.fillStyle = '#333'; c.fillText('____', PM + 520, top + 42);
        font(700, 28); c.fillStyle = '#0a6b73'; c.fillText(letter(i) + '.', PM + 660, top + 42);
        font(500, 26); c.fillStyle = '#333'; c.fillText(fit(tr(pick[right[i]]), LW - PM - (PM + 710)), PM + 710, top + 40);
        y += rh;
      });
      ans.push({ theme: t.name, type: 'match', items: pick.map((w, i) => (i + 1) + '-' + letter(right.indexOf(i))) });
      y += 24;
    },
    t1(t){
      const pick = pickN(t, true); if(!pick.length) return; const rh = 76;
      instr(L.t1);
      pick.forEach((w, i) => { ensure(rh); const top = y; num(i, top); word(w, PM + 70, top); if(opt.pinyin || opt.zhuyin) reading(w, PM + 290, top + 4); line(PM + 560, LW - PM, top + 52); y += rh; });
      ans.push({ theme: t.name, type: 't1', items: pick.map((w, i) => (i + 1) + '. ' + tr(w)) });
      y += 24;
    },
    t2(t){
      const pick = pickN(t, true); if(!pick.length) return; const rh = 76;
      instr(L.t2);
      pick.forEach((w, i) => { ensure(rh); const top = y; num(i, top); font(500, 28); c.fillStyle = '#222'; c.textAlign = 'left'; c.fillText(fit(tr(w), 520), PM + 70, top + 40); line(PM + 640, LW - PM, top + 52); y += rh; });
      ans.push({ theme: t.name, type: 't2', items: pick.map((w, i) => (i + 1) + '. ' + wText(w)) });
      y += 24;
    },
    choice(t){
      const pick = pickN(t, true); if(pick.length < 3) return; const rh = 140;
      instr(L.choice);
      const items = [];
      pick.forEach((w, i) => {
        ensure(rh); const top = y, good = tr(w);
        const wrong = []; const seen = new Set([good.toLowerCase()]);
        [t.words, allWords].forEach(src => shuffle(src.slice()).forEach(x => { const k = tr(x); if(wrong.length < 3 && k && !seen.has(k.toLowerCase())){ seen.add(k.toLowerCase()); wrong.push(k); } }));
        const opts = shuffle([good].concat(wrong)), at = opts.indexOf(good);
        num(i, top); word(w, PM + 70, top); if(opt.pinyin || opt.zhuyin) reading(w, PM + 290, top + 4);
        opts.forEach((o, j) => {
          const x = PM + 70 + (j % 2) * 470, yy = top + 76 + Math.floor(j / 2) * 38;
          font(700, 26); c.fillStyle = '#0a6b73'; c.fillText(letter(j) + '.', x, yy); font(500, 25); c.fillStyle = '#333'; c.fillText(fit(o, 400), x + 40, yy);
        });
        items.push((i + 1) + '-' + letter(at)); y += rh;
      });
      ans.push({ theme: t.name, type: 'choice', items });
      y += 24;
    },
    dict(t){
      const pick = pickN(t, false); if(!pick.length) return; const rh = 72;
      instr(L.dict);
      pick.forEach((w, i) => {
        ensure(rh); const top = y; num(i, top); line(PM + 70, PM + 520, top + 52);
        if(!zhOnly && tr(w)){ font(500, 24); c.fillStyle = '#666'; c.textAlign = 'left'; c.fillText('(' + fit(tr(w), LW - PM - (PM + 560) - 30) + ')', PM + 560, top + 44); }
        y += rh;
      });
      ans.push({ theme: t.name, type: 'dict', items: pick.map((w, i) => (i + 1) + '. ' + wText(w)) });
      y += 24;
    },
    sent(t){
      const pick = pickN(t, false); if(!pick.length) return; const rh = 166;
      instr(L.sent);
      pick.forEach((w, i) => {
        ensure(rh); const top = y; num(i, top); word(w, PM + 70, top); if(opt.pinyin || opt.zhuyin) reading(w, PM + 290, top + 4);
        if(!zhOnly && tr(w)){ font(500, 24); c.fillStyle = '#666'; c.textAlign = 'left'; c.fillText('(' + fit(tr(w), LW - PM - (PM + 560) - 30) + ')', PM + 560, top + 44); }
        line(PM + 70, LW - PM, top + 92); line(PM + 70, LW - PM, top + 142);
        y += rh;
      });
      ans.push({ theme: t.name, type: 'sent', items: ['略'] });
      y += 24;
    }
  };
  // 1. 各主題的題目（一個主題一組頁面，題型照 WS_TYPES 的順序）
  const chosen = WS_TYPES.filter(x => TY[x[0]] && !(x[1] && zhOnly)).map(x => x[0]);
  // 混合出題：把勾選的主題合成一份，隨機挑題；題數一樣
  let qThemes = themes;
  if(opt.mix && themes.length > 1){
    const seenW = new Set(), words = [];
    allWords.forEach(w => { if(!seenW.has(w[0])){ seenW.add(w[0]); words.push(w); } });
    qThemes = [{ name: L.mix, words }];
  }
  if(chosen.length) qThemes.forEach(t => {
    curTitle = (opt.title ? opt.title + ' · ' : '') + t.name + ' · ' + L.title;
    newPage(); head(curTitle);
    chosen.forEach(k => sections[k](t));
  });
  // 2. 答案頁（造句只寫「略」）
  if(opt.answers && ans.length){
    curTitle = L.ans; newPage(); head(L.ans);
    const seenTheme = [];
    ans.forEach(a => { if(seenTheme.indexOf(a.theme) < 0) seenTheme.push(a.theme); });
    seenTheme.forEach(name => {
      ensure(140); font(700, 30); c.fillStyle = '#0a6b73'; c.textAlign = 'left'; c.fillText(name, PM, y + 30); y += 52;
      ans.filter(a => a.theme === name).forEach(a => {
        ensure(80); font(700, 26); c.fillStyle = '#555'; c.fillText(L['n_' + a.type], PM, y + 26); y += 44;
        font(500, 28); c.fillStyle = '#222';
        let x = PM;
        a.items.forEach(it => {
          const w = c.measureText(it).width + 44;
          if(x + w > LW - PM && x > PM){ x = PM; y += 44; ensure(50); font(500, 28); c.fillStyle = '#222'; }
          c.textAlign = 'left'; c.fillText(it, x, y + 28); x += w;
        });
        y += 60;
      });
      y += 10;
    });
  }
  // 3. 附單字表：完整的單字表放在最後面（答案頁之後）
  if(opt.list){
    const trX = PM + (opt.pinyin || opt.zhuyin ? 640 : 330);
    curTitle = (opt.title ? opt.title + ' · ' : '') + L.title + ' · ' + L.list; newPage(); head(curTitle);
    themes.forEach(t => {
      sectionTitle(t.name);
      t.words.forEach(w => {
        ensure(rowH + 4);
        word(w, PM, y); if(opt.pinyin || opt.zhuyin) reading(w, PM + 300, y + 4);
        if(!zhOnly){ font(500, 26); c.fillStyle = '#333'; c.textAlign = 'left'; c.fillText(fit(tr(w), LW - PM - trX), trX, y + 40); }
        y += rowH;
        c.strokeStyle = '#e3e3e3'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(PM, y - 8); c.lineTo(LW - PM, y - 8); c.stroke();
      });
      y += 24;
    });
  }
  if(!pages.length) return { err: 'empty' };
  pages.forEach((p, i) => {
    const g = p.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#999'; g.font = '500 22px ' + FF; g.textAlign = 'center';
    g.fillText('每天一分鐘 · 墨龍飛天 · ' + (i + 1) + ' / ' + pages.length, PDFW / 2, PDFH - 50);
  });
  if(opt.preview) return { previews: pages.map(p => p.toDataURL('image/jpeg', 0.6)), pages: pages.length };
  const jpegs = pages.map(p => { const bin = atob(p.toDataURL('image/jpeg', 0.85).split(',')[1]), u = new Uint8Array(bin.length); for(let k = 0; k < bin.length; k++) u[k] = bin.charCodeAt(k); return u; });
  return { blob: window.CORRE.buildPdf(jpegs, PDFW, PDFH), pages: pages.length };
}

window.DRAGON = { ready, BUILTIN, IDS, FREE_TEACHER, PUBLIC_FREE, builtinName, isFreeId, setSummary, themeLabel, parseText, rowsToText, draftFrom, generate, draftValid, toTheme,
  loadBuiltin, makeWorksheet, MAX_T, MAX_W, MIN_W, MAX_SETS };
})();
