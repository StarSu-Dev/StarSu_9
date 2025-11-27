import { CONTENT_TREE } from "./tree.js";

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
        
        card.innerHTML = `
            <div class="card-title">${file.name}</div>
            <div class="card-preview">Нажмите для просмотра</div>
        `;
        
        card.onclick = () => loadFile(file.path);
        cards.appendChild(card);
    });

    // Показываем карточки, скрываем контент
    cards.style.display = "flex";
    content.style.display = "none";
}

// === Загрузка Markdown (карточки исчезают) ===
async function loadFile(filePath) {
    try {
        // Скрываем карточки, показываем контент
        cards.style.display = "none";
        content.style.display = "block";
        
        // Показываем загрузку
        content.innerHTML = "<div class='loading'>Загрузка...</div>";
        
        // Пробуем разные варианты путей для GitHub Pages
        const pathsToTry = [
            filePath,
            `./${filePath}`,
            filePath.replace(/^Data\//, ''),
            encodeURI(filePath),
            encodeURI(`./${filePath}`)
        ];

        let response;
        let successfulPath = '';

        for (const path of pathsToTry) {
            try {
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
        content.innerHTML = `
            <button class="back-button" onclick="backToCards()">← Назад к карточкам</button>
            <div class="markdown-content">${md.render(text)}</div>
        `;
        
    } catch (error) {
        console.error('Ошибка загрузки файла:', error);
        content.innerHTML = `
            <button class="back-button" onclick="backToCards()">← Назад к карточкам</button>
            <div class="error-message">
                <h3>Ошибка загрузки</h3>
                <p>Файл не найден: ${filePath}</p>
                <p>Проверьте:</p>
                <ul>
                    <li>Файл существует в репозитории</li>
                    <li>Путь к файлу правильный</li>
                    <li>Файл имеет расширение .md</li>
                </ul>
                <p>Ошибка: ${error.message}</p>
            </div>
        `;
    }
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