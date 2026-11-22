/* ===== MoodRoom - Halaman Profil =====
   Satu file JS untuk semua halaman di folder profile/.
   Sidebar, panel kanan, dan music player dibuat dari sini (renderLayout),
   jadi cukup diubah di satu tempat. */
(function () {
  'use strict';

  /* ---------- PENGATURAN YANG BISA DIUBAH TEMAN SATU KELOMPOK ---------- */
  var LINKS = {
    home: '../index.html',      // Home kelompok (di folder utama repo)
    jelajah: '#',            // Jelajah Playlist
    sirkel: '#',             // Sirkel
    laguDisukai: '../lagu_disukai.html',
    moodcardSaya: '#',       // MoodCard Saya
    playlist: '#'            // Playlistku
  };
  var LOGIN_URL = '';        // isi halaman login saat Keluar Akun, mis. '../login.html'

  /* ---------- Penyimpanan (localStorage) ---------- */
  var KEY = 'moodroom_profile', SKEY = 'moodroom_settings';
  var DEFAULTS = {
    name: 'Dimas Alif', username: 'dimas',
    bio: 'Mengumpulkan lagu dan MoodCard sesuai suasana hati',
    location: 'Indonesia', mood: 'Santai',
    email: 'dimas@gmail.com', joined: '12 Jan 2025', avatar: ''
  };
  function load(key, def) {
    try { return Object.assign({}, def, JSON.parse(localStorage.getItem(key) || '{}')); }
    catch (e) { return Object.assign({}, def); }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }
  var profile = load(KEY, DEFAULTS);

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

  /* ---------- Toast ---------- */
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }

  /* ---------- Layout bersama ---------- */
  function avatarHTML(cls) {
    return '<div class="avatar ' + (cls || '') + '">' + esc((profile.name || 'D').charAt(0).toUpperCase()) +
      '<img data-avatar src="img/avatar.jpg" alt="Foto profil" onerror="this.style.display=\'none\'"></div>';
  }

  function renderLayout() {
    var side = $('#sidebar');
    if (side) {
      side.innerHTML =
        '<a class="brand" href="' + LINKS.home + '"><i class="bi bi-music-note-beamed"></i>MoodRoom</a>' +
        '<div class="side-title">Menu utama</div>' +
        '<a class="nav-item active" href="' + LINKS.home + '"><i class="bi bi-house"></i>Home</a>' +
        '<a class="nav-item" href="' + LINKS.jelajah + '"><i class="bi bi-compass"></i>Jelajah Playlist</a>' +
        '<a class="nav-item" href="' + LINKS.sirkel + '"><i class="bi bi-people"></i>Sirkel</a>' +
        '<div class="side-title">Koleksi Pribadi</div>' +
        '<a class="nav-item" href="' + LINKS.laguDisukai + '"><i class="bi bi-heart"></i>Lagu disukai</a>' +
        '<a class="nav-item" href="' + LINKS.moodcardSaya + '"><span class="heart-icon"><i class="bi bi-heart-fill"></i></span>MoodCard Saya</a>' +
        '<div class="side-title">Playlistku <a class="add" href="' + LINKS.playlist + '" aria-label="Tambah playlist"><i class="bi bi-plus-circle-fill"></i></a></div>' +
        '<a class="nav-item" href="' + LINKS.playlist + '">Rock n Roll</a>' +
        '<a class="nav-item" href="' + LINKS.playlist + '">Dangdut</a>' +
        '<a class="btn-free" href="free.html">Akun Gratis</a>';
    }

    var right = $('#rightbar');
    if (right) {
      right.innerHTML =
        '<div class="top-user">' +
          '<button class="bell" aria-label="Notifikasi" data-toast="Belum ada notifikasi baru"><i class="bi bi-bell"></i></button>' +
          '<a class="user-chip" href="index.html">' + avatarHTML('sm') +
            '<div><b data-bind="handle"></b><small>akun gratis</small></div></a>' +
        '</div>' +
        '<section class="side-card"><h4>INFORMASI AKUN</h4>' +
          '<div class="info-row"><span><i class="bi bi-envelope"></i>Email</span><span data-bind="email"></span></div>' +
          '<div class="info-row"><span><i class="bi bi-person"></i>Username</span><span data-bind="handle"></span></div>' +
          '<div class="info-row"><span><i class="bi bi-person-check"></i>Status Akun</span><span>Gratis</span></div>' +
          '<div class="info-row"><span><i class="bi bi-calendar3"></i>Tanggal Bergabung</span><span data-bind="joined"></span></div>' +
          '<a class="btn btn-purple btn-block" href="kelola-akun.html">Kelola Akun</a>' +
        '</section>' +
        '<section class="side-card"><h4>STATUS AKUN</h4>' +
          '<table class="fitur"><thead><tr><th>FITUR</th><th>FREE</th><th>PREMIUM</th></tr></thead><tbody>' +
            '<tr><td>Simpan MoodCard</td><td>✓</td><td>✓</td></tr>' +
            '<tr><td>Playlist Pribadi</td><td>✓</td><td>✓</td></tr>' +
            '<tr><td>Batas MoodCard</td><td>✓</td><td>✓</td></tr>' +
            '<tr><td>Tanpa Iklan</td><td>—</td><td>✓</td></tr>' +
            '<tr><td>Fitur Eksklusif</td><td>✓</td><td>✓</td></tr>' +
          '</tbody></table>' +
          '<a class="btn btn-purple btn-block" href="premium.html">Lihat Premium</a>' +
        '</section>';
    }

    if (document.body.dataset.page === 'free' && right) {
      var cards = $$('.side-card', right);
      if (cards[1]) cards[1].innerHTML =
        '<h4>PAKET FREE</h4>' +
        '<table class="fitur status"><thead><tr><th>FITUR</th><th>STATUS</th></tr></thead><tbody>' +
          '<tr><td>Simpan MoodCard</td><td>Tersedia</td></tr>' +
          '<tr><td>Playlist Pribadi</td><td>Tersedia</td></tr>' +
          '<tr><td>Kualitas audio</td><td>Standar</td></tr>' +
          '<tr><td>Pemutaran musik</td><td>Dengan iklan</td></tr>' +
          '<tr><td>Konten eksklusif</td><td>Tidak termasuk</td></tr>' +
        '</tbody></table>' +
        '<span class="btn btn-purple btn-block" style="background:var(--grad)">Paket Free aktif</span>';
    }

    var player = $('#player');
    if (player) {
      var bars = '';
      for (var i = 1; i <= 10; i++) bars += '<button aria-label="Volume ' + i + '" data-vol="' + i + '"></button>';
      player.innerHTML =
        '<div class="progress" aria-hidden="true"><i></i></div>' +
        '<div class="np"><div class="cover"></div><b>Evaluasi - Hindia</b><span>3:31</span></div>' +
        '<div class="controls">' +
          '<button id="p-shuffle" aria-label="Acak"><i class="bi bi-shuffle"></i></button>' +
          '<button aria-label="Sebelumnya" data-toast="Lagu sebelumnya"><i class="bi bi-skip-start-fill"></i></button>' +
          '<button id="p-play" class="play" aria-label="Jeda"><i class="bi bi-pause-fill"></i></button>' +
          '<button aria-label="Berikutnya" data-toast="Lagu berikutnya"><i class="bi bi-skip-end-fill"></i></button>' +
          '<button id="p-repeat" aria-label="Ulangi"><i class="bi bi-repeat"></i></button>' +
        '</div>' +
        '<div class="vol"><i class="bi bi-volume-up-fill"></i><div class="bars" id="p-bars">' + bars + '</div>' +
          '<div class="react">' +
            '<button aria-label="Senang" data-toast="Reaksi dikirim"><i class="bi bi-emoji-smile"></i></button>' +
            '<button class="on" id="p-like" aria-label="Suka"><i class="bi bi-heart-fill"></i></button>' +
            '<button aria-label="Semangat" data-toast="Reaksi dikirim"><i class="bi bi-fire"></i></button>' +
          '</div>' +
          '<button class="chat" aria-label="Komentar" data-toast="Komentar segera hadir"><i class="bi bi-chat-dots-fill"></i></button>' +
        '</div>';
      initPlayer();
    }
  }

  function initPlayer() {
    var play = $('#p-play');
    if (play) play.addEventListener('click', function () {
      var ic = $('i', play), paused = ic.classList.contains('bi-play-fill');
      ic.className = 'bi ' + (paused ? 'bi-pause-fill' : 'bi-play-fill');
      play.setAttribute('aria-label', paused ? 'Jeda' : 'Putar');
    });
    ['p-shuffle', 'p-repeat', 'p-like'].forEach(function (id) {
      var b = document.getElementById(id);
      if (b) b.addEventListener('click', function () { b.classList.toggle('on'); });
    });
    var bars = $$('#p-bars button');
    function setVol(n) { bars.forEach(function (b, i) { b.classList.toggle('on', i < n); }); }
    setVol(6);
    bars.forEach(function (b) { b.addEventListener('click', function () { setVol(+b.dataset.vol); }); });
  }

  /* ---------- Data profil -> tampilan ---------- */
  function applyProfile() {
    $$('[data-bind]').forEach(function (el) {
      var k = el.dataset.bind, v;
      if (k === 'handle') v = '@' + profile.username;
      else if (k === 'link') v = 'moodroom.id/@' + profile.username;
      else v = profile[k];
      el.textContent = v;
    });
    $$('input[data-field],textarea[data-field],select[data-field]').forEach(function (el) {
      el.value = profile[el.dataset.field] || '';
    });
    $$('img[data-avatar]').forEach(function (img) {
      if (profile.avatar) { img.src = profile.avatar; }
      img.style.display = '';
    });
    $$('.chip[data-mood]').forEach(function (c) {
      c.classList.toggle('on', c.dataset.mood === profile.mood);
    });
  }

  /* ---------- Penghitung karakter ---------- */
  function initCounters() {
    $$('[data-counter]').forEach(function (c) {
      var input = document.getElementById(c.dataset.counter);
      if (!input) return;
      function upd() { c.textContent = input.value.length + '/' + input.maxLength; }
      input.addEventListener('input', upd); upd();
    });
  }

  /* ---------- Simpan form (Edit Profil & Informasi Akun) ---------- */
  function validate(form, data) {
    var ok = true;
    $$('.error', form).forEach(function (e) { e.textContent = ''; });
    function err(f, msg) { var e = $('[data-error="' + f + '"]', form); if (e) e.textContent = msg; ok = false; }
    if (!data.name.trim()) err('name', 'Nama tampilan tidak boleh kosong.');
    if (!/^[a-zA-Z0-9_.]{3,20}$/.test(data.username)) err('username', 'Username 3–20 karakter: huruf, angka, titik, atau garis bawah.');
    return ok;
  }
  function initForms() {
    $$('form[data-profile-form]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var data = {};
        $$('[data-field]', form).forEach(function (el) { data[el.dataset.field] = el.value; });
        if (data.name === undefined) data.name = profile.name;
        if (data.username === undefined) data.username = profile.username;
        if (!validate(form, data)) return;
        Object.keys(data).forEach(function (k) { profile[k] = typeof data[k] === 'string' ? data[k].trim() : data[k]; });
        var chip = $('.chip.on', form); if (chip) profile.mood = chip.dataset.mood;
        save(KEY, profile);
        applyProfile();
        toast('Perubahan disimpan');
        if (form.dataset.redirect) setTimeout(function () { location.href = form.dataset.redirect; }, 900);
      });
    });
    $$('.chip[data-mood]').forEach(function (c) {
      c.addEventListener('click', function () {
        $$('.chip[data-mood]').forEach(function (x) { x.classList.remove('on'); });
        c.classList.add('on');
      });
    });
    var file = $('#photo-input');
    if (file) file.addEventListener('change', function () {
      var f = file.files[0]; if (!f) return;
      if (!/^image\/(jpeg|png)$/.test(f.type)) { toast('Format gambar harus JPG atau PNG'); return; }
      if (f.size > 3 * 1024 * 1024) { toast('Ukuran foto maksimal 3 MB'); return; }
      var r = new FileReader();
      r.onload = function () {
        profile.avatar = r.result;
        if (!save(KEY, profile)) { toast('Foto terlalu besar untuk disimpan di browser'); profile.avatar = ''; return; }
        applyProfile(); toast('Foto diperbarui');
      };
      r.readAsDataURL(f);
    });
  }

  /* ---------- Bagikan Profil ---------- */
  function initShare() {
    var copy = $('#btn-copy'); if (!copy) return;
    var url = function () { return 'https://moodroom.id/@' + profile.username; };
    copy.addEventListener('click', function () {
      var done = function () { toast('Link profil disalin'); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url()).then(done, function () { toast('Gagal menyalin link'); });
      } else {
        var t = $('#share-link'); t.select(); document.execCommand('copy'); done();
      }
    });
    $('#btn-wa').addEventListener('click', function () {
      window.open('https://wa.me/?text=' + encodeURIComponent('Lihat profil MoodRoom aku: ' + url()), '_blank', 'noopener');
    });
    $('#btn-share').addEventListener('click', function () {
      if (navigator.share) navigator.share({ title: 'MoodRoom', text: 'Lihat profil MoodRoom aku', url: url() }).catch(function () {});
      else copy.click();
    });
    var box = $('#qr-box'), target = $('#qr-target');
    function drawQR() {
      target.innerHTML = '';
      if (typeof QRCode !== 'undefined') new QRCode(target, { text: url(), width: 110, height: 110 });
      else target.textContent = 'QR tidak tersedia';
    }
    $('#btn-qr').addEventListener('click', function () { box.classList.toggle('hidden'); if (!box.classList.contains('hidden')) drawQR(); });
    drawQR();
  }

  /* ---------- Premium ---------- */
  function initPremium() {
    var plans = $$('.plan'); if (!plans.length) return;
    plans.forEach(function (p) {
      $('.btn', p).addEventListener('click', function () {
        plans.forEach(function (x) { x.classList.remove('on'); });
        p.classList.add('on');
        toast('Paket ' + p.dataset.plan + ' dipilih');
      });
    });
    var go = $('#btn-pilih');
    if (go) go.addEventListener('click', function () { $('#paket').scrollIntoView({ behavior: 'smooth' }); });
  }

  /* ---------- Kelola Akun: tab, toggle, keluar ---------- */
  var TABS = {
    info:        ['Kelola Akun', 'Atur informasi akun, keamanan, privasi, dan preferensi lainnya.'],
    keamanan:    ['Keamanan', 'Atur informasi akun, keamanan, privasi, dan preferensi lainnya.'],
    privasi:     ['Privasi', 'Atur siapa yang dapat melihat aktivitasmu dan kelola data pribadi.'],
    notifikasi:  ['Notifikasi', 'Atur notifikasi yang ingin kamu terima dari MoodRoom.'],
    keluar:      ['Keluar Akun', 'Kelola sesi akun MoodRoom kamu.']
  };
  function showTab(name) {
    if (!TABS[name]) name = 'info';
    $$('.tab-panel').forEach(function (p) { p.classList.toggle('hidden', p.id !== 'tab-' + name); });
    $$('.subnav button').forEach(function (b) { b.classList.toggle('active', b.dataset.tab === name); });
    $('#page-title').textContent = TABS[name][0];
    $('#page-sub').textContent = TABS[name][1];
    if (location.hash !== '#' + name) history.replaceState(null, '', '#' + name);
  }
  function initManage() {
    if (!$('.subnav')) return;
    $$('.subnav button').forEach(function (b) { b.addEventListener('click', function () { showTab(b.dataset.tab); }); });
    showTab(location.hash.replace('#', '') || 'info');
    window.addEventListener('hashchange', function () { showTab(location.hash.replace('#', '')); });

    var s = load(SKEY, {});
    $$('.switch').forEach(function (sw) {
      var k = sw.dataset.setting;
      if (k in s) sw.setAttribute('aria-checked', String(!!s[k]));
      sw.addEventListener('click', function () {
        var on = sw.getAttribute('aria-checked') !== 'true';
        sw.setAttribute('aria-checked', String(on));
        s[k] = on; save(SKEY, s);
        toast(sw.dataset.label + (on ? ' diaktifkan' : ' dimatikan'));
      });
    });

    var cancel = $('#logout-cancel'), yes = $('#logout-yes'), del = $('#btn-hapus');
    if (cancel) cancel.addEventListener('click', function () { showTab('info'); });
    if (yes) yes.addEventListener('click', function () {
      toast('Kamu berhasil keluar');
      if (LOGIN_URL) setTimeout(function () { location.href = LOGIN_URL; }, 900);
    });
    if (del) del.addEventListener('click', function () {
      if (confirm('Hapus akun secara permanen? Tindakan ini tidak bisa dibatalkan.')) toast('Permintaan hapus akun dikirim');
    });
  }

  /* ---------- Tombol umum: data-toast ---------- */
  function initToasts() {
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-toast]');
      if (t) toast(t.dataset.toast);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderLayout();
    applyProfile();
    initCounters();
    initForms();
    initShare();
    initPremium();
    initManage();
    initToasts();
  });
})();
