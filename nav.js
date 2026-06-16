/**
 * nav.js — Antviz
 * <script src="nav.js" data-page="home"></script>
 *
 * data-page: home | faq | order | profile | auth
 *            orders | support | settings | tickets
 *
 * ВАЖНО: подключать на КАЖДОЙ странице сайта (включая index.html),
 * иначе на странице будет другое/старое меню.
 */
(function () {

  const script = document.currentScript;
  const page   = script ? (script.getAttribute('data-page') || 'home') : 'home';

  /* Путь к firebase-config.js считаем от РЕАЛЬНОГО пути самого nav.js
     (script.src), а не от URL страницы в адресной строке. Это надёжнее:
     "чистые" URL вида /profile/orders на GitHub Pages не всегда совпадают
     по глубине с реальным расположением файлов на диске, и подсчёт
     слэшей в location.pathname легко даёт неверный результат —
     именно из-за этого firebase-config.js мог не находиться, и весь
     блок авторизации падал в catch без видимого сообщения. */
  const navScriptUrl = new URL(script.src, window.location.href);
  const baseUrl       = new URL('.', navScriptUrl); // папка, где лежит nav.js
  const depth  = (window.location.pathname.replace(/\/+$/, '').match(/\//g) || []).length - 1;
  const linkBase = depth > 0 ? '../' : '';

  /* ─────────────── CSS ─────────────── */
  const CSS = `
    .antviz-nav {
      position: fixed; top: 18px; left: 50%; transform: translateX(-50%);
      z-index: 9000;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 8px 0 18px;
      height: 52px;
      width: calc(100% - 40px); max-width: 1060px;
      background: rgba(10,10,14,0.75);
      backdrop-filter: blur(28px) saturate(200%);
      -webkit-backdrop-filter: blur(28px) saturate(200%);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      box-shadow: 0 2px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
      transition: border-color .3s, background .3s;
    }
    .antviz-nav:hover { border-color: rgba(255,255,255,0.12); }

    .an-logo {
      font-family: 'Unbounded', sans-serif; font-weight: 700;
      font-size: .85rem; letter-spacing: .03em;
      color: #f0f0f5; text-decoration: none;
      display: flex; align-items: center; gap: 9px; flex-shrink: 0;
    }
    .an-logo img { width: 26px; height: 26px; border-radius: 7px; object-fit: cover; }

    .an-center {
      position: absolute; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 2px;
    }
    .an-link {
      color: rgba(240,240,245,0.45);
      font-family: 'Onest', sans-serif; font-size: .8rem;
      text-decoration: none; padding: .38rem .78rem;
      border-radius: 10px; transition: color .18s, background .18s;
      white-space: nowrap;
    }
    .an-link:hover { color: #f0f0f5; background: rgba(255,255,255,0.06); }
    .an-link.active { color: #f0f0f5; background: rgba(255,255,255,0.08); }

    .an-right { display: flex; align-items: center; gap: 6px; margin-left: auto; }

    .an-cta {
      display: none; align-items: center; gap: 6px;
      background: #6c63ff; color: #fff;
      font-family: 'Onest', sans-serif; font-size: .78rem; font-weight: 500;
      text-decoration: none; padding: .42rem 1.05rem;
      border-radius: 10px; border: none; cursor: pointer;
      transition: box-shadow .2s, transform .12s;
      white-space: nowrap;
    }
    .an-cta:hover { box-shadow: 0 4px 18px rgba(108,99,255,.5); transform: translateY(-1px); }
    .an-cta.show { display: inline-flex; }

    .an-user { position: relative; display: flex; }
    .an-user-btn {
      display: flex; align-items: center; gap: 7px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
      border-radius: 10px; padding: 5px 12px 5px 5px;
      cursor: pointer; transition: background .18s, border-color .18s;
      font-family: 'Onest', sans-serif; font-size: .78rem; color: #f0f0f5;
      position: relative;
    }
    .an-user-btn:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.15); }

    .an-user-btn.guest { padding: 5px 14px; }
    .an-user-btn.guest .an-avatar { display: none; }
    .an-user-btn.guest .an-chevron { display: none; }

    .an-avatar {
      width: 26px; height: 26px; border-radius: 8px;
      background: linear-gradient(135deg,#6c63ff,#a78bfa);
      display: flex; align-items: center; justify-content: center;
      font-size: .65rem; font-weight: 700; color: #fff;
      flex-shrink: 0; overflow: hidden; position: relative;
    }
    .an-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .an-uname { max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .an-chevron { width: 11px; height: 11px; opacity: .4; flex-shrink: 0; transition: transform .2s; }
    .an-user-btn[aria-expanded="true"] .an-chevron { transform: rotate(180deg); }

    .an-notify-dot {
      position: absolute; top: -2px; right: -2px;
      width: 9px; height: 9px; border-radius: 50%;
      background: #f87171; border: 2px solid rgba(10,10,14,0.9);
      display: none;
    }
    .an-notify-dot.show { display: block; }

    /* ── Dropdown — красивая карточка с разделением на секции ── */
    .an-dd {
      position: absolute; top: calc(100% + 12px); right: 0;
      background: linear-gradient(165deg, rgba(19,19,26,0.98), rgba(13,13,18,0.98));
      backdrop-filter: blur(32px) saturate(180%);
      -webkit-backdrop-filter: blur(32px) saturate(180%);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 18px; padding: 8px;
      min-width: 240px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07);
      opacity: 0; pointer-events: none;
      transform: translateY(-8px) scale(.96);
      transform-origin: top right;
      transition: opacity .2s cubic-bezier(.2,.8,.2,1), transform .2s cubic-bezier(.2,.8,.2,1);
      z-index: 9999;
    }
    .an-dd.open { opacity: 1; pointer-events: all; transform: translateY(0) scale(1); }

    .an-dd-head {
      display: flex; align-items: center; gap: 11px;
      padding: 10px 10px 12px;
      margin-bottom: 4px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .an-dd-head-avatar {
      width: 38px; height: 38px; border-radius: 11px;
      background: linear-gradient(135deg,#6c63ff,#a78bfa);
      display: flex; align-items: center; justify-content: center;
      font-size: .95rem; font-weight: 700; color: #fff;
      flex-shrink: 0; overflow: hidden;
    }
    .an-dd-head-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .an-dd-head-info { min-width: 0; flex: 1; }
    .an-dd-head-name {
      font-family: 'Onest', sans-serif; font-size: .85rem; font-weight: 500;
      color: #f0f0f5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .an-dd-head-email {
      font-family: 'Onest', sans-serif; font-size: .7rem;
      color: rgba(240,240,245,0.4); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      margin-top: 1px;
    }

    .an-dd-section {
      padding: 10px 10px 4px;
      font-size: .58rem; text-transform: uppercase; letter-spacing: .1em;
      color: rgba(240,240,245,0.25); font-weight: 600;
    }
    .an-dd-item {
      display: flex; align-items: center; gap: 11px;
      padding: 9px 10px; border-radius: 12px;
      font-size: .82rem; color: rgba(240,240,245,0.68);
      text-decoration: none; cursor: pointer;
      transition: background .14s, color .14s, padding-left .14s;
      font-family: 'Onest', sans-serif; border: none;
      background: none; width: 100%; text-align: left;
      position: relative;
    }
    .an-dd-item:hover { background: rgba(255,255,255,0.07); color: #f0f0f5; padding-left: 13px; }
    .an-dd-item:active { background: rgba(255,255,255,0.1); }
    .an-dd-ico {
      width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      background: rgba(167,139,250,0.1);
      transition: background .14s;
    }
    .an-dd-item:hover .an-dd-ico { background: rgba(167,139,250,0.18); }
    .an-dd-item svg { width: 15px; height: 15px; flex-shrink: 0; opacity: .75; stroke: var(--an-ico-color, #a78bfa); fill: none; stroke-width: 1.8; }
    .an-dd-item.red .an-dd-ico { background: rgba(248,113,113,0.1); }
    .an-dd-item.red .an-dd-ico svg { stroke: #f87171; opacity: .85; }
    .an-dd-item.red { color: rgba(248,113,113,0.75); }
    .an-dd-item.red:hover { background: rgba(248,113,113,0.09); color: #f87171; }
    .an-dd-item.red:hover .an-dd-ico { background: rgba(248,113,113,0.16); }

    .an-dd-sep { height: 1px; background: rgba(255,255,255,0.07); margin: 6px 8px; }

    .an-dd-badge {
      margin-left: auto; flex-shrink: 0;
      background: #6c63ff; color: #fff;
      font-size: .62rem; font-weight: 700;
      min-width: 18px; height: 18px; border-radius: 50px;
      display: flex; align-items: center; justify-content: center;
      padding: 0 5px;
    }
    .an-dd-badge.warn { background: #fbbf24; color: #1a1400; }
    .an-dd-badge.dot { width: 7px; height: 7px; min-width: 0; padding: 0; background: #f87171; }

    @media(max-width:768px) { .antviz-nav { display: none !important; } }
  `;

  // "Главная" убрана — лого уже ведёт туда
  const PUBLIC_LINKS = [
    { href: linkBase+'faq',    label: 'Возможности', key: 'faq' },
    { href: linkBase+'order',  label: 'Цены',        key: 'order' },
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

  /* badgeKey подставляется живыми данными из Firestore ниже —
     те же сущности, что уже показаны в profile.html */
  const DD_ITEMS = [
    { href: linkBase+'profile',         icon: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/>', label: 'Обзор кабинета' },
    { sep: true },
    { section: 'Кабинет' },
    { href: linkBase+'profile/orders',  icon: '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>', label: 'Мои заказы', badgeKey: 'orders' },
    { href: linkBase+'profile/tickets', icon: '<path d="M2 9a3 3 0 010-6h20a3 3 0 010 6"/><path d="M2 15a3 3 0 000 6h20a3 3 0 000-6"/><path d="M6 12h12"/>', label: 'Обслуживание', badgeKey: 'tickets' },
    { href: linkBase+'profile/support', icon: '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>', label: 'Поддержка', badgeKey: 'support' },
    { sep: true },
    { href: linkBase+'profile/settings', icon: '<circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>', label: 'Настройки' },
    { logout: true },
  ];

  function buildDD() {
    return DD_ITEMS.map(item => {
      if (item.section) return `<div class="an-dd-section">${item.section}</div>`;
      if (item.sep)     return `<div class="an-dd-sep"></div>`;
      if (item.logout)  return `<button class="an-dd-item red" id="anSignOut"><span class="an-dd-ico"><svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg></span>Выйти</button>`;
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
  <a class="an-logo" href="${linkBase || '/'}">
    <img src="${linkBase}img/favicon.png" alt="Antviz">
    Antviz
  </a>

  ${buildCenter()}

  <div class="an-right">
    ${(!cfg.inApp && !cfg.hideCta) ? `<a href="${linkBase}order" class="an-cta" id="anCta">Заказать сайт</a>` : ''}

    <div class="an-user" id="anUser">
      <a href="${linkBase}auth" class="an-user-btn guest" id="anUserBtn" aria-expanded="false">
        <div class="an-avatar" id="anAvatar">?<span class="an-notify-dot" id="anNotifyDot"></span></div>
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
    const dot = document.getElementById('anNotifyDot');
    if (!dot) return;
    const any = ['support','tickets'].some(k => {
      const el = document.getElementById(`anBadge-${k}`);
      return el && el.style.display !== 'none';
    });
    dot.classList.toggle('show', any);
  }

  let unsubSupport = null;
  let unsubOrders  = null;
  function teardownListeners() {
    unsubSupport?.(); unsubSupport = null;
    unsubOrders?.();  unsubOrders  = null;
  }

  (async () => {
    try {
      /* Импортируем auth/db из ТОГО ЖЕ firebase-config.js, что использует
         вся остальная часть сайта — строим путь от реального расположения
         nav.js (script.src), а не от URL страницы в браузере. */
      const configUrl = new URL('firebase-config.js', baseUrl).href;
      const { auth, db } = await import(configUrl);
      const { onAuthStateChanged, signOut } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      const { collection, query, where, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

      document.getElementById('anSignOut')?.addEventListener('click', async () => {
        try {
          teardownListeners();
          await signOut(auth);
          window.location.href = linkBase || '/';
        } catch(e) { console.error('nav.js signOut:', e); }
      });

      onAuthStateChanged(auth, user => {
        const ctaEl     = document.getElementById('anCta');
        const centerEl  = document.getElementById('anCenter');
        const unameEl   = document.getElementById('anUname');
        const avatarEl  = document.getElementById('anAvatar');
        const ddHead    = document.getElementById('anDdHead');
        const ddHeadAv  = document.getElementById('anDdHeadAvatar');
        const ddHeadNm  = document.getElementById('anDdHeadName');
        const ddHeadEm  = document.getElementById('anDdHeadEmail');

        teardownListeners();

        if (user) {
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
            avatarEl.innerHTML = (user.photoURL
              ? `<img src="${user.photoURL}" alt="">`
              : initial) + '<span class="an-notify-dot" id="anNotifyDot"></span>';
          }
          if (ddHead) ddHead.style.display = 'flex';
          if (ddHeadAv) ddHeadAv.innerHTML = user.photoURL ? `<img src="${user.photoURL}" alt="">` : initial;
          if (ddHeadNm) ddHeadNm.textContent = name;
          if (ddHeadEm) ddHeadEm.textContent = user.email || '';

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
        } else {
          isAuthed = false;
          userBtn.classList.add('guest');
          userBtn.setAttribute('href', `${linkBase}auth`);
          if (unameEl) unameEl.textContent = 'Войти';
          if (avatarEl) avatarEl.innerHTML = '?<span class="an-notify-dot" id="anNotifyDot"></span>';
          if (ddHead) ddHead.style.display = 'none';
          if (!cfg.hideCta) ctaEl?.classList.add('show');
          ['support','orders','tickets'].forEach(k => setBadge(k, 0, null));
          refreshNotifyDot();
        }
      });
    } catch(e) {
      // Подробный лог — если меню профиля не работает, открой консоль (F12)
      // браузера и посмотри сообщение "nav.js auth error:" — там будет видно,
      // не нашёлся ли firebase-config.js или другая причина.
      console.error('nav.js auth error:', e);
    }
  })();

})();
