
"use strict";

// ==============================================
// IMIP QUIZ - MINDAR V11
// CONTENT-3D.JS
// ==============================================

// Desain 3D untuk:
// - Materi PP dan K3
// - Latihan soal
// - Pilihan A, B, C
// - Hasil nilai
// - Tombol MENU dan LANJUT
//
// Desain welcome dan menu tidak diubah.
// ==============================================

console.log(
  "IMIP QUIZ V11: content-3d.js berhasil dimuat"
);

(function () {

  // ============================================
  // 1. PERIKSA A-FRAME
  // ============================================

  if (!window.AFRAME) {

    console.error(
      "A-Frame belum tersedia untuk content-3d.js"
    );

    return;
  }

  const T = AFRAME.THREE;

  // ============================================
  // 2. WARNA IMIP
  // ============================================

  const C = {

    green: "#058901",

    dark: "#045B12",

    lime: "#86D101",

    orange: "#FD9802",

    burnt: "#A65A00",

    white: "#FFFFFF",

    pale: "#F5FFF0",

    border: "#D9ECCF"

  };

  // ============================================
  // 3. MATERIAL THREE.JS
  // ============================================

  function mat(
    color,
    metalness = 0.10,
    roughness = 0.33
  ) {

    return new T.MeshStandardMaterial({

      color: color,

      metalness: metalness,

      roughness: roughness

    });
  }

  // ============================================
  // 4. MEMBUAT SUDUT MELENGKUNG
  // ============================================

  function roundedShape(
    width,
    height,
    radius
  ) {

    const r = Math.min(
      radius,
      width / 2,
      height / 2
    );

    const x = -width / 2;
    const y = -height / 2;

    const shape = new T.Shape();

    shape.moveTo(
      x + r,
      y
    );

    shape.lineTo(
      x + width - r,
      y
    );

    shape.quadraticCurveTo(
      x + width,
      y,
      x + width,
      y + r
    );

    shape.lineTo(
      x + width,
      y + height - r
    );

    shape.quadraticCurveTo(
      x + width,
      y + height,
      x + width - r,
      y + height
    );

    shape.lineTo(
      x + r,
      y + height
    );

    shape.quadraticCurveTo(
      x,
      y + height,
      x,
      y + height - r
    );

    shape.lineTo(
      x,
      y + r
    );

    shape.quadraticCurveTo(
      x,
      y,
      x + r,
      y
    );

    return shape;
  }

  // ============================================
  // 5. MEMBUAT PAPAN 3D
  // ============================================

  function plate(
    parent,
    width,
    height,
    depth,
    x,
    y,
    frontZ,
    faceColor,
    sideColor,
    radius = 0.05
  ) {

    const shape = roundedShape(
      width,
      height,
      radius
    );

    const geometry = new T.ExtrudeGeometry(

      shape,

      {

        depth: depth,

        steps: 1,

        curveSegments: 10,

        bevelEnabled: true,

        bevelThickness: 0.003,

        bevelSize: 0.004,

        bevelSegments: 3

      }
    );

    const mesh = new T.Mesh(

      geometry,

      [

        mat(
          faceColor,
          0.12,
          0.31
        ),

        mat(
          sideColor,
          0.08,
          0.42
        )

      ]
    );

    mesh.position.set(
      x,
      y,
      frontZ - depth
    );

    parent.add(mesh);

    return mesh;
  }

  // ============================================
  // 6. MEMBUAT GARIS AKSEN 3D
  // ============================================

  function bar(
    parent,
    width,
    height,
    x,
    y,
    z,
    color,
    angle = 0
  ) {

    const geometry = new T.BoxGeometry(
      width,
      height,
      0.012
    );

    const mesh = new T.Mesh(
      geometry,
      mat(color, 0.08, 0.35)
    );

    mesh.position.set(
      x,
      y,
      z
    );

    mesh.rotation.z = angle;

    parent.add(mesh);

    return mesh;
  }

  // ============================================
  // 7. MEMBUAT KUBUS 3D
  // ============================================

  function cube(
    parent,
    size,
    x,
    y,
    z,
    color
  ) {

    const geometry = new T.BoxGeometry(
      size,
      size,
      size
    );

    const mesh = new T.Mesh(
      geometry,
      mat(color, 0.20, 0.26)
    );

    mesh.position.set(
      x,
      y,
      z
    );

    mesh.rotation.set(
      0.25,
      0.40,
      0.35
    );

    parent.add(mesh);

    return mesh;
  }

  // ============================================
  // 8. KOMPONEN CONTENT 3D
  // ============================================

  AFRAME.registerComponent(
    "imip-content-3d",
    {

      // ========================================
      // MEMBUAT SELURUH OBJEK
      // ========================================

      init() {

        console.log(
          "IMIP QUIZ V11: komponen 3D diinisialisasi"
        );

        this.owned = [];

        this.cubes = [];

        const root = this.el.object3D;

        // ====================================
        // ELEMEN HTML A-FRAME
        // ====================================

        const choicesEntity =
          document.getElementById(
            "worldChoices"
          );

        const homeEntity =
          document.getElementById(
            "homeGroup"
          );

        const nextEntity =
          document.getElementById(
            "nextGroup"
          );

        // ====================================
        // VALIDASI
        // ====================================

        if (
          !choicesEntity ||
          !homeEntity ||
          !nextEntity
        ) {

          console.error(
            "V11: Ada elemen content3d yang tidak ditemukan"
          );

          return;
        }

        const choices =
          choicesEntity.object3D;

        const home =
          homeEntity.object3D;

        const next =
          nextEntity.object3D;

        // Menyimpan mesh
        const own = (mesh) => {

          this.owned.push(mesh);

          return mesh;
        };

        // ====================================
        // 9. PAPAN UTAMA 3D
        // ====================================

        // LAPISAN HIJAU TUA
        own(
          plate(
            root,

            1.31,
            1.90,
            0.100,

            0,
            0,
            0.038,

            C.dark,
            "#023A16",

            0.105
          )
        );

        // LAPISAN ORANYE
        own(
          plate(
            root,

            1.27,
            1.86,
            0.066,

            0,
            0.009,
            0.080,

            C.orange,
            C.burnt,

            0.100
          )
        );

        // LAPISAN PUTIH
        own(
          plate(
            root,

            1.22,
            1.81,
            0.038,

            0,
            0.018,
            0.124,

            C.white,
            C.border,

            0.095
          )
        );

        // ====================================
        // 10. HEADER HIJAU
        // ====================================

        own(
          plate(
            root,

            1.11,
            0.235,
            0.033,

            0,
            0.746,
            0.179,

            C.green,
            C.dark,

            0.062
          )
        );

        // GARIS ORANYE HEADER
        own(
          bar(
            root,

            0.99,
            0.014,

            0,
            0.610,
            0.198,

            C.orange
          )
        );

        // ====================================
        // 11. KARTU PERTANYAAN
        // ====================================

        // DASAR ORANYE
        own(
          plate(
            root,

            1.115,
            0.495,
            0.036,

            0,
            0.316,
            0.180,

            C.orange,
            C.burnt,

            0.068
          )
        );

        // PERMUKAAN HIJAU MUDA
        own(
          plate(
            root,

            1.087,
            0.469,
            0.021,

            0,
            0.328,
            0.209,

            C.pale,
            C.border,

            0.057
          )
        );

        // AKSEN HIJAU SAMPING
        own(
          bar(
            root,

            0.016,
            0.34,

            -0.512,
            0.320,
            0.224,

            C.lime
          )
        );

        // AKSEN ORANYE ATAS
        own(
          bar(
            root,

            0.19,
            0.014,

            0.400,
            0.538,
            0.225,

            C.orange
          )
        );

        // ====================================
        // 12. KUBUS DEKORASI
        // ====================================

        this.cubes.push(
          own(
            cube(
              root,

              0.095,

              -0.64,
              0.64,
              0.19,

              C.lime
            )
          )
        );

        this.cubes.push(
          own(
            cube(
              root,

              0.088,

              0.64,
              0.60,
              0.19,

              C.orange
            )
          )
        );

        this.cubes.push(
          own(
            cube(
              root,

              0.067,

              -0.64,
              -0.57,
              0.19,

              C.orange
            )
          )
        );

        this.cubes.push(
          own(
            cube(
              root,

              0.067,

              0.64,
              -0.57,
              0.19,

              C.lime
            )
          )
        );

        // ====================================
        // 13. GARIS DEKORASI
        // ====================================

        // GARIS KIRI
        own(
          bar(
            root,

            0.022,
            0.15,

            -0.650,
            0.100,
            0.130,

            C.orange,
            -0.80
          )
        );

        // GARIS KANAN
        own(
          bar(
            root,

            0.022,
            0.15,

            0.650,
            0.100,
            0.130,

            C.lime,
            0.80
          )
        );

        // ====================================
        // 14. KARTU JAWABAN A B C
        // ====================================

        const answerY = [
          -0.115,
          -0.317,
          -0.519
        ];

        answerY.forEach(
          (y, i) => {

            // Lapisan bingkai jawaban
            own(
              plate(
                choices,

                1.120,
                0.174,
                0.038,

                0.005,
                y - 0.008,

                // Posisi lapisan depan V11
                0.232,

                i === 1
                  ? C.lime
                  : C.orange,

                i === 1
                  ? C.green
                  : C.burnt,

                0.045
              )
            );

            // Garis aksen di kiri
            own(
              bar(
                choices,

                0.014,
                0.111,

                -0.505,
                y,
                0.251,

                i === 1
                  ? C.orange
                  : C.green
              )
            );
          }
        );

        // ====================================
        // 15. TOMBOL MENU
        // ====================================

        own(
          plate(
            home,

            0.525,
            0.154,
            0.045,

            0,
            -0.008,
            0.205,

            C.lime,
            C.green,

            0.045
          )
        );

        // ====================================
        // 16. TOMBOL LANJUT
        // ====================================

        own(
          plate(
            next,

            0.525,
            0.154,
            0.045,

            0,
            -0.008,
            0.205,

            C.orange,
            C.burnt,

            0.045
          )
        );

        console.log(
          "IMIP QUIZ V11: papan materi dan soal 3D berhasil dibuat"
        );
      },

      // ========================================
      // 17. ANIMASI KUBUS
      // ========================================

      tick(time) {

        const content =
          document.getElementById(
            "content3d"
          );

        if (
          !content ||
          !content.object3D.visible
        ) {
          return;
        }

        this.cubes.forEach(
          (mesh, i) => {

            // Rotasi kubus
            mesh.rotation.y =
              (
                i % 2 === 0
                  ? 1
                  : -1
              ) *
              time *
              0.00038 + i;

            // Gerakan halus
            mesh.rotation.z = Math.sin(
              time * 0.001 + i
            ) * 0.20;
          }
        );
      },

      // ========================================
      // 18. MEMBERSIHKAN GEOMETRI
      // ========================================

      remove() {

        (this.owned || []).forEach(
          (mesh) => {

            if (mesh.parent) {
              mesh.parent.remove(mesh);
            }

            if (mesh.geometry) {
              mesh.geometry.dispose();
            }

            const materials =
              Array.isArray(mesh.material)
                ? mesh.material
                : [mesh.material];

            materials.forEach(
              (m) => {

                if (m) {
                  m.dispose();
                }
              }
            );
          }
        );

        this.owned = [];

        this.cubes = [];
      }
    }
  );

})();
