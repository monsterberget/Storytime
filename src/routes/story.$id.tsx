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
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceProfiles, setVoiceProfiles] = useState<
    { id: string; name: string; voice_id: string }[]
  >([]);
  const [selectedVoice, setSelectedVoice] = useState<string>(
    "JBFqnCBsd6RMkjVDRZzb",
  );

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
    const fetchLikes = async () => {
      if (!id) return;
      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("story_id", id);
      setLikes(count || 0);

      if (!session) return;
      const { data } = await supabase
        .from("likes")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("story_id", id)
        .maybeSingle();
      if (data) setLiked(true);
    };
    fetchLikes();
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
  const handleLike = async () => {
    if (!session) return navigate({ to: "/" });
    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("user_id", session.user.id)
        .eq("story_id", id);
      setLiked(false);
      setLikes((l) => l - 1);
    } else {
      await supabase
        .from("likes")
        .insert({ user_id: session.user.id, story_id: id });
      setLiked(true);
      setLikes((l) => l + 1);
    }
  };
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: `Check out this story: ${story.title}`,
          url,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => navigate({ to: "/stories" })}
        className="text-zinc-400 hover:text-zinc-100 text-sm mb-8 flex items-center gap-2"
      >
        ← Back to stories
      </button>

      <div className="flex gap-6 items-start">
        {/* Story content */}
        <div className="flex-1 min-w-0">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            {story.title}
          </h1>
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
        </div>

        {/* Vertical Console */}
        <div className="sticky top-6 w-36 bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 flex flex-col gap-2.5 flex-shrink-0">
          {audioUrl && (
            <audio
              src={audioUrl}
              id="story-audio"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}

          {/* Play/Pause */}
          <button
            onClick={() => {
              const audio = document.getElementById(
                "story-audio",
              ) as HTMLAudioElement;
              if (!audio) return;
              if (audio.paused) audio.play();
              else audio.pause();
            }}
            disabled={!audioUrl}
            className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 px-3 py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>

          {/* Voice picker */}
          {voiceProfiles.length > 0 && (
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full text-xs bg-zinc-800 border-none text-zinc-100 rounded-xl px-2.5 py-2.5 focus:outline-none cursor-pointer"
            >
              <option value="JBFqnCBsd6RMkjVDRZzb">🎙 George</option>
              {voiceProfiles.map((v) => (
                <option key={v.id} value={v.voice_id}>
                  🎙 {v.name}
                </option>
              ))}
            </select>
          )}

          <div className="h-px bg-zinc-800 my-1" />

          {/* Like */}
          {session && (
            <button
              onClick={handleLike}
              className="bg-zinc-800 hover:bg-zinc-700 px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold transition-colors"
            >
              <span>{liked ? "❤️" : "🤍"}</span>
              <span className="text-zinc-300">{likes}</span>
            </button>
          )}

          {/* Save */}
          {session && (
            <button
              onClick={handleSave}
              disabled={saving}
              className={`border px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm transition-colors ${saved ? "border-emerald-500/50 text-emerald-400" : "border-zinc-700 text-zinc-300 hover:border-zinc-500"}`}
            >
              🔖 {saved ? "Saved" : "Save"}
            </button>
          )}

          {/* Share */}
          <button
            onClick={handleShare}
            className="border border-zinc-700 text-zinc-300 hover:border-zinc-500 px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm transition-colors"
          >
            🔗 Share
          </button>

          <div className="h-px bg-zinc-800 my-1" />

          {/* New Story */}
          <button
            onClick={() => navigate({ to: "/generate" })}
            className="border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold transition-colors"
          >
            + New
          </button>

          {/* Delete */}
          {session && story.user_id === session.user.id && (
            <button
              onClick={handleDelete}
              className="border border-red-900 text-red-400 hover:bg-red-500/10 px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm transition-colors"
            >
              - Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
