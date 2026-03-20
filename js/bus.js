// バスの表示機能だけをまとめたファイル
window.BusViews = {
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

    const render = (data) => {
      list.innerHTML = '';
      const now = new Date();
      const nmin = now.getHours() * 60 + now.getMinutes();
      let candidates = [];

      data.operators.forEach(op => {
        op.weekday.forEach(item => {
          const [h, m] = item.time.split(':').map(Number);
          const tmin = h * 60 + m;
          if (tmin >= nmin) {
            candidates.push({
              ...item,
              operator: op.name,
              wait: tmin - nmin,
              board: op.board_stop,
              alight: op.alight_stop
            });
          }
        });
      });

      candidates.sort((a, b) => a.wait - b.wait);
      const top3 = candidates.slice(0, 3);
      if (top3.length === 0) {
        list.appendChild(card('本日の運行終了', ''));
        return;
      }

      top3.forEach(x => {
        const info = x.route 
          ? `北鉄${x.route}番｜乗: ${x.board}` 
          : `JR(${x.dest})｜乗: ${x.board}`;
        const c = card(`発車 ${x.time}`, `あと ${x.wait}分｜${x.operator}｜${info}`);
        list.appendChild(c);
      });
    };

    fetch('./data/bus-hashibamachi-weekday-20260314.json')
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

    const render = (data) => {
      list.innerHTML = '';
      const now = new Date();
      const nmin = now.getHours() * 60 + now.getMinutes();
      let candidates = [];

      data.operators.forEach(op => {
        op.holiday.forEach(item => {
          const [h, m] = item.time.split(':').map(Number);
          const tmin = h * 60 + m;
          if (tmin >= nmin) {
            candidates.push({
              ...item,
              operator: op.name,
              wait: tmin - nmin,
              board: op.board_stop,
              alight: op.alight_stop
            });
          }
        });
      });

      candidates.sort((a, b) => a.wait - b.wait);
      const top3 = candidates.slice(0, 3);
      if (top3.length === 0) {
        list.appendChild(card('本日の運行終了', ''));
        return;
      }

      top3.forEach(x => {
        const info = x.route 
          ? `北鉄${x.route}番｜乗: ${x.board}` 
          : `JR(${x.dest})｜乗: ${x.board}`;
        const c = card(`発車 ${x.time}`, `あと ${x.wait}分｜${x.operator}｜${info}`);
        list.appendChild(c);
      });
    };

    fetch('./data/bus-hashibamachi-weekend-holidays-20260314.json')
      .then(r => r.json())
      .then(data => {
        render(data);
        selOp.addEventListener('change', () => render(data));
      });
    return wrap;
  }
};
