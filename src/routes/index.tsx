import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";
import { useSession } from "../hooks/useSession";
import Button from "../components/Button";
import { Input } from "../components/Input";

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
  }, [session, navigate]);

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
      <div className="hidden lg:flex flex-col justify-between p-12 bg-linear-to-br from-emerald-950 to-surface">
        <div>
          <div className="flex items-center gap-2.5 mb-8">
            <span className="text-6xl font-semibold text-ink-primary">
              Storytime
            </span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-ink-primary leading-tight mb-4">
            Bedtime stories,
            <br />
            narrated in <span className="text-brand">your voice.</span>
          </h1>
          <p className="text-ink-muted text-base leading-relaxed mb-10 max-w-md">
            AI-generated stories with illustrations and narration. Clone your
            voice once and let it tell tales every night.
          </p>

          <div className="space-y-4">
            {[
              "Custom stories from a prompt or theme",
              "Pictures for every chapter",
              "Narration in your own cloned voice",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-muted flex items-center justify-center shrink-0 text-brand">
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
                <span className="text-ink-secondary text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <span className="text-2xl">📖</span>
            <span className="text-lg font-semibold text-ink-primary">
              Storytime
            </span>
          </div>

          <h2 className="text-2xl font-semibold text-ink-primary mb-1.5 text-center">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-ink-faded text-sm mb-7 text-center">
            {mode === "signin"
              ? "Sign in to continue."
              : "Sign up to start creating stories."}
          </p>

          <Input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-2.5"
          />
          <Input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
          />

          {error && <p className="text-danger text-xs mb-4">{error}</p>}

          <Button
            onClick={handleEmailAuth}
            disabled={loading}
            className="w-full mb-4"
          >
            {loading
              ? "Loading..."
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </Button>

          <p className="text-center text-ink-faded text-sm">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
              }}
              className="text-brand hover:text-brand-hover"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
