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
// 「自己寫句子」要用繁簡轉換與拼音函式庫：測試時從本機讀（npm i opencc-js@1.4.1 pinyin-pro@3.20.0，或用 CORRE_LIBS 指到 node_modules 所在資料夾）
let LIBS = { opencc: '', pinyin: '' };
try{
  const base = process.env.CORRE_LIBS ? [process.env.CORRE_LIBS] : [ROOT, process.cwd()];
  const rq = m => { for(const d of base){ const f = path.join(d, 'node_modules', m); if(fs.existsSync(f)) return f; } throw new Error('not found: ' + m); };
  LIBS = { opencc: fs.readFileSync(rq('opencc-js/dist/umd/full.js'), 'utf8'), pinyin: fs.readFileSync(rq('pinyin-pro/dist/index.js'), 'utf8') };
}catch(e){ console.log('（找不到 opencc-js / pinyin-pro，略過「自己寫句子」的測試）'); }
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
    if(u === 'https://wangchiapin.github.io/corre/manager/gt-readings.json'){ if(global.GT_FAIL) return r.fulfill({ status: 500, body: '' }); const f = path.join(CORRE_DIR, 'manager', 'gt-readings.json'); return fs.existsSync(f) ? r.fulfill({ status: 200, contentType: 'application/json', body: fs.readFileSync(f) }) : r.fulfill({ status: 404, body: '' }); }
    { const m = u.match(/^https:\/\/wangchiapin\.github\.io\/practica-de-(ba|bei)-oracion\/sentences\.json/);
      if(m){ if(global.SENT_FAIL) return r.fulfill({ status: 500, body: '' }); const f = path.join(ROOT, '..', 'practica-de-' + m[1] + '-oracion', 'sentences.json'); return r.fulfill({ status: 200, contentType: 'application/json', body: fs.readFileSync(f) }); } }
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
    ok((await page.$$('.grow.faded')).length === 2, '首頁：把、被的卡片變淡（維修中）');
    await page.click('.grow.faded .pill.fill'); await page.waitForTimeout(200);
    ok((await page.$eval('#toast', e => e.textContent)).includes('維修中'), '點卡片只出現「維修中」');
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
      await go(page, '#/game/' + g + '/content'); ok((await text(page)).includes('自訂句庫') && !(await text(page)).includes('即將開放'), g + ' 句庫頁：自訂句庫（不再是即將開放）');
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


  console.log('\n[D] 自訂句庫：訂閱老師（新增、挑句子、存檔、試玩、班級連結、成績名稱、刪除）');
  { const { page, errors, ctx } = await open(browser, { q: '?dev=ba,bei', hash: '#/game/ba/content' });
    await page.waitForSelector('#babCard');
    let t = await text(page, '#babCard');
    ok(t.includes('自訂句庫') && t.includes('已用 0 / 5'), '標題旁小字：已用 0 / 5', t.slice(0, 60));
    ok(!!(await page.$('[data-act=babedit]')), '有「新增句庫」按鈕');
    await page.click('[data-act=babedit]'); await page.waitForSelector('#babName');
    const tabs = await page.$$eval('.etabs .pill', els => els.map(e => e.textContent.trim()));
    ok(tabs.join('|') === '回上一頁|設定|挑句子|自己寫句子|句庫內的句子', '編輯頁分頁：設定｜挑句子｜自己寫句子｜句庫內的句子', tabs);
    ok((await text(page, '#babCard')).includes('已選 0 句（最少 10 句、最多 80 句）'), '設定頁顯示張數與上限（訂閱 80）');
    await page.fill('#babName', '第三週複習');
    // 先存 3 句 → 不夠 10 句
    await page.click('[data-act=edtab][data-k=pick]'); await page.waitForSelector('.brow');
    ok((await page.$$('#babList .brow')).length === 449, '挑句子：列出把的全部 449 句');
    ok((await text(page, '#babList')).includes('第 1 關'), '每句顯示所屬關卡');
    for(let i = 0; i < 3; i++) await page.click('#babList .brow:nth-child(' + (i + 2) + ')');
    await page.click('[data-act=babsave]');
    ok((await text(page, '#babCard')).includes('至少要 10 句，現在只有 3 句。'), '不到 10 句：存不了，顯示原因');
    ok(!Object.keys((await db(page)).shared_babanks || {}).length, '沒有寫進資料庫');
    // 整關加入 → 超過 80
    await page.click('[data-act=babfilter][data-k="1"]'); await page.click('[data-act=babaddlv]');
    ok((await text(page, '#babCard')).includes('已選 152 句') || (await text(page, '#babCard')).includes('已選 15'), '整關加入：一次加進該關全部句子');
    await page.click('[data-act=babsave]');
    ok((await text(page, '#babCard')).includes('最多 80 句'), '超過 80 句：存不了');
    await page.click('[data-act=babremlv]');
    ok((await text(page, '#babCard')).includes('已選 0 句') , '整關移除', (await text(page, '#babCard')).slice(0, 80));
    // 搜尋 + 逐句勾選
    await page.fill('#babQ', '書'); await page.waitForTimeout(100);
    const shown = (await page.$$('#babList .brow')).length;
    ok(shown > 0 && shown < 449, '搜尋「書」：只剩部分句子', shown);
    ok(await page.evaluate(() => document.activeElement && document.activeElement.id === 'babQ'), '搜尋時輸入框不掉焦點');
    await page.fill('#babQ', ''); await page.click('[data-act=babfilter][data-k="all"]');
    for(let i = 0; i < 12; i++) await page.click('#babList .brow:nth-child(' + (i + 2) + ')');
    await page.click('[data-act=edtab][data-k=list]');
    ok((await page.$$('.brow.static')).length === 12, '「句庫內的句子」分頁：12 句');
    await page.click('[data-act=babrm]'); ok((await page.$$('.brow.static')).length === 11, '可以從句庫內移除一句');
    await page.click('[data-act=edtab][data-k=pick]'); await page.click('#babList .brow:nth-child(14)'); 
    await shot(page, 'ba-editor-pick');
    await page.click('[data-act=babsave]'); await page.waitForSelector('#babCard .setrow');
    const d = await db(page), sid = Object.keys(d.shared_babanks || {})[0];
    ok(!!sid && d.shared_babanks[sid].game === 'ba' && d.shared_babanks[sid].ids.length === 12 && d.shared_babanks[sid].name === '第三週複習' && d.shared_babanks[sid].owner === 'u1', '資料庫 shared_babanks 寫入正確', d.shared_babanks);
    ok(d.teacher_babanks.u1.ba['0'] === sid && !Object.keys(d.teacher_babanks.u1.bei || {}).length, 'teacher_babanks 記下位置，另一個遊戲不受影響', d.teacher_babanks);
    t = await text(page, '#babCard');
    ok(t.includes('第三週複習') && t.includes('12 句') && t.includes('已用 1 / 5'), '清單：名稱、句數、已用 1 / 5', t.slice(0, 80));
    const href = await page.$eval('#babCard .setrow a.pill', e => e.getAttribute('href'));
    ok(href === 'https://wangchiapin.github.io/practica-de-ba-oracion/?bank=' + sid + '&preview=1', '試玩連結：?bank=句庫碼&preview=1', href);
    ok(!!(await page.$('[data-act=babdel]')) && !!(await page.$('[data-act=babedit][data-k="0"]')), '清單有 編輯／試玩／刪除');
    await shot(page, 'ba-bank-list');
    // 編輯：改名、句庫碼不變
    await page.click('[data-act=babedit][data-k="0"]'); await page.waitForSelector('#babName');
    ok((await page.inputValue('#babName')) === '第三週複習', '編輯：帶出名稱');
    await page.fill('#babName', '第三週（改）'); await page.click('[data-act=babsave]'); await page.waitForSelector('#babCard .setrow');
    const d2 = await db(page);
    ok(Object.keys(d2.shared_babanks).length === 1 && d2.shared_babanks[sid].name === '第三週（改）' && d2.shared_babanks[sid].ids.length === 12, '改名後句庫碼不變、句子還在');
    // 被：各自算
    await go(page, '#/game/bei/content'); await page.waitForSelector('#babCard');
    ok((await text(page, '#babCard')).includes('已用 0 / 5') && !(await text(page, '#babCard')).includes('第三週'), '被的句庫另外算（已用 0 / 5）');
    // 班級連結
    await go(page, '#/game/ba/links'); await page.waitForSelector('#linksCard .url');
    ok((await page.$eval('#linksCard .url', e => e.textContent)) === 'https://wangchiapin.github.io/practica-de-ba-oracion/?class=' + CID, '班級連結預設：原本的關卡');
    await page.selectOption('[data-sel=basrc]', sid); await page.waitForTimeout(100);
    ok((await page.$eval('#linksCard .url', e => e.textContent)) === 'https://wangchiapin.github.io/practica-de-ba-oracion/?class=' + CID + '&bank=' + sid, '選句庫後班級連結帶 &bank=');
    await go(page, '#/game/bei/links'); await page.waitForSelector('#linksCard .url');
    ok(!(await page.$('[data-sel=basrc]')), '被沒有句庫時不顯示「題目來源」');
    // 成績冊：句庫碼顯示成名稱
    await page.evaluate(([sid, cid, h]) => { window.__DB['subscription-48d3c'].class_scores[cid + '_ba_' + sid + '_' + h] = { cid, owner: 'u1', game: 'ba', k: sid, h, nick: 'Dina', best: 70, plays: 1, lastAt: Date.now(), extra: { ok: 7, q: 10 } }; }, [sid, CID, hx(9)]);
    await go(page, '#/game/ba/scores'); await page.waitForSelector('#bookCard table');
    ok((await text(page, '#bookCard')).includes('📚 第三週（改）') && (await text(page, '#bookCard')).includes('Dina'), '成績冊：句庫成績顯示「📚 句庫名」');
    // 刪除
    await go(page, '#/game/ba/content'); await page.waitForSelector('#babCard');
    await page.click('[data-act=babdel]'); await page.waitForTimeout(300);
    const d3 = await db(page);
    ok(!Object.keys(d3.shared_babanks || {}).length && !Object.keys(d3.teacher_babanks.u1.ba || {}).length, '刪除：句庫與位置都清掉');
    ok((await text(page, '#babCard')).includes('已用 0 / 5'), '刪除後清單回到已用 0 / 5');
    ok(await noOverflow(page), '沒有橫向捲動'); ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  console.log('\n[E] 自訂句庫：免費老師（各遊戲 1 個、50 句上限）、句子清單讀不到');
  { const { page, errors, ctx } = await open(browser, { seedOpt: { pro: false }, q: '?dev=bei', hash: '#/game/bei/content' });
    await page.waitForSelector('#babCard');
    ok((await text(page, '#babCard')).includes('已用 0 / 1') && (await text(page, '#babCard')).includes('每庫最多 50 句'), '免費版：已用 0 / 1、說明只能試玩');
    await page.click('[data-act=babedit]'); await page.waitForSelector('#babName');
    ok((await text(page, '#babCard')).includes('最多 50 句'), '免費版句數上限 50');
    await page.click('[data-act=edtab][data-k=pick]'); await page.waitForSelector('#babList .brow');
    ok((await page.$$('#babList .brow')).length === 450, '被：列出 450 句');
    await page.click('[data-act=babfilter][data-k="4"]'); ok(!!(await page.$('[data-act=babaddlv]')), '被有第 4 關可以整關加入');
    await page.click('[data-act=babaddlv]');
    for(let i = 0; i < 12; i++) await page.click('#babList .brow:nth-child(' + (i + 2) + ')');   // 取消 12 句，剩 100 句左右
    await page.click('[data-act=babsave]');
    ok((await text(page, '#babCard')).includes('最多 50 句'), '免費版超過 50 句存不了');
    await page.click('[data-act=babaddlv]'); await page.click('[data-act=babremlv]');
    await page.click('[data-act=babfilter][data-k="1"]'); for(let i = 0; i < 10; i++) await page.click('#babList .brow:nth-child(' + (i + 2) + ')');
    await page.click('[data-act=edtab][data-k=set]'); await page.fill('#babName', 'Mi banco');
    await page.click('[data-act=babsave]'); await page.waitForSelector('#babCard .setrow');
    ok(/已用 1 \/ 1/.test(await text(page, '#babCard')), '存好後：已用 1 / 1');
    ok(!(await page.$('[data-act=babedit][data-k]:not([data-k="0"])')) && !!(await page.$('#babCard .lockbtn')), '免費版第二個句庫：鎖住，按了建議訂閱');
    await page.click('#babCard .lockbtn'); await page.waitForSelector('.modal.sub');
    ok(true, '鎖住按鈕跳出建議訂閱視窗'); await page.click('.modal.sub [data-m=close]');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { global.SENT_FAIL = true;
    const { page, errors, ctx } = await open(browser, { q: '?dev=ba', hash: '#/game/ba/content' });
    await page.waitForSelector('#babCard'); await page.click('[data-act=babedit]'); await page.click('[data-act=edtab][data-k=pick]'); await page.waitForSelector('[data-act=babretry]');
    ok((await text(page, '#babCard')).includes('讀不到句子清單'), '句子清單讀不到：顯示說明與「重新載入」');
    global.SENT_FAIL = false; await page.click('[data-act=babretry]'); await page.waitForSelector('#babList .brow');
    ok(true, '按重新載入後可以挑句子'); await ctx.close(); }


  if(LIBS.opencc){
  console.log('\n[F] 自訂句庫：自己寫句子（檢查、GoodTeacher 讀音、改讀音、存檔、再編輯）');
  { const { page, errors, ctx } = await open(browser, { q: '?dev=ba,bei', hash: '#/game/ba/content' });
    await page.waitForSelector('#babCard'); await page.click('[data-act=babedit]'); await page.waitForSelector('#babName');
    await page.click('[data-act=edtab][data-k=write]'); await page.waitForSelector('#babText');
    const tabs = await page.$$eval('.etabs .pill', els => els.map(e => e.textContent.trim()));
    ok(tabs.join('|') === '回上一頁|設定|挑句子|自己寫句子|句庫內的句子', '編輯頁四個分頁（多了「自己寫句子」）', tabs);
    const gen = async txt => { await page.fill('#babText', txt); await page.click('[data-act=babgen]'); await page.waitForTimeout(400); return text(page, '#babCard'); };
    let t = await gen('我 放在 桌子上｜Puse en la mesa.');
    ok(t.includes('第 1 行：句子裡要有「把」'), '沒有「把」：擋住並指出第幾行', t.slice(0, 120));
    t = await gen('我 把 書 放在 桌子上');
    ok(t.includes('第 1 行：要寫西文翻譯'), '沒有西文翻譯：擋住');
    t = await gen('我 把 書 放 在 桌 子 上 好｜x');
    ok(t.includes('最多 8 個詞'), '超過 8 個詞：擋住');
    t = await gen('我 把 一二三四五六七｜x');
    ok(t.includes('每個詞最多 6 個字'), '詞超過 6 個字：擋住');
    t = await gen('我 把 book 放在 桌子上｜x');
    ok(t.includes('只能寫漢字'), '夾英文／標點：擋住');
    t = await gen('一二三四五 把 一二三四五 六七八九十一 一二三四五六 桌子上桌子｜x');
    ok(t.includes('整句最多 25 個字'), '整句超過 25 字：擋住');
    t = await gen('他 把 垃圾 放在 銀行 上面｜Puso la basura.\n我 放在 桌上｜x');
    ok(t.includes('第 2 行：句子裡要有「把」') && !(await page.$('.bcard')), '多行時一行有錯就整批不產生，並指出是第幾行', t.slice(0, 200));
    // 正確的一行
    await gen('他 把 垃圾 放在 銀行 上面｜Puso la basura encima del banco.｜He put the trash on the bank.');
    ok((await page.$$('.bcard')).length === 1, '產生 1 張句子卡');
    const toks = await page.$$eval('.btk', els => els.map(e => [e.querySelector('b').textContent, e.querySelector('input').value, e.querySelector('small').textContent]));
    ok(toks.length === 6 && toks[0][0] === '他' && toks[0][1] === 'tā' && toks[0][2] === 'ㄊㄚ' && toks[1][1] === 'bǎ' && toks[1][2] === 'ㄅㄚˇ', '每個詞有拼音與注音（他 tā ㄊㄚ、把 bǎ ㄅㄚˇ）', toks);
    ok(toks[2][1] === 'lè sè' && toks[2][2] === 'ㄌㄜˋ ㄙㄜˋ', '垃圾＝lè sè（GoodTeacher／台灣讀音）', toks[2]);
    ok(toks[4][1] === 'yín háng', '銀行＝yín háng（多音字照 GoodTeacher 規則）', toks[4]);
    // 改讀音
    await page.fill('input[data-bc="0"][data-bt="2"]', 'lā jī');
    ok((await page.$eval('#bz-0-2', e => e.textContent)) === 'ㄌㄚ ㄐㄧ' && !(await page.$eval('#be-0-2', e => e.hidden)), '改拼音：注音跟著變、出現「已修改」');
    await page.fill('input[data-bc="0"][data-bt="2"]', 'lè sè');
    ok(await page.$eval('#be-0-2', e => e.hidden), '改回原本的拼音：「已修改」標記消失');
    await page.fill('input[data-bc="0"][data-bt="2"]', 'lā jī');
    // 沒有按產生就存檔
    await page.fill('#babText', '他 把 垃圾 放在 銀行 上面｜Puso la basura encima del banco.｜He put the trash on the bank.\n我 把 書 放在 桌子上｜Puse el libro.');
    await page.click('[data-act=babsave]'); t = await text(page, '#babCard');
    ok(t.includes('請先按「產生讀音」'), '改了文字沒按「產生讀音」：不能存');
    // 重新產生：沒改的那一行保留老師改過的讀音
    await page.click('[data-act=babgen]'); await page.waitForTimeout(300);
    ok((await page.$eval('input[data-bc="0"][data-bt="2"]', e => e.value)) === 'lā jī' && (await page.$$('.bcard')).length === 2, '重新產生：沒改的句子保留老師改過的讀音，新增的句子照規則產生');
    // 不到 10 句
    await page.click('[data-act=babsave]');
    ok((await text(page, '#babCard')).includes('至少要 10 句，現在只有 2 句'), '自己寫的句子也算進句數：不到 10 句存不了');
    // 補到 10 句
    const nouns = ['杯子', '包包', '筆', '手機', '鑰匙', '帽子', '外套', '蘋果'];
    const lines = ['他 把 垃圾 放在 銀行 上面｜Puso la basura encima del banco.｜He put the trash on the bank.', '我 把 書 放在 桌子上｜Puse el libro.'].concat(nouns.map((n, i) => '她 把 ' + n + ' 放在 桌子上｜Puso el objeto ' + i + '.'));
    await gen(lines.join('\n'));
    ok((await page.$$('.bcard')).length === 10 && (await text(page, '#babCard')).includes('已選 10 句'), '10 句：計數顯示已選 10 句');
    ok((await page.$eval('input[data-bc="0"][data-bt="2"]', e => e.value)) === 'lā jī', '再次產生仍保留改過的讀音');
    await page.click('[data-act=edtab][data-k=set]'); await page.fill('#babName', '自己寫的');
    await page.click('[data-act=babsave]'); await page.waitForSelector('#babCard .setrow');
    const d = await db(page), b = Object.values(d.shared_babanks)[0];
    ok(b.ids.length === 0 && b.custom.length === 10 && b.name === '自己寫的' && b.game === 'ba', '存檔：shared_babanks 有 custom 10 句', b && b.custom && b.custom.length);
    ok(b.custom[0].tk[2] === '垃圾||lā jī|ㄌㄚ ㄐㄧ' && b.custom[0].tk[0] === '他||tā|ㄊㄚ' && b.custom[1].tk[2] === '書|书|shū|ㄕㄨ', '存的格式同遊戲：繁|簡|拼音|注音（改過的讀音只存在這一句）', b.custom[0].tk);
    ok(b.custom[0].es === 'Puso la basura encima del banco.' && b.custom[0].en === 'He put the trash on the bank.' && b.custom[2].en === '', '翻譯：西文、英文（沒寫的英文是空字串）');
    ok((await text(page, '#babCard')).includes('10 句'), '清單顯示 10 句');
    // 再編輯
    await page.click('[data-act=babedit][data-k="0"]'); await page.waitForSelector('#babName');
    await page.click('[data-act=edtab][data-k=write]'); await page.waitForSelector('#babText');
    ok((await page.$$('.bcard')).length === 10 && (await page.inputValue('#babText')).split('\n').length === 10 && (await page.$eval('input[data-bc="0"][data-bt="2"]', e => e.value)) === 'lā jī', '再編輯：文字、讀音都還在');
    await page.click('[data-act=edtab][data-k=list]'); await page.waitForSelector('.brow.static');
    ok((await page.$$('.brow.static')).length === 10 && (await text(page, '#babCard')).includes('✎ 自己寫'), '「句庫內的句子」分頁：列出自己寫的句子並標示');
    await page.click('[data-act=babcdel]'); ok((await page.$$('.brow.static')).length === 9, '可以刪掉一句自己寫的');
    // 混合：挑句子 + 自己寫
    await page.click('[data-act=edtab][data-k=pick]'); await page.waitForSelector('#babList .brow'); await page.click('#babList .brow:nth-child(2)');
    ok((await text(page, '#babCard')).includes('已選 10 句'), '挑的句子與自己寫的句子合起來算句數');
    await page.click('[data-act=babsave]'); await page.waitForSelector('#babCard .setrow');
    const b2 = Object.values((await db(page)).shared_babanks)[0];
    ok(b2.ids.length === 1 && b2.custom.length === 9, '混合句庫：1 句挑的＋9 句自己寫的');
    ok(await noOverflow(page), '沒有橫向捲動'); ok(errors.length === 0, '沒有頁面錯誤', errors);
    await shot(page, 'ba-bank-list-custom'); await ctx.close(); }
  { const { page, errors, ctx } = await open(browser, { q: '?dev=bei', hash: '#/game/bei/content' });
    await page.waitForSelector('#babCard'); await page.click('[data-act=babedit]'); await page.waitForSelector('#babName');
    await page.click('[data-act=edtab][data-k=write]'); await page.fill('#babText', '杯子 被 他 打破 了｜x'); await page.click('[data-act=babgen]'); await page.waitForTimeout(400);
    ok((await page.$$('.bcard')).length === 1, '被：有「被」可以產生');
    await page.fill('#babText', '他 把 杯子 打破 了｜x'); await page.click('[data-act=babgen]'); await page.waitForTimeout(300);
    ok((await text(page, '#babCard')).includes('句子裡要有「被」'), '被的句庫：沒有「被」擋住');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { global.GT_FAIL = true;
    const { page, errors, ctx } = await open(browser, { q: '?dev=ba', hash: '#/game/ba/content' });
    await page.waitForSelector('#babCard'); await page.click('[data-act=babedit]'); await page.click('[data-act=edtab][data-k=write]'); await page.fill('#babText', '我 把 書 放在 桌子上｜x'); await page.click('[data-act=babgen]'); await page.waitForTimeout(500);
    ok((await text(page, '#babCard')).includes('讀音資料載入失敗') && !(await page.$('.bcard')), 'GoodTeacher 資料讀不到：顯示說明，不退回別的讀音');
    global.GT_FAIL = false; await ctx.close(); }
  }

  console.log('\n[G] 自訂句子：上傳圖片（壓縮、每份 10 張、換圖／刪圖、免費版鎖住、刪句庫連動）');
  { const { page, errors, ctx } = await open(browser, { q: '?dev=ba', hash: '#/game/ba/content' });
    await page.waitForSelector('#babCard'); await page.click('[data-act=babedit]'); await page.waitForSelector('#babName');
    await page.click('[data-act=edtab][data-k=set]'); await page.fill('#babName', '有圖的');
    await page.click('[data-act=edtab][data-k=write]'); await page.waitForSelector('#babText');
    const nouns = ['杯子', '包包', '筆', '手機', '鑰匙', '帽子', '外套', '蘋果', '書包', '雨傘', '眼鏡', '錢包'];
    await page.fill('#babText', nouns.map(n => '她 把 ' + n + ' 放在 桌子上｜Puso ' + n + '.').join('\n')); await page.click('[data-act=babgen]'); await page.waitForTimeout(500);
    ok((await text(page, '#babCard')).includes('只有訂閱') === false && (await text(page, '#babCard')).includes('著作權'), '寫句子頁有圖片說明（不要上傳學生的臉、著作權自負）');
    ok((await page.$$('[data-act=babimg]')).length === 12, '每一句都有「加圖片」按鈕');
    const png = Buffer.from(await page.evaluate(() => { const c = document.createElement('canvas'); c.width = 1200; c.height = 800; const x = c.getContext('2d'); const d = x.createImageData(1200, 800); for(let i = 0; i < d.data.length; i += 4){ d.data[i] = Math.random() * 255; d.data[i + 1] = Math.random() * 255; d.data[i + 2] = Math.random() * 255; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); return c.toDataURL('image/png').split(',')[1]; }), 'base64');
    const addImg = async k => { const had = (await page.$$('.bimg')).length; const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-act=babimg][data-k="' + k + '"]')]); await fc.setFiles({ name: 'a.png', mimeType: 'image/png', buffer: png }); await page.waitForFunction(n => document.querySelectorAll('.bimg').length >= n, had + 1); };
    await addImg(0);
    const sz = await page.$eval('.bimg', e => e.src.length);
    ok((sz - 23) * 3 / 4 <= 50 * 1024 && /^data:image\/jpeg/.test(await page.$eval('.bimg', e => e.src)), '圖片自動壓成 JPEG、50KB 以下（雜訊圖也行）', sz);
    for(let k = 1; k < 11; k++) await addImg(k);
    ok((await page.$$('.bimg')).length === 11, '加了 11 張圖');
    await page.click('[data-act=babsave]'); await page.waitForSelector('#babCard .setrow');
    let d = await db(page), b = Object.values(d.shared_babanks)[0], sid = Object.keys(d.shared_babanks)[0];
    const i1 = d.shared_babimgs && d.shared_babimgs[sid + '_1'], i2 = d.shared_babimgs && d.shared_babimgs[sid + '_2'];
    ok(i1 && Object.keys(i1.imgs).length === 10 && i2 && Object.keys(i2.imgs).length === 1, '11 張圖：第 1 份 10 張、第 2 份 1 張', [i1 && Object.keys(i1.imgs).length, i2 && Object.keys(i2.imgs).length]);
    ok(b.custom.filter(c => c.im).length === 11 && b.custom.filter(c => /^1[a-z0-9]{8}$/.test(c.im || '')).length === 10 && b.custom.filter(c => /^2[a-z0-9]{8}$/.test(c.im || '')).length === 1 && !b.custom[11].im, '句子裡存圖片代號（1／2＋代號），沒圖的句子沒有這欄');
    ok(i1.owner === 'u1' && Object.values(i1.imgs).every(v => /^data:image\/jpeg;base64,/.test(v)), '圖片文件只有本人、JPEG');
    // 再編輯：圖會讀回來
    await page.click('[data-act=babedit][data-k="0"]'); await page.waitForSelector('#babName');
    await page.click('[data-act=edtab][data-k=write]'); await page.waitForFunction(() => document.querySelectorAll('.bimg').length === 11);
    ok(true, '再編輯：11 張圖讀回來');
    // 換圖、刪圖
    await page.click('[data-act=babimgdel][data-k="0"]'); await page.click('[data-act=babimgdel][data-k="1"]');
    ok((await page.$$('.bimg')).length === 9, '可以刪圖');
    await page.click('[data-act=babsave]'); await page.waitForSelector('#babCard .setrow');
    d = await db(page); const j1 = d.shared_babimgs[sid + '_1'], j2 = d.shared_babimgs[sid + '_2'];
    ok(Object.keys(j1.imgs).length === 8 && Object.keys(j2.imgs).length === 1, '刪 2 張後：第 1 份剩 8 張，第 2 份還是 1 張（原本在哪份就留在哪份）');
    await page.click('[data-act=babedit][data-k="0"]'); await page.waitForSelector('#babName'); await page.click('[data-act=edtab][data-k=write]'); await page.waitForFunction(() => document.querySelectorAll('.bimg').length === 9);
    await addImg(0);
    await page.click('[data-act=babsave]'); await page.waitForSelector('#babCard .setrow');
    d = await db(page); ok(Object.keys(d.shared_babimgs[sid + '_1'].imgs).length === 9 && Object.keys(d.shared_babimgs[sid + '_2'].imgs).length === 1, '再加 1 張：放進有空位的第 1 份');
    // 全部刪光 → 圖片文件刪掉
    await page.click('[data-act=babedit][data-k="0"]'); await page.waitForSelector('#babName'); await page.click('[data-act=edtab][data-k=write]'); await page.waitForFunction(() => document.querySelectorAll('.bimg').length === 10);
    for(let k = 0; k < 12; k++){ if(await page.$('[data-act=babimgdel][data-k="' + k + '"]')) await page.click('[data-act=babimgdel][data-k="' + k + '"]'); }
    await page.click('[data-act=babsave]'); await page.waitForSelector('#babCard .setrow');
    d = await db(page); ok(!d.shared_babimgs || Object.keys(d.shared_babimgs).length === 0, '圖片全刪光：圖片文件也刪掉');
    // 加圖後刪整個句庫
    await page.click('[data-act=babedit][data-k="0"]'); await page.waitForSelector('#babName'); await page.click('[data-act=edtab][data-k=write]'); await addImg(0);
    await page.click('[data-act=babsave]'); await page.waitForSelector('#babCard .setrow');
    ok(Object.keys((await db(page)).shared_babimgs || {}).length === 1, '又加了 1 張圖');
    await page.click('[data-act=babdel][data-k="0"]'); await page.waitForTimeout(500);
    d = await db(page); ok(Object.keys(d.shared_babanks || {}).length === 0 && Object.keys(d.shared_babimgs || {}).length === 0, '刪句庫：圖片文件一起刪掉');
    ok(await noOverflow(page), '沒有橫向捲動'); ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { const { page, errors, ctx } = await open(browser, { seedOpt: { pro: false }, q: '?dev=ba', hash: '#/game/ba/content' });
    await page.waitForSelector('#babCard'); await page.click('[data-act=babedit]'); await page.waitForSelector('#babName');
    await page.click('[data-act=edtab][data-k=write]'); await page.fill('#babText', '我 把 書 放在 桌子上｜Puse el libro.'); await page.click('[data-act=babgen]'); await page.waitForTimeout(400);
    ok(!!(await page.$('[data-act=babimg]')) && (await text(page, '#babCard')).includes('🔒'), '免費版：有「加圖片」按鈕但標示鎖');
    let chooser = false; page.once('filechooser', () => { chooser = true; });
    await page.click('[data-act=babimg][data-k="0"]'); await page.waitForTimeout(400);
    ok(!chooser && (await page.$$('.bimg')).length === 0, '免費版按「加圖片」：不會開檔案選擇，跳出建議訂閱');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  await browser.close(); server.close();
  console.log('\n通過 ' + pass + '　失敗 ' + fail); process.exit(fail ? 1 : 0);
});
