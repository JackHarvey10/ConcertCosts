import { Music2 } from "lucide-react";
import Link from "next/link";

export function EmptyState() {
  return (
    <div className="card border border-dashed border-base-300 bg-base-100 shadow-sm">
      <div className="card-body items-center text-center py-14">
        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Music2 className="h-7 w-7" />
        </div>
        <h2 className="card-title justify-center text-xl">No concerts logged yet</h2>
        <p className="max-w-md text-base-content/70">
          No concerts logged yet. Add your first concert to start seeing your dashboard.
        </p>
        <div className="card-actions mt-2">
          <Link href="/add" className="btn btn-primary">
            Add your first concert
          </Link>
        </div>
      </div>
    </div>
  );
}
