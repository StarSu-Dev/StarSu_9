const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, "Data");
const OUTPUT = path.join(__dirname, "content.js");

function scanDir(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    return items.map(entry => {
        const full = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            return {
                type: "folder",
                name: entry.name,
                children: scanDir(full)
            };
        }

        if (entry.isFile() && entry.name.endsWith(".md")) {
            // Сохраняем только путь к файлу, не содержимое
            const relativePath = path.relative(__dirname, full).replace(/\\/g, "/");
            return {
                type: "file",
                name: entry.name.replace(".md", ""),
                path: relativePath
            };
        }

        return null;
    }).filter(Boolean);
}

console.log("🔍 Сканирую структуру папок...");
const tree = scanDir(DATA_DIR);

const output = `// Структура папок и файлов
export const CONTENT_TREE = ${JSON.stringify(tree, null, 2)};`;

fs.writeFileSync(OUTPUT, output, "utf8");

// Статистика
let folderCount = 0;
let fileCount = 0;

function countItems(items) {
    items.forEach(item => {
        if (item.type === "folder") {
            folderCount++;
            if (item.children) countItems(item.children);
        } else if (item.type === "file") {
            fileCount++;
        }
    });
}
countItems(tree);

console.log(`✅ content.js создан!`);
console.log(`📊 Статистика: ${folderCount} папок, ${fileCount} файлов`);
console.log(`📦 Размер файла: ${(Buffer.byteLength(output, 'utf8') / 1024 / 1024).toFixed(2)} MB`);