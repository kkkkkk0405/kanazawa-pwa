// js/spot_manager.js ver 1.4.0 (全上書き対応版)
window.SpotManager = {
  // 現在のデータを読み込む
  async fetchSpots() {
    try {
      const res = await fetch('data/spots.json');
      if (!res.ok) return [];
      const data = await res.json();
      return data.spots || [];
    } catch (e) {
      console.error("読み込み失敗:", e);
      return [];
    }
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
            <div style="font-size:11px; color:var(--muted); margin-top:6px; padding-left:4px;">
              🗓 ${spot.closed || '無休'} / 🎫 ${spot.fee || '要確認'}
            </div>
          </div>
          <div style="font-size:12px; color:var(--accent);">❯</div>
        </div>`;
      item.onclick = () => {
        if (spot.id === 'kenrokuen') openView('kenrokuen_detail');
        else if (spot.links?.official) window.open(spot.links.official, '_blank');
      };
      wrap.appendChild(item);
    });
    return wrap;
  },

  renderAdmin() {
    const wrap = document.createElement('div');
    wrap.appendChild(card("🔧 施設データ追加ツール", "情報を入力すると『全上書き用JSON』が生成されます。"));
    const form = document.createElement('div');
    form.style.padding = "0 14px";
    form.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px;">
        <input type="text" id="add-id" placeholder="ID (例: 21bi)" class="btn" style="background:var(--bg);">
        <input type="text" id="add-name" placeholder="施設名" class="btn" style="background:var(--bg);">
        <input type="text" id="add-closed" placeholder="定休日" class="btn" style="background:var(--bg);">
        <input type="text" id="add-fee" placeholder="値段" class="btn" style="background:var(--bg);">
        <input type="text" id="add-off" placeholder="公式サイトURL" class="btn" style="background:var(--bg);">
        <button class="btn" style="background:var(--accent); text-align:center; font-weight:bold;" onclick="SpotManager.createJSON()">完成版JSONを生成</button>
        <div id="json-area" style="display:none; margin-top:15px; background:#000; padding:12px; border-radius:8px; border:1px solid #333;">
          <div style="font-size:11px; color:#4caf50; margin-bottom:8px;">✅ 生成完了！ <b>spots.json の中身を全選択して、下を丸ごと貼り付けてください。</b></div>
          <textarea id="json-res" readonly style="width:100%; height:200px; background:transparent; color:#0f0; font-family:monospace; font-size:11px; border:none; outline:none;"></textarea>
          <button class="btn" style="margin-top:10px; padding:8px; text-align:center;" onclick="SpotManager.copyJSON()">全部コピーする</button>
        </div>
      </div>`;
    wrap.appendChild(form);
    return wrap;
  },

  async createJSON() {
    // 1. 今のデータを読み込む
    const currentSpots = await this.fetchSpots();
    
    // 2. 新しいデータを作る
    const newSpot = {
      id: document.getElementById('add-id').value,
      name: document.getElementById('add-name').value,
      closed: document.getElementById('add-closed').value,
      fee: document.getElementById('add-fee').value,
      links: { map: "", official: document.getElementById('add-off').value },
      periods: [{ start: 101, end: 1231, early: ["00:00", "00:00"], regular: ["09:00", "17:00"] }]
    };

    // 3. 合体させて「完成品」の形にする
    const fullData = { "spots": [...currentSpots, newSpot] };
    
    document.getElementById('json-area').style.display = "block";
    document.getElementById('json-res').value = JSON.stringify(fullData, null, 2);
  },

  copyJSON() {
    const textarea = document.getElementById('json-res');
    textarea.select();
    document.execCommand('copy');
    alert("コピー完了！spots.jsonを全上書きしてください。");
  }
};

window.SpotViews = {
  spot_list: () => window.SpotManager.renderList(),
  admin: () => window.SpotManager.renderAdmin()
};