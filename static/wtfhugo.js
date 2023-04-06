// wtfhugo.js
class WTFHugo extends HTMLElement {
    constructor() {
        super();
        this.pageData = null;
        this.attachShadow({ mode: 'open' });
        this.init();
    }

    async init() {
        const scriptElement = document.querySelector('script[id="wtfhugo"][type="application/json"]');
        if (!scriptElement) return;

        let pageData;
        try {
            this.pageData = JSON.parse(scriptElement.textContent);
        } catch (error) {
            console.error('Invalid JSON content:', error);
            return;
        }

        const styleTag = document.createElement('style');
        styleTag.innerHTML = `
            .dragging * {
                cursor: grabbing !important;
            }
        `;
        document.head.appendChild(styleTag);

        this.createWTFButton();
    }

    createWTFButton() {
        const button = document.createElement('div');
        button.innerHTML = 'WTF';
        button.style.cssText = `
            position: fixed;
            bottom: 0;
            right: 0;
            width: 80px;
            height: 40px;
            background-color: darkblue;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            font-weight: bold;
            font-size; 20px;
            border-top-left-radius: 10px;
        `;
        button.addEventListener('click', () => this.showOverlay());
        document.body.appendChild(button);
    }

    showOverlay() {
        const overlay = document.createElement('div');
        const overlayStyleTag = document.createElement('style');
        overlayStyleTag.innerHTML = `
            table {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                font-size: 15px;
                background-color: transparent;
                max-width: 100%;
                word-wrap: break-word;
                border-collapse: collapse;
                margin-top: 16px;
                color: hsl(0, 0%, 89%);
            }
            table table {
                margin-top: 0;
                width: 100%;
                font-size: 14px;
            }
            th {
                font-size: 110%;
                color: hsl(0, 0%, 95%);
            }
            th, td {
                padding: 6px;
                line-height: 18px;
                text-align: center;
                border: 1px solid hsl(50, 29%, 50%);
            }
            table table th, table table td {
                border: 1px dashed hsl(33, 44%, 35%);
            }
            .arraycell {
                border: none;
                padding: 4px 0;
            }
            a {
                color: hsl(33, 63%, 66%);
                transition: color ease 0.3s;
            }
            a:hover {
                color: hsl(19, 100%, 95%);
            }
            #closeButton {
                color: hsl(0, 0%, 89%);
                transition: color ease 0.3s;
            }
            #closeButton:hover {
                color: hsl(0, 0%, 100%);
            }
            @media (max-width: 600px) {
                table {
                    font-size: 12px;
                }
                table table {
                    font-size: 10px;
                }
            }
        `;
        overlay.appendChild(overlayStyleTag);

        overlay.style.cssText = `
            z-index: 9999;
            position: fixed;
            top: 0;
            right: 0;
            width: 37em;
            min-width: 400px;
            max-width: 100vw;
            height: 100vh;
            background-color: rgba(0, 0, 0, 0.8);
            overflow: hidden;
        `;
        overlay.addEventListener('mousedown', (e) => this.dragStart(e, overlay));

        // Add keydown event listener to the document
        const onDocumentKeydown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.hideOverlay(overlay);
            }
        };
        document.addEventListener('keydown', onDocumentKeydown);

        // Add a property to the overlay to store the event listener
        overlay.documentKeydownListener = onDocumentKeydown;

        const draggableArea = document.createElement('div');
        draggableArea.className = 'draggableArea';
        draggableArea.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 15px;
            height: 100%;
            cursor: grab;
            background-color: black;
        `;
        overlay.appendChild(draggableArea);

        const closeButton = document.createElement('button');
        closeButton.id = 'closeButton';
        closeButton.style.cssText = `
            position: absolute;
            top: 8px;
            left: 15px;
            width: 24px;
            height: 24px;
            background: none;
            border: none;
            cursor: pointer;
            z-index: 2;
        `;
        closeButton.innerHTML = `
            <svg width="24px" height="24px" viewBox="0 0 16 16" fill="currentColor" preserveAspectRatio="xMidYMax meet">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
            </svg>
        `;
        closeButton.addEventListener('click', () => this.hideOverlay(overlay));
        overlay.appendChild(closeButton);

        const contentArea = document.createElement('div');
        contentArea.className = 'contentArea';
        contentArea.style.cssText = `
            margin: 15px 0 15px 15px;
            position: absolute;
            top: 0;
            left: 15px;
            right: 0;
            bottom: 0;
            overflow: auto;
            padding-right: 15px;
        `;
        contentArea.innerHTML = this.getContent();
        overlay.appendChild(contentArea);
        this.shadowRoot.appendChild(overlay);
    }

    hideOverlay(overlay) {
        document.removeEventListener('keydown', overlay.documentKeydownListener);
        this.shadowRoot.removeChild(overlay);
    }

    dragStart(e, overlay) {
        const draggableArea = overlay.querySelector('.draggableArea');
        if (e.target !== draggableArea) return;

        e.preventDefault();
        const startWidth = overlay.clientWidth;
        const startX = e.clientX;
        document.body.classList.add('dragging');

        const drag = (e) => {
            e.preventDefault();
            const deltaX = startX - e.clientX;
            overlay.style.width = `${Math.max(startWidth + deltaX, 100)}px`;
        };

        const stopDrag = () => {
            document.body.classList.remove('dragging');
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
        };

        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    }

    getContent() {
        const contentArea = document.createElement('div');
        contentArea.style.margin = '0';

        Object.entries(this.pageData).forEach(([key, value]) => {
            const table = this.createTable(key, value);
            contentArea.appendChild(table);
        });

        return contentArea.outerHTML;
    }

    createTable(key, value) {
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        const headerRow = document.createElement('tr');
        const headerCell = document.createElement('th');
        headerCell.colSpan = 2;
        headerCell.textContent = key;
        headerRow.appendChild(headerCell);
        thead.appendChild(headerRow);

        Object.entries(value).forEach(([subKey, subValue]) => {
            const row = document.createElement('tr');

            const keyCell = document.createElement('td');
            keyCell.textContent = subKey;
            row.appendChild(keyCell);

            const valueCell = document.createElement('td');
            valueCell.appendChild(this.renderValue(subValue));
            row.appendChild(valueCell);

            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        return table;
    }

    renderValue(value) {
        const cellContent = document.createElement('div');

        if (typeof value === 'string' || typeof value === 'number') {
            cellContent.textContent = value.toString();
        } else if (typeof value === 'boolean') {
            cellContent.textContent = value ? 'true' : 'false';
        } else if (Array.isArray(value)) {
            const subTable = document.createElement('table');
            subTable.className = 'arraytable';

            value.forEach(subValue => {
                const row = document.createElement('tr');
                const subValueCell = document.createElement('td');
                subValueCell.className = 'arraycell';
                subValueCell.appendChild(this.renderValue(subValue));
                row.appendChild(subValueCell);
                subTable.appendChild(row);
            });

            cellContent.appendChild(subTable);
        } else if (typeof value === 'object') {
            const keys = Object.keys(value);
            if (keys.length === 2 && keys.includes('linktarget') && keys.includes('linktitle')) {
                const link = document.createElement('a');
                link.href = value.linktarget;
                link.textContent = value.linktitle;
                cellContent.appendChild(link);
            } else {
                const subTable = document.createElement('table');

                Object.entries(value).forEach(([subKey, subValue]) => {
                    const row = document.createElement('tr');

                    const keyCell = document.createElement('td');
                    keyCell.textContent = subKey;
                    row.appendChild(keyCell);

                    const valueCell = document.createElement('td');
                    valueCell.appendChild(this.renderValue(subValue));
                    row.appendChild(valueCell);

                    subTable.appendChild(row);
                });

                cellContent.appendChild(subTable);
            }
        }

        return cellContent;
    }
}

customElements.define('wtf-hugo', WTFHugo);

document.addEventListener('DOMContentLoaded', () => {
    const wtfHugo = document.createElement('wtf-hugo');
    document.body.appendChild(wtfHugo);
});

