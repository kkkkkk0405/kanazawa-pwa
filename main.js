// ==========================
// ストレージ / ユーティリティ
// ==========================
const store = {
  get(k, f) {
    try { return JSON.parse(localStorage.getItem(k)) ?? f } catch { return f }
  },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)) },
};

const $ = (s, r = document) => r.querySelector(s);

// 通信状態
function updateNet() {
  const d = $("#netDot");
  if (!d) return;
  d.textContent = "●";
  d.className = navigator.onLine ? "ok" : "warn";
}
addEventListener("online", updateNet);
addEventListener("offline", updateNet);
updateNet();

// ==========================
// 左サイド：クイックリンク（編集可）
// ==========================
const defaultLinks = [
  { label: "地図（デモ）",         view: "map"   },
  { label: "よくある質問",         view: "faq"   },
  { label: "メモ",                 view: "notes" },
  { label: "白川郷バス空席",       view: "seats" }, // ★ 追加
];

function renderLinks() {
  const links = store.get("links", defaultLinks);
  const ul = $("#quickLinks");
  if (!ul) return;
  ul.innerHTML = "";

  for (const { label, view } of links) {
    const li = document.createElement("li");
    const a  = document.createElement("a");
    a.className = "link";
    a.href = "#";                // ← クイックリンクは従来通りSPA内切替
    a.dataset.open = view;
    a.textContent = label;
    li.appendChild(a);
    ul.appendChild(li);
  }
}

// ==========================
// 左サイド：交通（固定 / ハッシュ遷移）
// ==========================
// ※ URLは分かれず #/bus/... のハッシュのみ変更（＝PWAは1ページのまま）
const transportation = {
  hashiba: [
    { label: '橋場町行バス（平日）',  view: 'bus_hashiba_weekday'   },
    { label: '橋場町行バス（土日祝）', view: 'bus_hashiba_holiday'   },
    { label: '橋場町行時刻表',        view: 'bus_hashiba_timetable' },
  ],
  library: [
    // 今後追加予定
  ]
};

function renderTransport(){
  // 橋場町行
  const ulHashiba = document.getElementById('transportLinks__hashiba');
  if (ulHashiba){
    ulHashiba.innerHTML = '';
    for (const { label, view } of transportation.hashiba){
      const li = document.createElement('li');
      const a  = document.createElement('a');
      a.className = 'link';
      a.href = '#';
      a.dataset.open = view;
      a.textContent = label;
      li.appendChild(a);
      ulHashiba.appendChild(li);
    }
  }

  // 県立図書館行き（まだ空でもOK）
  const ulLib = document.getElementById('transportLinks__library');
  if (ulLib){
    ulLib.innerHTML = '';
    for (const { label, view } of transportation.library){
      const li = document.createElement('li');
      const a  = document.createElement('a');
      a.className = 'link';
      a.href = '#';
      a.dataset.open = view;
      a.textContent = label;
      li.appendChild(a);
      ulLib.appendChild(li);
    }
  }
}

// 初期描画（サイド）
renderLinks();
renderTransport();

// ==========================
// 画像ライトボックス
// ==========================
function showImage(src, caption=''){
  const box = document.getElementById('lightbox');
  const img = document.getElementById('lbImg');
  const cap = document.getElementById('lbCap');
  img.src = src;
  cap.textContent = caption;
  box.style.display = 'flex';
}
function hideImage(){
  const box = document.getElementById('lightbox');
  const img = document.getElementById('lbImg');
  box.style.display = 'none';
  img.src = '';
}
document.getElementById('lbClose').addEventListener('click', hideImage);
document.getElementById('lightbox').addEventListener('click', (e)=>{
  if(e.target.id === 'lightbox') hideImage(); // 背景クリックで閉じる
});

// ==========================
// クリック（従来の data-open だけ拾う）
// ==========================
// ※ 交通リンクは data-open を付けてないので、このハンドラは素通り→ハッシュ変更→ルーターで描画
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-open]");
  if (!a) return;
  e.preventDefault();
  openView(a.dataset.open);
});

// ==========================
// 外部API：白川郷バス空席 取得
// ==========================
async function loadSeats() {
  const API_URL = "https://shirakawa-takaoka-api.onrender.com/seats";

  // ここに Render と同じ値を ASCII だけで書く（全角なし／改行なし）
  let API_KEY = "sk_live_123456";

  // 万一の混入を除去（全角・改行などを削る）
  API_KEY = API_KEY.normalize("NFKC").replace(/[^\x20-\x7E]/g, "").trim();

  // 非ASCII混入のセルフチェック（必要ならアラート）
  if (!API_KEY || /[^\x20-\x7E]/.test(API_KEY)) {
    console.error("API_KEY に非ASCII文字が含まれています");
    alert("API_KEY に全角や改行が混ざっています。打ち直してください。");
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const url = `${API_URL}?from=kanazawa&to=shirakawago&todate=${today}`;

  const headers = new Headers();
  headers.set("x-api-key", API_KEY); // ← ヘッダ名も必ず半角

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();

    const el = document.getElementById("bus-seat-status");
    const s = data.summary.status;
    el.textContent =
      s === "available" ? "🟢 空席あり" :
      s === "limited"   ? `🟠 残り${data.summary.remaining ?? "少"}` :
      s === "full"      ? "🔴 満席" : "⚪ 不明";
  } catch (e) {
    console.error(e);
    document.getElementById("bus-seat-status").textContent = "⚪ 取得失敗";
  }
}


// ==========================
// ビュー：画面コンポーネント
// ==========================
const views = {
  home() {
    return card("ようこそ", "ここに機能カードを追加していきます。");
  },
  map() {
    return card("地図（デモ）", "本番では地図SDKや静的マップ画像をキャッシュして表示。");
  },
  faq() {
    return card("よくある質問", "後で定型文を入れられるようにします。");
  },
  notes() {
    const w = document.createElement("div");
    const t = document.createElement("textarea");
    t.style.width = "100%";
    t.style.height = "40vh";
    t.placeholder = "ここにメモ（端末内に保存）";
    t.value = store.get("notes", "");
    t.addEventListener("input", () => store.set("notes", t.value));
    w.appendChild(t);
    return w;
  },

  // ★ 新規：白川郷バス空席ビュー
  seats() {
    const wrap = document.createElement("div");

    // タイトルカード
    const c = card("白川郷バス空席（本日）", "金沢 → 白川郷 の空席状況を取得します。");
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "0.5rem";

    const status = document.createElement("span");
    status.id = "bus-seat-status";
    status.textContent = "—";
    status.style.fontWeight = "bold";

    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = "再取得";
    btn.addEventListener("click", () => loadSeats());

    row.append(status, btn);
    c.appendChild(row);

    // 注意書き
    const note = document.createElement("p");
    note.style.fontSize = "0.9em";
    note.style.opacity = "0.8";
    note.textContent = "※ デモ実装。APIキーは本番で直書きせず、環境変数/Secretsを使用してください。";
    c.appendChild(note);

    wrap.appendChild(c);

    // 初回ロード
    // （ビューが描画され、#bus-seat-status がDOMにある状態で呼ぶ）
    loadSeats();

    return wrap;
  },

  // 橋場町（平日）
  bus_hashiba_weekday() {
    const wrap = document.createElement('div');

    const selOp = document.createElement('select');
    selOp.innerHTML = `
      <option value="all">事業者すべて</option>
      <option value="北鉄バス">北鉄バスのみ</option>
      <option value="JRバス">JRバスのみ</option>
    `;
    wrap.appendChild(selOp);

    const list = document.createElement('div');
    wrap.appendChild(list);

    const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h*60 + m; };
    const nowMin = () => { const n = new Date(); return n.getHours()*60 + n.getMinutes(); };

    const render = (data) => {
      list.innerHTML = '';
      const nmin = nowMin();

      const ops = data.operators.filter(op =>
        selOp.value === 'all' ? true : op.name === selOp.value
      );

      let candidates = [];
      for (const op of ops) {
        for (const item of op.weekday) {
          const tmin = toMin(item.time);
          if (tmin >= nmin) {
            candidates.push({
              operator: op.name,
              time: item.time,
              route: item.route,
              dest: item.dest,
              wait: tmin - nmin,
              board: op.board_stop,
              alight: op.alight_stop
            });
          }
        }
      }

      if (candidates.length === 0) {
        for (const op of ops) {
          for (const item of op.weekday.slice(0, 3)) {
            const tmin = toMin(item.time) + 24 * 60;
            candidates.push({
              operator: op.name,
              time: item.time,
              route: item.route,
              dest: item.dest,
              wait: tmin - nmin,
              board: op.board_stop,
              alight: op.alight_stop
            });
          }
        }
      }

      candidates.sort((a, b) => a.wait - b.wait);
      const top3 = candidates.slice(0, 3);

      if (!top3.length) {
        list.appendChild(card('本日の運行なし', ''));
        return;
      }

      top3.forEach(x => {
        const info = x.route
          ? `北鉄${x.route}番｜乗: ${x.board} → 降: ${x.alight}`
          : `JR（行先: ${x.dest}）｜乗: ${x.board} → 降: ${x.alight}`;

        const waitTxt = x.wait >= 60
          ? `あと ${Math.floor(x.wait/60)}時間${x.wait%60}分`
          : `あと ${x.wait}分`;

        const c = card(`発車 ${x.time}`, `${waitTxt}｜${x.operator}｜${info}`);

        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = '乗り場の写真を見る';

        const imgSrc = (x.operator === '北鉄バス')
          ? './images/HOKUTETSUBUS_frontof_hoteltorifito.jpeg'
          : './images/JRBUS_frontof_hokurikubank.jpeg';
        const cap = (x.operator === '北鉄バス')
          ? '北鉄バス 乗り場：南町・尾山神社(トリフィ―ト前)'
          : 'JRバス 乗り場：南町・尾山神社(北陸銀行前)';

        btn.addEventListener('click', () => showImage(imgSrc, cap));
        c.appendChild(document.createElement('div')).appendChild(btn);

        list.appendChild(c);
      });
    };

    fetch('./data/bus-hashibamachi-weekday.json')
      .then(r => r.json())
      .then(data => {
        render(data);
        selOp.addEventListener('change', () => render(data));
      });

    return wrap;
  },

  // 橋場町（土日祝）
  bus_hashiba_holiday() {
    const wrap = document.createElement('div');

    const selOp = document.createElement('select');
    selOp.innerHTML = `
      <option value="all">事業者すべて</option>
      <option value="北鉄バス">北鉄バスのみ</option>
      <option value="JRバス">JRバスのみ</option>
    `;
    wrap.appendChild(selOp);

    const list = document.createElement('div');
    wrap.appendChild(list);

    const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h*60 + m; };
    const nowMin = () => { const n = new Date(); return n.getHours()*60 + n.getMinutes(); };

    const render = (data) => {
      list.innerHTML = '';
      const nmin = nowMin();

      const ops = data.operators.filter(op =>
        selOp.value === 'all' ? true : op.name === selOp.value
      );

      let candidates = [];
      for (const op of ops) {
        for (const item of op.holiday) {
          const tmin = toMin(item.time);
          if (tmin >= nmin) {
            candidates.push({
              operator: op.name,
              time: item.time,
              route: item.route,
              dest: item.dest,
              wait: tmin - nmin,
              board: op.board_stop,
              alight: op.alight_stop
            });
          }
        }
      }

      if (candidates.length === 0) {
        for (const op of ops) {
          for (const item of op.holiday.slice(0, 3)) {
            const tmin = toMin(item.time) + 24 * 60;
            candidates.push({
              operator: op.name,
              time: item.time,
              route: item.route,
              dest: item.dest,
              wait: tmin - nmin,
              board: op.board_stop,
              alight: op.alight_stop
            });
          }
        }
      }

      candidates.sort((a, b) => a.wait - b.wait);
      const top3 = candidates.slice(0, 3);

      if (!top3.length) {
        list.appendChild(card('本日の運行なし', ''));
        return;
      }

      top3.forEach(x => {
        const info = x.route
          ? `北鉄${x.route}番｜乗: ${x.board} → 降: ${x.alight}`
          : `JR（行先: ${x.dest}）｜乗: ${x.board} → 降: ${x.alight}`;

        const waitTxt = x.wait >= 60
          ? `あと ${Math.floor(x.wait/60)}時間${x.wait%60}分`
          : `あと ${x.wait}分`;

        const c = card(`発車 ${x.time}`, `${waitTxt}｜${x.operator}｜${info}`);

        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = '乗り場の写真を見る';

        const imgSrc = (x.operator === '北鉄バス')
          ? './images/HOKUTETSUBUS_frontof_hoteltorifito.jpeg'
          : './images/JRBUS_frontof_hokurikubank.jpeg';
        const cap = (x.operator === '北鉄バス')
          ? '北鉄バス 乗り場：南町・尾山神社(トリフィ―ト前)'
          : 'JRバス 乗り場：南町・尾山神社(北陸銀行前)';

        btn.addEventListener('click', () => showImage(imgSrc, cap));
        c.appendChild(document.createElement('div')).appendChild(btn);

        list.appendChild(c);
      });
    };

    fetch('./data/bus-hashibamachi-weekend-holidays.json')
      .then(r => r.json())
      .then(data => {
        render(data);
        selOp.addEventListener('change', () => render(data));
      });

    return wrap;
  },

  // 画像時刻表
  bus_hashiba_timetable() {
    const wrap = document.createElement("div");
    wrap.appendChild(card("橋場町行 時刻表", "平日・土日祝のダイヤをまとめて表示しています。"));

    const img = document.createElement("img");
    img.src = "./images/hashibacho-202503.png";
    img.alt = "橋場町行バス時刻表";
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.border = "1px solid #1f2937";
    img.style.borderRadius = "0.5rem";

    wrap.appendChild(img);
    return wrap;
  }
};

// ==========================
// 画面描画ユーティリティ
// ==========================
function card(title, body) {
  const d = document.createElement("div");
  d.className = "card";
  const h = document.createElement("h2");
  h.textContent = title;
  const p = document.createElement("p");
  p.textContent = body;
  d.append(h, p);
  return d;
}

const titleMap = {
  home: "ホーム",
  map: "地図（デモ）",
  faq: "よくある質問",
  notes: "メモ",
  seats: "白川郷バス空席", // ★ 追加
  bus_hashiba_weekday: "橋場町行バス（平日）",
  bus_hashiba_holiday: "橋場町行バス（土日祝）",
  bus_hashiba_timetable: "橋場町行 時刻表"
};

function openView(name) {
  const v = $("#view");
  const t = $("#viewTitle");
  if (!v || !t) return;
  t.textContent = titleMap[name] ?? name;
  v.innerHTML = "";
  const fn = views[name] || views.home;
  v.appendChild(fn());
}

// 検索フォーカス
addEventListener("keydown", (e) => {
  if (e.key === "/" || e.key.toLowerCase() === "q") {
    e.preventDefault();
    const q = $("#q");
    if (q) q.focus();
  }
});

// ==========================
// ハッシュルーター（URLは1つのまま）
// ==========================
const routes = {
  '#/home':         'home',
  '#/bus/weekday':  'bus_hashiba_weekday',
  '#/bus/holiday':  'bus_hashiba_holiday',
  '#/bus/timetable':'bus_hashiba_timetable',
  '#/seats':        'seats', // ★ 追加：直接アクセスできるように
};

function openRoute() {
  const h = location.hash || '#/home';
  const viewName = routes[h] || 'home';
  openView(viewName);
}

window.addEventListener('hashchange', openRoute);

// 初期表示：ハッシュ優先。なければホームへ。
if (!location.hash) location.hash = '#/home';
openRoute();

// ==========================
// A2HS（ホーム追加）UI
// ==========================
let deferredPrompt;
addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const b = document.getElementById("installBtn");
  if (!b) return;
  b.hidden = false;
  b.addEventListener("click", async () => {
    b.hidden = true;
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  });
});
