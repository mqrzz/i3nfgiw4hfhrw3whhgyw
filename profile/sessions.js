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

const TOUCH_INTERVAL_MS = 5 * 60 * 1000; // не чаще раза в 5 мин.

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

/* ───────────────────── User-Agent Client Hints (реальная версия ОС + модель устройства) ─────────────────────
 * Chrome/Edge/YaBrowser с 2020-х годов «замораживают» версию ОС в обычном User-Agent
 * из соображений приватности (User-Agent Reduction) — Android там ВСЕГДА показывается
 * как "Android 10", независимо от реальной версии. Чтобы получить настоящую версию
 * и модель устройства (например "Pixel 8"), нужно явно запросить High Entropy hints.
 * Поддерживается только в Chromium-браузерах (Chrome, Edge, Яндекс.Браузер, Opera).
 * В Safari/Firefox navigator.userAgentData нет — там просто вернёмся к разбору UA-строки.
 */
export async function getClientHints(){
  try{
    if(!(navigator.userAgentData && navigator.userAgentData.getHighEntropyValues)) return null;
    const uh = await navigator.userAgentData.getHighEntropyValues(['platform', 'platformVersion', 'model', 'mobile']);
    return {
      platform: uh.platform || '',
      platformVersion: uh.platformVersion || '',
      model: (uh.model || '').trim(),
      mobile: !!uh.mobile
    };
  }catch(e){
    return null;
  }
}

// Переводит "сырой" platformVersion из Client Hints в человекочитаемую версию ОС.
// Спецификация: https://wicg.github.io/ua-client-hints/#os-version
function realOsVersionFromHints(platform, platformVersion){
  if(!platformVersion) return null;
  if(platform === 'Android') return platformVersion; // тут уже настоящая версия Android, например "15"
  if(platform === 'Windows'){
    const major = parseInt(platformVersion.split('.')[0], 10);
    if(isNaN(major)) return null;
    return major >= 13 ? '11' : '10'; // да, у Windows 11 platformVersion начинается с 13+
  }
  if(platform === 'macOS'){
    const parts = platformVersion.split('.');
    return parts.slice(0, 2).join('.');
  }
  return platformVersion;
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

    // Уточняем deviceType/osVersion через Client Hints, если браузер их поддерживает —
    // это единственный способ узнать реальную версию Android (UA-строка её скрывает).
    const hints = await getClientHints();
    let deviceModel = null;
    if(hints){
      if(hints.platform === 'Android'){
        info.deviceType = hints.mobile ? 'android_phone' : 'android_tablet';
        info.os = 'Android';
      }
      const realVer = realOsVersionFromHints(hints.platform, hints.platformVersion);
      if(realVer) info.osVersion = realVer;
      if(hints.model) deviceModel = hints.model;
    }

    const geo = await fetchGeo();
    const snap = await getDoc(ref).catch(() => null);

    const data = {
      sessionId: sid,
      deviceType: info.deviceType,
      deviceModel,
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
      // Документа сеанса нет — просто создаём его сейчас, ничего больше не делаем.
      await registerSession(db, user);
      return;
    }

    // ВАЖНО: автоматический принудительный signOut() отключён намеренно.
    // Кнопка «Завершить» в настройках по-прежнему помечает сеанс revoked:true
    // в Firestore и он пропадает из списка (visible-эффект для владельца
    // аккаунта, который смотрит список), но сама сессия в браузере
    // остальных устройств больше НЕ разлогинивается автоматически —
    // слишком велика цена случайного ложного срабатывания.
    // Если понадобится вернуть настоящий remote-logout, самый безопасный
    // способ — Cloud Function + Admin SDK revokeRefreshTokens(uid), а не
    // проверка флага из клиента.
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

// Иконки устройств — на основе Lucide (ISC license), тот же монолиновый стиль,
// что и остальные иконки в интерфейсе Antviz (stroke=currentColor).
export function deviceIconSVG(deviceType){
  switch(deviceType){
    case 'iphone':
    case 'android_phone':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="2.2" ry="2.2"/><path d="M11 18h2"/></svg>`;
    case 'ipad':
    case 'android_tablet':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2.2" ry="2.2"/><path d="M12 18h.01"/></svg>`;
    case 'windows':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`;
    case 'mac':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z"/><path d="M20.054 15.987H3.946"/></svg>`;
    case 'linux':
      return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 00-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 00-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 00-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 00-.205.334 1.18 1.18 0 00-.09.4v.019c.002.089.008.179.02.267-.193-.067-.438-.135-.607-.202a1.635 1.635 0 01-.018-.2v-.02a1.772 1.772 0 01.15-.768c.082-.22.232-.406.43-.533a.985.985 0 01.594-.2zm-2.962.059h.036c.142 0 .27.048.399.135.146.129.264.288.344.465.09.199.14.4.153.667v.004c.007.134.006.2-.002.266v.08c-.03.007-.056.018-.083.024-.152.055-.274.135-.393.2.012-.09.013-.18.003-.267v-.015c-.012-.133-.04-.2-.082-.333a.613.613 0 00-.166-.267.248.248 0 00-.183-.064h-.021c-.071.006-.13.04-.186.132a.552.552 0 00-.12.27.944.944 0 00-.023.33v.015c.012.135.037.2.08.334.046.134.098.2.166.268.01.009.02.018.034.024-.07.057-.117.07-.176.136a.304.304 0 01-.131.068 2.62 2.62 0 01-.275-.402 1.772 1.772 0 01-.155-.667 1.759 1.759 0 01.08-.668 1.43 1.43 0 01.283-.535c.128-.133.26-.2.418-.2zm1.37 1.706c.332 0 .733.065 1.216.399.293.2.523.269 1.052.468h.003c.255.136.405.266.478.399v-.131a.571.571 0 01.016.47c-.123.31-.516.643-1.063.842v.002c-.268.135-.501.333-.775.465-.276.135-.588.292-1.012.267a1.139 1.139 0 01-.448-.067 3.566 3.566 0 01-.322-.198c-.195-.135-.363-.332-.612-.465v-.005h-.005c-.4-.246-.616-.512-.686-.71-.07-.268-.005-.47.193-.6.224-.135.38-.271.483-.336.104-.074.143-.102.176-.131h.002v-.003c.169-.202.436-.47.839-.601.139-.036.294-.065.466-.065zm2.8 2.142c.358 1.417 1.196 3.475 1.735 4.473.286.534.855 1.659 1.102 3.024.156-.005.33.018.513.064.646-1.671-.546-3.467-1.089-3.966-.22-.2-.232-.335-.123-.335.59.534 1.365 1.572 1.646 2.757.13.535.16 1.104.021 1.67.067.028.135.06.205.067 1.032.534 1.413.938 1.23 1.537v-.043c-.06-.003-.12 0-.18 0h-.016c.151-.467-.182-.825-1.065-1.224-.915-.4-1.646-.336-1.77.465-.008.043-.013.066-.018.135-.068.023-.139.053-.209.064-.43.268-.662.669-.793 1.187-.13.533-.17 1.156-.205 1.869v.003c-.02.334-.17.838-.319 1.35-1.5 1.072-3.58 1.538-5.348.334a2.645 2.645 0 00-.402-.533 1.45 1.45 0 00-.275-.333c.182 0 .338-.03.465-.067a.615.615 0 00.314-.334c.108-.267 0-.697-.345-1.163-.345-.467-.931-.995-1.788-1.521-.63-.4-.986-.87-1.15-1.396-.165-.534-.143-1.085-.015-1.645.245-1.07.873-2.11 1.274-2.763.107-.065.037.135-.408.974-.396.751-1.14 2.497-.122 3.854a8.123 8.123 0 01.647-2.876c.564-1.278 1.743-3.504 1.836-5.268.048.036.217.135.289.202.218.133.38.333.59.465.21.201.477.335.876.335.039.003.075.006.11.006.412 0 .73-.134.997-.268.29-.134.52-.334.74-.4h.005c.467-.135.835-.402 1.044-.7zm2.185 8.958c.037.6.343 1.245.882 1.377.588.134 1.434-.333 1.791-.765l.211-.01c.315-.007.577.01.847.268l.003.003c.208.199.305.53.391.876.085.4.154.78.409 1.066.486.527.645.906.636 1.14l.003-.007v.018l-.003-.012c-.015.262-.185.396-.498.595-.63.401-1.746.712-2.457 1.57-.618.737-1.37 1.14-2.036 1.191-.664.053-1.237-.2-1.574-.898l-.005-.003c-.21-.4-.12-1.025.056-1.69.176-.668.428-1.344.463-1.897.037-.714.076-1.335.195-1.814.12-.465.308-.797.641-.984l.045-.022zm-10.814.049h.01c.053 0 .105.005.157.014.376.055.706.333 1.023.752l.91 1.664.003.003c.243.533.754 1.064 1.189 1.637.434.598.77 1.131.729 1.57v.006c-.057.744-.48 1.148-1.125 1.294-.645.135-1.52.002-2.395-.464-.968-.536-2.118-.469-2.857-.602-.369-.066-.61-.2-.723-.4-.11-.2-.113-.602.123-1.23v-.004l.002-.003c.117-.334.03-.752-.027-1.118-.055-.401-.083-.71.043-.94.16-.334.396-.4.69-.533.294-.135.64-.202.915-.47h.002v-.002c.256-.268.445-.601.668-.838.19-.201.38-.336.663-.336zm7.159-9.074c-.435.201-.945.535-1.488.535-.542 0-.97-.267-1.28-.466-.154-.134-.28-.268-.373-.335-.164-.134-.144-.333-.074-.333.109.016.129.134.199.2.096.066.215.2.36.333.292.2.68.467 1.167.467.485 0 1.053-.267 1.398-.466.195-.135.445-.334.648-.467.156-.136.149-.267.279-.267.128.016.034.134-.147.332a8.097 8.097 0 01-.69.468zm-1.082-1.583V5.64c-.006-.02.013-.042.029-.05.074-.043.18-.027.26.004.063 0 .16.067.15.135-.006.049-.085.066-.135.066-.055 0-.092-.043-.141-.068-.052-.018-.146-.008-.163-.065zm-.551 0c-.02.058-.113.049-.166.066-.047.025-.086.068-.14.068-.05 0-.13-.02-.136-.068-.01-.066.088-.133.15-.133.08-.031.184-.047.259-.005.019.009.036.03.03.05v.02h.003z"/></svg>`;
    default:
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`;
  }
}

// Иконки браузеров — официальные монохромные брендмарки из Simple Icons
// (CC0 1.0, simple-icons.org), залитые фирменным цветом бренда. Раньше здесь
// были кустарные многоцветные реконструкции — из-за каскада `.session-icon svg`
// в CSS они ещё и красились в серый (см. фикс в settings.html), выглядело сломанным.
export function browserIconSVG(browser){
  switch(browser){
    case 'Chrome':
      return `<svg viewBox="0 0 24 24" fill="#4285F4"><path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-5.344 9.257c.206.01.413.016.621.016 6.627 0 12-5.373 12-12 0-1.54-.29-3.011-.818-4.364zM12 16.364a4.364 4.364 0 1 1 0-8.728 4.364 4.364 0 0 1 0 8.728Z"/></svg>`;
    case 'Safari':
      return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="#006CFF" stroke-width="1.4"/><circle cx="12" cy="12" r="8.3" fill="#eef4ff"/><path d="M14.3 9.7 9.7 14.3l1.9-6.5z" fill="#FF3B30"/><path d="M9.7 14.3 14.3 9.7l-1.9 6.5z" fill="#fff" stroke="#c6d6ef" stroke-width="0.3"/></svg>`;
    case 'Firefox':
      return `<svg viewBox="0 0 24 24" fill="#FF7139"><path d="M8.824 7.287c.008 0 .004 0 0 0zm-2.8-1.4c.006 0 .003 0 0 0zm16.754 2.161c-.505-1.215-1.53-2.528-2.333-2.943.654 1.283 1.033 2.57 1.177 3.53l.002.02c-1.314-3.278-3.544-4.6-5.366-7.477-.091-.147-.184-.292-.273-.446a3.545 3.545 0 01-.13-.24 2.118 2.118 0 01-.172-.46.03.03 0 00-.027-.03.038.038 0 00-.021 0l-.006.001a.037.037 0 00-.01.005L15.624 0c-2.585 1.515-3.657 4.168-3.932 5.856a6.197 6.197 0 00-2.305.587.297.297 0 00-.147.37c.057.162.24.24.396.17a5.622 5.622 0 012.008-.523l.067-.005a5.847 5.847 0 011.957.222l.095.03a5.816 5.816 0 01.616.228c.08.036.16.073.238.112l.107.055a5.835 5.835 0 01.368.211 5.953 5.953 0 012.034 2.104c-.62-.437-1.733-.868-2.803-.681 4.183 2.09 3.06 9.292-2.737 9.02a5.164 5.164 0 01-1.513-.292 4.42 4.42 0 01-.538-.232c-1.42-.735-2.593-2.121-2.74-3.806 0 0 .537-2 3.845-2 .357 0 1.38-.998 1.398-1.287-.005-.095-2.029-.9-2.817-1.677-.422-.416-.622-.616-.8-.767a3.47 3.47 0 00-.301-.227 5.388 5.388 0 01-.032-2.842c-1.195.544-2.124 1.403-2.8 2.163h-.006c-.46-.584-.428-2.51-.402-2.913-.006-.025-.343.176-.389.206-.406.29-.787.616-1.136.974-.397.403-.76.839-1.085 1.303a9.816 9.816 0 00-1.562 3.52c-.003.013-.11.487-.19 1.073-.013.09-.026.181-.037.272a7.8 7.8 0 00-.069.667l-.002.034-.023.387-.001.06C.386 18.795 5.593 24 12.016 24c5.752 0 10.527-4.176 11.463-9.661.02-.149.035-.298.052-.448.232-1.994-.025-4.09-.753-5.844z"/></svg>`;
    case 'Opera':
      return `<svg viewBox="0 0 24 24" fill="#FF1B2D"><path d="M8.051 5.238c-1.328 1.566-2.186 3.883-2.246 6.48v.564c.061 2.598.918 4.912 2.246 6.479 1.721 2.236 4.279 3.654 7.139 3.654 1.756 0 3.4-.537 4.807-1.471C17.879 22.846 15.074 24 12 24c-.192 0-.383-.004-.57-.014C5.064 23.689 0 18.436 0 12 0 5.371 5.373 0 12 0h.045c3.055.012 5.84 1.166 7.953 3.055-1.408-.93-3.051-1.471-4.81-1.471-2.858 0-5.417 1.42-7.14 3.654h.003zM24 12c0 3.556-1.545 6.748-4.002 8.945-3.078 1.5-5.946.451-6.896-.205 3.023-.664 5.307-4.32 5.307-8.74 0-4.422-2.283-8.075-5.307-8.74.949-.654 3.818-1.703 6.896-.205C22.455 5.25 24 8.445 24 12z"/></svg>`;
    case 'Edge':
      // Официального SVG у Microsoft Edge в открытых наборах иконок нет (снят из-за товарного знака),
      // поэтому здесь — узнаваемая упрощённая заливка в фирменных цветах Edge.
      return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#0078D4"/><path d="M6.1 15.2c1.7 2.7 5.1 3.9 8.2 2.7-3.5.1-6.2-1.8-6.7-4.3-.4-2.1.6-4.1 2.5-4.9-2.8-.3-5 1.8-5 4.3 0 .8.2 1.5.5 2.2h.5z" fill="#37C273"/><path d="M17.3 8.6c-1-2.7-3.7-4.4-6.6-4.1 2.4.2 4.2 2 4.6 4.3.4 2.4-1 4.7-3.2 5.5 3-.1 5.4-2.6 5.4-5.6 0-.1 0-.1-.2-.1z" fill="#8AD9FF"/></svg>`;
    case 'Яндекс Браузер':
      // Аналогично — открытого SVG самого браузера (не поискового логотипа) нет, рисуем сами.
      return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#FC3F1D"/><path d="M12 4.4a7.6 7.6 0 1 1-6.58 11.4" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round"/><path d="M12 12v6.2" stroke="#fff" stroke-width="2.3" stroke-linecap="round"/></svg>`;
    default:
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#9aa2b1" stroke-width="1.6"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.5 2.6 3.8 6 3.8 9.5s-1.3 6.9-3.8 9.5c-2.5-2.6-3.8-6-3.8-9.5S9.5 5.1 12 2.5z"/></svg>`;
  }
}

export function endSessionIconSVG(){
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-linecap="round" stroke-linejoin="round"/><polyline points="16,17 21,12 16,7" stroke-linecap="round" stroke-linejoin="round"/><line x1="21" y1="12" x2="9" y2="12" stroke-linecap="round"/></svg>`;
}
