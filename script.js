
const API_KEY = "AIzaSyCO4fkmR0fTEhBMYWOwZo3T5tklRai8zNg";

const FOLDERS = {
  jojo: "17DNkCeJBzzMasarE4zx5TSGIZF9g8ktl",
  dmc: "1l-ofs-am-y4OH4SJbbSRyEC4KncErK78",
  bleach: "1RqLv9t5bQExH3MW3CSiNpaBKUQpXS51c",
  onepiece: "1pwCTYUIPtHrnRhcUVlSKZhyangXvLEbV",
  others: "1GXbjpOMbfZa0r4gbspPATG5HFwzEOV8G"
};

const mods = document.getElementById("mods");
const counter = document.getElementById("mod-counter");
let currentRequestId = 0;

function clean(name) {
  return name.replace(/\.(zip|7z|rar)$/i, "");
}

// convert bytes → KB / MB / GB
function formatBytes(bytes) {
  if (bytes === undefined) return "Unknown";
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

function imageExists(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src + "?v=" + Date.now();
  });
}

async function getPreview(name) {
  const exts = ["png", "jpg", "jpeg", "gif"];
  for (let ext of exts) {
    const src = `${name}.${ext}`;
    if (await imageExists(src)) return src;
  }
  return "placeholder.png";
}

async function load(cat) {
  const requestId = ++currentRequestId;
  mods.innerHTML = "Loading...";
  counter.innerText = "";
  
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${FOLDERS[cat]}' in parents&fields=files(id,name,mimeType,size)&key=${API_KEY}`
  );
  const data = await res.json();
  
  if (requestId !== currentRequestId) return;
  
  mods.innerHTML = "";
  let modCount = 0;
  
  for (let f of data.files) {
    if (!/\.(zip|7z|rar)$/i.test(f.name)) continue;
    
    modCount++;
    const name = clean(f.name);
    const preview = await getPreview(name);
    if (requestId !== currentRequestId) return;
    
    const sizeText = formatBytes(f.size);
    
    const card = document.createElement("div");
    card.className = "card";
    
    card.innerHTML = `
      <img 
        src="${preview}"
        loading="lazy"
        style="width:100%;height:220px;object-fit:cover;border-radius:12px"
      >
      <h3>${name}</h3>
      <p style="font-size:14px;color:#aaa;margin:4px 0">Size: ${sizeText}</p>
      <button class="download"
        onclick="window.open('https://drive.google.com/uc?id=${f.id}&export=download')">
        Download
      </button>
    `;
    
    mods.appendChild(card);
  }
  
  counter.innerText = `Total mods: ${modCount}`;
}

// Fetch all categories for Home page
const categories = ["jojo","dmc","bleach","onepiece","others"];
let allMods = [];

Promise.all(categories.map(cat =>
  fetch(`https://www.googleapis.com/drive/v3/files?q='${FOLDERS[cat]}' in parents&fields=files(id,name,mimeType,thumbnailLink,createdTime)&key=${API_KEY}`)
    .then(r=>r.json())
)).then(results => {
  results.forEach(d=>{
    d.files.forEach(f=>{
      if(f.mimeType==="application/zip" || f.mimeType==="application/x-7z-compressed" || f.mimeType==="application/vnd.rar"){
        allMods.push(f);
      }
    });
  });

  displayHomeNewMods(allMods);
});

function displayHomeNewMods(mods){
  const container = document.getElementById("homeNewMods");
  container.innerHTML = "";
  const FOUR_DAYS = 4 * 24 * 60 * 60 * 1000;

  mods.forEach(mod=>{
    const modDate = new Date(mod.createdTime);
    if(Date.now() - modDate <= FOUR_DAYS){
      const div = document.createElement("div");
      div.className = "new-mod-badge";
      div.innerHTML = `New mod added: ${mod.name}`;
      container.appendChild(div);
    }
  });
}
