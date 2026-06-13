// footer.js - универсальный подвал для всех страниц с мобильной навигацией

(function() {
    // Страницы БЕЗ мобильного меню
    const NO_MOBILE_NAV_PAGES = ['auth', 'profile', 'settings', 'orders', 'support'];
    
    // Создаем стили для подвала
    const styles = `
        * { box-sizing: border-box; }
        body { margin:0; background:#0a0a0c; min-height:100vh; font-family:'Onest', sans-serif; }
        
        .footer {
            padding: 4rem 5vw 2rem;
        }
        .inner { max-width: 1200px; margin: 0 auto; }
        
        /* верхний блок: лого + соцсети */
        .top-grid {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 40px;
            padding-bottom: 60px;
            border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .brand-col { display: flex; flex-direction: column; }
        .logo {
            display: inline-flex;
            align-items: center;
            gap: 9px;
            font-family: 'Unbounded', sans-serif;
            font-weight: 600;
            font-size: 18px;
            color: #f0f0f5;
            text-decoration: none;
            margin-bottom: 32px;
        }
        .logo img {
            width: 28px; height: 28px;
            border-radius: 7px;
            object-fit: cover;
        }
        .contacts {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-top: auto;
        }
        .contact-link {
            color: #f0f0f5;
            font-family: 'Unbounded', sans-serif;
            font-weight: 500;
            font-size: 20px;
            letter-spacing: -.02em;
            text-decoration: none;
            transition: color .2s;
        }
        .contact-link:hover { color: #a78bfa; }
        .contact-note {
            display: block;
            color: rgba(255,255,255,.2);
            font-weight: 400;
            font-size: 16px;
            letter-spacing: -.02em;
            margin-top: 4px;
        }
        
        .socials {
            display: flex;
            gap: 8px;
        }
        .soc {
            width: 40px; height: 40px;
            border-radius: 12px;
            background: rgba(255,255,255,.04);
            display: flex; align-items: center; justify-content: center;
            color: #f0f0f5;
            text-decoration: none;
            transition: background .2s;
        }
        .soc:hover { background: rgba(255,255,255,.08); }
        .soc svg { width: 18px; height: 18px; }
        
        /* группы ссылок */
        .groups {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 40px;
        }
        .group-title {
            display: block;
            color: rgba(255,255,255,.2);
            font-size: 16px;
            margin-bottom: 16px;
        }
        .group-items {
            list-style: none;
            margin: 0; padding: 0;
            font-size: 16px;
            line-height: 1.6;
        }
        .group-items li:not(:last-child) { margin-bottom: 12px; }
        .group-items a {
            color: #cfcfd6;
            text-decoration: none;
            transition: color .18s;
        }
        .group-items a:hover { color: #f0f0f5; }
        .group-items a.cta { color: #cbb8ff; font-weight: 500; }
        .group-items a.cta:hover { color: #ddd0ff; }
        
        /* нижняя строка */
        .bottom {
            padding-top: 40px;
            border-top: 1px solid rgba(255,255,255,.06);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
        }
        .copy { color: rgba(255,255,255,.18); font-size: 16px; }
        .legal-links {
            display: flex; flex-wrap: wrap; gap: 24px;
        }
        .legal-links a {
            color: rgba(255,255,255,.18);
            font-size: 16px;
            text-decoration: none;
            transition: color .18s;
        }
        .legal-links a:hover { color: #999; }
        
        .meta-note {
            grid-column: 1 / -1;
            color: rgba(255,255,255,.12);
            font-size: 13px;
            line-height: 1.6;
            margin-top: 40px;
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
        
        @media (max-width: 1023px) {
            .top-grid { grid-template-columns: 1fr; gap: 32px; padding-bottom: 32px; }
            .contacts { margin-top: 0; }
            .groups { grid-template-columns: 1fr 1fr; gap: 32px; }
            .bottom { flex-direction: column; align-items: flex-start; }
            .antviz-mobile-nav { display: flex !important; }
            .footer { padding-bottom: 90px; }
        }
        @media (max-width: 600px) {
            .groups { grid-template-columns: 1fr; gap: 24px; }
        }
        
        .footer.no-mobile-nav {
            padding-bottom: 2.5rem !important;
        }
    `;
    
    // Определяем активную страницу из атрибута data-page
    const script = document.currentScript;
    const activePage = script ? (script.getAttribute('data-page') || '') : '';
    const showMobileNav = !NO_MOBILE_NAV_PAGES.includes(activePage);
    
    // Автоматический расчёт пути для корректных ссылок
    const depth = (window.location.pathname.replace(/\/+$/, '').match(/\//g) || []).length - 1;
    const base = depth > 0 ? '../' : '';
    
    // HTML структура подвала
    const footerHTML = `
        <footer class="footer${showMobileNav ? '' : ' no-mobile-nav'}">
            <div class="inner">
                <div class="top-grid">
                    <div class="brand-col">
                        <a href="${base}" class="logo">
                            <img src="${base}img/favicon.png" alt="Antviz" onerror="this.src='https://via.placeholder.com/28x28'">
                            Antviz
                        </a>
                        <div class="contacts">
                            <a href="mailto:support@antviz.ru" class="contact-link">
                                support@antviz.ru
                                <span class="contact-note">Отвечаем только в чате поддержки на сайте</span>
                            </a>
                        </div>
                    </div>
                    
                    <div class="socials" style="align-self:start; justify-content:flex-end;">
                        <a href="https://t.me/antviz_official" class="soc" target="_blank" rel="noopener" aria-label="Telegram">
                            <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09"/>
                            </svg>
                        </a>
                        <a href="https://instagram.com/antviz_official" class="soc" target="_blank" rel="noopener" aria-label="Instagram">
                            <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>
                            </svg>
                        </a>
                        <a href="https://tiktok.com/@antviz_official" class="soc" target="_blank" rel="noopener" aria-label="TikTok">
                            <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/>
                            </svg>
                        </a>
                        <a href="https://threads.net/@antviz_official" class="soc" target="_blank" rel="noopener" aria-label="Threads">
                            <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/>
                            </svg>
                        </a>
                    </div>
                </div>
                
                <div class="groups" style="padding-top:60px; padding-bottom:48px;">
                    <div>
                        <span class="group-title">Навигация</span>
                        <ul class="group-items">
                            <li><a href="${base}">Главная</a></li>
                            <li><a href="${base}order" class="cta">Заказать сайт</a></li>
                            <li><a href="${base}faq">FAQ</a></li>
                            <li><a href="${base}rules">Правила</a></li>
                            <li><a href="${base}profile/support">Поддержка</a></li>
                        </ul>
                    </div>
                    <div>
                        <span class="group-title">Услуги</span>
                        <ul class="group-items">
                            <li><a href="${base}order">Лендинг от 250 ₽</a></li>
                            <li><a href="${base}order">Многостраничный сайт</a></li>
                            <li><a href="${base}order">Портфолио</a></li>
                            <li><a href="${base}order">Поддержка сайта</a></li>
                            <li><a href="${base}order">Домен .ru</a></li>
                        </ul>
                    </div>
                    <div>
                        <span class="group-title">Связь</span>
                        <ul class="group-items">
                            <li><a href="https://t.me/antviz_official" target="_blank" rel="noopener">Telegram</a></li>
                            <li><a href="${base}profile/support">Чат поддержки</a></li>
                        </ul>
                    </div>
                    <div>
                        <span class="group-title">Документы</span>
                        <ul class="group-items">
                            <li><a href="${base}privacy">Конфиденциальность</a></li>
                            <li><a href="${base}terms">Соглашение</a></li>
                        </ul>
                    </div>
                </div>
                
                <div class="bottom">
                    <span class="copy">© 2026 Antviz</span>
                    <div class="legal-links">
                        <a href="${base}privacy">Политика конфиденциальности</a>
                        <a href="${base}terms">Пользовательское соглашение</a>
                    </div>
                </div>
                
                <div class="meta-note">
                    *Meta Platforms Inc. (включая Instagram и Threads) признана экстремистской организацией, её деятельность запрещена на территории РФ.
                </div>
            </div>
        </footer>
        
        ${showMobileNav ? `
        <nav class="antviz-mobile-nav">
            <a href="${base}" class="antviz-mobile-nav__item${activePage === 'home' ? ' active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
                    <path d="M9 21V12h6v9"/>
                </svg>
                Главная
            </a>
            <a href="${base}order" class="antviz-mobile-nav__item${activePage === 'order' ? ' active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M12 5v14M5 12h14"/>
                </svg>
                Заказать
            </a>
            <a href="${base}faq" class="antviz-mobile-nav__item${activePage === 'faq' ? ' active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
                    <circle cx="12" cy="17" r=".5" fill="currentColor"/>
                </svg>
                FAQ
            </a>
            <a href="${base}profile" class="antviz-mobile-nav__item${activePage === 'profile' ? ' active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
                Кабинет
            </a>
        </nav>
        ` : ''}
    `;
    
    // Функция для вставки подвала
    function initFooter() {
        // Добавляем стили
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
        
        // Добавляем шрифты, если их нет
        if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Unbounded"]')) {
            const fontsLink = document.createElement('link');
            fontsLink.href = 'https://fonts.googleapis.com/css2?family=Unbounded:wght@400;500;600;700&family=Onest:wght@300;400;500;600&display=swap';
            fontsLink.rel = 'stylesheet';
            document.head.appendChild(fontsLink);
        }
        
        // Вставляем подвал
        const footerContainer = document.createElement('div');
        footerContainer.innerHTML = footerHTML;
        while (footerContainer.firstChild) {
            document.body.appendChild(footerContainer.firstChild);
        }
    }
    
    // Запускаем после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFooter);
    } else {
        initFooter();
    }
})();
