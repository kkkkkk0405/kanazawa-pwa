// js/kenrokuen_time.js ver 1.2.0
window.Kenrokuen = {
  async _fetchData() {
    const res = await fetch('data/spots.json');
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  },

  _toMin(s) {
    return s.split(':').reduce((h, m) => h * 60 + +m);
  },

  async getStatus() {
    try {
      const data = await this._fetchData();
      const pList = data.periods;
      const now = new Date();
      const today = (now.getMonth() + 1) * 100 + now.getDate();
      const time = now.getHours() * 60 + now.getMinutes();

      const p = pList.find(r => r.start > r.end ? (today >= r.start || today <= r.end) : (today >= r.start && today <= r.end));
      if (!p) return null;

      const eO = this._toMin(p.early[0]), eC = this._toMin(p.early[1]);
      const rO = this._toMin(p.regular[0]), rC = this._toMin(p.regular[1]);
      const lastEntry = rC - 30;

      // 基本データ
      const info = {
        earlyHours: `${p.early[0]}〜${p.early[1]}`,
        regHours: `${p.regular[0]}〜${p.regular[1]}`,
        lastEntryText: `(最終入園 ${Math.floor(lastEntry/60)}:${String(lastEntry%60).padStart(2,'0')})`
      };

      // 現在の状態判定
      if (time >= eO && time < eC) {
        return { ...info, text: "早朝開園中", color: "#4caf50", icon: "🌅" };
      } 
      if (time >= eC && time < rO) {
        return { ...info, text: "入替中", color: "#ff9800", icon: "⏳" };
      }
      if (time >= rO && time < rC) {
        if (time >= lastEntry) return { ...info, text: "最終入園終了", color: "#f44336", icon: "⚠️" };
        return { ...info, text: "通常開園中", color: "#4caf50", icon: "🟢" };
      }
      return { ...info, text: "閉園中", color: "#666", icon: "🌙" };
    } catch (e) {
      return { text: "データエラー", color: "#f44336", icon: "❌" };
    }
  },

  async renderChip(targetId) {
    const el = document.querySelector(targetId);
    if (!el) return;
    const info = await this.getStatus();
    if (!info) return;

    // 1つの枠に情報を詰め込むレイアウト
    el.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:1.4em;">${info.icon}</span>
        <div style="line-height:1.2;">
          <div style="font-weight:bold; font-size:13px; margin-bottom:2px;">兼六園: ${info.text}</div>
          <div style="font-size:10px; opacity:0.8; display:flex; gap:8px;">
            <span>🌅早朝 ${info.earlyHours}</span>
            <span>🎫通常 ${info.regHours}</span>
          </div>
          ${info.text === "通常開園中" || info.text === "最終入園終了" ? 
            `<div style="font-size:9px; opacity:0.6; color:#ffb74d;">${info.lastEntryText}</div>` : ''}
        </div>
      </div>`;
    el.style.borderLeft = `4px solid ${info.color}`;
    el.style.paddingRight = `15px`; // 少し幅を持たせる
  },

  // 明日の早朝時間はそのまま残す
  async getTomorrowEarly() {
    try {
      const data = await this._fetchData();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tMMDD = (tomorrow.getMonth() + 1) * 100 + tomorrow.getDate();
      const p = data.periods.find(r => r.start > r.end ? (tMMDD >= r.start || tMMDD <= r.end) : (tMMDD >= r.start && tMMDD <= r.end));
      return p ? p.early[0] : null;
    } catch (e) { return null; }
  },
  renderDetail() {
    const wrap = document.createElement('div');
    
    // 1. 営業時間のまとめカード
    const timeCard = card("🕒 営業時間のまとめ", `
      <div style="overflow-x: auto;">
        <table style="width:100%; border-collapse:collapse; font-size:14px; margin-top:10px;">
          <thead>
            <tr style="border-bottom:2px solid #374151; color:var(--muted);">
              <th style="text-align:left; padding:8px;">期間</th>
              <th style="padding:8px;">早朝開園</th>
              <th style="padding:8px;">通常開園</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid #1f2937;">
              <td style="padding:10px 8px;">3/1 〜 3/31</td>
              <td style="text-align:center;">5:00〜</td>
              <td style="text-align:center;">7:00〜18:00</td>
            </tr>
            <tr style="border-bottom:1px solid #1f2937;">
              <td style="padding:10px 8px;">4/1 〜 8/31</td>
              <td style="text-align:center;">4:00〜</td>
              <td style="text-align:center;">7:00〜18:00</td>
            </tr>
            <tr style="border-bottom:1px solid #1f2937;">
              <td style="padding:10px 8px;">9/1 〜 10/15</td>
              <td style="text-align:center;">5:00〜</td>
              <td style="text-align:center;">7:00〜18:00</td>
            </tr>
            <tr style="border-bottom:1px solid #1f2937;">
              <td style="padding:10px 8px;">10/16 〜 10/31</td>
              <td style="text-align:center;">5:00〜</td>
              <td style="text-align:center;">8:00〜17:00</td>
            </tr>
            <tr style="border-bottom:1px solid #1f2937;">
              <td style="padding:10px 8px;">11/1 〜 2月末</td>
              <td style="text-align:center;">6:00〜</td>
              <td style="text-align:center;">8:00〜17:00</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style="font-size:12px; color:var(--muted); margin-top:10px;">※最終入園は閉園30分前までです。</p>
    `);
    
    // 2. 外部リンク用カード
    const linkCard = card("🔗 関連リンク", "外部サイトへ移動します。");
    const mapBtn = document.createElement('button');
    mapBtn.className = 'btn';
    mapBtn.innerHTML = '📍 Googleマップで場所を確認';
    mapBtn.onclick = () => window.open('https://maps.app.goo.gl/9zZ1Xw5U1z9Y3jN47', '_blank');
    
    const officialBtn = document.createElement('button');
    officialBtn.className = 'btn';
    officialBtn.style.marginTop = '8px';
    officialBtn.innerHTML = '🌐 兼六園 公式サイト';
    officialBtn.onclick = () => window.open('https://www.pref.ishikawa.jp/siro-niwa/kenrokuen/', '_blank');
    
    linkCard.appendChild(mapBtn);
    linkCard.appendChild(officialBtn);

    wrap.appendChild(timeCard);
    wrap.appendChild(linkCard);
    return wrap;
  }
};

// openViewが認識できるように登録
window.KenrokuenViews = {
  kenrokuen_detail: () => window.Kenrokuen.renderDetail()
};


