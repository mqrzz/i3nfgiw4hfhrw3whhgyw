/**
 * maintenance.js — единый скрипт технических работ
 * Подключай на каждой странице: <script src="/maintenance.js"></script>
 * или <script src="../maintenance.js"></script> для вложенных страниц
 */
(async () => {
  const FIREBASE_VERSION = '10.12.0';
  try {
    const { initializeApp, getApps } = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`);
    const { getFirestore, doc, onSnapshot } = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`);
    const { getAuth } = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`);

    // Берём уже инициализированное приложение или инициализируем своё
    let app;
    if (getApps().length) {
      app = getApps()[0];
    } else {
      // fallback config — в идеале firebase-config.js уже загружен раньше
      const script = document.querySelector('script[src*="firebase-config"]');
      if (!script) return;
      const mod = await import(new URL('firebase-config.js', window.location.origin + '/').href).catch(() => null);
      if (!mod) return;
      app = getApps()[0];
    }

    const db = getFirestore(app);
    const auth = getAuth(app);
    let overlay = null;

    onSnapshot(doc(db, 'settings', 'maintenance'), snap => {
      const on = snap.exists() && snap.data().enabled === true;

      // Не показываем админу
      const user = auth.currentUser;
      if (on && user?.email === 'wbtipoofficialcom@gmail.com') return;

      if (on && !overlay) {
        overlay = document.createElement('div');
        overlay.id = '__maint_overlay__';
        overlay.innerHTML = `
          <style>
            #__maint_overlay__ {
              position: fixed; inset: 0; z-index: 99999;
              background: #191b1e;
              display: flex; flex-direction: column;
              align-items: center; justify-content: center;
              text-align: center; padding: 32px;
              font-family: 'Geologica', 'Inter', Arial, sans-serif;
              animation: __maint_fadein__ .35s ease;
            }
            @keyframes __maint_fadein__ {
              from { opacity: 0; } to { opacity: 1; }
            }
            #__maint_overlay__ .__m_inner__ {
              max-width: 480px; width: 100%;
            }
            #__maint_overlay__ .__m_badge__ {
              display: inline-flex; align-items: center; gap: 7px;
              background: rgba(245,158,11,.12);
              border: 1px solid rgba(245,158,11,.25);
              color: #f59e0b;
              font-size: 11px; font-weight: 500;
              text-transform: uppercase; letter-spacing: .1em;
              padding: 5px 14px; border-radius: 99px;
              margin-bottom: 32px;
            }
            #__maint_overlay__ .__m_badge__::before {
              content: '';
              width: 6px; height: 6px; border-radius: 50%;
              background: #f59e0b;
              box-shadow: 0 0 8px #f59e0b;
              animation: __maint_pulse__ 2s infinite;
            }
            @keyframes __maint_pulse__ {
              0%,100% { opacity:1; transform:scale(1); }
              50% { opacity:.5; transform:scale(1.4); }
            }
            #__maint_overlay__ .__m_icon__ {
              font-size: 56px; line-height: 1;
              margin-bottom: 24px;
              animation: __maint_pop__ .5s cubic-bezier(.34,1.56,.64,1) both;
              animation-delay: .1s;
            }
            @keyframes __maint_pop__ {
              from { transform: scale(.5); opacity: 0; }
              to   { transform: scale(1); opacity: 1; }
            }
            #__maint_overlay__ .__m_title__ {
              font-size: clamp(28px, 5vw, 42px);
              font-weight: 500; letter-spacing: -.04em; line-height: 1.05;
              color: #fff; margin-bottom: 14px;
            }
            #__maint_overlay__ .__m_title__ em {
              font-style: normal; color: #1ede7b;
            }
            #__maint_overlay__ .__m_sub__ {
              font-size: 15px; color: rgba(255,255,255,.35);
              font-weight: 300; line-height: 1.65;
              max-width: 360px; margin: 0 auto 40px;
            }
            #__maint_overlay__ .__m_divider__ {
              width: 48px; height: 1px;
              background: rgba(255,255,255,.08);
              margin: 0 auto 24px;
            }
            #__maint_overlay__ .__m_foot__ {
              font-size: 13px; color: rgba(255,255,255,.2);
              font-weight: 300;
            }
            #__maint_overlay__ .__m_foot__ a {
              color: rgba(30,222,123,.6);
              text-decoration: none;
              transition: color .2s;
            }
            #__maint_overlay__ .__m_foot__ a:hover {
              color: #1ede7b;
            }
          </style>
          <div class="__m_inner__">
            <div class="__m_badge__">Технические работы</div>
            <div class="__m_icon__">🔧</div>
            <h1 class="__m_title__">Скоро <em>вернёмся</em></h1>
            <p class="__m_sub__">Сайт временно недоступен — мы уже работаем над улучшениями. Обычно это занимает не больше часа.</p>
            <div class="__m_divider__"></div>
            <div class="__m_foot__">
              Вопросы? <a href="mailto:support@antviz.ru">support@antviz.ru</a>
            </div>
          </div>
        `;
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

      } else if (!on && overlay) {
        overlay.remove();
        overlay = null;
        document.body.style.overflow = '';
      }
    });

  } catch (e) {
    // тихо игнорируем — не критично
  }
})();
