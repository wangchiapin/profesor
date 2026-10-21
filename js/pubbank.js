// 公開句庫：讀跑吧！漢字網站上的 bank/A1.json、A2.json、B1.json、packs.json（一個等級一個檔，GitHub Pages 靜態檔）
// A1／A2 免費；B1 和題包要訂閱（只擋入口：連結產生器、挑句子的畫面）。
(function(){
const LEVELS = ['A1', 'A2', 'B1'], FREE_LEVELS = ['A1', 'A2'];
const cache = {};
const base = () => DATA.GAME_URL.corre + 'bank/';
function json(name){
  if(!cache[name]){
    cache[name] = fetch(base() + name + '.json').then(r => { if(!r.ok) throw new Error(name + ' ' + r.status); return r.json(); })
      .catch(e => { delete cache[name]; throw e; });
  }
  return cache[name];
}
const loadLevel = async L => (await json(L)).sentences || [];
const loadPacks = async () => (await json('packs')).packs || [];
function inPack(p, s){
  const r = (p && p.rule) || {};
  if(r.tags) return (s.tags || []).some(t => r.tags.indexOf(t) >= 0);
  if(r.grammar) return r.grammar.some(g => String(s.grammar || '').endsWith(' ' + g));
  return false;
}
// 題包的句子；level 有給就只取該等級
async function packSentences(p, level){
  const lv = level ? [level] : LEVELS;
  const all = await Promise.all(lv.map(loadLevel));
  return [].concat(...all).filter(s => inPack(p, s));
}
const LANG_KEY = { tc: 'zh-TW', sc: 'zh-CN', es: 'es', en: 'en' };
const packName = (p, lang) => (p && p.name && (p.name[LANG_KEY[lang]] || p.name['zh-TW'] || p.name.es)) || (p && p.id) || '';
const isFreeLevel = L => FREE_LEVELS.indexOf(L) >= 0;
window.PUB = { LEVELS, FREE_LEVELS, loadLevel, loadPacks, packSentences, inPack, packName, isFreeLevel };
})();
