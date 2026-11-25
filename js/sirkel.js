(() => {
  'use strict';

  const rawFile = location.pathname.split('/').pop().toLowerCase();
  const fileName = (!rawFile || rawFile === 'index.html') ? 'index.html' : rawFile;
  const isRoomPage = (fileName === 'sirkel-room.html');
  const views = ['sirkelDiscover', 'sirkelMine', 'sirkelRoom', 'sirkelChoose'];

  // Helper functions
  const say = msg => {
    if (window.MR && typeof window.MR.say === 'function') {
      window.MR.say(msg);
      return;
    }
    const toastMsg = document.getElementById('toastMsg');
    const toastEl = document.getElementById('toast');
    if (toastMsg) toastMsg.textContent = msg;
    if (toastEl && window.bootstrap) {
      const toast = window.bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2000 });
      toast.show();
    }
  };

  const burst = (x, y) => {
    if (window.MR && typeof window.MR.burstLikes === 'function') {
      window.MR.burstLikes(x, y);
      return;
    }
    const emojis = ['❤️', '🔥', '✨', '🎵', '👏'];
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const p = document.createElement('span');
        p.className = 'mr-floating-particle';
        p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        p.style.setProperty('--rx', ((Math.random() - 0.5) * 80).toFixed(0) + 'px');
        p.style.setProperty('--rr', ((Math.random() - 0.5) * 40).toFixed(0) + 'deg');
        p.style.left = (x !== undefined ? x : (window.innerWidth - 80)) + 'px';
        p.style.top = (y !== undefined ? y : (window.innerHeight - 90)) + 'px';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1400);
      }, i * 60);
    }
  };

  const escapeHtml = str => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  // Switch between views
  const showView = name => {
    views.forEach(id => {
      const view = document.getElementById(id);
      if (view) view.classList.toggle('d-none', id !== name);
    });

    const topline = document.querySelector('.sirkel-topline');
    if (topline) {
      topline.classList.toggle('d-none', name !== 'sirkelDiscover');
    }

    const rightSidebar = document.querySelector('.target-chat-sidebar');
    if (rightSidebar) {
      rightSidebar.classList.toggle('d-none', name === 'sirkelChoose');
    }

    document.querySelectorAll('.sirkel-tab').forEach(tab => tab.classList.remove('active'));
    if (name === 'sirkelDiscover') {
      document.querySelector('.sirkel-tab[href="sirkel-kita.html"]')?.classList.add('active');
    }
    if (name === 'sirkelMine') {
      document.querySelector('.sirkel-tab[href="sirkel-sendiri.html"]')?.classList.add('active');
    }

    // When viewing sirkelRoom, synchronize state
    if (name === 'sirkelRoom') {
      setJoinedState(true);
    }
  };

  // Sync Room Information in Right Sidebar
  const syncRoomInfo = (name, host, avatar, nowPlaying, listeners) => {
    const roomNameEl = document.getElementById('roomName');
    if (roomNameEl && name) roomNameEl.textContent = name;

    const titleEl = document.getElementById('liveRoomTitle');
    if (titleEl && name) titleEl.textContent = name;

    const hostEl = document.getElementById('liveRoomHost');
    if (hostEl && host) hostEl.textContent = host.startsWith('Host:') ? host : `Host: ${host}`;

    const avatarEl = document.getElementById('liveRoomAvatar');
    if (avatarEl && avatar) avatarEl.textContent = avatar;

    const nowPlayingEl = document.getElementById('liveRoomNowPlaying');
    if (nowPlayingEl && nowPlaying) nowPlayingEl.textContent = nowPlaying.startsWith('♪') ? nowPlaying : `♪ ${nowPlaying}`;

    const listenersEl = document.getElementById('listeners');
    if (listenersEl && listeners) listenersEl.textContent = listeners;
  };

  // Right Chat Elements
  const liveChatMessages = document.getElementById('liveChatMessages');
  const liveMessageInput = document.getElementById('liveMessageInput');
  const sendLiveMessage = document.getElementById('sendLiveMessage');
  const liveChatForm = document.getElementById('liveChatForm');
  const joinBtn = document.getElementById('joinBtn');
  const closeLiveChat = document.getElementById('closeLiveChat');
  const listenersEl = document.getElementById('listeners');
  const liveChatPrompt = document.getElementById('liveChatPrompt');
  const liveChatPinnedText = document.getElementById('liveChatPinnedText');

  // Track joined state
  let joined = isRoomPage;

  const setJoinedState = isJoined => {
    joined = isJoined;
    if (liveMessageInput) {
      liveMessageInput.disabled = !joined;
      liveMessageInput.placeholder = joined ? 'Tulis pesan ke room...' : 'Gabung untuk ikut ngobrol...';
    }
    if (sendLiveMessage) {
      sendLiveMessage.disabled = !joined;
    }
    if (joinBtn) {
      if (isRoomPage) {
        joinBtn.innerHTML = '<i class="bi bi-box-arrow-right"></i> Keluar Room';
      } else {
        joinBtn.innerHTML = joined
          ? '<i class="bi bi-box-arrow-right"></i> Keluar Nongkrong'
          : '<i class="bi bi-headphones"></i> Gabung Nongkrong';
      }
    }
    if (liveChatPrompt) {
      liveChatPrompt.innerHTML = joined
        ? 'Reaksi cepat ke room? 👀'
        : 'Reaksi cepat setelah bergabung? 👀<small>Gabung untuk ikut ngobrol.</small>';
    }
    if (liveChatPinnedText) {
      liveChatPinnedText.textContent = joined
        ? 'Live chat room · Obrolan tersinkron'
        : 'Pratinjau live chat · Gabung untuk ikut mengirim';
    }
  };

  // Initialize joined state
  setJoinedState(isRoomPage);

  // Send message to live chat
  const sendChatMessage = (text, isReaction = false) => {
    const trimmed = (text || '').trim();
    if (!trimmed) return;

    if (!joined) {
      setJoinedState(true);
      say('Bergabung ke obrolan room 🎉');
    }

    if (!liveChatMessages) return;

    // Get current session or fallback
    let userName = '@dimas';
    let userAvatar = 'DI';
    try {
      const session = JSON.parse(localStorage.getItem('moodroom_session') || 'null');
      if (session && session.username) {
        userName = session.username.startsWith('@') ? session.username : `@${session.username}`;
        userAvatar = (session.name || session.username).substring(0, 2).toUpperCase();
      }
    } catch (_) {}

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const msgEl = document.createElement('div');
    msgEl.className = 'target-chat-message mine';
    msgEl.innerHTML = `
      <span class="target-chat-avatar pink">${userAvatar}</span>
      <div>
        <small>${userName} · <em>Kamu</em> · ${timeStr}</small>
        <p>${escapeHtml(trimmed)}</p>
      </div>
    `;

    liveChatMessages.appendChild(msgEl);
    liveChatMessages.scrollTop = liveChatMessages.scrollHeight;

    if (liveMessageInput) {
      liveMessageInput.value = '';
    }

    // Visual burst particles
    const rect = sendLiveMessage ? sendLiveMessage.getBoundingClientRect() : null;
    if (rect) {
      burst(rect.left + rect.width / 2, rect.top);
    } else {
      burst();
    }

    // Auto simulated response from other room members to make it lively
    if (!isReaction) {
      triggerSimulatedResponse(trimmed);
    }
  };

  // Simulated member replies
  const memberReplies = [
    { name: 'Andi', handle: '@andi', avatar: 'AN', text: 'Setuju banget sama lagunya! 🔥' },
    { name: 'Rina', handle: '@rina', avatar: 'RI', text: 'Mantap, vibes lagunya pas banget ✨' },
    { name: 'Budi', handle: '@budi', avatar: 'BU', text: 'Kopi + lagu ini nikmat pol ☕' },
    { name: 'Andi', handle: '@andi', avatar: 'AN', text: 'Habis ini giliran siapa nih yang antre? 👀' },
    { name: 'Rina', handle: '@rina', avatar: 'RI', text: 'Gas terus, jangan sampai berhenti musiknya 🎶' }
  ];

  let replyTimer = null;
  const triggerSimulatedResponse = userMsg => {
    clearTimeout(replyTimer);
    replyTimer = setTimeout(() => {
      if (!liveChatMessages) return;
      const pick = memberReplies[Math.floor(Math.random() * memberReplies.length)];
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const replyEl = document.createElement('div');
      replyEl.className = 'target-chat-message';
      replyEl.innerHTML = `
        <span class="target-chat-avatar">${pick.avatar}</span>
        <div>
          <small>${pick.handle} · ${timeStr}</small>
          <p>${escapeHtml(pick.text)}</p>
        </div>
      `;
      liveChatMessages.appendChild(replyEl);
      liveChatMessages.scrollTop = liveChatMessages.scrollHeight;
    }, 1800);
  };

  // Chat form submit
  if (liveChatForm) {
    liveChatForm.addEventListener('submit', e => {
      e.preventDefault();
      if (liveMessageInput) {
        sendChatMessage(liveMessageInput.value);
      }
    });
  } else if (sendLiveMessage) {
    sendLiveMessage.addEventListener('click', e => {
      e.preventDefault();
      if (liveMessageInput) {
        sendChatMessage(liveMessageInput.value);
      }
    });
  }

  // Allow enter key on liveMessageInput if no form
  if (liveMessageInput && !liveChatForm) {
    liveMessageInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendChatMessage(liveMessageInput.value);
      }
    });
  }

  // Quick reactions
  document.addEventListener('click', e => {
    const reactBtn = e.target.closest('[data-live-react]');
    if (!reactBtn) return;
    const emoji = reactBtn.dataset.liveReact;
    if (emoji) {
      const rect = reactBtn.getBoundingClientRect();
      burst(rect.left + rect.width / 2, rect.top);
      sendChatMessage(emoji, true);
    }
  });

  // Join button click handler
  if (joinBtn) {
    joinBtn.addEventListener('click', e => {
      if (isRoomPage) {
        // If on sirkel-room.html, clicking Keluar Room takes user back to sirkel-sendiri.html
        say('Keluar dari room...');
        setTimeout(() => {
          location.href = 'sirkel-sendiri.html';
        }, 350);
        return;
      }

      setJoinedState(!joined);

      if (joined) {
        if (listenersEl) {
          const c = (parseInt(listenersEl.textContent, 10) || 42) + 1;
          listenersEl.textContent = c;
          listenersEl.classList.add('sirkel-counter-pulse');
          setTimeout(() => listenersEl.classList.remove('sirkel-counter-pulse'), 400);
        }
        const r = e.currentTarget.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top);
        say('Kamu bergabung ke room! 🎉');
        if (liveMessageInput) liveMessageInput.focus();

        if (liveChatMessages) {
          const sysNote = document.createElement('div');
          sysNote.className = 'target-chat-system-note';
          sysNote.textContent = 'Kamu baru saja bergabung ke room ✨';
          liveChatMessages.appendChild(sysNote);
          liveChatMessages.scrollTop = liveChatMessages.scrollHeight;
        }

        if (window.MR && typeof window.MR.playTitle === 'function') {
          window.MR.playTitle('Peradaban - .Feast');
        }
      } else {
        if (listenersEl) {
          const c = Math.max(1, (parseInt(listenersEl.textContent, 10) || 43) - 1);
          listenersEl.textContent = c;
        }
        say('Kamu keluar dari nongkrong');
      }
    });
  }

  // Close live chat
  if (closeLiveChat) {
    closeLiveChat.addEventListener('click', () => {
      const layout = document.querySelector('.layout');
      if (layout) {
        layout.classList.add('sirkel-chat-closed');
        say('Chat disembunyikan. Klik ikon chat di pemutar untuk membuka kembali 💬');
      }
    });
  }

  // Toggle chat via player or global event
  document.addEventListener('mr:chat-toggle', () => {
    const layout = document.querySelector('.layout');
    if (layout) {
      layout.classList.toggle('sirkel-chat-closed');
      const isClosed = layout.classList.contains('sirkel-chat-closed');
      say(isClosed ? 'Chat disembunyikan' : 'Chat dibuka 💬');
    }
  });

  // Global click delegations for views & actions
  document.addEventListener('click', event => {
    const viewButton = event.target.closest('[data-sirkel-view]');
    if (viewButton) {
      const view = viewButton.dataset.sirkelView;
      if (view === 'discover') {
        if (fileName === 'sirkel.html' || fileName === 'sirkel') {
          location.href = 'sirkel-kita.html';
        } else {
          showView('sirkelDiscover');
        }
      }
      if (view === 'mine') {
        if (fileName === 'sirkel.html' || fileName === 'sirkel') {
          location.href = 'sirkel-sendiri.html';
        } else {
          showView('sirkelMine');
        }
      }
      if (view === 'choose') {
        if (fileName === 'sirkel.html' || fileName === 'sirkel') {
          showView('sirkelChoose');
        } else {
          location.href = 'sirkel.html';
        }
      }
      return;
    }

    const switchBtn = event.target.closest('[data-room-filter="switch"]');
    if (switchBtn) {
      event.preventDefault();
      location.href = 'sirkel.html';
      return;
    }

    // Join public room card click
    const joinPublicBtn = event.target.closest('.join-public');
    if (joinPublicBtn) {
      const room = joinPublicBtn.dataset.room || 'Sirkel Live';
      const card = joinPublicBtn.closest('.public-room-card');
      const host = card?.querySelector('.target-hostline b')?.textContent || '@host';
      const avatar = card?.querySelector('.target-host-avatar')?.textContent || 'BU';
      const playing = card?.querySelector('.target-room-info span:last-child')?.textContent || '♪ Playing';

      syncRoomInfo(room, host, avatar, playing, '42');
      showView('sirkelRoom');
      return;
    }

    // Open room from private sirkel
    const openRoomBtn = event.target.closest('.open-room');
    if (openRoomBtn) {
      const room = openRoomBtn.dataset.room || 'Kost Mamang';
      if (fileName === 'sirkel-room.html') {
        syncRoomInfo(room, 'Host: @dimas (kamu)', 'KM', 'Evaluasi · Hindia', '4');
        say(`Membuka room ${room}`);
      } else {
        location.href = `sirkel-room.html?room=${encodeURIComponent(room)}`;
      }
      return;
    }

    // Back button
    const backBtn = event.target.closest('#backSirkel, .back-to-discover');
    if (backBtn) {
      event.preventDefault();
      showView('sirkelDiscover');
      return;
    }

    // Copy room code buttons
    const copyBtn = event.target.closest('#copyRoomCode, #copyOwnRoom, #copyFriendRoom');
    if (copyBtn) {
      let code = '#KOST-MAMANG';
      if (copyBtn.id === 'copyFriendRoom') code = '#PULANG-PELAN';
      navigator.clipboard?.writeText(code).catch(() => {});
      say(`Kode room disalin: ${code} 📋`);
      return;
    }

    // Share link buttons
    const shareBtn = event.target.closest('#shareRoomLink, #sharePrivate, #shareFriendRoom');
    if (shareBtn) {
      navigator.clipboard?.writeText(location.href).catch(() => {});
      say('Link room disalin ke clipboard 🔗');
      return;
    }

    // Leave room button in room header
    const leaveBtn = event.target.closest('#leaveRoom');
    if (leaveBtn) {
      say('Keluar dari room...');
      setTimeout(() => {
        location.href = 'sirkel-sendiri.html';
      }, 300);
      return;
    }

    // Room audio controls
    const roomPlayBtn = event.target.closest('#roomPlay');
    if (roomPlayBtn) {
      const mainPlayBtn = document.getElementById('playBtn');
      if (mainPlayBtn) {
        mainPlayBtn.click();
        const isPaused = mainPlayBtn.querySelector('.bi-play-fill');
        roomPlayBtn.innerHTML = isPaused
          ? '<i class="bi bi-play-fill"></i> Putar'
          : '<i class="bi bi-pause-fill"></i> Jeda';
      }
      return;
    }

    const roomNextBtn = event.target.closest('#roomNext');
    if (roomNextBtn) {
      const mainNextBtn = document.getElementById('nextBtn');
      if (mainNextBtn) mainNextBtn.click();
      say('Memutar lagu berikutnya ⏭️');
      return;
    }

    // Queue buttons: Accept, Reject, Advance
    const queueAccept = event.target.closest('.queue-accept');
    if (queueAccept) {
      const row = queueAccept.closest('.room-request-row');
      if (row) {
        const statusEl = row.querySelector('.room-request-status');
        if (statusEl) {
          statusEl.className = 'room-request-status accepted';
          statusEl.innerHTML = '<i class="bi bi-check-circle"></i> Diterima · Berikutnya';
        }
        const actionsEl = row.querySelector('.room-request-actions');
        if (actionsEl) {
          actionsEl.innerHTML = '<button type="button" class="btn btn-pink btn-xs queue-advance">Majukan</button>';
        }
        const acceptedCountEl = document.getElementById('queueAcceptedCount');
        if (acceptedCountEl) acceptedCountEl.textContent = '2 diterima';
        say('Pengajuan lagu diterima ✅');
      }
      return;
    }

    const queueReject = event.target.closest('.queue-reject');
    if (queueReject) {
      const row = queueReject.closest('.room-request-row');
      if (row) {
        row.style.opacity = '0.3';
        row.style.transition = 'opacity 0.3s';
        setTimeout(() => row.remove(), 300);
        say('Pengajuan lagu ditolak ❌');
      }
      return;
    }

    const queueAdvance = event.target.closest('.queue-advance');
    if (queueAdvance) {
      const row = queueAdvance.closest('.room-request-row');
      const list = document.getElementById('roomRequestList');
      if (row && list) {
        const playingRow = list.querySelector('.is-playing');
        if (playingRow && playingRow.nextSibling !== row) {
          list.insertBefore(row, playingRow.nextSibling);
        }
        say('Lagu dimajukan ke antrean berikutnya ⏭️');
      }
      return;
    }

    // Request song button
    const requestSongBtn = event.target.closest('#requestSongBtn');
    if (requestSongBtn) {
      const title = prompt('Masukkan judul lagu dan artis yang ingin diajukan:', 'Sore — Menari');
      if (title && title.trim()) {
        const list = document.getElementById('roomRequestList');
        if (list) {
          const newRow = document.createElement('div');
          newRow.className = 'room-request-row';
          newRow.innerHTML = `
            <span class="room-request-avatar pink">DI</span>
            <div class="room-request-song"><b>${escapeHtml(title.trim())}</b><span>Diajukan @dimas (kamu) · baru saja</span></div>
            <div class="room-request-status waiting"><i class="bi bi-clock"></i> Menunggu</div>
            <div class="room-request-actions"><button type="button" class="btn btn-pink btn-xs queue-accept">Terima</button><button type="button" class="btn btn-outline-pink btn-xs queue-reject">Tolak</button></div>
          `;
          list.appendChild(newRow);
          say(`Lagu "${title.trim()}" berhasil diajukan 🎵`);
        }
      }
      return;
    }

    // Create room button
    const createRoomBtn = event.target.closest('#createRoomBtn');
    if (createRoomBtn) {
      const roomName = prompt('Beri nama room privat kamu:', 'Sirkel Santai');
      if (roomName && roomName.trim()) {
        say(`Room "${roomName.trim()}" berhasil dibuat! 🎧`);
        setTimeout(() => {
          location.href = `sirkel-room.html?room=${encodeURIComponent(roomName.trim())}`;
        }, 500);
      }
      return;
    }

    // Join by code button
    const joinByCode = event.target.closest('#joinByCode');
    if (joinByCode) {
      const codeInput = document.getElementById('roomCode');
      const code = (codeInput?.value || '').trim();
      if (!code) {
        say('Masukkan kode room terlebih dahulu');
        return;
      }
      say(`Bergabung ke room dengan kode ${code}...`);
      setTimeout(() => {
        location.href = `sirkel-room.html?code=${encodeURIComponent(code)}`;
      }, 500);
      return;
    }
  });

  // Filter chips in sirkelDiscover
  document.addEventListener('click', event => {
    const chip = event.target.closest('.sirkel-filter-chips .room-filter[data-room-filter]:not([data-room-filter="switch"])');
    if (!chip) return;
    document.querySelectorAll('.sirkel-filter-chips .room-filter').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const filter = chip.dataset.roomFilter;
    document.querySelectorAll('.public-room-wrap').forEach(wrap => {
      if (filter === 'all' || wrap.dataset.roomCategory === filter) {
        wrap.classList.remove('d-none');
      } else {
        wrap.classList.add('d-none');
      }
    });
  });

  // Search in sirkelDiscover
  const searchInput = document.getElementById('sirkelSearch');
  searchInput?.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    let count = 0;
    document.querySelectorAll('.public-room-wrap').forEach(wrap => {
      const match = !q || (wrap.dataset.roomSearch || '').toLowerCase().includes(q);
      wrap.classList.toggle('d-none', !match);
      if (match) count++;
    });
    const noResult = document.getElementById('sirkelNoResult');
    if (noResult) noResult.classList.toggle('d-none', count > 0);
  });

  // Check URL parameters for room name if on room page
  if (isRoomPage) {
    const params = new URLSearchParams(location.search);
    const customRoom = params.get('room');
    if (customRoom) {
      syncRoomInfo(customRoom, 'Host: @dimas (kamu)', customRoom.substring(0, 2).toUpperCase(), 'Evaluasi · Hindia', '4');
    }
  }

  // Initial page view trigger
  if (fileName === 'sirkel.html' || fileName === 'sirkel') {
    showView('sirkelChoose');
  } else if (fileName === 'sirkel-sendiri.html') {
    showView('sirkelMine');
  } else if (fileName === 'sirkel-room.html') {
    showView('sirkelRoom');
  } else {
    showView('sirkelDiscover');
  }
})();
