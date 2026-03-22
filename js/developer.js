// js/developer.js ver 1.0.0
window.Developer = {
  // 管理者画面の描画
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
        <button class="btn" style="background:var(--accent); text-align:center; font-weight:bold;" onclick="Developer.createJSON()">完成版JSONを生成</button>
        <div id="json-area" style="display:none; margin-top:15px; background:#000; padding:12px; border-radius:8px; border:1px solid #333;">
          <div style="font-size:11px; color:#4caf50; margin-bottom:8px;">✅ 生成完了！ <b>spots.json を全上書き</b>してください。</div>
          <textarea id="json-res" readonly style="width:100%; height:200px; background:transparent; color:#0f0; font-family:monospace; font-size:11px; border:none; outline:none;"></textarea>
          <button class="btn" style="margin-top:10px; padding:8px; text-align:center;" onclick="Developer.copyJSON()">全部コピーする</button>
        </div>
      </div>`;
    wrap.appendChild(form);
    return wrap;
  },

  // JSON生成ロジック
  async createJSON() {
    // 既存のデータを SpotManager から借りてくる
    const currentSpots = await SpotManager.fetchSpots();
    
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