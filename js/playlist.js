/* Halaman Playlist (dinamis: playlist.html?nama=Rock%20n%20Roll) — Redesign Panel Tengah */
(() => {
    const { $, $$, say, isPlayingTitle, isPlaying, playTitle, setPlaying, playlists, getSongs, setSongs, removePlaylist } = MR;
    const name = new URLSearchParams(location.search).get('nama') || 'Rock n Roll';
    const ADDED = ['Hari ini', 'Hari ini', 'Kemarin', 'Kemarin', '3 hari lalu', 'Minggu lalu', 'Minggu lalu', 'Bulan lalu'];
    const hue = str => [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
    const grad = str => { const h = hue(str); return `linear-gradient(135deg,hsl(${h},55%,62%),hsl(${(h + 50) % 360},50%,32%))`; };
    const secs = d => { const [m, x] = d.split(':'); return +m * 60 + +x; };

    if (!name || !playlists.includes(name)) {
        $('#plView').classList.add('d-none'); $('#plMissing').classList.remove('d-none');
        document.title = 'Playlist tidak ditemukan — MoodRoom'; return;
    }
    document.title = name + ' — MoodRoom';
    $('#plTitle').textContent = name;
    $('#plCover').style.background = grad(name);

    // Metadata 24 lagu default kaya fitur MoodRoom
    const DEFAULT_ENRICHED_ROCK = [
        ['Evaluasi', 'Hindia', 'Menari Dengan Bayangan', '3:40', 'Galau', 'Nugas Malam', 'Indie'],
        ['Secukupnya', 'Hindia', 'Menari Dengan Bayangan', '3:25', 'Santai', 'Nugas Malam', 'Indie'],
        ['Rehat', 'Kunto Aji', 'Mantra Mantra', '5:28', 'Santai', 'Perjalanan', 'Indie'],
        ['Membatu', '.Feast', 'Membangun & Menghancurkan', '4:12', 'Semangat', 'Olahraga', 'Rock'],
        ['Runtuh', 'Feby Putri ft. Fiersa Besari', 'Runtuh', '3:43', 'Galau', 'Nugas Malam', 'Indie'],
        ['Back In Black', 'AC/DC', 'Back in Black', '4:15', 'Semangat', 'Olahraga', 'Rock'],
        ['Highway to Hell', 'AC/DC', 'Highway to Hell', '3:28', 'Semangat', 'Perjalanan', 'Rock'],
        ["Sweet Child O' Mine", "Guns N' Roses", 'Appetite for Destruction', '5:56', 'Semangat', 'Nongkrong', 'Rock'],
        ['Bohemian Rhapsody', 'Queen', 'A Night at the Opera', '5:55', 'Fokus', 'Nugas Malam', 'Rock'],
        ['Smells Like Teen Spirit', 'Nirvana', 'Nevermind', '5:01', 'Semangat', 'Olahraga', 'Rock'],
        ['Terlalu Manis', 'Slank', 'Minoritas', '4:20', 'Santai', 'Nongkrong', 'Rock'],
        ['Pilu Membiru', 'Kunto Aji', 'Mantra Mantra', '4:11', 'Galau', 'Tidur', 'Indie'],
        ['Bertaut', 'Nadin Amizah', 'Selamat Ulang Tahun', '5:15', 'Galau', 'Tidur', 'Pop'],
        ['Peradaban', '.Feast', 'Membangun & Menghancurkan', '4:02', 'Semangat', 'Olahraga', 'Rock'],
        ['Nina', '.Feast', 'Membangun & Menghancurkan', '4:37', 'Santai', 'Perjalanan', 'Rock'],
        ['Satu Bulan', 'Bernadya', 'Sialnya, Hidup Harus Tetap Berjalan', '3:19', 'Galau', 'Tidur', 'Pop'],
        ['Cincin', 'Hindia', 'Menari Dengan Bayangan', '3:45', 'Santai', 'Nongkrong', 'Indie'],
        ['Rumah ke Rumah', 'Hindia', 'Menari Dengan Bayangan', '4:37', 'Santai', 'Perjalanan', 'Indie'],
        ['Hati-Hati di Jalan', 'Tulus', 'Manusia', '4:12', 'Galau', 'Perjalanan', 'Pop'],
        ['Komang', 'Raim Laode', 'Single', '4:33', 'Santai', 'Nongkrong', 'Pop'],
        ['Usai', 'Tiara Andini', 'Usai', '3:37', 'Galau', 'Tidur', 'Pop'],
        ['Bergema Sampai Selamanya', 'Nadhif Basalamah', 'Bergema Sampai Selamanya', '3:26', 'Santai', 'Nugas Malam', 'Pop'],
        ['Late Night Notes', 'Lo-fi Collective', 'Study Beats Vol. 1', '3:02', 'Fokus', 'Nugas Malam', 'Lo-fi'],
        ['Warm Coffee', 'Kopi Tenang', 'Pagi Pelan', '2:35', 'Santai', 'Nugas Malam', 'Lo-fi']
    ];

    const MOOD_POOL = ['Santai', 'Galau', 'Fokus', 'Semangat', 'Sedih'];
    const ACT_POOL = ['Nugas Malam', 'Olahraga', 'Perjalanan', 'Nongkrong', 'Tidur'];
    const GENRE_POOL = ['Rock', 'Pop', 'Lo-fi', 'Indie', 'Dangdut'];

    // Ambil lagu atau fallback ke data enriched
    function getNormalizedSongs() {
        let raw = getSongs(name);
        if ((!raw || raw.length <= 6) && name === 'Rock n Roll') {
            raw = DEFAULT_ENRICHED_ROCK;
        }
        return raw.map((s, idx) => ({
            title: s[0],
            artist: s[1],
            album: s[2],
            dur: s[3],
            mood: s[4] || MOOD_POOL[idx % MOOD_POOL.length],
            act: s[5] || ACT_POOL[idx % ACT_POOL.length],
            genre: s[6] || GENRE_POOL[idx % GENRE_POOL.length],
            rawIndex: idx
        }));
    }

    // State filter & view
    const state = {
        q: '',
        sort: 'new',
        limit: 5,
        filters: {
            mood: ['Santai'],
            activity: ['Nugas Malam'],
            genre: ['Rock']
        }
    };

    const rowsEl = $('#plRows');
    const activeChipsEl = $('#plmActiveChips');
    const loadMoreBtn = $('#plmLoadMoreBtn');

    // Sinkronisasi Bar "Filter aktif" dengan tombol chip
    function updateActiveChipsBar() {
        const chips = [];
        if (state.filters.mood.length) {
            state.filters.mood.forEach(m => chips.push({ type: 'mood', label: `Mood: ${m}`, val: m }));
        }
        if (state.filters.activity.length) {
            state.filters.activity.forEach(a => chips.push({ type: 'activity', label: `Aktivitas: ${a}`, val: a }));
        }
        if (state.filters.genre.length) {
            state.filters.genre.forEach(g => chips.push({ type: 'genre', label: `Genre: ${g}`, val: g }));
        }

        if (!chips.length) {
            activeChipsEl.innerHTML = '<span class="text-white-50 small">Semua filter dinonaktifkan (menampilkan seluruh lagu)</span>';
            return;
        }

        activeChipsEl.innerHTML = chips.map((c, i) => `
            <span class="plm-filter-tag" data-type="${c.type}" data-val="${c.val}">
                ${c.label} <i class="bi bi-x ms-1" data-remove-tag="${c.type}:${c.val}"></i>
            </span>
            ${i < chips.length - 1 ? '<span class="plm-tag-plus">+</span>' : ''}
        `).join('');

        // Sinkronisasi class active pada tombol chip
        $$('.plm-chip-group').forEach(grp => {
            const type = grp.dataset.group;
            const activeList = state.filters[type] || [];
            $$('.plm-chip', grp).forEach(chip => {
                const val = chip.dataset.v;
                if (val === 'all') {
                    chip.classList.toggle('active', activeList.length === 0);
                } else {
                    chip.classList.toggle('active', activeList.includes(val));
                }
            });
        });
    }

    function render() {
        const all = getNormalizedSongs();
        const q = state.q.trim().toLowerCase();
        const gq = $('#searchInput').value.trim().toLowerCase();

        // Filter pencarian
        let filtered = all.filter(s => [q, gq].every(k => !k || (s.title + ' ' + s.artist + ' ' + s.album).toLowerCase().includes(k)));

        // Filter multi-tag (union/or logic agar sesuai dengan mockup yang menampilkan 5 lagu multi-tag)
        const hasMood = state.filters.mood.length > 0;
        const hasAct = state.filters.activity.length > 0;
        const hasGenre = state.filters.genre.length > 0;

        if (hasMood || hasAct || hasGenre) {
            filtered = filtered.filter(s => {
                const matchM = !hasMood || state.filters.mood.includes(s.mood);
                const matchA = !hasAct || state.filters.activity.includes(s.act);
                const matchG = !hasGenre || state.filters.genre.includes(s.genre);
                return (hasMood && matchM) || (hasAct && matchA) || (hasGenre && matchG);
            });
        }

        // Sorting
        if (state.sort === 'az') filtered.sort((a, b) => a.title.localeCompare(b.title));
        if (state.sort === 'artist') filtered.sort((a, b) => a.artist.localeCompare(b.artist));
        if (state.sort === 'dur') filtered.sort((a, b) => secs(b.dur) - secs(a.dur));

        // Update Counter
        const totalDurationSecs = all.reduce((t, s) => t + secs(s.dur), 0);
        const hours = Math.floor(totalDurationSecs / 3600);
        const mins = Math.floor((totalDurationSecs % 3600) / 60);
        const durationFmt = hours > 0 ? `${hours} jam ${mins} mnt` : `${mins} menit`;

        $('#plCount').textContent = all.length;
        $('#plCountTab').textContent = all.length;
        $('#plMin').textContent = durationFmt;

        $('#plHead').classList.toggle('d-none', !filtered.length);
        $('#plEmpty').classList.toggle('d-none', all.length > 0);
        $('#plNoMatch').classList.toggle('d-none', !(all.length && !filtered.length));

        // Slice berdasarkan limit Tampilkan Lebih Banyak
        const visibleList = filtered.slice(0, state.limit);

        rowsEl.innerHTML = visibleList.map((s, idx) => {
            const isPlaying = isPlayingTitle(s.title + ' - ' + s.artist);
            return `
            <div class="song-row liked plm-song-row${isPlaying ? ' is-playing' : ''}" data-title="${s.title} - ${s.artist}" tabindex="0" role="button" aria-label="Putar ${s.title}">
                <div class="c-num">
                    <span class="rownum">${idx + 1}</span>
                    <span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
                </div>
                <div class="c-title d-flex align-items-center gap-3 min-w-0">
                    <span class="cov" style="background:${grad(s.album)}"></span>
                    <div class="min-w-0">
                        <div class="tt text-truncate">${s.title}</div>
                        <div class="sub text-truncate">${s.artist}</div>
                    </div>
                </div>
                <div class="c-mood">
                    <span class="plm-table-badge">${s.mood}</span>
                </div>
                <div class="c-act-tag">
                    <span class="plm-table-badge">${s.act}</span>
                </div>
                <div class="c-heart">
                    <button class="ibtn like-on" data-toggle="bi-heart" aria-label="Suka">
                        <i class="bi bi-heart-fill"></i>
                    </button>
                </div>
                <div class="c-dur sub">${s.dur}</div>
                <div class="c-act d-flex justify-content-end">
                    <div class="dropdown">
                        <button class="ibtn" data-bs-toggle="dropdown" data-bs-strategy="fixed" aria-label="Menu lagu">
                            <i class="bi bi-three-dots"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end">
                            <li><button class="dropdown-item row-act" data-remove="${s.rawIndex}">Hapus dari playlist</button></li>
                            <li><button class="dropdown-item row-act">Bagikan</button></li>
                        </ul>
                    </div>
                </div>
            </div>`;
        }).join('');

        // Tampilkan/sembunyikan tombol Tampilkan Lebih Banyak
        if (filtered.length <= 5) {
            $('#plmLoadMoreWrap').classList.add('d-none');
        } else {
            $('#plmLoadMoreWrap').classList.remove('d-none');
            loadMoreBtn.textContent = state.limit >= filtered.length ? 'Tampilkan lebih sedikit' : 'Tampilkan lebih banyak';
        }

        updateActiveChipsBar();
        MR.refreshCards();
    }

    // Toggle chip filter
    document.addEventListener('click', e => {
        // Klik chip dalam group
        const chip = e.target.closest('.plm-chip');
        if (chip) {
            const grp = chip.closest('.plm-chip-group');
            const type = grp.dataset.group;
            const val = chip.dataset.v;

            if (val === 'all') {
                state.filters[type] = [];
            } else {
                const idx = state.filters[type].indexOf(val);
                if (idx > -1) {
                    state.filters[type].splice(idx, 1);
                } else {
                    state.filters[type].push(val);
                }
            }
            render();
            return;
        }

        // Hapus chip dari bar filter aktif (icon x)
        const rmTag = e.target.closest('[data-remove-tag]');
        if (rmTag) {
            const [type, val] = rmTag.dataset.removeTag.split(':');
            const idx = state.filters[type].indexOf(val);
            if (idx > -1) {
                state.filters[type].splice(idx, 1);
                render();
            }
            return;
        }

        // Reset filter
        if (e.target.closest('#plmResetFilters')) {
            state.filters.mood = [];
            state.filters.activity = [];
            state.filters.genre = [];
            render();
            say('Filter direset');
            return;
        }

        // Offline toggle
        if (e.target.closest('#plmOfflineBtn')) {
            const sw = $('#plmOfflineSwitch');
            const isOn = sw.classList.toggle('is-on');
            $('#plmOfflineBtn').setAttribute('aria-pressed', String(isOn));
            say(isOn ? 'Mode offline aktif (24 lagu tersimpan)' : 'Mode offline dinonaktifkan');
            return;
        }

        // Share MoodCard
        if (e.target.closest('#plmShareCardBtn')) {
            navigator.clipboard.writeText(window.location.href).catch(() => {});
            say('MoodCard playlist disalin ke clipboard! 📋');
            return;
        }

        // Dengar Bareng Teman
        if (e.target.closest('#plmListenRoomBtn')) {
            say('Sesi Dengar Bareng Teman dimulai di Sirkel 🎧');
            return;
        }

        // Putar Mini Mood Pack Play button
        const packPlayBtn = e.target.closest('.plm-pack-play-btn');
        if (packPlayBtn) {
            const title = packPlayBtn.dataset.packTitle || 'Mini Mood Pack';
            const firstTrack = packPlayBtn.closest('.plm-pack-card').querySelector('.plm-pack-track');
            if (firstTrack) {
                playTitle(firstTrack.dataset.title);
                say('Memutar ' + title);
            }
            return;
        }

        // Putar track di dalam pack
        const packTrack = e.target.closest('.plm-pack-track');
        if (packTrack) {
            playTitle(packTrack.dataset.title);
            return;
        }

        // Putar MoodCard di seksi bawah
        const mcardPlay = e.target.closest('.plm-mcard-play');
        if (mcardPlay) {
            const mcard = mcardPlay.closest('.plm-mcard');
            playTitle(mcard.dataset.title);
            return;
        }

        // Slot kosong simpan MoodCard
        if (e.target.closest('#plmAddMoodCardSlot')) {
            say('Pilih MoodCard dari koleksi untuk disimpan ke playlist ini ✨');
            return;
        }

        // Tab Switching (Lagu vs MoodCard)
        const tabBtn = e.target.closest('.plm-tab-pill');
        if (tabBtn) {
            $$('.plm-tab-pill').forEach(t => t.classList.remove('active'));
            tabBtn.classList.add('active');
            if (tabBtn.id === 'tabMoodCards') {
                $('#plmSavedMoodCardSection').scrollIntoView({ behavior: 'smooth' });
                say('Menampilkan MoodCard tersimpan');
            } else {
                $('#songsViewArea').scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }

        // Tampilkan lebih banyak
        if (e.target.closest('#plmLoadMoreBtn')) {
            const allCount = getNormalizedSongs().length;
            state.limit = state.limit >= allCount ? 5 : allCount;
            render();
            return;
        }

        // Aksi dropdown baris lagu
        const rm = e.target.closest('[data-remove]');
        if (rm) {
            const list = [...getSongs(name)];
            const [gone] = list.splice(+rm.dataset.remove, 1);
            setSongs(name, list);
            render();
            say('Dihapus dari ' + name + (gone ? ': ' + gone[0] : ''));
        } else if (e.target.closest('.row-act')) {
            say('Bagikan — tautan disalin');
        }

        // Dropdown sort
        const it = e.target.closest('[data-dd] .dropdown-item');
        if (it) {
            e.preventDefault();
            const dd = it.closest('[data-dd]');
            $$('.dropdown-item', dd).forEach(x => x.classList.toggle('active', x === it));
            $('.dd-label', dd).textContent = it.dataset.l;
            state[dd.dataset.dd] = it.dataset.v;
            render();
        }
    });

    $('#plSearch').addEventListener('input', e => { state.q = e.target.value; render(); });
    $('#searchInput').addEventListener('input', render);

    $('#playAll').addEventListener('click', () => {
        const r = rowsEl.querySelector('.song-row');
        if (!r) return;
        if (r.classList.contains('is-playing')) {
            if (!isPlaying()) setPlaying(true);
        } else {
            playTitle(r.dataset.title, r);
        }
        say('Memutar ' + name);
    });

    $('#shuffleAll').addEventListener('click', () => {
        const rows = $$('.song-row', rowsEl);
        if (!rows.length) return;
        const r = rows[Math.floor(Math.random() * rows.length)];
        playTitle(r.dataset.title, r);
    });

    render();
})();
