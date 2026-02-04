
const mods = document.getElementById("mods");
const counter = document.getElementById("mod-counter");

let currentRequestId = 0;

// bytes → readable size
function formatBytes(bytes) {
  if (!bytes) return "Unknown";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

// remove extension (for clean title)
function clean(name) {
  return name.replace(/\.[^/.]+$/, "");
}

// LOAD ANY FILE FROM FOLDER
async function load(cat) {
  const requestId = ++currentRequestId;

  mods.innerHTML = "Loading files...";
  counter.innerText = "";

  try {
    const res = await fetch(`https://auto.h208698.workers.dev/${cat}`);
    const data = await res.json();

    // prevent category mix bug
    if (requestId !== currentRequestId) return;

    mods.innerHTML = "";
    let count = 0;

    data.files.forEach(f => {
      count++;

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <h3>${clean(f.name)}</h3>
        <p style="font-size:13px;color:#aaa">
          Type: ${f.mimeType || "unknown"} <br>
          Size: ${formatBytes(f.size)}
        </p>
        <button class="download"
          onclick="window.open('${f.webViewLink}','_blank')">
          Open
        </button>
      `;

      mods.appendChild(card);
    });

    counter.innerText = `Total files: ${count}`;

    if (count === 0) {
      mods.innerHTML = "<p style='opacity:.6'>No files found</p>";
    }

  } catch (e) {
    mods.innerHTML = "Failed to load files";
    console.error(e);
  }
}
