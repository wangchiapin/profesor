# 老師管理中心 Centro del profesor

> 跑吧！漢字・色數消消樂・比比看・墨龍飛天 四款遊戲共用的老師端：登入、班級、各遊戲的題庫／連結／成績／學習單／說明

- **網址：** https://wangchiapin.github.io/profesor/
- **Firebase 專案：** 中心專案 subscription-48d3c（跟遊戲同一個）
- **登入方式：** 老師 Google 登入；每位老師只看得到自己的資料
- **介面語言：** 繁體、簡體、西班牙文、英文（右上角切換，記在這台裝置）

## 頁面結構（以遊戲為中心）

上方選單只有「首頁」「班級」。

| 路由 | 內容 |
|---|---|
| `#/home` 首頁 | 方案與到期日、班級用量、四款遊戲卡片（用量、「管理」、「開啟遊戲」） |
| `#/classes`、`#/class/N` 班級 | 只管班級：建立（最多 3 班）、改名、排行榜開關、刪除；下方有各遊戲「連結」「成績」的快速入口 |
| `#/game/<corre｜colores｜bbk｜dragon>/<分頁>` 遊戲頁 | 上方遊戲切換、黏在上面的分頁：**題庫／設定**（content）｜**連結**（links）｜**成績**（scores）｜**學習單**（sheet）｜**說明**（help） |
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
| `class_scores/{cid}_{game}_{k}_{h}` | 跑吧（`corre`）、色數（`colores`）每位學生×每個設定一筆；`k`＝設定名稱：跑吧（公開句庫 `pool-A1`／`pool-A2`／`pool-B1`、題包 `pack-<代碼>` 或 `pack-<代碼>-<等級>`、老師句庫＝句庫碼；改版前的舊公開題庫 `pool`）／色數（設定碼；舊式連結 `link`）（步驟 6-2，規則見 `firestore-rules-step6-2.txt`） |
| `class_plays/{自動 id}` | 比比看每回合每題的紀錄；`r`＝範圍碼（一般模式 `''`），成績冊依它分開 |
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
- 規則：`firestore-rules-step2.txt`（要手動貼到 Firebase 主控台）

## 色數設定組與學習單（步驟 3）

- 「遊戲設定」：新增／編輯／刪除色數設定組、練習連結（`?c=`）、停用連結、試玩。資料跟遊戲教師區同一份（`teacher_configs/{uid}.items[{id,cfg,sid?}]` → `shared_configs/{sid}`），格式完全相同，**不用新規則**。免費 3 組、訂閱 15 組；自訂顏色、自訂數字限訂閱。
- 「列印」：三種學習單（訂閱限定），從選的設定組隨機產生，可「換一張」：
  - 聽讀找色：彩色色塊板＋國字數字題目（可改「老師唸」），學生寫顏色；可附顏色名稱表
  - 看色寫數：彩色色塊板＋顏色題目，學生用國字寫出那個顏色上的所有數字
  - 著色版：格子印國字數字＋顏色對照表，黑白印就能用；答案頁是塗好的彩色板
  - 學習單字體繁／簡、輔助語言無／西／英、可附答案頁（另起一頁）
- 顏色、數字讀法（國字）、設定格式在 `js/colores.js`，要跟遊戲 `index.html` 一致。

## 跑吧句庫與學習單（步驟 4）

- 「遊戲設定」：跑吧句庫卡片，5 個位置（免費 1 個、每庫 50 句；訂閱 5 個、每庫 80 句；每句最多 20 字）。每個句庫：編輯、練習連結（`corre/?bank=<句庫碼>`，成績不回傳）、QR（下面印句庫名稱）、試玩（`&preview=1`）、刪除。
- 編輯頁 `#/bank/<0-4>`：句庫設定、輸入一句自動產生簡體／台灣拼音／翻譯再逐詞微調、批次匯入、從公開題庫（`corre-d16da` 專案，只讀）或主題包（訂閱）挑句、句子清單改／刪、上傳。有沒上傳的修改，離開前會先問。
- 資料跟 `corre/teacher/` 同一份、格式完全相同（`teacher_banks/{uid}.slots` → `shared_banks/{sid}`），規則在 `corre/teacher/firestore.rules.txt`，**不用新規則**。句庫碼建立後不換，所以改句子後已發出的連結自動跟著變。
- 「列印」：跑吧學習單 PDF（訂閱限定），選句庫、西／英翻譯、拼音／注音、排列句子＋答案頁。
- 程式在 `js/corre.js`（文字在 `js/corre-text.js`）。繁簡轉換與拼音函式庫（opencc-js、pinyin-pro）第一次按「自動產生」或「批次匯入」才載入。舊的 `corre/teacher/` 頁暫時保留，兩邊改的是同一份資料。

## 步驟 5-1：學習單、快速跳轉、建議訂閱、意見回饋、干擾字

- 學習單在各遊戲頁的「學習單」分頁。
- 遊戲頁用分頁取代原本很長的單頁，分頁列捲動時黏在上方。
- 沒訂閱的老師按到訂閱功能（建立班級、第 2～5 個句庫、超過額度的範圍／設定組、自訂顏色與數字、學習單、干擾字），會跳出「建議訂閱」視窗，連到入口網站。
- 右上角「💬 意見回饋」：類型（建議／問題／其他）＋內容，連同老師 email、介面語言、所在頁面存進 `center_feedback`。Ben 在 stats 頁「訂閱 → 👩‍🏫 老師管理中心回饋」看、標記已處理、刪除、匯出 CSV。**要先貼 `firestore-rules-step5-1.txt`。**
- 跑吧句庫：每一句可以選填「干擾字」（訂閱功能，最多 5 個、每個 1～4 字），存成 `sentences[].decoy`（繁）和 `decoySimp`（自動轉簡）。既有規則不檢查句子內的欄位，所以不用改句庫規則。遊戲讀取干擾字在步驟 5-2 做。
  - 注意：舊的 `corre/teacher/` 頁存檔時會把干擾字拿掉；步驟 5-2 會把它改成自動跳到中心。

## 公開句庫與題包（步驟 7）

- 跑吧！漢字網站（`corre/bank/`）有 `A1.json`、`A2.json`、`B1.json`（每個等級一個檔）和 `packs.json`（題包規則）。老師中心用 `js/pubbank.js` 直接讀這些靜態檔，不用 Firebase。
- **免費版：A1、A2；訂閱版：再加 B1 和主題包。只擋入口**（連結產生器、挑句子的畫面）：免費版選 B1／題包會跳「建議訂閱」，選項維持原樣。檔案本身是公開的。
- 班級頁的跑吧連結「題目來源」：公開句庫 A1／A2／B1、主題包（可再限定等級）、我的句庫。
- 「遊戲設定」頁的「公開句庫練習連結」：選等級或題包 → 複製連結、QR code、試玩（不收成績，不進公開排行榜）。
- 句庫編輯器「從公開句庫／主題包加入」改讀新句庫：A1、A2 免費、B1 與主題包訂閱。
- 成績冊的設定名稱：`pool-A1`→「公開句庫 A1」、`pack-food-A1`→「🎯 飲食與點餐 · A1」、舊 `pool`→「舊公開題庫（改版前）」。

## 墨龍飛天：主題、練習範圍、班級連結（2026-10-21 已開放）

- 狀態開關：`js/dragon.js` 的 `READY=true`（已開放）。要暫時改回「🔧 維修中」就改成 `false`；網址帶 `?dev=dragon` 仍可測試（同一個分頁會記住）。遊戲那邊對應的是 `RELEASE`。
- 方案：免費＝練習連結，可用 5 個內建主題（食物、動物、顏色、交通、家裡）；訂閱＝10 個內建主題＋自訂主題（最多 3 個，每個 6～40 詞）＋練習範圍（最多 15 組）＋班級連結（成績進成績冊）＋學習單 PDF。
- 資料：`dragon_sets/{uid}` = `{ themes:[{id,name,words}], sets:[{id,name,builtin,custom,sid?}], updatedAt }`；`shared_dragon/{sid}` = `{ owner, name, builtin, custom:[{id,name,words}], updatedAt }`，學生連結（`?d=<sid>`）讀這份，範圍一改就跟著改。詞的格式 `[繁, 簡, 拼音, 西, 英]`，簡體和拼音用 opencc-js／pinyin-pro 自動產生，可手改。
- 成績：`class_scores` 的 `game='dragon'`，`k`＝主題 id，`extra = {c: 吃對數, a: 飛行高度, wr: 錯字（最多 5 個）}`。
- 規則在 `firestore-rules-dragon.txt`（完整版，已貼到 subscription-48d3c）：`class_scores` 加 `'dragon'`、新增 `dragon_sets`、`shared_dragon`。
- 開放時做過：① 貼規則 ② 遊戲 `RELEASE=true` ③ 中心 `READY=true` ④ 分享區卡片與訂閱比較表換成正式文字。

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
tests/            Playwright 測試（模擬 Firebase，不會碰真的資料庫）
```

## 測試

```
npm i -D playwright && npx playwright install chromium   # 第一次
node tests/test_center.js [截圖資料夾]
node tests/test_dragon.js [截圖資料夾]   # 墨龍（需 CORRE_LIBS，遊戲 repo 在旁邊的 el-dragon-de-tinta）
```

「自動產生」的測試要本機有 `opencc-js@1.4.1`、`pinyin-pro@3.20.0`（`npm i` 在這個資料夾，或用環境變數 `CORRE_LIBS` 指到有 node_modules 的資料夾）；沒有的話會自動略過那幾項。

測試用 `tests/firebase-mock.js` 取代 Firebase，涵蓋：四語、免費／訂閱／到期、建班／改名／排行榜／刪班（含連帶刪成績）、三款連結與 QR、比比看範圍（新增／編輯／刪除／額度／範圍碼）、學習單改名與快速跳轉、建議訂閱視窗、意見回饋、干擾字、跑吧句庫（建立／自動產生／批次／題庫與主題包／改／存／刪、額度、到期、學習單 PDF）、三款成績簿、常錯統計、CSV、詞條完整性、手機寬度不橫向捲動。

**沒有涵蓋：** Firestore 安全規則（模擬器不驗規則）。請用非管理員的 Gmail 在實機測一次：建班、改名、刪班、色數「產生連結」、比比看範圍「儲存」「練習連結」，並用另一支手機（沒登入）打開範圍連結。
