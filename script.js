
const mods = document.getElementById("mods");
const counter = document.getElementById("mod-counter");
let currentRequestId = 0;

function clean(name) {
  return name.replace(/\.(zip|7z|rar)$/i, "");
}

// bytes → KB / MB
function formatBytes(bytes) {
  if (!bytes) return "Unknown";
  const sizes = ["Bytes","KB","MB","GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

// check image exists
function imageExists(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src + "?v=" + Date.now();
  });
}

async function getPreview(name) {
  for (let ext of ["png","jpg","jpeg","gif"]) {
    const src = `${name}.${ext}`;
    if (await imageExists(src)) return src;
  }
  return "placeholder.png";
}

// ================= CATEGORY LOAD =================
async function load(cat) {
  const requestId = ++currentRequestId;
  mods.innerHTML = "Loading...";
  counter.innerText = "";

  try {
    const res = await fetch(`https://auto.h208698.workers.dev/${cat}`, {
      cache: "force-cache"
    });
    const data = await res.json();

    if (requestId !== currentRequestId) return;

    mods.innerHTML = "";
    let count = 0;

    for (let f of data.files) {
      if (!/\.(zip|7z|rar)$/i.test(f.name)) continue;

      count++;
      const name = clean(f.name);
      const preview = await getPreview(name);
      if (requestId !== currentRequestId) return;

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
  <img
    src="previews/${name}.jpg"
    loading="lazy"
    onerror="this.src='placeholder.png'"
    style="width:100%;height:220px;object-fit:cover;border-radius:12px"
  >
  <h3>${name}</h3>
  <p style="font-size:14px;color:#aaa">
    Size: ${formatBytes(f.size)}
  </p>
  <button class="download"
    onclick="window.open('${f.webViewLink}','_blank')">
    Download
  </button>
`;
      mods.appendChild(card);
    }

    counter.innerText = `Total mods: ${count}`;
  } catch (e) {
    mods.innerHTML = "Failed to load mods";
    console.error(e);
  }
}

// ================= HOME PAGE NEW MODS =================
const categories = ["jojo","dmc","bleach","onepiece","others"];
const FOUR_DAYS = 4 * 24 * 60 * 60 * 1000;

async function loadHomeNewMods() {
  const container = document.getElementById("homeNewMods");
  container.innerHTML = "";

  let all = [];

  await Promise.all(
    categories.map(cat =>
      fetch(`https://auto.h208698.workers.dev/${cat}`, { cache:"force-cache" })
        .then(r => r.json())
        .then(d => {
          d.files.forEach(f => {
            if (/\.(zip|7z|rar)$/i.test(f.name)) {
              f.category = cat;
              all.push(f);
            }
          });
        })
    )
  );

  const now = Date.now();

  all.forEach(mod => {
    const created = new Date(mod.createdTime || now);
    if (now - created <= FOUR_DAYS) {
      const div = document.createElement("div");
      div.className = "new-mod-badge";
      div.innerHTML = `🆕 New mod added: ${clean(mod.name)}`;
      div.onclick = () => load(mod.category); // redirect to category
      container.appendChild(div);
    }
  });
}

// call on home page
loadHomeNewMods();
