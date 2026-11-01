/* Antviz: простая статистика без cookie. Сервер не хранит IP и не ставит постоянных идентификаторов. */
(function () {
  try {
    if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;
    var p = location.pathname;
    if (p.indexOf('/admin') === 0 || /^(localhost|127\.|192\.168\.)/.test(location.hostname)) return;
    var url = '/api/track';
    function send(k, x) {
      var body = JSON.stringify({ k: k, p: p, r: document.referrer || '', x: x || '' });
      try {
        if (navigator.sendBeacon) navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
        else fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true });
      } catch (e) {}
    }
    send('pv');
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href*="t.me/"]') : null;
      if (a) send('tg', (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50));
    }, true);
    if (/^\/blog\/[^/]+\/?$/.test(p)) {
      var done = false;
      addEventListener('scroll', function () {
        if (done) return;
        var h = document.documentElement;
        if ((h.scrollTop + innerHeight) / h.scrollHeight > 0.8) { done = true; send('read'); }
      }, { passive: true });
    }
  } catch (e) {}
})();
