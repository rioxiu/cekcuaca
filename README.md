# Cek Cuaca - Nordic Meteorological Station

Clean, telemetry-inspired weather station providing real-time atmospheric readings and 7-day meteorological forecasts via Open-Meteo.

- **Live URL**: https://cekcuaca.vercel.app
- **Framework**: Next.js 14.2.35 App Router (TypeScript Strict, Node 22 LTS)
- **API**: Open-Meteo Free Global Weather API (Zero auth token, zero leak risk)
- **Design**: Nordic Meteorological Station (Steel Navy, Ice Mist, Space Mono telemetry)

---

## Features

- **Real-Time Atmospheric Telemetry**: Temperature, relative humidity, wind speed, wind direction, surface pressure, and precipitation probability.
- **24-Hour Diurnal Trend**: Granular hourly forecast chart showing day-and-night temperature curves.
- **7-Day Weather Outlook**: Daily high/low tracking with meteorological status indicators.
- **Dual Geo-Search**: Fast instant search for global cities combined with one-click HTML5 GPS browser geolocation.
- **Privacy & Performance**: No third-party tracking scripts, zero token exposure, and strict type verification.

---

## Tech Stack

- **Runtime**: Node 22 LTS
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript Strict
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Telemetry Fonts**: Space Mono & Plus Jakarta Sans
- **Deployment**: Vercel

---

## Getting Started

```bash
git clone https://github.com/rioxiu/cekcuaca.git
cd cekcuaca
npm install
npm run dev
```

Open `http://localhost:3000` to run the weather dashboard locally.

---

## License

MIT © Richardo Sinulingga
