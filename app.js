
"use strict";

// =====================================================
// IMIP QUIZ - MINDAR V6
// =====================================================
// Fitur:
// 1. Welcome IMIP QUIZ saat marker terdeteksi
// 2. Tombol MULAI animasi 3D
// 3. Area sentuh tombol lebih luas
// 4. Pointer fallback untuk tombol MULAI
// 5. Tombol MULAI alternatif pada layar HP
// 6. Empat menu utama AR
// 7. Pembelajaran PP dan K3
// 8. Latihan soal pilihan A, B, C
// 9. Hasil nilai otomatis
// 10. Status pelacakan marker IMIP
//
// Catatan:
// Materi dan soal bersifat simulasi akademik.
// Bukan SOP resmi PT IRNC.
//
// File gambar:
// - imip.png
// - targets.mind
// - welcome-imip.png
// - welcome-mulai-v6.png
// =====================================================


// =====================================================
// 1. DATA PEMBELAJARAN DAN LATIHAN
// =====================================================

const modules = {

  // ---------------------------------------------------
  // PERATURAN PERUSAHAAN
  // ---------------------------------------------------

  pp: {

    name: "Peraturan Perusahaan",

    lessons: [

      {
        title: "Pengenalan PP",

        body:
          "Peraturan Perusahaan berisi ketentuan " +
          "kerja, hak, dan kewajiban yang perlu " +
          "dipahami oleh karyawan."
      },

      {
        title: "Kedisiplinan",

        body:
          "Karyawan perlu mengikuti aturan " +
          "kehadiran, waktu kerja, dan tata " +
          "tertib yang berlaku."
      },

      {
        title: "Pelaporan",

        body:
          "Ketika terjadi kendala pekerjaan, " +
          "laporkan melalui jalur komunikasi " +
          "yang telah ditetapkan."
      }

    ],

    questions: [

      {
        question:
          "Apa tujuan Peraturan Perusahaan?",

        options: [
          "Mengatur hak dan kewajiban",
          "Menghilangkan keselamatan",
          "Mengabaikan kedisiplinan"
        ],

        correct: 0
      },

      {
        question:
          "Apa yang dilakukan jika berhalangan hadir?",

        options: [
          "Tidak memberi kabar",
          "Melapor sesuai ketentuan",
          "Meminta teman mengabsen"
        ],

        correct: 1
      },

      {
        question:
          "Jika ada kendala kerja, tindakan yang tepat adalah?",

        options: [
          "Mengabaikan masalah",
          "Menyembunyikan masalah",
          "Melapor melalui jalur resmi"
        ],

        correct: 2
      }

    ]

  },

  // ---------------------------------------------------
  // KESELAMATAN KERJA K3
  // ---------------------------------------------------

  k3: {

    name: "Keselamatan Kerja (K3)",

    lessons: [

      {
        title: "Pengenalan K3",

        body:
          "Keselamatan dan Kesehatan Kerja bertujuan " +
          "membantu mencegah kecelakaan dan risiko kerja."
      },

      {
        title: "Penggunaan APD",

        body:
          "Gunakan Alat Pelindung Diri sesuai bahaya " +
          "dan jenis pekerjaan, serta periksa kondisinya " +
          "sebelum digunakan."
      },

      {
        title: "Respons Alarm",

        body:
          "Saat alarm bahaya aktif, ikuti prosedur " +
          "darurat dan arahan petugas berwenang."
      }

    ],

    questions: [

      {
        question:
          "Apa tujuan penerapan K3?",

        options: [
          "Mempercepat pekerjaan saja",
          "Mencegah risiko kecelakaan",
          "Mengurangi penggunaan APD"
        ],

        correct: 1
      },

      {
        question:
          "Sebelum masuk area berbahaya, karyawan harus?",

        options: [
          "Memakai APD yang sesuai",
          "Mengabaikan risiko",
          "Melepas perlindungan"
        ],

        correct: 0
      },

      {
        question:
          "Saat alarm darurat aktif, apa tindakan yang tepat?",

        options: [
          "Mengabaikan alarm",
          "Reset tanpa izin",
          "Ikuti prosedur darurat"
        ],

        correct: 2
      }

    ]

  }

};


// =====================================================
// 2. STATUS APLIKASI
// =====================================================

const state = {

  // welcome -> menu -> learn / quiz -> result

  screen: "welcome",

  started: false,

  markerFound: false,

  category: null,

  lessonIndex: 0,

  questionIndex: 0,

  selectedAnswer: null,

  score: 0

};


// =====================================================
// 3. HELPER JAVASCRIPT
// =====================================================

const $ = (id) => {
  return document.getElementById(id);
};


// Mengubah teks pada objek A-Frame
function setText(id, value) {

  const element = $(id);

  if (!element) {
    return;
  }

  element.setAttribute(
    "value",
    String(value)
  );

}


// Menampilkan atau menyembunyikan objek 3D
function setVisible(id, visible) {

  const element = $(id);

  if (!element) {
    return;
  }

  element.setAttribute(
    "visible",
    Boolean(visible)
  );

}


// Membuka atau menutup panel sentuh
function setDockOpen(open) {

  const dock = $("touchDock");
  const button = $("toggleDock");

  if (!dock || !button) {
    return;
  }

  dock.classList.toggle(
    "collapsed",
    !open
  );

  button.textContent = open ? "−" : "+";

}


// Menghapus semua tombol HTML lama
function clearButtons() {

  const container = $("touchActions");

  if (container) {
    container.replaceChildren();
  }

}


// Membuat tombol sentuh HTML
function addButton(
  text,
  callback,
  primary = false,
  selected = false
) {

  const button = document.createElement("button");

  button.type = "button";

  button.textContent = text;

  if (primary) {
    button.classList.add("primary");
  }

  if (selected) {
    button.classList.add("selected");
  }

  button.addEventListener(
    "click",
    callback
  );

  $("touchActions").appendChild(button);

  return button;

}


// Memperbarui teks panel
function describe(text) {

  const element = $("dockDescription");

  if (element) {
    element.textContent = text;
  }

}


// Memperbarui status marker
function setMarkerStatus(
  text,
  found = false,
  error = false
) {

  const element = $("markerStatus");

  if (!element) {
    return;
  }

  element.textContent = text;

  element.classList.toggle(
    "found",
    found
  );

  element.classList.toggle(
    "error",
    error
  );

}


// =====================================================
// 4. TOMBOL MULAI ALTERNATIF
// =====================================================

// Tombol ini adalah tombol HTML di bagian
// bawah layar HP.
//
// Muncul hanya ketika:
// - marker terlihat
// - tampilan masih welcome
//
// Tombol ini tidak menggantikan tombol 3D.

function syncStartBackup() {

  const button = $("startBackup");

  if (!button) {
    return;
  }

  const shouldShow =
    state.markerFound &&
    state.screen === "welcome" &&
    !state.started;

  button.hidden = !shouldShow;

}


// =====================================================
// 5. MEMULAI IMIP QUIZ
// =====================================================

function startExperience() {

  // Marker harus terdeteksi
  if (!state.markerFound) {
    return;
  }

  // Jangan memulai lebih dari sekali
  if (state.started) {
    return;
  }

  // Hanya aktif pada welcome
  if (state.screen !== "welcome") {
    return;
  }

  // Ubah status aplikasi
  state.started = true;

  state.screen = "menu";

  state.category = null;

  state.lessonIndex = 0;

  state.questionIndex = 0;

  state.selectedAnswer = null;

  state.score = 0;

  // Tutup panel saat menu utama muncul
  setDockOpen(false);

  // Perbarui seluruh tampilan
  render();

  // Sembunyikan tombol cadangan
  syncStartBackup();

  // Status berhasil
  setMarkerStatus(
    "Pilih menu IMIP QUIZ",
    true
  );

  console.log(
    "IMIP QUIZ: tombol MULAI berhasil"
  );

}


// =====================================================
// 6. BUKA MODUL
// =====================================================

function openModule(screen, category) {

  if (!state.started) {
    return;
  }

  if (!modules[category]) {
    return;
  }

  if (
    screen !== "learn" &&
    screen !== "quiz"
  ) {
    return;
  }

  state.screen = screen;

  state.category = category;

  state.lessonIndex = 0;

  state.questionIndex = 0;

  state.selectedAnswer = null;

  state.score = 0;

  // Buka panel kontrol sentuh
  setDockOpen(true);

  render();

}


// =====================================================
// 7. KEMBALI KE EMPAT MENU
// =====================================================

function goHome() {

  if (!state.started) {
    return;
  }

  state.screen = "menu";

  state.category = null;

  state.lessonIndex = 0;

  state.questionIndex = 0;

  state.selectedAnswer = null;

  state.score = 0;

  setDockOpen(false);

  render();

}


// =====================================================
// 8. MEMILIH JAWABAN
// =====================================================

function chooseAnswer(index) {

  if (state.screen !== "quiz") {
    return;
  }

  // Satu soal hanya boleh dijawab sekali
  if (state.selectedAnswer !== null) {
    return;
  }

  const module = modules[state.category];

  if (!module) {
    return;
  }

  const question =
    module.questions[state.questionIndex];

  if (!question) {
    return;
  }

  // Validasi pilihan jawaban
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= question.options.length
  ) {
    return;
  }

  // Simpan jawaban
  state.selectedAnswer = index;

  // Hitung benar
  if (index === question.correct) {
    state.score += 1;
  }

  render();

}


// =====================================================
// 9. TOMBOL LANJUT
// =====================================================

function nextStep() {

  const module = modules[state.category];

  if (!module) {
    return;
  }

  // ---------------------------------------------------
  // LANJUT MATERI
  // ---------------------------------------------------

  if (state.screen === "learn") {

    const lastLesson =
      state.lessonIndex ===
      module.lessons.length - 1;

    if (!lastLesson) {

      state.lessonIndex += 1;

      render();

    } else {

      // Setelah materi terakhir,
      // lanjut ke latihan soal.
      openModule(
        "quiz",
        state.category
      );

    }

    return;
  }

  // ---------------------------------------------------
  // LANJUT SOAL
  // ---------------------------------------------------

  if (state.screen === "quiz") {

    // Wajib menjawab dahulu
    if (state.selectedAnswer === null) {
      return;
    }

    const lastQuestion =
      state.questionIndex ===
      module.questions.length - 1;

    if (!lastQuestion) {

      state.questionIndex += 1;

      state.selectedAnswer = null;

    } else {

      state.screen = "result";

    }

    render();

    return;
  }

  // ---------------------------------------------------
  // ULANGI KUIS
  // ---------------------------------------------------

  if (state.screen === "result") {

    openModule(
      "quiz",
      state.category
    );

  }

}


// =====================================================
// 10. MENANGANI SEMUA TOMBOL 3D
// =====================================================

function handleAction(action) {

  if (!action) {
    return;
  }

  // ---------------------------------------------------
  // TOMBOL MULAI
  // ---------------------------------------------------

  if (action === "start") {

    startExperience();

    return;
  }

  // Sebelum welcome selesai,
  // menu lain belum boleh digunakan.
  if (!state.started) {
    return;
  }

  // ---------------------------------------------------
  // EMPAT MENU
  // ---------------------------------------------------

  const menuActions = {

    "learn-pp": ["learn", "pp"],

    "learn-k3": ["learn", "k3"],

    "quiz-pp": ["quiz", "pp"],

    "quiz-k3": ["quiz", "k3"]

  };

  if (menuActions[action]) {

    if (state.screen !== "menu") {
      return;
    }

    const [screen, category] =
      menuActions[action];

    openModule(screen, category);

    return;
  }

  // ---------------------------------------------------
  // KEMBALI KE MENU
  // ---------------------------------------------------

  if (action === "home") {

    goHome();

    return;
  }

  // ---------------------------------------------------
  // SELANJUTNYA
  // ---------------------------------------------------

  if (action === "next") {

    nextStep();

    return;
  }

  // ---------------------------------------------------
  // JAWABAN A, B, C
  // ---------------------------------------------------

  if (action.startsWith("answer-")) {

    const index = Number(
      action.slice(7)
    );

    chooseAnswer(index);

  }

}


// =====================================================
// 11. TAMPILKAN EMPAT MENU UTAMA
// =====================================================

function renderMenu() {

  $("dockTitle").textContent =
    "Menu IMIP QUIZ";

  describe(
    "Sentuh salah satu dari empat menu " +
    "3D di atas logo IMIP, atau buka " +
    "panel kontrol sentuh."
  );

  addButton(
    "Belajar Peraturan Perusahaan",
    () => openModule("learn", "pp")
  );

  addButton(
    "Belajar Keselamatan Kerja (K3)",
    () => openModule("learn", "k3")
  );

  addButton(
    "Latihan Soal Peraturan Perusahaan",
    () => openModule("quiz", "pp")
  );

  addButton(
    "Latihan Soal K3",
    () => openModule("quiz", "k3")
  );

}


// =====================================================
// 12. TAMPILKAN MATERI
// =====================================================

function renderLearn() {

  const module = modules[state.category];

  const lesson =
    module.lessons[state.lessonIndex];

  const total = module.lessons.length;

  const lastLesson =
    state.lessonIndex === total - 1;

  $("dockTitle").textContent =
    module.name;

  // ---------------------------------------------------
  // MATERI DI PAPAN 3D
  // ---------------------------------------------------

  setText(
    "worldMode",
    `BELAJAR ${state.lessonIndex + 1}/${total}`
  );

  setText(
    "worldTitle",
    lesson.title
  );

  setText(
    "worldBody",
    lesson.body
  );

  setText(
    "worldHint",
    "Baca materi, kemudian tekan LANJUT."
  );

  setText(
    "nextText",
    lastLesson
      ? "MULAI SOAL"
      : "LANJUT"
  );

  // ---------------------------------------------------
  // PANEL SENTUH
  // ---------------------------------------------------

  describe(
    `${lesson.title}\n\n` +
    `${lesson.body}\n\n` +
    `Materi ${state.lessonIndex + 1} dari ${total}`
  );

  addButton(
    "Kembali ke Menu",
    goHome
  );

  addButton(
    lastLesson
      ? "Mulai Latihan Soal"
      : "Materi Berikutnya",
    nextStep,
    true
  );

}


// =====================================================
// 13. TAMPILKAN LATIHAN SOAL
// =====================================================

function renderQuiz() {

  const module = modules[state.category];

  const question =
    module.questions[state.questionIndex];

  const total = module.questions.length;

  const answered =
    state.selectedAnswer !== null;

  const lastQuestion =
    state.questionIndex === total - 1;

  $("dockTitle").textContent =
    module.name;

  // ---------------------------------------------------
  // TAMPILAN SOAL 3D
  // ---------------------------------------------------

  setText(
    "worldMode",
    `SOAL ${state.questionIndex + 1}/${total}`
  );

  setText(
    "worldTitle",
    "LATIHAN SOAL"
  );

  setText(
    "worldBody",
    question.question
  );

  setText(
    "worldHint",
    answered
      ? "Jawaban dicatat. Tekan LANJUT."
      : "Pilih jawaban A, B, atau C."
  );

  setText(
    "nextText",
    lastQuestion
      ? "LIHAT HASIL"
      : "LANJUT"
  );

  // Tombol lanjut hanya muncul
  // setelah jawaban dipilih.
  setVisible(
    "nextGroup",
    answered
  );

  // ---------------------------------------------------
  // PANEL SENTUH
  // ---------------------------------------------------

  describe(
    `Soal ${state.questionIndex + 1} dari ${total}\n\n` +
    question.question +
    (
      answered
        ? "\n\nJawaban sudah dicatat."
        : ""
    )
  );

  // ---------------------------------------------------
  // PILIHAN A, B, C
  // ---------------------------------------------------

  question.options.forEach(
    (option, index) => {

      const letter = "ABC"[index];

      // Tampilkan jawaban pada papan AR
      setText(
        `optionText${index}`,
        `${letter}. ${option}`
      );

      const plane = $(`option${index}`);

      if (plane) {

        plane.setAttribute(
          "color",
          state.selectedAnswer === index
            ? "#FFD28B"
            : "#EBF8DC"
        );

      }

      // Tambahkan jawaban ke panel HTML
      const button = addButton(
        `${letter}. ${option}`,
        () => chooseAnswer(index),
        false,
        state.selectedAnswer === index
      );

      // Setelah menjawab,
      // semua pilihan dinonaktifkan.
      button.disabled = answered;

    }
  );

  addButton(
    "Kembali ke Menu",
    goHome
  );

  if (answered) {

    addButton(
      lastQuestion
        ? "Lihat Hasil Latihan"
        : "Soal Berikutnya",
      nextStep,
      true
    );

  }

}


// =====================================================
// 14. TAMPILKAN HASIL
// =====================================================

function renderResult() {

  const module = modules[state.category];

  const total = module.questions.length;

  const correct = state.score;

  const wrong = total - correct;

  const score =
    Math.round(
      (correct / total) * 100
    );

  $("dockTitle").textContent =
    "Hasil Latihan";

  // ---------------------------------------------------
  // HASIL DI PAPAN 3D
  // ---------------------------------------------------

  setText(
    "worldMode",
    "HASIL LATIHAN"
  );

  setText(
    "worldTitle",
    `NILAI ${score}`
  );

  setText(
    "worldBody",
    `Jawaban benar: ${correct} dari ${total}. ` +
    "Latihan telah selesai."
  );

  setText(
    "worldHint",
    "Kamu bisa mengulangi latihan."
  );

  setText(
    "nextText",
    "ULANGI"
  );

  // ---------------------------------------------------
  // PANEL SENTUH
  // ---------------------------------------------------

  describe(
    `Kategori: ${module.name}\n\n` +
    `Nilai: ${score}/100\n` +
    `Jumlah soal: ${total}\n` +
    `Benar: ${correct}\n` +
    `Salah: ${wrong}\n\n` +
    "Hasil ini merupakan simulasi akademik."
  );

  addButton(
    "Kembali ke Menu",
    goHome
  );

  addButton(
    "Ulangi Latihan",
    () => openModule(
      "quiz",
      state.category
    ),
    true
  );

}


// =====================================================
// 15. RENDER TAMPILAN UTAMA
// =====================================================

function render() {

  const welcome =
    state.screen === "welcome";

  const menu =
    state.screen === "menu";

  const quiz =
    state.screen === "quiz";

  // ---------------------------------------------------
  // WELCOME IMIP QUIZ
  // ---------------------------------------------------

  setVisible(
    "welcome3d",
    welcome
  );

  // ---------------------------------------------------
  // EMPAT MENU 3D
  // ---------------------------------------------------

  setVisible(
    "menu3d",
    menu
  );

  // ---------------------------------------------------
  // PAPAN MATERI / SOAL / HASIL
  // ---------------------------------------------------

  setVisible(
    "content3d",
    !welcome && !menu
  );

  // ---------------------------------------------------
  // PILIHAN SOAL
  // ---------------------------------------------------

  setVisible(
    "worldChoices",
    quiz
  );

  // ---------------------------------------------------
  // TOMBOL LANJUT
  // ---------------------------------------------------

  setVisible(
    "nextGroup",
    !welcome && !menu && !quiz
  );

  // ---------------------------------------------------
  // PANEL SENTUH
  // ---------------------------------------------------

  $("touchDock").hidden = welcome;

  // Tombol mulai alternatif
  syncStartBackup();

  // Bersihkan tombol lama
  clearButtons();

  // ---------------------------------------------------
  // PILIH TAMPILAN
  // ---------------------------------------------------

  if (welcome) {
    return;
  }

  if (menu) {

    renderMenu();

    return;
  }

  if (state.screen === "learn") {

    renderLearn();

    return;
  }

  if (quiz) {

    renderQuiz();

    return;
  }

  if (state.screen === "result") {

    renderResult();

  }

}


// =====================================================
// 16. SENTUHAN CADANGAN TOMBOL MULAI 3D
// =====================================================

// Beberapa browser HP kadang tidak mengirim
// event click dengan konsisten saat objek AR
// sedang bergerak.
//
// Fungsi ini menggunakan posisi 3D tombol
// yang diproyeksikan ke koordinat layar.
//
// Hanya berlaku untuk tombol MULAI
// pada halaman welcome.
//
// Tombol 3D tetap menggunakan event click
// A-Frame sebagai mekanisme utama.

function installPointerFallback(scene) {

  function attachListener() {

    const canvas = scene.canvas;

    if (!canvas) {
      return;
    }

    // Hindari listener terpasang dua kali
    if (canvas.dataset.imipTouchReady) {
      return;
    }

    canvas.dataset.imipTouchReady = "1";

    canvas.addEventListener(
      "pointerup",
      (event) => {

        // ------------------------------------------------
        // CEK STATUS
        // ------------------------------------------------

        if (!state.markerFound) {
          return;
        }

        if (state.started) {
          return;
        }

        if (state.screen !== "welcome") {
          return;
        }

        // ------------------------------------------------
        // AMBIL TOMBOL DAN KAMERA
        // ------------------------------------------------

        const hit = $("start3dHit");

        const camera = scene.camera;

        if (!hit || !hit.object3D || !camera) {
          return;
        }

        // ------------------------------------------------
        // UKURAN HITBOX
        // ------------------------------------------------

        const width =
          Number(hit.getAttribute("width")) || 0.92;

        const height =
          Number(hit.getAttribute("height")) || 0.34;

        const rect =
          canvas.getBoundingClientRect();

        if (
          rect.width <= 0 ||
          rect.height <= 0
        ) {
          return;
        }

        // ------------------------------------------------
        // PERBARUI MATRIKS DUNIA 3D
        // ------------------------------------------------

        hit.object3D.updateWorldMatrix(
          true,
          false
        );

        camera.updateMatrixWorld(true);

        // ------------------------------------------------
        // EMPAT SUDUT HITBOX
        // ------------------------------------------------

        const corners = [

          [-width / 2, -height / 2],

          [width / 2, -height / 2],

          [-width / 2, height / 2],

          [width / 2, height / 2]

        ];

        // ------------------------------------------------
        // PROYEKSI 3D KE LAYAR HP
        // ------------------------------------------------

        const points = corners.map(
          ([x, y]) => {

            const point =
              new AFRAME.THREE.Vector3(
                x,
                y,
                0
              );

            point.applyMatrix4(
              hit.object3D.matrixWorld
            );

            point.project(camera);

            return {

              x:
                rect.left +
                ((point.x + 1) / 2) *
                rect.width,

              y:
                rect.top +
                ((1 - point.y) / 2) *
                rect.height

            };

          }
        );

        // Pastikan koordinat valid
        const valid = points.every(
          (point) =>
            Number.isFinite(point.x) &&
            Number.isFinite(point.y)
        );

        if (!valid) {
          return;
        }

        // ------------------------------------------------
        // TAMBAHAN TOLERANSI SENTUH
        // ------------------------------------------------

        // 20px tambahan pada setiap sisi,
        // supaya jari lebih mudah mengenai tombol.

        const padding = 20;

        const minX =
          Math.min(
            ...points.map((p) => p.x)
          ) - padding;

        const maxX =
          Math.max(
            ...points.map((p) => p.x)
          ) + padding;

        const minY =
          Math.min(
            ...points.map((p) => p.y)
          ) - padding;

        const maxY =
          Math.max(
            ...points.map((p) => p.y)
          ) + padding;

        // ------------------------------------------------
        // CEK POSISI SENTUHAN
        // ------------------------------------------------

        const touchX = event.clientX;

        const touchY = event.clientY;

        const inside =
          touchX >= minX &&
          touchX <= maxX &&
          touchY >= minY &&
          touchY <= maxY;

        if (inside) {

          console.log(
            "IMIP QUIZ: tombol MULAI terdeteksi lewat pointer fallback"
          );

          startExperience();

        }

      },
      {
        passive: true
      }
    );

  }

  // ---------------------------------------------------
  // PASANG SETELAH CANVAS SIAP
  // ---------------------------------------------------

  if (scene.canvas) {

    attachListener();

  } else {

    scene.addEventListener(
      "renderstart",
      attachListener,
      {
        once: true
      }
    );

  }

}


// =====================================================
// 17. INISIALISASI MINDAR
// =====================================================

function initialize() {

  const scene = $("arScene");

  const target = $("imipTarget");

  const status = $("markerStatus");

  if (!scene || !target || !status) {

    console.error(
      "IMIP QUIZ: elemen utama AR tidak ditemukan"
    );

    return;
  }

  // ---------------------------------------------------
  // KAMERA SIAP
  // ---------------------------------------------------

  scene.addEventListener(
    "arReady",
    () => {

      if (!state.markerFound) {

        setMarkerStatus(
          "Scan logo IMIP"
        );

      }

      console.log(
        "MindAR: kamera siap"
      );

    }
  );

  // ---------------------------------------------------
  // ERROR KAMERA
  // ---------------------------------------------------

  scene.addEventListener(
    "arError",
    () => {

      setMarkerStatus(
        "Gagal membuka kamera / target",
        false,
        true
      );

      console.error(
        "MindAR: terjadi masalah kamera atau target"
      );

    }
  );

  // ---------------------------------------------------
  // LOGO IMIP TERDETEKSI
  // ---------------------------------------------------

  target.addEventListener(
    "targetFound",
    () => {

      state.markerFound = true;

      setMarkerStatus(
        state.started
          ? "Logo IMIP terdeteksi"
          : "Sentuh tombol MULAI",
        true
      );

      syncStartBackup();

      console.log(
        "MindAR: logo IMIP terdeteksi"
      );

    }
  );

  // ---------------------------------------------------
  // LOGO IMIP TIDAK TERDETEKSI
  // ---------------------------------------------------

  target.addEventListener(
    "targetLost",
    () => {

      state.markerFound = false;

      setMarkerStatus(
        "Arahkan ke logo IMIP"
      );

      syncStartBackup();

      console.log(
        "MindAR: logo IMIP tidak terlihat"
      );

    }
  );

  // ---------------------------------------------------
  // TOMBOL MULAI CADANGAN HTML
  // ---------------------------------------------------

  const backup = $("startBackup");

  if (backup) {

    backup.addEventListener(
      "click",
      () => {

        startExperience();

      }
    );

  }

  // ---------------------------------------------------
  // PASANG SISTEM SENTUHAN CADANGAN 3D
  // ---------------------------------------------------

  installPointerFallback(scene);

  // ---------------------------------------------------
  // SENTUHAN LANGSUNG OBJEK 3D
  // ---------------------------------------------------

  document.querySelectorAll(
    ".clickable[data-action]"
  ).forEach(
    (element) => {

      element.addEventListener(
        "click",
        () => {

          if (!state.markerFound) {
            return;
          }

          const action =
            element.dataset.action;

          handleAction(action);

        }
      );

    }
  );

  // ---------------------------------------------------
  // PANEL KONTROL SENTUH
  // ---------------------------------------------------

  const toggle = $("toggleDock");

  if (toggle) {

    toggle.addEventListener(
      "click",
      () => {

        if (!state.started) {
          return;
        }

        const collapsed =
          $("touchDock")
            .classList.contains("collapsed");

        setDockOpen(collapsed);

      }
    );

  }

  // ---------------------------------------------------
  // TAMPILKAN WELCOME PERTAMA KALI
  // ---------------------------------------------------

  render();

  console.log(
    "IMIP QUIZ V6: aplikasi diinisialisasi"
  );

}


// =====================================================
// 18. MENJALANKAN APLIKASI
// =====================================================

if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    initialize
  );

} else {

  initialize();

}
