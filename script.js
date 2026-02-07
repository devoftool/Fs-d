
const mods = document.getElementById("mods");
const counter = document.getElementById("mod-counter");
const MESSAGE_ID = "download-msg";
const IMAGE_BASE = "./img/";
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

// show preparing message
function showMessage(text) {
  let msg = document.getElementById(MESSAGE_ID);
  if (!msg) {
    msg = document.createElement("div");
    msg.id = MESSAGE_ID;
    msg.style.position = "fixed";
    msg.style.top = "20px";
    msg.style.right = "20px";
    msg.style.padding = "12px 18px";
    msg.style.background = "#222";
    msg.style.color = "#fff";
    msg.style.borderRadius = "8px";
    msg.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";
    msg.style.zIndex = 9999;
    document.body.appendChild(msg);
  }
  msg.innerText = text;
  msg.style.display = "block";
}

// hide message
function hideMessage() {
  const msg = document.getElementById(MESSAGE_ID);
  if (msg) msg.style.display = "none";
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
      const img = new Image();
      img.src = `${IMAGE_BASE}${name}.jpg`;
      img.onload = () => {
        imgHTML = `<img src="${img.src}" loading="lazy" style="width:100%;height:200px;object-fit:cover;border-radius:12px">`;
        render();
      };
      img.onerror = () => { render(); };
      
      function render() {
        if (card.innerHTML !== "") return;
        card.innerHTML = `
          ${imgHTML}
          <h3>${name}</h3>
          <p style="font-size:13px;color:#aaa">Size: ${formatBytes(f.size)}</p>
          <button class="download">Download</button>
        `;
        const btn = card.querySelector(".download");
        btn.addEventListener("click", () => startDownload(f));
      }
      
      mods.appendChild(card);
    });
    
    counter.innerText = `Total mods: ${total}`;
    if (total === 0) mods.innerHTML = "<p style='opacity:.6'>No mods found</p>";
    
  } catch (err) {
    mods.innerHTML = "Failed to load mods";
    console.error(err);
  }
}

// WebView-friendly download
function startDownload(file) {
  showMessage("Preparing your download...");

  // Small delay to simulate preparation (optional)
  setTimeout(() => {
    try {
      // Native WebView bridge call
      if (window.Android && window.Android.startDownload) {
        window.Android.startDownload(file.download, file.name);
        hideMessage(); // hide immediately after native call
      } else {
        // Fallback: normal browser download
        const a = document.createElement("a");
        a.href = file.download;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        hideMessage(); // hide after fallback click
      }
    } catch (e) {
      console.error("Download failed", e);
      hideMessage();
      alert("Download failed!");
    }
  }, 1000); // 1 sec wait to show message
}

// scroll effects
window.addEventListener("scroll", () => {
  if (window.scrollY > 20) document.body.classList.add("scrolled");
  else document.body.classList.remove("scrolled");
});
window.addEventListener("scroll", () => {
  const sc = window.scrollY;
  const img = document.querySelector(".banner .gif");
  if (img) img.style.filter = `blur(${Math.min(sc / 60, 6)}px)`;
});
