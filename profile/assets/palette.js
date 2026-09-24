/**
 * palette.js — поиск по кабинету (Ctrl/⌘+K), подключается из sidebar.js.
 *
 * Ищет по разделам кабинета, заказам, проектам, тикетам поддержки и заявкам
 * на обслуживание + быстрые действия (новый заказ, новый тикет, тема, выход).
 * Данные тянет лениво при первом открытии (те же эндпоинты, что и страницы
 * кабинета) и кэширует на минуту. Ничего не пишет и не меняет.
 *
 * Управление: ↑ ↓ — выбор, Enter — открыть, Esc — закрыть.
 */
(function () {
  if (window.__antvizPalette) return;
  window.__antvizPalette = true;

  const API = 'https://antviz.ru/api';
  const isMac = /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent || '');

  const ORDER_STATUS = ['Новая заявка', 'Обсуждение', 'В работе', 'На проверке', 'Правки', 'Готово', 'Ожидает доплаты'];

  const ICONS = {
    page:    '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8 9.5h8M8 13h8M8 16.5h4.5"/>',
    order:   '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>',
    site:    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z"/>',
    ticket:  '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
    service: '<path d="M14.5 6.2a3.6 3.6 0 00-4.9 4.66l-5.6 5.6a1.9 1.9 0 002.7 2.7l5.6-5.6a3.6 3.6 0 004.66-4.9l-2.53 2.53-2-2z"/>',
    plus:    '<path d="M12 5v14M5 12h14"/>',
    theme:   '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>',
    logout:  '<path d="M9 4H6.5A2.5 2.5 0 004 6.5v11A2.5 2.5 0 006.5 20H9"/><path d="M20 12H10.5"/><path d="M16 8l4 4-4 4"/>',
    search:  '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    enter:   '<path d="M20 4v7a4 4 0 01-4 4H4"/><path d="m9 10-5 5 5 5"/>',
  };

  const PAGES = [
    { t: 'Обзор',            s: 'Главная кабинета',                  href: '/profile',               k: 'главная обзор профиль статистика' },
    { t: 'Мои заказы',       s: 'Статусы, оплата, история',          href: '/profile/orders',        k: 'заказы orders история статус' },
    { t: 'Платежи',          s: 'Платежи и документы',               href: '/profile/payments',      k: 'платежи оплата квитанции чеки документы деньги' },
    { t: 'Мои проекты',      s: 'Готовые сайты и боты',              href: '/profile/sites',         k: 'проекты сайты sites боты' },
    { t: 'Чат с командой',   s: 'Тикеты и переписка с поддержкой',   href: '/profile/support',       k: 'поддержка чат тикеты support помощь' },
    { t: 'Обслуживание',     s: 'Подписка и заявки на правки',       href: '/profile/tickets',       k: 'обслуживание подписка правки заявки доработки' },
    { t: 'Уведомления',      s: 'События по заказам и поддержке',    href: '/profile/notifications', k: 'уведомления колокольчик' },
    { t: 'Настройки',        s: 'Профиль, безопасность, каналы',     href: '/profile/settings',      k: 'настройки безопасность пароль 2fa telegram сеансы' },
  ];

  let data = null;       // { orders, tickets, services }
  let loadedAt = 0;
  let loading = null;
  let root = null, input = null, listEl = null;
  let items = [], active = 0;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function shortId(id) { return String(id || '').slice(0, 8).toUpperCase(); }
  function norm(s) { return String(s || '').toLowerCase().replace(/ё/g, 'е'); }

  const CSS = `
    .pl-overlay{position:fixed;inset:0;z-index:9900;background:rgba(10,11,13,.5);display:flex;justify-content:center;align-items:flex-start;padding:12vh 20px 20px;opacity:0;pointer-events:none;transition:opacity .16s ease}
    .pl-overlay.show{opacity:1;pointer-events:auto}
    .pl-box{width:100%;max-width:680px;background:var(--card,#fff);color:var(--text,#191b1e);border:1px solid var(--stroke,var(--border,#dfe3e8));border-radius:24px;box-shadow:0 30px 80px rgba(0,0,0,.35);overflow:hidden;font-family:'Geologica','Inter',Arial,sans-serif;transform:translateY(-8px) scale(.985);transition:transform .2s ease}
    .pl-overlay.show .pl-box{transform:none}
    .pl-head{display:flex;align-items:center;gap:12px;padding:0 20px;border-bottom:1px solid var(--stroke,var(--border,#dfe3e8))}
    .pl-head svg{width:20px;height:20px;stroke:var(--text-dim,#707a8a);stroke-width:2;fill:none;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
    .pl-input{flex:1;min-width:0;background:none;border:none;outline:none;color:inherit;font-family:inherit;font-size:17px;padding:20px 0;letter-spacing:-.02em}
    .pl-input::placeholder{color:var(--text-faint,#9a9da2)}
    .pl-esc{font-size:12px;padding:4px 8px;border-radius:8px;border:1px solid var(--stroke,var(--border,#dfe3e8));color:var(--text-dim,#707a8a)}
    .pl-list{max-height:min(56vh,460px);overflow-y:auto;padding:8px}
    .pl-group{font-size:12px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--text-faint,#9a9da2);padding:12px 12px 6px}
    .pl-item{display:flex;align-items:center;gap:14px;padding:10px 12px;border-radius:14px;cursor:pointer;border:none;background:none;width:100%;text-align:left;color:inherit;font-family:inherit}
    .pl-item.is-active{background:var(--card-elevated,var(--bg2,#f2f4f7))}
    .pl-ico{width:38px;height:38px;border-radius:12px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:var(--card-elevated,var(--bg2,#f2f4f7));border:1px solid var(--stroke,var(--border,#dfe3e8));color:var(--text-dim,#707a8a)}
    .pl-item.is-active .pl-ico{background:var(--text,#191b1e);color:var(--green,#1ede7b);border-color:transparent}
    .pl-ico svg{width:18px;height:18px;stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round}
    .pl-body{flex:1;min-width:0}
    .pl-title{font-size:15px;font-weight:500;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .pl-sub{font-size:13px;color:var(--text-dim,#707a8a);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .pl-enter{width:16px;height:16px;stroke:var(--text-faint,#9a9da2);stroke-width:2;fill:none;stroke-linecap:round;stroke-linejoin:round;opacity:0}
    .pl-item.is-active .pl-enter{opacity:1}
    .pl-empty{padding:40px 20px;text-align:center;color:var(--text-dim,#707a8a);font-size:14px}
    .pl-foot{display:flex;gap:18px;padding:12px 20px;border-top:1px solid var(--stroke,var(--border,#dfe3e8));font-size:12.5px;color:var(--text-faint,#9a9da2)}
    .pl-foot kbd{font-family:inherit;padding:2px 6px;border-radius:6px;border:1px solid var(--stroke,var(--border,#dfe3e8));margin-right:6px;color:var(--text-dim,#707a8a)}
    @media (max-width:980px){.pl-overlay{padding-top:8vh}.pl-foot{display:none}}
  `;

  function build() {
    if (root) return;
    const st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    root = document.createElement('div');
    root.className = 'pl-overlay';
    root.innerHTML = `<div class="pl-box" role="dialog" aria-label="Поиск по кабинету">
      <div class="pl-head">
        <svg viewBox="0 0 24 24">${ICONS.search}</svg>
        <input class="pl-input" type="text" placeholder="Заказ, проект, тикет или раздел…" autocomplete="off" spellcheck="false">
        <span class="pl-esc">Esc</span>
      </div>
      <div class="pl-list" id="plList"></div>
      <div class="pl-foot"><span><kbd>↑</kbd><kbd>↓</kbd>выбрать</span><span><kbd>Enter</kbd>открыть</span><span><kbd>${isMac ? '⌘K' : 'Ctrl K'}</kbd>закрыть / открыть</span></div>
    </div>`;
    document.body.appendChild(root);
    input = root.querySelector('.pl-input');
    listEl = root.querySelector('#plList');

    root.addEventListener('mousedown', e => { if (e.target === root) close(); });
    input.addEventListener('input', () => { active = 0; render(); });
    input.addEventListener('keydown', onKey);
    listEl.addEventListener('mousemove', e => {
      const el = e.target.closest('.pl-item');
      if (!el) return;
      const idx = +el.dataset.i;
      if (idx !== active) { active = idx; markActive(false); }
    });
    listEl.addEventListener('click', e => {
      const el = e.target.closest('.pl-item');
      if (el) run(items[+el.dataset.i]);
    });
  }

  async function fetchJson(path) {
    try {
      const r = await fetch(API + path, { credentials: 'include' });
      return r.ok ? await r.json() : [];
    } catch (e) { return []; }
  }

  function ensureData() {
    if (data && Date.now() - loadedAt < 60000) return Promise.resolve();
    if (loading) return loading;
    loading = Promise.all([fetchJson('/orders'), fetchJson('/tickets'), fetchJson('/service-tickets')]).then(([orders, tickets, services]) => {
      data = {
        orders: Array.isArray(orders) ? orders : [],
        tickets: Array.isArray(tickets) ? tickets : [],
        services: Array.isArray(services) ? services : [],
      };
      loadedAt = Date.now();
      loading = null;
      if (root && root.classList.contains('show')) render();
    });
    return loading;
  }

  function orderName(o) { return o.siteDomain || (o.botUsername ? '@' + o.botUsername : 'Заказ № ' + shortId(o.id)); }

  function actions() {
    const list = [
      { g: 'Действия', t: 'Новый заказ', s: 'Оформить проект', ico: 'plus', k: 'новый заказ оформить создать', run: () => go('/order') },
      { g: 'Действия', t: 'Новый тикет', s: 'Написать в поддержку', ico: 'plus', k: 'новый тикет написать поддержка вопрос обращение', run: () => go('/profile/support-new') },
      { g: 'Действия', t: 'Сменить тему', s: 'Светлая / тёмная', ico: 'theme', k: 'тема темная светлая оформление', run: () => {
        const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const next = cur === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('antviz-theme', next); } catch (e) {}
      } },
      { g: 'Действия', t: 'Выйти из аккаунта', s: 'Завершить сеанс на этом устройстве', ico: 'logout', k: 'выйти выход logout', run: async () => {
        try { await fetch(API + '/auth/logout', { method: 'POST', credentials: 'include' }); } catch (e) {}
        window.location.href = '/';
      } },
    ];
    return list;
  }

  function collect() {
    const all = [];
    PAGES.forEach(p => all.push({ g: 'Разделы', t: p.t, s: p.s, ico: 'page', k: p.k, run: () => go(p.href) }));
    actions().forEach(a => all.push(a));
    if (data) {
      data.orders.forEach(o => {
        const st = ORDER_STATUS[o.status] || '';
        const price = o.totalPrice ? Number(o.totalPrice).toLocaleString('ru') + ' ₽' : '';
        all.push({
          g: 'Заказы', t: orderName(o), s: ['№ ' + shortId(o.id), st, price].filter(Boolean).join(' · '),
          ico: 'order', k: [o.id, shortId(o.id), o.siteDomain, o.package, o.siteFormat, st, o.botUsername].join(' '),
          run: () => go('/profile/orders?id=' + encodeURIComponent(o.id)),
        });
        if (o.status === 5) {
          all.push({
            g: 'Проекты', t: orderName(o), s: o.siteUrl || o.siteDomain || 'Готовый проект',
            ico: 'site', k: [o.siteDomain, o.siteUrl, o.botUsername, 'проект сайт'].join(' '),
            run: () => go('/profile/sites'),
          });
        }
      });
      data.tickets.forEach(t => {
        all.push({
          g: 'Тикеты', t: t.subject || t.topic || 'Тикет', s: [t.topic, t.status === 'done' ? 'Решён' : 'Открыт', t.orderLabel].filter(Boolean).join(' · '),
          ico: 'ticket', k: [t.subject, t.topic, t.orderLabel].join(' '),
          run: () => go('/profile/support-chat?id=' + encodeURIComponent(t.id)),
        });
      });
      data.services.forEach(t => {
        all.push({
          g: 'Обслуживание', t: t.title || 'Заявка на правку', s: [t.orderDomain || t.orderSiteType, t.status === 'done' ? 'Выполнена' : 'В работе'].filter(Boolean).join(' · '),
          ico: 'service', k: [t.title, t.description, t.orderDomain].join(' '),
          run: () => go('/profile/tickets'),
        });
      });
    }
    return all;
  }

  function score(item, q) {
    const title = norm(item.t), hay = norm(item.t + ' ' + (item.s || '') + ' ' + (item.k || ''));
    let sc = 0;
    for (const w of q) {
      if (title.startsWith(w)) sc += 6;
      else if (title.includes(w)) sc += 4;
      else if (hay.includes(w)) sc += 2;
      else return -1;
    }
    return sc;
  }

  function render() {
    const q = norm(input.value).split(/\s+/).filter(Boolean);
    const all = collect();
    let res;
    if (!q.length) {
      // Без запроса: разделы, действия и последние заказы/тикеты
      const order = ['Разделы', 'Действия', 'Заказы', 'Тикеты'];
      res = [];
      order.forEach(g => {
        const part = all.filter(x => x.g === g);
        res.push(...(g === 'Заказы' || g === 'Тикеты' ? part.slice(0, 3) : part));
      });
    } else {
      res = all.map(x => ({ x, sc: score(x, q) })).filter(r => r.sc >= 0).sort((a, b) => b.sc - a.sc).map(r => r.x).slice(0, 40);
    }
    items = res;
    if (active >= items.length) active = 0;

    if (!items.length) {
      const more = loading ? 'Загружаю ваши данные…' : 'Ничего не найдено — попробуйте другое слово';
      listEl.innerHTML = `<div class="pl-empty">${more}</div>`;
      return;
    }
    let html = '', lastG = null;
    items.forEach((it, i) => {
      if (it.g !== lastG) { html += `<div class="pl-group">${esc(it.g)}</div>`; lastG = it.g; }
      html += `<button type="button" class="pl-item${i === active ? ' is-active' : ''}" data-i="${i}">
        <span class="pl-ico"><svg viewBox="0 0 24 24">${ICONS[it.ico] || ICONS.page}</svg></span>
        <span class="pl-body"><div class="pl-title">${esc(it.t)}</div>${it.s ? `<div class="pl-sub">${esc(it.s)}</div>` : ''}</span>
        <svg class="pl-enter" viewBox="0 0 24 24">${ICONS.enter}</svg>
      </button>`;
    });
    listEl.innerHTML = html;
  }

  function markActive(scroll) {
    listEl.querySelectorAll('.pl-item').forEach(el => {
      const on = +el.dataset.i === active;
      el.classList.toggle('is-active', on);
      if (on && scroll) el.scrollIntoView({ block: 'nearest' });
    });
  }

  function onKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (items.length) { active = (active + 1) % items.length; markActive(true); } }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (items.length) { active = (active - 1 + items.length) % items.length; markActive(true); } }
    else if (e.key === 'Enter') { e.preventDefault(); if (items[active]) run(items[active]); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
  }

  function go(href) { window.location.href = href; }
  function run(item) { if (!item) return; close(); try { item.run(); } catch (e) { console.error('palette:', e); } }

  function open() {
    build();
    input.value = '';
    active = 0;
    root.classList.add('show');
    render();
    setTimeout(() => input.focus(), 30);
    ensureData();
  }
  function close() { if (root) root.classList.remove('show'); }
  function toggle() { build(); root.classList.contains('show') ? close() : open(); }

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K' || e.key === 'л' || e.key === 'Л')) {
      e.preventDefault();
      toggle();
    } else if (e.key === 'Escape' && root && root.classList.contains('show')) {
      close();
    }
  });
  document.addEventListener('click', e => {
    const t = e.target.closest && e.target.closest('[data-open-palette]');
    if (t) { e.preventDefault(); open(); }
  });

  window.antvizPalette = { open, close };
})();
