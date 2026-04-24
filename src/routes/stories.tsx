import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Story } from "../types";

export const Route = createFileRoute("/stories")({
  component: StoriesPage,
});

function StoriesPage() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .order("upvotes", { ascending: false });

      if (!error && data) setStories(data);
      setLoading(false);
    };

    fetchStories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-zinc-400">Loading stories...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            Stories of the Week
          </h1>
          <p className="text-zinc-400">
            Browse stories created by the community.
          </p>
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
          No stories yet. Be the first to generate one!
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
              <div className="flex items-center justify-between mt-3">
                <p className="text-zinc-600 text-xs">
                  {new Date(story.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span>👍 {story.upvotes}</span>
                  <span>👎 {story.downvotes}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
