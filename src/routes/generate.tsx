import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSession } from "../hooks/useSession";
import { supabase } from "../lib/supabase";
import { useEffect } from "react";
import BookSpinner from "../components/BookSpinner";
import Button from "../components/Button";

export const Route = createFileRoute("/generate")({
  component: GeneratePage,
});

const THEMES = [
  {
    name: "Dragons",
    image:
      "https://fbbjurouxohpzyyypfwx.supabase.co/storage/v1/object/public/theme-images/dragons.png",
  },
  {
    name: "Space",
    image:
      "https://fbbjurouxohpzyyypfwx.supabase.co/storage/v1/object/public/theme-images/space.png",
  },
  {
    name: "Friendship",
    image:
      "https://fbbjurouxohpzyyypfwx.supabase.co/storage/v1/object/public/theme-images/friendship.png",
  },
  {
    name: "Animals",
    image:
      "https://fbbjurouxohpzyyypfwx.supabase.co/storage/v1/object/public/theme-images/animals.png",
  },
  {
    name: "Magic",
    image:
      "https://fbbjurouxohpzyyypfwx.supabase.co/storage/v1/object/public/theme-images/magic.png",
  },
  {
    name: "Ocean",
    image:
      "https://fbbjurouxohpzyyypfwx.supabase.co/storage/v1/object/public/theme-images/ocean.png",
  },
  {
    name: "Dinosaurs",
    image:
      "https://fbbjurouxohpzyyypfwx.supabase.co/storage/v1/object/public/theme-images/dinosaurs.png",
  },
  {
    name: "Superheroes",
    image:
      "https://fbbjurouxohpzyyypfwx.supabase.co/storage/v1/object/public/theme-images/superheroes.png",
  },
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
    if (!sessionLoading && !session) navigate({ to: "/" });
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
        updates.audio_urls = {
          [selectedVoice]: narrateResult.value.data.audioUrl,
        };
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
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-100 mb-2">
          Tell me a story about...
        </h1>
        <p className="text-zinc-500 text-sm">
          Describe an idea or pick a theme below.
        </p>
      </div>

      <div
        className={`bg-zinc-900 border rounded-2xl p-5 mb-6 transition-all ${prompt ? "border-emerald-500 ring-4 ring-emerald-500/10" : "border-zinc-800"}`}
      >
        <textarea
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            setSelectedTheme(null);
          }}
          placeholder="A brave little fox who wants to visit the moon..."
          rows={3}
          className="w-full bg-transparent text-zinc-100 text-lg resize-none focus:outline-none placeholder-zinc-600"
        />
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800">
          <span className="text-xs text-zinc-600">
            Be as detailed or simple as you like
          </span>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="bg-zinc-800 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="JBFqnCBsd6RMkjVDRZzb">🎙 George</option>
            {voiceProfiles.map((v) => (
              <option key={v.id} value={v.voice_id}>
                🎙 {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        {THEMES.map((theme) => (
          <button
            key={theme.name}
            onClick={() => {
              setSelectedTheme(
                selectedTheme === theme.name ? null : theme.name,
              );
              setPrompt("");
            }}
            className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
              selectedTheme === theme.name
                ? "border-emerald-500 ring-4 ring-emerald-500/20"
                : "border-transparent hover:border-zinc-600"
            }`}
          >
            <img
              src={theme.image}
              alt={theme.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <span className="absolute bottom-2.5 left-0 right-0 text-white text-sm font-semibold">
              {theme.name}
            </span>
            {selectedTheme === theme.name && (
              <span className="absolute top-2 right-2 bg-emerald-500 text-zinc-950 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center mb-4">{error}</p>
      )}

      <Button onClick={handleGenerate} disabled={loading} className="w-full">
        ✨ Create Story
      </Button>
    </div>
  );
}
