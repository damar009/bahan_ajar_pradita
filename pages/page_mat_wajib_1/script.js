const title = document.querySelector("#page-title");
const category = document.querySelector("#page-category");
const summary = document.querySelector("#page-summary");
const contentGrid = document.querySelector("#content-grid");

async function loadPageData() {
  const response = await fetch("data.json", { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Gagal memuat data.json (${response.status})`);
  }

  return response.json();
}

function renderPage(data) {
  title.textContent = data.title ?? "Tanpa Judul";
  category.textContent = data.category ?? "Halaman";
  summary.textContent = data.summary ?? "";

  contentGrid.innerHTML = (data.sections ?? [])
    .map(
      (section) => `
        <article class="content-card">
          <span class="content-card__tag">${section.tag ?? "Info"}</span>
          <h2>${section.heading}</h2>
          <p>${section.body}</p>
        </article>
      `,
    )
    .join("");
}

loadPageData()
  .then(renderPage)
  .catch((error) => {
    console.error(error);
    contentGrid.innerHTML = "<p>Konten halaman belum bisa dimuat. Periksa data.json.</p>";
  });
