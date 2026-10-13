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
  correBank: '', colCfg: '', busy: false
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
    S.game = 'corre'; S.days = 0; S.tab = 'stu'; S.sel = null; S.msg2 = ''; S.correBank = ''; S.colCfg = '';
    render(); window.scrollTo(0, 0);
    if(S.acct === 'ok' && classOf(S.cur)) await loadBook();
    return;
  }
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
function homeHtml(){
  const A = S.a, P = A.plan, nCls = Object.keys(A.classes).length;
  const banksMax = P.active ? 5 : 1, cfgMax = P.active ? 15 : 3;
  const plan = '<div class="card"><h3>' + esc(T('planTitle')) + '</h3><div class="kv"><span><span class="badge ' + (P.active ? 'pro' : '') + '">' + esc(T(P.active ? 'planPro' : 'planFree')) + '</span></span><span class="mut">' +
    (P.expiresAt ? esc(T(P.active ? 'planUntil' : 'planExpired', { date: fdate(P.expiresAt) })) : '') + '</span></div>' + planNoticeHtml() + '</div>';
  const usage = '<div class="card"><h3>' + esc(T('usageTitle')) + '</h3>' +
    '<div class="kv"><span>' + esc(T('usageClasses')) + '</span><b>' + nCls + ' / ' + DATA.MAX_CLASSES + '</b></div>' +
    '<div class="kv"><span>' + esc(T('usageCorre')) + '</span><b>' + (A.extrasReady ? A.banks.length + ' / ' + banksMax : '–') + '</b></div>' +
    '<div class="kv"><span>' + esc(T('usageColores')) + '</span><b>' + (A.extrasReady ? A.configs.length + ' / ' + cfgMax : '–') + '</b></div>' +
    '<div class="kv"><span>' + esc(T('usageBbk')) + '</span><span class="mut">' + esc(T('soon')) + '</span></div></div>';
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
    url = DATA.linkBbk(c.cid);
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
function settingsHtml(){
  const rows = [['corre', 'settingsCorre'], ['colores', 'settingsColores'], ['bbk', 'settingsBbk']];
  return '<h2>' + esc(T('settingsTitle')) + '</h2><p class="hint">' + esc(T('settingsHint')) + '</p>' + rows.map(r =>
    '<div class="card"><h3>' + esc(T(GAME_KEY[r[0]])) + '</h3><p class="hint">' + esc(T(r[1])) + '</p><div class="row"><a class="pill sm" href="' + DATA.TEACHER_URL[r[0]] + '" target="_blank" rel="noopener">' + esc(T('openSettingsPage')) + '</a></div></div>').join('');
}
function printHtml(){
  const rows = [['corre', 'printCorre'], ['colores', 'printColores'], ['bbk', 'printBbk']];
  return '<h2>' + esc(T('printTitle')) + '</h2><p class="hint">' + esc(T('printHint')) + '</p>' + rows.map(r =>
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
  const f = actions[el.dataset.act]; if(f) f(el);
});
document.addEventListener('change', e => {
  const s = e.target.closest('[data-sel]'); if(!s) return;
  if(s.dataset.sel === 'correbank') S.correBank = s.value;
  if(s.dataset.sel === 'colcfg') S.colCfg = s.value;
  render();
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
