
'use strict';

// ==========================================
// SOP-AR V5
// MENU 3D + PEMBELAJARAN + SOAL + MQTT
// ==========================================

const MQTT_URL = 'wss://broker.emqx.io:8084/mqtt';
const DEFAULT_TOPIC = 'sopar/demo/k3-58321/telemetry';
const DATA_TIMEOUT = 9000;

const $ = (id) => document.getElementById(id);

// ==========================================
// MATERI DAN SOAL
// Contoh akademik, bukan peraturan resmi PT IRNC
// ==========================================

const modules = {
  pp: {
    name: 'Peraturan Perusahaan',

    lessons: [
      {
        title: 'Tata tertib',
        body:
          'Peraturan perusahaan mengatur tata tertib dan kewajiban kerja. Pelajari ketentuan yang berlaku pada perusahaan dan unit kerja.'
      },
      {
        title: 'Kehadiran dan izin',
        body:
          'Pahami ketentuan kehadiran, pemberitahuan ketidakhadiran, serta alur izin melalui saluran yang ditetapkan perusahaan.'
      },
      {
        title: 'Etika dan kerahasiaan',
        body:
          'Jaga sikap profesional, patuhi aturan kerja, dan lindungi dokumen serta informasi internal perusahaan.'
      }
    ],

    questions: [
      {
        question:
          'Jika berhalangan hadir, tindakan yang tepat adalah ...',
        choices: [
          'Tidak memberi kabar',
          'Melapor sesuai ketentuan perusahaan',
          'Meminta rekan mengisi absensi'
        ],
        correct: 1
      },
      {
        question:
          'Jika belum memahami aturan izin kerja, sebaiknya ...',
        choices: [
          'Menebak aturan',
          'Mengabaikan aturan',
          'Bertanya kepada pihak HRD/atasan yang berwenang'
        ],
        correct: 2
      },
      {
        question:
          'Dokumen internal perusahaan sebaiknya ...',
        choices: [
          'Dijaga sesuai aturan kerahasiaan',
          'Dibagikan ke semua orang',
          'Diunggah ke media sosial'
        ],
        correct: 0
      }
    ]
  },

  k3: {
    name: 'Keselamatan Kerja (K3)',

    lessons: [
      {
        title: 'Alat pelindung diri',
        body:
          'Pilih APD berdasarkan risiko pekerjaan dan persyaratan area. Periksa kondisinya sebelum digunakan.'
      },
      {
        title: 'Rambu K3',
        body:
          'Pahami rambu wajib, larangan, peringatan, serta petunjuk evakuasi yang berlaku di lingkungan kerja.'
      },
      {
        title: 'Respons alarm',
        body:
          'Kenali sinyal alarm. Saat kondisi darurat, ikuti prosedur lokasi serta arahan petugas yang berwenang.'
      }
    ],

    questions: [
      {
        question:
          'Sebelum masuk area wajib helm, tindakan tepat adalah ...',
        choices: [
          'Masuk tanpa helm',
          'Pakai dan periksa helm yang sesuai',
          'Pinjam helm apa saja'
        ],
        correct: 1
      },
      {
        question:
          'Ada rambu bahaya yang belum dipahami. Kamu sebaiknya ...',
        choices: [
          'Mengabaikannya',
          'Langsung masuk',
          'Mencari tahu arti dan mengikuti arahan'
        ],
        correct: 2
      },
      {
        question:
          'Saat alarm darurat aktif, tindakan awal yang tepat adalah ...',
        choices: [
          'Mengabaikan alarm',
          'Mengikuti prosedur dan arahan petugas',
          'Mereset alarm nyata tanpa kewenangan'
        ],
        correct: 1
      }
    ]
  }
};

// ==========================================
// STATUS APLIKASI
// ==========================================

const state = {
  view: 'menu',
  category: null,

  index: 0,
  answered: false,
  selection: null,

  correctCount: 0,
  mistakes: [],

  iotPassed: false,
  alarmArmed: false,

  markerVisible: false,

  mqttConnected: false,
  mqttClient: null,

  topic: DEFAULT_TOPIC,
  telemetry: null,
  telemetryAt: 0,

  result: null
};

// ==========================================
// HELPER
// ==========================================

function setText(id, value) {
  if ($(id)) {
    $(id).textContent = String(value);
  }
}

function setValue(id, value) {
  if ($(id)) {
    $(id).setAttribute('value', String(value));
  }
}

function visible(id, value) {
  if ($(id)) {
    $(id).setAttribute('visible', value);
  }
}

function dataFresh() {
  return (
    state.mqttConnected &&
    state.telemetry &&
    Date.now() - state.telemetryAt < DATA_TIMEOUT
  );
}

function toast(message) {
  const el = $('toast');

  el.textContent = message;
  el.hidden = false;

  clearTimeout(toast.timer);

  toast.timer = setTimeout(() => {
    el.hidden = true;
  }, 2600);
}

// ==========================================
// MEMBUKA EMPAT MENU UTAMA
// ==========================================

function resetSession(view, category) {
  state.view = view;
  state.category = category;

  state.index = 0;
  state.answered = false;
  state.selection = null;

  state.correctCount = 0;
  state.mistakes = [];

  state.iotPassed = false;
  state.alarmArmed = false;

  state.result = null;

  render();
}

function goMenu() {
  resetSession('menu', null);
}

function startLearn(category) {
  resetSession('learn', category);
}

function startQuiz(category) {
  resetSession('quiz', category);
}

// ==========================================
// MENJAWAB SOAL 3D
// ==========================================

function choose(index) {
  if (
    state.view !== 'quiz' ||
    state.answered
  ) {
    return;
  }

  const question =
    modules[state.category].questions[state.index];

  state.answered = true;
  state.selection = index;

  if (index === question.correct) {
    state.correctCount++;

    toast('Jawaban dicatat. Ketuk LANJUT.');
  } else {
    state.mistakes.push({
      nomor: state.index + 1,
      jawabanDipilih: 'ABC'[index]
    });

    toast(
      'Jawaban dicatat. Lanjut ke soal berikutnya.'
    );
  }

  render();
}

// ==========================================
// TOMBOL LANJUT
// ==========================================

function proceed() {
  const m = modules[state.category];

  if (!m) return;

  // LANJUT MATERI
  if (state.view === 'learn') {
    if (state.index < m.lessons.length - 1) {
      state.index++;
      render();
    } else {
      startQuiz(state.category);
    }

    return;
  }

  // LANJUT SOAL
  if (state.view === 'quiz') {
    if (!state.answered) {
      toast('Pilih jawaban A, B, atau C dahulu.');
      return;
    }

    if (state.index < m.questions.length - 1) {
      state.index++;

      state.answered = false;
      state.selection = null;

      render();
    } else if (state.category === 'k3') {
      // Modul K3 dilanjutkan praktik IoT
      state.view = 'iot';
      state.alarmArmed = false;

      render();
    } else {
      // Peraturan Perusahaan selesai
      finish();
    }

    return;
  }

  if (state.view === 'result') {
    startQuiz(state.category);
  }
}

// ==========================================
// HITUNG NILAI AKHIR
// ==========================================

function finish() {
  const total =
    modules[state.category].questions.length +
    (state.category === 'k3' ? 1 : 0);

  const earned =
    state.correctCount +
    (
      state.category === 'k3' && state.iotPassed
        ? 1
        : 0
    );

  state.result = {
    modul: modules[state.category].name,

    nilai: Math.round(earned / total * 100),

    jawabanBenar: state.correctCount,

    jumlahSoal:
      modules[state.category].questions.length,

    kesalahan: state.mistakes,

    praktikIoT:
      state.category === 'k3'
        ? state.iotPassed
        : null,

    waktu: new Date().toISOString(),

    catatan:
      'Simulasi akademik, bukan asesmen atau sertifikasi resmi PT IRNC.'
  };

  state.view = 'result';

  render();
}

// ==========================================
// TOMBOL SENTUH CADANGAN HP
// ==========================================

function addTouchAction(label, action) {
  const btn = document.createElement('button');

  btn.type = 'button';
  btn.className = 'answer';
  btn.textContent = label;

  btn.addEventListener('click', action);

  $('touchActions').append(btn);
}

// ==========================================
// RENDER MENU, MATERI DAN SOAL 3D
// ==========================================

function render() {
  const menu = state.view === 'menu';

  // Menampilkan salah satu papan
  visible('menuWorld', menu);
  visible('contentWorld', !menu);

  $('touchActions').replaceChildren();

  // ======================================
  // MENU UTAMA
  // ======================================

  if (menu) {
    setText('dockTitle', 'Menu SOP-AR');

    setText(
      'dockQuestion',
      'Pilih salah satu dari empat tombol 3D di marker.'
    );

    addTouchAction(
      'Belajar Peraturan Perusahaan',
      () => startLearn('pp')
    );

    addTouchAction(
      'Belajar K3',
      () => startLearn('k3')
    );

    addTouchAction(
      'Latihan Soal Peraturan Perusahaan',
      () => startQuiz('pp')
    );

    addTouchAction(
      'Latihan Soal K3',
      () => startQuiz('k3')
    );

    return;
  }

  const m = modules[state.category];

  visible(
    'worldOptions',
    state.view === 'quiz'
  );

  visible(
    'worldNextGroup',
    state.view !== 'iot'
  );

  setText('dockTitle', m.name);

  addTouchAction(
    'Kembali ke Menu Utama',
    goMenu
  );

  // ======================================
  // BELAJAR DALAM AR
  // ======================================

  if (state.view === 'learn') {
    const item = m.lessons[state.index];

    setValue(
      'worldMode',
      `BELAJAR • ${state.index + 1}/${m.lessons.length}`
    );

    setValue('worldTitle', item.title);
    setValue('worldBody', item.body);

    setValue(
      'worldHint',
      'Baca materi, lalu ketuk LANJUT.'
    );

    setValue(
      'worldNextText',
      state.index === m.lessons.length - 1
        ? 'MULAI SOAL'
        : 'LANJUT'
    );

    setText('dockQuestion', item.body);

    addTouchAction(
      state.index === m.lessons.length - 1
        ? 'Mulai Latihan Soal'
        : 'Materi Berikutnya',
      proceed
    );
  }

  // ======================================
  // LATIHAN SOAL DALAM AR
  // ======================================

  if (state.view === 'quiz') {
    const q = m.questions[state.index];

    setValue(
      'worldMode',
      `LATIHAN SOAL • ${state.index + 1}/${m.questions.length}`
    );

    setValue(
      'worldTitle',
      m.name
    );

    setValue(
      'worldBody',
      q.question
    );

    setValue(
      'worldHint',
      state.answered
        ? 'Jawaban tersimpan. Lanjut ke soal berikutnya.'
        : 'Pilih jawaban A, B, atau C.'
    );

    setValue('worldNextText', 'LANJUT');

    setText('dockQuestion', q.question);

    q.choices.forEach((choice, i) => {
      setValue(
        `optionText${i}`,
        `${'ABC'[i]}. ${choice}`
      );

      $('option' + i).setAttribute(
        'color',
        state.answered && state.selection === i
          ? '#e3b757'
          : '#dfeee0'
      );

      if (!state.answered) {
        addTouchAction(
          `${'ABC'[i]}. ${choice}`,
          () => choose(i)
        );
      }
    });

    if (state.answered) {
      addTouchAction('Lanjut', proceed);
    }
  }

  // ======================================
  // PRAKTIK IOT K3
  // ======================================

  if (state.view === 'iot') {
    setValue(
      'worldMode',
      'PRAKTIK IOT • K3'
    );

    setValue(
      'worldTitle',
      'Respons Alarm Wokwi'
    );

    setValue(
      'worldBody',
      'Setelah status NORMAL diterima, tekan tombol ALARM di Wokwi. Skenario dinilai dari perubahan alarm yang baru.'
    );

    let help = 'Menunggu data MQTT terbaru.';

    if (dataFresh()) {
      if (state.telemetry.alarm) {
        help =
          'Alarm masih aktif. Tekan RESET, lalu tunggu NORMAL.';
      } else if (state.alarmArmed) {
        help =
          'NORMAL terdeteksi. Tekan tombol ALARM sekarang.';
      } else {
        help = 'Menunggu status NORMAL baru.';
      }
    }

    setValue('worldHint', help);
    setText('dockQuestion', help);
  }

  // ======================================
  // HASIL EVALUASI DALAM AR
  // ======================================

  if (state.view === 'result') {
    setValue(
      'worldMode',
      'HASIL LATIHAN'
    );

    setValue(
      'worldTitle',
      `NILAI ${state.result.nilai}/100`
    );

    setValue(
      'worldBody',
      `Modul: ${m.name}. Benar: ${state.result.jawabanBenar}/${state.result.jumlahSoal}. Kesalahan: ${state.mistakes.length}.`
    );

    setValue(
      'worldHint',
      'Ini hasil simulasi latihan, bukan penilaian resmi perusahaan.'
    );

    setValue(
      'worldNextText',
      'ULANG LATIHAN'
    );

    setText(
      'dockQuestion',
      `Nilai akhir ${state.result.nilai}/100.`
    );

    addTouchAction(
      'Ulangi Latihan',
      () => startQuiz(state.category)
    );

    addTouchAction(
      'Unduh Hasil JSON',
      downloadResult
    );
  }
}

// ==========================================
// DOWNLOAD HASIL LATIHAN
// ==========================================

function downloadResult() {
  if (!state.result) return;

  const blob = new Blob(
    [JSON.stringify(state.result, null, 2)],
    {
      type: 'application/json'
    }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');

  link.href = url;

  link.download =
    `hasil-sop-ar-${state.category}.json`;

  document.body.append(link);

  link.click();
  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

// ==========================================
// MEMBACA JSON MQTT
// ==========================================

function readTelemetry(payload) {
  try {
    const obj = JSON.parse(payload);

    if (
      typeof obj.alarm !== 'boolean' ||
      typeof obj.alarm_manual !== 'boolean'
    ) {
      return null;
    }

    return {
      alarm: obj.alarm,

      alarm_manual: obj.alarm_manual,

      temperature: Number(obj.temperature),

      sensor_ok: obj.sensor_ok === true
    };

  } catch (_) {
    return null;
  }
}

// ==========================================
// MENERIMA DATA IOT
// ==========================================

function onTelemetry(packet) {
  const prev = state.telemetry;
  const wasFresh = dataFresh();

  state.telemetry = packet;
  state.telemetryAt = Date.now();

  // Praktik alarm harus mendeteksi
  // perubahan NORMAL -> ALARM baru.
  if (state.view === 'iot') {
    if (
      !packet.alarm &&
      !packet.alarm_manual
    ) {
      state.alarmArmed = true;

    } else if (
      state.alarmArmed &&
      wasFresh &&
      prev &&
      !prev.alarm &&
      !prev.alarm_manual &&
      packet.alarm &&
      packet.alarm_manual
    ) {
      state.iotPassed = true;
      state.alarmArmed = false;

      finish();
    }
  }

  showTelemetry();

  if (state.view === 'iot') {
    render();
  }
}

// ==========================================
// TAMPILAN STATUS MQTT DAN SENSOR
// ==========================================

function showTelemetry() {
  $('mqttPill').classList.toggle(
    'good',
    state.mqttConnected
  );

  $('mqttPill').classList.toggle(
    'bad',
    !state.mqttConnected
  );

  setText(
    'mqttText',
    state.mqttConnected
      ? 'MQTT terhubung'
      : 'MQTT terputus'
  );

  const fresh = dataFresh();

  setText(
    'sensorConnection',
    fresh
      ? 'IoT: data terbaru'
      : 'IoT: menunggu'
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

  $('alarmBeacon').setAttribute(
    'color',
    fresh && state.telemetry.alarm
      ? '#e54f48'
      : '#69b77c'
  );

  if (!fresh) {
    state.alarmArmed = false;
  }
}

// ==========================================
// KONEKSI MQTT
// ==========================================

function connectMQTT() {
  if (!window.mqtt) {
    setText(
      'mqttText',
      'MQTT.js gagal dimuat'
    );

    return;
  }

  const client = mqtt.connect(
    MQTT_URL,
    {
      clientId:
        `sopar-3d-${Math.random().toString(16).slice(2, 10)}`,

      clean: true,
      reconnectPeriod: 3000,
      connectTimeout: 10000
    }
  );

  state.mqttClient = client;

  client.on('connect', () => {
    state.mqttConnected = true;

    client.subscribe(
      state.topic,
      { qos: 0 }
    );

    showTelemetry();
  });

  client.on('message', (topic, payload) => {
    if (topic !== state.topic) return;

    const data = readTelemetry(
      payload.toString()
    );

    if (data) {
      onTelemetry(data);
    }
  });

  [
    'offline',
    'close',
    'reconnect'
  ].forEach((event) => {
    client.on(event, () => {
      state.mqttConnected = false;
      state.alarmArmed = false;

      showTelemetry();
    });
  });

  client.on('error', (err) => {
    console.warn('MQTT:', err.message);
  });
}

// ==========================================
// GANTI TOPIC MQTT
// ==========================================

function applyTopic() {
  const next = $('topicInput').value.trim();

  if (
    !next ||
    next.length > 170 ||
    /[+#\s]/.test(next)
  ) {
    setText(
      'settingsError',
      'Topic tidak boleh kosong, berisi spasi, + atau #.'
    );

    return;
  }

  if (next !== state.topic) {
    const previous = state.topic;

    state.topic = next;
    state.telemetry = null;
    state.telemetryAt = 0;
    state.alarmArmed = false;

    if (state.mqttConnected) {
      state.mqttClient.unsubscribe(
        previous,
        () => {
          state.mqttClient.subscribe(
            next,
            { qos: 0 }
          );
        }
      );
    }
  }

  setText('settingsError', '');

  $('settingsDialog').close();

  showTelemetry();
}

// ==========================================
// INISIALISASI APLIKASI
// ==========================================

function initialize() {

  // MARKER DITEMUKAN
  $('hiroMarker').addEventListener(
    'markerFound',
    () => {
      state.markerVisible = true;

      $('markerNotice').classList.add('found');

      setText(
        'markerLabel',
        'Marker Hiro terdeteksi'
      );

      setText(
        'markerHelp',
        'Sentuh salah satu tombol 3D pada marker.'
      );
    }
  );

  // MARKER HILANG
  $('hiroMarker').addEventListener(
    'markerLost',
    () => {
      state.markerVisible = false;

      $('markerNotice').classList.remove('found');

      setText(
        'markerLabel',
        'Arahkan kamera ke marker Hiro'
      );

      setText(
        'markerHelp',
        'Menu 3D muncul lagi saat marker ditemukan.'
      );
    }
  );

  // ======================================
  // EMPAT TOMBOL MENU 3D
  // ======================================

  $('menuLearnPP').addEventListener(
    'click',
    () => startLearn('pp')
  );

  $('menuLearnK3').addEventListener(
    'click',
    () => startLearn('k3')
  );

  $('menuQuizPP').addEventListener(
    'click',
    () => startQuiz('pp')
  );

  $('menuQuizK3').addEventListener(
    'click',
    () => startQuiz('k3')
  );

  // ======================================
  // PILIHAN JAWABAN 3D
  // ======================================

  for (let i = 0; i < 3; i++) {
    $('option' + i).addEventListener(
      'click',
      () => choose(i)
    );
  }

  // ======================================
  // NAVIGASI DALAM AR
  // ======================================

  $('worldHome').addEventListener(
    'click',
    goMenu
  );

  $('worldNext').addEventListener(
    'click',
    proceed
  );

  // ======================================
  // PANEL SENTUH ALTERNATIF HP
  // ======================================

  $('minimizeDock').addEventListener(
    'click',
    () => {
      const dock =
        document.querySelector('.ar-dock');

      dock.classList.toggle('compact');

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

  $('topicInput').value = state.topic;

  // PERIKSA HTTPS
  $('httpsHint').hidden =
    window.isSecureContext;

  // ======================================
  // PERIKSA DATA IOT BERKALA
  // ======================================

  setInterval(() => {
    const previouslyArmed = state.alarmArmed;

    showTelemetry();

    if (
      state.view === 'iot' &&
      previouslyArmed !== state.alarmArmed
    ) {
      render();
    }
  }, 1500);

  // TAMPILKAN MENU UTAMA
  render();

  showTelemetry();

  // KONEKSI KE WOKWI
  connectMQTT();
}

// ==========================================
// MULAI APLIKASI
// ==========================================

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    initialize
  );

} else {
  initialize();
}
