// 老師管理中心：畫面與操作。資料在 data.js、成績簿表格在 books.js、文字在 i18n.js。
(function(){
'use strict';
const T = (k, p) => I18N.t(k, p);
const esc = BOOKS.esc;
const app = document.getElementById('app');
const GAMES = ['corre', 'colores', 'bbk'];
const GAME_KEY = { corre: 'gameCorre', colores: 'gameColores', bbk: 'gameBbk', dragon: 'gameDragon' };
const GAME_DESC = { corre: 'gameCorreDesc', colores: 'gameColoresDesc', bbk: 'gameBbkDesc', dragon: 'gameDragonDesc' };
const GAME_IDS = ['corre', 'colores', 'bbk', 'dragon'];
const GAME_TABS = ['content', 'links', 'scores', 'sheet', 'help'];
const DR = window.DRAGON;
const bookGames = () => DR.ready() ? GAMES.concat(['dragon']) : GAMES;     // 成績冊的遊戲分頁（墨龍正式開放前不顯示）
const maintBox = () => '<div class="notice">🔧 <b>' + esc(T('maint')) + '</b>：' + esc(T('maintNote')) + '</div>';

const S = {
  authSeen: false, user: null, acct: '', msg: '', a: null,          // a = loadAccount 的結果
  route: 'home', cur: null,
  g: 'corre', gt: 'content', cls: (function(){ try{ return localStorage.getItem('profesorCls') || ''; }catch(e){ return ''; } })(),   // 遊戲頁：現在是哪款遊戲、哪個分頁；連結／成績分頁選的班級
  game: 'corre', days: 0, tab: 'stu', sel: null,
  scores: [], scoresState: '', plays: [], playsState: '', msg2: '',
  correSrc: 'L:A1', correLv: '', pubSrc: 'L:A1', pubLv: '', colCfg: '', bbkSel: '', busy: false, setK: '',     // setK = 成績冊只看哪個設定（'' = 全部）
  dragonSel: '', dragonEdit: null, dragonSetEdit: null, dragonMsg: '', dragonQuick: ['food', 'animal', 'color'], dws: null,   // 墨龍：班級連結選的範圍、自訂主題／範圍編輯、快速連結勾的主題、學習單選項
  bbkEdit: null, bbkMsg: '',                                       // bbkEdit = { i（-1 = 新增）, dr 草稿 }
  colEdit: null, colMsg: '',                                       // colEdit = { i, dr }（色數設定組）
  ws: null, wsSheet: null, wsKind: '', bws: null,                                         // 色數學習單選項與產生好的學習單
  bankMsg: '', cws: null                                           // 跑吧句庫卡片的錯誤訊息、跑吧學習單選項
};

// ---- 小工具 ----
function toast(m){ const el = document.getElementById('toast'); el.textContent = m; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 1600); }
function saveBlob(blob, name){ const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
const safeName = s => String(s || '').replace(/[\\/:*?"<>|\s]+/g, '_');
// 複製連結：手機上如果前面有等網路（例如先存檔才拿到連結），瀏覽器常常不讓自動複製。
// 這時跳出一個小視窗：連結放在框框裡（已選好），按「複製」一定成功；手機還有「分享」可以直接傳到 LINE／WhatsApp。
async function copyText(text){
  try{ await navigator.clipboard.writeText(text); toast(T('copied')); return; }catch(e){}
  try{
    const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy'); ta.remove(); if(ok){ toast(T('copied')); return; }
  }catch(e){}
  copyBox(text);
}
function copyBox(text){
  const old = document.querySelector('.modal.cp'); if(old) old.remove();
  const m = document.createElement('div'); m.className = 'modal cp';
  m.innerHTML = '<div class="box"><h3>🔗 ' + esc(T('copyTitle')) + '</h3><p class="hint">' + esc(T('copyHint')) + '</p>' +
    '<textarea class="cpbox" readonly rows="3">' + esc(text) + '</textarea>' +
    '<div class="row" style="justify-content:center"><button class="pill fill" data-m="cp">' + esc(T('copyLink')) + '</button>' +
    (navigator.share ? '<button class="pill" data-m="share">' + esc(T('shareLink')) + '</button>' : '') +
    '<button class="pill" data-m="close">' + esc(T('close')) + '</button></div></div>';
  document.body.appendChild(m);
  const box = m.querySelector('.cpbox');
  const sel = () => { box.focus(); box.select(); box.setSelectionRange(0, text.length); };
  setTimeout(sel, 50);
  m.addEventListener('click', async e => {
    const b = e.target.closest('[data-m]');
    if(e.target === m || (b && b.dataset.m === 'close')){ m.remove(); return; }
    if(!b) return;
    if(b.dataset.m === 'cp'){
      let ok = false;
      try{ await navigator.clipboard.writeText(text); ok = true; }catch(err){ sel(); try{ ok = document.execCommand('copy'); }catch(e2){} }
      if(ok){ toast(T('copied')); m.remove(); } else { sel(); toast(T('copySelect')); }
    }
    if(b.dataset.m === 'share'){ try{ await navigator.share({ url: text }); m.remove(); }catch(err){} }
  });
}
const err = e => DATA.explain(e, T);
const isReal = () => DATA.isRealUser(S.user);
const classOf = slot => S.a && S.a.classes[String(slot)];
const fdate = BOOKS.fdate;

// ---- 路由（#/home、#/classes、#/classes/new、#/class/0、#/game/<遊戲>/<分頁>、#/bank/N；舊的 #/settings、#/print、#/help 會導到遊戲頁）----
function parseHash(){
  const h = (location.hash || '').replace(/^#\/?/, '').split('/');
  const r = h[0] || 'home';
  if(r === 'game'){
    if(GAME_IDS.indexOf(h[1]) < 0) return { route: 'home', cur: null, redirect: '#/home' };
    return { route: 'game', cur: null, g: h[1], gt: GAME_TABS.indexOf(h[2]) >= 0 ? h[2] : 'content' };
  }
  if(r === 'settings') return { route: 'home', cur: null, redirect: '#/game/' + S.g + '/content' };
  if(r === 'print') return { route: 'home', cur: null, redirect: '#/game/' + S.g + '/sheet' };
  if(r === 'help') return { route: 'home', cur: null, redirect: '#/game/' + S.g + '/help' };
  if(r === 'class' && /^[0-2]$/.test(h[1] || '')) return { route: 'class', cur: h[1] };
  if(r === 'bank' && /^[0-4]$/.test(h[1] || '')) return { route: 'bank', cur: h[1] };
  if(r === 'classes') return { route: 'classes', cur: h[1] === 'new' ? 'new' : null };
  return { route: 'home', cur: null };
}
// 連結、成績分頁用的「現在選的班級」
function ensureCls(){
  if(!S.a) return;
  const ks = Object.keys(S.a.classes).sort();
  if(!S.cls || !S.a.classes[S.cls]) S.cls = ks[0] || '';
}
function setCls(slot){ S.cls = String(slot); try{ localStorage.setItem('profesorCls', S.cls); }catch(e){} }
const clsC = () => { ensureCls(); return S.a && S.cls !== '' ? S.a.classes[S.cls] : undefined; };
// 按上方「班級」：有班級就直接打開第一班（班級頁上面的分頁可以換班）；「＋ 建立班級」分頁是 #/classes/new
function firstSlot(){ return S.a ? Object.keys(S.a.classes).sort()[0] : undefined; }
function classesRedirect(){
  if(S.route !== 'classes' || S.cur === 'new' || S.acct !== 'ok') return false;
  const s = firstSlot(); if(s == null) return false;
  location.replace('#/class/' + s); return true;
}
function go(route, cur){ location.hash = '#/' + route + (cur != null ? '/' + cur : ''); }
function goGame(g, t){ const h = '#/game/' + g + '/' + t; if(location.hash === h) onRoute(); else location.hash = h; }
let lastHash = location.hash, skipHash = false;
async function onRoute(){
  if(skipHash){ skipHash = false; return; }
  const r = parseHash();
  if(r.redirect){ location.replace(r.redirect); return; }
  // 離開句庫編輯：有沒上傳的修改要先問
  if(S.route === 'bank' && !(r.route === 'bank' && r.cur === S.cur)){
    if(CORRE.isDirty() && !confirm(CORRE.tr('confirmLeave'))){ skipHash = true; location.hash = lastHash; return; }
    CORRE.close();
  }
  lastHash = location.hash;
  const prevG = S.route === 'game' ? S.g : null;
  S.route = r.route; S.cur = r.cur;
  if(S.route === 'game'){
    if(prevG !== r.g){ S.days = 0; S.tab = 'stu'; S.sel = null; S.setK = ''; S.msg2 = ''; S.correSrc = 'L:A1'; S.correLv = ''; S.colCfg = ''; S.bbkSel = ''; S.dragonSel = ''; }
    S.g = r.g; S.gt = r.gt; S.game = r.g;
    if(S.gt !== 'content'){ S.bankMsg = ''; S.bbkEdit = null; S.bbkMsg = ''; S.colEdit = null; S.colMsg = ''; S.dragonEdit = null; S.dragonSetEdit = null; S.dragonMsg = ''; }
    if(S.gt !== 'sheet') S.wsSheet = null;
    render(); window.scrollTo(0, 0);
    if(S.gt === 'scores' && S.acct === 'ok' && clsC()) await loadBook();
    return;
  }
  if(S.route === 'class'){ if(classOf(S.cur)) setCls(S.cur); render(); window.scrollTo(0, 0); return; }
  if(classesRedirect()) return;
  S.bankMsg = ''; S.bbkEdit = null; S.bbkMsg = ''; S.colEdit = null; S.colMsg = ''; S.dragonEdit = null; S.dragonSetEdit = null; S.dragonMsg = '';
  S.wsSheet = null;
  render(); window.scrollTo(0, 0);
}

// ---- 載入 ----
async function loadAccount(){
  S.acct = 'loading'; S.msg = ''; render();
  try{ S.a = await DATA.loadAccount(S.user); S.acct = 'ok'; }
  catch(e){ console.error(e); S.acct = 'error'; S.msg = err(e); }
  if(classesRedirect()) return;
  render();
  if(S.acct === 'ok' && S.route === 'game' && S.gt === 'scores' && clsC()) loadBook();
}
async function loadBook(){
  const c = clsC(); if(!c) return;
  S.scoresState = 'loading'; S.playsState = 'loading'; S.msg2 = ''; render();
  const cid = c.cid;
  await Promise.all([
    DATA.loadScores(cid).then(r => { S.scores = r; S.scoresState = 'ok'; }).catch(e => { console.error(e); S.scores = []; S.scoresState = 'error'; S.msg2 = err(e); }),
    DATA.loadPlays(cid).then(r => { S.plays = r; S.playsState = 'ok'; }).catch(e => { console.error(e); S.plays = []; S.playsState = 'error'; S.msg2 = err(e); })
  ]);
  if(S.route === 'game' && S.gt === 'scores' && clsC() && clsC().cid === cid) render();
}

// ---- 畫面 ----
function headerHtml(){
  const lang = I18N.getLang();
  const seg = arr => '<div class="seg">' + arr.map(l => '<button class="' + (lang === l[0] ? 'on' : '') + '" data-act="lang" data-l="' + l[0] + '">' + l[1] + '</button>').join('') + '</div>';
  return '<div class="top"><div class="brand"><b>' + esc(T('appTitle')) + '</b>' + (S.user ? '<small>' + esc(T('signedInAs', { email: '' }).trim()) + '<span>' + esc(S.user.email) + '</span></small>' : '') + '</div><div class="topr"><div class="langs">' +
    seg([['tc', '繁'], ['sc', '简']]) + seg([['es', 'ES'], ['en', 'EN']]) + '</div>' +
    (S.user ? '<div class="langs"><button class="pill xs" data-act="feedback">' + esc(T('fbBtn')) + '</button><button class="pill xs" data-act="logout">' + esc(T('logout')) + '</button></div>' : '') + '</div></div>';
}
function navHtml(){
  return '<div class="nav"><button class="pill sm" data-act="nav" data-r="home">← ' + esc(T('navHome')) + '</button></div>';
}
function loginHtml(){
  return '<div class="card center"><h2>' + esc(T('appTitle')) + '</h2><p class="hint">' + esc(T('loginHint')) + '</p>' +
    '<div class="row" style="justify-content:center"><button class="pill fill" data-act="login">' + esc(T('login')) + '</button></div>' +
    (S.msg ? '<div class="err">' + esc(S.msg) + '</div>' : '') + '</div>';
}
function whoHtml(){
  return '<div class="who"><span>' + esc(T('signedInAs', { email: S.user.email })) + '</span></div>';
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
// 遊戲設定、學習單頁上方的快速按鈕：按了直接捲到那一張卡片
// 沒訂閱的人按到訂閱功能時的按鈕（按了跳出「建議訂閱」視窗）
const lockBtn = label => '<button class="pill sm lockbtn" data-act="needsub">🔒 ' + esc(label) + '</button>';
function usageOf(g){
  const A = S.a, P = A.plan, banksMax = P.active ? 5 : 1, cfgMax = P.active ? 15 : 3;
  if(g === 'corre') return T('usageCorre') + '　' + (A.extrasReady ? A.banks.length + ' / ' + banksMax : '–');
  if(g === 'colores') return T('usageColores') + '　' + (A.extrasReady ? A.configs.length + ' / ' + cfgMax : '–');
  if(g === 'bbk') return T('usageBbk') + '　' + (A.bbkReady ? A.bbk.length + ' / ' + DATA.bbkMax(P) : '–');
  return T('usageDragonThemes') + '　' + (A.dragonReady ? A.dragon.themes.length + ' / ' + DATA.DRAGON_THEMES_MAX : '–') + '　·　' + T('usageDragonSets') + '　' + (A.dragonReady ? A.dragon.sets.length + ' / ' + DATA.DRAGON_SETS_MAX : '–');
}
function homeHtml(){
  const A = S.a, P = A.plan, nCls = Object.keys(A.classes).length;
  const plan = '<div class="card"><h3 class="ph"><span>' + esc(T('planTitle')) + '</span><span class="badge ' + (P.active ? 'pro' : '') + '">' + esc(planLabel(P)) + '</span><span class="pexp">' +
    (P.expiresAt ? esc(T(P.active ? 'planUntil' : 'planExpired', { date: fdate(P.expiresAt) })) : '') + '</span></h3>' + planNoticeHtml() +
    '<div class="grow"><div class="ginfo"><b>' + esc(T('usageClasses')) + '</b><small class="mut">' + nCls + ' / ' + DATA.MAX_CLASSES + '</small></div>' +
    '<div class="row" style="margin:0"><button class="pill fill sm" data-act="nav" data-r="classes">' + esc(T('manage')) + '</button></div></div></div>';
  const games = '<div class="card"><h3>' + esc(T('gamesTitle')) + '</h3><p class="hint">' + esc(T('gamesPick')) + '</p>' + GAME_IDS.map(g =>
    '<div class="grow"><div class="ginfo"><b>' + esc(T(GAME_KEY[g])) + '</b><small>' + esc(T(GAME_DESC[g])) + '</small>' +
    ((g === 'dragon' && !DR.ready()) ? '' : usageOf(g).split('　·　').map(u => '<small class="mut">' + esc(u) + '</small>').join('')) + '</div>' +
    ((g === 'dragon' && !DR.ready()) ? '<span class="badge">🔧 ' + esc(T('maint')) + '</span>'
      : '<div class="row" style="margin:0"><button class="pill fill sm" data-act="togame" data-g="' + g + '" data-t="content">' + esc(T('manage')) + '</button>' +
        '<a class="pill sm" href="' + DATA.GAME_URL[g] + '" target="_blank" rel="noopener">' + esc(T('openGame')) + '</a></div>') + '</div>').join('') + '</div>';
  return plan + games;
}
// 班級頁最上面的分頁：每班一個（顯示班名），最後是「＋ 建立班級」（還沒滿 3 班才有）
function classTabsHtml(active){
  const A = S.a, P = A.plan, slots = Object.keys(A.classes).sort();
  let h = '<div class="ctabs">' + slots.map(k => '<button class="pill ' + (active === k ? 'on' : '') + '" data-act="openclass" data-slot="' + k + '">🏫 ' + esc(A.classes[k].data.name) + '</button>').join('');
  if(slots.length < DATA.MAX_CLASSES){
    if(P.active && A.clsReady) h += '<button class="pill add ' + (active === 'new' ? 'on' : '') + '" data-act="newclass">＋ ' + esc(T('createClass')) + '</button>';
    else if(!P.active) h += '<button class="pill add lockbtn" data-act="needsub">🔒 ' + esc(T('createClass')) + '</button>';
  }
  return h + '</div>';
}
function classesHtml(){
  const A = S.a, P = A.plan;
  let free = -1;
  for(let i = 0; i < DATA.MAX_CLASSES; i++) if(!A.classes[String(i)]){ free = i; break; }
  let h = classTabsHtml('new') + planNoticeHtml();
  if(!A.clsReady) h += '<div class="notice">' + esc(T('classesUnavailable')) + '</div>';
  h += '<div class="card"><h2>＋ ' + esc(T('createClass')) + '</h2><p class="hint">' + esc(T('classesHint')) + '</p>';
  if(free < 0) h += '<p class="hint">' + esc(T('classesFull')) + '</p>';
  else if(P.active && A.clsReady) h += '<div class="inline"><input type="text" id="newCls' + free + '" maxlength="40" placeholder="' + esc(T('classNamePh')) + '"><button class="pill fill sm" data-act="createclass" data-slot="' + free + '">＋ ' + esc(T('createClass')) + '</button></div>';
  else if(!P.active) h += (Object.keys(A.classes).length ? '' : '<p class="hint">' + esc(T('noClasses')) + '</p>') + '<div class="row">' + lockBtn(T('createClass')) + '</div>';
  if(S.msg) h += '<div class="err">' + esc(S.msg) + '</div>';
  return h + '</div>';
}

// ---- 公開句庫來源選單（班級連結、「遊戲設定」的公開句庫連結共用）----
// 值：'L:A1'／'L:A2'／'L:B1'＝公開句庫等級；'P:代碼'＝題包；'B:句庫碼'＝我的句庫。免費版：只有 A1、A2 可選，B1 和題包按了會跳「建議訂閱」（擋入口就好）。
const packLabel = p => PUB.packName(p, I18N.getLang());
function ensurePacks(){
  if(S.packs !== undefined) return;
  S.packs = null;   // 讀取中
  PUB.loadPacks().then(r => { S.packs = r; }).catch(e => { console.error(e); S.packs = []; S.packsErr = true; }).then(() => render());
}
function srcOptions(cur, withBanks){
  const act = S.a.plan.active, lock = act ? '' : '🔒 ';
  let h = '<optgroup label="' + esc(T('srcPublic')) + '">' + PUB.LEVELS.map(L =>
    '<option value="L:' + L + '" ' + (cur === 'L:' + L ? 'selected' : '') + '>' + (PUB.isFreeLevel(L) ? '' : lock) + esc(T('srcLevel', { l: L })) + '</option>').join('') + '</optgroup>';
  if(S.packs && S.packs.length) h += '<optgroup label="' + esc(T('srcPacks')) + '">' + S.packs.map(p =>
    '<option value="P:' + esc(p.id) + '" ' + (cur === 'P:' + p.id ? 'selected' : '') + '>' + lock + esc(packLabel(p)) + '</option>').join('') + '</optgroup>';
  if(withBanks && S.a.banks.length) h += '<optgroup label="' + esc(T('srcMine')) + '">' + S.a.banks.map(b =>
    '<option value="B:' + esc(b.sid) + '" ' + (cur === 'B:' + b.sid ? 'selected' : '') + '>📚 ' + esc(b.name || ('#' + (b.slot + 1))) + '</option>').join('') + '</optgroup>';
  return h + '';
}
function srcLvOptions(cur){
  const lock = S.a.plan.active ? '' : '🔒 ';
  return '<option value="">' + esc(T('srcAllLv')) + '</option>' + PUB.LEVELS.map(L =>
    '<option value="' + L + '" ' + (cur === L ? 'selected' : '') + '>' + (PUB.isFreeLevel(L) ? '' : lock) + L + '</option>').join('');
}
const srcLocked = v => !S.a.plan.active && (v.slice(0, 2) === 'P:' || v === 'L:B1');
function srcObj(v, lv){
  if(v.slice(0, 2) === 'B:') return { bank: v.slice(2) };
  if(v.slice(0, 2) === 'P:') return { pack: v.slice(2), level: lv || '' };
  return { level: v.slice(2) || 'A1' };
}
// 選單目前的值：選到的句庫被刪了、或免費版選到鎖住的，就退回 A1
function srcCur(v){
  if(v.slice(0, 2) === 'B:' && !S.a.banks.some(b => b.sid === v.slice(2))) return 'L:A1';
  if(srcLocked(v)) return 'L:A1';
  return v;
}
function srcFieldsHtml(key, v, lv, withBanks){
  let h = '<div class="field"><label>' + esc(T('sourceLabel')) + '</label><select data-sel="' + key + 'src">' + srcOptions(v, withBanks) + '</select></div>';
  if(v.slice(0, 2) === 'P:') h += '<div class="field"><label>' + esc(T('srcLevelLabel')) + '</label><select data-sel="' + key + 'lv">' + srcLvOptions(lv) + '</select></div>';
  return h;
}

// 學生連結
function linkCardHtml(game){
  const c = clsC(), A = S.a;
  let h = '<div class="link"><h3>' + esc(T(GAME_KEY[game])) + '</h3>';
  let url = '';
  if(game === 'dragon'){
    if(!DR.ready()) return h + maintBox() + '</div>';
    if(!A.dragonReady) return h + '<p class="hint">' + esc(T('bbkUnavailable')) + '</p></div>';
    const D = A.dragon;
    h += '<div class="field"><label>' + esc(T('dragonRangeLabel')) + '</label><select data-sel="dragonsel"><option value="">' + esc(T('dragonRangeAll')) + '</option>' +
      D.sets.map((it, i) => '<option value="' + i + '" ' + (S.dragonSel === String(i) ? 'selected' : '') + '>🐉 ' + esc(it.name) + '</option>').join('') + '</select></div>';
    const it = S.dragonSel !== '' ? D.sets[+S.dragonSel] : null;
    if(it){
      h += '<p class="hint">' + esc(DR.setSummary(it, D.themes)) + '</p>';
      if(!it.sid) return h + '<div class="row"><button class="pill fill sm" data-act="dragonmake">🔗 ' + esc(T('makeLink')) + '</button></div>' + (S.msg ? '<div class="err">' + esc(S.msg) + '</div>' : '') + '</div>';
    }else if(!D.sets.length) h += '<p class="hint">' + esc(T('dragonNoSets')) + '</p>';
    url = DATA.linkDragon(c.cid, it ? it.sid : '');
  }else if(game === 'corre'){
    ensurePacks();
    S.correSrc = srcCur(S.correSrc);
    h += srcFieldsHtml('corre', S.correSrc, S.correLv, true);
    url = DATA.linkCorre(c.cid, srcObj(S.correSrc, S.correLv));
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
  return h + '</div>';
}
// ---- 步驟 6-2：成績冊依設定分開 ----
// 設定的名稱：跑吧＝句庫、色數＝設定組、比比看＝範圍；刪掉的顯示「（已刪除的設定）」
function setLabel(game, k){
  const A = S.a;
  if(game === 'corre'){
    if(k === 'pool') return T('setOldPool');
    let m = /^pool-(A1|A2|B1)$/.exec(k); if(m) return T('srcLevel', { l: m[1] });
    m = /^pack-(.+?)(?:-(A1|A2|B1))?$/.exec(k);
    if(m){ const p = (S.packs || []).find(x => x.id === m[1]); return '🎯 ' + (p ? packLabel(p) : m[1]) + (m[2] ? ' · ' + m[2] : ''); }
    const b = (A.banks || []).find(x => x.sid === k); return b ? '📚 ' + CORRE.bankName(b) : T('setDeleted');
  }
  if(game === 'colores'){
    if(k === 'link') return T('setOldLink');
    const it = (A.configs || []).find(x => x.sid === k); return it ? '🎨 ' + ((it.cfg && it.cfg.name) || '#') : T('setDeleted');
  }
  if(game === 'dragon'){ const l = DR.themeLabel(k, (A.dragon || {}).themes); return l ? '🐉 ' + l : T('setDeleted'); }
  if(k === 'normal') return T('rangeNormal');
  if(k === 'other') return T('setOther');
  const it = (A.bbk || []).find(x => x.sid === k); return it ? '📐 ' + it.name : T('setDeleted');
}
function curSetK(keys){ return keys.indexOf(S.setK) >= 0 ? S.setK : ''; }
function setPickHtml(g, keys, sk){
  if(!keys.length) return '';
  return '<div class="field"><label>' + esc(T('setShow')) + '</label><select data-sel="setk"><option value="">' + esc(T('setAll')) + '</option>' +
    keys.map(k => '<option value="' + esc(k) + '" ' + (sk === k ? 'selected' : '') + '>' + esc(setLabel(g, k)) + '</option>').join('') + '</select></div>';
}
function bookHtml(){
  const g = S.game;
  let h = '<h3>' + esc(T('resultsTitle')) + ' · ' + esc(clsC().data.name) + '</h3>';
  const state = g === 'bbk' ? S.playsState : S.scoresState;
  if(state === 'loading' || state === '') return h + '<p class="hint">' + esc(T('loading')) + '</p>';
  if(state === 'error') return h + '<div class="err">' + esc(S.msg2) + '</div><div class="row"><button class="pill" data-act="refresh">' + esc(T('retry')) + '</button></div>';
  const rows0 = g === 'bbk' ? S.plays : S.scores, keys = BOOKS.setKeys(g, rows0), sk = curSetK(keys), lab = k => setLabel(g, k);
  h += setPickHtml(g, keys, sk);
  h += '<div class="row">' + [[0, 'filterAll'], [7, 'filter7'], [30, 'filter30']].map(d => '<button class="pill sm ' + (S.days === d[0] ? 'on' : '') + '" data-act="days" data-d="' + d[0] + '">' + esc(T(d[1])) + '</button>').join('') + '</div>';
  if(g === 'bbk'){
    const plays = sk ? S.plays.filter(r => BOOKS.setKeyOf('bbk', r) === sk) : S.plays;
    if(S.sel) return h + BOOKS.bbkStudent(plays, S.sel, S.days);
    h += '<div class="row">' + [['stu', 'tabStudents'], ['err', 'tabErrors']].map(x => '<button class="pill sm ' + (S.tab === x[0] ? 'on' : '') + '" data-act="tab" data-tab="' + x[0] + '">' + esc(T(x[1])) + '</button>').join('') + '</div>';
    const inRange = plays.filter(r => !S.days || r.ms >= Date.now() - S.days * 86400000);
    h += S.tab === 'stu' ? BOOKS.bbkStudents(plays, S.days, sk, lab) : BOOKS.bbkStats(inRange);
  }else{
    h += '<p class="hint">' + esc(T('students', { n: BOOKS.studentCount(g, S.scores, sk) })) + '</p>' + BOOKS.scoreTable(g, S.scores, S.days, sk, lab);
  }
  h += '<div class="row"><button class="pill sm" data-act="refresh">🔄 ' + esc(T('refresh')) + '</button><button class="pill sm" data-act="csv">⬇ ' + esc(T('csv')) + '</button>' +
    '<button class="pill sm" data-act="cleargame">' + esc(T('clearGame')) + '</button></div>';
  return h;
}
function classHtml(){
  const c = classOf(S.cur);
  if(!c) return classTabsHtml(String(S.cur)) + '<p class="hint">' + esc(T('noClasses')) + '</p>';
  let h = classTabsHtml(String(S.cur)) + planNoticeHtml() +
    '<div class="card" id="clsCard"><h2>🏫 ' + esc(c.data.name) + '</h2>' +
    '<div class="field"><label>' + esc(T('classNameLabel')) + '</label><div class="inline"><input type="text" id="clsName" maxlength="40" value="' + esc(c.data.name) + '"><button class="pill sm" data-act="classrename">' + esc(T('rename')) + '</button></div></div>' +
    '<div class="field"><label>' + esc(T('boardTitle')) + '</label><div class="row" style="margin-top:0">' +
    '<button class="pill sm ' + (c.data.showBoard ? 'on' : '') + '" data-act="board" data-v="1">' + esc(T('on')) + '</button><button class="pill sm ' + (!c.data.showBoard ? 'on' : '') + '" data-act="board" data-v="0">' + esc(T('off')) + '</button></div>' +
    '<p class="hint">' + esc(T('boardHint')) + '</p></div>' +
    '<div class="row"><button class="pill sm" data-act="classdelete">🗑 ' + esc(T('deleteClass')) + '</button></div>' +
    (S.msg ? '<div class="err">' + esc(S.msg) + '</div>' : '') + '</div>';
  h += '<div class="card" id="shortCard"><h3>' + esc(T('classShortcuts')) + '</h3><p class="hint">' + esc(T('classShortcutsHint')) + '</p>' +
    bookGames().map(g => '<div class="grow"><div class="ginfo"><b>' + esc(T(GAME_KEY[g])) + '</b></div><div class="row" style="margin:0">' +
      '<button class="pill sm" data-act="togame" data-g="' + g + '" data-t="links" data-slot="' + esc(String(S.cur)) + '">🔗 ' + esc(T('gtLinks')) + '</button>' +
      '<button class="pill sm" data-act="togame" data-g="' + g + '" data-t="scores" data-slot="' + esc(String(S.cur)) + '">📊 ' + esc(T('gtScores')) + '</button></div></div>').join('') + '</div>';
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
    '<div class="field"><label>' + esc(T('bbkTheme')) + '</label><div class="row" style="margin-top:0">' +
    BBK.THEMES.map(x => x[2] ? '<button class="pill sm ' + (dr.th === x[0] ? 'on' : '') + '" data-act="bbkth" data-k="' + x[0] + '">' + x[1] + ' ' + esc(T('th_' + x[0])) + '</button>'
      : '<button class="pill sm thlock" data-act="bbkthsoon" data-k="' + x[0] + '">' + x[1] + ' ' + esc(T('th_' + x[0])) + ' · 🔒 ' + esc(T('thSoon')) + '</button>').join('') + '</div>' +
    (S.bbkThNote ? '<p class="hint">🔒 ' + esc(T('thSoonNote')) + '</p>' : '') + '<div class="notice">' + esc(T('bbkSubjNote')) + '</div></div>' +
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
    else h += (A.plan.active ? '' : '<div class="row">' + lockBtn(T('bbkNew')) + '</div>') + '<div class="notice">' + esc(T(A.plan.active ? 'bbkFullPro' : 'bbkFullFree')) + (A.plan.active ? '' : ' <a href="' + DATA.PORTAL_URL + '" target="_blank" rel="noopener">' + esc(T('subscribe')) + '</a>') + '</div>';
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
    '<button class="x" data-act="colsay" data-k="' + i + '" title="' + esc(T('colListen')) + '">🔊</button><button class="x" data-act="colcdel" data-k="' + i + '">✕</button>' +
    '<input type="text" class="cpy" maxlength="40" placeholder="' + esc(T('colColorPy')) + '" value="' + esc(c.p || '') + '" data-cc="' + i + '" data-f="p"></div>').join('');
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
    else h += (A.plan.active ? '' : '<div class="row">' + lockBtn(T('colNew')) + '</div>') + '<div class="notice">' + esc(T(A.plan.active ? 'bbkFullPro' : 'bbkFullFree')) + (A.plan.active ? '' : ' <a href="' + DATA.PORTAL_URL + '" target="_blank" rel="noopener">' + esc(T('subscribe')) + '</a>') + '</div>';
  }
  if(S.colMsg && !E) h += '<div class="err">' + esc(S.colMsg) + '</div>';
  h += '<p class="hint">' + esc(T('colPracticeHint')) + '</p>';
  return h + '</div>';
}
// ---- 跑吧！漢字：句庫 ----
function correCardHtml(){
  const A = S.a, P = A.plan;
  let h = '<div class="card" id="correCard"><h3>' + esc(T('correBanksTitle')) + '</h3><p class="hint">' + esc(T('correBanksHint')) + '</p>';
  if(!A.extrasReady) return h + '<div class="notice">' + esc(T('bbkUnavailable')) + '</div></div>';
  h += '<p class="hint"><b>' + esc(T('correQuota', { n: A.banks.length, max: P.active ? CORRE.PRO_SLOTS : CORRE.FREE_SLOTS })) + '</b></p>';
  for(let i = 0; i < CORRE.PRO_SLOTS; i++){
    const b = CORRE.bankOf(A, i);
    if(b){
      h += '<div class="setrow"><div><b>📚 ' + esc(CORRE.bankName(b)) + '</b><small>' + esc(CORRE.tr('slotN', { n: i + 1 }) + ' · ' + CORRE.summary(b, P)) + '</small>' +
        (CORRE.paused(b, P) ? '<small class="err">' + esc(CORRE.tr('paused')) + '</small>' : '') + '</div><div class="row">' +
        '<button class="pill sm" data-act="bankedit" data-k="' + i + '">' + esc(T('edit')) + '</button>' +
        '<button class="pill sm" data-act="bankpractice" data-k="' + i + '">🔗 ' + esc(T('bbkPractice')) + '</button>' +
        '<button class="pill sm" data-act="bankqr" data-k="' + i + '">' + esc(T('qr')) + '</button>' +
        '<a class="pill sm" href="' + esc(DATA.linkCorrePractice(b.sid) + '&preview=1') + '" target="_blank" rel="noopener">' + esc(T('test')) + '</a>' +
        '<button class="pill sm" data-act="bankdel" data-k="' + i + '">🗑 ' + esc(T('del')) + '</button></div></div>';
    }else if(i < CORRE.FREE_SLOTS || P.active){
      h += '<div class="slot empty"><span class="mut">' + esc(CORRE.tr('slotN', { n: i + 1 })) + '</span><button class="pill fill sm" data-act="bankedit" data-k="' + i + '">＋ ' + esc(T('correNew')) + '</button></div>';
    }else{
      h += '<div class="slot empty"><span class="mut">🔒 ' + esc(CORRE.tr('slotN', { n: i + 1 })) + ' · ' + esc(T('correLocked')) + '</span>' + lockBtn(T('correNew')) + '</div>';
    }
  }
  if(!P.active) h += '<div class="notice">' + esc(T('correFreeNote')) + ' <a href="' + DATA.PORTAL_URL + '" target="_blank" rel="noopener">' + esc(T('subscribe')) + '</a></div>';
  if(S.bankMsg) h += '<div class="err">' + esc(S.bankMsg) + '</div>';
  h += '<p class="hint">' + esc(T('correPracticeHint')) + '</p>';
  return h + '</div>';
}
// ---- 公開句庫練習連結（不屬於班級，不收成績）----
function pubCardHtml(){
  const A = S.a;
  ensurePacks();
  S.pubSrc = srcCur(S.pubSrc || 'L:A1');
  const o = srcObj(S.pubSrc, S.pubLv), url = DATA.linkCorrePublic(o);
  let h = '<div class="card" id="pubCard"><h3>' + esc(T('pubTitle')) + '</h3><p class="hint">' + esc(T('pubHint')) + '</p>' + srcFieldsHtml('pub', S.pubSrc, S.pubLv, false);
  h += '<div class="url" data-url="pub">' + esc(url) + '</div><div class="row">' +
    '<button class="pill fill sm" data-act="copy" data-url="' + esc(url) + '">' + esc(T('copyLink')) + '</button>' +
    '<button class="pill sm" data-act="pubqr" data-url="' + esc(url) + '">' + esc(T('qr')) + '</button>' +
    '<a class="pill sm" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(T('test')) + '</a></div>';
  if(!A.plan.active) h += '<div class="notice">' + esc(T('pubFreeNote')) + ' <a href="' + DATA.PORTAL_URL + '" target="_blank" rel="noopener">' + esc(T('subscribe')) + '</a></div>';
  return h + '<p class="hint">' + esc(T('pubPracticeHint')) + '</p></div>';
}
// ---- 墨龍飛天：快速練習連結、自訂主題、練習範圍 ----
const lockedNote = () => '<div class="notice">🔒 ' + esc(T('dragonSubOnly')) + ' <a href="' + DATA.PORTAL_URL + '" target="_blank" rel="noopener">' + esc(T('subscribe')) + '</a></div>';
function dragonThemeEditorHtml(){
  const E = S.dragonEdit, dr = E.dr;
  let h = '<div class="editor"><div class="field"><label>' + esc(T('dragonThemeName')) + '</label><input type="text" id="dgName" maxlength="12" placeholder="' + esc(T('dragonThemeNamePh')) + '" value="' + esc(dr.name) + '"></div>' +
    '<div class="field"><label>' + esc(T('dragonWordsLabel')) + '</label><textarea id="dgText" rows="8" placeholder="' + esc(T('dragonWordsPh')) + '">' + esc(dr.text) + '</textarea><p class="hint">' + esc(T('dragonTextHint', { min: DR.MIN_W, max: DR.MAX_W })) + '</p></div>' +
    '<div class="row"><button class="pill sm" data-act="dggen">⚙️ ' + esc(T(dr.rows ? 'dragonRegen' : 'dragonGen')) + '</button></div>';
  if(dr.rows){
    h += '<p class="hint">' + esc(T('dragonRowsHint')) + '</p><div class="tablewrap"><table class="t nw dgt"><tr><th>' + [T('dragonColTrad'), T('dragonColSimp'), T('dragonColPy'), 'ES', 'EN', ''].map(esc).join('</th><th>') + '</th></tr>' +
      dr.rows.map((r, i) => '<tr><td><b>' + esc(r.t) + '</b></td>' + ['s', 'p', 'es', 'en'].map(f => '<td><input type="text" data-dgr="' + i + '" data-f="' + f + '" maxlength="60" value="' + esc(r[f]) + '"></td>').join('') +
        '<td><button class="x" data-act="dgrowdel" data-k="' + i + '" aria-label="' + esc(T('del')) + '">✕</button></td></tr>').join('') + '</table></div>';
  }
  if(S.dragonMsg) h += '<div class="err">' + esc(S.dragonMsg) + '</div>';
  return h + '<div class="row"><button class="pill fill sm" data-act="dgsave">' + esc(T('save')) + '</button><button class="pill sm" data-act="dgcancel">' + esc(T('cancel')) + '</button></div></div>';
}
function dragonSetEditorHtml(){
  const E = S.dragonSetEdit, dr = E.dr, D = S.a.dragon;
  let h = '<div class="editor"><div class="field"><label>' + esc(T('dragonSetName')) + '</label><input type="text" id="dsName" maxlength="40" placeholder="' + esc(T('dragonSetNamePh')) + '" value="' + esc(dr.name) + '"></div>' +
    '<div class="field"><label>' + esc(T('dragonSetPick')) + '</label><div class="row" style="margin-top:0">' +
    DR.IDS.map(id => chip(dr.builtin.indexOf(id) >= 0, DR.builtinName(id), 'dsb', id)).join('') +
    D.themes.map(t => chip(dr.custom.indexOf(t.id) >= 0, '★ ' + t.name, 'dsc', t.id)).join('') + '</div></div>';
  if(S.dragonMsg) h += '<div class="err">' + esc(S.dragonMsg) + '</div>';
  return h + '<div class="row"><button class="pill fill sm" data-act="dssave">' + esc(T('save')) + '</button><button class="pill sm" data-act="dscancel">' + esc(T('cancel')) + '</button></div></div>';
}
function dragonQuickHtml(){
  let h = '<div class="card" id="dragonQuick"><h3>🐉 ' + esc(T('dragonQuickTitle')) + '</h3>';
  if(!DR.ready()) return h + maintBox() + '</div>';
  const A = S.a, P = A.plan;
  if(!A.dragonReady) return h + '<div class="notice">' + esc(T('bbkUnavailable')) + '</div></div>';
  const sel = S.dragonQuick.filter(id => P.active || DR.isFreeId(id)), url = sel.length ? DATA.linkDragonQuick(sel) : '';
  h += '<p class="hint">' + esc(T(P.active ? 'dragonQuickHintPro' : 'dragonQuickHintFree')) + '</p><div class="row" style="margin-top:0">' +
    DR.IDS.map(id => (P.active || DR.isFreeId(id)) ? chip(sel.indexOf(id) >= 0, DR.builtinName(id), 'dqk', id)
      : '<button class="pill sm chip lockbtn" data-act="needsub">🔒 ' + esc(DR.builtinName(id)) + '</button>').join('') + '</div>';
  h += url ? '<div class="url" data-url="dragon">' + esc(url) + '</div><div class="row"><button class="pill fill sm" data-act="copy" data-url="' + esc(url) + '">' + esc(T('copyLink')) + '</button>' +
    '<button class="pill sm" data-act="dragonqr" data-url="' + esc(url) + '">' + esc(T('qr')) + '</button><a class="pill sm" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(T('test')) + '</a></div>'
    : '<p class="hint">' + esc(T('dragonQuickNone')) + '</p>';
  return h + '</div>';
}
function dragonCardHtml(){
  let h = '<div class="card" id="dragonCard"><h3>🐉 ' + esc(T('dragonTitle')) + '</h3>';
  if(!DR.ready()) return h + maintBox() + '</div>';
  const A = S.a, P = A.plan, D = A.dragon, E = S.dragonEdit, SE = S.dragonSetEdit;
  h += '<p class="hint">' + esc(T('dragonHint')) + '</p>';
  if(!A.dragonReady) return h + '<div class="notice">' + esc(T('bbkUnavailable')) + '</div></div>';
  // 2. 自訂主題（訂閱）
  h += '<h4>' + esc(T('dragonCustomTitle')) + '</h4>';
  if(!P.active){ h += lockedNote(); }
  else{
    h += '<p class="hint">' + esc(T('dragonCustomHint', { max: DR.MAX_W })) + ' <b>' + esc(T('bbkQuota', { n: D.themes.length, max: DR.MAX_T })) + '</b></p>';
    D.themes.forEach((t, i) => {
      if(E && E.i === i){ h += dragonThemeEditorHtml(); return; }
      h += '<div class="setrow"><div><b>★ ' + esc(t.name) + '</b><small>' + esc(T('dragonWordCount', { n: t.words.length })) + '</small></div><div class="row">' +
        '<button class="pill sm" data-act="dgedit" data-k="' + i + '">' + esc(T('edit')) + '</button><button class="pill sm" data-act="dgdel" data-k="' + i + '">🗑 ' + esc(T('del')) + '</button></div></div>';
    });
    if(E && E.i < 0) h += dragonThemeEditorHtml();
    else if(!E && D.themes.length < DR.MAX_T) h += '<div class="row"><button class="pill fill sm" data-act="dgnew">＋ ' + esc(T('dragonThemeNew')) + '</button></div>';
    else if(!E) h += '<div class="notice">' + esc(T('dragonThemeFull')) + '</div>';
    // 3. 練習範圍（訂閱）：選好主題，產生固定的連結，也能放進班級連結
    h += '<h4>' + esc(T('dragonSetsTitle')) + '</h4><p class="hint">' + esc(T('dragonSetsHint')) + ' <b>' + esc(T('bbkQuota', { n: D.sets.length, max: DR.MAX_SETS })) + '</b></p>';
    D.sets.forEach((it, i) => {
      if(SE && SE.i === i){ h += dragonSetEditorHtml(); return; }
      h += '<div class="setrow"><div><b>🐉 ' + esc(it.name) + '</b><small>' + esc(DR.setSummary(it, D.themes)) + '</small></div><div class="row">' +
        '<button class="pill sm" data-act="dsedit" data-k="' + i + '">' + esc(T('edit')) + '</button>' +
        '<button class="pill sm" data-act="dspractice" data-k="' + i + '">🔗 ' + esc(T('bbkPractice')) + '</button>' +
        (it.sid ? '<a class="pill sm" href="' + esc(DATA.linkDragonSet(it.sid)) + '" target="_blank" rel="noopener">' + esc(T('test')) + '</a>' : '') +
        '<button class="pill sm" data-act="dsdel" data-k="' + i + '">🗑 ' + esc(T('del')) + '</button></div></div>';
    });
    if(SE && SE.i < 0) h += dragonSetEditorHtml();
    else if(!SE && D.sets.length < DR.MAX_SETS) h += '<div class="row"><button class="pill fill sm" data-act="dsnew">＋ ' + esc(T('dragonSetNew')) + '</button></div>';
    else if(!SE) h += '<div class="notice">' + esc(T('bbkFullPro')) + '</div>';
  }
  if(S.dragonMsg && !E && !SE) h += '<div class="err">' + esc(S.dragonMsg) + '</div>';
  return h + '<p class="hint">' + esc(T('dragonPracticeHint')) + '</p></div>';
}
function bankRouteHtml(){
  const why = CORRE.open(S.a, +S.cur);
  if(!why) return '<div id="correEd"></div>';
  return '<div class="row"><button class="pill sm" data-act="togame" data-g="corre" data-t="content">' + esc(CORRE.tr('back')) + '</button></div><div class="notice">' +
    esc(why === 'locked' ? CORRE.tr('slotLockedEd') : T('bbkUnavailable')) + '</div>';
}
// ---- 遊戲頁：每款遊戲一頁，分頁＝題庫／連結／成績／學習單／說明 ----
const GT_CONTENT = { corre: 'gtBankCorre', colores: 'gtBankColores', bbk: 'gtBankBbk', dragon: 'gtBankDragon' };
const GT_LABEL = { links: 'gtLinks', scores: 'gtScores', sheet: 'gtSheet', help: 'gtHelp' };
function classPickHtml(){
  const A = S.a, ks = Object.keys(A.classes).sort();
  if(!ks.length) return '<div class="notice">' + esc(T('noClasses')) + '</div><div class="row">' +
    (A.plan.active && A.clsReady ? '<button class="pill fill sm" data-act="newclass">＋ ' + esc(T('createClass')) + '</button>' : lockBtn(T('createClass'))) + '</div>';
  return '<div class="field"><label>' + esc(T('pickClass')) + '</label><div class="ctabs">' +
    ks.map(k => '<button class="pill ' + (S.cls === k ? 'on' : '') + '" data-act="pickcls" data-slot="' + k + '">🏫 ' + esc(A.classes[k].data.name) + '</button>').join('') + '</div></div>';
}
function classLinksHtml(g){
  return '<div class="card" id="linksCard"><h3>🔗 ' + esc(T('linksTitle')) + '</h3><p class="hint">' + esc(T('linksHint')) + '</p>' + classPickHtml() +
    (clsC() ? '<div class="notice alert">⚠️ ' + esc(T('linksNick')) + '</div>' + linkCardHtml(g) : '') + '</div>';
}
function gameLinksHtml(g){
  if(g === 'corre') return pubCardHtml() + classLinksHtml(g);
  if(g === 'dragon') return dragonQuickHtml() + classLinksHtml(g);
  return '<p class="hint">' + esc(T('linksPracticeHint')) + '</p>' + classLinksHtml(g);
}
function gameScoresHtml(){
  if(S.g === 'corre') ensurePacks();   // 成績冊的題包名稱要用
  return '<div class="card" id="bookCard">' + classPickHtml() + (clsC() ? bookHtml() : '') + '</div>';
}
function gameHtml(){
  const g = S.g;
  ensureCls();
  let h = '<div class="ctabs gsw">' + GAME_IDS.map(x => '<button class="pill ' + (g === x ? 'on' : '') + '" data-act="togame" data-g="' + x + '" data-t="' + S.gt + '">' + esc(T(GAME_KEY[x])) + '</button>').join('') + '</div>' +
    '<div class="gtitle"><h2>' + esc(T(GAME_KEY[g])) + '</h2><a class="pill sm" href="' + DATA.GAME_URL[g] + '" target="_blank" rel="noopener">▶ ' + esc(T('openGame')) + '</a></div>';
  if(g === 'dragon' && !DR.ready()) return h + maintBox();
  h += '<div class="gtabs">' + [['content', GT_CONTENT[g]], ['links', GT_LABEL.links], ['scores', GT_LABEL.scores], ['sheet', GT_LABEL.sheet], ['help', GT_LABEL.help]].map(t =>
    '<button class="pill sm ' + (S.gt === t[0] ? 'on' : '') + '" data-act="gtab" data-t="' + t[0] + '">' + esc(T(t[1])) + '</button>').join('') + '</div>';
  if(S.gt === 'content') return h + (g === 'corre' ? correCardHtml() : g === 'colores' ? colCardHtml() : g === 'bbk' ? bbkCardHtml() : dragonCardHtml());
  if(S.gt === 'links') return h + gameLinksHtml(g);
  if(S.gt === 'scores') return h + gameScoresHtml();
  if(S.gt === 'sheet') return h + (g === 'corre' ? cwsFormHtml() : g === 'colores' ? wsFormHtml() : g === 'bbk' ? bwsFormHtml() : dwsFormHtml());
  return h + helpHtml(g);
}
// ---- 遊戲設定說明（#/help）：內容在 js/help.js（靜態文字，四種語言）----
function helpLang(){ const H = window.HELP || {}; return H[I18N.getLang()] || H.tc || { btn: '', sections: [], jump: [] }; }
function helpHtml(game){
  const H = helpLang();
  const mine = { corre: 'hCorre', colores: 'hCol', bbk: 'hBbk', dragon: 'hDragon' }[game];
  const list = a => '<ul class="hlist">' + a.map(x => '<li>' + x + '</li>').join('') + '</ul>';
  const sec = x => (x.id === mine ? '<div class="card hsec" id="' + x.id + '"><h3>' + esc(x.h) + '</h3>' : '<details class="card hsec" id="' + x.id + '"><summary><b>' + esc(x.h) + '</b></summary>') +
    (x.intro ? '<p>' + x.intro + '</p>' : '') +
    (x.steps ? '<ol class="hsteps">' + x.steps.map((st, i) => '<li><span class="hnum">' + (i + 1) + '</span><div><b>' + esc(st[0]) + '</b><div>' + st[1] + '</div></div></li>').join('') + '</ol>' : '') +
    (x.items ? list(x.items) : '') +
    (x.groups ? x.groups.map(g => '<h4>' + esc(g[0]) + '</h4>' + list(g[1])).join('') : '') +
    (x.tip ? '<div class="notice">' + x.tip + '</div>' : '') +
    (x.note ? '<div class="notice">' + x.note + '</div>' : '') +
    (x.plan ? '<div class="hplan"><div><span class="badge">' + esc(H.free) + '</span><span>' + esc(x.plan[0]) + '</span></div><div><span class="badge pro">' + esc(H.pro) + '</span><span>' + esc(x.plan[1]) + '</span></div></div>' : '') +
    (x.id === mine ? '</div>' : '</details>');
  return H.sections.filter(x => x.id === mine || x.id === 'hStep' || x.id === 'hSub').sort((a, b) => (a.id === mine ? 0 : a.id === 'hStep' ? 1 : 2) - (b.id === mine ? 0 : b.id === 'hStep' ? 1 : 2)).map(sec).join('');
}
// ---- 列印：色數學習單 ----
function wsDefaults(){
  const l = I18N.getLang();
  return { cfg: '', kind: 'listen', read: true, count: 10, legend: true, simp: l === 'sc', help: l === 'en' ? 'en' : 'es', answers: true };
}
function wsFormHtml(){
  const A = S.a, W = S.ws || (S.ws = wsDefaults());
  let h = '<div class="card" id="wsCard"><h3>' + esc(T('gameColores')) + '</h3>';
  if(!A.plan.active) return h + '<div class="notice">🔒 ' + esc(T('wsLocked')) + ' <a href="' + DATA.PORTAL_URL + '" target="_blank" rel="noopener">' + esc(T('subscribe')) + '</a></div><div class="row">' + lockBtn(T('wsMake')) + '</div></div>';
  if(!A.configs.length) return h + '<p class="hint">' + esc(T('wsNoCfg')) + '</p><div class="row"><button class="pill sm" data-act="togame" data-g="colores" data-t="content">' + esc(T('navSettings')) + '</button></div></div>';
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
    '<button class="pill sm" data-act="' + (S.wsKind === 'bbk' ? 'bwsmake' : 'wsmake') + '">🔄 ' + esc(T('wsRemake')) + '</button><button class="pill fill sm" data-act="wsprint">🖨 ' + esc(T('wsPrint')) + '</button></div>' +
    '<p class="hint">' + esc(T('wsPrintTip')) + '</p></div><div class="ws">' + S.wsSheet + '</div>';
}
// ---- 列印：跑吧學習單 PDF ----
function cwsDefaults(){ return { bank: '', lang: I18N.getLang() === 'en' ? 'en' : 'es', pinyin: true, zhuyin: false, order: true, busy: false, msg: '', ok: false }; }
function cwsFormHtml(){
  const A = S.a, W = S.cws || (S.cws = cwsDefaults());
  let h = '<div class="card" id="cwsCard"><h3>' + esc(T('gameCorre')) + '</h3><p class="hint">' + esc(T('cwsHint')) + '</p>';
  if(!A.plan.active) return h + '<div class="notice">🔒 ' + esc(T('wsLocked')) + ' <a href="' + DATA.PORTAL_URL + '" target="_blank" rel="noopener">' + esc(T('subscribe')) + '</a></div><div class="row">' + lockBtn(T('wsMake')) + '</div></div>';
  if(!A.banks.length) return h + '<p class="hint">' + esc(T('cwsNoBank')) + '</p><div class="row"><button class="pill sm" data-act="togame" data-g="corre" data-t="content">' + esc(T('navSettings')) + '</button></div></div>';
  const pills = (act, cur, list) => list.map(x => '<button class="pill sm ' + (String(cur) === String(x[0]) ? 'on' : '') + '" data-act="' + act + '" data-k="' + x[0] + '">' + esc(x[1]) + '</button>').join('');
  const chipB = (on, label, act) => '<button class="pill sm chip ' + (on ? 'on' : '') + '" data-act="' + act + '">' + (on ? '✓ ' : '') + esc(label) + '</button>';
  const b = W.bank !== '' ? CORRE.bankOf(A, +W.bank) : null;
  h += '<div class="field"><label>' + esc(T('cwsBank')) + '</label><select data-sel="cwsbank"><option value="">' + esc(T('configPick')) + '</option>' +
    A.banks.map(x => '<option value="' + x.slot + '" ' + (W.bank === String(x.slot) ? 'selected' : '') + '>📚 ' + esc(CORRE.bankName(x)) + '</option>').join('') + '</select>' +
    (b ? '<p class="hint">' + esc(CORRE.summary(b, A.plan)) + '</p>' : '') + '</div>' +
    '<div class="field"><label>' + esc(CORRE.tr('pdfLang')) + '</label><div class="row" style="margin-top:0">' + pills('cwslang', W.lang, [['es', 'Español'], ['en', 'English']]) + '</div></div>' +
    '<div class="field"><div class="row" style="margin-top:0">' + chipB(W.pinyin, CORRE.tr('pdfPinyin'), 'cwspy') + chipB(W.zhuyin, CORRE.tr('pdfZhuyin'), 'cwszy') + '</div>' +
    '<div class="row">' + chipB(W.order, CORRE.tr('pdfOrder'), 'cwsorder') + '</div></div>' +
    '<div class="row"><button class="pill fill" data-act="cwsmake" ' + (!b || W.busy ? 'disabled' : '') + '>📄 ' + esc(W.busy ? CORRE.tr('pdfWorking') : CORRE.tr('pdfMake')) + '</button></div>' +
    (W.msg ? '<div class="' + (W.ok ? 'ok' : 'err') + '">' + esc(W.msg) + '</div>' : '');
  return h + '</div>';
}
// ---- 列印：比比看學習單（用遊戲那邊的 engine.js＋worksheet.js，出題跟遊戲完全一樣）----
const BBK_BASE = window.BBK_BASE || '../compara-y-adivina/';   // 同一個網站底下的比比看
let bbkLoad = null;
function loadBbk(){
  if(!bbkLoad) bbkLoad = (async () => {
    const add = src => new Promise((res, rej) => { const el = document.createElement('script'); el.src = BBK_BASE + src; el.onload = res; el.onerror = () => rej(new Error('load ' + src)); document.head.appendChild(el); });
    if(!window.THEME_PACK) await add('themes/people.js?v=6-5');
    if(!window.BBK_ENGINE) await add('engine.js?v=6-8');
    if(!window.BBK_WORKSHEET) await add('worksheet.js?v=6-8');
    return window.BBK_ENGINE(window.THEME_PACK);
  })().catch(e => { bbkLoad = null; throw e; });
  return bbkLoad;
}
function bwsDefaults(){
  const l = I18N.getLang();
  return { sel: 'L1', n: 10, simp: l === 'sc', lang: l === 'en' ? 'en' : 'es', phon: 'pinyin', answers: true, busy: false, msg: '' };
}
function bwsRange(W){
  if(W.sel[0] === 'L') return { lv: +W.sel[1], dims: [], types: [], n: W.n, name: '' };
  const it = S.a.bbk[+W.sel]; if(!it) return null;
  return { lv: it.lv, dims: it.d || [], types: it.t || [], n: W.n, name: it.name };
}
function bwsFormHtml(){
  const A = S.a, W = S.bws || (S.bws = bwsDefaults());
  let h = '<div class="card" id="bbkWsCard"><h3>' + esc(T('gameBbk')) + '</h3><p class="hint">' + esc(T('printBbk')) + '</p>';
  if(!A.plan.active) return h + '<div class="notice">🔒 ' + esc(T('wsLocked')) + ' <a href="' + DATA.PORTAL_URL + '" target="_blank" rel="noopener">' + esc(T('subscribe')) + '</a></div><div class="row">' + lockBtn(T('wsMake')) + '</div></div>';
  const pills = (act, cur, list) => list.map(x => '<button class="pill sm ' + (String(cur) === String(x[0]) ? 'on' : '') + '" data-act="' + act + '" data-k="' + x[0] + '">' + esc(x[1]) + '</button>').join('');
  const mine = A.bbkReady ? A.bbk : [];
  h += '<div class="field"><label>' + esc(T('bwsRange')) + '</label><select data-sel="bwssel">' +
    [1, 2, 3].map(n => '<option value="L' + n + '" ' + (W.sel === 'L' + n ? 'selected' : '') + '>' + esc(T('bwsLevel', { n })) + '</option>').join('') +
    (mine.length ? '<optgroup label="' + esc(T('bwsMine')) + '">' + mine.map((it, i) => '<option value="' + i + '" ' + (W.sel === String(i) ? 'selected' : '') + '>📐 ' + esc(it.name) + '</option>').join('') + '</optgroup>' : '') +
    '</select>' + (W.sel[0] !== 'L' && mine[+W.sel] ? '<p class="hint">' + esc(bbkSummary(mine[+W.sel])) + '</p>' : '') + '</div>' +
    '<div class="field"><label>' + esc(T('wsCount')) + '</label><div class="row" style="margin-top:0">' + pills('bwsn', W.n, [[5, '5'], [10, '10'], [15, '15'], [20, '20']]) + '</div></div>' +
    '<div class="field"><label>' + esc(T('wsScript')) + '</label><div class="row" style="margin-top:0">' + pills('bwssimp', W.simp ? 1 : 0, [[0, '繁體'], [1, '简体']]) + '</div></div>' +
    '<div class="field"><label>' + esc(T('bwsLang')) + '</label><div class="row" style="margin-top:0">' + pills('bwslang', W.lang, [['es', '中文＋Español'], ['en', '中文＋English'], ['zh', T('bwsOnlyZh')]]) + '</div></div>' +
    '<div class="field"><label>' + esc(T('bwsPhon')) + '</label><div class="row" style="margin-top:0">' + pills('bwsphon', W.phon, [['pinyin', T('bwsPinyin')], ['zhuyin', T('bwsZhuyin')], ['both', T('bwsBoth')], ['off', T('bwsOff')]]) + '</div></div>' +
    '<div class="field"><div class="row" style="margin-top:0"><button class="pill sm chip ' + (W.answers ? 'on' : '') + '" data-act="bwsans">' + (W.answers ? '✓ ' : '') + esc(T('wsAnswersOpt')) + '</button></div></div>' +
    '<div class="row"><button class="pill fill" data-act="bwsmake" ' + (W.busy ? 'disabled' : '') + '>📄 ' + esc(W.busy ? T('loading') : T('wsMake')) + '</button></div>' +
    (W.msg ? '<div class="err">' + esc(W.msg) + '</div>' : '');
  return h + '</div>';
}
async function bwsMake(){
  const W = S.bws; if(!W || !S.a.plan.active || W.busy) return;
  const rg = bwsRange(W); if(!rg) return;
  W.busy = true; W.msg = ''; render();
  let E;
  try{ E = await loadBbk(); }catch(e){ W.busy = false; W.msg = T('bwsLoadFail'); render(); return; }
  W.busy = false;
  const range = { lv: rg.lv, dims: rg.dims, types: rg.types, n: rg.n };
  const qs = E.makeRound(rg.lv, range);
  if(!qs.length){ W.msg = T('bwsNoQ'); render(); return; }
  S.wsKind = 'bbk';
  S.wsSheet = window.BBK_WORKSHEET(E, qs, { range, title: rg.name, simp: W.simp, lang: W.lang, phon: W.phon, answers: W.answers, base: BBK_BASE });
  render(); window.scrollTo(0, 0);
}
// ---- 列印：墨龍飛天詞表學習單 PDF ----
function dwsDefaults(){ const l = I18N.getLang(); return { sel: [], lang: l === 'en' ? 'en' : 'es', simp: l === 'sc', pinyin: true, zhuyin: false, match: true, answers: true, busy: false, msg: '', ok: false }; }
function dwsFormHtml(){
  let h = '<div class="card" id="dragonWsCard"><h3>🐉 ' + esc(T('gameDragon')) + '</h3>';
  if(!DR.ready()) return h + maintBox() + '</div>';
  const A = S.a, W = S.dws || (S.dws = dwsDefaults());
  h += '<p class="hint">' + esc(T('dragonWsHint')) + '</p>';
  if(!A.plan.active) return h + '<div class="notice">🔒 ' + esc(T('wsLocked')) + ' <a href="' + DATA.PORTAL_URL + '" target="_blank" rel="noopener">' + esc(T('subscribe')) + '</a></div><div class="row">' + lockBtn(T('wsMake')) + '</div></div>';
  const pills = (act, cur, list) => list.map(x => '<button class="pill sm ' + (String(cur) === String(x[0]) ? 'on' : '') + '" data-act="' + act + '" data-k="' + x[0] + '">' + esc(x[1]) + '</button>').join('');
  const chipB = (on, label, act) => '<button class="pill sm chip ' + (on ? 'on' : '') + '" data-act="' + act + '">' + (on ? '✓ ' : '') + esc(label) + '</button>';
  h += '<div class="field"><label>' + esc(T('dragonWsThemes')) + '</label><div class="row" style="margin-top:0">' +
    DR.IDS.map(id => chip(W.sel.indexOf(id) >= 0, DR.builtinName(id), 'dwst', id)).join('') + A.dragon.themes.map(t => chip(W.sel.indexOf(t.id) >= 0, '★ ' + t.name, 'dwst', t.id)).join('') + '</div></div>' +
    '<div class="field"><label>' + esc(T('wsScript')) + '</label><div class="row" style="margin-top:0">' + pills('dwssimp', W.simp ? 1 : 0, [[0, '繁體'], [1, '简体']]) + '</div></div>' +
    '<div class="field"><label>' + esc(T('bwsLang')) + '</label><div class="row" style="margin-top:0">' + pills('dwslang', W.lang, [['es', '中文＋Español'], ['en', '中文＋English'], ['zh', T('bwsOnlyZh')]]) + '</div></div>' +
    '<div class="field"><div class="row" style="margin-top:0">' + chipB(W.pinyin, CORRE.tr('pdfPinyin'), 'dwspy') + chipB(W.zhuyin, CORRE.tr('pdfZhuyin'), 'dwszy') + '</div>' +
    '<div class="row">' + (W.lang === 'zh' ? '' : chipB(W.match, T('dragonWsMatch'), 'dwsmatch') + (W.match ? chipB(W.answers, T('wsAnswersOpt'), 'dwsans') : '')) + '</div></div>' +
    '<div class="row"><button class="pill fill" data-act="dwsmake" ' + (!W.sel.length || W.busy ? 'disabled' : '') + '>📄 ' + esc(W.busy ? CORRE.tr('pdfWorking') : CORRE.tr('pdfMake')) + '</button></div>' +
    (W.msg ? '<div class="' + (W.ok ? 'ok' : 'err') + '">' + esc(W.msg) + '</div>' : '');
  return h + '</div>';
}
function bodyHtml(){
  if(S.acct === 'loading' || S.acct === '') return '<p class="hint center">' + esc(T('loading')) + '</p>';
  if(S.acct === 'error') return '<div class="err">' + esc(S.msg) + '</div><div class="row"><button class="pill" data-act="reload">' + esc(T('retry')) + '</button></div>';
  switch(S.route){
    case 'classes': return classesHtml();
    case 'class': return classHtml();
    case 'game': return S.wsSheet ? wsSheetHtml() : gameHtml();
    case 'bank': return bankRouteHtml();
    default: return homeHtml();
  }
}
function render(){
  document.title = T('appTitle');
  let h = headerHtml();
  if(!S.authSeen) h += '<p class="hint center">' + esc(T('loading')) + '</p>';
  else if(!isReal()) h += loginHtml();
  else h += (S.route === 'home' ? '' : navHtml()) + bodyHtml();
  const keep = document.activeElement && document.activeElement.id;
  const vals = {}; app.querySelectorAll('input[type=text]').forEach(i => { if(i.id) vals[i.id] = i.value; });
  CORRE.capture();                                    // 句庫編輯器：記下還沒加入的輸入
  app.innerHTML = h;
  const ce = document.getElementById('correEd');
  if(ce) CORRE.mount(ce, () => goGame('corre', 'content'));
  document.body.classList.toggle('wsmode', !!S.wsSheet);
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
  const c = clsC();
  qrModal(qrCanvas(url), T(GAME_KEY[game]) + ' · ' + (c ? c.data.name : ''), 'qr-' + game + '-' + safeName(c ? c.data.name : '') + '.png', url);
}
function qrModal(cv, title, file, url){
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = '<div class="box"><h3>' + esc(title) + '</h3></div>';
  const box = m.firstChild; box.appendChild(cv);
  box.insertAdjacentHTML('beforeend', '<p class="hint">' + esc(T('qrHint')) + '</p><div class="row" style="justify-content:center"><button class="pill fill sm" data-m="dl">' + esc(T('qrDownload')) + '</button>' +
    '<button class="pill sm" data-m="copy">' + esc(T('copyLink')) + '</button><button class="pill sm" data-m="close">' + esc(T('close')) + '</button></div>');
  m.addEventListener('click', e => {
    const k = e.target.dataset && e.target.dataset.m;
    if(e.target === m || k === 'close') m.remove();
    else if(k === 'dl') cv.toBlob(b => saveBlob(b, file), 'image/png');
    else if(k === 'copy') copyText(url);
  });
  document.body.appendChild(m);
}

// ---- 建議訂閱（沒訂閱的人按到訂閱功能時跳出）----
function needSub(){
  if(document.querySelector('.modal.sub')) return;
  const m = document.createElement('div'); m.className = 'modal sub';
  m.innerHTML = '<div class="box left"><h3>' + esc(T('subTitle')) + '</h3><p class="hint">' + esc(T('subWhy')) + '</p><ul class="sublist">' +
    T('subList').split('\n').map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' +
    '<div class="row" style="justify-content:center"><a class="pill fill" data-m="go" href="' + DATA.PORTAL_URL + '" target="_blank" rel="noopener">' + esc(T('subGo')) + '</a>' +
    '<button class="pill" data-m="close">' + esc(T('subLater')) + '</button></div></div>';
  m.addEventListener('click', e => {
    const k = e.target.dataset && e.target.dataset.m;
    if(e.target === m || k === 'close' || k === 'go') m.remove();
  });
  document.body.appendChild(m);
}
// ---- 意見回饋（存到中心專案 center_feedback，你在 stats 頁「老師管理中心回饋」看）----
function feedbackModal(){
  if(document.querySelector('.modal.fb')) return;
  let type = 'idea', busy = false;
  const m = document.createElement('div'); m.className = 'modal fb';
  const draw = () => {
    m.innerHTML = '<div class="box left"><h3>' + esc(T('fbTitle')) + '</h3><p class="hint">' + esc(T('fbHint')) + '</p>' +
      '<div class="field"><label>' + esc(T('fbType')) + '</label><div class="row" style="margin-top:0">' +
      [['idea', 'fbIdea'], ['bug', 'fbBug'], ['other', 'fbOther']].map(x => '<button class="pill sm ' + (type === x[0] ? 'on' : '') + '" data-t="' + x[0] + '">' + esc(T(x[1])) + '</button>').join('') + '</div></div>' +
      '<div class="field"><label for="fbText">' + esc(T('fbMsg')) + '</label><textarea id="fbText" rows="5" maxlength="1000" placeholder="' + esc(T('fbPh')) + '"></textarea></div>' +
      '<p class="hint">' + esc(T('fbFrom', { email: S.user.email })) + '</p><div class="st" id="fbSt"></div>' +
      '<div class="row" style="justify-content:center"><button class="pill fill" data-m="send">' + esc(T('fbSend')) + '</button><button class="pill" data-m="close">' + esc(T('close')) + '</button></div></div>';
  };
  draw();
  m.addEventListener('click', async e => {
    const t = e.target.closest('[data-t]');
    if(t){ const txt = m.querySelector('#fbText').value; type = t.dataset.t; draw(); m.querySelector('#fbText').value = txt; return; }
    const k = e.target.dataset && e.target.dataset.m;
    if(e.target === m || k === 'close'){ if(!busy) m.remove(); return; }
    if(k !== 'send' || busy) return;
    const msg = m.querySelector('#fbText').value.trim(), st = m.querySelector('#fbSt');
    if(!msg){ st.className = 'st err'; st.textContent = T('fbNeed'); return; }
    busy = true; e.target.disabled = true; st.className = 'st'; st.textContent = T('fbSending');
    try{
      await DATA.sendFeedback({ type, message: msg.slice(0, 1000), lang: I18N.getLang(), page: (location.hash || '#/home').slice(0, 40) });
      m.remove(); toast(T('fbThanks'));
    }catch(err2){ console.error(err2); busy = false; e.target.disabled = false; st.className = 'st err'; st.textContent = err(err2); }
  });
  document.body.appendChild(m);
  setTimeout(() => { const ta = m.querySelector('#fbText'); if(ta) ta.focus(); }, 0);
}
window.PROF = { needSub };

// ---- 操作 ----
// 成績冊裡換畫面（點學生、返回）：停在「成績」這一段的開頭，不跳回頁面最上面
function toBook(){ const b = document.getElementById('bookCard'); if(b) b.scrollIntoView({ block: 'start' }); }
function toggleIn(arr, k){ const i = arr.indexOf(k); if(i < 0) arr.push(k); else arr.splice(i, 1); }
async function run(fn){
  if(S.busy) return; S.busy = true;
  try{ await fn(); }catch(e){ console.error(e); S.msg = err(e); render(); }
  S.busy = false;
}
const actions = {
  lang(el){ I18N.setLang(el.dataset.l); render(); },
  jump(el){ const t = document.getElementById(el.dataset.k); if(t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  needsub(){ needSub(); },
  feedback(){ feedbackModal(); },
  async login(){ S.msg = ''; try{ await DATA.login(); }catch(e){ console.error(e); S.msg = err(e); render(); } },
  async logout(){ await DATA.logout(); },
  nav(el){ go(el.dataset.r); },
  togame(el){ if(el.dataset.slot != null && el.dataset.slot !== '') setCls(el.dataset.slot); goGame(el.dataset.g, el.dataset.t || 'content'); },
  gtab(el){ goGame(S.g, el.dataset.t); },
  pickcls(el){ setCls(el.dataset.slot); S.days = 0; S.tab = 'stu'; S.sel = null; S.setK = ''; S.dragonSel = ''; S.colCfg = ''; S.bbkSel = ''; if(S.gt === 'scores') return loadBook(); render(); },
  reload(){ return loadAccount(); },
  openclass(el){ go('class', el.dataset.slot); },
  newclass(){ S.msg = ''; go('classes', 'new'); },
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
  pubqr(el){
    const o = srcObj(S.pubSrc, S.pubLv), title = S.pubSrc.slice(0, 2) === 'P:' ? ((S.packs || []).map(p => p.id === S.pubSrc.slice(2) ? packLabel(p) : '').join('') || S.pubSrc.slice(2)) + (o.level ? ' ' + o.level : '') : T('srcLevel', { l: o.level });
    qrModal(qrCanvas(el.dataset.url), T('gameCorre') + ' · ' + title, 'corre-qr-' + safeName(title) + '.png', el.dataset.url);
  },
  // ---- 跑吧句庫 ----
  bankedit(el){ S.bankMsg = ''; go('bank', el.dataset.k); },
  async bankpractice(el){ const b = CORRE.bankOf(S.a, +el.dataset.k); if(b) await copyText(DATA.linkCorrePractice(b.sid)); },
  async bankqr(el){
    const b = CORRE.bankOf(S.a, +el.dataset.k); if(!b) return;
    const title = CORRE.bankName(b);
    try{ await document.fonts.load('900 40px "Noto Sans TC"', title + '跑吧！漢字每天一分鐘'); }catch(e){}
    qrModal(CORRE.qrCanvas(DATA.linkCorrePractice(b.sid), title), T('gameCorre') + ' · ' + title, 'corre-qr-' + safeName(title) + '.png', DATA.linkCorrePractice(b.sid));
  },
  bankdel(el){ return run(async () => {
    const i = +el.dataset.k, b = CORRE.bankOf(S.a, i); if(!b || !confirm(CORRE.tr('delConfirm', { name: CORRE.bankName(b) }))) return;
    try{ await CORRE.remove(S.a, i); S.bankMsg = ''; if(S.cws && S.cws.bank === String(i)) S.cws.bank = ''; }
    catch(e){ console.error(e); S.bankMsg = CORRE.tr('delFail', { m: err(e) }); }
    render();
  }); },
  // ---- 跑吧學習單 ----
  cwslang(el){ S.cws.lang = el.dataset.k; S.cws.msg = ''; render(); },
  cwspy(){ S.cws.pinyin = !S.cws.pinyin; S.cws.msg = ''; render(); },
  cwszy(){ S.cws.zhuyin = !S.cws.zhuyin; S.cws.msg = ''; render(); },
  cwsorder(){ S.cws.order = !S.cws.order; S.cws.msg = ''; render(); },
  async cwsmake(){
    const W = S.cws, b = W && W.bank !== '' && CORRE.bankOf(S.a, +W.bank); if(!b || W.busy || !S.a.plan.active) return;
    W.busy = true; W.msg = ''; render();
    try{
      const r = await CORRE.makeWorksheet(b.data, { lang: W.lang, pinyin: W.pinyin, zhuyin: W.zhuyin, order: W.order });
      saveBlob(r.blob, 'worksheet-' + safeName(CORRE.bankName(b)) + '.pdf');
      W.msg = CORRE.tr('pdfDone', { n: r.pages }); W.ok = true;
    }catch(e){ console.error(e); W.msg = (e && e.message) || String(e); W.ok = false; }
    W.busy = false; render();
  },
  // ---- 比比看範圍 ----
  bbknew(){ S.bbkEdit = { i: -1, dr: BBK.draftFrom(null) }; S.bbkMsg = ''; render(); const el = document.getElementById('bbkName'); if(el) el.focus(); },
  bbkedit(el){ S.bbkEdit = { i: +el.dataset.k, dr: BBK.draftFrom(S.a.bbk[+el.dataset.k]) }; S.bbkMsg = ''; render(); },
  bbkcancel(){ S.bbkEdit = null; S.bbkMsg = ''; S.bbkThNote = false; render(); },
  bbkth(el){ S.bbkEdit.dr.th = el.dataset.k; S.bbkThNote = false; render(); },
  bbkthsoon(){ S.bbkThNote = true; render(); },
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
      S.bbkEdit = null; S.bbkMsg = ''; S.bbkThNote = false; render(); toast(T('saved'));
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
  colcadd(){ if(!S.a.plan.active){ needSub(); return; } const dr = S.colEdit.dr; if(dr.custom.length >= 12) return; dr.custom.push({ n: '', s: '', h: '#43a047' }); render(); },
  colcdel(el){ S.colEdit.dr.custom.splice(+el.dataset.k, 1); render(); },
  colsay(el){ const c = S.colEdit.dr.custom[+el.dataset.k], t = ((c && (c.s || c.n)) || '').trim(); if(!t || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'zh-TW'; u.rate = 0.85; speechSynthesis.speak(u); },
  colnmode(el){ if(el.dataset.k === 'list' && !S.a.plan.active){ needSub(); return; } S.colEdit.dr.nmode = el.dataset.k; render(); },
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
    S.wsKind = 'colores';
    S.wsSheet = COL.worksheet(c, opts, COL.makeBoard(c), k => I18N.D[k]);
    render(); window.scrollTo(0, 0);
  },
  wsback(){ S.wsSheet = null; S.wsKind = ''; render(); },
  bwsn(el){ S.bws.n = +el.dataset.k; render(); },
  bwssimp(el){ S.bws.simp = el.dataset.k === '1'; render(); },
  bwslang(el){ S.bws.lang = el.dataset.k; render(); },
  bwsphon(el){ S.bws.phon = el.dataset.k; render(); },
  bwsans(){ S.bws.answers = !S.bws.answers; render(); },
  bwsmake(){ return bwsMake(); },
  wsprint(){ window.print(); },
  colmake(){ return run(async () => {
    try{
      const r = await DATA.ensureColoresSid(S.a.configs, +S.colCfg); S.a.configs = r.items; S.msg = '';
    }catch(e){ console.error(e); S.msg = T('configFail', { m: err(e) }); }
    render();
  }); },
  // ---- 墨龍：快速連結、自訂主題、範圍、學習單 ----
  dqk(el){ toggleIn(S.dragonQuick, el.dataset.k); render(); },
  dragonqr(el){ qrModal(qrCanvas(el.dataset.url), T('gameDragon'), 'dragon-qr.png', el.dataset.url); },
  dgnew(){ if(S.a.dragon.themes.length >= DR.MAX_T) return; S.dragonEdit = { i: -1, dr: DR.draftFrom(null) }; S.dragonMsg = ''; render(); const el = document.getElementById('dgName'); if(el) el.focus(); },
  dgedit(el){ const t = S.a.dragon.themes[+el.dataset.k]; S.dragonEdit = { i: +el.dataset.k, dr: DR.draftFrom(t) }; S.dragonMsg = ''; render(); },
  dgcancel(){ S.dragonEdit = null; S.dragonMsg = ''; render(); },
  dgrowdel(el){ const dr = S.dragonEdit.dr; dr.rows.splice(+el.dataset.k, 1); dr.text = dr.rows.map(r => [r.t, r.es, r.en].join('，').replace(/[，]+$/, '')).join('\n'); render(); },
  dggen(){ return run(async () => {
    const dr = S.dragonEdit && S.dragonEdit.dr; if(!dr) return;
    S.dragonMsg = T('dragonGenerating'); render();
    let r;
    try{ r = await DR.generate(dr); }catch(e){ console.error(e); r = { err: T('dragonGenFail') }; }
    if(r.err){ S.dragonMsg = r.err; render(); return; }
    dr.rows = r.rows; S.dragonMsg = ''; render();
  }); },
  dgsave(){ return run(async () => {
    const E = S.dragonEdit; if(!E) return;
    const bad = DR.draftValid(E.dr); if(bad){ S.dragonMsg = bad; render(); return; }
    if(E.i < 0 && S.a.dragon.themes.length >= DR.MAX_T){ S.dragonMsg = T('dragonThemeFull'); render(); return; }
    try{ S.a.dragon = await DATA.saveDragonTheme(S.a.dragon, E.i, DR.toTheme(E.dr)); S.dragonEdit = null; S.dragonMsg = ''; render(); toast(T('saved')); }
    catch(e){ console.error(e); S.dragonMsg = err(e); render(); }
  }); },
  dgdel(el){ return run(async () => {
    const i = +el.dataset.k, t = S.a.dragon.themes[i]; if(!t || !confirm(T('dragonConfirmDelTheme', { name: t.name }))) return;
    try{ S.a.dragon = await DATA.deleteDragonTheme(S.a.dragon, i); S.dragonMsg = ''; if(S.dws) S.dws.sel = S.dws.sel.filter(id => id !== t.id); }
    catch(e){ console.error(e); S.dragonMsg = err(e); }
    render();
  }); },
  dsnew(){ S.dragonSetEdit = { i: -1, dr: { name: '', builtin: [], custom: [] } }; S.dragonMsg = ''; render(); const el = document.getElementById('dsName'); if(el) el.focus(); },
  dsedit(el){ const it = S.a.dragon.sets[+el.dataset.k]; S.dragonSetEdit = { i: +el.dataset.k, dr: { name: it.name, builtin: it.builtin.slice(), custom: it.custom.slice() } }; S.dragonMsg = ''; render(); },
  dscancel(){ S.dragonSetEdit = null; S.dragonMsg = ''; render(); },
  dsb(el){ toggleIn(S.dragonSetEdit.dr.builtin, el.dataset.k); render(); },
  dsc(el){ toggleIn(S.dragonSetEdit.dr.custom, el.dataset.k); render(); },
  dssave(){ return run(async () => {
    const E = S.dragonSetEdit; if(!E) return;
    if(!E.dr.builtin.length && !E.dr.custom.length){ S.dragonMsg = T('dragonSetNeedPick'); render(); return; }
    if(E.i < 0 && S.a.dragon.sets.length >= DR.MAX_SETS){ S.dragonMsg = T('bbkFullPro'); render(); return; }
    const name = (E.dr.name || '').trim() || T('dragonSetDefault', { n: E.i < 0 ? S.a.dragon.sets.length + 1 : E.i + 1 });
    const order = DR.IDS.filter(id => E.dr.builtin.indexOf(id) >= 0);
    try{ S.a.dragon = await DATA.saveDragonSet(S.a.dragon, E.i, { name: name.slice(0, 40), builtin: order, custom: E.dr.custom.slice() }); S.dragonSetEdit = null; S.dragonMsg = ''; render(); toast(T('saved')); }
    catch(e){ console.error(e); S.dragonMsg = err(e); render(); }
  }); },
  dsdel(el){ return run(async () => {
    const i = +el.dataset.k, it = S.a.dragon.sets[i]; if(!it || !confirm(T('dragonConfirmDelSet', { name: it.name }))) return;
    try{ S.a.dragon = await DATA.deleteDragonSet(S.a.dragon, i); S.dragonMsg = ''; S.dragonSel = ''; }
    catch(e){ console.error(e); S.dragonMsg = err(e); }
    render();
  }); },
  dspractice(el){ return run(async () => {
    const i = +el.dataset.k;
    try{ S.a.dragon = await DATA.ensureDragonSid(S.a.dragon, i); S.dragonMsg = ''; render(); await copyText(DATA.linkDragonSet(S.a.dragon.sets[i].sid)); }
    catch(e){ console.error(e); S.dragonMsg = T('configFail', { m: err(e) }); render(); }
  }); },
  dragonmake(){ return run(async () => {
    try{ S.a.dragon = await DATA.ensureDragonSid(S.a.dragon, +S.dragonSel); S.msg = ''; }
    catch(e){ console.error(e); S.msg = T('configFail', { m: err(e) }); }
    render();
  }); },
  dwst(el){ toggleIn(S.dws.sel, el.dataset.k); S.dws.msg = ''; render(); },
  dwssimp(el){ S.dws.simp = el.dataset.k === '1'; render(); },
  dwslang(el){ S.dws.lang = el.dataset.k; render(); },
  dwspy(){ S.dws.pinyin = !S.dws.pinyin; render(); },
  dwszy(){ S.dws.zhuyin = !S.dws.zhuyin; render(); },
  dwsmatch(){ S.dws.match = !S.dws.match; render(); },
  dwsans(){ S.dws.answers = !S.dws.answers; render(); },
  async dwsmake(){
    const W = S.dws; if(!W || W.busy || !W.sel.length || !S.a.plan.active || !DR.ready()) return;
    W.busy = true; W.msg = ''; render();
    try{
      let built = null;
      if(W.sel.some(id => DR.IDS.indexOf(id) >= 0)){
        try{ built = await DR.loadBuiltin(); }catch(e){ console.error(e); throw new Error(T('dragonLibFail')); }
      }
      const themes = W.sel.map(id => {
        if(DR.IDS.indexOf(id) >= 0){ const b = (built || []).find(x => x.id === id); return b ? { name: DR.builtinName(id), words: b.words } : null; }
        const t = S.a.dragon.themes.find(x => x.id === id); return t ? { name: t.name, words: t.words } : null;
      }).filter(Boolean);
      if(!themes.length) throw new Error(T('dragonLibFail'));
      const r = await DR.makeWorksheet(themes, { lang: W.lang, simp: W.simp, pinyin: W.pinyin, zhuyin: W.zhuyin, match: W.match, answers: W.answers, count: 10 });
      saveBlob(r.blob, 'dragon-worksheet.pdf');
      W.msg = CORRE.tr('pdfDone', { n: r.pages }); W.ok = true;
    }catch(e){ console.error(e); W.msg = (e && e.message) || String(e); W.ok = false; }
    W.busy = false; render();
  },
  game(el){ S.game = el.dataset.g; S.sel = null; S.setK = ''; render(); },
  days(el){ S.days = +el.dataset.d; render(); },
  tab(el){ S.tab = el.dataset.tab; render(); },
  stu(el){ S.sel = el.dataset.h; render(); toBook(); },
  stuback(){ S.sel = null; render(); toBook(); },
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
    const c = clsC(), g = S.game, lab = k => setLabel(g, k);
    const sk = curSetK(BOOKS.setKeys(g, g === 'bbk' ? S.plays : S.scores));
    const rows = g === 'bbk' ? BOOKS.csvBbk(sk ? S.plays.filter(r => BOOKS.setKeyOf('bbk', r) === sk) : S.plays, S.days, lab) : BOOKS.csvScores(g, S.scores, S.days, sk, lab);
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
  { const m = /^(corre|pub)(src|lv)$/.exec(s.dataset.sel || '');
    if(m){
      const key = m[1] === 'corre' ? ['correSrc', 'correLv'] : ['pubSrc', 'pubLv'];
      if(m[2] === 'src'){
        if(srcLocked(s.value)) needSub();                      // 免費版選到 B1／題包：跳建議訂閱，選項維持原樣
        else{ S[key[0]] = s.value; if(s.value.slice(0, 2) !== 'P:') S[key[1]] = ''; }
      }else{
        if(!S.a.plan.active && !PUB.isFreeLevel(s.value) && s.value) needSub(); else S[key[1]] = s.value;
      }
    } }
  if(s.dataset.sel === 'colcfg') S.colCfg = s.value;
  if(s.dataset.sel === 'bbksel'){ S.bbkSel = s.value; S.msg = ''; }
  if(s.dataset.sel === 'dragonsel'){ S.dragonSel = s.value; S.msg = ''; }
  if(s.dataset.sel === 'setk'){ S.setK = s.value; S.sel = null; }
  if(s.dataset.sel === 'wscfg') S.ws.cfg = s.value;
  if(s.dataset.sel === 'bwssel'){
    S.bws.sel = s.value; S.bws.msg = '';
    const it = s.value[0] !== 'L' && S.a.bbk[+s.value]; if(it && it.n) S.bws.n = [5, 10, 15, 20].indexOf(it.n) >= 0 ? it.n : S.bws.n;   // 題數預設跟範圍一樣
  }
  if(s.dataset.sel === 'cwsbank'){
    S.cws.bank = s.value; S.cws.msg = '';
    const b = s.value !== '' && CORRE.bankOf(S.a, +s.value), ph = (b && b.data && b.data.phonetic) || 'pinyin';
    S.cws.pinyin = ph !== 'zhuyin'; S.cws.zhuyin = ph === 'zhuyin' || ph === 'both';   // 預設跟句庫的拼音／注音設定一樣
  }
  render();
});
document.addEventListener('input', e => {
  if(e.target.id === 'bbkName' && S.bbkEdit) S.bbkEdit.dr.name = e.target.value;
  if(S.dragonEdit){
    const dr = S.dragonEdit.dr;
    if(e.target.id === 'dgName') dr.name = e.target.value;
    if(e.target.id === 'dgText') dr.text = e.target.value;
    if(e.target.dataset && e.target.dataset.dgr != null && dr.rows && dr.rows[+e.target.dataset.dgr]) dr.rows[+e.target.dataset.dgr][e.target.dataset.f] = e.target.value;
  }
  if(e.target.id === 'dsName' && S.dragonSetEdit) S.dragonSetEdit.dr.name = e.target.value;
  if(S.colEdit){
    if(e.target.id === 'colName') S.colEdit.dr.name = e.target.value;
    if(e.target.id === 'colList') S.colEdit.dr.list = e.target.value;
    if(e.target.dataset && e.target.dataset.cc != null){ const c = S.colEdit.dr.custom[+e.target.dataset.cc]; if(c) c[e.target.dataset.f] = e.target.value; }
  }
});
// 自訂顏色：打完名稱（離開欄位）就自動帶出台灣讀音拼音；老師改過的拼音不會被蓋掉
document.addEventListener('change', async e => {
  const d = e.target.dataset;
  if(!S.colEdit || !d || d.cc == null || d.f !== 'n') return;
  const c = S.colEdit.dr.custom[+d.cc]; if(!c) return;
  const name = String(c.n || '').trim();
  if(c.p && c.p !== c._autoP) return;
  let py = '';
  try{ py = name ? await window.CORRE.pinyinOf(name) : ''; }catch(err){ return; }
  if(String(c.n || '').trim() !== name) return;   // 等待時名稱又被改了
  c.p = py; c._autoP = py;
  const inp = document.querySelector('input[data-cc="' + d.cc + '"][data-f="p"]'); if(inp) inp.value = py;
});
window.addEventListener('hashchange', onRoute);

// ---- 啟動 ----
render();
let r0 = parseHash();
if(r0.redirect){ location.replace(r0.redirect); r0 = parseHash(); }
S.route = r0.route; S.cur = r0.cur;
if(r0.route === 'game'){ S.g = r0.g; S.gt = r0.gt; S.game = r0.g; }
try{
  DATA.onUser(u => {
    S.user = u; S.authSeen = true;
    if(DATA.isRealUser(u)){ loadAccount(); }
    else{ S.acct = ''; S.a = null; render(); }
  });
}catch(e){ console.error(e); S.authSeen = true; S.msg = err(e); render(); }
window.__profesor = { S, go };
})();
