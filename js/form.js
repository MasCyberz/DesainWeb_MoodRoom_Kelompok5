(() => {
  const { $, $$ } = MR;

  window.MCStep2 = {
    syncForm() {
      const state = MCState.current;
      $('#mcTitleInput').value = state.title;
      $('#mcLyricInput').value = state.lyric;
      $('#mcNoteInput').value = state.note;
      $('#mcLyricCount').textContent = state.lyric.length;
      $('#mcNoteCount').textContent = state.note.length;
      $('#mcCoverPreview').src = state.cover;
      $('#mcMoodRange').value = state.mood;

      const chosenSongs = MCState.CATALOG.filter(s => state.selectedIds.includes(s.id));
      if (!chosenSongs.some(s => s.id === state.featuredSongId) && chosenSongs.length) {
        state.featuredSongId = chosenSongs[0].id;
      }

      const selEl = $('#mcFeaturedSongSelect');
      selEl.innerHTML = chosenSongs.map(s => `<option value="${s.id}" ${s.id === state.featuredSongId ? 'selected' : ''}>${s.title} — ${s.artist}</option>`).join('');

      window.MCStep2.updateLive();
    },

    updateLive() {
      const state = MCState.current;
      const area = $('#mcBannerTextArea');
      area.style.textAlign = state.align;
      area.style.color = state.color;
      area.style.fontFamily = state.font;
      $('#mcTitleInput').style.color = state.color;
      $('#mcTitleInput').style.textAlign = state.align;

      $('#mcLiveNote').textContent = state.note || 'Catatan kurator...';
      $('#mcLiveLyric').textContent = state.lyric ? `“${state.lyric}”` : '“Kutipan lirik...”';

      const song = MCState.CATALOG.find(s => s.id === Number(state.featuredSongId)) || MCState.CATALOG[0];
      $('#mcLiveSong').textContent = `${song.title} — ${song.artist}`;
      $('#mcActiveSongThumb').style.background = song.grad;

      const m = MCState.MOODS[state.mood];
      $('#mcLiveMoodBadge').textContent = `🎵 Mood: ${m.name}`;
      $$('#mcMoodLabels button').forEach((b, i) => b.classList.toggle('on', i === Number(state.mood)));
      $$('#mcAlignGroup .mc-align-btn').forEach(b => b.classList.toggle('active', b.dataset.align === state.align));
      $$('#mcColorGroup .mc-swatch').forEach(sw => sw.classList.toggle('active', sw.dataset.color === state.color));
    }
  };

  document.addEventListener('input', e => {
    if (MCState.current.step !== 2) return;
    const state = MCState.current;
    if (e.target.id === 'mcTitleInput') state.title = e.target.value;
    if (e.target.id === 'mcLyricInput') { state.lyric = e.target.value; $('#mcLyricCount').textContent = state.lyric.length; window.MCStep2.updateLive(); }
    if (e.target.id === 'mcNoteInput') { state.note = e.target.value; $('#mcNoteCount').textContent = state.note.length; window.MCStep2.updateLive(); }
  });

  document.addEventListener('change', e => {
    if (MCState.current.step !== 2) return;
    const state = MCState.current;
    if (e.target.id === 'mcFeaturedSongSelect') { state.featuredSongId = Number(e.target.value); window.MCStep2.updateLive(); }
    if (e.target.id === 'mcFontSelect') { state.font = e.target.value; window.MCStep2.updateLive(); }
  });

  document.addEventListener('click', e => {
    if (MCState.current.step !== 2) return;
    const state = MCState.current;
    const alignBtn = e.target.closest('#mcAlignGroup .mc-align-btn');
    if (alignBtn) { state.align = alignBtn.dataset.align; window.MCStep2.updateLive(); }

    const swatch = e.target.closest('#mcColorGroup .mc-swatch');
    if (swatch) { state.color = swatch.dataset.color; state.colorName = swatch.dataset.cname; window.MCStep2.updateLive(); }

    const moodBtn = e.target.closest('#mcMoodLabels button');
    if (moodBtn) { state.mood = Number(moodBtn.dataset.mi); $('#mcMoodRange').value = state.mood; window.MCStep2.updateLive(); }
  });

  $('#mcMoodRange')?.addEventListener('input', e => {
    if (MCState.current.step === 2) {
      MCState.current.mood = Number(e.target.value);
      window.MCStep2.updateLive();
    }
  });

  $('#mcCoverInput')?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file || MCState.current.step !== 2) return;
    const reader = new FileReader();
    reader.onload = ev => {
      MCState.current.cover = ev.target.result;
      $('#mcCoverPreview').src = MCState.current.cover;
    };
    reader.readAsDataURL(file);
  });
})();
