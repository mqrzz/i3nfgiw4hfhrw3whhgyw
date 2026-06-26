(async () => {
  try {
    const { getApps } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getFirestore, doc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');

    const apps = getApps();
    if (!apps.length) return;

    const db = getFirestore(apps[0]);
    const auth = getAuth(apps[0]);
    let mo = null;
    let currentUser = null;
    const ADMIN = 'wbtipoofficialcom@gmail.com';

    // Ждём пока auth инициализируется
    onAuthStateChanged(auth, user => { currentUser = user; });

    onSnapshot(doc(db, 'settings', 'maintenance'), snap => {
      const on = snap.exists() && snap.data().enabled === true;
      // Администратор не видит экран тех.работ
      if (on && currentUser?.email === ADMIN) return;
      if (!on && currentUser?.email === ADMIN) return;

      if (on && !mo) {
        mo = document.createElement('div');
        mo.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;padding:32px;font-family:Geologica,sans-serif;color:#191b1e';
        mo.innerHTML = '<div style="font-size:40px">🔧</div><div style="font-size:24px;font-weight:500;letter-spacing:-.03em">Технические работы</div><div style="font-size:15px;color:#707a8a;max-width:360px;font-weight:300;line-height:1.6">Сайт временно недоступен — скоро всё будет готово.</div>';
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
