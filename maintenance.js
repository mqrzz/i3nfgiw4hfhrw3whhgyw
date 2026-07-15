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
        #maint-art {
          position:relative;width:104px;height:104px;margin:0 auto 32px;border-radius:30px;
          background:linear-gradient(135deg,#4eea94,#149955);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 20px 40px -14px rgba(20,153,85,.55);
        }
        #maint-art svg { width:50px;height:50px;stroke:#fff;stroke-width:1.7;fill:none;stroke-linecap:round;stroke-linejoin:round; }
        #maint-label { position:relative;font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:.1em;color:#149955;margin-bottom:18px; }
        #maint-title { position:relative;font-size:clamp(34px,5.5vw,52px);font-weight:500;letter-spacing:-.04em;line-height:1.08;color:#191b1e;margin:0 0 18px; }
        #maint-title em { font-style:normal;color:#1ede7b; }
        #maint-text { position:relative;font-size:15px;color:#707a8a;font-weight:300;line-height:1.6;max-width:400px;margin:0 auto; }
        @media(max-width:600px){ #maint-card { border-radius:32px;padding:48px 26px 44px; } #maint-art { width:88px;height:88px;border-radius:26px;margin-bottom:24px; } #maint-art svg { width:42px;height:42px; } }
      `;
      document.head.appendChild(style);
      mo = document.createElement('div');
      mo.id = 'maint-overlay';
      mo.innerHTML = `
        <div id="maint-card">
          <div id="maint-glow"></div>
          <div id="maint-art"><svg viewBox="0 0 24 24"><path d="M14.5 6.2a3.6 3.6 0 0 0-4.9 4.66l-5.6 5.6a1.9 1.9 0 0 0 2.7 2.7l5.6-5.6a3.6 3.6 0 0 0 4.66-4.9l-2.53 2.53-2-2z"/></svg></div>
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
          #ban-art {
            position:relative;width:104px;height:104px;margin:0 auto 32px;border-radius:30px;
            background:linear-gradient(135deg,#ff8a75,#e8634f);
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 20px 40px -14px rgba(232,99,79,.55);
          }
          #ban-art svg { width:50px;height:50px;stroke:#fff;stroke-width:1.7;fill:none;stroke-linecap:round;stroke-linejoin:round; }
          #ban-label { position:relative;font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:.1em;color:#e8634f;margin-bottom:18px; }
          #ban-title { position:relative;font-size:clamp(34px,5.5vw,52px);font-weight:500;letter-spacing:-.04em;line-height:1.08;color:#191b1e;margin:0 0 18px; }
          #ban-title em { font-style:normal;color:#e8634f; }
          #ban-text { position:relative;font-size:15px;color:#707a8a;font-weight:300;line-height:1.6;max-width:400px;margin:0 auto 22px; }
          #ban-until { position:relative;display:inline-flex;align-items:center;gap:7px;font-size:13px;color:#191b1e;font-weight:500;margin:0 0 28px;background:rgba(232,99,79,.09);border:1px solid rgba(232,99,79,.22);padding:.5rem 1rem;border-radius:12px; }
          #ban-btn { position:relative;display:inline-flex;align-items:center;gap:8px;margin-top:4px;background:#191b1e;color:#fff;text-decoration:none;font-size:14px;font-weight:500;padding:14px 30px;border-radius:15px;transition:background .15s,transform .12s,box-shadow .15s;box-shadow:0 1px 2px rgba(25,27,30,.15),0 14px 26px -12px rgba(25,27,30,.5); }
          #ban-btn:hover { background:#2b2f33;transform:translateY(-1px); }
          @media(max-width:600px){ #ban-card { border-radius:32px;padding:48px 26px 44px; } #ban-art { width:88px;height:88px;border-radius:26px;margin-bottom:24px; } #ban-art svg { width:42px;height:42px; } }
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
            <div id="ban-art"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 018 0v3"/></svg></div>
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
