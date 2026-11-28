
"use strict";

// ========================================
// IMIP QUIZ - MINDAR V10
// CONTENT-3D.JS
// ========================================

// Desain 3D untuk:
// - Pembelajaran PP / K3
// - Latihan soal
// - Pilihan jawaban A, B, C
// - Hasil nilai
//
// Tidak menggunakan gambar tambahan.
// ========================================

(function () {

  if (!window.AFRAME) {

    console.error(
      "content-3d.js: A-Frame belum dimuat."
    );

    return;
  }

  const T = AFRAME.THREE;

  // ======================================
  // 1. WARNA TEMA IMIP
  // ======================================

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


  // ======================================
  // 2. MATERIAL 3D
  // ======================================

  function mat(
    color,
    metalness = 0.10,
    roughness = 0.33
  ) {

    return new T.MeshStandardMaterial({

      color,
      metalness,
      roughness

    });
  }


  // ======================================
  // 3. BENTUK SUDUT MELENGKUNG
  // ======================================

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

    const s = new T.Shape();

    s.moveTo(x + r, y);

    s.lineTo(
      x + width - r,
      y
    );

    s.quadraticCurveTo(
      x + width,
      y,
      x + width,
      y + r
    );

    s.lineTo(
      x + width,
      y + height - r
    );

    s.quadraticCurveTo(
      x + width,
      y + height,
      x + width - r,
      y + height
    );

    s.lineTo(
      x + r,
      y + height
    );

    s.quadraticCurveTo(
      x,
      y + height,
      x,
      y + height - r
    );

    s.lineTo(
      x,
      y + r
    );

    s.quadraticCurveTo(
      x,
      y,
      x + r,
      y
    );

    return s;
  }


  // ======================================
  // 4. MEMBUAT PAPAN 3D BERLAPIS
  // ======================================

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

    const geometry = new T.ExtrudeGeometry(

      roundedShape(
        width,
        height,
        radius
      ),

      {

        depth,

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
        mat(faceColor, 0.12, 0.31),
        mat(sideColor, 0.08, 0.42)
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


  // ======================================
  // 5. GARIS AKSEN 3D
  // ======================================

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

    const mesh = new T.Mesh(

      new T.BoxGeometry(
        width,
        height,
        0.012
      ),

      mat(color, 0.08, 0.35)

    );

    mesh.position.set(x, y, z);

    mesh.rotation.z = angle;

    parent.add(mesh);

    return mesh;
  }


  // ======================================
  // 6. KUBUS DEKORATIF
  // ======================================

  function cube(
    parent,
    size,
    x,
    y,
    z,
    color
  ) {

    const mesh = new T.Mesh(

      new T.BoxGeometry(
        size,
        size,
        size
      ),

      mat(color, 0.20, 0.26)

    );

    mesh.position.set(x, y, z);

    mesh.rotation.set(
      0.25,
      0.40,
      0.35
    );

    parent.add(mesh);

    return mesh;
  }


  // ======================================
  // 7. KOMPONEN CONTENT 3D
  // ======================================

  AFRAME.registerComponent(
    "imip-content-3d",
    {

      init() {

        this.owned = [];

        this.cubes = [];

        const root =
          this.el.object3D;

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


        // =================================
        // VALIDASI ELEMEN
        // =================================

        if (
          !choicesEntity ||
          !homeEntity ||
          !nextEntity
        ) {

          console.error(
            "V10: worldChoices, homeGroup " +
            "atau nextGroup tidak ditemukan."
          );

          return;
        }


        const choices =
          choicesEntity.object3D;

        const home =
          homeEntity.object3D;

        const next =
          nextEntity.object3D;


        // Simpan mesh untuk dibersihkan
        const own = (mesh) => {

          this.owned.push(mesh);

          return mesh;
        };


        // =================================
        // 8. PAPAN UTAMA 3D
        // =================================

        // Bingkai hijau tua
        own(plate(
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
        ));


        // Lapisan oranye
        own(plate(
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
        ));


        // Permukaan papan putih
        own(plate(
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
        ));


        // =================================
        // 9. HEADER HIJAU 3D
        // =================================

        own(plate(
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
        ));


        // Garis oranye di bawah header
        own(bar(
          root,

          0.99,
          0.014,

          0,
          0.610,
          0.198,

          C.orange
        ));


        // =================================
        // 10. KARTU MATERI / SOAL
        // =================================

        // Lapisan oranye
        own(plate(
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
        ));


        // Permukaan hijau sangat muda
        own(plate(
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
        ));


        // Aksen garis hijau
        own(bar(
          root,

          0.016,
          0.34,

          -0.512,
          0.320,
          0.224,

          C.lime
        ));


        // Aksen oranye kecil
        own(bar(
          root,

          0.19,
          0.014,

          0.400,
          0.538,
          0.225,

          C.orange
        ));


        // =================================
        // 11. KUBUS DEKORATIF
        // =================================

        this.cubes.push(
          own(cube(
            root,
            0.095,

            -0.64,
            0.64,
            0.19,

            C.lime
          ))
        );


        this.cubes.push(
          own(cube(
            root,
            0.088,

            0.64,
            0.60,
            0.19,

            C.orange
          ))
        );


        this.cubes.push(
          own(cube(
            root,
            0.067,

            -0.64,
            -0.57,
            0.19,

            C.orange
          ))
        );


        this.cubes.push(
          own(cube(
            root,
            0.067,

            0.64,
            -0.57,
            0.19,

            C.lime
          ))
        );


        // Garis dekoratif kiri
        own(bar(
          root,

          0.022,
          0.15,

          -0.650,
          0.100,
          0.130,

          C.orange,
          -0.80
        ));


        // Garis dekoratif kanan
        own(bar(
          root,

          0.022,
          0.15,

          0.650,
          0.100,
          0.130,

          C.lime,
          0.80
        ));


        // =================================
        // 12. TIGA KARTU JAWABAN 3D
        // =================================

        // Letak jawaban A, B, C
        const answerY = [
          -0.115,
          -0.317,
          -0.519
        ];


        answerY.forEach((y, i) => {

          // Bingkai dan ketebalan kartu
          own(plate(
            choices,

            1.120,
            0.174,
            0.038,

            0.005,
            y - 0.008,
            0.208,

            i === 1
              ? C.lime
              : C.orange,

            i === 1
              ? C.green
              : C.burnt,

            0.045
          ));


          // Garis aksen tiap pilihan
          own(bar(
            choices,

            0.014,
            0.111,

            -0.505,
            y,
            0.251,

            i === 1
              ? C.orange
              : C.green
          ));

        });


        // =================================
        // 13. TOMBOL MENU 3D
        // =================================

        own(plate(
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
        ));


        // =================================
        // 14. TOMBOL LANJUT 3D
        // =================================

        own(plate(
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
        ));

      },


      // =================================
      // 15. ANIMASI DEKORASI
      // =================================

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

            mesh.rotation.y =
              (
                i % 2 === 0
                  ? 1
                  : -1
              ) *
              time *
              0.00038 + i;

            mesh.rotation.z = Math.sin(
              time * 0.001 + i
            ) * 0.20;

          }
        );

      },


      // =================================
      // 16. MEMBERSIHKAN GEOMETRI
      // =================================

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
