/**
 * antviz-nav.js
 * <script src="antviz-nav.js"></script>
 *
 * Светлая blur-капсула (как в мокапе vantage-mockup-3): сам генерирует
 * CSS и HTML (логотип, дропдауны, блок пользователя, мобильное меню,
 * CTA) и вставляет их в начало <body> — та же архитектура, что у
 * основного nav.js.
 *
 * Логика авторизации — как в оригинальном nav.js: при загрузке страницы
 * идёт запрос GET {API}/auth/me с credentials:'include' (проверка
 * cookie-сессии). Если пользователь залогинен — показывается его
 * аватар/имя с выпадающим меню (заказы, выйти); если нет — показывается
 * ссылка «Войти». Бейджей/уведомлений/Firestore здесь нет — этого не
 * просили, оставлена только сама логика "залогинен / не залогинен".
 */
(function () {
  'use strict';

  const API = '/api';

  /* ─────────────── логотип-вордмарк antviz (inline SVG, currentColor) ─────────────── */
  const LOGO_SVG = `<svg class="an-logo-mark" viewBox="0 0 1692 484" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true"><g transform="translate(0,484) scale(0.1,-0.1)" fill="currentColor"><path d="M13107 4247 c-49 -14 -128 -91 -161 -155 -54 -106 -25 -237 70 -321 92 -81 177 -99 275 -60 164 64 227 226 151 391 -16 35 -40 73 -53 85 -62 56 -197 85 -282 60z"/><path d="M7857 3914 c-4 -4 -7 -505 -7 -1113 0 -1051 1 -1111 19 -1196 20 -93 63 -209 99 -267 11 -18 34 -55 51 -83 112 -186 306 -327 536 -391 l100 -28 444 -4 c277 -2 447 0 453 6 14 14 12 411 -3 428 -9 11 -76 14 -361 14 -322 0 -356 2 -439 21 -154 37 -281 131 -344 254 -77 152 -78 161 -82 788 -3 419 -1 562 8 573 9 12 81 14 430 14 247 0 428 4 443 10 l26 10 0 213 c0 152 -3 216 -12 225 -9 9 -121 12 -444 12 -335 0 -435 3 -441 13 -4 6 -10 122 -13 257 l-5 245 -226 3 c-124 1 -228 -1 -232 -4z"/><path d="M2090 3388 c-19 -5 -63 -15 -97 -22 -34 -7 -119 -42 -190 -76 -115 -57 -137 -73 -223 -156 -90 -88 -105 -109 -164 -234 -11 -25 -27 -52 -33 -61 -7 -8 -20 -38 -29 -65 -54 -169 -64 -279 -64 -696 0 -277 4 -379 15 -450 15 -85 60 -232 85 -275 5 -10 15 -29 20 -43 17 -40 58 -104 105 -164 44 -56 195 -172 283 -217 84 -43 175 -73 266 -89 65 -11 1114 -12 1276 -1 90 6 95 7 98 30 2 13 -6 36 -17 52 -12 15 -21 31 -21 35 0 4 -15 30 -34 58 -18 28 -57 96 -85 151 -29 55 -58 103 -64 107 -7 4 -226 8 -487 8 -439 0 -481 2 -548 20 -168 44 -316 187 -347 332 -4 18 -11 38 -15 43 -17 23 -21 105 -21 443 1 330 3 363 22 432 24 85 39 121 73 168 69 94 122 135 231 179 l70 28 680 0 680 0 5 -1045 c3 -575 6 -1046 8 -1047 1 -2 105 -3 231 -3 195 0 232 2 245 16 14 14 16 143 16 1273 0 964 -3 1260 -12 1269 -15 15 -1903 15 -1958 0z"/><path d="M5310 3390 c-132 -28 -199 -55 -328 -133 -84 -51 -163 -129 -245 -243 -74 -103 -121 -256 -143 -469 -21 -193 -17 -1681 4 -1702 19 -19 445 -19 460 0 8 9 12 275 15 847 3 763 5 840 21 895 35 119 130 236 230 285 124 61 137 62 679 58 l492 -4 63 -28 c124 -54 198 -122 258 -239 47 -89 47 -94 51 -971 2 -582 7 -834 14 -843 16 -18 449 -19 467 -1 9 9 12 208 12 833 0 857 2 815 -40 1021 -28 134 -93 272 -181 383 -80 99 -162 166 -269 217 -41 20 -84 41 -95 47 -11 6 -36 14 -55 18 -19 3 -62 14 -95 23 -52 14 -136 16 -670 15 -335 -1 -626 -5 -645 -9z"/><path d="M9603 3385 c-6 -18 15 -68 106 -245 133 -260 538 -1068 567 -1130 16 -36 61 -126 98 -200 38 -74 77 -153 87 -175 10 -22 60 -128 112 -235 53 -107 127 -262 166 -345 39 -82 79 -166 88 -185 l18 -35 229 -3 c198 -2 231 0 247 14 17 15 67 112 184 359 31 66 61 127 66 135 5 8 18 33 28 55 10 22 42 90 70 150 28 61 56 119 63 130 27 46 148 294 148 303 0 5 25 56 55 113 31 57 69 133 86 169 27 58 140 289 272 555 25 50 68 135 96 190 134 264 181 369 170 382 -9 10 -67 13 -263 13 -138 0 -256 -4 -262 -8 -18 -12 -194 -360 -194 -384 0 -7 -13 -38 -29 -68 -91 -177 -127 -252 -191 -391 -40 -84 -96 -210 -127 -279 -30 -69 -58 -133 -63 -142 -39 -71 -149 -298 -155 -318 -9 -32 -122 -264 -152 -312 -13 -21 -30 -38 -37 -38 -13 0 -124 214 -216 415 -17 39 -71 151 -120 250 -193 395 -241 495 -298 620 -33 72 -71 150 -86 175 -14 25 -30 55 -35 67 -6 12 -33 70 -62 130 -28 59 -69 145 -90 189 -21 45 -46 85 -55 88 -8 3 -128 6 -265 6 -215 0 -250 -2 -256 -15z"/><path d="M12966 3384 c-14 -14 -16 -142 -16 -1265 0 -843 3 -1257 10 -1270 10 -18 23 -19 233 -19 160 0 226 3 235 12 9 9 12 306 12 1275 0 1238 0 1262 -19 1273 -12 6 -104 10 -230 10 -177 0 -212 -2 -225 -16z"/><path d="M14043 3393 c-16 -6 -18 -419 -3 -443 8 -13 101 -16 702 -20 671 -5 693 -6 696 -24 2 -10 -3 -23 -11 -27 -8 -5 -41 -41 -73 -81 -33 -40 -111 -136 -174 -213 -133 -161 -205 -251 -308 -379 -41 -50 -90 -109 -110 -131 -21 -22 -64 -74 -97 -116 -111 -142 -189 -240 -295 -366 -58 -69 -129 -157 -158 -195 -29 -38 -82 -106 -117 -151 -35 -45 -82 -105 -105 -134 l-40 -52 0 -109 c0 -91 3 -111 16 -116 9 -3 536 -6 1173 -6 887 0 1160 3 1169 12 17 17 17 409 0 426 -9 9 -199 12 -795 12 -657 0 -783 2 -783 14 0 7 24 41 53 74 146 169 252 295 309 369 110 142 220 276 269 328 26 28 67 75 91 106 57 75 272 330 337 399 28 30 51 58 51 61 0 10 257 321 322 390 13 14 52 59 85 100 l61 75 0 87 c1 65 -3 90 -14 102 -14 13 -141 15 -1127 14 -612 0 -1118 -3 -1124 -6z"/></g></svg>`;

  /* ─────────────── данные меню — ссылки/подписи ─────────────── */
  const NAV_DROPDOWNS = [
    {
      key: 'services',
      label: 'Услуги',
      items: [
        { href: '/project1', label: 'Лендинг' },
        { href: '/project2', label: 'Визитная карточка' },
        { href: '/project3', label: 'Портфолио' },
        { sep: true },
        { href: '/order', label: 'Все тарифы' },
      ],
    },
    {
      key: 'company',
      label: 'О сервисе',
      items: [
        { href: 'https://antviz.ru/about', label: 'О сервисе' },
        { href: 'https://antviz.ru/price', label: 'Цены' },
      ],
    },
    {
      key: 'blog',
      label: 'Блог',
      items: [
        { href: 'https://blog.antviz.ru/', label: 'Блог' },
        { href: 'https://blog.antviz.ru/updates', label: 'Что нового' },
      ],
    },
  ];

  const CTA = { href: '/order', label: 'Сделать заказ' };

  /* ─────────────── CSS ─────────────── */
  const CSS = `
    :root{
      --an-bg-card: #ececea;
      --an-ink: #121212;
      --an-ink-soft: #6b6b68;
      --an-line: rgba(18,18,18,0.09);
      --an-pill: #121212;
      --an-pill-ink: #f4f4f2;
      --an-radius-pill: 999px;
      --an-maxw: 1160px;
    }

    .an-nav-wrap, .an-nav-wrap *{ box-sizing:border-box; }

    .an-nav-wrap{
      position: sticky; top: 18px; z-index: 9000;
      display:flex; justify-content:center; padding: 0 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Helvetica, Arial, sans-serif;
    }

    .an-nav-shell{
      width:100%; max-width: var(--an-maxw);
      background: rgba(255,255,255,0.6);
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border: 1px solid rgba(255,255,255,0.7);
      border-radius: var(--an-radius-pill);
      box-shadow: 0 10px 34px rgba(18,18,18,0.07);
      overflow:hidden;
      transition: border-radius .6s cubic-bezier(0.65,0,0.35,1);
    }
    .an-nav-shell.open{ border-radius: 30px; }

    .an-nav-header{
      display:flex; align-items:center; justify-content:space-between;
      padding: 10px 12px 10px 22px; min-height:60px;
    }

    .an-logo{ height:42px; flex-shrink:0; display:flex; align-items:center; justify-content:center; text-decoration:none; color:var(--an-ink); }
    .an-logo-mark{ height:28px; width:auto; display:block; }

    .an-menu-btn{
      width:44px; height:44px; border-radius:50%; border:none; background:transparent;
      display:flex; align-items:center; justify-content:center; cursor:pointer; position:relative; flex-shrink:0;
    }
    .an-menu-btn span{
      position:absolute; width:20px; height:1.5px; background:var(--an-ink); border-radius:2px;
      transition: transform .55s cubic-bezier(0.65,0,0.35,1), opacity .4s ease, top .55s cubic-bezier(0.65,0,0.35,1);
    }
    .an-menu-btn span:nth-child(1){ top:16px; }
    .an-menu-btn span:nth-child(2){ top:22px; }
    .an-menu-btn span:nth-child(3){ top:28px; }
    .an-nav-shell.open .an-menu-btn span:nth-child(1){ top:22px; transform: rotate(45deg); }
    .an-nav-shell.open .an-menu-btn span:nth-child(2){ opacity:0; }
    .an-nav-shell.open .an-menu-btn span:nth-child(3){ top:22px; transform: rotate(-45deg); }

    /* ── мобильная выезжающая панель ── */
    .an-nav-mobile{
      max-height:0; opacity:0; overflow:hidden; padding: 0 22px;
      transition: max-height .65s cubic-bezier(0.65,0,0.35,1), opacity .5s ease .05s, padding .65s cubic-bezier(0.65,0,0.35,1);
    }
    .an-nav-mobile.open{ max-height:80vh; opacity:1; padding: 4px 22px 22px; overflow-y:auto; }
    .an-nav-mobile a, .an-nav-mobile button.an-mlink{
      display:block; width:100%; text-align:left; background:none; border:none; cursor:pointer;
      color:var(--an-ink); text-decoration:none; font-family:inherit;
      font-size:1.5rem; font-weight:700; letter-spacing:-0.01em;
      padding: 13px 2px; border-top:1px solid var(--an-line);
    }
    .an-nav-mobile > a:first-child, .an-nav-mobile > .an-mobile-section:first-child{ border-top:none; }
    .an-mobile-section{
      font-size:0.8rem; font-weight:600; text-transform:uppercase; letter-spacing:0.06em;
      color:var(--an-ink-soft); padding: 16px 2px 4px; border-top:none;
    }
    .an-nav-mobile a.an-sub{ font-size:1.1rem; font-weight:500; padding:10px 2px; border-top:none; }
    .an-nav-cta-mobile{
      margin-top:14px; text-align:center !important; background:var(--an-pill) !important; color:var(--an-pill-ink) !important;
      border-radius:var(--an-radius-pill); padding:16px !important; font-size:1.05rem !important; font-weight:600 !important; border-top:none !important;
    }
    .an-mobile-user{ display:flex; align-items:center; gap:12px; padding:6px 2px 18px; border-top:none; }
    .an-mobile-user .an-avatar{ width:44px; height:44px; font-size:15px; }
    .an-mobile-user-name{ font-size:1.05rem; font-weight:600; }
    .an-mobile-user-email{ font-size:0.85rem; color:var(--an-ink-soft); font-weight:400; }
    .an-mobile-signout{ font-size:1.1rem !important; font-weight:500 !important; color:#c23; }

    .an-nav-desktop{ display:none; }

    /* ── CTA справа: скрыта на мобильных чисто через CSS, без JS ── */
    #anNavCtaDesktop{ display:none; }

    .an-pill-btn{
      display:inline-block; background:var(--an-pill); color:var(--an-pill-ink); text-decoration:none;
      padding: 13px 24px; border-radius:var(--an-radius-pill); font-weight:600; font-size:1.02rem; border:none; cursor:pointer;
    }

    /* ── унификация высоты всех верхнеуровневых пунктов десктоп-меню,
       чтобы дропдауны (кнопка+SVG) и блок пользователя были строго на
       одной линии, а не "плавали" из-за разных UA-стилей button/a. ── */
    .an-nav-desktop > *{ height:24px; display:flex; align-items:center; }

    .an-drop{ position:relative; }
    .an-drop-btn{
      display:flex; align-items:center; gap:6px; height:100%; background:none; border:none; cursor:pointer;
      font-family:inherit; color:var(--an-ink); font-size:1rem; font-weight:500; opacity:0.75; padding:0; line-height:1;
      transition: opacity .2s ease;
    }
    .an-drop-btn:hover, .an-drop.open .an-drop-btn{ opacity:1; }
    .an-drop-chevron{ width:9px; height:9px; transition: transform .3s cubic-bezier(0.65,0,0.35,1); flex-shrink:0; }
    .an-drop.open .an-drop-chevron{ transform: rotate(180deg); }

    .an-drop-menu{
      position:absolute; top: calc(100% + 18px); left:50%; transform: translateX(-50%) translateY(-8px);
      min-width:220px; background: rgba(255,255,255,0.9);
      backdrop-filter: blur(20px) saturate(160%); -webkit-backdrop-filter: blur(20px) saturate(160%);
      border:1px solid rgba(255,255,255,0.7); border-radius:18px; box-shadow: 0 20px 44px rgba(18,18,18,0.14);
      padding:8px; opacity:0; visibility:hidden; pointer-events:none;
      transition: opacity .22s ease, transform .22s cubic-bezier(0.65,0,0.35,1), visibility .22s; z-index:50;
    }
    .an-drop.open .an-drop-menu{ opacity:1; visibility:visible; pointer-events:auto; transform: translateX(-50%) translateY(0); }
    .an-drop-menu a{
      display:block; color:var(--an-ink); text-decoration:none; font-size:0.96rem; font-weight:500;
      padding:11px 14px; border-radius:11px; white-space:nowrap; transition: background .15s ease;
    }
    .an-drop-menu a:hover{ background: var(--an-bg-card); }
    .an-drop-sep{ height:1px; background:var(--an-line); margin:6px 8px; }

    /* ── блок пользователя (Войти / профиль) — тот же высотный слот,
       что и у дропдаунов, просто выровнен по правому краю ── */
    .an-user{ position:relative; height:100%; display:flex; align-items:center; }
    .an-user-btn{
      display:flex; align-items:center; gap:8px; height:100%;
      color:var(--an-ink); text-decoration:none; font-family:inherit;
      font-size:1rem; font-weight:500; opacity:0.75; line-height:1;
      background:none; border:none; cursor:pointer; padding:0;
      transition: opacity .2s ease;
    }
    .an-user-btn:hover{ opacity:1; }
    .an-avatar{
      width:26px; height:26px; border-radius:50%; flex-shrink:0;
      background:var(--an-ink); color:var(--an-pill-ink);
      display:flex; align-items:center; justify-content:center;
      font-size:12px; font-weight:600; overflow:hidden;
    }
    .an-avatar img{ width:100%; height:100%; object-fit:cover; }
    .an-user-btn.guest .an-avatar{ display:none; }
    .an-uname{ max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .an-user-chevron{ width:9px; height:9px; flex-shrink:0; transition: transform .3s cubic-bezier(0.65,0,0.35,1); }
    .an-user.open .an-user-chevron{ transform: rotate(180deg); }
    .an-user-btn.guest .an-user-chevron{ display:none; }

    .an-user-dd{
      position:absolute; top: calc(100% + 18px); right:0; transform: translateY(-8px);
      min-width:240px; background: rgba(255,255,255,0.9);
      backdrop-filter: blur(20px) saturate(160%); -webkit-backdrop-filter: blur(20px) saturate(160%);
      border:1px solid rgba(255,255,255,0.7); border-radius:18px; box-shadow: 0 20px 44px rgba(18,18,18,0.14);
      padding:8px; opacity:0; visibility:hidden; pointer-events:none;
      transition: opacity .22s ease, transform .22s cubic-bezier(0.65,0,0.35,1), visibility .22s; z-index:50;
    }
    .an-user.open .an-user-dd{ opacity:1; visibility:visible; pointer-events:auto; transform: translateY(0); }
    .an-dd-head{ padding:8px 10px 10px; border-bottom:1px solid var(--an-line); margin-bottom:6px; }
    .an-dd-head-name{ font-size:0.95rem; font-weight:600; color:var(--an-ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .an-dd-head-email{ font-size:0.8rem; color:var(--an-ink-soft); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .an-dd-item{
      display:block; width:100%; text-align:left; color:var(--an-ink); text-decoration:none; font-family:inherit;
      font-size:0.96rem; font-weight:500; background:none; border:none; cursor:pointer;
      padding:11px 14px; border-radius:11px; transition: background .15s ease;
    }
    .an-dd-item:hover{ background: var(--an-bg-card); }
    .an-dd-item.danger{ color:#c23; }

    @media (min-width: 900px){
      .an-nav-shell{ overflow: visible; }
      .an-nav-header{ padding: 12px 16px 12px 28px; }
      .an-nav-mobile{ display:none !important; }
      .an-menu-btn{ display:none; }
      .an-nav-desktop{ display:flex; align-items:center; gap:34px; }
      #anNavCtaDesktop{ display:inline-block; }
    }
  `;

  /* ─────────────── сборка HTML из данных выше ─────────────── */
  function buildDesktopDropdown(drop) {
    const items = drop.items
      .map((it) => (it.sep ? '<div class="an-drop-sep"></div>' : `<a href="${it.href}">${it.label}</a>`))
      .join('');
    return `
      <div class="an-drop" data-drop="${drop.key}">
        <button class="an-drop-btn" type="button" aria-expanded="false">
          ${drop.label}
          <svg class="an-drop-chevron" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
        </button>
        <div class="an-drop-menu">${items}</div>
      </div>`;
  }

  function buildMobileGroup(drop) {
    const items = drop.items
      .filter((it) => !it.sep)
      .map((it) => `<a class="an-sub" href="${it.href}">${it.label}</a>`)
      .join('');
    return `<div class="an-mobile-section">${drop.label}</div>${items}`;
  }

  const NAV_HTML = `
<div class="an-nav-wrap">
  <div class="an-nav-shell" id="anNavShell">
    <div class="an-nav-header">
      <a class="an-logo" href="/" aria-label="Antviz">${LOGO_SVG}</a>

      <nav class="an-nav-desktop">
        ${NAV_DROPDOWNS.map(buildDesktopDropdown).join('')}

        <div class="an-user" id="anUser">
          <a href="/auth" class="an-user-btn guest" id="anUserBtn" aria-expanded="false">
            <span class="an-avatar" id="anAvatar"></span>
            <span class="an-uname" id="anUname">Войти</span>
            <svg class="an-user-chevron" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
          </a>
          <div class="an-user-dd" id="anUserDd">
            <div class="an-dd-head" id="anDdHead" style="display:none">
              <div class="an-dd-head-name" id="anDdHeadName">—</div>
              <div class="an-dd-head-email" id="anDdHeadEmail">—</div>
            </div>
            <a href="/orders" class="an-dd-item">Мои заказы</a>
            <a href="/profile" class="an-dd-item">Профиль</a>
            <div class="an-drop-sep"></div>
            <button class="an-dd-item danger" id="anSignOut" type="button">Выйти</button>
          </div>
        </div>
      </nav>

      <div style="display:flex; align-items:center; gap:10px;">
        <a href="${CTA.href}" class="an-pill-btn" id="anNavCtaDesktop">${CTA.label}</a>
        <button class="an-menu-btn" id="anMenuBtn" aria-label="Открыть меню">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>

    <div class="an-nav-mobile" id="anNavMobile">
      <div class="an-mobile-user" id="anMobileUser" style="display:none">
        <span class="an-avatar" id="anMobileAvatar"></span>
        <div>
          <div class="an-mobile-user-name" id="anMobileUserName">—</div>
          <div class="an-mobile-user-email" id="anMobileUserEmail">—</div>
        </div>
      </div>

      ${NAV_DROPDOWNS.map(buildMobileGroup).join('')}

      <a href="/auth" id="anMobileAuthLink">Войти</a>
      <a href="/orders" id="anMobileOrdersLink" style="display:none">Мои заказы</a>
      <button type="button" class="an-mlink an-mobile-signout" id="anMobileSignOut" style="display:none">Выйти</button>

      <a href="${CTA.href}" class="an-nav-cta-mobile">${CTA.label}</a>
    </div>
  </div>
</div>`;

  /* ─────────────── инъекция в страницу ─────────────── */
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  document.body.insertAdjacentHTML('afterbegin', NAV_HTML);

  /* ─────────────── логика: бургер + дропдауны + пользователь ─────────────── */
  const shell = document.getElementById('anNavShell');
  const burgerBtn = document.getElementById('anMenuBtn');
  const mobilePanel = document.getElementById('anNavMobile');
  const userBox = document.getElementById('anUser');
  const userBtn = document.getElementById('anUserBtn');

  let isAuthed = false;

  burgerBtn.addEventListener('click', function () {
    shell.classList.toggle('open');
    mobilePanel.classList.toggle('open');
  });

  const drops = document.querySelectorAll('.an-drop');

  function closeAllDrops() {
    drops.forEach(function (d) {
      d.classList.remove('open');
      const b = d.querySelector('.an-drop-btn');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }
  function closeUserDd() {
    userBox.classList.remove('open');
    userBtn.setAttribute('aria-expanded', 'false');
  }

  drops.forEach(function (drop) {
    const dropBtn = drop.querySelector('.an-drop-btn');
    dropBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeUserDd();
      const willOpen = !drop.classList.contains('open');
      closeAllDrops();
      if (willOpen) {
        drop.classList.add('open');
        dropBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  userBtn.addEventListener('click', function (e) {
    if (!isAuthed) return; // гость — обычная ссылка на /auth, JS не вмешивается
    e.preventDefault();
    closeAllDrops();
    const willOpen = !userBox.classList.contains('open');
    userBox.classList.toggle('open', willOpen);
    userBtn.setAttribute('aria-expanded', String(willOpen));
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.an-drop')) closeAllDrops();
    if (!e.target.closest('.an-user')) closeUserDd();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAllDrops();
      closeUserDd();
    }
  });

  /* ─────────────── проверка авторизации (как в оригинальном nav.js) ─────────────── */
  function applyGuestUI() {
    isAuthed = false;
    userBtn.classList.add('guest');
    userBtn.setAttribute('href', '/auth');
    document.getElementById('anUname').textContent = 'Войти';
    document.getElementById('anAvatar').textContent = '';
    document.getElementById('anDdHead').style.display = 'none';

    document.getElementById('anMobileUser').style.display = 'none';
    document.getElementById('anMobileAuthLink').style.display = 'block';
    document.getElementById('anMobileOrdersLink').style.display = 'none';
    document.getElementById('anMobileSignOut').style.display = 'none';
  }

  function applyAuthedUI(user) {
    isAuthed = true;
    const name = user.displayName || (user.email ? user.email.split('@')[0] : 'Профиль');
    const initial = name.charAt(0).toUpperCase();

    userBtn.classList.remove('guest');
    userBtn.removeAttribute('href');
    document.getElementById('anUname').textContent = name;
    const avatarEl = document.getElementById('anAvatar');
    avatarEl.innerHTML = user.photoURL ? '<img src="' + user.photoURL + '" alt="">' : initial;

    const ddHead = document.getElementById('anDdHead');
    ddHead.style.display = 'block';
    document.getElementById('anDdHeadName').textContent = name;
    document.getElementById('anDdHeadEmail').textContent = user.email || '';

    document.getElementById('anMobileUser').style.display = 'flex';
    document.getElementById('anMobileAvatar').innerHTML = user.photoURL ? '<img src="' + user.photoURL + '" alt="">' : initial;
    document.getElementById('anMobileUserName').textContent = name;
    document.getElementById('anMobileUserEmail').textContent = user.email || '';
    document.getElementById('anMobileAuthLink').style.display = 'none';
    document.getElementById('anMobileOrdersLink').style.display = 'block';
    document.getElementById('anMobileSignOut').style.display = 'block';
  }

  async function signOut() {
    try {
      await fetch(API + '/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error('antviz-nav.js signOut:', e);
    }
    window.location.href = '/';
  }
  document.getElementById('anSignOut').addEventListener('click', signOut);
  document.getElementById('anMobileSignOut').addEventListener('click', signOut);

  (async function checkAuth() {
    try {
      const resp = await fetch(API + '/auth/me', { credentials: 'include' });
      if (resp.ok) {
        const user = await resp.json();
        applyAuthedUI(user);
      } else {
        applyGuestUI();
      }
    } catch (e) {
      console.error('antviz-nav.js auth check failed:', e);
      applyGuestUI();
    }
  })();
})();
