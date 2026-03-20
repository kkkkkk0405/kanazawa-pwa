// ==========================
// 設定・バージョン情報
// ==========================
const APP_CONFIG = {
  version: "ver 1.1.9",
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

// 通信状態の更新
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
// 左サイド：メニュー描画
// ==========================
const defaultLinks = [
  { label: "地図（デモ）", view: "map" },
  { label: "よくある質問", view: "faq" },
];

const transportation = {
  main: [
    { label: '🚌 交通案内（バス）', view: 'bus_top' }
  ]
};

// クイックリンク描画
function renderLinks() {
  const links = store.get("links", defaultLinks);
  const ul = $("#quickLinks");
  if (!ul) return;
  ul.innerHTML = "";
  links.forEach(({ label, view }) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.className = "link"; a.href = "#"; a.dataset.open = view;
    a.textContent = label;
    li.appendChild(a);
    ul.appendChild(li);
  });
}

// 交通メニュー描画 (1つに集約)
function renderTransport() {
  const ul = document.getElementById('transportLinks__hashiba');
  if (!ul) return;
  ul.innerHTML = '';
  transportation.main.forEach(({ label, view }) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'link'; a.href = '#'; a.dataset.open = view;
    a.textContent = label;
    li.appendChild(a);
    ul.appendChild(li);
  });
}

// 初期描画の実行
renderLinks();
renderTransport();

// ==========================
// 画像ライトボックス
// ==========================
function showImage(src, caption = '') {
  const box = document.getElementById('lightbox');
  const img = document.getElementById('lbImg');
  const cap = document.getElementById('lbCap');
  if (!box || !img) return;
  img.src = src;
  cap.textContent = caption;
  box.style.display = 'flex';
}

function hideImage() {
  const box = document.getElementById('lightbox');
  if (box) box.style.display = 'none';
}

if ($("#lbClose")) $("#lbClose").addEventListener('click', hideImage);

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
const titleMap = {
  home: "ホーム",
  map: "地図",
  faq: "よくある質問",
  bus_top: "交通案内",
  bus_hashiba_weekday: "橋場町行（平日）",
  bus_hashiba_holiday: "橋場町行（土日祝）",
  bus_hashiba_timetable: "橋場町行 時刻表"
};

const views = {
  home() {
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
  
  // bus.js からの機能を合体
  ...window.BusViews,
};

// ==========================
// 画面描画ユーティリティ
// ==========================
function card(title, body) {
  const d = document.createElement("div");
  d.className = "card";
  if (title) {
    const h = document.createElement("h2");
    h.textContent = title;
    d.appendChild(h);
  }
  const p = document.createElement("p");
  p.textContent = body;
  d.appendChild(p);
  return d;
}

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
  '#/bus/top': 'bus_top',
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
// PWA インストール関連
// ==========================
let deferredPrompt;
addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const b = document.getElementById("installBtn");
  if (b) b.hidden = false;
});