"use client";
import React, { useState } from "react";
import WeatherGlyph from "./WeatherGlyph";
import { describeWeatherCode, formatTemp } from "../utils/api";
import type { DailyPoint, TempUnit } from "../types/weather";

interface DailyLedgerProps {
  daily: DailyPoint[];
  unit: TempUnit;
}

export default function DailyLedger({ daily, unit }: DailyLedgerProps) {
  const [expandedDate, setExpandedDate] = useState<string | null>(daily[0]?.date ?? null);

  if (daily.length === 0) return null;

  const weekMin = Math.min(...daily.map((d) => d.tempMinC));
  const weekMax = Math.max(...daily.map((d) => d.tempMaxC));
  const weekSpan = Math.max(1, weekMax - weekMin);

  return (
    <section className="station-card rounded-xl p-5 sm:p-6 space-y-4" aria-labelledby="daily-heading">
      <div>
        <p className="font-telemetry text-[11px] uppercase tracking-wider m-0" style={{ color: "var(--text-muted)" }}>
          PRAKIRAAN 7 HARI
        </p>
        <h2 id="daily-heading" className="text-lg font-bold m-0 mt-0.5">
          Ringkasan Mingguan
        </h2>
      </div>

      <div className="divide-y" style={{ borderColor: "var(--border)" }}>
        {daily.map((day) => {
          const info = describeWeatherCode(day.weatherCode);
          const isOpen = expandedDate === day.date;
          const leftPct = ((day.tempMinC - weekMin) / weekSpan) * 100;
          const widthPct = Math.max(10, ((day.tempMaxC - day.tempMinC) / weekSpan) * 100);

          return (
            <div key={day.date} style={{ borderColor: "var(--border)" }}>
              <button
                type="button"
                onClick={() => setExpandedDate(isOpen ? null : day.date)}
                aria-expanded={isOpen}
                className="w-full py-3.5 px-2 min-h-[52px] grid grid-cols-[96px_34px_1fr_auto] sm:grid-cols-[120px_38px_130px_1fr_auto] items-center gap-3 text-left rounded-md transition-colors hover:opacity-95"
              >
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {day.dayLabel}
                </span>

                <WeatherGlyph kind={info.glyph} size={26} />

                <span className="hidden sm:inline text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                  {info.label}
                </span>

                {/* Proportional min-max bar */}
                <div className="flex items-center gap-2.5">
                  <span className="font-telemetry text-xs w-8 text-right" style={{ color: "var(--text-muted)" }}>
                    {formatTemp(day.tempMinC, unit)}
                  </span>
                  <div
                    className="flex-1 h-2 rounded-full relative overflow-hidden"
                    style={{ backgroundColor: "var(--bg-elevated)" }}
                  >
                    <div
                      className="h-full rounded-full absolute top-0"
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        backgroundColor: "var(--steel)",
                      }}
                    />
                  </div>
                  <span className="font-telemetry text-xs font-bold w-8" style={{ color: "var(--text-primary)" }}>
                    {formatTemp(day.tempMaxC, unit)}
                  </span>
                </div>

                <span className="font-telemetry text-xs" style={{ color: "var(--steel)" }}>
                  {day.precipProbMax}%
                </span>
              </button>

              {isOpen && (
                <div
                  className="mb-3 mx-2 p-4 rounded-lg border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-ground)" }}
                >
                  <div>
                    <div className="font-telemetry text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>
                      Angin Maks
                    </div>
                    <div className="font-telemetry text-sm font-bold mt-1">{Math.round(day.windMaxKmh)} km/j</div>
                  </div>
                  <div>
                    <div className="font-telemetry text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>
                      Indeks UV Maks
                    </div>
                    <div className="font-telemetry text-sm font-bold mt-1" style={{ color: "var(--solar)" }}>
                      {day.uvMax.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div className="font-telemetry text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>
                      Matahari Terbit
                    </div>
                    <div className="font-telemetry text-sm font-bold mt-1">{day.sunrise || "-"}</div>
                  </div>
                  <div>
                    <div className="font-telemetry text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>
                      Matahari Terbenam
                    </div>
                    <div className="font-telemetry text-sm font-bold mt-1">{day.sunset || "-"}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
