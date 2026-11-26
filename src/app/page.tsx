"use client";
import React, { useEffect, useRef, useState } from "react";
import WeatherGlyph from "../components/WeatherGlyph";
import HourlyStrip from "../components/HourlyStrip";
import DailyLedger from "../components/DailyLedger";
import {
  describeWeatherCode,
  fetchWeatherForLocation,
  formatTemp,
  PRESET_CITIES,
  searchCities,
  windCompass,
} from "../utils/api";
import type { GeoLocation, TempUnit, WeatherBundle } from "../types/weather";

const STORAGE_CITY_KEY = "cekcuaca_last_city_v2";
const STORAGE_THEME_KEY = "cekcuaca_theme";

export default function HomePage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [unit, setUnit] = useState<TempUnit>("C");
  const [selectedLoc, setSelectedLoc] = useState<GeoLocation>(PRESET_CITIES[0]);
  const [weather, setWeather] = useState<WeatherBundle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<GeoLocation[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [geoBusy, setGeoBusy] = useState<boolean>(false);

  const searchWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_THEME_KEY) === "dark" ? "dark" : "light";
      setTheme(savedTheme);
      if (savedTheme === "dark") document.documentElement.setAttribute("data-theme", "dark");
      else document.documentElement.removeAttribute("data-theme");

      const rawCity = localStorage.getItem(STORAGE_CITY_KEY);
      if (rawCity) {
        const parsed = JSON.parse(rawCity) as GeoLocation;
        if (parsed && typeof parsed.latitude === "number" && typeof parsed.longitude === "number") {
          setSelectedLoc(parsed);
        }
      }
    } catch {
      // ignore storage issues
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setErrorMsg("");
      try {
        const bundle = await fetchWeatherForLocation(selectedLoc);
        if (active) setWeather(bundle);
      } catch (err) {
        if (active) {
          setErrorMsg(err instanceof Error ? err.message : "Gagal memuat data cuaca.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [selectedLoc]);

  useEffect(() => {
    const clean = query.trim();
    if (clean.length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const list = await searchCities(clean);
        setSuggestions(list);
        setDropdownOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const selectCity = (loc: GeoLocation) => {
    setSelectedLoc(loc);
    setQuery("");
    setSuggestions([]);
    setDropdownOpen(false);
    try {
      localStorage.setItem(STORAGE_CITY_KEY, JSON.stringify(loc));
    } catch {}
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, next);
    } catch {}
    if (next === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
  };

  const handleUseMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setErrorMsg("Browser tidak mendukung geolokasi otomatis.");
      return;
    }
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoBusy(false);
        selectCity({
          id: "gps-current",
          name: "Lokasi Saat Ini",
          country: `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {
        setGeoBusy(false);
        setErrorMsg("Izin lokasi ditolak. Cari nama kota secara manual di kolom pencarian.");
      },
      { timeout: 8000 }
    );
  };

  const currentInfo = weather ? describeWeatherCode(weather.current.weatherCode) : null;
  const todayDaily = weather?.daily[0] ?? null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="station-header sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 36 36" width="32" height="32" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="34" height="34" rx="8" fill="var(--steel)" />
              <circle cx="15" cy="15" r="5" stroke="var(--steel-text-on)" strokeWidth="2" />
              <path
                d="M15 7v2M7 15h2M10 10l1.4 1.4M13 24.5h10.5a3.5 3.5 0 0 0 .5-6.9A4.8 4.8 0 0 0 15 16.4a3.6 3.6 0 0 0-2 8.1Z"
                stroke="var(--steel-text-on)"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="leading-tight">
              <span className="font-bold text-base tracking-tight block">Cek Cuaca</span>
              <span className="font-telemetry text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Open-Meteo Station
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUnit((u) => (u === "C" ? "F" : "C"))}
              aria-label={`Ubah satuan suhu ke ${unit === "C" ? "Fahrenheit" : "Celsius"}`}
              className="btn-mist font-telemetry text-xs font-bold px-3 min-h-[40px] rounded-md"
            >
              °{unit}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Ganti tema gelap atau terang"
              className="btn-mist min-h-[40px] min-w-[40px] rounded-md inline-flex items-center justify-center"
            >
              {theme === "dark" ? (
                <svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <circle cx="9" cy="9" r="3.6" />
                  <path d="M9 1.6v1.7M9 14.7v1.7M3.8 3.8l1.2 1.2M13 13l1.2 1.2M1.6 9h1.7M14.7 9h1.7M3.8 14.2l1.2-1.2M13 5l1.2-1.2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <path d="M14.5 10.2A6.5 6.5 0 0 1 7.8 3.5a6.6 6.6 0 1 0 6.7 6.7Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* SEARCH & QUICK CITIES */}
        <section className="space-y-3" aria-label="Pencarian lokasi kota">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div ref={searchWrapRef} className="relative flex-1">
              <label htmlFor="citySearchInput" className="sr-only">
                Cari nama kota
              </label>
              <input
                id="citySearchInput"
                type="search"
                value={query}
                onFocus={() => suggestions.length > 0 && setDropdownOpen(true)}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari kota di Indonesia atau dunia (mis. Batam, Bandung, Tokyo)..."
                autoComplete="off"
                className="w-full px-4 min-h-[48px] rounded-lg border text-sm sm:text-base"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-strong)",
                  color: "var(--text-primary)",
                }}
              />

              {dropdownOpen && (
                <div
                  className="absolute left-0 right-0 mt-1.5 rounded-lg border shadow-lg z-30 overflow-hidden"
                  style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-strong)" }}
                  role="listbox"
                >
                  {searching ? (
                    <div className="p-3.5 text-xs font-telemetry" style={{ color: "var(--text-muted)" }}>
                      Mencari koordinat kota...
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="p-3.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      Kota tidak ditemukan. Coba ejaan lain.
                    </div>
                  ) : (
                    suggestions.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => selectCity(loc)}
                        className="w-full px-4 py-3 min-h-[44px] text-left flex items-center justify-between gap-3 border-b last:border-b-0 text-sm transition-colors hover:opacity-90"
                        style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                      >
                        <span className="font-semibold">
                          {loc.name}
                          {loc.admin1 ? `, ${loc.admin1}` : ""}
                        </span>
                        <span className="font-telemetry text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
                          {loc.country}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={geoBusy}
              className="btn-steel px-4 min-h-[48px] rounded-lg text-sm font-semibold whitespace-nowrap"
            >
              {geoBusy ? "Mendeteksi..." : "Lokasi Saya"}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {PRESET_CITIES.map((city) => {
              const active = selectedLoc.name === city.name;
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => selectCity(city)}
                  aria-pressed={active}
                  className="px-3 py-1.5 min-h-[38px] rounded-md text-xs font-semibold border transition-colors"
                  style={
                    active
                      ? {
                          backgroundColor: "var(--steel)",
                          color: "var(--steel-text-on)",
                          borderColor: "var(--steel)",
                        }
                      : {
                          backgroundColor: "var(--bg-surface)",
                          color: "var(--text-secondary)",
                          borderColor: "var(--border)",
                        }
                  }
                >
                  {city.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* ERROR BANNER */}
        {errorMsg && (
          <div
            role="alert"
            className="rounded-lg border p-4 flex flex-wrap items-center justify-between gap-3 text-sm"
            style={{ borderColor: "var(--solar)", backgroundColor: "var(--bg-surface)" }}
          >
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => setSelectedLoc({ ...selectedLoc })}
              className="btn-mist px-3 py-1.5 min-h-[38px] rounded-md text-xs font-semibold"
            >
              Muat Ulang
            </button>
          </div>
        )}

        {/* LOADING OR WEATHER STATION */}
        {loading && !weather ? (
          <div className="space-y-4">
            <p className="font-telemetry text-xs" style={{ color: "var(--text-muted)" }}>
              Mengambil data atmosfer untuk {selectedLoc.name}...
            </p>
            <div className="h-64 rounded-xl border animate-pulse" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }} />
          </div>
        ) : weather && currentInfo ? (
          <>
            {/* HERO CURRENT OBSERVATION */}
            <section className="station-card rounded-xl p-6 sm:p-8 space-y-6" aria-label="Cuaca saat ini">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 font-telemetry text-xs" style={{ color: "var(--text-muted)" }}>
                    <span>
                      {weather.location.latitude.toFixed(2)}°, {weather.location.longitude.toFixed(2)}°
                    </span>
                    <span>·</span>
                    <span>Pembaruan {weather.fetchedAt}</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight m-0">
                    {weather.location.name}
                    {weather.location.country ? (
                      <span className="font-normal text-xl sm:text-2xl ml-2" style={{ color: "var(--text-secondary)" }}>
                        {weather.location.country}
                      </span>
                    ) : null}
                  </h1>

                  <p className="text-base font-medium m-0" style={{ color: "var(--text-secondary)" }}>
                    {currentInfo.label} · Terasa seperti {formatTemp(weather.current.apparentTempC, unit)}
                    {todayDaily
                      ? ` · H ${formatTemp(todayDaily.tempMaxC, unit)} / L ${formatTemp(todayDaily.tempMinC, unit)}`
                      : ""}
                  </p>
                </div>

                <div className="flex items-center gap-5">
                  <WeatherGlyph kind={currentInfo.glyph} size={64} />
                  <div className="font-telemetry text-5xl sm:text-6xl font-bold tracking-tight">
                    {formatTemp(weather.current.tempC, unit)}
                  </div>
                </div>
              </div>

              {/* 4-CELL TELEMETRY BAR */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="rounded-lg border p-3.5" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-ground)" }}>
                  <div className="font-telemetry text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Kelembapan
                  </div>
                  <div className="font-telemetry text-xl font-bold mt-1">{weather.current.humidityPct}%</div>
                </div>

                <div className="rounded-lg border p-3.5" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-ground)" }}>
                  <div className="font-telemetry text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Angin ({windCompass(weather.current.windDirectionDeg)})
                  </div>
                  <div className="font-telemetry text-xl font-bold mt-1">
                    {Math.round(weather.current.windSpeedKmh)} <span className="text-xs font-normal">km/j</span>
                  </div>
                </div>

                <div className="rounded-lg border p-3.5" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-ground)" }}>
                  <div className="font-telemetry text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Tekanan Udara
                  </div>
                  <div className="font-telemetry text-xl font-bold mt-1">
                    {Math.round(weather.current.pressureHpa)} <span className="text-xs font-normal">hPa</span>
                  </div>
                </div>

                <div className="rounded-lg border p-3.5" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-ground)" }}>
                  <div className="font-telemetry text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Indeks UV Maks
                  </div>
                  <div className="font-telemetry text-xl font-bold mt-1" style={{ color: "var(--solar)" }}>
                    {todayDaily ? todayDaily.uvMax.toFixed(1) : "-"}
                  </div>
                </div>
              </div>
            </section>

            {/* 24-HOUR CURVE + STRIP */}
            <HourlyStrip hourly={weather.hourly} unit={unit} />

            {/* 7-DAY FORECAST */}
            <DailyLedger daily={weather.daily} unit={unit} />
          </>
        ) : null}
      </main>

      {/* FOOTER */}
      <footer className="border-t py-6 mt-8" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-surface)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
          <p className="m-0 font-telemetry">Cek Cuaca · Data atmosfer real-time Open-Meteo · Next.js 13 TypeScript</p>
          <a
            href="https://richardosinulingga.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Portofolio Richardo Sinulingga ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
