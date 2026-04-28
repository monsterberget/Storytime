import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSession } from "../hooks/useSession";
import { supabase } from "../lib/supabase";
import { useEffect } from "react";
import BookSpinner from "../components/BookSpinner";

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
  const [voiceProfiles, setVoiceProfiles] = useState<
    { id: string; name: string; voice_id: string }[]
  >([]);
  const [selectedVoice, setSelectedVoice] = useState<string>(
    "JBFqnCBsd6RMkjVDRZzb",
  );

  const { session, loading: sessionLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVoices = async () => {
      if (!session) return;
      const { data } = await supabase
        .from("voice_profiles")
        .select("id, name, voice_id")
        .eq("user_id", session.user.id);
      if (data && data.length > 0) {
        setVoiceProfiles(data);
        setSelectedVoice(data[0].voice_id);
      }
    };
    fetchVoices();
  }, [session]);

  useEffect(() => {
    if (!sessionLoading && !session) {
      navigate({ to: "/" });
    }
  }, [session, sessionLoading]);

  if (sessionLoading) return null;
  if (loading)
    return (
      <BookSpinner message="Creating your story, illustrations & narration..." />
    );
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
      const { data: storyData, error: fnError } =
        await supabase.functions.invoke("generate-story", {
          body: { prompt: finalPrompt },
        });
      if (fnError) throw fnError;

      const { data: story, error: dbError } = await supabase
        .from("stories")
        .insert({
          user_id: session.user.id,
          title: storyData.title,
          prompt: finalPrompt,
          sections: storyData.sections,
        })
        .select()
        .single();
      if (dbError) throw dbError;

      const fullText = storyData.sections.map((s: any) => s.text).join(" ");

      const [imageResult, narrateResult] = await Promise.allSettled([
        supabase.functions.invoke("generate-images", {
          body: {
            title: storyData.title,
            sections: storyData.sections,
            storyId: story.id,
          },
        }),

        supabase.functions.invoke("narrate-story", {
          body: { text: fullText, voiceId: selectedVoice, storyId: story.id },
        }),
      ]);
      console.log("Narrate result:", narrateResult);

      const updates: any = {};

      if (imageResult.status === "fulfilled" && !imageResult.value.error) {
        const imageUrls = imageResult.value.data.imageUrls;
        updates.sections = storyData.sections.map(
          (section: any, index: number) => ({
            ...section,
            image_url: imageUrls[index],
          }),
        );
      }

      if (narrateResult.status === "fulfilled" && !narrateResult.value.error) {
        updates.audio_url = narrateResult.value.data.audioUrl;
      }

      if (Object.keys(updates).length > 0) {
        await supabase.from("stories").update(updates).eq("id", story.id);
      }

      navigate({ to: "/story/$id", params: { id: story.id } });
    } catch (err: any) {
      console.error("Full error:", err);
      setError(err.message || "Something went wrong. Please try again.");
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

        {voiceProfiles.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Narration voice
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="JBFqnCBsd6RMkjVDRZzb">George (Default)</option>
              {voiceProfiles.map((v) => (
                <option key={v.id} value={v.voice_id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Creating your story..." : "✨ Generate Story"}
        </button>
      </div>
    </div>
  );
}
