import type {
  DailyPoint,
  GeoLocation,
  HourlyPoint,
  TempUnit,
  WeatherBundle,
  WeatherGlyphKind,
} from "../types/weather";

export const PRESET_CITIES: GeoLocation[] = [
  { id: "batam", name: "Batam", admin1: "Kepulauan Riau", country: "Indonesia", latitude: 1.1301, longitude: 104.0529 },
  { id: "jakarta", name: "Jakarta", admin1: "DKI Jakarta", country: "Indonesia", latitude: -6.2088, longitude: 106.8456 },
  { id: "surabaya", name: "Surabaya", admin1: "Jawa Timur", country: "Indonesia", latitude: -7.2575, longitude: 112.7521 },
  { id: "singapore", name: "Singapura", country: "Singapore", latitude: 1.3521, longitude: 103.8198 },
  { id: "tokyo", name: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503 },
];

export function formatTemp(tempC: number, unit: TempUnit): string {
  const val = unit === "F" ? (tempC * 9) / 5 + 32 : tempC;
  return `${Math.round(val)}°`;
}

export function describeWeatherCode(code: number): { label: string; glyph: WeatherGlyphKind } {
  if (code === 0) return { label: "Cerah", glyph: "clear" };
  if (code === 1 || code === 2) return { label: "Cerah Berawan", glyph: "partly" };
  if (code === 3) return { label: "Berawan", glyph: "cloudy" };
  if (code === 45 || code === 48) return { label: "Berkabut", glyph: "fog" };
  if (code >= 51 && code <= 57) return { label: "Gerimis", glyph: "drizzle" };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { label: "Hujan", glyph: "rain" };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { label: "Salju", glyph: "snow" };
  if (code >= 95) return { label: "Hujan Petir", glyph: "storm" };
  return { label: "Berawan", glyph: "cloudy" };
}

export function windCompass(deg: number): string {
  const dirs = ["U", "TL", "T", "TG", "S", "BD", "B", "BL"];
  const idx = Math.round((((deg % 360) + 360) % 360) / 45) % 8;
  return dirs[idx];
}

export async function searchCities(query: string): Promise<GeoLocation[]> {
  const clean = query.trim();
  if (clean.length < 2) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    clean
  )}&count=6&language=id&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gagal mencari kota (HTTP ${res.status})`);
  const data: {
    results?: Array<{
      id: number;
      name: string;
      admin1?: string;
      country?: string;
      latitude: number;
      longitude: number;
      timezone?: string;
    }>;
  } = await res.json();

  return (data.results ?? []).map((item) => ({
    id: String(item.id),
    name: item.name,
    admin1: item.admin1,
    country: item.country ?? "",
    latitude: item.latitude,
    longitude: item.longitude,
    timezone: item.timezone,
  }));
}

export async function fetchWeatherForLocation(loc: GeoLocation): Promise<WeatherBundle> {
  const params = new URLSearchParams({
    latitude: String(loc.latitude),
    longitude: String(loc.longitude),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m",
    hourly: "temperature_2m,precipitation_probability,weather_code",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max",
    timezone: "auto",
    forecast_days: "7",
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!res.ok) throw new Error(`Gagal mengambil data cuaca (HTTP ${res.status})`);

  const raw: {
    timezone?: string;
    current: {
      time: string;
      temperature_2m: number;
      relative_humidity_2m: number;
      apparent_temperature: number;
      is_day: number;
      weather_code: number;
      surface_pressure: number;
      wind_speed_10m: number;
      wind_direction_10m: number;
    };
    hourly: {
      time: string[];
      temperature_2m: number[];
      precipitation_probability: number[];
      weather_code: number[];
    };
    daily: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      sunrise: string[];
      sunset: string[];
      uv_index_max: number[];
      precipitation_probability_max: number[];
      wind_speed_10m_max: number[];
    };
  } = await res.json();

  const currentHourPrefix = raw.current.time.slice(0, 13);
  const startIdx = Math.max(
    0,
    raw.hourly.time.findIndex((t) => t.startsWith(currentHourPrefix))
  );

  const hourly: HourlyPoint[] = [];
  for (let i = startIdx; i < Math.min(startIdx + 24, raw.hourly.time.length); i += 1) {
    const tStr = raw.hourly.time[i];
    hourly.push({
      time: tStr,
      hourLabel: i === startIdx ? "Kini" : tStr.slice(11, 16),
      tempC: raw.hourly.temperature_2m[i] ?? 0,
      precipProb: raw.hourly.precipitation_probability[i] ?? 0,
      weatherCode: raw.hourly.weather_code[i] ?? 0,
    });
  }

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const daily: DailyPoint[] = raw.daily.time.map((dateStr, idx) => {
    const dt = new Date(`${dateStr}T12:00:00`);
    const label = idx === 0 ? "Hari Ini" : `${dayNames[dt.getDay()]}, ${dateStr.slice(8, 10)}/${dateStr.slice(5, 7)}`;
    return {
      date: dateStr,
      dayLabel: label,
      tempMaxC: raw.daily.temperature_2m_max[idx] ?? 0,
      tempMinC: raw.daily.temperature_2m_min[idx] ?? 0,
      precipProbMax: raw.daily.precipitation_probability_max[idx] ?? 0,
      windMaxKmh: raw.daily.wind_speed_10m_max[idx] ?? 0,
      uvMax: raw.daily.uv_index_max[idx] ?? 0,
      weatherCode: raw.daily.weather_code[idx] ?? 0,
      sunrise: (raw.daily.sunrise[idx] ?? "").slice(11, 16),
      sunset: (raw.daily.sunset[idx] ?? "").slice(11, 16),
    };
  });

  return {
    location: { ...loc, timezone: raw.timezone ?? loc.timezone },
    fetchedAt: raw.current.time.replace("T", " "),
    current: {
      tempC: raw.current.temperature_2m,
      apparentTempC: raw.current.apparent_temperature,
      humidityPct: raw.current.relative_humidity_2m,
      windSpeedKmh: raw.current.wind_speed_10m,
      windDirectionDeg: raw.current.wind_direction_10m,
      pressureHpa: raw.current.surface_pressure,
      weatherCode: raw.current.weather_code,
      isDay: raw.current.is_day === 1,
    },
    hourly,
    daily,
  };
}
