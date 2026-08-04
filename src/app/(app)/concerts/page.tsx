import { ConcertCard } from "@/components/ConcertCard";
import { EmptyState } from "@/components/EmptyState";
import type { Concert } from "@/lib/concerts";
import { createClient } from "@/lib/supabase/server";

export default async function MyConcertsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("concerts")
    .select("*")
    .order("concert_date", { ascending: false });

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Could not load concerts: {error.message}</span>
      </div>
    );
  }

  const concerts = (data ?? []) as Concert[];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">My Concerts</h2>
        <p className="text-base-content/70">
          Everything you&apos;ve logged, newest shows first.
        </p>
      </div>

      {concerts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {concerts.map((concert) => (
            <ConcertCard key={concert.id} concert={concert} />
          ))}
        </div>
      )}
    </div>
  );
}
