// js/spot_manager.js ver 1.1.0
window.SpotManager = {
  // JSONを読み込む共通関数
  async fetchSpots() {
    try {
      const res = await fetch('data/spots.json');
      if (!res.ok) throw new Error('JSON load failed');
      const data = await res.json();
      return data.spots; // 配列部分だけ返す
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  // 1. 各種施設一覧の描画
  async renderList() {
    const wrap = document.createElement('div');
    const spots = await this.fetchSpots();

    if (spots.length === 0) {
      return card("エラー", "施設データが読み込めませんでした。");
    }

    spots.forEach(spot => {
      const item = document.createElement('div');
      item.className = 'link';
      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:bold; color:#fff;">${spot.name}</div>
            <div style="font-size:12px; color:var(--muted);">詳細・公式サイト ❯</div>
          </div>
        </div>
      `;
      // クリックしたら各施設の詳細（兼六園なら専用View、他は公式URL）
      item.onclick = () => {
        if (spot.id === 'kenrokuen') openView('kenrokuen_detail');
        else if (spot.links && spot.links.official) window.open(spot.links.official, '_blank');
      };
      wrap.appendChild(item);
    });

    return wrap;
  },

  // 2. 管理者画面（JSON生成）の描画
  async renderAdmin() {
    const wrap = document.createElement('div');
    const adminCard = card("🔧 管理者ツール", "新しい施設データを生成します。");
    
    adminCard.innerHTML += `
      <div style="display:flex; flex-direction:column; gap:10px; margin-top:15px;">
        <input type="text" id="add-id" placeholder="ID (例: 21bi)" class="btn" style="background:var(--bg);">
        <input type="text" id="add-name" placeholder="施設名 (例: 21世紀美術館)" class="btn" style="background:var(--bg);">
        <input type="text" id="add-off" placeholder="公式サイトURL" class="btn" style="background:var(--bg);">
        <button class="btn" style="background:var(--accent); text-align:center;" onclick="SpotManager.createJSON()">JSONコード生成</button>
        <textarea id="json-res" style="display:none; width:100%; height:120px; background:#000; color:#0f0; font-size:11px; margin-top:10px;"></textarea>
      </div>
    `;
    wrap.appendChild(adminCard);
    return wrap;
  },

  // 生成ボタンのロジック
  createJSON() {
    const id = document.getElementById('add-id').value;
    const name = document.getElementById('add-name').value;
    const off = document.getElementById('add-off').value;
    const obj = { id, name, links: { map: "", official: off }, periods: [{ start: 101, end: 1231, early: ["00:00", "00:00"], regular: ["09:00", "17:00"] }] };
    
    const area = document.getElementById('json-res');
    area.value = JSON.stringify(obj, null, 2) + ",";
    area.style.display = "block";
    alert("JSONを作成しました。コピーして spots.json に追加してください。");
  }
};

// ★ここが一番重要！ main.jsがこれを見て描画します
window.SpotViews = {
  spot_list: () => window.SpotManager.renderList(),
  admin: () => window.SpotManager.renderAdmin()
};