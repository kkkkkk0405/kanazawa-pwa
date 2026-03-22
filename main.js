
const APP_VERSION = "1.2.4";
const LAST_UPDATED = "2026-03-22";

window.$ = (s, r = document) => r.querySelector(s);

window.titleMap = {
  home: "ホーム", map: "地図", faq: "よくある質問",
  bus_top: "交通案内", bus_hashiba_menu: "橋場町方面", bus_library_menu: "県立図書館方面",
  shinkansen_top: "鉄道 運行状況一覧",
  bus_hashiba_weekday: "橋場町（平日）", bus_hashiba_holiday: "橋場町（土日祝）",
  bus_library_weekday: "図書館行（平日）", bus_library_holiday: "図書館行（土日祝）",
  bus_hashiba_timetable: "橋場町 時刻表",
  kenrokuen_detail: "兼六園 詳細案内"
};

/**
 * 画面遷移関数
 * @param {string} name - 遷移先のID
 * @param {string} dir - アニメーション方向 ('next' or 'back')
 */
window.openView = (name, dir = 'next') => {
  const v = $("#view"); const t = $("#viewTitle"); const b = $("#backBtn");
  if (!v || !t) return;
  
  // アニメーションクラスの適用
  v.classList.remove('slide-next', 'slide-back');
  // 一瞬だけDOMを強制再描画させてアニメーションをリセット
  void v.offsetWidth; 
  v.classList.add(dir === 'back' ? 'slide-back' : 'slide-next');

  // 戻るボタンの表示（ホーム以外は出す）
  b.style.display = (name === 'home') ? 'none' : 'inline-block';
  t.textContent = titleMap[name] ?? "案内";
  v.innerHTML = "";
  
  let viewFn = (window.BusViews ? window.BusViews[name] : null) || 
                (window.KenrokuenViews ? window.KenrokuenViews[name] : null) ||
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

// 【重要】戻るボタンの挙動
$("#backBtn").onclick = () => {
  const h = location.hash.replace('#', '');
  if (h === 'bus_hashiba_menu' || h === 'bus_library_menu') return openView('bus_top', 'back');
  if (h.includes('bus_hashiba_')) return openView('bus_hashiba_menu', 'back');
  if (h.includes('bus_library_')) return openView('bus_library_menu', 'back');
  if (h === 'bus_top') return openView('home', 'back');
  openView('home', 'back');
};

// メニュー描画と兼六園情報の更新を一つの関数に統合
async function renderMenu() {
  const q = $('#quickLinks'); 
  const t = $('#transportLinks'); 
  const footer = $('#appInfo');

  // 1. サイドメニューなどのリンク描画
  if (q) q.innerHTML = `<div class="link" onclick="openView('map')">🗺️ 地図</div><div class="link" onclick="openView('faq')">❓ FAQ</div>`;
  if (t) t.innerHTML = `<div class="link" onclick="openView('bus_top')">🚌 交通案内（バス）</div>`;

  // 2. バージョン情報の表示
  if (footer) {
    footer.innerHTML = `<div class="version-info">ver ${APP_VERSION} / Updated: ${LAST_UPDATED}</div>`;
  }

  // 3. 兼六園チップの更新（非同期）
  if (window.Kenrokuen) {
    try {
      await Kenrokuen.renderChip('#kenrokuenChip');
    } catch (e) {
      console.error("兼六園データの取得に失敗:", e);
    }
  }
}

// 実行と初期化
renderMenu();

const initial = location.hash.replace('#', '') || 'home';
setTimeout(() => openView(initial), 150);