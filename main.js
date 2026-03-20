// ==========================
// 設定・バージョン情報
// ==========================
const APP_CONFIG = {
  version: "ver 1.2.2",
  lastUpdated: "2026/03/20",
};

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
// 画面切り替えシステム
// ==========================
// タイトルの対応表（ここを増やすとタイトルが正しく出ます）
window.titleMap = { 
  home: "ホーム", 
  bus_top: "交通案内", 
  bus_hashiba_menu: "橋場町方面",
  shinkansen_top: "鉄道 運行状況一覧", // これが抜けていたので追加
  bus_hashiba_weekday: "橋場町（平日）",
  bus_hashiba_holiday: "橋場町（土日祝）",
  bus_hashiba_timetable: "橋場町 時刻表"
};

// 画面の中身を作る関数たち
const views = {
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
  faq() { return card("よくある質問", "よくある質問をまとめます。"); },
  
  // ★重要：各担当の部屋から情報を合体させる
  ...window.BusViews,
  ...window.ShinkansenViews 
};

window.openView = (name) => {
  const v = $("#view"); const t = $("#viewTitle"); const b = $("#backBtn");
  if (!v || !t) return;
  
  b.style.display = (name === 'home') ? 'none' : 'inline-block';
  t.textContent = titleMap[name] ?? "案内";
  v.innerHTML = "";
  
  const fn = views[name] || views.home;
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
const navigation = {
  quick: [{ label: "🗺️ 地図（デモ）", view: "map" }, { label: "❓ よくある質問", view: "faq" }],
  traffic: [{ label: '🚌 交通案内（バス）', view: 'bus_top' }]
};

function renderMenu() {
  const q = $('#quickLinks'); const t = $('#transportLinks__hashiba');
  if (q) {
    q.innerHTML = '';
    navigation.quick.forEach(m => {
      q.innerHTML += `<li><a class="link" href="#" data-open="${m.view}" style="color:var(--text); text-decoration:none;">${m.label}</a></li>`;
    });
  }
  if (t) {
    t.innerHTML = '';
    navigation.traffic.forEach(m => {
      // ★修正：サイドバーのリンクが青くならないように style を追加
      t.innerHTML += `<li><a class="link" href="#" data-open="${m.view}" style="color:var(--text); text-decoration:none;">${m.label}</a></li>`;
    });
  }
}

// ==========================
// その他（ライトボックス・ネット検知）
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
// ハッシュがあればその画面、なければホームを開く
const initialView = location.hash.replace('#', '') || 'home';
openView(initialView);