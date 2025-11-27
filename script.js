import { C as CONTENT_TREE } from "./content.js";

const md = window.markdownit({ html: true });
const s = document.getElementById("sidebar");
const c = document.getElementById("cards");
const ct = document.getElementById("content");

let cf = null; // currentFolder
let fs = []; // folderStack

// Кэш для отрендеренного markdown
const renderCache = new Map();

function renderSidebar() {
    s.innerHTML = "";
    
    CONTENT_TREE.forEach(item => {
        const div = document.createElement("div");
        if (item.t === "f") { // folder
            div.className = "folder";
            div.textContent = item.n;
            div.onclick = () => showFolderContent(item);
        } else if (item.t === "d") { // document
            div.className = "file";
            div.textContent = item.n;
            div.onclick = () => loadFileContent(item);
        }
        s.appendChild(div);
    });
}

function showFolderContent(folder) {
    cf = folder;
    fs.push(folder);
    renderCards(folder);
}

function renderCards(folder) {
    c.innerHTML = "";
    ct.innerHTML = "";

    if (!folder.c || folder.c.length === 0) {
        c.innerHTML = `<div class="empty-folder"><h3>${folder.n}</h3><p>Папка пуста</p></div>`;
        return;
    }

    // Подпапки
    folder.c.forEach(item => {
        if (item.t === "f") {
            const card = createCard(item.n, "folder-card", "Папка", () => showFolderContent(item));
            c.appendChild(card);
        }
    });

    // Файлы
    folder.c.forEach(item => {
        if (item.t === "d") {
            const card = createCard(item.n, "file-card", "", () => loadFileContent(item));
            c.appendChild(card);
        }
    });

    // Кнопка назад
    if (fs.length > 1) {
        const backCard = createCard("← Назад", "back-card", "", goBack);
        c.appendChild(backCard);
    }

    c.style.display = "flex";
    ct.style.display = "none";
}

function createCard(title, className, type, onClick) {
    const card = document.createElement("div");
    card.className = `card ${className}`;
    card.innerHTML = type 
        ? `<div class="card-title">${title}</div><div class="card-type">${type}</div>`
        : `<div class="card-title">${title}</div>`;
    card.onclick = onClick;
    return card;
}

function goBack() {
    if (fs.length > 1) {
        fs.pop();
        cf = fs[fs.length - 1];
        renderCards(cf);
    }
}

function loadFileContent(file) {
    c.style.display = "none";
    ct.style.display = "block";
    
    // Используем кэш если есть
    let htmlContent;
    if (renderCache.has(file)) {
        htmlContent = renderCache.get(file);
    } else {
        htmlContent = file.d ? md.render(file.d) : "<p>Содержимое недоступно</p>";
        renderCache.set(file, htmlContent);
    }
    
    ct.innerHTML = `
        <button class="back-button" onclick="btc()">← Назад</button>
        <div class="markdown-content">
            <h1>${file.n}</h1>
            ${htmlContent}
        </div>
    `;
}

function backToCards() {
    if (cf) {
        renderCards(cf);
    } else {
        showRootContent();
    }
}

function showRootContent() {
    c.style.display = "flex";
    ct.style.display = "none";
    fs = [];
    cf = null;
    
    c.innerHTML = "";
    
    CONTENT_TREE.forEach(item => {
        if (item.t === "f") {
            const card = createCard(item.n, "folder-card", "Папка", () => showFolderContent(item));
            c.appendChild(card);
        } else if (item.t === "d") {
            const card = createCard(item.n, "file-card", "", () => loadFileContent(item));
            c.appendChild(card);
        }
    });
}

// Инициализация
renderSidebar();
showRootContent();

// Глобальные функции
window.btc = backToCards;