import { YearInReviewView } from "@/components/YearInReviewView";
import type { Concert } from "@/lib/concerts";
import { createClient } from "@/lib/supabase/server";

export default async function SharePage() {
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
      <YearInReviewView concerts={(data ?? []) as Concert[]} />
    </div>
  );
}
