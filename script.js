import { CONTENT_TREE } from "./content.js";

const md = window.markdownit({ html: true });

const sidebar = document.getElementById("sidebar");
const cards = document.getElementById("cards");
const content = document.getElementById("content");

let currentFolder = null;

// === САЙДБАР ===
function renderSidebar() {
    sidebar.innerHTML = "";
    
    CONTENT_TREE.forEach(item => {
        if (item.type === "folder") {
            const div = document.createElement("div");
            div.className = "folder";
            div.textContent = item.name;
            div.onclick = () => showCards(item);
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

// === Карточки внутри папки ===
function showCards(folder) {
    currentFolder = folder;
    cards.innerHTML = "";
    content.innerHTML = "";

    // Рекурсивно собираем все файлы из папки и подпапок
    function collectFiles(item) {
        if (item.type === "file") {
            return [item];
        } else if (item.type === "folder" && item.children) {
            return item.children.flatMap(child => collectFiles(child));
        }
        return [];
    }

    const allFiles = collectFiles(folder);

    allFiles.forEach(file => {
        const card = document.createElement("div");
        card.className = "card";
        
        // Создаем превью из первых 100 символов содержимого
        const preview = file.content 
            ? file.content.substring(0, 100).replace(/[#*`]/g, '') + '...'
            : 'Нажмите для просмотра';
        
        card.innerHTML = `
            <div class="card-title">${file.name}</div>
            <div class="card-preview">${preview}</div>
        `;
        
        card.onclick = () => loadFileContent(file);
        cards.appendChild(card);
    });

    // Показываем карточки, скрываем контент
    cards.style.display = "flex";
    content.style.display = "none";
}

// === Загрузка содержимого Markdown (из встроенных данных) ===
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
        showCards(currentFolder);
    } else {
        // Если нет текущей папки, показываем приветствие
        cards.style.display = "flex";
        content.style.display = "none";
        cards.innerHTML = `
            <div class="welcome-message">
                <h1>Starfinder Справочник</h1>
                <p>Выберите категорию в сайдбаре для просмотра содержимого</p>
            </div>
        `;
    }
}

// Инициализация
renderSidebar();

// Делаем функции глобальными для использования в onclick
window.backToCards = backToCards;
window.currentFolder = currentFolder;