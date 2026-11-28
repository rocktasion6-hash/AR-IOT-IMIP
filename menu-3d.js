
"use strict";

// ============================================
// IMIP QUIZ - MINDAR V9
// MENU 3D DENGAN THREE.JS
// ============================================

(function () {

  if (!window.AFRAME) {
    console.error(
      "menu-3d.js: A-Frame belum dimuat."
    );
    return;
  }

  const THREE = AFRAME.THREE;

  const FONT_URL =
    "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/fonts/helvetiker_bold.typeface.json";

  const C = {
    green: "#058901",
    greenDark: "#045B12",
    greenLight: "#86D101",
    orange: "#FD9802",
    orangeDark: "#AD5900",
    white: "#FFFFFF",
    cream: "#F7FFF1"
  };

  // ==========================================
  // MATERIAL
  // ==========================================

  function mat(
    color,
    metalness = 0.12,
    roughness = 0.35
  ) {
    return new THREE.MeshStandardMaterial({
      color,
      metalness,
      roughness
    });
  }

  // ==========================================
  // BENTUK SUDUT MELENGKUNG
  // ==========================================

  function roundedShape(w, h, r) {

    r = Math.min(r, w / 2, h / 2);

    const s = new THREE.Shape();

    const x = -w / 2;
    const y = -h / 2;

    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);

    s.quadraticCurveTo(
      x + w,
      y,
      x + w,
      y + r
    );

    s.lineTo(x + w, y + h - r);

    s.quadraticCurveTo(
      x + w,
      y + h,
      x + w - r,
      y + h
    );

    s.lineTo(x + r, y + h);

    s.quadraticCurveTo(
      x, y + h,
      x, y + h - r
    );

    s.lineTo(x, y + r);

    s.quadraticCurveTo(
      x, y,
      x + r, y
    );

    return s;
  }

  // ==========================================
  // PANEL 3D BERLAPIS
  // ==========================================

  function plate(
    group,
    w, h, d,
    x, y, frontZ,
    front, side,
    radius
  ) {

    const geometry = new THREE.ExtrudeGeometry(
      roundedShape(w, h, radius),
      {
        depth: d,
        steps: 1,
        curveSegments: 8,

        bevelEnabled: true,
        bevelSize: 0.003,
        bevelThickness: 0.003,
        bevelSegments: 3
      }
    );

    const mesh = new THREE.Mesh(
      geometry,
      [
        mat(front),
        mat(side)
      ]
    );

    mesh.position.set(
      x,
      y,
      frontZ - d
    );

    group.add(mesh);

    return mesh;
  }

  // ==========================================
  // KUBUS DEKORATIF
  // ==========================================

  function cube(
    group,
    x, y, z,
    size,
    color
  ) {

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        size,
        size,
        size
      ),
      mat(color, 0.18, 0.25)
    );

    mesh.position.set(x, y, z);

    mesh.rotation.set(
      0.35,
      0.45,
      0.22
    );

    group.add(mesh);

    return mesh;
  }

  // ==========================================
  // GARIS DEKORATIF
  // ==========================================

  function line(
    group,
    x, y, z,
    w, h,
    angle,
    color
  ) {

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, 0.012),
      mat(color, 0.08, 0.32)
    );

    mesh.position.set(x, y, z);

    mesh.rotation.z = angle;

    group.add(mesh);

    return mesh;
  }

  // ==========================================
  // MEMBACA OUTLINE FONT
  // ==========================================

  function outlines(text, font, size) {

    const shapes = [];

    const scale =
      size / font.resolution;

    let offsetX = 0;

    for (const ch of text) {

      const glyph =
        font.glyphs[ch] ||
        font.glyphs["?"];

      if (!glyph) continue;

      const path = new THREE.ShapePath();

      if (glyph.o) {

        const items =
          glyph.o.trim().split(/\s+/);

        for (
          let i = 0;
          i < items.length;
        ) {

          const op = items[i++];

          const nx = () =>
            Number(items[i++]) * scale + offsetX;

          const ny = () =>
            Number(items[i++]) * scale;

          if (op === "m") {
            path.moveTo(nx(), ny());
          }

          else if (op === "l") {
            path.lineTo(nx(), ny());
          }

          else if (op === "q") {

            const x = nx();
            const y = ny();

            const cx = nx();
            const cy = ny();

            path.quadraticCurveTo(
              cx, cy, x, y
            );
          }

          else if (op === "b") {

            const x = nx();
            const y = ny();

            const c1x = nx();
            const c1y = ny();

            const c2x = nx();
            const c2y = ny();

            path.bezierCurveTo(
              c1x, c1y,
              c2x, c2y,
              x, y
            );
          }
        }
      }

      shapes.push(...path.toShapes());

      offsetX +=
        glyph.ha * scale;
    }

    return shapes;
  }

  // ==========================================
  // JUDUL IMIP QUIZ TIMBUL
  // ==========================================

  function heading3D(parent, font) {

    const depth = 0.033;

    const geometry =
      new THREE.ExtrudeGeometry(
        outlines("IMIP QUIZ", font, 0.17),
        {
          depth,
          steps: 1,
          curveSegments: 8,

          bevelEnabled: true,
          bevelSize: 0.004,
          bevelThickness: 0.004,
          bevelSegments: 3
        }
      );

    geometry.computeBoundingBox();

    if (!geometry.boundingBox) return;

    const b = geometry.boundingBox;

    const scale = Math.min(
      1,
      0.91 /
      Math.max(
        b.max.x - b.min.x,
        0.001
      )
    );

    geometry.translate(
      -(b.max.x + b.min.x) / 2,
      -(b.max.y + b.min.y) / 2,
      -depth / 2
    );

    // Lapisan oranye di belakang huruf
    const rear = new THREE.Mesh(
      geometry.clone(),
      mat(C.orange)
    );

    rear.position.set(
      0.009,
      0.468,
      0.183
    );

    rear.scale.set(
      scale * 1.08,
      scale * 1.12,
      scale
    );

    parent.add(rear);

    // Huruf hijau depan
    const front = new THREE.Mesh(
      geometry,
      [
        mat(C.green, 0.15, 0.23),
        mat(C.greenDark)
      ]
    );

    front.position.set(
      0,
      0.481,
      0.207
    );

    front.scale.setScalar(scale);

    parent.add(front);
  }

  // ==========================================
  // KOMPONEN MENU AR
  // ==========================================

  AFRAME.registerComponent(
    "imip-menu-3d",
    {

      init() {

        this.moving = [];
        this.owned = [];

        const root =
          this.el.object3D;

        const add = (mesh) => {
          this.owned.push(mesh);
          return mesh;
        };

        // ================================
        // PAPAN PUTIH BINGKAI HIJAU-ORANYE
        // ================================

        add(plate(
          root,
          1.25, 1.08, 0.09,
          0, -0.006, 0.015,
          C.green,
          C.greenDark,
          0.105
        ));

        add(plate(
          root,
          1.21, 1.045, 0.06,
          0, 0.001, 0.055,
          C.orange,
          C.orangeDark,
          0.10
        ));

        add(plate(
          root,
          1.16, 1.00, 0.031,
          0, 0.012, 0.103,
          C.white,
          "#E2EFCF",
          0.095
        ));

        // ================================
        // HEADER IMIP QUIZ
        // ================================

        add(plate(
          root,
          1.02, 0.18, 0.035,
          0, 0.475, 0.148,
          C.orange,
          C.orangeDark,
          0.060
        ));

        add(plate(
          root,
          0.984, 0.150, 0.022,
          0, 0.480, 0.170,
          C.white,
          "#DBEACF",
          0.050
        ));

        add(line(
          root,
          0, 0.345, 0.15,
          0.88, 0.018,
          0,
          C.orange
        ));

        // ================================
        // EMPAT KARTU 3D
        // ================================

        const cards = [
          {
            id: "cardLearnPP",
            tone: C.white
          },
          {
            id: "cardLearnK3",
            tone: "#EBFFD9"
          },
          {
            id: "cardQuizPP",
            tone: C.white
          },
          {
            id: "cardQuizK3",
            tone: "#EBFFD9"
          }
        ];

        for (const item of cards) {

          const entity =
            document.getElementById(item.id);

          if (!entity) {
            console.warn(
              "Kartu menu tidak ditemukan:",
              item.id
            );
            continue;
          }

          const group = entity.object3D;

          // Lapisan oranye di belakang
          add(plate(
            group,
            0.515, 0.228, 0.044,
            0.005, -0.008, 0.161,
            C.orange,
            C.orangeDark,
            0.044
          ));

          // Permukaan putih/hijau
          add(plate(
            group,
            0.490, 0.210, 0.028,
            0, 0.008, 0.193,
            item.tone,
            "#C1DFB1",
            0.036
          ));

          // Garis hijau di sisi kartu
          add(line(
            group,
            -0.216, 0.004, 0.200,
            0.016, 0.13,
            0,
            C.greenLight
          ));
        }

        // ================================
        // KUBUS DEKORATIF
        // ================================

        this.moving.push(add(cube(
          root,
          -0.625, 0.37, 0.14,
          0.11,
          C.greenLight
        )));

        this.moving.push(add(cube(
          root,
          0.625, 0.31, 0.14,
          0.10,
          C.orange
        )));

        this.moving.push(add(cube(
          root,
          -0.62, -0.42, 0.14,
          0.075,
          C.orange
        )));

        this.moving.push(add(cube(
          root,
          0.62, -0.41, 0.14,
          0.075,
          C.greenLight
        )));

        // ================================
        // GARIS PANCARAN
        // ================================

        add(line(
          root,
          -0.625, -0.06, 0.12,
          0.02, 0.15,
          -0.9,
          C.orange
        ));

        add(line(
          root,
          0.625, -0.06, 0.12,
          0.02, 0.15,
          0.9,
          C.greenLight
        ));

        // ================================
        // FONT JUDUL 3D
        // ================================

        const label =
          document.getElementById(
            "menuTitleFallback"
          );

        fetch(FONT_URL)

          .then(response => {

            if (!response.ok) {
              throw new Error(
                "HTTP " + response.status
              );
            }

            return response.json();
          })

          .then(font => {

            if (!this.el.isConnected) return;

            heading3D(root, font);

            if (label) {
              label.setAttribute(
                "visible",
                false
              );
            }
          })

          .catch(error => {

            console.warn(
              "Font judul menu gagal dimuat; " +
              "teks cadangan tetap dipakai:",
              error
            );
          });
      },

      // ================================
      // ANIMASI KUBUS
      // ================================

      tick(time) {

        const menu =
          document.getElementById("menu3d");

        if (
          !menu ||
          menu.getAttribute("visible") === false
        ) {
          return;
        }

        for (
          let i = 0;
          i < this.moving.length;
          i++
        ) {

          const mesh = this.moving[i];

          mesh.rotation.y =
            (i % 2 ? -1 : 1) *
            time * 0.00042 + i;

          mesh.rotation.z =
            Math.sin(
              time * 0.0011 + i
            ) * 0.18;
        }
      },

      // ================================
      // MEMBERSIHKAN GEOMETRI
      // ================================

      remove() {

        for (const mesh of this.owned || []) {

          if (mesh.parent) {
            mesh.parent.remove(mesh);
          }

          if (mesh.geometry) {
            mesh.geometry.dispose();
          }

          if (Array.isArray(mesh.material)) {

            mesh.material.forEach(
              material => material.dispose()
            );

          } else if (mesh.material) {

            mesh.material.dispose();
          }
        }
      }
    }
  );

})();
