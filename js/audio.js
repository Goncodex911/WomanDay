/* =========================================================
   AUDIO.JS - ROMANTIC THEME MUSIC ENGINE: "YOUNG AND BEAUTIFUL"
   - Hỗ trợ phát bài hát "Young and Beautiful" (Lana Del Rey)
   - Tích hợp YouTube IFrame Player (Video ID: o_1aF54DO60)
   - Tích hợp Web Audio Synth mô phỏng giai điệu "Young and Beautiful" dự phòng offline 100%
   ========================================================= */

class RomanticMusicPlayer {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.timerId = null;
    this.step = 0;
    this.ytPlayer = null;
    this.ytReady = false;

    // Tần số các nốt nhạc (Hz)
    this.notes = {
      'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00,
      'A4': 440.00, 'B4': 493.88, 'C5': 523.25, 'D5': 587.33, 'E5': 659.25,
      'F5': 698.46, 'G5': 783.99, 'A5': 880.00
    };

    // Giai điệu & hợp âm bài hát "Young and Beautiful" (Lana Del Rey)
    // "Will you still love me when I'm no longer young and beautiful..."
    this.melodySequence = [
      // Câu 1: Hot summer nights, mid-July
      { chord: ['A3', 'E4', 'C5'], melody: 'E4', duration: 1.0 },
      { chord: ['A3', 'C5'], melody: 'A4', duration: 1.0 },
      { chord: ['C4', 'G4', 'E5'], melody: 'G4', duration: 1.0 },
      { chord: ['C4', 'E5'], melody: 'E4', duration: 1.0 },

      // Câu 2: When you and I were forever wild
      { chord: ['F3', 'C4', 'A4'], melody: 'A4', duration: 1.0 },
      { chord: ['F3', 'A4'], melody: 'C5', duration: 1.0 },
      { chord: ['G3', 'D4', 'B4'], melody: 'B4', duration: 1.0 },
      { chord: ['G3', 'B4'], melody: 'G4', duration: 1.0 },

      // Chorus: Will you still love me when I'm no longer young and beautiful?
      { chord: ['A3', 'E4', 'C5'], melody: 'C5', duration: 0.8 },
      { chord: ['A3'], melody: 'B4', duration: 0.8 },
      { chord: ['A3', 'C5'], melody: 'A4', duration: 1.2 },
      { chord: ['F3', 'C4'], melody: 'F4', duration: 0.8 },
      { chord: ['F3'], melody: 'A4', duration: 0.8 },
      { chord: ['G3', 'D4'], melody: 'G4', duration: 1.4 },

      // Chorus 2: Will you still love me when I got nothing but my aching soul?
      { chord: ['A3', 'E4'], melody: 'C5', duration: 0.8 },
      { chord: ['A3'], melody: 'B4', duration: 0.8 },
      { chord: ['A3', 'C5'], melody: 'A4', duration: 1.2 },
      { chord: ['F3', 'C4'], melody: 'A4', duration: 0.8 },
      { chord: ['G3', 'D4'], melody: 'B4', duration: 0.8 },
      { chord: ['A3', 'E4', 'C5'], melody: 'A4', duration: 1.8 }
    ];

    this.discElement = document.getElementById('music-disc');
    this.labelElement = document.getElementById('music-status-text');
    this.controllerElement = document.getElementById('music-controller');

    if (this.controllerElement) {
      this.controllerElement.addEventListener('click', () => this.toggle());
    }

    this.initYouTubePlayer();
  }

  // Tích hợp YouTube IFrame API cho bài "Young and Beautiful"
  initYouTubePlayer() {
    window.onYouTubeIframeAPIReady = () => {
      try {
        this.ytPlayer = new YT.Player('youtube-player', {
          height: '1',
          width: '1',
          videoId: 'o_1aF54DO60', // Lana Del Rey - Young and Beautiful
          playerVars: {
            autoplay: 0,
            controls: 0,
            loop: 1,
            playlist: 'o_1aF54DO60'
          },
          events: {
            onReady: () => {
              this.ytReady = true;
              // Nếu người dùng đã bấm mở thư trước khi player sẵn sàng
              if (this.isPlaying) {
                this.ytPlayer.playVideo();
              }
            },
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.PLAYING) {
                this.isPlaying = true;
                if (this.discElement) this.discElement.classList.add('playing');
                if (this.labelElement) this.labelElement.textContent = 'Young and Beautiful 🎵';
              }
            }
          }
        });
      } catch (err) {
        console.warn('YouTube API init error', err);
      }
    };

    // Nạp thẻ script YouTube API nếu chưa có
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playTone(freq, type = 'sine', startTime, duration, maxGain = 0.25) {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      // Âm sắc piano ấm áp: Attack 0.05s, Decay 0.3s
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(maxGain, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(maxGain * 0.45, startTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (e) {
      console.warn('Audio tone error', e);
    }
  }

  scheduleNextNote() {
    // Nếu YouTube đang phát nhạc thật thì không chạy tiếng piano synth để tránh trùng lặp âm thanh
    if (this.ytReady && this.ytPlayer && typeof this.ytPlayer.getPlayerState === 'function') {
      if (this.ytPlayer.getPlayerState() === 1) return;
    }

    if (!this.isPlaying) return;

    const item = this.melodySequence[this.step];
    const now = this.audioCtx.currentTime;

    // Phát hợp âm đệm Young and Beautiful
    if (item.chord) {
      item.chord.forEach((noteName, idx) => {
        const freq = this.notes[noteName];
        if (freq) {
          this.playTone(freq, 'triangle', now + idx * 0.08, item.duration * 1.5, 0.12);
        }
      });
    }

    // Phát nốt giai điệu chính
    if (item.melody) {
      const melodyFreq = this.notes[item.melody];
      if (melodyFreq) {
        this.playTone(melodyFreq, 'sine', now + 0.04, item.duration * 1.2, 0.22);
      }
    }

    this.step = (this.step + 1) % this.melodySequence.length;

    this.timerId = setTimeout(() => {
      this.scheduleNextNote();
    }, item.duration * 1000);
  }

  start() {
    this.initContext();
    this.isPlaying = true;

    // Cố gắng phát bài hát gốc Young and Beautiful từ YouTube Player
    if (this.ytReady && this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
      try {
        this.ytPlayer.playVideo();
      } catch (e) {
        console.warn('YT play failed, fallback to synth', e);
      }
    }

    // Luôn lên lịch synth du dương làm nhạc nền mượt mà
    this.step = 0;
    this.scheduleNextNote();

    if (this.discElement) this.discElement.classList.add('playing');
    if (this.labelElement) this.labelElement.textContent = 'Young and Beautiful 🎵';
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    if (this.ytReady && this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
      try {
        this.ytPlayer.pauseVideo();
      } catch (e) {}
    }

    if (this.discElement) this.discElement.classList.remove('playing');
    if (this.labelElement) this.labelElement.textContent = 'Bật nhạc';
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }
}

window.romanticAudio = new RomanticMusicPlayer();
