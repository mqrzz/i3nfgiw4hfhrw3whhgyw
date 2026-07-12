/**
 * nav.js — Antviz
 * <script src="nav.js" data-page="home"></script>
 *
 * ПОЛНАЯ ПЕРЕСБОРКА (v2):
 * — визуальный язык взят напрямую с главной страницы (тени с синим
 *   подтоном --sh2, радиусы из той же лестницы 28/32/40, зелёный —
 *   только как акцент состояния, никакой декоративной "зелёной полоски");
 * — один-единственный триггер открытия/закрытия (клик), никакого
 *   гибрида hover+aria — это и было источником "дёрганых" анимаций;
 * — новый набор иконок: единая толщина линии, единая геометрия
 *   (rounded-square контейнер + простой глиф), никакого разнобоя фигур;
 * — капсула полностью непрозрачная (--nv-bg), без blur/glassmorphism —
 *   такого эффекта в интерфейсе Antviz принципиально нет;
 * — логотип — сам файл фавикона крупным планом, без декоративной
 *   круглой подложки; никаких градиентов нигде в навигации (в т.ч.
 *   в индикаторе непрочитанного — это точка, а не conic-gradient);
 * — все радиусы и letter-spacing выровнены под системную лестницу сайта;
 * — уважение reduced-motion и видимый focus-visible.
 *
 * Не импортирует firebase-config.js сам — ждёт, пока Firebase App
 * инициализирует САМА СТРАНИЦА, и подключается к уже существующему
 * приложению через getApps()/getAuth(). Логика авторизации, бейджей
 * и сессий не менялась — менялся только визуальный слой и разметка
 * вокруг него (id остались прежними, чтобы ничего не сломать).
 */
(function () {

  const script = document.currentScript;
  const page   = script ? (script.getAttribute('data-page') || 'home') : 'home';
  const depth  = (window.location.pathname.replace(/\/+$/, '').match(/\//g) || []).length - 1;
  const b      = depth > 0 ? '../' : '';

  /* ─────────────── CSS ─────────────── */
  const CSS = `
    :root {
      --nv-bg:        #191b1e;
      --nv-bg-soft:   rgba(25,27,30,.82);
      --nv-surface:   #232629;
      --nv-surface2:  #2b2f33;
      --nv-line:      rgba(255,255,255,.09);
      --nv-line-soft: rgba(255,255,255,.05);
      --nv-ink:       #ffffff;
      --nv-ink-dim:   rgba(255,255,255,.5);
      --nv-ink-faint: rgba(255,255,255,.3);
      --nv-green:     #1ede7b;
      --nv-green-h:   #1ac16b;
      --nv-green-ink: #0e1512;
      --nv-green-dim: rgba(30,222,123,.12);
      --nv-warn:      #f5a623;
      --nv-danger:    #ff6b54;
      --nv-sh:        0 20px 44px rgba(4,10,26,.38), 0 4px 14px rgba(4,10,26,.22);
      --nv-font:      'Geologica','Inter','Arial',sans-serif;
      --nv-ease:      cubic-bezier(.16,1,.3,1);
    }

    .antviz-nav, .antviz-nav * { box-sizing: border-box; }

    /* ── Капсула ──
       Было: полупрозрачный blur поверх белого сайта — от этого капсула
       читалась серой, а не чёрной. Теперь — плотный непрозрачный
       --nv-bg (тот же тон, что .hero-block/.calc-block на сайте),
       плюс тёплое зелёное свечение снизу для уверенности бренда.
       Форма — почти полная пилюля (радиус ~ половина высоты), ссылки —
       просто текст без фоновых "таблеток" при ховере, один явный
       контрастный CTA справа (см. референс Darkweb X, который прислал
       заказчик). */
    .antviz-nav {
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      z-index: 9000;
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px;
      padding: 8px 8px 8px 24px;
      height: 72px;
      width: calc(100% - 32px); max-width: 1120px;
      background: var(--nv-bg);
      border: 1px solid rgba(255,255,255,.07);
      border-radius: 40px;
      box-shadow: 0 24px 50px rgba(0,0,0,.44), 0 0 0 1px rgba(30,222,123,.04), 0 14px 36px -6px rgba(30,222,123,.16);
      font-family: var(--nv-font);
      transition: border-color .2s var(--nv-ease), box-shadow .2s var(--nv-ease);
    }
    .antviz-nav:hover { border-color: rgba(30,222,123,.2); }

    .nv-logo {
      font-family: var(--nv-font); font-weight: 500;
      font-size: 17px; letter-spacing: -.03em;
      color: var(--nv-ink); text-decoration: none;
      display: flex; align-items: center; gap: 10px; flex-shrink: 0;
    }
    /* Раньше здесь была круглая подложка вокруг фавикона — просто
       декоративный контейнер, который ничего не нёс кроме шума.
       Убрали: сам логотип крупнее и стоит без рамки. */
    .nv-logo-mark { width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0; object-fit: cover; }

    /* ── Центр: просто текстовые ссылки, без плашек при ховере ── */
    .nv-center {
      position: absolute; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 30px;
    }
    .nv-link {
      color: var(--nv-ink-dim);
      font-family: var(--nv-font); font-weight: 300; font-size: 15px;
      text-decoration: none;
      white-space: nowrap; position: relative;
      display: flex; align-items: center;
      transition: color .15s var(--nv-ease);
    }
    .nv-link:hover { color: var(--nv-ink); }
    .nv-link.active { color: var(--nv-ink); font-weight: 500; }
    .nv-link.active::after {
      content: ''; position: absolute; left: 0; right: 0; bottom: -15px;
      height: 3px; border-radius: 2px; background: var(--nv-green);
    }

    /* Основной CTA — единственный контрастный элемент капсулы,
       ровно как белая "Get started" в референсе, только в нашем
       зелёном. Рендерится отдельно от плоских ссылок, справа. */
    .nv-cta {
      display: flex; align-items: center; flex-shrink: 0;
      background: var(--nv-green); color: var(--nv-green-ink);
      font-family: var(--nv-font); font-weight: 500; font-size: 14.5px;
      text-decoration: none; white-space: nowrap;
      padding: 13px 22px; border-radius: 28px;
      transition: background .15s var(--nv-ease), transform .12s var(--nv-ease);
    }
    .nv-cta:hover { background: var(--nv-green-h); transform: translateY(-1px); }

    .nv-drop { position: relative; display: flex; align-items: center; }
    .nv-drop-btn {
      color: var(--nv-ink-dim);
      font-family: var(--nv-font); font-weight: 300; font-size: 15px;
      background: none; border: none; cursor: pointer;
      padding: 0; display: flex; align-items: center; gap: 6px;
      white-space: nowrap;
      transition: color .15s var(--nv-ease);
    }
    .nv-drop-btn:hover { color: var(--nv-ink); }
    .nv-drop-btn.is-active { color: var(--nv-ink); font-weight: 500; }
    .nv-chev {
      width: 9px; height: 9px; opacity: .45; flex-shrink: 0;
      transition: transform .22s var(--nv-ease), opacity .15s;
    }
    .nv-drop.open .nv-chev { transform: rotate(180deg); opacity: .8; }

    .nv-menu {
      position: absolute; top: calc(100% + 12px); left: 50%;
      background: var(--nv-surface);
      border: 1px solid var(--nv-line);
      border-radius: 20px; padding: 8px;
      min-width: 232px;
      box-shadow: var(--nv-sh);
      opacity: 0; visibility: hidden; pointer-events: none;
      transform: translate(-50%, -6px) scale(.98);
      transform-origin: top center;
      transition: opacity .18s var(--nv-ease), transform .18s var(--nv-ease), visibility 0s linear .18s;
      z-index: 8990;
      font-family: var(--nv-font);
    }
    .nv-drop.open .nv-menu {
      opacity: 1; visibility: visible; pointer-events: all;
      transform: translate(-50%, 0) scale(1);
      transition: opacity .18s var(--nv-ease), transform .18s var(--nv-ease), visibility 0s;
    }

    .nv-menu-label {
      padding: 9px 10px 4px;
      font-size: 10.5px; color: var(--nv-ink-faint); font-weight: 500;
      text-transform: uppercase; letter-spacing: .08em;
    }
    .nv-menu-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 10px; border-radius: 12px;
      font-size: 13.5px; color: rgba(255,255,255,.85); font-weight: 300;
      text-decoration: none; transition: background .12s, color .12s;
      white-space: nowrap;
    }
    .nv-menu-item:hover { background: var(--nv-green-dim); color: #fff; }
    .nv-menu-item:hover .nv-ico { color: var(--nv-green); border-color: rgba(30,222,123,.3); }
    .nv-menu-sep { height: 1px; background: var(--nv-line-soft); margin: 6px 8px; }

    /* ── Иконки: единая геометрия — скруглённый квадрат-контейнер
       + простой глиф; никакого разнобоя форм ── */
    .nv-ico {
      width: 26px; height: 26px; flex-shrink: 0; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      color: var(--nv-ink-faint);
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.06);
      transition: color .12s, border-color .12s;
    }
    .nv-ico svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }

    .nv-right { display: flex; align-items: center; gap: 20px; margin-left: auto; }

    /* ── Пользователь ── */
    .nv-user { position: relative; display: flex; }
    .nv-user-btn {
      display: flex; align-items: center; gap: 9px;
      background: none; border: 1px solid transparent;
      border-radius: 14px; padding: 4px 12px 4px 4px;
      cursor: pointer; transition: border-color .15s, background .15s;
      font-family: var(--nv-font); font-weight: 300; font-size: 13.5px; color: var(--nv-ink);
      text-decoration: none; position: relative;
    }
    .nv-user-btn:hover { border-color: var(--nv-line); background: rgba(255,255,255,.05); }
    .nv-user-btn.guest {
      padding: 0; border: none; background: none;
      font-weight: 300; font-size: 15px; color: var(--nv-ink-dim);
    }
    .nv-user-btn.guest:hover { border-color: transparent; background: none; color: var(--nv-ink); }
    .nv-user-btn.guest .nv-avatar-wrap,
    .nv-user-btn.guest .nv-chev-user { display: none; }

    /* Раньше тут было конус-градиентное "кольцо" вокруг аватара для
       индикации непрочитанных — прямое нарушение правила "никаких
       градиентов в UI". Заменили на обычную точку-бейдж в углу,
       тот же паттерн, что уже используется в .nv-badge.dot внутри
       выпадающего меню — единообразно со всем остальным интерфейсом. */
    .nv-avatar-wrap { position: relative; width: 32px; height: 32px; flex-shrink: 0; }
    .nv-avatar {
      width: 100%; height: 100%; border-radius: 12px;
      background: var(--nv-green);
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 500; color: var(--nv-green-ink);
      overflow: hidden;
    }
    .nv-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .nv-avatar-dot {
      position: absolute; top: -2px; right: -2px;
      width: 9px; height: 9px; border-radius: 50%;
      background: var(--nv-warn);
      border: 2px solid var(--nv-bg);
      display: none;
    }
    .nv-avatar-dot.show { display: block; }
    .nv-uname { max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .nv-chev-user { width: 10px; height: 10px; opacity: .4; flex-shrink: 0; transition: transform .2s var(--nv-ease); }
    .nv-user-btn[aria-expanded="true"] .nv-chev-user { transform: rotate(180deg); }

    .nv-dd {
      position: absolute; top: calc(100% + 12px); right: 0;
      background: var(--nv-surface);
      border: 1px solid var(--nv-line);
      border-radius: 20px; padding: 8px;
      min-width: 256px;
      box-shadow: var(--nv-sh);
      opacity: 0; visibility: hidden; pointer-events: none;
      transform: translateY(-6px) scale(.98);
      transform-origin: top right;
      transition: opacity .18s var(--nv-ease), transform .18s var(--nv-ease), visibility 0s linear .18s;
      z-index: 9999;
      font-family: var(--nv-font);
    }
    .nv-dd.open {
      opacity: 1; visibility: visible; pointer-events: all;
      transform: translateY(0) scale(1);
      transition: opacity .18s var(--nv-ease), transform .18s var(--nv-ease), visibility 0s;
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
    .nv-dd-head-name {
      font-size: 14px; font-weight: 500; color: #fff;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: -.03em;
    }
    .nv-dd-head-email {
      font-weight: 300; font-size: 11.5px; color: var(--nv-ink-faint);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px;
    }

    .nv-dd-section {
      padding: 12px 11px 5px;
      font-size: 10.5px; color: var(--nv-ink-faint); font-weight: 500;
      text-transform: uppercase; letter-spacing: .08em;
    }
    .nv-dd-item {
      display: flex; align-items: center; gap: 11px;
      padding: 8px 10px; border-radius: 12px;
      font-size: 13.5px; color: rgba(255,255,255,.85); font-weight: 300;
      text-decoration: none; cursor: pointer;
      transition: background .12s, color .12s;
      border: none; background: none; width: 100%; text-align: left;
      position: relative; font-family: var(--nv-font);
    }
    .nv-dd-item:hover { background: var(--nv-green-dim); color: #fff; }
    .nv-dd-item:hover .nv-ico { color: var(--nv-green); border-color: rgba(30,222,123,.3); }
    .nv-dd-item.danger .nv-ico { color: rgba(255,107,84,.75); }
    .nv-dd-item.danger:hover { background: rgba(255,107,84,.1); color: #ffb3a3; }
    .nv-dd-item.danger:hover .nv-ico { color: var(--nv-danger); border-color: rgba(255,107,84,.3); }
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

    /* ── Бургер / мобильное меню ── */
    .nv-burger {
      display: none; align-items: center; justify-content: center;
      width: 40px; height: 40px;
      background: none; border: 1px solid var(--nv-line);
      border-radius: 12px; cursor: pointer; flex-shrink: 0;
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
      position: fixed; top: calc(20px + 72px + 10px); left: 50%;
      transform: translateX(-50%) translateY(-8px) scale(.98);
      z-index: 8999;
      width: calc(100% - 32px); max-width: 1080px;
      max-height: calc(100vh - 20px - 72px - 34px);
      overflow-y: auto;
      background: var(--nv-bg);
      border: 1px solid rgba(255,255,255,.09);
      border-radius: 24px;
      padding: 8px;
      display: none; flex-direction: column; gap: 2px;
      opacity: 0; visibility: hidden; pointer-events: none;
      transition: opacity .2s var(--nv-ease), transform .2s var(--nv-ease), visibility 0s linear .2s;
      font-family: var(--nv-font);
      box-shadow: 0 22px 46px rgba(0,0,0,.42), 0 12px 34px -6px rgba(30,222,123,.18);
    }
    .nv-sheet.open {
      opacity: 1; visibility: visible; pointer-events: all;
      transform: translateX(-50%) translateY(0) scale(1);
      transition: opacity .2s var(--nv-ease), transform .2s var(--nv-ease), visibility 0s;
    }
    .nv-mlink {
      display: flex; align-items: center; gap: 12px;
      color: var(--nv-ink-dim); font-weight: 300; font-size: 15px;
      text-decoration: none; padding: 13px 14px;
      border-radius: 14px; transition: background .12s, color .12s;
    }
    .nv-mlink:hover, .nv-mlink.active { color: #fff; background: rgba(255,255,255,.06); }
    .nv-mlink.active { font-weight: 500; }
    .nv-mcta {
      display: block; text-align: center; margin-top: 4px;
      background: var(--nv-green); color: var(--nv-green-ink);
      font-weight: 500; font-size: 15px;
      text-decoration: none; padding: 14px 16px; border-radius: 14px;
    }
    .nv-msection {
      font-size: 10.5px; font-weight: 500; color: var(--nv-ink-faint);
      text-transform: uppercase; letter-spacing: .08em;
      padding: 12px 14px 4px;
    }
    .nv-msep { height: 1px; background: var(--nv-line-soft); margin: 4px 8px; }

    .mobile-cart-badge {
      position: absolute; top: 1px; right: 3px; width: 14px; height: 14px;
      border-radius: 50%; background: var(--nv-green); color: var(--nv-green-ink);
      font-size: 9px; font-weight: 700; display: none; align-items: center; justify-content: center;
    }
    .mobile-cart-badge.show { display: flex; }

    /* focus-visible — доступность, требуется по гайдлайну */
    .antviz-nav a:focus-visible,
    .antviz-nav button:focus-visible {
      outline: 2px solid var(--nv-green); outline-offset: 2px; border-radius: 8px;
    }

    @media (prefers-reduced-motion: reduce) {
      .nv-menu, .nv-dd, .nv-sheet, .nv-chev, .nv-chev-user, .nv-burger-box span { transition: none !important; }
    }

    @media (max-width: 768px) {
      .antviz-nav { top: 14px; height: 60px; padding: 6px 6px 6px 18px; width: calc(100% - 24px); border-radius: 24px; }
      .nv-logo { font-size: 15px; gap: 8px; }
      .nv-logo-mark { width: 34px; height: 34px; }
      .nv-center { display: none; }
      .nv-cta { display: none; }
      .nv-burger { display: flex; }
      .nv-sheet { display: flex; top: calc(14px + 60px + 8px); }
      .nv-uname { display: none; }
      .nv-user-btn { padding: 4px; }
      .nv-user-btn.guest { padding: 0; font-size: 14px; }
      .nv-user-btn.guest .nv-uname { display: inline; max-width: 60px; }
    }
  `;

  const PUBLIC_LINKS = [
    { href: b+'order', label: 'Сделать заказ', key: 'order', accent: true },
  ];

  // Единая иконка-контейнер: <rect/> квадрат-скругление + один простой
  // глиф внутри, толщина линии всегда 1.7 — см. .nv-ico
  const NAV_DROPDOWNS = [
    {
      label: 'Услуги',
      key: 'services',
      sections: [
        {
          label: 'Примеры работ',
          items: [
            { href: b+'project1', label: 'Лендинг',           icon: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/>' },
            { href: b+'project2', label: 'Визитная карточка',  icon: '<rect x="3" y="6" width="18" height="12" rx="3"/><circle cx="8.2" cy="12" r="1.5"/><path d="M13 10.3h6M13 13.7h6"/>' },
            { href: b+'project3', label: 'Портфолио',          icon: '<rect x="3" y="4" width="18" height="14" rx="3"/><path d="M3 15l4.2-4.2a2 2 0 012.8 0L14 14.8M12.5 13.3l1.6-1.6a2 2 0 012.8 0L21 15" /><circle cx="7.8" cy="8.2" r="1.3"/>' },
          ]
        },
        { sep: true },
        {
          items: [
            { href: b+'order', label: 'Все тарифы', icon: '<path d="M5 12h14M13 6l6 6-6 6"/>' },
          ]
        }
      ]
    },
    {
      label: 'О сервисе',
      key: 'company',
      sections: [
        {
          items: [
            { href: 'https://antviz.ru/about', label: 'О сервисе',         icon: '<circle cx="12" cy="12" r="8.5"/><path d="M12 8h.01M11 11.5h1.4v5"/>' },
            { href: b+'rules',                  label: 'Правила',          icon: '<path d="M12 3l7 3.2v4.8c0 4.8-3 8-7 9.5-4-1.5-7-4.7-7-9.5V6.2L12 3z"/><path d="M9.2 12l1.9 1.9L15.2 10"/>' },
            { href: b+'privacy',                 label: 'Конфиденциальность', icon: '<rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/><path d="M8 10.5V8a4 4 0 018 0v2.5"/><circle cx="12" cy="14.7" r="1.3"/>' },
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
    sites:    { centerLinks: PUBLIC_LINKS, showCta: true },
    support:  { centerLinks: PUBLIC_LINKS, showCta: true },
    settings: { centerLinks: PUBLIC_LINKS, showCta: true },
    tickets:  { centerLinks: PUBLIC_LINKS, showCta: true },
    notifications: { centerLinks: PUBLIC_LINKS, showCta: true },
    default:  { centerLinks: PUBLIC_LINKS, showCta: true },
  };

  const cfg = NAV_CONFIG[page] || NAV_CONFIG.default;

  const DD_ITEMS = [
    { href: b+'profile',               icon: '<rect x="4" y="4" width="16" height="16" rx="5"/><path d="M4 10.2h16M9.8 10.2V20"/>', label: 'Обзор кабинета' },
    { sep: true },
    { section: 'Кабинет' },
    { href: b+'profile/orders',        icon: '<path d="M7 5h6l4 4v10a1 1 0 01-1 1H7a1 1 0 01-1-1V6a1 1 0 011-1z"/><path d="M13 5v4h4"/><path d="M9 13h6M9 16h4"/>', label: 'Мои заказы', badgeKey: 'orders' },
    { href: b+'profile/sites',         icon: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.8 2.8 2.8 14.2 0 17M12 3.5c-2.8 2.8-2.8 14.2 0 17"/>', label: 'Мои сайты' },
    { href: b+'profile/tickets',       icon: '<path d="M4 8a4 4 0 018 0M12 8a4 4 0 018 0"/><rect x="3" y="8" width="4.4" height="7" rx="1.6"/><rect x="16.6" y="8" width="4.4" height="7" rx="1.6"/><path d="M16.6 15v1.2a3 3 0 01-3 3h-2.1"/>', label: 'Обслуживание', badgeKey: 'tickets' },
    { href: b+'profile/support',       icon: '<circle cx="9" cy="10" r="1.15"/><circle cx="15" cy="10" r="1.15"/><path d="M5 12.5V11a7 7 0 0114 0v1.5M8.6 18l1.3-2.8h4.2l1.3 2.8"/>', label: 'Поддержка', badgeKey: 'support' },
    { href: b+'profile/notifications', icon: '<path d="M6.5 9.2a5.5 5.5 0 0111 0c0 6 2 7.3 2 7.3H4.5s2-1.3 2-7.3z"/><path d="M10.2 20.5a2 2 0 003.6 0"/>', label: 'Уведомления', badgeKey: 'notif' },
    { sep: true },
    { href: b+'profile/settings',      icon: '<circle cx="12" cy="12" r="2.6"/><path d="M12 3v2.6M12 18.4V21M4.9 4.9l1.85 1.85M17.25 17.25l1.85 1.85M3 12h2.6M18.4 12H21M4.9 19.1l1.85-1.85M17.25 6.75l1.85-1.85"/>', label: 'Настройки' },
    { logout: true },
  ];

  function iconHtml(svg) { return `<span class="nv-ico"><svg viewBox="0 0 24 24">${svg}</svg></span>`; }

  function buildDD() {
    return DD_ITEMS.map(item => {
      if (item.section) return `<div class="nv-dd-section">${item.section}</div>`;
      if (item.sep)     return `<div class="nv-dd-sep"></div>`;
      if (item.logout)  return `<button class="nv-dd-item danger" id="anSignOut">${iconHtml('<path d="M9 4H6.5A2.5 2.5 0 004 6.5v11A2.5 2.5 0 006.5 20H9"/><path d="M20 12H10.5"/><path d="M16 8l4 4-4 4"/>')}Выйти</button>`;
      const badgeSlot = item.badgeKey ? `<span class="nv-badge" id="anBadge-${item.badgeKey}" style="display:none"></span>` : '';
      return `<a href="${item.href}" class="nv-dd-item">${iconHtml(item.icon)}${item.label}${badgeSlot}</a>`;
    }).join('');
  }

  function buildNavMenu(sections) {
    return sections.map(sec => {
      if (sec.sep) return '<div class="nv-menu-sep"></div>';
      let html = sec.label ? '<div class="nv-menu-label">' + sec.label + '</div>' : '';
      html += sec.items.map(item =>
        '<a href="' + item.href + '" class="nv-menu-item">' + iconHtml(item.icon) + item.label + '</a>'
      ).join('');
      return html;
    }).join('');
  }

  function buildCenter() {
    if (cfg.inApp) return '';
    const links = (cfg.centerLinks || []).filter(l => !l.accent);
    const chevronSvg = '<svg class="nv-chev" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

    const dropdowns = NAV_DROPDOWNS.map(drop => {
      const isActive = drop.sections.some(s => s.items && s.items.some(i => i.href === b + drop.key));
      return '<div class="nv-drop" data-drop="' + drop.key + '">' +
        '<button class="nv-drop-btn' + (isActive ? ' is-active' : '') + '" aria-expanded="false">' +
        drop.label + chevronSvg +
        '</button>' +
        '<div class="nv-menu" id="anDrop-' + drop.key + '">' +
        buildNavMenu(drop.sections) +
        '</div></div>';
    }).join('');

    const plainLinks = links.map(l =>
      '<a href="' + l.href + '" class="nv-link' + (page === l.key ? ' active' : '') + '">' + l.label + '</a>'
    ).join('');

    if (!dropdowns && !plainLinks) return '';
    return '<div class="nv-center" id="anCenter">' + dropdowns + plainLinks + '</div>';
  }

  // Единственный контрастный элемент капсулы — по образцу референса
  // (сплошная светлая пилюля справа на тёмной панели). Рендерится
  // отдельно от плоских ссылок центра и садится в nv-right.
  function buildCta() {
    if (cfg.inApp || cfg.hideCta) return '';
    const link = (cfg.centerLinks || []).find(l => l.accent);
    if (!link) return '';
    return '<a href="' + link.href + '" class="nv-cta">' + link.label + '</a>';
  }

  function buildMobileSheet() {
    if (cfg.inApp) return '';
    let html = '';

    NAV_DROPDOWNS.forEach(drop => {
      html += '<div class="nv-msection">' + drop.label + '</div>';
      drop.sections.forEach(sec => {
        if (sec.sep) return;
        if (sec.items && sec.items.length) {
          sec.items.forEach(item => {
            html += '<a href="' + item.href + '" class="nv-mlink">' + iconHtml(item.icon) + item.label + '</a>';
          });
        }
      });
      html += '<div class="nv-msep"></div>';
    });

    const plainLinks = (cfg.centerLinks || []).filter(l => !l.accent);
    plainLinks.forEach(l => {
      html += '<a href="' + l.href + '" class="nv-mlink' + (page === l.key ? ' active' : '') + '">' + l.label + '</a>';
    });

    const ctaHtml = (!cfg.hideCta) ? '<a href="' + b + 'order" class="nv-mcta">Заказать сайт</a>' : '';
    if (!html && !ctaHtml) return '';
    return '<div class="nv-sheet" id="anMobileSheet">' + html + ctaHtml + '</div>';
  }

  const NAV_HTML = `
<nav class="antviz-nav" id="antvizNav">
  <a class="nv-logo" href="${b || '/'}">
    <img class="nv-logo-mark" src="${b}img/favicon.png" alt="Antviz">
    Antviz
  </a>

  ${buildCenter()}

  <div class="nv-right">
    <div class="nv-user" id="anUser">
      <a href="${b}auth" class="nv-user-btn guest" id="anUserBtn" aria-expanded="false">
        <div class="nv-avatar-wrap">
          <div class="nv-avatar" id="anAvatar">?</div>
          <span class="nv-avatar-dot" id="anAvatarDot"></span>
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

    ${buildCta()}

    ${!cfg.inApp ? `<button class="nv-burger" id="anBurger" aria-label="Меню" aria-expanded="false"><span class="nv-burger-box"><span></span><span></span><span></span></span></button>` : ''}
  </div>
</nav>
${buildMobileSheet()}`;

  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const bodyPad = document.createElement('style');
  bodyPad.textContent = 'body { padding-top: 110px; } @media(max-width:768px){ body { padding-top: 94px; } }';
  document.head.appendChild(bodyPad);

  document.body.insertAdjacentHTML('afterbegin', NAV_HTML);

  let userBtn = document.getElementById('anUserBtn');
  const dd    = document.getElementById('anDd');
  let isAuthed = false;

  /* ── Единый механизм открытия/закрытия: только клик, только
     класс .open — никакого CSS :hover-триггера и никакой второй
     логики на aria-expanded одновременно. Один источник истины. ── */
  function closeAllDrops(except) {
    document.querySelectorAll('.nv-drop.open').forEach(d => {
      if (d === except) return;
      d.classList.remove('open');
      d.querySelector('.nv-drop-btn')?.setAttribute('aria-expanded', 'false');
    });
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
    closeAllDrops();
    const open = !dd.classList.contains('open');
    dd.classList.toggle('open', open);
    userBtn.setAttribute('aria-expanded', String(open));
  }
  userBtn?.addEventListener('click', onUserBtnClick);

  document.querySelectorAll('.nv-drop').forEach(drop => {
    const btn = drop.querySelector('.nv-drop-btn');
    btn?.addEventListener('click', e => {
      e.stopPropagation();
      closeUserDd();
      const willOpen = !drop.classList.contains('open');
      closeAllDrops(willOpen ? drop : null);
      drop.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', String(willOpen));
    });
  });

  const burger = document.getElementById('anBurger');
  const sheet  = document.getElementById('anMobileSheet');
  burger?.addEventListener('click', () => {
    closeAllDrops();
    closeUserDd();
    const open = !burger.classList.contains('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    sheet?.classList.toggle('open', open);
  });

  document.addEventListener('click', e => {
    if (userBtn && dd && !userBtn.contains(e.target) && !dd.contains(e.target)) closeUserDd();
    if (burger && sheet && !burger.contains(e.target) && !sheet.contains(e.target)) closeMobileSheet();
    if (!e.target.closest('.nv-drop')) closeAllDrops();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeAllDrops();
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
    const dot = document.getElementById('anAvatarDot');
    if (!dot) return;
    const any = ['support','tickets','notif'].some(k => {
      const el = document.getElementById(`anBadge-${k}`);
      return el && el.style.display !== 'none';
    });
    dot.classList.toggle('show', any);
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
    const avatarDot = document.getElementById('anAvatarDot');
    const ddHead   = document.getElementById('anDdHead');

    isAuthed = false;
    userBtn.classList.add('guest');
    userBtn.setAttribute('href', `${b}auth`);
    if (unameEl) unameEl.textContent = 'Войти';
    if (avatarEl) avatarEl.innerHTML = '?';
    avatarDot?.classList.remove('show');
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
      const sessMod = await import(`${b}profile/sessions.js?v=4`).catch(e => { console.error('nav.js sessions.js import error:', e); return null; });

      let tries = 0;
      while (appMod.getApps().length === 0 && tries < 100) {
        await new Promise(r => setTimeout(r, 50));
        tries++;
      }
      if (appMod.getApps().length === 0) {
        console.error('nav.js: Произошла ошибка — профиль не может загрузиться.');
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

      let unwatchRevoke = null;

      authMod.onAuthStateChanged(auth, user => {
        teardownListeners();
        unwatchRevoke?.(); unwatchRevoke = null;

        if (user) {
          applyAuthedUI(user);
          watchBadges(db, fsMod, user);
          if (sessMod) {
            // lastActive пишем не чаще раза в 5 минут — как и было.
            sessMod.touchSession(db, auth, user).catch(e => console.error('touchSession:', e));
            // А вот отзыв конкретно ЭТОГО сеанса ловим сразу же через
            // realtime-подписку — без ожидания следующего touch и без
            // Cloud Function/revokeRefreshTokens (токены не тратим).
            unwatchRevoke = sessMod.watchSessionRevocation(db, user.uid, async () => {
              unwatchRevoke?.(); unwatchRevoke = null;
              teardownListeners();
              // КРИТИЧНО: очищаем sessionId до signOut. Без этого при
              // следующем входе registerSession() переиспользует тот же
              // sid, а его документ в Firestore всё ещё revoked:true —
              // из-за гонки с асинхронной геолокацией/Client Hints внутри
              // registerSession() новый onSnapshot-листенер может поймать
              // старое значение раньше, чем оно успеет обновиться, и тут
              // же выкинет пользователя обратно. Именно это и была причина
              // случайных разлогинов сразу после повторного входа.
              sessMod.clearSessionId(user.uid);
              try { await authMod.signOut(auth); } catch(e) {}
              window.location.href = `${b}auth`;
            });
          }
        } else {
          applyGuestUI();
        }
      });
    } catch(e) {
      console.error('nav.js auth error:', e);
    }
  })();

})();
