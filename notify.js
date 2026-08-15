/**
 * notify.js — всплывающее объявление личного кабинета Antviz
 *
 * Подключение (на любой странице кабинета):
 *   <script src="notify.js"></script>
 * И всё. Больше ничего вставлять не нужно — текст и настройки ниже, в этом файле.
 *
 * ═══════════════════════════════════════════════════════════════
 *  ЧТО МЕНЯТЬ, КОГДА НУЖНО ПОКАЗАТЬ НОВОЕ ОБЪЯВЛЕНИЕ — СМОТРИ НИЖЕ
 * ═══════════════════════════════════════════════════════════════
 */

const NOTIFY_CONFIG = {
  // id — "метка версии". Меняешь текст/буллеты ниже — обязательно
  // поменяй и id (например 'whitelist-2026-07' -> 'whitelist-2026-08'),
  // иначе те, кто уже нажал «Не показывать снова», не увидят обновление.
  id: 'tg-bot-1',

  eyebrow: 'Новое',                      // маленький бейдж сверху ('' — чтобы убрать)
  title: 'У нас появился Telegram-бот',   // крупный заголовок

  // Буллеты слева, как на референсе. icon: 'bell' | 'status' | 'zap' | 'check'
  bullets: [
    { icon: 'bell', text: 'Подключите уведомления — они будут приходить прямо в Telegram, как только что-то меняется по вашему заказу.' },
    { icon: 'status', text: 'Смотрите статусы заказов в реальном времени, не заходя в личный кабинет.' },
    { icon: 'zap', text: 'В боте много других полезных функций — постепенно будем добавлять ещё.' }
  ],

  // Текст-подсказка под буллетами (можно оставить пустым '')
  footnote: '',

  primaryText: 'Подключить в настройках',                // текст тёмной кнопки
  primaryHref: 'https://antviz.ru/profile/settings',                     // если нужна ссылка вместо простого закрытия — впиши сюда URL

  dontShowAgainText: 'Не показывать снова', // текстовая кнопка-ссылка под основной кнопкой ('' или null — убрать)

  // persist управляет тем, что делает КРЕСТИК и кнопка "Понятно":
  //   false    — просто закрывают окно, при следующей загрузке страницы оно появится снова.
  //              (Кнопка "Не показывать снова" всё равно работает и запоминает навсегда.)
  //   'session'— закрытие прячет окно до конца вкладки браузера (снова покажется в новой вкладке).
  //   'local'  — закрытие запоминает навсегда, как и кнопка "Не показывать снова".
  //
  // Сейчас стоит false — окно будет всплывать при каждой загрузке страницы, пока
  // пользователь сам не нажмёт "Не показывать снова". Удобно, пока объявление актуально.
  persist: false,

  delay: 400                             // задержка перед появлением, в миллисекундах
};

/* ═══════════════════════════════════════════════════════════════
 *  Дальше — код самого компонента, трогать не нужно
 * ═══════════════════════════════════════════════════════════════ */
(function () {
  const STORAGE_PREFIX = 'antviz_notify_seen_';       // постоянный флаг (кнопка "Не показывать снова")
  const SESSION_PREFIX = 'antviz_notify_session_';    // временный флаг (persist:'session')

  const ICONS = {
    bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
    status: '<path d="M12 22V12"/><path d="m16 17 2 2 4-4"/><path d="M21 11.127V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l1.32-.753"/><path d="M3.29 7 12 12l8.71-5"/><path d="m7.5 4.27 8.997 5.148"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    check: '<circle cx="12" cy="12" r="10"/><path d="M8 12l2.5 2.5L16 9"/>'
  };

  // Иконка для правой (тёмной) панели — настоящий логотип Telegram
  // (Bootstrap Icons, bi-telegram), перекрашенный в фирменный градиент.
  const PANEL_ICON = `
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="an-tg-grad" x1="0" y1="0" x2="16" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#2AABEE"/>
          <stop offset="1" stop-color="#229ED9"/>
        </linearGradient>
      </defs>
      <circle cx="8" cy="8" r="8" fill="#fff"/>
      <path fill="url(#an-tg-grad)" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09"/>
    </svg>`;

  const CSS = `
    .an-overlay{
      position:fixed; inset:0; z-index:999999;
      background:rgba(25,27,30,.5); backdrop-filter:blur(4px);
      display:flex; align-items:center; justify-content:center; padding:24px;
      opacity:0; pointer-events:none;
      transition:opacity .35s cubic-bezier(.16,1,.3,1);
      font-family:var(--font,'Geologica','Arial',sans-serif);
      letter-spacing:-.01em;
    }
    .an-overlay.show{ opacity:1; pointer-events:auto; }

    .an-card{
      position:relative; width:100%; max-width:860px;
      background:var(--bg,#fff); border:1px solid var(--stroke,#dfe3e8); border-radius:40px;
      box-shadow:var(--sh2,0 8px 20px rgba(0,51,153,.08),0 4px 8px rgba(0,51,153,.08));
      display:flex; overflow:hidden;
      transform:scale(.94) translateY(10px); opacity:0;
      transition:transform .4s cubic-bezier(.16,1,.3,1), opacity .35s cubic-bezier(.16,1,.3,1);
    }
    .an-overlay.show .an-card{ transform:scale(1) translateY(0); opacity:1; }

    .an-close{
      position:absolute; top:18px; right:18px; z-index:2; width:40px; height:40px; border-radius:14px;
      background:var(--bg3,#f9fafc); border:1px solid var(--stroke,#dfe3e8); display:flex; align-items:center; justify-content:center;
      cursor:pointer; color:var(--text,#191b1e); transition:border-color .15s;
    }
    .an-close:hover{ border-color:var(--stroke,#cbcdd6); }
    .an-close svg{ width:16px; height:16px; stroke:currentColor; stroke-width:1.8; fill:none; }

    .an-content{
      flex:1 1 56%; padding:48px 44px 40px; display:flex; flex-direction:column; min-width:0;
    }
    .an-visual{
      flex:0 0 42%; background:var(--dark,#191b1e);
      display:flex; align-items:center; justify-content:center; padding:30px;
    }
    .an-visual svg{ width:100%; max-width:150px; height:auto; }

    .an-eyebrow{
      display:inline-flex; align-self:flex-start;
      background:var(--green-dim,#d2f8e5); color:var(--green-text,#149955);
      font-size:12px; font-weight:500; padding:6px 14px; border-radius:100px;
      margin-bottom:20px;
    }
    .an-title{
      font-size:clamp(24px,3vw,30px); font-weight:500; letter-spacing:-.03em; line-height:1.15; color:var(--text,#191b1e);
      margin-bottom:24px;
    }

    .an-bullets{ display:flex; flex-direction:column; gap:16px; margin-bottom:20px; }
    .an-bullet{ display:flex; align-items:flex-start; gap:14px; }
    .an-bullet-icon{
      flex:0 0 auto; width:32px; height:32px; border-radius:12px; background:var(--bg3,#f9fafc);
      border:1px solid var(--stroke,#dfe3e8); display:flex; align-items:center; justify-content:center; margin-top:1px;
    }
    .an-bullet-icon svg{ width:16px; height:16px; stroke:var(--green-text,#149955); stroke-width:1.8; fill:none; }
    .an-bullet-text{ font-size:14px; color:var(--text,#191b1e); font-weight:300; line-height:1.5; letter-spacing:-.01em; }

    .an-footnote{
      font-size:13px; color:var(--text-dim,#707a8a); font-weight:300; line-height:1.5;
      border-top:1px solid var(--stroke,#dfe3e8); padding-top:16px; margin-bottom:24px;
    }

    .an-actions{ margin-top:auto; display:flex; flex-direction:column; align-items:flex-start; gap:12px; }
    .an-btn{
      display:inline-flex; align-items:center; justify-content:center; gap:8px; width:100%;
      font-family:inherit; font-weight:500; text-decoration:none; cursor:pointer; border:none;
      border-radius:12px; padding:15px 26px; font-size:15px;
      transition:background .1s, transform .12s;
    }
    .an-btn:hover{ transform:translateY(-1px); }
    .an-btn-dark{ background:var(--dark,#191b1e); color:#fff; }
    .an-btn-dark:hover{ background:var(--dark2,#2b2f33); }

    .an-dismiss{
      background:none; border:none; cursor:pointer; font-family:inherit;
      font-size:13px; font-weight:300; color:var(--text-dim,#707a8a); text-decoration:underline;
      text-underline-offset:3px; padding:2px; align-self:center; margin:0 auto;
    }
    .an-dismiss:hover{ color:var(--text,#191b1e); }

    @media (max-width:720px){
      .an-overlay{ padding:16px; align-items:center; }
      .an-card{
        flex-direction:column; max-width:440px; width:100%; max-height:90vh;
        border-radius:32px;
        overflow-y:auto;
      }
      .an-visual{ flex:0 0 auto; padding:24px 20px 8px; order:-1; }
      .an-visual svg{ max-width:96px; }
      .an-content{ padding:16px 24px calc(24px + env(safe-area-inset-bottom)); flex:1; }
      .an-actions{ margin-top:20px; }
      .an-title{ font-size:21px; }
    }
  `;

  let overlayEl = null;
  let styleInjected = false;

  function injectStyle() {
    if (styleInjected) return;
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    styleInjected = true;
  }

  function seenKey(id) { return STORAGE_PREFIX + id; }
  function sessionKey(id) { return SESSION_PREFIX + id; }

  // Постоянный флаг (ставится ТОЛЬКО кнопкой "Не показывать снова")
  function isDismissedForever(id) {
    try { return localStorage.getItem(seenKey(id)) === '1'; } catch (e) { return false; }
  }
  function markDismissedForever(id) {
    try { localStorage.setItem(seenKey(id), '1'); } catch (e) {}
  }

  // Флаг обычного закрытия — поведение зависит от persist
  function isClosedByPersist(id, persist) {
    if (persist === 'local') return isDismissedForever(id);
    if (persist === 'session') {
      try { return sessionStorage.getItem(sessionKey(id)) === '1'; } catch (e) { return false; }
    }
    return false; // persist:false — обычное закрытие ничего не запоминает
  }
  function markClosedByPersist(id, persist) {
    if (persist === 'local') { markDismissedForever(id); return; }
    if (persist === 'session') {
      try { sessionStorage.setItem(sessionKey(id), '1'); } catch (e) {}
    }
  }

  function reset(id) {
    try {
      localStorage.removeItem(seenKey(id));
      sessionStorage.removeItem(sessionKey(id));
    } catch (e) {}
  }

  function hide() {
    if (!overlayEl) return;
    overlayEl.classList.remove('show');
    setTimeout(() => { overlayEl?.remove(); overlayEl = null; }, 400);
  }

  function bulletHtml(b) {
    const icon = ICONS[b.icon] || ICONS.check;
    return `
      <div class="an-bullet">
        <div class="an-bullet-icon"><svg viewBox="0 0 24 24">${icon}</svg></div>
        <div class="an-bullet-text">${b.text}</div>
      </div>`;
  }

  function show(opts) {
    opts = opts || {};
    const id = opts.id || 'default';
    const persist = 'persist' in opts ? opts.persist : false;

    if (isDismissedForever(id)) return;
    if (isClosedByPersist(id, persist)) return;

    injectStyle();
    if (overlayEl) overlayEl.remove();

    const bullets = Array.isArray(opts.bullets) ? opts.bullets : [];

    overlayEl = document.createElement('div');
    overlayEl.className = 'an-overlay';
    overlayEl.innerHTML = `
      <div class="an-card" role="dialog" aria-modal="true">
        <button class="an-close" aria-label="Закрыть"><svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
        <div class="an-content">
          ${opts.eyebrow ? `<div class="an-eyebrow">${opts.eyebrow}</div>` : ''}
          <div class="an-title">${opts.title || ''}</div>
          <div class="an-bullets">${bullets.map(bulletHtml).join('')}</div>
          ${opts.footnote ? `<div class="an-footnote">${opts.footnote}</div>` : ''}
          <div class="an-actions">
            ${opts.primaryHref
              ? `<a class="an-btn an-btn-dark" href="${opts.primaryHref}">${opts.primaryText || 'Понятно'}</a>`
              : `<button class="an-btn an-btn-dark" data-an-primary>${opts.primaryText || 'Понятно'}</button>`}
            ${opts.dontShowAgainText ? `<button class="an-dismiss" data-an-dismiss>${opts.dontShowAgainText}</button>` : ''}
          </div>
        </div>
        <div class="an-visual">${PANEL_ICON}</div>
      </div>`;
    document.body.appendChild(overlayEl);

    function closeNormal() { markClosedByPersist(id, persist); hide(); }
    function closeForever() { markDismissedForever(id); hide(); }

    overlayEl.querySelector('.an-close').addEventListener('click', closeNormal);
    overlayEl.addEventListener('click', e => { if (e.target === overlayEl) closeNormal(); });
    const primaryBtn = overlayEl.querySelector('[data-an-primary]');
    if (primaryBtn) primaryBtn.addEventListener('click', closeNormal);
    const primaryLink = overlayEl.querySelector('a.an-btn-dark');
    if (primaryLink) primaryLink.addEventListener('click', () => markClosedByPersist(id, persist));
    const dismissBtn = overlayEl.querySelector('[data-an-dismiss]');
    if (dismissBtn) dismissBtn.addEventListener('click', closeForever);

    requestAnimationFrame(() => requestAnimationFrame(() => overlayEl.classList.add('show')));
  }

  window.AntvizNotify = {
    show(opts) {
      const delay = opts && 'delay' in opts ? opts.delay : 400;
      setTimeout(() => show(opts), delay);
    },
    hide,
    reset
  };

  // Автозапуск: сразу показываем объявление, настроенное в NOTIFY_CONFIG выше.
  // Если объявление сейчас не нужно вообще — закомментируй строку ниже (поставь // перед ней).
  window.AntvizNotify.show(NOTIFY_CONFIG);
})();
