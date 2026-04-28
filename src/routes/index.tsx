import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";
import { useSession } from "../hooks/useSession";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { session } = useSession();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) navigate({ to: "/stories" });
  }, [session]);

  const handleGoogle = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/stories" },
    });
    if (error) setError(error.message);
  };

  const handleEmailAuth = async () => {
    setError(null);
    setLoading(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setError("Check your email to confirm your account!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.2fr_1fr] -m-6 sm:-m-10">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-linear-to-br from-emerald-950 to-zinc-950">
        <div>
          <div className="flex items-center gap-2.5 mb-8">
            <span className="text-6xl font-semibold text-zinc-100">
              Storytime
            </span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-zinc-100 leading-tight mb-4">
            Bedtime stories,
            <br />
            narrated in <span className="text-emerald-400">your voice.</span>
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed mb-10 max-w-md">
            AI-generated stories with illustrations and narration. Clone your
            voice once and let it tell tales every night.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-400">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-zinc-300 text-sm">
                Custom stories from a prompt or theme
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-400">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-zinc-300 text-sm">
                Pictures for every chapter
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-400">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-zinc-300 text-sm">
                Narration in your own cloned voice
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Auth */}
      <div className="flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <span className="text-2xl">📖</span>
            <span className="text-lg font-semibold text-zinc-100">
              Storytime
            </span>
          </div>

          <h2 className="text-2xl font-semibold text-zinc-100 mb-1.5">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-zinc-500 text-sm mb-7">
            {mode === "signin"
              ? "Sign in to continue."
              : "Sign up to start creating stories."}
          </p>

          <button
            onClick={handleGoogle}
            className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2.5 transition-colors mb-4"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-zinc-600 text-xs">or</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          <input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-xl text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2.5"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-xl text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
          />

          {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

          <button
            onClick={handleEmailAuth}
            disabled={loading}
            className="w-full bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 px-4 py-3 rounded-xl font-medium text-sm transition-colors mb-4"
          >
            {loading
              ? "Loading..."
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </button>

          <p className="text-center text-zinc-500 text-sm">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
              }}
              className="text-emerald-400 hover:text-emerald-300"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
