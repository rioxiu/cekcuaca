export type TempUnit = "C" | "F";

export type WeatherGlyphKind =
  | "clear"
  | "partly"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "storm"
  | "snow";

export interface GeoLocation {
  id: string;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface HourlyPoint {
  time: string;
  hourLabel: string;
  tempC: number;
  precipProb: number;
  weatherCode: number;
}

export interface DailyPoint {
  date: string;
  dayLabel: string;
  tempMaxC: number;
  tempMinC: number;
  precipProbMax: number;
  windMaxKmh: number;
  uvMax: number;
  weatherCode: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherBundle {
  location: GeoLocation;
  fetchedAt: string;
  current: {
    tempC: number;
    apparentTempC: number;
    humidityPct: number;
    windSpeedKmh: number;
    windDirectionDeg: number;
    pressureHpa: number;
    weatherCode: number;
    isDay: boolean;
  };
  hourly: HourlyPoint[];
  daily: DailyPoint[];
}
