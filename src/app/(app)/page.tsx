import { DashboardView } from "@/components/DashboardView";
import type { Concert } from "@/lib/concerts";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
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
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-base-content/70">
          A quick look at your spending, fun scores, and best-value shows.
        </p>
      </div>
      <DashboardView concerts={(data ?? []) as Concert[]} />
    </div>
  );
}
