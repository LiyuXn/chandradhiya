# MY SPACE — Personal Portfolio

Website portofolio responsif dengan nuansa iOS Liquid Glass + luar angkasa. Dibuat menggunakan HTML, CSS, dan JavaScript module. Tidak memakai React dan tidak dibuat sebagai PWA.

## 1. Jalankan di komputer

1. Ekstrak folder `nebula-portfolio`.
2. Buka folder itu di VS Code.
3. Pasang extension **Live Server** jika belum ada.
4. Klik kanan `index.html` → **Open with Live Server**.
5. Website akan terbuka di browser. Untuk mengetes tampilan HP, gunakan Device Toolbar di Chrome DevTools atau buka alamat lokal dari HP yang berada di jaringan Wi-Fi yang sama.

Jangan membuka `index.html` dengan double-click (`file://`) karena browser module Firebase perlu dijalankan melalui web server lokal.

## 2. Ganti identitas dan foto

Edit langsung bagian contoh di `index.html`:

- Cari `Your Name`, `Your Name.` dan ganti dengan nama tampilan yang kamu inginkan.
- Cari `[Nama sekolah]`, `[Kota]`, `[TAHUN]`, dan teks dalam tanda kurung siku; ganti dengan informasi yang memang ingin kamu tampilkan.
- Ganti deskripsi, perjalanan, tujuan, prestasi, dan proyek sesuai pengalaman asli. Hapus contoh yang tidak relevan.
- Bagian kontak memiliki link contoh `yourusername` dan `62XXXXXXXXXXX`; ganti setiap `href` serta username di bawah ikon dengan tautan profil publik milikmu.
- Untuk foto, letakkan foto milikmu di folder `assets` dengan nama `profile.jpg`, lalu di `index.html` ubah `src="assets/profile-placeholder.svg"` menjadi `src="assets/profile.jpg"`.

**Privasi:** website publik bisa dibuka siapa saja. Jangan cantumkan alamat rumah, nomor pribadi yang tidak ingin tersebar, jadwal harian, tanggal lahir lengkap, atau informasi sensitif. Untuk WhatsApp, pertimbangkan akun khusus yang memang nyaman dijadikan kontak publik.

## 3. Aktifkan guestbook dengan Firebase (gratis untuk mulai)

Guestbook membutuhkan Firebase. Website tetap bisa dibuka tanpa Firebase, tetapi pesan belum bisa disimpan online sampai langkah ini selesai.

### A. Buat project dan aplikasi web

1. Buka [Firebase Console](https://console.firebase.google.com/) dan buat project baru.
2. Tambahkan aplikasi **Web** ke project tersebut.
3. Salin objek konfigurasi Firebase yang diberikan.
4. Buka `firebase-config.js`, lalu isi `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, dan `appId` sesuai milik project-mu.

Konfigurasi Firebase untuk aplikasi web memang berada di sisi browser. Jangan pernah memasukkan password admin, private key, atau service-account JSON ke file frontend.

### B. Buat database Firestore

1. Di Firebase Console, buka **Firestore Database**.
2. Klik **Create database**.
3. Setelah database dibuat, buka tab **Rules**.
4. Salin seluruh isi file `firestore.rules` ke editor Rules di Firebase Console.
5. Klik **Publish**.

Aturan awal ini membuat pesan dapat dibaca publik, pengunjung hanya dapat membuat pesan baru, pengunjung tidak dapat mengubah atau menghapus pesan, dan hanya satu UID admin yang dapat menghapus pesan.

### C. Buat akun admin

1. Buka **Authentication** → **Get started** → **Sign-in method**.
2. Aktifkan provider **Email/Password**, lalu simpan.
3. Buka tab **Users** dan tambahkan akun admin milikmu. Jangan membuat form pendaftaran admin di website publik.
4. Salin **UID** akun tersebut.
5. Ganti `ISI_UID_ADMIN_DI_SINI` di dua tempat:
   - `ADMIN_UID` dalam `firebase-config.js`.
   - UID di bagian `allow delete` dalam `firestore.rules`.
6. Publish ulang Firestore Rules setelah UID diganti.

Tombol **Admin access** di bagian Message akan membuka form login. Setelah login memakai akun admin yang UID-nya cocok, tombol Delete akan muncul pada setiap pesan. Firestore Rules tetap memeriksa UID di server, jadi menyembunyikan atau mengubah tombol di browser tidak memberi pengunjung hak menghapus.

## 4. Publikasikan website

Website ini berupa file statis, sehingga dapat dipasang di layanan hosting statis seperti GitHub Pages atau Netlify. Upload seluruh isi folder proyek (termasuk `assets`, `firebase-config.js`, dan file lainnya), bukan hanya `index.html`.

Setelah punya URL publik, buka URL tersebut di Chrome. Untuk menyimpannya, gunakan menu Chrome → **Bookmark / Add bookmark**. Proyek ini memang bukan PWA dan tidak menampilkan tombol instal aplikasi.

## 5. Catatan penting guestbook

- Pesan tersimpan di Firestore sampai dihapus oleh admin atau project/database dihapus. Tidak ada layanan cloud yang bisa menjanjikan data tersimpan selamanya tanpa syarat; jaga akses akun Firebase dan buat backup berkala.
- Daftar menampilkan 20 pesan terbaru terlebih dahulu. Tombol **Load older messages** memuat 20 pesan sebelumnya. Semua pesan tetap berada di database.
- Semua pesan bisa dibaca publik. Jangan gunakan guestbook untuk mengirim data pribadi.
- Ada validasi panjang teks dan honeypot sederhana, tetapi itu bukan perlindungan spam yang lengkap. Sebelum membagikan link luas-luas, pelajari Firebase App Check dan pemantauan penggunaan/kuota Firebase.
- Firestore mengenakan batas/kuota penggunaan sesuai paket dan kebijakan Firebase. Pantau penggunaan di Firebase Console; jangan menganggap layanan cloud gratis tanpa batas.

## Struktur folder

```text
nebula-portfolio/
├── index.html
├── styles.css
├── script.js
├── firebase-config.js
├── firestore.rules
├── README.md
└── assets/
    ├── favicon.svg
    └── profile-placeholder.svg
```

## Catatan performa

Starfield dibatasi sekitar 30 FPS dengan jumlah bintang yang lebih rendah, dan animasinya berhenti saat tab tidak aktif. Gerakan aurora dibuat statis agar tidak terus memicu repaint besar; blur pada kartu dan header juga dikurangi. Navigasi menggunakan smooth scrolling bawaan browser agar mudah dihentikan atau diarahkan ulang tanpa animasi JavaScript yang saling bertabrakan. Efek glow pointer menggunakan satu layer transform dan hanya aktif dengan mouse/trackpad. Pengaturan `prefers-reduced-motion` tetap dihormati. Performa akhir tetap bergantung pada browser, perangkat, dan kondisi tab.

## Update desain v4
- Intro berjalan otomatis tanpa tombol, memakai starfield dan aurora yang sama dengan halaman utama.
- Elemen intro masuk dari kiri dan kanan, lalu transisi cahaya menyapu layar.
- Navbar diringkas: ikon di samping MY SPACE dan tombol Let's connect dihapus.
- Background luar angkasa dibuat lebih terlihat.
- Kartu mini dan bagian Projects di Home/Achievements dihilangkan.
- Animasi elemen section masuk bergantian dari kiri dan kanan.
- Contact hanya memberi border pada ikon, bukan seluruh item.

## V5 — Motion & Space Refinement
- Intro sekarang melakukan cross-fade ke halaman utama; halaman mulai terlihat sebelum intro benar-benar hilang agar perpindahannya tidak terasa mendadak.
- Animasi section sekarang reversible: elemen halaman sebelumnya keluar, elemen halaman berikutnya masuk, dan animasi diputar kembali saat pengguna scroll naik.
- Pointer Windows/macOS tetap menggunakan kursor bawaan. Pada desktop, ada cahaya nebula lembut di background yang mengikuti posisi pointer dengan sedikit jeda; efek ini tidak aktif pada layar sentuh.
- Starfield memiliki variasi ukuran, halo, twinkle, beberapa kilau silang, dan komet yang lebih mudah terlihat.
- Nebula dibuat berlapis dengan warna biru, indigo, dan sedikit cyan yang bergerak perlahan.
- Font navbar disamakan dengan keluarga font judul portfolio (Manrope).


## V6 — Smooth Experience
- Navbar dan isi setiap section diperbesar; lebar konten desktop ditambah agar ruang kiri-kanan terasa lebih terisi, tanpa mengubah susunan responsif mobile.
- Ikon “Learning by doing” menggunakan buku dan ikon “Achievements” menggunakan piala.
- Nama di halaman Home memakai gradasi terang-ke-gelap dari kiri ke kanan.
- Teks role di bawah nama diketik setelah intro ditutup.
- Klik navigasi dan anchor memakai easing ease-out: laju scroll lebih cepat di awal dan melambat di dekat section tujuan.
- Animasi latar diringankan: starfield dibatasi 30 FPS, berhenti saat tab tersembunyi, aurora tidak bergerak terus-menerus, dan efek blur dikurangi.
- Native cursor tetap terlihat; efek pointer hanya berupa cahaya lembut di background.


## V7 — Final Layout & Navigation Polish
- Intro otomatis menutup tanpa tombol Enter/Skip dan tanpa simbol kubus; tipografi intro diperbesar.
- Navbar menjadi satu bar glass yang lebih besar dan terpusat. Indikator geser dihapus agar klik navigasi tidak glitch; smooth scroll memakai perilaku native browser.
- Hero diperbesar, garis ketik tetap berkedip, dua kartu mini dan label “Exploring the unknown” dihapus, serta satu titik bergerak mengitari oval foto.
- Judul aksen biru memakai gradasi warna bergerak yang konsisten.
- Kartu Who Am I dan timeline Achievements memiliki area scroll internal sendiri.
- Interests ditampilkan sebelum Skills, sementara bagian Selected Projects dihapus.
- Tipografi Contact dan Guestbook diperbesar; ikon amplop dan tombol Back to top berbentuk lingkaran ditambahkan.
- Efek aurora tetap statis, blur dikurangi, dan animasi latar dibatasi agar halaman tetap ringan.
