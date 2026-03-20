// ==========================
// main.js (ver 1.2.5)
// ==========================
const APP_CONFIG = { version: "ver 1.2.5", lastUpdated: "2026/03/20" };

window.$ = (s, r = document) => r.querySelector(s);

// 共通カード作成
window.card = (title, body) => {
  const d = document.createElement("div"); d.className = "card";
  if (title) { const h = document.createElement("h2"); h.textContent = title; d.appendChild(h); }
  const p = document.createElement("p"); p.textContent = body; d.appendChild(p);
  return d;
};

// タイトルマップ
window.titleMap = {
  home: "ホーム", map: "地図", faq: "よくある質問",
  bus_top: "交通案内", bus_hashiba_menu: "橋場町方面", bus_library_menu: "県立図書館方面",
  shinkansen_top: "鉄道 運行状況一覧",
  bus_hashiba_weekday: "橋場町（平日）", bus_hashiba_holiday: "橋場町（土日祝）",
  bus_library_weekday: "図書館行（平日）", bus_library_holiday: "図書館行（土日祝）"
};

const localViews = {
  home() {
    const d = document.createElement("div");
    d.appendChild(card("ようこそ", "左のメニューからツールを選択してください。"));
    const i = document.createElement("p"); i.style.cssText = "color:var(--muted); font-size:0.8rem; text-align:center; margin-top:20px;";
    i.textContent = `${APP_CONFIG.version} | ${APP_CONFIG.lastUpdated}`;
    d.appendChild(i);
    return d;
  },
  map() { return card("地図", "地図を準備中です。"); },
  faq() { return card("よくある質問", "FAQを準備中です。"); }
};

window.openView = (name) => {
  const v = $("#view"); const t = $("#viewTitle"); const b = $("#backBtn");
  if (!v || !t) return;
  
  b.style.display = (name === 'home') ? 'none' : 'inline-block';
  t.textContent = titleMap[name] ?? "案内";
  v.innerHTML = "";
  
  // 画面関数を探す（BusViewsやShinkansenViewsからも探す）
  let viewFn = localViews[name] || (window.BusViews ? window.BusViews[name] : null) || (window.ShinkansenViews ? window.ShinkansenViews[name] : null);
  const fn = viewFn || localViews.home;
  v.appendChild(fn());
  
  location.hash = name;
  v.scrollTop = 0;
};

// 戻るボタンの動作
$("#backBtn").onclick = () => {
  const h = location.hash;
  if (h.includes('bus_hashiba_')) return openView('bus_hashiba_menu');
  if (h.includes('bus_library_')) return openView('bus_library_menu');
  if (h.includes('bus_') || h.includes('shinkansen_')) return openView('home');
  openView('home');
};

// サイドバーメニュー（IDを一致させた）
function renderMenu() {
  const q = $('#quickLinks'); const t = $('#transportLinks');
  if (q) q.innerHTML = `<a class="link" onclick="openView('map')">🗺️ 地図（デモ）</a><a class="link" onclick="openView('faq')">❓ よくある質問</a>`;
  if (t) t.innerHTML = `<a class="link" onclick="openView('bus_top')">🚌 交通案内（バス）</a>`;
}

// 写真表示
window.showImage = (src, cap) => { const l=$("#lightbox"); const i=$("#lbImg"); const c=$("#lbCap"); i.src=src; c.textContent=cap; l.style.display='flex'; };
window.hideImage = () => { $("#lightbox").style.display='none'; };

// 起動処理
renderMenu();
const initial = location.hash.replace('#', '') || 'home';
// 少し待ってから開くことで別ファイルの読み込み完了を待つ
setTimeout(() => openView(initial), 100);