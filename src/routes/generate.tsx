import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSession } from "../hooks/useSession";
import { supabase } from "../lib/supabase";
import { useEffect } from "react";
import BookSpinner from "../components/BookSpinner";
import Button from "../components/Button";
import ThemePicker from "../components/ThemePicker";
import PromptInput from "../components/PromptInput";

export const Route = createFileRoute("/generate")({
  component: GeneratePage,
});

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

      <div className="mb-6">
        <PromptInput
          prompt={prompt}
          onPromptChange={(value) => {
            setPrompt(value);
            setSelectedTheme(null);
          }}
          selectedVoice={selectedVoice}
          onVoiceChange={setSelectedVoice}
          voiceProfiles={voiceProfiles}
        />
      </div>

      <div className="mb-6">
        <ThemePicker
          selected={selectedTheme}
          onSelect={(theme) => {
            setSelectedTheme(theme);
            if (theme) setPrompt("");
          }}
        />
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
