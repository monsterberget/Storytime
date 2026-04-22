import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useSession } from "../hooks/useSession";
import type { Story } from "../types";

export const Route = createFileRoute("/story/$id")({
  component: StoryPage,
});

function StoryPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [narrating, setNarrating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchStory = async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("Story not found.");
      } else {
        setStory(data);
      }
      setLoading(false);
    };

    fetchStory();
  }, [id]);

  useEffect(() => {
    const checkSaved = async () => {
      if (!session) return;
      const { data } = await supabase
        .from("saved_stories")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("story_id", id)
        .single();
      if (data) setSaved(true);
    };
    checkSaved();
  }, [session, id]);

  const handleSave = async () => {
    if (!session) return navigate({ to: "/" });
    setSaving(true);
    if (saved) {
      await supabase
        .from("saved_stories")
        .delete()
        .eq("user_id", session.user.id)
        .eq("story_id", id);
      setSaved(false);
    } else {
      await supabase
        .from("saved_stories")
        .insert({ user_id: session.user.id, story_id: id });
      setSaved(true);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-zinc-400">Loading story...</p>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-400">{error || "Story not found."}</p>
      </div>
    );
  }

  const handleNarrate = async () => {
    setNarrating(true);
    try {
      const fullText = story.sections.map((s) => s.text).join(" ");
      const { data, error } = await supabase.functions.invoke("narrate-story", {
        body: { text: fullText, voiceId: "n1PvBOwxb8X6m7tahp2h" },
      });
      if (error) throw error;
      const binary = atob(data.audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "audio/mpeg" });
      setAudioUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      console.error(err);
    } finally {
      setNarrating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate({ to: "/stories" })}
        className="text-zinc-400 hover:text-zinc-100 text-sm mb-8 flex items-center gap-2"
      >
        ← Back to stories
      </button>

      <h1 className="text-4xl font-bold tracking-tight mb-2">{story.title}</h1>
      <p className="text-zinc-500 text-sm mb-10">
        {new Date(story.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <div className="space-y-8">
        {story.sections.map((section, index) => (
          <p key={index} className="text-zinc-200 text-lg leading-relaxed">
            {section.text}
          </p>
        ))}
      </div>

      <div className="mt-12 flex gap-3">
        <button
          onClick={() => navigate({ to: "/generate" })}
          className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
        >
          Generate another
        </button>

        <button
          onClick={handleNarrate}
          disabled={narrating}
          className="rounded-xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 hover:border-zinc-500 disabled:opacity-50 transition-colors"
        >
          {narrating ? "Generating narration..." : "🔊 Narrate Story"}
        </button>

        {audioUrl && (
          <audio controls src={audioUrl} className="w-full mt-6" autoPlay />
        )}
        {session && (
          <button
            onClick={handleSave}
            disabled={saving}
            className={`rounded-xl px-6 py-3 text-sm font-semibold border transition-colors disabled:opacity-50 ${
              saved
                ? "border-emerald-500 text-emerald-400 hover:bg-emerald-500/10"
                : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
            }`}
          >
            {saving ? "..." : saved ? "✓ Saved" : "Save to Library"}
          </button>
        )}
      </div>
    </div>
  );
}
