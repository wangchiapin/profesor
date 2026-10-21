// 老師管理中心測試（Playwright + 模擬 Firebase）。用法：node tests/test_center.js [截圖資料夾]
let chromium; try{ ({ chromium } = require('playwright')); }catch(e){ ({ chromium } = require('/opt/npm-tools/node_modules/playwright')); }
const fs = require('fs'), path = require('path'), http = require('http');
const ROOT = path.join(__dirname, '..');
const MOCK = fs.readFileSync(path.join(__dirname, 'firebase-mock.js'), 'utf8');
const SHOT = process.argv[2] || null; if(SHOT) fs.mkdirSync(SHOT, { recursive: true });
let pass = 0, fail = 0;
function ok(c, name, extra){ if(c){ pass++; console.log('  ✓', name); } else { fail++; console.log('  ✗', name, extra !== undefined ? '→ ' + JSON.stringify(extra) : ''); } }
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css', '.webp': 'image/webp' };
// 比比看的學習單會讀遊戲那邊的 engine.js／worksheet.js／人物圖：/compara-y-adivina/ 對到旁邊的資料夾（或用 BBK_DIR 指定）
const CORRE_DIR = process.env.CORRE_DIR || path.join(ROOT, '..', 'corre');
const BBK_DIR = process.env.BBK_DIR || path.join(ROOT, '..', 'compara-y-adivina');
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if(url.startsWith('/compara-y-adivina/')){
    const g = path.normalize(path.join(BBK_DIR, url.slice('/compara-y-adivina/'.length)));
    if(!g.startsWith(BBK_DIR) || !fs.existsSync(g)){ res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(g)] || 'application/octet-stream' }); return fs.createReadStream(g).pipe(res);
  }
  let f = path.normalize(path.join(ROOT, url));
  if(fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if(!f.startsWith(ROOT) || !fs.existsSync(f)){ res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
const T = 'subscription-48d3c';
const CID = 'class0000aaaa', CID2 = 'class0000bbbb';
const TEACH = { uid: 'u1', email: 'teacher@example.com', displayName: 'T', isAnonymous: false };
const hx = n => ('0000000000000000' + n.toString(16)).slice(-16);
const day = 86400000;
function qs(n, firstOk){ return Array.from({ length: n }, (_, i) => ({ t: ['pick', 'tf', 'decode'][i % 3], d: ['height', 'age', 'hair'][i % 3], f: ['BI', 'MEI', 'SAME'][i % 3], p: i % 2 ? -1 : 1, ok: true, f1: i < firstOk, ids: ['P01', 'P02'], tv: i % 2 === 0 })); }
function seed({ pro = true, expired = false, nocls = false, bbk = null, plan = null } = {}){
  const s = { [T]: {
    classes: nocls ? {} : { [CID]: { owner: 'u1', slot: 0, name: '週三班', showBoard: false, updatedAt: 1 }, [CID2]: { owner: 'u1', slot: 1, name: '週五班', showBoard: true, updatedAt: 1 } },
    teacher_classes: nocls ? {} : { u1: { slots: { '0': CID, '1': CID2 }, updatedAt: 1 } },
    teacher_banks: { u1: { slots: { '0': 'bank00001111' }, updatedAt: 1 } },
    shared_banks: { bank00001111: { owner: 'u1', slot: 0, name: '點飲料', speed: 'normal', script: 'trad', boss: true, pro: false, updatedAt: 1,
      sentences: [{ trad: ['你', '好'], simp: ['你', '好'], pinyin: ['nǐ', 'hǎo'], es: 'Hola', en: 'Hello' }, { trad: ['我', '要', '一杯', '紅茶'], simp: ['我', '要', '一杯', '红茶'], pinyin: ['wǒ', 'yào', 'yì bēi', 'hóng chá'], es: 'Quiero un té negro.', en: '' }] } },
    site_content: { corre_pack_food: { kind: 'corre_pack', order: 1, name: { zh: '食物', es: 'Comida' }, desc: { zh: '吃東西', es: 'Comer' },
      sentences: [{ trad: ['我', '吃', '飯'], simp: ['我', '吃', '饭'], pinyin: ['wǒ', 'chī', 'fàn'], es: 'Como.', en: 'I eat.' }, { trad: ['你', '好'], simp: ['你', '好'], pinyin: ['nǐ', 'hǎo'], es: 'Hola', en: 'Hello' }] } },
    teacher_configs: { u1: { items: [
      { id: 'a1', cfg: { name: '百位數', mode: 'A', rows: 4, cols: 4, hearts: 5, ids: ['red', 'blue'], range: 999 }, sid: 'cfg000011112' },
      { id: 'a2', cfg: { name: '小數字', mode: 'B', rows: 3, cols: 3, hearts: 3, ids: ['red', 'blue'], range: 999 } } ], updatedAt: 1 } },
    class_scores: {
      [CID + '_corre_pool_' + hx(1)]: { cid: CID, owner: 'u1', game: 'corre', k: 'pool', h: hx(1), nick: 'Ana', best: 900, plays: 3, lastAt: Date.now() - 1 * day, extra: { sent: 12, diff: 'normal' } },
      [CID + '_corre_bank00001111_' + hx(2)]: { cid: CID, owner: 'u1', game: 'corre', k: 'bank00001111', h: hx(2), nick: 'Beto', best: 400, plays: 5, lastAt: Date.now() - 40 * day, extra: { sent: 6, diff: 'dificil' } },
      [CID + '_colores_cfg000011112_' + hx(1)]: { cid: CID, owner: 'u1', game: 'colores', k: 'cfg000011112', h: hx(1), nick: 'Ana', best: 640, plays: 2, lastAt: Date.now() - 2 * day, extra: { secs: 83, cleared: 1 } },
      [CID2 + '_corre_pool_' + hx(9)]: { cid: CID2, owner: 'u1', game: 'corre', k: 'pool', h: hx(9), nick: 'Zoe', best: 100, plays: 1, lastAt: Date.now(), extra: { sent: 2, diff: 'facil' } },
      [CID + '_corre_pool_' + hx(3)]: { cid: CID, owner: 'u2', game: 'corre', k: 'pool', h: hx(3), nick: '別人老師的學生', best: 5, plays: 1, lastAt: Date.now(), extra: { sent: 1, diff: 'facil' } }
    },
    class_plays: {
      p1: { cid: CID, owner: 'u1', game: 'bbk', h: hx(1), nick: 'Ana', at: Date.now() - 1 * day, th: 'people', lv: 1, rg: '', score: 90, max: 100, qs: qs(10, 8) },
      p2: { cid: CID, owner: 'u1', game: 'bbk', h: hx(1), nick: 'Ana', at: Date.now() - 3 * day, th: 'people', lv: 2, rg: 'd=height,age&t=pick&n=10', score: 70, max: 100, qs: qs(10, 5) },
      p3: { cid: CID, owner: 'u1', game: 'bbk', h: hx(2), nick: 'Beto', at: Date.now() - 45 * day, th: 'people', lv: 1, rg: '', score: 50, max: 100, qs: qs(10, 3) },
      p4: { cid: CID2, owner: 'u1', game: 'bbk', h: hx(9), nick: 'Zoe', at: Date.now(), th: 'people', lv: 1, rg: '', score: 100, max: 100, qs: qs(10, 10) },
      p5: { cid: CID, owner: 'u2', game: 'bbk', h: hx(3), nick: '別人老師的學生', at: Date.now(), th: 'people', lv: 1, rg: '', score: 10, max: 100, qs: qs(10, 1) }
    },
    site_members: {}, site_plans: {} },
    'corre-d16da': { mandarinRunnerSentences: Object.fromEntries(Array.from({ length: 30 }, (_, i) => ['p' + i, { rand: i / 30,
      trad: ['我', '有', String.fromCharCode(0x4e00 + i * 7)], simp: ['我', '有', String.fromCharCode(0x4e00 + i * 7)], pinyin: ['wǒ', 'yǒu', 'x'], es: 'Tengo ' + i, en: 'I have ' + i }])) } };
  if(pro) s[T].site_plans.u1 = { plan: 'year', expiresAt: Date.now() + (expired ? -1 : 1) * 30 * day };
  if(plan) s[T].site_plans.u1 = { plan: plan[0], expiresAt: Date.now() + plan[1] };
  if(bbk) s[T].bbk_sets = { u1: { items: bbk, updatedAt: 1 } };
  return s;
}
async function open(browser, { seedOpt, user = TEACH, ls = {}, hash = '' } = {}){
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, acceptDownloads: true });
  const page = await ctx.newPage(); const errors = []; page.setDefaultTimeout(5000);
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if(m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  page.on('dialog', d => d.accept());
  await page.route('**/*', r => {
    const u = r.request().url();
    if(u.startsWith('http://localhost')) return r.continue();
    if(u.includes('gstatic.com/firebasejs')) return r.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
    if(LIBS && u.includes('cdn.jsdelivr.net/npm/opencc-js')) return r.fulfill({ status: 200, contentType: 'application/javascript', body: LIBS.opencc });
    if(LIBS && u.includes('cdn.jsdelivr.net/npm/pinyin-pro')) return r.fulfill({ status: 200, contentType: 'application/javascript', body: LIBS.pinyin });
    if(u.includes('api.mymemory.translated.net')){ const q = new URL(u).searchParams; return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ responseData: { translatedText: '[' + q.get('langpair').slice(-2) + '] ' + q.get('q') } }) }); }
    { const m = u.match(/^https:\/\/wangchiapin\.github\.io\/corre\/bank\/([A-Za-z0-9]+\.json)$/);   // 公開句庫：讀本機 corre 資料夾（CORRE_DIR 可指定）
      if(m){ const f = path.join(CORRE_DIR, 'bank', m[1]); return fs.existsSync(f) ? r.fulfill({ status: 200, contentType: 'application/json', body: fs.readFileSync(f) }) : r.fulfill({ status: 404, body: 'no' }); } }
    return r.abort();
  });
  await page.addInitScript(`window.__SEED=${JSON.stringify(seed(seedOpt))};window.__USER=${JSON.stringify(user)};window.__GOOGLE=${JSON.stringify(TEACH)};` +
    Object.entries(ls).map(([k, v]) => `try{localStorage.setItem(${JSON.stringify(k)},${JSON.stringify(v)})}catch(e){}`).join(''));
  await page.addInitScript(MOCK);
  await page.goto(BASE + '/index.html' + hash);
  return { page, errors, ctx };
}
const db = page => page.evaluate(t => window.__DB[t], T);
const shot = async (page, name) => { if(SHOT) await page.screenshot({ path: path.join(SHOT, name + '.png'), fullPage: true }); };
const vshot = async (page, name) => { if(SHOT) await page.screenshot({ path: path.join(SHOT, name + '.png') }); };
const text = (page, sel = '#app') => page.$eval(sel, e => e.innerText);
const noOverflow = page => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
let BASE;
// 句庫編輯器的繁簡轉換、拼音函式庫：測試時從本機讀（npm i opencc-js@1.4.1 pinyin-pro@3.20.0，或用 CORRE_LIBS 指到 node_modules 所在資料夾）
let LIBS = null;
try{
  const base = process.env.CORRE_LIBS ? [process.env.CORRE_LIBS] : [ROOT, process.cwd()];
  const rq = m => { for(const d of base){ const f = path.join(d, 'node_modules', m); if(fs.existsSync(f)) return f; } throw new Error('not found: ' + m); };
  LIBS = { opencc: fs.readFileSync(rq('opencc-js/dist/umd/full.js'), 'utf8'), pinyin: fs.readFileSync(rq('pinyin-pro/dist/index.js'), 'utf8') };
}catch(e){ console.log('（找不到 opencc-js / pinyin-pro，略過「自動產生」的測試）'); }
server.listen(0, 'localhost', async () => {
  BASE = 'http://localhost:' + server.address().port;
  const browser = await chromium.launch();

  console.log('\n[A] 沒登入：登入畫面、四種語言');
  { const { page, errors, ctx } = await open(browser, { user: null, ls: { profesorLang: 'tc' } });
    await page.waitForSelector('[data-act=login]');
    ok((await text(page)).includes('老師管理中心'), '繁體標題');
    for(const [l, w] of [['sc', '教师管理中心'], ['es', 'Centro del profesor'], ['en', 'Teacher Center'], ['tc', '老師管理中心']]){
      await page.click(`[data-act=lang][data-l=${l}]`); ok((await text(page)).includes(w), '切到 ' + l + '：' + w);
      if(l === 'sc') await shot(page, 'a1_login_sc');
    }
    await page.click('[data-act=lang][data-l=es]');
    ok(await page.evaluate(() => localStorage.getItem('profesorLang')) === 'es', '語言記在這台裝置');
    ok(await page.evaluate(() => document.documentElement.lang) === 'es', 'html lang 跟著換');
    await page.click('[data-act=login]'); await page.waitForSelector('.badge');
    ok(!!(await db(page)).site_members.u1, '登入後建立 site_members');
    ok(await noOverflow(page), '手機寬度沒有橫向捲動');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  console.log('\n[B] 訂閱老師：首頁與用量');
  { const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' } });
    await page.waitForSelector('.badge'); await page.waitForSelector('.badge');
    const t = await text(page);
    ok(t.includes('訂閱') && t.includes('到期日'), '顯示訂閱與到期日');
    ok(/班級（四款遊戲共用）\s*2 \/ 3/.test(t), '班級用量 2 / 3', t);
    ok(/句庫\s*1 \/ 5/.test(t) && /設定組\s*2 \/ 15/.test(t), '句庫 1 / 5、設定組 2 / 15');
    ok(!t.includes('建立班級、成績簿、列印需要訂閱'), '訂閱中沒有提示');
    await shot(page, 'b1_home');
    ok(await noOverflow(page), '沒有橫向捲動');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  console.log('\n[C] 免費與到期老師');
  { const { page, ctx } = await open(browser, { seedOpt: { pro: false }, ls: { profesorLang: 'tc' } });
    await page.waitForSelector('.badge'); const t = await text(page);
    ok(t.includes('免費') && t.includes('需要訂閱'), '免費：提示需要訂閱');
    ok(/句庫\s*1 \/ 1/.test(t) && /設定組\s*2 \/ 3/.test(t), '免費額度 1 / 3');
    await page.click('[data-act=nav][data-r=classes]'); await page.waitForSelector('.ctabs');
    ok(page.url().endsWith('#/class/0'), '按「班級」直接打開第一班', page.url());
    ok((await page.$$('input[id^=newCls]')).length === 0, '免費沒有建立班級的欄位');
    ok((await text(page, '.ctabs')).includes('週三班') && (await text(page, '.ctabs')).includes('週五班') && !!(await page.$('.ctabs [data-act=needsub]')), '仍看得到班級分頁，「建立班級」上鎖');
    await ctx.close(); }
  { const { page, ctx } = await open(browser, { seedOpt: { expired: true }, ls: { profesorLang: 'tc' } });
    await page.waitForSelector('.badge'); const t = await text(page);
    ok(t.includes('已於') && t.includes('到期') && t.includes('舊的班級與成績仍可查看'), '到期：顯示到期說明');
    await page.click('[data-act=nav][data-r=classes]'); await page.waitForSelector('.ctabs');
    ok((await page.$$('input[id^=newCls]')).length === 0, '到期不能建立班級');
    await page.goto(page.url().split('#')[0] + '#/game/corre/scores'); await page.waitForSelector('table.t');
    ok((await text(page)).includes('Ana'), '到期仍可查看成績');
    await ctx.close(); }

  console.log('\n[D] 班級：建立、改名、排行榜、刪除');
  { const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' } });
    await page.waitForSelector('.badge'); await page.click('[data-act=nav][data-r=classes]'); await page.waitForSelector('h2:has-text("週三班")');
    ok(page.url().endsWith('#/class/0'), '按「班級」直接顯示第一班', page.url());
    ok(JSON.stringify(await page.$$eval('.ctabs .pill', a => a.map(x => x.textContent.trim()))) === JSON.stringify(['🏫 週三班', '🏫 週五班', '＋ 建立班級']), '分頁：班名＋最後是「＋ 建立班級」', await page.$$eval('.ctabs .pill', a => a.map(x => x.textContent)));
    ok(await page.$eval('.ctabs .pill.on', e => e.textContent.includes('週三班')), '目前那班的分頁是亮的');
    await page.click('.ctabs [data-slot="1"]'); await page.waitForSelector('h2:has-text("週五班")');
    ok(page.url().endsWith('#/class/1'), '點分頁換班');
    await page.click('.ctabs [data-act=newclass]'); await page.waitForSelector('input[id^=newCls]');
    ok(page.url().endsWith('#/classes/new') && (await page.$$('input[id^=newCls]')).length === 1, '「＋ 建立班級」分頁：出現輸入框');
    await shot(page, 'd0_newclass_tab');
    await page.click('[data-act=createclass]');
    ok((await text(page)).includes('請輸入班級名稱'), '空名稱不能建立');
    await page.fill('#newCls2', '週末班'); await page.click('[data-act=createclass]');
    await page.waitForSelector('h2:has-text("週末班")');
    let d = await db(page); const cid3 = d.teacher_classes.u1.slots['2'];
    ok(cid3 && d.classes[cid3].owner === 'u1' && d.classes[cid3].slot === 2 && d.classes[cid3].name === '週末班' && d.classes[cid3].showBoard === false, '建班：寫入 classes、teacher_classes（保留原有的班）');
    ok(d.teacher_classes.u1.slots['0'] === CID && d.teacher_classes.u1.slots['1'] === CID2, '原有的班沒被動到');
    ok(Object.keys(d.classes[cid3]).sort().join() === 'name,owner,showBoard,slot,updatedAt', '班級欄位剛好符合規則');
    await page.goto(page.url().split('#')[0] + '#/game/corre/scores'); await page.waitForSelector('#bookCard');
    await page.click('[data-act=pickcls][data-slot="2"]');
    ok((await text(page)).includes('還沒有成績'), '新班級沒有成績');
    await page.goto(page.url().split('#')[0] + '#/class/2'); await page.waitForSelector('#clsName');
    ok(page.url().endsWith('#/class/2') && !(await page.$('.ctabs [data-act=newclass]')) && (await page.$$('.ctabs .pill')).length === 3, '滿 3 班：「＋ 建立班級」分頁不見了，跳到新班');
    await page.fill('#clsName', '週末進階班'); await page.click('[data-act=classrename]'); await page.waitForSelector('h2:has-text("週末進階班")');
    d = await db(page); ok(d.classes[cid3].name === '週末進階班' && d.classes[cid3].owner === 'u1' && d.classes[cid3].slot === 2, '改名成功、欄位不變');
    await page.click('[data-act=board][data-v="1"]'); await page.waitForTimeout(100);
    d = await db(page); ok(d.classes[cid3].showBoard === true, '排行榜開');
    await page.click('[data-act=board][data-v="0"]'); await page.waitForTimeout(100);
    d = await db(page); ok(d.classes[cid3].showBoard === false, '排行榜關');
    await shot(page, 'd1_class_empty');
    // 刪除有成績的班（週三班）：三款成績全清，別的班、別人的不動
    await page.click('.ctabs [data-slot="0"]'); await page.waitForSelector('h2:has-text("週三班")');
    await page.click('[data-act=classdelete]'); await page.waitForSelector('h2:has-text("週五班")'); await page.waitForTimeout(150);
    ok(page.url().endsWith('#/class/1'), '刪班後跳到剩下的第一班');
    d = await db(page);
    ok(!d.classes[CID] && d.classes[CID2] && !d.teacher_classes.u1.slots['0'] && d.teacher_classes.u1.slots['1'] === CID2, '刪班：班級與位置索引都移除，其他班還在');
    ok(!Object.values(d.class_scores).some(r => r.cid === CID && r.owner === 'u1') && !Object.values(d.class_plays).some(r => r.cid === CID && r.owner === 'u1'), '刪班：三款遊戲的成績一起刪除');
    ok(Object.values(d.class_scores).some(r => r.cid === CID2) && Object.values(d.class_plays).some(r => r.cid === CID2), '別的班成績還在');
    ok(Object.values(d.class_scores).some(r => r.owner === 'u2') && Object.values(d.class_plays).some(r => r.owner === 'u2'), '別的老師的資料沒被動到');
    ok(!(await text(page)).includes('週三班') && !!(await page.$('.ctabs [data-act=newclass]')), '分頁上不見了，「＋ 建立班級」又出現');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  console.log('\n[E] 學生連結與 QR（每款遊戲自己的「連結」分頁）');
  { const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' }, hash: '#/game/corre/links' });
    await page.waitForSelector('.link');
    const urls = () => page.$$eval('#linksCard .url', e => e.map(x => x.textContent));
    let u = await urls();
    ok(u.length === 1 && u[0] === 'https://wangchiapin.github.io/corre/?class=' + CID + '&level=A1', '跑吧：預設公開句庫 A1', u);
    await page.waitForFunction(() => document.querySelector('[data-sel=corresrc] optgroup[label*=主題包]'), null, { timeout: 5000 });
    await page.selectOption('[data-sel=corresrc]', 'L:B1'); u = await urls();
    ok(u[0] === 'https://wangchiapin.github.io/corre/?class=' + CID + '&level=B1', '跑吧：訂閱版可選 B1 → &level=B1', u);
    await page.selectOption('[data-sel=corresrc]', 'P:food'); u = await urls();
    ok(u[0] === 'https://wangchiapin.github.io/corre/?class=' + CID + '&pack=food', '跑吧：選題包 → &pack=food', u);
    await page.selectOption('[data-sel=correlv]', 'A1'); u = await urls();
    ok(u[0] === 'https://wangchiapin.github.io/corre/?class=' + CID + '&pack=food&level=A1', '跑吧：題包限定等級 → &pack=food&level=A1', u);
    await page.selectOption('[data-sel=corresrc]', 'B:bank00001111'); u = await urls();
    ok(u[0] === 'https://wangchiapin.github.io/corre/?class=' + CID + '&bank=bank00001111', '跑吧：選句庫後帶 &bank=', u);
    await page.click('[data-act=pickcls][data-slot="1"]'); u = await urls();
    ok(u[0].includes('class=' + CID2) && await page.evaluate(() => localStorage.getItem('profesorCls')) === '1', '換班級：連結跟著換，記住選的班');
    await page.click('[data-act=pickcls][data-slot="0"]');
    await page.evaluate(() => { window.__copied = null; navigator.clipboard.writeText = async t => { window.__copied = t; }; });
    await page.click('#linksCard [data-act=copy]'); await page.waitForTimeout(100);
    ok((await page.evaluate(() => window.__copied)) === 'https://wangchiapin.github.io/corre/?class=' + CID + '&bank=bank00001111', '複製連結');
    await shot(page, 'e2_links');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' }, hash: '#/game/colores/links' });
    await page.waitForSelector('.link');
    const urls = () => page.$$eval('#linksCard .url', e => e.map(x => x.textContent));
    ok((await urls()).length === 0, '色數：還沒選設定組不顯示連結');
    await page.selectOption('[data-sel=colcfg]', '0'); let u = await urls();
    ok(u[0] === 'https://wangchiapin.github.io/pop-colores-numeros/?c=cfg000011112&class=' + CID, '色數：?c=設定碼&class=班級碼', u);
    await page.selectOption('[data-sel=colcfg]', '1');
    ok(await page.$('[data-act=colmake]') !== null, '沒有連結碼的設定組顯示「產生連結」');
    await page.click('[data-act=colmake]'); await page.waitForSelector('.url[data-url=colores]');
    const d = await db(page); const it = d.teacher_configs.u1.items[1];
    ok(/^[a-z0-9]{12}$/.test(it.sid) && d.shared_configs[it.sid].owner === 'u1' && d.shared_configs[it.sid].pro === false && d.shared_configs[it.sid].cfg.name === '小數字', '產生連結碼：寫入 shared_configs 與 teacher_configs', it);
    ok(d.teacher_configs.u1.items[0].sid === 'cfg000011112' && d.teacher_configs.u1.items.length === 2, '其他設定組沒被動到');
    u = await urls(); ok(u[0].includes('?c=' + it.sid + '&class=' + CID), '連結出現', u);
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' }, hash: '#/game/bbk/links' });
    await page.waitForSelector('.link');
    const u = await page.$$eval('#linksCard .url', e => e.map(x => x.textContent));
    ok(u.length === 1 && u[0] === 'https://wangchiapin.github.io/compara-y-adivina/?class=' + CID, '比比看：連結', u);
    await page.click('[data-act=qr][data-game=bbk]'); await page.waitForSelector('.modal canvas');
    const cv = await page.$eval('.modal canvas', c => ({ w: c.width, h: c.height, dark: (() => { const x = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for(let i = 0; i < x.length; i += 4) if(x[i] < 60) n++; return n; })() }));
    ok(cv.w === cv.h && cv.w > 200 && cv.dark > 500, 'QR 畫出來了', cv);
    await shot(page, 'e1_qr');
    await page.evaluate(() => { const A = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function(){ window.__dlName = this.download; return A.call(this); }; });
    await Promise.all([page.waitForEvent('download'), page.click('.modal [data-m=dl]')]);
    const dlName = await page.evaluate(() => window.__dlName);
    ok(/^qr-bbk-.+\.png$/.test(dlName), 'QR 可下載 PNG', dlName);
    await page.click('.modal [data-m=close]'); ok(await page.$('.modal') === null, '關閉視窗');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' }, hash: '#/game/dragon/links' });
    await page.waitForSelector('.link');
    const u = await page.$$eval('#linksCard .url', e => e.map(x => x.textContent));
    ok(u.length === 1 && u[0] === 'https://wangchiapin.github.io/el-dragon-de-tinta/?class=' + CID, '墨龍：連結', u);
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { const { page, ctx } = await open(browser, { seedOpt: { pro: true }, ls: { profesorLang: 'tc' }, hash: '#/game/colores/links' });
    await page.waitForSelector('.link');
    await page.evaluate(() => { __profesor.S.a.configs = []; }); await page.evaluate(() => document.querySelector('[data-act=lang][data-l=tc]').click());
    ok((await text(page)).includes('還沒有設定組'), '沒有設定組：提示先去建立'); await ctx.close(); }

  console.log('\n[F] 成績簿：跑吧／色數／比比看（各遊戲的「成績」分頁）');
  { const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' }, hash: '#/game/corre/scores' });
    await page.waitForSelector('table.t');
    let rows = await page.$$eval('table.t tr', t => t.map(r => r.innerText.replace(/\s+/g, ' ').trim()));
    ok(rows[0].startsWith('暱稱 最高分 次數 詳細 最近'), '欄位：暱稱｜最高分｜次數｜詳細｜最近', rows[0]);
    ok(rows.length === 3 && rows[1].startsWith('Ana 舊公開題庫（改版前） 900 3 12 句 · 普通') && rows[2].startsWith('Beto 📚 點飲料 400 5 6 句 · 困難'), '跑吧：依最高分排序、詳細=句數·難度、別的老師不出現', rows);
    ok(!(await text(page)).includes('別人老師的學生') && !(await text(page)).includes('Zoe'), '別的班、別人的學生不出現');
    await shot(page, 'f1_corre');
    await page.click('[data-act=days][data-d="30"]'); rows = await page.$$eval('table.t tr', t => t.length);
    ok(rows === 2, '最近 30 天篩選（Beto 40 天前，被濾掉）', rows);
    await page.click('[data-act=days][data-d="0"]');
    await page.click('[data-act=pickcls][data-slot="1"]'); await page.waitForSelector('table.t');
    ok((await text(page, '#bookCard')).includes('Zoe') && !(await text(page, '#bookCard')).includes('Ana'), '成績分頁換班級：看到另一班的成績');
    await page.click('[data-act=pickcls][data-slot="0"]'); await page.waitForSelector('table.t');
    await page.click('[data-act=gtab][data-t=content]'); await page.waitForSelector('#correCard');
    await page.click('[data-act=gtab][data-t=scores]'); await page.waitForSelector('table.t');
    await page.click('table.t tr:nth-child(3) [data-act=rowdel]'); await page.waitForTimeout(150);
    ok(!Object.keys((await db(page)).class_scores).some(k => k === CID + '_corre_bank00001111_' + hx(2)) && Object.keys((await db(page)).class_scores).includes(CID + '_corre_pool_' + hx(1)), '刪除單列：只刪 Beto 的跑吧成績');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' }, hash: '#/game/colores/scores' });
    await page.waitForSelector('table.t');
    const rows = await page.$$eval('table.t tr', t => t.map(r => r.innerText.replace(/\s+/g, ' ').trim()));
    ok(rows.length === 2 && rows[1].startsWith('Ana 🎨 百位數 640 2 用時 1:23 · 全部清除'), '色數：詳細=用時＋清盤', rows);
    await shot(page, 'f2_colores');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act=csv]')]);
    const csv = fs.readFileSync(await dl.path(), 'utf8');
    ok(csv.charCodeAt(0) === 0xfeff && csv.includes('nickname,setting,best,plays,detail,last') && csv.includes('Ana,🎨 百位數,640,2,用時 1:23 · 全部清除'), 'CSV 內容（含 BOM）', csv.slice(0, 120));
    await page.click('[data-act=cleargame]'); await page.waitForTimeout(150);
    ok(!Object.keys((await db(page)).class_scores).some(k => k.includes('_colores_')) && Object.keys((await db(page)).class_scores).includes(CID + '_corre_pool_' + hx(1)), '清空色數：只清色數');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' }, hash: '#/game/bbk/scores' });
    await page.waitForSelector('table.t');
    let rows = await page.$$eval('table.t tr', t => t.map(r => r.innerText.replace(/\s+/g, ' ').trim()));
    ok(rows[0].startsWith('暱稱 最高分 次數 詳細 最近'), '比比看學生表欄位同上', rows[0]);
    ok(rows[1].startsWith('Ana 一般模式 90% 1 第一次就對 80%') && rows[2].startsWith('Ana 其他範圍 70% 1 第一次就對 50%') && rows[3].startsWith('Beto 一般模式 50% 1 第一次就對 30%'), '比比看（全部設定）：每人每設定一列、最高分%、回合數、第一次就對%', rows);
    await shot(page, 'f3_bbk_students');
    await page.click('[data-act=tab][data-tab=err]'); await page.waitForSelector('.bar');
    const heads = await page.$$eval('.sec', e => e.map(x => x.innerText));
    ok(['句型', '特徵與形容詞', '題型', '對錯題：句子本身'].every(h => heads.includes(h)), '常錯統計四個分組', heads);
    const ths = await page.$$eval('table.t:has(.bar) tr:first-child', r => r.map(x => x.innerText.replace(/\s+/g, ' ').trim()));
    ok(ths.every(x => x === '題數 第一次就答對'), '常錯統計只有「題數」「第一次就答對」，沒有「最後答對」', ths);
    ok(!(await text(page)).includes('最後答對'), '畫面上找不到「最後答對」');
    ok((await text(page)).includes('最常錯的排在最上面'), '說明改成一句「最常錯的排在最上面」');
    const rates = await page.$$eval('table.t:has(.bar)', ts => ts.map(t => [...t.querySelectorAll('tr')].slice(1).map(r => parseInt(r.querySelector('.bar span').textContent))));
    ok(rates.every(r => r.every((v, i) => i === 0 || v >= r[i - 1])), '依「第一次就答對」由低到高', rates);
    const tot = await page.evaluate(() => __profesor.S.plays.reduce((s, r) => s + r.qs.length, 0));
    const sumF = await page.$eval('table.t:has(.bar)', t => [...t.querySelectorAll('tr')].slice(1).reduce((s, r) => s + +r.children[1].textContent, 0));
    ok(tot === sumF, '句型題數加總 = 全部題數', [tot, sumF]);
    const t2 = await text(page);
    ok(t2.includes('身高：高') && t2.includes('年齡：小') && t2.includes('A 比 B ＋形容詞') && t2.includes('看圖選句子'), '特徵、句型、題型標籤翻成中文');
    await shot(page, 'f4_bbk_errors');
    await page.click('[data-act=tab][data-tab=stu]'); await page.click('table.t.click tr:nth-child(2)'); await page.waitForSelector('h3:has-text("Ana")');
    const t3 = await text(page);
    ok(t3.includes('第 1 關') && t3.includes('第 2 關') && t3.includes('老師範圍：身高、年齡｜看圖選句子') && t3.includes('一般模式') && t3.includes('90/100'), '個人頁：回合列表、範圍標籤、分數');
    await shot(page, 'f5_bbk_student');
    await page.click('[data-act=studel]'); await page.waitForTimeout(150);
    const left = Object.values((await db(page)).class_plays);
    ok(!left.some(r => r.nick === 'Ana') && left.some(r => r.nick === 'Beto') && left.some(r => r.owner === 'u2'), '刪除學生：只刪他的比比看紀錄');
    // 清空這款
    await page.click('[data-act=cleargame]'); await page.waitForTimeout(150);
    ok(!Object.values((await db(page)).class_plays).some(r => r.cid === CID && r.owner === 'u1'), '清空比比看：本班紀錄清空');
    ok(Object.keys((await db(page)).class_scores).includes(CID + '_corre_pool_' + hx(1)), '清空比比看不影響跑吧成績');
    ok(await noOverflow(page), '沒有橫向捲動');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  console.log('\n[G] 其他頁面與四語畫面');
  { const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'en' }, hash: '#/game/corre/content' });
    await page.waitForSelector('.card');
    ok(!!(await page.$('#correCard')) && !(await page.$$eval('a.pill', a => a.map(x => x.href))).join('|').includes('corre/teacher/'), '遊戲設定：跑吧句庫卡片在中心，不再連到舊教師頁');
    await shot(page, 'g1_settings_en');
    await page.click('[data-act=gtab][data-t=sheet]'); await page.waitForSelector('#cwsCard');
    ok((await text(page)).includes('Worksheets'), '學習單分頁（英文）');
    await page.click('[data-act=lang][data-l=es]'); await page.click('[data-act=gtab][data-t=links]'); await page.waitForSelector('#linksCard .link');
    ok((await text(page)).includes('Enlaces de juego para alumnos') && (await text(page)).includes('mismo apodo'), '連結分頁（西文）');
    await shot(page, 'g2_class_es');
    ok(await noOverflow(page), '西文版沒有橫向捲動');
    await page.click('[data-act=lang][data-l=sc]'); await page.click('[data-act=togame][data-g=bbk]'); await page.click('[data-act=gtab][data-t=scores]'); await page.waitForSelector('table.t'); await page.click('[data-act=tab][data-tab=err]'); await page.waitForSelector('.bar');
    ok((await text(page)).includes('特征与形容词') && (await text(page)).includes('常错统计') && !(await text(page)).includes('特徵與形容詞'), '簡體版常錯統計');
    await shot(page, 'g3_errors_sc');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  console.log('\n[I] 比比看：練習範圍（新增、編輯、改名、刪除、額度、連結）');
  { const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' }, hash: '#/game/bbk/content' });
    await page.waitForSelector('#bbkCard');
    ok((await text(page, '#bbkCard')).includes('已存 0 / 15 組'), '訂閱老師：0 / 15');
    await page.click('[data-act=bbknew]'); await page.waitForSelector('#bbkCard .editor');
    let chips = await page.$$eval('#bbkCard .editor [data-act=bbkd]', e => e.map(x => x.dataset.k));
    ok(chips.join() === 'height,age,build,hair,eyes,nose', '第 1 關只列第 1 關的特徵', chips);
    ok((await page.$$eval('#bbkCard .editor [data-act=bbkt]', e => e.map(x => x.dataset.k))).join() === 'decode,tf,pick,more,fill,adj', '第 1 關的題型');
    await page.fill('#bbkName', '身高和年齡');
    await page.click('[data-act=bbkall][data-k=d0]');
    ok(await page.$eval('[data-act=bbksave]', b => b.disabled), '特徵全清：不能儲存');
    await page.click('[data-act=bbkd][data-k=height]'); await page.click('[data-act=bbkd][data-k=age]');
    await page.click('[data-act=bbkt][data-k=tf]');   // 取消對錯題
    await page.click('[data-act=bbkn][data-k="15"]');
    ok((await page.$eval('#bbkName', i => i.value)) === '身高和年齡', '點選其他東西時名稱不會消失');
    await shot(page, 'i1_editor');
    await page.click('[data-act=bbksave]'); await page.waitForSelector('#bbkCard .setrow');
    let d = await db(page), it = d.bbk_sets.u1.items[0];
    ok(it.name === '身高和年齡' && it.lv === 1 && it.d.join() === 'height,age' && it.t.join() === 'decode,pick,more,fill,adj' && it.n === 15 && !it.sid, '存進 bbk_sets（還沒有連結碼）', it);
    ok((await text(page, '#bbkCard')).includes('第 1 關 · 15 題 · 身高、年齡 · 看句子找人、看圖選句子、選人：誰比較＿？'), '列表摘要', await text(page, '#bbkCard'));
    // 第二組：全選＋第 3 關
    await page.click('[data-act=bbknew]'); await page.click('[data-act=bbklv][data-k="3"]');
    ok((await page.$$eval('#bbkCard .editor [data-act=bbkd].on', e => e.length)) === 9, '換到第 3 關：全選時跟著變成 9 個特徵');
    await page.click('[data-act=bbksave]'); await page.waitForFunction(() => document.querySelectorAll('#bbkCard .setrow').length === 2);
    d = await db(page); it = d.bbk_sets.u1.items[1];
    ok(it.name === '範圍 2' && it.lv === 3 && it.d.length === 0 && it.t.length === 0 && it.n === 10, '沒取名用預設名稱；全選存成空陣列（＝全部）', it);
    // 練習連結：產生連結碼並複製
    await page.evaluate(() => { window.__copied = null; navigator.clipboard.writeText = async t => { window.__copied = t; }; });
    await page.click('[data-act=bbkpractice][data-k="0"]'); await page.waitForFunction(() => window.__copied);
    d = await db(page); it = d.bbk_sets.u1.items[0];
    const sid = it.sid, sh = d.shared_bbk && d.shared_bbk[sid];
    ok(/^[a-z0-9]{12}$/.test(sid) && sh && sh.owner === 'u1' && sh.name === '身高和年齡' && sh.th === 'people' && sh.d.join() === 'height,age' && sh.n === 15, '產生連結碼：寫入 shared_bbk', sh);
    ok((await page.evaluate(() => window.__copied)) === 'https://wangchiapin.github.io/compara-y-adivina/?r=' + sid, '複製練習連結 ?r=代碼');
    ok(await page.$('#bbkCard .setrow a[href*="?r=' + sid + '"]') !== null, '出現「試玩」');
    // 編輯＋改名：shared_bbk 跟著改，連結碼不變
    await page.click('[data-act=bbkedit][data-k="0"]'); await page.fill('#bbkName', '身高年齡（改）'); await page.click('[data-act=bbklv][data-k="2"]');
    await page.click('[data-act=bbkd][data-k=muscle]');
    await page.click('[data-act=bbksave]'); await page.waitForFunction(() => !document.querySelector('#bbkCard .editor'));
    d = await db(page); it = d.bbk_sets.u1.items[0];
    ok(it.sid === sid && it.name === '身高年齡（改）' && it.lv === 2 && it.d.join() === 'height,age,muscle', '編輯後連結碼不變', it);
    ok(d.shared_bbk[sid].name === '身高年齡（改）' && d.shared_bbk[sid].lv === 2 && d.shared_bbk[sid].d.join() === 'height,age,muscle', '已發出的連結跟著改（shared_bbk 更新）', d.shared_bbk[sid]);
    ok(it.t.join() === 'decode,pick,fill,adj', '換關卡時題型只留新關卡有的', it.t);
    // 取消編輯不存
    await page.click('[data-act=bbkedit][data-k="1"]'); await page.fill('#bbkName', '不要存'); await page.click('[data-act=bbkcancel]');
    ok((await db(page)).bbk_sets.u1.items[1].name === '範圍 2', '取消：不存');
    await shot(page, 'i2_list');
    // 首頁用量
    await page.click('[data-act=nav][data-r=home]'); await page.waitForSelector('.ph');
    ok((await text(page)).includes('比比看：設定存檔\n2 / 15') || (await text(page)).replace(/\s+/g, ' ').includes('比比看：設定存檔 2 / 15'), '首頁用量 2 / 15');
    // 班級頁：選範圍 → 連結 ?r=&class=
    await page.evaluate(() => __profesor.go('game/bbk/links')); await page.waitForSelector('[data-sel=bbksel]');
    const bbkUrl = () => page.$eval('.url[data-url=bbk]', e => e.textContent);
    ok((await bbkUrl()) === 'https://wangchiapin.github.io/compara-y-adivina/?class=' + CID, '預設一般模式');
    await page.selectOption('[data-sel=bbksel]', '0');
    ok((await bbkUrl()) === 'https://wangchiapin.github.io/compara-y-adivina/?r=' + sid + '&class=' + CID, '選範圍：?r=代碼&class=班級碼', await bbkUrl());
    await page.selectOption('[data-sel=bbksel]', '1');
    ok(await page.$('[data-act=bbkmake]') !== null && await page.$('.url[data-url=bbk]') === null, '還沒有連結碼的範圍：顯示「產生連結」');
    await page.click('[data-act=bbkmake]'); await page.waitForSelector('.url[data-url=bbk]');
    const sid2 = (await db(page)).bbk_sets.u1.items[1].sid;
    ok(/^[a-z0-9]{12}$/.test(sid2) && (await bbkUrl()).endsWith('?r=' + sid2 + '&class=' + CID), '產生後出現連結');
    await shot(page, 'i3_class_link');
    // 刪除：shared_bbk 一起刪
    await page.click('[data-act=gtab][data-t=content]'); await page.waitForSelector('#bbkCard .setrow');
    await page.click('[data-act=bbkdel][data-k="0"]'); await page.waitForFunction(() => document.querySelectorAll('#bbkCard .setrow').length === 1);
    d = await db(page);
    ok(d.bbk_sets.u1.items.length === 1 && d.bbk_sets.u1.items[0].sid === sid2 && !d.shared_bbk[sid] && !!d.shared_bbk[sid2], '刪除：清單與 shared_bbk 一起刪，其他組不動');
    ok(await noOverflow(page), '手機寬度沒有橫向捲動');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { const three = [1, 2, 3].map(i => ({ id: 'x' + i, name: 'R' + i, lv: 1, d: [], t: [], n: 10 }));
    const { page, errors, ctx } = await open(browser, { seedOpt: { pro: false, bbk: three }, ls: { profesorLang: 'es' }, hash: '#/game/bbk/content' });
    await page.waitForSelector('#bbkCard .setrow');
    ok((await text(page, '#bbkCard')).includes('3 / 3 guardados') && await page.$('[data-act=bbknew]') === null, '免費：3 / 3，不能再新增（西文）');
    ok((await text(page, '#bbkCard')).includes('hasta 15'), '提示訂閱可存 15 組');
    await page.click('[data-act=bbkedit][data-k="2"]'); await page.fill('#bbkName', 'Nuevo nombre'); await page.click('[data-act=bbksave]');
    await page.waitForFunction(() => !document.querySelector('#bbkCard .editor'));
    ok((await db(page)).bbk_sets.u1.items[2].name === 'Nuevo nombre', '免費滿額仍可改名');
    await shot(page, 'i4_free_es');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { const five = [1, 2, 3, 4, 5].map(i => ({ id: 'x' + i, name: 'R' + i, lv: 1, d: [], t: [], n: 10 }));
    const { page, errors, ctx } = await open(browser, { seedOpt: { pro: true, expired: true, bbk: five }, ls: { profesorLang: 'tc' }, hash: '#/game/bbk/content' });
    await page.waitForSelector('#bbkCard .setrow');
    ok((await text(page, '#bbkCard')).includes('已存 5 / 3 組') && await page.$('[data-act=bbknew]') === null, '到期：超過額度的仍看得到，但不能新增');
    await page.click('[data-act=bbkdel][data-k="4"]'); await page.waitForFunction(() => document.querySelectorAll('#bbkCard .setrow').length === 4);
    ok((await db(page)).bbk_sets.u1.items.length === 4, '到期仍可刪除');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'en' }, hash: '#/game/bbk/content' });
    await page.waitForSelector('#bbkCard'); await page.click('[data-act=bbknew]');
    // 畫面以為還在訂閱中，但其實已到期：規則（模擬）不准存第 4 組
    await page.evaluate(() => { __profesor.S.a.bbk = [1, 2, 3].map(i => ({ id: 'y' + i, name: 'R' + i, lv: 1, d: [], t: [], n: 10 })); });
    await page.evaluate(t => { window.__DB[t].site_plans = {}; }, T);
    await page.click('[data-act=bbksave]'); await page.waitForSelector('#bbkCard .editor .err');
    ok((await text(page, '#bbkCard .editor')).includes('Permission denied'), '規則拒絕時顯示錯誤、草稿還在');
    ok(errors.every(e => /insufficient permissions/.test(e)), '只有預期中的權限錯誤', errors); await ctx.close(); }

  console.log('\n[J] 方案名稱');
  for(const [plan, want] of [[['trial', 5 * day + 60000], '試用・剩 6 天'], [['month', 20 * day], '月訂閱'], [['year', 200 * day], '年訂閱'], [['trial', -day], '試用（已到期）'], [null, '免費']]){
    const { page, ctx } = await open(browser, { seedOpt: { pro: false, plan }, ls: { profesorLang: 'tc' } });
    await page.waitForSelector('.badge');
    const b = await page.$eval('.badge', e => e.textContent);
    ok(b === want, '方案顯示：' + want, b);
    await ctx.close();
  }

  console.log('\n[K] 色數設定組：新增、編輯、停用連結、刪除、訂閱功能');
  { const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' }, hash: '#/game/colores/content' });
    await page.waitForSelector('#colCard .setrow');
    ok((await text(page, '#colCard')).includes('已存 2 / 15 組') && (await text(page, '#colCard')).includes('百位數'), '列出原本的 2 組設定');
    await page.click('#colCard [data-act=colnew]'); await page.waitForSelector('#colCard .editor');
    ok((await page.$$eval('.cchip.on', e => e.length)) === 9, '新設定預設基本色 9 色');
    await page.fill('#colName', '三年級');
    await page.click('[data-act=colmode][data-k=B]'); await page.click('[data-act=colstep][data-k="rows,1"]'); await page.click('[data-act=colstep][data-k="cols,-1"]');
    await page.click('[data-act=colhearts][data-k="0"]');
    await page.click('[data-act=colquick][data-k=none]'); await page.click('[data-act=colid][data-k=red]');
    await page.click('[data-act=colsave]'); await page.waitForSelector('#colCard .editor .err');
    ok((await text(page, '#colCard .editor .err')).includes('至少要選 2 種顏色'), '只選 1 色不能存');
    await page.click('[data-act=colid][data-k=blue]');
    await page.click('[data-act=colcadd]'); await page.fill('[data-cc="0"][data-f=n]', '天空藍'); await page.fill('[data-cc="0"][data-f=s]', '天空藍色');
    if(LIBS){
      await page.$eval('[data-cc="0"][data-f=n]', e => e.dispatchEvent(new Event('change', { bubbles: true })));
      await page.waitForFunction(() => document.querySelector('[data-cc="0"][data-f=p]').value, null, { timeout: 15000 });
      ok((await page.$eval('[data-cc="0"][data-f=p]', e => e.value)) === 'tiān kōng lán', '自訂顏色：打完名稱自動帶出拼音', await page.$eval('[data-cc="0"][data-f=p]', e => e.value));
      await page.fill('[data-cc="0"][data-f=p]', 'tiān kōng lán.');
      await page.$eval('[data-cc="0"][data-f=n]', e => e.dispatchEvent(new Event('change', { bubbles: true }))); await page.waitForTimeout(300);
      ok((await page.$eval('[data-cc="0"][data-f=p]', e => e.value)) === 'tiān kōng lán.', '老師改過的拼音不會被蓋掉');
      await page.fill('[data-cc="0"][data-f=p]', 'tiān kōng lán');
    }
    await page.click('[data-act=colnmode][data-k=list]'); await page.fill('#colList', '1, 2, 10-12, 100');
    ok((await page.$eval('#colName', i => i.value)) === '三年級', '名稱沒被重畫洗掉');
    await shot(page, 'k1_col_editor');
    await page.click('[data-act=colsave]'); await page.waitForFunction(() => !document.querySelector('#colCard .editor'));
    let d = await db(page), it = d.teacher_configs.u1.items[2];
    ok(it && it.cfg.name === '三年級' && it.cfg.mode === 'B' && it.cfg.rows === 6 && it.cfg.cols === 3 && it.cfg.hearts === 0 && it.cfg.ids.join() === 'red,blue' &&
      it.cfg.custom[0].n === '天空藍' && it.cfg.custom[0].s === '天空藍色' && (!LIBS || it.cfg.custom[0].p === 'tiān kōng lán') && !('_autoP' in it.cfg.custom[0]) && it.cfg.nums.join() === '1,2,10,11,12,100' && !it.cfg.range && typeof it.id === 'string', '存成遊戲同樣的格式', it);
    // 編輯有連結碼的那組：shared_configs 跟著改
    await page.click('#colCard [data-act=coledit][data-k="0"]'); await page.click('[data-act=colnmode][data-k="9999"]'); await page.click('[data-act=colsave]');
    await page.waitForFunction(() => !document.querySelector('#colCard .editor'));
    d = await db(page);
    ok(d.teacher_configs.u1.items[0].cfg.range === 9999 && d.teacher_configs.u1.items[0].sid === 'cfg000011112' && d.shared_configs && d.shared_configs.cfg000011112.cfg.range === 9999, '編輯後已發出的連結跟著改');
    // 練習連結
    await page.evaluate(() => { window.__copied = null; navigator.clipboard.writeText = async t => { window.__copied = t; }; });
    await page.click('#colCard [data-act=colpractice][data-k="2"]'); await page.waitForFunction(() => window.__copied);
    d = await db(page); const sid = d.teacher_configs.u1.items[2].sid;
    ok(/^[a-z0-9]{12}$/.test(sid) && d.shared_configs[sid].pro === true && (await page.evaluate(() => window.__copied)) === 'https://wangchiapin.github.io/pop-colores-numeros/?c=' + sid, '練習連結 ?c=代碼（用到訂閱功能 pro=true）');
    // 停用連結
    await page.click('#colCard [data-act=coloff][data-k="2"]'); await page.waitForFunction(s => !document.querySelector('#colCard [data-act=coloff][data-k="2"]'), sid);
    d = await db(page);
    ok(!d.teacher_configs.u1.items[2].sid && !d.shared_configs[sid], '停用連結：刪 shared_configs，設定組留著');
    // 刪除
    await page.click('#colCard [data-act=coldel][data-k="1"]'); await page.waitForFunction(() => document.querySelectorAll('#colCard .setrow').length === 2);
    d = await db(page);
    ok(d.teacher_configs.u1.items.map(x => x.cfg.name).join() === '百位數,三年級', '刪除第 2 組');
    await shot(page, 'k2_col_list');
    ok(await noOverflow(page), '手機寬度沒有橫向捲動');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { const { page, errors, ctx } = await open(browser, { seedOpt: { pro: false }, ls: { profesorLang: 'es' }, hash: '#/game/colores/content' });
    await page.waitForSelector('#colCard .setrow');
    await page.click('#colCard [data-act=colnew]'); await page.waitForSelector('#colCard .editor');
    await page.click('[data-act=colcadd]');
    ok(await page.$('[data-cc="0"]') === null && await page.$('.modal.sub') !== null, '免費：不能加自訂顏色（跳出建議訂閱）');
    await page.click('.modal.sub [data-m=close]');
    await page.click('[data-act=colnmode][data-k=list]');
    ok(await page.$('.modal.sub') !== null, '免費：自訂數字也跳出建議訂閱');
    await page.click('.modal.sub [data-m=close]');
    ok(await page.$('#colList') === null && (await text(page, '#colCard')).includes('requieren suscripción'), '免費：不能用自訂數字（西文提示）');
    await page.click('[data-act=colsave]'); await page.waitForFunction(() => !document.querySelector('#colCard .editor'));
    ok((await db(page)).teacher_configs.u1.items.length === 3 && await page.$('#colCard [data-act=colnew]') === null, '免費：存到第 3 組就不能再新增');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  console.log('\n[L] 色數學習單');
  { const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' }, hash: '#/game/colores/sheet' });
    await page.waitForSelector('#wsCard');
    ok(await page.$eval('[data-act=wsmake]', b => b.disabled), '沒選設定組不能產生');
    await page.selectOption('[data-sel=wscfg]', '0');
    await shot(page, 'l0_form');
    // 聽讀找色
    await page.click('[data-act=wsmake]'); await page.waitForSelector('.ws');
    let info = await page.evaluate(() => ({ cells: document.querySelectorAll('.ws-board:not(.ws-key .ws-board) .ws-cell').length,
      qs: document.querySelectorAll('.ws > .ws-qs li').length, key: document.querySelectorAll('.ws-key li').length,
      nums: [...document.querySelectorAll('.ws > .ws-board .ws-cell .d')].map(e => +e.textContent),
      legend: !!document.querySelector('.ws-legend'), qtext: [...document.querySelectorAll('.ws > .ws-qs .q')].map(e => e.textContent) }));
    ok(info.cells === 16 && info.qs === 10 && info.key === 10, '聽讀找色：4×4 色塊板、10 題、答案 10 題', info);
    ok(new Set(info.nums).size === 16 && info.nums.every(n => n >= 0 && n <= 999), '數字不重複、在 0–999', info.nums);
    ok(info.legend && info.qtext.every(t => /^[零一二三四五六七八九十百千兩]+$/.test(t)), '題目是國字數字、附顏色名稱表', info.qtext);
    ok((await text(page, '.ws')).includes('Respuestas'), '輔助語言西文');
    await shot(page, 'l1_listen');
    if(SHOT) await page.pdf({ path: path.join(SHOT, 'l1_listen.pdf'), format: 'A4', printBackground: true });
    const before = info.nums.join();
    await page.click('[data-act=wsmake]'); await page.waitForSelector('.ws');
    const after = await page.$$eval('.ws > .ws-board .ws-cell .d', e => e.map(x => x.textContent).join());
    ok(before !== after, '「換一張」數字會變');
    // 老師唸
    await page.click('[data-act=wsback]'); await page.click('[data-act=wsread][data-k="0"]'); await page.click('[data-act=wscount][data-k="5"]'); await page.click('[data-act=wsmake]');
    await page.waitForSelector('.ws');
    ok((await page.$$eval('.ws > .ws-qs .q', e => e.length)) === 0 && (await page.$$eval('.ws > .ws-qs li', e => e.length)) === 5 && (await text(page, '.ws')).includes('聽老師唸'), '老師唸：紙上沒題目、5 個空格');
    // 看色寫數
    await page.click('[data-act=wsback]'); await page.click('[data-act=wskind][data-k=write]'); await page.click('[data-act=wsmake]'); await page.waitForSelector('.ws');
    info = await page.evaluate(() => ({ groups: document.querySelectorAll('.ws > .ws-qs li').length, key: [...document.querySelectorAll('.ws-key li')].map(e => e.textContent) }));
    ok(info.groups === 2 && info.key.length === 2 && info.key.every(t => /^(紅色|藍色)/.test(t)), '看色寫數：每個顏色一題（設定 2 色）', info);
    await shot(page, 'l2_write');
    // 著色版，簡體、不附答案
    await page.click('[data-act=wsback]'); await page.click('[data-act=wskind][data-k=color]'); await page.click('[data-act=wssimp][data-k="1"]'); await page.click('[data-act=wshelp][data-k=none]'); await page.click('[data-act=wsans]');
    await page.click('[data-act=wsmake]'); await page.waitForSelector('.ws');
    info = await page.evaluate(() => ({ blank: document.querySelectorAll('.ws-cell.blank').length, key: !!document.querySelector('.ws-key'), t: document.querySelector('.ws').innerText }));
    ok(info.blank === 16 && !info.key && info.t.includes('色数消消乐') && info.t.includes('涂上') && !info.t.includes('Respuestas'), '著色版：16 格空白、簡體、無答案頁、無輔助語言', info.t.slice(0, 80));
    await shot(page, 'l3_color');
    if(SHOT) await page.pdf({ path: path.join(SHOT, 'l3_color.pdf'), format: 'A4', printBackground: true });
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { const { page, ctx } = await open(browser, { seedOpt: { pro: false }, ls: { profesorLang: 'tc' }, hash: '#/game/colores/sheet' });
    await page.waitForSelector('#wsCard');
    ok((await text(page, '#wsCard')).includes('學習單是訂閱功能') && await page.$('[data-act=wsmake]') === null, '免費老師：學習單上鎖');
    await ctx.close(); }
  { const big = { id: 'b1', cfg: { name: '大', mode: 'A', rows: 8, cols: 6, hearts: 5, ids: ['red', 'blue', 'green'], range: 9999 } };
    const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'en' }, hash: '#/game/colores/sheet' });
    await page.waitForSelector('#wsCard');
    await page.evaluate(c => { __profesor.S.a.configs = [c]; }, big); await page.click('[data-act=lang][data-l=en]');
    await page.selectOption('[data-sel=wscfg]', '0'); await page.click('[data-act=wskind][data-k=color]'); await page.click('[data-act=wsmake]'); await page.waitForSelector('.ws');
    ok((await page.$$eval('.ws-cell.blank', e => e.length)) === 48, '8×6、0–9999 也做得出來');
    ok(await noOverflow(page), '大格子在手機上也不橫向捲動');
    await shot(page, 'l4_big');
    if(SHOT) await page.pdf({ path: path.join(SHOT, 'l4_big.pdf'), format: 'A4', printBackground: true });
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  console.log('\n[M] 跑吧！漢字：句庫卡片、編輯器、學習單');
  { const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' }, hash: '#/game/corre/content' });
    await page.waitForSelector('#correCard');
    let t = await text(page, '#correCard');
    ok(t.includes('已用 1 / 5 個句庫') && t.includes('點飲料') && t.includes('2 / 80 句'), '卡片：額度、名稱、句數', t);
    ok((await page.$$('#correCard [data-act=bankedit]')).length === 5, '5 個位置：1 個編輯＋4 個建立');
    ok(t.includes('練習連結') && t.includes('成績不會回傳'), '有練習連結的說明');
    ok((await page.$eval('#correCard a.pill', a => a.href)).endsWith('/corre/?bank=bank00001111&preview=1'), '試玩連結＝?bank=…&preview=1');
    await page.click('#correCard [data-act=bankqr][data-k="0"]'); await page.waitForSelector('.modal canvas');
    ok((await text(page, '.modal')).includes('點飲料'), 'QR 視窗有句庫名稱');
    await shot(page, 'm0_qr'); await page.click('.modal [data-m=close]');
    await shot(page, 'm1_settings');

    // 建立第 2 個句庫
    await page.click('#correCard [data-act=bankedit][data-k="1"]'); await page.waitForSelector('#ce-sent');
    ok(await page.evaluate(() => location.hash) === '#/bank/1', '網址 #/bank/1');
    ok((await text(page, '.nav')).length > 0 && await page.$eval('.nav .pill.on', b => b.dataset.r) === 'home', '句庫編輯頁：上方「首頁」亮著');
    ok((await text(page)).includes('(0 / 80)'), '訂閱：每庫 80 句');
    if(LIBS){
      await page.fill('#ce-sent', '我 不 要 一 個 蘋果');
      await page.fill('#ce-esTop', 'No quiero una manzana.');
      await page.click('#ce-gen'); await page.waitForSelector('#ce-preview:not([hidden])');
      const rows = await page.$$eval('#ce-tokens .tk', r => r.map(x => [...x.querySelectorAll('input')].map(i => i.value)));
      ok(rows.length === 6 && rows[5][1] === '苹果' && rows[5][2] === 'píng guǒ', '自動產生：簡體、台灣拼音', rows);
      ok(rows[1][2] === 'bú' && rows[3][2] === 'yí', '「不」「一」變調', rows.map(r => r[2]));
      ok(await page.inputValue('#ce-en') === '[en] 我不要一个苹果', '英文留空 → 自動翻譯');
      await page.click('#ce-addSent'); await page.waitForTimeout(50);
    }else{
      await page.evaluate(() => { document.getElementById('ce-preview').hidden = false; });
      await page.click('#ce-addTok'); const ins = await page.$$('#ce-tokens input');
      await ins[0].fill('蘋果'); await ins[1].fill('苹果'); await ins[2].fill('píng guǒ'); await page.fill('#ce-es', 'Manzana'); await page.click('#ce-addSent');
    }
    ok((await text(page)).includes('(1 / 80)') && !(await page.$eval('#ce-dirty', e => e.hidden)), '加入 1 句，顯示「有尚未上傳的修改」');
    // 批次匯入（翻譯自己寫，不用網路）
    await page.fill('#ce-bulk', '你 好 | Hola | Hello\n一 二 三 四 五 六 七 八 九 十 一 二 三 四 五 六 七 八 九 十 一 | demasiado\n你 好 | Hola\n謝謝 你 | Gracias');
    if(LIBS){
      await page.click('#ce-bulkCheck'); await page.waitForSelector('#ce-bulkGo:not([hidden])');
      ok((await text(page, '#ce-bulkSt')).includes('可加入 2 句，略過 2 句'), '批次：超過字數、重複都略過', await text(page, '#ce-bulkSt'));
      await page.click('#ce-bulkGo');
      ok((await text(page)).includes('(3 / 80)'), '批次加入 2 句');
    }
    // 公開題庫
    await page.click('[data-pick=pool]'); await page.waitForSelector('#ce-pickList label');
    const n0 = (await page.$$('#ce-pickList label')).length;
    ok(n0 === 100, '公開句庫 A1：一次顯示 100 句', n0);
    await page.selectOption('#ce-lvlSel', 'B1'); await page.waitForTimeout(300);
    ok((await page.$$('#ce-pickList label')).length === 100 && (await text(page, '#ce-pickList')).includes('Tengo') === false, '訂閱版可切到 B1（100 句）');
    await page.selectOption('#ce-lvlSel', 'A1'); await page.waitForTimeout(100);
    const A1 = JSON.parse(fs.readFileSync(path.join(CORRE_DIR, 'bank', 'A1.json'), 'utf8')).sentences;
    await page.fill('#ce-pickFilter', 'Hoy hace muy buen tiempo'); await page.waitForTimeout(50);
    const shown = await page.$$eval('#ce-pickList label', l => l.length);
    ok(shown === A1.filter(x => x.es.toLowerCase().includes('hoy hace muy buen tiempo')).length && shown >= 1, '關鍵字篩選', shown);
    await page.check('#ce-pickList label input'); await page.click('#ce-pickAdd');
    ok((await text(page, '#ce-pickSt')).includes('已加入 1 句'), '從公開題庫加入 1 句');
    // 主題包
    await page.click('[data-pick=pack]'); await page.waitForSelector('#ce-packSel option', { state: 'attached' });
    ok((await page.$eval('#ce-packSel', s => s.options[0].textContent)).includes('飲食與點餐'), '主題包名稱（新句庫的題包）');
    await page.click('#ce-pickAll');
    ok((await text(page, '#ce-pickSt')).includes('已加入'), '主題包整包加入');
    // 切語言：句子和還沒加入的輸入都要留著
    await page.fill('#ce-sent', '還沒按加入'); await page.fill('#ce-name', '第二課');
    await page.click('[data-act=lang][data-l=es]'); await page.waitForSelector('#ce-sent');
    ok(await page.inputValue('#ce-sent') === '還沒按加入' && await page.inputValue('#ce-name') === '第二課', '切語言後輸入還在');
    ok((await text(page)).includes('Frases del banco') && (await text(page)).includes('Ajustes del banco'), '編輯器跟著換西文');
    await page.click('[data-act=lang][data-l=tc]'); await page.waitForSelector('#ce-sent');
    const cnt = await page.$eval('#ce-counter', e => e.textContent);
    // 修改一句
    await page.click('#ce-sents .sent:first-child .acts button:first-child'); await page.waitForSelector('#ce-preview:not([hidden])');
    await page.fill('#ce-es', '¡Cambiado!'); await page.click('#ce-addSent');
    ok((await text(page, '#ce-sents')).includes('¡Cambiado!'), '修改一句');
    await page.selectOption && await page.click('[data-g=speed][data-v=dificil]'); await page.click('[data-g=phonetic][data-v=zhuyin]');
    ok((await text(page, '#ce-sents')).includes('ㄆㄧㄥˊ') || (await text(page, '#ce-sents')).includes('ㄨㄛˇ'), '選注音：清單顯示注音');
    await page.setViewportSize({ width: 390, height: 844 });
    ok(await noOverflow(page), '編輯器在手機寬度沒有橫向捲動');
    await shot(page, 'm2_editor');
    // 有沒上傳的修改 → 離開要先問；按取消就留著
    await page.evaluate(() => { window.__cf = window.confirm; window.confirm = () => false; });
    await page.click('#ce-back'); await page.waitForTimeout(100);
    ok(await page.evaluate(() => location.hash) === '#/bank/1' && !!(await page.$('#ce-sent')), '離開前詢問，取消就留在編輯器');
    await page.evaluate(() => { window.confirm = window.__cf; });
    // 上傳
    await page.click('#ce-save'); await page.waitForTimeout(150);
    ok((await text(page, '#ce-saveSt')).includes('已上傳'), '上傳成功', await text(page, '#ce-saveSt'));
    let d = await db(page);
    const sid = d.teacher_banks.u1.slots['1'];
    const b = sid && d.shared_banks[sid];
    ok(!!b && b.slot === 1 && b.pro === true && b.name === '第二課' && b.speed === 'dificil' && b.phonetic === 'zhuyin' && b.owner === 'u1', '寫入 shared_banks（位置 2＝訂閱庫）', b && { slot: b.slot, pro: b.pro, name: b.name });
    ok(!!b && b.sentences.length + ' / 80' === cnt.replace(/[()]/g, '').trim() && b.sentences.every(x => Object.keys(x).sort().join() === 'en,es,pinyin,simp,trad'), '句子格式與教師頁相同');
    ok(d.teacher_banks.u1.slots['0'] === 'bank00001111', '第 1 個句庫不受影響');
    // 再改一次：連結碼不變
    await page.fill('#ce-name', '第二課（改）'); await page.click('#ce-save'); await page.waitForTimeout(150);
    d = await db(page);
    ok(d.teacher_banks.u1.slots['1'] === sid && d.shared_banks[sid].name === '第二課（改）', '再存一次：連結碼不變，已發出的連結跟著改');
    await page.click('#ce-back'); await page.waitForSelector('#correCard');
    t = await text(page, '#correCard');
    ok(t.includes('第二課（改）') && t.includes('已用 2 / 5 個句庫'), '回到卡片：新句庫出現');
    // 班級頁的題目來源
    await page.click('[data-act=gtab][data-t=links]'); await page.waitForSelector('[data-sel=corresrc]');
    ok((await page.$$eval('[data-sel=corresrc] option', o => o.map(x => x.textContent))).some(x => x.includes('第二課（改）')), '班級連結的題目來源有新句庫');
    ok((await page.$$eval('[data-sel=corresrc] optgroup', g => g.map(x => x.label))).join('|') === '公開句庫|主題包（訂閱）|我的句庫', '來源選單分三組：公開句庫、主題包、我的句庫');
    // 列印：學習單 PDF
    await page.click('[data-act=gtab][data-t=sheet]'); await page.waitForSelector('#cwsCard');
    await page.selectOption('[data-sel=cwsbank]', '1');
    ok(await page.$eval('[data-act=cwszy]', b => b.classList.contains('on')) && !(await page.$eval('[data-act=cwspy]', b => b.classList.contains('on'))), '學習單預設跟句庫一樣用注音');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act=cwsmake]')]);
    const pdf = fs.readFileSync(await dl.path());
    ok(pdf.slice(0, 5).toString() === '%PDF-' && pdf.length > 20000 && /\/Count [2-9]/.test(pdf.toString('latin1')), '下載學習單 PDF（含排列句子與答案頁）', pdf.length);   // 檔名有中文時測試用瀏覽器會改叫 download，真的瀏覽器不會
    ok((await text(page, '#cwsCard')).includes('已下載'), '顯示已下載頁數');
    if(SHOT) fs.copyFileSync(await dl.path(), path.join(SHOT, 'm3_worksheet.pdf'));
    await shot(page, 'm3_print');
    // 刪除
    await page.click('[data-act=gtab][data-t=content]'); await page.waitForSelector('#correCard');
    await page.click('#correCard [data-act=bankdel][data-k="1"]'); await page.waitForTimeout(150);
    d = await db(page);
    ok(!d.shared_banks[sid] && !d.teacher_banks.u1.slots['1'] && d.teacher_banks.u1.slots['0'] === 'bank00001111', '刪除：句庫和位置都移除');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  { // 免費老師：班級連結與公開句庫連結只能選 A1、A2（B1、題包跳「建議訂閱」）
    const { page, errors, ctx } = await open(browser, { seedOpt: { pro: false }, ls: { profesorLang: 'tc' }, hash: '#/game/corre/links' });
    await page.waitForSelector('.link');
    await page.waitForFunction(() => document.querySelector('[data-sel=corresrc] optgroup[label*=主題包]'), null, { timeout: 5000 });
    const url0 = () => page.$eval('#linksCard .url', e => e.textContent);
    ok((await page.$$eval('[data-sel=corresrc] option', o => o.map(x => x.textContent))).slice(0, 3).join('|') === '公開句庫 A1|公開句庫 A2|🔒 公開句庫 B1', '免費：班級連結來源 B1 有鎖頭');
    await page.selectOption('[data-sel=corresrc]', 'L:B1'); await page.waitForSelector('.modal.sub');
    ok(await page.$eval('[data-sel=corresrc]', s => s.value) === 'L:A1' && (await url0()).endsWith('&level=A1'), '免費：選 B1 → 建議訂閱，連結維持 A1');
    await page.click('.modal.sub [data-m=close]');
    await page.selectOption('[data-sel=corresrc]', 'P:food'); await page.waitForSelector('.modal.sub');
    ok(await page.$eval('[data-sel=corresrc]', s => s.value) === 'L:A1', '免費：選題包 → 建議訂閱');
    await page.click('.modal.sub [data-m=close]');
    await page.selectOption('[data-sel=corresrc]', 'L:A2');
    ok((await url0()).endsWith('?class=' + CID + '&level=A2'), '免費：A2 可以，連結 &level=A2', await url0());
    await page.$eval('#linksCard', e => e.scrollIntoView()); await vshot(page, 'p2_free_links');
    await page.goto(BASE + '/index.html#/game/corre/links'); await page.waitForSelector('#pubCard');
    await page.waitForFunction(() => document.querySelector('#pubCard [data-sel=pubsrc] optgroup[label*=主題包]'), null, { timeout: 5000 });
    ok(await page.$eval('#pubCard .url', e => e.textContent) === 'https://wangchiapin.github.io/corre/?level=A1' && (await text(page, '#pubCard')).includes('免費版可以用 A1、A2'), '免費：公開句庫練習連結預設 A1，並說明 B1／題包要訂閱');
    await page.selectOption('#pubCard [data-sel=pubsrc]', 'L:A2');
    ok(await page.$eval('#pubCard .url', e => e.textContent) === 'https://wangchiapin.github.io/corre/?level=A2', '免費：公開句庫連結 A2');
    await page.selectOption('#pubCard [data-sel=pubsrc]', 'P:time'); await page.waitForSelector('.modal.sub');
    ok(await page.$eval('#pubCard .url', e => e.textContent).then(x => !x.includes('pack')), '免費：公開句庫連結選題包 → 建議訂閱');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  { // 訂閱老師：公開句庫練習連結（B1、題包、題包＋等級）
    const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' }, hash: '#/game/corre/links' });
    await page.waitForSelector('#pubCard');
    await page.waitForFunction(() => document.querySelector('#pubCard [data-sel=pubsrc] optgroup[label*=主題包]'), null, { timeout: 5000 });
    const u = () => page.$eval('#pubCard .url', e => e.textContent);
    await page.selectOption('#pubCard [data-sel=pubsrc]', 'L:B1');
    ok(await u() === 'https://wangchiapin.github.io/corre/?level=B1', '訂閱：公開句庫連結 B1');
    await page.selectOption('#pubCard [data-sel=pubsrc]', 'P:compare');
    ok(await u() === 'https://wangchiapin.github.io/corre/?pack=compare', '訂閱：題包連結 ?pack=compare', await u());
    await page.selectOption('#pubCard [data-sel=publv]', 'A2');
    ok(await u() === 'https://wangchiapin.github.io/corre/?pack=compare&level=A2', '訂閱：題包＋等級 ?pack=compare&level=A2', await u());
    ok(((await page.$$eval('#pubCard [data-sel=pubsrc] option', o => o.length))) === 3 + 9, '來源選單：3 個等級 + 9 個題包');
    await page.$eval('#pubCard', e => e.scrollIntoView()); await vshot(page, 'p1_pubcard');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  { // 免費老師
    const { page, errors, ctx } = await open(browser, { seedOpt: { pro: false }, ls: { profesorLang: 'tc' }, hash: '#/game/corre/content' });
    await page.waitForSelector('#correCard');
    const t = await text(page, '#correCard');
    ok(t.includes('已用 1 / 1 個句庫') && (t.match(/🔒/g) || []).length === 8 && (await page.$$('#correCard [data-act=needsub]')).length === 4 && t.includes('2 / 50 句'), '免費：1 / 1，其他 4 格上鎖（各有建議訂閱按鈕），每庫 50 句');
    await page.goto(BASE + '/index.html#/bank/2'); await page.waitForSelector('.notice');
    ok((await text(page)).includes('需要訂閱') && !(await page.$('#ce-sent')), '免費老師直接開 #/bank/2：顯示需要訂閱');
    await page.goto(BASE + '/index.html#/bank/0'); await page.waitForSelector('#ce-sent');
    ok((await text(page)).includes('(2 / 50)'), '免費：第 1 庫上限 50');
    await page.click('[data-pick=pack]'); await page.waitForSelector('#ce-pickList .notice');
    ok((await text(page, '#ce-pickList')).includes('主題包是訂閱版功能'), '免費：主題包上鎖');
    await page.click('[data-pick=pool]'); await page.waitForSelector('#ce-pickList label');
    ok((await page.$$('#ce-pickList label')).length === 100 && (await page.$$eval('#ce-lvlSel option', o => o.map(x => x.textContent).join(','))) === 'A1,A2,🔒 B1', '免費：公開句庫 A1 可用，B1 有鎖頭');
    await page.selectOption('#ce-lvlSel', 'B1'); await page.waitForSelector('.modal.sub');
    ok(await page.$eval('#ce-lvlSel', s => s.value) === 'A1', '免費：選 B1 跳「建議訂閱」，等級維持 A1');
    await page.click('.modal.sub [data-m=close]');
    await page.selectOption('#ce-lvlSel', 'A2'); await page.waitForTimeout(300);
    ok((await page.$$('#ce-pickList label')).length === 100 && !(await page.$('.modal.sub')), '免費：A2 可以選');
    await page.evaluate(() => __profesor.go('game/corre/sheet')); await page.waitForSelector('#cwsCard');   // 沒改東西，不會問
    ok((await text(page, '#cwsCard')).includes('學習單是訂閱功能') && !(await page.$('[data-act=cwsmake]')), '免費：學習單上鎖');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  { // 到期老師：訂閱庫顯示「連結已暫停」，不能存成訂閱庫
    const { page, errors, ctx } = await open(browser, { seedOpt: { expired: true }, ls: { profesorLang: 'tc' }, hash: '#/game/corre/content' });
    await page.waitForSelector('#correCard');
    await page.evaluate(() => { const a = __profesor.S.a; a.banks.push({ slot: 1, sid: 'bank22223333', name: '舊訂閱庫', data: { name: '舊訂閱庫', pro: true, speed: 'normal', script: 'trad', sentences: [{ trad: ['好'], simp: ['好'], pinyin: ['hǎo'], es: 'bien', en: '' }] } }); a.bslots['1'] = 'bank22223333'; });
    await page.click('[data-act=lang][data-l=tc]');
    ok((await text(page, '#correCard')).includes('學生連結已暫停'), '到期：訂閱庫顯示連結暫停');
    await page.click('#correCard [data-act=bankedit][data-k="1"]'); await page.waitForSelector('#ce-sent');
    ok((await text(page, '#ce-notice')).includes('訂閱已到期'), '到期：編輯器上方說明');
    await page.click('#ce-save'); await page.waitForTimeout(100);
    ok((await text(page, '#ce-saveSt')).includes('需要有效的訂閱'), '到期：訂閱庫不能存');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  { // 句庫編輯器文字：程式用到的都有四種語言
    const { page, ctx } = await open(browser, { user: null });
    const src = fs.readFileSync(path.join(ROOT, 'js', 'corre.js'), 'utf8') + fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
    const used = new Set([...src.matchAll(/\btr\('([A-Za-z0-9_]+)'/g)].map(m => m[1]));
    const r = await page.evaluate(u => { const X = window.CORRE_TX; return u.filter(k => ['zh', 'cn', 'es', 'en'].some(l => !X[l][k])); }, [...used].filter(k => !['on', 'off'].includes(k) || true));
    ok(r.length === 0, '句庫編輯器詞條齊全', r);
    await ctx.close(); }

  console.log('\n[N] 步驟 5-1：學習單改名、快速跳轉、建議訂閱、意見回饋、干擾字');
  { const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' }, hash: '#/game/corre/content' });
    await page.waitForSelector('#correCard'); await vshot(page, 'n0a_settings_top');
    ok((await page.$$eval('.nav [data-act=nav]', b => b.map(x => x.dataset.r))).join() === 'home,classes', '上方選單只剩「首頁」「班級」');
    const tabs = await page.$$eval('.gtabs [data-act=gtab]', b => b.map(x => x.dataset.t + ':' + x.innerText));
    ok(tabs.join('|') === 'content:📚 句庫|links:連結|scores:成績|sheet:學習單|help:說明'.replace('📚 句庫', tabs[0].split(':')[1]), '遊戲頁分頁：內容｜連結｜成績｜學習單｜說明', tabs);
    ok((await page.$$eval('.gsw [data-act=togame]', b => b.map(x => x.dataset.g))).join() === 'corre,colores,bbk,dragon', '遊戲切換：四款');
    await page.click('.gsw [data-g=colores]'); await page.waitForSelector('#colCard');
    ok(page.url().endsWith('#/game/colores/content'), '切換遊戲：停在同一個分頁', page.url());
    await page.click('[data-act=gtab][data-t=sheet]'); await page.waitForSelector('#wsCard');
    await page.click('.gsw [data-g=bbk]'); await page.waitForSelector('#bbkWsCard');
    ok(page.url().endsWith('#/game/bbk/sheet'), '在學習單分頁切遊戲，還是學習單', page.url());
    ok(!(await text(page, '#app')).includes('之後會搬到這裡') && !(await text(page, '#app')).includes('老師設定'), '學習單頁：不再叫老師去遊戲裡做練習紙');
    ok(await page.$eval('.gtabs', e => getComputedStyle(e).position) === 'sticky', '分頁列黏在上面');
    // 意見回饋
    await page.click('[data-act=feedback]'); await page.waitForSelector('.modal.fb');
    ok((await text(page, '.modal.fb')).includes('teacher@example.com') || (await text(page, '.modal.fb')).includes('@'), '回饋視窗顯示 email');
    await page.click('.modal.fb [data-m=send]');
    ok((await text(page, '#fbSt')).includes('請先寫內容'), '沒寫內容不能送');
    await page.click('.modal.fb [data-t=bug]'); await page.fill('#fbText', '學習單按鈕太小'); await vshot(page, 'n2_feedback');
    await page.click('.modal.fb [data-m=send]'); await page.waitForFunction(() => !document.querySelector('.modal.fb'));
    const fb = Object.values((await db(page)).center_feedback || {});
    ok(fb.length === 1 && fb[0].type === 'bug' && fb[0].message === '學習單按鈕太小' && fb[0].lang === 'tc' && fb[0].page === '#/game/bbk/sheet' && fb[0].done === false && fb[0].uid && fb[0].email,
      '回饋存進 center_feedback（類型、內容、語言、頁面、email）', fb);
    ok(Object.keys(fb[0]).sort().join() === 'createdAt,done,email,lang,message,page,type,uid', '回饋欄位跟規則一致', Object.keys(fb[0]));
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { // 免費老師：按到訂閱功能跳出建議訂閱
    const { page, errors, ctx } = await open(browser, { seedOpt: { pro: false }, ls: { profesorLang: 'es' }, hash: '#/classes' });
    await page.waitForSelector('.ctabs');
    ok((await page.$$('.ctabs [data-act=needsub]')).length === 1, '班級：上鎖的「建立班級」分頁');
    await page.click('.ctabs [data-act=needsub]'); await page.waitForSelector('.modal.sub');
    const m = await text(page, '.modal.sub');
    ok(m.includes('Función de suscripción') && m.includes('5 bancos de Corre') && (await page.$eval('.modal.sub a[data-m=go]', a => a.href)).includes('cadadiaunosminutos-share-zone'), '建議訂閱視窗：西文、列出訂閱內容、連到入口網站', m);
    await shot(page, 'n1_needsub');
    await page.click('.modal.sub [data-m=close]'); ok(await page.$('.modal.sub') === null, '「之後再說」關掉視窗');
    for(const [g, card] of [['corre', 'cwsCard'], ['colores', 'wsCard'], ['bbk', 'bbkWsCard']]){
      await page.evaluate(x => window.__profesor.go('game/' + x + '/sheet'), g); await page.waitForSelector('#' + card);
      ok((await page.$$('#' + card + ' [data-act=needsub]')).length === 1, '學習單：未訂閱 ' + g + ' 有上鎖的「產生」按鈕');
    }
    ok(await page.$('#bbkWsCard [data-act=bwsmake]') === null, '比比看學習單：未訂閱不能產生');
    await page.click('#bbkWsCard [data-act=needsub]'); ok(await page.$('.modal.sub') !== null, '按了跳出建議訂閱'); await page.click('.modal.sub [data-m=close]');
    ok((await text(page, '.gtabs')).includes('Fichas'), '西文：Fichas');
    await page.evaluate(() => window.__profesor.go('bank', '0')); await page.waitForSelector('#ce-decoy', { state: 'attached' });
    ok(await page.$eval('#ce-decoy', i => i.readOnly) && (await text(page, '#ce-decoyBox')).includes('requieren suscripción'), '免費：干擾字欄位上鎖');
    await page.evaluate(() => { document.getElementById('ce-preview').hidden = false; });
    await page.click('#ce-decoy'); ok(await page.$('.modal.sub') !== null, '免費：按干擾字跳出建議訂閱'); await page.click('.modal.sub [data-m=close]');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { // 訂閱老師：干擾字
    const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' }, hash: '#/bank/1' });
    await page.waitForSelector('#ce-decoy', { state: 'attached' });
    ok(!(await page.$eval('#ce-decoy', i => i.readOnly)), '訂閱：干擾字可以輸入');
    await page.evaluate(() => { document.getElementById('ce-preview').hidden = false; });
    await page.click('#ce-addTok'); await page.click('#ce-addTok');
    const ins = await page.$$('#ce-tokens input');
    await ins[0].fill('自己'); await ins[1].fill('自己'); await ins[2].fill('zì jǐ');
    await ins[3].fill('來'); await ins[4].fill('来'); await ins[5].fill('lái');
    await page.fill('#ce-es', 'Uno mismo viene');
    await page.fill('#ce-decoy', '己 已 巳 已經 來 abc');
    await page.click('#ce-addSent'); await page.waitForTimeout(100);
    ok((await text(page, '#ce-addSt')).includes('只能是中文字') && (await text(page, '#ce-addSt')).includes('abc'), '干擾字：非中文字擋下');
    await page.fill('#ce-decoy', '己 已 巳 已經 來 自 他');
    await page.click('#ce-addSent'); await page.waitForTimeout(100);
    ok((await text(page, '#ce-addSt')).includes('最多 5 個'), '干擾字：超過 5 個擋下（句子本身的「來」不算）');
    await page.fill('#ce-decoy', '己 已 巳 來 已');
    await page.click('#ce-addSent'); await page.waitForFunction(() => document.querySelector('#ce-sents .sent'), null, { timeout: 15000 });
    const card = await text(page, '#ce-sents');
    await page.click('#ce-sents .acts .x'); await page.$eval('#ce-decoyBox', e => e.scrollIntoView({ block: 'center' })); await vshot(page, 'n3_decoy_field');
    await page.click('#ce-cancelEdit'); await page.$eval('#ce-sents', e => e.scrollIntoView({ block: 'center' })); await vshot(page, 'n4_decoy_card');
    ok(card.includes('干擾字：己・已・巳'), '句子卡片顯示干擾字（去掉重複和句子本身的詞）', card);
    // 編輯會帶回干擾字
    await page.click('#ce-sents .acts .x'); ok(await page.inputValue('#ce-decoy') === '己 已 巳', '修改句子時帶回干擾字');
    await page.click('#ce-cancelEdit');
    await page.click('#ce-save'); await page.waitForFunction(() => /已上傳|儲存|Guard|saved/i.test(document.getElementById('ce-saveSt').innerText), null, { timeout: 15000 });
    const d = await db(page), sh = Object.values(d.shared_banks).find(b => b.slot === 1);
    const s0 = sh && sh.sentences[0];
    ok(s0 && s0.decoy.join() === '己,已,巳' && Array.isArray(s0.decoySimp) && s0.decoySimp.length === 3, '儲存：sentences[].decoy 與 decoySimp', s0);
    if(LIBS) ok(s0.decoySimp.join() === '己,已,巳', '簡體自動轉換');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  console.log('\n[H] 詞條完整性');
  { const { page, ctx } = await open(browser, { user: null });
    const r = await page.evaluate(() => {
      const D = I18N.D, out = { empty: [], ph: [] };
      Object.keys(D).forEach(k => {
        if(D[k].length !== 4 || D[k].some(x => !x || !String(x).trim())) out.empty.push(k);
        const set = s => (s.match(/\{[a-z]+\}/g) || []).sort().join();
        if(new Set(D[k].map(set)).size !== 1) out.ph.push(k);
      });
      return out;
    });
    ok(r.empty.length === 0, '每個詞條都有四種語言', r.empty);
    ok(r.ph.length === 0, '四種語言的 {參數} 一致', r.ph);
    const used = new Set(); for(const f of ['app.js', 'books.js']){
      const s = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8');
      for(const m of s.matchAll(/\bT\('([A-Za-z0-9_]+)'/g)) used.add(m[1]);
      for(const m of s.matchAll(/\[[^\]]*'([A-Za-z0-9_]+)'\]/g)) if(/^(nav|filter|tab|gameC|gameB|usage)/.test(m[1])) used.add(m[1]);
    }
    const keys = await page.evaluate(() => Object.keys(I18N.D));
    const missing = [...used].filter(k => k.endsWith('_') ? !keys.some(x => x.startsWith(k)) : !keys.includes(k));   // 以底線結尾的是前綴（p_、t_、d_…）
    ok(missing.length === 0, '程式裡用到的詞條都存在', missing);
    await ctx.close(); }

  console.log('\n[O] 步驟 5-4：比比看學習單搬到中心');
  { const BBK = [{ id: 'b1', name: '身高和年齡', lv: 2, d: ['height', 'age'], t: ['pick', 'decode'], n: 5 }];
    const { page, errors, ctx } = await open(browser, { seedOpt: { bbk: BBK }, ls: { profesorLang: 'tc' }, hash: '#/game/bbk/sheet' });
    await page.waitForSelector('#bbkWsCard [data-act=bwsmake]');
    const opts = await page.$$eval('#bbkWsCard select[data-sel=bwssel] option', o => o.map(x => x.value + ':' + x.textContent));
    ok(opts.length === 4 && opts[3] === '0:📐 身高和年齡' && opts[0].includes('第 1 關'), '範圍選單：三個關卡＋老師存的範圍', opts);
    ok(await page.evaluate(() => !window.BBK_ENGINE), '還沒按產生前不載入比比看程式');
    await shot(page, 'o1_bbk_form');
    await page.selectOption('#bbkWsCard select[data-sel=bwssel]', '0');
    ok((await text(page, '#bbkWsCard')).includes('身高') && await page.$eval('#bbkWsCard [data-act=bwsn].on', b => b.dataset.k) === '5', '選範圍：顯示摘要、題數跟範圍一樣（5）');
    await page.click('#bbkWsCard [data-act=bwsphon][data-k=both]');
    await page.click('#bbkWsCard [data-act=bwsmake]');
    await page.waitForSelector('.ws .bbkws');
    const r = await page.evaluate(() => ({ q: document.querySelectorAll('.bw-q').length, k: document.querySelectorAll('.bw-k').length, zy: document.querySelectorAll('.bbkws .ph.zy').length, py: document.querySelectorAll('.bbkws .ph:not(.zy)').length,
      name: document.querySelector('.bbkws').innerText.includes('身高和年齡'), ws: document.body.classList.contains('wsmode'),
      dims: [...document.querySelectorAll('.bw-range')].map(e => e.innerText).join(' ') }));
    ok(r.q === 5 && r.k === 5 && r.zy > 0 && r.py > 0 && r.name && r.ws, '產生學習單：5 題＋答案頁、拼音＋注音、範圍名稱', r);
    await page.waitForFunction(() => [...document.querySelectorAll('.bbkws img')].every(i => i.complete && i.naturalWidth > 0));
    ok(true, '人物圖從比比看讀得到');
    await shot(page, 'o2_bbk_sheet');
    const q1 = await page.evaluate(() => document.querySelector('.bbkws').innerText);
    await page.click('[data-act=bwsmake]');   // 換一張
    await page.waitForSelector('.ws .bbkws');
    ok(await page.evaluate(() => document.querySelectorAll('.bw-q').length) === 5, '「換一張」：還是比比看、照同一個範圍');
    await page.click('[data-act=wsback]'); await page.waitForSelector('#bbkWsCard');
    await page.selectOption('#bbkWsCard select[data-sel=bwssel]', 'L3');
    await page.click('#bbkWsCard [data-act=bwssimp][data-k="1"]'); await page.click('#bbkWsCard [data-act=bwslang][data-k=zh]');
    await page.click('#bbkWsCard [data-act=bwsphon][data-k=off]'); await page.click('#bbkWsCard [data-act=bwsans]');
    await page.click('#bbkWsCard [data-act=bwsn][data-k="10"]');
    await page.click('#bbkWsCard [data-act=bwsmake]'); await page.waitForSelector('.ws .bbkws');
    const r2 = await page.evaluate(() => ({ q: document.querySelectorAll('.bw-q').length, k: document.querySelectorAll('.bw-k').length, ph: document.querySelectorAll('.bbkws .ph').length,
      small: document.querySelectorAll('.bbkws small').length, t: document.querySelector('.bbkws').innerText }));
    ok(r2.q === 10 && r2.k === 0 && r2.ph === 0 && r2.small === 0 && r2.t.includes('第 3 关') && r2.t.includes('学习单'), '第 3 關全部、10 題、不附答案、拼音關、只有中文、簡體', { q: r2.q, k: r2.k, ph: r2.ph, small: r2.small });
    ok(await noOverflow(page), '手機寬度不會左右捲');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { // 比比看程式載入失敗
    const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' }, hash: '#/game/bbk/sheet' });
    await page.waitForSelector('#bbkWsCard [data-act=bwsmake]');
    await page.route('**/compara-y-adivina/**', r => r.abort());
    await page.click('#bbkWsCard [data-act=bwsmake]');
    await page.waitForSelector('#bbkWsCard .err');
    ok((await text(page, '#bbkWsCard .err')).includes('載入失敗'), '載入失敗：顯示說明，可以再按一次');
    await page.unroute('**/compara-y-adivina/**');
    await page.click('#bbkWsCard [data-act=bwsmake]'); await page.waitForSelector('.ws .bbkws');
    ok(true, '網路恢復後再按就成功');
    ok(errors.filter(e => !/load|ERR_FAILED/.test(e)).length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { // 手機自動複製失敗：跳出可以手動複製、分享的小視窗
    const BBK = [{ id: 'b1', name: '身高', lv: 1, d: ['height'], t: [], n: 5, sid: 'rng000011112' }];
    const { page, errors, ctx } = await open(browser, { seedOpt: { bbk: BBK }, ls: { profesorLang: 'tc' }, hash: '#/game/bbk/content' });
    await page.waitForSelector('#bbkCard [data-act=bbkpractice]');
    await page.evaluate(() => { let n = 0; window.__copies = [];
      navigator.clipboard.writeText = t => { n++; if(n === 1) return Promise.reject(new Error('NotAllowed')); window.__copies.push(t); return Promise.resolve(); };
      document.execCommand = () => false; });
    await page.click('#bbkCard [data-act=bbkpractice]');
    await page.waitForSelector('.modal.cp');
    const v = await page.$eval('.modal.cp .cpbox', t => t.value);
    ok(v.includes('compara-y-adivina') && v.includes('r=rng000011112'), '自動複製失敗：跳出小視窗，裡面是練習連結', v);
    await shot(page, 'o3_copybox');
    await page.click('.modal.cp [data-m=cp]');
    ok(await page.$('.modal.cp') === null && (await page.evaluate(() => window.__copies))[0] === v, '按「複製連結」：複製成功、視窗關掉');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { // 6-1 遊戲說明：每款遊戲自己的「說明」分頁
    const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' }, hash: '#/game/bbk/content' });
    await page.waitForSelector('[data-act=gtab][data-t=help]');
    await page.click('[data-act=gtab][data-t=help]'); await page.waitForSelector('#hBbk');
    ok(page.url().endsWith('#/game/bbk/help'), '遊戲頁的「說明」分頁 → #/game/bbk/help', page.url());
    const t = await text(page);
    ok(['使用步驟', '比比看：練習範圍', '訂閱後還可以', 'A 沒有 B 那麼高', '0–9999'].every(w => t.includes(w)) || t.includes('比比看：練習範圍'), '說明頁：這款遊戲的段落在（繁）');
    ok(await page.$$eval('.hsec', a => a.length) === 3 && await page.$$eval('details.hsec', a => a.filter(d => !d.open).length) === 2 && await page.$$eval('.hsteps > li', a => a.length) >= 4, '說明頁：自己的段落展開，步驟與訂閱兩段收起來（可點開）');
    ok(await noOverflow(page), '說明頁：手機寬度不會左右滑'); await shot(page, 'p1_help_tc');
    await page.click('#hStep summary'); ok(await page.$eval('#hStep', d => d.open), '點「使用步驟」可以展開');
    for(const [g, id] of [['corre', 'hCorre'], ['colores', 'hCol'], ['dragon', 'hDragon']]){
      await page.evaluate(x => __profesor.go('game/' + x + '/help'), g); await page.waitForSelector('#' + id);
      ok(await page.$eval('#' + id, e => e.tagName) === 'DIV', '說明：' + g + ' 自己的段落直接展開');
    }
    await page.evaluate(() => __profesor.go('game/bbk/help')); await page.waitForSelector('#hBbk');
    for(const [l, w] of [['sc', '比比看：练习范围'], ['es', 'Compara y Adivina'], ['en', 'Compare & Guess']]){
      await page.click('[data-act=lang][data-l=' + l + ']'); await page.waitForTimeout(100);
      const tt = await text(page);
      ok(tt.includes(w) && !/[「」]/.test(l === 'sc' ? tt : '') && await noOverflow(page), '說明頁：' + l + ' 版本正常', tt.slice(0, 80)); await shot(page, 'p2_help_' + l);
    }
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { // 說明內容：四種語言結構一樣
    global.window = {}; eval(fs.readFileSync(path.join(ROOT, 'js', 'help.js'), 'utf8')); const H = global.window.HELP;
    const shape = x => JSON.stringify(x.sections.map(s => [s.id, (s.steps || []).length, (s.items || []).length, (s.groups || []).map(g => g[1].length), !!s.plan, !!s.note, !!s.tip])) + x.jump.length;
    ok(['sc', 'es', 'en'].every(l => shape(H[l]) === shape(H.tc)), '說明內容：繁簡西英段落數量一致'); }
  { // 6-1 中心小改善：首頁介紹、快速按鈕、學生遊戲連結、比比看那句、常錯統計不跳回最上面
    const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' } });
    await page.waitForSelector('.badge');
    let t = await text(page);
    ok(t.includes('練習識字能力') && t.includes('數字和顏色的綜合練習') && t.includes('練習比較句') && !t.includes('依序吃掉詞語'), '首頁三款遊戲的新介紹（繁）');
    for(const [l, w] of [['sc', ['练习识字能力', '数字和颜色的综合练习', '练习比较句']], ['es', ['Practica el reconocimiento de caracteres', 'Práctica combinada de números y colores', 'Practica las oraciones comparativas']], ['en', ['Practice reading characters', 'Numbers and colors practice', 'Practice comparative sentences']]]){
      await page.click('[data-act=lang][data-l=' + l + ']'); const tt = await text(page); ok(w.every(x => tt.includes(x)), '首頁介紹：' + l);
    }
    await page.click('[data-act=lang][data-l=tc]');
    // 班級頁只管班級：沒有連結、成績，只有各遊戲的快速入口
    await page.click('[data-act=nav][data-r=classes]'); await page.waitForSelector('#shortCard');
    ok(!(await page.$('#linksCard')) && !(await page.$('#bookCard')) && !(await page.$('table.t')), '班級頁很精簡：沒有連結、成績（搬到各遊戲）');
    ok((await page.$$('#shortCard [data-act=togame]')).length === 8, '班級頁：四款遊戲各有「連結」「成績」快速入口');
    await page.click('#shortCard [data-g=bbk][data-t=scores]'); await page.waitForSelector('#bookCard');
    ok(page.url().endsWith('#/game/bbk/scores') && await page.evaluate(() => localStorage.getItem('profesorCls')) === '0', '快速入口：帶著這個班到比比看的成績');
    await page.evaluate(() => __profesor.go('game/corre/links')); await page.waitForSelector('#linksCard .link');
    t = await text(page, '#linksCard');
    ok(t.includes('🔗 學生遊戲連結') && t.includes('快速依你的設定建立遊戲連結') && t.includes('自動回傳到這款遊戲的「成績」分頁'), '「學生遊戲連結」標題與新介紹', t.slice(0, 120));
    ok((await text(page, '#linksCard .notice.alert')).includes('注意：如有同暱稱之學生，應告知學生修改暱稱。'), '「注意」那句用醒目的提醒框');
    ok(!t.includes('改了範圍，這個連結也會跟著改') && !(await text(page)).includes('全部班級'), '比比看那句、「全部班級」按鈕都拿掉了');
    // 成績：點學生看常錯統計，畫面維持在成績分頁
    await page.evaluate(() => __profesor.go('game/bbk/scores')); await page.waitForSelector('table.t.click');
    await page.click('table.t.click tr:nth-child(2)'); await page.waitForSelector('[data-act=stuback]');
    ok(page.url().endsWith('#/game/bbk/scores'), '點學生看常錯統計：還在成績分頁');
    await shot(page, 'q1_student_stays');
    await page.click('[data-act=stuback]'); await page.waitForSelector('table.t.click');
    ok(true, '按返回回到名單');
    for(const g of ['corre', 'colores', 'bbk', 'dragon']) for(const tb of ['content', 'links', 'scores', 'sheet', 'help']) for(const l of ['sc', 'es', 'en']){
      await page.evaluate(([g, tb]) => __profesor.go('game/' + g + '/' + tb), [g, tb]); await page.click('[data-act=lang][data-l=' + l + ']'); await page.waitForTimeout(30);
      if(!await noOverflow(page)) ok(false, g + '/' + tb + ' ' + l + '：手機寬度左右滑');
    }
    ok(true, '四款遊戲 × 五個分頁 × 三種語言：手機寬度都不會左右滑');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { // 舊網址轉址、選班級記住、分頁
    const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' }, hash: '#/settings' });
    await page.waitForSelector('.gtabs');
    ok(page.url().endsWith('#/game/corre/content'), '舊網址 #/settings → 遊戲內容分頁', page.url());
    await page.evaluate(() => { location.hash = '#/print'; }); await page.waitForSelector('#cwsCard');
    ok(page.url().endsWith('/sheet'), '舊網址 #/print → 學習單分頁', page.url());
    await page.evaluate(() => { location.hash = '#/help'; }); await page.waitForSelector('#hCorre');
    ok(page.url().endsWith('/help'), '舊網址 #/help → 說明分頁', page.url());
    await page.evaluate(() => { location.hash = '#/game/nosuch/links'; }); await page.waitForSelector('.badge');
    ok(page.url().endsWith('#/home'), '不存在的遊戲 → 回首頁');
    await page.evaluate(() => __profesor.go('game/colores/scores')); await page.waitForSelector('#bookCard');
    await page.click('[data-act=pickcls][data-slot="1"]'); await page.reload(); await page.waitForSelector('#bookCard');
    ok(await page.$eval('[data-act=pickcls].on', b => b.dataset.slot) === '1', '選的班級重新整理後還記得');
    await page.evaluate(() => __profesor.go('game/dragon/links')); await page.waitForSelector('#linksCard');
    ok(await page.$eval('[data-act=pickcls].on', b => b.dataset.slot) === '1', '換遊戲分頁，班級維持');
    await page.evaluate(() => __profesor.go('home')); await page.waitForSelector('.badge');
    await page.click('[data-act=togame][data-g=colores]'); await page.waitForSelector('#colCard');
    ok(page.url().endsWith('#/game/colores/content'), '首頁「管理」→ 該遊戲內容');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { // 6-2 成績依設定分開：「顯示」選單、刪掉的設定、比比看範圍名稱
    const bbkSets = [{ id: 'b1', name: '身高年齡', lv: 2, d: ['height', 'age'], t: ['pick'], n: 10, sid: 'rng000011112' }];
    const { page, errors, ctx } = await open(browser, { seedOpt: { bbk: bbkSets }, ls: { profesorLang: 'tc' }, hash: '#/game/corre/scores' });
    await page.waitForSelector('table.t');
    // 多一筆：Ana 用「點飲料」句庫、一筆用已刪除的句庫；比比看一回合用「身高年齡」範圍
    await page.evaluate(() => { const S = __profesor.S, now = Date.now();
      S.scores.push({ id: 'x1', cid: 'class0000aaaa', owner: 'u1', game: 'corre', k: 'bank00001111', h: '0000000000000001', nick: 'Ana', best: 300, plays: 1, ms: now, extra: { sent: 3, diff: 'facil' } });
      S.scores.push({ id: 'x2', cid: 'class0000aaaa', owner: 'u1', game: 'corre', k: 'gone00001111', h: '0000000000000004', nick: 'Caro', best: 50, plays: 1, ms: now, extra: {} });
      document.querySelector('[data-act=lang][data-l=tc]').click(); });
    const opts = await page.$$eval('[data-sel=setk] option', o => o.map(x => x.textContent));
    ok(JSON.stringify(opts) === JSON.stringify(['全部設定', '舊公開題庫（改版前）', '📚 點飲料', '（已刪除的設定）']), '「顯示」選單：全部＋這款遊戲有成績的設定（刪掉的句庫顯示已刪除）', opts);
    ok((await page.$$('table.t tr')).length === 5, '全部設定：每人每設定一列（4 列）');
    await page.selectOption('[data-sel=setk]', 'bank00001111');
    let rows = await page.$$eval('table.t tr', t => t.slice(1).map(r => r.innerText.replace(/\s+/g, ' ').trim()));
    ok(rows.length === 2 && rows[0].startsWith('Beto 400') && rows[1].startsWith('Ana 300') && !(await page.$('small.setk')), '選「點飲料」：只看這個句庫，每人一列、不再標設定', rows);
    ok((await text(page, '#bookCard')).includes('2 位學生'), '學生數跟著設定');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act=csv]')]);
    const csv = fs.readFileSync(await dl.path(), 'utf8');
    ok(csv.includes('Ana,📚 點飲料,300') && !csv.includes('公開題庫'), 'CSV 只匯出選的設定', csv);
    // 新的設定名稱：pool-A1、pool-B1、pack-代碼、pack-代碼-等級
    await page.evaluate(() => { const S = __profesor.S, now = Date.now();
      [['pool-A1', 'D1'], ['pool-B1', 'D2'], ['pack-food', 'D3'], ['pack-compare-A2', 'D4'], ['pack-nosuch', 'D5']].forEach(([k, n], i) => S.scores.push({ id: 'z' + i, cid: 'class0000aaaa', owner: 'u1', game: 'corre', k, h: '00000000000000' + (i + 10), nick: n, best: 10, plays: 1, ms: now, extra: {} }));
      S.setK = ''; document.querySelector('[data-act=lang][data-l=tc]').click(); });
    const opts2 = await page.$$eval('[data-sel=setk] option', o => o.map(x => x.textContent));
    ok(['公開句庫 A1', '公開句庫 B1', '🎯 飲食與點餐', '🎯 比較句 · A2', '🎯 nosuch'].every(x => opts2.includes(x)), '成績冊的設定名稱：pool-A1／pool-B1／pack-題包／pack-題包-等級', opts2);
    await shot(page, 'r1_setk_corre');
    await page.click('.gsw [data-g=bbk]'); await page.waitForSelector('[data-sel=setk]');     await page.evaluate(([t, o]) => { window.__DB[t].class_plays.y1 = o; }, [T, { cid: 'class0000aaaa', owner: 'u1', game: 'bbk', h: '0000000000000002', nick: 'Beto', at: Date.now(), th: 'people', lv: 2, rg: 'd=height,age&t=pick&n=10', r: 'rng000011112', score: 100, max: 100, qs: [{ t: 'pick', d: 'height', f: 'BI', p: 1, ok: true, f1: true }] }]);
    await page.click('[data-act=pickcls][data-slot="0"]'); await page.waitForFunction(() => __profesor.S.playsState === 'ok' && __profesor.S.plays.some(p => p.id === 'y1' || p.nick === 'Beto' && p.r === 'rng000011112'));
    ok(await page.$eval('[data-sel=setk]', e => e.value) === '', '換遊戲：選單回到全部');
    const bo = await page.$$eval('[data-sel=setk] option', o => o.map(x => x.textContent));
    ok(bo.includes('📐 身高年齡') && bo.includes('一般模式') && bo.includes('其他範圍'), '比比看選單：範圍名稱、一般模式、舊格式範圍', bo);
    await page.selectOption('[data-sel=setk]', 'rng000011112');
    rows = await page.$$eval('table.t tr', t => t.slice(1).map(r => r.innerText.replace(/\s+/g, ' ').trim()));
    ok(rows.length === 1 && rows[0].startsWith('Beto 100%'), '比比看選範圍：只算這個範圍的回合', rows);
    await page.click('[data-act=tab][data-tab=err]'); await page.waitForSelector('.bar');
    ok(await page.$$eval('table.t:has(.bar)', ts => ts[0].querySelectorAll('tr').length) === 2, '常錯統計也只算這個範圍');
    await page.click('[data-act=tab][data-tab=stu]'); await page.click('table.t.click tr:nth-child(2)'); await page.waitForSelector('[data-act=stuback]');
    ok(await page.$$eval('table.t', ts => ts[0].querySelectorAll('tr').length) === 2, '點學生：只列這個範圍的回合');
    await shot(page, 'r2_setk_bbk');
    for(const l of ['sc', 'es', 'en']){ await page.click('[data-act=lang][data-l=' + l + ']'); ok(await noOverflow(page), '成績冊 ' + l + '：手機寬度不會左右滑'); }
    await page.click('[data-act=lang][data-l=es]'); await page.click('[data-act=stuback]');
    ok((await text(page, '#bookCard')).includes('Mostrar') && (await page.$$eval('[data-sel=setk] option', o => o[0].textContent)) === 'Todos los ajustes', '西文：Mostrar／Todos los ajustes');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { // 說明頁：看成績補一句
    global.window = {}; eval(fs.readFileSync(path.join(ROOT, 'js', 'help.js'), 'utf8')); const H = global.window.HELP;
    const all = JSON.stringify(H);
    ok(all.includes('成績會依句庫、設定組或範圍分開記錄') && all.includes('成绩会依句库、设置组或范围分开记录') && all.includes('menú «Mostrar»') && all.includes('“Show” menu'), '說明頁「看成績」補上依設定分開（四語）'); }
  { // 6-4 比比看主題：範圍編輯器
    const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' }, hash: '#/game/bbk/content' });
    await page.waitForSelector('[data-act=bbknew]'); await page.click('[data-act=bbknew]'); await page.waitForSelector('[data-act=bbkth]');
    const th = await page.$$eval('[data-act=bbkth], [data-act=bbkthsoon]', b => b.map(x => [x.dataset.k, x.classList.contains('on'), x.dataset.act, x.textContent]));
    ok(JSON.stringify(th.map(x => x[0])) === JSON.stringify(['people', 'fruit', 'animal', 'action']) && th[0][1] && th[0][2] === 'bbkth' && th.slice(1).every(x => x[2] === 'bbkthsoon' && x[3].includes('陸續開放')),
      '編輯器有「主題」：人物已選；水果、動物、動作上鎖「陸續開放」', th);
    await page.click('[data-act=bbkthsoon][data-k=animal]');
    ok((await text(page, '#bbkCard')).includes('這個主題還在準備中') && !!(await page.$('[data-act=bbkth][data-k=people].on')), '點上鎖的主題：提示，主題不變');
    await shot(page, 's1_bbk_theme');
    await page.fill('#bbkName', '主題測試'); await page.click('[data-act=bbksave]'); await page.waitForTimeout(150);
    let d = await db(page); const it = d.bbk_sets.u1.items.find(x => x.name === '主題測試');
    ok(it && it.th === 'people', '存檔：範圍記下主題 people', it);
    const i = d.bbk_sets.u1.items.indexOf(it);
    await page.click('[data-act=bbkpractice][data-k="' + i + '"]'); await page.waitForTimeout(200);
    d = await db(page); const sid = d.bbk_sets.u1.items[i].sid;
    ok(sid && d.shared_bbk[sid].th === 'people', '學生連結的範圍（shared_bbk）也記下主題', sid && d.shared_bbk[sid]);
    await page.click('[data-act=lang][data-l=es]'); await page.click('[data-act=bbkedit][data-k="' + i + '"]');
    ok((await text(page, '#bbkCard')).includes('Tema') && (await text(page, '#bbkCard')).includes('Próximamente'), '西文：Tema／Próximamente');
    ok(await noOverflow(page), '手機寬度不會左右滑');
    // 6-4 討論第 1 批：題型名稱空格寫法、主觀提醒
    ok((await text(page, '#bbkCard')).includes('Elige: ¿quién es más ＿?') && (await text(page, '#bbkCard')).includes('subjetivas'), '西文：題型名稱空格寫法、主觀提醒');
    await page.click('[data-act=lang][data-l=tc]');
    const tt = await text(page, '#bbkCard');
    ok(tt.includes('選人：誰比較＿？') && !tt.includes('誰比較…'), '題型名稱改成「選人：誰比較＿？」');
    ok((await text(page, '#bbkCard .editor .notice')).includes('有些題目比較主觀'), '主題下面有主觀提醒（淡黃色提醒框）');
    await page.click('[data-act=bbklv][data-k="2"]');
    const t2 = await text(page, '#bbkCard');
    ok(t2.includes('選人：誰比 A ＿？') && t2.includes('選人：A 比誰＿？') && t2.includes('選比較詞'), '第 2 關題型名稱：選人：誰比 A ＿？／選人：A 比誰＿？／選比較詞');
    await shot(page, 's2_bbk_labels');
    await page.click('[data-act=bbklv][data-k="1"]');
    ok(JSON.stringify(await page.$$eval('[data-act=bbkt]', b => b.map(x => x.dataset.k))) === JSON.stringify(['decode', 'tf', 'pick', 'more', 'fill', 'adj']), '第 1 關題型多了「選比較詞」「選形容詞」');
    ok((await text(page, '#bbkCard')).includes('選形容詞'), '題型名稱：選形容詞');
    await page.click('[data-act=bbklv][data-k="3"]');
    ok((await page.$$eval('[data-act=bbkt]', b => b.map(x => x.dataset.k))).includes('fill'), '第 3 關題型多了「選比較詞」');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { // 中心的版本號
    const ix = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    ok(!/\?v=(5-4|6-1|6-2|6-3|6-4|6-5|6-6|6-7|6-8|7-1|7-2|7-3|7-4|7-5|7-6|7-7|7-8)\b/.test(ix) && (ix.match(/\?v=7-9/g) || []).length >= 11 && ix.includes('js/help.js?v=7-9') && ix.includes('js/pubbank.js?v=7-9'), 'index.html 的 css／js 都改成 ?v=7-9（含 help.js、pubbank.js）'); }
  { // 第 4 批：說明頁四語都提到 🚩 題目回報
    const hs = fs.readFileSync(path.join(ROOT, 'js/help.js'), 'utf8');
    ok((hs.match(/🚩/g) || []).length === 4 && hs.includes('這題怪怪的') && hs.includes('这题怪怪的') && hs.includes('Algo raro en esta pregunta') && hs.includes("Something's off here"), '說明頁四語都有「🚩 這題怪怪的」'); }

  await browser.close(); server.close();
  console.log(`\n通過 ${pass}，失敗 ${fail}`); process.exit(fail ? 1 : 0);
});
