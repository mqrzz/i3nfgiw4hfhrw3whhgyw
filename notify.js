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
  id: 'whitelist-1',

  eyebrow: 'Важно',                      // маленький бейдж сверху ('' — чтобы убрать)
  title: 'Сайт может открываться нестабильно',   // крупный заголовок

  // Буллеты слева, как на референсе. icon: 'globe' | 'clock' | 'shield' | 'check'
  bullets: [
    { icon: 'globe', text: 'Из-за блокировок и замедления интернета в России сайт иногда может открываться с задержкой или не открываться вовсе.' },
    { icon: 'clock', text: 'По той же причине сроки обработки заказов и ответов в поддержке могут немного смещаться.' },
    { icon: 'shield', text: 'Это последствия действий властей, а не наша ошибка — мы всё чиним и работаем в штатном режиме.' }
  ],

  // Текст-подсказка под буллетами (можно оставить пустым '')
  footnote: 'Если сайт не открывается — попробуйте подождать или добавьте antviz.ru в белый список вашего провайдера/антивируса.',

  primaryText: 'Понятно',                // текст тёмной кнопки
  primaryHref: null,                     // если нужна ссылка вместо простого закрытия — впиши сюда URL

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
    globe: '<path d="M12 3a15 15 0 010 18M12 3a15 15 0 000 18M3 12h18M4.5 7.5h15M4.5 16.5h15"/><circle cx="12" cy="12" r="9"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12l2.5 2.5L16 9"/>'
  };

  // Иконка для правой (тёмной) панели — стандартный сигнал wifi
  // (пропорции как у обычной иконки: дуги сужаются к центру, а не
  // растягиваются во всю ширину). Ближняя дуга и точка — зелёные.
  const PANEL_ICON = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
         fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 18l.01 0" stroke="#1ede7b" stroke-width="2.5"/>
      <path d="M9.172 15.172a4 4 0 0 1 5.656 0" stroke="#1ede7b" stroke-width="2"/>
      <path d="M6.343 12.343a8 8 0 0 1 11.314 0" stroke="rgba(255,255,255,.32)" stroke-width="2"/>
      <path d="M3.515 9.515c4.686 -4.687 12.284 -4.687 17 0" stroke="rgba(255,255,255,.16)" stroke-width="2"/>
    </svg>`;

  const CSS = `
    .an-overlay{
      position:fixed; inset:0; z-index:800;
      background:rgba(25,27,30,.5); backdrop-filter:blur(4px);
      display:flex; align-items:center; justify-content:center; padding:24px;
      opacity:0; pointer-events:none;
      transition:opacity .35s cubic-bezier(.16,1,.3,1);
      font-family:'Geologica','Inter','Arial',sans-serif;
    }
    .an-overlay.show{ opacity:1; pointer-events:auto; }

    .an-card{
      position:relative; width:100%; max-width:860px;
      background:#fff; border:1px solid #dfe3e8; border-radius:28px;
      box-shadow:0 40px 90px -30px rgba(25,27,30,.4);
      display:flex; overflow:hidden;
      transform:scale(.94) translateY(10px); opacity:0;
      transition:transform .4s cubic-bezier(.16,1,.3,1), opacity .35s cubic-bezier(.16,1,.3,1);
    }
    .an-overlay.show .an-card{ transform:scale(1) translateY(0); opacity:1; }

    .an-close{
      position:absolute; top:18px; right:18px; z-index:2; width:36px; height:36px; border-radius:11px;
      background:#fff; border:1px solid #dfe3e8; display:flex; align-items:center; justify-content:center;
      cursor:pointer; color:#191b1e; transition:background .15s,color .15s; box-shadow:0 6px 16px -6px rgba(25,27,30,.3);
    }
    .an-close:hover{ background:#f2f4f7; }
    .an-close svg{ width:14px; height:14px; stroke:currentColor; stroke-width:2; fill:none; }

    .an-content{
      flex:1 1 56%; padding:44px 40px 36px; display:flex; flex-direction:column; min-width:0;
    }
    .an-visual{
      flex:0 0 44%; background:#191b1e;
      background-image:
        radial-gradient(circle at 20% 20%, rgba(30,222,123,.10), transparent 55%),
        radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px);
      background-size:auto, 16px 16px;
      display:flex; align-items:center; justify-content:center; padding:30px;
    }
    .an-visual svg{ width:100%; max-width:280px; height:auto; }

    .an-eyebrow{
      display:inline-block; align-self:flex-start;
      font-size:.72rem; font-weight:500; letter-spacing:.02em;
      color:#149955; background:#eafaf1; border-radius:8px; padding:5px 11px;
      margin-bottom:16px;
    }
    .an-title{
      font-size:1.6rem; font-weight:600; letter-spacing:-.03em; line-height:1.18; color:#191b1e;
      margin-bottom:20px;
    }

    .an-bullets{ display:flex; flex-direction:column; gap:14px; margin-bottom:18px; }
    .an-bullet{ display:flex; align-items:flex-start; gap:12px; }
    .an-bullet-icon{
      flex:0 0 auto; width:26px; height:26px; border-radius:8px; background:#f2f4f7;
      display:flex; align-items:center; justify-content:center; margin-top:1px;
    }
    .an-bullet-icon svg{ width:14px; height:14px; stroke:#191b1e; stroke-width:1.8; fill:none; }
    .an-bullet-text{ font-size:.88rem; color:#3d434c; font-weight:300; line-height:1.5; }

    .an-footnote{
      font-size:.8rem; color:#707a8a; font-weight:300; line-height:1.5;
      border-top:1px solid #eef0f3; padding-top:14px; margin-bottom:22px;
    }

    .an-actions{ margin-top:auto; display:flex; flex-direction:column; align-items:flex-start; gap:12px; }
    .an-btn{
      display:inline-flex; align-items:center; justify-content:center; gap:8px; width:100%;
      font-family:inherit; font-weight:500; text-decoration:none; cursor:pointer; border:none;
      border-radius:13px; padding:14px 22px; font-size:.9rem; letter-spacing:-.01em;
      transition:background .12s, transform .15s cubic-bezier(.16,1,.3,1);
    }
    .an-btn:hover{ transform:translateY(-1px); }
    .an-btn-dark{ background:#191b1e; color:#fff; }
    .an-btn-dark:hover{ background:#2b2f33; }

    .an-dismiss{
      background:none; border:none; cursor:pointer; font-family:inherit;
      font-size:.8rem; font-weight:400; color:#9aa1ab; text-decoration:underline;
      text-underline-offset:3px; padding:2px; align-self:center; margin:0 auto;
    }
    .an-dismiss:hover{ color:#191b1e; }

    @media (max-width:720px){
      .an-overlay{ padding:0; align-items:flex-end; }
      .an-card{
        flex-direction:column; max-width:none; border-radius:28px 28px 0 0;
        transform:translateY(100%); opacity:1;
        max-height:92vh; overflow-y:auto;
      }
      .an-overlay.show .an-card{ transform:translateY(0); }
      .an-visual{ flex:0 0 auto; padding:36px 20px; }
      .an-visual svg{ max-width:210px; }
      .an-content{ padding:30px 24px calc(26px + env(safe-area-inset-bottom)); }
      .an-title{ font-size:1.4rem; }
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
        <button class="an-close" aria-label="Закрыть"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
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
