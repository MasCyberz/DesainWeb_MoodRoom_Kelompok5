(() => {
  const { $, $$ } = MR;

  window.MCCollection = {
    render() {
      const state = MCState.current;
      $$('#mcColTabs .mc-chip').forEach(c => c.classList.toggle('active', c.dataset.tab === state.colTab));
      const cards = MCStore.getCards();
      const list = cards.filter(c => c.status === state.colTab);
      const box = $('#mcCollectionList');

      if (!list.length) {
        box.innerHTML = `<p class="text-center text-white-50 py-4 mb-0">Belum ada MoodCard di tab ${state.colTab === 'published' ? 'Dipublikasikan' : 'Draft'}.</p>`;
        return;
      }

      box.innerHTML = list.map(c => `
        <div class="mc-collection-item" data-card-id="${c.id}">
          <div class="mc-collection-thumb" style="background-image:url('${c.cover}')"></div>
          <div class="min-w-0 flex-grow-1">
            <div class="fw-bold fs-6 text-truncate">${c.title}</div>
            <div class="small text-white-50">${c.songCount} lagu · ${c.date}</div>
            ${c.status === 'published' ? `<div class="small text-white-50 mt-1"><i class="bi bi-globe2 me-1"></i>Dipublikasikan</div>` : ''}
          </div>
          <div class="d-flex align-items-center gap-2">
            ${c.status === 'published' ? `
              <button type="button" class="btn btn-pink btn-sm rounded-pill px-3 fw-semibold" data-view-card="${c.id}">Lihat MoodCard</button>
              <button type="button" class="mc-circle-icon-btn" data-share-card="${c.id}" title="Bagikan"><i class="bi bi-share"></i></button>
              <button type="button" class="mc-circle-icon-btn" data-del-card="${c.id}" title="Hapus"><i class="bi bi-trash"></i></button>
            ` : `
              <button type="button" class="btn btn-pink btn-sm rounded-pill px-3 fw-semibold" data-edit-draft="${c.id}">Lanjutkan Edit</button>
              <button type="button" class="mc-circle-icon-btn" data-del-card="${c.id}" title="Hapus Draft"><i class="bi bi-trash"></i></button>
            `}
          </div>
        </div>`).join('');
    }
  };
})();
