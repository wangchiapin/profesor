// 天打雷劈學習單 PDF（canvas 畫成 A4 圖片頁，再包成 PDF，不會缺字；做法同墨龍學習單）。
// words：[{ c 繁體, s 簡體, r:[讀音代碼 wo3] }]（已經是要印的字）；讀音一律用字庫裡的（GoodTeacher）。
// opt：{ lang:'es'|'en'|'zh', simp, pinyin, zhuyin（字表要印哪些讀音）, types:{ py, zy, tone }, list, answers, scale, preview, title }
(function(){
'use strict';
const PDFW = 1240, PDFH = 1754, PM = 90;
const TC = {
  zh: { name: '姓名：', date: '日期：', list: '字表', ans: '答案', title: '天打雷劈',
    py: '看字，寫出拼音（要寫聲調）。', zy: '看字，寫出注音（要寫聲調）。', tone: '拼音少了聲調，請補上（寫聲調符號或數字都可以）。',
    n_py: '寫拼音', n_zy: '寫注音', n_tone: '補聲調', h_c: '字', h_py: '拼音', h_zy: '注音' },
  es: { name: 'Nombre:', date: 'Fecha:', list: 'Lista de caracteres', ans: 'Respuestas', title: '¡Cuidado con el rayo!',
    py: 'Mira el carácter y escribe su pinyin con el tono.', zy: 'Mira el carácter y escribe su zhuyin (ㄅㄆㄇㄈ) con el tono.', tone: 'Al pinyin le falta el tono: escríbelo (marca o número).',
    n_py: 'Escribir pinyin', n_zy: 'Escribir zhuyin', n_tone: 'Poner el tono', h_c: 'Carácter', h_py: 'Pinyin', h_zy: 'Zhuyin' },
  en: { name: 'Name:', date: 'Date:', list: 'Character list', ans: 'Answer key', title: 'Watch Out for the Lightning!',
    py: 'Look at the character and write its pinyin with the tone.', zy: 'Look at the character and write its zhuyin (ㄅㄆㄇㄈ) with the tone.', tone: 'The pinyin is missing its tone: write it (mark or number).',
    n_py: 'Write pinyin', n_zy: 'Write zhuyin', n_tone: 'Add the tone', h_c: 'Character', h_py: 'Pinyin', h_zy: 'Zhuyin' }
};
const SC = {   // 簡體介面用字：台灣用語，只是寫成簡體
  name: '姓名：', date: '日期：', list: '字表', ans: '答案', title: '天打雷劈',
  py: '看字，写出拼音（要写声调）。', zy: '看字，写出注音（要写声调）。', tone: '拼音少了声调，请补上（写声调符号或数字都可以）。',
  n_py: '写拼音', n_zy: '写注音', n_tone: '补声调', h_c: '字', h_py: '拼音', h_zy: '注音'
};
const TYPES = ['py', 'zy', 'tone'];
function shuffle(a){ for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const R = window.RAYO;
const py = code => R.toPinyin(code) || code, zy = code => R.toZhuyin(code) || '';
const bare = code => String(code).replace(/[1-5]$/, '').replace(/v/g, 'ü');
const joinR = (codes, f) => (codes || []).map(f).join(' / ');

async function makeWorksheet(words, opt){
  const lang = opt.lang === 'zh' || opt.lang === 'en' ? opt.lang : 'es';
  const L = lang === 'zh' ? (opt.simp ? SC : TC.zh) : TC[lang];
  const TY = opt.types || {};
  const FF = '"Noto Sans TC","PingFang TC","Microsoft JhengHei","Noto Sans CJK TC",sans-serif';
  const wText = w => opt.simp ? (w.s || w.c) : w.c;
  const txt = words.map(w => w.c + (w.s || '') + (w.r || []).map(c => py(c) + zy(c) + bare(c)).join('')).join('') + Object.keys(L).map(k => L[k]).join('') + (opt.title || '') + '略ABCDEFGHIJKLMNOPQRST0123456789.:_-/()→… ';
  try{ await Promise.all([document.fonts.load('900 56px "Noto Sans TC"', txt), document.fonts.load('500 28px "Noto Sans TC"', txt)]); }catch(e){}
  const K = opt.scale || 1, LW = PDFW / K, LH = PDFH / K;   // 字大小：用畫布縮放，版面照比例重排
  const pages = [];
  let cv, c, y, curTitle = '';
  const newPage = () => { cv = document.createElement('canvas'); cv.width = PDFW; cv.height = PDFH; c = cv.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, PDFW, PDFH); c.setTransform(K, 0, 0, K, 0, 0); c.textBaseline = 'alphabetic'; pages.push(cv); y = PM; };
  const font = (w, px) => { c.font = w + ' ' + px + 'px ' + FF; };
  const head = title => {
    font(900, 46); c.fillStyle = '#0a6b73'; c.textAlign = 'left'; c.fillText(title, PM, y + 44); y += 70;
    font(500, 26); c.fillStyle = '#333'; c.fillText(L.name + ' ____________________', PM, y + 26); c.fillText(L.date + ' ______________', LW / 2 + 40, y + 26); y += 58;
    c.strokeStyle = '#0a6b73'; c.lineWidth = 3; c.beginPath(); c.moveTo(PM, y); c.lineTo(LW - PM, y); c.stroke(); y += 30;
  };
  const ensure = h => { if(y + h > LH - PM - 40){ newPage(); head(curTitle); } };
  const instr = text => { ensure(160); font(700, 28); c.fillStyle = '#0a6b73'; c.textAlign = 'left'; c.fillText(text, PM, y + 28); y += 58; };
  const num = (i, top) => { font(700, 30); c.fillStyle = '#0a6b73'; c.textAlign = 'left'; c.fillText((i + 1) + '.', PM, top + 56); };
  const line = (x1, x2, yy) => { c.strokeStyle = '#555'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x1, yy); c.lineTo(x2, yy); c.stroke(); };
  const bigChar = (w, x, top) => { font(900, 56); c.fillStyle = '#111'; c.textAlign = 'left'; c.fillText(wText(w), x, top + 58); };
  const ans = [];   // { type, items:[…] }
  const rh = 84;
  const sections = {
    py(){
      instr(L.py); const pick = shuffle(words.slice());
      pick.forEach((w, i) => { ensure(rh); const top = y; num(i, top); bigChar(w, PM + 70, top); line(PM + 230, LW - PM, top + 62); y += rh; });
      ans.push({ type: 'py', items: pick.map((w, i) => (i + 1) + '. ' + wText(w) + ' ' + joinR(w.r, py)) }); y += 24;
    },
    zy(){
      instr(L.zy); const pick = shuffle(words.slice());
      pick.forEach((w, i) => { ensure(rh); const top = y; num(i, top); bigChar(w, PM + 70, top); line(PM + 230, LW - PM, top + 62); y += rh; });
      ans.push({ type: 'zy', items: pick.map((w, i) => (i + 1) + '. ' + wText(w) + ' ' + joinR(w.r, zy)) }); y += 24;
    },
    tone(){
      instr(L.tone); const pick = shuffle(words.slice());
      pick.forEach((w, i) => {
        ensure(rh); const top = y; num(i, top); bigChar(w, PM + 70, top);
        font(500, 34); c.fillStyle = '#555'; c.textAlign = 'left'; c.fillText(bare(w.r[0]), PM + 230, top + 52);
        line(PM + 520, LW - PM, top + 62); y += rh;
      });
      ans.push({ type: 'tone', items: pick.map((w, i) => (i + 1) + '. ' + wText(w) + ' ' + py(w.r[0])) }); y += 24;
    }
  };
  const chosen = TYPES.filter(k => TY[k]);
  if(chosen.length){ curTitle = (opt.title ? opt.title + ' · ' : '') + L.title; newPage(); head(curTitle); chosen.forEach(k => sections[k]()); }
  // 答案頁
  if(opt.answers && ans.length){
    curTitle = L.ans; newPage(); head(L.ans);
    ans.forEach(a => {
      ensure(80); font(700, 28); c.fillStyle = '#555'; c.textAlign = 'left'; c.fillText(L['n_' + a.type], PM, y + 28); y += 48;
      font(500, 28); c.fillStyle = '#222';
      let x = PM;
      a.items.forEach(it => {
        const w = c.measureText(it).width + 44;
        if(x + w > LW - PM && x > PM){ x = PM; y += 44; ensure(50); font(500, 28); c.fillStyle = '#222'; }
        c.textAlign = 'left'; c.fillText(it, x, y + 28); x += w;
      });
      y += 70;
    });
  }
  // 字表：字＋拼音＋注音（放在最後面）
  if(opt.list){
    const showPy = opt.pinyin !== false, showZy = !!opt.zhuyin, cols = [PM + 120, PM + 120 + (showPy ? 360 : 0)];
    curTitle = (opt.title ? opt.title + ' · ' : '') + L.title + ' · ' + L.list; newPage(); head(curTitle);
    font(700, 26); c.fillStyle = '#0a6b73'; c.textAlign = 'left'; c.fillText(L.h_c, PM, y + 26);
    if(showPy) c.fillText(L.h_py, cols[0], y + 26);
    if(showZy) c.fillText(L.h_zy, cols[1], y + 26);
    y += 46;
    words.forEach(w => {
      ensure(rh);
      font(900, 52); c.fillStyle = '#111'; c.textAlign = 'left'; c.fillText(wText(w), PM, y + 54);
      font(500, 32); c.fillStyle = '#333';
      if(showPy) c.fillText(joinR(w.r, py), cols[0], y + 50);
      if(showZy) c.fillText(joinR(w.r, zy), cols[1], y + 50);
      y += rh;
      c.strokeStyle = '#e3e3e3'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(PM, y - 10); c.lineTo(LW - PM, y - 10); c.stroke();
    });
  }
  if(!pages.length) return { err: 'empty' };
  pages.forEach((p, i) => {
    const g = p.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#999'; g.font = '500 22px ' + FF; g.textAlign = 'center';
    g.fillText('每天一分鐘 · 天打雷劈 · ' + (i + 1) + ' / ' + pages.length, PDFW / 2, PDFH - 50);
  });
  if(opt.preview) return { previews: pages.map(p => p.toDataURL('image/jpeg', 0.6)), pages: pages.length };
  const jpegs = pages.map(p => { const bin = atob(p.toDataURL('image/jpeg', 0.85).split(',')[1]), u = new Uint8Array(bin.length); for(let k = 0; k < bin.length; k++) u[k] = bin.charCodeAt(k); return u; });
  return { blob: window.CORRE.buildPdf(jpegs, PDFW, PDFH), pages: pages.length };
}

window.RAYO_WS = { makeWorksheet, TYPES };
})();
