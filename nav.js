/**
 * nav.js — Antviz
 * <script src="nav.js" data-page="home"></script>
 *
 * ПОЛНАЯ ПЕРЕСБОРКА (v3) — светлая капсула вместо тёмной:
 * — капсула теперь белая (--nv-bg:#fff), с тонкой светлой обводкой и
 *   мягкой нейтральной тенью — тот же язык, что и у остальных белых
 *   карточек кабинета (.sb-nav/.sb-content), а не отдельный тёмный
 *   остров посреди страницы;
 * — у каждого верхнеуровневого пункта теперь есть простая линейная
 *   иконка (обводка 1.6px, без фоновой плашки) перед подписью —
 *   активный раздел красится в зелёный и получает зелёное подчёркивание;
 * — иконки внутри выпадающих меню/профиля остались в скруглённых
 *   плитках, но плитка теперь нейтрально-серая (не зелёная) по
 *   умолчанию, зеленеет только на hover/active — тот же паттерн,
 *   что уже используется в sidebar.js (.sb-link-ico);
 * — добавлена отдельная кнопка-колокольчик для уведомлений в правой
 *   части капсулы — то же значение бейджа, что и в выпадающем меню
 *   профиля (общий data-badge-key, обновляются синхронно);
 * — логотип — inline SVG-вордмарк antviz (currentColor), просто
 *   наследует --nv-ink и тем самым остаётся тёмным на светлой капсуле
 *   без отдельного файла под тему;
 * — мобильное выезжающее меню тоже светлое, тот же паттерн иконок;
 * — уважение reduced-motion и видимый focus-visible сохранены.
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

  // Логотип-вордмарк antviz инлайн-SVG — капсула навигации всегда тёмная
  // (--nv-bg), поэтому логотип просто белый через currentColor (наследует
  // цвет от .nv-logo{ color:var(--nv-ink) }), без переключения по теме.
  const LOGO_SVG = `<svg class="nv-logo-mark" viewBox="0 0 1692 484" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true"><g transform="translate(0,484) scale(0.1,-0.1)" fill="currentColor"><path d="M13107 4247 c-49 -14 -128 -91 -161 -155 -54 -106 -25 -237 70 -321 92 -81 177 -99 275 -60 164 64 227 226 151 391 -16 35 -40 73 -53 85 -62 56 -197 85 -282 60z"/><path d="M7857 3914 c-4 -4 -7 -505 -7 -1113 0 -1051 1 -1111 19 -1196 20 -93 63 -209 99 -267 11 -18 34 -55 51 -83 112 -186 306 -327 536 -391 l100 -28 444 -4 c277 -2 447 0 453 6 14 14 12 411 -3 428 -9 11 -76 14 -361 14 -322 0 -356 2 -439 21 -154 37 -281 131 -344 254 -77 152 -78 161 -82 788 -3 419 -1 562 8 573 9 12 81 14 430 14 247 0 428 4 443 10 l26 10 0 213 c0 152 -3 216 -12 225 -9 9 -121 12 -444 12 -335 0 -435 3 -441 13 -4 6 -10 122 -13 257 l-5 245 -226 3 c-124 1 -228 -1 -232 -4z"/><path d="M2090 3388 c-19 -5 -63 -15 -97 -22 -34 -7 -119 -42 -190 -76 -115 -57 -137 -73 -223 -156 -90 -88 -105 -109 -164 -234 -11 -25 -27 -52 -33 -61 -7 -8 -20 -38 -29 -65 -54 -169 -64 -279 -64 -696 0 -277 4 -379 15 -450 15 -85 60 -232 85 -275 5 -10 15 -29 20 -43 17 -40 58 -104 105 -164 44 -56 195 -172 283 -217 84 -43 175 -73 266 -89 65 -11 1114 -12 1276 -1 90 6 95 7 98 30 2 13 -6 36 -17 52 -12 15 -21 31 -21 35 0 4 -15 30 -34 58 -18 28 -57 96 -85 151 -29 55 -58 103 -64 107 -7 4 -226 8 -487 8 -439 0 -481 2 -548 20 -168 44 -316 187 -347 332 -4 18 -11 38 -15 43 -17 23 -21 105 -21 443 1 330 3 363 22 432 24 85 39 121 73 168 69 94 122 135 231 179 l70 28 680 0 680 0 5 -1045 c3 -575 6 -1046 8 -1047 1 -2 105 -3 231 -3 195 0 232 2 245 16 14 14 16 143 16 1273 0 964 -3 1260 -12 1269 -15 15 -1903 15 -1958 0z"/><path d="M5310 3390 c-132 -28 -199 -55 -328 -133 -84 -51 -163 -129 -245 -243 -74 -103 -121 -256 -143 -469 -21 -193 -17 -1681 4 -1702 19 -19 445 -19 460 0 8 9 12 275 15 847 3 763 5 840 21 895 35 119 130 236 230 285 124 61 137 62 679 58 l492 -4 63 -28 c124 -54 198 -122 258 -239 47 -89 47 -94 51 -971 2 -582 7 -834 14 -843 16 -18 449 -19 467 -1 9 9 12 208 12 833 0 857 2 815 -40 1021 -28 134 -93 272 -181 383 -80 99 -162 166 -269 217 -41 20 -84 41 -95 47 -11 6 -36 14 -55 18 -19 3 -62 14 -95 23 -52 14 -136 16 -670 15 -335 -1 -626 -5 -645 -9z"/><path d="M9603 3385 c-6 -18 15 -68 106 -245 133 -260 538 -1068 567 -1130 16 -36 61 -126 98 -200 38 -74 77 -153 87 -175 10 -22 60 -128 112 -235 53 -107 127 -262 166 -345 39 -82 79 -166 88 -185 l18 -35 229 -3 c198 -2 231 0 247 14 17 15 67 112 184 359 31 66 61 127 66 135 5 8 18 33 28 55 10 22 42 90 70 150 28 61 56 119 63 130 27 46 148 294 148 303 0 5 25 56 55 113 31 57 69 133 86 169 27 58 140 289 272 555 25 50 68 135 96 190 134 264 181 369 170 382 -9 10 -67 13 -263 13 -138 0 -256 -4 -262 -8 -18 -12 -194 -360 -194 -384 0 -7 -13 -38 -29 -68 -91 -177 -127 -252 -191 -391 -40 -84 -96 -210 -127 -279 -30 -69 -58 -133 -63 -142 -39 -71 -149 -298 -155 -318 -9 -32 -122 -264 -152 -312 -13 -21 -30 -38 -37 -38 -13 0 -124 214 -216 415 -17 39 -71 151 -120 250 -193 395 -241 495 -298 620 -33 72 -71 150 -86 175 -14 25 -30 55 -35 67 -6 12 -33 70 -62 130 -28 59 -69 145 -90 189 -21 45 -46 85 -55 88 -8 3 -128 6 -265 6 -215 0 -250 -2 -256 -15z"/><path d="M12966 3384 c-14 -14 -16 -142 -16 -1265 0 -843 3 -1257 10 -1270 10 -18 23 -19 233 -19 160 0 226 3 235 12 9 9 12 306 12 1275 0 1238 0 1262 -19 1273 -12 6 -104 10 -230 10 -177 0 -212 -2 -225 -16z"/><path d="M14043 3393 c-16 -6 -18 -419 -3 -443 8 -13 101 -16 702 -20 671 -5 693 -6 696 -24 2 -10 -3 -23 -11 -27 -8 -5 -41 -41 -73 -81 -33 -40 -111 -136 -174 -213 -133 -161 -205 -251 -308 -379 -41 -50 -90 -109 -110 -131 -21 -22 -64 -74 -97 -116 -111 -142 -189 -240 -295 -366 -58 -69 -129 -157 -158 -195 -29 -38 -82 -106 -117 -151 -35 -45 -82 -105 -105 -134 l-40 -52 0 -109 c0 -91 3 -111 16 -116 9 -3 536 -6 1173 -6 887 0 1160 3 1169 12 17 17 17 409 0 426 -9 9 -199 12 -795 12 -657 0 -783 2 -783 14 0 7 24 41 53 74 146 169 252 295 309 369 110 142 220 276 269 328 26 28 67 75 91 106 57 75 272 330 337 399 28 30 51 58 51 61 0 10 257 321 322 390 13 14 52 59 85 100 l61 75 0 87 c1 65 -3 90 -14 102 -14 13 -141 15 -1127 14 -612 0 -1118 -3 -1124 -6z"/></g></svg>`;

  /* ─────────────── CSS ─────────────── */
  const CSS = `
    :root {
      --nv-bg:        #ffffff;
      --nv-bg-soft:   rgba(255,255,255,.92);
      --nv-surface:   #ffffff;
      --nv-surface2:  #f2f4f7;
      --nv-line:      rgba(20,22,26,.09);
      --nv-line-soft: rgba(20,22,26,.06);
      --nv-ink:       #14161a;
      --nv-ink-dim:   rgba(20,22,26,.52);
      --nv-ink-faint: rgba(20,22,26,.34);
      --nv-green:     #1ede7b;
      --nv-green-h:   #17c76a;
      --nv-green-ink: #0e1512;
      --nv-green-dim: rgba(30,222,123,.12);
      --nv-warn:      #f5a623;
      --nv-danger:    #ff6b54;
      --nv-sh:        0 22px 46px rgba(15,23,42,.10), 0 4px 14px rgba(15,23,42,.05);
      --nv-font:      'Geologica','Inter','Arial',sans-serif;
      --nv-ease:      cubic-bezier(.16,1,.3,1);
    }

    .antviz-nav, .antviz-nav * { box-sizing: border-box; }

    /* ── Капсула ──
       Белая плавающая панель, тот же язык, что у карточек кабинета
       (.sb-nav/.sb-content): тонкая светлая обводка + мягкая нейтральная
       тень, без тёмного острова и без зелёного свечения — зелёный
       остаётся только акцентом состояния (активный пункт, CTA, бейджи). */
    .antviz-nav {
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      z-index: 9000;
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px;
      padding: 8px 8px 8px 24px;
      height: 72px;
      width: calc(100% - 32px); max-width: 1120px;
      background: var(--nv-bg);
      border: 1px solid var(--nv-line);
      border-radius: 40px;
      box-shadow: var(--nv-sh);
      font-family: var(--nv-font);
      transition: border-color .2s var(--nv-ease), box-shadow .2s var(--nv-ease);
    }
    .antviz-nav:hover { border-color: rgba(30,222,123,.28); }

    .nv-logo {
      font-family: var(--nv-font); font-weight: 500;
      font-size: 17px; letter-spacing: -.03em;
      color: var(--nv-ink); text-decoration: none;
      display: flex; align-items: center; gap: 10px; flex-shrink: 0;
    }
    /* Вордмарк — просто currentColor от .nv-logo (тёмный на белой
       капсуле), тема капсулы не переключается, поэтому один цвет. */
    .nv-logo-mark { height: 29px; width: auto; flex-shrink: 0; display: block; }

    /* ── Центр: текстовые ссылки с простой линейной иконкой перед
       подписью — без фоновой плашки, минимализм из референса.
       Активный пункт красится в зелёный + получает подчёркивание. ── */
    .nv-center {
      position: absolute; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 30px;
    }
    .nv-link {
      color: var(--nv-ink-dim);
      font-family: var(--nv-font); font-weight: 400; font-size: 15px;
      text-decoration: none;
      white-space: nowrap; position: relative;
      display: flex; align-items: center; gap: 7px;
      transition: color .15s var(--nv-ease);
    }
    .nv-link:hover { color: var(--nv-ink); }
    .nv-link.active { color: var(--nv-green); font-weight: 500; }
    .nv-link.active::after {
      content: ''; position: absolute; left: 0; right: 0; bottom: -15px;
      height: 3px; border-radius: 2px; background: var(--nv-green);
    }

    /* Основной CTA — единственный контрастный элемент капсулы. */
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
      font-family: var(--nv-font); font-weight: 400; font-size: 15px;
      background: none; border: none; cursor: pointer;
      padding: 0; display: flex; align-items: center; gap: 7px;
      white-space: nowrap;
      transition: color .15s var(--nv-ease);
    }
    .nv-drop-btn:hover { color: var(--nv-ink); }
    .nv-drop-btn.is-active { color: var(--nv-green); font-weight: 500; }
    .nv-chev {
      width: 9px; height: 9px; opacity: .5; flex-shrink: 0;
      transition: transform .22s var(--nv-ease), opacity .15s;
    }
    .nv-drop.open .nv-chev { transform: rotate(180deg); opacity: .9; }

    /* Простая линейная иконка перед подписью верхнего пункта — без
       фоновой плитки, толщина 1.6, цвет = currentColor родителя, поэтому
       сама следует за hover/active состоянием ссылки/кнопки. */
    .nv-link-ico, .nv-drop-btn svg.nv-link-ico {
      width: 17px; height: 17px; flex-shrink: 0;
      stroke: currentColor; stroke-width: 1.6; fill: none;
      stroke-linecap: round; stroke-linejoin: round;
    }

    /* Наведение вместо клика — только для этого конкретного дропдауна
       (Блог) и только на устройствах с настоящим курсором, чтобы не
       ловить залипший hover на тачскринах. Невидимый ::before мостиком
       перекрывает зазор до меню — иначе курсор "теряет" элемент на
       полпути и меню дёргано закрывается. */
    .nv-drop::before {
      content: ''; position: absolute; top: 100%; left: 50%;
      transform: translateX(-50%); width: 100%; height: 12px;
    }
    @media (hover: hover) and (pointer: fine) {
      .nv-drop:hover .nv-menu {
        opacity: 1; visibility: visible; pointer-events: all;
        transform: translate(-50%, 0) scale(1);
        transition: opacity .15s var(--nv-ease), transform .15s var(--nv-ease), visibility 0s;
      }
      .nv-drop:hover .nv-chev { transform: rotate(180deg); opacity: .9; }
    }

    .nv-menu {
      position: absolute; top: calc(100% + 12px); left: 50%;
      background: var(--nv-surface);
      border: 1px solid var(--nv-line);
      border-radius: 24px; padding: 10px;
      min-width: 244px;
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
      padding: 8px 10px; border-radius: 12px;
      font-size: 13.5px; color: var(--nv-ink); font-weight: 400;
      text-decoration: none; transition: background .12s, color .12s;
      white-space: nowrap;
    }
    .nv-menu-item:hover { background: var(--nv-surface2); }
    .nv-menu-item:hover .nv-ico { color: var(--nv-green-ink); border-color: transparent; background: var(--nv-green); box-shadow: 0 8px 18px -8px rgba(30,222,123,.45); }
    .nv-menu-sep { height: 1px; background: var(--nv-line-soft); margin: 6px 8px; }

    /* ── Плитка-иконка внутри выпадающих меню/профиля: нейтрально-серая
       по умолчанию, зеленеет только на hover/active — тот же паттерн,
       что и .sb-link-ico в sidebar.js, для единого языка по кабинету. ── */
    .nv-ico {
      width: 34px; height: 34px; flex-shrink: 0; border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
      color: var(--nv-ink-dim);
      background: var(--nv-surface2);
      border: 1px solid transparent;
      transition: color .15s, border-color .15s, background .15s, box-shadow .15s;
    }
    .nv-ico svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }

    .nv-right { display: flex; align-items: center; gap: 8px; margin-left: auto; }

    /* ── Пользователь ── */
    .nv-user { position: relative; display: flex; }
    .nv-user-btn {
      display: flex; align-items: center; gap: 9px;
      background: var(--nv-surface2); border: 1px solid transparent;
      border-radius: 14px; padding: 4px 12px 4px 4px;
      cursor: pointer; transition: border-color .15s, background .15s;
      font-family: var(--nv-font); font-weight: 400; font-size: 13.5px; color: var(--nv-ink);
      text-decoration: none; position: relative;
    }
    .nv-user-btn:hover { background: #fff; border-color: var(--nv-line); box-shadow: 0 6px 14px -8px rgba(20,22,26,.18); }
    .nv-user-btn.guest {
      padding: 8px 16px; border: none; background: var(--nv-surface2);
      font-weight: 400; font-size: 14.5px; color: var(--nv-ink-dim);
    }
    .nv-user-btn.guest:hover { border-color: transparent; background: #fff; color: var(--nv-ink); box-shadow: 0 6px 14px -8px rgba(20,22,26,.18); }
    .nv-user-btn.guest .nv-avatar-wrap,
    .nv-user-btn.guest .nv-chev-user { display: none; }

    /* Точка-бейдж поверх аватара для индикации непрочитанного — тот же
       паттерн, что и .nv-badge.dot внутри выпадающего меню. */
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
    .nv-chev-user { width: 10px; height: 10px; opacity: .45; flex-shrink: 0; transition: transform .2s var(--nv-ease); }
    .nv-user-btn[aria-expanded="true"] .nv-chev-user { transform: rotate(180deg); }

    .nv-dd {
      position: absolute; top: calc(100% + 12px); right: 0;
      background: var(--nv-surface);
      border: 1px solid var(--nv-line);
      border-radius: 24px; padding: 10px;
      min-width: 264px;
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
      display: flex; align-items: center; gap: 13px;
      padding: 12px 10px 16px; margin-bottom: 6px;
      border-bottom: 1px solid var(--nv-line-soft);
    }
    .nv-dd-head-avatar {
      width: 46px; height: 46px; border-radius: 14px;
      background: var(--nv-green);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 500; color: var(--nv-green-ink);
      flex-shrink: 0; overflow: hidden;
      box-shadow: 0 10px 22px -10px rgba(30,222,123,.45);
    }
    .nv-dd-head-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .nv-dd-head-info { min-width: 0; flex: 1; }
    .nv-dd-head-name {
      font-size: 15px; font-weight: 500; color: var(--nv-ink);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: -.03em;
    }
    .nv-dd-head-email {
      font-weight: 400; font-size: 11.5px; color: var(--nv-ink-faint);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 3px;
    }

    .nv-dd-section {
      padding: 12px 11px 5px;
      font-size: 10.5px; color: var(--nv-ink-faint); font-weight: 500;
      text-transform: uppercase; letter-spacing: .08em;
    }
    .nv-dd-item {
      display: flex; align-items: center; gap: 11px;
      padding: 8px 10px; border-radius: 12px;
      font-size: 13.5px; color: var(--nv-ink); font-weight: 400;
      text-decoration: none; cursor: pointer;
      transition: background .12s, color .12s;
      border: none; background: none; width: 100%; text-align: left;
      position: relative; font-family: var(--nv-font);
    }
    .nv-dd-item:hover { background: var(--nv-surface2); }
    .nv-dd-item:hover .nv-ico { color: var(--nv-green-ink); border-color: transparent; background: var(--nv-green); box-shadow: 0 8px 18px -8px rgba(30,222,123,.45); }
    .nv-dd-item.danger .nv-ico { color: var(--nv-danger); background: rgba(255,107,84,.1); border-color: rgba(255,107,84,.16); }
    .nv-dd-item.danger:hover { background: rgba(255,107,84,.08); color: #d9432e; }
    .nv-dd-item.danger:hover .nv-ico { color: #fff; border-color: transparent; background: var(--nv-danger); box-shadow: 0 8px 18px -8px rgba(255,107,84,.45); }
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
      background: var(--nv-surface2); border: 1px solid transparent;
      border-radius: 12px; cursor: pointer; flex-shrink: 0;
      transition: border-color .15s, background .15s;
    }
    .nv-burger:hover { background: #fff; border-color: var(--nv-line); }
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

    /* ── Выезжающее мобильное меню — светлое, тот же язык, что и
       остальная капсула, а не отдельный тёмный остров. ── */
    .nv-sheet {
      position: fixed; top: calc(20px + 72px + 10px); left: 50%;
      transform: translateX(-50%) translateY(-8px) scale(.98);
      z-index: 8999;
      width: calc(100% - 32px); max-width: 1080px;
      max-height: calc(100vh - 20px - 72px - 34px);
      overflow-y: auto;
      background: var(--nv-bg);
      border: 1px solid var(--nv-line);
      border-radius: 24px;
      padding: 8px;
      display: none; flex-direction: column; gap: 2px;
      opacity: 0; visibility: hidden; pointer-events: none;
      transition: opacity .2s var(--nv-ease), transform .2s var(--nv-ease), visibility 0s linear .2s;
      font-family: var(--nv-font);
      box-shadow: var(--nv-sh);
    }
    .nv-sheet.open {
      opacity: 1; visibility: visible; pointer-events: all;
      transform: translateX(-50%) translateY(0) scale(1);
      transition: opacity .2s var(--nv-ease), transform .2s var(--nv-ease), visibility 0s;
    }
    .nv-mlink {
      display: flex; align-items: center; gap: 12px;
      color: var(--nv-ink-dim); font-weight: 400; font-size: 15px;
      text-decoration: none; padding: 13px 14px;
      border-radius: 14px; transition: background .12s, color .12s;
    }
    .nv-mlink:hover { color: var(--nv-ink); background: var(--nv-surface2); }
    .nv-mlink.active { color: var(--nv-green); font-weight: 500; background: var(--nv-green-dim); }
    .nv-mlink.active .nv-ico { color: var(--nv-green-ink); background: var(--nv-green); }
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
      .nv-logo-mark { height: 24px; }
      .nv-center { display: none; }
      .nv-cta { display: none; }
      .nv-burger { display: flex; }
      .nv-sheet { display: flex; top: calc(14px + 60px + 8px); }
      .nv-uname { display: none; }
      .nv-user-btn { padding: 4px; background: none; }
      .nv-user-btn.guest { padding: 6px 8px; font-size: 14px; }
      .nv-user-btn.guest .nv-uname { display: inline; max-width: 60px; }
    }
  `;

  const PUBLIC_LINKS = [
    { href: b+'order', label: 'Сделать заказ', key: 'order', accent: true },
  ];

  // Единая иконка-контейнер: <rect/> квадрат-скругление + один простой
  // глиф внутри, толщина линии всегда 1.7 — см. .nv-ico (иконки внутри
  // выпадающих меню). Поле icon верхнего уровня — плоская линейная
  // иконка перед подписью в самой капсуле, см. .nv-link-ico.
  const NAV_DROPDOWNS = [
    {
      label: 'Услуги',
      key: 'services',
      icon: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.8"/>',
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
      icon: '<circle cx="12" cy="12" r="8.5"/><path d="M12 8h.01M11 11.5h1.4v5"/>',
      sections: [
        {
          items: [
            { href: 'https://antviz.ru/about', label: 'О сервисе',         icon: '<circle cx="12" cy="12" r="8.5"/><path d="M12 8h.01M11 11.5h1.4v5"/>' },
            { href: 'https://antviz.ru/price',  label: 'Цены',             icon: '<path d="M12.5 3.5H19a1 1 0 011 1v6.5a1 1 0 01-.3.7l-8 8a1 1 0 01-1.4 0l-7.2-7.2a1 1 0 010-1.4l8-8a1 1 0 01.4-.3z"/><circle cx="15.6" cy="7.9" r="1.4"/>' },
          ]
        }
      ]
    },
    {
      label: 'Блог',
      key: 'blog',
      icon: '<path d="M4 5.5A2.5 2.5 0 016.5 3H18a1 1 0 011 1v15a1 1 0 01-1 1H6.5A2.5 2.5 0 014 17.5v-12z"/><path d="M8 8h8M8 11.5h8M8 15h5"/>',
      sections: [
        {
          items: [
            { href: 'https://blog.antviz.ru/',         label: 'Блог',        icon: '<path d="M4 5.5A2.5 2.5 0 016.5 3H18a1 1 0 011 1v15a1 1 0 01-1 1H6.5A2.5 2.5 0 014 17.5v-12z"/><path d="M8 8h8M8 11.5h8M8 15h5"/>' },
            { href: 'https://blog.antviz.ru/updates',  label: 'Что нового', icon: '<path d="M12 3.2l1.7 4.6 4.6 1.7-4.6 1.7L12 15.8l-1.7-4.6-4.6-1.7 4.6-1.7L12 3.2z"/><path d="M18.5 15.5l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z"/>' },
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
    { href: b+'profile/sites',         icon: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.8 2.8 2.8 14.2 0 17M12 3.5c-2.8 2.8-2.8 14.2 0 17"/>', label: 'Мои проекты' },
    { href: b+'profile/tickets',       icon: '<path d="M14.5 6.2a3.6 3.6 0 00-4.9 4.66l-5.6 5.6a1.9 1.9 0 002.7 2.7l5.6-5.6a3.6 3.6 0 004.66-4.9l-2.53 2.53-2-2z"/>', label: 'Обслуживание', badgeKey: 'tickets' },
    { href: b+'profile/support',       icon: '<path d="M20.5 11.5a8.5 8.5 0 01-12.4 7.55L4 20l1.02-3.9a8.5 8.4 0 1115.48-4.6z"/>', label: 'Поддержка', badgeKey: 'support' },
    { href: b+'profile/notifications', icon: '<path d="M6.5 9.2a5.5 5.5 0 0111 0c0 6 2 7.3 2 7.3H4.5s2-1.3 2-7.3z"/><path d="M10.2 20.5a2 2 0 003.6 0"/>', label: 'Уведомления', badgeKey: 'notif' },
    { sep: true },
    { href: b+'profile/settings',      icon: '<circle cx="12" cy="12" r="2.7"/><path d="M19.1 14.6a1.5 1.5 0 00.3 1.65l.05.06a1.75 1.75 0 11-2.48 2.48l-.06-.05a1.5 1.5 0 00-1.65-.3 1.5 1.5 0 00-.9 1.37V20a1.75 1.75 0 01-3.5 0v-.08a1.5 1.5 0 00-.9-1.38 1.5 1.5 0 00-1.65.3l-.06.06a1.75 1.75 0 11-2.48-2.48l.05-.06a1.5 1.5 0 00.3-1.65 1.5 1.5 0 00-1.37-.9H4a1.75 1.75 0 010-3.5h.08a1.5 1.5 0 001.38-.9 1.5 1.5 0 00-.3-1.65l-.05-.06A1.75 1.75 0 117.59 5.3l.06.05a1.5 1.5 0 001.65.3H9.4a1.5 1.5 0 00.9-1.37V4a1.75 1.75 0 013.5 0v.08a1.5 1.5 0 00.9 1.38 1.5 1.5 0 001.65-.3l.06-.06a1.75 1.75 0 112.48 2.48l-.05.06a1.5 1.5 0 00-.3 1.65V9.4a1.5 1.5 0 001.37.9H20a1.75 1.75 0 010 3.5h-.08a1.5 1.5 0 00-1.38.9z"/>', label: 'Настройки' },
    { logout: true },
  ];

  function iconHtml(svg) { return `<span class="nv-ico"><svg viewBox="0 0 24 24">${svg}</svg></span>`; }
  // Плоская линейная иконка перед подписью верхнеуровневого пункта
  // капсулы/мобильного заголовка секции — без фоновой плитки.
  function plainIconHtml(svg) { return `<svg class="nv-link-ico" viewBox="0 0 24 24">${svg}</svg>`; }

  function buildDD() {
    return DD_ITEMS.map(item => {
      if (item.section) return `<div class="nv-dd-section">${item.section}</div>`;
      if (item.sep)     return `<div class="nv-dd-sep"></div>`;
      if (item.logout)  return `<button class="nv-dd-item danger" id="anSignOut">${iconHtml('<path d="M9 4H6.5A2.5 2.5 0 004 6.5v11A2.5 2.5 0 006.5 20H9"/><path d="M20 12H10.5"/><path d="M16 8l4 4-4 4"/>')}Выйти</button>`;
      const badgeSlot = item.badgeKey ? `<span class="nv-badge" data-badge-key="${item.badgeKey}" style="display:none"></span>` : '';
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
        plainIconHtml(drop.icon) + '<span>' + drop.label + '</span>' + chevronSvg +
        '</button>' +
        '<div class="nv-menu" id="anDrop-' + drop.key + '">' +
        buildNavMenu(drop.sections) +
        '</div></div>';
    }).join('');

    const plainLinks = links.map(l =>
      '<a href="' + l.href + '" class="nv-link' + (page === l.key ? ' active' : '') + '">' +
      (l.icon ? plainIconHtml(l.icon) : '') + '<span>' + l.label + '</span></a>'
    ).join('');

    if (!dropdowns && !plainLinks) return '';
    return '<div class="nv-center" id="anCenter">' + dropdowns + plainLinks + '</div>';
  }

  // Единственный контрастный элемент капсулы — по образцу референса
  // (сплошная зелёная пилюля справа на светлой панели). Рендерится
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
      html += '<a href="' + l.href + '" class="nv-mlink' + (page === l.key ? ' active' : '') + '">' + (l.icon ? iconHtml(l.icon) : '') + l.label + '</a>';
    });

    const ctaHtml = (!cfg.hideCta) ? '<a href="' + b + 'order" class="nv-mcta">Заказать сайт</a>' : '';
    if (!html && !ctaHtml) return '';
    return '<div class="nv-sheet" id="anMobileSheet">' + html + ctaHtml + '</div>';
  }

  const NAV_HTML = `
<nav class="antviz-nav" id="antvizNav">
  <a class="nv-logo" href="${b || '/'}" aria-label="Antviz">
    ${LOGO_SVG}
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
  bodyPad.textContent = 'body { padding-top: 16px; } @media(max-width:768px){ body { padding-top: 14px; } }';
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

  // Бейдж может встречаться в нескольких местах капсулы —
  // обновляем все совпадения по data-badge-key, у каждого элемента
  // своя базовая CSS-класс-плитка (nv-badge внутри dd/меню),
  // поэтому базовый класс берём из текущего className элемента.
  function setBadge(key, value, variant) {
    document.querySelectorAll(`[data-badge-key="${key}"]`).forEach(el => {
      if (!value) { el.style.display = 'none'; return; }
      el.className = 'nv-badge' + (variant && variant !== 'dot' ? ' ' + variant : '');
      el.textContent = (variant === 'dot') ? '' : String(value);
      el.style.display = 'flex';
    });
  }
  function refreshNotifyDot() {
    const dot = document.getElementById('anAvatarDot');
    const any = ['support','tickets','notif'].some(k => {
      const el = document.querySelector(`.nv-badge[data-badge-key="${k}"]`);
      return el && el.style.display !== 'none';
    });
    dot?.classList.toggle('show', any);
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
