// ==========================
// 設定・バージョン情報
// ==========================
const APP_CONFIG = {
  version: "ver 1.1.3",
  lastUpdated: "2026/03/20", // ← 更新時はここ書き換える
};

// ==========================
// ストレージ / ユーティリティ
// ==========================
const store = {
  get(k, f) {
    try { return JSON.parse(localStorage.getItem(k)) ?? f } catch { return f }
  },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)) },
};

const $ = (s, r = document) => r.querySelector(s);

// 通信状態
function updateNet() {
  const d = $("#netDot");
  if (!d) return;
  d.textContent = "●";
  d.className = navigator.onLine ? "ok" : "warn";
}
addEventListener("online", updateNet);
addEventListener("offline", updateNet);
updateNet();

// ==========================
// 左サイド：クイックリンク（編集可）
// ==========================
const defaultLinks = [
  { label: "地図（デモ）",         view: "map"   },
  { label: "よくある質問",         view: "faq"   },
  // ※ メモ機能は削除しました
];

function renderLinks() {
  // ※メモ削除に伴いstoreキーが変わるわけではないですが、初期値からメモが消えます
  const links = store.get("links", defaultLinks);
  const ul = $("#quickLinks");
  if (!ul) return;
  ul.innerHTML = "";

  for (const { label, view } of links) {
    const li = document.createElement("li");
    const a  = document.createElement("a");
    a.className = "link";
    a.href = "#";
    a.dataset.open = view;
    a.textContent = label;
    li.appendChild(a);
    ul.appendChild(li);
  }
}

// ==========================
// 左サイド：交通（固定 / ハッシュ遷移）
// ==========================
const transportation = {
  hashiba: [
    { label: '橋場町行バス（平日）',  view: 'bus_hashiba_weekday'   },
    { label: '橋場町行バス（土日祝）', view: 'bus_hashiba_holiday'   },
    { label: '橋場町行時刻表',        view: 'bus_hashiba_timetable' },
  ],
  library: [
    // 今後追加予定
  ]
};

function renderTransport(){
  // 橋場町行
  const ulHashiba = document.getElementById('transportLinks__hashiba');
  if (ulHashiba){
    ulHashiba.innerHTML = '';
    for (const { label, view } of transportation.hashiba){
      const li = document.createElement('li');
      const a  = document.createElement('a');
      a.className = 'link';
      a.href = '#';
      a.dataset.open = view;
      a.textContent = label;
      li.appendChild(a);
      ulHashiba.appendChild(li);
    }
  }

  // 県立図書館行き
  const ulLib = document.getElementById('transportLinks__library');
  if (ulLib){
    ulLib.innerHTML = '';
    for (const { label, view } of transportation.library){
      const li = document.createElement('li');
      const a  = document.createElement('a');
      a.className = 'link';
      a.href = '#';
      a.dataset.open = view;
      a.textContent = label;
      li.appendChild(a);
      ulLib.appendChild(li);
    }
  }
}

// 初期描画（サイド）
renderLinks();
renderTransport();

// ==========================
// 画像ライトボックス
// ==========================
function showImage(src, caption=''){
  const box = document.getElementById('lightbox');
  const img = document.getElementById('lbImg');
  const cap = document.getElementById('lbCap');
  img.src = src;
  cap.textContent = caption;
  box.style.display = 'flex';
}
function hideImage(){
  const box = document.getElementById('lightbox');
  const img = document.getElementById('lbImg');
  box.style.display = 'none';
  img.src = '';
}
if(document.getElementById('lbClose')) {
  document.getElementById('lbClose').addEventListener('click', hideImage);
}
if(document.getElementById('lightbox')) {
  document.getElementById('lightbox').addEventListener('click', (e)=>{
    if(e.target.id === 'lightbox') hideImage();
  });
}

// ==========================
// クリックハンドラ
// ==========================
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-open]");
  if (!a) return;
  e.preventDefault();
  openView(a.dataset.open);
});

// ==========================
// ビュー：画面コンポーネント
// ==========================
const views = {
  home() {
    const wrap = document.createElement("div");
    
    // ホーム画面のコンテンツ
    wrap.appendChild(card("ようこそ", "左のメニューから業務ツールを選択してください。"));
    
    // バージョン情報の表示エリア
    const info = document.createElement("div");
    info.style.marginTop = "2rem";
    info.style.padding = "1rem";
    info.style.color = "#6b7280"; // グレー文字
    info.style.fontSize = "0.85rem";
    info.style.textAlign = "center";
    info.style.borderTop = "1px solid #e5e7eb";
    info.innerHTML = `
      <p>App Version: <strong>${APP_CONFIG.version}</strong></p>
      <p>Last Updated: ${APP_CONFIG.lastUpdated}</p>
    `;
    
    wrap.appendChild(info);
    return wrap;
  },
  map() {
    return card("地図（デモ）", "本番では地図SDKや静的マップ画像をキャッシュして表示。");
  },
  faq() {
    return card("よくある質問", "後で定型文を入れられるようにします。");
  },
  // ※ notes() は削除しました

  ...window.BusViews, // ←bus.js
  
  // 画像時刻表
  bus_hashiba_timetable() {
    const wrap = document.createElement("div");
    wrap.appendChild(card("橋場町行 時刻表", "平日・土日祝のダイヤをまとめて表示しています。"));

    const img = document.createElement("img");
    img.src = "./images/hashibacho-202603.png";
    img.alt = "橋場町行バス時刻表";
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.border = "1px solid #1f2937";
    img.style.borderRadius = "0.5rem";

    wrap.appendChild(img);
    return wrap;
  }
};

// ==========================
// 画面描画ユーティリティ
// ==========================
function card(title, body) {
  const d = document.createElement("div");
  d.className = "card";
  const h = document.createElement("h2");
  h.textContent = title;
  const p = document.createElement("p");
  p.textContent = body;
  d.append(h, p);
  return d;
}

const titleMap = {
  home: "ホーム",
  map: "地図（デモ）",
  faq: "よくある質問",
  // ※ notes は削除しました
  bus_hashiba_weekday: "橋場町行バス（平日）",
  bus_hashiba_holiday: "橋場町行バス（土日祝）",
  bus_hashiba_timetable: "橋場町行 時刻表"
};

function openView(name) {
  const v = $("#view");
  const t = $("#viewTitle");
  if (!v || !t) return;
  t.textContent = titleMap[name] ?? name;
  v.innerHTML = "";
  const fn = views[name] || views.home;
  v.appendChild(fn());
}

// 検索フォーカス
addEventListener("keydown", (e) => {
  if (e.key === "/" || e.key.toLowerCase() === "q") {
    e.preventDefault();
    const q = $("#q");
    if (q) q.focus();
  }
});

// ==========================
// ハッシュルーター
// ==========================
const routes = {
  '#/home':           'home',
  '#/bus/weekday':    'bus_hashiba_weekday',
  '#/bus/holiday':    'bus_hashiba_holiday',
  '#/bus/timetable':  'bus_hashiba_timetable',
};

function openRoute() {
  const h = location.hash || '#/home';
  const viewName = routes[h] || 'home';
  openView(viewName);
}

window.addEventListener('hashchange', openRoute);

if (!location.hash) location.hash = '#/home';
openRoute();

// ==========================
// A2HS
// ==========================
let deferredPrompt;
addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const b = document.getElementById("installBtn");
  if (!b) return;
  b.hidden = false;
  b.addEventListener("click", async () => {
    b.hidden = true;
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  });
});
