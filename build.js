const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, "Data");
const OUTPUT = path.join(__dirname, "tree.js");

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
            // Используем относительные пути без кодирования
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

const tree = scanDir(DATA_DIR);

const output = `export const CONTENT_TREE = ${JSON.stringify(tree, null, 2)};`;

fs.writeFileSync(OUTPUT, output, "utf8");

console.log("✔ tree.js создан");