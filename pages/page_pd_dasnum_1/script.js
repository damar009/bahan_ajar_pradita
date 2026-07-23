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

const renderDiagram = (name) => {
    if (name !== 'triangle-9') return '';

    return `
        <div class="diagram-wrap" aria-label="Diagram segitiga tersusun dari sembilan segitiga kecil">
            <svg class="triangle-diagram" viewBox="0 0 320 260" role="img">
                <polygon points="160,12 28,236 292,236" fill="#fff" stroke="#111" stroke-width="4"/>
                <line x1="116" y1="87" x2="204" y2="87" stroke="#111" stroke-width="4"/>
                <line x1="72" y1="162" x2="248" y2="162" stroke="#111" stroke-width="4"/>
                <line x1="116" y1="87" x2="72" y2="162" stroke="#111" stroke-width="4"/>
                <line x1="204" y1="87" x2="248" y2="162" stroke="#111" stroke-width="4"/>
                <line x1="72" y1="162" x2="116" y2="236" stroke="#111" stroke-width="4"/>
                <line x1="248" y1="162" x2="204" y2="236" stroke="#111" stroke-width="4"/>
                <line x1="116" y1="87" x2="204" y2="236" stroke="#111" stroke-width="4"/>
                <line x1="204" y1="87" x2="116" y2="236" stroke="#111" stroke-width="4"/>
            </svg>
        </div>
    `;
};

const renderOptions = (options = []) => `
    <div class="question-list">
        ${options.map((option) => `
            <div class="option-line">
                <strong>${escapeHtml(option.label)}.</strong>
                <span>${option.text}</span>
            </div>
        `).join('')}
    </div>
`;

const renderContentBlock = (block) => {
    if (typeof block === 'string') {
        return `<p class="content-block">${block}</p>`;
    }

    switch (block.type) {
        case 'list':
            return `<ul class="materi-list">${block.items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
        case 'ordered-list':
            return `<ol class="materi-list">${block.items.map((item) => `<li>${item}</li>`).join('')}</ol>`;
        case 'contoh':
            return `
                <div class="contoh-box${block.variant === 'danger' ? ' contoh-box--danger' : ''}">
                    ${block.title ? `<div class="contoh-box__title"><i class="fa-solid fa-star"></i>${block.title}</div>` : ''}
                    <div>${block.content}</div>
                    ${block.table ? renderTable(block.table) : ''}
                    ${block.diagram ? renderDiagram(block.diagram) : ''}
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
