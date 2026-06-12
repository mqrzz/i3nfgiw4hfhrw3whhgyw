/**
 * nav.js — Antviz
 * <script src="nav.js" data-page="home"></script>
 *
 * data-page: home | faq | order | profile | auth
 *            orders | support | settings | tickets
 */
(function () {

  const script = document.currentScript;
  const page   = script ? (script.getAttribute('data-page') || 'home') : 'home';
  const depth  = (window.location.pathname.replace(/\/+$/, '').match(/\//g) || []).length - 1;
  const b      = depth > 0 ? '../' : '';

  /* ─────────────── CSS ─────────────── */
  const CSS = `
    .antviz-nav {
      position: fixed; top: 18px; left: 50%; transform: translateX(-50%);
      z-index: 9000;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 8px 0 18px;
      height: 52px;
      width: calc(100% - 40px); max-width: 1060px;
      background: rgba(10,10,14,0.75);
      backdrop-filter: blur(28px) saturate(200%);
      -webkit-backdrop-filter: blur(28px) saturate(200%);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 999px;
      box-shadow: 0 2px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
      transition: border-color .3s, background .3s;
    }
    .antviz-nav:hover {
      border-color: rgba(255,255,255,0.12);
    }

    /* Logo */
    .an-logo {
      font-family: 'Unbounded', sans-serif; font-weight: 700;
      font-size: .85rem; letter-spacing: .03em;
      color: #f0f0f5; text-decoration: none;
      display: flex; align-items: center; gap: 9px; flex-shrink: 0;
    }
    .an-logo img {
      width: 26px; height: 26px; border-radius: 7px; object-fit: cover;
    }

    /* Center */
    .an-center {
      position: absolute; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 2px;
    }
    .an-link {
      color: rgba(240,240,245,0.45);
      font-family: 'Onest', sans-serif; font-size: .8rem;
      text-decoration: none; padding: .38rem .78rem;
      border-radius: 999px; transition: color .18s, background .18s;
      white-space: nowrap;
    }
    .an-link:hover { color: #f0f0f5; background: rgba(255,255,255,0.06); }
    .an-link.active { color: #f0f0f5; background: rgba(255,255,255,0.08); }

    /* Right */
    .an-right { display: flex; align-items: center; gap: 6px; margin-left: auto; }

    /* Login */
    .an-login {
      display: none; align-items: center; gap: 6px;
      color: rgba(240,240,245,0.55); font-family: 'Onest', sans-serif;
      font-size: .78rem; text-decoration: none;
      padding: .38rem .85rem; border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.1);
      transition: color .18s, border-color .18s, background .18s;
      white-space: nowrap;
    }
    .an-login:hover { color: #f0f0f5; border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); }
    .an-login.show { display: inline-flex; }

    /* CTA */
    .an-cta {
      display: none; align-items: center; gap: 6px;
      background: #6c63ff; color: #fff;
      font-family: 'Onest', sans-serif; font-size: .78rem; font-weight: 500;
      text-decoration: none; padding: .42rem 1.05rem;
      border-radius: 999px; border: none; cursor: pointer;
      transition: box-shadow .2s, transform .12s;
      white-space: nowrap;
    }
    .an-cta:hover { box-shadow: 0 4px 18px rgba(108,99,255,.5); transform: translateY(-1px); }
    .an-cta.show { display: inline-flex; }

    /* User */
    .an-user { position: relative; display: none; }
    .an-user.show { display: flex; }
    .an-user-btn {
      display: flex; align-items: center; gap: 7px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
      border-radius: 999px; padding: 5px 12px 5px 5px;
      cursor: pointer; transition: background .18s, border-color .18s;
      font-family: 'Onest', sans-serif; font-size: .78rem; color: #f0f0f5;
    }
    .an-user-btn:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.15); }
    .an-avatar {
      width: 26px; height: 26px; border-radius: 50%;
      background: linear-gradient(135deg,#6c63ff,#a78bfa);
      display: flex; align-items: center; justify-content: center;
      font-size: .65rem; font-weight: 700; color: #fff;
      flex-shrink: 0; overflow: hidden;
    }
    .an-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .an-uname { max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .an-chevron {
      width: 11px; height: 11px; opacity: .4; flex-shrink: 0;
      transition: transform .2s;
    }
    .an-user-btn[aria-expanded="true"] .an-chevron { transform: rotate(180deg); }

    /* Dropdown */
    .an-dd {
      position: absolute; top: calc(100% + 10px); right: 0;
      background: rgba(13,13,18,0.97); backdrop-filter: blur(28px);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 18px; padding: 5px;
      min-width: 195px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06);
      opacity: 0; pointer-events: none;
      transform: translateY(-6px) scale(.97);
      transform-origin: top right;
      transition: opacity .18s, transform .18s;
      z-index: 9999;
    }
    .an-dd.open { opacity: 1; pointer-events: all; transform: translateY(0) scale(1); }
    .an-dd-section {
      padding: 6px 10px 3px;
      font-size: .58rem; text-transform: uppercase; letter-spacing: .1em;
      color: rgba(240,240,245,0.22); font-weight: 500;
    }
    .an-dd-item {
      display: flex; align-items: center; gap: 9px;
      padding: 8px 10px; border-radius: 11px;
      font-size: .8rem; color: rgba(240,240,245,0.6);
      text-decoration: none; cursor: pointer;
      transition: background .13s, color .13s;
      font-family: 'Onest', sans-serif; border: none;
      background: none; width: 100%; text-align: left;
    }
    .an-dd-item:hover { background: rgba(255,255,255,0.07); color: #f0f0f5; }
    .an-dd-item svg { width: 15px; height: 15px; flex-shrink: 0; opacity: .5; stroke: currentColor; fill: none; stroke-width: 1.8; }
    .an-dd-item:hover svg { opacity: .8; }
    .an-dd-sep { height: 1px; background: rgba(255,255,255,0.07); margin: 4px 6px; }
    .an-dd-item.red { color: rgba(248,113,113,0.65); }
    .an-dd-item.red:hover { background: rgba(248,113,113,0.08); color: #f87171; }

    @media(max-width:768px) { .antviz-nav { display: none !important; } }
  `;

  /* ─────────────── NAV CONFIG per page ─────────────── */
  // centerLinks: показываются всегда (незалогинен/залогинен)
  // guestLinks:  только незалогиненным
  // showCta:     кнопка "Заказать сайт" незалогиненным
  // hideCta:     скрывать кнопку даже незалогиненным (уже на странице заказа)
  // inApp:       внутри кабинета — только аватар, без внешних ссылок

  const NAV_CONFIG = {
    home:     { centerLinks: [{ href: b+'faq', label: 'FAQ' }], guestLinks: [{ href: b+'faq', label: 'FAQ' }], showCta: true },
    faq:      { centerLinks: [{ href: b || '/', label: 'Главная' }], showCta: true },
    order:    { centerLinks: [], showCta: false, hideCta: true },
    profile:  { inApp: true },
    auth:     { centerLinks: [], showCta: false, hideCta: true },
    orders:   { inApp: true },
    support:  { inApp: true },
    settings: { inApp: true },
    tickets:  { inApp: true },
    // fallback для privacy/terms/rules/404/project
    default:  { centerLinks: [{ href: b+'faq', label: 'FAQ' }], showCta: true },
  };

  const cfg = NAV_CONFIG[page] || NAV_CONFIG.default;

  /* ─────────────── Dropdown items ─────────────── */
  const DD_ITEMS = [
    { section: 'Кабинет' },
    { href: b+'profile',         icon: '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>', label: 'Обзор' },
    { href: b+'profile/orders',  icon: '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>', label: 'Мои заказы' },
    { href: b+'profile/tickets', icon: '<path d="M2 9a3 3 0 010-6h20a3 3 0 010 6"/><path d="M2 15a3 3 0 000 6h20a3 3 0 000-6"/><path d="M6 12h12"/>', label: 'Обслуживание' },
    { href: b+'profile/support', icon: '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>', label: 'Поддержка' },
    { sep: true },
    { href: b+'profile/settings', icon: '<circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>', label: 'Настройки' },
    { logout: true },
  ];

  function buildDD() {
    return DD_ITEMS.map(item => {
      if (item.section) return `<div class="an-dd-section">${item.section}</div>`;
      if (item.sep)     return `<div class="an-dd-sep"></div>`;
      if (item.logout)  return `<button class="an-dd-item red" id="anSignOut"><svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>Выйти</button>`;
      return `<a href="${item.href}" class="an-dd-item"><svg viewBox="0 0 24 24">${item.icon}</svg>${item.label}</a>`;
    }).join('');
  }

  /* ─────────────── Center links HTML ─────────────── */
  function buildCenter() {
    if (cfg.inApp) return '';
    const links = cfg.centerLinks || [];
    if (!links.length) return '';
    return `<div class="an-center" id="anCenter">
      ${links.map(l => `<a href="${l.href}" class="an-link${page === l.key ? ' active' : ''}">${l.label}</a>`).join('')}
    </div>`;
  }

  /* ─────────────── Full nav HTML ─────────────── */
  const NAV_HTML = `
<nav class="antviz-nav" id="antvizNav">
  <a class="an-logo" href="${b || '/'}">
    <img src="${b}img/favicon.png" alt="Antviz">
    Antviz
  </a>

  ${buildCenter()}

  <div class="an-right">
    ${!cfg.inApp ? `<a href="${b}auth" class="an-login" id="anLogin">Войти</a>` : ''}
    ${(!cfg.inApp && !cfg.hideCta) ? `<a href="${b}order" class="an-cta" id="anCta">Заказать сайт</a>` : ''}

    <div class="an-user" id="anUser">
      <button class="an-user-btn" id="anUserBtn" aria-expanded="false">
        <div class="an-avatar" id="anAvatar">?</div>
        <span class="an-uname" id="anUname">Профиль</span>
        <svg class="an-chevron" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="an-dd" id="anDd">${buildDD()}</div>
    </div>
  </div>
</nav>`;

  /* ─────────────── Inject ─────────────── */
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const tmp = document.createElement('div');
  tmp.innerHTML = NAV_HTML;
  document.body.insertBefore(tmp.firstElementChild, document.body.firstChild);

  /* ─────────────── Logic ─────────────── */
  const userBtn = document.getElementById('anUserBtn');
  const dd      = document.getElementById('anDd');

  userBtn?.addEventListener('click', () => {
    const open = dd.classList.toggle('open');
    userBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', e => {
    if (!userBtn || !dd) return;
    if (!userBtn.contains(e.target) && !dd.contains(e.target)) {
      dd.classList.remove('open');
      userBtn.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { dd?.classList.remove('open'); }
  });

  document.getElementById('anSignOut')?.addEventListener('click', async () => {
    try {
      const { getAuth, signOut } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      await signOut(getAuth());
      window.location.href = b || '/';
    } catch(e) { console.error(e); }
  });

  /* ─────────────── Auth state ─────────────── */
  (async () => {
    try {
      const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      onAuthStateChanged(getAuth(), user => {
        const loginEl = document.getElementById('anLogin');
        const ctaEl   = document.getElementById('anCta');
        const userEl  = document.getElementById('anUser');
        const centerEl = document.getElementById('anCenter');

        if (user) {
          loginEl?.classList.remove('show');
          ctaEl  ?.classList.remove('show');
          userEl ?.classList.add('show');
          // Залогинен — скрываем центральные ссылки если inApp
          if (cfg.inApp && centerEl) centerEl.style.display = 'none';

          const name = user.displayName || user.email?.split('@')[0] || 'Профиль';
          const unameEl  = document.getElementById('anUname');
          const avatarEl = document.getElementById('anAvatar');
          if (unameEl) unameEl.textContent = name;
          if (avatarEl) {
            avatarEl.innerHTML = user.photoURL
              ? `<img src="${user.photoURL}" alt="">`
              : name[0].toUpperCase();
          }
        } else {
          userEl ?.classList.remove('show');
          if (!cfg.inApp) {
            loginEl?.classList.add('show');
            if (!cfg.hideCta) ctaEl?.classList.add('show');
          }
        }
      });
    } catch(e) { console.error('nav.js:', e); }
  })();

})();
