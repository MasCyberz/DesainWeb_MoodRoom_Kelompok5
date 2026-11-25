/* Halaman Playlist (dinamis: playlist.html?nama=Rock%20n%20Roll) */
(() => {
    const { $, $$, say, store, isPlayingTitle, isPlaying, playTitle, setPlaying, playlists, getSongs, setSongs, removePlaylist, albumCover } = MR;

    const PLAYLIST_COVERS = {
        'Rock n Roll': 'img/covers/semangat_concert.jpg',
        'Dangdut': 'img/covers/playlist_dangdut.jpg',
        'Pop Indo': 'img/covers/playlist_pop.jpg',
        'Indie Senja': 'img/covers/playlist_indie.jpg',
        'Jazz Malam': 'img/covers/fokus_jazz.jpg',
        'Lo-fi Belajar': 'img/covers/fokus_desk.jpg',
        'Akustik Santai': 'img/covers/playlist_akustik.jpg',
        'Workout Mix': 'img/covers/playlist_workout.jpg'
    };

    const PLAYLIST_DESCS = {
        'Rock n Roll': 'Lagu rock yang nemenin dari SMA sampai skripsi.',
        'Dangdut': 'Dangdut ceria untuk menemani hari.',
        'Pop Indo': 'Lagu pop Indonesia paling disukai.',
        'Indie Senja': 'Pilihan tenang untuk senja.',
        'Jazz Malam': 'Saxophone lembut untuk malam.',
        'Lo-fi Belajar': 'Beat pelan untuk fokus lebih lama.',
        'Akustik Santai': 'Petikan akustik yang hangat.',
        'Workout Mix': 'Temani olahraga dan deadline.'
    };

    const PLAYLIST_DEFAULT_META = {
        'Rock n Roll': { mood: 'Semangat', activity: 'Olahraga', genre: 'Rock' },
        'Dangdut': { mood: 'Santai', activity: 'Nongkrong', genre: 'Dangdut' },
        'Pop Indo': { mood: 'Santai', activity: 'Perjalanan', genre: 'Pop' },
        'Indie Senja': { mood: 'Galau', activity: 'Nugas Malam', genre: 'Indie' },
        'Jazz Malam': { mood: 'Fokus', activity: 'Nugas Malam', genre: 'Jazz' },
        'Lo-fi Belajar': { mood: 'Fokus', activity: 'Nugas Malam', genre: 'Lo-fi' },
        'Akustik Santai': { mood: 'Santai', activity: 'Nongkrong', genre: 'Pop' },
        'Workout Mix': { mood: 'Semangat', activity: 'Olahraga', genre: 'Rock' }
    };

    const SONG_META_MAP = {
        'back in black': { mood: 'Semangat', activity: 'Olahraga', genre: 'Rock' },
        'highway to hell': { mood: 'Semangat', activity: 'Olahraga', genre: 'Rock' },
        "sweet child o' mine": { mood: 'Semangat', activity: 'Perjalanan', genre: 'Rock' },
        'bohemian rhapsody': { mood: 'Galau', activity: 'Nongkrong', genre: 'Rock' },
        'smells like teen spirit': { mood: 'Semangat', activity: 'Olahraga', genre: 'Rock' },
        'terlalu manis': { mood: 'Santai', activity: 'Nongkrong', genre: 'Rock' },
        'sayang': { mood: 'Galau', activity: 'Perjalanan', genre: 'Dangdut' },
        'sakitnya tuh di sini': { mood: 'Sedih', activity: 'Nongkrong', genre: 'Dangdut' },
        'kopi dangdut': { mood: 'Semangat', activity: 'Nongkrong', genre: 'Dangdut' },
        'goyang dumang': { mood: 'Semangat', activity: 'Olahraga', genre: 'Dangdut' },
        'tabola bale': { mood: 'Santai', activity: 'Nongkrong', genre: 'Dangdut' },
        'hati-hati di jalan': { mood: 'Galau', activity: 'Perjalanan', genre: 'Pop' },
        'komang': { mood: 'Santai', activity: 'Perjalanan', genre: 'Pop' },
        'satu bulan': { mood: 'Sedih', activity: 'Nugas Malam', genre: 'Pop' },
        'usai': { mood: 'Sedih', activity: 'Tidur', genre: 'Pop' },
        'rehat': { mood: 'Fokus', activity: 'Tidur', genre: 'Pop' },
        'bertaut': { mood: 'Galau', activity: 'Tidur', genre: 'Indie' },
        'evaluasi': { mood: 'Galau', activity: 'Nugas Malam', genre: 'Indie' },
        'secukupnya': { mood: 'Santai', activity: 'Nugas Malam', genre: 'Indie' },
        'cincin': { mood: 'Santai', activity: 'Perjalanan', genre: 'Indie' },
        'rumah ke rumah': { mood: 'Sedih', activity: 'Perjalanan', genre: 'Indie' },
        'pilu membiru': { mood: 'Fokus', activity: 'Nugas Malam', genre: 'Indie' },
        'runtuh': { mood: 'Galau', activity: 'Nugas Malam', genre: 'Indie' },
        'take five': { mood: 'Fokus', activity: 'Nugas Malam', genre: 'Jazz' },
        'so what': { mood: 'Santai', activity: 'Nugas Malam', genre: 'Jazz' },
        'blue in green': { mood: 'Fokus', activity: 'Tidur', genre: 'Jazz' },
        'cantaloupe island': { mood: 'Santai', activity: 'Nongkrong', genre: 'Jazz' },
        "moanin'": { mood: 'Semangat', activity: 'Nongkrong', genre: 'Jazz' },
        'rainy window': { mood: 'Fokus', activity: 'Nugas Malam', genre: 'Lo-fi' },
        'late night notes': { mood: 'Fokus', activity: 'Nugas Malam', genre: 'Lo-fi' },
        'warm coffee': { mood: 'Santai', activity: 'Nugas Malam', genre: 'Lo-fi' },
        'desk lamp': { mood: 'Fokus', activity: 'Nugas Malam', genre: 'Lo-fi' },
        'slow scroll': { mood: 'Fokus', activity: 'Tidur', genre: 'Lo-fi' },
        'bergema sampai selamanya': { mood: 'Santai', activity: 'Nongkrong', genre: 'Pop' },
        'blinding lights': { mood: 'Semangat', activity: 'Olahraga', genre: 'Pop' },
        'espresso': { mood: 'Semangat', activity: 'Olahraga', genre: 'Pop' },
        'peradaban': { mood: 'Semangat', activity: 'Olahraga', genre: 'Rock' },
        'nina': { mood: 'Galau', activity: 'Nongkrong', genre: 'Indie' },
        'kata mereka ini berlebihan': { mood: 'Fokus', activity: 'Nugas Malam', genre: 'Pop' }
    };

    const PACK_THEMES = [
        { id: 'pack-galau', moodKey: 'Galau', word: 'GALAU', name: 'Paket Galau Singkat', gradClass: 'plm-grad-galau' },
        { id: 'pack-fokus', moodKey: 'Fokus', word: 'FOKUS', name: 'Fokus Nugas Singkat', gradClass: 'plm-grad-fokus' },
        { id: 'pack-semangat', moodKey: 'Semangat', word: 'SEMANGAT', name: 'Semangat Booster', gradClass: 'plm-grad-semangat' }
    ];

    const MOOD_LIST = ['Santai', 'Galau', 'Fokus', 'Semangat', 'Sedih'];
    const ACTIVITY_LIST = ['Nugas Malam', 'Olahraga', 'Perjalanan', 'Nongkrong', 'Tidur'];
    const GENRE_LIST = ['Rock', 'Pop', 'Lo-fi', 'Indie', 'Dangdut', 'Jazz'];

    const name = new URLSearchParams(location.search).get('nama');
    const ADDED = ['Hari ini', 'Hari ini', 'Kemarin', 'Kemarin', '3 hari lalu', 'Minggu lalu', 'Minggu lalu', 'Bulan lalu'];
    const hue = str => [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
    const grad = str => { const h = hue(str); return `linear-gradient(135deg,hsl(${h},55%,62%),hsl(${(h + 50) % 360},50%,32%))`; };
    const secs = d => { const [m, x] = String(d || '0:00').split(':'); return (+m || 0) * 60 + (+x || 0); };
    const esc = str => String(str ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

    if (!name) {
        $('#plView')?.classList.add('d-none');
        $('#plExplore')?.classList.remove('d-none');
        document.title = 'Jelajah Playlist — MoodRoom';

        const exploreData = [
            { name: 'Rock n Roll', genre: 'Rock', mood: 'Semangat', activity: 'Olahraga', desc: 'Gitar keras untuk energi penuh', cover: 'img/covers/semangat_concert.jpg' },
            { name: 'Dangdut', genre: 'Dangdut', mood: 'Santai', activity: 'Nongkrong', desc: 'Dangdut ceria untuk menemani hari', cover: 'img/covers/playlist_dangdut.jpg' },
            { name: 'Pop Indo', genre: 'Pop', mood: 'Santai', activity: 'Perjalanan', desc: 'Lagu pop Indonesia paling disukai', cover: 'img/covers/playlist_pop.jpg' },
            { name: 'Indie Senja', genre: 'Indie', mood: 'Galau', activity: 'Perjalanan', desc: 'Pilihan tenang untuk senja', cover: 'img/covers/playlist_indie.jpg' },
            { name: 'Jazz Malam', genre: 'Jazz', mood: 'Santai', activity: 'Nugas Malam', desc: 'Saxophone lembut untuk malam', cover: 'img/covers/fokus_jazz.jpg' },
            { name: 'Lo-fi Belajar', genre: 'Lo-fi', mood: 'Fokus', activity: 'Nugas Malam', desc: 'Beat pelan untuk fokus lebih lama', cover: 'img/covers/fokus_desk.jpg' },
            { name: 'Akustik Santai', genre: 'Pop', mood: 'Santai', activity: 'Nongkrong', desc: 'Petikan akustik yang hangat', cover: 'img/covers/playlist_akustik.jpg' },
            { name: 'Workout Mix', genre: 'Rock', mood: 'Semangat', activity: 'Olahraga', desc: 'Temani olahraga dan deadline', cover: 'img/covers/playlist_workout.jpg' }
        ];

        let exploreGenre = 'Semua';
        const renderExplore = () => {
            const query = ($('#plExploreSearch')?.value || '').trim().toLowerCase();
            const filtered = exploreData.filter(item =>
                (exploreGenre === 'Semua' || item.genre === exploreGenre) &&
                (!query || `${item.name} ${item.genre} ${item.mood} ${item.activity} ${item.desc}`.toLowerCase().includes(query))
            );
            if ($('#plExploreCount')) $('#plExploreCount').textContent = `${filtered.length} playlist`;
            $('#plExploreEmpty')?.classList.toggle('d-none', filtered.length !== 0);
            if ($('#plExploreGrid')) {
                $('#plExploreGrid').innerHTML = filtered.map(item => `
                    <a class="pl-explore-card" href="playlist.html?nama=${encodeURIComponent(item.name)}">
                        <div class="pl-explore-cover" style="background:linear-gradient(160deg,rgba(24,9,43,.08),rgba(24,9,43,.62)),url('${item.cover}') center/cover"></div>
                        <h3 class="text-truncate">${esc(item.name)}</h3>
                        <p class="text-truncate">${esc(item.desc)}</p>
                        <p class="mt-1"><span class="text-pink">${esc(item.mood)}</span> · ${esc(item.genre)}</p>
                    </a>`).join('');
            }
        };

        $('#plExploreSearch')?.addEventListener('input', renderExplore);
        $('#plExploreGenres')?.addEventListener('click', event => {
            const button = event.target.closest('[data-genre]');
            if (!button) return;
            exploreGenre = button.dataset.genre;
            $$('#plExploreGenres [data-genre]').forEach(item => item.classList.toggle('active', item === button));
            renderExplore();
        });
        renderExplore();
        return;
    }

    if (!playlists.includes(name)) {
        $('#plView')?.classList.add('d-none');
        $('#plMissing')?.classList.remove('d-none');
        document.title = 'Playlist tidak ditemukan — MoodRoom';
        return;
    }

    document.title = name + ' — MoodRoom';
    if ($('#plTitle')) $('#plTitle').textContent = name;
    if ($('#plDesc')) $('#plDesc').textContent = PLAYLIST_DESCS[name] || ('Koleksi lagu ' + name + ' pilihanmu.');
    const plCover = $('#plCover');
    if (plCover) {
        const plCoverSrc = PLAYLIST_COVERS[name];
        if (plCoverSrc) {
            plCover.style.background = `linear-gradient(160deg, rgba(24,9,43,.08), rgba(24,9,43,.62)), url('${plCoverSrc}') center/cover`;
            plCover.innerHTML = '';
        } else {
            plCover.style.background = grad(name);
        }
    }

    // ===== Helpers Metadata Mood/Aktivitas/Genre & Storage =====
    const songTagKey = s => `${String(s[0] || '').toLowerCase().trim()}::${String(s[1] || '').toLowerCase().trim()}`;
    let songTags = store.get('mr-song-tags', {});
    const getSongMeta = s => {
        const saved = songTags[songTagKey(s)];
        const base = SONG_META_MAP[String(s[0] || '').toLowerCase().trim()]
            || PLAYLIST_DEFAULT_META[name]
            || { mood: 'Santai', activity: 'Nongkrong', genre: 'Pop' };
        return {
            mood: saved?.mood || base.mood,
            activity: saved?.activity || base.activity,
            genre: saved?.genre || base.genre
        };
    };
    const saveSongMeta = (s, meta) => {
        songTags = { ...songTags, [songTagKey(s)]: meta };
        store.set('mr-song-tags', songTags);
    };

    // Offline status per playlist
    const offlineStateMap = store.get('mr-pl-offline', {});
    let isOfflineOn = offlineStateMap[name] !== undefined ? Boolean(offlineStateMap[name]) : true;

    // Liked state sync (local playlist + global mr-liked / lagu_disukai.html)
    const LIKED_DEFAULT = [
        ['Evaluasi', 'Hindia', 'Menari Dengan Bayangan', 'Hari ini', '3:31', ['#8a6a40', '#2c1a0c']],
        ['Secukupnya', 'Hindia', 'Menari Dengan Bayangan', 'Hari ini', '3:25', ['#8a6a40', '#2c1a0c']],
        ['Rehat', 'Kunto Aji', 'Mantra Mantra', 'Kemarin', '5:28', ['#d8dcc0', '#6a7a50']],
        ['Pilu Membiru', 'Kunto Aji', 'Mantra Mantra', 'Kemarin', '4:11', ['#d8dcc0', '#6a7a50']],
        ['Runtuh', 'Feby Putri, Fiersa Besari', 'Runtuh', '22 Okt 2026', '3:43', ['#4a7a9a', '#14304a']],
        ['Bertaut', 'Nadin Amizah', 'Selamat Ulang Tahun', '21 Okt 2026', '5:15', ['#f4e8e0', '#c04a5a']],
        ['Hati-Hati di Jalan', 'Tulus', 'Manusia', '20 Okt 2026', '4:02', ['#e8e8e8', '#202020']],
        ['Rumah ke Rumah', 'Hindia', 'Menari Dengan Bayangan', '18 Okt 2026', '4:37', ['#8a6a40', '#2c1a0c']]
    ];
    const getLikedList = () => store.get('mr-liked', null) || LIKED_DEFAULT;
    const getLikedSet = () => new Set(getLikedList().map(x => String(x[0] || '').toLowerCase()));
    const toggleSongLiked = song => {
        const list = [...getLikedList()];
        const key = String(song[0] || '').toLowerCase();
        const idx = list.findIndex(x => String(x[0] || '').toLowerCase() === key);
        if (idx >= 0) list.splice(idx, 1);
        else list.unshift([song[0], song[1], song[2], 'Hari ini', song[3], ['#8a6a40', '#2c1a0c']]);
        store.set('mr-liked', list);
    };

    // MoodCards per playlist + sinkronisasi dengan MoodCard Saya (moodroom_moodcards)
    const buildDefaultPlaylistMoodCards = () => {
        const list = getSongs(name);
        const first = list[0] || ['Evaluasi', 'Hindia', 'Menari Dengan Bayangan', '3:31'];
        const second = list[1] || list[0] || ['Secukupnya', 'Hindia', 'Menari Dengan Bayangan', '3:25'];
        const firstMeta = getSongMeta(first);
        const secondMeta = getSongMeta(second);
        if (name === 'Rock n Roll') {
            return [
                {
                    id: 'mc-rock-1',
                    title: 'Usia-Usia Dewasa',
                    quote: 'Dengerin pas jam 1 malam revisi belum kelar..',
                    tag: 'Galau',
                    meta: '3 lagu · @kurator_senja',
                    sampleTrack: { title: first[0], artist: first[1] }
                },
                {
                    id: 'mc-rock-2',
                    title: 'Revisi jam 1',
                    quote: 'Kutipan lirik utama tampil 1 baris',
                    tag: 'Fokus',
                    meta: '2 lagu · @kurator_senja',
                    sampleTrack: { title: second[0], artist: second[1] }
                }
            ];
        }
        return [
            {
                id: `mc-${name}-1`,
                title: `Vibes ${name}`,
                quote: `Cocok diputar saat ${firstMeta.activity.toLowerCase()} dengan suasana ${firstMeta.mood.toLowerCase()}.`,
                tag: firstMeta.mood,
                meta: `${Math.min(3, Math.max(1, list.length))} lagu · @dimas`,
                sampleTrack: { title: first[0], artist: first[1] }
            },
            {
                id: `mc-${name}-2`,
                title: `${second[0]} Session`,
                quote: `Biar makin masuk ke mood ${secondMeta.mood.toLowerCase()} hari ini.`,
                tag: secondMeta.mood,
                meta: `${Math.min(2, Math.max(1, list.length))} lagu · @dimas`,
                sampleTrack: { title: second[0], artist: second[1] }
            }
        ];
    };

    const getPlaylistMoodCards = () => {
        const map = store.get('mr-pl-moodcards', {});
        if (Array.isArray(map[name])) return map[name];
        return buildDefaultPlaylistMoodCards();
    };
    const savePlaylistMoodCards = cards => {
        const map = store.get('mr-pl-moodcards', {});
        map[name] = cards;
        store.set('mr-pl-moodcards', map);
    };

    const readGlobalMoodCards = () => {
        try {
            const raw = JSON.parse(localStorage.getItem('moodroom_moodcards') || '[]');
            return Array.isArray(raw) ? raw : [];
        } catch {
            return [];
        }
    };

    const st = {
        q: '',
        sort: 'new',
        mood: 'all',
        activity: null,
        genre: null,
        activeTab: 'songs',
        showAllSongs: false,
        playingPackId: null,
        playingMoodCardId: null
    };

    const rowsEl = $('#plRows');

    // ===== Modal Helper (#plmModal) =====
    const ensurePlmModal = () => {
        let modalEl = $('#plmModal');
        if (!modalEl) {
            modalEl = document.createElement('div');
            modalEl.className = 'modal fade';
            modalEl.id = 'plmModal';
            modalEl.tabIndex = -1;
            modalEl.setAttribute('aria-hidden', 'true');
            modalEl.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content plm-modal-content">
                        <div class="modal-header border-0 pb-1">
                            <h5 class="modal-title fw-bold fs-6" id="plmModalTitle">MoodRoom</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Tutup"></button>
                        </div>
                        <div class="modal-body pt-2" id="plmModalBody"></div>
                    </div>
                </div>`;
            document.body.appendChild(modalEl);
        }
        return modalEl;
    };

    const openPlmModal = (title, bodyHtml) => {
        const modalEl = ensurePlmModal();
        const titleEl = $('#plmModalTitle', modalEl);
        const bodyEl = $('#plmModalBody', modalEl);
        if (titleEl) titleEl.textContent = title;
        if (bodyEl) bodyEl.innerHTML = bodyHtml;
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
    };

    const closePlmModal = () => {
        const modalEl = $('#plmModal');
        if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
    };

    // ===== 1. Render Filter Mood, Aktivitas & Genre =====
    const resetAllFilters = (announce = true) => {
        st.mood = 'all';
        st.activity = null;
        st.genre = null;
        st.showAllSongs = false;
        renderFilters();
        renderSongs();
        if (announce) say('Filter direset');
    };

    const removeFilterKey = key => {
        if (key === 'mood') st.mood = 'all';
        else st[key] = null;
        st.showAllSongs = false;
        renderFilters();
        renderSongs();
    };

    function renderFilters() {
        const activeChipsEl = $('#plmActiveChips');
        const miniSummaryEl = $('#plmMiniSummary');
        const badgeEl = $('#plmFilterBadge');

        $$('#plmMoodChips .plm-chip').forEach(btn => btn.classList.toggle('active', btn.dataset.v === st.mood));
        $$('#plmActivityChips .plm-chip').forEach(btn => btn.classList.toggle('active', btn.dataset.v === st.activity));
        $$('#plmGenreChips .plm-chip').forEach(btn => btn.classList.toggle('active', btn.dataset.v === st.genre));

        const activeList = [];
        if (st.mood && st.mood !== 'all') activeList.push({ key: 'mood', label: `Mood: ${st.mood}` });
        if (st.activity) activeList.push({ key: 'activity', label: `Aktivitas: ${st.activity}` });
        if (st.genre) activeList.push({ key: 'genre', label: `Genre: ${st.genre}` });

        if (badgeEl) {
            badgeEl.textContent = activeList.length;
            badgeEl.classList.toggle('has-filter', activeList.length > 0);
            badgeEl.classList.toggle('is-zero', activeList.length === 0);
        }

        if (activeChipsEl) {
            if (!activeList.length) {
                activeChipsEl.innerHTML = '<span class="small text-white-50">Semua lagu ditampilkan (belum ada filter aktif)</span>';
            } else {
                activeChipsEl.innerHTML = activeList.map((item, idx) => `
                    ${idx > 0 ? '<span class="plm-tag-plus">+</span>' : ''}
                    <span class="plm-filter-tag">
                        <span>${esc(item.label)}</span>
                        <i class="bi bi-x" role="button" tabindex="0" data-clear-filter="${item.key}" aria-label="Hapus ${esc(item.label)}"></i>
                    </span>
                `).join('');
            }
        }

        if (miniSummaryEl) {
            if (!activeList.length) {
                miniSummaryEl.innerHTML = '';
            } else {
                miniSummaryEl.innerHTML = activeList.map(item => `
                    <span class="plm-mini-chip">
                        <span>${esc(item.label)}</span>
                        <i class="bi bi-x" role="button" tabindex="0" data-clear-filter="${item.key}" aria-label="Hapus ${esc(item.label)}"></i>
                    </span>
                `).join('');
            }
        }
    }

    // ===== 2. Render Mini Mood Pack Dinamis dari Lagu Playlist =====
    function renderMiniPacks() {
        const grid = $('#plmPackGrid');
        const packBadge = $('#plmPackBadge');
        if (!grid) return;

        const allSongs = getSongs(name);
        const packs = PACK_THEMES.map(theme => {
            const matched = allSongs
                .filter(s => getSongMeta(s).mood.toLowerCase() === theme.moodKey.toLowerCase())
                .slice(0, 3);
            const totalSec = matched.reduce((sum, s) => sum + secs(s[3]), 0);
            const totalMin = matched.length ? Math.max(1, Math.round(totalSec / 60)) : 0;
            return { ...theme, tracks: matched, totalMin };
        });

        const availableCount = packs.filter(p => p.tracks.length > 0).length;
        if (packBadge) packBadge.textContent = availableCount;

        grid.innerHTML = packs.map(pack => {
            const first = pack.tracks[0];
            const anyPlayingInPack = pack.tracks.some(s => isPlayingTitle(`${s[0]} - ${s[1]}`)) && isPlaying();
            const isPackPlaying = (st.playingPackId === pack.id && isPlaying()) || anyPlayingInPack;
            const tracksHtml = pack.tracks.map((s, idx) => `
                <div class="plm-pack-track" data-pack-id="${pack.id}" data-track-title="${esc(s[0] + ' - ' + s[1])}" role="button" tabindex="0">
                    <span class="num">${idx + 1}</span>
                    <span class="tt text-truncate">${esc(s[0])}</span>
                    <span class="dur">${esc(s[3])}</span>
                </div>
            `).join('');

            const emptySlotHtml = pack.tracks.length < 3
                ? `<div class="plm-pack-slot-empty">${pack.tracks.length === 0 ? `Belum ada lagu mood ${pack.moodKey} — klik tag mood di tabel` : `Slot kosong (${pack.tracks.length}/3 lagu di playlist)`}</div>`
                : '';

            return `
                <article class="plm-pack-card${isPackPlaying ? ' is-playing' : ''}" data-pack-card="${pack.id}">
                    <div class="plm-pack-header ${pack.gradClass}">
                        <span class="plm-pack-eyebrow">${pack.totalMin} menit</span>
                        <span class="plm-pack-mood-title">${pack.word}</span>
                        <button type="button" class="plm-pack-play-btn" data-pack-play="${pack.id}" aria-label="Putar ${pack.name}" ${!first ? 'disabled' : ''}>
                            <i class="bi ${isPackPlaying ? 'bi-pause-fill' : 'bi-play-fill'}"></i>
                        </button>
                    </div>
                    <div class="plm-pack-body">
                        <div class="plm-pack-name">${pack.name}</div>
                        <div class="plm-pack-meta">
                            <span class="plm-badge-pill">${pack.moodKey}</span>
                            <small class="text-white-50">${pack.tracks.length} lagu · ${pack.totalMin} mnt</small>
                        </div>
                        <div class="plm-pack-tracklist">
                            ${tracksHtml}
                            ${emptySlotHtml}
                        </div>
                    </div>
                </article>`;
        }).join('');
    }

    // ===== 3. Render Tabel Lagu & Tandai Mood Lagu =====
    function getFilteredSongs() {
        const all = getSongs(name).map((s, i) => ({ s, i, meta: getSongMeta(s) }));
        const q = st.q.trim().toLowerCase();
        const gq = ($('#searchInput')?.value || '').trim().toLowerCase();

        const list = all.filter(({ s, meta }) => {
            const matchText = [q, gq].every(k => !k || `${s[0]} ${s[1]} ${s[2]} ${meta.mood} ${meta.activity} ${meta.genre}`.toLowerCase().includes(k));
            const matchMood = st.mood === 'all' || meta.mood.toLowerCase() === st.mood.toLowerCase();
            const matchAct = !st.activity || meta.activity.toLowerCase() === st.activity.toLowerCase();
            const matchGenre = !st.genre || meta.genre.toLowerCase() === st.genre.toLowerCase();
            return matchText && matchMood && matchAct && matchGenre;
        });

        if (st.sort === 'az') list.sort((a, b) => a.s[0].localeCompare(b.s[0]));
        if (st.sort === 'artist') list.sort((a, b) => a.s[1].localeCompare(b.s[1]));
        if (st.sort === 'dur') list.sort((a, b) => secs(b.s[3]) - secs(a.s[3]));
        return { all, list };
    }

    function renderSongs() {
        if (!rowsEl) return;
        const { all, list } = getFilteredSongs();
        const likedSet = getLikedSet();

        if ($('#plCount')) $('#plCount').textContent = all.length;
        if ($('#plCountTab')) $('#plCountTab').textContent = all.length;
        if ($('#plMin')) $('#plMin').textContent = all.length ? Math.max(1, Math.round(all.reduce((t, { s }) => t + secs(s[3]), 0) / 60)) : 0;

        $('#plHead')?.classList.toggle('d-none', !all.length);
        $('#plEmpty')?.classList.toggle('d-none', all.length > 0);
        $('#plNoMatch')?.classList.toggle('d-none', !(all.length && !list.length));
        $$('#plActions .btn-pink, #shuffleAll').forEach(b => b.disabled = !all.length);

        const limit = st.showAllSongs ? list.length : 6;
        const visibleList = list.slice(0, limit);
        const loadMoreWrap = $('#plmLoadMoreWrap');
        if (loadMoreWrap) loadMoreWrap.classList.toggle('d-none', list.length <= 6 || st.showAllSongs);

        rowsEl.innerHTML = visibleList.map(({ s, i, meta }, n) => {
            const albumSrc = albumCover(s[2]);
            const covBackground = albumSrc ? `url('${albumSrc}') center/cover` : grad(s[2]);
            const fullTitle = `${s[0]} - ${s[1]}`;
            const isLiked = likedSet.has(String(s[0] || '').toLowerCase());
            return `
      <div class="song-row liked plm-song-row${isPlayingTitle(fullTitle) ? ' is-playing' : ''}" data-title="${esc(fullTitle)}" data-song-idx="${i}" tabindex="0" role="button" aria-label="Putar ${esc(s[0])}">
        <div class="c-num"><span class="rownum">${n + 1}</span><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div>
        <div class="c-title d-flex align-items-center gap-3 min-w-0">
          <span class="cov" style="background:${covBackground}"></span>
          <div class="min-w-0"><div class="tt text-truncate">${esc(s[0])}</div><div class="sub text-truncate">${esc(s[1])} · ${esc(meta.genre)}</div></div>
        </div>
        <div class="c-mood">
          <button type="button" class="plm-table-badge plm-mood-tag-btn" data-tag-song="${i}" title="Tandai mood lagu">
            <i class="bi bi-tag-fill me-1 text-pink"></i>${esc(meta.mood)}
          </button>
        </div>
        <div class="c-act-tag"><span class="plm-table-badge">${esc(meta.activity)}</span></div>
        <div class="c-heart"><button class="ibtn${isLiked ? ' on' : ''}" data-toggle="bi-heart" aria-label="Suka"><i class="bi bi-heart${isLiked ? '-fill' : ''}"></i></button></div>
        <div class="c-dur sub">${esc(s[3])}</div>
        <div class="c-act d-flex justify-content-end">
          <div class="dropdown"><button class="ibtn" data-bs-toggle="dropdown" data-bs-strategy="fixed" aria-label="Menu lagu"><i class="bi bi-three-dots"></i></button>
            <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end">
              <li><button class="dropdown-item row-act" data-tag-song="${i}"><i class="bi bi-tag me-2 text-pink"></i>Tandai mood lagu</button></li>
              <li><button class="dropdown-item row-act" data-remove="${i}"><i class="bi bi-trash3 me-2"></i>Hapus dari playlist</button></li>
              <li><button class="dropdown-item row-act" data-share-song="${i}"><i class="bi bi-share me-2"></i>Bagikan</button></li>
            </ul></div>
        </div>
      </div>`;
        }).join('');
        MR.refreshCards();
    }

    function openTagSongModal(songIdx) {
        const all = getSongs(name);
        const song = all[songIdx];
        if (!song) return;
        const current = getSongMeta(song);

        openPlmModal('Tandai Mood & Aktivitas Lagu', `
            <div class="p-3 rounded-3 mb-3" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08)">
                <div class="fw-bold">${esc(song[0])}</div>
                <div class="small text-white-50">${esc(song[1])} · ${esc(song[2])}</div>
            </div>
            <form id="plmTagSongForm" class="d-grid gap-3">
                <div>
                    <label for="plmTagMoodSelect" class="form-label small text-white-50">Pilih Mood</label>
                    <select id="plmTagMoodSelect" class="form-select bg-dark text-white border-secondary">
                        ${MOOD_LIST.map(m => `<option value="${m}" ${current.mood === m ? 'selected' : ''}>${m}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for="plmTagActivitySelect" class="form-label small text-white-50">Aktivitas</label>
                    <select id="plmTagActivitySelect" class="form-select bg-dark text-white border-secondary">
                        ${ACTIVITY_LIST.map(a => `<option value="${a}" ${current.activity === a ? 'selected' : ''}>${a}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for="plmTagGenreSelect" class="form-label small text-white-50">Genre</label>
                    <select id="plmTagGenreSelect" class="form-select bg-dark text-white border-secondary">
                        ${GENRE_LIST.map(g => `<option value="${g}" ${current.genre === g ? 'selected' : ''}>${g}</option>`).join('')}
                    </select>
                </div>
                <button type="submit" class="btn btn-pink rounded-pill fw-semibold">Simpan Tag Lagu</button>
            </form>
        `);

        $('#plmTagSongForm')?.addEventListener('submit', e => {
            e.preventDefault();
            const newMeta = {
                mood: $('#plmTagMoodSelect')?.value || current.mood,
                activity: $('#plmTagActivitySelect')?.value || current.activity,
                genre: $('#plmTagGenreSelect')?.value || current.genre
            };
            saveSongMeta(song, newMeta);
            closePlmModal();
            renderSongs();
            renderMiniPacks();
            say(`"${song[0]}" ditandai sebagai mood ${newMeta.mood} ✨`);
        });
    }

    // ===== 4. Render MoodCard Tersimpan & Sinkronisasi Tab MoodCard =====
    function updateMoodCardCounts(cards) {
        if ($('#plMoodCardCount')) $('#plMoodCardCount').textContent = cards.length;
        if ($('#plMoodCardTabCount')) $('#plMoodCardTabCount').textContent = cards.length;
    }

    function renderMoodCards() {
        const grid = $('#plmMoodCardGrid');
        const cards = getPlaylistMoodCards();
        updateMoodCardCounts(cards);
        if (!grid) return;

        const cardsHtml = cards.map(mc => {
            const sampleTitle = mc.sampleTrack ? `${mc.sampleTrack.title} - ${mc.sampleTrack.artist}` : '';
            const playingThis = (st.playingMoodCardId === mc.id || (sampleTitle && isPlayingTitle(sampleTitle))) && isPlaying();
            return `
                <div class="plm-mcard${playingThis ? ' is-playing' : ''}" data-mc-id="${esc(mc.id)}">
                    <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
                        <div class="d-flex align-items-center gap-2 fw-bold fs-6 min-w-0">
                            <i class="bi bi-card-text text-pink flex-shrink-0"></i>
                            <span class="text-truncate">${esc(mc.title)}</span>
                        </div>
                        <div class="d-flex align-items-center gap-1 flex-shrink-0">
                            <button type="button" class="plm-mcard-remove" data-remove-mc="${esc(mc.id)}" aria-label="Hapus MoodCard ${esc(mc.title)}" title="Hapus dari playlist">
                                <i class="bi bi-x-lg"></i>
                            </button>
                            <button type="button" class="plm-mcard-play" data-play-mc="${esc(mc.id)}" aria-label="Putar MoodCard ${esc(mc.title)}" title="Putar">
                                <i class="bi ${playingThis ? 'bi-pause-fill' : 'bi-play-fill'}"></i>
                            </button>
                        </div>
                    </div>
                    <p class="plm-mcard-quote">${esc(mc.quote)}</p>
                    <div class="mt-auto d-flex align-items-center justify-content-between gap-2">
                        <span class="plm-badge-pill">${esc(mc.tag)}</span>
                        <small class="text-white-50 text-truncate">${esc(mc.meta)}</small>
                    </div>
                </div>`;
        }).join('');

        grid.innerHTML = cardsHtml + `
            <div class="plm-mcard-add" id="plmAddMoodCardSlot" role="button" tabindex="0">
                <i class="bi bi-plus-lg fs-4 mb-2"></i>
                <span>Simpan MoodCard ke sini</span>
            </div>`;
    }

    function openAddMoodCardModal() {
        const songs = getSongs(name);
        const globalCards = readGlobalMoodCards();
        const songOptions = songs.length
            ? songs.map((s, idx) => `<option value="${idx}">${esc(s[0])} — ${esc(s[1])}</option>`).join('')
            : '<option value="0">Evaluasi — Hindia</option>';

        const existingOptions = globalCards.length
            ? `
                <div class="mb-3 pb-3 border-bottom border-white border-opacity-10">
                    <div class="small fw-semibold mb-2">Pilih dari "MoodCard Saya"</div>
                    <div class="d-grid gap-2" style="max-height:150px;overflow-y:auto">
                        ${globalCards.map(gc => `
                            <button type="button" class="btn btn-outline-light btn-sm text-start d-flex justify-content-between align-items-center" data-import-mc="${esc(gc.id)}">
                                <span class="text-truncate">${esc(gc.title)} <small class="text-white-50">(${gc.songCount || 1} lagu)</small></span>
                                <span class="badge bg-secondary ms-2">Tambahkan</span>
                            </button>
                        `).join('')}
                    </div>
                </div>`
            : '';

        openPlmModal('Simpan MoodCard ke Playlist', `
            ${existingOptions}
            <form id="plmAddMcForm" class="d-grid gap-3">
                <div>
                    <label for="mcTitleIn" class="form-label small text-white-50">Judul MoodCard Baru</label>
                    <input type="text" id="mcTitleIn" class="form-control bg-dark text-white border-secondary" placeholder="Misal: Lembur Akhir Semester" maxlength="40" required>
                </div>
                <div>
                    <label for="mcQuoteIn" class="form-label small text-white-50">Kutipan / Catatan Kurator</label>
                    <input type="text" id="mcQuoteIn" class="form-control bg-dark text-white border-secondary" placeholder="Tulis 1 kalimat suasana lagu..." maxlength="100" required>
                </div>
                <div class="row g-2">
                    <div class="col-6">
                        <label for="mcTagIn" class="form-label small text-white-50">Tag Mood</label>
                        <select id="mcTagIn" class="form-select bg-dark text-white border-secondary">
                            ${MOOD_LIST.map(m => `<option value="${m}">${m}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-6">
                        <label for="mcSampleIn" class="form-label small text-white-50">Lagu Utama</label>
                        <select id="mcSampleIn" class="form-select bg-dark text-white border-secondary">${songOptions}</select>
                    </div>
                </div>
                <button type="submit" class="btn btn-pink rounded-pill fw-semibold">Simpan ke Playlist</button>
            </form>
        `);

        $$('[data-import-mc]').forEach(btn => {
            btn.addEventListener('click', () => {
                const gc = globalCards.find(c => String(c.id) === btn.dataset.importMc);
                if (!gc) return;
                const cards = getPlaylistMoodCards();
                if (cards.some(c => c.title.toLowerCase() === String(gc.title || '').toLowerCase())) {
                    say('MoodCard tersebut sudah ada di playlist ini');
                    return;
                }
                const sample = songs[0] || ['Evaluasi', 'Hindia'];
                const importedSample = gc.featuredSong
                    ? (songs.find(s => s[0].toLowerCase() === gc.featuredSong.toLowerCase()) || [gc.featuredSong, 'MoodRoom'])
                    : sample;
                cards.push({
                    id: `mc-imp-${gc.id}-${Date.now()}`,
                    title: gc.title || 'MoodCard',
                    quote: gc.lyric || gc.note || 'MoodCard dari koleksi MoodCard Saya',
                    tag: getSongMeta(importedSample).mood || 'Galau',
                    meta: `${gc.songCount || 1} lagu · @dimas`,
                    sampleTrack: { title: importedSample[0], artist: importedSample[1] }
                });
                savePlaylistMoodCards(cards);
                closePlmModal();
                renderMoodCards();
                say(`MoodCard "${gc.title}" ditambahkan ke ${name} ✨`);
            });
        });

        $('#plmAddMcForm')?.addEventListener('submit', e => {
            e.preventDefault();
            const titleVal = $('#mcTitleIn')?.value.trim();
            const quoteVal = $('#mcQuoteIn')?.value.trim();
            const tagVal = $('#mcTagIn')?.value || 'Galau';
            const sampleIdx = Number($('#mcSampleIn')?.value || 0);
            const sampleSong = songs[sampleIdx] || ['Evaluasi', 'Hindia'];
            if (!titleVal || !quoteVal) return;

            const cards = getPlaylistMoodCards();
            const newCard = {
                id: 'mc-' + Date.now(),
                title: titleVal,
                quote: quoteVal,
                tag: tagVal,
                meta: `${Math.min(3, Math.max(1, songs.length))} lagu · @dimas`,
                sampleTrack: { title: sampleSong[0], artist: sampleSong[1] }
            };
            cards.push(newCard);
            savePlaylistMoodCards(cards);

            // Sinkronkan juga ke koleksi MoodCard Saya agar terhubung dua arah
            try {
                const globalList = readGlobalMoodCards();
                globalList.unshift({
                    id: Date.now(),
                    title: titleVal,
                    cover: PLAYLIST_COVERS[name] || 'img/covers/galau_night.jpg',
                    songCount: Math.min(3, Math.max(1, songs.length)),
                    lyric: quoteVal,
                    note: `Disimpan dari playlist ${name}`,
                    featuredSong: sampleSong[0],
                    date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
                    status: 'published'
                });
                localStorage.setItem('moodroom_moodcards', JSON.stringify(globalList));
            } catch { /* ignore storage quota errors */ }

            closePlmModal();
            renderMoodCards();
            say('MoodCard baru berhasil disimpan ke playlist! ✨');
        });
    }

    // ===== 5. Tab Switcher (Lagu vs MoodCard) & Offline State =====
    function switchViewTab(tab) {
        st.activeTab = tab;
        const isSongsTab = tab === 'songs';
        $('#tabSongs')?.classList.toggle('active', isSongsTab);
        $('#tabSongs')?.setAttribute('aria-selected', String(isSongsTab));
        $('#tabMoodCards')?.classList.toggle('active', !isSongsTab);
        $('#tabMoodCards')?.setAttribute('aria-selected', String(!isSongsTab));
        $('#songsViewArea')?.classList.toggle('d-none', !isSongsTab);
        $('#plmSavedMoodCardSection')?.classList.remove('d-none');
    }

    function syncOfflineBtn() {
        const btn = $('#plmOfflineBtn');
        const sw = $('#plmOfflineSwitch');
        if (btn) btn.setAttribute('aria-pressed', String(isOfflineOn));
        if (sw) sw.classList.toggle('is-on', isOfflineOn);
    }

    // ===== 6. Event Listeners =====
    $('#tabSongs')?.addEventListener('click', () => switchViewTab('songs'));
    $('#tabMoodCards')?.addEventListener('click', () => switchViewTab('moodcards'));

    $('#plmOfflineBtn')?.addEventListener('click', () => {
        isOfflineOn = !isOfflineOn;
        const map = store.get('mr-pl-offline', {});
        map[name] = isOfflineOn;
        store.set('mr-pl-offline', map);
        syncOfflineBtn();
        say(isOfflineOn ? `Mode Offline aktif — ${getSongs(name).length} lagu tersimpan` : 'Mode Offline dinonaktifkan');
    });

    $('#plmShareCardBtn')?.addEventListener('click', () => {
        const count = getSongs(name).length;
        openPlmModal('Share MoodCard Playlist', `
            <div class="p-3 rounded-4 mb-3" style="background:linear-gradient(135deg,#c972aa,#6832a8)">
                <div class="small opacity-75 fw-semibold">MOODROOM · PLAYLISTKU</div>
                <div class="fs-5 fw-bold mt-1">${esc(name)}</div>
                <p class="small mb-2 opacity-90">"${esc($('#plDesc')?.textContent || '')}"</p>
                <span class="plm-badge-pill">@dimas · ${count} lagu</span>
            </div>
            <button type="button" class="btn btn-pink w-100 rounded-pill fw-semibold" id="plmCopyShareBtn">Salin Tautan Playlist</button>
        `);
        $('#plmCopyShareBtn')?.addEventListener('click', async () => {
            try { await navigator.clipboard?.writeText(location.href); } catch { /* ignore */ }
            closePlmModal();
            say('Link MoodCard disalin dan siap dibagikan! 🔗');
        });
    });

    $('#plmListenRoomBtn')?.addEventListener('click', () => {
        const roomCode = '#' + name.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '');
        openPlmModal('Dengar Bareng Teman (Auto-Queue)', `
            <p class="small text-white-50">Undang teman ke room privat playlist <b>${esc(name)}</b>. Antrean lagu diputar bergantian secara otomatis.</p>
            <div class="p-3 rounded-3 mb-3 d-flex justify-content-between align-items-center" style="background:#170a28;border:1px dashed rgba(223,108,168,.55)">
                <div>
                    <div class="text-white-50" style="font-size:.68rem">KODE ROOM PRIVAT</div>
                    <div class="fw-bold fs-5">${esc(roomCode)}</div>
                </div>
                <span class="plm-badge-pill">${esc(st.genre || 'Semua Genre')}</span>
            </div>
            <button type="button" class="btn btn-pink w-100 rounded-pill fw-semibold" id="plmStartRoomBtn">Buka Room Sekarang</button>
        `);
        $('#plmStartRoomBtn')?.addEventListener('click', () => {
            closePlmModal();
            location.href = `sirkel-room.html?room=${encodeURIComponent(name)}`;
        });
    });

    $('#plmSearchBtn')?.addEventListener('click', () => {
        const box = $('#plmSearchCompact');
        if (!box) return;
        const open = box.classList.toggle('is-open');
        if (open) $('#plSearch')?.focus();
    });

    $('#plmResetFilters')?.addEventListener('click', () => resetAllFilters(true));

    $('#plmFilterCollapse')?.addEventListener('click', e => {
        const chip = e.target.closest('.plm-chip');
        if (chip) {
            const group = chip.closest('[data-group]')?.dataset.group;
            const val = chip.dataset.v;
            if (!group) return;
            if (group === 'mood') st.mood = val;
            else st[group] = (st[group] === val) ? null : val;
            st.showAllSongs = false;
            renderFilters();
            renderSongs();
            return;
        }
        const clearBtn = e.target.closest('[data-clear-filter]');
        if (clearBtn) removeFilterKey(clearBtn.dataset.clearFilter);
    });

    $('#plmMiniSummary')?.addEventListener('click', e => {
        const clearBtn = e.target.closest('[data-clear-filter]');
        if (clearBtn) removeFilterKey(clearBtn.dataset.clearFilter);
    });

    $('#plmPackGrid')?.addEventListener('click', e => {
        const playBtn = e.target.closest('[data-pack-play]');
        if (playBtn) {
            const packId = playBtn.dataset.packPlay;
            const theme = PACK_THEMES.find(t => t.id === packId);
            if (!theme) return;
            const matched = getSongs(name).filter(s => getSongMeta(s).mood.toLowerCase() === theme.moodKey.toLowerCase()).slice(0, 3);
            if (!matched.length) return;
            const firstTitle = `${matched[0][0]} - ${matched[0][1]}`;
            if (st.playingPackId === packId && isPlayingTitle(firstTitle)) {
                setPlaying(!isPlaying());
            } else {
                st.playingPackId = packId;
                st.playingMoodCardId = null;
                playTitle(firstTitle);
                say(`Memutar instan ${theme.name} 🎧`);
            }
            renderMiniPacks();
            renderSongs();
            return;
        }

        const trackRow = e.target.closest('.plm-pack-track');
        if (trackRow) {
            st.playingPackId = trackRow.dataset.packId || null;
            st.playingMoodCardId = null;
            playTitle(trackRow.dataset.trackTitle);
            renderMiniPacks();
            renderSongs();
        }
    });

    rowsEl?.addEventListener('click', e => {
        const heartBtn = e.target.closest('[data-toggle="bi-heart"]');
        if (heartBtn) {
            const row = heartBtn.closest('.song-row');
            const song = getSongs(name)[Number(row?.dataset.songIdx)];
            if (song) toggleSongLiked(song);
            return;
        }
        const tagBtn = e.target.closest('[data-tag-song]');
        if (tagBtn) {
            e.stopPropagation();
            openTagSongModal(Number(tagBtn.dataset.tagSong));
            return;
        }
        const rm = e.target.closest('[data-remove]');
        if (rm) {
            e.stopPropagation();
            const list = [...getSongs(name)];
            const [gone] = list.splice(+rm.dataset.remove, 1);
            setSongs(name, list);
            renderSongs();
            renderMiniPacks();
            say('Dihapus dari ' + name + (gone ? ': ' + gone[0] : ''));
            return;
        }
        const shareBtn = e.target.closest('[data-share-song]');
        if (shareBtn) {
            e.stopPropagation();
            const s = getSongs(name)[Number(shareBtn.dataset.shareSong)];
            say(s ? `Tautan "${s[0]}" disalin 🔗` : 'Bagikan — segera hadir');
        }
    });

    $('#plmMoodCardGrid')?.addEventListener('click', e => {
        const addSlot = e.target.closest('#plmAddMoodCardSlot');
        if (addSlot) {
            openAddMoodCardModal();
            return;
        }
        const removeBtn = e.target.closest('[data-remove-mc]');
        if (removeBtn) {
            const id = removeBtn.dataset.removeMc;
            const nextCards = getPlaylistMoodCards().filter(c => String(c.id) !== String(id));
            savePlaylistMoodCards(nextCards);
            renderMoodCards();
            say('MoodCard dihapus dari playlist');
            return;
        }
        const playBtn = e.target.closest('[data-play-mc]');
        if (playBtn) {
            const id = playBtn.dataset.playMc;
            const card = getPlaylistMoodCards().find(c => String(c.id) === String(id));
            if (!card) return;
            const targetTitle = card.sampleTrack
                ? `${card.sampleTrack.title} - ${card.sampleTrack.artist}`
                : 'Evaluasi - Hindia';
            if (st.playingMoodCardId === card.id && isPlayingTitle(targetTitle)) {
                setPlaying(!isPlaying());
            } else {
                st.playingMoodCardId = card.id;
                st.playingPackId = null;
                playTitle(targetTitle);
                say(`Memutar MoodCard "${card.title}" 🎧`);
            }
            renderMoodCards();
            renderSongs();
        }
    });

    $('#plmMoodCardGrid')?.addEventListener('keydown', e => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.id === 'plmAddMoodCardSlot') {
            e.preventDefault();
            openAddMoodCardModal();
        }
    });

    document.addEventListener('click', e => {
        const it = e.target.closest('[data-dd] .dropdown-item');
        if (it) {
            e.preventDefault();
            const dd = it.closest('[data-dd]');
            $$('.dropdown-item', dd).forEach(x => x.classList.toggle('active', x === it));
            const ddLbl = $('.dd-label', dd);
            if (ddLbl) ddLbl.textContent = it.dataset.l;
            st[dd.dataset.dd] = it.dataset.v;
            renderSongs();
        }
    });

    $('#plmLoadMoreBtn')?.addEventListener('click', () => {
        st.showAllSongs = true;
        renderSongs();
    });

    $('#plSearch')?.addEventListener('input', e => {
        st.q = e.target.value;
        st.showAllSongs = false;
        renderSongs();
    });

    $('#searchInput')?.addEventListener('input', () => {
        st.showAllSongs = false;
        renderSongs();
    });

    $('#playAll')?.addEventListener('click', () => {
        const r = rowsEl?.querySelector('.song-row');
        if (!r) return;
        st.playingPackId = null;
        st.playingMoodCardId = null;
        if (r.classList.contains('is-playing')) {
            if (!isPlaying()) setPlaying(true);
        } else {
            playTitle(r.dataset.title, r);
        }
        renderMiniPacks();
        renderMoodCards();
        say('Memutar ' + name);
    });

    $('#shuffleAll')?.addEventListener('click', e => {
        const rows = $$('.song-row', rowsEl);
        if (!rows.length) return;
        e.currentTarget.classList.toggle('is-active');
        const r = rows[Math.floor(Math.random() * rows.length)];
        st.playingPackId = null;
        st.playingMoodCardId = null;
        playTitle(r.dataset.title, r);
        renderMiniPacks();
        renderMoodCards();
    });

    $('#deletePl')?.addEventListener('click', () => {
        openPlmModal('Hapus Playlist?', `
            <p class="small text-white-50 mb-3">Yakin ingin menghapus playlist <b>"${esc(name)}"</b>?</p>
            <div class="d-flex gap-2 justify-content-end">
                <button type="button" class="btn btn-outline-light btn-sm rounded-pill px-3" data-bs-dismiss="modal">Batal</button>
                <button type="button" class="btn btn-pink btn-sm rounded-pill px-3" id="plmConfirmDeletePl">Ya, Hapus</button>
            </div>
        `);
        $('#plmConfirmDeletePl')?.addEventListener('click', () => {
            removePlaylist(name);
            closePlmModal();
            location.href = 'playlist.html';
        });
    });

    // Sinkronkan highlight equalizer & pack saat kontrol player global ditekan
    ['#playBtn', '#prevBtn', '#nextBtn'].forEach(sel => {
        $(sel)?.addEventListener('click', () => {
            setTimeout(() => {
                renderSongs();
                renderMiniPacks();
                renderMoodCards();
            }, 0);
        });
    });

    // Initial render
    syncOfflineBtn();
    renderFilters();
    renderMiniPacks();
    renderSongs();
    renderMoodCards();
})();
