const md = window.markdownit({ html: true });

function renderSidebar() {
  const sidebar = document.getElementById("sidebar");

  Object.entries(window.SITE_MAP).forEach(([folder, files]) => {
    const folderEl = document.createElement("div");
    folderEl.className = "folder";
    folderEl.textContent = folder;
    sidebar.appendChild(folderEl);

    files.forEach(file => {
      const fileEl = document.createElement("div");
      fileEl.className = "file";
      fileEl.textContent = file;

      fileEl.onclick = () => openPage(folder, file);

      sidebar.appendChild(fileEl);
    });
  });
}

async function openPage(folder, file) {
  const url = `Data/${folder}/${file}.md`;
  const res = await fetch(url);
  const text = await res.text();

  document.getElementById("content").innerHTML = md.render(text);

  history.pushState({}, "", `?page=${encodeURIComponent(folder)}/${encodeURIComponent(file)}`);
}

function init() {
  renderSidebar();

  const params = new URLSearchParams(location.search);
  if (params.has("page")) {
    const [folder, file] = params.get("page").split("/");
    openPage(decodeURIComponent(folder), decodeURIComponent(file));
  }
}

init();
