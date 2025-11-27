import { CONTENT_TREE } from "./tree.js";

const md = window.markdownit({ html: true });

const sidebar = document.getElementById("sidebar");
const cards = document.getElementById("cards");
const content = document.getElementById("content");

let currentFolder = null;

// Функция для исправления путей на GitHub Pages
function fixPathForGitHub(path) {
    // Убираем начальный слеш если есть
    let fixedPath = path.replace(/^\//, '');
    // Кодируем только кириллические символы
    fixedPath = fixedPath.replace(/[^A-Za-z0-9/._-]/g, encodeURIComponent);
    return fixedPath;
}

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
            div.onclick = () => loadFile(item.path);
            sidebar.appendChild(div);
        }
    });
}

// === Карточки внутри папки ===
function showCards(folder) {
    currentFolder = folder;
    cards.innerHTML = "";
    content.innerHTML = "";

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
        
        card.innerHTML = `
            <div class="card-title">${file.name}</div>
            <div class="card-preview">Нажмите для просмотра</div>
        `;
        
        card.onclick = () => loadFile(file.path);
        cards.appendChild(card);
    });

    cards.style.display = "flex";
    content.style.display = "none";
}

// === Загрузка Markdown ===
async function loadFile(filePath) {
    try {
        cards.style.display = "none";
        content.style.display = "block";
        content.innerHTML = "<div class='loading'>Загрузка...</div>";
        
        // Исправляем путь для GitHub Pages
        const correctedPath = fixPathForGitHub(filePath);
        console.log('Пробуем загрузить:', correctedPath);
        
        const res = await fetch(correctedPath);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        
        const text = await res.text();
        content.innerHTML = `
            <button class="back-button" onclick="backToCards()">← Назад к карточкам</button>
            <div class="markdown-content">${md.render(text)}</div>
        `;
        
    } catch (error) {
        console.error('Ошибка загрузки файла:', error);
        content.innerHTML = `
            <button class="back-button" onclick="backToCards()">← Назад к карточкам</button>
            <div class="error-message">
                <h3>Файл не найден</h3>
                <p>Путь: ${filePath}</p>
                <p>Убедитесь, что файл существует в репозитории GitHub</p>
            </div>
        `;
    }
}

// === Назад к карточкам ===
function backToCards() {
    if (currentFolder) {
        showCards(currentFolder);
    } else {
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
window.backToCards = backToCards;
window.currentFolder = currentFolder;