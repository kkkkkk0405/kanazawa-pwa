// main.js ver 1.2.9
const APP_VERSION = "1.2.9";
const LAST_UPDATED = "2026-03-22";

window.$ = (s, r = document) => r.querySelector(s);

window.titleMap = {
  home: "ホーム", map: "地図", faq: "よくある質問",
  bus_top: "交通案内", bus_hashiba_menu: "橋場町方面", bus_library_menu: "県立図書館方面",
  shinkansen_top: "鉄道 運行状況一覧", kenrokuen_detail: "兼六園 詳細案内", 
  spot_list: "各種施設一覧", admin: "管理者ツール"
};

/**
 * 画面遷移関数 (非同期対応)
 */
window.openView = async (name, dir = 'next') => {
  const v = $("#view"); const t = $("#viewTitle"); const b = $("#backBtn");
  if (!v || !t) return;
  
  // アニメーション
  v.classList.remove('slide-next', 'slide-back');
  void v.offsetWidth; 
  v.classList.add(dir === 'back' ? 'slide-back' : 'slide-next');

  // 戻るボタンの制御
  b.style.display = (name === 'home') ? 'none' : 'inline-block';
  t.textContent = titleMap[name] ?? "案内";
  v.innerHTML = "";
  
  // 各種JSファイルからView関数を探す
  let viewFn = (window.BusViews ? window.BusViews[name] : null) || 
               (window.KenrokuenViews ? window.KenrokuenViews[name] : null) ||
               (window.SpotViews ? window.SpotViews[name] : null) ||
               (window.ShinkansenViews ? window.ShinkansenViews[name] : null);

  // View関数が見つからない場合のフォールバック
  const fn = viewFn || (() => card("ようこそ", "メニューを選択してください。"));
  
  try {
    // 非同期関数の実行が終わるのを待ってから画面に追加
    const content = await fn();
    v.appendChild(content);
  } catch (e) {
    console.error("View描画エラー:", e);
    v.appendChild(card("エラー", "読み込みに失敗しました。"));
  }
  
  location.hash = name;
  v.scrollTop = 0;
};

// 戻るボタンの挙動
$("#backBtn").onclick = () => {
  const h = location.hash.replace('#', '');
  if (h === 'bus_top') return openView('home', 'back');
  if (h === 'kenrokuen_detail' || h === 'spot_detail') return openView('spot_list', 'back');
  if (h.includes('bus_')) return openView('bus_top', 'back');
  if (h === 'spot_list' || h === 'admin') return openView('home', 'back');
  openView('home', 'back');
};

/**
 * 初期化処理
 */
async function initializeApp() {
  const q = $('#quickLinks'); 
  const t = $('#transportLinks'); 
  const footer = $('#appInfo');

  // メニューリンクの生成
  if (q) q.innerHTML = `
    <div class="link" onclick="openView('map')">🗺️ 地図</div>
    <div class="link" onclick="openView('spot_list')">🏛️ 各種施設</div>
    <div class="link" onclick="openView('faq')">❓ FAQ</div>
  `;
  if (t) t.innerHTML = `<div class="link" onclick="openView('bus_top')">🚌 交通案内（バス）</div>`;
  
  // フッター情報の表示
  if (footer) {
    footer.innerHTML = `<div class="version-info" style="cursor:pointer; padding:10px;">ver ${APP_VERSION} / Updated: ${LAST_UPDATED}</div>`;
    
    // 隠し入り口：バージョン情報を5回クリックで管理者モード
    let clickCount = 0;
    footer.onclick = () => {
      clickCount++;
      if (clickCount >= 5) {
        clickCount = 0;
        alert("🔧 デベロッパーモードを起動します");
        openView('admin');
      }
      setTimeout(() => { clickCount = 0; }, 3000); // 3秒でリセット
    };
  }

  // 兼六園チップ（ホーム画面）
  if (window.Kenrokuen) {
    await Kenrokuen.renderChip('#kenrokuenChip');
  }

  // 初回表示
  const initial = location.hash.replace('#', '') || 'home';
  openView(initial);
}

// アプリ起動
initializeApp();