import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSession } from "../hooks/useSession";
import { supabase } from "../lib/supabase";
import { useEffect } from "react";

export const Route = createFileRoute("/generate")({
  component: GeneratePage,
});

const THEMES = [
  "Dragons",
  "Space",
  "Friendship",
  "Animals",
  "Magic",
  "Ocean",
  "Dinosaurs",
  "Superheroes",
];

function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { session, loading: sessionLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionLoading && !session) {
      navigate({ to: "/" });
    }
  }, [session, sessionLoading]);

  if (sessionLoading) return null;
  if (!session) return null;

  const handleGenerate = async () => {
    const finalPrompt = selectedTheme
      ? `A children's story about ${selectedTheme}`
      : prompt;
    if (!finalPrompt.trim()) {
      setError("Please enter a prompt or select a theme.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // AI generation will go here
      console.log("Generating story with prompt:", finalPrompt);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Generate a Story
      </h1>
      <p className="text-zinc-400 mb-8">
        Write a prompt or pick a theme to get started.
      </p>

      <div className="space-y-6">
        {/* Theme picker */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Pick a theme
          </label>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((theme) => (
              <button
                key={theme}
                onClick={() => {
                  setSelectedTheme(selectedTheme === theme ? null : theme);
                  setPrompt("");
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  selectedTheme === theme
                    ? "bg-emerald-500 border-emerald-500 text-zinc-950"
                    : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        {/* Custom prompt */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Or write your own prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setSelectedTheme(null);
            }}
            placeholder="A brave little fox who wants to visit the moon..."
            rows={4}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Generating..." : "Generate Story"}
        </button>
      </div>
    </div>
  );
}
