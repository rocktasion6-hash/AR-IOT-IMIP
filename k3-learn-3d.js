
"use strict";

// ==============================================
// IMIP QUIZ V12
// K3-LEARN-3D.JS
// ==============================================
//
// Pembelajaran APD K3 dengan objek 3D.
//
// Objek:
// 1. Helm keselamatan
// 2. Full-body harness
// 3. Kacamata pelindung
// 4. Respirator partikulat
// 5. Sarung tangan kerja
// 6. Sepatu keselamatan
// 7. Rompi visibilitas
// 8. Pelindung telinga
//
// Semua objek dibuat dari Three.js.
// Objek berputar otomatis.
//
// Bentuk APD merupakan ilustrasi pendidikan,
// bukan replika produk tersertifikasi.
// ==============================================


// ==============================================
// 1. DATA PEMBELAJARAN K3
// ==============================================

window.IMIP_K3_ITEMS = [

  {
    type: "helmet",

    name: "HELM KESELAMATAN",

    description:
      "Melindungi kepala terhadap risiko " +
      "benturan dan benda jatuh sesuai " +
      "jenis helm dan bahaya kerja.",

    check:
      "Periksa retak, suspensi, dan " +
      "ukuran sebelum dipakai."
  },

  {
    type: "harness",

    name: "FULL-BODY HARNESS",

    description:
      "Bagian dari sistem perlindungan jatuh " +
      "saat bekerja di ketinggian; harus " +
      "dipasangkan dengan komponen sistem " +
      "yang sesuai.",

    check:
      "Periksa webbing, jahitan, pengait, " +
      "dan titik sambung."
  },

  {
    type: "goggles",

    name: "KACAMATA PELINDUNG",

    description:
      "Membantu melindungi mata dari " +
      "partikel terbang; pilih tipe yang " +
      "sesuai dengan jenis paparan.",

    check:
      "Periksa lensa, pelindung samping, " +
      "dan kecocokan."
  },

  {
    type: "respirator",

    name: "RESPIRATOR PARTIKEL",

    description:
      "Respirator partikulat yang sesuai " +
      "membantu menyaring debu dan partikel; " +
      "tidak melindungi dari gas atau uap.",

    check:
      "Pastikan jenis filter, kondisi, " +
      "dan kerapatan pas."
  },

  {
    type: "gloves",

    name: "SARUNG TANGAN KERJA",

    description:
      "Melindungi tangan dari bahaya tertentu. " +
      "Bahan sarung tangan harus dipilih " +
      "menurut risiko pekerjaan.",

    check:
      "Periksa robek, ukuran, dan " +
      "kecocokan material."
  },

  {
    type: "boots",

    name: "SEPATU KESELAMATAN",

    description:
      "Alas kaki pelindung membantu mengurangi " +
      "risiko cedera kaki sesuai fitur " +
      "perlindungannya.",

    check:
      "Periksa sol, pelindung jari, " +
      "dan kondisi sepatu."
  },

  {
    type: "vest",

    name: "ROMPI VISIBILITAS",

    description:
      "Rompi berwarna mencolok dan reflektif " +
      "membantu pekerja lebih mudah terlihat " +
      "di area yang sesuai.",

    check:
      "Pastikan ukuran pas dan " +
      "pita reflektif masih baik."
  },

  {
    type: "earmuffs",

    name: "PELINDUNG TELINGA",

    description:
      "Ear muff yang tepat membantu mengurangi " +
      "paparan kebisingan; efektivitas " +
      "bergantung pada kecocokan.",

    check:
      "Periksa bantalan, penutup, dan " +
      "kedapnya pemasangan."
  }

];


// ==============================================
// 2. KOMPONEN THREE.JS
// ==============================================

(function () {

  if (!window.AFRAME) {

    console.error(
      "A-Frame belum dimuat. " +
      "Periksa urutan script."
    );

    return;
  }

  const T = AFRAME.THREE;


  // ============================================
  // 3. MATERIAL 3D
  // ============================================

  function mat(
    color,
    roughness = 0.43,
    metalness = 0.08,
    extra = {}
  ) {

    return new T.MeshStandardMaterial({

      color,
      roughness,
      metalness,

      ...extra
    });
  }


  // ============================================
  // 4. HELPER MENAMBAHKAN MESH
  // ============================================

  function add(
    group,
    geometry,
    material,
    pos = [0, 0, 0],
    rot = [0, 0, 0],
    scale = [1, 1, 1]
  ) {

    const mesh = new T.Mesh(
      geometry,
      material
    );

    mesh.position.set(...pos);

    mesh.rotation.set(...rot);

    mesh.scale.set(...scale);

    group.add(mesh);

    return mesh;
  }


  // ============================================
  // 5. HELPER MEMBUAT KOTAK
  // ============================================

  function box(
    group,
    size,
    position,
    color,
    rotation = [0, 0, 0]
  ) {

    return add(

      group,

      new T.BoxGeometry(...size),

      mat(color),

      position,

      rotation
    );
  }


  // ============================================
  // 6. HELPER MEMBUAT BOLA
  // ============================================

  function sphere(
    group,
    radius,
    position,
    color,
    scale = [1, 1, 1],
    materialOptions = {}
  ) {

    return add(

      group,

      new T.SphereGeometry(
        radius,
        24,
        16
      ),

      mat(
        color,
        0.40,
        0.07,
        materialOptions
      ),

      position,

      [0, 0, 0],

      scale
    );
  }


  // ============================================
  // 7. HELPER MEMBUAT SILINDER
  // ============================================

  function cylinder(
    group,
    radiusTop,
    radiusBottom,
    height,
    position,
    color,
    rotation = [0, 0, 0],
    sides = 24
  ) {

    return add(

      group,

      new T.CylinderGeometry(
        radiusTop,
        radiusBottom,
        height,
        sides
      ),

      mat(color),

      position,

      rotation
    );
  }


  // ============================================
  // 8. HELPER MEMBUAT TALI / PIPA
  // ============================================

  function tube(
    group,
    points,
    radius,
    color
  ) {

    const curve = new T.CatmullRomCurve3(

      points.map(
        point => new T.Vector3(...point)
      )
    );

    return add(

      group,

      new T.TubeGeometry(
        curve,
        Math.max(18, points.length * 8),
        radius,
        7,
        false
      ),

      mat(color)
    );
  }


  // ============================================
  // 9. OBJEK HELM KESELAMATAN
  // ============================================

  function helmet(group) {

    const yellow = "#FFBE16";

    const dark = "#B86B05";

    // Kubah helm
    add(

      group,

      new T.SphereGeometry(
        0.235,
        36,
        18,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2
      ),

      mat(
        yellow,
        0.27
      ),

      [0, -0.07, 0]
    );

    // Tepi helm
    add(

      group,

      new T.TorusGeometry(
        0.233,
        0.020,
        10,
        40
      ),

      mat(dark),

      [0, -0.073, 0],

      [Math.PI / 2, 0, 0]
    );

    // Bagian depan helm
    sphere(

      group,

      0.24,

      [0, -0.096, 0.088],

      yellow,

      [1.05, 0.12, 0.65]
    );

    // Garis tengah helm
    box(

      group,

      [0.032, 0.17, 0.022],

      [0, 0.06, 0.223],

      "#FCE473"
    );

    // Ilustrasi tali bagian dalam
    tube(

      group,

      [
        [-0.15, -0.08, -0.09],
        [-0.16, -0.22, 0],
        [0, -0.26, 0.05],
        [0.16, -0.22, 0],
        [0.15, -0.08, -0.09]
      ],

      0.010,

      "#36443C"
    );

  }


  // ============================================
  // 10. OBJEK FULL-BODY HARNESS
  // ============================================

  function harness(group) {

    // Ilustrasi badan sebagai penyangga
    cylinder(

      group,

      0.13,
      0.18,
      0.38,

      [0, 0.035, -0.038],

      "#A6B8B0"
    );

    // Tali bahu kiri menyilang
    tube(

      group,

      [
        [-0.13, 0.26, 0.09],
        [-0.11, 0.10, 0.16],
        [0.11, -0.08, 0.16],
        [0.13, -0.17, 0.12]
      ],

      0.023,

      "#FD9802"
    );

    // Tali bahu kanan menyilang
    tube(

      group,

      [
        [0.13, 0.26, 0.09],
        [0.11, 0.10, 0.16],
        [-0.11, -0.08, 0.16],
        [-0.13, -0.17, 0.12]
      ],

      0.023,

      "#FD9802"
    );

    // Tali pinggang
    tube(

      group,

      [
        [-0.17, -0.09, 0.13],
        [0, -0.08, 0.19],
        [0.17, -0.09, 0.13]
      ],

      0.025,

      "#2D493C"
    );

    // Tali paha kiri
    tube(

      group,

      [
        [-0.13, -0.10, 0.11],
        [-0.16, -0.29, 0.07],
        [-0.07, -0.32, 0.08],
        [-0.02, -0.11, 0.17]
      ],

      0.019,

      "#FD9802"
    );

    // Tali paha kanan
    tube(

      group,

      [
        [0.13, -0.10, 0.11],
        [0.16, -0.29, 0.07],
        [0.07, -0.32, 0.08],
        [0.02, -0.11, 0.17]
      ],

      0.019,

      "#FD9802"
    );

    // Pengunci depan
    box(

      group,

      [0.065, 0.07, 0.025],

      [0, -0.09, 0.21],

      "#CAD2D4"
    );

    // Cincin sambungan
    add(

      group,

      new T.TorusGeometry(
        0.04,
        0.011,
        8,
        20
      ),

      mat("#C0CBD0"),

      [0, 0.08, 0.19]
    );

  }


  // ============================================
  // 11. OBJEK KACAMATA PELINDUNG
  // ============================================

  function goggles(group) {

    const lensMaterial = mat(
      "#7DD9EE",
      0.10,
      0.05,
      {
        transparent: true,
        opacity: 0.55,
        side: T.DoubleSide
      }
    );

    // Lensa kiri dan kanan
    for (const x of [-0.125, 0.125]) {

      sphere(

        group,

        0.115,

        [x, 0.01, 0.01],

        "#7DD9EE",

        [1, 0.66, 0.22],

        {
          transparent: true,
          opacity: 0.47
        }
      );

      // Bingkai lensa
      add(

        group,

        new T.TorusGeometry(
          0.106,
          0.022,
          9,
          32
        ),

        mat("#183D40"),

        [x, 0.01, 0.048],

        [0, 0, 0],

        [1, 0.70, 1]
      );

    }

    // Jembatan tengah kacamata
    box(

      group,

      [0.078, 0.034, 0.045],

      [0, 0.035, 0.05],

      "#184046"
    );

    // Gagang kiri
    tube(

      group,

      [
        [-0.23, 0.01, 0.005],
        [-0.30, 0.015, -0.06],
        [-0.28, 0.015, -0.14]
      ],

      0.017,

      "#303F3D"
    );

    // Gagang kanan
    tube(

      group,

      [
        [0.23, 0.01, 0.005],
        [0.30, 0.015, -0.06],
        [0.28, 0.015, -0.14]
      ],

      0.017,

      "#303F3D"
    );

  }


  // ============================================
  // 12. OBJEK RESPIRATOR PARTIKEL
  // ============================================

  function respirator(group) {

    // Bagian utama masker
    sphere(

      group,

      0.21,

      [0, 0, 0.025],

      "#F2F3F1",

      [1.12, 0.80, 0.48]
    );

    // Bagian depan respirator
    cylinder(

      group,

      0.045,
      0.075,
      0.06,

      [0, 0.01, 0.135],

      "#AABBBE",

      [Math.PI / 2, 0, 0]
    );

    // Pelat bagian hidung
    box(

      group,

      [0.12, 0.016, 0.014],

      [0, 0.119, 0.105],

      "#77888B"
    );

    // Tali kiri bagian atas
    tube(

      group,

      [
        [-0.18, 0.04, 0.02],
        [-0.29, 0.12, -0.04],
        [-0.28, 0.08, -0.14]
      ],

      0.011,

      "#BECBCD"
    );

    // Tali kanan bagian atas
    tube(

      group,

      [
        [0.18, 0.04, 0.02],
        [0.29, 0.12, -0.04],
        [0.28, 0.08, -0.14]
      ],

      0.011,

      "#BECBCD"
    );

    // Tali bawah kiri
    tube(

      group,

      [
        [-0.17, -0.09, 0.02],
        [-0.30, -0.10, -0.04]
      ],

      0.009,

      "#BECBCD"
    );

    // Tali bawah kanan
    tube(

      group,

      [
        [0.17, -0.09, 0.02],
        [0.30, -0.10, -0.04]
      ],

      0.009,

      "#BECBCD"
    );

  }


  // ============================================
  // 13. OBJEK SARUNG TANGAN
  // ============================================

  function glove(
    group,
    x,
    rotationZ = 0
  ) {

    const hand = new T.Group();

    group.add(hand);

    hand.position.x = x;

    hand.rotation.z = rotationZ;

    // Bagian telapak
    box(

      hand,

      [0.15, 0.20, 0.068],

      [0, -0.085, 0],

      "#F6AD19"
    );

    // Bagian manset
    box(

      hand,

      [0.16, 0.09, 0.075],

      [0, -0.205, 0],

      "#495E55"
    );

    // Empat jari
    for (let i = 0; i < 4; i++) {

      const fingerX =
        -0.055 + i * 0.037;

      const fingerHeight =
        0.155 - 0.012 * Math.abs(i - 1.5);

      cylinder(

        hand,

        0.022,
        0.023,
        fingerHeight,

        [fingerX, 0.086, 0],

        "#F6AD19"
      );

      // Ujung jari
      sphere(

        hand,

        0.022,

        [
          fingerX,
          0.156 - 0.012 * Math.abs(i - 1.5),
          0
        ],

        "#F6AD19"
      );

    }

    // Ibu jari
    cylinder(

      hand,

      0.028,
      0.030,
      0.13,

      [-0.095, -0.03, 0.025],

      "#F6AD19",

      [0, 0, -0.67]
    );

  }


  // Membuat sepasang sarung tangan
  function gloves(group) {

    glove(
      group,
      -0.15,
      -0.18
    );

    glove(
      group,
      0.15,
      0.18
    );

  }


  // ============================================
  // 14. OBJEK SEPATU KESELAMATAN
  // ============================================

  function boots(group) {

    for (const x of [-0.15, 0.15]) {

      // Bagian atas sepatu
      box(

        group,

        [0.17, 0.27, 0.17],

        [x, 0.01, -0.035],

        "#3E4C45"
      );

      // Bagian depan sepatu
      sphere(

        group,

        0.13,

        [x, -0.137, 0.09],

        "#3E4C45",

        [0.85, 0.52, 1.38]
      );

      // Sol sepatu
      box(

        group,

        [0.23, 0.042, 0.36],

        [x, -0.205, 0.065],

        "#202D2C"
      );

      // Aksen sepatu
      box(

        group,

        [0.15, 0.02, 0.015],

        [x, 0.07, 0.054],

        "#EFA32D"
      );

    }

  }


  // ============================================
  // 15. OBJEK ROMPI VISIBILITAS
  // ============================================

  function vest(group) {

    const lime = "#B5E11A";

    const stripe = "#F0F8EF";

    // Bagian kiri rompi
    box(

      group,

      [0.15, 0.38, 0.05],

      [-0.105, -0.015, 0.045],

      lime
    );

    // Bagian kanan rompi
    box(

      group,

      [0.15, 0.38, 0.05],

      [0.105, -0.015, 0.045],

      lime
    );

    // Bahu kiri
    box(

      group,

      [0.07, 0.16, 0.05],

      [-0.16, 0.205, 0.045],

      lime,

      [0, 0, -0.28]
    );

    // Bahu kanan
    box(

      group,

      [0.07, 0.16, 0.05],

      [0.16, 0.205, 0.045],

      lime,

      [0, 0, 0.28]
    );

    // Pita reflektif horizontal
    box(

      group,

      [0.36, 0.055, 0.06],

      [0, -0.125, 0.085],

      stripe
    );

    // Pita reflektif vertikal kiri
    box(

      group,

      [0.055, 0.30, 0.055],

      [-0.09, 0.018, 0.09],

      stripe
    );

    // Pita reflektif vertikal kanan
    box(

      group,

      [0.055, 0.30, 0.055],

      [0.09, 0.018, 0.09],

      stripe
    );

    // Pengunci rompi
    box(

      group,

      [0.027, 0.28, 0.065],

      [0, 0.01, 0.08],

      "#68734E"
    );

  }


  // ============================================
  // 16. OBJEK PELINDUNG TELINGA
  // ============================================

  function earmuffs(group) {

    // Lengkungan atas
    tube(

      group,

      [
        [-0.21, -0.01, 0],
        [-0.20, 0.12, 0],
        [-0.13, 0.23, 0],
        [0, 0.29, 0],
        [0.13, 0.23, 0],
        [0.20, 0.12, 0],
        [0.21, -0.01, 0]
      ],

      0.024,

      "#263B3C"
    );

    // Penutup telinga kiri dan kanan
    for (const x of [-0.23, 0.23]) {

      sphere(

        group,

        0.11,

        [x, -0.06, 0],

        "#FD9802",

        [0.55, 1, 0.92]
      );

      // Bantalan bagian dalam
      sphere(

        group,

        0.082,

        [x * 1.07, -0.06, 0.02],

        "#26443E",

        [0.55, 1, 0.88]
      );

    }

  }


  // ============================================
  // 17. DAFTAR PEMBENTUK OBJEK
  // ============================================

  const BUILDERS = {

    helmet: helmet,

    harness: harness,

    goggles: goggles,

    respirator: respirator,

    gloves: gloves,

    boots: boots,

    vest: vest,

    earmuffs: earmuffs

  };


  // ============================================
  // 18. KOMPONEN A-FRAME K3
  // ============================================

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
      // MEMBUAT GROUP OBJEK 3D
      // ======================================

      init() {

        this.group = new T.Group();

        this.el.object3D.add(
          this.group
        );

      },


      // ======================================
      // PERGANTIAN MODEL APD
      // ======================================

      update() {

        if (!this.group) {
          return;
        }

        // Hapus geometri lama
        this.group.traverse(
          (child) => {

            if (!child.isMesh) {
              return;
            }

            if (child.geometry) {
              child.geometry.dispose();
            }

            const materials =
              Array.isArray(child.material)
                ? child.material
                : [child.material];

            materials.forEach(
              (material) => {

                if (material) {
                  material.dispose();
                }

              }
            );

          }
        );

        this.group.clear();

        // Pilih model sesuai tipe
        const builder =
          BUILDERS[this.data.type] ||
          BUILDERS.helmet;

        // Bentuk model baru
        builder(this.group);

        // Reset rotasi setiap berganti APD
        this.group.rotation.set(
          0,
          0,
          0
        );

      },


      // ======================================
      // ANIMASI PUTAR OTOMATIS
      // ======================================

      tick(time, deltaTime) {

        if (!this.el.object3D.visible) {
          return;
        }

        // Putaran secara perlahan
        this.group.rotation.y +=

          Math.min(
            deltaTime || 16,
            40
          ) * 0.0005;

        // Gerakan melayang naik turun
        this.group.position.y =

          0.010 * Math.sin(
            time * 0.0017
          );

      },


      // ======================================
      // MEMBERSIHKAN OBJEK 3D
      // ======================================

      remove() {

        if (!this.group) {
          return;
        }

        // Bersihkan mesh
        this.group.traverse(
          (child) => {

            if (!child.isMesh) {
              return;
            }

            if (child.geometry) {
              child.geometry.dispose();
            }

            const materials =
              Array.isArray(child.material)
                ? child.material
                : [child.material];

            materials.forEach(
              (material) => {

                if (material) {
                  material.dispose();
                }

              }
            );

          }
        );

        this.el.object3D.remove(
          this.group
        );

      }

    }
  );

})();
