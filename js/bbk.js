// 比比看的出題範圍資料（跟遊戲 compara-y-adivina 一致；遊戲改了特徵或題型，這裡也要改）。
// 特徵：themes/people.js 的 dims（key 與第幾關開始出現）；題型：index.html 的 POOL；題數：teacher.js 的 NS。
// 名稱用 i18n 的 d_<特徵>、t_<題型>。
(function(){
'use strict';
const DIM_LV = { height: 1, age: 1, build: 1, hair: 1, eyes: 1, nose: 1, muscle: 2, tex: 2, skin: 2 };
const POOL = { 1: ['decode', 'tf', 'pick', 'more'], 2: ['decode', 'pick', 'whobi', 'biwho', 'fill'], 3: ['chain', 'most', 'whobi', 'biwho', 'pick'] };
const NS = [5, 10, 15, 20];
const dimsOf = lv => Object.keys(DIM_LV).filter(k => DIM_LV[k] <= lv);
const typesOf = lv => POOL[lv].slice();

// 草稿：d／t 是「勾起來的」清單（明確列出）；存檔時全勾 = 空陣列（代表全部，與遊戲相同）
function draftFrom(set){
  const lv = set ? set.lv : 1;
  const d = set && set.d.length ? set.d.filter(k => dimsOf(lv).indexOf(k) >= 0) : dimsOf(lv);
  const t = set && set.t.length ? set.t.filter(k => typesOf(lv).indexOf(k) >= 0) : typesOf(lv);
  return { name: set ? set.name : '', lv, d, t, n: set && NS.indexOf(set.n) >= 0 ? set.n : 10 };
}
function changeLevel(dr, lv){
  const wasAllD = dimsOf(dr.lv).every(k => dr.d.indexOf(k) >= 0), wasAllT = typesOf(dr.lv).every(k => dr.t.indexOf(k) >= 0);
  let d = wasAllD ? dimsOf(lv) : dr.d.filter(k => DIM_LV[k] <= lv);
  let t = wasAllT ? typesOf(lv) : dr.t.filter(k => POOL[lv].indexOf(k) >= 0);
  if(!d.length) d = dimsOf(lv);
  if(!t.length) t = typesOf(lv);
  return Object.assign({}, dr, { lv, d, t });
}
function toSet(dr){
  const d = dimsOf(dr.lv).filter(k => dr.d.indexOf(k) >= 0), t = typesOf(dr.lv).filter(k => dr.t.indexOf(k) >= 0);
  return { name: dr.name, lv: dr.lv, d: d.length === dimsOf(dr.lv).length ? [] : d, t: t.length === typesOf(dr.lv).length ? [] : t, n: dr.n };
}
const valid = dr => dr.d.length > 0 && dr.t.length > 0;

window.BBK = { DIM_LV, POOL, NS, dimsOf, typesOf, draftFrom, changeLevel, toSet, valid };
})();
