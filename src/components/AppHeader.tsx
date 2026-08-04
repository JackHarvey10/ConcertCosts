"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Music2, PlusCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeSelector } from "@/components/ThemeSelector";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/add", label: "Add Concert", icon: PlusCircle },
  { href: "/concerts", label: "My Concerts", icon: Music2 },
] as const;

export function AppHeader({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-base-300 bg-base-100/90 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-md">
                <Music2 className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  Concert Cost Tracker
                </h1>
                <p className="text-sm text-base-content/70">
                  Track what you spend, how far you go, and how much fun you had.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-end">
            <ThemeSelector className="sm:w-44" />
            <div className="flex flex-wrap items-center gap-2">
              <div className="badge badge-outline badge-lg max-w-full truncate py-3">
                {email}
              </div>
              <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={logout}>
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </div>
        </div>

        <nav className="tabs tabs-boxed w-full bg-base-200 p-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`tab flex-1 gap-2 ${active ? "tab-active font-semibold" : ""}`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
