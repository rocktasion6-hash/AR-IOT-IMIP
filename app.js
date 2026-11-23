'use strict';

/* SOP-AR Interaktif: studi kasus akademik; bukan SOP resmi atau sertifikasi K3. */
const MQTT_URL = 'wss://broker.emqx.io:8084/mqtt';
const DEFAULT_TOPIC = 'sopar/demo/k3-58321/telemetry';
const DATA_TIMEOUT_MS = 8500;

const lessons = [
  {
    title: 'Kenali APD sebelum bekerja',
    tag: 'MATERI 01 / APD',
    message: 'APD harus dipilih berdasarkan bahaya pekerjaan dan ketentuan area kerja. Pelajari fungsi perlindungannya terlebih dahulu.',
    points: [
      'Helm keselamatan membantu melindungi kepala dari bahaya tertentu.',
      'Sepatu keselamatan dan pelindung mata harus sesuai dengan risikonya.',
      'APD tidak menggantikan pengendalian bahaya atau instruksi petugas K3.'
    ],
    worldBody: 'Kenali APD yang diwajibkan di area kerja. Pilih sesuai risiko dan instruksi K3.'
  },
  {
    title: 'Pahami rambu keselamatan',
    tag: 'MATERI 02 / RAMBU',
    message: 'Rambu membantu mengenali peringatan, larangan, kewajiban, dan petunjuk keselamatan. Selalu pahami maknanya sebelum bertindak.',
    points: [
      'Rambu wajib dipatuhi sesuai konteks lokasi.',
      'Tanda peringatan berarti ada potensi bahaya yang harus dikenali.',
      'Jika rambu tidak dipahami, minta penjelasan petugas berwenang.'
    ],
    worldBody: 'Pelajari arti rambu peringatan dan ikuti instruksi keselamatan setempat.'
  },
  {
    title: 'Kenali alarm dan respons awal',
    tag: 'MATERI 03 / ALARM',
    message: 'Alarm memberi sinyal bahwa situasi perlu diperiksa dan respons harus mengikuti prosedur lokasi. Latihan ini memicu alarm dari Wokwi.',
    points: [
      'Jangan mengabaikan alarm.',
      'Ikuti arahan petugas dan prosedur darurat yang ditetapkan.',
      'Jangan mematikan atau mereset alarm nyata tanpa kewenangan.'
    ],
    worldBody: 'Saat alarm berbunyi: pahami peringatan, ikuti prosedur dan arahan petugas.'
  }
];

const stages = [
  {
    type: 'quiz', tag: 'SOAL 01 / APD', title: 'Soal APD',
    question: 'Saat akan memasuki area yang mewajibkan helm keselamatan, apa yang seharusnya dilakukan?',
    worldBody: 'Sebelum masuk area WAJIB HELM, tindakan yang benar?',
    options: [
      'Masuk tanpa helm karena hanya sebentar.',
      'Pakai helm yang sesuai dan pastikan kondisinya layak.',
      'Meminjam helm apa saja tanpa pemeriksaan.'
    ],
    worldOptions: ['Masuk tanpa helm', 'Pakai & periksa helm', 'Helm apa saja'],
    correct: 1,
    explain: 'Benar. Persyaratan APD harus dipenuhi sebelum memasuki area sesuai SOP yang berlaku.'
  },
  {
    type: 'quiz', tag: 'SOAL 02 / RAMBU', title: 'Soal Rambu',
    question: 'Jika kamu melihat rambu peringatan bahaya yang belum dipahami, apa tindakan paling tepat?',
    worldBody: 'Ada rambu bahaya yang belum dipahami. Apa tindakanmu?',
    options: [
      'Abaikan selama tidak ada orang yang menegur.',
      'Langsung masuk karena lingkungan terlihat aman.',
      'Cari tahu artinya dan ikuti instruksi petugas berwenang.'
    ],
    worldOptions: ['Abaikan rambu', 'Langsung masuk', 'Pahami & ikuti arahan'],
    correct: 2,
    explain: 'Benar. Rambu merupakan informasi keselamatan yang perlu dipahami sebelum bertindak.'
  },
  {
    type: 'alarm', tag: 'PRAKTIK 03 / IOT', title: 'Praktik alarm IoT',
    question: 'Sekarang uji respons AR terhadap tombol ALARM pada Wokwi. Pastikan data MQTT aktif. Bila alarm sudah aktif, tekan RESET lebih dahulu.',
    worldBody: 'Tunggu status NORMAL baru. Lalu tekan tombol ALARM di Wokwi.',
    options: []
  },
  {
    type: 'quiz', tag: 'SOAL 04 / RESPONS', title: 'Soal respons alarm',
    question: 'Alarm latihan sudah aktif dari Wokwi. Apa respons awal paling tepat menurut prinsip umum keselamatan?',
    worldBody: 'Alarm K3 telah aktif. Respons awal yang tepat?',
    options: [
      'Abaikan alarm dan lanjut bekerja.',
      'Hentikan kegiatan sesuai instruksi dan ikuti arahan keselamatan setempat.',
      'Reset alarm nyata tanpa memeriksa penyebabnya.'
    ],
    worldOptions: ['Abaikan dan lanjut', 'Ikuti prosedur & petugas', 'Reset tanpa periksa'],
    correct: 1,
    explain: 'Benar. Dalam kondisi nyata, ikuti prosedur perusahaan dan arahan personel K3 yang berwenang.'
  }
];

const $ = (id) => document.getElementById(id);
const state = {
  mode: 'learn', lessonIndex: 0, stageIndex: 0, wrong: 0,
  markerVisible: false, brokerConnected: false, mqttClient: null,
  topic: DEFAULT_TOPIC, latest: null, lastSeenMs: 0,
  alarmArmed: false, finishedAt: null, feedback: null, feedbackKind: 'ok'
};

function text(id, value) { const node = $(id); if (node) node.textContent = value; }
function attr(id, field, value) { const node = $(id); if (node) node.setAttribute(field, value); }
function fresh() { return state.brokerConnected && state.lastSeenMs > 0 && Date.now() - state.lastSeenMs < DATA_TIMEOUT_MS; }
function currentStage() { return stages[state.stageIndex]; }
function score() { return Math.max(0, 100 - state.wrong * 20); }
function feedback(message, kind = 'ok') { state.feedback = message; state.feedbackKind = kind; renderFeedback(); }
function clearFeedback() { state.feedback = null; renderFeedback(); }
function renderFeedback() {
  const node = $('dockFeedback');
  node.className = state.feedback ? `feedback show ${state.feedbackKind}` : 'feedback';
  node.textContent = state.feedback || '';
}
function toast(message) {
  const el = $('toast'); el.textContent = message; el.hidden = false;
  clearTimeout(toast.handle); toast.handle = setTimeout(() => { el.hidden = true; }, 2800);
}
function ensureMarker() {
  if (state.markerVisible) return true;
  toast('Arahkan kamera ke marker Hiro agar praktik berlangsung di AR.');
  return false;
}
function setAlarmGraphic() {
  const alarm = fresh() && state.latest && state.latest.alarm;
  const color = alarm ? '#ed514c' : '#6db67d';
  attr('alarmBeacon', 'color', color);
  attr('alarmBeacon', 'material', `emissive: ${alarm ? '#ec3831' : '#1e7443'}; emissiveIntensity: ${alarm ? 0.85 : 0.35}`);
  attr('panelIndicator', 'color', alarm ? '#ec5147' : '#60b779');
  const b = $('alarmBeacon');
  if (alarm) b.setAttribute('animation__pulse', 'property: scale; from: 1 0.72 1; to: 1.2 0.85 1.2; loop: true; dir: alternate; dur: 500');
  else { b.removeAttribute('animation__pulse'); b.setAttribute('scale', '1 0.72 1'); }
}
function renderConnection() {
  $('mqttPill').classList.toggle('good', state.brokerConnected);
  $('mqttPill').classList.toggle('bad', !state.brokerConnected);
  text('mqttText', state.brokerConnected ? 'MQTT terhubung' : 'MQTT terputus');
  if (fresh()) {
    const d = state.latest;
    text('sensorConnection', 'IoT: data real-time');
    text('temp', d.sensor_ok && Number.isFinite(d.temperature) ? `${d.temperature.toFixed(1)}°C` : '--°C');
    text('alarm', d.alarm ? 'AKTIF' : 'Normal');
  } else {
    text('sensorConnection', 'IoT: menunggu data');
    text('temp', '--°C');
    text('alarm', '--');
  }
  setAlarmGraphic();
  if (state.mode === 'practice' && currentStage()?.type === 'alarm') renderAlarmCallout();
}
function renderAlarmCallout() {
  const node = $('dockCallout');
  if (state.mode !== 'practice' || currentStage().type !== 'alarm') { node.hidden = true; return; }
  node.hidden = false;
  let body;
  if (!fresh()) body = 'Belum ada data Wokwi terbaru. Jalankan Wokwi dan tunggu MQTT terhubung.';
  else if (state.latest.alarm_manual || state.latest.alarm) body = 'Alarm sudah aktif. Tekan RESET di Wokwi dan pastikan sensor kembali NORMAL, lalu tekan ALARM lagi.';
  else if (!state.alarmArmed) body = 'Menunggu satu pesan kondisi NORMAL baru dari Wokwi untuk memulai pengujian.';
  else body = 'Siap! Sekarang tekan tombol merah ALARM di Wokwi. AR menunggu perubahan nyata dari MQTT.';
  node.textContent = body;
}
function renderWorld(options, header, title, body, hint, actionText) {
  attr('arMode', 'value', header);
  attr('arBoardTitle', 'value', title);
  attr('arBoardBody', 'value', body);
  attr('arBoardHint', 'value', hint);
  const active = Boolean(options && options.length);
  $('arOptions').setAttribute('visible', active);
  for (let i = 0; i < 3; i++) {
    attr(`arOptionText${i}`, 'value', active && options[i] ? `${String.fromCharCode(65 + i)}. ${options[i]}` : '');
  }
  $('arContinueGroup').setAttribute('visible', Boolean(actionText));
  attr('arContinueText', 'value', actionText || '');
}
function render() {
  const isLearn = state.mode === 'learn';
  $('tabLearn').classList.toggle('selected', isLearn);
  $('tabQuiz').classList.toggle('selected', !isLearn);
  $('tabLearn').setAttribute('aria-selected', String(isLearn));
  $('tabQuiz').setAttribute('aria-selected', String(!isLearn));
  const choiceBox = $('dockAnswers'); choiceBox.replaceChildren();
  const bullets = $('dockBullets'); bullets.replaceChildren();
  $('resultActions').hidden = true;
  $('dockCallout').hidden = true;
  $('mainButton').hidden = false;
  $('backButton').hidden = false;

  if (isLearn) {
    const item = lessons[state.lessonIndex];
    text('dockStep', item.tag);
    text('dockTitle', item.title);
    text('dockQuestion', item.message);
    item.points.forEach(p => { const box = document.createElement('div'); box.textContent = p; bullets.append(box); });
    const pc = Math.round((state.lessonIndex + 1) / lessons.length * 100);
    text('progressCaption', `Materi ${state.lessonIndex + 1} dari ${lessons.length}`);
    text('progressPct', `${pc}%`); $('progressFill').style.width = `${pc}%`;
    $('mainButton').textContent = state.lessonIndex === lessons.length - 1 ? 'Mulai praktik di AR →' : 'Materi berikutnya →';
    $('backButton').hidden = state.lessonIndex === 0;
    choiceBox.hidden = true;
    renderWorld(null, `BELAJAR • 0${state.lessonIndex + 1}`, item.title, item.worldBody, 'Pahami materi di papan AR', state.lessonIndex === lessons.length - 1 ? 'MULAI SOAL' : 'LANJUT MATERI');
  } else if (state.stageIndex === stages.length) {
    const result = score();
    text('dockStep', 'HASIL EVALUASI');
    text('dockTitle', `Nilai latihan ${result}/100`);
    text('dockQuestion', `Empat tahapan telah diselesaikan. Jumlah percobaan salah: ${state.wrong}. Penilaian simulasi: 100 - (20 × kesalahan), minimum 0.`);
    text('progressCaption', 'Praktik selesai'); text('progressPct', '100%'); $('progressFill').style.width = '100%';
    $('mainButton').textContent = 'Ulangi praktik'; $('backButton').textContent = 'Kembali belajar';
    $('resultActions').hidden = false;
    choiceBox.hidden = true;
    renderWorld(null, 'EVALUASI SELESAI', `SKOR ${result}/100`, `Kesalahan: ${state.wrong}. Terus pelajari dan latih ulang prosedur.`, 'Bukan sertifikasi resmi', 'ULANGI PRAKTIK');
  } else {
    const stage = currentStage();
    const pc = Math.round((state.stageIndex + 1) / stages.length * 100);
    text('dockStep', stage.tag); text('dockTitle', stage.title); text('dockQuestion', stage.question);
    text('progressCaption', `Tahap ${state.stageIndex + 1} dari ${stages.length}`);
    text('progressPct', `${pc}%`); $('progressFill').style.width = `${pc}%`;
    $('backButton').textContent = 'Kembali belajar';
    $('mainButton').hidden = true;
    if (stage.type === 'quiz') {
      choiceBox.hidden = false;
      stage.options.forEach((label, index) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'answer';
        const letter = document.createElement('strong'); letter.textContent = String.fromCharCode(65 + index);
        b.append(letter, document.createTextNode(' ' + label));
        b.addEventListener('click', () => answer(index)); choiceBox.append(b);
      });
      renderWorld(stage.worldOptions, stage.tag, stage.title, stage.worldBody, 'Ketuk opsi A / B / C pada AR atau panel kamera', '');
    } else {
      choiceBox.hidden = true;
      renderWorld(null, 'PRAKTIK IOT', 'Tombol ALARM Wokwi', stage.worldBody, 'Data sensor harus real-time', '');
      renderAlarmCallout();
    }
  }
  renderFeedback();
}
function switchMode(mode) {
  if (mode === 'practice' && state.mode !== 'practice') {
    state.stageIndex = 0; state.wrong = 0; state.finishedAt = null; state.alarmArmed = false;
  }
  state.mode = mode; clearFeedback(); render();
}
function goNext() {
  if (!ensureMarker()) return;
  if (state.mode === 'learn') {
    if (state.lessonIndex < lessons.length - 1) state.lessonIndex += 1;
    else { switchMode('practice'); return; }
    clearFeedback(); render();
  } else if (state.stageIndex === stages.length) {
    restartPractice();
  }
}
function restartPractice() {
  state.mode = 'practice'; state.stageIndex = 0; state.wrong = 0; state.finishedAt = null;
  state.alarmArmed = false; clearFeedback(); render();
}
function answer(index) {
  if (!ensureMarker()) return;
  if (state.mode !== 'practice' || state.stageIndex >= stages.length) return;
  const s = currentStage();
  if (s.type !== 'quiz') return;
  if (index !== s.correct) {
    state.wrong += 1;
    feedback('Jawaban belum tepat. Pelajari petunjuk keselamatan dan coba kembali.', 'error');
    return;
  }
  state.stageIndex += 1;
  if (state.stageIndex === 2) state.alarmArmed = false;
  if (state.stageIndex === stages.length) {
    state.finishedAt = new Date();
    feedback(`Latihan selesai. ${s.explain}`, 'ok');
  } else feedback(s.explain, 'ok');
  render();
}
function handleAlarmFromMQTT(oldData, oldFresh, next) {
  if (state.mode !== 'practice' || currentStage()?.type !== 'alarm') return;
  // Arming hanya sesudah menerima status NORMAL BARU pada tahap ini.
  if (next.alarm_manual === false && next.alarm === false) {
    state.alarmArmed = true;
    renderAlarmCallout();
    return;
  }
  if (state.alarmArmed && oldFresh && oldData && oldData.alarm_manual === false && next.alarm_manual === true) {
    state.alarmArmed = false;
    state.stageIndex = 3;
    feedback('Alarm baru dari Wokwi berhasil terdeteksi. Sekarang jawab soal respons alarm.', 'ok');
    render();
  }
}
function parseTelemetry(payload) {
  try {
    const obj = JSON.parse(payload);
    if (!obj || typeof obj !== 'object' || typeof obj.alarm !== 'boolean' || typeof obj.alarm_manual !== 'boolean') return null;
    return {
      temperature: Number(obj.temperature), humidity: Number(obj.humidity), sensor_ok: obj.sensor_ok === true,
      alarm: obj.alarm, alarm_manual: obj.alarm_manual,
      event: typeof obj.event === 'string' ? obj.event.slice(0, 70) : ''
    };
  } catch (_) { return null; }
}
function subscribe(topic) {
  if (!state.brokerConnected || !state.mqttClient) return;
  state.mqttClient.subscribe(topic, { qos: 0 }, (error) => {
    if (error) { feedback('Subscribe topic gagal. Periksa topic dan koneksi.', 'error'); }
  });
}
function connectMQTT() {
  if (!window.mqtt) { text('mqttText', 'Library MQTT gagal'); return; }
  const clientId = 'sop-ar-arquiz-' + Math.random().toString(16).slice(2, 10);
  state.mqttClient = window.mqtt.connect(MQTT_URL, {
    clientId, clean: true, keepalive: 30, connectTimeout: 10000, reconnectPeriod: 3000
  });
  state.mqttClient.on('connect', () => { state.brokerConnected = true; subscribe(state.topic); renderConnection(); });
  state.mqttClient.on('message', (topic, message) => {
    if (topic !== state.topic) return;
    const parsed = parseTelemetry(message.toString()); if (!parsed) return;
    const old = state.latest;
    const oldFresh = fresh();
    state.latest = parsed; state.lastSeenMs = Date.now();
    handleAlarmFromMQTT(old, oldFresh, parsed);
    renderConnection();
  });
  for (const event of ['offline','close','reconnect']) {
    state.mqttClient.on(event, () => { state.brokerConnected = false; renderConnection(); });
  }
  state.mqttClient.on('error', () => { state.brokerConnected = false; renderConnection(); });
}
function applyTopic() {
  const next = $('topicInput').value.trim();
  const message = $('settingsError');
  if (!next || /[+#\s]/.test(next) || next.length > 170) {
    message.textContent = 'Topic wajib diisi, tanpa wildcard (+/#) atau spasi.'; return;
  }
  if (next === state.topic) { $('settingsDialog').close(); return; }
  const old = state.topic;
  state.topic = next; state.latest = null; state.lastSeenMs = 0; state.alarmArmed = false;
  if (state.brokerConnected) state.mqttClient.unsubscribe(old, () => subscribe(next));
  renderConnection(); message.textContent = '';
  $('settingsDialog').close(); toast('Topic MQTT sudah diperbarui. Menunggu data dari Wokwi.');
}
function downloadResult() {
  if (state.mode !== 'practice' || state.stageIndex !== stages.length) return;
  const data = {
    aplikasi: 'SOP-AR Interactive',
    keterangan: 'Simulasi akademik, bukan sertifikasi atau SOP resmi PT IRNC',
    waktu: (state.finishedAt || new Date()).toISOString(),
    tahapan: stages.map(s => s.tag),
    kesalahan: state.wrong, nilai: score(), topic_mqtt: state.topic
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'}));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = 'sop-ar-hasil-latihan.json'; document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function initialize() {
  if (!window.isSecureContext) $('httpsHint').hidden = false;
  $('topicInput').value = state.topic;
  $('tabLearn').addEventListener('click', () => switchMode('learn'));
  $('tabQuiz').addEventListener('click', () => switchMode('practice'));
  $('mainButton').addEventListener('click', () => { if (state.mode === 'practice' && state.stageIndex === stages.length) restartPractice(); else goNext(); });
  $('backButton').addEventListener('click', () => {
    if (state.mode === 'learn' && state.lessonIndex > 0) { state.lessonIndex--; clearFeedback(); render(); }
    else { state.mode = 'learn'; clearFeedback(); render(); }
  });
  $('minimizeDock').addEventListener('click', () => {
    const compact = document.querySelector('.ar-dock');
    compact.classList.toggle('compact');
    $('minimizeDock').textContent = compact.classList.contains('compact') ? '+' : '−';
  });
  $('openSettings').addEventListener('click', () => $('settingsDialog').showModal());
  $('applyTopic').addEventListener('click', applyTopic);
  $('downloadButton').addEventListener('click', downloadResult);
  $('hiroMarker').addEventListener('markerFound', () => {
    state.markerVisible = true;
    $('markerNotice').classList.add('found');
    text('markerLabel', 'Marker Hiro terdeteksi');
    text('markerHelp', 'Materi dan soal 3D aktif. Ketuk pilihan untuk menjawab.');
  });
  $('hiroMarker').addEventListener('markerLost', () => {
    state.markerVisible = false;
    $('markerNotice').classList.remove('found');
    text('markerLabel', 'Arahkan kamera ke marker Hiro');
    text('markerHelp', 'Papan belajar dan soal kembali saat marker terdeteksi.');
  });
  for (let i = 0; i < 3; i++) $('arOption' + i).addEventListener('click', () => answer(i));
  $('arContinueHit').addEventListener('click', () => {
    if (state.mode === 'learn') goNext();
    else if (state.stageIndex === stages.length) restartPractice();
  });
  setInterval(renderConnection, 1500);
  renderConnection(); render(); connectMQTT();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
else initialize();
