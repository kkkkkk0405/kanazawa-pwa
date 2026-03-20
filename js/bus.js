// ==========================
// js/bus.js (ver 1.2.6)
// ==========================
window.BusViews = {
  // 1. 交通案内のトップ画面
  bus_top() {
    const wrap = document.createElement('div');
    wrap.appendChild(card("交通案内", "行き先を選択してください。"));
    const items = [
      { label: "📍 橋場町方面（ひがし茶屋街）", view: "bus_hashiba_menu" },
      { label: "📍 県立図書館（崎浦・金大方面）", view: "bus_library_menu" }
    ];
    items.forEach(item => {
      const b = document.createElement('button'); b.className = 'link';
      b.innerHTML = `<div style="display:flex; justify-content:space-between;"><span>${item.label}</span><span>❯</span></div>`;
      b.onclick = () => openView(item.view);
      wrap.appendChild(b);
    });
    return wrap;
  },

  bus_hashiba_menu() { return this._createSubMenu("橋場町方面", "bus_hashiba"); },
  bus_library_menu() { return this._createSubMenu("県立図書館方面", "bus_library"); },

  // ★橋場町用：ファイル名はそのまま
  bus_hashiba_weekday() { return window.BusViews._createBusView('./data/bus-hashibamachi-weekday-20260314.json', 'weekday'); },
  bus_hashiba_holiday() { return window.BusViews._createBusView('./data/bus-hashibamachi-weekend-holidays-20260314.json', 'holiday'); },
  
  // ★県立図書館用：画像（image_8d27c4.jpg）で確認した正しいファイル名に修正しました！
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
    const loading = document.createElement('p'); loading.textContent = "⌛ 読み込み中...";
    wrap.appendChild(loading); wrap.appendChild(list);
    
    const toMin = (hhmm) => { if(!hhmm) return 0; const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
    const nowMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };

    fetch(jsonPath).then(r => {
        if (!r.ok) throw new Error('File Not Found');
        return r.json();
    }).then(data => {
        loading.remove(); const nmin = nowMin(); let candidates = [];
        data.operators.forEach(op => {
          const times = (type === 'weekday') ? op.weekday : op.holiday;
          if(!times) return;
          times.forEach(item => { const tmin = toMin(item.time); if (tmin >= nmin) candidates.push({ ...item, operator: op.name, wait: tmin - nmin, board: op.board_stop }); });
        });

        // 深夜の場合は翌日の便
        if (candidates.length === 0) {
          data.operators.forEach(op => {
            const times = (type === 'weekday') ? op.weekday : op.holiday;
            if(!times) return;
            times.slice(0, 2).forEach(item => { const tmin = toMin(item.time) + 1440; candidates.push({ ...item, operator: op.name, wait: tmin - nmin, board: op.board_stop }); });
          });
        }

        candidates.sort((a, b) => a.wait - b.wait);
        const top3 = candidates.slice(0, 3);

        if (top3.length === 0) {
          list.appendChild(card("案内なし", "データの形式が正しくないか、運行がありません。"));
        } else {
          top3.forEach(x => {
            const waitTxt = x.wait >= 60 ? `あと ${Math.floor(x.wait / 60)}時間${x.wait % 60}分` : `あと ${x.wait}分`;
            const c = card(`発車 ${x.time}`, `${waitTxt}｜${x.operator}｜北鉄${x.route}番`);
            const btn = document.createElement('button'); btn.className = 'btn'; btn.textContent = '📸 乗り場の写真';
            const imgSrc = (x.operator.includes('北鉄')) ? './images/HOKUTETSUBUS_frontof_hoteltorifito.jpeg' : './images/JRBUS_frontof_hokurikubank.jpeg';
            btn.onclick = () => window.showImage(imgSrc, `${x.operator} 乗り場`);
            c.appendChild(btn); list.appendChild(c);
          });
        }
    }).catch((err) => { 
        console.error(err);
        loading.textContent = "⚠️ データの読み込みに失敗しました（JSONファイル名を確認してください）"; 
    });
    return wrap;
  }
};