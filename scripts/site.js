const pageList = document.querySelector("#page-list");

async function loadPages() {
  const response = await fetch("data/pages.json", { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Gagal memuat data/pages.json (${response.status})`);
  }

  return response.json();
}

function renderPages(pages) {
  const publishedPages = pages.filter((page) => page.published !== false);

  if (publishedPages.length === 0) {
    pageList.innerHTML = '<p class="empty">Belum ada halaman yang dipublikasikan.</p>';
    return;
  }

  pageList.innerHTML = publishedPages
    .map(
      (page, index) => `
        <a class="page-card" href="${page.url}" data-index="${String(index + 1).padStart(2, "0")}">
          <span class="page-card__body">
            <h3 class="page-card__title">${page.title}</h3>
            <p class="page-card__summary">${page.summary ?? ""}</p>
          </span>
          <span class="page-card__action">Buka halaman</span>
        </a>
      `,
    )
    .join("");
}

loadPages()
  .then(renderPages)
  .catch((error) => {
    console.error(error);
    pageList.innerHTML = '<p class="empty">Daftar halaman belum bisa dimuat. Periksa data/pages.json.</p>';
  });
