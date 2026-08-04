import { ConcertForm } from "@/components/ConcertForm";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AddConcertPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Add Concert</h2>
        <p className="text-base-content/70">
          Save the details, costs, and fun rating for a show you attended.
        </p>
      </div>
      <ConcertForm userId={user.id} />
    </div>
  );
}
