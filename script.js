import { CONTENT_TREE } from "./content.js";

const md = window.markdownit({ html: true });

const sidebar = document.getElementById("sidebar");
const cards = document.getElementById("cards");
const content = document.getElementById("content");

let currentFolder = null;
let folderStack = []; // Стек для навигации по папкам

// === САЙДБАР ===
function renderSidebar() {
    sidebar.innerHTML = "";
    
    CONTENT_TREE.forEach(item => {
        if (item.type === "folder") {
            const div = document.createElement("div");
            div.className = "folder";
            div.textContent = item.name;
            div.onclick = () => showFolderContent(item);
            sidebar.appendChild(div);
        } else if (item.type === "file") {
            const div = document.createElement("div");
            div.className = "file";
            div.textContent = item.name;
            div.onclick = () => loadFileContent(item);
            sidebar.appendChild(div);
        }
    });
}

// === Показать содержимое папки в карточках ===
function showFolderContent(folder) {
    currentFolder = folder;
    folderStack.push(folder);
    renderCards(folder);
}

// === Рендер карточек ===
function renderCards(folder) {
    cards.innerHTML = "";
    content.innerHTML = "";

    if (!folder.children || folder.children.length === 0) {
        cards.innerHTML = `
            <div class="empty-folder">
                <h3>${folder.name}</h3>
                <p>Папка пуста</p>
            </div>
        `;
        return;
    }

    // Сначала показываем подпапки
    folder.children.forEach(item => {
        if (item.type === "folder") {
            const card = document.createElement("div");
            card.className = "card folder-card";
            card.innerHTML = `
                <div class="card-title">${item.name}</div>
                <div class="card-type">Папка</div>
            `;
            card.onclick = () => showFolderContent(item);
            cards.appendChild(card);
        }
    });

    // Затем показываем файлы
    folder.children.forEach(item => {
        if (item.type === "file") {
            const card = document.createElement("div");
            card.className = "card file-card";
            card.innerHTML = `<div class="card-title">${item.name}</div>`;
            card.onclick = () => loadFileContent(item);
            cards.appendChild(card);
        }
    });

    // Добавляем кнопку "Назад" если это не корневая папка
    if (folderStack.length > 1) {
        const backCard = document.createElement("div");
        backCard.className = "card back-card";
        backCard.innerHTML = `
            <div class="card-title">← Назад</div>
        `;
        backCard.onclick = goBack;
        cards.appendChild(backCard);
    }

    // Показываем карточки, скрываем контент
    cards.style.display = "flex";
    content.style.display = "none";
}

// === Назад по истории папок ===
function goBack() {
    if (folderStack.length > 1) {
        folderStack.pop(); // Убираем текущую папку
        const previousFolder = folderStack[folderStack.length - 1];
        currentFolder = previousFolder;
        renderCards(previousFolder);
    }
}

// === Загрузка содержимого Markdown ===
function loadFileContent(file) {
    // Скрываем карточки, показываем контент
    cards.style.display = "none";
    content.style.display = "block";
    
    if (!file.content) {
        content.innerHTML = `
            <button class="back-button" onclick="backToCards()">← Назад к карточкам</button>
            <div class="error-message">
                <h3>Содержимое недоступно</h3>
                <p>Для файла "${file.name}" нет содержимого</p>
            </div>
        `;
        return;
    }
    
    const htmlContent = md.render(file.content);
    content.innerHTML = `
        <button class="back-button" onclick="backToCards()">← Назад к карточкам</button>
        <div class="markdown-content">
            <h1>${file.name}</h1>
            ${htmlContent}
        </div>
    `;
}

// === Назад к карточкам ===
function backToCards() {
    if (currentFolder) {
        renderCards(currentFolder);
    } else {
        // Показываем корневую структуру
        showRootContent();
    }
}

// === Показать корневую структуру ===
function showRootContent() {
    cards.style.display = "flex";
    content.style.display = "none";
    folderStack = [];
    currentFolder = null;
    
    cards.innerHTML = "";
    
    // Показываем все папки и файлы из корня
    CONTENT_TREE.forEach(item => {
        if (item.type === "folder") {
            const card = document.createElement("div");
            card.className = "card folder-card";
            card.innerHTML = `
                <div class="card-title">${item.name}</div>
                <div class="card-type">Папка</div>
            `;
            card.onclick = () => showFolderContent(item);
            cards.appendChild(card);
        } else if (item.type === "file") {
            const card = document.createElement("div");
            card.className = "card file-card";
            card.innerHTML = `<div class="card-title">${item.name}</div>`;
            card.onclick = () => loadFileContent(item);
            cards.appendChild(card);
        }
    });
}

// Инициализация
renderSidebar();
showRootContent(); // Показываем корневую структуру при загрузке

// Делаем функции глобальными для использования в onclick
window.backToCards = backToCards;
window.currentFolder = currentFolder;