export type Concert = {
  id: string;
  user_id: string;
  concert_name: string;
  artist: string;
  venue: string;
  city: string;
  state: string;
  concert_date: string;
  distance_from_home: number;
  hours_at_event: number;
  ticket_cost: number;
  ticket_fees: number;
  parking_cost: number;
  food_drink_cost: number;
  merchandise_cost: number;
  lodging_cost: number;
  travel_cost: number;
  other_cost: number;
  fun_rating: number;
  notes: string | null;
  created_at: string;
};

export type ConcertInsert = Omit<Concert, "id" | "created_at">;

export type CostBreakdown = {
  tickets: number;
  fees: number;
  parking: number;
  foodDrink: number;
  merchandise: number;
  lodging: number;
  travel: number;
  other: number;
};

export function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function getTotalCost(concert: Pick<
  Concert,
  | "ticket_cost"
  | "ticket_fees"
  | "parking_cost"
  | "food_drink_cost"
  | "merchandise_cost"
  | "lodging_cost"
  | "travel_cost"
  | "other_cost"
>): number {
  return (
    toNumber(concert.ticket_cost) +
    toNumber(concert.ticket_fees) +
    toNumber(concert.parking_cost) +
    toNumber(concert.food_drink_cost) +
    toNumber(concert.merchandise_cost) +
    toNumber(concert.lodging_cost) +
    toNumber(concert.travel_cost) +
    toNumber(concert.other_cost)
  );
}

export function getCostPerHour(totalCost: number, hoursAtEvent: number): number | null {
  const hours = toNumber(hoursAtEvent);
  if (hours <= 0) return null;
  return totalCost / hours;
}

/** Fun Points per $100 = (fun rating / total cost) * 100 */
export function getFunPointsPer100(funRating: number, totalCost: number): number | null {
  if (totalCost <= 0) return null;
  return (toNumber(funRating) / totalCost) * 100;
}

/**
 * Value score = total cost / fun rating (0–5 in half steps).
 * Lower score = more fun per dollar (better value).
 * Higher score = more dollars per fun point (more overpriced).
 * Returns null when fun rating is 0 (can't divide by zero).
 */
export function getValueScore(totalCost: number, funRating: number): number | null {
  const fun = toNumber(funRating);
  if (fun <= 0) return null;
  return totalCost / fun;
}

export function formatFunRating(funRating: number): string {
  return formatNumber(toNumber(funRating), 1);
}

export function getCostBreakdown(concert: Concert): CostBreakdown {
  return {
    tickets: toNumber(concert.ticket_cost),
    fees: toNumber(concert.ticket_fees),
    parking: toNumber(concert.parking_cost),
    foodDrink: toNumber(concert.food_drink_cost),
    merchandise: toNumber(concert.merchandise_cost),
    lodging: toNumber(concert.lodging_cost),
    travel: toNumber(concert.travel_cost),
    other: toNumber(concert.other_cost),
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number, digits = 2): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
