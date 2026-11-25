
'use strict';

// ==========================================
// SOP-AR V6
// MENU 3D, MATERI, SOAL, MQTT
// DAN INTERAKSI SENTUH MOBILE
// ==========================================

const MQTT_URL =
  'wss://broker.emqx.io:8084/mqtt';

const DEFAULT_TOPIC =
  'sopar/demo/k3-58321/telemetry';

const DATA_TIMEOUT = 9000;

const $ = id => document.getElementById(id);

// ==========================================
// DATA MATERI DAN SOAL
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
          'Pahami ketentuan kehadiran, pemberitahuan ketidakhadiran, dan alur izin melalui saluran resmi perusahaan.'
      },
      {
        title: 'Etika dan kerahasiaan',
        body:
          'Jaga sikap profesional dan lindungi dokumen serta informasi internal perusahaan.'
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
          'Bertanya kepada HRD atau atasan berwenang'
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
        title: 'Alat Pelindung Diri',
        body:
          'Pilih APD berdasarkan risiko pekerjaan dan persyaratan area. Periksa kondisinya sebelum digunakan.'
      },
      {
        title: 'Rambu keselamatan',
        body:
          'Pahami rambu wajib, larangan, peringatan, dan petunjuk evakuasi di lingkungan kerja.'
      },
      {
        title: 'Respons alarm',
        body:
          'Kenali alarm darurat. Ikuti prosedur lokasi dan arahan petugas berwenang.'
      }
    ],

    questions: [
      {
        question:
          'Sebelum masuk area wajib helm, tindakan yang tepat adalah ...',
        choices: [
          'Masuk tanpa helm',
          'Pakai dan periksa helm yang sesuai',
          'Memakai helm apa saja'
        ],
        correct: 1
      },
      {
        question:
          'Ada rambu bahaya yang belum dipahami. Kamu sebaiknya ...',
        choices: [
          'Abaikan',
          'Langsung masuk',
          'Cari tahu artinya dan ikuti arahan'
        ],
        correct: 2
      },
      {
        question:
          'Saat alarm darurat aktif, tindakan awal yang tepat adalah ...',
        choices: [
          'Abaikan alarm',
          'Ikuti prosedur dan arahan petugas',
          'Reset alarm nyata tanpa izin'
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

const text = (id, value) => {
  if ($(id)) {
    $(id).textContent = String(value);
  }
};

const value = (id, val) => {
  if ($(id)) {
    $(id).setAttribute('value', String(val));
  }
};

function show3D(id, yes) {
  const el = $(id);

  if (!el) return;

  el.setAttribute('visible', Boolean(yes));

  // Memastikan papan yang tidak aktif
  // benar-benar disembunyikan.
  if (el.object3D) {
    el.object3D.visible = Boolean(yes);
  }
}

const fresh = () =>
  state.mqttConnected &&
  !!state.telemetry &&
  Date.now() - state.telemetryAt < DATA_TIMEOUT;

// ==========================================
// NOTIFIKASI
// ==========================================

function toast(msg) {
  const e = $('toast');

  text('toast', msg);
  e.hidden = false;

  clearTimeout(toast.timer);

  toast.timer = setTimeout(() => {
    e.hidden = true;
  }, 2500);
}

// ==========================================
// PANEL SENTUH HP
// ==========================================

function setDockOpen(open) {
  const dock = document.querySelector('.ar-dock');

  dock.classList.toggle('compact', !open);

  text(
    'minimizeDock',
    open ? '−' : '+'
  );
}

// ==========================================
// SESSION
// ==========================================

function resetSession(view, category) {
  Object.assign(state, {
    view,
    category,
    index: 0,

    answered: false,
    selection: null,

    correctCount: 0,
    mistakes: [],

    iotPassed: false,
    alarmArmed: false,

    result: null
  });

  // Ketika belajar atau latihan dipilih,
  // panel sentuh langsung terbuka.
  setDockOpen(view !== 'menu');

  render();
}

const goMenu = () => resetSession('menu', null);

const startLearn = category =>
  resetSession('learn', category);

const startQuiz = category =>
  resetSession('quiz', category);

// ==========================================
// JAWABAN SOAL
// ==========================================

function choose(i) {
  if (
    state.view !== 'quiz' ||
    state.answered
  ) {
    return;
  }

  const q =
    modules[state.category].questions[state.index];

  state.answered = true;
  state.selection = i;

  if (i === q.correct) {
    state.correctCount++;
  } else {
    state.mistakes.push({
      nomor: state.index + 1,
      jawabanDipilih: 'ABC'[i]
    });
  }

  render();

  toast('Jawaban tersimpan. Ketuk LANJUT.');
}

// ==========================================
// TOMBOL LANJUT
// ==========================================

function proceed() {
  const m = modules[state.category];

  if (!m) return;

  if (state.view === 'learn') {
    if (state.index < m.lessons.length - 1) {
      state.index++;
      render();
    } else {
      startQuiz(state.category);
    }
  }

  else if (state.view === 'quiz') {
    if (!state.answered) {
      return toast(
        'Pilih jawaban A, B, atau C dahulu.'
      );
    }

    if (state.index < m.questions.length - 1) {
      state.index++;
      state.answered = false;
      state.selection = null;

      render();
    }

    else if (state.category === 'k3') {
      state.view = 'iot';
      state.alarmArmed = false;

      render();
    }

    else {
      finish();
    }
  }

  else if (state.view === 'result') {
    startQuiz(state.category);
  }
}

// ==========================================
// HASIL NILAI
// ==========================================

function finish() {
  const m = modules[state.category];

  const total =
    m.questions.length +
    (state.category === 'k3' ? 1 : 0);

  const earned =
    state.correctCount +
    (
      state.category === 'k3' &&
      state.iotPassed ? 1 : 0
    );

  state.result = {
    modul: m.name,

    nilai: Math.round(
      100 * earned / total
    ),

    jumlahSoal: m.questions.length,
    benar: state.correctCount,

    kesalahan: state.mistakes,

    praktikIoT:
      state.category === 'k3'
        ? state.iotPassed
        : null,

    waktu: new Date().toISOString(),

    catatan:
      'Simulasi akademik, bukan penilaian resmi PT IRNC.'
  };

  state.view = 'result';

  render();
}

// ==========================================
// MEMBUAT TOMBOL SENTUH HTML
// ==========================================

function addAction(label, handler) {
  const b = document.createElement('button');

  b.className = 'answer';
  b.type = 'button';
  b.textContent = label;

  b.addEventListener('click', handler);

  $('touchActions').append(b);
}

// ==========================================
// MEMBATASI TEKS DI PAPAN 3D
// ==========================================

function shortText(str, max = 100) {
  return str.length > max
    ? str.slice(0, max - 1).trimEnd() + '…'
    : str;
}

// ==========================================
// MENAMPILKAN MENU, MATERI, SOAL
// ==========================================

function render() {
  const isMenu = state.view === 'menu';

  show3D('menuWorld', isMenu);
  show3D('contentWorld', !isMenu);

  show3D(
    'alarmBeacon',
    state.view === 'iot'
  );

  $('touchActions').replaceChildren();

  // MENU UTAMA
  if (isMenu) {
    text('dockTitle', 'Menu SOP-AR');

    text(
      'dockQuestion',
      'Pilih kartu 3D. Jika sulit disentuh, tekan + dan pilih di sini.'
    );

    addAction(
      'Belajar Peraturan Perusahaan',
      () => startLearn('pp')
    );

    addAction(
      'Belajar Keselamatan Kerja (K3)',
      () => startLearn('k3')
    );

    addAction(
      'Latihan Soal Peraturan Perusahaan',
      () => startQuiz('pp')
    );

    addAction(
      'Latihan Soal K3',
      () => startQuiz('k3')
    );

    return;
  }

  const m = modules[state.category];

  show3D(
    'worldOptions',
    state.view === 'quiz'
  );

  show3D(
    'worldNextGroup',
    ['learn', 'quiz', 'result'].includes(state.view)
  );

  text('dockTitle', m.name);

  addAction(
    '← Kembali ke Menu Utama',
    goMenu
  );

  // MODE BELAJAR
  if (state.view === 'learn') {
    const item = m.lessons[state.index];

    value(
      'worldMode',
      `BELAJAR ${state.index + 1}/${m.lessons.length}`
    );

    value('worldTitle', item.title);

    value(
      'worldBody',
      shortText(item.body)
    );

    value(
      'worldHint',
      'Baca penjelasan di panel sentuh.'
    );

    value(
      'worldNextText',
      state.index === m.lessons.length - 1
        ? 'MULAI SOAL'
        : 'LANJUT'
    );

    text('dockQuestion', item.body);

    addAction(
      state.index === m.lessons.length - 1
        ? 'Mulai Latihan Soal'
        : 'Materi Berikutnya',
      proceed
    );
  }

  // MODE LATIHAN
  else if (state.view === 'quiz') {
    const q = m.questions[state.index];

    value(
      'worldMode',
      `SOAL ${state.index + 1}/${m.questions.length}`
    );

    value('worldTitle', m.name);

    value(
      'worldBody',
      shortText(q.question, 85)
    );

    value(
      'worldHint',
      state.answered
        ? 'Jawaban tersimpan. Tekan LANJUT.'
        : 'Pilih A, B, atau C.'
    );

    value('worldNextText', 'LANJUT');

    text('dockQuestion', q.question);

    q.choices.forEach((choice, i) => {
      value(
        `optionText${i}`,
        `${'ABC'[i]}. ${shortText(choice, 32)}`
      );

      $(`option${i}`).setAttribute(
        'color',
        state.answered &&
        state.selection === i
          ? '#dfb75c'
          : '#dfeee0'
      );

      if (!state.answered) {
        addAction(
          `${'ABC'[i]}. ${choice}`,
          () => choose(i)
        );
      }
    });

    if (state.answered) {
      addAction(
        'Lanjut ke Tahap Berikutnya',
        proceed
      );
    }
  }

  // MODE PRAKTIK IOT
  else if (state.view === 'iot') {
    value('worldMode', 'PRAKTIK IOT K3');

    value(
      'worldTitle',
      'Respons Alarm Wokwi'
    );

    value(
      'worldBody',
      'Tunggu status NORMAL baru, lalu tekan tombol ALARM pada Wokwi.'
    );

    let help = 'Menunggu data MQTT terbaru.';

    if (fresh()) {
      if (state.telemetry.alarm) {
        help =
          'Alarm aktif. Tekan RESET di Wokwi dan tunggu status NORMAL.';
      }

      else if (state.alarmArmed) {
        help =
          'NORMAL diterima. Tekan ALARM sekarang.';
      }

      else {
        help =
          'Menunggu status NORMAL baru.';
      }
    }

    value(
      'worldHint',
      shortText(help, 78)
    );

    text('dockQuestion', help);
  }

  // MODE HASIL
  else if (state.view === 'result') {
    value('worldMode', 'HASIL EVALUASI');

    value(
      'worldTitle',
      `NILAI ${state.result.nilai}/100`
    );

    value(
      'worldBody',
      `Benar ${state.result.benar}/${state.result.jumlahSoal}. Kesalahan ${state.mistakes.length}.`
    );

    value(
      'worldHint',
      'Latihan akademik, bukan sertifikasi resmi.'
    );

    value('worldNextText', 'ULANGI');

    text(
      'dockQuestion',
      `Nilai: ${state.result.nilai}/100. Benar: ${state.result.benar}.`
    );

    addAction(
      'Ulangi Latihan',
      () => startQuiz(state.category)
    );

    addAction(
      'Unduh Hasil JSON',
      downloadResult
    );
  }
}

// ==========================================
// DOWNLOAD HASIL
// ==========================================

function downloadResult() {
  if (!state.result) return;

  const blob = new Blob(
    [JSON.stringify(state.result, null, 2)],
    { type: 'application/json' }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download =
    `hasil-sop-ar-${state.category}.json`;

  document.body.append(a);

  a.click();
  a.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

// ==========================================
// MEMBACA DATA MQTT
// ==========================================

function parseTelemetry(message) {
  try {
    const v = JSON.parse(message);

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
      sensor_ok: v.sensor_ok === true
    };
  } catch {
    return null;
  }
}

// ==========================================
// MENERIMA DATA IOT
// ==========================================

function onTelemetry(packet) {
  const prev = state.telemetry;
  const prevFresh = fresh();

  state.telemetry = packet;
  state.telemetryAt = Date.now();

  if (state.view === 'iot') {
    if (
      !packet.alarm &&
      !packet.alarm_manual
    ) {
      state.alarmArmed = true;
    }

    else if (
      state.alarmArmed &&
      prevFresh &&
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
// STATUS MQTT
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

  text(
    'mqttText',
    state.mqttConnected
      ? 'MQTT terhubung'
      : 'MQTT terputus'
  );

  text(
    'sensorConnection',
    fresh()
      ? 'IoT: data terbaru'
      : 'IoT: menunggu data'
  );

  text(
    'temp',
    fresh() &&
    state.telemetry.sensor_ok &&
    Number.isFinite(state.telemetry.temperature)
      ? `${state.telemetry.temperature.toFixed(1)}°C`
      : '--°C'
  );

  text(
    'alarm',
    fresh()
      ? (
          state.telemetry.alarm
            ? 'AKTIF'
            : 'Normal'
        )
      : '--'
  );

  $('alarmBeacon').setAttribute(
    'color',
    fresh() && state.telemetry.alarm
      ? '#e54f48'
      : '#69b77c'
  );

  if (!fresh()) {
    state.alarmArmed = false;
  }
}

// ==========================================
// KONEKSI MQTT
// ==========================================

function connectMQTT() {
  if (!window.mqtt) {
    text('mqttText', 'Library MQTT gagal');
    return;
  }

  const client = mqtt.connect(
    MQTT_URL,
    {
      clientId:
        `sopar-v6-${Math.random().toString(16).slice(2, 10)}`,
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

  client.on('message', (topic, buffer) => {
    if (topic !== state.topic) return;

    const packet = parseTelemetry(
      buffer.toString()
    );

    if (packet) onTelemetry(packet);
  });

  ['offline', 'close', 'reconnect'].forEach(
    event => client.on(event, () => {
      state.mqttConnected = false;
      state.alarmArmed = false;
      showTelemetry();
    })
  );

  client.on('error', e => {
    console.warn('MQTT:', e.message);
  });
}

// ==========================================
// UBAH TOPIC MQTT
// ==========================================

function applyTopic() {
  const next = $('topicInput').value.trim();

  if (
    !next ||
    next.length > 170 ||
    /[+#\s]/.test(next)
  ) {
    text(
      'settingsError',
      'Topic tidak boleh kosong, spasi, +, atau #.'
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
        () => state.mqttClient.subscribe(
          next,
          { qos: 0 }
        )
      );
    }
  }

  text('settingsError', '');
  $('settingsDialog').close();
  showTelemetry();
}

// ==========================================
// PERBAIKAN SENTUH OBJEK 3D
// KHUSUS MOBILE DAN DESKTOP
// ==========================================

function setupTouch3D() {
  const scene = $('arScene');

  const actions = {
    'learn-pp': () => startLearn('pp'),
    'learn-k3': () => startLearn('k3'),

    'quiz-pp': () => startQuiz('pp'),
    'quiz-k3': () => startQuiz('k3'),

    'home': goMenu,
    'next': proceed,

    'answer-0': () => choose(0),
    'answer-1': () => choose(1),
    'answer-2': () => choose(2)
  };

  function clicked(event) {
    if (
      !state.markerVisible ||
      !scene.camera
    ) {
      return;
    }

    const canvas = scene.canvas;

    if (!canvas) return;

    const r = canvas.getBoundingClientRect();

    // Ubah koordinat sentuh HP
    // menjadi koordinat raycasting 3D.
    const x =
      (event.clientX - r.left) / r.width * 2 - 1;

    const y =
      -((event.clientY - r.top) / r.height * 2 - 1);

    const caster = new THREE.Raycaster();

    caster.setFromCamera(
      new THREE.Vector2(x, y),
      scene.camera
    );

    // Hanya objek tombol yang terlihat
    // yang boleh menerima sentuhan.
    const targets = [
      ...scene.querySelectorAll('.ar-hit')
    ].filter(el => {
      let p = el;

      while (p && p !== scene) {
        if (
          p.object3D &&
          !p.object3D.visible
        ) {
          return false;
        }

        p = p.parentElement;
      }

      return true;
    });

    const entries = targets
      .map(el => ({
        el,
        mesh: el.getObject3D('mesh')
      }))
      .filter(item => item.mesh);

    const intersections = caster.intersectObjects(
      entries.map(item => item.mesh),
      true
    );

    if (!intersections.length) return;

    const hitObject = intersections[0].object;

    const entry = entries.find(item => {
      let node = hitObject;

      while (node) {
        if (node === item.mesh) {
          return true;
        }
        node = node.parent;
      }

      return false;
    });

    const action = entry?.el?.dataset?.action;

    if (action && actions[action]) {
      event.preventDefault();
      actions[action]();
    }
  }

  function attach() {
    scene.canvas?.addEventListener(
      'pointerup',
      clicked,
      { passive: false }
    );
  }

  if (scene.hasLoaded) {
    attach();
  } else {
    scene.addEventListener(
      'loaded',
      attach,
      { once: true }
    );
  }
}

// ==========================================
// INISIALISASI
// ==========================================

function initialize() {

  // MARKER DITEMUKAN
  $('hiroMarker').addEventListener(
    'markerFound',
    () => {
      state.markerVisible = true;

      $('markerNotice').classList.add('found');

      text(
        'markerLabel',
        'Marker Hiro terdeteksi'
      );

      text(
        'markerHelp',
        'Sentuh kartu 3D atau tekan + pada kontrol sentuh.'
      );
    }
  );

  // MARKER HILANG
  $('hiroMarker').addEventListener(
    'markerLost',
    () => {
      state.markerVisible = false;

      $('markerNotice').classList.remove('found');

      text(
        'markerLabel',
        'Arahkan kamera ke marker Hiro'
      );

      text(
        'markerHelp',
        'Kontrol sentuh tetap bisa digunakan.'
      );
    }
  );

  // MENGAKTIFKAN SENTUH OBJEK 3D
  setupTouch3D();

  // BUKA / TUTUP PANEL
  $('minimizeDock').addEventListener(
    'click',
    () => {
      const compact =
        document.querySelector('.ar-dock')
          .classList.contains('compact');

      setDockOpen(compact);
    }
  );

  // PENGATURAN MQTT
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

  $('httpsHint').hidden =
    window.isSecureContext;

  // MEMERIKSA DATA IOT
  setInterval(() => {
    const wasArmed = state.alarmArmed;

    showTelemetry();

    if (
      state.view === 'iot' &&
      wasArmed !== state.alarmArmed
    ) {
      render();
    }
  }, 1500);

  render();
  showTelemetry();
  connectMQTT();
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    initialize
  );
} else {
  initialize();
}