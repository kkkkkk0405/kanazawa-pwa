// ==========================
// お天気情報モジュール (weather.js)
// ==========================
window.WeatherProvider = {
  async updateWeather() {
    const el = document.getElementById('weatherInfo');
    if (!el) return;

    try {
      // 金沢市の緯度・経度(36.56, 136.65)で天気を取得
      const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=36.56&longitude=136.65&current_weather=true&timezone=Asia%2FTokyo");
      const data = await res.json();
      const w = data.current_weather;

      // 天気コードをアイコンに変換
      const icons = {
        0: "☀️ 晴れ", 1: "🌤️ 晴れ", 2: "⛅ 曇り", 3: "☁️ 曇り",
        45: "🌫️ 霧", 48: "🌫️ 霧",
        51: "🌦️ 霧雨", 61: "🌧️ 雨", 80: "🌦️ にわか雨",
        71: "❄️ 雪", 95: "⚡ 雷雨"
      };
      const statusText = icons[w.weathercode] || "❓ 不明";
      
      el.innerHTML = `<span class="icon">📍金沢</span> ${statusText} / ${Math.round(w.temperature)}°C`;
    } catch (e) {
      el.textContent = "⚠️ 天気取得エラー";
    }
  }
};

// 起動時に天気を取得
window.WeatherProvider.updateWeather();
// 15分ごとに更新
setInterval(() => window.WeatherProvider.updateWeather(), 15 * 60 * 1000);