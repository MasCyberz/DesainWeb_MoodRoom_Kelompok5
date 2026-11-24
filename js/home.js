/* Halaman Beranda — Interaktif, Dinamis & Responsif terhadap Mood */
(() => {
  const { $, $$, say, restoreMark, playTitle, isPlayingTitle, burstLikes } = MR;
  const EQ = '<span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';

  // Dynamic time-of-day greeting
  const updateGreeting = () => {
    const greetingEl = $('#heroGreeting');
    if (!greetingEl) return;
    const hour = new Date().getHours();
    let text = 'Selamat Malam';
    let icon = '🌌';
    if (hour >= 4 && hour < 11) { text = 'Selamat Pagi'; icon = '☀️'; }
    else if (hour >= 11 && hour < 15) { text = 'Selamat Siang'; icon = '🌤️'; }
    else if (hour >= 15 && hour < 18) { text = 'Selamat Sore'; icon = '🌅'; }
    greetingEl.innerHTML = `${text}, Dimas <span class="ms-1">${icon}</span>`;
  };
  updateGreeting();

  // Mood Catalogs
  const MOOD_DATA = [
    {
      name: 'Galau',
      tagline: 'Lagi galau? Kami temenin lewat alunan melodi sendu 🥺',
      cards: [
        { title: 'Usia-Usia Dewasa — Lomba Sihir', text: '“Dengerin pas jam 1 malam revisi belum kelar...”', by: '@senja_manis', track: 'Usia-Usia Dewasa - Lomba Sihir' },
        { title: 'Satu Bulan Tanpamu — Bernadya', text: '“Belum siap melihatmu bahagia dengan yang baru...”', by: '@nadia_den', track: 'Satu Bulan - Bernadya' },
        { title: 'Pilu Membiru — Kunto Aji', text: '“Semua yang belum sempat tersampaikan ke kamu...”', by: '@dimas_galau', track: 'Pilu Membiru - Kunto Aji' }
      ],
      songs: [
        { title: 'Evaluasi - Hindia', tag: 'Indie • 3:31', grad: ['#8a6a40', '#2c1a0c'] },
        { title: 'Satu Bulan - Bernadya', tag: 'Pop • 3:19', grad: ['#4a3a38', '#0c0a0c'] },
        { title: 'Usai - Tiara Andini', tag: 'Pop • 3:37', grad: ['#f4f0f4', '#a8c0e0'] },
        { title: 'Pilu Membiru - Kunto Aji', tag: 'Indie • 4:11', grad: ['#d8dcc0', '#6a7a50'] }
      ],
      albums: [
        { title: 'Menari Dengan Bayangan', sub: 'Hindia', grad: 'linear-gradient(135deg, #8a6a40, #2c1a0c)' },
        { title: 'Sialnya, Hidup Harus Tetap Berjalan', sub: 'Bernadya', grad: 'linear-gradient(135deg, #4a3a38, #0c0a0c)' },
        { title: 'Mantra Mantra', sub: 'Kunto Aji', grad: 'linear-gradient(135deg, #d8dcc0, #6a7a50)' },
        { title: 'Selamat Ulang Tahun', sub: 'Nadin Amizah', grad: 'linear-gradient(135deg, #f4e8e0, #c04a5a)' }
      ]
    },
    {
      name: 'Santai',
      tagline: 'Santai dulu sejenak, nikmati seduhan kopi hangatmu ☕',
      cards: [
        { title: 'Sore Tenang di Teras Rumah', text: '“Menikmati senja ditemani petikan gitar akustik...”', by: '@kopi_senja', track: 'Bergema Sampai Selamanya - Nadhif Basalamah' },
        { title: 'Akustik Santai Pelan', text: '“Melodi pelan buat melepas penat seharian nugas”', by: '@akustik_id', track: 'Hati-Hati di Jalan - Tulus' },
        { title: 'Cincin & Cerita Manis', text: '“Lagu yang bikin senyum-senyum sendiri pas dengerin”', by: '@rina_cute', track: 'Cincin - Hindia' }
      ],
      songs: [
        { title: 'Bergema Sampai Selamanya - Nadhif Basalamah', tag: 'Pop • 3:26', grad: ['#a8b878', '#3a5a2c'] },
        { title: 'Hati-Hati di Jalan - Tulus', tag: 'Pop • 4:12', grad: ['#6a8ac0', '#1a2a50'] },
        { title: 'Cincin - Hindia', tag: 'Indie • 3:45', grad: ['#8a6a40', '#2c1a0c'] },
        { title: 'Komang - Raim Laode', tag: 'Pop • 4:33', grad: ['#d48a50', '#4a2a16'] }
      ],
      albums: [
        { title: 'Manusia', sub: 'Tulus', grad: 'linear-gradient(135deg, #6a8ac0, #1a2a50)' },
        { title: 'Bergema Sampai Selamanya', sub: 'Nadhif Basalamah', grad: 'linear-gradient(135deg, #a8b878, #3a5a2c)' },
        { title: 'Pagi Pelan', sub: 'Kopi Tenang', grad: 'linear-gradient(135deg, #a0603a, #3a2010)' },
        { title: 'Minoritas', sub: 'Slank', grad: 'linear-gradient(135deg, #d4553a, #5a1a14)' }
      ]
    },
    {
      name: 'Fokus',
      tagline: 'Waktunya fokus maksimal, singkirkan semua distraksi 🎧',
      cards: [
        { title: 'Deep Work & Night Coding', text: '“Hujan gerimis di luar, ketukan lo-fi di telinga...”', by: '@dev_lofi', track: 'Rainy Window - Lo-fi Collective' },
        { title: 'Study Beats 24/7', text: '“Alunan tanpa lirik bikin nalar jalan lancar”', by: '@chill_coder', track: 'Desk Lamp - Kopi Tenang' },
        { title: 'Jazz Malam Redup', text: '“Harmoni kontemplatif untuk otak yang sedang bekerja”', by: '@jazz_notes', track: 'Take Five - Dave Brubeck' }
      ],
      songs: [
        { title: 'Rainy Window - Lo-fi Collective', tag: 'Lo-fi • 2:48', grad: ['#4a7a9a', '#14304a'] },
        { title: 'Take Five - Dave Brubeck', tag: 'Jazz • 5:24', grad: ['#a0603a', '#3a2010'] },
        { title: 'Desk Lamp - Kopi Tenang', tag: 'Lo-fi • 3:14', grad: ['#3a7a60', '#103024'] },
        { title: 'Kata Mereka Ini Berlebihan - Bernadya', tag: 'Pop • 3:33', grad: ['#4a3a38', '#0c0a0c'] }
      ],
      albums: [
        { title: 'Study Beats Vol. 1', sub: 'Lo-fi Collective', grad: 'linear-gradient(135deg, #4a7a9a, #14304a)' },
        { title: 'Time Out', sub: 'Dave Brubeck', grad: 'linear-gradient(135deg, #a0603a, #3a2010)' },
        { title: 'Fokus Dulu', sub: 'Nada Sunyi', grad: 'linear-gradient(135deg, #3a7a60, #103024)' },
        { title: 'Kind of Blue', sub: 'Miles Davis', grad: 'linear-gradient(135deg, #2a4060, #0a1428)' }
      ]
    },
    {
      name: 'Semangat',
      tagline: 'Bakar energi, pompa adrenalin, gaspol tanpa rem! 🔥',
      cards: [
        { title: 'Workout & Adrenaline Rush', text: '“Pompa energimu ke batas tertinggi hari ini!”', by: '@gym_beast', track: 'Peradaban - .Feast' },
        { title: 'Distorsi Semangat Pagi', text: '“Gitar meraung buat bangunin mental juara”', by: '@rock_daily', track: 'Back In Black - AC/DC' },
        { title: 'Gaspol Kejar Deadline', text: '“Ketika tempo tinggi dan ambisi berpadu jadi karya”', by: '@hapisganteng', track: 'Blinding Lights - The Weeknd' }
      ],
      songs: [
        { title: 'Peradaban - .Feast', tag: 'Rock • 4:02', grad: ['#d4553a', '#5a1a14'] },
        { title: 'Blinding Lights - The Weeknd', tag: 'Pop • 3:20', grad: ['#e0405a', '#3a0a1a'] },
        { title: 'Back In Black - AC/DC', tag: 'Rock • 4:15', grad: ['#222222', '#000000'] },
        { title: 'Secukupnya - Hindia', tag: 'Indie • 3:27', grad: ['#8a6a40', '#2c1a0c'] }
      ],
      albums: [
        { title: 'Membangun & Menghancurkan', sub: '.Feast', grad: 'linear-gradient(135deg, #d4553a, #5a1a14)' },
        { title: 'After Hours', sub: 'The Weeknd', grad: 'linear-gradient(135deg, #e0405a, #3a0a1a)' },
        { title: 'Back in Black', sub: 'AC/DC', grad: 'linear-gradient(135deg, #333333, #111111)' },
        { title: 'Appetite for Destruction', sub: "Guns N' Roses", grad: 'linear-gradient(135deg, #a88030, #38240a)' }
      ]
    }
  ];

  let currentMoodIdx = 0;

  // Render konten berdasarkan mood
  const renderMoodContent = (idx) => {
    const data = MOOD_DATA[idx];
    if (!data) return;

    // MoodCards
    $('#cardList').innerHTML = data.cards.map(c => `
      <div class="col-12 col-md-6 col-xl-4 item fade-scale-in" data-type="card">
        <article class="mcard" data-track="${c.track}">
          <h3><i class="bi bi-music-note-list text-pink me-1"></i>${c.title}${EQ.replace('class="eq"', 'class="eq ms-auto"')}</h3>
          <p>${c.text}</p>
          <small>Dibuat oleh: <b>${c.by}</b></small>
          <div class="d-flex align-items-center mt-auto pt-2">
            <button class="btn btn-pink btn-sm fw-semibold py-0 px-2 rounded-1 play-card" title="Putar MoodCard ini">
              <i class="bi bi-play-fill"></i> Play
            </button>
            <span class="ms-auto">
              <button class="ibtn" data-toggle="bi-bookmark" aria-label="Simpan"><i class="bi bi-bookmark"></i></button>
              <button class="ibtn" data-toggle="bi-heart" aria-label="Suka"><i class="bi bi-heart"></i></button>
            </span>
          </div>
        </article>
      </div>`).join('');

    // Trending Songs
    $('#songList').innerHTML = data.songs.map(s => `
      <div class="col-12 col-md-6 item fade-scale-in" data-type="song">
        <div class="track${isPlayingTitle(s.title) ? ' is-playing' : ''}" tabindex="0" role="button" data-title="${s.title}" title="Putar ${s.title}">
          <span class="cover xs" style="background:linear-gradient(135deg, ${s.grad[0]}, ${s.grad[1]})"></span>
          <div class="min-w-0 flex-grow-1">
            <div class="t text-truncate">${s.title}</div>
            <small class="text-white-50" style="font-size:.7rem">${s.tag}</small>
          </div>
          ${EQ}
          <span class="pbadge"><i class="bi bi-play-fill"></i></span>
        </div>
      </div>`).join('');

    // Trending Albums
    $('#albumList').innerHTML = data.albums.map(a => `
      <div class="col-6 col-md-3 item fade-scale-in" data-type="album">
        <div class="album" tabindex="0" role="button" data-title="${a.title} - ${a.sub}" style="background:${a.grad}" title="Putar Album ${a.title}">
          ${EQ.replace('class="eq"', 'class="eq album-eq"')}
          <div class="cap">
            <span><b>${a.title}</b>${a.sub}</span>
            <span class="pbadge sm"><i class="bi bi-play-fill"></i></span>
          </div>
        </div>
      </div>`).join('');

    restoreMark();
  };

  // Mood slider and atmosphere change
  const range = $('#moodRange');
  const heroSec = $('#heroSection') || $('.hero');

  const setMood = (i, userTriggered = true) => {
    currentMoodIdx = i;
    if (range) range.value = i;
    const moodObj = MOOD_DATA[i];
    $('#moodQ').textContent = moodObj.tagline;
    $$('#moodLabels button').forEach((b, k) => b.classList.toggle('on', k === i));

    if (heroSec) {
      heroSec.className = `hero mb-5 hero-mood-${i}`;
    }

    renderMoodContent(i);

    if (userTriggered) {
      say(`Vibe berganti: ${moodObj.name} ✨`);
      const activeBtn = $(`#moodLabels button[data-i="${i}"]`);
      if (activeBtn) {
        const r = activeBtn.getBoundingClientRect();
        burstLikes(r.left + r.width / 2, r.top);
      }
    }
  };

  if (range) range.addEventListener('input', () => setMood(+range.value, true));
  $$('#moodLabels button').forEach(b => b.addEventListener('click', () => setMood(+b.dataset.i, true)));

  // Search + filter
  let filter = 'all';
  const applyFilter = () => {
    const q = $('#searchInput').value.trim().toLowerCase();
    let shown = 0;
    $$('.item').forEach(el => {
      const ok = (filter === 'all' || el.dataset.type === filter) && el.textContent.toLowerCase().includes(q);
      el.classList.toggle('d-none', !ok);
      if (ok) shown++;
    });
    ['Card', 'Song', 'Album'].forEach(n => {
      const sec = $('#sec' + n);
      if (sec) sec.classList.toggle('d-none', !$$('.item', sec).some(i => !i.classList.contains('d-none')));
    });
    $('#noResult')?.classList.toggle('d-none', shown > 0);
  };
  $('#searchInput')?.addEventListener('input', applyFilter);
  document.addEventListener('mr:filter', e => { filter = e.detail; applyFilter(); });

  // Initial render
  setMood(0, false);
})();
