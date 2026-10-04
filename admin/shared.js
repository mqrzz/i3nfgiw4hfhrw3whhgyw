
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

export function esc(s) {
  if (s === null || s === undefined) return '';
  const str = String(s);
  return str.replace(/[&<>"']/g, c => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[c] || c;
  });
}

export function fmtDate(ts) {
  if (!ts) return '—';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

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

export function fmtTime(ts) {
  if (!ts) return '';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function fmtPrice(n) {
  if (n === undefined || n === null || isNaN(n)) return '—';
  return Math.round(n).toLocaleString('ru') + ' ₽';
}

export function initials(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return parts.slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('');
}

export function stars(n) {
  const filled = Math.min(Math.max(0, Math.round(n || 0)), 5);
  return '★'.repeat(filled) + '☆'.repeat(5 - filled);
}

export function tsToInput(ts) {
  if (!ts) return '';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

export const S_LABELS = [
  'Новая заявка',
  'Обсуждение',
  'В работе',
  'На проверке',
  'Правки',
  'Готово'
];

export const EXTRAS = {
  domain: 'Домен',
  seo: 'SEO',
  content: 'Контент',
  shop: 'Каталог',
  urgent: 'Срочно',
  support: 'Обслуживание'
};

export const TICKET_STATUS_MAP = {
  open: ['s-open', 'Открыт'],
  'in-progress': ['s-in-progress', 'В обработке'],
  resolved: ['s-resolved', 'Решён'],
  closed: ['s-closed', 'Закрыт']
};

export function ticketStatusBadge(status) {
  const [cls, label] = TICKET_STATUS_MAP[status] || ['s-closed', status];
  return `<span class="sbadge ${cls}"><span class="sbadge-dot"></span>${label}</span>`;
}

export function priorityLabel(priority) {
  const map = {
    high: '<span class="pri-high">Высокий</span>',
    medium: '<span class="pri-medium">Средний</span>',
    low: '<span class="pri-low">Низкий</span>'
  };
  return map[priority] || map.low;
}
