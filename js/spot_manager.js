// js/spot_manager.js ver 1.6.1
window.SpotManager = {
  selectedSpotId: null,

  async fetchSpots() {
    try {
      const res = await fetch('data/spots.json');
      if (!res.ok) return [];
      const data = await res.json();
      return data.spots || [];
    } catch (e) { return []; }
  },

  _getTodayHours(spot) {
    const now = new Date();
    const today = (now.getMonth() + 1) * 100 + now.getDate();
    const p = spot.periods.find(r => r.start > r.end ? (today >= r.start || today <= r.end) : (today >= r.start && today <= r.end));
    return p ? `${p.regular[0]}〜${p.regular[1]}` : "時間不明";
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
    return (time >= start && time < end) ? { text: "開園中", color: "#4caf50" } : { text: "閉園中", color: "#f44336" };
  },

  async renderList() {
    const wrap = document.createElement('div');
    const spots = await this.fetchSpots();
    spots.forEach(spot => {
      const status = this.checkStatus(spot);
      const hours = this._getTodayHours(spot);
      const item = document.createElement('div');
      item.className = 'link';
      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="flex:1;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <span style="font-size:10px; padding:2px 6px; border-radius:4px; background:${status.color}; color:#fff; font-weight:bold;">${status.text}</span>
              <div style="font-weight:bold; color:#fff;">${spot.name}</div>
            </div>
            <div style="font-size:11px; color:var(--muted); padding-left:2px; display:flex; flex-wrap:wrap; gap:12px;">
              <span><b style="color:var(--text); opacity:0.7;">休</b> ${spot.closed || '無休'}</span>
              <span><b style="color:var(--text); opacity:0.7;">営</b> ${hours}</span>
              <span><b style="color:var(--text); opacity:0.7;">🎫</b> ${spot.fee || '要確認'}</span>
            </div>
          </div>
          <div style="font-size:12px; color:var(--accent); font-weight:bold;">詳細 ❯</div>
        </div>`;
      item.onclick = () => {
        if (spot.id === 'kenrokuen') openView('kenrokuen_detail');
        else { this.selectedSpotId = spot.id; openView('spot_detail'); }
      };
      wrap.appendChild(item);
    });
    return wrap;
  },

  async renderDetail() {
    const spots = await this.fetchSpots();
    const spot = spots.find(s => s.id === this.selectedSpotId);
    if (!spot) return card("エラー", "データが見つかりません");
    const wrap = document.createElement('div');
    const status = this.checkStatus(spot);
    wrap.appendChild(card(spot.name, `
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
        <span style="padding:4px 10px; border-radius:15px; background:${status.color}; color:#fff; font-weight:bold; font-size:13px;">${status.text}</span>
        <span style="font-size:14px;"><strong style="color:var(--muted);">休</strong> ${spot.closed || '年中無休'}</span>
      </div>
      <div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:8px;">
        <small style="color:var(--muted);">観覧料・入園料</small><br>
        <strong style="font-size:1.1em;">${spot.fee || '要確認'}</strong>
      </div>`));
    return wrap;
  }
};

// 外部への公開（Developerは後で読み込まれるのでアロー関数にする）
window.SpotViews = {
  spot_list: () => window.SpotManager.renderList(),
  spot_detail: () => window.SpotManager.renderDetail(),
  admin: () => window.Developer ? window.Developer.renderAdmin() : card("エラー", "Developer.jsが読み込まれていません")
};