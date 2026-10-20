/* =========================================================
   GALLERY.JS - DYNAMIC MEMORY ALBUM & POLAROID EFFECTS
   - Tự động gán thông điệp ý nghĩa cho từng ảnh
   - Không hiển thị khung rỗng / placeholder hỏng
   - Sử dụng ảnh hoa thật người dùng gửi
   - Hỗ trợ chỉnh sửa tiêu đề trực tiếp
   ========================================================= */

(function() {
  const polaroidGrid = document.getElementById('polaroid-grid');
  const imageUploadInput = document.getElementById('image-upload-input');
  const toggleFloatBtn = document.getElementById('toggle-float-mode-btn');

  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxDate = document.getElementById('lightbox-date');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');

  // Danh sách thông điệp yêu thương tự động gán cho ảnh
  const poeticMessages = [
    'Nụ Cười Tỏa Nắng & Dịu Dàng',
    'Gia Đình Hạnh Phúc Đong Đầy',
    'Thanh Xuân Rực Rỡ & Kiêu Sa',
    'Ánh Mắt Ấm Áp Yêu Thương',
    'Bình Yên Trong Từng Khoảnh Khắc',
    'Món Quà Vô Giá Của Cuộc Đời',
    'Xinh Đẹp & Tươi Tắn Mỗi Ngày',
    'Mãi Mãi Là Niềm Tự Hào Của Tôi',
    'Đóa Hoa Ngát Hương Cuộc Sống',
    'Trọn Vẹn Yêu Thương & Bình An'
  ];

  // Ảnh kỷ niệm cố định từ tệp người dùng gửi (Toàn bộ 8 ảnh Ánh Hoài tuyệt đẹp)
  const fixedMemoryPhotos = [
    {
      id: 'photo-anh-hoai-main',
      title: 'Nụ Cười Tỏa Nắng & Dịu Dàng',
      date: '20/10/2026',
      url: 'assets/images/anh_hoai.jpg',
      isCustom: true
    },
    {
      id: 'photo-anh-hoai-1',
      title: 'Thanh Xuân Rạng Rỡ & Kiêu Sa',
      date: '20/10/2026',
      url: 'assets/images/anh_hoai_1.jpg',
      isCustom: true
    },
    {
      id: 'photo-anh-hoai-2',
      title: 'Ánh Mắt Trong Veo Ấm Áp',
      date: '20/10/2026',
      url: 'assets/images/anh_hoai_2.jpg',
      isCustom: true
    },
    {
      id: 'photo-anh-hoai-3',
      title: 'Xinh Đẹp & Duyên Dáng',
      date: '20/10/2026',
      url: 'assets/images/anh_hoai_3.jpg',
      isCustom: true
    },
    {
      id: 'photo-anh-hoai-4',
      title: 'Bình Yên Trong Từng Khoảnh Khắc',
      date: '20/10/2026',
      url: 'assets/images/anh_hoai_4.jpg',
      isCustom: true
    },
    {
      id: 'photo-anh-hoai-5',
      title: 'Ngọt Ngào & Tươi Tắn Mỗi Ngày',
      date: '20/10/2026',
      url: 'assets/images/anh_hoai_5.jpg',
      isCustom: true
    },
    {
      id: 'photo-anh-hoai-6',
      title: 'Đóa Hoa Rực Rỡ Nhất',
      date: '20/10/2026',
      url: 'assets/images/anh_hoai_6.jpg',
      isCustom: true
    },
    {
      id: 'photo-anh-hoai-7',
      title: 'Trọn Vẹn Yêu Thương Dành Cho Bạn',
      date: '20/10/2026',
      url: 'assets/images/anh_hoai_7.jpg',
      isCustom: true
    }
  ];

  let photos = [];

  function loadPhotos() {
    const saved = localStorage.getItem('celebrate_2010_photos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const validPhotos = parsed.filter(p => p && p.url && !p.url.startsWith('data:image/svg+xml'));
        // Kiểm tra xem đã có đủ ảnh Ánh Hoài chưa, ưu tiên nạp đầy đủ ảnh cố định
        const userUploaded = validPhotos.filter(p => p.url && p.url.startsWith('data:image'));
        photos = [...fixedMemoryPhotos, ...userUploaded];
      } catch (e) {
        photos = [...fixedMemoryPhotos];
      }
    } else {
      photos = [...fixedMemoryPhotos];
    }

    savePhotos();

    // Đảm bảo ảnh luôn có thông điệp ấm áp
    photos.forEach((photo, idx) => {
      // Nếu tên ảnh đang là tên file thô (như des8, tn3, file_...) thì thay bằng thông điệp 20/10
      if (!photo.title || /^(des|tn|img|image|photo|pic|screenshot|family|\d+)/i.test(photo.title.trim())) {
        photo.title = poeticMessages[idx % poeticMessages.length];
      }
    });

    renderGallery();
  }

  function savePhotos() {
    try {
      localStorage.setItem('celebrate_2010_photos', JSON.stringify(photos.slice(0, 30)));
    } catch (e) {
      console.warn('LocalStorage limit for photos', e);
    }
  }

  function renderGallery() {
    if (!polaroidGrid) return;
    polaroidGrid.innerHTML = '';

    // Nếu không có ảnh nào, hiển thị ảnh hoa mặc định
    const displayList = photos.length > 0 ? photos : realFlowerPhotos;

    displayList.forEach((photo, index) => {
      const item = document.createElement('div');
      item.className = 'polaroid-item';

      // Độ nghiêng luân phiên nghệ thuật
      const angles = [-3.5, 2.8, -2.2, 3.5, -3.8, 2.5];
      const rot = angles[index % angles.length];
      item.style.setProperty('--rot', `${rot}deg`);

      item.innerHTML = `
        <div class="polaroid-image-box">
          <img src="${photo.url}" alt="${photo.title}" loading="lazy">
        </div>
        <div class="polaroid-caption">
          <h4 class="polaroid-title" contenteditable="true" title="Bấm vào để chỉnh sửa thông điệp">${photo.title}</h4>
          <span class="polaroid-date">${photo.date || '20/10/2026'}</span>
        </div>
        ${photo.isCustom ? `<button class="delete-photo-btn" title="Xóa ảnh này">&times;</button>` : ''}
      `;

      // Click vào khung ảnh để xem phóng to
      item.querySelector('.polaroid-image-box').addEventListener('click', () => {
        openLightbox(photo);
      });

      // Cho phép sửa nhanh thông điệp trực tiếp trên thẻ ảnh
      const titleEl = item.querySelector('.polaroid-title');
      if (titleEl) {
        titleEl.addEventListener('blur', () => {
          photo.title = titleEl.textContent.trim() || poeticMessages[index % poeticMessages.length];
          savePhotos();
        });
        titleEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            titleEl.blur();
          }
        });
      }

      // Nút xóa ảnh tùy chỉnh
      const delBtn = item.querySelector('.delete-photo-btn');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          photos = photos.filter(p => p.id !== photo.id);
          savePhotos();
          renderGallery();
        });
      }

      polaroidGrid.appendChild(item);
    });
  }

  // Thêm ảnh từ máy tính/điện thoại
  if (imageUploadInput) {
    imageUploadInput.addEventListener('change', (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      // Nếu đang hiển thị hoa mặc định thì xóa để chỉ hiển thị ảnh của người dùng
      if (photos.length > 0 && !photos[0].isCustom) {
        photos = [];
      }

      const fileArray = Array.from(files);
      let loadedCount = 0;

      fileArray.forEach((file, idx) => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          // Lấy thông điệp tự động theo thứ tự
          const autoMessage = poeticMessages[(photos.length + idx) % poeticMessages.length];

          const newPhoto = {
            id: 'custom-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
            title: autoMessage,
            date: new Date().toLocaleDateString('vi-VN'),
            url: event.target.result,
            isCustom: true
          };

          photos.push(newPhoto);
          loadedCount++;

          if (loadedCount === fileArray.length) {
            savePhotos();
            renderGallery();
          }

          // Bắn hoa hồng ăn mừng
          if (window.createRoseBurst) {
            window.createRoseBurst(window.innerWidth / 2, window.innerHeight / 2, 12);
          }
        };
        reader.readAsDataURL(file);
      });

      imageUploadInput.value = '';
    });
  }

  // Chế độ trôi bồng bềnh
  if (toggleFloatBtn) {
    toggleFloatBtn.addEventListener('click', () => {
      polaroidGrid.classList.toggle('floating-mode');
      const isFloating = polaroidGrid.classList.contains('floating-mode');
      toggleFloatBtn.classList.toggle('active', isFloating);
      toggleFloatBtn.querySelector('span').textContent = isFloating ? 'Đang trôi bồng bềnh ✨' : 'Chế độ trôi bồng bềnh';
    });
  }

  // Lightbox Modal
  function openLightbox(photo) {
    if (!lightboxModal) return;
    lightboxImg.src = photo.url;
    lightboxCaption.textContent = photo.title;
    lightboxDate.textContent = photo.date || '20/10/2026';
    lightboxModal.classList.add('show');
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('show');
    lightboxImg.src = '';
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  loadPhotos();
  window.loadGalleryPhotos = loadPhotos;
})();
