
// =====================================
// SOP-AR IMIP - MINDAR V1
// TEST PENDETEKSIAN LOGO IMIP
// =====================================

document.addEventListener("DOMContentLoaded", () => {

  const scene = document.getElementById("arScene");

  const target = document.getElementById("imipTarget");

  const status = document.getElementById("markerStatus");

  // Kamera AR siap
  scene.addEventListener("arReady", () => {
    status.textContent = "Arahkan kamera ke logo IMIP";
  });

  // Jika kamera gagal
  scene.addEventListener("arError", () => {
    status.textContent =
      "Gagal membuka kamera atau memuat target";
  });

  // Ketika logo IMIP terdeteksi
  target.addEventListener("targetFound", () => {

    console.log("Logo IMIP terdeteksi");

    status.textContent = "Logo IMIP terdeteksi";

    status.classList.add("found");

  });

  // Ketika logo tidak terlihat kamera
  target.addEventListener("targetLost", () => {

    console.log("Logo IMIP tidak terdeteksi");

    status.textContent = "Arahkan kamera ke logo IMIP";

    status.classList.remove("found");

  });

});
