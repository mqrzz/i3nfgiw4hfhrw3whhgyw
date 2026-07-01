(async () => {
  try {
    const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getFirestore, doc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');

    const firebaseConfig = {
      apiKey: "AIzaSyBLGr2hpmnmj1Mxf9072m8vQXJkLUN6YyY",
      authDomain: "antviz-515c8.firebaseapp.com",
      projectId: "antviz-515c8",
      storageBucket: "antviz-515c8.firebasestorage.app",
      messagingSenderId: "140073712504",
      appId: "1:140073712504:web:8a844268e38229cebde68d"
    };
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

    const db = getFirestore(app);
    const auth = getAuth(app);
    let mo = null;
    let currentUser = null;
    let authReady = false;
    let lastOn = null;
    const ADMIN = 'wbtipoofficialcom@gmail.com';

    onAuthStateChanged(auth, user => {
      currentUser = user;
      authReady = true;
      render();
    });

    onSnapshot(doc(db, 'settings', 'maintenance'), snap => {
      lastOn = snap.exists() && snap.data().enabled === true;
      render();
    });

    function render() {
      // Ждём, пока разрешится и авторизация, и статус техработ,
      // чтобы админ не увидел оверлей раньше, чем определится его роль.
      if (!authReady || lastOn === null) return;
      const on = lastOn;
      if (currentUser?.email === ADMIN) {
        if (mo) { mo.remove(); mo = null; document.body.style.overflow = ''; }
        return;
      }

      if (on && !mo) {
        const style = document.createElement('style');
        style.textContent = `
          #maint-overlay {
            position:fixed;inset:0;z-index:99999;background:#fff;
            display:flex;align-items:center;justify-content:center;
            padding:24px;font-family:Geologica,Inter,Arial,sans-serif;
          }
          #maint-card {
            background:#f2f4f7;border-radius:64px;padding:64px 100px 80px;
            text-align:center;max-width:700px;width:100%;
            border:1.5px solid #dfe3e8;
          }
          #maint-label { font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:.1em;color:#1ede7b;margin-bottom:24px; }
          #maint-title { font-size:clamp(40px,7vw,80px);font-weight:500;letter-spacing:-.04em;line-height:1.02;color:#191b1e;margin:0 0 20px; }
          #maint-text { font-size:clamp(15px,1.5vw,18px);color:#707a8a;font-weight:300;line-height:1.6;max-width:440px;margin:0 auto; }
          @media(max-width:600px){
            #maint-card { border-radius:32px;padding:40px 24px 52px; }
          }
        `;
        document.head.appendChild(style);

        mo = document.createElement('div');
        mo.id = 'maint-overlay';
        mo.innerHTML = `
          <div id="maint-card">
            <div id="maint-label">Технические работы</div>
            <h1 id="maint-title">Скоро <em style="font-style:normal;color:#1ede7b">вернёмся</em></h1>
            <p id="maint-text">Сайт временно недоступен — мы уже работаем над улучшениями. Обычно это занимает не больше часа.</p>
          </div>`;
        document.body.appendChild(mo);
        document.body.style.overflow = 'hidden';
      } else if (!on && mo) {
        mo.remove();
        mo = null;
        document.body.style.overflow = '';
      }
    }
  } catch(e) {}
})();
