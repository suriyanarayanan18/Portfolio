(() => {
  const API_ENDPOINT = "/api/translate";

  const LANGS = {
    en: "English",
    es: "Spanish",
    ta: "Tamil"
  };

  const cache = {
    en: null,
    es: null,
    ta: null
  };

  let targets = [];
  let currentLang = "en";
  let isBusy = false;

  function shouldSkipText(text) {
    const t = String(text || "").trim();

    if (!t) return true;
    if (t.length < 2) return true;
    if (/^[\d\s\-–—•|/\\.,:;!?()[\]{}'"`~@#$%^&*_+=<>]+$/.test(t)) return true;
    if (/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(t)) return true;
    if (/^(https?:\/\/|www\.)/i.test(t)) return true;

    return false;
  }

  function hasNoTranslateAncestor(node) {
    let el = node.parentElement;
    while (el) {
      if (el.dataset && el.dataset.noTranslate === "true") return true;
      el = el.parentElement;
    }
    return false;
  }

  function collectTextTargets() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;

          const tag = parent.tagName;
          if (["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "SVG"].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }

          if (hasNoTranslateAncestor(node)) {
            return NodeFilter.FILTER_REJECT;
          }

          if (shouldSkipText(node.nodeValue)) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const found = [];
    let node;

    while ((node = walker.nextNode())) {
      found.push({
        type: "text",
        node,
        original: node.nodeValue
      });
    }

    document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((el) => {
      if (el.closest('[data-no-translate="true"]')) return;

      const ph = el.getAttribute("placeholder");
      if (!shouldSkipText(ph)) {
        found.push({
          type: "placeholder",
          node: el,
          original: ph
        });
      }
    });

    targets = found;
    cache.en = targets.map((t) => t.original);
  }

  function applyTranslations(lang, translatedList) {
    targets.forEach((target, i) => {
      const value = translatedList[i] || target.original;

      if (target.type === "text") {
        target.node.nodeValue = value;
      } else if (target.type === "placeholder") {
        target.node.setAttribute("placeholder", value);
      }
    });

    document.documentElement.lang = lang;
    currentLang = lang;
    updateActiveButton();
  }

  function restoreEnglish() {
    if (!cache.en) return;
    applyTranslations("en", cache.en);
  }

  function updateActiveButton() {
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === currentLang);
    });
  }

  function setStatus(text, isError = false) {
    const el = document.getElementById("langStatus");
    if (!el) return;
    el.textContent = text;
    el.style.color = isError ? "#ff8a8a" : "#8a8a8a";
  }

  async function translatePage(lang) {
    if (isBusy || lang === currentLang) return;

    if (lang === "en") {
      restoreEnglish();
      setStatus("English");
      return;
    }

    if (cache[lang]) {
      applyTranslations(lang, cache[lang]);
      setStatus(LANGS[lang]);
      return;
    }

    try {
      isBusy = true;
      setStatus(`Translating to ${LANGS[lang]}...`);

      const texts = targets.map((t) => t.original);

      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          texts,
          targetLang: lang === "es" ? "Spanish" : "Tamil"
        })
      });

      const raw = await res.text();

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        setStatus("Translation failed", true);
        console.error("Non-JSON translation response:", raw);
        return;
      }

      if (!res.ok) {
        setStatus("Translation failed", true);
        console.error("Translation API error:", data);
        return;
      }

      cache[lang] = Array.isArray(data.translated) ? data.translated : texts;
      applyTranslations(lang, cache[lang]);
      setStatus(LANGS[lang]);
    } catch (err) {
      setStatus("Translation failed", true);
      console.error(err);
    } finally {
      isBusy = false;
    }
  }

  function injectLanguageSwitcher() {
    const mount = document.getElementById("topLangMount");

    const wrap = document.createElement("div");
    wrap.id = "langSwitcher";
    wrap.dataset.noTranslate = "true";

    wrap.innerHTML = `
      <div class="lang-inner">
        <span class="lang-mini-label">Lang</span>
        <button class="lang-btn active" data-lang="en" type="button">EN</button>
        <button class="lang-btn" data-lang="es" type="button">ES</button>
        <button class="lang-btn" data-lang="ta" type="button">TA</button>
        <span class="lang-status" id="langStatus">English</span>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      #langSwitcher {
        z-index: 9998;
      }

      #langSwitcher .lang-inner {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      #langSwitcher .lang-mini-label {
        font-size: 11px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #f97316;
        font-family: 'DM Mono', monospace;
      }

      #langSwitcher .lang-btn {
        border: 1px solid #2a2a2a;
        background: transparent;
        color: #d4d4d4;
        border-radius: 9px;
        padding: 7px 10px;
        cursor: pointer;
        font-size: 12px;
        font-family: 'DM Mono', monospace;
      }

      #langSwitcher .lang-btn.active {
        border-color: #f97316;
        color: #f97316;
        background: rgba(249,115,22,0.08);
      }

      #langSwitcher .lang-status {
        font-size: 11px;
        color: #8a8a8a;
        font-family: 'DM Mono', monospace;
      }

      #topLangMount {
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      @media (max-width: 640px) {
        #langSwitcher .lang-inner {
          gap: 6px;
        }

        #langSwitcher .lang-status {
          width: 100%;
        }
      }
    `;

    document.head.appendChild(style);

    if (mount) {
      mount.appendChild(wrap);
    } else {
      wrap.style.position = "fixed";
      wrap.style.top = "14px";
      wrap.style.right = "14px";
      wrap.style.background = "rgba(12,12,12,0.94)";
      wrap.style.border = "1px solid rgba(249,115,22,0.35)";
      wrap.style.borderRadius = "14px";
      wrap.style.padding = "10px 12px";
      wrap.style.backdropFilter = "blur(8px)";
      document.body.appendChild(wrap);
    }

    wrap.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => translatePage(btn.dataset.lang));
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    collectTextTargets();
    injectLanguageSwitcher();
  });
})();