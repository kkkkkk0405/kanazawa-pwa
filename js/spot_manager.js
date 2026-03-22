// js/spot_manager.js ver 1.0.0
window.SpotManager = {
  // 共通データ取得
  async fetchSpots() {
    const res = await fetch('data/spots.json');
    return await res.json();
  },

  // 1. 施設一覧画面の生成
  async renderList() {
    const data = await this.fetchSpots();
    const wrap = document.createElement('div');
    wrap.innerHTML = '<p style="font-size:14px; color:var(--muted); margin-bottom:15px;">金沢市内の主要施設一覧です。</p>';

    const list = document.createElement('div');
    data.spots.forEach(spot => {
      // 施設カードの作成
      const item = card(spot.name, "詳細・リンクを確認 ❯");
      item.onclick = () => {
        // 兼六園なら専用ページ、それ以外なら汎用詳細へ（後で実装）
        openView(spot.id === 'kenrokuen' ? 'kenrokuen_detail' : 'home'); 
      };
      list.appendChild(item);
    });

    wrap.appendChild(list);
    return wrap;
  },

  // 2. 管理者画面の生成（JSONジェネレーター）
  renderAdmin() {
    // 簡易パスワード認証
    const pass = prompt("管理者パスワードを入力してください");
    if (pass !== "kit2026") { // パスワードは任意に変えてね
      return card("アクセス拒否", "パスワードが正しくありません。");
    }

    const wrap = document.createElement('div');
    const formCard = card("➕ 施設追加ツール", "情報を入力してJSONを生成します。");
    
    formCard.innerHTML += `
      <div style="display:flex; flex-direction:column; gap:10px; margin-top:15px;">
        <input type="text" id="in-id" placeholder="ID (例: 21bi)" class="btn" style="background:var(--bg);">
        <input type="text" id="in-name" placeholder="施設名 (例: 21世紀美術館)" class="btn" style="background:var(--bg);">
        <input type="text" id="in-map" placeholder="GoogleMap URL" class="btn" style="background:var(--bg);">
        <input type="text" id="in-off" placeholder="公式サイト URL" class="btn" style="background:var(--bg);">
        <button class="btn" style="background:var(--accent); text-align:center;" onclick="SpotManager.generate()">JSONを生成</button>
      </div>
      <div id="json-output" style="margin-top:20px; display:none;">
        <p style="font-size:12px; color:var(--accent);">↓これをコピーして spots.json の末尾に貼り付けてください</p>
        <textarea id="res-json" style="width:100%; height:150px; background:#000; color:#0f0; font-family:monospace; font-size:12px; padding:10px; border-radius:8px; border:1px solid var(--accent);"></textarea>
      </div>
    `;
    wrap.appendChild(formCard);
    return wrap;
  },

  // JSON生成ロジック
  generate() {
    const newSpot = {
      id: document.getElementById('in-id').value,
      name: document.getElementById('in-name').value,
      links: {
        map: document.getElementById('in-map').value,
        official: document.getElementById('in-off').value
      },
      periods: [
        { "start": 101, "end": 1231, "early": ["00:00", "00:00"], "regular": ["09:00", "17:00"] }
      ]
    };
    const out = document.getElementById('res-json');
    out.value = JSON.stringify(newSpot, null, 2).replace(/^/, " , "); // 貼り付けやすいようにカンマ付き
    document.getElementById('json-output').style.display = 'block';
  }
};

// Viewとして登録
window.SpotViews = {
  spot_list: () => SpotManager.renderList(),
  admin: () => SpotManager.renderAdmin()
};