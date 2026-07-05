/**
 * sessions.js — «Устройства и сеансы» (Antviz)
 *
 * Firebase Auth сам по себе не хранит список сеансов с устройствами,
 * поэтому мы ведём его вручную в Firestore: users/{uid}/sessions/{sessionId}
 *
 * Логика:
 *  - при входе/регистрации (auth.html) → registerSession() создаёт/обновляет
 *    запись сеанса для этого браузера (sessionId лежит в localStorage)
 *  - на каждой защищённой странице (nav.js) → touchSession() раз в ~2 минуты
 *    обновляет lastActive и проверяет: если сеанс помечен revoked — тихо
 *    разлогинивает это устройство (с задержкой до следующей загрузки страницы,
 *    мгновенная блокировка потребовала бы Cloud Function с Admin SDK)
 *  - в profile/settings.html → список сеансов + кнопки «Завершить»
 */

const FS_URL   = "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
const AUTH_URL = "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const TOUCH_INTERVAL_MS = 5 * 60 * 1000; // не чаще раза в 5 минут

/* ───────────────────── sessionId (привязан к браузеру + аккаунту) ───────────────────── */

function sidKey(uid){ return 'av_sid_' + uid; }

export function getSessionId(uid){
  const key = sidKey(uid);
  let sid = localStorage.getItem(key);
  if(!sid){
    sid = (crypto.randomUUID ? crypto.randomUUID() : ('sid-' + Date.now() + '-' + Math.random().toString(16).slice(2)));
    localStorage.setItem(key, sid);
  }
  return sid;
}

export function clearSessionId(uid){
  localStorage.removeItem(sidKey(uid));
  localStorage.removeItem('av_sid_touch_' + uid);
}

/* ───────────────────── User-Agent → устройство/ОС/браузер ───────────────────── */

export function parseUA(uaInput){
  const ua = uaInput || navigator.userAgent || '';
  let deviceType = 'desktop', os = 'Неизвестно', osVersion = '', browser = 'Неизвестно';

  if(/iPhone/i.test(ua)){ deviceType = 'iphone'; os = 'iOS'; }
  else if(/iPad/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)){ deviceType = 'ipad'; os = 'iPadOS'; }
  else if(/Android/i.test(ua)){ deviceType = /Mobile/i.test(ua) ? 'android_phone' : 'android_tablet'; os = 'Android'; }
  else if(/Windows/i.test(ua)){ deviceType = 'windows'; os = 'Windows'; }
  else if(/Macintosh|Mac OS X/i.test(ua)){ deviceType = 'mac'; os = 'macOS'; }
  else if(/Linux/i.test(ua)){ deviceType = 'linux'; os = 'Linux'; }

  let m;
  if(deviceType === 'iphone' || deviceType === 'ipad'){
    m = ua.match(/OS (\d+)_(\d+)/); if(m) osVersion = `${m[1]}.${m[2]}`;
  } else if(os === 'Android'){
    m = ua.match(/Android (\d+(\.\d+)?)/); if(m) osVersion = m[1];
  } else if(os === 'Windows'){
    m = ua.match(/Windows NT (\d+\.\d+)/);
    const map = {'10.0':'10 / 11', '6.3':'8.1', '6.2':'8', '6.1':'7'};
    osVersion = m ? (map[m[1]] || m[1]) : '';
  } else if(os === 'macOS'){
    m = ua.match(/Mac OS X (\d+[_.]\d+)/); if(m) osVersion = m[1].replace('_', '.');
  }

  if(/YaBrowser/i.test(ua)) browser = 'Яндекс Браузер';
  else if(/EdgA|EdgiOS|Edg\//i.test(ua)) browser = 'Edge';
  else if(/OPR\//i.test(ua) || /Opera/i.test(ua)) browser = 'Opera';
  else if(/FxiOS/i.test(ua) || /Firefox/i.test(ua)) browser = 'Firefox';
  else if(/CriOS/i.test(ua) || /Chrome/i.test(ua)) browser = 'Chrome';
  else if(/Safari/i.test(ua)) browser = 'Safari';

  return { deviceType, os, osVersion, browser };
}

/* ───────────────────── Геолокация по IP (без бэкенда, без ключа) ───────────────────── */

export async function fetchGeo(){
  try{
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch('https://ipapi.co/json/', { signal: ctrl.signal });
    clearTimeout(t);
    if(!r.ok) return { ip: null, city: null, country: null };
    const d = await r.json();
    return { ip: d.ip || null, city: d.city || null, country: d.country_name || null };
  }catch(e){
    return { ip: null, city: null, country: null };
  }
}

/* ───────────────────── Создание/реактивация сеанса (вызывается при входе/регистрации) ───────────────────── */

export async function registerSession(db, user){
  try{
    const { doc, getDoc, setDoc, serverTimestamp } = await import(FS_URL);
    const sid = getSessionId(user.uid);
    const ref = doc(db, 'users', user.uid, 'sessions', sid);
    const info = parseUA();
    const geo = await fetchGeo();
    const snap = await getDoc(ref).catch(() => null);

    const data = {
      sessionId: sid,
      deviceType: info.deviceType,
      os: info.os,
      osVersion: info.osVersion,
      browser: info.browser,
      userAgent: navigator.userAgent,
      ip: geo.ip,
      city: geo.city,
      country: geo.country,
      lastActive: serverTimestamp(),
      revoked: false,
      endedAt: null
    };
    if(!snap || !snap.exists()) data.createdAt = serverTimestamp();

    await setDoc(ref, data, { merge: true });
  }catch(e){
    console.error('registerSession error:', e);
  }
}

/* ───────────────────── Периодическая проверка на защищённых страницах ───────────────────── */

export async function touchSession(db, auth, user){
  try{
    const sid = localStorage.getItem(sidKey(user.uid));
    if(!sid) return; // сеанс ещё не зарегистрирован (например, старая сессия до обновления)

    const touchKey = 'av_sid_touch_' + user.uid;
    const last = parseInt(localStorage.getItem(touchKey) || '0', 10);
    const now = Date.now();
    if(now - last < TOUCH_INTERVAL_MS) return;
    localStorage.setItem(touchKey, String(now));

    const { doc, getDoc, updateDoc, serverTimestamp } = await import(FS_URL);
    const ref = doc(db, 'users', user.uid, 'sessions', sid);
    const snap = await getDoc(ref);

    if(!snap.exists()){
      // Документа сеанса нет (например, не успел записаться при входе) —
      // просто создаём его сейчас. Разлогиниваем только если сеанс
      // СУЩЕСТВУЕТ и явно помечен revoked, а не когда его просто нет.
      await registerSession(db, user);
      return;
    }

    if(snap.data().revoked){
      clearSessionId(user.uid);
      const { signOut } = await import(AUTH_URL);
      await signOut(auth);
      const onProfilePath = location.pathname.includes('/profile/');
      window.location.href = onProfilePath ? '../auth' : 'auth';
      return;
    }

    await updateDoc(ref, { lastActive: serverTimestamp() }).catch(() => {});
  }catch(e){
    console.error('touchSession error:', e);
  }
}

/* ───────────────────── Завершение сеансов (settings.html) ───────────────────── */

export async function endSession(db, uid, sessionId){
  const { doc, updateDoc, serverTimestamp } = await import(FS_URL);
  await updateDoc(doc(db, 'users', uid, 'sessions', sessionId), {
    revoked: true,
    endedAt: serverTimestamp()
  });
}

export async function endAllOtherSessions(db, uid, currentSessionId){
  const { collection, getDocs, updateDoc, serverTimestamp } = await import(FS_URL);
  const snap = await getDocs(collection(db, 'users', uid, 'sessions'));
  const jobs = [];
  snap.forEach(d => {
    if(d.id !== currentSessionId && d.data().revoked !== true){
      jobs.push(updateDoc(d.ref, { revoked: true, endedAt: serverTimestamp() }).catch(() => {}));
    }
  });
  await Promise.all(jobs);
}

/* ───────────────────── Помечаем сеанс завершённым при ручном «Выйти» ───────────────────── */

export async function endCurrentSession(db, uid){
  try{
    const sid = localStorage.getItem(sidKey(uid));
    if(sid){
      const { doc, updateDoc, serverTimestamp } = await import(FS_URL);
      await updateDoc(doc(db, 'users', uid, 'sessions', sid), {
        revoked: true,
        endedAt: serverTimestamp()
      }).catch(() => {});
    }
  }catch(e){ /* не блокируем выход из-за ошибки записи */ }
  finally{
    clearSessionId(uid);
  }
}

/* ───────────────────── Человекочитаемое «время назад» ───────────────────── */

export function timeAgo(date){
  if(!date) return '—';
  const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if(diffSec < 60) return 'только что';
  const diffMin = Math.floor(diffSec / 60);
  if(diffMin < 60) return diffMin + ' ' + pluralRu(diffMin, 'минуту', 'минуты', 'минут') + ' назад';
  const diffH = Math.floor(diffMin / 60);
  if(diffH < 24) return diffH + ' ' + pluralRu(diffH, 'час', 'часа', 'часов') + ' назад';
  const diffD = Math.floor(diffH / 24);
  if(diffD < 30) return diffD + ' ' + pluralRu(diffD, 'день', 'дня', 'дней') + ' назад';
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function pluralRu(n, one, few, many){
  const mod10 = n % 10, mod100 = n % 100;
  if(mod10 === 1 && mod100 !== 11) return one;
  if(mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

/* ───────────────────── Иконки устройств и браузеров (SVG-строки) ───────────────────── */

export function deviceLabel(deviceType){
  return ({
    iphone: 'iPhone',
    ipad: 'iPad',
    android_phone: 'Android',
    android_tablet: 'Android планшет',
    windows: 'Windows',
    mac: 'Mac',
    linux: 'Linux',
    desktop: 'Компьютер'
  })[deviceType] || 'Устройство';
}

export function deviceIconSVG(deviceType){
  switch(deviceType){
    case 'iphone':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="7" y="2" width="10" height="20" rx="2.4"/><path d="M11 18.4h2" stroke-linecap="round"/><rect x="10" y="3.1" width="4" height="1.1" rx="0.5" fill="currentColor" stroke="none"/></svg>`;
    case 'ipad':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="2.5" width="16" height="19" rx="2.2"/><path d="M11 19h2" stroke-linecap="round"/></svg>`;
    case 'android_phone':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="7" y="2" width="10" height="20" rx="2.2"/><path d="M9.5 5.4h5" stroke-linecap="round"/><circle cx="12" cy="18.2" r="0.9" fill="currentColor" stroke="none"/></svg>`;
    case 'android_tablet':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="2.5" width="16" height="19" rx="2.2"/><circle cx="12" cy="19" r="0.9" fill="currentColor" stroke="none"/></svg>`;
    case 'windows':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="8" height="8" rx="0.6"/><rect x="13" y="4" width="8" height="8" rx="0.6"/><rect x="3" y="14" width="8" height="8" rx="0.6"/><rect x="13" y="14" width="8" height="8" rx="0.6"/></svg>`;
    case 'mac':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="3.5" width="19" height="13" rx="1.6"/><path d="M8 20.5h8M12 16.5v4" stroke-linecap="round"/></svg>`;
    case 'linux':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="9" r="4.4"/><path d="M8.4 12.2 6 20c-.2.8.6 1.4 1.3.9L10 19M15.6 12.2 18 20c.2.8-.6 1.4-1.3.9L14 19" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="8" r="0.5" fill="currentColor" stroke="none"/><circle cx="14" cy="8" r="0.5" fill="currentColor" stroke="none"/></svg>`;
    default:
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="3.5" width="19" height="13" rx="1.6"/><path d="M8 20.5h8M12 16.5v4" stroke-linecap="round"/></svg>`;
  }
}

export function browserIconSVG(browser){
  switch(browser){
    case 'Chrome':
      return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M12 2a10 10 0 0 1 8.66 5H12a5 5 0 0 0-4.34 2.5L3.34 7.5A10 10 0 0 1 12 2z" fill="#EA4335"/><path d="M3.34 7.5l4.32 7.49A5 5 0 0 0 12 17l-4.33 7.49A10 10 0 0 1 2 12a10 10 0 0 1 1.34-4.5z" fill="#FBBC05"/><path d="M12 17a5 5 0 0 0 4.33-2.5L20.66 7A10 10 0 0 1 12 22a9.96 9.96 0 0 1-4.66-1.15L12 17z" fill="#34A853"/><circle cx="12" cy="12" r="4" fill="#4285F4"/></svg>`;
    case 'Safari':
      return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#e8ecef" stroke="#c7ccd3" stroke-width="0.5"/><path d="M14.3 9.7 9.7 14.3l1.9-6.5 2.7 1.9z" fill="#ff4b3e"/><path d="M9.7 14.3 14.3 9.7l-1.9 6.5-2.7-1.9z" fill="#fff"/></svg>`;
    case 'Firefox':
      return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M20.5 10c-.6-3.4-3.2-6.3-6.6-7.3.9.9 1.5 2 1.8 3.1-1-1-2.5-1.6-4.1-1.4-2.4.3-4.3 2.2-4.6 4.6-.1.9 0 1.7.3 2.4-1-.2-1.9-.8-2.5-1.7-.2 3.7 2.1 6.9 5.4 8.1-2 .1-3.6-.5-4.7-1.6 1.1 3 3.9 5.2 7.3 5.2 4.7 0 8.5-3.9 8.4-8.6 0-1-.2-2-.5-2.8z" fill="#ff9500"/><path d="M20.5 10c-.6-3.4-3.2-6.3-6.6-7.3 1.6 1.6 2.5 3.6 2.4 5.9-.1 3-2.6 5.4-5.6 5.3-1.4 0-2.6-.6-3.5-1.4.5 2.2 2.4 3.9 4.7 4.1-1.4 1-3.2 1.4-5 1.1 1.1 3 3.9 5.2 7.3 5.2 4.7 0 8.5-3.9 8.4-8.6 0-1.4-.4-2.6-1.1-3.7v-.6z" fill="#ff5722"/></svg>`;
    case 'Edge':
      return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M4 14.5c1 3.4 4.3 5.6 8 5.2 3-.3 5.4-2.2 6.3-4.8-1.6 1.6-3.8 2.4-6 2-3-.6-5.1-3.3-4.9-6.3.1-1.8 1-3.3 2.4-4.3-3.6.2-6.4 3.1-6.4 6.7 0 .5 0 1 .1 1.5z" fill="#0d5fbb"/><path d="M20.5 8.8c-1.2-3.4-4.5-5.7-8.2-5.7-2.2 0-4.2.9-5.7 2.3 3-1.1 6.4.2 8 3 1.1 1.9 1.1 4.2.1 6.1 2.5-1 4.4-3.2 5.1-5.8.3-.6.6-1.3.7-1.9z" fill="#3cc9f3"/></svg>`;
    case 'Opera':
      return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><ellipse cx="12" cy="12" rx="5" ry="7.5" fill="none" stroke="#ff1b2d" stroke-width="2"/></svg>`;
    case 'Яндекс Браузер':
      return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#ff0000"/><path d="M13.4 6.5h-1.9c-2.5 0-4.3 1.6-4.3 4 0 1.9 1 3 2.5 3.7l-2.8 4.3h2.2l2.5-3.9h1.2v3.9h1.9V6.5h-1.3zm-1.6 6.1c-1.2 0-1.9-.7-1.9-2 0-1.3.8-2.1 2-2.1h1v4.1h-1.1z" fill="#fff"/></svg>`;
    default:
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.5 2.6 3.8 6 3.8 9.5s-1.3 6.9-3.8 9.5c-2.5-2.6-3.8-6-3.8-9.5S9.5 5.1 12 2.5z"/></svg>`;
  }
}

export function endSessionIconSVG(){
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-linecap="round" stroke-linejoin="round"/><polyline points="16,17 21,12 16,7" stroke-linecap="round" stroke-linejoin="round"/><line x1="21" y1="12" x2="9" y2="12" stroke-linecap="round"/></svg>`;
}
