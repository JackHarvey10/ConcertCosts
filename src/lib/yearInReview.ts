import type { Concert } from "@/lib/concerts";
import {
  formatCurrency,
  formatFunRating,
  formatNumber,
  getTotalCost,
  getValueScore,
  toNumber,
} from "@/lib/concerts";

export type YearInReviewStats = {
  year: number;
  concertCount: number;
  totalSpent: number;
  totalMiles: number;
  totalHours: number;
  avgFun: number;
  topArtist: string | null;
  topArtistCount: number;
  favoriteCity: string | null;
  bestValueShow: string | null;
  highestFunShow: string | null;
  mostExpensiveShow: string | null;
  mostExpensiveAmount: number;
  headline: string;
};

export function getAvailableYears(concerts: Concert[]): number[] {
  const years = new Set(
    concerts.map((c) => new Date(`${c.concert_date}T00:00:00`).getFullYear()),
  );
  return Array.from(years)
    .filter((y) => Number.isFinite(y))
    .sort((a, b) => b - a);
}

export function buildYearInReview(
  concerts: Concert[],
  year: number,
): YearInReviewStats | null {
  const yearConcerts = concerts.filter(
    (c) => new Date(`${c.concert_date}T00:00:00`).getFullYear() === year,
  );

  if (yearConcerts.length === 0) return null;

  const enriched = yearConcerts.map((c) => {
    const total = getTotalCost(c);
    return {
      concert: c,
      total,
      valueScore: getValueScore(total, c.fun_rating),
    };
  });

  const totalSpent = enriched.reduce((sum, e) => sum + e.total, 0);
  const totalMiles = yearConcerts.reduce(
    (sum, c) => sum + toNumber(c.distance_from_home),
    0,
  );
  const totalHours = yearConcerts.reduce(
    (sum, c) => sum + toNumber(c.hours_at_event),
    0,
  );
  const avgFun =
    yearConcerts.reduce((sum, c) => sum + toNumber(c.fun_rating), 0) /
    yearConcerts.length;

  const artistCounts = new Map<string, number>();
  for (const c of yearConcerts) {
    const key = c.artist.trim() || "Unknown";
    artistCounts.set(key, (artistCounts.get(key) ?? 0) + 1);
  }
  let topArtist: string | null = null;
  let topArtistCount = 0;
  for (const [artist, count] of artistCounts) {
    if (count > topArtistCount) {
      topArtist = artist;
      topArtistCount = count;
    }
  }

  const cityCounts = new Map<string, number>();
  for (const c of yearConcerts) {
    const key = `${c.city.trim()}, ${c.state.trim()}`;
    cityCounts.set(key, (cityCounts.get(key) ?? 0) + 1);
  }
  let favoriteCity: string | null = null;
  let favoriteCityCount = 0;
  for (const [city, count] of cityCounts) {
    if (count > favoriteCityCount) {
      favoriteCity = city;
      favoriteCityCount = count;
    }
  }

  const withValue = enriched.filter((e) => e.valueScore != null);
  const bestValue =
    withValue.length > 0
      ? withValue.reduce((best, e) =>
          (e.valueScore ?? Infinity) < (best.valueScore ?? Infinity) ? e : best,
        )
      : null;

  const highestFun = enriched.reduce((best, e) =>
    toNumber(e.concert.fun_rating) > toNumber(best.concert.fun_rating) ? e : best,
  );

  const mostExpensive = enriched.reduce((best, e) =>
    e.total > best.total ? e : best,
  );

  return {
    year,
    concertCount: yearConcerts.length,
    totalSpent,
    totalMiles,
    totalHours,
    avgFun,
    topArtist,
    topArtistCount,
    favoriteCity,
    bestValueShow: bestValue?.concert.concert_name ?? null,
    highestFunShow: highestFun.concert.concert_name,
    mostExpensiveShow: mostExpensive.concert.concert_name,
    mostExpensiveAmount: mostExpensive.total,
    headline: buildHeadline(yearConcerts.length, totalSpent, avgFun),
  };
}

function buildHeadline(count: number, spent: number, avgFun: number): string {
  if (avgFun >= 4.5) return "You chased the best nights — and found them.";
  if (count >= 10) return "A full calendar of live music. Legendary year.";
  if (spent >= 2000) return "You invested hard in the live music life.";
  if (avgFun >= 3.5) return "Solid shows. Solid vibes. Solid year.";
  if (count === 1) return "One night. One story. The year starts here.";
  return "Your year, measured in tickets, miles, and memories.";
}

export function formatReviewCurrency(amount: number): string {
  return formatCurrency(amount);
}

export function formatReviewMiles(miles: number): string {
  return `${formatNumber(miles, 0)} mi`;
}

export function formatReviewHours(hours: number): string {
  return `${formatNumber(hours, 1)} hrs`;
}

export function formatReviewFun(avgFun: number): string {
  return `${formatFunRating(avgFun)} / 5`;
}
