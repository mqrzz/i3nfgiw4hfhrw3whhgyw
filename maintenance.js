(async () => {
  try {
    const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getFirestore, doc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');

    // Используем уже существующее приложение или создаём новое
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
    const ADMIN = 'wbtipoofficialcom@gmail.com';

    onAuthStateChanged(auth, user => { currentUser = user; });

    onSnapshot(doc(db, 'settings', 'maintenance'), snap => {
      const on = snap.exists() && snap.data().enabled === true;
      if (currentUser?.email === ADMIN) return;

      if (on && !mo) {
        mo = document.createElement('div');
        mo.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#191b1e;display:flex;align-items:center;justify-content:center;padding:24px;font-family:Geologica,Inter,Arial,sans-serif';
        mo.innerHTML = `
          <div style="background:#191b1e;border-radius:64px;padding:80px 100px;text-align:center;position:relative;overflow:hidden;max-width:700px;width:100%;border:1px solid rgba(255,255,255,.06)">
            <div style="position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(30,222,123,.10),transparent);pointer-events:none"></div>
            <div style="font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:.1em;color:#1ede7b;margin-bottom:24px">Технические работы</div>
            <h1 style="font-size:clamp(40px,7vw,80px);font-weight:500;letter-spacing:-.04em;line-height:1.02;color:#fff;margin:0 0 20px">Скоро <em style="font-style:normal;color:#1ede7b">вернёмся</em></h1>
            <p style="font-size:clamp(15px,1.5vw,18px);color:rgba(255,255,255,.45);font-weight:300;line-height:1.6;max-width:440px;margin:0 auto">Сайт временно недоступен — мы уже работаем над улучшениями. Обычно это занимает не больше часа.</p>
          </div>`;
        document.body.appendChild(mo);
        document.body.style.overflow = 'hidden';
      } else if (!on && mo) {
        mo.remove();
        mo = null;
        document.body.style.overflow = '';
      }
    });
  } catch(e) {}
})();
