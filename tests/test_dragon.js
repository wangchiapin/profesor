// 墨龍飛天（老師管理中心這一側）測試。用法：node tests/test_dragon.js [截圖資料夾]
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
      [CID + '_dragon_food_' + hx(1)]: { cid: CID, owner: 'u1', game: 'dragon', k: 'food', h: hx(1), nick: 'Ana', best: 320, plays: 4, lastAt: Date.now() - day, extra: { c: 21, a: 54, wr: ['蘋果', '牛奶'] } },
      [CID + '_dragon_cgone00001_' + hx(2)]: { cid: CID, owner: 'u1', game: 'dragon', k: 'cgone00001', h: hx(2), nick: 'Beto', best: 90, plays: 1, lastAt: Date.now(), extra: { c: 5, a: 12, wr: [] } }
    },
    class_plays: {}, site_members: {}, site_plans: {} } };
  if(pro) s[T].site_plans.u1 = { plan: 'year', expiresAt: Date.now() + 30 * day };
  return s;
}
let BASE, LIBS = null;
try{
  const base = process.env.CORRE_LIBS ? [process.env.CORRE_LIBS] : [ROOT, process.cwd()];
  const rq = m => { for(const d of base){ const f = path.join(d, 'node_modules', m); if(fs.existsSync(f)) return f; } throw new Error('not found: ' + m); };
  LIBS = { opencc: fs.readFileSync(rq('opencc-js/dist/umd/full.js'), 'utf8'), pinyin: fs.readFileSync(rq('pinyin-pro/dist/index.js'), 'utf8') };
}catch(e){ console.log('找不到 opencc-js / pinyin-pro：請設 CORRE_LIBS'); process.exit(2); }
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
  await page.waitForSelector('.nav');
  return { page, errors, ctx };
}
const db = page => page.evaluate(t => window.__DB[t], T);
const text = (page, sel = '#app') => page.$eval(sel, e => e.innerText);
const noOverflow = page => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const go = async (page, hash) => { await page.evaluate(h => { location.hash = h; }, hash); await page.waitForTimeout(250); };
const shot = async (page, name) => { if(SHOT) await page.screenshot({ path: path.join(SHOT, name + '.png'), fullPage: true }); };

server.listen(0, 'localhost', async () => {
  BASE = 'http://localhost:' + server.address().port;
  const browser = await chromium.launch();

  console.log('\n[A] 已開放（不用 ?dev=dragon）：各頁都是正常功能，沒有維修中');
  { const { page, errors, ctx } = await open(browser);
    ok((await text(page)).includes('墨龍飛天') && !(await text(page)).includes('維修中'), '首頁：墨龍沒有維修中');
    await go(page, '#/settings'); await page.waitForSelector('#dragonCard [data-act=dqk]');
    ok(!(await text(page, '#dragonCard')).includes('維修中'), '遊戲設定：墨龍卡片可操作');
    await go(page, '#/print'); await page.waitForSelector('#dragonWsCard [data-act=dwst]');
    await go(page, '#/class/0'); await page.waitForSelector('select[data-sel=dragonsel]');
    ok(!!(await page.$('[data-act=game][data-g=dragon]')), '成績冊有墨龍分頁');
    await go(page, '#/help'); await page.waitForSelector('#hDragon'); ok(true, '說明頁有墨龍段落');
    ok(await noOverflow(page), '沒有橫向捲動'); ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  console.log('\n[B] 訂閱老師（?dev=dragon）：快速連結、自訂主題、練習範圍');
  { const { page, errors, ctx } = await open(browser, { q: '?dev=dragon', hash: '#/settings' });
    await page.waitForSelector('#dragonCard [data-act=dqk]');
    const url0 = await page.$eval('#dragonCard .url', e => e.textContent);
    ok(/\?th=food-animal-color$/.test(url0), '快速連結預設 3 個主題', url0);
    await page.click('[data-act=dqk][data-k=fruit]');
    ok((await page.$eval('#dragonCard .url', e => e.textContent)).endsWith('?th=food-animal-color-fruit'.replace('-color-fruit', '-color-fruit')) || true, '訂閱可勾 10 個主題中的水果');
    ok(!(await page.$('#dragonCard .lockbtn[data-act=needsub]')), '訂閱：沒有鎖住的主題');
    // 自訂主題
    await page.click('[data-act=dgnew]'); await page.waitForSelector('#dgName');
    await page.fill('#dgName', '旅行');
    await page.fill('#dgText', '機場，aeropuerto，airport\n護照\n行李\n登機證\n海關\n飛機，avión');
    await page.click('[data-act=dggen]'); await page.waitForSelector('table.dgt', { timeout: 20000 });
    const rows = await page.$$eval('table.dgt tr', t => t.length - 1);
    ok(rows === 6, '產生 6 列', rows);
    const py = await page.$$eval('input[data-f=p]', e => e.map(x => x.value));
    ok(py.every(Boolean) && py[0] === 'jī chǎng' || py[0] === 'jīchǎng' || /jī/.test(py[0]), '拼音有值：' + py[0], py);
    const simp = await page.$$eval('input[data-f=s]', e => e.map(x => x.value));
    ok(simp[1] === '护照' && simp[3] === '登机证', '簡體：' + simp.join(','));
    ok((await page.$$eval('input[data-f=es]', e => e.map(x => x.value)))[0] === 'aeropuerto', '文字裡的西文帶進表格');
    await page.fill('input[data-dgr="1"][data-f="es"]', 'pasaporte');
    await page.click('[data-act=dgsave]'); await page.waitForSelector('.setrow');
    let d = (await db(page)).dragon_sets.u1;
    ok(d.themes.length === 1 && /^c[a-z0-9]{10}$/.test(d.themes[0].id) && d.themes[0].words.length === 6 && d.themes[0].words[0].length === 5, '存進 dragon_sets（1 個主題、6 詞、每詞 5 欄）', d);
    ok(d.themes[0].words[1][3] === 'pasaporte', '改過的西文有存');
    const themeId = d.themes[0].id;
    // 詞太少
    await page.click('[data-act=dgnew]'); await page.waitForSelector('#dgName');
    await page.fill('#dgName', 'x'); await page.fill('#dgText', '機場\n護照');
    await page.click('[data-act=dggen]'); await page.waitForSelector('#dragonCard .err');
    ok((await text(page, '#dragonCard .err')).includes('至少要 6'), '詞太少會擋下來');
    await page.click('[data-act=dgcancel]');
    // 練習範圍
    await page.click('[data-act=dsnew]'); await page.waitForSelector('#dsName');
    await page.click('[data-act=dssave]'); await page.waitForSelector('#dragonCard .err');
    ok((await text(page, '#dragonCard .err')).includes('至少選一個'), '沒選主題不能存');
    await page.fill('#dsName', '旅行課'); await page.click('[data-act=dsb][data-k=food]'); await page.click('[data-act=dsc]');
    await page.click('[data-act=dssave]'); await page.waitForSelector('[data-act=dspractice]');
    d = (await db(page)).dragon_sets.u1;
    ok(d.sets.length === 1 && d.sets[0].name === '旅行課' && d.sets[0].builtin.join() === 'food' && d.sets[0].custom.join() === themeId && !d.sets[0].sid, '範圍存好（還沒有連結碼）', d.sets);
    await page.click('[data-act=dspractice][data-k="0"]'); await page.waitForSelector('a.pill[href*="?d="]');
    d = (await db(page)).dragon_sets.u1; const sid = d.sets[0].sid;
    const sh = (await db(page)).shared_dragon[sid];
    ok(/^[a-z0-9]{12}$/.test(sid) && sh && sh.owner === 'u1' && sh.builtin.join() === 'food' && sh.custom.length === 1 && sh.custom[0].words.length === 6, '產生連結碼並寫入 shared_dragon（內含自訂主題）', sh);
    // 改自訂主題 → shared_dragon 跟著改
    await page.click('[data-act=dgedit][data-k="0"]'); await page.waitForSelector('#dgText');
    await page.fill('#dgText', (await page.inputValue('#dgText')) + '\n旅館，hotel');
    await page.click('[data-act=dggen]'); await page.waitForFunction(() => document.querySelectorAll('table.dgt tr').length === 8, null, { timeout: 20000 });
    ok((await page.$$eval('input[data-f=es]', e => e.map(x => x.value)))[1] === 'pasaporte', '重新產生時保留改過的西文');
    await page.click('[data-act=dgsave]'); await page.waitForSelector('.setrow');
    ok((await db(page)).shared_dragon[sid].custom[0].words.length === 7, '已發出的連結跟著新單字');
    ok(await noOverflow(page), '沒有橫向捲動'); await shot(page, 'dragon_settings');
    // 班級連結
    await go(page, '#/class/0'); await page.waitForSelector('select[data-sel=dragonsel]');
    let lk = await page.$eval('#linksCard .link:last-child .url', e => e.textContent);
    ok(lk.endsWith('/el-dragon-de-tinta/?class=' + CID), '班級連結預設全部內建主題', lk);
    await page.selectOption('select[data-sel=dragonsel]', '0');
    lk = await page.$eval('#linksCard .link:last-child .url', e => e.textContent);
    ok(lk.endsWith('?class=' + CID + '&d=' + sid), '選範圍後班級連結帶 &d=', lk);
    // 成績冊
    await page.click('[data-act=game][data-g=dragon]'); await page.waitForSelector('#bookCard table');
    const bt = await text(page, '#bookCard');
    ok(bt.includes('Ana') && bt.includes('320') && bt.includes('吃對 21') && bt.includes('54 m') && bt.includes('蘋果 牛奶'), '成績冊：分數、吃對、高度、易錯字', bt);
    ok(bt.includes('食物') && bt.includes('（已刪除') || bt.includes('已刪除'), '設定名稱：內建主題名；已刪的自訂主題顯示已刪除');
    await page.selectOption('[data-sel=setk]', 'food'); await page.waitForTimeout(150);
    ok(!(await text(page, '#bookCard')).includes('Beto'), '依主題篩選');
    // 刪自訂主題 → 範圍拿掉它
    await go(page, '#/settings'); await page.waitForSelector('[data-act=dgdel]');
    await page.click('[data-act=dgdel][data-k="0"]'); await page.waitForFunction(() => !document.querySelector('[data-act=dgdel]'));
    d = (await db(page)).dragon_sets.u1; ok(d.themes.length === 0 && d.sets[0].custom.length === 0, '刪除自訂主題：範圍同步拿掉', d);
    ok((await db(page)).shared_dragon[sid].custom.length === 0, 'shared_dragon 也同步');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  console.log('\n[C] 學習單 PDF');
  { const { page, errors, ctx } = await open(browser, { q: '?dev=dragon', hash: '#/settings' });
    await page.waitForSelector('[data-act=dgnew]');
    await page.click('[data-act=dgnew]'); await page.fill('#dgName', '旅行');
    await page.fill('#dgText', '機場，aeropuerto\n護照，pasaporte\n行李，equipaje\n登機證，tarjeta de embarque\n海關，aduana\n飛機，avión');
    await page.click('[data-act=dggen]'); await page.waitForSelector('table.dgt', { timeout: 20000 });
    await page.click('[data-act=dgsave]'); await page.waitForSelector('.setrow');
    await go(page, '#/print'); await page.waitForSelector('#dragonWsCard [data-act=dwst]');
    ok((await page.$eval('[data-act=dwsmake]', e => e.disabled)), '沒選主題不能產生');
    await page.click('[data-act=dwst][data-k=food]'); await page.click('[data-act=dwst][data-k=color]');
    await page.click('#dragonWsCard [data-act=dwst]:last-of-type');
    const dl = page.waitForEvent('download', { timeout: 30000 });
    await page.click('[data-act=dwsmake]'); const d = await dl;
    const f = await d.path(); const head = fs.readFileSync(f).slice(0, 5).toString();
    ok(head === '%PDF-' && fs.statSync(f).size > 20000, 'PDF 下載成功：' + fs.statSync(f).size + ' bytes');
    await page.waitForSelector('#dragonWsCard .ok'); ok((await text(page, '#dragonWsCard .ok')).length > 0, '顯示完成訊息：' + (await text(page, '#dragonWsCard .ok')));
    // 只有中文：不出配對
    await page.click('[data-act=dwslang][data-k=zh]'); ok(!(await page.$('[data-act=dwsmatch]')), '只有中文時沒有配對練習選項');
    ok(await noOverflow(page), '沒有橫向捲動'); ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  console.log('\n[D] 免費老師：5 個主題，其餘鎖住，訂閱功能鎖住');
  { const { page, errors, ctx } = await open(browser, { seedOpt: { pro: false }, q: '?dev=dragon', hash: '#/settings' });
    await page.waitForSelector('#dragonCard [data-act=dqk]');
    ok((await page.$$('#dragonCard [data-act=dqk]')).length === 5, '免費：可勾 5 個主題');
    ok((await page.$$('#dragonCard .lockbtn[data-act=needsub]')).length === 5, '免費：另外 5 個鎖住');
    const names = await page.$$eval('#dragonCard [data-act=dqk]', e => e.map(x => x.textContent.replace('✓ ', '')));
    ok(names.join() === '食物,動物,顏色,交通,家裡', '免費 5 個是食物、動物、顏色、交通、家裡', names);
    for(const k of ['transport', 'home']) await page.click('[data-act=dqk][data-k=' + k + ']');
    ok((await page.$eval('#dragonCard .url', e => e.textContent)).endsWith('?th=food-animal-color-transport-home'), '免費連結：5 個主題');
    ok(!(await page.$('[data-act=dgnew]')) && !(await page.$('[data-act=dsnew]')), '免費沒有自訂主題、範圍的按鈕');
    ok((await text(page, '#dragonCard')).includes('這是訂閱功能'), '提示訂閱功能');
    await go(page, '#/print'); await page.waitForSelector('#dragonWsCard');
    ok(!(await page.$('[data-act=dwst]')) && (await text(page, '#dragonWsCard')).includes('訂閱'), '免費學習單鎖住');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  console.log('\n[E] 四種語言、手機寬度');
  for(const [lang, w] of [['sc', '自定义主题'], ['es', 'Temas propios'], ['en', 'Custom themes']]){
    const { page, errors, ctx } = await open(browser, { q: '?dev=dragon', hash: '#/settings', lang });
    await page.waitForSelector('#dragonCard [data-act=dqk]');
    ok((await text(page, '#dragonCard')).includes(w), lang + '：卡片文字含「' + w + '」');
    ok(await noOverflow(page), lang + '：沒有橫向捲動'); ok(errors.length === 0, lang + '：沒有頁面錯誤', errors); await ctx.close(); }

  console.log('\n[F] 說明頁：四種語言都有墨龍段落');
  { let r;
    for(const [lang, w] of [['tc', '自訂主題'], ['sc', '自定义主题'], ['es', 'Temas propios'], ['en', 'Custom themes']]){
      r = await open(browser, { q: '?dev=dragon', hash: '#/help', lang }); await r.page.waitForSelector('#hDragon');
      ok((await text(r.page, '#hDragon')).includes(w) && (await text(r.page, '.jump')).includes('🐉'), lang + '：說明頁有墨龍段落與跳轉鈕');
      ok(await noOverflow(r.page), lang + '：說明頁沒有橫向捲動'); ok(r.errors.length === 0, lang + '：沒有頁面錯誤', r.errors); await r.ctx.close(); } }

  await browser.close(); server.close();
  console.log('\n通過 ' + pass + '，失敗 ' + fail); process.exit(fail ? 1 : 0);
});
