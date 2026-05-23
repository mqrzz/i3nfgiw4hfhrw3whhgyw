/**
 * ╔══════════════════════════════════════════════════╗
 * ║   ПОДВАЛ ANTVIZ — footer.js                      ║
 * ║   Редактируй этот файл — изменится везде         ║
 * ╚══════════════════════════════════════════════════╝
 *
 * Подключение в любой странице (перед </body>):
 *   <script src="footer.js"></script>
 *
 * Активная вкладка мобильного меню:
 *   <script src="footer.js" data-page="home"></script>
 *   data-page: "home" | "order" | "faq" | "profile"
 *
 * Страницы БЕЗ мобильного меню (auth/profile/settings/orders/support):
 *   <script src="footer.js" data-page="auth"></script>
 *   data-page: "auth" | "profile" | "settings" | "orders" | "support"
 */

(function () {

  const NO_MOBILE_NAV_PAGES = ['auth', 'profile', 'settings', 'orders', 'support'];

  const CSS = `
    .antviz-footer {
      border-top: 1px solid rgba(255,255,255,.07);
      padding: 3.5rem 5vw 2.5rem;
      position: relative;
      z-index: 1;
      font-family: 'Onest', sans-serif;
      background: rgba(8,8,12,.6);
    }
    .antviz-footer__inner {
      max-width: 1100px;
      margin: 0 auto;
    }
    .antviz-footer__top {
      display: grid;
      grid-template-columns: 1.4fr repeat(3, 1fr);
      gap: 2.5rem;
      margin-bottom: 3rem;
    }
    .antviz-footer__brand {}
    .antviz-footer__logo {
      font-family: 'Unbounded', sans-serif;
      font-weight: 600;
      font-size: .88rem;
      letter-spacing: .04em;
      color: #f0f0f5;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 9px;
      margin-bottom: 1rem;
    }
    .antviz-footer__dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #6c63ff;
      box-shadow: 0 0 10px #6c63ff;
      animation: ftDotPulse 2s infinite;
      flex-shrink: 0;
    }
    @keyframes ftDotPulse {
      0%,100% { opacity:1; transform:scale(1) }
      50%      { opacity:.6; transform:scale(1.3) }
    }
    .antviz-footer__desc {
      color: #555566;
      font-size: .78rem;
      line-height: 1.7;
      max-width: 260px;
      margin-bottom: 1.4rem;
    }
    .antviz-footer__social {
      display: flex;
      gap: .45rem;
    }
    .antviz-footer__soc {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.08);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #555566;
      text-decoration: none;
      transition: border-color .18s, color .18s, background .18s;
    }
    .antviz-footer__soc:hover {
      border-color: rgba(108,99,255,.45);
      color: #a78bfa;
      background: rgba(108,99,255,.07);
    }
    .antviz-footer__soc svg { width: 15px; height: 15px; }

    .antviz-footer__col-title {
      font-family: 'Unbounded', sans-serif;
      font-weight: 600;
      font-size: .68rem;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: #f0f0f5;
      margin-bottom: 1.1rem;
    }
    .antviz-footer__col-links {
      display: flex;
      flex-direction: column;
      gap: .55rem;
    }
    .antviz-footer__col-links a {
      color: #555566;
      text-decoration: none;
      font-size: .8rem;
      line-height: 1.5;
      transition: color .18s;
      display: flex;
      align-items: center;
      gap: .4rem;
    }
    .antviz-footer__col-links a:hover { color: #f0f0f5; }
    .antviz-footer__col-links a::before {
      content: '';
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: rgba(108,99,255,.5);
      flex-shrink: 0;
      transition: background .18s;
    }
    .antviz-footer__col-links a:hover::before { background: #a78bfa; }

    .antviz-footer__divider {
      height: 1px;
      background: rgba(255,255,255,.06);
      margin-bottom: 1.8rem;
    }
    .antviz-footer__bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .antviz-footer__copy {
      color: #3a3a4a;
      font-size: .72rem;
    }
    .antviz-footer__badges {
      display: flex;
      align-items: center;
      gap: .6rem;
      flex-wrap: wrap;
    }
    .antviz-footer__badge {
      display: flex;
      align-items: center;
      gap: .35rem;
      background: rgba(255,255,255,.03);
      border: 1px solid rgba(255,255,255,.06);
      border-radius: 7px;
      padding: .28rem .65rem;
      font-size: .65rem;
      color: #3a3a4a;
    }
    .antviz-footer__badge-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #4ade80;
      flex-shrink: 0;
    }

    /* Мобильный навбар */
    .antviz-mobile-nav {
      display: none;
      position: fixed;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 200;
      background: rgba(22,22,30,0.92);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 28px;
      padding: 8px 6px;
      width: calc(100% - 24px);
      max-width: 360px;
      justify-content: space-around;
      align-items: center;
      box-shadow: 0 8px 40px rgba(0,0,0,.5);
    }
    .antviz-mobile-nav__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      text-decoration: none;
      color: #777789;
      font-size: .6rem;
      font-family: 'Onest', sans-serif;
      padding: 6px 10px;
      border-radius: 14px;
      transition: background .18s, color .18s;
    }
    .antviz-mobile-nav__item svg { width: 20px; height: 20px; }
    .antviz-mobile-nav__item.active {
      color: #a78bfa;
      background: rgba(108,99,255,.13);
    }
    @media(max-width:1024px) {
      .antviz-mobile-nav { display: flex !important; }
      .antviz-footer {
        padding-bottom: 90px;
      }
      .antviz-footer__top {
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }
      .antviz-footer__brand {
        grid-column: span 2;
      }
    }
    @media(max-width:600px) {
      .antviz-footer__top {
        grid-template-columns: 1fr;
      }
      .antviz-footer__brand {
        grid-column: span 1;
      }
    }
    .antviz-footer.no-mobile-nav {
      padding-bottom: 2.5rem !important;
    }
  `;

  function buildFooter(activePage) {
    const showMobileNav = !NO_MOBILE_NAV_PAGES.includes(activePage);

    const nav = (page, href, label, iconPath) => `
      <a href="${href}" class="antviz-mobile-nav__item${activePage === page ? ' active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${iconPath}</svg>
        ${label}
      </a>`;

    const mobileNav = showMobileNav ? `
<nav class="antviz-mobile-nav">
  ${nav('home',    'index.html',   'Главная',  '<path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/>')}
  ${nav('order',   'order.html',   'Заказать', '<path d="M12 5v14M5 12h14"/>')}
  ${nav('faq',     'faq.html',     'FAQ',      '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".5" fill="currentColor"/>')}
  ${nav('profile', 'profile.html', 'Кабинет',  '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>')}
</nav>` : '';

    return `
<footer class="antviz-footer${showMobileNav ? '' : ' no-mobile-nav'}">
  <div class="antviz-footer__inner">

    <div class="antviz-footer__top">

      <!-- Бренд -->
      <div class="antviz-footer__brand">
        <a href="index.html" class="antviz-footer__logo">
          <span class="antviz-footer__dot"></span>
          Design Antviz
        </a>
        <p class="antviz-footer__desc">Создаём уникальные статические сайты на чистом HTML/CSS/JS. Размещаем бесплатно на инфраструктуре Microsoft. Никаких конструкторов — только ручной код.</p>
        <div class="antviz-footer__social">
          <a href="https://t.me/ТУТ_НИК" class="antviz-footer__soc" target="_blank" rel="noopener" aria-label="Telegram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/>
            </svg>
          </a>
          <a href="https://vk.com/ТУТ_НИК" class="antviz-footer__soc" target="_blank" rel="noopener" aria-label="ВКонтакте">
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M13.162 18.994c.609 0 .858-.406.851-.956-.031-1.668.076-2.894.618-3.499.468-.527 1.36.49 2.106 1.729.474.786.857 1.508 1.218 2.01.398.564.782.716 1.334.716h2.44c.692 0 1.02-.37.826-.989-.2-.619-.791-1.55-1.79-2.756-1.065-1.329-1.221-1.527-.496-2.645.464-.703 1.822-2.857 2.044-3.896.122-.508-.073-.762-.737-.762h-2.44c-.617 0-.876.293-1.012.672-.469 1.348-1.626 3.286-2.132 3.533-.241.125-.436-.027-.436-.516v-3.04c0-.607-.173-.763-.664-.763h-3.672c-.38 0-.574.278-.574.543 0 .545.817.66.9 2.211v3.28c0 .718-.128.852-.404.852-.739 0-2.366-2.022-3.302-4.308-.208-.536-.411-.764-1.028-.764H4.57c-.619 0-.765.293-.765.637 0 .587.698 3.119 3.25 6.514 1.889 2.58 4.513 3.972 6.885 3.972z"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- Навигация -->
      <div>
        <div class="antviz-footer__col-title">Навигация</div>
        <nav class="antviz-footer__col-links">
          <a href="index.html">Главная</a>
          <a href="order.html">Заказать сайт</a>
          <a href="faq.html">FAQ</a>
          <a href="faq.html#rules">Правила</a>
          <a href="support.html">Поддержка</a>
        </nav>
      </div>

      <!-- Услуги -->
      <div>
        <div class="antviz-footer__col-title">Услуги</div>
        <nav class="antviz-footer__col-links">
          <a href="order.html">Лендинг от 250 ₽</a>
          <a href="order.html">Многостраничный сайт</a>
          <a href="order.html">Портфолио</a>
          <a href="order.html">Поддержка сайта</a>
          <a href="order.html">Домен .ru</a>
        </nav>
      </div>

      <!-- Контакты -->
      <div>
        <div class="antviz-footer__col-title">Контакты</div>
        <nav class="antviz-footer__col-links">
          <a href="https://t.me/ТУТ_НИК" target="_blank" rel="noopener">Telegram</a>
          <a href="https://vk.com/ТУТ_НИК" target="_blank" rel="noopener">ВКонтакте</a>
          <a href="profile.html">Личный кабинет</a>
          <a href="support.html">Чат поддержки</a>
        </nav>
      </div>

    </div>

    <div class="antviz-footer__divider"></div>

    <div class="antviz-footer__bottom">
      <p class="antviz-footer__copy">© 2025 Design Antviz. Все права защищены.</p>
      <div class="antviz-footer__badges">
        <div class="antviz-footer__badge">
          <span class="antviz-footer__badge-dot"></span>
          Бесплатный хостинг
        </div>
        <div class="antviz-footer__badge">
          <span class="antviz-footer__badge-dot"></span>
          SSL включён
        </div>
        <div class="antviz-footer__badge">
          <span class="antviz-footer__badge-dot"></span>
          Срок ~2 дня
        </div>
      </div>
    </div>

  </div>
</footer>

${mobileNav}`;
  }

  const script = document.currentScript;
  const activePage = script ? (script.getAttribute('data-page') || '') : '';

  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const wrapper = document.createElement('div');
  wrapper.innerHTML = buildFooter(activePage);
  while (wrapper.firstChild) {
    document.body.appendChild(wrapper.firstChild);
  }

})();
