(async () => {
  try {
    const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getFirestore, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');

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
          position:relative;overflow:hidden;
          background:#f9fafc;border-radius:56px;padding:64px 72px 68px;
          text-align:center;max-width:600px;width:100%;
          border:1.5px solid #dfe3e8;
          box-shadow:0 1px 2px rgba(25,27,30,.03),0 40px 70px -36px rgba(25,27,30,.22);
        }
        #maint-glow {
          position:absolute;top:-90px;left:50%;transform:translateX(-50%);
          width:340px;height:340px;border-radius:50%;
          background:radial-gradient(circle,rgba(30,222,123,.35),rgba(30,222,123,0) 70%);
          filter:blur(10px);pointer-events:none;
        }
        #maint-art { position:relative;width:132px;height:132px;margin:0 auto 32px; }
        #maint-art svg { width:100%;height:100%;display:block; }
        #maint-label { position:relative;font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:.1em;color:#149955;margin-bottom:18px; }
        #maint-title { position:relative;font-size:clamp(34px,5.5vw,52px);font-weight:500;letter-spacing:-.04em;line-height:1.08;color:#191b1e;margin:0 0 18px; }
        #maint-title em { font-style:normal;color:#1ede7b; }
        #maint-text { position:relative;font-size:15px;color:#707a8a;font-weight:300;line-height:1.6;max-width:400px;margin:0 auto; }
        @media(max-width:600px){ #maint-card { border-radius:32px;padding:48px 26px 44px; } #maint-art { width:104px;height:104px;margin-bottom:24px; } }
      `;
      document.head.appendChild(style);
      mo = document.createElement('div');
      mo.id = 'maint-overlay';
      mo.innerHTML = `
        <div id="maint-card">
          <div id="maint-glow"></div>
          <div id="maint-art">
            <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="mGradTile" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#191b1e"/><stop offset="1" stop-color="#2b2f33"/>
                </linearGradient>
                <linearGradient id="mGradGear" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#4eea94"/><stop offset="1" stop-color="#149955"/>
                </linearGradient>
                <filter id="mShadow" x="-40%" y="-40%" width="180%" height="180%">
                  <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#191b1e" flood-opacity="0.35"/>
                </filter>
              </defs>
              <rect x="8" y="8" width="144" height="144" rx="40" fill="url(#mGradTile)" filter="url(#mShadow)"/>
              <circle cx="128" cy="34" r="4" fill="#ffffff" opacity=".18"/>
              <circle cx="138" cy="52" r="2.5" fill="#ffffff" opacity=".14"/>
              <circle cx="30" cy="126" r="3" fill="#1ede7b" opacity=".3"/>
              <path d="M 77.5 58.0 L 81.9 65.2 L 81.0 67.8 L 72.9 70.5 L 72.9 70.5 L 71.7 78.9 L 69.3 80.3 L 61.4 77.2 L 61.4 77.2 L 55.0 82.8 L 52.3 82.3 L 48.2 74.9 L 48.2 74.9 L 39.8 75.1 L 38.0 73.0 L 39.7 64.7 L 39.7 64.7 L 33.0 59.4 L 33.0 56.6 L 39.7 51.3 L 39.7 51.3 L 38.0 43.0 L 39.8 40.9 L 48.2 41.1 L 48.2 41.1 L 52.3 33.7 L 55.0 33.2 L 61.4 38.8 L 61.4 38.8 L 69.3 35.7 L 71.7 37.1 L 72.9 45.5 L 72.9 45.5 L 81.0 48.2 L 81.9 50.8 L 77.5 58.0 Z"
                fill="url(#mGradGear)"/>
              <circle cx="57" cy="58" r="8" fill="#191b1e"/>
              <path d="M 108.0 90.0 L 110.9 95.9 L 109.9 98.0 L 103.5 99.4 L 103.5 99.4 L 100.7 105.3 L 98.4 105.8 L 93.3 101.7 L 93.3 101.7 L 86.9 103.2 L 85.2 101.8 L 85.2 95.2 L 85.2 95.2 L 80.0 91.1 L 80.0 88.9 L 85.2 84.8 L 85.2 84.8 L 85.2 78.2 L 86.9 76.8 L 93.3 78.3 L 93.3 78.3 L 98.4 74.2 L 100.7 74.7 L 103.5 80.6 L 103.5 80.6 L 109.9 82.0 L 108.0 90.0 Z"
                fill="#ffffff" opacity=".92"/>
              <circle cx="96" cy="90" r="5" fill="#191b1e"/>
            </svg>
          </div>
          <div id="maint-label">Технические работы</div>
          <h1 id="maint-title">Скоро<br><em>вернёмся</em></h1>
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
        // Раньше тут был signOut(auth) при показе бана — но это триггерило
        // auth-listener'ы на других страницах (у некоторых при user=null стоит
        // редирект на "/"), и редирект сносил только что показанный оверлей
        // раньше, чем пользователь успевал его увидеть. Сам оверлей ниже уже
        // полностью блокирует страницу — signOut для этого не нужен.

        const style = document.createElement('style');
        style.textContent = `
          #ban-overlay {
            position:fixed;inset:0;z-index:99999;background:#fff;
            display:flex;align-items:center;justify-content:center;
            padding:24px;font-family:Geologica,Inter,Arial,sans-serif;
          }
          #ban-card {
            position:relative;overflow:hidden;
            background:#f9fafc;border-radius:56px;padding:64px 72px 68px;
            text-align:center;max-width:600px;width:100%;
            border:1.5px solid #dfe3e8;
            box-shadow:0 1px 2px rgba(25,27,30,.03),0 40px 70px -36px rgba(25,27,30,.22);
          }
          #ban-glow {
            position:absolute;top:-90px;left:50%;transform:translateX(-50%);
            width:340px;height:340px;border-radius:50%;
            background:radial-gradient(circle,rgba(232,99,79,.32),rgba(232,99,79,0) 70%);
            filter:blur(10px);pointer-events:none;
          }
          #ban-art { position:relative;width:132px;height:132px;margin:0 auto 32px; }
          #ban-art svg { width:100%;height:100%;display:block; }
          #ban-label { position:relative;font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:.1em;color:#e8634f;margin-bottom:18px; }
          #ban-title { position:relative;font-size:clamp(34px,5.5vw,52px);font-weight:500;letter-spacing:-.04em;line-height:1.08;color:#191b1e;margin:0 0 18px; }
          #ban-title em { font-style:normal;color:#e8634f; }
          #ban-text { position:relative;font-size:15px;color:#707a8a;font-weight:300;line-height:1.6;max-width:400px;margin:0 auto 22px; }
          #ban-until { position:relative;display:inline-flex;align-items:center;gap:7px;font-size:13px;color:#191b1e;font-weight:500;margin:0 0 28px;background:rgba(232,99,79,.09);border:1px solid rgba(232,99,79,.22);padding:.5rem 1rem;border-radius:12px; }
          #ban-btn { position:relative;display:inline-flex;align-items:center;gap:8px;margin-top:4px;background:#191b1e;color:#fff;text-decoration:none;font-size:14px;font-weight:500;padding:14px 30px;border-radius:15px;transition:background .15s,transform .12s,box-shadow .15s;box-shadow:0 1px 2px rgba(25,27,30,.15),0 14px 26px -12px rgba(25,27,30,.5); }
          #ban-btn:hover { background:#2b2f33;transform:translateY(-1px); }
          @media(max-width:600px){ #ban-card { border-radius:32px;padding:48px 26px 44px; } #ban-art { width:104px;height:104px;margin-bottom:24px; } }
        `;
        document.head.appendChild(style);

        const until = fmtBanDate(banData);
        const reason = (banData.reason || 'Нарушение правил использования сервиса').replace(/[<>]/g, '');
        const showBtn = banData.showButton !== false && banData.btnUrl;

        bo = document.createElement('div');
        bo.id = 'ban-overlay';
        bo.innerHTML = `
          <div id="ban-card">
            <div id="ban-glow"></div>
            <div id="ban-art">
              <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="bGradTile" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#191b1e"/><stop offset="1" stop-color="#2b2f33"/>
                  </linearGradient>
                  <linearGradient id="bGradLock" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#ff8a75"/><stop offset="1" stop-color="#e8634f"/>
                  </linearGradient>
                  <filter id="bShadow" x="-40%" y="-40%" width="180%" height="180%">
                    <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#191b1e" flood-opacity="0.35"/>
                  </filter>
                </defs>
                <rect x="8" y="8" width="144" height="144" rx="40" fill="url(#bGradTile)" filter="url(#bShadow)"/>
                <circle cx="128" cy="34" r="4" fill="#ffffff" opacity=".18"/>
                <circle cx="138" cy="52" r="2.5" fill="#ffffff" opacity=".14"/>
                <circle cx="30" cy="126" r="3" fill="#e8634f" opacity=".35"/>
                <path d="M58 76 V58 A22 22 0 0 1 102 58 V76" fill="none" stroke="url(#bGradLock)" stroke-width="9" stroke-linecap="round"/>
                <rect x="44" y="74" width="72" height="56" rx="16" fill="url(#bGradLock)"/>
                <ellipse cx="80" cy="86" rx="26" ry="7" fill="#ffffff" opacity=".16"/>
                <circle cx="80" cy="98" r="8" fill="#191b1e"/>
                <path d="M76 104 L84 104 L81.5 118 L78.5 118 Z" fill="#191b1e"/>
              </svg>
            </div>
            <div id="ban-label">Доступ ограничен</div>
            <h1 id="ban-title">Аккаунт<br><em>заблокирован</em></h1>
            <p id="ban-text">${reason}</p>
            <div id="ban-until">${until ? `До ${until}` : 'Блокировка бессрочная'}</div><br>
            ${showBtn ? `<a id="ban-btn" href="${banData.btnUrl}" target="_blank" rel="noopener">${(banData.btnLabel || 'Написать в поддержку').replace(/[<>]/g, '')} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>` : ''}
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
      if (!mo) document.body.style.overflow = '';
    }
  } catch(e) {}
})();
