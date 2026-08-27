/* P1.5 러시아워 연출 — 살아있는 도시 히어로 (테스트판)
 * 차량은 부하 적립 라우팅으로 움직인다: cost = 1 + W × (load / cap).
 * 연출 재설계: 균일 수요 → 러시아워 수요 집중. 간선이 달아오르면
 * 뒤차들이 눈에 보이게 골목으로 갈라지는 "정체→우회" 드라마를 반복한다.
 * ponytail: 그레이박스 게이트 2차 시도 — 픽셀 타일·씬 전환은 P2
 */
(function () {
  "use strict";
  var canvas = document.getElementById("city-canvas");
  if (!canvas) return;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");

  var GRID = 84;            // 교차로 간격 px (전판 72 → 도로가 덜 빽빽하게)
  var W = 2;                // 부하 가중치 (IDLE CITY와 동일 상수)
  var CAP_ARTERY = 6;       // 간선 수용량
  var CAP_ALLEY = 2;        // 골목 수용량 — 좁아서 금방 달아오른다
  var RUSH_SEC = 9, CALM_SEC = 6;

  var cols = 0, rows = 0, load = {}, cars = [], bgCanvas = null;
  var hotNodes = [], arteryRow = 0, arteryCol = 0;
  var running = false, visible = true, raf = 0, lastT = 0, simTime = 0;

  var CAR_COLORS = ["#F4D35E", "#E8ECF4", "#7FB3FF", "#FF9E6E", "#8EE3A2"];

  function key(a, b) { return a < b ? a + "-" + b : b + "-" + a; }
  function nodeXY(i) { return { x: (i % cols) * GRID + GRID / 2, y: ((i / cols) | 0) * GRID + GRID / 2 }; }
  function onArtery(a, b) {
    var ar = (a / cols) | 0, ac = a % cols, br = (b / cols) | 0, bc = b % cols;
    return (ar === arteryRow && br === arteryRow) || (ac === arteryCol && bc === arteryCol);
  }
  function capOf(a, b) { return onArtery(a, b) ? CAP_ARTERY : CAP_ALLEY; }
  function neighbors(i) {
    var c = i % cols, r = (i / cols) | 0, out = [];
    if (c > 0) out.push(i - 1);
    if (c < cols - 1) out.push(i + 1);
    if (r > 0) out.push(i - cols);
    if (r < rows - 1) out.push(i + cols);
    return out;
  }

  /* 부하 반영 다익스트라 — cost = 1 + W×(load/cap). 간선은 기본 비용이 싸다 */
  function route(from, to) {
    var n = cols * rows;
    var dist = new Float64Array(n).fill(Infinity);
    var prev = new Int32Array(n).fill(-1);
    var done = new Uint8Array(n);
    dist[from] = 0;
    for (;;) { // ponytail: 배열 스캔 다익스트라 — 노드 수백 개라 큐 불필요
      var u = -1, best = Infinity;
      for (var i = 0; i < n; i++) if (!done[i] && dist[i] < best) { best = dist[i]; u = i; }
      if (u < 0 || u === to) break;
      done[u] = 1;
      var nb = neighbors(u);
      for (var j = 0; j < nb.length; j++) {
        var v = nb[j];
        var l = load[key(u, v)] || 0;
        var base = onArtery(u, v) ? 0.7 : 1;          // 평시엔 간선이 자연 선호됨
        var cost = base + W * (l / capOf(u, v));
        if (dist[u] + cost < dist[v]) { dist[v] = dist[u] + cost; prev[v] = u; }
      }
    }
    if (prev[to] < 0 && to !== from) return null;
    var path = [to];
    while (path[0] !== from) path.unshift(prev[path[0]]);
    return path;
  }

  function addLoad(path, d) {
    for (var i = 0; i < path.length - 1; i++) {
      var k = key(path[i], path[i + 1]);
      load[k] = Math.max(0, (load[k] || 0) + d);
    }
  }

  function isRush() { return simTime % (RUSH_SEC + CALM_SEC) < RUSH_SEC; }
  function randNode() { return (Math.random() * cols * rows) | 0; }
  function pickDest(from) {
    /* 러시아워: 75%가 핫스팟(회사)으로 몰린다 — 수요 집중이 정체를 만든다 */
    if (isRush() && Math.random() < 0.75) {
      var h = hotNodes[(Math.random() * hotNodes.length) | 0];
      if (h !== from) return h;
    }
    var to = randNode();
    return to === from ? (to + 1) % (cols * rows) : to;
  }

  function spawnCar() {
    var from = randNode();
    var path = route(from, pickDest(from));
    if (!path || path.length < 2) return null;
    addLoad(path, +1);
    return {
      path: path, seg: 0, t: Math.random(),
      speed: 38 + Math.random() * 26,
      color: CAR_COLORS[(Math.random() * CAR_COLORS.length) | 0]
    };
  }

  function retarget(car) {
    var from = car.path[car.path.length - 1];
    var path = route(from, pickDest(from));
    if (path && path.length > 1) { addLoad(path, +1); car.path = path; car.seg = 0; car.t = 0; }
  }

  /* 건물 블록 — 정적이라 오프스크린에 한 번만. 핫스팟 건물은 draw()에서 빛난다 */
  function drawBuildings() {
    bgCanvas = document.createElement("canvas");
    bgCanvas.width = canvas.width; bgCanvas.height = canvas.height;
    var g = bgCanvas.getContext("2d");
    var dpr = devicePixelRatio || 1;
    g.scale(dpr, dpr);
    for (var r = 0; r < rows - 1; r++) for (var c = 0; c < cols - 1; c++) {
      if (Math.random() < 0.24) continue;             // 공터
      var x = c * GRID + GRID / 2, y = r * GRID + GRID / 2;
      var pad = 11 + Math.random() * 6;
      var w = GRID - pad * 2, h = GRID - pad * 2;
      g.fillStyle = "rgba(22,32,59,0.9)";
      g.fillRect(x + pad, y + pad, w, h);
      g.fillStyle = "rgba(244,211,94,0.25)";          // 창문
      for (var wy = y + pad + 6; wy < y + pad + h - 6; wy += 11)
        for (var wx = x + pad + 6; wx < x + pad + w - 6; wx += 12)
          if (Math.random() < 0.45) g.fillRect(wx, wy, 3.5, 3.5);
    }
  }

  function build() {
    var dpr = devicePixelRatio || 1;
    var wpx = canvas.clientWidth, hpx = canvas.clientHeight;
    canvas.width = wpx * dpr; canvas.height = hpx * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.max(5, Math.ceil(wpx / GRID) + 1);
    rows = Math.max(4, Math.ceil(hpx / GRID) + 1);
    arteryRow = (rows / 2) | 0;
    arteryCol = (cols / 3) | 0;                        // 세로 간선은 왼쪽 1/3 지점 — 텍스트와 안 겹치게
    /* 핫스팟(회사) 3곳 — 간선 교차부 주변에 몰아둔다 */
    var hub = arteryRow * cols + arteryCol;
    hotNodes = [hub, hub + 2, hub - cols + 1].filter(function (n) { return n >= 0 && n < cols * rows; });
    load = {}; cars = []; simTime = 0;
    var target = Math.min(70, Math.max(24, (wpx * hpx / 11000) | 0)); // ponytail: 차량 상한 — 모바일 성능
    for (var i = 0; i < target; i++) { var c = spawnCar(); if (c) cars.push(c); }
    drawBuildings();
  }

  function draw(dt) {
    simTime += dt;
    var wpx = canvas.clientWidth, hpx = canvas.clientHeight;
    ctx.clearRect(0, 0, wpx, hpx);

    /* 도로 — 골목 먼저 가늘게, 간선은 굵게. 부하가 높을수록 달아오른다 */
    for (var pass = 0; pass < 2; pass++) {
      for (var i = 0; i < cols * rows; i++) {
        var a = nodeXY(i), nb = neighbors(i);
        for (var j = 0; j < nb.length; j++) {
          if (nb[j] < i) continue;
          var art = onArtery(i, nb[j]);
          if ((pass === 0) === art) continue;          // pass0=골목, pass1=간선
          var b = nodeXY(nb[j]);
          var l = load[key(i, nb[j])] || 0;
          var heat = Math.min(1, l / (capOf(i, nb[j]) * 1.5));
          ctx.lineWidth = art ? 14 : 6;
          ctx.strokeStyle = "rgba(" + ((36 + heat * 190) | 0) + "," + ((46 + heat * 44) | 0) + "," + ((74 - heat * 30) | 0) + "," + (art ? 0.9 : 0.75) + ")";
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }

    if (bgCanvas) ctx.drawImage(bgCanvas, 0, 0, wpx, hpx);

    /* 핫스팟 — 러시아워에 맥동. "다들 여기로 가는 중"이 보이게 */
    var pulse = isRush() ? 0.55 + 0.35 * Math.sin(simTime * 5) : 0.18;
    for (var hI = 0; hI < hotNodes.length; hI++) {
      var hp = nodeXY(hotNodes[hI]);
      ctx.fillStyle = "rgba(244,211,94," + pulse + ")";
      ctx.beginPath(); ctx.arc(hp.x, hp.y, 9, 0, 6.283); ctx.fill();
      ctx.strokeStyle = "rgba(244,211,94," + pulse * 0.6 + ")";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(hp.x, hp.y, 15 + 4 * Math.sin(simTime * 5), 0, 6.283); ctx.stroke();
    }

    /* 차량 */
    for (var k = 0; k < cars.length; k++) {
      var car = cars[k];
      var A = nodeXY(car.path[car.seg]), B = nodeXY(car.path[car.seg + 1]);
      var len = Math.abs(B.x - A.x) + Math.abs(B.y - A.y) || 1;
      car.t += (car.speed * dt) / len;
      while (car.t >= 1) {
        car.t -= 1;
        addLoad([car.path[car.seg], car.path[car.seg + 1]], -1); // 지나간 구간 부하 해제
        car.seg++;
        if (car.seg >= car.path.length - 1) { retarget(car); break; }
        A = nodeXY(car.path[car.seg]); B = nodeXY(car.path[car.seg + 1]);
        len = Math.abs(B.x - A.x) + Math.abs(B.y - A.y) || 1;
      }
      A = nodeXY(car.path[car.seg]); B = nodeXY(car.path[Math.min(car.seg + 1, car.path.length - 1)]);
      var x = A.x + (B.x - A.x) * car.t, y = A.y + (B.y - A.y) * car.t;
      var horiz = A.y === B.y;
      ctx.fillStyle = car.color;
      if (horiz) ctx.fillRect(x - 6, y - 3.5, 12, 7); else ctx.fillRect(x - 3.5, y - 6, 7, 12);
    }
  }

  function frame(t) {
    if (!running) return;
    var dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
    lastT = t;
    draw(dt);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduced || !visible || document.hidden) return;
    running = true; lastT = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  build();
  draw(0);                                           // 첫 프레임은 rAF 밖에서 — 백그라운드 로드여도 빈 히어로 금지 (D24)
  window.__cityStep = function (dt) { stop(); draw(dt || 0.016); }; // 검증용 수동 스텝 (D24 처방)
  if (reduced) return;                               // 폴백: 정적 1프레임으로 종료

  new IntersectionObserver(function (e) {
    visible = e[0].isIntersecting;
    visible ? start() : stop();                       // 히어로가 안 보이면 멈춤
  }).observe(canvas);
  document.addEventListener("visibilitychange", function () {
    document.hidden ? stop() : start();               // 백그라운드 탭 rAF 정지 대응 (failure-patterns D24)
  });
  var rt = 0;
  addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function(){ stop(); build(); draw(0); start(); }, 200); });
  start();
})();
