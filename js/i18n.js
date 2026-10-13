// 介面文字：繁體中文、簡體中文、西班牙文、英文。每個詞條 = [繁, 简, es, en]。
// 語言代碼：tc / sc / es / en
(function(){
'use strict';
const LANGS = ['tc', 'sc', 'es', 'en'];
const HTML_LANG = { tc: 'zh-Hant', sc: 'zh-Hans', es: 'es', en: 'en' };
const D = {
  // ---- 全站 ----
  appTitle: ['老師管理中心', '教师管理中心', 'Centro del profesor', 'Teacher Center'],
  appSub: ['跑吧！漢字・色數消消樂・比比看', '跑吧！汉字・色数消消乐・比比看', 'Corre Hanzi · Pop Colores y Números · Compara y Adivina', 'Run Hanzi · Pop Colors & Numbers · Compare & Guess'],
  loading: ['載入中…', '载入中…', 'Cargando…', 'Loading…'],
  retry: ['重新載入', '重新载入', 'Recargar', 'Reload'],
  back: ['返回', '返回', 'Volver', 'Back'],
  close: ['關閉', '关闭', 'Cerrar', 'Close'],
  copyLink: ['複製連結', '复制链接', 'Copiar enlace', 'Copy link'],
  copied: ['已複製', '已复制', 'Copiado', 'Copied'],
  copyFail: ['複製失敗，請長按連結手動複製', '复制失败，请长按链接手动复制', 'No se pudo copiar; copia el enlace a mano', 'Copy failed; select the link and copy it by hand'],
  qr: ['QR code', 'QR code', 'Código QR', 'QR code'],
  qrDownload: ['下載圖片', '下载图片', 'Descargar imagen', 'Download image'],
  qrHint: ['學生用手機相機掃描就能打開。', '学生用手机相机扫描就能打开。', 'El alumno lo abre escaneándolo con la cámara del móvil.', 'Students open it by scanning with the phone camera.'],
  test: ['試玩', '试玩', 'Probar', 'Try it'],
  rename: ['改名', '改名', 'Renombrar', 'Rename'],
  del: ['刪除', '删除', 'Borrar', 'Delete'],
  on: ['開', '开', 'Sí', 'On'],
  off: ['關', '关', 'No', 'Off'],
  soon: ['之後開放', '之后开放', 'Próximamente', 'Coming soon'],
  permDenied: ['沒有權限。請確認已登入，而且方案還有效。', '没有权限。请确认已登录，而且方案还有效。', 'Sin permiso. Comprueba que has iniciado sesión y que tu suscripción está activa.', 'Permission denied. Check that you are signed in and your plan is active.'],
  network: ['連線失敗，請稍後再試。', '连线失败，请稍后再试。', 'Fallo de conexión. Inténtalo de nuevo más tarde.', 'Connection failed. Please try again later.'],

  // ---- 比比看：練習範圍（步驟 2）----
  bbkSetsTitle: ['比比看：練習範圍', '比比看：练习范围', 'Compara y Adivina: rangos de práctica', 'Compare & Guess: practice ranges'],
  bbkSetsHint: ['把常用的出題範圍存起來、取個名字。在班級頁選它就能做學生連結。之後改了範圍，已經發出去的連結也會跟著改。', '把常用的出题范围存起来、取个名字。在班级页选它就能做学生链接。之后改了范围，已经发出去的链接也会跟着改。', 'Guarda los rangos que más usas con un nombre. En la página de la clase puedes elegirlos para el enlace de alumnos. Si cambias un rango, los enlaces ya enviados también cambian.', 'Save the ranges you use often under a name. Pick one on the class page to make a student link. If you edit a range later, links already sent change too.'],
  bbkQuota: ['已存 {n} / {max} 組', '已存 {n} / {max} 组', '{n} / {max} guardados', '{n} / {max} saved'],
  bbkEmpty: ['還沒有存任何範圍。', '还没有存任何范围。', 'Aún no hay rangos guardados.', 'No saved ranges yet.'],
  bbkNew: ['新增範圍', '新增范围', 'Nuevo rango', 'New range'],
  bbkFullFree: ['免費方案最多存 3 組；訂閱可以存 15 組。', '免费方案最多存 3 组；订阅可以存 15 组。', 'El plan gratis guarda hasta 3; con suscripción, hasta 15.', 'The free plan saves up to 3; with a subscription, up to 15.'],
  bbkFullPro: ['已經存滿 15 組。要新增請先刪掉一組。', '已经存满 15 组。要新增请先删掉一组。', 'Ya tienes 15 guardados. Borra uno para añadir otro.', 'You already have 15. Delete one to add another.'],
  bbkDefaultName: ['範圍 {n}', '范围 {n}', 'Rango {n}', 'Range {n}'],
  bbkName: ['名稱', '名称', 'Nombre', 'Name'],
  bbkNamePh: ['例如：身高和年齡', '例如：身高和年龄', 'Ej.: estatura y edad', 'e.g. height and age'],
  bbkLevel: ['關卡', '关卡', 'Nivel', 'Level'],
  bbkDims: ['要考的特徵', '要考的特征', 'Rasgos a practicar', 'Features to practice'],
  bbkTypes: ['題型', '题型', 'Tipos de pregunta', 'Question types'],
  bbkCount: ['題數', '题数', 'Número de preguntas', 'Number of questions'],
  selectAll: ['全選', '全选', 'Todo', 'All'],
  clearAll: ['清除', '清除', 'Ninguno', 'None'],
  save: ['儲存', '保存', 'Guardar', 'Save'],
  cancel: ['取消', '取消', 'Cancelar', 'Cancel'],
  edit: ['編輯', '编辑', 'Editar', 'Edit'],
  saved: ['已儲存', '已保存', 'Guardado', 'Saved'],
  nQuestions: ['{n} 題', '{n} 题', '{n} preguntas', '{n} questions'],
  allDims: ['全部特徵', '全部特征', 'Todos los rasgos', 'All features'],
  allTypes: ['全部題型', '全部题型', 'Todos los tipos', 'All types'],
  bbkNeedPick: ['請至少各選一個特徵和題型。', '请至少各选一个特征和题型。', 'Elige al menos un rasgo y un tipo de pregunta.', 'Pick at least one feature and one question type.'],
  bbkFeasNote: ['提醒：特徵選太少時，有些題型可能湊不出題目。存好後可以按「試玩」看看。', '提醒：特征选太少时，有些题型可能凑不出题目。存好后可以按「试玩」看看。', 'Ojo: con pocos rasgos, algunos tipos de pregunta quizá no tengan suficientes preguntas. Después de guardar, pulsa «Probar».', 'Note: with few features, some question types may not have enough questions. After saving, press "Try it".'],
  bbkConfirmDel: ['確定刪除「{name}」？用這組範圍發出去的連結，學生打開會變回一般模式。', '确定删除「{name}」？用这组范围发出去的链接，学生打开会变回一般模式。', '¿Borrar «{name}»? Los enlaces enviados con este rango pasarán al modo normal.', 'Delete "{name}"? Links sent with this range will open in normal mode.'],
  bbkPractice: ['練習連結', '练习链接', 'Enlace de práctica', 'Practice link'],
  bbkPracticeHint: ['「練習連結」不用班級：學生打開直接練這個範圍，成績不會回傳。要收成績請到班級頁做連結。', '「练习链接」不用班级：学生打开直接练这个范围，成绩不会回传。要收成绩请到班级页做链接。', 'El «enlace de práctica» no necesita clase: el alumno practica este rango, pero las notas no se envían. Para recibir notas, crea el enlace en la página de la clase.', 'A "practice link" needs no class: students practice this range, but scores are not sent. To collect scores, make the link on the class page.'],
  bbkRangeLabel: ['出題範圍', '出题范围', 'Rango de preguntas', 'Question range'],
  bbkRangeNormal: ['一般模式（學生自己選關卡）', '一般模式（学生自己选关卡）', 'Modo normal (el alumno elige el nivel)', 'Normal mode (students pick the level)'],
  bbkNoSets: ['還沒有存範圍。可以到「遊戲設定」建立。', '还没有存范围。可以到「游戏设置」建立。', 'Aún no hay rangos. Puedes crearlos en «Ajustes de juegos».', 'No ranges yet. You can create them in "Game settings".'],
  bbkUnavailable: ['範圍設定暫時讀不到，請稍後重新載入。', '范围设置暂时读不到，请稍后重新载入。', 'No se pudieron cargar los rangos. Recarga más tarde.', 'Could not load the ranges. Please reload later.'],

  // ---- 登入 ----
  loginHint: ['每位老師用自己的 Google 帳號登入，只看得到自己的班級與成績。', '每位老师用自己的 Google 帐号登录，只看得到自己的班级与成绩。', 'Cada profesor entra con su cuenta de Google y solo ve sus propias clases y notas.', 'Each teacher signs in with their own Google account and sees only their own classes and scores.'],
  login: ['用 Google 登入', '用 Google 登录', 'Entrar con Google', 'Sign in with Google'],
  logout: ['登出', '登出', 'Salir', 'Sign out'],
  signedInAs: ['已登入：{email}', '已登录：{email}', 'Sesión: {email}', 'Signed in: {email}'],

  // ---- 導覽 ----
  navHome: ['首頁', '首页', 'Inicio', 'Home'],
  navClasses: ['班級', '班级', 'Clases', 'Classes'],
  navSettings: ['遊戲設定', '游戏设置', 'Ajustes de juegos', 'Game settings'],
  navPrint: ['列印', '打印', 'Imprimir', 'Print'],

  // ---- 首頁 ----
  planTitle: ['方案', '方案', 'Plan', 'Plan'],
  planFree: ['免費', '免费', 'Gratis', 'Free'],
  planPro: ['訂閱', '订阅', 'Suscripción', 'Subscription'],
  plan_month: ['月訂閱', '月订阅', 'Suscripción mensual', 'Monthly plan'],
  plan_year: ['年訂閱', '年订阅', 'Suscripción anual', 'Yearly plan'],
  plan_trial: ['試用', '试用', 'Prueba', 'Trial'],
  plan_pro: ['訂閱', '订阅', 'Suscripción', 'Subscription'],
  planDaysLeft: ['剩 {n} 天', '剩 {n} 天', 'quedan {n} días', '{n} days left'],
  planWasExpired: ['{plan}（已到期）', '{plan}（已到期）', '{plan} (vencida)', '{plan} (expired)'],
  planUntil: ['到期日 {date}', '到期日 {date}', 'Vence el {date}', 'Valid until {date}'],
  planExpired: ['已於 {date} 到期', '已于 {date} 到期', 'Venció el {date}', 'Expired on {date}'],
  planFreeNote: ['建立班級、成績簿、列印需要訂閱。', '建立班级、成绩簿、打印需要订阅。', 'Crear clases, ver notas e imprimir requiere suscripción.', 'Creating classes, gradebooks and printing need a subscription.'],
  planExpiredNote: ['訂閱已到期：學生的新成績傳不進來，舊的班級與成績仍可查看、匯出、刪除。', '订阅已到期：学生的新成绩传不进来，旧的班级与成绩仍可查看、导出、删除。', 'Suscripción vencida: no llegan notas nuevas; puedes ver, exportar y borrar las anteriores.', 'Subscription expired: new scores cannot come in; existing classes and scores can still be viewed, exported and deleted.'],
  subscribe: ['了解訂閱', '了解订阅', 'Ver suscripción', 'About subscribing'],
  usageTitle: ['用量', '用量', 'Uso', 'Usage'],
  usageClasses: ['班級（三款遊戲共用）', '班级（三款游戏共用）', 'Clases (compartidas por los 3 juegos)', 'Classes (shared by all 3 games)'],
  usageCorre: ['跑吧！漢字：句庫', '跑吧！汉字：句库', 'Corre Hanzi: bancos de frases', 'Run Hanzi: sentence banks'],
  usageColores: ['色數消消樂：設定組', '色数消消乐：设置组', 'Pop Colores y Números: configuraciones', 'Pop Colors & Numbers: setups'],
  usageBbk: ['比比看：設定存檔', '比比看：设置存档', 'Compara y Adivina: rangos guardados', 'Compare & Guess: saved ranges'],
  gamesTitle: ['三款遊戲', '三款游戏', 'Los tres juegos', 'The three games'],
  openGame: ['開啟遊戲', '打开游戏', 'Abrir el juego', 'Open the game'],
  gameCorre: ['跑吧！漢字', '跑吧！汉字', 'Corre Hanzi', 'Run Hanzi'],
  gameColores: ['色數消消樂', '色数消消乐', 'Pop Colores y Números', 'Pop Colors & Numbers'],
  gameBbk: ['比比看', '比比看', 'Compara y Adivina', 'Compare & Guess'],
  gameCorreDesc: ['依序吃掉詞語，排出正確的句子。', '依序吃掉词语，排出正确的句子。', 'Come las palabras en orden para formar la frase.', 'Eat the words in order to build the sentence.'],
  gameColoresDesc: ['聽數字選顏色、聽顏色輸入數字。', '听数字选颜色、听颜色输入数字。', 'Oye el número y elige el color, u oye el color y escribe el número.', 'Hear a number and pick the color, or hear a color and type the number.'],
  gameBbkDesc: ['看人物圖，練習比較句。', '看人物图，练习比较句。', 'Mira a las personas y practica las comparaciones.', 'Look at people and practice comparisons.'],

  // ---- 班級列表 ----
  classesTitle: ['我的班級', '我的班级', 'Mis clases', 'My classes'],
  classesHint: ['最多 3 個班級，三款遊戲共用；成績各遊戲分開記錄。', '最多 3 个班级，三款游戏共用；成绩各游戏分开记录。', 'Hasta 3 clases, compartidas por los tres juegos; las notas se guardan por juego.', 'Up to 3 classes, shared by the three games; scores are kept per game.'],
  classNamePh: ['班級名稱', '班级名称', 'Nombre de la clase', 'Class name'],
  createClass: ['建立班級', '建立班级', 'Crear clase', 'Create class'],
  needName: ['請輸入班級名稱', '请输入班级名称', 'Escribe el nombre de la clase', 'Please enter a class name'],
  lockedSlot: ['班級 {n}（訂閱後可建立）', '班级 {n}（订阅后可建立）', 'Clase {n} (con suscripción)', 'Class {n} (needs a subscription)'],
  noClasses: ['還沒有班級。', '还没有班级。', 'Aún no hay clases.', 'No classes yet.'],
  classesUnavailable: ['班級功能暫時讀不到。', '班级功能暂时读不到。', 'No se pudieron cargar las clases.', 'Classes could not be loaded.'],
  open: ['開啟', '打开', 'Abrir', 'Open'],

  // ---- 班級頁 ----
  allClasses: ['← 全部班級', '← 全部班级', '← Todas las clases', '← All classes'],
  classNameLabel: ['班級名稱', '班级名称', 'Nombre de la clase', 'Class name'],
  renamed: ['已改名', '已改名', 'Renombrada', 'Renamed'],
  deleteClass: ['刪除班級', '删除班级', 'Borrar la clase', 'Delete class'],
  confirmDelClass: ['確定刪除「{name}」？\n這個班級在三款遊戲（跑吧、色數、比比看）的所有成績會一起刪除，無法復原。', '确定删除「{name}」？\n这个班级在三款游戏（跑吧、色数、比比看）的所有成绩会一起删除，无法恢复。', '¿Borrar «{name}»?\nSe borrarán también todas las notas de esta clase en los tres juegos. No se puede deshacer.', 'Delete "{name}"?\nAll scores of this class in all three games will be deleted too. This cannot be undone.'],
  deleting: ['刪除中…', '删除中…', 'Borrando…', 'Deleting…'],
  boardTitle: ['班級排行榜', '班级排行榜', 'Ranking de la clase', 'Class leaderboard'],
  boardHint: ['開啟後，學生在跑吧、色數的結果畫面看得到全班排行。', '开启后，学生在跑吧、色数的结果画面看得到全班排行。', 'Si lo activas, los alumnos ven el ranking de la clase al terminar en Corre Hanzi y Pop Colores.', 'When on, students see the class ranking on the result screen of Run Hanzi and Pop Colors.'],
  linksTitle: ['學生連結', '学生链接', 'Enlaces para alumnos', 'Student links'],
  linksHint: ['學生打開連結、輸入暱稱，每一回合的成績會自動回傳到這個班級。', '学生打开链接、输入昵称，每一回合的成绩会自动回传到这个班级。', 'El alumno abre el enlace y escribe su apodo; las notas de cada ronda llegan a esta clase.', 'Students open the link and enter a nickname; each round is sent to this class automatically.'],
  sourceLabel: ['題目來源', '题目来源', 'Origen de las frases', 'Sentence source'],
  sourcePool: ['公開題庫（一般句子）', '公开题库（一般句子）', 'Banco público (frases generales)', 'Public bank (general sentences)'],
  configLabel: ['設定組', '设置组', 'Configuración', 'Setup'],
  configPick: ['— 請選一組設定 —', '— 请选一组设置 —', '— Elige una configuración —', '— Choose a setup —'],
  configNone: ['還沒有設定組。請先到色數消消樂的教師區建立一組。', '还没有设置组。请先到色数消消乐的教师区建立一组。', 'Aún no hay configuraciones. Crea una en la zona docente de Pop Colores y Números.', 'No setups yet. Create one in the teacher area of Pop Colors & Numbers.'],
  makeLink: ['產生連結', '生成链接', 'Generar enlace', 'Create link'],
  configNeedPick: ['請先選一組設定', '请先选一组设置', 'Elige primero una configuración', 'Choose a setup first'],
  configFail: ['產生連結失敗：{m}', '产生链接失败：{m}', 'No se pudo crear el enlace: {m}', 'Could not create the link: {m}'],
  bbkLinkNote: ['選一組範圍，學生打開就直接練那個範圍；改了範圍，這個連結也會跟著改。', '选一组范围，学生打开就直接练那个范围；改了范围，这个链接也会跟着改。', 'Con un rango, el alumno practica directamente ese rango; si lo editas, el enlace también cambia.', 'With a range, students go straight to that range; if you edit it, the link changes too.'],

  // ---- 成績 ----
  resultsTitle: ['成績', '成绩', 'Notas', 'Scores'],
  noScores: ['還沒有成績。把上面的連結傳給學生吧！', '还没有成绩。把上面的链接传给学生吧！', 'Aún no hay notas. ¡Comparte el enlace de arriba!', 'No scores yet. Share the link above with your students!'],
  filterAll: ['全部', '全部', 'Todo', 'All'],
  filter7: ['最近 7 天', '最近 7 天', 'Últimos 7 días', 'Last 7 days'],
  filter30: ['最近 30 天', '最近 30 天', 'Últimos 30 días', 'Last 30 days'],
  thNick: ['暱稱', '昵称', 'Apodo', 'Nickname'],
  thBest: ['最高分', '最高分', 'Mejor', 'Best'],
  thPlays: ['次數', '次数', 'Veces', 'Plays'],
  thDetail: ['詳細', '详细', 'Detalle', 'Details'],
  thLast: ['最近', '最近', 'Último', 'Last'],
  detailCorre: ['{n} 句 · {diff}', '{n} 句 · {diff}', '{n} frases · {diff}', '{n} sentences · {diff}'],
  detailColores: ['用時 {time}{cleared}', '用时 {time}{cleared}', 'Tiempo {time}{cleared}', 'Time {time}{cleared}'],
  clearedTag: [' · 全部清除', ' · 全部清除', ' · tablero limpio', ' · board cleared'],
  detailBbk: ['第一次就對 {p}%', '第一次就对 {p}%', 'Acierto a la primera {p}%', 'First try {p}%'],
  diff_facil: ['容易', '容易', 'Fácil', 'Easy'],
  diff_normal: ['普通', '普通', 'Normal', 'Normal'],
  diff_dificil: ['困難', '困难', 'Difícil', 'Hard'],
  refresh: ['重新整理', '重新整理', 'Actualizar', 'Refresh'],
  csv: ['匯出 CSV', '导出 CSV', 'Exportar CSV', 'Export CSV'],
  clearGame: ['清空這款遊戲的成績', '清空这款游戏的成绩', 'Borrar las notas de este juego', "Clear this game's scores"],
  confirmClear: ['確定清空「{game}」在這個班級的所有成績？無法復原。', '确定清空「{game}」在这个班级的所有成绩？无法恢复。', '¿Borrar todas las notas de «{game}» en esta clase? No se puede deshacer.', 'Clear all "{game}" scores in this class? This cannot be undone.'],
  confirmRow: ['確定刪除「{nick}」的成績？', '确定删除「{nick}」的成绩？', '¿Borrar las notas de «{nick}»?', 'Delete the scores of "{nick}"?'],
  students: ['{n} 位學生', '{n} 位学生', '{n} alumnos', '{n} students'],

  // ---- 比比看成績簿 ----
  tabStudents: ['學生', '学生', 'Alumnos', 'Students'],
  tabErrors: ['常錯統計', '常错统计', 'Errores frecuentes', 'Common mistakes'],
  tapStudent: ['點學生看個人的常錯統計。', '点学生看个人的常错统计。', 'Toca un alumno para ver sus errores.', "Tap a student to see their own mistakes."],
  errNote: ['最常錯的排在最上面。灰色＝題數少於 5，參考就好。', '最常错的排在最上面。灰色＝题数少于 5，参考就好。', 'Los más fallados van arriba. Gris = menos de 5 preguntas, solo orientativo.', 'Most-missed items are at the top. Grey = fewer than 5 questions, take with a grain of salt.'],
  noPlays: ['這段時間還沒有作答紀錄。', '这段时间还没有作答记录。', 'No hay respuestas en este periodo.', 'No answers in this period.'],
  thQs: ['題數', '题数', 'Preguntas', 'Questions'],
  thFirst: ['第一次就答對', '第一次就答对', 'Acierto a la primera', 'Correct on first try'],
  thRounds: ['回合', '回合', 'Rondas', 'Rounds'],
  secPattern: ['句型', '句型', 'Estructura', 'Pattern'],
  secFeature: ['特徵與形容詞', '特征与形容词', 'Rasgo y adjetivo', 'Feature and adjective'],
  secType: ['題型', '题型', 'Tipo de pregunta', 'Question type'],
  secTf: ['對錯題：句子本身', '对错题：句子本身', 'Verdadero/falso: la frase es', 'True/false: the sentence is'],
  tfTrue: ['本來就對的句子', '本来就对的句子', 'frase verdadera', 'true sentence'],
  tfFalse: ['本來是錯的句子', '本来是错的句子', 'frase falsa', 'false sentence'],
  studentBack: ['← 全班', '← 全班', '← Toda la clase', '← Whole class'],
  colTime: ['時間', '时间', 'Hora', 'Time'],
  colContent: ['內容', '内容', 'Contenido', 'Content'],
  colScore: ['分數', '分数', 'Puntos', 'Score'],
  levelN: ['第 {n} 關', '第 {n} 关', 'Nivel {n}', 'Level {n}'],
  rangeNormal: ['一般模式', '一般模式', 'Modo normal', 'Normal mode'],
  rangeTeacher: ['老師範圍', '老师范围', 'Rango del profesor', "Teacher's range"],
  delStudent: ['刪除這位學生的紀錄', '删除这位学生的记录', 'Borrar los registros de este alumno', "Delete this student's records"],
  confirmStudent: ['確定刪除「{nick}」在比比看的所有紀錄？', '确定删除「{nick}」在比比看的所有记录？', '¿Borrar todos los registros de «{nick}» en Compara y Adivina?', 'Delete all records of "{nick}" in Compare & Guess?'],

  // ---- 遊戲設定 ----
  settingsTitle: ['遊戲設定', '游戏设置', 'Ajustes de juegos', 'Game settings'],
  settingsHint: ['比比看的練習範圍已經搬進這裡；跑吧和色數目前先連到原本的設定頁，之後一款一款搬進來。', '比比看的练习范围已经搬进这里；跑吧和色数目前先连到原本的设置页，之后一款一款搬进来。', 'Los rangos de Compara y Adivina ya están aquí; Corre y Pop Colores enlazan por ahora a su página original y se irán trasladando.', 'Compare & Guess ranges now live here; Run Hanzi and Pop Colors still link to their original pages and will move here one by one.'],
  settingsCorre: ['句庫與學習單在「跑吧！漢字」教師頁。', '句库与学习单在「跑吧！汉字」教师页。', 'Los bancos de frases y las hojas están en la página docente de Corre Hanzi.', 'Sentence banks and worksheets are on the Run Hanzi teacher page.'],
  settingsColores: ['設定組在遊戲主選單最下面的「教師版」。', '设置组在游戏主选单最下面的「教师版」。', 'Las configuraciones están en «Versión docente», al final del menú del juego.', 'Setups are under "Teacher version" at the bottom of the game menu.'],
  settingsBbk: ['自選範圍在遊戲主選單最下面的「老師設定」。', '自选范围在游戏主选单最下面的「老师设置」。', 'El rango propio está en «Ajustes del profesor», al final del menú del juego.', 'Your own range is under "Teacher settings" at the bottom of the game menu.'],
  openSettingsPage: ['開啟設定頁', '打开设置页', 'Abrir ajustes', 'Open settings'],

  // ---- 列印 ----
  printTitle: ['列印', '打印', 'Imprimir', 'Print'],
  printHint: ['學習單與練習紙目前仍在各遊戲裡產生，之後會集中到這裡。', '学习单与练习纸目前仍在各游戏里生成，之后会集中到这里。', 'Las hojas de trabajo se siguen generando dentro de cada juego; luego se reunirán aquí.', 'Worksheets are still generated inside each game; they will be gathered here later.'],
  printCorre: ['學習單 PDF：在教師頁的句庫裡按「學習單」。', '学习单 PDF：在教师页的句库里按「学习单」。', 'Hoja en PDF: en la página docente, pulsa «Hoja de trabajo» en un banco.', 'Worksheet PDF: press "Worksheet" on a bank in the teacher page.'],
  printColores: ['學習單：即將新增（聽讀找色、看色寫數、著色版）。', '学习单：即将新增（听读找色、看色写数、着色版）。', 'Hojas de trabajo: próximamente (oír y buscar color, ver color y escribir número, colorear).', 'Worksheets: coming soon (listen and find color, see color and write number, coloring).'],
  printBbk: ['練習紙：在遊戲主選單的「老師設定」裡按「練習紙」。', '练习纸：在游戏主选单的「老师设置」里按「练习纸」。', 'Hoja de práctica: en «Ajustes del profesor» del juego, pulsa «Hoja de práctica».', 'Practice sheet: press "Practice sheet" in the in-game teacher settings.'],

  // ---- 比比看標籤（成績簿用）----
  p_BI: ['A 比 B ＋形容詞', 'A 比 B ＋形容词', 'A es más … que B', 'A is more … than B'],
  p_MEI: ['A 沒有 B 那麼…', 'A 没有 B 那么…', 'A no es tan … como B', 'A is not as … as B'],
  p_DEG: ['比…一點／很多', '比…一点／很多', 'un poco / mucho más', 'a little / a lot more'],
  p_DIFF: ['比…＋具體差距', '比…＋具体差距', 'diferencia exacta', 'exact difference'],
  p_GENG: ['比…更／還', '比…更／还', 'aún más', 'even more'],
  p_SAME: ['跟…一樣', '跟…一样', 'tan … como', 'as … as'],
  p_ABOUT: ['差不多', '差不多', 'casi igual', 'about the same'],
  p_DIFFER: ['不一樣', '不一样', 'no son iguales', 'not the same'],
  p_MORE: ['誰比較…？', '谁比较…？', '¿Quién es más…?', 'Who is more…?'],
  p_WHOBI: ['誰比 A …？', '谁比 A …？', '¿Quién es más … que A?', 'Who is more … than A?'],
  p_BIWHO: ['A 比誰…？', 'A 比谁…？', 'A es más … que ¿quién?', 'A is more … than whom?'],
  p_MOST: ['誰最…？', '谁最…？', '¿Quién es el más…?', 'Who is the most…?'],
  t_decode: ['看句子找人', '看句子找人', 'Encuentra a la persona', 'Find the person'],
  t_tf: ['對錯題', '对错题', 'Verdadero o falso', 'True or false'],
  t_pick: ['看圖選句子', '看图选句子', 'Elige la frase', 'Pick the sentence'],
  t_more: ['誰比較…', '谁比较…', '¿Quién es más…?', 'Who is more…?'],
  t_whobi: ['誰比…', '谁比…', '¿Quién … que X?', 'Who … than X?'],
  t_biwho: ['…比誰', '…比谁', 'X … que ¿quién?', '… than whom'],
  t_fill: ['填空', '填空', 'Completa la frase', 'Fill in the blank'],
  t_chain: ['連鎖解碼', '连锁解码', 'Decodifica en cadena', 'Chain decoding'],
  t_most: ['誰最…', '谁最…', '¿Quién es el más…?', 'Who is the most…?'],
  d_height: ['身高', '身高', 'Estatura', 'Height'],
  d_age: ['年齡', '年龄', 'Edad', 'Age'],
  d_build: ['胖瘦', '胖瘦', 'Complexión', 'Build'],
  d_hair: ['頭髮長短', '头发长短', 'Largo del pelo', 'Hair length'],
  d_eyes: ['眼睛大小', '眼睛大小', 'Tamaño de ojos', 'Eye size'],
  d_nose: ['鼻子大小', '鼻子大小', 'Tamaño de nariz', 'Nose size'],
  d_muscle: ['壯不壯', '壮不壮', 'Fuerza', 'Muscles'],
  d_tex: ['髮質（直／捲）', '发质（直／卷）', 'Tipo de pelo', 'Hair type'],
  d_skin: ['膚色', '肤色', 'Color de piel', 'Skin tone'],
  a_height_p: ['高', '高', 'alto', 'tall'], a_height_n: ['矮', '矮', 'bajo', 'short'],
  a_age_p: ['大', '大', 'mayor', 'old'], a_age_n: ['小', '小', 'menor', 'young'],
  a_build_p: ['胖', '胖', 'gordo', 'heavy'], a_build_n: ['瘦', '瘦', 'delgado', 'thin'],
  a_hair_p: ['長', '长', 'largo', 'long'], a_hair_n: ['短', '短', 'corto', 'short'],
  a_eyes_p: ['大', '大', 'grandes', 'big'], a_eyes_n: ['小', '小', 'pequeños', 'small'],
  a_nose_p: ['大', '大', 'grande', 'big'], a_nose_n: ['小', '小', 'pequeña', 'small'],
  a_muscle_p: ['壯', '壮', 'fuerte', 'strong'], a_muscle_n: ['不壯', '不壮', 'no fuerte', 'not strong'],
  a_tex_p: ['捲', '卷', 'rizado', 'curly'], a_tex_n: ['直', '直', 'lacio', 'straight'],
  a_skin_p: ['白', '白', 'clara', 'light'], a_skin_n: ['黑', '黑', 'oscura', 'dark']
};
function langOk(l){ return LANGS.indexOf(l) >= 0; }
function detect(){
  try{ const s = localStorage.getItem('profesorLang'); if(langOk(s)) return s; }catch(e){}
  const n = (navigator.language || '').toLowerCase();
  if(n.indexOf('es') === 0) return 'es';
  if(n.indexOf('zh') === 0) return /cn|sg|hans/.test(n) ? 'sc' : 'tc';
  if(n.indexOf('en') === 0) return 'en';
  return 'tc';
}
let LANG = detect();
function t(key, params){
  const v = D[key];
  let s = v ? v[LANGS.indexOf(LANG)] : key;
  if(params) Object.keys(params).forEach(k => { s = s.split('{' + k + '}').join(params[k]); });
  return s;
}
function setLang(l){ if(!langOk(l)) return; LANG = l; try{ localStorage.setItem('profesorLang', l); }catch(e){} document.documentElement.lang = HTML_LANG[l]; }
document.documentElement.lang = HTML_LANG[LANG];
window.I18N = { t, setLang, getLang: () => LANG, LANGS, D };
})();
