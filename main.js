// main.js ver 1.3.1
const APP_CONFIG = { version: "ver 1.3.1", lastUpdated: "2026/03/20" };

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
  
  // 各ファイルから画面関数を探す
  let viewFn = (window.BusViews ? window.BusViews[name] : null) || 
               (window.ShinkansenViews ? window.ShinkansenViews[name] : null) ||
               (name === 'map' ? () => card("地図", "地図を準備中です。") : null) ||
               (name === 'faq' ? () => card("よくある質問", "FAQを準備中です。") : null);

  const fn = viewFn || (() => card("ようこそ", "左のメニューからツールを選択してください。"));
  v.appendChild(fn());
  
  location.hash = name;
  v.scrollTop = 0;
};

// 戻るボタンの動作（階層に合わせて戻り先を変える）
$("#backBtn").onclick = () => {
  const h = location.hash;
  if (h.includes('bus_hashiba_')) return openView('bus_hashiba_menu');
  if (h.includes('bus_library_')) return openView('bus_library_menu');
  if (h.includes('bus_') || h.includes('shinkansen_')) return openView('home');
  openView('home');
};

function renderMenu() {
  const q = $('#quickLinks'); const t = $('#transportLinks');
  if (q) q.innerHTML = `<div class="link" onclick="openView('map')">🗺️ 地図（デモ）</div><div class="link" onclick="openView('faq')">❓ よくある質問</div>`;
  if (t) t.innerHTML = `<div class="link" onclick="openView('bus_top')">🚌 交通案内（バス）</div>`;
}

window.showImage = (src, cap) => { const l=$("#lightbox"); const i=$("#lbImg"); const c=$("#lbCap"); i.src=src; c.textContent=cap; l.style.display='flex'; };
window.hideImage = () => { $("#lightbox").style.display='none'; };

renderMenu();
const initial = location.hash.replace('#', '') || 'home';
setTimeout(() => openView(initial), 150); // 読み込み待ち時間を少し長めに