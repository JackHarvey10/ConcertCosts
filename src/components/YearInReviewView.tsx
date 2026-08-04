"use client";

import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Share2, Sparkles } from "lucide-react";
import type { Concert } from "@/lib/concerts";
import { buildYearInReview, getAvailableYears } from "@/lib/yearInReview";
import {
  REVIEW_CARD_HEIGHT,
  REVIEW_CARD_WIDTH,
  YearInReviewCard,
} from "@/components/YearInReviewCard";
import { EmptyState } from "@/components/EmptyState";

export function YearInReviewView({ concerts }: { concerts: Concert[] }) {
  const years = useMemo(() => getAvailableYears(concerts), [concerts]);
  const defaultYear = years[0] ?? new Date().getFullYear();
  const [year, setYear] = useState(defaultYear);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => buildYearInReview(concerts, year), [concerts, year]);

  if (concerts.length === 0) {
    return <EmptyState />;
  }

  if (years.length === 0 || !stats) {
    return (
      <div className="card bg-base-100 border border-base-200 shadow-md">
        <div className="card-body gap-3">
          <h2 className="card-title">No shows for this year</h2>
          <p className="text-base-content/70">
            Add a concert dated in {year}, or pick another year that has shows.
          </p>
          {years.length > 0 && (
            <select
              className="select select-bordered w-full max-w-xs"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    );
  }

  async function exportPng(): Promise<string | null> {
    if (!cardRef.current) return null;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      return await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        width: REVIEW_CARD_WIDTH,
        height: REVIEW_CARD_HEIGHT,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the image.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function downloadCard() {
    const dataUrl = await exportPng();
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = `concert-wrapped-${year}.png`;
    link.href = dataUrl;
    link.click();
    setMessage("Image saved — ready to post anywhere you like.");
  }

  async function shareCard() {
    const dataUrl = await exportPng();
    if (!dataUrl) return;

    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `concert-wrapped-${year}.png`, {
        type: "image/png",
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `My ${year} Concert Wrapped`,
          text: `My ${year} concert year in review — from Concert Cost Tracker.`,
        });
        setMessage("Shared!");
        return;
      }
    } catch {
      // Cancelled or unsupported — fall through to download
    }

    const link = document.createElement("a");
    link.download = `concert-wrapped-${year}.png`;
    link.href = dataUrl;
    link.click();
    setMessage("Sharing isn’t available here, so we downloaded the image instead.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Sparkles className="h-6 w-6 text-primary" />
            Year in Review
          </h2>
          <p className="text-base-content/70">
            A shareable Wrapped-style card for your concert year — download or share the image.
          </p>
        </div>
        <label className="form-control w-full max-w-[10rem]">
          <div className="label py-1">
            <span className="label-text font-medium">Year</span>
          </div>
          <select
            className="select select-bordered"
            value={year}
            onChange={(e) => {
              setYear(Number(e.target.value));
              setMessage(null);
              setError(null);
            }}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div className="alert alert-success">
          <span>{message}</span>
        </div>
      )}

      <div className="flex flex-col items-center gap-5 lg:flex-row lg:items-start lg:justify-center lg:gap-10">
        <div className="w-full max-w-[556px] overflow-x-auto rounded-box border border-base-300 bg-base-300/40 p-2 shadow-xl sm:p-4">
          <div className="mx-auto" style={{ width: REVIEW_CARD_WIDTH }}>
            <YearInReviewCard stats={stats} cardRef={cardRef} />
          </div>
        </div>

        <div className="card w-full max-w-md border border-base-200 bg-base-100 shadow-md">
          <div className="card-body gap-4">
            <h3 className="card-title text-lg">Share your year</h3>
            <p className="text-sm text-base-content/70">
              Export a PNG sized for stories and posts. On phones, Share can open your usual
              apps; otherwise Download saves the file.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                className="btn btn-primary flex-1 gap-2"
                disabled={busy}
                onClick={downloadCard}
              >
                {busy ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download PNG
              </button>
              <button
                type="button"
                className="btn btn-outline flex-1 gap-2"
                disabled={busy}
                onClick={shareCard}
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-base-content/60">
              <li>
                {stats.concertCount} shows · {formatMoney(stats.totalSpent)} spent
              </li>
              <li>Avg fun {stats.avgFun.toFixed(1)} / 5</li>
              {stats.topArtist ? <li>Top artist: {stats.topArtist}</li> : null}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}
