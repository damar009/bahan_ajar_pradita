const $ = (id) => document.getElementById(id);

const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

function renderMath() {
    if (window.MathJax?.typesetPromise) {
        window.MathJax.typesetPromise();
    }
}

function renderTable(block) {
    const headers = block.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
    const rows = block.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("");
    return `<div class="table-wrap"><table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

function renderBlock(block) {
    switch (block.type) {
        case "paragraph":
            return `<div class="content-block"><p>${block.content}</p></div>`;
        case "grid":
            return `<div class="info-grid">${block.items.map((item) => `
        <article class="info-card">
          <h4>${escapeHtml(item.title)}</h4>
          <p>${item.content}</p>
        </article>
      `).join("")}</div>`;
        case "formula":
            return `<div class="formula-box">${block.content}</div>`;
        case "note":
            return `<div class="note-box">${block.content}</div>`;
        case "example":
            return `<div class="example-box"><strong>${escapeHtml(block.title)}</strong><p>${block.content}</p></div>`;
        case "table":
            return renderTable(block);
        default:
            return "";
    }
}

function renderMaterial(data) {
    const root = $("material-grid");
    root.innerHTML = data.materi.map((item) => `
    <article class="material-card">
      <div class="material-card__header">
        <div class="material-icon">${escapeHtml(item.icon)}</div>
        <h3>${escapeHtml(item.judul)}</h3>
      </div>
      ${item.isi.map(renderBlock).join("")}
    </article>
  `).join("");
    renderMath();
}

function renderExercises(data) {
    const root = $("exercise-list");
    if (!root || !data.latihan) return;

    root.innerHTML = data.latihan.map((item, index) => {
        const solutionId = `solution-${index}`;
        return `
      <article class="exercise-card">
        <div class="exercise-card__header">
          <span class="exercise-number">${index + 1}</span>
          <p>${item.question}</p>
        </div>
        <ol class="option-list" type="A">
          ${item.options.map((option) => `<li>${option}</li>`).join("")}
        </ol>
        <button class="solution-toggle" type="button" aria-expanded="false" aria-controls="${solutionId}">
          Tampilkan pembahasan
        </button>
        <div class="solution-box" id="${solutionId}" hidden>
          <strong>Jawaban: ${escapeHtml(item.answer)}</strong>
          ${item.intro ? `<p>${item.intro}</p>` : ""}
          <ol>
            ${item.discussion.map((step) => `<li>${step}</li>`).join("")}
          </ol>
        </div>
      </article>
    `;
    }).join("");

    root.addEventListener("click", (event) => {
        const button = event.target.closest(".solution-toggle");
        if (!button) return;
        const solution = $(button.getAttribute("aria-controls"));
        const isOpen = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!isOpen));
        button.textContent = isOpen ? "Tampilkan pembahasan" : "Sembunyikan pembahasan";
        solution.hidden = isOpen;
        if (!isOpen) renderMath();
    });

    renderMath();
}


async function loadData() {
    const response = await fetch("data.json");
    const data = await response.json();
    renderMaterial(data);
    renderExercises(data);
}

loadData();
