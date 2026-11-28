
"use strict";

// ================================================
// IMIP QUIZ - MINDAR V8
// APP.JS
// ================================================
// FITUR:
// - Scan logo IMIP
// - Pembuka IMIP QUIZ full 3D
// - Tombol MULAI interaktif
// - Area sentuh cadangan
// - Empat menu AR
// - Pembelajaran PP dan K3
// - Latihan pilihan ganda
// - Hasil nilai
//
// Materi dan soal merupakan contoh akademik.
// Bukan SOP resmi PT IRNC.
// ================================================


// ================================================
// 1. DATA MATERI DAN SOAL
// ================================================

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
          "dan jenis pekerjaan, serta periksa " +
          "kondisinya sebelum digunakan."
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


// ================================================
// 2. STATUS APLIKASI
// ================================================

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


// ================================================
// 3. FUNGSI BANTUAN
// ================================================

const $ = (id) => document.getElementById(id);


// Mengubah teks objek 3D
function setText(id, text) {

  const element = $(id);

  if (element) {
    element.setAttribute(
      "value",
      String(text)
    );
  }
}


// Menampilkan / menyembunyikan objek
function setVisible(id, visible) {

  const element = $(id);

  if (element) {
    element.setAttribute(
      "visible",
      Boolean(visible)
    );
  }
}


// Mengatur panel sentuh
function setDockOpen(open) {

  $("touchDock").classList.toggle(
    "collapsed",
    !open
  );

  $("toggleDock").textContent =
    open ? "−" : "+";
}


// Menghapus tombol lama
function clearButtons() {

  $("touchActions").replaceChildren();
}


// Membuat tombol HTML
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


// Mengubah deskripsi panel
function describe(text) {

  $("dockDescription").textContent = text;
}


// Mengatur status marker
function setMarkerStatus(text, found = false, error = false) {

  const status = $("markerStatus");

  if (!status) return;

  status.textContent = text;

  status.classList.toggle(
    "found",
    found
  );

  status.classList.toggle(
    "error",
    error
  );
}


// ================================================
// 4. TOMBOL MULAI ALTERNATIF
// ================================================

function syncStartBackup() {

  const button = $("startBackup");

  if (!button) return;

  const shouldShow =
    state.markerFound &&
    state.screen === "welcome" &&
    !state.started;

  button.hidden = !shouldShow;
}


// ================================================
// 5. MEMULAI QUIZ
// ================================================

function startExperience() {

  // Marker harus terlihat
  if (!state.markerFound) return;

  // Tidak boleh dijalankan dua kali
  if (state.started) return;

  // Hanya pada tampilan welcome
  if (state.screen !== "welcome") return;

  state.started = true;

  state.screen = "menu";

  state.category = null;

  state.lessonIndex = 0;

  state.questionIndex = 0;

  state.selectedAnswer = null;

  state.score = 0;

  setDockOpen(false);

  render();

  setMarkerStatus(
    "Pilih menu IMIP QUIZ",
    true
  );

  syncStartBackup();

  console.log(
    "IMIP QUIZ: tombol MULAI berhasil ditekan"
  );
}


// ================================================
// 6. BUKA MODUL
// ================================================

function openModule(screen, category) {

  if (!state.started) return;

  if (!modules[category]) return;

  if (!["learn", "quiz"].includes(screen)) return;

  state.screen = screen;

  state.category = category;

  state.lessonIndex = 0;

  state.questionIndex = 0;

  state.selectedAnswer = null;

  state.score = 0;

  setDockOpen(false);

  render();
}


// ================================================
// 7. KEMBALI KE MENU
// ================================================

function goHome() {

  if (!state.started) return;

  state.screen = "menu";

  state.category = null;

  state.lessonIndex = 0;

  state.questionIndex = 0;

  state.selectedAnswer = null;

  state.score = 0;

  setDockOpen(false);

  render();
}


// ================================================
// 8. PILIH JAWABAN
// ================================================

function chooseAnswer(index) {

  if (state.screen !== "quiz") return;

  // Satu soal hanya bisa dijawab sekali
  if (state.selectedAnswer !== null) return;

  const module = modules[state.category];

  if (!module) return;

  const question = module.questions[state.questionIndex];

  if (!question) return;

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


// ================================================
// 9. TOMBOL LANJUT
// ================================================

function nextStep() {

  const module = modules[state.category];

  if (!module) return;

  // MATERI
  if (state.screen === "learn") {

    if (
      state.lessonIndex <
      module.lessons.length - 1
    ) {

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

  // SOAL
  if (state.screen === "quiz") {

    if (state.selectedAnswer === null) {
      return;
    }

    if (
      state.questionIndex <
      module.questions.length - 1
    ) {

      state.questionIndex++;

      state.selectedAnswer = null;

    } else {

      state.screen = "result";
    }

    render();

    return;
  }

  // HASIL
  if (state.screen === "result") {

    openModule(
      "quiz",
      state.category
    );
  }
}


// ================================================
// 10. AKSI TOMBOL AR
// ================================================

function handleAction(action) {

  if (!action) return;

  // MULAI
  if (action === "start") {
    startExperience();
    return;
  }

  if (!state.started) return;

  // MENU
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

  // KEMBALI
  if (action === "home") {
    goHome();
    return;
  }

  // LANJUT
  if (action === "next") {
    nextStep();
    return;
  }

  // JAWABAN
  if (action.startsWith("answer-")) {

    const index = Number(
      action.slice(7)
    );

    chooseAnswer(index);
  }
}


// ================================================
// 11. TAMPILKAN EMPAT MENU
// ================================================

function renderMenu() {

  $("dockTitle").textContent =
    "Menu IMIP QUIZ";

  describe(
    "Sentuh salah satu dari empat menu " +
    "3D di atas logo IMIP, atau gunakan " +
    "kontrol sentuh."
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


// ================================================
// 12. TAMPILKAN MATERI
// ================================================

function renderLearn() {

  const module = modules[state.category];

  const lesson =
    module.lessons[state.lessonIndex];

  const total = module.lessons.length;

  const lastLesson =
    state.lessonIndex === total - 1;

  $("dockTitle").textContent =
    module.name;

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
    "Baca materi, lalu tekan LANJUT."
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


// ================================================
// 13. TAMPILKAN KUIS
// ================================================

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

  // Tombol lanjut muncul setelah jawaban
  setVisible(
    "nextGroup",
    answered
  );

  describe(
    `Soal ${state.questionIndex + 1} dari ${total}\n\n` +
    question.question +
    (answered
      ? "\n\nJawaban dicatat."
      : "")
  );

  // Tiga pilihan jawaban
  question.options.forEach((option, index) => {

    const letter = "ABC"[index];

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

    const button = addButton(
      `${letter}. ${option}`,
      () => chooseAnswer(index),
      false,
      state.selectedAnswer === index
    );

    button.disabled = answered;
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


// ================================================
// 14. TAMPILKAN HASIL
// ================================================

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
    `Jawaban benar: ${correct} dari ${total}. ` +
    "Latihan selesai."
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


// ================================================
// 15. RENDER UTAMA
// ================================================

function render() {

  const welcome =
    state.screen === "welcome";

  const menu =
    state.screen === "menu";

  const quiz =
    state.screen === "quiz";

  // Pembuka
  setVisible("welcome3d", welcome);

  // Empat menu
  setVisible("menu3d", menu);

  // Papan isi
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

  // Panel sentuh
  $("touchDock").hidden = welcome;

  syncStartBackup();

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


// ================================================
// 16. TOMBOL MULAI CADANGAN
// ================================================

// Area klik transparan di AR bergerak bersama
// papan. Jika klik A-Frame tidak tertangkap,
// posisi hitbox diproyeksikan ke layar HP.

function installPointerFallback(scene) {

  function attach() {

    const canvas = scene.canvas;

    if (!canvas) return;

    if (canvas.dataset.imipTouchReady) {
      return;
    }

    canvas.dataset.imipTouchReady = "1";

    canvas.addEventListener(
      "pointerup",
      (event) => {

        if (!state.markerFound) return;

        if (state.started) return;

        if (state.screen !== "welcome") return;

        const hit = $("start3dHit");

        const camera = scene.camera;

        if (!hit || !hit.object3D || !camera) {
          return;
        }

        const width =
          Number(hit.getAttribute("width")) || 1.00;

        const height =
          Number(hit.getAttribute("height")) || 0.27;

        const rect =
          canvas.getBoundingClientRect();

        if (!rect.width || !rect.height) {
          return;
        }

        hit.object3D.updateWorldMatrix(
          true,
          false
        );

        camera.updateMatrixWorld(true);

        const vertices = [
          [-width / 2, -height / 2],
          [ width / 2, -height / 2],
          [-width / 2,  height / 2],
          [ width / 2,  height / 2]
        ];

        const THREE = AFRAME.THREE;

        const points = vertices.map(([x, y]) => {

          const point = new THREE.Vector3(
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
        });

        const valid = points.every(
          (p) =>
            Number.isFinite(p.x) &&
            Number.isFinite(p.y)
        );

        if (!valid) return;

        // Toleransi sentuhan 20 piksel
        const padding = 20;

        const minX =
          Math.min(...points.map(p => p.x)) - padding;

        const maxX =
          Math.max(...points.map(p => p.x)) + padding;

        const minY =
          Math.min(...points.map(p => p.y)) - padding;

        const maxY =
          Math.max(...points.map(p => p.y)) + padding;

        const inside =
          event.clientX >= minX &&
          event.clientX <= maxX &&
          event.clientY >= minY &&
          event.clientY <= maxY;

        if (inside) {
          startExperience();
        }
      },
      {
        passive: true
      }
    );
  }

  if (scene.canvas) {
    attach();
  } else {
    scene.addEventListener(
      "renderstart",
      attach,
      { once: true }
    );
  }
}


// ================================================
// 17. INISIALISASI MINDAR
// ================================================

function initialize() {

  const scene = $("arScene");

  const target = $("imipTarget");

  const status = $("markerStatus");

  if (!scene || !target || !status) {
    console.error(
      "Elemen utama MindAR tidak ditemukan."
    );
    return;
  }

  // Kamera siap
  scene.addEventListener(
    "arReady",
    () => {

      if (!state.markerFound) {
        setMarkerStatus("Scan logo IMIP");
      }

      console.log(
        "MindAR: kamera siap"
      );
    }
  );

  // Error kamera
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

  // Logo ditemukan
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

  // Logo hilang dari kamera
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

  // Tombol MULAI cadangan HTML
  const backup = $("startBackup");

  if (backup) {
    backup.addEventListener(
      "click",
      startExperience
    );
  }

  // Sentuhan cadangan pada kanvas
  installPointerFallback(scene);

  // Sentuhan objek 3D
  document.querySelectorAll(
    ".clickable[data-action]"
  ).forEach((element) => {

    element.addEventListener(
      "click",
      () => {

        if (!state.markerFound) {
          return;
        }

        handleAction(
          element.dataset.action
        );
      }
    );
  });

  // Panel kontrol sentuh
  const toggle = $("toggleDock");

  if (toggle) {
    toggle.addEventListener(
      "click",
      () => {

        if (!state.started) return;

        const collapsed =
          $("touchDock")
            .classList.contains("collapsed");

        setDockOpen(collapsed);
      }
    );
  }

  // Tampilan awal
  render();

  console.log(
    "IMIP QUIZ V8 berhasil diinisialisasi"
  );
}


// ================================================
// 18. MULAI APLIKASI
// ================================================

if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    initialize
  );

} else {

  initialize();
}
