// ==========================
// 新幹線・特急 運行状況リンク集 (shinkansen.js)
// ==========================
window.ShinkansenViews = {
  shinkansen_top() {
    const wrap = document.createElement('div');
    wrap.appendChild(card("鉄道 運行状況一覧", "各社の公式リアルタイム情報へアクセスします。"));

    const grid = document.createElement('div');
    grid.style.display = "grid";
    grid.style.gap = "12px";

    // リンク先のリスト（ここを増やせます）
    const links = [
      { 
        name: "JR西日本 運行情報", 
        info: "北陸新幹線・サンダーバード・しらさぎ", 
        url: "https://trafficinfo.westjr.co.jp/hokuriku.html",
        color: "#0072bc" 
      },
      { 
        name: "JR東日本 運行情報", 
        info: "北陸新幹線（長野・東京方面）", 
        url: "https://traininfo.jreast.co.jp/train_info/shinkansen.aspx",
        color: "#00a968" 
      },
      { 
        name: "IRいしかわ鉄道", 
        info: "県内の在来線", 
        url: "https://www.ishikawa-railway.jp/",
        color: "#00b1ff" 
      }
    ];

    links.forEach(link => {
      const btn = document.createElement('button');
      btn.className = 'link';
      btn.style.textAlign = "left";
      btn.style.width = "100%";
      btn.style.padding = "16px";
      btn.style.borderLeft = `6px solid ${link.color}`;
      
      btn.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong style="color:#ffffff; font-size:1.1rem;">${link.name}</strong>
            <div style="font-size:0.8rem; color:var(--muted);">${link.info}</div>
          </div>
          <span style="font-size:1.2rem;">🌐</span>
        </div>
      `;

      // クリックしたら新しいタブで開く
      btn.onclick = () => window.open(link.url, '_blank');
      grid.appendChild(btn);
    });

    wrap.appendChild(grid);

    // 案内所メモ
    const memo = card("案内用ヒント", "サンダーバードの運休時は、米原経由（しらさぎ）や高速バスの空席状況も確認してください。");
    memo.style.marginTop = "20px";
    wrap.appendChild(memo);

    return wrap;
  }
};