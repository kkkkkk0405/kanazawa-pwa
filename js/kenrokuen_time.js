// js/kenrokuen_time.js ver 1.1.0
window.Kenrokuen = {
  // 共通のデータ取得関数
  async _fetchData() {
    // パスを 'data/spots.json' に統一（404対策）
    const res = await fetch('data/spots.json');
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  },

  // 時間を分に変換するヘルパー
  _toMin(s) {
    return s.split(':').reduce((h, m) => h * 60 + +m);
  },

  // 現在のステータス判定
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
  },

  // 明日の早朝時間を取得
  async getTomorrowEarly() {
    try {
      const data = await this._fetchData();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tMMDD = (tomorrow.getMonth() + 1) * 100 + tomorrow.getDate();

      const p = data.periods.find(r => r.start > r.end ? (tMMDD >= r.start || tMMDD <= r.end) : (tMMDD >= r.start && tMMDD <= r.end));
      return p ? p.early[0] : null;
    } catch (e) {
      return null;
    }
  },

  // 今日のチップ描画
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
      </div>`;
    el.style.borderLeft = `3px solid ${info.color}`;
  },

  // 明日のチップ描画
  async renderTomorrowChip(targetId) {
    const el = document.querySelector(targetId);
    if (!el) return;
    const startTime = await this.getTomorrowEarly();
    el.innerHTML = `<span>🌅 明日早朝: ${startTime || '--:--'}〜</span>`;
    el.style.borderLeft = `3px solid #4caf50`;
  }
};