window.WeatherProvider = {
  async updateWeather() {
    try {
      const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=36.56&longitude=136.65&current_weather=true&daily=weather_code,temperature_2m_max&timezone=Asia%2FTokyo");
      const data = await res.json();
      
      const icons = {
        0: "☀️ 晴", 1: "🌤️ 晴", 2: "⛅ 曇", 3: "☁️ 曇",
        45: "🌫️ 霧", 51: "🌦️ 霧雨", 61: "🌧️ 雨", 80: "🌦️ 俄雨", 95: "⚡ 雷"
      };

      // 今日
      const now = data.current_weather;
      const todayIcon = icons[now.weathercode] || "❓";
      document.getElementById('weatherToday').innerHTML = `<span>今日: ${todayIcon} ${Math.round(now.temperature)}°C</span>`;

      // 明日
      const tomCode = data.daily.weather_code[1];
      const tomMax = data.daily.temperature_2m_max[1];
      const tomIcon = icons[tomCode] || "❓";
      document.getElementById('weatherTomorrow').innerHTML = `<span>明日: ${tomIcon} ${Math.round(tomMax)}°C</span>`;

    } catch (e) {
      console.error("Weather error", e);
    }
  }
};
window.WeatherProvider.updateWeather();