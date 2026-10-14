# 老師管理中心 Centro del profesor

> 跑吧！漢字・色數消消樂・比比看 三款遊戲共用的老師端：登入、班級、學生連結、成績簿

- **網址：** https://wangchiapin.github.io/profesor/
- **Firebase 專案：** 中心專案 subscription-48d3c（跟三款遊戲同一個）
- **登入方式：** 老師 Google 登入；每位老師只看得到自己的資料
- **介面語言：** 繁體、簡體、西班牙文、英文（右上角切換，記在這台裝置）
- **狀態：** 第一階段（登入、方案、班級、學生連結、成績簿）；設定與列印還連回各遊戲原本的頁面

## 第一階段有什麼

| 頁面 | 內容 |
|---|---|
| 首頁 | 方案與到期日、用量（班級、跑吧句庫、色數設定組）、三款遊戲入口 |
| 班級 | 建立（訂閱中，最多 3 班）、改名、排行榜開關、刪除（三款遊戲的成績一起刪） |
| 班級裡：學生連結 | 三款各一組：複製、QR code（可下載）、試玩。跑吧可選句庫；色數要選一組設定（沒有連結碼的會自動產生） |
| 班級裡：成績 | 跑吧／色數／比比看三個分頁，表格欄位一致（暱稱｜最高分｜次數｜詳細｜最近）；比比看多「常錯統計」；全部／7 天／30 天篩選、匯出 CSV、刪除單列、清空這款成績 |
| 遊戲設定、列印 | 先連回各遊戲原本的頁面，之後一款一款搬進來 |

## 資料（都在中心專案，不需要新的 Firestore 規則）

| 集合 | 用途 |
|---|---|
| `site_members/{uid}`、`site_plans/{uid}` | 會員、方案（`month`／`year`／`trial`／`pro` 且 `expiresAt` 還沒到才算訂閱） |
| `teacher_classes/{uid}`、`classes/{cid}` | 班級（三款共用，最多 3 班） |
| `class_scores/{cid}_{game}_{h}` | 跑吧（`corre`）、色數（`colores`）每位學生一筆 |
| `class_plays/{自動 id}` | 比比看每回合每題的紀錄 |
| `teacher_banks`、`shared_banks` | 跑吧句庫（只讀，用來選題目來源） |
| `teacher_configs`、`shared_configs` | 色數設定組（讀；沒有連結碼時，照色數教師區的做法寫入連結碼） |

學生連結格式：

- 跑吧：`corre/?class=<班級碼>`，可加 `&bank=<句庫碼>`
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

## 檔案

```
index.html        外殼
css/style.css     無印風格咖啡色、膠囊按鈕
js/i18n.js        四語詞條（每個詞條 = [繁, 简, es, en]）
js/data.js        Firebase：登入、方案、班級、成績、比比看範圍
js/bbk.js         比比看的特徵／題型清單與範圍草稿
js/colores.js     色數的顏色、數字、設定格式與三種學習單
js/books.js       成績簿表格與比比看常錯統計（只產生 HTML）
js/app.js         畫面與操作
js/qrcode.js      qrcode-generator 1.4.4（MIT，Kazuhiko Arase）
tests/            Playwright 測試（模擬 Firebase，不會碰真的資料庫）
```

## 測試

```
npm i -D playwright && npx playwright install chromium   # 第一次
node tests/test_center.js [截圖資料夾]
```

測試用 `tests/firebase-mock.js` 取代 Firebase，涵蓋：四語、免費／訂閱／到期、建班／改名／排行榜／刪班（含連帶刪成績）、三款連結與 QR、比比看範圍（新增／編輯／刪除／額度／範圍碼）、三款成績簿、常錯統計、CSV、詞條完整性、手機寬度不橫向捲動。

**沒有涵蓋：** Firestore 安全規則（模擬器不驗規則）。請用非管理員的 Gmail 在實機測一次：建班、改名、刪班、色數「產生連結」、比比看範圍「儲存」「練習連結」，並用另一支手機（沒登入）打開範圍連結。
