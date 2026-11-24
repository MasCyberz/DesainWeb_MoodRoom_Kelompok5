(() => {
  'use strict';

  const rawFile = location.pathname.split('/').pop().toLowerCase();
  const fileName = (!rawFile || rawFile === 'index.html') ? 'index.html' : rawFile;
  const views = ['sirkelDiscover', 'sirkelMine', 'sirkelRoom', 'sirkelChoose'];

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
  };

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

    const joinBtn = event.target.closest('.join-public');
    if (joinBtn) {
      const room = joinBtn.dataset.room || 'Sirkel Live';
      const roomNameEl = document.getElementById('roomName');
      if (roomNameEl) roomNameEl.textContent = room;
      showView('sirkelRoom');
      return;
    }

    const backBtn = event.target.closest('#backSirkel, .back-to-discover');
    if (backBtn) {
      event.preventDefault();
      showView('sirkelDiscover');
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
