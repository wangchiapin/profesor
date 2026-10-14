// 跑吧！漢字：句庫編輯器、句庫 QR 圖、學習單 PDF。從 corre/teacher/index.html 搬過來，資料格式完全相同。
// 編輯器自己畫自己的畫面（句子格子很多，不跟著整頁重畫），app.js 只負責把它放進 #correEd。
(function(){
'use strict';
const TX = window.CORRE_TX;
const LMAP = { tc: 'zh', sc: 'cn', es: 'es', en: 'en' };
const lang = () => LMAP[I18N.getLang()] || 'zh';
function tr(key, vars){
  let s = (TX[lang()] && TX[lang()][key]) || TX.zh[key] || key;
  if(vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
  return s;
}
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = id => document.getElementById('ce-' + id);
function mk(tag, cls, text){ const e = document.createElement(tag); if(cls) e.className = cls; if(text != null) e.textContent = text; return e; }
function setSt(el, msg, cls){ if(!el) return; el.textContent = msg || ''; el.className = 'st' + (cls ? ' ' + cls : ''); }
const explainError = e => DATA.explain(e, k => tr(k));

const MAX_CHARS = 20, FREE_SENT = 50, PRO_SENT = 80, FREE_SLOTS = 1, PRO_SLOTS = 5;

// ================= 繁簡轉換與拼音（台灣讀音）：兩個函式庫只在編輯器裡用到，第一次用時才載入 =================
const LIBS = ['https://cdn.jsdelivr.net/npm/opencc-js@1.4.1/dist/umd/full.js', 'https://cdn.jsdelivr.net/npm/pinyin-pro@3.20.0/dist/index.js'];
// 讀音以教育部《重編國語辭典修訂本》為準。pinyin-pro 預設是大陸讀音，所以先放一份「台灣讀音例外表」（與教師頁相同）。
const TW_PINYIN = {
  '還是': 'hái shì', '還有': 'hái yǒu', '還要': 'hái yào', '還沒': 'hái méi', '還差': 'hái chà',
  '嗎': 'ma', '誰': 'shéi', '幾': 'jǐ', '喔': 'ō', '唷': 'yō', '耶': 'ye', '啦': 'la', '囉': 'luo',
  '什麼': 'shén me', '謝謝': 'xiè xie', '麻煩': 'má fan', '我們': 'wǒ men', '你們': 'nǐ men',
  '東西': 'dōng xi', '朋友': 'péng yǒu', '覺得': 'jué de', '著': 'zhe', '只': 'zhǐ',
  '著急': 'zháo jí',
  '同事': 'tóng shì', '冰塊': 'bīng kuài', '加料': 'jiā liào', '找您': 'zhǎo nín',
  '會不會': 'huì bú huì', '算啊': 'suàn a', '了啦': 'le la', '做得': 'zuò de', '時候': 'shí hou', '記得': 'jì de',
  '蘋果': 'píng guǒ', '名字': 'míng zi', '這個': 'zhè ge',
  '垃圾': 'lè sè', '星期': 'xīng qí',
  '睡覺': 'shuì jiào', '公車': 'gōng chē', '公車站': 'gōng chē zhàn', '休息': 'xiū xí', '衣服': 'yī fú',
  '意思': 'yì si', '媽媽': 'mā ma', '對不起': 'duì bu qǐ', '有空': 'yǒu kòng', '便宜': 'pián yí'
};
const TW_WHOLE_CELL = { '和': 'hàn', '了': 'le' };   // 整格只有這一個字時才套用
let libsP = null;
function loadLibs(){
  if(window.OpenCC && window.pinyinPro) return Promise.resolve();
  if(!libsP){
    libsP = Promise.all(LIBS.map(src => new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error(tr('libFail')));
      document.head.appendChild(s);
    }))).then(() => {
      if(!window.OpenCC || !window.pinyinPro) throw new Error(tr('libFail'));
      if(typeof pinyinPro.customPinyin === 'function') pinyinPro.customPinyin(TW_PINYIN);
    }).catch(e => { libsP = null; throw e; });
  }
  return libsP;
}
let conv = null;
const toSimplified = text => { if(!conv) conv = OpenCC.Converter({ from: 'tw', to: 'cn' }); return conv(text); };
const isDigits = s => /^[零一二三四五六七八九]+$/.test(s);
const HAS_HAN = /[㐀-鿿]/;
function toPinyinTW(trad, simp){
  if(Object.prototype.hasOwnProperty.call(TW_WHOLE_CELL, trad)) return TW_WHOLE_CELL[trad];
  const opt = { toneType: 'symbol', toneSandhi: !isDigits(trad) };
  let py = pinyinPro.pinyin(trad, opt);
  if(HAS_HAN.test(py)) py = pinyinPro.pinyin(simp, opt);   // 冷僻繁體字函式庫不認得時，改用簡體字再算一次
  return py;
}
async function translateZh(text, target){
  const resp = await fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=zh-CN|' + target);
  if(!resp.ok) throw new Error('翻譯服務暫時無法使用，請自行輸入翻譯。');
  const data = await resp.json();
  const t = data && data.responseData && data.responseData.translatedText;
  if(!t || /MYMEMORY WARNING/i.test(t)) throw new Error('翻譯額度暫時用完或失敗，請自行輸入翻譯。');
  return t;
}
// 「一」「不」單獨成一格時，要看後面的字自己補變調
function toneOf(py){
  const m = (py || '').split(' ')[0];
  if(/[āēīōūǖ]/.test(m)) return 1; if(/[áéíóúǘ]/.test(m)) return 2; if(/[ǎěǐǒǔǚ]/.test(m)) return 3; if(/[àèìòùǜ]/.test(m)) return 4;
  return 0;
}
function fixYiBu(trad, arr){
  return arr.map((py, i) => {
    const t = trad[i], next = arr[i + 1];
    if((t !== '不' && t !== '一') || !next) return py;
    const nt = toneOf(next);
    if(t === '不') return nt === 4 ? 'bú' : 'bù';
    if(isDigits(trad[i + 1])) return py;
    return nt === 4 ? 'yí' : 'yì';
  });
}
function makeTokens(raw){
  const trad = raw.trim().split(/\s+/).filter(Boolean);
  const simp = trad.map(t => toSimplified(t));
  return { trad, simp, pinyin: fixYiBu(trad, trad.map((t, i) => toPinyinTW(t, simp[i]))) };
}
const countHan = arr => Array.from((arr || []).join('')).filter(c => HAS_HAN.test(c)).length;
const keyOf = trad => (trad || []).join('');

// 拼音（帶聲調符號）→ 注音
const ZY = (function(){
  const INI = { b:'ㄅ',p:'ㄆ',m:'ㄇ',f:'ㄈ',d:'ㄉ',t:'ㄊ',n:'ㄋ',l:'ㄌ',g:'ㄍ',k:'ㄎ',h:'ㄏ',j:'ㄐ',q:'ㄑ',x:'ㄒ',zh:'ㄓ',ch:'ㄔ',sh:'ㄕ',r:'ㄖ',z:'ㄗ',c:'ㄘ',s:'ㄙ' };
  const FIN = { a:'ㄚ',o:'ㄛ',e:'ㄜ',ê:'ㄝ',ai:'ㄞ',ei:'ㄟ',ao:'ㄠ',ou:'ㄡ',an:'ㄢ',en:'ㄣ',ang:'ㄤ',eng:'ㄥ',er:'ㄦ',
    i:'ㄧ',ia:'ㄧㄚ',io:'ㄧㄛ',ie:'ㄧㄝ',iao:'ㄧㄠ',iu:'ㄧㄡ',iou:'ㄧㄡ',ian:'ㄧㄢ',in:'ㄧㄣ',iang:'ㄧㄤ',ing:'ㄧㄥ',
    u:'ㄨ',ua:'ㄨㄚ',uo:'ㄨㄛ',uai:'ㄨㄞ',ui:'ㄨㄟ',uei:'ㄨㄟ',uan:'ㄨㄢ',un:'ㄨㄣ',uen:'ㄨㄣ',uang:'ㄨㄤ',ong:'ㄨㄥ',ueng:'ㄨㄥ',
    v:'ㄩ',ve:'ㄩㄝ',van:'ㄩㄢ',vn:'ㄩㄣ',iong:'ㄩㄥ' };
  const MARK = ['', '', 'ˊ', 'ˇ', 'ˋ'];
  function one(syl){
    let s = syl.normalize('NFD'), tone = 5;
    if(/̄/.test(s)) tone = 1; else if(/́/.test(s)) tone = 2; else if(/̌/.test(s)) tone = 3; else if(/̀/.test(s)) tone = 4;
    s = s.replace(/ü/g, 'v').replace(/Ü/g, 'v').replace(/[̀-ͯ]/g, '').replace(/ü/g, 'v').toLowerCase();
    if(!/^[a-zê]+$/.test(s)) return syl;
    let ini = '', rest = s, m;
    if(s === 'n' || s === 'm'){ const zz = s === 'n' ? 'ㄣ' : 'ㄇㄨ'; return tone === 5 ? '˙' + zz : zz + MARK[tone]; }
    if(s === 'er' || s === 'r') rest = 'er';
    else if((m = s.match(/^(zh|ch|sh|[bpmfdtnlgkhjqxrzcs])/))){ ini = m[1]; rest = s.slice(ini.length); }
    else if(s[0] === 'y'){
      rest = s.slice(1);
      if(/^u/.test(rest)) rest = rest.replace(/^u/, 'v');
      else if(!(rest === 'i' || rest === 'in' || rest === 'ing')) rest = 'i' + rest;
    }else if(s[0] === 'w'){ rest = s.slice(1); rest = rest === 'u' ? 'u' : 'u' + rest; }
    if(ini && /^[jqx]$/.test(ini)) rest = rest.replace(/^u/, 'v');
    if(/^(zh|ch|sh|r|z|c|s)$/.test(ini) && rest === 'i') rest = '';
    const f = rest === '' ? '' : FIN[rest];
    if(f === undefined) return syl;
    const z = (ini ? INI[ini] : '') + f;
    return tone === 5 ? '˙' + z : z + MARK[tone];
  }
  return { conv: py => String(py || '').trim().split(/\s+/).filter(Boolean).map(one).join(' ') };
})();
const phText = (py, kind) => kind === 'zhuyin' ? ZY.conv(py) : kind === 'both' ? py + '  ' + ZY.conv(py) : py;

// ================= 狀態 =================
let ACC = null;        // app.js 的帳號資料（S.a）：plan、bslots、banks
let ED = null;         // 編輯中的句庫 { slot, sid, name, speed, script, boss, phonetic, sentences, dirty }
let FORM = null;       // 畫面重畫（例如切換語言）時暫存還沒加入的輸入
let editingIdx = -1, bulkReady = [];
const planOn = () => !!(ACC && ACC.plan && ACC.plan.active);
const maxSent = () => planOn() ? PRO_SENT : FREE_SENT;
const cap = () => ED && ED.slot === 0 ? maxSent() : PRO_SENT;
const bankOf = (acct, slot) => (acct.banks || []).find(b => b.slot === slot);

// 打開某個位置。回傳 null = 可以編輯；否則回傳原因（i18n 的 key）
function open(acct, slot){
  ACC = acct;
  if(!acct.extrasReady) return 'unavailable';
  const b = bankOf(acct, slot);
  if(!b && slot >= FREE_SLOTS && !acct.plan.active) return 'locked';
  if(ED && ED.slot === slot) return null;
  const d = b ? b.data || {} : null;
  ED = d
    ? { slot, sid: b.sid, name: d.name || '', speed: d.speed || 'normal', script: d.script || 'trad', boss: d.boss !== false, phonetic: d.phonetic || 'pinyin',
        sentences: (d.sentences || []).filter(s => s && Array.isArray(s.trad)).map(s => Object.assign({}, s)), dirty: false }
    : { slot, sid: null, name: '', speed: 'normal', script: 'trad', boss: true, phonetic: 'pinyin', sentences: [], dirty: false };
  FORM = null; editingIdx = -1; bulkReady = []; resetPick();
  return null;
}
function close(){ ED = null; FORM = null; editingIdx = -1; bulkReady = []; resetPick(); }
const isDirty = () => !!(ED && ED.dirty);
window.addEventListener('beforeunload', e => { if(isDirty()){ e.preventDefault(); e.returnValue = ''; } });

// ================= 畫面 =================
const groupHtml = (g, cur, list) => '<div class="row" style="margin-top:0">' + list.map(x =>
  '<button class="pill sm ' + (cur === x[0] ? 'on' : '') + '" data-g="' + g + '" data-v="' + x[0] + '">' + esc(x[1]) + '</button>').join('') + '</div>';
function shellHtml(){
  const sel = (g, cur) => ({
    speed: groupHtml('speed', cur, [['facil', tr('facil')], ['normal', tr('normal')], ['dificil', tr('dificil')]]),
    script: groupHtml('script', cur, [['trad', tr('trad')], ['simp', tr('simp')]]),
    phonetic: groupHtml('phonetic', cur, [['pinyin', tr('phPinyin')], ['zhuyin', tr('phZhuyin')], ['both', tr('phBoth')]]),
    boss: groupHtml('boss', cur, [['1', tr('on')], ['0', tr('off')]])
  })[g];
  return '<div class="row"><button class="pill sm" id="ce-back">' + esc(tr('back')) + '</button></div>' +
    '<div id="ce-notice"></div>' +
    '<div class="card"><h3>' + esc(tr('bankSettings')) + ' · ' + esc(tr('slotN', { n: ED.slot + 1 })) + '</h3>' +
      '<div class="field"><label for="ce-name">' + esc(tr('bankName')) + '</label><input type="text" id="ce-name" maxlength="40" placeholder="' + esc(tr('autoNameDefault')) + '"></div>' +
      '<div class="field"><label>' + esc(tr('speed')) + '</label><div id="ce-g-speed"></div></div>' +
      '<div class="field"><label>' + esc(tr('script')) + '</label><div id="ce-g-script"></div></div>' +
      '<div class="field"><label>' + esc(tr('phonetic')) + '</label><div id="ce-g-phonetic"></div></div>' +
      '<div class="field"><label>' + esc(tr('boss')) + '</label><div id="ce-g-boss"></div></div></div>' +
    '<div class="card"><h3>' + esc(tr('sec1')) + '</h3><p class="hint">' + esc(tr('inputHint', { n: MAX_CHARS })) + '</p>' +
      '<textarea id="ce-sent" rows="2" placeholder="我 喜歡 吃 蘋果"></textarea>' +
      '<div class="field"><label for="ce-esTop">' + esc(tr('esLabel')) + '</label><textarea id="ce-esTop" rows="2" placeholder="Me gusta comer manzanas."></textarea></div>' +
      '<div class="field"><label for="ce-enTop">' + esc(tr('enLabel')) + '</label><textarea id="ce-enTop" rows="2" placeholder="I like eating apples."></textarea></div>' +
      '<p class="hint">' + esc(tr('autoHint')) + '</p>' +
      '<div class="row"><button class="pill fill" id="ce-gen">' + esc(tr('gen')) + '</button></div><div class="st" id="ce-genSt"></div></div>' +
    '<div class="card" id="ce-preview" hidden><h3>' + esc(tr('sec2')) + '</h3><p class="hint">' + esc(tr('checkHint')) + '</p>' +
      '<div class="tk-head"><span></span><span>' + esc(tr('cTrad')) + '</span><span>' + esc(tr('cSimp')) + '</span><span>' + esc(tr('cPy')) + '</span><span></span></div>' +
      '<div id="ce-tokens"></div><div class="row"><button class="pill sm" id="ce-addTok">' + esc(tr('addCell')) + '</button></div>' +
      '<div class="field"><label for="ce-es">' + esc(tr('esLabel')) + '</label><textarea id="ce-es" rows="2"></textarea></div>' +
      '<div class="field"><label for="ce-en">' + esc(tr('enLabel')) + '</label><textarea id="ce-en" rows="2"></textarea></div>' +
      '<div class="row"><button class="pill fill" id="ce-addSent"></button><button class="pill" id="ce-cancelEdit" hidden>' + esc(tr('cancelEdit')) + '</button></div>' +
      '<div class="st" id="ce-addSt"></div></div>' +
    '<div class="card"><h3>' + esc(tr('bulk')) + '</h3><p class="hint">' + esc(tr('bulkHint')) + '</p>' +
      '<textarea id="ce-bulk" rows="5" placeholder="我 喜歡 吃 蘋果 | Me gusta comer manzanas. | I like eating apples."></textarea>' +
      '<div class="row"><button class="pill" id="ce-bulkCheck">' + esc(tr('bulkCheck')) + '</button><button class="pill fill" id="ce-bulkGo" hidden>' + esc(tr('bulkGo')) + '</button></div>' +
      '<div class="st" id="ce-bulkSt"></div><div id="ce-bulkPrev"></div></div>' +
    '<div class="card"><h3>' + esc(tr('pickTitle')) + '</h3><p class="hint">' + esc(tr('pickHint', { n: MAX_CHARS })) + '</p>' +
      '<div class="row" id="ce-pickSrc"></div>' +
      '<div id="ce-pickPanel" hidden>' +
        '<div id="ce-packBox" hidden><select id="ce-packSel"></select><p class="hint" id="ce-packDesc"></p></div>' +
        '<input type="text" id="ce-pickFilter" style="margin-top:8px">' +
        '<div class="row"><button class="pill fill sm" id="ce-pickAdd">' + esc(tr('pickAddSel')) + '</button><button class="pill sm" id="ce-pickAll" hidden>' + esc(tr('pickAddAll')) + '</button><span class="mut" id="ce-pickCount"></span></div>' +
        '<div class="st" id="ce-pickSt"></div><div id="ce-pickList"></div>' +
        '<div class="row"><button class="pill sm" id="ce-pickMore" hidden>' + esc(tr('pickMore')) + '</button></div>' +
      '</div></div>' +
    '<div class="card"><h3>' + esc(tr('inBank')) + ' <span class="mut" id="ce-counter"></span></h3><div id="ce-sents"></div></div>' +
    '<div class="savebar"><button class="pill fill" id="ce-save">' + esc(tr('saveBank')) + '</button>' +
      '<span class="dirty" id="ce-dirty" hidden>' + esc(tr('unsaved')) + '</span><span class="st" id="ce-saveSt"></span></div>';
}
function renderGroups(){
  $('g-speed').innerHTML = groupHtml('speed', ED.speed, [['facil', tr('facil')], ['normal', tr('normal')], ['dificil', tr('dificil')]]);
  $('g-script').innerHTML = groupHtml('script', ED.script, [['trad', tr('trad')], ['simp', tr('simp')]]);
  $('g-phonetic').innerHTML = groupHtml('phonetic', ED.phonetic, [['pinyin', tr('phPinyin')], ['zhuyin', tr('phZhuyin')], ['both', tr('phBoth')]]);
  $('g-boss').innerHTML = groupHtml('boss', ED.boss ? '1' : '0', [['1', tr('on')], ['0', tr('off')]]);
}
function markDirty(){ if(ED){ ED.dirty = true; const d = $('dirty'); if(d) d.hidden = false; } }
function renderMeta(){
  const n = ED.sentences.length, max = cap();
  const c = $('counter'); c.textContent = '(' + n + ' / ' + max + ')';
  c.className = n >= max ? 'err' : n > FREE_SENT ? 'warn' : 'mut';
  const note = $('notice'); note.textContent = '';
  if(n > FREE_SENT) note.appendChild(mk('div', 'notice', tr('over50')));
  if(ED.slot > 0 && !planOn()) note.appendChild(mk('div', 'notice', tr('expiredNotice')));
  $('addSent').textContent = editingIdx >= 0 ? tr('updSent') : tr('addSent');
  $('cancelEdit').hidden = editingIdx < 0;
  $('dirty').hidden = !ED.dirty;
  renderPick();
}
function renderSents(){
  const box = $('sents'); box.textContent = '';
  const sc = ED.script === 'simp' ? 'simp' : 'trad';
  ED.sentences.forEach((s, i) => {
    const card = mk('div', 'sent');
    const info = mk('div', 'info');
    info.appendChild(mk('div', 'hz', (i + 1) + '. ' + (s[sc] || s.trad || []).join(' · ')));
    info.appendChild(mk('div', 'py', phText((s.pinyin || []).join('  '), ED.phonetic)));
    info.appendChild(mk('div', 'tl', s.es || ''));
    info.appendChild(mk('div', 'tl mut', s.en || tr('noEn')));
    info.appendChild(mk('small', null, tr('sentCount', { n: countHan(s.trad) })));
    const acts = mk('div', 'acts');
    const e = mk('button', 'x', '✏️'); e.title = tr('updSent'); e.addEventListener('click', () => startEdit(i));
    const d = mk('button', 'x', '🗑'); d.title = I18N.t('del');
    d.addEventListener('click', () => {
      ED.sentences.splice(i, 1);
      if(editingIdx === i) resetForm(); else if(editingIdx > i) editingIdx--;
      markDirty(); renderSents();
    });
    acts.appendChild(e); acts.appendChild(d);
    card.appendChild(info); card.appendChild(acts); box.appendChild(card);
  });
  renderMeta();
}
// ---- 逐詞微調表 ----
function tokenRows(data){
  $('tokens').textContent = '';
  const n = Math.max(data.trad.length, data.simp.length, data.pinyin.length);
  for(let i = 0; i < n; i++) addRow(data.trad[i] || '', data.simp[i] || '', data.pinyin[i] || '');
}
function addRow(trad, simp, py){
  const row = mk('div', 'tk');
  row.appendChild(mk('span', 'idx'));
  [['trad', trad], ['simp', simp], ['pinyin', py]].forEach(([cls, v]) => { const inp = document.createElement('input'); inp.type = 'text'; inp.className = cls; inp.value = v; row.appendChild(inp); });
  const rm = mk('button', 'x', '✕'); rm.addEventListener('click', () => { row.remove(); reindex(); });
  row.appendChild(rm); $('tokens').appendChild(row); reindex();
}
function reindex(){ document.querySelectorAll('#ce-tokens .tk').forEach((r, i) => { r.querySelector('.idx').textContent = i + 1; }); }
function collect(){
  const rows = [...document.querySelectorAll('#ce-tokens .tk')];
  const g = c => rows.map(r => r.querySelector('.' + c).value.trim()).filter(Boolean);
  return { trad: g('trad'), simp: g('simp'), pinyin: g('pinyin') };
}
function resetForm(){
  editingIdx = -1;
  ['sent', 'esTop', 'enTop', 'es', 'en'].forEach(k => { $(k).value = ''; });
  $('tokens').textContent = ''; $('preview').hidden = true;
  setSt($('genSt'), ''); setSt($('addSt'), '');
  renderMeta();
}
function startEdit(i){
  const s = ED.sentences[i]; editingIdx = i;
  $('sent').value = (s.trad || []).join(' '); $('esTop').value = s.es || ''; $('enTop').value = s.en || '';
  tokenRows({ trad: s.trad || [], simp: s.simp || [], pinyin: s.pinyin || [] });
  $('es').value = s.es || ''; $('en').value = s.en || '';
  $('preview').hidden = false; setSt($('addSt'), '');
  renderMeta();
  $('preview').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
async function runGenerate(){
  const raw = $('sent').value.trim(), st = $('genSt');
  if(!raw){ setSt(st, tr('needInput'), 'err'); return; }
  const trad = raw.split(/\s+/).filter(Boolean), han = countHan(trad);
  if(han > MAX_CHARS){ setSt(st, tr('tooLong', { n: han, max: MAX_CHARS }), 'err'); return; }
  const btn = $('gen'); btn.disabled = true; setSt(st, tr('genWorking'));
  try{
    await loadLibs();
    const simp = trad.map(t => toSimplified(t));
    const py = fixYiBu(trad, trad.map((t, i) => toPinyinTW(t, simp[i])));
    let es = $('esTop').value.trim(), en = $('enTop').value.trim(), auto = false, enFailed = false;
    if(!es){ setSt(st, tr('genTranslating')); es = await translateZh(simp.join(''), 'es'); $('esTop').value = es; auto = true; }
    if(!en){ try{ en = await translateZh(simp.join(''), 'en'); $('enTop').value = en; auto = true; }catch(e){ enFailed = true; } }
    if(!ED) return;
    tokenRows({ trad, simp, pinyin: py });
    $('es').value = es; $('en').value = en;
    $('preview').hidden = false;
    setSt(st, (auto ? tr('genDone') : tr('genDoneNoAuto')) + (enFailed ? ' ' + tr('enFailed') : ''), 'ok');
  }catch(e){ console.error(e); setSt(st, (e && e.message) || 'error', 'err'); }
  finally{ if($('gen')) $('gen').disabled = false; }
}
function addSentence(){
  const st = $('addSt'), tk = collect(), es = $('es').value.trim(), en = $('en').value.trim();
  if(!tk.trad.length || !tk.simp.length || !tk.pinyin.length){ setSt(st, tr('emptyCells'), 'err'); return; }
  if(tk.trad.length !== tk.simp.length || tk.trad.length !== tk.pinyin.length){ setSt(st, tr('mismatch'), 'err'); return; }
  const han = countHan(tk.trad);
  if(han > MAX_CHARS){ setSt(st, tr('tooLong', { n: han, max: MAX_CHARS }), 'err'); return; }
  if(han < 1){ setSt(st, tr('needInput'), 'err'); return; }
  if(!es){ setSt(st, tr('needEs'), 'err'); return; }
  const k = keyOf(tk.trad);
  if(ED.sentences.some((s, i) => i !== editingIdx && keyOf(s.trad) === k)){ setSt(st, tr('dup'), 'err'); return; }
  const obj = { trad: tk.trad, simp: tk.simp, pinyin: tk.pinyin, es, en };
  let msg;
  if(editingIdx >= 0){ ED.sentences[editingIdx] = obj; msg = tr('updated'); }
  else{
    if(ED.sentences.length >= cap()){ setSt(st, tr('full', { max: cap() }), 'err'); return; }
    ED.sentences.push(obj); msg = tr('added');
  }
  resetForm(); markDirty(); renderSents();
  setSt($('genSt'), msg, 'ok');
  $('sent').focus();
}
// ---- 批次匯入 ----
async function bulkCheck(){
  bulkReady = []; $('bulkGo').hidden = true; $('bulkPrev').textContent = '';
  const lines = $('bulk').value.split('\n').map(l => l.trim()).filter(Boolean), st = $('bulkSt');
  if(!lines.length){ setSt(st, tr('needInput'), 'err'); return; }
  $('bulkCheck').disabled = true; setSt(st, tr('genWorking'));
  try{
    await loadLibs();
    const have = new Set(ED.sentences.map(s => keyOf(s.trad)));
    let room = cap() - ED.sentences.length, ok = 0, skip = 0;
    for(let i = 0; i < lines.length; i++){
      const parts = lines[i].split('|'), tk = makeTokens(parts[0]);
      if(!tk.trad.length) continue;
      let es = (parts[1] || '').trim(), en = (parts[2] || '').trim(), note = '', bad = false;
      const han = countHan(tk.trad), key = keyOf(tk.trad);
      if(han < 1 || han > MAX_CHARS){ note = tr('skipLong', { max: MAX_CHARS }); bad = true; }
      else if(have.has(key)){ note = tr('skipDup'); bad = true; }
      else if(room <= 0){ note = tr('skipFull'); bad = true; }
      else{
        if(!es){
          setSt(st, tr('genTranslating') + ' (' + (i + 1) + '/' + lines.length + ')');
          try{ es = await translateZh(tk.simp.join(''), 'es'); note = tr('autoTr'); }catch(e){ note = tr('skipTr'); bad = true; }
        }
        if(!bad && !en){ try{ en = await translateZh(tk.simp.join(''), 'en'); note = tr('autoTr'); }catch(e){ en = ''; } }
      }
      if(!ED) return;
      if(!bad){ have.add(key); room--; ok++; bulkReady.push({ trad: tk.trad, simp: tk.simp, pinyin: tk.pinyin, es, en }); } else skip++;
      const card = mk('div', 'sent' + (bad ? ' dis' : '')), info = mk('div', 'info');
      info.appendChild(mk('div', 'hz', tk.trad.join(' · ')));
      info.appendChild(mk('div', 'py', phText(tk.pinyin.join('  '), ED.phonetic)));
      info.appendChild(mk('div', 'tl', es)); info.appendChild(mk('div', 'tl mut', en));
      if(note) info.appendChild(mk('small', null, note));
      card.appendChild(info); $('bulkPrev').appendChild(card);
    }
    setSt(st, tr('bulkRes', { ok, skip }), 'ok');
    $('bulkGo').hidden = bulkReady.length === 0;
  }catch(e){ console.error(e); setSt(st, (e && e.message) || 'error', 'err'); }
  finally{ if($('bulkCheck')) $('bulkCheck').disabled = false; }
}
function bulkGo(){
  const n = bulkReady.length; if(!n) return;
  const room = cap() - ED.sentences.length;
  bulkReady.slice(0, Math.max(0, room)).forEach(s => ED.sentences.push(s));
  bulkReady = []; $('bulkGo').hidden = true; $('bulkPrev').textContent = ''; $('bulk').value = '';
  setSt($('bulkSt'), tr('bulkAdded', { n: Math.min(n, Math.max(0, room)) }), 'ok');
  markDirty(); renderSents();
}
// ---- 儲存（上傳）----
async function saveBank(){
  const st = $('saveSt');
  const name = ($('name').value || '').trim().slice(0, 40) || tr('autoNameDefault');
  const n = ED.sentences.length;
  if(!n){ setSt(st, tr('needOne'), 'err'); return; }
  if(n > cap()){ setSt(st, tr('full', { max: cap() }), 'err'); return; }
  const pro = ED.slot > 0 || n > FREE_SENT;
  if(pro && !planOn()){ setSt(st, tr('needSub'), 'err'); return; }
  if(!ED.sentences.every(s => countHan(s.trad) >= 1 && countHan(s.trad) <= MAX_CHARS)){ setSt(st, tr('tooLong', { n: '>' + MAX_CHARS, max: MAX_CHARS }), 'err'); return; }
  const btn = $('save'); btn.disabled = true; setSt(st, tr('saving'));
  const ed = ED;
  try{
    const clean = ed.sentences.map(s => ({ trad: s.trad, simp: s.simp, pinyin: s.pinyin, es: s.es, en: s.en || '' }));
    const data = { name, speed: ed.speed, script: ed.script, boss: !!ed.boss, sentences: clean, pro };
    if(ed.phonetic === 'zhuyin' || ed.phonetic === 'both') data.phonetic = ed.phonetic;   // 預設拼音：不寫入（與教師頁相同）
    const r = await DATA.saveCorreBank(ACC.bslots || {}, ed.slot, ed.sid, data);
    ACC.bslots = r.slots; ed.sid = r.sid; ed.name = name; ed.dirty = false;
    const full = Object.assign({ owner: '', slot: ed.slot }, data);
    const old = bankOf(ACC, ed.slot);
    if(old){ old.sid = r.sid; old.name = name; old.data = full; }
    else{ ACC.banks.push({ slot: ed.slot, sid: r.sid, name, data: full }); ACC.banks.sort((a, b) => a.slot - b.slot); }
    if(ED === ed){ $('name').value = name; renderMeta(); setSt(st, tr('saved'), 'ok'); }
  }catch(e){ console.error(e); if(ED === ed) setSt(st, tr('saveFail', { m: explainError(e) }), 'err'); }
  finally{ if($('save')) $('save').disabled = false; }
}

// ================= 從公開題庫／主題包挑句子 =================
// 公開題庫在遊戲用的 corre-d16da 專案（第二個 Firebase app，只讀）；主題包在中心專案 site_content。
const POOL_CONFIG = {
  apiKey: 'AIzaSyA0jxyA3ZqWcFfsN1nu5Zol33QSxwrgq68', authDomain: 'corre-d16da.firebaseapp.com', projectId: 'corre-d16da',
  storageBucket: 'corre-d16da.firebasestorage.app', messagingSenderId: '734685362204', appId: '1:734685362204:web:fec4c0f9f39b1730dfc7d9'
};
const POOL_COL = 'mandarinRunnerSentences', PACK_COL = 'site_content', PACK_PREFIX = 'corre_pack_', POOL_PAGE = 20, POOL_MAX = 100;
let pdb = null;
function poolDb(){
  if(!pdb){ try{ pdb = firebase.initializeApp(POOL_CONFIG, 'pool').firestore(); }catch(e){ console.warn('pool init failed', e); } }
  return pdb;
}
const newPool = () => ({ items: [], r: Math.random(), phase: 1, last: null, read: 0, done: false, capped: false, loading: false, err: null, plainTried: false });
const PICK = { src: null, sel: new Map(), msg: null, filter: '', pool: newPool(), packs: null, packsErr: null, packId: null, loadingPacks: false };
function resetPick(){ PICK.src = null; PICK.sel.clear(); PICK.msg = null; PICK.filter = ''; }
function cleanSentence(r){
  if(!r || !Array.isArray(r.trad) || !r.trad.length) return null;
  const n = r.trad.length;
  if(!Array.isArray(r.simp) || r.simp.length !== n || !Array.isArray(r.pinyin) || r.pinyin.length !== n) return null;
  if(typeof r.es !== 'string' || !r.es.trim()) return null;
  const str = a => a.map(x => String(x));
  return { trad: str(r.trad), simp: str(r.simp), pinyin: str(r.pinyin), es: r.es, en: typeof r.en === 'string' ? r.en : '' };
}
const pickRoom = () => ED ? Math.max(0, cap() - ED.sentences.length) : 0;
const setPickMsg = (text, cls) => { PICK.msg = text ? { text, cls: cls || '' } : null; };
async function poolLoadMore(){
  const P = PICK.pool, db = poolDb();
  if(P.loading || P.done || !db) return;
  P.loading = true; P.err = null; renderPick();
  try{
    const col = db.collection(POOL_COL);
    let got = 0;
    const take = snap => snap.docs.forEach(d => { P.read++; got++; const s = cleanSentence(d.data()); if(s) P.items.push({ id: d.id, s }); });
    while(!P.done && got < POOL_PAGE){
      const need = Math.min(POOL_PAGE - got, POOL_MAX - P.read);
      if(need <= 0){ P.done = true; P.capped = true; break; }
      let q = P.phase === 1 ? col.where('rand', '>=', P.r).orderBy('rand') : col.where('rand', '<', P.r).orderBy('rand');
      if(P.last) q = q.startAfter(P.last);
      const snap = await q.limit(need).get();
      take(snap);
      if(snap.docs.length) P.last = snap.docs[snap.docs.length - 1];
      if(snap.docs.length < need){ if(P.phase === 1){ P.phase = 2; P.last = null; } else P.done = true; }
    }
    if(!P.done && P.read >= POOL_MAX){ P.done = true; P.capped = true; }
    if(P.done && P.read === 0 && !P.plainTried){ P.plainTried = true; P.capped = false; take(await col.limit(POOL_PAGE).get()); }
  }catch(e){ console.error(e); P.err = e; }
  finally{ P.loading = false; renderPick(); }
}
async function packsLoad(){
  if(PICK.loadingPacks || PICK.packs) return;
  if(!planOn()){ renderPick(); return; }       // 非訂閱者不查（規則也會擋）
  PICK.loadingPacks = true; PICK.packsErr = null; renderPick();
  try{
    const snap = await firebase.firestore().collection(PACK_COL).where('kind', '==', 'corre_pack').get();
    PICK.packs = snap.docs.filter(d => d.id.indexOf(PACK_PREFIX) === 0).map(d => ({ id: d.id, data: d.data() }));
    PICK.packs.sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
    if(!PICK.packs.some(p => p.id === PICK.packId)) PICK.packId = PICK.packs.length ? PICK.packs[0].id : null;
  }catch(e){ console.error(e); PICK.packsErr = e; }
  finally{ PICK.loadingPacks = false; renderPick(); }
}
function packText(obj, id){
  const o = obj || {}, L = lang();
  if(L === 'es' || L === 'en') return o.es || o.zh || id || '';
  const z = o.zh || o.es || id || '';
  if(L === 'cn' && window.OpenCC){ try{ return toSimplified(z); }catch(e){} }
  return z;
}
function pickItems(){
  let rows;
  if(PICK.src === 'pool') rows = PICK.pool.items.map(x => x.s);
  else{ const p = (PICK.packs || []).find(x => x.id === PICK.packId); rows = p ? (p.data.sentences || []).map(cleanSentence).filter(Boolean) : []; }
  const seen = new Set();
  return rows.map(s => ({ key: keyOf(s.trad), s })).filter(it => { if(seen.has(it.key)) return false; seen.add(it.key); return true; });
}
function pickState(it, have){ const han = countHan(it.s.trad); if(han < 1 || han > MAX_CHARS) return 'long'; return have.has(it.key) ? 'dup' : 'ok'; }
function renderPick(){
  const srcBox = $('pickSrc'); if(!srcBox || !ED) return;
  srcBox.innerHTML = [['pool', tr('pickPool')], ['pack', tr('pickPack')]].map(x =>
    '<button class="pill sm ' + (PICK.src === x[0] ? 'on' : '') + '" data-pick="' + x[0] + '">' + esc(x[1]) + '</button>').join('');
  const panel = $('pickPanel'); panel.hidden = !PICK.src;
  if(!PICK.src) return;
  const isPack = PICK.src === 'pack', P = PICK.pool, st = $('pickSt'), list = $('pickList');
  list.textContent = ''; $('pickMore').hidden = true;
  const denied = isPack && PICK.packsErr && PICK.packsErr.code === 'permission-denied';
  const locked = isPack && (!planOn() || denied);
  $('packBox').hidden = !isPack || locked;
  $('pickFilter').hidden = locked; $('pickAdd').hidden = locked; $('pickAll').hidden = !isPack || locked; $('pickCount').hidden = locked;
  $('pickFilter').placeholder = tr('pickFilter');
  if(locked){
    setSt(st, '');
    const n = mk('div', 'notice', tr('packNeedSub') + ' ');
    const a = mk('a', null, tr('subscribe')); a.href = DATA.PORTAL_URL; a.target = '_blank'; a.rel = 'noopener'; n.appendChild(a);
    list.appendChild(n); return;
  }
  if(isPack){
    const sel = $('packSel'); sel.textContent = '';
    (PICK.packs || []).forEach(p => { const o = document.createElement('option'); o.value = p.id; o.textContent = packText(p.data.name, p.id) + ' · ' + tr('packCount', { n: (p.data.sentences || []).length }); sel.appendChild(o); });
    if(PICK.packId) sel.value = PICK.packId;
    sel.hidden = !(PICK.packs && PICK.packs.length);
    const cur = (PICK.packs || []).find(x => x.id === PICK.packId);
    $('packDesc').textContent = cur ? packText(cur.data.desc, '') : '';
  }
  const have = new Set(ED.sentences.map(s => keyOf(s.trad))), items = pickItems();
  PICK.sel.forEach((s, k) => { const it = items.find(x => x.key === k); if(!it || pickState(it, have) !== 'ok') PICK.sel.delete(k); });
  const f = PICK.filter.trim().toLowerCase();
  const show = items.filter(it => !f || [it.s.trad.join(''), it.s.simp.join(''), it.s.pinyin.join(' '), it.s.es, it.s.en].join('\n').toLowerCase().indexOf(f) >= 0);
  show.forEach(it => {
    const state = pickState(it, have), s = it.s;
    const card = mk('label', 'sent pick' + (state === 'ok' ? '' : ' dis'));
    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.disabled = state !== 'ok'; cb.checked = PICK.sel.has(it.key);
    cb.addEventListener('change', () => {
      if(cb.checked){
        if(PICK.sel.size >= pickRoom()){ cb.checked = false; setSt(st, pickRoom() ? tr('pickNoRoom', { n: pickRoom() }) : tr('pickRoomFull', { max: cap() }), 'err'); return; }
        PICK.sel.set(it.key, s);
      }else PICK.sel.delete(it.key);
      setPickMsg(''); setSt(st, ''); updatePickCount();
    });
    const info = mk('div', 'info');
    info.appendChild(mk('div', 'hz', (ED.script === 'simp' ? s.simp : s.trad).join(' · ')));
    info.appendChild(mk('div', 'py', phText(s.pinyin.join('  '), ED.phonetic)));
    info.appendChild(mk('div', 'tl', s.es)); info.appendChild(mk('div', 'tl mut', s.en || tr('noEn')));
    if(state === 'long') info.appendChild(mk('small', 'err', tr('pickLong', { max: MAX_CHARS }) + ' · ' + tr('sentCount', { n: countHan(s.trad) })));
    if(state === 'dup') info.appendChild(mk('small', null, tr('pickDup')));
    card.appendChild(cb); card.appendChild(info); list.appendChild(card);
  });
  const loading = isPack ? PICK.loadingPacks : P.loading, e = isPack ? PICK.packsErr : P.err;
  if(!show.length && !loading && !e) list.appendChild(mk('p', 'hint', isPack && !(PICK.packs && PICK.packs.length) ? tr('packNone') : tr('pickEmpty')));
  if(!isPack && !P.done && !P.loading) $('pickMore').hidden = false;
  if(loading) setSt(st, I18N.t('loading'));
  else if(e) setSt(st, tr(isPack ? 'packLoadFail' : 'pickPoolFail', { m: explainError(e) }), 'err');
  else if(PICK.msg) setSt(st, PICK.msg.text, PICK.msg.cls);
  else if(!isPack && P.capped) setSt(st, tr('pickPoolCap', { n: POOL_MAX }));
  else setSt(st, '');
  updatePickCount();
}
function updatePickCount(){ const c = $('pickCount'); if(c) c.textContent = tr('pickSelCount', { n: PICK.sel.size, room: pickRoom() }); }
function pickAdd(sentences){
  let room = pickRoom();
  if(room <= 0){ setPickMsg(tr('pickRoomFull', { max: cap() }), 'err'); renderPick(); return; }
  const have = new Set(ED.sentences.map(s => keyOf(s.trad)));
  let added = 0, skipped = 0, cut = 0;
  sentences.forEach(s => {
    const k = keyOf(s.trad), han = countHan(s.trad);
    if(han < 1 || han > MAX_CHARS || have.has(k)){ skipped++; return; }
    if(room <= 0){ cut++; return; }
    ED.sentences.push({ trad: s.trad.slice(), simp: s.simp.slice(), pinyin: s.pinyin.slice(), es: s.es, en: s.en || '' });
    have.add(k); room--; added++;
  });
  let msg = skipped ? tr('pickAddedSkip', { n: added, skip: skipped }) : tr('pickAdded', { n: added });
  if(cut) msg += ' ' + tr('pickCut', { max: cap() });
  PICK.sel.clear(); setPickMsg(msg, added ? 'ok' : 'err');
  if(added){ markDirty(); renderSents(); } else renderPick();
}
function pickSetSrc(src){
  PICK.src = PICK.src === src ? null : src; PICK.sel.clear(); setPickMsg('');
  PICK.filter = ''; if($('pickFilter')) $('pickFilter').value = '';   // 換來源就清掉篩選字
  if(PICK.src === 'pool' && !PICK.pool.items.length && !PICK.pool.done) poolLoadMore();
  else if(PICK.src === 'pack') packsLoad();
  renderPick();
}

// ================= 放進畫面（app.js 每次重畫後呼叫）=================
// 重畫前先把還沒加入的輸入記下來，放回去時還原
function capture(){
  if(!ED || !$('sent')) return;
  const rows = [...document.querySelectorAll('#ce-tokens .tk')].map(r => ['trad', 'simp', 'pinyin'].map(c => r.querySelector('.' + c).value));
  FORM = { name: $('name').value, sent: $('sent').value, esTop: $('esTop').value, enTop: $('enTop').value, es: $('es').value, en: $('en').value,
    bulk: $('bulk').value, rows, preview: !$('preview').hidden, filter: $('pickFilter').value, scroll: window.scrollY };
}
function mount(el, onBack){
  if(!ED) return;
  el.innerHTML = shellHtml();
  renderGroups();
  $('name').value = FORM ? FORM.name : ED.name;
  if(FORM){
    ['sent', 'esTop', 'enTop', 'es', 'en', 'bulk'].forEach(k => { $(k).value = FORM[k] || ''; });
    FORM.rows.forEach(r => addRow(r[0], r[1], r[2]));
    $('preview').hidden = !FORM.preview;
    $('pickFilter').value = FORM.filter || '';
  }
  renderSents();
  if(FORM){ const y = FORM.scroll; setTimeout(() => window.scrollTo(0, y), 0); }
  FORM = null;
  $('back').addEventListener('click', onBack);
  el.addEventListener('click', e => {
    const g = e.target.closest('[data-g]');
    if(g){
      const v = g.dataset.v, k = g.dataset.g;
      if(k === 'boss') ED.boss = v === '1'; else ED[k] = v;
      renderGroups(); markDirty();
      if(k === 'phonetic' || k === 'script') renderSents();
      return;
    }
    const p = e.target.closest('[data-pick]'); if(p) pickSetSrc(p.dataset.pick);
  });
  $('name').addEventListener('input', () => { ED.name = $('name').value; markDirty(); });
  $('gen').addEventListener('click', runGenerate);
  $('addTok').addEventListener('click', () => addRow('', '', ''));
  $('addSent').addEventListener('click', addSentence);
  $('cancelEdit').addEventListener('click', resetForm);
  $('bulkCheck').addEventListener('click', bulkCheck);
  $('bulkGo').addEventListener('click', bulkGo);
  $('save').addEventListener('click', saveBank);
  $('pickFilter').addEventListener('input', () => { PICK.filter = $('pickFilter').value; setPickMsg(''); renderPick(); });
  $('packSel').addEventListener('change', () => { PICK.packId = $('packSel').value; PICK.sel.clear(); setPickMsg(''); renderPick(); });
  $('pickMore').addEventListener('click', poolLoadMore);
  $('pickAdd').addEventListener('click', () => { if(!PICK.sel.size){ setPickMsg(tr('pickNothing'), 'err'); renderPick(); return; } pickAdd(Array.from(PICK.sel.values())); });
  $('pickAll').addEventListener('click', () => pickAdd(pickItems().map(it => it.s)));
}

// ================= 句庫卡片用的小工具 =================
function summary(b, plan){
  const d = b.data || {}, n = (d.sentences || []).length, on = !!(plan && plan.active);
  const max = b.slot === 0 ? (on ? PRO_SENT : FREE_SENT) : PRO_SENT;
  return tr('count', { n, max }) + ' · ' + tr(d.speed || 'normal') + ' · ' + tr(d.script === 'simp' ? 'simp' : 'trad') + (d.pro ? ' · ' + tr('planPro') : '');
}
const paused = (b, plan) => !!(b.data && b.data.pro) && !(plan && plan.active);
async function remove(acct, slot){
  const b = bankOf(acct, slot); if(!b) return;
  acct.bslots = await DATA.deleteCorreBank(acct.bslots || {}, slot, b.sid);
  acct.banks = acct.banks.filter(x => x.slot !== slot);
  if(ED && ED.slot === slot) close();
}
function bankName(b){ return (b && (b.name || (b.data && b.data.name))) || tr('slotN', { n: (b ? b.slot : 0) + 1 }); }

// ---- QR 圖（下面印句庫名稱）----
function qrCanvas(url, title){
  const qr = qrcode(0, 'M'); qr.addData(url); qr.make();
  const n = qr.getModuleCount(), quiet = 4, cell = Math.floor(560 / (n + quiet * 2)), qs = cell * (n + quiet * 2);
  const W = qs + 80, H = qs + 190;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d');
  c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); c.fillStyle = '#000';
  for(let r = 0; r < n; r++) for(let k = 0; k < n; k++) if(qr.isDark(r, k)) c.fillRect(40 + (k + quiet) * cell, 40 + (r + quiet) * cell, cell, cell);
  c.textAlign = 'center'; c.fillStyle = '#111';
  let fs = 40; c.font = '900 ' + fs + 'px "Noto Sans TC",sans-serif';
  while(c.measureText(title).width > W - 60 && fs > 18){ fs -= 2; c.font = '900 ' + fs + 'px "Noto Sans TC",sans-serif'; }
  c.fillText(title, W / 2, qs + 40 + 60);
  c.fillStyle = '#555'; c.font = '500 24px "Noto Sans TC",sans-serif';
  c.fillText('跑吧！漢字 · 每天一分鐘', W / 2, qs + 40 + 110);
  return cv;
}

// ================= 學習單 PDF（canvas 畫成 A4 圖片頁，再包成 PDF，不會缺字）=================
const PDFW = 1240, PDFH = 1754, PM = 90;
const WS_TXT = {
  es: { name: 'Nombre:', date: 'Fecha:', s1: 'Frases', s2: 'Ordena las palabras para formar la frase.', ans: 'Respuestas' },
  en: { name: 'Name:', date: 'Date:', s1: 'Sentences', s2: 'Put the words in order to make a sentence.', ans: 'Answer key' }
};
function buildPdf(jpegs, pw, ph){
  const enc = new TextEncoder(), parts = [], offs = [];
  let len = 0;
  const push = b => { const u = typeof b === 'string' ? enc.encode(b) : b; parts.push(u); len += u.length; };
  const n = jpegs.length, objCount = 2 + n * 3;
  push(new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52, 10, 37, 226, 227, 207, 211, 10]));
  const obj = (id, dict, stream) => {
    offs[id] = len; push(id + ' 0 obj\n');
    if(stream){ push(dict.replace('LEN', stream.length) + '\nstream\n'); push(stream); push('\nendstream\nendobj\n'); }
    else push(dict + '\nendobj\n');
  };
  const kids = []; for(let i = 0; i < n; i++) kids.push((3 + i * 3) + ' 0 R');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + n + ' >>');
  for(let i = 0; i < n; i++){
    const pg = 3 + i * 3, ct = pg + 1, im = pg + 2;
    obj(pg, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 ' + im + ' 0 R >> >> /Contents ' + ct + ' 0 R >>');
    obj(ct, '<< /Length LEN >>', enc.encode('q 595.28 0 0 841.89 0 0 cm /Im0 Do Q'));
    obj(im, '<< /Type /XObject /Subtype /Image /Width ' + pw + ' /Height ' + ph + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length LEN >>', jpegs[i]);
  }
  const xref = len;
  let x = 'xref\n0 ' + (objCount + 1) + '\n0000000000 65535 f \n';
  for(let id = 1; id <= objCount; id++) x += String(offs[id]).padStart(10, '0') + ' 00000 n \n';
  push(x + 'trailer\n<< /Size ' + (objCount + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n');
  return new Blob(parts, { type: 'application/pdf' });
}
function seededShuffle(arr, seed){
  const a = arr.map((v, i) => ({ v, i })); let s = seed * 9301 + 49297;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  if(a.every((o, k) => o.i === k)) a.push(a.shift());
  return a.map(o => o.v);
}
async function makeWorksheet(data, opt){
  const script = data.script === 'simp' ? 'simp' : 'trad';
  const L = WS_TXT[opt.lang] || WS_TXT.es;
  const sents = (data.sentences || []).filter(s => s && Array.isArray(s.trad)).map(s => ({
    words: (s[script] || s.trad || []).slice(), py: (s.pinyin || []).slice(), tr: (opt.lang === 'en' ? (s.en || s.es) : s.es) || ''
  }));
  const FF = '"Noto Sans TC","PingFang TC","Microsoft JhengHei","Noto Sans CJK TC",sans-serif';
  const all = sents.map(s => s.words.join('') + s.py.join('') + ZY.conv(s.py.join(' ')) + s.tr).join('') + (data.name || '') + L.name + L.date + L.s1 + L.s2 + L.ans + '0123456789.:_ ';
  try{ await Promise.all([document.fonts.load('900 44px "Noto Sans TC"', all), document.fonts.load('500 26px "Noto Sans TC"', all)]); }catch(e){}
  const pages = [];
  let cv, c, y;
  const newPage = () => { cv = document.createElement('canvas'); cv.width = PDFW; cv.height = PDFH; c = cv.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, PDFW, PDFH); c.textBaseline = 'alphabetic'; c.textAlign = 'left'; pages.push(cv); y = PM; };
  const ensure = h => { if(y + h > PDFH - PM - 40) newPage(); };
  const font = (w, px) => { c.font = w + ' ' + px + 'px ' + FF; };
  const cellInfo = (word, py) => {
    font(900, 44); const wh = c.measureText(word).width;
    let pw = 0, zw = 0, pt = '', zt = '';
    if(opt.pinyin){ pt = py; font(500, 22); pw = c.measureText(pt).width; }
    if(opt.zhuyin){ zt = ZY.conv(py); font(500, 22); zw = c.measureText(zt).width; }
    return { word, pt, zt, w: Math.max(wh, pw, zw) };
  };
  const lineH = (opt.pinyin ? 28 : 0) + 52 + (opt.zhuyin ? 30 : 0);
  const drawCell = (ci, x, top) => {
    c.textAlign = 'center'; const cx = x + ci.w / 2; let yy = top;
    if(opt.pinyin){ font(500, 22); c.fillStyle = '#555'; c.fillText(ci.pt, cx, yy + 22); yy += 28; }
    font(900, 44); c.fillStyle = '#111'; c.fillText(ci.word, cx, yy + 42); yy += 52;
    if(opt.zhuyin){ font(500, 22); c.fillStyle = '#555'; c.fillText(ci.zt, cx, yy + 22); }
    c.textAlign = 'left';
  };
  const layout = (words, py, x0, maxW, gap, pad) => {
    const lines = [[]]; let x = x0;
    words.forEach((w, i) => {
      const ci = cellInfo(w, py[i] || ''), cw = ci.w + pad * 2;
      if(x + cw > x0 + maxW && lines[lines.length - 1].length){ lines.push([]); x = x0; }
      lines[lines.length - 1].push({ x: x + pad, ci, cw }); x += cw + gap;
    });
    return lines;
  };
  newPage();
  font(900, 46); c.fillStyle = '#0a6b73'; c.fillText(data.name || '', PM, y + 44); y += 70;
  font(500, 26); c.fillStyle = '#333';
  c.fillText(L.name + ' ____________________', PM, y + 26);
  c.fillText(L.date + ' ______________', PDFW / 2 + 40, y + 26); y += 58;
  c.strokeStyle = '#0a6b73'; c.lineWidth = 3; c.beginPath(); c.moveTo(PM, y); c.lineTo(PDFW - PM, y); c.stroke(); y += 30;
  font(700, 28); c.fillStyle = '#0a6b73'; c.fillText(L.s1, PM, y + 28); y += 52;
  sents.forEach((s, idx) => {
    const lines = layout(s.words, s.py, PM + 70, PDFW - PM * 2 - 70, 26, 0);
    ensure(lines.length * (lineH + 10) + 44 + 24);
    font(700, 30); c.fillStyle = '#0a6b73'; c.fillText((idx + 1) + '.', PM, y + (opt.pinyin ? 28 : 0) + 40);
    lines.forEach(line => { line.forEach(o => drawCell(o.ci, o.x, y)); y += lineH + 10; });
    font(500, 26); c.fillStyle = '#333'; c.fillText(s.tr, PM + 70, y + 26); y += 44;
    c.strokeStyle = '#ddd'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(PM, y); c.lineTo(PDFW - PM, y); c.stroke(); y += 24;
  });
  if(opt.order){
    const ex = sents.filter(s => s.words.length >= 2);
    if(ex.length){
      newPage();
      font(900, 40); c.fillStyle = '#0a6b73'; c.fillText(L.s2, PM, y + 38); y += 70;
      ex.forEach((s, idx) => {
        const sh = seededShuffle(s.words.map((w, i) => i), idx + 1);
        const lines = layout(sh.map(i => s.words[i]), sh.map(i => s.py[i] || ''), PM + 70, PDFW - PM * 2 - 70, 18, 14);
        ensure(44 + lines.length * (lineH + 34) + 80);
        font(700, 30); c.fillStyle = '#0a6b73'; c.fillText((idx + 1) + '.', PM, y + 40);
        font(500, 24); c.fillStyle = '#666'; c.fillText(s.tr, PM + 70, y + 26); y += 44;
        lines.forEach(line => {
          line.forEach(o => {
            c.strokeStyle = '#0a6b73'; c.lineWidth = 2.5;
            const bx = o.x - 14, bw = o.ci.w + 28, bh = lineH + 20;
            c.beginPath(); if(c.roundRect) c.roundRect(bx, y - 4, bw, bh, 12); else c.rect(bx, y - 4, bw, bh); c.stroke();
            drawCell(o.ci, o.x, y + 6);
          });
          y += lineH + 34;
        });
        c.strokeStyle = '#999'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(PM + 70, y + 40); c.lineTo(PDFW - PM, y + 40); c.stroke();
        y += 80;
      });
      newPage();
      font(900, 40); c.fillStyle = '#0a6b73'; c.fillText(L.ans, PM, y + 38); y += 70;
      ex.forEach((s, idx) => {
        const lines = layout(s.words, s.py, PM + 70, PDFW - PM * 2 - 70, 26, 0);
        ensure(lines.length * (lineH + 10) + 40);
        font(700, 28); c.fillStyle = '#0a6b73'; c.fillText((idx + 1) + '.', PM, y + (opt.pinyin ? 28 : 0) + 38);
        lines.forEach(line => { line.forEach(o => drawCell(o.ci, o.x, y)); y += lineH + 10; });
        y += 20;
      });
    }
  }
  pages.forEach((p, i) => {
    const g = p.getContext('2d'); g.fillStyle = '#999'; g.font = '500 22px ' + FF; g.textAlign = 'center';
    g.fillText('每天一分鐘 · 跑吧！漢字 · ' + (i + 1) + ' / ' + pages.length, PDFW / 2, PDFH - 50);
  });
  const jpegs = pages.map(p => { const bin = atob(p.toDataURL('image/jpeg', 0.85).split(',')[1]), u = new Uint8Array(bin.length); for(let k = 0; k < bin.length; k++) u[k] = bin.charCodeAt(k); return u; });
  return { blob: buildPdf(jpegs, PDFW, PDFH), pages: pages.length };
}

window.CORRE = { tr, open, close, mount, capture, isDirty, summary, paused, remove, bankName, bankOf, qrCanvas, makeWorksheet,
  FREE_SLOTS, PRO_SLOTS, MAX_CHARS, ZY, _toneFix: fixYiBu };
})();
