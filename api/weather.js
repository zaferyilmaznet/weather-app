/**
 * API Route: /api/weather
 *
 * Acts as a secure proxy to the OpenWeatherMap API.
 * Prevents exposing the API key in frontend code.
 *
 * 🔑 API Key Handling:
 * - Reads API key from environment variables:
 *    • Local development → .env file (ignored by Git)
 *    • Production (Vercel) → Project Settings → Environment Variables
 *
 * 🔄 How it works:
 * - Accepts either:
 *    • /api/weather?city=London
 *    • /api/weather?lat=51.5072&lon=-0.1276
 * - Automatically selects the appropriate OpenWeatherMap endpoint.
 *
 * ⚠️ Notes:
 * - Do NOT hardcode API key.
 * - Ensure `.env` is ignored by Git.
 */

export default async function handler(req, res) {
  const { city, lat, lon } = req.query;

  // Validate input
  if (!city && (!lat || !lon)) {
    return res.status(400).json({
      error: "Missing required parameter: Provide either city or lat/lon",
    });
  }

  try {
    // Deployment on Vercel.
    // In project settings > Environment Variables, add OWM_API_KEY = your_openweathermap_api_key
    const apiKey = process.env.OWM_API_KEY;

    if (!apiKey) {
      console.error("❌ Missing OWM_API_KEY in environment variables");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Remove the API key log in production
    if (process.env.NODE_ENV !== "production") {
      console.log("API Key loaded:", Boolean(apiKey));
    }

    // Build URL dynamically
    const baseUrl = "https://api.openweathermap.org/data/2.5/weather";
    const query =
      lat && lon ? `lat=${lat}&lon=${lon}` : `q=${encodeURIComponent(city)}`;
    const url = `${baseUrl}?${query}&appid=${apiKey}&units=metric`;

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({
        error: `OpenWeatherMap request failed with status ${response.status}`,
      });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Serverless function error:", err);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
}
