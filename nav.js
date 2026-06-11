/**
 * ╔══════════════════════════════════════════════════╗
 * ║   НАВБАР ANTVIZ — nav.js                         ║
 * ║   Подключение перед </body>:                     ║
 * ║   <script src="nav.js" data-page="home"></script>║
 * ╚══════════════════════════════════════════════════╝
 *
 * data-page значения:
 *   "home"     — Главная        (корень)
 *   "order"    — Заказать сайт  (корень)
 *   "faq"      — FAQ            (корень)
 *   "profile"  — Кабинет        (корень)
 *   "auth"     — Вход           (корень, без мобильного меню)
 *   "orders"   — Мои заказы     (profile/)
 *   "support"  — Поддержка      (profile/)
 *   "settings" — Настройки      (profile/)
 *   "tickets"  — Обслуживание   (profile/)
 */

(function () {

  const script = document.currentScript;
  const page = script ? (script.getAttribute('data-page') || 'home') : 'home';

  // Определяем базовый путь
  const depth = (window.location.pathname.replace(/\/+$/, '').match(/\//g) || []).length - 1;
  const b = depth > 0 ? '../' : '';

  // Страницы без мобильного меню
  const NO_MOBILE = ['auth'];

  /* ─── CSS ─── */
  const CSS = `
    /* ── DESKTOP NAV ── */
    .antviz-nav {
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 .6rem 0 1.2rem;
      height: 54px;
      width: calc(100% - 40px);
      max-width: 1100px;
      background: rgba(14, 14, 20, 0.82);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(255,255,255,.09);
      border-radius: 30px;
      box-shadow: 0 4px 32px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.05);
      transition: background .3s, border-color .3s;
    }
    .antviz-nav:hover {
      background: rgba(16, 16, 22, 0.92);
      border-color: rgba(255,255,255,.13);
    }

    /* Logo */
    .antviz-nav__logo {
      font-family: 'Unbounded', sans-serif;
      font-weight: 700;
      font-size: .88rem;
      letter-spacing: .03em;
      color: #f0f0f5;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 9px;
      flex-shrink: 0;
    }
    .antviz-nav__logo img {
      width: 26px;
      height: 26px;
      border-radius: 7px;
      object-fit: cover;
    }

    /* Center links */
    .antviz-nav__links {
      display: flex;
      align-items: center;
      gap: .15rem;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }
    .antviz-nav__link {
      color: rgba(240,240,245,.5);
      text-decoration: none;
      font-size: .8rem;
      font-family: 'Onest', sans-serif;
      font-weight: 400;
      letter-spacing: .01em;
      padding: .38rem .75rem;
      border-radius: 50px;
      transition: color .18s, background .18s;
      white-space: nowrap;
    }
    .antviz-nav__link:hover {
      color: #f0f0f5;
      background: rgba(255,255,255,.06);
    }
    .antviz-nav__link.active {
      color: #f0f0f5;
      background: rgba(255,255,255,.08);
    }

    /* Right side */
    .antviz-nav__right {
      display: flex;
      align-items: center;
      gap: .45rem;
      margin-left: auto;
    }

    /* CTA button */
    .antviz-nav__cta {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #6c63ff;
      color: #fff;
      text-decoration: none;
      font-family: 'Onest', sans-serif;
      font-size: .78rem;
      font-weight: 500;
      padding: .42rem 1.05rem;
      border-radius: 50px;
      border: none;
      cursor: pointer;
      transition: box-shadow .2s, transform .12s, background .18s;
      white-space: nowrap;
    }
    .antviz-nav__cta:hover {
      box-shadow: 0 4px 18px rgba(108,99,255,.45);
      transform: translateY(-1px);
    }

    /* Login button */
    .antviz-nav__login {
      display: none;
      align-items: center;
      gap: 6px;
      color: rgba(240,240,245,.6);
      text-decoration: none;
      font-family: 'Onest', sans-serif;
      font-size: .78rem;
      padding: .4rem .85rem;
      border-radius: 50px;
      border: 1px solid rgba(255,255,255,.1);
      transition: color .18s, border-color .18s, background .18s;
      white-space: nowrap;
    }
    .antviz-nav__login:hover {
      color: #f0f0f5;
      border-color: rgba(255,255,255,.2);
      background: rgba(255,255,255,.05);
    }
    .antviz-nav__login.visible { display: inline-flex; }

    /* User dropdown */
    .antviz-nav__user {
      position: relative;
      display: none;
    }
    .antviz-nav__user.visible { display: flex; }
    .antviz-nav__user-btn {
      display: flex;
      align-items: center;
      gap: 7px;
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 50px;
      padding: .28rem .8rem .28rem .32rem;
      cursor: pointer;
      transition: background .18s, border-color .18s;
      font-family: 'Onest', sans-serif;
      font-size: .78rem;
      color: #f0f0f5;
    }
    .antviz-nav__user-btn:hover {
      background: rgba(255,255,255,.09);
      border-color: rgba(255,255,255,.18);
    }
    .antviz-nav__avatar {
      width: 25px;
      height: 25px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6c63ff, #a78bfa);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: .66rem;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
      overflow: hidden;
    }
    .antviz-nav__avatar img { width: 100%; height: 100%; object-fit: cover; }
    .antviz-nav__username {
      max-width: 88px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: .78rem;
    }
    .antviz-nav__chevron {
      width: 12px;
      height: 12px;
      opacity: .45;
      transition: transform .2s;
      flex-shrink: 0;
    }
    .antviz-nav__user-btn[aria-expanded="true"] .antviz-nav__chevron {
      transform: rotate(180deg);
    }

    /* Dropdown menu */
    .antviz-nav__dropdown {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      background: rgba(16, 16, 22, 0.97);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 16px;
      padding: .4rem;
      min-width: 185px;
      box-shadow: 0 12px 40px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.06);
      opacity: 0;
      pointer-events: none;
      transform: translateY(-6px) scale(.98);
      transform-origin: top right;
      transition: opacity .18s, transform .18s;
      z-index: 300;
    }
    .antviz-nav__dropdown.open {
      opacity: 1;
      pointer-events: all;
      transform: translateY(0) scale(1);
    }
    .antviz-nav__dd-label {
      padding: .4rem .75rem .2rem;
      font-size: .6rem;
      text-transform: uppercase;
      letter-spacing: .09em;
      color: rgba(240,240,245,.25);
      font-weight: 500;
    }
    .antviz-nav__dd-item {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: .54rem .75rem;
      border-radius: 10px;
      font-size: .8rem;
      color: rgba(240,240,245,.65);
      text-decoration: none;
      cursor: pointer;
      transition: background .13s, color .13s;
      font-family: 'Onest', sans-serif;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      line-height: 1;
    }
    .antviz-nav__dd-item:hover {
      background: rgba(255,255,255,.07);
      color: #f0f0f5;
    }
    .antviz-nav__dd-item svg {
      width: 15px;
      height: 15px;
      flex-shrink: 0;
      opacity: .55;
      stroke: currentColor;
      fill: none;
      stroke-width: 1.8;
    }
    .antviz-nav__dd-item:hover svg { opacity: .85; }
    .antviz-nav__dd-divider {
      height: 1px;
      background: rgba(255,255,255,.07);
      margin: .3rem .4rem;
    }
    .antviz-nav__dd-item.danger { color: rgba(248,113,113,.7); }
    .antviz-nav__dd-item.danger:hover {
      background: rgba(248,113,113,.08);
      color: #f87171;
    }

    /* Hide on mobile */
    @media (max-width: 768px) {
      .antviz-nav { display: none !important; }
    }
  `;

  /* ─── HTML ─── */
  function buildNav() {
    const links = [
      { href: b || '/', label: 'Главная', key: 'home', guestOnly: true },
      { href: b + 'faq', label: 'FAQ', key: 'faq' },
      { href: b + 'order', label: 'Цены', key: 'order', guestOnly: true },
    ];

    const linksHTML = links.map(l => {
      const isActive = page === l.key;
      const attrs = l.guestOnly ? ` data-guest-only` : '';
      return `<a href="${l.href}" class="antviz-nav__link${isActive ? ' active' : ''}"${attrs}>${l.label}</a>`;
    }).join('');

    const dropdownItems = [
      { href: b + 'profile', icon: '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>', label: 'Кабинет' },
      { href: b + 'profile/orders', icon: '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>', label: 'Мои заказы' },
      { href: b + 'profile/tickets', icon: '<path d="M2 9a3 3 0 010-6h20a3 3 0 010 6"/><path d="M2 15a3 3 0 000 6h20a3 3 0 000-6"/><path d="M6 12h12"/>', label: 'Обслуживание' },
      { href: b + 'profile/support', icon: '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>', label: 'Поддержка' },
      { divider: true },
      { href: b + 'profile/settings', icon: '<circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>', label: 'Настройки' },
      { logout: true },
    ];

    const ddHTML = dropdownItems.map(item => {
      if (item.divider) return `<div class="antviz-nav__dd-divider"></div>`;
      if (item.logout) return `<button class="antviz-nav__dd-item danger" id="antvizNavSignOut"><svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>Выйти</button>`;
      return `<a href="${item.href}" class="antviz-nav__dd-item"><svg viewBox="0 0 24 24">${item.icon}</svg>${item.label}</a>`;
    }).join('');

    return `
<nav class="antviz-nav" id="antvizNav">
  <a class="antviz-nav__logo" href="${b || '/'}">
    <img src="${b}img/favicon.png" alt="Antviz">
    Antviz
  </a>

  <div class="antviz-nav__links" id="antvizNavLinks">
    ${linksHTML}
  </div>

  <div class="antviz-nav__right">
    <a href="${b}auth" class="antviz-nav__login" id="antvizNavLogin">Войти</a>

    <div class="antviz-nav__user" id="antvizNavUser">
      <button class="antviz-nav__user-btn" id="antvizNavUserBtn" aria-expanded="false">
        <div class="antviz-nav__avatar" id="antvizNavAvatar">?</div>
        <span class="antviz-nav__username" id="antvizNavUsername">Профиль</span>
        <svg class="antviz-nav__chevron" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="antviz-nav__dropdown" id="antvizNavDropdown">
        <div class="antviz-nav__dd-label">Аккаунт</div>
        ${ddHTML}
      </div>
    </div>

    <a href="${b}order" class="antviz-nav__cta" id="antvizNavCta">Заказать сайт</a>
  </div>
</nav>`;
  }

  /* ─── INJECT ─── */
  const styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  const wrapper = document.createElement('div');
  wrapper.innerHTML = buildNav();
  document.body.insertBefore(wrapper.firstElementChild, document.body.firstChild);

  /* ─── LOGIC ─── */
  const btn = document.getElementById('antvizNavUserBtn');
  const dd = document.getElementById('antvizNavDropdown');

  // Toggle dropdown
  btn && btn.addEventListener('click', () => {
    const open = dd.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!btn || !dd) return;
    if (!btn.contains(e.target) && !dd.contains(e.target)) {
      dd.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { dd && dd.classList.remove('open'); }
  });

  // Sign out
  document.getElementById('antvizNavSignOut')?.addEventListener('click', async () => {
    try {
      const { signOut, getAuth } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      const auth = getAuth();
      await signOut(auth);
      window.location.href = b || '/';
    } catch (e) { console.error(e); }
  });

  // Auth state
  (async () => {
    try {
      const { onAuthStateChanged, getAuth } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      const auth = getAuth();

      onAuthStateChanged(auth, user => {
        const loginEl   = document.getElementById('antvizNavLogin');
        const userEl    = document.getElementById('antvizNavUser');
        const ctaEl     = document.getElementById('antvizNavCta');
        const guestLinks = document.querySelectorAll('[data-guest-only]');

        if (user) {
          // Залогинен
          if (loginEl) loginEl.classList.remove('visible');
          if (userEl)  userEl.classList.add('visible');
          if (ctaEl)   ctaEl.style.display = 'none';
          guestLinks.forEach(l => l.style.display = 'none');

          // Заполняем имя и аватар
          const name = user.displayName || user.email?.split('@')[0] || 'Профиль';
          const nameEl   = document.getElementById('antvizNavUsername');
          const avatarEl = document.getElementById('antvizNavAvatar');
          if (nameEl) nameEl.textContent = name;
          if (avatarEl) {
            if (user.photoURL) {
              avatarEl.innerHTML = `<img src="${user.photoURL}" alt="">`;
            } else {
              avatarEl.textContent = name[0].toUpperCase();
            }
          }
        } else {
          // Не залогинен
          if (loginEl) loginEl.classList.add('visible');
          if (userEl)  userEl.classList.remove('visible');
          if (ctaEl)   ctaEl.style.display = '';
          guestLinks.forEach(l => l.style.display = '');
        }
      });
    } catch (e) { console.error('nav.js auth:', e); }
  })();

})();
