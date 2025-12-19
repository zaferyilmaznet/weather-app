/**
 * Local Weather App - Frontend Script
 *
 * This file handles UI updates and calls the backend API route (/api/weather).
 *
 * 🔑 API Key Handling:
 * - The OpenWeatherMap API key is NOT stored in this file.
 * - For security, the key is stored in environment variables:
 *    • Local development → .env file (ignored by Git)
 *    • Production (Vercel) → Project Settings → Environment Variables
 * - The frontend fetches data from the proxy endpoint `/api/weather`,
 *   which injects the API key server-side.
 *
 * 💡 Usage:
 * - Update the `city` variable to change the default city.
 * - Run locally with `vercel dev` to load .env.
 * - Deploy via GitHub → Vercel to run in production.
 *
 * 📂 Related files:
 * - /api/weather.js → Proxy function to OpenWeatherMap API
 * - .env (local only, ignored by Git) → contains OWM_API_KEY
 */

let city = "London";
let lat = null;
let lon = null;

// DOM references
const locationDisplay = document.getElementById("location");
const dateDisplay = document.getElementById("date");
const temperatureValue = document.getElementById("temperature");
const conditionText = document.getElementById("condition");
const searchInput = document.querySelector(".search__input");
const searchBtn = document.querySelector(".search__button");
const userGeolocation = document.querySelector(".search__geolocation");

// Event listeners
userGeolocation.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      lat = position.coords.latitude;
      lon = position.coords.longitude;
      getWeatherData(); // refresh with coordinates
    },
    (error) => {
      console.error("Geolocation error:", error);
      alert("Unable to get your location");
    }
  );
});

searchBtn.addEventListener("click", getUserCity);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    getUserCity();
  }
});

// Handlers
function getUserCity() {
  const userValue = searchInput.value.trim();
  if (!userValue) {
    alert("Please enter a valid city name");
    return;
  }

  city = capitalizeWords(userValue);
  getWeatherData(); // refresh UI
}

// Fetch weather data
async function getWeatherData() {
  let OWM_API_URL = "";

  if (!city && (!lat || !lon)) {
    console.warn("No location data available yet");
    return;
  }

  if (lat && lon) {
    OWM_API_URL = `/api/weather?lat=${lat}&lon=${lon}`;
  } else {
    OWM_API_URL = `/api/weather?city=${city}`;
  }

  try {
    locationDisplay.textContent = "Loading...";
    const response = await fetch(OWM_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // UI updates
    // Update location
    locationDisplay.textContent = data.name;

    // Update date - format as "Aug 23, Tue"
    const date = new Date();
    const options = { month: "short", day: "numeric", weekday: "short" };
    dateDisplay.textContent = date.toLocaleString("en-US", options);

    // Update temperature value
    temperatureValue.textContent = `${Math.round(data.main.temp)}°C`;

    // Update condition text
    conditionText.textContent = data.weather[0].description
      .split(" ")
      .map(capitalizeFirstLetter)
      .join(" ");

    // Weather details
    document.getElementById("rain").textContent = `💧 Rain: ${
      data.rain?.["1h"] ? data.rain["1h"] + "mm" : "0 mm"
    }`;
    document.getElementById(
      "feelslike"
    ).textContent = `🌡 Feels like: ${Math.round(data.main.feels_like)}°C`;
    document.getElementById(
      "wind"
    ).textContent = `🌬 Wind: ${data.wind.speed} m/s`;
    document.getElementById(
      "pressure"
    ).textContent = `📊 Pressure: ${data.main.pressure} hPa`;
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    // Set placeholders or display error message
    locationDisplay.textContent = "Error";
    dateDisplay.textContent = "N/A";
    temperatureValue.textContent = "--°C";
  }
}

getWeatherData();

// Helpers
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function capitalizeWords(str) {
  return str
    .split(" ")
    .filter(Boolean) // remove extra spaces
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
