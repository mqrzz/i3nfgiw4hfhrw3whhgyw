/**
 * sidebar.js — общая боковая панель личного кабинета Antviz
 * <script src="../sidebar.js" data-page="profile"></script>
 *
 * Подключается на всех 5 страницах кабинета: profile, orders, support,
 * tickets, settings. На ПК (≥981px) рисует постоянный сайдбар слева
 * с разделами и бейджами (активные заказы / непрочитанные сообщения /
 * истекающее обслуживание). На мобильных скрыт — там навигация через
 * капсулу nav.js (бургер) и обычный скролл страницы, без верхнего
 * back-bar — его каждая страница убирает сама.
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

  const CSS = `
    :root{
      --sb-w: 248px;
      --sb-top: 104px;
    }
    .sb-shell{
      display:flex; align-items:flex-start; gap:48px;
      max-width:1100px; margin:0 auto;
      padding:104px 1.5rem 100px;
    }
    .sb-nav{
      width:var(--sb-w); flex-shrink:0;
      position:sticky; top:var(--sb-top);
      display:flex; flex-direction:column; gap:2px;
    }
    .sb-link{
      display:flex; align-items:center; gap:12px;
      padding:.8rem 1rem; border-radius:14px;
      color:var(--muted,#707a8a); text-decoration:none;
      font-family:'Geologica','Inter','Arial',sans-serif; font-weight:300; font-size:.9rem;
      background:none; border:none; cursor:pointer; width:100%; text-align:left;
      transition:background .15s, color .15s;
    }
    .sb-link svg{ width:18px; height:18px; stroke:currentColor; stroke-width:1.8; flex-shrink:0; fill:none; }
    .sb-link:hover{ background:var(--bg2,#f2f4f7); color:var(--text,#191b1e); }
    .sb-link.is-active{ background:var(--bg2,#f2f4f7); color:var(--text,#191b1e); font-weight:500; }
    .sb-link.is-active svg{ stroke:var(--green,#1ede7b); }
    .sb-badge{
      margin-left:auto; background:var(--green,#1ede7b); color:#191b1e;
      font-size:.62rem; font-weight:500; padding:.15rem .45rem; border-radius:6px;
      min-width:18px; text-align:center; flex-shrink:0;
    }
    .sb-badge.warn{ background:#f59e0b; color:#1a1400; }
    .sb-sep{ height:1px; background:var(--border,#dfe3e8); margin:12px 4px; }
    .sb-link.danger{ color:#d95a48; }
    .sb-link.danger:hover{ background:rgba(232,99,79,.08); color:#c44432; }
    .sb-link.danger svg{ stroke:#d95a48; }

    .sb-content{ flex:1; min-width:0; }

    @media (max-width:980px){
      .sb-nav{ display:none; }
      .sb-shell{ display:block; padding:88px 1.2rem 80px; }
      .sb-content{ max-width:640px; margin:0 auto; }
    }
  `;

  const NAV_ITEMS = [
    { key:'profile',  href:b+'profile',          icon:'<rect x="3.5" y="3.5" width="17" height="17" rx="6"/><path d="M7.5 8.5h9M7.5 12h6M7.5 15.5h4"/>', label:'Обзор' },
    { key:'orders',   href:b+'profile/orders',   icon:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 9.5h8M8 13h8M8 16.5h4.5"/>', label:'Мои заказы', badgeKey:'orders' },
    { key:'support',  href:b+'profile/support',  icon:'<rect x="4" y="5" width="16" height="11" rx="4"/><path d="M9 19.5l1.6-3.5h2.8l1.6 3.5"/><circle cx="9.2" cy="10.3" r="1.1"/><circle cx="14.8" cy="10.3" r="1.1"/>', label:'Чат с командой', badgeKey:'support' },
    { key:'tickets',  href:b+'profile/tickets',  icon:'<rect x="4" y="6" width="16" height="12" rx="3.5"/><path d="M4 10.5h16" stroke-dasharray="0.1 3.4"/><circle cx="8.2" cy="14" r="1"/>', label:'Обслуживание', badgeKey:'tickets' },
    { key:'order',    href:b+'order',            icon:'<path d="M12 5v14M5 12h14"/>', label:'Новый заказ' },
    { sep:true },
    { key:'settings', href:b+'profile/settings', icon:'<rect x="4" y="4" width="16" height="16" rx="5"/><path d="M9 9l6 6M15 9l-6 6"/>', label:'Настройки' },
    { key:'logout',   logout:true, icon:'<path d="M9 4H6.5A2.5 2.5 0 004 6.5v11A2.5 2.5 0 006.5 20H9"/><path d="M20 12H10.5"/><path d="M16 8l4 4-4 4"/>', label:'Выйти' },
  ];

  function buildNav() {
    return NAV_ITEMS.map(item => {
      if (item.sep) return `<div class="sb-sep"></div>`;
      const active = item.key === page ? ' is-active' : '';
      const badge = item.badgeKey ? `<span class="sb-badge" id="sbBadge-${item.badgeKey}" style="display:none"></span>` : '';
      if (item.logout) {
        return `<button class="sb-link danger" id="sbLogout"><svg viewBox="0 0 24 24">${item.icon}</svg>${item.label}</button>`;
      }
      return `<a href="${item.href}" class="sb-link${active}"><svg viewBox="0 0 24 24">${item.icon}</svg>${item.label}${badge}</a>`;
    }).join('');
  }

  function init() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const existingContent = document.getElementById('sbContent');

    const shell = document.createElement('div');
    shell.className = 'sb-shell';
    shell.innerHTML = `<nav class="sb-nav" id="sbNav">${buildNav()}</nav>`;

    if (existingContent) {
      existingContent.classList.add('sb-content');
      existingContent.parentNode.insertBefore(shell, existingContent);
      shell.appendChild(existingContent);
    } else {
      // Нет размеченного контейнера — просто вставляем сайдбар первым
      // элементом в body, страница сама отвечает за свою раскладку.
      document.body.insertBefore(shell, document.body.firstChild);
    }

    document.getElementById('sbLogout')?.addEventListener('click', async () => {
      try {
        const authMod = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
        const appMod  = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
        if (appMod.getApps().length) {
          await authMod.signOut(authMod.getAuth(appMod.getApp()));
        }
      } catch (e) { console.error('sidebar.js signOut:', e); }
      window.location.href = b || '/';
    });
  }

  function setBadge(key, value, variant) {
    const el = document.getElementById(`sbBadge-${key}`);
    if (!el) return;
    if (!value) { el.style.display = 'none'; return; }
    el.className = 'sb-badge' + (variant ? ' ' + variant : '');
    el.textContent = String(value);
    el.style.display = 'inline-block';
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
