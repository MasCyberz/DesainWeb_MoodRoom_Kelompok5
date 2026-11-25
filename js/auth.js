(() => {
  'use strict';

  const USERS_KEY = 'moodroom_users';
  const SESSION_KEY = 'moodroom_session';
  const PROFILE_KEY = 'moodroom_profile';

  const getUsers = () => {
    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      if (users.length) return users;
      const demoUser = {
        name: 'Dimasss',
        username: 'dimas',
        email: 'dimas@gmail.com',
        password: '123456'
      };
      localStorage.setItem(USERS_KEY, JSON.stringify([demoUser]));
      return [demoUser];
    } catch {
      return [];
    }
  };

  const getSession = () => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch {
      return null;
    }
  };

  const getProfile = () => {
    try {
      return Object.assign({}, JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}'));
    } catch {
      return {};
    }
  };

  window.MoodAuth = {
    getUsers,
    getSession,
    getProfile,
    login(user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    },
    logout() {
      localStorage.removeItem(SESSION_KEY);
      updateGuestInterface();
    },
    requireLogin() {
      if (!getSession() && !/login\.html$|register\.html$/.test(location.pathname)) {
        location.replace('login.html');
      }
    }
  };

  const updateGuestInterface = () => {
    if (!document.body || !document.querySelector('.shell')) return;
    if (!getSession()) {
      const guestRight = document.querySelector('.mr-right');
      if (guestRight) {
        const topActions = guestRight.querySelector('.top-actions');
        guestRight.innerHTML = '';
        if (topActions) guestRight.appendChild(topActions);
        guestRight.classList.add('guest-right');
      }

      const guestMainNav = document.getElementById('mainNav');
      if (guestMainNav) {
        guestMainNav.querySelectorAll('a[href="sirkel.html"]').forEach(link => link.remove());
        const collectionTitle = [...document.querySelectorAll('.side-title')].find(el => el.textContent.trim() === 'Koleksi Pribadi');
        if (collectionTitle) {
          collectionTitle.nextElementSibling?.remove();
          collectionTitle.remove();
        }
        document.querySelectorAll('.pl-head, #playlists, .plan-badge, .premium').forEach(el => el.remove());
      }

      const removeGuestSidebarSections = [
        '.side-title', '.d-grid.gap-3.mb-4', '.pl-head', '#playlists',
        '.plan-badge', '.premium'
      ];
      if (/playlist\.html$|playlist\.html\?/.test(location.pathname + location.search)) {
        const sidebar = document.querySelector('.mr-sidebar');
        if (sidebar) {
          const collectionTitle = [...sidebar.querySelectorAll('.side-title')].find(el => el.textContent.trim() === 'Koleksi Pribadi');
          collectionTitle?.nextElementSibling?.remove();
          collectionTitle?.remove();
          [...sidebar.querySelectorAll('.pl-head, #playlists, .plan-badge, .premium')].forEach(el => el.remove());
        }
      }
      return;
    }
    const session = getSession();
    const profile = Object.assign({}, session, getProfile());
    const hasAvatar = Boolean(profile.avatar);

    // Tampilkan foto profil yang sesuai, atau ikon manusia kalau belum ada profile
    const renderAvatar = (el) => {
      if (!el) return;
      el.textContent = '';
      el.innerHTML = hasAvatar ? '' : '<i class="bi bi-person-fill"></i>';
      if (hasAvatar) el.style.setProperty('--avatar-image', `url("${profile.avatar}")`);
      else el.style.removeProperty('--avatar-image');
      if (!hasAvatar) el.classList.remove('has-image'); else el.classList.add('has-image');
    };
    document.querySelectorAll('.top-actions .avatar, .mobile-profile').forEach(renderAvatar);

    const mobileLogin = document.querySelector('.guest-login-btn');
    if (mobileLogin) {
      mobileLogin.className = 'avatar profile-link mobile-profile';
      mobileLogin.style.width = '38px';
      mobileLogin.style.height = '38px';
      mobileLogin.textContent = '';
      mobileLogin.href = 'profile-new.html';
      mobileLogin.setAttribute('aria-label', 'Buka profil');
      renderAvatar(mobileLogin);
    };

    const sidebarMenu = document.getElementById('mainNav');
    if (sidebarMenu) {
      if (!sidebarMenu.querySelector('a[href="sirkel.html"]')) {
        const sirkelA = document.createElement('a');
        sirkelA.href = 'sirkel.html';
        sirkelA.className = 'side-item';
        sirkelA.innerHTML = '<i class="bi bi-people"></i><span class="lbl">Sirkel</span>';
        sidebarMenu.appendChild(sirkelA);
      }

      const sidebar = sidebarMenu.closest('.mr-sidebar');
      document.querySelectorAll('.guest-logged-sidebar').forEach(element => element.remove());

      if (sidebar) {
        [...sidebar.querySelectorAll('.side-title')].forEach(title => {
          if (title.textContent.trim() === 'Koleksi Pribadi') {
            title.nextElementSibling?.remove();
            title.remove();
          }
        });
        sidebar.querySelectorAll('.pl-head, #playlists, .plan-badge, .premium').forEach(element => element.remove());
        sidebar.querySelectorAll('.mt-auto').forEach(element => element.remove());
      }

      const isLikedPage = /lagu_disukai\.html$/i.test(location.pathname);
      const collection = document.createElement('div');
      collection.className = 'guest-logged-sidebar';
      collection.innerHTML = `
        <h6 class="side-title mt-3">Koleksi Pribadi</h6>
        <div class="d-grid gap-3 mb-4">
          <a href="lagu_disukai.html" class="side-item${isLikedPage ? ' active' : ''}"><i class="bi bi-heart"></i><span class="lbl">Lagu disukai</span></a>
          <a href="#" class="side-item" id="openMoodCardModal"><i class="bi bi-suit-heart-fill text-pink"></i><span class="lbl">MoodCard Saya</span></a>
        </div>
        <div class="d-flex justify-content-between align-items-center pl-head">
          <h6 class="side-title mb-0">Playlistku</h6>
          <button class="btn p-0 text-white-50 fs-4" id="addPlaylist" type="button" aria-label="Tambah playlist"><i class="bi bi-plus-circle-fill" style="color:#6c4fe0"></i></button>
        </div>
        <div class="d-grid gap-2 my-2 pl-wrap" id="playlists">
          <a href="playlist.html?nama=Rock%20n%20Roll" class="side-item plain"><i class="bi bi-music-note-list"></i><span class="lbl">Rock n Roll</span></a>
          <a href="playlist.html?nama=Dangdut" class="side-item plain"><i class="bi bi-music-note-list"></i><span class="lbl">Dangdut</span></a>
        </div>
        <div class="mt-auto pt-3">
          <div class="plan-badge mb-3" role="status"><i class="bi bi-person-badge"></i><span class="lbl">Akun Gratis</span></div>
          <div class="premium">
            <i class="bi bi-star-fill premium-ico"></i>
            <div class="fw-semibold small pt"><i class="bi bi-star-fill me-1"></i>MoodRoom Premium</div>
            <p class="mb-2 mt-1" style="font-size:.7rem">Nikmati audio kualitas HD tanpa iklan terputus.</p>
            <a class="btn btn-light btn-sm w-100 rounded-pill py-0" id="upgradeBtn" href="premium-new.html" style="font-size:.75rem">Upgrade Sekarang</a>
          </div>
        </div>`;
      sidebarMenu.after(collection);
    }
    window.dispatchEvent(new CustomEvent('mrauth:ready'));

    document.querySelectorAll('.mr-sidebar a[href="login.html"], .mr-sidebar a[href="profile-new.html"].guest-profile-link')
      .forEach(link => link.remove());

    const topActions = document.querySelector('.top-actions');
    if (topActions) {
      topActions.innerHTML = `
        <button class="icon-btn" data-bell aria-label="Notifikasi"><i class="bi bi-bell"></i><span class="dot"></span></button>
        <a class="profile profile-link" href="profile-new.html">
          <span class="avatar"></span>
          <div class="lh-sm">
            <div class="fw-bold">${profile.username ? '@' + profile.username : '@dimas'}</div>
            <span class="plan-chip">Akun Gratis</span>
          </div>
        </a>`;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateGuestInterface);
  } else {
    updateGuestInterface();
  }

  if (document.body?.dataset.authPage) {
    if (getSession() && document.body.dataset.authPage === 'guest') {
      location.replace('index.html');
    }
  }
})();
