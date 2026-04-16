import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => sub.subscription.unsubscribe();
  }, []);

  const email = session?.user?.email ?? null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Story App</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Sign in to generate and save stories. Guests can browse stories
            later.
          </p>
        </header>

        <main className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
          {!session ? (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-medium">Sign in</h2>
                <p className="text-sm text-zinc-300">
                  Use email/password or Google.
                </p>
              </div>

              {/* Supabase Auth UI renders its own markup; we wrap it in a container */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                <Auth
                  supabaseClient={supabase}
                  appearance={{
                    theme: ThemeSupa,
                    variables: {
                      default: {
                        colors: {
                          brand: "#10b981",
                          brandAccent: "#059669",
                        },
                      },
                    },
                  }}
                  providers={["google"]}
                />
              </div>

              <p className="text-xs text-zinc-400">
                By signing in you can generate stories, save to your library,
                and vote.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-medium">You’re signed in</h2>
                <p className="text-sm text-zinc-300">
                  Signed in as{" "}
                  <span className="font-medium text-zinc-100">{email}</span>
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut();
                  }}
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                >
                  Sign out
                </button>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-sm text-zinc-300">
                  Next: add routes + Stories + Generate (protected).
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="mt-8 text-xs text-zinc-500">
          Local dev: Vite + Supabase Auth + Tailwind.
        </footer>
      </div>
    </div>
  );
}
