/* Halaman Beranda */
(() => {
  const { $, $$, say, restoreMark } = MR;
  const EQ = '<span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
  const cards = Array(3).fill({ title: 'Usia-Usia Dewasa Lomba Sihir', text: '“Dengerin pas jam 1 malam revisi belum kelar...”', by: '@senja_manis' });
  const songs = Array(4).fill({ title: 'Evaluasi - Hindia' });
  const albums = Array(4).fill({ title: 'Menari Dengan....', sub: 'Melody' });
  const moods = [['', 'Galau'], ['Santai dulu, minum kopi ☕', 'Santai'], ['Waktunya fokus 🎧', 'Fokus'], ['Gas terus, semangat! 🔥', 'Semangat']];
  moods[0][0] = 'Lagi galau? Kami temenin ya 🥺';

  $('#cardList').innerHTML = cards.map(c => `
    <div class="col-12 col-md-6 col-xl-4 item" data-type="card"><article class="mcard">
      <h3><i class="bi bi-music-note-list text-pink me-1"></i>${c.title}${EQ.replace('class="eq"', 'class="eq ms-auto"')}</h3>
      <p>${c.text}</p><small>Dibuat oleh: <b>${c.by}</b></small>
      <div class="d-flex align-items-center mt-auto">
        <button class="btn btn-pink btn-sm fw-semibold py-0 px-2 rounded-1 play-card"><i class="bi bi-play-fill"></i> Play</button>
        <span class="ms-auto"><button class="ibtn" data-toggle="bi-bookmark" aria-label="Simpan"><i class="bi bi-bookmark"></i></button><button class="ibtn" data-toggle="bi-heart" aria-label="Suka"><i class="bi bi-heart"></i></button></span>
      </div></article></div>`).join('');
  $('#songList').innerHTML = songs.map(s => `
    <div class="col-12 col-md-6 item" data-type="song"><div class="track" tabindex="0" role="button" data-title="${s.title}">
      <span class="cover xs"></span><span class="t">${s.title}</span>${EQ}<span class="pbadge"><i class="bi bi-play-fill"></i></span></div></div>`).join('');
  $('#albumList').innerHTML = albums.map(a => `
    <div class="col-6 col-md-3 item" data-type="album"><div class="album" tabindex="0" role="button" data-title="${a.title}">
      ${EQ.replace('class="eq"', 'class="eq album-eq"')}<div class="cap"><span><b>${a.title}</b>${a.sub}</span><span class="pbadge sm"><i class="bi bi-play-fill"></i></span></div></div></div>`).join('');

  // Mood slider
  const range = $('#moodRange');
  const setMood = i => {
    range.value = i;
    $('#moodQ').textContent = i == 0 ? 'Apa yang lagi kamu rasain saat ini?' : moods[i][0];
    $$('#moodLabels button').forEach((b, k) => b.classList.toggle('on', k == i));
    if (i > 0) say('Mood: ' + moods[i][1]);
  };
  range.addEventListener('input', () => setMood(+range.value));
  $$('#moodLabels button').forEach(b => b.addEventListener('click', () => setMood(+b.dataset.i)));

  // Search + filter
  let filter = 'all';
  const applyFilter = () => {
    const q = $('#searchInput').value.trim().toLowerCase();
    let shown = 0;
    $$('.item').forEach(el => {
      const ok = (filter === 'all' || el.dataset.type === filter) && el.textContent.toLowerCase().includes(q);
      el.classList.toggle('d-none', !ok); if (ok) shown++;
    });
    ['Card', 'Song', 'Album'].forEach(n => {
      const sec = $('#sec' + n);
      sec.classList.toggle('d-none', !$$('.item', sec).some(i => !i.classList.contains('d-none')));
    });
    $('#noResult').classList.toggle('d-none', shown > 0);
  };
  $('#searchInput').addEventListener('input', applyFilter);
  document.addEventListener('mr:filter', e => { filter = e.detail; applyFilter(); });

  restoreMark();
})();