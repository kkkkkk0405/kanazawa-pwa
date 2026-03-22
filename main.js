const APP_VERSION = "1.2.7";
const LAST_UPDATED = "2026-03-22";

window.$ = (s, r = document) => r.querySelector(s);

window.titleMap = {
  home: "ホーム", map: "地図", faq: "よくある質問",
  bus_top: "交通案内", bus_hashiba_menu: "橋場町方面", bus_library_menu: "県立図書館方面",
  shinkansen_top: "鉄道 運行状況一覧", kenrokuen_detail: "兼六園 詳細案内", spot_list: "各種施設一覧",
  admin: "管理者ツール"
};

window.openView = (name, dir = 'next') => {
  const v = $("#view"); const t = $("#viewTitle"); const b = $("#backBtn");
  if (!v || !t) return;
  
  v.classList.remove('slide-next', 'slide-back');
  void v.offsetWidth; 
  v.classList.add(dir === 'back' ? 'slide-back' : 'slide-next');

  b.style.display = (name === 'home') ? 'none' : 'inline-block';
  t.textContent = titleMap[name] ?? "案内";
  v.innerHTML = "";
  
  let viewFn = (window.BusViews ? window.BusViews[name] : null) || 
               (window.KenrokuenViews ? window.KenrokuenViews[name] : null) ||
               (window.ShinkansenViews ? window.ShinkansenViews[name] : null);

  const fn = viewFn || (() => card("ようこそ", "メニューを選択してください。"));
  v.appendChild(fn());
  
  location.hash = name;
  v.scrollTop = 0;
};

$("#backBtn").onclick = () => {
  const h = location.hash.replace('#', '');
  if (h === 'bus_top') return openView('home', 'back');
  if (h.includes('bus_')) return openView('bus_top', 'back');
  openView('home', 'back');
};

async function initializeApp() {
  const q = $('#quickLinks'); 
  const t = $('#transportLinks'); 
  const footer = $('#appInfo');

  if (q) q.innerHTML = `<div class="link" onclick="openView('map')">🗺️ 地図</div><div class="link" onclick="openView('faq')">❓ FAQ</div>`;
  if (t) t.innerHTML = `<div class="link" onclick="openView('bus_top')">🚌 交通案内（バス）</div>`;
  if (footer) footer.innerHTML = `<div class="version-info">ver ${APP_VERSION} / Updated: ${LAST_UPDATED}</div>`;

  if (window.Kenrokuen) {
    await Kenrokuen.renderChip('#kenrokuenChip');
  }

  const initial = location.hash.replace('#', '') || 'home';
  openView(initial);
}

initializeApp();