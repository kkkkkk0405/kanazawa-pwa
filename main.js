const APP_CONFIG = { version: "ver 1.1.10", lastUpdated: "2026/03/20" };
const $ = (s, r = document) => r.querySelector(s);

// サイドバー項目
const transportation = { main: [{ label: '🚌 交通案内（バス）', view: 'bus_top' }] };

function renderTransport() {
  const ul = $('#transportLinks__hashiba');
  if (!ul) return;
  ul.innerHTML = '';
  transportation.main.forEach(({ label, view }) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'link'; a.href = '#'; a.dataset.open = view;
    a.textContent = label;
    li.appendChild(a);
    ul.appendChild(li);
  });
}

function openView(name) {
  const v = $("#view");
  const t = $("#viewTitle");
  const b = $("#backBtn");
  if (!v || !t) return;

  // 戻るボタンの表示制御
  b.style.display = (name === 'home') ? 'none' : 'inline-block';
  
  t.textContent = titleMap[name] ?? "案内";
  v.innerHTML = "";
  const fn = views[name] || views.home;
  v.appendChild(fn());
  location.hash = name;
}

// 戻るボタンの動作
$('#backBtn').onclick = () => {
  const h = location.hash;
  if (h.includes('bus_hashiba_')) {
    openView('bus_top');
  } else {
    openView('home');
  }
};

const titleMap = {
  home: "ホーム", bus_top: "交通案内", bus_hashiba_menu: "橋場町方面",
  bus_hashiba_weekday: "橋場町（平日）", bus_hashiba_holiday: "橋場町（土日祝）",
  bus_hashiba_timetable: "橋場町 時刻表"
};

const views = {
  home() {
    const d = document.createElement("div");
    d.appendChild(card("ようこそ", "左のメニューからツールを選択してください。"));
    return d;
  },
  ...window.BusViews
};

function card(title, body) {
  const d = document.createElement("div");
  d.className = "card";
  if (title) { const h = document.createElement("h2"); h.textContent = title; d.appendChild(h); }
  const p = document.createElement("p"); p.textContent = body; d.appendChild(p);
  return d;
}

document.addEventListener("click", e => {
  const a = e.target.closest("a[data-open]");
  if (a) { e.preventDefault(); openView(a.dataset.open); }
});

renderTransport();
openView('home');