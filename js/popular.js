/* Halaman Lagu Populer */
(() => {
    const { $, $$, say, restoreMark, isPlayingTitle, isPlaying, playTitle, setPlaying } = MR;
    const SONGS = [
        ['Evaluasi', 'Hindia', 'Menari dengan Bayangan', 'Galau', '3:14', 'id', ['#8a6a40', '#2c1a0c']],
        ['Bergema Sampai Selamanya', 'Nadhif Basalamah', 'Bergema Sampai Selamanya', 'Santai', '3:26', 'id', ['#a8b878', '#3a5a2c']],
        ['Satu Bulan', 'Bernadya', 'Sialnya, Hidup Harus Tetap Berjalan', 'Galau', '3:19', 'id', ['#4a3a38', '#0c0a0c']],
        ['Nina', '.Feast', 'Membangun & Menghancurkan', 'Galau', '4:37', 'id', ['#d4553a', '#5a1a14']],
        ['Secukupnya', 'Hindia', 'Menari dengan Bayangan', 'Semangat', '3:27', 'id', ['#8a6a40', '#2c1a0c']],
        ['Usai', 'Tiara Andini', 'Usai', 'Galau', '3:37', 'id', ['#f4f0f4', '#a8c0e0']],
        ['Peradaban', '.Feast', 'Membangun & Menghancurkan', 'Semangat', '4:02', 'id', ['#d4553a', '#5a1a14']],
        ['Cincin', 'Hindia', 'Menari dengan Bayangan', 'Santai', '3:45', 'id', ['#8a6a40', '#2c1a0c']],
        ['Kata Mereka Ini Berlebihan', 'Bernadya', 'Sialnya, Hidup Harus Tetap Berjalan', 'Fokus', '3:33', 'id', ['#4a3a38', '#0c0a0c']],
        ['Hati-Hati di Jalan', 'Tulus', 'Manusia', 'Santai', '4:12', 'id', ['#6a8ac0', '#1a2a50']],
        ['Blinding Lights', 'The Weeknd', 'After Hours', 'Semangat', '3:20', 'gl', ['#e0405a', '#3a0a1a']],
        ['Espresso', 'Sabrina Carpenter', "Short n' Sweet", 'Fokus', '2:55', 'gl', ['#f0c890', '#a0603a']]
    ];
    const st = { region: 'all', mood: 'all', sort: 'pop', q: '' };
    const rowsEl = $('#popRows');
    const secs = d => { const [m, x] = d.split(':'); return +m * 60 + +x; };

    function renderRows() {
        const q = st.q.trim().toLowerCase(), gq = $('#searchInput').value.trim().toLowerCase();
        const list = SONGS.filter(s =>
            (st.region === 'all' || s[5] === st.region) && (st.mood === 'all' || s[3] === st.mood) &&
            [q, gq].every(k => !k || (s[0] + ' ' + s[1]).toLowerCase().includes(k)));
        if (st.sort === 'az') list.sort((a, b) => a[0].localeCompare(b[0]));
        if (st.sort === 'dur') list.sort((a, b) => secs(b[4]) - secs(a[4]));
        $('#popCount').textContent = list.length;
        $('#popEmpty').classList.toggle('d-none', list.length > 0);
        rowsEl.innerHTML = list.map((s, n) => `
      <div class="song-row${isPlayingTitle(s[0] + ' - ' + s[1]) ? ' is-playing' : ''}" data-title="${s[0]} - ${s[1]}" data-song="${encodeURIComponent(JSON.stringify([s[0], s[1], s[2], s[4]]))}" tabindex="0" role="button" aria-label="Putar ${s[0]}">
        <div class="c-num"><span class="rownum">${String(n + 1).padStart(2, '0')}</span><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div>
        <div class="c-title d-flex align-items-center gap-3 min-w-0">
          <span class="cov" style="background:linear-gradient(135deg,${s[6][0]},${s[6][1]})"></span>
          <div class="min-w-0"><div class="tt text-truncate">${s[0]}</div><div class="sub text-truncate">${s[1]}</div></div>
        </div>
        <div class="c-album sub text-truncate">${s[2]}</div>
        <div class="c-mood sub">${s[3]}</div>
        <div class="c-dur sub">${s[4]}</div>
        <div class="c-act d-flex align-items-center justify-content-end gap-2">
          <button class="ibtn" data-toggle="bi-heart" aria-label="Suka"><i class="bi bi-heart"></i></button>
          <span class="pbadge row-play"><i class="bi bi-play-fill"></i></span>
          <div class="dropdown"><button class="ibtn" data-bs-toggle="dropdown" data-bs-strategy="fixed" aria-label="Menu lagu"><i class="bi bi-three-dots"></i></button>
            <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end"><li><button class="dropdown-item row-act" data-act="add">Tambah ke playlist</button></li><li><button class="dropdown-item row-act">Bagikan</button></li></ul></div>
        </div>
      </div>`).join('');
        MR.refreshCards();
    }

    $('#popChips').addEventListener('click', e => {
        const b = e.target.closest('.pop-chip'); if (!b) return;
        $$('.pop-chip').forEach(x => { x.classList.toggle('active', x === b); x.setAttribute('aria-selected', String(x === b)); });
        st.region = b.dataset.r; renderRows();
    });
    document.addEventListener('click', e => {
        const it = e.target.closest('[data-dd] .dropdown-item');
        if (it) {
            e.preventDefault();
            const dd = it.closest('[data-dd]');
            $$('.dropdown-item', dd).forEach(x => x.classList.toggle('active', x === it));
            $('.dd-label', dd).textContent = it.dataset.l;
            st[dd.dataset.dd] = it.dataset.v;
            if (dd.dataset.dd === 'period') say('Menampilkan: ' + it.dataset.l);
            renderRows();
        }
        const act = e.target.closest('.row-act');
        if (act) { if (act.dataset.act === 'add') MR.addToPlaylist(JSON.parse(decodeURIComponent(act.closest('.song-row').dataset.song))); else say(act.textContent.trim() + ' — segera hadir'); }
    });
    $('#popSearch').addEventListener('input', e => { st.q = e.target.value; renderRows(); });
    $('#searchInput').addEventListener('input', renderRows);
    $('#playAll').addEventListener('click', () => {
        const r = rowsEl.querySelector('.song-row'); if (!r) return;
        if (r.classList.contains('is-playing')) { if (!isPlaying()) setPlaying(true); } else playTitle(r.dataset.title, r);
        say('Memutar semua lagu');
    });
    renderRows();
})();