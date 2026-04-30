import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Story } from "../types";
import Button from "../components/Button";
import { Input } from "../components/input";

export const Route = createFileRoute("/stories")({
  component: StoriesPage,
});

function StoriesPage() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"latest" | "top">("latest");

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .order(filter === "top" ? "likes" : "created_at", { ascending: false });

      if (!error && data) setStories(data);
      setLoading(false);
    };

    fetchStories();
  }, [filter]);

  const filtered = stories.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.sections[0]?.text.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-zinc-400">Loading stories...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Stories</h1>
          <p className="text-zinc-400">
            Browse stories created by the community.
          </p>
        </div>
        <Button onClick={() => navigate({ to: "/generate" })} size="sm">
          + Generate
        </Button>
      </div>

      {/* Search and filter */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Input
          type="text"
          placeholder="Search stories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48"
        />
        <div className="flex rounded-xl border border-zinc-700 overflow-hidden">
          <button
            onClick={() => setFilter("latest")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${filter === "latest" ? "bg-zinc-700 text-zinc-100" : "text-zinc-400 hover:text-zinc-100"}`}
          >
            Latest
          </button>
          <button
            onClick={() => setFilter("top")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${filter === "top" ? "bg-zinc-700 text-zinc-100" : "text-zinc-400 hover:text-zinc-100"}`}
          >
            Top
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-zinc-500">No stories found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((story) => (
            <button
              key={story.id}
              onClick={() =>
                navigate({ to: "/story/$id", params: { id: story.id } })
              }
              className="text-left rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-zinc-600 transition-colors flex flex-col"
            >
              {story.sections[0]?.image_url ? (
                <img
                  src={story.sections[0].image_url}
                  alt={story.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-zinc-800 flex items-center justify-center">
                  <span className="text-4xl">📖</span>
                </div>
              )}
              <div className="p-5 flex flex-col flex-1">
                <h2 className="font-semibold text-zinc-100 mb-2 line-clamp-2">
                  {story.title}
                </h2>
                <p className="text-zinc-400 text-sm line-clamp-3 flex-1">
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
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <span>❤️ {story.likes}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
