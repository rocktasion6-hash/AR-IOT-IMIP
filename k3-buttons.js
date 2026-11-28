
"use strict";

// IMIP QUIZ V17 - NAVIGASI BELAJAR K3

(function () {

  function setup() {

    const panel = document.getElementById("k3Learn3d");
    const dock = document.getElementById("touchDock");

    if (!panel) return;

    const style = document.createElement("style");

    style.textContent = `
      #k3FixedNav {
        position: fixed;
        bottom: max(14px, env(safe-area-inset-bottom));
        left: 12px;
        right: 12px;
        max-width: 540px;
        margin: auto;
        display: grid;
        grid-template-columns: 1fr 1.25fr 1.1fr;
        gap: 8px;
        z-index: 100;
      }

      #k3FixedNav[hidden] {
        display: none !important;
      }

      #k3FixedNav button {
        min-height: 64px;
        padding: 10px 4px;
        border-radius: 14px;
        font-weight: 800;
        font-size: clamp(12px, 3.5vw, 16px);
        line-height: 1.2;
        cursor: pointer;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        border: 2px solid transparent;
        box-shadow: 0 4px 0 #073D2266;
      }

      #k3FixedNav button:active:not(:disabled) {
        transform: translateY(3px);
        box-shadow: 0 1px 0 #073D2266;
      }

      #k3FixedNav .menu {
        background: #86D101;
        color: #164B20;
      }

      #k3FixedNav .prev {
        background: #E8F6DF;
        color: #166127;
      }

      #k3FixedNav .next {
        background: #FD9802;
        color: #FFFFFF;
      }

      #k3FixedNav button:disabled {
        opacity: 0.45;
      }
    `;

    document.head.appendChild(style);

    const nav = document.createElement("nav");

    nav.id = "k3FixedNav";
    nav.hidden = true;

    nav.innerHTML = `
      <button type="button" class="menu" data-nav="home">
        MENU
      </button>

      <button type="button" class="prev" data-nav="k3-prev">
        SEBELUMNYA
      </button>

      <button type="button" class="next" data-nav="next">
        BERIKUTNYA
      </button>
    `;

    document.body.appendChild(nav);

    const prev = nav.querySelector(".prev");
    const next = nav.querySelector(".next");

    function sync() {

      const active =
        state.screen === "learn" &&
        state.category === "k3";

      nav.hidden = !active;

      if (!active) return;

      if (dock) dock.hidden = true;

      const total =
        (window.IMIP_K3_ITEMS || []).length;

      prev.disabled = state.lessonIndex === 0;

      next.disabled = total === 0;

      next.textContent =
        state.lessonIndex === total - 1
          ? "MULAI SOAL"
          : "BERIKUTNYA";
    }

    nav.querySelectorAll("button").forEach(button => {

      button.addEventListener("click", () => {

        if (
          state.screen !== "learn" ||
          state.category !== "k3"
        ) return;

        handleAction(button.dataset.nav);

        sync();
      });

    });

    // Ketika masuk atau keluar halaman Belajar K3
    new MutationObserver(sync).observe(panel, {
      attributes: true,
      attributeFilter: ["visible"]
    });

    sync();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }

})();
