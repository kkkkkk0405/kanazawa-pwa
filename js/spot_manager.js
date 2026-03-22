// js/spot_manager.js ver 1.6.0
window.SpotManager = {
  selectedSpotId: null,

  async fetchSpots() {
    try {
      const res = await fetch('data/spots.json');
      const data = await res.json();
      return data.spots || [];
    } catch (e) { return []; }
  },

  // 営業中判定などのロジック（表示に必要）
  checkStatus(spot) { /* ...既存のコードと同じ... */ },
  _getTodayHours(spot) { /* ...既存のコードと同じ... */ },

  async renderList() { /* ...既存のコードと同じ... */ },
  async renderDetail() { /* ...既存のコードと同じ... */ }
};

// Viewの紐付けを Developer に変更
window.SpotViews = {
  spot_list: () => window.SpotManager.renderList(),
  spot_detail: () => window.SpotManager.renderDetail(),
  admin: () => window.Developer.renderAdmin() // ここを Developer に！
};