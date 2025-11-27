const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "Data");
const OUTPUT = path.join(__dirname, "siteMap.js");

function buildSiteMap() {
  let result = {};

  const dirs = fs.readdirSync(DATA_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  dirs.forEach(dir => {
    const folderPath = path.join(DATA_DIR, dir);

    const files = fs.readdirSync(folderPath)
      .filter(f => f.endsWith(".md"))
      .map(f => f.replace(/\.md$/, ""));

    result[dir] = files;
  });

  const js = "window.SITE_MAP = " + JSON.stringify(result, null, 2) + ";";

  fs.writeFileSync(OUTPUT, js, "utf8");

  console.log("siteMap.js успешно создан!");
}

buildSiteMap();
