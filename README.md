# SOP-AR Interactive V2 — Camera Fix

Perbaikan penting: camera texture diaktifkan pada AR.js, background halaman menjadi transparan, video DOM ditempatkan di belakang scene AR, dan ditambahkan indikator diagnostik izin/akses kamera dengan tombol muat ulang. Semua fitur belajar, kuis, alarm Wokwi dan MQTT dipertahankan.

**Cara memakai:** Salin seluruh isi ZIP ke root repo GitHub Pages, menimpa berkas lama (index.html, style.css, app.js, marker.html, .nojekyll). Setelah Pages selesai publish, di HP buka URL https://.../index.html?v=3 atau refresh tanpa cache. Izinkan kamera. Gunakan browser Chrome langsung, bukan browser dalam aplikasi pesan.

**Uji laptop:** dari folder: `python -m http.server 8000` lalu buka `http://localhost:8000`. Tidak cukup double-click HTML sebagai file biasa.

**Jika tetap gagal:** catat pesan pada layar "Kamera AR ..."; status `camera-init` menunjukkan izin kamera berhasil, sedangkan pesan izin ditolak menandakan perlu mengubah izin browser. Pastikan `app.js` dan `style.css` baru ikut di-upload.

---

# SOP-AR Interaktif — V2: belajar dan ujian di dalam kamera AR

Versi ini menggantikan panel besar aplikasi sebelumnya. **Semua materi dan pertanyaan muncul pada papan 3D yang menempel di marker Hiro**, dan jawaban dapat diklik pada papan tersebut. Di bagian bawah kamera tersedia kartu sentuh alternatif, tetap dalam layar kamera AR yang sama. Karena sentuhan pada objek AR.js kadang berbeda perilakunya antarperangkat, kartu sentuh ini memastikan kuis tetap bisa dikerjakan di HP.

## Yang sudah dapat dilakukan

1. Buka kamera dan arahkan ke marker Hiro; papan 3D muncul di atas marker.
2. Belajar **APD, rambu keselamatan, respons alarm** langsung dalam AR. Tekan "LANJUT MATERI" di papan AR atau tombol pada kartu layar kamera.
3. Masuk **Praktik di AR** dan jawab **soal APD** dan **soal rambu** pada papan AR atau tombol kamera.
4. Tahap IoT meminta pesan **NORMAL baru**, lalu **ALARM baru** dari Wokwi via MQTT. Jangan klik opsi palsu: Wokwi-lah yang memicu kelanjutan.
5. Jawab **soal respons alarm** di papan AR dan lihat hasil nilai di AR.
6. Unduh nilai simulasi sebagai JSON (penilaian lokal, belum disimpan di Laravel).

Materi adalah **contoh akademik** bukan SOP resmi atau prosedur darurat PT IRNC. Validasi oleh personel K3 wajib sebelum penggunaan untuk pelatihan sebenarnya.

## Cara membuka di HP

1. Buka [Wokwi](https://wokwi.com), jalankan simulasi IoT yang sudah berhasil. Pastikan data masuk ke MQTTX.
2. Ekstrak ZIP ini, unggah file hasil ekstrak ke root repository GitHub (`index.html`, `style.css`, `app.js`, `marker.html`, `.nojekyll`).
3. Pada **Settings → Pages**, pilih **Deploy from a branch**, branch `main`, folder `/(root)`, lalu simpan.
4. Buka URL HTTPS GitHub Pages yang ditampilkan, gunakan browser HP, dan izinkan kamera.
5. Tampilkan marker Hiro pada layar laptop atau cetak marker. Boleh membuka `marker.html` dari perangkat lain.
6. Arahkan kamera HP ke marker; cek tulisan **Marker Hiro terdeteksi**. Papan 3D berisi materi dan soal akan muncul.
7. Jalankan **Belajar di AR → Praktik di AR**. Pilih jawaban dari papan 3D, atau dari kontrol sentuh di bagian bawah kamera.
8. Saat tahap IoT, tekan RESET Wokwi jika alarm sudah aktif. Tunggu data `alarm:false` / `alarm_manual:false` baru diterima, lalu tekan tombol ALARM di Wokwi.
9. Setelah soal respons alarm selesai, nilai tampil di AR. Gunakan tombol unduh hasil untuk menyimpan JSON.

## Jalankan pada laptop untuk uji lokal

Dari folder ini jalankan:

```bash
python -m http.server 8000
```

Buka `http://localhost:8000`. Kamera laptop dapat digunakan pada localhost. Kamera HP membutuhkan HTTPS; `http://IP-laptop:8000` umumnya tidak mendapat izin kamera di browser HP.

## Koneksi MQTT

- Broker: `wss://broker.emqx.io:8084/mqtt`
- Topic bawaan: `sopar/demo/k3-58321/telemetry`
- Payload dipakai: `temperature`, `sensor_ok`, `alarm`, `alarm_manual` dan `event`.
- Untuk ganti topic, klik ikon roda gigi di pojok kanan atas, isi topic yang identik dengan `MQTT_TOPIC` pada sketch Wokwi, kemudian simpan.
- Data lebih tua dari 8,5 detik ditandai tidak real-time. Tahap alarm **tidak dapat lulus** dari data lama.

## Catatan teknis

- Papan AR bisa ditekan dengan A-Frame raycaster mouse/touch. Jika tap 3D tidak respons pada perangkat tertentu, gunakan pilihan identik di kartu layar kamera. Semua tahap tetap memakai scene AR, tidak dialihkan ke halaman kuis terpisah.
- Jawaban kuis hanya diterima saat marker terdeteksi. Pastikan papan Hiro tetap terlihat kamera sewaktu memilih jawaban.
- Tombol alarm baru dari Wokwi (perubahan `alarm_manual:false → true`) diterima hanya setelah aplikasi melihat pesan NORMAL baru ketika tahap IoT dimulai.
- Aplikasi hanya subscribe MQTT; tidak mengirim perintah kontrol ke perangkat. Broker publik tidak aman untuk informasi rahasia dan bukan untuk pelatihan bersertifikat.
- Perangkat perlu internet untuk library AR.js, A-Frame, dan MQTT.js dari CDN.
- Objek APD dan lingkungan belum model 3D realistis; ini prototipe fungsional untuk alur belajar–kuis–IoT–hasil langsung pada AR.

## Berkas

- `index.html`: scene AR dan UI dalam kamera
- `style.css`: tampilan layar kamera untuk desktop/HP
- `app.js`: materi, soal, skor dan integrasi MQTT
- `marker.html`: membuka marker Hiro resmi
- `.nojekyll`: GitHub Pages
