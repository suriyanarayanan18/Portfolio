/* ── Portfolio Language Switcher ──
   Add this script tag to the bottom of index.html, before </body>
   Usage: <script src="translate.js"></script>
*/

(function () {
  // ── Config ──
  const LANGUAGES = [
    { code: "en", label: "EN", name: "English" },
    { code: "ta", label: "தமிழ்", name: "Tamil" },
    { code: "es", label: "ES", name: "Español" }
  ];

  let currentLang = "en";
  let originalTexts = {}; // Store originals for reverting
  let translationCache = {}; // Cache translations per language

  // ── CSS for the language switcher ──
  const style = document.createElement("style");
  style.textContent = `
    .lang-switcher {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 10000;
      display: flex;
      gap: 6px;
      background: #111;
      border: 1px solid #2a2a2a;
      border-radius: 12px;
      padding: 6px 8px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .lang-btn {
      padding: 8px 14px;
      border: 1px solid transparent;
      border-radius: 8px;
      background: transparent;
      color: #999;
      font-family: -apple-system, sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .lang-btn:hover {
      color: #fff;
      background: rgba(255,255,255,0.05);
    }
    .lang-btn.active {
      color: #f97316;
      border-color: rgba(249,115,22,0.4);
      background: rgba(249,115,22,0.08);
    }
    .lang-btn.loading {
      opacity: 0.5;
      pointer-events: none;
    }
    .lang-loading-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, #f97316, #fb923c);
      z-index: 10001;
      transition: width 0.3s ease;
      border-radius: 0 2px 2px 0;
    }
    @media (max-width: 600px) {
      .lang-switcher {
        bottom: 16px;
        right: 16px;
      }
      .lang-btn {
        padding: 6px 10px;
        font-size: 12px;
      }
    }
  `;
  document.head.appendChild(style);

  // ── Selectors for translatable elements ──
  // These CSS selectors target the text content on your portfolio
  const TRANSLATABLE_SELECTORS = [
    // Hero
    ".hero_kicker",
    ".hero_title",
    ".hero_subtitle",
    ".hero_scroll",
    // About section
    ".sectionTitle",
    ".sectionNote",
    ".aboutText .lead",
    ".aboutText p:not(.lead)",
    ".pill",
    // Timeline
    ".timelineRole",
    ".timelineOrg",
    // Project cards
    ".projectTitle",
    ".projectDesc",
    ".projectMeta",
    // Skills
    ".skillLabel",
    ".skillBlock h3",
    ".skillBlock li",
    // Certifications
    ".certTitle",
    ".certMeta",
    // Contact
    ".contactLabel",
    // Footer
    ".footerTitle",
    // Buttons (only text content)
    ".btn"
  ];

  // ── Gather all translatable text ──
  function gatherTexts() {
    const elements = [];
    const texts = [];

    TRANSLATABLE_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        const text = el.textContent.trim();
        if (text && text.length > 0 && text.length < 500) {
          elements.push(el);
          texts.push(text);
        }
      });
    });

    return { elements, texts };
  }

  // ── Store originals on first run ──
  function storeOriginals() {
    if (Object.keys(originalTexts).length > 0) return;

    const { elements, texts } = gatherTexts();
    elements.forEach((el, i) => {
      el.dataset.translateId = i;
      originalTexts[i] = texts[i];
    });
  }

  // ── Restore English ──
  function restoreEnglish() {
    Object.keys(originalTexts).forEach(id => {
      const el = document.querySelector(`[data-translate-id="${id}"]`);
      if (el) el.textContent = originalTexts[id];
    });
    currentLang = "en";
    updateButtons();
  }

  // ── Translate to target language ──
  async function translateTo(langCode) {
    if (langCode === "en") {
      restoreEnglish();
      return;
    }

    storeOriginals();

    // Check cache
    if (translationCache[langCode]) {
      applyTranslations(translationCache[langCode]);
      currentLang = langCode;
      updateButtons();
      return;
    }

    // Show loading
    showLoading(true);
    setButtonsLoading(true);

    const texts = Object.values(originalTexts);

    try {
      // Split into batches of 25 to avoid token limits
      const batchSize = 25;
      const allTranslated = [];

      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        updateLoadingBar((i / texts.length) * 100);

        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts: batch, targetLang: langCode })
        });

        if (!response.ok) {
          throw new Error("Translation API failed");
        }

        const data = await response.json();
        allTranslated.push(...data.translated);
      }

      // Cache the results
      const translationMap = {};
      Object.keys(originalTexts).forEach((id, i) => {
        translationMap[id] = allTranslated[i] || originalTexts[id];
      });

      translationCache[langCode] = translationMap;
      applyTranslations(translationMap);
      currentLang = langCode;

    } catch (error) {
      console.error("Translation error:", error);
      // Silently fall back to English
      restoreEnglish();
    }

    showLoading(false);
    setButtonsLoading(false);
    updateButtons();
  }

  // ── Apply translations to DOM ──
  function applyTranslations(translationMap) {
    Object.keys(translationMap).forEach(id => {
      const el = document.querySelector(`[data-translate-id="${id}"]`);
      if (el) el.textContent = translationMap[id];
    });
  }

  // ── UI: Create language switcher ──
  function createSwitcher() {
    const container = document.createElement("div");
    container.className = "lang-switcher";
    container.id = "langSwitcher";

    LANGUAGES.forEach(lang => {
      const btn = document.createElement("button");
      btn.className = "lang-btn" + (lang.code === "en" ? " active" : "");
      btn.dataset.lang = lang.code;
      btn.textContent = lang.label;
      btn.title = lang.name;
      btn.addEventListener("click", () => translateTo(lang.code));
      container.appendChild(btn);
    });

    document.body.appendChild(container);

    // Create loading bar (hidden initially)
    const bar = document.createElement("div");
    bar.className = "lang-loading-bar";
    bar.id = "langLoadingBar";
    bar.style.width = "0%";
    bar.style.display = "none";
    document.body.appendChild(bar);
  }

  function updateButtons() {
    document.querySelectorAll(".lang-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lang === currentLang);
    });
  }

  function setButtonsLoading(loading) {
    document.querySelectorAll(".lang-btn").forEach(btn => {
      btn.classList.toggle("loading", loading);
    });
  }

  function showLoading(show) {
    const bar = document.getElementById("langLoadingBar");
    if (bar) {
      bar.style.display = show ? "block" : "none";
      if (!show) bar.style.width = "0%";
    }
  }

  function updateLoadingBar(percent) {
    const bar = document.getElementById("langLoadingBar");
    if (bar) bar.style.width = Math.min(percent + 10, 95) + "%";
  }

  // ── Initialize ──
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      storeOriginals();
      createSwitcher();
    });
  } else {
    storeOriginals();
    createSwitcher();
  }
})();