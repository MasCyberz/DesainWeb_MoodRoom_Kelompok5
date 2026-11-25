/* MoodRoom — script bersama (sidebar, player, toast, dynamic audio & presence). Dipakai semua halaman. */
(() => {
    const hasSession = (() => {
        try { return Boolean(JSON.parse(localStorage.getItem('moodroom_session') || 'null')); }
        catch (_) { return false; }
    })();

    if (!hasSession) {
        document.querySelectorAll('a[href="sirkel.html"], a[href="sirkel-kita.html"], a[href="sirkel-sendiri.html"]')
            .forEach(link => link.remove());

        const rightBar = document.querySelector('.mr-right');
        if (rightBar) {
            rightBar.querySelectorAll('.side-h, .panel').forEach(element => element.remove());
        }

        const sidebar = document.querySelector('.mr-sidebar');
        if (sidebar) {
            [...sidebar.querySelectorAll('.side-title')].forEach(title => {
                if (['Koleksi Pribadi', 'Playlistku'].includes(title.textContent.trim())) {
                    title.nextElementSibling?.remove();
                    title.remove();
                }
            });
            sidebar.querySelectorAll('#playlists, .pl-head, .plan-badge, .premium').forEach(element => element.remove());
        }
    }

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const store = {
        get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
        set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } }
    };

    // Toast
    const toastEl = $('#toast');
    const toast = toastEl ? bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2000 }) : null;
    const say = m => {
        if ($('#toastMsg')) $('#toastMsg').textContent = m;
        if (toast) toast.show();
    };

    let guestPlaybackSeconds = 0;
    let guestLoginModalShown = false;
    const showGuestLoginModal = () => {
        if (guestLoginModalShown) return;
        guestLoginModalShown = true;
        openActionModal(`
          <div class="text-center">
            <div class="fs-1 text-pink mb-2"><i class="bi bi-music-note-beamed"></i></div>
            <h2 class="fs-4 fw-bold mb-2">Masuk untuk lanjut mendengarkan</h2>
            <p class="text-white-50 mb-4">Tamu dapat mendengar maksimal 1 menit. Masuk atau daftar untuk menikmati musik tanpa batas.</p>
            <a class="btn btn-pink w-100 rounded-pill fw-semibold mb-2" href="login.html">Masuk</a>
            <a class="btn btn-outline-light w-100 rounded-pill" href="register.html">Daftar Sekarang</a>
          </div>`);
    };

    const actionModal = document.createElement('div');
    actionModal.className = 'mr-action-modal d-none';
    actionModal.innerHTML = '<div class="mr-action-card" role="dialog" aria-modal="true"><button type="button" class="mr-action-close" aria-label="Tutup">&times;</button><div class="mr-action-content"></div></div>';
    document.body.appendChild(actionModal);
    const actionContent = $('.mr-action-content', actionModal);
    const closeActionModal = () => actionModal.classList.add('d-none');
    const openActionModal = content => {
        actionContent.innerHTML = content;
        actionModal.classList.remove('d-none');
    };
    $('.mr-action-close', actionModal).addEventListener('click', closeActionModal);
    actionModal.addEventListener('click', e => { if (e.target === actionModal) closeActionModal(); });
    const actionMenu = document.createElement('div');
    actionMenu.className = 'mr-action-menu d-none';
    document.body.appendChild(actionMenu);
    const closeActionMenu = () => actionMenu.classList.add('d-none');
    const openActionMenu = (anchor, content, type) => {
        actionMenu.innerHTML = content;
        actionMenu.classList.remove('d-none');
        actionMenu.dataset.type = type;
        const rect = anchor.getBoundingClientRect();
        actionMenu.style.top = `${rect.bottom + 10}px`;
        actionMenu.style.right = `${Math.max(12, window.innerWidth - rect.right)}px`;
    };
    document.addEventListener('click', e => {
        if (!e.target.closest('.mr-action-menu') && !e.target.closest('[data-bell]') && !e.target.closest('.profile-link')) closeActionMenu();
    });

    // ===== Floating Reactions & Particle System =====
    const spawnParticle = (emoji, x, y) => {
        const p = document.createElement('span');
        p.className = 'mr-floating-particle';
        p.textContent = emoji;
        const rx = ((Math.random() - 0.5) * 90).toFixed(0) + 'px';
        const rr = ((Math.random() - 0.5) * 50).toFixed(0) + 'deg';
        p.style.setProperty('--rx', rx);
        p.style.setProperty('--rr', rr);
        p.style.left = (x !== undefined ? x : (window.innerWidth - 70)) + 'px';
        p.style.top = (y !== undefined ? y : (window.innerHeight - 90)) + 'px';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1400);
    };

    const burstLikes = (x, y) => {
        const emojis = ['❤️', '💖', '✨', '🔥', '🤍'];
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                spawnParticle(
                    emojis[Math.floor(Math.random() * emojis.length)],
                    x + (Math.random() - 0.5) * 36,
                    y + (Math.random() - 0.5) * 36
                );
            }, i * 65);
        }
    };

    // ===== Status Vibe Teman (Interaktif & Real-Time) =====
    const friendData = [
        { name: 'Andi', quote: '“Revisi jam 1..”', song: 'Evaluasi - Hindia', avatar: 'img/avatars/andi.jpg' },
        { name: 'Rina', quote: '“Lagi santai kawan”', song: 'Bergema Sampai Selamanya - Nadhif Basalamah', avatar: 'img/avatars/rina.jpg' },
        { name: 'Budi', quote: '“Alamak capeknyo”', song: 'Nina - .Feast', avatar: 'img/avatars/budi.jpg' },
        { name: 'Siti', quote: '“Hapis kok bgtu sih”', song: 'Satu Bulan - Bernadya', avatar: 'img/avatars/siti.jpg' }
    ];

    const waveHtml = '<span class="wave" aria-hidden="true">' + [10, 22, 30, 16, 26, 12, 20].map(h => `<i style="height:${h}px"></i>`).join('') + '</span>';

    const renderFriends = () => {
        const fl = $('#friendList');
        if (!fl) return;
        fl.innerHTML = friendData.map((f, idx) => `
            <button type="button" class="friend" data-idx="${idx}" title="Klik untuk dengar bareng ${f.name}" aria-label="Dengar bersama ${f.name}">
                <div class="friend-avatar-wrap">
                    <span class="avatar s" style="background:url('${f.avatar}') center/cover"></span>
                </div>
                <div class="min-w-0 flex-grow-1">
                    <div class="n">${f.name}</div>
                    <div class="friend-quote s text-truncate">${f.quote}</div>
                    <div class="friend-song text-truncate"><i class="bi bi-music-note-beamed"></i> ${f.song}</div>
                </div>
                ${waveHtml}
            </button>`).join('');
    };
    renderFriends();

    // Dengar bareng teman saat diklik
    const friendListBox = $('#friendList');
    if (friendListBox) {
        friendListBox.addEventListener('click', e => {
            const row = e.target.closest('.friend');
            if (!row) return;
            const f = friendData[+row.dataset.idx];
            if (!f) return;
            const rect = row.getBoundingClientRect();
            burstLikes(rect.right - 40, rect.top + 20);
            playTitle(f.song);
            say(`Dengar bareng ${f.name}: ${f.song} 🎧`);
        });
    }

    // Simulasi Live Presence Teman (dinamis berganti aktivitas secara berkala)
    const friendDynamicUpdates = [
        { name: 'Andi', quote: '“Tiba-tiba pengen kopi”', song: 'Kopi Dangdut - Fahmi Shahab' },
        { name: 'Rina', quote: '“Lagu ini enak banget!”', song: 'Bertaut - Nadin Amizah' },
        { name: 'Budi', quote: '“Gas deadline subuh 🔥”', song: 'Peradaban - .Feast' },
        { name: 'Siti', quote: '“Tenang dulu sejenak ☕”', song: 'Hati-Hati di Jalan - Tulus' }
    ];
    if (friendListBox) setInterval(() => {
        const targetIdx = Math.floor(Math.random() * friendData.length);
        const update = friendDynamicUpdates[Math.floor(Math.random() * friendDynamicUpdates.length)];
        friendData[targetIdx].quote = update.quote;
        friendData[targetIdx].song = update.song;
        const friendEls = $$('.friend', friendListBox);
        if (friendEls[targetIdx]) {
            const sub = friendEls[targetIdx].querySelector('.friend-quote');
            const song = friendEls[targetIdx].querySelector('.friend-song');
            if (sub) {
                sub.textContent = update.quote;
                if (song) song.innerHTML = `<i class="bi bi-music-note-beamed"></i> ${update.song}`;
                friendEls[targetIdx].classList.add('friend-status-flash');
                setTimeout(() => friendEls[targetIdx]?.classList.remove('friend-status-flash'), 1000);
            }
        }
    }, 15000);

    // Toggle suka / simpan + efek partikel love burst
    document.addEventListener('click', e => {
        const b = e.target.closest('[data-toggle]');
        if (!b) return;
        const on = b.classList.toggle('on');
        const iconType = b.dataset.toggle;
        b.firstElementChild.className = 'bi ' + iconType + (on ? '-fill' : '');
        if (on && iconType.includes('heart')) {
            const rect = b.getBoundingClientRect();
            burstLikes(rect.left + rect.width / 2, rect.top + rect.height / 2);
            say('Disukai ❤️');
        } else if (!on && iconType.includes('heart')) {
            say('Batal disukai');
        } else if (on && iconType.includes('bookmark')) {
            say('Tersimpan di koleksi');
        }
    });

    // Dropdown filter di search
    const fm = $('#filterMenu');
    if (fm) fm.addEventListener('click', e => {
        const a = e.target.closest('a'); if (!a) return;
        e.preventDefault();
        $$('a', fm).forEach(x => x.classList.remove('active')); a.classList.add('active');
        document.dispatchEvent(new CustomEvent('mr:filter', { detail: a.dataset.f }));
    });

    // Sidebar: link "#" placeholder
    $('.mr-sidebar')?.addEventListener('click', e => {
        const a = e.target.closest('a[href="#"]'); if (!a) return;
        if (a.id === 'openMoodCardModal' || a.closest('#openMoodCardModal')) return;
        e.preventDefault();
        if (!a.closest('#playlists') && !a.closest('#openMoodCardModal')) say('Halaman segera hadir');
    });

    // Playlist side-menu & Active Sidebar Highlights
    const PL_LIMIT = 5;
    const playlists = store.get('mr-playlists', ['Rock n Roll', 'Dangdut', 'Pop Indo', 'Indie Senja', 'Jazz Malam', 'Lo-fi Belajar', 'Akustik Santai', 'Workout Mix']);
    const curPl = /playlist\.html$/.test(location.pathname) ? new URLSearchParams(location.search).get('nama') : null;

    const updateSidebarActive = () => {
        const rawFile = location.pathname.split('/').pop().toLowerCase();
        const activeFile = (!rawFile || rawFile === 'index.html') ? 'index.html' : rawFile;

        // Reset all active classes in sidebar
        $$('.mr-sidebar .side-item, .mr-sidebar .nav-item').forEach(link => link.classList.remove('active'));

        if (activeFile === 'index.html') {
            $$('#mainNav .side-item[href="index.html"], .sidebar-nav .nav-item[href="index.html"]').forEach(link => link.classList.add('active'));
        } else if (activeFile === 'playlist.html' && !curPl) {
            $$('#mainNav .side-item[href="playlist.html"], .sidebar-nav .nav-item[href="playlist.html"]').forEach(link => link.classList.add('active'));
        } else if (/^sirkel/.test(activeFile)) {
            $$('#mainNav .side-item[href^="sirkel"], .sidebar-nav .nav-item[href^="sirkel"]').forEach(link => link.classList.add('active'));
        }

        if (activeFile === 'lagu_disukai.html') {
            $$('.mr-sidebar a[href="lagu_disukai.html"]').forEach(link => link.classList.add('active'));
        }

        if (curPl) {
            $$('#playlists a, .playlist-nav a').forEach(a => {
                if (a.title === curPl || a.textContent.trim() === curPl) a.classList.add('active');
            });
        }
    };
    updateSidebarActive();
    let showAllPl = !!curPl && playlists.indexOf(curPl) >= PL_LIMIT;
    const renderPlaylists = () => {
        const box = $('#playlists');
        if (!box) return;
        box.innerHTML = '';
        (showAllPl ? playlists : playlists.slice(0, PL_LIMIT)).forEach(n => {
            const a = document.createElement('a');
            a.href = 'playlist.html?nama=' + encodeURIComponent(n); a.className = 'side-item plain' + (n === curPl ? ' active' : ''); a.title = n;
            a.innerHTML = '<i class="bi bi-music-note-list"></i><span class="lbl"></span>';
            $('.lbl', a).textContent = n; box.appendChild(a);
        });
        if (playlists.length > PL_LIMIT) {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'pl-more'; b.id = 'plMore';
            b.title = showAllPl ? 'Lebih sedikit' : 'Lihat semua';
            b.setAttribute('aria-expanded', String(showAllPl));
            b.innerHTML = `<i class="bi bi-${showAllPl ? 'chevron-up' : 'three-dots'}"></i><span class="lbl">${showAllPl ? 'Lebih sedikit' : 'Lihat semua (' + playlists.length + ')'}</span>`;
            box.appendChild(b);
        }
    };
    $('#playlists')?.addEventListener('click', e => { if (e.target.closest('#plMore')) { showAllPl = !showAllPl; renderPlaylists(); } });
    renderPlaylists();
    window.addEventListener('mrauth:ready', () => {
        renderPlaylists();
        $('#playlists')?.addEventListener('click', e => { if (e.target.closest('#plMore')) { showAllPl = !showAllPl; renderPlaylists(); } });
        updateSidebarActive();
    });
    document.addEventListener('click', e => {
        if (!e.target.closest('#addPlaylist')) return;
        openActionModal(`
            <span class="mr-action-icon"><i class="bi bi-music-note-list"></i></span>
            <h2>Buat Playlist Baru</h2>
            <p class="mr-action-subtitle">Simpan lagu favoritmu dalam satu koleksi.</p>
            <form id="newPlaylistForm">
              <label for="newPlaylistName">Nama playlist</label>
              <input id="newPlaylistName" class="form-control" type="text" maxlength="32" placeholder="Contoh: Lagu malam" required>
              <button class="btn btn-pink w-100 rounded-pill mt-3 fw-semibold" type="submit">Buat Playlist</button>
            </form>`);
        $('#newPlaylistName')?.focus();
    });
    document.addEventListener('submit', e => {
        if (e.target.id !== 'newPlaylistForm') return;
        e.preventDefault();
        const name = $('#newPlaylistName')?.value.trim();
        if (!name) return;
        if (playlists.includes(name)) { say('Playlist dengan nama itu sudah ada'); return; }
        playlists.push(name); store.set('mr-playlists', playlists);
        if (!plSongs[name]) setSongs(name, []);
        showAllPl = true; renderPlaylists(); closeActionModal(); say('Playlist dibuat ✨');
    });
    $('#upgradeBtn')?.addEventListener('click', () => {
        location.href = 'premium-new.html';
    });
    document.addEventListener('click', e => {
        const bell = e.target.closest('[data-bell]');
        if (bell) {
            e.preventDefault();
            if (!actionMenu.classList.contains('d-none') && actionMenu.dataset.type === 'notification') {
                closeActionMenu();
                return;
            }
            closeActionModal();
            openActionMenu(bell, `
              <div class="d-flex align-items-center justify-content-between gap-2">
                <div><h2 class="mb-1">Notifikasi</h2><p class="mr-action-subtitle mb-0">Update terbaru untukmu.</p></div>
                <span class="mr-action-icon small"><i class="bi bi-bell"></i></span>
              </div>
              <div class="mr-notification-empty"><i class="bi bi-check2-circle"></i><b>Semua sudah dibaca</b><span>Belum ada notifikasi baru.</span></div>`, 'notification');
            $$('.dot', bell).forEach(d => d.remove());
            return;
        }

        const profile = e.target.closest('.profile-link');
        if (profile) {
            e.preventDefault();
            if (!actionMenu.classList.contains('d-none') && actionMenu.dataset.type === 'profile') {
                closeActionMenu();
                return;
            }
            const getProfile = () => {
                try {
                    return Object.assign(
                        { name: '', username: '', avatar: '' },
                        window.MoodAuth?.getProfile?.() || {},
                        JSON.parse(localStorage.getItem('moodroom_session') || 'null') || {}
                    );
                } catch (_) { return { name: '', username: '', avatar: '' }; }
            };
            const profileData = getProfile();
            const renderProfileMenu = () => {
                const menu = actionMenu.querySelector('.mr-profile-modal');
                const avatar = menu?.querySelector('.avatar');
                const title = menu?.querySelector('h2');
                const current = getProfile();
                if (avatar) {
                    avatar.textContent = '';
                    if (current.avatar) {
                        avatar.classList.add('has-image');
                        avatar.style.setProperty('--avatar-image', `url("${current.avatar}")`);
                    } else {
                        avatar.classList.remove('has-image');
                        avatar.style.removeProperty('--avatar-image');
                        const i = document.createElement('i');
                        i.className = 'bi bi-person-fill';
                        avatar.appendChild(i);
                    }
                }
                if (title) title.textContent = current.username ? '@' + current.username : '@';
            };
            closeActionModal();
            openActionMenu(profile, `
              <div class="mr-profile-modal">
                <span class="avatar"></span>
                <h2>@${profileData.username ? '@' + profileData.username : '@'}</h2><p class="mr-action-subtitle">Akun Gratis</p>
                <a class="btn btn-pink w-100 rounded-pill fw-semibold" href="profile-new.html">Lihat Profil</a>
                <a class="btn btn-outline-light w-100 rounded-pill mt-2" href="account-settings-new.html">Kelola Akun</a>
                <button type="button" class="btn btn-dark w-100 rounded-pill mt-2" id="mrLogoutBtn">Keluar</button>
              </div>`, 'profile');
            renderProfileMenu();
            window.addEventListener('mrauth:profile-changed', renderProfileMenu);
            document.addEventListener('mrauth:profile-changed', renderProfileMenu);
        }
    });

    document.addEventListener('click', e => {
        if (!e.target.closest('#mrLogoutBtn')) return;
        localStorage.removeItem('moodroom_session');
        location.href = 'login.html';
    });

    // ===== Sirkel Kita Widget (Dinamis Fluktuasi Pendengar & Stream Reaksi) =====
    $('#shareBtn')?.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText('#Kamar_Hapis'); say('Kode room disalin: #Kamar_Hapis 🔗'); } catch { say('Kode: #Kamar_Hapis'); }
    });
    $('#enterRoomBtn')?.addEventListener('click', e => {
        e.preventDefault();
        location.href = 'sirkel-sendiri.html';
    });

    // Simulasi live stream pendengar naik-turun halus
    setInterval(() => {
        const lEl = $('#listeners');
        if (!lEl) return;
        let c = parseInt(lEl.textContent, 10) || 42;
        const delta = Math.random() > 0.48 ? 1 : -1;
        c = Math.max(38, Math.min(52, c + delta));
        lEl.textContent = c;
        lEl.classList.add('sirkel-counter-pulse');
        setTimeout(() => lEl.classList.remove('sirkel-counter-pulse'), 350);
    }, 6000);

    // Simulasi reaksi melayang dari sirkel live streaming room
    setInterval(() => {
        const panel = $('#listeners')?.closest('.panel');
        if (!panel) return;
        const rect = panel.getBoundingClientRect();
        if (rect.top > 0 && rect.bottom < window.innerHeight + 100) {
            const emojis = ['🔥', '🎵', '❤️', '👏', '✨', '🎧'];
            spawnParticle(emojis[Math.floor(Math.random() * emojis.length)], rect.right - 40, rect.bottom - 45);
        }
    }, 7000);


    // =========================================================================
    // MASTER TRACKS & AUDIO ENGINE (HTML5 Audio Player)
    // =========================================================================
    const ALBUM_COVERS = {
        'Back in Black': 'img/covers/semangat_concert.jpg',
        'Highway to Hell': 'img/covers/semangat_concert.jpg',
        'Appetite for Destruction': 'img/covers/semangat_concert.jpg',
        'A Night at the Opera': 'img/covers/playlist_pop.jpg',
        'Nevermind': 'img/covers/semangat_concert.jpg',
        'Minoritas': 'img/covers/semangat_concert.jpg',
        'Sayang': 'img/covers/playlist_dangdut.jpg',
        'Single': 'img/covers/playlist_pop.jpg',
        'Kopi Dangdut': 'img/covers/playlist_dangdut.jpg',
        'Manusia': 'img/covers/santai_coffee.jpg',
        'Sialnya, Hidup Harus Tetap Berjalan': 'img/covers/galau_room.jpg',
        'Usai': 'img/covers/galau_city.jpg',
        'Mantra Mantra': 'img/covers/santai_nature.jpg',
        'Selamat Ulang Tahun': 'img/covers/santai_sunset.jpg',
        'Menari Dengan Bayangan': 'img/covers/galau_night.jpg',
        'Runtuh': 'img/covers/galau_night.jpg',
        'Time Out': 'img/covers/fokus_jazz.jpg',
        'Kind of Blue': 'img/covers/fokus_jazz.jpg',
        'Empyrean Isles': 'img/covers/fokus_jazz.jpg',
        "Moanin'": 'img/covers/fokus_jazz.jpg',
        'Study Beats Vol. 1': 'img/covers/fokus_desk.jpg',
        'Pagi Pelan': 'img/covers/fokus_desk.jpg',
        'Fokus Dulu': 'img/covers/fokus_desk.jpg',
        'Bergema Sampai Selamanya': 'img/covers/santai_nature.jpg',
        "Short n' Sweet": 'img/covers/playlist_pop.jpg',
        'Membangun & Menghancurkan': 'img/covers/semangat_concert.jpg',
        'After Hours': 'img/covers/semangat_neon.jpg'
    };
    const albumCover = title => ALBUM_COVERS[title] || '';

    const MASTER_TRACKS = [
        { title: 'Evaluasi - Hindia', dur: '3:31', sec: 211, grad: ['#8a6a40', '#2c1a0c'], cover: 'img/covers/galau_night.jpg', src: 'music/Hindia-Evaluasi.mp3' },
        { title: 'Bergema Sampai Selamanya - Nadhif Basalamah', dur: '3:26', sec: 206, grad: ['#a8b878', '#3a5a2c'], cover: 'img/covers/santai_nature.jpg', src: 'music/NadhifBasalamah-BergemaSampaiSelamanya.mp3' },
        { title: 'Satu Bulan - Bernadya', dur: '3:19', sec: 199, grad: ['#4a3a38', '#0c0a0c'], cover: 'img/covers/galau_room.jpg', src: 'music/Bernadya-SatuBulan.mp3' },
        { title: 'Nina - .Feast', dur: '4:37', sec: 277, grad: ['#d4553a', '#5a1a14'], cover: 'img/covers/semangat_concert.jpg', src: 'music/Feast-Nina.mp3' },
        { title: 'Secukupnya - Hindia', dur: '3:27', sec: 207, grad: ['#8a6a40', '#2c1a0c'], cover: 'img/covers/galau_night.jpg', src: 'music/Hindia-Secukupnya.mp3' },
        { title: 'Usai - Tiara Andini', dur: '3:37', sec: 217, grad: ['#f4f0f4', '#a8c0e0'], cover: 'img/covers/galau_city.jpg', src: 'music/TiaraAndini-Usai.mp3' },
        { title: 'Peradaban - .Feast', dur: '4:02', sec: 242, grad: ['#d4553a', '#5a1a14'], cover: 'img/covers/semangat_concert.jpg', src: 'music/Feast-Peradaban.mp3' },
        { title: 'Cincin - Hindia', dur: '3:45', sec: 225, grad: ['#8a6a40', '#2c1a0c'], cover: 'img/covers/santai_sunset.jpg', src: 'music/Hindia-Cincin.mp3' },
        { title: 'Blinding Lights - The Weeknd', dur: '3:20', sec: 200, grad: ['#e0405a', '#3a0a1a'], cover: 'img/covers/semangat_neon.jpg', src: 'music/The Weeknd-BlindingLights.mp3' },
        { title: 'Hati-Hati di Jalan - Tulus', dur: '4:12', sec: 252, grad: ['#6a8ac0', '#1a2a50'], cover: 'img/covers/santai_coffee.jpg', src: 'music/TULUS-Hati-HatidiJalan.mp3' },
        { title: 'Rainy Window - Lo-fi Collective', dur: '2:48', sec: 168, grad: ['#4a7a9a', '#14304a'], cover: 'img/covers/fokus_desk.jpg', src: 'music/LoFiCollective-RainyWindow.mp3' }
    ];

    const findTrackIdx = title => {
        if (!title) return -1;
        const q = title.toLowerCase().trim();
        const exact = MASTER_TRACKS.findIndex(x => x.title.toLowerCase() === q);
        if (exact !== -1) return exact;
        return MASTER_TRACKS.findIndex(x => {
            const xt = x.title.toLowerCase();
            return q.includes(xt) || q === xt.split(' - ')[0];
        });
    };

    const playerAudio = new Audio();
    const saved = store.get('mr-player', { title: 'Evaluasi - Hindia', playing: true, pct: 40 });
    let playing = !!saved.playing, pct = +saved.pct || 0, timer, currentEl = null, playingTitle = saved.title;
    let currentTrackIdx = findTrackIdx(playingTitle);
    let currentAudioSrc = '';
    let pendingSeekPct = null;
    let scrubDragging = false;

    // Audio Visualizer Spectrum injector
    const ensureVisualizer = () => {
        const pLeft = $('.player .p-left');
        if (pLeft && !pLeft.querySelector('.player-viz')) {
            const viz = document.createElement('div');
            viz.className = 'player-viz d-none d-md-flex';
            viz.title = 'Audio Spectrum';
            viz.innerHTML = '<span></span><span></span><span></span><span></span><span></span>';
            const exp = pLeft.querySelector('.p-exp');
            if (exp) pLeft.insertBefore(viz, exp); else pLeft.appendChild(viz);
        }
    };
    ensureVisualizer();

    const save = () => store.set('mr-player', { title: playingTitle, playing, pct });
    const playIcon = $('#playBtn i');

    // Update Cover Gradient & Art
    const updatePlayerCover = (trackObj) => {
        const covers = $$('.player .cover.sm, #playerSheet .cover.sm');
        if (!trackObj) return;
        if (trackObj.cover) {
            covers.forEach(c => c.style.background = `url('${trackObj.cover}') center/cover`);
        } else if (trackObj.grad) {
            covers.forEach(c => c.style.background = `linear-gradient(135deg, ${trackObj.grad[0]}, ${trackObj.grad[1]})`);
        }
    };

    const getCurTrack = () => MASTER_TRACKS[currentTrackIdx] || { title: playingTitle, dur: '3:31', sec: 211, grad: ['#8a6a40', '#2c1a0c'] };

    const fmtTime = s => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return m + ':' + String(sec).padStart(2, '0');
    };

    const updateTimeDisplay = () => {
        const t = getCurTrack();
        const hasDur = Number.isFinite(playerAudio.duration) && playerAudio.duration > 0;
        const totalSec = hasDur ? playerAudio.duration : t.sec;
        const totalStr = hasDur ? fmtTime(totalSec) : t.dur;
        const curSec = (pct / 100) * totalSec;
        const curStr = fmtTime(curSec);
        const timeNow = $('#timeNow');
        if (timeNow) timeNow.textContent = `${curStr} / ${totalStr}`;
        const timeCur = $('#timeCur');
        if (timeCur) {
            timeCur.textContent = curStr;
            if (timeCur.nextElementSibling) timeCur.nextElementSibling.textContent = totalStr;
        }
        const nowTitleEl = $('#nowTitle');
        if (nowTitleEl && nowTitleEl.textContent !== playingTitle) nowTitleEl.textContent = playingTitle;
    };

    const loadTrackAudio = (src, initialPct = 0) => {
        if (!src) {
            currentAudioSrc = '';
            pendingSeekPct = null;
            playerAudio.pause();
            playerAudio.removeAttribute('src');
            playerAudio.load();
            return;
        }
        if (currentAudioSrc !== src) {
            currentAudioSrc = src;
            pendingSeekPct = initialPct > 0 ? initialPct : null;
            playerAudio.src = src;
            playerAudio.load();
        }
    };

    playerAudio.addEventListener('loadedmetadata', () => {
        if (pendingSeekPct !== null && Number.isFinite(playerAudio.duration) && playerAudio.duration > 0) {
            playerAudio.currentTime = Math.min(playerAudio.duration, Math.max(0, playerAudio.duration * (pendingSeekPct / 100)));
            pendingSeekPct = null;
        }
        updateTimeDisplay();
    });

    playerAudio.addEventListener('ended', () => {
        if ($('#repeatBtn')?.classList.contains('on')) {
            pct = 0;
            playerAudio.currentTime = 0;
            playerAudio.play().catch(() => {});
            updateTimeDisplay();
            save();
        } else {
            nextTrack();
        }
    });

    playerAudio.addEventListener('error', () => {
        currentAudioSrc = '';
        pendingSeekPct = null;
    });

    const nowTitleEl = $('#nowTitle');
    if (nowTitleEl) nowTitleEl.textContent = playingTitle;
    const progLine = $('.progress-line');
    if (progLine) progLine.classList.toggle('can-seek', true);
    const progBar = $('#progBar');
    if (progBar) progBar.style.width = pct + '%';
    const progThumb = document.createElement('i');
    progThumb.className = 'scrub-thumb';
    progThumb.setAttribute('aria-hidden', 'true');
    if (progLine) progLine.appendChild(progThumb);
    if (progThumb) progThumb.style.left = pct + '%';
    updatePlayerCover(getCurTrack());
    updateTimeDisplay();

    function refreshCards() {
        $$('.pbadge i').forEach(i => { i.className = 'bi ' + (playing && i.closest('.is-playing') ? 'bi-pause-fill' : 'bi-play-fill'); });
        $$('.play-card').forEach(b => {
            const on = playing && b.closest('.mcard')?.classList.contains('is-playing');
            b.innerHTML = on ? '<i class="bi bi-pause-fill"></i> Pause' : '<i class="bi bi-play-fill"></i> Play';
        });
    }

    const tick = () => {
        let guest = true;
        try { guest = !JSON.parse(localStorage.getItem('moodroom_session') || 'null'); }
        catch (_) { guest = true; }
        if (guest) {
            guestPlaybackSeconds += 1;
            if (guestPlaybackSeconds >= 60) {
                setPlaying(false);
                showGuestLoginModal();
                return;
            }
        }
        if (!scrubDragging) {
            const hasDur = playerAudio.readyState >= 1 && Number.isFinite(playerAudio.duration) && playerAudio.duration > 0;
            if (hasDur && !playerAudio.paused) {
                pct = Math.max(0, Math.min(100, (playerAudio.currentTime / playerAudio.duration) * 100));
            } else if (!getCurTrack()?.src) {
                pct = pct >= 100 ? 0 : pct + 0.5;
            }
        }
        if (progBar) progBar.style.width = pct + '%';
        if (progThumb) progThumb.style.left = pct + '%';
        updateTimeDisplay();
        if (songDetailEl?.classList.contains('show') && $('#songDetailProgress')) {
            $('#songDetailProgress').style.width = `${pct}%`;
        }
        save();
    };

    const setPlaying = p => {
        playing = p;
        if (playIcon) playIcon.className = 'bi ' + (p ? 'bi-pause-fill' : 'bi-play-fill');
        const detailPlayBtn = $('#songDetailPlay');
        if (detailPlayBtn) detailPlayBtn.innerHTML = `<i class="bi bi-${p ? 'pause' : 'play'}-fill"></i> ${p ? 'Jeda' : 'Putar'}`;
        clearInterval(timer);
        if (p) {
            const src = getCurTrack()?.src;
            if (src) {
                loadTrackAudio(src, pct);
                const playPromise = playerAudio.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(err => {
                        if (err && err.name === 'NotAllowedError') {
                            setPlaying(false);
                        }
                    });
                }
            }
            timer = setInterval(tick, 1000);
        } else {
            playerAudio.pause();
        }
        document.body.classList.toggle('is-paused', !p);
        refreshCards();
        save();
    };

    const playTitle = (t, el) => {
        let guest = true;
        try { guest = !JSON.parse(localStorage.getItem('moodroom_session') || 'null'); }
        catch (_) { guest = true; }
        if (guest) {
            guestPlaybackSeconds = 0;
            guestLoginModalShown = false;
        }
        if (el && el.classList.contains('is-playing')) {
            setPlaying(!playing);
            return;
        }
        playingTitle = t;
        currentTrackIdx = findTrackIdx(t);
        const track = getCurTrack();
        currentAudioSrc = '';
        loadTrackAudio(track?.src || '', 0);
        if (nowTitleEl) nowTitleEl.textContent = t;
        pct = 0;
        if (progBar) progBar.style.width = '0%';
        if (progThumb) progThumb.style.left = '0%';
        updatePlayerCover(track);
        setPlaying(true);
        $$('.is-playing').forEach(x => x.classList.remove('is-playing'));
        if (el) { el.classList.add('is-playing'); currentEl = el; }
        refreshCards();
        updateTimeDisplay();
        say('Memutar: ' + t + ' 🎶');
    };

    // Detail lagu di beranda
    const songDetailEl = $('#songDetailModal');
    const songDetail = songDetailEl ? bootstrap.Modal.getOrCreateInstance(songDetailEl) : null;
    let detailTrackTitle = '';
    const showSongDetail = (title, source) => {
        if (!songDetail) return;
        detailTrackTitle = title;
        const track = MASTER_TRACKS.find(item => item.title.toLowerCase() === title.toLowerCase())
            || getCurTrack();
        const parts = title.split(' - ');
        const artist = parts.length > 1 ? parts.slice(1).join(' - ') : 'MoodRoom Artist';
        const detailCover = $('#songDetailCover');
        if (detailCover) {
            detailCover.style.background = track.cover
                ? `linear-gradient(180deg, rgba(15,4,27,.05) 30%, rgba(15,4,27,.68)), url('${track.cover}') center/cover`
                : `linear-gradient(135deg, ${track.grad[0]}, ${track.grad[1]})`;
        }
        if ($('#songDetailTitle')) $('#songDetailTitle').textContent = parts[0];
        if ($('#songDetailArtist')) $('#songDetailArtist').textContent = artist;
        if ($('#songDetailMeta')) $('#songDetailMeta').innerHTML = `<span><i class="bi bi-disc"></i> MoodRoom Vibes</span><span><i class="bi bi-clock"></i> ${track.dur}</span>`;
        if ($('#songDetailProgress')) $('#songDetailProgress').style.width = `${pct}%`;
        const playButton = $('#songDetailPlay');
        if (playButton) playButton.innerHTML = `<i class="bi bi-${playing ? 'pause' : 'play'}-fill"></i> ${playing ? 'Jeda' : 'Putar'}`;
        songDetail.show();
    };
    $('#songDetailPlay')?.addEventListener('click', () => {
        setPlaying(!playing);
        const button = $('#songDetailPlay');
        if (button) button.innerHTML = `<i class="bi bi-${playing ? 'pause' : 'play'}-fill"></i> ${playing ? 'Jeda' : 'Putar'}`;
    });
    $('#songDetailLike')?.addEventListener('click', e => {
        const on = e.currentTarget.classList.toggle('on');
        e.currentTarget.innerHTML = `<i class="bi bi-heart${on ? '-fill' : ''}"></i>`;
        say(on ? 'Lagu disukai ❤️' : 'Batal disukai');
    });
    $('#songDetailPlaylist')?.addEventListener('click', () => say(`"${detailTrackTitle}" siap ditambahkan ke playlist`));

    // Pindah ke lagu berikutnya
    const nextTrack = () => {
        if ($('#shuffleBtn')?.classList.contains('on') && MASTER_TRACKS.length > 1) {
            let randIdx = currentTrackIdx;
            while (randIdx === currentTrackIdx) {
                randIdx = Math.floor(Math.random() * MASTER_TRACKS.length);
            }
            currentTrackIdx = randIdx;
        } else {
            currentTrackIdx = (currentTrackIdx + 1) % MASTER_TRACKS.length;
        }
        const next = MASTER_TRACKS[currentTrackIdx];
        playTitle(next.title);
    };

    // Pindah ke lagu sebelumnya
    const prevTrack = () => {
        if (pct > 6) {
            pct = 0;
            pendingSeekPct = null;
            if (Number.isFinite(playerAudio.duration) && playerAudio.duration > 0) {
                playerAudio.currentTime = 0;
            }
            if (progBar) progBar.style.width = '0%';
            if (progThumb) progThumb.style.left = '0%';
            updateTimeDisplay();
            save();
            say('Ulangi lagu dari awal ⏪');
        } else {
            currentTrackIdx = currentTrackIdx <= 0
                ? MASTER_TRACKS.length - 1
                : currentTrackIdx - 1;
            const prev = MASTER_TRACKS[currentTrackIdx];
            playTitle(prev.title);
        }
    };

    const restoreMark = () => {
        if (!$('.is-playing')) {
            const el = $$('.song-row, .track').find(x => x.dataset.title === playingTitle);
            if (el) { el.classList.add('is-playing'); currentEl = el; }
        }
        refreshCards();
    };
    setPlaying(playing);

    // Player button controls
    $('#playBtn')?.addEventListener('click', () => setPlaying(!playing));
    $('#prevBtn')?.addEventListener('click', () => prevTrack());
    $('#nextBtn')?.addEventListener('click', () => nextTrack());

    ['shuffleBtn', 'repeatBtn'].forEach(id => {
        const b = $('#' + id);
        if (b) b.addEventListener('click', e => {
            const on = e.currentTarget.classList.toggle('on');
            say(id === 'shuffleBtn' ? (on ? 'Acak lagu aktif 🔀' : 'Acak nonaktif') : (on ? 'Ulangi lagu aktif 🔁' : 'Ulangi nonaktif'));
        });
    });

    // Heart in player
    $('#loveBtn')?.addEventListener('click', e => {
        const on = e.currentTarget.classList.toggle('on');
        const rect = e.currentTarget.getBoundingClientRect();
        if (on) burstLikes(rect.left + rect.width / 2, rect.top);
        say(on ? 'Lagu disukai ❤️' : 'Batal disukai');
    });

    // Progress line interactive scrubber & tooltip
    let scrubTip = $('#scrubTip');
    if (progLine && !scrubTip) {
        scrubTip = document.createElement('div');
        scrubTip.className = 'scrub-tooltip';
        scrubTip.id = 'scrubTip';
        progLine.appendChild(scrubTip);
    }

    if (progLine) {
        let scrubMoved = false;
        let suppressScrubClick = false;
        const getScrubPct = clientX => {
            const r = progLine.getBoundingClientRect();
            if (!r.width) return 0;
            return Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
        };
        const getTotalSec = () => (Number.isFinite(playerAudio.duration) && playerAudio.duration > 0)
            ? playerAudio.duration
            : getCurTrack().sec;
        const previewScrub = clientX => {
            const hoverPct = getScrubPct(clientX);
            const r = progLine.getBoundingClientRect();
            const hoverSec = (hoverPct / 100) * getTotalSec();
            if (scrubTip) {
                scrubTip.style.left = (clientX - r.left) + 'px';
                scrubTip.textContent = fmtTime(hoverSec);
            }
            if (progThumb) progThumb.style.left = hoverPct + '%';
            return hoverPct;
        };
        const commitScrub = (clientX, announce) => {
            pct = previewScrub(clientX);
            if (progBar) progBar.style.width = pct + '%';
            if (progThumb) progThumb.style.left = pct + '%';
            const hasDur = Number.isFinite(playerAudio.duration) && playerAudio.duration > 0;
            if (hasDur) {
                playerAudio.currentTime = Math.min(playerAudio.duration, Math.max(0, playerAudio.duration * (pct / 100)));
                pendingSeekPct = null;
            } else if (getCurTrack()?.src) {
                pendingSeekPct = pct;
            }
            updateTimeDisplay();
            save();
            if (announce) say('Posisi: ' + fmtTime((pct / 100) * getTotalSec()));
        };
        progLine.addEventListener('mousemove', e => {
            if (!scrubDragging) previewScrub(e.clientX);
        });
        progLine.addEventListener('pointerdown', e => {
            scrubDragging = true;
            scrubMoved = false;
            progLine.classList.add('is-dragging');
            progLine.setPointerCapture?.(e.pointerId);
            commitScrub(e.clientX, false);
            e.preventDefault();
        });
        progLine.addEventListener('pointermove', e => {
            if (!scrubDragging) return;
            scrubMoved = true;
            commitScrub(e.clientX, false);
        });
        progLine.addEventListener('pointerup', e => {
            if (!scrubDragging) return;
            commitScrub(e.clientX, true);
            scrubDragging = false;
            progLine.classList.remove('is-dragging');
            suppressScrubClick = scrubMoved;
            progLine.releasePointerCapture?.(e.pointerId);
        });
        progLine.addEventListener('pointercancel', e => {
            scrubDragging = false;
            progLine.classList.remove('is-dragging');
            progLine.releasePointerCapture?.(e.pointerId);
        });
        progLine.addEventListener('click', e => {
            if (suppressScrubClick) {
                suppressScrubClick = false;
                return;
            }
            commitScrub(e.clientX, true);
        });
    }

    // Delegasi klik pemutaran
    document.addEventListener('click', e => {
        const t = e.target.closest('.track, .album');
        if (t && t.dataset.title) {
            playTitle(t.dataset.title, t);
            if (t.classList.contains('track')) showSongDetail(t.dataset.title, t);
        }
        const sr = e.target.closest('.song-row');
        if (sr && !e.target.closest('.ibtn, .dropdown') && sr.dataset.title) {
            playTitle(sr.dataset.title, sr);
        }
        const pc = e.target.closest('.play-card');
        if (pc) {
            const cardEl = pc.closest('.mcard');
            const cardTitle = cardEl?.dataset.track || 'Usia-Usia Dewasa - Lomba Sihir';
            playTitle(cardTitle, cardEl);
            showSongDetail(cardTitle, cardEl);
        }
    });

    document.addEventListener('keydown', e => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.track, .album, .song-row')) {
            e.preventDefault();
            playTitle(e.target.dataset.title, e.target);
            if (e.target.classList.contains('track')) showSongDetail(e.target.dataset.title, e.target);
        }
    });

    // Volume: batang berwarna = level volume
    let level = +store.get('mr-vol', 7), last = level || 7;
    $$('.vol').forEach(v => v.innerHTML = Array.from({ length: 10 }, (_, i) => `<span data-i="${i}"></span>`).join(''));
    const setVol = n => {
        const clamped = Math.max(0, Math.min(10, Number(n) || 0));
        level = clamped;
        playerAudio.volume = clamped / 10;
        playerAudio.muted = clamped === 0;
        store.set('mr-vol', clamped);
        $$('.vol').forEach(v => $$('span', v).forEach((x, i) => x.classList.toggle('on', i < clamped)));
        const muteIco = $('#muteBtn i');
        if (muteIco) muteIco.className = 'bi ' + (clamped === 0 ? 'bi-volume-mute-fill' : clamped < 4 ? 'bi-volume-down-fill' : 'bi-volume-up-fill');
        const sMuteIco = $('#sMute i');
        if (sMuteIco) sMuteIco.className = 'bi ' + (clamped === 0 ? 'bi-volume-mute-fill' : clamped < 4 ? 'bi-volume-down-fill' : 'bi-volume-up-fill');
    };
    setVol(level);
    document.addEventListener('click', e => {
        const x = e.target.closest('.vol span');
        if (x) setVol(+x.dataset.i + 1);
    });
    $('#muteBtn')?.addEventListener('click', () => {
        if (level > 0) { last = level; setVol(0); }
        else { setVol(last || 7); }
    });

    // Reaksi & Chat (Dengan Partikel Melayang)
    $$('[data-react]').forEach(b => b.addEventListener('click', e => {
        const r = b.dataset.react;
        if (r === 'chat') {
            document.dispatchEvent(new CustomEvent('mr:chat-toggle'));
            if (!document.body.classList.contains('sirkel-page')) say('Chat segera hadir 💬');
            return;
        }
        const rect = b.getBoundingClientRect();
        spawnParticle(r, rect.left + rect.width / 2, rect.top);
        say('Reaksi ' + r + ' terkirim ✨');
    }));

    // Panel Pemutar Mobile Sheet
    const sheetEl = $('#playerSheet');
    const sheet = sheetEl ? bootstrap.Offcanvas.getOrCreateInstance(sheetEl) : null;
    $('.p-left')?.addEventListener('click', e => {
        if (!e.target.closest('.player-viz') && sheet && innerWidth < 992) sheet.show();
    });
    $$('[data-proxy]').forEach(b => b.addEventListener('click', () => $(b.dataset.proxy)?.click()));
    const sync = () => {
        if (!sheetEl || !sheetEl.classList.contains('show')) return;
        const w = parseFloat($('#progBar')?.style.width) || 0;
        const progM = $('#progBarM');
        if (progM) progM.style.width = w + '%';
        const stTitle = $('#sheetTitle');
        if (stTitle) stTitle.textContent = $('#nowTitle')?.textContent || '';
        const sPlayI = $('#sPlay i');
        if (sPlayI && playIcon) sPlayI.className = playIcon.className;
        const sMuteI = $('#sMute i');
        const muteI = $('#muteBtn i');
        if (sMuteI && muteI) sMuteI.className = muteI.className;
        [['shuffleBtn', 'sShuffle'], ['repeatBtn', 'sRepeat'], ['loveBtn', 'sLove']].forEach(([a, b]) => {
            const aEl = $('#' + a);
            const bEl = $('#' + b);
            if (aEl && bEl) bEl.classList.toggle('on', aEl.classList.contains('on'));
        });
    };
    setInterval(sync, 250);
    if (sheetEl) sheetEl.addEventListener('show.bs.offcanvas', sync);

    // Sidebar expand / collapse (desktop)
    const layout = $('.layout'), tgl = $('#sideToggle');
    const setCollapsed = c => {
        if (!layout || !tgl) return;
        layout.classList.toggle('collapsed', c);
        if (tgl.firstElementChild) tgl.firstElementChild.className = 'bi ' + (c ? 'bi-chevron-double-right' : 'bi-chevron-double-left');
        tgl.setAttribute('aria-expanded', String(!c));
        tgl.title = c ? 'Perluas sidebar' : 'Ciutkan sidebar';
        store.set('mr-side', c);
    };
    if (tgl) {
        setCollapsed(store.get('mr-side', false) === true);
        tgl.addEventListener('click', () => setCollapsed(!layout.classList.contains('collapsed')));
    }
    $$('.side-item').forEach(a => a.title = a.textContent.trim());

    // Playlist Data Management
    const PL_DEFAULTS = {
        'Rock n Roll': [['Back In Black', 'AC/DC', 'Back in Black', '4:15'], ['Highway to Hell', 'AC/DC', 'Highway to Hell', '3:28'], ["Sweet Child O' Mine", "Guns N' Roses", 'Appetite for Destruction', '5:56'], ['Bohemian Rhapsody', 'Queen', 'A Night at the Opera', '5:55'], ['Smells Like Teen Spirit', 'Nirvana', 'Nevermind', '5:01'], ['Terlalu Manis', 'Slank', 'Minoritas', '4:20']],
        'Dangdut': [['Sayang', 'Via Vallen', 'Sayang', '4:02'], ['Sakitnya Tuh Di Sini', 'Cita Citata', 'Single', '3:51'], ['Kopi Dangdut', 'Fahmi Shahab', 'Kopi Dangdut', '4:30'], ['Goyang Dumang', 'Cita Citata', 'Single', '3:40'], ['Tabola Bale', 'Silet Open Up', 'Single', '3:05']],
        'Pop Indo': [['Hati-Hati di Jalan', 'Tulus', 'Manusia', '4:12'], ['Komang', 'Raim Laode', 'Single', '4:33'], ['Satu Bulan', 'Bernadya', 'Sialnya, Hidup Harus Tetap Berjalan', '3:19'], ['Usai', 'Tiara Andini', 'Usai', '3:37'], ['Rehat', 'Kunto Aji', 'Mantra Mantra', '5:28'], ['Bertaut', 'Nadin Amizah', 'Selamat Ulang Tahun', '5:15']],
        'Indie Senja': [['Evaluasi', 'Hindia', 'Menari Dengan Bayangan', '3:31'], ['Secukupnya', 'Hindia', 'Menari Dengan Bayangan', '3:25'], ['Cincin', 'Hindia', 'Menari Dengan Bayangan', '3:45'], ['Rumah ke Rumah', 'Hindia', 'Menari Dengan Bayangan', '4:37'], ['Pilu Membiru', 'Kunto Aji', 'Mantra Mantra', '4:11'], ['Runtuh', 'Feby Putri, Fiersa Besari', 'Runtuh', '3:43']],
        'Jazz Malam': [['Take Five', 'Dave Brubeck', 'Time Out', '5:24'], ['So What', 'Miles Davis', 'Kind of Blue', '9:22'], ['Blue in Green', 'Miles Davis', 'Kind of Blue', '5:37'], ['Cantaloupe Island', 'Herbie Hancock', 'Empyrean Isles', '5:32'], ["Moanin'", 'Art Blakey', "Moanin'", '9:20']],
        'Lo-fi Belajar': [['Rainy Window', 'Lo-fi Collective', 'Study Beats Vol. 1', '2:48'], ['Late Night Notes', 'Lo-fi Collective', 'Study Beats Vol. 1', '3:02'], ['Warm Coffee', 'Kopi Tenang', 'Pagi Pelan', '2:35'], ['Desk Lamp', 'Kopi Tenang', 'Pagi Pelan', '3:14'], ['Slow Scroll', 'Nada Sunyi', 'Fokus Dulu', '2:57']],
        'Akustik Santai': [['Hati-Hati di Jalan', 'Tulus', 'Manusia', '4:12'], ['Komang', 'Raim Laode', 'Single', '4:33'], ['Bertaut', 'Nadin Amizah', 'Selamat Ulang Tahun', '5:15'], ['Bergema Sampai Selamanya', 'Nadhif Basalamah', 'Bergema Sampai Selamanya', '3:26']],
        'Workout Mix': [['Blinding Lights', 'The Weeknd', 'After Hours', '3:20'], ['Espresso', 'Sabrina Carpenter', "Short n' Sweet", '2:55'], ['Peradaban', '.Feast', 'Membangun & Menghancurkan', '4:02'], ['Nina', '.Feast', 'Membangun & Menghancurkan', '4:37'], ['Highway to Hell', 'AC/DC', 'Highway to Hell', '3:28']]
    };
    const plSongs = store.get('mr-pl-songs', {});
    const getSongs = n => plSongs[n] || PL_DEFAULTS[n] || [];
    const setSongs = (n, list) => { plSongs[n] = list; store.set('mr-pl-songs', plSongs); };
    const savePlaylists = () => store.set('mr-playlists', playlists);
    const removePlaylist = n => {
        const i = playlists.indexOf(n); if (i > -1) playlists.splice(i, 1);
        savePlaylists(); plSongs[n] = []; store.set('mr-pl-songs', plSongs);
    };

    const pickEl = document.createElement('div');
    pickEl.className = 'modal fade'; pickEl.id = 'plPicker'; pickEl.tabIndex = -1;
    pickEl.innerHTML = `<div class="modal-dialog modal-dialog-centered modal-sm"><div class="modal-content mr-modal">
    <div class="modal-header border-0 pb-0"><h6 class="modal-title fw-bold">Tambah ke playlist</h6><button class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Tutup"></button></div>
    <div class="modal-body"><div class="small text-white-50 mb-3 text-truncate" id="plPickSong"></div><div class="d-grid gap-2" id="plPickList"></div></div></div></div>`;
    document.body.appendChild(pickEl);
    const pickModal = new bootstrap.Modal(pickEl);
    let pickSong = null;
    const addToPlaylist = song => {
        pickSong = song;
        $('#plPickSong').textContent = song[0] + ' — ' + song[1];
        const box = $('#plPickList'); box.innerHTML = '';
        if (!playlists.length) box.innerHTML = '<div class="text-white-50 small">Belum ada playlist. Buat dulu lewat tombol + di sidebar.</div>';
        playlists.forEach(n => {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'pick-btn'; b.dataset.n = n;
            b.innerHTML = '<i class="bi bi-music-note-list"></i><span class="text-truncate"></span>';
            $('span', b).textContent = n; box.appendChild(b);
        });
        pickModal.show();
    };
    $('#plPickList')?.addEventListener('click', e => {
        const b = e.target.closest('.pick-btn'); if (!b || !pickSong) return;
        const n = b.dataset.n, list = [...getSongs(n)];
        pickModal.hide();
        if (list.some(x => x[0] === pickSong[0] && x[1] === pickSong[1])) { say('Sudah ada di ' + n); return; }
        list.push(pickSong); setSongs(n, list); say('Berhasil ditambahkan ke ' + n + ' 🎶');
    });

    // Global MR API
    window.MR = {
        playlists, savePlaylists, getSongs, setSongs, addToPlaylist, removePlaylist, $, $$, say, store,
        playTitle, refreshCards, restoreMark, setPlaying, nextTrack, prevTrack, burstLikes, spawnParticle, albumCover,
        isPlayingTitle: t => {
            if (!t || !playingTitle) return false;
            const a = t.toLowerCase().trim(), b = playingTitle.toLowerCase().trim();
            return a === b || a.includes(b) || b.includes(a);
        }, isPlaying: () => playing
    };
})();
