// main.js (ver 1.3.0)
const APP_CONFIG = { version: "ver 1.3.0", lastUpdated: "2026/03/20" };

window.$ = (s, r = document) => r.querySelector(s);
window.card = (title, body) => {
  const d = document.createElement("div"); d.className = "card";
  if (title) { d.innerHTML += `<h2>${title}</h2>`; }
  d.innerHTML += `<p>${body}</p>`;
  return d;
};

window.titleMap = {
  home: "ホーム", map: "地図", faq: "よくある質問",
  bus_top: "交通案内", bus_hashiba_menu: "橋場町方面", bus_library_menu: "県立図書館方面",
  shinkansen_top: "鉄道 運行状況一覧",
  bus_hashiba_weekday: "橋場町（平日）", bus_hashiba_holiday: "橋場町（土日祝）",
  bus_library_weekday: "図書館行（平日）", bus_library_holiday: "図書館行（土日祝）"
};

window.openView = (name) => {
  const v = $("#view"); const t = $("#viewTitle"); const b = $("#backBtn");
  if (!v || !t) return;
  b.style.display = (name === 'home') ? 'none' : 'inline-block';
  t.textContent = titleMap[name] ?? "案内";
  v.innerHTML = "";
  let viewFn = (window.BusViews ? window.BusViews[name] : null) || (window.ShinkansenViews ? window.ShinkansenViews[name] : null);
  const fn = viewFn || (() => card("ようこそ", "左のメニューからツールを選択してください。"));
  v.appendChild(fn());
  location.hash = name;
  v.scrollTop = 0;
};

// サイドバーの色と線を修正
function renderMenu() {
  const q = $('#quickLinks'); const t = $('#transportLinks');
  if (q) q.innerHTML = `<div class="link" onclick="openView('map')">🗺️ 地図（デモ）</div><div class="link" onclick="openView('faq')">❓ よくある質問</div>`;
  if (t) t.innerHTML = `<div class="link" onclick="openView('bus_top')">🚌 交通案内（バス）</div>`;
}

renderMenu();
const initial = location.hash.replace('#', '') || 'home';
setTimeout(() => openView(initial), 100);