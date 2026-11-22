/* Interaksi halaman Sirkel */
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const views = {
    discover: $('#sirkelDiscover'),
    mine: $('#sirkelMine'),
    room: $('#sirkelRoom'),
    choose: $('#sirkelChoose')
  };
  let activeRoomFilter = 'all';
  const show = (name) => {
    Object.entries(views).forEach(([key, el]) => el.classList.toggle('d-none', key !== name));
    const tabs = $('.sirkel-tabs'); if (tabs) tabs.classList.add('d-none');
    const layout = document.querySelector('.layout');
    if (layout) {
      layout.classList.toggle('sirkel-choose-layout', name === 'choose');
      layout.classList.toggle('sirkel-private-layout', name === 'mine');
      layout.classList.toggle('sirkel-room-layout', name === 'room');
    }
    const main = document.querySelector('.sirkel-main');
    if (main) {
      main.classList.toggle('sirkel-choose-main', name === 'choose');
      main.classList.toggle('sirkel-private-main', name === 'mine');
      main.classList.toggle('sirkel-room-main', name === 'room');
    }
    const pageTopline = $('.sirkel-topline');
    if (pageTopline) pageTopline.classList.toggle('d-none', name === 'mine' || name === 'choose' || name === 'room');
    const privateGuide = $('#privateGuidePanel');
    if (privateGuide) privateGuide.classList.toggle('is-visible', name === 'mine');
    const chatRail = $('.target-live-room-side');
    if (chatRail) chatRail.classList.toggle('is-hidden-for-private', name === 'mine' || name === 'room');
    $$('.sirkel-tab').forEach(b => b.classList.toggle('active', b.dataset.sirkelView === name));
    if (name === 'room') $('.sirkel-page-title').textContent = 'Sirkel';
    else $('.sirkel-page-title').textContent = name === 'mine' ? 'Sirkel Sendiri' : name === 'choose' ? 'Sirkel' : 'Sirkel Kita';
    const subtitle = $('.sirkel-subtitle');
    if (subtitle) subtitle.textContent = name === 'choose'
      ? 'Mau dengar bareng siapa hari ini? Pilih sirkel yang pas buat kamu.'
      : name === 'mine' ? 'Buat ruang privat atau gabung ke ruang temanmu.'
      : name === 'room' ? 'Nikmati musik dan obrolan bersama anggota sirkel.'
      : 'Satu siaran, banyak cerita. Temukan host dan ikut nongkrong lewat musik.';
  };
  const openRoom = (name) => {
    const room = name || 'Kost Mamang';
    $('#roomName').textContent = room;
    const code = room === 'Pulang Bareng' ? '#PULANG-PELAN' : '#KOST-MAMANG';
    const codeLabel = $('#roomCodeLabel');
    if (codeLabel) codeLabel.textContent = code;
    const meta = $('#roomMemberMeta');
    if (meta) meta.textContent = room === 'Pulang Bareng' ? '3 Member' : '4 Member';
    show('room');
    window.scrollTo({top:0,behavior:'smooth'});
  };
  document.addEventListener('click', e => {
    const switchRoom = e.target.closest('[data-room-filter="switch"]');
    if (switchRoom) { show('choose'); return; }
    const nav = e.target.closest('[data-sirkel-view]');
    if (nav) { e.preventDefault(); show(nav.dataset.sirkelView); }
    const join = e.target.closest('.join-public');
    if (join) openRoom(join.dataset.room);
    const own = e.target.closest('.open-room');
    if (own) openRoom(own.dataset.room);
  });
  const applyRoomFilters = () => {
    const q = $('#sirkelSearch').value.trim().toLowerCase();
    let count = 0;
    $$('.public-room-wrap').forEach(card => {
      const textMatch = (card.dataset.roomSearch || card.textContent).toLowerCase().includes(q);
      const categories = (card.dataset.roomCategory || '').toLowerCase().split(/\\s+/);
      const categoryMatch = activeRoomFilter === 'all' || categories.includes(activeRoomFilter);
      const visible = textMatch && categoryMatch;
      card.classList.toggle('d-none', !visible);
      if (visible) count++;
    });
    $('#sirkelNoResult').classList.toggle('d-none', count > 0);
  };
  $('#sirkelSearch').addEventListener('input', applyRoomFilters);
  $$('.room-filter').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.roomFilter === 'switch') { show('choose'); return; }
    activeRoomFilter = button.dataset.roomFilter;
    $$('.room-filter').forEach(item => item.classList.toggle('active', item === button));
    applyRoomFilters();
  }));
  const sendLiveMessage = () => {
    const input = $('#liveMessageInput');
    const value = input.value.trim();
    if (!value) return;
    const item = document.createElement('div');
    item.className = 'target-chat-message';
    const avatar = document.createElement('span');
    avatar.className = 'target-chat-avatar';
    avatar.textContent = 'DI';
    const body = document.createElement('div');
    const name = document.createElement('small');
    name.textContent = '@dimas';
    const message = document.createElement('p');
    message.textContent = value;
    body.append(name, message);
    item.append(avatar, body);
    $('#liveChatMessages').append(item);
    input.value = '';
    $('#liveChatMessages').scrollTop = $('#liveChatMessages').scrollHeight;
  };
  $('#sendLiveMessage').addEventListener('click', sendLiveMessage);
  $('#joinBtn').addEventListener('click', () => {
    const input = $('#liveMessageInput');
    const send = $('#sendLiveMessage');
    input.disabled = false; send.disabled = false;
    input.placeholder = 'Kirim pesan ke room...';
    MR.say('Kamu sudah bergabung. Selamat nongkrong! 🎧');
  });
  $('#liveMessageInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendLiveMessage();
  });
  $('#createRoomBtn').addEventListener('click', () => {
    const name = prompt('Masukkan nama sirkel baru:');
    if (!name || !name.trim()) return;
    $('#roomName').textContent = name.trim();
    $('#chatMessages').innerHTML = '<div class="chat-msg"><b>@dimas</b><p>Room baru berhasil dibuat. Ajak temanmu bergabung! ✨</p><small>Baru saja</small></div>';
    openRoom(name.trim());
  });
  $('#sharePrivate').addEventListener('click', async () => {
    const code = 'https://moodroom.local/sirkel.html?room=KOST-MAMANG';
    try { await navigator.clipboard.writeText(code); MR.say('Link room berhasil disalin'); }
    catch { MR.say('Kode room: KOST-MAMANG'); }
  });
  const copyPrivateCode = async (code, message) => {
    try { await navigator.clipboard.writeText(code); MR.say(message); }
    catch { MR.say(`Kode room: ${code}`); }
  };
  $('#copyOwnRoom').addEventListener('click', () => copyPrivateCode('KOST-MAMANG', 'Kode #KOST-MAMANG berhasil disalin'));
  $('#copyFriendRoom').addEventListener('click', () => copyPrivateCode('PULANG-PELAN', 'Kode #PULANG-PELAN berhasil disalin'));
  $('#shareFriendRoom').addEventListener('click', () => copyPrivateCode('https://moodroom.local/sirkel.html?room=PULANG-PELAN', 'Link Pulang Bareng berhasil disalin'));
  $('#manageRoom').addEventListener('click', () => MR.say('Pengaturan room Kost Mamang akan dibuka di halaman room.'));
  $('#copyRoomCode').addEventListener('click', async () => {
    const code = ($('#roomCodeLabel')?.textContent || '#KOST-MAMANG').replace('#','');
    try { await navigator.clipboard.writeText(code); MR.say(`Kode ${code} disalin`); }
    catch { MR.say(`Kode room: ${code}`); }
  });
  $('#joinByCode').addEventListener('click', () => {
    const code = $('#roomCode').value.trim();
    if (!code) { MR.say('Masukkan kode room terlebih dahulu'); return; }
    const normalized = code.toUpperCase().replace('#','');
    if (normalized === 'KOST-MAMANG' || normalized === 'MASUK-KODE') {
      openRoom('Kost Mamang'); MR.say('Berhasil masuk ke room');
    } else if (normalized === 'PULANG-PELAN') {
      openRoom('Pulang Bareng'); MR.say('Berhasil masuk ke room Pulang Bareng');
    } else MR.say('Kode room tidak ditemukan');
  });
  $('#backSirkel').addEventListener('click', () => show('discover'));
  $('#leaveRoom').addEventListener('click', () => { show('mine'); MR.say('Kamu keluar dari room'); });
  $('#roomPlay').addEventListener('click', () => {
    const button = $('#roomPlay');
    const paused = button.dataset.paused !== 'true';
    button.dataset.paused = String(paused);
    button.innerHTML = paused ? '<i class="bi bi-play-fill"></i> Putar' : '<i class="bi bi-pause-fill"></i> Jeda';
    MR.say(paused ? 'Musik dijeda untuk semua anggota' : 'Musik diputar bersama anggota room 🎶');
  });
  $('#roomNext').addEventListener('click', () => {
    const title = $('#roomTrackTitle');
    title.textContent = title.textContent === 'Evaluasi' ? 'Rehat' : 'Evaluasi';
    $('#roomTrackArtist').textContent = title.textContent === 'Rehat' ? 'Kunto Aji' : 'Hindia';
    MR.say(`Memutar lagu ${title.textContent} berikutnya`);
  });
  $('#roomMembersBtn').addEventListener('click', () => MR.say('Anggota room: Dimas, Andi, Rina, dan Budi'));
  $('#roomSettingsBtn').addEventListener('click', () => MR.say('Pengaturan room privat dibuka'));
  $('#shareRoomLink').addEventListener('click', async () => {
    const code = ($('#roomCodeLabel')?.textContent || '#KOST-MAMANG').replace('#','');
    const link = `https://moodroom.local/sirkel.html?room=${code}`;
    try { await navigator.clipboard.writeText(link); MR.say('Link room berhasil disalin'); }
    catch { MR.say(`Bagikan link room ${$('#roomName').textContent} kepada temanmu`); }
  });
  $('#requestSongBtn').addEventListener('click', () => {
    const song = window.prompt('Masukkan judul lagu yang ingin diajukan:');
    if (!song || !song.trim()) return;
    const row = document.createElement('div');
    row.className = 'room-request-row';
    row.dataset.song = song.trim();
    row.innerHTML = '<span class="room-request-avatar purple">DI</span><div class="room-request-song"><b></b><span>Diajukan @dimas · Baru saja</span></div><div class="room-request-status waiting"><i class="bi bi-clock"></i> Menunggu</div><div class="room-request-actions"><button type="button" class="btn btn-pink btn-xs queue-accept">Terima</button><button type="button" class="btn btn-outline-pink btn-xs queue-reject">Tolak</button></div>';
    row.querySelector('.room-request-song b').textContent = song.trim();
    $('#roomRequestList').append(row);
    updateQueueCounts();
    MR.say('Lagu berhasil diajukan ke pemilik room');
  });
  const updateQueueCounts = () => {
    const rows = [...$('#roomRequestList').querySelectorAll('.room-request-row')];
    const accepted = rows.filter(row => row.querySelector('.room-request-status')?.classList.contains('accepted')).length;
    const playing = rows.filter(row => row.querySelector('.room-request-status')?.textContent.includes('Giliran')).length;
    $('#queuePlayingCount').textContent = `${playing || 1} diputar`;
    $('#queueAcceptedCount').textContent = `${accepted} diterima`;
  };
  $('#roomRequestList').addEventListener('click', e => {
    const row = e.target.closest('.room-request-row');
    if (!row) return;
    if (e.target.closest('.queue-accept')) {
      const status = row.querySelector('.room-request-status');
      status.className = 'room-request-status accepted';
      status.innerHTML = '<i class="bi bi-check-circle"></i> Diterima · Berikutnya';
      row.querySelector('.room-request-actions').innerHTML = '<button type="button" class="btn btn-pink btn-xs queue-advance">Majukan</button>';
      updateQueueCounts();
      MR.say('Pengajuan lagu diterima');
    } else if (e.target.closest('.queue-reject')) {
      row.remove(); updateQueueCounts(); MR.say('Pengajuan lagu ditolak');
    } else if (e.target.closest('.queue-advance')) {
      MR.say(`Lagu ${row.dataset.song} dimajukan dalam antrean`);
    }
  });
  document.querySelectorAll('[data-room-reaction]').forEach(button => button.addEventListener('click', () => {
    const value = button.dataset.roomReaction;
    const input = $('#chatInput');
    input.value = value === 'Sedih' ? '🥺' : value;
    input.focus();
  }));
  $('#chatForm').addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#chatInput'), value = input.value.trim();
    if (!value) return;
    const msg = document.createElement('div'); msg.className='room-chat-message mine';
    const avatar = document.createElement('span'); avatar.className='room-chat-avatar pink'; avatar.textContent='DI';
    const body = document.createElement('div'); body.className='room-chat-message-body';
    const meta = document.createElement('div');
    const name=document.createElement('b'); name.textContent='@dimas · Pemilik';
    const time=document.createElement('small'); time.textContent='Baru saja';
    const p=document.createElement('p'); p.textContent=value;
    meta.append(name,time); body.append(meta,p); msg.append(avatar,body);
    $('#chatMessages').append(msg); input.value='';
    $('#chatMessages').scrollTop=$('#chatMessages').scrollHeight;
  });
  // Halaman Sirkel langsung menampilkan daftar siaran publik seperti referensi.
  show('discover');
})();