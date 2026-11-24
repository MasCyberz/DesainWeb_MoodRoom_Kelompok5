window.MCState = {
  CATALOG: [
    { id: 1, title: 'Ribuan Memori', artist: 'Lomba Sihir', genre: 'Indie', dur: '4:14', grad: 'linear-gradient(135deg,#e2b068,#4a2e16)' },
    { id: 2, title: 'Bergema Sampai Selamanya', artist: 'Nadhif Basalamah', genre: 'Pop', dur: '3:26', grad: 'linear-gradient(135deg,#a8b878,#3a5a2c)' },
    { id: 3, title: 'Satu Bulan', artist: 'Bernadya', genre: 'Pop', dur: '3:19', grad: 'linear-gradient(135deg,#5a4642,#161014)' },
    { id: 4, title: 'Nina', artist: '.Feast', genre: 'Rock', dur: '4:37', grad: 'linear-gradient(135deg,#d4553a,#5a1a14)' },
    { id: 5, title: 'Secukupnya', artist: 'Hindia', genre: 'Indie', dur: '3:27', grad: 'linear-gradient(135deg,#8a6a40,#2c1a0c)' },
    { id: 6, title: 'Usai', artist: 'Tiara Andini', genre: 'Pop', dur: '3:37', grad: 'linear-gradient(135deg,#e0c8e8,#786098)' },
    { id: 7, title: 'Untuk Perempuan yang Sedang Dalam Pelukan', artist: 'Payung Teduh', genre: 'Indie', dur: '5:43', grad: 'linear-gradient(135deg,#4f7a58,#182e1e)' },
    { id: 8, title: 'Sial', artist: 'Mahalini', genre: 'R&B', dur: '4:03', grad: 'linear-gradient(135deg,#a85590,#381430)' }
  ],
  MOODS: [
    { name: 'Galau', emoji: '🥺' },
    { name: 'Santai', emoji: '☕' },
    { name: 'Fokus', emoji: '🎧' },
    { name: 'Semangat', emoji: '🔥' }
  ],
  DEFAULT_COVERS: [
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80'
  ],
  current: {
    step: 5,
    editingId: null,
    selectedIds: [1, 2, 3],
    genre: 'Semua',
    search: '',
    colTab: 'published',
    title: 'Kita yang Dulu',
    lyric: 'Tentang kita yang pernah tertawa, sebelum waktu membawa kita ke jalan masing-masing',
    note: 'Waktu ternyata cepat banget yaa..',
    featuredSongId: 1,
    mood: 0,
    align: 'left',
    color: '#ffffff',
    colorName: 'Putih',
    font: 'Montserrat',
    fontSize: '1.15rem',
    cover: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=400&q=80'
  }
};

window.MCStore = {
  getCards() {
    const DEFAULT_CARDS = [
      { id: 101, status: 'published', title: 'Hal-Hal Kecil', songCount: 3, date: '20 Okt 2026, 23:15', cover: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=400&q=80', mood: 0, lyric: 'Tentang kita yang pernah tertawa...', note: 'Waktu cepat banget...', featuredSongId: 1, songIds: [1, 2, 3], align: 'left', color: '#ffffff', colorName: 'Putih', font: 'Montserrat', fontSize: '1.15rem' },
      { id: 201, status: 'draft', title: 'Kita yang Dulu', songCount: 3, date: '20 Okt 2026, 23:15', cover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80', mood: 0, lyric: 'Tentang kita yang pernah tertawa...', note: 'Waktu cepat banget...', featuredSongId: 1, songIds: [1, 2, 3], align: 'left', color: '#ffffff', colorName: 'Putih', font: 'Montserrat', fontSize: '1.15rem' }
    ];
    return MR.store.get('mr-moodcards', DEFAULT_CARDS);
  },
  saveCards(cards) {
    MR.store.set('mr-moodcards', cards);
  }
};
