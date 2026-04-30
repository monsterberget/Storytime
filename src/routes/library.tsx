import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useSession } from "../hooks/useSession";
import type { Story } from "../types";
import Button from "../components/Button";
import StoryCard from "../components/StoryCard";

export const Route = createFileRoute("/library")({
  component: LibraryPage,
});

function LibraryPage() {
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useSession();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionLoading && !session) {
      navigate({ to: "/" });
    }
  }, [session, sessionLoading, navigate]);

  useEffect(() => {
    const fetchSaved = async () => {
      if (!session) return;
      const { data, error } = await supabase
        .from("saved_stories")
        .select("story_id, stories(*)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (!error && data) {
        const saved = (data as unknown as { stories: Story | null }[])
          .map((d) => d.stories)
          .filter(Boolean) as Story[];
        setStories(saved);
      }
      setLoading(false);
    };
    if (session) fetchSaved();
  }, [session]);

  if (sessionLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-ink-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            Your Library
          </h1>
          <p className="text-ink-muted">Stories you've saved for later.</p>
        </div>
        <Button onClick={() => navigate({ to: "/generate" })} size="sm">
          + Generate
        </Button>
      </div>
      {stories.length === 0 ? (
        <p className="text-ink-faded">
          No saved stories yet. Browse stories and save your favorites!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
}
