(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  var header = $('.site-header');
  var burger = $('.burger');
  var menu = $('.menu');

  function onHeader() {
    if (header) header.classList.toggle('is-solid', window.scrollY > 40);
  }
  window.addEventListener('scroll', onHeader, { passive: true });
  onHeader();

  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open);
      burger.innerHTML = open ? burger.dataset.close : burger.dataset.open;
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('is-open');
        document.body.style.overflow = '';
        burger.setAttribute('aria-expanded', 'false');
        burger.innerHTML = burger.dataset.open;
      });
    });
  }

  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' }) : null;
  $$('[data-in]').forEach(function (el) {
    if (io) io.observe(el); else el.classList.add('in');
  });

  var track = $('.hero-track');
  if (track) {
    var view = $('.hero-view', track);
    var canvas = $('canvas', view);
    var ph1 = $('.ph--1', view), ph2 = $('.ph--2', view), ph3 = $('.ph--3', view);
    var hint = $('.scroll-hint', view);
    var paths = $$('.rb', view);
    var pillsEl = $('.pills', view);
    var mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    var prog = 0;

    var A = [
      [[-120, 90], [300, 30], [720, 290], [1560, 410]],
      [[-120, 270], [420, 230], [920, 520], [1560, 570]],
      [[-120, 420], [420, 400], [900, 610], [1560, 700]]
    ];
    var B = [
      [[100, 250], [520, 430], [900, 300], [1560, 150]],
      [[-120, 470], [520, 520], [920, 420], [1560, 400]],
      [[-120, 640], [520, 800], [1000, 520], [1560, 540]]
    ];

    function ribbons(t, time) {
      var k = smooth(0.18, 0.46, prog);
      paths.forEach(function (p) {
        var i = +p.dataset.i;
        var pts = A[i].map(function (a, j) {
          var b = B[i][j];
          var w = Math.sin(time * 0.0005 + i * 1.7 + j) * (j === 0 || j === 3 ? 10 : 36);
          return [lerp(a[0], b[0], k) + (j && j < 3 ? Math.cos(time * 0.0004 + i + j) * 18 : 0),
                  lerp(a[1], b[1], k) + w + (mouse.y - 0.5) * (14 + i * 8) * (j / 3)];
        });
        var d = 'M' + pts[0][0] + ' ' + pts[0][1] + 'C' + pts[1][0] + ' ' + pts[1][1] + ' ' + pts[2][0] + ' ' + pts[2][1] + ' ' + pts[3][0] + ' ' + pts[3][1];
        p.setAttribute('d', d);
      });
    }

    var gl = null, prgm, uni = {};
    if (canvas && !reduce) {
      try { gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' }); } catch (e) { gl = null; }
    }
    if (gl) {
      var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
      var fs = 'precision mediump float;uniform vec2 r;uniform float t,p;uniform vec2 m;' +
        'float h(vec2 x){return fract(sin(dot(x,vec2(127.1,311.7)))*43758.5453);}' +
        'float n(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}' +
        'float fbm(vec2 x){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n(x);x=x*2.02+vec2(3.1,1.7);a*=.5;}return s;}' +
        'void main(){vec2 uv=gl_FragCoord.xy/r;vec2 q=uv*vec2(r.x/r.y,1.)*1.7+(m-.5)*.18;float tt=t*.05;' +
        'vec2 w=vec2(fbm(q+tt),fbm(q+vec2(5.2,1.3)-tt));float f=fbm(q+2.4*w+vec2(0.,tt*1.6));' +
        'float flip=smoothstep(.05,.5,p);float bias=mix(uv.x*.8+uv.y*.7-.35,.5+.25*sin(uv.x*3.+tt),smoothstep(.3,.95,p));bias=mix(bias,uv.x*.5+(1.-uv.y)*.2+.15,flip*(1.-smoothstep(.3,.9,p)));' +
        'float v=smoothstep(.34,.98,f*1.1+bias*.5-.3-.2*smoothstep(.25,.6,p)-.34*smoothstep(.6,.95,p));'+
        'vec3 white=vec3(.93,.96,1.),light=vec3(.6,.77,1.),blue=vec3(0.,.4,1.);' +
        'vec3 col=mix(white,light,smoothstep(0.,.5,v));col=mix(col,blue,smoothstep(.42,.95,v));' +
        'float bot=smoothstep(.5,0.,uv.y)*(1.-smoothstep(.12,.4,p));col=mix(col,vec3(.97,.98,1.),bot*.92);' +
        'col+=(h(gl_FragCoord.xy+fract(t))-.5)*.035;gl_FragColor=vec4(col,1.);}';
      var mk = function (type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      prgm = gl.createProgram();
      gl.attachShader(prgm, mk(gl.VERTEX_SHADER, vs));
      gl.attachShader(prgm, mk(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(prgm);
      if (!gl.getProgramParameter(prgm, gl.LINK_STATUS)) { gl = null; }
      else {
        gl.useProgram(prgm);
        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        var loc = gl.getAttribLocation(prgm, 'p');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        ['r', 't', 'p', 'm'].forEach(function (k) { uni[k] = gl.getUniformLocation(prgm, k); });
      }
    }
    if (!gl && canvas) canvas.style.display = 'none';

    function resize() {
      if (!gl) return;
      var s = Math.min(window.devicePixelRatio || 1, 1.5) * 0.5;
      canvas.width = Math.max(2, Math.round(view.clientWidth * s));
      canvas.height = Math.max(2, Math.round(view.clientHeight * s));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('pointermove', function (e) {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    }, { passive: true });

    function measure() {
      var r = track.getBoundingClientRect();
      var total = r.height - window.innerHeight;
      prog = clamp(-r.top / total, 0, 1);
    }

    function applyPhases() {
      var o1 = 1 - smooth(0.14, 0.3, prog);
      var o2 = smooth(0.26, 0.4, prog) * (1 - smooth(0.6, 0.72, prog));
      var o3 = smooth(0.68, 0.84, prog);
      ph1.style.opacity = o1;
      ph1.style.transform = 'translateY(' + (-(1 - o1) * 60) + 'px)';
      ph2.style.opacity = o2;
      ph2.style.transform = 'translateY(' + ((1 - smooth(0.26, 0.42, prog)) * 50 - smooth(0.6, 0.72, prog) * 50) + 'px)';
      ph3.style.opacity = o3;
      ph3.style.pointerEvents = o3 > 0.6 ? 'auto' : 'none';
      ph3.style.transform = 'translateY(' + ((1 - o3) * 60) + 'px)';
      view.querySelector('.ribbons').style.opacity = 1 - smooth(0.62, 0.8, prog);
      if (hint) hint.classList.toggle('is-off', prog > 0.03);
    }

    var running = true, t0 = performance.now();
    function frame(now) {
      if (running) {
        mouse.x += (mouse.tx - mouse.x) * 0.05;
        mouse.y += (mouse.ty - mouse.y) * 0.05;
        measure();
        applyPhases();
        ribbons(prog, now);
        if (gl) {
          gl.uniform2f(uni.r, canvas.width, canvas.height);
          gl.uniform1f(uni.t, (now - t0) / 1000);
          gl.uniform1f(uni.p, prog);
          gl.uniform2f(uni.m, mouse.x, mouse.y);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
      }
      if (!reduce) requestAnimationFrame(frame);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { running = es[0].isIntersecting; }, { rootMargin: '100px' }).observe(track);
    }
    measure(); applyPhases(); ribbons(prog, 0);
    if (reduce) { frame(0); window.addEventListener('scroll', function () { frame(0); }, { passive: true }); }
    else requestAnimationFrame(frame);
  }

  var svc = $('.svc');
  if (svc) {
    var items = $$('.svc-item', svc), cards = $$('.svc-card>div', svc), mocks = $$('.mock', svc), stageLabel = $('.svc-stage>b', svc);
    var strack = $('.svc-track', svc);
    var cur = -1;
    var setSvc = function (i) {
      if (i === cur) return;
      cur = i;
      items.forEach(function (el, k) { el.classList.toggle('is-on', k === i); el.setAttribute('aria-selected', k === i); });
      cards.forEach(function (el, k) { el.classList.toggle('is-on', k === i); });
      mocks.forEach(function (el, k) { el.classList.toggle('is-on', k === i); });
      if (stageLabel) stageLabel.textContent = items[i].dataset.label;
    };
    var sticky = function () { return window.matchMedia('(min-width:901px)').matches; };
    var onSvc = function () {
      if (!sticky()) return;
      var r = strack.getBoundingClientRect();
      var total = r.height - window.innerHeight * 0.7;
      var p = clamp(-r.top / total, 0, 0.9999);
      setSvc(Math.floor(p * items.length));
    };
    items.forEach(function (el, i) {
      el.addEventListener('click', function () {
        if (sticky()) {
          var r = strack.getBoundingClientRect();
          var total = r.height - window.innerHeight * 0.7;
          window.scrollTo({ top: window.scrollY + r.top + total * ((i + 0.5) / items.length), behavior: reduce ? 'auto' : 'smooth' });
        }
        setSvc(i);
      });
    });
    window.addEventListener('scroll', onSvc, { passive: true });
    window.addEventListener('resize', onSvc);
    setSvc(0);
    onSvc();
  }

  $$('.case').forEach(function (c, i, all) {
    c.addEventListener('focus', function () { all.forEach(function (o) { o.classList.remove('is-on'); }); });
  });

  $$('.faq details').forEach(function (d) {
    var ans = $('.ans', d);
    var summary = $('summary', d);
    if (d.open) ans.style.height = 'auto';
    summary.addEventListener('click', function (e) {
      e.preventDefault();
      if (!d.open) {
        d.open = true;
        ans.style.height = '0px';
        requestAnimationFrame(function () { ans.style.height = ans.scrollHeight + 'px'; });
        ans.addEventListener('transitionend', function f() { ans.style.height = 'auto'; ans.removeEventListener('transitionend', f); });
      } else {
        ans.style.height = ans.scrollHeight + 'px';
        requestAnimationFrame(function () { ans.style.height = '0px'; });
        ans.addEventListener('transitionend', function f() { d.open = false; ans.removeEventListener('transitionend', f); });
      }
    });
  });

  var lb = $('.lightbox');
  if (lb) {
    var lbi = document.createElement('img'); lbi.alt = ''; lb.appendChild(lbi);
    $$('[data-zoom]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        lbi.src = a.getAttribute('href');
        lb.classList.add('is-open');
      });
    });
    var close = function () { lb.classList.remove('is-open'); };
    lb.addEventListener('click', close);
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  var brief = $('[data-brief]');
  if (brief) {
    var chips = $$('.chip', brief), ta = $('textarea', brief), send = $('[data-send]', brief), user = brief.dataset.user;
    var picked = [];
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        var on = c.getAttribute('aria-pressed') !== 'true';
        c.setAttribute('aria-pressed', on);
        var t = c.textContent.trim();
        picked = on ? picked.concat(t) : picked.filter(function (x) { return x !== t; });
        update();
      });
    });
    var update = function () {
      var text = 'Здравствуйте!' + (picked.length ? ' Хочу обсудить: ' + picked.join(', ').toLowerCase() + '.' : '') + (ta.value.trim() ? '\n\n' + ta.value.trim() : '');
      send.href = 'https://t.me/' + user + '?text=' + encodeURIComponent(text);
    };
    ta.addEventListener('input', update);
    update();
  }

  $$('[data-pick]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var t = a.dataset.pick;
      var target = 'https://t.me/' + a.dataset.user + '?text=' + encodeURIComponent('Здравствуйте! ' + t + '.');
      a.href = target;
    });
  });

  var cursor = $('.cursor');
  if (cursor && !reduce && window.matchMedia('(hover:hover)').matches) {
    var cx = 0, cy = 0, tx = 0, ty = 0;
    window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px';
      requestAnimationFrame(loop);
    })();
    $$('[data-cursor]').forEach(function (el) {
      el.addEventListener('pointerenter', function () { cursor.classList.add('is-on'); });
      el.addEventListener('pointerleave', function () { cursor.classList.remove('is-on'); });
    });
  }

  if (!reduce && window.matchMedia('(hover:hover)').matches) {
    $$('[data-magnet]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }
})();
