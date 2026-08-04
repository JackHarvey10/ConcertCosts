import type { RefObject } from "react";
import type { YearInReviewStats } from "@/lib/yearInReview";
import {
  formatReviewCurrency,
  formatReviewFun,
  formatReviewHours,
  formatReviewMiles,
} from "@/lib/yearInReview";

/** Fixed story-card size — reliable for html-to-image export */
export const REVIEW_CARD_WIDTH = 540;
export const REVIEW_CARD_HEIGHT = 960;

type Props = {
  stats: YearInReviewStats;
  cardRef: RefObject<HTMLDivElement | null>;
};

export function YearInReviewCard({ stats, cardRef }: Props) {
  return (
    <div
      ref={cardRef}
      style={{
        width: REVIEW_CARD_WIDTH,
        height: REVIEW_CARD_HEIGHT,
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "#f8f5ff",
        background:
          "linear-gradient(160deg, #1a0b2e 0%, #2d1b4e 35%, #0f766e 78%, #134e4a 100%)",
        padding: "40px 36px 32px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -60,
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "rgba(244, 114, 182, 0.28)",
          filter: "blur(2px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: -90,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "rgba(45, 212, 191, 0.22)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 13,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            opacity: 0.85,
            fontWeight: 600,
          }}
        >
          Concert Cost Tracker
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 42,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
          }}
        >
          {stats.year}
          <br />
          Wrapped
        </div>
        <p
          style={{
            marginTop: 14,
            fontSize: 16,
            lineHeight: 1.45,
            opacity: 0.92,
            maxWidth: 420,
          }}
        >
          {stats.headline}
        </p>

        <div
          style={{
            marginTop: 28,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <StatTile label="Shows" value={String(stats.concertCount)} />
          <StatTile label="Spent" value={formatReviewCurrency(stats.totalSpent)} />
          <StatTile label="Miles" value={formatReviewMiles(stats.totalMiles)} />
          <StatTile label="Hours live" value={formatReviewHours(stats.totalHours)} />
        </div>

        <div
          style={{
            marginTop: 14,
            background: "rgba(255,255,255,0.12)",
            borderRadius: 18,
            padding: "16px 18px",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.75, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Average fun
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 4 }}>
            {formatReviewFun(stats.avgFun)}
          </div>
        </div>

        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          {stats.topArtist && (
            <Highlight
              label="Most-seen artist"
              value={
                stats.topArtistCount > 1
                  ? `${stats.topArtist} · ${stats.topArtistCount}x`
                  : stats.topArtist
              }
            />
          )}
          {stats.highestFunShow && (
            <Highlight label="Highest fun night" value={stats.highestFunShow} />
          )}
          {stats.bestValueShow && (
            <Highlight label="Best value show" value={stats.bestValueShow} />
          )}
          {stats.mostExpensiveShow && (
            <Highlight
              label="Biggest spend"
              value={`${stats.mostExpensiveShow} · ${formatReviewCurrency(stats.mostExpensiveAmount)}`}
            />
          )}
          {stats.favoriteCity && (
            <Highlight label="Favorite city" value={stats.favoriteCity} />
          )}
        </div>

        <div
          style={{
            marginTop: "auto",
            paddingTop: 24,
            fontSize: 12,
            opacity: 0.7,
            letterSpacing: "0.04em",
          }}
        >
          My concert year in review · Share your night-out story
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.12)",
        borderRadius: 16,
        padding: "14px 14px 12px",
        border: "1px solid rgba(255,255,255,0.16)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          opacity: 0.72,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 1.15,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Highlight({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.22)",
        borderRadius: 14,
        padding: "10px 14px",
      }}
    >
      <div style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </div>
      <div style={{ marginTop: 2, fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>{value}</div>
    </div>
  );
}
