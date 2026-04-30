import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useSession } from "../hooks/useSession";
import type { Story, VoiceProfile } from "../types";
import { DEFAULT_VOICE_ID } from "../constants";
import VerticalConsole from "../components/VerticalConsole";

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
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>(DEFAULT_VOICE_ID);
  const audioUrl = story?.audio_urls?.[selectedVoice] ?? null;

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
        const savedImages = (data.sections as { image_url?: string }[])
          .map((s) => s.image_url)
          .filter(Boolean) as string[];
        if (savedImages.length > 0) setImages(savedImages);
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
        setVoiceProfiles(data as VoiceProfile[]);
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
        <p className="text-ink-muted">Loading story...</p>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-danger">{error || "Story not found."}</p>
      </div>
    );
  }

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
    if (!story) return;
    setNarrating(true);
    try {
      const fullText = story.sections.map((s) => s.text).join(" ");
      const { data, error } = await supabase.functions.invoke("narrate-story", {
        body: { text: fullText, voiceId: selectedVoice, storyId: id },
      });
      if (error) throw error;

      const newAudioUrls = {
        ...(story.audio_urls || {}),
        [selectedVoice]: data.audioUrl,
      };
      await supabase
        .from("stories")
        .update({ audio_urls: newAudioUrls })
        .eq("id", id);
      setStory({ ...story, audio_urls: newAudioUrls });
    } catch (err) {
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
        console.error("Error sharing story:", err);
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-32 lg:pb-0">
      <button
        onClick={() => navigate({ to: "/stories" })}
        className="text-ink-muted hover:text-ink-primary text-sm mb-8 flex items-center gap-2"
      >
        ← Back to stories
      </button>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            {story.title}
          </h1>
          <p className="text-ink-faded text-sm mb-10">
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
                <p className="text-ink-secondary text-lg leading-relaxed">
                  {section.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <VerticalConsole
          session={session}
          audioUrl={audioUrl}
          narrating={narrating}
          voiceProfiles={voiceProfiles}
          selectedVoice={selectedVoice}
          onSelectVoice={setSelectedVoice}
          onNarrate={handleNarrate}
          liked={liked}
          likes={likes}
          onLike={handleLike}
          saved={saved}
          saving={saving}
          onSave={handleSave}
          onShare={handleShare}
          isOwner={!!session && story.user_id === session.user.id}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
