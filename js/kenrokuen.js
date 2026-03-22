// js/kenrokuen.js ver 1.3.0
window.Kenrokuen = {
  async _fetchData() {
    const res = await fetch('data/spots.json');
    if (!res.ok) throw new Error('JSON load failed');
    return await res.json();
  },
  _toMin(s) { return s.split(':').reduce((h, m) => h * 60 + +m); },

  async getStatus() {
    try {
      const data = await this._fetchData();
      // 配列の中から兼六園のデータを探す
      const spot = data.spots.find(s => s.id === 'kenrokuen');
      if (!spot) return null;

      const now = new Date();
      const today = (now.getMonth() + 1) * 100 + now.getDate();
      const time = now.getHours() * 60 + now.getMinutes();

      // 兼六園の periods を使用
      const p = spot.periods.find(r => r.start > r.end ? (today >= r.start || today <= r.end) : (today >= r.start && today <= r.end));
      if (!p) return null;

      const eO = this._toMin(p.early[0]), eC = this._toMin(p.early[1]);
      const rO = this._toMin(p.regular[0]), rC = this._toMin(p.regular[1]);
      const lastEntry = rC - 30;

      const info = { early: `${p.early[0]}〜${p.early[1]}`, reg: `${p.regular[0]}〜${p.regular[1]}` };

      if (time >= eO && time < eC) return { ...info, text: "早朝開園中", color: "#4caf50", icon: "🌅" };
      if (time >= eC && time < rO) return { ...info, text: "入替中", color: "#ff9800", icon: "⏳" };
      if (time >= rO && time < rC) {
        if (time >= lastEntry) return { ...info, text: "最終入園終了", color: "#f44336", icon: "⚠️" };
        return { ...info, text: "通常開園中", color: "#4caf50", icon: "🟢" };
      }
      return { ...info, text: "閉園中", color: "#666", icon: "🌙" };
    } catch (e) { return { text: "データエラー", color: "#f44336", icon: "❌" }; }
  },

  async renderChip(targetId) {
    const el = document.querySelector(targetId);
    if (!el) return;
    const info = await this.getStatus();
    if (!info) return;
    el.innerHTML = `
      <span style="font-size:1.4em;">${info.icon}</span>
      <div style="line-height:1.2; margin-left:8px;">
        <div style="font-weight:bold; font-size:12px;">兼六園: ${info.text}</div>
        <div style="font-size:10px; opacity:0.7; display:flex; gap:8px;">
          <span>🌅早朝 ${info.early}</span><span>🎫通常 ${info.reg}</span>
        </div>
      </div>`;
    el.style.borderLeft = `4px solid ${info.color}`;
  },

  async renderDetail() {
    const data = await this._fetchData();
    const spot = data.spots.find(s => s.id === 'kenrokuen');
    if (!spot) return card("エラー", "データが見つかりませんでした。");

    const wrap = document.createElement('div');
    
    wrap.appendChild(card("🎫 入園料", `
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:14px;">
        <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;">
          <small>大人 (18歳以上)</small><br><strong style="font-size:1.2em;">320円</strong>
        </div>
        <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;">
          <small>小人 (6〜18歳未満)</small><br><strong style="font-size:1.2em;">100円</strong>
        </div>
      </div>
      <p style="font-size:12px; color:var(--muted); margin-top:8px;">※65歳以上は公的証明書の提示で無料<br>※早朝入園時間帯は<strong>入園無料</strong></p>
    `));

    wrap.appendChild(card("🕒 年間スケジュール", `
      <table style="width:100%; border-collapse:collapse; font-size:13px;">
        <tr style="border-bottom:1px solid #374151; color:var(--muted);">
          <th style="text-align:left; padding:8px;">期間</th><th>通常開園</th>
        </tr>
        <tr><td style="padding:6px;">3/1 〜 10/15</td><td style="text-align:center;">7:00 〜 18:00</td></tr>
        <tr><td style="padding:6px;">10/16 〜 2月末</td><td style="text-align:center;">8:00 〜 17:00</td></tr>
      </table>
    `));
    
    const linkCard = card("🔗 リンク", "");
    const gmap = document.createElement('button');
    gmap.className = 'btn'; gmap.innerHTML = '📍 Googleマップを開く';
    // JSONのリンクを使用
    gmap.onclick = () => window.open(spot.links.map, '_blank');
    
    const official = document.createElement('button');
    official.className = 'btn'; official.style.marginTop = '8px';
    official.innerHTML = '🌐 公式サイト（石川県）';
    // JSONのリンクを使用
    official.onclick = () => window.open(spot.links.official, '_blank');
    
    linkCard.appendChild(gmap); linkCard.appendChild(official);
    wrap.appendChild(linkCard);
    return wrap;
  }
};

window.KenrokuenViews = { kenrokuen_detail: () => window.Kenrokuen.renderDetail() };