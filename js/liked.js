/* Halaman Lagu Disukai */
(() => {
    const { $, $$, say, store, isPlayingTitle, isPlaying, playTitle, setPlaying } = MR;
    const DEFAULT = [
        ['Evaluasi', 'Hindia', 'Menari Dengan Bayangan', 'Hari ini', '3:31', ['#8a6a40', '#2c1a0c']],
        ['Secukupnya', 'Hindia', 'Menari Dengan Bayangan', 'Hari ini', '3:25', ['#8a6a40', '#2c1a0c']],
        ['Rehat', 'Kunto Aji', 'Mantra Mantra', 'Kemarin', '5:28', ['#d8dcc0', '#6a7a50']],
        ['Pilu Membiru', 'Kunto Aji', 'Mantra Mantra', 'Kemarin', '4:11', ['#d8dcc0', '#6a7a50']],
        ['Runtuh', 'Feby Putri, Fiersa Besari', 'Runtuh', '22 Okt 2026', '3:43', ['#4a7a9a', '#14304a']],
        ['Bertaut', 'Nadin Amizah', 'Selamat Ulang Tahun', '21 Okt 2026', '5:15', ['#f4e8e0', '#c04a5a']],
        ['Hati-Hati di Jalan', 'Tulus', 'Manusia', '20 Okt 2026', '4:02', ['#e8e8e8', '#202020']],
        ['Rumah ke Rumah', 'Hindia', 'Menari Dengan Bayangan', '18 Okt 2026', '4:37', ['#8a6a40', '#2c1a0c']]
    ];
    let liked = store.get('mr-liked', null) || DEFAULT;
    const st = { q: '', sort: 'new' };
    const rowsEl = $('#likedRows');
    const secs = d => { const [m, x] = d.split(':'); return +m * 60 + +x; };

    const visible = () => {
        const q = st.q.trim().toLowerCase(), gq = $('#searchInput').value.trim().toLowerCase();
        const list = liked.filter(s => [q, gq].every(k => !k || (s[0] + ' ' + s[1] + ' ' + s[2]).toLowerCase().includes(k)));
        if (st.sort === 'az') list.sort((a, b) => a[0].localeCompare(b[0]));
        if (st.sort === 'artist') list.sort((a, b) => a[1].localeCompare(b[1]));
        if (st.sort === 'dur') list.sort((a, b) => secs(b[4]) - secs(a[4]));
        return list;
    };
    function render() {
        const list = visible();
        $('#likedCount').textContent = liked.length;
        $('#likedMin').textContent = Math.round(liked.reduce((t, s) => t + secs(s[4]), 0) / 60);
        $('#likedEmpty').classList.toggle('d-none', list.length > 0);
        $('#likedEmpty').textContent = liked.length ? 'Tidak ada lagu yang cocok.' : 'Belum ada lagu yang kamu sukai.';
        rowsEl.innerHTML = list.map((s, n) => `
      <div class="song-row liked${isPlayingTitle(s[0] + ' - ' + s[1]) ? ' is-playing' : ''}" data-title="${s[0]} - ${s[1]}" data-song="${encodeURIComponent(JSON.stringify([s[0], s[1], s[2], s[4]]))}" tabindex="0" role="button" aria-label="Putar ${s[0]}">
        <div class="c-num"><span class="rownum">${n + 1}</span><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div>
        <div class="c-title d-flex align-items-center gap-3 min-w-0">
          <span class="cov" style="background:linear-gradient(135deg,${s[5][0]},${s[5][1]})"></span>
          <div class="min-w-0"><div class="tt text-truncate">${s[0]}</div><div class="sub text-truncate">${s[1]}</div></div>
        </div>
        <div class="c-album sub text-truncate">${s[2]}</div>
        <div class="c-added sub">${s[3]}</div>
        <div class="c-heart"><button class="ibtn like-on" data-unlike="${s[0]}" aria-label="Hapus dari Lagu disukai" title="Hapus dari Lagu disukai"><i class="bi bi-heart-fill"></i></button></div>
        <div class="c-dur sub">${s[4]}</div>
        <div class="c-act d-flex justify-content-end">
          <div class="dropdown"><button class="ibtn" data-bs-toggle="dropdown" data-bs-strategy="fixed" aria-label="Menu lagu"><i class="bi bi-three-dots"></i></button>
            <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end"><li><button class="dropdown-item row-act" data-act="add">Tambah ke playlist</button></li><li><button class="dropdown-item row-act">Bagikan</button></li></ul></div>
        </div>
      </div>`).join('');
        MR.refreshCards();
    }

    document.addEventListener('click', e => {
        const u = e.target.closest('[data-unlike]');
        if (u) {
            liked = liked.filter(s => s[0] !== u.dataset.unlike); store.set('mr-liked', liked);
            render(); say('Dihapus dari Lagu disukai');
        }
        const it = e.target.closest('[data-dd] .dropdown-item');
        if (it) {
            e.preventDefault();
            const dd = it.closest('[data-dd]');
            $$('.dropdown-item', dd).forEach(x => x.classList.toggle('active', x === it));
            $('.dd-label', dd).textContent = it.dataset.l;
            st[dd.dataset.dd] = it.dataset.v; render();
        }
        const act = e.target.closest('.row-act');
        if (act) { if (act.dataset.act === 'add') MR.addToPlaylist(JSON.parse(decodeURIComponent(act.closest('.song-row').dataset.song))); else say(act.textContent.trim() + ' — segera hadir'); }
    });
    $('#likedSearch').addEventListener('input', e => { st.q = e.target.value; render(); });
    $('#searchInput').addEventListener('input', render);

    $('#playAll').addEventListener('click', () => {
        const r = rowsEl.querySelector('.song-row'); if (!r) return;
        if (r.classList.contains('is-playing')) { if (!isPlaying()) setPlaying(true); } else playTitle(r.dataset.title, r);
        say('Memutar semua lagu');
    });
    $('#shuffleAll').addEventListener('click', () => {
        const rows = $$('.song-row', rowsEl); if (!rows.length) return;
        const r = rows[Math.floor(Math.random() * rows.length)];
        playTitle(r.dataset.title, r); say('Acak lagu disukai 🔀');
    });
    $('#downloadAll').addEventListener('click', () => say('Unduhan segera hadir'));
    render();
})();