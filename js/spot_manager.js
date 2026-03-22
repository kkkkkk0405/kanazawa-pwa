// js/spot_manager.js ver 1.3.0
window.SpotManager = {
  async fetchSpots() {
    try {
      const res = await fetch('data/spots.json');
      const data = await res.json();
      return data.spots;
    } catch (e) { return []; }
  },

  // 現在時刻から「開園中」か判定するヘルパー関数
  checkStatus(spot) {
    const now = new Date();
    const today = (now.getMonth() + 1) * 100 + now.getDate();
    const time = now.getHours() * 60 + now.getMinutes();
    const toMin = (s) => s.split(':').reduce((h, m) => h * 60 + +m);

    const p = spot.periods.find(r => r.start > r.end ? (today >= r.start || today <= r.end) : (today >= r.start && today <= r.end));
    if (!p) return { text: "休館", color: "#666" };

    const start = toMin(p.regular[0]);
    const end = toMin(p.regular[1]);

    if (time >= start && time < end) return { text: "開園中", color: "#4caf50" };
    return { text: "閉館中", color: "#f44336" };
  },

  // 1. 一覧画面：バッジ表示を追加
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
        </div>
      `;
      item.onclick = () => {
        if (spot.id === 'kenrokuen') openView('kenrokuen_detail');
        else if (spot.links?.official) window.open(spot.links.official, '_blank');
      };
      wrap.appendChild(item);
    });
    return wrap;
  },

  // 2. 管理者画面：貼り付けガイドを強化
  async renderAdmin() {
    const wrap = document.createElement('div');
    const adminCard = card("🔧 施設データ作成", "情報を入力してJSONを生成します。");
    
    adminCard.innerHTML += `
      <div style="display:flex; flex-direction:column; gap:10px; margin-top:15px;">
        <input type="text" id="add-id" placeholder="ID (例: 21bi)" class="btn" style="background:var(--bg);">
        <input type="text" id="add-name" placeholder="施設名" class="btn" style="background:var(--bg);">
        <input type="text" id="add-closed" placeholder="定休日" class="btn" style="background:var(--bg);">
        <input type="text" id="add-fee" placeholder="値段" class="btn" style="background:var(--bg);">
        <input type="text" id="add-off" placeholder="公式サイトURL" class="btn" style="background:var(--bg);">
        
        <button