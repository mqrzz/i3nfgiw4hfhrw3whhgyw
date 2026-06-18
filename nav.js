/**
 * nav.js — Antviz (простая версия)
 * <script src="nav.js" data-page="home"></script>
 *
 * Не импортирует firebase-config.js сам — ждёт, пока Firebase App
 * инициализирует САМА СТРАНИЦА (как она и делает сейчас), и просто
 * подключается к уже существующему приложению через getApps()/getAuth().
 * Это убирает любые проблемы с относительными путями к конфигу.
 */
(function () {

  const script = document.currentScript;
  const page   = script ? (script.getAttribute('data-page') || 'home') : 'home';
  const depth  = (window.location.pathname.replace(/\/+$/, '').match(/\//g) || []).length - 1;
  const b      = depth > 0 ? '../' : '';

  /* ─────────────── CSS ───────────────
     Палитра: фон почти чёрный с тёплым подтоном, один фиолетовый акцент,
     без стекла/неона/inset-теней — плоско, контрастно, по делу. */
  const CSS = `
    :root {
      --an-bg:        #0a0a0c;
      --an-surface:   #131316;
      --an-line:      rgba(242,242,240,0.08);
      --an-line-soft: rgba(242,242,240,0.05);
      --an-ink:       #f2f2f0;
      --an-ink-dim:   rgba(242,242,240,0.46);
      --an-ink-faint: rgba(242,242,240,0.26);
      --an-accent:    #7c6fff;
      --an-accent-ink:#0a0a0c;
      --an-warn:      #e8a23d;
      --an-danger:    #e8634f;
    }

    .antviz-nav {
      position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
      z-index: 9000;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 8px 0 20px;
      height: 50px;
      width: calc(100% - 40px); max-width: 1060px;
      background: var(--an-bg);
      border: 1px solid var(--an-line);
      border-radius: 11px;
      transition: border-color .2s;
    }
    .antviz-nav:hover { border-color: rgba(242,242,240,0.14); }

    .an-logo {
      font-family: 'Unbounded', sans-serif; font-weight: 600;
      font-size: .82rem; letter-spacing: .01em;
      color: var(--an-ink); text-decoration: none;
      display: flex; align-items: center; gap: 9px; flex-shrink: 0;
    }
    .an-logo img { width: 24px; height: 24px; border-radius: 6px; object-fit: cover; }

    .an-center {
      position: absolute; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 2px;
    }
    .an-link {
      color: var(--an-ink-dim);
      font-family: 'Onest', sans-serif; font-size: .8rem;
      text-decoration: none; padding: .4rem .8rem;
      border-radius: 8px; transition: color .15s;
      white-space: nowrap; position: relative;
    }
    .an-link:hover { color: var(--an-ink); }
    .an-link.active { color: var(--an-ink); }
    .an-link.active::after {
      content: ''; position: absolute; left: .8rem; right: .8rem; bottom: 1px;
      height: 1px; background: var(--an-accent);
    }

    .an-right { display: flex; align-items: center; gap: 8px; margin-left: auto; }

    .an-cta {
      display: none; align-items: center; gap: 6px;
      background: var(--an-accent); color: var(--an-accent-ink);
      font-family: 'Onest', sans-serif; font-size: .78rem; font-weight: 600;
      text-decoration: none; padding: .44rem 1.05rem;
      border-radius: 8px; border: none; cursor: pointer;
      transition: opacity .15s;
      white-space: nowrap;
    }
    .an-cta:hover { opacity: .85; }
    .an-cta.show { display: inline-flex; }

    .an-user { position: relative; display: flex; }
    .an-user-btn {
      display: flex; align-items: center; gap: 8px;
      background: none; border: 1px solid transparent;
      border-radius: 9px; padding: 4px 10px 4px 4px;
      cursor: pointer; transition: border-color .15s;
      font-family: 'Onest', sans-serif; font-size: .78rem; color: var(--an-ink);
      text-decoration: none;
      position: relative;
    }
    .an-user-btn:hover { border-color: var(--an-line); }

    .an-user-btn.guest { padding: .4rem .85rem; border: 1px solid var(--an-line); }
    .an-user-btn.guest:hover { border-color: rgba(242,242,240,0.18); }
    .an-user-btn.guest .an-avatar-ring { display: none; }
    .an-user-btn.guest .an-chevron { display: none; }

    /* Аватар: квадрат со скруглением, без градиента — инициал на ровном
       акцентном фоне. Кольцо появляется только когда есть непрочитанное —
       единственный «декоративный» момент во всей навигации. */
    .an-avatar-ring {
      width: 28px; height: 28px; border-radius: 9px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      position: relative; padding: 2px;
    }
    .an-avatar-ring.notify {
      background: conic-gradient(from -45deg, var(--an-warn), var(--an-accent) 60%);
    }
    .an-avatar {
      width: 100%; height: 100%; border-radius: 7px;
      background: var(--an-accent);
      display: flex; align-items: center; justify-content: center;
      font-size: .68rem; font-weight: 700; color: var(--an-accent-ink);
      overflow: hidden;
    }
    .an-avatar-ring.notify .an-avatar { border-radius: 6px; }
    .an-avatar img { width: 100%; height: 100%; object-fit: cover; }

    .an-uname { max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .an-chevron { width: 10px; height: 10px; opacity: .4; flex-shrink: 0; transition: transform .2s; }
    .an-user-btn[aria-expanded="true"] .an-chevron { transform: rotate(180deg); }

    /* ── Дропдаун: плоская карточка, тонкая граница, без blur/inset-теней.
       Единственный акцент — верхняя кромка цвета бренда. */
    .an-dd {
      position: absolute; top: calc(100% + 10px); right: 0;
      background: var(--an-surface);
      border: 1px solid var(--an-line);
      border-radius: 13px; padding: 6px;
      min-width: 232px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.45);
      opacity: 0; pointer-events: none;
      transform: translateY(-6px);
      transform-origin: top right;
      transition: opacity .16s ease, transform .16s ease;
      z-index: 9999;
      overflow: hidden;
    }
    .an-dd::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: var(--an-accent);
    }
    .an-dd.open { opacity: 1; pointer-events: all; transform: translateY(0); }

    .an-dd-head {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 8px 12px; margin-bottom: 2px;
      border-bottom: 1px solid var(--an-line-soft);
    }
    .an-dd-head-avatar {
      width: 34px; height: 34px; border-radius: 9px;
      background: var(--an-accent);
      display: flex; align-items: center; justify-content: center;
      font-size: .85rem; font-weight: 700; color: var(--an-accent-ink);
      flex-shrink: 0; overflow: hidden;
    }
    .an-dd-head-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .an-dd-head-info { min-width: 0; flex: 1; }
    .an-dd-head-name {
      font-family: 'Onest', sans-serif; font-size: .84rem; font-weight: 500;
      color: var(--an-ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .an-dd-head-email {
      font-family: 'Onest', sans-serif; font-size: .7rem;
      color: var(--an-ink-faint); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      margin-top: 1px;
    }

    .an-dd-section {
      padding: 12px 10px 5px;
      font-size: .68rem;
      color: var(--an-ink-faint); font-weight: 500;
      font-family: 'Onest', sans-serif;
    }
    .an-dd-item {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 9px; border-radius: 8px;
      font-size: .82rem; color: rgba(242,242,240,0.72);
      text-decoration: none; cursor: pointer;
      transition: background .12s, color .12s;
      font-family: 'Onest', sans-serif; border: none;
      background: none; width: 100%; text-align: left;
      position: relative;
    }
    .an-dd-item:hover { background: rgba(242,242,240,0.06); color: var(--an-ink); }
    .an-dd-ico {
      width: 17px; height: 17px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      color: var(--an-ink-dim); transition: color .12s;
    }
    .an-dd-item:hover .an-dd-ico { color: var(--an-accent); }
    .an-dd-item svg { width: 17px; height: 17px; flex-shrink: 0; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
    .an-dd-item.red .an-dd-ico { color: rgba(232,99,79,0.7); }
    .an-dd-item.red:hover .an-dd-ico { color: var(--an-danger); }
    .an-dd-item.red { color: rgba(232,99,79,0.78); }
    .an-dd-item.red:hover { background: rgba(232,99,79,0.08); color: var(--an-danger); }

    .an-dd-sep { height: 1px; background: var(--an-line-soft); margin: 5px 9px; }

    .an-dd-badge {
      margin-left: auto; flex-shrink: 0;
      background: var(--an-accent); color: var(--an-accent-ink);
      font-size: .64rem; font-weight: 700;
      min-width: 17px; height: 17px; border-radius: 5px;
      display: flex; align-items: center; justify-content: center;
      padding: 0 5px; font-family: 'Onest', sans-serif;
    }
    .an-dd-badge.warn { background: var(--an-warn); color: #1a1400; }
    .an-dd-badge.dot { width: 6px; height: 6px; min-width: 0; padding: 0; border-radius: 50%; background: var(--an-danger); }

    @media(max-width:768px) { .antviz-nav { display: none !important; } }
  `;

  const PUBLIC_LINKS = [
    { href: b+'faq',    label: 'Возможности', key: 'faq' },
    { href: b+'order',  label: 'Цены',        key: 'order' },
  ];

  const NAV_CONFIG = {
    home:     { centerLinks: PUBLIC_LINKS, showCta: true },
    faq:      { centerLinks: PUBLIC_LINKS, showCta: true },
    order:    { centerLinks: PUBLIC_LINKS, showCta: false, hideCta: true },
    profile:  { inApp: true },
    auth:     { centerLinks: [], showCta: false, hideCta: true },
    orders:   { inApp: true },
    support:  { inApp: true },
    settings: { inApp: true },
    tickets:  { inApp: true },
    default:  { centerLinks: PUBLIC_LINKS, showCta: true },
  };

  const cfg = NAV_CONFIG[page] || NAV_CONFIG.default;

  // Свой набор иконок: единая толщина линии (1.6), скруглённые углы,
  // но формы более характерные — не дефолтный Feather-набор.
  const DD_ITEMS = [
    { href: b+'profile',         icon: '<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><path d="M8 14.5c0-2 1.8-3.2 4-3.2s4 1.2 4 3.2"/><circle cx="12" cy="9" r="2.1"/>', label: 'Обзор кабинета' },
    { sep: true },
    { section: 'Кабинет' },
    { href: b+'profile/orders',  icon: '<path d="M4 7.5l8-3.8 8 3.8-8 3.8-8-3.8z"/><path d="M4 7.5v9l8 3.8 8-3.8v-9"/><path d="M12 11.3v9"/>', label: 'Мои заказы', badgeKey: 'orders' },
    { href: b+'profile/tickets', icon: '<path d="M5 7a2 2 0 012-2h10a2 2 0 012 2v3a2 2 0 100 4v3a2 2 0 01-2 2H7a2 2 0 01-2-2v-3a2 2 0 100-4V7z"/><path d="M14 6v12" stroke-dasharray="2.4 2.4"/>', label: 'Обслуживание', badgeKey: 'tickets' },
    { href: b+'profile/support', icon: '<path d="M12 4a7 7 0 00-7 7v3.5A1.5 1.5 0 006.5 16H8v-5.5H5.3"/><path d="M12 4a7 7 0 017 7v3.5a1.5 1.5 0 01-1.5 1.5H16v-5.5h2.7"/><path d="M8 16.5v1A2.5 2.5 0 0010.5 20H12"/>', label: 'Поддержка', badgeKey: 'support' },
    { sep: true },
    { href: b+'profile/settings', icon: '<path d="M12 4.5v2.3M12 17.2v2.3M19.5 12h-2.3M6.8 12H4.5M17.2 6.8l-1.6 1.6M8.4 15.6l-1.6 1.6M17.2 17.2l-1.6-1.6M8.4 8.4L6.8 6.8"/><circle cx="12" cy="12" r="3.4"/>', label: 'Настройки' },
    { logout: true },
  ];

  function buildDD() {
    return DD_ITEMS.map(item => {
      if (item.section) return `<div class="an-dd-section">${item.section}</div>`;
      if (item.sep)     return `<div class="an-dd-sep"></div>`;
      if (item.logout)  return `<button class="an-dd-item red" id="anSignOut"><span class="an-dd-ico"><svg viewBox="0 0 24 24"><path d="M9 4H6.5A2.5 2.5 0 004 6.5v11A2.5 2.5 0 006.5 20H9"/><path d="M20 12H10.5"/><path d="M16 8l4 4-4 4"/></svg></span>Выйти</button>`;
      const badgeSlot = item.badgeKey ? `<span class="an-dd-badge" id="anBadge-${item.badgeKey}" style="display:none"></span>` : '';
      return `<a href="${item.href}" class="an-dd-item"><span class="an-dd-ico"><svg viewBox="0 0 24 24">${item.icon}</svg></span>${item.label}${badgeSlot}</a>`;
    }).join('');
  }

  function buildCenter() {
    if (cfg.inApp) return '';
    const links = cfg.centerLinks || [];
    if (!links.length) return '';
    return `<div class="an-center" id="anCenter">
      ${links.map(l => `<a href="${l.href}" class="an-link${page === l.key ? ' active' : ''}">${l.label}</a>`).join('')}
    </div>`;
  }

  const NAV_HTML = `
<nav class="antviz-nav" id="antvizNav">
  <a class="an-logo" href="${b || '/'}">
    <img src="${b}img/favicon.png" alt="Antviz">
    Antviz
  </a>

  ${buildCenter()}

  <div class="an-right">
    ${(!cfg.inApp && !cfg.hideCta) ? `<a href="${b}order" class="an-cta" id="anCta">Заказать сайт</a>` : ''}

    <div class="an-user" id="anUser">
      <a href="${b}auth" class="an-user-btn guest" id="anUserBtn" aria-expanded="false">
        <div class="an-avatar-ring" id="anAvatarRing">
          <div class="an-avatar" id="anAvatar">?</div>
        </div>
        <span class="an-uname" id="anUname">Войти</span>
        <svg class="an-chevron" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      </a>
      <div class="an-dd" id="anDd">
        <div class="an-dd-head" id="anDdHead" style="display:none">
          <div class="an-dd-head-avatar" id="anDdHeadAvatar">?</div>
          <div class="an-dd-head-info">
            <div class="an-dd-head-name" id="anDdHeadName">—</div>
            <div class="an-dd-head-email" id="anDdHeadEmail">—</div>
          </div>
        </div>
        ${buildDD()}
      </div>
    </div>
  </div>
</nav>`;

  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const tmp = document.createElement('div');
  tmp.innerHTML = NAV_HTML;
  document.body.insertBefore(tmp.firstElementChild, document.body.firstChild);

  let userBtn = document.getElementById('anUserBtn');
  const dd    = document.getElementById('anDd');
  let isAuthed = false;

  function onUserBtnClick(e) {
    if (!isAuthed) return;
    e.preventDefault();
    const open = dd.classList.toggle('open');
    userBtn.setAttribute('aria-expanded', String(open));
  }
  userBtn?.addEventListener('click', onUserBtnClick);

  document.addEventListener('click', e => {
    if (!userBtn || !dd) return;
    if (!userBtn.contains(e.target) && !dd.contains(e.target)) {
      dd.classList.remove('open');
      userBtn.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { dd?.classList.remove('open'); }
  });

  function setBadge(key, value, variant) {
    const el = document.getElementById(`anBadge-${key}`);
    if (!el) return;
    if (!value) { el.style.display = 'none'; return; }
    el.className = 'an-dd-badge' + (variant ? ' ' + variant : '');
    el.textContent = (variant === 'dot') ? '' : String(value);
    el.style.display = 'flex';
  }
  function refreshNotifyDot() {
    const ring = document.getElementById('anAvatarRing');
    if (!ring) return;
    const any = ['support','tickets'].some(k => {
      const el = document.getElementById(`anBadge-${k}`);
      return el && el.style.display !== 'none';
    });
    ring.classList.toggle('notify', any);
  }

  let unsubSupport = null;
  let unsubOrders  = null;
  function teardownListeners() {
    unsubSupport?.(); unsubSupport = null;
    unsubOrders?.();  unsubOrders  = null;
  }

  function applyAuthedUI(user) {
    const ctaEl    = document.getElementById('anCta');
    const centerEl = document.getElementById('anCenter');
    const unameEl  = document.getElementById('anUname');
    const avatarEl = document.getElementById('anAvatar');
    const ddHead   = document.getElementById('anDdHead');
    const ddHeadAv = document.getElementById('anDdHeadAvatar');
    const ddHeadNm = document.getElementById('anDdHeadName');
    const ddHeadEm = document.getElementById('anDdHeadEmail');

    isAuthed = true;
    ctaEl?.classList.remove('show');
    if (cfg.inApp && centerEl) centerEl.style.display = 'none';

    userBtn.classList.remove('guest');
    userBtn.removeAttribute('href');
    userBtn.style.cursor = 'pointer';

    const name = user.displayName || user.email?.split('@')[0] || 'Профиль';
    const initial = name[0].toUpperCase();
    if (unameEl) unameEl.textContent = name;
    if (avatarEl) {
      avatarEl.innerHTML = user.photoURL
        ? `<img src="${user.photoURL}" alt="">`
        : initial;
    }
    if (ddHead) ddHead.style.display = 'flex';
    if (ddHeadAv) ddHeadAv.innerHTML = user.photoURL ? `<img src="${user.photoURL}" alt="">` : initial;
    if (ddHeadNm) ddHeadNm.textContent = name;
    if (ddHeadEm) ddHeadEm.textContent = user.email || '';
  }

  function applyGuestUI() {
    const ctaEl    = document.getElementById('anCta');
    const unameEl  = document.getElementById('anUname');
    const avatarEl = document.getElementById('anAvatar');
    const avatarRing = document.getElementById('anAvatarRing');
    const ddHead   = document.getElementById('anDdHead');

    isAuthed = false;
    userBtn.classList.add('guest');
    userBtn.setAttribute('href', `${b}auth`);
    if (unameEl) unameEl.textContent = 'Войти';
    if (avatarEl) avatarEl.innerHTML = '?';
    avatarRing?.classList.remove('notify');
    if (ddHead) ddHead.style.display = 'none';
    if (!cfg.hideCta) ctaEl?.classList.add('show');
    ['support','orders','tickets'].forEach(k => setBadge(k, 0, null));
    refreshNotifyDot();
  }

  function watchBadges(db, fsMod, user) {
    const { collection, query, where, onSnapshot } = fsMod;
    teardownListeners();

    unsubSupport = onSnapshot(
      collection(db, 'chats', user.uid, 'messages'),
      snap => {
        const unread = snap.docs.filter(d => d.data().sender === 'admin' && !d.data().readByUser).length;
        setBadge('support', unread, 'warn');
        refreshNotifyDot();
      },
      () => {}
    );

    unsubOrders = onSnapshot(
      query(collection(db, 'orders'), where('uid', '==', user.uid)),
      snap => {
        const orders = snap.docs.map(d => d.data());
        const active = orders.filter(o => (o.status || 0) >= 1 && (o.status || 0) <= 4).length;
        setBadge('orders', active, null);
        const activeSupport = orders.some(o =>
          o.supportActive && o.supportExpiresAt?.toDate &&
          o.supportExpiresAt.toDate() > new Date()
        );
        setBadge('tickets', activeSupport ? 1 : 0, 'dot');
        refreshNotifyDot();
      },
      () => {}
    );
  }

  /* ── Ждём, пока сама страница инициализирует Firebase App, и подключаемся
     к УЖЕ СУЩЕСТВУЮЩЕМУ приложению — без своего импорта firebase-config.js.
     Каждая страница (profile, support, order и т.д.) уже сама делает
     initializeApp() в своём скрипте — нам достаточно дождаться этого
     момента через getApps().length, чтобы не зависеть от путей вообще. */
  (async () => {
    try {
      const appMod  = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
      const authMod = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      const fsMod   = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

      let tries = 0;
      while (appMod.getApps().length === 0 && tries < 100) {
        await new Promise(r => setTimeout(r, 50));
        tries++;
      }
      if (appMod.getApps().length === 0) {
        console.error('nav.js: Firebase App не инициализирован страницей за 5 секунд — профиль не может загрузиться.');
        return;
      }

      const app  = appMod.getApp();
      const auth = authMod.getAuth(app);
      const db   = fsMod.getFirestore(app);

      document.getElementById('anSignOut')?.addEventListener('click', async () => {
        try {
          teardownListeners();
          await authMod.signOut(auth);
          window.location.href = b || '/';
        } catch(e) { console.error('nav.js signOut:', e); }
      });

      authMod.onAuthStateChanged(auth, user => {
        teardownListeners();
        if (user) {
          applyAuthedUI(user);
          watchBadges(db, fsMod, user);
        } else {
          applyGuestUI();
        }
      });
    } catch(e) {
      console.error('nav.js auth error:', e);
    }
  })();

})();
