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
          #maint-svg { width:220px;height:auto;margin-bottom:36px;display:block;margin-left:auto;margin-right:auto; }
          #maint-label { font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:.1em;color:#1ede7b;margin-bottom:24px; }
          #maint-title { font-size:clamp(40px,7vw,80px);font-weight:500;letter-spacing:-.04em;line-height:1.02;color:#191b1e;margin:0 0 20px; }
          #maint-text { font-size:clamp(15px,1.5vw,18px);color:#707a8a;font-weight:300;line-height:1.6;max-width:440px;margin:0 auto; }
          @keyframes maint-spin1 { to { transform: rotate(360deg); } }
          @keyframes maint-spin2 { to { transform: rotate(-360deg); } }
          @keyframes maint-spin3 { to { transform: rotate(360deg); } }
          @keyframes maint-pulse { 0%,100%{opacity:.7}50%{opacity:1} }
          .mg1 { animation: maint-spin1 8s linear infinite; transform-origin: 240px 210px; }
          .mg2 { animation: maint-spin2 5s linear infinite; transform-origin: 380px 210px; }
          .mg3 { animation: maint-spin3 12s linear infinite; transform-origin: 152px 290px; }
          .mglow { animation: maint-pulse 2.5s ease-in-out infinite; }
          @media(max-width:600px){
            #maint-card { border-radius:32px;padding:40px 24px 52px; }
            #maint-svg { width:160px;margin-bottom:24px; }
          }
        `;
        document.head.appendChild(style);

        const svg = `<svg id="maint-svg" viewBox="0 0 520 360" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="60" r="3" fill="#1ede7b" opacity=".2"/>
          <circle cx="440" cy="60" r="3" fill="#1ede7b" opacity=".2"/>
          <circle cx="80" cy="300" r="3" fill="#1ede7b" opacity=".2"/>
          <circle cx="440" cy="300" r="3" fill="#1ede7b" opacity=".2"/>
          <g class="mg1">
            <g fill="#191b1e" stroke="#1ede7b" stroke-width="1.5">
              <rect x="225" y="118" width="30" height="16" rx="4"/>
              <rect x="225" y="198" width="30" height="16" rx="4"/>
              <rect x="188" y="143" width="16" height="30" rx="4"/>
              <rect x="268" y="143" width="16" height="30" rx="4"/>
              <rect x="197" y="125" width="16" height="28" rx="4" transform="rotate(45 205 139)"/>
              <rect x="255" y="125" width="16" height="28" rx="4" transform="rotate(-45 263 139)"/>
              <rect x="197" y="173" width="16" height="28" rx="4" transform="rotate(-45 205 187)"/>
              <rect x="255" y="173" width="16" height="28" rx="4" transform="rotate(45 263 187)"/>
            </g>
            <circle cx="240" cy="168" r="52" fill="#191b1e" stroke="#1ede7b" stroke-width="2"/>
            <circle cx="240" cy="168" r="38" fill="none" stroke="#1ede7b" stroke-width="1" opacity=".4"/>
            <circle cx="240" cy="168" r="14" fill="#0f1012" stroke="#1ede7b" stroke-width="1.5"/>
            <circle cx="240" cy="168" r="6" fill="#1ede7b" opacity=".85"/>
            <line x1="240" y1="130" x2="240" y2="154" stroke="#1ede7b" stroke-width="1.5" opacity=".5"/>
            <line x1="240" y1="182" x2="240" y2="206" stroke="#1ede7b" stroke-width="1.5" opacity=".5"/>
            <line x1="202" y1="168" x2="226" y2="168" stroke="#1ede7b" stroke-width="1.5" opacity=".5"/>
            <line x1="254" y1="168" x2="278" y2="168" stroke="#1ede7b" stroke-width="1.5" opacity=".5"/>
          </g>
          <g class="mg2">
            <g fill="#191b1e" stroke="#2ee88a" stroke-width="1.5">
              <rect x="365" y="130" width="22" height="12" rx="3"/>
              <rect x="365" y="186" width="22" height="12" rx="3"/>
              <rect x="337" y="150" width="12" height="22" rx="3"/>
              <rect x="403" y="150" width="12" height="22" rx="3"/>
              <rect x="346" y="136" width="12" height="22" rx="3" transform="rotate(45 352 147)"/>
              <rect x="390" y="136" width="12" height="22" rx="3" transform="rotate(-45 396 147)"/>
              <rect x="346" y="170" width="12" height="22" rx="3" transform="rotate(-45 352 181)"/>
              <rect x="390" y="170" width="12" height="22" rx="3" transform="rotate(45 396 181)"/>
            </g>
            <circle cx="380" cy="168" r="38" fill="#191b1e" stroke="#2ee88a" stroke-width="1.8"/>
            <circle cx="380" cy="168" r="27" fill="none" stroke="#2ee88a" stroke-width="1" opacity=".35"/>
            <circle cx="380" cy="168" r="10" fill="#0f1012" stroke="#2ee88a" stroke-width="1.5"/>
            <circle cx="380" cy="168" r="4" fill="#2ee88a" opacity=".9"/>
            <line x1="380" y1="141" x2="380" y2="158" stroke="#2ee88a" stroke-width="1.5" opacity=".5"/>
            <line x1="380" y1="178" x2="380" y2="195" stroke="#2ee88a" stroke-width="1.5" opacity=".5"/>
            <line x1="353" y1="168" x2="370" y2="168" stroke="#2ee88a" stroke-width="1.5" opacity=".5"/>
            <line x1="390" y1="168" x2="407" y2="168" stroke="#2ee88a" stroke-width="1.5" opacity=".5"/>
          </g>
          <g class="mg3">
            <g fill="#191b1e" stroke="#1ede7b" stroke-width="1.2">
              <rect x="140" y="221" width="16" height="9" rx="2.5"/>
              <rect x="140" y="268" width="16" height="9" rx="2.5"/>
              <rect x="120" y="235" width="9" height="16" rx="2.5"/>
              <rect x="167" y="235" width="9" height="16" rx="2.5"/>
              <rect x="127" y="227" width="9" height="16" rx="2.5" transform="rotate(45 131 235)"/>
              <rect x="159" y="227" width="9" height="16" rx="2.5" transform="rotate(-45 163 235)"/>
              <rect x="127" y="256" width="9" height="16" rx="2.5" transform="rotate(-45 131 264)"/>
              <rect x="159" y="256" width="9" height="16" rx="2.5" transform="rotate(45 163 264)"/>
            </g>
            <circle cx="152" cy="248" r="28" fill="#191b1e" stroke="#1ede7b" stroke-width="1.5"/>
            <circle cx="152" cy="248" r="19" fill="none" stroke="#1ede7b" stroke-width="0.8" opacity=".3"/>
            <circle cx="152" cy="248" r="7" fill="#0f1012" stroke="#1ede7b" stroke-width="1.2"/>
            <circle cx="152" cy="248" r="3" fill="#1ede7b" opacity=".85"/>
          </g>
          <g opacity=".5" transform="translate(440,120) rotate(-35)">
            <rect x="-5" y="-38" width="10" height="58" rx="5" fill="#1ede7b"/>
            <circle cx="0" cy="-38" r="14" fill="none" stroke="#1ede7b" stroke-width="8"/>
            <rect x="-4" y="-52" width="8" height="18" fill="#f2f4f7"/>
          </g>
          <g class="mglow">
            <circle cx="310" cy="110" r="3" fill="#1ede7b" opacity=".6"/>
            <circle cx="430" cy="228" r="2" fill="#1ede7b" opacity=".5"/>
            <circle cx="175" cy="130" r="2.5" fill="#1ede7b" opacity=".5"/>
          </g>
          <ellipse cx="280" cy="328" rx="130" ry="10" fill="#191b1e" opacity=".1"/>
        </svg>`;

        mo = document.createElement('div');
        mo.id = 'maint-overlay';
        mo.innerHTML = `
          <div id="maint-card">
            ${svg}
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
