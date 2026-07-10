/**
 * nav.js — единое меню сайта Antviz
 *
 * Подключение (на любой публичной странице, НЕ в /profile и НЕ в /admin):
 *   <script src="nav.js" data-page="home"></script>
 *
 * data-page задаёт активный пункт меню. Значения: home, about, order, rules,
 * privacy, requisites, auth, 404, terms — любое незнакомое значение просто
 * не подсвечивает ни один пункт.
 *
 * Скрипт сам создаёт #navLogin и #navProfile — их видимостью управляет
 * отдельный модульный скрипт на странице через onAuthStateChanged (см. 404.html
 * как пример), поэтому nav.js НЕ импортирует firebase и остаётся обычным
 * (не module) скриптом — грузится мгновенно, до любых модулей.
 *
 * На /profile и /admin меню не подключается вовсе — но на всякий случай
 * скрипт и сам откажется рисовать себя там, если его туда всё же вставят.
 */
(function () {
  'use strict';

  var path = window.location.pathname;
  if (/\/(profile|admin)(\/|$)/.test(path)) return;
  if (document.getElementById('avNav')) return;

  var scriptEl = document.currentScript;
  var activePage = (scriptEl && scriptEl.getAttribute('data-page')) || '';

  var LINKS = [
    { key: 'home', label: 'Главная', href: '/' },
    { key: 'tiers', label: 'Тарифы', href: '/#tiers' },
    { key: 'about', label: 'О сервисе', href: 'about' },
    { key: 'rules', label: 'Правила', href: 'rules' }
  ];

  var CSS = '\
    :root{\
      --av-green:#1ede7b;--av-green-h:#1ac16b;--av-green-d:#149955;\
      --av-dark:#191b1e;--av-dark2:#2b2f33;--av-bg:#fff;\
      --av-border:rgba(25,27,30,.08);--av-muted:#707a8a;\
      --av-font:\'Geologica\',\'Inter\',\'Arial\',sans-serif;\
    }\
    .av-nav{position:fixed;top:0;left:0;right:0;z-index:1000;font-family:var(--av-font);\
      -webkit-font-smoothing:antialiased;transition:background .25s ease,border-color .25s ease,box-shadow .25s ease;\
      background:transparent;border-bottom:1px solid transparent;}\
    .av-nav.av-scrolled{background:rgba(255,255,255,.82);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);\
      border-color:var(--av-border);box-shadow:0 2px 24px rgba(25,27,30,.04);}\
    .av-nav.av-menu-open{background:#fff;border-color:var(--av-border);}\
    .av-nav-inner{max-width:1328px;margin:0 auto;padding:0 20px;height:72px;\
      display:flex;align-items:center;justify-content:space-between;gap:24px;box-sizing:border-box;}\
    @media(min-width:1024px){.av-nav-inner{padding:0 64px}}\
    @media(min-width:1280px){.av-nav-inner{padding:0 96px}}\
    .av-nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0;}\
    .av-nav-mark{width:32px;height:32px;border-radius:10px;background:var(--av-green);\
      display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .18s ease;}\
    .av-nav-logo:hover .av-nav-mark{transform:translateY(-1px) rotate(-4deg);}\
    .av-nav-mark svg{width:16px;height:16px;fill:var(--av-dark);}\
    .av-nav-word{font-weight:600;font-size:1.02rem;letter-spacing:-.02em;color:var(--av-dark);}\
    .av-nav-links{display:flex;align-items:center;gap:4px;}\
    .av-nav-links a{position:relative;padding:8px 14px;border-radius:9px;text-decoration:none;\
      font-size:.86rem;font-weight:400;color:var(--av-muted);letter-spacing:-.01em;\
      transition:color .15s ease,background .15s ease;}\
    .av-nav-links a:hover{color:var(--av-dark);background:rgba(25,27,30,.045);}\
    .av-nav-links a.av-active{color:var(--av-dark);font-weight:500;}\
    .av-nav-links a.av-active::after{content:\'\';position:absolute;left:14px;right:14px;bottom:3px;\
      height:2px;border-radius:2px;background:var(--av-green);}\
    .av-nav-actions{display:flex;align-items:center;gap:8px;flex-shrink:0;}\
    .av-nav-login{text-decoration:none;font-size:.86rem;font-weight:500;color:var(--av-dark);\
      padding:9px 16px;border-radius:10px;transition:background .15s ease;white-space:nowrap;}\
    .av-nav-login:hover{background:rgba(25,27,30,.06);}\
    .av-nav-profile{display:none;align-items:center;gap:8px;text-decoration:none;\
      padding:6px 14px 6px 6px;border-radius:100px;border:1px solid var(--av-border);\
      transition:border-color .15s ease,background .15s ease;white-space:nowrap;}\
    .av-nav-profile:hover{background:rgba(25,27,30,.04);border-color:rgba(25,27,30,.16);}\
    .av-nav-avatar{width:26px;height:26px;border-radius:50%;background:var(--av-dark);color:var(--av-green);\
      display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:600;flex-shrink:0;}\
    .av-nav-profile span.av-nav-profile-label{font-size:.84rem;font-weight:500;color:var(--av-dark);}\
    .av-nav-cta{display:inline-flex;align-items:center;gap:6px;text-decoration:none;\
      background:var(--av-dark);color:#fff;font-size:.86rem;font-weight:500;letter-spacing:-.01em;\
      padding:10px 18px;border-radius:10px;transition:background .15s ease,transform .15s ease;white-space:nowrap;}\
    .av-nav-cta:hover{background:var(--av-dark2);transform:translateY(-1px);}\
    .av-nav-burger{display:none;width:38px;height:38px;border-radius:10px;border:none;background:transparent;\
      cursor:pointer;align-items:center;justify-content:center;flex-direction:column;gap:4px;flex-shrink:0;}\
    .av-nav-burger span{display:block;width:18px;height:1.5px;border-radius:2px;background:var(--av-dark);\
      transition:transform .25s ease,opacity .2s ease;}\
    .av-nav.av-menu-open .av-nav-burger span:nth-child(1){transform:translateY(5.5px) rotate(45deg);}\
    .av-nav.av-menu-open .av-nav-burger span:nth-child(2){opacity:0;}\
    .av-nav.av-menu-open .av-nav-burger span:nth-child(3){transform:translateY(-5.5px) rotate(-45deg);}\
    .av-nav-mobile{display:none;max-height:0;overflow:hidden;background:#fff;\
      border-top:1px solid transparent;transition:max-height .3s ease,border-color .3s ease;}\
    .av-nav.av-menu-open .av-nav-mobile{max-height:70vh;overflow-y:auto;border-color:var(--av-border);}\
    .av-nav-mobile-inner{padding:8px 20px 24px;display:flex;flex-direction:column;gap:2px;}\
    .av-nav-mobile-inner a{text-decoration:none;color:var(--av-dark);font-size:.98rem;font-weight:400;\
      padding:13px 6px;border-bottom:1px solid var(--av-border);}\
    .av-nav-mobile-inner a.av-active{color:var(--av-green-d);font-weight:500;}\
    .av-nav-mobile-actions{display:flex;flex-direction:column;gap:10px;margin-top:14px;}\
    .av-nav-mobile-actions a{border-bottom:none!important;text-align:center;border-radius:10px;padding:13px 6px!important;}\
    .av-nav-mobile-actions .av-nav-login{background:rgba(25,27,30,.05);}\
    .av-nav-mobile-actions .av-nav-cta{justify-content:center;}\
    .av-nav-mobile-actions .av-nav-profile{display:none;justify-content:center;border:1px solid var(--av-border);}\
    @media(max-width:860px){\
      .av-nav-links{display:none;}\
      .av-nav-burger{display:flex;}\
      .av-nav-actions .av-nav-login,.av-nav-actions .av-nav-cta,.av-nav-actions .av-nav-profile{display:none!important;}\
    }\
    @media(prefers-reduced-motion:reduce){.av-nav,.av-nav *{transition:none!important;}}\
  ';

  var styleTag = document.createElement('style');
  styleTag.setAttribute('data-av-nav', '');
  styleTag.textContent = CSS;
  document.head.appendChild(styleTag);

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function linkHTML(l, mobile) {
    var active = l.key === activePage ? ' av-active' : '';
    return '<a href="' + esc(l.href) + '" class="' + (mobile ? '' : '') + active + '">' + esc(l.label) + '</a>';
  }

  var linksHTML = LINKS.map(function (l) { return linkHTML(l, false); }).join('');
  var mobileLinksHTML = LINKS.map(function (l) { return linkHTML(l, true); }).join('');

  var html = '' +
    '<div class="av-nav-inner">' +
      '<a href="/" class="av-nav-logo">' +
        '<span class="av-nav-mark"><svg viewBox="0 0 20 20"><path d="M10 2L3 7v11h5v-5h4v5h5V7L10 2z"/></svg></span>' +
        '<span class="av-nav-word">Antviz</span>' +
      '</a>' +
      '<nav class="av-nav-links">' + linksHTML + '</nav>' +
      '<div class="av-nav-actions">' +
        '<a href="auth" id="navLogin" class="av-nav-login">Войти</a>' +
        '<a href="profile" id="navProfile" class="av-nav-profile">' +
          '<span class="av-nav-avatar">A</span><span class="av-nav-profile-label">Кабинет</span>' +
        '</a>' +
        '<a href="order" class="av-nav-cta">Заказать сайт</a>' +
        '<button type="button" class="av-nav-burger" id="avNavBurger" aria-label="Открыть меню" aria-expanded="false">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
      '</div>' +
    '</div>' +
    '<div class="av-nav-mobile" id="avNavMobile">' +
      '<div class="av-nav-mobile-inner">' +
        mobileLinksHTML +
        '<div class="av-nav-mobile-actions">' +
          '<a href="auth" id="navLoginMobile" class="av-nav-login">Войти</a>' +
          '<a href="profile" id="navProfileMobile" class="av-nav-profile">Личный кабинет</a>' +
          '<a href="order" class="av-nav-cta">Заказать сайт</a>' +
        '</div>' +
      '</div>' +
    '</div>';

  var nav = document.createElement('header');
  nav.className = 'av-nav';
  nav.id = 'avNav';
  nav.innerHTML = html;
  document.body.insertBefore(nav, document.body.firstChild);

  // ── Скролл: подложка появляется после ухода со старта страницы ──
  function onScroll() {
    nav.classList.toggle('av-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ── Мобильное меню ──
  var burger = document.getElementById('avNavBurger');
  var mobilePanel = document.getElementById('avNavMobile');
  function closeMenu() {
    nav.classList.remove('av-menu-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function toggleMenu() {
    var open = nav.classList.toggle('av-menu-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', toggleMenu);
  mobilePanel.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) closeMenu();
  });

  // ── Синхронизация мобильных копий #navLogin / #navProfile с их видимостью.
  // Основной auth-скрипт страницы переключает display у #navLogin/#navProfile —
  // здесь просто зеркалим то же состояние на мобильные дубликаты через
  // MutationObserver, не трогая логику авторизации вообще. ──
  var desktopLogin = document.getElementById('navLogin');
  var desktopProfile = document.getElementById('navProfile');
  var mobileLogin = document.getElementById('navLoginMobile');
  var mobileProfile = document.getElementById('navProfileMobile');

  function mirror(target, source, displayWhenOn) {
    var on = source.style.display !== 'none';
    target.style.display = on ? displayWhenOn : 'none';
  }
  function syncAuthUI() {
    mirror(mobileLogin, desktopLogin, 'block');
    mirror(mobileProfile, desktopProfile, 'block');
  }
  syncAuthUI();
  if (window.MutationObserver) {
    var mo = new MutationObserver(syncAuthUI);
    mo.observe(desktopLogin, { attributes: true, attributeFilter: ['style'] });
    mo.observe(desktopProfile, { attributes: true, attributeFilter: ['style'] });
  }
})();
