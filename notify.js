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
  // id — "метка версии". Пока эта строка не меняется, тем,
  // кто уже закрыл окно, оно больше не покажется.
  // Хочешь показать объявление заново всем — поменяй id на новый
  // (например update-2026-08) и поменяй текст ниже.
  id: '6',

  eyebrow: 'Обновление',                 // маленькая зелёная надпись сверху ('' — чтобы убрать)
  title: 'Страница входа стала удобнее',            // крупный заголовок
  text: 'Мы починили замеченные баги, а ещё добавили новый блок — теперь вход в аккаунт стал приятнее и быстрее. Обо всем остальном можно узнать по кнопке ниже :)', // текст под заголовком

  primaryText: 'Понятно',                // текст тёмной кнопки
  primaryHref: null,                     // если нужна ссылка вместо простого закрытия — впиши сюда URL

  secondaryText: 'Что нового',           // текст второй кнопки ('' или null — чтобы убрать кнопку)
  secondaryHref: 'https://blog.antviz.ru/updates',

  persist: 'local',                      // 'local' — не показывать больше никогда (пока id не сменится)
                                          // 'session' — не показывать до закрытия вкладки браузера
                                          // false — показывать при каждом заходе (удобно для теста)
  delay: 400                             // задержка перед появлением, в миллисекундах
};

/* ═══════════════════════════════════════════════════════════════
 *  Дальше — код самого компонента, трогать не нужно
 * ═══════════════════════════════════════════════════════════════ */
(function () {
  const STORAGE_PREFIX = 'antviz_notify_seen_';

  const CSS = `
    .an-overlay{
      position:fixed; inset:0; z-index:800;
      background:rgba(25,27,30,.45); backdrop-filter:blur(3px);
      display:flex; align-items:center; justify-content:center; padding:20px;
      opacity:0; pointer-events:none;
      transition:opacity .35s cubic-bezier(.16,1,.3,1);
      font-family:'Geologica','Inter','Arial',sans-serif;
    }
    .an-overlay.show{ opacity:1; pointer-events:auto; }

    .an-card{
      position:relative; width:100%; max-width:440px;
      background:#fff; border:1px solid #dfe3e8; border-radius:28px;
      padding:36px 34px 30px;
      box-shadow:0 30px 70px -30px rgba(25,27,30,.35);
      transform:scale(.92) translateY(10px); opacity:0;
      transition:transform .4s cubic-bezier(.16,1,.3,1), opacity .35s cubic-bezier(.16,1,.3,1);
    }
    .an-overlay.show .an-card{ transform:scale(1) translateY(0); opacity:1; }

    .an-close{
      position:absolute; top:18px; right:18px; width:34px; height:34px; border-radius:11px;
      background:#f9fafc; border:1px solid #dfe3e8; display:flex; align-items:center; justify-content:center;
      cursor:pointer; color:#707a8a; transition:background .15s,color .15s;
    }
    .an-close:hover{ background:#f2f4f7; color:#191b1e; }
    .an-close svg{ width:14px; height:14px; stroke:currentColor; stroke-width:2; fill:none; }

    .an-icon{
      width:56px; height:56px; border-radius:17px; background:#191b1e;
      display:flex; align-items:center; justify-content:center; margin-bottom:22px;
    }
    .an-icon svg{ width:26px; height:26px; stroke:#1ede7b; stroke-width:1.6; fill:none; }

    .an-eyebrow{
      font-size:.72rem; font-weight:500; text-transform:uppercase; letter-spacing:.1em;
      color:#149955; margin-bottom:10px;
    }
    .an-title{
      font-size:1.5rem; font-weight:500; letter-spacing:-.03em; line-height:1.15; color:#191b1e;
      margin-bottom:12px;
    }
    .an-text{
      font-size:.92rem; color:#707a8a; font-weight:300; line-height:1.55; margin-bottom:26px;
    }

    .an-actions{ display:flex; gap:10px; flex-wrap:wrap; }
    .an-btn{
      display:inline-flex; align-items:center; justify-content:center; gap:8px;
      font-family:inherit; font-weight:500; text-decoration:none; cursor:pointer; border:none;
      border-radius:13px; padding:13px 22px; font-size:.88rem; letter-spacing:-.01em;
      transition:background .12s, transform .15s cubic-bezier(.16,1,.3,1), color .12s, border-color .12s;
    }
    .an-btn:hover{ transform:translateY(-1px); }
    .an-btn-dark{ background:#191b1e; color:#fff; }
    .an-btn-dark:hover{ background:#2b2f33; }
    .an-btn-ghost{ background:none; border:1.5px solid #dfe3e8; color:#707a8a; }
    .an-btn-ghost:hover{ border-color:#cbcdd6; color:#191b1e; }

    @media (max-width:640px){
      .an-overlay{ padding:0; align-items:flex-end; }
      .an-card{
        max-width:none; border-radius:28px 28px 0 0;
        padding:32px 24px calc(28px + env(safe-area-inset-bottom));
        transform:translateY(100%); opacity:1;
        max-height:86vh; overflow-y:auto;
      }
      .an-overlay.show .an-card{ transform:translateY(0); }
      .an-actions{ flex-direction:column; }
      .an-btn{ width:100%; padding:16px 22px; }
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

  function hasBeenSeen(id, persist) {
    if (!persist) return false;
    const store = persist === 'session' ? sessionStorage : localStorage;
    try { return store.getItem(seenKey(id)) === '1'; } catch (e) { return false; }
  }

  function markSeen(id, persist) {
    if (!persist) return;
    const store = persist === 'session' ? sessionStorage : localStorage;
    try { store.setItem(seenKey(id), '1'); } catch (e) {}
  }

  function reset(id) {
    try { localStorage.removeItem(seenKey(id)); sessionStorage.removeItem(seenKey(id)); } catch (e) {}
  }

  function hide() {
    if (!overlayEl) return;
    overlayEl.classList.remove('show');
    setTimeout(() => { overlayEl?.remove(); overlayEl = null; }, 400);
  }

  function btnHtml(cls, text, href) {
    if (!text) return '';
    return href
      ? `<a class="an-btn ${cls}" href="${href}">${text}</a>`
      : `<button class="an-btn ${cls}" data-an-action>${text}</button>`;
  }

  function show(opts) {
    opts = opts || {};
    const id = opts.id || 'default';
    const persist = 'persist' in opts ? opts.persist : 'local';

    if (hasBeenSeen(id, persist)) return;

    injectStyle();
    if (overlayEl) overlayEl.remove();

    const icon = opts.icon || '<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>';

    overlayEl = document.createElement('div');
    overlayEl.className = 'an-overlay';
    overlayEl.innerHTML = `
      <div class="an-card" role="dialog" aria-modal="true">
        <button class="an-close" aria-label="Закрыть"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        <div class="an-icon"><svg viewBox="0 0 24 24">${icon}</svg></div>
        ${opts.eyebrow ? `<div class="an-eyebrow">${opts.eyebrow}</div>` : ''}
        <div class="an-title">${opts.title || ''}</div>
        <div class="an-text">${opts.text || ''}</div>
        <div class="an-actions">
          ${btnHtml('an-btn-dark', opts.primaryText || 'Понятно', opts.primaryHref)}
          ${btnHtml('an-btn-ghost', opts.secondaryText, opts.secondaryHref)}
        </div>
      </div>`;
    document.body.appendChild(overlayEl);

    function close() { markSeen(id, persist); hide(); }

    overlayEl.querySelector('.an-close').addEventListener('click', close);
    overlayEl.addEventListener('click', e => { if (e.target === overlayEl) close(); });
    overlayEl.querySelectorAll('[data-an-action]').forEach(b => b.addEventListener('click', close));
    overlayEl.querySelectorAll('.an-btn[href]').forEach(a => a.addEventListener('click', () => markSeen(id, persist)));

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
