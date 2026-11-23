'use strict';

/* SOP-AR: latihan K3 berbasis data ESP32 virtual. BUKAN SOP resmi perusahaan. */
const MQTT_URL = 'wss://broker.emqx.io:8084/mqtt';
const DEFAULT_TOPIC = 'sopar/demo/k3-58321/telemetry';
const DATA_TIMEOUT_MS = 8500;
const REQUIRED_APD = ['helm', 'sepatu', 'rompi', 'kacamata'];

const lessons = [
  {
    title: 'Kenali alat pelindung diri',
    body: 'APD ditentukan melalui penilaian bahaya dan persyaratan area kerja. Contoh latihan ini memakai empat jenis APD.',
    points: ['Helm melindungi kepala dari bahaya tertentu.', 'Sepatu keselamatan melindungi kaki sesuai tingkat risikonya.', 'Rompi reflektif meningkatkan visibilitas pada situasi yang sesuai.', 'Kacamata pelindung dipilih berdasarkan potensi bahaya pada mata.']
  },
  {
    title: 'Pahami tanda dan simbol bahaya',
    body: 'Rambu keselamatan membantu pekerja mengenali peringatan, larangan, kewajiban, dan titik informasi keselamatan.',
    points: ['Perhatikan rambu dan instruksi sebelum masuk area kerja.', 'Tentukan bahaya berdasarkan konteks dan instruksi setempat.', 'Jangan menganggap rambu digital sebagai pengganti pemeriksaan langsung.']
  },
  {
    title: 'Respons terhadap alarm keselamatan',
    body: 'Alarm virtual akan diaktifkan oleh tombol ALARM di Wokwi. Peserta diminta mengenali peringatan dan memilih respons yang tepat.',
    points: ['Jangan abaikan alarm yang aktif.', 'Hentikan aktivitas sesuai instruksi setempat dan perhatikan arahan petugas.', 'Ikuti prosedur tanggap darurat/evakuasi yang berlaku di lokasi.', 'Jangan mereset alarm nyata tanpa kewenangan atau verifikasi penyebab.']
  }
];

const el = (id) => document.getElementById(id);
const state = {
  mode: 'learn', lesson: 0, practiceStage: 'intro', wrongAttempts: 0,
  mqttClient: null, subscribedTopic: DEFAULT_TOPIC, brokerConnected: false,
  latest: null, lastSeenMs: 0, markerVisible: false, practiceFinishedAt: null
};

function setStatus(id, textId, mode, msg) {
  const pill = el(id); pill.classList.remove('good', 'bad');
  if (mode) pill.classList.add(mode);
  el(textId).textContent = msg;
}
function freshTelemetry() {
  return state.brokerConnected && state.lastSeenMs > 0 && Date.now() - state.lastSeenMs <= DATA_TIMEOUT_MS;
}
function logFeedback(message, ok) {
  const target = el('feedback');
  target.textContent = message;
  target.className = `feedback visible ${ok ? 'ok' : 'error'}`;
}
function clearFeedback() {
  el('feedback').textContent = '';
  el('feedback').className = 'feedback';
}
function setARAttribute(id, name, value) {
  const node = el(id);
  if (node) node.setAttribute(name, value);
}
function updateAR() {
  const hasData = freshTelemetry();
  const reading = state.latest;
  const alarming = hasData && reading && reading.alarm === true;
  const status = !hasData ? 'MENUNGGU DATA' : alarming ? 'ALARM AKTIF' : 'KONDISI NORMAL';
  setARAttribute('arStatus', 'value', status);
  setARAttribute('arStatus', 'color', alarming ? '#ad3d32' : '#153e30');
  setARAttribute('arTemperature', 'value', hasData && reading.sensor_ok && Number.isFinite(reading.temperature)
    ? `Suhu: ${reading.temperature.toFixed(1)} C` : 'Suhu: --');
  setARAttribute('alarmBeacon', 'color', alarming ? '#e23e39' : '#65b47a');
  setARAttribute('alarmBeacon', 'material', `emissive: ${alarming ? '#e23e39' : '#237745'}; emissiveIntensity: ${alarming ? 0.85 : 0.3}`);
  setARAttribute('monitorIndicator', 'color', alarming ? '#e23e39' : '#59a46a');
  const beacon = el('alarmBeacon');
  if (!beacon) return;
  if (alarming) {
    beacon.setAttribute('animation__pulse', 'property: scale; from: 1 0.68 1; to: 1.25 0.85 1.25; dur: 500; dir: alternate; loop: true; easing: easeInOutSine');
  } else {
    beacon.removeAttribute('animation__pulse');
    beacon.setAttribute('scale', '1 0.68 1');
  }
}
function updateSensorUI() {
  const valid = freshTelemetry();
  setStatus('dataPill', 'dataText', valid ? 'good' : 'bad', valid ? 'Sensor real-time' : 'Menunggu sensor');
  if (!valid) {
    el('lastSeen').textContent = state.lastSeenMs ? 'Data terlambat' : 'Belum ada data';
    el('temperatureValue').textContent = '-- °C';
    el('humidityValue').textContent = '-- %';
    el('alarmValue').textContent = 'Tidak diketahui';
    el('eventValue').textContent = 'Event: --';
  } else {
    const data = state.latest;
    el('lastSeen').textContent = 'Baru diterima';
    el('temperatureValue').textContent = data.sensor_ok && Number.isFinite(data.temperature) ? `${data.temperature.toFixed(1)} °C` : '-- °C';
    el('humidityValue').textContent = data.sensor_ok && Number.isFinite(data.humidity) ? `${data.humidity.toFixed(1)} %` : '-- %';
    el('alarmValue').textContent = data.alarm ? 'Aktif' : 'Normal';
    el('eventValue').textContent = `Event: ${data.event || 'telemetri'}`;
  }
  updateAR();
  if (state.practiceStage === 'alarm') updateAlarmInstructions();
}
function parseTelemetry(text) {
  try {
    const obj = JSON.parse(text);
    if (!obj || typeof obj !== 'object' || typeof obj.alarm !== 'boolean' || typeof obj.alarm_manual !== 'boolean') return null;
    return {
      device: String(obj.device || ''),
      temperature: Number(obj.temperature), humidity: Number(obj.humidity),
      sensor_ok: obj.sensor_ok === true,
      alarm: obj.alarm, alarm_manual: obj.alarm_manual,
      event: String(obj.event || '').slice(0, 64)
    };
  } catch (_err) { return null; }
}
function receiveTelemetry(topic, buffer) {
  if (topic !== state.subscribedTopic) return;
  const next = parseTelemetry(buffer.toString());
  if (!next) return;
  const prev = state.latest;
  const prevFresh = freshTelemetry();
  state.latest = next;
  state.lastSeenMs = Date.now();
  updateSensorUI();

  // Tahap alarm hanya diluluskan oleh EDGE BARU tombol ALARM Wokwi.
  // Data yang sudah dalam keadaan alarm sebelum latihan tidak lolos.
  if (state.mode === 'practice' && state.practiceStage === 'alarm' && prevFresh && prev &&
      prev.alarm_manual === false && next.alarm_manual === true) {
    state.practiceStage = 'response';
    renderPractice();
    logFeedback('Alarm manual baru berhasil terdeteksi dari ESP32 virtual melalui MQTT. Pilih respons yang tepat.', true);
  }
}
function subscribeTopic(topic) {
  if (!state.mqttClient || !state.brokerConnected) return;
  state.mqttClient.subscribe(topic, { qos: 0 }, (err) => {
    if (err) setStatus('dataPill', 'dataText', 'bad', 'Subscribe gagal');
  });
}
function connectMQTT() {
  if (!window.mqtt) {
    setStatus('brokerPill', 'brokerText', 'bad', 'Library MQTT gagal dimuat');
    return;
  }
  const randomID = Math.random().toString(16).slice(2, 9);
  const client = window.mqtt.connect(MQTT_URL, {
    clientId: `sopar-ar-web-${randomID}`,
    clean: true, keepalive: 30, connectTimeout: 10000, reconnectPeriod: 3000
  });
  state.mqttClient = client;
  client.on('connect', () => {
    state.brokerConnected = true;
    setStatus('brokerPill', 'brokerText', 'good', 'Broker terhubung');
    subscribeTopic(state.subscribedTopic);
    updateSensorUI();
  });
  client.on('reconnect', () => {
    state.brokerConnected = false;
    setStatus('brokerPill', 'brokerText', '', 'Menghubungkan ulang');
    updateSensorUI();
  });
  client.on('offline', () => {
    state.brokerConnected = false;
    setStatus('brokerPill', 'brokerText', 'bad', 'Broker offline');
    updateSensorUI();
  });
  client.on('close', () => { state.brokerConnected = false; updateSensorUI(); });
  client.on('error', () => { setStatus('brokerPill', 'brokerText', 'bad', 'Koneksi gagal'); });
  client.on('message', receiveTelemetry);
}
function renderLesson() {
  const lesson = lessons[state.lesson];
  el('lessonIndex').textContent = `MATERI 0${state.lesson + 1}`;
  el('lessonTitle').textContent = lesson.title;
  el('lessonText').textContent = lesson.body;
  const list = el('lessonPoints'); list.replaceChildren();
  lesson.points.forEach((point) => {
    const li = document.createElement('li'); li.textContent = point; list.appendChild(li);
  });
  document.querySelectorAll('.lesson-btn').forEach((btn, index) => {
    btn.classList.toggle('selected', index === state.lesson);
    btn.setAttribute('aria-pressed', String(index === state.lesson));
  });
}
function changeMode(mode) {
  state.mode = mode;
  const learn = mode === 'learn';
  el('learnPanel').hidden = !learn;
  el('practicePanel').hidden = learn;
  el('tabLearn').classList.toggle('active', learn);
  el('tabPractice').classList.toggle('active', !learn);
  el('tabLearn').setAttribute('aria-selected', String(learn));
  el('tabPractice').setAttribute('aria-selected', String(!learn));
}
function updateAlarmInstructions() {
  if (state.practiceStage !== 'alarm') return;
  let message = '';
  let detail = '';
  if (!freshTelemetry()) {
    message = 'Menunggu data Wokwi melalui MQTT...';
    detail = 'Periksa koneksi, topic MQTT, dan jalankan Wokwi hingga status sensor real-time.';
  } else if (state.latest.alarm_manual) {
    message = 'Alarm manual sudah aktif sebelum tahap ini.';
    detail = 'Klik tombol RESET di Wokwi, tunggu status manual normal masuk di aplikasi, lalu klik ALARM lagi.';
  } else {
    message = 'Siap menerima alarm baru.';
    detail = 'Sekarang klik tombol merah ALARM di rangkaian Wokwi. Jangan menekan tombol di MQTTX.';
  }
  el('waitingStatus').textContent = message;
  el('alarmInstruction').textContent = detail;
}
function renderPractice() {
  const stage = state.practiceStage;
  el('practiceIntro').hidden = stage !== 'intro';
  el('practiceFlow').hidden = stage === 'intro' || stage === 'done';
  el('practiceResult').hidden = stage !== 'done';
  const names = { apd: 'Tahap 1 dari 3', alarm: 'Tahap 2 dari 3', response: 'Tahap 3 dari 3' };
  const pct = { apd: 33, alarm: 67, response: 100 };
  if (names[stage]) {
    el('stepName').textContent = names[stage];
    el('stepPercent').textContent = `${pct[stage]}%`;
    el('progressFill').style.width = `${pct[stage]}%`;
  }
  el('stageAPD').hidden = stage !== 'apd';
  el('stageAlarm').hidden = stage !== 'alarm';
  el('stageResponse').hidden = stage !== 'response';
  updateAlarmInstructions();
}
function startPractice() {
  state.wrongAttempts = 0;
  state.practiceStage = 'apd';
  state.practiceFinishedAt = null;
  document.querySelectorAll('.apd-checkbox').forEach((ch) => { ch.checked = false; });
  clearFeedback(); changeMode('practice'); renderPractice();
}
function validateAPD() {
  const checked = [...document.querySelectorAll('.apd-checkbox:checked')].map((ch) => ch.value);
  if (REQUIRED_APD.every((x) => checked.includes(x))) {
    state.practiceStage = 'alarm'; renderPractice();
    logFeedback('Benar. APD untuk skenario contoh ini sudah dipilih. Lanjutkan dengan alarm Wokwi.', true);
  } else {
    state.wrongAttempts += 1;
    logFeedback('Belum tepat. Pelajari kembali empat APD pada materi, lalu pilih semuanya.', false);
  }
}
function chooseResponse(answer) {
  if (state.practiceStage !== 'response') return;
  if (answer !== 'right') {
    state.wrongAttempts += 1;
    logFeedback('Belum tepat. Jangan abaikan atau mereset alarm nyata tanpa kewenangan. Pilih respons sesuai instruksi darurat.', false);
    return;
  }
  state.practiceFinishedAt = new Date();
  state.practiceStage = 'done';
  const score = Math.max(0, 100 - state.wrongAttempts * 20);
  el('resultScore').innerHTML = `${score}<span>/100</span>`;
  el('resultSummary').textContent = `Tiga tahap latihan selesai. Percobaan yang keliru: ${state.wrongAttempts}. Skor contoh = 100 − (20 × jumlah kesalahan), minimal 0.`;
  renderPractice();
}
function exportResult() {
  if (state.practiceStage !== 'done') return;
  const result = {
    aplikasi: 'SOP-AR prototipe pelatihan K3',
    kategori: 'Simulasi akademik, bukan sertifikasi',
    selesai_pada: state.practiceFinishedAt?.toISOString() || new Date().toISOString(),
    tahap_dilalui: ['Pilihan APD contoh', 'Alarm manual dari IoT Wokwi', 'Respons alarm'],
    kesalahan: state.wrongAttempts,
    skor_simulasi: Math.max(0, 100 - state.wrongAttempts * 20),
    mqtt_topic: state.subscribedTopic
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = 'hasil-latihan-sop-ar.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function applyTopic() {
  const next = el('mqttTopic').value.trim();
  if (!next || next.includes('#') || next.includes('+') || next.includes(' ')) {
    alert('Masukkan satu topic MQTT tanpa wildcard atau spasi, sesuai dengan sketch.ino Wokwi.');
    return;
  }
  const old = state.subscribedTopic;
  if (next === old) return;
  state.subscribedTopic = next;
  state.latest = null; state.lastSeenMs = 0;
  if (state.brokerConnected && state.mqttClient) {
    state.mqttClient.unsubscribe(old, () => subscribeTopic(next));
  }
  updateSensorUI();
}
function installUI() {
  if (!window.isSecureContext) el('httpsHint').hidden = false;
  renderLesson(); renderPractice(); updateSensorUI();
  el('tabLearn').addEventListener('click', () => changeMode('learn'));
  el('tabPractice').addEventListener('click', () => changeMode('practice'));
  document.querySelectorAll('.lesson-btn').forEach((button) => {
    button.addEventListener('click', () => { state.lesson = Number(button.dataset.lesson); renderLesson(); });
  });
  el('btnStartPractice').addEventListener('click', startPractice);
  el('btnBeginPractice').addEventListener('click', startPractice);
  el('btnCheckAPD').addEventListener('click', validateAPD);
  document.querySelectorAll('.answer-button').forEach((button) => {
    button.addEventListener('click', () => chooseResponse(button.dataset.answer));
  });
  el('btnRetry').addEventListener('click', startPractice);
  el('btnExport').addEventListener('click', exportResult);
  el('btnApplyTopic').addEventListener('click', applyTopic);
  el('hiroMarker').addEventListener('markerFound', () => {
    state.markerVisible = true;
    el('markerText').textContent = 'Marker terdeteksi';
    el('cameraHelp').textContent = 'Objek 3D latihan tampil pada marker.';
  });
  el('hiroMarker').addEventListener('markerLost', () => {
    state.markerVisible = false;
    el('markerText').textContent = 'Cari marker Hiro';
    el('cameraHelp').textContent = 'Arahkan kamera ke marker di layar lain atau kertas.';
  });
  setInterval(updateSensorUI, 1500);
  connectMQTT();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installUI);
else installUI();
