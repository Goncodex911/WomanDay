/* =========================================================
   GARDEN.JS - VƯỜN HOA NỞ RỘ TỪ 1 BÔNG HOA DUY NHẤT
   - Nổi trực tiếp trên nền giao diện, không có khung nền xanh
   - Ban đầu chỉ hiển thị duy nhất 1 bông hoa hồng ở giữa
   - Khi nhấn vào bông hoa giữa: vườn hoa hồng từ dưới đáy màn hình vươn lên nở rộ
   - Mỗi lần bấm lại vào bông hoa ở giữa đều kích hoạt hoa nở lại
   - Sử dụng trực tiếp ảnh hoa hồng từ assets/images
   ========================================================= */

(() => {
  'use strict';

  function initGarden() {
    const gardenStage = document.getElementById('garden-stage');
    const canvas = document.getElementById('garden-canvas');
    if (!gardenStage || !canvas) return;

    const ctx = canvas.getContext('2d');
    const flowerBtn = document.getElementById('garden-flower-btn');
    const status = document.getElementById('garden-status');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');

    const TAU = Math.PI * 2;
    const clamp = n => Math.max(0, Math.min(1, n));
    const ease = n => 1 - Math.pow(1 - clamp(n), 3);

    // Tải các ảnh hoa hồng thực tế từ thư mục assets/images
    const roseSources = [
      'assets/images/rose1_trans.png',
      'assets/images/rose2_trans.png',
      'assets/images/rose3_trans.png'
    ];

    const roseImages = roseSources.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });

    const heroImage = roseImages[0]; // Bông hoa hồng chính ở giữa

    // Vẽ mẫu lá hoa hồng
    const leafCanvas = document.createElement('canvas');
    leafCanvas.width = 300;
    leafCanvas.height = 200;
    const leafContext = leafCanvas.getContext('2d');
    leafContext.scale(2, 2);
    if (window.GardenBotany && window.GardenBotany.drawBotanicalLeaf) {
      window.GardenBotany.drawBotanicalLeaf(leafContext, 20, 50, 0, 100, 31);
    } else {
      // Fallback vẽ lá
      leafContext.fillStyle = '#466d4f';
      leafContext.beginPath();
      leafContext.ellipse(50, 50, 45, 18, 0, 0, TAU);
      leafContext.fill();
    }

    let seed = 2010;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    // Tạo danh sách các bông hoa trong khu vườn (vươn lên từ đáy màn hình)
    const flowers = [];
    const rowCount = 5;
    for (let row = 0; row < rowCount; row++) {
      const count = 18 + row * 4;
      for (let i = 0; i < count; i++) {
        const x = (i + random() * 0.8) / count;
        // Tránh đặt hoa quá sát tâm để bông hoa chính luôn nổi bật
        if (Math.abs(x - 0.5) < 0.08 && row < 3) continue;

        flowers.push({
          x,
          y: 0.46 + row * 0.095 + (random() - 0.5) * 0.16,
          depth: row,
          radius: 36 + row * 8 + random() * 16,
          stem: 0.22 + random() * 0.25,
          bend: (random() - 0.5) * 60,
          phase: random() * TAU,
          rotation: (random() - 0.5) * 0.6,
          imgIdx: Math.floor(random() * roseImages.length),
          delay: 0.2 + Math.abs(x - 0.5) * 3.8 + row * 0.35 + random() * 0.6,
          alpha: 0.85 + row * 0.03,
          offsetX: 0,
          offsetY: 0,
          hover: 0
        });
      }
    }

    flowers.sort((a, b) => a.depth - b.depth);

    // Cánh hoa rơi lững lờ
    const petals = Array.from({ length: 16 }, () => ({
      x: random(),
      y: random(),
      phase: random() * TAU,
      size: 4 + random() * 5,
      speed: 8 + random() * 10
    }));

    // Bông hoa trung tâm
    const hero = {
      x: 0.5,
      y: 0.46,
      radius: 96,
      stem: 0.28,
      bend: 4,
      phase: 0,
      rotation: -0.05,
      offsetX: 0,
      offsetY: 0,
      hover: 0
    };

    const pointer = { x: -1000, y: -1000 };
    let width = 0, height = 0, scale = 1, frame = 0, lastFrame = 0;
    let sceneTime = 0;
    let state = 'idle'; // 'idle' (chỉ 1 hoa) | 'growing' (đang vươn nở) | 'ready' (đã nở)
    let started = 0;
    let pausedAt = 0;

    function leaf(x, y, direction, size, flutter) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(direction, 1);
      ctx.rotate(-0.55 + flutter);
      ctx.drawImage(leafCanvas, -size * 0.2, -size * 0.5, size * 1.5, size);
      ctx.restore();
    }

    function drawFlower(f, growth, time, smoothing, isHero = false) {
      if (growth <= 0) return;
      const p = ease(growth);
      const x = f.x * width;
      const targetY = f.y * height;
      const root = Math.max(height * 1.05, targetY + f.stem * height);
      const y = root - (root - targetY) * p;

      // Gió lay tự nhiên
      const wind = motion.matches ? 0 : Math.sin(time * 0.0012 + f.x * 4.2) * 0.65 + Math.sin(time * 0.002 + f.phase) * 0.25;
      const lean = wind * (isHero ? 0.06 : 0.045);
      const sway = Math.sin(lean) * (root - y) * p;
      const r = f.radius * scale;

      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const distance = Math.hypot(dx, dy);
      const proximity = !motion.matches ? clamp(1 - distance / (r * 2.2)) : 0;
      f.offsetX += (((dx / (distance || 1)) * proximity * r * 0.12) - f.offsetX) * smoothing;
      f.offsetY += (((dy / (distance || 1)) * proximity * r * 0.08) - f.offsetY) * smoothing;
      f.hover += (proximity - f.hover) * smoothing;

      const headX = x + sway + f.offsetX;
      const headY = y + (1 - Math.cos(lean)) * (root - y) + f.offsetY;
      const baseX = x + f.bend * scale;
      const controlX1 = x - f.bend * scale + sway * 0.15;
      const controlY1 = root - (root - headY) * 0.4;
      const controlX2 = headX + 6 * scale + sway * 0.12;
      const controlY2 = headY + (root - headY) * 0.22;

      ctx.save();
      ctx.globalAlpha = isHero ? 1 : Math.min(1, f.alpha) * clamp(growth * 2.5);

      // Thân cành hoa xanh tự nhiên
      const stemColor = ctx.createLinearGradient(baseX, root, headX, headY);
      stemColor.addColorStop(0, '#38553e');
      stemColor.addColorStop(0.5, '#5d7d52');
      stemColor.addColorStop(1, '#4a6b46');
      ctx.strokeStyle = stemColor;
      ctx.lineWidth = isHero ? 3.2 * scale : Math.max(1.8, r * 0.04);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(baseX, root);
      ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, headX, headY);
      ctx.stroke();

      // Lá gắn vào thân cành
      if (growth > 0.15) {
        (isHero ? [0.42, 0.65] : [0.4, 0.65]).forEach((t, i) => {
          const u = 1 - t;
          const lx = u ** 3 * baseX + 3 * u * u * t * controlX1 + 3 * u * t * t * controlX2 + t ** 3 * headX;
          const ly = u ** 3 * root + 3 * u * u * t * controlY1 + 3 * u * t * t * controlY2 + t ** 3 * headY;
          const length = r * (isHero ? 0.75 : 0.85) * p;
          leaf(lx, ly, i ? -1 : 1, length, wind * 0.08);
          if (isHero) leaf(lx + (i ? -8 : 8) * scale, ly - 4 * scale, i ? -1 : 1, length * 0.55, -0.4 + wind * 0.08);
        });
      }

      // Vẽ hình ảnh bông hoa thật từ assets/images
      ctx.translate(headX, headY);
      ctx.rotate(f.rotation + wind * 0.08 + f.offsetX * 0.003);

      const breath = motion.matches ? 1 : 1 + Math.sin(time * 0.0014 + f.phase) * 0.015;
      const flowerScale = p * breath * (1 + f.hover * 0.08);
      ctx.scale(flowerScale, flowerScale);

      const img = isHero ? heroImage : roseImages[f.imgIdx % roseImages.length];
      if (img && img.complete && img.naturalWidth) {
        const drawSize = r * 2.2;
        ctx.shadowColor = 'rgba(225, 29, 72, 0.28)';
        ctx.shadowBlur = isHero ? 18 : 8;
        ctx.shadowOffsetY = 4;
        ctx.drawImage(img, -drawSize * 0.5, -drawSize * 0.5, drawSize, drawSize);
      }

      ctx.restore();
    }

    function drawPetals(elapsed, time) {
      ctx.save();
      petals.forEach(petal => {
        const x = ((petal.x * width + time * 0.009 + Math.sin(time * 0.0006 + petal.phase) * 35) % (width + 60)) - 30;
        const y = ((petal.y * height + time * petal.speed * 0.001) % (height + 60)) - 30;
        ctx.save();
        ctx.globalAlpha = Math.min(elapsed / 2.5, 1) * 0.5;
        ctx.translate(x, y);
        ctx.rotate(petal.phase + time * 0.0007);
        ctx.scale(0.55 + Math.abs(Math.sin(time * 0.001 + petal.phase)) * 0.45, 1);
        const color = ctx.createLinearGradient(0, -petal.size, 0, petal.size);
        color.addColorStop(0, '#fff0f5');
        color.addColorStop(1, '#e11d48');
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, -petal.size);
        ctx.bezierCurveTo(petal.size * 1.3, -petal.size, petal.size * 0.8, petal.size * 0.8, 0, petal.size);
        ctx.bezierCurveTo(-petal.size, petal.size * 0.2, -petal.size * 0.6, -petal.size * 0.9, 0, -petal.size);
        ctx.fill();
        ctx.restore();
      });
      ctx.restore();
    }

    function finishBloom() {
      state = 'ready';
      gardenStage.classList.add('is-ready');
      if (status) status.textContent = 'Cả một vườn hoa rực rỡ dành riêng tặng Ánh Hoài 🌸';
    }

    function draw(time) {
      frame = 0;
      const delta = lastFrame ? Math.min(50, time - lastFrame) : 16.67;
      lastFrame = time;
      if (!motion.matches) sceneTime += delta;
      const smoothing = motion.matches ? 1 : 1 - Math.exp(-delta / 140);

      ctx.clearRect(0, 0, width, height);

      const elapsed = state === 'idle' ? 0 : (time - started) / 1000;
      const instant = motion.matches && state !== 'idle';

      // Khi đã kích hoạt: vẽ các bông hoa trong vườn vươn lên từ đáy màn hình
      if (state !== 'idle') {
        flowers.forEach(f => {
          drawFlower(f, state === 'ready' || instant ? 1 : clamp((elapsed - f.delay) / 1.8), sceneTime, smoothing);
        });
      }

      // Đóa hoa trung tâm (Hero Flower) luôn hiện diện
      drawFlower(
        hero,
        state === 'idle' ? 0.8 : state === 'ready' || instant ? 1 : 0.8 + 0.2 * clamp(elapsed / 1.5),
        sceneTime,
        smoothing,
        true
      );

      if (state !== 'idle' && !motion.matches) {
        drawPetals(elapsed, sceneTime);
      }

      if (state === 'growing' && (instant || elapsed >= 6.2)) {
        finishBloom();
      }

      if (!motion.matches && !document.hidden) {
        frame = requestAnimationFrame(draw);
      }
    }

    function render() {
      cancelAnimationFrame(frame);
      if (!document.hidden) frame = requestAnimationFrame(draw);
    }

    gardenStage.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || motion.matches) return;
      const rect = gardenStage.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    });

    gardenStage.addEventListener('pointerleave', () => {
      pointer.x = pointer.y = -1000;
    });

    function resize() {
      const rect = gardenStage.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      scale = Math.min(1.22, Math.max(0.68, width / 1100));
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render();
    }

    // Kích hoạt hoặc nở lại toàn bộ khu vườn mỗi khi nhấn vào bông hoa ở giữa!
    function triggerGardenBloom(e) {
      state = 'growing';
      started = performance.now();
      gardenStage.classList.add('is-growing');

      const intro = document.getElementById('garden-intro');
      if (intro) intro.setAttribute('aria-hidden', 'true');

      if (status) status.textContent = 'Từ một bông hoa, cả khu vườn đang thức giấc…';

      // Bắn chùm cánh hoa và bụi sao lấp lánh từ tâm bông hoa
      if (window.createRoseBurst) {
        const rect = flowerBtn ? flowerBtn.getBoundingClientRect() : gardenStage.getBoundingClientRect();
        const cx = e && e.clientX ? e.clientX : rect.left + rect.width / 2;
        const cy = e && e.clientY ? e.clientY : rect.top + rect.height / 2;
        window.createRoseBurst(cx, cy, 14);
      }

      // Âm thanh thánh thót du dương
      if (window.romanticAudio) {
        if (!window.romanticAudio.isPlaying) window.romanticAudio.start();
        window.romanticAudio.playTone(659.25, 'sine', window.romanticAudio.audioCtx.currentTime, 0.6, 0.35);
        window.romanticAudio.playTone(783.99, 'sine', window.romanticAudio.audioCtx.currentTime + 0.15, 0.8, 0.4);
        window.romanticAudio.playTone(1046.5, 'sine', window.romanticAudio.audioCtx.currentTime + 0.3, 1.2, 0.45);
      }

      render();
    }

    if (flowerBtn) {
      flowerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerGardenBloom(e);
      });
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        pausedAt = performance.now();
        cancelAnimationFrame(frame);
        frame = 0;
        lastFrame = 0;
      } else {
        if (pausedAt && state === 'growing') started += performance.now() - pausedAt;
        pausedAt = 0;
        render();
      }
    });

    motion.addEventListener('change', render);
    new ResizeObserver(resize).observe(gardenStage);
    resize();
  }

  window.addEventListener('load', initGarden);
})();
