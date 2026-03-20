window.BusViews = {
  // 1. 交通案内のトップ画面
  bus_top() {
    const wrap = document.createElement('div');
    wrap.appendChild(card("交通案内", "調べたい行き先を選択してください。"));
    const items = [
      { label: "📍 橋場町方面（ひがし茶屋街）", view: "bus_hashiba_menu" },
      { label: "📍 県立図書館（崎浦・金大方面）", view: "bus_library_menu" } // 修正：専用メニューへ
    ];
    items.forEach(item => {
      const b = document.createElement('button');
      b.className = 'link';
      b.innerHTML = `<div style="display:flex; justify-content:space-between;"><span>${item.label}</span><span>❯</span></div>`;
      b.onclick = () => openView(item.view);
      wrap.appendChild(b);
    });
    return wrap;
  },

  // 2. 橋場町の選択メニュー
  bus_hashiba_menu() {
    return this._createSubMenu("橋場町方面", "bus_hashiba");
  },

  // ★新機能：県立図書館の選択メニュー
  bus_library_menu() {
    return this._createSubMenu("県立図書館方面", "bus_library");
  },

  // リアルタイム案内（呼び出し用）
  bus_hashiba_weekday() { return window.BusViews._createBusView('./data/bus-hashibamachi-weekday-20260314.json', 'weekday'); },
  bus_hashiba_holiday() { return window.BusViews._createBusView('./data/bus-hashibamachi-weekend-holidays-20260314.json', 'holiday'); },
  bus_hashiba_timetable() { /* 橋場町時刻表画像表示ロジックは既存のものを利用 */ },

  // ★新機能：図書館リアルタイム案内
  bus_library_weekday() { return window.BusViews._createBusView('./data/bus-library-2026.json', 'weekday'); },
  bus_library_holiday() { return window.BusViews._createBusView('./data/bus-library-2026.json', 'holiday'); },

  // 🛠️ 内部用：サブメニュー作成の共通化
  _createSubMenu(title, prefix) {
    const wrap = document.createElement('div');
    wrap.appendChild(card(title, "運行日を選択してください。"));
    const items = [
      { label: "📅 平日ダイヤ（月〜金）", view: `${prefix}_weekday` },
      { label: "🎉 土日祝ダイヤ", view: `${prefix}_holiday` },
    ];
    // 橋場町のみ時刻表画像があるので追加
    if(prefix === "bus_hashiba") items.push({ label: "🕒 時刻表を表示（画像）", view: "bus_hashiba_timetable" });

    items.forEach(item => {
      const b = document.createElement('button');
      b.className = 'link';
      b.innerHTML = `<div style="display:flex; justify-content:space-between;"><span>${item.label}</span><span>❯</span></div>`;
      b.onclick = () => openView(item.view);
      wrap.appendChild(b);
    });
    return wrap;
  },

  // 🛠️ 内部用：共通の描画メカニズム（そのまま流用）
  _createBusView(jsonPath, type) {
    const wrap = document.createElement('div');
    const list = document.createElement('div');
    const loading = document.createElement('p');
    loading.textContent = "⌛ データを読み込み中...";
    wrap.appendChild(loading);
    wrap.appendChild(list);

    const toMin = (hhmm) => { if(!hhmm) return 0; const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
    const nowMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };

    fetch(jsonPath).then(r => r.json()).then(data => {
        loading.remove();
        const nmin = nowMin();
        let candidates = [];
        data.operators.forEach(op => {
          const times = (type === 'weekday') ? op.weekday : op.holiday;
          if(!times) return;
          times.forEach(item => {
            const tmin = toMin(item.time);
            if (tmin >= nmin) candidates.push({ ...item, operator: op.name, wait: tmin - nmin, board: op.board_stop });
          });
        });
        if (candidates.length === 0) {
          data.operators.forEach(op => {
            const times = (type === 'weekday') ? op.weekday : op.holiday;
            if(!times) return;
            times.slice(0, 2).forEach(item => {
              const tmin = toMin(item.time) + 1440;
              candidates.push({ ...item, operator: op.name, wait: tmin - nmin, board: op.board_stop });
            });
          });
        }
        candidates.sort((a, b) => a.wait - b.wait);
        candidates.slice(0, 3).forEach(x => {
          const waitTxt = x.wait >= 60 ? `あと ${Math.floor(x.wait / 60)}時間${x.wait % 60}分` : `あと ${x.wait}分`;
          const info = `北鉄${x.route}番｜乗: ${x.board}`;
          const c = card(`発車 ${x.time}`, `${waitTxt}｜${x.operator}｜${info}`);
          list.appendChild(c);
        });
      });
    return wrap;
  }
};