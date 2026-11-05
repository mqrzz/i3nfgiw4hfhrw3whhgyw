/* Узел: общее ядро приложения. Работает на всех страницах /app/* */
(function () {
  'use strict';
  const UZ = window.UZ = window.UZ || {};
  const B = UZ.base = UZ.B = (window.UZ_BASE || '');
  const IC = window.IC || {};
  const $ = UZ.$ = (s, r) => (r || document).querySelector(s);
  const $$ = UZ.$$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = UZ.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ic = UZ.ic = (n, cls) => (IC[n] || '').replace('class="i"', 'class="i' + (cls ? ' ' + cls : '') + '"');
  const nf = UZ.nf = (n) => Number(n || 0).toLocaleString(UZ.lang === 'en' ? 'en' : 'ru');

  /* ---------- язык ---------- */
  const urlLang = new URLSearchParams(location.search).get('lang');
  if (urlLang === 'ru' || urlLang === 'en') { try { localStorage.setItem('uzel_lang', urlLang); } catch (e) {} }
  let stored = null; try { stored = localStorage.getItem('uzel_lang'); } catch (e) {}
  UZ.lang = stored === 'en' ? 'en' : 'ru';
  UZ.setLang = (l) => { try { localStorage.setItem('uzel_lang', l); } catch (e) {} location.reload(); };
  UZ.t = (k, ...a) => {
    const d = window.I18N || {};
    let v = d[UZ.lang] && d[UZ.lang][k];
    if (v === undefined) v = d.ru && d.ru[k];
    if (v === undefined) return k;
    return typeof v === 'function' ? v(...a) : v;
  };
  const t = UZ.t;
  document.documentElement.lang = UZ.lang;

  /* ---------- сеть ---------- */
  UZ.api = async (path, opt) => {
    opt = opt || {};
    const r = await fetch('/api/uzel' + path, {
      method: opt.method || 'GET', credentials: 'same-origin',
      headers: Object.assign({ 'X-Requested-With': 'uzel' }, opt.body ? { 'Content-Type': 'application/json' } : {}),
      body: opt.body ? JSON.stringify(opt.body) : undefined,
    });
    let j = {}; try { j = await r.json(); } catch (e) {}
    if (!r.ok) { const e = new Error(j.error || t('err.generic')); e.status = r.status; e.data = j; throw e; }
    return j;
  };

  /* ---------- мелочи интерфейса ---------- */
  let tt;
  UZ.toast = (msg, err) => {
    let el = $('#toast'); if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg; el.classList.toggle('err', !!err); el.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('on'), 3200);
  };
  UZ.copy = async (text) => {
    try { await navigator.clipboard.writeText(text); } catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e2) {} ta.remove();
    }
    UZ.toast(t('copied'));
  };
  UZ.confirm = (o) => new Promise((res) => {
    const m = document.createElement('div'); m.className = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = '<div class="box"><h3>' + esc(o.title) + '</h3><p>' + esc(o.text || '') + '</p><div class="acts"><button class="btn g" data-r="0">' + esc(o.cancel || t('cancel')) + '</button><button class="btn' + (o.danger ? ' bad' : '') + '" data-r="1">' + esc(o.ok || t('ok')) + '</button></div></div>';
    const done = (v) => { m.remove(); document.removeEventListener('keydown', kd); res(v); };
    const kd = (e) => { if (e.key === 'Escape') done(false); };
    m.addEventListener('click', (e) => { if (e.target === m) done(false); const b = e.target.closest('[data-r]'); if (b) done(b.dataset.r === '1'); });
    document.addEventListener('keydown', kd); document.body.appendChild(m); const f = $('[data-r="1"]', m); f && f.focus();
  });
  UZ.gradient = (name) => { let h = 0; for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) % 360; return 'linear-gradient(135deg,hsl(' + h + ',85%,62%),hsl(' + ((h + 40) % 360) + ',85%,58%))'; };
  UZ.initials = (name) => { const p = String(name || '').trim().split(/\s+/).filter(Boolean); return ((p[0] || '?')[0] + (p[1] ? p[1][0] : '')).toUpperCase(); };
  UZ.ago = (s) => { const m = Math.round((Date.now() - new Date(s)) / 60000); if (m < 1) return t('ago.now'); if (m < 60) return t('ago.min', m); const h = Math.round(m / 60); if (h < 24) return t('ago.h', h); return new Date(s).toLocaleDateString(UZ.lang === 'en' ? 'en' : 'ru', { day: 'numeric', month: 'short' }); };
  UZ.debounce = (fn, ms) => { let x; return (...a) => { clearTimeout(x); x = setTimeout(() => fn(...a), ms); }; };

  /* ---------- мини-страница (превью) ---------- */
  const THEME_LIST = ['light', 'dark', 'blue', 'warm', 'mint', 'sunset', 'graphite', 'lilac'];
  UZ.THEMES = THEME_LIST;
  UZ.pv = (p, scale) => {
    const ext = p.ext || {}, L = UZ.lang === 'en' ? { call: 'Call', mail: 'Email', route: 'Directions', send: 'Send' } : { call: 'Позвонить', mail: 'Написать', route: 'Как добраться', send: 'Отправить' };
    const av = p.avatar ? '<img src="/api/uzel/media/' + esc(p.avatar) + '" alt="" style="width:100%;height:100%;object-fit:cover">' : esc(UZ.initials(p.name));
    const soc = (p.socials || []).filter((s) => IC['b-' + s.type]).map((s) => '<a>' + IC['b-' + s.type] + '</a>').join('');
    const info = ext.info || {};
    const ct = [info.phone && ['phone', L.call], info.email && ['mail', L.mail], info.address && ['map-pin', L.route]].filter(Boolean).map((x) => '<a>' + ic(x[0]) + '<span>' + x[1] + '</span></a>').join('');
    const now = Date.now();
    const lk = (p.links || []).filter((l) => l.enabled !== false && l.title && (!l.from || Date.parse(l.from) <= now) && (!l.to || Date.parse(l.to) > now)).map((l) => l.kind === 'header' ? '<h2 class="hd">' + esc(l.title) + '</h2>' : '<a>' + ic('link') + '<span>' + esc(l.title) + (l.desc ? '<small>' + esc(l.desc) + '</small>' : '') + '</span>' + ic('arrow-up-right', 'ar') + '</a>').join('');
    const mu = p.music && p.music.title ? '<a>' + ic('music') + '<span>' + esc(p.music.title) + '</span>' + ic('arrow-up-right', 'ar') + '</a>' : '';
    const fm = ext.form && ext.form.enabled ? '<div class="fm"><h2 class="hd" style="margin:0;font:800 calc(9px*var(--s)) var(--display);text-transform:uppercase;opacity:.6">' + esc(ext.form.title || '') + '</h2><i></i><i></i><b></b></div>' : '';
    let acc = '', accStyle = '';
    if (/^#[0-9a-f]{6}$/.test(ext.accent || '')) { const n = parseInt(ext.accent.slice(1), 16), lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; acc = ' ac'; accStyle = ';--ac:' + ext.accent + ';--act:' + (lum > 0.62 ? '#0b0b0d' : '#ffffff'); }
    return '<div class="pv t-' + esc(p.theme || 'light') + ' s-' + esc(ext.shape || 'soft') + acc + '" style="--s:' + (scale || 1) + accStyle + '"><div class="w"><div class="av" style="background:' + UZ.gradient(p.name || '') + '">' + av + '</div><h1>' + esc(p.name || '') + '</h1>' + (p.subtitle ? '<p class="sub">' + esc(p.subtitle) + '</p>' : '') + (p.bio ? '<p class="bio">' + esc(p.bio) + '</p>' : '') + (soc ? '<div class="soc">' + soc + '</div>' : '') + (ct ? '<div class="ct">' + ct + '</div>' : '') + '<div class="lk">' + lk + mu + '</div>' + fm + '</div></div>';
  };
  UZ.phone = (inner, cls) => '<div class="ph ' + (cls || '') + '"><div class="scr"><div class="isl"></div>' + inner + '</div></div>';

  /* ---------- витрина слева на экранах входа и создания ---------- */
  UZ.showcase = () => {
    const en = UZ.lang === 'en';
    const A = en ? { name: 'Lime Coffee', subtitle: 'Coffee and desserts', theme: 'blue', socials: [{ type: 'instagram' }, { type: 'tiktok' }, { type: 'youtube' }], links: [{ title: 'Menu' }, { title: 'Book a table' }, { title: 'Delivery' }], ext: { shape: 'soft', info: { phone: '1' } } }
      : { name: 'Кофейня «Лайм»', subtitle: 'Кофе и десерты, Казань', theme: 'blue', socials: [{ type: 'instagram' }, { type: 'vk' }, { type: 'tiktok' }], links: [{ title: 'Меню' }, { title: 'Забронировать стол' }, { title: 'Доставка' }], ext: { shape: 'soft', info: { phone: '1' } } };
    const Bp = en ? { name: 'Mikhail Dev', subtitle: 'Frontend developer', theme: 'dark', socials: [{ type: 'github' }, { type: 'telegram' }], links: [{ title: 'My blog' }, { title: 'Open source' }, { title: 'Book a call' }], ext: { shape: 'round' } }
      : { name: 'Mikhail Dev', subtitle: 'Frontend-разработчик', theme: 'dark', socials: [{ type: 'github' }, { type: 'telegram' }], links: [{ title: 'Мой блог' }, { title: 'Open source' }, { title: 'Записаться на созвон' }], ext: { shape: 'round' } };
    return '<aside class="show"><a class="lg" href="' + B + '/" style="color:#fff">' + LOGO.replace('<svg', '<svg style="fill:#fff"') + t('brand') + '</a><div class="sh-mid"><h2>' + esc(t('show.h')) + '</h2><p>' + esc(t('show.p')) + '</p><ul>' + ['show.b1', 'show.b2', 'show.b3'].map((k) => '<li>' + ic('check') + esc(t(k)) + '</li>').join('') + '</ul></div><div class="sh-ph" aria-hidden="true">' + UZ.phone(UZ.pv(Bp, .78), 'sm s1') + UZ.phone(UZ.pv(A, .78), 'sm s2') + '</div></aside>';
  };

  /* ---------- каркас ---------- */
  const NAV = [
    ['home', '/app/', 'house', 'nav.home'], ['profile', '/app/profile', 'user', 'nav.profile'], ['links', '/app/links', 'link', 'nav.links'],
    ['design', '/app/design', 'palette', 'nav.design'], ['form', '/app/form', 'inbox', 'nav.form'], ['stats', '/app/stats', 'chart-no-axes-column', 'nav.stats'],
    ['plan', '/app/plan', 'crown', 'nav.plan'], ['security', '/app/security', 'shield-check', 'nav.security'],
  ];
  const TABS = [['home', '/app/', 'house', 'tab.home'], ['profile', '/app/profile', 'user', 'tab.profile'], ['links', '/app/links', 'link', 'tab.links'], ['design', '/app/design', 'palette', 'tab.design'], ['more', '/app/more', 'ellipsis', 'tab.more']];
  const LOGO = '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="6" width="50" height="12" rx="6" opacity=".6"/><rect y="26" width="64" height="12" rx="6"/><rect x="18" y="46" width="38" height="12" rx="6" opacity=".35"/></svg>';
  UZ.LOGO = LOGO;

  UZ.logout = async () => { try { await UZ.api('/auth/logout', { method: 'POST' }); } catch (e) {} location.href = B + '/app/login'; };

  UZ.boot = async (page, opt) => {
    opt = opt || {};
    let me;
    try { me = await UZ.api('/me'); } catch (e) {
      if (e.status === 401) { location.replace(B + '/app/login?next=' + encodeURIComponent(location.pathname)); return null; }
      document.body.innerHTML = '<div class="auth"><div class="card"><h1>' + esc(t('err.generic')) + '</h1><p class="lead2">' + esc(e.message) + '</p><button class="btn" onclick="location.reload()">' + esc(t('retry')) + '</button></div></div>'; return null;
    }
    UZ.me = me;
    if (!me.page && !opt.noPage) { location.replace(B + '/app/start'); return null; }
    document.body.className = 'app';
    const unread = me.unread || 0, pro = me.plan.paid;
    const nav = NAV.map(([id, href, icon, key]) => '<a class="nv' + (id === page ? ' on' : '') + '" href="' + B + href + '">' + ic(icon) + '<span>' + esc(t(key)) + '</span>' + (id === 'form' && unread ? '<b class="bdg">' + unread + '</b>' : '') + (id === 'plan' && !pro ? '<b class="tag">Pro</b>' : '') + '</a>').join('');
    const tabs = TABS.map(([id, href, icon, key]) => '<a href="' + B + href + '" class="' + ((id === page || (id === 'more' && ['form', 'stats', 'plan', 'security', 'more'].includes(page))) ? 'on' : '') + '">' + ic(icon) + '<span>' + esc(t(key)) + '</span>' + (id === 'more' && unread ? '<b class="bdg">' + unread + '</b>' : '') + '</a>').join('');
    const title = t('nav.' + page);
    document.title = title + ' · ' + t('brand');
    document.body.innerHTML =
      '<aside class="side"><a class="lg" href="' + B + '/app/">' + LOGO + t('brand') + '</a>' + nav + '<div class="sp"></div><div class="who"><div class="ava">' + esc(UZ.initials(me.user.name || me.user.email)) + '</div><div style="min-width:0"><b>' + esc(me.user.name || me.user.email.split('@')[0]) + '</b><small>' + esc(me.user.email) + '</small></div></div><button class="nv" id="lgo">' + ic('log-out') + '<span>' + esc(t('logout')) + '</span></button></aside>' +
      '<header class="top"><div class="t">' + esc(title) + '</div><a class="ib" href="' + B + '/app/preview" aria-label="' + esc(t('preview')) + '">' + ic('eye') + '</a></header>' +
      '<main class="main"><div class="inner' + (opt.wide ? ' wide' : '') + '" id="view"></div></main>' +
      '<nav class="tabbar" aria-label="' + esc(t('nav.menu')) + '">' + tabs + '</nav>' +
      '<div class="savebar" id="savebar"><div class="in"><span>' + esc(t('unsaved')) + '</span><button class="btn g sm" id="sbR">' + esc(t('discard')) + '</button><button class="btn sm" id="sbS">' + esc(t('save')) + '</button></div></div>';
    $('#lgo').onclick = UZ.logout;
    return me;
  };

  /* ---------- сохранение: панель появляется, только когда есть изменения ---------- */
  UZ.tracker = (snap, save) => {
    let base = JSON.stringify(snap()), saving = false;
    const bar = $('#savebar');
    const dirty = () => JSON.stringify(snap()) !== base;
    const check = () => bar && bar.classList.toggle('on', dirty());
    const doSave = async () => {
      if (saving || !dirty()) return; saving = true; const b = $('#sbS'); b.disabled = true; b.textContent = t('saving');
      try { await save(); base = JSON.stringify(snap()); UZ.toast(t('saved')); } catch (e) { UZ.toast(e.message, true); }
      saving = false; b.disabled = false; b.textContent = t('save'); check();
    };
    $('#sbS').onclick = doSave; $('#sbR').onclick = () => location.reload();
    document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); doSave(); } });
    window.addEventListener('beforeunload', (e) => { if (dirty()) { e.preventDefault(); e.returnValue = ''; } });
    return { check, save: doSave, dirty, touch() { base = ''; check(); }, rebase() { base = JSON.stringify(snap()); check(); } };
  };
  UZ.savePage = async (patch) => { const r = await UZ.api('/me/page', { method: 'PUT', body: patch }); UZ.me.page = r.page; return r.page; };

  UZ.proLock = (text) => '<a class="lock" href="' + B + '/app/plan">' + ic('lock') + (text || 'Pro') + '</a>';
  UZ.head = (title, sub, acts) => '<div class="head"><div><h1>' + esc(title) + '</h1>' + (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div>' + (acts ? '<div class="acts">' + acts + '</div>' : '') + '</div>';
})();
