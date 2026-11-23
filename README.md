# SOP-AR | Web AR + Wokwi MQTT

Prototipe pembelajaran dan praktik SOP K3 menggunakan kamera HP, marker Hiro, dan ESP32 virtual Wokwi. **Tidak menggunakan Unity**. Ini bukan materi atau SOP resmi PT IRNC; validasi semua prosedur oleh petugas K3 sebelum dipakai sebagai pelatihan nyata.

## File

- `index.html`: halaman utama, kamera dan objek AR miniatur, materi dan praktik.
- `style.css`: desain responsif, warna hijau-gading-emas.
- `app.js`: koneksi MQTT, tampilan data dan aturan penilaian latihan.
- `marker.html`: halaman pembantu menampilkan marker Hiro dari sumber AR.js (memerlukan internet).

## Cara cepat membuka di HP (direkomendasikan: GitHub Pages)

1. Buka https://github.com/new dan buat repository **publik** bernama `sop-ar-k3` (atau nama lain). Jangan unggah berkas internal perusahaan.
2. Unggah **isi** folder SOP-AR-WebAR ke root repository: `index.html`, `style.css`, `app.js`, `marker.html`, `.nojekyll`.
3. Pada repository buka **Settings → Pages → Build and deployment → Source: Deploy from a branch**. Pilih branch `main` dan folder `/(root)` lalu **Save**.
4. Setelah GitHub Pages memublikasikan situsnya, buka URL yang muncul di Settings → Pages, misalnya `https://namapengguna.github.io/sop-ar-k3/`, lewat Chrome di HP.
5. Izinkan akses kamera. Karena halaman GitHub Pages memakai HTTPS, izin kamera bisa diminta.
6. Tampilkan **marker Hiro pada layar laptop lain** atau cetak marker: https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png (atau `marker.html`). Arahkan kamera HP ke marker.
7. Jalankan Wokwi, pastikan MQTTX masih menerima data pada topic `sopar/demo/k3-58321/telemetry`.
8. Tunggu status situs `Broker terhubung` dan `Sensor real-time`.
9. Masuk **Mode Belajar**, baca materi lalu pilih **Mulai Praktik**. Pilih empat APD, lalu ikuti instruksi di Tahap 2.
10. Saat Tahap 2, pastikan status `alarm_manual` = false pada Wokwi. Klik tombol merah **ALARM** Wokwi. Jika sudah aktif sejak awal, tekan **RESET**, tunggu telemetri masuk ke situs, baru tekan ALARM lagi.
11. Pada Tahap 3 pilih respons yang sesuai. Setelah selesai, skor simulasi dapat diunduh sebagai JSON.

## Tes awal di laptop (tanpa hosting)

Buka folder ini dalam terminal, lalu jalankan:

```bash
python -m http.server 8000
```

Buka `http://localhost:8000` pada laptop yang sama, izinkan kamera laptop, kemudian pindai marker Hiro dari layar HP/kertas. **Jangan** mengandalkan `file://` dari double-click index.html untuk kamera. Untuk akses dari HP, gunakan situs **HTTPS** seperti GitHub Pages; `http://IP-laptop:8000` biasanya tidak diperbolehkan untuk kamera di HP.

## Konfigurasi MQTT

| Parameter | Isi |
|---|---|
| URL WSS (browser) | `wss://broker.emqx.io:8084/mqtt` |
| Topic di situs | `sopar/demo/k3-58321/telemetry` |
| Topic di Wokwi | `sopar/demo/k3-58321/telemetry` |

Jika topic Wokwi diubah, buka **Pengaturan koneksi MQTT** di situs (desktop), masukkan topic yang sama lalu pilih **Terapkan topic**. Untuk penggunaan HP, lebih mudah samakan default di `app.js` sebelum diunggah.

Pesan minimal yang diharapkan dari proyek Wokwi:

```json
{
  "device": "SOP-AR-K3",
  "temperature": 30.0,
  "humidity": 65.0,
  "sensor_ok": true,
  "alarm": false,
  "alarm_manual": false,
  "event": "boot"
}
```

## Pengujian

1. **Marker**: kamera mengenali Hiro, model 3D muncul.
2. **Sensor**: data suhu/kelembapan terbarui kira-kira setiap 2 detik (sesuai Wokwi).
3. **Alarm**: tekan ALARM, lampu model 3D menjadi merah dan status AR `ALARM AKTIF`.
4. **Reset**: tekan RESET pada Wokwi dengan suhu di bawah ambang 38°C, lampu kembali hijau.
5. **Praktik**: lakukan langkah APD → tekan ALARM baru setelah diminta → pilih respons yang tepat → tampil hasil.
6. **Koneksi terputus**: jika data tidak masuk >8,5 detik, sensor menjadi `Menunggu sensor`, sehingga tidak mengklaim status normal dari data usang.

## Catatan keamanan dan batasan

- Broker EMQX publik. **Jangan** unggah data pribadi, SOP internal, atau data rahasia perusahaan. Gunakan topik acak berbeda jika ada banyak peserta.
- Alarm, APD dan respons adalah **simulasi pelatihan**, bukan instruksi darurat yang menggantikan SOP lokasi.
- Skor dihitung lokal di browser (`100 - 20 per kesalahan`, minimum 0); **belum** disimpan ke Laravel atau server.
- Yang disimulasikan adalah *alarm manual* dari tombol Wokwi dan data sensor. Alarm dari suhu tinggi mengubah warna model AR, tetapi *Tahap 2 praktik* secara sengaja memerlukan alarm manual baru.
- Library 3D, AR dan MQTT dimuat dari CDN; internet diperlukan. Kamera membutuhkan HTTPS/localhost dan browser yang mendukung WebRTC.

## Referensi teknis

- AR.js marker: https://ar-js-org.github.io/AR.js-Docs/marker-based/
- Marker Hiro: https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png
- MQTT.js: https://github.com/mqttjs/MQTT.js
- EMQX WebSocket: https://www.emqx.com/en/blog/connect-to-mqtt-broker-with-websocket
- GitHub Pages: https://docs.github.com/en/pages/quickstart
