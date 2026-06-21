/**
 * nav.js — единая навигация для всех страниц Antviz
 * Стили и структура как в index.html (тёмная капсула, Geologica)
 * <script src="nav.js" data-page="home"></script>
 */
(function () {

  const script = document.currentScript;
  const page   = script ? (script.getAttribute('data-page') || 'home') : 'home';
  const depth  = (window.location.pathname.replace(/\/+$/, '').match(/\//g) || []).length - 1;
  const b      = depth > 0 ? '../' : '';

  /* ─────────────── CSS ───────────────
     Тёмная капсула как в index.html:
     фон #191b1e, зелёный акцент #1ede7b,
     шрифт Geologica, скругления 24px.
  */
  const CSS = `
    :root {
      --an-bg:        #191b1e;
      --an-bg2:       #2b2f33;
      --an-line:      rgba(255,255,255,.08);
      --an-line-soft: rgba(255,255,255,.05);
      --an-ink:       #ffffff;
      --an-ink-dim:   rgba(255,255,255,.45);
      --an-ink-faint: rgba(255,255,255,.3);
      --an-green:     #1ede7b;
      --an-green-h:   #1ac16b;
      --an-green-ink: #191b1e;
      --an-green-dim: rgba(30,222,123,.14);
      --an-warn:      #f59e0b;
      --an-danger:    #ff6b54;
      --an-card:      #20242a;
      --an-card-border: rgba(255,255,255,.09);
      --an-card-ink:  #ffffff;
      --an-card-muted:rgba(255,255,255,.4);
      --an-font: 'Geologica','Inter','Arial',sans-serif;
    }

    .antviz-nav {
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      z-index: 9000;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 10px 0 26px;
      height: 64px;
      width: calc(100% - 40px); max-width: 1100px;
      background: var(--an-bg);
      border: 1px solid var(--an-line);
      border-radius: 24px;
      transition: border-color .2s, background .2s;
      font-family: var(--an-font);
    }
    .antviz-nav:hover { border-color: rgba(255,255,255,.14); }

    .an-logo {
      font-family: var(--an-font); font-weight: 500;
      font-size: .95rem; letter-spacing: -.01em;
      color: var(--an-ink); text-decoration: none;
      display: flex; align-items: center; gap: 10px; flex-shrink: 0;
    }
    .an-logo img { width: 28px; height: 28px; border-radius: 8px; object-fit: cover; }

    .an-center {
      position: absolute; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 2px;
    }
    .an-link {
      color: var(--an-ink-dim);
      font-family: var(--an-font); font-weight: 300; font-size: .88rem;
      text-decoration: none; padding: .5rem .9rem;
      border-radius: 10px; transition: color .15s, background .15s;
      white-space: nowrap; position: relative;
    }
    .an-link:hover { color: var(--an-ink); background: rgba(255,255,255,.05); }
    .an-link.active { color: var(--an-ink); font-weight: 500; }
    .an-link.active::after {
      content: ''; position: absolute; left: .9rem; right: .9rem; bottom: 2px;
      height: 2px; border-radius: 2px; background: var(--an-green);
    }

    .an-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }

    .an-cta {
      display: none; align-items: center; gap: 8px;
      background: var(--an-green); color: var(--an-green-ink);
      font-family: var(--an-font); font-size: .85rem; font-weight: 500;
      text-decoration: none; padding: .65rem 1.3rem;
      border-radius: 14px; border: none; cursor: pointer;
      transition: background .12s, transform .12s;
      white-space: nowrap;
    }
    .an-cta:hover { background: var(--an-green-h); transform: translateY(-1px); }
    .an-cta.show { display: inline-flex; }

    .an-user { position: relative; display: flex; }
    .an-user-btn {
      display: flex; align-items: center; gap: 9px;
      background: none; border: 1px solid transparent;
      border-radius: 14px; padding: 5px 12px 5px 5px;
      cursor: pointer; transition: border-color .15s, background .15s;
      font-family: var(--an-font); font-weight: 300; font-size: .85rem; color: var(--an-ink);
      text-decoration: none;
      position: relative;
    }
    .an-user-btn:hover { border-color: var(--an-line); background: rgba(255,255,255,.04); }

    .an-user-btn.guest { padding: .55rem 1.1rem; border: 1px solid var(--an-line); border-radius: 14px; }
    .an-user-btn.guest:hover { border-color: rgba(255,255,255,.2); }
    .an-user-btn.guest .an-avatar-ring { display: none; }
    .an-user-btn.guest .an-chevron { display: none; }

    .an-avatar-ring {
      width: 32px; height: 32px; border-radius: 11px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      position: relative; padding: 2px;
    }
    .an-avatar-ring.notify {
      background: conic-gradient(from -45deg, var(--an-warn), var(--an-green) 60%);
    }
    .an-avatar {
      width: 100%; height: 100%; border-radius: 9px;
      background: var(--an-green);
      display: flex; align-items: center; justify-content: center;
      font-size: .72rem; font-weight: 500; color: var(--an-green-ink);
      overflow: hidden;
    }
    .an-avatar-ring.notify .an-avatar { border-radius: 8px; }
    .an-avatar img { width: 100%; height: 100%; object-fit: cover; }

    .an-uname { max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .an-chevron { width: 11px; height: 11px; opacity: .45; flex-shrink: 0; transition: transform .2s; }
    .an-user-btn[aria-expanded="true"] .an-chevron { transform: rotate(180deg); }

    .an-dd {
      position: absolute; top: calc(100% + 12px); right: 0;
      background: var(--an-card);
      border: 1.5px solid var(--an-card-border);
      border-radius: 24px; padding: 8px;
      min-width: 248px;
      box-shadow: 0 16px 40px rgba(0,0,0,.45), 0 4px 12px rgba(0,0,0,.3);
      opacity: 0; pointer-events: none;
      transform: translateY(-6px);
      transform-origin: top right;
      transition: opacity .16s ease, transform .16s ease;
      z-index: 9999;
      overflow: hidden;
      font-family: var(--an-font);
    }
    .an-dd::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: var(--an-green);
    }
    .an-dd.open { opacity: 1; pointer-events: all; transform: translateY(0); }

    .an-dd-head {
      display: flex; align-items: center; gap: 11px;
      padding: 14px 10px 14px; margin-bottom: 2px;
      border-bottom: 1px solid var(--an-card-border);
    }
    .an-dd-head-avatar {
      width: 38px; height: 38px; border-radius: 11px;
      background: var(--an-green);
      display: flex; align-items: center; justify-content: center;
      font-size: .9rem; font-weight: 500; color: var(--an-green-ink);
      flex-shrink: 0; overflow: hidden;
    }
    .an-dd-head-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .an-dd-head-info { min-width: 0; flex: 1; }
    .an-dd-head-name {
      font-family: var(--an-font); font-size: .88rem; font-weight: 500;
      color: var(--an-card-ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      letter-spacing: -.01em;
    }
    .an-dd-head-email {
      font-family: var(--an-font); font-weight: 300; font-size: .73rem;
      color: var(--an-card-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      margin-top: 2px;
    }

    .an-dd-section {
      padding: 14px 11px 6px;
      font-size: .68rem;
      color: var(--an-card-muted); font-weight: 500;
      text-transform: uppercase; letter-spacing: .08em;
      font-family: var(--an-font);
    }
    .an-dd-item {
      display: flex; align-items: center; gap: 11px;
      padding: 10px 10px; border-radius: 12px;
      font-size: .85rem; color: var(--an-card-ink); font-weight: 300;
      text-decoration: none; cursor: pointer;
      transition: background .12s, padding-left .12s;
      font-family: var(--an-font); border: none;
      background: none; width: 100%; text-align: left;
      position: relative;
    }
    .an-dd-item:hover { background: var(--an-green-dim); padding-left: 13px; }
    .an-dd-ico {
      width: 18px; height: 18px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      color: var(--an-card-muted); transition: color .12s;
    }
    .an-dd-item:hover .an-dd-ico { color: var(--an-green); }
    .an-dd-item:hover { color: #fff; }
    .an-dd-item svg { width: 18px; height: 18px; flex-shrink: 0; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
    .an-dd-item.red .an-dd-ico { color: rgba(255,107,84,0.8); }
    .an-dd-item.red:hover .an-dd-ico { color: var(--an-danger); }
    .an-dd-item.red { color: rgba(255,140,122,0.9); }
    .an-dd-item.red:hover { background: rgba(255,107,84,0.1); color: #ffb3a3; }

    .an-dd-sep { height: 1px; background: var(--an-card-border); margin: 6px 10px; }

    .an-dd-badge {
      margin-left: auto; flex-shrink: 0;
      background: var(--an-green); color: var(--an-green-ink);
      font-size: .66rem; font-weight: 500;
      min-width: 18px; height: 18px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      padding: 0 5px; font-family: var(--an-font);
    }
    .an-dd-badge.warn { background: var(--an-warn); color: #1a1400; }
    .an-dd-badge.dot { width: 7px; height: 7px; min-width: 0; padding: 0; border-radius: 50%; background: var(--an-danger); }

    .an-burger {
      display: none;
      align-items: center; justify-content: center;
      width: 38px; height: 38px;
      background: none; border: 1px solid var(--an-line);
      border-radius: 12px; cursor: pointer; flex-shrink: 0;
      transition: border-color .15s, background .15s;
    }
    .an-burger:hover { border-color: rgba(255,255,255,.2); background: rgba(255,255,255,.04); }
    .an-burger span {
      display: block; width: 16px; height: 1.6px; background: var(--an-ink);
      border-radius: 2px; position: relative; transition: transform .2s, opacity .2s;
    }
    .an-burger span::before, .an-burger span::after {
      content: ''; position: absolute; left: 0; width: 16px; height: 1.6px;
      background: var(--an-ink); border-radius: 2px; transition: transform .2s, top .2s, opacity .2s;
    }
    .an-burger span::before { top: -5px; }
    .an-burger span::after  { top: 5px; }
    .an-burger.open span { background: transparent; }
    .an-burger.open span::before { top: 0; transform: rotate(45deg); }
    .an-burger.open span::after  { top: 0; transform: rotate(-45deg); }

    .an-mobile-sheet {
      position: fixed; top: calc(20px + 64px + 10px); left: 50%; transform: translateX(-50%) translateY(-8px);
      z-index: 8999;
      width: calc(100% - 40px); max-width: 1100px;
      background: var(--an-bg);
      border: 1px solid var(--an-line);
      border-radius: 24px;
      padding: 10px;
      display: none;
      flex-direction: column; gap: 2px;
      opacity: 0; pointer-events: none;
      transition: opacity .18s ease, transform .18s ease;
      font-family: var(--an-font);
      box-shadow: 0 16px 40px rgba(0,0,0,.4);
    }
    .an-mobile-sheet.open { opacity: 1; pointer-events: all; transform: translateX(-50%) translateY(0); }
    .an-mobile-link {
      display: block; color: var(--an-ink-dim);
      font-weight: 300; font-size: .95rem;
      text-decoration: none; padding: 14px 16px;
      border-radius: 14px; transition: background .12s, color .12s;
    }
    .an-mobile-link:hover, .an-mobile-link.active { color: var(--an-ink); background: rgba(255,255,255,.05); }
    .an-mobile-link.active { font-weight: 500; }
    .an-mobile-cta {
      display: block; text-align: center; margin-top: 4px;
      background: var(--an-green); color: var(--an-green-ink);
      font-weight: 500; font-size: .95rem;
      text-decoration: none; padding: 14px 16px; border-radius: 14px;
    }

    @media (max-width: 768px) {
      .antviz-nav { top: 14px; height: 58px; padding: 0 8px 0 18px; width: calc(100% - 24px); border-radius: 20px; }
      .an-logo { font-size: .88rem; }
      .an-logo img { width: 24px; height: 24px; }
      .an-center { display: none; }
      .an-cta.show { display: none; }
      .an-burger { display: flex; }
      .an-mobile-sheet { top: calc(14px + 58px + 8px); }
      .an-uname { display: none; }
      .an-user-btn { padding: 5px; }
      .an-user-btn.guest { padding: .5rem .7rem; }
      .an-user-btn.guest .an-uname { display: inline; max-width: 60px; }
    }
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
    404:      { centerLinks: PUBLIC_LINKS, showCta: true },
    default:  { centerLinks: PUBLIC_LINKS, showCta: true },
  };

  const cfg = NAV_CONFIG[page] || NAV_CONFIG.default;

  const DD_ITEMS = [
    { href: b+'profile',         icon: '<rect x="3.5" y="3.5" width="17" height="17" rx="6"/><path d="M7.5 8.5h9M7.5 12h6M7.5 15.5h4"/>', label: 'Обзор кабинета' },
    { sep: true },
    { section: 'Кабинет' },
    { href: b+'profile/orders',  icon: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 9.5h8M8 13h8M8 16.5h4.5"/>', label: 'Мои заказы', badgeKey: 'orders' },
    { href: b+'profile/tickets', icon: '<rect x="4" y="6" width="16" height="12" rx="3.5"/><path d="M4 10.5h16" stroke-dasharray="0.1 3.4"/><circle cx="8.2" cy="14" r="1"/>', label: 'Обслуживание', badgeKey: 'tickets' },
    { href: b+'profile/support', icon: '<rect x="4" y="5" width="16" height="11" rx="4"/><path d="M9 19.5l1.6-3.5h2.8l1.6 3.5"/><circle cx="9.2" cy="10.3" r="1.1"/><circle cx="14.8" cy="10.3" r="1.1"/>', label: 'Поддержка', badgeKey: 'support' },
    { sep: true },
    { href: b+'profile/settings', icon: '<rect x="4" y="4" width="16" height="16" rx="5"/><path d="M9 9l6 6M15 9l-6 6"/>', label: 'Настройки' },
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

  function buildMobileSheet() {
    if (cfg.inApp) return '';
    const links = cfg.centerLinks || [];
    const linksHtml = links.map(l => `<a href="${l.href}" class="an-mobile-link${page === l.key ? ' active' : ''}">${l.label}</a>`).join('');
    const ctaHtml = (!cfg.hideCta) ? `<a href="${b}order" class="an-mobile-cta">Заказать сайт</a>` : '';
    if (!linksHtml && !ctaHtml) return '';
    return `<div class="an-mobile-sheet" id="anMobileSheet">${linksHtml}${ctaHtml}</div>`;
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

    ${!cfg.inApp ? `<button class="an-burger" id="anBurger" aria-label="Меню" aria-expanded="false"><span></span></button>` : ''}
  </div>
</nav>
${buildMobileSheet()}`;

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

  const burger = document.getElementById('anBurger');
  const sheet  = document.getElementById('anMobileSheet');
  burger?.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
    sheet?.classList.toggle('open', open);
  });
  function closeMobileSheet() {
    burger?.classList.remove('open');
    burger?.setAttribute('aria-expanded', 'false');
    sheet?.classList.remove('open');
  }

  document.addEventListener('click', e => {
    if (!userBtn || !dd) return;
    if (!userBtn.contains(e.target) && !dd.contains(e.target)) {
      dd.classList.remove('open');
      userBtn.setAttribute('aria-expanded', 'false');
    }
    if (burger && sheet && !burger.contains(e.target) && !sheet.contains(e.target)) {
      closeMobileSheet();
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { dd?.classList.remove('open'); closeMobileSheet(); }
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
      query(collection(db, 'chats', user.uid, 'messages'), where('sender', '==', 'admin'), where('readByUser', '==', false)),
      snap => {
        setBadge('support', snap.size, 'warn');
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
        console.error('nav.js:App не инициализирован');
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
