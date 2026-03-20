// js/bus.js (ver 1.3.2)
window.BusViews = {
  // 1. 交通案内のトップ
  bus_top() {
    const wrap = document.createElement('div');
    wrap.appendChild(card("交通案内", "行き先を選択するか、下の直近便を確認してください。"));

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

    const quickTitle = document.createElement('h3');
    quickTitle.style.cssText = "margin-top:20px; color:var(--muted); font-size:0.8rem;";
    quickTitle.textContent = "🕒 橋場町行：直近の案内";
    wrap.appendChild(quickTitle);

    const isHoliday = [0, 6].includes(new Date().getDay());
    const path = isHoliday ? './data/bus-hashibamachi-weekend-holidays-20260314.json' : './data/bus-hashibamachi-weekday-20260314.json';
    const quickList = document.createElement('div');
    wrap.appendChild(quickList);
    
    // ★修正：this ではなく window.BusViews を使う
    window.BusViews._renderBusToElement(path, isHoliday ? 'holiday' : 'weekday', quickList);

    return wrap;
  },

  bus_hashiba_menu() { return window.BusViews._createSubMenu("橋場町方面", "bus_hashiba"); },
  bus_library_menu() { return window.BusViews._createSubMenu("県立図書館方面", "bus_library"); },

  bus_hashiba_weekday() { return window.BusViews._createBusView('./data/bus-hashibamachi-weekday-20260314.json', 'weekday'); },
  bus_hashiba_holiday() { return window.BusViews._createBusView('./data/bus-hashibamachi-weekend-holidays-20260314.json', 'holiday'); },
  bus_library_weekday() { return window.BusViews._createBusView('./data/bus-ishikawakenritutoshokan-202603.json', 'weekday'); },
  bus_library_holiday() { return window.BusViews._createBusView('./data/bus-ishikawakenritutoshokan-202603.json', 'holiday'); },
  
  bus_hashiba_timetable() {
    const wrap = document.createElement("div"); wrap.appendChild(card("橋場町行 時刻表", "2026年3月改正版"));
    const img = document.createElement("img"); img.src = "./images/hashibacho-202603.png"; img.style.width = "100%"; wrap.appendChild(img);
    return wrap;
  },

  _createSubMenu(title, prefix) {
    const wrap = document.createElement('div');
    wrap.appendChild(card(title, "運行日を選択してください。"));
    const items = [{ label: "📅 平日ダイヤ", view: `${prefix}_weekday` }, { label: "🎉 土日祝ダイヤ", view: `${prefix}_holiday` }];
    if(prefix === "bus_hashiba") items.push({ label: "🕒 時刻表を表示（画像）", view: "bus_hashiba_timetable" });
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
    window.BusViews._renderBusToElement(jsonPath, type, list);
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
      if(element.innerHTML === "") element.innerHTML = card("案内終了", "本日の運行はすべて終了しました。");
    }).catch(() => { element.textContent = "⚠️ データの読み込みに失敗しました。"; });
  }
};