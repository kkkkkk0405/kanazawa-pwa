// ==========================
// 設定・バージョン情報
// ==========================
const APP_CONFIG = {
  version: "ver 1.1.6",
  lastUpdated: "2026/03/20",
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
// 左サイド：クイックリンク
// ==========================
const defaultLinks = [
  { label: "地図（デモ）",         view: "map"   },
  { label: "よくある質問",         view: "faq"   },
];

function renderLinks() {
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
// 左サイド：交通
// ==========================
const transportation = {
  hashiba: [
    { label: '橋場町行バス（平日）',  view: 'bus_hashiba_weekday'   },
    { label: '橋場町行バス（土日祝）', view: 'bus_hashiba_holiday'   },
    { label: '橋場町行時刻表',        view: 'bus_hashiba_timetable' },
  ],
  library: []
};

function renderTransport(){
  const ulHashiba = document.getElementById('transportLinks__hashiba');
  if (ulHashiba){
    ulHashiba.innerHTML = '';
    for (const { label, view } of transportation.hashiba){
      const li = document.createElement('li');
      const a  = document.createElement('a');
      a.className = "link";
      a.href = "#";
      a.dataset.open = view;
      a.textContent = label;
      li.appendChild(a);
      ulHashiba.appendChild(li);
    }
  }
}

// 初期描画
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
  box.style.display = 'none';
}
if($("#lbClose")) $("#lbClose").addEventListener('click', hideImage);

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
  home() { // ← ここを修正しました（homeを追加）
    const wrap = document.createElement("div");
    wrap.appendChild(card("ようこそ", "左のメニューから業務ツールを選択してください。"));
    const info = document.createElement("div");
    info.style.marginTop = "2rem";
    info.style.padding = "1rem";
    info.style.color = "#6b7280";
    info.style.fontSize = "0.85rem";
    info.style.textAlign = "center";
    info.style.borderTop = "1px solid #1f2937";
    info.innerHTML = `<p>App Version: <strong>${APP_CONFIG.version}</strong></p><p>Last Updated: ${APP_CONFIG.lastUpdated}</p>`;
    wrap.appendChild(info);
    return wrap;
  },
  map() { return card("地図（デモ）", "本番では地図を表示します。"); },
  faq() { return card("よくある質問", "よくある質問をここにまとめます。"); },
  ...window.BusViews,
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
  map: "地図",
  faq: "よくある質問",
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

// ハッシュルーター
const routes = {
  '#/home': 'home',
  '#/bus/weekday': 'bus_hashiba_weekday',
  '#/bus/holiday': 'bus_hashiba_holiday',
  '#/bus/timetable': 'bus_hashiba_timetable',
};

function openRoute() {
  const h = location.hash || '#/home';
  openView(routes[h] || 'home');
}
window.addEventListener('hashchange', openRoute);
openRoute();

// ==========================
// A2HS
// ==========================
let deferredPrompt;
addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const b = document.getElementById("installBtn"); // ← ここを修正しました（b homeを修正）
  if (!b) return;
  b.hidden = false;
});