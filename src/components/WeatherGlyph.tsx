"use client";
import React from "react";
import type { WeatherGlyphKind } from "../types/weather";

interface WeatherGlyphProps {
  kind: WeatherGlyphKind;
  size?: number;
}

export default function WeatherGlyph({ kind, size = 36 }: WeatherGlyphProps) {
  switch (kind) {
    case "clear":
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} fill="none" stroke="var(--solar)" strokeWidth="2" aria-hidden="true">
          <circle cx="16" cy="16" r="6" />
          <path d="M16 4v3M16 25v3M4 16h3M25 16h3M7.5 7.5l2.2 2.2M22.3 22.3l2.2 2.2M24.5 7.5l-2.2 2.2M9.7 22.3l-2.2 2.2" strokeLinecap="round" />
        </svg>
      );
    case "partly":
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} fill="none" strokeWidth="2" aria-hidden="true">
          <circle cx="12.5" cy="12" r="4.2" stroke="var(--solar)" />
          <path d="M12.5 4.5v2M5 12h2M7.2 6.8l1.4 1.4" stroke="var(--solar)" strokeLinecap="round" />
          <path d="M11 24.5h12.5a4.5 4.5 0 0 0 .7-8.9A6 6 0 0 0 12.6 14a4.5 4.5 0 0 0-1.6 10.5Z" stroke="var(--text-primary)" strokeLinejoin="round" />
        </svg>
      );
    case "fog":
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} fill="none" stroke="var(--text-secondary)" strokeWidth="2" aria-hidden="true">
          <path d="M6 12h20M4 17h24M8 22h16" strokeLinecap="round" />
        </svg>
      );
    case "drizzle":
    case "rain":
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} fill="none" strokeWidth="2" aria-hidden="true">
          <path d="M9 19.5h14.5a4.5 4.5 0 0 0 .7-8.9A6.2 6.2 0 0 0 12 9.2a4.8 4.8 0 0 0-3 10.3Z" stroke="var(--text-primary)" strokeLinejoin="round" />
          <path d="M11.5 23.5 10 27M17 23.5 15.5 27M22.5 23.5 21 27" stroke="var(--steel)" strokeLinecap="round" />
        </svg>
      );
    case "storm":
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} fill="none" strokeWidth="2" aria-hidden="true">
          <path d="M9 18.5h14.5a4.5 4.5 0 0 0 .7-8.9A6.2 6.2 0 0 0 12 8.2a4.8 4.8 0 0 0-3 10.3Z" stroke="var(--text-primary)" strokeLinejoin="round" />
          <path d="M17 18.5 13.5 24h4l-1.5 4.5" stroke="var(--solar)" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "snow":
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} fill="none" stroke="var(--steel)" strokeWidth="2" aria-hidden="true">
          <path d="M16 6v20M6 16h20M9 9l14 14M23 9 9 23" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} fill="none" stroke="var(--text-primary)" strokeWidth="2" aria-hidden="true">
          <path d="M8.5 22.5h15a4.8 4.8 0 0 0 .7-9.5A6.5 6.5 0 0 0 11.4 11a5 5 0 0 0-2.9 11.5Z" strokeLinejoin="round" />
        </svg>
      );
  }
}
