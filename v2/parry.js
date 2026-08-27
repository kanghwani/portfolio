/* P1-B 그레이박스 — PARRYWAY 플레이어블 인트로
 * 히어로에서 왕이 사방에서 오는 포탄을 마지막 순간에 패링한다.
 * 방향 = 펜타토닉 음정 (PARRYWAY 시그니처 "막을수록 음악이 된다").
 * 자동 시연이 기본, 클릭/탭한 사분면으로 직접 패링 가능.
 * ponytail: 그레이박스 게이트용 — 스프라이트·연출 폴리시는 통과 후
 */
(function () {
  "use strict";
  var canvas = document.getElementById("city-canvas");
  if (!canvas) return;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");

  /* 방향 → 펜타토닉 음정 (PARRYWAY와 동일 배치: ↓A3 ←C4 →E4 ↑A4) */
  var NOTES = { down: 220.0, left: 261.63, right: 329.63, up: 440.0 };
  var DIRS = ["up", "down", "left", "right"];
  var COLORS = { up: "#F4D35E", down: "#8EE3A2", left: "#7FB3FF", right: "#FF9E6E" };

  var Wd = 0, Hd = 0, cx = 0, cy = 0;
  var shots = [], rings = [], shield = null; // shield={dir,until}
  var running = false, visible = true, raf = 0, lastT = 0, simTime = 0, nextShot = 0.6;
  var audio = null;

  function resize() {
    var dpr = devicePixelRatio || 1;
    Wd = canvas.clientWidth; Hd = canvas.clientHeight;
    canvas.width = Wd * dpr; canvas.height = Hd * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = Wd * 0.5; cy = Hd * 0.42;                    // 왕은 중앙 위쪽 — 하단 텍스트와 안 겹치게
  }

  /* 사용자 제스처 이후에만 소리 (브라우저 정책) */
  function note(freq) {
    if (!audio) return;
    var o = audio.createOscillator(), g = audio.createGain();
    o.type = "triangle"; o.frequency.value = freq;
    g.gain.setValueAtTime(0.12, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.35);
    o.connect(g).connect(audio.destination);
    o.start(); o.stop(audio.currentTime + 0.4);
  }

  function spawn() {
    var dir = DIRS[(Math.random() * 4) | 0];
    var d = 60 + Math.random() * 40;                  // 진입 거리 여유
    var x = cx, y = cy;
    if (dir === "up") y = -d; else if (dir === "down") y = Hd + d;
    else if (dir === "left") x = -d; else x = Wd + d;
    shots.push({ dir: dir, x: x, y: y, speed: 150 + Math.random() * 90, alive: true });
  }

  function parry(shot) {
    shot.alive = false;
    rings.push({ x: shot.x, y: shot.y, r: 6, max: 46, color: COLORS[shot.dir], a: 0.9 });
    rings.push({ x: cx, y: cy, r: 20, max: 34, color: "#E8ECF4", a: 0.5 });
    shield = { dir: shot.dir, until: simTime + 0.22 };
    note(NOTES[shot.dir]);
  }

  function distToKing(s) { return Math.abs(s.x - cx) + Math.abs(s.y - cy); }

  function step(dt) {
    simTime += dt;
    nextShot -= dt;
    if (nextShot <= 0) { spawn(); nextShot = 0.55 + Math.random() * 0.7; }

    for (var i = 0; i < shots.length; i++) {
      var s = shots[i];
      if (!s.alive) continue;
      var vx = cx - s.x, vy = cy - s.y;
      var len = Math.hypot(vx, vy) || 1;
      s.x += (vx / len) * s.speed * dt;
      s.y += (vy / len) * s.speed * dt;
      if (distToKing(s) < 26) parry(s);               // 오토 패링 — 마지막 순간에 튕긴다
    }
    shots = shots.filter(function (s) { return s.alive; });
    for (var j = 0; j < rings.length; j++) { rings[j].r += 130 * dt; rings[j].a -= 2.2 * dt; }
    rings = rings.filter(function (r) { return r.a > 0 && r.r < r.max + 40; });
  }

  function draw() {
    ctx.clearRect(0, 0, Wd, Hd);

    /* 바닥 그리드 — 무대감만 살짝 */
    ctx.strokeStyle = "rgba(38,49,77,0.5)"; ctx.lineWidth = 1;
    for (var gx = (cx % 56); gx < Wd; gx += 56) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, Hd); ctx.stroke(); }
    for (var gy = (cy % 56); gy < Hd; gy += 56) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(Wd, gy); ctx.stroke(); }

    /* 포탄 + 꼬리 */
    for (var i = 0; i < shots.length; i++) {
      var s = shots[i];
      var vx = cx - s.x, vy = cy - s.y, len = Math.hypot(vx, vy) || 1;
      ctx.strokeStyle = COLORS[s.dir] + "55"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(s.x - (vx / len) * 26, s.y - (vy / len) * 26); ctx.lineTo(s.x, s.y); ctx.stroke();
      ctx.fillStyle = COLORS[s.dir];
      ctx.beginPath(); ctx.arc(s.x, s.y, 8, 0, 6.283); ctx.fill();
    }

    /* 패링 링 */
    for (var j = 0; j < rings.length; j++) {
      var r = rings[j];
      ctx.strokeStyle = r.color; ctx.globalAlpha = Math.max(0, r.a); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 6.283); ctx.stroke();
      ctx.globalAlpha = 1;
    }

    /* 왕 (그레이박스: 몸통+왕관) */
    ctx.fillStyle = "#E8ECF4"; ctx.fillRect(cx - 11, cy - 14, 22, 28);
    ctx.fillStyle = "#F4D35E";
    ctx.beginPath();
    ctx.moveTo(cx - 11, cy - 14); ctx.lineTo(cx - 11, cy - 24); ctx.lineTo(cx - 5, cy - 16);
    ctx.lineTo(cx, cy - 24); ctx.lineTo(cx + 5, cy - 16); ctx.lineTo(cx + 11, cy - 24); ctx.lineTo(cx + 11, cy - 14);
    ctx.fill();

    /* 방패 — 패링 순간 그 방향에 번쩍 */
    if (shield && simTime < shield.until) {
      ctx.fillStyle = COLORS[shield.dir];
      var sw = 30, sh = 7, off = 24;
      if (shield.dir === "up") ctx.fillRect(cx - sw / 2, cy - off - sh, sw, sh);
      else if (shield.dir === "down") ctx.fillRect(cx - sw / 2, cy + off, sw, sh);
      else if (shield.dir === "left") ctx.fillRect(cx - off - sh, cy - sw / 2, sh, sw);
      else ctx.fillRect(cx + off, cy - sw / 2, sh, sw);
    }
  }

  /* 클릭/탭 사분면 = 그 방향 즉시 패링 (가장 가까운 그 방향 포탄) */
  var hero = document.getElementById("city-hero");
  hero.addEventListener("pointerdown", function (e) {
    if (!audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) {} }
    var rect = canvas.getBoundingClientRect();
    var dx = e.clientX - rect.left - cx, dy = e.clientY - rect.top - cy;
    var dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down");
    var best = null, bd = Infinity;
    for (var i = 0; i < shots.length; i++) {
      var s = shots[i];
      if (s.dir !== dir || !s.alive) continue;
      var d = distToKing(s);
      if (d < bd) { bd = d; best = s; }
    }
    if (best) parry(best);
    else { shield = { dir: dir, until: simTime + 0.18 }; } // 헛방도 방패는 나온다
  });

  function frame(t) {
    if (!running) return;
    var dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
    lastT = t;
    step(dt); draw();
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (running || reduced || !visible || document.hidden) return;
    running = true; lastT = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  resize();
  /* 첫 화면부터 장면이 있게 미리 몇 발 진행 (rAF 밖 — D24) */
  for (var w = 0; w < 90; w++) step(0.016);
  draw();
  window.__cityStep = function (dt) { stop(); step(dt || 0.016); draw(); }; // 검증용 수동 스텝

  if (reduced) return;
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; visible ? start() : stop(); }).observe(canvas);
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
  var rt = 0;
  addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function(){ stop(); resize(); draw(); start(); }, 200); });
  start();
})();
