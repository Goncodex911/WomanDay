/* =========================================================
   MAIN.JS - ORCHESTRATION & INTERACTION FLOW
   Envelope Opening, Typewriter Effect, and Customization
   ========================================================= */

(function() {
  // Elements
  const sceneEnvelope = document.getElementById('scene-envelope');
  const envelopeWrapper = document.getElementById('envelope-wrapper');
  const waxSeal = document.getElementById('wax-seal');

  const sceneCard = document.getElementById('scene-card');
  const sceneGallery = document.getElementById('scene-gallery');
  const displayRecipient = document.getElementById('display-recipient');
  const displaySender = document.getElementById('display-sender');
  const typewriterMessage = document.getElementById('typewriter-message');
  const typewriterCursor = document.getElementById('typewriter-cursor');
  const scrollToGalleryBtn = document.getElementById('scroll-to-gallery-btn');

  // Settings Modal Elements
  const openSettingsBtn = document.getElementById('open-settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const settingsBackdrop = document.getElementById('settings-backdrop');
  const settingsClose = document.getElementById('settings-close');
  const inputRecipient = document.getElementById('input-recipient');
  const inputSender = document.getElementById('input-sender');
  const inputMessage = document.getElementById('input-message');
  const settingsSave = document.getElementById('settings-save');
  const settingsReset = document.getElementById('settings-reset');

  // Dữ liệu lời chúc mặc định dành tặng Ánh Hoài
  const DEFAULT_DATA = {
    recipient: 'Ánh Hoài',
    sender: 'Từ người luôn trân quý bạn',
    message: `Nhân ngày Phụ nữ Việt Nam 20/10, xin gửi đến Ánh Hoài những lời chúc tốt đẹp, ấm áp và ngọt ngào nhất!

Chúc Hoài luôn luôn dồi dào sức khỏe, ngập tràn năng lượng tươi trẻ và giữ trọn nụ cười rạng rỡ trên môi. Chúc bạn luôn gặp thật nhiều may mắn, bình an và hạnh phúc trong cuộc sống.

Đặc biệt trên con đường học tập và tương lai, chúc Ánh Hoài luôn kiên định, tự tin, học tập thật xuất sắc, vượt qua mọi kỳ thi với kết quả rực rỡ nhất và chinh phục thành công mọi ước mơ, hoài bão của mình!`
  };

  let customData = { ...DEFAULT_DATA };
  let isEnvelopeOpened = false;
  let typewriterInterval = null;

  // Tải dữ liệu từ LocalStorage
  function loadCustomData() {
    const saved = localStorage.getItem('celebrate_2010_content');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.recipient === 'Người Phụ Nữ Xinh Đẹp Của Tôi' || !parsed.recipient) {
          customData = { ...DEFAULT_DATA };
          saveCustomData();
        } else {
          customData = { ...DEFAULT_DATA, ...parsed };
        }
      } catch (e) {
        customData = { ...DEFAULT_DATA };
      }
    } else {
      customData = { ...DEFAULT_DATA };
    }
    updateCardText();
  }

  function saveCustomData() {
    localStorage.setItem('celebrate_2010_content', JSON.stringify(customData));
    updateCardText();
  }

  function updateCardText() {
    if (displayRecipient) displayRecipient.textContent = customData.recipient;
    if (displaySender) displaySender.textContent = customData.sender;
  }

  // Hiệu ứng chữ gõ máy (Typewriter Effect)
  function startTypewriter(text) {
    if (!typewriterMessage) return;
    if (typewriterInterval) clearInterval(typewriterInterval);

    typewriterMessage.textContent = '';
    if (typewriterCursor) typewriterCursor.style.display = 'inline-block';

    let index = 0;
    const speed = 35; // ms mỗi ký tự

    typewriterInterval = setInterval(() => {
      if (index < text.length) {
        typewriterMessage.textContent += text.charAt(index);
        index++;
      } else {
        clearInterval(typewriterInterval);
        // Tắt con trỏ sau 3 giây khi đã gõ xong
        setTimeout(() => {
          if (typewriterCursor) typewriterCursor.style.display = 'none';
        }, 3000);
      }
    }, speed);
  }

  // Kịch bản mở phong bì 3D
  function openEnvelope() {
    if (isEnvelopeOpened) return;
    isEnvelopeOpened = true;

    // Bật nhạc nền lãng mạn
    if (window.romanticAudio) {
      window.romanticAudio.start();
    }

    // Hiệu ứng mở phong bì 3D
    envelopeWrapper.classList.add('open');

    // Bắn chùm tim hoa rực rỡ từ con dấu sáp
    if (window.createHeartBurst) {
      const rect = waxSeal.getBoundingClientRect();
      window.createHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 28);
    }

    // Chuyển cảnh từ từ sang Thiệp 3D và Gallery
    setTimeout(() => {
      sceneEnvelope.classList.add('fade-out');

      setTimeout(() => {
        sceneEnvelope.style.display = 'none';
        sceneCard.classList.remove('hidden');
        sceneGallery.classList.remove('hidden');

        // Bắt đầu hiệu ứng gõ chữ
        startTypewriter(customData.message);

        // Cuộn mượt lên đầu thiệp
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 700);
    }, 1200);
  }

  // Lắng nghe sự kiện mở phong bì
  if (waxSeal) {
    waxSeal.addEventListener('click', (e) => {
      e.stopPropagation();
      openEnvelope();
    });
  }

  if (envelopeWrapper) {
    envelopeWrapper.addEventListener('click', () => {
      openEnvelope();
    });
  }

  // Nút cuộn xuống xem kho ảnh kỷ niệm
  if (scrollToGalleryBtn) {
    scrollToGalleryBtn.addEventListener('click', () => {
      sceneGallery.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Tương tác chạm vào Trái tim đang đập trên bức thư
  const beatingHeartTrigger = document.getElementById('beating-heart-trigger');
  if (beatingHeartTrigger) {
    beatingHeartTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = beatingHeartTrigger.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      if (window.createRoseBurst) {
        window.createRoseBurst(cx, cy, 14);
      }
      if (window.romanticAudio) {
        if (!window.romanticAudio.isPlaying) window.romanticAudio.start();
        window.romanticAudio.playTone(880, 'sine', window.romanticAudio.audioCtx.currentTime, 0.4, 0.35);
      }
    });
  }

  // ================= MODAL TÙY BIẾN THIỆP =================
  function openSettings() {
    if (!settingsModal) return;
    inputRecipient.value = customData.recipient;
    inputSender.value = customData.sender;
    inputMessage.value = customData.message;
    settingsModal.classList.add('show');
  }

  function closeSettings() {
    if (!settingsModal) return;
    settingsModal.classList.remove('show');
  }

  if (openSettingsBtn) openSettingsBtn.addEventListener('click', openSettings);
  if (settingsClose) settingsClose.addEventListener('click', closeSettings);
  if (settingsBackdrop) settingsBackdrop.addEventListener('click', closeSettings);

  if (settingsSave) {
    settingsSave.addEventListener('click', () => {
      customData.recipient = inputRecipient.value.trim() || DEFAULT_DATA.recipient;
      customData.sender = inputSender.value.trim() || DEFAULT_DATA.sender;
      customData.message = inputMessage.value.trim() || DEFAULT_DATA.message;

      saveCustomData();
      closeSettings();

      // Nếu thiệp đã mở, gõ lại chữ theo nội dung mới
      if (isEnvelopeOpened) {
        startTypewriter(customData.message);
      }

      if (window.createHeartBurst) {
        window.createHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 20);
      }
    });
  }

  if (settingsReset) {
    settingsReset.addEventListener('click', () => {
      if (confirm('Khôi phục lại lời chúc và tên mặc định ban đầu?')) {
        customData = { ...DEFAULT_DATA };
        saveCustomData();
        inputRecipient.value = customData.recipient;
        inputSender.value = customData.sender;
        inputMessage.value = customData.message;
        if (isEnvelopeOpened) {
          startTypewriter(customData.message);
        }
      }
    });
  }

  // Khởi động
  loadCustomData();
})();
