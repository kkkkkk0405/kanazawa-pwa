// ==========================
// バス情報管理モジュール (bus.js)
// ==========================
window.BusViews = {
  // 1. 交通案内のトップ画面
  bus_top() {
    const wrap = document.createElement('div');
    wrap.appendChild(card("交通案内", "調べたい行き先を選択してください。"));
    const items = [
      { label: "📍 橋場町方面（ひがし茶屋街）", view: "bus_hashiba_menu" },
      { label: "📍 県立図書館（崎浦・金大方面）", view: "home" }
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
    const wrap = document.createElement('div');
    wrap.appendChild(card("橋場町方面", "運行日を選択してください。"));
    const items = [
      { label: "📅 平日ダイヤ（月〜金）", view: "bus_hashiba_weekday" },
      { label: "🎉 土日祝ダイヤ", view: "bus_hashiba_holiday" },
      { label: "🕒 時刻表を表示（画像）", view: "bus_hashiba_timetable" }
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

  // 3. 橋場町（平日）
  bus_hashiba_weekday() {
    // window.BusViews を直接指定して確実に呼び出す
    return window.BusViews._createBusView('./data/bus-hashibamachi-weekday-20260314.json', 'weekday');
  },

  // 4. 橋場町（土日祝）
  bus_hashiba_holiday() {
    return window.BusViews._createBusView('./data/bus-hashibamachi-weekend-holidays-20260314.json', 'holiday');
  },

  // 5. 画像時刻表
  bus_hashiba_timetable() {
    const wrap = document.createElement("div");
    wrap.appendChild(card("橋場町行 時刻表", "2026年3月改正版"));
    const img = document.createElement("img");
    img.src = "./images/hashibacho-202603.png";
    img.style.width = "100%";
    img.style.borderRadius = "10px";
    img.style.border = "1px solid #1f2937";
    wrap.appendChild(img);
    return wrap;
  },

  // 🛠️ 内部用：共通の描画メカニズム
  _createBusView(jsonPath, type) {
    const wrap = document.createElement('div');
    const list = document.createElement('div');
    const loading = document.createElement('p');
    loading.textContent = "⌛ データを読み込み中...";
    wrap.appendChild(loading);
    wrap.appendChild(list);

    const toMin = (hhmm) => { 
      if(!hhmm) return 0;
      const [h, m] = hhmm.split(':').map(Number); 
      return h * 60 + m; 
    };
    const nowMin = () => { 
      const n = new Date(); 
      return n.getHours() * 60 + n.getMinutes(); 
    };

    fetch(jsonPath)
      .then(r => {
        if (!r.ok) throw new Error('File not found');
        return r.json();
      })
      .then(data => {
        loading.remove();
        const nmin = nowMin();
        let candidates = [];

        data.operators.forEach(op => {
          const times = (type === 'weekday') ? op.weekday : op.holiday;
          if(!times) return;
          
          times.forEach(item => {
            const tmin = toMin(item.time);
            if (tmin >= nmin) {
              candidates.push({ ...item, operator: op.name, wait: tmin - nmin, board: op.board_stop });
            }
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
        const top3 = candidates.slice(0, 3);

        if (top3.length === 0) {
          list.appendChild(card("案内なし", "本日の運行は終了しました。"));
        } else {
          top3.forEach(x => {
            const waitTxt = x.wait >= 60 ? `あと ${Math.floor(x.wait / 60)}時間${x.wait % 60}分` : `あと ${x.wait}分`;
            const info = x.route ? `北鉄${x.route}番｜乗: ${x.board}` : `JR(${x.dest})｜乗: ${x.board}`;
            const c = card(`発車 ${x.time}`, `${waitTxt}｜${x.operator}｜${info}`);
            
            const btn = document.createElement('button');
            btn.className = 'btn'; // index.htmlで定義した白い文字になるクラス
            btn.textContent = '📸 乗り場の写真';
            const imgSrc = (x.operator === '北鉄バス') ? './images/HOKUTETSUBUS_frontof_hoteltorifito.jpeg' : './images/JRBUS_frontof_hokurikubank.jpeg';
            
            // showImageがmain.jsにあるのでそのまま呼べる
            btn.onclick = () => showImage(imgSrc, `${x.operator} 乗り場`);
            
            c.appendChild(btn);
            list.appendChild(c);
          });
        }
      })
      .catch(err => {
        loading.textContent = "⚠️ データの読み込みに失敗しました。ファイル名を確認してください。";
        console.error(err);
      });

    return wrap;
  }
};