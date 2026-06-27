/**
 * nav.js — Antviz (дизайн под главную страницу)
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
     Палитра и формы взяты напрямую с главной страницы Antviz:
     тёмная капсула (var(--dark)), зелёный акцент (var(--green)),
     шрифт Geologica, скругления-«квадраты» (не pill). Дропдаун —
     тоже тёмный, на тон светлее капсулы (как .type-card.dark на
     сайте: dark2 на dark), без белых/серых поверхностей. */
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
      display: flex; align-items: center;
    }
    .an-link:hover { color: var(--an-ink); background: rgba(255,255,255,.05); }
    .an-link.active { color: var(--an-ink); font-weight: 500; }
    .an-link.active::after {
      content: ''; position: absolute; left: .9rem; right: .9rem; bottom: 2px;
      height: 2px; border-radius: 2px; background: var(--an-green);
    }

    /* Выделение для ссылки "Сделать заказ" в центре */
    .an-link[href*="order"] {
      color: var(--an-green);
      font-weight: 500;
    }

    /* ── Кнопка с дропдауном в центре навбара ── */
    .an-nav-drop { position: relative; display: flex; align-items: center; }
    .an-nav-drop-btn {
      color: var(--an-ink-dim);
      font-family: var(--an-font); font-weight: 300; font-size: .88rem;
      background: none; border: none; cursor: pointer;
      padding: .5rem .9rem; border-radius: 10px;
      transition: color .15s, background .15s;
      white-space: nowrap; display: flex; align-items: center; gap: 5px;
    }
    .an-nav-drop-btn:hover { color: var(--an-ink); background: rgba(255,255,255,.05); }
    .an-nav-drop-btn.active { color: var(--an-ink); font-weight: 500; }
    .an-nav-drop-chevron {
      width: 10px; height: 10px; opacity: .4; flex-shrink: 0;
      transition: transform .18s, opacity .18s;
    }
    .an-nav-drop-btn[aria-expanded="true"] .an-nav-drop-chevron { transform: rotate(180deg); opacity: .7; }

    .an-nav-menu {
      position: absolute; top: calc(100% + 14px); left: 50%; transform: translateX(-50%) translateY(-6px);
      background: var(--an-card);
      border: 1.5px solid var(--an-card-border);
      border-radius: 20px; padding: 8px;
      min-width: 220px;
      box-shadow: 0 16px 40px rgba(0,0,0,.45), 0 4px 12px rgba(0,0,0,.3);
      opacity: 0; pointer-events: none;
      transition: opacity .16s ease, transform .16s ease;
      z-index: 8990;
      font-family: var(--an-font);
    }
    .an-nav-menu::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: var(--an-green); border-radius: 20px 20px 0 0;
    }
    .an-nav-drop:hover .an-nav-menu,
    .an-nav-menu:hover { opacity: 1; pointer-events: all; transform: translateX(-50%) translateY(0); }
    .an-nav-drop-btn[aria-expanded="true"] ~ .an-nav-menu { opacity: 1; pointer-events: all; transform: translateX(-50%) translateY(0); }

    .an-nav-menu-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 10px; border-radius: 11px;
      font-size: .84rem; color: var(--an-card-ink); font-weight: 300;
      text-decoration: none; transition: background .12s, padding-left .12s;
      white-space: nowrap;
    }
    .an-nav-menu-item:hover { background: var(--an-green-dim); padding-left: 14px; color: #fff; }
    .an-nav-menu-ico {
      width: 16px; height: 16px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      color: var(--an-card-muted); transition: color .12s;
    }
    .an-nav-menu-item:hover .an-nav-menu-ico { color: var(--an-green); }
    .an-nav-menu-ico svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
    .an-nav-menu-sep { height: 1px; background: var(--an-card-border); margin: 5px 8px; }
    .an-nav-menu-label {
      padding: 10px 10px 3px;
      font-size: .65rem; color: var(--an-card-muted); font-weight: 500;
      text-transform: uppercase; letter-spacing: .08em;
    }

    .an-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }

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

    /* Аватар: квадрат со скруглением в духе карточек сайта (border-radius
       такой же логики, как .tier-badge / .rv-av), на зелёном фоне.
       Кольцо появляется только когда есть непрочитанное. */
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

    /* ── Дропдаун: остаётся в тёмной палитре капсулы, на тон светлее
       (--an-card #20242a поверх --an-bg #191b1e) — так же, как
       .type-card.dark (dark2 поверх dark) на главной странице.
       Никакого белого/серого: ховеры и акценты — зелёные. */
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

    /* ══════════════════════════════════════
       МОБИЛЬНАЯ ВЕРСИЯ — та же тёмная капсула,
       только сверху, компактнее, с бургером
       вместо текстовых ссылок по центру.
       Заменяет нижний таб-бар из footer.js.
    ══════════════════════════════════════ */
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
      .an-burger { display: flex; }
      .an-mobile-sheet { display: flex; top: calc(14px + 58px + 8px); }
      .an-uname { display: none; }
      .an-user-btn { padding: 5px; }
      .an-user-btn.guest { padding: .5rem .7rem; }
      .an-user-btn.guest .an-uname { display: inline; max-width: 60px; }
    }
  `;

  const PUBLIC_LINKS = [
    { href: b+'order',  label: 'Сделать заказ', key: 'order' },
  ];

  // Дропдауны центрального навбара
  const NAV_DROPDOWNS = [
    {
      label: 'Услуги',
      key: 'services',
      sections: [
        {
          label: 'Примеры работ',
          items: [
            { href: b+'project1', label: 'Лендинг',            icon: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M3 8h18M8 3v5"/>' },
            { href: b+'project2', label: 'Визитная карточка',   icon: '<rect x="3" y="5" width="18" height="14" rx="4"/><path d="M7 10h6M7 13h4"/>' },
            { href: b+'project3', label: 'Портфолио',           icon: '<rect x="3" y="3" width="8" height="8" rx="3"/><rect x="13" y="3" width="8" height="8" rx="3"/><rect x="3" y="13" width="8" height="8" rx="3"/><rect x="13" y="13" width="8" height="8" rx="3"/>' },
          ]
        },
        { sep: true },
        {
          items: [
            { href: b+'order', label: 'Все тарифы \u2192', icon: '<path d="M5 12h14M12 5l7 7-7 7"/>' },
          ]
        }
      ]
    },
    {
      label: 'Обо мне',
      key: 'company',
      sections: [
        {
          items: [
            { href: 'https://antviz.ru/about', label: 'Обо мне', icon: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>' },
            { href: b+'rules',   label: 'Правила',     icon: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 9h8M8 12h6M8 15h4"/>' },
            { href: b+'privacy', label: 'Конфиденциальность',  icon: '<path d="M12 3l8 4v5c0 5-3.5 8.5-8 10C7.5 20.5 4 17 4 12V7l8-4z"/>' },
          ]
        }
      ]
    },
  ];

  const NAV_CONFIG = {
    home:     { centerLinks: PUBLIC_LINKS, showCta: true },
    faq:      { centerLinks: PUBLIC_LINKS, showCta: true },
    about:    { centerLinks: PUBLIC_LINKS, showCta: true },
    order:    { centerLinks: PUBLIC_LINKS, showCta: false, hideCta: true },
    profile:  { centerLinks: PUBLIC_LINKS, showCta: true },
    auth:     { centerLinks: [], showCta: false, hideCta: true },
    orders:   { centerLinks: PUBLIC_LINKS, showCta: true },
    support:  { centerLinks: PUBLIC_LINKS, showCta: true },
    settings: { centerLinks: PUBLIC_LINKS, showCta: true },
    tickets:  { centerLinks: PUBLIC_LINKS, showCta: true },
    default:  { centerLinks: PUBLIC_LINKS, showCta: true },
  };

  const cfg = NAV_CONFIG[page] || NAV_CONFIG.default;

  // Набор иконок: единая толщина линии (1.6), форма «квадрат со скруглением»
  // перекликается с антвиз-карточками (tier, type-card) — не дефолтный
  // набор, а угловатые геометричные формы под общий стиль сайта.
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

  function buildNavMenu(sections) {
    return sections.map(sec => {
      if (sec.sep) return '<div class="an-nav-menu-sep"></div>';
      let html = sec.label ? '<div class="an-nav-menu-label">' + sec.label + '</div>' : '';
      html += sec.items.map(item =>
        '<a href="' + item.href + '" class="an-nav-menu-item">' +
        '<span class="an-nav-menu-ico"><svg viewBox="0 0 24 24">' + item.icon + '</svg></span>' +
        item.label + '</a>'
      ).join('');
      return html;
    }).join('');
  }

  function buildCenter() {
    if (cfg.inApp) return '';
    const links = cfg.centerLinks || [];
    const chevronSvg = '<svg class="an-nav-drop-chevron" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

    const dropdowns = NAV_DROPDOWNS.map(drop => {
      const isActive = drop.sections.some(s => s.items && s.items.some(i => i.href === b + drop.key));
      return '<div class="an-nav-drop">' +
        '<button class="an-nav-drop-btn' + (isActive ? ' active' : '') + '" aria-expanded="false" data-drop="' + drop.key + '">' +
        drop.label + chevronSvg +
        '</button>' +
        '<div class="an-nav-menu" id="anDrop-' + drop.key + '">' +
        buildNavMenu(drop.sections) +
        '</div></div>';
    }).join('');

    const plainLinks = links.map(l =>
      '<a href="' + l.href + '" class="an-link' + (page === l.key ? ' active' : '') + '">' + l.label + '</a>'
    ).join('');

    if (!dropdowns && !plainLinks) return '';
    return '<div class="an-center" id="anCenter">' + dropdowns + plainLinks + '</div>';
  }

  // Мобильная панель: те же ссылки, что и в центре десктопной капсулы,
  // раскрывается по тапу на бугер, заменяет собой нижний таб-бар из footer.js.
  function buildMobileSheet() {
    if (cfg.inApp) return '';
    const dropLinks = NAV_DROPDOWNS.flatMap(drop =>
      drop.sections.flatMap(sec => sec.sep ? [] : (sec.items || []))
    );
    const plainLinks = cfg.centerLinks || [];
    const allLinks = [...dropLinks, ...plainLinks];

    const uniqueLinks = [];
    const seenHrefs = new Set();
    for (const l of allLinks) {
      if (!seenHrefs.has(l.href)) {
        seenHrefs.add(l.href);
        uniqueLinks.push(l);
      }
    }

    const linksHtml = uniqueLinks.map(l =>
      '<a href="' + l.href + '" class="an-mobile-link' + (page === l.key ? ' active' : '') + '">' + l.label + '</a>'
    ).join('');
    const ctaHtml = (!cfg.hideCta) ? '<a href="' + b + 'order" class="an-mobile-cta">Заказать сайт</a>' : '';
    if (!linksHtml && !ctaHtml) return '';
    return '<div class="an-mobile-sheet" id="anMobileSheet">' + linksHtml + ctaHtml + '</div>';
  }

  const NAV_HTML = `
<nav class="antviz-nav" id="antvizNav">
  <a class="an-logo" href="${b || '/'}">
    <img src="${b}img/favicon.png" alt="Antviz">
    Antviz
  </a>

  ${buildCenter()}

  <div class="an-right">
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

  // Отступ под фиксированный навбар
  const bodyPad = document.createElement('style');
  bodyPad.textContent = 'body { padding-top: 104px; } @media(max-width:768px){ body { padding-top: 90px; } }';
  document.head.appendChild(bodyPad);

  // Вставляем всю разметку NAV_HTML целиком, чтобы an-mobile-sheet попал в DOM
  document.body.insertAdjacentHTML('afterbegin', NAV_HTML);

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

  // Дропдауны центрального навбара — открытие по клику
  document.querySelectorAll('.an-nav-drop-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const key = btn.dataset.drop;
      const menu = document.getElementById('anDrop-' + key);
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      // Закрываем все остальные
      document.querySelectorAll('.an-nav-drop-btn').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Бургер мобильной капсулы — открывает/закрывает an-mobile-sheet
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
    // Закрыть дропдауны центра при клике вне
    const inAnyDrop = e.target.closest('.an-nav-drop');
    if (!inAnyDrop) {
      document.querySelectorAll('.an-nav-drop-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      dd?.classList.remove('open');
      closeMobileSheet();
      document.querySelectorAll('.an-nav-drop-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
    }
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
