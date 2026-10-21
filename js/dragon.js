// 墨龍飛天：老師管理中心這一側的資料整理（主題清單、自訂主題草稿、學習單 PDF）。不碰 Firebase（在 data.js）。
// 遊戲本身在 el-dragon-de-tinta/index.html：內建 10 個主題、每個詞 [繁, 簡, 拼音, 西文, 英文]。
(function(){
'use strict';
const T = (k, p) => I18N.t(k, p);

// 正式完成前（RELEASE=false），墨龍在老師中心各頁都顯示「維修中」。網址加 ?dev=dragon 可以先測試（同一個分頁會記住）。
const READY = false;
function ready(){
  if(READY) return true;
  try{
    if(/[?&]dev=dragon\b/.test(location.search)){ sessionStorage.setItem('dragonDev', '1'); return true; }
    return sessionStorage.getItem('dragonDev') === '1';
  }catch(e){ return /[?&]dev=dragon\b/.test(location.search); }
}

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
    if(!t || !HAN.test(t) || Array.from(t).length > 8){ bad.push(line.trim()); return; }
    if(seen.has(t)) return;
    seen.add(t); items.push({ t, es: (p[1] || '').slice(0, 60), en: (p[2] || '').slice(0, 60) });
  });
  return { items, bad };
}
const wordsToText = words => (words || []).map(w => [w[0], w[3] || '', w[4] || ''].join('，').replace(/[，]+$/, '')).join('\n');
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
const toTheme = dr => ({ name: dr.name.trim().slice(0, 12), words: dr.rows.map(r => [r.t, (r.s || r.t).trim().slice(0, 8), String(r.p || '').trim().slice(0, 60), String(r.es || '').trim().slice(0, 60), String(r.en || '').trim().slice(0, 60)]) });

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
  es: { name: 'Nombre:', date: 'Fecha:', list: 'Lista de palabras', match: 'Une cada palabra con su significado (escribe la letra).', ans: 'Respuestas', title: 'El dragón de tinta' },
  en: { name: 'Name:', date: 'Date:', list: 'Word list', match: 'Match each word with its meaning (write the letter).', ans: 'Answer key', title: 'Ink Dragon' },
  zh: { name: '姓名：', date: '日期：', list: '詞語表', match: '', ans: '答案', title: '墨龍飛天' }
};
function shuffle(a){ for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
// themes：[{ name, words:[[繁,簡,拼音,西,英]] }]（已經是要印的順序）
// opt：{ lang:'es'|'en'|'zh', simp, pinyin, zhuyin, match, answers, count, title }
async function makeWorksheet(themes, opt){
  const L = WS_TXT[opt.lang] || WS_TXT.es, zhOnly = opt.lang === 'zh';
  const ZY = window.CORRE.ZY;
  const tr = w => zhOnly ? '' : (opt.lang === 'en' ? (w[4] || w[3]) : (w[3] || w[4])) || '';
  const FF = '"Noto Sans TC","PingFang TC","Microsoft JhengHei","Noto Sans CJK TC",sans-serif';
  const txt = themes.map(t => t.name + t.words.map(w => w[0] + w[1] + w[2] + ZY.conv(w[2]) + tr(w)).join('')).join('') + L.name + L.date + L.list + L.match + L.ans + L.title + (opt.title || '') + 'ABCDEFGHIJKLMNOPQRST0123456789.:_-/ ';
  try{ await Promise.all([document.fonts.load('900 44px "Noto Sans TC"', txt), document.fonts.load('500 26px "Noto Sans TC"', txt)]); }catch(e){}
  const pages = [];
  let cv, c, y;
  const newPage = () => { cv = document.createElement('canvas'); cv.width = PDFW; cv.height = PDFH; c = cv.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, PDFW, PDFH); c.textBaseline = 'alphabetic'; pages.push(cv); y = PM; };
  const ensure = h => { if(y + h > PDFH - PM - 40) newPage(); };
  const font = (w, px) => { c.font = w + ' ' + px + 'px ' + FF; };
  const wText = w => opt.simp ? (w[1] || w[0]) : w[0];
  const rowH = (opt.pinyin && opt.zhuyin) ? 78 : 62;
  const word = (w, x, top) => {
    font(900, 40); c.fillStyle = '#111'; c.textAlign = 'left'; c.fillText(wText(w), x, top + 42);
  };
  const reading = (w, x, top) => {
    let yy = top + 28; font(500, 24); c.fillStyle = '#555'; c.textAlign = 'left';
    if(opt.pinyin){ c.fillText(w[2], x, yy); yy += 28; }
    if(opt.zhuyin){ c.fillText(ZY.conv(w[2]), x, yy); }
    if(!opt.pinyin && !opt.zhuyin) return;
  };
  const head = title => {
    font(900, 46); c.fillStyle = '#0a6b73'; c.fillText(title, PM, y + 44); y += 70;
    font(500, 26); c.fillStyle = '#333'; c.fillText(L.name + ' ____________________', PM, y + 26); c.fillText(L.date + ' ______________', PDFW / 2 + 40, y + 26); y += 58;
    c.strokeStyle = '#0a6b73'; c.lineWidth = 3; c.beginPath(); c.moveTo(PM, y); c.lineTo(PDFW - PM, y); c.stroke(); y += 30;
  };
  const sectionTitle = name => { ensure(60 + rowH * 2); font(700, 32); c.fillStyle = '#0a6b73'; c.textAlign = 'left'; c.fillText(name, PM, y + 32); y += 56; };
  const trX = PM + (opt.pinyin || opt.zhuyin ? 640 : 330);
  // 1. 詞語表
  newPage(); head((opt.title ? opt.title + ' · ' : '') + L.title + ' · ' + L.list);
  themes.forEach(t => {
    sectionTitle(t.name);
    t.words.forEach((w, i) => {
      ensure(rowH + 4);
      word(w, PM, y); if(opt.pinyin || opt.zhuyin) reading(w, PM + 300, y + 4);
      if(!zhOnly){ font(500, 26); c.fillStyle = '#333'; c.textAlign = 'left'; c.fillText(tr(w), trX, y + 40); }
      y += rowH;
      c.strokeStyle = '#e3e3e3'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(PM, y - 8); c.lineTo(PDFW - PM, y - 8); c.stroke();
    });
    y += 24;
  });
  // 2. 配對練習
  const keys = [];
  if(opt.match && !zhOnly){
    themes.forEach(t => {
      const pool = shuffle(t.words.filter(w => tr(w)).slice());
      const pick = []; const seen = new Set();
      for(const w of pool){ const k = tr(w).toLowerCase(); if(seen.has(k)) continue; seen.add(k); pick.push(w); if(pick.length >= (opt.count || 10)) break; }
      if(pick.length < 3) return;
      const right = shuffle(pick.map((w, i) => i));
      keys.push({ name: t.name, key: pick.map((w, i) => String.fromCharCode(65 + right.indexOf(i))) });
      newPage(); head(t.name + ' · ' + L.title);
      font(700, 28); c.fillStyle = '#0a6b73'; c.textAlign = 'left'; c.fillText(L.match, PM, y + 28); y += 60;
      const rh = 76;
      pick.forEach((w, i) => {
        const top = y + i * rh;
        font(700, 30); c.fillStyle = '#0a6b73'; c.textAlign = 'left'; c.fillText((i + 1) + '.', PM, top + 42);
        word(w, PM + 70, top);
        if(opt.pinyin || opt.zhuyin) reading(w, PM + 290, top + 4);
        font(500, 28); c.fillStyle = '#333'; c.textAlign = 'left';
        c.fillText('____', PM + 520, top + 42);
        font(700, 28); c.fillStyle = '#0a6b73'; c.fillText(String.fromCharCode(65 + i) + '.', PM + 660, top + 42);
        font(500, 26); c.fillStyle = '#333'; c.fillText(tr(pick[right[i]]), PM + 710, top + 40);
      });
      y += pick.length * rh;
    });
  }
  // 3. 答案頁
  if(opt.answers && keys.length){
    newPage(); head(L.ans);
    keys.forEach(k => {
      ensure(100);
      font(700, 30); c.fillStyle = '#0a6b73'; c.textAlign = 'left'; c.fillText(k.name, PM, y + 30); y += 50;
      font(500, 28); c.fillStyle = '#222'; c.fillText(k.key.map((a, i) => (i + 1) + '-' + a).join('    '), PM, y + 28); y += 60;
    });
  }
  pages.forEach((p, i) => {
    const g = p.getContext('2d'); g.fillStyle = '#999'; g.font = '500 22px ' + FF; g.textAlign = 'center';
    g.fillText('每天一分鐘 · 墨龍飛天 · ' + (i + 1) + ' / ' + pages.length, PDFW / 2, PDFH - 50);
  });
  const jpegs = pages.map(p => { const bin = atob(p.toDataURL('image/jpeg', 0.85).split(',')[1]), u = new Uint8Array(bin.length); for(let k = 0; k < bin.length; k++) u[k] = bin.charCodeAt(k); return u; });
  return { blob: window.CORRE.buildPdf(jpegs, PDFW, PDFH), pages: pages.length };
}

window.DRAGON = { ready, BUILTIN, IDS, FREE_TEACHER, PUBLIC_FREE, builtinName, isFreeId, setSummary, themeLabel, parseText, draftFrom, generate, draftValid, toTheme,
  loadBuiltin, makeWorksheet, MAX_T, MAX_W, MIN_W, MAX_SETS };
})();
