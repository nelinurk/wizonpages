/*!
 * Wizon punktiväli (liikuv andmepind)
 * Sõltuvusteta, töötab igas kaasaegses brauseris.
 *
 * Kasutus:
 *   <canvas data-wizon-dotfield></canvas>
 *   <script src="wizon-punktivali.js" defer></script>
 *
 * Lõuend täidab oma CSS-suuruse (anna talle laius ja kõrgus).
 * Hiire lähedal lähevad punktid punaseks. Hiirt kuulatakse lõuendi vanemelemendil
 * või data-host="<CSS selektor>" järgi valitud elemendil.
 * Liikumine peatub, kui lõuend pole ekraanil või kasutaja on süsteemis animatsioonid välja lülitanud.
 *
 * Valikulised data-atribuudid (vaikimisi väärtused sulgudes):
 *   data-cols (58)  data-rows (24)  data-hot (7, pulseerivate punaste punktide arv)
 *   data-cx (0.55)  data-spread (0.62)  data-top (0.12)  data-depth (0.8)  data-amp (0.16)
 *
 * JavaScriptist: WizonDotField(canvasElement, { cols: 22, rows: 14, ... })
 */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function DotField(canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cols = opts.cols || 58, rows = opts.rows || 24;
    var mouse = { x: -9999, y: -9999 };
    var running = false, t = Math.random() * 100, raf = 0, visible = true;
    var hot = [];
    // Väli mahutatakse alati lõuendi sisse: 8 px varu on suurem kui suurima palli raadius (~5,8 px), nii ei lõika serv ühtegi palli
    var pad = 8;
    var cx0 = opts.cx || 0.55, sp = opts.spread || 0.62, top0 = opts.top || 0.12, dep = opts.depth || 0.8, amp = opts.amp || 0.16;
    var x0 = cx0 - sp, x1 = cx0 + sp, y0 = top0 - amp, y1 = top0 + dep + amp;
    for (var h = 0; h < (opts.hot || 7); h++) hot.push(Math.floor(Math.random() * cols * rows));

    function size() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var idx = 0;
      for (var r = 0; r < rows; r++) {
        var d = r / (rows - 1);
        var s = 0.3 + 0.7 * d;
        for (var c = 0; c < cols; c++, idx++) {
          var u = (c / (cols - 1)) * 2 - 1;
          var wave = Math.sin(u * 2.4 + t * 0.45 + d * 3.2) * Math.cos(d * 2.1 - t * 0.28 + u * 0.8);
          var nx = cx0 + u * sp * s, ny = top0 + d * dep + wave * amp * s;
          var x = pad + (nx - x0) / (x1 - x0) * (W - 2 * pad);
          var y = pad + (ny - y0) / (y1 - y0) * (H - 2 * pad);
          var dx = x - mouse.x, dy = y - mouse.y;
          var near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 110);
          var rad = (0.55 + 1.35 * s) * (1 + near * 0.9);
          var a = 0.12 + 0.5 * d;
          if (near > 0.02 || hot.indexOf(idx) > -1) {
            var pulse = hot.indexOf(idx) > -1 ? 0.55 + 0.45 * Math.sin(t * 2 + idx) : 0;
            var k = Math.max(near, pulse);
            ctx.fillStyle = "rgba(239,65,54," + (0.25 + 0.75 * k) + ")";
            rad *= 1 + k * 0.6;
          } else {
            ctx.fillStyle = "rgba(19,19,19," + a * 0.42 + ")";
          }
          ctx.beginPath();
          ctx.arc(x, y, rad, 0, 6.2832);
          ctx.fill();
        }
      }
    }
    function loop() {
      t += 0.012;
      draw();
      raf = requestAnimationFrame(loop);
    }
    function start() { if (!running && !reduce && visible && !document.hidden) { running = true; raf = requestAnimationFrame(loop); } }
    function stop() { running = false; cancelAnimationFrame(raf); }
    window.addEventListener("resize", size);
    var host = opts.host || canvas.parentElement;
    host.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      if (reduce) draw();
    });
    host.addEventListener("pointerleave", function () { mouse.x = mouse.y = -9999; if (reduce) draw(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        visible ? start() : stop();
      }).observe(canvas);
    }
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    size();
    start();
  }

  window.WizonDotField = DotField;

  function init() {
    var list = document.querySelectorAll("canvas[data-wizon-dotfield]");
    for (var i = 0; i < list.length; i++) {
      var c = list[i], d = c.dataset, o = {};
      ["cols", "rows", "hot", "cx", "spread", "top", "depth", "amp"].forEach(function (k) {
        if (d[k] !== undefined && d[k] !== "") o[k] = parseFloat(d[k]);
      });
      if (d.host) o.host = document.querySelector(d.host) || c.parentElement;
      DotField(c, o);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
