window.BusViews = {
  // 1. 交通案内のトップ（ここで直近便を自動表示！）
  bus_top() {
    const wrap = document.createElement('div');
    wrap.appendChild(card("交通案内", "行き先を選択するか、下の直近便を確認してください。"));

    // 行き先選択ボタン
    const grid = document.createElement('div');
    grid.style.display = "grid"; grid.style.gap = "10px";
    const items = [
      { label: "📍 橋場町方面（ひがし茶屋街）", view: "bus_hashiba_menu" },
      { label: "📍 県立図書館（崎浦・金大方面）", view: "bus_library_menu" }
    ];
    items.forEach(item => {
      const b = document.createElement('button'); b.className = 'link';
      b.innerHTML = `<div style="display:flex; justify-content:space-between;"><span>${item.label}</span><span>❯</span></div>`;
      b.onclick = () => openView(item.view);
      grid.appendChild(b);
    });
    wrap.appendChild(grid);

    // ★復活！：橋場町行きの「直近3便」をここに表示する
    const quickTitle = document.createElement('h3');
    quickTitle.style.cssText = "margin-top:20px; color:var(--muted); font-size:0.8rem;";
    quickTitle.textContent = "🕒 橋場町行：直近の案内";
    wrap.appendChild(quickTitle);

    // 今が平日か休日かで読み込むファイルを変える
    const isHoliday = [0, 6].includes(new Date().getDay()); // 0:日, 6:土
    const path = isHoliday ? './data/bus-hashibamachi-weekend-holidays-20260314.json' : './data/bus-hashibamachi-weekday-20260314.json';
    
    // 直近便リストを表示する箱
    const quickList = document.createElement('div');
    wrap.appendChild(quickList);
    this._renderBusToElement(path, isHoliday ? 'holiday' : 'weekday', quickList);

    return wrap;
  },

  // 中継メニュー
  bus_hashiba_menu() { return this._createSubMenu("橋場町方面", "bus_hashiba"); },
  bus_library_menu() { return this._createSubMenu("県立図書館方面", "bus_library"); },

  // リアルタイム表示（各画面用）
  bus_hashiba_weekday() { return this._createBusView('./data/bus-hashibamachi-weekday-20260314.json', 'weekday'); },
  bus_hashiba_holiday() { return this._createBusView('./data/bus-hashibamachi-weekend-holidays-20260314.json', 'holiday'); },
  bus_library_weekday() { return this._createBusView('./data/bus-ishikawakenritutoshokan-202603.json', 'weekday'); },
  bus_library_holiday() { return this._createBusView('./data/bus-ishikawakenritutoshokan-202603.json', 'holiday'); },

  // --- 内部メカニズム（修正不要） ---
  _createSubMenu(title, prefix) {
    const wrap = document.createElement('div');
    wrap.appendChild(card(title, "運行日を選択してください。"));
    const items = [{ label: "📅 平日ダイヤ", view: `${prefix}_weekday` }, { label: "🎉 土日祝ダイヤ", view: `${prefix}_holiday` }];
    items.forEach(item => {
      const b = document.createElement('button'); b.className = 'link';
      b.innerHTML = `<div style="display:flex; justify-content:space-between;"><span>${item.label}</span><span>❯</span></div>`;
      b.onclick = () => openView(item.view);
      wrap.appendChild(b);
    });
    return wrap;
  },

  _createBusView(jsonPath, type) {
    const wrap = document.createElement('div');
    const list = document.createElement('div');
    wrap.appendChild(list);
    this._renderBusToElement(jsonPath, type, list);
    return wrap;
  },

  _renderBusToElement(jsonPath, type, element) {
    const toMin = (hhmm) => { if(!hhmm) return 0; const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
    const nowMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };

    fetch(jsonPath).then(r => r.json()).then(data => {
      const nmin = nowMin(); let candidates = [];
      data.operators.forEach(op => {
        const times = (type === 'weekday') ? op.weekday : op.holiday;
        if(!times) return;
        times.forEach(item => { const tmin = toMin(item.time); if (tmin >= nmin) candidates.push({ ...item, operator: op.name, wait: tmin - nmin, board: op.board_stop }); });
      });
      candidates.sort((a, b) => a.wait - b.wait);
      candidates.slice(0, 3).forEach(x => {
        const waitTxt = x.wait >= 60 ? `あと ${Math.floor(x.wait / 60)}h${x.wait % 60}m` : `あと ${x.wait}分`;
        const c = card(`発車 ${x.time}`, `${waitTxt}｜${x.operator}｜北鉄${x.route}番`);
        element.appendChild(c);
      });
      if(element.innerHTML === "") element.appendChild(card("案内なし", "本日の運行は終了しました。"));
    }).catch(() => { element.textContent = "⚠️ データ読み込み失敗"; });
  }
};