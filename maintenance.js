(async () => {
  try {
    const API = 'https://antviz.ru/api';

    let mo = null, bo = null;
    let currentUser = null, authReady = false;
    let maintOn = null, banData = null, banChecked = false;

    // ===== Кэш в sessionStorage — общий принцип для обеих проверок:
    // тех.работы почти всегда выключены, бан почти всегда отсутствует,
    // незачем дёргать API на каждом переходе между страницами.
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
    function fmtBanDate(ban) {
      if (!ban || !ban.until) return null;
      return new Date(ban.until).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    // ===== Тех.работы — временно всегда выключены. Флаг тех.работ раньше
    // жил в Firestore (settings/maintenance) и пока не перенесён на новый
    // бэкенд — включать здесь нечего, пока не появится соответствующий
    // эндпоинт и admin-переключатель на сервере.
    maintOn = false;
    render();

    // ===== Бан — только для авторизованных
    try {
      const meResp = await fetch(`${API}/auth/me`, { credentials: 'include' });
      currentUser = meResp.ok ? await meResp.json() : null;
    } catch (e) { currentUser = null; }
    authReady = true;

    if (!currentUser) {
      banData = null; banChecked = true; render();
    } else {
      const cached = readBanCache(currentUser.id);
      if (cached !== undefined) {
        banData = cached; banChecked = true; render();
      } else {
        try {
          const banResp = await fetch(`${API}/auth/ban-status`, { credentials: 'include' });
          const banJson = banResp.ok ? await banResp.json() : { banned: false };
          banData = banJson.banned ? banJson : null;
          writeBanCache(currentUser.id, banData);
        } catch (e) { banData = null; }
        banChecked = true;
        render();
      }
    }

    function render() {
      if (!authReady || maintOn === null) return;

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
        #maint-overlay, #maint-overlay *{ box-sizing:border-box; }
        #maint-overlay {
          position:fixed;inset:0;z-index:99999;
          background:rgba(25,27,30,.5);backdrop-filter:blur(4px);
          display:flex;align-items:center;justify-content:center;padding:24px;
          font-family:var(--font,'Geologica',Inter,Arial,sans-serif);letter-spacing:-.01em;
        }
        #maint-card {
          position:relative;width:100%;max-width:860px;
          background:var(--bg,#fff);border:1px solid var(--stroke,#dfe3e8);border-radius:40px;
          box-shadow:var(--sh2,0 8px 20px rgba(0,51,153,.08),0 4px 8px rgba(0,51,153,.08));
          display:flex;overflow:hidden;
        }
        #maint-content {
          flex:1 1 56%;padding:48px 44px 40px;display:flex;flex-direction:column;min-width:0;
        }
        #maint-visual {
          flex:0 0 42%;background:var(--dark,#191b1e);
          display:flex;align-items:center;justify-content:center;padding:20px;
        }
        #maint-visual svg { width:100%;max-width:220px;height:auto;stroke:#1ede7b;stroke-width:1.3;fill:none;stroke-linecap:round;stroke-linejoin:round; }
        #maint-label {
          display:inline-flex;align-self:flex-start;
          background:var(--green-dim,#d2f8e5);color:var(--green-text,#149955);
          font-size:12px;font-weight:500;padding:6px 14px;border-radius:100px;margin-bottom:20px;
        }
        #maint-title { font-size:clamp(24px,3vw,30px);font-weight:500;letter-spacing:-.03em;line-height:1.15;color:var(--text,#191b1e);margin:0 0 24px; }
        #maint-title em { font-style:normal;color:#1ede7b; }
        #maint-bullets { display:flex;flex-direction:column;gap:16px;margin-bottom:24px; }
        #maint-bullets .mt-bullet { display:flex;align-items:flex-start;gap:14px; }
        #maint-bullets .mt-bullet-icon {
          flex:0 0 auto;width:32px;height:32px;border-radius:12px;background:var(--bg3,#f9fafc);
          border:1px solid var(--stroke,#dfe3e8);display:flex;align-items:center;justify-content:center;margin-top:1px;
        }
        #maint-bullets .mt-bullet-icon svg { width:16px;height:16px;stroke:var(--green-text,#149955);stroke-width:1.8;fill:none; }
        #maint-bullets .mt-bullet-text { font-size:14px;color:var(--text,#191b1e);font-weight:300;line-height:1.5;letter-spacing:-.01em; }
        #maint-actions { margin-top:auto;display:flex;flex-direction:column;align-items:flex-start;gap:12px; }
        #maint-actions .mt-btn {
          box-sizing:border-box;
          display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;
          font-family:inherit;font-weight:500;text-decoration:none;cursor:pointer;border:none;
          background:var(--dark,#191b1e);color:#fff;border-radius:12px;padding:15px 26px;font-size:15px;
          transition:background .1s,transform .12s;
        }
        #maint-actions .mt-btn:hover { background:var(--dark2,#2b2f33);transform:translateY(-1px); }
        #maint-support {
          background:none;border:none;cursor:pointer;font-family:inherit;
          font-size:13px;font-weight:300;color:var(--text-dim,#707a8a);text-decoration:underline;
          text-underline-offset:3px;padding:2px;align-self:center;margin:0 auto;
        }
        #maint-support:hover { color:var(--text,#191b1e); }
        @media(max-width:720px){
          #maint-overlay { padding:16px; }
          #maint-card { flex-direction:column;max-width:440px;width:100%;max-height:90vh;border-radius:32px;overflow-y:auto; }
          #maint-visual { flex:0 0 auto;padding:24px 20px 8px;order:-1;justify-content:center; }
          #maint-visual svg { max-width:150px; }
          #maint-content { padding:16px 24px calc(24px + env(safe-area-inset-bottom)); flex:1; }
          #maint-actions { margin-top:20px; }
          #maint-title { font-size:21px; }
        }
      `;
      document.head.appendChild(style);
      mo = document.createElement('div');
      mo.id = 'maint-overlay';
      mo.innerHTML = `
        <div id="maint-card">
          <div id="maint-content">
            <div id="maint-label">Технические работы</div>
            <h1 id="maint-title">Скоро <em>вернёмся</em></h1>
            <div id="maint-bullets">
              <div class="mt-bullet">
                <div class="mt-bullet-icon"><svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div>
                <div class="mt-bullet-text">Устраняем ошибки и баги, найденные в работе кабинета.</div>
              </div>
              <div class="mt-bullet">
                <div class="mt-bullet-icon"><svg viewBox="0 0 24 24"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg></div>
                <div class="mt-bullet-text">Добавляем новый функционал и улучшения кабинета.</div>
              </div>
              <div class="mt-bullet">
                <div class="mt-bullet-icon"><svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                <div class="mt-bullet-text">Повышаем стабильность и скорость работы сайта.</div>
              </div>
            </div>
            <div id="maint-actions">
              <button class="mt-btn" id="maint-refresh">Обновить страницу</button>
              <a id="maint-support" href="https://t.me/antviz_official" target="_blank" rel="noopener">Поддержка в Telegram</a>
            </div>
          </div>
          <div id="maint-visual"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></div>
        </div>`;
      document.body.appendChild(mo);
      document.body.style.overflow = 'hidden';
      const refreshBtn = mo.querySelector('#maint-refresh');
      if (refreshBtn) refreshBtn.addEventListener('click', () => window.location.reload());
    }
    function removeMaint() {
      if (!mo) return;
      mo.remove(); mo = null;
      if (!bo) document.body.style.overflow = '';
    }

    function renderBan() {
      const banned = !!banData;
      if (banned && !bo) {
        // Раньше тут был signOut(auth) при показе бана — но это триггерило
        // auth-listener'ы на других страницах (у некоторых при user=null стоит
        // редирект на "/"), и редирект сносил только что показанный оверлей
        // раньше, чем пользователь успевал его увидеть. Сам оверлей ниже уже
        // полностью блокирует страницу — signOut для этого не нужен.

        const style = document.createElement('style');
        style.textContent = `
          #ban-overlay, #ban-overlay *{ box-sizing:border-box; }
          #ban-overlay {
            position:fixed;inset:0;z-index:99999;
            background:rgba(25,27,30,.5);backdrop-filter:blur(4px);
            display:flex;align-items:center;justify-content:center;padding:24px;
            font-family:var(--font,'Geologica',Inter,Arial,sans-serif);letter-spacing:-.01em;
          }
          #ban-card {
            position:relative;width:100%;max-width:860px;
            background:var(--bg,#fff);border:1px solid var(--stroke,#dfe3e8);border-radius:40px;
            box-shadow:var(--sh2,0 8px 20px rgba(0,51,153,.08),0 4px 8px rgba(0,51,153,.08));
            display:flex;overflow:hidden;
          }
          #ban-content {
            flex:1 1 56%;padding:48px 44px 40px;display:flex;flex-direction:column;min-width:0;
          }
          #ban-visual {
            flex:0 0 42%;background:var(--dark,#191b1e);
            display:flex;align-items:center;justify-content:center;padding:20px;
          }
          #ban-visual svg { width:100%;max-width:220px;height:auto;stroke:#ff6b52;stroke-width:1.3;fill:none;stroke-linecap:round;stroke-linejoin:round; }
          #ban-label {
            display:inline-flex;align-self:flex-start;
            background:rgba(232,99,79,.12);color:#e8634f;
            font-size:12px;font-weight:500;padding:6px 14px;border-radius:100px;margin-bottom:20px;
          }
          #ban-title { font-size:clamp(24px,3vw,30px);font-weight:500;letter-spacing:-.03em;line-height:1.15;color:var(--text,#191b1e);margin:0 0 16px; }
          #ban-title em { font-style:normal;color:#e8634f; }
          #ban-text { font-size:15px;color:var(--text-dim,#707a8a);font-weight:300;line-height:1.6;max-width:400px;margin-bottom:20px; }
          #ban-until { display:inline-flex;align-self:flex-start;align-items:center;gap:7px;font-size:13px;color:var(--text,#191b1e);font-weight:500;margin-bottom:28px;background:rgba(232,99,79,.09);border:1px solid rgba(232,99,79,.22);padding:.5rem 1rem;border-radius:12px; }
          #ban-actions { margin-top:auto; }
          #ban-btn {
            box-sizing:border-box;
            display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;
            font-family:inherit;font-weight:500;text-decoration:none;cursor:pointer;border:none;
            background:var(--dark,#191b1e);color:#fff;border-radius:12px;padding:15px 26px;font-size:15px;
            transition:background .1s,transform .12s;
          }
          #ban-btn:hover { background:var(--dark2,#2b2f33);transform:translateY(-1px); }
          @media(max-width:720px){
            #ban-overlay { padding:16px; }
            #ban-card { flex-direction:column;max-width:440px;width:100%;max-height:90vh;border-radius:32px;overflow-y:auto; }
            #ban-visual { flex:0 0 auto;padding:24px 20px 8px;order:-1;justify-content:center; }
            #ban-visual svg { max-width:150px; }
            #ban-content { padding:16px 24px calc(24px + env(safe-area-inset-bottom)); flex:1; }
            #ban-title { font-size:21px; }
          }
        `;
        document.head.appendChild(style);

        const until = fmtBanDate(banData);
        const reason = (banData.reason || 'Нарушение правил использования сервиса').replace(/[<>]/g, '');
        const showBtn = banData.showButton !== false && banData.btnUrl;

        bo = document.createElement('div');
        bo.id = 'ban-overlay';
        bo.innerHTML = `
          <div id="ban-card">
            <div id="ban-content">
              <div id="ban-label">Доступ ограничен</div>
              <h1 id="ban-title">Аккаунт <em>заблокирован</em></h1>
              <p id="ban-text">${reason}</p>
              <div id="ban-until">${until ? `До ${until}` : 'Блокировка бессрочная'}</div>
              ${showBtn ? `<div id="ban-actions"><a id="ban-btn" href="${banData.btnUrl}" target="_blank" rel="noopener">${(banData.btnLabel || 'Написать в поддержку').replace(/[<>]/g, '')}</a></div>` : ''}
            </div>
            <div id="ban-visual"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 018 0v3"/></svg></div>
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
