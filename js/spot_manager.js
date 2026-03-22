// js/spot_manager.js ver 1.7.0
window.SpotManager = {
  selectedSpotId: null,

  async fetchSpots() {
    try {
      const res = await fetch('data/spots.json');
      const data = await res.json();
      return data.spots || [];
    } catch (e) { return []; }
  },

  // 日付数値（301など）を「3/1」形式に変換するヘルパー
  _fmtDate(val) {
    return `${Math.floor(val / 100)}/${val % 100}`;
  },

  checkStatus(spot) {
    if (!spot.periods) return { text: "不明", color: "#666", icon: "❓" };
    const now = new Date();
    const today = (now.getMonth() + 1) * 100 + now.getDate();
    const time = now.getHours() * 60 + now.getMinutes();
    const toMin = (s) => s.split(':').reduce((h, m) => h * 60 + +m);
    
    const p = spot.periods.find(r => r.start > r.end ? (today >= r.start || today <= r.end) : (today >= r.start && today <= r.end));
    if (!p) return { text: "休館", color: "#666", icon: "🌙" };

    const start = toMin(p.regular[0]), end = toMin(p.regular[1]);
    const isOpen = time >= start && time < end;
    return isOpen ? { text: "開園中", color: "#4caf50", icon: "🟢" } : { text: "閉館中", color: "#666", icon: "🌙" };
  },

  async renderList() {
    /* ... renderList の内容は変更なし（そのまま） ... */
    const wrap = document.createElement('div');
    const spots = await this.fetchSpots();
    spots.forEach(spot => {
      const status = this.checkStatus(spot);
      const item = document.createElement('div');
      item.className = 'link';
      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="flex:1;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <span style="font-size:10px; padding:2px 6px; border-radius:4px; background:${status.color}; color:#fff; font-weight:bold;">${status.text}</span>
              <div style="font-weight:bold; color:#fff;">${spot.name}</div>
            </div>
          </div>
          <div style="font-size:12px; color:var(--accent);">詳細 ❯</div>
        </div>`;
      item.onclick = () => {
        this.selectedSpotId = spot.id;
        openView(spot.id === 'kenrokuen' ? 'kenrokuen_detail' : 'spot_detail');
      };
      wrap.appendChild(item);
    });
    return wrap;
  },

  // ★兼六園のコードを参考に強化した詳細画面
  async renderDetail() {
    const spots = await this.fetchSpots();
    const spot = spots.find(s => s.id === this.selectedSpotId);
    if (!spot) return card("エラー", "データが見つかりません");

    const wrap = document.createElement('div');
    const status = this.checkStatus(spot);

    // 1. 入園料・観覧料（兼六園スタイルのグリッド表示）
    wrap.appendChild(card("🎫 入園料 / 観覧料", `
      <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:10px; border-left:4px solid var(--accent);">
        <div style="font-size:1.2em; font-weight:bold; color:#fff;">${spot.fee || '要確認'}</div>
        <p style="font-size:12px; color:var(--muted); margin-top:8px;">
          <strong style="color:var(--text);">休館日:</strong> ${spot.closed || '年中無休'}
        </p>
      </div>
    `));

    // 2. スケジュール（兼六園スタイルのテーブル表示を自動生成）
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
          <th style="text-align:left; padding:8px;">期間</th>
          <th>営業時間</th>
        </tr>
        ${rows}
      </table>
    `));

    // 3. リンク集
    const linkCard = card("🔗 リンク", "");
    if (spot.links.map) {
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