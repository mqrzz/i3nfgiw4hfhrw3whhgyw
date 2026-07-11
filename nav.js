/**
 * nav.js — Antviz
 * <script src="nav.js" data-page="home"></script>
 *
 * v3 — полноширинный липкий бар (как у большинства сайтов), без плавающей
 * капсулы и скруглений:
 * — position: sticky, во весь экран, тонкая граница снизу вместо тени/парения;
 * — внутренний ряд контента выровнен по тому же max-width, что и .container
 *   на странице — края меню совпадают с краями остальных секций;
 * — логотип — просто иконка+текст на фоне бара, без круглой подложки и свечения;
 * — на десктопе выпадающие меню открываются по НАВЕДЕНИЮ (клик не обязателен),
 *   клик оставлен как запасной способ для тач-планшетов и клавиатуры;
 * — оба выпадающих меню (сервисы/блог/о нас и профиль) — плоский список
 *   текста, без иконок и без цветной подсветки при наведении;
 * — добавлен пункт «Блог» (Новости / Что нового) и отдельная ссылка «Цены»;
 * — бизнес-логика авторизации/бейджей/сессий не менялась.
 */
(function () {

  const script = document.currentScript;
  const page   = script ? (script.getAttribute('data-page') || 'home') : 'home';
  const depth  = (window.location.pathname.replace(/\/+$/, '').match(/\//g) || []).length - 1;
  const b      = depth > 0 ? '../' : '';
  const NAV_H  = 72; // высота бара — константа, используется и в CSS, и для позиционирования мобильной шторки

  /* ─────────────── CSS ─────────────── */
  const CSS = `
    :root {
      --nv-bg:        #191b1e;
      --nv-surface:   #232629;
      --nv-line:      rgba(255,255,255,.09);
      --nv-line-soft: rgba(255,255,255,.06);
      --nv-ink:       #ffffff;
      --nv-ink-dim:   rgba(255,255,255,.52);
      --nv-ink-faint: rgba(255,255,255,.32);
      --nv-green:     #1ede7b;
      --nv-green-h:   #1ac16b;
      --nv-green-ink: #0e1512;
      --nv-warn:      #f5a623;
      --nv-danger:    #ff6b54;
      --nv-font:      'Geologica','Inter','Arial',sans-serif;
      --nv-ease:      cubic-bezier(.16,1,.3,1);
    }

    .antviz-nav, .antviz-nav * { box-sizing: border-box; }

    /* ── Бар: во всю ширину, без скруглений, приклеен сверху ── */
    .antviz-nav {
      position: sticky; top: 0; left: 0; width: 100%;
      z-index: 9000;
      background: var(--nv-bg);
      border-bottom: 1px solid rgba(255,255,255,.08);
      font-family: var(--nv-font);
    }
    .nv-inner {
      max-width: 1328px; margin: 0 auto; padding: 0 20px;
      height: ${NAV_H}px;
      display: flex; align-items: center; justify-content: space-between; gap: 20px;
    }
    @media (min-width: 1024px) { .nv-inner { padding: 0 64px; } }
    @media (min-width: 1280px) { .nv-inner { padding: 0 96px; } }

    /* ── Логотип: просто на фоне бара, без подложки/свечения ── */
    .nv-logo {
      font-family: var(--nv-font); font-weight: 500;
      font-size: 16px; letter-spacing: -.01em;
      color: var(--nv-ink); text-decoration: none;
      display: flex; align-items: center; gap: 10px; flex-shrink: 0;
    }
    .nv-logo img { width: 27px; height: 27px; border-radius: 7px; object-fit: cover; display: block; }

    /* ── Центр: просто текстовые ссылки/дропдауны ── */
    .nv-center { display: flex; align-items: center; gap: 30px; height: 100%; }
    .nv-link {
      color: var(--nv-ink-dim);
      font-family: var(--nv-font); font-weight: 300; font-size: 15px;
      text-decoration: none; white-space: nowrap;
      transition: color .15s var(--nv-ease);
    }
    .nv-link:hover { color: var(--nv-ink); }

    .nv-drop { position: relative; display: flex; align-items: center; height: 100%; }
    .nv-drop-btn {
      color: var(--nv-ink-dim);
      font-family: var(--nv-font); font-weight: 300; font-size: 15px;
      background: none; border: none; cursor: pointer; padding: 0;
      display: flex; align-items: center; gap: 6px; white-space: nowrap;
      transition: color .15s var(--nv-ease);
    }
    .nv-drop:hover .nv-drop-btn, .nv-drop-btn:hover { color: var(--nv-ink); }
    .nv-chev { width: 9px; height: 9px; opacity: .45; flex-shrink: 0; transition: transform .2s var(--nv-ease), opacity .15s; }
    .nv-drop:hover .nv-chev, .nv-drop.open .nv-chev { transform: rotate(180deg); opacity: .8; }

    /* Выпадающее меню: по наведению на десктопе (без обязательного клика),
       .open — запасной способ через клик/тач/клавиатуру.
       padding-top на обёртке = невидимый "мостик", чтобы наведение
       не прерывалось в зазоре между кнопкой и карточкой меню. */
    .nv-menu {
      position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
      padding-top: 12px;
      opacity: 0; visibility: hidden; pointer-events: none;
      transition: opacity .15s var(--nv-ease), visibility 0s linear .15s;
      z-index: 8990;
    }
    @media (hover: hover) and (pointer: fine) {
      .nv-drop:hover .nv-menu { opacity: 1; visibility: visible; pointer-events: all; transition: opacity .15s var(--nv-ease); }
    }
    .nv-drop.open .nv-menu { opacity: 1; visibility: visible; pointer-events: all; transition: opacity .15s var(--nv-ease); }

    .nv-menu-card {
      background: var(--nv-surface);
      border: 1px solid var(--nv-line);
      border-radius: 14px; padding: 6px;
      min-width: 216px;
      box-shadow: 0 18px 40px rgba(0,0,0,.4);
      font-family: var(--nv-font);
    }
    .nv-menu-item {
      display: block; padding: 10px 12px; border-radius: 9px;
      font-size: 14px; color: rgba(255,255,255,.8); font-weight: 300;
      text-decoration: none; white-space: nowrap;
      transition: background .12s, color .12s;
    }
    .nv-menu-item:hover { background: rgba(255,255,255,.07); color: #fff; }
    .nv-menu-sep { height: 1px; background: var(--nv-line-soft); margin: 6px 8px; }

    /* Единственный контрастный элемент бара — CTA-пилюля */
    .nv-cta {
      display: flex; align-items: center; flex-shrink: 0;
      background: var(--nv-green); color: var(--nv-green-ink);
      font-family: var(--nv-font); font-weight: 500; font-size: 14.5px;
      text-decoration: none; white-space: nowrap;
      padding: 11px 20px; border-radius: 12px;
      transition: background .15s var(--nv-ease);
    }
    .nv-cta:hover { background: var(--nv-green-h); }

    .nv-right { display: flex; align-items: center; gap: 22px; margin-left: auto; }

    /* ── Пользователь ── */
    .nv-user { position: relative; display: flex; }
    .nv-user-btn {
      display: flex; align-items: center; gap: 9px;
      background: none; border: none; cursor: pointer;
      font-family: var(--nv-font); font-weight: 300; font-size: 14px; color: var(--nv-ink);
      text-decoration: none; position: relative; padding: 0;
    }
    .nv-user-btn.guest { font-weight: 300; font-size: 15px; color: var(--nv-ink-dim); }
    .nv-user-btn.guest:hover { color: var(--nv-ink); }
    .nv-user-btn.guest .nv-avatar-ring,
    .nv-user-btn.guest .nv-chev-user { display: none; }

    .nv-avatar-ring {
      width: 32px; height: 32px; border-radius: 11px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      position: relative; padding: 2px;
    }
    .nv-avatar-ring.notify { background: conic-gradient(from -45deg, var(--nv-warn), var(--nv-green) 65%); }
    .nv-avatar {
      width: 100%; height: 100%; border-radius: 9px;
      background: var(--nv-green);
      display: flex; align-items: center; justify-content: center;
      font-size: 11.5px; font-weight: 500; color: var(--nv-green-ink);
      overflow: hidden;
    }
    .nv-avatar-ring.notify .nv-avatar { border-radius: 8px; }
    .nv-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .nv-uname { max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .nv-chev-user { width: 10px; height: 10px; opacity: .4; flex-shrink: 0; transition: transform .2s var(--nv-ease); }
    .nv-user-btn[aria-expanded="true"] .nv-chev-user { transform: rotate(180deg); }

    .nv-dd {
      position: absolute; top: calc(100% + 16px); right: 0;
      background: var(--nv-surface);
      border: 1px solid var(--nv-line);
      border-radius: 16px; padding: 6px;
      min-width: 244px;
      box-shadow: 0 18px 40px rgba(0,0,0,.4);
      opacity: 0; visibility: hidden; pointer-events: none;
      transform: translateY(-6px);
      transition: opacity .16s var(--nv-ease), transform .16s var(--nv-ease), visibility 0s linear .16s;
      z-index: 9999;
      font-family: var(--nv-font);
    }
    .nv-dd.open {
      opacity: 1; visibility: visible; pointer-events: all;
      transform: translateY(0);
      transition: opacity .16s var(--nv-ease), transform .16s var(--nv-ease), visibility 0s;
    }

    .nv-dd-head {
      display: flex; align-items: center; gap: 11px;
      padding: 12px 10px 14px; margin-bottom: 4px;
      border-bottom: 1px solid var(--nv-line-soft);
    }
    .nv-dd-head-avatar {
      width: 38px; height: 38px; border-radius: 12px;
      background: var(--nv-green);
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 500; color: var(--nv-green-ink);
      flex-shrink: 0; overflow: hidden;
    }
    .nv-dd-head-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .nv-dd-head-info { min-width: 0; flex: 1; }
    .nv-dd-head-name { font-size: 14px; font-weight: 500; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: -.01em; }
    .nv-dd-head-email { font-weight: 300; font-size: 11.5px; color: var(--nv-ink-faint); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px; }

    .nv-dd-section { padding: 12px 11px 5px; font-size: 10.5px; color: var(--nv-ink-faint); font-weight: 500; text-transform: uppercase; letter-spacing: .08em; }
    .nv-dd-item {
      display: flex; align-items: center; gap: 8px;
      padding: 9px 11px; border-radius: 9px;
      font-size: 14px; color: rgba(255,255,255,.8); font-weight: 300;
      text-decoration: none; cursor: pointer;
      transition: background .12s, color .12s;
      border: none; background: none; width: 100%; text-align: left;
      font-family: var(--nv-font);
    }
    .nv-dd-item:hover { background: rgba(255,255,255,.07); color: #fff; }
    .nv-dd-item.danger { color: rgba(255,107,84,.8); }
    .nv-dd-item.danger:hover { background: rgba(255,107,84,.09); color: #ff9686; }
    .nv-dd-sep { height: 1px; background: var(--nv-line-soft); margin: 6px 10px; }

    .nv-badge {
      margin-left: auto; flex-shrink: 0;
      background: var(--nv-green); color: var(--nv-green-ink);
      font-size: 10.5px; font-weight: 500;
      min-width: 18px; height: 18px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      padding: 0 5px;
    }
    .nv-badge.warn { background: var(--nv-warn); color: #1a1400; }
    .nv-badge.dot { width: 7px; height: 7px; min-width: 0; padding: 0; border-radius: 50%; background: var(--nv-danger); }

    /* ── Бургер / мобильная шторка ── */
    .nv-burger {
      display: none; align-items: center; justify-content: center;
      width: 38px; height: 38px;
      background: none; border: 1px solid var(--nv-line);
      border-radius: 10px; cursor: pointer; flex-shrink: 0;
      transition: border-color .15s, background .15s;
    }
    .nv-burger:hover { border-color: rgba(255,255,255,.22); background: rgba(255,255,255,.05); }
    .nv-burger-box { position: relative; width: 16px; height: 12px; }
    .nv-burger-box span {
      position: absolute; left: 0; width: 16px; height: 1.6px; background: var(--nv-ink);
      border-radius: 2px; transition: transform .22s var(--nv-ease), top .22s var(--nv-ease), opacity .15s;
    }
    .nv-burger-box span:nth-child(1) { top: 0; }
    .nv-burger-box span:nth-child(2) { top: 5px; }
    .nv-burger-box span:nth-child(3) { top: 10px; }
    .nv-burger.open .nv-burger-box span:nth-child(1) { top: 5px; transform: rotate(45deg); }
    .nv-burger.open .nv-burger-box span:nth-child(2) { opacity: 0; }
    .nv-burger.open .nv-burger-box span:nth-child(3) { top: 5px; transform: rotate(-45deg); }

    .nv-sheet {
      position: fixed; top: ${NAV_H}px; left: 0; right: 0;
      z-index: 8999;
      max-height: calc(100vh - ${NAV_H}px);
      overflow-y: auto;
      background: var(--nv-bg);
      border-top: 1px solid rgba(255,255,255,.08);
      padding: 10px 20px 22px;
      display: none; flex-direction: column; gap: 2px;
      opacity: 0; visibility: hidden; pointer-events: none;
      transition: opacity .18s var(--nv-ease), visibility 0s linear .18s;
      font-family: var(--nv-font);
    }
    .nv-sheet.open { opacity: 1; visibility: visible; pointer-events: all; transition: opacity .18s var(--nv-ease), visibility 0s; }
    .nv-mlink {
      display: flex; align-items: center; gap: 12px;
      color: var(--nv-ink-dim); font-weight: 300; font-size: 15px;
      text-decoration: none; padding: 13px 4px;
      border-radius: 10px; transition: background .12s, color .12s;
    }
    .nv-mlink:hover { color: #fff; background: rgba(255,255,255,.05); }
    .nv-mcta {
      display: block; text-align: center; margin-top: 10px;
      background: var(--nv-green); color: var(--nv-green-ink);
      font-weight: 500; font-size: 15px;
      text-decoration: none; padding: 14px 16px; border-radius: 12px;
    }
    .nv-msection { font-size: 10.5px; font-weight: 500; color: var(--nv-ink-faint); text-transform: uppercase; letter-spacing: .08em; padding: 14px 4px 2px; }
    .nv-msep { height: 1px; background: var(--nv-line-soft); margin: 8px 0; }

    .antviz-nav a:focus-visible,
    .antviz-nav button:focus-visible { outline: 2px solid var(--nv-green); outline-offset: 2px; border-radius: 6px; }

    @media (prefers-reduced-motion: reduce) {
      .nv-menu, .nv-dd, .nv-sheet, .nv-chev, .nv-chev-user, .nv-burger-box span { transition: none !important; }
    }

    @media (max-width: 860px) {
      .nv-center, .nv-cta { display: none; }
      .nv-burger { display: flex; }
      .nv-sheet { display: flex; }
      .nv-right { gap: 14px; }
    }
    @media (max-width: 480px) {
      .nv-uname { display: none; }
    }
  `;

  /* ─────────────── Данные меню ─────────────── */

  // Единственный контрастный элемент — управляется per-page через NAV_CONFIG
  const CTA_LINK = { href: b + 'order', label: 'Сделать заказ' };

  const NAV_ITEMS = [
    {
      type: 'dropdown', label: 'Услуги', key: 'services',
      items: [
        { href: b + 'project1', label: 'Лендинг' },
        { href: b + 'project2', label: 'Визитная карточка' },
        { href: b + 'project3', label: 'Портфолио' },
        { sep: true },
        { href: 'https://antviz.ru/price', label: 'Цены' },
      ]
    },
    { type: 'link', href: 'https://antviz.ru/price', label: 'Цены' },
    {
      type: 'dropdown', label: 'Блог', key: 'blog',
      items: [
        { href: 'https://blog.antviz.ru/news', label: 'Главная (новости)' },
        { href: 'https://blog.antviz.ru/updates', label: 'Что нового' },
      ]
    },
    {
      type: 'dropdown', label: 'О сервисе', key: 'company',
      items: [
        { href: 'https://antviz.ru/about', label: 'О сервисе' },
        { href: b + 'rules', label: 'Правила' },
        { href: b + 'privacy', label: 'Конфиденциальность' },
      ]
    },
  ];

  const NAV_CONFIG = {
    home:     { showCta: true },
    faq:      { showCta: true },
    about:    { showCta: true },
    order:    { showCta: false, hideCta: true },
    profile:  { showCta: true },
    auth:     { showCta: false, hideCta: true },
    orders:   { showCta: true },
    sites:    { showCta: true },
    support:  { showCta: true },
    settings: { showCta: true },
    tickets:  { showCta: true },
    notifications: { showCta: true },
    default:  { showCta: true },
  };

  const cfg = NAV_CONFIG[page] || NAV_CONFIG.default;

  const DD_ITEMS = [
    { href: b+'profile',               label: 'Обзор кабинета' },
    { sep: true },
    { section: 'Кабинет' },
    { href: b+'profile/orders',        label: 'Мои заказы', badgeKey: 'orders' },
    { href: b+'profile/sites',         label: 'Мои сайты' },
    { href: b+'profile/tickets',       label: 'Обслуживание', badgeKey: 'tickets' },
    { href: b+'profile/support',       label: 'Поддержка', badgeKey: 'support' },
    { href: b+'profile/notifications', label: 'Уведомления', badgeKey: 'notif' },
    { sep: true },
    { href: b+'profile/settings',      label: 'Настройки' },
    { logout: true },
  ];

  function buildDD() {
    return DD_ITEMS.map(item => {
      if (item.section) return `<div class="nv-dd-section">${item.section}</div>`;
      if (item.sep)     return `<div class="nv-dd-sep"></div>`;
      if (item.logout)  return `<button class="nv-dd-item danger" id="anSignOut">Выйти</button>`;
      const badgeSlot = item.badgeKey ? `<span class="nv-badge" id="anBadge-${item.badgeKey}" style="display:none"></span>` : '';
      return `<a href="${item.href}" class="nv-dd-item">${item.label}${badgeSlot}</a>`;
    }).join('');
  }

  function buildCenter() {
    if (cfg.inApp) return '';
    const chevronSvg = '<svg class="nv-chev" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

    const html = NAV_ITEMS.map(item => {
      if (item.type === 'link') {
        return '<a href="' + item.href + '" class="nv-link">' + item.label + '</a>';
      }
      const menuHtml = item.items.map(it =>
        it.sep ? '<div class="nv-menu-sep"></div>' : '<a href="' + it.href + '" class="nv-menu-item">' + it.label + '</a>'
      ).join('');
      return '<div class="nv-drop" data-drop="' + item.key + '">' +
        '<button class="nv-drop-btn" type="button">' + item.label + chevronSvg + '</button>' +
        '<div class="nv-menu"><div class="nv-menu-card">' + menuHtml + '</div></div>' +
        '</div>';
    }).join('');

    return '<div class="nv-center" id="anCenter">' + html + '</div>';
  }

  function buildCta() {
    if (cfg.inApp || cfg.hideCta) return '';
    return '<a href="' + CTA_LINK.href + '" class="nv-cta">' + CTA_LINK.label + '</a>';
  }

  function buildMobileSheet() {
    if (cfg.inApp) return '';
    let html = '';
    NAV_ITEMS.forEach(item => {
      if (item.type === 'link') {
        html += '<a href="' + item.href + '" class="nv-mlink">' + item.label + '</a>';
        return;
      }
      html += '<div class="nv-msection">' + item.label + '</div>';
      item.items.forEach(it => {
        if (it.sep) return;
        html += '<a href="' + it.href + '" class="nv-mlink">' + it.label + '</a>';
      });
    });
    const ctaHtml = (!cfg.hideCta) ? '<a href="' + b + 'order" class="nv-mcta">Заказать сайт</a>' : '';
    if (!html && !ctaHtml) return '';
    return '<div class="nv-sheet" id="anMobileSheet">' + html + ctaHtml + '</div>';
  }

  const NAV_HTML = `
<nav class="antviz-nav" id="antvizNav">
  <div class="nv-inner">
    <a class="nv-logo" href="${b || '/'}">
      <img src="${b}img/favicon.png" alt="Antviz">
      Antviz
    </a>

    ${buildCenter()}

    <div class="nv-right">
      ${buildCta()}

      <div class="nv-user" id="anUser">
        <a href="${b}auth" class="nv-user-btn guest" id="anUserBtn" aria-expanded="false">
          <div class="nv-avatar-ring" id="anAvatarRing">
            <div class="nv-avatar" id="anAvatar">?</div>
          </div>
          <span class="nv-uname" id="anUname">Войти</span>
          <svg class="nv-chev-user" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
          </svg>
        </a>
        <div class="nv-dd" id="anDd">
          <div class="nv-dd-head" id="anDdHead" style="display:none">
            <div class="nv-dd-head-avatar" id="anDdHeadAvatar">?</div>
            <div class="nv-dd-head-info">
              <div class="nv-dd-head-name" id="anDdHeadName">—</div>
              <div class="nv-dd-head-email" id="anDdHeadEmail">—</div>
            </div>
          </div>
          ${buildDD()}
        </div>
      </div>

      ${!cfg.inApp ? `<button class="nv-burger" id="anBurger" aria-label="Меню" aria-expanded="false"><span class="nv-burger-box"><span></span><span></span><span></span></span></button>` : ''}
    </div>
  </div>
</nav>
${buildMobileSheet()}`;

  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  // Sticky-бар занимает место в обычном потоке документа сам по себе —
  // искусственный padding-top на body больше не нужен (в отличие от
  // прежней плавающей капсулы с position:fixed).
  document.body.insertAdjacentHTML('afterbegin', NAV_HTML);

  let userBtn = document.getElementById('anUserBtn');
  const dd    = document.getElementById('anDd');
  let isAuthed = false;

  function closeAllNavDrops() {
    document.querySelectorAll('.nv-drop.open').forEach(d => d.classList.remove('open'));
  }
  function closeUserDd() {
    dd?.classList.remove('open');
    userBtn?.setAttribute('aria-expanded', 'false');
  }
  function closeMobileSheet() {
    burger?.classList.remove('open');
    burger?.setAttribute('aria-expanded', 'false');
    sheet?.classList.remove('open');
  }

  function onUserBtnClick(e) {
    if (!isAuthed) return;
    e.preventDefault();
    closeAllNavDrops();
    const open = !dd.classList.contains('open');
    dd.classList.toggle('open', open);
    userBtn.setAttribute('aria-expanded', String(open));
  }
  userBtn?.addEventListener('click', onUserBtnClick);

  // Дропдауны в центре: на десктопе открываются по наведению (см. CSS,
  // :hover). Клик — запасной способ для тач-планшетов/клавиатуры, не
  // обязательный на мышке.
  document.querySelectorAll('.nv-drop').forEach(drop => {
    const btn = drop.querySelector('.nv-drop-btn');
    btn?.addEventListener('click', e => {
      e.stopPropagation();
      closeUserDd();
      const willOpen = !drop.classList.contains('open');
      closeAllNavDrops();
      drop.classList.toggle('open', willOpen);
    });
    drop.addEventListener('mouseleave', () => drop.classList.remove('open'));
  });

  const burger = document.getElementById('anBurger');
  const sheet  = document.getElementById('anMobileSheet');
  burger?.addEventListener('click', () => {
    closeAllNavDrops();
    closeUserDd();
    const open = !burger.classList.contains('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    sheet?.classList.toggle('open', open);
  });

  document.addEventListener('click', e => {
    if (userBtn && dd && !userBtn.contains(e.target) && !dd.contains(e.target)) closeUserDd();
    if (burger && sheet && !burger.contains(e.target) && !sheet.contains(e.target)) closeMobileSheet();
    if (!e.target.closest('.nv-drop')) closeAllNavDrops();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeAllNavDrops();
      closeUserDd();
      closeMobileSheet();
    }
  });

  function setBadge(key, value, variant) {
    const el = document.getElementById(`anBadge-${key}`);
    if (!el) return;
    if (!value) { el.style.display = 'none'; return; }
    el.className = 'nv-badge' + (variant ? ' ' + variant : '');
    el.textContent = (variant === 'dot') ? '' : String(value);
    el.style.display = 'flex';
  }
  function refreshNotifyDot() {
    const ring = document.getElementById('anAvatarRing');
    if (!ring) return;
    const any = ['support','tickets','notif'].some(k => {
      const el = document.getElementById(`anBadge-${k}`);
      return el && el.style.display !== 'none';
    });
    ring.classList.toggle('notify', any);
  }

  let unsubSupport = null;
  let unsubOrders  = null;
  let unsubNotif   = null;
  function teardownListeners() {
    unsubSupport?.(); unsubSupport = null;
    unsubOrders?.();  unsubOrders  = null;
    unsubNotif?.();   unsubNotif   = null;
  }

  function applyAuthedUI(user) {
    const centerEl = document.getElementById('anCenter');
    const unameEl  = document.getElementById('anUname');
    const avatarEl = document.getElementById('anAvatar');
    const ddHead   = document.getElementById('anDdHead');
    const ddHeadAv = document.getElementById('anDdHeadAvatar');
    const ddHeadNm = document.getElementById('anDdHeadName');
    const ddHeadEm = document.getElementById('anDdHeadEmail');

    isAuthed = true;
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
    ['support','orders','tickets','notif'].forEach(k => setBadge(k, 0, null));
    refreshNotifyDot();
  }

  const BADGE_TTL_MS = 90 * 1000; // кэш на 90 секунд — навигация по сайту не долбит Firestore на каждый переход

  function readBadgeCache(uid) {
    try {
      const raw = sessionStorage.getItem(`antviz_badges_${uid}`);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (Date.now() - data.ts > BADGE_TTL_MS) return null;
      return data;
    } catch (e) { return null; }
  }
  function writeBadgeCache(uid, data) {
    try { sessionStorage.setItem(`antviz_badges_${uid}`, JSON.stringify({ ...data, ts: Date.now() })); } catch (e) {}
  }
  function applyBadgeData(data) {
    setBadge('support', data.support || 0, 'warn');
    setBadge('orders', data.orders || 0, null);
    setBadge('tickets', data.tickets || 0, 'dot');
    setBadge('notif', data.notif || 0, 'warn');
    refreshNotifyDot();
  }

  async function watchBadges(db, fsMod, user) {
    const { collection, query, where, getDocs } = fsMod;
    teardownListeners();

    const cached = readBadgeCache(user.uid);
    if (cached) { applyBadgeData(cached); return; }

    // Разовое чтение вместо realtime-подписки: бейджам в шапке не нужно
    // обновляться «прямо сейчас, пока страница открыта» — этого достаточно
    // раз на заход, а следующие переходы по сайту берут значение из кэша.
    try {
      const [supportSnap, ordersSnap, notifSnap] = await Promise.all([
        getDocs(query(collection(db, 'chats', user.uid, 'messages'), where('sender', '==', 'admin'), where('readByUser', '==', false))),
        getDocs(query(collection(db, 'orders'), where('uid', '==', user.uid))),
        getDocs(query(collection(db, 'notifications', user.uid, 'items'), where('read', '==', false))),
      ]);

      const orders = ordersSnap.docs.map(d => d.data());
      const active = orders.filter(o => (o.status || 0) >= 1 && (o.status || 0) <= 4).length;
      const activeSupport = orders.some(o =>
        o.supportActive && o.supportExpiresAt?.toDate &&
        o.supportExpiresAt.toDate() > new Date()
      );

      const data = {
        support: supportSnap.size,
        orders: active,
        tickets: activeSupport ? 1 : 0,
        notif: notifSnap.size,
      };
      writeBadgeCache(user.uid, data);
      applyBadgeData(data);
    } catch (e) {}
  }

  /* ── Ждём, пока сама страница инициализирует Firebase App, и подключаемся
     к УЖЕ СУЩЕСТВУЮЩЕМУ приложению — без своего импорта firebase-config.js. */
  (async () => {
    try {
      const appMod  = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
      const authMod = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      const fsMod   = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const sessMod = await import(`${b}profile/sessions.js?v=2`).catch(e => { console.error('nav.js sessions.js import error:', e); return null; });

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
          const uidBefore = auth.currentUser?.uid;
          if (sessMod && uidBefore) await sessMod.endCurrentSession(db, uidBefore).catch(() => {});
          await authMod.signOut(auth);
          window.location.href = b || '/';
        } catch(e) { console.error('nav.js signOut:', e); }
      });

      authMod.onAuthStateChanged(auth, user => {
        teardownListeners();
        if (user) {
          applyAuthedUI(user);
          watchBadges(db, fsMod, user);
          if (sessMod) sessMod.touchSession(db, auth, user).catch(e => console.error('touchSession:', e));
        } else {
          applyGuestUI();
        }
      });
    } catch(e) {
      console.error('nav.js auth error:', e);
    }
  })();

})();
