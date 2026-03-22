// js/bus.js ver 1.3.3
window.BusViews = {
  bus_top() {
    const wrap = document.createElement('div');
    wrap.appendChild(card("交通案内", "行き先を選択してください。"));
    const items = [{ label: "📍 橋場町方面", view: "bus_hashiba_menu" }, { label: "📍 県立図書館方面", view: "bus_library_menu" }];
    items.forEach(item => {
      const b = document.createElement('button'); b.className = 'link';
      b.innerHTML = `<div style="display:flex; justify-content:space-between;"><span>${item.label}</span><span>❯</span></div>`;
      b.onclick = () => openView(item.view);
      wrap.appendChild(b);
    });
    return wrap;
  },

  bus_hashiba_menu() { return window.BusViews._createSubMenu("橋場町方面", "bus_hashiba"); },
  bus_library_menu() { return window.BusViews._createSubMenu("県立図書館方面", "bus_library"); },

  bus_hashiba_weekday() { return window.BusViews._createBusView('./data/bus-hashibamachi-weekday-20260314.json', 'weekday'); },
  bus_hashiba_holiday() { return window.BusViews._createBusView('./data/bus-hashibamachi-weekend-holidays-20260314.json', 'holiday'); },
  bus_library_weekday() { return window.BusViews._createBusView('./data/bus-ishikawakenritsulibrary-20260320.json', 'weekday'); },
  bus_library_holiday() { return window.BusViews._createBusView('./data/bus-ishikawakenritsulibrary-20260320.json', 'holiday'); },
  
  bus_hashiba_timetable() {
    const wrap = document.createElement("div"); wrap.appendChild(card("橋場町行 時刻表", "2026年3月改正版"));
    const img = document.createElement("img"); img.src = "./images/hashibacho-202603.png"; img.style.width = "100%"; 
    img.style.borderRadius = "10px"; img.style.border = "1px solid #1f2937";
    wrap.appendChild(img);
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
    const loading = document.createElement('p'); loading.textContent = "⌛ 読み込み中...";
    wrap.appendChild(loading); wrap.appendChild(list);
    
    const toMin = (t) => { if(!t) return 0; const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const nowMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };

    fetch(jsonPath).then(r => r.json()).then(data => {
      loading.remove();
      const nmin = nowMin(); let cand = [];
      data.operators.forEach(op => {
        const times = (type === 'weekday') ? op.weekday : op.holiday;
        if(times) times.forEach(i => { const tm = toMin(i.time); if (tm >= nmin) cand.push({ ...i, op: op.name, wait: tm - nmin, board: op.board_stop }); });
      });
      cand.sort((a, b) => a.wait - b.wait).slice(0, 3).forEach(x => {
        const waitTxt = x.wait >= 60 ? `あと ${Math.floor(x.wait / 60)}h${x.wait % 60}m` : `あと ${x.wait}分`;
        const c = card(`発車 ${x.time}`, `${waitTxt}｜${x.op}｜北鉄${x.route || ''}番`);
        
        // ★写真ボタン復活！
        const btn = document.createElement('button');
        btn.className = 'btn'; btn.textContent = '📸 乗り場の写真';
        const imgSrc = (x.op.includes('北鉄')) ? './images/HOKUTETSUBUS_frontof_hoteltorifito.jpeg' : './images/JRBUS_frontof_hokurikubank.jpeg';
        btn.onclick = () => window.showImage(imgSrc, `${x.op} 乗り場`);
        
        c.appendChild(btn);
        list.appendChild(c);
      });
      if(list.innerHTML === "") list.appendChild(card("案内終了", "本日の運行は終了しました。"));
    }).catch(() => { loading.textContent = "⚠️ 読み込み失敗"; });
    return wrap;
  }
};