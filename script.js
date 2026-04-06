const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

menuBtn.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});

// close menu when a link is clicked
menu.addEventListener("click", (e) => {
  if (e.target.tagName.toLowerCase() === "a") {
    menu.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  }
});
window.addEventListener("DOMContentLoaded", () => {
  const el = document.querySelector(".reveal");
  if (!el) return;

  // small delay so it feels intentional
  setTimeout(() => el.classList.add("is-visible"), 300);
});

<script>
  const PROJECT_LINKS = {
    airline: "https://public.tableau.com/app/profile/suriya.narayanan8214/viz/VADFINAL/Story1",
    f1: "https://f1-data-intel-2025.vercel.app/",
    instacart: "instacart-summary.html",
    moviematch: "moviematch-summary.html",
    underarmour: "other-academic-projects.html",
    erm: "other-academic-projects.html",
    petalpost: "other-academic-projects.html",
    royaltease: "other-academic-projects.html",
    energy: "other-academic-projects.html",
    streaming: "other-academic-projects.html",
    mindreading: "other-academic-projects.html"
  };

  const routerInput = document.getElementById("routerInput");
  const routerBtn = document.getElementById("routerBtn");
  const routerStatus = document.getElementById("routerStatus");

  // Give existing role buttons a dataset id based on ROLES order
  Array.from(document.querySelectorAll(".role-btn")).forEach((btn, idx) => {
    if (ROLES[idx]) btn.dataset.id = ROLES[idx].id;
  });

  function setRouterStatus(message, isError = false) {
    routerStatus.innerHTML = isError
      ? `<div class="err">${message}</div>`
      : `<div class="router-note">${message}</div>`;
  }

  function clearProjectFilter() {
    pgrid.querySelectorAll(".pcard").forEach((card) => {
      card.classList.remove("project-hidden");
    });
  }

  function filterProjectsByTag(tag) {
    const needle = String(tag || "").trim().toLowerCase();
    if (!needle) {
      clearProjectFilter();
      return 0;
    }

    let visibleCount = 0;

    PROJECTS.forEach((project) => {
      const card = pgrid.querySelector(`.pcard[data-id="${project.id}"]`);
      if (!card) return;

      const haystack = [
        project.title,
        project.blurb,
        ...(project.tags || [])
      ]
        .join(" ")
        .toLowerCase();

      const matches = haystack.includes(needle);
      card.classList.toggle("project-hidden", !matches);
      if (matches) visibleCount += 1;
    });

    return visibleCount;
  }

  function clickRoleById(roleId) {
    const btn = roleRow.querySelector(`.role-btn[data-id="${roleId}"]`);
    if (btn) btn.click();
  }

  function clickProjectById(projectId) {
    const btn = pgrid.querySelector(`.pcard[data-id="${projectId}"]`);
    if (btn) btn.click();
  }

  function explainProject(projectId, roleId = "recruiter") {
    clearProjectFilter();
    clickRoleById(roleId);
    clickProjectById(projectId);
  }

  function openProjectLink(projectId) {
    const href = PROJECT_LINKS[projectId];
    if (!href) return false;
    window.open(href, "_blank", "noopener,noreferrer");
    return true;
  }

  async function runRouter() {
    const query = routerInput.value.trim();
    if (!query) return;

    routerBtn.disabled = true;
    setRouterStatus("Routing with Gemma...");

    try {
      const res = await fetch("/api/router", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query })
      });

      const raw = await res.text();

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        setRouterStatus("Backend returned non-JSON.", true);
        routerBtn.disabled = false;
        return;
      }

      if (!res.ok) {
        setRouterStatus(data.error || "Router failed.", true);
        routerBtn.disabled = false;
        return;
      }

      const action = data.action;

      if (action === "open_resume") {
        window.open("assets/Suriya_Narayanan_Resume.pdf", "_blank", "noopener,noreferrer");
        setRouterStatus("Opened resume.");
      } else if (action === "filter_projects") {
        const count = filterProjectsByTag(data.tag);
        setRouterStatus(
          count > 0
            ? `Showing ${count} project(s) related to "${data.tag}".`
            : `I could not find a strong project match for "${data.tag}".`
        );
      } else if (action === "explain_project") {
        explainProject(data.projectId, data.role || "recruiter");
        setRouterStatus(
          `Selected ${data.projectId} and opened the explainer${data.role ? ` for ${data.role.replace("_", " ")}` : ""}.`
        );
      } else if (action === "open_project_link") {
        const opened = openProjectLink(data.projectId);
        if (!opened) {
          explainProject(data.projectId, "recruiter");
          setRouterStatus(`No direct link was mapped, so I opened the explainer for ${data.projectId}.`);
        } else {
          setRouterStatus(`Opened ${data.projectId}.`);
        }
      } else {
        setRouterStatus(
          `I couldn't map that cleanly. Try "show Tableau work", "open the F1 project", "download resume", or "explain the airline project for a recruiter".`,
          true
        );
      }
    } catch (error) {
      setRouterStatus(`Request failed: ${String(error?.message || error)}`, true);
    }

    routerBtn.disabled = false;
  }

  routerBtn.addEventListener("click", runRouter);
  routerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runRouter();
  });
</script>