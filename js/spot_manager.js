// js/spot_manager.js ver 1.5.0
window.SpotManager = {
  selectedSpotId: null, // 現在表示中の施設ID

  async fetchSpots() {
    try {
      const res = await fetch('data/spots.json');
      if (!res.ok) return [];
      const data = await res.json();
      return data.spots || [];
    } catch (e) { return []; }
  },

  checkStatus(spot) {
    if (!spot.periods) return { text: "不明", color: "#666" };
    const now = new Date();
    const today = (now.getMonth() + 1) * 100 + now.getDate();
    const time = now.getHours() * 60 + now.getMinutes();
    const toMin = (s) => s.split(':').reduce((h, m) => h * 60 + +m);
    const p = spot.periods.find(r => r.start > r.end ? (today >= r.start || today <= r.end) : (today >= r.start && today <= r.end));
    if (!p) return { text: "休館", color: "#666" };
    const start = toMin(p.regular[0]), end = toMin(p.regular[1]);
    return (time >= start && time < end) ? { text: "開園中", color: "#4caf50" } : { text: "閉館中", color: "#f44336" };
  },

  async renderList() {
    const wrap = document.createElement('div');
    const spots = await this.fetchSpots();
    spots.forEach(spot => {
      const status = this.checkStatus(spot);
      const item = document.createElement('div');
      item.className = 'link';
      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="flex:1;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:10px; padding:2px 6px; border-radius:4px; background:${status.color}; color:#fff; font-weight:bold;">${status.text}</span>
              <div style="font-weight:bold; color:#fff;">${spot.name}</div>
            </div>
          </div>
          <div style="font-size:12px; color:var(--accent);">詳細 ❯</div>
        </div>`;
      
      item.onclick = () => {
        if (spot.id === 'kenrokuen') {
          openView('kenrokuen_detail');
        } else {
          // 兼六園以外は「汎用詳細画面」へ
          this.selectedSpotId = spot.id;
          openView('spot_detail');
        }
      };
      wrap.appendChild(item);
    });
    return wrap;
  },

  // ★新規追加: 全施設共通の詳細画面
  async renderDetail() {
    const spots = await this.fetchSpots();
    const spot = spots.find(s => s.id === this.selectedSpotId);
    if (!spot) return card("エラー", "データが見つかりません");

    const wrap = document.createElement('div');
    const status = this.checkStatus(spot);

    // 1. 基本情報カード
    wrap.appendChild(card(spot.name, `
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
        <span style="padding:4px 10px; border-radius:15px; background:${status.color}; color:#fff; font-weight:bold; font-size:13px;">${status.text}</span>
        <span style="font-size:14px;">🗓 ${spot.closed || '年中無休'}</span>
      </div>
      <div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:8px;">
        <small style="color:var(--muted);">観覧料・入園料</small><br>
        <strong style="font-size:1.1em;">${spot.fee || '要確認'}</strong>
      </div>
    `));

    // 2. 営業時間カード
    let rows = "";
    spot.periods.forEach(p => {
      rows += `<tr><td style="padding:8px;">通年</td><td style="text-align:center;">${p.regular[0]} 〜 ${p.regular[1]}</td></tr>`;
    });
    wrap.appendChild(card("🕒 営業時間", `
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <tr style="border-bottom:1px solid #374151; color:var(--muted); font-size:12px;">
          <th style="text-align:left; padding:8px;">期間</th><th>通常開園</th>
        </tr>
        ${rows}
      </table>
    `));

    // 3. リンクカード
    const linkCard = card("🔗 外部リンク", "");
    const official = document.createElement('button');
    official.className = 'btn'; official.innerHTML = '🌐 公式サイトを開く';
    official.onclick = () => window.open(spot.links.official, '_blank');
    linkCard.appendChild(official);
    wrap.appendChild(linkCard);

    return wrap;
  },

  renderAdmin() {
    const wrap = document.createElement('div');
    wrap.appendChild(card("🔧 施設データ追加", "全上書き用JSONを生成します。"));
    const form = document.createElement('div');
    form.style.padding = "0 14px";
    form.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:8px;">
        <input type="text" id="add-id" placeholder="ID (例: 21bi)" class="btn" style="background:var(--bg);">
        <input type="text" id="add-name" placeholder="施設名" class="btn" style="background:var(--bg);">
        <input type="text" id="add-closed" placeholder="定休日" class="btn" style="background:var(--bg);">
        <input type="text" id="add-fee" placeholder="値段" class="btn" style="background:var(--bg);">
        <input type="text" id="add-off" placeholder="公式サイトURL" class="btn" style="background:var(--bg);">
        <button class="btn" style="background:var(--accent); text-align:center;" onclick="SpotManager.createJSON()">JSON生成</button>
        <div id="json-area" style="display:none; margin-top:10px;">
          <textarea id="json-res" readonly style="width:100%; height:150px; background:#000; color:#0f0; font-size:10px;"></textarea>
          <button class="btn" style="margin-top:5px; text-align:center;" onclick="SpotManager.copyJSON()">全部コピー</button>
        </div>
      </div>`;
    wrap.appendChild(form);
    return wrap;
  },

  async createJSON() {
    const currentSpots = await this.fetchSpots();
    const newSpot = {
      id: document.getElementById('add-id').value,
      name: document.getElementById('add-name').value,
      closed: document.getElementById('add-closed').value,
      fee: document.getElementById('add-fee').value,
      links: { map: "", official: document.getElementById('add-off').value },
      periods: [{ start: 101, end: 1231, early: ["00:00", "00:00"], regular: ["09:00", "17:00"] }]
    };
    const fullData = { "spots": [...currentSpots, newSpot] };
    document.getElementById('json-area').style.display = "block";
    document.getElementById('json-res').value = JSON.stringify(fullData, null, 2);
  },

  copyJSON() {
    const textarea = document.getElementById('json-res');
    textarea.select();
    document.execCommand('copy');
    alert("コピー完了！");
  }
};

window.SpotViews = {
  spot_list: () => window.SpotManager.renderList(),
  spot_detail: () => window.SpotManager.renderDetail(), // 汎用詳細
  admin: () => window.SpotManager.renderAdmin()
};