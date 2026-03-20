// ==========================
// 設定・バージョン情報
// ==========================
const APP_CONFIG = {
  version: "ver 1.2.3",
  lastUpdated: "2026/03/20",
};

// ユーティリティ
window.$ = (s, r = document) => r.querySelector(s);

// 共通カード作成
window.card = (title, body) => {
  const d = document.createElement("div");
  d.className = "card";
  if (title) { const h = document.createElement("h2"); h.textContent = title; d.appendChild(h); }
  const p = document.createElement("p"); p.textContent = body; d.appendChild(p);
  return d;
};

// ==========================
// 画面切り替えシステム（改良版）
// ==========================
window.titleMap = { 
  home: "ホーム", 
  map: "地図",
  faq: "よくある質問",
  bus_top: "交通案内", 
  bus_hashiba_menu: "橋場町方面",
  shinkansen_top: "鉄道 運行状況一覧",
  bus_hashiba_weekday: "橋場町（平日）",
  bus_hashiba_holiday: "橋場町（土日祝）",
  bus_hashiba_timetable: "橋場町 時刻表"
};

const localViews = {
  home() {
    const d = document.createElement("div");
    d.appendChild(card("ようこそ", "メニューを選択してください。"));
    const i = document.createElement("p"); 
    i.style.cssText = "color:var(--muted); font-size:0.8rem; text-align:center; margin-top:20px;";
    i.textContent = `${APP_CONFIG.version} | ${APP_CONFIG.lastUpdated}`;
    d.appendChild(i);
    return d;
  },
  map() { return card("地図", "本番ではここに地図を表示します。"); },
  faq() { return card("よくある質問", "よくある質問をまとめます。"); }
};

window.openView = (name) => {
  const v = $("#view"); const t = $("#viewTitle"); const b = $("#backBtn");
  if (!v || !t) return;
  
  // 戻るボタンの表示
  b.style.display = (name === 'home') ? 'none' : 'inline-block';
  t.textContent = titleMap[name] ?? "案内";
  v.innerHTML = "";
  
  // 【ここが重要！】各担当者の部屋から関数を順番に探す
  let viewFn = localViews[name];
  if (!viewFn && window.BusViews) viewFn = window.BusViews[name];
  if (!viewFn && window.ShinkansenViews) viewFn = window.ShinkansenViews[name];
  
  // 見つからなければホームを出す
  const fn = viewFn || localViews.home;
  v.appendChild(fn());
  
  location.hash = name;
  v.scrollTop = 0;
};

// 戻るボタンの動作
$('#backBtn').onclick = () => {
  const h = location.hash;
  if (h.includes('bus_hashiba_')) {
    openView('bus_hashiba_menu');
  } else if (h.includes('bus_') || h.includes('shinkansen_')) {
    openView('home');
  } else {
    openView('home');
  }
};

// ==========================
// サイドバーメニュー描画
// ==========================
function renderMenu() {
  const q = $('#quickLinks'); const t = $('#transportLinks__hashiba');
  const quick = [{ label: "🗺️ 地図（デモ）", view: "map" }, { label: "❓ よくある質問", view: "faq" }];
  const traffic = [{ label: '🚌 交通案内（バス）', view: 'bus_top' }];

  if (q) {
    q.innerHTML = '';
    quick.forEach(m => {
      q.innerHTML += `<li><a class="link" href="#" data-open="${m.view}" style="color:var(--text); text-decoration:none;">${m.label}</a></li>`;
    });
  }
  if (t) {
    t.innerHTML = '';
    traffic.forEach(m => {
      // aタグの標準の色を無効化
      t.innerHTML += `<li><a class="link" href="#" data-open="${m.view}" style="color:var(--text); text-decoration:none;">${m.label}</a></li>`;
    });
  }
}

// ==========================
// その他
// ==========================
window.showImage = (src, caption = '') => {
  const l = $("#lightbox"); const i = $("#lbImg"); const c = $("#lbCap");
  if (!l || !i) return;
  i.src = src; c.textContent = caption; l.style.display = 'flex';
};
window.hideImage = () => { $("#lightbox").style.display = 'none'; $("#lbImg").src = ''; };
$("#lightbox").onclick = (e) => { if (e.target.id === 'lightbox') hideImage(); };

window.updateNet = () => {
  const d = $("#netDot"); if (!d) return;
  d.className = navigator.onLine ? "ok" : "warn";
};

document.addEventListener("click", e => {
  const a = e.target.closest("a[data-open]");
  if (a) { e.preventDefault(); openView(a.dataset.open); }
});

// 起動
renderMenu();
updateNet();
const initialView = location.hash.replace('#', '') || 'home';
// 少しだけ待ってから初期表示（読み込み順エラー対策）
setTimeout(() => openView(initialView), 50);