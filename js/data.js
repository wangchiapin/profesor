// 資料層：全部連到「中心專案」subscription-48d3c（跟跑吧、色數、比比看同一個）。
// 這裡不做畫面，只管 Firebase：登入、方案、班級、成績。
(function(){
'use strict';
const CENTRAL = {
  apiKey: 'AIzaSyCHZz8Hh7m45bJfZC9aK_f_NvUD-aUeuzU',
  authDomain: 'subscription-48d3c.firebaseapp.com',
  projectId: 'subscription-48d3c',
  storageBucket: 'subscription-48d3c.firebasestorage.app',
  messagingSenderId: '276281656991',
  appId: '1:276281656991:web:de242ba22373816c3044aa'
};
const PORTAL_URL = 'https://wangchiapin.github.io/cadadiaunosminutos-share-zone/';
const GAME_URL = {
  corre: 'https://wangchiapin.github.io/corre/',
  colores: 'https://wangchiapin.github.io/pop-colores-numeros/',
  bbk: 'https://wangchiapin.github.io/compara-y-adivina/',
  dragon: 'https://wangchiapin.github.io/el-dragon-de-tinta/',
  ba: 'https://wangchiapin.github.io/practica-de-ba-oracion/',
  bei: 'https://wangchiapin.github.io/practica-de-bei-oracion/'
};
const TEACHER_URL = { corre: GAME_URL.corre + 'teacher/', colores: GAME_URL.colores, bbk: GAME_URL.bbk, dragon: GAME_URL.dragon, ba: GAME_URL.ba, bei: GAME_URL.bei };
const MAX_CLASSES = 3;
const ADMIN_EMAIL = 'a2224907@gmail.com';   // 管理員（Firestore 規則也是這個信箱）；管理員看得到維修中的遊戲
const PLAN_OK = ['month', 'year', 'trial', 'pro'];
let auth = null, db = null;

const tsMs = v => (v && typeof v.toMillis === 'function') ? v.toMillis() : (typeof v === 'number' ? v : null);
const isRealUser = u => !!(u && !u.isAnonymous && u.email);
const planActive = p => !!p && PLAN_OK.indexOf(p.plan) >= 0 && !!p.expiresAt && p.expiresAt > Date.now();
const serverTs = () => firebase.firestore.FieldValue.serverTimestamp();
function newId(n){
  const a = 'abcdefghijklmnopqrstuvwxyz0123456789', r = new Uint8Array(n || 12);
  (window.crypto || window.msCrypto).getRandomValues(r);
  return Array.from(r, x => a[x % a.length]).join('');
}

function init(){
  if(auth) return { auth, db };
  firebase.initializeApp(CENTRAL);
  auth = firebase.auth(); db = firebase.firestore();
  return { auth, db };
}
function onUser(cb){ init(); auth.onAuthStateChanged(cb); }
async function login(){
  init();
  const provider = new firebase.auth.GoogleAuthProvider();
  try{ await auth.signInWithPopup(provider); }
  catch(e){
    if(e && e.code === 'auth/popup-blocked'){ await auth.signInWithRedirect(provider); return; }
    if(e && (e.code === 'auth/cancelled-popup-request' || e.code === 'auth/popup-closed-by-user')) return;
    throw e;
  }
}
function logout(){ return auth.signOut(); }
const uid = () => auth.currentUser.uid;

// ---- 帳號：會員資料、方案、班級、跑吧句庫、色數設定組 ----
async function loadAccount(user){
  const mref = db.collection('site_members').doc(user.uid);
  const m = await mref.get();
  if(!m.exists) await mref.set({ email: user.email || '', name: user.displayName || '', createdAt: serverTs() });
  const p = await db.collection('site_plans').doc(user.uid).get();
  const d = p.exists ? p.data() : {};
  const plan = { plan: d.plan || 'free', expiresAt: tsMs(d.expiresAt) };
  plan.active = planActive(plan);
  const acct = { admin: !!(user.email === ADMIN_EMAIL && user.emailVerified), maint: {}, plan, cslots: {}, classes: {}, clsReady: true, banks: [], bslots: {}, configs: [], extrasReady: true, bbk: [], bbkReady: true, dragon: { themes: [], sets: [] }, dragonReady: true };
  try{
    const ix = await db.collection('teacher_classes').doc(user.uid).get();
    acct.cslots = ix.exists ? (ix.data().slots || {}) : {};
    await Promise.all(Object.keys(acct.cslots).map(async k => {
      try{ const s = await db.collection('classes').doc(acct.cslots[k]).get(); if(s.exists) acct.classes[k] = { cid: s.id, data: s.data() }; }
      catch(e){ console.warn('class read failed', k, e); }
    }));
  }catch(e){ console.warn('classes unavailable', e); acct.clsReady = false; }
  // 遊戲開關：portalStatus 裡 center-<遊戲代號>，off:true＝維修中、off:false＝開放（在 stats.html「老師管理中心遊戲開關」設定）。
  // 沒有文件時：把、被預設維修中（要 Ben 在後台打開才開放），其他遊戲預設開放；讀不到開關資料時照預設
  ['ba', 'bei'].forEach(g => { acct.maint[g] = true; });
  try{
    const ps = await db.collection('portalStatus').get();
    ps.docs.forEach(d => {
      if(d.id.indexOf('center-') !== 0) return;
      const g = d.id.slice(7), off = d.data().off;
      if(off === true) acct.maint[g] = true; else if(off === false) delete acct.maint[g];
    });
  }catch(e){ console.warn('game switches unavailable', e); }
  // 用量與連結來源：失敗不影響其他功能
  try{
    const bx = await db.collection('teacher_banks').doc(user.uid).get();
    const slots = bx.exists ? (bx.data().slots || {}) : {};
    acct.bslots = slots;
    await Promise.all(Object.keys(slots).sort().map(async k => {
      try{ const s = await db.collection('shared_banks').doc(slots[k]).get(); if(s.exists) acct.banks.push({ slot: +k, sid: s.id, name: s.data().name || '', data: s.data() }); }
      catch(e){ console.warn('bank read failed', k, e); }
    }));
    acct.banks.sort((a, b) => a.slot - b.slot);
  }catch(e){ console.warn('banks unavailable', e); acct.extrasReady = false; }
  try{
    const cx = await db.collection('teacher_configs').doc(user.uid).get();
    acct.configs = cx.exists ? (cx.data().items || []) : [];
  }catch(e){ console.warn('configs unavailable', e); acct.extrasReady = false; }
  try{
    const bx = await db.collection('bbk_sets').doc(user.uid).get();
    acct.bbk = bx.exists ? (bx.data().items || []).filter(validBbk) : [];
  }catch(e){ console.warn('bbk sets unavailable', e); acct.bbkReady = false; }
  try{
    const dx = await db.collection('dragon_sets').doc(user.uid).get();
    if(dx.exists){ const d = dx.data(); acct.dragon = { themes: Array.isArray(d.themes) ? dragonThemesDec(d.themes.filter(validDragonTheme)) : [], sets: Array.isArray(d.sets) ? d.sets.filter(validDragonSet) : [] }; }
  }catch(e){ console.warn('dragon sets unavailable', e); acct.dragonReady = false; }
  return acct;
}

// ---- 班級 ----
async function createClass(slot, name, cslots){
  const ts = serverTs(), cid = newId(12), slots = Object.assign({}, cslots, { [String(slot)]: cid });
  const b = db.batch();
  b.set(db.collection('teacher_classes').doc(uid()), { slots, updatedAt: ts });
  b.set(db.collection('classes').doc(cid), { owner: uid(), slot, name, showBoard: false, updatedAt: ts });
  await b.commit();
}
async function saveClass(cls, patch){
  const data = Object.assign({}, cls.data, patch, { updatedAt: serverTs() });
  await db.collection('classes').doc(cls.cid).set({ owner: data.owner, slot: data.slot, name: data.name, showBoard: !!data.showBoard, updatedAt: data.updatedAt });
}
async function deleteAllOf(coll, cid){
  for(let i = 0; i < 30; i++){
    const snap = await db.collection(coll).where('owner', '==', uid()).where('cid', '==', cid).limit(400).get();
    if(snap.empty) return;
    const b = db.batch(); snap.docs.forEach(d => b.delete(db.collection(coll).doc(d.id))); await b.commit();
  }
}
// 刪班：先刪各遊戲的成績（class_scores＝跑吧／色數、class_plays＝比比看），最後才刪班級本身
async function deleteClass(slot, cls, cslots){
  await deleteAllOf('class_scores', cls.cid);
  await deleteAllOf('class_plays', cls.cid);
  const slots = Object.assign({}, cslots); delete slots[String(slot)];
  const b = db.batch();
  b.delete(db.collection('classes').doc(cls.cid));
  b.set(db.collection('teacher_classes').doc(uid()), { slots, updatedAt: serverTs() });
  await b.commit();
}

// ---- 成績 ----
async function loadScores(cid){
  const snap = await db.collection('class_scores').where('owner', '==', uid()).where('cid', '==', cid).limit(2000).get();
  return snap.docs.map(d => { const x = d.data(); return Object.assign({ id: d.id }, x, { ms: tsMs(x.lastAt) || 0 }); });
}
async function loadPlays(cid){
  const snap = await db.collection('class_plays').where('owner', '==', uid()).where('cid', '==', cid).limit(3000).get();
  return snap.docs.map(d => { const x = d.data(); return Object.assign({ id: d.id }, x, { ms: tsMs(x.at) || 0 }); })
    .filter(r => r.game === 'bbk').sort((a, b) => b.ms - a.ms);
}
async function deleteDocs(coll, ids){
  for(let i = 0; i < ids.length; i += 400){
    const b = db.batch(); ids.slice(i, i + 400).forEach(id => b.delete(db.collection(coll).doc(id))); await b.commit();
  }
}

// ---- 色數：設定組要有「連結碼」才能做班級連結。做法跟色數教師區的「複製連結」完全一樣 ----
async function ensureColoresSid(items, i){
  const it = items[i]; if(!it) return null;
  const c = it.cfg, pro = !!(c.custom || c.nums);
  if(it.sid){
    await db.collection('shared_configs').doc(it.sid).set({ owner: uid(), cfg: c, pro, updatedAt: serverTs() });
    return { sid: it.sid, items };
  }
  const sid = newId(12);
  const next = items.map((x, k) => k === i ? Object.assign({}, x, { sid }) : x);
  await db.collection('shared_configs').doc(sid).set({ owner: uid(), cfg: c, pro, updatedAt: serverTs() });
  await db.collection('teacher_configs').doc(uid()).set({ items: next, updatedAt: serverTs() });
  return { sid, items: next };
}

// ---- 比比看：老師存的範圍設定 ----
// bbk_sets/{uid} = { items:[{id, name, th, lv, d, t, n, sid?}], updatedAt }   d／t 空陣列 = 全部；th = 主題（目前只有 people，步驟 6-4）
// shared_bbk/{sid} = { owner, name, th, lv, d, t, n, updatedAt }          學生連結 ?r=<sid> 讀這份（任何人可讀）
// 有連結碼（sid）的設定一改，shared_bbk 跟著改，已發出去的連結就會用新的範圍。
const BBK_FREE = 3, BBK_PRO = 15;
const bbkMax = plan => plan && plan.active ? BBK_PRO : BBK_FREE;
function validBbk(x){ return x && typeof x.id === 'string' && [1, 2, 3].indexOf(x.lv) >= 0 && Array.isArray(x.d) && Array.isArray(x.t) && typeof x.n === 'number'; }
const bbkItem = x => { const o = { id: x.id, name: x.name, th: x.th || 'people', lv: x.lv, d: x.d.slice(), t: x.t.slice(), n: x.n }; if(x.sid) o.sid = x.sid; return o; };
const bbkShared = x => ({ owner: uid(), name: x.name, th: x.th || 'people', lv: x.lv, d: x.d.slice(), t: x.t.slice(), n: x.n, updatedAt: serverTs() });
async function writeBbkList(items){
  const clean = items.map(bbkItem);
  await db.collection('bbk_sets').doc(uid()).set({ items: clean, updatedAt: serverTs() });
  return clean;
}
// 新增（i < 0）或修改第 i 組
async function saveBbkSet(items, i, set){
  const next = items.slice();
  if(i < 0) next.push(Object.assign({ id: newId(8) }, set));
  else next[i] = Object.assign({}, items[i], set, { id: items[i].id, sid: items[i].sid });
  const it = next[i < 0 ? next.length - 1 : i];
  if(it.sid) await db.collection('shared_bbk').doc(it.sid).set(bbkShared(it));
  return writeBbkList(next);
}
async function deleteBbkSet(items, i){
  const it = items[i]; if(!it) return items;
  if(it.sid){ try{ await db.collection('shared_bbk').doc(it.sid).delete(); }catch(e){ console.warn('shared_bbk delete failed', e); } }
  return writeBbkList(items.filter((_, k) => k !== i));
}
// 確保這組有連結碼；沒有就產生一個
async function ensureBbkSid(items, i){
  const it = items[i]; if(!it) return items;
  if(it.sid) return items;
  const sid = newId(12);
  const next = items.map((x, k) => k === i ? Object.assign({}, x, { sid }) : x);
  await db.collection('shared_bbk').doc(sid).set(bbkShared(next[i]));
  return writeBbkList(next);
}

// ---- 墨龍飛天：自訂主題與練習範圍（訂閱功能）----
// dragon_sets/{uid} = { themes:[{id,name,words:["繁\t簡\t拼音\t西\t英"]}]（每詞一個字串，Tab 隔開；Firestore 不收巢狀陣列）, sets:[{id,name,builtin:[內建主題id],custom:[自訂主題id],sid?}], updatedAt }
// shared_dragon/{sid} = { owner, name, builtin, custom:[{id,name,words}], updatedAt }   學生連結 ?d=<sid> 讀這份（任何人可讀單筆）
// 有連結碼（sid）的範圍，只要範圍或它用到的自訂主題一改，shared_dragon 就跟著改，已發出去的連結用新內容。
const DRAGON_THEMES_MAX = 3, DRAGON_WORDS_MAX = 40, DRAGON_WORDS_MIN = 6, DRAGON_SETS_MAX = 15;
function validDragonTheme(x){ return x && typeof x.id === 'string' && /^c[a-z0-9]{1,31}$/.test(x.id) && typeof x.name === 'string' && Array.isArray(x.words); }
function validDragonSet(x){ return x && typeof x.id === 'string' && typeof x.name === 'string' && Array.isArray(x.builtin) && Array.isArray(x.custom); }
// Firestore 不允許「陣列裡再放陣列」，所以每個詞存成一個字串（五欄用 Tab 隔開）；讀進來再拆回五欄
const dwEnc = w => w.map(x => String(x == null ? '' : x).replace(/[\t\r\n]+/g, ' ')).join('\t');
const dwDec = w => Array.isArray(w) ? w : String(w == null ? '' : w).split('\t');
const dragonThemesEnc = themes => themes.map(t => ({ id: t.id, name: t.name, words: t.words.map(dwEnc) }));
const dragonThemesDec = themes => themes.map(t => Object.assign({}, t, { words: Array.isArray(t.words) ? t.words.map(dwDec) : [] }));
const dragonSetClean = x => { const o = { id: x.id, name: x.name, builtin: x.builtin.slice(), custom: x.custom.slice() }; if(x.sid) o.sid = x.sid; return o; };
const dragonShared = (set, themes) => ({ owner: uid(), name: set.name, builtin: set.builtin.slice(),
  custom: set.custom.map(id => themes.find(t => t.id === id)).filter(Boolean).map(t => ({ id: t.id, name: t.name, words: t.words.map(dwEnc) })), updatedAt: serverTs() });
// 寫入整份（自訂主題＋範圍），再把有連結碼的範圍同步到 shared_dragon
async function writeDragon(themes, sets){
  const cleanSets = sets.map(dragonSetClean);
  await db.collection('dragon_sets').doc(uid()).set({ themes: dragonThemesEnc(themes), sets: cleanSets, updatedAt: serverTs() });
  await Promise.all(cleanSets.filter(x => x.sid).map(x =>
    db.collection('shared_dragon').doc(x.sid).set(dragonShared(x, themes)).catch(e => console.warn('shared_dragon update failed', e))));
  return { themes, sets: cleanSets };
}
async function saveDragonTheme(cur, i, theme){
  const themes = cur.themes.slice();
  if(i < 0) themes.push(Object.assign({ id: 'c' + newId(10) }, theme)); else themes[i] = Object.assign({}, themes[i], theme, { id: themes[i].id });
  return writeDragon(themes, cur.sets);
}
async function deleteDragonTheme(cur, i){
  const t = cur.themes[i]; if(!t) return cur;
  const sets = cur.sets.map(x => Object.assign({}, x, { custom: x.custom.filter(id => id !== t.id) }));
  return writeDragon(cur.themes.filter((_, k) => k !== i), sets);
}
async function saveDragonSet(cur, i, set){
  const sets = cur.sets.slice();
  if(i < 0) sets.push(Object.assign({ id: newId(8) }, set)); else sets[i] = Object.assign({}, cur.sets[i], set, { id: cur.sets[i].id, sid: cur.sets[i].sid });
  return writeDragon(cur.themes, sets);
}
async function deleteDragonSet(cur, i){
  const it = cur.sets[i]; if(!it) return cur;
  if(it.sid){ try{ await db.collection('shared_dragon').doc(it.sid).delete(); }catch(e){ console.warn('shared_dragon delete failed', e); } }
  return writeDragon(cur.themes, cur.sets.filter((_, k) => k !== i));
}
async function ensureDragonSid(cur, i){
  const it = cur.sets[i]; if(!it) return cur;
  if(it.sid) return cur;
  const sid = newId(12);
  const sets = cur.sets.map((x, k) => k === i ? Object.assign({}, x, { sid }) : x);
  await db.collection('shared_dragon').doc(sid).set(dragonShared(sets[i], cur.themes));
  return writeDragon(cur.themes, sets);
}
// 內建主題練習連結（?th=，不用存資料庫）；範圍連結（?d=）；班級連結（?class=，可再帶 &d=）
const linkDragonQuick = ids => GAME_URL.dragon + '?th=' + ids.join('-');
const linkDragonSet = sid => GAME_URL.dragon + '?d=' + sid;
const linkDragon = (cid, sid) => GAME_URL.dragon + '?class=' + cid + (sid ? '&d=' + sid : '');

// ---- 色數：設定組（teacher_configs/{uid}.items[{id,cfg,sid?}]），格式與遊戲教師區完全相同 ----
async function writeColoresList(items){
  const clean = items.map(x => { const o = { id: x.id, cfg: x.cfg }; if(x.sid) o.sid = x.sid; return o; });
  await db.collection('teacher_configs').doc(uid()).set({ items: clean, updatedAt: serverTs() });
  return clean;
}
// 新增（i < 0）或修改第 i 組；有連結碼的一起更新 shared_configs（已發出的連結跟著改）
async function saveColoresCfg(items, i, cfg){
  const next = items.slice();
  if(i < 0) next.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), cfg });
  else next[i] = Object.assign({}, items[i], { cfg });
  const it = next[i < 0 ? next.length - 1 : i];
  const saved = await writeColoresList(next);
  if(it.sid){ try{ await db.collection('shared_configs').doc(it.sid).set({ owner: uid(), cfg, pro: !!(cfg.custom || cfg.nums), updatedAt: serverTs() }); }catch(e){ console.warn('shared_configs update failed', e); } }
  return saved;
}
async function deleteColoresCfg(items, i){
  const it = items[i]; if(!it) return items;
  if(it.sid){ try{ await db.collection('shared_configs').doc(it.sid).delete(); }catch(e){ console.warn('shared_configs delete failed', e); } }
  return writeColoresList(items.filter((_, k) => k !== i));
}
// 停用連結：刪掉 shared_configs，設定組本身留著
async function coloresLinkOff(items, i){
  const it = items[i]; if(!it || !it.sid) return items;
  await db.collection('shared_configs').doc(it.sid).delete();
  return writeColoresList(items.map((x, k) => { if(k !== i) return x; const y = Object.assign({}, x); delete y.sid; return y; }));
}
function linkColoresPractice(sid){ return GAME_URL.colores + '?c=' + sid; }
const coloresMax = plan => plan && plan.active ? 15 : 3;

// ---- 跑吧！漢字：句庫（格式與 corre/teacher/ 完全相同，規則見 game-kit firebase-rules/subscription-48d3c.rules.txt）----
// teacher_banks/{uid} = { slots: { '0'..'4': sid }, updatedAt }
// shared_banks/{sid}  = { owner, slot, name, speed, script, boss, phonetic?, sentences[], pro, updatedAt }
// 連結碼建立後就不換，所以改了句子，已發出去的連結會跟著變。
async function saveCorreBank(bslots, slot, sid, data){
  const ts = serverTs(), b = db.batch();
  let slots = bslots;
  if(!sid){
    sid = newId(14); slots = Object.assign({}, bslots, { [String(slot)]: sid });
    b.set(db.collection('teacher_banks').doc(uid()), { slots, updatedAt: ts });
  }
  b.set(db.collection('shared_banks').doc(sid), Object.assign({}, data, { owner: uid(), slot, updatedAt: ts }));
  await b.commit();
  return { sid, slots };
}
async function deleteCorreBank(bslots, slot, sid){
  const slots = Object.assign({}, bslots); delete slots[String(slot)];
  const b = db.batch();
  b.delete(db.collection('shared_banks').doc(sid));
  b.set(db.collection('teacher_banks').doc(uid()), { slots, updatedAt: serverTs() });
  await b.commit();
  return slots;
}
function linkCorrePractice(sid){ return GAME_URL.corre + '?bank=' + sid; }

// ---- 學生連結 ----
// 跑吧班級連結：o = { bank } 老師句庫｜{ pack, level? } 題包（可再指定等級）｜{ level } 公開句庫某等級（沒給＝A1）
function linkCorre(cid, o){
  o = typeof o === 'string' ? { bank: o } : (o || {});
  const u = GAME_URL.corre + '?class=' + cid;
  if(o.bank) return u + '&bank=' + o.bank;
  if(o.pack) return u + '&pack=' + o.pack + (o.level ? '&level=' + o.level : '');
  return u + '&level=' + (o.level || 'A1');
}
// 公開句庫練習連結（不收成績）：公開頁本來就只有 A1／A2；B1、題包用隱藏參數
function linkCorrePublic(o){
  o = o || {};
  if(o.pack) return GAME_URL.corre + '?pack=' + o.pack + (o.level ? '&level=' + o.level : '');
  return GAME_URL.corre + '?level=' + (o.level || 'A1');
}
function linkColores(cid, sid){ return GAME_URL.colores + '?c=' + sid + '&class=' + cid; }
function linkBbk(cid, sid){ return GAME_URL.bbk + '?' + (sid ? 'r=' + sid + '&' : '') + 'class=' + cid; }
// 把／被：班級連結只帶班級碼（句庫碼要等「自訂句庫」做好才有）；g = 'ba' 或 'bei'
function linkBaBei(g, cid, sid){ return GAME_URL[g] + '?class=' + cid + (sid ? '&bank=' + sid : ''); }
function linkBbkPractice(sid){ return GAME_URL.bbk + '?r=' + sid; }

function explain(e, t){
  const c = e && e.code;
  if(c === 'permission-denied') return t('permDenied');
  if(c === 'unavailable' || c === 'network-request-failed') return t('network');
  return (e && e.message) || String(e);
}

// ---- 意見回饋：老師寫給 Ben（只有管理員讀得到；規則見 game-kit firebase-rules/subscription-48d3c.rules.txt）----
function sendFeedback(f){
  const u = auth.currentUser;
  return db.collection('center_feedback').add({
    uid: u.uid, email: u.email || '', type: f.type, message: f.message, lang: f.lang, page: f.page,
    done: false, createdAt: serverTs()
  });
}

window.DATA = { init, onUser, login, logout, loadAccount, createClass, saveClass, deleteClass, loadScores, loadPlays, deleteDocs, sendFeedback,
  ensureColoresSid, saveColoresCfg, deleteColoresCfg, coloresLinkOff, linkColoresPractice, coloresMax, saveBbkSet, deleteBbkSet, ensureBbkSid, bbkMax, saveDragonTheme, deleteDragonTheme, saveDragonSet, deleteDragonSet, ensureDragonSid, linkDragonQuick, linkDragonSet, linkDragon, DRAGON_THEMES_MAX, DRAGON_WORDS_MAX, DRAGON_WORDS_MIN, DRAGON_SETS_MAX, saveCorreBank, deleteCorreBank, linkCorrePractice, linkCorre, linkCorrePublic, linkColores, linkBbk, linkBbkPractice, linkBaBei, explain, isRealUser, MAX_CLASSES, PORTAL_URL, GAME_URL, TEACHER_URL, tsMs };
})();
