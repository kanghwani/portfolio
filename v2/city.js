/* P1 그레이박스 — 살아있는 도시 히어로
 * 차량은 장식이 아니라 부하 적립 라우팅으로 움직인다:
 * cost = 1 + W × (load / cap). 앞차가 채운 부하를 뒷차가 비용으로 읽는다.
 * ponytail: 그레이박스 게이트용 최소 구현 — 픽셀 타일·씬 전환은 P2
 */
(function () {
  "use strict";
  var canvas = document.getElementById("city-canvas");
  if (!canvas) return;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");

  var GRID = 72;          // 교차로 간격 px
  var W = 2;              // 부하 가중치 (IDLE CITY와 동일 상수)
  var CAP = 3;            // 도로 한 칸 수용량
  var cols = 0, rows = 0, nodes = [], load = {}, cars = [], bgCanvas = null;
  var running = false, visible = true, raf = 0, lastT = 0;

  var CAR_COLORS = ["#F4D35E", "#E8ECF4", "#7FB3FF", "#FF9E6E", "#8EE3A2"];

  function key(a, b) { return a < b ? a + "-" + b : b + "-" + a; }
  function nodeXY(i) { return { x: (i % cols) * GRID + GRID / 2, y: ((i / cols) | 0) * GRID + GRID / 2 }; }
  function neighbors(i) {
    var c = i % cols, r = (i / cols) | 0, out = [];
    if (c > 0) out.push(i - 1);
    if (c < cols - 1) out.push(i + 1);
    if (r > 0) out.push(i - cols);
    if (r < rows - 1) out.push(i + cols);
    return out;
  }

  /* 부하 반영 다익스트라 — cost = 1 + W×(load/cap) */
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
        var cost = 1 + W * (l / CAP);
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

  function randNode() { return (Math.random() * cols * rows) | 0; }

  function spawnCar() {
    var from = randNode(), to = randNode();
    if (to === from) to = (to + 1) % (cols * rows);
    var path = route(from, to);
    if (!path || path.length < 2) return null;
    addLoad(path, +1);
    return {
      path: path, seg: 0, t: Math.random(),
      speed: 34 + Math.random() * 26,
      color: CAR_COLORS[(Math.random() * CAR_COLORS.length) | 0]
    };
  }

  function retarget(car) {
    addLoad(car.path.slice(car.seg), -1);           // 남은 구간 부하 반납
    var from = car.path[car.path.length - 1];
    var to = randNode();
    if (to === from) to = (to + 1) % (cols * rows);
    var path = route(from, to);
    if (path && path.length > 1) { addLoad(path, +1); car.path = path; car.seg = 0; car.t = 0; }
  }

  /* 건물 블록 — 정적이라 오프스크린에 한 번만 */
  function drawBuildings() {
    bgCanvas = document.createElement("canvas");
    bgCanvas.width = canvas.width; bgCanvas.height = canvas.height;
    var g = bgCanvas.getContext("2d");
    var dpr = devicePixelRatio || 1;
    g.scale(dpr, dpr);
    for (var r = 0; r < rows - 1; r++) for (var c = 0; c < cols - 1; c++) {
      if (Math.random() < 0.22) continue;             // 공터
      var x = c * GRID + GRID / 2, y = r * GRID + GRID / 2;
      var pad = 9 + Math.random() * 5;
      var w = GRID - pad * 2, h = GRID - pad * 2;
      g.fillStyle = "rgba(22,32,59,0.9)";
      g.fillRect(x + pad, y + pad, w, h);
      g.fillStyle = "rgba(244,211,94,0.28)";          // 창문
      for (var wy = y + pad + 6; wy < y + pad + h - 6; wy += 10)
        for (var wx = x + pad + 6; wx < x + pad + w - 6; wx += 11)
          if (Math.random() < 0.5) g.fillRect(wx, wy, 3.5, 3.5);
    }
  }

  function build() {
    var dpr = devicePixelRatio || 1;
    var wpx = canvas.clientWidth, hpx = canvas.clientHeight;
    canvas.width = wpx * dpr; canvas.height = hpx * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.max(4, Math.ceil(wpx / GRID) + 1);
    rows = Math.max(3, Math.ceil(hpx / GRID) + 1);
    load = {}; cars = [];
    var target = Math.min(64, Math.max(18, (wpx * hpx / 14000) | 0)); // ponytail: 차량 상한 — 모바일 성능
    for (var i = 0; i < target; i++) { var c = spawnCar(); if (c) cars.push(c); }
    drawBuildings();
  }

  function draw(dt) {
    var wpx = canvas.clientWidth, hpx = canvas.clientHeight;
    ctx.clearRect(0, 0, wpx, hpx);

    /* 도로 — 부하가 높을수록 따뜻하게 (알고리즘이 눈에 보이는 지점) */
    ctx.lineWidth = 10;
    for (var i = 0; i < cols * rows; i++) {
      var a = nodeXY(i), nb = neighbors(i);
      for (var j = 0; j < nb.length; j++) {
        if (nb[j] < i) continue;
        var b = nodeXY(nb[j]);
        var l = load[key(i, nb[j])] || 0;
        var heat = Math.min(1, l / (CAP * 3));        // 혼잡 구간만 은은하게 달아오르게
        ctx.strokeStyle = "rgba(" + ((36 + heat * 150) | 0) + "," + ((46 + heat * 60) | 0) + "," + ((74 - heat * 20) | 0) + ",0.8)";
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }

    if (bgCanvas) ctx.drawImage(bgCanvas, 0, 0, wpx, hpx);

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
      if (horiz) ctx.fillRect(x - 5, y - 3, 10, 6); else ctx.fillRect(x - 3, y - 5, 6, 10);
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
