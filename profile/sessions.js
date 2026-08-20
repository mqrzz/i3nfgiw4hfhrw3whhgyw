/**
 * sessions.js — «Устройства и сеансы» (Antviz)
 *
 * Раньше это был клиентский модуль, который сам вёл список сеансов в
 * Firestore (генерировал sessionId в localStorage, спрашивал геолокацию
 * по IP, писал устройство/браузер в БД). Теперь сервер сам создаёт и ведёт
 * запись сеанса при каждом входе (см. /api/auth/login, /api/auth/register/verify) —
 * этот файл стал тонким REST-клиентом поверх /api/sessions.
 */

const API = 'https://antviz.ru/api';

/* ───────────────────── Список активных сеансов ───────────────────── */

export async function listSessions(){
  const resp = await fetch(`${API}/sessions`, { credentials: 'include' });
  if(!resp.ok) throw new Error('Не удалось загрузить список сеансов');
  return resp.json(); // [{ id, device_name, ip_address, last_active_at, created_at, is_current }]
}

/* ───────────────────── Завершение сеансов ───────────────────── */

export async function endSession(sessionId){
  const resp = await fetch(`${API}/sessions/${sessionId}`, { method: 'DELETE', credentials: 'include' });
  if(!resp.ok) throw new Error('Не удалось завершить сеанс');
  return resp.json();
}

export async function endAllOtherSessions(){
  const resp = await fetch(`${API}/sessions`, { method: 'DELETE', credentials: 'include' });
  if(!resp.ok) throw new Error('Не удалось завершить сеансы');
  return resp.json();
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

/* ───────────────────── Иконка устройства по строке device_name ─────────────────────
 * Сервер формирует device_name как "Браузер на ОС" (например "Chrome на Windows"),
 * а не структурированный enum — определяем иконку по вхождению подстроки.
 */
export function deviceIconSVG(deviceName){
  const s = (deviceName || '').toLowerCase();
  if(s.includes('iphone') || (s.includes('ios') && !s.includes('ipad'))){
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="2.2" ry="2.2"/><path d="M11 18h2"/></svg>`;
  }
  if(s.includes('android')){
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="2.2" ry="2.2"/><path d="M11 18h2"/></svg>`;
  }
  if(s.includes('ipad') || s.includes('ipados')){
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2.2" ry="2.2"/><path d="M12 18h.01"/></svg>`;
  }
  if(s.includes('windows')){
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`;
  }
  if(s.includes('mac os') || s.includes('macos') || s.includes(' mac')){
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z"/><path d="M20.054 15.987H3.946"/></svg>`;
  }
  if(s.includes('linux')){
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`;
}

export function endSessionIconSVG(){
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-linecap="round" stroke-linejoin="round"/><polyline points="16,17 21,12 16,7" stroke-linecap="round" stroke-linejoin="round"/><line x1="21" y1="12" x2="9" y2="12" stroke-linecap="round"/></svg>`;
}

/* ───────────────────── Временные заглушки для обратной совместимости ─────────────────────
 * Пока profile.html, tickets.html, sites.html, notifications.html, orders.html,
 * support.html не переведены с Firebase Auth на новый API (это следующий шаг),
 * они по-прежнему импортируют эти два имени. Сервер теперь сам отслеживает
 * активность сеанса при каждом запросе к API, поэтому обе функции — no-op,
 * оставлены только чтобы не ломать импорт на страницах, ещё не переписанных.
 * Удалить, когда все 6 страниц будут переведены на requireAuth() через API.
 */
export async function touchSession(){ /* сервер сам отслеживает last_active_at при каждом запросе к API */ }
export function watchSessionRevocation(){ return () => {}; }
