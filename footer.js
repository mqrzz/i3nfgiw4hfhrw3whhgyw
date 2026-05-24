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
    .antviz-footer__logo img {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      object-fit: cover;
      flex-shrink: 0;
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
      gap: .6rem;
    }
    .antviz-footer__bottom-left {
      display: flex;
      flex-direction: column;
      gap: .35rem;
    }
    .antviz-footer__copy {
      color: #3a3a4a;
      font-size: .72rem;
    }
    .antviz-footer__legal {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .antviz-footer__legal a {
      color: #3a3a4a;
      font-size: .68rem;
      text-decoration: none;
      transition: color .18s;
    }
    .antviz-footer__legal a:hover { color: #777789; }
    .antviz-footer__status {
      display: flex;
      align-items: center;
      gap: .5rem;
      font-size: .68rem;
      color: #3a3a4a;
    }
    .antviz-footer__status-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #4ade80;
      flex-shrink: 0;
      animation: statusPulse 2.5s infinite;
    }
    @keyframes statusPulse {
      0%,100% { opacity:1 }
      50%      { opacity:.4 }
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
    const year = new Date().getFullYear();

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

    /* ── SVG-логотипы соцсетей (Bootstrap Icons) ── */
    const socials = [
      {
        href: 'https://t.me/antviz_official',
        label: 'Telegram',
        svg: `<svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09"/>
        </svg>`
      },
      {
        href: 'https://instagram.com/antviz_official',
        label: 'Instagram',
        svg: `<svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>
        </svg>`
      },
      {
        href: 'https://tiktok.com/@antviz_official',
        label: 'TikTok',
        svg: `<svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/>
        </svg>`
      },
      {
        href: 'https://threads.net/@antviz_official',
        label: 'Threads',
        svg: `<svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/>
        </svg>`
      }
    ];

    const socialHTML = socials.map(s => `
      <a href="${s.href}" class="antviz-footer__soc" target="_blank" rel="noopener" aria-label="${s.label}">
        ${s.svg}
      </a>`).join('');

    return `
<footer class="antviz-footer${showMobileNav ? '' : ' no-mobile-nav'}">
  <div class="antviz-footer__inner">

    <div class="antviz-footer__top">

      <!-- Бренд -->
      <div class="antviz-footer__brand">
        <a href="index.html" class="antviz-footer__logo">
          <img src="favicon.png" alt="Antviz">
          Antviz
        </a>
        <p class="antviz-footer__desc">Делаем сайты под ключ — быстро, красиво, без лишнего. Никаких конструкторов, только ручной код.</p>
        <div class="antviz-footer__social">
          ${socialHTML}
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
          <a href="https://t.me/antviz_official" target="_blank" rel="noopener">Telegram</a>
          <a href="https://instagram.com/antviz_official" target="_blank" rel="noopener">Instagram</a>
          <a href="profile.html">Личный кабинет</a>
          <a href="support.html">Чат поддержки</a>
        </nav>
      </div>

    </div>

    <div class="antviz-footer__divider"></div>

    <div class="antviz-footer__bottom">
      <div class="antviz-footer__bottom-left">
        <p class="antviz-footer__copy">© ${year} Antviz. Все права защищены.</p>
        <div class="antviz-footer__legal">
          <a href="privacy.html">Политика конфиденциальности</a>
          <a href="terms.html">Пользовательское соглашение</a>
        </div>
      </div>
      <div class="antviz-footer__status">
        <span class="antviz-footer__status-dot"></span>
        Принимаем заказы · Ответим в течение 2 часов
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
