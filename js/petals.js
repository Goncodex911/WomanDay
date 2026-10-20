/* =========================================================
   PETALS.JS - CANVAS FALLING ROSE PETALS & STARDUST
   Realistic Organic Sway, 3D Rotation, and Sparkles
   ========================================================= */

(function() {
  const canvas = document.getElementById('petals-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const PETAL_COUNT = 38;
  const SPARKLE_COUNT = 25;

  // Cấu trúc cánh hoa hồng
  class Petal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -30;
      this.size = Math.random() * 14 + 10;
      this.speedY = Math.random() * 1.4 + 0.8;
      this.speedX = Math.random() * 1.5 - 0.75;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.03;
      this.flip = Math.random() * Math.PI;
      this.flipSpeed = Math.random() * 0.03 + 0.01;
      this.sway = Math.random() * Math.PI * 2;
      this.swaySpeed = Math.random() * 0.02 + 0.01;
      this.colorIndex = Math.floor(Math.random() * 3);
      this.opacity = Math.random() * 0.4 + 0.6;
    }

    update() {
      this.y += this.speedY;
      this.sway += this.swaySpeed;
      this.x += Math.sin(this.sway) * 1.2 + this.speedX;
      this.rotation += this.rotationSpeed;
      this.flip += this.flipSpeed;

      // Khi hoa rơi hết màn hình thì tạo lại từ trên
      if (this.y > height + 40 || this.x < -40 || this.x > width + 40) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(1, Math.cos(this.flip));
      ctx.globalAlpha = this.opacity;

      // Bảng màu cánh hoa hồng tự nhiên
      let grad = ctx.createRadialGradient(0, 0, 2, 0, 0, this.size);
      if (this.colorIndex === 0) {
        grad.addColorStop(0, '#fbcfe8'); // Hồng phấn nhạt
        grad.addColorStop(0.6, '#f43f5e'); // Hồng đào
        grad.addColorStop(1, '#be123c'); // Đỏ hồng thắm
      } else if (this.colorIndex === 1) {
        grad.addColorStop(0, '#ffe4e6');
        grad.addColorStop(0.7, '#fb7185');
        grad.addColorStop(1, '#e11d48');
      } else {
        grad.addColorStop(0, '#fff1f2');
        grad.addColorStop(0.8, '#fda4af');
        grad.addColorStop(1, '#f43f5e');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      // Vẽ hình cánh hoa tự nhiên (Bezier Curves)
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(this.size * 0.6, -this.size * 0.4, this.size * 0.9, this.size * 0.5, 0, this.size);
      ctx.bezierCurveTo(-this.size * 0.9, this.size * 0.5, -this.size * 0.6, -this.size * 0.4, 0, 0);
      ctx.fill();

      // Gân giữa cánh hoa mềm mại
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.quadraticCurveTo(0, this.size * 0.5, 0, this.size * 0.85);
      ctx.stroke();

      ctx.restore();
    }
  }

  // Cấu trúc bụi sao lấp lánh (Sparkles)
  class Sparkle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -10;
      this.size = Math.random() * 2.5 + 1;
      this.speedY = Math.random() * 0.6 + 0.3;
      this.alpha = Math.random();
      this.alphaSpeed = Math.random() * 0.03 + 0.01;
      this.color = Math.random() > 0.5 ? '#fde047' : '#ffffff';
    }

    update() {
      this.y += this.speedY;
      this.alpha += this.alphaSpeed;
      if (this.alpha > 1 || this.alpha < 0) {
        this.alphaSpeed = -this.alphaSpeed;
      }
      if (this.y > height) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha)) * 0.8;
      ctx.fillStyle = this.color;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const petals = Array.from({ length: PETAL_COUNT }, () => new Petal());
  const sparkles = Array.from({ length: SPARKLE_COUNT }, () => new Sparkle());

  let isRunning = true;
  document.addEventListener('visibilitychange', () => {
    isRunning = !document.hidden;
    if (isRunning) loop();
  });

  function loop() {
    if (!isRunning) return;
    ctx.clearRect(0, 0, width, height);

    sparkles.forEach(s => {
      s.update();
      s.draw();
    });

    petals.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(loop);
  }

  loop();
})();
