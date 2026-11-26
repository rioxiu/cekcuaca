import React from "react";
import "./globals.css";

export const metadata = {
  title: "Cek Cuaca | Stasiun Prakiraan Meteorologi",
  description:
    "Prakiraan cuaca real-time per jam dan 7 hari untuk kota di seluruh dunia berbasis Open-Meteo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
