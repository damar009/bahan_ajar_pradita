const scriptUrl = new URL(import.meta.url);
const siteRoot = new URL("../", scriptUrl);
const registryUrl = new URL("data/pages.json", siteRoot);

async function loadRegistry() {
  const response = await fetch(registryUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Gagal memuat daftar halaman (${response.status})`);
  }

  return response.json();
}

function absoluteSiteUrl(path) {
  return new URL(path, siteRoot).href;
}

function stripHtml(value = "") {
  const wrapper = document.createElement("span");
  wrapper.innerHTML = value;
  return wrapper.textContent.replace(/^\|\s*/, "").trim();
}

function closeDropdown(dropdown, toggle) {
  dropdown.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
}

function initDropdown(nav) {
  const dropdown = nav.querySelector(".page-nav__dropdown");
  const toggle = nav.querySelector(".page-nav__toggle");

  toggle.addEventListener("click", () => {
    const isOpen = dropdown.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) {
      closeDropdown(dropdown, toggle);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDropdown(dropdown, toggle);
      toggle.focus();
    }
  });
}

function renderNav(mount, pages) {
  const currentUrl = new URL(window.location.href);
  const publishedPages = pages.filter((page) => page.published !== false);
  const menuLinks = publishedPages
    .map((page) => {
      const href = absoluteSiteUrl(page.url);
      const isActive = new URL(href).pathname === currentUrl.pathname;
      const summary = stripHtml(page.summary);

      return `
        <a class="${isActive ? "is-active" : ""}" href="${href}">
          <span>${page.title}</span>
          ${summary ? `<small>${summary}</small>` : ""}
        </a>
      `;
    })
    .join("");

  mount.innerHTML = `
    <nav class="page-nav" aria-label="Navigasi halaman">
      <a class="page-nav__brand" href="${absoluteSiteUrl("index.html")}">
        <strong>BRAIN <span>ACADEMY</span></strong>
        <small>By Ruangguru</small>
      </a>
      <div class="page-nav__actions">
        <a class="page-nav__home" href="${absoluteSiteUrl("index.html")}">
          <i class="fa-solid fa-house" aria-hidden="true"></i>
          Home
        </a>
        <div class="page-nav__dropdown">
          <button class="page-nav__toggle" type="button" aria-expanded="false">
            Daftar Isi
            <i class="fa-solid fa-chevron-down page-nav__chevron" aria-hidden="true"></i>
          </button>
          <div class="page-nav__menu" role="menu">
            ${menuLinks}
          </div>
        </div>
      </div>
    </nav>
  `;

  initDropdown(mount.querySelector(".page-nav"));
}

async function initPageNav() {
  const mount = document.querySelector("[data-page-nav]");
  if (!mount) return;

  try {
    const pages = await loadRegistry();
    renderNav(mount, pages);
  } catch (error) {
    console.error(error);
    mount.innerHTML = `
      <nav class="page-nav page-nav--fallback" aria-label="Navigasi halaman">
        <a class="page-nav__home" href="${absoluteSiteUrl("index.html")}">Home</a>
      </nav>
    `;
  }
}

initPageNav();
