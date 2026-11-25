(() => {
  const { $ } = MR;
  window.MCStep1 = {
    render() {
      const state = MCState.current;
      const q = state.search.toLowerCase();
      const filtered = MCState.CATALOG.filter(s =>
        (state.genre === 'Semua' || s.genre === state.genre) &&
        (!q || s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q))
      );

      $('#mcSongList').innerHTML = filtered.map((s, idx) => {
        const sel = state.selectedIds.includes(s.id);
        return `
          <div class="mc-song-item ${sel ? 'selected' : ''}" data-song-id="${s.id}">
            <span class="mc-song-num">${String(idx + 1).padStart(2, '0')}</span>
            <span class="mc-song-cov" style="background:${s.cover ? `url('${s.cover}') center/cover` : s.grad}"></span>
            <div class="min-w-0 flex-grow-1">
              <div class="fw-bold small text-truncate">${s.title}</div>
              <div class="text-white-50" style="font-size:.75rem">${s.artist}</div>
            </div>
            <span class="small text-white-50 me-2">${s.dur}</span>
            <span class="mc-check-btn"><i class="bi ${sel ? 'bi-check-lg' : 'bi-plus-lg'}"></i></span>
          </div>`;
      }).join('');
      $('#mcSelectedCounter').textContent = `${state.selectedIds.length} Lagu Terpilih`;
    }
  };

  document.addEventListener('click', e => {
    const item = e.target.closest('.mc-song-item');
    if (item && MCState.current.step === 1) {
      const id = Number(item.dataset.songId);
      const state = MCState.current;
      if (state.selectedIds.includes(id)) state.selectedIds = state.selectedIds.filter(x => x !== id);
      else state.selectedIds.push(id);
      window.MCStep1.render();
    }

    const gChip = e.target.closest('#mcGenreChips .mc-chip');
    if (gChip && MCState.current.step === 1) {
      document.querySelectorAll('#mcGenreChips .mc-chip').forEach(c => c.classList.remove('active'));
      gChip.classList.add('active');
      MCState.current.genre = gChip.dataset.genre;
      window.MCStep1.render();
    }
  });

  $('#mcSongSearch')?.addEventListener('input', e => {
    if (MCState.current.step === 1) {
      MCState.current.search = e.target.value;
      window.MCStep1.render();
    }
  });
})();
