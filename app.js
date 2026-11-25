
'use strict';

// ==========================================
// SOP-AR INTERACTIVE V4
// BELAJAR + SOAL + PRAKTIK IOT DI KAMERA HP
// ==========================================

const MQTT_URL = 'wss://broker.emqx.io:8084/mqtt';

const DEFAULT_TOPIC =
  'sopar/demo/k3-58321/telemetry';

const TIMEOUT_DATA = 9000;

const $ = (id) => document.getElementById(id);

// ==========================================
// DATA MATERI SOP K3
// ==========================================

const lessons = [
  {
    title: 'Pengenalan APD',
    tag: 'MATERI 01 • APD',

    text:
      'APD dipilih sesuai risiko dan aturan area kerja. Kenali fungsi serta cara pemeriksaannya sebelum digunakan.',

    points: [
      'Kenali APD yang diwajibkan di area latihan.',
      'Periksa kondisi APD sebelum dipakai.',
      'Ikuti penjelasan dan arahan petugas K3.'
    ],

    ar:
      'APD wajib disesuaikan dengan bahaya pekerjaan dan persyaratan area.'
  },

  {
    title: 'Rambu Keselamatan',
    tag: 'MATERI 02 • RAMBU',

    text:
      'Rambu memberi petunjuk kewajiban, larangan, atau peringatan. Pahami maknanya sebelum memasuki area.',

    points: [
      'Amati jenis dan warna rambu.',
      'Jangan mengabaikan simbol bahaya.',
      'Bila belum paham, tanyakan kepada petugas berwenang.'
    ],

    ar:
      'Kenali rambu wajib, larangan, dan peringatan di lokasi.'
  },

  {
    title: 'Respons Alarm K3',
    tag: 'MATERI 03 • ALARM',

    text:
      'Ketika alarm aktif, peserta harus mengenali peringatan dan merespons sesuai prosedur lokasi. Dalam latihan ini alarm dibuat lewat Wokwi.',

    points: [
      'Kenali tanda alarm.',
      'Ikuti arahan dan prosedur tanggap darurat setempat.',
      'Jangan mereset alarm nyata tanpa kewenangan.'
    ],

    ar:
      'Alarm aktif = ikuti arahan keselamatan dan prosedur yang berlaku.'
  }
];

// ==========================================
// DATA SOAL DAN PRAKTIK SOP K3
// ==========================================

const stages = [
  {
    type: 'quiz',
    title: 'Soal APD',
    tag: 'SOAL 01 • APD',

    question:
      'Sebelum masuk area yang mewajibkan helm, apa yang perlu dilakukan?',

    ar:
      'Area wajib helm. Apa tindakan yang benar?',

    options: [
      'Masuk sebentar tanpa helm.',
      'Memakai helm yang sesuai dan memeriksa kondisinya.',
      'Memakai helm apa pun tanpa pemeriksaan.'
    ],

    short: [
      'Masuk tanpa helm',
      'Pakai & periksa helm',
      'Helm apa pun'
    ],

    correct: 1
  },

  {
    type: 'quiz',
    title: 'Soal Rambu',
    tag: 'SOAL 02 • RAMBU',

    question:
      'Apa yang harus dilakukan saat melihat rambu bahaya yang belum dipahami?',

    ar:
      'Ada rambu bahaya yang belum dipahami.',

    options: [
      'Mengabaikannya.',
      'Langsung melewati area.',
      'Memahami artinya dan meminta arahan petugas.'
    ],

    short: [
      'Abaikan',
      'Langsung masuk',
      'Tanya petugas'
    ],

    correct: 2
  },

  {
    type: 'alarm',
    title: 'Praktik Alarm Wokwi',
    tag: 'PRAKTIK 03 • IOT',

    question:
      'Pastikan Wokwi dan MQTT terhubung. Saat status NORMAL diterima, tekan ALARM pada rangkaian virtual.',

    ar:
      'Tunggu NORMAL, lalu tekan tombol ALARM di Wokwi.'
  },

  {
    type: 'quiz',
    title: 'Respons Alarm',
    tag: 'SOAL 04 • K3',

    question:
      'Alarm latihan sudah aktif. Apa respons awal yang benar?',

    ar:
      'Alarm K3 aktif. Apa respons yang tepat?',

    options: [
      'Mengabaikan alarm.',
      'Mengikuti prosedur darurat dan arahan petugas.',
      'Mereset alarm nyata tanpa izin.'
    ],

    short: [
      'Abaikan alarm',
      'Ikuti prosedur',
      'Reset tanpa izin'
    ],

    correct: 1
  }
];

// ==========================================
// STATE APLIKASI
// ==========================================

const state = {
  mode: 'learn',

  lesson: 0,
  stage: 0,

  wrong: 0,
  mistakes: [],

  markerVisible: false,

  feedback: '',
  feedbackType: 'ok',

  mqttClient: null,
  connected: false,

  topic: DEFAULT_TOPIC,

  telemetry: null,
  receivedAt: 0,

  alarmArmed: false,

  finishedAt: null
};

// ==========================================
// HELPER
// ==========================================

function setText(id, value) {
  const el = $(id);

  if (el) {
    el.textContent = String(value);
  }
}

function setAR(id, key, value) {
  const el = $(id);

  if (el) {
    el.setAttribute(key, value);
  }
}

function isFresh() {
  return (
    state.connected &&
    state.receivedAt > 0 &&
    Date.now() - state.receivedAt < TIMEOUT_DATA
  );
}

function current() {
  return stages[state.stage];
}

function finalScore() {
  return Math.max(
    0,
    100 - 20 * state.wrong
  );
}

// ==========================================
// FEEDBACK JAWABAN
// ==========================================

function showFeedback(message = '', type = 'ok') {
  state.feedback = message;
  state.feedbackType = type;

  const box = $('dockFeedback');

  box.textContent = message;

  box.className = message
    ? `feedback show ${type}`
    : 'feedback';
}

// ==========================================
// NOTIFIKASI
// ==========================================

function toast(message) {
  const el = $('toast');

  el.textContent = message;
  el.hidden = false;

  clearTimeout(toast.timer);

  toast.timer = setTimeout(() => {
    el.hidden = true;
  }, 2800);
}

// ==========================================
// PAPAN PEMBELAJARAN 3D AR
// ==========================================

function board(
  mode,
  title,
  content,
  hint,
  choices = null,
  next = ''
) {
  setAR('arMode', 'value', mode);

  setAR('arBoardTitle', 'value', title);

  setAR('arBoardBody', 'value', content);

  setAR('arBoardHint', 'value', hint);

  $('arOptions').setAttribute(
    'visible',
    !!choices
  );

  for (let i = 0; i < 3; i++) {
    setAR(
      `arOptionText${i}`,
      'value',
      choices
        ? `${'ABC'[i]}. ${choices[i]}`
        : ''
    );
  }

  $('arContinueGroup').setAttribute(
    'visible',
    !!next
  );

  setAR(
    'arContinueText',
    'value',
    next
  );
}

// ==========================================
// INSTRUKSI PRAKTIK ALARM WOKWI
// ==========================================

function renderAlarmHelp() {
  const el = $('dockCallout');

  if (
    state.mode !== 'practice' ||
    current()?.type !== 'alarm'
  ) {
    el.hidden = true;
    return;
  }

  el.hidden = false;

  if (!isFresh()) {
    el.textContent =
      'Menunggu data MQTT terbaru. Jalankan Wokwi dan cek topic telemetri.';

  } else if (
    state.telemetry.alarm ||
    state.telemetry.alarm_manual
  ) {
    el.textContent =
      'Alarm sudah aktif. Tekan RESET di Wokwi. Pastikan suhu juga normal, lalu tunggu status NORMAL masuk.';

  } else if (state.alarmArmed) {
    el.textContent =
      'SIAP: status NORMAL telah diterima. Sekarang tekan tombol ALARM merah di Wokwi.';

  } else {
    el.textContent =
      'Menunggu pesan NORMAL baru sebelum praktik bisa dimulai.';
  }
}

// ==========================================
// MENAMPILKAN HALAMAN PEMBELAJARAN
// DAN PRAKTIK DI ATAS KAMERA HP
// ==========================================

function render() {
  const learning = state.mode === 'learn';

  $('tabLearn').classList.toggle(
    'selected',
    learning
  );

  $('tabQuiz').classList.toggle(
    'selected',
    !learning
  );

  $('tabLearn').setAttribute(
    'aria-selected',
    String(learning)
  );

  $('tabQuiz').setAttribute(
    'aria-selected',
    String(!learning)
  );

  const bullets = $('dockBullets');
  const answers = $('dockAnswers');

  bullets.replaceChildren();
  answers.replaceChildren();

  $('dockCallout').hidden = true;
  $('resultActions').hidden = true;

  $('mainButton').hidden = false;
  $('backButton').hidden = false;

  answers.hidden = true;

  // ======================================
  // MODE BELAJAR AR
  // ======================================

  if (learning) {
    const item = lessons[state.lesson];

    setText('dockStep', item.tag);

    setText('dockTitle', item.title);

    setText('dockQuestion', item.text);

    item.points.forEach((point) => {
      const row = document.createElement('div');

      row.textContent = point;

      bullets.append(row);
    });

    const pct = Math.round(
      (state.lesson + 1) /
      lessons.length * 100
    );

    setProgress(
      `Materi ${state.lesson + 1} dari ${lessons.length}`,
      pct
    );

    $('backButton').hidden =
      state.lesson === 0;

    $('mainButton').textContent =
      state.lesson === lessons.length - 1
        ? 'Mulai praktik di AR →'
        : 'Materi berikutnya →';

    board(
      item.tag,
      item.title,
      item.ar,
      'Baca materi, lalu lanjut.',
      null,
      state.lesson === lessons.length - 1
        ? 'MULAI PRAKTIK'
        : 'LANJUT MATERI'
    );
  }

  // ======================================
  // MODE HASIL EVALUASI
  // ======================================

  else if (state.stage >= stages.length) {
    setText(
      'dockStep',
      'HASIL LATIHAN'
    );

    setText(
      'dockTitle',
      `Nilai ${finalScore()}/100`
    );

    setText(
      'dockQuestion',
      `Latihan selesai. Jumlah percobaan jawaban salah: ${state.wrong}. Nilai ini hanya simulasi.`
    );

    setProgress(
      'Evaluasi selesai',
      100
    );

    $('mainButton').textContent =
      'Ulangi praktik';

    $('backButton').textContent =
      'Kembali belajar';

    $('resultActions').hidden = false;

    board(
      'HASIL EVALUASI',
      `NILAI ${finalScore()}/100`,
      `Kesalahan: ${state.wrong}. Silakan ulangi latihan untuk memperkuat pemahaman.`,
      'Bukan hasil sertifikasi resmi.',
      null,
      'ULANGI'
    );
  }

  // ======================================
  // MODE PRAKTIK AR
  // ======================================

  else {
    const stage = current();

    setText(
      'dockStep',
      stage.tag
    );

    setText(
      'dockTitle',
      stage.title
    );

    setText(
      'dockQuestion',
      stage.question
    );

    setProgress(
      `Tahap ${state.stage + 1} dari ${stages.length}`,
      Math.round(
        (state.stage + 1) /
        stages.length * 100
      )
    );

    $('backButton').textContent =
      'Kembali belajar';

    $('mainButton').hidden = true;

    // SOAL PILIHAN GANDA
    if (stage.type === 'quiz') {
      answers.hidden = false;

      stage.options.forEach((label, i) => {
        const btn =
          document.createElement('button');

        btn.type = 'button';
        btn.className = 'answer';

        const strong =
          document.createElement('strong');

        strong.textContent = 'ABC'[i];

        btn.append(
          strong,
          document.createTextNode(` ${label}`)
        );

        // Jawaban dapat disentuh langsung di HP
        // walaupun marker hilang sesaat.
        btn.addEventListener(
          'click',
          () => choose(i)
        );

        answers.append(btn);
      });

      board(
        stage.tag,
        stage.title,
        stage.ar,
        'Sentuh A/B/C di papan AR atau panel pada kamera.',
        stage.short
      );
    }

    // PRAKTIK IOT WOKWI
    else {
      board(
        'PRAKTIK IOT',
        stage.title,
        stage.ar,
        'Status MQTT menentukan kelanjutan latihan.'
      );

      renderAlarmHelp();
    }
  }

  showFeedback(
    state.feedback,
    state.feedbackType
  );
}

// ==========================================
// PROGRES PEMBELAJARAN
// ==========================================

function setProgress(label, percent) {
  setText(
    'progressCaption',
    label
  );

  setText(
    'progressPct',
    `${percent}%`
  );

  $('progressFill').style.width =
    `${percent}%`;
}

// ==========================================
// PERPINDAHAN MODE
// ==========================================

function switchMode(mode) {
  state.mode = mode;

  if (mode === 'practice') {
    state.stage = 0;

    state.wrong = 0;
    state.mistakes = [];

    state.finishedAt = null;
    state.alarmArmed = false;
  }

  showFeedback();
  render();

  // Membuka panel supaya jawaban bisa
  // langsung disentuh pada layar HP.
  document
    .querySelector('.ar-dock')
    ?.classList.remove('compact');

  setText(
    'minimizeDock',
    '−'
  );
}

// ==========================================
// LANJUT MATERI PEMBELAJARAN
// ==========================================

function nextLesson() {
  if (state.mode !== 'learn') {
    if (state.stage >= stages.length) {
      switchMode('practice');
    }

    return;
  }

  if (state.lesson < lessons.length - 1) {
    state.lesson++;

    showFeedback();
    render();

  } else {
    switchMode('practice');
  }
}

// ==========================================
// MEMERIKSA JAWABAN SOAL
// ==========================================

function choose(index) {
  if (
    state.mode !== 'practice' ||
    state.stage >= stages.length
  ) {
    return;
  }

  const stage = current();

  if (stage.type !== 'quiz') {
    return;
  }

  // JAWABAN SALAH
  if (index !== stage.correct) {
    state.wrong++;

    state.mistakes.push({
      tahap: stage.title,
      jawabanDipilih: 'ABC'[index]
    });

    showFeedback(
      'Jawaban belum tepat. Coba lagi berdasarkan materi yang dipelajari.',
      'error'
    );

    return;
  }

  // JAWABAN BENAR
  state.stage++;

  if (current()?.type === 'alarm') {
    state.alarmArmed = false;
  }

  if (state.stage === stages.length) {
    state.finishedAt =
      new Date().toISOString();
  }

  showFeedback(
    'Jawaban diterima. Lanjut ke tahapan berikutnya.',
    'ok'
  );

  render();
}

// ==========================================
// MEMBACA PESAN JSON DARI MQTT
// ==========================================

function readPacket(value) {
  try {
    const v = JSON.parse(value);

    if (
      typeof v.alarm !== 'boolean' ||
      typeof v.alarm_manual !== 'boolean'
    ) {
      return null;
    }

    return {
      alarm: v.alarm,

      alarm_manual: v.alarm_manual,

      temperature: Number(v.temperature),

      sensor_ok: v.sensor_ok === true,

      event:
        typeof v.event === 'string'
          ? v.event
          : ''
    };

  } catch (_) {
    return null;
  }
}

// ==========================================
// MENDETEKSI PERUBAHAN ALARM IOT
// ==========================================

function receivePacket(data) {
  const previous = state.telemetry;
  const previousFresh = isFresh();

  state.telemetry = data;
  state.receivedAt = Date.now();

  if (
    state.mode === 'practice' &&
    current()?.type === 'alarm'
  ) {

    // Harus ada pesan NORMAL terlebih dahulu
    if (
      !data.alarm &&
      !data.alarm_manual
    ) {
      state.alarmArmed = true;
    }

    // Setelah NORMAL, deteksi alarm BARU
    else if (
      state.alarmArmed &&
      previousFresh &&
      previous &&

      !previous.alarm &&
      !previous.alarm_manual &&

      data.alarm &&
      data.alarm_manual &&

      (
        data.event === 'tombol_alarm' ||
        data.event === ''
      )
    ) {
      state.alarmArmed = false;

      state.stage++;

      showFeedback(
        'Alarm baru dari Wokwi terdeteksi. Sekarang jawab soal respons K3.',
        'ok'
      );

      render();
    }
  }

  renderTelemetry();
}

// ==========================================
// STATUS SENSOR PADA LAYAR HP
// ==========================================

function renderTelemetry() {
  const fresh = isFresh();

  $('mqttPill').classList.toggle(
    'good',
    state.connected
  );

  $('mqttPill').classList.toggle(
    'bad',
    !state.connected
  );

  setText(
    'mqttText',
    state.connected
      ? 'MQTT terhubung'
      : 'MQTT terputus'
  );

  setText(
    'sensorConnection',
    fresh
      ? 'IoT: data terbaru'
      : 'IoT: menunggu data'
  );

  setText(
    'temp',
    fresh &&
    state.telemetry.sensor_ok &&
    Number.isFinite(state.telemetry.temperature)
      ? `${state.telemetry.temperature.toFixed(1)}°C`
      : '--°C'
  );

  setText(
    'alarm',
    fresh
      ? (
          state.telemetry.alarm
            ? 'AKTIF'
            : 'Normal'
        )
      : '--'
  );

  // ======================================
  // LAMPU VIRTUAL PADA AR
  // ======================================

  const active =
    fresh &&
    state.telemetry.alarm;

  setAR(
    'alarmBeacon',
    'color',
    active ? '#e54f48' : '#69b77c'
  );

  setAR(
    'alarmBeacon',
    'material',
    `emissive: ${
      active ? '#e54f48' : '#1e7443'
    }; emissiveIntensity: ${
      active ? 0.8 : 0.3
    }`
  );

  setAR(
    'panelIndicator',
    'color',
    active ? '#e54f48' : '#69b77c'
  );

  const beacon = $('alarmBeacon');

  if (active) {
    beacon.setAttribute(
      'animation__pulse',
      'property: scale; from: 1 0.72 1; to: 1.18 0.85 1.18; dir: alternate; loop: true; dur: 500'
    );

  } else {
    beacon.removeAttribute(
      'animation__pulse'
    );

    beacon.setAttribute(
      'scale',
      '1 0.72 1'
    );
  }

  renderAlarmHelp();
}

// ==========================================
// SUBSCRIBE TOPIC MQTT
// ==========================================

function subscribe(topic) {
  state.mqttClient?.subscribe(
    topic,
    { qos: 0 },

    (error) => {
      if (error) {
        showFeedback(
          'Gagal subscribe MQTT. Periksa topic.',
          'error'
        );
      }
    }
  );
}

// ==========================================
// KONEKSI MQTT WOKWI
// ==========================================

function connectMQTT() {
  if (!window.mqtt) {
    setText(
      'mqttText',
      'Library MQTT gagal dimuat'
    );

    return;
  }

  const id =
    `sopar-hp-${Math.random().toString(16).slice(2, 10)}`;

  try {
    const client = mqtt.connect(
      MQTT_URL,
      {
        clientId: id,

        clean: true,

        connectTimeout: 10000,

        reconnectPeriod: 3000,

        keepalive: 30
      }
    );

    state.mqttClient = client;

    // MQTT CONNECTED
    client.on(
      'connect',
      () => {
        state.connected = true;

        subscribe(state.topic);
        renderTelemetry();
      }
    );

    // MENERIMA DATA DARI WOKWI
    client.on(
      'message',
      (topic, payload) => {
        if (topic !== state.topic) {
          return;
        }

        const packet = readPacket(
          payload.toString()
        );

        if (packet) {
          receivePacket(packet);
        }
      }
    );

    // MQTT DISCONNECTED
    [
      'offline',
      'close',
      'reconnect'
    ].forEach((name) => {
      client.on(name, () => {
        state.connected = false;
        state.alarmArmed = false;

        renderTelemetry();
      });
    });

    // ERROR MQTT
    client.on(
      'error',
      (err) => {
        console.warn(
          'MQTT:',
          err.message
        );

        renderTelemetry();
      }
    );

  } catch (err) {
    setText(
      'mqttText',
      'Gagal membuat koneksi MQTT'
    );

    console.error(err);
  }
}

// ==========================================
// PENGATURAN TOPIC MQTT
// ==========================================

function applyTopic() {
  const topic =
    $('topicInput').value.trim();

  if (
    !topic ||
    topic.length > 170 ||
    /[+#\s]/.test(topic)
  ) {
    setText(
      'settingsError',
      'Topic tidak boleh kosong, mengandung spasi, + atau #.'
    );

    return;
  }

  if (topic !== state.topic) {
    const old = state.topic;

    state.topic = topic;
    state.telemetry = null;
    state.receivedAt = 0;
    state.alarmArmed = false;

    if (
      state.connected &&
      state.mqttClient
    ) {
      state.mqttClient.unsubscribe(
        old,
        () => subscribe(topic)
      );
    }

    renderTelemetry();

    toast(
      'Topic diubah. Tunggu data baru dari Wokwi.'
    );
  }

  setText(
    'settingsError',
    ''
  );

  $('settingsDialog').close();
}

// ==========================================
// DOWNLOAD HASIL LATIHAN
// ==========================================

function downloadResult() {
  if (
    state.mode !== 'practice' ||
    state.stage < stages.length
  ) {
    return;
  }

  const data = {
    aplikasi: 'SOP-AR V4',

    jenis:
      'Latihan SOP K3 — simulasi akademik',

    nilai: finalScore(),

    kesalahan: state.wrong,

    rincianKesalahan: state.mistakes,

    selesaiPada: state.finishedAt,

    catatan:
      'Bukan sertifikasi K3 atau penilaian resmi PT IRNC.'
  };

  const url = URL.createObjectURL(
    new Blob(
      [JSON.stringify(data, null, 2)],
      {
        type: 'application/json'
      }
    )
  );

  const a =
    document.createElement('a');

  a.href = url;

  a.download =
    'hasil-latihan-sop-ar.json';

  document.body.append(a);

  a.click();
  a.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

// ==========================================
// DETEKSI KAMERA AR
// Kamera ditangani oleh AR.js.
// Tidak memanggil getUserMedia kedua kali.
// ==========================================

function setupCameraDiagnostics() {
  const panel = $('cameraStatus');

  panel.hidden = true;

  // MENAMPILKAN ERROR SAJA
  const report = (title, detail) => {
    if (cameraReady()) {
      panel.hidden = true;
      return;
    }

    setText(
      'cameraStatusTitle',
      title
    );

    setText(
      'cameraStatusMessage',
      detail
    );

    panel.hidden = false;
  };

  const hide = () => {
    panel.hidden = true;
  };

  // MEMERIKSA KAMERA AKTIF
  function cameraReady() {
    return [
      ...document.querySelectorAll('video')
    ].some((video) =>
      video.srcObject
        ?.getVideoTracks?.()
        .some(
          (track) =>
            track.readyState === 'live'
        ) ||

      (
        video.readyState >= 2 &&
        video.videoWidth > 0
      )
    );
  }

  // EVENT KAMERA AKTIF
  window.addEventListener(
    'camera-init',
    hide
  );

  window.addEventListener(
    'arjs-video-loaded',
    hide
  );

  $('hiroMarker').addEventListener(
    'markerFound',
    hide
  );

  // EVENT KAMERA ERROR
  window.addEventListener(
    'camera-error',
    (event) => {
      const raw =
        event.detail?.error ||
        event.detail ||
        event.error ||
        {};

      const msg = String(
        raw.name ||
        raw.message ||
        ''
      );

      report(
        'Kamera tidak dapat diakses',

        /NotAllowed|PermissionDenied/i.test(msg)
          ? 'Izinkan kamera pada pengaturan situs, lalu muat ulang.'
          : 'Periksa izin kamera dan pastikan situs memakai HTTPS atau localhost.'
      );
    }
  );

  // TOMBOL MUAT ULANG
  $('retryCamera').addEventListener(
    'click',
    () => location.reload()
  );

  // TUTUP PESAN
  $('dismissCamera').addEventListener(
    'click',
    hide
  );

  // PERIKSA HTTPS
  if (
    !window.isSecureContext ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    report(
      'Akses kamera memerlukan HTTPS',
      'Gunakan GitHub Pages HTTPS atau localhost.'
    );
  }
}

// ==========================================
// INISIALISASI APLIKASI
// ==========================================

function initialize() {
  // DETEKSI KAMERA
  setupCameraDiagnostics();

  $('httpsHint').hidden =
    window.isSecureContext;

  // PENGATURAN TOPIC
  $('topicInput').value =
    state.topic;

  // ======================================
  // TAB BELAJAR
  // ======================================

  $('tabLearn').addEventListener(
    'click',
    () => switchMode('learn')
  );

  // ======================================
  // TAB PRAKTIK
  // ======================================

  $('tabQuiz').addEventListener(
    'click',
    () => switchMode('practice')
  );

  // ======================================
  // TOMBOL LANJUT
  // ======================================

  $('mainButton').addEventListener(
    'click',
    nextLesson
  );

  // ======================================
  // TOMBOL KEMBALI
  // ======================================

  $('backButton').addEventListener(
    'click',
    () => {
      if (
        state.mode === 'learn' &&
        state.lesson > 0
      ) {
        state.lesson--;

        showFeedback();
        render();

      } else {
        switchMode('learn');
      }
    }
  );

  // ======================================
  // PERKECIL / PERBESAR PANEL HP
  // ======================================

  $('minimizeDock').addEventListener(
    'click',
    () => {
      const dock =
        document.querySelector('.ar-dock');

      dock.classList.toggle(
        'compact'
      );

      setText(
        'minimizeDock',

        dock.classList.contains('compact')
          ? '+'
          : '−'
      );
    }
  );

  // ======================================
  // PENGATURAN MQTT
  // ======================================

  $('openSettings').addEventListener(
    'click',
    () => {
      $('settingsDialog').showModal();
    }
  );

  $('applyTopic').addEventListener(
    'click',
    applyTopic
  );

  // ======================================
  // DOWNLOAD HASIL
  // ======================================

  $('downloadButton').addEventListener(
    'click',
    downloadResult
  );

  // ======================================
  // MARKER HIRO TERDETEKSI
  // ======================================

  $('hiroMarker').addEventListener(
    'markerFound',
    () => {
      state.markerVisible = true;

      $('markerNotice')
        .classList.add('found');

      setText(
        'markerLabel',
        'Marker Hiro terdeteksi'
      );

      setText(
        'markerHelp',
        'Papan 3D siap. Ketuk di AR atau gunakan panel pada kamera.'
      );
    }
  );

  // ======================================
  // MARKER HIRO HILANG
  // ======================================

  $('hiroMarker').addEventListener(
    'markerLost',
    () => {
      state.markerVisible = false;

      $('markerNotice')
        .classList.remove('found');

      setText(
        'markerLabel',
        'Arahkan kamera ke marker Hiro'
      );

      setText(
        'markerHelp',
        'Jawaban di panel HP tetap dapat disentuh.'
      );
    }
  );

  // ======================================
  // PILIHAN JAWABAN PADA OBJEK AR
  // ======================================

  for (let i = 0; i < 3; i++) {
    $(`arOption${i}`).addEventListener(
      'click',
      () => choose(i)
    );
  }

  // ======================================
  // TOMBOL LANJUT PADA PAPAN AR
  // ======================================

  $('arContinueHit').addEventListener(
    'click',
    () => nextLesson()
  );

  // ======================================
  // PERIKSA DATA MQTT BERKALA
  // ======================================

  setInterval(
    () => {
      if (
        !isFresh() &&
        state.alarmArmed
      ) {
        state.alarmArmed = false;
      }

      renderTelemetry();
    },
    1500
  );

  // ======================================
  // JALANKAN APLIKASI
  // ======================================

  render();

  renderTelemetry();

  connectMQTT();
}

// ==========================================
// MULAI SETELAH HTML SIAP
// ==========================================

if (
  document.readyState === 'loading'
) {
  document.addEventListener(
    'DOMContentLoaded',
    initialize
  );

} else {
  initialize();
}