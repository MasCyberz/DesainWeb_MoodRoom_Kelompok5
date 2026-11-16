(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const cards = Array(3).fill({ title: 'Usia-Usia Dewasa Lomba Sihir', text: '“Dengerin pas jam 1 malam revisi belum kelar...”', by: '@senja_manis' });
  const songs = Array(4).fill({ title: 'Evaluasi - Hindia' });
  const albums = Array(4).fill({ title: 'Menari Dengan....', sub: 'Melody' });
  const friends = [['Andi', '“Revisi jam 1..”'], ['Rina', '“Lagi santai kawan”'], ['Budi', '“Alamak capeknyo”'], ['Siti', '“Hapis kok bgtu sih”']];
  const moods = [
    ['Lagi galau? Kami temenin ya 🥺', 'Galau'], ['Santai dulu, minum kopi ☕', 'Santai'],
    ['Waktunya fokus 🎧', 'Fokus'], ['Gas terus, semangat! 🔥', 'Semangat']
  ];
  const wave = '<span class="wave" aria-hidden="true">' + [10, 22, 30, 16, 26, 12, 20].map(h => `<i style="height:${h}px"></i>`).join('') + '</span>';

  // Render
  $('#cardList').innerHTML = cards.map(c => `
    <div class="col-12 col-md-6 col-xl-4 item" data-type="card"><article class="mcard">
      <h3><i class="bi bi-music-note-list text-pink me-1"></i>${c.title}<span class="eq ms-auto" aria-hidden="true"><i></i><i></i><i></i><i></i></span></h3>
      <p>${c.text}</p><small>Dibuat oleh: <b>${c.by}</b></small>
      <div class="d-flex align-items-center mt-auto">
        <button class="btn btn-pink btn-sm fw-semibold py-0 px-2 rounded-1 play-card"><i class="bi bi-play-fill"></i> Play</button>
        <span class="ms-auto"><button class="ibtn" data-toggle="bi-bookmark" aria-label="Simpan"><i class="bi bi-bookmark"></i></button><button class="ibtn" data-toggle="bi-heart" aria-label="Suka"><i class="bi bi-heart"></i></button></span>
      </div></article></div>`).join('');

  $('#songList').innerHTML = songs.map(s => `
    <div class="col-12 col-md-6 item" data-type="song"><div class="track" tabindex="0" role="button" data-title="${s.title}">
      <span class="cover xs"></span><span class="t">${s.title}</span><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="pbadge"><i class="bi bi-play-fill"></i></span></div></div>`).join('');

  $('#albumList').innerHTML = albums.map(a => `
    <div class="col-6 col-md-3 item" data-type="album"><div class="album" tabindex="0" role="button" data-title="${a.title}">
      <span class="eq album-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span><div class="cap"><span><b>${a.title}</b>${a.sub}</span><span class="pbadge sm"><i class="bi bi-play-fill"></i></span></div></div></div>`).join('');

  $('#friendList').innerHTML = friends.map(f => `
    <div class="friend" role="button" tabindex="0"><span class="avatar s"></span><div><div class="n">${f[0]}</div><div class="s">${f[1]}</div></div>${wave}</div>`).join('');

  // Toast
  const toast = bootstrap.Toast.getOrCreateInstance($('#toast'), { delay: 1800 });
  const say = m => { $('#toastMsg').textContent = m; toast.show(); };

  // Mood slider
  const range = $('#moodRange');
  const setMood = i => {
    range.value = i;
    $('#moodQ').textContent = i == 0 ? 'Apa yang lagi kamu rasain saat ini?' : moods[i][0];
    $$('#moodLabels button').forEach((b, k) => b.classList.toggle('on', k == i));
    if (i > 0) say('Mood: ' + moods[i][1]);
  };
  range.addEventListener('input', () => setMood(+range.value));
  $$('#moodLabels button').forEach(b => b.addEventListener('click', () => setMood(+b.dataset.i)));

  // Toggle bookmark / like
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-toggle]');
    if (!b) return;
    const on = b.classList.toggle('on');
    const base = b.dataset.toggle;
    b.firstElementChild.className = 'bi ' + base + (on ? '-fill' : '');
  });

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
      sec.classList.toggle('d-none', !$$('.item', sec).some(i => !i.classList.contains('d-none')));
    });
    $('#noResult').classList.toggle('d-none', shown > 0);
  };
  $('#searchInput').addEventListener('input', applyFilter);
  $('#filterMenu').addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a) return;
    e.preventDefault();
    $$('#filterMenu a').forEach(x => x.classList.remove('active'));
    a.classList.add('active'); filter = a.dataset.f; applyFilter();
  });

  // Sidebar nav
  $('#mainNav').addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a) return;
    e.preventDefault();
    $$('#mainNav a').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
    const off = bootstrap.Offcanvas.getInstance($('#sidebar')); if (off) off.hide();
  });
  // Playlist sidebar: tampil 5, sisanya lewat "Lihat semua"
  const PL_LIMIT = 5;
  const playlists = ['Rock n Roll', 'Dangdut', 'Pop Indo', 'Indie Senja', 'Jazz Malam', 'Lo-fi Belajar', 'Akustik Santai', 'Workout Mix'];
  let showAllPl = false;
  const renderPlaylists = () => {
    const box = $('#playlists');
    box.innerHTML = '';
    (showAllPl ? playlists : playlists.slice(0, PL_LIMIT)).forEach(n => {
      const a = document.createElement('a');
      a.href = '#'; a.className = 'side-item plain'; a.title = n;
      a.innerHTML = '<i class="bi bi-music-note-list"></i><span class="lbl"></span>';
      $('.lbl', a).textContent = n;
      box.appendChild(a);
    });
    if (playlists.length > PL_LIMIT) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pl-more'; b.id = 'plMore';
      b.title = showAllPl ? 'Lebih sedikit' : 'Lihat semua';
      b.setAttribute('aria-expanded', String(showAllPl));
      b.innerHTML = `<i class="bi bi-${showAllPl ? 'chevron-up' : 'three-dots'}"></i><span class="lbl">${showAllPl ? 'Lebih sedikit' : 'Lihat semua (' + playlists.length + ')'}</span>`;
      box.appendChild(b);
    }
  };
  $('#playlists').addEventListener('click', e => {
    if (e.target.closest('#plMore')) { showAllPl = !showAllPl; renderPlaylists(); }
    else if (e.target.closest('a')) e.preventDefault();
  });
  renderPlaylists();
  $('#addPlaylist').addEventListener('click', () => {
    const name = prompt('Nama playlist baru:');
    if (name && name.trim()) {
      playlists.push(name.trim()); showAllPl = true; renderPlaylists();
      $('#playlists').lastElementChild.previousElementSibling.scrollIntoView({ block: 'nearest' });
      say('Playlist dibuat');
    }
  });
  $('#upgradeBtn').addEventListener('click', () => say('Fitur Premium segera hadir ✨'));
  $$('[data-bell]').forEach(b => b.addEventListener('click', () => { say('Belum ada notifikasi baru'); $$('.dot', b).forEach(d => d.remove()); }));

  // Sirkel
  let joined = false;
  $('#joinBtn').addEventListener('click', e => {
    joined = !joined;
    e.currentTarget.innerHTML = joined ? '<i class="bi bi-box-arrow-right"></i> Keluar Nongkrong' : '<i class="bi bi-play-fill"></i> Gabung Nongkrong';
    $('#listeners').textContent = joined ? 43 : 42;
    say(joined ? 'Kamu bergabung 🎉' : 'Kamu keluar dari nongkrong');
  });
  $('#shareBtn').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('#Kamar_Hapis'); say('Kode room disalin'); } catch { say('Kode: #Kamar_Hapis'); }
  });

  // Player
  let playing = true, pct = 60, timer, currentEl = null;
  function refreshCards() {
    $$('.pbadge i').forEach(i => { i.className = 'bi ' + (playing && i.closest('.is-playing') ? 'bi-pause-fill' : 'bi-play-fill'); });
    $$('.play-card').forEach(b => {
      const on = playing && b.closest('.mcard').classList.contains('is-playing');
      b.innerHTML = on ? '<i class="bi bi-pause-fill"></i> Pause' : '<i class="bi bi-play-fill"></i> Play';
    });
  }
  const playIcon = $('#playBtn i');
  const tick = () => { pct = pct >= 100 ? 0 : pct + 0.5; $('#progBar').style.width = pct + '%'; };
  const setPlaying = p => {
    playing = p; playIcon.className = 'bi ' + (p ? 'bi-pause-fill' : 'bi-play-fill');
    clearInterval(timer); if (p) timer = setInterval(tick, 1000);
    document.body.classList.toggle('is-paused', !p); refreshCards();
  };
  const playTitle = (t, el) => {
    if (el && el === currentEl) { setPlaying(!playing); return; }
    $('#nowTitle').textContent = t; pct = 0; setPlaying(true);
    if (el) { $$('.is-playing').forEach(x => x.classList.remove('is-playing')); el.classList.add('is-playing'); currentEl = el; }
    refreshCards(); say('Memutar: ' + t);
  };
  setPlaying(true);
  currentEl = $('#songList .track');
  if (currentEl) { currentEl.classList.add('is-playing'); refreshCards(); }
  $('#playBtn').addEventListener('click', () => setPlaying(!playing));
  $('#prevBtn').addEventListener('click', () => { pct = 0; $('#progBar').style.width = '0%'; });
  $('#nextBtn').addEventListener('click', () => { pct = 0; setPlaying(true); });
  ['shuffleBtn', 'repeatBtn', 'loveBtn'].forEach(id => $('#' + id).addEventListener('click', e => e.currentTarget.classList.toggle('on')));
  $('.progress-line').addEventListener('click', e => {
    const r = e.currentTarget.getBoundingClientRect(); pct = ((e.clientX - r.left) / r.width) * 100; $('#progBar').style.width = pct + '%';
  });
  document.addEventListener('click', e => {
    const t = e.target.closest('.track, .album'); if (t) playTitle(t.dataset.title, t);
    const pc = e.target.closest('.play-card'); if (pc) playTitle('MoodCard: Usia-Usia Dewasa Lomba Sihir', pc.closest('.mcard'));
  });
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.track, .album')) { e.preventDefault(); playTitle(e.target.dataset.title, e.target); }
  });

  // Volume: batang berwarna = level volume (desktop + panel mobile)
  let level = 7, last = 7;
  $$('.vol').forEach(v => v.innerHTML = Array.from({ length: 10 }, (_, i) => `<span data-i="${i}"></span>`).join(''));
  const setVol = n => {
    level = n;
    $$('.vol').forEach(v => $$('span', v).forEach((x, i) => x.classList.toggle('on', i < n)));
    $('#muteBtn i').className = 'bi ' + (n === 0 ? 'bi-volume-mute-fill' : n < 4 ? 'bi-volume-down-fill' : 'bi-volume-up-fill');
  };
  setVol(level);
  document.addEventListener('click', e => { const x = e.target.closest('.vol span'); if (x) setVol(+x.dataset.i + 1); });
  $('#muteBtn').addEventListener('click', () => { if (level > 0) { last = level; setVol(0); } else setVol(last || 7); });

  // Reaksi & chat
  $$('[data-react]').forEach(b => b.addEventListener('click', () => {
    const r = b.dataset.react; say(r === 'chat' ? 'Chat segera hadir 💬' : 'Reaksi ' + r + ' terkirim');
  }));

  // Panel pemutar (mobile/tablet)
  const sheetEl = $('#playerSheet'), sheet = bootstrap.Offcanvas.getOrCreateInstance(sheetEl);
  $('.p-left').addEventListener('click', () => { if (innerWidth < 992) sheet.show(); });
  $$('[data-proxy]').forEach(b => b.addEventListener('click', () => $(b.dataset.proxy).click()));
  const fmt = t => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');
  const sync = () => {
    if (!sheetEl.classList.contains('show')) return;
    const w = parseFloat($('#progBar').style.width) || 0;
    $('#progBarM').style.width = w + '%';
    $('#timeCur').textContent = fmt(w / 100 * 211);
    $('#sheetTitle').textContent = $('#nowTitle').textContent;
    $('#sPlay i').className = $('#playBtn i').className;
    $('#sMute i').className = $('#muteBtn i').className;
    [['shuffleBtn', 'sShuffle'], ['repeatBtn', 'sRepeat'], ['loveBtn', 'sLove']].forEach(([a, b]) => $('#' + b).classList.toggle('on', $('#' + a).classList.contains('on')));
  };
  setInterval(sync, 200);
  sheetEl.addEventListener('show.bs.offcanvas', sync);

  // Sidebar expand / collapse (desktop)
  const layout = $('.layout'), tgl = $('#sideToggle');
  const setCollapsed = c => {
    layout.classList.toggle('collapsed', c);
    tgl.firstElementChild.className = 'bi ' + (c ? 'bi-chevron-double-right' : 'bi-chevron-double-left');
    tgl.setAttribute('aria-expanded', String(!c));
    tgl.title = c ? 'Perluas sidebar' : 'Ciutkan sidebar';
    try { localStorage.setItem('mr-side', c ? '1' : '0'); } catch { }
  };
  let saved = false; try { saved = localStorage.getItem('mr-side') === '1'; } catch { }
  setCollapsed(saved);
  tgl.addEventListener('click', () => setCollapsed(!layout.classList.contains('collapsed')));
  $$('.side-item').forEach(a => a.title = a.textContent.trim());
})();