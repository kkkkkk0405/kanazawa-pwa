// js/spot_manager.js ver 1.2.0
window.SpotManager = {
  async fetchSpots() {
    try {
      const res = await fetch('data/spots.json');
      const data = await res.json();
      return data.spots;
    } catch (e) { return []; }
  },

  // 1. 一覧画面：定休日と値段も薄く表示するように改良
  async renderList() {
    const wrap = document.createElement('div');
    const spots = await this.fetchSpots();

    spots.forEach(spot => {
      const item = document.createElement('div');
      item.className = 'link';
      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:bold; color:#fff;">${spot.name}</div>
            <div style="font-size:11px; color:var(--muted); margin-top:4px;">
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

  // 2. 管理者画面：入力項目を増やしました
  async renderAdmin() {
    const wrap = document.createElement('div');
    const adminCard = card("🔧 施設データ作成", "新しい施設の情報を入力してください。");
    
    adminCard.innerHTML += `
      <div style="display:flex; flex-direction:column; gap:10px; margin-top:15px;">
        <div style="font-size:12px; color:var(--muted);">基本情報</div>
        <input type="text" id="add-id" placeholder="ID (例: 21bi)" class="btn" style="background:var(--bg);">
        <input type="text" id="add-name" placeholder="施設名 (例: 21世紀美術館)" class="btn" style="background:var(--bg);">
        
        <div style="font-size:12px; color:var(--muted); margin-top:10px;">観光情報</div>
        <input type="text" id="add-closed" placeholder="定休日 (例: 月曜日、年末年始)" class="btn" style="background:var(--bg);">
        <input type="text" id="add-fee" placeholder="値段 (例: 大人320円 / 65歳以上無料)" class="btn" style="background:var(--bg);">
        
        <div style="font-size:12px; color:var(--muted); margin-top:10px;">リンク</div>
        <input type="text" id="add-off" placeholder="公式サイトURL" class="btn" style="background:var(--bg);">
        
        <button class="btn" style="background:var(--accent); text-align:center; font-weight:bold;" onclick="SpotManager.createJSON()">JSONコードを生成</button>
        
        <div id="json-area" style="display:none; margin-top:15px;">
          <p style="font-size:11px; color:#4caf50;">↓これをコピーして spots.json の [ ] 内の最後に追加してください</p>
          <textarea id="json-res" style="width:100%; height:150px; background:#000; color:#0f0; font-family:monospace; font-size:11px; padding:10px; border:1px solid #333;"></textarea>
        </div>
      </div>
    `;
    wrap.appendChild(adminCard);
    return wrap;
  },

  createJSON() {
    const id = document.getElementById('add-id').value;
    const name = document.getElementById('add-name').value;
    const closed = document.getElementById('add-closed').value;
    const fee = document.getElementById('add-fee').value;
    const off = document.getElementById('add-off').value;

    const obj = {
      id,
      name,
      closed,
      fee,
      links: { map: "", official: off },
      periods: [{ start: 101, end: 1231, early: ["00:00", "00:00"], regular: ["09:00", "17:00"] }]
    };
    
    const area = document.getElementById('json-area');
    const res = document.getElementById('json-res');
    res.value = JSON.stringify(obj, null, 2).replace(/^/, "  , "); // 貼り付けやすいようにカンマ付き
    area.style.display = "block";
  }
};

window.SpotViews = {
  spot_list: () => window.SpotManager.renderList(),
  admin: () => window.SpotManager.renderAdmin()
};