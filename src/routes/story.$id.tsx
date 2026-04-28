import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useSession } from "../hooks/useSession";
import type { Story } from "../types";
import BookSpinner from "../components/BookSpinner";

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
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [voiceProfiles, setVoiceProfiles] = useState<
    { id: string; name: string; voice_id: string }[]
  >([]);
  const [selectedVoice, setSelectedVoice] = useState<string>(
    "JBFqnCBsd6RMkjVDRZzb",
  );
  const [autoNarrated, setAutoNarrated] = useState(false);

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
        const savedImages = data.sections
          .map((s: any) => s.image_url)
          .filter(Boolean) as string[];
        if (savedImages.length > 0) setImages(savedImages);
        if (data.audio_url) setAudioUrl(data.audio_url);
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
        .maybeSingle();
      if (data) setSaved(true);
    };
    checkSaved();
  }, [session, id]);
  useEffect(() => {
    const fetchRatings = async () => {
      if (!id) return;

      const { data: ratingData } = await supabase
        .from("ratings")
        .select("vote")
        .eq("story_id", id);

      if (ratingData) {
        setUpvotes(ratingData.filter((r) => r.vote === "up").length);
        setDownvotes(ratingData.filter((r) => r.vote === "down").length);
      }

      if (!session) return;
      const { data: userRating } = await supabase
        .from("ratings")
        .select("vote")
        .eq("user_id", session.user.id)
        .eq("story_id", id)
        .maybeSingle();
      if (userRating) setUserVote(userRating.vote as "up" | "down");
    };
    fetchRatings();
  }, [session, id]);

  useEffect(() => {
    const fetchVoiceProfiles = async () => {
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
    fetchVoiceProfiles();
  }, [session]);
  useEffect(() => {
    if (story && !autoNarrated && !audioUrl && !narrating) {
      setAutoNarrated(true);
      handleNarrate();
    }
  }, [story, voiceProfiles]);

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

  const handleGenerateImages = async () => {
    setGeneratingImages(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-images",
        {
          body: { title: story.title, sections: story.sections, storyId: id },
        },
      );
      if (error) throw error;

      console.log("Image URLs:", data.imageUrls);
      setImages(data.imageUrls);

      const updatedSections = story.sections.map((section, index) => ({
        ...section,
        image_url: data.imageUrls[index],
      }));
      console.log("Session user ID:", session?.user.id);
      console.log("Story ID:", id);
      console.log("Updated sections:", updatedSections);

      const { error: dbError } = await supabase
        .from("stories")
        .update({ sections: updatedSections })
        .eq("id", id);

      console.log("DB update error:", dbError);

      if (dbError) throw dbError;

      setStory({ ...story, sections: updatedSections });
    } catch (err: any) {
      console.error("Full error:", err);
    } finally {
      setGeneratingImages(false);
    }
  };
  const handleDelete = async () => {
    if (!session || story.user_id !== session.user.id) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this story?",
    );
    if (!confirmed) return;
    await supabase.from("stories").delete().eq("id", id);
    navigate({ to: "/stories" });
  };

  const handleNarrate = async () => {
    setNarrating(true);
    try {
      const fullText = story.sections.map((s) => s.text).join(" ");
      const { data, error } = await supabase.functions.invoke("narrate-story", {
        body: { text: fullText, voiceId: selectedVoice },
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
  const handleVote = async (vote: "up" | "down") => {
    if (!session) return navigate({ to: "/" });

    const isRemoving = userVote === vote;

    if (isRemoving) {
      await supabase
        .from("ratings")
        .delete()
        .eq("user_id", session.user.id)
        .eq("story_id", id);
      setUserVote(null);
      if (vote === "up") setUpvotes((v) => v - 1);
      else setDownvotes((v) => v - 1);
    } else {
      const previousVote = userVote;
      await supabase
        .from("ratings")
        .upsert(
          { user_id: session.user.id, story_id: id, vote },
          { onConflict: "user_id,story_id" },
        );
      setUserVote(vote);
      if (previousVote) {
        if (previousVote === "up") setUpvotes((v) => v - 1);
        else setDownvotes((v) => v - 1);
      }
      if (vote === "up") setUpvotes((v) => v + 1);
      else setDownvotes((v) => v + 1);
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
          <div key={index} className="space-y-4">
            {images[index] && (
              <img
                src={images[index]}
                alt={`Illustration for section ${index + 1}`}
                className="w-full rounded-2xl"
              />
            )}
            <p className="text-zinc-200 text-lg leading-relaxed">
              {section.text}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-12 space-y-4">
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => navigate({ to: "/generate" })}
            className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
          >
            Generate another
          </button>

          {session && voiceProfiles.length > 0 && (
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="JBFqnCBsd6RMkjVDRZzb">George (Default)</option>
              {voiceProfiles.map((v) => (
                <option key={v.id} value={v.voice_id}>
                  {v.name}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={handleGenerateImages}
            disabled={generatingImages}
            className="rounded-xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 hover:border-zinc-500 disabled:opacity-50 transition-colors"
          >
            {generatingImages
              ? "🎨 Generating images..."
              : "🎨 Illustrate Story"}
          </button>
          <button
            onClick={handleNarrate}
            disabled={narrating}
            className="rounded-xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 hover:border-zinc-500 disabled:opacity-50 transition-colors"
          >
            {narrating ? "🔊 Generating narration..." : "🔊 Narrate Story"}
          </button>
          {session && story.user_id === session.user.id && (
            <button
              onClick={handleDelete}
              className="rounded-xl border border-red-800 px-6 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
            >
              🗑 Delete Story
            </button>
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
          {session && (
            <div className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-3">
              <button
                onClick={() => handleVote("up")}
                className={`text-sm font-semibold transition-colors ${userVote === "up" ? "text-emerald-400" : "text-zinc-400 hover:text-emerald-400"}`}
              >
                👍 {upvotes}
              </button>
              <div className="w-px h-4 bg-zinc-700" />
              <button
                onClick={() => handleVote("down")}
                className={`text-sm font-semibold transition-colors ${userVote === "down" ? "text-red-400" : "text-zinc-400 hover:text-red-400"}`}
              >
                👎 {downvotes}
              </button>
            </div>
          )}
        </div>
        {narrating && (
          <div className="mt-6">
            <BookSpinner message="Narrating your story..." />
          </div>
        )}

        {audioUrl && !narrating && (
          <audio controls src={audioUrl} className="w-full" />
        )}
      </div>
    </div>
  );
}
