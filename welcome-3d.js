
"use strict";

// ============================================
// IMIP QUIZ - MINDAR V8
// WELCOME-3D.JS
// ============================================
// Membuat pembuka AR menggunakan Three.js.
//
// Objek yang dibuat:
// - Papan putih berlapis
// - Bingkai hijau dan oranye
// - Huruf IMIP 3D hijau
// - Huruf QUIZ 3D oranye
// - Logo kecil geometris
// - Kubus dekorasi 3D
// - Garis pancaran
// - Tombol MULAI 3D
// - Animasi dekorasi
//
// Tidak menggunakan gambar PNG/JPG.
// ============================================

(function () {

  // ==========================================
  // 1. PERIKSA A-FRAME
  // ==========================================

  if (!window.AFRAME) {

    console.error(
      "A-Frame belum dimuat."
    );

    return;
  }

  const T = AFRAME.THREE;


  // ==========================================
  // 2. MATERIAL 3D
  // ==========================================

  function material(
    color,
    metalness = 0.10,
    roughness = 0.34
  ) {

    return new T.MeshStandardMaterial({

      color: color,

      metalness: metalness,

      roughness: roughness

    });
  }


  // ==========================================
  // 3. MEMBUAT BENTUK SUDUT MELENGKUNG
  // ==========================================

  function roundedShape(w, h, r) {

    const shape = new T.Shape();

    const x = -w / 2;

    const y = -h / 2;

    shape.moveTo(
      x + r,
      y
    );

    shape.lineTo(
      x + w - r,
      y
    );

    shape.quadraticCurveTo(
      x + w,
      y,
      x + w,
      y + r
    );

    shape.lineTo(
      x + w,
      y + h - r
    );

    shape.quadraticCurveTo(
      x + w,
      y + h,
      x + w - r,
      y + h
    );

    shape.lineTo(
      x + r,
      y + h
    );

    shape.quadraticCurveTo(
      x,
      y + h,
      x,
      y + h - r
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


  // ==========================================
  // 4. MEMBUAT PAPAN 3D
  // ==========================================

  function plate(
    parent,
    w,
    h,
    depth,
    x,
    y,
    frontZ,
    front,
    side,
    radius = 0.055
  ) {

    const geometry = new T.ExtrudeGeometry(

      roundedShape(w, h, radius),

      {

        depth: depth,

        steps: 1,

        bevelEnabled: true,

        bevelThickness: 0.004,

        bevelSize: 0.005,

        bevelSegments: 3,

        curveSegments: 8

      }
    );

    const mesh = new T.Mesh(

      geometry,

      [
        material(front),
        material(side)
      ]
    );

    mesh.position.set(
      x,
      y,
      frontZ - depth
    );

    mesh.receiveShadow = true;

    parent.add(mesh);

    return mesh;
  }


  // ==========================================
  // 5. MEMBUAT KUBUS 3D
  // ==========================================

  function cube(
    parent,
    x,
    y,
    z,
    size,
    color,
    rotationY = 20
  ) {

    const geometry = new T.BoxGeometry(
      size,
      size,
      size
    );

    const mesh = new T.Mesh(

      geometry,

      material(
        color,
        0.18,
        0.28
      )
    );

    mesh.position.set(
      x,
      y,
      z
    );

    mesh.rotation.set(
      0.32,
      rotationY * Math.PI / 180,
      0.35
    );

    parent.add(mesh);

    return mesh;
  }


  // ==========================================
  // 6. MEMBUAT GARIS PANCARAN
  // ==========================================

  function ray(
    parent,
    x,
    y,
    angle,
    length,
    color
  ) {

    const geometry = new T.BoxGeometry(
      0.023,
      length,
      0.012
    );

    const mesh = new T.Mesh(

      geometry,

      material(
        color,
        0,
        0.48
      )
    );

    mesh.position.set(
      x,
      y,
      -0.012
    );

    mesh.rotation.z = angle;

    parent.add(mesh);

    return mesh;
  }


  // ==========================================
  // 7. MEMBUAT LENGKUNGAN ORANYE
  // ==========================================

  function tube(
    parent,
    points,
    color,
    radius = 0.010
  ) {

    const curve = new T.CatmullRomCurve3(

      points.map(
        point => new T.Vector3(...point)
      )

    );

    const geometry = new T.TubeGeometry(
      curve,
      40,
      radius,
      6,
      false
    );

    const mesh = new T.Mesh(

      geometry,

      material(
        color,
        0.12,
        0.30
      )
    );

    parent.add(mesh);

    return mesh;
  }


  // ==========================================
  // 8. MEMBUAT BENTUK HURUF DARI DATA FONT
  // ==========================================

  function fontShapes(
    text,
    fontData,
    size
  ) {

    const shapes = [];

    const scale =
      size / fontData.resolution;

    let offsetX = 0;

    for (const char of text) {

      const glyph =
        fontData.glyphs[char] ||
        fontData.glyphs["?"];

      if (!glyph) continue;

      const path = new T.ShapePath();

      if (glyph.o) {

        const outline =
          glyph.o.split(" ");

        for (
          let i = 0;
          i < outline.length;
        ) {

          const operation =
            outline[i++];

          const nextX = () =>
            Number(outline[i++]) *
            scale + offsetX;

          const nextY = () =>
            Number(outline[i++]) *
            scale;

          // Awal path
          if (operation === "m") {

            path.moveTo(
              nextX(),
              nextY()
            );
          }

          // Garis lurus
          else if (operation === "l") {

            path.lineTo(
              nextX(),
              nextY()
            );
          }

          // Lengkungan quadratic
          else if (operation === "q") {

            const x = nextX();
            const y = nextY();

            const controlX = nextX();
            const controlY = nextY();

            path.quadraticCurveTo(
              controlX,
              controlY,
              x,
              y
            );
          }

          // Lengkungan bezier
          else if (operation === "b") {

            const x = nextX();
            const y = nextY();

            const c1x = nextX();
            const c1y = nextY();

            const c2x = nextX();
            const c2y = nextY();

            path.bezierCurveTo(
              c1x,
              c1y,
              c2x,
              c2y,
              x,
              y
            );
          }
        }
      }

      shapes.push(
        ...path.toShapes()
      );

      offsetX += glyph.ha * scale;
    }

    return shapes;
  }


  // ==========================================
  // 9. MEMBUAT TULISAN 3D
  // ==========================================

  function word3d(
    parent,
    font,
    text,
    x,
    y,
    z,
    options = {}
  ) {

    const depth =
      options.depth || 0.045;

    const size =
      options.size || 0.26;

    const geometry = new T.ExtrudeGeometry(

      fontShapes(
        text,
        font,
        size
      ),

      {

        depth: depth,

        steps: 1,

        curveSegments: 8,

        bevelEnabled: true,

        bevelThickness: 0.006,

        bevelSize: 0.006,

        bevelSegments: 3

      }
    );

    geometry.computeBoundingBox();

    const bounds = geometry.boundingBox;

    if (!bounds) return;

    const width =
      bounds.max.x - bounds.min.x;

    const scale = Math.min(
      1,
      (options.maxWidth || 0.95) /
      Math.max(width, 0.001)
    );

    // Pusatkan teks
    geometry.translate(

      -(bounds.min.x + bounds.max.x) / 2,

      -(bounds.min.y + bounds.max.y) / 2,

      -depth / 2

    );

    geometry.computeBoundingBox();


    // ======================================
    // 10. GRADASI WARNA HURUF
    // ======================================

    const positions =
      geometry.attributes.position;

    const colors = new Float32Array(
      positions.count * 3
    );

    const bottomColor = new T.Color(
      options.bottom || "#76D612"
    );

    const topColor = new T.Color(
      options.top || "#087D14"
    );

    const height = Math.max(

      0.001,

      geometry.boundingBox.max.y -
      geometry.boundingBox.min.y

    );

    const sample = new T.Color();

    for (
      let i = 0;
      i < positions.count;
      i++
    ) {

      const factor = T.MathUtils.clamp(

        (
          positions.getY(i) -
          geometry.boundingBox.min.y
        ) / height,

        0,
        1
      );

      sample.copy(
        bottomColor
      ).lerp(
        topColor,
        factor
      );

      colors[i * 3] = sample.r;

      colors[i * 3 + 1] = sample.g;

      colors[i * 3 + 2] = sample.b;
    }

    geometry.setAttribute(

      "color",

      new T.BufferAttribute(
        colors,
        3
      )

    );


    // ======================================
    // 11. LAPISAN PUTIH BELAKANG HURUF
    // ======================================

    const outline = new T.Mesh(

      geometry.clone(),

      material(
        "#FFFFFF",
        0,
        0.40
      )

    );

    outline.position.set(

      x + 0.008,

      y - 0.012,

      z - 0.035

    );

    outline.scale.set(

      scale * 1.06,

      scale * 1.13,

      scale

    );

    parent.add(outline);


    // ======================================
    // 12. PERMUKAAN HURUF BERGRADASI
    // ======================================

    const frontMaterial =
      new T.MeshStandardMaterial({

        vertexColors: true,

        metalness: 0.12,

        roughness: 0.25

      });

    const sideMaterial = material(

      options.side || "#075713",

      0.05,

      0.36

    );

    const mesh = new T.Mesh(

      geometry,

      [
        frontMaterial,
        sideMaterial
      ]

    );

    mesh.position.set(
      x,
      y,
      z
    );

    mesh.scale.setScalar(scale);

    parent.add(mesh);
  }


  // ==========================================
  // 13. DAFTARKAN KOMPONEN A-FRAME
  // ==========================================

  AFRAME.registerComponent(
    "imip-welcome-3d",
    {

      init() {

        const root =
          this.el.object3D;

        const buttonElement =
          document.getElementById(
            "startButton3d"
          );

        if (!buttonElement) {

          console.error(
            "startButton3d tidak ditemukan"
          );

          return;
        }

        const button =
          buttonElement.object3D;

        this.moving = [];


        // ====================================
        // 14. DEKORASI SINAR BELAKANG PAPAN
        // ====================================

        for (
          let i = 0;
          i < 9;
          i++
        ) {

          const angle =
            (i / 8) * Math.PI -
            Math.PI / 2;

          const x =
            Math.sin(angle) * 0.52;

          const y =
            Math.cos(angle) * 0.38 +
            0.025;

          ray(

            root,

            x,
            y,

            -angle,

            0.20,

            i % 2
              ? "#FFAA17"
              : "#8DDC12"

          );
        }


        // ====================================
        // 15. PAPAN UTAMA 3D
        // ====================================

        // Bingkai hijau tebal
        plate(

          root,

          1.23,
          0.80,
          0.10,

          0,
          0.020,
          0.015,

          "#138B11",
          "#034B18",

          0.12

        );

        // Bingkai oranye
        plate(

          root,

          1.19,
          0.77,
          0.055,

          0,
          0.026,
          0.044,

          "#FD9802",
          "#B45A00",

          0.115

        );

        // Latar putih depan
        plate(

          root,

          1.15,
          0.73,
          0.028,

          0,
          0.034,
          0.077,

          "#FFFFFF",
          "#DCE8D4",

          0.105

        );


        // ====================================
        // 16. PLAKAT LOGO IMIP KECIL
        // ====================================

        plate(

          root,

          0.43,
          0.18,
          0.045,

          0,
          0.435,
          0.105,

          "#FFFFFF",
          "#4AA21A",

          0.065

        );

        // Lengkungan oranye IMIP
        tube(

          root,

          [
            [-0.17, 0.411, 0.125],
            [-0.085, 0.452, 0.125],
            [0, 0.461, 0.125],
            [0.085, 0.452, 0.125],
            [0.17, 0.411, 0.125]
          ],

          "#FD9802",

          0.009

        );


        // ====================================
        // 17. KUBUS DEKORASI 3D
        // ====================================

        this.moving.push(

          cube(
            root,
            -0.59,
            0.31,
            0.13,
            0.12,
            "#85D900"
          )

        );

        this.moving.push(

          cube(
            root,
            0.59,
            0.29,
            0.13,
            0.11,
            "#FFAA10"
          )

        );

        this.moving.push(

          cube(
            root,
            -0.59,
            -0.32,
            0.13,
            0.09,
            "#FD9802"
          )

        );

        this.moving.push(

          cube(
            root,
            0.59,
            -0.31,
            0.13,
            0.087,
            "#8DDB16"
          )

        );


        // Garis samping kiri
        ray(

          root,
          -0.63,
          0,

          -1,

          0.18,

          "#FD9802"

        );

        // Garis samping kanan
        ray(

          root,
          0.63,
          0,

          1,

          0.18,

          "#FD9802"

        );


        // ====================================
        // 18. TOMBOL MULAI 3D
        // ====================================

        // Lapisan dasar oranye
        plate(

          button,

          0.87,
          0.19,
          0.075,

          0,
          -0.016,
          0.023,

          "#FD9802",
          "#B96400",

          0.085

        );

        // Badan tombol hijau
        plate(

          button,

          0.83,
          0.175,
          0.050,

          0,
          0.006,
          0.076,

          "#188D09",
          "#055B15",

          0.079

        );

        // Permukaan tombol hijau terang
        plate(

          button,

          0.76,
          0.145,
          0.013,

          0,
          0.016,
          0.084,

          "#34BA0C",
          "#128012",

          0.066

        );


        // ====================================
        // 19. IKON PLAY PUTIH
        // ====================================

        const triangle = new T.Shape();

        triangle.moveTo(
          -0.34,
          -0.036
        );

        triangle.lineTo(
          -0.34,
          0.054
        );

        triangle.lineTo(
          -0.25,
          0.009
        );

        triangle.closePath();

        const triangleGeometry =
          new T.ExtrudeGeometry(

            triangle,

            {
              depth: 0.015,

              bevelEnabled: true,

              bevelSize: 0.003,

              bevelThickness: 0.002,

              bevelSegments: 2
            }

          );

        const play = new T.Mesh(

          triangleGeometry,

          material("#FFFFFF")

        );

        play.position.z = 0.094;

        button.add(play);


        // ====================================
        // 20. TEKS CADANGAN
        // ====================================

        // Teks A-Frame ditampilkan sementara
        // sampai font huruf 3D selesai dimuat.

        const labels = [

          [
            "IMIP",
            "0 0.17 0.13",
            "0.90",
            "#159914"
          ],

          [
            "QUIZ",
            "0 -0.115 0.13",
            "0.99",
            "#FD9802"
          ],

          [
            "IMIP",
            "0 0.443 0.14",
            "0.34",
            "#159914"
          ]

        ];

        const temporaryLabels = labels.map(
          ([value, position, width, color]) => {

            const element =
              document.createElement("a-text");

            element.setAttribute(
              "value",
              value
            );

            element.setAttribute(
              "position",
              position
            );

            element.setAttribute(
              "align",
              "center"
            );

            element.setAttribute(
              "width",
              width
            );

            element.setAttribute(
              "color",
              color
            );

            this.el.appendChild(element);

            return element;
          }
        );


        // Teks MULAI sementara
        const startLabel =
          document.createElement("a-text");

        startLabel.setAttribute(
          "value",
          "MULAI"
        );

        startLabel.setAttribute(
          "position",
          "0 -0.014 0.11"
        );

        startLabel.setAttribute(
          "width",
          "0.55"
        );

        startLabel.setAttribute(
          "align",
          "center"
        );

        startLabel.setAttribute(
          "color",
          "#FFFFFF"
        );

        buttonElement.appendChild(
          startLabel
        );

        temporaryLabels.push(
          startLabel
        );


        // ====================================
        // 21. MEMUAT FONT UNTUK HURUF 3D
        // ====================================

        // Font berupa data outline JSON.
        // Tidak ada gambar PNG/JPG.

        const fontURL =
          "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/fonts/helvetiker_bold.typeface.json";

        fetch(fontURL)

          .then((response) => {

            if (!response.ok) {

              throw new Error(
                "Font HTTP " + response.status
              );
            }

            return response.json();
          })

          .then((font) => {

            // =================================
            // HURUF IMIP HIJAU
            // =================================

            word3d(

              root,

              font,

              "IMIP",

              0,
              0.17,
              0.143,

              {
                size: 0.27,

                maxWidth: 0.96,

                top: "#008518",

                bottom: "#7CD40A",

                side: "#075819"
              }

            );


            // =================================
            // HURUF QUIZ ORANYE
            // =================================

            word3d(

              root,

              font,

              "QUIZ",

              0,
              -0.13,
              0.155,

              {
                size: 0.275,

                maxWidth: 1.07,

                top: "#FFC718",

                bottom: "#FC7900",

                side: "#9D4600"
              }

            );


            // =================================
            // HURUF IMIP DI PLAKAT ATAS
            // =================================

            word3d(

              root,

              font,

              "IMIP",

              0,
              0.447,
              0.147,

              {
                size: 0.094,

                maxWidth: 0.31,

                top: "#008719",

                bottom: "#5FC015",

                side: "#075819",

                depth: 0.021
              }

            );


            // =================================
            // TULISAN MULAI 3D
            // =================================

            word3d(

              button,

              font,

              "MULAI",

              0.075,
              0.010,
              0.112,

              {
                size: 0.085,

                maxWidth: 0.47,

                top: "#FFFFFF",

                bottom: "#FFFFFF",

                side: "#D8E8D8",

                depth: 0.017
              }

            );


            // Semua tulisan 3D sudah dibuat.
            // Sembunyikan teks cadangan.

            temporaryLabels.forEach(
              (element) => {

                element.setAttribute(
                  "visible",
                  false
                );

              }
            );

            console.log(
              "IMIP QUIZ: huruf 3D berhasil dibuat"
            );

          })

          .catch((error) => {

            // Jika font gagal diambil dari CDN,
            // teks A-Frame tetap terlihat.

            console.warn(
              "Font 3D gagal dimuat. " +
              "Teks cadangan tetap digunakan.",
              error
            );

          });
      },


      // ====================================
      // 22. ANIMASI KUBUS 3D
      // ====================================

      tick(time) {

        if (!this.moving) return;

        this.moving.forEach(
          (mesh, index) => {

            // Rotasi kubus
            mesh.rotation.y =

              time *

              (
                index % 2
                  ? -0.00035
                  : 0.00035
              )

              + index;


            // Gerakan halus
            mesh.rotation.z = Math.sin(

              time * 0.001 + index

            ) * 0.18;

          }
        );
      }
    }
  );

})();
