(() => {
  const { $ } = MR;

  window.MCStep3 = {
    render() {
      const state = MCState.current;
      const song = MCState.CATALOG.find(s => s.id === Number(state.featuredSongId)) || MCState.CATALOG[0];
      const m = MCState.MOODS[state.mood];
      const alignLabel = { left: 'Kiri', center: 'Tengah', right: 'Kanan' }[state.align];

      const card = $('#mcFinalCard');
      card.style.textAlign = state.align;
      card.style.color = state.color;
      card.style.fontFamily = state.font;

      $('#mcFinalBg').style.backgroundImage = `url('${state.cover}')`;
      $('#mcPrevMood').textContent = `Mood: ${m.name} ${m.emoji}`;
      $('#mcPrevLyric').textContent = `"${state.lyric}"`;
      $('#mcPrevLyric').style.fontSize = state.fontSize;
      $('#mcPrevSongCov').style.background = song.grad;
      $('#mcPrevSongTitle').textContent = song.title;
      $('#mcPrevSongArtist').textContent = song.artist;
      $('#mcPrevNote').textContent = state.note;

      $('#mcPrevSongCount').textContent = state.selectedIds.length;
      $('#mcSetMood').textContent = m.name;
      $('#mcSetAlign').textContent = alignLabel;
      $('#mcSetColorDot').style.background = state.color;
      $('#mcSetColorName').textContent = state.colorName;
      $('#mcSetFont').textContent = state.font;
      $('#mcSetLyricShort').textContent = state.lyric;
    },

    save(status) {
      const state = MCState.current;
      const cards = MCStore.getCards();
      const nowFormatted = () => {
        const d = new Date();
        const bln = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'][d.getMonth()];
        return `${d.getDate()} ${bln} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      };

      const entry = {
        id: state.editingId || Date.now(),
        status,
        title: state.title.trim() || 'Tanpa Judul',
        songCount: state.selectedIds.length,
        date: nowFormatted(),
        cover: state.cover,
        mood: state.mood,
        lyric: state.lyric,
        note: state.note,
        featuredSongId: state.featuredSongId,
        songIds: [...state.selectedIds],
        align: state.align,
        color: state.color,
        colorName: state.colorName,
        font: state.font,
        fontSize: state.fontSize
      };

      const idx = cards.findIndex(c => c.id === entry.id);
      if (idx > -1) cards[idx] = entry;
      else cards.unshift(entry);

      MCStore.saveCards(cards);
      state.editingId = null;

      const isPub = status === 'published';
      $('#mcConfirmTitle').textContent = isPub ? 'MoodCard Berhasil diterbitkan!' : 'Draft berhasil disimpan!';
      $('#mcConfirmDesc').textContent = isPub
        ? 'MoodCard kamu sudah terbit dan bisa dilihat di menu MoodCard Saya.'
        : 'Kamu bisa melanjutkan edit kapan saja di menu MoodCard Saya.';
      $('#mcConfirmPrimaryBtn').textContent = isPub ? 'Lihat MoodCard' : 'Lihat Draft';
      $('#mcConfirmPrimaryBtn').dataset.targetTab = status;
      $('#mcConfirmOverlay').classList.remove('d-none');
    }
  };

  document.addEventListener('change', e => {
    if (e.target.id === 'mcFontSizeSelect' && MCState.current.step === 3) {
      MCState.current.fontSize = e.target.value;
      window.MCStep3.render();
    }
  });
})();
