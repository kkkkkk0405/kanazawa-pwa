// ==========================
// バス情報管理モジュール
// ==========================
window.BusViews = {
  // 橋場町（平日）
  bus_hashiba_weekday() {
    // メモ：ここから平日の処理
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
      const ops = data.operators.filter(op => selOp.value === 'all' ? true : op.name === selOp.value);
      let candidates = [];

      for (const op of ops) {
        for (const item of op.weekday) {
          const tmin = toMin(item.time);
          if (tmin >= nmin) {
            candidates.push({ ...item, operator: op.name, wait: tmin - nmin, board: op.board_stop, alight: op.alight_stop });
          }
        }
      }

      // 直近がない場合は翌日の便を検索
      if (candidates.length === 0) {
        for (const op of ops) {
          for (const item of op.weekday.slice(0, 3)) {
            const tmin = toMin(item.time) + 24 * 60;
            candidates.push({ ...item, operator: op.name, wait: tmin - nmin, board: op.board_stop, alight: op.alight_stop });
          }
        }
      }

      candidates.sort((a, b) => a.wait - b.wait);
      const top3 = candidates.slice(0, 3);
      if (!top3.length) { list.appendChild(card('本日の運行なし', '')); return; }

      top3.forEach(x => {
        const info = x.route ? `北鉄${x.route}番｜乗: ${x.board}` : `JR(${x.dest})｜乗: ${x.board}`;
        const waitTxt = x.wait >= 60 ? `あと ${Math.floor(x.wait/60)}時間${x.wait%60}分` : `あと ${x.wait}分`;
        const c = card(`発車 ${x.time}`, `${waitTxt}｜${x.operator}｜${info}`);
        
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = '乗り場の写真';
        const imgSrc = (x.operator === '北鉄バス') ? './images/HOKUTETSUBUS_frontof_hoteltorifito.jpeg' : './images/JRBUS_frontof_hokurikubank.jpeg';
        btn.addEventListener('click', () => showImage(imgSrc, x.operator + ' 乗り場'));
        c.appendChild(btn);
        list.appendChild(c);
      });
    };

    fetch('./data/bus-hashibamachi-weekday-20260314.json')
      .then(r => r.json()).then(data => { render(data); selOp.addEventListener('change', () => render(data)); });
    return wrap;
  },

  // 橋場町（土日祝）
  bus_hashiba_holiday() {
    // メモ：ここから土日祝の処理（平日版とほぼ同じですが、読み込むJSONを変えています）
    const wrap = document.createElement('div');
    const selOp = document.createElement('select');
    selOp.innerHTML = `<option value="all">事業者すべて</option><option value="北鉄バス">北鉄バスのみ</option><option value="JRバス">JRバスのみ</option>`;
    wrap.appendChild(selOp);
    const list = document.createElement('div');
    wrap.appendChild(list);

    const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h*60 + m; };
    const nowMin = () => { const n = new Date(); return n.getHours()*60 + n.getMinutes(); };

    const render = (data) => {
      list.innerHTML = '';
      const nmin = nowMin();
      const ops = data.operators.filter(op => selOp.value === 'all' ? true : op.name === selOp.value);
      let candidates = [];
      for (const op of ops) {
        for (const item of op.holiday) {
          const tmin = toMin(item.time);
          if (tmin >= nmin) { candidates.push({ ...item, operator: op.name, wait: tmin - nmin, board: op.board_stop, alight: op.alight_stop }); }
        }
      }
      if (candidates.length === 0) {
        for (const op of ops) {
          for (const item of op.holiday.slice(0, 3)) {
            const tmin = toMin(item.time) + 24 * 60;
            candidates.push({ ...item, operator: op.name, wait: tmin - nmin, board: op.board_stop, alight: op.alight_stop });
          }
        }
      }
      candidates.sort((a, b) => a.wait - b.wait);
      candidates.slice(0, 3).forEach(x => {
        const info = x.route ? `北鉄${x.route}番｜乗: ${x.board}` : `JR(${x.dest})｜乗: ${x.board}`;
        const waitTxt = x.wait >= 60 ? `あと ${Math.floor(x.wait/60)}時間${x.wait%60}分` : `あと ${x.wait}分`;
        const c = card(`発車 ${x.time}`, `${waitTxt}｜${x.operator}｜${info}`);
        list.appendChild(c);
      });
    };

    fetch('./data/bus-hashibamachi-weekend-holidays-20260314.json')
      .then(r => r.json()).then(data => { render(data); selOp.addEventListener('change', () => render(data)); });
    return wrap;
  }
};
