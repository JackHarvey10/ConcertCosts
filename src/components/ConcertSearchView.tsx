"use client";

import { useMemo, useState } from "react";
import { Filter, Search, X } from "lucide-react";
import { ConcertCard } from "@/components/ConcertCard";
import { EmptyState } from "@/components/EmptyState";
import type { Concert } from "@/lib/concerts";
import {
  COST_RANGES,
  filterConcerts,
  getConcertYears,
  getUniqueArtists,
  getUniqueVenues,
  hasActiveFilters,
  type ConcertFilters,
  type CostRangeId,
  type SearchField,
} from "@/lib/searchConcerts";

const DEFAULT_FILTERS: ConcertFilters = {
  query: "",
  field: "all",
  year: "all",
  artist: "all",
  venue: "all",
  costRange: "any",
};

export function ConcertSearchView({ concerts }: { concerts: Concert[] }) {
  const [filters, setFilters] = useState<ConcertFilters>(DEFAULT_FILTERS);

  const years = useMemo(() => getConcertYears(concerts), [concerts]);
  const artists = useMemo(() => getUniqueArtists(concerts), [concerts]);
  const venues = useMemo(() => getUniqueVenues(concerts), [concerts]);
  const results = useMemo(() => filterConcerts(concerts, filters), [concerts, filters]);
  const active = hasActiveFilters(filters);

  function update<K extends keyof ConcertFilters>(key: K, value: ConcertFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  if (concerts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-5">
      <div className="card border border-base-200 bg-base-100 shadow-md">
        <div className="card-body gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Search & filters</h3>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_10rem]">
            <label className="input input-bordered flex items-center gap-2">
              <Search className="h-4 w-4 shrink-0 opacity-60" />
              <input
                type="search"
                className="grow"
                placeholder="Search concerts, artists, venues, cities…"
                value={filters.query}
                onChange={(e) => update("query", e.target.value)}
                aria-label="Search concerts"
              />
            </label>
            <select
              className="select select-bordered w-full"
              value={filters.field}
              onChange={(e) => update("field", e.target.value as SearchField)}
              aria-label="Search in"
            >
              <option value="all">All fields</option>
              <option value="artist">Artist only</option>
              <option value="venue">Venue only</option>
              <option value="concert">Concert name</option>
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="form-control w-full">
              <div className="label py-1">
                <span className="label-text text-xs font-medium uppercase tracking-wide opacity-70">
                  Year
                </span>
              </div>
              <select
                className="select select-bordered w-full"
                value={filters.year === "all" ? "all" : String(filters.year)}
                onChange={(e) =>
                  update(
                    "year",
                    e.target.value === "all" ? "all" : Number(e.target.value),
                  )
                }
              >
                <option value="all">All years</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-control w-full">
              <div className="label py-1">
                <span className="label-text text-xs font-medium uppercase tracking-wide opacity-70">
                  Artist
                </span>
              </div>
              <select
                className="select select-bordered w-full"
                value={filters.artist}
                onChange={(e) => update("artist", e.target.value)}
              >
                <option value="all">All artists</option>
                {artists.map((artist) => (
                  <option key={artist} value={artist}>
                    {artist}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-control w-full">
              <div className="label py-1">
                <span className="label-text text-xs font-medium uppercase tracking-wide opacity-70">
                  Venue
                </span>
              </div>
              <select
                className="select select-bordered w-full"
                value={filters.venue}
                onChange={(e) => update("venue", e.target.value)}
              >
                <option value="all">All venues</option>
                {venues.map((venue) => (
                  <option key={venue} value={venue}>
                    {venue}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-control w-full">
              <div className="label py-1">
                <span className="label-text text-xs font-medium uppercase tracking-wide opacity-70">
                  Cost range
                </span>
              </div>
              <select
                className="select select-bordered w-full"
                value={filters.costRange}
                onChange={(e) => update("costRange", e.target.value as CostRangeId)}
              >
                {COST_RANGES.map((range) => (
                  <option key={range.id} value={range.id}>
                    {range.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-base-content/70">
              Showing <span className="font-semibold text-base-content">{results.length}</span> of{" "}
              {concerts.length} concert{concerts.length === 1 ? "" : "s"}
            </p>
            {active && (
              <button
                type="button"
                className="btn btn-ghost btn-sm gap-1"
                onClick={() => setFilters(DEFAULT_FILTERS)}
              >
                <X className="h-4 w-4" />
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="card border border-dashed border-base-300 bg-base-100 shadow-sm">
          <div className="card-body items-center text-center py-12">
            <Search className="mb-1 h-8 w-8 text-base-content/40" />
            <h3 className="text-lg font-semibold">No concerts match</h3>
            <p className="max-w-md text-base-content/70">
              Try a different search word, year, artist, venue, or cost range.
            </p>
            {active && (
              <button
                type="button"
                className="btn btn-outline btn-sm mt-2"
                onClick={() => setFilters(DEFAULT_FILTERS)}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {results.map((concert) => (
            <ConcertCard key={concert.id} concert={concert} />
          ))}
        </div>
      )}
    </div>
  );
}
