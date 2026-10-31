// 遊戲設定說明（#/help）的內容：繁、簡、西、英。簡體由繁體自動轉換。
// 說明放在各遊戲頁的「說明」分頁：該遊戲那一段＋共用的「使用步驟」「訂閱後」（收合）。新增功能或新遊戲，要記得一起改這裡。
window.HELP = {
 "tc": {
  "btn": "📘 遊戲設定說明",
  "title": "📘 遊戲設定說明",
  "intro": "在遊戲頁，你可以替每款遊戲準備自己的題目，然後用連結傳給學生玩。",
  "back": "← 回上一頁",
  "free": "免費",
  "pro": "訂閱",
  "jump": [
   "使用步驟",
   "📚 跑吧",
   "🎨 色數",
   "📐 比比看",
   "🐉 墨龍飛天",
   "訂閱"
  ],
  "sections": [
   {
    "id": "hStep",
    "h": "使用步驟（所有遊戲都一樣）",
    "steps": [
     [
      "建立",
      "進入遊戲頁，在第一個分頁（自訂句庫、自訂設定或自訂字庫）建立你要的內容。"
     ],
     [
      "產生連結",
      "連結有兩種：<ul><li><b>練習連結</b>：在遊戲頁「連結」分頁最上面的卡片就能產生，也可以複製各項目旁的「試玩」連結，不用開班級。學生打開就能玩，但成績不會回傳給你。</li><li><b>班級連結</b>（訂閱功能）：到遊戲頁的「連結」分頁，上面選班級，再選好句庫、自訂設定或範圍，產生連結。學生輸入暱稱後，每一回合的成績會自動回傳到成績冊。</li></ul>"
     ],
     [
      "傳給學生",
      "複製連結或用 QR code，透過 LINE、WhatsApp 傳給學生。"
     ],
     [
      "看成績",
      "到遊戲頁的「成績」分頁，上面選班級就能看成績冊。成績會依句庫、自訂設定或範圍分開記錄，可以用成績冊上方的「顯示」選單切換。"
     ]
    ],
    "tip": "💡 改了設定，已經發出去的連結會自動更新，不用重傳。"
   },
   {
    "id": "hCorre",
    "h": "📚 跑吧！漢字：自訂句庫",
    "intro": "<b>句庫</b>就是一組你自己出的句子。",
    "items": [
     "<b>句子</b>：詞和詞之間用空格分開，例如「我 喜歡 吃 蘋果」。空格決定遊戲裡每塊詞語怎麼切。",
     "<b>翻譯</b>：西班牙文必填，英文選填。留空會自動機器翻譯，請一定要檢查。",
     "<b>批次匯入</b>：一行一句，格式是「中文 | 西班牙文 | 英文」。",
     "<b>從公開句庫／主題包加入</b>：不用自己一句一句打。可以從「公開句庫」（A1、A2 免費，B1 需訂閱）或「主題包」（訂閱）挑句子，或整包加入，複製進你的句庫（不會改到原本的句庫）。加進來後可以再修改。",
     "<b>干擾字</b>（訂閱功能）：遊戲出這一句時，會先用這些字當干擾，讓學生練習分辨相似字。每句最多 5 個。",
     "<b>不建句庫也能用</b>：在「跑吧」遊戲頁的「連結」分頁，班級連結的「題目來源」選「公開句庫 A1／A2」（訂閱後還有 B1 和主題包），直接用內建的句子出題。內建句庫依《當代中文課程》1、2、3 冊的語法點分成 A1、A2、B1，詞彙不超過華語八千詞對應等級。同一個分頁的「練習連結」卡可以直接做出不收成績的連結和 QR code。"
    ],
    "plan": [
     "1 個句庫，每庫最多 50 句；公開句庫 A1、A2",
     "最多 5 個句庫，每庫 80 句，可以設定干擾字；公開句庫再加 B1 和主題包"
    ]
   },
   {
    "id": "hCol",
    "h": "🎨 色數消消樂：自訂設定",
    "intro": "<b>自訂設定</b>決定這一局怎麼玩。",
    "items": [
     "<b>玩法</b>：「聽數字，選顏色」或「聽顏色，輸入數字」",
     "<b>格數</b>：色塊板有幾列、幾欄",
     "<b>愛心</b>：學生可以錯幾次（3、5 或無限）",
     "<b>顏色</b>：<ul><li>基本色（9 種）：紅、黃、藍、綠、黑、白、灰、橘、紫</li><li>進階色（14 種）：再加上粉紅、咖啡、深淺灰、深淺藍、深淺綠</li><li>自訂顏色（訂閱功能）</li></ul>",
     "<b>練習連結</b>：不用先建立設定，「基本色」「進階色」「基本色＋進階色」可以直接在「連結」分頁做成連結。",
     "<b>數字</b>：<ul><li>0–999</li><li>0–9999</li><li>自訂數字（訂閱功能）：用逗號分開，可以寫範圍，例如「1, 2, 10-20, 100」，最多 200 個</li></ul>"
    ],
    "note": "不想再讓學生用某組設定時，把它刪掉，連結就會失效。",
    "plan": [
     "3 組",
     "15 組，可以自訂顏色和數字"
    ]
   },
   {
    "id": "hBbk",
    "h": "📐 比比看：自訂設定",
    "intro": "<b>自訂設定</b>讓學生只練你選的句型、特徵和題型。先選關卡，再從這一關裡挑要考的特徵和題型。",
    "groups": [
     [
      "每一關練的比較句",
      [
       "<b>第 1 關</b>：<ul><li>A 比 B 高</li><li>誰比較高？</li><li>A 跟 B 一樣高</li><li>A 跟 B 差不多</li><li>A 跟 B 不一樣</li></ul>",
       "<b>第 2 關</b>：第 1 關的句型，再加上：<ul><li>A 沒有 B 那麼高</li><li>A 比 B 高一點／高很多</li></ul>",
       "<b>第 3 關</b>：再加上：<ul><li>A 比 B 更高／還高</li><li>誰最高？</li><li>A 比 B 高 5 公分、大 3 歲（說出差多少）</li></ul>"
      ]
     ],
     [
      "要考的特徵",
      [
       "第 1 關起：身高、年齡、胖瘦、頭髮長短、眼睛大小、鼻子大小",
       "第 2 關起再加：壯不壯、髮質（直／捲）、膚色",
       "胖瘦、壯不壯、髮質比較主觀，只有差很多的時候才出題；「選形容詞」不考膚色、髮質、壯不壯"
      ]
     ],
     [
      "題型",
      [
       "第 1 關：看句子找人、對錯題、看圖選句子、選人：誰比較＿？、選比較詞、選形容詞",
       "第 2 關：看句子找人、看圖選句子、選人：誰比 A ＿？、選人：A 比誰＿？、選比較詞、選形容詞",
       "第 3 關：連鎖解碼、選人：誰最＿？、選人：誰比 A ＿？、選人：A 比誰＿？、看圖選句子、選比較詞"
      ]
     ],
     [
      "題數",
      [
       "5、10、15 或 20 題"
      ]
     ]
    ],
    "note": "提醒：特徵選太少時，有些題型可能湊不出題目。存好後可以按「試玩」看看。學生每題答完，可以按「🚩 這題怪怪的」回報有問題的題目，我們會檢查修正。",
    "plan": [
     "3 組",
     "15 組"
    ]
   },
   {
    "id": "hDragon",
    "h": "🐉 墨龍飛天：自訂字庫與練習範圍",
    "intro": "學生玩墨龍飛天時，只會吃你選的主題裡的字。免費和訂閱開放的主題不一樣。",
    "items": [
     "<b>內建主題（10 個）</b>：食物、水果、動物、顏色、交通、身體、衣服、職業、天氣、家裡",
     "<b>誰能用哪些主題</b>：公開頁面只開放食物、動物、顏色；免費老師的練習連結可以再加交通、家裡，共 5 個；訂閱老師 10 個主題全開",
     "<b>自訂字庫</b>（訂閱）：在「自訂字庫」分頁建立，最多 3 個，每個 6～40 個詞，每個詞最多 4 個字。一行一個詞，可以直接寫「機場，aeropuerto，airport」；簡體、拼音和翻譯會自動產生，產生後也可以自己修改。",
     "<b>練習範圍</b>（訂閱）：在「練習範圍」分頁，把內建主題和自訂字庫組成一組，最多 15 組，再產生連結給學生。自訂字庫要放進練習範圍才能試玩或產生連結。",
     "<b>連結</b>：練習連結（免費）不記成績；班級連結（訂閱）請學生輸入暱稱，成績（分數、吃對幾個、飛行高度、常吃錯的字）會自動回到成績冊。",
     "<b>學習單</b>（訂閱）：可勾選題型（配對、翻譯、選擇、聽寫、造句），可「混合出題」（把勾選的主題合在一起隨機出題）、附單字表和答案頁，可選繁體或簡體，以及西文或英文輔助。"
    ],
    "note": "改了自訂字庫的單字，已經傳出去的練習範圍連結會自動換成新單字。",
    "plan": [
     "5 個內建主題的練習連結",
     "10 個內建主題、3 個自訂字庫、15 組練習範圍、班級連結、學習單"
    ]
   },
   {
    "id": "hBa",
    "h": "🔤 把／被：自訂句庫",
    "intro": "自訂句庫讓你從遊戲現有的句子中，挑出這次要練習的句子，做成一個句庫給學生玩。把、被各自有各自的句庫。",
    "items": [
     "<b>建立</b>：到把或被的遊戲頁，第一個分頁「自訂句庫」按「新增句庫」，編輯頁有四個分頁：「設定」（取名字）、「挑句子」（可以整關一起加，也可以一句一句勾，還能搜尋）、「自己寫句子」、「句庫內的句子」（看已經挑了哪些、可以移除）。",
     "<b>自己寫句子</b>：一行一句，詞和詞中間空一格，後面接「｜西班牙文翻譯」（必填），還可以再接「｜英文」。例：<code>我 把 書 放 在 桌子上｜Puse el libro sobre la mesa｜I put the book on the table</code>。把的句庫句子裡一定要有「把」、被的一定要有「被」；最多 8 個詞、每個詞最多 6 個字、整句最多 25 個字，只能用漢字（句號會自動加）；不合格的句子會擋住不能存，並告訴你是第幾行哪裡有問題。",
     "<b>讀音</b>：按「產生句子」後，讀音會先照 GoodTeacher 的規則排好，你可以逐個詞檢查、修改拼音（注音會跟著變）。你改的只影響這個句庫裡的這一句，不會動到 GoodTeacher 的規則、其他句庫或遊戲本身的讀音。",
     "<b>句數</b>：每個句庫最少 10 句；免費最多 50 句，訂閱最多 80 句；自己寫的句子也算在裡面。這裡只顯示文字，按「試玩」才看得到圖。",
     "<b>個數</b>：把和被各自算，免費每個遊戲 1 個句庫，訂閱每個遊戲最多 5 個。",
     "<b>學生怎麼玩</b>：首頁只有名字欄和一張「開始」卡片（上面寫句庫名稱）；每次從句庫隨機抽 10 題，不影響原本關卡的星星。挑來的遊戲句子照原本的看圖題；你自己寫的句子沒有圖，出文字題（看翻譯排卡片、聽句選句子、看翻譯選句子），錯誤選項取自同一個句庫的其他句子。",
     "<b>連結</b>：「試玩」連結不記成績（免費也能用）；訂閱老師在「連結」分頁選好班級，「題目來源」選句庫，就能做出會回傳成績的班級連結，成績冊依句庫分開顯示。"
    ],
    "note": "句庫碼建立後不會換，你之後增減句子，已經發出去的連結會自動跟著變。刪除句庫後，已發出的連結會失效。",
    "plan": [
     "每個遊戲 1 個句庫、每庫 50 句，只能用試玩連結",
     "每個遊戲 5 個句庫、每庫 80 句，班級連結回傳成績"
    ]
   },
   {
    "id": "hSub",
    "h": "訂閱後還可以",
    "items": [
     "建立班級（最多 3 班），成績自動回傳到成績冊",
     "比比看常錯統計、匯出 CSV",
     "各遊戲的學習單（列印／PDF，在各遊戲頁的「學習單」分頁；語言、拼音／注音、字體大小的設定在各遊戲都一樣）"
    ]
   }
  ]
 },
 "sc": {
  "btn": "📘 游戏设置说明",
  "title": "📘 游戏设置说明",
  "intro": "在游戏页，你可以替每款游戏准备自己的题目，然后用链接传给学生玩。",
  "back": "← 回上一页",
  "free": "免费",
  "pro": "订阅",
  "jump": [
   "使用步骤",
   "📚 跑吧",
   "🎨 色数",
   "📐 比比看",
   "🐉 墨龙飞天",
   "订阅"
  ],
  "sections": [
   {
    "id": "hStep",
    "h": "使用步骤（所有游戏都一样）",
    "steps": [
     [
      "创建",
      "进入游戏页，在第一个分页（自定句库、自定设置或自定字库）创建你要的内容。"
     ],
     [
      "生成链接",
      "链接有两种：<ul><li><b>练习链接</b>：在游戏页“链接”分页最上面的卡片就能生成，也可以复制各项目旁的“试玩”链接，不用开班级。学生打开就能玩，但成绩不会回传给你。</li><li><b>班级链接</b>（订阅功能）：到游戏页的“链接”分页，上面选班级，再选好句库、自定设置或范围，生成链接。学生输入昵称后，每一回合的成绩会自动回传到成绩册。</li></ul>"
     ],
     [
      "传给学生",
      "复制链接或用 QR code，透过 LINE、WhatsApp 传给学生。"
     ],
     [
      "看成绩",
      "到游戏页的“成绩”分页，上面选班级就能看成绩册。成绩会依句库、自定设置或范围分开记录，可以用成绩册上方的“显示”选单切换。"
     ]
    ],
    "tip": "💡 改了设置，已经发出去的链接会自动更新，不用重传。"
   },
   {
    "id": "hCorre",
    "h": "📚 跑吧！汉字：自订句库",
    "intro": "<b>句库</b>就是一组你自己出的句子。",
    "items": [
     "<b>句子</b>：词和词之间用空格分开，例如“我 喜欢 吃 苹果”。空格决定游戏里每块词语怎么切。",
     "<b>翻译</b>：西班牙文必填，英文选填。留空会自动机器翻译，请一定要检查。",
     "<b>批量导入</b>：一行一句，格式是“中文 | 西班牙文 | 英文”。",
     "<b>从公开句库／主题包加入</b>：不用自己一句一句打。可以从“公开句库”（A1、A2 免费，B1 需订阅）或“主题包”（订阅）挑句子，或整包加入，复制进你的句库（不会改到原本的句库）。加进来后可以再修改。",
     "<b>干扰字</b>（订阅功能）：游戏出这一句时，会先用这些字当干扰，让学生练习分辨相似字。每句最多 5 个。",
     "<b>不建句库也能用</b>：在“跑吧”游戏页的“链接”分页，班级链接的“题目来源”选“公开句库 A1／A2”（订阅后还有 B1 和主题包），直接用内置的句子出题。内置句库依《当代中文课程》1、2、3 册的语法点分成 A1、A2、B1，词汇不超过华语八千词对应等级。同一个分页的“公开句库练习链接”可以直接做出不收成绩的链接和 QR code。"
    ],
    "plan": [
     "1 个句库，每库最多 50 句；公开句库 A1、A2",
     "最多 5 个句库，每库 80 句，可以设置干扰字；公开句库再加 B1 和主题包"
    ]
   },
   {
    "id": "hCol",
    "h": "🎨 色数消消乐：自定设置",
    "intro": "<b>自定设置</b>决定这一局怎么玩。",
    "items": [
     "<b>玩法</b>：“听数字，选颜色”或“听颜色，输入数字”",
     "<b>格数</b>：色块板有几列、几栏",
     "<b>爱心</b>：学生可以错几次（3、5 或无限）",
     "<b>颜色</b>：<ul><li>基本色（9 种）：红、黄、蓝、绿、黑、白、灰、橘、紫</li><li>进阶色（14 种）：再加上粉红、咖啡、深浅灰、深浅蓝、深浅绿</li><li>自定颜色（订阅功能）</li></ul>",
     "<b>数字</b>：<ul><li>0–999</li><li>0–9999</li><li>自定数字（订阅功能）：用逗号分开，可以写范围，例如“1, 2, 10-20, 100”，最多 200 个</li></ul>",
     "<b>练习连结</b>：不用先创建设置，“基本色”“进阶色”“基本色＋进阶色”可以直接在“连结”分页做成连结。"
    ],
    "note": "不想再让学生用某组设置时，把它删掉，链接就会失效。",
    "plan": [
     "3 组",
     "15 组，可以自定颜色和数字"
    ]
   },
   {
    "id": "hBbk",
    "h": "📐 比比看：自定设置",
    "intro": "<b>自定设置</b>让学生只练你选的句型、特征和题型。先选关卡，再从这一关里挑要考的特征和题型。",
    "groups": [
     [
      "每一关练的比较句",
      [
       "<b>第 1 关</b>：<ul><li>A 比 B 高</li><li>谁比较高？</li><li>A 跟 B 一样高</li><li>A 跟 B 差不多</li><li>A 跟 B 不一样</li></ul>",
       "<b>第 2 关</b>：第 1 关的句型，再加上：<ul><li>A 没有 B 那么高</li><li>A 比 B 高一点／高很多</li></ul>",
       "<b>第 3 关</b>：再加上：<ul><li>A 比 B 更高／还高</li><li>谁最高？</li><li>A 比 B 高 5 公分、大 3 岁（说出差多少）</li></ul>"
      ]
     ],
     [
      "要考的特征",
      [
       "第 1 关起：身高、年龄、胖瘦、头发长短、眼睛大小、鼻子大小",
       "第 2 关起再加：壮不壮、发质（直／卷）、肤色",
       "胖瘦、壮不壮、发质比较主观，只有差很多的时候才出题；“选形容词”不考肤色、发质、壮不壮"
      ]
     ],
     [
      "题型",
      [
       "第 1 关：看句子找人、对错题、看图选句子、选人：谁比较＿？、选比较词、选形容词",
       "第 2 关：看句子找人、看图选句子、选人：谁比 A ＿？、选人：A 比谁＿？、选比较词、选形容词",
       "第 3 关：连锁解码、选人：谁最＿？、选人：谁比 A ＿？、选人：A 比谁＿？、看图选句子、选比较词"
      ]
     ],
     [
      "题数",
      [
       "5、10、15 或 20 题"
      ]
     ]
    ],
    "note": "提醒：特征选太少时，有些题型可能凑不出题目。存好后可以按“试玩”看看。学生每题答完，可以按“🚩 这题怪怪的”回报有问题的题目，我们会检查修正。",
    "plan": [
     "3 组",
     "15 组"
    ]
   },
   {
    "id": "hDragon",
    "h": "🐉 墨龙飞天：自定字库与练习范围",
    "intro": "学生玩墨龙飞天时，只会吃你选的主题里的字。免费和订阅开放的主题不一样。",
    "items": [
     "<b>内建主题（10 个）</b>：食物、水果、动物、颜色、交通、身体、衣服、职业、天气、家里",
     "<b>谁能用哪些主题</b>：公开页面只开放食物、动物、颜色；免费老师的练习连结可以再加交通、家里，共 5 个；订阅老师 10 个主题全开",
     "<b>自定字库</b>（订阅）：在“自定字库”分页创建，最多 3 个，每个 6～40 个词，每个词最多 4 个字。一行一个词，可以直接写“机场，aeropuerto，airport”；简体、拼音和翻译会自动产生，产生后也可以自己修改。",
     "<b>练习范围</b>（订阅）：在“练习范围”分页，把内建主题和自定字库组成一组，最多 15 组，再产生连结给学生。自定字库要放进练习范围才能试玩或产生连结。",
     "<b>连结</b>：练习连结（免费）不记成绩；班级连结（订阅）请学生输入暱称，成绩（分数、吃对几个、飞行高度、常吃错的字）会自动回到成绩册。",
     "<b>学习单</b>（订阅）：可勾选题型（配对、翻译、选择、听写、造句），可“混合出题”（把勾选的主题合在一起随机出题）、附单字表和答案页，可选繁体或简体，以及西文或英文辅助。"
    ],
    "note": "改了自定字库的单字，已经传出去的练习范围连结会自动换成新单字。",
    "plan": [
     "5 个内建主题的练习连结",
     "10 个内建主题、3 个自定字库、15 组练习范围、班级连结、学习单"
    ]
   },
   {
    "id": "hBa",
    "h": "🔤 把／被：自定句库",
    "intro": "自定句库让你从游戏现有的句子中，挑出这次要练习的句子，做成一个句库给学生玩。把、被各自有各自的句库。",
    "items": [
     "<b>建立</b>：到把或被的游戏页，第一个分页“自定句库”按“新增句库”，编辑页有四个分页：“设置”（取名字）、“挑句子”（可以整关一起加，也可以一句一句勾，还能搜索）、“自己写句子”、“句库内的句子”（看已经挑了哪些、可以移除）。",
     "<b>自己写句子</b>：一行一句，词和词中间空一格，后面接“｜西班牙文翻译”（必填），还可以再接“｜英文”。例：<code>我 把 书 放 在 桌子上｜Puse el libro sobre la mesa｜I put the book on the table</code>。把的句库句子里一定要有“把”、被的一定要有“被”；最多 8 个词、每个词最多 6 个字、整句最多 25 个字，只能用汉字（句号会自动加）；不合格的句子会挡住不能存，并告诉你是第几行哪里有问题。",
     "<b>读音</b>：按“生成句子”后，读音会先按 GoodTeacher 的规则排好，你可以逐个词检查、修改拼音（注音会跟着变）。你改的只影响这个句库里的这一句，不会动到 GoodTeacher 的规则、其他句库或游戏本身的读音。",
     "<b>句数</b>：每个句库最少 10 句；免费最多 50 句，订阅最多 80 句；自己写的句子也算在里面。这里只显示文字，按“试玩”才看得到图。",
     "<b>个数</b>：把和被各自算，免费每个游戏 1 个句库，订阅每个游戏最多 5 个。",
     "<b>学生怎么玩</b>：首页只有名字栏和一张“开始”卡片（上面写句库名称）；每次从句库随机抽 10 题，不影响原本关卡的星星。挑来的游戏句子照原本的看图题；你自己写的句子没有图，出文字题（看翻译排卡片、听句选句子、看翻译选句子），错误选项取自同一个句库的其他句子。",
     "<b>链接</b>：“试玩”链接不记成绩（免费也能用）；订阅老师在“链接”分页选好班级，“题目来源”选句库，就能做出会回传成绩的班级链接，成绩册依句库分开显示。"
    ],
    "note": "句库码建立后不会换，你之后增减句子，已经发出去的链接会自动跟着变。删除句库后，已发出的链接会失效。",
    "plan": [
     "每个游戏 1 个句库、每库 50 句，只能用试玩链接",
     "每个游戏 5 个句库、每库 80 句，班级链接回传成绩"
    ]
   },
   {
    "id": "hSub",
    "h": "订阅后还可以",
    "items": [
     "创建班级（最多 3 班），成绩自动回传到成绩册",
     "比比看常错统计、导出 CSV",
     "各游戏的学习单（打印／PDF，在各游戏页的“学习单”分页；语言、拼音／注音、字体大小的设置在各游戏都一样）"
    ]
   }
  ]
 },
 "es": {
  "btn": "📘 Guía de ajustes",
  "title": "📘 Guía de ajustes de juegos",
  "intro": "En la página de cada juego puedes preparar tus propios ejercicios y enviárselos a tus alumnos con un enlace.",
  "back": "← Volver",
  "free": "Gratis",
  "pro": "Suscripción",
  "jump": [
   "Pasos",
   "📚 Corre",
   "🎨 Pop Colores",
   "📐 Compara",
   "🐉 Dragón de tinta",
   "Suscripción"
  ],
  "sections": [
   {
    "id": "hStep",
    "h": "Cómo se usa (igual en todos los juegos)",
    "steps": [
     [
      "Crear",
      "Entra en la página del juego y, en la primera pestaña (bancos, configuraciones o bancos de palabras propios), crea lo que necesites."
     ],
     [
      "Generar el enlace",
      "Hay dos tipos de enlace:<ul><li><b>Enlace de práctica</b>: se genera en la página del juego (en la primera tarjeta de la pestaña «Enlaces»; también puedes copiar el enlace «Probar» de cada elemento), sin crear una clase. El alumno lo abre y juega, pero sus notas no te llegan.</li><li><b>Enlace de clase</b> (suscripción): en la pestaña «Enlaces» del juego, elige la clase arriba, luego el banco, la configuración o el rango, y genera el enlace. El alumno escribe un apodo y la nota de cada ronda llega sola al libro de notas.</li></ul>"
     ],
     [
      "Enviarlo a tus alumnos",
      "Copia el enlace o usa el código QR y envíalo por LINE o WhatsApp."
     ],
     [
      "Ver las notas",
      "Consulta el libro de notas en la pestaña «Notas» del juego, eligiendo la clase arriba. Las notas se guardan por banco, configuración o rango; cámbialo con el menú «Mostrar» de arriba."
     ]
    ],
    "tip": "💡 Si cambias un ajuste, los enlaces ya enviados se actualizan solos; no hace falta reenviarlos."
   },
   {
    "id": "hCorre",
    "h": "📚 Corre Hanzi: bancos de frases",
    "intro": "Un <b>banco de frases</b> es un grupo de frases que escribes tú.",
    "items": [
     "<b>Frases</b>: separa las palabras con espacios, por ejemplo «我 喜歡 吃 蘋果». Los espacios deciden cómo se corta cada bloque de palabras en el juego.",
     "<b>Traducción</b>: el español es obligatorio y el inglés, opcional. Si la dejas vacía, se traduce automáticamente; revísala siempre.",
     "<b>Importar en lote</b>: una frase por línea, con el formato «chino | español | inglés».",
     "<b>Añadir desde el banco público / paquetes temáticos</b>: no tienes que escribir frase por frase. Elige frases del «Banco público» (A1 y A2 gratis; B1 con suscripción) o de un «Paquete temático» (suscripción), o añade el paquete entero; se copian a tu banco (el original no cambia). Después puedes editarlas.",
     "<b>Distractores</b> (suscripción): cuando sale esa frase, el juego usa primero estas palabras como distractores para practicar caracteres parecidos. Hasta 5 por frase.",
     "<b>Sin crear un banco</b>: en la pestaña «Enlaces» de Corre, en «Origen de las frases» del enlace de clase, elige «Banco público A1 / A2» (con suscripción también B1 y los paquetes temáticos) para usar las frases incluidas. Están divididas en A1, A2 y B1 según los puntos gramaticales de los libros 1, 2 y 3 de «Contemporary Chinese», con vocabulario dentro del nivel correspondiente de las 8000 palabras. En la misma pestaña puedes crear un tarjeta «Enlace de práctica» (sin notas) y su QR."
    ],
    "plan": [
     "1 banco, hasta 50 frases; banco público A1 y A2",
     "Hasta 5 bancos de 80 frases, con distractores; banco público con B1 y paquetes temáticos"
    ]
   },
   {
    "id": "hCol",
    "h": "🎨 Pop Colores y Números: configuraciones",
    "intro": "Una <b>configuración</b> define cómo se juega cada partida.",
    "items": [
     "<b>Modo</b>: «Oír número, elegir color» u «Oír color, escribir número»",
     "<b>Tamaño del tablero</b>: cuántas filas y columnas tiene",
     "<b>Corazones</b>: cuántos errores puede cometer el alumno (3, 5 o sin límite)",
     "<b>Colores</b>:<ul><li>Básicos (9): rojo, amarillo, azul, verde, negro, blanco, gris, naranja, morado</li><li>Avanzados (14): además rosa, marrón, gris oscuro y claro, azul oscuro y claro, verde oscuro y claro</li><li>Colores propios (suscripción)</li></ul>",
     "<b>Números</b>:<ul><li>0–999</li><li>0–9999</li><li>Números propios (suscripción): sepáralos con comas; puedes escribir rangos, por ejemplo «1, 2, 10-20, 100». Máximo 200.</li></ul>",
     "<b>Enlace de práctica</b>: sin crear ninguna configuración, «Colores básicos», «Avanzados» y «Básicos + avanzados» se pueden convertir directamente en enlace en la pestaña «Enlaces»."
    ],
    "note": "Si ya no quieres que tus alumnos usen una configuración, bórrala y su enlace dejará de funcionar.",
    "plan": [
     "3",
     "15, con colores y números propios"
    ]
   },
   {
    "id": "hBbk",
    "h": "📐 Compara y Adivina: rangos de práctica",
    "intro": "Un <b>rango de práctica</b> hace que el alumno practique solo las estructuras, rasgos y tipos de pregunta que tú eliges. Primero elige el nivel y luego los rasgos y tipos de pregunta de ese nivel.",
    "groups": [
     [
      "Comparativos de cada nivel",
      [
       "<b>Nivel 1</b>:<ul><li>A 比 B 高 (A es más alto que B)</li><li>誰比較高？ (¿Quién es más alto?)</li><li>A 跟 B 一樣高 (A es tan alto como B)</li><li>A 跟 B 差不多 (A y B son más o menos iguales)</li><li>A 跟 B 不一樣 (A y B no son iguales)</li></ul>",
       "<b>Nivel 2</b>: lo del nivel 1, y además:<ul><li>A 沒有 B 那麼高 (A no es tan alto como B)</li><li>A 比 B 高一點／高很多 (A es un poco / mucho más alto que B)</li></ul>",
       "<b>Nivel 3</b>: y además:<ul><li>A 比 B 更高／還高 (A es aún más alto que B)</li><li>誰最高？ (¿Quién es el más alto?)</li><li>A 比 B 高 5 公分、大 3 歲 (decir la diferencia exacta)</li></ul>"
      ]
     ],
     [
      "Rasgos",
      [
       "Desde el nivel 1: estatura, edad, complexión, largo del pelo, tamaño de ojos, tamaño de nariz",
       "Desde el nivel 2, además: fuerza, tipo de pelo (liso / rizado), color de piel",
       "Complexión, fuerza y tipo de pelo son más subjetivos: solo salen cuando la diferencia es grande; «Elige el adjetivo» no usa color de piel, tipo de pelo ni fuerza"
      ]
     ],
     [
      "Tipos de pregunta",
      [
       "Nivel 1: encuentra a la persona, verdadero o falso, elige la frase, elige: ¿quién es más ＿?, elige la palabra de comparación, elige el adjetivo",
       "Nivel 2: encuentra a la persona, elige la frase, elige: ¿quién es más ＿ que A?, elige: ¿A es más ＿ que quién?, elige la palabra de comparación, elige el adjetivo",
       "Nivel 3: decodifica en cadena, elige: ¿quién es el más ＿?, elige: ¿quién es más ＿ que A?, elige: ¿A es más ＿ que quién?, elige la frase, elige la palabra de comparación"
      ]
     ],
     [
      "Número de preguntas",
      [
       "5, 10, 15 o 20"
      ]
     ]
    ],
    "note": "Ojo: con pocos rasgos, algunos tipos de pregunta quizá no tengan preguntas suficientes. Después de guardar, pulsa «Probar» para comprobarlo. Después de cada pregunta, tus alumnos pueden pulsar «🚩 Algo raro en esta pregunta» para avisarnos de un error; lo revisaremos.",
    "plan": [
     "3",
     "15"
    ]
   },
   {
    "id": "hDragon",
    "h": "🐉 El dragón de tinta: bancos propios y rangos de práctica",
    "intro": "En este juego el alumno solo come las palabras de los temas que tú elijas. Los temas disponibles cambian entre gratis y suscripción.",
    "items": [
     "<b>Temas incluidos (10)</b>: comida, fruta, animales, colores, transporte, cuerpo, ropa, profesiones, clima y casa",
     "<b>Quién puede usar qué</b>: la página pública solo ofrece comida, animales y colores; con un profesor gratuito, el enlace de práctica puede añadir transporte y casa (5 en total); con suscripción están los 10 temas",
     "<b>Bancos propios</b> (suscripción): se crean en la pestaña «Mis temas»; hasta 3, de 6 a 40 palabras cada uno, de hasta 4 caracteres. Escribe una palabra por línea, por ejemplo «機場，aeropuerto，airport»; el chino simplificado, el pinyin y las traducciones se generan solos y puedes corregirlos.",
     "<b>Rangos de práctica</b> (suscripción): en la pestaña «Rangos», combina temas incluidos y bancos propios en un grupo (hasta 15) y genera el enlace para tus alumnos. Un banco propio solo se puede probar o enlazar dentro de un rango.",
     "<b>Enlaces</b>: el enlace de práctica (gratis) no guarda notas; el enlace de clase (suscripción) pide un apodo y envía solo las notas (puntos, aciertos, altura y palabras falladas) al libro de notas.",
     "<b>Fichas</b> (suscripción): tipos de ejercicio a elegir (unir, traducir, elección múltiple, dictado, oraciones), con «Mezclar temas» (saca los ejercicios de todos los temas marcados a la vez), lista de palabras y hoja de respuestas; con chino tradicional o simplificado y ayuda en español o inglés."
    ],
    "note": "Si cambias las palabras de un banco propio, los enlaces de rango que ya enviaste se actualizan solos.",
    "plan": [
     "Enlace de práctica con 5 temas incluidos",
     "10 temas incluidos, 3 bancos propios, 15 rangos, enlace de clase y fichas"
    ]
   },
   {
    "id": "hBa",
    "h": "🔤 把／被: bancos propios",
    "intro": "Con un banco propio eliges, entre las oraciones que ya trae el juego, las que quieres practicar y las conviertes en un banco para tus alumnos. 把 y 被 tienen bancos separados.",
    "items": [
     "<b>Crear</b>: en la página del juego (把 o 被), primera pestaña «Bancos propios» → «Nuevo banco». El editor tiene cuatro pestañas: «Ajustes» (nombre), «Elegir oraciones» (añade un nivel entero o marca una por una; hay buscador), «Escribir oraciones» y «Oraciones del banco» (ver y quitar).",
     "<b>Escribir oraciones</b>: una por línea, palabras separadas por espacios, seguidas de «｜traducción al español» (obligatoria) y, si quieres, «｜inglés». Ej.: <code>我 把 書 放 在 桌子上｜Puse el libro sobre la mesa｜I put the book on the table</code>. En un banco de 把 la oración debe contener 把, y en uno de 被, 被. Máximo 8 palabras, 6 caracteres por palabra y 25 por oración, solo caracteres chinos (el punto final se añade solo). Las oraciones que no cumplen no se pueden guardar y se indica la línea y el motivo.",
     "<b>Lecturas</b>: al pulsar «Generar», el pinyin sale primero según las reglas de GoodTeacher y puedes revisar y corregir cada palabra (el zhuyin cambia contigo). Tus cambios solo afectan a esa oración de ese banco: no tocan las reglas de GoodTeacher, otros bancos ni las lecturas del juego.",
     "<b>Tamaño</b>: mínimo 10 oraciones; hasta 50 en el plan gratis y 80 con suscripción; las oraciones que escribes también cuentan. Aquí solo se ve el texto; las imágenes se ven con «Probar».",
     "<b>Cantidad</b>: se cuenta por juego: 1 banco por juego en el plan gratis y hasta 5 con suscripción.",
     "<b>Cómo juega el alumno</b>: la pantalla de inicio solo tiene el nombre y una tarjeta «Empezar» con el nombre del banco; cada partida son 10 preguntas al azar del banco y no cambia las estrellas de los niveles. Las oraciones del juego mantienen sus preguntas con imágenes; las que escribes tú no tienen imagen y usan preguntas de texto (ordenar tarjetas con la traducción, escuchar y elegir la oración, elegir la oración con la traducción), con opciones incorrectas tomadas de otras oraciones del banco.",
     "<b>Enlaces</b>: el enlace «Probar» no guarda resultados (también en el plan gratis). Con suscripción, en la pestaña «Enlaces» elige la clase y, en «Origen de las preguntas», el banco: el enlace de clase devuelve resultados, y el libro de notas los separa por banco."
    ],
    "note": "El código del banco no cambia: si luego añades o quitas oraciones, los enlaces ya enviados se actualizan solos. Si eliminas el banco, esos enlaces dejan de funcionar.",
    "plan": [
     "1 banco por juego, 50 oraciones, solo enlace de prueba",
     "5 bancos por juego, 80 oraciones, enlaces de clase con resultados"
    ]
   },
   {
    "id": "hSub",
    "h": "Con la suscripción, además",
    "items": [
     "Crear clases (hasta 3); las notas llegan solas al libro de notas",
     "Errores frecuentes en Compara y Adivina y exportar CSV",
     "Hojas de trabajo de cada juego (imprimir / PDF, en la pestaña «Fichas» de cada juego; idioma, pinyin / zhuyin y tamaño de letra se eligen igual en todos)"
    ]
   }
  ]
 },
 "en": {
  "btn": "📘 Settings guide",
  "title": "📘 Game settings guide",
  "intro": "On each game’s page you can prepare your own exercises and send them to your students with a link.",
  "back": "← Back",
  "free": "Free",
  "pro": "Subscription",
  "jump": [
   "Steps",
   "📚 Run Hanzi",
   "🎨 Pop Colors",
   "📐 Compare",
   "🐉 Ink Dragon",
   "Subscription"
  ],
  "sections": [
   {
    "id": "hStep",
    "h": "How it works (same for all games)",
    "steps": [
     [
      "Create",
      "Open the game page and, in the first tab (banks, setups or custom word banks), create what you need."
     ],
     [
      "Make a link",
      "There are two kinds of link:<ul><li><b>Practice link</b>: made on the game page (in the first card of the “Links” tab; you can also copy the “Try it” link of each item), no class needed. Students open it and play, but their scores are not sent to you.</li><li><b>Class link</b> (subscription): in the game’s “Links” tab, choose the class at the top, then the bank, setup or range, and create the link. Students enter a nickname and every round’s score goes straight to the gradebook.</li></ul>"
     ],
     [
      "Send it to students",
      "Copy the link or use the QR code and send it by LINE or WhatsApp."
     ],
     [
      "Check scores",
      "Open the gradebook in the game’s “Scores” tab, choosing the class at the top. Scores are kept separately for each bank, setup or range; switch with the “Show” menu at the top."
     ]
    ],
    "tip": "💡 If you change a setting, links you already sent update automatically — no need to resend."
   },
   {
    "id": "hCorre",
    "h": "📚 Run Hanzi: sentence banks",
    "intro": "A <b>sentence bank</b> is a set of sentences you write yourself.",
    "items": [
     "<b>Sentences</b>: separate words with spaces, e.g. “我 喜歡 吃 蘋果”. The spaces decide how the words are split into blocks in the game.",
     "<b>Translation</b>: Spanish is required, English is optional. Left blank, it is machine-translated — always check it.",
     "<b>Bulk import</b>: one sentence per line, in the format “Chinese | Spanish | English”.",
     "<b>Add from the public bank / theme packs</b>: no need to type every sentence. Pick sentences from the Public bank (A1 and A2 free; B1 needs a subscription) or a Theme pack (subscription), or add a whole pack; they are copied into your bank (the original stays the same). You can edit them afterwards.",
     "<b>Decoys</b> (subscription): when this sentence comes up, the game uses these words as decoys first, so students practice telling similar characters apart. Up to 5 per sentence.",
     "<b>No bank needed</b>: in the “Links” tab of Run Hanzi, set “Sentence source” of the class link to “Public bank A1 / A2” (subscribers also get B1 and theme packs) to use the built-in sentences. They are split into A1, A2 and B1 by the grammar points of Contemporary Chinese books 1, 2 and 3, with vocabulary within the matching level of the 8000-word list. In the same tab, the “Practice link” card makes a link and QR code that does not collect scores."
    ],
    "plan": [
     "1 bank, up to 50 sentences; public bank A1 and A2",
     "Up to 5 banks of 80 sentences, with decoys; public bank plus B1 and theme packs"
    ]
   },
   {
    "id": "hCol",
    "h": "🎨 Pop Colors & Numbers: setups",
    "intro": "A <b>setup</b> decides how a round is played.",
    "items": [
     "<b>Mode</b>: “Hear number, pick color” or “Hear color, type number”",
     "<b>Board size</b>: how many rows and columns",
     "<b>Hearts</b>: how many mistakes a student can make (3, 5 or unlimited)",
     "<b>Colors</b>:<ul><li>Basic (9): red, yellow, blue, green, black, white, gray, orange, purple</li><li>Advanced (14): adds pink, brown, dark and light gray, dark and light blue, dark and light green</li><li>Custom colors (subscription)</li></ul>",
     "<b>Numbers</b>:<ul><li>0–999</li><li>0–9999</li><li>Custom numbers (subscription): separate with commas, ranges allowed, e.g. “1, 2, 10-20, 100”. Up to 200.</li></ul>",
     "<b>Practice link</b>: without making a setup first, “Basic colors”, “Advanced colors” and “Basic + advanced” can be turned straight into a link in the “Links” tab."
    ],
    "note": "If you no longer want students to use a setup, delete it and its link stops working.",
    "plan": [
     "3",
     "15, with custom colors and numbers"
    ]
   },
   {
    "id": "hBbk",
    "h": "📐 Compare & Guess: practice ranges",
    "intro": "A <b>practice range</b> lets students practice only the patterns, features and question types you choose. Pick a level first, then the features and question types from that level.",
    "groups": [
     [
      "Comparatives at each level",
      [
       "<b>Level 1</b>:<ul><li>A 比 B 高 (A is taller than B)</li><li>誰比較高？ (Who is taller?)</li><li>A 跟 B 一樣高 (A is as tall as B)</li><li>A 跟 B 差不多 (A and B are about the same)</li><li>A 跟 B 不一樣 (A and B are different)</li></ul>",
       "<b>Level 2</b>: level 1, plus:<ul><li>A 沒有 B 那麼高 (A is not as tall as B)</li><li>A 比 B 高一點／高很多 (A is a bit / much taller than B)</li></ul>",
       "<b>Level 3</b>: plus:<ul><li>A 比 B 更高／還高 (A is even taller than B)</li><li>誰最高？ (Who is the tallest?)</li><li>A 比 B 高 5 公分、大 3 歲 (saying the exact difference)</li></ul>"
      ]
     ],
     [
      "Features",
      [
       "From level 1: height, age, build, hair length, eye size, nose size",
       "From level 2, also: muscles, hair type (straight / curly), skin tone",
       "Build, muscles and hair type are more subjective, so they only appear when the difference is large; “Pick the adjective” does not use skin tone, hair type or muscles"
      ]
     ],
     [
      "Question types",
      [
       "Level 1: find the person, true or false, pick the sentence, pick: who is more ＿?, pick the comparison word, pick the adjective",
       "Level 2: find the person, pick the sentence, pick: who is more ＿ than A?, pick: A is more ＿ than whom?, pick the comparison word, pick the adjective",
       "Level 3: chain decoding, pick: who is the most ＿?, pick: who is more ＿ than A?, pick: A is more ＿ than whom?, pick the sentence, pick the comparison word"
      ]
     ],
     [
      "Number of questions",
      [
       "5, 10, 15 or 20"
      ]
     ]
    ],
    "note": "Note: with too few features, some question types may not have enough questions. After saving, press “Try it” to check. After each question, students can press “🚩 Something's off here” to report a problem; we will check and fix it.",
    "plan": [
     "3",
     "15"
    ]
   },
   {
    "id": "hDragon",
    "h": "🐉 Ink Dragon: word banks and practice sets",
    "intro": "In this game students only eat words from the themes you choose. Free and subscription teachers get different themes.",
    "items": [
     "<b>Built-in themes (10)</b>: food, fruit, animals, colors, transport, body, clothes, jobs, weather and home",
     "<b>Who gets which themes</b>: the public page offers only food, animals and colors; a free teacher's practice link can add transport and home (5 in all); subscribers get all 10",
     "<b>Custom word banks</b> (subscription): made in the “Custom word banks” tab; up to 3, with 6–40 words each, up to 4 characters per word. Type one word per line, for example \"機場，aeropuerto，airport\"; simplified Chinese, pinyin and translations are generated for you and you can edit them.",
     "<b>Practice sets</b> (subscription): in the “Ranges” tab, combine built-in themes and custom word banks into a set (up to 15) and make a link for your students. A custom word bank can only be tried or linked inside a set.",
     "<b>Links</b>: a practice link (free) does not record scores; a class link (subscription) asks for a nickname and sends the results (score, correct count, altitude, commonly missed words) to the gradebook.",
     "<b>Worksheets</b> (subscription): choose exercise types (matching, translation, multiple choice, dictation, sentences), with “Mix themes” (draws questions from all ticked themes at once), a word list and an answer page, in traditional or simplified Chinese with Spanish or English help."
    ],
    "note": "If you change the words of a custom word bank, practice-set links you already sent update automatically.",
    "plan": [
     "Practice link with 5 built-in themes",
     "10 built-in themes, 3 custom word banks, 15 practice sets, class links and worksheets"
    ]
   },
   {
    "id": "hBa",
    "h": "🔤 把 / 被: sentence banks",
    "intro": "A sentence bank lets you pick, from the sentences already in the game, the ones you want to practice and turn them into a bank for your students. 把 and 被 have separate banks.",
    "items": [
     "<b>Create</b>: on the game page (把 or 被), first tab “Sentence banks” → “New bank”. The editor has four tabs: “Settings” (name), “Pick sentences” (add a whole level or tick one by one; there is a search box), “Write sentences” and “Bank sentences” (review and remove).",
     "<b>Write sentences</b>: one per line, words separated by spaces, then “｜Spanish translation” (required) and optionally “｜English”. E.g. <code>我 把 書 放 在 桌子上｜Puse el libro sobre la mesa｜I put the book on the table</code>. A 把 bank sentence must contain 把, a 被 bank sentence 被. At most 8 words, 6 characters per word and 25 per sentence, Chinese characters only (the final period is added for you). Sentences that break the rules cannot be saved, and you are told which line and why.",
     "<b>Readings</b>: after “Generate”, pinyin is first set by GoodTeacher rules and you can check and edit each word (zhuyin follows). Your edits only affect that sentence in that bank, never GoodTeacher’s rules, other banks or the game’s own readings.",
     "<b>Size</b>: at least 10 sentences; up to 50 on the free plan and 80 with a subscription; sentences you write count too. Only text is shown here; pictures appear in “Try it”.",
     "<b>How many</b>: counted per game: 1 bank per game on the free plan, up to 5 with a subscription.",
     "<b>How students play</b>: the start page has just the name field and one “Start” card showing the bank name; each round is 10 random questions from the bank and does not change level stars. Game sentences keep their picture questions; sentences you write have no picture and use text questions (arrange cards from the translation, listen and choose the sentence, choose the sentence from the translation), with wrong options taken from other sentences in the bank.",
     "<b>Links</b>: the “Try it” link does not record scores (free plan too). With a subscription, pick the class on the “Links” tab and the bank under “Question source”: the class link sends scores back and the gradebook keeps them apart per bank."
    ],
    "note": "The bank code never changes: if you add or remove sentences later, links you already sent update automatically. If you delete the bank, those links stop working.",
    "plan": [
     "1 bank per game, 50 sentences, try-it link only",
     "5 banks per game, 80 sentences, class links that send scores"
    ]
   },
   {
    "id": "hSub",
    "h": "With a subscription you also get",
    "items": [
     "Classes (up to 3), with scores sent automatically to the gradebook",
     "Common mistakes in Compare & Guess, and CSV export",
     "Worksheets for each game (print / PDF, in each game’s “Worksheets” tab; language, pinyin / zhuyin and letter size work the same in all games)"
    ]
   }
  ]
 }
};
