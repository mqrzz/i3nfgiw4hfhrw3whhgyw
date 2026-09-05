/**
 * antviz-nav.js
 * <script src="antviz-nav.js"></script>
 *
 * Полноценная капсула навигации (светлая, blur), как в мокапе
 * vantage-mockup-3: сам генерирует CSS и HTML (логотип, дропдауны,
 * мобильное меню, CTA) и вставляет их в начало <body> — по той же
 * архитектуре, что и nav.js. В отличие от nav.js здесь ТОЛЬКО логика
 * самого меню (открытие/закрытие дропдаунов, бургер, клик вне/Esc) —
 * без авторизации, бейджей и обращений к API.
 */
(function () {
  'use strict';

  /* ─────────────── логотип-вордмарк antviz (inline SVG, currentColor) ─────────────── */
  const LOGO_SVG = `<svg class="an-logo-mark" viewBox="0 0 1692 484" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true"><g transform="translate(0,484) scale(0.1,-0.1)" fill="currentColor"><path d="M13107 4247 c-49 -14 -128 -91 -161 -155 -54 -106 -25 -237 70 -321 92 -81 177 -99 275 -60 164 64 227 226 151 391 -16 35 -40 73 -53 85 -62 56 -197 85 -282 60z"/><path d="M7857 3914 c-4 -4 -7 -505 -7 -1113 0 -1051 1 -1111 19 -1196 20 -93 63 -209 99 -267 11 -18 34 -55 51 -83 112 -186 306 -327 536 -391 l100 -28 444 -4 c277 -2 447 0 453 6 14 14 12 411 -3 428 -9 11 -76 14 -361 14 -322 0 -356 2 -439 21 -154 37 -281 131 -344 254 -77 152 -78 161 -82 788 -3 419 -1 562 8 573 9 12 81 14 430 14 247 0 428 4 443 10 l26 10 0 213 c0 152 -3 216 -12 225 -9 9 -121 12 -444 12 -335 0 -435 3 -441 13 -4 6 -10 122 -13 257 l-5 245 -226 3 c-124 1 -228 -1 -232 -4z"/><path d="M2090 3388 c-19 -5 -63 -15 -97 -22 -34 -7 -119 -42 -190 -76 -115 -57 -137 -73 -223 -156 -90 -88 -105 -109 -164 -234 -11 -25 -27 -52 -33 -61 -7 -8 -20 -38 -29 -65 -54 -169 -64 -279 -64 -696 0 -277 4 -379 15 -450 15 -85 60 -232 85 -275 5 -10 15 -29 20 -43 17 -40 58 -104 105 -164 44 -56 195 -172 283 -217 84 -43 175 -73 266 -89 65 -11 1114 -12 1276 -1 90 6 95 7 98 30 2 13 -6 36 -17 52 -12 15 -21 31 -21 35 0 4 -15 30 -34 58 -18 28 -57 96 -85 151 -29 55 -58 103 -64 107 -7 4 -226 8 -487 8 -439 0 -481 2 -548 20 -168 44 -316 187 -347 332 -4 18 -11 38 -15 43 -17 23 -21 105 -21 443 1 330 3 363 22 432 24 85 39 121 73 168 69 94 122 135 231 179 l70 28 680 0 680 0 5 -1045 c3 -575 6 -1046 8 -1047 1 -2 105 -3 231 -3 195 0 232 2 245 16 14 14 16 143 16 1273 0 964 -3 1260 -12 1269 -15 15 -1903 15 -1958 0z"/><path d="M5310 3390 c-132 -28 -199 -55 -328 -133 -84 -51 -163 -129 -245 -243 -74 -103 -121 -256 -143 -469 -21 -193 -17 -1681 4 -1702 19 -19 445 -19 460 0 8 9 12 275 15 847 3 763 5 840 21 895 35 119 130 236 230 285 124 61 137 62 679 58 l492 -4 63 -28 c124 -54 198 -122 258 -239 47 -89 47 -94 51 -971 2 -582 7 -834 14 -843 16 -18 449 -19 467 -1 9 9 12 208 12 833 0 857 2 815 -40 1021 -28 134 -93 272 -181 383 -80 99 -162 166 -269 217 -41 20 -84 41 -95 47 -11 6 -36 14 -55 18 -19 3 -62 14 -95 23 -52 14 -136 16 -670 15 -335 -1 -626 -5 -645 -9z"/><path d="M9603 3385 c-6 -18 15 -68 106 -245 133 -260 538 -1068 567 -1130 16 -36 61 -126 98 -200 38 -74 77 -153 87 -175 10 -22 60 -128 112 -235 53 -107 127 -262 166 -345 39 -82 79 -166 88 -185 l18 -35 229 -3 c198 -2 231 0 247 14 17 15 67 112 184 359 31 66 61 127 66 135 5 8 18 33 28 55 10 22 42 90 70 150 28 61 56 119 63 130 27 46 148 294 148 303 0 5 25 56 55 113 31 57 69 133 86 169 27 58 140 289 272 555 25 50 68 135 96 190 134 264 181 369 170 382 -9 10 -67 13 -263 13 -138 0 -256 -4 -262 -8 -18 -12 -194 -360 -194 -384 0 -7 -13 -38 -29 -68 -91 -177 -127 -252 -191 -391 -40 -84 -96 -210 -127 -279 -30 -69 -58 -133 -63 -142 -39 -71 -149 -298 -155 -318 -9 -32 -122 -264 -152 -312 -13 -21 -30 -38 -37 -38 -13 0 -124 214 -216 415 -17 39 -71 151 -120 250 -193 395 -241 495 -298 620 -33 72 -71 150 -86 175 -14 25 -30 55 -35 67 -6 12 -33 70 -62 130 -28 59 -69 145 -90 189 -21 45 -46 85 -55 88 -8 3 -128 6 -265 6 -215 0 -250 -2 -256 -15z"/><path d="M12966 3384 c-14 -14 -16 -142 -16 -1265 0 -843 3 -1257 10 -1270 10 -18 23 -19 233 -19 160 0 226 3 235 12 9 9 12 306 12 1275 0 1238 0 1262 -19 1273 -12 6 -104 10 -230 10 -177 0 -212 -2 -225 -16z"/><path d="M14043 3393 c-16 -6 -18 -419 -3 -443 8 -13 101 -16 702 -20 671 -5 693 -6 696 -24 2 -10 -3 -23 -11 -27 -8 -5 -41 -41 -73 -81 -33 -40 -111 -136 -174 -213 -133 -161 -205 -251 -308 -379 -41 -50 -90 -109 -110 -131 -21 -22 -64 -74 -97 -116 -111 -142 -189 -240 -295 -366 -58 -69 -129 -157 -158 -195 -29 -38 -82 -106 -117 -151 -35 -45 -82 -105 -105 -134 l-40 -52 0 -109 c0 -91 3 -111 16 -116 9 -3 536 -6 1173 -6 887 0 1160 3 1169 12 17 17 17 409 0 426 -9 9 -199 12 -795 12 -657 0 -783 2 -783 14 0 7 24 41 53 74 146 169 252 295 309 369 110 142 220 276 269 328 26 28 67 75 91 106 57 75 272 330 337 399 28 30 51 58 51 61 0 10 257 321 322 390 13 14 52 59 85 100 l61 75 0 87 c1 65 -3 90 -14 102 -14 13 -141 15 -1127 14 -612 0 -1118 -3 -1124 -6z"/></g></svg>`;

  /* ─────────────── данные меню — ссылки/подписи, ничего больше ─────────────── */
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

  const SIMPLE_LINK = { href: '/auth', label: 'Войти' };
  const CTA = { href: '/order', label: 'Сделать заказ' };

  /* ─────────────── CSS — весь стиль капсулы, независимо от хост-страницы ─────────────── */
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

    .an-nav-mobile{
      max-height:0; opacity:0; overflow:hidden; padding: 0 22px;
      transition: max-height .65s cubic-bezier(0.65,0,0.35,1), opacity .5s ease .05s, padding .65s cubic-bezier(0.65,0,0.35,1);
    }
    .an-nav-mobile.open{ max-height:600px; opacity:1; padding: 4px 22px 22px; }
    .an-nav-mobile a{
      display:block; color:var(--an-ink); text-decoration:none;
      font-size:1.5rem; font-weight:700; letter-spacing:-0.01em;
      padding: 13px 2px; border-top:1px solid var(--an-line);
    }
    .an-nav-mobile a:first-child{ border-top:none; }
    .an-mobile-section{
      font-size:0.8rem; font-weight:600; text-transform:uppercase; letter-spacing:0.06em;
      color:var(--an-ink-soft); padding: 16px 2px 4px; border-top:none;
    }
    .an-nav-mobile a.an-sub{ font-size:1.1rem; font-weight:500; padding:10px 2px; border-top:none; }
    .an-nav-cta-mobile{
      margin-top:14px; text-align:center; background:var(--an-pill) !important; color:var(--an-pill-ink) !important;
      border-radius:var(--an-radius-pill); padding:16px !important; font-size:1.05rem !important; font-weight:600 !important; border-top:none !important;
    }

    .an-nav-desktop{ display:none; }

    .an-pill-btn{
      display:inline-block; background:var(--an-pill); color:var(--an-pill-ink); text-decoration:none;
      padding: 13px 24px; border-radius:var(--an-radius-pill); font-weight:600; font-size:1.02rem; border:none; cursor:pointer;
    }

    .an-drop{ position:relative; }
    .an-drop-btn{
      display:flex; align-items:center; gap:6px; background:none; border:none; cursor:pointer;
      font-family:inherit; color:var(--an-ink); font-size:1rem; font-weight:500; opacity:0.75; padding:0;
      transition: opacity .2s ease;
    }
    .an-drop-btn:hover, .an-drop.open .an-drop-btn{ opacity:1; }
    .an-drop-chevron{ width:9px; height:9px; transition: transform .3s cubic-bezier(0.65,0,0.35,1); flex-shrink:0; }
    .an-drop.open .an-drop-chevron{ transform: rotate(180deg); }

    .an-drop-menu{
      position:absolute; top: calc(100% + 18px); left:50%; transform: translateX(-50%) translateY(-8px);
      min-width:220px; background: rgba(255,255,255,0.85);
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

    @media (min-width: 900px){
      .an-nav-shell{ overflow: visible; }
      .an-nav-header{ padding: 12px 16px 12px 28px; }
      .an-nav-mobile{ display:none !important; }
      .an-menu-btn{ display:none; }
      .an-nav-desktop{ display:flex; align-items:center; gap:34px; }
      .an-nav-desktop a{ color:var(--an-ink); text-decoration:none; font-size:1rem; font-weight:500; opacity:0.75; transition: opacity .2s ease; }
      .an-nav-desktop a:hover{ opacity:1; }
    }
  `;

  /* ─────────────── сборка HTML из данных выше ─────────────── */
  function buildDesktopDropdown(drop) {
    const items = drop.items
      .map((it) => (it.sep ? '<div class="an-drop-sep"></div>' : `<a href="${it.href}">${it.label}</a>`))
      .join('');
    return `
      <div class="an-drop" data-drop="${drop.key}">
        <button class="an-drop-btn" type="button">
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
        <a href="${SIMPLE_LINK.href}">${SIMPLE_LINK.label}</a>
      </nav>

      <div style="display:flex; align-items:center; gap:10px;">
        <a href="${CTA.href}" class="an-pill-btn" style="display:none" id="anNavCtaDesktop">${CTA.label}</a>
        <button class="an-menu-btn" id="anMenuBtn" aria-label="Открыть меню">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>

    <div class="an-nav-mobile" id="anNavMobile">
      ${NAV_DROPDOWNS.map(buildMobileGroup).join('')}
      <a href="${SIMPLE_LINK.href}">${SIMPLE_LINK.label}</a>
      <a href="${CTA.href}" class="an-nav-cta-mobile">${CTA.label}</a>
    </div>
  </div>
</div>`;

  /* ─────────────── инъекция в страницу ─────────────── */
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  document.body.insertAdjacentHTML('afterbegin', NAV_HTML);

  // CTA-кнопка справа видна только на десктопе (как в мокапе) —
  // управляется тем же медиа-условием, что и .an-nav-desktop.
  const ctaDesktop = document.getElementById('anNavCtaDesktop');
  const mq = window.matchMedia('(min-width: 900px)');
  function syncCta() { ctaDesktop.style.display = mq.matches ? 'inline-block' : 'none'; }
  syncCta();
  mq.addEventListener ? mq.addEventListener('change', syncCta) : mq.addListener(syncCta);

  /* ─────────────── логика: бургер + дропдауны (только это, без auth/API) ─────────────── */
  const shell = document.getElementById('anNavShell');
  const burgerBtn = document.getElementById('anMenuBtn');
  const mobilePanel = document.getElementById('anNavMobile');

  burgerBtn.addEventListener('click', function () {
    shell.classList.toggle('open');
    mobilePanel.classList.toggle('open');
  });

  const drops = document.querySelectorAll('.an-drop');

  function closeAllDrops() {
    drops.forEach(function (d) { d.classList.remove('open'); });
  }

  drops.forEach(function (drop) {
    const dropBtn = drop.querySelector('.an-drop-btn');
    dropBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      const willOpen = !drop.classList.contains('open');
      closeAllDrops();
      if (willOpen) drop.classList.add('open');
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.an-drop')) closeAllDrops();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAllDrops();
  });
})();
