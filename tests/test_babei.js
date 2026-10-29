// 把／被（老師管理中心這一側）測試。用法：node tests/test_babei.js [截圖資料夾]
// 需要 opencc-js@1.4.1、pinyin-pro@3.20.0（npm i，或用 CORRE_LIBS 指到 node_modules 所在資料夾）；遊戲網頁在旁邊的 el-dragon-de-tinta 資料夾（DRAGON_DIR 可指定）。
let chromium; try{ ({ chromium } = require('playwright')); }catch(e){ ({ chromium } = require('/opt/npm-tools/node_modules/playwright')); }
const fs = require('fs'), path = require('path'), http = require('http');
const ROOT = path.join(__dirname, '..');
const MOCK = fs.readFileSync(path.join(__dirname, 'firebase-mock.js'), 'utf8');
const SHOT = process.argv[2] || null; if(SHOT) fs.mkdirSync(SHOT, { recursive: true });
let pass = 0, fail = 0;
function ok(c, name, extra){ if(c){ pass++; console.log('  ✓', name); } else { fail++; console.log('  ✗', name, extra !== undefined ? '→ ' + JSON.stringify(extra) : ''); } }
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json' };
const DRAGON_DIR = process.env.DRAGON_DIR || path.join(ROOT, '..', 'el-dragon-de-tinta');
const CORRE_DIR = process.env.CORRE_DIR || path.join(ROOT, '..', 'corre');
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const map = url.startsWith('/el-dragon-de-tinta/') ? [DRAGON_DIR, url.slice('/el-dragon-de-tinta/'.length)] : [ROOT, url];
  let f = path.normalize(path.join(map[0], map[1]));
  if(fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if(!f.startsWith(map[0]) || !fs.existsSync(f)){ res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
const T = 'subscription-48d3c', CID = 'class0000aaaa';
const TEACH = { uid: 'u1', email: 'teacher@example.com', displayName: 'T', isAnonymous: false };
const hx = n => ('0000000000000000' + n.toString(16)).slice(-16);
const day = 86400000;
function seed({ pro = true } = {}){
  const s = { [T]: {
    classes: { [CID]: { owner: 'u1', slot: 0, name: '週三班', showBoard: false, updatedAt: 1 } },
    teacher_classes: { u1: { slots: { '0': CID }, updatedAt: 1 } },
    class_scores: {
      [CID + '_ba_lv1_' + hx(1)]: { cid: CID, owner: 'u1', game: 'ba', k: 'lv1', h: hx(1), nick: 'Ana', best: 90, plays: 3, lastAt: Date.now() - day, extra: { ok: 9, q: 10 } },
      [CID + '_ba_lv2_' + hx(2)]: { cid: CID, owner: 'u1', game: 'ba', k: 'lv2', h: hx(2), nick: 'Beto', best: 60, plays: 1, lastAt: Date.now() - day, extra: { ok: 6, q: 10 } },
      [CID + '_bei_lv1_' + hx(3)]: { cid: CID, owner: 'u1', game: 'bei', k: 'lv1', h: hx(3), nick: 'Cami', best: 80, plays: 2, lastAt: Date.now() - day, extra: { ok: 8, q: 10 } }
    },
    class_plays: {}, site_members: {}, site_plans: {} } };
  if(pro) s[T].site_plans.u1 = { plan: 'year', expiresAt: Date.now() + 30 * day };
  return s;
}
let BASE;
const LIBS = { opencc: '', pinyin: '' };   // 把／被測試用不到轉簡體與拼音
async function open(browser, { seedOpt, q = '', hash = '', lang = 'tc' } = {}){
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if(m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  page.on('dialog', d => d.accept());
  await page.route('**/*', r => {
    const u = r.request().url();
    if(u.startsWith('http://localhost')) return r.continue();
    if(u.includes('gstatic.com/firebasejs')) return r.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
    if(u.includes('cdn.jsdelivr.net/npm/opencc-js')) return r.fulfill({ status: 200, contentType: 'application/javascript', body: LIBS.opencc });
    if(u.includes('cdn.jsdelivr.net/npm/pinyin-pro')) return r.fulfill({ status: 200, contentType: 'application/javascript', body: LIBS.pinyin });
    { const m = u.match(/^https:\/\/wangchiapin\.github\.io\/corre\/bank\/([A-Za-z0-9]+\.json)$/);
      if(m){ const f = path.join(CORRE_DIR, 'bank', m[1]); return fs.existsSync(f) ? r.fulfill({ status: 200, contentType: 'application/json', body: fs.readFileSync(f) }) : r.fulfill({ status: 404, body: '' }); } }
    return r.abort();
  });
  await page.addInitScript(`window.__SEED=${JSON.stringify(seed(seedOpt))};window.__USER=${JSON.stringify(TEACH)};window.__GOOGLE=${JSON.stringify(TEACH)};try{localStorage.setItem('profesorLang','${lang}')}catch(e){}`);
  await page.addInitScript(MOCK);
  await page.goto(BASE + '/index.html' + q + hash);
  await page.waitForSelector('.brand small');
  return { page, errors, ctx };
}
const db = page => page.evaluate(t => window.__DB[t], T);
const text = (page, sel = '#app') => page.$eval(sel, e => e.innerText);
const noOverflow = page => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const go = async (page, hash) => { await page.evaluate(h => { location.hash = h; }, hash); await page.waitForTimeout(250); };
// 字庫編輯器分成「建立字庫」「字詞表」兩個分頁：按「產生」後，要切到「字詞表」分頁才看得到表格
const dgGen = async page => { await page.click('[data-act=dggen]'); await page.click('[data-act=edtab][data-e=dg][data-k=more]'); };
const shot = async (page, name) => { if(SHOT) await page.screenshot({ path: path.join(SHOT, name + '.png'), fullPage: true }); };

server.listen(0, 'localhost', async () => {
  BASE = 'http://localhost:' + server.address().port;
  const browser = await chromium.launch();

  console.log('\n[A] 沒有 ?dev：把／被還沒開放，一般老師看到維修中');
  { const { page, errors, ctx } = await open(browser);
    const t = await text(page);
    ok(t.includes('維修中'), '首頁有維修中標示');
    await go(page, '#/game/ba/links');
    ok((await text(page)).includes('維修中'), '把的連結頁：維修中');
    ok(!(await page.$('#linksCard')), '連結頁沒有班級連結卡');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  console.log('\n[B] ?dev=ba,bei 訂閱老師：入口、連結、成績');
  { const { page, errors, ctx } = await open(browser, { q: '?dev=ba,bei', hash: '#/home' });
    const t = await text(page);
    ok(t.includes('把字句') && t.includes('被字句'), '首頁有把字句、被字句');
    ok(!/undefined|\[object/.test(t), '首頁沒有 undefined');
    for(const g of ['ba', 'bei']){
      await go(page, '#/game/' + g + '/links'); await page.waitForSelector('#pracCard .url');
      const prac = await page.$eval('#pracCard .url', e => e.textContent);
      ok(prac === 'https://wangchiapin.github.io/practica-de-' + g + '-oracion/', g + ' 練習連結', prac);
      await page.waitForSelector('#linksCard .url');
      const cl = await page.$eval('#linksCard .url', e => e.textContent);
      ok(cl === prac + '?class=' + CID, g + ' 班級連結', cl);
      await go(page, '#/game/' + g + '/content'); ok((await text(page)).includes('即將開放'), g + ' 句庫頁：即將開放');
      await go(page, '#/game/' + g + '/sheet'); ok((await text(page)).includes('即將開放'), g + ' 學習單頁：即將開放');
      await go(page, '#/game/' + g + '/help'); ok((await text(page)).length > 20, g + ' 說明頁能開');
    }
    await go(page, '#/game/ba/scores'); await page.waitForSelector('#bookCard table');
    const tb = await text(page, '#bookCard');
    ok(tb.includes('Ana') && tb.includes('Beto') && !tb.includes('Cami'), '把成績只含把的學生');
    ok(tb.includes('答對 9 / 10 題'), '詳細欄：答對 9 / 10 題');
    ok(tb.includes('第 1 關') && tb.includes('第 2 關'), '設定名稱：第 N 關');
    await go(page, '#/game/bei/scores'); await page.waitForSelector('#bookCard table');
    const tb2 = await text(page, '#bookCard');
    ok(tb2.includes('Cami') && !tb2.includes('Ana'), '被成績只含被的學生');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act=csv]')]);
    const csv = fs.readFileSync(await dl.path(), 'utf8');
    ok(csv.includes('Cami,第 1 關,80,2,答對 8 / 10 題') && !csv.includes('Ana'), 'CSV 內容：只有被的學生', csv.slice(0, 160));
    await shot(page, 'bei-scores');
    ok(await noOverflow(page), '沒有橫向捲動'); ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  console.log('\n[C] 免費老師：練習連結可用');
  { const { page, errors, ctx } = await open(browser, { seedOpt: { pro: false }, q: '?dev=ba', hash: '#/game/ba/links' });
    await page.waitForSelector('#pracCard .url');
    ok((await page.$eval('#pracCard .url', e => e.textContent)).includes('practica-de-ba-oracion'), '免費版看得到練習連結');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  await browser.close(); server.close();
  console.log('\n通過 ' + pass + '　失敗 ' + fail); process.exit(fail ? 1 : 0);
});
