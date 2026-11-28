
"use strict";

// ============================================
// IMIP QUIZ V14
// PEMBELAJARAN K3 - 8 MODEL GLB REALISTIS
// ============================================

// DATA PEMBELAJARAN
window.IMIP_K3_ITEMS = [
  {
    type: "helmet",
    name: "HELM KESELAMATAN",
    description:
      "Melindungi kepala terhadap risiko " +
      "benturan dan benda jatuh sesuai " +
      "jenis helm dan bahaya kerja.",
    check:
      "Periksa retak, suspensi, dan ukuran " +
      "sebelum dipakai."
  },

  {
    type: "harness",
    name: "FULL-BODY HARNESS",
    description:
      "Bagian dari sistem perlindungan jatuh " +
      "saat bekerja di ketinggian dan harus " +
      "digunakan dengan sistem pendukung " +
      "yang sesuai.",
    check:
      "Periksa webbing, jahitan, pengait, " +
      "dan titik sambung."
  },

  {
    type: "goggles",
    name: "KACAMATA PELINDUNG",
    description:
      "Membantu melindungi mata dari partikel " +
      "terbang. Pilih jenis pelindung yang " +
      "sesuai dengan bahaya pekerjaan.",
    check:
      "Periksa lensa, bingkai, dan " +
      "kecocokan saat dipakai."
  },

  {
    type: "respirator",
    name: "RESPIRATOR",
    description:
      "Respirator yang tepat dapat membantu " +
      "melindungi pernapasan dari kontaminan " +
      "tertentu, bergantung pada jenis dan " +
      "filter yang dipakai.",
    check:
      "Pastikan filter sesuai bahaya, " +
      "kondisi baik, dan seal wajah rapat."
  },

  {
    type: "gloves",
    name: "SARUNG TANGAN KERJA",
    description:
      "Membantu melindungi tangan dari bahaya " +
      "tertentu. Pilih material sesuai risiko " +
      "dan tugas pekerjaan.",
    check:
      "Periksa robekan, ukuran, dan " +
      "kecocokan material."
  },

  {
    type: "boots",
    name: "SEPATU KESELAMATAN",
    description:
      "Alas kaki keselamatan membantu " +
      "mengurangi risiko cedera kaki sesuai " +
      "fitur perlindungan yang dimilikinya.",
    check:
      "Periksa pelindung jari, sol, " +
      "dan kondisi sepatu."
  },

  {
    type: "vest",
    name: "ROMPI VISIBILITAS",
    description:
      "Warna mencolok dan material reflektif " +
      "membantu pekerja lebih mudah terlihat " +
      "dalam kondisi yang sesuai.",
    check:
      "Periksa pita reflektif, ukuran, " +
      "dan bagian pengikat."
  },

  {
    type: "earmuffs",
    name: "PELINDUNG TELINGA",
    description:
      "Ear muff yang tepat membantu " +
      "mengurangi paparan kebisingan ketika " +
      "dipilih dan dikenakan dengan benar.",
    check:
      "Periksa bantalan telinga, headband, " +
      "dan kerapatan pas."
  }
];


// ============================================
// KOMPONEN MODEL APD
// ============================================

(function () {

  if (!window.AFRAME) {
    console.error(
      "IMIP K3: A-Frame belum dimuat."
    );
    return;
  }

  const THREE = AFRAME.THREE;

  const MODEL_FOLDER = "./models/k3/";

  // Ukuran terbesar objek dalam panel AR
  const MAX_SIZE = 0.54;

  // ==========================================
  // NAMA FILE ASLI YANG KAMU UNGGAH
  // ==========================================

  const MODEL_FILES = {
    helmet: "yellow-hard-hat.glb",
    harness: "fall-arrest-harness.glb",
    goggles: "safety-goggles.glb",
    respirator: "half-mask-respirator.glb",
    gloves: "leather-work-gloves.glb",
    boots: "steel-toe-work-boots.glb",
    vest: "hi-vis-vest-on-form (1).glb",
    earmuffs: "safety-ear-defenders.glb"
  };


  // ==========================================
  // MEMBUAT ALAMAT FILE YANG AMAN
  // ==========================================

  function modelUrl(filename) {

    const encoded = encodeURIComponent(
      filename
    ).replace(
      /[()]/g,
      (character) =>
        "%" +
        character.charCodeAt(0)
          .toString(16)
          .toUpperCase()
    );

    return MODEL_FOLDER + encoded;
  }


  // ==========================================
  // MENGHITUNG UKURAN LOKAL MODEL 3D
  // ==========================================

  function getLocalBounds(root) {

    root.updateWorldMatrix(
      true,
      true
    );

    const inverseRoot =
      root.matrixWorld.clone().invert();

    const bounds =
      new THREE.Box3().makeEmpty();

    root.traverse((node) => {

      if (
        !node.isMesh ||
        !node.geometry
      ) {
        return;
      }

      if (!node.geometry.boundingBox) {
        node.geometry.computeBoundingBox();
      }

      if (!node.geometry.boundingBox) {
        return;
      }

      const localBox =
        node.geometry.boundingBox.clone();

      const relativeMatrix =
        new THREE.Matrix4().multiplyMatrices(
          inverseRoot,
          node.matrixWorld
        );

      localBox.applyMatrix4(
        relativeMatrix
      );

      bounds.union(localBox);
    });

    return bounds;
  }


  // ==========================================
  // REGISTER KOMPONEN A-FRAME
  // ==========================================

  AFRAME.registerComponent(
    "k3-apd-model",
    {

      schema: {
        type: {
          type: "string",
          default: "helmet"
        }
      },


      // ======================================
      // 1. INISIALISASI
      // ======================================

      init() {

        this.modelEntity = null;

        // Kelompok objek khusus untuk rotasi
        this.pivotEl =
          document.createElement("a-entity");

        this.el.appendChild(
          this.pivotEl
        );

        // Tulisan status tidak ikut berputar
        this.statusEl =
          document.createElement("a-text");

        this.statusEl.setAttribute(
          "align",
          "center"
        );

        this.statusEl.setAttribute(
          "baseline",
          "center"
        );

        this.statusEl.setAttribute(
          "width",
          "0.55"
        );

        this.statusEl.setAttribute(
          "wrap-count",
          "21"
        );

        this.statusEl.setAttribute(
          "position",
          "0 0 0.16"
        );

        this.statusEl.setAttribute(
          "color",
          "#285C37"
        );

        this.el.appendChild(
          this.statusEl
        );
      },


      // ======================================
      // 2. MENAMPILKAN STATUS MODEL
      // ======================================

      showStatus(message, error = false) {

        if (!this.statusEl) return;

        this.statusEl.setAttribute(
          "value",
          message
        );

        this.statusEl.setAttribute(
          "visible",
          Boolean(message)
        );

        this.statusEl.setAttribute(
          "color",
          error ? "#B45316" : "#285C37"
        );
      },


      // ======================================
      // 3. MEMUAT MODEL SESUAI JENIS APD
      // ======================================

      update() {

        if (
          !this.pivotEl ||
          !this.statusEl
        ) {
          return;
        }

        const filename =
          MODEL_FILES[this.data.type];

        if (!filename) {

          this.showStatus(
            "JENIS APD TIDAK DIKENAL",
            true
          );

          return;
        }

        // Hapus model sebelumnya
        if (this.modelEntity) {

          this.modelEntity.remove();

          this.modelEntity = null;
        }

        // Reset animasi
        this.pivotEl.object3D.rotation.set(
          0, 0, 0
        );

        this.pivotEl.object3D.position.set(
          0, 0, 0
        );

        this.showStatus(
          "MEMUAT MODEL 3D..."
        );

        const entity =
          document.createElement("a-entity");

        const path =
          modelUrl(filename);

        this.modelEntity = entity;


        // ====================================
        // MODEL BERHASIL DIMUAT
        // ====================================

        entity.addEventListener(
          "model-loaded",
          () => {

            if (
              this.modelEntity !== entity
            ) {
              return;
            }

            const model =
              entity.getObject3D("mesh");

            if (!model) {

              this.showStatus(
                "MODEL TIDAK TERBACA",
                true
              );

              return;
            }

            const root =
              entity.object3D;

            root.position.set(0, 0, 0);
            root.rotation.set(0, 0, 0);
            root.scale.setScalar(1);

            // Hitung ukuran model
            const bounds =
              getLocalBounds(root);

            if (bounds.isEmpty()) {

              this.showStatus(
                "UKURAN MODEL TIDAK TERBACA",
                true
              );

              return;
            }

            const dimensions =
              bounds.getSize(
                new THREE.Vector3()
              );

            const center =
              bounds.getCenter(
                new THREE.Vector3()
              );

            const longest = Math.max(
              dimensions.x,
              dimensions.y,
              dimensions.z
            );

            if (
              !Number.isFinite(longest) ||
              longest <= 0
            ) {

              this.showStatus(
                "UKURAN MODEL TIDAK VALID",
                true
              );

              return;
            }

            // =================================
            // PUSATKAN DAN SESUAIKAN UKURAN
            // =================================

            const factor =
              MAX_SIZE / longest;

            root.scale.setScalar(
              factor
            );

            root.position.set(
              -center.x * factor,
              -center.y * factor,
              -center.z * factor
            );

            // Material dan tekstur asli
            // dari file GLB dipertahankan.

            this.showStatus("");

            console.log(
              "IMIP K3: model berhasil dimuat:",
              filename
            );
          }
        );


        // ====================================
        // MODEL GAGAL DIMUAT
        // ====================================

        entity.addEventListener(
          "model-error",
          (error) => {

            if (
              this.modelEntity !== entity
            ) {
              return;
            }

            this.showStatus(
              "GAGAL MEMUAT MODEL",
              true
            );

            console.error(
              "Gagal memuat:",
              path,
              error.detail
            );
          }
        );


        // Tambahkan objek ke papan AR
        this.pivotEl.appendChild(
          entity
        );

        // Muat file GLB
        entity.setAttribute(
          "gltf-model",
          `url(${path})`
        );
      },


      // ======================================
      // 4. ANIMASI ROTASI 3D OTOMATIS
      // ======================================

      tick(time, delta) {

        const panel =
          document.getElementById(
            "k3Learn3d"
          );

        if (
          !panel ||
          !panel.object3D.visible ||
          !this.modelEntity ||
          !this.pivotEl
        ) {
          return;
        }

        const model =
          this.modelEntity.getObject3D(
            "mesh"
          );

        if (!model) {
          return;
        }

        const pivot =
          this.pivotEl.object3D;

        // Rotasi 360 derajat secara halus
        pivot.rotation.y +=
          Math.min(delta || 16, 50) *
          0.00042;

        // Objek sedikit melayang
        pivot.position.y =
          0.008 *
          Math.sin(time * 0.0016);
      },


      // ======================================
      // 5. MEMBERSIHKAN OBJEK
      // ======================================

      remove() {

        if (this.modelEntity) {
          this.modelEntity.remove();
        }

        if (this.statusEl) {
          this.statusEl.remove();
        }

        if (this.pivotEl) {
          this.pivotEl.remove();
        }

        this.modelEntity = null;
        this.statusEl = null;
        this.pivotEl = null;
      }

    }
  );

})();
