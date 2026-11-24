/* Halaman Playlist (dinamis: playlist.html?nama=Rock%20n%20Roll) — Berpatokan pada Kode Ketua & Fitur Tambahan */
(() => {
    const { $, $$, say, isPlayingTitle, isPlaying, playTitle, setPlaying, playlists, getSongs, setSongs, removePlaylist } = MR;
    const hue = str => [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
    const grad = str => { const h = hue(str); return `linear-gradient(135deg,hsl(${h},55%,62%),hsl(${(h + 50) % 360},50%,32%))`; };
    const secs = d => { const [m, x] = d.split(':'); return +m * 60 + +x; };

    let name = new URLSearchParams(location.search).get('nama');
    const defaultPlaylists = ['Rock n Roll', 'Dangdut', 'Pop Indo', 'Indie Senja', 'Jazz Malam', 'Lo-fi Belajar', 'Akustik Santai', 'Workout Mix'];

    // Jika dibuka langsung tanpa query param (?nama=), default ke playlist pertama (Rock n Roll)
    if (!name) {
        name = (playlists && playlists.length) ? playlists[0] : 'Rock n Roll';
    }

    // Pastikan jika playlist bawaan belum ada di state playlists, tetap dikenali
    if (playlists && !playlists.includes(name) && defaultPlaylists.includes(name)) {
        playlists.push(name);
    }

    if (!name || (playlists && !playlists.includes(name))) {
        $('#plView').classList.add('d-none');
        $('#plMissing').classList.remove('d-none');
        document.title = 'Playlist tidak ditemukan — MoodRoom';
        return;
    }

    $('#plView').classList.remove('d-none');
    $('#plMissing').classList.add('d-none');
    document.title = name + ' — MoodRoom';
    $('#plTitle').textContent = name;
    $('#plDesc').textContent = 'Koleksi lagu ' + name + ' pilihanmu.';
    $('#plCover').style.background = grad(name);

    // Pemetaan tag bawaan untuk lagu-lagu yang ada di katalog MoodRoom
    const KNOWN_TAGS = {
        'Evaluasi': { mood: 'Galau', act: 'Nugas Malam', genre: 'Indie' },
        'Secukupnya': { mood: 'Santai', act: 'Nugas Malam', genre: 'Indie' },
        'Rehat': { mood: 'Santai', act: 'Perjalanan', genre: 'Indie' },
        'Membatu': { mood: 'Semangat', act: 'Olahraga', genre: 'Rock' },
        'Runtuh': { mood: 'Galau', act: 'Nugas Malam', genre: 'Indie' },
        'Back In Black': { mood: 'Semangat', act: 'Olahraga', genre: 'Rock' },
        'Highway to Hell': { mood: 'Semangat', act: 'Perjalanan', genre: 'Rock' },
        "Sweet Child O' Mine": { mood: 'Semangat', act: 'Nongkrong', genre: 'Rock' },
        'Bohemian Rhapsody': { mood: 'Fokus', act: 'Nugas Malam', genre: 'Rock' },
        'Smells Like Teen Spirit': { mood: 'Semangat', act: 'Olahraga', genre: 'Rock' },
        'Terlalu Manis': { mood: 'Santai', act: 'Nongkrong', genre: 'Rock' },
        'Sayang': { mood: 'Semangat', act: 'Nongkrong', genre: 'Dangdut' },
        'Sakitnya Tuh Di Sini': { mood: 'Galau', act: 'Nongkrong', genre: 'Dangdut' },
        'Kopi Dangdut': { mood: 'Semangat', act: 'Nongkrong', genre: 'Dangdut' },
        'Goyang Dumang': { mood: 'Semangat', act: 'Olahraga', genre: 'Dangdut' },
        'Tabola Bale': { mood: 'Semangat', act: 'Perjalanan', genre: 'Dangdut' },
        'Hati-Hati di Jalan': { mood: 'Galau', act: 'Perjalanan', genre: 'Pop' },
        'Komang': { mood: 'Santai', act: 'Nongkrong', genre: 'Pop' },
        'Satu Bulan': { mood: 'Galau', act: 'Tidur', genre: 'Pop' },
        'Usai': { mood: 'Galau', act: 'Tidur', genre: 'Pop' },
        'Bertaut': { mood: 'Galau', act: 'Tidur', genre: 'Pop' },
        'Pilu Membiru': { mood: 'Galau', act: 'Tidur', genre: 'Indie' },
        'Cincin': { mood: 'Santai', act: 'Nongkrong', genre: 'Indie' },
        'Rumah ke Rumah': { mood: 'Santai', act: 'Perjalanan', genre: 'Indie' },
        'Take Five': { mood: 'Fokus', act: 'Nugas Malam', genre: 'Jazz' },
        'So What': { mood: 'Fokus', act: 'Nugas Malam', genre: 'Jazz' },
        'Blue in Green': { mood: 'Santai', act: 'Tidur', genre: 'Jazz' },
        'Rainy Window': { mood: 'Fokus', act: 'Nugas Malam', genre: 'Lo-fi' },
        'Late Night Notes': { mood: 'Fokus', act: 'Nugas Malam', genre: 'Lo-fi' },
        'Warm Coffee': { mood: 'Santai', act: 'Nugas Malam', genre: 'Lo-fi' },
        'Desk Lamp': { mood: 'Fokus', act: 'Nugas Malam', genre: 'Lo-fi' },
        'Slow Scroll': { mood: 'Fokus', act: 'Nugas Malam', genre: 'Lo-fi' },
        'Bergema Sampai Selamanya': { mood: 'Santai', act: 'Nugas Malam', genre: 'Pop' },
        'Blinding Lights': { mood: 'Semangat', act: 'Olahraga', genre: 'Pop' },
        'Espresso': { mood: 'Semangat', act: 'Nongkrong', genre: 'Pop' },
        'Peradaban': { mood: 'Semangat', act: 'Olahraga', genre: 'Rock' },
        'Nina': { mood: 'Santai', act: 'Perjalanan', genre: 'Rock' }
    };

    const MOOD_POOL = ['Santai', 'Galau', 'Fokus', 'Semangat', 'Sedih'];
    const ACT_POOL = ['Nugas Malam', 'Olahraga', 'Perjalanan', 'Nongkrong', 'Tidur'];
    const GENRE_POOL = ['Rock', 'Pop', 'Lo-fi', 'Indie', 'Dangdut'];

    // Menghubungkan setiap lagu bawaan ketua dengan tag Mood & Aktivitas
    function getSongWithTags(s, i) {
        const title = s[0];
        const known = KNOWN_TAGS[title];
        const charSum = [...title].reduce((a, c) => a + c.charCodeAt(0), i);
        return {
            title: s[0],
            artist: s[1],
            album: s[2],
            dur: s[3],
            mood: s[4] || (known ? known.mood : MOOD_POOL[charSum % MOOD_POOL.length]),
            act: s[5] || (known ? known.act : ACT_POOL[(charSum + 2) % ACT_POOL.length]),
            genre: s[6] || (known ? known.genre : GENRE_POOL[(charSum + 4) % GENRE_POOL.length]),
            rawIndex: i
        };
    }

    // State filter, search & sort
    const state = {
        q: '',
        sort: 'new',
        limit: 6,
        filters: {
            mood: [],
            activity: [],
            genre: []
        }
    };

    const rowsEl = $('#plRows');
    const activeChipsEl = $('#plmActiveChips');
    const miniSummaryEl = $('#plmMiniSummary');
    const filterBadgeEl = $('#plmFilterBadge');
    const loadMoreBtn = $('#plmLoadMoreBtn');

    // Sinkronisasi Bar Filter Aktif & Toolbar Mini Summary
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

        // Update badge jumlah filter aktif pada tombol minimize
        const count = chips.length;
        if (filterBadgeEl) {
            filterBadgeEl.textContent = count;
            filterBadgeEl.classList.toggle('has-filter', count > 0);
            filterBadgeEl.classList.toggle('is-zero', count === 0);
        }

        // Summary mini chip saat panel diminimize
        if (miniSummaryEl) {
            if (!chips.length) {
                miniSummaryEl.innerHTML = '';
            } else {
                miniSummaryEl.innerHTML = chips.map(c => `
                    <span class="plm-mini-chip" title="Hapus filter ${c.label}">
                        ${c.label} <i class="bi bi-x ms-1" data-remove-tag="${c.type}:${c.val}"></i>
                    </span>
                `).join('');
            }
        }

        // Panel filter aktif lengkap (di dalam collapsible)
        if (activeChipsEl) {
            if (!chips.length) {
                activeChipsEl.innerHTML = '<span class="text-white-50 small">Belum ada filter yang dipilih (menampilkan semua lagu)</span>';
            } else {
                activeChipsEl.innerHTML = chips.map((c, i) => `
                    <span class="plm-filter-tag" data-type="${c.type}" data-val="${c.val}">
                        ${c.label} <i class="bi bi-x ms-1" data-remove-tag="${c.type}:${c.val}"></i>
                    </span>
                    ${i < chips.length - 1 ? '<span class="plm-tag-plus">+</span>' : ''}
                `).join('');
            }
        }

        // Sinkronkan class active pada setiap tombol chip di dalam panel
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

    // Generate Mini Mood Pack secara dinamis dari daftar lagu ketua
    function renderMiniMoodPacks(allSongs) {
        const packGrid = $('#plmPackGrid');
        if (!packGrid) return;

        if (!allSongs || !allSongs.length) {
            packGrid.innerHTML = `
                <div class="p-4 text-center text-white-50 w-100" style="grid-column: 1 / -1">
                    <i class="bi bi-collection-play fs-2 mb-2 d-block text-pink"></i>
                    Tambahkan lagu ke playlist ini untuk menyusun Mini Mood Pack otomatis.
                </div>`;
            return;
        }

        // 3 Tema Paket Mood yang disesuaikan dengan lagu-lagu di playlist
        const TARGET_PACKS = [
            { key: 'Galau', fallback: 'Santai', title: 'Paket Galau', gradClass: 'plm-grad-galau' },
            { key: 'Fokus', fallback: 'Santai', title: 'Fokus Nugas', gradClass: 'plm-grad-fokus' },
            { key: 'Semangat', fallback: 'Galau', title: 'Semangat Pagi', gradClass: 'plm-grad-semangat' }
        ];

        packGrid.innerHTML = TARGET_PACKS.map(cfg => {
            // Filter lagu yang sesuai dengan mood pack ini dari lagu di playlist
            let matching = allSongs.filter(s => s.mood === cfg.key);
            if (!matching.length && cfg.fallback) {
                matching = allSongs.filter(s => s.mood === cfg.fallback);
            }
            if (!matching.length) {
                matching = allSongs.slice(0, 2);
            }

            const packSongs = matching.slice(0, 3);
            const totalSecs = packSongs.reduce((t, s) => t + secs(s.dur), 0);
            const totalMins = Math.round(totalSecs / 60) || 1;
            const moodName = packSongs[0] ? packSongs[0].mood.toUpperCase() : cfg.key.toUpperCase();
            const badgeMood = packSongs[0] ? packSongs[0].mood : cfg.key;
            const packTitle = `${cfg.title} ${packSongs.length} Lagu`;

            return `
            <div class="plm-pack-card" data-pack="${cfg.key.toLowerCase()}">
                <div class="plm-pack-header ${cfg.gradClass}">
                    <div class="plm-pack-eyebrow">${totalMins} menit</div>
                    <div class="plm-pack-mood-title">${moodName}</div>
                    <button type="button" class="plm-pack-play-btn" data-pack-title="${packTitle}" aria-label="Putar ${packTitle}" title="Putar Paket">
                        <i class="bi bi-play-fill"></i>
                    </button>
                </div>
                <div class="plm-pack-body">
                    <h3 class="plm-pack-name">${packTitle}</h3>
                    <div class="plm-pack-meta mb-2">
                        <span class="plm-badge-pill">${badgeMood}</span>
                        <span class="text-white-50 small">${packSongs.length} lagu · ${totalMins} mnt</span>
                    </div>
                    <div class="plm-pack-tracklist">
                        ${packSongs.map((s, idx) => `
                            <div class="plm-pack-track" data-title="${s.title} - ${s.artist}">
                                <span class="num">${idx + 1}</span>
                                <span class="tt text-truncate">${s.title}</span>
                                <span class="dur">${s.dur}</span>
                            </div>
                        `).join('')}
                        ${packSongs.length < 3 ? `
                            <div class="plm-pack-slot-empty">
                                Slot kosong (maks. 3 lagu)
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    // Fungsi Render Utama — menggunakan data getSongs(name) dari ketua
    function render() {
        const rawSongs = getSongs(name);
        const all = rawSongs.map((s, i) => getSongWithTags(s, i));
        const q = state.q.trim().toLowerCase();
        const gq = $('#searchInput').value.trim().toLowerCase();

        // 1. Filter Pencarian (ketua)
        let filtered = all.filter(s => [q, gq].every(k => !k || (s.title + ' ' + s.artist + ' ' + s.album).toLowerCase().includes(k)));

        // 2. Filter Multi-Tag
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

        // 3. Sorting (ketua)
        if (state.sort === 'az') filtered.sort((a, b) => a.title.localeCompare(b.title));
        if (state.sort === 'artist') filtered.sort((a, b) => a.artist.localeCompare(b.artist));
        if (state.sort === 'dur') filtered.sort((a, b) => secs(b.dur) - secs(a.dur));

        // 4. Update Angka Header & Tab (ketua)
        const totalDurationSecs = all.reduce((t, s) => t + secs(s.dur), 0);
        const hours = Math.floor(totalDurationSecs / 3600);
        const mins = Math.round((totalDurationSecs % 3600) / 60);
        const durationFmt = hours > 0 ? `${hours} jam ${mins} mnt` : `${mins} menit`;

        $('#plCount').textContent = all.length;
        if ($('#plCountTab')) $('#plCountTab').textContent = all.length;
        $('#plMin').textContent = durationFmt;

        $('#plHead').classList.toggle('d-none', !all.length);
        $('#plEmpty').classList.toggle('d-none', all.length > 0);
        $('#plNoMatch').classList.toggle('d-none', !(all.length && !filtered.length));
        $$('#plActions .btn-pink, #shuffleAll').forEach(b => b.disabled = !all.length);

        // 5. Paginasi Load More (hanya jika lagu > 6)
        const isLimited = all.length > 6 && state.limit < filtered.length;
        const visibleList = isLimited ? filtered.slice(0, state.limit) : filtered;

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
                    <button class="ibtn" data-toggle="bi-heart" aria-label="Suka">
                        <i class="bi bi-heart"></i>
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

        // Kontrol tombol Tampilkan Lebih Banyak
        const loadMoreWrap = $('#plmLoadMoreWrap');
        if (loadMoreWrap) {
            if (filtered.length <= 6) {
                loadMoreWrap.classList.add('d-none');
            } else {
                loadMoreWrap.classList.remove('d-none');
                loadMoreBtn.textContent = state.limit >= filtered.length ? 'Tampilkan lebih sedikit' : 'Tampilkan lebih banyak';
            }
        }

        renderMiniMoodPacks(all);
        updateActiveChipsBar();
        MR.refreshCards();
    }

    // Event Handler untuk Aksi dan Interaktivitas
    document.addEventListener('click', e => {
        // Klik tombol chip di panel filter
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

        // Hapus tag filter dari icon x
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

        // Reset Filter
        if (e.target.closest('#plmResetFilters')) {
            state.filters.mood = [];
            state.filters.activity = [];
            state.filters.genre = [];
            render();
            say('Filter direset');
            return;
        }

        // Toggle Offline Switch
        if (e.target.closest('#plmOfflineBtn')) {
            const sw = $('#plmOfflineSwitch');
            const isOn = sw.classList.toggle('is-on');
            $('#plmOfflineBtn').setAttribute('aria-pressed', String(isOn));
            say(isOn ? 'Mode offline aktif untuk ' + name : 'Mode offline dinonaktifkan');
            return;
        }

        // Share MoodCard
        if (e.target.closest('#plmShareCardBtn')) {
            navigator.clipboard.writeText(window.location.href).catch(() => {});
            say('Tautan MoodCard disalin ke clipboard! 📋');
            return;
        }

        // Dengar Bareng Teman
        if (e.target.closest('#plmListenRoomBtn')) {
            say('Sesi Dengar Bareng Teman dimulai di Sirkel 🎧');
            return;
        }

        // Putar Mini Mood Pack
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

        // Putar track di dalam Mini Mood Pack
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

        // Slot kosong MoodCard
        if (e.target.closest('#plmAddMoodCardSlot')) {
            say('Pilih MoodCard dari koleksi untuk disimpan ke playlist ini ✨');
            return;
        }

        // Tab View Switching (Lagu vs MoodCard)
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

        // Tombol Tampilkan Lebih Banyak
        if (e.target.closest('#plmLoadMoreBtn')) {
            const allCount = getSongs(name).length;
            state.limit = state.limit >= allCount ? 6 : allCount;
            render();
            return;
        }

        // Hapus lagu dari playlist (patokan ketua)
        const rm = e.target.closest('[data-remove]');
        if (rm) {
            const list = [...getSongs(name)];
            const [gone] = list.splice(+rm.dataset.remove, 1);
            setSongs(name, list);
            render();
            say('Dihapus dari ' + name + (gone ? ': ' + gone[0] : ''));
            return;
        }

        // Dropdown Sort (patokan ketua)
        const it = e.target.closest('[data-dd] .dropdown-item');
        if (it) {
            e.preventDefault();
            const dd = it.closest('[data-dd]');
            $$('.dropdown-item', dd).forEach(x => x.classList.toggle('active', x === it));
            const lbl = $('.dd-label', dd);
            if (lbl) lbl.textContent = it.dataset.l;
            const sortBtn = $('#plmSortBtn');
            if (sortBtn) sortBtn.title = 'Urutan: ' + it.dataset.l;
            state[dd.dataset.dd] = it.dataset.v;
            render();
            say('Urutan: ' + it.dataset.l);
            return;
        }
    });

    // Toggle expand kolom cari saat logo search diklik
    const searchBtn = $('#plmSearchBtn');
    const searchCompact = $('#plmSearchCompact');
    const plSearchInput = $('#plSearch');
    if (searchBtn && searchCompact && plSearchInput) {
        searchBtn.addEventListener('click', () => {
            searchCompact.classList.toggle('is-open');
            if (searchCompact.classList.contains('is-open')) {
                plSearchInput.focus();
            }
        });
        plSearchInput.addEventListener('blur', () => {
            if (!plSearchInput.value.trim()) {
                searchCompact.classList.remove('is-open');
            }
        });
    }

    // Sinkronisasi Pencarian Lokal & Global (patokan ketua)
    $('#plSearch').addEventListener('input', e => { state.q = e.target.value; render(); });
    $('#searchInput').addEventListener('input', render);

    // Putar Semua (patokan ketua)
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

    // Acak Semua (patokan ketua)
    $('#shuffleAll').addEventListener('click', () => {
        const rows = $$('.song-row', rowsEl);
        if (!rows.length) return;
        const r = rows[Math.floor(Math.random() * rows.length)];
        playTitle(r.dataset.title, r);
    });

    // Hapus Playlist (patokan ketua)
    $('#deletePl').addEventListener('click', () => {
        if (confirm('Hapus playlist "' + name + '"?')) {
            removePlaylist(name);
            location.href = 'index.html';
        }
    });

    render();
})();

