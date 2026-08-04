"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Concert } from "@/lib/concerts";
import {
  formatCurrency,
  formatFunRating,
  formatNumber,
  getCostBreakdown,
  getCostPerHour,
  getFunPointsPer100,
  getTotalCost,
  getValueScore,
} from "@/lib/concerts";
import { EmptyState } from "@/components/EmptyState";

const PIE_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#ef4444",
  "#84cc16",
];

export function DashboardView({ concerts }: { concerts: Concert[] }) {
  if (concerts.length === 0) {
    return <EmptyState />;
  }

  const enriched = concerts.map((c) => {
    const total = getTotalCost(c);
    return {
      concert: c,
      total,
      costPerHour: getCostPerHour(total, c.hours_at_event),
      funPer100: getFunPointsPer100(c.fun_rating, total),
      valueScore: getValueScore(total, c.fun_rating),
    };
  });

  const totalSpent = enriched.reduce((sum, e) => sum + e.total, 0);
  const avgCost = totalSpent / enriched.length;
  const avgFun =
    enriched.reduce((sum, e) => sum + Number(e.concert.fun_rating), 0) / enriched.length;
  const hoursKnown = enriched.filter((e) => e.costPerHour != null);
  const avgCostPerHour =
    hoursKnown.length > 0
      ? hoursKnown.reduce((sum, e) => sum + (e.costPerHour ?? 0), 0) / hoursKnown.length
      : null;

  const withValueScore = enriched.filter((e) => e.valueScore != null);
  const bestValueShow =
    withValueScore.length > 0
      ? withValueScore.reduce((best, e) =>
          (e.valueScore ?? Infinity) < (best.valueScore ?? Infinity) ? e : best,
        )
      : null;
  const mostOverpricedShow =
    withValueScore.length > 0
      ? withValueScore.reduce((worst, e) =>
          (e.valueScore ?? 0) > (worst.valueScore ?? 0) ? e : worst,
        )
      : null;
  const mostExpensive = enriched.reduce((best, e) => (e.total > best.total ? e : best));
  const highestFun = enriched.reduce((best, e) =>
    Number(e.concert.fun_rating) > Number(best.concert.fun_rating) ? e : best,
  );

  const categoryTotals = concerts.reduce(
    (acc, c) => {
      const b = getCostBreakdown(c);
      acc.Tickets += b.tickets;
      acc.Fees += b.fees;
      acc.Parking += b.parking;
      acc["Food/Drink"] += b.foodDrink;
      acc.Merch += b.merchandise;
      acc.Lodging += b.lodging;
      acc.Travel += b.travel;
      acc.Other += b.other;
      return acc;
    },
    {
      Tickets: 0,
      Fees: 0,
      Parking: 0,
      "Food/Drink": 0,
      Merch: 0,
      Lodging: 0,
      Travel: 0,
      Other: 0,
    },
  );

  const spendingByCategory = Object.entries(categoryTotals)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  const byConcert = enriched
    .slice()
    .sort(
      (a, b) =>
        new Date(a.concert.concert_date).getTime() - new Date(b.concert.concert_date).getTime(),
    )
    .map((e) => ({
      name: shorten(e.concert.concert_name),
      total: Number(e.total.toFixed(2)),
      fun: Number(e.concert.fun_rating),
      funPer100: e.funPer100 == null ? 0 : Number(e.funPer100.toFixed(2)),
      valueScore: e.valueScore == null ? 0 : Number(e.valueScore.toFixed(2)),
    }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total concerts" value={String(concerts.length)} />
        <StatCard label="Total amount spent" value={formatCurrency(totalSpent)} />
        <StatCard label="Average cost per concert" value={formatCurrency(avgCost)} />
        <StatCard label="Average fun rating" value={`${formatNumber(avgFun, 1)} / 5`} />
        <StatCard
          label="Average cost per hour"
          value={avgCostPerHour == null ? "—" : formatCurrency(avgCostPerHour)}
        />
        <StatCard
          label="Best Value Show"
          value={bestValueShow ? bestValueShow.concert.concert_name : "—"}
          hint={
            bestValueShow?.valueScore != null
              ? `${formatCurrency(bestValueShow.valueScore)} per fun point · lowest wins`
              : undefined
          }
        />
        <StatCard
          label="Most Overpriced Show"
          value={mostOverpricedShow ? mostOverpricedShow.concert.concert_name : "—"}
          hint={
            mostOverpricedShow?.valueScore != null
              ? `${formatCurrency(mostOverpricedShow.valueScore)} per fun point · highest cost per fun`
              : undefined
          }
        />
        <StatCard
          label="Most expensive concert"
          value={mostExpensive.concert.concert_name}
          hint={formatCurrency(mostExpensive.total)}
        />
        <StatCard
          label="Highest fun rating"
          value={highestFun.concert.concert_name}
          hint={`${formatFunRating(Number(highestFun.concert.fun_rating))} / 5`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Spending by cost category">
          {spendingByCategory.length === 0 ? (
            <p className="text-sm text-base-content/60">No spending data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={spendingByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {spendingByCategory.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Total cost by concert">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byConcert} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={60} />
              <YAxis tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
              <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} name="Total cost" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fun rating by concert">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byConcert} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={60} />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Bar dataKey="fun" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Fun rating" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Value score by concert (cost ÷ fun)">
          <p className="mb-2 text-xs text-base-content/60">
            Lower bars = better bang for your buck. Higher bars = more overpriced.
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byConcert} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={60} />
              <YAxis tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
              <Bar
                dataKey="valueScore"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
                name="Value score"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fun Points per $100 by concert">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byConcert} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={60} />
              <YAxis />
              <Tooltip
                formatter={(value) => formatNumber(Number(value ?? 0))}
                labelFormatter={(label) => String(label)}
              />
              <Bar
                dataKey="funPer100"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                name="Fun Points / $100"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="stat rounded-box bg-base-100 shadow-md border border-base-200 px-4 py-3">
      <div className="stat-title text-xs uppercase tracking-wide">{label}</div>
      <div className="stat-value text-lg sm:text-xl break-words leading-snug">{value}</div>
      {hint ? <div className="stat-desc">{hint}</div> : null}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card bg-base-100 shadow-md border border-base-200">
      <div className="card-body">
        <h3 className="card-title text-base">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function shorten(name: string, max = 14): string {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}
