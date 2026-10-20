/* =========================================================
   ROSES.JS - TÍNH NĂNG TẶNG HOA HỒNG TƯƠNG TÁC (FLOWERS-20-10)
   - Bông hoa hồng tự nhiên không bó khung, không phông nền
   - Chạm vào hoa để nở rộ, nhận lời chúc thì thầm ý nghĩa
   - Parallax nghiêng hoa nhẹ nhàng theo con trỏ chuột
   - Nở hoa lại & Bão hoa hồng bay ngập tràn màn hình
   ========================================================= */

(function() {
  const roseImages = [
    'assets/images/rose1_trans.png',
    'assets/images/rose2_trans.png',
    'assets/images/rose3_trans.png'
  ];

  // Các lời chúc thì thầm ấm áp & tinh tế (lấy cảm hứng từ flowers-20-10)
  const WHISPER_NOTES = [
    '🌹 Chúc bạn một ngày 20/10 ngập tràn yêu thương và những bất ngờ nho nhỏ.',
    '🌸 Mong bạn luôn được lắng nghe, trân trọng và yêu thương theo cách mình xứng đáng.',
    '✨ Chúc bạn đủ bình yên để nghỉ ngơi, đủ tự tin để theo đuổi điều mình thích.',
    '💐 Một bông hoa dành cho nụ cười của bạn. Hôm nay nhớ vui thật nhiều nhé!',
    '🌷 Chúc những dự định của bạn sớm đơm hoa, từng chút một, theo nhịp của riêng mình.',
    '💖 Mong mỗi ngày của bạn đều có một lý do thật nhỏ để mỉm cười.',
    '🌺 Chúc bạn luôn khỏe mạnh, an yên và có thật nhiều thời gian cho chính mình.',
    '🌼 Cảm ơn vì sự dịu dàng và nụ cười ấm áp của bạn đã luôn làm cho thế giới này ngập tràn ánh nắng.',
    '💕 Mãi mãi là người phụ nữ rạng rỡ, kiêu sa và hạnh phúc nhất!'
  ];

  const floatingRoseTrigger = document.getElementById('floating-rose-trigger');
  const sectionRoseTrigger = document.getElementById('section-rose-trigger');
  const roseStemWrap = document.getElementById('rose-stem-wrap');
  const roseWish = document.getElementById('roseWish');
  const replayBloomBtn = document.getElementById('replayBloom');
  const triggerStormBtn = document.getElementById('trigger-storm-btn');
  const totalRosesGivenEl = document.getElementById('total-roses-count');

  // Màn hình bão hoa toàn cảnh
  const fullscreenRoseStage = document.getElementById('fullscreen-rose-stage');
  const roseOverlayFlowers = document.getElementById('rose-overlay-flowers');
  const roseStageWish = document.getElementById('rose-stage-wish');
  const closeRoseStageBtn = document.getElementById('close-rose-stage-btn');
  const moreRosesBtn = document.getElementById('more-roses-btn');

  let totalRoses = parseInt(localStorage.getItem('celebrate_2010_rose_count') || '99', 10);
  if (totalRosesGivenEl) totalRosesGivenEl.textContent = totalRoses;

  let currentWishIndex = 0;
  let spawnTimer = null;

  // Khởi tạo lời chúc ban đầu dịu dàng
  if (roseWish && !roseWish.textContent) {
    roseWish.textContent = WHISPER_NOTES[0];
  }

  // Hàm tương tác chạm nở hoa & trao lời chúc (Theo phong cách flowers-20-10)
  function bloomInteractiveRose(e) {
    if (!sectionRoseTrigger) return;

    // Hiệu ứng bung nở cánh hoa
    sectionRoseTrigger.classList.remove('blooming-surge');
    void sectionRoseTrigger.offsetWidth; // Force reflow
    sectionRoseTrigger.classList.add('blooming-surge');

    // Chuyển sang lời chúc kế tiếp
    currentWishIndex = (currentWishIndex + 1) % WHISPER_NOTES.length;
    if (roseWish) {
      roseWish.textContent = WHISPER_NOTES[currentWishIndex];
      roseWish.classList.remove('is-new');
      void roseWish.offsetWidth;
      roseWish.classList.add('is-new');
    }

    // Bắn chùm cánh hoa hồng bay tỏa ra từ tâm bông hoa
    const rect = sectionRoseTrigger.getBoundingClientRect();
    const clickX = e && e.clientX ? e.clientX : (rect.left + rect.width / 2);
    const clickY = e && e.clientY ? e.clientY : (rect.top + rect.height / 2);

    if (window.createRoseBurst) {
      window.createRoseBurst(clickX, clickY, 10);
    }

    // Tăng số lượng hoa đã trao gửi
    totalRoses += 1;
    localStorage.setItem('celebrate_2010_rose_count', totalRoses);
    if (totalRosesGivenEl) totalRosesGivenEl.textContent = totalRoses;

    // Âm thanh ngân vang du dương
    if (window.romanticAudio) {
      if (!window.romanticAudio.isPlaying) {
        window.romanticAudio.start();
      }
      const notes = [659.25, 783.99, 880, 1046.5];
      const note = notes[currentWishIndex % notes.length];
      window.romanticAudio.playTone(note, 'sine', window.romanticAudio.audioCtx.currentTime, 0.5, 0.3);
    }
  }

  // Parallax nghiêng nhẹ hoa theo con trỏ chuột (Giống repo flowers-20-10)
  if (sectionRoseTrigger) {
    sectionRoseTrigger.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const rect = sectionRoseTrigger.getBoundingClientRect();
      const xRatio = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const yRatio = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      if (roseStemWrap) {
        roseStemWrap.style.transform = `rotate(${xRatio * 8}deg) translateY(${yRatio * -4}px) scale(1.05)`;
      }
    });

    sectionRoseTrigger.addEventListener('pointerleave', () => {
      if (roseStemWrap) {
        roseStemWrap.style.transform = '';
      }
    });

    sectionRoseTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      bloomInteractiveRose(e);
    });

    sectionRoseTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        bloomInteractiveRose();
      }
    });
  }

  // Nút cho hoa nở lại
  if (replayBloomBtn) {
    replayBloomBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      bloomInteractiveRose(e);
    });
  }

  // Nút kích hoạt bão hoa ngập màn hình
  if (triggerStormBtn) {
    triggerStormBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerFlowerStorm();
    });
  }

  // =========================================================
  // SÂN KHẤU BÃO HOA TOÀN MÀN HÌNH
  // =========================================================
  function triggerFlowerStorm() {
    if (!fullscreenRoseStage) return;

    fullscreenRoseStage.classList.add('active');

    // Cập nhật số hoa
    totalRoses += 99;
    localStorage.setItem('celebrate_2010_rose_count', totalRoses);
    if (totalRosesGivenEl) totalRosesGivenEl.textContent = totalRoses;

    // Chọn ngẫu nhiên lời chúc ngọt ngào
    if (roseStageWish) {
      roseStageWish.textContent = WHISPER_NOTES[Math.floor(Math.random() * WHISPER_NOTES.length)];
    }

    // Âm thanh chuông gió thần tiên ngân vang
    if (window.romanticAudio) {
      if (!window.romanticAudio.isPlaying) {
        window.romanticAudio.start();
      }
      window.romanticAudio.playTone(784, 'sine', window.romanticAudio.audioCtx.currentTime, 0.6, 0.3);
      window.romanticAudio.playTone(1046.5, 'sine', window.romanticAudio.audioCtx.currentTime + 0.15, 0.8, 0.35);
      window.romanticAudio.playTone(1318.5, 'sine', window.romanticAudio.audioCtx.currentTime + 0.3, 1.2, 0.4);
    }

    // Xóa hoa cũ nếu có
    if (roseOverlayFlowers) roseOverlayFlowers.innerHTML = '';

    // Tạo đợt hoa hồng đầu tiên bay lên dày đặc (45 bông)
    spawnRoses(45);

    // Tiếp tục thả hoa nhẹ nhàng trong lúc người dùng xem
    if (spawnTimer) clearInterval(spawnTimer);
    spawnTimer = setInterval(() => {
      if (fullscreenRoseStage.classList.contains('active')) {
        spawnRoses(5);
      }
    }, 800);
  }

  function spawnRoses(count = 20) {
    if (!roseOverlayFlowers) return;

    for (let i = 0; i < count; i++) {
      const rose = document.createElement('div');
      rose.className = 'blooming-rose-item';

      const imgSrc = roseImages[Math.floor(Math.random() * roseImages.length)];
      const startX = Math.random() * 95;
      const size = Math.random() * 80 + 70;
      const duration = Math.random() * 4 + 4;
      const delay = Math.random() * 1.5;
      const swayOffset = (Math.random() - 0.5) * 80;
      const rot = (Math.random() - 0.5) * 60;

      rose.style.left = `${startX}%`;
      rose.style.bottom = `-160px`;
      rose.style.setProperty('--target-size', `${size}px`);
      rose.style.setProperty('--sway', `${swayOffset}px`);
      rose.style.setProperty('--rot', `${rot}deg`);
      rose.style.animationDuration = `${duration}s`;
      rose.style.animationDelay = `${delay}s`;

      rose.innerHTML = `<img src="${imgSrc}" alt="Hoa hồng tuyệt đẹp">`;

      rose.addEventListener('click', (e) => {
        e.stopPropagation();
        rose.classList.add('pop-flower');
        if (window.createRoseBurst) {
          window.createRoseBurst(e.clientX, e.clientY, 8);
        }
      });

      roseOverlayFlowers.appendChild(rose);

      setTimeout(() => {
        rose.remove();
      }, (duration + delay) * 1000);
    }
  }

  function closeFlowerStorm() {
    if (!fullscreenRoseStage) return;
    fullscreenRoseStage.classList.remove('active');
    if (spawnTimer) clearInterval(spawnTimer);
    setTimeout(() => {
      if (roseOverlayFlowers) roseOverlayFlowers.innerHTML = '';
    }, 500);
  }

  if (floatingRoseTrigger) {
    floatingRoseTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerFlowerStorm();
    });
  }

  if (closeRoseStageBtn) {
    closeRoseStageBtn.addEventListener('click', closeFlowerStorm);
  }

  if (moreRosesBtn) {
    moreRosesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      spawnRoses(25);
      totalRoses += 99;
      localStorage.setItem('celebrate_2010_rose_count', totalRoses);
      if (totalRosesGivenEl) totalRosesGivenEl.textContent = totalRoses;

      if (window.romanticAudio) {
        window.romanticAudio.playTone(1046.5, 'sine', window.romanticAudio.audioCtx.currentTime, 0.8, 0.3);
      }
    });
  }

  if (fullscreenRoseStage) {
    fullscreenRoseStage.addEventListener('click', (e) => {
      if (e.target.closest('.stage-controls') || e.target.closest('.stage-banner')) return;
      if (window.createRoseBurst) {
        window.createRoseBurst(e.clientX, e.clientY, 10);
      }
      spawnRoses(4);
    });
  }

  window.triggerFlowerStorm = triggerFlowerStorm;
  window.bloomInteractiveRose = bloomInteractiveRose;
})();
