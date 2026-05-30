// Общие утилиты для всех страниц админки
export function toast(msg, type = 'info') {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.className = `toast ${type} show`;
  setTimeout(() => t.className = 'toast', 3400);
}
export function fmtDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' });
}
export function fmtDateTime(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
}
export function fmtTime(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
}
export function initials(name) { return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2); }
export function stars(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }
export const S_LABELS = ['Новая заявка', 'Обсуждение', 'В работе', 'На проверке', 'Правки', 'Готово'];
