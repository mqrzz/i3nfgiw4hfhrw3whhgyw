/**
 * sidebar.js — общая боковая панель личного кабинета Antviz.
 * <script src="../sidebar.js" data-page="profile"></script>
 *
 * Подключается на всех страницах кабинета: profile, orders, sites,
 * support, tickets, notifications, settings. На ПК (≥981px) рисует
 * постоянный сайдбар слева с разделами и бейджами (активные заказы /
 * непрочитанные сообщения / истекающее обслуживание / непрочитанные
 * уведомления). На мобильных скрыт — там навигация через капсулу
 * nav.js (бургер) и обычный скролл страницы, без верхнего back-bar —
 * его каждая страница убирает сама.
 *
 * Подключается к уже существующему Firebase App той же логикой, что и
 * nav.js — ждёт getApps().length, не делает свой initializeApp(). 
 *
 * Каждая страница оборачивает свой контент в <div id="sbContent">...</div>
 * — sidebar.js найдёт этот узел и обернёт его вместе с собой в общий
 * флекс-контейнер. Если узел не найден — сайдбар просто вставляется
 * первым элементом body (страница сама отвечает за свою раскладку).
 */
(function () {
  const script = document.currentScript;
  const page   = script ? (script.getAttribute('data-page') || '') : '';
  const depth  = (window.location.pathname.replace(/\/+$/, '').match(/\//g) || []).length - 1;
  const b      = depth > 0 ? '../' : '';

  // Логотип-вордмарк antviz инлайн-SVG (currentColor) — красится под тему
  // через CSS (.sb-brand-logo{ color:var(--text) }), тёмная/светлая версия
  // не нужна отдельным файлом, это один и тот же путь, просто цвет разный.
  const LOGO_SVG = `<svg class="sb-brand-logo" viewBox="0 0 1692 484" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true"><g transform="translate(0,484) scale(0.1,-0.1)" fill="currentColor"><path d="M13107 4247 c-49 -14 -128 -91 -161 -155 -54 -106 -25 -237 70 -321 92 -81 177 -99 275 -60 164 64 227 226 151 391 -16 35 -40 73 -53 85 -62 56 -197 85 -282 60z"/><path d="M7857 3914 c-4 -4 -7 -505 -7 -1113 0 -1051 1 -1111 19 -1196 20 -93 63 -209 99 -267 11 -18 34 -55 51 -83 112 -186 306 -327 536 -391 l100 -28 444 -4 c277 -2 447 0 453 6 14 14 12 411 -3 428 -9 11 -76 14 -361 14 -322 0 -356 2 -439 21 -154 37 -281 131 -344 254 -77 152 -78 161 -82 788 -3 419 -1 562 8 573 9 12 81 14 430 14 247 0 428 4 443 10 l26 10 0 213 c0 152 -3 216 -12 225 -9 9 -121 12 -444 12 -335 0 -435 3 -441 13 -4 6 -10 122 -13 257 l-5 245 -226 3 c-124 1 -228 -1 -232 -4z"/><path d="M2090 3388 c-19 -5 -63 -15 -97 -22 -34 -7 -119 -42 -190 -76 -115 -57 -137 -73 -223 -156 -90 -88 -105 -109 -164 -234 -11 -25 -27 -52 -33 -61 -7 -8 -20 -38 -29 -65 -54 -169 -64 -279 -64 -696 0 -277 4 -379 15 -450 15 -85 60 -232 85 -275 5 -10 15 -29 20 -43 17 -40 58 -104 105 -164 44 -56 195 -172 283 -217 84 -43 175 -73 266 -89 65 -11 1114 -12 1276 -1 90 6 95 7 98 30 2 13 -6 36 -17 52 -12 15 -21 31 -21 35 0 4 -15 30 -34 58 -18 28 -57 96 -85 151 -29 55 -58 103 -64 107 -7 4 -226 8 -487 8 -439 0 -481 2 -548 20 -168 44 -316 187 -347 332 -4 18 -11 38 -15 43 -17 23 -21 105 -21 443 1 330 3 363 22 432 24 85 39 121 73 168 69 94 122 135 231 179 l70 28 680 0 680 0 5 -1045 c3 -575 6 -1046 8 -1047 1 -2 105 -3 231 -3 195 0 232 2 245 16 14 14 16 143 16 1273 0 964 -3 1260 -12 1269 -15 15 -1903 15 -1958 0z"/><path d="M5310 3390 c-132 -28 -199 -55 -328 -133 -84 -51 -163 -129 -245 -243 -74 -103 -121 -256 -143 -469 -21 -193 -17 -1681 4 -1702 19 -19 445 -19 460 0 8 9 12 275 15 847 3 763 5 840 21 895 35 119 130 236 230 285 124 61 137 62 679 58 l492 -4 63 -28 c124 -54 198 -122 258 -239 47 -89 47 -94 51 -971 2 -582 7 -834 14 -843 16 -18 449 -19 467 -1 9 9 12 208 12 833 0 857 2 815 -40 1021 -28 134 -93 272 -181 383 -80 99 -162 166 -269 217 -41 20 -84 41 -95 47 -11 6 -36 14 -55 18 -19 3 -62 14 -95 23 -52 14 -136 16 -670 15 -335 -1 -626 -5 -645 -9z"/><path d="M9603 3385 c-6 -18 15 -68 106 -245 133 -260 538 -1068 567 -1130 16 -36 61 -126 98 -200 38 -74 77 -153 87 -175 10 -22 60 -128 112 -235 53 -107 127 -262 166 -345 39 -82 79 -166 88 -185 l18 -35 229 -3 c198 -2 231 0 247 14 17 15 67 112 184 359 31 66 61 127 66 135 5 8 18 33 28 55 10 22 42 90 70 150 28 61 56 119 63 130 27 46 148 294 148 303 0 5 25 56 55 113 31 57 69 133 86 169 27 58 140 289 272 555 25 50 68 135 96 190 134 264 181 369 170 382 -9 10 -67 13 -263 13 -138 0 -256 -4 -262 -8 -18 -12 -194 -360 -194 -384 0 -7 -13 -38 -29 -68 -91 -177 -127 -252 -191 -391 -40 -84 -96 -210 -127 -279 -30 -69 -58 -133 -63 -142 -39 -71 -149 -298 -155 -318 -9 -32 -122 -264 -152 -312 -13 -21 -30 -38 -37 -38 -13 0 -124 214 -216 415 -17 39 -71 151 -120 250 -193 395 -241 495 -298 620 -33 72 -71 150 -86 175 -14 25 -30 55 -35 67 -6 12 -33 70 -62 130 -28 59 -69 145 -90 189 -21 45 -46 85 -55 88 -8 3 -128 6 -265 6 -215 0 -250 -2 -256 -15z"/><path d="M12966 3384 c-14 -14 -16 -142 -16 -1265 0 -843 3 -1257 10 -1270 10 -18 23 -19 233 -19 160 0 226 3 235 12 9 9 12 306 12 1275 0 1238 0 1262 -19 1273 -12 6 -104 10 -230 10 -177 0 -212 -2 -225 -16z"/><path d="M14043 3393 c-16 -6 -18 -419 -3 -443 8 -13 101 -16 702 -20 671 -5 693 -6 696 -24 2 -10 -3 -23 -11 -27 -8 -5 -41 -41 -73 -81 -33 -40 -111 -136 -174 -213 -133 -161 -205 -251 -308 -379 -41 -50 -90 -109 -110 -131 -21 -22 -64 -74 -97 -116 -111 -142 -189 -240 -295 -366 -58 -69 -129 -157 -158 -195 -29 -38 -82 -106 -117 -151 -35 -45 -82 -105 -105 -134 l-40 -52 0 -109 c0 -91 3 -111 16 -116 9 -3 536 -6 1173 -6 887 0 1160 3 1169 12 17 17 17 409 0 426 -9 9 -199 12 -795 12 -657 0 -783 2 -783 14 0 7 24 41 53 74 146 169 252 295 309 369 110 142 220 276 269 328 26 28 67 75 91 106 57 75 272 330 337 399 28 30 51 58 51 61 0 10 257 321 322 390 13 14 52 59 85 100 l61 75 0 87 c1 65 -3 90 -14 102 -14 13 -141 15 -1127 14 -612 0 -1118 -3 -1124 -6z"/></g></svg>`;

  const CSS = `
    :root{
      --sb-w: 260px;
      --sb-gap: 16px;
    }

    /* Страница снова обычная — скроллится целиком, футер (подключается
       отдельным footer.js на каждой странице) остаётся в нормальном
       потоке документа под sb-shell. */
    html, body{ margin:0; background:var(--bg, var(--card-elevated,#eceef1)); }

    /* App-frame: серая рамка на весь экран. Сайдбар — часть этой рамки
       (тот же фон, без своей карточки), рабочая область — единственный
       элемент, который визуально выделяется. */
    .sb-shell{
      display:flex; align-items:stretch;
      height:100vh; width:100%;
    }

    /* Сайдбар — отдельная плавающая панель, та же оформа, что и
       рабочая область (свой фон, бордер, скругление), с таким же
       зазором от рамки сверху/снизу/слева, что и у .sb-content
       справа/сверху/снизу. Прилипает при скролле страницы
       (position:sticky). */
    .sb-nav{
      position:sticky; top:0; flex-shrink:0;
      width:var(--sb-w); height:calc(100vh - var(--sb-gap) * 2);
      background:var(--card, var(--bg,#fff));
      border:1px solid var(--border, var(--stroke,#dfe3e8));
      border-radius:32px;
      display:flex; flex-direction:column;
      margin:var(--sb-gap) var(--sb-gap) var(--sb-gap) var(--sb-gap);
      padding:8px 14px 20px;
      overflow-y:auto; overscroll-behavior:contain;
    }
    .sb-nav::-webkit-scrollbar{ width:0; }

    /* Лого/выход на главную сайта — раньше эту роль играла плавающая
       капсула nav.js, на десктопе в кабинете она теперь скрыта. */
    .sb-brand{
      display:flex; align-items:center;
      padding:8px 10px 20px; margin-bottom:8px;
      border-bottom:1px solid var(--border, var(--stroke,#dfe3e8));
      text-decoration:none;
    }
    /* Вордмарк вместо favicon+текста — currentColor берёт цвет из
       --text, поэтому логотип сам следует за темой (тёмный на светлой,
       белый на тёмной), без отдельного файла под каждую тему. */
    .sb-brand-logo{ height:30px; width:auto; flex-shrink:0; color:var(--text,#191b1e); display:block; }
    .sb-brand-row{ display:flex; align-items:center; gap:6px; padding:4px 4px 20px; margin-bottom:8px; border-bottom:1px solid var(--border, var(--stroke,#dfe3e8)); }
    .sb-brand-row .sb-brand{ padding:4px 6px; margin:0; border:none; flex:1; min-width:0; }

    /* Кнопка сворачивания текста — иконка-переключатель рядом с лого.
       Специально крупнее остальных элементов сайдбара — это главный
       переключатель режима, должен бросаться в глаза и легко ловиться
       курсором/пальцем. */
    .sb-collapse-btn{
      display:flex; align-items:center; justify-content:center;
      width:48px; height:48px; flex-shrink:0;
      border-radius:13px; border:none; background:none; cursor:pointer;
      color:var(--muted, var(--text-dim,#707a8a));
      transition:background .15s, color .15s;
    }
    .sb-collapse-btn:hover{ background:var(--bg,#fff); color:var(--text,#191b1e); }
    .sb-collapse-btn svg{ width:24px; height:24px; stroke:currentColor; stroke-width:1.7; fill:none; }
    .sb-collapse-btn .sb-ico-expand{ display:none; }

    .sb-nav-main{ display:flex; flex-direction:column; gap:3px; }
    .sb-nav-bottom{ display:flex; flex-direction:column; gap:3px; margin-top:auto; padding-top:14px; }

    .sb-link{
      position:relative;
      display:flex; align-items:center; gap:13px;
      padding:.6rem 1rem .6rem .6rem; border-radius:14px;
      color:var(--muted, var(--text-dim,#707a8a)); text-decoration:none;
      font-family:'Geologica','Inter','Arial',sans-serif; font-weight:400; font-size:.92rem;
      background:none; border:none; cursor:pointer; width:100%; text-align:left;
      transition:background .15s, color .15s;
    }
    .sb-link-ico{
      width:36px; height:36px; flex-shrink:0; border-radius:11px;
      display:flex; align-items:center; justify-content:center;
      background:var(--bg2, var(--card-elevated,#f2f4f7));
      transition:background .15s, color .15s, box-shadow .15s, transform .15s;
    }
    .sb-link-ico svg{ width:18px; height:18px; stroke:currentColor; stroke-width:1.8; flex-shrink:0; fill:none; }
    .sb-link:hover{ background:var(--bg2, var(--card-elevated,#f2f4f7)); color:var(--text,#191b1e); }
    .sb-link:hover .sb-link-ico:not([class*="sb-c-"]){ background:var(--bg,#fff); box-shadow:0 6px 14px -8px rgba(25,27,30,.2); }
    .sb-link.is-active{ background:var(--bg2, var(--card-elevated,#f2f4f7)); color:var(--text,#191b1e); font-weight:500; }
    .sb-link.is-active .sb-link-ico:not([class*="sb-c-"]){ background:var(--text,#191b1e); color:var(--green,#1ede7b); box-shadow:0 8px 18px -8px rgba(25,27,30,.4); }
    .sb-link-label{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    /* Цветные иконки меню — у каждого раздела свой акцентный градиент,
       иконка всегда белая поверх цвета для чёткого контраста. */
    .sb-link-ico[class*="sb-c-"]{ color:#fff; }
    .sb-link-ico[class*="sb-c-"] svg{ stroke:#fff; }
    .sb-link:hover .sb-link-ico[class*="sb-c-"]{ transform:scale(1.06); box-shadow:0 8px 16px -6px rgba(25,27,30,.35); }
    .sb-link.is-active .sb-link-ico[class*="sb-c-"]{ color:#fff; transform:scale(1.06); box-shadow:0 8px 18px -6px rgba(25,27,30,.4); }
    .sb-c-blue{ background:linear-gradient(135deg,#5b8cff,#2f6bff); }
    .sb-c-green{ background:linear-gradient(135deg,#4eea94,#149955); }
    .sb-c-teal{ background:linear-gradient(135deg,#3fe0d8,#0fc7c0); }
    .sb-c-purple{ background:linear-gradient(135deg,#a970ff,#8b3ffb); }
    .sb-c-orange{ background:linear-gradient(135deg,#ffab4d,#ff8a1f); }
    .sb-c-pink{ background:linear-gradient(135deg,#ff6fac,#ff3f8f); }
    .sb-c-yellow{ background:linear-gradient(135deg,#ffd75c,#ffc324); }
    .sb-c-indigo{ background:linear-gradient(135deg,#8b93ff,#5b63f0); }
    .sb-c-red{ background:linear-gradient(135deg,#ff7a7a,#e8634f); }
    .sb-badge{
      margin-left:auto; background:var(--green,#1ede7b); color:#191b1e;
      font-size:.64rem; font-weight:500; padding:.16rem .48rem; border-radius:7px;
      min-width:19px; text-align:center; flex-shrink:0;
    }
    .sb-badge.warn{ background:#f59e0b; color:#1a1400; }
    .sb-sep{ height:1px; background:var(--border, var(--stroke,#dfe3e8)); margin:10px 6px; flex-shrink:0; }
    .sb-link.danger{ color:#d95a48; }
    .sb-link.danger:hover{ background:none; color:#c44432; }
    .sb-link.danger .sb-link-ico:not([class*="sb-c-"]){ color:#d95a48; }
    .sb-link.danger:hover .sb-link-ico:not([class*="sb-c-"]){ background:rgba(232,99,79,.1); }

    /* Свёрнутое состояние — только иконки. Переключается кнопкой у
       лого, состояние держится в localStorage (см. JS ниже). */
    .sb-nav.is-collapsed{ width:84px; padding-left:10px; padding-right:10px; }
    .sb-nav.is-collapsed .sb-brand-row{ justify-content:center; padding-left:0; padding-right:0; }
    .sb-nav.is-collapsed .sb-brand{ display:none; }
    .sb-nav.is-collapsed .sb-link{ justify-content:center; gap:0; padding-left:0; padding-right:0; }
    .sb-nav.is-collapsed .sb-link-label{ display:none; }
    .sb-nav.is-collapsed .sb-collapse-btn .sb-ico-collapse{ display:none; }
    .sb-nav.is-collapsed .sb-collapse-btn .sb-ico-expand{ display:flex; }
    .sb-nav{ transition:width .18s ease; }

    /* Бейдж в свёрнутом виде — превращается в маленькую точку поверх
       иконки вместо цифры (иначе некуда её помещать). */
    .sb-nav.is-collapsed .sb-badge{
      position:absolute; top:4px; right:15px;
      width:9px; height:9px; min-width:0; padding:0; border-radius:50%;
      font-size:0; line-height:0; overflow:hidden;
    }

    /* Кастомная подсказка при наведении на иконку в свёрнутом виде —
       рисуется одним общим элементом, позиционируется через JS
       (position:fixed), чтобы не обрезаться overflow сайдбара. */
    .sb-tooltip{
      position:fixed; top:0; left:0; z-index:60;
      background:var(--text,#191b1e); color:#fff;
      font-family:'Geologica','Inter','Arial',sans-serif; font-size:.8rem; font-weight:400;
      padding:.42rem .7rem; border-radius:9px; white-space:nowrap;
      pointer-events:none; opacity:0; transform:translateY(-50%);
      transition:opacity .12s ease;
    }
    .sb-tooltip.is-visible{ opacity:1; }

    /* Приветственная плашка при первом заходе — объясняет назначение
       кнопки. Показывается один раз (флаг в localStorage), закрывается
       крестиком или сама через 20 секунд. */
    .sb-brand-row{ position:relative; }
    .sb-collapse-hint{
      position:absolute; top:100%; right:0; margin-top:10px; width:216px;
      background:var(--card, var(--bg,#fff)); border:1px solid var(--border, var(--stroke,#dfe3e8));
      border-radius:14px; padding:.75rem 1.6rem .75rem .9rem;
      box-shadow:0 10px 28px rgba(25,27,30,.12);
      font-family:'Geologica','Inter','Arial',sans-serif; font-size:.78rem; line-height:1.4;
      color:var(--text,#191b1e); z-index:40;
      opacity:0; transform:translateY(-6px); pointer-events:none;
      transition:opacity .18s ease, transform .18s ease;
    }
    .sb-collapse-hint.is-visible{ opacity:1; transform:translateY(0); pointer-events:auto; }
    .sb-collapse-hint::before{
      content:''; position:absolute; top:-6px; right:15px; width:11px; height:11px;
      background:var(--card, var(--bg,#fff)); border-left:1px solid var(--border, var(--stroke,#dfe3e8));
      border-top:1px solid var(--border, var(--stroke,#dfe3e8)); transform:rotate(45deg);
    }
    .sb-collapse-hint-close{
      position:absolute; top:6px; right:6px; width:20px; height:20px;
      display:flex; align-items:center; justify-content:center;
      border:none; background:none; cursor:pointer; border-radius:50%;
      color:var(--muted, var(--text-dim,#707a8a)); font-size:1rem; line-height:1; padding:0;
    }
    .sb-collapse-hint-close:hover{ background:var(--bg2, var(--card-elevated,#eceef1)); color:var(--text,#191b1e); }

    /* Рабочая область — плавающая панель приложения: отступы от рамки
       сверху/справа/снизу, вплотную к сайдбару слева, скругления по
       всем углам, собственный (не рамочный) фон. Читаемый максимум
       держит внутренний .shell, чтобы текст не растягивался на
       сверхширoких мониторах. */
    .sb-content{
      flex:1; min-width:0;
      height:calc(100vh - var(--sb-gap) * 2);
      overflow-y:auto; -webkit-overflow-scrolling:touch;
      margin:var(--sb-gap) var(--sb-gap) var(--sb-gap) var(--sb-gap);
      background:var(--card, var(--bg,#fff));
      border:1px solid var(--border, var(--stroke,#dfe3e8));
      border-radius:32px;
      padding:20px 56px 60px;
    }
    .sb-content > .shell{ max-width:1240px; margin:0 auto; }

    /* На десктопе капсула nav.js больше не нужна — её роль (профиль,
       уведомления, выход) уже покрывает сайдбар, а переход на главную
       сайта теперь через .sb-brand. На мобильных сайдбар скрыт, поэтому
       капсула возвращается как единственная навигация. */
    .antviz-nav{ display:none; }

    /* nav.js всегда добавляет body{padding-top:104px} под свою плавающую
       капсулу — на десктопе кабинета капсула скрыта (см. выше), но сам
       паддинг остаётся, если его не отменить явно. Отменяем только на
       десктопе: на мобильных капсула видима и паддинг под неё нужен. */
    @media (min-width:981px){
      body{ padding-top:0 !important; }
    }

    @media (max-width:980px){
      .antviz-nav{ display:flex; }
      .sb-nav{ display:none; }
      .sb-shell{ display:block; height:auto; }
      .sb-content{
        height:auto; overflow-y:visible;
        margin:0; border:none; border-radius:0;
        background:var(--bg,#fff);
        padding:88px 1.2rem 80px;
      }
    }

    /* Мобильное нижнее меню — плавающая капсула как в мокапе (не во всю
       ширину экрана, с отступами по бокам). Только на мобильных, ПК не
       трогает. Пункты — те же NAV_ITEMS, что и в десктопном сайдбаре,
       без "Новый заказ" (он уже есть на главной) и без "Выйти" (переезжает
       в настройки, только на мобильных). Тема — через var(--card)/
       var(--green)/var(--stroke) страницы, свой JS для темы не нужен. */
    .sb-bottom-nav{
      display:none;
      position:fixed; bottom:16px; left:50%; transform:translateX(-50%);
      width:calc(100% - 32px); max-width:420px;
      background:var(--card, var(--bg,#fff));
      border:1px solid var(--border, var(--stroke,#dfe3e8));
      border-radius:24px;
      padding:8px 6px;
      justify-content:space-around; align-items:center;
      box-shadow:0 12px 30px rgba(0,0,0,.18);
      z-index:850;
    }
    .sb-bnav-item{
      display:flex; align-items:center; justify-content:center;
      width:40px; height:40px; border-radius:14px; flex-shrink:0;
      color:var(--muted, var(--text-dim,#707a8a));
      text-decoration:none;
    }
    .sb-bnav-item svg{ width:19px; height:19px; }
    .sb-bnav-item.is-active{
      color:var(--green-text, var(--green,#1ede7b));
      background:var(--green-dim, rgba(30,222,123,.14));
    }
    @media (max-width:980px){ .sb-bottom-nav{ display:flex; } }
  `;

  const NAV_ITEMS = [
    { key:'profile',       href:b+'profile',               icon:'<rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2"/><rect x="13" y="3.5" width="7.5" height="7.5" rx="2"/><rect x="3.5" y="13" width="7.5" height="7.5" rx="2"/><rect x="13" y="13" width="7.5" height="7.5" rx="2"/>', label:'Обзор', color:'blue' },
    { key:'orders',        href:b+'profile/orders',        icon:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 9.5h8M8 13h8M8 16.5h4.5"/>', label:'Мои заказы', badgeKey:'orders', color:'green' },
    { key:'sites',         href:b+'profile/sites',         icon:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z"/>', label:'Мои сайты', color:'teal' },
    { key:'support',       href:b+'profile/support',       icon:'<path d="M20.5 11.5a8.5 8.5 0 01-12.4 7.55L4 20l1.02-3.9a8.5 8.4 0 1115.48-4.6z"/>', label:'Чат с командой', badgeKey:'support', color:'purple' },
    { key:'tickets',       href:b+'profile/tickets',       icon:'<path d="M14.5 6.2a3.6 3.6 0 00-4.9 4.66l-5.6 5.6a1.9 1.9 0 002.7 2.7l5.6-5.6a3.6 3.6 0 004.66-4.9l-2.53 2.53-2-2z"/>', label:'Обслуживание', badgeKey:'tickets', color:'orange' },
    { key:'notifications', href:b+'profile/notifications', icon:'<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>', label:'Уведомления', badgeKey:'notif', color:'pink' },
    { key:'order',         href:b+'order',                 icon:'<path d="M12 5v14M5 12h14"/>', label:'Новый заказ', color:'yellow' },
    { sep:true },
    { key:'settings',      href:b+'profile/settings',      icon:'<circle cx="12" cy="12" r="2.7"/><path d="M19.1 14.6a1.5 1.5 0 00.3 1.65l.05.06a1.75 1.75 0 11-2.48 2.48l-.06-.05a1.5 1.5 0 00-1.65-.3 1.5 1.5 0 00-.9 1.37V20a1.75 1.75 0 01-3.5 0v-.08a1.5 1.5 0 00-.9-1.38 1.5 1.5 0 00-1.65.3l-.06.06a1.75 1.75 0 11-2.48-2.48l.05-.06a1.5 1.5 0 00.3-1.65 1.5 1.5 0 00-1.37-.9H4a1.75 1.75 0 010-3.5h.08a1.5 1.5 0 001.38-.9 1.5 1.5 0 00-.3-1.65l-.05-.06A1.75 1.75 0 117.59 5.3l.06.05a1.5 1.5 0 001.65.3H9.4a1.5 1.5 0 00.9-1.37V4a1.75 1.75 0 013.5 0v.08a1.5 1.5 0 00.9 1.38 1.5 1.5 0 001.65-.3l.06-.06a1.75 1.75 0 112.48 2.48l-.05.06a1.5 1.5 0 00-.3 1.65V9.4a1.5 1.5 0 001.37.9H20a1.75 1.75 0 010 3.5h-.08a1.5 1.5 0 00-1.38.9z"/>', label:'Настройки', color:'indigo' },
    { key:'logout',        logout:true, icon:'<path d="M9 4H6.5A2.5 2.5 0 004 6.5v11A2.5 2.5 0 006.5 20H9"/><path d="M20 12H10.5"/><path d="M16 8l4 4-4 4"/>', label:'Выйти', color:'red' },
  ];

  function renderItem(item) {
    const active = item.key === page ? ' is-active' : '';
    const badge = item.badgeKey ? `<span class="sb-badge" data-badge-key="${item.badgeKey}" style="display:none"></span>` : '';
    const label = `<span class="sb-link-label">${item.label}</span>`;
    const icon = `<span class="sb-link-ico${item.color ? ' sb-c-' + item.color : ''}"><svg viewBox="0 0 24 24">${item.icon}</svg></span>`;
    if (item.logout) {
      return `<button class="sb-link danger" data-logout aria-label="${item.label}">${icon}${label}</button>`;
    }
    return `<a href="${item.href}" class="sb-link${active}" aria-label="${item.label}">${icon}${label}${badge}</a>`;
  }

  function buildNav() {
    const sepIdx = NAV_ITEMS.findIndex(i => i.sep);
    const main   = sepIdx === -1 ? NAV_ITEMS : NAV_ITEMS.slice(0, sepIdx);
    const bottom = sepIdx === -1 ? [] : NAV_ITEMS.slice(sepIdx + 1);
    return `
      <div class="sb-nav-main">${main.map(renderItem).join('')}</div>
      <div class="sb-nav-bottom"><div class="sb-sep"></div>${bottom.map(renderItem).join('')}</div>
    `;
  }

  function init() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const existingContent = document.getElementById('sbContent');

    const collapsed = localStorage.getItem('sb-collapsed') === '1';
    const hintSeen  = localStorage.getItem('sb-collapse-hint-seen') === '1';

    const shell = document.createElement('div');
    shell.className = 'sb-shell';
    shell.innerHTML = `<nav class="sb-nav${collapsed ? ' is-collapsed' : ''}" id="sbNav">
      <div class="sb-brand-row">
        <a class="sb-brand" href="${b || '/'}" aria-label="Antviz">
          ${LOGO_SVG}
        </a>
        <button class="sb-collapse-btn" id="sbCollapseBtn" type="button" aria-label="Свернуть/развернуть меню">
          <svg class="sb-ico-collapse" viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="15" rx="4"/><path d="M9.5 4.5v15"/><path d="M15 9.5l-2.2 2.5 2.2 2.5"/></svg>
          <svg class="sb-ico-expand" viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="15" rx="4"/><path d="M9.5 4.5v15"/><path d="M13.3 9.5l2.2 2.5-2.2 2.5"/></svg>
        </button>
        ${!collapsed && !hintSeen ? `
        <div class="sb-collapse-hint" id="sbCollapseHint">
          <button class="sb-collapse-hint-close" id="sbCollapseHintClose" type="button" aria-label="Закрыть подсказку">×</button>
          Эта кнопка сворачивает меню — останутся только иконки
        </div>` : ''}
      </div>
      ${buildNav()}
    </nav>`;

    if (existingContent) {
      existingContent.classList.add('sb-content');
      existingContent.parentNode.insertBefore(shell, existingContent);
      shell.appendChild(existingContent);
    } else {
      // Нет размеченного контейнера — просто вставляем сайдбар первым
      // элементом в body, страница сама отвечает за свою раскладку.
      document.body.insertBefore(shell, document.body.firstChild);
    }

    const navEl = document.getElementById('sbNav');

    // --- Мобильное нижнее меню: плавающая капсула, отдельно от .sb-shell.
    //     "Новый заказ" не дублируем (он уже на главной), "Выйти" сюда
    //     не выносим (мобильный логаут — в настройках, отдельная задача).
    const bottomItems = NAV_ITEMS.filter(i => !i.sep && i.key !== 'order' && !i.logout);
    const bottomNav = document.createElement('nav');
    bottomNav.className = 'sb-bottom-nav';
    bottomNav.id = 'sbBottomNav';
    bottomNav.innerHTML = bottomItems.map(item => {
      const active = item.key === page ? ' is-active' : '';
      return `<a href="${item.href}" class="sb-bnav-item${active}" aria-label="${item.label}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${item.icon}</svg></a>`;
    }).join('');
    document.body.appendChild(bottomNav);

    function toggleCollapse() {
      const nowCollapsed = navEl.classList.toggle('is-collapsed');
      localStorage.setItem('sb-collapsed', nowCollapsed ? '1' : '0');
      dismissHint();
      return nowCollapsed;
    }

    // --- Приветственная подсказка при первом заходе ---
    let hintTimer = null;
    function dismissHint() {
      const hint = document.getElementById('sbCollapseHint');
      if (!hint) return;
      hint.classList.remove('is-visible');
      localStorage.setItem('sb-collapse-hint-seen', '1');
      if (hintTimer) { clearTimeout(hintTimer); hintTimer = null; }
    }
    const hintEl = document.getElementById('sbCollapseHint');
    if (hintEl) {
      requestAnimationFrame(() => setTimeout(() => hintEl.classList.add('is-visible'), 300));
      hintTimer = setTimeout(dismissHint, 20000);
      document.getElementById('sbCollapseHintClose')?.addEventListener('click', (e) => {
        e.stopPropagation();
        dismissHint();
      });
    }

    // --- Кнопка сворачивания + двойной клик по лого ---
    document.getElementById('sbCollapseBtn')?.addEventListener('click', toggleCollapse);
    document.querySelector('.sb-brand')?.addEventListener('dblclick', (e) => {
      e.preventDefault();
      toggleCollapse();
    });

    // --- Клавиатурный шорткат Ctrl/Cmd+B ---
    document.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapse();
      }
    });

    // --- Кастомные подсказки при наведении на иконки в свёрнутом виде ---
    const tooltip = document.createElement('div');
    tooltip.className = 'sb-tooltip';
    document.body.appendChild(tooltip);
    shell.querySelectorAll('.sb-link').forEach(link => {
      link.addEventListener('mouseenter', () => {
        if (!navEl.classList.contains('is-collapsed')) return;
        const label = link.getAttribute('aria-label');
        if (!label) return;
        const rect = link.getBoundingClientRect();
        tooltip.textContent = label;
        tooltip.style.left = (rect.right + 10) + 'px';
        tooltip.style.top = (rect.top + rect.height / 2) + 'px';
        tooltip.classList.add('is-visible');
      });
      link.addEventListener('mouseleave', () => tooltip.classList.remove('is-visible'));
      link.addEventListener('click', () => tooltip.classList.remove('is-visible'));
    });

    document.querySelectorAll('[data-logout]').forEach(btn => btn.addEventListener('click', async () => {
      try {
        const authMod = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
        const appMod  = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
        if (appMod.getApps().length) {
          await authMod.signOut(authMod.getAuth(appMod.getApp()));
        }
      } catch (e) { console.error('sidebar.js signOut:', e); }
      window.location.href = b || '/';
    }));
  }

  function setBadge(key, value, variant) {
    document.querySelectorAll(`[data-badge-key="${key}"]`).forEach(el => {
      if (!value) { el.style.display = 'none'; return; }
      el.className = 'sb-badge' + (variant ? ' ' + variant : '');
      el.textContent = String(value);
      el.style.display = 'inline-block';
    });
  }

  // Подписки на бейджи — те же данные, что и в nav.js, но отдельная
  // подписка (sidebar.js и nav.js работают независимо, оба могут быть
  // на странице одновременно).
  function watchBadges(db, fsMod, user) {
    const { collection, query, where, onSnapshot } = fsMod;

    onSnapshot(
      query(collection(db, 'chats', user.uid, 'messages'), where('sender', '==', 'admin'), where('readByUser', '==', false)),
      snap => setBadge('support', snap.size, 'warn'),
      () => {}
    );

    onSnapshot(
      query(collection(db, 'notifications', user.uid, 'items'), where('read', '==', false)),
      snap => setBadge('notif', snap.size, 'warn'),
      () => {}
    );

    onSnapshot(
      query(collection(db, 'orders'), where('uid', '==', user.uid)),
      snap => {
        const orders = snap.docs.map(d => d.data());
        const active = orders.filter(o => (o.status || 0) >= 1 && (o.status || 0) <= 4).length;
        setBadge('orders', active, null);

        const activeSupport = orders.find(o =>
          o.supportActive && o.supportExpiresAt?.toDate &&
          o.supportExpiresAt.toDate() > new Date()
        );
        if (activeSupport) {
          const daysLeft = Math.ceil((activeSupport.supportExpiresAt.toDate() - new Date()) / (1000 * 60 * 60 * 24));
          setBadge('tickets', daysLeft <= 2 ? '!' : 0, 'warn');
        } else {
          setBadge('tickets', 0, null);
        }
      },
      () => {}
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
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
      if (appMod.getApps().length === 0) return;

      const app  = appMod.getApp();
      const auth = authMod.getAuth(app);
      const db   = fsMod.getFirestore(app);

      authMod.onAuthStateChanged(auth, user => {
        if (user) watchBadges(db, fsMod, user);
      });
    } catch (e) {
      console.error('sidebar.js auth error:', e);
    }
  })();
})();
