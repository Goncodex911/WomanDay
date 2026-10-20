/* =========================================================
   HEARTS.JS -> REAL ROSE BURST & INTERACTIVE PARTICLES
   Thay thế hoàn toàn icon emoji bằng ẢNH HOA HỒNG THẬT người dùng gửi
   ========================================================= */

(function() {
  // Ảnh hoa hồng thật tách nền trong suốt từ ảnh người dùng
  const roseImages = [
    'assets/images/rose1_trans.png',
    'assets/images/rose2_trans.png',
    'assets/images/rose3_trans.png'
  ];

  // Hàm tạo hiệu ứng bắn hoa hồng thật khi click
  function createRoseBurst(x, y, count = 6) {
    for (let i = 0; i < count; i++) {
      const img = document.createElement('img');
      img.className = 'rose-burst-particle';
      img.src = roseImages[Math.floor(Math.random() * roseImages.length)];
      img.alt = 'Rose';

      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 40;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - 40; // Bay bồng bềnh lên trên
      const size = Math.random() * 26 + 32; // Kích thước đóa hoa từ 32px đến 58px
      const duration = Math.random() * 0.6 + 1.1;
      const rotStart = (Math.random() - 0.5) * 40;
      const rotEnd = rotStart + (Math.random() - 0.5) * 120;

      img.style.left = `${x}px`;
      img.style.top = `${y}px`;
      img.style.setProperty('--dx', `${dx}px`);
      img.style.setProperty('--dy', `${dy}px`);
      img.style.setProperty('--size', `${size}px`);
      img.style.setProperty('--rot-start', `${rotStart}deg`);
      img.style.setProperty('--rot-end', `${rotEnd}deg`);
      img.style.setProperty('--duration', `${duration}s`);

      document.body.appendChild(img);

      setTimeout(() => {
        img.remove();
      }, duration * 1000);
    }
  }

  // Lắng nghe click màn hình để bắn hoa hồng thật
  document.addEventListener('pointerdown', (e) => {
    const target = e.target;
    // Không bắn hoa khi đang bấm vào ô nhập chữ hoặc nút bấm điều khiển
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('.modal-card')) return;

    createRoseBurst(e.clientX, e.clientY, 5);
  });

  window.createRoseBurst = createRoseBurst;
  window.createHeartBurst = createRoseBurst; // Tương thích ngược
})();
