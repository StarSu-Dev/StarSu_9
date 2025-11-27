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
                t: "f", // type: folder (укороченные ключи)
                n: entry.name, // name
                c: scanDir(full) // children
            };
        }

        if (entry.isFile() && entry.name.endsWith(".md")) {
            const content = fs.readFileSync(full, 'utf8');
            return {
                t: "d", // type: document
                n: entry.name.replace(".md", ""), // name
                d: content // data (content)
            };
        }

        return null;
    }).filter(Boolean);
}

const tree = scanDir(DATA_DIR);

// Минифицированный вывод
const output = `export const C=${JSON.stringify(tree)};`;

fs.writeFileSync(OUTPUT, output, "utf8");

console.log("✔ content.js создан (минифицированный)");