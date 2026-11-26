
"use strict";

// ========================================
// QUIZ IMIP - MINDAR V4
// WELCOME AR + MENU + BELAJAR + KUIS
// ========================================

// ========================================
// 1. DATA MATERI DAN SOAL
// ========================================

// Materi contoh untuk simulasi akademik.
// Belum merupakan SOP resmi perusahaan.

const modules = {
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
          "Apa yang harus dilakukan jika berhalangan hadir?",

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
          "Keselamatan dan Kesehatan Kerja " +
          "bertujuan membantu mencegah " +
          "kecelakaan dan risiko kerja."
      },
      {
        title: "Penggunaan APD",
        body:
          "Gunakan Alat Pelindung Diri " +
          "yang sesuai dengan bahaya " +
          "dan jenis pekerjaan."
      },
      {
        title: "Respons Alarm",
        body:
          "Saat alarm bahaya aktif, " +
          "ikuti prosedur darurat dan " +
          "arahan petugas berwenang."
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
          "Saat alarm darurat aktif, tindakan yang tepat adalah?",

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
  started: false,

  // Saat pertama kali scan,
  // tampilkan welcome AR terlebih dahulu.
  screen: "welcome",

  category: null,

  lessonIndex: 0,
  questionIndex: 0,

  selectedAnswer: null,

  score: 0,

  markerFound: false
};

// ========================================
// 3. HELPER
// ========================================

const $ = (id) => document.getElementById(id);

function setText(id, value) {
  const element = $(id);

  if (element) {
    element.setAttribute(
      "value",
      String(value)
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

function openDock(open) {
  const dock = $("touchDock");
  const toggle = $("toggleDock");

  dock.classList.toggle(
    "collapsed",
    !open
  );

  toggle.textContent = open ? "−" : "+";
}

function clearButtons() {
  $("touchActions").replaceChildren();
}

function addButton(
  label,
  onClick,
  primary = false,
  selected = false
) {
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = label;

  if (primary) {
    button.classList.add("primary");
  }

  if (selected) {
    button.classList.add("selected");
  }

  button.addEventListener("click", onClick);

  $("touchActions").appendChild(button);

  return button;
}

function setDescription(text) {
  $("dockDescription").textContent = text;
}

// ========================================
// 4. MULAI QUIZ
// ========================================

function startExperience() {

  // Tombol hanya aktif jika logo terlihat.
  if (!state.markerFound) {
    return;
  }

  // Hindari tombol diproses berulang.
  if (state.started) {
    return;
  }

  state.started = true;
  state.screen = "menu";

  state.category = null;
  state.lessonIndex = 0;
  state.questionIndex = 0;

  state.selectedAnswer = null;
  state.score = 0;

  openDock(false);

  render();

  console.log(
    "QUIZ IMIP: welcome selesai, menu dibuka"
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

  openDock(true);

  render();
}

// ========================================
// 6. KEMBALI KE EMPAT MENU
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

  openDock(false);

  render();
}

// ========================================
// 7. MEMILIH JAWABAN
// ========================================

function chooseAnswer(index) {

  if (state.screen !== "quiz") {
    return;
  }

  // Mencegah satu soal dijawab berkali-kali.
  if (state.selectedAnswer !== null) {
    return;
  }

  const module = modules[state.category];

  if (!module) {
    return;
  }

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

  if (index === question.correct) {
    state.score += 1;
  }

  render();
}

// ========================================
// 8. LANJUT KE MATERI / SOAL BERIKUTNYA
// ========================================

function nextStep() {

  if (!state.category) {
    return;
  }

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
      state.lessonIndex += 1;
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

    // Wajib pilih jawaban terlebih dahulu.
    if (state.selectedAnswer === null) {
      return;
    }

    const lastQuestion =
      state.questionIndex ===
      module.questions.length - 1;

    if (!lastQuestion) {

      state.questionIndex += 1;
      state.selectedAnswer = null;

      render();

    } else {

      state.screen = "result";

      render();
    }

    return;
  }

  // ------------------------------------
  // HASIL
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

  // ------------------------------------
  // WELCOME: MULAI QUIZ
  // ------------------------------------

  if (action === "start") {

    if (state.screen === "welcome") {
      startExperience();
    }

    return;
  }

  // Semua aksi selain MULAI
  // hanya tersedia setelah welcome selesai.
  if (!state.started) {
    return;
  }

  // ------------------------------------
  // EMPAT MENU
  // ------------------------------------

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

  // ------------------------------------
  // TOMBOL KEMBALI
  // ------------------------------------

  if (action === "home") {
    goHome();
    return;
  }

  // ------------------------------------
  // TOMBOL LANJUT
  // ------------------------------------

  if (action === "next") {
    nextStep();
    return;
  }

  // ------------------------------------
  // PILIHAN JAWABAN
  // ------------------------------------

  if (
    typeof action === "string" &&
    action.startsWith("answer-")
  ) {

    const index = Number(
      action.replace("answer-", "")
    );

    chooseAnswer(index);
  }
}

// ========================================
// 10. TAMPILKAN EMPAT MENU
// ========================================

function renderMenu() {

  $("dockTitle").textContent =
    "Menu QUIZ IMIP";

  setDescription(
    "Pilih salah satu dari empat modul " +
    "melalui kartu 3D di atas logo IMIP. " +
    "Kamu juga dapat memakai tombol " +
    "pada panel ini."
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

  const total = module.lessons.length;

  const lastLesson =
    state.lessonIndex === total - 1;

  $("dockTitle").textContent =
    module.name;

  // ------------------------------------
  // PAPAN AR
  // ------------------------------------

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

  // ------------------------------------
  // PANEL SENTUH
  // ------------------------------------

  setDescription(
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

// ========================================
// 12. TAMPILKAN LATIHAN SOAL
// ========================================

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

  // ------------------------------------
  // PAPAN AR
  // ------------------------------------

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

  // Tombol LANJUT tidak aktif
  // sampai pengguna memilih jawaban.
  setVisible(
    "nextGroup",
    answered
  );

  // ------------------------------------
  // PANEL SENTUH
  // ------------------------------------

  setDescription(
    `Soal ${state.questionIndex + 1} dari ${total}\n\n` +
    question.question +
    (
      answered
        ? "\n\nJawaban sudah dicatat."
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

      // Hanya pilihan peserta yang disorot.
      // Kunci jawaban tidak ditampilkan.
      plane.setAttribute(
        "color",
        state.selectedAnswer === index
          ? "#FFD28B"
          : "#EBF8DC"
      );

      if (!answered) {

        addButton(
          `${letter}. ${option}`,
          () => chooseAnswer(index)
        );

      } else {

        const button = addButton(
          `${letter}. ${option}`,
          () => {},
          false,
          state.selectedAnswer === index
        );

        button.disabled = true;
      }

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
// 13. TAMPILKAN HASIL KUIS
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

  // ------------------------------------
  // PAPAN AR
  // ------------------------------------

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

  // ------------------------------------
  // PANEL SENTUH
  // ------------------------------------

  setDescription(
    `Kategori: ${module.name}\n\n` +
    `Nilai: ${score}/100\n` +
    `Jumlah soal: ${total}\n` +
    `Benar: ${correct}\n` +
    `Salah: ${wrong}\n\n` +
    "Ini merupakan hasil latihan akademik."
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
// 14. RENDER TAMPILAN UTAMA
// ========================================

function render() {

  const isWelcome =
    state.screen === "welcome";

  const isMenu =
    state.screen === "menu";

  const isQuiz =
    state.screen === "quiz";

  // ------------------------------------
  // PILIH TAMPILAN AR
  // ------------------------------------

  // Pembuka QUIZ IMIP
  setVisible(
    "welcome3d",
    isWelcome
  );

  // Empat menu 3D
  setVisible(
    "menu3d",
    isMenu
  );

  // Papan materi, soal, atau hasil
  setVisible(
    "content3d",
    !isWelcome && !isMenu
  );

  // Pilihan A, B, C
  setVisible(
    "worldChoices",
    isQuiz
  );

  // Tombol LANJUT
  setVisible(
    "nextGroup",
    !isWelcome && !isMenu && !isQuiz
  );

  // ------------------------------------
  // PANEL SENTUH
  // ------------------------------------

  // Panel disembunyikan saat welcome AR.
  // Setelah MULAI, panel tersedia kembali.
  $("touchDock").hidden = isWelcome;

  clearButtons();

  // ------------------------------------
  // PILIH RENDER BERDASARKAN SCREEN
  // ------------------------------------

  if (isWelcome) {
    return;
  }

  if (isMenu) {
    renderMenu();
    return;
  }

  if (state.screen === "learn") {
    renderLearn();
    return;
  }

  if (isQuiz) {
    renderQuiz();
    return;
  }

  if (state.screen === "result") {
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
  // ERROR KAMERA / TRACKING
  // ------------------------------------

  scene.addEventListener(
    "arError",
    () => {

      status.textContent =
        "Gagal membuka AR";

      status.classList.remove("found");
      status.classList.add("error");

      console.error(
        "MindAR: kamera atau target gagal"
      );
    }
  );

  // ------------------------------------
  // LOGO IMIP TERDETEKSI
  // ------------------------------------

  target.addEventListener(
    "targetFound",
    () => {

      state.markerFound = true;

      status.textContent =
        state.started
          ? "Logo IMIP terdeteksi"
          : "Sentuh MULAI QUIZ";

      status.classList.add("found");
      status.classList.remove("error");

      console.log(
        "MindAR: logo IMIP ditemukan"
      );
    }
  );

  // ------------------------------------
  // LOGO IMIP HILANG DARI KAMERA
  // ------------------------------------

  target.addEventListener(
    "targetLost",
    () => {

      state.markerFound = false;

      status.textContent =
        "Arahkan ke logo IMIP";

      status.classList.remove("found");

      console.log(
        "MindAR: target tidak terlihat"
      );
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

        // Abaikan sentuhan jika marker hilang.
        if (!state.markerFound) {
          return;
        }

        const action =
          element.dataset.action;

        // Sebelum welcome selesai,
        // hanya tombol MULAI yang bekerja.
        if (
          !state.started &&
          action !== "start"
        ) {
          return;
        }

        handleAction(action);
      }
    );

  });

  // ------------------------------------
  // PANEL KONTROL SENTUH
  // ------------------------------------

  $("toggleDock").addEventListener(
    "click",
    () => {

      // Panel tidak bisa digunakan
      // sebelum welcome selesai.
      if (!state.started) {
        return;
      }

      const collapsed =
        $("touchDock")
          .classList.contains("collapsed");

      openDock(collapsed);
    }
  );

  // ------------------------------------
  // TAMPILAN PERTAMA
  // ------------------------------------

  render();
}

// ========================================
// 16. MENJALANKAN APLIKASI
// ========================================

if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    initialize
  );

} else {

  initialize();

}