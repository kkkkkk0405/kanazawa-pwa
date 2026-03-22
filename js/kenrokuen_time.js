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

  async renderTomorrowChip(targetId) {
    const el = document.querySelector(targetId);
    if (!el) return;
    const startTime = await this.getTomorrowEarly();
    el.innerHTML = `<span>🌅 明日早朝: ${startTime || '--:--'}〜</span>`;
    el.style.borderLeft = `3px solid #81c784`;
  }
};