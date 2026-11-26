
"use strict";

// =======================================
// SOP-AR IMIP - MINDAR V2
// 4 MENU + BELAJAR + KUIS INTERAKTIF
// =======================================

// =======================================
// 1. DATA MATERI DAN SOAL
// =======================================

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

// =======================================
// 2. STATUS APLIKASI
// =======================================

const state = {
  screen: "menu",
  category: null,

  lessonIndex: 0,
  questionIndex: 0,

  selectedAnswer: null,
  score: 0,

  markerFound: false
};

// =======================================
// 3. HELPER
// =======================================

const $ = (id) => document.getElementById(id);

function setText(id, value) {
  const element = $(id);

  if (element) {
    element.setAttribute("value", String(value));
  }
}

function setVisible(id, visible) {
  const element = $(id);

  if (element) {
    element.setAttribute("visible", visible);
  }
}

function openDock(open) {
  const dock = $("touchDock");
  const toggle = $("toggleDock");

  dock.classList.toggle("collapsed", !open);

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

// =======================================
// 4. BUKA MODUL
// =======================================

function openModule(screen, category) {
  if (!modules[category]) return;

  state.screen = screen;
  state.category = category;

  state.lessonIndex = 0;
  state.questionIndex = 0;

  state.selectedAnswer = null;
  state.score = 0;

  openDock(true);
  render();
}

// =======================================
// 5. KEMBALI KE MENU
// =======================================

function goHome() {
  state.screen = "menu";
  state.category = null;

  state.lessonIndex = 0;
  state.questionIndex = 0;

  state.selectedAnswer = null;
  state.score = 0;

  openDock(false);
  render();
}

// =======================================
// 6. PILIH JAWABAN
// =======================================

function chooseAnswer(index) {
  if (state.screen !== "quiz") return;

  // Satu soal hanya boleh dijawab sekali
  if (state.selectedAnswer !== null) return;

  const module = modules[state.category];
  const question = module.questions[state.questionIndex];

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

// =======================================
// 7. TOMBOL LANJUT
// =======================================

function nextStep() {
  if (!state.category) return;

  const module = modules[state.category];

  // Perpindahan materi
  if (state.screen === "learn") {

    const lastLesson =
      state.lessonIndex === module.lessons.length - 1;

    if (!lastLesson) {
      state.lessonIndex += 1;
      render();
    } else {
      openModule("quiz", state.category);
    }

    return;
  }

  // Perpindahan soal
  if (state.screen === "quiz") {

    if (state.selectedAnswer === null) {
      return;
    }

    const lastQuestion =
      state.questionIndex === module.questions.length - 1;

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

  // Ulangi setelah hasil
  if (state.screen === "result") {
    openModule("quiz", state.category);
  }
}

// =======================================
// 8. INTERAKSI OBJEK 3D
// =======================================

function handleAction(action) {

  const menuActions = {
    "learn-pp": ["learn", "pp"],
    "learn-k3": ["learn", "k3"],
    "quiz-pp": ["quiz", "pp"],
    "quiz-k3": ["quiz", "k3"]
  };

  if (menuActions[action]) {
    if (state.screen !== "menu") return;

    const [screen, category] = menuActions[action];

    openModule(screen, category);
    return;
  }

  if (action === "home") {
    goHome();
    return;
  }

  if (action === "next") {
    nextStep();
    return;
  }

  if (action.startsWith("answer-")) {
    const index = Number(
      action.replace("answer-", "")
    );

    chooseAnswer(index);
  }
}

// =======================================
// 9. RENDER MENU
// =======================================

function renderMenu() {
  $("dockTitle").textContent = "Menu SOP-AR";

  setDescription(
    "Pilih modul melalui empat kartu 3D " +
    "di atas logo IMIP, atau gunakan " +
    "tombol di bawah ini."
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

// =======================================
// 10. RENDER MATERI
// =======================================

function renderLearn() {
  const module = modules[state.category];

  const lesson =
    module.lessons[state.lessonIndex];

  const total = module.lessons.length;

  const lastLesson =
    state.lessonIndex === total - 1;

  $("dockTitle").textContent = module.name;

  setText(
    "worldMode",
    `BELAJAR ${state.lessonIndex + 1}/${total}`
  );

  setText("worldTitle", lesson.title);
  setText("worldBody", lesson.body);

  setText(
    "worldHint",
    "Baca materi, kemudian tekan LANJUT."
  );

  setText(
    "nextText",
    lastLesson ? "MULAI SOAL" : "LANJUT"
  );

  setDescription(
    `${lesson.title}\n\n${lesson.body}\n\n` +
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

// =======================================
// 11. RENDER KUIS
// =======================================

function renderQuiz() {
  const module = modules[state.category];

  const question =
    module.questions[state.questionIndex];

  const total = module.questions.length;

  const answered =
    state.selectedAnswer !== null;

  const lastQuestion =
    state.questionIndex === total - 1;

  $("dockTitle").textContent = module.name;

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
      : "Pilih satu jawaban: A, B, atau C."
  );

  setText(
    "nextText",
    lastQuestion ? "LIHAT HASIL" : "LANJUT"
  );

  // Tombol lanjut hanya muncul setelah menjawab
  setVisible("nextGroup", answered);

  setDescription(
    `Soal ${state.questionIndex + 1} dari ${total}\n\n` +
    question.question +
    (answered
      ? "\n\nJawaban dicatat. Lanjutkan soal."
      : "")
  );

  question.options.forEach((option, index) => {

    const letter = "ABC"[index];

    setText(
      `optionText${index}`,
      `${letter}. ${option}`
    );

    const plane = $(`option${index}`);

    plane.setAttribute(
      "color",
      state.selectedAnswer === index
        ? "#ffb347"
        : "#e4f5dc"
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
  });

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

// =======================================
// 12. RENDER HASIL
// =======================================

function renderResult() {
  const module = modules[state.category];

  const total = module.questions.length;
  const correct = state.score;

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
    `Jawaban benar: ${correct} dari ${total}. ` +
    "Latihan telah selesai."
  );

  setText(
    "worldHint",
    "Anda bisa mengulangi latihan."
  );

  setText(
    "nextText",
    "ULANGI"
  );

  setDescription(
    `Kategori: ${module.name}\n\n` +
    `Nilai: ${score}/100\n` +
    `Benar: ${correct}\n` +
    `Salah: ${total - correct}\n\n` +
    "Ini merupakan hasil latihan akademik."
  );

  addButton(
    "Kembali ke Menu",
    goHome
  );

  addButton(
    "Ulangi Latihan",
    () => openModule("quiz", state.category),
    true
  );
}

// =======================================
// 13. RENDER UTAMA
// =======================================

function render() {
  const isMenu =
    state.screen === "menu";

  setVisible("menu3d", isMenu);
  setVisible("content3d", !isMenu);

  setVisible(
    "worldChoices",
    state.screen === "quiz"
  );

  setVisible(
    "nextGroup",
    state.screen !== "menu" &&
    state.screen !== "quiz"
  );

  clearButtons();

  if (state.screen === "menu") {
    renderMenu();
    return;
  }

  if (state.screen === "learn") {
    renderLearn();
    return;
  }

  if (state.screen === "quiz") {
    renderQuiz();
    return;
  }

  if (state.screen === "result") {
    renderResult();
  }
}

// =======================================
// 14. INISIALISASI MINDAR
// =======================================

function initialize() {

  const scene = $("arScene");
  const target = $("imipTarget");
  const status = $("markerStatus");

  // Kamera MindAR siap
  scene.addEventListener("arReady", () => {
    if (!state.markerFound) {
      status.textContent = "Scan logo IMIP";
    }
  });

  // Error kamera
  scene.addEventListener("arError", () => {
    status.textContent = "Gagal membuka AR";
    status.classList.remove("found");
  });

  // Logo ditemukan
  target.addEventListener("targetFound", () => {

    state.markerFound = true;

    status.textContent = "Logo IMIP terdeteksi";
    status.classList.add("found");

    console.log("MindAR: target ditemukan");
  });

  // Logo tidak terlihat
  target.addEventListener("targetLost", () => {

    state.markerFound = false;

    status.textContent = "Arahkan ke logo IMIP";
    status.classList.remove("found");

    console.log("MindAR: target hilang");
  });

  // Klik menu, jawaban, dan navigasi 3D
  document.querySelectorAll(
    ".clickable[data-action]"
  ).forEach((element) => {

    element.addEventListener("click", () => {

      if (!state.markerFound) {
        return;
      }

      handleAction(element.dataset.action);
    });

  });

  // Panel sentuh
  $("toggleDock").addEventListener("click", () => {

    const collapsed =
      $("touchDock").classList.contains("collapsed");

    openDock(collapsed);
  });

  // Tampilkan menu awal
  render();
}

// =======================================
// 15. MULAI
// =======================================

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initialize
  );
} else {
  initialize();
}
