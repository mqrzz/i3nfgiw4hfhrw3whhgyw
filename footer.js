// footer.js - универсальный подвал для всех страниц

(function() {
    // Страницы БЕЗ мобильного меню
    const NO_MOBILE_NAV_PAGES = ['auth', 'profile', 'settings', 'orders', 'support', 'order'];
    
    // Стили ТОЛЬКО для подвала — НИЧЕГО не трогают страницу
    const styles = `
        .antviz-footer {
            padding: 4rem 5vw 2rem;
            border-top: 1px solid rgba(255,255,255,.1);
            background: #000000;
            margin-top: auto;
            font-family: 'Onest', sans-serif;
        }
        .antviz-footer * { box-sizing: border-box; }
        .antviz-footer .inner { max-width: 1200px; margin: 0 auto; }
        
        .antviz-footer .top-grid {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 40px;
            padding-bottom: 60px;
            border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .antviz-footer .brand-col { display: flex; flex-direction: column; }
        .antviz-footer .logo {
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
        .antviz-footer .logo img {
            width: 28px; height: 28px;
            border-radius: 7px;
            object-fit: cover;
        }
        .antviz-footer .contacts {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-top: auto;
        }
        .antviz-footer .contact-link {
            color: #f0f0f5;
            font-family: 'Unbounded', sans-serif;
            font-weight: 500;
            font-size: 20px;
            letter-spacing: -.02em;
            text-decoration: none;
            transition: color .2s;
        }
        .antviz-footer .contact-link:hover { color: #a78bfa; }
        .antviz-footer .contact-note {
            display: block;
            color: rgba(255,255,255,.2);
            font-weight: 400;
            font-size: 16px;
            letter-spacing: -.02em;
            margin-top: 4px;
        }
        
        .antviz-footer .socials {
            display: flex;
            gap: 8px;
            align-self: start;
            justify-content: flex-end;
        }
        .antviz-footer .soc {
            width: 40px; height: 40px;
            border-radius: 12px;
            background: rgba(255,255,255,.04);
            display: flex; align-items: center; justify-content: center;
            color: #f0f0f5;
            text-decoration: none;
            transition: background .2s;
        }
        .antviz-footer .soc:hover { background: rgba(255,255,255,.08); }
        .antviz-footer .soc svg { width: 18px; height: 18px; }
        
        .antviz-footer .groups {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 40px;
            padding-top: 60px;
            padding-bottom: 48px;
        }
        .antviz-footer .group-title {
            display: block;
            color: rgba(255,255,255,.2);
            font-size: 16px;
            margin-bottom: 16px;
        }
        .antviz-footer .group-items {
            list-style: none;
            margin: 0; padding: 0;
            font-size: 16px;
            line-height: 1.6;
        }
        .antviz-footer .group-items li:not(:last-child) { margin-bottom: 12px; }
        .antviz-footer .group-items a {
            color: #cfcfd6;
            text-decoration: none;
            transition: color .18s;
        }
        .antviz-footer .group-items a:hover { color: #f0f0f5; }
        .antviz-footer .group-items a.cta { color: #cbb8ff; font-weight: 500; }
        .antviz-footer .group-items a.cta:hover { color: #ddd0ff; }
        
        .antviz-footer .bottom {
            padding-top: 40px;
            border-top: 1px solid rgba(255,255,255,.06);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
        }
        .antviz-footer .copy { color: rgba(255,255,255,.18); font-size: 16px; }
        .antviz-footer .legal-links {
            display: flex; flex-wrap: wrap; gap: 24px;
        }
        .antviz-footer .legal-links a {
            color: rgba(255,255,255,.18);
            font-size: 16px;
            text-decoration: none;
            transition: color .18s;
        }
        .antviz-footer .legal-links a:hover { color: #999; }
        
        .antviz-footer .meta-note {
            grid-column: 1 / -1;
            color: rgba(255,255,255,.12);
            font-size: 13px;
            line-height: 1.6;
            margin-top: 40px;
        }
        
        .antviz-footer .payment-block {
            margin-top: 20px;
        }
        .antviz-footer .payment-label {
            display: block;
            color: rgba(255,255,255,.2);
            font-weight: 400;
            font-size: 16px;
            letter-spacing: -.02em;
            margin-top: 6px;
        }
        .antviz-footer .payment-logo img {
            display: block;
            height: 28px;
            width: auto;
            transition: opacity .2s;
        }
        .antviz-footer .payment-logo:hover img { opacity: .75; }
        
        .antviz-footer .legal-info {
            margin-top: 16px;
            color: rgba(255,255,255,.18);
            font-size: 13px;
            line-height: 1.7;
        }
        
        @media (max-width: 1023px) {
            .antviz-footer .top-grid { grid-template-columns: 1fr; gap: 32px; padding-bottom: 32px; }
            .antviz-footer .contacts { margin-top: 0; }
            .antviz-footer .groups { grid-template-columns: 1fr 1fr; gap: 32px; }
            .antviz-footer .bottom { flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 600px) {
            .antviz-footer .groups { grid-template-columns: 1fr; gap: 24px; }
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
        <footer class="antviz-footer">
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
                                <span class="contact-note">Сюда — по любым вопросам и возражениям. По сотрудничеству отвечаем только в чате поддержки на сайте.</span>
                            </a>
                            <div style="display:flex; align-items:center; gap:32px; flex-wrap:wrap;">
                                <div class="payment-block">
                                    <a href="https://yookassa.ru/" class="payment-logo" target="_blank" rel="noopener" aria-label="ЮKassa">
                                        <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyOC4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0i0KHQu9C+0LlfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHZpZXdCb3g9IjAgMCAxMDAwIDIzNi41MDA0NzMiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDEwMDAgMjM2LjUwMDQ3MyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8cGF0aCBmaWxsPSIjMDA3NkVCIiBkPSJNOTUuNzk3ODg5NywxMTcuNzE4MTA5MUM5Ni4wODI1MzQ4LDUyLjg0ODM5MjUsMTQ4LjM2NTE4ODYsMCwyMTQuMDQ2NDQ3OCwwDQoJYzY1LjExMjc5MywwLDExOC45OTk0NTA3LDUzLjEzNzc3MTYsMTE4LjI1MDIxMzYsMTE4LjI1MDIzNjVjMCw2NS4xMTI4MDA2LTUzLjEzNzQyMDcsMTE4LjI1MDIzNjUtMTE4LjI1MDIxMzYsMTE4LjI1MDIzNjUNCgljLTY0LjkzNjI3OTMsMC0xMTcuOTYyMjE5Mi01Mi4xMDYxMjQ5LTExOC4yNDg1NTgtMTE3LjcxNTU3NjJ2ODcuNzc4ODM5MUg1My44ODYyMDc2TDAsMzQuNDI3MjA3OWg5NS43OTc4ODk3VjExNy43MTgxMDkxeg0KCSBNMTY5Ljg5MDEyMTUsMTE4LjI1MDIzNjVjMCwyMy45NDkwNDMzLDIwLjIwNzI3NTQsNDQuMTU3MTczMiw0NC4xNTYzMjYzLDQ0LjE1NzE3MzINCgljMjQuNjk4MjQyMiwwLDQ0LjE1NzE2NTUtMjAuMjA4MTI5OSw0NC4xNTcxNjU1LTQ0LjE1NzE3MzJzLTIwLjIwNzI3NTQtNDQuMTU2NzQ1OS00NC4xNTcxNjU1LTQ0LjE1Njc0NTkNCglDMTkwLjA5NzM5NjksNzQuMDkzNDkwNiwxNjkuODkwMTIxNSw5NC4zMDExODU2LDE2OS44OTAxMjE1LDExOC4yNTAyMzY1eiIvPg0KPHBhdGggZmlsbD0iIzAyMjYzRiIgZD0iTTUyMi45MzI5MjI0LDY4LjQyNzE5MjdoLTMyLjI0ODQ3NDFsLTIyLjgyMDYxNzcsNDAuMTA0NTYwOWgtMTEuNzQ3MzQ1bC0wLjM3NDE3Ni04Ni43OTMzODg0aC0zMC41MjcxMzAxDQoJdjE1Ni43NTE5MjI2aDMwLjUyNzEzMDFsMC4zNzQxNzYtNDMuMDIyNzk2NmgxMS42NzIxNDk3bDMwLjMwMzMxNDIsNDMuMDIyNzk2NmgzMy44MTk2MTA2bC0zOS41MDU3MzczLTU3LjAxNDM1MDkNCglMNTIyLjkzMjkyMjQsNjguNDI3MTkyN3ogTTc1My45ODIwNTU3LDEyMC4wNTQzOTc2Yy02LjIwMTM1NS00LjAxMzc0ODItMTIuOTIzMDM0Ny03LjE2MDA0OTQtMTkuOTc3NDc4LTkuMzUyNzQ1MQ0KCWwtNi43MzQzNzUtMi41NDQwNjc0bC0xLjc5NTcxNTMtMC42NzMxODczbC0wLjAyNzAzODYtMC4wMTAxMzE4Yy00LjE4MTgyMzctMS41Njg1MTItOC41NzczOTI2LTMuMjE2NDA3OC04LjcyNjg2NzctNy40NzE3MzMxDQoJYy0wLjAzODg3OTQtMS4yNjM1ODgsMC4yNDI0MzE2LTIuNTE2MTg5NiwwLjgxNzYyNy0zLjY0MTI2NTljMC41NzYwNDk4LTEuMTI1MDYxLDEuNDI3NDI5Mi0yLjA4NjI2NTYsMi40NzQ3OTI1LTIuNzkzMjM1OA0KCWMyLjIxMDQ0OTItMS41MjM3MzUsNC44MDA5NjQ0LTIuNDA0NzAxMiw3LjQ4MTg3MjYtMi41NDQwNjc0YzUuODQ2Njc5Ny0wLjQwMzczOTksMTEuNjQwODY5MSwxLjMyMzU1NSwxNi4zMTE3Njc2LDQuODYzNDY0NA0KCWwwLjgyMjY5MjksMC41MjM2ODE2bDE2LjMxMDkxMzEtMTguNzgwNDE4NGwtMC44MjI2MzE4LTAuNjczMzU1MWMtMi4wMzA1Nzg2LTEuODEwMzI1Ni00LjIzNjc1NTQtMy40MTQzOTA2LTYuNTg0ODk5OS00Ljc4ODYyNzYNCgljLTQuMjA2MzU5OS0yLjQwNjgwNjktOC43ODI1OTI4LTQuMTAwNzQ2Mi0xMy41NDIxMTQzLTUuMDEzMTMwMmMtNi44NTY4NzI2LTEuNDU4NzAyMS0xMy45NDQyNzQ5LTEuNDU4NzAyMS0yMC44MDEwODY0LDANCgljLTYuNjI4Nzg0MiwwLjg3NzQxODUtMTIuOTE4MDI5OCwzLjQ1NTAxNzEtMTguMjU2MTY0Niw3LjQ4MjE5M2MtMy40MTQwNjI1LDIuNjcxMTg4NC02LjI2NzI3MjksNS45ODg3ODQ4LTguMzk4MjU0NCw5Ljc2MzE2ODMNCgljLTIuMTMxOTU4LDMuNzc0MDMyNi0zLjQ5ODUzNTIsNy45MzEzODEyLTQuMDIyMjc3OCwxMi4yMzQ4NDA0Yy0wLjkzNTg1MjEsNy43NjQ4MjM5LDEuMDM2NDM4LDE1LjYwMDU4NTksNS41MzY2ODIxLDIxLjk5NzA3NzkNCgljNS45NzgzOTM2LDYuNjE5NDgzOSwxMy43OTMwMjk4LDExLjMwODEwNTUsMjIuNDQ2NDExMSwxMy40Njc4NjVsMS4zNDcyMjksMC40NDkzNDA4bDMuMDY3NzQ5LDEuMDQ3MzYzMw0KCWMxMS4wNzMyNDIyLDMuNzQwOTIxLDE0LjIxNjE4NjUsNS4yMzc2NDA0LDE2LjAxMTkwMTksNy40ODE4NzI2YzAuODM1MzI3MSwxLjEyOTI4NzcsMS4zMDQ5OTI3LDIuNDg3NDU3MywxLjM0NjM3NDUsMy44OTEyNjU5DQoJYzAsNS4zMTE5ODEyLTYuNTA4ODUwMSw3LjQ4MTg1NzMtMTAuOTIzNzY3MSw4LjgyOTA3MWMtMy4wODYzNjQ3LDAuNTc5NDIyLTYuMjU5NzA0NiwwLjUyMDI5NDItOS4zMjIzMjY3LTAuMTc0ODM1Mg0KCWMtMy4wNjI2ODMxLTAuNjk1MTQ0Ny01Ljk1MDU2MTUtMi4wMTEwOTMxLTguNDg1MjkwNS0zLjg2NTk1MTVjLTQuMTAxNjIzNS0yLjc0MjU1MzctNy42MTE5Mzg1LTYuMjc5MDgzMy0xMC4zMjU4MDU3LTEwLjQwMDEwMDcNCgljLTAuNDUxOTA0MywwLjQ3MTI5ODItMS45NTIwMjY0LDEuOTcwNTY1OC0zLjkxMzI2OSwzLjkzMDk4NDVjLTUuNTAzNjYyMSw1LjUwMDMyMDQtMTQuNjM4NDg4OCwxNC42MjgzODc1LTE0LjQxODAyOTgsMTQuODQ4ODQ2NA0KCWwwLjUyNDQ3NTEsMC43NDgzNTIxYzguMTQ4MjU0NCwxMC4yMDE2MTQ0LDE5LjU2MzY1OTcsMTcuMjgzMTExNiwzMi4zMjI4MTQ5LDIwLjA1MjcwMzkNCgljMi45MTU3MTA0LDAuNTYzMzY5OCw1Ljg2NDQ0MDksMC45Mzg0MTU1LDguODI5MTAxNiwxLjEyMjUyODFoMy4wNjc3NDkNCgljMTAuMDc5MjIzNiwwLjIxMTE2NjQsMTkuOTUzMDY0LTIuODYxNjQ4NiwyOC4xMzI2Mjk0LTguNzU0NzMwMmM1LjUzMjQwOTctMy45MTMyMzg1LDkuNzc3NTg3OS05LjM4MjMyNDIsMTIuMTk1ODAwOC0xNS43MTIwODE5DQoJYzEuNDcxMzEzNS00LjI1MDI1OTQsMS45OTI1NTM3LTguNzcwNzk3NywxLjUyNzE2MDYtMTMuMjQzMTc5M2MtMC40NjU0NTQxLTQuNDczMjM2MS0xLjkwNTU3ODYtOC43ODkzODI5LTQuMjIwNzAzMS0xMi42NDUxODc0DQoJQzc2MC44OTQ2NTMzLDEyNS44NjEzMjgxLDc1Ny43MzA1OTA4LDEyMi41Njk3NDc5LDc1My45ODIwNTU3LDEyMC4wNTQzOTc2eiBNODMyLjY5NzkzNywxMTAuNzAwODA1Nw0KCWM3LjAzMDc2MTcsMi4xOTI2OTU2LDEzLjcyODgyMDgsNS4zMzk4NDM4LDE5LjkwMzE5ODIsOS4zNTI3NDUxYzMuNjgyNjE3MiwyLjUxNTM1OCw2Ljc5MDk1NDYsNS43NzkwNjA0LDkuMTMwNjE1Miw5LjU3NzQzMDcNCgljMi4zMTQyNywzLjg1NTc4OTIsMy43NTAxODMxLDguMTcxOTIwOCw0LjIxNDc4MjcsMTIuNjQ1MTcyMWMwLjQ2NDUzODYsNC40NzMyMzYxLTAuMDUwNzIwMiw4Ljk5Mzc3NDQtMS41MjAzODU3LDEzLjI0MzE3OTMNCgljLTIuNDI0MTMzMyw2LjMzMDYxMjItNi42NjQyNDU2LDExLjc5OTY4MjYtMTIuMTk2NjU1MywxNS43MTI5MjExYy04LjE4MjEyODksNS44OTIyNDI0LTE4LjA1NjgyMzcsOC45NjUwNTc0LTI4LjEzNTk4NjMsOC43NTM4OTENCgloLTMuMDY3NzQ5Yy0yLjk2Mzg2NzItMC4xNzkwNDY2LTUuOTEzMzMwMS0wLjU1NDA3NzEtOC44MjkwNDA1LTEuMTIyNTEyOA0KCWMtMTIuNzU4MzYxOC0yLjc2OTU5MjMtMjQuMTczNzY3MS05Ljg1MTEwNDctMzIuMzIyOTM3LTIwLjA1MTg3OTlsLTAuNTk3OTYxNC0wLjc0ODM1MjENCgljLTAuMTQ3ODI3MS0wLjE5NTk2ODYsNy4wNzA0OTU2LTcuNDM2MjQ4OCwxMi41MjM1NTk2LTEyLjkwNTMxOTJjMi44NjQxOTY4LTIuODcyNjM0OSw1LjI0MDk2NjgtNS4yNTcwODAxLDUuODA3NzM5My01Ljg3NTMzNTcNCgljMi43NTI3NDY2LDQuMDg4ODk3Nyw2LjI1NzE0MTEsNy42MTc4NDM2LDEwLjMyNTAxMjIsMTAuNDAwOTM5OWMyLjU0ODIxNzgsMS44NTY1MjE2LDUuNDQ4NzMwNSwzLjE3MzMyNDYsOC41MjMyNTQ0LDMuODY3NjE0Nw0KCWMzLjA3NTM3ODQsMC42OTUxNDQ3LDYuMjYwNDk4LDAuNzUzNDMzMiw5LjM1OTQ5NzEsMC4xNzIzMTc1YzQuNDE0MDYyNS0xLjM0NjM1OTMsMTAuODQ4NjMyOC0zLjUxNjI1MDYsMTAuODQ4NjMyOC04LjgyOTA3MQ0KCWMwLjA0MDUyNzMtMS40MDQ2NDc4LTAuNDA5NjY4LTIuNzgwNTYzNC0xLjI3MjAzMzctMy44OTA0NDE5Yy0xLjc5NTcxNTMtMi4yNDUwNTYyLTQuOTM3ODA1Mi0zLjc0MDkyMS0xNi4wODYyNDI3LTcuNDgyNjk2NQ0KCWwtMy4wNjc3NDktMS4wNDczNjMzbC0xLjI3MjA5NDctMC40NDg1MDE2Yy04LjY1NDE3NDgtMi4xNTk3NTk1LTE2LjQ2ODAxNzYtNi44NDgzODEtMjIuNDQ2NDExMS0xMy40Njc4NTc0DQoJYy00LjUzOTk3OC02LjM3ODc1MzctNi41MTY0MTg1LTE0LjIzMDU3NTYtNS41MzY2MjExLTIxLjk5NzkxNzJjMC41NDgxNTY3LTQuMzAxNzgwNywxLjk0MDEyNDUtOC40NTMyMDg5LDQuMDk3NDEyMS0xMi4yMTU1MDc1DQoJYzIuMTU3MTY1NS0zLjc2MjIxNDcsNS4wMzY1NjAxLTcuMDYxMTQyLDguNDcyNTk1Mi05LjcwNzI0NDljNS4zNTE2MjM1LTQuMDAzNzg0MiwxMS42MzQxNTUzLTYuNTc4NzY1OSwxOC4yNTYxMDM1LTcuNDgyMjAwNg0KCWM2Ljg4MjIwMjEtMS40NjAzODgyLDEzLjk5NDA3OTYtMS40NjAzODgyLDIwLjg3NTM2NjIsMGM0LjczNjAyMjksMC45MTQ5MTcsOS4yODg1NzQyLDIuNjA5MDI0LDEzLjQ2OTYwNDUsNS4wMTMxMzc4DQoJYzIuMzgxODk3LDEuMzU1MTQ4Myw0LjYxMTc1NTQsMi45NjAzODgyLDYuNjU1ODIyOCw0Ljc4ODUzNjFsMC43NTE3MDksMC42NzMzNTUxbC0xNi4zMTI2MjIxLDE4Ljc4MDQxODRMODQyLjUsOTUuODg2NTgxNA0KCWMtNC42NzY4MTg4LTMuNTI3MjM2OS0xMC40NjY4NTc5LTUuMjUzNjg1LTE2LjMxMDkxMzEtNC44NjM0NjQ0Yy0yLjY4MTc2MjcsMC4xMzkzNzM4LTUuMjcxNDIzMywxLjAyMDMzMjMtNy40ODI3MjcxLDIuNTQ0MDY3NA0KCWMtMS4wMjQ1MzYxLDAuNzM0ODQwNC0xLjg2MjQyNjgsMS43MDAyNzkyLTIuNDQ2OTYwNCwyLjgxNzczMzhjLTAuNTg0NDcyNywxLjExNzQ2OTgtMC44OTk1MzYxLDIuMzU1NzIwNS0wLjkxOTc5OTgsMy42MTY3NzU1DQoJYzAuMjI0NjcwNCw0LjI2NDYxMDMsNC41NjQ0NTMxLDUuOTEwODIsOC44MjkwNDA1LDcuNDgxODU3M2wxLjcyMDU4MTEsMC42NzQwMzQxTDgzMi42OTc5MzcsMTEwLjcwMDgwNTd6IE02MjMuMTkxNDA2Miw2OC40MjY3NjU0DQoJdjEwLjc3NDI4NDRoLTEuMzQ2Mzc0NWMtOC4zNTYwNzkxLTguMzY2NzE0NS0xOS42NzU5NjQ0LTEzLjA5ODgzMTItMzEuNTAwMTIyMS0xMy4xNjg1OTQ0DQoJYy03LjI0ODc3OTMtMC4xNDMyNTcxLTE0LjQ0NjgzODQsMS4yNDE3OTA4LTIxLjEyNDU3MjgsNC4wNjUxMDE2Yy02LjY3Nzc5NTQsMi44MjMyMjY5LTEyLjY4NTczLDcuMDIxMjc4NC0xNy42MzM2NjcsMTIuMzIwODMxMw0KCWMtOS45Nzc3MjIyLDExLjE3NDE0MDktMTUuMzI3NzU4OCwyNS43MjczNzEyLTE0Ljk2Mzc0NTEsNDAuNzAyOTExNA0KCWMtMC4zODc2OTUzLDE1LjIyNzI0MTUsNC45NTMwMDI5LDMwLjA0NTY5MjQsMTQuOTYzNzQ1MSw0MS41MjYxMDAyDQoJYzQuODI5NzExOSw1LjMwMzUyNzgsMTAuNzQzODM1NCw5LjUwNDc5MTMsMTcuMzQxNDMwNywxMi4zMTkxMzc2YzYuNTk2NjE4NywyLjgxNDM2MTYsMTMuNzIyOTAwNCw0LjE3NTkxODYsMjAuODkzMTI3NCwzLjk5MTgwNg0KCWMxMS44Mzg1MDEtMC4yMjIxNTI3LDIzLjIyNDMwNDItNC41OTA2NTI1LDMyLjE3MzMzOTgtMTIuMzQ1MzIxN2gxLjE5NjgzODR2OS42NTI1ODc5aDMxLjcyNDg1MzVWNjguNDI2NzY1NEg2MjMuMTkxNDA2MnoNCgkgTTYyNC43NjI0NTEyLDEyMy43MjAxNTM4YzAuMzE4NDgxNCw4Ljg1MTg2NzctMi42Mzg2NzE5LDE3LjUwOTQ5MS04LjMwNTM1ODksMjQuMzE3MzIxOA0KCWMtMi43MTU1NzYyLDMuMDQxNTY0OS02LjA2NzEzODcsNS40NDg3OTE1LTkuODE2NDY3Myw3LjA1MTkyNTdjLTMuNzUwMjQ0MSwxLjYwMzE0OTQtNy44MDYyNzQ0LDIuMzYzMzI3LTExLjg4MTY1MjgsMi4yMjU2NDcNCgljLTMuOTUyMDI2NCwwLjA2NjcyNjctNy44Njk1Njc5LTAuNzYwMTc3Ni0xMS40NTc1ODA2LTIuNDE4MjI4MWMtMy41ODg4NjcyLTEuNjU4ODc0NS02Ljc1NzIwMjEtNC4xMDU4MDQ0LTkuMjY4MjQ5NS03LjE1OTE5NDkNCgljLTUuNTk5MTgyMS02Ljk0ODA0MzgtOC40NzI3MTczLTE1LjcwMDI1NjMtOC4wODA3NDk1LTI0LjYxNjMyNTRjLTAuMjU0MjExNC04LjY0NzQ2ODYsMi42NzQ5ODc4LTE3LjA4NzE1MDYsOC4yMzEwNzkxLTIzLjcxODQ2MDENCgljMi41NTc1NTYyLTMuMDA2OTQyNyw1Ljc0ODU5NjItNS40MTE2MzY0LDkuMzQ1MTUzOC03LjA0MTgwMTVjMy41OTU1ODExLTEuNjI5MzI1OSw3LjUwNzIwMjEtMi40NDQ0MDQ2LDExLjQ1NTA3ODEtMi4zODUyNzY4DQoJYzQuMDQ4NDAwOS0wLjEyNjcwMTQsOC4wNzM5MTM2LDAuNjQ2OTk1NSwxMS43ODY5ODczLDIuMjY0NDg4MmMzLjcxMzg2NzIsMS42MTc0OTI3LDcuMDIxNTQ1NCw0LjAzODI0NjIsOS42ODY0MDE0LDcuMDg4MjU2OA0KCUM2MjIuMTIyOTI0OCwxMDYuMTY1OTAxMiw2MjUuMDc4MzA4MSwxMTQuODQ2MzIxMSw2MjQuNzYyNDUxMiwxMjMuNzIwMTUzOHogTTk2OC4yNzUyMDc1LDc5LjIwMjA2NDVWNjguNDI3NzgwMkgxMDAwVjE3OC4yNjY0NDkNCgloLTMxLjcyNDc5MjV2LTkuNjUyNTg3OWgtMS4xOTk0MDE5Yy04Ljk0NDgyNDIsNy43NTQ2ODQ0LTIwLjMzMDYyNzQsMTIuMTIzMTg0Mi0zMi4xNzI1NDY0LDEyLjM0NjE2MDkNCgljLTcuMTcxMDIwNSwwLjE4MzI4ODYtMTQuMjkxMzgxOC0xLjE3ODI2ODQtMjAuODg4MDYxNS0zLjk5MjYzYy02LjYwNTEwMjUtMi44MTQzNjE2LTEyLjUxNzU3ODEtNy4wMTU2MjUtMTcuMzQwNTE1MS0xMi4zMTkxMzc2DQoJYy0xMC4wMTc1MTcxLTExLjQ3OTU2ODUtMTUuMzU1NjUxOS0yNi4yOTgwMTk0LTE0Ljk2NzEwMjEtNDEuNTI2MTA3OA0KCWMtMC4zNjMyMjAyLTE0Ljk3NTU0NzgsNC45ODMzMzc0LTI5LjUyODc3MDQsMTQuOTY3MTAyMS00MC43MDI3NDM1DQoJYzQuOTY2NDkxNy01LjI5NDE1MTMsMTAuOTg4NzY5NS05LjQ4NzcyNDMsMTcuNjc4MzQ0Ny0xMi4zMTAxODgzYzYuNjgxMTUyMy0yLjgyMjM4MDEsMTMuODk0NDcwMi00LjIxMDgwNzgsMjEuMTQ5OTYzNC00LjA3NTc0NDYNCgljMTEuNzk5NjIxNiwwLjA4OTM1NTUsMjMuMDg0MTA2NCw0LjgxOTk2MTUsMzEuNDI5MTM4MiwxMy4xNjg1OTQ0SDk2OC4yNzUyMDc1eiBNOTYxLjU0MzMzNSwxNDguMDM4MzE0OA0KCWM1LjY5MjkzMjEtNi43OTAxMDAxLDguNjU3NTkyOC0xNS40NjAzNzI5LDguMzAyODU2NC0yNC4zMTczMTQxYzAuMzU0NzM2My04Ljg3ODg5ODYtMi42MDk5MjQzLTE3LjU3MTk5MS04LjMwMjg1NjQtMjQuMzkxNjQ3Mw0KCWMtMi42NjkwNjc0LTMuMDUwMDEwNy01Ljk3MTYxODctNS40NzA3NjQyLTkuNjg4MDQ5My03LjA4ODI1NjhzLTcuNzM2OTM4NS0yLjM5MDM0MjctMTEuNzkxMjU5OC0yLjI2NDQ4ODINCgljLTMuOTQ0NDU4LTAuMDU5MTI3OC03Ljg1NTIyNDYsMC43NTU5NTA5LTExLjQ1MzM2OTEsMi4zODYxMTZjLTMuNTk4MjA1NiwxLjYyOTMyNTktNi43ODI0NzA3LDQuMDM0MDE5NS05LjM0MTc5NjksNy4wNDA5NTQ2DQoJYy01LjU1NzczOTMsNi42MzEzMDE5LTguNDg4NjQ3NSwxNS4wNzE4Mzg0LTguMjM1MjI5NSwyMy43MTg0Njc3Yy0wLjM4ODU0OTgsOC45MTYwNjE0LDIuNDgzMjE1MywxNy42NjgyNzM5LDguMDgzMjUyLDI0LjYxNjMxNzcNCgljMi41MDg1NDQ5LDMuMDUzMzkwNSw1LjY3NTk2NDQsNS41MDExNzQ5LDkuMjY1NzQ3MSw3LjE1OTIxMDJjMy41ODk3MjE3LDEuNjU4MDUwNSw3LjUwODg1MDEsMi40ODQ5Mzk2LDExLjQ2MTg1MywyLjQxODIxMjkNCgljNC4wNzExMDYsMC4xMzc2ODAxLDguMTMzOTExMS0wLjYyMjUxMjgsMTEuODc1NjcxNC0yLjIyNTYzMTcNCglDOTU1LjQ3MDM5NzksMTUzLjQ4NzEyMTYsOTU4LjgyMzYwODQsMTUxLjA3OTg3OTgsOTYxLjU0MzMzNSwxNDguMDM4MzE0OHoiLz4NCjwvc3ZnPg0K" alt="ЮKassa" style="height:28px; width:auto; display:block;">
                                    </a>
                                    <span class="payment-label">Приём платежей</span>
                                </div>
                                <div class="payment-block" style="display:flex; flex-direction:column; align-items:center;">
                                    <a href="https://www.cloudflare.com/" class="payment-logo" target="_blank" rel="noopener" aria-label="Cloudflare" style="text-decoration:none;">
                                        <img src="https://logo-teka.com/wp-content/uploads/2026/04/cloudflare-vertical-logo.png" alt="Cloudflare" style="height:28px; width:auto; display:block; filter:brightness(0) saturate(100%) invert(11%) sepia(97%) saturate(7489%) hue-rotate(358deg) brightness(98%) contrast(118%);">
                                    </a>
                                    <span class="payment-label">Под защитой</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="socials">
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
                        <a href="https://threads.com/@antviz_official" class="soc" target="_blank" rel="noopener" aria-label="Threads">
                            <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/>
                            </svg>
                        </a>
                    </div>
                </div>
                
                <div class="groups">
                    <div>
                        <span class="group-title">Навигация</span>
                        <ul class="group-items">
                            <li><a href="${base}">Главная</a></li>
                            <li><a href="${base}order" class="cta">Заказать сайт</a></li>
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
                            <li><a href="${base}p_oferta.docx" download="p_oferta.docx">Публичная оферта ↓</a></li>
                            <li><a href="${base}requisites">Реквизиты</a></li>
                        </ul>
                    </div>
                </div>
                
                <div class="bottom">
                    <span class="copy">© 2026 Antviz</span>
                    <div class="legal-links">
                        <a href="${base}privacy">Политика конфиденциальности</a>
                        <a href="${base}terms">Пользовательское соглашение</a>
                        <a href="${base}p_oferta.docx" download="p_oferta.docx">Публичная оферта</a>
                    </div>
                </div>
                
                <div class="meta-note">
                    *Meta Platforms Inc. (включая Instagram и Threads) признана экстремистской организацией, её деятельность запрещена на территории РФ.
                </div>
            </div>
        </footer>
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
