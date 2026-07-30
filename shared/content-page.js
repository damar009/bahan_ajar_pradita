const materialRoot = document.getElementById("material-grid");
const exerciseRoot = document.getElementById("exercise-list");
const exerciseSection = document.getElementById("latihan");

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

function renderIcon(icon = "fa-book-open") {
  if (String(icon).startsWith("fa-")) {
    return `<i class="fa-solid ${escapeHtml(icon)}" aria-hidden="true"></i>`;
  }

  return escapeHtml(icon);
}

function normalizeTable(tableOrBlock) {
  if (!tableOrBlock) return null;
  if (tableOrBlock.headers && tableOrBlock.rows) return tableOrBlock;
  if (tableOrBlock.table?.headers && tableOrBlock.table?.rows) return tableOrBlock.table;
  return null;
}

function renderTable(tableOrBlock) {
  const table = normalizeTable(tableOrBlock);
  if (!table) return "";

  const headers = table.headers
    .map((header, index) => {
      const alignClass = table.leftAlign?.includes(index) ? ' class="text-left"' : "";
      return `<th${alignClass}>${header}</th>`;
    })
    .join("");

  const rows = table.rows
    .map((row) => {
      const cells = row
        .map((cell, index) => {
          const alignClass = table.leftAlign?.includes(index) ? ' class="text-left"' : "";
          return `<td${alignClass}>${cell}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${headers}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderGrid(gridOrBlock = []) {
  const items = Array.isArray(gridOrBlock) ? gridOrBlock : gridOrBlock.grid || gridOrBlock.items || [];
  if (!items.length) return "";

  return `
    <div class="info-grid">
      ${items.map((item) => `
        <article class="info-card">
          <h4>${escapeHtml(item.title)}</h4>
          <div>${item.content}</div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderDiagram(name) {
  if (name !== "triangle-9") return "";

  return `
    <div class="diagram-wrap" aria-label="Diagram segitiga tersusun dari sembilan segitiga kecil">
      <svg class="triangle-diagram" viewBox="0 0 320 260" role="img">
        <polygon points="160,12 28,236 292,236" fill="#fff" stroke="#15315f" stroke-width="4"/>
        <line x1="116" y1="87" x2="204" y2="87" stroke="#15315f" stroke-width="4"/>
        <line x1="72" y1="162" x2="248" y2="162" stroke="#15315f" stroke-width="4"/>
        <line x1="116" y1="87" x2="72" y2="162" stroke="#15315f" stroke-width="4"/>
        <line x1="204" y1="87" x2="248" y2="162" stroke="#15315f" stroke-width="4"/>
        <line x1="116" y1="87" x2="160" y2="162" stroke="#15315f" stroke-width="4"/>
        <line x1="204" y1="87" x2="160" y2="162" stroke="#15315f" stroke-width="4"/>
        <line x1="72" y1="162" x2="116" y2="236" stroke="#15315f" stroke-width="4"/>
        <line x1="160" y1="162" x2="160" y2="236" stroke="#15315f" stroke-width="4"/>
        <line x1="248" y1="162" x2="204" y2="236" stroke="#15315f" stroke-width="4"/>
      </svg>
    </div>
  `;
}

function renderDiscussionToggle(content, index, label = "Tampilkan Pembahasan", showSolutionToggle = true) {
  if (!showSolutionToggle) return "";

  const id = `discussion-${index}`;

  return `
    <div class="discussion-panel">
      <button class="solution-toggle" type="button" aria-expanded="false" aria-controls="${id}">
        ${label}
      </button>
      <div class="solution-box" id="${id}" hidden>${content}</div>
    </div>
  `;
}

function renderBlock(block, index = 0, showSolutionToggle = true) {
  if (typeof block === "string") {
    return `<div class="content-block"><p>${block}</p></div>`;
  }

  switch (block.type) {
    case "paragraph":
      return `<div class="content-block"><p>${block.content}</p></div>`;
    case "list":
      return `
        <ul class="styled-list">
          ${(block.items || []).map((item) => `<li>${item}</li>`).join("")}
        </ul>
      `;
    case "ordered-list":
      return `
        <ol class="styled-list styled-list--ordered">
          ${(block.items || []).map((item) => `<li>${item}</li>`).join("")}
        </ol>
      `;
    case "grid":
      return renderGrid(block);
    case "formula":
      return `<div class="formula-box">${block.content}</div>`;
    case "note":
      return `
        <aside class="note-box">
          <strong>Catatan</strong>
          <div>${block.content}</div>
        </aside>
      `;
    case "example":
      if (block.diagram || block.options || block.table) {
        return renderDiscussionToggle(
          `
            ${block.title ? `<strong>${escapeHtml(block.title)}</strong>` : ""}
            <div>${block.content}</div>
            ${block.diagram ? renderDiagram(block.diagram) : ""}
            ${block.options ? renderOptions(block.options) : ""}
            ${block.table ? renderTable(block.table) : ""}
          `,
          `block-${index}`,
          "Tampilkan Pembahasan",
          showSolutionToggle,
        );
      }

      return `
        <div class="example-box">
          ${block.title ? `<strong>${escapeHtml(block.title)}</strong>` : ""}
          <div>${block.content}</div>
        </div>
      `;
    case "table":
      return renderTable(block);
    default:
      return "";
  }
}

function renderOptions(options = []) {
  return `
    <ol class="option-list" type="A">
      ${options.map((option) => `<li>${option}</li>`).join("")}
    </ol>
  `;
}

function normalizeMaterials(data) {
  if (Array.isArray(data.materi)) return data.materi;

  if (Array.isArray(data.sections)) {
    return data.sections.map((section) => ({
      judul: section.heading,
      icon: "fa-file-lines",
      isi: [
        {
          type: "paragraph",
          content: section.body,
        },
      ],
    }));
  }

  return [];
}

function renderMaterials(data, showSolutionToggle) {
  if (!materialRoot) return;

  const materials = normalizeMaterials(data);
  materialRoot.innerHTML = materials.map((item, itemIndex) => `
    <article class="material-card" data-tipe="${escapeHtml(item.tipe || "basic")}">
      <div class="material-card__header">
        <div class="material-icon">${renderIcon(item.icon)}</div>
        <h3>${escapeHtml(item.judul || "Materi")}</h3>
      </div>
      ${(item.isi || []).map((block, blockIndex) => renderBlock(block, `${itemIndex}-${blockIndex}`, showSolutionToggle)).join("")}
      ${renderTable(item.table)}
      ${renderGrid(item.grid)}
    </article>
  `).join("");
}

function renderExercises(data, showSolutionToggle) {
  if (!exerciseRoot) return;

  const exercises = Array.isArray(data.latihan) ? data.latihan : [];
  if (!exercises.length) {
    exerciseSection?.setAttribute("hidden", "");
    return;
  }

  exerciseSection?.removeAttribute("hidden");
  exerciseRoot.innerHTML = exercises.map((item, index) => {
    const solutionId = `solution-${index}`;

    return `
      <article class="exercise-card">
        <div class="exercise-card__header">
          <span class="exercise-number">${index + 1}</span>
          <p>${item.question}</p>
        </div>
        ${renderTable(item.table)}
        ${renderOptions(item.options)}
        ${showSolutionToggle ? `
          <button class="solution-toggle" type="button" aria-expanded="false" aria-controls="${solutionId}">
            Tampilkan Pembahasan
          </button>
          <div class="solution-box" id="${solutionId}" hidden>
            <strong>Jawaban: ${escapeHtml(item.answer)}</strong>
            ${item.intro ? `<p>${item.intro}</p>` : ""}
            <ol>
              ${(item.discussion || []).map((step) => `<li>${step}</li>`).join("")}
            </ol>
          </div>
        ` : ""}
      </article>
    `;
  }).join("");
}

function bindSolutionToggles() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".solution-toggle");
    if (!button) return;

    const box = document.getElementById(button.getAttribute("aria-controls"));
    if (!box) return;

    const shouldOpen = box.hidden;
    box.hidden = !shouldOpen;
    button.setAttribute("aria-expanded", String(shouldOpen));
    button.textContent = shouldOpen ? "Sembunyikan Pembahasan" : "Tampilkan Pembahasan";
    renderMath();
  });
}

async function loadContent() {
  try {
    const response = await fetch("data.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Gagal memuat data.json (${response.status})`);
    }

    const data = await response.json();
    const showSolutionToggle = data.settings?.showSolutionToggle !== false;
    renderMaterials(data, showSolutionToggle);
    renderExercises(data, showSolutionToggle);
    renderMath();
  } catch (error) {
    if (materialRoot) {
      materialRoot.innerHTML = `
        <div class="error-state">
          Materi belum dapat dimuat. Jalankan melalui server lokal agar fetch("data.json") dapat bekerja.
          <br>${escapeHtml(error.message)}
        </div>
      `;
    }
  }
}

bindSolutionToggles();
loadContent();
