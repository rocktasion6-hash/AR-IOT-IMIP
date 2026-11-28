
"use strict";

// ========================================
// IMIP QUIZ - MINDAR V12
// APP.JS
// ========================================
//
// Fitur:
// 1. Welcome IMIP QUIZ 3D
// 2. Empat menu utama
// 3. Belajar PP
// 4. Belajar K3 dengan objek APD 3D
// 5. Delapan objek APD
// 6. Navigasi sebelumnya dan selanjutnya
// 7. Latihan soal PP dan K3
// 8. Perhitungan nilai otomatis
// 9. Deteksi marker IMIP
// 10. Tombol MULAI alternatif
//
// Materi merupakan simulasi akademik.
// Bukan SOP resmi PT IRNC.
// ========================================


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
          "Gunakan Alat Pelindung Diri sesuai " +
          "bahaya dan jenis pekerjaan, serta " +
          "periksa kondisinya sebelum digunakan."
      },
      {
        title: "Respons Alarm",
        body:
          "Saat alarm bahaya aktif, ikuti " +
          "prosedur darurat dan arahan " +
          "petugas berwenang."
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
          "Sebelum masuk area berbahaya, " +
          "karyawan harus?",

        options: [
          "Memakai APD yang sesuai",
          "Mengabaikan risiko",
          "Melepas perlindungan"
        ],

        correct: 0
      },
      {
        question:
          "Saat alarm darurat aktif, " +
          "apa tindakan yang tepat?",

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
// 2. STATE APLIKASI
// ========================================

const state = {

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


// Mengubah tulisan objek 3D
function setText(id, text) {

  const element = $(id);

  if (element) {

    element.setAttribute(
      "value",
      String(text)
    );

  }
}


// Menampilkan atau menyembunyikan objek
function setVisible(id, visible) {

  const element = $(id);

  if (element) {

    element.setAttribute(
      "visible",
      Boolean(visible)
    );

  }
}


// Membuka atau menutup panel sentuh
function setDockOpen(open) {

  $("touchDock").classList.toggle(
    "collapsed",
    !open
  );

  $("toggleDock").textContent =
    open ? "−" : "+";
}


// Menghapus tombol panel sebelumnya
function clearButtons() {

  $("touchActions").replaceChildren();

}


// Membuat tombol panel HTML
function addButton(
  text,
  callback,
  primary = false,
  selected = false
) {

  const button =
    document.createElement("button");

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


// Menampilkan penjelasan pada panel
function describe(text) {

  $("dockDescription").textContent = text;

}


// ========================================
// 4. MULAI APLIKASI
// ========================================

function startExperience() {

  // Logo harus terdeteksi
  if (!state.markerFound) {
    return;
  }

  // Tidak boleh mulai dua kali
  if (state.started) {
    return;
  }

  if (state.screen !== "welcome") {
    return;
  }

  state.started = true;

  state.screen = "menu";

  setDockOpen(false);

  render();

  $("markerStatus").textContent =
    "Pilih menu IMIP QUIZ";

  syncStartBackup();
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

  // Saat Belajar K3, panel sentuh ditutup
  // supaya papan APD terlihat penuh.
  //
  // Panel bisa dibuka dengan tombol +.

  setDockOpen(
    !(screen === "learn" && category === "k3")
  );

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
// 7. MEMILIH JAWABAN SOAL
// ========================================

function chooseAnswer(index) {

  if (state.screen !== "quiz") {
    return;
  }

  if (state.selectedAnswer !== null) {
    return;
  }

  const question =
    modules[state.category]
      .questions[state.questionIndex];

  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= question.options.length
  ) {
    return;
  }

  state.selectedAnswer = index;

  if (index === question.correct) {
    state.score++;
  }

  render();
}


// ========================================
// 8. LANGKAH BERIKUTNYA
// ========================================

function nextStep() {

  const module = modules[state.category];

  if (!module) {
    return;
  }

  // --------------------------------------
  // GALERI 8 OBJEK APD K3
  // --------------------------------------

  if (
    state.screen === "learn" &&
    state.category === "k3"
  ) {

    const count =
      (window.IMIP_K3_ITEMS || []).length;

    if (!count) {
      return;
    }

    // Objek berikutnya
    if (state.lessonIndex < count - 1) {

      state.lessonIndex++;

      render();

    } else {

      // Setelah objek terakhir,
      // langsung masuk latihan K3.
      openModule("quiz", "k3");

    }

    return;
  }

  // --------------------------------------
  // BELAJAR PERATURAN PERUSAHAAN
  // --------------------------------------

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

  // --------------------------------------
  // LATIHAN SOAL
  // --------------------------------------

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

  // --------------------------------------
  // HASIL LATIHAN
  // --------------------------------------

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

  if (action === "start") {

    startExperience();

    return;
  }

  if (!state.started) {
    return;
  }

  const menuActions = {

    "learn-pp": ["learn", "pp"],

    "learn-k3": ["learn", "k3"],

    "quiz-pp": ["quiz", "pp"],

    "quiz-k3": ["quiz", "k3"]

  };

  // --------------------------------------
  // EMPAT MENU UTAMA
  // --------------------------------------

  if (menuActions[action]) {

    if (state.screen === "menu") {

      openModule(
        ...menuActions[action]
      );

    }

    return;
  }

  // --------------------------------------
  // KEMBALI MENU
  // --------------------------------------

  if (action === "home") {

    goHome();

    return;
  }

  // --------------------------------------
  // OBJEK APD SEBELUMNYA
  // --------------------------------------

  if (action === "k3-prev") {

    if (
      state.screen === "learn" &&
      state.category === "k3" &&
      state.lessonIndex > 0
    ) {

      state.lessonIndex--;

      render();

    }

    return;
  }

  // --------------------------------------
  // TOMBOL LANJUT
  // --------------------------------------

  if (action === "next") {

    nextStep();

    return;
  }

  // --------------------------------------
  // PILIHAN JAWABAN A, B, C
  // --------------------------------------

  if (action.startsWith("answer-")) {

    chooseAnswer(
      Number(action.slice(7))
    );

  }
}


// ========================================
// 10. TAMPILKAN EMPAT MENU
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
// 11. BELAJAR PP
// ========================================

function renderLearn() {

  const module = modules[state.category];

  const lesson =
    module.lessons[state.lessonIndex];

  const last =
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
    last ? "MULAI SOAL" : "LANJUT"
  );

  describe(
    `${lesson.title}\n\n` +
    `${lesson.body}\n\n` +
    `Materi ${state.lessonIndex + 1} ` +
    `dari ${module.lessons.length}`
  );

  addButton(
    "Kembali ke Menu",
    goHome
  );

  addButton(
    last
      ? "Mulai Latihan Soal"
      : "Materi Berikutnya",
    nextStep,
    true
  );

}


// ========================================
// 12. BELAJAR K3 DENGAN OBJEK APD 3D
// ========================================

function renderK3Learn() {

  const items = window.IMIP_K3_ITEMS || [];

  const item =
    items[state.lessonIndex];

  if (!item) {

    $("dockTitle").textContent =
      "Belajar K3";

    describe(
      "Data APD belum dimuat. " +
      "Periksa file k3-learn-3d.js."
    );

    return;
  }

  const last =
    state.lessonIndex === items.length - 1;

  $("dockTitle").textContent =
    `${item.name} ` +
    `(${state.lessonIndex + 1}/${items.length})`;

  // --------------------------------------
  // TULISAN DI PAPAN AR K3
  // --------------------------------------

  setText(
    "k3Counter",
    `OBJEK ${state.lessonIndex + 1} / ${items.length}`
  );

  setText(
    "k3ItemTitle",
    item.name
  );

  setText(
    "k3ItemDescription",
    item.description
  );

  setText(
    "k3ItemCheck",
    `PERIKSA: ${item.check}`
  );

  setText(
    "k3NextLabel",
    last ? "MULAI SOAL" : "LANJUT"
  );

  // Tombol SEBELUMNYA hanya muncul
  // setelah objek pertama.
  setVisible(
    "k3PrevGroup",
    state.lessonIndex > 0
  );

  // --------------------------------------
  // PERGANTIAN OBJEK 3D
  // --------------------------------------

  const model = $("k3Model3d");

  if (model) {

    model.setAttribute(
      "k3-apd-model",
      "type",
      item.type
    );

  }

  // --------------------------------------
  // PANEL SENTUH HTML
  // --------------------------------------

  describe(
    `${item.name}\n\n` +
    `${item.description}\n\n` +
    `${item.check}`
  );

  addButton(
    "Kembali ke Menu",
    goHome
  );

  if (state.lessonIndex > 0) {

    addButton(
      "Objek Sebelumnya",
      () => {

        state.lessonIndex--;

        render();

      }
    );

  }

  addButton(
    last
      ? "Mulai Latihan K3"
      : "Objek Berikutnya",
    nextStep,
    true
  );

}


// ========================================
// 13. TAMPILKAN LATIHAN SOAL
// ========================================

function renderQuiz() {

  const module = modules[state.category];

  const question =
    module.questions[state.questionIndex];

  const answered =
    state.selectedAnswer !== null;

  const last =
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
    last ? "LIHAT HASIL" : "LANJUT"
  );

  setVisible(
    "nextGroup",
    answered
  );

  describe(
    `Soal ${state.questionIndex + 1} ` +
    `dari ${module.questions.length}\n\n` +
    question.question +
    (
      answered
        ? "\n\nJawaban dicatat."
        : ""
    )
  );

  question.options.forEach(
    (option, index) => {

      setText(
        `optionText${index}`,
        `${"ABC"[index]}. ${option}`
      );

      const plane = $(`option${index}`);

      plane.setAttribute(
        "color",
        state.selectedAnswer === index
          ? "#FFD28B"
          : "#EBF8DC"
      );

      const button = addButton(
        `${"ABC"[index]}. ${option}`,
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
      last
        ? "Lihat Hasil Latihan"
        : "Soal Berikutnya",
      nextStep,
      true
    );

  }

}


// ========================================
// 14. TAMPILKAN HASIL NILAI
// ========================================

function renderResult() {

  const module = modules[state.category];

  const total = module.questions.length;

  const correct = state.score;

  const score = Math.round(
    (correct / total) * 100
  );

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
    `Salah: ${total - correct}`
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
// 15. RENDER UTAMA
// ========================================

function render() {

  const welcome =
    state.screen === "welcome";

  const menu =
    state.screen === "menu";

  const quiz =
    state.screen === "quiz";

  const k3Learn =
    state.screen === "learn" &&
    state.category === "k3";

  // Welcome
  setVisible(
    "welcome3d",
    welcome
  );

  // Empat menu
  setVisible(
    "menu3d",
    menu
  );

  // Galeri APD K3
  setVisible(
    "k3Learn3d",
    k3Learn
  );

  // Materi PP, soal dan nilai
  setVisible(
    "content3d",
    !welcome && !menu && !k3Learn
  );

  // Jawaban A, B, C
  setVisible(
    "worldChoices",
    quiz
  );

  // Tombol LANJUT
  setVisible(
    "nextGroup",
    !welcome && !menu && !quiz
  );

  $("touchDock").hidden = welcome;

  syncStartBackup();

  clearButtons();

  if (menu) {

    renderMenu();

  } else if (k3Learn) {

    renderK3Learn();

  } else if (state.screen === "learn") {

    renderLearn();

  } else if (quiz) {

    renderQuiz();

  } else if (state.screen === "result") {

    renderResult();

  }
}


// ========================================
// 16. TOMBOL MULAI CADANGAN
// ========================================

function syncStartBackup() {

  const button = $("startBackup");

  if (!button) {
    return;
  }

  button.hidden = !(
    state.markerFound &&
    state.screen === "welcome"
  );
}


// ========================================
// 17. SENTUHAN CADANGAN PADA KANVAS AR
// ========================================

function installPointerFallback(scene) {

  function attach() {

    const canvas = scene.canvas;

    if (!canvas) {
      return;
    }

    if (canvas.dataset.imipTouchReady) {
      return;
    }

    canvas.dataset.imipTouchReady = "1";

    canvas.addEventListener(
      "pointerup",
      (event) => {

        if (
          !state.markerFound ||
          state.screen !== "welcome"
        ) {
          return;
        }

        const hit = $("start3dHit");

        const camera = scene.camera;

        if (
          !hit ||
          !hit.object3D ||
          !camera
        ) {
          return;
        }

        const width =
          Number(hit.getAttribute("width")) ||
          0.92;

        const height =
          Number(hit.getAttribute("height")) ||
          0.34;

        const rect =
          canvas.getBoundingClientRect();

        if (
          !rect.width ||
          !rect.height
        ) {
          return;
        }

        hit.object3D.updateWorldMatrix(
          true,
          false
        );

        camera.updateMatrixWorld(true);

        const vertices = [
          [-width / 2, -height / 2],
          [width / 2, -height / 2],
          [-width / 2, height / 2],
          [width / 2, height / 2]
        ];

        const THREE = AFRAME.THREE;

        const points = vertices.map(
          ([x, y]) => {

            const point =
              new THREE.Vector3(
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

        const valid = points.every(
          (point) =>
            Number.isFinite(point.x) &&
            Number.isFinite(point.y)
        );

        if (!valid) {
          return;
        }

        const padding = 20;

        const minX =
          Math.min(
            ...points.map(p => p.x)
          ) - padding;

        const maxX =
          Math.max(
            ...points.map(p => p.x)
          ) + padding;

        const minY =
          Math.min(
            ...points.map(p => p.y)
          ) - padding;

        const maxY =
          Math.max(
            ...points.map(p => p.y)
          ) + padding;

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


// ========================================
// 18. INISIALISASI MINDAR
// ========================================

function initialize() {

  const scene = $("arScene");

  const target = $("imipTarget");

  const status = $("markerStatus");

  // Kamera siap
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

  // Error kamera
  scene.addEventListener(
    "arError",
    () => {

      status.textContent =
        "Gagal membuka kamera / target";

      status.classList.remove("found");

      status.classList.add("error");

    }
  );

  // Logo IMIP ditemukan
  target.addEventListener(
    "targetFound",
    () => {

      state.markerFound = true;

      status.classList.add("found");

      status.textContent =
        state.started
          ? "Logo IMIP terdeteksi"
          : "Sentuh tombol MULAI";

      syncStartBackup();

    }
  );

  // Logo IMIP hilang
  target.addEventListener(
    "targetLost",
    () => {

      state.markerFound = false;

      status.classList.remove("found");

      status.textContent =
        "Arahkan ke logo IMIP";

      syncStartBackup();

    }
  );

  // Tombol MULAI cadangan
  const backup = $("startBackup");

  if (backup) {

    backup.addEventListener(
      "click",
      startExperience
    );

  }

  // Sentuhan cadangan pada kanvas AR
  installPointerFallback(scene);

  // Sentuhan tombol 3D
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

  // Panel sentuh
  $("toggleDock").addEventListener(
    "click",
    () => {

      if (state.started) {

        const collapsed =
          $("touchDock")
            .classList.contains("collapsed");

        setDockOpen(collapsed);

      }
    }
  );

  render();

}


// ========================================
// 19. JALANKAN APLIKASI
// ========================================

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initialize
  );

} else {

  initialize();

}
