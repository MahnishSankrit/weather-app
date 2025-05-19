const apiKey = 'df8a05c526e283832f1dfe63498510cb';
let currentDate = new Date();

function getMockWeatherData(daysInMonth) {
  const types = ["clear", "partly_cloudy", "cloudy", "showers", "rain", "snow", "thunderstorm", "fog"];
  return Array.from({ length: daysInMonth }, () => types[Math.floor(Math.random() * types.length)]);
}

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

function generateCalendar(month, year, weatherData) {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";  // clear previous

  const date = new Date(year, month);
  const monthName = date.toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";

  // Header row with month and year
  const headerRow = document.createElement("tr");
  const headerCell = document.createElement("th");
  headerCell.colSpan = 7;
  headerCell.style.color = "white";
  headerCell.style.padding = "10px 0";
  headerCell.style.fontSize = "1.25rem";
  headerCell.textContent = `${monthName} ${year}`;
  headerRow.appendChild(headerCell);
  table.appendChild(headerRow);

  // Days of the week header
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

  // 6 weeks to cover all days in month and empty slots
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

function changeMonth(offset) {
  currentDate.setMonth(currentDate.getMonth() + offset);
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const mockWeatherData = getMockWeatherData(daysInMonth);
  generateCalendar(currentDate.getMonth(), currentDate.getFullYear(), mockWeatherData);
}

async function fetchWeatherByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.cod !== 200) throw new Error(data.message);
    displayWeather(data);
  } catch (error) {
    alert("Error: " + error.message);
  }
}

async function fetchWeatherByCoordinates(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.cod !== 200) throw new Error(data.message);
    displayWeather(data);
  } catch (error) {
    alert("Error: " + error.message);
  }
}

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

// Event listeners for search and geo button
document.getElementById("searchBtn").addEventListener("click", () => {
  const city = document.getElementById("searchInput").value.trim();
  if (city) fetchWeatherByCity(city);
});

document.getElementById("searchInput").addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    const city = e.target.value.trim();
    if (city) fetchWeatherByCity(city);
  }
});

document.getElementById("geoWeatherBtn").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeatherByCoordinates(latitude, longitude);
      },
      (err) => alert("Geolocation failed: " + err.message)
    );
  } else {
    alert("Geolocation not supported by your browser");
  }
});

// Initial render of calendar with mock weather
const daysInCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
const initialWeatherData = getMockWeatherData(daysInCurrentMonth);
generateCalendar(currentDate.getMonth(), currentDate.getFullYear(), initialWeatherData);
