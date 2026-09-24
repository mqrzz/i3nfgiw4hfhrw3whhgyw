// cabinet-attach.js — подготовка вложений для тикетов поддержки (общий модуль
// для страниц support-new и support-chat).
//   • картинки (png/jpg/webp/gif) сжимаются в браузере и уходят как imageUrl — как и раньше;
//   • остальные файлы (pdf, zip, документы офиса, txt/csv…) уходят как file {name, dataUrl}
//     и хранятся на сервере отдельно от текста сообщения.
// Лимиты продублированы на сервере (routes/tickets.js): файл ≤ 8 МБ.

export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const FILE_EXT = ['pdf', 'zip', 'rar', '7z', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf', 'odt', 'ods'];
export const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,' + FILE_EXT.map(e => '.' + e).join(',');

export function fmtSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + ' КБ';
  return (bytes / 1024 / 1024).toFixed(1).replace('.0', '') + ' МБ';
}

export function extOf(name) { return (String(name).split('.').pop() || '').toLowerCase(); }

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error('Не удалось прочитать файл'));
    r.readAsDataURL(file);
  });
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const MAX = 1600;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        const k = MAX / Math.max(width, height);
        width = Math.round(width * k); height = Math.round(height * k);
      }
      const c = document.createElement('canvas');
      c.width = width; c.height = height;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, width, height); // прозрачные png → белый фон
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Не удалось открыть изображение')); };
    img.src = url;
  });
}

// Возвращает { kind:'image'|'file', name, size, mime, dataUrl } или бросает Error с текстом для пользователя
export async function prepareFile(file) {
  const ext = extOf(file.name);
  const isImg = /^image\/(png|jpeg|webp|gif)$/.test(file.type);
  if (isImg) {
    const dataUrl = await compressImage(file);
    const size = Math.round((dataUrl.length - dataUrl.indexOf(',') - 1) * 3 / 4);
    return { kind: 'image', name: file.name, size, mime: 'image/jpeg', dataUrl };
  }
  if (file.type.startsWith('image/')) throw new Error('Формат изображения не поддерживается (нужен png, jpg, webp или gif)');
  if (!FILE_EXT.includes(ext)) throw new Error(`Файлы .${ext || '?'} не поддерживаются`);
  if (file.size > MAX_FILE_BYTES) throw new Error(`«${file.name}» больше 8 МБ`);
  if (!file.size) throw new Error(`«${file.name}» пустой`);
  const dataUrl = await readAsDataURL(file);
  return { kind: 'file', name: file.name, size: file.size, mime: file.type || 'application/octet-stream', dataUrl };
}

// Тело для POST /tickets и POST /tickets/:id/messages из подготовленного вложения
export function attachmentPayload(att) {
  if (!att) return {};
  return att.kind === 'image' ? { imageUrl: att.dataUrl } : { file: { name: att.name, dataUrl: att.dataUrl } };
}
