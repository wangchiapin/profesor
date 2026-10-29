// 把／被 兩個遊戲的「班級模式」測試（遊戲網頁在旁邊的 practica-de-ba-oracion、practica-de-bei-oracion；Firebase 用假的）。
// 用法：node tests/test_babei_games.js
let chromium; try{ ({ chromium } = require('playwright')); }catch(e){ ({ chromium } = require('/opt/npm-tools/node_modules/playwright')); }
const fs = require('fs'), path = require('path'), http = require('http');
const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
function ok(c, name, extra){ if(c){ pass++; console.log('  ✓', name); } else { fail++; console.log('  ✗', name, extra !== undefined ? '→ ' + JSON.stringify(extra).slice(0, 300) : ''); } }
const DIRS = { ba: process.env.BA_DIR || path.join(ROOT, '..', 'practica-de-ba-oracion'), bei: process.env.BEI_DIR || path.join(ROOT, '..', 'practica-de-bei-oracion') };
const CID = 'class0000aaaa';
const MOCK = `(function(){
  const store = window.__DB = { classes: { ${CID}: { owner: 'u1', slot: 0, name: '週三班', showBoard: true } } };
  const cl = v => JSON.parse(JSON.stringify(v));
  const fs = { collection: c => ({
    doc: id => ({ get: async () => { const d = (store[c] || {})[id]; return { exists: !!d, id, data: () => cl(d) }; },
                  set: async v => { (store[c] = store[c] || {})[id] = cl(v); },
                  update: async v => { Object.assign(store[c][id], cl(v)); } }),
    where: (f, op, v) => ({ limit: () => ({ get: async () => ({ docs: Object.entries(store[c] || {}).filter(([k, d]) => d[f] === v).map(([k, d]) => ({ id: k, data: () => cl(d) })) }) }) }),
    orderBy: () => ({ limit: () => ({ get: async () => ({ docs: Object.values(store[c] || {}).map(d => ({ data: () => cl(d) })) }) }) })
  }) };
  const apps = [];
  window.firebase = {
    apps,
    initializeApp(cfg, name){ const n = name || '[DEFAULT]'; const au = { currentUser: null, signInAnonymously: async function(){ au.currentUser = { uid: 'anon' + n }; return { user: au.currentUser }; } };
      const app = { name: n, options: cfg, auth: () => au, firestore: () => fs }; apps.push(app); return app; },
    auth: () => apps.find(a => a.name === '[DEFAULT]').auth(),
    firestore: Object.assign(() => fs, { FieldValue: { serverTimestamp: () => 'TS' } })
  };
})();`;
function serve(dir){
  return new Promise(res => { const s = http.createServer((req, r) => { let f = path.join(dir, decodeURIComponent(req.url.split('?')[0])); if(fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if(!f.startsWith(dir) || !fs.existsSync(f)){ r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
    s.listen(0, 'localhost', () => res(s)); });
}
async function open(browser, base, q, seedClass = true){
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if(m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.route('**/*', r => { const u = r.request().url(); if(u.startsWith('http://localhost')) return r.continue();
    if(u.includes('gstatic.com/firebasejs')) return r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }); return r.abort(); });
  await page.addInitScript(MOCK);
  if(!seedClass) await page.addInitScript('window.__DB.classes = {};');
  await page.addInitScript(`try{localStorage.setItem('ba_cfg',JSON.stringify({name:'Ana'}))}catch(e){}`);
  await page.goto(base + '/index.html' + q); await page.waitForTimeout(400);
  return { page, errors, ctx };
}
// 第 lv 關：10 題全部第一次就答對（firstOK 計 10），或只答對 nOk 題
const play = (page, lv, nOk = 10) => page.evaluate(([lv, nOk]) => { cfg.name = 'Ana'; ST.lv = lv; beginLevel();
  for(let i = 0; i < 10; i++){ if(i < nOk){ ST.cur.tries = 1; finishQ(true); } else { ST.cur.tries = 2; finishQ(false); } nextQ(); } }, [lv, nOk]);
const text = page => page.$eval('body', e => e.innerText);
const dbOf = (page, c) => page.evaluate(c => window.__DB[c] || {}, c);

(async () => {
  const browser = await chromium.launch();
  for(const g of ['ba', 'bei']){
    const srv = await serve(DIRS[g]); const base = 'http://localhost:' + srv.address().port;
    console.log('\n[' + g + '-A] 沒有 ?class：跟原來一樣（本機＋公開排行榜）');
    { const { page, errors, ctx } = await open(browser, base, '');
      ok(!(await page.$('#clsBar')) && !(await page.$('#clsFatal')), '沒有班級橫幅、沒有擋畫面');
      await play(page, 1); await page.waitForTimeout(300);
      ok(Object.keys(await dbOf(page, g + 'Leaderboard')).length === 1, '公開排行榜寫了一筆');
      ok(Object.keys(await dbOf(page, 'class_scores')).length === 0, '沒有寫班級成績');
      ok(!!(await page.$('button[onclick="openLB()"]')), '有排行榜按鈕');
      ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

    console.log('\n[' + g + '-B] ?class=…（未開放）：維修中');
    { const { page, errors, ctx } = await open(browser, base, '?class=' + CID);
      ok((await text(page)).includes('維修中'), '顯示維修中'); ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

    console.log('\n[' + g + '-C] ?class=…&dev=1：成績回傳老師');
    { const { page, errors, ctx } = await open(browser, base, '?class=' + CID + '&dev=1');
      ok((await page.$eval('#clsBar', e => e.textContent)).includes('成績會回傳給老師'), '班級橫幅');
      await play(page, 1); await page.waitForTimeout(500);
      const cs = await dbOf(page, 'class_scores'), keys = Object.keys(cs);
      ok(keys.length === 1 && new RegExp('^' + CID + '_' + g + '_lv1_[a-f0-9]{16}$').test(keys[0]), '文件名：班級碼_遊戲_lv1_學生碼', keys);
      const d = cs[keys[0]] || {};
      ok(d.cid === CID && d.owner === 'u1' && d.game === g && d.k === 'lv1' && d.nick === 'Ana' && d.plays === 1 && d.best > 0, '欄位正確', d);
      ok(d.extra && d.extra.q === 10 && d.extra.ok === 10 && d.extra.f === 10, 'extra：答對 10 / 10', d.extra);
      ok(Object.keys(d).length <= 10 && Object.keys(d).every(k => ['cid','owner','game','k','h','nick','best','plays','lastAt','extra'].includes(k)), '只有規則允許的欄位', Object.keys(d));
      ok(Object.keys(await dbOf(page, g + 'Leaderboard')).length === 0, '班級模式不寫公開排行榜');
      const t = await text(page);
      ok(t.includes('成績已回傳給老師'), '結果頁：成績已回傳'); ok(t.includes('班級排行榜') && t.includes('Ana'), '結果頁：班級排行榜（老師有開）');
      ok(!(await page.$('button[onclick="openLB()"]')), '結果頁沒有公開排行榜按鈕');
      const best1 = d.best;
      await play(page, 1, 3); await page.waitForTimeout(500);
      const d2 = (await dbOf(page, 'class_scores'))[keys[0]];
      ok(d2.plays === 2 && d2.best === best1, '第二次較低分：次數 2、最高分不變', { plays: d2.plays, best: d2.best, best1 });
      await play(page, 2); await page.waitForTimeout(500);
      ok(Object.keys(await dbOf(page, 'class_scores')).length === 2, '第 2 關另存一筆');
      ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

    console.log('\n[' + g + '-D] 班級碼不存在：連結失效');
    { const { page, errors, ctx } = await open(browser, base, '?class=nope0000nope&dev=1', false);
      ok((await text(page)).includes('連結已失效'), '顯示連結失效'); ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
    srv.close();
  }
  await browser.close();
  console.log('\n通過 ' + pass + '　失敗 ' + fail); process.exit(fail ? 1 : 0);
})();
