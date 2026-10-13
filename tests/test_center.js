// 老師管理中心測試（Playwright + 模擬 Firebase）。用法：node tests/test_center.js [截圖資料夾]
let chromium; try{ ({ chromium } = require('playwright')); }catch(e){ ({ chromium } = require('/opt/npm-tools/node_modules/playwright')); }
const fs = require('fs'), path = require('path'), http = require('http');
const ROOT = path.join(__dirname, '..');
const MOCK = fs.readFileSync(path.join(__dirname, 'firebase-mock.js'), 'utf8');
const SHOT = process.argv[2] || null; if(SHOT) fs.mkdirSync(SHOT, { recursive: true });
let pass = 0, fail = 0;
function ok(c, name, extra){ if(c){ pass++; console.log('  ✓', name); } else { fail++; console.log('  ✗', name, extra !== undefined ? '→ ' + JSON.stringify(extra) : ''); } }
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  let f = path.normalize(path.join(ROOT, decodeURIComponent(req.url.split('?')[0])));
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
function seed({ pro = true, expired = false, nocls = false } = {}){
  const s = { [T]: {
    classes: nocls ? {} : { [CID]: { owner: 'u1', slot: 0, name: '週三班', showBoard: false, updatedAt: 1 }, [CID2]: { owner: 'u1', slot: 1, name: '週五班', showBoard: true, updatedAt: 1 } },
    teacher_classes: nocls ? {} : { u1: { slots: { '0': CID, '1': CID2 }, updatedAt: 1 } },
    teacher_banks: { u1: { slots: { '0': 'bank00001111' }, updatedAt: 1 } },
    shared_banks: { bank00001111: { owner: 'u1', slot: 0, name: '點飲料', sentences: [1] } },
    teacher_configs: { u1: { items: [
      { id: 'a1', cfg: { name: '百位數', mode: 'A', rows: 4, cols: 4, hearts: 5, ids: ['red', 'blue'], range: 999 }, sid: 'cfg000011112' },
      { id: 'a2', cfg: { name: '小數字', mode: 'B', rows: 3, cols: 3, hearts: 3, ids: ['red', 'blue'], range: 999 } } ], updatedAt: 1 } },
    class_scores: {
      [CID + '_corre_' + hx(1)]: { cid: CID, owner: 'u1', game: 'corre', h: hx(1), nick: 'Ana', best: 900, plays: 3, lastAt: Date.now() - 1 * day, extra: { sent: 12, diff: 'normal' } },
      [CID + '_corre_' + hx(2)]: { cid: CID, owner: 'u1', game: 'corre', h: hx(2), nick: 'Beto', best: 400, plays: 5, lastAt: Date.now() - 40 * day, extra: { sent: 6, diff: 'dificil' } },
      [CID + '_colores_' + hx(1)]: { cid: CID, owner: 'u1', game: 'colores', h: hx(1), nick: 'Ana', best: 640, plays: 2, lastAt: Date.now() - 2 * day, extra: { secs: 83, cleared: 1 } },
      [CID2 + '_corre_' + hx(9)]: { cid: CID2, owner: 'u1', game: 'corre', h: hx(9), nick: 'Zoe', best: 100, plays: 1, lastAt: Date.now(), extra: { sent: 2, diff: 'facil' } },
      [CID + '_corre_' + hx(3)]: { cid: CID, owner: 'u2', game: 'corre', h: hx(3), nick: '別人老師的學生', best: 5, plays: 1, lastAt: Date.now(), extra: { sent: 1, diff: 'facil' } }
    },
    class_plays: {
      p1: { cid: CID, owner: 'u1', game: 'bbk', h: hx(1), nick: 'Ana', at: Date.now() - 1 * day, th: 'people', lv: 1, rg: '', score: 90, max: 100, qs: qs(10, 8) },
      p2: { cid: CID, owner: 'u1', game: 'bbk', h: hx(1), nick: 'Ana', at: Date.now() - 3 * day, th: 'people', lv: 2, rg: 'd=height,age&t=pick&n=10', score: 70, max: 100, qs: qs(10, 5) },
      p3: { cid: CID, owner: 'u1', game: 'bbk', h: hx(2), nick: 'Beto', at: Date.now() - 45 * day, th: 'people', lv: 1, rg: '', score: 50, max: 100, qs: qs(10, 3) },
      p4: { cid: CID2, owner: 'u1', game: 'bbk', h: hx(9), nick: 'Zoe', at: Date.now(), th: 'people', lv: 1, rg: '', score: 100, max: 100, qs: qs(10, 10) },
      p5: { cid: CID, owner: 'u2', game: 'bbk', h: hx(3), nick: '別人老師的學生', at: Date.now(), th: 'people', lv: 1, rg: '', score: 10, max: 100, qs: qs(10, 1) }
    },
    site_members: {}, site_plans: {} } };
  if(pro) s[T].site_plans.u1 = { plan: 'year', expiresAt: Date.now() + (expired ? -1 : 1) * 30 * day };
  return s;
}
async function open(browser, { seedOpt, user = TEACH, ls = {}, hash = '' } = {}){
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, acceptDownloads: true });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if(m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  page.on('dialog', d => d.accept());
  await page.route('**/*', r => {
    const u = r.request().url();
    if(u.startsWith('http://localhost')) return r.continue();
    if(u.includes('gstatic.com/firebasejs')) return r.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
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
const text = (page, sel = '#app') => page.$eval(sel, e => e.innerText);
const noOverflow = page => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
let BASE;
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
    await page.click('[data-act=login]'); await page.waitForSelector('.nav');
    ok(!!(await db(page)).site_members.u1, '登入後建立 site_members');
    ok(await noOverflow(page), '手機寬度沒有橫向捲動');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  console.log('\n[B] 訂閱老師：首頁與用量');
  { const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' } });
    await page.waitForSelector('.nav'); await page.waitForSelector('.badge');
    const t = await text(page);
    ok(t.includes('訂閱') && t.includes('到期日'), '顯示訂閱與到期日');
    ok(/班級（三款遊戲共用）\s*2 \/ 3/.test(t), '班級用量 2 / 3', t);
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
    await page.click('[data-act=nav][data-r=classes]'); await page.waitForSelector('.slot');
    ok((await page.$$('input[id^=newCls]')).length === 0, '免費沒有建立班級的欄位');
    ok((await text(page)).includes('週三班') && (await text(page)).includes('🔒'), '仍看得到班級，空位上鎖');
    await ctx.close(); }
  { const { page, ctx } = await open(browser, { seedOpt: { expired: true }, ls: { profesorLang: 'tc' } });
    await page.waitForSelector('.badge'); const t = await text(page);
    ok(t.includes('已於') && t.includes('到期') && t.includes('舊的班級與成績仍可查看'), '到期：顯示到期說明');
    await page.click('[data-act=nav][data-r=classes]'); await page.waitForSelector('.slot');
    ok((await page.$$('input[id^=newCls]')).length === 0, '到期不能建立班級');
    await page.click('[data-act=openclass][data-slot="0"]'); await page.waitForSelector('table.t');
    ok((await text(page)).includes('Ana'), '到期仍可查看成績');
    await ctx.close(); }

  console.log('\n[D] 班級：建立、改名、排行榜、刪除');
  { const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' } });
    await page.waitForSelector('.nav'); await page.click('[data-act=nav][data-r=classes]'); await page.waitForSelector('.slot');
    ok((await page.$$('input[id^=newCls]')).length === 1, '還剩 1 個空位可建班');
    await page.click('.slot.empty [data-act=createclass]');
    ok((await text(page)).includes('請輸入班級名稱'), '空名稱不能建立');
    await page.fill('#newCls2', '週末班'); await page.click('.slot.empty [data-act=createclass]');
    await page.waitForSelector('h2:has-text("週末班")');
    let d = await db(page); const cid3 = d.teacher_classes.u1.slots['2'];
    ok(cid3 && d.classes[cid3].owner === 'u1' && d.classes[cid3].slot === 2 && d.classes[cid3].name === '週末班' && d.classes[cid3].showBoard === false, '建班：寫入 classes、teacher_classes（保留原有的班）');
    ok(d.teacher_classes.u1.slots['0'] === CID && d.teacher_classes.u1.slots['1'] === CID2, '原有的班沒被動到');
    ok(Object.keys(d.classes[cid3]).sort().join() === 'name,owner,showBoard,slot,updatedAt', '班級欄位剛好符合規則');
    ok((await text(page)).includes('還沒有成績'), '新班級沒有成績');
    await page.fill('#clsName', '週末進階班'); await page.click('[data-act=classrename]'); await page.waitForSelector('h2:has-text("週末進階班")');
    d = await db(page); ok(d.classes[cid3].name === '週末進階班' && d.classes[cid3].owner === 'u1' && d.classes[cid3].slot === 2, '改名成功、欄位不變');
    await page.click('[data-act=board][data-v="1"]'); await page.waitForTimeout(100);
    d = await db(page); ok(d.classes[cid3].showBoard === true, '排行榜開');
    await page.click('[data-act=board][data-v="0"]'); await page.waitForTimeout(100);
    d = await db(page); ok(d.classes[cid3].showBoard === false, '排行榜關');
    await shot(page, 'd1_class_empty');
    // 刪除有成績的班（週三班）：三款成績全清，別的班、別人的不動
    await page.click('[data-act=nav][data-r=classes]'); await page.waitForSelector('.slot');
    await page.click('[data-act=openclass][data-slot="0"]'); await page.waitForSelector('h2:has-text("週三班")');
    await page.click('[data-act=classdelete]'); await page.waitForSelector('h2:has-text("我的班級")'); await page.waitForTimeout(150);
    d = await db(page);
    ok(!d.classes[CID] && d.classes[CID2] && !d.teacher_classes.u1.slots['0'] && d.teacher_classes.u1.slots['1'] === CID2, '刪班：班級與位置索引都移除，其他班還在');
    ok(!Object.values(d.class_scores).some(r => r.cid === CID && r.owner === 'u1') && !Object.values(d.class_plays).some(r => r.cid === CID && r.owner === 'u1'), '刪班：三款遊戲的成績一起刪除');
    ok(Object.values(d.class_scores).some(r => r.cid === CID2) && Object.values(d.class_plays).some(r => r.cid === CID2), '別的班成績還在');
    ok(Object.values(d.class_scores).some(r => r.owner === 'u2') && Object.values(d.class_plays).some(r => r.owner === 'u2'), '別的老師的資料沒被動到');
    ok(!(await text(page)).includes('週三班'), '列表上不見了');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  console.log('\n[E] 學生連結與 QR');
  { const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' }, hash: '#/class/0' });
    await page.waitForSelector('.link'); await page.waitForSelector('table.t');
    const urls = () => page.$$eval('.url', e => e.map(x => x.textContent));
    let u = await urls();
    ok(u[0] === 'https://wangchiapin.github.io/corre/?class=' + CID, '跑吧：公開題庫連結', u);
    await page.selectOption('[data-sel=correbank]', 'bank00001111'); u = await urls();
    ok(u[0] === 'https://wangchiapin.github.io/corre/?class=' + CID + '&bank=bank00001111', '跑吧：選句庫後帶 &bank=', u);
    ok(u.length === 2 && u[1] === 'https://wangchiapin.github.io/compara-y-adivina/?class=' + CID, '比比看連結（色數還沒選設定組不顯示）', u);
    await page.selectOption('[data-sel=colcfg]', '0'); u = await urls();
    ok(u[1] === 'https://wangchiapin.github.io/pop-colores-numeros/?c=cfg000011112&class=' + CID, '色數：?c=設定碼&class=班級碼', u);
    await page.selectOption('[data-sel=colcfg]', '1');
    ok(await page.$('[data-act=colmake]') !== null, '沒有連結碼的設定組顯示「產生連結」');
    await page.click('[data-act=colmake]'); await page.waitForSelector('.url[data-url=colores]');
    const d = await db(page); const it = d.teacher_configs.u1.items[1];
    ok(/^[a-z0-9]{12}$/.test(it.sid) && d.shared_configs[it.sid].owner === 'u1' && d.shared_configs[it.sid].pro === false && d.shared_configs[it.sid].cfg.name === '小數字', '產生連結碼：寫入 shared_configs 與 teacher_configs', it);
    ok(d.teacher_configs.u1.items[0].sid === 'cfg000011112' && d.teacher_configs.u1.items.length === 2, '其他設定組沒被動到');
    u = await urls(); ok(u[1].includes('?c=' + it.sid + '&class=' + CID), '連結出現', u);
    await page.click('[data-act=qr][data-game=bbk]'); await page.waitForSelector('.modal canvas');
    const cv = await page.$eval('.modal canvas', c => ({ w: c.width, h: c.height, dark: (() => { const x = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for(let i = 0; i < x.length; i += 4) if(x[i] < 60) n++; return n; })() }));
    ok(cv.w === cv.h && cv.w > 200 && cv.dark > 500, 'QR 畫出來了', cv);
    await shot(page, 'e1_qr');
    await page.evaluate(() => { const A = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function(){ window.__dlName = this.download; return A.call(this); }; });
    await Promise.all([page.waitForEvent('download'), page.click('.modal [data-m=dl]')]);
    const dlName = await page.evaluate(() => window.__dlName);   // 無頭瀏覽器對 blob 下載回報的檔名是 download，改看 a.download
    ok(/^qr-bbk-.+\.png$/.test(dlName), 'QR 可下載 PNG', dlName);
    await page.click('.modal [data-m=close]'); ok(await page.$('.modal') === null, '關閉視窗');
    await page.evaluate(() => { window.__copied = null; navigator.clipboard.writeText = async t => { window.__copied = t; }; });
    await page.click('[data-act=copy] >> nth=2'); await page.waitForTimeout(100);
    ok((await page.evaluate(() => window.__copied)) === 'https://wangchiapin.github.io/compara-y-adivina/?class=' + CID, '複製連結');
    await shot(page, 'e2_links');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }
  { const { page, ctx } = await open(browser, { seedOpt: { pro: true }, ls: { profesorLang: 'tc' }, hash: '#/class/1' });
    await page.waitForSelector('.link');
    await page.evaluate(() => { __profesor.S.a.configs = []; }); await page.evaluate(() => document.querySelector('[data-act=lang][data-l=tc]').click());
    ok((await text(page)).includes('還沒有設定組'), '沒有設定組：提示先去建立'); await ctx.close(); }

  console.log('\n[F] 成績簿：跑吧／色數／比比看');
  { const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'tc' }, hash: '#/class/0' });
    await page.waitForSelector('table.t');
    let rows = await page.$$eval('table.t tr', t => t.map(r => r.innerText.replace(/\s+/g, ' ').trim()));
    ok(rows[0].startsWith('暱稱 最高分 次數 詳細 最近'), '欄位：暱稱｜最高分｜次數｜詳細｜最近', rows[0]);
    ok(rows.length === 3 && rows[1].startsWith('Ana 900 3 12 句 · 普通') && rows[2].startsWith('Beto 400 5 6 句 · 困難'), '跑吧：依最高分排序、詳細=句數·難度、別的老師不出現', rows);
    ok(!(await text(page)).includes('別人老師的學生') && !(await text(page)).includes('Zoe'), '別的班、別人的學生不出現');
    await shot(page, 'f1_corre');
    await page.click('[data-act=days][data-d="30"]'); rows = await page.$$eval('table.t tr', t => t.length);
    ok(rows === 2, '最近 30 天篩選（Beto 40 天前，被濾掉）', rows);
    await page.click('[data-act=days][data-d="0"]');
    await page.click('[data-act=game][data-g=colores]');
    rows = await page.$$eval('table.t tr', t => t.map(r => r.innerText.replace(/\s+/g, ' ').trim()));
    ok(rows.length === 2 && rows[1].startsWith('Ana 640 2 用時 1:23 · 全部清除'), '色數：詳細=用時＋清盤', rows);
    await shot(page, 'f2_colores');
    // CSV
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act=csv]')]);
    const csv = fs.readFileSync(await dl.path(), 'utf8');
    ok(csv.charCodeAt(0) === 0xfeff && csv.includes('nickname,best,plays,detail,last') && csv.includes('Ana,640,2,用時 1:23 · 全部清除'), 'CSV 內容（含 BOM）', csv.slice(0, 120));
    // 刪一列
    await page.click('[data-act=game][data-g=corre]'); await page.click('table.t tr:nth-child(3) [data-act=rowdel]'); await page.waitForTimeout(150);
    ok(!Object.keys((await db(page)).class_scores).some(k => k === CID + '_corre_' + hx(2)) && Object.keys((await db(page)).class_scores).includes(CID + '_corre_' + hx(1)), '刪除單列：只刪 Beto 的跑吧成績');
    // 比比看
    await page.click('[data-act=game][data-g=bbk]');
    rows = await page.$$eval('table.t tr', t => t.map(r => r.innerText.replace(/\s+/g, ' ').trim()));
    ok(rows[0].startsWith('暱稱 最高分 次數 詳細 最近'), '比比看學生表欄位同上', rows[0]);
    ok(rows[1].startsWith('Ana 90% 2 第一次就對 65%') && rows[2].startsWith('Beto 50% 1 第一次就對 30%'), '比比看：最高分%、回合數、第一次就對%', rows);
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
    ok(Object.keys((await db(page)).class_scores).includes(CID + '_corre_' + hx(1)), '清空比比看不影響跑吧成績');
    await page.click('[data-act=game][data-g=colores]'); await page.click('[data-act=cleargame]'); await page.waitForTimeout(150);
    ok(!Object.keys((await db(page)).class_scores).some(k => k.includes('_colores_')) && Object.keys((await db(page)).class_scores).includes(CID + '_corre_' + hx(1)), '清空色數：只清色數');
    ok(await noOverflow(page), '沒有橫向捲動');
    ok(errors.length === 0, '沒有頁面錯誤', errors); await ctx.close(); }

  console.log('\n[G] 其他頁面與四語畫面');
  { const { page, errors, ctx } = await open(browser, { ls: { profesorLang: 'en' }, hash: '#/settings' });
    await page.waitForSelector('.card');
    ok((await page.$$eval('a.pill', a => a.map(x => x.href))).join('|').includes('wangchiapin.github.io/corre/teacher/'), '遊戲設定：連回各遊戲原本的設定頁');
    await shot(page, 'g1_settings_en');
    await page.click('[data-act=nav][data-r=print]'); await page.waitForSelector('.card');
    ok((await text(page)).includes('Print'), '列印頁（英文）');
    await page.click('[data-act=lang][data-l=es]'); await page.click('[data-act=nav][data-r=classes]'); await page.waitForSelector('.slot');
    await page.click('[data-act=openclass][data-slot="0"]'); await page.waitForSelector('table.t');
    ok((await text(page)).includes('Enlaces para alumnos') && (await text(page)).includes('Apodo'), '班級頁（西文）');
    await shot(page, 'g2_class_es');
    ok(await noOverflow(page), '西文版沒有橫向捲動');
    await page.click('[data-act=lang][data-l=sc]'); await page.click('[data-act=game][data-g=bbk]'); await page.click('[data-act=tab][data-tab=err]'); await page.waitForSelector('.bar');
    ok((await text(page)).includes('特征与形容词') && (await text(page)).includes('常错统计') && !(await text(page)).includes('特徵與形容詞'), '簡體版常錯統計');
    await shot(page, 'g3_errors_sc');
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

  await browser.close(); server.close();
  console.log(`\n通過 ${pass}，失敗 ${fail}`); process.exit(fail ? 1 : 0);
});
