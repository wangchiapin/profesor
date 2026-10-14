/* 模擬 Firebase compat SDK（記憶體內），改自 corre/tests/firebase-mock.js（比比看版）。管理中心測試用。
   測試在載入頁面前設定：
     window.__SEED = { projectId: { collection: { docId: data } } }
     window.__USER = null（未登入）或 { uid, email, isAnonymous }
     window.__GOOGLE = 按「用 Google 登入」後變成的使用者
   另外模擬 class_plays 的寫入規則（班級存在、owner 相符、老師訂閱中、欄位格式），用來測試失敗路徑。 */
(function(){
  const SEED = window.__SEED || {};
  const DB = {};
  window.__reads = {}; window.__writes = [];
  const clone = v => JSON.parse(JSON.stringify(v));
  Object.keys(SEED).forEach(pid => { DB[pid] = clone(SEED[pid]); });
  const col = (pid, c) => (DB[pid] = DB[pid] || {}, DB[pid][c] = DB[pid][c] || {});
  let seq = 0;
  const deny = () => { const e = new Error('Missing or insufficient permissions.'); e.code = 'permission-denied'; throw e; };
  const NOW = () => Date.now();
  function stamp(d){ const o = {}; for(const k in d) o[k] = (d[k] && d[k].__ts) ? NOW() : d[k]; return o; }
  function checkWrite(pid, c, id, data, user){
    // 比比看範圍：照 firestore-rules-step2.txt 的規則模擬（額度：免費 3、訂閱 15；到期後只能變少或不變）
    if(c === 'bbk_sets'){
      if(!user || user.uid !== id) deny();
      const p = col(pid, 'site_plans')[id], pro = !!(p && p.expiresAt > NOW()), n = data.items.length;
      const before = col(pid, c)[id] ? col(pid, c)[id].items.length : -1;
      if(!(n <= 3 || (pro && n <= 15) || (before >= 0 && n <= before))) deny();
      return;
    }
    if(c === 'shared_bbk'){
      if(!user || data.owner !== user.uid) deny();
      const old = col(pid, c)[id]; if(old && old.owner !== user.uid) deny();
      const keys = Object.keys(data).sort().join();
      if(keys !== ['d','lv','n','name','owner','t','th','updatedAt'].join()) deny();
      return;
    }
    // 跑吧句庫：照 corre/teacher/firestore.rules.txt 的重點模擬（位置 1–4 或超過 50 句要訂閱中；每庫最多 80 句；本人才能寫）
    if(c === 'teacher_banks'){
      if(!user || user.uid !== id) deny();
      const p = col(pid, 'site_plans')[id], pro = !!(p && p.expiresAt > NOW());
      const keys = Object.keys(data.slots || {}), before = col(pid, c)[id] ? Object.keys(col(pid, c)[id].slots || {}) : [];
      if(!pro && keys.some(k => k !== '0' && before.indexOf(k) < 0)) deny();
      return;
    }
    if(c === 'shared_banks'){
      if(!user || data.owner !== user.uid) deny();
      const old = col(pid, c)[id]; if(old && (old.owner !== user.uid || old.slot !== data.slot)) deny();
      const p = col(pid, 'site_plans')[user.uid], pro = !!(p && p.expiresAt > NOW());
      const ok = Object.keys(data).every(k => ['owner','slot','name','speed','script','boss','phonetic','sentences','pro','updatedAt'].indexOf(k) >= 0)
        && data.sentences.length >= 1 && data.sentences.length <= 80 && data.pro === (data.slot > 0 || data.sentences.length > 50) && (!data.pro || pro)
        && ['facil','normal','dificil'].indexOf(data.speed) >= 0 && ['trad','simp'].indexOf(data.script) >= 0 && typeof data.boss === 'boolean'
        && data.name.length >= 1 && data.name.length <= 40;
      if(!ok) deny();
      return;
    }
    if(c !== 'class_plays') return;
    const d = data, keys = Object.keys(d).sort().join();
    if(keys !== ['at','cid','game','h','lv','max','nick','owner','qs','rg','score','th'].sort().join()) deny();
    const cls = col(pid, 'classes')[d.cid]; if(!cls || cls.owner !== d.owner) deny();
    const p = col(pid, 'site_plans')[d.owner]; if(!p || !(p.expiresAt > NOW())) deny();
    if(!user) deny();
    if(d.game !== 'bbk' || !/^[a-f0-9]{16}$/.test(d.h) || !(d.nick.length >= 1 && d.nick.length <= 16)) deny();
    if(!(d.lv >= 1 && d.lv <= 3) || !(d.score >= 0 && d.score <= d.max) || !(d.qs.length >= 1 && d.qs.length <= 30)) deny();
  }
  function docSnap(pid, c, id){
    const data = col(pid, c)[id];
    return { id, exists: data !== undefined, data: () => (data === undefined ? undefined : clone(data)) };
  }
  let auth = null;
  const OPS = { '==': (a, b) => a === b, '>=': (a, b) => a >= b, '<': (a, b) => a < b };
  function Query(pid, c, filters, lim, ord, after){
    return {
      where: (f, op, v) => Query(pid, c, filters.concat([[f, op, v]]), lim, ord, after),
      limit: n => Query(pid, c, filters, n, ord, after),
      orderBy: f => Query(pid, c, filters, lim, f, after),
      startAfter: d => Query(pid, c, filters, lim, ord, d),
      get: async () => {
        let ids = Object.keys(col(pid, c)).filter(id => filters.every(([f, op, v]) => OPS[op](col(pid, c)[id][f], v)));
        if(ord){ ids.sort((a, b) => col(pid, c)[a][ord] - col(pid, c)[b][ord]); if(after) ids = ids.filter(id => col(pid, c)[id][ord] > after.data()[ord]); }
        if(c === 'class_plays' && !filters.some(([f, , v]) => f === 'owner' && auth.currentUser && v === auth.currentUser.uid)) deny();
        if(lim != null) ids = ids.slice(0, lim);
        window.__reads[pid] = (window.__reads[pid] || 0) + Math.max(1, ids.length);
        const docs = ids.map(id => docSnap(pid, c, id));
        return { docs, empty: !docs.length, size: docs.length, forEach: fn => docs.forEach(fn) };
      }
    };
  }
  function makeFirestore(pid){
    const ref = (c, id) => ({
      id,
      get: async () => { window.__reads[pid] = (window.__reads[pid] || 0) + 1; return docSnap(pid, c, id); },
      set: async d => { const v = stamp(d); checkWrite(pid, c, id, v, auth.currentUser); col(pid, c)[id] = clone(v); window.__writes.push(c + '/' + id); },
      delete: async () => { delete col(pid, c)[id]; window.__writes.push('del ' + c + '/' + id); }
    });
    return {
      collection: c => Object.assign(Query(pid, c, [], null), {
        doc: id => ref(c, id),
        add: async d => { const id = 'auto' + (++seq); await ref(c, id).set(d); return { id }; }
      }),
      batch: () => { const ops = []; return {
        set: (r, d) => ops.push(() => r.set(d)), delete: r => ops.push(() => r.delete()),
        commit: async () => { for(const o of ops) await o(); } }; }
    };
  }
  function makeAuth(){
    const cbs = [];
    const a = {
      currentUser: window.__USER || null,
      onAuthStateChanged: fn => { cbs.push(fn); setTimeout(() => fn(a.currentUser), 0); },
      signInAnonymously: async () => { a.currentUser = { uid: 'anon' + Math.random().toString(36).slice(2, 7), isAnonymous: true }; cbs.forEach(f => f(a.currentUser)); },
      signInWithPopup: async () => { a.currentUser = window.__GOOGLE; cbs.forEach(f => f(a.currentUser)); },
      signInWithRedirect: async () => {},
      signOut: async () => { a.currentUser = null; cbs.forEach(f => f(null)); }
    };
    return a;
  }
  const apps = {};
  window.firebase = {
    initializeApp(cfg, name){
      const n = name || '[DEFAULT]'; if(apps[n]) throw new Error('app exists: ' + n);
      const fs = makeFirestore(cfg.projectId); auth = auth || makeAuth();   // 第二個 app（公開題庫）不換掉登入
      apps[n] = { name: n, options: cfg, firestore: () => fs, auth: () => auth };
      window.__apps = Object.keys(apps).map(k => k + ':' + apps[k].options.projectId);
      return apps[n];
    },
    auth: Object.assign(() => apps['[DEFAULT]'].auth(), { GoogleAuthProvider: function(){} }),
    firestore: Object.assign(() => apps['[DEFAULT]'].firestore(), { FieldValue: { serverTimestamp: () => ({ __ts: 1 }) } })
  };
  window.__DB = DB;
})();
