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
  bbk: 'https://wangchiapin.github.io/compara-y-adivina/'
};
const TEACHER_URL = { corre: GAME_URL.corre + 'teacher/', colores: GAME_URL.colores, bbk: GAME_URL.bbk };
const MAX_CLASSES = 3;
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
  const acct = { plan, cslots: {}, classes: {}, clsReady: true, banks: [], configs: [], extrasReady: true, bbk: [], bbkReady: true };
  try{
    const ix = await db.collection('teacher_classes').doc(user.uid).get();
    acct.cslots = ix.exists ? (ix.data().slots || {}) : {};
    await Promise.all(Object.keys(acct.cslots).map(async k => {
      try{ const s = await db.collection('classes').doc(acct.cslots[k]).get(); if(s.exists) acct.classes[k] = { cid: s.id, data: s.data() }; }
      catch(e){ console.warn('class read failed', k, e); }
    }));
  }catch(e){ console.warn('classes unavailable', e); acct.clsReady = false; }
  // 用量與連結來源：失敗不影響其他功能
  try{
    const bx = await db.collection('teacher_banks').doc(user.uid).get();
    const slots = bx.exists ? (bx.data().slots || {}) : {};
    await Promise.all(Object.keys(slots).sort().map(async k => {
      try{ const s = await db.collection('shared_banks').doc(slots[k]).get(); if(s.exists) acct.banks.push({ slot: +k, sid: s.id, name: s.data().name || '' }); }
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
// 刪班：先刪三款遊戲的成績（class_scores＝跑吧／色數、class_plays＝比比看），最後才刪班級本身
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
// bbk_sets/{uid} = { items:[{id, name, lv, d, t, n, sid?}], updatedAt }   d／t 空陣列 = 全部
// shared_bbk/{sid} = { owner, name, th, lv, d, t, n, updatedAt }          學生連結 ?r=<sid> 讀這份（任何人可讀）
// 有連結碼（sid）的設定一改，shared_bbk 跟著改，已發出去的連結就會用新的範圍。
const BBK_FREE = 3, BBK_PRO = 15;
const bbkMax = plan => plan && plan.active ? BBK_PRO : BBK_FREE;
function validBbk(x){ return x && typeof x.id === 'string' && [1, 2, 3].indexOf(x.lv) >= 0 && Array.isArray(x.d) && Array.isArray(x.t) && typeof x.n === 'number'; }
const bbkItem = x => { const o = { id: x.id, name: x.name, lv: x.lv, d: x.d.slice(), t: x.t.slice(), n: x.n }; if(x.sid) o.sid = x.sid; return o; };
const bbkShared = x => ({ owner: uid(), name: x.name, th: 'people', lv: x.lv, d: x.d.slice(), t: x.t.slice(), n: x.n, updatedAt: serverTs() });
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

// ---- 學生連結 ----
function linkCorre(cid, bankSid){ return GAME_URL.corre + '?class=' + cid + (bankSid ? '&bank=' + bankSid : ''); }
function linkColores(cid, sid){ return GAME_URL.colores + '?c=' + sid + '&class=' + cid; }
function linkBbk(cid, sid){ return GAME_URL.bbk + '?' + (sid ? 'r=' + sid + '&' : '') + 'class=' + cid; }
function linkBbkPractice(sid){ return GAME_URL.bbk + '?r=' + sid; }

function explain(e, t){
  const c = e && e.code;
  if(c === 'permission-denied') return t('permDenied');
  if(c === 'unavailable' || c === 'network-request-failed') return t('network');
  return (e && e.message) || String(e);
}

window.DATA = { init, onUser, login, logout, loadAccount, createClass, saveClass, deleteClass, loadScores, loadPlays, deleteDocs,
  ensureColoresSid, saveColoresCfg, deleteColoresCfg, coloresLinkOff, linkColoresPractice, coloresMax, saveBbkSet, deleteBbkSet, ensureBbkSid, bbkMax, linkCorre, linkColores, linkBbk, linkBbkPractice, explain, isRealUser, MAX_CLASSES, PORTAL_URL, GAME_URL, TEACHER_URL, tsMs };
})();
