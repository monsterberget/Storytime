import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useSession } from "../hooks/useSession";
import type { Story } from "../types";

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
  }, [session, sessionLoading]);

  useEffect(() => {
    const fetchSaved = async () => {
      if (!session) return;
      const { data, error } = await supabase
        .from("saved_stories")
        .select("story_id, stories(*)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const saved = data.map((d: any) => d.stories).filter(Boolean);
        setStories(saved);
      }
      setLoading(false);
    };

    if (session) fetchSaved();
  }, [session]);

  if (sessionLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-zinc-400">Loading...</p>
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
          <p className="text-zinc-400">Stories you've saved for later.</p>
        </div>
        <button
          onClick={() => navigate({ to: "/generate" })}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
        >
          + Generate
        </button>
      </div>

      {stories.length === 0 ? (
        <p className="text-zinc-500">
          No saved stories yet. Browse stories and save your favorites!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() =>
                navigate({ to: "/story/$id", params: { id: story.id } })
              }
              className="text-left rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 hover:border-zinc-600 transition-colors"
            >
              <h2 className="font-semibold text-zinc-100 mb-2 line-clamp-2">
                {story.title}
              </h2>
              <p className="text-zinc-400 text-sm line-clamp-3">
                {story.sections[0]?.text}
              </p>
              <p className="text-zinc-600 text-xs mt-3">
                {new Date(story.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
