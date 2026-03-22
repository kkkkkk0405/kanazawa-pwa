// js/kenrokuen_time.js ver 1.0.0
window.Kenrokuen = {
  // 状態を判定するコアロジック
  async getStatus() {
    try {
      const res = await fetch('./data/spots.json');
      const data = await res.json();
      const pList = data.periods;

      const now = new Date();
      const today = (now.getMonth() + 1) * 100 + now.getDate(); // MMDD
      const time = now.getHours() * 60 + now.getMinutes(); // 分単位

      // 期間の判定
      const p = pList.find(r => r.start > r.end ? (today >= r.start || today <= r.end) : (today >= r.start && today <= r.end));
      if (!p) return null;

      const toMin = (s) => s.split(':').reduce((h, m) => h * 60 + +m);
      const eO = toMin(p.early[0]), eC = toMin(p.early[1]);
      const rO = toMin(p.regular[0]), rC = toMin(p.regular[1]);
      const lastEntry = rC - 30; // ★最終入園は閉園30分前

      // ステータス判定
      if (time >= eO && time < eC) return { text: "早朝開園", color: "#4caf50", icon: "🌅", hours: `${p.early[0]}~${p.early[1]}` };
      if (time >= eC && time < rO) return { text: "入替中", color: "#ff9800", icon: "⏳", hours: `通常は${p.regular[0]}~` };
      if (time >= rO && time < rC) {
        if (time >= lastEntry) return { text: "最終入園終了", color: "#f44336", icon: "⚠️", hours: `閉園 ${p.regular[1]}` };
        return { text: "開園中", color: "#4caf50", icon: "🟢", hours: `${p.regular[0]}~${p.regular[1]}` };
      }
      return { text: "閉園中", color: "#666", icon: "🌙", hours: `次は明日 ${p.early[0]}~` };
    } catch (e) {
      return { text: "データエラー", color: "#f44336", icon: "❌" };
    }
    // js/kenrokuen_time.js に追加・修正
window.Kenrokuen = {
  // ...既存の getStatus などの下に追加...

  /**
   * 明日の早朝開園時間を取得する
   */
  async getTomorrowEarly() {
    try {
      const res = await fetch('data/spots.json'); // パスに注意！
      const data = await res.json();
      
      // 「明日」の日付オブジェクトを作成
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1); // 1日足す
      
      const tMMDD = (tomorrow.getMonth() + 1) * 100 + tomorrow.getDate();

      // 明日の日付が含まれる期間を探す
      const p = data.periods.find(r => 
        r.start > r.end ? (tMMDD >= r.start || tMMDD <= r.end) : (tMMDD >= r.start && tMMDD <= r.end)
      );

      return p ? p.early[0] : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  /**
   * 明日のチップを描画する
   */
  async renderTomorrowChip(targetId) {
    const el = document.querySelector(targetId);
    if (!el) return;

    const startTime = await this.getTomorrowEarly();
    if (startTime) {
      el.innerHTML = `<span>🌅 明日早朝: ${startTime}〜</span>`;
      el.style.borderLeft = `3px solid #4caf50`; // 早朝なので緑系
    } else {
      el.innerHTML = `<span>🌅 明日早朝: --:--</span>`;
    }
  }
};
  },

  // チップのHTMLを生成して更新する
  async renderChip(targetId) {
    const el = document.querySelector(targetId);
    if (!el) return;

    const info = await this.getStatus();
    if (!info) return;

    el.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:1.2em;">${info.icon}</span>
        <div>
          <div style="font-weight:bold; font-size:12px;">兼六園: ${info.text}</div>
          <div style="font-size:10px; opacity:0.7;">${info.hours}</div>
        </div>
      </div>
    `;
    el.style.borderLeft = `3px solid ${info.color}`;
  }
};