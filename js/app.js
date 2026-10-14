// 老師管理中心：畫面與操作。資料在 data.js、成績簿表格在 books.js、文字在 i18n.js。
(function(){
'use strict';
const T = (k, p) => I18N.t(k, p);
const esc = BOOKS.esc;
const app = document.getElementById('app');
const GAMES = ['corre', 'colores', 'bbk'];
const GAME_KEY = { corre: 'gameCorre', colores: 'gameColores', bbk: 'gameBbk' };
const GAME_DESC = { corre: 'gameCorreDesc', colores: 'gameColoresDesc', bbk: 'gameBbkDesc' };

const S = {
  authSeen: false, user: null, acct: '', msg: '', a: null,          // a = loadAccount 的結果
  route: 'home', cur: null,
  game: 'corre', days: 0, tab: 'stu', sel: null,
  scores: [], scoresState: '', plays: [], playsState: '', msg2: '',
  correBank: '', colCfg: '', bbkSel: '', busy: false,
  bbkEdit: null, bbkMsg: '',                                       // bbkEdit = { i（-1 = 新增）, dr 草稿 }
  colEdit: null, colMsg: '',                                       // colEdit = { i, dr }（色數設定組）
  ws: null, wsSheet: null                                          // 色數學習單選項與產生好的學習單
};

// ---- 小工具 ----
function toast(m){ const el = document.getElementById('toast'); el.textContent = m; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 1600); }
function saveBlob(blob, name){ const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
const safeName = s => String(s || '').replace(/[\\/:*?"<>|\s]+/g, '_');
async function copyText(text){
  try{ await navigator.clipboard.writeText(text); toast(T('copied')); return; }catch(e){}
  try{
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy'); ta.remove(); toast(ok ? T('copied') : T('copyFail'));
  }catch(e){ toast(T('copyFail')); }
}
const err = e => DATA.explain(e, T);
const isReal = () => DATA.isRealUser(S.user);
const classOf = slot => S.a && S.a.classes[String(slot)];
const fdate = BOOKS.fdate;

// ---- 路由（#/home、#/classes、#/class/0、#/settings、#/print）----
function parseHash(){
  const h = (location.hash || '').replace(/^#\/?/, '').split('/');
  const r = h[0] || 'home';
  if(r === 'class' && /^[0-2]$/.test(h[1] || '')) return { route: 'class', cur: h[1] };
  return { route: ['home', 'classes', 'settings', 'print'].indexOf(r) >= 0 ? r : 'home', cur: null };
}
function go(route, cur){ location.hash = '#/' + route + (cur != null ? '/' + cur : ''); }
async function onRoute(){
  const r = parseHash(); S.route = r.route; S.cur = r.cur;
  if(S.route === 'class'){
    S.game = 'corre'; S.days = 0; S.tab = 'stu'; S.sel = null; S.msg2 = ''; S.correBank = ''; S.colCfg = ''; S.bbkSel = '';
    render(); window.scrollTo(0, 0);
    if(S.acct === 'ok' && classOf(S.cur)) await loadBook();
    return;
  }
  if(S.route !== 'settings'){ S.bbkEdit = null; S.bbkMsg = ''; S.colEdit = null; S.colMsg = ''; }
  if(S.route !== 'print') S.wsSheet = null;
  render(); window.scrollTo(0, 0);
}

// ---- 載入 ----
async function loadAccount(){
  S.acct = 'loading'; S.msg = ''; render();
  try{ S.a = await DATA.loadAccount(S.user); S.acct = 'ok'; }
  catch(e){ console.error(e); S.acct = 'error'; S.msg = err(e); }
  render();
  if(S.acct === 'ok' && S.route === 'class' && classOf(S.cur)) loadBook();
}
async function loadBook(){
  const c = classOf(S.cur); if(!c) return;
  S.scoresState = 'loading'; S.playsState = 'loading'; S.msg2 = ''; render();
  const cid = c.cid;
  await Promise.all([
    DATA.loadScores(cid).then(r => { S.scores = r; S.scoresState = 'ok'; }).catch(e => { console.error(e); S.scores = []; S.scoresState = 'error'; S.msg2 = err(e); }),
    DATA.loadPlays(cid).then(r => { S.plays = r; S.playsState = 'ok'; }).catch(e => { console.error(e); S.plays = []; S.playsState = 'error'; S.msg2 = err(e); })
  ]);
  if(S.route === 'class' && S.cur !== null && classOf(S.cur) && classOf(S.cur).cid === cid) render();
}

// ---- 畫面 ----
function headerHtml(){
  const lang = I18N.getLang();
  return '<div class="top"><div class="brand"><b>' + esc(T('appTitle')) + '</b><span>' + esc(T('appSub')) + '</span></div><div class="langs">' +
    [['tc', '繁'], ['sc', '简'], ['es', 'ES'], ['en', 'EN']].map(l => '<button class="pill sm ' + (lang === l[0] ? 'on' : '') + '" data-act="lang" data-l="' + l[0] + '">' + l[1] + '</button>').join('') + '</div></div>';
}
function navHtml(){
  const items = [['home', 'navHome'], ['classes', 'navClasses'], ['settings', 'navSettings'], ['print', 'navPrint']];
  const cur = S.route === 'class' ? 'classes' : S.route;
  return '<div class="nav">' + items.map(i => '<button class="pill ' + (cur === i[0] ? 'on' : '') + '" data-act="nav" data-r="' + i[0] + '">' + esc(T(i[1])) + '</button>').join('') + '</div>';
}
function loginHtml(){
  return '<div class="card center"><h2>' + esc(T('appTitle')) + '</h2><p class="hint">' + esc(T('loginHint')) + '</p>' +
    '<div class="row" style="justify-content:center"><button class="pill fill" data-act="login">' + esc(T('login')) + '</button></div>' +
    (S.msg ? '<div class="err">' + esc(S.msg) + '</div>' : '') + '</div>';
}
function whoHtml(){
  return '<div class="who"><span>' + esc(T('signedInAs', { email: S.user.email })) + '</span><button class="pill sm" data-act="logout">' + esc(T('logout')) + '</button></div>';
}
function planNoticeHtml(){
  const P = S.a.plan;
  if(P.active) return '';
  const expired = !!P.expiresAt;
  return '<div class="notice">' + esc(T(expired ? 'planExpiredNote' : 'planFreeNote')) + ' <a href="' + DATA.PORTAL_URL + '" target="_blank" rel="noopener">' + esc(T('subscribe')) + '</a></div>';
}
// 方案名稱：免費／試用（剩 N 天）／月訂閱／年訂閱；到期的顯示「xx（已到期）」
function planLabel(P){
  const known = ['month', 'year', 'trial', 'pro'].indexOf(P.plan) >= 0;
  if(!known) return T('planFree');
  const name = T('plan_' + P.plan);
  if(!P.active) return T('planWasExpired', { plan: name });
  if(P.plan === 'trial' && P.expiresAt) return name + '・' + T('planDaysLeft', { n: Math.max(1, Math.ceil((P.expiresAt - Date.now()) / 86400000)) });
  return name;
}
function homeHtml(){
  const A = S.a, P = A.plan, nCls = Object.keys(A.classes).length;
  const banksMax = P.active ? 5 : 1, cfgMax = P.active ? 15 : 3;
  const plan = '<div class="card"><h3>' + esc(T('planTitle')) + '</h3><div class="kv"><span><span class="badge ' + (P.active ? 'pro' : '') + '">' + esc(planLabel(P)) + '</span></span><span class="mut">' +
    (P.expiresAt ? esc(T(P.active ? 'planUntil' : 'planExpired', { date: fdate(P.expiresAt) })) : '') + '</span></div>' + planNoticeHtml() + '</div>';
  const usage = '<div class="card"><h3>' + esc(T('usageTitle')) + '</h3>' +
    '<div class="kv"><span>' + esc(T('usageClasses')) + '</span><b>' + nCls + ' / ' + DATA.MAX_CLASSES + '</b></div>' +
    '<div class="kv"><span>' + esc(T('usageCorre')) + '</span><b>' + (A.extrasReady ? A.banks.length + ' / ' + banksMax : '–') + '</b></div>' +
    '<div class="kv"><span>' + esc(T('usageColores')) + '</span><b>' + (A.extrasReady ? A.configs.length + ' / ' + cfgMax : '–') + '</b></div>' +
    '<div class="kv"><span>' + esc(T('usageBbk')) + '</span><b>' + (A.bbkReady ? A.bbk.length + ' / ' + DATA.bbkMax(P) : '–') + '</b></div></div>';
  const games = '<div class="card"><h3>' + esc(T('gamesTitle')) + '</h3>' + GAMES.map(g =>
    '<div class="kv" style="align-items:center"><span><b>' + esc(T(GAME_KEY[g])) + '</b><br><small>' + esc(T(GAME_DESC[g])) + '</small></span>' +
    '<a class="pill sm" href="' + DATA.GAME_URL[g] + '" target="_blank" rel="noopener">' + esc(T('openGame')) + '</a></div>').join('') + '</div>';
  return plan + usage + games;
}
function classesHtml(){
  const A = S.a, P = A.plan;
  let h = '<h2>' + esc(T('classesTitle')) + '</h2><p class="hint">' + esc(T('classesHint')) + '</p>' + planNoticeHtml();
  if(!A.clsReady) h += '<div class="notice">' + esc(T('classesUnavailable')) + '</div>';
  for(let i = 0; i < DATA.MAX_CLASSES; i++){
    const c = A.classes[String(i)];
    if(c) h += '<div class="slot"><b>🏫 ' + esc(c.data.name) + '</b><button class="pill fill sm" data-act="openclass" data-slot="' + i + '">' + esc(T('open')) + '</button></div>';
    else if(P.active && A.clsReady) h += '<div class="slot empty"><input type="text" id="newCls' + i + '" maxlength="40" placeholder="' + esc(T('classNamePh')) + '"><button class="pill sm" data-act="createclass" data-slot="' + i + '">＋ ' + esc(T('createClass')) + '</button></div>';
    else h += '<div class="slot empty"><span class="mut">🔒 ' + esc(T('lockedSlot', { n: i + 1 })) + '</span></div>';
  }
  if(S.msg) h += '<div class="err">' + esc(S.msg) + '</div>';
  return h;
}

// 學生連結
function linkCardHtml(game){
  const c = classOf(S.cur), A = S.a;
  let h = '<div class="link"><h3>' + esc(T(GAME_KEY[game])) + '</h3>';
  let url = '';
  if(game === 'corre'){
    h += '<div class="field"><label>' + esc(T('sourceLabel')) + '</label><select data-sel="correbank"><option value="">' + esc(T('sourcePool')) + '</option>' +
      A.banks.map(b => '<option value="' + esc(b.sid) + '" ' + (S.correBank === b.sid ? 'selected' : '') + '>📚 ' + esc(b.name || ('#' + (b.slot + 1))) + '</option>').join('') + '</select></div>';
    url = DATA.linkCorre(c.cid, S.correBank);
  }else if(game === 'colores'){
    if(!A.configs.length){
      return h + '<p class="hint">' + esc(T('configNone')) + '</p></div>';
    }
    h += '<div class="field"><label>' + esc(T('configLabel')) + '</label><select data-sel="colcfg"><option value="">' + esc(T('configPick')) + '</option>' +
      A.configs.map((it, i) => '<option value="' + i + '" ' + (S.colCfg === String(i) ? 'selected' : '') + '>' + esc((it.cfg && it.cfg.name) || ('#' + (i + 1))) + '</option>').join('') + '</select></div>';
    const it = S.colCfg !== '' ? A.configs[+S.colCfg] : null;
    if(!it) return h + '</div>';
    if(!it.sid) return h + '<div class="row"><button class="pill fill sm" data-act="colmake">🔗 ' + esc(T('makeLink')) + '</button></div></div>';
    url = DATA.linkColores(c.cid, it.sid);
  }else{
    if(!A.bbkReady) h += '<p class="hint">' + esc(T('bbkUnavailable')) + '</p>';
    else if(!A.bbk.length) h += '<p class="hint">' + esc(T('bbkNoSets')) + '</p>';
    else{
      h += '<div class="field"><label>' + esc(T('bbkRangeLabel')) + '</label><select data-sel="bbksel"><option value="">' + esc(T('bbkRangeNormal')) + '</option>' +
        A.bbk.map((it, i) => '<option value="' + i + '" ' + (S.bbkSel === String(i) ? 'selected' : '') + '>📐 ' + esc(it.name) + '</option>').join('') + '</select></div>';
    }
    const it = S.bbkSel !== '' ? A.bbk[+S.bbkSel] : null;
    if(it){
      h += '<p class="hint">' + esc(bbkSummary(it)) + '</p>';
      if(!it.sid) return h + '<div class="row"><button class="pill fill sm" data-act="bbkmake">🔗 ' + esc(T('makeLink')) + '</button></div>' + (S.msg ? '<div class="err">' + esc(S.msg) + '</div>' : '') + '</div>';
    }
    url = DATA.linkBbk(c.cid, it ? it.sid : '');
  }
  h += '<div class="url" data-url="' + esc(game) + '">' + esc(url) + '</div><div class="row">' +
    '<button class="pill fill sm" data-act="copy" data-url="' + esc(url) + '">' + esc(T('copyLink')) + '</button>' +
    '<button class="pill sm" data-act="qr" data-url="' + esc(url) + '" data-game="' + game + '">' + esc(T('qr')) + '</button>' +
    '<a class="pill sm" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(T('test')) + '</a></div>';
  if(game === 'bbk') h += '<p class="hint">' + esc(T('bbkLinkNote')) + '</p>';
  return h + '</div>';
}
function bookHtml(){
  const g = S.game;
  let h = '<h3>' + esc(T('resultsTitle')) + '</h3><div class="row">' +
    GAMES.map(x => '<button class="pill sm ' + (g === x ? 'on' : '') + '" data-act="game" data-g="' + x + '">' + esc(T(GAME_KEY[x])) + '</button>').join('') + '</div>';
  const state = g === 'bbk' ? S.playsState : S.scoresState;
  if(state === 'loading' || state === '') return h + '<p class="hint">' + esc(T('loading')) + '</p>';
  if(state === 'error') return h + '<div class="err">' + esc(S.msg2) + '</div><div class="row"><button class="pill" data-act="refresh">' + esc(T('retry')) + '</button></div>';
  h += '<div class="row">' + [[0, 'filterAll'], [7, 'filter7'], [30, 'filter30']].map(d => '<button class="pill sm ' + (S.days === d[0] ? 'on' : '') + '" data-act="days" data-d="' + d[0] + '">' + esc(T(d[1])) + '</button>').join('') + '</div>';
  if(g === 'bbk'){
    if(S.sel) return h + BOOKS.bbkStudent(S.plays, S.sel, S.days);
    h += '<div class="row">' + [['stu', 'tabStudents'], ['err', 'tabErrors']].map(x => '<button class="pill sm ' + (S.tab === x[0] ? 'on' : '') + '" data-act="tab" data-tab="' + x[0] + '">' + esc(T(x[1])) + '</button>').join('') + '</div>';
    const inRange = S.plays.filter(r => !S.days || r.ms >= Date.now() - S.days * 86400000);
    h += S.tab === 'stu' ? BOOKS.bbkStudents(S.plays, S.days) : BOOKS.bbkStats(inRange);
  }else{
    h += '<p class="hint">' + esc(T('students', { n: BOOKS.studentCount(g, S.scores) })) + '</p>' + BOOKS.scoreTable(g, S.scores, S.days);
  }
  h += '<div class="row"><button class="pill sm" data-act="refresh">🔄 ' + esc(T('refresh')) + '</button><button class="pill sm" data-act="csv">⬇ ' + esc(T('csv')) + '</button>' +
    '<button class="pill sm" data-act="cleargame">' + esc(T('clearGame')) + '</button></div>';
  return h;
}
function classHtml(){
  const c = classOf(S.cur);
  if(!c) return '<p class="hint">' + esc(T('noClasses')) + '</p><div class="row"><button class="pill" data-act="nav" data-r="classes">' + esc(T('allClasses')) + '</button></div>';
  let h = '<div class="row"><button class="pill sm" data-act="nav" data-r="classes">' + esc(T('allClasses')) + '</button></div>' + planNoticeHtml() +
    '<div class="card"><h2>🏫 ' + esc(c.data.name) + '</h2>' +
    '<div class="field"><label>' + esc(T('classNameLabel')) + '</label><div class="inline"><input type="text" id="clsName" maxlength="40" value="' + esc(c.data.name) + '"><button class="pill sm" data-act="classrename">' + esc(T('rename')) + '</button></div></div>' +
    '<div class="field"><label>' + esc(T('boardTitle')) + '</label><div class="row" style="margin-top:0">' +
    '<button class="pill sm ' + (c.data.showBoard ? 'on' : '') + '" data-act="board" data-v="1">' + esc(T('on')) + '</button><button class="pill sm ' + (!c.data.showBoard ? 'on' : '') + '" data-act="board" data-v="0">' + esc(T('off')) + '</button></div>' +
    '<p class="hint">' + esc(T('boardHint')) + '</p></div>' +
    '<div class="row"><button class="pill sm" data-act="classdelete">🗑 ' + esc(T('deleteClass')) + '</button></div>' +
    (S.msg ? '<div class="err">' + esc(S.msg) + '</div>' : '') + '</div>';
  h += '<div class="card"><h3>🔗 ' + esc(T('linksTitle')) + '</h3><p class="hint">' + esc(T('linksHint')) + '</p>' + GAMES.map(linkCardHtml).join('') + '</div>';
  h += '<div class="card">' + bookHtml() + '</div>';
  return h;
}
// ---- 比比看：練習範圍 ----
const listSep = () => (I18N.getLang() === 'es' || I18N.getLang() === 'en') ? ', ' : '、';
function bbkSummary(it){
  const d = it.d.length ? it.d.map(k => T('d_' + k)).join(listSep()) : T('allDims');
  const t = it.t.length ? it.t.map(k => T('t_' + k)).join(listSep()) : T('allTypes');
  return T('levelN', { n: it.lv }) + ' · ' + T('nQuestions', { n: it.n }) + ' · ' + d + ' · ' + t;
}
function chip(on, label, act, k){
  return '<button class="pill sm chip ' + (on ? 'on' : '') + '" data-act="' + act + '" data-k="' + k + '">' + (on ? '✓ ' : '') + esc(label) + '</button>';
}
function bbkEditorHtml(){
  const E = S.bbkEdit, dr = E.dr;
  let h = '<div class="editor">' +
    '<div class="field"><label>' + esc(T('bbkName')) + '</label><input type="text" id="bbkName" maxlength="40" placeholder="' + esc(T('bbkNamePh')) + '" value="' + esc(dr.name) + '"></div>' +
    '<div class="field"><label>' + esc(T('bbkLevel')) + '</label><div class="row" style="margin-top:0">' +
    [1, 2, 3].map(n => '<button class="pill sm ' + (dr.lv === n ? 'on' : '') + '" data-act="bbklv" data-k="' + n + '">' + n + '</button>').join('') + '</div></div>' +
    '<div class="field"><label>' + esc(T('bbkDims')) + '</label><div class="row" style="margin-top:0">' +
    BBK.dimsOf(dr.lv).map(k => chip(dr.d.indexOf(k) >= 0, T('d_' + k), 'bbkd', k)).join('') + '</div>' +
    '<div class="row" style="margin-top:0"><button class="link-btn" data-act="bbkall" data-k="d1">' + esc(T('selectAll')) + '</button><button class="link-btn" data-act="bbkall" data-k="d0">' + esc(T('clearAll')) + '</button></div></div>' +
    '<div class="field"><label>' + esc(T('bbkTypes')) + '</label><div class="row" style="margin-top:0">' +
    BBK.typesOf(dr.lv).map(k => chip(dr.t.indexOf(k) >= 0, T('t_' + k), 'bbkt', k)).join('') + '</div>' +
    '<div class="row" style="margin-top:0"><button class="link-btn" data-act="bbkall" data-k="t1">' + esc(T('selectAll')) + '</button><button class="link-btn" data-act="bbkall" data-k="t0">' + esc(T('clearAll')) + '</button></div></div>' +
    '<div class="field"><label>' + esc(T('bbkCount')) + '</label><div class="row" style="margin-top:0">' +
    BBK.NS.map(n => '<button class="pill sm ' + (dr.n === n ? 'on' : '') + '" data-act="bbkn" data-k="' + n + '">' + n + '</button>').join('') + '</div></div>';
  h += BBK.valid(dr) ? '<p class="hint">' + esc(T('bbkFeasNote')) + '</p>' : '<div class="err">' + esc(T('bbkNeedPick')) + '</div>';
  if(S.bbkMsg) h += '<div class="err">' + esc(S.bbkMsg) + '</div>';
  h += '<div class="row"><button class="pill fill sm" data-act="bbksave" ' + (BBK.valid(dr) ? '' : 'disabled') + '>' + esc(T('save')) + '</button><button class="pill sm" data-act="bbkcancel">' + esc(T('cancel')) + '</button></div></div>';
  return h;
}
function bbkCardHtml(){
  const A = S.a, max = DATA.bbkMax(A.plan), E = S.bbkEdit;
  let h = '<div class="card" id="bbkCard"><h3>' + esc(T('bbkSetsTitle')) + '</h3><p class="hint">' + esc(T('bbkSetsHint')) + '</p>';
  if(!A.bbkReady) return h + '<div class="notice">' + esc(T('bbkUnavailable')) + '</div></div>';
  h += '<p class="hint"><b>' + esc(T('bbkQuota', { n: A.bbk.length, max })) + '</b></p>';
  if(!A.bbk.length && !(E && E.i < 0)) h += '<p class="hint">' + esc(T('bbkEmpty')) + '</p>';
  A.bbk.forEach((it, i) => {
    if(E && E.i === i){ h += bbkEditorHtml(); return; }
    h += '<div class="setrow"><div><b>📐 ' + esc(it.name) + '</b><small>' + esc(bbkSummary(it)) + '</small></div><div class="row">' +
      '<button class="pill sm" data-act="bbkedit" data-k="' + i + '">' + esc(T('edit')) + '</button>' +
      '<button class="pill sm" data-act="bbkpractice" data-k="' + i + '">🔗 ' + esc(T('bbkPractice')) + '</button>' +
      (it.sid ? '<a class="pill sm" href="' + esc(DATA.linkBbkPractice(it.sid)) + '" target="_blank" rel="noopener">' + esc(T('test')) + '</a>' : '') +
      '<button class="pill sm" data-act="bbkdel" data-k="' + i + '">🗑 ' + esc(T('del')) + '</button></div></div>';
  });
  if(E && E.i < 0) h += bbkEditorHtml();
  else if(!E){
    if(A.bbk.length < max) h += '<div class="row"><button class="pill fill sm" data-act="bbknew">＋ ' + esc(T('bbkNew')) + '</button></div>';
    else h += '<div class="notice">' + esc(T(A.plan.active ? 'bbkFullPro' : 'bbkFullFree')) + (A.plan.active ? '' : ' <a href="' + DATA.PORTAL_URL + '" target="_blank" rel="noopener">' + esc(T('subscribe')) + '</a>') + '</div>';
  }
  if(S.bbkMsg && !E) h += '<div class="err">' + esc(S.bbkMsg) + '</div>';
  h += '<p class="hint">' + esc(T('bbkPracticeHint')) + '</p>';
  return h + '</div>';
}
// ---- 色數：設定組 ----
function colSummary(c){
  const nums = c.nums ? T('colListTag') + '（' + c.nums.length + '）' : '0–' + (c.range || 999);
  return T(c.mode === 'B' ? 'colModeB' : 'colModeA') + ' · ' + c.rows + '×' + c.cols + ' · ♥' + (c.hearts || '∞') + ' · ' + COL.colorsOf(c).map(x => x.zh[I18N.getLang() === 'sc' ? 1 : 0]).join('') + ' · ' + nums;
}
function colEditorHtml(){
  const E = S.colEdit, dr = E.dr, pro = S.a.plan.active, simp = I18N.getLang() === 'sc';
  const pills = (act, cur, list) => list.map(x => '<button class="pill sm ' + (cur === x[0] ? 'on' : '') + '" data-act="' + act + '" data-k="' + x[0] + '">' + esc(x[1]) + '</button>').join('');
  const chips = Object.keys(COL.COLORS).map(id => { const c = COL.COLORS[id], on = dr.ids.indexOf(id) >= 0;
    return '<button class="cchip ' + (on ? 'on' : '') + '" data-act="colid" data-k="' + id + '" style="background:' + c.bg + ';color:' + c.fg + (id === 'white' ? ';border-color:#999' : '') + '">' + (on ? '✓ ' : '') + esc(c.zh[simp ? 1 : 0]) + '</button>'; }).join('');
  const crows = dr.custom.map((c, i) => '<div class="crow"><input type="color" value="' + esc(c.h) + '" data-cc="' + i + '" data-f="h">' +
    '<input type="text" maxlength="8" placeholder="' + esc(T('colColorName')) + '" value="' + esc(c.n) + '" data-cc="' + i + '" data-f="n">' +
    '<input type="text" maxlength="12" placeholder="' + esc(T('colColorSay')) + '" value="' + esc(c.s) + '" data-cc="' + i + '" data-f="s">' +
    '<button class="x" data-act="colsay" data-k="' + i + '" title="' + esc(T('colListen')) + '">🔊</button><button class="x" data-act="colcdel" data-k="' + i + '">✕</button></div>').join('');
  let h = '<div class="editor">' +
    '<div class="field"><label>' + esc(T('bbkName')) + '</label><input type="text" id="colName" maxlength="20" placeholder="' + esc(T('colNamePh')) + '" value="' + esc(dr.name) + '"></div>' +
    '<div class="field"><label>' + esc(T('colMode')) + '</label><div class="row" style="margin-top:0">' + pills('colmode', dr.mode, [['A', T('colModeA')], ['B', T('colModeB')]]) + '</div></div>' +
    '<div class="field"><label>' + esc(T('colGrid')) + '（' + dr.rows * dr.cols + '）</label><div class="row" style="margin-top:0">' +
      '<span class="stp">' + esc(T('colRows')) + ' <button class="pill sm" data-act="colstep" data-k="rows,-1">−</button><b>' + dr.rows + '</b><button class="pill sm" data-act="colstep" data-k="rows,1">＋</button></span>' +
      '<span class="stp">' + esc(T('colCols')) + ' <button class="pill sm" data-act="colstep" data-k="cols,-1">−</button><b>' + dr.cols + '</b><button class="pill sm" data-act="colstep" data-k="cols,1">＋</button></span></div></div>' +
    '<div class="field"><label>' + esc(T('colHearts')) + '</label><div class="row" style="margin-top:0">' + pills('colhearts', String(dr.hearts), [['3', '3'], ['5', '5'], ['0', T('colUnlimited')]]) + '</div></div>' +
    '<div class="field"><label>' + esc(T('colPreset')) + '</label><div class="row" style="margin-top:0">' +
      '<button class="link-btn" data-act="colquick" data-k="basic">' + esc(T('colBasic')) + '</button><button class="link-btn" data-act="colquick" data-k="adv">' + esc(T('colAdv')) + '</button>' +
      '<button class="link-btn" data-act="colquick" data-k="all">' + esc(T('selectAll')) + '</button><button class="link-btn" data-act="colquick" data-k="none">' + esc(T('clearAll')) + '</button></div>' +
      '<div class="cchips">' + chips + '</div></div>' +
    '<div class="field' + (pro ? '' : ' locked') + '"><label>' + esc(T('colCustom')) + (pro ? '' : ' 🔒') + '</label>' + crows +
      '<button class="pill sm" data-act="colcadd" ' + (dr.custom.length >= 12 ? 'disabled' : '') + '>＋ ' + esc(T('colAddColor')) + '</button></div>' +
    '<div class="field"><label>' + esc(T('colNums')) + '</label><div class="row" style="margin-top:0">' +
      pills('colnmode', dr.nmode, [['999', '0 – 999'], ['9999', '0 – 9999'], ['list', T('colList') + (pro ? '' : ' 🔒')]]) + '</div>' +
      (dr.nmode === 'list' ? '<textarea id="colList" rows="3" placeholder="1, 2, 3, 10-20, 100">' + esc(dr.list) + '</textarea><p class="hint">' + esc(T('colListHint')) + '</p>' : '') + '</div>';
  if(!pro) h += '<p class="hint">🔒 ' + esc(T('colProOnly')) + '</p>';
  if(S.colMsg) h += '<div class="err">' + esc(S.colMsg) + '</div>';
  h += '<div class="row"><button class="pill fill sm" data-act="colsave">' + esc(T('save')) + '</button><button class="pill sm" data-act="colcancel">' + esc(T('cancel')) + '</button></div></div>';
  return h;
}
function colCardHtml(){
  const A = S.a, max = DATA.coloresMax(A.plan), E = S.colEdit;
  let h = '<div class="card" id="colCard"><h3>' + esc(T('colSetsTitle')) + '</h3><p class="hint">' + esc(T('colSetsHint')) + '</p>';
  if(!A.extrasReady) return h + '<div class="notice">' + esc(T('bbkUnavailable')) + '</div></div>';
  h += '<p class="hint"><b>' + esc(T('bbkQuota', { n: A.configs.length, max })) + '</b></p>';
  if(!A.configs.length && !(E && E.i < 0)) h += '<p class="hint">' + esc(T('colEmpty')) + '</p>';
  A.configs.forEach((it, i) => {
    if(E && E.i === i){ h += colEditorHtml(); return; }
    const c = it.cfg || {};
    h += '<div class="setrow"><div><b>🎨 ' + esc(c.name || ('#' + (i + 1))) + '</b><small>' + esc(colSummary(c)) + '</small></div><div class="row">' +
      '<button class="pill sm" data-act="coledit" data-k="' + i + '">' + esc(T('edit')) + '</button>' +
      '<button class="pill sm" data-act="colpractice" data-k="' + i + '">🔗 ' + esc(T('bbkPractice')) + '</button>' +
      (it.sid ? '<a class="pill sm" href="' + esc(DATA.linkColoresPractice(it.sid)) + '" target="_blank" rel="noopener">' + esc(T('test')) + '</a><button class="pill sm" data-act="coloff" data-k="' + i + '">🚫 ' + esc(T('colLinkOff')) + '</button>' : '') +
      '<button class="pill sm" data-act="coldel" data-k="' + i + '">🗑 ' + esc(T('del')) + '</button></div></div>';
  });
  if(E && E.i < 0) h += colEditorHtml();
  else if(!E){
    if(A.configs.length < max) h += '<div class="row"><button class="pill fill sm" data-act="colnew">＋ ' + esc(T('colNew')) + '</button></div>';
    else h += '<div class="notice">' + esc(T(A.plan.active ? 'bbkFullPro' : 'bbkFullFree')) + (A.plan.active ? '' : ' <a href="' + DATA.PORTAL_URL + '" target="_blank" rel="noopener">' + esc(T('subscribe')) + '</a>') + '</div>';
  }
  if(S.colMsg && !E) h += '<div class="err">' + esc(S.colMsg) + '</div>';
  h += '<p class="hint">' + esc(T('colPracticeHint')) + '</p>';
  return h + '</div>';
}
function settingsHtml(){
  const rows = [['corre', 'settingsCorre']];
  return '<h2>' + esc(T('settingsTitle')) + '</h2><p class="hint">' + esc(T('settingsHint')) + '</p>' + bbkCardHtml() + colCardHtml() + rows.map(r =>
    '<div class="card"><h3>' + esc(T(GAME_KEY[r[0]])) + '</h3><p class="hint">' + esc(T(r[1])) + '</p><div class="row"><a class="pill sm" href="' + DATA.TEACHER_URL[r[0]] + '" target="_blank" rel="noopener">' + esc(T('openSettingsPage')) + '</a></div></div>').join('');
}
// ---- 列印：色數學習單 ----
function wsDefaults(){
  const l = I18N.getLang();
  return { cfg: '', kind: 'listen', read: true, count: 10, legend: true, simp: l === 'sc', help: l === 'en' ? 'en' : 'es', answers: true };
}
function wsFormHtml(){
  const A = S.a, W = S.ws || (S.ws = wsDefaults());
  let h = '<div class="card" id="wsCard"><h3>' + esc(T('gameColores')) + '</h3>';
  if(!A.plan.active) return h + '<div class="notice">🔒 ' + esc(T('wsLocked')) + ' <a href="' + DATA.PORTAL_URL + '" target="_blank" rel="noopener">' + esc(T('subscribe')) + '</a></div></div>';
  if(!A.configs.length) return h + '<p class="hint">' + esc(T('wsNoCfg')) + '</p><div class="row"><button class="pill sm" data-act="nav" data-r="settings">' + esc(T('navSettings')) + '</button></div></div>';
  const pills = (act, cur, list) => list.map(x => '<button class="pill sm ' + (String(cur) === String(x[0]) ? 'on' : '') + '" data-act="' + act + '" data-k="' + x[0] + '">' + esc(x[1]) + '</button>').join('');
  h += '<div class="field"><label>' + esc(T('configLabel')) + '</label><select data-sel="wscfg"><option value="">' + esc(T('configPick')) + '</option>' +
    A.configs.map((it, i) => '<option value="' + i + '" ' + (W.cfg === String(i) ? 'selected' : '') + '>' + esc((it.cfg && it.cfg.name) || ('#' + (i + 1))) + '</option>').join('') + '</select>' +
    (W.cfg !== '' && A.configs[+W.cfg] ? '<p class="hint">' + esc(colSummary(A.configs[+W.cfg].cfg)) + '</p>' : '') + '</div>' +
    '<div class="field"><label>' + esc(T('wsKind')) + '</label><div class="kinds">' +
    [['listen', 'wsListen'], ['write', 'wsWrite'], ['color', 'wsColor']].map(k => '<button class="kind ' + (W.kind === k[0] ? 'on' : '') + '" data-act="wskind" data-k="' + k[0] + '"><b>' + esc(T(k[1])) + '</b><small>' + esc(T(k[1] + 'Desc')) + '</small></button>').join('') + '</div></div>';
  if(W.kind === 'listen'){
    h += '<div class="field"><label>' + esc(T('wsQuestions')) + '</label><div class="row" style="margin-top:0">' + pills('wsread', W.read ? 1 : 0, [[1, T('wsReadOn')], [0, T('wsReadOff')]]) + '</div></div>' +
      '<div class="field"><label>' + esc(T('wsCount')) + '</label><div class="row" style="margin-top:0">' + pills('wscount', W.count, [[5, '5'], [10, '10'], [15, '15'], [20, '20']]) + '</div></div>' +
      '<div class="field"><div class="row" style="margin-top:0"><button class="pill sm chip ' + (W.legend ? 'on' : '') + '" data-act="wslegend">' + (W.legend ? '✓ ' : '') + esc(T('wsLegendOpt')) + '</button></div></div>';
  }
  h += '<div class="field"><label>' + esc(T('wsScript')) + '</label><div class="row" style="margin-top:0">' + pills('wssimp', W.simp ? 1 : 0, [[0, '繁體'], [1, '简体']]) + '</div></div>' +
    '<div class="field"><label>' + esc(T('wsHelp')) + '</label><div class="row" style="margin-top:0">' + pills('wshelp', W.help, [['none', T('wsNone')], ['es', 'Español'], ['en', 'English']]) + '</div></div>' +
    '<div class="field"><div class="row" style="margin-top:0"><button class="pill sm chip ' + (W.answers ? 'on' : '') + '" data-act="wsans">' + (W.answers ? '✓ ' : '') + esc(T('wsAnswersOpt')) + '</button></div></div>' +
    '<div class="row"><button class="pill fill" data-act="wsmake" ' + (W.cfg === '' ? 'disabled' : '') + '>📄 ' + esc(T('wsMake')) + '</button></div>';
  return h + '</div>';
}
function wsSheetHtml(){
  return '<div class="ws-bar noprint"><div class="row"><button class="pill sm" data-act="wsback">← ' + esc(T('back')) + '</button>' +
    '<button class="pill sm" data-act="wsmake">🔄 ' + esc(T('wsRemake')) + '</button><button class="pill fill sm" data-act="wsprint">🖨 ' + esc(T('wsPrint')) + '</button></div>' +
    '<p class="hint">' + esc(T('wsPrintTip')) + '</p></div><div class="ws">' + S.wsSheet + '</div>';
}
function printHtml(){
  if(S.wsSheet) return wsSheetHtml();
  const rows = [['corre', 'printCorre'], ['bbk', 'printBbk']];
  return '<h2>' + esc(T('printTitle')) + '</h2><p class="hint">' + esc(T('printHint')) + '</p>' + wsFormHtml() + rows.map(r =>
    '<div class="card"><h3>' + esc(T(GAME_KEY[r[0]])) + '</h3><p class="hint">' + esc(T(r[1])) + '</p></div>').join('');
}
function bodyHtml(){
  if(S.acct === 'loading' || S.acct === '') return '<p class="hint center">' + esc(T('loading')) + '</p>';
  if(S.acct === 'error') return '<div class="err">' + esc(S.msg) + '</div><div class="row"><button class="pill" data-act="reload">' + esc(T('retry')) + '</button></div>';
  switch(S.route){
    case 'classes': return classesHtml();
    case 'class': return classHtml();
    case 'settings': return settingsHtml();
    case 'print': return printHtml();
    default: return homeHtml();
  }
}
function render(){
  document.title = T('appTitle');
  let h = headerHtml();
  if(!S.authSeen) h += '<p class="hint center">' + esc(T('loading')) + '</p>';
  else if(!isReal()) h += loginHtml();
  else h += whoHtml() + navHtml() + bodyHtml();
  const keep = document.activeElement && document.activeElement.id;
  const vals = {}; app.querySelectorAll('input[type=text]').forEach(i => { if(i.id) vals[i.id] = i.value; });
  app.innerHTML = h;
  document.body.classList.toggle('wsmode', !!(S.route === 'print' && S.wsSheet));
  Object.keys(vals).forEach(id => { const el = document.getElementById(id); if(el && /^newCls/.test(id)) el.value = vals[id]; });   // 重畫時保留還沒送出的新班級名稱
  if(keep){ const el = document.getElementById(keep); if(el && el.focus) el.focus(); }
}

// ---- QR ----
function qrCanvas(url){
  const qr = qrcode(0, 'M'); qr.addData(url); qr.make();
  const n = qr.getModuleCount(), quiet = 4, cell = Math.max(2, Math.floor(480 / (n + quiet * 2))), size = cell * (n + quiet * 2);
  const cv = document.createElement('canvas'); cv.width = size; cv.height = size;
  const c = cv.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, size, size); c.fillStyle = '#000';
  for(let r = 0; r < n; r++) for(let k = 0; k < n; k++) if(qr.isDark(r, k)) c.fillRect((k + quiet) * cell, (r + quiet) * cell, cell, cell);
  return cv;
}
function showQr(url, game){
  const c = classOf(S.cur);
  const cv = qrCanvas(url);
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = '<div class="box"><h3>' + esc(T(GAME_KEY[game])) + ' · ' + esc(c ? c.data.name : '') + '</h3></div>';
  const box = m.firstChild; box.appendChild(cv);
  box.insertAdjacentHTML('beforeend', '<p class="hint">' + esc(T('qrHint')) + '</p><div class="row" style="justify-content:center"><button class="pill fill sm" data-m="dl">' + esc(T('qrDownload')) + '</button><button class="pill sm" data-m="close">' + esc(T('close')) + '</button></div>');
  m.addEventListener('click', e => {
    if(e.target === m || e.target.dataset.m === 'close') m.remove();
    else if(e.target.dataset.m === 'dl') cv.toBlob(b => saveBlob(b, 'qr-' + game + '-' + safeName(c ? c.data.name : '') + '.png'), 'image/png');
  });
  document.body.appendChild(m);
}

// ---- 操作 ----
function toggleIn(arr, k){ const i = arr.indexOf(k); if(i < 0) arr.push(k); else arr.splice(i, 1); }
async function run(fn){
  if(S.busy) return; S.busy = true;
  try{ await fn(); }catch(e){ console.error(e); S.msg = err(e); render(); }
  S.busy = false;
}
const actions = {
  lang(el){ I18N.setLang(el.dataset.l); render(); },
  async login(){ S.msg = ''; try{ await DATA.login(); }catch(e){ console.error(e); S.msg = err(e); render(); } },
  async logout(){ await DATA.logout(); },
  nav(el){ go(el.dataset.r); },
  reload(){ return loadAccount(); },
  openclass(el){ go('class', el.dataset.slot); },
  createclass(el){ return run(async () => {
    const slot = +el.dataset.slot, inp = document.getElementById('newCls' + slot), name = ((inp && inp.value) || '').trim();
    if(!name){ S.msg = T('needName'); render(); return; }
    S.msg = ''; await DATA.createClass(slot, name, S.a.cslots);
    await loadAccount(); go('class', slot);
  }); },
  classrename(){ return run(async () => {
    const c = classOf(S.cur), name = (document.getElementById('clsName').value || '').trim();
    if(!name){ S.msg = T('needName'); render(); return; }
    S.msg = ''; await DATA.saveClass(c, { name }); c.data.name = name; render(); toast(T('renamed'));
  }); },
  board(el){ return run(async () => {
    const c = classOf(S.cur), v = el.dataset.v === '1'; if(!!c.data.showBoard === v) return;
    await DATA.saveClass(c, { showBoard: v }); c.data.showBoard = v; S.msg = ''; render();
  }); },
  classdelete(){ return run(async () => {
    const c = classOf(S.cur); if(!confirm(T('confirmDelClass', { name: c.data.name }))) return;
    S.msg = T('deleting'); render();
    await DATA.deleteClass(S.cur, c, S.a.cslots); S.msg = '';
    await loadAccount(); go('classes');
  }); },
  copy(el){ return copyText(el.dataset.url); },
  qr(el){ showQr(el.dataset.url, el.dataset.game); },
  // ---- 比比看範圍 ----
  bbknew(){ S.bbkEdit = { i: -1, dr: BBK.draftFrom(null) }; S.bbkMsg = ''; render(); const el = document.getElementById('bbkName'); if(el) el.focus(); },
  bbkedit(el){ S.bbkEdit = { i: +el.dataset.k, dr: BBK.draftFrom(S.a.bbk[+el.dataset.k]) }; S.bbkMsg = ''; render(); },
  bbkcancel(){ S.bbkEdit = null; S.bbkMsg = ''; render(); },
  bbklv(el){ S.bbkEdit.dr = BBK.changeLevel(S.bbkEdit.dr, +el.dataset.k); render(); },
  bbkn(el){ S.bbkEdit.dr.n = +el.dataset.k; render(); },
  bbkd(el){ toggleIn(S.bbkEdit.dr.d, el.dataset.k); render(); },
  bbkt(el){ toggleIn(S.bbkEdit.dr.t, el.dataset.k); render(); },
  bbkall(el){ const dr = S.bbkEdit.dr, k = el.dataset.k;
    if(k[0] === 'd') dr.d = k[1] === '1' ? BBK.dimsOf(dr.lv) : []; else dr.t = k[1] === '1' ? BBK.typesOf(dr.lv) : [];
    render(); },
  bbksave(){ return run(async () => {
    const E = S.bbkEdit; if(!E || !BBK.valid(E.dr)) return;
    const name = (E.dr.name || '').trim() || T('bbkDefaultName', { n: E.i < 0 ? S.a.bbk.length + 1 : E.i + 1 });
    if(E.i < 0 && S.a.bbk.length >= DATA.bbkMax(S.a.plan)){ S.bbkMsg = T(S.a.plan.active ? 'bbkFullPro' : 'bbkFullFree'); render(); return; }
    try{
      S.a.bbk = await DATA.saveBbkSet(S.a.bbk, E.i, Object.assign(BBK.toSet(E.dr), { name: name.slice(0, 40) }));
      S.bbkEdit = null; S.bbkMsg = ''; render(); toast(T('saved'));
    }catch(e){ console.error(e); S.bbkMsg = err(e); render(); }
  }); },
  bbkdel(el){ return run(async () => {
    const i = +el.dataset.k, it = S.a.bbk[i]; if(!it || !confirm(T('bbkConfirmDel', { name: it.name }))) return;
    try{ S.a.bbk = await DATA.deleteBbkSet(S.a.bbk, i); S.bbkMsg = ''; }
    catch(e){ console.error(e); S.bbkMsg = err(e); }
    render();
  }); },
  bbkpractice(el){ return run(async () => {
    const i = +el.dataset.k;
    try{
      S.a.bbk = await DATA.ensureBbkSid(S.a.bbk, i); S.bbkMsg = ''; render();
      await copyText(DATA.linkBbkPractice(S.a.bbk[i].sid));
    }catch(e){ console.error(e); S.bbkMsg = T('configFail', { m: err(e) }); render(); }
  }); },
  bbkmake(){ return run(async () => {
    try{ S.a.bbk = await DATA.ensureBbkSid(S.a.bbk, +S.bbkSel); S.msg = ''; }
    catch(e){ console.error(e); S.msg = T('configFail', { m: err(e) }); }
    render();
  }); },
  // ---- 色數設定組 ----
  colnew(){ S.colEdit = { i: -1, dr: COL.draftFrom(null) }; S.colMsg = ''; render(); },
  coledit(el){ const it = S.a.configs[+el.dataset.k]; S.colEdit = { i: +el.dataset.k, dr: COL.draftFrom(it && it.cfg) }; S.colMsg = ''; render(); },
  colcancel(){ S.colEdit = null; S.colMsg = ''; render(); },
  colmode(el){ S.colEdit.dr.mode = el.dataset.k; render(); },
  colhearts(el){ S.colEdit.dr.hearts = +el.dataset.k; render(); },
  colstep(el){ const [k, d] = el.dataset.k.split(','), lim = k === 'rows' ? [3, 8] : [3, 6], dr = S.colEdit.dr; dr[k] = Math.min(lim[1], Math.max(lim[0], dr[k] + (+d))); render(); },
  colid(el){ toggleIn(S.colEdit.dr.ids, el.dataset.k); render(); },
  colquick(el){ const k = el.dataset.k; S.colEdit.dr.ids = k === 'basic' ? COL.SETS.basic.slice() : k === 'adv' ? COL.SETS.adv.slice() : k === 'all' ? Object.keys(COL.COLORS) : []; render(); },
  colcadd(){ if(!S.a.plan.active){ toast(T('colProOnly')); return; } const dr = S.colEdit.dr; if(dr.custom.length >= 12) return; dr.custom.push({ n: '', s: '', h: '#43a047' }); render(); },
  colcdel(el){ S.colEdit.dr.custom.splice(+el.dataset.k, 1); render(); },
  colsay(el){ const c = S.colEdit.dr.custom[+el.dataset.k], t = ((c && (c.s || c.n)) || '').trim(); if(!t || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'zh-TW'; u.rate = 0.85; speechSynthesis.speak(u); },
  colnmode(el){ if(el.dataset.k === 'list' && !S.a.plan.active){ toast(T('colProOnly')); return; } S.colEdit.dr.nmode = el.dataset.k; render(); },
  colsave(){ return run(async () => {
    const E = S.colEdit; if(!E) return;
    const r = COL.draftToCfg(E.dr);
    if(r.err){ S.colMsg = T(r.err); render(); return; }
    const c = r.cfg;
    if(!S.a.plan.active && COL.usesPro(c)){ S.colMsg = T('colProOnly'); render(); return; }
    if(E.i < 0 && S.a.configs.length >= DATA.coloresMax(S.a.plan)){ S.colMsg = T(S.a.plan.active ? 'bbkFullPro' : 'bbkFullFree'); render(); return; }
    if(!c.name) c.name = T('colDefaultName', { n: E.i < 0 ? S.a.configs.length + 1 : E.i + 1 }).slice(0, 20);
    try{ S.a.configs = await DATA.saveColoresCfg(S.a.configs, E.i, c); S.colEdit = null; S.colMsg = ''; render(); toast(T('saved')); }
    catch(e){ console.error(e); S.colMsg = err(e); render(); }
  }); },
  coldel(el){ return run(async () => {
    const i = +el.dataset.k, it = S.a.configs[i]; if(!it || !confirm(T('colConfirmDel', { name: (it.cfg && it.cfg.name) || ('#' + (i + 1)) }))) return;
    try{ S.a.configs = await DATA.deleteColoresCfg(S.a.configs, i); S.colMsg = ''; S.colCfg = ''; }
    catch(e){ console.error(e); S.colMsg = err(e); }
    render();
  }); },
  coloff(el){ return run(async () => {
    const i = +el.dataset.k; if(!confirm(T('colConfirmOff'))) return;
    try{ S.a.configs = await DATA.coloresLinkOff(S.a.configs, i); S.colMsg = ''; render(); toast(T('colOffDone')); }
    catch(e){ console.error(e); S.colMsg = err(e); render(); }
  }); },
  colpractice(el){ return run(async () => {
    const i = +el.dataset.k;
    try{ const r = await DATA.ensureColoresSid(S.a.configs, i); S.a.configs = r.items; S.colMsg = ''; render(); await copyText(DATA.linkColoresPractice(r.sid)); }
    catch(e){ console.error(e); S.colMsg = T('configFail', { m: err(e) }); render(); }
  }); },
  // ---- 色數學習單 ----
  wskind(el){ S.ws.kind = el.dataset.k; render(); },
  wsread(el){ S.ws.read = el.dataset.k === '1'; render(); },
  wscount(el){ S.ws.count = +el.dataset.k; render(); },
  wslegend(){ S.ws.legend = !S.ws.legend; render(); },
  wssimp(el){ S.ws.simp = el.dataset.k === '1'; render(); },
  wshelp(el){ S.ws.help = el.dataset.k; render(); },
  wsans(){ S.ws.answers = !S.ws.answers; render(); },
  wsmake(){
    const W = S.ws, it = W && S.a.configs[+W.cfg]; if(!it || !S.a.plan.active) return;
    const c = COL.normalizeCfg(it.cfg); if(!c) return;
    const opts = Object.assign({}, W, { title: c.name });
    S.wsSheet = COL.worksheet(c, opts, COL.makeBoard(c), k => I18N.D[k]);
    render(); window.scrollTo(0, 0);
  },
  wsback(){ S.wsSheet = null; render(); },
  wsprint(){ window.print(); },
  colmake(){ return run(async () => {
    try{
      const r = await DATA.ensureColoresSid(S.a.configs, +S.colCfg); S.a.configs = r.items; S.msg = '';
    }catch(e){ console.error(e); S.msg = T('configFail', { m: err(e) }); }
    render();
  }); },
  game(el){ S.game = el.dataset.g; S.sel = null; render(); },
  days(el){ S.days = +el.dataset.d; render(); },
  tab(el){ S.tab = el.dataset.tab; render(); },
  stu(el){ S.sel = el.dataset.h; render(); window.scrollTo(0, 0); },
  stuback(){ S.sel = null; render(); },
  studel(el){ return run(async () => {
    if(!confirm(T('confirmStudent', { nick: el.dataset.nick }))) return;
    const ids = S.plays.filter(r => r.h === el.dataset.h).map(r => r.id);
    await DATA.deleteDocs('class_plays', ids); S.plays = S.plays.filter(r => r.h !== el.dataset.h); S.sel = null; render();
  }); },
  rowdel(el){ return run(async () => {
    if(!confirm(T('confirmRow', { nick: el.dataset.nick }))) return;
    await DATA.deleteDocs('class_scores', [el.dataset.id]); S.scores = S.scores.filter(r => r.id !== el.dataset.id); render();
  }); },
  refresh(){ return loadBook(); },
  csv(){
    const c = classOf(S.cur), g = S.game;
    const rows = g === 'bbk' ? BOOKS.csvBbk(S.plays, S.days) : BOOKS.csvScores(g, S.scores, S.days);
    saveBlob(new Blob([BOOKS.toCsv(rows)], { type: 'text/csv;charset=utf-8' }), g + '_' + safeName(c.data.name) + '_' + fdate(Date.now()).replace(/\//g, '') + '.csv');
  },
  cleargame(){ return run(async () => {
    const g = S.game; if(!confirm(T('confirmClear', { game: T(GAME_KEY[g]) }))) return;
    if(g === 'bbk'){ await DATA.deleteDocs('class_plays', S.plays.map(r => r.id)); S.plays = []; }
    else{ await DATA.deleteDocs('class_scores', S.scores.filter(r => r.game === g).map(r => r.id)); S.scores = S.scores.filter(r => r.game !== g); }
    render();
  }); }
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if(!el || el.closest('.modal')) return;
  const act = el.dataset.act;
  if(/^col/.test(act) && act !== 'colsave') S.colMsg = '';   // 改了設定就把舊的錯誤訊息拿掉
  const f = actions[act]; if(f) f(el);
});
document.addEventListener('change', e => {
  const s = e.target.closest('[data-sel]'); if(!s) return;
  if(s.dataset.sel === 'correbank') S.correBank = s.value;
  if(s.dataset.sel === 'colcfg') S.colCfg = s.value;
  if(s.dataset.sel === 'bbksel'){ S.bbkSel = s.value; S.msg = ''; }
  if(s.dataset.sel === 'wscfg') S.ws.cfg = s.value;
  render();
});
document.addEventListener('input', e => {
  if(e.target.id === 'bbkName' && S.bbkEdit) S.bbkEdit.dr.name = e.target.value;
  if(S.colEdit){
    if(e.target.id === 'colName') S.colEdit.dr.name = e.target.value;
    if(e.target.id === 'colList') S.colEdit.dr.list = e.target.value;
    if(e.target.dataset && e.target.dataset.cc != null){ const c = S.colEdit.dr.custom[+e.target.dataset.cc]; if(c) c[e.target.dataset.f] = e.target.value; }
  }
});
window.addEventListener('hashchange', onRoute);

// ---- 啟動 ----
render();
const r0 = parseHash(); S.route = r0.route; S.cur = r0.cur;
try{
  DATA.onUser(u => {
    S.user = u; S.authSeen = true;
    if(DATA.isRealUser(u)){ loadAccount(); }
    else{ S.acct = ''; S.a = null; render(); }
  });
}catch(e){ console.error(e); S.authSeen = true; S.msg = err(e); render(); }
window.__profesor = { S, go };
})();
