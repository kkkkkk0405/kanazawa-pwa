// js/spot_manager.js ver 1.7.1
window.SpotManager = {
  selectedSpotId: null,

  async fetchSpots() {
    try {
      const res = await fetch('data/spots.json');
      const data = await res.json();
      return data.spots || [];
    } catch (e) { return []; }
  },

  _fmtDate(val) {
    return `${Math.floor(val / 100)}/${val % 100}`;
  },

  // 今日の営業時間を取得するヘルパー
  _getTodayHours(spot) {
    const now = new Date();
    const today = (now.getMonth() + 1) * 100 + now.getDate();
    const p = spot.periods.find(r => r.start > r.end ? (today >= r.start || today <= r.end) : (today >= r.start && today <= r.end));
    return p ? `${p.regular[0]} 〜 ${p.regular[1]}` : "時間不明";
  },

  checkStatus(spot) {
    if (!spot.periods) return { text: "不明", color: "#666" };
    const now = new Date();
    const today = (now.getMonth() + 1) * 100 + now.getDate();
    const time = now.getHours() * 60 + now.getMinutes();
    const toMin = (s) => s.split(':').reduce((h, m) => h * 60 + +m);
    
    const p = spot.periods.find(r => r.start > r.end ? (today >= r.start || today <= r.end) : (today >= r.start && today <= r.end));
    if (!p) return { text: "休館", color: "#f44336" }; // 休みは赤

    const start = toMin(p.regular[0]), end = toMin(p.regular[1]);
    const isOpen = time >= start && time < end;
    
    // 閉館中を赤（#f44336）に固定
    return isOpen ? { text: "開園中", color: "#4caf50" } : { text: "閉館中", color: "#f44336" };
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
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
              <span style="font-size:10px; padding:2px 6px; border-radius:4px; background:${status.color}; color:#fff; font-weight:bold;">${status.text}</span>
              <div style="font-weight:bold; color:#fff;">${spot.name}</div>
            </div>
            <div style="font-size:11px; color:var(--muted); display:flex; flex-wrap:wrap; gap:10px; padding-left:2px;">
              <span><b style="color:var(--text); opacity:0.8;">休</b> ${spot.closed || '無休'}</span>
              <span><b style="color:var(--text); opacity:0.8;">営</b> ${hours}</span>
            </div>
          </div>
          <div style="font-size:12px; color:var(--accent); font-weight:bold; margin-left:10px;">詳細 ❯</div>
        </div>`;
      
      item.onclick = () => {
        this.selectedSpotId = spot.id;
        openView(spot.id === 'kenrokuen' ? 'kenrokuen_detail' : 'spot_detail');
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

    // 1. 基本情報（兼六園スタイルのリッチ表示）
    wrap.appendChild(card(spot.name, `
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
        <span style="padding:4px 10px; border-radius:15px; background:${status.color}; color:#fff; font-weight:bold; font-size:13px;">${status.text}</span>
        <span style="font-size:14px;"><strong style="color:var(--muted);">休</strong> ${spot.closed || '年中無休'}</span>
      </div>
      <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:10px; border-left:4px solid var(--accent);">
        <small style="color:var(--muted);">観覧料・入園料</small><br>
        <strong style="font-size:1.1em;">${spot.fee || '要確認'}</strong>
      </div>
    `));

    // 2. 年間スケジュール
    let rows = "";
    spot.periods.forEach(p => {
      rows += `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
          <td style="padding:10px 6px;">${this._fmtDate(p.start)} 〜 ${this._fmtDate(p.end)}</td>
          <td style="text-align:center; font-weight:bold; color:var(--accent);">${p.regular[0]} 〜 ${p.regular[1]}</td>
        </tr>`;
    });

    wrap.appendChild(card("🕒 開園・開館スケジュール", `
      <table style="width:100%; border-collapse:collapse; font-size:13px;">
        <tr style="color:var(--muted); border-bottom:1px solid #374151;">
          <th style="text-align:left; padding:8px;">期間</th><th>営業時間</th>
        </tr>
        ${rows}
      </table>
    `));

    // 3. リンク
    const linkCard = card("🔗 リンク", "");
    if (spot.links && spot.links.map) {
      const gmap = document.createElement('button');
      gmap.className = 'btn'; gmap.innerHTML = '📍 Googleマップを開く';
      gmap.onclick = () => window.open(spot.links.map, '_blank');
      linkCard.appendChild(gmap);
    }
    const official = document.createElement('button');
    official.className = 'btn'; official.style.marginTop = '8px';
    official.innerHTML = `🌐 公式サイト (${spot.name})`;
    official.onclick = () => window.open(spot.links.official, '_blank');
    linkCard.appendChild(official);
    wrap.appendChild(linkCard);

    return wrap;
  }
};

window.SpotViews = {
  spot_list: () => window.SpotManager.renderList(),
  spot_detail: () => window.SpotManager.renderDetail(),
  admin: () => window.Developer.renderAdmin()
};