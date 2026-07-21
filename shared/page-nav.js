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
  const publishedPages = pages.filter((page) => page.published !== false);
  const menuLinks = publishedPages
    .map((page) => `<a href="${absoluteSiteUrl(page.url)}">${page.title}</a>`)
    .join("");

  mount.innerHTML = `
    <nav class="page-nav" aria-label="Navigasi halaman">
      <a class="page-nav__home" href="${absoluteSiteUrl("index.html")}">Home</a>
      <div class="page-nav__dropdown">
        <button class="page-nav__toggle" type="button" aria-expanded="false">
          Daftar Isi
        </button>
        <div class="page-nav__menu" role="menu">
          ${menuLinks}
        </div>
      </div>
    </nav>
  `;

  initDropdown(mount.querySelector(".page-nav"));
}

const navMount = document.querySelector("[data-page-nav]");

if (navMount) {
  loadRegistry()
    .then((pages) => renderNav(navMount, pages))
    .catch((error) => {
      console.error(error);
      navMount.innerHTML = `
        <nav class="page-nav" aria-label="Navigasi halaman">
          <a class="page-nav__home" href="${absoluteSiteUrl("index.html")}">Home</a>
        </nav>
      `;
    });
}
