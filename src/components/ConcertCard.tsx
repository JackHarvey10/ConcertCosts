import type { Concert } from "@/lib/concerts";
import {
  formatCurrency,
  formatDate,
  formatFunRating,
  formatNumber,
  getCostBreakdown,
  getCostPerHour,
  getFunPointsPer100,
  getTotalCost,
  getValueScore,
} from "@/lib/concerts";
import { MapPin, Star } from "lucide-react";

export function ConcertCard({ concert }: { concert: Concert }) {
  const total = getTotalCost(concert);
  const costPerHour = getCostPerHour(total, concert.hours_at_event);
  const funPer100 = getFunPointsPer100(concert.fun_rating, total);
  const valueScore = getValueScore(total, concert.fun_rating);
  const breakdown = getCostBreakdown(concert);

  const categories = [
    { label: "Tickets", value: breakdown.tickets },
    { label: "Fees", value: breakdown.fees },
    { label: "Parking", value: breakdown.parking },
    { label: "Food/Drink", value: breakdown.foodDrink },
    { label: "Merch", value: breakdown.merchandise },
    { label: "Lodging", value: breakdown.lodging },
    { label: "Travel", value: breakdown.travel },
    { label: "Other", value: breakdown.other },
  ].filter((c) => c.value > 0);

  return (
    <article className="card bg-base-100 shadow-md border border-base-200">
      <div className="card-body gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="card-title text-xl">{concert.concert_name}</h3>
            <p className="text-base-content/70">{concert.artist}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-base-content/60">
              <MapPin className="h-4 w-4 shrink-0" />
              {concert.venue} · {concert.city}, {concert.state}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-base-content/60">{formatDate(concert.concert_date)}</div>
            <div className="mt-1 text-2xl font-bold text-primary">{formatCurrency(total)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric
            label="Fun rating"
            value={
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {formatFunRating(concert.fun_rating)}/5
              </span>
            }
          />
          <Metric
            label="Cost per hour"
            value={costPerHour == null ? "—" : formatCurrency(costPerHour)}
          />
          <Metric
            label="Value score"
            value={valueScore == null ? "—" : formatCurrency(valueScore)}
          />
          <Metric
            label="Fun Points / $100"
            value={funPer100 == null ? "—" : formatNumber(funPer100)}
          />
        </div>
        <p className="text-xs text-base-content/50 -mt-2">
          Value score = total cost ÷ fun rating. Lower means more bang for your buck.
        </p>

        {categories.length > 0 && (
          <div>
            <div className="mb-2 text-sm font-medium text-base-content/70">Main cost categories</div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <span key={c.label} className="badge badge-outline badge-lg gap-1 py-3">
                  {c.label}: {formatCurrency(c.value)}
                </span>
              ))}
            </div>
          </div>
        )}

        {concert.notes ? (
          <div className="rounded-box bg-base-200/70 p-3 text-sm">
            <div className="mb-1 font-medium">Notes</div>
            <p className="text-base-content/80 whitespace-pre-wrap">{concert.notes}</p>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-box bg-base-200/60 px-3 py-2">
      <div className="text-xs text-base-content/60">{label}</div>
      <div className="mt-0.5 font-semibold">{value}</div>
    </div>
  );
}
