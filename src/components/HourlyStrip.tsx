"use client";
import React from "react";
import WeatherGlyph from "./WeatherGlyph";
import { describeWeatherCode, formatTemp } from "../utils/api";
import type { HourlyPoint, TempUnit } from "../types/weather";

interface HourlyStripProps {
  hourly: HourlyPoint[];
  unit: TempUnit;
}

export default function HourlyStrip({ hourly, unit }: HourlyStripProps) {
  if (hourly.length === 0) return null;

  const temps = hourly.map((h) => h.tempC);
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const span = Math.max(1, maxT - minT);

  const svgW = 680;
  const svgH = 72;
  const padX = 14;
  const padY = 12;

  const points = hourly
    .map((pt, i) => {
      const x = padX + (i / Math.max(1, hourly.length - 1)) * (svgW - padX * 2);
      const y = svgH - padY - ((pt.tempC - minT) / span) * (svgH - padY * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <section className="station-card rounded-xl p-5 sm:p-6 space-y-5" aria-labelledby="hourly-heading">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-telemetry text-[11px] uppercase tracking-wider m-0" style={{ color: "var(--text-muted)" }}>
            TREN 24 JAM
          </p>
          <h2 id="hourly-heading" className="text-lg font-bold m-0 mt-0.5">
            Prakiraan Per Jam
          </h2>
        </div>
        <span className="font-telemetry text-xs" style={{ color: "var(--text-secondary)" }}>
          Rentang {formatTemp(minT, unit)} / {formatTemp(maxT, unit)}
        </span>
      </div>

      {/* Sparkline curve */}
      <div className="w-full overflow-hidden rounded-lg border px-2 py-2" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-ground)" }}>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-16" role="img" aria-label="Kurva suhu 24 jam ke depan">
          <polyline
            fill="none"
            stroke="var(--steel)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      </div>

      {/* Scrollable hourly strip */}
      <div className="flex gap-2.5 overflow-x-auto pb-2">
        {hourly.slice(0, 16).map((pt) => {
          const info = describeWeatherCode(pt.weatherCode);
          return (
            <div
              key={pt.time}
              className="shrink-0 w-20 rounded-lg border p-3 flex flex-col items-center gap-1.5 text-center"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-ground)" }}
            >
              <span className="font-telemetry text-[11px]" style={{ color: "var(--text-muted)" }}>
                {pt.hourLabel}
              </span>
              <WeatherGlyph kind={info.glyph} size={26} />
              <span className="font-telemetry text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                {formatTemp(pt.tempC, unit)}
              </span>
              <span className="font-telemetry text-[10px]" style={{ color: "var(--steel)" }}>
                {pt.precipProb}%
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
