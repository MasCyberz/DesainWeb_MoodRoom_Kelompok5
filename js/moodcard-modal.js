(() => {
  'use strict';

  const STORAGE_KEY = 'moodroom_moodcards';
  const builtInCards = [
    { id: 1, title: 'Senja Tenang', cover: 'img/mood_senja.png', songCount: 12, date: '12 Jan 2025', status: 'published' },
    { id: 2, title: 'Bulan Malam', cover: 'img/mood_bulan.png', songCount: 12, date: '12 Jan 2025', status: 'published' },
    { id: 3, title: 'Ruang Sendiri', cover: 'img/mood_ruang.png', songCount: 12, date: '12 Jan 2025', status: 'published' }
  ];

  const songs = [
    { title: 'Bulan Memen', artist: 'Nadin Amizah', genre: 'Indie', duration: '3:44', cover: 'img/covers/galau_room.jpg' },
    { title: 'Bergema Sampai Selamanya', artist: 'Nadhif Basalamah', genre: 'Pop', duration: '3:26', cover: 'img/covers/santai_nature.jpg' },
    { title: 'Satu Bulan', artist: 'Bernadya', genre: 'Pop', duration: '3:19', cover: 'img/covers/galau_room.jpg' },
    { title: 'Nina', artist: 'Feast', genre: 'Rock', duration: '4:37', cover: 'img/covers/semangat_concert.jpg' },
    { title: 'Secukupnya', artist: 'Hindia', genre: 'Indie', duration: '3:27', cover: 'img/covers/galau_night.jpg' },
    { title: 'Usai', artist: 'Tiara Andini', genre: 'Pop', duration: '3:37', cover: 'img/covers/galau_city.jpg' },
    { title: 'Untuk Perempuan yang Sedang Dalam Pelukan', artist: 'Payung Teduh', genre: 'R&B', duration: '4:41', cover: 'img/covers/santai_coffee.jpg' }
  ];

  let selectedSongs = [1, 2, 3];
  let draftStep = 1;
  let confirmAction = null;
  let activeGenre = 'Semua';

  const readCards = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return saved.length ? saved : [...builtInCards];
    } catch {
      return [...builtInCards];
    }
  };

  const writeCards = cards => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  };

  const say = message => window.MR?.say ? window.MR.say(message) : null;

  const MODAL_TEMPLATE = `
    <div class="mc-modal">
      <div class="mc-head">
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-mr rounded-circle d-none" id="mcBackBtn" aria-label="Kembali">
            <i class="bi bi-arrow-left"></i>
          </button>
          <h2 id="mcModalTitle">Pilih Lagu Untuk MoodCard</h2>
        </div>
        <button class="mc-close" id="mcCloseBtn" aria-label="Tutup">&times;</button>
      </div>
      <!-- PILIH LAGU -->
      <div class="mc-body" id="mcStep1">
        <div class="mc-search">
          <i class="bi bi-search text-white-50"></i>
          <input type="search" id="mcSongSearch" placeholder="Cari Lagu, Artis, atau Judul">
        </div>
        <div class="mc-chips" id="mcGenreChips">
          <button type="button" class="mc-chip active" data-genre="Semua">Semua</button>
          <button type="button" class="mc-chip" data-genre="Pop">Pop</button>
          <button type="button" class="mc-chip" data-genre="Indie">Indie</button>
          <button type="button" class="mc-chip" data-genre="Rock">Rock</button>
          <button type="button" class="mc-chip" data-genre="R&B">R&amp;B</button>
        </div>
        <div class="mc-song-list" id="mcSongList"></div>
      </div>
      <!-- PENGATURAN MOODCARD -->
      <div class="mc-body d-none" id="mcStep2">
        <div class="mc-banner-editor">
          <label class="mc-art-box" title="Ganti Gambar Sampul">
            <img id="mcCoverPreview"
              src="img/covers/santai_coffee.jpg"
              alt="Sampul MoodCard">
            <span class="mc-art-add"><i class="bi bi-plus-lg"></i></span>
            <input type="file" id="mcCoverInput" accept="image/*" class="d-none">
          </label>
          <div class="mc-live-canvas" id="mcBannerTextArea" style="text-align: left;">
            <div>
              <input type="text" class="mc-title-input" id="mcTitleInput" value="Kita yang Dulu" maxlength="40" placeholder="Judul MoodCard...">
              <div class="small text-white-50 mt-1" id="mcLiveNote">Waktu ternyata cepat banget yaa..</div>
            </div>
            <div class="my-2 fw-bold fs-6" id="mcLiveLyric">
              \u201cTentang kita yang pernah tertawa, sebelum waktu membawa kita ke jalan masing-masing\u201d
            </div>
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-2">
              <span class="small fw-semibold" id="mcLiveSong">Ribuan Memori \u2014 Lomba Sihir</span>
              <span class="mc-mood-tag mb-0" id="mcLiveMoodBadge">🎵 Mood: Galau</span>
            </div>
          </div>
        </div>
        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <div class="mc-editor-card">
              <div class="fw-semibold small mb-2">Kutipan Lirik</div>
              <textarea class="mc-textarea" id="mcLyricInput" rows="2" maxlength="100">Tentang kita yang pernah tertawa, sebelum waktu membawa kita ke jalan masing-masing</textarea>
              <div class="mc-song-pill-select">
                <span class="cover xs rounded-1" id="mcActiveSongThumb"></span>
                <select id="mcFeaturedSongSelect" aria-label="Pilih lagu kutipan"></select>
                <small class="text-white-50 flex-none"><span id="mcLyricCount">80</span>/100</small>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="mc-editor-card">
              <div class="fw-semibold small mb-2">Catatan Kurator</div>
              <textarea class="mc-textarea" id="mcNoteInput" rows="3" maxlength="100">Waktu ternyata cepat banget yaa..</textarea>
              <div class="text-end small text-white-50 mt-1"><span id="mcNoteCount">33</span>/100</div>
            </div>
          </div>
        </div>
        <div class="row g-3">
          <div class="col-md-6">
            <div class="mc-editor-card">
              <div class="fw-semibold small mb-2">Pengaturan Teks</div>
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div>
                  <div class="text-white-50" style="font-size:.72rem">Font</div>
                  <select class="form-select form-select-sm bg-dark text-white border-secondary mt-1" id="mcFontSelect">
                    <option value="Montserrat" selected>Montserrat</option>
                    <option value="Georgia">Playfair / Serif</option>
                    <option value="Courier New">Monospace</option>
                  </select>
                </div>
                <div>
                  <div class="text-white-50" style="font-size:.72rem">Posisi Teks</div>
                  <div class="d-flex gap-1 mt-1" id="mcAlignGroup">
                    <button type="button" class="mc-align-btn active" data-align="left"><i class="bi bi-text-left"></i></button>
                    <button type="button" class="mc-align-btn" data-align="center"><i class="bi bi-text-center"></i></button>
                    <button type="button" class="mc-align-btn" data-align="right"><i class="bi bi-text-right"></i></button>
                  </div>
                </div>
                <div>
                  <div class="text-white-50" style="font-size:.72rem">Warna Teks</div>
                  <div class="d-flex gap-2 mt-2" id="mcColorGroup">
                    <span class="mc-swatch active" data-color="#ffffff" data-cname="Putih" style="background:#ffffff"></span>
                    <span class="mc-swatch" data-color="#1c0b30" data-cname="Ungu Gelap" style="background:#1c0b30"></span>
                    <span class="mc-swatch" data-color="#f7b2d9" data-cname="Pink Pastel" style="background:#f7b2d9"></span>
                    <span class="mc-swatch" data-color="#a5f3fc" data-cname="Biru Muda" style="background:#a5f3fc"></span>
                    <span class="mc-swatch" data-color="#fde047" data-cname="Kuning" style="background:#fde047"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="mc-editor-card justify-content-center">
              <div class="fw-semibold small mb-2">Pilih Mood</div>
              <input type="range" class="form-range mood-range" id="mcMoodRange" min="0" max="3" step="1" value="0">
              <div class="mood-labels fw-semibold small" id="mcMoodLabels">
                <button type="button" class="on" data-mi="0">Galau 🥺</button>
                <button type="button" data-mi="1">Santai ☕</button>
                <button type="button" data-mi="2">Fokus 🎧</button>
                <button type="button" data-mi="3">Semangat 🔥</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- PREVIEW MOODCARD -->
      <div class="mc-body d-none" id="mcStep3">
        <div class="mc-preview-grid">
          <div class="mc-card-preview" id="mcFinalCard">
            <div class="mc-card-preview-bg" id="mcFinalBg"></div>
            <span class="mc-mood-tag" id="mcPrevMood">Mood: Galau 🥺</span>
            <div class="small text-white-50">Kutipan Lirik</div>
            <blockquote class="fw-bold my-2" id="mcPrevLyric" style="font-size:1.15rem">
              "Tentang kita yang pernah tertawa, sebelum waktu membawa kita ke jalan masing-masing"
            </blockquote>
            <div class="d-flex align-items-center gap-2 my-2">
              <span class="cover xs rounded-1" id="mcPrevSongCov"></span>
              <div class="lh-sm">
                <div class="fw-bold small" id="mcPrevSongTitle">Ribuan Memori</div>
                <div class="text-white-50" style="font-size:.75rem" id="mcPrevSongArtist">Lomba Sihir</div>
              </div>
            </div>
            <div class="small text-white-50 mt-2">Catatan Kurator</div>
            <div class="small mb-3" id="mcPrevNote">Waktu ternyata cepat banget yaa..</div>
            <div class="d-flex align-items-center gap-2 small">
              <span class="avatar" style="width:22px;height:22px"></span>
              <span>Dibuat oleh: <b>@dimas</b></span>
            </div>
          </div>
          <div class="mc-settings-panel">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h3 class="fs-6 fw-bold mb-0">Pengaturan</h3>
              <button type="button" class="ibtn" id="mcEditFromPrev"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="mc-setting-row">
              <div>
                <div class="fw-semibold">Lagu</div>
                <small class="text-white-50"><span id="mcPrevSongCount">3</span> lagu dipilih</small>
              </div>
              <button type="button" class="btn btn-sm text-pink fw-semibold p-0" id="mcGotoStep1">Lihat</button>
            </div>
            <div class="mc-setting-row"><span>Mood</span><strong id="mcSetMood">Galau</strong></div>
            <div class="mc-setting-row"><span>Posisi Teks</span><strong id="mcSetAlign">Kiri</strong></div>
            <div class="mc-setting-row">
              <span>Ukuran Font</span>
              <select class="form-select form-select-sm bg-transparent text-white border-0 text-end w-auto fw-bold" id="mcFontSizeSelect">
                <option value="0.95rem" class="bg-dark">Kecil</option>
                <option value="1.15rem" class="bg-dark" selected>Medium</option>
                <option value="1.35rem" class="bg-dark">Besar</option>
              </select>
            </div>
            <div class="mc-setting-row">
              <span>Warna Teks</span>
              <span class="d-flex align-items-center gap-2">
                <span class="rounded-circle d-inline-block" id="mcSetColorDot" style="width:12px;height:12px;background:#fff"></span>
                <strong id="mcSetColorName">Putih</strong>
              </span>
            </div>
            <div class="mc-setting-row"><span>Font</span><strong id="mcSetFont">Montserrat</strong></div>
            <div class="mc-setting-row">
              <div class="min-w-0 pe-2">
                <div class="fw-semibold">Kutipan Lirik</div>
                <div class="text-white-50 text-truncate" style="font-size:.75rem" id="mcSetLyricShort">Tentang kita yang pernah tertawa...</div>
              </div>
              <button type="button" class="btn btn-sm text-pink fw-semibold p-0" id="mcGotoStep2">Edit</button>
            </div>
          </div>
        </div>
      </div>
      <!-- KOLEKSI MOODCARD SAYA -->
      <div class="mc-body d-none" id="mcStepCollection">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div class="d-flex gap-2" id="mcColTabs">
            <button type="button" class="mc-chip active" data-tab="published">Dipublikasikan</button>
            <button type="button" class="mc-chip" data-tab="draft">Draft</button>
          </div>
          <button type="button" class="btn btn-pink btn-sm rounded-pill px-3 fw-semibold" id="mcNewBtn">
            <i class="bi bi-plus-lg me-1"></i> Buat MoodCard Baru
          </button>
        </div>
        <div class="d-grid gap-3" id="mcCollectionList"></div>
      </div>
      <!-- FOOTER MODAL -->
      <div class="mc-foot" id="mcFooter">
        <div class="fw-bold" id="mcSelectedCounter">3 Lagu Terpilih</div>
        <div class="d-flex gap-2 ms-auto" id="mcFooterActions"></div>
      </div>
      <!-- HALAMAN KONFIRMASI -->
      <div class="mc-confirm-overlay d-none" id="mcConfirmOverlay">
        <div class="mc-confirm-box">
          <div class="mc-check-circle"><i class="bi bi-check-lg"></i></div>
          <h3 class="fs-5 fw-bold mb-2" id="mcConfirmTitle">MoodCard Berhasil diterbitkan!</h3>
          <p class="small text-white-50 mb-4" id="mcConfirmDesc">
            MoodCard kamu sudah terbit dan bisa dilihat di menu MoodCard Saya.
          </p>
          <div class="d-grid gap-2">
            <button type="button" class="btn btn-pink rounded-pill py-2 fw-semibold" id="mcConfirmPrimaryBtn">Lihat MoodCard</button>
            <button type="button" class="btn btn-outline-light rounded-pill py-2 fw-semibold" id="mcConfirmCloseBtn">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const ensureModal = () => {
    if (document.getElementById('mcBackdrop')) return;
    const wrap = document.createElement('div');
    wrap.className = 'mc-backdrop d-none';
    wrap.id = 'mcBackdrop';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'mcModalTitle');
    wrap.innerHTML = MODAL_TEMPLATE;
    document.body.appendChild(wrap);
  };

  const backdrop = () => document.getElementById('mcBackdrop');
  const footer = () => document.getElementById('mcFooter');
  const title = () => document.getElementById('mcModalTitle');

  const setStep = step => {
    const modal = backdrop();
    if (!modal) return;
    draftStep = step;
    modal.querySelectorAll('.mc-body').forEach(body => body.classList.add('d-none'));
    const current = step === 'Collection'
      ? document.getElementById('mcStepCollection')
      : document.getElementById(`mcStep${step}`);
    if (current) current.classList.remove('d-none');
    modal.classList.remove('d-none');

    const backButton = document.getElementById('mcBackBtn');
    if (backButton) backButton.classList.toggle('d-none', step === 1);
  };

  const selectedCount = () => selectedSongs.length;

  const renderSongList = () => {
    const list = document.getElementById('mcSongList');
    if (!list) return;
    const search = (document.getElementById('mcSongSearch')?.value || '').trim().toLowerCase();
    const filtered = songs
      .map((song, index) => ({ song, index }))
      .filter(({ song }) =>
        (activeGenre === 'Semua' || song.genre === activeGenre) &&
        (!search || `${song.title} ${song.artist} ${song.genre}`.toLowerCase().includes(search))
      );

    list.innerHTML = filtered.length ? filtered.map(({ song, index }, visibleIndex) => `
      <button type="button" class="mc-song-item${selectedSongs.includes(index) ? ' selected' : ''}" data-mc-song="${index}">
        <span class="mc-song-num">${String(visibleIndex + 1).padStart(2, '0')}</span>
        <span class="mc-song-cov" style="background-image:url('${song.cover}')"></span>
        <span class="min-w-0 flex-grow-1 text-start">
          <span class="d-block fw-bold text-truncate">${song.title}</span>
          <small class="text-white-50">${song.artist}</small>
        </span>
        <small class="text-white-50">${song.duration}</small>
        <span class="mc-check-btn"><i class="bi ${selectedSongs.includes(index) ? 'bi-check-lg' : 'bi-plus'}"></i></span>
      </button>`).join('') :
      '<p class="text-center text-white-50 py-4 mb-0">Lagu tidak ditemukan.</p>';

    updateSelectionFooter();
  };

  const updateSelectionFooter = () => {
    const counter = document.getElementById('mcSelectedCounter');
    if (counter) counter.textContent = `${selectedCount()} Lagu Terpilih`;
    const actions = document.getElementById('mcFooterActions');
    if (!actions) return;
    actions.innerHTML = `
      <button type="button" class="btn btn-outline-light rounded-pill px-3" data-mc-draft>Simpan Draft</button>
      <button type="button" class="btn btn-pink rounded-pill px-3" data-mc-next ${selectedCount() === 0 ? 'disabled' : ''}>Selanjutnya</button>`;
  };

  const openStep1 = () => {
    setStep(1);
    if (title()) title().textContent = 'Pilih Lagu Untuk MoodCard';
    const modalFooter = footer();
    if (modalFooter) modalFooter.classList.remove('d-none');
    renderSongList();
  };

  const syncEditor = () => {
    const featuredSelect = document.getElementById('mcFeaturedSongSelect');
    if (featuredSelect) {
      featuredSelect.innerHTML = selectedSongs.map(index => {
        const song = songs[index];
        return `<option value="${index}">${song.title} — ${song.artist}</option>`;
      }).join('');
    }

    const featuredIndex = Number(featuredSelect?.value ?? selectedSongs[0] ?? 0);
    const featured = songs[featuredIndex] || songs[0];
    const thumb = document.getElementById('mcActiveSongThumb');
    if (thumb) thumb.style.background = `url('${featured.cover}') center/cover`;

    const titleInput = document.getElementById('mcTitleInput');
    const liveSong = document.getElementById('mcLiveSong');
    if (liveSong) liveSong.textContent = `${featured.title} — ${featured.artist}`;

    const lyricInput = document.getElementById('mcLyricInput');
    const liveLyric = document.getElementById('mcLiveLyric');
    if (lyricInput && liveLyric) liveLyric.textContent = `“${lyricInput.value}”`;

    const lyricCount = document.getElementById('mcLyricCount');
    if (lyricInput && lyricCount) lyricCount.textContent = lyricInput.value.length;

    const noteInput = document.getElementById('mcNoteInput');
    const liveNote = document.getElementById('mcLiveNote');
    if (noteInput && liveNote) liveNote.textContent = noteInput.value;
    const noteCount = document.getElementById('mcNoteCount');
    if (noteInput && noteCount) noteCount.textContent = noteInput.value.length;

    if (titleInput) titleInput.value = titleInput.value || 'MoodCard Baru';
  };

  const openStep2 = () => {
    if (selectedCount() === 0) {
      say('Pilih minimal satu lagu');
      return;
    }
    setStep(2);
    if (title()) title().textContent = 'Atur MoodCard';
    const modalFooter = footer();
    if (modalFooter) modalFooter.classList.remove('d-none');
    const counter = document.getElementById('mcSelectedCounter');
    if (counter) counter.textContent = `${selectedCount()} Lagu Terpilih`;
    const actions = document.getElementById('mcFooterActions');
    if (actions) actions.innerHTML = `
      <button type="button" class="btn btn-outline-light rounded-pill px-3" data-mc-draft>Simpan Draft</button>
      <button type="button" class="btn btn-pink rounded-pill px-3" data-mc-preview>Selanjutnya</button>`;
    syncEditor();
  };

  const syncPreview = () => {
    const titleInput = document.getElementById('mcTitleInput');
    const lyricInput = document.getElementById('mcLyricInput');
    const noteInput = document.getElementById('mcNoteInput');
    const featuredSelect = document.getElementById('mcFeaturedSongSelect');
    const featured = songs[Number(featuredSelect?.value ?? selectedSongs[0] ?? 0)] || songs[0];
    const moodButtons = [...document.querySelectorAll('#mcMoodLabels [data-mi]')];
    const activeMood = moodButtons.find(button => button.classList.contains('on'));
    const moodIndex = activeMood ? Number(activeMood.dataset.mi) : 0;
    const moods = ['Galau 🥺', 'Santai ☕', 'Fokus 🎧', 'Semangat 🔥'];

    document.getElementById('mcPrevLyric').textContent = lyricInput?.value || 'MoodCard tanpa kutipan';
    document.getElementById('mcPrevNote').textContent = noteInput?.value || '';
    document.getElementById('mcPrevMood').textContent = `Mood: ${moods[moodIndex]}`;
    document.getElementById('mcPrevSongTitle').textContent = featured.title;
    document.getElementById('mcPrevSongArtist').textContent = featured.artist;
    document.getElementById('mcPrevSongCov').style.background = `linear-gradient(135deg,#d96fb0,#5c327f), url('${featured.cover}')`;
    document.getElementById('mcFinalBg').style.backgroundImage = `url('${document.getElementById('mcCoverPreview')?.src || featured.cover}')`;
    document.getElementById('mcPrevSongCount').textContent = selectedCount();
    document.getElementById('mcSetMood').textContent = moods[moodIndex];
    document.getElementById('mcSetLyricShort').textContent = lyricInput?.value || '';
  };

  const openStep3 = () => {
    setStep(3);
    if (title()) title().textContent = 'Preview MoodCard';
    syncPreview();
    const modalFooter = footer();
    if (modalFooter) modalFooter.classList.remove('d-none');
    const counter = document.getElementById('mcSelectedCounter');
    if (counter) counter.textContent = `${selectedCount()} Lagu Terpilih`;
    const actions = document.getElementById('mcFooterActions');
    if (actions) actions.innerHTML = `
      <button type="button" class="btn btn-outline-light rounded-pill px-3" data-mc-draft>Simpan Draft</button>
      <button type="button" class="btn btn-pink rounded-pill px-3" data-mc-publish>Terbitkan</button>`;
  };

  const openCollection = (status = 'published') => {
    setStep('Collection');
    if (title()) title().textContent = 'MoodCard Saya';
    const modalFooter = footer();
    if (modalFooter) modalFooter.classList.add('d-none');
    renderCollection(status);
  };

  const openSavedCard = card => {
    setStep(3);
    if (title()) title().textContent = card.title;
    document.getElementById('mcPrevLyric').textContent = card.lyric || card.title;
    document.getElementById('mcPrevNote').textContent = card.note || 'MoodCard dari koleksi kamu';
    document.getElementById('mcPrevMood').textContent = 'Mood: Galau 🥺';
    document.getElementById('mcPrevSongTitle').textContent = card.featuredSong || 'MoodCard';
    document.getElementById('mcPrevSongArtist').textContent = 'MoodRoom';
    document.getElementById('mcPrevSongCount').textContent = card.songCount || 0;
    document.getElementById('mcFinalBg').style.backgroundImage = `url('${card.cover}')`;
    const modalFooter = footer();
    if (modalFooter) modalFooter.classList.add('d-none');
  };

  const renderCollection = status => {
    document.querySelectorAll('#mcColTabs [data-tab]').forEach(button => {
      button.classList.toggle('active', button.dataset.tab === status);
    });
    const list = document.getElementById('mcCollectionList');
    if (!list) return;
    const cards = readCards().filter(card => (card.status || 'published') === status);
    list.innerHTML = cards.length ? cards.map(card => `
      <div class="mc-collection-item" data-card-id="${card.id}">
        <div class="mc-collection-thumb" style="background-image:url('${card.cover}')"></div>
        <div class="min-w-0 flex-grow-1">
          <div class="fw-bold fs-6 text-truncate">${card.title}</div>
          <div class="small text-white-50">${card.songCount || selectedCount()} lagu · ${card.date || 'Baru saja'}</div>
        </div>
        <button type="button" class="btn btn-pink btn-sm rounded-pill" data-mc-view="${card.id}">
          ${status === 'draft' ? 'Edit' : 'Lihat'}
        </button>
      </div>`).join('') :
      `<p class="text-center text-white-50 py-4 mb-0">${status === 'draft' ? 'Belum ada MoodCard draft.' : 'Belum ada MoodCard dipublikasikan.'}</p>`;
  };

  const collectDraft = status => {
    const titleInput = document.getElementById('mcTitleInput');
    const lyricInput = document.getElementById('mcLyricInput');
    const noteInput = document.getElementById('mcNoteInput');
    const featuredSelect = document.getElementById('mcFeaturedSongSelect');
    const featured = songs[Number(featuredSelect?.value ?? selectedSongs[0] ?? 0)] || songs[0];
    const coverPreview = document.getElementById('mcCoverPreview');
    const cards = readCards();
    const existingId = Number(localStorage.getItem('moodroom_editing_moodcard') || 0);
    const card = {
      id: existingId || Date.now(),
      title: titleInput?.value.trim() || 'MoodCard Baru',
      cover: coverPreview?.getAttribute('src') || featured.cover,
      songCount: selectedCount(),
      lyric: lyricInput?.value || '',
      note: noteInput?.value || '',
      featuredSong: featured.title,
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      status
    };
    const index = cards.findIndex(item => item.id === existingId);
    if (index >= 0) cards[index] = card;
    else cards.unshift(card);
    writeCards(cards);
    localStorage.removeItem('moodroom_editing_moodcard');
    return card;
  };

  const showConfirmation = action => {
    confirmAction = action;
    const overlay = document.getElementById('mcConfirmOverlay');
    if (!overlay) return;
    const isPublish = action === 'publish';
    document.getElementById('mcConfirmTitle').textContent = isPublish ? 'Terbitkan MoodCard?' : 'Simpan sebagai Draft?';
    document.getElementById('mcConfirmDesc').textContent = isPublish ?
      'MoodCard akan dipublikasikan dan muncul di tab Dipublikasikan.' :
      'MoodCard akan disimpan sebagai draft dan bisa diedit nanti.';
    document.getElementById('mcConfirmPrimaryBtn').textContent = isPublish ? 'Ya, Terbitkan' : 'Ya, Simpan Draft';
    document.getElementById('mcConfirmCloseBtn').textContent = 'Kembali';
    overlay.classList.remove('d-none');
  };

  const closeConfirmation = () => {
    document.getElementById('mcConfirmOverlay')?.classList.add('d-none');
    confirmAction = null;
  };

  const finishConfirmation = () => {
    if (!confirmAction) return;
    const card = collectDraft(confirmAction === 'publish' ? 'published' : 'draft');
    closeConfirmation();
    openCollection(card.status);
    say(confirmAction === 'publish' ? 'MoodCard berhasil diterbitkan' : 'MoodCard disimpan sebagai draft');
  };

  document.addEventListener('click', event => {
    const target = event.target;
    const backdropTarget = target.closest('#mcBackdrop');

    if (target.closest('#openMoodCardModal')) {
      event.preventDefault();
      ensureModal();
      openCollection('published');
      return;
    }
    if (target.closest('#mcCloseBtn') || (backdropTarget && target === backdropTarget)) {
      backdropTarget?.classList.add('d-none');
      closeConfirmation();
      return;
    }
    if (target.closest('#mcBackBtn')) {
      if (draftStep === 3) openStep2();
      else if (draftStep === 2) openStep1();
      else if (draftStep === 'Collection') openStep1();
      return;
    }

    if (target.closest('#mcNewBtn')) {
      localStorage.removeItem('moodroom_editing_moodcard');
      openStep1();
      return;
    }

    const tab = target.closest('#mcColTabs [data-tab]');
    if (tab) {
      renderCollection(tab.dataset.tab);
      return;
    }

    const songItem = target.closest('[data-mc-song]');
    if (songItem) {
      const index = Number(songItem.dataset.mcSong);
      selectedSongs = selectedSongs.includes(index)
        ? selectedSongs.filter(item => item !== index)
        : [...selectedSongs, index];
      renderSongList();
      return;
    }

    if (target.closest('[data-mc-next]')) {
      openStep2();
      return;
    }
    if (target.closest('[data-mc-preview]')) {
      openStep3();
      return;
    }
    if (target.closest('[data-mc-draft]')) {
      showConfirmation('draft');
      return;
    }
    if (target.closest('[data-mc-publish]')) {
      showConfirmation('publish');
      return;
    }
    if (target.closest('#mcConfirmPrimaryBtn')) {
      finishConfirmation();
      return;
    }
    if (target.closest('#mcConfirmCloseBtn')) {
      closeConfirmation();
      return;
    }

    const viewButton = target.closest('#mcCollectionList [data-mc-view]');
    if (viewButton) {
      const card = readCards().find(item => item.id === Number(viewButton.dataset.mcView));
      if (!card) return;
      if (card.status === 'draft') {
        localStorage.setItem('moodroom_editing_moodcard', String(card.id));
        if (card.featuredSong) {
          const index = songs.findIndex(song => song.title === card.featuredSong);
          if (index >= 0) selectedSongs = [index];
        }
        openStep2();
        const titleInput = document.getElementById('mcTitleInput');
        const lyricInput = document.getElementById('mcLyricInput');
        const noteInput = document.getElementById('mcNoteInput');
        if (titleInput) titleInput.value = card.title;
        if (lyricInput) lyricInput.value = card.lyric || '';
        if (noteInput) noteInput.value = card.note || '';
        syncEditor();
      } else {
        openSavedCard(card);
      }
    }
  });

  document.addEventListener('input', event => {
    if (event.target.id === 'mcSongSearch') renderSongList();
    if (['mcTitleInput', 'mcLyricInput', 'mcNoteInput', 'mcFeaturedSongSelect'].includes(event.target.id)) syncEditor();
  });

  document.addEventListener('change', event => {
    if (event.target.id === 'mcFeaturedSongSelect') syncEditor();
    if (event.target.id === 'mcFontSelect') {
      document.getElementById('mcBannerTextArea').style.fontFamily = event.target.value;
    }
    if (event.target.id === 'mcFontSizeSelect') {
      const previewLyric = document.getElementById('mcPrevLyric');
      if (previewLyric) previewLyric.style.fontSize = event.target.value;
    }
  });

  document.addEventListener('click', event => {
    const genre = event.target.closest('#mcGenreChips [data-genre]');
    if (genre) {
      activeGenre = genre.dataset.genre;
      document.querySelectorAll('#mcGenreChips [data-genre]').forEach(button => button.classList.toggle('active', button === genre));
      renderSongList();
      return;
    }

    const align = event.target.closest('#mcAlignGroup [data-align]');
    if (align) {
      document.querySelectorAll('#mcAlignGroup [data-align]').forEach(button => button.classList.remove('active'));
      align.classList.add('active');
      document.getElementById('mcBannerTextArea').style.textAlign = align.dataset.align;
    }

    const swatch = event.target.closest('#mcColorGroup [data-color]');
    if (swatch) {
      document.querySelectorAll('#mcColorGroup [data-color]').forEach(item => item.classList.remove('active'));
      swatch.classList.add('active');
      document.getElementById('mcBannerTextArea').style.color = swatch.dataset.color;
    }

    const mood = event.target.closest('#mcMoodLabels [data-mi]');
    if (mood) {
      document.querySelectorAll('#mcMoodLabels [data-mi]').forEach(button => button.classList.remove('on'));
      mood.classList.add('on');
      const range = document.getElementById('mcMoodRange');
      if (range) range.value = mood.dataset.mi;
      document.getElementById('mcLiveMoodBadge').textContent = `🎵 Mood: ${mood.textContent.replace(/^[^ ]+\s*/, '')}`;
    }
  });

  document.addEventListener('change', event => {
    if (event.target.id === 'mcCoverInput') {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const cp = document.getElementById('mcCoverPreview');
        if (cp) cp.src = reader.result;
        const ta = document.getElementById('mcBannerTextArea');
        if (ta) ta.style.backgroundImage = `url('${reader.result}')`;
      };
      reader.readAsDataURL(file);
    }
  });

  if (location.hash === '#moodcard') { ensureModal(); openCollection('published'); }
})();
