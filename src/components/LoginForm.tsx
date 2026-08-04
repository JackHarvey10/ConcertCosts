"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Music2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeSelector } from "@/components/ThemeSelector";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    if (mode === "login") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push("/");
      router.refresh();
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    setMessage(
      "Account created! If your project asks you to confirm email, check your inbox. Otherwise, switch to Log in and sign in.",
    );
    setMode("login");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-base-200">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/25 via-base-200 to-base-300" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-end">
          <ThemeSelector className="w-44" />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <div className="max-w-xl text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-base-100/80 px-3 py-1 text-sm shadow-sm">
              <Music2 className="h-4 w-4 text-primary" />
              Your nights out, your numbers
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Concert Cost Tracker
            </h1>
            <p className="mt-4 text-lg text-base-content/70 sm:text-xl">
              Log shows, track every dollar, rate the fun, and see which nights gave you the
              best bang for your buck.
            </p>
          </div>

          <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300/60">
            <div className="card-body">
              <h2 className="card-title text-2xl">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-sm text-base-content/60">
                {mode === "login"
                  ? "Log in to see your concerts and dashboard."
                  : "Sign up free — your concert data stays private to you."}
              </p>

              <div className="tabs tabs-boxed mt-2 bg-base-200">
                <button
                  type="button"
                  className={`tab flex-1 ${mode === "login" ? "tab-active" : ""}`}
                  onClick={() => {
                    setMode("login");
                    setError(null);
                    setMessage(null);
                  }}
                >
                  Log in
                </button>
                <button
                  type="button"
                  className={`tab flex-1 ${mode === "signup" ? "tab-active" : ""}`}
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                    setMessage(null);
                  }}
                >
                  Sign up
                </button>
              </div>

              <form onSubmit={onSubmit} className="mt-4 space-y-4">
                <div className="grid grid-cols-[5.5rem_1fr] items-center gap-3">
                  <label htmlFor="email" className="text-sm font-medium text-right">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="input input-bordered w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />

                  <label htmlFor="password" className="text-sm font-medium text-right">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    className="input input-bordered w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                  />
                </div>

                {error && (
                  <div className="alert alert-error text-sm py-2">
                    <span>{error}</span>
                  </div>
                )}
                {message && (
                  <div className="alert alert-info text-sm py-2">
                    <span>{message}</span>
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                  {loading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : mode === "login" ? (
                    "Log in"
                  ) : (
                    "Sign up"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
