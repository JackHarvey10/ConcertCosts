"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";

const THEMES = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
] as const;

const STORAGE_KEY = "concert-cost-theme";

export function ThemeSelector({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<string>("cupcake");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const next = saved && THEMES.includes(saved as (typeof THEMES)[number]) ? saved : "cupcake";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  function onChange(next: string) {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <label className={`form-control w-full max-w-xs ${className}`}>
      <div className="label py-1">
        <span className="label-text flex items-center gap-1.5 text-sm font-medium">
          <Palette className="h-4 w-4" />
          Theme
        </span>
      </div>
      <select
        className="select select-bordered select-sm w-full"
        value={theme}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Choose app theme"
      >
        {THEMES.map((t) => (
          <option key={t} value={t}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>
    </label>
  );
}
