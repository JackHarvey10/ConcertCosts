import { ConcertSearchView } from "@/components/ConcertSearchView";
import type { Concert } from "@/lib/concerts";
import { createClient } from "@/lib/supabase/server";

export default async function SearchPage() {
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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Search</h2>
        <p className="text-base-content/70">
          Find shows fast with text search plus year, artist, venue, and cost filters.
        </p>
      </div>
      <ConcertSearchView concerts={(data ?? []) as Concert[]} />
    </div>
  );
}
