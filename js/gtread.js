// GoodTeacher 多音字規則（跟跑吧的句子管理工具 corre/manager 同一份資料與同一套判斷）。
// 資料檔：https://wangchiapin.github.io/corre/manager/gt-readings.json（GoodTeacher 拼音字體 2026-10-13 版）。
// 把／被「自己寫句子」用它幫每個詞配讀音；讀不到資料就丟錯，不退回別的讀音（讀音一律照 GoodTeacher）。
(function(){
'use strict';
const URL_GT = 'https://wangchiapin.github.io/corre/manager/gt-readings.json';
// GoodTeacher 規則還沒涵蓋的詞，維持原讀音（同句子管理工具）
const GT_EXC = new Set(['東西', '幾乎', '寧可', '動不動', '為', '鑰匙', '當真']);
const HANZI_RE = /[㐀-鿿]/;
let GT = null, readyP = null;
function ready(){
  if(GT) return Promise.resolve();
  if(!readyP) readyP = fetch(URL_GT, { cache: 'no-cache' }).then(r => { if(!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(j => {
    const seg = x => x.startsWith('@GT_') ? (x.slice(4) === 'HANZI' ? (ch => HANZI_RE.test(ch)) : (set => ch => set.includes(ch))(j.k[x.slice(4)] || '')) : (set => ch => set.includes(ch))(x);
    const parse = x => x ? x.split('|').map(seg) : null;
    const rules = {};
    for(const ch in j.r) rules[ch] = j.r[ch].map(([chg, slot, pre, post, hint]) => ({ chg, slot, pre: parse(pre), post: parse(post), hint }));
    GT = { c: j.c, rules };
  }).catch(e => { readyP = null; throw e; });
  return readyP;
}
function match(txt, i, segs, dir){
  if(!segs) return true;
  for(let k = 0; k < segs.length; k++){
    const pos = dir < 0 ? i - (segs.length - k) : i + 1 + k;
    if(pos < 0 || pos >= txt.length || !segs[k](txt[pos])) return false;
  }
  return true;
}
function reading(txt, i){
  const ch = txt[i], rs = GT.c[ch];
  if(!rs) return null;
  for(const r of (GT.rules[ch] || [])){
    if(match(txt, i, r.pre, -1) && match(txt, i, r.post, 1)){
      if(!r.chg) return rs[0];
      return r.slot >= 0 ? rs[r.slot] : (r.hint || rs[0]);
    }
  }
  return rs[0];
}
// trad＝詞陣列、pinyinArr＝各詞原本的拼音；整句逐字用 GoodTeacher 規則校正（句尾補句號，讓「句尾」規則能判斷）
function apply(trad, pinyinArr){
  if(!GT) throw new Error('GT not ready');
  const full = trad.join('') + '。';
  let pos = 0;
  return trad.map((t, j) => {
    const p0 = pinyinArr[j], at = pos; pos += t.length;
    if(GT_EXC.has(t)) return p0;
    const sy = p0.split(' ');
    if(sy.length !== t.length) return p0;
    return sy.map((x, k) => { const g = reading(full, at + k); return (g && g.normalize('NFC') !== x.normalize('NFC')) ? g : x; }).join(' ');
  });
}
window.GTR = { ready, apply };
})();
