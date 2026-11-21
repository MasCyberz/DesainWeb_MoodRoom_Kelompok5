/* MoodRoom — script bersama (sidebar, player, toast). Dipakai semua halaman. */
(() => {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const store = {
        get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
        set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } }
    };

    // Toast
    const toast = bootstrap.Toast.getOrCreateInstance($('#toast'), { delay: 1800 });
    const say = m => { $('#toastMsg').textContent = m; toast.show(); };

    // Status vibe teman
    const friends = [['Andi', '“Revisi jam 1..”'], ['Rina', '“Lagi santai kawan”'], ['Budi', '“Alamak capeknyo”'], ['Siti', '“Hapis kok bgtu sih”']];
    const wave = '<span class="wave" aria-hidden="true">' + [10, 22, 30, 16, 26, 12, 20].map(h => `<i style="height:${h}px"></i>`).join('') + '</span>';
    $('#friendList').innerHTML = friends.map(f => `
    <div class="friend" role="button" tabindex="0"><span class="avatar s"></span><div><div class="n">${f[0]}</div><div class="s">${f[1]}</div></div>${wave}</div>`).join('');

    // Toggle suka / simpan
    document.addEventListener('click', e => {
        const b = e.target.closest('[data-toggle]'); if (!b) return;
        const on = b.classList.toggle('on');
        b.firstElementChild.className = 'bi ' + b.dataset.toggle + (on ? '-fill' : '');
    });

    // Dropdown filter di search (dikirim sebagai event ke halaman)
    const fm = $('#filterMenu');
    if (fm) fm.addEventListener('click', e => {
        const a = e.target.closest('a'); if (!a) return;
        e.preventDefault();
        $$('a', fm).forEach(x => x.classList.remove('active')); a.classList.add('active');
        document.dispatchEvent(new CustomEvent('mr:filter', { detail: a.dataset.f }));
    });

    // Sidebar: link "#" hanya placeholder
    $('.mr-sidebar').addEventListener('click', e => {
        const a = e.target.closest('a[href="#"]'); if (!a) return;
        e.preventDefault();
        if (!a.closest('#playlists')) say('Halaman segera hadir');
    });

    // Playlist: tampil 5, sisanya lewat "Lihat semua"
    const PL_LIMIT = 5;
    const playlists = store.get('mr-playlists', ['Rock n Roll', 'Dangdut', 'Pop Indo', 'Indie Senja', 'Jazz Malam', 'Lo-fi Belajar', 'Akustik Santai', 'Workout Mix']);
    const curPl = /playlist\.html$/.test(location.pathname) ? new URLSearchParams(location.search).get('nama') : null;
    let showAllPl = !!curPl && playlists.indexOf(curPl) >= PL_LIMIT;
    const renderPlaylists = () => {
        const box = $('#playlists'); box.innerHTML = '';
        (showAllPl ? playlists : playlists.slice(0, PL_LIMIT)).forEach(n => {
            const a = document.createElement('a');
            a.href = 'playlist.html?nama=' + encodeURIComponent(n); a.className = 'side-item plain' + (n === curPl ? ' active' : ''); a.title = n;
            a.innerHTML = '<i class="bi bi-music-note-list"></i><span class="lbl"></span>';
            $('.lbl', a).textContent = n; box.appendChild(a);
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
    $('#playlists').addEventListener('click', e => { if (e.target.closest('#plMore')) { showAllPl = !showAllPl; renderPlaylists(); } });
    renderPlaylists();
    $('#addPlaylist').addEventListener('click', () => {
        const name = prompt('Nama playlist baru:');
        if (name && name.trim()) {
            playlists.push(name.trim()); store.set('mr-playlists', playlists); if (!plSongs[name.trim()]) setSongs(name.trim(), []); showAllPl = true; renderPlaylists();
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

    // ===== Player (state disimpan agar lanjut di halaman lain) =====
    const saved = store.get('mr-player', { title: 'Evaluasi - Hindia', playing: true, pct: 60 });
    let playing = !!saved.playing, pct = +saved.pct || 0, timer, currentEl = null, playingTitle = saved.title;
    const save = () => store.set('mr-player', { title: playingTitle, playing, pct });
    const playIcon = $('#playBtn i');
    $('#nowTitle').textContent = playingTitle;
    $('#progBar').style.width = pct + '%';

    function refreshCards() {
        $$('.pbadge i').forEach(i => { i.className = 'bi ' + (playing && i.closest('.is-playing') ? 'bi-pause-fill' : 'bi-play-fill'); });
        $$('.play-card').forEach(b => {
            const on = playing && b.closest('.mcard').classList.contains('is-playing');
            b.innerHTML = on ? '<i class="bi bi-pause-fill"></i> Pause' : '<i class="bi bi-play-fill"></i> Play';
        });
    }
    const tick = () => { pct = pct >= 100 ? 0 : pct + 0.5; $('#progBar').style.width = pct + '%'; save(); };
    const setPlaying = p => {
        playing = p; playIcon.className = 'bi ' + (p ? 'bi-pause-fill' : 'bi-play-fill');
        clearInterval(timer); if (p) timer = setInterval(tick, 1000);
        document.body.classList.toggle('is-paused', !p); refreshCards(); save();
    };
    const playTitle = (t, el) => {
        if (el && el.classList.contains('is-playing')) { setPlaying(!playing); return; }
        $('#nowTitle').textContent = t; pct = 0; playingTitle = t; setPlaying(true);
        $$('.is-playing').forEach(x => x.classList.remove('is-playing'));
        if (el) { el.classList.add('is-playing'); currentEl = el; }
        refreshCards(); say('Memutar: ' + t);
    };
    // Tandai elemen yang sedang diputar setelah halaman selesai dirender
    const restoreMark = () => {
        if (!$('.is-playing')) {
            const el = $$('.song-row, .track').find(x => x.dataset.title === playingTitle);
            if (el) { el.classList.add('is-playing'); currentEl = el; }
        }
        refreshCards();
    };
    setPlaying(playing);

    $('#playBtn').addEventListener('click', () => setPlaying(!playing));
    $('#prevBtn').addEventListener('click', () => { pct = 0; $('#progBar').style.width = '0%'; save(); });
    $('#nextBtn').addEventListener('click', () => { pct = 0; setPlaying(true); });
    ['shuffleBtn', 'repeatBtn', 'loveBtn'].forEach(id => $('#' + id).addEventListener('click', e => e.currentTarget.classList.toggle('on')));
    $('.progress-line').addEventListener('click', e => {
        const r = e.currentTarget.getBoundingClientRect(); pct = ((e.clientX - r.left) / r.width) * 100; $('#progBar').style.width = pct + '%'; save();
    });
    document.addEventListener('click', e => {
        const t = e.target.closest('.track, .album'); if (t) playTitle(t.dataset.title, t);
        const sr = e.target.closest('.song-row');
        if (sr && !e.target.closest('.ibtn, .dropdown')) playTitle(sr.dataset.title, sr);
        const pc = e.target.closest('.play-card');
        if (pc) playTitle('MoodCard: Usia-Usia Dewasa Lomba Sihir', pc.closest('.mcard'));
    });
    document.addEventListener('keydown', e => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.track, .album, .song-row')) { e.preventDefault(); playTitle(e.target.dataset.title, e.target); }
    });

    // Volume: batang berwarna = level volume
    let level = +store.get('mr-vol', 7), last = level || 7;
    $$('.vol').forEach(v => v.innerHTML = Array.from({ length: 10 }, (_, i) => `<span data-i="${i}"></span>`).join(''));
    const setVol = n => {
        level = n; store.set('mr-vol', n);
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
    const sheetEl = $('#playerSheet');
    const sheet = sheetEl ? bootstrap.Offcanvas.getOrCreateInstance(sheetEl) : null;
    $('.p-left').addEventListener('click', () => { if (sheet && innerWidth < 992) sheet.show(); });
    $$('[data-proxy]').forEach(b => b.addEventListener('click', () => $(b.dataset.proxy).click()));
    const fmt = t => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');
    const sync = () => {
        if (!sheetEl || !sheetEl.classList.contains('show')) return;
        const w = parseFloat($('#progBar').style.width) || 0;
        $('#progBarM').style.width = w + '%';
        $('#timeCur').textContent = fmt(w / 100 * 211);
        $('#sheetTitle').textContent = $('#nowTitle').textContent;
        $('#sPlay i').className = $('#playBtn i').className;
        $('#sMute i').className = $('#muteBtn i').className;
        [['shuffleBtn', 'sShuffle'], ['repeatBtn', 'sRepeat'], ['loveBtn', 'sLove']].forEach(([a, b]) => $('#' + b).classList.toggle('on', $('#' + a).classList.contains('on')));
    };
    setInterval(sync, 200);
    if (sheetEl) sheetEl.addEventListener('show.bs.offcanvas', sync);

    // Sidebar expand / collapse (desktop)
    const layout = $('.layout'), tgl = $('#sideToggle');
    const setCollapsed = c => {
        layout.classList.toggle('collapsed', c);
        tgl.firstElementChild.className = 'bi ' + (c ? 'bi-chevron-double-right' : 'bi-chevron-double-left');
        tgl.setAttribute('aria-expanded', String(!c));
        tgl.title = c ? 'Perluas sidebar' : 'Ciutkan sidebar';
        store.set('mr-side', c);
    };
    setCollapsed(store.get('mr-side', false) === true);
    tgl.addEventListener('click', () => setCollapsed(!layout.classList.contains('collapsed')));
    $$('.side-item').forEach(a => a.title = a.textContent.trim());


    // ===== Data playlist (lagu per playlist + modal "Tambah ke playlist") =====
    const PL_DEFAULTS = {
        'Rock n Roll': [['Back In Black', 'AC/DC', 'Back in Black', '4:15'], ['Highway to Hell', 'AC/DC', 'Highway to Hell', '3:28'], ["Sweet Child O' Mine", "Guns N' Roses", 'Appetite for Destruction', '5:56'], ['Bohemian Rhapsody', 'Queen', 'A Night at the Opera', '5:55'], ['Smells Like Teen Spirit', 'Nirvana', 'Nevermind', '5:01'], ['Terlalu Manis', 'Slank', 'Minoritas', '4:20']],
        'Dangdut': [['Sayang', 'Via Vallen', 'Sayang', '4:02'], ['Sakitnya Tuh Di Sini', 'Cita Citata', 'Single', '3:51'], ['Kopi Dangdut', 'Fahmi Shahab', 'Kopi Dangdut', '4:30'], ['Goyang Dumang', 'Cita Citata', 'Single', '3:40'], ['Tabola Bale', 'Silet Open Up', 'Single', '3:05']],
        'Pop Indo': [['Hati-Hati di Jalan', 'Tulus', 'Manusia', '4:12'], ['Komang', 'Raim Laode', 'Single', '4:33'], ['Satu Bulan', 'Bernadya', 'Sialnya, Hidup Harus Tetap Berjalan', '3:19'], ['Usai', 'Tiara Andini', 'Usai', '3:37'], ['Rehat', 'Kunto Aji', 'Mantra Mantra', '5:28'], ['Bertaut', 'Nadin Amizah', 'Selamat Ulang Tahun', '5:15']],
        'Indie Senja': [['Evaluasi', 'Hindia', 'Menari Dengan Bayangan', '3:31'], ['Secukupnya', 'Hindia', 'Menari Dengan Bayangan', '3:25'], ['Cincin', 'Hindia', 'Menari Dengan Bayangan', '3:45'], ['Rumah ke Rumah', 'Hindia', 'Menari Dengan Bayangan', '4:37'], ['Pilu Membiru', 'Kunto Aji', 'Mantra Mantra', '4:11'], ['Runtuh', 'Feby Putri, Fiersa Besari', 'Runtuh', '3:43']],
        'Jazz Malam': [['Take Five', 'Dave Brubeck', 'Time Out', '5:24'], ['So What', 'Miles Davis', 'Kind of Blue', '9:22'], ['Blue in Green', 'Miles Davis', 'Kind of Blue', '5:37'], ['Cantaloupe Island', 'Herbie Hancock', 'Empyrean Isles', '5:32'], ["Moanin'", 'Art Blakey', "Moanin'", '9:20']],
        'Lo-fi Belajar': [['Rainy Window', 'Lo-fi Collective', 'Study Beats Vol. 1', '2:48'], ['Late Night Notes', 'Lo-fi Collective', 'Study Beats Vol. 1', '3:02'], ['Warm Coffee', 'Kopi Tenang', 'Pagi Pelan', '2:35'], ['Desk Lamp', 'Kopi Tenang', 'Pagi Pelan', '3:14'], ['Slow Scroll', 'Nada Sunyi', 'Fokus Dulu', '2:57']],
        'Akustik Santai': [['Hati-Hati di Jalan', 'Tulus', 'Manusia', '4:12'], ['Komang', 'Raim Laode', 'Single', '4:33'], ['Bertaut', 'Nadin Amizah', 'Selamat Ulang Tahun', '5:15'], ['Bergema Sampai Selamanya', 'Nadhif Basalamah', 'Bergema Sampai Selamanya', '3:26']],
        'Workout Mix': [['Blinding Lights', 'The Weeknd', 'After Hours', '3:20'], ['Espresso', 'Sabrina Carpenter', "Short n' Sweet", '2:55'], ['Peradaban', '.Feast', 'Membangun & Menghancurkan', '4:02'], ['Nina', '.Feast', 'Membangun & Menghancurkan', '4:37'], ['Highway to Hell', 'AC/DC', 'Highway to Hell', '3:28']]
    };
    const plSongs = store.get('mr-pl-songs', {});
    const getSongs = n => plSongs[n] || PL_DEFAULTS[n] || [];
    const setSongs = (n, list) => { plSongs[n] = list; store.set('mr-pl-songs', plSongs); };
    const savePlaylists = () => store.set('mr-playlists', playlists);
    const removePlaylist = n => {
        const i = playlists.indexOf(n); if (i > -1) playlists.splice(i, 1);
        savePlaylists(); plSongs[n] = []; store.set('mr-pl-songs', plSongs);
    };

    const pickEl = document.createElement('div');
    pickEl.className = 'modal fade'; pickEl.id = 'plPicker'; pickEl.tabIndex = -1;
    pickEl.innerHTML = `<div class="modal-dialog modal-dialog-centered modal-sm"><div class="modal-content mr-modal">
    <div class="modal-header border-0 pb-0"><h6 class="modal-title fw-bold">Tambah ke playlist</h6><button class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Tutup"></button></div>
    <div class="modal-body"><div class="small text-white-50 mb-3 text-truncate" id="plPickSong"></div><div class="d-grid gap-2" id="plPickList"></div></div></div></div>`;
    document.body.appendChild(pickEl);
    const pickModal = new bootstrap.Modal(pickEl);
    let pickSong = null;
    const addToPlaylist = song => {
        pickSong = song;
        $('#plPickSong').textContent = song[0] + ' — ' + song[1];
        const box = $('#plPickList'); box.innerHTML = '';
        if (!playlists.length) box.innerHTML = '<div class="text-white-50 small">Belum ada playlist. Buat dulu lewat tombol + di sidebar.</div>';
        playlists.forEach(n => {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'pick-btn'; b.dataset.n = n;
            b.innerHTML = '<i class="bi bi-music-note-list"></i><span class="text-truncate"></span>';
            $('span', b).textContent = n; box.appendChild(b);
        });
        pickModal.show();
    };
    $('#plPickList').addEventListener('click', e => {
        const b = e.target.closest('.pick-btn'); if (!b || !pickSong) return;
        const n = b.dataset.n, list = [...getSongs(n)];
        pickModal.hide();
        if (list.some(x => x[0] === pickSong[0] && x[1] === pickSong[1])) { say('Sudah ada di ' + n); return; }
        list.push(pickSong); setSongs(n, list); say('Berhasil ditambahkan ke ' + n);
    });

    // API untuk skrip halaman
    window.MR = {
        playlists, savePlaylists, getSongs, setSongs, addToPlaylist, removePlaylist, $, $$, say, store, playTitle, refreshCards, restoreMark, setPlaying,
        isPlayingTitle: t => t === playingTitle, isPlaying: () => playing
    };
})();