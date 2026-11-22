/* Interaksi halaman Sirkel */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const views = {
    discover: $('#sirkelDiscover'),
    mine: $('#sirkelMine'),
    room: $('#sirkelRoom'),
    choose: $('#sirkelChoose')
  };

  let activeRoomFilter = 'all';

  const show = (name) => {
    Object.entries(views).forEach(([key, el]) => {
      el.classList.toggle('d-none', key !== name);
    });

    const tabs = $('.sirkel-tabs');
    if (tabs) tabs.classList.add('d-none');

    $$('.sirkel-tab').forEach(button => {
      button.classList.toggle('active', button.dataset.sirkelView === name);
    });

    if (name === 'room') {
      $('.sirkel-page-title').textContent = 'Sirkel';
    } else {
      $('.sirkel-page-title').textContent =
        name === 'mine' ? 'Sirkel Sendiri' :
        name === 'choose' ? 'Sirkel' :
        'Sirkel Kita';
    }
  };

  const openRoom = (name) => {
    $('#roomName').textContent = name || 'Kost Mamang';
    show('room');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigasi halaman dan tombol bergabung
  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-sirkel-view]');

    if (nav) {
      e.preventDefault();
      show(nav.dataset.sirkelView);
    }

    const join = e.target.closest('.join-public');

    if (join) {
      openRoom(join.dataset.room);
    }

    const own = e.target.closest('.open-room');

    if (own) {
      openRoom(own.dataset.room);
    }
  });

  // Pencarian dan filter room
  const applyRoomFilters = () => {
    const q = $('#sirkelSearch').value.trim().toLowerCase();
    let count = 0;

    $$('.public-room-wrap').forEach(card => {
      const textMatch = (
        card.dataset.roomSearch || card.textContent
      ).toLowerCase().includes(q);

      const categories = (
        card.dataset.roomCategory || ''
      ).toLowerCase().split(/\s+/);

      const categoryMatch =
        activeRoomFilter === 'all' ||
        categories.includes(activeRoomFilter);

      const visible = textMatch && categoryMatch;

      card.classList.toggle('d-none', !visible);

      if (visible) count++;
    });

    $('#sirkelNoResult').classList.toggle('d-none', count > 0);
  };

  $('#sirkelSearch').addEventListener('input', applyRoomFilters);

  $$('.room-filter').forEach(button => {
    button.addEventListener('click', () => {
      activeRoomFilter = button.dataset.roomFilter;

      $$('.room-filter').forEach(item => {
        item.classList.toggle('active', item === button);
      });

      applyRoomFilters();
    });
  });

  // Mengirim pesan pada live room
  const sendLiveMessage = () => {
    const input = $('#liveMessageInput');
    const value = input.value.trim();

    if (!value) return;

    const item = document.createElement('div');
    item.className = 'live-chat-item';

    const avatar = document.createElement('span');
    avatar.className = 'chat-avatar ca4';
    avatar.textContent = 'D';

    const body = document.createElement('div');

    const name = document.createElement('b');
    name.textContent = '@dimas';

    const message = document.createElement('p');
    message.textContent = value;

    body.append(name, message);
    item.append(avatar, body);

    $('.live-chat-list').append(item);

    input.value = '';

    $('.live-chat-list').scrollTop =
      $('.live-chat-list').scrollHeight;
  };

  $('#sendLiveMessage').addEventListener('click', sendLiveMessage);

  $('#liveMessageInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      sendLiveMessage();
    }
  });

  // Membuat room baru
  $('#createRoomBtn').addEventListener('click', () => {
    const name = prompt('Masukkan nama sirkel baru:');

    if (!name || !name.trim()) return;

    $('#roomName').textContent = name.trim();

    $('#chatMessages').innerHTML = `
      <div class="chat-msg">
        <b>@dimas</b>
        <p>Room baru berhasil dibuat. Ajak temanmu bergabung! ✨</p>
        <small>Baru saja</small>
      </div>
    `;

    openRoom(name.trim());
  });

  // Membagikan room pribadi
  $('#sharePrivate').addEventListener('click', async () => {
    const code = 'https://moodroom.local/sirkel.html?room=KOST-MAMANG';

    try {
      await navigator.clipboard.writeText(code);
      MR.say('Link room berhasil disalin');
    } catch {
      MR.say('Kode room: KOST-MAMANG');
    }
  });

  // Menyalin kode room
  $('#copyRoomCode').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('KOST-MAMANG');
      MR.say('Kode KOST-MAMANG disalin');
    } catch {
      MR.say('Kode room: KOST-MAMANG');
    }
  });

  // Bergabung menggunakan kode
  $('#joinByCode').addEventListener('click', () => {
    const code = $('#roomCode').value.trim();

    if (!code) {
      MR.say('Masukkan kode room terlebih dahulu');
      return;
    }

    if (
      code.toUpperCase().replace('#', '') === 'KOST-MAMANG' ||
      code.toUpperCase().replace('#', '') === 'MASUK-KODE'
    ) {
      openRoom('Kost Mamang');
      MR.say('Berhasil masuk ke room');
    } else {
      MR.say('Kode room tidak ditemukan');
    }
  });

  // Tombol kembali dan keluar room
  $('#backSirkel').addEventListener('click', () => {
    show('discover');
  });

  $('#leaveRoom').addEventListener('click', () => {
    show('mine');
    MR.say('Kamu keluar dari room');
  });

  // Kontrol pemutaran dan antrean
  $('#roomPlay').addEventListener('click', () => {
    MR.say('Musik diputar bersama anggota room 🎶');
  });

  $('#roomQueue').addEventListener('click', () => {
    $('.room-queue-panel').scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  });

  // Mengirim pesan di private room
  $('#chatForm').addEventListener('submit', e => {
    e.preventDefault();

    const input = $('#chatInput');
    const value = input.value.trim();

    if (!value) return;

    const msg = document.createElement('div');
    msg.className = 'chat-msg mine';

    const name = document.createElement('b');
    name.textContent = '@dimas';

    const p = document.createElement('p');
    p.textContent = value;

    const time = document.createElement('small');
    time.textContent = 'Baru saja';

    msg.append(name, p, time);

    $('#chatMessages').append(msg);

    input.value = '';

    $('#chatMessages').scrollTop =
      $('#chatMessages').scrollHeight;
  });

  // Halaman Sirkel langsung membuka daftar room publik
  show('discover');

})();