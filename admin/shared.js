// ============================================================
// shared.js — единый набор утилит для админ-панели Antviz
// ============================================================

/**
 * Показывает всплывающее уведомление (тост)
 * @param {string} msg — текст сообщения
 * @param {string} type — тип: 'info' | 'success' | 'error' | 'warn'
 */
export function toast(msg, type = 'info') {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = `toast ${type} show`;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => {
    el.className = 'toast';
  }, 3400);
}

/**
 * Экранирует HTML-символы для безопасной вставки в DOM
 * @param {*} s — значение для экранирования
 * @returns {string} — безопасная строка
 */
export function esc(s) {
  if (s === null || s === undefined) return '';
  const str = String(s);
  return str.replace(/[&<>"']/g, c => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[c] || c;
  });
}

/**
 * Форматирует дату в короткий формат: "12 июн 2025"
 * @param {*} ts — Timestamp Firestore, Date или строка
 * @returns {string} — отформатированная дата
 */
export function fmtDate(ts) {
  if (!ts) return '—';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

/**
 * Форматирует дату и время: "12 июн 2025, 14:30"
 * @param {*} ts — Timestamp Firestore, Date или строка
 * @returns {string} — отформатированная дата и время
 */
export function fmtDateTime(ts) {
  if (!ts) return '—';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' }) +
           ' ' + d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

/**
 * Форматирует только время: "14:30"
 * @param {*} ts — Timestamp Firestore, Date или строка
 * @returns {string} — время
 */
export function fmtTime(ts) {
  if (!ts) return '';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

/**
 * Форматирует цену в рубли с пробелами
 * @param {number} n — сумма
 * @returns {string} — "1 234 ₽" или "—"
 */
export function fmtPrice(n) {
  if (n === undefined || n === null || isNaN(n)) return '—';
  return Math.round(n).toLocaleString('ru') + ' ₽';
}

/**
 * Получает инициалы из имени (макс. 2 буквы)
 * @param {string} name — полное имя
 * @returns {string} — инициалы (например, "АБ")
 */
export function initials(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return parts.slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('');
}

/**
 * Генерирует строку из звёзд для рейтинга
 * @param {number} n — количество звёзд (0-5)
 * @returns {string} — "★★★★★" или "★★★☆☆"
 */
export function stars(n) {
  const filled = Math.min(Math.max(0, Math.round(n || 0)), 5);
  return '★'.repeat(filled) + '☆'.repeat(5 - filled);
}

/**
 * Преобразует Timestamp Firestore в строку для input type="date"
 * @param {*} ts — Timestamp Firestore, Date или строка
 * @returns {string} — "2025-06-24"
 */
export function tsToInput(ts) {
  if (!ts) return '';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

/**
 * Названия статусов заказов (индекс → текст)
 */
export const S_LABELS = [
  'Новая заявка',
  'Обсуждение',
  'В работе',
  'На проверке',
  'Правки',
  'Готово'
];

/**
 * Сопоставление кодов дополнений с человекочитаемыми названиями
 */
export const EXTRAS = {
  domain: 'Домен',
  seo: 'SEO',
  content: 'Контент',
  shop: 'Каталог',
  urgent: 'Срочно',
  support: 'Обслуживание'
};

/**
 * Сопоставление статусов тикетов с CSS-классами для бейджей
 */
export const TICKET_STATUS_MAP = {
  open: ['s-open', 'Открыт'],
  'in-progress': ['s-in-progress', 'В обработке'],
  resolved: ['s-resolved', 'Решён'],
  closed: ['s-closed', 'Закрыт']
};

/**
 * Возвращает HTML-бейдж для статуса тикета
 * @param {string} status — ключ статуса
 * @returns {string} — HTML-строка
 */
export function ticketStatusBadge(status) {
  const [cls, label] = TICKET_STATUS_MAP[status] || ['s-closed', status];
  return `<span class="sbadge ${cls}"><span class="sbadge-dot"></span>${label}</span>`;
}

/**
 * Возвращает HTML-метку приоритета тикета
 * @param {string} priority — 'low' | 'medium' | 'high'
 * @returns {string} — HTML-строка
 */
export function priorityLabel(priority) {
  const map = {
    high: '<span class="pri-high">Высокий</span>',
    medium: '<span class="pri-medium">Средний</span>',
    low: '<span class="pri-low">Низкий</span>'
  };
  return map[priority] || map.low;
}
