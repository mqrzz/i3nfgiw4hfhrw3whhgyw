(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  var lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 1, syncTouch: true, syncTouchLerp: 0.14, touchInertiaMultiplier: 110, touchMultiplier: 1.4, anchors: { offset: -96 } });
    window.__lenis = lenis;
    var rafL = function (t) { lenis.raf(t); requestAnimationFrame(rafL); };
    requestAnimationFrame(rafL);
  }
  var isl = $('[data-isl]');
  var panels = $$('.mega');
  var navBtns = $$('[data-panel]');
  var scrim = $('[data-scrim]');
  var dockBtn = $('.dock-btn');
  var sheet = $('#dock-sheet');
  var hideT = null;

  var lastScroll = window.scrollY;
  function onHeader() {
    if (!isl) return;
    var y = window.scrollY;
    isl.classList.toggle('is-solid', y > 40);
    var open = $$('.mega.is-open').length > 0;
    if (!open) {
      if (y > 240 && y > lastScroll + 6) isl.classList.add('is-hidden');
      else if (y < lastScroll - 6 || y <= 240) isl.classList.remove('is-hidden');
    }
    lastScroll = y;
  }
  window.addEventListener('scroll', onHeader, { passive: true });
  onHeader();

  function openPanel(id) {
    clearTimeout(hideT);
    var any = !!id;
    panels.forEach(function (m) {
      var on = m.id === id;
      if (on) {
        m.hidden = false;
        m.classList.add('is-open');
        m.style.height = m.firstElementChild.offsetHeight + 'px';
      } else if (m.classList.contains('is-open')) {
        m.classList.remove('is-open');
        m.style.height = '0px';
        setTimeout(function () { if (!m.classList.contains('is-open')) m.hidden = true; }, 600);
      }
    });
    navBtns.forEach(function (b) { b.setAttribute('aria-expanded', b.dataset.panel === id); });
    if (scrim) scrim.classList.toggle('is-on', any);
  }
  function setDock(open) {
    if (!sheet) return;
    sheet.hidden = !open;
    dockBtn.setAttribute('aria-expanded', open);
    dockBtn.innerHTML = open ? dockBtn.dataset.close : dockBtn.dataset.open;
    scrim.classList.toggle('is-on', open);
  }
  if (isl) {
    var hov = window.matchMedia('(hover:hover)').matches;
    navBtns.forEach(function (b) {
      b.addEventListener('click', function () { openPanel(!hov && b.getAttribute('aria-expanded') === 'true' ? null : b.dataset.panel); });
      if (hov) b.addEventListener('pointerenter', function () { openPanel(b.dataset.panel); });
    });
    if (hov) {
      isl.addEventListener('pointerleave', function () { hideT = setTimeout(function () { openPanel(null); }, 240); });
      isl.addEventListener('pointerenter', function () { clearTimeout(hideT); });
      $$('.isl .nav a').forEach(function (a) { a.addEventListener('pointerenter', function () { openPanel(null); }); });
    }
    $$('#mega .mt').forEach(function (t) {
      var show = function () {
        var i = t.dataset.i;
        $$('.pv', isl).forEach(function (p) { p.classList.toggle('is-on', p.dataset.i === i); });
      };
      t.addEventListener('pointerenter', show);
      t.addEventListener('focus', show);
    });
  }
  if (dockBtn) dockBtn.addEventListener('click', function () { setDock(dockBtn.getAttribute('aria-expanded') !== 'true'); });
  if (scrim) scrim.addEventListener('click', function () { openPanel(null); setDock(false); });
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape') { openPanel(null); setDock(false); } });
  document.addEventListener('click', function (e) {
    if (isl && !e.target.closest('[data-isl]')) openPanel(null);
  });
  $$('.dock-sheet a').forEach(function (a) { a.addEventListener('click', function () { setDock(false); }); });
  window.addEventListener('resize', function () { openPanel(null); });
  var lastY = window.scrollY;
  window.addEventListener('scroll', function () {
    if (Math.abs(window.scrollY - lastY) > 80) { openPanel(null); lastY = window.scrollY; }
  }, { passive: true });

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
        'float v=smoothstep(.34,.98,f*1.1+bias*.5-.3-.2*smoothstep(.25,.6,p)+.5*smoothstep(.6,.95,p));'+
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
    window.addEventListener('resize', function () { resize(); if (s3) s3.resize(); });
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


    var s3 = null;
    function init3d() {
      var T = window.THREE;
      var c = document.createElement('canvas');
      c.className = 'c3d';
      c.setAttribute('aria-hidden', 'true');
      view.insertBefore(c, ph1);
      var renderer = new T.WebGLRenderer({ canvas: c, alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setClearColor(0x000000, 0);
      var scene = new T.Scene();
      var camera = new T.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.z = 16;

      var envScene = new T.Scene();
      var dome = new T.Mesh(new T.SphereGeometry(30, 32, 16), new T.ShaderMaterial({
        side: T.BackSide,
        vertexShader: 'varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader: 'varying vec3 v;void main(){float h=normalize(v).y;vec3 c=mix(vec3(.28,.5,.95),vec3(.86,.92,1.),smoothstep(-.7,.2,h));c=mix(c,vec3(1.),smoothstep(.2,1.,h));gl_FragColor=vec4(c,1.);}'
      }));
      envScene.add(dome);
      [[0, 14, 6, 24, 3], [-16, 4, 2, 3, 14], [16, 2, 4, 3, 12], [0, -6, 14, 20, 2]].forEach(function (b) {
        var m = new T.Mesh(new T.PlaneGeometry(b[3], b[4]), new T.MeshBasicMaterial({ color: new T.Color(2.4, 2.4, 2.4), side: T.DoubleSide }));
        m.position.set(b[0], b[1], b[2]);
        m.lookAt(0, 0, 0);
        envScene.add(m);
      });
      var pm = new T.PMREMGenerator(renderer);
      scene.environment = pm.fromScene(envScene, 0.03).texture;
      var key = new T.DirectionalLight(0xffffff, 0.5);
      key.position.set(4, 6, 8);
      scene.add(key);

      var ribMat = new T.MeshPhysicalMaterial({ color: 0xe3eaf7, roughness: 0.14, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1, transparent: true, opacity: 0.74, side: T.DoubleSide, envMapIntensity: 0.85 });
      var N = 90, rib = [], widths = [118, 92, 66];
      var world = new T.Group();
      scene.add(world);
      for (var i = 0; i < 3; i++) {
        var g = new T.BufferGeometry();
        g.setAttribute('position', new T.BufferAttribute(new Float32Array((N + 1) * 6), 3));
        var idx = [];
        for (var s = 0; s < N; s++) { var a = s * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
        g.setIndex(idx);
        var m = new T.Mesh(g, ribMat.clone());
        m.frustumCulled = false;
        world.add(m);
        rib.push(m);
      }

      var pillsGroup = new T.Group();
      scene.add(pillsGroup);
      var pillCols = [0xb9c3da, 0x1f4fd8, 0x3d78dc], pillMeshes = [];
      pillCols.forEach(function (col) {
        var pmesh = new T.Mesh(new T.BufferGeometry(), new T.MeshPhysicalMaterial({ color: col, roughness: 0.26, metalness: 0.04, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.9 }));
        pillsGroup.add(pmesh);
        pillMeshes.push(pmesh);
      });

      var W = 1, H = 1, visW = 1, visH = 1, ready = false;
      var P = new T.Vector3(), Q = new T.Vector3(), tan = new T.Vector3(), wv = new T.Vector3(), nrm = new T.Vector3();
      var ez = new T.Vector3(0, 0, 1);

      function resize() {
        W = view.clientWidth; H = view.clientHeight;
        renderer.setSize(W, H, false);
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        visH = 2 * camera.position.z * Math.tan(T.MathUtils.degToRad(camera.fov / 2));
        visW = visH * camera.aspect;
        var r = pillsEl.getBoundingClientRect(), vr = view.getBoundingClientRect();
        var px = function (x) { return (x - vr.left - W / 2) / W * visW; };
        var py = function (y) { return -(y - vr.top - H / 2) / H * visH; };
        var hs = [[0.12, 0.76, 0.13], [0, 1, 0.5], [0.26, 0.56, 0.87]];
        var thick = 0.26 * r.height / H * visH;
        pillMeshes.forEach(function (mm, k) {
          var wW = hs[k][1] * r.width / W * visW;
          mm.geometry.dispose();
          var cg = new T.CapsuleGeometry(thick / 2, Math.max(0.01, wW - thick), 12, 32);
          cg.rotateZ(Math.PI / 2);
          mm.geometry = cg;
          mm.userData.base = [px(r.left + (hs[k][0] + hs[k][1] / 2) * r.width), py(r.top + hs[k][2] * r.height)];
        });
        ready = true;
      }
      resize();

      function bez(p0, p1, p2, p3, t, out) {
        var u = 1 - t, a = u * u * u, b = 3 * u * u * t, c2 = 3 * u * t * t, d = t * t * t;
        out.set(a * p0[0] + b * p1[0] + c2 * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c2 * p2[1] + d * p3[1], 0);
      }

      function render(p, now, ms, intro) {
        if (!ready) return;
        var k = smooth(0.18, 0.46, p);
        var vis = (1 - smooth(0.6, 0.8, p)) * intro;
        world.rotation.y = (ms.x - 0.5) * 0.22;
        world.rotation.x = -(ms.y - 0.5) * 0.12;
        for (var i = 0; i < 3; i++) {
          var mesh = rib[i];
          mesh.visible = vis > 0.01;
          mesh.material.opacity = 0.74 * vis;
          if (!mesh.visible) continue;
          var pts = A[i].map(function (a, j) {
            var bb = B[i][j];
            var w = Math.sin(now * 0.0005 + i * 1.7 + j) * (j === 0 || j === 3 ? 10 : 36);
            var x = lerp(a[0], bb[0], k) + (j && j < 3 ? Math.cos(now * 0.0004 + i + j) * 18 : 0);
            var y = lerp(a[1], bb[1], k) + w;
            return [(x - 720) / 1440 * visW, -(y - 450) / 900 * visH];
          });
          var half = widths[i] / 900 * visH / 2;
          var pos = mesh.geometry.attributes.position.array;
          for (var s = 0; s <= N; s++) {
            var t = s / N;
            bez(pts[0], pts[1], pts[2], pts[3], t, P);
            bez(pts[0], pts[1], pts[2], pts[3], Math.min(1, t + 0.01), Q);
            var t0 = Math.max(0, t - 0.01);
            bez(pts[0], pts[1], pts[2], pts[3], t0, nrm);
            tan.subVectors(Q, nrm).normalize();
            P.z = Math.sin(t * Math.PI * 1.6 + now * 0.0006 + i * 2.1) * 1.1 - i * 0.4;
            wv.crossVectors(tan, ez).normalize();
            var th = Math.sin(t * 5 + now * 0.0005 + i * 1.3) * 0.95;
            nrm.crossVectors(tan, wv);
            var cx = Math.cos(th), sx = Math.sin(th);
            var wx = wv.x * cx + nrm.x * sx, wy = wv.y * cx + nrm.y * sx, wz = wv.z * cx + nrm.z * sx;
            pos[s * 6] = P.x - wx * half; pos[s * 6 + 1] = P.y - wy * half; pos[s * 6 + 2] = P.z - wz * half;
            pos[s * 6 + 3] = P.x + wx * half; pos[s * 6 + 4] = P.y + wy * half; pos[s * 6 + 5] = P.z + wz * half;
          }
          mesh.geometry.attributes.position.needsUpdate = true;
          mesh.geometry.computeVertexNormals();
        }
        var sc = smooth(0.66, 0.9, p);
        pillsGroup.visible = sc > 0.01;
        if (pillsGroup.visible) {
          pillsGroup.scale.setScalar(0.4 + 0.6 * sc);
          pillsGroup.rotation.y = (ms.x - 0.5) * 0.7;
          pillsGroup.rotation.x = -(ms.y - 0.5) * 0.35 + (1 - sc) * 0.5;
          pillMeshes.forEach(function (mm, q) {
            mm.position.set(mm.userData.base[0], mm.userData.base[1] + Math.sin(now * 0.0009 + q * 1.8) * 0.12, 0);
            mm.position.sub(new T.Vector3(0, 0, 0));
            mm.material.opacity = 1;
          });
          var cy = (pillMeshes[1].userData.base[1]);
          pillsGroup.position.set(0, cy, 0);
          pillMeshes.forEach(function (mm) { mm.position.y -= cy; });
        }
        renderer.render(scene, camera);
      }
      return { render: render, resize: resize };
    }
    if (window.THREE && !reduce && gl) {
      try { s3 = init3d(); view.classList.add('has3d'); } catch (e) { s3 = null; }
    }

    var running = true, t0 = performance.now();
    function frame(now) {
      if (running) {
        mouse.x += (mouse.tx - mouse.x) * 0.05;
        mouse.y += (mouse.ty - mouse.y) * 0.05;
        measure();
        applyPhases();
        if (!s3) ribbons(prog, now);
        if (s3) s3.render(prog, now, mouse, smooth(0, 1, (now - t0) / 1600));
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
          var ty = window.scrollY + r.top + total * ((i + 0.5) / items.length);
          if (lenis) lenis.scrollTo(ty); else window.scrollTo({ top: ty, behavior: reduce ? 'auto' : 'smooth' });
        }
        setSvc(i);
      });
    });
    window.addEventListener('scroll', onSvc, { passive: true });
    window.addEventListener('resize', onSvc);
    setSvc(0);
    onSvc();
  }

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

  var fq = $('[data-faq-search]');
  if (fq) {
    var fitems = $$('.faqs details');
    var fcnt = $('.bcount');
    fq.addEventListener('input', function () {
      var q = fq.value.trim().toLowerCase(), n = 0;
      fitems.forEach(function (d) {
        var ok = !q || d.textContent.toLowerCase().indexOf(q) > -1;
        d.hidden = !ok;
        if (ok) n++;
      });
      $$('.faqs section').forEach(function (s) { s.hidden = !$$('details', s).some(function (d) { return !d.hidden; }); });
      if (fcnt) fcnt.textContent = q ? 'Найдено вопросов: ' + n : '';
    });
  }

  var lb = $('.lightbox');
  if (lb) {
    var zooms = $$('[data-zoom]');
    var lbi = document.createElement('img');
    lbi.alt = '';
    lb.appendChild(lbi);
    var idx = 0;
    var prevB = $('.lb-prev', lb), nextB = $('.lb-next', lb), cntE = $('.lb-count', lb);
    var show = function (i) {
      idx = (i + zooms.length) % zooms.length;
      lbi.src = zooms[idx].getAttribute('href');
      cntE.textContent = zooms.length > 1 ? (idx + 1) + ' / ' + zooms.length : '';
      prevB.hidden = nextB.hidden = zooms.length < 2;
    };
    zooms.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        show(i);
        lb.classList.add('is-open');
        if (lenis) lenis.stop();
      });
    });
    var close = function () { lb.classList.remove('is-open'); if (lenis) lenis.start(); };
    lb.addEventListener('click', function (e) {
      if (e.target.closest('.lb-prev')) show(idx - 1);
      else if (e.target.closest('.lb-next')) show(idx + 1);
      else close();
    });
    window.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'ArrowLeft') show(idx - 1);
    });
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
    var agree = $('[data-agree]', brief);
    var gate = function () { send.setAttribute('aria-disabled', agree.checked ? 'false' : 'true'); };
    agree.addEventListener('change', gate);
    gate();
    update();
  }

  $$('[data-pick]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var t = a.dataset.pick;
      var target = 'https://t.me/' + a.dataset.user + '?text=' + encodeURIComponent('Здравствуйте! ' + t + '.');
      a.href = target;
    });
  });


  var blog = $('[data-blog]');
  if (blog) {
    var input = $('#q'), clearBtn = $('.sx'), cnt = $('.bcount'), empty = $('.bempty');
    var cards = $$('.bcard', blog), cat = '';
    var esc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
    var run = function () {
      var q = input.value.trim().toLowerCase();
      var words = q.split(/\s+/).filter(Boolean);
      var shown = 0;
      cards.forEach(function (c) {
        var t = c.dataset.text;
        var ok = (!cat || c.dataset.cat === cat) && words.every(function (w) { return t.indexOf(w) > -1; });
        c.hidden = !ok;
        var h = $('h2', c);
        h.innerHTML = h.dataset.title;
        if (ok && words.length) {
          words.forEach(function (w) { h.innerHTML = h.innerHTML.replace(new RegExp('(' + esc(w) + ')', 'ig'), '<mark>$1</mark>'); });
        }
        if (ok) shown++;
      });
      var filtering = !!q || !!cat;
      blog.classList.toggle('is-filtering', filtering);
      empty.hidden = shown > 0;
      clearBtn.hidden = !q;
      cnt.textContent = filtering ? 'Найдено статей: ' + shown : '';
    };
    input.addEventListener('input', run);
    clearBtn.addEventListener('click', function () { input.value = ''; run(); input.focus(); });
    $$('.bchips .chip').forEach(function (b) {
      b.addEventListener('click', function () {
        cat = b.dataset.cat;
        $$('.bchips .chip').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        run();
      });
    });
    var pq = new URLSearchParams(location.search).get('q');
    if (pq) { input.value = pq; run(); }
  }

  var prog = $('.progress i');
  if (prog) {
    var art = $('.post');
    var upd = function () {
      var r = art.getBoundingClientRect();
      var p = clamp((window.innerHeight * 0.3 - r.top) / (r.height - window.innerHeight * 0.3 + 1), 0, 1);
      prog.style.transform = 'scaleX(' + p + ')';
    };
    window.addEventListener('scroll', upd, { passive: true });
    upd();
    var links = $$('.toc a');
    var heads = links.map(function (a) { return $(a.getAttribute('href')); });
    var spy = function () {
      var cur = 0;
      heads.forEach(function (h, i) { if (h.getBoundingClientRect().top < window.innerHeight * 0.35) cur = i; });
      links.forEach(function (a, i) { a.classList.toggle('is-on', i === cur && heads[0].getBoundingClientRect().top < window.innerHeight * 0.6); });
    };
    window.addEventListener('scroll', spy, { passive: true });
    spy();
    var cp = $('[data-copy]');
    if (cp) cp.addEventListener('click', function () {
      var done = function () { $('span', cp).textContent = 'Ссылка скопирована'; setTimeout(function () { $('span', cp).textContent = 'Скопировать ссылку'; }, 2000); };
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, done); else done();
    });
  }


  var calc = $('[data-calc]');
  if (calc && window.ANTVIZ_PRICES) {
    var P = window.ANTVIZ_PRICES, main = $('.calc-main', calc);
    var state = { type: P.types[0].id, opts: {}, rush: false };
    var fmt = function (n) { return Math.round(n).toLocaleString('ru-RU').replace(/\u00a0/g, ' '); };
    var round = function (n) { return Math.round(n / 1000) * 1000; };
    var html = '<section class="calc-step"><h2><span>1</span>Что нужно сделать</h2><div class="copts copts--one" role="radiogroup" aria-label="Тип проекта">' +
      P.types.map(function (t) { return '<button type="button" class="copt" role="radio" data-type="' + t.id + '"><b>' + t.name + '</b><small>' + t.note + '</small></button>'; }).join('') + '</div></section>' +
      '<section class="calc-step"><h2><span>2</span>Что добавить</h2><div class="copts">' +
      P.options.map(function (o) { return '<button type="button" class="copt" aria-pressed="false" data-opt="' + o.id + '"><b>' + o.name + '</b><small>+ ' + fmt(o.price) + ' ' + P.currency + '</small></button>'; }).join('') + '</div></section>' +
      '<section class="calc-step"><h2><span>3</span>Сроки</h2><div class="copts" role="radiogroup" aria-label="Сроки"><button type="button" class="copt" role="radio" data-rush="0"><b>Обычные</b><small>Без наценки</small></button><button type="button" class="copt" role="radio" data-rush="1"><b>Срочно</b><small>+ ' + Math.round((P.rush - 1) * 100) + '% к стоимости</small></button></div></section>';
    main.insertAdjacentHTML('afterbegin', html);
    var lowEl = $('[data-low]', calc), highEl = $('[data-high]', calc), list = $('[data-list]', calc);
    $('[data-cur]', calc).textContent = P.currency;
    var cur = { low: 0, high: 0 }, raf = null;
    var tween = function (to) {
      var from = { low: cur.low, high: cur.high }, t0 = performance.now();
      cancelAnimationFrame(raf);
      var step = function (now) {
        var k = clamp((now - t0) / 500, 0, 1), e = 1 - Math.pow(1 - k, 3);
        cur.low = lerp(from.low, to.low, e); cur.high = lerp(from.high, to.high, e);
        lowEl.textContent = fmt(cur.low); highEl.textContent = fmt(cur.high);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    var chosen = function () {
      var t = P.types.filter(function (x) { return x.id === state.type; })[0];
      var os = P.options.filter(function (o) { return state.opts[o.id]; });
      var sum = t.base + os.reduce(function (a, o) { return a + o.price; }, 0);
      if (state.rush) sum *= P.rush;
      return { t: t, os: os, low: round(sum), high: round(sum * P.spread) };
    };
    var send = $('[data-send]', calc), agree = $('[data-agree]', calc);
    var render = function () {
      var c = chosen();
      $$('[data-type]', calc).forEach(function (b) { b.setAttribute('aria-checked', b.dataset.type === state.type); });
      $$('[data-opt]', calc).forEach(function (b) { b.setAttribute('aria-pressed', !!state.opts[b.dataset.opt]); });
      $$('[data-rush]', calc).forEach(function (b) { b.setAttribute('aria-checked', (b.dataset.rush === '1') === state.rush); });
      list.innerHTML = '<li><span>' + c.t.name + '</span><span>от ' + fmt(c.t.base) + ' ' + P.currency + '</span></li>' + c.os.map(function (o) { return '<li><span>' + o.name + '</span><span>+ ' + fmt(o.price) + '</span></li>'; }).join('') + (state.rush ? '<li><span>Срочно</span><span>+ ' + Math.round((P.rush - 1) * 100) + '%</span></li>' : '');
      tween(c);
      var text = 'Здравствуйте! Прикинул стоимость на сайте.\nЧто нужно: ' + c.t.name + (c.os.length ? '\nДобавить: ' + c.os.map(function (o) { return o.name.toLowerCase(); }).join(', ') : '') + '\nСроки: ' + (state.rush ? 'срочно' : 'обычные') + '\nОриентир: ' + fmt(c.low) + ' — ' + fmt(c.high) + ' ' + P.currency + '\nХочу обсудить.';
      send.href = 'https://t.me/' + calc.dataset.user + '?text=' + encodeURIComponent(text);
    };
    calc.addEventListener('click', function (e) {
      var b = e.target.closest('button.copt');
      if (!b) return;
      if (b.dataset.type) state.type = b.dataset.type;
      else if (b.dataset.opt) state.opts[b.dataset.opt] = !state.opts[b.dataset.opt];
      else if (b.dataset.rush) state.rush = b.dataset.rush === '1';
      render();
    });
    agree.addEventListener('change', function () { send.setAttribute('aria-disabled', agree.checked ? 'false' : 'true'); });
    render();
  }


  $$('[data-chk]').forEach(function (box) {
    var key = 'antviz-chk-' + box.dataset.chk;
    var inputs = $$('input', box), bar = $('.chk-bar i', box), pct = $('.chk-pct', box), done = $('.chk-done', box);
    var saved = [];
    try { saved = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { saved = []; }
    inputs.forEach(function (inp, i) { inp.checked = saved.indexOf(i) > -1; });
    var upd = function () {
      var n = inputs.filter(function (x) { return x.checked; }).length;
      var p = n / inputs.length;
      bar.style.transform = 'scaleX(' + p + ')';
      pct.textContent = Math.round(p * 100) + '%';
      done.hidden = n !== inputs.length;
      try { localStorage.setItem(key, JSON.stringify(inputs.map(function (x, i) { return x.checked ? i : -1; }).filter(function (i) { return i > -1; }))); } catch (e) {}
    };
    inputs.forEach(function (inp) { inp.addEventListener('change', upd); });
    upd();
  });

  var rd = $('[data-reader]');
  if (rd) rd.addEventListener('click', function () {
    var on = document.body.classList.toggle('reader');
    rd.setAttribute('aria-pressed', on);
    $('span', rd).textContent = on ? 'Светлая тема' : 'Режим чтения';
  });

  var postEl = $('.post');
  if (postEl) {
    var tip = document.createElement('a');
    tip.className = 'share-tip';
    tip.target = '_blank';
    tip.rel = 'noopener';
    tip.innerHTML = $('.tgi') ? '' : '';
    tip.textContent = 'Поделиться в Telegram';
    document.body.appendChild(tip);
    var hideTip = function () { tip.classList.remove('is-on'); };
    document.addEventListener('mouseup', function () {
      setTimeout(function () {
        var s = window.getSelection();
        var t = s ? s.toString().trim() : '';
        if (t.length < 12 || !s.anchorNode || !postEl.contains(s.anchorNode)) { hideTip(); return; }
        var r = s.getRangeAt(0).getBoundingClientRect();
        tip.style.left = (r.left + r.width / 2 + window.scrollX) + 'px';
        tip.style.top = (r.top + window.scrollY - 6) + 'px';
        tip.href = 'https://t.me/share/url?url=' + encodeURIComponent(location.href) + '&text=' + encodeURIComponent('«' + t.slice(0, 280) + '»');
        tip.classList.add('is-on');
      }, 10);
    });
    document.addEventListener('mousedown', function (e) { if (!e.target.closest('.share-tip')) hideTip(); });
    window.addEventListener('scroll', hideTip, { passive: true });
  }

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
