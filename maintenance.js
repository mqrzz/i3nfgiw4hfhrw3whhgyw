(async () => {
  try {
    const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getFirestore, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const { getAuth, onAuthStateChanged, signOut } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');

    const firebaseConfig = {
      apiKey: "AIzaSyBLGr2hpmnmj1Mxf9072m8vQXJkLUN6YyY",
      authDomain: "antviz-515c8.firebaseapp.com",
      projectId: "antviz-515c8",
      storageBucket: "antviz-515c8.firebasestorage.app",
      messagingSenderId: "140073712504",
      appId: "1:140073712504:web:8a844268e38229cebde68d"
    };
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

    const db = getFirestore(app);
    const auth = getAuth(app);
    const ADMIN = 'wbtipoofficialcom@gmail.com';

    let mo = null, bo = null;
    let currentUser = null, authReady = false;
    let maintOn = null, banData = null, banChecked = false;
    let signedOutForBan = false;

    // ===== Кэш в sessionStorage — общий принцип для обеих проверок:
    // тех.работы почти всегда выключены, бан почти всегда отсутствует,
    // незачем читать Firestore на каждом переходе между страницами.
    const MAINT_KEY = 'antviz_maint_status';
    const MAINT_TTL_OFF = 5 * 60 * 1000;
    const MAINT_TTL_ON  = 20 * 1000;
    function readMaintCache() {
      try {
        const raw = sessionStorage.getItem(MAINT_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        const ttl = data.on ? MAINT_TTL_ON : MAINT_TTL_OFF;
        if (Date.now() - data.ts > ttl) return null;
        return data.on;
      } catch (e) { return null; }
    }
    function writeMaintCache(on) {
      try { sessionStorage.setItem(MAINT_KEY, JSON.stringify({ on, ts: Date.now() })); } catch (e) {}
    }

    const BAN_KEY = 'antviz_ban_status';
    const BAN_TTL_OFF = 60 * 1000;
    const BAN_TTL_ON  = 15 * 1000;
    function banCacheKey(uid) { return BAN_KEY + ':' + uid; }
    function readBanCache(uid) {
      try {
        const raw = sessionStorage.getItem(banCacheKey(uid));
        if (!raw) return undefined;
        const data = JSON.parse(raw);
        const ttl = data.ban ? BAN_TTL_ON : BAN_TTL_OFF;
        if (Date.now() - data.ts > ttl) return undefined;
        return data.ban;
      } catch (e) { return undefined; }
    }
    function writeBanCache(uid, ban) {
      try { sessionStorage.setItem(banCacheKey(uid), JSON.stringify({ ban, ts: Date.now() })); } catch (e) {}
    }
    function isBanActive(ban) {
      if (!ban) return false;
      if (!ban.until) return true;
      const untilMs = ban.until.seconds ? ban.until.seconds * 1000 : new Date(ban.until).getTime();
      return untilMs > Date.now();
    }
    function fmtBanDate(ban) {
      if (!ban || !ban.until) return null;
      const ms = ban.until.seconds ? ban.until.seconds * 1000 : new Date(ban.until).getTime();
      return new Date(ms).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    // ===== Тех.работы — не зависят от авторизации, стартуют сразу
    (async () => {
      const cached = readMaintCache();
      if (cached !== null) { maintOn = cached; render(); return; }
      try {
        const snap = await getDoc(doc(db, 'settings', 'maintenance'));
        maintOn = snap.exists() && snap.data().enabled === true;
        writeMaintCache(maintOn);
      } catch (e) { maintOn = false; }
      render();
    })();

    // ===== Бан — только для авторизованных, ждёт onAuthStateChanged
    onAuthStateChanged(auth, async user => {
      currentUser = user;
      authReady = true;

      if (!user || user.email === ADMIN) { banData = null; banChecked = true; render(); return; }

      const cached = readBanCache(user.uid);
      if (cached !== undefined) { banData = cached; banChecked = true; render(); return; }
      try {
        const snap = await getDoc(doc(db, 'bans', user.uid));
        banData = snap.exists() ? snap.data() : null;
        writeBanCache(user.uid, banData);
      } catch (e) { banData = null; }
      banChecked = true;
      render();
    });

    function render() {
      if (!authReady || maintOn === null) return;

      // Админа не блокируем ничем — ни тех.работами, ни (не должно случиться) баном
      if (currentUser?.email === ADMIN) {
        removeMaint(); removeBan();
        return;
      }

      // Тех.работы важнее бана — если сайт лежит для всех, экран бана не нужен
      if (maintOn) {
        removeBan();
        renderMaint();
        return;
      }
      removeMaint();

      if (!banChecked) return; // ещё не знаем статус бана — не мигаем оверлеем
      renderBan();
    }

    function renderMaint() {
      if (mo) return;
      const style = document.createElement('style');
      style.textContent = `
        #maint-overlay {
          position:fixed;inset:0;z-index:99999;background:#fff;
          display:flex;align-items:center;justify-content:center;
          padding:24px;font-family:Geologica,Inter,Arial,sans-serif;
        }
        #maint-card {
          background:#f2f4f7;border-radius:64px;padding:64px 100px 80px;
          text-align:center;max-width:700px;width:100%;
          border:1.5px solid #dfe3e8;
        }
        #maint-label { font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:.1em;color:#1ede7b;margin-bottom:24px; }
        #maint-title { font-size:clamp(40px,7vw,80px);font-weight:500;letter-spacing:-.04em;line-height:1.02;color:#191b1e;margin:0 0 20px; }
        #maint-text { font-size:clamp(15px,1.5vw,18px);color:#707a8a;font-weight:300;line-height:1.6;max-width:440px;margin:0 auto; }
        @media(max-width:600px){ #maint-card { border-radius:32px;padding:40px 24px 52px; } }
      `;
      document.head.appendChild(style);
      mo = document.createElement('div');
      mo.id = 'maint-overlay';
      mo.innerHTML = `
        <div id="maint-card">
          <div id="maint-label">Технические работы</div>
          <h1 id="maint-title">Скоро <em style="font-style:normal;color:#1ede7b">вернёмся</em></h1>
          <p id="maint-text">Сайт временно недоступен — идут технические работы. Обычно это занимает не больше часа.</p>
        </div>`;
      document.body.appendChild(mo);
      document.body.style.overflow = 'hidden';
    }
    function removeMaint() {
      if (!mo) return;
      mo.remove(); mo = null;
      if (!bo) document.body.style.overflow = '';
    }

    function renderBan() {
      const banned = isBanActive(banData);
      if (banned && !bo) {
        if (!signedOutForBan) { signedOutForBan = true; signOut(auth).catch(() => {}); }

        const style = document.createElement('style');
        style.textContent = `
          #ban-overlay {
            position:fixed;inset:0;z-index:99999;background:#fff;
            display:flex;align-items:center;justify-content:center;
            padding:24px;font-family:Geologica,Inter,Arial,sans-serif;
          }
          #ban-card {
            background:#f2f4f7;border-radius:64px;padding:64px 100px 80px;
            text-align:center;max-width:700px;width:100%;
            border:1.5px solid #dfe3e8;
          }
          #ban-label { font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:.1em;color:#e8634f;margin-bottom:24px; }
          #ban-title { font-size:clamp(40px,7vw,80px);font-weight:500;letter-spacing:-.04em;line-height:1.02;color:#191b1e;margin:0 0 20px; }
          #ban-text { font-size:clamp(15px,1.5vw,18px);color:#707a8a;font-weight:300;line-height:1.6;max-width:440px;margin:0 auto 12px; }
          #ban-until { font-size:14px;color:#191b1e;font-weight:400;margin:0 0 28px; }
          #ban-btn { display:inline-block;margin-top:8px;background:#191b1e;color:#fff;text-decoration:none;font-size:14px;font-weight:500;padding:14px 32px;border-radius:16px;transition:opacity .15s; }
          #ban-btn:hover { opacity:.85; }
          @media(max-width:600px){ #ban-card { border-radius:32px;padding:40px 24px 52px; } }
        `;
        document.head.appendChild(style);

        const until = fmtBanDate(banData);
        const reason = (banData.reason || 'Нарушение правил использования сервиса').replace(/[<>]/g, '');
        const showBtn = banData.showButton !== false && banData.btnUrl;

        bo = document.createElement('div');
        bo.id = 'ban-overlay';
        bo.innerHTML = `
          <div id="ban-card">
            <div id="ban-label">Доступ ограничен</div>
            <h1 id="ban-title">Аккаунт <em style="font-style:normal;color:#e8634f">заблокирован</em></h1>
            <p id="ban-text">${reason}</p>
            ${until ? `<p id="ban-until">Блокировка действует до ${until}</p>` : `<p id="ban-until">Блокировка бессрочная</p>`}
            ${showBtn ? `<a id="ban-btn" href="${banData.btnUrl}" target="_blank" rel="noopener">${(banData.btnLabel || 'Написать в поддержку').replace(/[<>]/g, '')}</a>` : ''}
          </div>`;
        document.body.appendChild(bo);
        document.body.style.overflow = 'hidden';
      } else if (!banned) {
        removeBan();
      }
    }
    function removeBan() {
      if (!bo) return;
      bo.remove(); bo = null;
      signedOutForBan = false;
      if (!mo) document.body.style.overflow = '';
    }
  } catch(e) {}
})();
