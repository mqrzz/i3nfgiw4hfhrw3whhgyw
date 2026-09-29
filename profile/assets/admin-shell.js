/**
 * admin-shell.js — общий каркас админки Antviz, на тех же токенах и
 * компонентах, что и личный кабинет (cabinet-base.css + cabinet.css).
 * <script src="/profile/assets/admin-shell.js" data-page="reviews"></script>
 *
 * Раньше у админки был свой отдельный "Vantage"-дизайн (m-panel26.js —
 * плавающая светлая капсула без тёмной темы, свои токены на каждой
 * странице). Теперь админка — часть той же системы, что и /profile/*:
 * постоянный сайдбар слева на ПК (со сворачиванием и тёмной/светлой
 * темой), плавающая нижняя капсула на мобильных — 1-в-1 архитектура
 * profile/assets/sidebar.js, просто с другим списком разделов.
 *
 * Разделы и бейджи — те же, что были в m-panel26.js: специально оставил
 * ЛИТЕРАЛЬНЫЕ id="navBadge…" (а не data-badge-key, как в клиентском
 * sidebar.js) — каждая admin-страница уже сама пишет в эти id
 * (document.getElementById('navBadgeOrders')…), переучивать 10+ файлов
 * на новый способ простановки бейджей смысла не было.
 *
 * Каждая страница оборачивает свой контент в <div id="sbContent">…</div> —
 * ровно как в клиентском кабинете.
 */
(function () {
  const script = document.currentScript;
  const page = script ? (script.getAttribute('data-page') || '') : '';
  const pageTitle = script ? (script.getAttribute('data-title') || '') : '';

  const LOGO_SVG = `<svg class="sb-brand-logo" viewBox="0 0 1692 484" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true"><g transform="translate(0,484) scale(0.1,-0.1)" fill="currentColor"><path d="M13107 4247 c-49 -14 -128 -91 -161 -155 -54 -106 -25 -237 70 -321 92 -81 177 -99 275 -60 164 64 227 226 151 391 -16 35 -40 73 -53 85 -62 56 -197 85 -282 60z"/><path d="M7857 3914 c-4 -4 -7 -505 -7 -1113 0 -1051 1 -1111 19 -1196 20 -93 63 -209 99 -267 11 -18 34 -55 51 -83 112 -186 306 -327 536 -391 l100 -28 444 -4 c277 -2 447 0 453 6 14 14 12 411 -3 428 -9 11 -76 14 -361 14 -322 0 -356 2 -439 21 -154 37 -281 131 -344 254 -77 152 -78 161 -82 788 -3 419 -1 562 8 573 9 12 81 14 430 14 247 0 428 4 443 10 l26 10 0 213 c0 152 -3 216 -12 225 -9 9 -121 12 -444 12 -335 0 -435 3 -441 13 -4 6 -10 122 -13 257 l-5 245 -226 3 c-124 1 -228 -1 -232 -4z"/><path d="M2090 3388 c-19 -5 -63 -15 -97 -22 -34 -7 -119 -42 -190 -76 -115 -57 -137 -73 -223 -156 -90 -88 -105 -109 -164 -234 -11 -25 -27 -52 -33 -61 -7 -8 -20 -38 -29 -65 -54 -169 -64 -279 -64 -696 0 -277 4 -379 15 -450 15 -85 60 -232 85 -275 5 -10 15 -29 20 -43 17 -40 58 -104 105 -164 44 -56 195 -172 283 -217 84 -43 175 -73 266 -89 65 -11 1114 -12 1276 -1 90 6 95 7 98 30 2 13 -6 36 -17 52 -12 15 -21 31 -21 35 0 4 -15 30 -34 58 -18 28 -57 96 -85 151 -29 55 -58 103 -64 107 -7 4 -226 8 -487 8 -439 0 -481 2 -548 20 -168 44 -316 187 -347 332 -4 18 -11 38 -15 43 -17 23 -21 105 -21 443 1 330 3 363 22 432 24 85 39 121 73 168 69 94 122 135 231 179 l70 28 680 0 680 0 5 -1045 c3 -575 6 -1046 8 -1047 1 -2 105 -3 231 -3 195 0 232 2 245 16 14 14 16 143 16 1273 0 964 -3 1260 -12 1269 -15 15 -1903 15 -1958 0z"/><path d="M5310 3390 c-132 -28 -199 -55 -328 -133 -84 -51 -163 -129 -245 -243 -74 -103 -121 -256 -143 -469 -21 -193 -17 -1681 4 -1702 19 -19 445 -19 460 0 8 9 12 275 15 847 3 763 5 840 21 895 35 119 130 236 230 285 124 61 137 62 679 58 l492 -4 63 -28 c124 -54 198 -122 258 -239 47 -89 47 -94 51 -971 2 -582 7 -834 14 -843 16 -18 449 -19 467 -1 9 9 12 208 12 833 0 857 2 815 -40 1021 -28 134 -93 272 -181 383 -80 99 -162 166 -269 217 -41 20 -84 41 -95 47 -11 6 -36 14 -55 18 -19 3 -62 14 -95 23 -52 14 -136 16 -670 15 -335 -1 -626 -5 -645 -9z"/><path d="M9603 3385 c-6 -18 15 -68 106 -245 133 -260 538 -1068 567 -1130 16 -36 61 -126 98 -200 38 -74 77 -153 87 -175 10 -22 60 -128 112 -235 53 -107 127 -262 166 -345 39 -82 79 -166 88 -185 l18 -35 229 -3 c198 -2 231 0 247 14 17 15 67 112 184 359 31 66 61 127 66 135 5 8 18 33 28 55 10 22 42 90 70 150 28 61 56 119 63 130 27 46 148 294 148 303 0 5 25 56 55 113 31 57 69 133 86 169 27 58 140 289 272 555 25 50 68 135 96 190 134 264 181 369 170 382 -9 10 -67 13 -263 13 -138 0 -256 -4 -262 -8 -18 -12 -194 -360 -194 -384 0 -7 -13 -38 -29 -68 -91 -177 -127 -252 -191 -391 -40 -84 -96 -210 -127 -279 -30 -69 -58 -133 -63 -142 -39 -71 -149 -298 -155 -318 -9 -32 -122 -264 -152 -312 -13 -21 -30 -38 -37 -38 -13 0 -124 214 -216 415 -17 39 -71 151 -120 250 -193 395 -241 495 -298 620 -33 72 -71 150 -86 175 -14 25 -30 55 -35 67 -6 12 -33 70 -62 130 -28 59 -69 145 -90 189 -21 45 -46 85 -55 88 -8 3 -128 6 -265 6 -215 0 -250 -2 -256 -15z"/><path d="M12966 3384 c-14 -14 -16 -142 -16 -1265 0 -843 3 -1257 10 -1270 10 -18 23 -19 233 -19 160 0 226 3 235 12 9 9 12 306 12 1275 0 1238 0 1262 -19 1273 -12 6 -104 10 -230 10 -177 0 -212 -2 -225 -16z"/><path d="M14043 3393 c-16 -6 -18 -419 -3 -443 8 -13 101 -16 702 -20 671 -5 693 -6 696 -24 2 -10 -3 -23 -11 -27 -8 -5 -41 -41 -73 -81 -33 -40 -111 -136 -174 -213 -133 -161 -205 -251 -308 -379 -41 -50 -90 -109 -110 -131 -21 -22 -64 -74 -97 -116 -111 -142 -189 -240 -295 -366 -58 -69 -129 -157 -158 -195 -29 -38 -82 -106 -117 -151 -35 -45 -82 -105 -105 -134 l-40 -52 0 -109 c0 -91 3 -111 16 -116 9 -3 536 -6 1173 -6 887 0 1160 3 1169 12 17 17 17 409 0 426 -9 9 -199 12 -795 12 -657 0 -783 2 -783 14 0 7 24 41 53 74 146 169 252 295 309 369 110 142 220 276 269 328 26 28 67 75 91 106 57 75 272 330 337 399 28 30 51 58 51 61 0 10 257 321 322 390 13 14 52 59 85 100 l61 75 0 87 c1 65 -3 90 -14 102 -14 13 -141 15 -1127 14 -612 0 -1118 -3 -1124 -6z"/></g></svg>`;

  const NAV_ITEMS = [
    { key: 'index',      href: '/admin',            exact: true, icon: '<rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2"/><rect x="13" y="3.5" width="7.5" height="7.5" rx="2"/><rect x="3.5" y="13" width="7.5" height="7.5" rx="2"/><rect x="13" y="13" width="7.5" height="7.5" rx="2"/>', label: 'Дашборд' },
    { key: 'orders',     href: '/admin/orders',     icon: '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>', label: 'Заказы', badge: 'navBadgeOrders' },
    { key: 'tickets',    href: '/admin/tickets',    icon: '<path d="M2 9a3 3 0 010-6h20a3 3 0 010 6"/><path d="M2 15a3 3 0 000 6h20a3 3 0 000-6"/><path d="M6 12h12"/>', label: 'Обслуживание', badge: 'navBadgeTickets' },
    { key: 'chats',      href: '/admin/chats',      icon: '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>', label: 'Чаты', badge: 'navBadgeChats' },
    { key: 'mail',       href: '/admin/mail',       icon: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 8.97 6.19a2 2 0 0 0 2.06 0L22 7"/>', label: 'Почта', badge: 'navBadgeMail' },
    { key: 'users',      href: '/admin/users',      icon: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>', label: 'Клиенты' },
    { key: 'promos',     href: '/admin/promos',     icon: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1.3" fill="currentColor" stroke="none"/>', label: 'Промокоды' },
    { key: 'reviews',    href: '/admin/reviews',    icon: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', label: 'Отзывы' },
    { key: 'enterprise', href: '/admin/enterprise', icon: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M3 12h18"/>', label: 'Крупные проекты', badge: 'navBadgeEnterprise' },
    { key: 'blog',       href: '/admin/blog',       icon: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>', label: 'Блог' },
    { sep: true },
    { key: 'system',     href: '/admin/system',     icon: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>', label: 'Система' },
    { key: 'logout',     logout: true, icon: '<path d="M9 4H6.5A2.5 2.5 0 004 6.5v11A2.5 2.5 0 006.5 20H9"/><path d="M20 12H10.5"/><path d="M16 8l4 4-4 4"/>', label: 'Выйти', color: 'red' },
  ];

  const CSS = `
    :root{ --sb-w: 260px; --sb-gap: 16px; }
    html, body{ margin:0; background:var(--bg); }
    .sb-shell{ display:flex; align-items:stretch; height:100vh; width:100%; }
    .sb-nav{
      position:sticky; top:0; flex-shrink:0;
      width:var(--sb-w); height:calc(100vh - var(--sb-gap) * 2);
      background:var(--card); border:1px solid var(--stroke); border-radius:32px;
      display:flex; flex-direction:column;
      margin:var(--sb-gap); padding:8px 14px 20px;
      overflow-y:auto; overscroll-behavior:contain;
    }
    .sb-nav::-webkit-scrollbar{ width:0; }
    .sb-brand{ display:flex; align-items:center; padding:8px 10px 20px; margin-bottom:8px; border-bottom:1px solid var(--stroke); text-decoration:none; }
    .sb-brand-logo{ height:30px; width:auto; flex-shrink:0; color:var(--text); display:block; }
    .sb-brand-row{ display:flex; align-items:center; gap:6px; padding:4px 4px 20px; margin-bottom:8px; border-bottom:1px solid var(--stroke); }
    .sb-brand-row .sb-brand{ padding:4px 6px; margin:0; border:none; flex:1; min-width:0; }
    .sb-collapse-btn{ display:flex; align-items:center; justify-content:center; width:48px; height:48px; flex-shrink:0; border-radius:13px; border:none; background:none; cursor:pointer; color:var(--text-dim); transition:background .15s, color .15s; }
    .sb-collapse-btn:hover{ background:var(--card-elevated); color:var(--text); }
    .sb-collapse-btn svg{ width:24px; height:24px; stroke:currentColor; stroke-width:1.7; fill:none; }
    .sb-collapse-btn .sb-ico-expand{ display:none; }
    .sb-nav-main{ display:flex; flex-direction:column; gap:3px; }
    .sb-nav-bottom{ display:flex; flex-direction:column; gap:3px; margin-top:auto; padding-top:14px; }
    .sb-link{ position:relative; display:flex; align-items:center; gap:13px; padding:.6rem 1rem .6rem .6rem; border-radius:14px; color:var(--text-dim); text-decoration:none; font-family:'Geologica','Inter','Arial',sans-serif; font-weight:400; font-size:.92rem; background:none; border:none; cursor:pointer; width:100%; text-align:left; transition:background .15s, color .15s; }
    .sb-link-ico{ width:36px; height:36px; flex-shrink:0; border-radius:11px; display:flex; align-items:center; justify-content:center; background:var(--card-elevated); transition:background .15s, color .15s, box-shadow .15s, transform .15s; }
    .sb-link-ico svg{ width:18px; height:18px; stroke:currentColor; stroke-width:1.8; flex-shrink:0; fill:none; }
    .sb-link:hover{ background:var(--card-elevated); color:var(--text); }
    .sb-link:hover .sb-link-ico:not([class*="sb-c-"]){ background:var(--bg); box-shadow:0 6px 14px -8px rgba(0,0,0,.3); }
    .sb-link.is-active{ background:var(--card-elevated); color:var(--text); font-weight:500; }
    .sb-link.is-active .sb-link-ico:not([class*="sb-c-"]){ background:var(--text); color:var(--green); box-shadow:0 8px 18px -8px rgba(0,0,0,.4); }
    .sb-link-label{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .sb-link-ico[class*="sb-c-"]{ color:#fff; } .sb-link-ico[class*="sb-c-"] svg{ stroke:#fff; }
    .sb-c-red{ background:linear-gradient(135deg,#ff7a7a,#e8634f); }
    .sb-badge{ margin-left:auto; background:var(--green); color:#0d1210; font-size:.64rem; font-weight:600; padding:.16rem .48rem; border-radius:7px; min-width:19px; text-align:center; flex-shrink:0; }
    .sb-sep{ height:1px; background:var(--stroke); margin:10px 6px; flex-shrink:0; }
    .sb-link.danger{ color:#d95a48; } .sb-link.danger:hover{ background:none; color:#c44432; }
    .sb-link.danger .sb-link-ico:not([class*="sb-c-"]){ color:#d95a48; }
    .sb-link.danger:hover .sb-link-ico:not([class*="sb-c-"]){ background:rgba(232,99,79,.1); }
    .sb-nav.is-collapsed{ width:84px; padding-left:10px; padding-right:10px; }
    .sb-nav.is-collapsed .sb-brand-row{ justify-content:center; padding-left:0; padding-right:0; }
    .sb-nav.is-collapsed .sb-brand{ display:none; }
    .sb-nav.is-collapsed .sb-link{ justify-content:center; gap:0; padding-left:0; padding-right:0; }
    .sb-nav.is-collapsed .sb-link-label{ display:none; }
    .sb-nav.is-collapsed .sb-collapse-btn .sb-ico-collapse{ display:none; }
    .sb-nav.is-collapsed .sb-collapse-btn .sb-ico-expand{ display:flex; }
    .sb-nav{ transition:width .18s ease; }
    .sb-nav.is-collapsed .sb-badge{ position:absolute; top:4px; right:15px; width:9px; height:9px; min-width:0; padding:0; border-radius:50%; font-size:0; line-height:0; overflow:hidden; }
    .sb-content{
      flex:1; min-width:0; height:calc(100vh - var(--sb-gap) * 2);
      overflow-y:auto; -webkit-overflow-scrolling:touch;
      margin:var(--sb-gap); background:var(--card); border:1px solid var(--stroke); border-radius:32px;
      padding:0 48px 60px; scroll-behavior:smooth;
    }
    .sb-content > .shell{ max-width:var(--cab-max,1480px); margin:0 auto; }
    .pg-bar{ display:none; position:sticky; top:0; z-index:40; margin:0 -48px 8px; padding:16px 48px 14px; background:var(--card); border-bottom:1px solid transparent; border-radius:32px 32px 0 0; transition:border-color .15s; }
    .pg-bar.is-stuck{ border-bottom-color:var(--stroke); }
    .pg-bar-in{ max-width:var(--cab-max,1480px); margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:16px; }
    .pg-bar-left{ display:flex; align-items:center; gap:10px; min-width:0; }
    .pg-crumb{ display:flex; align-items:center; gap:10px; min-width:0; font-family:'Geologica','Inter','Arial',sans-serif; font-size:14px; color:var(--text-dim); }
    .pg-crumb i{ font-style:normal; opacity:.45; }
    .pg-crumb b{ font-weight:500; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .pg-bar-right{ display:flex; align-items:center; gap:10px; flex-shrink:0; }
    .pg-tool{ position:relative; width:44px; height:44px; border-radius:14px; flex-shrink:0; display:flex; align-items:center; justify-content:center; cursor:pointer; background:var(--card-elevated); color:var(--text-dim); border:1px solid var(--stroke); text-decoration:none; transition:border-color .15s, color .15s; }
    .pg-tool:hover{ border-color:var(--text-faint); color:var(--text); }
    .pg-tool svg{ width:19px; height:19px; stroke:currentColor; stroke-width:2; fill:none; stroke-linecap:round; stroke-linejoin:round; }
    .pg-tool .sun{ display:none; } html[data-theme="light"] .pg-tool .moon{ display:none; } html[data-theme="light"] .pg-tool .sun{ display:block; }
    @media (min-width:981px) and (max-width:1200px){ .pg-bar{ padding-left:32px; padding-right:32px; margin-left:-32px; margin-right:-32px; } .pg-crumb span,.pg-crumb i{ display:none; } .pg-crumb b{ font-size:15px; } .sb-content{ padding-left:32px; padding-right:32px; } }
    .antviz-adm-nav{ display:none; }
    @media (min-width:981px){ body{ padding-top:0 !important; } .pg-bar{ display:block; } }
    @media (max-width:980px){
      .sb-nav{ display:none; }
      .sb-shell{ display:block; height:auto; }
      .sb-content{ height:auto; overflow-y:visible; margin:0; border:none; border-radius:0; background:var(--bg); padding:24px 1.2rem 100px; }
    }
    .sb-bottom-nav{ display:none; position:fixed; bottom:16px; left:50%; transform:translateX(-50%); width:calc(100% - 32px); max-width:460px; background:var(--card); border:1px solid var(--stroke); border-radius:24px; padding:8px 4px; justify-content:space-around; align-items:center; box-shadow:0 12px 30px rgba(0,0,0,.18); z-index:850; overflow-x:auto; }
    .sb-bnav-item{ display:flex; align-items:center; justify-content:center; width:38px; height:38px; border-radius:13px; flex-shrink:0; color:var(--text-dim); text-decoration:none; position:relative; }
    .sb-bnav-item svg{ width:18px; height:18px; stroke:currentColor; stroke-width:2; fill:none; }
    .sb-bnav-item.is-active{ color:var(--green-text,var(--green)); background:var(--green-dim); }
    .sb-bnav-dot{ position:absolute; top:2px; right:2px; width:7px; height:7px; border-radius:50%; background:var(--red); border:1.5px solid var(--card); }
    @media (max-width:980px){ .sb-bottom-nav{ display:flex; } }
  `;

  function renderItem(item) {
    const active = (item.key === page) ? ' is-active' : '';
    const badge = item.badge ? `<span class="sb-badge" id="${item.badge}" style="display:none"></span>` : '';
    const label = `<span class="sb-link-label">${item.label}</span>`;
    const icon = `<span class="sb-link-ico${item.color ? ' sb-c-' + item.color : ''}"><svg viewBox="0 0 24 24">${item.icon}</svg></span>`;
    if (item.logout) return `<button class="sb-link danger" data-logout aria-label="${item.label}">${icon}${label}</button>`;
    return `<a href="${item.href}" class="sb-link${active}" aria-label="${item.label}">${icon}${label}${badge}</a>`;
  }

  function buildNav() {
    const sepIdx = NAV_ITEMS.findIndex(i => i.sep);
    const main = sepIdx === -1 ? NAV_ITEMS : NAV_ITEMS.slice(0, sepIdx);
    const bottom = sepIdx === -1 ? [] : NAV_ITEMS.slice(sepIdx + 1);
    return `<div class="sb-nav-main">${main.map(renderItem).join('')}</div><div class="sb-nav-bottom"><div class="sb-sep"></div>${bottom.map(renderItem).join('')}</div>`;
  }

  function init() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const existingContent = document.getElementById('sbContent');
    const collapsed = localStorage.getItem('sb-collapsed') === '1';

    const shell = document.createElement('div');
    shell.className = 'sb-shell';
    shell.innerHTML = `<nav class="sb-nav${collapsed ? ' is-collapsed' : ''}" id="sbNav">
      <div class="sb-brand-row">
        <a class="sb-brand" href="/admin" aria-label="Antviz Admin">${LOGO_SVG}</a>
        <button class="sb-collapse-btn" id="sbCollapseBtn" type="button" aria-label="Свернуть/развернуть меню">
          <svg class="sb-ico-collapse" viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="15" rx="4"/><path d="M9.5 4.5v15"/><path d="M15 9.5l-2.2 2.5 2.2 2.5"/></svg>
          <svg class="sb-ico-expand" viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="15" rx="4"/><path d="M9.5 4.5v15"/><path d="M13.3 9.5l2.2 2.5-2.2 2.5"/></svg>
        </button>
      </div>
      ${buildNav()}
    </nav>`;

    if (existingContent) {
      existingContent.classList.add('sb-content');
      existingContent.parentNode.insertBefore(shell, existingContent);
      shell.appendChild(existingContent);
    } else {
      document.body.insertBefore(shell, document.body.firstChild);
    }

    const navEl = document.getElementById('sbNav');
    const contentEl = document.querySelector('.sb-content');
    if (contentEl) {
      const current = NAV_ITEMS.find(i => i.key === page);
      const crumbTitle = pageTitle || (current ? current.label : '');
      const bar = document.createElement('div');
      bar.className = 'pg-bar';
      bar.innerHTML = `<div class="pg-bar-in">
        <div class="pg-bar-left"><div class="pg-crumb"><span>Admin</span><i>/</i><b>${crumbTitle}</b></div></div>
        <div class="pg-bar-right">
          <a class="pg-tool" href="/" title="На antviz.ru" aria-label="На antviz.ru"><svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/></svg></a>
          <button type="button" class="pg-tool" data-theme-toggle title="Сменить тему" aria-label="Сменить тему">
            <svg class="moon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>
            <svg class="sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
          </button>
        </div>
      </div>`;
      contentEl.insertBefore(bar, contentEl.firstChild);
      contentEl.addEventListener('scroll', () => bar.classList.toggle('is-stuck', contentEl.scrollTop > 4), { passive: true });
    }

    document.querySelectorAll('[data-theme-toggle]').forEach(btn => btn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = cur === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('antviz-theme', next); } catch (e) {}
    }));

    const bottomItems = NAV_ITEMS.filter(i => !i.sep && !i.logout);
    const bottomNav = document.createElement('nav');
    bottomNav.className = 'sb-bottom-nav';
    bottomNav.innerHTML = bottomItems.map(item => {
      const active = item.key === page ? ' is-active' : '';
      const dotId = item.badge ? ` data-bnav-dot-for="${item.badge}"` : '';
      return `<a href="${item.href}" class="sb-bnav-item${active}" aria-label="${item.label}"${dotId}><svg viewBox="0 0 24 24">${item.icon}</svg></a>`;
    }).join('');
    document.body.appendChild(bottomNav);

    // Мобильная капсула — та же цифра неудобна в 38px иконке, показываем точкой
    if (bottomItems.some(i => i.badge)) {
      const mo = new MutationObserver(() => {
        bottomNav.querySelectorAll('[data-bnav-dot-for]').forEach(a => {
          const src = document.getElementById(a.getAttribute('data-bnav-dot-for'));
          const shown = src && src.style.display !== 'none' && src.textContent.trim() !== '';
          let dot = a.querySelector('.sb-bnav-dot');
          if (shown && !dot) { dot = document.createElement('span'); dot.className = 'sb-bnav-dot'; a.appendChild(dot); }
          if (!shown && dot) dot.remove();
        });
      });
      bottomItems.filter(i => i.badge).forEach(i => {
        const el = document.getElementById(i.badge);
        if (el) mo.observe(el, { attributes: true, attributeFilter: ['style'], childList: true, characterData: true, subtree: true });
      });
    }

    function toggleCollapse() {
      const nowCollapsed = navEl.classList.toggle('is-collapsed');
      localStorage.setItem('sb-collapsed', nowCollapsed ? '1' : '0');
      return nowCollapsed;
    }
    document.getElementById('sbCollapseBtn')?.addEventListener('click', toggleCollapse);
    document.querySelector('.sb-brand')?.addEventListener('dblclick', (e) => { e.preventDefault(); toggleCollapse(); });
    document.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') { e.preventDefault(); toggleCollapse(); }
    });

    document.querySelectorAll('[data-logout]').forEach(btn => btn.addEventListener('click', async () => {
      if (typeof window.doLogout === 'function') { window.doLogout(); return; }
      try { await fetch('https://antviz.ru/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch (e) {}
      window.location.href = '/';
    }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
