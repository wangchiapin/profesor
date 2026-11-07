# 老師管理中心 Centro del profesor

> 跑吧！漢字・色數消消樂・比比看・墨龍飛天・把・被・天打雷劈 各遊戲共用的老師端（把／被／天打雷劈預設維修中，由管理者在分享區開關，見下方「把／被」「天打雷劈」）：登入、班級、各遊戲的題庫／連結／成績／學習單／說明

- **網址：** https://wangchiapin.github.io/profesor/
- **Firebase 專案：** 中心專案 subscription-48d3c（跟遊戲同一個）
- **登入方式：** 老師 Google 登入；每位老師只看得到自己的資料
- **介面語言：** 繁體、簡體、西班牙文、英文（右上角切換，記在這台裝置）

## 頁面結構（以遊戲為中心）

上方選單只有「首頁」「班級」。

| 路由 | 內容 |
|---|---|
| `#/home` 首頁 | 方案與到期日、班級用量、各遊戲卡片（用量、「管理」、「開啟遊戲」） |
| `#/classes`、`#/class/N` 班級 | 只管班級：建立（最多 3 班）、改名、排行榜開關、刪除；下方有各遊戲「連結」「成績」的快速入口 |
| `#/game/<corre｜colores｜bbk｜dragon｜ba｜bei>/<分頁>` 遊戲頁 | 上方遊戲切換、黏在上面的分頁：**題庫／設定**（content）｜**連結**（links）｜**成績**（scores）｜**學習單**（sheet）｜**說明**（help） |
| `#/bank/<0-4>` | 跑吧句庫編輯頁 |

- 「連結」「成績」分頁上有「選擇班級」，選的班記在這台裝置（`localStorage` 的 `profesorCls`），換遊戲、換分頁都維持。
- 「說明」分頁：這款遊戲的段落直接展開，「使用步驟」「訂閱後還可以」收合可點開。
- 舊網址 `#/settings`、`#/print`、`#/help` 會自動轉到遊戲頁對應的分頁。
- 成績表欄位一致（暱稱｜最高分｜次數｜詳細｜最近）；比比看多「常錯統計」；全部／7 天／30 天篩選、匯出 CSV、刪除單列、清空這款成績。

## 資料（都在中心專案，不需要新的 Firestore 規則）

| 集合 | 用途 |
|---|---|
| `site_members/{uid}`、`site_plans/{uid}` | 會員、方案（`month`／`year`／`trial`／`pro` 且 `expiresAt` 還沒到才算訂閱） |
| `teacher_classes/{uid}`、`classes/{cid}` | 班級（三款共用，最多 3 班） |
| `class_scores/{cid}_{game}_{k}_{h}` | 跑吧（`corre`）、色數（`colores`）每位學生×每個設定一筆；`k`＝設定名稱：跑吧（公開句庫 `pool-A1`／`pool-A2`／`pool-B1`、題包 `pack-<代碼>` 或 `pack-<代碼>-<等級>`、老師句庫＝句庫碼；改版前的舊公開題庫 `pool`）／色數（設定碼；舊式連結 `link`）（步驟 6-2，規則見 game-kit 的 `subscription-48d3c.rules.txt`） |
| `class_plays/{自動 id}` | 比比看每回合每題的紀錄（把／被另有一種：訂閱老師的句庫班級連結玩完一回合寫一筆 `{cid,owner,game,h,nick,at,k,score,qs[{s,t,f,ok,w[]}]}`，成績冊用它做「最常答錯的句子」「各學生」與「逐題明細 CSV」）；`r`＝範圍碼（一般模式 `''`），成績冊依它分開 |
| `teacher_banks`、`shared_banks` | 跑吧句庫（步驟 4 起在中心編輯） |
| `teacher_configs`、`shared_configs` | 色數設定組（讀；沒有連結碼時，照色數教師區的做法寫入連結碼） |

學生連結格式：

- 跑吧：`corre/?class=<班級碼>&level=A1`（A1／A2／B1）、`&pack=<題包代碼>`（可再加 `&level=`）、或 `&bank=<句庫碼>`（老師自己的句庫）。沒指定等級的舊連結，遊戲會當作 A1
- 色數：`pop-colores-numeros/?c=<設定碼>&class=<班級碼>`（只有 `?class=` 不會進班級模式，一定要帶設定碼）
- 比比看：`compara-y-adivina/?class=<班級碼>`（一般模式）或 `compara-y-adivina/?r=<範圍碼>&class=<班級碼>`（老師範圍）
- 比比看練習連結（不收成績）：`compara-y-adivina/?r=<範圍碼>`

## 比比看練習範圍（步驟 2）

在「遊戲設定」建立、命名、修改、刪除；免費 3 組、訂閱 15 組（到期後超過的仍可改／刪，不能新增）。

- `bbk_sets/{uid}` = `{ items:[{id, name, lv, d, t, n, sid?}], updatedAt }`（d／t 空陣列 = 全部）
- `shared_bbk/{sid}` = `{ owner, name, th, lv, d, t, n, updatedAt }`：學生連結讀這份；按「練習連結」或班級頁「產生連結」才建立
- 有範圍碼的設定一改，`shared_bbk` 跟著改 → 已發出去的連結用新範圍；刪除設定 → 連結退回一般模式
- 特徵與題型清單在 `js/bbk.js`，要跟遊戲（`themes/people.js` 的 dims、`index.html` 的 POOL）一致
- 規則：正本在 game-kit（私人 repo）的 `firebase-rules/``subscription-48d3c.rules.txt`（整份手動貼到 Firebase 主控台）

## 色數設定組與學習單（步驟 3）

- 「遊戲設定」：新增／編輯／刪除色數自訂設定（原「設定組」）、試玩。編輯時整頁只剩編輯畫面（回上一頁｜基本設定｜顏色與數字）。連結分頁的練習連結卡可選「基本色／進階色／基本色＋進階色」（用遊戲支援的 `?t=` 把設定編進網址，不寫資料庫）或自訂設定（`?c=`）。已拿掉「停用連結」。資料跟遊戲教師區同一份（`teacher_configs/{uid}.items[{id,cfg,sid?}]` → `shared_configs/{sid}`），格式完全相同，**不用新規則**。免費 3 組、訂閱 15 組；自訂顏色、自訂數字限訂閱。
- 「學習單」：預覽出現在表單下方，旁邊是「輸出PDF」；「聽讀找色」題目預設老師唸；「著色版」改名「色數著色版」。三種學習單（訂閱限定），從選的設定組隨機產生，可「換一張」：
  - 聽讀找色：彩色色塊板＋國字數字題目（可改「老師唸」），學生寫顏色；可附顏色名稱表
  - 看色寫數：彩色色塊板＋顏色題目，學生用國字寫出那個顏色上的所有數字
  - 著色版：格子印國字數字＋顏色對照表，黑白印就能用；答案頁是塗好的彩色板
  - 學習單字體繁／簡、輔助語言無／西／英、可附答案頁（另起一頁）
- 顏色、數字讀法（國字）、設定格式在 `js/colores.js`，要跟遊戲 `index.html` 一致。

## 其他三款遊戲對齊跑吧的版面（7-27）

- 卡片標題＝分頁名稱（色數「設定組」、比比看「練習範圍」、墨龍「主題與範圍」），額度用小字放在標題旁；列上只有 編輯／試玩／刪除（試玩在還沒有連結碼時會先建立再開啟）。
- 色數、比比看的「連結」分頁多一張「🔗 練習連結」卡（選設定組／範圍 → 複製／QR／試玩，不回傳成績），下面才是班級連結卡；連結網址一律單行、過長以 … 收尾。墨龍「快速連結」改名「公開連結」。
- 色數、比比看編輯器分兩個小分頁（基本設定｜顏色與數字／要考的內容），選項左邊標籤；「停用練習連結」移到色數編輯器內。
- 學習單：墨龍加了預覽與字大小（85／100／120%）；色數、比比看按鈕改為「預覽學習單」「輸出PDF（列印）」。比比看學習單引擎在 compara-y-adivina，預覽字大小需在那邊改。
- 沒有改 Firestore 資料格式。

## 跑吧句庫與學習單（步驟 4）

- 「遊戲設定」：跑吧句庫卡片，5 個位置（免費 1 個、每庫 50 句；訂閱 5 個、每庫 80 句；每句最多 20 字）。每個句庫：編輯、試玩（`corre/?bank=<句庫碼>&preview=1`；複製這個連結給學生也行，成績不回傳）、刪除。分頁名稱「自訂句庫」。
- 編輯頁 `#/bank/<0-4>`：上方三個分頁「設定｜加句子（一句一句／批次建立／公開句庫、主題包）｜句庫內的句子」（分頁列捲動時固定在上方，上傳列固定在下方；新句庫先開設定，已有句子先開句子清單）。干擾字最多 5 個、每個詞不得超過 4 個字（超過會跳提醒）。可做的事：句庫設定、輸入一句自動產生簡體／台灣拼音／翻譯再逐詞微調、批次匯入、從公開題庫（`corre-d16da` 專案，只讀）或主題包（訂閱）挑句、句子清單改／刪、上傳。有沒上傳的修改，離開前會先問。
- 資料跟 `corre/teacher/` 同一份、格式完全相同（`teacher_banks/{uid}.slots` → `shared_banks/{sid}`），規則已在 game-kit 的 `subscription-48d3c.rules.txt`，**不用新規則**。句庫碼建立後不換，所以改句子後已發出的連結自動跟著變。
- 「學習單」：跑吧學習單 PDF（訂閱限定）。來源可選我的句庫／公開句庫／主題包；題數（全部／隨機 10、20 句／自己挑，上限 50 句）；內容可複選：句子總表、排列句子、填空（隨機或老師指定挖詞）、翻譯、連連看、聽寫，有練習的附答案頁；可先預覽；中文字大小 14／16／21 點（預設 14，整頁照比例縮放）。
- 程式在 `js/corre.js`（文字在 `js/corre-text.js`）。繁簡轉換與拼音函式庫（opencc-js、pinyin-pro）第一次按「自動產生」或「批次匯入」才載入。舊的 `corre/teacher/` 頁暫時保留，兩邊改的是同一份資料。

## 步驟 5-1：學習單、快速跳轉、建議訂閱、意見回饋、干擾字

- 學習單在各遊戲頁的「學習單」分頁。
- 遊戲頁用分頁取代原本很長的單頁，分頁列捲動時黏在上方。
- 沒訂閱的老師按到訂閱功能（建立班級、第 2～5 個句庫、超過額度的範圍／設定組、自訂顏色與數字、學習單、干擾字），會跳出「建議訂閱」視窗，連到入口網站。
- 右上角「💬 意見回饋」：類型（建議／問題／其他）＋內容，連同老師 email、介面語言、所在頁面存進 `center_feedback`。Ben 在 stats 頁「訂閱 → 👩‍🏫 老師管理中心回饋」看、標記已處理、刪除、匯出 CSV。規則已含在 game-kit 的 `subscription-48d3c.rules.txt`。
- 跑吧句庫：每一句可以選填「干擾字」（訂閱功能，最多 5 個、每個 1～4 字），存成 `sentences[].decoy`（繁）和 `decoySimp`（自動轉簡）。既有規則不檢查句子內的欄位，所以不用改句庫規則。遊戲讀取干擾字在步驟 5-2 做。
  - 注意：舊的 `corre/teacher/` 頁存檔時會把干擾字拿掉；步驟 5-2 會把它改成自動跳到中心。

## 公開句庫與題包（步驟 7）

- 跑吧！漢字網站（`corre/bank/`）有 `A1.json`、`A2.json`、`B1.json`（每個等級一個檔）和 `packs.json`（題包規則）。老師中心用 `js/pubbank.js` 直接讀這些靜態檔，不用 Firebase。
- **免費版：A1、A2；訂閱版：再加 B1 和主題包。只擋入口**（連結產生器、挑句子的畫面）：免費版選 B1／題包會跳「建議訂閱」，選項維持原樣。檔案本身是公開的。
- 班級頁的跑吧連結「題目來源」：公開句庫 A1／A2／B1、主題包（可再限定等級）、我的句庫。
- 「遊戲設定」頁的「公開句庫連結」：選等級或題包 → 複製連結、QR code、試玩（不收成績，不進公開排行榜）。
- 句庫編輯器「從公開句庫／主題包加入」改讀新句庫：A1、A2 免費、B1 與主題包訂閱。
- 成績冊的設定名稱：`pool-A1`→「公開句庫 A1」、`pack-food-A1`→「🎯 飲食與點餐 · A1」、舊 `pool`→「舊公開題庫（改版前）」。

## 墨龍飛天：主題、練習範圍、班級連結（2026-10-21 已開放）

- 狀態開關：只有老師管理中心這一個（`portalStatus/center-dragon`），遊戲裡的 `RELEASE`、`?dev=1` 已刪除。
- 方案：免費＝練習連結，可用 5 個內建主題（食物、動物、顏色、交通、家裡）；訂閱＝10 個內建主題＋自訂主題（最多 3 個，每個 6～40 詞）＋練習範圍（最多 15 組）＋班級連結（成績進成績冊）＋學習單 PDF。
- 資料：`dragon_sets/{uid}` = `{ themes:[{id,name,words}], sets:[{id,name,builtin,custom,sid?}], updatedAt }`；`shared_dragon/{sid}` = `{ owner, name, builtin, custom:[{id,name,words}], updatedAt }`，學生連結（`?d=<sid>`）讀這份，範圍一改就跟著改。詞的格式 `[繁, 簡, 拼音, 西, 英]`，簡體和拼音用 opencc-js／pinyin-pro 自動產生，可手改。
- 成績：`class_scores` 的 `game='dragon'`，`k`＝主題 id，`extra = {c: 吃對數, a: 飛行高度, wr: 錯字（最多 5 個）}`。
- 規則在 game-kit 的 `subscription-48d3c.rules.txt`（已貼到 subscription-48d3c）：`class_scores` 加 `'dragon'`、新增 `dragon_sets`、`shared_dragon`。
- 開放時做過：① 貼規則 ② 遊戲 `RELEASE=true` ③ 中心 `READY=true` ④ 分享區卡片與訂閱比較表換成正式文字。

## 天打雷劈：自訂字庫、練習連結、班級連結、成績冊（2026-11-06）

- 遊戲代號 `rayo`（網址在 `data.js` 的 `GAME_URL`：`cuidado-con-el-rayo`），預設維修中（`data.js` 預設 `acct.maint.rayo = true`，開關在分享區 `stats.html#sub`，清單 `CS` 有一列；遊戲端 `portalStatus/center-rayo`：沒有文件＝維修中、`off:false`＝開放）。
- 程式：`js/rayo.js`（`window.RAYO`：字庫整理、讀音轉換、連結設定、成績冊表格／CSV）＋ `app.js`（分頁畫面）＋ `data.js`（資料讀寫）。分頁：⚡ 自訂字庫｜連結｜成績｜學習單（之後開放）｜說明。
- 資料：`rayo_sets/{uid}` = `{ banks:[{id,name,chars:["繁\t簡\t讀音碼逗號\t內建以外1/0"],sid?}], updatedAt }`（免費 1 個 70 字、訂閱 5 個 150 字、管理員放寬）；`shared_rayo/{sid}` = `{ owner,name,chars,updatedAt }`（任何人讀單筆；字庫一改，已發出去的連結自動換新內容）。Firestore 不收「陣列裡再放陣列」，所以每個字存成一個字串。
- 字庫：從內建 1384 字（`words.json`，由遊戲 repo 讀來）依級別挑、貼課文找字、加內建以外的字（讀音老師自己輸入，`wo3` 或 `wǒ` 都可以，多音字逗號隔開，最多 3 個）；內建字的讀音預設照 GoodTeacher，每個字庫可以改（只影響那個字庫）。每個字庫至少 10 字。
- 連結：練習連結 `?b=字庫碼`（免費）；班級連結 `?class=班級碼[&b=][&lv=][&n=][&kb=]`（訂閱）。班級連結可鎖定難度（自訂字庫只有簡單／普通）、題數（10～30，每 5 一檔，不能超過字庫字數）、鍵盤；沒鎖＝學生自己選。
- 成績：`class_scores` 的 `game='rayo'`，`k＝難度_題數_鍵盤[_字庫碼前 8 碼]`，`best＝(題數−被劈)×100000＋(99999−秒數)`，`extra＝{s 被劈,c 答對,t 秒,st 星,n 題數}`；逐題紀錄 `class_plays`（`game='rayo'`，`qs=[{c,ok}]`、`score`＝答對題數）。成績冊：可依「設定」篩選；欄位＝暱稱、班級、設定、最好成績（被劈／答對）、用時、星、次數、最近一次、常錯的字（學生與整班排名）；同設定才比排名；匯出 CSV 欄位相同。
- **班級連線房間（2026-11-07）**：「連結」分頁的班級連結下面多一塊 `rayoRoomHtml`：開房連結＝班級連結＋`&host=1`；固定房號存在班級資料 `classes/{cid}.rc`（5000～9999 的字串，選填，`saveClass` 有值才寫；規則 `okClass` 已放行）；加入連結＝`GAME_URL.rayo?room=房號`。房間最多 35 人（遊戲端寫 `mx=35`、`cid`、`bs`），學生玩完自己把成績寫進 `class_scores`，設定代碼 `room-難度_題數_鍵盤[_字庫碼]`（`RAYO.parseK` 會認 `room-` 前綴，`kLabel` 前面加 👥）。
- **學習單（2026-11-07，訂閱限定）**：`js/rayo-ws.js`（`window.RAYO_WS.makeWorksheet(words, opt)`，canvas 畫 A4 圖片頁再包成 PDF，做法同墨龍）＋ `app.js` 的 `rwsFormHtml`／`rwsmake`。字的來源三種：我的字庫（選一個）／內建字庫依級別（N1～L5 可複選，要讀遊戲的 `words.json`）／自己挑字（貼文字，最多 50 個，從內建字庫和老師的字庫裡找）；字數 10／20／30／50；題型可複選：看字寫拼音、看字寫注音、拼音補聲調；另有「附字表」（字、拼音、注音，可選顯示哪種）和「答案頁」；字體繁／簡、輔助語言（只有中文／＋西／＋英）、字大小 14／16／18；預覽有「換一張」。讀音一律用字庫裡的（GoodTeacher）。只用資料、不碰 Firebase 規則。
- 規則：game-kit 的 `subscription-48d3c.rules.txt`（`class_scores`／`class_plays` 加 rayo、新增 `rayo_sets`、`shared_rayo`）與 `memorma-24dab.rules.txt`（連線房間 30 題、`bn`／`bk`）；**改完要整份貼進 Firebase**。
- 遊戲端細節在遊戲 repo 的 README「老師連結」一節。

## 把／被（2026-10-29 步驟 1：入口、班級連結、成績）

- 兩款遊戲用同一套邏輯：`app.js` 的 `isBaBei(g)`；遊戲代號 `ba`、`bei`（網址在 `data.js` 的 `GAME_URL`）。
- 開關：把／被預設「維修中」（`data.js` 預設 `acct.maint.ba/bei = true`）。管理者到 cadadiaunosminutos-share-zone 的 `stats.html` →「🔧 老師管理中心遊戲開關」切換（寫入 `portalStatus/center-ba`、`center-bei`）；管理員與網址 `?dev=ba,bei` 仍可先看。遊戲本身已不再有自己的開關（`BABEI_READY`、`CLS_RELEASE` 已刪）。**開放前要做**：規則 `class_scores` 收 `ba`／`bei` 已包含在 game-kit 正本，2026-10-29 已貼進 Firebase（開放前再確認一次），然後在開關頁把把／被打開。
- 規則：不再有 `firestore-rules-babei.txt`（2026-10-29 刪除）；一律用 game-kit `firebase-rules/subscription-48d3c.rules.txt`，它含 `game_reports`（把／被／聲調偵探 `tonos` 回報）。
- 練習連結＝遊戲網址（不回傳成績）；班級連結＝`?class=班級碼`（要訂閱才能建班級）。
- 成績：`class_scores` 的 `game='ba'`／`'bei'`，`k='lv1'|'lv2'|'lv3'`（第幾關；把有 3 關、被有 4 關，遊戲端被會送 `lv4`；成績冊 `setLabel` 依遊戲認 lv1～lv3（把）／lv1～lv4（被），認不得的代號才顯示「已刪除」。遊戲以後新增關卡時，這裡要一起改），`best`＝該關最高分，`extra = {ok: 答對題數, q: 題數, f: 第一次就對的題數}`。成績冊沿用既有表格，「詳細」欄顯示「答對 ok / q 題」。
- 遊戲端（`practica-de-ba-oracion`、`practica-de-bei-oracion` 的 `index.html`，「班級模式」區塊）：連結帶 `?class=` 才啟動；成績存到中央專案、不寫原本的公開排行榜；老師開了「班級排行榜」就在結果頁顯示。
- 遊戲首頁（練習連結才有，班級連結與 `?preview` 不顯示）有「老師管理中心」按鈕，連到 `#/home`。
- **積木組句**（把、被；訂閱限定）：句庫編輯頁多一個「積木組句」分頁，從選單組出一句並存成句庫的自訂句子（`{tk,es,en,bl}`；`bl` 只是配方，不存圖）。把：選人物、物品、地點，`bl:'人物.物品.地點'`；被：選動作、物品（＝一個事件）、人物（可不指定），`bl:'事件.人物'`，句子是「物品 被 (誰) 動作 了」，沒指定人物時圖用遊戲原本那句的人物。選項來自遊戲網站的 `blocks.json`（各遊戲 `tools/make_blocks.py` 產生並實際畫過每個組合；中文詞與讀音取自遊戲現有句子＝GoodTeacher；把的西英文與組合手寫在 `tools/blocks_data.py`，被的西英文取自遊戲現有的肯定句、少數沒有被動說法的句子補在 `PATCH`）。遊戲端把用 `sceneP`、被用 `sceneM`／`sceneD` 現場畫出「結果」的圖，當成有圖的自訂句（看圖排卡片／聽句選圖／看圖選句子）；不佔圖片額度、不用新規則。被只做肯定句「了」；否定（沒被）和第 4 關（會被／不要被）先不做。
- **把／被學習單**（訂閱限定，`js/app.js` 的 `baw*`）：重用跑吧的排版引擎 `CORRE.makeWorksheet`（頁尾用 `opt.footer`）。來源＝遊戲內建句子（全部／某一關）或自訂句庫；句子與逐詞拼音來自遊戲網站的 `sentences.json`＋`sentences-tk.json`（後者由遊戲 `tools/make_sentences.py` 一起產生）。題型：句子總表、排列、填空（預設挖掉把／被）、翻譯；不做連連看、聽寫；句子圖片不進學習單。不寫資料庫、不用新規則。
- **自訂句庫（7-47，自己寫句子 7-48）**：可從遊戲現有句子挑（存句子編號 `ids`），也可自己寫句子（存 `custom:[{tk:['繁|簡|拼音|注音',…],es,en}]`，沒有圖，遊戲出文字題）；兩者合計算額度。自己寫的格式「詞 詞 詞｜西文｜英文」，把庫必含把、被庫必含被，≤8 詞／詞≤6 字／句≤25 字、只收漢字，不合格擋存檔；讀音預設用 `js/gtread.js` 讀 corre 的 `gt-readings.json`（GoodTeacher 規則，載入失敗就報錯不用備援），老師可逐詞改拼音，只影響該句庫該句。規則的 `shared_babanks` 要含選填 `custom`（見 game-kit 規則檔）。
- **句庫題數與題型比例（7-49）**：訂閱老師在句庫「設定」分頁選題數 10／20／30、比例（orig 照原本／even 平均／A／L／P 多哪一種），存在 `shared_babanks` 的選填 `cfg:{n,mix}`（預設 10＋orig 就不存；免費或到期只能預設，規則也擋）。遊戲端 `bankQs()` 照 cfg 出題（原本比例：把 5/3/2、被 4/3/3，按題數放大），句子不夠就重複出現但盡量換題型；星星按答對比例算。
- **自訂句子的圖片（7-49）**：訂閱老師每句可加 1 張圖（`app.js` `baImgCompress` 裁正方形、壓到 ≤50KB 的 JPEG），每庫最多 20 張，存在 `shared_babimgs/{句庫碼}_{1|2}` = `{owner, imgs:{圖片代號:dataURL}, updatedAt}`（每份最多 10 張，學生匿名可讀、只有訂閱老師本人能寫；規則在 game-kit 規則檔，**要貼進 Firebase**）；句子的 `custom[].im` = 「1或2＋圖片代號」。圖只在圖片有增減時才寫；刪句庫、刪光圖時一起刪。**額度風險**：所有遊戲共用 subscription-48d3c 專案的免費額度（每天讀 5 萬次、每月傳出 10GB），一輪約讀 3 次、下載約 1.3MB，所以遊戲端用 localStorage 記住圖片（版本＝句庫文件的 updatedAt），要定期到 Firebase 後台看用量。資料：`teacher_babanks/{uid}` = `{ ba:{'0'..'4':sid}, bei:{…}, updatedAt }`、`shared_babanks/{sid}` = `{ owner, game, slot, name, ids[], updatedAt }`（學生匿名可讀、本人才能寫；規則在 game-kit `subscription-48d3c.rules.txt`，**要整份貼進 Firebase**）。額度：把、被各自算，免費 1 個／每庫 10～50 句，訂閱 5 個／10～80 句。老師端：遊戲頁「自訂句庫」分頁（`app.js` 的 `baBankCardHtml`／`babEditorHtml`，編輯頁分頁「設定｜挑句子｜句庫內的句子」，只顯示文字、不顯示圖）；句子清單來自遊戲 repo 的 `sentences.json`（`tools/make_sentences.py` 從 `index.html` 的 `DATA` 產生，遊戲測試會檢查有沒有過期；**遊戲句子有增減時要重新執行**）。連結：試玩 `?bank=<句庫碼>&preview=1`（不記成績）；班級連結 `?class=<班級碼>&bank=<句庫碼>`，成績 `class_scores.k` ＝句庫碼，成績冊 `setLabel` 顯示「📚 句庫名」。遊戲端句庫模式見兩個遊戲 README。
- 測試：`node tests/test_babei.js`（老師中心）、`node tests/test_babei_games.js`（兩個遊戲，要放在旁邊的資料夾）。

## 檔案

```
index.html        外殼
css/style.css     無印風格咖啡色、膠囊按鈕
js/i18n.js        四語詞條（每個詞條 = [繁, 简, es, en]）
js/data.js        Firebase：登入、方案、班級、成績、比比看範圍
js/bbk.js         比比看的特徵／題型清單與範圍草稿
js/colores.js     色數的顏色、數字、設定格式與三種學習單
js/dragon.js      墨龍飛天：主題、練習範圍、學習單（READY 開關）
js/pubbank.js     公開句庫（A1／A2／B1、題包）的讀取
js/corre.js       跑吧句庫編輯器、句庫 QR、學習單 PDF
js/corre-text.js  句庫編輯器的四語文字
js/books.js       成績簿表格與比比看常錯統計（只產生 HTML）
js/app.js         畫面與操作
js/qrcode.js      qrcode-generator 1.4.4（MIT，Kazuhiko Arase）
（規則檔已全部移到 game-kit 的 firebase-rules/，這裡不再放）
tests/            Playwright 測試（模擬 Firebase，不會碰真的資料庫）
```

## 測試

```
npm i -D playwright && npx playwright install chromium   # 第一次
node tests/test_center.js [截圖資料夾]   # 需要旁邊有 corre、compara-y-adivina、cuidado-con-el-rayo 三個 repo（天打雷劈用 RAYO_DIR 指定）
node tests/test_dragon.js [截圖資料夾]   # 墨龍（需 CORRE_LIBS，遊戲 repo 在旁邊的 el-dragon-de-tinta）
```

「自動產生」的測試要本機有 `opencc-js@1.4.1`、`pinyin-pro@3.20.0`（`npm i` 在這個資料夾，或用環境變數 `CORRE_LIBS` 指到有 node_modules 的資料夾）；沒有的話會自動略過那幾項。

測試用 `tests/firebase-mock.js` 取代 Firebase，涵蓋：四語、免費／訂閱／到期、建班／改名／排行榜／刪班（含連帶刪成績）、三款連結與 QR、比比看範圍（新增／編輯／刪除／額度／範圍碼）、學習單改名與快速跳轉、建議訂閱視窗、意見回饋、干擾字、跑吧句庫（建立／自動產生／批次／題庫與主題包／改／存／刪、額度、到期、學習單 PDF）、三款成績簿、常錯統計、CSV、詞條完整性、手機寬度不橫向捲動。

**沒有涵蓋：** Firestore 安全規則（模擬器不驗規則）。請用非管理員的 Gmail 在實機測一次：建班、改名、刪班、色數「產生連結」、比比看範圍「儲存」「練習連結」，並用另一支手機（沒登入）打開範圍連結。

## 墨龍分頁對齊跑吧、學習單設定統一（7-35）
- 墨龍：分頁「🐉 自訂字庫」「🎯 練習範圍」「連結」…；兩者都是清單＋整頁編輯（上面一列 回上一頁｜基本設定｜字詞表／要練的主題），路由 `#/game/dragon/ranges`。
- 各遊戲學習單的「語言」「拼音／注音」改成比比看那樣：語言 中文＋Español／中文＋English（／只有中文），拼音／注音 四選一。跑吧、墨龍內部仍存 pinyin／zhuyin 兩個開關，色數新增 `W.phon`。
- 色數學習單的拼音／注音用 `CORRE.pinyinOf` 一個字一個字查（台灣讀音，只會用到數字字與顏色字），再用 `CORRE.ZY.conv` 轉注音，以 `<ruby>` 印在字上；預設不顯示。
- 跑吧學習單的語言沒有「只有中文」（翻譯、字典題型需要翻譯）。
- 7-37：墨龍「練習範圍」改成清單列下展開編輯（一次只開一個、儲存／取消後收起）；自訂字庫編輯分頁「建立字庫｜字詞表」，按鈕「更新字詞表」；儲存時會先依輸入框更新字詞表，表格裡改的西文／英文會同步回輸入框。
- 7-41：墨龍學習單題型改成可勾選：配對、翻譯（中翻外語／外語翻中）、選擇、聽寫、造句；另有「附單字表」（完整單字表放在答案頁後面）。造句答案只寫「略」；只有中文時翻譯、選擇、配對不能用。`DR.makeWorksheet(themes, { types, list, answers, … })`。
- 7-43：墨龍學習單加「混合出題」（在「附單字表」前面；順序＝混合出題、附單字表、附答案頁）：把勾選的主題合成一組隨機出題，題數不變；單字表仍照主題分段。只有勾 2 個以上主題才有作用。

### 7-46：遊戲維修開關
- 中央 Firebase 的 `portalStatus` 集合，文件 `center-corre / center-colores / center-bbk / center-dragon`，`{off:true}` ＝ 維修中；沒有文件＝開放（把、被例外：沒有文件＝維修中）。
- 一般老師（2026-10-29 改）：首頁和班級頁的卡片照常顯示、版面不變，只是變淡色（名稱前加 🔧）；點下去只跳出「🔧 維修中」，進不去。管理者（a2224907@gmail.com，已驗證）照常使用，並看到「只有你看得到」的提示。
- 學生端（2026-10-29 改）：維修中時，六款遊戲的班級／練習／範圍連結都顯示「🔧 維修中」、不能玩、不記成績（網址加 `?preview` 的老師預覽不受影響；讀不到開關就放行）。公開頁（沒有連結參數）不受影響。
- 開關放在 share-zone 的 stats.html#sub →「老師管理中心遊戲開關」。`?dev=<遊戲>` 仍可讓老師中心當次覆寫（只影響老師端畫面，學生連結不受影響）。
- 清掉用不到的舊字串（dragonQuickHint*、colLinkOff 等）。

### 新增遊戲到老師管理中心時（必做）
- 遊戲代號要加進 `GAME_IDS`，維修開關才管得到（`portalStatus/center-<id>`）。
- 同時到 share-zone 的 `stats.html#sub`「老師管理中心遊戲開關」清單（`CS`）加一列，不然開關裡看不到這款遊戲。
- 新遊戲還沒做好之前，先在開關勾維修中；做好再取消。
- 遊戲介面頁要加「老師管理中心」按鈕。

### 管理員（無限制）模式（2026-11-02）
- 只有 `a2224907@gmail.com` 且信箱已驗證（與 stats.html 的管理員相同）才會啟用：`loadAccount` 設 `adminMode`，方案顯示「管理員（無限制）」，所有訂閱判斷視為有效。
- 上限放寬（不是真的無限，是寬鬆）：班級 30、每款句庫 30 個、自訂句子 300、色數／比比看組數 100、墨龍主題 30／單字 200、把／被圖片最多 90 張（9 份文件，每份 ≤50KB 的限制不變）。色數自訂顏色仍是 12（遊戲設計限制）。
- 常數集中在 `data.js` 的 `ADM`；各處用 `DATA.MAX_CLASSES`、`DRAGON.MAX_T/MAX_W/MAX_SETS`、`CORRE.PRO_SLOTS` 等 getter 讀取。
- Firestore 規則不用改：規則的 `isAdmin()`＋全域 admin 規則本來就讓管理員寫入不受限。學生端寫入（class_scores、class_plays）與讀取付費句庫看的是**老師的 `site_plans/{uid}`**，所以管理員要有一筆長期有效的方案文件（plan `pro`，expiresAt 設很遠，如 2099）。
- 遊戲端（跑吧、墨龍、把、被）也放寬：自訂句子 300、圖片代碼 1～9、墨龍主題／單字上限。
