(() => {
  const $ = selector => document.querySelector(selector);
  const backdrop = document.getElementById('mcBackdrop');

  window.MCController = {
    go(step) {
      MCState.current.step = step;
      const steps = { 1: $('#mcStep1'), 2: $('#mcStep2'), 3: $('#mcStep3'), 5: $('#mcStepCollection') };
      Object.entries(steps).forEach(([k, el]) => el.classList.toggle('d-none', Number(k) !== step));
      $('#mcConfirmOverlay').classList.add('d-none');

      const foot = $('#mcFooter');
      const counter = $('#mcSelectedCounter');
      const actions = $('#mcFooterActions');
      const backBtn = $('#mcBackBtn');
      const modalTitle = $('#mcModalTitle');

      if (step === 1) {
        modalTitle.textContent = 'Pilih Lagu Untuk MoodCard';
        backBtn.classList.remove('d-none');
        foot.classList.remove('d-none');
        counter.textContent = `${MCState.current.selectedIds.length} Lagu Terpilih`;
        actions.innerHTML = `<button type="button" class="btn btn-pink rounded-pill px-4 fw-semibold" id="mcToStep2">Selanjutnya</button>`;
        window.MCStep1.render();
      } else if (step === 2) {
        modalTitle.textContent = 'Atur MoodCard';
        backBtn.classList.remove('d-none');
        foot.classList.remove('d-none');
        counter.textContent = '';
        actions.innerHTML = `
          <button type="button" class="btn btn-outline-light rounded-pill px-4 fw-semibold" id="mcSaveDraftQuick">Simpan Draft</button>
          <button type="button" class="btn btn-pink rounded-pill px-4 fw-semibold" id="mcToStep3">Selanjutnya</button>`;
        window.MCStep2.syncForm();
      } else if (step === 3) {
        modalTitle.textContent = 'Preview MoodCard';
        backBtn.classList.remove('d-none');
        foot.classList.remove('d-none');
        counter.textContent = `${MCState.current.selectedIds.length} Lagu Terpilih`;
        actions.innerHTML = `
          <button type="button" class="btn btn-outline-light rounded-pill px-4 fw-semibold" id="mcDraftBtn">Simpan Draft</button>
          <button type="button" class="btn btn-pink rounded-pill px-4 fw-semibold" id="mcPublishBtn">Terbitkan</button>`;
        window.MCStep3.render();
      } else if (step === 5) {
        modalTitle.textContent = 'MoodCard Saya';
        backBtn.classList.add('d-none');
        foot.classList.add('d-none');
        window.MCCollection.render();
      }
    }
  };

  document.addEventListener('click', e => {
    if (e.target.closest('#openMoodCardModal')) {
      e.preventDefault();
      backdrop.classList.remove('d-none');
      MCState.current.colTab = 'published';
      window.MCController.go(5);
    }

    if (e.target.closest('[data-open-mc-creator]')) {
      Object.assign(MCState.current, {
        editingId: null, selectedIds: [1, 2, 3], title: 'Kita yang Dulu',
        lyric: 'Tentang kita yang pernah tertawa, sebelum waktu membawa kita ke jalan masing-masing',
        note: 'Waktu ternyata cepat banget yaa..', mood: 0, cover: MCState.DEFAULT_COVERS[0]
      });
      backdrop.classList.remove('d-none');
      window.MCController.go(1);
    }

    if (e.target.id === 'mcToStep2') {
      if (!MCState.current.selectedIds.length) { MR.say('Pilih minimal 1 lagu dulu!'); return; }
      window.MCController.go(2); 
    }
    if (e.target.id === 'mcToStep3') window.MCController.go(3); 
    if (e.target.id === 'mcSaveDraftQuick' || e.target.id === 'mcDraftBtn') window.MCStep3.save('draft');
    if (e.target.id === 'mcPublishBtn') window.MCStep3.save('published');

    if (e.target.id === 'mcConfirmPrimaryBtn') {
      MCState.current.colTab = e.target.dataset.targetTab || 'published';
      window.MCController.go(5); 
    }
    if (e.target.id === 'mcConfirmCloseBtn') {
      $('#mcConfirmOverlay').classList.add('d-none');
      backdrop.classList.add('d-none');
    }

    const colTab = e.target.closest('#mcColTabs .mc-chip');
    if (colTab) {
      MCState.current.colTab = colTab.dataset.tab;
      window.MCCollection.render();
    }

    if (e.target.closest('#mcNewBtn')) {
      Object.assign(MCState.current, {
        editingId: null, selectedIds: [1, 2, 3], title: 'Kita yang Dulu',
        lyric: 'Tentang kita yang pernah tertawa, sebelum waktu membawa kita ke jalan masing-masing',
        note: 'Waktu ternyata cepat banget yaa..', mood: 0, cover: MCState.DEFAULT_COVERS[0]
      });
      window.MCController.go(1); 
    }

    const editDraft = e.target.closest('[data-edit-draft]');
    if (editDraft) {
      const cards = MCStore.getCards();
      const item = cards.find(c => c.id === Number(editDraft.dataset.editDraft));
      if (item) {
        Object.assign(MCState.current, item, { editingId: item.id, selectedIds: [...item.songIds] });
        window.MCController.go(2); 
      }
    }

    const viewCard = e.target.closest('[data-view-card]');
    if (viewCard) {
      const cards = MCStore.getCards();
      const item = cards.find(c => c.id === Number(viewCard.dataset.viewCard));
      if (item) {
        Object.assign(MCState.current, item, { selectedIds: [...item.songIds] });
        window.MCController.go(3);
      }
    }

    const delCard = e.target.closest('[data-del-card]');
    if (delCard) {
      let cards = MCStore.getCards();
      cards = cards.filter(c => c.id !== Number(delCard.dataset.delCard));
      MCStore.saveCards(cards);
      window.MCCollection.render();
      MR.say('MoodCard dihapus');
    }

    const shareCard = e.target.closest('[data-share-card]');
    if (shareCard) MR.say('Tautan MoodCard disalin 🔗');
  });

  $('#mcGotoStep1')?.addEventListener('click', () => window.MCController.go(1)); 
  $('#mcGotoStep2')?.addEventListener('click', () => window.MCController.go(2));
  $('#mcEditFromPrev')?.addEventListener('click', () => window.MCController.go(2)); \

  $('#mcBackBtn')?.addEventListener('click', () => {
    const s = MCState.current.step;
    if (s === 1) window.MCController.go(5);
    else if (s === 2) window.MCController.go(1); 
    else if (s === 3) window.MCController.go(2); 
  });

  $('#mcCloseBtn')?.addEventListener('click', () => backdrop.classList.add('d-none'));
  backdrop?.addEventListener('click', e => { if (e.target === backdrop) backdrop.classList.add('d-none'); });
})();
