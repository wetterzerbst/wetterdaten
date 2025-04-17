const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../data/live.json');
const outputPath = path.join(__dirname, '../chatgpt_live.html');

if (!fs.existsSync(jsonPath)) {
  console.error('live.json nicht gefunden.');
  process.exit(1);
}

const raw = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(raw);

const m = data.metric || {};
const timeRaw = data.time || new Date().toISOString();
const dt = new Date(timeRaw);
const timeStr = dt.toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }).replace(',', '');
const ort = (data.location && data.location.name) || 'Zerbst-Dorfstätte';

function val(key, suffix = '', dec = 1) {
  return key in m ? `${m[key].toFixed(dec)}${suffix}` : '--';
}

const lines = [
  `🌤️ Live-Wetter in ${ort}`,
  `Stand: ${timeStr}`,
  '',
  `🌡️ Temperatur: ${val('temperature_c', ' °C')}`,
  `💧 Luftfeuchte: ${val('humidity_percent', ' %', 0)}`,
  `💨 Wind: ${val('wind_kmh', ' km/h')} aus ${Math.round(m.wind_direction_deg || 0)}°`,
  `🌬️ Böen: ${val('wind_gust_kmh', ' km/h')}`,
  `🌫️ Luftdruck: ${val('pressure_hpa', ' hPa')}`,
  `☀️ Solarstrahlung: ${val('solar_wm2', ' W/m²', 0)}`,
  `🌫️ Feinstaub PM2.5: ${val('pm25', ' µg/m³', 0)}`,
  `🌊 Wassertemperatur: ${val('water_temperature_c', ' °C')}`,
  `🌱 Bodentemperatur: ${val('soil_temperature_c', ' °C')}`,
  `💧 Bodenfeuchte: ${val('soil_moisture_percent', ' %', 0)}`,
  `🌿 Blattnässe: ${val('leaf_wetness_percent', ' %', 0)}`,
  '',
  `📡 Quelle: Wetterstation Zerbst-Dorfstätte – https://zerbst.x10.mx`
];

const output = `<pre>\n${lines.join('\n')}\n</pre>\n`;
fs.writeFileSync(outputPath, output, 'utf8');
console.log('✅ chatgpt_live.html erfolgreich generiert.');
