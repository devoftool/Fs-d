
const mods = document.getElementById("mods");
const counter = document.getElementById("mod-counter");

const IMAGE_BASE = "./";
const WORKER_BASE = "https://auto.h208698.workers.dev";

let currentRequestId = 0;

// bytes → readable
function formatBytes(bytes) {
  if (!bytes) return "Unknown";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

// remove extension
function clean(name) {
  return name.replace(/\.[^/.]+$/, "");
}

// extract google drive id
function getDriveId(url) {
  const m = url.match(/id=([^&]+)/);
  return m ? m[1] : null;
}

// main loader
async function load(cat) {
  const requestId = ++currentRequestId;

  mods.innerHTML = "Loading...";
  counter.innerText = "";

  try {
    const res = await fetch(`${WORKER_BASE}/${cat}`);
    const data = await res.json();

    if (requestId !== currentRequestId) return;

    mods.innerHTML = "";
    let total = 0;

    data.files.forEach(f => {
      total++;

      const name = clean(f.name);
      const fileId = getDriveId(f.download);

      const card = document.createElement("div");
      card.className = "card";

      let imgHTML = "";

      const img = new Image();
      img.src = `${IMAGE_BASE}${name}.jpg`;

      img.onload = () => {
        imgHTML = `
          <img src="${img.src}"
               loading="lazy"
               style="width:100%;height:200px;object-fit:cover;border-radius:12px">
        `;
        render();
      };

      img.onerror = render;

      function render() {
        if (card.innerHTML) return;

        card.innerHTML = `
          ${imgHTML}
          <h3>${name}</h3>
          <p style="font-size:13px;color:#aaa">
            Size: ${f.sizeMB || "?"} MB
          </p>

          ${
            fileId
              ? `<button class="download"
                   onclick="window.location.href='${WORKER_BASE}/download/${fileId}'">
                   Download
                 </button>`
              : `<button class="download" disabled>
                   Invalid link
                 </button>`
          }
        `;
      }

      mods.appendChild(card);
    });

    counter.innerText = `Total mods: ${total}`;

    if (!total) {
      mods.innerHTML = "<p style='opacity:.6'>No mods found</p>";
    }

  } catch (err) {
    mods.innerHTML = "Failed to load mods";
    console.error(err);
  }
}

// scroll effects
window.addEventListener("scroll", () => {
  document.body.classList.toggle("scrolled", window.scrollY > 20);

  const img = document.querySelector(".banner .gif");
  if (img) {
    img.style.filter = `blur(${Math.min(window.scrollY / 60, 6)}px)`;
  }
});
