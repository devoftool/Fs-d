
const mods = document.getElementById("mods");
const counter = document.getElementById("mod-counter");

// change if needed
const IMAGE_BASE = "./";

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

// main loader
async function load(cat) {
  const requestId = ++currentRequestId;

  mods.innerHTML = "Loading...";
  counter.innerText = "";

  try {
    const res = await fetch(`https://auto.h208698.workers.dev/${cat}`);
    const data = await res.json();

    if (requestId !== currentRequestId) return;

    mods.innerHTML = "";
    let total = 0;

    data.files.forEach(f => {
      total++;

      const name = clean(f.name);
      const card = document.createElement("div");
      card.className = "card";

      let imgHTML = "";

      // check image silently
      const img = new Image();
      img.src = `${IMAGE_BASE}${name}.jpg`;

      img.onload = () => {
        imgHTML = `
          <img
            src="${img.src}"
            loading="lazy"
            style="width:100%;height:200px;object-fit:cover;border-radius:12px"
          >
        `;
        render();
      };

      img.onerror = () => {
        render(); // no image
      };

      function render() {
        if (card.innerHTML !== "") return;

        card.innerHTML = `
          ${imgHTML}
          <h3>${name}</h3>
          <p style="font-size:13px;color:#aaa">
            Size: ${formatBytes(f.size)}
          </p>
          <button class="download"
            onclick="window.open('${f.webViewLink}','_blank')">
            Open
          </button>
        `;
      }

      mods.appendChild(card);
    });

    counter.innerText = `Total mods: ${total}`;

    if (total === 0) {
      mods.innerHTML = "<p style='opacity:.6'>No mods found</p>";
    }

  } catch (err) {
    mods.innerHTML = "Failed to load mods";
    console.error(err);
  }
}

window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      document.body.classList.add("scrolled");
    } else {
      document.body.classList.remove("scrolled");
    }
  });
  
  window.addEventListener("scroll", () => {
  const sc = window.scrollY;
  const img = document.querySelector(".banner .gif");
  if (img) {
    img.style.filter = `blur(${Math.min(sc / 60, 6)}px)`;
  }
});
