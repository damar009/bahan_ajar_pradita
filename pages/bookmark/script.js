const bookmarkList = document.querySelector("#bookmark-list");

async function loadBookmarkData() {
  const response = await fetch("../../data/pages.json", { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Gagal memuat data/pages.json (${response.status})`);
  }

  return response.json();
}

function pageToBookmark(page) {
  return {
    title: page.title,
    description: page.summary ?? page.url,
    url: `../../${page.url}`,
  };
}

function renderBookmarks(pages) {
  const bookmarks = pages
    .filter((page) => page.published !== false)
    .filter((page) => page.id !== "bookmark")
    .map(pageToBookmark);

  if (!bookmarks.length) {
    bookmarkList.innerHTML = "<p>Belum ada bookmark.</p>";
    return;
  }

  bookmarkList.innerHTML = bookmarks
    .map(
      (item) => `
        <a class="bookmark" href="${item.url}">
          <span>
            <strong>${item.title}</strong>
            <span>${item.description ?? item.url}</span>
          </span>
          <span class="bookmark__action">Buka halaman</span>
        </a>
      `,
    )
    .join("");
}

loadBookmarkData()
  .then(renderBookmarks)
  .catch((error) => {
    console.error(error);
    bookmarkList.innerHTML = "<p>Bookmark belum bisa dimuat. Periksa data/pages.json.</p>";
  });
