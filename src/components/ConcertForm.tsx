"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, getTotalCost } from "@/lib/concerts";

const emptyForm = {
  concert_name: "",
  artist: "",
  venue: "",
  city: "",
  state: "",
  concert_date: "",
  distance_from_home: "",
  hours_at_event: "",
  ticket_cost: "",
  ticket_fees: "",
  parking_cost: "",
  food_drink_cost: "",
  merchandise_cost: "",
  lodging_cost: "",
  travel_cost: "",
  other_cost: "",
  fun_rating: "4",
  notes: "",
};

function money(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function ConcertForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const totalCost = useMemo(
    () =>
      getTotalCost({
        ticket_cost: money(form.ticket_cost),
        ticket_fees: money(form.ticket_fees),
        parking_cost: money(form.parking_cost),
        food_drink_cost: money(form.food_drink_cost),
        merchandise_cost: money(form.merchandise_cost),
        lodging_cost: money(form.lodging_cost),
        travel_cost: money(form.travel_cost),
        other_cost: money(form.other_cost),
      }),
    [form],
  );

  function update(field: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("concerts").insert({
      user_id: userId,
      concert_name: form.concert_name.trim(),
      artist: form.artist.trim(),
      venue: form.venue.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      concert_date: form.concert_date,
      distance_from_home: money(form.distance_from_home),
      hours_at_event: money(form.hours_at_event),
      ticket_cost: money(form.ticket_cost),
      ticket_fees: money(form.ticket_fees),
      parking_cost: money(form.parking_cost),
      food_drink_cost: money(form.food_drink_cost),
      merchandise_cost: money(form.merchandise_cost),
      lodging_cost: money(form.lodging_cost),
      travel_cost: money(form.travel_cost),
      other_cost: money(form.other_cost),
      fun_rating: Number(form.fun_rating),
      notes: form.notes.trim() || null,
    });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setForm(emptyForm);
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {success && (
        <div className="alert alert-success shadow-sm">
          <span>Concert saved! Your dashboard and concert list are updated.</span>
        </div>
      )}
      {error && (
        <div className="alert alert-error shadow-sm">
          <span>{error}</span>
        </div>
      )}

      <section className="card bg-base-100 shadow-md border border-base-200">
        <div className="card-body gap-4">
          <h2 className="card-title text-lg">Concert details</h2>
          <p className="text-sm text-base-content/60 -mt-2">
            Tell us where you went and a little about the night.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Concert name" required>
              <input
                required
                className="input input-bordered w-full"
                value={form.concert_name}
                onChange={(e) => update("concert_name", e.target.value)}
                placeholder="Summer Stadium Tour"
              />
            </Field>
            <Field label="Artist or band" required>
              <input
                required
                className="input input-bordered w-full"
                value={form.artist}
                onChange={(e) => update("artist", e.target.value)}
                placeholder="The Night Owls"
              />
            </Field>
            <Field label="Venue" required>
              <input
                required
                className="input input-bordered w-full"
                value={form.venue}
                onChange={(e) => update("venue", e.target.value)}
                placeholder="Red Rocks Amphitheatre"
              />
            </Field>
            <Field label="City" required>
              <input
                required
                className="input input-bordered w-full"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="Morrison"
              />
            </Field>
            <Field label="State" required>
              <input
                required
                className="input input-bordered w-full"
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
                placeholder="CO"
              />
            </Field>
            <Field label="Concert date" required>
              <input
                required
                type="date"
                className="input input-bordered w-full"
                value={form.concert_date}
                onChange={(e) => update("concert_date", e.target.value)}
              />
            </Field>
            <Field label="Distance from home (miles)" helper="Rough estimate is fine.">
              <input
                type="number"
                min="0"
                step="0.1"
                className="input input-bordered w-full"
                value={form.distance_from_home}
                onChange={(e) => update("distance_from_home", e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field
              label="Hours at the event"
              helper="Used for cost-per-hour on the dashboard."
            >
              <input
                type="number"
                min="0"
                step="0.1"
                className="input input-bordered w-full"
                value={form.hours_at_event}
                onChange={(e) => update("hours_at_event", e.target.value)}
                placeholder="3"
              />
            </Field>
          </div>

          <Field label="Notes" helper="Optional memories, openers, seating, etc.">
            <textarea
              className="textarea textarea-bordered w-full min-h-24"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Best encore ever..."
            />
          </Field>
        </div>
      </section>

      <section className="card bg-base-100 shadow-md border border-base-200">
        <div className="card-body gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="card-title text-lg">Costs</h2>
              <p className="text-sm text-base-content/60">
                Enter each cost. Total updates automatically.
              </p>
            </div>
            <div className="badge badge-primary badge-lg p-4 font-semibold">
              Total: {formatCurrency(totalCost)}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <MoneyField
              label="Ticket cost"
              value={form.ticket_cost}
              onChange={(v) => update("ticket_cost", v)}
            />
            <MoneyField
              label="Ticket fees"
              value={form.ticket_fees}
              onChange={(v) => update("ticket_fees", v)}
            />
            <MoneyField
              label="Parking cost"
              value={form.parking_cost}
              onChange={(v) => update("parking_cost", v)}
            />
            <MoneyField
              label="Food and drink cost"
              value={form.food_drink_cost}
              onChange={(v) => update("food_drink_cost", v)}
            />
            <MoneyField
              label="Merchandise cost"
              value={form.merchandise_cost}
              onChange={(v) => update("merchandise_cost", v)}
            />
            <MoneyField
              label="Hotel or lodging cost"
              value={form.lodging_cost}
              onChange={(v) => update("lodging_cost", v)}
            />
            <MoneyField
              label="Travel or gas cost"
              value={form.travel_cost}
              onChange={(v) => update("travel_cost", v)}
            />
            <MoneyField
              label="Other cost"
              value={form.other_cost}
              onChange={(v) => update("other_cost", v)}
            />
          </div>
        </div>
      </section>

      <section className="card bg-base-100 shadow-md border border-base-200">
        <div className="card-body gap-4">
          <h2 className="card-title text-lg">Fun rating</h2>
          <p className="text-sm text-base-content/60 -mt-2">
            How much fun was it? 1 = Terrible Time, 5 = Best Time Ever. This powers your value
            score (cost ÷ fun).
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={form.fun_rating}
              onChange={(e) => update("fun_rating", e.target.value)}
              className="range range-primary"
            />
            <div className="text-center sm:min-w-28">
              <div className="text-3xl font-bold text-primary">{form.fun_rating}</div>
              <div className="text-xs text-base-content/60">
                {Number(form.fun_rating) <= 1
                  ? "Terrible Time"
                  : Number(form.fun_rating) >= 5
                    ? "Best Time Ever"
                    : Number(form.fun_rating) === 2
                      ? "Meh"
                      : Number(form.fun_rating) === 3
                        ? "Pretty fun"
                        : "Great night"}
              </div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-base-content/50 px-1">
            <span>1 · Terrible Time</span>
            <span>5 · Best Time Ever</span>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setForm(emptyForm);
            setError(null);
            setSuccess(false);
          }}
        >
          Clear form
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            "Save concert"
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  helper,
  required,
}: {
  label: string;
  children: React.ReactNode;
  helper?: string;
  required?: boolean;
}) {
  return (
    <label className="form-control w-full">
      <div className="label py-1">
        <span className="label-text font-medium">
          {label}
          {required ? " *" : ""}
        </span>
      </div>
      {children}
      {helper ? (
        <div className="label py-1">
          <span className="label-text-alt text-base-content/50">{helper}</span>
        </div>
      ) : null}
    </label>
  );
}

function MoneyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <label className="input input-bordered flex items-center gap-2">
        <span className="text-base-content/50">$</span>
        <input
          type="number"
          min="0"
          step="0.01"
          className="grow"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
        />
      </label>
    </Field>
  );
}
