import { CONTENT_TREE } from "./content.js";

const md = window.markdownit({ html: true });

const sidebar = document.getElementById("sidebar");
const cards = document.getElementById("cards");
const content = document.getElementById("content");

let currentFolder = null;
let folderStack = [];

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

// === Загрузка содержимого Markdown (по требованию) ===
async function loadFileContent(file) {
    try {
        // Скрываем карточки, показываем контент
        cards.style.display = "none";
        content.style.display = "block";
        
        // Показываем загрузку
        content.innerHTML = "<div class='loading'>Загрузка содержимого...</div>";
        
        console.log("Загружаем файл:", file.path);
        
        // Пробуем разные варианты путей
        const pathsToTry = [
            file.path,
            `./${file.path}`,
            file.path.replace(/^Data\//, ''),
            encodeURI(file.path),
            encodeURI(`./${file.path}`)
        ];

        let response;
        let successfulPath = '';

        for (const path of pathsToTry) {
            try {
                console.log("Пробуем путь:", path);
                response = await fetch(path);
                if (response.ok) {
                    successfulPath = path;
                    break;
                }
            } catch (e) {
                console.log(`Путь не сработал: ${path}`, e);
                continue;
            }
        }

        if (!response || !response.ok) {
            throw new Error(`Не удалось загрузить файл по любому из путей`);
        }
        
        const text = await response.text();
        const htmlContent = md.render(text);
        
        content.innerHTML = `
            <button class="back-button" onclick="backToCards()">← Назад к карточкам</button>
            <div class="markdown-content">
                <h1>${file.name}</h1>
                ${htmlContent}
            </div>
        `;
        
    } catch (error) {
        console.error('Ошибка загрузки файла:', error);
        content.innerHTML = `
            <button class="back-button" onclick="backToCards()">← Назад к карточкам</button>
            <div class="error-message">
                <h3>Ошибка загрузки</h3>
                <p>Файл: ${file.name}</p>
                <p>Путь: ${file.path}</p>
                <p>Ошибка: ${error.message}</p>
                <p>Проверьте консоль для подробностей</p>
            </div>
        `;
    }
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