const store = {
  get(k, f) {
    try {
      return JSON.parse(localStorage.getItem(k)) ?? f;
    } catch {
      return f;
    }
  },
  set(k, v) {
    localStorage.setItem(k, JSON.stringify(v));
  },
};

const $ = (s, r = document) => r.querySelector(s);

function updateNet() {
  const d = $("#netDot");
  if (!d) return;
  d.textContent = "●";
  d.className = navigator.onLine ? "ok" : "warn";
}

addEventListener("online", updateNet);
addEventListener("offline", updateNet);
updateNet();

const defaultLinks = [
  { label: "地図（デモ）", view: "map" },
  { label: "よくある質問", view: "faq" },
  { label: "メモ", view: "notes" },
  { label: '橋場町行バス（平日）', view: 'bus_hashiba_weekday' },
  { label: "橋場町行バス（土日祝）", view: "bus_hashiba_holiday" }
];

function renderLinks() {
  const links = store.get("links", defaultLinks);
  const ul = $("#quickLinks");
  if (!ul) return;
  ul.innerHTML = "";

  for (const { label, view } of links) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.className = "link";
    a.href = "#";
    a.dataset.open = view;
    a.textContent = label;
    li.appendChild(a);
    ul.appendChild(li);
  }
}
renderLinks();
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

document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-open]");
  if (!a) return;
  e.preventDefault();
  openView(a.dataset.open);
});

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

  // ヘルパー
  const toMin = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };

  const nowMin = () => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  };

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

    // 翌日便補完
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

  // カード本体
  const c = card(`発車 ${x.time}`, `${waitTxt}｜${x.operator}｜${info}`);

  // 画像ボタンを付ける
  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = '乗り場の写真を見る';

  // 事業者で画像を出し分け
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
bus_hashiba_holiday() {
  const wrap = document.createElement('div');

  // 事業者フィルタ
  const selOp = document.createElement('select');
  selOp.innerHTML = `
    <option value="all">事業者すべて</option>
    <option value="北鉄バス">北鉄バスのみ</option>
    <option value="JRバス">JRバスのみ</option>
  `;
  wrap.appendChild(selOp);

  const list = document.createElement('div');
  wrap.appendChild(list);

  // ヘルパー
  const toMin = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };
  const nowMin = () => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  };

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

    // 今日もう便が無い時間帯→翌日の先頭から3本だけ拾う（簡易）
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

      // カード
      const c = card(`発車 ${x.time}`, `${waitTxt}｜${x.operator}｜${info}`);

      // 写真ボタン（平日版と同じ割り当て）
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = '乗り場の写真を見る';

      const imgSrc = (x.operator === '北鉄バス')
        ? './images/board-hokutetsu.jpg'
        : './images/board-jr.jpg';
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
}

};

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

function openView(name) {
  const v = $("#view");
  const t = $("#viewTitle");
  if (!v || !t) return;
  t.textContent = name.toUpperCase();
  v.innerHTML = "";
  const fn = views[name] || views.home;
  v.appendChild(fn());
}

addEventListener("keydown", (e) => {
  if (e.key === "/" || e.key.toLowerCase() === "q") {
    e.preventDefault();
    const q = $("#q");
    if (q) q.focus();
  }
});

openView("home");

// A2HS（ホーム追加）UI
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
