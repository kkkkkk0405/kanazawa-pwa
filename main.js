// main.js ver 1.3.3
window.$ = (s, r = document) => r.querySelector(s);

window.titleMap = {
  home: "ホーム", map: "地図", faq: "よくある質問",
  bus_top: "交通案内", bus_hashiba_menu: "橋場町方面", bus_library_menu: "県立図書館方面",
  shinkansen_top: "鉄道 運行状況一覧",
  bus_hashiba_weekday: "橋場町（平日）", bus_hashiba_holiday: "橋場町（土日祝）",
  bus_library_weekday: "図書館行（平日）", bus_library_holiday: "図書館行（土日祝）",
  bus_hashiba_timetable: "橋場町 時刻表"
};

window.openView = (name) => {
  const v = $("#view"); const t = $("#viewTitle"); const b = $("#backBtn");
  if (!v || !t) return;
  
  // 戻るボタンの表示（ホーム以外は出す）
  b.style.display = (name === 'home') ? 'none' : 'inline-block';
  t.textContent = titleMap[name] ?? "案内";
  v.innerHTML = "";
  
  let viewFn = (window.BusViews ? window.BusViews[name] : null) || 
               (window.ShinkansenViews ? window.ShinkansenViews[name] : null);

  if (!viewFn) {
    if (name === 'map') viewFn = () => card("地図", "地図を準備中です。");
    if (name === 'faq') viewFn = () => card("よくある質問", "FAQを準備中です。");
  }

  const fn = viewFn || (() => card("ようこそ", "メニューを選択してください。"));
  v.appendChild(fn());
  location.hash = name;
  v.scrollTop = 0;
};

// 【重要】戻るボタンの挙動を完全に整理
$("#backBtn").onclick = () => {
  const h = location.hash.replace('#', '');
  if (h.includes('bus_hashiba_')) return openView('bus_hashiba_menu');
  if (h.includes('bus_library_')) return openView('bus_library_menu');
  if (h === 'bus_hashiba_menu' || h === 'bus_library_menu') return openView('bus_top');
  openView('home');
};

function renderMenu() {
  const q = $('#quickLinks'); const t = $('#transportLinks');
  if (q) q.innerHTML = `<div class="link" onclick="openView('map')">🗺️ 地図</div><div class="link" onclick="openView('faq')">❓ FAQ</div>`;
  if (t) t.innerHTML = `<div class="link" onclick="openView('bus_top')">🚌 交通案内（バス）</div>`;
}

renderMenu();
const initial = location.hash.replace('#', '') || 'home';
setTimeout(() => openView(initial), 150);