// script.js
import { CONTENT_TREE } from "./content.js";

const md = window.markdownit({
    html: true,
    breaks: true,
    linkify: true
});

const sidebar = document.getElementById("sidebar");
const cards = document.getElementById("cards");
const content = document.getElementById("content");
const hamburger = document.getElementById("hamburger");
const overlay = document.getElementById("overlay");

let currentFolder = null;
let folderStack = [];

// === УПРАВЛЕНИЕ МОБИЛЬНЫМ МЕНЮ ===
function toggleSidebar() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    hamburger.classList.remove('active');
}

// === УПРАВЛЕНИЕ ВЫСОТОЙ САЙДБАРА ===
function setupMobileSidebar() {
    function setSidebarHeight() {
        if (window.innerWidth <= 768) {
            sidebar.style.height = window.innerHeight + 'px';
        } else {
            sidebar.style.height = '';
        }
    }
    
    setSidebarHeight();
    window.addEventListener('resize', setSidebarHeight);
    
    hamburger.addEventListener('click', () => {
        setTimeout(setSidebarHeight, 50);
    });
}

// === РЕНДЕР САЙДБАРА ===
function renderSidebar() {
    sidebar.innerHTML = "";
    
    CONTENT_TREE.forEach(item => {
        if (item.type === "folder") {
            const div = document.createElement("div");
            div.className = "folder";
            div.textContent = item.name;
            div.onclick = () => {
                showFolderContent(item);
                closeSidebar();
            };
            sidebar.appendChild(div);
        } else if (item.type === "file") {
            const div = document.createElement("div");
            div.className = "file";
            div.textContent = item.name;
            div.onclick = () => {
                loadFileContent(item);
                closeSidebar();
            };
            sidebar.appendChild(div);
        }
    });
}

// === ПОКАЗАТЬ СОДЕРЖИМОЕ ПАПКИ В КАРТОЧКАХ ===
function showFolderContent(folder) {
    currentFolder = folder;
    folderStack.push(folder);
    renderCards(folder);
}

// === РЕНДЕР КАРТОЧЕК ===
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

// === НАЗАД ПО ИСТОРИИ ПАПОК ===
function goBack() {
    if (folderStack.length > 1) {
        folderStack.pop();
        const previousFolder = folderStack[folderStack.length - 1];
        currentFolder = previousFolder;
        renderCards(previousFolder);
    }
}

// === ЗАГРУЗКА СОДЕРЖИМОГО MARKDOWN ===
async function loadFileContent(file) {
    try {
        cards.style.display = "none";
        content.style.display = "block";
        content.innerHTML = "<div class='loading'>Загрузка...</div>";
        
        const response = await fetch(file.path);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        const htmlContent = md.render(text);
        
        content.innerHTML = `
            <div class="markdown-content">
                <h1>${file.name}</h1>
                ${htmlContent}
                <button class="back-button" onclick="backToCards()">← Назад</button>
            </div>
        `;
        
    } catch (error) {
        console.error('Ошибка загрузки файла:', error);
        content.innerHTML = `
            <div class="error-message">
                <h3>Ошибка загрузки</h3>
                <p>Не удалось загрузить: ${file.name}</p>
                <p>Ошибка: ${error.message}</p>
                <button class="back-button" onclick="backToCards()">← Назад</button>
            </div>
        `;
    }
}

// === НАЗАД К КАРТОЧКАМ ===
function backToCards() {
    if (currentFolder) {
        renderCards(currentFolder);
    } else {
        showRootContent();
    }
}

// === ПОКАЗАТЬ КОРНЕВУЮ СТРУКТУРУ ===
function showRootContent() {
    cards.style.display = "flex";
    content.style.display = "none";
    folderStack = [];
    currentFolder = null;
    
    cards.innerHTML = '<div class="welcome-message"><h1>StarSu | Справочник по Starfindr</h1><p>Разработано специально для ваншота в Барреле 60/5</p><p>Космические ебать приключения</p></div>';
    
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

// === ИНИЦИАЛИЗАЦИЯ ===
function init() {
    renderSidebar();
    showRootContent();
    setupMobileSidebar();
    
    // Обработчики для мобильного меню
    hamburger.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', closeSidebar);
    
    // Закрытие меню при нажатии Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSidebar();
        }
    });
}

// Делаем функции глобальными для использования в onclick
window.backToCards = backToCards;

// Запускаем инициализацию когда DOM готов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}