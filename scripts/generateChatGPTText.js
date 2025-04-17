const fs = require('fs');
const fetch = require('node-fetch');

const url_primary = 'https://zerbst.x10.mx/api/wetter/data/live.json';
const url_backup = 'https://raw.githubusercontent.com/wetterzerbst/wetterdaten/main/data/live.json';

async function fetchData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Fehler bei ${url}: ${err.message}`);
    return null;
  }
}

function formatValue(obj, key, suffix = '', decimals = 1) {
  return obj[key] !== undefined ? Number(obj[key]).toFixed(decimals) + suffix : '—';
}

function toBerlinTime(utcString) {
  const d = new Date(utcString);
  const berlin = new Date(d.toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }));
  return berlin.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
}

async function generateHTML() {
  let data = await fetchData(url_primary);
  if (!data) data = await fetchData(url_backup);

  if (!data || !data.metric) {
    console.error("❌ Fehler: Keine gültigen Wetterdaten verfügbar.");
    process.exit(1);
  }

  const m = data.metric;
  const ort = data.location?.name || 'Zerbst-Dorfstätte';
  const time = data.time ? new Date(data.time).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }) : 'unbekannt';

  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Live-Wetter – ${ort}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 2em; background: #f4f4f4; color: #222; }
    .card { background: white; padding: 1.5em; border-radius: 10px; max-width: 480px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    h1 { color: #003366; text-align: center; }
    .label { font-weight: bold; margin-top: 1em; }
    .value { margin-bottom: 0.5em; }
    footer { text-align: center; margin-top: 2em; font-size: 0.9em; color: #666; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🌤️ Live-Wetter – ${ort}</h1>
    <div class="label">🌡️ Temperatur:</div>
    <div class="value">${formatValue(m, 'temperature_c', ' °C')}</div>

    <div class="label">💧 Luftfeuchte:</div>
    <div class="value">${formatValue(m, 'humidity_percent', ' %', 0)}</div>

    <div class="label">💨 Windgeschwindigkeit:</div>
    <div class="value">${formatValue(m, 'wind_kmh', ' km/h', 1)}</div>

    <div class="label">🌬️ Windböen:</div>
    <div class="value">${formatValue(m, 'wind_gust_kmh', ' km/h', 1)}</div>

    <div class="label">🧭 Windrichtung:</div>
    <div class="value">${formatValue(m, 'wind_direction_deg', '°', 0)}</div>

    <div class="label">🌫️ Luftdruck:</div>
    <div class="value">${formatValue(m, 'pressure_hpa', ' hPa', 1)}</div>

    <div class="label">☀️ Solarstrahlung:</div>
    <div class="value">${formatValue(m, 'solar_wm2', ' W/m²', 0)}</div>

    <div class="label">🌫️ Feinstaub PM2.5:</div>
    <div class="value">${formatValue(m, 'pm25', ' µg/m³', 0)}</div>

    <div class="label">🌊 Wassertemperatur:</div>
    <div class="value">${formatValue(m, 'water_temperature_c', ' °C')}</div>

    <div class="label">🌱 Bodentemperatur:</div>
    <div class="value">${formatValue(m, 'soil_temperature_c', ' °C')}</div>

    <div class="label">💧 Bodenfeuchte:</div>
    <div class="value">${formatValue(m, 'soil_moisture_percent', ' %', 0)}</div>

    <div class="label">🌿 Blattnässe:</div>
    <div class="value">${formatValue(m, 'leaf_wetness_percent', ' %', 0)}</div>

    <footer>Letzte Aktualisierung: ${time}</footer>
  </div>
</body>
</html>`;

  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync('data/chatgpt_live.html', html.trim());
  console.log("✅ Datei erstellt: data/chatgpt_live.html");
}

generateHTML();
