import type { Concert } from "@/lib/concerts";
import { getTotalCost } from "@/lib/concerts";

export type CostRangeId = "any" | "0-50" | "50-100" | "100-250" | "250-500" | "500+";

export type SearchField = "all" | "artist" | "venue" | "concert";

export const COST_RANGES: { id: CostRangeId; label: string; min: number; max: number | null }[] = [
  { id: "any", label: "Any cost", min: 0, max: null },
  { id: "0-50", label: "Under $50", min: 0, max: 50 },
  { id: "50-100", label: "$50 – $100", min: 50, max: 100 },
  { id: "100-250", label: "$100 – $250", min: 100, max: 250 },
  { id: "250-500", label: "$250 – $500", min: 250, max: 500 },
  { id: "500+", label: "$500+", min: 500, max: null },
];

export function getConcertYears(concerts: Concert[]): number[] {
  const years = new Set(
    concerts.map((c) => new Date(`${c.concert_date}T00:00:00`).getFullYear()),
  );
  return Array.from(years)
    .filter((y) => Number.isFinite(y))
    .sort((a, b) => b - a);
}

export function getUniqueArtists(concerts: Concert[]): string[] {
  return uniqueSorted(concerts.map((c) => c.artist.trim()).filter(Boolean));
}

export function getUniqueVenues(concerts: Concert[]): string[] {
  return uniqueSorted(concerts.map((c) => c.venue.trim()).filter(Boolean));
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function matchesText(concert: Concert, query: string, field: SearchField): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystacks: Record<SearchField, string[]> = {
    all: [
      concert.concert_name,
      concert.artist,
      concert.venue,
      concert.city,
      concert.state,
      concert.notes ?? "",
    ],
    artist: [concert.artist],
    venue: [concert.venue],
    concert: [concert.concert_name],
  };

  return haystacks[field].some((value) => value.toLowerCase().includes(q));
}

function matchesCost(concert: Concert, rangeId: CostRangeId): boolean {
  if (rangeId === "any") return true;
  const range = COST_RANGES.find((r) => r.id === rangeId);
  if (!range) return true;
  const total = getTotalCost(concert);
  if (range.id === "500+") return total >= 500;
  if (range.id === "0-50") return total < 50;
  if (range.max == null) return total >= range.min;
  return total >= range.min && total < range.max;
}

export type ConcertFilters = {
  query: string;
  field: SearchField;
  year: number | "all";
  artist: string | "all";
  venue: string | "all";
  costRange: CostRangeId;
};

export function filterConcerts(concerts: Concert[], filters: ConcertFilters): Concert[] {
  return concerts.filter((concert) => {
    if (!matchesText(concert, filters.query, filters.field)) return false;

    if (filters.year !== "all") {
      const y = new Date(`${concert.concert_date}T00:00:00`).getFullYear();
      if (y !== filters.year) return false;
    }

    if (filters.artist !== "all") {
      if (concert.artist.trim().toLowerCase() !== filters.artist.toLowerCase()) return false;
    }

    if (filters.venue !== "all") {
      if (concert.venue.trim().toLowerCase() !== filters.venue.toLowerCase()) return false;
    }

    if (!matchesCost(concert, filters.costRange)) return false;

    return true;
  });
}

export function hasActiveFilters(filters: ConcertFilters): boolean {
  return (
    filters.query.trim() !== "" ||
    filters.field !== "all" ||
    filters.year !== "all" ||
    filters.artist !== "all" ||
    filters.venue !== "all" ||
    filters.costRange !== "any"
  );
}
