// js/spot_manager.js
window.SpotManager = {
  async renderList() {
    const wrap = document.createElement('div');
    const res = await fetch('data/spots.json');
    const data = await res.json();

    data.spots.forEach(spot => {
      // 施設カード
      const item = document.createElement('div');
      item.className = 'link'; // 既存のスタイルを流用
      item.style.display = 'flex';
      item.style.justifyContent = 'between';
      item.style.alignItems = 'center';
      
      item.innerHTML = `
        <div style="flex:1;">
          <div style="font-weight:bold;">${spot.name}</div>
          <div style="font-size:12px; color:var(--muted);">詳細を確認 ❯</div>
        </div>
      `;
      
      item.onclick = () => {
        if(spot.id === 'kenrokuen') openView('kenrokuen_detail');
        else window.open(spot.links.official, '_blank');
      };
      wrap.appendChild(item);
    });
    return wrap;
  }
};