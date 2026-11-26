
"use strict";

// ========================================
// IMIP QUIZ - MINDAR V5
// WELCOME AR + MENU + BELAJAR + KUIS
// ========================================

// Tampilan pembuka menggunakan gambar
// welcome-imip.png dan welcome-mulai.png
//
// Materi dan soal adalah contoh akademik,
// bukan SOP resmi PT IRNC.

// ========================================
// 1. DATA MATERI DAN SOAL
// ========================================

const modules = {
  pp: {
    name: "Peraturan Perusahaan",

    lessons: [
      {
        title: "Pengenalan PP",
        body:
          "Peraturan Perusahaan berisi ketentuan kerja, " +
          "hak, dan kewajiban yang perlu dipahami " +
          "oleh karyawan."
      },
      {
        title: "Kedisiplinan",
        body:
          "Karyawan perlu mengikuti aturan kehadiran, " +
          "waktu kerja, dan tata tertib yang berlaku."
      },
      {
        title: "Pelaporan",
        body:
          "Ketika terjadi kendala pekerjaan, laporkan " +
          "melalui jalur komunikasi yang telah ditetapkan."
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

// ========================================
// 2. STATUS APLIKASI
// ========================================

const state = {

  // Alur:
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

// ========================================
// 3. HELPER
// ========================================

const $ = (id) => document.getElementById(id);

function setText(id, text) {
  const element = $(id);

  if (element) {
    element.setAttribute(
      "value",
      String(text)
    );
  }
}

function setVisible(id, visible) {
  const element = $(id);

  if (element) {
    element.setAttribute(
      "visible",
      Boolean(visible)
    );
  }
}

function setDockOpen(open) {

  $("touchDock").classList.toggle(
    "collapsed",
    !open
  );

  $("toggleDock").textContent =
    open ? "−" : "+";
}

function clearButtons() {
  $("touchActions").replaceChildren();
}

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

  $("touchActions").append(button);

  return button;
}

function describe(text) {
  $("dockDescription").textContent = text;
}

// ========================================
// 4. TOMBOL MULAI QUIZ
// ========================================

function startExperience() {

  // Harus mendeteksi logo IMIP dahulu
  if (!state.markerFound) {
    return;
  }

  // Tidak boleh mulai dua kali
  if (state.started) {
    return;
  }

  // Hanya bekerja pada halaman welcome
  if (state.screen !== "welcome") {
    return;
  }

  state.started = true;

  state.screen = "menu";

  setDockOpen(false);

  render();

  $("markerStatus").textContent =
    "Pilih menu IMIP QUIZ";

  console.log(
    "IMIP QUIZ: tombol mulai berhasil ditekan"
  );
}

// ========================================
// 5. MEMBUKA MODUL
// ========================================

function openModule(screen, category) {

  if (!state.started) {
    return;
  }

  if (!modules[category]) {
    return;
  }

  if (!["learn", "quiz"].includes(screen)) {
    return;
  }

  state.screen = screen;

  state.category = category;

  state.lessonIndex = 0;

  state.questionIndex = 0;

  state.selectedAnswer = null;

  state.score = 0;

  setDockOpen(true);

  render();
}

// ========================================
// 6. KEMBALI KE MENU
// ========================================

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

// ========================================
// 7. MEMILIH JAWABAN
// ========================================

function chooseAnswer(index) {

  if (state.screen !== "quiz") {
    return;
  }

  // Jawaban tidak bisa dipilih berulang
  if (state.selectedAnswer !== null) {
    return;
  }

  const module = modules[state.category];

  const question =
    module.questions[state.questionIndex];

  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= question.options.length
  ) {
    return;
  }

  state.selectedAnswer = index;

  // Tambah nilai jika jawaban benar
  if (index === question.correct) {
    state.score++;
  }

  render();
}

// ========================================
// 8. LANJUT MATERI / SOAL
// ========================================

function nextStep() {

  const module = modules[state.category];

  if (!module) {
    return;
  }

  // ------------------------------------
  // MATERI BELAJAR
  // ------------------------------------

  if (state.screen === "learn") {

    const lastLesson =
      state.lessonIndex ===
      module.lessons.length - 1;

    if (!lastLesson) {

      state.lessonIndex++;

      render();

    } else {

      openModule(
        "quiz",
        state.category
      );
    }

    return;
  }

  // ------------------------------------
  // LATIHAN SOAL
  // ------------------------------------

  if (state.screen === "quiz") {

    // Wajib memilih jawaban
    if (state.selectedAnswer === null) {
      return;
    }

    const lastQuestion =
      state.questionIndex ===
      module.questions.length - 1;

    if (!lastQuestion) {

      state.questionIndex++;

      state.selectedAnswer = null;

    } else {

      state.screen = "result";
    }

    render();

    return;
  }

  // ------------------------------------
  // HASIL LATIHAN
  // ------------------------------------

  if (state.screen === "result") {

    openModule(
      "quiz",
      state.category
    );
  }
}

// ========================================
// 9. AKSI TOMBOL 3D
// ========================================

function handleAction(action) {

  // Tombol MULAI pada gambar pembuka
  if (action === "start") {

    startExperience();

    return;
  }

  if (!state.started) {
    return;
  }

  // Empat pilihan menu utama
  const menuActions = {

    "learn-pp": ["learn", "pp"],

    "learn-k3": ["learn", "k3"],

    "quiz-pp": ["quiz", "pp"],

    "quiz-k3": ["quiz", "k3"]

  };

  if (menuActions[action]) {

    if (state.screen === "menu") {

      const [screen, category] =
        menuActions[action];

      openModule(screen, category);
    }

    return;
  }

  // Tombol kembali
  if (action === "home") {

    goHome();

    return;
  }

  // Tombol lanjut
  if (action === "next") {

    nextStep();

    return;
  }

  // Jawaban A, B, C
  if (action.startsWith("answer-")) {

    const index = Number(
      action.slice(7)
    );

    chooseAnswer(index);
  }
}

// ========================================
// 10. TAMPILKAN MENU UTAMA
// ========================================

function renderMenu() {

  $("dockTitle").textContent =
    "Menu IMIP QUIZ";

  describe(
    "Sentuh salah satu dari empat menu " +
    "pada logo IMIP, atau gunakan kontrol ini."
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

// ========================================
// 11. TAMPILKAN MATERI
// ========================================

function renderLearn() {

  const module = modules[state.category];

  const lesson =
    module.lessons[state.lessonIndex];

  const lastLesson =
    state.lessonIndex ===
    module.lessons.length - 1;

  $("dockTitle").textContent =
    module.name;

  setText(
    "worldMode",
    `BELAJAR ${state.lessonIndex + 1}/${module.lessons.length}`
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

  describe(
    `${lesson.title}\n\n` +
    `${lesson.body}\n\n` +
    `Materi ${state.lessonIndex + 1} dari ${module.lessons.length}`
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

// ========================================
// 12. TAMPILKAN SOAL
// ========================================

function renderQuiz() {

  const module = modules[state.category];

  const question =
    module.questions[state.questionIndex];

  const answered =
    state.selectedAnswer !== null;

  const lastQuestion =
    state.questionIndex ===
    module.questions.length - 1;

  $("dockTitle").textContent =
    module.name;

  setText(
    "worldMode",
    `SOAL ${state.questionIndex + 1}/${module.questions.length}`
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

  // Tombol lanjut hanya muncul setelah dijawab
  setVisible(
    "nextGroup",
    answered
  );

  describe(
    `Soal ${state.questionIndex + 1} dari ${module.questions.length}\n\n` +
    question.question +
    (
      answered
        ? "\n\nJawaban dicatat."
        : ""
    )
  );

  // ------------------------------------
  // JAWABAN A, B, C
  // ------------------------------------

  question.options.forEach(
    (option, index) => {

      const letter = "ABC"[index];

      setText(
        `optionText${index}`,
        `${letter}. ${option}`
      );

      const plane = $(`option${index}`);

      // Sorot jawaban yang dipilih,
      // bukan menampilkan kunci jawaban
      plane.setAttribute(
        "color",
        state.selectedAnswer === index
          ? "#FFD28B"
          : "#EBF8DC"
      );

      const button = addButton(
        `${letter}. ${option}`,
        () => chooseAnswer(index),
        false,
        state.selectedAnswer === index
      );

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

// ========================================
// 13. TAMPILKAN HASIL LATIHAN
// ========================================

function renderResult() {

  const module = modules[state.category];

  const total = module.questions.length;

  const correct = state.score;

  const wrong = total - correct;

  const score =
    Math.round((correct / total) * 100);

  $("dockTitle").textContent =
    "Hasil Latihan";

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
    `Jawaban benar: ${correct} dari ${total}. Latihan selesai.`
  );

  setText(
    "worldHint",
    "Kamu bisa mengulangi latihan."
  );

  setText(
    "nextText",
    "ULANGI"
  );

  describe(
    `Kategori: ${module.name}\n\n` +
    `Nilai: ${score}/100\n` +
    `Jumlah soal: ${total}\n` +
    `Benar: ${correct}\n` +
    `Salah: ${wrong}`
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

// ========================================
// 14. RENDER SEMUA TAMPILAN
// ========================================

function render() {

  const welcome =
    state.screen === "welcome";

  const menu =
    state.screen === "menu";

  const quiz =
    state.screen === "quiz";

  // Pembuka IMIP QUIZ
  setVisible(
    "welcome3d",
    welcome
  );

  // Empat menu utama
  setVisible(
    "menu3d",
    menu
  );

  // Materi / soal / hasil
  setVisible(
    "content3d",
    !welcome && !menu
  );

  // Pilihan jawaban
  setVisible(
    "worldChoices",
    quiz
  );

  // Tombol lanjut
  setVisible(
    "nextGroup",
    !welcome && !menu && !quiz
  );

  // Panel sentuh disembunyikan
  // sebelum tombol MULAI ditekan
  $("touchDock").hidden = welcome;

  clearButtons();

  if (welcome) {
    return;
  }

  if (menu) {
    renderMenu();
  }

  else if (state.screen === "learn") {
    renderLearn();
  }

  else if (quiz) {
    renderQuiz();
  }

  else if (state.screen === "result") {
    renderResult();
  }
}

// ========================================
// 15. INISIALISASI MINDAR
// ========================================

function initialize() {

  const scene = $("arScene");

  const target = $("imipTarget");

  const status = $("markerStatus");

  // ------------------------------------
  // KAMERA SIAP
  // ------------------------------------

  scene.addEventListener(
    "arReady",
    () => {

      if (!state.markerFound) {

        status.textContent =
          "Scan logo IMIP";
      }

      status.classList.remove("error");
    }
  );

  // ------------------------------------
  // ERROR KAMERA / TARGET
  // ------------------------------------

  scene.addEventListener(
    "arError",
    () => {

      status.textContent =
        "Gagal membuka kamera / target";

      status.classList.remove("found");

      status.classList.add("error");
    }
  );

  // ------------------------------------
  // LOGO IMIP TERDETEKSI
  // ------------------------------------

  target.addEventListener(
    "targetFound",
    () => {

      state.markerFound = true;

      status.classList.add("found");

      status.textContent =
        state.started
          ? "Logo IMIP terdeteksi"
          : "Sentuh tombol MULAI";
    }
  );

  // ------------------------------------
  // LOGO IMIP HILANG
  // ------------------------------------

  target.addEventListener(
    "targetLost",
    () => {

      state.markerFound = false;

      status.classList.remove("found");

      status.textContent =
        "Arahkan ke logo IMIP";
    }
  );

  // ------------------------------------
  // SENTUH OBJEK 3D
  // ------------------------------------

  document.querySelectorAll(
    ".clickable[data-action]"
  ).forEach((element) => {

    element.addEventListener(
      "click",
      () => {

        // Abaikan jika marker tidak terlihat
        if (!state.markerFound) {
          return;
        }

        const action =
          element.dataset.action;

        handleAction(action);
      }
    );
  });

  // ------------------------------------
  // PANEL SENTUH HP
  // ------------------------------------

  $("toggleDock").addEventListener(
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

  // ------------------------------------
  // TAMPILAN PERTAMA
  // ------------------------------------

  render();
}

// ========================================
// 16. MULAI APLIKASI
// ========================================

if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    initialize
  );

} else {

  initialize();
}
