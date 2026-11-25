/* Halaman Playlist (dinamis: playlist.html?nama=Rock%20n%20Roll) */
(() => {
    const { $, $$, say, isPlayingTitle, isPlaying, playTitle, setPlaying, playlists, getSongs, setSongs, removePlaylist, albumCover } = MR;
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
    const name = new URLSearchParams(location.search).get('nama');
    const ADDED = ['Hari ini', 'Hari ini', 'Kemarin', 'Kemarin', '3 hari lalu', 'Minggu lalu', 'Minggu lalu', 'Bulan lalu'];
    const hue = str => [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
    const grad = str => { const h = hue(str); return `linear-gradient(135deg,hsl(${h},55%,62%),hsl(${(h + 50) % 360},50%,32%))`; };
    const secs = d => { const [m, x] = d.split(':'); return +m * 60 + +x; };

    if (!name) {
        $('#plView').classList.add('d-none');
        $('#plExplore').classList.remove('d-none');
        document.title = 'Jelajah Playlist — MoodRoom';

        const exploreData = [
            { name: 'Rock n Roll', genre: 'Rock', mood: 'Semangat', activity: 'Olahraga', desc: 'Gitar keras untuk energi penuh', icon: 'bi-lightning-charge-fill', color: ['#ec6a4c', '#561b39'], cover: 'img/covers/semangat_concert.jpg' },
            { name: 'Dangdut', genre: 'Dangdut', mood: 'Santai', activity: 'Nongkrong', desc: 'Dangdut ceria untuk menemani hari', icon: 'bi-music-note-beamed', color: ['#ef9f5d', '#71314f'], cover: 'img/covers/playlist_dangdut.jpg' },
            { name: 'Pop Indo', genre: 'Pop', mood: 'Santai', activity: 'Perjalanan', desc: 'Lagu pop Indonesia paling disukai', icon: 'bi-stars', color: ['#62a9df', '#4d2d91'], cover: 'img/covers/playlist_pop.jpg' },
            { name: 'Indie Senja', genre: 'Indie', mood: 'Galau', activity: 'Perjalanan', desc: 'Pilihan tenang untuk senja', icon: 'bi-sunset-fill', color: ['#b97491', '#49306f'], cover: 'img/covers/playlist_indie.jpg' },
            { name: 'Jazz Malam', genre: 'Jazz', mood: 'Santai', activity: 'Nugas Malam', desc: 'Saxophone lembut untuk malam', icon: 'bi-disc-fill', color: ['#6870a8', '#2c1d53'], cover: 'img/covers/fokus_jazz.jpg' },
            { name: 'Lo-fi Belajar', genre: 'Lo-fi', mood: 'Fokus', activity: 'Nugas Malam', desc: 'Beat pelan untuk fokus lebih lama', icon: 'bi-headphones', color: ['#6aa7a1', '#37306b'], cover: 'img/covers/fokus_desk.jpg' },
            { name: 'Akustik Santai', genre: 'Pop', mood: 'Santai', activity: 'Nongkrong', desc: 'Petikan akustik yang hangat', icon: 'bi-tree-fill', color: ['#76b57d', '#4a3b72'], cover: 'img/covers/playlist_akustik.jpg' },
            { name: 'Workout Mix', genre: 'Rock', mood: 'Semangat', activity: 'Olahraga', desc: 'Temani olahraga dan deadline', icon: 'bi-fire', color: ['#f07676', '#54295f'], cover: 'img/covers/playlist_workout.jpg' }
        ];

        let exploreGenre = 'Semua';
        const renderExplore = () => {
            const query = ($('#plExploreSearch')?.value || '').trim().toLowerCase();
            const filtered = exploreData.filter(item =>
                (exploreGenre === 'Semua' || item.genre === exploreGenre) &&
                (!query || `${item.name} ${item.genre} ${item.mood} ${item.activity} ${item.desc}`.toLowerCase().includes(query))
            );
            $('#plExploreCount').textContent = `${filtered.length} playlist`;
            $('#plExploreEmpty').classList.toggle('d-none', filtered.length !== 0);
            $('#plExploreGrid').innerHTML = filtered.map(item => `
                <a class="pl-explore-card" href="playlist.html?nama=${encodeURIComponent(item.name)}">
                    <div class="pl-explore-cover" style="background:linear-gradient(160deg,rgba(24,9,43,.08),rgba(24,9,43,.62)),url('${item.cover}') center/cover"></div>
                    <h3 class="text-truncate">${item.name}</h3>
                    <p class="text-truncate">${item.desc}</p>
                    <p class="mt-1"><span class="text-pink">${item.mood}</span> · ${item.genre}</p>
                </a>`).join('');
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

    if (!name || !playlists.includes(name)) {
        $('#plView').classList.add('d-none'); $('#plMissing').classList.remove('d-none');
        document.title = 'Playlist tidak ditemukan — MoodRoom'; return;
    }
    document.title = name + ' — MoodRoom';
    $('#plTitle').textContent = name;
    $('#plDesc').textContent = 'Koleksi lagu ' + name + ' pilihanmu.';
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

    const st = { q: '', sort: 'new' };
    const rowsEl = $('#plRows');

    function render() {
        const all = getSongs(name).map((s, i) => ({ s, i }));
        const q = st.q.trim().toLowerCase(), gq = $('#searchInput').value.trim().toLowerCase();
        const list = all.filter(({ s }) => [q, gq].every(k => !k || (s[0] + ' ' + s[1] + ' ' + s[2]).toLowerCase().includes(k)));
        if (st.sort === 'az') list.sort((a, b) => a.s[0].localeCompare(b.s[0]));
        if (st.sort === 'artist') list.sort((a, b) => a.s[1].localeCompare(b.s[1]));
        if (st.sort === 'dur') list.sort((a, b) => secs(b.s[3]) - secs(a.s[3]));
        $('#plCount').textContent = all.length;
        $('#plMin').textContent = Math.round(all.reduce((t, { s }) => t + secs(s[3]), 0) / 60);
        $('#plHead').classList.toggle('d-none', !all.length);
        $('#plEmpty').classList.toggle('d-none', all.length > 0);
        $('#plNoMatch').classList.toggle('d-none', !(all.length && !list.length));
        $$('#plActions .btn-pink, #shuffleAll').forEach(b => b.disabled = !all.length);
        rowsEl.innerHTML = list.map(({ s, i }, n) => {
            const albumSrc = albumCover(s[2]);
            const covBackground = albumSrc ? `url('${albumSrc}') center/cover` : grad(s[2]);
            return `
      <div class="song-row liked${isPlayingTitle(s[0] + ' - ' + s[1]) ? ' is-playing' : ''}" data-title="${s[0]} - ${s[1]}" tabindex="0" role="button" aria-label="Putar ${s[0]}">
        <div class="c-num"><span class="rownum">${n + 1}</span><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div>
        <div class="c-title d-flex align-items-center gap-3 min-w-0">
          <span class="cov" style="background:${covBackground}"></span>
          <div class="min-w-0"><div class="tt text-truncate">${s[0]}</div><div class="sub text-truncate">${s[1]}</div></div>
        </div>
        <div class="c-album sub text-truncate">${s[2]}</div>
        <div class="c-added sub">${ADDED[i] || 'Lama'}</div>
        <div class="c-heart"><button class="ibtn" data-toggle="bi-heart" aria-label="Suka"><i class="bi bi-heart"></i></button></div>
        <div class="c-dur sub">${s[3]}</div>
        <div class="c-act d-flex justify-content-end">
          <div class="dropdown"><button class="ibtn" data-bs-toggle="dropdown" data-bs-strategy="fixed" aria-label="Menu lagu"><i class="bi bi-three-dots"></i></button>
            <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end"><li><button class="dropdown-item row-act" data-remove="${i}">Hapus dari playlist</button></li><li><button class="dropdown-item row-act">Bagikan</button></li></ul></div>
        </div>
      </div>`;
        }).join('');
        MR.refreshCards();
    }

    document.addEventListener('click', e => {
        const rm = e.target.closest('[data-remove]');
        if (rm) {
            const list = [...getSongs(name)]; const [gone] = list.splice(+rm.dataset.remove, 1);
            setSongs(name, list); render(); say('Dihapus dari ' + name + (gone ? ': ' + gone[0] : ''));
        } else if (e.target.closest('.row-act')) say('Bagikan — segera hadir');
        const it = e.target.closest('[data-dd] .dropdown-item');
        if (it) {
            e.preventDefault();
            const dd = it.closest('[data-dd]');
            $$('.dropdown-item', dd).forEach(x => x.classList.toggle('active', x === it));
            $('.dd-label', dd).textContent = it.dataset.l; st[dd.dataset.dd] = it.dataset.v; render();
        }
    });
    $('#plSearch').addEventListener('input', e => { st.q = e.target.value; render(); });
    $('#searchInput').addEventListener('input', render);
    $('#playAll').addEventListener('click', () => {
        const r = rowsEl.querySelector('.song-row'); if (!r) return;
        if (r.classList.contains('is-playing')) { if (!isPlaying()) setPlaying(true); } else playTitle(r.dataset.title, r);
        say('Memutar ' + name);
    });
    $('#shuffleAll').addEventListener('click', () => {
        const rows = $$('.song-row', rowsEl); if (!rows.length) return;
        const r = rows[Math.floor(Math.random() * rows.length)]; playTitle(r.dataset.title, r);
    });
    $('#deletePl').addEventListener('click', () => {
        if (confirm('Hapus playlist "' + name + '"?')) { removePlaylist(name); location.href = 'index.html'; }
    });
    render();
})();