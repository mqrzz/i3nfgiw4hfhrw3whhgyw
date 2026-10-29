# Antviz — статический сайт

Без бэкенда и сборки. Открывать через локальный сервер (`python -m http.server`) или выложить папку на хостинг: ссылки вида `uslugi/`, `blog/` работают без `.html`.

```
antviz/
├── index.html                главная
├── 404.html
├── robots.txt, sitemap.xml, site.webmanifest
├── uslugi/                   услуги (6 страниц + список)
├── process/                  как мы работаем
├── kalkulyator/              калькулятор стоимости
├── voprosy/                  частые вопросы с поиском
├── o-studii/                 о студии
├── kejsy/                    кейсы (7 страниц + список)
├── blog/                     блог (16 статей, поиск, рубрики)
├── kontakty/                 контакты
├── dokumenty/                политика, согласие, оферта
├── screenshots/              скриншоты кейсов
└── assets/
    ├── css/style.css         единый файл стилей
    ├── js/main.js            основной скрипт
    ├── js/prices.js          ЦЕНЫ КАЛЬКУЛЯТОРА (править здесь)
    ├── js/vendor/            three.js, lenis
    ├── fonts/                Unbounded, Golos Text
    └── img/                  превью для соцсетей, обложки блога, иконки
```
