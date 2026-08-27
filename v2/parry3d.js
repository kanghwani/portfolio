/* P1-C 그레이박스 — PARRYWAY 플레이어블 인트로, Zdog pseudo-3D판
 * 로직은 2D판과 동일(스폰→오토 패링→방향별 펜타토닉, 클릭 사분면=직접 패링).
 * 렌더만 Zdog: 둥글납작한 왕·구 포탄·기울어진 무대, 마우스 따라 씬이 은근히 돈다.
 * ponytail: 그레이박스 게이트용 — 통과하면 그때 얼굴·망토·연출을 붙인다
 */
(function () {
  "use strict";
  var canvas = document.getElementById("city-canvas");
  if (!canvas || !window.Zdog) return;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TAU = Zdog.TAU;

  /* 방향 → 펜타토닉 (PARRYWAY와 동일 배치: ↓A3 ←C4 →E4 ↑A4) */
  var NOTES = { down: 220.0, left: 261.63, right: 329.63, up: 440.0 };
  var COLORS = { up: "#F4D35E", down: "#8EE3A2", left: "#7FB3FF", right: "#FF9E6E" };
  var DIRS = ["up", "down", "left", "right"];

  var Wd = 0, Hd = 0, audio = null;
  var running = false, visible = true, raf = 0, lastT = 0, simTime = 0, nextShot = 0.5;
  var shots = [], rings = [];
  var targetRotY = 0, targetRotX = 0;

  var illo = new Zdog.Illustration({ element: canvas });
  /* 무대 전체를 담는 앵커 — 기울인 카메라 + 마우스 패럴랙스는 여기에 건다 */
  var stage = new Zdog.Anchor({ addTo: illo, rotate: { x: -0.55 } });

  /* 바닥 — 살짝 어긋난 라운드 타일들 (무대감) */
  var GROUND_Y = 34;
  for (var gx = -3; gx <= 3; gx++) for (var gz = -3; gz <= 3; gz++) {
    if (Math.random() < 0.28) continue;
    new Zdog.Rect({
      addTo: stage, width: 44, height: 44, stroke: 4,
      color: (gx === 0 && gz === 0) ? "#26314D" : (Math.random() < 0.2 ? "#1C2745" : "#182240"),
      fill: true,
      translate: { x: gx * 52, y: GROUND_Y, z: gz * 52 },
      rotate: { x: TAU / 4 }
    });
  }

  /* 왕 — 몸통 원기둥 + 금 왕관 + 눈 */
  var king = new Zdog.Anchor({ addTo: stage, translate: { y: 0 } });
  new Zdog.Ellipse({ addTo: king, diameter: 46, stroke: 0, fill: true,
    color: "rgba(8,12,24,0.35)", rotate: { x: TAU / 4 }, translate: { y: GROUND_Y - 1 } }); // 접지 그림자
  new Zdog.Cylinder({ addTo: king, diameter: 30, length: 34, stroke: false,
    color: "#E8ECF4", frontFace: "#F6F2E8", backface: "#C9CFDD",
    rotate: { x: TAU / 4 }, translate: { y: GROUND_Y - 17 - 2 } });
  var head = new Zdog.Anchor({ addTo: king, translate: { y: GROUND_Y - 44 } });
  new Zdog.Shape({ addTo: head, stroke: 26, color: "#F6F2E8" });          // 머리(구)
  new Zdog.Cone({ addTo: head, diameter: 20, length: 14, color: "#F4D35E", backface: "#D9B33C",
    rotate: { x: TAU / 4 }, translate: { y: -16 } });                      // 왕관
  new Zdog.Shape({ addTo: head, stroke: 4.4, color: "#1B2337", translate: { x: -5.5, y: -1, z: 13 } }); // 눈
  new Zdog.Shape({ addTo: head, stroke: 4.4, color: "#1B2337", translate: { x: 5.5, y: -1, z: 13 } });

  /* 방패 — 패링 순간 그 방향에 번쩍 */
  var shieldAnchor = new Zdog.Anchor({ addTo: stage, translate: { y: GROUND_Y - 22 } });
  var shield = new Zdog.Rect({ addTo: shieldAnchor, width: 34, height: 22, stroke: 8,
    color: "#F4D35E", fill: true, visible: false, translate: { z: 30 } });
  var shieldUntil = -1;
  function showShield(dir, color) {
    var R = 32;
    shield.color = color;
    if (dir === "left") { shieldAnchor.rotate.y = TAU / 4; }
    else if (dir === "right") { shieldAnchor.rotate.y = -TAU / 4; }
    else if (dir === "up") { shieldAnchor.rotate.y = TAU / 2; }
    else { shieldAnchor.rotate.y = 0; }
    shield.translate.z = R;
    shield.visible = true;
    shieldUntil = simTime + 0.2;
  }

  /* 포탄 — 3D 방향: left/right=x축, up=먼 쪽(z-), down=가까운 쪽(z+) */
  function spawn() {
    var dir = DIRS[(Math.random() * 4) | 0];
    var D = 320 + Math.random() * 80;
    var pos = { x: 0, y: GROUND_Y - 24, z: 0 };
    if (dir === "left") pos.x = -D; else if (dir === "right") pos.x = D;
    else if (dir === "up") pos.z = -D; else pos.z = D;
    var ball = new Zdog.Shape({ addTo: stage, stroke: 15, color: COLORS[dir],
      translate: { x: pos.x, y: pos.y, z: pos.z } });
    var trail = new Zdog.Shape({ addTo: stage, stroke: 7, color: COLORS[dir] + "66",
      translate: { x: pos.x, y: pos.y, z: pos.z } });
    shots.push({ dir: dir, shape: ball, trail: trail, speed: 120 + Math.random() * 70, alive: true });
  }

  function note(freq) {
    if (!audio) return;
    var o = audio.createOscillator(), g = audio.createGain();
    o.type = "triangle"; o.frequency.value = freq;
    g.gain.setValueAtTime(0.12, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.35);
    o.connect(g).connect(audio.destination);
    o.start(); o.stop(audio.currentTime + 0.4);
  }

  function parry(shot) {
    shot.alive = false;
    var t = shot.shape.translate;
    var ring = new Zdog.Ellipse({ addTo: stage, diameter: 10, stroke: 4,
      color: COLORS[shot.dir], translate: { x: t.x, y: t.y, z: t.z },
      rotate: { x: TAU / 4 } });
    rings.push({ shape: ring, a: 1 });
    showShield(shot.dir, COLORS[shot.dir]);
    shot.shape.remove(); shot.trail.remove();
    note(NOTES[shot.dir]);
  }

  function step(dt) {
    simTime += dt;
    nextShot -= dt;
    if (nextShot <= 0) { spawn(); nextShot = 0.6 + Math.random() * 0.7; }

    for (var i = 0; i < shots.length; i++) {
      var s = shots[i];
      if (!s.alive) continue;
      var t = s.shape.translate;
      var dx = -t.x, dz = -t.z;
      var len = Math.hypot(dx, dz) || 1;
      t.x += (dx / len) * s.speed * dt;
      t.z += (dz / len) * s.speed * dt;
      s.trail.translate.x = t.x - (dx / len) * 18;
      s.trail.translate.z = t.z - (dz / len) * 18;
      if (len < 42) parry(s);                          // 오토 패링 — 마지막 순간
    }
    shots = shots.filter(function (s) { return s.alive; });

    for (var j = 0; j < rings.length; j++) {
      var r = rings[j];
      r.shape.diameter += 150 * dt;
      r.a -= 2.4 * dt;
      if (r.a <= 0) r.shape.remove();
    }
    rings = rings.filter(function (r) { return r.a > 0; });

    if (shield.visible && simTime > shieldUntil) shield.visible = false;

    /* 마우스 패럴랙스 — 씬이 은근히 따라 돈다 */
    stage.rotate.y += (targetRotY - stage.rotate.y) * Math.min(1, dt * 4);
    stage.rotate.x += ((-0.55 + targetRotX) - stage.rotate.x) * Math.min(1, dt * 4);
  }

  function resize() {
    Wd = canvas.clientWidth; Hd = canvas.clientHeight;
    var dpr = devicePixelRatio || 1;
    canvas.width = Wd * dpr; canvas.height = Hd * dpr;
    illo.setSize(Wd, Hd);
    illo.zoom = Math.max(1.1, Math.min(1.9, Wd / 720)) * dpr;
  }

  function draw() { illo.updateRenderGraph(); }

  var hero = document.getElementById("city-hero");
  hero.addEventListener("pointermove", function (e) {
    var rect = canvas.getBoundingClientRect();
    targetRotY = ((e.clientX - rect.left) / rect.width - 0.5) * 0.5;
    targetRotX = ((e.clientY - rect.top) / rect.height - 0.5) * 0.22;
  });
  hero.addEventListener("pointerdown", function (e) {
    if (!audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) {} }
    var rect = canvas.getBoundingClientRect();
    var dx = e.clientX - rect.left - rect.width / 2;
    var dy = e.clientY - rect.top - rect.height / 2;
    var dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down");
    var best = null, bd = Infinity;
    for (var i = 0; i < shots.length; i++) {
      var s = shots[i];
      if (s.dir !== dir || !s.alive) continue;
      var t = s.shape.translate;
      var d = Math.hypot(t.x, t.z);
      if (d < bd) { bd = d; best = s; }
    }
    if (best) parry(best);
    else showShield(dir, COLORS[dir]);                 // 헛방도 방패는 나온다
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
  for (var w = 0; w < 80; w++) step(0.016);            // 첫 화면부터 장면이 있게 (rAF 밖 — D24)
  draw();
  window.__cityStep = function (dt) { stop(); step(dt || 0.016); draw(); }; // 검증용 수동 스텝

  if (reduced) return;
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; visible ? start() : stop(); }).observe(canvas);
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
  var rt = 0;
  addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function(){ stop(); resize(); draw(); start(); }, 200); });
  start();
})();
