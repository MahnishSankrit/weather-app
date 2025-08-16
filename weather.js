// ✅ Updated API key
const apiKey = 'caebfd7bda53642c0fcb111c6fecc6b4';
let currentDate = new Date();
let lastCoords = null; // store last coords for month navigation

// Fallback random data (only if forecast API fails)
function getMockWeatherData(daysInMonth) {
  const types = ["clear", "partly_cloudy", "cloudy", "showers", "rain", "snow", "thunderstorm", "fog"];
  return Array.from({ length: daysInMonth }, () => types[Math.floor(Math.random() * types.length)]);
}

// Weather condition → Emoji
function getWeatherEmoji(condition) {
  const map = {
    "clear": "☀️",
    "partly_cloudy": "🌤️",
    "cloudy": "🌥️",
    "showers": "🌦️",
    "rain": "🌧️",
    "snow": "🌨️",
    "thunderstorm": "🌩️",
    "fog": "🌫️"
  };
  return map[condition] || "🌤️";
}

// Generate calendar with weather data
function generateCalendar(month, year, weatherData) {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = ""; // clear previous

  const date = new Date(year, month);
  const monthName = date.toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";

  // Header row with month + year
  const headerRow = document.createElement("tr");
  const headerCell = document.createElement("th");
  headerCell.colSpan = 7;
  headerCell.style.color = "white";
  headerCell.style.padding = "10px 0";
  headerCell.style.fontSize = "1.25rem";
  headerCell.textContent = `${monthName} ${year}`;
  headerRow.appendChild(headerCell);
  table.appendChild(headerRow);

  // Days of week header
  const daysRow = document.createElement("tr");
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day => {
    const th = document.createElement("th");
    th.textContent = day;
    th.style.color = "white";
    th.style.padding = "8px";
    daysRow.appendChild(th);
  });
  table.appendChild(daysRow);

  let firstDay = new Date(year, month, 1).getDay();
  let dateCounter = 1;

  // Fill weeks
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < 7; j++) {
      const cell = document.createElement("td");
      cell.style.border = "1px solid #ccc";
      cell.style.padding = "10px";
      cell.style.color = "white";
      cell.style.minWidth = "40px";
      cell.style.height = "60px";
      cell.style.verticalAlign = "top";

      if ((i === 0 && j < firstDay) || dateCounter > daysInMonth) {
        cell.textContent = "";
      } else {
        cell.innerHTML = `${dateCounter} ${getWeatherEmoji(weatherData[dateCounter - 1])}`;
        dateCounter++;
      }
      row.appendChild(cell);
    }
    table.appendChild(row);
  }

  calendar.appendChild(table);
}

// Change calendar month
function changeMonth(offset) {
  currentDate.setMonth(currentDate.getMonth() + offset);
  if (lastCoords) {
    fetchDailyForecastByCoords(lastCoords.lat, lastCoords.lon, 30);
  } else {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    generateCalendar(currentDate.getMonth(), currentDate.getFullYear(), getMockWeatherData(daysInMonth));
  }
}

// 🌍 Geocoding API → get exact coordinates
async function fetchCoordinates(city) {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.length) throw new Error("City not found");
  return { lat: data[0].lat, lon: data[0].lon, name: data[0].name };
}

// 🌤️ Fetch current weather by coordinates
async function fetchWeatherByCoordinates(lat, lon, nameOverride = null) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.cod !== 200) throw new Error(data.message);
    if (nameOverride) data.name = nameOverride;
    displayWeather(data);
  } catch (error) {
    alert("Error: " + error.message);
  }
}

// 📅 Fetch daily forecast by coordinates
async function fetchDailyForecastByCoords(lat, lon, days = 7) {
  const url = `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=${days}&appid=${apiKey}&units=metric`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.cod !== "200") throw new Error(data.message);

    displayDailyForecast(data);
    lastCoords = { lat, lon }; // store for month navigation
  } catch (error) {
    alert("Error fetching forecast: " + error.message);

    // fallback: mock weather
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    generateCalendar(currentDate.getMonth(), currentDate.getFullYear(), getMockWeatherData(daysInMonth));
  }
}

// Convert forecast API data → emoji codes + calendar
function displayDailyForecast(data) {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  const weatherData = data.list.map(day => {
    const main = day.weather[0].main.toLowerCase();
    if (main.includes("clear")) return "clear";
    if (main.includes("cloud")) return "cloudy";
    if (main.includes("rain")) return "rain";
    if (main.includes("snow")) return "snow";
    if (main.includes("thunder")) return "thunderstorm";
    if (main.includes("fog") || main.includes("mist") || main.includes("haze")) return "fog";
    return "partly_cloudy";
  });

  generateCalendar(currentDate.getMonth(), currentDate.getFullYear(), weatherData.slice(0, daysInMonth));
}

// Render current weather info
function displayWeather(data) {
  const weatherBox = document.getElementById("weatherBox");
  if (!weatherBox) {
    console.error("Weather display container not found!");
    return;
  }

  weatherBox.innerHTML = `
    <div class="bg-slate-500 text-white p-4 rounded-lg text-center mb-4">
      <h2 class="text-2xl font-bold">${data.name}</h2>
      <p class="text-lg capitalize">${data.weather[0].description}</p>
    </div>
    <div class="text-center">
      <p class="text-xl">🌡️ ${data.main.temp} °C</p>
      <p>Humidity: ${data.main.humidity}%</p>
      <p>Wind: ${data.wind.speed} m/s</p>
    </div>
  `;
}

// 🎯 Event listeners
document.getElementById("searchBtn").addEventListener("click", async () => {
  const city = document.getElementById("searchInput").value.trim();
  if (city) {
    try {
      const { lat, lon, name } = await fetchCoordinates(city);
      fetchWeatherByCoordinates(lat, lon, name);
      fetchDailyForecastByCoords(lat, lon, 30);
    } catch (err) {
      alert(err.message);
    }
  }
});

document.getElementById("searchInput").addEventListener("keyup", async (e) => {
  if (e.key === "Enter") {
    const city = e.target.value.trim();
    if (city) {
      try {
        const { lat, lon, name } = await fetchCoordinates(city);
        fetchWeatherByCoordinates(lat, lon, name);
        fetchDailyForecastByCoords(lat, lon, 30);
      } catch (err) {
        alert(err.message);
      }
    }
  }
});

document.getElementById("geoWeatherBtn").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeatherByCoordinates(latitude, longitude, "Your Location");
        fetchDailyForecastByCoords(latitude, longitude, 30);
      },
      (err) => alert("Geolocation failed: " + err.message)
    );
  } else {
    alert("Geolocation not supported by your browser");
  }
});

// Initial render (fallback mock weather until user searches)
const daysInCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
generateCalendar(currentDate.getMonth(), currentDate.getFullYear(), getMockWeatherData(daysInCurrentMonth));
