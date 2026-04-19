import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../lib/supabase";
import { useEffect } from "react";
import { useSession } from "../hooks/useSession";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate({ to: "/stories" });
    }
  }, [session]);

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Storytime</h1>
        <p className="text-zinc-400">
          AI-generated bedtime stories, narrated in your voice.
        </p>
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
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
    </div>
  );
}
