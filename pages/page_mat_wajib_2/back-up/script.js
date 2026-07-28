const mainContent = document.getElementById('main-content');

const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const renderTable = (table) => {
    if (!table) return '';

    const headers = table.headers.map((header, index) => {
        const alignClass = table.leftAlign?.includes(index) ? ' class="text-left"' : '';
        return `<th${alignClass}>${header}</th>`;
    }).join('');

    const rows = table.rows.map((row) => {
        const cells = row.map((cell, index) => {
            const alignClass = table.leftAlign?.includes(index) ? ' class="text-left"' : '';
            return `<td${alignClass}>${cell}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
    }).join('');

    return `
        <div class="table-container">
            <table>
                <thead><tr>${headers}</tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
};

const renderGrid = (grid = []) => `
    <div class="grid-3">
        ${grid.map((item) => `
            <article class="method-card">
                <h3>${item.title}</h3>
                <div>${item.content}</div>
            </article>
        `).join('')}
    </div>
`;

const renderOptions = (options = []) => `
    <ol class="option-list" type="A">
        ${options.map((option) => `<li>${option}</li>`).join('')}
    </ol>
`;

const renderContentBlock = (block) => {
    if (typeof block === 'string') {
        return `<p>${block}</p>`;
    }

    switch (block.type) {
        case 'list':
            return `
                <ul class="styled-list">
                    ${block.items.map((item) => `<li>${item}</li>`).join('')}
                </ul>
            `;
        case 'contoh':
            return `
                <div class="example-box">
                    <strong>Contoh / Pembahasan</strong>
                    <div>${block.content}</div>
                    ${block.options ? renderOptions(block.options) : ''}
                </div>
            `;
        case 'note':
            return `
                <div class="note-box note-box--toggle is-collapsed">
                    <button class="note-toggle" type="button" aria-expanded="false">
                        <span><i class="fa-solid fa-circle-info"></i> Catatan</span>
                        <i class="fa-solid fa-chevron-up note-toggle__icon" aria-hidden="true"></i>
                    </button>
                    <div class="note-box__content">${block.content}</div>
                </div>
            `;
        case 'table':
            return renderTable(block.table);
        case 'grid':
            return renderGrid(block.grid);
        case 'formula':
            return `<div class="formula-line">${block.content}</div>`;
        default:
            return '';
    }
};

const renderMateriCard = (materi) => {
    const body = (materi.isi || []).map(renderContentBlock).join('');
    const table = renderTable(materi.table);
    const grid = renderGrid(materi.grid);

    return `
        <section class="card-materi" data-tipe="${escapeHtml(materi.tipe)}">
            <div class="card-materi__header">
                <div class="card-materi__icon"><i class="fa-solid ${escapeHtml(materi.icon)}"></i></div>
                <h2>${materi.judul}</h2>
            </div>
            ${body}
            ${table}
            ${grid}
        </section>
    `;
};

const renderData = (data) => {
    mainContent.innerHTML = data.materi.map(renderMateriCard).join('');
};

mainContent.addEventListener('click', (event) => {
    const toggle = event.target.closest('.note-toggle');
    if (!toggle) return;

    const noteBox = toggle.closest('.note-box');
    const isCollapsed = noteBox.classList.toggle('is-collapsed');
    toggle.setAttribute('aria-expanded', String(!isCollapsed));
});

const loadMateri = async () => {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`Gagal memuat data.json (${response.status})`);
        }

        const data = await response.json();
        renderData(data);

        if (window.MathJax?.typesetPromise) {
            await window.MathJax.typesetPromise();
        }
    } catch (error) {
        mainContent.innerHTML = `
            <div class="error-state">
                Materi belum dapat dimuat. Jalankan melalui server lokal agar fetch('data.json') dapat bekerja.
                <br>${escapeHtml(error.message)}
            </div>
        `;
    }
};

loadMateri();
