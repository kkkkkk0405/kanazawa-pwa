// ==========================
// 設定・バージョン情報
// ==========================
const APP_CONFIG = {
  version: "ver 1.2.1",
  lastUpdated: "2026/03/20",
};

// ==========================
// ユーティリティ（windowに置いて共有）
// ==========================
window.$ = (s, r = document) => r.querySelector(s);

// 大事な関数を window にくっつけて bus.js からも呼べるようにする
window.card = (title, body) => {
  const d = document.createElement("div");
  d.className = "card";
  if (title) { const h = document.createElement("h2"); h.textContent = title; d.appendChild(h); }
  const p = document.createElement("p"); p.textContent = body; d.appendChild(p);
  return d;
};

// ==========================
// サイドバーメニュー
// ==========================
const navigation = {
  quick: [{ label: "🗺️ 地図（デモ）", view: "map" }, { label: "❓ よくある質問", view: "faq" }],
  traffic: [{ label: '🚌 交通案内（バス）', view: 'bus_top' }]
};

function renderMenu() {
  const q = $('#quickLinks'); const t = $('#transportLinks__hashiba');
  if (q) {
    q.innerHTML = '';
    navigation.quick.forEach(m => q.innerHTML += `<li><a class="link" href="#" data-open="${m.view}">${m.label}</a></li>`);
  }
  if (t) {
    t.innerHTML = '';
    navigation.traffic.forEach(m => t.innerHTML += `<li><a class="link" href="#" data-open="${m.view}">${m.label}</a></li>`);
  }
}

// ==========================
// 画面切り替えシステム
// ==========================
window.titleMap = { home: "ホーム", bus_top: "交通案内", bus_hashiba_menu: "橋場町方面" };

window.openView = (name) => {
  const v = $("#view"); const t = $("#viewTitle"); const b = $("#backBtn");
  if (!v || !t) return;
  // 戻るボタンの表示
  b.style.display = (name === 'home') ? 'none' : 'inline-block';
  // タイトル変更
  t.textContent = titleMap[name] ?? "案内";
  v.innerHTML = "";
  // views から画面を作る関数を探す
  const fn = views[name] || views.home;
  v.appendChild(fn());
  location.hash = name; // ハッシュも変える
  v.scrollTop = 0; // スクロールを上に戻す
};

// 戻るボタンの動作
$('#backBtn').onclick = () => {
  if (location.hash.includes('bus_hashiba_')) { openView('bus_top'); } else { openView('home'); }
};

// ==========================
// 画面中身（Views）
// ==========================
const views = {
  home() {
    const d = document.createElement("div");
    d.appendChild(card("ようこそ", "メニューを選択してください。"));
    const i = document.createElement("p"); i.style.color = "var(--muted)"; i.style.fontSize = "0.8rem"; i.style.textAlign = "center";
    i.textContent = `${APP_CONFIG.version} | ${APP_CONFIG.lastUpdated}`;
    d.appendChild(i);
    return d;
  },
  map() { return card("地図", "本番ではここにキャッシュされた地図を表示します。"); },
  faq() { return card("よくある質問", "よくある質問をここにまとめます。"); },
  // bus.js で作った window.BusViews を合体！
  ...window.BusViews
};

// ==========================
// 画像ライトボックス（windowに置いて共有）
// ==========================
window.showImage = (src, caption = '') => {
  const l = $("#lightbox"); const i = $("#lbImg"); const c = $("#lbCap");
  if (!l || !i) return;
  i.src = src; c.textContent = caption; l.style.display = 'flex';
};

window.hideImage = () => { $("#lightbox").style.display = 'none'; $("#lbImg").src = ''; };

// ライトボックスの黒い部分をクリックしたら閉じる
$("#lightbox").onclick = (e) => { if (e.target.id === 'lightbox') hideImage(); };

// ==========================
// 初期化
// ==========================
document.addEventListener("click", e => {
  const a = e.target.closest("a[data-open]");
  if (a) { e.preventDefault(); openView(a.dataset.open); }
});

window.updateNet = () => {
  const d = $("#netDot"); if (!d) return;
  d.textContent = "●"; d.className = navigator.onLine ? "ok" : "warn";
};
addEventListener("online", updateNet); addEventListener("offline", updateNet);

// 起動
updateNet();
renderMenu();
openView('home');