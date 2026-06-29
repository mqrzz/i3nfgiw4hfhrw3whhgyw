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
    const ADMIN = 'wbtipoofficialcom@gmail.com';

    onAuthStateChanged(auth, user => { currentUser = user; });

    onSnapshot(doc(db, 'settings', 'maintenance'), snap => {
      const on = snap.exists() && snap.data().enabled === true;
      if (currentUser?.email === ADMIN) return;

      if (on && !mo) {
        const style = document.createElement('style');
        style.textContent = `
          #maint-overlay { position:fixed;inset:0;z-index:99999;background:#fff;display:flex;align-items:center;justify-content:center;padding:24px;font-family:Geologica,Inter,Arial,sans-serif }
          #maint-card { background:#f2f4f7;border-radius:64px;padding:80px 100px;text-align:center;position:relative;overflow:hidden;max-width:700px;width:100%;border:1.5px solid #dfe3e8 }
          #maint-img { width:72px;height:72px;border-radius:50%;object-fit:cover;margin-bottom:28px }
          #maint-label { font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:.1em;color:#1ede7b;margin-bottom:24px }
          #maint-title { font-size:clamp(40px,7vw,80px);font-weight:500;letter-spacing:-.04em;line-height:1.02;color:#191b1e;margin:0 0 20px }
          #maint-text { font-size:clamp(15px,1.5vw,18px);color:#707a8a;font-weight:300;line-height:1.6;max-width:440px;margin:0 auto }
          @media(max-width:600px){
            #maint-card { border-radius:32px;padding:48px 28px }
            #maint-img { width:56px;height:56px;margin-bottom:20px }
          }
        `;
        document.head.appendChild(style);

        mo = document.createElement('div');
        mo.id = 'maint-overlay';
        mo.innerHTML = `
          <div id="maint-card">
            <img id="maint-img" src="https://i.ibb.co/1JzQr7r5/1d4d9bc1-2fbc-4415-8b99-c3cf4308f69e.png" alt="">
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
    });
  } catch(e) {}
})();
